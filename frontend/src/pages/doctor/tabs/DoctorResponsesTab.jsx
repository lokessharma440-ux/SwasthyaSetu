import React from 'react';
import { Loader2, FileText } from 'lucide-react';

export const DoctorResponsesTab = ({
  complaints,
  isLoading,
  navigate
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Consultation Responses Log</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Audit history of doctor consultations and clinical guidance notes
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64 bg-white rounded-3xl border border-slate-100">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No completed responses yet</h3>
          <p className="text-xs text-slate-500 mt-1">Responses submitted by the doctor will be recorded here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map(c => (
            <div
              key={c._id}
              onClick={() => navigate(`/doctor/complaints/${c._id}`)}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-200 cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-900 text-sm">{c.patientId?.name || 'Patient'}</span>
                  <span className="text-xs text-slate-400">• {new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs font-semibold text-slate-700">Problem: {c.problem}</p>
                {c.doctorResponse && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 italic bg-slate-50 p-2 rounded-xl">
                    Advice: "{c.doctorResponse}"
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  Open Review &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DoctorResponsesTab;

