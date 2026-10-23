import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface ListenButtonProps {
  text: string;
  className?: string;
  variant?: 'default' | 'compact';
}

const ListenButton = ({ text, className, variant = 'default' }: ListenButtonProps) => {
  const { speak, stop, isLoading, isSpeaking } = useTextToSpeech();
  const { t } = useLanguage();

  const handleClick = () => {
    if (isSpeaking) {
      stop();
    } else {
      speak(text);
    }
  };

  if (variant === 'compact') {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        disabled={isLoading}
        className={cn('gap-1.5', className)}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isSpeaking ? (
          <VolumeX className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
        {isSpeaking ? 'Stop' : 'Listen'}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        'gap-2 bg-primary/5 border-primary/20 hover:bg-primary/10 hover:border-primary/30',
        isSpeaking && 'bg-primary/15 border-primary/40',
        className
      )}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{t('loading')}...</span>
        </>
      ) : isSpeaking ? (
        <>
          <VolumeX className="w-4 h-4" />
          <span>Stop</span>
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4" />
          <span>{t('listenToStep')}</span>
        </>
      )}
    </Button>
  );
};

export default ListenButton;
