/**
 * Safe Demo Response Generator for SwasthyaSetu Prototype
 * 
 * IMPORTANT CONSTRAINTS:
 * 1. Prototype demonstration only.
 * 2. Rule-based keyword matching.
 * 3. NO medical diagnoses.
 * 4. NO medication prescriptions or dosages.
 * 5. Prominent disclaimer on every response.
 */

const DEMO_DISCLAIMER = "DEMO RESPONSE — NOT A REAL DOCTOR'S CONSULTATION";

const CATEGORY_RULES = [
  {
    category: 'Fever',
    keywords: [
      'fever', 'bukhar', 'bukhaar', 'tap', 'taap', 'temperature', 'tharthari', 
      'chills', 'pyrexia', 'बुखार', 'ताप', 'ठंड'
    ],
    guidance: "Your complaint regarding fever has been recorded in the prototype system. Please stay well-hydrated with clean drinking water or oral rehydration fluids, rest in a comfortable room, and monitor your body temperature with a thermometer. If your fever persists for more than 48 hours, rises above 102°F (38.9°C), or is accompanied by severe chills, rash, or breathing difficulty, seek in-person evaluation at your nearest Community Health Centre (CHC) or Primary Health Centre (PHC) immediately.",
    precautions: "Drink boiled or filtered water, get adequate bed rest, avoid heavy physical exertion, and wear lightweight, breathable clothing. Do not self-medicate with high-dose antibiotics or unprescribed medicines."
  },
  {
    category: 'Headache',
    keywords: [
      'headache', 'head ache', 'sar dard', 'sir dard', 'sar me dard', 'sir me dard', 
      'migraine', 'matha dard', 'सिर दर्द', 'सर दर्द', 'माथा दर्द'
    ],
    guidance: "Your complaint regarding headache has been recorded. Headaches can stem from dehydration, lack of sleep, eye strain, or blood pressure changes. Rest in a quiet, dimly lit room and ensure you are drinking sufficient water. Note that specific causes cannot be diagnosed by this automated system. If you experience sudden 'thunderclap' severe pain, stiff neck, high fever, blurry vision, or vomiting, visit an emergency medical facility immediately.",
    precautions: "Avoid prolonged screen exposure, bright flashing lights, and loud noises. Maintain regular meal times and proper hydration. Avoid taking repetitive over-the-counter painkillers without professional consultation."
  },
  {
    category: 'Cough or Cold',
    keywords: [
      'cough', 'cold', 'khasi', 'khaansi', 'zukham', 'jukham', 'nazla', 'sardi', 
      'sore throat', 'gala', 'sneezing', 'runny nose', 'congestion', 'खांसी', 'जुकाम', 'सर्दी', 'गला खराब'
    ],
    guidance: "Your complaint regarding cough and cold symptoms has been recorded. This is a non-diagnostic acknowledgement. Ensure adequate warm fluid intake, steam inhalation, and proper rest. Your symptoms and their severity should be assessed by a qualified healthcare professional. If you experience shortness of breath, chest pain, wheezing, coughing up blood, or symptoms lasting over 2 weeks, consult a physician promptly.",
    precautions: "Drink warm water or herbal decoction, practice respiratory hygiene by covering your mouth when coughing, avoid cold beverages and dusty environments, and wash hands frequently."
  },
  {
    category: 'General Discomfort',
    keywords: [
      'weakness', 'fatigue', 'thakan', 'thaka', 'chakkar', 'dizziness', 'kamzori', 
      'kamjori', 'pain', 'body pain', 'dard', 'badan dard', 'ache', 'थकान', 'कमजोरी', 'दर्द', 'बदन दर्द', 'चक्कर'
    ],
    guidance: "Your complaint regarding general discomfort or body ache has been noted. Please get adequate rest, stay hydrated with electrolyte-rich fluids, and consume light, easily digestible, nutritious meals. If you feel sudden weakness on one side of the body, difficulty speaking, fainting, or chest tightness, contact emergency medical services right away.",
    precautions: "Avoid strenuous physical labor while feeling fatigued. Rest in a well-ventilated space, maintain regular sleep patterns, and avoid skipping meals."
  }
];

const DEFAULT_RESPONSE = {
  category: 'Other / Unrecognized',
  guidance: "Your healthcare complaint has been successfully received and placed in the review queue for your assigned doctor. While waiting for clinical review, please monitor your symptoms closely. If you develop any sudden or worsening symptoms, please visit your nearest healthcare facility or call the national emergency helpline (108).",
  precautions: "Keep a written log of your symptoms and note any changes. Do not consume unverified medications without consulting a qualified medical practitioner."
};

/**
 * Generates a safe prototype demo response from complaint text and problem fields.
 * NEVER generates medication prescriptions or dosages.
 */
const generateSafeDemoResponse = (problemText = '', originalStatement = '', additionalSymptoms = '') => {
  const combined = `${problemText} ${originalStatement} ${additionalSymptoms}`.toLowerCase();

  let matched = null;
  for (const rule of CATEGORY_RULES) {
    const hasMatch = rule.keywords.some(kw => combined.includes(kw.toLowerCase()));
    if (hasMatch) {
      matched = rule;
      break;
    }
  }

  const selected = matched || DEFAULT_RESPONSE;

  return {
    category: selected.category,
    guidance: selected.guidance,
    precautions: selected.precautions,
    medicines: '', // STRICT RULE: No medication or dosages generated by prototype
    disclaimer: DEMO_DISCLAIMER,
    responseType: 'DEMO_AUTO',
    generatedAt: new Date()
  };
};

module.exports = {
  DEMO_DISCLAIMER,
  generateSafeDemoResponse
};
