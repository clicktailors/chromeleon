// Builds the extension icons from the flat chameleon in icons/chameleon.png.
//
// - icon{16,32,48,128}.png: the full-colour chameleon, used while reader view
//   is on. The 128px icon keeps Chrome's recommended 16px of clear space
//   around 96px of artwork; the small sizes use the whole square so the
//   toolbar icon stays legible.
// - icon{16,32,48}-off.png: the same chameleon with its colour drained, shown in
//   the toolbar on pages where reader view isn't running. It changes colour
//   when it takes over a page.
//
// Run after changing the artwork: npm run generate-icons

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'icons/chameleon.png');
const out = (name) => path.join(root, 'public', name);

const PADDING = { 16: 0, 32: 0, 48: 2, 128: 16 };

async function render(size, { muted = false } = {}) {
	const inner = size - PADDING[size] * 2;
	let art = sharp(source).resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } });
	// Keep a hint of green so it still reads as the same chameleon, just asleep.
	if (muted) art = art.modulate({ saturation: 0.15, brightness: 0.78 });
	const buf = await art.png().toBuffer();
	return sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
		.composite([{ input: buf, left: PADDING[size], top: PADDING[size] }])
		.png();
}

for (const size of [16, 32, 48, 128]) {
	await (await render(size)).toFile(out(`icon${size}.png`));
	console.log(`public/icon${size}.png`);
}
for (const size of [16, 32, 48]) {
	await (await render(size, { muted: true })).toFile(out(`icon${size}-off.png`));
	console.log(`public/icon${size}-off.png`);
}
