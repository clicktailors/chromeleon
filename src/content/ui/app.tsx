import React, { useEffect, useState } from 'react';
import { UIProvider } from '../../components/ui/provider';
import { daisyAdapter } from '../../components/ui/adapters/daisy';
import { shadcnAdapter } from '../../components/ui/adapters/shadcn';
import { scrapePage } from './scraper';
import { IRRenderer } from './renderer';
import type { PageIR } from './pageIR';
import { HeaderBar } from './HeaderBar';
import { SchemaRenderer, SchemaNode } from './SchemaRenderer';
import demoSchema from '@/demo/demoSchema.json';
import { chromeStorage } from '@/utils/chromeApi';
import { generateGoogleStyleSchema } from '../utils/googleStyleGenerator';

export const ChromeleonApp: React.FC = () => {
	const [ir, setIr] = useState<PageIR>(() => scrapePage());
	const [useDemoSchema, setUseDemoSchema] = useState<boolean>(false);
	const [schema, setSchema] = useState<SchemaNode>(demoSchema as unknown as SchemaNode);
	const [adapterKey, setAdapterKey] = useState<'daisy' | 'shadcn'>('daisy');

	useEffect(() => {
		const observer = new MutationObserver(() => {
			setIr(scrapePage());
			
			// Auto-generate Google-style schema for Google pages
			if (isGoogleStylePage()) {
				const googleSchema = generateGoogleStyleSchema();
				setSchema(googleSchema);
			}
		});
		observer.observe(document.body, { childList: true, subtree: true, characterData: true });
		return () => observer.disconnect();
	}, []);

	// Initial schema generation for Google-style pages
	useEffect(() => {
		if (isGoogleStylePage()) {
			const googleSchema = generateGoogleStyleSchema();
			setSchema(googleSchema);
		}
	}, []);

	// Load and listen for dev schema toggle
	useEffect(() => {
		let mounted = true;
		chromeStorage?.sync?.get?.(['useDemoSchema']).then((res: any) => {
			if (!mounted) return;
			setUseDemoSchema(Boolean(res.useDemoSchema));
		}).catch(() => {});
		const onChanged = (changes: any, area: string) => {
			if (area !== 'sync') return;
			if (changes.useDemoSchema) setUseDemoSchema(Boolean(changes.useDemoSchema.newValue));
		};
		chromeStorage?.onChanged?.addListener?.(onChanged);
		return () => {
			mounted = false;
			chromeStorage?.onChanged?.removeListener?.(onChanged);
		};
	}, []);

	// Load adapter from storage and react to changes made from the popup
	useEffect(() => {
		let isMounted = true;
		chromeStorage?.sync?.get?.('uiAdapter').then((res: any) => {
			const key = (res?.uiAdapter === 'shadcn' ? 'shadcn' : 'daisy') as 'daisy' | 'shadcn';
			if (isMounted) setAdapterKey(key);
		}).catch(() => {});

		const handleChange = (changes: any, areaName: string) => {
			if (areaName !== 'sync') return;
			if (changes.uiAdapter) {
				const next = changes.uiAdapter.newValue === 'shadcn' ? 'shadcn' : 'daisy';
				setAdapterKey(next);
			}
		};
		chromeStorage?.onChanged?.addListener?.(handleChange);
		return () => {
			isMounted = false;
			chromeStorage?.onChanged?.removeListener?.(handleChange);
		};
	}, []);

	const adapter = adapterKey === 'daisy' ? daisyAdapter : shadcnAdapter;
	
	return (
		<UIProvider adapter={adapter}>
			<div className="min-h-screen bg-base-100">
				<HeaderBar />
				<div className="p-4">
					{useDemoSchema ? (
						<SchemaRenderer schema={schema} />
					) : (
						<IRRenderer ir={ir} />
					)}
				</div>
			</div>
		</UIProvider>
	);
};

/**
 * Detect if the current page is Google-style (minimal, search-focused)
 */
function isGoogleStylePage(): boolean {
	const url = window.location.hostname.toLowerCase();
	
	// Check for Google domains
	if (url.includes('google.com') || url.includes('google.')) {
		return true;
	}
	
	// Check for Google-style characteristics
	const hasGoogleNavbar = document.querySelectorAll('a').length >= 3 && 
		Array.from(document.querySelectorAll('a')).some(link => 
			['about', 'store', 'gmail', 'images'].some(nav => 
				link.textContent?.toLowerCase().includes(nav)
			)
		);
	
	const hasSearchBox = document.querySelector('input[type="search"], input[placeholder*="search" i]') !== null;
	const hasMinimalContent = document.querySelectorAll('h1, h2, h3').length <= 3;
	
	return hasGoogleNavbar && hasSearchBox && hasMinimalContent;
}


