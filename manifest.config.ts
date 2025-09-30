import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest(async () => ({
		manifest_version: 3,
		name: 'Chromeleon',
		version: '1.0.0',
		description: 'Fully retheme any website with custom styling, animations, and React-based controls',
		icons: {
			16: 'icon16.png',
			32: 'icon32.png',
			48: 'icon48.png',
			128: 'icon128.png'
		},
		permissions: ['scripting', 'activeTab', 'storage'],
		host_permissions: ['<all_urls>'],
		action: {
			default_popup: 'popup.html',
			default_title: 'Chromeleon',
			default_icon: {
				16: 'icon16.png',
				32: 'icon32.png',
				48: 'icon48.png',
				128: 'icon128.png'
			}
		},
		content_scripts: [
			{
				matches: ['<all_urls>'],
				js: ['src/content/index.tsx'],
				css: ['src/styles/content.css'],
				run_at: 'document_start'
			}
		],
		background: {
			service_worker: 'src/background/background.ts',
			type: 'module'
		},
		web_accessible_resources: [
			{
				resources: ['src/**/*', 'assets/*'],
				matches: ['<all_urls>']
			}
		]
}));

