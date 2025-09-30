import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.config'

export default defineConfig((configEnv) => {
	const isServe = configEnv.command === 'serve'

	return {
		plugins: [
			react(),
			crx({
				manifest,
				contentScripts: {
					injectCss: true,
					hmrTimeout: 2000
				}
			})
		],
		resolve: {
			alias: {
				'@': resolve(__dirname, 'src')
			}
		},
		css: {
			postcss: {
				plugins: [
					tailwindcss,
					autoprefixer
				]
			}
		},
		build: {
			outDir: 'dist',
			emptyOutDir: configEnv.command === 'build'
		},
		server: {
			port: 3000,
			strictPort: false,
			watch: {
				ignored: [
					'**/dist/**',
					'**/node_modules/**',
					'**/.git/**',
					'**/public/icons/**',
					'**/*.log'
				]
			}
		},
		esbuild: {
			legalComments: 'none'
		},
		optimizeDeps: {
			exclude: ['chrome']
		},
		clearScreen: false,
		logLevel: isServe ? 'info' : 'warn'
	}
})