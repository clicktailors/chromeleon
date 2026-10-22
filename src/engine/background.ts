// Keyboard shortcut and the toolbar icon. Everything else happens in the
// content script and popup.

// The chameleon is muted by default and takes on its colour while reader view
// is restyling the page, the way a chameleon changes to match what it's on.
const ON_ICON = { 16: '/icon16.png', 32: '/icon32.png', 48: '/icon48.png' };
const OFF_ICON = { 16: '/icon16-off.png', 32: '/icon32-off.png', 48: '/icon48-off.png' };

chrome.commands.onCommand.addListener(async (command) => {
	if (command !== 'toggle-reader') return;
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	if (tab?.id !== undefined) chrome.tabs.sendMessage(tab.id, { type: 'chl:toggle' }).catch(() => {});
});

chrome.runtime.onMessage.addListener((msg, sender) => {
	if (msg?.type !== 'chl:state' || sender.tab?.id === undefined) return;
	void chrome.action.setIcon({ tabId: sender.tab.id, path: msg.applied ? ON_ICON : OFF_ICON });
});

// A full navigation starts muted again; the new page's content script reports
// its own state once it has decided. Pages it can't run on (chrome://, the Web
// Store) never report, so they stay muted.
chrome.tabs.onUpdated.addListener((tabId, change) => {
	if (change.status === 'loading') void chrome.action.setIcon({ tabId, path: OFF_ICON });
});
