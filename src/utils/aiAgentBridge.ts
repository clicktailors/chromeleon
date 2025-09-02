// Placeholder for AI agent bridge abstraction
// This will be expanded to manage background/content/popup messaging and caching

export type AIMessage = {
	type: 'ANALYZE' | 'SUMMARIZE' | 'APPLY_THEME';
	payload?: unknown;
};

export class AIAgentBridge {
	static async send(message: AIMessage): Promise<unknown> {
		try {
			return await chrome.runtime.sendMessage({ target: 'background', data: message });
		} catch (error) {
			console.error('AIAgentBridge send failed', error);
			return null;
		}
	}
}



