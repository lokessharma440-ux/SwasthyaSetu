import React from 'react';
import { Clock, Loader2, Send } from 'lucide-react';
import Button from '../Button';

export const ComplaintReviewStep = ({
  formData,
  countdown,
  setCountdown,
  handleConfirm,
  setStep,
  isSubmitting,
  t
}) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-in slide-in-from-right">
      <div className="text-center mb-5 border-b border-gray-100 pb-4">
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 inline-block mb-2">
          Consultation Request Ready
        </span>
        <h3 className="text-2xl font-extrabold text-neutral-text">{t('confirm_info')}</h3>
        <p className="text-xs text-neutral-muted mt-1">
          Your consultation request will be sent to <strong>Dr. Demo Sharma (General Medicine)</strong>
        </p>
      </div>

      <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 mb-5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-1">
          Spoken Statement
        </span>
        <p className="text-neutral-text text-base italic font-medium">"{formData.originalStatement || formData.problem}"</p>
      </div>

      <div className="space-y-3 mb-6">
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
          <p className="text-neutral-muted text-xs font-bold uppercase tracking-wider">{t('what_problem')}</p>
          <p className="font-extrabold text-lg text-slate-800 mt-0.5">{formData.problem}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <p className="text-neutral-muted text-xs font-bold uppercase tracking-wider">{t('how_long')}</p>
            <p className="font-bold text-base text-slate-800 mt-0.5">{formData.duration || 'Not specified'}</p>
          </div>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <p className="text-neutral-muted text-xs font-bold uppercase tracking-wider">{t('any_other')}</p>
            <p className="font-bold text-base text-slate-800 mt-0.5">{formData.additionalSymptoms || 'None'}</p>
          </div>
        </div>
      </div>

      {/* Auto-Submit Countdown Bar */}
      {countdown !== null && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 mb-5 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 animate-spin" />
            <span>
              Auto-sending to doctor in <strong>{countdown}s</strong>...
            </span>
          </div>
          <button
            onClick={() => setCountdown(null)}
            className="text-amber-700 underline font-bold hover:text-amber-900 text-[11px]"
          >
            Pause Timer
          </button>
        </div>
      )}

      <div className="space-y-3">
        <Button 
          size="lg" 
          className="w-full flex items-center justify-center gap-2 py-4 text-base font-bold bg-emerald-600 hover:bg-emerald-700 shadow-md active:scale-98" 
          onClick={() => {
            setCountdown(null);
            handleConfirm();
          }} 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
          <span>✓ Send to Doctor Dashboard Now</span>
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="w-full py-3 text-sm font-semibold" 
          onClick={() => {
            setCountdown(null);
            setStep('EDITING');
          }} 
          disabled={isSubmitting}
        >
          {t('change_info')}
        </Button>
      </div>
    </div>
  );
};

export default ComplaintReviewStep;

