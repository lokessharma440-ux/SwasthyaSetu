import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getDoctorResponse, 
  createDoctorResponse, 
  updateDoctorResponse, 
  markComplaintUnderReview,
  API_BASE
} from '../../services/api';
import { 
  ArrowLeft, 
  Loader2, 
  User, 
  Clock, 
  FileText, 
  ShieldAlert, 
  CheckCircle2, 
  Phone, 
  MapPin, 
  AlertCircle,
  Globe
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import ClinicalResponseForm from './components/ClinicalResponseForm';

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [complaint, setComplaint] = useState(null);
  const [existingResponse, setExistingResponse] = useState(null);
  const [responseId, setResponseId] = useState(null);
  const [isNewResponse, setIsNewResponse] = useState(true);
  
  const [formData, setFormData] = useState({
    guidance: '',
    precautions: '',
    medicines: '',
    followUp: { date: '', note: '' }
  });
  
  const [translationPreview, setTranslationPreview] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const cRes = await fetch(`${API_BASE}/complaints/${id}`);
        const cJson = await cRes.json();
        if (!cRes.ok || !cJson.data) throw new Error('Complaint not found.');
        
        const complaintData = cJson.data;
        
        if (!complaintData.patientId || typeof complaintData.patientId === 'string') {
          const pRes = await fetch(`${API_BASE}/patients/${complaintData.patientId || complaintData.patient}`);
          const pJson = await pRes.json();
          if (pRes.ok) complaintData.patient = pJson.data;
        } else {
          complaintData.patient = complaintData.patientId;
        }

        setComplaint(complaintData);

        if (complaintData.status === 'READY_FOR_DOCTOR') {
          try {
            await markComplaintUnderReview(id);
            setComplaint(prev => ({ ...prev, status: 'UNDER_REVIEW' }));
          } catch (e) {
            console.warn('Could not mark complaint under review:', e.message);
          }
        }

        const respData = await getDoctorResponse(id);
        if (respData) {
          setExistingResponse(respData);
          setResponseId(respData._id);
          setIsNewResponse(false);
          setFormData({
            guidance: respData.guidance || '',
            precautions: respData.precautions || '',
            medicines: respData.medicines || '',
            followUp: {
              date: respData.followUp?.date ? respData.followUp.date.split('T')[0] : '',
              note: respData.followUp?.note || ''
            }
          });
        }
      } catch (err) {
        setError(err.message || 'Failed to load consultation details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.guidance.trim()) {
      setError('Please provide clinical guidance for the patient.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        complaintId: id,
        patientId: complaint?.patient?._id || complaint?.patientId?._id || complaint?.patientId,
        guidance: formData.guidance,
        precautions: formData.precautions,
        medicines: formData.medicines,
        followUp: {
          date: formData.followUp.date || null,
          note: formData.followUp.note || ''
        }
      };

      let result;
      if (isNewResponse || !responseId) {
        result = await createDoctorResponse(payload);
        if (result && result._id) {
          setResponseId(result._id);
          setIsNewResponse(false);
        }
      } else {
        result = await updateDoctorResponse(responseId, payload);
      }

      setComplaint(prev => ({ ...prev, status: 'RESPONDED' }));
      setExistingResponse(result);
      setSuccessMsg('✓ Doctor consultation successfully published and translated for patient!');
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err) {
      setError(err.message || 'Failed to submit response');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading consultation records...</p>
      </div>
    );
  }

  if (error && !complaint) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-red-50 border border-red-200 rounded-3xl text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold text-red-800">Error Loading Request</h3>
        <p className="text-xs text-red-600">{error}</p>
        <button 
          onClick={() => navigate('/doctor/dashboard')}
          className="px-5 py-2.5 bg-white border border-red-200 text-red-700 text-xs font-bold rounded-xl hover:bg-red-100 transition-all cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/doctor/dashboard')}
            className="p-2.5 bg-white rounded-2xl shadow-2xs text-slate-600 hover:bg-slate-50 border border-slate-200 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Clinical Review</h1>
              <StatusBadge status={complaint.status} />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Consultation ID: <span className="font-mono text-slate-700">{complaint._id}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols): Patient Info & Complaint Summary */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Patient Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" /> Patient Profile
            </h3>
            {complaint.patient ? (
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">{complaint.patient.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {complaint.patient.age ? `${complaint.patient.age} yrs` : 'Age N/A'} • {complaint.patient.gender || 'Gender N/A'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {complaint.patient.location}
                    </span>
                  </div>
                  {complaint.patient.phone && (
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Phone</span>
                      <span className="font-bold text-slate-700">{complaint.patient.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Patient record not found.</p>
            )}
          </div>

          {/* English Translation for Doctor */}
          <div className="bg-white p-5 rounded-3xl border border-blue-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-xs text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-600" /> English Translation (For Doctor)
              </h3>
              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-100">
                Doctor Understanding
              </span>
            </div>
            <div className="bg-blue-50/50 p-3.5 rounded-2xl border border-blue-100">
              <p className="text-slate-900 text-sm font-semibold leading-relaxed">
                "{complaint.originalStatementEnglish || complaint.problemEnglish || complaint.originalStatement || complaint.problem}"
              </p>
            </div>
          </div>

          {/* Original Statement Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" /> Patient's Original Submission
              </h3>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                Lang: {complaint.language || 'hi-IN'}
              </span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <p className="text-slate-800 text-sm italic leading-relaxed">
                "{complaint.originalStatement || complaint.problem}"
              </p>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span>Input: <strong className="uppercase text-slate-600">{complaint.inputMethod || 'Text'}</strong></span>
              <span>Original Language: <strong className="text-slate-600">{complaint.language || 'hi-IN'}</strong></span>
            </div>
          </div>

          {/* Extracted Chief Problem & Duration */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> Problem Summary
            </h3>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Primary Complaint (English)</span>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                {complaint.problemEnglish || complaint.problem}
              </p>
              {complaint.problemEnglish && complaint.problemEnglish !== complaint.problem && (
                <p className="text-xs text-slate-500 italic mt-0.5">
                  Original: "{complaint.problem}"
                </p>
              )}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Duration</span>
              <p className="text-sm font-semibold text-slate-700 mt-0.5">
                {complaint.durationEnglish || complaint.duration}
              </p>
            </div>
            {complaint.additionalSymptoms && (
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Associated Symptoms</span>
                <p className="text-xs text-slate-600 mt-0.5">
                  {complaint.additionalSymptomsEnglish || complaint.additionalSymptoms}
                </p>
              </div>
            )}
          </div>

          {/* Existing Demo Response Audit Box */}
          {existingResponse && existingResponse.responseType === 'DEMO_AUTO' && (
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-amber-900 text-xs">
              <div className="flex items-start gap-2 mb-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Initial Interim Guidance Active</strong>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    The patient currently has automated first-aid advice. Submitting your consultation below will provide an official authorized doctor note in their language.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* If Doctor Already Responded, Show Both Versions */}
          {existingResponse && existingResponse.responseType === 'DOCTOR_AUTHORIZED' && (
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-emerald-950 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Dual-Language Consultation Stored</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-100 text-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">English Doctor Original:</span>
                <p className="text-xs font-medium">{existingResponse.guidance}</p>
              </div>
              {existingResponse.guidanceTranslated && existingResponse.guidanceTranslated !== existingResponse.guidance && (
                <div className="bg-white p-3 rounded-xl border border-emerald-100 text-emerald-900">
                  <span className="text-[10px] font-bold uppercase text-emerald-600 block mb-0.5">
                    Delivered to Patient ({existingResponse.targetLanguage || complaint.language}):
                  </span>
                  <p className="text-xs font-semibold">{existingResponse.guidanceTranslated}</p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column (7 cols): Doctor Response & Resolution Form */}
        <div className="lg:col-span-7">
          <ClinicalResponseForm
            complaint={complaint}
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            successMsg={successMsg}
            error={error}
            translationPreview={translationPreview}
            setTranslationPreview={setTranslationPreview}
            isPreviewLoading={isPreviewLoading}
            setIsPreviewLoading={setIsPreviewLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
