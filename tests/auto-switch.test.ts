import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initViewportHeight } from '../src/index';

const original: any = {
  window: (globalThis as any).window,
  document: (globalThis as any).document,
  CSS: (globalThis as any).CSS,
};

const setupEnv = (supportsNative: boolean) => {
  (globalThis as any).CSS = supportsNative
    ? { supports: (decl: string) => /100lvh|100svh/.test(decl) }
    : { supports: () => false };
  const listeners: Record<string, Function[]> = {};
  (globalThis as any).window = {
    innerHeight: 800,
    addEventListener: vi.fn((evt: string, fn: Function) => {
      (listeners[evt] ||= []).push(fn);
    }),
    removeEventListener: vi.fn((evt: string, fn: Function) => {
      const arr = listeners[evt] || [];
      const i = arr.indexOf(fn);
      if (i >= 0) arr.splice(i, 1);
    }),
    visualViewport: { height: 780, addEventListener: vi.fn(), removeEventListener: vi.fn() },
  } as any;
  const setProperty = vi.fn();
  (globalThis as any).document = { documentElement: { style: { setProperty } } } as any;
  return { listeners, setProperty };
};

const restoreEnv = () => {
  (globalThis as any).window = original.window;
  (globalThis as any).document = original.document;
  (globalThis as any).CSS = original.CSS;
};

describe('initViewportHeight auto-switching', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    restoreEnv();
  });

  it('uses native svh/lvh in non in-app with support', () => {
    const { setProperty } = setupEnv(true);
    const stop = initViewportHeight();
    expect(setProperty).toHaveBeenCalledWith('--svh', '100svh');
    expect(setProperty).toHaveBeenCalledWith('--lvh', '100lvh');
    expect(typeof stop).toBe('function');
  });

  it('uses pixel values and listeners in in-app', () => {
    const { setProperty } = setupEnv(true);
    const stop = initViewportHeight({ forceInApp: true });
    const svhCall = setProperty.mock.calls.find((c: any[]) => c[0] === '--svh');
    const lvhCall = setProperty.mock.calls.find((c: any[]) => c[0] === '--lvh');
    expect(svhCall[1]).toMatch(/px$/);
    expect(lvhCall[1]).toMatch(/px$/);
    expect((globalThis as any).window.addEventListener).toHaveBeenCalled();
    stop();
    expect((globalThis as any).window.removeEventListener).toHaveBeenCalled();
  });
});
