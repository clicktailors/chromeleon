import { useCallback, useEffect, useState } from 'react';
import {
	DEFAULT_SETTINGS,
	FONTS,
	clearSiteRule,
	loadSettings,
	saveSettings,
	saveSiteRule,
	type FontId,
	type ReaderMessage,
	type ReaderSettings,
	type ReaderStatus,
	type ModePreference,
	type PageState,
	type SiteMode,
} from '@/shared/settings';
import { palettesFor, swatch, type ColorMode } from '@/shared/palettes';

async function activeTabId(): Promise<number | undefined> {
	const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
	return tab?.id;
}

async function send(msg: ReaderMessage): Promise<ReaderStatus | null> {
	const id = await activeTabId();
	if (id === undefined) return null;
	try {
		return (await chrome.tabs.sendMessage(id, msg)) ?? null;
	} catch {
		// No content script: chrome:// pages, the Web Store, or a tab opened before install.
		return null;
	}
}

// Each mode wears the colour the toolbar chameleon turns when it's in effect,
// so the popup teaches what the icon means.
const SITE_MODES: { id: SiteMode; label: string; hint: string; state: PageState | null }[] = [
	{ id: 'auto', label: 'Auto', hint: 'Reader view on articles, otherwise leave the page alone', state: null },
	{ id: 'reader', label: 'Reader', hint: 'Reader view on every page; theme only where there is no article', state: 'reader' },
	{ id: 'theme', label: 'Theme', hint: 'Fonts and colours only; the layout stays as it is', state: 'theme' },
	{ id: 'off', label: 'Off', hint: 'Leave this site alone', state: 'off' },
];

const COLOR_MODES: { id: ModePreference; label: string }[] = [
	{ id: 'system', label: 'System' },
	{ id: 'light', label: 'Light' },
	{ id: 'dark', label: 'Dark' },
];

export function Popup() {
	const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
	const [status, setStatus] = useState<ReaderStatus | null>(null);
	const [loaded, setLoaded] = useState(false);

	const refresh = useCallback(async () => {
		setStatus(await send({ type: 'chl:status' }));
	}, []);

	useEffect(() => {
		void (async () => {
			setSettings(await loadSettings());
			await refresh();
			setLoaded(true);
		})();
	}, [refresh]);

	const patch = async (p: Partial<ReaderSettings>) => {
		setSettings((s) => ({ ...s, ...p }));
		await saveSettings(p);
		// The content script reacts to storage changes; give it a beat before asking again.
		setTimeout(refresh, 120);
	};

	const setSiteMode = async (mode: SiteMode) => {
		if (!status) return;
		await saveSiteRule(status.host, { mode });
		setTimeout(refresh, 120);
	};

	const pick = async (mode: 'root' | 'hide') => {
		await send({ type: 'chl:pick', mode });
		window.close();
	};

	const resetSite = async () => {
		if (!status) return;
		await clearSiteRule(status.host);
		setTimeout(refresh, 120);
	};

	const toggleNow = async () => setStatus(await send({ type: 'chl:toggle' }));

	return (
		<div className="popup">
			<header className="top">
				<img src={`/icon48-${status?.state ?? (settings.enabled ? 'off' : 'paused')}.png`} alt="" width={24} height={24} />
				<h1>Chromeleon</h1>
				<label className="switch" title={settings.enabled ? 'Pause everywhere' : 'Resume'}>
					<input type="checkbox" checked={settings.enabled} onChange={(e) => patch({ enabled: e.target.checked })} />
					<span />
				</label>
			</header>

			{loaded && !status ? (
				<section className="card muted">Reader view isn't available on this page. Try reloading the tab if you just installed the extension.</section>
			) : status ? (
				<section className="card">
					<div className="site-row">
						<div>
							<div className="host">{status.host}</div>
							<div className={`reason state-${status.state}`}>{status.reason}</div>
						</div>
						<button className="ghost" onClick={toggleNow}>{status.applied ? 'Show original' : 'Reader view'}</button>
					</div>
					<div className="segmented site-modes" role="radiogroup" aria-label="This site">
						{SITE_MODES.map((m) => (
							<button key={m.id} role="radio" aria-checked={status.mode === m.id} title={m.hint} className={status.mode === m.id ? 'active' : ''} onClick={() => setSiteMode(m.id)}>
								{m.state ? <i className={`dot state-${m.state}`} /> : <i className="dot auto" />}
								{m.label}
							</button>
						))}
					</div>
					<div className="tools">
						{status.mode !== 'theme' && status.mode !== 'off' && (
							<>
								<button className="ghost" onClick={() => pick('root')}>Pick content area</button>
								<button className="ghost" onClick={() => pick('hide')}>Hide elements</button>
							</>
						)}
						{(status.hasCustomRoot || status.hiddenCount > 0 || status.mode !== 'auto') && (
							<button className="ghost danger" onClick={resetSite}>Reset site</button>
						)}
					</div>
				</section>
			) : null}

			<section className="card">
				<div className="label">Colour</div>
				<div className="segmented" role="radiogroup" aria-label="Colour mode">
					{COLOR_MODES.map((m) => (
						<button key={m.id} role="radio" aria-checked={settings.mode === m.id} className={settings.mode === m.id ? 'active' : ''} onClick={() => patch({ mode: m.id })}>
							{m.label}
						</button>
					))}
				</div>
				{(['light', 'dark'] as ColorMode[]).map((mode) => (
					<PalettePicker
						key={mode}
						mode={mode}
						value={mode === 'light' ? settings.paletteLight : settings.paletteDark}
						dimmed={settings.mode !== 'system' && settings.mode !== mode}
						onChange={(id) => patch(mode === 'light' ? { paletteLight: id } : { paletteDark: id })}
					/>
				))}

				<div className="label">Font</div>
				<div className="fonts">
					{(Object.keys(FONTS) as FontId[]).map((id) => (
						<button key={id} className={settings.font === id ? 'active' : ''} style={{ fontFamily: FONTS[id].stack }} onClick={() => patch({ font: id })}>
							{FONTS[id].label}
						</button>
					))}
				</div>

				<Slider label="Size" value={settings.fontSize} min={14} max={28} step={1} format={(v) => `${v}px`} onChange={(v) => patch({ fontSize: v })} />
				<Slider label="Spacing" value={settings.lineHeight} min={1.3} max={2.1} step={0.05} format={(v) => v.toFixed(2)} onChange={(v) => patch({ lineHeight: v })} />
				<Slider label="Width" value={settings.width} min={480} max={1100} step={20} format={(v) => `${v}px`} onChange={(v) => patch({ width: v })} />

				<label className="check">
					<input type="checkbox" checked={settings.hideImages} onChange={(e) => patch({ hideImages: e.target.checked })} />
					Hide images
				</label>
			</section>

			<footer className="foot">
				<kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd> switches reader, theme and off. Right-click the icon to change this site.
			</footer>
		</div>
	);
}

function PalettePicker(props: { mode: ColorMode; value: string; dimmed: boolean; onChange: (id: string) => void }) {
	const palettes = palettesFor(props.mode);
	const current = palettes.find((p) => p.id === props.value);
	return (
		<div className={`palettes ${props.dimmed ? 'dimmed' : ''}`}>
			<div className="palette-head">
				<span>{props.mode === 'light' ? 'Light palette' : 'Dark palette'}</span>
				<span className="palette-name">{current?.label}</span>
			</div>
			<div className="palette-grid" role="radiogroup" aria-label={`${props.mode} palette`}>
				{palettes.map((p) => {
					const c = swatch(p.tokens[props.mode]!);
					return (
						<button
							key={p.id}
							role="radio"
							aria-checked={p.id === props.value}
							aria-label={p.label}
							title={p.label}
							className={`palette ${p.id === props.value ? 'active' : ''}`}
							style={{ background: c.bg, color: c.fg }}
							onClick={() => props.onChange(p.id)}
						>
							Aa<i style={{ background: c.accent }} />
						</button>
					);
				})}
			</div>
		</div>
	);
}

function Slider(props: { label: string; value: number; min: number; max: number; step: number; format: (v: number) => string; onChange: (v: number) => void }) {
	const [local, setLocal] = useState(props.value);
	useEffect(() => setLocal(props.value), [props.value]);
	return (
		<label className="slider">
			<span>{props.label}</span>
			<input
				type="range"
				min={props.min}
				max={props.max}
				step={props.step}
				value={local}
				onChange={(e) => setLocal(Number(e.target.value))}
				// Save on release; sync storage has a write quota.
				onPointerUp={() => props.onChange(local)}
				onKeyUp={() => props.onChange(local)}
			/>
			<output>{props.format(local)}</output>
		</label>
	);
}
