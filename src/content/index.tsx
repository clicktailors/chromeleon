import React from 'react';
import { createRoot } from 'react-dom/client';
import { ensureOverlay } from './ui/overlay';
import { getRoot, setRoot } from './utils/rootRegistry';
import './content';
import { ChromeleonApp } from './ui/app';

const mountApp = () => {
	const { mount } = ensureOverlay();
	let root = getRoot(mount);
	if (!root) {
		root = createRoot(mount);
		setRoot(mount, root);
	}
	root.render(
		<React.StrictMode>
			<ChromeleonApp />
		</React.StrictMode>
	);
};

if (document.body) {
	mountApp();
} else {
	document.addEventListener('DOMContentLoaded', mountApp, { once: true });
}

// Hot Module Replacement for content script entry
// if (typeof import.meta !== 'undefined' && import.meta.hot) {
// 	import.meta.hot.accept(() => {
// 		mountApp();
// 	});
// 	import.meta.hot.dispose(() => {
// 		const { mount } = ensureOverlay();
// 		const root = getRoot(mount);
// 		root?.unmount();
// 		clearRoot(mount);
// 	});
// }



