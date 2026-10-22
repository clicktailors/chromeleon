// Loads the built extension (dist/) into Chromium and checks reader mode
// against the fixture pages. `npm test` builds first, then runs this.
//
// Each fixture is served under its own hostname (news.test, blog.test, …) so
// per-site rules are exercised the way they would be on real sites.

import { chromium } from 'playwright-core';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const shots = process.env.SHOTS_DIR;
const executablePath = process.env.CHROMIUM_PATH || findChromium();

function findChromium() {
	const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
	for (const dir of fs.existsSync(base) ? fs.readdirSync(base) : []) {
		const p = path.join(base, dir, 'chrome-linux', 'chrome');
		if (dir.startsWith('chromium-') && fs.existsSync(p)) return p;
	}
	throw new Error('Set CHROMIUM_PATH to a Chromium binary');
}

let failures = 0;
function check(name, ok, detail = '') {
	console.log(`${ok ? '  ✓' : '  ✗'} ${name}${!ok && detail ? ` — ${detail}` : ''}`);
	if (!ok) failures++;
}

const server = await serve();
const port = server.address().port;
const url = (host, p = '/') => `http://${host}.test:${port}${p}`;

const ctx = await chromium.launchPersistentContext(fs.mkdtempSync(path.join(os.tmpdir(), 'chl-')), {
	executablePath,
	headless: false,
	viewport: { width: 1280, height: 900 },
	args: [
		'--headless=new',
		`--disable-extensions-except=${dist}`,
		`--load-extension=${dist}`,
		'--host-resolver-rules=MAP *.test 127.0.0.1',
		'--no-proxy-server',
	],
});
const sw = ctx.serviceWorkers()[0] ?? (await ctx.waitForEvent('serviceworker'));
const extId = new URL(sw.url()).host;
// The worker can be reachable a moment before Chrome binds the extension
// APIs to it, so poll from here until they exist.
for (let i = 0; i < 100; i++) {
	const ready = await sw.evaluate(() => Boolean(globalThis.chrome?.action && globalThis.chrome?.storage)).catch(() => false);
	if (ready) break;
	await new Promise((r) => setTimeout(r, 50));
}

const storage = (fn, arg) => sw.evaluate(fn, arg);
const visible = (page, sel) =>
	page.evaluate((s) => {
		const el = document.querySelector(s);
		if (!el) return false;
		const r = el.getBoundingClientRect();
		return el.checkVisibility({ checkVisibilityCSS: true }) && r.width > 0 && r.height > 0;
	}, sel);
const mode = (page) => page.evaluate(() => document.documentElement.getAttribute('data-chl-mode'));
const style = (page, sel, prop) => page.evaluate(([s, p]) => getComputedStyle(document.querySelector(s))[p], [sel, prop]);
// The extension has no `tabs` permission, so it can't read tab URLs; find the
// fixture's tab by asking each tab's content script which host it's on.
const sendToTab = (page, msg) =>
	sw.evaluate(
		async ([m, host]) => {
			for (const tab of await chrome.tabs.query({})) {
				const status = await chrome.tabs.sendMessage(tab.id, { type: 'chl:status' }).catch(() => null);
				if (status?.host === host) return chrome.tabs.sendMessage(tab.id, m);
			}
			throw new Error(`no tab for ${host}`);
		},
		[msg, new URL(page.url()).hostname],
	);
// Chrome reports palette colours as oklch(); paint one pixel to get sRGB.
const PIXEL = `(color) => { const c = document.createElement('canvas'); c.width = c.height = 1; const x = c.getContext('2d'); x.fillStyle = color; x.fillRect(0, 0, 1, 1); return [...x.getImageData(0, 0, 1, 1).data].slice(0, 3); }`;
const rgb = (page, sel, prop) => page.evaluate(([s, p, px]) => eval(px)(getComputedStyle(document.querySelector(s))[p]), [sel, prop, PIXEL]);
const varRgb = (page, name) => page.evaluate(([n, px]) => eval(px)(getComputedStyle(document.documentElement).getPropertyValue(n).trim()), [name, PIXEL]);
const near = (a, b, tol = 2) => a.every((v, i) => Math.abs(v - b[i]) <= tol);
const isDark = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b < 80;
const setReader = (value) => storage((v) => chrome.storage.sync.set({ reader: v }), value);

const snap = async (page, name) => shots && page.screenshot({ path: path.join(shots, `${name}.png`) });

async function open(host, p) {
	const page = await ctx.newPage();
	await page.goto(url(host, p));
	await page.waitForTimeout(400);
	return page;
}

// The tab's toolbar tooltip, which the background worker sets from the page's state.
const tooltip = (page) =>
	sw.evaluate(async (host) => {
		for (const tab of await chrome.tabs.query({})) {
			const status = await chrome.tabs.sendMessage(tab.id, { type: 'chl:status' }).catch(() => null);
			if (status?.host === host) return chrome.action.getTitle({ tabId: tab.id });
		}
		return null;
	}, new URL(page.url()).hostname);

console.log('toolbar icon');
for (const state of ['reader', 'theme', 'off', 'paused']) {
	const ok = await sw
		.evaluate((s) => chrome.action.setIcon({ path: { 16: `/icon16-${s}.png`, 32: `/icon32-${s}.png`, 48: `/icon48-${s}.png` } }).then(() => true, () => false), state)
		.catch(() => false);
	check(`${state} toolbar icons load`, ok);
}

// ── News site: grid layout, fixed header, sidebar, junk inside the article ──
console.log('news.test (typical news article)');
{
	const page = await open('news');
	await page.waitForTimeout(900); // let the cookie banner and late ad arrive
	check('reader mode applied', (await mode(page)) === 'reader');
	for (const sel of ['#title', '#lead-img', '#body', '#inline-img']) check(`${sel} visible`, await visible(page, sel));
	for (const sel of ['.site-header', '.left-rail', '.sidebar', '.site-footer', '#comments', '.breadcrumbs'])
		check(`${sel} hidden`, !(await visible(page, sel)));
	for (const sel of ['.share-tools', '.related', '.newsletter-signup']) check(`junk ${sel} hidden`, !(await visible(page, sel)));
	check('cookie banner injected later is hidden', !(await visible(page, '#cookie')));
	check('ad injected later is hidden', !(await visible(page, '#late-ad')));
	check('body text uses reader size', (await style(page, '#body p', 'fontSize')) === '19px');
	check('body text uses the palette colour', near(await rgb(page, '#body p', 'color'), await varRgb(page, '--chl-fg')));
	check('default palette is Paper in light mode', near(await rgb(page, 'body', 'backgroundColor'), [251, 250, 247]));
	check('column is constrained', (await page.evaluate(() => document.querySelector('#body').getBoundingClientRect().width)) <= 700);

	await snap(page, 'news-reader');

	await page.click('#vote-yes');
	await page.click('#vote-yes');
	check('page JS still runs: poll buttons work', (await page.textContent('#vote-count')) === '2 votes');
	await page.click('#show-more');
	check('page JS still runs: "show more" adds paragraphs', await visible(page, '#more-1'));
	check('lazy image loaded', await page.evaluate(() => document.querySelector('#lazy-img').naturalWidth === 800));
	await page.click('#inline-img');
	await page.waitForTimeout(300);
	check('lightbox opened by a click is allowed through', await visible(page, '#lightbox'));
	await snap(page, 'news-lightbox');
	await page.click('#lightbox');

	check('tooltip says reader view', /Reader view/.test(await tooltip(page)), await tooltip(page));

	await sendToTab(page, { type: 'chl:toggle' });
	check('popup toggle shows the original', (await mode(page)) === null && (await visible(page, '.sidebar')));
	await snap(page, 'news-original');
	await sendToTab(page, { type: 'chl:toggle' });
	check('popup toggle restores reader mode', (await mode(page)) === 'reader');

	let s = await sendToTab(page, { type: 'chl:cycle' });
	check('shortcut cycles reader → theme only', s.state === 'theme' && (await mode(page)) === 'whole' && (await visible(page, '.sidebar')));
	check('tooltip says theme only', /Theme only/.test(await tooltip(page)), await tooltip(page));
	s = await sendToTab(page, { type: 'chl:cycle' });
	check('shortcut cycles theme only → off', s.state === 'off' && (await mode(page)) === null);
	s = await sendToTab(page, { type: 'chl:cycle' });
	check('shortcut cycles off → reader', s.state === 'reader' && (await mode(page)) === 'reader');

	await storage(() => chrome.storage.sync.set({ 'site:news.test': { mode: 'theme' } }));
	await sendToTab(page, { type: 'chl:redetect' });
	await page.waitForTimeout(300);
	s = await sendToTab(page, { type: 'chl:status' });
	check('"Theme" site mode restyles without reader view, even on an article', s.state === 'theme' && (await mode(page)) === 'whole' && (await visible(page, '.sidebar')));
	await storage(() => chrome.storage.sync.remove('site:news.test'));
	await page.waitForTimeout(300);

	await setReader({ enabled: false });
	await page.waitForTimeout(300);
	s = await sendToTab(page, { type: 'chl:status' });
	check('pausing everywhere reports paused', s.state === 'paused' && (await mode(page)) === null);
	check('tooltip says paused', /Paused/.test(await tooltip(page)), await tooltip(page));
	await setReader({ enabled: true });
	await page.waitForTimeout(300);
	check('resuming brings reader view back', (await mode(page)) === 'reader');

	await setReader({ mode: 'dark', paletteDark: 'dracula', paletteLight: 'paper', font: 'sans', fontSize: 20, lineHeight: 1.7, width: 720, enabled: true, hideImages: false });
	await page.waitForTimeout(300);
	const dracula = await rgb(page, 'body', 'backgroundColor');
	check('pinning dark mode shows the dark palette (Dracula)', isDark(dracula) && near(dracula, await varRgb(page, '--chl-bg')));
	check('font size change applies live', (await style(page, '#body p', 'fontSize')) === '20px');
	await snap(page, 'news-dracula');

	await setReader({ mode: 'system', paletteDark: 'synthwave', paletteLight: 'retro' });
	await page.emulateMedia({ colorScheme: 'dark' });
	await page.waitForTimeout(200);
	check('system mode follows the OS: dark → dark palette', isDark(await rgb(page, 'body', 'backgroundColor')));
	await snap(page, 'news-synthwave');
	await page.emulateMedia({ colorScheme: 'light' });
	await page.waitForTimeout(200);
	const retro = await rgb(page, 'body', 'backgroundColor');
	check('system mode follows the OS: light → light palette (Retro)', !isDark(retro) && near(retro, await varRgb(page, '--chl-bg')));
	await snap(page, 'news-retro');

	await setReader({ theme: 'sepia' });
	await page.waitForTimeout(300);
	check('old single-theme setting migrates (sepia)', near(await rgb(page, 'body', 'backgroundColor'), [244, 236, 216]));
	await storage(() => chrome.storage.sync.remove('reader'));

	await storage(() => chrome.storage.sync.set({ 'site:news.test': { hide: ['#inline-img'] } }));
	await page.waitForTimeout(300);
	check('per-site hide rule applies', !(await visible(page, '#inline-img')));
	await storage(() => chrome.storage.sync.remove('site:news.test'));
	await page.close();
}

// ── WordPress-style blog: div soup, inline styles, code and tables ──
console.log('blog.test (WordPress-style blog)');
{
	const page = await open('blog');
	check('reader mode applied', (await mode(page)) === 'reader');
	check('title visible', await visible(page, '.entry-title'));
	for (const sel of ['#masthead', '#secondary', '#colophon', '.post-navigation']) check(`${sel} hidden`, !(await visible(page, sel)));
	check('inline font-size overridden', (await style(page, '.entry-content p', 'fontSize')) === '19px');
	check('data table gets borders', (await style(page, '.entry-content th', 'borderTopStyle')) === 'solid');
	check('syntax highlighting colours kept', (await style(page, '.hljs-keyword', 'color')) === 'rgb(249, 38, 114)');
	await snap(page, 'blog-reader');
	await page.close();
}

// ── Single-page app: content renders late and routes with pushState ──
console.log('spa.test (client-rendered, pushState routing)');
{
	const page = await open('spa', '/spa/1');
	await page.waitForTimeout(1000);
	check('late-rendered article detected', (await mode(page)) === 'reader' && (await visible(page, '#spa-title')));
	check('app nav hidden', !(await visible(page, '.nav')));
	await page.click('#next-link');
	await page.waitForTimeout(600);
	check('route change re-detects the new article', (await page.textContent('#spa-title')) === 'Why Iguanas Sneeze' && (await mode(page)) === 'reader');
	check('app nav still hidden after navigation', !(await visible(page, '.nav')));
	await page.close();
}

// ── Web app: should be left alone unless the user forces it ──
console.log('app.test (dashboard, not an article)');
{
	const page = await open('app');
	check('auto mode leaves the app alone', (await mode(page)) === null);
	const status = await sendToTab(page, { type: 'chl:status' });
	check('status explains why', /doesn't look like an article|No readable content/.test(status.reason), status.reason);
	check('auto with no article reports off', status.state === 'off');
	await storage(() => chrome.storage.sync.set({ 'site:app.test': { mode: 'reader' } }));
	await page.waitForTimeout(300);
	check('"Reader" with no article falls back to theme only', (await mode(page)) === 'whole');
	check('layout kept in theme-only mode', await visible(page, '.side'));
	check('status reports theme only', (await sendToTab(page, { type: 'chl:status' })).state === 'theme');
	await storage(() => chrome.storage.sync.set({ 'site:app.test': { mode: 'on' } }));
	await page.waitForTimeout(300);
	const legacy = await sendToTab(page, { type: 'chl:status' });
	check('old "Always" rule reads as Reader', legacy.mode === 'reader' && (await mode(page)) === 'whole', legacy.mode);
	await storage(() => chrome.storage.sync.remove('site:app.test'));
	await page.close();
}

// ── 1990s table layout with <font> and <br><br> paragraphs ──
console.log('essay.test (table layout, no <p> tags)');
{
	const page = await open('essay');
	check('reader mode applied', (await mode(page)) === 'reader');
	check('essay text visible', await page.evaluate(() => document.querySelector('[data-chl-root]')?.textContent.includes('not trying to be mammals')));
	check('nav column hidden', await page.evaluate(() => !document.querySelector('a[href="/"]').checkVisibility({ checkVisibilityCSS: true })));
	await snap(page, 'essay-reader');
	await page.close();
}

if (shots) {
	const page = await ctx.newPage();
	await page.setViewportSize({ width: 360, height: 620 });
	await page.goto(`chrome-extension://${extId}/src/panel/popup.html`);
	await page.waitForTimeout(300);
	await snap(page, 'popup');
}

await ctx.close();
server.close();
console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed');
process.exit(failures ? 1 : 0);
