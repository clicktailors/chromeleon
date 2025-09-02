import React from 'react';

type Props = {
	children: React.ReactNode;
	onClick?: () => void;
};

export const BaseButton: React.FC<Props> = ({ children, onClick }) => (
	<button
		className="rounded-xl px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
		onClick={onClick}
	>
		{children}
	</button>
);



