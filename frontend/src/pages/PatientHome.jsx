import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MessageSquareText, ClipboardList, Mic, Activity, Bell, MapPin, AlertTriangle, Settings } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { usePatient } from '../context/PatientContext';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';
import { getDoctorResponse } from '../services/api';

const PatientHome = () => {
  const navigate = useNavigate();
  const { patient, complaint, isLoaded } = usePatient();
  const { t } = useLanguage();
  const [followUp, setFollowUp] = useState(null);

  useEffect(() => {
    if (complaint && complaint._id && complaint.status === 'RESPONDED') {
      getDoctorResponse(complaint._id)
        .then(res => {
          if (res && res.followUp && res.followUp.date) {
            setFollowUp(res.followUp);
          }
        })
        .catch(err => console.error(err));
    }
  }, [complaint]);

  const cards = [
    {
      title: t('advice'),
      desc: t('advice_desc'),
      icon: <MessageSquareText className="w-8 h-8 text-primary" />,
      path: '/patient/advice',
      color: 'bg-green-50'
    },
    {
      title: t('history'),
      desc: t('history_desc'),
      icon: <ClipboardList className="w-8 h-8 text-purple-500" />,
      path: '/patient/history',
      color: 'bg-purple-50'
    },
    {
      title: t('documents'),
      desc: t('documents_desc'),
      icon: <ClipboardList className="w-8 h-8 text-teal-500" />,
      path: '/patient/documents',
      color: 'bg-teal-50'
    },
    {
      title: t('facilities'),
      desc: t('facilities_desc'),
      icon: <MapPin className="w-8 h-8 text-blue-500" />,
      path: '/patient/facilities',
      color: 'bg-blue-50'
    },
    {
      title: t('emergency'),
      desc: t('emergency_desc'),
      icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
      path: '/patient/emergency',
      color: 'bg-red-50'
    }
  ];

  if (!isLoaded) return null;

  const firstName = patient?.name ? patient.name.split(' ')[0] : '';
  
  let followUpMessage = null;
  if (followUp && followUp.date) {
    const today = new Date();
    const fDate = new Date(followUp.date);
    const diffTime = fDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      followUpMessage = `🔔 ${t('follow_up_today')}`;
    } else if (diffDays > 0 && diffDays <= 3) {
      followUpMessage = `🔔 ${t('follow_up_soon')}`;
    }
  }

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto">
      
      <div className="mb-6 mt-2 flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-neutral-text">
            {firstName ? t('greeting', { name: firstName }) : t('greeting_simple')}
          </h2>
          <p className="text-xl text-neutral-muted mt-2">{t('how_are_you')}</p>
        </div>
        <button 
          onClick={() => navigate('/patient/settings')}
          className="p-2 bg-white rounded-full shadow-sm text-neutral-text hover:bg-gray-50 active:scale-95"
          aria-label="Settings"
        >
          <Settings className="w-6 h-6" />
        </button>
      </div>

      {!patient && (
        <div className="bg-orange-50 rounded-2xl p-4 mb-6 border border-orange-100 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="font-bold text-orange-800">{t('complete_profile')}</h3>
            <p className="text-sm text-orange-700 mt-1">{t('speak_profile')}</p>
          </div>
          <Button size="sm" onClick={() => navigate('/patient/register')} className="bg-orange-500 hover:bg-orange-600 focus:ring-orange-500 text-white rounded-xl">
            {t('start')}
          </Button>
        </div>
      )}

      {/* Follow-up Reminder */}
      {followUp && followUp.date && (
        <div 
          onClick={() => navigate('/patient/history')}
          className="bg-yellow-50 rounded-3xl p-5 mb-6 border border-yellow-200 cursor-pointer shadow-sm animate-in slide-in-from-top-2 flex items-center gap-4"
        >
          <div className="bg-yellow-200 p-3 rounded-full text-yellow-800">
            <Bell className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-yellow-900">
               {followUpMessage ? followUpMessage : `🔔 ${t('next_follow_up')}`}
            </h3>
            <p className="text-yellow-800 font-medium">
              {t('next_checkup')}: {new Date(followUp.date).toLocaleDateString()}
            </p>
            {followUp.note && <p className="text-yellow-700 text-sm mt-1">{followUp.note}</p>}
          </div>
        </div>
      )}

      {/* Primary Action */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center mb-6">
        <p className="text-neutral-text font-semibold text-lg mb-4">{t('speak_problem')}</p>
        <button 
          onClick={() => navigate('/patient/complaint')}
          className="flex items-center justify-center w-32 h-32 md:w-36 md:h-36 rounded-full shadow-lg transition-all duration-300 bg-primary hover:bg-primary-dark active:scale-95"
          aria-label={t('tell_problem')}
        >
          <Mic className="w-14 h-14 text-white" />
        </button>
        <h2 className="text-2xl font-bold text-neutral-text mt-6">{t('tell_problem')}</h2>
      </div>

      {/* Active Complaint Status */}
      {complaint && (
        <div className="mb-6 bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              {t('problem_ready')}
            </h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-neutral-muted">{t('status')}:</span>
              <StatusBadge 
                status={
                  complaint.status === 'RESPONDED' ? 'responded' : 
                  complaint.status === 'UNDER_REVIEW' ? 'viewed' : 
                  'saved'
                } 
                labelOverride={
                  complaint.status === 'READY_FOR_DOCTOR' ? t('ready_for_doctor') : 
                  complaint.status === 'UNDER_REVIEW' ? t('under_review') : 
                  complaint.status === 'RESPONDED' ? t('responded') : 
                  complaint.status
                } 
              />
            </div>
            <div>
              <span className="text-neutral-muted text-sm">{t('problem')}:</span>
              <p className="font-semibold text-neutral-text">{complaint.problem}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
        {cards.map((card, idx) => (
          <div 
            key={idx}
            onClick={() => navigate(card.path)}
            className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
          >
            <div className={`p-4 rounded-full ${card.color}`}>
              {card.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-text">{card.title}</h3>
              <p className="text-neutral-muted text-sm mt-1">{card.desc}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default PatientHome;
