# Chromeleon

A Chrome extension (Manifest V3) that turns articles into a consistent reader
view as you browse, while images, buttons and the site's own JavaScript keep
working. See README.md for features and layout.

## The one architectural rule

Chromeleon restyles the **live page**. It never scrapes, clones, moves or
re-renders page content. v1 copied the article into a React overlay, and that
is why nothing on the page worked; don't drift back towards it.

- `src/engine/detect.ts` finds the real article element in the live DOM
  (Readability-style scoring), plus the title block and lead image if they sit
  outside it.
- `src/engine/engine.ts` tags elements with `data-chl-root`, `data-chl-keep`,
  `data-chl-path` and `data-chl-hide`, and sets `html[data-chl-on][data-chl-mode]`.
  A MutationObserver handles SPA navigation, re-renders and late content; new
  elements are let through if the user just clicked, hidden otherwise.
- `src/engine/styles.ts` builds one stylesheet scoped entirely under
  `html[data-chl-on]`, so it's inert when off. Broad resets go in `:where()`;
  targeted rules add a type selector to win over them. Rules use `!important`
  to beat site CSS.

## Conventions

- The content script runs on every page: keep it dependency-free (no React).
  The popup (`src/panel/`) is React with plain CSS.
- Per-site behaviour comes from `SiteRule` in `src/shared/settings.ts`, never
  hard-coded hostnames.
- Colours come from `src/shared/palettes.ts` (OKLCH data) as `--chl-*` custom
  properties. Every text pair must reach 4.5:1; `npm run check:palettes`
  enforces it. Use `ensureContrast` rather than hand-tuning.
- `src/shared/themes/color.ts` and `daisyui.ts` are copied unchanged from
  Naamia (`rdburdett/baby-name`, `packages/shared/src/themes/`). Change them
  there first so the two stay in step.
- Icons are generated from `icons/chameleon.png` by `npm run generate-icons`
  (full colour, plus muted toolbar versions for pages where reader view is off).
  Don't hand-edit `public/icon*.png`.
- Save settings on release, not on every input event: `chrome.storage.sync`
  has a write quota.

## Testing

```bash
npm test               # palette contrast check, build, then e2e in Chromium
npx tsc --noEmit -p .  # type check
```

The e2e test (`test/e2e.mjs`) loads `dist/` into Chromium and runs checks
against fixture sites in `test/fixtures/`, each served on its own hostname
(`news.test`, `blog.test`, …). Any change to detection needs a fixture and
checks there. Set `SHOTS_DIR` to save screenshots, and look at them: passing
checks don't prove the page looks right.

Cloud sessions can't reach real websites, so the fixtures are the only test
bed. Say so when reporting results.
