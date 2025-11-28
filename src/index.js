const getUA = () => (typeof navigator !== 'undefined' ? navigator.userAgent : '') || (typeof window !== 'undefined' ? window.opera : '') || '';

const isInApp = (ua) => {
  const webview = /(; wv\)|WebView)/i.test(ua);
  const apps = /(FBAN|FBAV|Instagram|LinkedIn|Twitter|Snapchat|TikTok|WhatsApp|Telegram|Line|WeChat|Messenger)/i.test(ua);
  const iOSNoSafari = /(iPhone|iPod|iPad)/i.test(ua) && !/Safari/i.test(ua);
  return webview || apps || iOSNoSafari;
};

const computeHeights = (ua) => {
  const inner = typeof window !== 'undefined' ? window.innerHeight : 0;
  const vv = typeof window !== 'undefined' && window.visualViewport ? window.visualViewport.height : inner;
  const isIOS = /(iPad|iPhone|iPod)/i.test(ua);
  const svh = inner;
  const lvh = isIOS ? Math.min(vv, inner) : Math.max(vv, inner);
  return { svh, lvh };
};

const applyVars = (svh, lvh) => {
  const doc = typeof document !== 'undefined' ? document.documentElement : null;
  if (!doc) return;
  doc.style.setProperty('--svh', `${svh}px`);
  doc.style.setProperty('--lvh', `${lvh}px`);
};

export const initViewportHeight = () => {
  const ua = getUA();
  const inApp = isInApp(ua);
  if (!inApp) {
    const doc = typeof document !== 'undefined' ? document.documentElement : null;
    if (doc) {
      doc.style.setProperty('--svh', '100svh');
      doc.style.setProperty('--lvh', '100lvh');
    }
    return () => {};
  }

  const update = () => {
    const { svh, lvh } = computeHeights(ua);
    applyVars(svh, lvh);
  };

  update();

  const vv = typeof window !== 'undefined' ? window.visualViewport : null;
  const onResize = () => update();
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });
  }
  if (vv) {
    vv.addEventListener('resize', onResize, { passive: true });
  }

  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    }
    if (vv) {
      vv.removeEventListener('resize', onResize);
    }
  };
};

export const setViewportHeight = () => initViewportHeight();

