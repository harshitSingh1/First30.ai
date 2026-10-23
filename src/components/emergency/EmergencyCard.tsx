import { Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import { 
  Droplets, 
  Wind, 
  Heart, 
  Flame, 
  AlertCircle, 
  Zap,
  LucideIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmergencyCardProps {
  id: string;
  category: string;
  icon: string;
  description: string;
  priorityHint?: 'P1' | 'P2' | 'P3' | 'P4';
  size?: 'default' | 'large';
}

const iconMap: Record<string, LucideIcon> = {
  droplets: Droplets,
  wind: Wind,
  heart: Heart,
  flame: Flame,
  'alert-circle': AlertCircle,
  zap: Zap,
};

// Calm priority styling without thick left stripes
const priorityStyles = {
  P1: { 
    border: 'border-border/80 hover:border-blue-500/50', 
    glow: 'hsl(220 80% 50%)',
    iconBg: 'bg-blue-500/15',
    iconText: 'text-blue-400',
    tag: 'P1 · Critical',
    tagClass: 'text-blue-400 bg-blue-500/10'
  },
  P2: { 
    border: 'border-border/80 hover:border-amber-500/50', 
    glow: 'hsl(38 85% 55%)',
    iconBg: 'bg-amber-500/15',
    iconText: 'text-amber-400',
    tag: 'P2 · High Urgency',
    tagClass: 'text-amber-400 bg-amber-500/10'
  },
  P3: { 
    border: 'border-border/80 hover:border-teal-500/50', 
    glow: 'hsl(175 70% 42%)',
    iconBg: 'bg-teal-500/15',
    iconText: 'text-teal-400',
    tag: 'P3 · Moderate',
    tagClass: 'text-teal-400 bg-teal-500/10'
  },
  P4: { 
    border: 'border-border/80 hover:border-slate-500/50', 
    glow: 'hsl(210 18% 40%)',
    iconBg: 'bg-slate-500/15',
    iconText: 'text-slate-400',
    tag: 'P4 · Routine',
    tagClass: 'text-slate-400 bg-secondary'
  },
};

const EmergencyCard = ({
  id,
  category,
  icon,
  description,
  priorityHint = 'P2',
  size = 'default',
}: EmergencyCardProps) => {
  const IconComponent = iconMap[icon] || AlertCircle;
  const style = priorityStyles[priorityHint];
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [transform, setTransform] = useState('');
  const [glowStyle, setGlowStyle] = useState({});

  const sizeClasses = size === 'large' 
    ? 'min-h-[150px] p-6' 
    : 'min-h-[120px] p-5';

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;
    
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.01)`);
    
    const glowX = (x / rect.width) * 100;
    const glowY = (y / rect.height) * 100;
    
    setGlowStyle({
      background: `radial-gradient(circle at ${glowX}% ${glowY}%, ${style.glow} / 0.12, transparent 50%)`,
    });
  };

  const handleMouseLeave = () => {
    setTransform('');
    setGlowStyle({});
  };

  return (
    <Link
      ref={cardRef}
      to={`/emergency/${id}`}
      className={cn(
        'rounded-2xl bg-card border relative overflow-hidden',
        style.border,
        sizeClasses,
        'flex flex-col justify-between',
        'cursor-pointer group shadow-xs hover:shadow-md',
        'transition-all duration-200 ease-out'
      )}
      style={{ transform }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Glow overlay */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={glowStyle}
      />

      <div className="relative z-10 flex items-start gap-4">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
          'group-hover:scale-105 transition-transform duration-200',
          style.iconBg
        )}>
          <IconComponent className={cn('w-6 h-6', style.iconText)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start sm:items-center justify-between flex-wrap gap-1.5 mb-1">
            <h3 className="text-base md:text-lg font-bold text-foreground group-hover:text-primary transition-colors break-words">
              {category}
            </h3>
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0', style.tagClass)}>
              {style.tag}
            </span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default EmergencyCard;
