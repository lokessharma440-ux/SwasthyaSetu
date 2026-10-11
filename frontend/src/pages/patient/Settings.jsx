import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Check, LogOut } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { usePatient } from '../../context/PatientContext';

const Settings = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();
  const { clearPatient, clearComplaint } = usePatient();

  const languages = [
    { code: 'hi-IN', label: 'हिन्दी (Hindi)' },
    { code: 'en-US', label: 'English' },
    { code: 'gu-IN', label: 'ગુજરાતી (Gujarati)' },
    { code: 'te-IN', label: 'తెలుగు (Telugu)' },
    { code: 'mr-IN', label: 'मराठी (Marathi)' }
  ];

  const handleLogout = () => {
    clearPatient();
    clearComplaint();
    navigate('/');
  };

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto pb-6">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2.5 bg-white rounded-2xl shadow-sm text-slate-700 hover:bg-slate-50 border border-slate-100 active:scale-95 transition-all"
          aria-label={t('back')}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">{t('language')}</h2>
          <p className="text-sm text-slate-400 mt-0.5">{t('app_language')}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          <Globe className="w-6 h-6 text-blue-500" />
          <h3 className="text-lg font-bold text-neutral-text">{t('app_language')}</h3>
        </div>

        <div className="space-y-3">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`w-full flex items-center justify-between p-4 rounded-xl border ${
                language === lang.code 
                  ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' 
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{lang.label}</span>
              {language === lang.code && <Check className="w-5 h-5 text-blue-600" />}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>{t('logout') || 'Logout'}</span>
        </button>
      </div>
    </div>
  );
};

export default Settings;