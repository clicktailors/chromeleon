import type { ThemeSettings } from '../types';

/**
 * Chrome storage abstraction layer
 */
export class StorageManager {
	/**
	 * Load extension enabled state
	 */
	static async loadExtensionState(): Promise<boolean> {
		try {
			const result = await chrome.storage.sync.get('extensionEnabled');
			return result.extensionEnabled !== false; // Default to true
		} catch (error) {
			console.error('Failed to load extension state:', error);
			return true; // Default fallback
		}
	}

	/**
	 * Save extension enabled state
	 */
	static async saveExtensionState(enabled: boolean): Promise<void> {
		try {
			await chrome.storage.sync.set({ extensionEnabled: enabled });
		} catch (error) {
			console.error('Failed to save extension state:', error);
		}
	}

	/**
	 * Load theme settings
	 */
	static async loadThemeSettings(): Promise<ThemeSettings | null> {
		try {
			const result = await chrome.storage.sync.get('themeSettings');
			return result.themeSettings || null;
		} catch (error) {
			console.error('Failed to load theme settings:', error);
			return null;
		}
	}

	/**
	 * Save theme settings
	 */
	static async saveThemeSettings(settings: ThemeSettings): Promise<void> {
		try {
			await chrome.storage.sync.set({ themeSettings: settings });
		} catch (error) {
			console.error('Failed to save theme settings:', error);
		}
	}

	/**
	 * Load both extension state and theme settings
	 */
	static async loadAllSettings(): Promise<{
		isExtensionEnabled: boolean;
		themeSettings: ThemeSettings | null;
	}> {
		try {
			const result = await chrome.storage.sync.get(['extensionEnabled', 'themeSettings']);
			return {
				isExtensionEnabled: result.extensionEnabled !== false,
				themeSettings: result.themeSettings || null
			};
		} catch (error) {
			console.error('Failed to load settings:', error);
			return {
				isExtensionEnabled: true,
				themeSettings: null
			};
		}
	}

	/**
	 * Clear all extension data
	 */
	static async clearAllData(): Promise<void> {
		try {
			await chrome.storage.sync.clear();
			console.log('All extension data cleared');
		} catch (error) {
			console.error('Failed to clear extension data:', error);
		}
	}
} 