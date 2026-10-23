import { Clock } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  elapsedTime?: string;
  showTime?: boolean;
}

const ProgressBar = ({
  currentStep,
  totalSteps,
  elapsedTime = '00:00',
  showTime = true,
}: ProgressBarProps) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-foreground">
          Step {currentStep} of {totalSteps}
        </span>
        {showTime && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="font-mono">{elapsedTime}</span>
          </div>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step dots */}
      <div className="flex justify-between mt-3">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i < currentStep
                ? 'bg-primary'
                : i === currentStep - 1
                ? 'bg-primary ring-2 ring-primary/30'
                : 'bg-secondary'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
