import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import type { ConfigEnv } from 'vite'

export default defineConfig(({ command }: ConfigEnv) => {
	const isDev = command === 'serve';
	
	return {
		plugins: [
			react(),
			...(command === 'build' ? [{
				name: 'build-extension',
				writeBundle() {
					// Copy manifest
					copyFileSync(
						resolve(__dirname, 'public/manifest.json'),
						resolve(__dirname, 'dist/manifest.json')
					)
					
					// Copy icons
					const icons = ['icon16.png', 'icon32.png', 'icon48.png', 'icon128.png', 'icon.svg']
					icons.forEach(icon => {
						copyFileSync(
							resolve(__dirname, `public/${icon}`),
							resolve(__dirname, `dist/${icon}`)
						)
					})
					
					// Ensure CSS directory exists and copy CSS
					const cssDir = resolve(__dirname, 'dist/src/styles')
					if (!existsSync(cssDir)) {
						mkdirSync(cssDir, { recursive: true })
					}
					copyFileSync(
						resolve(__dirname, 'src/styles/content.css'),
						resolve(__dirname, 'dist/src/styles/content.css')
					)
					
					// Fix popup.html - copy to root and fix paths
					if (existsSync(resolve(__dirname, 'dist/src/popup/popup.html'))) {
						let popupContent = readFileSync(resolve(__dirname, 'dist/src/popup/popup.html'), 'utf8')
						// Fix paths to be relative
						popupContent = popupContent.replace(/src="\/popup\.js"/g, 'src="popup.js"')
						popupContent = popupContent.replace(/href="\/assets\//g, 'href="assets/')
						writeFileSync(resolve(__dirname, 'dist/popup.html'), popupContent)
					}
					
					console.log('✅ Extension assets copied and popup fixed')
				}
			}] : [])
		],
		...(isDev ? {} : {
			build: {
				rollupOptions: {
					input: {
						popup: resolve(__dirname, 'src/popup/popup.html'),
						content: resolve(__dirname, 'src/content/content.ts'),
						background: resolve(__dirname, 'src/background/background.ts'),
					},
					output: {
						entryFileNames: (chunkInfo) => {
							if (chunkInfo.name === 'popup') {
								return 'popup.js'
							}
							return 'src/[name]/[name].js'
						},
						chunkFileNames: 'assets/[name].js',
						assetFileNames: (assetInfo) => {
							if (assetInfo.name === 'popup.html') {
								return 'popup.html'
							}
							if (assetInfo.name?.endsWith('.html')) {
								return '[name][extname]'
							}
							return 'assets/[name].[ext]'
						}
					}
				},
				outDir: 'dist',
				emptyOutDir: true
			}
		}),
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
		// Development server config
		server: {
			port: 3000,
			strictPort: false,
			hmr: {
				port: 3000
			},
			watch: {
				ignored: [
					'**/dist/**',
					'**/node_modules/**',
					'**/.git/**',
					'**/public/icons/**',
					'**/*.log'
				]
			}
		}
	}
}) 