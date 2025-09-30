import { ThemeManager } from '../theming/themeManager';
import type { ThemeSettings } from '../types';

/**
 * Extension initialization utilities
 */
export class Initialization {
	private themeManager: ThemeManager;

	constructor(themeManager: ThemeManager) {
		this.themeManager = themeManager;
	}

	/**
	 * Start the extension initialization process
	 */
	async start(): Promise<void> {
		console.log('🚀 Chromeleon content script loaded - VERSION 2.0');
		console.log('Current URL:', window.location.href);
		console.log('Document ready state:', document.readyState);

		// Wait for head and body to exist before running extension
		await this.waitForHead();
		await this.waitForBody();
		
		// Initialize the extension
		await this.initializeExtension();

		// React to storage changes (backup signal to runtime messages)
		this.setupStorageChangeListener();

		// Set up DOM ready listener for late initialization if needed
		this.setupDOMReadyListener();
	}

	/**
	 * Wait for document.head to exist
	 */
	private async waitForHead(): Promise<void> {
		if (document.head) {
			console.log('✅ Head exists, extension ready');
			return;
		}

		console.log('⏳ Waiting for document.head...');
		
		return new Promise((resolve) => {
			const checkHead = () => {
				if (document.head) {
					console.log('✅ Head exists, extension ready');
					resolve();
				} else {
					setTimeout(checkHead, 10);
				}
			};
			checkHead();
		});
	}

	/**
	 * Wait for document.body to exist
	 */
	private async waitForBody(): Promise<void> {
		if (document.body) {
			console.log('✅ Body exists, extension ready');
			return;
		}

		console.log('⏳ Waiting for document.body...');
		return new Promise((resolve) => {
			const checkBody = () => {
				if (document.body) {
					console.log('✅ Body exists, extension ready');
					resolve();
				} else {
					setTimeout(checkBody, 10);
				}
			};
			checkBody();
		});
	}

	/**
	 * Initialize the extension after DOM head is ready
	 */
	private async initializeExtension(): Promise<void> {
		console.log('🚀 Initializing Chromeleon extension');
		await this.themeManager.initialize();
	}

	/**
	 * Listen for chrome.storage changes so content reacts to popup setting toggles
	 */
	private setupStorageChangeListener(): void {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(chrome as any).storage.onChanged.addListener(
			(changes: Record<string, any>, areaName: string) => {
				if (areaName !== 'sync') return;

				// Theme settings updated in popup
				if (changes.themeSettings && changes.themeSettings.newValue) {
				const newSettings = changes.themeSettings.newValue as ThemeSettings;
				// Apply without waiting; failures are logged
				void this.themeManager.updateTheme(newSettings);
			}

			// Extension enabled/disabled toggled in popup
			if (Object.prototype.hasOwnProperty.call(changes, 'extensionEnabled')) {
				const enabledChange = changes.extensionEnabled as { newValue: boolean };
				const isEnabled = enabledChange?.newValue !== false;
				void this.themeManager.toggleExtension(isEnabled);
			}
		});
	}

	/**
	 * Set up listener for DOM ready event (fallback)
	 */
	private setupDOMReadyListener(): void {
		document.addEventListener('DOMContentLoaded', async () => {
			console.log('🚀 Chromeleon: DOM loaded');
			
			// Re-apply theme if extension is enabled but theme not currently applied
			if (this.themeManager.isEnabled() && !this.isThemeApplied()) {
				console.log('🎨 Applying theme on DOM ready');
				await this.themeManager.applyCurrentTheme();
			}
		});
	}

	/**
	 * Check if theme is currently applied
	 */
	private isThemeApplied(): boolean {
		return document.getElementById('chromeleon-theme') !== null;
	}
} 