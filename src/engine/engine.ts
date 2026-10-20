import { findJunk, isReadable, scoreContent, type Detection } from './detect';
import { buildStylesheet } from './styles';
import { PICKER_HOST_ID, selectorFor, startPicker } from './picker';
import {
	DEFAULT_SETTINGS,
	loadSettings,
	loadSiteRule,
	onSettingsChanged,
	saveSiteRule,
	type ReaderSettings,
	type ReaderStatus,
	type SiteRule,
} from '@/shared/settings';

// Reader mode works on the live page. We never copy content out; we tag the
// article and its ancestors with data attributes and let one stylesheet hide
// everything else and restyle what's left. The site's own scripts keep running
// against the same elements, so buttons, forms, video and lazy images still work.

const STYLE_ID = 'chromeleon-style';
const MARKS = ['data-chl-root', 'data-chl-keep', 'data-chl-path', 'data-chl-hide', 'data-chl-allow'] as const;
const OWN_IDS = new Set([STYLE_ID, PICKER_HOST_ID]);
/** New page elements appearing this soon after a click are treated as the user's doing. */
const INTERACTION_GRACE_MS = 2000;
/** How long to keep looking for an article on pages that render late. */
const LATE_CONTENT_WINDOW_MS = 12000;

const host = location.hostname;
const HINT_KEY = `hint:${host}`;
/** Longest we'll keep a page blank while waiting to restyle it. */
const PENDING_MAX_MS = 1500;

let settings: ReaderSettings = DEFAULT_SETTINGS;
let rule: SiteRule = {};
let detection: Detection | null = null;
let applied = false;
let reason = 'Starting';
/** Set by the keyboard shortcut; overrides the site mode until the next navigation. */
let sessionOverride: 'on' | 'off' | null = null;
let lastInteraction = -Infinity;
let lastUrl = location.href;
let startedAt = performance.now();
let picking = false;

export async function start(): Promise<void> {
	const [loaded, siteRule, hint] = await Promise.all([loadSettings(), loadSiteRule(host), chrome.storage.local.get(HINT_KEY)]);
	settings = loaded;
	rule = siteRule;
	ensureStyle();
	// If this site was in reader mode last time, avoid flashing the original layout.
	if (hint[HINT_KEY] && wanted().want && document.readyState === 'loading') {
		document.documentElement.setAttribute('data-chl-pending', '');
		setTimeout(() => document.documentElement.removeAttribute('data-chl-pending'), PENDING_MAX_MS);
	}

	onSettingsChanged(host, async () => {
		[settings, rule] = await Promise.all([loadSettings(), loadSiteRule(host)]);
		ensureStyle();
		update();
	});

	for (const type of ['pointerdown', 'keydown'] as const) {
		window.addEventListener(type, () => (lastInteraction = performance.now()), { capture: true, passive: true });
	}

	chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
		switch (msg?.type) {
			case 'chl:status':
				reply(status());
				break;
			case 'chl:toggle':
				sessionOverride = applied ? 'off' : 'on';
				update();
				reply(status());
				break;
			case 'chl:redetect':
				sessionOverride = null;
				update();
				reply(status());
				break;
			case 'chl:pick':
				pick(msg.mode);
				reply(status());
				break;
		}
	});

	const run = () => {
		update();
		observe();
	};
	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
	else run();
	// Images and fonts shift scores on some pages; give detection a second look.
	window.addEventListener('load', () => !applied && update(), { once: true });
}

function wanted(): { want: boolean; force: boolean } {
	if (sessionOverride === 'off') return { want: false, force: false };
	if (sessionOverride === 'on') return { want: true, force: true };
	if (!settings.enabled) return { want: false, force: false };
	const mode = rule.mode ?? 'auto';
	return { want: mode !== 'off', force: mode === 'on' };
}

/** Decide whether reader mode should be on, and (re)apply or remove it. */
function update(): void {
	if (picking) return;
	const { want, force } = wanted();
	if (!want) {
		remove();
		reason = sessionOverride === 'off' ? 'Turned off with the shortcut' : !settings.enabled ? 'Chromeleon is paused' : 'Off for this site';
		report();
		return;
	}

	detection = detect();
	if (detection && (force || detection.source === 'rule' || isReadable(detection))) {
		applyReader(detection);
		reason = detection.source === 'rule' ? 'Using your content area for this site' : 'Article found';
	} else if (force) {
		applyWhole();
		reason = 'No article found; restyling the whole page';
	} else {
		remove();
		reason = detection ? "This page doesn't look like an article" : 'No readable content found';
	}
	report();
}

function detect(): Detection | null {
	if (rule.root) {
		try {
			const el = document.querySelector(rule.root);
			if (el) return { root: el, extras: [], textLength: 0, linkDensity: 0, paragraphs: 0, source: 'rule' };
		} catch {
			// A bad saved selector falls through to scoring.
		}
	}
	return scoreContent();
}

function clearMarks(): void {
	for (const attr of MARKS) {
		if (attr === 'data-chl-allow') continue;
		for (const el of document.querySelectorAll(`[${attr}]`)) el.removeAttribute(attr);
	}
}

function applyReader(d: Detection): void {
	clearMarks();
	const keep = [d.root, ...d.extras];
	d.root.setAttribute('data-chl-root', '');
	for (const el of d.extras) el.setAttribute('data-chl-keep', '');

	// Every ancestor of a kept element is part of the path; every other child
	// of a path element gets hidden. This strips the page down to the article
	// without moving a single node.
	const path = new Set<Element>();
	for (const el of keep) {
		for (let p = el.parentElement; p && p !== document.documentElement; p = p.parentElement) path.add(p);
	}
	for (const p of path) p.setAttribute('data-chl-path', '');
	for (const p of [document.documentElement, ...path]) {
		for (const child of p.children) {
			if (path.has(child) || keep.includes(child)) continue;
			if (shouldStayVisible(child)) continue;
			child.setAttribute('data-chl-hide', '');
		}
	}

	if (d.source === 'score') for (const el of findJunk(d.root)) el.setAttribute('data-chl-hide', '');
	for (const el of keep) wakeLazyImages(el);

	setMode('reader');
}

function applyWhole(): void {
	clearMarks();
	setMode('whole');
}

function setMode(mode: 'reader' | 'whole'): void {
	const html = document.documentElement;
	html.setAttribute('data-chl-on', '');
	html.setAttribute('data-chl-mode', mode);
	applied = true;
}

function remove(): void {
	clearMarks();
	const html = document.documentElement;
	html.removeAttribute('data-chl-on');
	html.removeAttribute('data-chl-mode');
	applied = false;
}

function shouldStayVisible(el: Element): boolean {
	if (OWN_IDS.has(el.id)) return true;
	if (el.hasAttribute('data-chl-allow')) return true;
	return el.tagName === 'HEAD' || el.tagName === 'SCRIPT' || el.tagName === 'STYLE' || el.tagName === 'LINK' || el.tagName === 'TEMPLATE';
}

function ensureStyle(): void {
	let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
	if (!style) {
		style = document.createElement('style');
		style.id = STYLE_ID;
	}
	style.textContent = buildStylesheet(settings, rule);
	// Keep our sheet last in <html> so it follows anything the page adds to <head>.
	if (style.parentNode !== document.documentElement || style !== document.documentElement.lastElementChild) {
		document.documentElement.appendChild(style);
	}
}

/** Start images that a lazy loader would only fetch for elements it thinks are on screen. */
function wakeLazyImages(scope: Element): void {
	for (const img of scope.querySelectorAll<HTMLImageElement>('img[data-src], img[data-lazy-src], img[data-original]')) {
		const src = img.getAttribute('src') ?? '';
		const placeholder = !src || src.startsWith('data:') || /blank|placeholder|spacer|lazy|1x1|pixel/i.test(src);
		const real = img.dataset.src || img.dataset.lazySrc || img.dataset.original;
		if (placeholder && real) img.src = real;
		const srcset = img.dataset.srcset || img.dataset.lazySrcset;
		if (srcset && !img.srcset) img.srcset = srcset;
	}
	for (const source of scope.querySelectorAll<HTMLSourceElement>('source[data-srcset]')) {
		if (!source.srcset) source.srcset = source.dataset.srcset!;
	}
}

let pending = 0;
function observe(): void {
	const mo = new MutationObserver((records) => {
		if (picking) return;
		if (applied && detection) handleAdditions(records);
		if (!pending) pending = window.setTimeout(reconcile, 250);
	});
	mo.observe(document.documentElement, { childList: true, subtree: true });

	window.addEventListener('popstate', () => reconcile());
	// Navigation API covers pushState routers in Chrome 102+.
	const nav = (window as unknown as { navigation?: EventTarget }).navigation;
	nav?.addEventListener('navigatesuccess', () => reconcile());
}

/**
 * Children added to a path element after we applied would be visible above or
 * below the article: a lightbox the user just opened, or an ad that loaded late.
 * Let the first through and hide the second.
 */
function handleAdditions(records: MutationRecord[]): void {
	const userCaused = performance.now() - lastInteraction < INTERACTION_GRACE_MS;
	for (const r of records) {
		const parent = r.target as Element;
		if (parent !== document.documentElement && !parent.hasAttribute?.('data-chl-path')) continue;
		for (const node of r.addedNodes) {
			if (!(node instanceof Element) || shouldStayVisible(node)) continue;
			if (node.hasAttribute('data-chl-root') || node.hasAttribute('data-chl-keep') || node.hasAttribute('data-chl-path')) continue;
			if (userCaused) node.setAttribute('data-chl-allow', '');
			else node.setAttribute('data-chl-hide', '');
		}
	}
}

/** Re-run detection when the page has moved on: a new route, or the article got re-rendered. */
function reconcile(): void {
	pending = 0;
	if (picking) return;
	ensureStyle();

	if (location.href !== lastUrl) {
		lastUrl = location.href;
		sessionOverride = null;
		startedAt = performance.now();
		document.querySelectorAll('[data-chl-allow]').forEach((el) => el.removeAttribute('data-chl-allow'));
		update();
		return;
	}

	if (applied && detection && !detection.root.isConnected) {
		update();
		return;
	}
	if (applied && detection) {
		wakeLazyImages(detection.root);
		return;
	}
	// Single-page apps often render the article well after DOMContentLoaded.
	if (!applied && performance.now() - startedAt < LATE_CONTENT_WINDOW_MS) update();
}

function pick(mode: 'root' | 'hide'): void {
	if (picking) return;
	if (mode === 'root') {
		// Show the original layout so the user can see what they're choosing.
		picking = true;
		remove();
		startPicker({
			prompt: 'Click the article or main content',
			onPick: async (el) => {
				rule = await saveSiteRule(host, { root: selectorFor(el), mode: 'on' });
				return false;
			},
			onDone: () => {
				picking = false;
				update();
			},
		});
		return;
	}
	picking = true;
	startPicker({
		prompt: 'Click things to hide',
		onPick: async (el) => {
			const sel = selectorFor(el);
			el.setAttribute('data-chl-hide', '');
			rule = await saveSiteRule(host, { hide: [...(rule.hide ?? []), sel] });
			ensureStyle();
			return true;
		},
		onDone: () => {
			picking = false;
			update();
		},
	});
}

function status(): ReaderStatus {
	return {
		host,
		applied,
		reason,
		mode: rule.mode ?? 'auto',
		hasCustomRoot: Boolean(rule.root),
		hiddenCount: rule.hide?.length ?? 0,
	};
}

let reported: boolean | null = null;
function report(): void {
	document.documentElement.removeAttribute('data-chl-pending');
	if (reported === applied) return;
	reported = applied;
	chrome.runtime.sendMessage({ type: 'chl:state', applied }).catch(() => {});
	// Remember for next time so we can hide the page until it's restyled.
	void chrome.storage.local.set({ [HINT_KEY]: applied });
}
