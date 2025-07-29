// Background service worker for Chromeleon extension
console.log('Chromeleon background script loaded');

// Basic background script functionality
chrome.runtime.onInstalled.addListener(() => {
	console.log('Chromeleon extension installed');
});

// Handle messages from popup and forward to content scripts
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
	console.log('Background script received message:', message);
	
	// Handle messages from popup
	if (message.target === 'content-script') {
		handleContentScriptMessage(message);
	}
	
	// Always send a response to prevent connection errors
	sendResponse({ success: true });
});

/**
 * Handle messages that need to be forwarded to content scripts
 */
async function handleContentScriptMessage(message: any) {
	try {
		// Get the active tab
		const [tab] = await chrome.tabs.query({
			active: true,
			currentWindow: true,
		});

		if (!tab.id) {
			console.warn('No active tab found');
			return;
		}

		// Check if the tab URL supports content scripts
		if (!isValidContentScriptTarget(tab.url)) {
			console.log('Tab does not support content scripts:', tab.url);
			return;
		}

		// Try to send message to content script
		try {
			await chrome.tabs.sendMessage(tab.id, message.data);
			console.log('Message sent to content script successfully');
		} catch (error) {
			console.warn('Failed to send message to content script:', error);
			
			// If content script is not available, try to inject it
			if (error instanceof Error && error.message.includes('Receiving end does not exist')) {
				console.log('Attempting to inject content script...');
				try {
					await chrome.scripting.executeScript({
						target: { tabId: tab.id },
						files: ['src/content/content.js']
					});
					
					// Wait a bit and try sending the message again
					setTimeout(async () => {
						try {
							await chrome.tabs.sendMessage(tab.id!, message.data);
							console.log('Message sent after content script injection');
						} catch (retryError) {
							console.warn('Failed to send message after injection:', retryError);
						}
					}, 100);
				} catch (injectionError) {
					console.warn('Failed to inject content script:', injectionError);
				}
			}
		}
	} catch (error) {
		console.error('Error handling content script message:', error);
	}
}

/**
 * Check if a URL is valid for content script injection
 */
function isValidContentScriptTarget(url?: string): boolean {
	if (!url) return false;
	
	// Don't inject into Chrome internal pages
	if (url.startsWith('chrome://') || 
		url.startsWith('chrome-extension://') || 
		url.startsWith('moz-extension://') ||
		url.startsWith('edge://') ||
		url.startsWith('about:')) {
		return false;
	}
	
	// Don't inject into file:// URLs (unless specifically needed)
	if (url.startsWith('file://')) {
		return false;
	}
	
	return true;
} 