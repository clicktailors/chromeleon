import React from 'react';
import { createRoot } from 'react-dom/client';
import { ensureOverlay } from './ui/overlay';
import './content';
import { ChromeleonApp } from './ui/app';

function mountApp() {
	const { mount } = ensureOverlay();
	if (!mount.hasChildNodes()) {
		const root = createRoot(mount);
		root.render(
			<React.StrictMode>
				<ChromeleonApp />
			</React.StrictMode>
		);
	}
}

if (document.body) {
	mountApp();
} else {
	document.addEventListener('DOMContentLoaded', mountApp, { once: true });
}



