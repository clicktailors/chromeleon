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

	const adapter = adapterKey === 'daisy' ? daisyAdapter : shadcnAdapter;
	return (
		<UIProvider adapter={adapter}>
			<div className="p-2">
				<div className="mb-2 flex gap-2">
					<button className={adapter.button.primary} onClick={() => setAdapterKey('daisy')}>Daisy</button>
					<button className={adapter.button.secondary} onClick={() => setAdapterKey('shadcn')}>Shadcn</button>
				</div>
				<IRRenderer ir={ir} />
			</div>
		</UIProvider>
	);
};


