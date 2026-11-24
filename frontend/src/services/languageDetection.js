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
  // Check for explicit mention of language name in English, phonetic spellings, or native scripts

  // Marathi: मराठी, marathi, marati, marathe, maratha, maradhi, etc.
  if (/\b(marathi|marati|marathe|maratha|maradhi|marathi\s+madhe|marathi\s+bhasha|marathit)\b|मराठी/i.test(text)) {
    return { language: 'mr-IN', confidence: 1.0, source: 'voice' };
  }

  // Hindi: हिंदी, हिन्दी, hindi, hindee, hinde, inde, indie, etc.
  if (/\b(hindi|hindee|hinde|inde|indie|hindi\s+mein|hindi\s+me|hindi\s+bhasha|hindustani)\b|हिंदी|हिन्दी|हिंद|हिन्दुस्तानी/i.test(text)) {
    return { language: 'hi-IN', confidence: 1.0, source: 'voice' };
  }

  // Gujarati: ગુજરાતી, gujarati, gujrati, gujarathi, etc.
  if (/\b(gujarati|gujrati|gujarathi|gujarati\s+ma|gujarati\s+bhasha)\b|ગુજરાતી|गुजराती/i.test(text)) {
    return { language: 'gu-IN', confidence: 1.0, source: 'voice' };
  }

  // Telugu: తెలుగు, telugu, thesugu, telugulo, etc.
  if (/\b(telugu|thesugu|telugulo|telugu\s+bhasha)\b|తెలుగు|तेलुगु|तेलगू/i.test(text)) {
    return { language: 'te-IN', confidence: 1.0, source: 'voice' };
  }

  // English: english, inglis, angrezi, angreji, in english, speak english, and Devanagari transliterations
  if (/\b(english|inglis|angrezi|angreji|in\s+english|speak\s+english)\b|अंग्रेजी|अंग्रेज़ी|अंगरेजी|अँग्रेजी|अँग्रेज़ी|इंग्लिश|इंगलिश|इंगलिस|इंग्लीश|ऐंग्लिश/i.test(text)) {
    return { language: 'en-US', confidence: 1.0, source: 'voice' };
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

  // 3. Devanagari Script (Marathi vs. Hindi)
  if (/[\u0900-\u097F]/.test(text)) {
    // Check Marathi distinctive markers first
    const marathiDevanagariMarkers = /(?:माझे|नाव|आहे|नाही|मला|कसे|कशी|काय|होय|झाले|पाहिजे|ताप|औषध|नमस्कार|कसा|आहात|करा|चांगले|ळ|मदत|धन्यवाद|बरं|बरे|सांगा|हो)/;
    if (marathiDevanagariMarkers.test(text)) {
      return { language: 'mr-IN', confidence: 0.95, source: 'voice' };
    }
    // Default Devanagari to Hindi
    return { language: 'hi-IN', confidence: 0.9, source: 'voice' };
  }

  // 4. Romanized Conversational Keywords for Indian Languages
  // Marathi Romanized
  if (/\b(majhe|mazhe|maza|maze|naav|nav|mala|aahe|ahe|nahi|nahin|kasa|kashi|kase|kay|aushadh|madat|dhanyavaad|namaskar|tap|pahije|zhale|bare|aamhi)\b/i.test(lower)) {
    return { language: 'mr-IN', confidence: 0.85, source: 'voice' };
  }

  // Gujarati Romanized
  if (/\b(maru|kem\s+cho|mane|che|nathi|tav|dava|aabhar|su\s+che)\b/i.test(lower)) {
    return { language: 'gu-IN', confidence: 0.85, source: 'voice' };
  }

  // Telugu Romanized
  if (/\b(naa\s+peru|naku|undi|ledu|jwaram|mandulu|sahayam|namaskaram|dhanyavadalu|ela\s+unnaru)\b/i.test(lower)) {
    return { language: 'te-IN', confidence: 0.85, source: 'voice' };
  }

  // Hindi Romanized (Note: "name" is intentionally excluded here so "My name is" detects as English)
  if (/\b(mera|meri|mere|naam|mujhe|mujko|hai|hain|hoon|hu|kya|kaise|kaisa|tabiyat|bukhar|dawa|dawai|madad|dhanyawad|namaste|shukriya|theek|kripya|apna|apni|batao|bolo|chahiye|acha|achha|hum|humara)\b/i.test(lower)) {
    return { language: 'hi-IN', confidence: 0.85, source: 'voice' };
  }

  // 5. English Conversational Vocabulary & Common English Grammar
  const englishVocabulary = /\b(hello|hi|hey|english|doctor|help|hospital|fever|pain|sick|medicine|please|yes|no|good\s+morning|good\s+evening|how\s+are\s+you|thank\s+you|thanks|welcome|name|my\s+name|i\s+am|i'm|i\s+need|i\s+want|can\s+you|speak|talk|patient|problem|start|okay|ok)\b/i;
  const englishGrammar = /\b(the|this|that|these|those|is|am|are|was|were|have|has|had|do|does|did|will|would|can|could|should|what|where|when|why|how|who|which|you|your|we|our|they|their)\b/i;

  if (englishVocabulary.test(lower) || englishGrammar.test(lower)) {
    return { language: 'en-US', confidence: 0.85, source: 'voice' };
  }

  // Unrecognized input
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
