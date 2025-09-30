import React from "react";
import { NavbarConfig, NavbarItem } from "../utils/navbarManager";

interface NavbarRendererProps {
	config: NavbarConfig;
}

export const NavbarRenderer: React.FC<NavbarRendererProps> = ({ config }) => {
	return (
		<nav className="navbar bg-base-200/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur border-b border-base-300 rounded-box rounded-b-none">
			{/* Brand section */}
			{config.brand && (
				<div className="flex-1 items-center gap-2 px-3 py-2">
					{config.brand.logo && (
						<img
							src={config.brand.logo}
							alt={config.brand.name || 'Logo'}
							className="w-6 h-6 rounded"
						/>
					)}
					{config.brand.name && (
						<span className="font-semibold text-base-content text-sm">
							{config.brand.name}
						</span>
					)}
				</div>
			)}

			{/* Navigation items */}
			<div className={getNavItemsClassName(config.type)}>
				{config.items.map((item, index) => (
					<NavItem key={index} item={item} type={config.type} />
				))}
			</div>
		</nav>
	);
};

interface NavItemProps {
	item: NavbarItem;
	type: 'horizontal' | 'vertical' | 'dropdown';
}

const NavItem: React.FC<NavItemProps> = ({ item, type }) => {
	const baseClasses = "text-base-content hover:text-primary transition-colors";
	const activeClasses = item.active ? "text-primary font-semibold" : "";

	if (type === 'dropdown' && item.children && item.children.length > 0) {
		return (
			<div className="dropdown dropdown-end">
				<label tabIndex={0} className={`btn btn-ghost ${baseClasses} ${activeClasses}`}>
					{item.label}
				</label>
				<ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
					{item.children.map((child, index) => (
						<li key={index}>
							<NavItem item={child} type="vertical" />
						</li>
					))}
				</ul>
			</div>
		);
	}

	if (item.href) {
		return (
			<a
				href={item.href}
				className={`${baseClasses} ${activeClasses} ${getNavItemSpecificClasses(type)}`}
			>
				{item.label}
			</a>
		);
	}

	return (
		<span className={`${baseClasses} ${activeClasses} ${getNavItemSpecificClasses(type)}`}>
			{item.label}
		</span>
	);
};

function getNavItemsClassName(type: 'horizontal' | 'vertical' | 'dropdown'): string {
	switch (type) {
		case 'horizontal':
			return 'flex items-center gap-4 px-3 py-2';
		case 'vertical':
			return 'flex flex-col gap-2 p-4';
		case 'dropdown':
			return 'flex items-center gap-4 px-3 py-2';
		default:
			return 'flex items-center gap-4 px-3 py-2';
	}
}

function getNavItemSpecificClasses(type: 'horizontal' | 'vertical' | 'dropdown'): string {
	switch (type) {
		case 'horizontal':
			return '';
		case 'vertical':
			return 'block px-4 py-2 rounded hover:bg-base-300';
		case 'dropdown':
			return 'block px-4 py-2 hover:bg-base-300';
		default:
			return '';
	}
}
