/**
 * Unit tests for the analytics service.
 * Tests the logCivicEvent function in dev mode fallback.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock firebase modules before importing
vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(),
  logEvent: vi.fn(),
  isSupported: vi.fn(() => Promise.resolve(false)),
}));

vi.mock('../../services/firebase', () => ({
  app: {},
}));

describe('Analytics Service', () => {
  let logCivicEvent;
  let consoleLogSpy;

  beforeEach(async () => {
    vi.resetModules();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const mod = await import('../../services/analytics');
    logCivicEvent = mod.logCivicEvent;
    // Give isSupported promise time to resolve
    await new Promise((r) => setTimeout(r, 10));
  });

  it('logCivicEvent is a function', () => {
    expect(typeof logCivicEvent).toBe('function');
  });

  it('logs to console in dev mode when analytics not supported', () => {
    logCivicEvent('test_event', { category: 'test' });
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('test_event'),
      { category: 'test' }
    );
  });

  it('handles calls with no params', () => {
    expect(() => logCivicEvent('simple_event')).not.toThrow();
  });

  afterEach(() => {
    consoleLogSpy?.mockRestore();
  });
});
