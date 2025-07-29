import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { motion } from "framer-motion";
import "./popup.css";

interface ThemeSettings {
	aggressiveMode: boolean;
	daisyTheme: string;
}

const Popup: React.FC = () => {
	const [isExtensionEnabled, setIsExtensionEnabled] = useState(true);
	const [settings, setSettings] = useState<ThemeSettings>({
		aggressiveMode: false,
		daisyTheme: "retro",
	});

	useEffect(() => {
		// Load saved settings and extension state
		loadSettings();
		loadExtensionState();
	}, []);

	// Apply theme to document when settings change
	useEffect(() => {
		console.log('Applying theme:', settings.daisyTheme);
		// Apply theme to document.documentElement, html element, and body
		document.documentElement.setAttribute('data-theme', settings.daisyTheme);
		document.querySelector('html')?.setAttribute('data-theme', settings.daisyTheme);
		document.body.setAttribute('data-theme', settings.daisyTheme);
	}, [settings.daisyTheme]);

	const loadExtensionState = async () => {
		try {
			const result = await chrome.storage.sync.get("extensionEnabled");
			setIsExtensionEnabled(result.extensionEnabled !== false); // Default to true
		} catch (error) {
			console.error("Failed to load extension state:", error);
		}
	};

	const toggleExtension = async () => {
		const newState = !isExtensionEnabled;
		setIsExtensionEnabled(newState);

		try {
			// Save the state
			await chrome.storage.sync.set({ extensionEnabled: newState });

			// Send message through background script
			await chrome.runtime.sendMessage({
				target: "content-script",
				data: {
					type: "TOGGLE_EXTENSION",
					enabled: newState,
				},
			});
		} catch (error) {
			console.error("Failed to toggle extension:", error);
			// Revert the state if there was an error
			setIsExtensionEnabled(!newState);
		}
	};

	const loadSettings = async () => {
		try {
			const result = await chrome.storage.sync.get("themeSettings");
			if (result.themeSettings) {
				setSettings(result.themeSettings);
			}
		} catch (error) {
			console.error("Failed to load settings:", error);
		}
	};

	const updateTheme = async (newSettings: Partial<ThemeSettings>) => {
		const updatedSettings = { ...settings, ...newSettings };
		const previousSettings = { ...settings };
		
		// Optimistically update the UI
		setSettings(updatedSettings);

		try {
			// Save the complete updated settings to storage
			await chrome.storage.sync.set({ themeSettings: updatedSettings });

			// Send the COMPLETE settings through background script
			await chrome.runtime.sendMessage({
				target: "content-script",
				data: {
					type: "UPDATE_THEME",
					settings: updatedSettings, // Send complete settings, not just partial
				},
			});
		} catch (error) {
			console.error("Failed to update theme:", error);
			// Revert the settings if there was an error
			setSettings(previousSettings);
		}
	};

	const daisyThemes = [
		{ name: "Dark", value: "dark" },
		{ name: "Light", value: "light" },
		{ name: "Cupcake", value: "cupcake" },
		{ name: "Bumblebee", value: "bumblebee" },
		{ name: "Emerald", value: "emerald" },
		{ name: "Corporate", value: "corporate" },
		{ name: "Synthwave", value: "synthwave" },
		{ name: "Retro", value: "retro" },
		{ name: "Cyberpunk", value: "cyberpunk" },
		{ name: "Valentine", value: "valentine" },
		{ name: "Halloween", value: "halloween" },
		{ name: "Garden", value: "garden" },
		{ name: "Forest", value: "forest" },
		{ name: "Aqua", value: "aqua" },
		{ name: "Lofi", value: "lofi" },
		{ name: "Pastel", value: "pastel" },
		{ name: "Fantasy", value: "fantasy" },
		{ name: "Wireframe", value: "wireframe" },
		{ name: "Black", value: "black" },
		{ name: "Luxury", value: "luxury" },
		{ name: "Dracula", value: "dracula" },
		{ name: "CMYK", value: "cmyk" },
		{ name: "Autumn", value: "autumn" },
		{ name: "Business", value: "business" },
		{ name: "Acid", value: "acid" },
		{ name: "Lemonade", value: "lemonade" },
		{ name: "Night", value: "night" },
		{ name: "Coffee", value: "coffee" },
		{ name: "Winter", value: "winter" },
	];

	return (
		<div 
			className="w-full h-full transition-colors duration-300" 
			data-theme={settings.daisyTheme}
			style={{
				backgroundColor: settings.daisyTheme === 'light' ? '#ffffff' : 
								settings.daisyTheme === 'garden' ? '#f0f9ff' :
								settings.daisyTheme === 'cyberpunk' ? '#1a1a1a' :
								'#1f2937',
				color: settings.daisyTheme === 'light' ? '#000000' : '#ffffff'
			}}
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
				style={{ backgroundColor: 'var(--b1)' }}
			>
				{/* Header */}
				<motion.div
					initial={{ y: -20 }}
					animate={{ y: 0 }}
					className="p-4 pb-4"
				>
					<div className="text-center">
						<h1 className="card-title text-2xl justify-center text-base-content">
							🦎 Chromeleon
						</h1>
						<p className="text-base-content/70 text-sm">Website Rethemer</p>
					</div>
				</motion.div>

				{/* Extension Toggle */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.05 }}
					className="px-6 pb-4"
				>
					<div className="form-control">
						<label className="label cursor-pointer">
							<span className="label-text font-medium">Enable Extension</span>
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
						<div className="space-y-6">
							{/* DaisyUI Theme Selection */}
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.1 }}
								className="form-control"
							>
								<h3 className="text-lg font-semibold mb-3 text-base-content flex items-center gap-2">
									🌼 DaisyUI Theme
								</h3>
								<div className="form-control">
									<label className="label">
										<span className="label-text">Choose Theme</span>
									</label>
									<select
										value={settings.daisyTheme}
										onChange={(e) => updateTheme({ daisyTheme: e.target.value })}
										className="select select-bordered w-full"
									>
										{daisyThemes.map((theme) => (
											<option key={theme.value} value={theme.value}>
												{theme.name}
											</option>
										))}
									</select>
								</div>
							</motion.div>

							{/* Aggressive Mode Toggle */}
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.2 }}
								className="form-control"
							>
								<h3 className="text-lg font-semibold mb-3 text-base-content flex items-center gap-2">
									⚡ Settings
								</h3>
								<div className="form-control">
									<label className="label cursor-pointer justify-start gap-3">
										<input
											type="checkbox"
											checked={settings.aggressiveMode}
											onChange={(e) => updateTheme({ aggressiveMode: e.target.checked })}
											className="checkbox checkbox-primary"
										/>
										<div className="flex flex-col">
											<span className="label-text font-medium">🔥 Aggressive Mode</span>
											<span className="label-text-alt text-base-content/60">
												Strips all existing styles and applies DaisyUI
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
									<span className="badge badge-primary badge-sm">{settings.daisyTheme}</span>
								</h4>
								<div className="space-y-3">
									<div className="flex gap-2 items-center flex-wrap">
										<div className="btn btn-primary btn-sm">Primary</div>
										<div className="btn btn-secondary btn-sm">Secondary</div>
										<div className="btn btn-accent btn-sm">Accent</div>
									</div>
									<div className="flex gap-2 items-center">
										<div className="badge badge-primary">Badge</div>
										<div className="badge badge-secondary">Badge</div>
										<div className="badge badge-accent">Badge</div>
									</div>
									<div className="divider my-2"></div>
									<div className="text-xs text-base-content/60">
										The entire popup updates in real-time as you change themes!
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
									Toggle the switch above to enable Chromeleon and start customizing your browsing experience.
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
const container = document.getElementById("popup-root");
if (container) {
	const root = createRoot(container);
	root.render(<Popup />);
}
