import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MessageSquareText, ClipboardList, Mic, Activity, Bell, MapPin, AlertTriangle, Settings, Sparkles } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { usePatient } from '../context/PatientContext';
import { useLanguage } from '../context/LanguageContext';
import Button from '../components/Button';
import { getDoctorResponse } from '../services/api';
import heroDoctorImg from '../assets/imggg.jpeg';

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
    <div className="w-full">
      <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">

        {/* Left Column (Desktop: 5 cols / Mobile: stacked) */}
        <div className="lg:col-span-5 flex flex-col space-y-6">

          {/* Greeting Card */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div className="flex-1 pr-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                {firstName ? t('greeting', { name: firstName }) : t('greeting_simple')}
              </h2>
              <p className="text-base text-slate-500 mt-1 font-medium">{t('how_are_you')}</p>
            </div>
            <button
              onClick={() => navigate('/patient/settings')}
              className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-600 border border-slate-200/60 active:scale-95 transition-all shadow-sm"
              aria-label="Settings"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Hero Voice Complaint Action Card */}
          <div className="bg-gradient-to-b from-white via-white to-emerald-50/40 rounded-3xl p-7 shadow-sm border border-emerald-100/70 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/40 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-100/40 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

            <p className="text-slate-600 font-semibold text-base mb-6 relative z-10">{t('speak_problem')}</p>

            <div className="relative mb-6">
              {/* Subtle pulse ripple */}
              <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping opacity-40"></div>
              <button
                onClick={() => navigate('/patient/complaint')}
                className="relative z-10 flex items-center justify-center w-36 h-36 rounded-full shadow-xl shadow-emerald-600/20 transition-all duration-300 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 active:scale-95 ring-8 ring-emerald-500/15 hover:ring-emerald-500/25 cursor-pointer"
                aria-label={t('tell_problem')}
              >
                <Mic className="w-16 h-16 text-white drop-shadow-sm" />
              </button>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{t('tell_problem')}</h2>
          </div>

          {/* Active Complaint Status */}
          {complaint && (
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 animate-in slide-in-from-bottom-4 fade-in duration-300">
              <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-3">
                <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  {t('problem_ready')}
                </h3>
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

              <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{t('problem')}</span>
                <p className="font-semibold text-slate-700 text-base mt-0.5">{complaint.problem}</p>
              </div>
            </div>
          )}

        </div>

        {/* Right Column (Desktop: 7 cols / Mobile: stacked) */}
        <div className="lg:col-span-7 flex flex-col space-y-6 mt-6 lg:mt-0">

          {/* Featured Doctor Consultation Hero Banner (imggg) */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white shadow-md p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-500/30">
            <div className="relative z-10 flex-1 space-y-3 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-emerald-100 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                <span>SwasthyaSetu {t('rural_health_tag')}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                {t('home_doctor_banner_title')}
              </h3>
              <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed max-w-md">
                {t('home_doctor_banner_desc')}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigate('/patient/complaint')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white text-emerald-800 font-bold text-sm shadow-md hover:bg-emerald-50 active:scale-95 transition-all"
                >
                  <Mic className="w-4 h-4 text-emerald-600" />
                  <span>{t('tell_problem')}</span>
                </button>
              </div>
            </div>

            <div className="relative shrink-0 w-full sm:w-64 md:w-72 h-48 sm:h-56 rounded-2xl overflow-hidden border-2 border-white/30 shadow-xl bg-white/10 group">
              <img
                src={heroDoctorImg}
                alt="SwasthyaSetu Rural Health Doctor"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </div>

          {!patient && (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-3xl p-5 border border-orange-200/70 flex items-center justify-between shadow-sm">
              <div>
                <h3 className="font-bold text-orange-900 text-lg">{t('complete_profile')}</h3>
                <p className="text-sm text-orange-700/90 mt-0.5">{t('speak_profile')}</p>
              </div>
              <Button size="sm" onClick={() => navigate('/patient/register')} className="bg-orange-500 hover:bg-orange-600 focus:ring-orange-500 text-white rounded-xl shadow-sm">
                {t('start')}
              </Button>
            </div>
          )}

          {/* Follow-up Reminder */}
          {followUp && followUp.date && (
            <div
              onClick={() => navigate('/patient/history')}
              className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-3xl p-5 border border-amber-200/80 cursor-pointer shadow-sm hover:shadow transition-all active:scale-[0.99] flex items-center gap-4"
            >
              <div className="bg-amber-100 p-3.5 rounded-2xl text-amber-800 shadow-sm border border-amber-200/60 shrink-0">
                <Bell className="w-6 h-6 animate-bounce" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base text-amber-950">
                  {followUpMessage ? followUpMessage : `🔔 ${t('next_follow_up')}`}
                </h3>
                <p className="text-amber-800 text-sm font-semibold mt-0.5">
                  {t('next_checkup')}: {new Date(followUp.date).toLocaleDateString()}
                </p>
                {followUp.note && <p className="text-amber-700/90 text-xs mt-1 line-clamp-1">{followUp.note}</p>}
              </div>
            </div>
          )}

          {/* Quick Access Grid Header */}
          <div className="flex items-center justify-between pt-1">
            <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">{t('services')}</h3>
          </div>

          {/* Quick Access Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
            {cards.map((card, idx) => (
              <div
                key={idx}
                onClick={() => navigate(card.path)}
                className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98]"
              >
                <div className={`p-4 rounded-2xl ${card.color || 'bg-slate-100'} shadow-xs shrink-0`}>
                  {card.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-slate-800 truncate">{card.title}</h3>
                  <p className="text-slate-400 text-xs mt-0.5 line-clamp-1">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PatientHome;
