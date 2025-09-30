import React from 'react';
import { detectSiteBrand } from '../utils/branding';

export const HeaderBar: React.FC = () => {
	const { logoUrl, siteName } = detectSiteBrand();
	return (
		<div className="w-full sticky top-0 z-[2147483647]">
			<div className="navbar bg-base-200/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur border-b border-base-300 rounded-box rounded-b-none">
				<div className="flex-1 items-center gap-2 px-3 py-2">
					{logoUrl ? (
						<img src={logoUrl} alt={siteName || 'Logo'} className="w-6 h-6 rounded" />
					) : (
						<div className="w-6 h-6 rounded bg-base-300" />
					)}
					<span className="font-semibold text-base-content text-sm">{siteName}</span>
				</div>
			</div>
		</div>
	);
};


