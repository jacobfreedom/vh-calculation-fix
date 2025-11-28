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

export const isInApp = (ua: string, force?: boolean, apps: RegExp = defaultApps): boolean => {
  if (force) return true;
  const webview = /(; wv\)|WebView)/i.test(ua);
  const appMatch = apps.test(ua);
  const iOSNoSafari = /(iPhone|iPod|iPad)/i.test(ua) && !/Safari/i.test(ua);
  return webview || appMatch || iOSNoSafari;
};

export const computeHeights = (ua: string, useMinOnIOS: boolean): { svh: number; lvh: number } => {
  const inner = typeof window !== 'undefined' ? window.innerHeight : 0;
  const vv = typeof window !== 'undefined' && (window as any).visualViewport ? (window as any).visualViewport.height : inner;
  const isIOS = /(iPad|iPhone|iPod)/i.test(ua);
  const svh = inner;
  const lvh = isIOS && useMinOnIOS ? Math.min(vv, inner) : Math.max(vv, inner);
  return { svh, lvh };
};

export const applyVars = (svh: number, lvh: number, variableNames?: { svh?: string; lvh?: string }) => {
  const doc = typeof document !== 'undefined' ? document.documentElement : null;
  if (!doc) return;
  const sv = variableNames?.svh ?? '--svh';
  const lv = variableNames?.lvh ?? '--lvh';
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
export const initViewportHeight = (options: ViewportOptions = {}) => {
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

