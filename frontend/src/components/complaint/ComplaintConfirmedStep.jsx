import React from 'react';
import { CheckCircle2, Stethoscope, ExternalLink } from 'lucide-react';

export const ComplaintConfirmedStep = ({ formData, navigate, t }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500 py-6">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-5 shadow-sm">
        <CheckCircle2 className="w-10 h-10" />
      </div>
      
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
        ✓ Sent to Doctor Dashboard!
      </h2>
      <p className="text-sm text-slate-500 max-w-md mb-6">
        Your consultation request has been delivered to <strong>Dr. Demo Sharma (General Medicine)</strong>.
      </p>

      {/* Request Summary Card */}
      <div className="w-full max-w-md bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm text-left mb-6 space-y-3">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chief Problem</span>
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
            WAITING IN QUEUE
          </span>
        </div>
        <p className="font-extrabold text-base text-slate-800">{formData.problem}</p>
        {formData.duration && (
          <p className="text-xs text-slate-500"><strong>Duration:</strong> {formData.duration}</p>
        )}
        <div className="bg-blue-50/80 p-3 rounded-2xl border border-blue-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-blue-900">Dr. Demo Sharma</p>
            <p className="text-[11px] text-blue-700">General Medicine • DOC-DEMO-001</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-md flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate('/doctor/dashboard?tab=requests')}
          className="flex-1 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98"
        >
          <Stethoscope className="w-4 h-4" />
          <span>View on Doctor Dashboard</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </button>

        <button
          onClick={() => navigate('/patient/home')}
          className="py-3.5 px-5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-bold text-sm transition-all shadow-2xs active:scale-98"
        >
          {t('start') || 'Home'}
        </button>
      </div>
    </div>
  );
};

export default ComplaintConfirmedStep;

