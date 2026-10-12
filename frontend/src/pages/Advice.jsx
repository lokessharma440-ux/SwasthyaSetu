import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Stethoscope, Pill, CalendarClock, MessageSquareText, Loader2, AlertCircle, ShieldAlert, CheckCircle2, UserCheck, ExternalLink } from 'lucide-react';
import ListenButton from '../components/ListenButton';
import { usePatient } from '../context/PatientContext';
import { useLanguage } from '../context/LanguageContext';
import { getDoctorResponse } from '../services/api';

const Advice = () => {
  const navigate = useNavigate();
  const { complaint, patient, isLoaded } = usePatient();
  const { t } = useLanguage();
  
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('patient'); // 'patient' (translated native) | 'doctor' (English original)

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!complaint || !complaint._id || complaint.isLocal) {
      setIsLoading(false);
      return;
    }

    const fetchResponse = async () => {
      try {
        const data = await getDoctorResponse(complaint._id);
        setResponse(data);
      } catch (err) {
        console.error(err);
        setError('Error fetching advice');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResponse();
  }, [complaint, isLoaded]);

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  const isDemo = response && response.responseType === 'DEMO_AUTO';
  const isAuthorized = response && response.responseType === 'DOCTOR_AUTHORIZED';

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto pb-6">
      
      {/* Header with Back Button */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2.5 bg-white rounded-2xl shadow-sm text-slate-700 hover:bg-slate-50 border border-slate-100 active:scale-95 transition-all"
            aria-label={t('back')}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">{t('advice')}</h2>
            <p className="text-sm text-slate-400 mt-0.5">{t('advice_subtitle')}</p>
          </div>
        </div>

        {/* Quick link to doctor portal for evaluators */}
        <button
          onClick={() => navigate('/doctor/dashboard')}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200/80 rounded-xl hover:bg-blue-100 transition-colors shadow-2xs"
          title="Open Doctor Dashboard to review or submit consultation"
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>Doctor Portal</span>
          <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
        </button>
      </div>

      {error ? (
        <div className="bg-red-50 rounded-3xl p-8 flex flex-col items-center justify-center text-center border border-red-100">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <h3 className="text-xl font-bold text-red-800 mb-2">{error}</h3>
        </div>
      ) : !response ? (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-6">
            <Stethoscope className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">{t('no_advice_yet')}</h3>
          <p className="text-slate-500 max-w-md">{t('advice_pending')}</p>
          
          <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800 max-w-md">
            <strong>Assigned Doctor:</strong> Dr. Demo Sharma (DOC-DEMO-001) • General Medicine. Prototype responses are generated upon complaint receipt.
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Prominent Demo Response Banner (Phase 5 Requirement) */}
          {isDemo && (
            <div className="bg-amber-50 border-2 border-amber-300/80 rounded-2xl p-4 sm:p-5 shadow-sm text-amber-900">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base tracking-wide text-amber-950 uppercase">
                    DEMO RESPONSE — NOT A REAL DOCTOR'S CONSULTATION
                  </h4>
                  <p className="text-xs sm:text-sm text-amber-800 mt-1 leading-relaxed">
                    This is an automated prototype acknowledgement generated for demonstration purposes. It is <strong>not</strong> an actual medical diagnosis, clinical prescription, or doctor-approved assessment. If symptoms are severe or persistent, please visit a Primary Health Centre (PHC) or call helpline <strong>108</strong>.
                  </p>
                  <div className="mt-2 text-[11px] font-semibold text-amber-900/80 bg-amber-100/70 py-1 px-2.5 rounded-lg inline-block">
                    Prototype SLA: Delivered within 5 minutes of complaint registration
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Doctor Authorized Banner */}
          {isAuthorized && (
            <div className="bg-emerald-50 border-2 border-emerald-300/80 rounded-2xl p-4 sm:p-5 shadow-sm text-emerald-950">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-emerald-900">
                    Verified Doctor Consultation Note
                  </h4>
                  <p className="text-xs sm:text-sm text-emerald-800 mt-0.5">
                    Consultation completed by <strong>Dr. Demo Sharma</strong> (DOC-DEMO-001) • General Medicine
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Dual-Language Toggle if translation is available */}
          {response?.guidanceTranslated && response.guidanceTranslated !== response.guidance && (
            <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-slate-100 shadow-2xs">
              <span className="text-xs font-bold text-slate-500 pl-2">Display Language:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setViewMode('patient')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    viewMode === 'patient'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  🌐 Your Language ({response.targetLanguage || 'Translated'})
                </button>
                <button
                  onClick={() => setViewMode('doctor')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    viewMode === 'doctor'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Doctor's Original (English)
                </button>
              </div>
            </div>
          )}

          {/* Patient Complaint Context */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-400 mb-1">{t('problem')}:</h3>
            <p className="text-slate-800 text-base sm:text-lg italic border-l-4 border-emerald-500 pl-3">
              "{complaint?.originalStatement || complaint?.problem}"
            </p>
            {complaint?.duration && (
              <p className="text-xs text-slate-500 mt-2 pl-3">
                <strong>Duration:</strong> {complaint.duration}
              </p>
            )}
          </div>

          {/* Doctor's Guidance / Advice Note */}
          <div className="bg-gradient-to-br from-white to-emerald-50/50 rounded-3xl p-6 shadow-sm border border-emerald-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <MessageSquareText className="w-32 h-32 text-emerald-600" />
            </div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                  <Stethoscope className="w-6 h-6 text-emerald-600" />
                  {isAuthorized ? 'Doctor Consultation Note' : t('advice')}
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {isDemo ? 'Automated Interim' : 'Doctor Reviewed'}
                </span>
              </div>
              
              <div className="text-slate-800 text-base sm:text-lg font-medium leading-relaxed bg-white/80 p-4 sm:p-5 rounded-2xl whitespace-pre-wrap mb-4 border border-slate-100/80 shadow-2xs">
                {(viewMode === 'patient' && response.guidanceTranslated) ? response.guidanceTranslated : response.guidance}
              </div>

              {/* Speech Read-out */}
              <div className="flex justify-center mt-4 border-t border-emerald-100/60 pt-4">
                <ListenButton 
                  large={true}
                  text={(() => {
                    const guidance = (viewMode === 'patient' && response.guidanceTranslated) ? response.guidanceTranslated : response.guidance;
                    const precautions = (viewMode === 'patient' && response.precautionsTranslated) ? response.precautionsTranslated : response.precautions;
                    const medicines = (viewMode === 'patient' && response.medicinesTranslated) ? response.medicinesTranslated : response.medicines;

                    let speech = (isDemo ? "Interim guidance. " : "Doctor's advice. ") + '.\n\n';
                    if (guidance) speech += `${t('advice')}: ${guidance}\n\n`;
                    if (precautions) speech += `${t('precautions')}: ${precautions}\n\n`;
                    if (medicines) speech += `${t('medicines_instructions')}: ${medicines}\n\n`;
                    if (response.followUp && response.followUp.date) {
                      const dateObj = new Date(response.followUp.date);
                      if (!isNaN(dateObj)) {
                          speech += `${t('follow_up_label')}: ${dateObj.toLocaleDateString()}. ${response.followUp.note || ''}\n\n`;
                      }
                    }
                    return speech;
                  })()} 
                />
              </div>
            </div>
          </div>
          
          {/* Precautions */}
          {(response.precautions || response.precautionsTranslated) && (
             <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-bold text-base sm:text-lg text-slate-800 mb-2">
                {t('precautions')}
              </h3>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                {(viewMode === 'patient' && response.precautionsTranslated) ? response.precautionsTranslated : response.precautions}
              </p>
             </div>
          )}

          {/* Medicines / Prescriptions */}
          {(response.medicines || response.medicinesTranslated) ? (
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-bold text-base sm:text-lg text-slate-800 mb-3 flex items-center gap-2">
                <Pill className="w-5 h-5 text-blue-500" />
                {t('medicines_instructions')}
              </h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-slate-800 whitespace-pre-wrap font-medium">
                  {(viewMode === 'patient' && response.medicinesTranslated) ? response.medicinesTranslated : response.medicines}
                </p>
              </div>
            </div>
          ) : isDemo ? (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/60 text-xs text-slate-500 flex items-center gap-2">
              <Pill className="w-4 h-4 text-slate-400 shrink-0" />
              <span><strong>Medications/Dosages:</strong> None generated. General first-aid guidance only.</span>
            </div>
          ) : null}

          {/* Follow up */}
          {response.followUp && response.followUp.date && (
            <div className="bg-amber-50 rounded-3xl p-5 shadow-sm border border-amber-100">
              <h3 className="font-bold text-base sm:text-lg text-amber-900 mb-2 flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-amber-700" />
                {t('next_checkup')}
              </h3>
              <p className="text-amber-900 font-bold mb-1">
                {new Date(response.followUp.date).toLocaleDateString()}
              </p>
              {response.followUp.note && (
                <p className="text-amber-800 text-sm whitespace-pre-wrap">{response.followUp.note}</p>
              )}
            </div>
          )}

          {/* Assigned Doctor Profile Summary Box */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-2xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Assigned Doctor</p>
                <p className="font-bold text-slate-800 text-sm">Dr. Demo Sharma</p>
                <p className="text-xs text-slate-500">General Medicine • DOC-DEMO-001</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100">
              Demo Mode
            </span>
          </div>

        </div>
      )}

    </div>
  );
};

export default Advice;
