/**
 * CSS injection utilities for Chromeleon extension
 */

const DAISYUI_CSS_ID = 'chromeleon-daisyui-css';
const THEME_CSS_ID = 'chromeleon-theme';
const HOST_ID = 'chromeleon-root';

/**
 * Inject DaisyUI CSS into the page if not already present
 * Note: DaisyUI CSS is now loaded inside shadow DOM overlay only
 */
export function injectDaisyUICSS(): void {
	// No longer inject DaisyUI CSS into main document
	// It's now loaded inside the shadow DOM overlay for isolation
	console.log('DaisyUI CSS injection skipped - using shadow DOM isolation');
}

/**
 * Remove theme-specific CSS from shadow DOM
 */
export function removeThemeCSS(): void {
	const host = document.getElementById(HOST_ID) as HTMLElement | null;
	const shadow = (host as any)?.shadowRoot as ShadowRoot | undefined;
	const shadowTheme = shadow?.getElementById?.(THEME_CSS_ID) as HTMLElement | undefined;
	if (shadowTheme) {
		shadowTheme.remove();
	}
	console.log('Theme CSS removed from shadow DOM');
}

/**
 * Remove DaisyUI CSS
 */
export function removeDaisyUICSS(): void {
	const link = document.getElementById(DAISYUI_CSS_ID);
	if (link) link.remove();
}

/**
 * Set DaisyUI theme attribute on shadow DOM host
 * This enables proper theming for React/Tailwind components
 */
export function setDaisyUITheme(themeName: string): void {
	const host = document.getElementById(HOST_ID) as HTMLElement | null;
	if (host) {
		host.setAttribute('data-theme', themeName);
		console.log(`DaisyUI theme set to: ${themeName} on shadow DOM host`);
	}
}

/**
 * Remove DaisyUI theme attribute
 * Only affects the shadow DOM overlay, not the main document
 */
export function removeDaisyUITheme(): void {
	const host = document.getElementById(HOST_ID) as HTMLElement | null;
	host?.removeAttribute('data-theme');
	console.log('DaisyUI theme attribute removed');
}

/**
 * Test if CSS variables are available for debugging
 */
// function validateCSSVariables(): void { /* no-op */ }