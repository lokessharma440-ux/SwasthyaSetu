// languageDetection.js
// Provides an abstraction for voice-based language detection.
// Uses free browser capabilities (Web Speech API) and simple text heuristics.

export const SUPPORTED_LANGUAGES = [
  { code: 'hi-IN', label: 'हिन्दी (Hindi)' },
  { code: 'en-US', label: 'English' },
  { code: 'gu-IN', label: 'ગુજરાતી (Gujarati)' },
  { code: 'te-IN', label: 'తెలుగు (Telugu)' },
  { code: 'mr-IN', label: 'मराठी (Marathi)' }
];

/**
 * Basic heuristic dictionary to guess language from a raw transcript.
 * Since Web Speech API often forces a single language (via `lang` property) or defaults to OS language,
 * cross-language transcription is very poor in browsers without paid APIs. 
 * We use simple script detection or known keywords as a basic attempt.
 */
const LANGUAGE_HEURISTICS = {
  'hi-IN': /[\u0900-\u097F]|(mera naam|hai|hoon)/i, // Devanagari script or common romanized Hindi
  'gu-IN': /[\u0A80-\u0AFF]|(maru naam|che)/i, // Gujarati script
  'te-IN': /[\u0C00-\u0C7F]|(naa peru)/i, // Telugu script
  'mr-IN': /[\u0900-\u097F]|(majhe naav|aahe)/i, // Devanagari script (Marathi specific heuristics)
  'en-US': /^[a-zA-Z\s]+$/i // Pure English characters
};

/**
 * Attempts to detect language from a given transcript string.
 * Returns { language: 'code', confidence: number, source: 'voice' } or null.
 */
export const detectLanguageFromTranscript = (transcript) => {
  if (!transcript || transcript.trim() === '') return null;

  for (const [langCode, regex] of Object.entries(LANGUAGE_HEURISTICS)) {
    if (regex.test(transcript)) {
      return {
        language: langCode,
        confidence: 0.8, // Heuristic confidence
        source: 'voice'
      };
    }
  }

  return {
    language: 'unknown',
    confidence: 0,
    source: 'voice'
  };
};

/**
 * Plays a multi-lingual prompt asking the user to say their name.
 * Uses the browser's SpeechSynthesis API.
 */
export const playMultiLingualPrompt = () => {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    // We try to ask in Hindi and English as a basic prompt, 
    // simulating a multi-lingual system.
    const msg = new SpeechSynthesisUtterance("कृपया अपना नाम बताएं। Please say your name.");
    msg.rate = 0.9;

    msg.onend = () => resolve();
    msg.onerror = () => resolve();

    window.speechSynthesis.speak(msg);
  });
};
