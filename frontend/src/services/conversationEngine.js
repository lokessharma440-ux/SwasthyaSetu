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
  const phoneMatches = transcript.match(/\d/g);
  if (phoneMatches && phoneMatches.length >= 10) {
    const phoneStr = phoneMatches.join('');
    const phone = phoneStr.match(/\d{10}/);
    if (phone) {
      extracted.phone = phone[0];
    }
  } else if (currentField === 'phone') {
    const digits = transcript.replace(/\D/g, '');
    if (digits.length >= 10) {
      extracted.phone = digits.slice(0, 10);
    }
  }

  // 2. Age extraction
  const ageMatch = transcript.match(/\b([1-9][0-9]?|1[01][0-9]|120)\b/g);
  if (ageMatch) {
    for (const match of ageMatch) {
      if (match !== extracted.phone) {
        extracted.age = match;
        break;
      }
    }
  } 
  
  if (!extracted.age && currentField === 'age') {
    const digitsOnly = transcript.match(/\d+/);
    if (digitsOnly && digitsOnly[0] >= 1 && digitsOnly[0] <= 120) {
      extracted.age = digitsOnly[0];
    }
  }

  // 3. Gender extraction
  // Check Female BEFORE Male, with word boundaries (\b) for English keywords
  const femaleRegex = /\b(female|females|fe\s*male|woman|women|girl|girls)\b|फीमेल|महिला|स्त्री|स्त्रीलिंग|औरत|लड़की|लडकी|मुलगी|સ્ત્રી|મહિલા|మహిళ|స్త్రీ|mahila|aurat|ladki|mulga|nar|stree|stri|mada/i;
  const maleRegex = /\b(male|males|man|men|boy|boys|gentleman)\b|मेल|पुरुष|पुरूष|पुल्लिंग|आदमी|लड़का|लडका|मुलगा|પુરુષ|పురుషుడు|purush|aadmi|ladka|mulga|nar/i;
  const otherRegex = /\b(other|others|third\s*gender|transgender)\b|अन्य|અન્ય|ఇతర|इतर|anya/i;

  if (femaleRegex.test(lowerTranscript)) {
    extracted.gender = 'Female';
  } else if (maleRegex.test(lowerTranscript)) {
    extracted.gender = 'Male';
  } else if (otherRegex.test(lowerTranscript)) {
    extracted.gender = 'Other';
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
    if (currentField !== 'location') {
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
    return /^[6-9]?\d{9}$/.test(value.toString().replace(/\D/g, '')) || /^\d{10}$/.test(value.toString().replace(/\D/g, ''));
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
