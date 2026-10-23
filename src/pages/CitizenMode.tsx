import Layout from '@/components/layout/Layout';
import EmergencyCard from '@/components/emergency/EmergencyCard';
import AccessibilityPanel from '@/components/accessibility/AccessibilityPanel';
import OfflineDiagnosticBadge from '@/components/pwa/OfflineDiagnosticBadge';
import PWAInstallButton from '@/components/pwa/PWAInstallButton';
import { ArrowLeft, MapPin, Mic, Settings2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getEmergencyCategories } from '@/data/emergencyFlows';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const CitizenMode = () => {
  const categories = getEmergencyCategories();
  const { t } = useLanguage();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {t('nav.home')}
          </Link>
          
          <Sheet open={showSettings} onOpenChange={setShowSettings}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Settings2 className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-background border-border">
              <SheetHeader>
                <SheetTitle>{t('a11y.mode')}</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <AccessibilityPanel showLanguage={true} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Hero section */}
        <div className="text-center mb-6">
          <h1 className="text-heading-1 text-foreground mb-3">{t('citizen.title')}</h1>
          <p className="text-body-large text-muted-foreground max-w-xl mx-auto">
            {t('citizen.subtitle')}
          </p>
        </div>

        {/* Truthful Offline Diagnostic Status */}
        <div className="max-w-3xl mx-auto mb-8">
          <OfflineDiagnosticBadge />
        </div>

        {/* Emergency categories grid - 15 categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 max-w-6xl mx-auto">
          {categories.map((category) => (
            <EmergencyCard
              key={category.id}
              id={category.id}
              category={category.category}
              icon={category.icon}
              description={category.description}
              priorityHint={category.priorityHint}
              size="large"
            />
          ))}
        </div>

        {/* Quick action cards */}
        <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto mb-8">
          <div className="premium-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">{t('citizen.nearby')}</h3>
              <p className="text-sm text-muted-foreground truncate">{t('citizen.nearby.desc')}</p>
            </div>
            <Button variant="outline" size="sm" asChild className="flex-shrink-0">
              <Link to="/map">{t('common.viewmap')}</Link>
            </Button>
          </div>

          <div className="premium-card p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Mic className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground">{t('citizen.voice')}</h3>
              <p className="text-sm text-muted-foreground truncate">{t('citizen.voice.desc')}</p>
            </div>
            <Button variant="outline" size="sm" asChild className="flex-shrink-0">
              <Link to="/voice">{t('common.start')}</Link>
            </Button>
          </div>
        </div>

        {/* PWA Home Screen Installation Action */}
        <div className="max-w-3xl mx-auto">
          <PWAInstallButton variant="card" />
        </div>
      </div>
    </Layout>
  );
};

export default CitizenMode;
