import React from 'react';
import { 
  Stethoscope, 
  Languages, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Loader2 
} from 'lucide-react';
import { previewDoctorTranslation } from '../../../services/api';

export const ClinicalResponseForm = ({
  complaint,
  formData,
  setFormData,
  handleSubmit,
  isSubmitting,
  successMsg,
  error,
  translationPreview,
  setTranslationPreview,
  isPreviewLoading,
  setIsPreviewLoading
}) => {
  return (
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
  );
};

export default ClinicalResponseForm;

