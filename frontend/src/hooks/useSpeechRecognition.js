import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';

export const useSpeechRecognition = (options = {}) => {
  const { language, t } = useLanguage();
  const { lang = language, continuous = false, interimResults = true } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState(null);
  const [hasSupport, setHasSupport] = useState(true);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  useEffect(() => {
    if (!SpeechRecognition) {
      setHasSupport(false);
    }
  }, [SpeechRecognition]);

  const startListening = useCallback(() => {
    if (!SpeechRecognition) return;

    setError(null);
    setTranscript('');
    setInterimTranscript('');
    
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let finalStr = '';
      let interimStr = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalStr += event.results[i][0].transcript;
        } else {
          interimStr += event.results[i][0].transcript;
        }
      }

      setTranscript(prev => prev + finalStr);
      setInterimTranscript(interimStr);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        setError(t('mic_permission_denied'));
      } else {
        setError(t('mic_not_heard'));
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
      // Store the instance so we can stop it manually
      window.currentRecognition = recognition;
    } catch (err) {
      console.error(err);
      setError(t('mic_start_error'));
    }
  }, [SpeechRecognition, lang, continuous, interimResults, t]);

  const stopListening = useCallback(() => {
    if (window.currentRecognition) {
      window.currentRecognition.stop();
      setIsListening(false);
    }
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    hasSupport,
    startListening,
    stopListening
  };
};
