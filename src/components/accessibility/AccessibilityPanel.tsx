import { useAccessibility } from '@/contexts/AccessibilityContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import LanguageSelector from './LanguageSelector';
import { Accessibility, Volume2, Eye, Type } from 'lucide-react';

interface AccessibilityPanelProps {
  showLanguage?: boolean;
  compact?: boolean;
}

const AccessibilityPanel = ({ showLanguage = true, compact = false }: AccessibilityPanelProps) => {
  const { 
    accessibleMode, 
    setAccessibleMode, 
    autoReadEnabled, 
    setAutoReadEnabled,
    largeTextEnabled,
    highContrastEnabled,
  } = useAccessibility();
  const { t } = useLanguage();

  if (compact) {
    return (
      <div className="flex items-center gap-4 flex-wrap">
        {showLanguage && <LanguageSelector variant="compact" />}
        
        <div className="flex items-center gap-2">
          <Switch 
            id="auto-read-compact" 
            checked={autoReadEnabled}
            onCheckedChange={setAutoReadEnabled}
          />
          <Label htmlFor="auto-read-compact" className="text-sm cursor-pointer">
            <Volume2 className="w-4 h-4 inline mr-1" />
            Auto-read
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Switch 
            id="accessible-compact" 
            checked={accessibleMode}
            onCheckedChange={setAccessibleMode}
          />
          <Label htmlFor="accessible-compact" className="text-sm cursor-pointer">
            <Accessibility className="w-4 h-4 inline mr-1" />
            Accessible
          </Label>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-card p-5 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Accessibility className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">{t('accessibleMode')}</h3>
      </div>

      {showLanguage && (
        <div className="flex items-center justify-between">
          <Label className="text-sm text-foreground">{t('language')}</Label>
          <LanguageSelector />
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <Label htmlFor="auto-read" className="text-sm cursor-pointer">
            {t('autoRead')}
          </Label>
        </div>
        <Switch 
          id="auto-read" 
          checked={autoReadEnabled}
          onCheckedChange={setAutoReadEnabled}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Accessibility className="w-4 h-4 text-muted-foreground" />
          <Label htmlFor="accessible-mode" className="text-sm cursor-pointer">
            {t('accessibleMode')}
          </Label>
        </div>
        <Switch 
          id="accessible-mode" 
          checked={accessibleMode}
          onCheckedChange={setAccessibleMode}
        />
      </div>

      {accessibleMode && (
        <div className="pl-4 space-y-2 border-l-2 border-primary/30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Type className="w-4 h-4" />
            <span>Large text enabled</span>
            {largeTextEnabled && <span className="text-primary">✓</span>}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Eye className="w-4 h-4" />
            <span>High contrast enabled</span>
            {highContrastEnabled && <span className="text-primary">✓</span>}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessibilityPanel;
