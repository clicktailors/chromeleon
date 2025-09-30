/**
 * Google Style Schema Generator
 * Automatically generates schemas for Google-style pages
 */

import { SchemaNode } from '../ui/SchemaRenderer';
import { generateNavbarSchema } from './navbarManager';

/**
 * Generate a Google-style schema from the current page
 */
export function generateGoogleStyleSchema(): SchemaNode {
	const navbarSchema = generateNavbarSchema();
	
	// Detect page title (usually the largest heading or page title)
	const pageTitle = detectPageTitle();
	
	// Detect search box
	const searchBox = detectSearchBox();
	
	// Detect footer links
	const footerLinks = detectFooterLinks();
	
	// Detect main content sections
	const contentSections = detectContentSections();

	const children: SchemaNode[] = [];

	// Add navbar if detected
	if (navbarSchema) {
		children.push(navbarSchema);
	}

	// Add hero section with page title
	if (pageTitle) {
		children.push({
			type: 'hero',
			title: pageTitle,
			subtitle: 'Search the world\'s information, including webpages, images, videos and more.',
			actions: [
				{ label: 'Google Search', variant: 'primary', href: '#search' },
				{ label: 'I\'m Feeling Lucky', variant: 'secondary', href: '#lucky' }
			]
		});
	}

	// Add search box if detected
	if (searchBox) {
		children.push({
			type: 'searchBox',
			placeholder: searchBox.placeholder || 'Search Google or type a URL',
			size: 'lg'
		});
	}

	// Add content sections
	contentSections.forEach(section => {
		children.push(section);
	});

	// Add footer links if detected
	if (footerLinks.length > 0) {
		children.push({
			type: 'section',
			title: 'Quick Links',
			children: [
				{
					type: 'linkRow',
					links: footerLinks
				}
			]
		});
	}

	return {
		type: 'page',
		children
	};
}

/**
 * Detect page title from various sources
 */
function detectPageTitle(): string | null {
	// Try document title first
	const docTitle = document.title;
	if (docTitle && !docTitle.includes('Google') && docTitle.length < 50) {
		return docTitle;
	}

	// Try largest heading
	const headings = document.querySelectorAll('h1, h2, h3');
	for (const heading of headings) {
		const text = heading.textContent?.trim();
		if (text && text.length < 50 && isVisible(heading)) {
			return text;
		}
	}

	// Try meta description
	const metaDesc = document.querySelector('meta[name="description"]')?.getAttribute('content');
	if (metaDesc && metaDesc.length < 50) {
		return metaDesc;
	}

	return null;
}

/**
 * Detect search box on the page
 */
function detectSearchBox(): { placeholder?: string } | null {
	const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="search" i], input[placeholder*="Search"]');
	
	for (const input of searchInputs) {
		if (isVisible(input)) {
			return {
				placeholder: (input as HTMLInputElement).placeholder
			};
		}
	}

	return null;
}

/**
 * Detect footer links (typically at bottom of page)
 */
function detectFooterLinks(): Array<{ label: string; href?: string; variant?: 'default' | 'primary' | 'secondary' }> {
	const links: Array<{ label: string; href?: string; variant?: 'default' | 'primary' | 'secondary' }> = [];
	
	// Look for links in footer area or bottom of page
	const footerElements = document.querySelectorAll('footer, .footer, [role="contentinfo"]');
	const allLinks = document.querySelectorAll('a');
	
	// Filter links that are likely footer links
	const footerLinks = Array.from(allLinks).filter(link => {
		const rect = link.getBoundingClientRect();
		const isInFooter = Array.from(footerElements).some(footer => footer.contains(link));
		const isAtBottom = rect.bottom > window.innerHeight - 200; // Within 200px of bottom
		const hasFooterText = link.textContent?.trim() && 
			['privacy', 'terms', 'about', 'help', 'contact', 'advertising', 'business'].some(text =>
				link.textContent?.toLowerCase().includes(text)
			);
		
		return isVisible(link) && (isInFooter || (isAtBottom && hasFooterText));
	});

	footerLinks.forEach(link => {
		const text = link.textContent?.trim();
		if (text && text.length < 30) {
			links.push({
				label: text,
				href: link.href,
				variant: 'default'
			});
		}
	});

	return links.slice(0, 10); // Limit to 10 footer links
}

/**
 * Detect main content sections
 */
function detectContentSections(): SchemaNode[] {
	const sections: SchemaNode[] = [];
	
	// Look for main content areas
	const mainElements = document.querySelectorAll('main, .main, .content, .container');
	
	for (const main of mainElements) {
		if (!isVisible(main)) continue;
		
		// Look for cards or content blocks
		const cards = main.querySelectorAll('.card, .post, .article, .item');
		if (cards.length > 0) {
			const cardNodes: SchemaNode[] = [];
			
			Array.from(cards).slice(0, 6).forEach(card => { // Limit to 6 cards
				const title = card.querySelector('h1, h2, h3, h4, .title, .heading')?.textContent?.trim();
				const body = card.querySelector('p, .description, .content')?.textContent?.trim();
				
				if (title || body) {
					cardNodes.push({
						type: 'card',
						title: title || undefined,
						body: body || undefined
					});
				}
			});
			
			if (cardNodes.length > 0) {
				sections.push({
					type: 'grid',
					columns: Math.min(3, cardNodes.length),
					children: cardNodes
				});
			}
		}
	}

	return sections;
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
