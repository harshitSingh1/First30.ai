import { useState, useEffect, useCallback, useRef } from 'react';
import { Language } from '@/contexts/LanguageContext';

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onstart: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export interface TranscriptEntry {
  id: string;
  text: string;
  timestamp: Date;
  isFinal: boolean;
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  transcript: TranscriptEntry[];
  interimTranscript: string;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

const languageMap: Record<Language, string> = {
  en: 'en-US',
  hinglish: 'hi-IN',
  hi: 'hi-IN',
  de: 'de-DE',
  es: 'es-ES',
  fr: 'fr-FR',
};

export const useSpeechRecognition = (language: Language): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isSupported = typeof window !== 'undefined' && 
    (!!window.SpeechRecognition || !!window.webkitSpeechRecognition);

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = languageMap[language] || 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;
        
        if (result.isFinal) {
          const entry: TranscriptEntry = {
            id: `${Date.now()}-${i}`,
            text: text.trim(),
            timestamp: new Date(),
            isFinal: true,
          };
          setTranscript(prev => [...prev, entry]);
          setInterimTranscript('');
        } else {
          interim += text;
        }
      }
      
      if (interim) {
        setInterimTranscript(interim);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.warn('Speech recognition error:', event.error);
      let humanMsg = event.error;
      if (event.error === 'not-allowed') {
        humanMsg = 'Microphone access is not allowed or was dismissed. Use manual typing mode below.';
      } else if (event.error === 'no-speech') {
        humanMsg = 'No speech detected. Tap the mic to try again, or type below.';
      } else if (event.error === 'audio-capture') {
        humanMsg = 'No microphone found on your device. Please use typing mode below.';
      } else if (event.error === 'network') {
        humanMsg = 'Voice recognition network service unavailable. Please type your response below.';
      }
      setError(humanMsg);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [isSupported, language]);

  // Update language when it changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = languageMap[language] || 'en-US';
    }
  }, [language]);

  const startListening = useCallback(() => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setError('Voice recognition requires an active internet connection. Use manual input or select an emergency flow directly.');
      return;
    }
    if (recognitionRef.current && !isListening) {
      setError(null);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Failed to start recognition:', e);
        setError('Speech recognition could not be started');
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript([]);
    setInterimTranscript('');
    setError(null);
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
};
