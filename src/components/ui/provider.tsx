import React, { createContext, useContext } from 'react';

export interface UIAdapter {
	button: {
		base: string;
		primary: string;
		secondary: string;
	};
	text: {
		base: string;
		muted: string;
		heading: string;
	};
	link: {
		base: string;
	};
	image: {
		base: string;
	};
	input: {
		base: string;
	};
	select: {
		base: string;
	};
	textarea: {
		base: string;
	};
	table: {
		wrapper: string;
		th: string;
		td: string;
	};
}

const UIContext = createContext<UIAdapter | null>(null);

export const UIProvider: React.FC<{ adapter: UIAdapter; children: React.ReactNode }> = ({ adapter, children }) => (
	<UIContext.Provider value={adapter}>{children}</UIContext.Provider>
);

export function useUI(): UIAdapter {
	const ctx = useContext(UIContext);
	if (!ctx) {
		throw new Error('useUI must be used within a UIProvider');
	}
	return ctx;
}


