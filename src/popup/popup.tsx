import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { motion } from "framer-motion";
import "./popup.css";

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
	const [isSystemDark, setIsSystemDark] = useState<boolean>(
		window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false
	);

	const lightThemes = [
		{ name: "Cupcake", value: "cupcake" },
		{ name: "Bumblebee", value: "bumblebee" },
		{ name: "Emerald", value: "emerald" },
		{ name: "Corporate", value: "corporate" },
		{ name: "Retro", value: "retro" },
		{ name: "Cyberpunk", value: "cyberpunk" },
		{ name: "Valentine", value: "valentine" },
		{ name: "Halloween", value: "halloween" },
		{ name: "Garden", value: "garden" },
		{ name: "Forest", value: "forest" },
		{ name: "Lofi", value: "lofi" },
		{ name: "Pastel", value: "pastel" },
		{ name: "Fantasy", value: "fantasy" },
		{ name: "Wireframe", value: "wireframe" },
		{ name: "CMYK", value: "cmyk" },
		{ name: "Autumn", value: "autumn" },
		{ name: "Business", value: "business" },
		{ name: "Acid", value: "acid" },
		{ name: "Lemonade", value: "lemonade" },
		{ name: "Nord", value: "nord" },
		{ name: "Winter", value: "winter" },
	];

	const darkThemes = [
		{ name: "Dark", value: "dark" },
		{ name: "Synthwave", value: "synthwave" },
		{ name: "Black", value: "black" },
		{ name: "Luxury", value: "luxury" },
		{ name: "Dracula", value: "dracula" },
		{ name: "Night", value: "night" },
		{ name: "Coffee", value: "coffee" },
		{ name: "Dim", value: "dim" },
		{ name: "Sunset", value: "sunset" },
	];

	const lightSet = new Set(lightThemes.map((t) => t.value));
	const darkSet = new Set(darkThemes.map((t) => t.value));

	useEffect(() => {
		// Load saved settings and extension state
		loadSettings();
		loadExtensionState();
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
		try {
			const result = await chrome.storage.sync.get("extensionEnabled");
			setIsExtensionEnabled(result.extensionEnabled !== false); // Default to true
		} catch (error) {
			console.error("Failed to load extension state:", error);
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

		try {
			await chrome.storage.sync.set({ extensionEnabled: newState });
			await chrome.runtime.sendMessage({
				target: "content-script",
				data: {
					type: "TOGGLE_EXTENSION",
					enabled: newState,
				},
			});
		} catch (error) {
			console.error("Failed to toggle extension:", error);
			setIsExtensionEnabled(!newState);
		}
	};

	const loadSettings = async () => {
		try {
			const result = await chrome.storage.sync.get("themeSettings");
			if (result.themeSettings) {
				const st = result.themeSettings as any;
				if (st.daisyTheme) {
					setSettings(
						normalizeSettings({
							mode: "system",
							selectedLightTheme: st.daisyTheme,
							selectedDarkTheme: st.daisyTheme,
							showTestPane: st.showTestPane ?? true,
						})
					);
				} else {
					setSettings(normalizeSettings(st as ThemeSettings));
				}
			}
		} catch (error) {
			console.error("Failed to load settings:", error);
		}
	};

	const updateTheme = async (newSettings: Partial<ThemeSettings>) => {
		let updatedSettings = { ...settings, ...newSettings } as ThemeSettings;
		// If mode changed, ensure current mode selection is valid
		if (newSettings.mode) {
			updatedSettings = normalizeSettings(updatedSettings);
		}
		const previousSettings = { ...settings };
		setSettings(updatedSettings);

		try {
			await chrome.storage.sync.set({ themeSettings: updatedSettings });
			await chrome.runtime.sendMessage({
				target: "content-script",
				data: {
					type: "UPDATE_THEME",
					settings: updatedSettings,
				},
			});
		} catch (error) {
			console.error("Failed to update theme:", error);
			setSettings(previousSettings);
		}
	};

	const activeList =
		settings.mode === "dark" || (settings.mode === "system" && isSystemDark)
			? darkThemes
			: lightThemes;
	const currentSelection =
		settings.mode === "dark" || (settings.mode === "system" && isSystemDark)
			? settings.selectedDarkTheme
			: settings.selectedLightTheme;

	return (
		<div
			className="w-full h-full transition-colors duration-300 bg-base-300 border-2 border-gray-500/30 overflow-hidden"
			data-theme={effectiveTheme}
		>
			{/* Force all DaisyUI themes to be included in build */}
			<div className="hidden" data-theme="light"></div>
			<div className="hidden" data-theme="dark"></div>
			<div className="hidden" data-theme="cupcake"></div>
			<div className="hidden" data-theme="bumblebee"></div>
			<div className="hidden" data-theme="emerald"></div>
			<div className="hidden" data-theme="corporate"></div>
			<div className="hidden" data-theme="synthwave"></div>
			<div className="hidden" data-theme="retro"></div>
			<div className="hidden" data-theme="cyberpunk"></div>
			<div className="hidden" data-theme="valentine"></div>
			<div className="hidden" data-theme="halloween"></div>
			<div className="hidden" data-theme="garden"></div>
			<div className="hidden" data-theme="forest"></div>
			<div className="hidden" data-theme="aqua"></div>
			<div className="hidden" data-theme="lofi"></div>
			<div className="hidden" data-theme="pastel"></div>
			<div className="hidden" data-theme="fantasy"></div>
			<div className="hidden" data-theme="wireframe"></div>
			<div className="hidden" data-theme="black"></div>
			<div className="hidden" data-theme="luxury"></div>
			<div className="hidden" data-theme="dracula"></div>
			<div className="hidden" data-theme="cmyk"></div>
			<div className="hidden" data-theme="autumn"></div>
			<div className="hidden" data-theme="business"></div>
			<div className="hidden" data-theme="acid"></div>
			<div className="hidden" data-theme="lemonade"></div>
			<div className="hidden" data-theme="night"></div>
			<div className="hidden" data-theme="coffee"></div>
			<div className="hidden" data-theme="winter"></div>
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				className="w-full h-full"
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
}
