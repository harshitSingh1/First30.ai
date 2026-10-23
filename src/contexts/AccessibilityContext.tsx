import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface AccessibilityContextType {
  accessibleMode: boolean;
  setAccessibleMode: (enabled: boolean) => void;
  autoReadEnabled: boolean;
  setAutoReadEnabled: (enabled: boolean) => void;
  largeTextEnabled: boolean;
  highContrastEnabled: boolean;
  isReading: boolean;
  setIsReading: (reading: boolean) => void;
  speakText: (text: string) => void;
  stopSpeaking: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
  const [accessibleMode, setAccessibleModeState] = useState(false);
  const [autoReadEnabled, setAutoReadEnabledState] = useState(false);
  const [isReading, setIsReading] = useState(false);

  // When accessible mode is enabled, also enable auto-read and large text
  const setAccessibleMode = (enabled: boolean) => {
    setAccessibleModeState(enabled);
    if (enabled) {
      setAutoReadEnabledState(true);
    }
  };

  const setAutoReadEnabled = (enabled: boolean) => {
    setAutoReadEnabledState(enabled);
  };

  // Use browser's Web Speech API for TTS
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9; // Slightly slower for clarity
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsReading(true);
      utterance.onend = () => setIsReading(false);
      utterance.onerror = () => setIsReading(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        accessibleMode,
        setAccessibleMode,
        autoReadEnabled,
        setAutoReadEnabled,
        largeTextEnabled: accessibleMode,
        highContrastEnabled: accessibleMode,
        isReading,
        setIsReading,
        speakText,
        stopSpeaking,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
