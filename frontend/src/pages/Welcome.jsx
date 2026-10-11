import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, HeartPulse, Globe, ArrowUp, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { detectLanguageFromTranscript, SUPPORTED_LANGUAGES } from '../services/languageDetection';
import { usePatient } from '../context/PatientContext';

const Welcome = () => {
  const navigate = useNavigate();
  const { setLanguage } = useLanguage();
  const { patient } = usePatient();
  
  const [isListening, setIsListening] = useState(false);
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [detectionError, setDetectionError] = useState(false);
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (patient) {
      navigate('/patient/home', { replace: true });
    }
  }, [patient, navigate]);

  useEffect(() => {
    if (patient) return;
    // Auto-start listening after 2 seconds of landing on the page
    const timer = setTimeout(() => {
      if (!isListening && !showLanguagePicker) {
        handleVoiceInteraction();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [patient, isListening, showLanguagePicker]);

  const initSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setDetectionError(true);
      setShowLanguagePicker(true);
      return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    
    return recognition;
  };

  const handleVoiceInteraction = () => {
    setDetectionError(false);
    setShowLanguagePicker(false);
    
    const recognition = initSpeechRecognition();
    if (!recognition) return;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const detected = detectLanguageFromTranscript(transcript);
      
      if (detected && detected.confidence > 0.5 && detected.language !== 'unknown') {
        // Success
        setLanguage(detected.language);
        if (patient) {
           navigate('/patient/home');
        } else {
           navigate('/patient/register');
        }
      } else {
        // Low confidence
        setDetectionError(true);
        setShowLanguagePicker(true);
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        // Ask to repeat
        setDetectionError(true);
      } else {
        setDetectionError(true);
        setShowLanguagePicker(true);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
      setDetectionError(true);
      setShowLanguagePicker(true);
    }
  };

  const handleManualSelect = (langCode) => {
    setLanguage(langCode);
    if (patient) {
      navigate('/patient/home');
    } else {
      navigate('/patient/register');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white items-center justify-center relative px-6 py-12">
      
      {/* Top right language selector fallback icon */}
      <button 
        onClick={() => setShowLanguagePicker(!showLanguagePicker)}
        className="absolute top-6 right-6 p-3 bg-gray-50 rounded-full text-gray-500 hover:bg-gray-100 shadow-sm transition-all"
        aria-label="Select Language"
      >
        <Globe className="w-7 h-7" />
      </button>

      {/* Main Logo (Visually clean, language neutral) */}
      <div className="flex flex-col items-center mb-16 mt-8">
        <div className="bg-primary-light/20 p-6 rounded-full text-primary mb-4">
          <HeartPulse className="w-20 h-20" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-primary-dark">SwasthyaSetu</h1>
      </div>

      {/* Feedback State (Language neutral icons if possible) */}
      {detectionError && !showLanguagePicker && (
         <div className="mb-6 flex flex-col items-center text-orange-500 animate-pulse">
           <AlertCircle className="w-10 h-10 mb-2" />
           <span className="text-sm font-semibold">?</span>
         </div>
      )}

      {/* Primary Voice Interaction */}
      <div className="flex flex-col items-center relative z-10">
        
        {/* Visual Arrow Pointing to Mic */}
        <div className="mb-4 animate-bounce text-gray-300">
           <ArrowUp className="w-10 h-10" />
        </div>

        <button
          onClick={handleVoiceInteraction}
          className={`relative flex items-center justify-center w-40 h-40 rounded-full shadow-2xl transition-all duration-300 ${
            isListening 
              ? 'bg-red-500 scale-110 shadow-red-500/50' 
              : 'bg-primary hover:bg-primary-dark hover:scale-105 shadow-primary/40'
          }`}
          aria-label="Microphone"
        >
          {/* Ripple Effect while listening */}
          {isListening && (
            <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"></div>
          )}
          
          <Mic className={`w-20 h-20 relative z-10 ${isListening ? 'text-white' : 'text-white'}`} />
        </button>
      </div>

      {/* Manual Language Selector Fallback Overlay */}
      {showLanguagePicker && (
        <div className="absolute bottom-0 left-0 w-full bg-white rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] p-6 z-20 animate-in slide-in-from-bottom-10">
          <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
          <div className="grid grid-cols-2 gap-4">
            {SUPPORTED_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => handleManualSelect(lang.code)}
                className="p-4 rounded-2xl border-2 border-gray-100 hover:border-primary bg-gray-50 font-bold text-gray-800 transition-all text-center"
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default Welcome;