import { Play, Pause, RotateCcw, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmergencyTimerProps {
  formattedTime: string;
  isRunning: boolean;
  onToggle: () => void;
  onReset: () => void;
  showCPRRhythm?: boolean;
  compressionCount?: number;
  breathCount?: number;
  isCompressionPhase?: boolean;
}

const EmergencyTimer = ({
  formattedTime,
  isRunning,
  onToggle,
  onReset,
  showCPRRhythm = false,
  compressionCount = 0,
  breathCount = 0,
  isCompressionPhase = true,
}: EmergencyTimerProps) => {
  return (
    <div className="glass-card-strong p-6 md:p-8">
      {/* Timer display */}
      <div className="text-center mb-6">
        <div className="text-6xl md:text-8xl font-mono font-bold text-foreground mb-2 tracking-tight">
          {formattedTime}
        </div>
        <p className="text-muted-foreground">Elapsed Time</p>
      </div>

      {/* CPR Rhythm section */}
      {showCPRRhythm && (
        <div className="mb-6">
          {/* Visual rhythm indicator */}
          <div className="flex justify-center mb-4">
            <div className={`
              w-24 h-24 rounded-full flex items-center justify-center
              ${isCompressionPhase 
                ? 'bg-emergency/20 border-2 border-emergency' 
                : 'bg-primary/20 border-2 border-primary'}
              ${isRunning ? 'pulse-cpr' : ''}
            `}>
              <Heart className={`w-12 h-12 ${isCompressionPhase ? 'text-emergency' : 'text-primary'}`} />
            </div>
          </div>

          {/* Phase indicator */}
          <div className="text-center mb-4">
            <p className="text-2xl font-bold text-foreground">
              {isCompressionPhase ? '30 Compressions' : '2 Rescue Breaths'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              100-120 compressions per minute
            </p>
          </div>

          {/* Counters */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="glass-card p-4">
              <p className="text-3xl font-bold text-foreground">{compressionCount}</p>
              <p className="text-sm text-muted-foreground">Compressions</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-3xl font-bold text-foreground">{breathCount}</p>
              <p className="text-sm text-muted-foreground">Breaths</p>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={onToggle}
          size="lg"
          className={`
            h-14 px-8 rounded-2xl font-semibold text-lg
            ${isRunning 
              ? 'bg-warning hover:bg-warning/90 text-warning-foreground' 
              : 'bg-success hover:bg-success/90 text-success-foreground glow-success'}
          `}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Start
            </>
          )}
        </Button>
        <Button
          onClick={onReset}
          size="lg"
          variant="outline"
          className="h-14 px-6 rounded-2xl"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default EmergencyTimer;
