import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScreenWakeLock } from '@/hooks/useScreenWakeLock';

describe('useScreenWakeLock', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('detects unsupported browsers gracefully without crashing', async () => {
    // Delete wakeLock property from navigator
    const originalNavigator = window.navigator;
    const navWithoutWakeLock = { ...originalNavigator };
    // @ts-expect-error test unsupported
    delete navWithoutWakeLock.wakeLock;

    Object.defineProperty(window, 'navigator', {
      value: navWithoutWakeLock,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useScreenWakeLock(false));

    expect(result.current.isSupported).toBe(false);
    expect(result.current.isActive).toBe(false);

    let success = false;
    await act(async () => {
      success = await result.current.request();
    });

    expect(success).toBe(false);
    expect(result.current.isActive).toBe(false);
    expect(result.current.error).toContain('not supported');

    // Restore navigator
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  it('acquires and releases wake lock on supported devices', async () => {
    const mockRelease = vi.fn().mockResolvedValue(undefined);
    const mockSentinel = {
      released: false,
      release: mockRelease,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    const mockRequest = vi.fn().mockResolvedValue(mockSentinel);

    Object.defineProperty(window.navigator, 'wakeLock', {
      value: { request: mockRequest },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useScreenWakeLock(false));

    expect(result.current.isSupported).toBe(true);
    expect(result.current.isActive).toBe(false);

    await act(async () => {
      const ok = await result.current.request();
      expect(ok).toBe(true);
    });

    expect(result.current.isActive).toBe(true);
    expect(mockRequest).toHaveBeenCalledWith('screen');

    await act(async () => {
      await result.current.release();
    });

    expect(result.current.isActive).toBe(false);
    expect(mockRelease).toHaveBeenCalled();
  });
});
