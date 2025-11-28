Custom Fluidity System Explanation

Most websites use pixels (px) or relative units (rem/em) for sizing. These work in fixed steps (breakpoints) but don’t adapt well across different display settings. For fluid layouts, developers often use viewport height (vh) units, which scale with the height of the screen. The issue is that vh is not reliable in real conditions: in in-app browsers such as Instagram, Telegram or TikTok, the browser bars shift the viewport, so the content is cropped or jumps on scroll.

We built an internal custom fluidity system that fixes this problem. It calculates the actual visible space, so the design remains the same across display modes and doesn’t break in in-app browsers. This is particularly important for projects like Experience Lab, where the design is an essential part of the experience.

1. Steel Cut – Default sizing units

Default MacOS Resolution (1470x956)

More Space MacOS Resolution (1710x1112) - Original Design
Steel Cut shows the limitation of px/rem sizing. The site looks different when switching between MacBook “Default” and “More Space” resolutions. The design was made for “More Space” resolution, but on “Default” resolution the design changes noticeably. Breakpoints alone cannot prevent this.

2. Why vh Breaks in Practice
The vh unit should solve this by scaling elements based on the viewport height. In practice it often breaks:
In in-app browsers (Instagram, Telegram, TikTok, etc) the vh value ignores browser interface bars.
This causes sections to be cut off, hidden, or shifted on scroll.
A site that looks correct in Safari or Chrome may not work at all in these apps.


Our fix adjusts the calculation to the actual visible viewport, not the raw vh value.

3. Dopesites – Fluidity System Example
 
Default MacOS Resolution (1470x956)


 More Space MacOS Resolution (1710x1112) - Original Design
On Dopesites, the design stays the same across resolutions and display modes. The fluidity system removes the inconsistencies you see with px/rem and issues of default vh.

4. Showcase Videos and Links
Link to folder with all showcase videos: here
Broken vh example: shinpaku.co
 - Uses the default vh, but the website breaks in in-app browsers on scroll.


Dopesites (Instagram, with fix): vanilla-dopesites.vercel.app
 - Uses our fixed fluidity system, layout remains stable in Instagram’s in-app browser.


Dopesites (Telegram, without coded fix - app specific development required):
- Shows how vh breaks in Telegram. Each app needs its own custom fix.


Steel Cut link if you want to test resolutions yourself:  https://brutalist-barber.vercel.app/



5. Essential Demonstration
Use the library to initialize reliable viewport variables and apply them in CSS:

```
import { initViewportHeight } from './src/index.js';
initViewportHeight({ updateOnFocus: true });
```

```
:root {
  --sp-y-95: calc(95 / 1117 * var(--lvh));
}
.projects { padding: var(--sp-y-95) var(--sp-x-109); }
```

References

- Design spec: Figma `https://www.figma.com/design/ymd9XlC1rq8OJIOJv7zNRV/DOPESITES?node-id=0-1&t=GdkJITg1mUZwE1nP-1`
- Live example: `https://vanilla-dopesites.vercel.app/`

Library Overview and Usage

- Library path: `src/index.js` with API `initViewportHeight` and `setViewportHeight`.
- What it does: sets `--svh` and `--lvh` CSS variables based on `window.innerHeight` and `visualViewport.height`, with platform-aware logic.
- In-app detection: Instagram, Facebook, LinkedIn, Twitter, TikTok, WhatsApp, Telegram, Line, WeChat, Messenger, and generic WebViews. Telegram is handled via `visualViewport` updates.

Quick Start

- Initialize in your app entry:

```
import { initViewportHeight } from './src/index.js';
initViewportHeight();
```

- Use variables in CSS (example from `style-example/main.css`):

```
:root {
  --sp-y-95: calc(95 / 1117 * var(--lvh));
}
.projects { padding: var(--sp-y-95) var(--sp-x-109); }
```

References

- Design spec: Figma `https://www.figma.com/design/ymd9XlC1rq8OJIOJv7zNRV/DOPESITES?node-id=0-1&t=GdkJITg1mUZwE1nP-1`
- Live example: `https://vanilla-dopesites.vercel.app/`
- Images: `/Users/j7s/coding/vh-calculation-fix/imgs/img-1.png`, `/Users/j7s/coding/vh-calculation-fix/imgs/img-2.png`, `/Users/j7s/coding/vh-calculation-fix/imgs/img-3.png`, `/Users/j7s/coding/vh-calculation-fix/imgs/img-4.png`
