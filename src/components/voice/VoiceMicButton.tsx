import { Mic, MicOff, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceMicButtonProps {
  isListening: boolean;
  isProcessing?: boolean;
  isSupported: boolean;
  onClick: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const VoiceMicButton = ({
  isListening,
  isProcessing = false,
  isSupported,
  onClick,
  size = 'lg',
  className,
}: VoiceMicButtonProps) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
  };

  if (!isSupported) {
    return (
      <button
        disabled
        className={cn(
          sizeClasses[size],
          'rounded-full bg-muted text-muted-foreground',
          'flex items-center justify-center',
          'cursor-not-allowed opacity-50',
          className
        )}
        aria-label="Speech recognition not supported"
      >
        <MicOff className={iconSizes[size]} />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={isProcessing}
      className={cn(
        sizeClasses[size],
        'rounded-full relative',
        'flex items-center justify-center',
        'transition-all duration-300',
        'focus:outline-none focus:ring-4 focus:ring-primary/30',
        isListening
          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/40'
          : 'bg-secondary hover:bg-secondary/80 text-foreground',
        isProcessing && 'opacity-70 cursor-wait',
        !isProcessing && !isListening && 'hover:scale-105 active:scale-95',
        className
      )}
      aria-label={isListening ? 'Stop listening' : 'Start listening'}
    >
      {/* Pulse rings when listening */}
      {isListening && (
        <>
          <span className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
          <span className="absolute inset-[-8px] rounded-full border-2 border-primary/20 animate-pulse" />
          <span className="absolute inset-[-16px] rounded-full border border-primary/10 animate-pulse delay-150" />
        </>
      )}

      {/* Icon */}
      <span className="relative z-10">
        {isProcessing ? (
          <Loader2 className={cn(iconSizes[size], 'animate-spin')} />
        ) : isListening ? (
          <MicOff className={iconSizes[size]} />
        ) : (
          <Mic className={iconSizes[size]} />
        )}
      </span>
    </button>
  );
};

export default VoiceMicButton;
