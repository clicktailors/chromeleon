<p align="center"><img src="icons/chameleon.png" alt="" width="128" height="128"></p>

# Chromeleon

A Chrome extension that turns articles into a clean, consistent reader view **as you browse**, without breaking the page. Images, buttons, forms, video, lazy loading and the site's own JavaScript keep working, because Chromeleon restyles the real page instead of copying its text somewhere else.

## How it works

Most reader modes (and the first version of this project) scrape the article into a separate view. That copy is dead: buttons don't do anything, images that load on scroll never arrive, and the site's scripts can't reach it.

Chromeleon v2 leaves every element where it is:

1. **Find the article** in the live DOM using Readability-style scoring (`src/engine/detect.ts`). It also finds the headline and lead image when they sit outside the article body.
2. **Tag elements** with data attributes: the article (`data-chl-root`), its ancestors (`data-chl-path`), and everything else to hide (`data-chl-hide`).
3. **Inject one stylesheet** (`src/engine/styles.ts`), scoped entirely under `html[data-chl-on]`. It flattens the ancestors' layout, hides the rest, and applies your font, size, width and colours to the article. Turning reader mode off just removes the attribute.
4. **Keep up with the page** (`src/engine/engine.ts`): re-detect on single-page-app navigation or when the article is re-rendered, keep looking for content that loads late, hide ads and cookie banners that appear later, and let through popups you open yourself (like an image lightbox).

Pages that aren't articles (web apps, homepages) are left alone in **Auto** mode. Set a site to **Theme** to change just its fonts and colours, or to **Reader** to force reader view (it falls back to theme only where there's no article).

## Features

- Naamia's theme engine: choose System, Light or Dark, and pick one palette for each mode (Sepia by day, Dracula by night). There are 40 palettes: five built for reading, Naamia's Default, Retro and Nautical, and 32 daisyUI themes. Every text colour is pushed to at least 4.5:1 contrast, and `npm run check:palettes` fails if one drops below.
- Five font choices, and sliders for size, line spacing and column width. Changes apply live.
- Per-site mode: Auto, Reader, Theme (fonts and colours, layout untouched) or Off. Change it in the popup, or right-click the toolbar icon.
- **Pick content area**: click the right element when detection gets a site wrong. It's saved per site.
- **Hide elements**: click anything to hide it on that site from then on.
- `Alt+Shift+R` cycles the current page through reader view, theme only and off, until you leave it.
- The toolbar chameleon shows what it's doing: purple for reader view, green for theme only, a hollow grey outline when it's off, and yellow when paused everywhere. Hover it for the reason.
- The original layout doesn't flash on sites that were in reader view last time.

## Develop

```bash
npm install
npm run build        # outputs dist/
npm test             # checks palette contrast, builds, loads dist/ into Chromium, checks every fixture
npm run check:palettes  # palette contrast only
npm run fixtures     # serves test/fixtures on http://127.0.0.1:8787 for manual poking
```

Load it in Chrome: `chrome://extensions` → enable Developer mode → **Load unpacked** → choose `dist/`.

`npm test` needs a Chromium binary. It looks in `PLAYWRIGHT_BROWSERS_PATH` (default `/opt/pw-browsers`), or set `CHROMIUM_PATH`. Set `SHOTS_DIR` to save screenshots.

## Layout

```
src/
  engine/        content script (no React, runs on every page) + background worker
    detect.ts    finds the article in the live DOM
    styles.ts    builds the scoped reader stylesheet
    engine.ts    applies/removes reader mode, watches for changes, element picker wiring
    picker.ts    point-and-click element picker
  panel/         toolbar popup (React)
  shared/        settings, fonts, message types
    palettes.ts  palette catalog and contrast rules (ported from Naamia)
    themes/      OKLCH colour maths and the vendored daisyUI themes, copied from Naamia
test/
  fixtures/      news site, WordPress blog, SPA, dashboard app, 1990s table-layout essay
  e2e.mjs        loads the extension in Chromium and checks each fixture
```

## Known gaps

- Detection is heuristic. Use **Pick content area** for sites it gets wrong; that choice sticks.
- Theme only only changes fonts (light themes) or uses an invert filter (dark themes); it doesn't fully re-theme complex apps.
- Content inside iframes (some embeds) isn't restyled.
- Only tested against local fixtures so far, not a sweep of real sites.
