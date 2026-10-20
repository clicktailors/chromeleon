import { FONTS, THEMES, type ReaderSettings, type SiteRule } from '@/shared/settings';

// All rules are scoped under attributes the engine sets on <html>, so the
// stylesheet is inert until reader mode is applied and vanishes when it's removed.
//
// Specificity plan: broad resets are wrapped in :where() so they stay at the
// specificity of the scope prefix; targeted rules (headings, links, code) add a
// type selector and win over them. Everything is !important to beat site CSS.

const ON = 'html[data-chl-on]';
const R = 'html[data-chl-on][data-chl-mode="reader"]';
const S = `${R} :where([data-chl-root], [data-chl-keep])`;
const W = 'html[data-chl-on][data-chl-mode="whole"]';

const CONTROLS = 'button, [role="button"], input:not([type="checkbox"], [type="radio"], [type="range"], [type="hidden"], [type="image"], [type="color"]), select, textarea';

export function buildStylesheet(settings: ReaderSettings, rule: SiteRule): string {
	const t = THEMES[settings.theme] ?? THEMES.paper;
	const font = FONTS[settings.font]?.stack ?? FONTS.serif.stack;
	const mono = FONTS.mono.stack;

	const vars = `
${ON} {
	--chl-bg: ${t.bg};
	--chl-fg: ${t.fg};
	--chl-muted: ${t.muted};
	--chl-heading: ${t.heading};
	--chl-accent: ${t.accent};
	--chl-surface: ${t.surface};
	--chl-border: ${t.border};
	--chl-code-bg: ${t.codeBg};
	--chl-selection: ${t.selection};
	--chl-font: ${font};
	--chl-mono: ${mono};
	--chl-size: ${settings.fontSize}px;
	--chl-lh: ${settings.lineHeight};
	--chl-width: ${settings.width}px;
}
${R} { color-scheme: ${t.scheme}; }`;

	const userHides = (rule.hide ?? []).filter(isValidSelector);
	const userHideCss = userHides.length ? `${ON} :is(${userHides.join(', ')}) { display: none !important; }` : '';

	const hideImages = settings.hideImages
		? `${S} :where(img, picture, figure, video) { display: none !important; }`
		: '';

	return [vars, common, reader, whole(t.scheme === 'dark'), hideImages, userHideCss].join('\n');
}

function isValidSelector(sel: string): boolean {
	try {
		document.createDocumentFragment().querySelector(sel);
		return true;
	} catch {
		return false;
	}
}

const common = `
html[data-chl-pending] body { visibility: hidden !important; }
${ON} [data-chl-hide] { display: none !important; }
${ON} ::selection { background: var(--chl-selection) !important; }
`;

const reader = `
${R} {
	background: var(--chl-bg) !important;
	overflow-x: hidden !important;
	overflow-y: auto !important;
	height: auto !important;
}
${R} body[data-chl-path] {
	background: var(--chl-bg) !important;
	color: var(--chl-fg) !important;
	padding: 56px 0 30vh !important;
	overflow: visible !important;
}

/* Ancestors of the article: flatten whatever grid, flex or fixed layout they had. */
${R} [data-chl-path] {
	display: block !important;
	position: static !important;
	float: none !important;
	inset: auto !important;
	width: auto !important;
	min-width: 0 !important;
	max-width: none !important;
	height: auto !important;
	min-height: 0 !important;
	max-height: none !important;
	margin: 0 !important;
	padding: 0 !important;
	border: 0 !important;
	box-shadow: none !important;
	transform: none !important;
	filter: none !important;
	contain: none !important;
	clip-path: none !important;
	columns: auto !important;
	overflow: visible !important;
	background: transparent !important;
}

/* The reading column. */
${R} :is([data-chl-root], [data-chl-keep]) {
	display: block !important;
	position: static !important;
	float: none !important;
	box-sizing: border-box !important;
	width: 100% !important;
	min-width: 0 !important;
	max-width: var(--chl-width) !important;
	height: auto !important;
	max-height: none !important;
	margin: 0 auto !important;
	padding: 0 24px !important;
	border: 0 !important;
	box-shadow: none !important;
	transform: none !important;
	overflow: visible !important;
	columns: auto !important;
	background: transparent !important;
	color: var(--chl-fg) !important;
	font-family: var(--chl-font) !important;
	font-size: var(--chl-size) !important;
	line-height: var(--chl-lh) !important;
	text-align: start !important;
}
${R} [data-chl-keep] { margin-bottom: 1.5em !important; }

/* Text: one family, one size, one colour. */
${S} :where(p, li, dd, dt, blockquote, div, span, section, article, header, footer, main, a, em, strong, b, i, u, s, mark, td, th, label, time, cite, abbr, q, dl, ul, ol, address, summary, details, font, small, figure) {
	font-family: inherit !important;
	font-size: inherit !important;
	line-height: inherit !important;
	letter-spacing: normal !important;
	text-transform: none !important;
}
${S} :where(:not(a, h1, h2, h3, h4, h5, h6, mark, pre *, ${CONTROLS})) {
	color: inherit !important;
}
${S} :where(:not(img, picture, video, canvas, iframe, svg, svg *, pre, code, kbd, mark, ${CONTROLS})) {
	background-color: transparent !important;
}
${S} :where(div, section, figure, aside, table, pre, p, ul, ol, blockquote, img, video, iframe, embed, object, canvas, svg, picture) {
	max-width: 100% !important;
}
${S} :where(p, ul, ol, dl, blockquote, pre, table, figure) {
	margin-top: 0 !important;
	margin-bottom: 1.15em !important;
}
${S} :where(ul, ol) { padding-inline-start: 1.6em !important; }
${S} :where(li) { margin-bottom: 0.35em !important; }

${S} :is(h1, h2, h3, h4, h5, h6) {
	font-family: var(--chl-font) !important;
	color: var(--chl-heading) !important;
	line-height: 1.25 !important;
	letter-spacing: -0.01em !important;
	text-transform: none !important;
	font-weight: 700 !important;
	margin: 1.6em 0 0.6em !important;
	text-align: start !important;
}
${S} h1 { font-size: 2.1em !important; margin-top: 0 !important; }
${S} h2 { font-size: 1.55em !important; }
${S} h3 { font-size: 1.25em !important; }
${S} h4 { font-size: 1.1em !important; }
${S} :is(h5, h6) { font-size: 1em !important; }

${S} a {
	color: var(--chl-accent) !important;
	text-decoration: underline !important;
	text-decoration-thickness: 1px !important;
	text-underline-offset: 0.18em !important;
}
${S} a:hover { text-decoration-thickness: 2px !important; }
${S} :is(h1, h2, h3, h4, h5, h6) a { color: inherit !important; text-decoration: none !important; }

${S} :is(img, video) { height: auto !important; border-radius: 4px; }
${S} img:is(.lazyload, .lazyloading, .lazy, [data-src], [data-lazy-src]) { opacity: 1 !important; visibility: visible !important; }
${S} figure { margin: 1.6em 0 !important; }
${S} :is(figcaption, small, sub, sup, caption) { font-size: 0.82em !important; color: var(--chl-muted) !important; }
${S} figcaption { margin-top: 0.5em !important; line-height: 1.45 !important; }

${S} blockquote {
	margin-left: 0 !important;
	margin-right: 0 !important;
	padding: 0.1em 0 0.1em 1.1em !important;
	border-left: 3px solid var(--chl-border) !important;
	color: var(--chl-muted) !important;
}
${S} hr { border: 0 !important; border-top: 1px solid var(--chl-border) !important; margin: 2em 0 !important; }

${S} :is(pre, code, kbd, samp) {
	font-family: var(--chl-mono) !important;
	font-size: 0.86em !important;
	background-color: var(--chl-code-bg) !important;
	border-radius: 5px !important;
}
${S} :is(code, kbd, samp) { padding: 0.1em 0.35em !important; }
${S} pre { padding: 1em 1.2em !important; overflow: auto !important; line-height: 1.5 !important; }
${S} pre :is(code, kbd, samp) { font-size: inherit !important; background: transparent !important; padding: 0 !important; }
${S} pre * { font-family: inherit !important; }

${S} table { border-collapse: collapse !important; display: block !important; overflow-x: auto !important; width: max-content !important; }
${S} table:has(th):not(:has(table)) :is(th, td) {
	border: 1px solid var(--chl-border) !important;
	padding: 0.45em 0.75em !important;
	text-align: start !important;
	vertical-align: top !important;
}
${S} table:has(th):not(:has(table)) th { background-color: var(--chl-surface) !important; color: var(--chl-heading) !important; }

/* Buttons and fields keep working, they just match the theme. */
${S} :is(${CONTROLS}) {
	font-family: inherit !important;
	color: var(--chl-fg) !important;
	background-color: var(--chl-surface) !important;
	border: 1px solid var(--chl-border) !important;
	border-radius: 8px !important;
}
${S} :is(button, [role="button"]):hover { border-color: var(--chl-accent) !important; }
${S} :is(${CONTROLS}):focus-visible { outline: 2px solid var(--chl-accent) !important; outline-offset: 2px !important; }
`;

// "Whole page" mode: no layout changes, just type and an optional dark filter.
// Used when a site is forced on but no article can be found (apps, homepages).
function whole(dark: boolean): string {
	const fonts = `
${W} body :where(p, li, dd, dt, blockquote, td, th, span, a, label, h1, h2, h3, h4, h5, h6, div, article, section) {
	font-family: var(--chl-font) !important;
}
`;
	if (!dark) {
		return `${fonts}
${W}, ${W} body { background-color: var(--chl-bg) !important; }
${W} body a { color: var(--chl-accent) !important; }
`;
	}
	// Invert-and-rotate is crude but keeps every widget working; media is
	// flipped back so photos look normal.
	return `${fonts}
${W} { filter: invert(0.9) hue-rotate(180deg) !important; background: #fff !important; }
${W} :is(img, video, picture, canvas, iframe, [style*="background-image"]) { filter: invert(1) hue-rotate(180deg) !important; }
`;
}
