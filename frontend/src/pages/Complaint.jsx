import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Mic, AlertCircle, Loader2 } from 'lucide-react';
import VoiceButton from '../components/VoiceButton';
import Button from '../components/Button';
import { usePatient } from '../context/PatientContext';
import { useLanguage } from '../context/LanguageContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { processComplaint } from '../services/complaintAI';
import { createComplaint } from '../services/api';

const Complaint = () => {
  const navigate = useNavigate();
  const { patient, isLoaded, saveComplaint } = usePatient();
  const { t, language } = useLanguage();
  
  const [step, setStep] = useState('START');
  const [voiceState, setVoiceState] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    originalStatement: '',
    problem: '',
    duration: '',
    additionalSymptoms: '',
    needsConfirmation: false
  });
  
  const [textInput, setTextInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const {
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    hasSupport,
    startListening,
    stopListening
  } = useSpeechRecognition();

  useEffect(() => {
    if (isLoaded && !patient) {
      setStep('UNREGISTERED');
    }
  }, [isLoaded, patient]);

  useEffect(() => {
    if (speechError) {
      setVoiceState('error');
      setErrorMessage(speechError);
      setStep('ERROR');
    }
  }, [speechError]);

  useEffect(() => {
    if (isListening) {
      setVoiceState('listening');
    } else if (voiceState === 'listening') {
      handleSpeechEnd(transcript);
    }
  }, [isListening, transcript]);

  if (!isLoaded) return null;

  if (step === 'UNREGISTERED') {
    return (
      <div className="flex flex-col h-full max-w-lg mx-auto pb-4 items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 mb-6">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-text mb-2">{t('complete_profile')}</h2>
        <p className="text-neutral-muted mb-8">{t('speak_profile')}</p>
        <Button size="lg" className="w-full" onClick={() => navigate('/patient/register')}>
          {t('start')}
        </Button>
      </div>
    );
  }

  const handleVoiceToggle = () => {
    if (voiceState === 'idle' || voiceState === 'error') {
      setStep('START');
      startListening();
    } else if (voiceState === 'listening') {
      stopListening();
    }
  };

  const handleSpeechEnd = async (finalTranscript) => {
    if (!finalTranscript.trim()) {
      setVoiceState('error');
      setErrorMessage(t('no_retry'));
      setStep('ERROR');
      return;
    }
    
    setVoiceState('processing');
    setStep('PROCESSING');
    
    try {
      const extracted = await processComplaint(finalTranscript, language);
      setFormData(extracted);
      setVoiceState('completed');
      setTimeout(() => {
        setStep('REVIEW');
        setVoiceState('idle');
      }, 1000);
    } catch (err) {
      setVoiceState('error');
      setErrorMessage(t('type_manually'));
      setFormData({
        originalStatement: finalTranscript,
        problem: 'Error',
        duration: 'Error',
        additionalSymptoms: 'Error',
        needsConfirmation: true
      });
      setTimeout(() => {
        setStep('EDITING');
        setVoiceState('idle');
      }, 2000);
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;
    setStep('PROCESSING');
    
    try {
      const extracted = await processComplaint(textInput, language);
      setFormData(extracted);
      setStep('REVIEW');
    } catch (err) {
      setFormData({
        originalStatement: textInput,
        problem: 'Error',
        duration: 'Error',
        additionalSymptoms: 'Error',
        needsConfirmation: true
      });
      setStep('EDITING');
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    
    const complaintPayload = {
      patientId: patient._id,
      originalStatement: formData.originalStatement,
      problem: formData.problem,
      duration: formData.duration,
      additionalSymptoms: formData.additionalSymptoms,
      inputMethod: hasSupport && textInput.length === 0 ? 'voice' : 'text',
      language: language
    };

    try {
      const savedResult = await createComplaint(complaintPayload);
      saveComplaint(savedResult);
      setStep('CONFIRMED');
    } catch (err) {
      console.error(err);
      setSubmitError('Error Saving');
      
      saveComplaint({
        ...complaintPayload,
        status: 'READY_FOR_DOCTOR',
        createdAt: new Date().toISOString(),
        _id: 'local_' + Date.now(),
        isLocal: true
      });
      setStep('CONFIRMED');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto pb-4">
      {step !== 'CONFIRMED' && (
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => navigate('/patient/home')}
            className="p-2 bg-white rounded-full shadow-sm text-neutral-text hover:bg-gray-50 active:scale-95"
            aria-label={t('back')}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h2 className="text-2xl font-bold text-neutral-text">{t('tell_problem')}</h2>
        </div>
      )}

      <div className="flex-1 flex flex-col">
        {(step === 'START' || step === 'PROCESSING') && (
          <>
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 text-center mb-6">
              <p className="text-lg text-neutral-muted mb-4">
                {t('speak_problem')}
              </p>
            </div>

            {!hasSupport && step === 'START' ? (
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 text-center mb-6">
                <p className="text-orange-800 text-sm">
                  {t('type_manually')}
                </p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-white rounded-3xl p-6 shadow-sm border border-gray-100 min-h-[300px]">
                <VoiceButton 
                  controlledState={voiceState}
                  onClickOverride={handleVoiceToggle}
                  interimTextOverride={interimTranscript || transcript}
                  idleText={t('tell_problem')}
                  idleSubtext=""
                  completedText={t('saved')}
                  completedSubtext=""
                />
              </div>
            )}
            
            {step === 'START' && (
              <div className="mt-6 text-center">
                <button 
                  onClick={() => setStep('TEXT_INPUT')}
                  className="text-primary hover:underline text-lg font-medium"
                >
                  {t('type_manually')}
                </button>
              </div>
            )}
          </>
        )}

        {step === 'TEXT_INPUT' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-in slide-in-from-right flex-1 flex flex-col">
            <h3 className="text-xl font-bold mb-4">{t('type_manually')}</h3>
            <textarea
              className="w-full flex-1 min-h-[150px] p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary resize-none text-lg"
              placeholder={t('type_manually')}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              maxLength={1000}
            />
            <Button size="lg" className="w-full mt-4" onClick={handleTextSubmit} disabled={!textInput.trim()}>
              {t('submit')}
            </Button>
          </div>
        )}

        {step === 'ERROR' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-in slide-in-from-bottom flex-1 flex flex-col items-center justify-center text-center">
             <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
                <AlertCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-neutral-text mb-2">{t('error_title')}</h3>
              <p className="text-neutral-muted mb-8 whitespace-pre-wrap">{errorMessage}</p>
              
              <Button size="lg" className="w-full mb-4 flex items-center justify-center gap-2" onClick={() => setStep('START')}>
                <Mic className="w-6 h-6" />
                {t('no_retry')}
              </Button>
              <Button variant="outline" size="lg" className="w-full" onClick={() => setStep('TEXT_INPUT')}>
                {t('type_manually')}
              </Button>
          </div>
        )}

        {step === 'REVIEW' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-in slide-in-from-right">
            <div className="text-center mb-6 border-b border-gray-100 pb-6">
              <h3 className="text-2xl font-bold text-neutral-text">{t('confirm_info')}</h3>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
              <p className="text-neutral-text text-lg italic">"{formData.originalStatement}"</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-neutral-muted text-sm">{t('what_problem')}</p>
                <p className="font-bold text-lg">{formData.problem}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-neutral-muted text-sm">{t('how_long')}</p>
                  <p className="font-bold text-lg">{formData.duration}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-neutral-muted text-sm">{t('any_other')}</p>
                  <p className="font-bold text-lg">{formData.additionalSymptoms}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button size="lg" className="w-full flex items-center justify-center gap-2" onClick={handleConfirm} disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-6 h-6" />
                )}
                {t('yes')}
              </Button>
              <Button variant="outline" size="lg" className="w-full" onClick={() => setStep('EDITING')} disabled={isSubmitting}>
                {t('change_info')}
              </Button>
            </div>
          </div>
        )}

        {step === 'EDITING' && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-in slide-in-from-right">
            <h3 className="text-xl font-bold mb-6 border-b border-gray-100 pb-4">{t('change_info')}</h3>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm text-neutral-muted mb-1">{t('what_problem')}</label>
                <input 
                  type="text" 
                  value={formData.problem}
                  onChange={e => setFormData({...formData, problem: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-muted mb-1">{t('how_long')}</label>
                <input 
                  type="text" 
                  value={formData.duration}
                  onChange={e => setFormData({...formData, duration: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-muted mb-1">{t('any_other')}</label>
                <input 
                  type="text" 
                  value={formData.additionalSymptoms}
                  onChange={e => setFormData({...formData, additionalSymptoms: e.target.value})}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <Button size="lg" className="w-full" onClick={() => {
              setFormData(prev => ({...prev, needsConfirmation: false}));
              setStep('REVIEW');
            }}>
              {t('confirm_info')}
            </Button>
          </div>
        )}

        {step === 'CONFIRMED' && (
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-3xl font-bold text-neutral-text mb-4">✓ {t('saved')}</h2>
            <Button size="lg" className="w-full max-w-xs" onClick={() => navigate('/patient/home')}>
              {t('start')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Complaint;
