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
  useMinOnIOS?: boolean;
  variableNames?: { svh?: string; lvh?: string };
  apps?: RegExp;
  updateOnFocus?: boolean;
  onUpdate?: (svh: number, lvh: number) => void;
};

const getUA = (): string => (typeof navigator !== 'undefined' ? navigator.userAgent : '') || (typeof window !== 'undefined' ? (window as any).opera : '') || '';

const defaultApps = /(FBAN|FBAV|Instagram|LinkedIn|Twitter|Snapchat|TikTok|WhatsApp|Telegram|Line|WeChat|Messenger)/i;

const validateOptions = (options: any) => {
  if (options == null) return;
  const t = (v: any) => typeof v;
  if (options.forceInApp != null && t(options.forceInApp) !== 'boolean') {
    throw new TypeError('initViewportHeight: options.forceInApp must be a boolean');
  }
  if (options.useMinOnIOS != null && t(options.useMinOnIOS) !== 'boolean') {
    throw new TypeError('initViewportHeight: options.useMinOnIOS must be a boolean');
  }
  if (options.variableNames != null) {
    const vn = options.variableNames;
    if (vn.svh != null && t(vn.svh) !== 'string') {
      throw new TypeError('initViewportHeight: options.variableNames.svh must be a string');
    }
    if (vn.lvh != null && t(vn.lvh) !== 'string') {
      throw new TypeError('initViewportHeight: options.variableNames.lvh must be a string');
    }
  }
  if (options.apps != null && !(options.apps instanceof RegExp)) {
    throw new TypeError('initViewportHeight: options.apps must be a RegExp');
  }
  if (options.updateOnFocus != null && t(options.updateOnFocus) !== 'boolean') {
    throw new TypeError('initViewportHeight: options.updateOnFocus must be a boolean');
  }
  if (options.onUpdate != null && t(options.onUpdate) !== 'function') {
    throw new TypeError('initViewportHeight: options.onUpdate must be a function');
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
export const applyVars = (svh: number, lvh: number, variableNames?: { svh?: string; lvh?: string }) => {
  const doc = typeof document !== 'undefined' ? document.documentElement : null;
  if (!doc) return;
  const sv = variableNames?.svh ?? '--svh';
  const lv = variableNames?.lvh ?? '--lvh';
  if (typeof sv !== 'string' || typeof lv !== 'string') {
    throw new TypeError('applyVars: variableNames.svh and .lvh must be strings when provided');
  }
  doc.style.setProperty(sv, `${svh}px`);
  doc.style.setProperty(lv, `${lvh}px`);
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
  const inApp = isInApp(ua, options.forceInApp, options.apps ?? defaultApps);

  if (!inApp) {
    const doc = typeof document !== 'undefined' ? document.documentElement : null;
    if (doc) {
      const sv = options.variableNames?.svh ?? '--svh';
      const lv = options.variableNames?.lvh ?? '--lvh';
      doc.style.setProperty(sv, '100svh');
      doc.style.setProperty(lv, '100lvh');
    }
    return () => {};
  }

  const update = () => {
    const { svh, lvh } = computeHeights(ua, options.useMinOnIOS ?? true);
    applyVars(svh, lvh, options.variableNames);
    options.onUpdate?.(svh, lvh);
  };

  update();

  const vv: any = typeof window !== 'undefined' ? (window as any).visualViewport : null;
  const onResize = () => update();
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });
    if (options.updateOnFocus) {
      window.addEventListener('focusin', onResize, { passive: true });
      window.addEventListener('focusout', onResize, { passive: true });
    }
  }
  if (vv) {
    vv.addEventListener('resize', onResize, { passive: true });
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      if (options.updateOnFocus) {
        window.removeEventListener('focusin', onResize);
        window.removeEventListener('focusout', onResize);
      }
    }
    if (vv) {
      vv.removeEventListener('resize', onResize);
    }
  };
};

/**
 * Backward‑compatible alias
 */
export const setViewportHeight = (options?: ViewportOptions) => initViewportHeight(options);

export const __testUtils = { getUA, defaultApps };
