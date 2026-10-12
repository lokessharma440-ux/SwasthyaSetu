import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getDoctorResponse, 
  createDoctorResponse, 
  updateDoctorResponse, 
  markComplaintUnderReview,
  previewDoctorTranslation
} from '../../services/api';
import { 
  ArrowLeft, 
  Loader2, 
  User, 
  Clock, 
  FileText, 
  ShieldAlert, 
  CheckCircle2, 
  Stethoscope, 
  Calendar, 
  Pill, 
  Phone, 
  MapPin, 
  Sparkles, 
  AlertCircle,
  Globe,
  Languages
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
        // Fetch complaint from backend
        const cRes = await fetch(`${API_BASE}/complaints/${id}`);
        const cJson = await cRes.json();
        if (!cRes.ok || !cJson.data) throw new Error('Complaint not found.');
        
        const complaintData = cJson.data;
        
        // If patient info wasn't populated, fetch it
        if (!complaintData.patientId || typeof complaintData.patientId === 'string') {
          const pRes = await fetch(`${API_BASE}/patients/${complaintData.patientId || complaintData.patient}`);
          const pJson = await pRes.json();
          if (pRes.ok) complaintData.patient = pJson.data;
        } else {
          complaintData.patient = complaintData.patientId;
        }

        setComplaint(complaintData);

        // Mark as UNDER_REVIEW if it was READY_FOR_DOCTOR
        if (complaintData.status === 'READY_FOR_DOCTOR') {
          try {
            await markComplaintUnderReview(id);
            complaintData.status = 'UNDER_REVIEW';
          } catch (e) {
            console.warn('Could not mark under review:', e.message);
          }
        }

        // Fetch existing response (could be DEMO_AUTO or DOCTOR_AUTHORIZED)
        const resp = await getDoctorResponse(id);
        if (resp) {
          setExistingResponse(resp);
          setResponseId(resp._id);
          setIsNewResponse(false);
          setFormData({
            guidance: resp.guidance || '',
            precautions: resp.precautions || '',
            medicines: resp.medicines || '',
            followUp: {
              date: resp.followUp?.date ? resp.followUp.date.split('T')[0] : '',
              note: resp.followUp?.note || ''
            }
          });
        }
        
        setIsLoading(false);
      } catch (err) {
        setError(err.message || 'Error loading complaint details.');
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
        patientId: complaint.patient?._id || complaint.patientId?._id || complaint.patientId,
        guidance: formData.guidance,
        precautions: formData.precautions,
        medicines: formData.medicines,
        followUp: {
          date: formData.followUp.date || null,
          note: formData.followUp.note || ''
        }
      };

      const res = await createDoctorResponse(id, payload);
      setResponseId(res._id);
      setIsNewResponse(false);
      setExistingResponse({ ...res, responseType: 'DOCTOR_AUTHORIZED' });
      setComplaint(prev => ({ ...prev, status: 'RESPONDED' }));
      setSuccessMsg('✅ Authorized doctor consultation saved and published to patient advice.');
    } catch (err) {
      setError(err.message || 'Response could not be saved. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !complaint) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">{error}</h2>
        <button 
          onClick={() => navigate('/doctor/dashboard')} 
          className="text-xs font-bold text-blue-600 hover:underline mt-2"
        >
          &larr; Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/doctor/dashboard')}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all shadow-2xs"
              title="Back to queue"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Consultation Review
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Submitted {new Date(complaint.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status:</span>
            <StatusBadge
              status={complaint.status === 'RESPONDED' ? 'responded' : complaint.status === 'UNDER_REVIEW' ? 'viewed' : 'saved'}
              labelOverride={complaint.status === 'READY_FOR_DOCTOR' ? 'WAITING' : complaint.status}
            />
          </div>
        </div>

        {/* Two-column layout: Complaint info (left) & Doctor response form (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column (5 cols): Patient Details, Original Audio/Text statement, Symptom breakdown */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Patient Info Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
              <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" /> Patient Information
              </h3>
              {complaint.patient ? (
                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Name</span>
                    <span className="font-bold text-slate-900">{complaint.patient.name}</span>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Age / Gender</span>
                    <span className="font-bold text-slate-900">{complaint.patient.age}y • {complaint.patient.gender}</span>
                  </div>
                  <div className="col-span-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Village / Location</span>
                      <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
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
            <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
              
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-extrabold text-slate-900">Doctor Consultation & Advice</h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Submitting this form updates the complaint to RESOLVED and delivers guidance to the patient.
                </p>
              </div>

              {/* Translation Notice Banner */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    <strong>Auto-Translation:</strong> Your advice typed in English will automatically be translated into <strong>{complaint?.language || 'Hindi (हिन्दी)'}</strong> for the patient.
                  </span>
                </div>
              </div>

              {successMsg && (
                <div className="p-3.5 bg-emerald-50 text-emerald-800 rounded-2xl text-xs font-semibold border border-emerald-200 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {error && (
                <div className="p-3.5 bg-red-50 text-red-700 rounded-2xl text-xs font-semibold border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Guidance textarea */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Doctor's Clinical Guidance (English) *
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!formData.guidance.trim()) return;
                      setIsPreviewLoading(true);
                      try {
                        const tr = await previewDoctorTranslation(formData.guidance, complaint?.language || 'hi-IN');
                        setTranslationPreview(tr);
                      } catch (e) {
                        console.warn(e);
                      } finally {
                        setIsPreviewLoading(false);
                      }
                    }}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Languages className="w-3.5 h-3.5" />
                    <span>{isPreviewLoading ? 'Translating...' : `Preview in ${complaint?.language || 'Patient Language'}`}</span>
                  </button>
                </div>
                <textarea 
                  required
                  rows={4}
                  className="w-full p-3.5 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs sm:text-sm font-medium placeholder-slate-400 transition-all"
                  placeholder="Enter your clinical guidance, assessment remarks, and instructions for the patient in English..."
                  value={formData.guidance}
                  onChange={e => setFormData({ ...formData, guidance: e.target.value })}
                />

                {/* Translation Preview Box */}
                {translationPreview && (
                  <div className="mt-2 p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-900 animate-in fade-in">
                    <span className="font-bold text-[10px] uppercase text-emerald-700 block mb-0.5">
                      Preview for Patient ({complaint?.language || 'Patient Language'}):
                    </span>
                    <p className="font-semibold italic">"{translationPreview}"</p>
                  </div>
                )}
              </div>

              {/* Precautions textarea */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Dietary & Lifestyle Precautions (Optional)
                </label>
                <textarea 
                  rows={3}
                  className="w-full p-3.5 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs sm:text-sm font-medium placeholder-slate-400 transition-all"
                  placeholder="e.g. Drink boiled water, avoid heavy labor, rest in a cool ventilated room..."
                  value={formData.precautions}
                  onChange={e => setFormData({ ...formData, precautions: e.target.value })}
                />
              </div>

              {/* Medicines textarea */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Medicines / Prescription (Optional)
                  </label>
                  <span className="text-[10px] text-slate-400 font-semibold">Doctor Authorized Only</span>
                </div>
                <textarea 
                  rows={3}
                  className="w-full p-3.5 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs sm:text-sm font-medium placeholder-slate-400 transition-all"
                  placeholder="e.g. Paracetamol 500mg (1 tablet after meals if fever > 100F), ORS liquid twice daily..."
                  value={formData.medicines}
                  onChange={e => setFormData({ ...formData, medicines: e.target.value })}
                />
              </div>

              {/* Follow-up section */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Follow-Up Checkup (Optional)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Follow-up Date</label>
                    <input 
                      type="date"
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs font-medium"
                      value={formData.followUp?.date || ''}
                      onChange={e => setFormData({
                        ...formData, 
                        followUp: { ...formData.followUp, date: e.target.value } 
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Follow-up Note</label>
                    <input 
                      type="text"
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs font-medium"
                      placeholder="e.g. Visit nearest CHC if symptoms persist"
                      value={formData.followUp?.note || ''}
                      onChange={e => setFormData({
                        ...formData, 
                        followUp: { ...formData.followUp, note: e.target.value } 
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-98 transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving Consultation...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" /> 
                    <span>Submit & Publish Authorized Consultation</span>
                  </>
                )}
              </button>

            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ComplaintDetail;
