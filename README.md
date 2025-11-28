# vh-calculation-fix

Reliable viewport height CSS variables for real devices and in‑app browsers. Exposes `--svh` and `--lvh` to replace broken `vh` behavior.

- Provides reliable `--svh` and `--lvh` CSS variables that behave correctly in in‑app browsers and WebViews.
- Fixes broken `vh` behavior in environments like Instagram, WhatsApp, Telegram, and generic WebViews.
- Demo: `https://vanilla-dopesites.vercel.app/`
- Design reference: Figma `https://www.figma.com/design/ymd9XlC1rq8OJIOJv7zNRV/DOPESITES?node-id=0-1&t=GdkJITg1mUZwE1nP-1`

[badges here]

## Examples & Demos

- Live demo: `https://vanilla-dopesites.vercel.app/`
- Figma design: `https://www.figma.com/design/ymd9XlC1rq8OJIOJv7zNRV/DOPESITES?node-id=0-1&t=GdkJITg1mUZwE1nP-1`
- Example sites:
  - Steel Cut — px/rem layout shifts between macOS “Default” and “More Space”; fluid `var(--lvh)` preserves design intent.
  - Dopesites — consistent spacing across resolutions using `var(--lvh)`.
  - `shinpaku.co` — broken default `vh` in in‑app browsers on scroll.
- Screenshots:
  - ![Steel Cut default (1470×956)](./imgs/img-1.png)
  - ![Steel Cut more‑space (1710×1112)](./imgs/img-2.png)
  - ![Dopesites fluid (1470×956)](./imgs/img-3.png)
  - ![Instagram fluid (1710×1112)](./imgs/img-4.png)

Why Use This

- Default `vh` is often inaccurate in real apps because in‑app browsers and WebViews overlay UI chrome (address bars, toolbars, keyboard) that shifts the visible viewport.
- This causes cut‑off sections, content jumps on scroll, and unstable layouts that are expensive to debug across apps.
- The library computes the actually visible height and updates on `resize`, `orientationchange`, and `visualViewport.resize` so spacing and typography remain consistent.
- Saves developer time by removing per‑app hacks and manual exceptions; you use CSS variables everywhere and your layout stays stable.

Installation

- npm: `npm install vh-calculation-fix`
- yarn: `yarn add vh-calculation-fix`

Usage (Vanilla JS)

- ESM:

```
import { initViewportHeight } from 'vh-calculation-fix';
initViewportHeight();
```

- With options:

```
initViewportHeight({
  useMinOnIOS: true,
  updateOnFocus: true,
  onUpdate: (svh, lvh) => {
    // handle updates
  }
});
```

Usage (React)

```
import { useEffect } from 'react';
import { initViewportHeight } from 'vh-calculation-fix';

export function App() {
  useEffect(() => {
    const stop = initViewportHeight({ updateOnFocus: true });
    return () => stop();
  }, []);
  return <div style={{ minHeight: 'var(--lvh)' }}>...</div>;
}
```

CSS Example

```
:root {
  --sp-y-127: calc(127 / 1117 * var(--lvh));
}
.center { margin-top: var(--sp-y-127); }
```

## What `--svh` and `--lvh` do

- `--svh`: safe viewport height based on `window.innerHeight` for stable content sizing.
- `--lvh`: large/visible viewport height reflecting real on‑screen space using `visualViewport.height` plus platform rules.
- Both update on viewport changes so CSS scales fluidly with the actual visible height.
- Variable names are customizable via options.

## API

- `initViewportHeight(options?)`: initializes and subscribes to viewport changes, returns a cleanup function.
- `setViewportHeight(options?)`: alias to `initViewportHeight`.

### Options

- `forceInApp?: boolean`
- `useMinOnIOS?: boolean`
- `variableNames?: { svh?: string; lvh?: string }`
- `apps?: RegExp`
- `updateOnFocus?: boolean`
- `onUpdate?: (svh: number, lvh: number) => void`

## Troubleshooting

- Variables not updating: ensure `initViewportHeight` is called once on page/app mount.
- Keyboard jumps content: set `updateOnFocus: true` to recalc on focus changes.
- Safari iOS behavior: keep `useMinOnIOS: true` to avoid overexpansion.

## Build & Scripts

- `npm run build`: emits `dist` with ESM/CJS and `d.ts`.
- `npm run test`: runs unit tests.
- `npm run lint`: checks lint rules.
- `npm run typecheck`: TypeScript type checking.

## Compatibility

- Targets modern browsers supporting `visualViewport` (fallback to `innerHeight` when unavailable).
- Works in in‑app browsers including Instagram, WhatsApp, Telegram, and generic WebViews.

Examples & Demos

- Live demo: `https://vanilla-dopesites.vercel.app/`
- Figma design: `https://www.figma.com/design/ymd9XlC1rq8OJIOJv7zNRV/DOPESITES?node-id=0-1&t=GdkJITg1mUZwE1nP-1`
- Example sites:
  - Steel Cut — px/rem layout shifts between macOS “Default” and “More Space”; fluid `var(--lvh)` preserves design intent.
  - Dopesites — consistent spacing across resolutions using `var(--lvh)`.
  - `shinpaku.co` — broken default `vh` in in‑app browsers on scroll.
- Images:
  - ![Steel Cut default (1470×956)](./imgs/img-1.png)
  - ![Steel Cut more‑space (1710×1112)](./imgs/img-2.png)
  - ![Dopesites fluid spacing](./imgs/img-3.png)
  - ![Instagram in‑app fix](./imgs/img-4.png)

## Notes / Background

- Pixels and rems work in fixed steps; they fail to adapt across display modes.
- Raw `vh` breaks in popular in‑app browsers because it ignores app chrome, leading to cropping and layout jumps.
- This library replaces raw `vh` with reliable variables derived from the visible viewport, keeping your design consistent across browsers and apps.
- Preference: `vh` supports vertical rhythm; `vw` is useful for horizontal sizing—choose based on design.

## License

MIT
