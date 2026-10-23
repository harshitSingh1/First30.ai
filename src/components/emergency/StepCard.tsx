import { useState } from 'react';
import { AlertTriangle, Check, X, Phone, Timer, Heart, ArrowLeft } from 'lucide-react';
import { QuickQuestion } from '@/types/emergency';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface StepCardProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  instruction: string;
  warning?: string;
  alternatives?: string[];
  quickQuestion?: QuickQuestion;
  actionButton?: {
    label: string;
    action: 'cpr' | 'call911' | 'timer';
  };
  onDone?: () => void;
  onCant?: () => void;
  onPrevious?: () => void;
  isFirstStep?: boolean;
  isLastStep?: boolean;
  isTransitioning?: boolean;
  onQuickAnswer?: (questionId: string, question: string, answer: string) => void;
  onActionButton?: (action: 'cpr' | 'call911' | 'timer') => void;
  isAnimating?: boolean;
  className?: string;
}

const StepCard = ({
  stepNumber,
  totalSteps,
  title,
  instruction,
  warning,
  alternatives,
  quickQuestion,
  actionButton,
  onDone,
  onCant,
  onPrevious,
  isFirstStep = false,
  isLastStep = false,
  isTransitioning = false,
  onQuickAnswer,
  onActionButton,
  isAnimating = false,
  className,
}: StepCardProps) => {
  const { t } = useLanguage();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const handleQuickAnswer = (value: string, label: string) => {
    setSelectedAnswer(value);
    if (quickQuestion && onQuickAnswer) {
      onQuickAnswer(quickQuestion.id, quickQuestion.question, label);
    }
  };

  const actionIcons = {
    cpr: Heart,
    call911: Phone,
    timer: Timer,
  };

  return (
    <div className={cn("premium-card p-6 md:p-8 my-6", isAnimating && 'step-enter', className)}>
      {/* Main instruction */}
      <div className="mb-6">
        <h2 className="text-heading-2 text-foreground mb-4">
          {title}
        </h2>
        <p className="text-body-large text-muted-foreground leading-relaxed whitespace-pre-line">
          {instruction}
        </p>
      </div>

      {/* Warning if present - using amber instead of red */}
      {warning && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-300">{warning}</p>
        </div>
      )}

      {/* Action button if present */}
      {actionButton && (
        <div className="mb-6">
          <Button
            onClick={() => onActionButton?.(actionButton.action)}
            className={`w-full h-14 rounded-xl text-lg font-semibold flex items-center justify-center gap-3 ${
              actionButton.action === 'call911' 
                ? 'bg-blue-600 hover:bg-blue-600/90 text-white' 
                : actionButton.action === 'cpr'
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground glow-primary'
                : 'bg-secondary hover:bg-secondary/80'
            }`}
          >
            {(() => {
              const Icon = actionIcons[actionButton.action];
              return <Icon className="w-5 h-5" />;
            })()}
            {actionButton.label}
          </Button>
        </div>
      )}

      {/* Quick question if present */}
      {quickQuestion && (
        <div className="mb-6 p-4 rounded-xl bg-card border border-border">
          <p className="text-sm font-medium text-foreground mb-3">{quickQuestion.question}</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestion.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleQuickAnswer(option.value, option.label)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedAnswer === option.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary/50 text-foreground hover:bg-secondary'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Alternatives if present */}
      {alternatives && alternatives.length > 0 && (
        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">Alternatives:</p>
          <ul className="space-y-1">
            {alternatives.map((alt, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                {alt}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action buttons (Previous, I can't do this, Done/Finish) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-border/40">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={isFirstStep || isTransitioning}
          className="w-full h-14 rounded-2xl text-base font-semibold border-border hover:bg-muted text-foreground flex items-center justify-center gap-2 transition-colors min-h-[44px]"
        >
          <ArrowLeft className="w-5 h-5 shrink-0" />
          <span>{t('flow.previous')}</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCant}
          disabled={isTransitioning}
          className="w-full h-14 rounded-2xl text-base font-semibold text-muted-foreground hover:text-foreground border-border hover:bg-muted flex items-center justify-center gap-2 transition-colors min-h-[44px]"
        >
          <X className="w-5 h-5 shrink-0" />
          <span>{t('flow.cantDo')}</span>
        </Button>
        <Button
          type="button"
          onClick={onDone}
          disabled={isTransitioning}
          className="w-full h-14 rounded-2xl text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md flex items-center justify-center gap-2 transition-colors min-h-[44px]"
        >
          <Check className="w-5 h-5 shrink-0" />
          <span>{isLastStep ? t('flow.finish') : t('flow.done')}</span>
        </Button>
      </div>
    </div>
  );
};

export default StepCard;
