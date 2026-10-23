import { 
  Heart, 
  Phone, 
  Shield, 
  Hand, 
  Wind, 
  AlertCircle, 
  Activity,
  Eye,
  Droplets,
  Flame,
  Zap,
  Timer,
  User,
  Brain,
  Thermometer,
  Stethoscope,
  Syringe,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StepIllustrationProps {
  imagePlaceholder?: string;
  className?: string;
}

const illustrationConfig: Record<string, { icon: React.ElementType; gradient: string; label: string }> = {
  // Safety and general
  'safety-gloves': { icon: Shield, gradient: 'from-teal-500/20 to-cyan-500/20', label: 'Safety First' },
  'call-emergency': { icon: Phone, gradient: 'from-blue-500/20 to-indigo-500/20', label: 'Call for Help' },
  'call-help': { icon: Phone, gradient: 'from-blue-500/20 to-indigo-500/20', label: 'Emergency Call' },
  'call-severe': { icon: Phone, gradient: 'from-amber-500/20 to-orange-500/20', label: 'Seek Help' },
  'call-if-needed': { icon: Phone, gradient: 'from-blue-500/20 to-cyan-500/20', label: 'Call if Needed' },
  'call-poison': { icon: Phone, gradient: 'from-purple-500/20 to-pink-500/20', label: 'Poison Control' },
  
  // Bleeding & Wounds
  'apply-pressure': { icon: Hand, gradient: 'from-red-500/20 to-pink-500/20', label: 'Apply Pressure' },
  'add-layers': { icon: Hand, gradient: 'from-red-500/20 to-rose-500/20', label: 'Add Layers' },
  'embedded-object': { icon: AlertCircle, gradient: 'from-amber-500/20 to-yellow-500/20', label: 'Do Not Remove' },
  'elevate-limb': { icon: Activity, gradient: 'from-teal-500/20 to-emerald-500/20', label: 'Elevate' },
  'maintain-pressure': { icon: Timer, gradient: 'from-blue-500/20 to-cyan-500/20', label: 'Maintain Pressure' },
  'shock-signs': { icon: Activity, gradient: 'from-amber-500/20 to-orange-500/20', label: 'Watch for Shock' },
  'control-bleeding': { icon: Droplets, gradient: 'from-red-500/20 to-pink-500/20', label: 'Control Bleeding' },
  
  // Breathing & Airway
  'check-danger': { icon: Eye, gradient: 'from-amber-500/20 to-yellow-500/20', label: 'Check Area' },
  'check-response': { icon: User, gradient: 'from-blue-500/20 to-indigo-500/20', label: 'Check Response' },
  'open-airway': { icon: Wind, gradient: 'from-cyan-500/20 to-teal-500/20', label: 'Open Airway' },
  'check-breathing': { icon: Wind, gradient: 'from-teal-500/20 to-emerald-500/20', label: 'Check Breathing' },
  'recovery-position': { icon: User, gradient: 'from-green-500/20 to-emerald-500/20', label: 'Recovery Position' },
  'stay-calm': { icon: Heart, gradient: 'from-pink-500/20 to-rose-500/20', label: 'Stay Calm' },
  'use-inhaler': { icon: Wind, gradient: 'from-blue-500/20 to-cyan-500/20', label: 'Use Inhaler' },
  'loosen-clothing': { icon: User, gradient: 'from-teal-500/20 to-cyan-500/20', label: 'Loosen Clothing' },
  'tripod-position': { icon: User, gradient: 'from-blue-500/20 to-indigo-500/20', label: 'Tripod Position' },
  'slow-breathing': { icon: Wind, gradient: 'from-cyan-500/20 to-teal-500/20', label: 'Slow Breaths' },
  'monitor-signs': { icon: Activity, gradient: 'from-amber-500/20 to-orange-500/20', label: 'Monitor Signs' },
  
  // CPR
  'start-cpr': { icon: Heart, gradient: 'from-red-500/20 to-pink-500/20', label: 'Start CPR' },
  'find-aed': { icon: Zap, gradient: 'from-yellow-500/20 to-amber-500/20', label: 'Find AED' },
  'cpr-ready': { icon: Heart, gradient: 'from-red-500/20 to-rose-500/20', label: 'CPR Ready' },
  
  // Heart & Stroke
  'sit-down': { icon: User, gradient: 'from-blue-500/20 to-indigo-500/20', label: 'Sit Down' },
  'pain-location': { icon: Activity, gradient: 'from-red-500/20 to-pink-500/20', label: 'Pain Location' },
  'aspirin': { icon: Syringe, gradient: 'from-blue-500/20 to-cyan-500/20', label: 'Aspirin' },
  'keep-calm': { icon: Heart, gradient: 'from-pink-500/20 to-rose-500/20', label: 'Keep Calm' },
  'monitor-breathing': { icon: Stethoscope, gradient: 'from-teal-500/20 to-cyan-500/20', label: 'Monitor' },
  'fast-face': { icon: User, gradient: 'from-blue-500/20 to-indigo-500/20', label: 'F - Face' },
  'fast-arms': { icon: Activity, gradient: 'from-cyan-500/20 to-teal-500/20', label: 'A - Arms' },
  'fast-speech': { icon: User, gradient: 'from-teal-500/20 to-emerald-500/20', label: 'S - Speech' },
  'fast-time': { icon: Timer, gradient: 'from-amber-500/20 to-orange-500/20', label: 'T - Time' },
  'lay-down': { icon: User, gradient: 'from-blue-500/20 to-indigo-500/20', label: 'Lay Down' },
  'no-food': { icon: AlertCircle, gradient: 'from-red-500/20 to-pink-500/20', label: 'No Food' },
  
  // Choking
  'ask-choking': { icon: AlertCircle, gradient: 'from-amber-500/20 to-yellow-500/20', label: 'Ask' },
  'back-blows': { icon: Hand, gradient: 'from-blue-500/20 to-indigo-500/20', label: 'Back Blows' },
  'heimlich': { icon: Hand, gradient: 'from-teal-500/20 to-cyan-500/20', label: 'Abdominal Thrusts' },
  'alternate': { icon: Activity, gradient: 'from-blue-500/20 to-cyan-500/20', label: 'Alternate' },
  'unconscious-choking': { icon: Heart, gradient: 'from-red-500/20 to-pink-500/20', label: 'CPR' },
  'check-mouth': { icon: Eye, gradient: 'from-teal-500/20 to-emerald-500/20', label: 'Check Mouth' },
  
  // Burns
  'stop-drop-roll': { icon: Flame, gradient: 'from-orange-500/20 to-red-500/20', label: 'Stop Drop Roll' },
  'cool-water': { icon: Droplets, gradient: 'from-blue-500/20 to-cyan-500/20', label: 'Cool Water' },
  'remove-clothing': { icon: User, gradient: 'from-teal-500/20 to-cyan-500/20', label: 'Remove Clothing' },
  'assess-size': { icon: Hand, gradient: 'from-amber-500/20 to-yellow-500/20', label: 'Assess Size' },
  'cover-burn': { icon: Shield, gradient: 'from-teal-500/20 to-emerald-500/20', label: 'Cover Burn' },
  'no-pop': { icon: AlertCircle, gradient: 'from-red-500/20 to-pink-500/20', label: 'Do Not Pop' },
  
  // Seizure
  'clear-area': { icon: Shield, gradient: 'from-blue-500/20 to-indigo-500/20', label: 'Clear Area' },
  'no-restrain': { icon: AlertCircle, gradient: 'from-red-500/20 to-pink-500/20', label: 'Do Not Restrain' },
  'protect-head': { icon: Shield, gradient: 'from-teal-500/20 to-cyan-500/20', label: 'Protect Head' },
  'nothing-mouth': { icon: AlertCircle, gradient: 'from-amber-500/20 to-orange-500/20', label: 'Nothing in Mouth' },
  'time-seizure': { icon: Timer, gradient: 'from-blue-500/20 to-cyan-500/20', label: 'Time It' },
  'stay-reassure': { icon: Heart, gradient: 'from-pink-500/20 to-rose-500/20', label: 'Reassure' },
  
  // Fractures
  'no-move-spine': { icon: AlertCircle, gradient: 'from-red-500/20 to-pink-500/20', label: 'Do Not Move' },
  'keep-still': { icon: User, gradient: 'from-blue-500/20 to-indigo-500/20', label: 'Keep Still' },
  'apply-ice': { icon: Droplets, gradient: 'from-cyan-500/20 to-blue-500/20', label: 'Apply Ice' },
  'splint': { icon: Activity, gradient: 'from-teal-500/20 to-emerald-500/20', label: 'Splint' },
  'elevate': { icon: Activity, gradient: 'from-blue-500/20 to-cyan-500/20', label: 'Elevate' },
  'check-circulation': { icon: Activity, gradient: 'from-pink-500/20 to-rose-500/20', label: 'Check Circulation' },
  
  // Head injury
  'check-alert': { icon: Brain, gradient: 'from-purple-500/20 to-indigo-500/20', label: 'Check Alertness' },
  'red-flags': { icon: AlertCircle, gradient: 'from-red-500/20 to-pink-500/20', label: 'Red Flags' },
  'elevate-head': { icon: User, gradient: 'from-blue-500/20 to-cyan-500/20', label: 'Elevate Head' },
  'stay-awake': { icon: Eye, gradient: 'from-amber-500/20 to-yellow-500/20', label: 'Stay Awake' },
  
  // Poison
  'identify-substance': { icon: Eye, gradient: 'from-purple-500/20 to-pink-500/20', label: 'Identify' },
  'no-vomit': { icon: AlertCircle, gradient: 'from-red-500/20 to-pink-500/20', label: 'Do Not Vomit' },
  'rinse-skin': { icon: Droplets, gradient: 'from-blue-500/20 to-cyan-500/20', label: 'Rinse Skin' },
  'flush-eyes': { icon: Eye, gradient: 'from-cyan-500/20 to-teal-500/20', label: 'Flush Eyes' },
  'fresh-air': { icon: Wind, gradient: 'from-teal-500/20 to-emerald-500/20', label: 'Fresh Air' },
  'monitor-vitals': { icon: Activity, gradient: 'from-blue-500/20 to-indigo-500/20', label: 'Monitor Vitals' },
  
  // Allergy
  'use-epipen': { icon: Syringe, gradient: 'from-blue-500/20 to-cyan-500/20', label: 'Use EpiPen' },
  'position-person': { icon: User, gradient: 'from-teal-500/20 to-emerald-500/20', label: 'Position' },
  'remove-trigger': { icon: Shield, gradient: 'from-amber-500/20 to-yellow-500/20', label: 'Remove Trigger' },
  'watch-worsening': { icon: Eye, gradient: 'from-red-500/20 to-pink-500/20', label: 'Watch Signs' },
  
  // Fever
  'take-temp': { icon: Thermometer, gradient: 'from-red-500/20 to-orange-500/20', label: 'Take Temp' },
  'when-call': { icon: Phone, gradient: 'from-amber-500/20 to-orange-500/20', label: 'When to Call' },
  'fever-reducer': { icon: Syringe, gradient: 'from-blue-500/20 to-cyan-500/20', label: 'Medication' },
  'hydrate': { icon: Droplets, gradient: 'from-cyan-500/20 to-blue-500/20', label: 'Hydrate' },
  'dress-light': { icon: User, gradient: 'from-teal-500/20 to-cyan-500/20', label: 'Dress Light' },
  'sponge-bath': { icon: Droplets, gradient: 'from-blue-500/20 to-cyan-500/20', label: 'Sponge Bath' },
  
  // Electric shock
  'no-touch': { icon: AlertCircle, gradient: 'from-yellow-500/20 to-amber-500/20', label: 'Do Not Touch' },
  'turn-off-power': { icon: Zap, gradient: 'from-yellow-500/20 to-orange-500/20', label: 'Turn Off Power' },
  'stay-back': { icon: AlertCircle, gradient: 'from-red-500/20 to-pink-500/20', label: 'Stay Back' },
  'check-burns': { icon: Eye, gradient: 'from-orange-500/20 to-red-500/20', label: 'Check Burns' },
  'treat-shock': { icon: Activity, gradient: 'from-blue-500/20 to-indigo-500/20', label: 'Treat Shock' },
  
  // Drowning
  'rescue-water': { icon: Shield, gradient: 'from-blue-500/20 to-cyan-500/20', label: 'Rescue Safely' },
  'keep-warm': { icon: Thermometer, gradient: 'from-orange-500/20 to-red-500/20', label: 'Keep Warm' },
  'monitor': { icon: Eye, gradient: 'from-teal-500/20 to-emerald-500/20', label: 'Monitor' },
};

const StepIllustration = ({ imagePlaceholder, className }: StepIllustrationProps) => {
  const config = imagePlaceholder ? illustrationConfig[imagePlaceholder] : null;
  
  if (!config) {
    return (
      <div className={cn(
        'w-full aspect-video rounded-xl bg-gradient-to-br from-secondary/50 to-secondary/30',
        'flex items-center justify-center border border-border/30',
        className
      )}>
        <Activity className="w-12 h-12 text-muted-foreground/50" />
      </div>
    );
  }

  const Icon = config.icon;

  return (
    <div className={cn(
      'w-full aspect-video rounded-xl overflow-hidden',
      'bg-gradient-to-br border border-border/30',
      config.gradient,
      'flex flex-col items-center justify-center relative',
      className
    )}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: '20px 20px',
          }}
        />
      </div>
      
      {/* Icon with glow effect */}
      <div className="relative">
        <div className="absolute inset-0 blur-xl opacity-50">
          <Icon className="w-20 h-20 text-primary" />
        </div>
        <Icon className="w-20 h-20 text-primary relative z-10" />
      </div>
      
      {/* Label */}
      <span className="mt-3 text-sm font-medium text-foreground/80 relative z-10">
        {config.label}
      </span>
    </div>
  );
};

export default StepIllustration;
