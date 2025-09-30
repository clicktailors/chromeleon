import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { motion } from "framer-motion";
import "./popup.css";
import { chromeStorage, chromeRuntime } from '@/utils/chromeApi';
import { LIGHT_THEMES, DARK_THEMES, LIGHT_THEME_VALUES, DARK_THEME_VALUES } from '@/content/theming/themeDefinitions';

type ThemeMode = "system" | "light" | "dark";

interface ThemeSettings {
	mode: ThemeMode;
	selectedLightTheme: string;
	selectedDarkTheme: string;
	showTestPane: boolean;
}

const Popup: React.FC = () => {
	const [isExtensionEnabled, setIsExtensionEnabled] = useState(true);
	const [settings, setSettings] = useState<ThemeSettings>({
		mode: "system",
		selectedLightTheme: "retro",
		selectedDarkTheme: "dracula",
		showTestPane: true,
	});
	const [overlaySolidBackground, setOverlaySolidBackground] = useState<boolean>(false);
	const [useDemoSchema, setUseDemoSchema] = useState<boolean>(false);
	const [isSystemDark, setIsSystemDark] = useState<boolean>(
		window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false
	);

	// UI adapter selection (daisy | shadcn)
	const [uiAdapter, setUiAdapter] = useState<'daisy' | 'shadcn'>('daisy');

	// Use centralized theme definitions
	const lightSet = new Set(LIGHT_THEME_VALUES);
	const darkSet = new Set(DARK_THEME_VALUES);

	useEffect(() => {
		// Load saved settings and extension state
		loadSettings();
		loadExtensionState();
		loadUiAdapter();
	}, []);

	useEffect(() => {
		const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
		const handler = () => setIsSystemDark(mql?.matches ?? false);
		mql?.addEventListener?.("change", handler);
		return () => mql?.removeEventListener?.("change", handler as any);
	}, []);

	const effectiveTheme = (() => {
		if (settings.mode === "dark") return settings.selectedDarkTheme;
		if (settings.mode === "light") return settings.selectedLightTheme;
		return isSystemDark
			? settings.selectedDarkTheme
			: settings.selectedLightTheme;
	})();

	const loadExtensionState = async () => {
		if (!chromeStorage?.sync?.get) {
			console.warn('chrome.storage.sync.get is unavailable');
			return;
		}
		try {
			const result = await chromeStorage.sync.get('extensionEnabled') as { extensionEnabled?: boolean };
			setIsExtensionEnabled(result?.extensionEnabled !== false);
		} catch (error) {
			console.error('Failed to load extension state:', error);
		}
	};

	const normalizeSettings = (st: ThemeSettings): ThemeSettings => {
		const next = { ...st };
		if (!lightSet.has(next.selectedLightTheme))
			next.selectedLightTheme = "retro";
		if (!darkSet.has(next.selectedDarkTheme))
			next.selectedDarkTheme = "dark";
		return next;
	};

	const toggleExtension = async () => {
		const newState = !isExtensionEnabled;
		setIsExtensionEnabled(newState);

		if (!chromeStorage?.sync?.set || !chromeRuntime?.sendMessage) {
			console.warn('chrome APIs unavailable to toggle extension');
			return;
		}

		try {
			await chromeStorage.sync.set({ extensionEnabled: newState });
			await chromeRuntime.sendMessage({
				target: 'content-script',
				data: {
					type: 'TOGGLE_EXTENSION',
					enabled: newState,
				},
			});
		} catch (error) {
			console.error('Failed to toggle extension:', error);
			setIsExtensionEnabled(!newState);
		}
	};

	const loadSettings = async () => {
		if (!chromeStorage?.sync?.get) {
			console.warn('chrome.storage.sync.get is unavailable');
			return;
		}
		try {
			const result = await chromeStorage.sync.get('themeSettings') as { themeSettings?: ThemeSettings & { daisyTheme?: string; overlaySolidBackground?: boolean } };
			if (result.themeSettings) {
				const st = result.themeSettings;
				if (st.daisyTheme) {
					setSettings(
						normalizeSettings({
							mode: 'system',
							selectedLightTheme: st.daisyTheme,
							selectedDarkTheme: st.daisyTheme,
							showTestPane: st.showTestPane ?? true,
						})
					);
				} else {
					setSettings(normalizeSettings(st));
				}
				setOverlaySolidBackground(Boolean(st.overlaySolidBackground));
			}
		} catch (error) {
			console.error('Failed to load settings:', error);
		}
		try {
			const res = await chromeStorage.sync.get('useDemoSchema') as { useDemoSchema?: boolean };
			setUseDemoSchema(Boolean(res.useDemoSchema));
		} catch (e) {
			console.error('Failed to load dev schema toggle:', e);
		}
	};

	const updateTheme = async (newSettings: Partial<ThemeSettings>) => {
		let updatedSettings = { ...settings, ...newSettings } as ThemeSettings;
		if (newSettings.mode) {
			updatedSettings = normalizeSettings(updatedSettings);
		}
		const previousSettings = { ...settings };
		setSettings(updatedSettings);

		if (!chromeStorage?.sync?.set || !chromeRuntime?.sendMessage) {
			console.warn('chrome APIs unavailable to update theme');
			return;
		}

		try {
			await chromeStorage.sync.set({ themeSettings: { ...updatedSettings, overlaySolidBackground } });
			await chromeRuntime.sendMessage({
				target: 'content-script',
				data: {
					type: 'UPDATE_THEME',
					settings: { ...updatedSettings, overlaySolidBackground },
				},
			});
		} catch (error) {
			console.error('Failed to update theme:', error);
			setSettings(previousSettings);
		}
	};

	const updateOverlayBackground = async (solid: boolean) => {
		setOverlaySolidBackground(solid);
		if (!chromeStorage?.sync?.set || !chromeRuntime?.sendMessage) {
			console.warn('chrome APIs unavailable to update overlay background');
			return;
		}
		try {
			await chromeStorage.sync.set({ themeSettings: { ...settings, overlaySolidBackground: solid } });
			await chromeRuntime.sendMessage({
				target: 'content-script',
				data: {
					type: 'UPDATE_THEME',
					settings: { ...settings, overlaySolidBackground: solid },
				},
			});
		} catch (error) {
			console.error('Failed to update overlay background mode:', error);
		}
	};

	const toggleUseDemoSchema = async (value: boolean) => {
		setUseDemoSchema(value);
		if (!chromeStorage?.sync?.set) {
			console.warn('chrome.storage.sync.set unavailable for demo schema toggle');
			return;
		}
		try {
			await chromeStorage.sync.set({ useDemoSchema: value });
		} catch (error) {
			console.error('Failed to update dev schema toggle:', error);
		}
	};

	const loadUiAdapter = async () => {
		if (!chromeStorage?.sync?.get) {
			console.warn('chrome.storage.sync.get unavailable for UI adapter');
			return;
		}
		try {
			const result = await chromeStorage.sync.get('uiAdapter') as { uiAdapter?: 'daisy' | 'shadcn' };
			if (result.uiAdapter === 'shadcn' || result.uiAdapter === 'daisy') {
				setUiAdapter(result.uiAdapter);
			}
		} catch (error) {
			console.error('Failed to load UI adapter:', error);
		}
	};

	const updateUiAdapter = async (value: 'daisy' | 'shadcn') => {
		const prev = uiAdapter;
		setUiAdapter(value);
		if (!chromeStorage?.sync?.set) {
			console.warn('chrome.storage.sync.set unavailable for UI adapter');
			return;
		}
		try {
			await chromeStorage.sync.set({ uiAdapter: value });
		} catch (error) {
			console.error('Failed to save UI adapter:', error);
			setUiAdapter(prev);
		}
	};

	const activeList =
		settings.mode === "dark" || (settings.mode === "system" && isSystemDark)
			? DARK_THEMES
			: LIGHT_THEMES;
	const currentSelection =
		settings.mode === "dark" || (settings.mode === "system" && isSystemDark)
			? settings.selectedDarkTheme
			: settings.selectedLightTheme;

	return (
		<div
			className="w-full h-full transition-colors duration-300 bg-base-300 border-2 border-gray-500/30 overflow-y-auto"
			data-theme={effectiveTheme}
		>
			{/* Force all DaisyUI themes to be included in build */}
			{LIGHT_THEMES.map((theme) => (
				<div key={theme.value} className="hidden" data-theme={theme.value}></div>
			))}
			{DARK_THEMES.map((theme) => (
				<div key={theme.value} className="hidden" data-theme={theme.value}></div>
			))}
				<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
					className="w-full min-h-full"
			>
				{/* Header */}
				<motion.div
					initial={{ y: -20 }}
					animate={{ y: 0 }}
					className="p-4 pb-4 bg-base-300"
				>
					<div className="text-center">
						<h1 className="card-title text-2xl justify-center text-base-content">
							<span className="text-base-content">
								Chromeleon
							</span>
						</h1>
						<p className="text-base-content/70 text-sm">
							Website Rethemer
						</p>
					</div>
				</motion.div>

				{/* Extension Toggle */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.05 }}
					className="px-6 py-4"
				>
					<div className="form-control">
						<label className="label cursor-pointer">
							<span className="label-text font-medium">
								Enable Extension
							</span>
							<input
								type="checkbox"
								checked={isExtensionEnabled}
								onChange={toggleExtension}
								className="toggle toggle-primary"
							/>
						</label>
					</div>
				</motion.div>

				<div className="divider m-0"></div>

				{/* Content */}
				<div className="card-body pt-4">
					{isExtensionEnabled ? (
						<div className="">
							{/* UI Adapter Selection */}
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.08 }}
								className="form-control"
							>
								<h3 className="text-lg font-semibold mb-3 text-base-content flex items-center gap-2">
									UI Kit
								</h3>
								<select
									value={uiAdapter}
									onChange={(e) => updateUiAdapter((e.target.value === 'shadcn' ? 'shadcn' : 'daisy'))}
									className="select select-bordered w-full mb-2"
								>
									<option value="daisy">DaisyUI</option>
									<option value="shadcn">shadcn/ui</option>
								</select>
							</motion.div>

						{/* Dev Schema Toggle */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.12 }}
							className="form-control"
						>
							<h3 className="text-lg font-semibold mb-3 text-base-content flex items-center gap-2">
								Render Mode
							</h3>
							<label className="label cursor-pointer justify-start gap-3">
								<input
									type="checkbox"
									checked={useDemoSchema}
									onChange={(e) => toggleUseDemoSchema(e.target.checked)}
									className="toggle toggle-secondary"
								/>
								<span className="label-text">Use local demo schema (instead of live page)</span>
							</label>
						</motion.div>

						{/* DaisyUI Theme Selection */}
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.1 }}
								className="form-control"
							>
								<h3 className="text-lg font-semibold mb-3 text-base-content flex items-center gap-2">
									Theme
								</h3>
								<div className="form-control">
									<label className="label">
										<span className="label-text">Mode</span>
									</label>
									<select
										value={settings.mode}
										onChange={(e) =>
											updateTheme({
												mode: e.target
													.value as ThemeMode,
											})
										}
										className="select select-bordered w-full mb-2"
									>
										<option value="system">
											Match system
										</option>
										<option value="light">Light</option>
										<option value="dark">Dark</option>
									</select>

									<label className="label">
										<span className="label-text">
											Theme
										</span>
									</label>
									<select
										value={currentSelection}
										onChange={(e) => {
											if (
												settings.mode === "dark" ||
												(settings.mode === "system" &&
													isSystemDark)
											) {
												updateTheme({
													selectedDarkTheme:
														e.target.value,
												});
											} else {
												updateTheme({
													selectedLightTheme:
														e.target.value,
												});
											}
										}}
										className="select select-bordered w-full"
									>
										{activeList.map((theme) => (
											<option
												key={theme.value}
												value={theme.value}
											>
												{theme.name}
											</option>
										))}
									</select>
								</div>
							</motion.div>

							{/* Overlay Background Mode */}
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.18 }}
								className="form-control"
							>
								<h3 className="text-lg font-semibold mb-3 text-base-content flex items-center gap-2">
									Overlay Style
								</h3>
								<label className="label cursor-pointer justify-start gap-3">
									<input
										type="checkbox"
										checked={overlaySolidBackground}
										onChange={(e) => updateOverlayBackground(e.target.checked)}
										className="toggle toggle-primary"
									/>
									<span className="label-text">Use solid overlay background</span>
								</label>
							</motion.div>

							{/* Test Pane Toggle */}
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.22 }}
								className="form-control"
							>
								<h3 className="text-lg font-semibold mb-3 text-base-content flex items-center gap-2">
									Test Pane
								</h3>
								<div className="form-control">
									<label className="label cursor-pointer justify-start gap-3">
										<input
											type="checkbox"
											checked={settings.showTestPane}
											onChange={(e) =>
												updateTheme({
													showTestPane:
														e.target.checked,
												})
											}
											className="checkbox checkbox-primary"
										/>
										<div className="flex flex-col">
											<span className="label-text font-medium">
												Show Chromeleon test pane
											</span>
											<span className="label-text-alt text-base-content/60">
												Helps verify theming; disable
												when it blocks site UI
											</span>
										</div>
									</label>
								</div>
							</motion.div>

							{/* Theme Preview */}
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.3 }}
								className="card bg-base-200 p-4"
							>
								<h4 className="font-medium text-base-content mb-3 flex items-center gap-2">
									🎨 Live Preview
									<span className="badge badge-primary badge-sm">
										{effectiveTheme}
									</span>
								</h4>
								<div className="space-y-3">
									<div className="flex gap-2 items-center flex-wrap">
										<div className="btn btn-primary btn-sm">
											Primary
										</div>
										<div className="btn btn-secondary btn-sm">
											Secondary
										</div>
										<div className="btn btn-accent btn-sm">
											Accent
										</div>
									</div>
									<div className="flex gap-2 items-center">
										<div className="badge badge-primary">
											Badge
										</div>
										<div className="badge badge-secondary">
											Badge
										</div>
										<div className="badge badge-accent">
											Badge
										</div>
									</div>
								</div>
							</motion.div>
						</div>
					) : (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="text-center py-8"
						>
							<div className="max-w-sm mx-auto">
								<h3 className="text-lg font-semibold text-base-content mb-2">
									Extension Disabled
								</h3>
								<p className="text-base-content/60 text-sm">
									Toggle the switch above to enable Chromeleon
									and start customizing your browsing
									experience.
								</p>
							</div>
						</motion.div>
					)}
				</div>
			</motion.div>
		</div>
	);
};

// Initialize popup
const container = document.getElementById("root");
if (container) {
	const root = createRoot(container);
	root.render(<Popup />);
} else {
	console.error("Popup root container not found");
}
