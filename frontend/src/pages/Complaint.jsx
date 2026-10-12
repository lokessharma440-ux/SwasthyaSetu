import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Mic, 
  AlertCircle, 
  Loader2, 
  Stethoscope, 
  ExternalLink, 
  Clock, 
  Send,
  UserCheck 
} from 'lucide-react';
import VoiceButton from '../components/VoiceButton';
import Button from '../components/Button';
import { usePatient } from '../context/PatientContext';
import { useLanguage } from '../context/LanguageContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { processComplaint } from '../services/complaintAI';
import { createComplaint, createPatient } from '../services/api';

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
  const [submitError, setSubmitError] = useState('');
  const [countdown, setCountdown] = useState(null); // Auto-submit countdown in seconds
  const [confirmedComplaint, setConfirmedComplaint] = useState(null);

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
      // Countdown reached 0 -> auto-submit immediately!
      setCountdown(null);
      handleConfirm();
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  if (!isLoaded) return null;

  // Resilient quick-start if patient is not yet registered
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
      <div className="flex flex-col h-full max-w-lg mx-auto pb-4 items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6 shadow-sm">
          <UserCheck className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-text mb-2">Welcome to SwasthyaSetu</h2>
        <p className="text-neutral-muted mb-6 text-sm">
          Please register your profile, or quick-start to speak your health problem immediately for Dr. Demo Sharma.
        </p>
        <div className="w-full space-y-3">
          <Button size="lg" className="w-full" onClick={handleQuickRegister}>
            Quick Start Consultation (Lokesh Sharma)
          </Button>
          <Button variant="outline" size="lg" className="w-full" onClick={() => navigate('/patient/register')}>
            {t('speak_profile')}
          </Button>
        </div>
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
        // Start an 8-second auto-submit countdown so spoken problems automatically transmit
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
      setCountdown(null); // Text inputs can manually confirm
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
    setSubmitError('');
    setCountdown(null);
    
    try {
      // Ensure patient is created/persisted in MongoDB
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
      setConfirmedComplaint(savedResult);
      setStep('CONFIRMED');
    } catch (err) {
      console.error('Error saving complaint to backend:', err);
      setSubmitError(err.message || 'Error Saving');
      
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
      setConfirmedComplaint(localComplaint);
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
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-in slide-in-from-right">
            <div className="text-center mb-5 border-b border-gray-100 pb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 inline-block mb-2">
                Consultation Request Ready
              </span>
              <h3 className="text-2xl font-extrabold text-neutral-text">{t('confirm_info')}</h3>
              <p className="text-xs text-neutral-muted mt-1">
                Your consultation request will be sent to <strong>Dr. Demo Sharma (General Medicine)</strong>
              </p>
            </div>

            <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 mb-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-1">
                Spoken Statement
              </span>
              <p className="text-neutral-text text-base italic font-medium">"{formData.originalStatement || formData.problem}"</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <p className="text-neutral-muted text-xs font-bold uppercase tracking-wider">{t('what_problem')}</p>
                <p className="font-extrabold text-lg text-slate-800 mt-0.5">{formData.problem}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <p className="text-neutral-muted text-xs font-bold uppercase tracking-wider">{t('how_long')}</p>
                  <p className="font-bold text-base text-slate-800 mt-0.5">{formData.duration || 'Not specified'}</p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <p className="text-neutral-muted text-xs font-bold uppercase tracking-wider">{t('any_other')}</p>
                  <p className="font-bold text-base text-slate-800 mt-0.5">{formData.additionalSymptoms || 'None'}</p>
                </div>
              </div>
            </div>

            {/* Auto-Submit Countdown Bar */}
            {countdown !== null && (
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 mb-5 flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 animate-spin" />
                  <span>
                    Auto-sending to doctor in <strong>{countdown}s</strong>...
                  </span>
                </div>
                <button
                  onClick={() => setCountdown(null)}
                  className="text-amber-700 underline font-bold hover:text-amber-900 text-[11px]"
                >
                  Pause Timer
                </button>
              </div>
            )}

            <div className="space-y-3">
              <Button 
                size="lg" 
                className="w-full flex items-center justify-center gap-2 py-4 text-base font-bold bg-emerald-600 hover:bg-emerald-700 shadow-md active:scale-98" 
                onClick={() => {
                  setCountdown(null);
                  handleConfirm();
                }} 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span>✓ Send to Doctor Dashboard Now</span>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full py-3 text-sm font-semibold" 
                onClick={() => {
                  setCountdown(null);
                  setStep('EDITING');
                }} 
                disabled={isSubmitting}
              >
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
          <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500 py-6">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-5 shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              ✓ Sent to Doctor Dashboard!
            </h2>
            <p className="text-sm text-slate-500 max-w-md mb-6">
              Your consultation request has been delivered to <strong>Dr. Demo Sharma (General Medicine)</strong>.
            </p>

            {/* Request Summary Card */}
            <div className="w-full max-w-md bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm text-left mb-6 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chief Problem</span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  WAITING IN QUEUE
                </span>
              </div>
              <p className="font-extrabold text-base text-slate-800">{formData.problem}</p>
              {formData.duration && (
                <p className="text-xs text-slate-500"><strong>Duration:</strong> {formData.duration}</p>
              )}
              <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-100 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-900">Dr. Demo Sharma</p>
                  <p className="text-[11px] text-blue-700">General Medicine • DOC-DEMO-001</p>
                </div>
              </div>
            </div>

            <div className="w-full max-w-md flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/doctor/dashboard?tab=requests')}
                className="flex-1 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <Stethoscope className="w-4 h-4" />
                <span>View on Doctor Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </button>

              <button
                onClick={() => navigate('/patient/home')}
                className="py-3.5 px-5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-bold text-sm transition-all shadow-2xs active:scale-98"
              >
                {t('start') || 'Home'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Complaint;
