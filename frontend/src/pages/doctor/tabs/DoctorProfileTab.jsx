import React from 'react';
import { Stethoscope } from 'lucide-react';

export const DoctorProfileTab = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-700 font-black text-2xl flex items-center justify-center border border-blue-200">
            <Stethoscope className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Dr. Demo Sharma</h2>
            <p className="text-sm font-semibold text-blue-600">DOC-DEMO-001</p>
            <span className="inline-block mt-1 text-[11px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-100">
              Primary Care Physician
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Specialization</span>
            <p className="font-extrabold text-slate-800 text-sm mt-0.5">General Medicine</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Department</span>
            <p className="font-extrabold text-slate-800 text-sm mt-0.5">General Healthcare</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Availability</span>
            <p className="font-extrabold text-slate-800 text-sm mt-0.5">Active / On-Duty</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Consultation Mode</span>
            <p className="font-extrabold text-slate-800 text-sm mt-0.5">Live Clinical Consultation & Triage</p>
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-500 leading-relaxed">
          <strong>Assigned Coverage:</strong> Lucknow, Sitapur, Rampur, and regional health sub-centres. Connected to Primary Health Centre (PHC) catchment areas.
        </div>
      </div>
    </div>
  );
};

export default DoctorProfileTab;

