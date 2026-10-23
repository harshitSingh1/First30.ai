import { AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface SafetyAlertBannerProps {
  variant?: 'warning' | 'danger' | 'info';
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const variantStyles = {
  warning: {
    bg: 'bg-warning/10 border-warning/30',
    icon: AlertTriangle,
    iconColor: 'text-warning',
    textColor: 'text-warning',
  },
  danger: {
    bg: 'bg-emergency/10 border-emergency/30',
    icon: XCircle,
    iconColor: 'text-emergency',
    textColor: 'text-emergency',
  },
  info: {
    bg: 'bg-primary/10 border-primary/30',
    icon: Info,
    iconColor: 'text-primary',
    textColor: 'text-primary',
  },
};

const SafetyAlertBanner = ({
  variant = 'warning',
  message,
  dismissible = false,
  onDismiss,
}: SafetyAlertBannerProps) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const styles = variantStyles[variant];
  const IconComponent = styles.icon;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  if (isDismissed) return null;

  return (
    <div className={`p-4 rounded-xl border ${styles.bg} flex items-start gap-3`}>
      <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${styles.iconColor}`} />
      <p className={`flex-1 text-sm ${styles.textColor}`}>{message}</p>
      {dismissible && (
        <Button
          variant="ghost"
          size="sm"
          className={`h-6 w-6 p-0 ${styles.iconColor} hover:bg-transparent`}
          onClick={handleDismiss}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default SafetyAlertBanner;
