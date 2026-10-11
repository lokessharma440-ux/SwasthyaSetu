import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDoctorResponse, createDoctorResponse, updateDoctorResponse, markComplaintUnderReview } from '../../services/api';
import { ArrowLeft, Loader2, User, Clock, FileText } from 'lucide-react';

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [complaint, setComplaint] = useState(null);
  const [responseId, setResponseId] = useState(null);
  const [isNewResponse, setIsNewResponse] = useState(true);
  
  const [formData, setFormData] = useState({
    guidance: '',
    precautions: '',
    medicines: '',
    followUp: { date: '', note: '' }
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // We reuse getDoctorComplaints to find this specific one, or we can fetch directly from API
  // Let's assume we can hit GET /api/complaints/:id for the complaint data
  // The backend already has exports.getComplaint. But wait, getComplaint doesn't populate patientId by default in phase 5.
  // Actually, Phase 5 getComplaint doesn't populate. I'll need to fetch patient as well if we only have patientId, or maybe I should just rely on the API.
  
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Fetch complaint (to get patient info, we might need a populated endpoint, or fetch patient manually)
        // Since we are prototyping, let's just use fetch directly to get the complaint, then the patient if needed.
        const cRes = await fetch(`http://localhost:5000/api/complaints/${id}`);
        const cJson = await cRes.json();
        if (!cRes.ok) throw new Error('Complaint not found.');
        
        const complaintData = cJson.data;
        
        // Fetch patient
        const pRes = await fetch(`http://localhost:5000/api/patients/${complaintData.patientId}`);
        const pJson = await pRes.json();
        if (pRes.ok) {
          complaintData.patient = pJson.data;
        }

        setComplaint(complaintData);

        // Mark as under review if it's READY_FOR_DOCTOR
        if (complaintData.status === 'READY_FOR_DOCTOR') {
          await markComplaintUnderReview(id);
          complaintData.status = 'UNDER_REVIEW'; // optimistic update
        }

        // Fetch existing response
        const existingResponse = await getDoctorResponse(id);
        if (existingResponse) {
          setResponseId(existingResponse._id);
          setIsNewResponse(false);
          setFormData({
            guidance: existingResponse.guidance || '',
            precautions: existingResponse.precautions || '',
            medicines: existingResponse.medicines || '',
            followUp: existingResponse.followUp || { date: '', note: '' }
          });
        }
        
        setIsLoading(false);
      } catch (err) {
        setError(err.message || 'Error loading details.');
        setIsLoading(false);
      }
    };
    
    fetchDetails();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        complaintId: id,
        patientId: complaint.patientId,
        ...formData
      };

      if (isNewResponse) {
        const res = await createDoctorResponse(payload);
        setResponseId(res._id);
        setIsNewResponse(false);
      } else {
        await updateDoctorResponse(responseId, payload);
      }

      setComplaint(prev => ({...prev, status: 'RESPONDED'}));
      setSuccessMsg('Response saved successfully.');
    } catch (err) {
      setError('Response could not be saved. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !complaint) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-4">{error}</h2>
        <button onClick={() => navigate('/doctor/dashboard')} className="text-blue-600 hover:underline">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <header className="max-w-4xl mx-auto flex items-center gap-4 mb-8">
        <button 
          onClick={() => navigate('/doctor/dashboard')}
          className="p-2 bg-white rounded-lg shadow-sm text-gray-600 hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Complaint Details</h1>
        <span className="ml-auto px-3 py-1 rounded-full text-sm font-semibold bg-gray-200 text-gray-800">
          Status: {complaint.status === 'READY_FOR_DOCTOR' ? 'WAITING' : complaint.status === 'UNDER_REVIEW' ? 'IN CONSULTATION' : 'RESOLVED'}
        </span>
      </header>

      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        
        {/* Left Column: Information */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-gray-400" /> Patient Information
            </h2>
            {complaint.patient ? (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="block text-gray-500">Name</span><span className="font-medium text-gray-900">{complaint.patient.name}</span></div>
                <div><span className="block text-gray-500">Age</span><span className="font-medium text-gray-900">{complaint.patient.age}</span></div>
                <div><span className="block text-gray-500">Gender</span><span className="font-medium text-gray-900">{complaint.patient.gender}</span></div>
                <div><span className="block text-gray-500">Location</span><span className="font-medium text-gray-900">{complaint.patient.location}</span></div>
                <div className="col-span-2"><span className="block text-gray-500">Phone</span><span className="font-medium text-gray-900">{complaint.patient.phone}</span></div>
              </div>
            ) : (
              <div className="text-gray-500 italic">Patient information not found.</div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" /> Patient's Statement
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-gray-800 italic">"{complaint.originalStatement}"</p>
            </div>
            <div className="mt-4 flex gap-4 text-xs text-gray-500">
              <span>Input: <span className="font-medium uppercase">{complaint.inputMethod}</span></span>
              {complaint.inputMethod === 'voice' && <span>Language: <span className="font-medium">{complaint.language}</span></span>}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" /> Understood Information
            </h2>
            <div className="space-y-4">
              <div>
                <span className="block text-sm text-gray-500 font-semibold mb-1">Problem</span>
                <p className="text-gray-900">{complaint.problem}</p>
              </div>
              <div>
                <span className="block text-sm text-gray-500 font-semibold mb-1">Duration</span>
                <p className="text-gray-900">{complaint.duration}</p>
              </div>
              {complaint.additionalSymptoms && (
                <div>
                  <span className="block text-sm text-gray-500 font-semibold mb-1">Additional Symptoms</span>
                  <p className="text-gray-900">{complaint.additionalSymptoms}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Doctor Response Form */}
        <div>
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6 border-b pb-4">Doctor's Response</h2>
            
            {successMsg && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm border border-green-100">
                {successMsg}
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Doctor's Guidance *</label>
                <textarea 
                  required
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y min-h-[100px]"
                  placeholder="Enter guidance for the patient..."
                  value={formData.guidance}
                  onChange={e => setFormData({...formData, guidance: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Precautions (Optional)</label>
                <textarea 
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y min-h-[80px]"
                  placeholder="e.g. Drink plenty of warm water"
                  value={formData.precautions}
                  onChange={e => setFormData({...formData, precautions: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Medicine / Instructions (Optional)</label>
                <textarea 
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y min-h-[80px]"
                  placeholder="e.g. Paracetamol 500mg, twice a day"
                  value={formData.medicines}
                  onChange={e => setFormData({...formData, medicines: e.target.value})}
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-500" />
                  फॉलो-अप (Follow-up)
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Follow-up Date (Optional)</label>
                    <input 
                      type="date"
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      value={formData.followUp?.date ? formData.followUp.date.split('T')[0] : ''}
                      onChange={e => setFormData({...formData, followUp: { ...formData.followUp, date: e.target.value }})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Follow-up Note (Optional)</label>
                    <input 
                      type="text"
                      className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      placeholder="e.g. अगली जांच के लिए आएं"
                      value={formData.followUp?.note || ''}
                      onChange={e => setFormData({...formData, followUp: { ...formData.followUp, note: e.target.value }})}
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-6"
              >
                {isSubmitting ? 'Saving...' : (isNewResponse ? 'Resolve Consultation' : 'Update Resolution')}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ComplaintDetail;
