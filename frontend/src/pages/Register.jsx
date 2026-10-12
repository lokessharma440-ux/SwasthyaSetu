import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Loader2, Edit3, MessageSquare, AlertCircle } from 'lucide-react';
import VoiceButton from '../components/VoiceButton';
import Button from '../components/Button';
import { usePatient } from '../context/PatientContext';
import { useLanguage } from '../context/LanguageContext';
import { createPatient } from '../services/api';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import useSpeechSynthesis from '../hooks/useSpeechSynthesis';
import { extractInformation, validateField } from '../services/conversationEngine';
import { getPrompt } from '../data/conversationPrompts';

const FIELD_ORDER = ['name', 'age', 'gender', 'location', 'phone'];

const Register = () => {
  const navigate = useNavigate();
  const { savePatient } = usePatient();
  const { language, t } = useLanguage();
  
  const { startListening, stopListening, transcript, interimTranscript, isListening, hasSupport: browserSupportsSpeechRecognition } = useSpeechRecognition({ continuous: false, interimResults: true });
  const { speak, stop: stopSpeaking, isSpeaking } = useSpeechSynthesis();
  
  // Safe speak wrapper to strictly enforce mutual exclusion
  const safeSpeak = async (msg) => {
    window.isAppSpeaking = true;
    try {
      stopListening(); // Force mic off
      await speak(msg);
    } finally {
      window.isAppSpeaking = false;
    }
  };
  
  const [step, setStep] = useState('START'); // START, CONVERSATION, SAVING, COMPLETED
  
  const [fields, setFields] = useState({
    name: { value: '', status: 'EMPTY', retries: 0 },
    age: { value: '', status: 'EMPTY', retries: 0 },
    gender: { value: '', status: 'EMPTY', retries: 0 },
    location: { value: '', status: 'EMPTY', retries: 0 },
    phone: { value: '', status: 'EMPTY', retries: 0 }
  });
  const [currentField, setCurrentField] = useState('name');
  
  // App state inside CONVERSATION: 'ASKING', 'CONFIRMING', 'MANUAL_FALLBACK'
  const [appState, setAppState] = useState('ASKING');
  const [voiceState, setVoiceState] = useState('idle');
  
  const [tempValue, setTempValue] = useState('');
  const [systemMessage, setSystemMessage] = useState('');
  const [manualInput, setManualInput] = useState('');
  
  const transcriptRef = useRef('');
  useEffect(() => {
    transcriptRef.current = transcript || interimTranscript || '';
  }, [transcript, interimTranscript]);

  // Clean up any synthesis or listening on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopListening();
    };
  }, []);

  const determineNextStep = useCallback(async (currentFields) => {
    // 1. Are there any EXTRACTED fields that need confirmation?
    for (let f of FIELD_ORDER) {
      if (currentFields[f].status === 'EXTRACTED') {
         setCurrentField(f);
         setTempValue(currentFields[f].value);
         setAppState('CONFIRMING');
         setVoiceState('idle');
         
         const msg = getPrompt(language, `${f}.confirm`, { val: currentFields[f].value });
         setSystemMessage(msg);
         await safeSpeak(msg);
         return;
      }
    }
  
    // 2. Are there any EMPTY fields?
    for (let f of FIELD_ORDER) {
      if (currentFields[f].status === 'EMPTY') {
         setCurrentField(f);
         setAppState('ASKING');
         setVoiceState('idle');
         const msg = getPrompt(language, `${f}.ask`);
         setSystemMessage(msg);
         await safeSpeak(msg);
         return;
      }
    }
    
    // 3. If all confirmed
    saveAndComplete(currentFields);
  }, [language, speak]);

  const handleStartConversation = () => {
    setStep('CONVERSATION');
    determineNextStep(fields);
  };
  
  // Explicit button-based microphone control: toggle ON / STOP
  const handleMicClick = () => {
    if (voiceState === 'processing') return;

    if (voiceState === 'listening' || isListening) {
      // User tapped button to STOP listening
      stopListening();
    } else {
      // User tapped button to START listening
      stopSpeaking(); // Cut off speech synthesis if AI is speaking
      startListening();
    }
  };

  useEffect(() => {
    if (isListening) {
      setVoiceState('listening');
    } else if (voiceState === 'listening') {
       // User clicked stop button or browser stopped on silence
       setVoiceState('processing');
       const capturedText = transcriptRef.current || transcript || interimTranscript || '';
       setTimeout(() => handleTranscript(capturedText), 300);
    }
  }, [isListening]);

  const handleUnclear = async () => {
    let currentRetries = 0;
    setFields(prev => {
      const p = {...prev};
      p[currentField].retries += 1;
      currentRetries = p[currentField].retries;
      return p;
    });
    
    let msgKey = '';
    if (currentRetries + 1 >= 3) { // adding 1 because setFields is async
      setAppState('MANUAL_FALLBACK');
      msgKey = `${currentField}.retry2`;
      setVoiceState('idle');
      const msg = getPrompt(language, msgKey);
      setSystemMessage(msg);
      speak(msg);
    } else {
      msgKey = (currentRetries + 1) === 1 ? `${currentField}.retry1` : `${currentField}.retry2`;
      const msg = getPrompt(language, msgKey);
      setSystemMessage(msg);
      await safeSpeak(msg);
      setVoiceState('idle'); // Wait for user to manually tap button to speak
    }
  };

  const handleTranscript = async (text) => {
    const rawText = (text || transcriptRef.current || transcript || interimTranscript || '').trim();
    if (!rawText) {
      handleUnclear();
      return;
    }

    // Filter AI prompt echo if captured
    let finalTranscript = rawText.toLowerCase();
    let cleanSystemMsg = systemMessage.toLowerCase().replace(/[^\w\s\u0900-\u097F\u0A80-\u0AFF\u0C00-\u0C7F]/g, '').trim();
    
    if (cleanSystemMsg && cleanSystemMsg.length > 2 && finalTranscript.includes(cleanSystemMsg)) {
      finalTranscript = finalTranscript.replace(cleanSystemMsg, '').trim();
    }

    if (finalTranscript.trim() === '') {
      handleUnclear();
      return;
    }
    
    const { extracted } = extractInformation(finalTranscript, currentField);
    
    let updatedFields = { ...fields };
    
    if (extracted.isComplaint && currentField === 'name') {
      const msg = getPrompt(language, 'wrong_field', { field: t('name') });
      setSystemMessage(msg);
      await safeSpeak(msg);
      setVoiceState('idle');
      return;
    }
    
    let foundCurrent = false;
    if (extracted[currentField] && validateField(currentField, extracted[currentField])) {
      foundCurrent = true;
    }
  
    Object.keys(extracted).forEach(key => {
      if (key !== 'isComplaint' && validateField(key, extracted[key]) && updatedFields[key].status === 'EMPTY') {
         if (key !== currentField) {
           updatedFields[key] = { ...updatedFields[key], value: extracted[key], status: 'EXTRACTED' };
         }
      }
    });
    
    setFields(updatedFields);
  
    if (foundCurrent) {
      const val = extracted[currentField];
      setTempValue(val);
      setAppState('CONFIRMING');
      setVoiceState('idle');
      
      const displayVal = currentField === 'gender'
        ? (val === 'Male' ? t('gender_male') : val === 'Female' ? t('gender_female') : val === 'Other' ? t('gender_other') : val)
        : val;
      const msg = getPrompt(language, `${currentField}.confirm`, { val: displayVal });
      setSystemMessage(msg);
      await safeSpeak(msg);
    } else {
      handleUnclear();
    }
  };

  const handleConfirmYes = () => {
    stopSpeaking();
    stopListening();
    const newFields = {
       ...fields,
       [currentField]: { value: tempValue, status: 'CONFIRMED', retries: 0 }
    };
    setFields(newFields);
    setTempValue('');
    determineNextStep(newFields);
  };
  
  const handleConfirmNo = async () => {
    stopSpeaking();
    stopListening();
    setFields(prev => {
       const p = {...prev};
       p[currentField].retries += 1; 
       return p;
    });
    setTempValue('');
    setAppState('ASKING');
    setVoiceState('idle');
    
    const pInfo = fields[currentField];
    const msgKey = (pInfo.retries + 1) >= 2 ? `${currentField}.retry2` : `${currentField}.retry1`;
    const msg = getPrompt(language, msgKey);
    setSystemMessage(msg);
    await safeSpeak(msg);
  };

  const handleManualSubmit = () => {
    if (validateField(currentField, manualInput)) {
      const newFields = {
         ...fields,
         [currentField]: { value: manualInput, status: 'CONFIRMED', retries: 0 }
      };
      setFields(newFields);
      setManualInput('');
      setAppState('ASKING');
      determineNextStep(newFields);
    } else {
      const msg = getPrompt(language, `${currentField}.invalid`);
      setSystemMessage(msg);
      speak(msg);
    }
  };

  const saveAndComplete = async (currentFields) => {
    setStep('SAVING');
    const payload = {
      name: currentFields.name.value,
      age: parseInt(currentFields.age.value, 10),
      gender: currentFields.gender.value,
      location: currentFields.location.value,
      phone: currentFields.phone.value
    };
    
    try {
       const createdPatient = await createPatient(payload);
       savePatient(createdPatient);
       setStep('COMPLETED');
    } catch (err) {
       console.error(err);
       savePatient({...payload, _id: 'local_' + Date.now(), isLocal: true});
       setStep('COMPLETED');
    }
  };

  // Progress UI
  const confirmedCount = Object.values(fields).filter(f => f.status === 'CONFIRMED').length;
  const progressPercent = (confirmedCount / FIELD_ORDER.length) * 100;

  return (
    <div className="flex flex-col h-full w-full max-w-xl mx-auto pb-6">
      {/* Header */}
      {step !== 'COMPLETED' && (
        <div className="flex items-center gap-3 mb-6 px-4 pt-4">
          <button 
            onClick={() => {
              stopSpeaking();
              navigate(-1);
            }}
            className="p-2.5 bg-white rounded-2xl shadow-sm text-slate-700 hover:bg-slate-50 border border-slate-100 active:scale-95 transition-all"
            aria-label={t('back')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">{t('patient_info')}</h2>
            <p className="text-sm text-slate-400 mt-0.5">{t('register_subtitle')}</p>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col px-4">
        {step === 'START' && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center w-full max-w-sm">
              <div className="w-20 h-20 bg-primary-light/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-text mb-4">{t('complete_profile')}</h2>
              <p className="text-lg text-neutral-muted mb-8">
                {t('speak_profile')}
              </p>
              
              <Button size="lg" className="w-full" onClick={handleStartConversation}>
                {t('start')}
              </Button>
              
              {/* Fallback to completely skip voice and go manual if needed */}
              <button 
                onClick={() => {
                  setStep('CONVERSATION');
                  setAppState('MANUAL_FALLBACK');
                  setSystemMessage(getPrompt(language, 'name.ask'));
                }}
                className="mt-6 text-primary hover:underline text-lg font-medium"
              >
                {t('type_manually')}
              </button>
            </div>
          </div>
        )}

        {step === 'CONVERSATION' && (
          <div className="flex flex-col h-full bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-100 h-2 rounded-full mb-8 overflow-hidden">
              <div 
                className="bg-primary h-full transition-all duration-500 ease-in-out" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            
            <div className="text-center mb-8 flex-1 flex flex-col justify-center">
              <p className="text-neutral-muted uppercase tracking-wider text-sm font-bold mb-2">
                {t(currentField)} ({confirmedCount + 1} / {FIELD_ORDER.length})
              </p>
              
              <h3 className="text-2xl font-bold text-neutral-text mb-2 min-h-[4rem] flex items-center justify-center">
                {systemMessage}
              </h3>
            </div>

            {/* Main Interaction Area */}
            {appState === 'ASKING' && (
              <div className="flex flex-col items-center justify-center flex-1">
                <VoiceButton 
                  controlledState={voiceState}
                  onClickOverride={handleMicClick}
                  interimTextOverride={voiceState === 'listening' ? (interimTranscript || transcript) : ''}
                  idleText={t(`say_${currentField}`) || t('tell_problem')}
                  idleSubtext={t('mic_tap_instruction')}
                />
                
                {fields[currentField].retries > 0 && (
                   <button 
                     onClick={() => setAppState('MANUAL_FALLBACK')}
                     className="mt-6 text-neutral-muted hover:text-primary transition-colors flex items-center gap-2"
                   >
                     <Edit3 className="w-4 h-4" /> {t('type_manually')}
                   </button>
                )}
              </div>
            )}

            {appState === 'CONFIRMING' && (
              <div className="flex flex-col items-center justify-center flex-1 animate-in zoom-in-95">
                <div className="bg-primary-light/20 p-6 rounded-2xl w-full text-center mb-8 border border-primary-light">
                  <span className="text-3xl font-bold text-primary-dark">
                    {currentField === 'gender' 
                      ? (tempValue === 'Male' ? t('gender_male') : tempValue === 'Female' ? t('gender_female') : tempValue === 'Other' ? t('gender_other') : tempValue) 
                      : tempValue}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 w-full">
                  <Button variant="outline" className="py-4 text-lg bg-red-50 border-red-200 text-red-700 hover:bg-red-100" onClick={handleConfirmNo}>
                    {t('no_retry')}
                  </Button>
                  <Button variant="primary" className="py-4 text-lg" onClick={handleConfirmYes}>
                    {t('yes')}
                  </Button>
                </div>
              </div>
            )}

            {appState === 'MANUAL_FALLBACK' && (
              <div className="flex flex-col flex-1 animate-in slide-in-from-bottom">
                <div className="mb-6">
                  <label className="block text-sm font-bold text-neutral-muted mb-2 uppercase">{t(currentField)}</label>
                  
                  {currentField === 'gender' ? (
                    <select 
                      value={manualInput}
                      onChange={e => setManualInput(e.target.value)}
                      className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-lg bg-white"
                    >
                      <option value="">-- {t('say_gender')} --</option>
                      <option value="Male">{t('gender_male')}</option>
                      <option value="Female">{t('gender_female')}</option>
                      <option value="Other">{t('gender_other')}</option>
                    </select>
                  ) : (
                    <input 
                      type={currentField === 'age' || currentField === 'phone' ? 'number' : 'text'}
                      value={manualInput}
                      onChange={e => setManualInput(e.target.value)}
                      className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-lg"
                      placeholder={t('enter_field', { field: t(currentField) })}
                      autoFocus
                    />
                  )}
                </div>
                
                <div className="flex gap-4">
                  {/* Allow going back to voice if they want */}
                  <Button variant="outline" className="flex-1" onClick={() => setAppState('ASKING')}>
                    <ArrowLeft className="w-5 h-5 mr-1" /> {t('back')}
                  </Button>
                  
                  <Button className="flex-1" onClick={handleManualSubmit}>
                    {t('submit')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {step === 'SAVING' && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-xl font-medium text-neutral-text">{t('processing')}</p>
          </div>
        )}

        {step === 'COMPLETED' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold text-neutral-text mb-4">✓ {t('saved')}</h2>
            <Button size="lg" className="w-full max-w-xs mt-8" onClick={() => navigate('/patient/home')}>
              {t('start')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;