/**
 * CSS injection utilities for Chromeleon extension
 */

const DAISYUI_CSS_ID = 'chromeleon-daisyui-css';
const THEME_CSS_ID = 'chromeleon-theme';

/**
 * Inject DaisyUI CSS into the page if not already present
 */
export function injectDaisyUICSS(): void {
	// Check if head exists
	if (!document.head) {
		console.log('❌ Head does not exist, cannot inject DaisyUI CSS');
		return;
	}
	
	// Check if DaisyUI CSS is already injected
	if (document.getElementById(DAISYUI_CSS_ID)) {
		console.log('DaisyUI CSS already exists');
		return;
	}
	
	// Fetch the DaisyUI CSS from the extension assets (now contains all themes via CSS plugin)
	const cssUrl = chrome.runtime.getURL('assets/popup.css');
	console.log('Attempting to load DaisyUI CSS from:', cssUrl);
	
	// Create a link element to load the CSS
	const link = document.createElement('link');
	link.id = DAISYUI_CSS_ID;
	link.rel = 'stylesheet';
	link.href = cssUrl;
	
	// Add load/error handlers for debugging
	link.onload = () => {
		console.log('✅ DaisyUI CSS loaded successfully');
		validateCSSVariables();
	};
	
	link.onerror = () => {
		console.error('❌ Failed to load DaisyUI CSS');
	};
	
	document.head.appendChild(link);
	console.log('DaisyUI CSS link element added to head');
}

/**
 * Inject custom theme CSS styles
 */
export function injectThemeCSS(cssContent: string): void {
	if (!document.head) {
		console.error('❌ Cannot inject theme CSS: document.head is null');
		return;
	}

	// Remove existing theme CSS if present
	removeThemeCSS();

	const style = document.createElement('style');
	style.id = THEME_CSS_ID;
	style.textContent = cssContent;
	
	document.head.appendChild(style);
	console.log('✅ Theme CSS injected');
}

/**
 * Remove all Chromeleon-injected CSS
 */
export function removeAllCSS(): void {
	removeThemeCSS();
	removeDaisyUICSS();
}

/**
 * Remove only theme-specific CSS, keeping DaisyUI
 */
export function removeThemeCSS(): void {
	const existingTheme = document.getElementById(THEME_CSS_ID);
	if (existingTheme) {
		existingTheme.remove();
		console.log('Theme CSS removed');
	}
}

/**
 * Remove DaisyUI CSS
 */
export function removeDaisyUICSS(): void {
	const daisyUICSS = document.getElementById(DAISYUI_CSS_ID);
	if (daisyUICSS) {
		daisyUICSS.remove();
		console.log('DaisyUI CSS removed');
	}
}

/**
 * Set DaisyUI theme attribute on document
 */
export function setDaisyUITheme(themeName: string): void {
	document.documentElement.setAttribute('data-theme', themeName);
	console.log(`DaisyUI theme set to: ${themeName}`);
}

/**
 * Remove DaisyUI theme attribute
 */
export function removeDaisyUITheme(): void {
	document.documentElement.removeAttribute('data-theme');
	console.log('DaisyUI theme attribute removed');
}

/**
 * Test if CSS variables are available for debugging
 */
function validateCSSVariables(): void {
	setTimeout(() => {
		if (document.body) {
			const testEl = document.createElement('div');
			document.body.appendChild(testEl);
			const computedStyle = getComputedStyle(document.documentElement);
			const b1Value = computedStyle.getPropertyValue('--b1');
			const bcValue = computedStyle.getPropertyValue('--bc');
			console.log('CSS Variables check - --b1:', b1Value, '--bc:', bcValue);
			document.body.removeChild(testEl);
		}
	}, 100);
} 