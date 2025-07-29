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