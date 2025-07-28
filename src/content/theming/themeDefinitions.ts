/**
 * DaisyUI theme definitions - no longer need hardcoded fallbacks
 * DaisyUI CSS variables will handle all theming
 */

// We can remove all hardcoded theme definitions since DaisyUI handles this
// Just export the available theme names for reference if needed
export const AVAILABLE_DAISYUI_THEMES = [
	'dark', 'light', 'cupcake', 'bumblebee', 'emerald', 'corporate',
	'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween', 'garden',
	'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 'wireframe', 'black',
	'luxury', 'dracula', 'cmyk', 'autumn', 'business', 'acid', 'lemonade',
	'night', 'coffee', 'winter'
] as const;

export type DaisyUITheme = typeof AVAILABLE_DAISYUI_THEMES[number]; 