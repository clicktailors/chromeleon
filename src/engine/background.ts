// Keyboard shortcut and the toolbar badge. Everything else happens in the
// content script and popup.

chrome.commands.onCommand.addListener(async (command) => {
	if (command !== 'toggle-reader') return;
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	if (tab?.id !== undefined) chrome.tabs.sendMessage(tab.id, { type: 'chl:toggle' }).catch(() => {});
});

chrome.runtime.onMessage.addListener((msg, sender) => {
	if (msg?.type !== 'chl:state' || sender.tab?.id === undefined) return;
	const tabId = sender.tab.id;
	void chrome.action.setBadgeText({ tabId, text: msg.applied ? 'on' : '' });
	void chrome.action.setBadgeBackgroundColor({ tabId, color: '#3f7d4e' });
});
