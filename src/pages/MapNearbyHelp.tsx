import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import InteractiveMapReal from '@/components/map/InteractiveMapReal';
import NearbyServiceCard from '@/components/map/NearbyServiceCard';
import VoiceAssistantButton from '@/components/voice/VoiceAssistantButton';
import { useNearbyServices } from '@/hooks/useNearbyServices';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Pill, 
  Shield, 
  Flame, 
  MapPin, 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  Navigation, 
  WifiOff, 
  Phone,
  Search,
  Compass,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

const filterTabs = [
  { value: '', label: 'All', icon: MapPin },
  { value: 'hospital', label: 'Hospitals', icon: Building2 },
  { value: 'pharmacy', label: 'Pharmacy', icon: Pill },
  { value: 'police', label: 'Police', icon: Shield },
  { value: 'fire', label: 'Fire', icon: Flame },
];

const POPULAR_CITIES = [
  'New Delhi',
  'Mumbai',
  'London',
  'Berlin',
  'New York',
  'San Francisco',
];

const MapNearbyHelp = () => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const { t } = useLanguage();
  const { 
    services, 
    userLocation, 
    locationName,
    isLoading, 
    error, 
    permissionState,
    requestLocation,
    searchByCity,
    refresh,
    useFallback,
  } = useNearbyServices();

  const handleCitySearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    await searchByCity(searchQuery.trim());
  };

  const handleQuickCitySelect = async (city: string) => {
    setSearchQuery(city);
    await searchByCity(city);
  };

  const filteredServices = selectedType 
    ? services.filter(s => s.type === selectedType)
    : services;

  return (
    <Layout showEmergencyBanner>
      <div className="container mx-auto px-4 py-6 pb-32 max-w-5xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">{t('citizen.nearby')}</h1>
          <p className="text-muted-foreground text-sm md:text-base">{t('citizen.nearby.desc')}</p>
        </div>

        {/* Offline notice when connectivity is unavailable */}
        {typeof navigator !== 'undefined' && !navigator.onLine && (
          <div className="rounded-2xl p-4 mb-6 border border-amber-500/40 bg-amber-500/10 text-amber-200">
            <div className="flex items-start gap-3">
              <WifiOff className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-foreground text-sm">Live Facility Radar Offline</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Live OpenStreetMap discovery requires network connectivity. If you need immediate emergency transit or paramedic dispatch, call emergency services directly.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <a
                    href="tel:112"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call Emergency Services
                  </a>
                  <Button variant="outline" size="sm" asChild className="text-xs h-8 rounded-xl">
                    <Link to="/citizen">Access 15 Offline Protocols</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Location & City Search Toolbar */}
        <div className="premium-card p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* GPS Trigger */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Compass className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Find Facilities Near You</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Your coordinates stay local in your browser to calculate distances to the nearest hospitals, pharmacies, and police stations.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Button 
                  onClick={requestLocation} 
                  disabled={isLoading}
                  className="gap-2 min-h-[44px] rounded-xl font-semibold text-xs sm:text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Locating...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" />
                      {t('common.useLocation')}
                    </>
                  )}
                </Button>
                {userLocation && (
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-300 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="truncate max-w-[200px]">{locationName || 'Location Detected'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* City or Area Search Fallback */}
            <div className="flex-1 border-t md:border-t-0 md:border-l border-border/60 pt-4 md:pt-0 md:pl-6">
              <label htmlFor="city-search" className="block text-xs font-semibold text-foreground mb-1.5">
                Or Search by City / Area (No GPS Required)
              </label>
              <form onSubmit={handleCitySearch} className="flex gap-2">
                <Input
                  id="city-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. New Delhi, London, Berlin, Austin..."
                  className="flex-1 min-h-[44px] text-xs sm:text-sm rounded-xl"
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !searchQuery.trim()}
                  className="min-h-[44px] px-4 rounded-xl"
                >
                  <Search className="w-4 h-4 mr-1 sm:mr-1.5" />
                  <span className="text-xs sm:text-sm">{t('common.search')}</span>
                </Button>
              </form>

              {/* Popular City Quick-Chips */}
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-muted-foreground mr-1">Quick:</span>
                {POPULAR_CITIES.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => handleQuickCitySelect(city)}
                    className="text-[11px] px-2 py-0.5 rounded-lg bg-secondary/80 hover:bg-secondary text-foreground hover:text-primary transition-colors border border-border/40"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actionable Permission Denied Guidance (Never a dead end!) */}
        {permissionState === 'denied' && (
          <div className="premium-card p-4 md:p-5 mb-6 border-amber-500/40 bg-amber-500/5">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  Location Access Blocked by Browser
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-2.5">
                  Your browser blocked GPS permission. To enable live GPS: tap the lock or settings icon (🔒) in your address bar &rarr; select <strong>&quot;Allow Location&quot;</strong> &rarr; click <strong>&quot;Retry Location&quot;</strong>.
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={requestLocation} 
                    disabled={isLoading}
                    className="text-xs min-h-[36px] rounded-lg"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    Retry Location
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Or use the city search bar above to look up facilities anywhere without GPS.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error message banner */}
        {error && permissionState !== 'denied' && (
          <div className="premium-card p-3 mb-6 flex items-center gap-3 border-amber-500/30 bg-amber-500/5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-xs text-foreground">{error}</p>
          </div>
        )}

        {/* Data Provenance Header */}
        <div className="flex items-center justify-between p-3 mb-4 rounded-xl bg-secondary/40 border border-border/40 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="font-medium text-foreground">
              {useFallback ? 'Demonstration Perimeter Data' : 'OpenStreetMap Live Public Radar'}
            </span>
          </div>
          {useFallback ? (
            <span className="text-[11px] text-muted-foreground">
              Sample perimeter fallback active
            </span>
          ) : (
            <span className="text-[11px] text-teal-400 font-medium">
              Overpass API Live Query
            </span>
          )}
        </div>

        {/* Filter tabs */}
        <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1.5 bg-secondary/50 rounded-xl">
            {filterTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger 
                  key={tab.value} 
                  value={tab.value}
                  className={cn(
                    'flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-3 px-3 rounded-lg',
                    'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-medium">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Interactive Map */}
        <div className="mb-8">
          <InteractiveMapReal 
            services={services} 
            selectedType={selectedType || undefined}
            userLocation={userLocation}
            isLoading={isLoading}
          />
        </div>

        {/* Services list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              {selectedType ? filterTabs.find(t => t.value === selectedType)?.label : 'All Services'}
            </h2>
            <div className="flex items-center gap-2">
              {userLocation && (
                <Button variant="ghost" size="sm" onClick={refresh} disabled={isLoading}>
                  <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
                </Button>
              )}
              <span className="text-sm text-muted-foreground px-3 py-1 rounded-full bg-secondary/50">
                {filteredServices.length} found
              </span>
            </div>
          </div>
          
          {isLoading && services.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredServices.map((service) => (
                <NearbyServiceCard 
                  key={service.id} 
                  service={service}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Voice Assistant Floating Button */}
      <VoiceAssistantButton />
    </Layout>
  );
};

export default MapNearbyHelp;
