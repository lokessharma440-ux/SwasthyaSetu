import React from 'react';
import { UserCheck } from 'lucide-react';
import Button from '../Button';

export const UnregisteredPrompt = ({ onQuickRegister, onNavigateRegister, t }) => {
  return (
    <div className="flex flex-col h-full max-w-lg mx-auto pb-4 items-center justify-center text-center px-4">
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6 shadow-sm">
        <UserCheck className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-bold text-neutral-text mb-2">Welcome to SwasthyaSetu</h2>
      <p className="text-neutral-muted mb-6 text-sm">
        Please register your profile, or quick-start to speak your health problem immediately for Dr. Demo Sharma.
      </p>
      <div className="w-full space-y-3">
        <Button size="lg" className="w-full" onClick={onQuickRegister}>
          Quick Start Consultation (Lokesh Sharma)
        </Button>
        <Button variant="outline" size="lg" className="w-full" onClick={onNavigateRegister}>
          {t('speak_profile')}
        </Button>
      </div>
    </div>
  );
};

export default UnregisteredPrompt;

