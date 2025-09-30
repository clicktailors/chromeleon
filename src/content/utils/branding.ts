export interface SiteBrand {
	logoUrl?: string;
	siteName?: string;
}

function toAbsoluteUrl(url: string | null | undefined): string | undefined {
	if (!url) return undefined;
	try {
		return new URL(url, location.href).href;
	} catch {
		return undefined;
	}
}

function parseSizeToken(token: string): number {
	// tokens like "16x16", "180x180", or "any"
	if (!token) return 0;
	if (token.toLowerCase() === 'any') return 1024; // treat as very high-res
	const m = token.match(/(\d+)x(\d+)/i);
	if (!m) return 0;
	const w = parseInt(m[1], 10) || 0;
	const h = parseInt(m[2], 10) || 0;
	return Math.max(w, h);
}

function extWeight(url: string): number {
	const lower = url.toLowerCase();
	if (lower.endsWith('.svg')) return 1000;
	if (lower.endsWith('.png')) return 500;
	if (lower.endsWith('.webp')) return 400;
	if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 300;
	if (lower.endsWith('.ico')) return 50;
	return 100;
}

function getFaviconCandidates(): string[] {
	// Collect with sizing and type information for better selection
	const candidates: { url: string; score: number }[] = [];
	document
		.querySelectorAll(
			'link[rel~="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"], link[rel="apple-touch-icon-precomposed"]'
		)
		.forEach((link) => {
			const el = link as HTMLLinkElement;
			const abs = toAbsoluteUrl(el.getAttribute('href'));
			if (!abs) return;
			const sizesAttr = (el.getAttribute('sizes') || '').trim();
			const sizes = sizesAttr.split(/\s+/).map(parseSizeToken);
			const maxSize = sizes.length ? Math.max(...sizes) : 0;
			const rel = (el.getAttribute('rel') || '').toLowerCase();
			const appleBoost = rel.includes('apple-touch') ? 200 : 0;
			const score = extWeight(abs) + appleBoost + maxSize;
			candidates.push({ url: abs, score });
		});

	// Common paths fallback
	const origin = location.origin;
	[`${origin}/apple-touch-icon.png`, `${origin}/favicon.png`, `${origin}/favicon.ico`].forEach((u) => {
		candidates.push({ url: u, score: extWeight(u) + (u.includes('apple-touch') ? 200 : 0) });
	});

	// Return unique by URL, sorted by score desc
	const seen = new Set<string>();
	return candidates
		.sort((a, b) => b.score - a.score)
		.map((c) => c.url)
		.filter((u) => (seen.has(u) ? false : (seen.add(u), true)));
}

export function detectSiteBrand(): SiteBrand {
	let siteName =
		document.querySelector('meta[property="og:site_name"]')?.getAttribute('content') ||
		document.querySelector('meta[name="application-name"]')?.getAttribute('content') ||
		document.title?.split('|')[0]?.trim() ||
		new URL(location.href).hostname.replace(/^www\./, '');

	let logoUrl: string | undefined;
	// 1) Try to find an in-DOM brand image (often higher-res than favicons)
	const safeSiteName = (siteName || '').toLowerCase();
	const domImg =
		(document.querySelector('header img[alt*="logo" i]') as HTMLImageElement | null) ||
		(document.querySelector('nav img[alt*="logo" i]') as HTMLImageElement | null) ||
		(Array.from(document.querySelectorAll('img[alt][src]')) as HTMLImageElement[])
			.find((img) => {
				const alt = (img.getAttribute('alt') || '').toLowerCase();
				return alt.includes('logo') || alt.includes('brand') || (!!safeSiteName && alt.includes(safeSiteName));
			});
	logoUrl = toAbsoluteUrl(domImg?.getAttribute('src'));

	// 2) Prefer og:image if it explicitly looks like a logo/icon and DOM logo not found
	if (!logoUrl) {
		const ogImage =
			document.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
			document.querySelector('meta[name="og:image"]')?.getAttribute('content');
		const absOg = toAbsoluteUrl(ogImage);
		if (absOg && /(logo|icon)/i.test(absOg)) {
			logoUrl = absOg;
		}
	}

	// 3) Use best-scored favicon/apple-touch icon as fallback
	if (!logoUrl) {
		const favs = getFaviconCandidates();
		logoUrl = favs[0];
	}

	return { logoUrl, siteName };
}
