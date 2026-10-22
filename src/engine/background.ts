import { loadSettings, saveSettings, saveSiteRule, type PageState, type ReaderStatus, type SiteMode } from '@/shared/settings';

// Keyboard shortcut, the toolbar icon and its right-click menu. Everything
// else happens in the content script and popup.

// The chameleon changes colour with what it's doing to the page: purple for
// reader view, green for theme only, a hollow grey outline when it's off, and
// yellow when it's paused everywhere.
const iconFor = (state: PageState) => ({
	16: `/icon16-${state}.png`,
	32: `/icon32-${state}.png`,
	48: `/icon48-${state}.png`,
});

const STATE_LABELS: Record<PageState, string> = {
	reader: 'Reader view',
	theme: 'Theme only',
	off: 'Off',
	paused: 'Paused everywhere',
};

const MENU_MODES: { id: SiteMode; title: string }[] = [
	{ id: 'auto', title: 'Auto: reader view on articles' },
	{ id: 'reader', title: 'Reader view on this site' },
	{ id: 'theme', title: 'Theme only on this site' },
	{ id: 'off', title: 'Off on this site' },
];
const MENU_PREFIX = 'chl-mode-';
const MENU_PAUSE = 'chl-pause';

function setTabState(tabId: number, state: PageState, reason?: string): void {
	void chrome.action.setIcon({ tabId, path: iconFor(state) });
	const label = `Chromeleon: ${STATE_LABELS[state]}`;
	void chrome.action.setTitle({ tabId, title: reason && reason !== STATE_LABELS[state] ? `${label}\n${reason}` : label });
}

chrome.runtime.onInstalled.addListener(async () => {
	await chrome.contextMenus.removeAll();
	for (const m of MENU_MODES) {
		chrome.contextMenus.create({ id: MENU_PREFIX + m.id, title: m.title, type: 'radio', contexts: ['action'], checked: m.id === 'auto' });
	}
	chrome.contextMenus.create({ id: 'chl-sep', type: 'separator', contexts: ['action'] });
	const { enabled } = await loadSettings();
	chrome.contextMenus.create({ id: MENU_PAUSE, title: 'Pause everywhere', type: 'checkbox', contexts: ['action'], checked: !enabled });
});

/** Tick the active site's mode in the right-click menu. */
function showMenuMode(mode: SiteMode | null): void {
	for (const m of MENU_MODES) {
		chrome.contextMenus.update(MENU_PREFIX + m.id, { checked: m.id === mode, enabled: mode !== null }, () => void chrome.runtime.lastError);
	}
}

async function statusOf(tabId: number): Promise<ReaderStatus | null> {
	try {
		return (await chrome.tabs.sendMessage(tabId, { type: 'chl:status' })) ?? null;
	} catch {
		// No content script: chrome:// pages, the Web Store, or a tab opened before install.
		return null;
	}
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
	const id = String(info.menuItemId);
	if (id === MENU_PAUSE) {
		await saveSettings({ enabled: !info.checked });
		return;
	}
	if (!id.startsWith(MENU_PREFIX) || tab?.id === undefined) return;
	// The extension can't read tab URLs, so ask the page which site it's on.
	const status = await statusOf(tab.id);
	if (status) await saveSiteRule(status.host, { mode: id.slice(MENU_PREFIX.length) as SiteMode });
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
	showMenuMode((await statusOf(tabId))?.mode ?? null);
});

chrome.storage.onChanged.addListener((changes, area) => {
	if (area !== 'sync' || !('reader' in changes)) return;
	const enabled = changes.reader.newValue?.enabled ?? true;
	chrome.contextMenus.update(MENU_PAUSE, { checked: !enabled }, () => void chrome.runtime.lastError);
});

chrome.commands.onCommand.addListener(async (command) => {
	if (command !== 'toggle-reader') return;
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	if (tab?.id !== undefined) chrome.tabs.sendMessage(tab.id, { type: 'chl:cycle' }).catch(() => {});
});

chrome.runtime.onMessage.addListener((msg, sender) => {
	if (msg?.type !== 'chl:state' || sender.tab?.id === undefined) return;
	setTabState(sender.tab.id, msg.state, msg.reason);
	if (sender.tab.active) showMenuMode(msg.mode);
});

// A full navigation starts at "off" again; the new page's content script
// reports its own state once it has decided. Pages it can't run on (chrome://,
// the Web Store) never report, so they stay off.
chrome.tabs.onUpdated.addListener((tabId, change) => {
	if (change.status === 'loading') setTabState(tabId, 'off');
});
