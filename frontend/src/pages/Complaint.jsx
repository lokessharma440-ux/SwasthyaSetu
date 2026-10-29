import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mic, 
  AlertCircle 
} from 'lucide-react';
import VoiceButton from '../components/VoiceButton';
import Button from '../components/Button';
import { usePatient } from '../context/PatientContext';
import { useLanguage } from '../context/LanguageContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { processComplaint } from '../services/complaintAI';
import { createComplaint, createPatient } from '../services/api';
import UnregisteredPrompt from '../components/complaint/UnregisteredPrompt';
import ComplaintReviewStep from '../components/complaint/ComplaintReviewStep';
import ComplaintEditingStep from '../components/complaint/ComplaintEditingStep';
import ComplaintConfirmedStep from '../components/complaint/ComplaintConfirmedStep';

const Complaint = () => {
  const navigate = useNavigate();
  const { patient, savePatient, isLoaded, saveComplaint } = usePatient();
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
  const [countdown, setCountdown] = useState(null); // Auto-submit countdown in seconds

  const {
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    hasSupport,
    startListening,
    stopListening
  } = useSpeechRecognition();

  // If patient has a local/mock ID, automatically sync/register in background with MongoDB
  useEffect(() => {
    if (patient && (!patient._id || patient.isLocal || !/^[0-9a-fA-F]{24}$/.test(patient._id))) {
      createPatient({
        name: patient.name || 'Lokesh Sharma',
        age: patient.age || 35,
        gender: patient.gender || 'Male',
        location: patient.location || 'Rampur',
        phone: patient.phone || '9876543210'
      }).then(synced => {
        if (synced && synced._id) {
          savePatient(synced);
        }
      }).catch(err => console.warn('Background patient sync:', err.message));
    }
  }, [patient]);

  // Auto-sync any previously saved local/offline complaints
  useEffect(() => {
    try {
      const savedComplaint = localStorage.getItem('swasthyasetu_complaint');
      if (savedComplaint) {
        const parsed = JSON.parse(savedComplaint);
        if (parsed.isLocal && parsed.problem) {
          createComplaint({
            patientId: patient?._id,
            originalStatement: parsed.originalStatement || parsed.problem,
            problem: parsed.problem,
            duration: parsed.duration || 'Not specified',
            additionalSymptoms: parsed.additionalSymptoms || '',
            inputMethod: parsed.inputMethod || 'voice',
            language: parsed.language || language
          }).then(res => {
            saveComplaint(res);
            console.log('Synced local complaint to MongoDB:', res);
          }).catch(err => console.warn('Offline complaint sync:', err.message));
        }
      }
    } catch (e) {
      // ignore
    }
  }, [patient?._id]);

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

  // Auto-submit countdown timer when in REVIEW step
  useEffect(() => {
    let timer = null;
    if (step === 'REVIEW' && countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(prev => (prev > 1 ? prev - 1 : 0));
      }, 1000);
    } else if (step === 'REVIEW' && countdown === 0) {
      setCountdown(null);
      handleConfirm();
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  if (!isLoaded) return null;

  const handleQuickRegister = async () => {
    try {
      const demoPatient = await createPatient({
        name: 'Lokesh Sharma',
        age: 35,
        gender: 'Male',
        location: 'Rampur',
        phone: '9876543210'
      });
      savePatient(demoPatient);
      setStep('START');
    } catch (e) {
      savePatient({
        name: 'Lokesh Sharma',
        age: 35,
        gender: 'Male',
        location: 'Rampur',
        phone: '9876543210'
      });
      setStep('START');
    }
  };

  if (step === 'UNREGISTERED') {
    return (
      <UnregisteredPrompt 
        onQuickRegister={handleQuickRegister}
        onNavigateRegister={() => navigate('/patient/register')}
        t={t}
      />
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
        setCountdown(8);
      }, 900);
    } catch (err) {
      setVoiceState('error');
      setErrorMessage(t('type_manually'));
      setFormData({
        originalStatement: finalTranscript,
        problem: finalTranscript,
        duration: 'Not specified',
        additionalSymptoms: '',
        needsConfirmation: true
      });
      setTimeout(() => {
        setStep('REVIEW');
        setVoiceState('idle');
        setCountdown(8);
      }, 1200);
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;
    setStep('PROCESSING');
    
    try {
      const extracted = await processComplaint(textInput, language);
      setFormData(extracted);
      setStep('REVIEW');
      setCountdown(null);
    } catch (err) {
      setFormData({
        originalStatement: textInput,
        problem: textInput,
        duration: 'Not specified',
        additionalSymptoms: '',
        needsConfirmation: true
      });
      setStep('REVIEW');
      setCountdown(null);
    }
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setCountdown(null);
    
    try {
      let currentPatient = patient;
      let targetPatientId = patient?._id;

      if (!targetPatientId || patient?.isLocal || !/^[0-9a-fA-F]{24}$/.test(targetPatientId)) {
        try {
          const syncedPatient = await createPatient({
            name: patient?.name || 'Lokesh Sharma',
            age: patient?.age || 35,
            gender: patient?.gender || 'Male',
            location: patient?.location || 'Rampur',
            phone: patient?.phone || '9876543210'
          });
          if (syncedPatient && syncedPatient._id) {
            savePatient(syncedPatient);
            currentPatient = syncedPatient;
            targetPatientId = syncedPatient._id;
          }
        } catch (e) {
          console.warn('Patient auto-sync fallback:', e);
        }
      }

      const complaintPayload = {
        patientId: targetPatientId,
        originalStatement: formData.originalStatement || formData.problem,
        problem: formData.problem || formData.originalStatement,
        duration: formData.duration || 'Not specified',
        additionalSymptoms: formData.additionalSymptoms || '',
        inputMethod: hasSupport && textInput.length === 0 ? 'voice' : 'text',
        language: language,
        patientName: currentPatient?.name || 'Lokesh Sharma',
        phone: currentPatient?.phone || '9876543210'
      };

      const savedResult = await createComplaint(complaintPayload);
      saveComplaint(savedResult);
      setStep('CONFIRMED');
    } catch (err) {
      console.error('Error saving complaint to backend:', err);
      const localComplaint = {
        patientId: patient?._id,
        originalStatement: formData.originalStatement || formData.problem,
        problem: formData.problem || formData.originalStatement,
        duration: formData.duration || 'Not specified',
        additionalSymptoms: formData.additionalSymptoms || '',
        status: 'READY_FOR_DOCTOR',
        createdAt: new Date().toISOString(),
        _id: 'local_' + Date.now(),
        isLocal: true
      };
      saveComplaint(localComplaint);
      setStep('CONFIRMED');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto pb-6">
      {step !== 'CONFIRMED' && (
        <div className="flex items-center gap-3 mb-6">
          <button 
            onClick={() => navigate('/patient/home')}
            className="p-2.5 bg-white rounded-2xl shadow-sm text-slate-700 hover:bg-slate-50 border border-slate-100 active:scale-95 transition-all"
            aria-label={t('back')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">{t('tell_problem')}</h2>
            <p className="text-sm text-slate-400 mt-0.5">{t('complaint_subtitle')}</p>
          </div>
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
          <ComplaintReviewStep
            formData={formData}
            countdown={countdown}
            setCountdown={setCountdown}
            handleConfirm={handleConfirm}
            setStep={setStep}
            isSubmitting={isSubmitting}
            t={t}
          />
        )}

        {step === 'EDITING' && (
          <ComplaintEditingStep
            formData={formData}
            setFormData={setFormData}
            setStep={setStep}
            t={t}
          />
        )}

        {step === 'CONFIRMED' && (
          <ComplaintConfirmedStep
            formData={formData}
            navigate={navigate}
            t={t}
          />
        )}
      </div>
    </div>
  );
};

export default Complaint;
