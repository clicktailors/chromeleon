/**
 * Centralized theme definitions for Chromeleon
 * Supports DaisyUI themes and prepares for custom/premium themes
 */

export interface ThemeInfo {
	name: string;
	value: string;
	category: 'light' | 'dark';
	isPremium?: boolean;
	description?: string;
}

// DaisyUI built-in themes categorized by light/dark
export const LIGHT_THEMES: ThemeInfo[] = [
	{ name: "Cupcake", value: "cupcake", category: "light", description: "Sweet and playful" },
	{ name: "Bumblebee", value: "bumblebee", category: "light", description: "Bright and energetic" },
	{ name: "Emerald", value: "emerald", category: "light", description: "Natural and fresh" },
	{ name: "Corporate", value: "corporate", category: "light", description: "Professional and clean" },
	{ name: "Retro", value: "retro", category: "light", description: "Nostalgic and warm" },
	{ name: "Cyberpunk", value: "cyberpunk", category: "light", description: "Futuristic and neon" },
	{ name: "Valentine", value: "valentine", category: "light", description: "Romantic and soft" },
	{ name: "Garden", value: "garden", category: "light", description: "Organic and earthy" },
	{ name: "Forest", value: "forest", category: "light", description: "Deep and natural" },
	{ name: "Lofi", value: "lofi", category: "light", description: "Minimal and relaxed" },
	{ name: "Pastel", value: "pastel", category: "light", description: "Soft and gentle" },
	{ name: "Fantasy", value: "fantasy", category: "light", description: "Magical and whimsical" },
	{ name: "Wireframe", value: "wireframe", category: "light", description: "Clean and structural" },
	{ name: "CMYK", value: "cmyk", category: "light", description: "Print-inspired colors" },
	{ name: "Autumn", value: "autumn", category: "light", description: "Warm and seasonal" },
	{ name: "Business", value: "business", category: "light", description: "Professional and formal" },
	{ name: "Acid", value: "acid", category: "light", description: "Bold and vibrant" },
	{ name: "Lemonade", value: "lemonade", category: "light", description: "Fresh and citrusy" },
	{ name: "Nord", value: "nord", category: "light", description: "Arctic-inspired" },
	{ name: "Winter", value: "winter", category: "light", description: "Cool and crisp" },
];

export const DARK_THEMES: ThemeInfo[] = [
	{ name: "Dark", value: "dark", category: "dark", description: "Classic dark mode" },
	{ name: "Synthwave", value: "synthwave", category: "dark", description: "80s retro synth" },
	{ name: "Black", value: "black", category: "dark", description: "Pure black theme" },
	{ name: "Luxury", value: "luxury", category: "dark", description: "Elegant and premium" },
	{ name: "Halloween", value: "halloween", category: "dark", description: "Spooky and orange" },
	{ name: "Dracula", value: "dracula", category: "dark", description: "Vampire-inspired" },
	{ name: "Night", value: "night", category: "dark", description: "Deep night colors" },
	{ name: "Coffee", value: "coffee", category: "dark", description: "Rich coffee tones" },
	{ name: "Dim", value: "dim", category: "dark", description: "Subtle and muted" },
	{ name: "Sunset", value: "sunset", category: "dark", description: "Warm sunset hues" },
];

// Combined theme arrays for backward compatibility
export const ALL_THEMES: ThemeInfo[] = [...LIGHT_THEMES, ...DARK_THEMES];

// Theme value arrays for quick lookups
export const LIGHT_THEME_VALUES = LIGHT_THEMES.map(t => t.value);
export const DARK_THEME_VALUES = DARK_THEMES.map(t => t.value);
export const ALL_THEME_VALUES = ALL_THEMES.map(t => t.value);

// Legacy exports for backward compatibility
export const AVAILABLE_DAISYUI_THEMES = [...ALL_THEME_VALUES] as const;
export type DaisyUITheme = (typeof AVAILABLE_DAISYUI_THEMES)[number];

// Utility functions
export function getThemeInfo(value: string): ThemeInfo | undefined {
	return ALL_THEMES.find(theme => theme.value === value);
}

export function isLightTheme(value: string): boolean {
	return LIGHT_THEME_VALUES.includes(value);
}

export function isDarkTheme(value: string): boolean {
	return DARK_THEME_VALUES.includes(value);
}

export function getThemesByCategory(category: 'light' | 'dark'): ThemeInfo[] {
	return category === 'light' ? LIGHT_THEMES : DARK_THEMES;
}

// Future: Custom theme support
export interface CustomTheme extends ThemeInfo {
	isPremium: true;
	price?: number;
	author?: string;
}

// Placeholder for future premium themes
export const PREMIUM_THEMES: CustomTheme[] = [
	// Future custom themes will be added here
];
