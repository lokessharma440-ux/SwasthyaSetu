// Map of Indian language words and English number words to standard digits
const NUMBER_WORDS = {
  // 2-digit Hindi numbers (99 down to 10)
  'निन्यानवे': '99', 'निन्यानबे': '99',
  'अट्ठानवे': '98', 'अठानवे': '98', 'अट्ठानबे': '98',
  'संतानवे': '97', 'सत्तानवे': '97', 'सत्तानबे': '97',
  'छियानवे': '96', 'छियानबे': '96',
  'पचानवे': '95', 'पचानबे': '95',
  'चौरानवे': '94', 'चौरानबे': '94',
  'तिरानवे': '93', 'तिरानबे': '93',
  'बानवे': '92', 'ब्यानवे': '92', 'बानबे': '92',
  'इक्यानवे': '91', 'एक्यानवे': '91', 'इक्यानबे': '91',
  'नब्बे': '90', 'नब्बे': '90',
  'नवासी': '89',
  'अट्ठासी': '88', 'अठासी': '88',
  'सत्तासी': '87',
  'छियासी': '86',
  'पचासी': '85',
  'चौरासी': '84',
  'तिरासी': '83',
  'बयासी': '82',
  'इक्यासी': '81',
  'अस्सी': '80',
  'उनासी': '79', 'उन्नासी': '79',
  'अठहत्तर': '78',
  'सतहत्तर': '77',
  'छिहत्तर': '76', 'छहत्तर': '76',
  'पचहत्तर': '75',
  'चौहत्तर': '74',
  'तिहत्तर': '73',
  'बहत्तर': '72', 'बाहत्तर': '72',
  'इकहत्तर': '71',
  'सत्तर': '70',
  'उनहत्तर': '69',
  'अड़सठ': '68', 'अड़सठ': '68',
  'सरसठ': '67',
  'छियासठ': '66',
  'पैंसठ': '65',
  'चौंसठ': '64',
  'तिरसठ': '63', 'त्रेसठ': '63',
  'बासठ': '62',
  'इकसठ': '61',
  'साठ': '60',
  'उनसठ': '59',
  'अट्ठावन': '58', 'अठावन': '58',
  'सत्तावन': '57',
  'छप्पन': '56',
  'पचपन': '55', 'बचपन': '55',
  'चौवन': '54',
  'तिरपन': '53', 'तिरेपन': '53',
  'बावन': '52',
  'इक्यावन': '51',
  'पचास': '50',
  'उनचास': '49',
  'अड़तालीस': '48', 'अड़तालीस': '48',
  'सैंतालीस': '47',
  'छियालीस': '46',
  'पैंतालीस': '45',
  'चवालीस': '44', 'चौवालीस': '44',
  'तैंतालीस': '43',
  'बयालीस': '42', 'ब्यालीस': '42',
  'इकतालीस': '41',
  'चालीस': '40',
  'उनतालीस': '39', 'उनचालीस': '39',
  'अड़तीस': '38', 'अड़तीस': '38',
  'सैंतीस': '37',
  'छत्तीस': '36',
  'पैंतीस': '35',
  'चौंतीस': '34',
  'तैंतीस': '33',
  'बत्तीस': '32',
  'इकत्तीस': '31',
  'तीस': '30',
  'उनतीस': '29', 'उन्नतीस': '29',
  'अट्ठाईस': '28', 'अट्ठाइस': '28',
  'सत्ताईस': '27', 'सत्ताइस': '27',
  'छब्बीस': '26',
  'पच्चीस': '25',
  'चौबीस': '24',
  'तेईस': '23', 'तेइस': '23',
  'बाईस': '22', 'बाइस': '22',
  'इक्कीस': '21',
  'बीस': '20',
  'उन्नीस': '19',
  'अठारह': '18',
  'सत्रह': '17',
  'सोलह': '16',
  'पंद्रह': '15', 'पन्द्रह': '15',
  'चौदह': '14',
  'तेरह': '13',
  'बारह': '12',
  'ग्यारह': '11',
  'दस': '10',

  // Single digits across Hindi, Marathi, Gujarati, Telugu, English
  'शून्य': '0', 'जीरो': '0', 'झिरो': '0', 'zero': '0', 'oh': '0', 'सुन्ना': '0', 'సున్నా': '0', 'શૂન્ય': '0', 'ઝીરો': '0',
  'एक': '1', 'one': '1', 'એક': '1', 'ఒకటి': '1',
  'दो': '2', 'two': '2', 'दोन': '2', 'બે': '2', 'రెండు': '2',
  'तीन': '3', 'three': '3', 'ત્રણ': '3', 'మూడు': '3',
  'चार': '4', 'four': '4', 'ચાર': '4', 'నాలుగు': '4',
  'पांच': '5', 'पाँच': '5', 'five': '5', 'पाच': '5', 'પાંચ': '5', 'ఐదు': '5',
  'छह': '6', 'छः': '6', 'छ': '6', 'six': '6', 'सहा': '6', 'છ': '6', 'ఆరు': '6',
  'सात': '7', 'seven': '7', 'સાત': '7', 'ఏడు': '7',
  'आठ': '8', 'eight': '8', 'આઠ': '8', 'ఎనిమిది': '8',
  'नौ': '9', 'nine': '9', 'नऊ': '9', 'નવ': '9', 'తొమ్మిది': '9'
};

const INDIC_NUMERALS = {
  // Devanagari ०-९
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  // Gujarati ૦-૯
  '૦': '0', '૧': '1', '૨': '2', '૩': '3', '૪': '4',
  '૫': '5', '૬': '6', '૭': '7', '૮': '8', '૯': '9',
  // Telugu ౦-౯
  '౦': '0', '౧': '1', '౨': '2', '౩': '3', '౪': '4',
  '౫': '5', '౬': '6', '౭': '7', '౮': '8', '౯': '9'
};

/**
 * Normalizes spoken numbers, Indic digits, and multipliers into standard numeric digits
 */
export const normalizeNumbers = (text) => {
  if (!text) return '';
  let str = text;

  // 1. Convert Indic numerals to ASCII 0-9
  str = str.replace(/[०-९૦-૯౦-౯]/g, d => INDIC_NUMERALS[d] || d);

  // 2. Handle English spoken multipliers e.g. "double nine", "triple five"
  str = str.replace(/\bdouble\s+([0-9]|zero|one|two|three|four|five|six|seven|eight|nine)\b/gi, (m, digit) => {
    return `${digit} ${digit}`;
  });
  str = str.replace(/\btriple\s+([0-9]|zero|one|two|three|four|five|six|seven|eight|nine)\b/gi, (m, digit) => {
    return `${digit} ${digit} ${digit}`;
  });

  // 3. Convert number words (longer keys first to prevent partial replacements)
  const keys = Object.keys(NUMBER_WORDS).sort((a, b) => b.length - a.length);
  for (const word of keys) {
    const val = NUMBER_WORDS[word];
    if (/^[a-zA-Z]+$/.test(word)) {
      const reg = new RegExp(`\\b${word}\\b`, 'gi');
      str = str.replace(reg, ` ${val} `);
    } else {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const reg = new RegExp(`(^|[^\\u0900-\\u097F\\u0A80-\\u0AFF\\u0C00-\\u0C7F])${escaped}(?=[^\\u0900-\\u097F\\u0A80-\\u0AFF\\u0C00-\\u0C7F]|$)`, 'gu');
      str = str.replace(reg, `$1 ${val} `);
    }
  }

  return str;
};

const extractPhoneNumber = (transcript, currentField) => {
  if (!transcript) return null;

  // Normalize words and Indic numerals into digits
  const normalized = normalizeNumbers(transcript);

  // Extract all digit characters
  const digits = normalized.replace(/\D/g, '');

  if (!digits || digits.length < 10) {
    return null;
  }

  // 1. 12 digits starting with country code 91 followed by Indian mobile (6-9)
  if (digits.length === 12 && digits.startsWith('91') && /^[6-9]/.test(digits.slice(2))) {
    return digits.slice(2);
  }

  // 2. 11 digits starting with leading trunk 0 followed by Indian mobile (6-9)
  if (digits.length === 11 && digits.startsWith('0') && /^[6-9]/.test(digits.slice(1))) {
    return digits.slice(1);
  }

  // 3. Exactly 10 digits
  if (digits.length === 10) {
    return digits;
  }

  // 4. If more than 10 digits, locate standard Indian 10-digit mobile sequence [6-9]\d{9}
  const indianMobileMatch = digits.match(/[6-9]\d{9}/);
  if (indianMobileMatch) {
    return indianMobileMatch[0];
  }

  // 5. Fallback if currentField is explicitly 'phone' and at least 10 digits exist
  if (currentField === 'phone') {
    return digits.slice(0, 10);
  }

  return null;
};

const titleCase = (str) => {
  if (!str) return '';
  if (/[a-zA-Z]/.test(str)) {
    return str
      .toLowerCase()
      .split(/\s+/)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
      .trim();
  }
  return str.trim();
};

const cleanName = (raw) => {
  if (!raw) return null;
  let text = raw.trim();

  // Strip common conversational introductory prefixes
  text = text
    .replace(/\b(?:my\s+name\s+is|my\s+name's|my\s+name|i\s+am|i'm|im|this\s+is|call\s+me|name\s+is)\b/gi, ' ')
    .replace(/(?:^|\s+)(?:मेरा\s+नाम|हमारा\s+नाम|नाम\s+है|नाम|माझे\s+नाव|મારું\s+નામ|મારુ\s+નામ|నా\s+పేరు|నా\s+పేరు\s+వచ్చి)(?:\s+है|\s+आहे|\s+છે)?(?:\s+|$)/gi, ' ')
    .replace(/(?:^|\s+)(?:मैं|હું|నేను)\s+/gi, ' ');

  // Strip common conversational suffixes (end of phrase particles)
  text = text
    .replace(/\b(?:speaking|here|please)\b/gi, ' ')
    .replace(/(?:\s+(?:है|हूँ|हू|जी|साहब|साहेब|आहे|છે|છું|అని|గారు))+\s*$/gi, '')
    .replace(/\s+(?:is)\s*$/gi, '');

  // Remove punctuation and digits from name
  text = text.replace(/[\d.,\/#!$%\^&\*;:{}=\-_`~()?"'।]/g, ' ');
  text = text.replace(/\s+/g, ' ').trim();

  // If there's location info trailing in the name string, strip it from name
  text = text.replace(/(?:^|\s+)(?:गा[ँं]व|गांव|गाव|ग्राम|शहर|district|village|city|se\s+hoon|from).*$/i, '').trim();

  if (text.length >= 2 && text.split(' ').length <= 5) {
    return titleCase(text);
  }
  return null;
};

const cleanLocation = (raw) => {
  if (!raw) return null;
  let text = raw.trim();

  // Strip conversational location prefixes
  text = text
    .replace(/\b(?:my\s+village\s+is|village\s+name\s+is|village\s+is|my\s+city\s+is|city\s+is|i\s+live\s+in|i'm\s+from|im\s+from|i\s+am\s+from|living\s+in|from\s+the\s+village\s+of|from\s+village|from)\b/gi, ' ')
    .replace(/(?:^|\s+)(?:मेरा\s+गा[ँं]व|हमारा\s+गा[ँं]व|गा[ँं]व\s+का\s+नाम|गा[ँं]व\s+है|गा[ँं]व|मेरा\s+शहर|शहर\s+का\s+नाम|शहर|ग्राम\s+का\s+नाम|ग्राम|कस्बा|जिला|तहसील|माझे\s+गाव|गाव|મારું\s+ગામ|મારુ\s+ગામ|ગામ|నా\s+గ్రామం|గ్రామం|నగరం)(?:\s*(?:का\s+नाम|है|का|છે|आहे))?(?:\s+|$)/gi, ' ');

  // Strip conversational suffixes (residence markers, postpositions)
  text = text
    .replace(/(?:\s+(?:का\s+रहने\s+वाला|की\s+रहने\s+वाली|के\s+रहने\s+वाले|रहता\s+हूँ|रहती\s+हूँ|रहते\s+हैं|रहता\s+हू|रहती\s+हू|से\s+हूँ|से\s+हू|का\s+हूँ|की\s+हूँ|रहता|रहती|से|में|है|हूँ|हू|છે|છું|માંથી|राहतो|राहते|आहे|वरून|నివసిస్తున్నాను|నుండి))+\s*$/gi, '')
    .replace(/\b(?:village|city|town|resident)\s*$/gi, '');

  // Strip standalone leftover grammatical particles if at boundary
  text = text.replace(/^(?:का\s+नाम|का|की|के|में|से)\s+/gi, '');

  // Remove punctuation and digits
  text = text.replace(/[\d.,\/#!$%\^&\*;:{}=\-_`~()?"'।]/g, ' ');
  text = text.replace(/\s+/g, ' ').trim();

  if (text.length >= 2) {
    return titleCase(text);
  }
  return null;
};

export const extractInformation = (transcript, currentField = null) => {
  if (!transcript || transcript.trim() === '') return { extracted: {} };

  const extracted = {};
  const lowerTranscript = transcript.toLowerCase();

  // 1. Phone extraction
  const hasExplicitPhoneKeyword = /(?:फोन|फ़ोन|मोबाइल|नंबर|नम्बर|phone|mobile|contact|cell|నంబర్|నెంబర్|નંબર)/i.test(transcript);
  if (currentField === 'phone' || hasExplicitPhoneKeyword) {
    const phone = extractPhoneNumber(transcript, currentField);
    if (phone) {
      extracted.phone = phone;
    }
  } else {
    // Check if transcript contains an explicit 10+ digit sequence
    const phone = extractPhoneNumber(transcript, currentField);
    if (phone) {
      extracted.phone = phone;
    }
  }

  // 2. Age extraction
  // CRITICAL RULE: Never extract age when currentField is 'phone' or 'name' or 'location'
  // unless an explicit age marker ("saal", "years", "umar", "साल", "वर्ष", "वय", "उम्र") is used
  const hasExplicitAgeKeyword = /(?:साल|वर्ष|उम्र|वय|વર્ષ|సంవత్సరాల|years?\s+old|age\s+is|\bage\b)/i.test(transcript);
  
  if (currentField === 'age' || (hasExplicitAgeKeyword && currentField !== 'phone' && currentField !== 'name' && currentField !== 'location')) {
    const normalizedForAge = normalizeNumbers(transcript);
    const ageMatch = normalizedForAge.match(/\b([1-9][0-9]?|1[01][0-9]|120)\b/g);
    if (ageMatch) {
      for (const match of ageMatch) {
        if (!extracted.phone || !extracted.phone.includes(match)) {
          extracted.age = match;
          break;
        }
      }
    } 
    
    if (!extracted.age && currentField === 'age') {
      const digitsOnly = normalizedForAge.match(/\d+/);
      if (digitsOnly && digitsOnly[0] >= 1 && digitsOnly[0] <= 120) {
        extracted.age = digitsOnly[0];
      }
    }
  }

  // 3. Gender extraction
  // Only extract gender if at gender step or unguided prompt, preventing accidental matches on names
  const femaleRegex = /\b(female|females|fe\s*male|woman|women|girl|girls)\b|फीमेल|महिला|स्त्री|स्त्रीलिंग|औरत|लड़की|लडकी|मुलगी|સ્ત્રી|મહિલા|మహిళ|స్త్రీ|mahila|aurat|ladki|mulga|nar|stree|stri|mada/i;
  const maleRegex = /\b(male|males|man|men|boy|boys|gentleman)\b|मेल|पुरुष|पुरूष|पुल्लिंग|आदमी|लड़का|लडका|मुलगा|પુરુષ|పురుషుడు|purush|aadmi|ladka|mulga|nar/i;
  const otherRegex = /\b(other|others|third\s*gender|transgender)\b|अन्य|અન્ય|ఇతర|इतर|anya/i;

  if (currentField === 'gender' || (currentField === null && !extracted.phone)) {
    if (femaleRegex.test(lowerTranscript)) {
      extracted.gender = 'Female';
    } else if (maleRegex.test(lowerTranscript)) {
      extracted.gender = 'Male';
    } else if (otherRegex.test(lowerTranscript)) {
      extracted.gender = 'Other';
    }
  }

  // Check for medical complaint keywords
  const complaintKeywords = ['बुखार', 'fever', 'दर्द', 'pain', 'khansi', 'cough', 'तकलीफ', 'તકલીફ', 'నొప్పి', 'ताप', 'खोकला', 'वेदना'];
  if (complaintKeywords.some(k => lowerTranscript.includes(k))) {
    extracted.isComplaint = true;
    return { extracted };
  }

  // 4. Location extraction
  const hasExplicitLocationKeyword = /(?:गा[ँं]व|गांव|गाव|शहर|ग्राम|कस्बा|जिला|तहसील|village|city|town|district|se hoon|रहता|रहती|ગામ|શહેર|గ్రామం|నగరం|राहतो|राहते|live in|living in)/i.test(lowerTranscript);

  if (currentField === 'location') {
    const loc = cleanLocation(transcript);
    if (loc) {
      extracted.location = loc;
    }
  } else if (hasExplicitLocationKeyword && currentField !== 'name' && currentField !== 'phone' && currentField !== 'age' && currentField !== 'gender') {
    const loc = cleanLocation(transcript);
    if (loc) {
      extracted.location = loc;
    }
  } else if (hasExplicitLocationKeyword && currentField === 'name') {
    // If speaking both name and location at name prompt (e.g. "मेरा नाम लोकेश है गांव रामपुर")
    const match = transcript.match(/(?:गा[ँं]व|गांव|गाव|शहर|ग्राम|village|city)\s+(.+)$/i);
    if (match && match[1]) {
      const loc = cleanLocation(match[1]);
      if (loc) extracted.location = loc;
    }
  }

  // 5. Name extraction
  // CRITICAL RULE: Never extract name if currentField is 'location', 'phone', 'age', or 'gender'
  // unless there is an explicit name introductory phrase ("mera naam...", "my name is...")
  const hasExplicitNamePhrase = /\b(my name is|my name's|i am|i'm|name is)\b|मेरा नाम|हमारा नाम|नाम है|माझे नाव|મારું નામ|મારુ નામ|నా పేరు/i.test(transcript);

  if (currentField === 'name' || hasExplicitNamePhrase) {
    if (currentField !== 'location' && currentField !== 'phone' && currentField !== 'age') {
      const name = cleanName(transcript);
      if (name) {
        extracted.name = name;
      }
    }
  }

  return { extracted };
};

export const validateField = (field, value) => {
  if (!value) return false;
  
  if (field === 'age') {
    const age = parseInt(value, 10);
    return !isNaN(age) && age >= 1 && age <= 120;
  }
  if (field === 'phone') {
    const digits = value.toString().replace(/\D/g, '');
    return digits.length === 10;
  }
  if (field === 'gender') {
    return ['Male', 'Female', 'Other'].includes(value);
  }
  if (field === 'name') {
    return value.trim().length >= 2;
  }
  if (field === 'location') {
    return value.trim().length >= 2;
  }
  return false;
};
