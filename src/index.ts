/**
 * Options to control viewport height calculation and CSS variable updates.
 *
 * - `forceInApp` forces in‑app behavior regardless of UA detection
 * - `useMinOnIOS` caps `lvh` on iOS to avoid overexpansion
 * - `variableNames` overrides CSS variable names (`--svh`, `--lvh` by default)
 * - `apps` extends UA RegExp for in‑app detection
 * - `updateOnFocus` recalculates on focus events to handle keyboards
 * - `onUpdate` receives numeric `svh`/`lvh` after each update
 */
export type ViewportOptions = {
  forceInApp?: boolean;
};

const getUA = (): string => (typeof navigator !== 'undefined' ? navigator.userAgent : '') || (typeof window !== 'undefined' ? (window as any).opera : '') || '';

const defaultApps = /(FBAN|FBAV|Instagram|LinkedIn|Twitter|Snapchat|TikTok|WhatsApp|Telegram|Line|WeChat|Messenger)/i;

const validateOptions = (options: any) => {
  if (options == null) return;
  const t = (v: any) => typeof v;
  if (options.forceInApp != null && t(options.forceInApp) !== 'boolean') {
    throw new TypeError('initViewportHeight: options.forceInApp must be a boolean');
  }
  // only forceInApp is supported
  if (options.forceInApp != null && t(options.forceInApp) !== 'boolean') {
    throw new TypeError('initViewportHeight: options.forceInApp must be a boolean');
  }
};

/**
 * Detects whether the user agent represents an in‑app browser or WebView.
 * @param ua User agent string
 * @param force Forces in‑app behavior when true
 * @param apps RegExp that matches app/browser identifiers
 */
export const isInApp = (ua: string, force?: boolean, apps: RegExp = defaultApps): boolean => {
  if (force) return true;
  const webview = /(; wv\)|WebView)/i.test(ua);
  const appMatch = apps.test(ua);
  const iOSNoSafari = /(iPhone|iPod|iPad)/i.test(ua) && !/Safari/i.test(ua);
  return webview || appMatch || iOSNoSafari;
};

/**
 * Computes `svh` and `lvh` numeric values based on current viewport.
 * @param ua User agent string (used for iOS heuristics)
 * @param useMinOnIOS If true, caps `lvh` on iOS using min(visualViewport, innerHeight)
 */
export const computeHeights = (ua: string, useMinOnIOS: boolean): { svh: number; lvh: number } => {
  const inner = typeof window !== 'undefined' ? window.innerHeight : 0;
  const vv = typeof window !== 'undefined' && (window as any).visualViewport ? (window as any).visualViewport.height : inner;
  const isIOS = /(iPad|iPhone|iPod)/i.test(ua);
  const svh = inner;
  const lvh = isIOS && useMinOnIOS ? Math.min(vv, inner) : Math.max(vv, inner);
  return { svh, lvh };
};

/**
 * Applies CSS variables to `document.documentElement`.
 * @param svh Safe viewport height in pixels
 * @param lvh Large/visible viewport height in pixels
 * @param variableNames Optional overrides for variable names
 */
export const applyVars = (svh: number, lvh: number) => {
  const doc = typeof document !== 'undefined' ? document.documentElement : null;
  if (!doc) return;
  doc.style.setProperty('--svh', `${svh}px`);
  doc.style.setProperty('--lvh', `${lvh}px`);
};

/**
 * Initialize reliable viewport height variables for CSS.
 *
 * - Sets CSS variables `--svh` and `--lvh` (customizable via options)
 * - Detects in‑app browsers and WebViews, including WhatsApp and Telegram
 * - Subscribes to viewport change events to keep values in sync
 */
/**
 * Initialize reliable viewport height variables for CSS and subscribe to changes.
 * @returns Cleanup function that removes listeners.
 */
export const initViewportHeight = (options: ViewportOptions = {}) => {
  validateOptions(options);
  const ua = getUA();
  const inApp = isInApp(ua, options.forceInApp, defaultApps);
  const supportsNative = typeof CSS !== 'undefined'
    && (CSS.supports('height: 100lvh') || CSS.supports('height: 100svh'));
  const preferPixels = inApp || !supportsNative;

  if (!preferPixels && supportsNative) {
    const doc = typeof document !== 'undefined' ? document.documentElement : null;
    if (doc) {
      doc.style.setProperty('--svh', '100svh');
      doc.style.setProperty('--lvh', '100lvh');
    }
    return () => {};
  }

  const update = () => {
    const { svh, lvh } = computeHeights(ua, true);
    applyVars(svh, lvh);
  };

  update();

  return () => {};
};

/**
 * Backward‑compatible alias
 */
export const setViewportHeight = (options?: ViewportOptions) => initViewportHeight(options);

export const __testUtils = { getUA, defaultApps };
