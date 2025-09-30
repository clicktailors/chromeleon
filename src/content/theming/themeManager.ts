import { setDaisyUITheme } from './cssInjector';
import { applyGentleTheme } from './themeApplicators';
import { StorageManager } from '../storage/storageManager';
import type { ThemeSettings, ExtensionState } from '../types';
import { ensureOverlay, hideOverlay, showOverlay } from '../ui/overlay';

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
				mode: 'system',
				selectedLightTheme: 'retro',
				selectedDarkTheme: 'dracula',
				showTestPane: false,
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

		// Listen for system color scheme changes when in system mode
		try {
			const mql = window.matchMedia?.('(prefers-color-scheme: dark)');
			if (mql) {
				mql.addEventListener?.('change', () => {
					if (this.state.currentTheme.mode === 'system' && this.state.isEnabled) {
						void this.applyCurrentTheme();
					}
				});
			}
		} catch {}
	}

	/**
	 * Toggle extension on/off
	 */
	async toggleExtension(enabled: boolean): Promise<void> {
		this.state.isEnabled = enabled;
		await StorageManager.saveExtensionState(enabled);

		if (enabled) {
			// Ensure overlay exists and show it
			ensureOverlay();
			showOverlay();
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

		if (!this.state.isEnabled) {
			console.log('❌ Extension disabled, skipping theme application');
			return;
		}

		// Ensure overlay exists and show it
		ensureOverlay();
		showOverlay();

		// DaisyUI CSS is now loaded in shadow DOM overlay

		// Compute effective theme according to mode/system
		const isSystemDark = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ?? false;
		const effectiveTheme = this.state.currentTheme.mode === 'dark'
			? this.state.currentTheme.selectedDarkTheme
			: this.state.currentTheme.mode === 'light'
				? this.state.currentTheme.selectedLightTheme
				: (isSystemDark ? this.state.currentTheme.selectedDarkTheme : this.state.currentTheme.selectedLightTheme);

		// Set DaisyUI theme attribute on overlay host
		setDaisyUITheme(effectiveTheme);

		// Apply theme (single mode)
		applyGentleTheme(effectiveTheme, this.state.currentTheme.showTestPane);
	}

	/**
	 * Remove all theme modifications
	 */
	removeTheme(): void {
		// Remove test component
		const testComponent = document.getElementById('chromeleon-theme-test');
		if (testComponent) {
			testComponent.remove();
		}

		// Hide overlay when extension is disabled
		hideOverlay();

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