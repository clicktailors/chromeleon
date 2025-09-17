import { ThemeManager } from '../theming/themeManager';
import type { ChromeleonMessage } from '../types';

/**
 * Message handler for Chrome extension communication
 */
export class MessageHandler {
	private themeManager: ThemeManager;

	constructor(themeManager: ThemeManager) {
		this.themeManager = themeManager;
	}

	/**
	 * Initialize message listener
	 */
	initialize(): void {
		chrome.runtime.onMessage.addListener((message: ChromeleonMessage) => {
			this.handleMessage(message);
		});
		console.log('📨 Message handler initialized');
	}

	/**
	 * Handle incoming messages from popup or other extension parts
	 */
	private async handleMessage(message: ChromeleonMessage): Promise<void> {
		console.log('📨 Content script received message:', message);
		console.log('Current theme state:', this.themeManager.getCurrentTheme());
		console.log('Extension enabled:', this.themeManager.isEnabled());

		switch (message.type) {
			case 'TOGGLE_EXTENSION':
				await this.handleToggleExtension(message);
				break;

			case 'UPDATE_THEME':
				await this.handleUpdateTheme(message);
				break;

			

			case 'REPLACE_CONTENT':
				await this.handleReplaceContent(message);
				break;

			default:
				console.warn('Unknown message type:', message.type);
		}
	}

	/**
	 * Handle extension toggle
	 */
	private async handleToggleExtension(message: ChromeleonMessage): Promise<void> {
		if (message.enabled !== undefined) {
			await this.themeManager.toggleExtension(message.enabled);
		}
	}

	/**
	 * Handle theme update
	 */
	private async handleUpdateTheme(message: ChromeleonMessage): Promise<void> {
		if (message.settings) {
			await this.themeManager.updateTheme(message.settings);
			// Update overlay backdrop mode immediately when settings change
			try {
				const host = document.getElementById('chromeleon-root') as HTMLElement | null;
				const shadow = (host as any)?.shadowRoot as ShadowRoot | undefined;
				const overlayEl = shadow?.getElementById('overlay');
				if (overlayEl) {
					const st: any = message.settings;
					const mode = st.mode || 'system';
					const lightTheme = st.selectedLightTheme || 'retro';
					const darkTheme = st.selectedDarkTheme || 'dracula';
					const isSystemDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
					const effective = mode === 'dark' ? darkTheme : mode === 'light' ? lightTheme : (isSystemDark ? darkTheme : lightTheme);
					overlayEl.setAttribute('data-theme', effective);
					// After theme is applied, toggle overlay mode and inline fallback styles
					if (st.overlaySolidBackground) {
						overlayEl.classList.add('solid');
						const computed = getComputedStyle(overlayEl);
						const baseColor = computed.getPropertyValue('--b1').trim();
						if (baseColor) {
							overlayEl.style.background = baseColor;
							overlayEl.style.backgroundColor = baseColor;
						}
						overlayEl.style.backdropFilter = '' as any;
						(overlayEl.style as any).webkitBackdropFilter = '';
					} else {
						overlayEl.classList.remove('solid');
						overlayEl.style.backgroundColor = '';
						overlayEl.style.background = 'rgba(0, 0, 0, 0.5)';
						overlayEl.style.backdropFilter = 'blur(8px)';
						(overlayEl.style as any).webkitBackdropFilter = 'blur(8px)';
					}
				}
			} catch {}
		}
	}



	/**
	 * Handle content replacement (reader mode)
	 */
	private async handleReplaceContent(_message: ChromeleonMessage): Promise<void> {
		// TODO: Implement content replacement
		console.log('Content replacement requested - implementation pending');
	}
} 