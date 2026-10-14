import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';

const useSpeechSynthesis = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef(null);
  const voicesRef = useRef([]);
  const { language } = useLanguage();

  const getAvailableVoices = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    try {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length > 0) {
        voicesRef.current = v;
        return v;
      }
    } catch (e) {
      console.warn('Voice retrieval error:', e);
    }
    return voicesRef.current;
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      setIsSupported(true);

      getAvailableVoices();

      const onVoices = () => {
        getAvailableVoices();
      };

      if (window.speechSynthesis.addEventListener) {
        window.speechSynthesis.addEventListener('voiceschanged', onVoices);
      } else {
        window.speechSynthesis.onvoiceschanged = onVoices;
      }

      return () => {
        if (window.speechSynthesis.removeEventListener) {
          window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
        }
      };
    }
  }, [getAvailableVoices]);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn('Cancel error:', e);
      }
      setIsSpeaking(false);
    }
  }, []);

  // Multi-tier voice finder specifically tailored for laptops & Indian dialects
  const findVoiceForLanguage = useCallback((targetLang) => {
    const voices = getAvailableVoices();
    if (!voices || voices.length === 0) return null;

    const lang = (targetLang || 'hi-IN').toLowerCase();
    const prefix = lang.split('-')[0].split('_')[0]; // 'mr', 'hi', 'gu', 'te', 'en'

    // 1. Direct match for exact locale (e.g. 'mr-IN', 'mr_IN')
    let matched = voices.find(v => {
      const vLang = (v.lang || '').replace('_', '-').toLowerCase();
      return vLang === lang;
    });

    // 2. Direct match by prefix (e.g. 'mr')
    if (!matched) {
      matched = voices.find(v => {
        const vLang = (v.lang || '').replace('_', '-').toLowerCase();
        return vLang.startsWith(prefix);
      });
    }

    // 3. Name-based match for Marathi specifically
    if (!matched && prefix === 'mr') {
      matched = voices.find(v => {
        const vName = (v.name || '').toLowerCase();
        return vName.includes('marathi') || vName.includes('मराठी') || vName.includes('aarohi') || vName.includes('manohar');
      });
    }

    // 4. CRITICAL SCRIPT FALLBACK FOR MARATHI:
    // Marathi is written in Devanagari script. If a dedicated Marathi voice is not installed
    // on this laptop/browser (very common on Windows/Mac), use a Hindi voice (Google हिन्दी, Kalpana, Hemant)!
    // A Hindi voice natively reads Devanagari Marathi text fluently without throwing 'language-unavailable'.
    if (!matched && prefix === 'mr') {
      matched = voices.find(v => {
        const vLang = (v.lang || '').replace('_', '-').toLowerCase();
        const vName = (v.name || '').toLowerCase();
        return vLang.startsWith('hi') || vName.includes('hindi') || vName.includes('हिन्दी') || vName.includes('kalpana') || vName.includes('hemant');
      });
    }

    // 5. General name-based keyword search for other languages
    if (!matched) {
      const keywordsMap = {
        hi: ['hindi', 'हिन्दी', 'kalpana', 'hemant', 'swara'],
        gu: ['gujarati', 'ગુજરાતી', 'dhwani', 'niranjan'],
        te: ['telugu', 'తెలుగు', 'chitra', 'mohan'],
        en: ['india', 'indian', 'english', 'us', 'uk', 'david', 'zira', 'mark']
      };
      const kw = keywordsMap[prefix] || [];
      if (kw.length > 0) {
        matched = voices.find(v => {
          const vName = (v.name || '').toLowerCase();
          return kw.some(k => vName.includes(k));
        });
      }
    }

    // 6. Indian regional fallback
    if (!matched) {
      matched = voices.find(v => {
        const vLang = (v.lang || '').toLowerCase();
        const vName = (v.name || '').toLowerCase();
        return vLang.includes('en-in') || vName.includes('india') || vLang.startsWith('hi');
      });
    }

    // 7. Final fallback: Default system voice or first available
    if (!matched) {
      matched = voices.find(v => v.default) || voices.find(v => (v.lang || '').startsWith('en')) || voices[0];
    }

    return matched;
  }, [getAvailableVoices]);

  const speak = useCallback((text) => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) {
        resolve();
        return;
      }

      const synth = window.speechSynthesis;

      // Chrome Desktop Deadlock Fix: Unpause and cancel any stalled utterances
      try {
        if (synth.paused) {
          synth.resume();
        }
        synth.cancel();
      } catch (e) {
        console.warn('Pre-speech reset:', e);
      }

      // Small delay after cancel so browser audio thread resets cleanly
      setTimeout(() => {
        try {
          const utterance = new SpeechSynthesisUtterance(text);
          const chosenVoice = findVoiceForLanguage(language);

          if (chosenVoice) {
            utterance.voice = chosenVoice;
            // CRITICAL: Align utterance.lang with voice to avoid browser rejecting language mismatch
            utterance.lang = chosenVoice.lang || language;
          } else {
            utterance.lang = language;
          }

          utterance.rate = 0.95;
          utterance.pitch = 1.0;

          const punctuationCount = (text.match(/[?.!]/g) || []).length;
          const commaCount = (text.match(/[,()[\]\-]/g) || []).length;
          const estimatedDuration = (text.length * 90) + (punctuationCount * 700) + (commaCount * 350) + 1200;

          let isResolved = false;
          let heartbeatTimer = null;

          const finalize = () => {
            if (isResolved) return;
            isResolved = true;
            if (heartbeatTimer) clearInterval(heartbeatTimer);
            if (window.__swasthya_active_utterance === utterance) {
              window.__swasthya_active_utterance = null;
            }
            setIsSpeaking(false);
            resolve();
          };

          const checkSpeaking = () => {
            if (!synth.speaking) {
              finalize();
            } else {
              setTimeout(checkSpeaking, 100);
            }
          };

          const fallbackTimer = setTimeout(finalize, estimatedDuration);

          utterance.onstart = () => {
            setIsSpeaking(true);
            // Periodic resume heartbeat prevents Chrome desktop from stalling mid-speech
            heartbeatTimer = setInterval(() => {
              if (synth.speaking && synth.paused) {
                synth.resume();
              }
            }, 2500);
          };

          utterance.onend = () => {
            clearTimeout(fallbackTimer);
            checkSpeaking();
          };

          utterance.onerror = (e) => {
            if (e.error !== 'interrupted' && e.error !== 'canceled') {
              console.warn('Speech synthesis warning:', e.error || e);
            }
            clearTimeout(fallbackTimer);
            checkSpeaking();
          };

          // Protect from desktop Chrome garbage collection
          window.__swasthya_active_utterance = utterance;

          if (synth.paused) {
            synth.resume();
          }

          synth.speak(utterance);

          // Second resume pulse to trigger audio pipeline on desktop
          setTimeout(() => {
            if (synth.paused) {
              synth.resume();
            }
          }, 50);

        } catch (err) {
          console.error('Speech synthesis execution failed:', err);
          setIsSpeaking(false);
          resolve();
        }
      }, 60);
    });
  }, [language, findVoiceForLanguage]);

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

