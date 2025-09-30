import React from 'react';
import { ChromeleonApp } from './app';

export const OverlayApp: React.FC = () => {
	console.log('OverlayApp rendering');
	
	return (
		<div className="min-h-screen w-full bg-base-100">
			<ChromeleonApp />
		</div>
	);
};
