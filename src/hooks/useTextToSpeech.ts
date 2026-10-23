import { useState, useCallback, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cprAudio } from '@/services/cprAudio';

interface UseTextToSpeechReturn {
  speak: (text: string) => Promise<void>;
  replay: () => Promise<void>;
  stop: () => void;
  isLoading: boolean;
  isSpeaking: boolean;
  error: string | null;
  lastSpokenText: string | null;
  isOfflineAudio: boolean;
}

export const useTextToSpeech = (): UseTextToSpeechReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineAudio, setIsOfflineAudio] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSpokenTextRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const activeRequestIdRef = useRef<number>(0);
  const availableVoicesRef = useRef<SpeechSynthesisVoice[]>([]);

  const { language: currentLanguage } = useLanguage();

  // Populate Web Speech API voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const updateVoices = () => {
        try {
          availableVoicesRef.current = window.speechSynthesis.getVoices();
        } catch {
          // Ignore
        }
      };
      updateVoices();
      window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
      };
    }
  }, []);

  const stop = useCallback(() => {
    // Abort pending fetch
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Cancel Web Audio Ducking back to 100%
    cprAudio.setDucking(1.0);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  const speak = useCallback(
    async (text: string) => {
      if (!text || !text.trim()) return;

      // Stop any active or pending speech
      stop();

      // Bump request sequence ID
      activeRequestIdRef.current += 1;
      const thisRequestId = activeRequestIdRef.current;

      lastSpokenTextRef.current = text;
      setIsLoading(true);
      setError(null);

      const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;
      setIsOfflineAudio(isOffline);

      // Only attempt remote ElevenLabs if online and Supabase is configured
      const hasSupabase =
        !isOffline &&
        Boolean(
          import.meta.env.VITE_SUPABASE_URL &&
            !import.meta.env.VITE_SUPABASE_URL.includes('placeholder') &&
            import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY &&
            !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY.includes('placeholder')
        );

      if (hasSupabase) {
        try {
          const controller = new AbortController();
          abortControllerRef.current = controller;

          const response = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
              },
              body: JSON.stringify({
                text,
                language: currentLanguage,
              }),
              signal: controller.signal,
            }
          );

          // If a newer speech request started in the meantime, discard this response
          if (activeRequestIdRef.current !== thisRequestId) {
            return;
          }

          if (response.ok) {
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);

            const audio = new Audio(audioUrl);
            audioRef.current = audio;

            audio.onended = () => {
              if (activeRequestIdRef.current === thisRequestId) {
                setIsSpeaking(false);
                cprAudio.setDucking(1.0);
              }
              URL.revokeObjectURL(audioUrl);
              audioRef.current = null;
            };

            audio.onerror = () => {
              if (activeRequestIdRef.current === thisRequestId) {
                setIsSpeaking(false);
                cprAudio.setDucking(1.0);
                setError('Failed to play audio');
              }
              URL.revokeObjectURL(audioUrl);
              audioRef.current = null;
            };

            // Duck CPR audio to 30% while speech plays
            cprAudio.setDucking(0.3);
            setIsSpeaking(true);
            setIsLoading(false);
            await audio.play();
            return;
          }
        } catch (e: unknown) {
          if (e instanceof DOMException && e.name === 'AbortError') {
            return; // Clean intentional abort
          }
          console.warn('ElevenLabs TTS unavailable, falling back to local SpeechSynthesis:', e);
        }
      }

      // Check request freshness before attempting Web Speech fallback
      if (activeRequestIdRef.current !== thisRequestId) {
        return;
      }

      // Web Speech API fallback (works 100% offline with device-installed voices)
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text);
          const langMap: Record<string, string> = {
            en: 'en-US',
            de: 'de-DE',
            es: 'es-ES',
            fr: 'fr-FR',
            hi: 'hi-IN',
          };
          const targetLang = langMap[currentLanguage] || 'en-US';
          utterance.lang = targetLang;
          utterance.rate = 0.95;

          // Attempt to attach matched voice if available
          const voices = availableVoicesRef.current.length > 0
            ? availableVoicesRef.current
            : window.speechSynthesis.getVoices();
          const matchedVoice = voices.find((v) => v.lang.startsWith(targetLang.slice(0, 2)));
          if (matchedVoice) {
            utterance.voice = matchedVoice;
          }

          utterance.onstart = () => {
            if (activeRequestIdRef.current === thisRequestId) {
              cprAudio.setDucking(0.3);
              setIsSpeaking(true);
              setIsLoading(false);
            }
          };

          utterance.onend = () => {
            if (activeRequestIdRef.current === thisRequestId) {
              setIsSpeaking(false);
              cprAudio.setDucking(1.0);
            }
          };

          utterance.onerror = (ev) => {
            if (activeRequestIdRef.current === thisRequestId) {
              setIsSpeaking(false);
              cprAudio.setDucking(1.0);
              setIsLoading(false);
              // Non-blocking notification
              if (ev.error !== 'canceled' && ev.error !== 'interrupted') {
                setError('Local voice synthesis unavailable. Written instructions remain active.');
              }
            }
          };

          window.speechSynthesis.speak(utterance);
          return;
        } catch (e) {
          console.warn('SpeechSynthesis error:', e);
          setError('Audio narration unavailable. Written instructions remain active.');
        }
      } else {
        setError('Browser speech synthesis unsupported. Written guidance remains available.');
      }

      setIsLoading(false);
    },
    [currentLanguage, stop]
  );

  const replay = useCallback(async () => {
    if (lastSpokenTextRef.current) {
      await speak(lastSpokenTextRef.current);
    }
  }, [speak]);

  // Clean cleanup on hook unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    speak,
    replay,
    stop,
    isLoading,
    isSpeaking,
    error,
    lastSpokenText: lastSpokenTextRef.current,
    isOfflineAudio,
  };
};

export default useTextToSpeech;
