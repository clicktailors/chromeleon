/**
 * OKLCH colours as plain numbers, so a theme is data that any client can use:
 * the web writes them as CSS `oklch()`, and a native app (which has no oklch)
 * can turn them into hex with `toHex`. Also the contrast maths the palettes
 * use to keep text readable on every theme.
 */

/** [lightness 0–1, chroma, hue in degrees, optional alpha 0–1] */
export type Oklch = readonly [number, number, number] | readonly [number, number, number, number];

const round = (n: number, places: number) => Number(n.toFixed(places));

export function toCss([l, c, h, alpha]: Oklch): string {
  const a = alpha === undefined ? "" : ` / ${round(alpha * 100, 1)}%`;
  return `oklch(${round(l, 4)} ${round(c, 4)} ${round(h, 3)}${a})`;
}

/** Parses `oklch(97.788% 0.004 56.375)` or `oklch(0.97 0.004 56)`. */
export function parseOklch(css: string): Oklch {
  const m = css.match(/oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)/);
  if (!m) throw new Error(`Not an oklch() colour: ${css}`);
  const l = Number(m[1]) / (m[2] ? 100 : 1);
  return [l, Number(m[3]), Number(m[4])];
}

function toOklab([l, c, h]: Oklch): [number, number, number] {
  const r = (h * Math.PI) / 180;
  return [l, c * Math.cos(r), c * Math.sin(r)];
}

function fromOklab([l, a, b]: [number, number, number]): Oklch {
  const c = Math.hypot(a, b);
  const h = c < 1e-4 ? 0 : ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360;
  return [l, c, h];
}

/** `amount` of `a` mixed into `b`, in Oklab (as CSS `color-mix(in oklab, …)`). */
export function mix(a: Oklch, b: Oklch, amount: number): Oklch {
  const x = toOklab(a);
  const y = toOklab(b);
  return fromOklab([0, 1, 2].map((i) => x[i] * amount + y[i] * (1 - amount)) as [number, number, number]);
}

/** Linear sRGB, unclamped. */
function toLinearSrgb(color: Oklch): [number, number, number] {
  const [L, a, b] = toOklab(color);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

const hexByte = (n: number) => Math.round(clamp01(n) * 255).toString(16).padStart(2, "0");

/** `#rrggbb` (or `#rrggbbaa`), clipped to the sRGB gamut. For clients without oklch. */
export function toHex(color: Oklch): string {
  const rgb = toLinearSrgb(color).map((v) => {
    const c = clamp01(v);
    return hexByte(c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
  });
  return "#" + rgb.join("") + (color[3] === undefined ? "" : hexByte(color[3]));
}

function luminance(color: Oklch): number {
  const [r, g, b] = toLinearSrgb(color).map(clamp01);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2 contrast ratio, 1–21. */
export function contrast(a: Oklch, b: Oklch): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * `fg`, moved in lightness (hue and chroma kept) just far enough to reach
 * `min` contrast against every one of `bgs`. Moves away from the background
 * first — darker on a light page, lighter on a dark one — and only tries the
 * other way if that runs out of room.
 */
export function ensureContrast(fg: Oklch, bgs: readonly Oklch[], min: number): Oklch {
  const ok = (c: Oklch) => bgs.every((bg) => contrast(c, bg) >= min);
  if (ok(fg)) return fg;
  const bgL = bgs.reduce((s, b) => s + b[0], 0) / bgs.length;
  const first = fg[0] <= bgL ? -1 : 1;
  for (const dir of [first, -first]) {
    for (let l = fg[0]; l >= 0 && l <= 1; l += dir * 0.005) {
      // Chroma shrinks towards black and white, or the colour leaves the gamut.
      const c = Math.min(fg[1], 0.4 * Math.min(l, 1 - l) + 0.02);
      const candidate: Oklch = [l, c, fg[2]];
      if (ok(candidate)) return candidate;
    }
  }
  return fg[0] <= bgL ? [0, 0, 0] : [1, 0, 0];
}
