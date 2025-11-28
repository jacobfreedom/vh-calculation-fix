import { describe, it, expect } from 'vitest';
import { isInApp, computeHeights } from '../src/index';

describe('isInApp', () => {
  it('detects generic webview tokens', () => {
    expect(isInApp('something WebView', undefined)).toBe(true);
    expect(isInApp('Mozilla/5.0; wv) Android', undefined)).toBe(true);
  });
  it('detects common app browsers', () => {
    expect(isInApp('Instagram', undefined)).toBe(true);
    expect(isInApp('WhatsApp', undefined)).toBe(true);
    expect(isInApp('Telegram', undefined)).toBe(true);
  });
  it('detects iOS in-app no Safari', () => {
    expect(isInApp('iPhone XYZ', undefined)).toBe(true);
    expect(isInApp('iPad Safari', undefined)).toBe(false);
  });
});

describe('computeHeights', () => {
  it('returns numbers based on provided environment', () => {
    const ua = 'Android';
    const res = computeHeights(ua, true);
    expect(typeof res.svh).toBe('number');
    expect(typeof res.lvh).toBe('number');
  });
});
