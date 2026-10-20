import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.config';

export default defineConfig({
	plugins: [react(), crx({ manifest })],
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src'),
		},
	},
	// Ignore the old Tailwind postcss.config.js; nothing here uses it.
	css: { postcss: {} },
	build: {
		outDir: 'dist',
		emptyOutDir: true,
	},
	esbuild: {
		legalComments: 'none',
	},
	clearScreen: false,
});
