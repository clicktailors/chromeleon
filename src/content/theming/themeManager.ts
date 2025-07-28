import { injectDaisyUICSS, removeAllCSS, setDaisyUITheme, removeDaisyUITheme } from './cssInjector';
import { applyAggressiveTheme, applyGentleTheme } from './themeApplicators';
import { StorageManager } from '../storage/storageManager';
import type { ThemeSettings, ExtensionState } from '../types';

/**
 * Main theme management class that coordinates all theme operations
 */
export class ThemeManager {
	private static instance: ThemeManager;
	private state: ExtensionState;

	private constructor() {
		this.state = {
			isEnabled: true,
			currentTheme: {
				aggressiveMode: false,
				daisyTheme: 'dark'
			}
		};
	}

	/**
	 * Get singleton instance
	 */
	static getInstance(): ThemeManager {
		if (!ThemeManager.instance) {
			ThemeManager.instance = new ThemeManager();
		}
		return ThemeManager.instance;
	}

	/**
	 * Initialize theme manager and load settings
	 */
	async initialize(): Promise<void> {
		console.log('🚀 Initializing ThemeManager');

		const settings = await StorageManager.loadAllSettings();
		this.state.isEnabled = settings.isExtensionEnabled;

		if (settings.themeSettings) {
			this.state.currentTheme = settings.themeSettings;
			console.log('📋 Loaded theme settings:', this.state.currentTheme);
		}

		if (this.state.isEnabled) {
			console.log('✅ Extension enabled, applying theme');
			await this.applyCurrentTheme();
		} else {
			console.log('❌ Extension disabled');
		}
	}

	/**
	 * Toggle extension on/off
	 */
	async toggleExtension(enabled: boolean): Promise<void> {
		this.state.isEnabled = enabled;
		await StorageManager.saveExtensionState(enabled);

		if (enabled) {
			await this.applyCurrentTheme();
		} else {
			this.removeTheme();
		}
	}

	/**
	 * Update theme settings
	 */
	async updateTheme(newSettings: ThemeSettings): Promise<void> {
		this.state.currentTheme = newSettings;
		await StorageManager.saveThemeSettings(newSettings);

		if (this.state.isEnabled) {
			await this.applyCurrentTheme();
		}
	}

	/**
	 * Apply the current theme based on settings
	 */
	async applyCurrentTheme(): Promise<void> {
		console.log('🎨 applyCurrentTheme() called');
		console.log('Extension enabled:', this.state.isEnabled);
		console.log('Aggressive mode:', this.state.currentTheme.aggressiveMode);

		if (!this.state.isEnabled) {
			console.log('❌ Extension disabled, skipping theme application');
			return;
		}

		// Remove existing theme if present
		this.removeTheme();

		// Inject DaisyUI CSS if needed
		injectDaisyUICSS();

		// Set DaisyUI theme attribute
		setDaisyUITheme(this.state.currentTheme.daisyTheme);

		// Apply appropriate theme mode
		if (this.state.currentTheme.aggressiveMode) {
			applyAggressiveTheme(this.state.currentTheme.daisyTheme);
		} else {
			applyGentleTheme(this.state.currentTheme.daisyTheme);
		}
	}

	/**
	 * Remove all theme modifications
	 */
	removeTheme(): void {
		removeAllCSS();
		removeDaisyUITheme();
		
		// Remove test component
		const testComponent = document.getElementById('chromeleon-theme-test');
		if (testComponent) {
			testComponent.remove();
		}
		
		console.log('Chromeleon theme removed');
	}

	/**
	 * Get current extension state
	 */
	getState(): ExtensionState {
		return { ...this.state };
	}

	/**
	 * Check if extension is enabled
	 */
	isEnabled(): boolean {
		return this.state.isEnabled;
	}

	/**
	 * Get current theme settings
	 */
	getCurrentTheme(): ThemeSettings {
		return { ...this.state.currentTheme };
	}
} 