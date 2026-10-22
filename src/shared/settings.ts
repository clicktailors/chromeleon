import { DEFAULT_PALETTE, isPaletteFor, type ColorMode } from './palettes';

// Settings shared by the content script, popup and background worker.
// Global look-and-feel lives under one sync key; per-site rules live under
// `site:<hostname>` keys so no single item approaches the sync quota.

export type FontId = 'serif' | 'sans' | 'system' | 'mono' | 'dyslexic';

/**
 * How much Chromeleon does on a site. 'auto' applies reader mode only when the
 * page looks like an article; 'reader' always does, restyling the whole page
 * when there's no article; 'theme' only changes fonts and colours.
 */
export type SiteMode = 'auto' | 'reader' | 'theme' | 'off';

/** What Chromeleon is doing to a page right now. Drives the toolbar icon. */
export type PageState = 'reader' | 'theme' | 'off' | 'paused';

/** Which palette shows: follow the OS, or pin one. */
export type ModePreference = 'system' | ColorMode;

export interface ReaderSettings {
	enabled: boolean;
	mode: ModePreference;
	paletteLight: string;
	paletteDark: string;
	font: FontId;
	fontSize: number; // px
	lineHeight: number; // unitless
	width: number; // content column width in px
	hideImages: boolean;
}

export interface SiteRule {
	mode?: SiteMode;
	/** CSS selector the user picked as the content area. */
	root?: string;
	/** CSS selectors the user chose to hide. */
	hide?: string[];
}

export const DEFAULT_SETTINGS: ReaderSettings = {
	enabled: true,
	mode: 'system',
	paletteLight: DEFAULT_PALETTE.light,
	paletteDark: DEFAULT_PALETTE.dark,
	font: 'serif',
	fontSize: 19,
	lineHeight: 1.65,
	width: 700,
	hideImages: false,
};

export const FONTS: Record<FontId, { label: string; stack: string }> = {
	serif: { label: 'Serif', stack: 'Charter, "Bitstream Charter", "Iowan Old Style", Georgia, Cambria, "Times New Roman", serif' },
	sans: { label: 'Sans', stack: 'Inter, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' },
	system: { label: 'System', stack: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' },
	mono: { label: 'Mono', stack: '"JetBrains Mono", "SF Mono", Menlo, Consolas, monospace' },
	dyslexic: { label: 'Readable', stack: '"Atkinson Hyperlegible", Verdana, Tahoma, sans-serif' },
};

const SETTINGS_KEY = 'reader';
const siteKey = (host: string) => `site:${host}`;

export async function loadSettings(): Promise<ReaderSettings> {
	const res = await chrome.storage.sync.get(SETTINGS_KEY);
	return normalize(res[SETTINGS_KEY] ?? {});
}

/** v2.0 stored a single `theme`; map it onto mode + palette. */
const LEGACY_THEMES: Record<string, Partial<ReaderSettings>> = {
	paper: { mode: 'light', paletteLight: 'paper' },
	sepia: { mode: 'light', paletteLight: 'sepia' },
	mist: { mode: 'light', paletteLight: 'mist' },
	night: { mode: 'dark', paletteDark: 'dusk' },
	oled: { mode: 'dark', paletteDark: 'oled' },
};

function normalize(stored: Partial<ReaderSettings> & { theme?: string }): ReaderSettings {
	const { theme, ...rest } = stored;
	const legacy = theme && !('paletteLight' in stored) ? LEGACY_THEMES[theme] ?? {} : {};
	const next = { ...DEFAULT_SETTINGS, ...rest, ...legacy };
	// Unknown ids (a palette removed in an update) fall back to the defaults.
	if (!isPaletteFor('light', next.paletteLight)) next.paletteLight = DEFAULT_PALETTE.light;
	if (!isPaletteFor('dark', next.paletteDark)) next.paletteDark = DEFAULT_PALETTE.dark;
	if (!['system', 'light', 'dark'].includes(next.mode)) next.mode = 'system';
	return next;
}

export async function saveSettings(patch: Partial<ReaderSettings>): Promise<ReaderSettings> {
	const next = { ...(await loadSettings()), ...patch };
	await chrome.storage.sync.set({ [SETTINGS_KEY]: next });
	return next;
}

export async function loadSiteRule(host: string): Promise<SiteRule> {
	const res = await chrome.storage.sync.get(siteKey(host));
	const rule: Omit<SiteRule, 'mode'> & { mode?: SiteMode | 'on' } = res[siteKey(host)] ?? {};
	// Before theme-only existed, 'on' meant "always reader".
	if (rule.mode === 'on') rule.mode = 'reader';
	return rule as SiteRule;
}

export async function saveSiteRule(host: string, patch: Partial<SiteRule>): Promise<SiteRule> {
	const next = { ...(await loadSiteRule(host)), ...patch };
	await chrome.storage.sync.set({ [siteKey(host)]: next });
	return next;
}

export async function clearSiteRule(host: string): Promise<void> {
	await chrome.storage.sync.remove(siteKey(host));
}

export function onSettingsChanged(host: string, cb: () => void): void {
	chrome.storage.onChanged.addListener((changes, area) => {
		if (area !== 'sync') return;
		if (SETTINGS_KEY in changes || siteKey(host) in changes) cb();
	});
}

// Messages between popup/background and the content script.
export type ReaderMessage =
	| { type: 'chl:status' }
	| { type: 'chl:toggle' }
	| { type: 'chl:cycle' }
	| { type: 'chl:pick'; mode: 'root' | 'hide' }
	| { type: 'chl:redetect' };

export interface ReaderStatus {
	host: string;
	applied: boolean;
	state: PageState;
	/** Why the page is styled the way it is, for display in the popup and icon tooltip. */
	reason: string;
	mode: SiteMode;
	hasCustomRoot: boolean;
	hiddenCount: number;
}
