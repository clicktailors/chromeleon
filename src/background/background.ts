// Background service worker for Chromeleon extension
console.log('Chromeleon background script loaded');

// Basic background script functionality
chrome.runtime.onInstalled.addListener(() => {
	console.log('Chromeleon extension installed');
}); 