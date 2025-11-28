# vh-calculation-fix

Runtime helper that computes the visible viewport height in real devices and in‑app browsers. Exposes `--svh` and `--lvh` so you don’t rely on broken `vh`. Built to keep design‑intent layouts visually consistent across display modes and app browsers.

- Provides reliable `--svh` and `--lvh` CSS variables that behave correctly in in‑app browsers and WebViews.
- Fixes broken `vh` behavior in environments like Instagram, WhatsApp, Telegram, and generic WebViews.
- Demo: `https://vanilla-dopesites.vercel.app/`
- Design reference: Figma `https://www.figma.com/design/ymd9XlC1rq8OJIOJv7zNRV/DOPESITES?node-id=0-1&t=GdkJITg1mUZwE1nP-1`

[badges here]

## Visual Overview

This library is about preserving original design intent across display modes and in‑app browsers. It is not generic responsive boilerplate; the goal is to keep layouts looking the same when chrome/keyboard alter the visible height.

### High-level comparison (GIFs first)

![Pure vw layout breaking](./imgs/gifs/pure-vw.gif)
![vh-calculation-fix layout holding up](./imgs/gifs/vh-tool-and-vw.gif)

- GIF 1 (pure `vw`): naive width‑based layout warps when viewport changes or app chrome appears.
- GIF 2 (`var(--lvh)` + fluid system): layout stays stable as visible height changes.

### Static examples

#### Steel Cut — default (1470×956)
![Steel Cut — default (1470×956)](./imgs/img-1.png)

#### Steel Cut — More Space (1710×1112)
![Steel Cut — More Space (1710×1112)](./imgs/img-2.png)

#### Dopesites — fluid spacing
![Dopesites — fluid spacing](./imgs/img-3.png)

#### Instagram — in‑app fix applied
![Instagram — in‑app fix applied](./imgs/img-4.png)

Steel Cut shows px/rem‑only layouts shifting between macOS “Default” and “More Space”. Dopesites and Instagram demonstrate how `var(--lvh)` and a visible‑height‑driven spacing system preserve the same look across resolutions and under in‑app chrome.

## When You Should (and Shouldn’t) Use This

- Use for design‑driven projects with art‑directed layouts and precise Figma specs.
- Use when your hero, sections, and typography spacing are part of the concept and must remain visually consistent.
- Probably don’t bother for generic CRUD dashboards or utility‑first boilerplate where minor shifts are acceptable.

## Why raw `vh` breaks in real apps

- In‑app browsers overlay chrome (address bars, gesture bars, toolbars) that eats vertical space.
- Virtual keyboards shrink the visible area during input.
- Mobile Safari adjusts viewport on scroll, changing the visible height.
- CSS `vh` ignores these dynamics, so `100vh` ≠ visually available height.
- Symptoms: cropped heroes, content jumping, layouts that only break inside Instagram/WhatsApp/Telegram.



## Why `vw` makes no sense for vertical layout (most of the time)

- `vw` is tied to width while the core problem is vertical space disappearing under chrome/keyboard.
- Faking vertical rhythm with `vw` assumes aspect ratios and ignores the very chrome that breaks layouts.
- `vw` is great for horizontal sizing; it’s a poor default for section heights/vertical spacing.
- For vertical rhythm (section heights, top/bottom spacing, type scale), use metrics derived from actual visible height — provided via `--svh`/`--lvh`.

## Quick Start

### Installation

- npm: `npm install vh-calculation-fix`
- yarn: `yarn add vh-calculation-fix`

### Minimal JS

```ts
import { initViewportHeight } from 'vh-calculation-fix';

initViewportHeight();
```

### Minimal CSS

```css
.hero {
  min-height: var(--lvh);
  display: grid;
  place-items: center;
}
```

## Usage

### Vanilla JS

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

When to use:
- Hero sections that must truly fill visible height.
- Forms/pages with keyboards that would otherwise cause jumps.
- Routes that need consistent spacing across different app browsers.

### React

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

When to use:
- App shells and layouts that must adapt to visible height.
- Pages with keyboard interactions or dynamic toolbars.

### CSS spacing system

```
:root {
  /* Example scale unit based on visible height */
  --sp-y-127: calc(127 / 1117 * var(--lvh));
}

.section {
  padding-block: var(--sp-y-127);
}
```

When to use:
- Section spacing, vertical rhythm, and type scales that should remain consistent across display modes.

## What `--svh` and `--lvh` represent

- `--svh`: safe viewport height based on `window.innerHeight` for stable content sizing.
- `--lvh`: large/visible viewport height reflecting real on‑screen space using `visualViewport.height` plus platform rules.
- Both update on viewport changes so CSS scales fluidly with the actual visible height.
- Variable names are customizable via options.
 - On iOS, `useMinOnIOS` caps `--lvh` with `min(visualViewport.height, innerHeight)` to avoid overexpansion.


## API

- `initViewportHeight(options?)`: initializes and subscribes to viewport changes, returns a cleanup function.
- `setViewportHeight(options?)`: alias to `initViewportHeight`.

### Options

```ts
type Options = {
  forceInApp?: boolean;
  useMinOnIOS?: boolean;
  variableNames?: { svh?: string; lvh?: string };
  apps?: RegExp;
  updateOnFocus?: boolean;
  onUpdate?: (svh: number, lvh: number) => void;
};
```

- `forceInApp`: Force in‑app logic regardless of UA detection (testing/debugging).
- `useMinOnIOS`: Prevent overexpansion on iOS; recommended for mobile Safari.
- `variableNames`: Override CSS variable names if your project uses custom tokens.
- `apps`: Extend UA detection for additional app browsers/WebViews if required.
- `updateOnFocus`: Recalculate on focusin/focusout; helps pages with inputs/keyboard.
- `onUpdate`: Callback invoked after updates with numeric `svh`/`lvh` values.

## Troubleshooting

- Variables aren’t updating — Ensure `initViewportHeight()` runs once on page/app mount before styles that use `var(--lvh)`.
- Content jumps when keyboard opens — Set `updateOnFocus: true` to recalc on focus events and stabilize form views.
- Safari iOS overexpands — Keep `useMinOnIOS: true` so visible height is capped to avoid overflows.
- `visualViewport` missing — Library falls back to `innerHeight`; layouts remain consistent on older devices.

## Compatibility

Targets modern browsers that support `visualViewport` and gracefully falls back to `innerHeight` when unavailable. Explicitly handles in‑app browsers/WebViews (Instagram, WhatsApp, Telegram, generic WebViews) and includes iOS‑aware logic.

- Modern browsers (with `visualViewport`)
- Fallback to `innerHeight` where needed
- In‑app browsers/WebViews (Instagram, WhatsApp, Telegram, etc.)

## Build & Scripts

- `npm run build`: Emits ESM/CJS bundles and type definitions to `dist`.
- `npm run test`: Runs unit tests with Vitest.
- `npm run lint`: Lints the codebase with ESLint.
- `npm run typecheck`: TypeScript type checking with `tsc --noEmit`.



## License

MIT
