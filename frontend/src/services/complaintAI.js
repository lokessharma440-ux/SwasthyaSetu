export const processComplaint = async (transcript) => {
  // Simulate network delay for AI processing
  await new Promise(resolve => setTimeout(resolve, 2000));

  const text = transcript.toLowerCase();

  const extracted = {
    originalStatement: transcript,
    problem: 'जानकारी स्पष्ट नहीं है',
    duration: 'जानकारी स्पष्ट नहीं है',
    additionalSymptoms: 'जानकारी स्पष्ट नहीं है',
    confidence: {
      problem: 0,
      duration: 0,
      additionalSymptoms: 0
    },
    needsConfirmation: false
  };

  // Very simple mock keyword-based extraction to simulate AI
  if (text.includes('बुखार') || text.includes('fever')) {
    extracted.problem = 'बुखार';
    extracted.confidence.problem = 0.9;
  } else if (text.includes('दर्द') && text.includes('पेट')) {
    extracted.problem = 'पेट में दर्द';
    extracted.confidence.problem = 0.9;
  } else if (text.includes('दर्द') && text.includes('सिर')) {
    extracted.problem = 'सिर में दर्द';
    extracted.confidence.problem = 0.9;
  } else if (text.includes('खांसी') || text.includes('जुकाम')) {
    extracted.problem = 'खांसी और जुकाम';
    extracted.confidence.problem = 0.9;
  } else {
    // If we can't extract a clear problem from the mock, we mark it uncertain
    extracted.needsConfirmation = true;
  }

  // Duration mock extraction
  if (text.includes('दो दिन') || text.includes('2 दिन') || text.includes('दो दिनों')) {
    extracted.duration = '2 दिन';
    extracted.confidence.duration = 0.9;
  } else if (text.includes('कल से')) {
    extracted.duration = '1 दिन';
    extracted.confidence.duration = 0.9;
  } else if (text.includes('एक हफ्ते') || text.includes('1 हफ्ते')) {
    extracted.duration = '1 हफ्ता';
    extracted.confidence.duration = 0.9;
  } else {
    extracted.needsConfirmation = true;
  }

  // Additional Symptoms mock extraction
  if (text.includes('बुखार') && text.includes('दर्द') && !text.includes('सिर') && !text.includes('पेट')) {
    extracted.additionalSymptoms = 'शरीर में दर्द';
    extracted.confidence.additionalSymptoms = 0.8;
  } else if (text.includes('उल्टी')) {
    extracted.additionalSymptoms = 'उल्टी आना';
    extracted.confidence.additionalSymptoms = 0.8;
  } else if (extracted.problem !== 'जानकारी स्पष्ट नहीं है') {
    extracted.additionalSymptoms = 'कोई नहीं';
    extracted.confidence.additionalSymptoms = 1.0;
  }

  return extracted;
};
