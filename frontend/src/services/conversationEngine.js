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
    // Aggressive phone extract
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
    // Aggressive age extract (find any digits in the string if bounds failed due to Devanagari adjacent chars)
    const digitsOnly = transcript.match(/\d+/);
    if (digitsOnly && digitsOnly[0] >= 1 && digitsOnly[0] <= 120) {
      extracted.age = digitsOnly[0];
    }
  }

  // 3. Gender extraction
  if (/male|मेल|purush|आदमी|पुरुष|पुरूष|પુરુષ|పురుషుడు|boy|man|लड़का|मुलगा/i.test(lowerTranscript)) {
    extracted.gender = 'Male';
  } else if (/female|फीमेल|mahila|aurat|महिला|स्त्री|સ્ત્રી|మహిళ|girl|woman|लड़की|मुलगी|औरत/i.test(lowerTranscript)) {
    extracted.gender = 'Female';
  } else if (/other|anya|અન્ય|ఇతర|इतर|अन्य/i.test(lowerTranscript)) {
    extracted.gender = 'Other';
  }

  // 4. Location extraction
  let locationStr = transcript;
  const locFillers = [
    'मैं', 'रहता', 'रहती', 'हूँ', 'से', 'आया', 'गाँव', 'शहर', 'में',
    'i live in', 'from', 'village', 'city', 'my', 'is',
    'હું', 'રહું', 'છું', 'ગામ', 'શહેર', 'માંથી',
    'నేను', 'నివసిస్తున్నాను', 'గ్రామం', 'నగరం', 'నుండి',
    'मी', 'राहतो', 'राहते', 'मधून', 'आहे', 'वरून',
    'mera', 'naam', 'umar', 'saal', 'hai', 'and', 'aur', 'અને', 'మరియు', 'आणि'
  ];
  
  if (/(गांव|शहर|village|city|se hoon|रहता|रहती|ગામ|શહેર|గ్రామం|నగరం|राहतो|राहते)/i.test(lowerTranscript)) {
    let loc = transcript.replace(/(गांव|शहर|village|city|se hoon|रहता|रहती|ગામ|શહેર|గ్రామం|నగరం|राहतो|राहते)/ig, '').trim();
    extracted.location = loc.split(' ').filter(w => w.length > 2 && !locFillers.includes(w.toLowerCase())).join(' ');
  } else if (currentField === 'location') {
    // Aggressive location extract
    let loc = transcript.replace(/(मैं|रहता|रहती|हूँ|से|आया|गाँव|शहर|में|i live in|from|village|city|my|is|હું|રહું|છું|ગામ|શહેર|માંથી|నేను|నివసిస్తున్నాను|గ్రామం|నగరం|నుండి|मी|राहतो|राहते|मधून|आहे|वरून)/ig, '').trim();
    if (loc.length >= 2) {
      extracted.location = loc;
    }
  }

  // 5. Name extraction
  const complaintKeywords = ['बुखार', 'fever', 'दर्द', 'pain', 'khansi', 'cough', 'તકલીફ', 'నొప్పి', 'ताप', 'खोकला', 'वेदना'];
  if (complaintKeywords.some(k => lowerTranscript.includes(k))) {
    extracted.isComplaint = true;
  } else {
    let nameStr = transcript.replace(/(mera naam|my name is|naam hai|is|hai|હું|મારું નામ|నా పేరు|అని|माझे नाव|मेरा नाम|है|हूँ|मैं|का|की|वाला)/ig, '').trim();
    nameStr = nameStr.replace(/[\d.,]/g, '').trim();
    if (nameStr.length > 2 && nameStr.split(' ').length <= 4) {
      extracted.name = nameStr;
    } else if (currentField === 'name' && nameStr.length > 2) {
      // Aggressively accept any name string if we explicitly asked for a name and it has > 2 chars
      extracted.name = nameStr;
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
