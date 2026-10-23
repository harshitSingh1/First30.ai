import { useLanguage, Language } from '@/contexts/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSelectorProps {
  variant?: 'default' | 'compact' | 'drawer' | 'full';
  className?: string;
}

const languages: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hinglish', name: 'Hinglish', nativeName: 'Hinglish' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
];

const LanguageSelector = ({ variant = 'default', className }: LanguageSelectorProps) => {
  const { language: currentLanguage, setLanguage } = useLanguage();
  const currentLangObj = languages.find((l) => l.code === currentLanguage) || languages[0];
  const isDrawer = variant === 'drawer' || variant === 'full';

  return (
    <Select value={currentLanguage} onValueChange={(value) => setLanguage(value as Language)}>
      <SelectTrigger 
        className={cn(
          'border-border/50 transition-colors',
          variant === 'compact' 
            ? 'w-[92px] h-9 bg-secondary/50 px-2' 
            : isDrawer
            ? 'w-full h-11 px-3 bg-secondary/40 hover:bg-secondary/60 rounded-xl'
            : 'w-[110px] bg-secondary/50 px-2.5',
          className
        )}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <Globe className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="truncate text-xs font-semibold text-foreground">
            {currentLangObj.nativeName}
          </span>
        </div>
      </SelectTrigger>
      <SelectContent className="bg-popover border-border max-h-60 z-50 shadow-xl rounded-xl">
        {languages.map((lang) => {
          return (
            <SelectItem 
              key={lang.code} 
              value={lang.code}
              hideIndicator={true}
              className="cursor-pointer py-2 px-3 text-xs"
            >
              <span className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground">{lang.nativeName}</span>
                <span className="text-xs text-muted-foreground">({lang.name})</span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;
