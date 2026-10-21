// Prints every palette's text contrast and fails if any pair is under WCAG AA
// (4.5:1). Ported from Naamia's scripts/check-palettes.ts. Run after adding or
// changing a palette: npm run check:palettes
//
// palettes.ts is TypeScript, so bundle it with esbuild (already here via Vite)
// and import the result.

import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = await build({
	entryPoints: [path.join(root, 'src/shared/palettes.ts')],
	bundle: true,
	format: 'esm',
	write: false,
	logLevel: 'error',
});
const { PALETTES, paletteContrasts } = await import(`data:text/javascript;base64,${Buffer.from(out.outputFiles[0].text).toString('base64')}`);

let failures = 0;
for (const p of PALETTES) {
	for (const mode of ['light', 'dark']) {
		const t = p.tokens[mode];
		if (!t) continue;
		const pairs = Object.entries(paletteContrasts(t));
		const bad = pairs.filter(([, v]) => v < 4.5);
		failures += bad.length;
		const worst = Math.min(...pairs.map(([, v]) => v)).toFixed(2);
		console.log(
			`${p.id.padEnd(13)} ${mode.padEnd(5)} worst ${worst}` +
				(bad.length ? `  FAIL ${bad.map(([k, v]) => `${k} ${v.toFixed(2)}`).join(', ')}` : ''),
		);
	}
}
if (failures) {
	console.error(`${failures} pair(s) under the floor`);
	process.exit(1);
}
console.log(`${PALETTES.length} palettes, all text pairs at 4.5:1 or better`);
