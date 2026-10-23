import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import fs from 'fs';
import path from 'path';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useNetworkAndCacheStatus } from '@/hooks/useNetworkAndCacheStatus';
import { getEmergencyCategories, getEmergencyFlowById } from '@/data/emergencyFlows';

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

  it('reacts to online and offline window events', () => {
    const { result } = renderHook(() => useNetworkAndCacheStatus());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.cachedProtocolsCount).toBe(15);

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current.isOnline).toBe(false);

    act(() => {
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current.isOnline).toBe(true);
  });
});
