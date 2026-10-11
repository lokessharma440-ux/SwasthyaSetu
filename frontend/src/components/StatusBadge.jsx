import React from 'react';
import { Check, Clock, User, Eye, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const StatusBadge = ({ status, labelOverride }) => {
  const { t } = useLanguage();
  
  const statusConfig = {
    'saved': {
      label: t('saved'),
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: <Check className="w-4 h-4 mr-1.5" />
    },
    'pending_sync': {
      label: t('saved'),
      color: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      icon: <Clock className="w-4 h-4 mr-1.5" />
    },
    'sent': {
      label: t('sent'),
      color: 'bg-blue-50 text-blue-800 border-blue-200',
      icon: <CheckCircle2 className="w-4 h-4 mr-1.5" />
    },
    'viewed': {
      label: t('viewed'),
      color: 'bg-purple-50 text-purple-800 border-purple-200',
      icon: <Eye className="w-4 h-4 mr-1.5" />
    },
    'responded': {
      label: t('responded'),
      color: 'bg-green-50 text-green-800 border-green-200',
      icon: <User className="w-4 h-4 mr-1.5" />
    }
  };

  const config = statusConfig[status] || statusConfig['saved'];

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${config.color}`}>
      {config.icon}
      {labelOverride || config.label}
    </span>
  );
};

export default StatusBadge;
