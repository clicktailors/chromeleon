import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'

export default defineConfig({
	plugins: [react()],
	build: {
		outDir: 'dist',
		// Do not clear the directory; the main build writes to the same outDir in watch mode
		emptyOutDir: false,
		rollupOptions: {
			input: {
				content: resolve(__dirname, 'src/content/index.tsx'),
			},
			output: {
				// Emit to manifest-expected path: src/content/content.js
				entryFileNames: 'src/content/[name].js',
				chunkFileNames: 'assets/[name].js',
				assetFileNames: 'assets/[name].[ext]'
			}
		}
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, 'src')
		}
	},
	css: {
		postcss: {
			plugins: [
				tailwindcss,
				autoprefixer,
			],
		},
	},
})


