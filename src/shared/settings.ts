// Settings shared by the content script, popup and background worker.
// Global look-and-feel lives under one sync key; per-site rules live under
// `site:<hostname>` keys so no single item approaches the sync quota.

export type ThemeId = 'paper' | 'sepia' | 'mist' | 'night' | 'oled';
export type FontId = 'serif' | 'sans' | 'system' | 'mono' | 'dyslexic';

/** 'auto' applies reader mode only when the page looks like an article. */
export type SiteMode = 'auto' | 'on' | 'off';

export interface ReaderSettings {
	enabled: boolean;
	theme: ThemeId;
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
	theme: 'paper',
	font: 'serif',
	fontSize: 19,
	lineHeight: 1.65,
	width: 700,
	hideImages: false,
};

export interface ThemePalette {
	label: string;
	bg: string;
	fg: string;
	muted: string;
	heading: string;
	accent: string;
	surface: string;
	border: string;
	codeBg: string;
	selection: string;
	scheme: 'light' | 'dark';
}

export const THEMES: Record<ThemeId, ThemePalette> = {
	paper: { label: 'Paper', bg: '#fbfaf7', fg: '#26241f', muted: '#6b665c', heading: '#141310', accent: '#2f5fb3', surface: '#f1eee7', border: '#ddd8cc', codeBg: '#f1eee7', selection: '#cfe0ff', scheme: 'light' },
	sepia: { label: 'Sepia', bg: '#f4ecd8', fg: '#433422', muted: '#7a6650', heading: '#2e2416', accent: '#9a4b16', surface: '#ebdfc4', border: '#d6c7a6', codeBg: '#ebdfc4', selection: '#f0cf9a', scheme: 'light' },
	mist: { label: 'Mist', bg: '#e9eef1', fg: '#1f2a33', muted: '#5a6873', heading: '#0f1920', accent: '#0f6e78', surface: '#dde4e8', border: '#c3ced5', codeBg: '#dde4e8', selection: '#b9e2e6', scheme: 'light' },
	night: { label: 'Night', bg: '#1c1e22', fg: '#d6d3cc', muted: '#9a968d', heading: '#f0ede6', accent: '#8ab4f8', surface: '#26292e', border: '#383c43', codeBg: '#26292e', selection: '#3a4a66', scheme: 'dark' },
	oled: { label: 'Black', bg: '#000000', fg: '#c9c9c9', muted: '#8a8a8a', heading: '#ededed', accent: '#e0a458', surface: '#141414', border: '#2a2a2a', codeBg: '#141414', selection: '#4a3a20', scheme: 'dark' },
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
	return { ...DEFAULT_SETTINGS, ...(res[SETTINGS_KEY] ?? {}) };
}

export async function saveSettings(patch: Partial<ReaderSettings>): Promise<ReaderSettings> {
	const next = { ...(await loadSettings()), ...patch };
	await chrome.storage.sync.set({ [SETTINGS_KEY]: next });
	return next;
}

export async function loadSiteRule(host: string): Promise<SiteRule> {
	const res = await chrome.storage.sync.get(siteKey(host));
	return res[siteKey(host)] ?? {};
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
	| { type: 'chl:pick'; mode: 'root' | 'hide' }
	| { type: 'chl:redetect' };

export interface ReaderStatus {
	host: string;
	applied: boolean;
	/** Why reader mode is or isn't applied, for display in the popup. */
	reason: string;
	mode: SiteMode;
	hasCustomRoot: boolean;
	hiddenCount: number;
}
