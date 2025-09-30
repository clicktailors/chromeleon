/**
 * Navbar Manager - Handles detection and reconstruction of navigation elements
 */

export interface NavbarItem {
	label: string;
	href?: string;
	active?: boolean;
	children?: NavbarItem[];
}

export interface NavbarConfig {
	type: 'horizontal' | 'vertical' | 'dropdown';
	items: NavbarItem[];
	brand?: {
		logo?: string;
		name?: string;
	};
	sticky?: boolean;
	transparent?: boolean;
}

/**
 * Detect navigation elements on the current page
 */
export function detectNavbar(): NavbarConfig | null {
	const navElements = document.querySelectorAll('nav, .navbar, .navigation, [role="navigation"]');
	const headerElements = document.querySelectorAll('header, .header');

	// Try to find the main navigation element
	let mainNav: Element | null = null;

	// First priority: semantic nav elements
	for (const nav of navElements) {
		if (nav.closest('header') || nav.querySelector('a, button')) {
			mainNav = nav;
			break;
		}
	}

	// Second priority: header elements with links
	if (!mainNav) {
		for (const header of headerElements) {
			if (header.querySelector('a, button')) {
				mainNav = header;
				break;
			}
		}
	}

	// Third priority: Google-style top navigation (links in top area of page)
	if (!mainNav) {
		mainNav = detectGoogleStyleNavbar();
	}

	// Fourth priority: Any element with multiple navigation links in top area
	if (!mainNav) {
		mainNav = detectTopAreaNavbar();
	}

	if (!mainNav) {
		return null;
	}

	const items = extractNavbarItems(mainNav);
	const brand = extractBrandFromNavbar(mainNav);

	// Determine navbar type based on structure and classes
	let type: 'horizontal' | 'vertical' | 'dropdown' = 'horizontal';
	if (mainNav.classList.contains('dropdown') || mainNav.querySelector('.dropdown')) {
		type = 'dropdown';
	} else if (mainNav.classList.contains('vertical') || mainNav.classList.contains('sidebar')) {
		type = 'vertical';
	}

	const config: NavbarConfig = {
		type,
		items,
		brand
	};

	return config;
}

/**
 * Extract navigation items from a navbar element
 */
function extractNavbarItems(navElement: Element): NavbarItem[] {
	const items: NavbarItem[] = [];
	const links = navElement.querySelectorAll('a, button');

	links.forEach((link) => {
		if (link.textContent?.trim() && isVisible(link)) {
			const item: NavbarItem = {
				label: link.textContent.trim(),
				href: link.tagName === 'A' ? (link as HTMLAnchorElement).href : undefined,
				active: link.classList.contains('active') ||
						link.getAttribute('aria-current') === 'page' ||
						link.classList.contains('current')
			};

			// Check for nested navigation (dropdowns)
			const parent = link.closest('li, .nav-item');
			if (parent) {
				const subMenu = parent.querySelector('ul, .submenu, .dropdown-menu');
				if (subMenu) {
					item.children = extractNavbarItems(subMenu);
				}
			}

			items.push(item);
		}
	});

	return items;
}

/**
 * Extract brand information from navbar
 */
function extractBrandFromNavbar(navElement: Element) {
	const brandElement = navElement.querySelector('.brand, .logo, [class*="brand"], [class*="logo"]');
	if (!brandElement) return undefined;

	const logo = brandElement.querySelector('img')?.src;
	const name = brandElement.textContent?.trim() ||
				 brandElement.querySelector('a')?.textContent?.trim() ||
				 document.title.split('|')[0]?.trim();

	return {
		logo,
		name
	};
}

/**
 * Check if an element is visible
 */
function isVisible(element: Element): boolean {
	const style = getComputedStyle(element);
	return style.display !== 'none' &&
		   style.visibility !== 'hidden' &&
		   style.opacity !== '0' &&
		   element.getBoundingClientRect().width > 0 &&
		   element.getBoundingClientRect().height > 0;
}

/**
 * Reconstruct a navbar based on detected configuration
 */
export function reconstructNavbar(config: NavbarConfig): HTMLElement {
	const nav = document.createElement('nav');
	nav.className = 'navbar bg-base-200/80 backdrop-blur supports-[backdrop-filter]:backdrop-blur border-b border-base-300 rounded-box rounded-b-none';

	if (config.sticky) {
		nav.classList.add('sticky', 'top-0', 'z-[2147483647]');
	}

	if (config.transparent) {
		nav.classList.add('bg-transparent', 'border-transparent');
	}

	// Add brand section
	if (config.brand) {
		const brandDiv = document.createElement('div');
		brandDiv.className = 'flex-1 items-center gap-2 px-3 py-2';

		if (config.brand.logo) {
			const logoImg = document.createElement('img');
			logoImg.src = config.brand.logo;
			logoImg.alt = config.brand.name || 'Logo';
			logoImg.className = 'w-6 h-6 rounded';
			brandDiv.appendChild(logoImg);
		}

		if (config.brand.name) {
			const brandName = document.createElement('span');
			brandName.className = 'font-semibold text-base-content text-sm';
			brandName.textContent = config.brand.name;
			brandDiv.appendChild(brandName);
		}

		nav.appendChild(brandDiv);
	}

	// Add navigation items
	if (config.items.length > 0) {
		const navItems = document.createElement('div');
		navItems.className = getNavItemsClassName(config.type);

		config.items.forEach(item => {
			const itemElement = createNavItem(item, config.type);
			navItems.appendChild(itemElement);
		});

		nav.appendChild(navItems);
	}

	return nav;
}

/**
 * Get appropriate class names for navigation items based on type
 */
function getNavItemsClassName(type: 'horizontal' | 'vertical' | 'dropdown'): string {
	switch (type) {
		case 'horizontal':
			return 'flex items-center gap-4 px-3 py-2';
		case 'vertical':
			return 'flex flex-col gap-2 p-4';
		case 'dropdown':
			return 'dropdown dropdown-end';
		default:
			return 'flex items-center gap-4 px-3 py-2';
	}
}

/**
 * Create a navigation item element
 */
function createNavItem(item: NavbarItem, type: 'horizontal' | 'vertical' | 'dropdown'): HTMLElement {
	const itemElement = document.createElement('div');

	if (item.href) {
		const link = document.createElement('a');
		link.href = item.href;
		link.textContent = item.label;
		link.className = getNavLinkClassName(item.active, type);
		itemElement.appendChild(link);
	} else {
		const span = document.createElement('span');
		span.textContent = item.label;
		span.className = getNavLinkClassName(item.active, type);
		itemElement.appendChild(span);
	}

	// Add dropdown functionality if item has children
	if (item.children && item.children.length > 0) {
		const dropdown = document.createElement('ul');
		dropdown.className = 'dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow';

		item.children.forEach(child => {
			const childItem = createNavItem(child, 'vertical');
			const li = document.createElement('li');
			li.appendChild(childItem);
			dropdown.appendChild(li);
		});

		itemElement.appendChild(dropdown);
	}

	return itemElement;
}

/**
 * Get appropriate class names for navigation links
 */
function getNavLinkClassName(active: boolean = false, type: 'horizontal' | 'vertical' | 'dropdown'): string {
	const baseClasses = 'text-base-content hover:text-primary transition-colors';
	const activeClasses = active ? 'text-primary font-semibold' : '';

	switch (type) {
		case 'horizontal':
			return `${baseClasses} ${activeClasses}`.trim();
		case 'vertical':
			return `block px-4 py-2 rounded hover:bg-base-300 ${activeClasses}`.trim();
		case 'dropdown':
			return `block px-4 py-2 hover:bg-base-300 ${activeClasses}`.trim();
		default:
			return baseClasses;
	}
}

/**
 * Detect Google-style navbar (links in top-right area)
 */
function detectGoogleStyleNavbar(): Element | null {
	// Look for links in the top area of the page (typically top-right)
	const topArea = document.querySelector('body > div:first-child, body > header:first-child, body > nav:first-child');
	if (!topArea) return null;

	// Find links that are positioned in the top area
	const topLinks = Array.from(topArea.querySelectorAll('a')).filter(link => {
		const rect = link.getBoundingClientRect();
		const linkIsVisible = isVisible(link);
		const isInTopArea = rect.top < 100; // Within top 100px
		const hasNavText = link.textContent?.trim() && 
			['about', 'store', 'gmail', 'images', 'maps', 'youtube', 'news', 'search'].some(nav => 
				link.textContent?.toLowerCase().includes(nav)
			);
		
		return linkIsVisible && isInTopArea && hasNavText;
	});

	if (topLinks.length >= 2) {
		// Create a virtual container for these links
		const virtualNav = document.createElement('div');
		virtualNav.className = 'google-style-nav';
		topLinks.forEach(link => virtualNav.appendChild(link.cloneNode(true)));
		return virtualNav;
	}

	return null;
}

/**
 * Detect navbar in top area of page (fallback for various layouts)
 */
function detectTopAreaNavbar(): Element | null {
	// Look for multiple links in the top 200px of the page
	const allLinks = Array.from(document.querySelectorAll('a')).filter(link => {
		const rect = link.getBoundingClientRect();
		return isVisible(link) && rect.top < 200 && link.textContent?.trim();
	});

	// Group links by their vertical position
	const topLinks = allLinks.filter(link => {
		const rect = link.getBoundingClientRect();
		return rect.top < 100; // Top 100px
	});

	if (topLinks.length >= 3) {
		// Create a virtual container for these links
		const virtualNav = document.createElement('div');
		virtualNav.className = 'top-area-nav';
		topLinks.forEach(link => virtualNav.appendChild(link.cloneNode(true)));
		return virtualNav;
	}

	return null;
}

/**
 * Generate schema node for detected navbar
 */
export function generateNavbarSchema(): { type: 'navbar'; config: NavbarConfig } | null {
	const config = detectNavbar();
	return config ? { type: 'navbar', config } : null;
}
