import { ensureShadowHost } from '../utils/domUtils';

const HOST_ID = 'chromeleon-root';

export function ensureOverlay(): { host: HTMLElement; shadow: ShadowRoot; mount: HTMLElement } {
	const { host, shadow } = ensureShadowHost(HOST_ID);

	// Load UI library CSS inside Shadow DOM only (no head injection)
	const cssId = 'chromeleon-daisyui-css';
	let link = shadow.getElementById(cssId) as HTMLLinkElement | null;
	if (!link) {
		link = document.createElement('link');
		link.id = cssId;
		link.rel = 'stylesheet';
		link.href = chrome.runtime.getURL('assets/popup.css');
		shadow.appendChild(link);
	}

	// Ensure minimal overlay container styling inside Shadow DOM
	const styleId = 'chromeleon-overlay-style';
	let style = shadow.getElementById(styleId) as HTMLStyleElement | null;
	if (!style) {
		style = document.createElement('style');
		style.id = styleId;
		style.textContent = `
			#mount { position: fixed; top: 8px; right: 8px; max-height: 90vh; width: 380px; z-index: 2147483647; pointer-events: auto; }
		`;
		shadow.appendChild(style);
	}

	let mount = shadow.getElementById('mount') as HTMLElement | null;
	if (!mount) {
		mount = document.createElement('div');
		mount.id = 'mount';
		shadow.appendChild(mount);
	}

	// Apply saved theme to overlay host (compute effective by mode)
	try {
		void chrome.storage.sync.get('themeSettings').then((res) => {
			const st = res?.themeSettings || {};
			const mode = st.mode || 'system';
			const lightTheme = st.selectedLightTheme || 'retro';
			const darkTheme = st.selectedDarkTheme || 'dracula';
			const isSystemDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
			const effective = mode === 'dark' ? darkTheme : mode === 'light' ? lightTheme : (isSystemDark ? darkTheme : lightTheme);
			host.setAttribute('data-theme', effective);
		});
	} catch {}
	return { host, shadow, mount };
}



