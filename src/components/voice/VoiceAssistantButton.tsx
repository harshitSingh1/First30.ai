import { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import VoiceAssistantModal from './VoiceAssistantModal';

const VoiceAssistantButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-24 right-4 z-40',
          'w-14 h-14 rounded-full',
          'bg-primary text-primary-foreground',
          'flex items-center justify-center',
          'shadow-lg transition-all duration-300',
          'hover:scale-110 active:scale-95',
          'glow-primary',
          isListening && 'animate-pulse-glow'
        )}
        aria-label="Open voice assistant"
      >
        {isListening ? (
          <MicOff className="w-6 h-6" />
        ) : (
          <Mic className="w-6 h-6" />
        )}
      </button>

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal 
        isOpen={isOpen} 
        onClose={() => {
          setIsOpen(false);
          setIsListening(false);
        }}
        isListening={isListening}
        setIsListening={setIsListening}
      />
    </>
  );
};

export default VoiceAssistantButton;
