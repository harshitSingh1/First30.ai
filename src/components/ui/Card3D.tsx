import { useState, useRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Card3DProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'primary' | 'emergency' | 'success' | 'warning';
  intensity?: 'subtle' | 'medium' | 'strong';
}

const glowColors = {
  primary: 'hsl(187 85% 43%)',
  emergency: 'hsl(0 84% 60%)',
  success: 'hsl(160 84% 39%)',
  warning: 'hsl(38 92% 50%)',
};

const Card3D = ({ 
  children, 
  className, 
  glowColor = 'primary',
  intensity = 'subtle' 
}: Card3DProps) => {
  const [transform, setTransform] = useState('');
  const [glowStyle, setGlowStyle] = useState({});
  const cardRef = useRef<HTMLDivElement>(null);

  const intensityValues = {
    subtle: { rotate: 3, glow: 0.15 },
    medium: { rotate: 6, glow: 0.25 },
    strong: { rotate: 10, glow: 0.4 },
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -intensityValues[intensity].rotate;
    const rotateY = ((x - centerX) / centerX) * intensityValues[intensity].rotate;
    
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`);
    
    const glowX = (x / rect.width) * 100;
    const glowY = (y / rect.height) * 100;
    
    setGlowStyle({
      background: `radial-gradient(circle at ${glowX}% ${glowY}%, ${glowColors[glowColor]} / ${intensityValues[intensity].glow}, transparent 50%)`,
    });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)');
    setGlowStyle({});
  };

  return (
    <div
      ref={cardRef}
      className={cn(
        'relative glass-card overflow-hidden transition-all duration-300 ease-out',
        className
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
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default Card3D;
