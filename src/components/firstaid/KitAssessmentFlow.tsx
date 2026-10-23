import { kitQuestions, KitAssessment } from '@/data/firstAidKitData';
import KitStepCard from './KitStepCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KitAssessmentFlowProps {
  currentStep: number;
  totalSteps: number;
  assessment: Partial<KitAssessment>;
  onUpdate: (field: keyof KitAssessment, value: any) => void;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  isValid: boolean;
}

const KitAssessmentFlow = ({
  currentStep,
  totalSteps,
  assessment,
  onUpdate,
  onNext,
  onPrev,
  onSkip,
  isValid,
}: KitAssessmentFlowProps) => {
  const question = kitQuestions[currentStep];
  const progress = ((currentStep + 1) / totalSteps) * 100;
  const value = assessment[question.id as keyof KitAssessment];
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>Step {currentStep + 1} of {totalSteps}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2 bg-secondary/50" />
      </div>

      {/* Question Card */}
      <div className="premium-card p-8 mb-8 animate-fade-in">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {question.title}
          </h2>
          {question.subtitle && (
            <p className="text-lg text-muted-foreground">
              {question.subtitle}
            </p>
          )}
          {question.optional && (
            <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-secondary/50 text-muted-foreground rounded-full">
              Optional
            </span>
          )}
        </div>

        <KitStepCard
          question={question}
          value={value}
          onChange={(newValue) => onUpdate(question.id as keyof KitAssessment, newValue)}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={currentStep === 0}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>

        <div className="flex gap-3">
          {question.optional && (
            <Button
              variant="ghost"
              onClick={onSkip}
              className="gap-2 text-muted-foreground"
            >
              Skip
              <SkipForward className="w-4 h-4" />
            </Button>
          )}
          
          <Button
            onClick={onNext}
            disabled={!isValid && !question.optional}
            className={cn(
              "gap-2 min-w-[140px]",
              isLastStep && "bg-primary hover:bg-primary/90"
            )}
          >
            {isLastStep ? 'Generate My Kit' : 'Continue'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default KitAssessmentFlow;
