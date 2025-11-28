import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setViewportHeight, initViewportHeight } from '../src/index';

const original: any = {
  window: (globalThis as any).window,
  document: (globalThis as any).document,
};

const setupEnv = (inner: number, vv?: number) => {
  (globalThis as any).CSS = { supports: (decl: string) => /100lvh|100svh/.test(decl) };
  (globalThis as any).window = {
    innerHeight: inner,
    visualViewport: vv != null ? { height: vv } : undefined,
  } as any;
  const setProperty = vi.fn();
  (globalThis as any).document = { documentElement: { style: { setProperty } } } as any;
  return { setProperty };
};

const restoreEnv = () => {
  (globalThis as any).window = original.window;
  (globalThis as any).document = original.document;
};

describe('setViewportHeight', () => {
  beforeEach(() => { vi.restoreAllMocks(); });
  afterEach(() => { restoreEnv(); });

  it('sets native units when not in in-app', () => {
    const { setProperty } = setupEnv(800);
    const stop = setViewportHeight();
    expect(setProperty).toHaveBeenCalledWith('--svh', '100svh');
    expect(setProperty).toHaveBeenCalledWith('--lvh', '100lvh');
    expect(typeof stop).toBe('function');
  });

  it('sets pixel values in in-app', () => {
    const { setProperty } = setupEnv(800, 780);
    const stop = initViewportHeight({ forceInApp: true });
    const svhCall = setProperty.mock.calls.find((c: any[]) => c[0] === '--svh');
    const lvhCall = setProperty.mock.calls.find((c: any[]) => c[0] === '--lvh');
    expect(svhCall[1]).toMatch(/px$/);
    expect(lvhCall[1]).toMatch(/px$/);
    expect(typeof stop).toBe('function');
  });
});
