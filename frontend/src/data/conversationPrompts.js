export const getPrompt = (language, key, params = {}) => {
  const dictionary = {
    'hi-IN': {
      'name.ask': 'कृपया अपना नाम बताइए।',
      'name.retry1': 'अपना नाम बताइए।',
      'name.retry2': 'कृपया अपना नाम बोलें या नीचे लिखें।',
      'name.confirm': 'आपका नाम {val} है। क्या यह सही है?',
      
      'age.ask': 'आपकी उम्र क्या है?',
      'age.retry1': 'अपनी उम्र बताइए।',
      'age.retry2': 'अपनी उम्र बोलें या लिखें।',
      'age.confirm': 'आपकी उम्र {val} साल है। क्या यह सही है?',
      'age.invalid': 'कृपया अपनी सही उम्र बताइए।',
      
      'gender.ask': 'आपका लिंग क्या है? (पुरुष या महिला)',
      'gender.retry1': 'अपना लिंग बताइए।',
      'gender.retry2': 'कृपया अपना लिंग चुनें।',
      'gender.confirm': 'आपका लिंग {val} है। क्या यह सही है?',
      
      'location.ask': 'अपने गांव या शहर का नाम बताइए।',
      'location.retry1': 'आप कहाँ रहते हैं?',
      'location.retry2': 'अपने शहर का नाम बोलें या लिखें।',
      'location.confirm': 'आप {val} से हैं। क्या यह सही है?',
      
      'phone.ask': 'अपना 10 अंकों का मोबाइल नंबर बताइए।',
      'phone.retry1': 'अपना मोबाइल नंबर बोलिए।',
      'phone.retry2': 'अपना नंबर लिखें।',
      'phone.confirm': 'आपका नंबर {val} है। क्या यह सही है?',
      'phone.invalid': 'कृपया अपना 10 अंकों का मोबाइल नंबर बताइए।',
      
      'unclear': 'मुझे ठीक से सुनाई नहीं दिया। कृपया दोबारा बोलें।',
      'wrong_field': 'मुझे आपका {field} समझ नहीं आया। कृपया पहले अपना {field} बताइए।'
    },
    'en-US': {
      'name.ask': 'Please tell me your name.',
      'name.retry1': 'Tell me your name.',
      'name.retry2': 'Please say your name or type it below.',
      'name.confirm': 'Your name is {val}. Is this correct?',
      
      'age.ask': 'What is your age?',
      'age.retry1': 'Please state your age.',
      'age.retry2': 'Say or type your age.',
      'age.confirm': 'You are {val} years old. Is this correct?',
      'age.invalid': 'Please provide a valid age.',
      
      'gender.ask': 'What is your gender?',
      'gender.retry1': 'Please state your gender.',
      'gender.retry2': 'Please select your gender.',
      'gender.confirm': 'Your gender is {val}. Is this correct?',
      
      'location.ask': 'Please tell me the name of your village or city.',
      'location.retry1': 'Where do you live?',
      'location.retry2': 'Say or type your city name.',
      'location.confirm': 'You are from {val}. Is this correct?',
      
      'phone.ask': 'Please provide your 10-digit mobile number.',
      'phone.retry1': 'Tell me your mobile number.',
      'phone.retry2': 'Enter your number.',
      'phone.confirm': 'Your number is {val}. Is this correct?',
      'phone.invalid': 'Please provide a valid 10-digit mobile number.',
      
      'unclear': 'I couldn\'t hear that properly. Please speak again.',
      'wrong_field': 'I didn\'t understand your {field}. Please tell me your {field} first.'
    },
    'gu-IN': {
      'name.ask': 'કૃપા કરીને તમારું નામ કહો.',
      'name.retry1': 'તમારું નામ કહો.',
      'name.retry2': 'કૃપા કરીને તમારું નામ બોલો અથવા નીચે લખો.',
      'name.confirm': 'તમારું નામ {val} છે. શું આ સાચું છે?',
      
      'age.ask': 'તમારી ઉંમર કેટલી છે?',
      'age.retry1': 'તમારી ઉંમર કહો.',
      'age.retry2': 'ઉંમર બોલો અથવા લખો.',
      'age.confirm': 'તમારી ઉંમર {val} વર્ષ છે. શું આ સાચું છે?',
      'age.invalid': 'કૃપા કરીને તમારી સાચી ઉંમર કહો.',
      
      'gender.ask': 'તમારું લિંગ શું છે? (પુરુષ કે સ્ત્રી)',
      'gender.retry1': 'તમારું લિંગ કહો.',
      'gender.retry2': 'કૃપા કરીને તમારું લિંગ પસંદ કરો.',
      'gender.confirm': 'તમારું લિંગ {val} છે. શું આ સાચું છે?',
      
      'location.ask': 'તમારા ગામ અથવા શહેરનું નામ કહો.',
      'location.retry1': 'તમે ક્યાં રહો છો?',
      'location.retry2': 'તમારા શહેરનું નામ બોલો અથવા લખો.',
      'location.confirm': 'તમે {val} થી છો. શું આ સાચું છે?',
      
      'phone.ask': 'તમારો 10 અંકનો મોબાઇલ નંબર કહો.',
      'phone.retry1': 'તમારો મોબાઇલ નંબર બોલો.',
      'phone.retry2': 'તમારો નંબર લખો.',
      'phone.confirm': 'તમારો નંબર {val} છે. શું આ સાચું છે?',
      'phone.invalid': 'કૃપા કરીને સાચો 10 અંકનો મોબાઇલ નંબર કહો.',
      
      'unclear': 'મને બરાબર સંભળાયું નહીં. કૃપા કરીને ફરીથી કહો.',
      'wrong_field': 'મને તમારું {field} સમજાયું નહીં. કૃપા કરીને પહેલા તમારું {field} કહો.'
    },
    'te-IN': {
      'name.ask': 'దయచేసి మీ పేరు చెప్పండి.',
      'name.retry1': 'మీ పేరు చెప్పండి.',
      'name.retry2': 'దయచేసి మీ పేరు చెప్పండి లేదా క్రింద వ్రాయండి.',
      'name.confirm': 'మీ పేరు {val}. ఇది సరైనదేనా?',
      
      'age.ask': 'మీ వయస్సు ఎంత?',
      'age.retry1': 'మీ వయస్సు చెప్పండి.',
      'age.retry2': 'వయస్సు చెప్పండి లేదా టైప్ చేయండి.',
      'age.confirm': 'మీ వయస్సు {val} సంవత్సరాలు. ఇది సరైనదేనా?',
      'age.invalid': 'దయచేసి సరైన వయస్సును చెప్పండి.',
      
      'gender.ask': 'మీ లింగం ఏమిటి? (పురుషుడు లేదా స్త్రీ)',
      'gender.retry1': 'మీ లింగం చెప్పండి.',
      'gender.retry2': 'దయచేసి మీ లింగాన్ని ఎంచుకోండి.',
      'gender.confirm': 'మీ లింగం {val}. ఇది సరైనదేనా?',
      
      'location.ask': 'మీ గ్రామం లేదా నగరం పేరు చెప్పండి.',
      'location.retry1': 'మీరు ఎక్కడ నివసిస్తున్నారు?',
      'location.retry2': 'మీ నగరం పేరు చెప్పండి లేదా వ్రాయండి.',
      'location.confirm': 'మీరు {val} నుండి వచ్చారు. ఇది సరైనదేనా?',
      
      'phone.ask': 'మీ 10 అంకెల మొబైల్ నంబర్ చెప్పండి.',
      'phone.retry1': 'మీ మొబైల్ నంబర్ చెప్పండి.',
      'phone.retry2': 'మీ నంబర్ వ్రాయండి.',
      'phone.confirm': 'మీ నంబర్ {val}. ఇది సరైనదేనా?',
      'phone.invalid': 'దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ చెప్పండి.',
      
      'unclear': 'నాకు సరిగ్గా వినిపించలేదు. దయచేసి మళ్ళీ చెప్పండి.',
      'wrong_field': 'నాకు మీ {field} అర్థం కాలేదు. దయచేసి ముందు మీ {field} చెప్పండి.'
    },
    'mr-IN': {
      'name.ask': 'कृपया तुमचे नाव सांगा.',
      'name.retry1': 'तुमचे नाव सांगा.',
      'name.retry2': 'कृपया तुमचे नाव सांगा किंवा खाली लिहा.',
      'name.confirm': 'तुमचे नाव {val} आहे. हे बरोबर आहे का?',
      
      'age.ask': 'तुमचे वय काय आहे?',
      'age.retry1': 'तुमचे वय सांगा.',
      'age.retry2': 'तुमचे वय सांगा किंवा लिहा.',
      'age.confirm': 'तुमचे वय {val} वर्षे आहे. हे बरोबर आहे का?',
      'age.invalid': 'कृपया तुमचे योग्य वय सांगा.',
      
      'gender.ask': 'तुमचे लिंग काय आहे? (पुरुष किंवा महिला)',
      'gender.retry1': 'तुमचे लिंग सांगा.',
      'gender.retry2': 'कृपया तुमचे लिंग निवडा.',
      'gender.confirm': 'तुमचे लिंग {val} आहे. हे बरोबर आहे का?',
      
      'location.ask': 'तुमच्या गावाचे किंवा शहराचे नाव सांगा.',
      'location.retry1': 'तुम्ही कुठे राहता?',
      'location.retry2': 'तुमच्या शहराचे नाव सांगा किंवा लिहा.',
      'location.confirm': 'तुम्ही {val} मधून आहात. हे बरोबर आहे का?',
      
      'phone.ask': 'तुमचा 10 अंकी मोबाईल नंबर सांगा.',
      'phone.retry1': 'तुमचा मोबाईल नंबर सांगा.',
      'phone.retry2': 'तुमचा नंबर लिहा.',
      'phone.confirm': 'तुमचा नंबर {val} आहे. हे बरोबर आहे का?',
      'phone.invalid': 'कृपया तुमचा योग्य 10 अंकी मोबाईल नंबर सांगा.',
      
      'unclear': 'मला नीट ऐकू आले नाही. कृपया पुन्हा सांगा.',
      'wrong_field': 'मला तुमचे {field} समजले नाही. कृपया आधी तुमचे {field} सांगा.'
    }
  };

  let str = dictionary[language]?.[key] || dictionary['hi-IN']?.[key] || key;
  for (const [k, v] of Object.entries(params)) {
    str = str.replace(`{${k}}`, v);
  }
  return str;
};
