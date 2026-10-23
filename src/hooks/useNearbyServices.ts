import { useState, useCallback, useEffect } from 'react';
import { NearbyService } from '@/types/emergency';
import { 
  getUserLocation, 
  fetchNearbyServices, 
  searchLocationByQuery,
  UserLocation, 
  LocationError 
} from '@/services/locationService';
import { mockNearbyServices } from '@/data/emergencyFlows';
import { useLanguage } from '@/contexts/LanguageContext';

interface UseNearbyServicesReturn {
  services: NearbyService[];
  userLocation: UserLocation | null;
  locationName: string | null;
  isLoading: boolean;
  error: string | null;
  permissionState: 'prompt' | 'granted' | 'denied' | 'unknown';
  requestLocation: () => Promise<void>;
  searchByCity: (query: string) => Promise<boolean>;
  refresh: () => Promise<void>;
  useFallback: boolean;
}

export const useNearbyServices = (): UseNearbyServicesReturn => {
  const [services, setServices] = useState<NearbyService[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');
  const [useFallback, setUseFallback] = useState(false);
  const { language } = useLanguage();

  // Check permission state on mount
  useEffect(() => {
    const checkPermission = async () => {
      if ('permissions' in navigator) {
        try {
          const result = await navigator.permissions.query({ name: 'geolocation' });
          setPermissionState(result.state as 'prompt' | 'granted' | 'denied');
          
          result.onchange = () => {
            setPermissionState(result.state as 'prompt' | 'granted' | 'denied');
          };
        } catch {
          setPermissionState('unknown');
        }
      }
    };
    checkPermission();
  }, []);

  const fetchServices = useCallback(async (location: UserLocation) => {
    try {
      // Pass language preference to get localized names
      const nearbyServices = await fetchNearbyServices(location, language);
      if (nearbyServices.length > 0) {
        setServices(nearbyServices);
        setUseFallback(nearbyServices[0]?.dataSource !== 'overpass_live');
      } else {
        // No results from API, use fallback
        setServices(mockNearbyServices);
        setUseFallback(true);
      }
    } catch (e) {
      console.warn('[useNearbyServices] Fallback to emergency services:', e);
      // Use mock data as fallback
      setServices(mockNearbyServices);
      setUseFallback(true);
    }
  }, [language]);

  const requestLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const location = await getUserLocation();
      setUserLocation(location);
      setLocationName('Your Current GPS Location');
      setPermissionState('granted');
      await fetchServices(location);
    } catch (e) {
      const locationError = e as LocationError;
      if (locationError.code === 1) {
        setPermissionState('denied');
        setError('Location access was denied. You can search or select a city below to view local emergency facilities.');
      } else {
        setError(locationError.message || 'Location information is unavailable.');
      }
      if (!userLocation) {
        setServices(mockNearbyServices);
        setUseFallback(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchServices, userLocation]);

  const searchByCity = useCallback(async (query: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const match = await searchLocationByQuery(query);
      if (match) {
        const loc: UserLocation = { lat: match.lat, lng: match.lng };
        setUserLocation(loc);
        setLocationName(match.displayName);
        await fetchServices(loc);
        return true;
      } else {
        setError(`Could not find coordinates for "${query}". Try selecting a popular city below.`);
        return false;
      }
    } catch (e) {
      console.warn('City search failed:', e);
      setError('Search could not be completed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchServices]);

  const refresh = useCallback(async () => {
    if (userLocation) {
      setIsLoading(true);
      await fetchServices(userLocation);
      setIsLoading(false);
    } else {
      await requestLocation();
    }
  }, [userLocation, fetchServices, requestLocation]);

  // Auto-request if permission was already granted previously
  useEffect(() => {
    if (permissionState === 'granted' && !userLocation && !isLoading) {
      requestLocation();
    }
  }, [permissionState, userLocation, isLoading, requestLocation]);

  return {
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
  };
};
