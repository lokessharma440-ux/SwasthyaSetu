export const mockPatient = {
  profile: {
    name: "राम कुमार",
    age: "52",
    gender: "पुरुष",
    location: "सीतापुर, उत्तर प्रदेश",
    phone: "+91 98765 43210"
  },
  advice: {
    hasNewAdvice: true,
    complaint: "मुझे पिछले तीन दिन से बुखार है और सिर में दर्द हो रहा है।",
    doctorNote: "घबराने की बात नहीं है। यह वायरल बुखार लग रहा है। आराम करें और खूब पानी पिएं।",
    medicines: [
      { name: "Paracetamol 500mg", instructions: "सुबह और शाम भोजन के बाद (3 दिन तक)" }
    ],
    followUp: "अगर 3 दिन बाद भी बुखार न उतरे तो फिर से बताएं।"
  },
  history: [
    {
      id: 1,
      date: "आज",
      type: "समस्या दर्ज",
      description: "बुखार और सिर दर्द की समस्या बताई।",
      status: "doctor_viewed" // viewed by doctor
    },
    {
      id: 2,
      date: "12 सितम्बर",
      type: "सलाह",
      description: "पेट दर्द के लिए डॉक्टर की सलाह मिली।",
      status: "completed"
    },
    {
      id: 3,
      date: "28 अगस्त",
      type: "समस्या दर्ज",
      description: "खांसी और जुकाम की समस्या बताई।",
      status: "completed"
    }
  ]
};
