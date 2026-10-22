// Builds the extension icons from the flat chameleon in icons/chameleon.png.
//
// - icon{16,32,48,128}.png: the full-colour chameleon, used for the extension
//   itself (Chrome's extensions page, the Web Store). The 128px icon keeps
//   Chrome's recommended 16px of clear space around 96px of artwork; the small
//   sizes use the whole square so the toolbar icon stays legible.
// - icon{16,32,48}-<state>.png: the toolbar icon for each thing Chromeleon can
//   be doing to a page (see engine/background.ts):
//     reader  purple, reader view is on
//     theme   green (the artwork's own colour), fonts and colours only
//     off     a hollow grey outline, nothing applied to this page
//     paused  yellow, paused everywhere
//   Off is an outline rather than just grey so it stays distinct from the
//   other states for people who can't tell the colours apart.
//
// Run after changing the artwork: npm run generate-icons

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'icons/chameleon.png');
const out = (name) => path.join(root, 'public', name);

const PADDING = { 16: 0, 32: 0, 48: 2, 128: 16 };

// Tints laid over the artwork's shading; theme keeps the artwork's own greens.
// The artwork is light, so purple is darkened first to stay saturated.
const TINTS = {
	reader: { tint: '#7c3aed', brightness: 0.8 },
	theme: null,
	paused: { tint: '#ffc400', brightness: 0.95, saturation: 1.8 },
};
const OUTLINE = { color: [138, 138, 138], width: { 16: 1.5, 32: 2.5, 48: 3.5 } };

function artwork(size) {
	const inner = size - PADDING[size] * 2;
	return sharp(source).resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });
}

async function place(size, art) {
	return sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
		.composite([{ input: await art.png().toBuffer(), left: PADDING[size], top: PADDING[size] }])
		.png();
}

/** Keep only a band of pixels along the silhouette's edge, painted grey. */
async function outline(size) {
	const { data, info } = await artwork(size).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
	const { width: w, height: h } = info;
	const alpha = (x, y) => (x < 0 || y < 0 || x >= w || y >= h ? 0 : data[(y * w + x) * 4 + 3]);
	const r = OUTLINE.width[size];
	const reach = Math.ceil(r);
	const px = Buffer.alloc(w * h * 4);
	for (let y = 0; y < h; y++) {
		for (let x = 0; x < w; x++) {
			const a = alpha(x, y);
			if (a < 40) continue;
			// Distance to the nearest transparent pixel decides whether this is edge.
			let edge = false;
			for (let dy = -reach; dy <= reach && !edge; dy++) {
				for (let dx = -reach; dx <= reach && !edge; dx++) {
					if (dx * dx + dy * dy <= r * r && alpha(x + dx, y + dy) < 128) edge = true;
				}
			}
			if (!edge) continue;
			const i = (y * w + x) * 4;
			[px[i], px[i + 1], px[i + 2]] = OUTLINE.color;
			px[i + 3] = a;
		}
	}
	return sharp(px, { raw: { width: w, height: h, channels: 4 } });
}

for (const size of [16, 32, 48, 128]) {
	await (await place(size, artwork(size))).toFile(out(`icon${size}.png`));
	console.log(`public/icon${size}.png`);
}
for (const size of [16, 32, 48]) {
	for (const [state, tint] of Object.entries(TINTS)) {
		let art = artwork(size);
		if (tint) art = art.modulate({ brightness: tint.brightness }).tint(tint.tint);
		if (tint?.saturation) art = sharp(await art.png().toBuffer()).modulate({ saturation: tint.saturation });
		await (await place(size, art)).toFile(out(`icon${size}-${state}.png`));
		console.log(`public/icon${size}-${state}.png`);
	}
	await (await place(size, await outline(size))).toFile(out(`icon${size}-off.png`));
	console.log(`public/icon${size}-off.png`);
}
