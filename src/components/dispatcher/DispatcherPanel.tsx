import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DispatcherPanelProps {
  title: string;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  headerExtra?: ReactNode;
}

const DispatcherPanel = ({ title, children, className = '', icon, headerExtra }: DispatcherPanelProps) => {
  return (
    <div className={cn("glass-card-strong flex flex-col h-full overflow-hidden", className)}>
      <div className="flex-shrink-0 px-4 py-3 border-b border-border/50 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon && <span className="text-primary">{icon}</span>}
            <h3 className="font-semibold text-foreground text-sm">{title}</h3>
          </div>
          {headerExtra}
        </div>
      </div>
      <div className="flex-1 overflow-hidden p-4">
        {children}
      </div>
    </div>
  );
};

export default DispatcherPanel;
