import React from 'react';
import { cn } from '@/lib/utils';

export interface BrandLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  textSize?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className,
  size = 'md',
  showText = true,
  textSize,
}) => {
  const containerSizes = {
    xs: 'w-6 h-6 rounded-lg p-0.5',
    sm: 'w-8 h-8 rounded-xl p-0.5',
    md: 'w-9 h-9 rounded-xl p-0.5',
    lg: 'w-10 h-10 rounded-xl p-1',
    xl: 'w-14 h-14 rounded-2xl p-1.5',
  };

  const textSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg md:text-xl',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  return (
    <div className={cn('flex items-center gap-2.5 shrink-0 group', className)}>
      <div
        className={cn(
          'relative bg-white shadow-xs border border-white/20 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 overflow-hidden',
          containerSizes[size]
        )}
      >
        <img
          src="/assets/aistudio/Teal_Healthcare_Cross_Emblem_ee6d56f6.png"
          alt="First30.ai Logo"
          className="w-full h-full object-contain"
          loading="eager"
        />
      </div>
      {showText && (
        <span
          className={cn(
            'font-bold tracking-tight text-foreground whitespace-nowrap',
            textSize || textSizes[size]
          )}
        >
          First30<span className="text-primary">.ai</span>
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
