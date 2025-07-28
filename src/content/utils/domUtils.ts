/**
 * DOM utility functions for Chromeleon extension
 */

/**
 * Check if an element exists by ID
 */
export function elementExists(id: string): boolean {
	return document.getElementById(id) !== null;
}

/**
 * Safely get element by ID with error handling
 */
export function safeGetElementById(id: string): HTMLElement | null {
	try {
		return document.getElementById(id);
	} catch (error) {
		console.error(`Failed to get element by ID: ${id}`, error);
		return null;
	}
}

/**
 * Check if document.head is ready
 */
export function isHeadReady(): boolean {
	return document.head !== null;
}

/**
 * Check if document.body is ready
 */
export function isBodyReady(): boolean {
	return document.body !== null;
}

/**
 * Wait for a specific element to exist in the DOM
 */
export function waitForElement(selector: string, timeout = 5000): Promise<Element | null> {
	return new Promise((resolve) => {
		const startTime = Date.now();
		
		const checkElement = () => {
			const element = document.querySelector(selector);
			
			if (element) {
				resolve(element);
				return;
			}
			
			if (Date.now() - startTime > timeout) {
				console.warn(`Timeout waiting for element: ${selector}`);
				resolve(null);
				return;
			}
			
			setTimeout(checkElement, 50);
		};
		
		checkElement();
	});
}

/**
 * Remove element by ID if it exists
 */
export function removeElementById(id: string): boolean {
	const element = document.getElementById(id);
	if (element) {
		element.remove();
		return true;
	}
	return false;
}

/**
 * Create and append a style element
 */
export function createStyleElement(id: string, cssContent: string): HTMLStyleElement | null {
	if (!isHeadReady()) {
		console.error('Cannot create style element: document.head is not ready');
		return null;
	}

	// Remove existing element if present
	removeElementById(id);

	const style = document.createElement('style');
	style.id = id;
	style.textContent = cssContent;
	
	document.head.appendChild(style);
	return style;
}

/**
 * Create and append a link element for external CSS
 */
export function createLinkElement(id: string, href: string): HTMLLinkElement | null {
	if (!isHeadReady()) {
		console.error('Cannot create link element: document.head is not ready');
		return null;
	}

	// Remove existing element if present
	removeElementById(id);

	const link = document.createElement('link');
	link.id = id;
	link.rel = 'stylesheet';
	link.href = href;
	
	document.head.appendChild(link);
	return link;
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout;
	
	return (...args: Parameters<T>) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
} 