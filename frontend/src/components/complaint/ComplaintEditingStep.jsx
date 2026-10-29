import React from 'react';
import Button from '../Button';

export const ComplaintEditingStep = ({ formData, setFormData, setStep, t }) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 animate-in slide-in-from-right">
      <h3 className="text-xl font-bold mb-6 border-b border-gray-100 pb-4">{t('change_info')}</h3>
      
      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm text-neutral-muted mb-1">{t('what_problem')}</label>
          <input 
            type="text" 
            value={formData.problem}
            onChange={e => setFormData({ ...formData, problem: e.target.value })}
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm text-neutral-muted mb-1">{t('how_long')}</label>
          <input 
            type="text" 
            value={formData.duration}
            onChange={e => setFormData({ ...formData, duration: e.target.value })}
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm text-neutral-muted mb-1">{t('any_other')}</label>
          <input 
            type="text" 
            value={formData.additionalSymptoms}
            onChange={e => setFormData({ ...formData, additionalSymptoms: e.target.value })}
            className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <Button 
        size="lg" 
        className="w-full" 
        onClick={() => {
          setFormData(prev => ({ ...prev, needsConfirmation: false }));
          setStep('REVIEW');
        }}
      >
        {t('confirm_info')}
      </Button>
    </div>
  );
};

export default ComplaintEditingStep;

