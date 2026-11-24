// languageDetection.js
// Provides robust voice-based and text-based language detection for Indian rural healthcare.
// Supports: Hindi (hi-IN), English (en-US), Gujarati (gu-IN), Telugu (te-IN), Marathi (mr-IN).

export const SUPPORTED_LANGUAGES = [
  { code: 'hi-IN', label: 'हिन्दी (Hindi)' },
  { code: 'en-US', label: 'English' },
  { code: 'gu-IN', label: 'ગુજરાતી (Gujarati)' },
  { code: 'te-IN', label: 'తెలుగు (Telugu)' },
  { code: 'mr-IN', label: 'मराठी (Marathi)' }
];

/**
 * Attempts to detect language from a given spoken transcript string.
 * Returns { language: 'code', confidence: number, source: 'voice' } or null.
 */
export const detectLanguageFromTranscript = (transcript) => {
  if (!transcript || transcript.trim() === '') return null;

  const text = transcript.trim();
  const lower = text.toLowerCase();

  // 1. Direct Language Name Keywords (Highest Priority)
  // When users say the language they want to speak in
  if (/\b(hindi|hindee|hindi\s+mein|hindi\s+me)\b|हिंदी|हिन्दी|हिंद|हिन्दुस्तानी/i.test(text)) {
    return { language: 'hi-IN', confidence: 1.0, source: 'voice' };
  }
  if (/\b(english|inglis|angrezi|angreji)\b|अंग्रेजी|अंग्रेज़ी|इंग्लिश/i.test(text)) {
    return { language: 'en-US', confidence: 1.0, source: 'voice' };
  }
  if (/\b(marathi|marathe|marathi\s+madhe)\b|मराठी/i.test(text)) {
    return { language: 'mr-IN', confidence: 1.0, source: 'voice' };
  }
  if (/\b(gujarati|gujrati|gujarathi|gujarati\s+ma)\b|ગુજરાતી|गुजराती/i.test(text)) {
    return { language: 'gu-IN', confidence: 1.0, source: 'voice' };
  }
  if (/\b(telugu|thesugu|telugulo)\b|తెలుగు|तेलुगु|तेलगू/i.test(text)) {
    return { language: 'te-IN', confidence: 1.0, source: 'voice' };
  }

  // 2. Specific Non-Devanagari Scripts
  // Gujarati Unicode range: \u0A80-\u0AFF
  if (/[\u0A80-\u0AFF]/.test(text)) {
    return { language: 'gu-IN', confidence: 0.95, source: 'voice' };
  }

  // Telugu Unicode range: \u0C00-\u0C7F
  if (/[\u0C00-\u0C7F]/.test(text)) {
    return { language: 'te-IN', confidence: 0.95, source: 'voice' };
  }

  // 3. Devanagari Script (Shared between Hindi and Marathi)
  // Check distinctive Marathi words and characters before defaulting to Hindi
  if (/[\u0900-\u097F]/.test(text)) {
    const marathiDevanagariMarkers = /(?:माझे|नाव|आहे|नाही|मला|कसे|कशी|काय|होय|झाले|पाहिजे|ताप|औषध|नमस्कार|कसा|आहात|करा|चांगले|ळ)/;
    if (marathiDevanagariMarkers.test(text)) {
      return { language: 'mr-IN', confidence: 0.95, source: 'voice' };
    }
    // Default Devanagari to Hindi
    return { language: 'hi-IN', confidence: 0.9, source: 'voice' };
  }

  // 4. Romanized Conversational Keywords
  // Marathi Romanized
  if (/\b(majhe|mazhe|naav|mala|aahe|nahi|kasa|kashi|kay|aushadh|madat|dhanyavaad|namaskar)\b/i.test(lower)) {
    return { language: 'mr-IN', confidence: 0.85, source: 'voice' };
  }

  // Gujarati Romanized
  if (/\b(maru|kem\s+cho|mane|che|nathi|tav|dava|aabhar)\b/i.test(lower)) {
    return { language: 'gu-IN', confidence: 0.85, source: 'voice' };
  }

  // Telugu Romanized
  if (/\b(naa\s+peru|naku|undi|ledu|jwaram|mandulu|sahayam|namaskaram|dhanyavadalu)\b/i.test(lower)) {
    return { language: 'te-IN', confidence: 0.85, source: 'voice' };
  }

  // Hindi Romanized
  if (/\b(mera|naam|mujhe|hai|hoon|hu|kya|kaise|tabiyat|bukhar|dawa|madad|dhanyawad|namaste|shukriya|theek|kripya|apna|apni)\b/i.test(lower)) {
    return { language: 'hi-IN', confidence: 0.85, source: 'voice' };
  }

  // English Conversational
  if (/\b(hello|hi|hey|my\s+name\s+is|i\s+am|i'm|doctor|help|hospital|fever|pain|sick|medicine|please|yes|no|good\s+morning|good\s+evening|how\s+are\s+you)\b/i.test(lower)) {
    return { language: 'en-US', confidence: 0.85, source: 'voice' };
  }

  // 5. General English / Latin alphabet fallback
  // Strip punctuation and check if predominantly Latin letters
  const cleaned = text.replace(/[^a-zA-Z\s]/g, '').trim();
  if (cleaned.length >= 2 && /^[a-zA-Z\s]+$/.test(cleaned)) {
    return { language: 'en-US', confidence: 0.75, source: 'voice' };
  }

  return {
    language: 'unknown',
    confidence: 0,
    source: 'voice'
  };
};

/**
 * Plays a multi-lingual prompt asking the user to say their language.
 * Uses the browser's SpeechSynthesis API.
 */
export const playMultiLingualPrompt = () => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    const msg = new SpeechSynthesisUtterance("कृपया अपनी भाषा बोलें। Please say your language.");
    msg.rate = 0.9;

    msg.onend = () => resolve();
    msg.onerror = () => resolve();

    window.speechSynthesis.speak(msg);
  });
};
