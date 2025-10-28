import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const getSpeechRecognition = () => {
  if (typeof window === 'undefined') return null;
  return (
    window.SpeechRecognition ||
    window.webkitSpeechRecognition ||
    window.mozSpeechRecognition ||
    window.msSpeechRecognition ||
    null
  );
};

export const useSpeechRecognition = ({ lang = 'zh-CN' } = {}) => {
  const Recognition = useMemo(() => getSpeechRecognition(), []);
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!Recognition) return undefined;
    const recognition = new Recognition();
    recognition.lang = lang;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const text = event.results?.[0]?.[0]?.transcript ?? '';
      setTranscript(text);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [Recognition, lang]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      return;
    }
    setError(null);
    setTranscript('');
    setIsListening(true);
    recognitionRef.current.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return {
    supported: Boolean(Recognition),
    transcript,
    isListening,
    error,
    startListening,
    stopListening,
    reset: () => setTranscript('')
  };
};
