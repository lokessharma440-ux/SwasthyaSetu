import React, { createContext, useState, useContext, useEffect } from 'react';
import { dictionary } from './translations';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    let lang = localStorage.getItem('swasthya_setu_language');
    if (!lang) return 'hi-IN';
    if (lang === 'hi') return 'hi-IN';
    if (lang === 'en') return 'en-US';
    if (lang === 'gu') return 'gu-IN';
    if (lang === 'te') return 'te-IN';
    return lang;
  });

  useEffect(() => {
    localStorage.setItem('swasthya_setu_language', language);
  }, [language]);

  const t = (key, params = {}) => {
    let str = dictionary[language]?.[key] || dictionary['en-US']?.[key] || dictionary['hi-IN']?.[key] || key;
    if (params && typeof params === 'object') {
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      }
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
