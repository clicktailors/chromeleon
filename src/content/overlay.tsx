import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';

interface OverlayProps {
	onClose: () => void;
	onThemeUpdate: (settings: any) => void;
	currentSettings: any;
}

const Overlay: React.FC<OverlayProps> = ({ onClose, onThemeUpdate, currentSettings }) => {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		setIsVisible(true);
	}, []);

	const handleClose = () => {
		setIsVisible(false);
		setTimeout(onClose, 300);
	};

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="chromeleon-overlay"
					style={{
						position: 'fixed',
						top: 0,
						left: 0,
						width: '100vw',
						height: '100vh',
						background: 'rgba(0, 0, 0, 0.8)',
						zIndex: 999999,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						padding: '2rem'
					}}
				>
					<motion.div
						initial={{ scale: 0.8, y: 50 }}
						animate={{ scale: 1, y: 0 }}
						exit={{ scale: 0.8, y: 50 }}
						style={{
							background: currentSettings.backgroundColor || '#121212',
							color: currentSettings.textColor || '#e0e0e0',
							padding: '2rem',
							borderRadius: '12px',
							maxWidth: '500px',
							width: '100%',
							maxHeight: '80vh',
							overflow: 'auto'
						}}
					>
						<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
							<h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>Chromeleon Overlay</h2>
							<button
								onClick={handleClose}
								style={{
									background: 'none',
									border: 'none',
									color: 'inherit',
									fontSize: '1.5rem',
									cursor: 'pointer',
									padding: '0.5rem'
								}}
							>
								×
							</button>
						</div>

						<div style={{ marginBottom: '1rem' }}>
							<h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Quick Theme</h3>
							<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
								{['Dark', 'Light', 'Sepia', 'High Contrast'].map((theme) => (
									<motion.button
										key={theme}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										onClick={() => {
											const themes = {
												'Dark': { backgroundColor: '#121212', textColor: '#e0e0e0', accentColor: '#66ccff' },
												'Light': { backgroundColor: '#ffffff', textColor: '#1a1a1a', accentColor: '#2563eb' },
												'Sepia': { backgroundColor: '#f4ecd8', textColor: '#5c4b37', accentColor: '#8b4513' },
												'High Contrast': { backgroundColor: '#000000', textColor: '#ffffff', accentColor: '#ffff00' }
											};
											onThemeUpdate(themes[theme as keyof typeof themes]);
										}}
										style={{
											padding: '0.75rem',
											border: '1px solid currentColor',
											borderRadius: '6px',
											background: 'transparent',
											color: 'inherit',
											cursor: 'pointer'
										}}
									>
										{theme}
									</motion.button>
								))}
							</div>
						</div>

						<div style={{ marginBottom: '1rem' }}>
							<h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Reader Mode</h3>
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={() => {
									// Trigger reader mode
									chrome.runtime.sendMessage({ type: 'REPLACE_CONTENT' });
									handleClose();
								}}
								style={{
									width: '100%',
									padding: '0.75rem',
									background: currentSettings.accentColor || '#66ccff',
									color: '#000',
									border: 'none',
									borderRadius: '6px',
									fontWeight: 'bold',
									cursor: 'pointer'
								}}
							>
								Enter Reader Mode
							</motion.button>
						</div>

						<div>
							<h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>Advanced Controls</h3>
							<p style={{ margin: '0 0 1rem 0', opacity: 0.8, fontSize: '0.875rem' }}>
								Use the extension popup for detailed theme customization.
							</p>
							<motion.button
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								onClick={() => {
									// Open popup programmatically
									chrome.runtime.sendMessage({ type: 'OPEN_POPUP' });
									handleClose();
								}}
								style={{
									width: '100%',
									padding: '0.75rem',
									background: 'transparent',
									color: 'inherit',
									border: '1px solid currentColor',
									borderRadius: '6px',
									cursor: 'pointer'
								}}
							>
								Open Full Controls
							</motion.button>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

// Function to inject the overlay into the page
export const injectOverlay = (onClose: () => void, onThemeUpdate: (settings: any) => void, currentSettings: any) => {
	const overlayRoot = document.getElementById('retheme-root');
	if (overlayRoot) {
		const root = createRoot(overlayRoot);
		root.render(
			<Overlay
				onClose={() => {
					root.unmount();
					onClose();
				}}
				onThemeUpdate={onThemeUpdate}
				currentSettings={currentSettings}
			/>
		);
	}
};

export default Overlay; 