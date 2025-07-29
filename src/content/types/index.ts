export interface ThemeSettings {
	aggressiveMode: boolean;
	daisyTheme: string;
}

// Removed ThemeColors interface - using pure DaisyUI CSS variables instead

export interface ChromeleonMessage {
	type: 'TOGGLE_EXTENSION' | 'UPDATE_THEME' | 'REPLACE_CONTENT';
	enabled?: boolean;
	settings?: ThemeSettings;
}

export interface ExtensionState {
	isEnabled: boolean;
	currentTheme: ThemeSettings;
}

export interface StorageKeys {
	extensionEnabled: boolean;
	themeSettings: ThemeSettings;
} 