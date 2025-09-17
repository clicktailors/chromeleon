import { ensureShadowHost } from '../utils/domUtils';

const HOST_ID = 'chromeleon-root';

export function ensureOverlay(): { host: HTMLElement; shadow: ShadowRoot; mount: HTMLElement } {
	const { host, shadow } = ensureShadowHost(HOST_ID);

	// Prevent background page from scrolling while overlay is active
	const scrollLockId = 'chromeleon-scroll-lock';
	let scrollLock = document.getElementById(scrollLockId) as HTMLStyleElement | null;
	if (!scrollLock) {
		scrollLock = document.createElement('style');
		scrollLock.id = scrollLockId;
		scrollLock.textContent = `html, body { overflow: hidden !important; }`;
		document.head.appendChild(scrollLock);
	}

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

    // Ensure overlay panel styling inside Shadow DOM
	const styleId = 'chromeleon-overlay-style';
	let style = shadow.getElementById(styleId) as HTMLStyleElement | null;
	if (!style) {
		style = document.createElement('style');
		style.id = styleId;
		style.textContent = `
            #backdrop {
                position: fixed;
                inset: 0;
                z-index: 2147483646;
                pointer-events: none;
                background: transparent;
            }
            #overlay {
                position: fixed;
                inset: 0;
                z-index: 2147483647;
                pointer-events: auto;
                overflow: auto;
                overscroll-behavior: contain;
                -webkit-overflow-scrolling: touch;
                display: block;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
            }
            #overlay.solid {
                background: rgb(var(--b1));
                backdrop-filter: none;
                -webkit-backdrop-filter: none;
            }
            #mount {
                width: 100%;
                max-width: 1200px;
                margin: 24px auto;
                background-color: rgb(var(--b1));
                color: rgb(var(--bc));
                border: 1px solid rgb(var(--b2));
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0,0,0,.2);
                overflow: visible;
                padding: 8px;
            }
		`;
		shadow.appendChild(style);
	}

    // Ensure a full-viewport overlay container that will capture scroll
    let overlay = shadow.getElementById('overlay') as HTMLElement | null;
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'overlay';
        shadow.appendChild(overlay);
    }

    // Ensure a backdrop exists (kept for layering, but no longer styled)
    let backdrop = shadow.getElementById('backdrop') as HTMLElement | null;
    if (!backdrop) {
        backdrop = document.createElement('div');
        backdrop.id = 'backdrop';
        shadow.appendChild(backdrop);
    }

    let mount = shadow.getElementById('mount') as HTMLElement | null;
	if (!mount) {
		mount = document.createElement('div');
		mount.id = 'mount';
        overlay.appendChild(mount);
    } else if (mount.parentElement !== overlay) {
        overlay.appendChild(mount);
	}

	// Read settings to determine overlay style (transparent+blur vs solid)
	const applyOverlayMode = (solid: boolean) => {
		if (!overlay) return;
		if (solid) {
			overlay.classList.add('solid');
			// Resolve CSS variable to actual color with multiple fallbacks
			let baseColor = '';
			try {
				baseColor = getComputedStyle(document.documentElement).getPropertyValue('--b1').trim();
			} catch {}
			if (!baseColor) {
				try { baseColor = getComputedStyle(host).getPropertyValue('--b1').trim(); } catch {}
			}
			if (!baseColor) {
				try { baseColor = getComputedStyle(overlay).getPropertyValue('--b1').trim(); } catch {}
			}
			const channels = baseColor.replace(/\s+/g, ' ').trim();
			const rgbColor = channels ? `rgb(${channels})` : '#1d232a';
			overlay.style.background = rgbColor;
			overlay.style.backgroundColor = rgbColor;
			overlay.style.backdropFilter = '' as any;
			(overlay.style as any).webkitBackdropFilter = '';
		} else {
			overlay.classList.remove('solid');
			overlay.style.backgroundColor = '';
			overlay.style.background = 'rgba(0, 0, 0, 0.5)';
			overlay.style.backdropFilter = 'blur(8px)';
			(overlay.style as any).webkitBackdropFilter = 'blur(8px)';
		}
	};
	try {
		void chrome.storage.sync.get('themeSettings').then((res) => {
			const st = res?.themeSettings || {};
			// Ensure DaisyUI variables apply within shadow by setting theme on overlay container FIRST
			const mode = st.mode || 'system';
			const lightTheme = st.selectedLightTheme || 'retro';
			const darkTheme = st.selectedDarkTheme || 'dracula';
			const isSystemDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
			const effective = mode === 'dark' ? darkTheme : mode === 'light' ? lightTheme : (isSystemDark ? darkTheme : lightTheme);
			if (overlay) overlay.setAttribute('data-theme', effective);
			// Then apply overlay mode so var(--b1) is available
			applyOverlayMode(Boolean(st.overlaySolidBackground));
		});
	} catch {}

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



