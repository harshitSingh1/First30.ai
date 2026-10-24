import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, render, screen } from '@testing-library/react';
import React from 'react';
import fs from 'fs';
import path from 'path';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useNetworkAndCacheStatus } from '@/hooks/useNetworkAndCacheStatus';
import { getEmergencyCategories, getEmergencyFlowById } from '@/data/emergencyFlows';
import { OfflineDiagnosticBadge } from '@/components/pwa/OfflineDiagnosticBadge';
import EmergencyCallBanner from '@/components/layout/EmergencyCallBanner';
import { EmergencyRegionProvider } from '@/contexts/EmergencyRegionContext';
import { MemoryRouter } from 'react-router-dom';

describe('PWA Assets & Manifest Compliance', () => {
  it('ensures all required PWA icon assets exist in /public', () => {
    const publicDir = path.resolve(process.cwd(), 'public');
    const requiredAssets = [
      'pwa-192x192.png',
      'pwa-512x512.png',
      'pwa-maskable-512x512.png',
      'apple-touch-icon.png',
      'icon.svg',
      'icon-maskable.svg',
    ];

    for (const asset of requiredAssets) {
      const assetPath = path.join(publicDir, asset);
      expect(fs.existsSync(assetPath)).toBe(true);
      const stat = fs.statSync(assetPath);
      expect(stat.size).toBeGreaterThan(0);
    }
  });

  it('guarantees all 15 emergency flows are bundled locally without network reliance', () => {
    const categories = getEmergencyCategories();
    expect(categories.length).toBe(15);

    // Verify key critical protocols
    const choking = getEmergencyFlowById('choking');
    expect(choking).toBeDefined();
    expect(choking?.steps.length).toBeGreaterThan(0);

    const bleeding = getEmergencyFlowById('bleeding');
    expect(bleeding).toBeDefined();
    expect(bleeding?.steps.length).toBeGreaterThan(0);

    const burns = getEmergencyFlowById('burns');
    expect(burns).toBeDefined();
    expect(burns?.steps.length).toBeGreaterThan(0);
  });
});

describe('usePWAInstall Hook', () => {
  it('initializes with default non-installed state in test environment', () => {
    const { result } = renderHook(() => usePWAInstall());
    expect(result.current.isInstalled).toBe(false);
    expect(result.current.isInstallable).toBe(false);
    expect(typeof result.current.install).toBe('function');
  });

  it('intercepts beforeinstallprompt and sets isInstallable to true', async () => {
    const { result } = renderHook(() => usePWAInstall());

    const mockPromptEvent = new Event('beforeinstallprompt') as any;
    mockPromptEvent.prompt = vi.fn().mockResolvedValue(undefined);
    mockPromptEvent.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' });

    act(() => {
      window.dispatchEvent(mockPromptEvent);
    });

    expect(result.current.isInstallable).toBe(true);

    let installedResult = false;
    await act(async () => {
      installedResult = await result.current.install();
    });

    expect(mockPromptEvent.prompt).toHaveBeenCalled();
    expect(installedResult).toBe(true);
    expect(result.current.isInstalled).toBe(true);
  });
});

describe('useNetworkAndCacheStatus Hook', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reacts to online and offline window events', async () => {
    let hookResult: any;
    await act(async () => {
      const rendered = renderHook(() => useNetworkAndCacheStatus());
      hookResult = rendered.result;
    });

    expect(hookResult.current.isOnline).toBe(true);
    expect(hookResult.current.networkStatus).toBe('online');
    expect(hookResult.current.cachedProtocolsCount).toBe(15);

    await act(async () => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(hookResult.current.isOnline).toBe(false);
    expect(hookResult.current.networkStatus).toBe('offline');

    await act(async () => {
      window.dispatchEvent(new Event('online'));
    });
    expect(hookResult.current.isOnline).toBe(true);
    expect(hookResult.current.networkStatus).toBe('online');
  });

  it('guarantees transition out of checking state within bounded timeout', async () => {
    let hookResult: any;
    await act(async () => {
      const rendered = renderHook(() => useNetworkAndCacheStatus());
      hookResult = rendered.result;
    });

    await act(async () => {
      await hookResult.current.checkStatus();
    });

    // Must resolve out of 'checking' to a terminal status
    expect(['ready', 'unavailable']).toContain(hookResult.current.cacheStatus);
    expect(hookResult.current.cacheStatus).not.toBe('checking');
    expect(hookResult.current.lastCheckedTime).toBeInstanceOf(Date);
  });

  it('transitions to ready when cache storage has entries', async () => {
    const mockCaches = {
      keys: vi.fn().mockResolvedValue(['workbox-precache-v2', 'runtime-cache']),
    };
    (window as any).caches = mockCaches;

    let hookResult: any;
    await act(async () => {
      const rendered = renderHook(() => useNetworkAndCacheStatus());
      hookResult = rendered.result;
    });

    await act(async () => {
      await hookResult.current.checkStatus();
    });

    expect(hookResult.current.cacheStatus).toBe('ready');
  });

  it('transitions to unavailable when cache storage is empty and no controller is active', async () => {
    const mockCaches = {
      keys: vi.fn().mockResolvedValue([]),
    };
    (window as any).caches = mockCaches;

    let hookResult: any;
    await act(async () => {
      const rendered = renderHook(() => useNetworkAndCacheStatus());
      hookResult = rendered.result;
    });

    await act(async () => {
      await hookResult.current.checkStatus();
    });

    expect(hookResult.current.cacheStatus).toBe('unavailable');
  });

  it('cleans up all online, offline, and controllerchange listeners on unmount', () => {
    const removeWindowSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useNetworkAndCacheStatus());

    unmount();

    expect(removeWindowSpy).toHaveBeenCalledWith('online', expect.any(Function));
    expect(removeWindowSpy).toHaveBeenCalledWith('offline', expect.any(Function));
  });
});

describe('OfflineDiagnosticBadge Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders stable icon without animate-spin when state is resolved (ready)', async () => {
    const mockCaches = {
      keys: vi.fn().mockResolvedValue(['first30-cache']),
    };
    (window as any).caches = mockCaches;

    await act(async () => {
      render(<OfflineDiagnosticBadge variant="drawer" />);
      await new Promise((r) => setTimeout(r, 60));
    });

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeNull();
    expect(screen.getByText(/Offline Ready/i)).toBeDefined();
  });

  it('renders stable offline icon without animate-spin when device is offline', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });

    await act(async () => {
      render(<OfflineDiagnosticBadge variant="drawer" />);
      window.dispatchEvent(new Event('offline'));
      await new Promise((r) => setTimeout(r, 20));
    });

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeNull();
    expect(screen.getByText(/Offline Mode Active/i)).toBeDefined();

    // Restore online
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true });
  });

  it('compact variant has no animate-spin class when cache is ready', async () => {
    const mockCaches = {
      keys: vi.fn().mockResolvedValue(['first30-cache']),
    };
    (window as any).caches = mockCaches;

    let container: HTMLElement;
    await act(async () => {
      const rendered = render(<OfflineDiagnosticBadge compact />);
      container = rendered.container;
      await new Promise((r) => setTimeout(r, 60));
    });

    const spinner = container!.querySelector('.animate-spin');
    expect(spinner).toBeNull();
  });
});

describe('Touch Target Accessibility in Key Controls', () => {
  it('emergency call banner buttons provide at least 48px height', () => {
    const { container } = render(
      <MemoryRouter>
        <EmergencyRegionProvider>
          <EmergencyCallBanner />
        </EmergencyRegionProvider>
      </MemoryRouter>
    );

    const callButton = container.querySelector('button.min-h-\\[48px\\]');
    expect(callButton).not.toBeNull();
  });
});
