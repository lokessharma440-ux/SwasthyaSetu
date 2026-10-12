import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Activity, MessageSquareText, Loader2, AlertCircle, User, Bell, FileText } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import { usePatient } from '../context/PatientContext';
import { useLanguage } from '../context/LanguageContext';
import { getTimeline } from '../services/api';

const History = () => {
  const navigate = useNavigate();
  const { patient, isLoaded } = usePatient();
  const { t } = useLanguage();
  const [timeline, setTimeline] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoaded) return;
    
    if (patient && !patient.isLocal) {
      // Fetch from API
      getTimeline(patient._id)
        .then(data => {
          setTimeline(data.timeline || []);
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError('Error');
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [patient, isLoaded]);

  const getIcon = (type) => {
    if (type.includes('Registered')) return <User className="w-5 h-5 text-gray-500" />;
    if (type.includes('Complaint')) return <Activity className="w-5 h-5 text-blue-600" />;
    if (type.includes('Doctor Reviewed')) return <Activity className="w-5 h-5 text-yellow-600" />;
    if (type.includes('Advice') || type.includes('Response')) return <MessageSquareText className="w-5 h-5 text-green-600" />;
    if (type.includes('Follow-up')) return <Bell className="w-5 h-5 text-orange-500" />;
    if (type.includes('Document')) return <FileText className="w-5 h-5 text-purple-600" />;
    return <Clock className="w-5 h-5 text-gray-500" />;
  };

  const getLocalizedType = (type) => {
    if (!type) return '';
    if (type.includes('Interim Health Guidance') || type.includes('Prototype Demo Response')) return 'Interim Health Guidance';
    if (type.includes('Doctor Advice (Authorized)')) return 'Doctor Consultation Note (Authorized)';
    if (type.includes('Registered')) return t('timeline_registered');
    if (type.includes('Complaint')) return t('timeline_complaint');
    if (type.includes('Doctor Reviewed')) return t('timeline_doctor_review');
    if (type.includes('Assigned')) return t('timeline_doctor_assigned');
    if (type.includes('Advice') || type.includes('Response')) return t('timeline_advice');
    if (type.includes('Follow-up')) return t('timeline_follow_up');
    if (type.includes('Document')) return t('timeline_document');
    return type;
  };

  const getLocalizedDescription = (item) => {
    if (!item) return '';
    if (item.type?.includes('Registered')) return t('timeline_registered');
    if (item.type?.includes('Doctor Reviewed')) return t('under_review');
    if (item.type?.includes('Advice')) return t('responded');
    if (item.type?.includes('Follow-up') && item.data?.followUp?.date) {
      const d = formatDate(item.data.followUp.date);
      return `${t('next_checkup')}: ${d}${item.data.followUp.note ? `\n${item.data.followUp.note}` : ''}`;
    }
    return item.description;
  };

  const getStatusKey = (status) => {
    if (status === 'UNDER_REVIEW' || status === 'viewed') return 'viewed';
    if (status === 'RESPONDED' || status === 'responded' || status === 'completed') return 'responded';
    if (status === 'pending') return 'saved';
    if (status === 'uploaded') return 'responded';
    return 'saved';
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto pb-6">
      
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2.5 bg-white rounded-2xl shadow-sm text-slate-700 hover:bg-slate-50 border border-slate-100 active:scale-95 transition-all"
          aria-label={t('back')}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">{t('history')}</h2>
          <p className="text-sm text-slate-400 mt-0.5">{t('history_subtitle')}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex-1">
        
        {timeline.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            {error ? (
              <AlertCircle className="w-12 h-12 text-red-300 mb-4" />
            ) : (
              <Clock className="w-12 h-12 text-gray-300 mb-4" />
            )}
            <p className="text-neutral-muted">{error || t('no_history')}</p>
          </div>
        ) : (
          <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 pb-4">
            {timeline.map((item, idx) => {
              const dateToDisplay = formatDate(item.date);
              const statusKey = getStatusKey(item.status);

              return (
              <div key={idx} className="relative pl-6">
                
                {/* Timeline Dot */}
                <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-white border-4 border-primary shadow-sm" />
                
                {/* Content */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-neutral-text flex items-center gap-2">
                      {dateToDisplay}
                    </span>
                    {item.status && item.status !== 'completed' && (
                      <StatusBadge 
                        status={statusKey} 
                        labelOverride={item.status === 'pending' ? t('saved') : undefined} 
                      />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    {getIcon(item.type)}
                    <span className="font-semibold text-neutral-text">{getLocalizedType(item.type)}</span>
                  </div>
                  
                  <p className="text-neutral-muted text-sm whitespace-pre-wrap">{getLocalizedDescription(item)}</p>
                </div>
              </div>
            )})}
          </div>
        )}
        
      </div>

    </div>
  );
};

export default History;
