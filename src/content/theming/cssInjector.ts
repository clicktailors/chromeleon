/**
 * CSS injection utilities for Chromeleon extension
 */

const DAISYUI_CSS_ID = 'chromeleon-daisyui-css';
const THEME_CSS_ID = 'chromeleon-theme';
const HOST_ID = 'chromeleon-root';

/**
 * Inject DaisyUI CSS into the page if not already present
 */
export function injectDaisyUICSS(): void {
	// Ensure DaisyUI variables exist in the page for gentle theming
	if (!document.head) return;
	if (document.getElementById(DAISYUI_CSS_ID)) return;
	const cssUrl = chrome.runtime.getURL('assets/popup.css');
	const link = document.createElement('link');
	link.id = DAISYUI_CSS_ID;
	link.rel = 'stylesheet';
	link.href = cssUrl;
	document.head.appendChild(link);
}

/**
 * Inject custom theme CSS styles
 */
export function injectThemeCSS(cssContent: string): void {
	if (!document.head) return;
	removeThemeCSS();
	const style = document.createElement('style');
	style.id = THEME_CSS_ID;
	style.textContent = cssContent;
	document.head.appendChild(style);
}

/**
 * Remove all Chromeleon-injected CSS
 */
export function removeAllCSS(): void {
	removeThemeCSS();
}

/**
 * Remove only theme-specific CSS, keeping DaisyUI
 */
export function removeThemeCSS(): void {
	const existingTheme = document.getElementById(THEME_CSS_ID);
	if (existingTheme) {
		existingTheme.remove();
	}
	const host = document.getElementById(HOST_ID) as HTMLElement | null;
	const shadow = (host as any)?.shadowRoot as ShadowRoot | undefined;
	const shadowTheme = shadow?.getElementById?.(THEME_CSS_ID) as HTMLElement | undefined;
	if (shadowTheme) {
		shadowTheme.remove();
	}
	console.log('Theme CSS removed');
}

/**
 * Remove DaisyUI CSS
 */
export function removeDaisyUICSS(): void {
	const link = document.getElementById(DAISYUI_CSS_ID);
	if (link) link.remove();
}

/**
 * Set DaisyUI theme attribute on document
 */
export function setDaisyUITheme(themeName: string): void {
	document.documentElement.setAttribute('data-theme', themeName);
	const host = document.getElementById(HOST_ID) as HTMLElement | null;
	host?.setAttribute('data-theme', themeName);
	console.log(`DaisyUI theme set to: ${themeName}`);
}

/**
 * Remove DaisyUI theme attribute
 */
export function removeDaisyUITheme(): void {
	document.documentElement.removeAttribute('data-theme');
	const host = document.getElementById(HOST_ID) as HTMLElement | null;
	host?.removeAttribute('data-theme');
	console.log('DaisyUI theme attribute removed');
}

/**
 * Test if CSS variables are available for debugging
 */
// function validateCSSVariables(): void { /* no-op */ }