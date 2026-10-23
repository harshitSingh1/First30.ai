import { Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { IntakeQuestion } from '@/hooks/useVoiceIntake';
import { useLanguage } from '@/contexts/LanguageContext';

interface VoiceQuestionCardProps {
  question: IntakeQuestion;
  onOptionSelect: (value: string) => void;
  onSpeak?: () => void;
  isSpeaking?: boolean;
  className?: string;
}

const VoiceQuestionCard = ({
  question,
  onOptionSelect,
  onSpeak,
  isSpeaking = false,
  className,
}: VoiceQuestionCardProps) => {
  const { t } = useLanguage();

  // Get translated question text
  const questionText = t(question.questionKey);

  return (
    <div className={cn('premium-card p-6', className)}>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
            Current Question
          </p>
          <h3 className="text-xl font-semibold text-foreground leading-relaxed">
            {questionText}
          </h3>
        </div>

        {onSpeak && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onSpeak}
            disabled={isSpeaking}
            className="flex-shrink-0"
          >
            {isSpeaking ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
        )}
      </div>

      {/* Quick answer options */}
      {question.options && question.options.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground mb-3">
            Quick answers (or speak your response):
          </p>
          <div className="flex flex-wrap gap-2">
            {question.options.map((option) => (
              <Button
                key={option.value}
                variant="outline"
                onClick={() => onOptionSelect(option.value)}
                className="text-sm"
              >
                {t(option.labelKey)}
              </Button>
            ))}
          </div>
        </div>
      )}

      {!question.options && (
        <p className="text-sm text-muted-foreground">
          Please speak your answer or type below.
        </p>
      )}
    </div>
  );
};

export default VoiceQuestionCard;
