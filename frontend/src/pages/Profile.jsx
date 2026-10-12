import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, MapPin, Mic } from 'lucide-react';
import Button from '../components/Button';
import { usePatient } from '../context/PatientContext';
import { useLanguage } from '../context/LanguageContext';

const Profile = () => {
  const navigate = useNavigate();
  const { patient, isLoaded } = usePatient();
  const { t } = useLanguage();

  if (!isLoaded) return null;

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto pb-6">
      
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2.5 bg-white rounded-2xl shadow-sm text-slate-700 hover:bg-slate-50 border border-slate-100 active:scale-95 transition-all"
          aria-label={t('back')}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">{t('profile')}</h2>
          <p className="text-sm text-slate-400 mt-0.5">{t('profile_subtitle')}</p>
        </div>
      </div>

      {!patient ? (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-400 mb-6">
            <User className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-text mb-2">{t('complete_profile')}</h3>
          <p className="text-neutral-muted mb-8 px-4">{t('speak_profile')}</p>
          
          <Button 
            size="lg" 
            className="w-full py-4 text-xl flex items-center justify-center gap-3 rounded-2xl mb-4"
            onClick={() => navigate('/patient/register')}
          >
            <Mic className="w-6 h-6" />
            {t('speak_profile')}
          </Button>

          <Button 
            variant="ghost"
            onClick={() => navigate('/patient/register')}
            className="text-neutral-muted"
          >
            {t('type_manually')}
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex-1 relative">
          
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-500">
              <User className="w-12 h-12" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <p className="text-neutral-muted text-sm mb-1">{t('name')}</p>
              <p className="text-xl font-bold text-neutral-text">{patient.name}</p>
            </div>
            
            <div className="flex gap-4 border-b border-gray-100 pb-4">
              <div className="flex-1">
                <p className="text-neutral-muted text-sm mb-1">{t('age')}</p>
                <p className="text-xl font-semibold text-neutral-text">{patient.age}</p>
              </div>
              <div className="flex-1">
                <p className="text-neutral-muted text-sm mb-1">{t('gender')}</p>
                <p className="text-xl font-semibold text-neutral-text">
                  {patient.gender === 'Male' ? t('gender_male') : patient.gender === 'Female' ? t('gender_female') : patient.gender === 'Other' ? t('gender_other') : patient.gender}
                </p>
              </div>
            </div>

            <div className="border-b border-gray-100 pb-4">
              <p className="text-neutral-muted text-sm mb-1 flex items-center gap-1">
                <Phone className="w-4 h-4" /> {t('phone')}
              </p>
              <p className="text-xl font-semibold text-neutral-text">{patient.phone}</p>
            </div>

            <div className="border-b border-gray-100 pb-4">
              <p className="text-neutral-muted text-sm mb-1 flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {t('location')}
              </p>
              <p className="text-xl font-semibold text-neutral-text">{patient.location}</p>
            </div>

            {/* Assigned Doctor Section (Phase 2 Requirement 8 & Phase 7) */}
            <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Assigned Doctor (Demo Mode)
                </span>
                <span className="text-[11px] font-semibold bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded-full">
                  DOC-DEMO-001
                </span>
              </div>
              <p className="text-lg font-extrabold text-slate-800">Dr. Demo Sharma</p>
              <p className="text-xs font-medium text-slate-600 mt-0.5">
                General Medicine • Primary Care Physician
              </p>
            </div>
          </div>

          <div className="mt-8 flex justify-center">
             <Button variant="outline" onClick={() => navigate('/patient/register')} className="w-full">
               {t('change_info')}
             </Button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
