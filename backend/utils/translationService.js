// backend/utils/translationService.js
// Automatic bidirectional translation service for SwasthyaSetu
// - Patient to Doctor: Any Indian/supported language -> English
// - Doctor to Patient: English -> Patient's original language

const LANGUAGE_NAMES = {
  'hi': 'Hindi (हिन्दी)',
  'hi-in': 'Hindi (हिन्दी)',
  'en': 'English',
  'en-us': 'English',
  'gu': 'Gujarati (ગુજરાતી)',
  'gu-in': 'Gujarati (ગુજરાતી)',
  'te': 'Telugu (తెలుగు)',
  'te-in': 'Telugu (తెలుగు)',
  'mr': 'Marathi (मराठी)',
  'mr-in': 'Marathi (मराठी)',
  'ta': 'Tamil (தமிழ்)',
  'ta-in': 'Tamil (தமிழ்)',
  'bn': 'Bengali (বাংলা)',
  'bn-in': 'Bengali (বাংলা)',
  'kn': 'Kannada (ಕನ್ನಡ)',
  'kn-in': 'Kannada (ಕನ್ನಡ)',
  'ml': 'Malayalam (മലയാളം)',
  'ml-in': 'Malayalam (മലയാളം)',
  'pa': 'Punjabi (ਪੰਜਾਬੀ)',
  'pa-in': 'Punjabi (ਪੰਜਾਬੀ)',
  'or': 'Odia (ଓଡ଼ିଆ)',
  'or-in': 'Odia (ଓଡ଼ିଆ)'
};

/**
 * Normalizes language codes like 'hi-IN' or 'hi' to standard 2-letter code 'hi'
 */
function normalizeLangCode(code) {
  if (!code) return 'en';
  const clean = code.split('-')[0].trim().toLowerCase();
  return clean || 'en';
}

/**
 * Get human-readable language label
 */
function getLanguageLabel(code) {
  if (!code) return 'English';
  const norm = normalizeLangCode(code);
  return LANGUAGE_NAMES[norm] || code;
}

/**
 * Translates a given text string using Google Translate public endpoint with fallback.
 * @param {string} text - text to translate
 * @param {string} targetLang - target language code (e.g. 'en', 'hi', 'te')
 * @param {string} sourceLang - source language code ('auto' or specific code)
 * @returns {Promise<string>}
 */
async function translateText(text, targetLang = 'en', sourceLang = 'auto') {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return '';
  }

  const tl = normalizeLangCode(targetLang);
  const sl = sourceLang === 'auto' ? 'auto' : normalizeLangCode(sourceLang);

  // If source and target are the same, return as is
  if (sl !== 'auto' && sl === tl) {
    return text;
  }

  // Attempt 1: Google Translate single endpoint
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text.trim())}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data[0])) {
        const translated = data[0].map(chunk => chunk[0]).filter(Boolean).join('');
        if (translated && translated.trim()) {
          return translated.trim();
        }
      }
    }
  } catch (err) {
    console.warn(`[TranslationService] Primary Google translate error (${sl}->${tl}):`, err.message);
  }

  // Attempt 2: MyMemory Translation API fallback
  try {
    const fromPair = sl === 'auto' ? 'en' : sl;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.trim())}&langpair=${fromPair}|${tl}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.responseData && data.responseData.translatedText) {
        const translated = data.responseData.translatedText;
        if (translated && !translated.includes('MYMEMORY WARNING')) {
          return translated.trim();
        }
      }
    }
  } catch (err) {
    console.warn(`[TranslationService] MyMemory fallback error:`, err.message);
  }

  // Safe fallback: return original text if translation services cannot be reached
  return text;
}

/**
 * Translates any patient complaint text into English
 */
async function translateToEnglish(text, sourceLang = 'auto') {
  const norm = normalizeLangCode(sourceLang);
  if (norm === 'en') return text;
  return translateText(text, 'en', sourceLang);
}

/**
 * Translates English text into the patient's language
 */
async function translateFromEnglish(text, targetLang) {
  const norm = normalizeLangCode(targetLang);
  if (norm === 'en') return text;
  return translateText(text, targetLang, 'en');
}

/**
 * Translates an entire complaint bundle from patient language to English
 */
async function translateComplaintToEnglish({ problem, originalStatement, duration, additionalSymptoms, language }) {
  const lang = normalizeLangCode(language);
  
  // If already English, no translation needed
  if (lang === 'en') {
    return {
      problemEnglish: problem || originalStatement || '',
      originalStatementEnglish: originalStatement || problem || '',
      durationEnglish: duration || '',
      additionalSymptomsEnglish: additionalSymptoms || '',
      sourceLanguage: language || 'en'
    };
  }

  const [problemEnglish, originalStatementEnglish, durationEnglish, additionalSymptomsEnglish] = await Promise.all([
    translateToEnglish(problem || originalStatement || '', language),
    translateToEnglish(originalStatement || problem || '', language),
    duration ? translateToEnglish(duration, language) : Promise.resolve(''),
    additionalSymptoms ? translateToEnglish(additionalSymptoms, language) : Promise.resolve('')
  ]);

  return {
    problemEnglish: problemEnglish || problem,
    originalStatementEnglish: originalStatementEnglish || originalStatement,
    durationEnglish: durationEnglish || duration,
    additionalSymptomsEnglish: additionalSymptomsEnglish || additionalSymptoms,
    sourceLanguage: language || 'auto'
  };
}

/**
 * Translates doctor's English response bundle into the patient's original language
 */
async function translateDoctorResponseToPatient({ guidance, precautions, medicines }, targetLang) {
  const lang = normalizeLangCode(targetLang);

  if (lang === 'en') {
    return {
      guidanceTranslated: guidance || '',
      precautionsTranslated: precautions || '',
      medicinesTranslated: medicines || '',
      targetLanguage: targetLang || 'en'
    };
  }

  const [guidanceTranslated, precautionsTranslated, medicinesTranslated] = await Promise.all([
    guidance ? translateFromEnglish(guidance, targetLang) : Promise.resolve(''),
    precautions ? translateFromEnglish(precautions, targetLang) : Promise.resolve(''),
    medicines ? translateFromEnglish(medicines, targetLang) : Promise.resolve('')
  ]);

  return {
    guidanceTranslated: guidanceTranslated || guidance,
    precautionsTranslated: precautionsTranslated || precautions,
    medicinesTranslated: medicinesTranslated || medicines,
    targetLanguage: targetLang
  };
}

module.exports = {
  translateText,
  translateToEnglish,
  translateFromEnglish,
  translateComplaintToEnglish,
  translateDoctorResponseToPatient,
  normalizeLangCode,
  getLanguageLabel
};
