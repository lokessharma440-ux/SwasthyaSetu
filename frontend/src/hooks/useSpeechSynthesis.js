import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

const useSpeechSynthesis = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef(null);
  const { language } = useLanguage();

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      setIsSupported(true);

      // Listen for voiceschanged to ensure voices are loaded
      const handleVoicesChanged = () => {
        // Just keeping it alive to load voices
      };
      
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = handleVoicesChanged;
      }
    }
  }, []);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback((text) => {
    return new Promise((resolve) => {
      if (!synthRef.current || !text) {
        resolve();
        return;
      }

      // Cancel any ongoing speech
      stop();

      // Small timeout to let cancel finish
      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;

        // Set voice to language if available
        const voices = synthRef.current.getVoices();
        // Extract prefix e.g., 'hi' from 'hi-IN'
        const prefix = language.split('-')[0];
        const targetVoice = voices.find((v) => v.lang.includes(language) || v.lang.includes(prefix));
        if (targetVoice) {
          utterance.voice = targetVoice;
        }

        // Better duration math accounting for punctuation pauses
        const punctuationCount = (text.match(/[\?\.\!]/g) || []).length;
        const commaCount = (text.match(/[\,\(\)\[\]\-]/g) || []).length;
        
        const estimatedDuration = (text.length * 85) + (punctuationCount * 800) + (commaCount * 400) + 800; 
        
        let resolved = false;

        const finalize = () => {
          if (resolved) return;
          resolved = true;
          setIsSpeaking(false);
          resolve();
        };

        const checkSpeaking = () => {
          if (!synthRef.current.speaking) {
            finalize();
          } else {
            setTimeout(checkSpeaking, 100);
          }
        };

        // Fallback in case onend never fires or fires instantly
        setTimeout(finalize, estimatedDuration);

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
          checkSpeaking();
        };
        utterance.onerror = (e) => {
          console.error('Speech synthesis error', e);
          checkSpeaking();
        };

        window.currentUtterance = utterance; // Prevent garbage collection
        synthRef.current.speak(utterance);
      }, 50);
    });
  }, [stop, language]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    isSupported,
    isSpeaking,
    speak,
    stop
  };
};

export default useSpeechSynthesis;
