import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Stethoscope, Pill, CalendarClock, MessageSquareText, Loader2, AlertCircle } from 'lucide-react';
import ListenButton from '../components/ListenButton';
import { usePatient } from '../context/PatientContext';
import { useLanguage } from '../context/LanguageContext';
import { getDoctorResponse } from '../services/api';

const Advice = () => {
  const navigate = useNavigate();
  const { complaint, isLoaded } = usePatient();
  const { t } = useLanguage();
  
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

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
        setError('Error fetching data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResponse();
  }, [complaint, isLoaded]);

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto pb-4">
      
      {/* Header with Back Button */}
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded-full shadow-sm text-neutral-text hover:bg-gray-50 active:scale-95"
          aria-label={t('back')}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-neutral-text">{t('advice')}</h2>
      </div>

      {error ? (
        <div className="bg-red-50 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
          <h3 className="text-xl font-bold text-red-800 mb-2">{error}</h3>
        </div>
      ) : !response ? (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
            <Stethoscope className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-neutral-text mb-2">{t('no_advice_yet')}</h3>
          {complaint && complaint.doctorId === null ? (
            <p className="text-orange-600 font-medium bg-orange-50 p-4 rounded-xl border border-orange-100 mt-2">
              {t('no_doctor_assigned')}
            </p>
          ) : (
            <p className="text-neutral-muted">{t('advice_pending')}</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Patient Complaint Context */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg text-neutral-muted mb-2">{t('problem')}:</h3>
            <p className="text-neutral-text text-lg italic border-l-4 border-gray-200 pl-3">
              "{complaint?.originalStatement || complaint?.problem}"
            </p>
          </div>

          {/* Doctor's Note */}
          <div className="bg-primary-light/30 rounded-3xl p-5 shadow-sm border border-primary-light relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <MessageSquareText className="w-24 h-24 text-primary" />
            </div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-xl text-primary-dark flex items-center gap-2">
                  <Stethoscope className="w-6 h-6" />
                  {t('advice')}
                </h3>
              </div>
              
              <p className="text-neutral-text text-lg font-medium leading-relaxed bg-white/70 p-4 rounded-xl whitespace-pre-wrap mb-4">
                {response.guidance}
              </p>

              <div className="flex justify-center mt-6 border-t border-primary-light/50 pt-4">
                <ListenButton 
                  large={true}
                  text={(() => {
                    let speech = t('advice') + '.\n\n';
                    if (response.guidance) speech += `${t('advice')}: ${response.guidance}\n\n`;
                    if (response.precautions) speech += `${t('precautions')}: ${response.precautions}\n\n`;
                    if (response.medicines) speech += `${t('medicines_instructions')}: ${response.medicines}\n\n`;
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
          {response.precautions && (
             <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg text-neutral-text mb-2">
                {t('precautions')}
              </h3>
              <p className="text-neutral-muted whitespace-pre-wrap">{response.precautions}</p>
             </div>
          )}

          {/* Medicines */}
          {response.medicines && (
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-lg text-neutral-text mb-4 flex items-center gap-2">
                <Pill className="w-5 h-5 text-blue-500" />
                {t('medicines_instructions')}
              </h3>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-neutral-text whitespace-pre-wrap">{response.medicines}</p>
              </div>
            </div>
          )}

          {/* Follow up */}
          {response.followUp && response.followUp.date && (
            <div className="bg-orange-50 rounded-3xl p-5 shadow-sm border border-orange-100">
              <h3 className="font-bold text-lg text-orange-800 mb-2 flex items-center gap-2">
                <CalendarClock className="w-5 h-5" />
                {t('next_checkup')}
              </h3>
              <p className="text-orange-900 font-medium mb-1">
                {new Date(response.followUp.date).toLocaleDateString()}
              </p>
              {response.followUp.note && (
                <p className="text-orange-800 text-sm whitespace-pre-wrap">{response.followUp.note}</p>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default Advice;
