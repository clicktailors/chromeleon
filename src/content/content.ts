import { Initialization } from './lifecycle/initialization';
import { MessageHandler } from './lifecycle/messageHandler';
import { ThemeManager } from './theming/themeManager';

// Initialize the extension
async function initializeExtension() {
	console.log('🚀 Chromeleon content script starting...');
	
	try {
		// Create theme manager
		const themeManager = ThemeManager.getInstance();
		
		// Create message handler
		const messageHandler = new MessageHandler(themeManager);
		
		// Create initialization handler
		const initialization = new Initialization(themeManager);
		
		// Initialize message handling first
		messageHandler.initialize();
		
		// Start the extension
		await initialization.start();
		
		console.log('✅ Chromeleon content script initialized successfully');
	} catch (error) {
		console.error('❌ Failed to initialize Chromeleon content script:', error);
	}
}

// Start initialization when script loads
initializeExtension(); 