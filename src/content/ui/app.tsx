import React, { useEffect, useState } from 'react';
import { UIProvider } from '../../components/ui/provider';
import { daisyAdapter } from '../../components/ui/adapters/daisy';
import { shadcnAdapter } from '../../components/ui/adapters/shadcn';
import { scrapePage } from './scraper';
import { IRRenderer } from './renderer';
import type { PageIR } from './pageIR';

export const ChromeleonApp: React.FC = () => {
	const [ir, setIr] = useState<PageIR>(() => scrapePage());
	const [adapterKey, setAdapterKey] = useState<'daisy' | 'shadcn'>('daisy');

	useEffect(() => {
		const observer = new MutationObserver(() => {
			setIr(scrapePage());
		});
		observer.observe(document.body, { childList: true, subtree: true, characterData: true });
		return () => observer.disconnect();
	}, []);

	// Load adapter from storage and react to changes made from the popup
	useEffect(() => {
		let isMounted = true;
		chrome.storage.sync.get('uiAdapter').then((res) => {
			const key = (res?.uiAdapter === 'shadcn' ? 'shadcn' : 'daisy') as 'daisy' | 'shadcn';
			if (isMounted) setAdapterKey(key);
		}).catch(() => {});

		const handleChange: Parameters<typeof chrome.storage.onChanged.addListener>[0] = (changes, areaName) => {
			if (areaName !== 'sync') return;
			if (changes.uiAdapter) {
				const next = changes.uiAdapter.newValue === 'shadcn' ? 'shadcn' : 'daisy';
				setAdapterKey(next);
			}
		};
		chrome.storage.onChanged.addListener(handleChange);
		return () => {
			isMounted = false;
			chrome.storage.onChanged.removeListener(handleChange);
		};
	}, []);

	const adapter = adapterKey === 'daisy' ? daisyAdapter : shadcnAdapter;
	return (
		<UIProvider adapter={adapter}>
			<div className="p-2">
				<IRRenderer ir={ir} />
			</div>
		</UIProvider>
	);
};


