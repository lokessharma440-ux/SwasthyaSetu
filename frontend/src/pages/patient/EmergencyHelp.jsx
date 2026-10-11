import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, PhoneCall } from 'lucide-react';
import Button from '../../components/Button';
import { useLanguage } from '../../context/LanguageContext';

const EmergencyHelp = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleCallAmbulance = () => {
    window.location.href = 'tel:108'; // 108 is the emergency ambulance number in India
  };
  
  const handleCallPolice = () => {
    window.location.href = 'tel:100'; // 100 for police
  };

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto pb-4">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded-full shadow-sm text-neutral-text hover:bg-gray-50"
          aria-label={t('back')}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-neutral-text">{t('emergency_title')}</h2>
      </div>

      <div className="bg-red-50 rounded-3xl p-6 border border-red-200 text-center mb-6">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-red-800 mb-2">{t('emergency_question')}</h3>
        <p className="text-red-700 font-medium mb-6">
          {t('emergency_warning')}
        </p>

        <div className="space-y-4">
          <Button 
            variant="primary"
            onClick={handleCallAmbulance}
            className="w-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 py-4 rounded-xl text-lg font-bold"
          >
            <PhoneCall className="w-6 h-6" /> {t('call_ambulance')}
          </Button>

          <Button 
            variant="outline"
            onClick={handleCallPolice}
            className="w-full border-red-300 text-red-700 hover:bg-red-100 flex items-center justify-center gap-2 py-4 rounded-xl font-bold"
          >
            <PhoneCall className="w-5 h-5" /> {t('call_police')}
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => navigate('/patient/facilities')}
            className="w-full border-blue-300 text-blue-700 hover:bg-blue-100 flex items-center justify-center gap-2 py-4 rounded-xl font-bold"
          >
            {t('find_nearby_hospital')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyHelp;