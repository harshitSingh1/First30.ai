import { useRef, useEffect } from 'react';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TranscriptEntry } from '@/hooks/useSpeechRecognition';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

interface VoiceIntakeTranscriptProps {
  messages: Message[];
  interimTranscript: string;
  isListening: boolean;
  className?: string;
}

const VoiceIntakeTranscript = ({
  messages,
  interimTranscript,
  isListening,
  className,
}: VoiceIntakeTranscriptProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, interimTranscript]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <h3 className="text-lg font-semibold text-foreground">Live Transcript</h3>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin"
      >
        {messages.length === 0 && !interimTranscript && (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-center">
              {isListening 
                ? 'Listening... Speak now.' 
                : 'Click the microphone to start speaking.'
              }
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3 animate-fade-in',
              message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
              message.type === 'user' 
                ? 'bg-primary/20 text-primary' 
                : 'bg-secondary text-secondary-foreground'
            )}>
              {message.type === 'user' ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>

            <div className={cn(
              'max-w-[80%] rounded-2xl px-4 py-3',
              message.type === 'user'
                ? 'bg-primary text-primary-foreground rounded-br-md'
                : 'bg-secondary text-secondary-foreground rounded-bl-md'
            )}>
              <p className="text-sm leading-relaxed">{message.text}</p>
              <span className="text-xs opacity-60 mt-1 block">
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {/* Interim transcript (currently being spoken) */}
        {interimTranscript && (
          <div className="flex gap-3 flex-row-reverse animate-fade-in">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/20 text-primary">
              <User className="w-4 h-4" />
            </div>
            <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-primary/50 text-primary-foreground rounded-br-md">
              <p className="text-sm leading-relaxed opacity-80">{interimTranscript}</p>
              <span className="text-xs opacity-50 mt-1 block">Speaking...</span>
            </div>
          </div>
        )}

        {/* Listening indicator */}
        {isListening && !interimTranscript && messages.length > 0 && (
          <div className="flex items-center gap-2 text-muted-foreground pl-11">
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
    </div>
  );
};

export default VoiceIntakeTranscript;
