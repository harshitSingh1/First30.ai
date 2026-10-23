import { useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, ChevronRight, Waves, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  isListening: boolean;
  setIsListening: (value: boolean) => void;
}

const mockTranscript = [
  { type: 'user', text: 'I need help with CPR', timestamp: '0:02' },
  { type: 'assistant', text: 'I understand you need help with CPR. Is the person breathing?', timestamp: '0:04' },
  { type: 'user', text: 'No, they are not breathing', timestamp: '0:08' },
  { type: 'assistant', text: 'Start chest compressions immediately. Place the heel of your hand on the center of the chest.', timestamp: '0:10' },
];

const VoiceAssistantModal = ({ 
  isOpen, 
  onClose, 
  isListening, 
  setIsListening 
}: VoiceAssistantModalProps) => {
  const [readAloud, setReadAloud] = useState(false);
  const [transcript, setTranscript] = useState(mockTranscript);

  const handleStartListening = () => {
    setIsListening(true);
  };

  const handleStopListening = () => {
    setIsListening(false);
  };

  const handleGenerateNextStep = () => {
    setTranscript(prev => [
      ...prev,
      { 
        type: 'assistant', 
        text: 'Push hard and fast at 100-120 compressions per minute. Let me count for you: 1, 2, 3, 4...',
        timestamp: `0:${(prev.length * 2 + 2).toString().padStart(2, '0')}`
      }
    ]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md glass-card-strong border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center',
              isListening ? 'bg-primary/20' : 'bg-muted'
            )}>
              {isListening ? (
                <Waves className="w-4 h-4 text-primary animate-pulse" />
              ) : (
                <Mic className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            Voice Assistant
          </DialogTitle>
        </DialogHeader>

        {/* Transcript area */}
        <div className="h-64 overflow-y-auto rounded-xl bg-background/50 p-3 space-y-3">
          {transcript.map((entry, index) => (
            <div 
              key={index}
              className={cn(
                'flex gap-2',
                entry.type === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div className={cn(
                'max-w-[80%] rounded-2xl px-4 py-2',
                entry.type === 'user' 
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              )}>
                <p className="text-sm">{entry.text}</p>
                <span className="text-xs opacity-60">{entry.timestamp}</span>
              </div>
            </div>
          ))}
          
          {isListening && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="flex gap-1">
                <span className="w-1.5 h-4 bg-primary rounded-full animate-pulse" />
                <span className="w-1.5 h-6 bg-primary rounded-full animate-pulse delay-75" />
                <span className="w-1.5 h-3 bg-primary rounded-full animate-pulse delay-150" />
                <span className="w-1.5 h-5 bg-primary rounded-full animate-pulse delay-200" />
              </div>
              <span className="text-sm">Listening...</span>
            </div>
          )}
        </div>

        {/* Read aloud toggle */}
        <div className="flex items-center justify-between py-2 px-1">
          <div className="flex items-center gap-2">
            {readAloud ? (
              <Volume2 className="w-4 h-4 text-primary" />
            ) : (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="text-sm text-foreground">Read instructions aloud</span>
          </div>
          <Switch 
            checked={readAloud} 
            onCheckedChange={setReadAloud}
          />
        </div>

        {/* Control buttons */}
        <div className="flex gap-2">
          {isListening ? (
            <Button 
              onClick={handleStopListening}
              variant="destructive"
              className="flex-1"
            >
              <MicOff className="w-4 h-4 mr-2" />
              Stop
            </Button>
          ) : (
            <Button 
              onClick={handleStartListening}
              className="flex-1"
            >
              <Mic className="w-4 h-4 mr-2" />
              Start Listening
            </Button>
          )}
          <Button 
            onClick={handleGenerateNextStep}
            variant="outline"
            className="flex-1"
          >
            <ChevronRight className="w-4 h-4 mr-2" />
            Next Step
          </Button>
        </div>

        {/* Powered by note */}
        <p className="text-xs text-center text-muted-foreground">
          Voice powered by ElevenLabs (demo mode)
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default VoiceAssistantModal;
