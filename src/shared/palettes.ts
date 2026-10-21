/**
 * Colour palettes, ported from Naamia's theme engine (rdburdett/baby-name,
 * packages/shared/src/palettes.ts). Colour is two axes: a mode (system, light
 * or dark) and one palette for each mode, so a reader can pick Sepia by day
 * and Dracula by night and the mode decides which shows.
 *
 * A palette is plain OKLCH data, not CSS; styles.ts turns it into custom
 * properties. There are three kinds:
 *
 * - **Reader palettes** (Paper, Sepia, Mist, Dusk, OLED), hand-set for long-form reading.
 * - **Naamia's house palettes** (Default, Retro, Nautical).
 * - **daisyUI themes** (themes/daisyui.ts, vendored by Naamia), mapped onto
 *   the reader tokens by `fromDaisy`. daisyUI itself isn't installed.
 *
 * Every text colour is pushed to WCAG AA against the surfaces it sits on, so
 * a stylised theme like Valentine still reads; test/check-palettes.mjs
 * fails the build if any pair drops under the floor.
 */

import { contrast, ensureContrast, mix, toHex, type Oklch } from './themes/color';
import { DAISY_THEMES, type DaisyTheme } from './themes/daisyui';

export type ColorMode = 'light' | 'dark';

export type ReaderTokens = {
	background: Oklch;
	foreground: Oklch;
	heading: Oklch;
	muted: Oklch;
	/** Links and focus rings. Body-text contrast, since links sit inline in paragraphs. */
	accent: Oklch;
	/** Table headers, buttons and fields. */
	surface: Oklch;
	border: Oklch;
	codeBg: Oklch;
	selection: Oklch;
};

export type Palette = {
	id: string;
	label: string;
	source: 'reader' | 'naamia' | 'daisyui';
	tokens: Partial<Record<ColorMode, ReaderTokens>>;
};

/** WCAG AA for body text. */
const TEXT = 4.5;

const alpha = (c: Oklch, a: number): Oklch => [c[0], c[1], c[2], a];

/** Fills in the derived tokens and enforces contrast on hand-set ones too. */
function tokens(t: {
	background: Oklch;
	foreground: Oklch;
	heading?: Oklch;
	muted: Oklch;
	accent: Oklch;
	surface: Oklch;
	border: Oklch;
	codeBg?: Oklch;
	selection?: Oklch;
}): ReaderTokens {
	const surfaces = [t.background, t.surface];
	const foreground = ensureContrast(t.foreground, surfaces, TEXT);
	return {
		background: t.background,
		foreground,
		heading: ensureContrast(t.heading ?? foreground, surfaces, TEXT),
		muted: ensureContrast(t.muted, [t.background], TEXT),
		accent: ensureContrast(t.accent, [t.background], TEXT),
		surface: t.surface,
		border: t.border,
		codeBg: t.codeBg ?? t.surface,
		selection: t.selection ?? alpha(t.accent, 0.3),
	};
}

const READER: Palette[] = [
	{
		id: 'paper',
		label: 'Paper',
		source: 'reader',
		tokens: {
			light: tokens({
				background: [0.985, 0.004, 91.4],
				foreground: [0.261, 0.01, 88.8],
				heading: [0.187, 0.006, 91.7],
				muted: [0.512, 0.017, 84.6],
				accent: [0.498, 0.144, 260.7],
				surface: [0.95, 0.01, 87.5],
				border: [0.883, 0.017, 88.0],
				selection: [0.904, 0.046, 262.5],
			}),
		},
	},
	{
		id: 'sepia',
		label: 'Sepia',
		source: 'reader',
		tokens: {
			light: tokens({
				background: [0.944, 0.028, 88.8],
				foreground: [0.337, 0.036, 71.2],
				heading: [0.268, 0.028, 75.4],
				muted: [0.524, 0.042, 69.4],
				accent: [0.504, 0.122, 49.4],
				surface: [0.906, 0.038, 86.9],
				border: [0.834, 0.047, 86.5],
				selection: [0.87, 0.078, 79.2],
			}),
		},
	},
	{
		id: 'mist',
		label: 'Mist',
		source: 'reader',
		tokens: {
			light: tokens({
				background: [0.946, 0.007, 233.6],
				foreground: [0.279, 0.023, 243.4],
				heading: [0.207, 0.02, 239.5],
				muted: [0.51, 0.024, 241.7],
				accent: [0.493, 0.081, 206.3],
				surface: [0.915, 0.009, 232.4],
				border: [0.845, 0.015, 235.4],
				selection: [0.885, 0.043, 203.7],
			}),
		},
	},
	{
		id: 'dusk',
		label: 'Dusk',
		source: 'reader',
		tokens: {
			dark: tokens({
				background: [0.235, 0.008, 264.4],
				foreground: [0.867, 0.01, 87.5],
				heading: [0.946, 0.01, 87.5],
				muted: [0.674, 0.014, 86.9],
				accent: [0.766, 0.108, 259.8],
				surface: [0.28, 0.01, 260.7],
				border: [0.355, 0.013, 261.7],
				selection: [0.408, 0.052, 261.3],
			}),
		},
	},
	{
		id: 'oled',
		label: 'OLED',
		source: 'reader',
		tokens: {
			dark: tokens({
				background: [0, 0, 0],
				foreground: [0.836, 0, 0],
				heading: [0.946, 0, 0],
				muted: [0.633, 0, 0],
				accent: [0.761, 0.117, 70.9],
				surface: [0.191, 0, 0],
				border: [0.285, 0, 0],
				selection: [0.359, 0.046, 78.6],
			}),
		},
	},
];

// Naamia's hand-made palettes, mapped onto the reader tokens: its secondary
// fill becomes our surface and its primary becomes the link colour.
const NAAMIA: Palette[] = [
	{
		id: 'default',
		label: 'Default',
		source: 'naamia',
		tokens: {
			light: tokens({
				background: [1, 0, 0],
				foreground: [0.145, 0, 0],
				muted: [0.556, 0, 0],
				accent: [0.42, 0.1, 265],
				surface: [0.97, 0, 0],
				border: [0.922, 0, 0],
			}),
			dark: tokens({
				background: [0.145, 0, 0],
				foreground: [0.985, 0, 0],
				muted: [0.708, 0, 0],
				accent: [0.8, 0.08, 265],
				surface: [0.269, 0, 0],
				border: [1, 0, 0, 0.1],
			}),
		},
	},
	{
		id: 'retro',
		label: 'Retro',
		source: 'naamia',
		tokens: {
			light: tokens({
				background: [0.95, 0.035, 85],
				foreground: [0.28, 0.05, 50],
				muted: [0.46, 0.05, 55],
				accent: [0.52, 0.15, 42],
				surface: [0.91, 0.04, 80],
				border: [0.85, 0.04, 75],
			}),
		},
	},
	{
		id: 'nautical',
		label: 'Nautical',
		source: 'naamia',
		tokens: {
			dark: tokens({
				background: [0.2, 0.045, 250],
				foreground: [0.95, 0.015, 220],
				muted: [0.76, 0.03, 230],
				accent: [0.78, 0.11, 210],
				surface: [0.3, 0.045, 250],
				border: [1, 0, 0, 0.12],
			}),
		},
	},
];

/**
 * daisyUI's tokens onto the reader's. Unlike Naamia, which puts the page on
 * base-200 and cards on base-100, a reader has one surface: the article sits
 * on base-100 and base-200 fills tables, code and controls.
 */
export function fromDaisy(t: DaisyTheme): ReaderTokens {
	return tokens({
		background: t.base100,
		foreground: t.baseContent,
		muted: mix(t.baseContent, t.base100, 0.7),
		accent: t.primary,
		surface: t.base200,
		border: alpha(t.baseContent, 0.16),
		selection: alpha(t.primary, 0.3),
	});
}

const DAISY_LABELS: Record<string, string> = {
	caramellatte: 'Caramel Latte',
	cmyk: 'CMYK',
	lofi: 'Lo-Fi',
};

export const PALETTES: readonly Palette[] = [
	...READER,
	...NAAMIA,
	...DAISY_THEMES.map(
		(t): Palette => ({
			id: t.id,
			label: DAISY_LABELS[t.id] ?? t.id[0].toUpperCase() + t.id.slice(1),
			source: 'daisyui',
			tokens: { [t.scheme]: fromDaisy(t) },
		}),
	),
];

export const DEFAULT_PALETTE: Record<ColorMode, string> = { light: 'paper', dark: 'dusk' };

export function palettesFor(mode: ColorMode): Palette[] {
	return PALETTES.filter((p) => p.tokens[mode]);
}

export function isPaletteFor(mode: ColorMode, value: unknown): value is string {
	return palettesFor(mode).some((p) => p.id === value);
}

export function paletteTokens(mode: ColorMode, id: string): ReaderTokens {
	const found = PALETTES.find((p) => p.id === id)?.tokens[mode];
	return found ?? PALETTES.find((p) => p.id === DEFAULT_PALETTE[mode])!.tokens[mode]!;
}

/** For test/check-palettes.mjs. Every pair here must reach 4.5:1. */
export function paletteContrasts(t: ReaderTokens): Record<string, number> {
	return {
		'text on page': contrast(t.foreground, t.background),
		'text on surface': contrast(t.foreground, t.surface),
		'heading on page': contrast(t.heading, t.background),
		'muted on page': contrast(t.muted, t.background),
		'link on page': contrast(t.accent, t.background),
		'code on code background': contrast(t.foreground, t.codeBg),
	};
}

/** Swatch colours for the popup, which renders them as hex. */
export function swatch(t: ReaderTokens): { bg: string; fg: string; accent: string } {
	return { bg: toHex(t.background), fg: toHex(t.foreground), accent: toHex(t.accent) };
}
