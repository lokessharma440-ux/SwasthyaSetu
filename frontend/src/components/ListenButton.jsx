import React from 'react';
import { Volume2, Square, AlertCircle } from 'lucide-react';
import Button from './Button';
import useSpeechSynthesis from '../hooks/useSpeechSynthesis';
import { useLanguage } from '../context/LanguageContext';

const ListenButton = ({ text, large = false }) => {
  const { isSupported, isSpeaking, speak, stop } = useSpeechSynthesis();
  const { t } = useLanguage();

  const handleToggle = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-md border border-orange-100">
        <AlertCircle className="w-3 h-3" />
        <span>Voice not supported</span>
      </div>
    );
  }

  return (
    <Button 
      variant="outline"
      size={large ? 'lg' : 'sm'}
      className={`flex items-center gap-2 ${large ? 'px-8 py-4 text-xl rounded-2xl w-full justify-center font-bold shadow-sm' : ''} ${
        isSpeaking 
          ? 'border-blue-500 text-blue-700 bg-blue-50 hover:bg-blue-100' 
          : 'bg-white hover:bg-gray-50 border-gray-300'
      }`}
      onClick={handleToggle}
    >
      {isSpeaking ? (
        <>
          <Square className={`${large ? 'w-6 h-6' : 'w-4 h-4'} fill-current`} />
          {t('stop')}
        </>
      ) : (
        <>
          <Volume2 className={`${large ? 'w-8 h-8' : 'w-5 h-5'}`} />
          {t('listen')}
        </>
      )}
    </Button>
  );
};

export default ListenButton;
