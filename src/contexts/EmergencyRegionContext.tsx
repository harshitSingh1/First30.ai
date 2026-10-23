import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface EmergencyRegion {
  code: string;
  name: string;
  number: string;
  flag: string;
}

export const EMERGENCY_REGIONS: EmergencyRegion[] = [
  { code: 'US', name: 'United States & Canada', number: '911', flag: '🇺🇸' },
  { code: 'EU', name: 'European Union', number: '112', flag: '🇪🇺' },
  { code: 'GB', name: 'United Kingdom', number: '999', flag: '🇬🇧' },
  { code: 'IN', name: 'India', number: '112', flag: '🇮🇳' },
  { code: 'AU', name: 'Australia', number: '000', flag: '🇦🇺' },
  { code: 'NZ', name: 'New Zealand', number: '111', flag: '🇳🇿' },
  { code: 'JP', name: 'Japan', number: '119', flag: '🇯🇵' },
  { code: 'DE', name: 'Germany', number: '112', flag: '🇩🇪' },
  { code: 'FR', name: 'France', number: '112', flag: '🇫🇷' },
  { code: 'ES', name: 'Spain', number: '112', flag: '🇪🇸' },
];

interface EmergencyRegionContextType {
  emergencyNumber: string;
  selectedCountry: string;
  setEmergencyNumber: (num: string) => void;
  setRegionByCountryCode: (code: string) => void;
  toggleStandardNumber: () => void; // Quick toggle between 911 and 112
}

const EmergencyRegionContext = createContext<EmergencyRegionContextType | undefined>(undefined);

export const EmergencyRegionProvider = ({ children }: { children: ReactNode }) => {
  const sanitizeNumber = (num: string): string => {
    return num.replace(/[^\d+]/g, '') || '911';
  };

  const [emergencyNumber, setEmergencyNumberState] = useState<string>(() => {
    const saved = localStorage.getItem('first30_emergency_number');
    if (saved) {
      return sanitizeNumber(saved);
    }
    return '911';
  });

  const [selectedCountry, setSelectedCountryState] = useState<string>(() => {
    return localStorage.getItem('first30_country_code') || 'US';
  });

  useEffect(() => {
    const clean = sanitizeNumber(emergencyNumber);
    if (clean !== emergencyNumber) {
      setEmergencyNumberState(clean);
    }
    localStorage.setItem('first30_emergency_number', clean);
  }, [emergencyNumber]);

  useEffect(() => {
    localStorage.setItem('first30_country_code', selectedCountry);
  }, [selectedCountry]);

  const setEmergencyNumber = (num: string) => {
    setEmergencyNumberState(sanitizeNumber(num));
  };

  const setRegionByCountryCode = (code: string) => {
    setSelectedCountryState(code);
    const found = EMERGENCY_REGIONS.find((r) => r.code === code);
    if (found) {
      setEmergencyNumberState(sanitizeNumber(found.number));
    }
  };

  const toggleStandardNumber = () => {
    const currentClean = sanitizeNumber(emergencyNumber);
    if (currentClean === '911') {
      setEmergencyNumberState('112');
      setSelectedCountryState('EU');
    } else {
      setEmergencyNumberState('911');
      setSelectedCountryState('US');
    }
  };

  return (
    <EmergencyRegionContext.Provider
      value={{
        emergencyNumber,
        selectedCountry,
        setEmergencyNumber,
        setRegionByCountryCode,
        toggleStandardNumber,
      }}
    >
      {children}
    </EmergencyRegionContext.Provider>
  );
};

export const useEmergencyRegion = () => {
  const context = useContext(EmergencyRegionContext);
  if (!context) {
    throw new Error('useEmergencyRegion must be used within an EmergencyRegionProvider');
  }
  return context;
};
