import { defineManifest } from '@crxjs/vite-plugin';

const icons = {
	16: 'icon16.png',
	32: 'icon32.png',
	48: 'icon48.png',
	128: 'icon128.png',
};

export default defineManifest({
	manifest_version: 3,
	name: 'Chromeleon',
	version: '2.0.0',
	description: 'A reader view that stays on as you browse, and keeps images, buttons and page scripts working.',
	icons,
	permissions: ['storage'],
	action: {
		default_popup: 'src/panel/popup.html',
		default_title: 'Chromeleon',
		default_icon: icons,
	},
	commands: {
		'toggle-reader': {
			suggested_key: { default: 'Alt+Shift+R' },
			description: 'Toggle reader mode on this page',
		},
	},
	content_scripts: [
		{
			matches: ['http://*/*', 'https://*/*'],
			js: ['src/engine/index.ts'],
			run_at: 'document_start',
		},
	],
	background: {
		service_worker: 'src/engine/background.ts',
		type: 'module',
	},
});
