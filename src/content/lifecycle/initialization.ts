import { ThemeManager } from '../theming/themeManager';

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

		// Wait for head to exist before running extension
		await this.waitForHead();
		
		// Initialize the extension
		await this.initializeExtension();

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
	 * Initialize the extension after DOM head is ready
	 */
	private async initializeExtension(): Promise<void> {
		console.log('🚀 Initializing Chromeleon extension');
		await this.themeManager.initialize();
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