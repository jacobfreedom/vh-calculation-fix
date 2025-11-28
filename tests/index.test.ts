import { describe, it, expect } from 'vitest';
import * as lib from '../src/index';

describe('isInApp', () => {
  it('detects generic webview tokens', () => {
    expect(lib.isInApp('something WebView', undefined)).toBe(true);
    expect(lib.isInApp('Mozilla/5.0; wv) Android', undefined)).toBe(true);
  });
  it('detects common app browsers', () => {
    expect(lib.isInApp('Instagram', undefined)).toBe(true);
    expect(lib.isInApp('WhatsApp', undefined)).toBe(true);
    expect(lib.isInApp('Telegram', undefined)).toBe(true);
  });
  it('detects iOS in-app no Safari', () => {
    expect(lib.isInApp('iPhone XYZ', undefined)).toBe(true);
    expect(lib.isInApp('iPad Safari', undefined)).toBe(false);
  });
});

describe('computeHeights', () => {
  it('returns numbers based on provided environment', () => {
    const ua = 'Android';
    const res = lib.computeHeights(ua, true);
    expect(typeof res.svh).toBe('number');
    expect(typeof res.lvh).toBe('number');
  });
});
