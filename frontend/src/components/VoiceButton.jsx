import React, { useState } from 'react';
import { Mic, Loader2, CheckCircle, AlertCircle, Square } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const VoiceButton = ({
  onComplete,
  idleText,
  idleSubtext = '',
  completedText,
  completedSubtext = '',
  mockResult = "मुझे बुखार है और सिर में दर्द हो रहा है।",
  simulateError = false,

  // Phase 4 Controlled Props
  controlledState, // if provided, overrides internal state
  onClickOverride, // if provided, called instead of mock timer
  interimTextOverride // optionally show transcript in real time
}) => {
  const [internalState, setInternalState] = useState('idle');
  const { t } = useLanguage();

  const state = controlledState || internalState;

  const handlePress = () => {
    if (onClickOverride) {
      onClickOverride();
      return;
    }

    // Mock processing behavior if not controlled
    if (state !== 'idle' && state !== 'error') return;

    setInternalState('listening');

    setTimeout(() => {
      setInternalState('processing');

      setTimeout(() => {
        if (simulateError) {
          setInternalState('error');
          if (onComplete) onComplete(null, new Error('Simulated error'));
          setTimeout(() => setInternalState('idle'), 3000);
        } else {
          setInternalState('completed');
          if (onComplete) onComplete(mockResult);
          setTimeout(() => setInternalState('idle'), 2000);
        }
      }, 2000);
    }, 3000);
  };

  const states = {
    idle: {
      icon: <Mic className="w-16 h-16 text-white" />,
      text: idleText || t('tell_problem'),
      subtext: idleSubtext,
      bgClass: 'bg-primary hover:bg-primary-dark',
      animation: ''
    },
    listening: {
      icon: <Square className="w-12 h-12 text-white" />, // Square icon indicates 'stop'
      text: t('listening'),
      subtext: interimTextOverride || t('keep_speaking'),
      bgClass: 'bg-red-500',
      animation: 'animate-pulse'
    },
    processing: {
      icon: <Loader2 className="w-16 h-16 text-white animate-spin" />,
      text: t('processing'),
      subtext: t('please_wait'),
      bgClass: 'bg-yellow-500',
      animation: ''
    },
    completed: {
      icon: <CheckCircle className="w-16 h-16 text-white" />,
      text: completedText || t('saved'),
      subtext: completedSubtext,
      bgClass: 'bg-green-600',
      animation: ''
    },
    error: {
      icon: <AlertCircle className="w-16 h-16 text-white" />,
      text: t('error_speech'),
      subtext: t('please_repeat'),
      bgClass: 'bg-red-600',
      animation: ''
    }
  };

  const currentState = states[state] || states.idle;

  return (
    <div className="flex flex-col items-center justify-center w-full my-6">
      <button
        onClick={handlePress}
        className={`relative flex items-center justify-center w-36 h-36 md:w-40 md:h-40 rounded-full shadow-lg transition-all duration-300 ${currentState.bgClass} ${currentState.animation}`}
        aria-label={currentState.text}
      >
        {currentState.icon}

        {state === 'listening' && (
          <>
            <span className="absolute w-full h-full rounded-full bg-red-400 opacity-50 animate-ping" style={{ animationDuration: '1.5s' }}></span>
            <span className="absolute w-full h-full rounded-full bg-red-300 opacity-30 animate-ping" style={{ animationDuration: '2s' }}></span>
          </>
        )}
      </button>

      <div className="mt-6 text-center px-4 w-full">
        <h2 className="text-2xl font-bold text-neutral-text mb-2">{currentState.text}</h2>
        <p className={`text-lg text-neutral-muted ${state === 'listening' && interimTextOverride ? 'italic text-primary' : ''}`}>
          {currentState.subtext}
        </p>
      </div>
    </div>
  );
};

export default VoiceButton;
