export const processComplaint = async (transcript, language = 'hi-IN') => {
  // Simulate network delay for AI processing
  await new Promise(resolve => setTimeout(resolve, 2000));

  const text = transcript.toLowerCase();

  // Localized defaults
  const defaults = {
    'en-US': { 
      unclear: 'Not specified', 
      none: 'None', 
      fever: 'Fever', 
      stomachPain: 'Stomach pain', 
      headache: 'Headache', 
      coldCough: 'Cough and cold', 
      days2: '2 days', 
      days1: '1 day', 
      week1: '1 week', 
      bodyPain: 'Body pain', 
      vomiting: 'Vomiting' 
    },
    'gu-IN': { 
      unclear: 'માહિતી સ્પષ્ટ નથી', 
      none: 'કોઈ નહીં', 
      fever: 'તાવ', 
      stomachPain: 'પેટમાં દુખાવો', 
      headache: 'માથાનો દુખાવો', 
      coldCough: 'ખાંસી અને શરદી', 
      days2: '2 દિવસ', 
      days1: '1 દિવસ', 
      week1: '1 અઠવાડિયું', 
      bodyPain: 'શરીરમાં દુખાવો', 
      vomiting: 'ઉલટી' 
    },
    'te-IN': { 
      unclear: 'సమాచారం స్పష్టంగా లేదు', 
      none: 'ఏమీ లేదు', 
      fever: 'జ్వరం', 
      stomachPain: 'కడుపు నొప్పి', 
      headache: 'తలనొప్పి', 
      coldCough: 'దగ్గు మరియు జలుబు', 
      days2: '2 రోజులు', 
      days1: '1 రోజు', 
      week1: '1 వారం', 
      bodyPain: 'శరీర నొప్పులు', 
      vomiting: 'వాంతులు' 
    },
    'mr-IN': { 
      unclear: 'माहिती स्पष्ट नाही', 
      none: 'काही नाही', 
      fever: 'ताप', 
      stomachPain: 'पोटदुखी', 
      headache: 'डोकेदुखी', 
      coldCough: 'खोकला आणि सर्दी', 
      days2: '2 दिवस', 
      days1: '1 दिवस', 
      week1: '1 आठवडा', 
      bodyPain: 'अंगदुखी', 
      vomiting: 'उलटी' 
    },
    'hi-IN': { 
      unclear: 'जानकारी स्पष्ट नहीं है', 
      none: 'कोई नहीं', 
      fever: 'बुखार', 
      stomachPain: 'पेट में दर्द', 
      headache: 'सिर में दर्द', 
      coldCough: 'खांसी और जुकाम', 
      days2: '2 दिन', 
      days1: '1 दिन', 
      week1: '1 हफ्ता', 
      bodyPain: 'शरीर में दर्द', 
      vomiting: 'उल्टी आना' 
    }
  };

  const d = defaults[language] || (language.startsWith('en') ? defaults['en-US'] : defaults['hi-IN']);

  const extracted = {
    originalStatement: transcript,
    problem: d.unclear,
    duration: d.unclear,
    additionalSymptoms: d.unclear,
    confidence: {
      problem: 0,
      duration: 0,
      additionalSymptoms: 0
    },
    needsConfirmation: false
  };

  // Keyword extraction across multilingual terms
  if (/बुखार|fever|તાવ|జ్వరం|ताप/i.test(text)) {
    extracted.problem = d.fever;
    extracted.confidence.problem = 0.9;
  } else if (/पेट.*दर्द|stomach.*pain|stomachache|belly.*pain|પેટ.*દુખાવો|కడుపు.*నొప్పి|पोटदुखी|पोटात.*दुखणे/i.test(text)) {
    extracted.problem = d.stomachPain;
    extracted.confidence.problem = 0.9;
  } else if (/सिर.*दर्द|headache|head.*pain|માથાનો.*દુખાવો|తలనొప్పి|डोकेदुखी|डोके.*दुखणे/i.test(text)) {
    extracted.problem = d.headache;
    extracted.confidence.problem = 0.9;
  } else if (/खांसी|जुकाम|cough|cold|ખાંસી|શરદી|దగ్గు|జలుబు|खोकला|सर्दी/i.test(text)) {
    extracted.problem = d.coldCough;
    extracted.confidence.problem = 0.9;
  } else {
    extracted.needsConfirmation = true;
  }

  // Duration
  if (/दो दिन|2 दिन|2 days|two days|૨ દિવસ|2 દિવસ|2 రోజులు|రెండు రోజులు|2 दिवस|दोन दिवस/i.test(text)) {
    extracted.duration = d.days2;
    extracted.confidence.duration = 0.9;
  } else if (/कल से|1 दिन|1 day|since yesterday|yesterday|ગઈકાલથી|1 દિવસ|నిన్నటి నుండి|1 రోజు|कालपासून|1 दिवस/i.test(text)) {
    extracted.duration = d.days1;
    extracted.confidence.duration = 0.9;
  } else if (/एक हफ्ते|1 हफ्ते|1 week|one week|1 અઠવાડિયું|1 వారం|1 आठवडा/i.test(text)) {
    extracted.duration = d.week1;
    extracted.confidence.duration = 0.9;
  } else {
    extracted.needsConfirmation = true;
  }

  // Additional Symptoms
  if (/body.*pain|शरीर.*दर्द|અંગ.*દુખાવો|శరీర.*నొప్పులు|अंगदुखी/i.test(text)) {
    extracted.additionalSymptoms = d.bodyPain;
    extracted.confidence.additionalSymptoms = 0.8;
  } else if (/उल्टी|vomit|vomiting|ઉલટી|వాంతులు/i.test(text)) {
    extracted.additionalSymptoms = d.vomiting;
    extracted.confidence.additionalSymptoms = 0.8;
  } else if (extracted.problem !== d.unclear) {
    extracted.additionalSymptoms = d.none;
    extracted.confidence.additionalSymptoms = 1.0;
  }

  return extracted;
};
