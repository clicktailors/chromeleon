// Finds the main readable content in the *live* DOM. Scoring is adapted from
// Mozilla Readability, but nothing is cloned: we return real elements so the
// page's own scripts keep working on them.

export interface Detection {
	root: Element;
	/** Title block and lead image that sit outside the root but belong with it. */
	extras: Element[];
	textLength: number;
	linkDensity: number;
	paragraphs: number;
	source: 'rule' | 'score';
}

const POSITIVE = /article|body|content|entry|hentry|h-entry|main|page|post|text|blog|story|prose|markdown|reader/i;
const NEGATIVE = /(^|[\s_-])(ad|ads|adv|banner|breadcrumbs?|combx|comments?|com-|contact|cookie|footer|footnote|gdpr|masthead|media-share|menu|meta|modal|nav|navbar|newsletter|outbrain|popup|promo|related|share|sharing|shopping|sidebar|skyscraper|social|sponsor(ed)?|subscribe|taboola|tags|toolbar|widget)([\s_-]|$)/i;

const PARAGRAPH_SELECTOR = 'p, pre, blockquote, div, section, td';
const MIN_PARAGRAPH = 25;

function classWeight(el: Element): number {
	let weight = 0;
	const cls = typeof el.className === 'string' ? el.className : '';
	for (const s of [cls, el.id]) {
		if (!s) continue;
		if (NEGATIVE.test(s)) weight -= 25;
		if (POSITIVE.test(s)) weight += 25;
	}
	return weight;
}

function tagWeight(el: Element): number {
	switch (el.tagName) {
		case 'ARTICLE':
		case 'MAIN':
			return 15;
		case 'DIV':
		case 'SECTION':
			return 5;
		case 'PRE':
		case 'TD':
		case 'BLOCKQUOTE':
			return 3;
		case 'OL':
		case 'UL':
		case 'DL':
		case 'LI':
		case 'FORM':
			return -3;
		case 'NAV':
		case 'ASIDE':
		case 'FOOTER':
			return -25;
		default:
			return /^H\d$/.test(el.tagName) ? -5 : 0;
	}
}

function textOf(el: Element): string {
	return (el.textContent || '').replace(/\s+/g, ' ').trim();
}

/** Text directly inside `el`, ignoring text inside child blocks. */
function ownText(el: Element): string {
	let s = '';
	for (const n of el.childNodes) {
		if (n.nodeType === Node.TEXT_NODE) s += n.textContent;
		else if (n instanceof HTMLElement && isInline(n)) s += n.textContent;
	}
	return s.replace(/\s+/g, ' ').trim();
}

const INLINE = new Set(['A', 'ABBR', 'B', 'BR', 'CITE', 'CODE', 'EM', 'FONT', 'I', 'KBD', 'MARK', 'Q', 'S', 'SMALL', 'SPAN', 'STRONG', 'SUB', 'SUP', 'TIME', 'U']);
const isInline = (el: Element) => INLINE.has(el.tagName);

export function linkDensity(el: Element, text = textOf(el)): number {
	if (!text.length) return 0;
	let linkLen = 0;
	for (const a of el.querySelectorAll('a')) linkLen += textOf(a).length;
	return Math.min(1, linkLen / text.length);
}

function isVisible(el: Element): boolean {
	// checkVisibility exists in Chrome 105+; fall back to layout boxes.
	const fn = (el as HTMLElement).checkVisibility;
	if (typeof fn === 'function') return fn.call(el, { checkVisibilityCSS: true } as never);
	return (el as HTMLElement).getClientRects().length > 0;
}

function isParagraphLike(el: Element): boolean {
	if (el.tagName === 'P' || el.tagName === 'PRE' || el.tagName === 'BLOCKQUOTE') return true;
	// Many sites use bare divs for paragraphs. Count them only by their own text.
	return ownText(el).length >= 80;
}

function ancestorsOf(el: Element, max: number): Element[] {
	const out: Element[] = [];
	let p = el.parentElement;
	while (p && out.length < max && p !== document.documentElement) {
		out.push(p);
		p = p.parentElement;
	}
	return out;
}

function commonAncestor(a: Element, b: Element): Element | null {
	const seen = new Set<Element>();
	for (let n: Element | null = a; n; n = n.parentElement) seen.add(n);
	for (let n: Element | null = b; n; n = n.parentElement) if (seen.has(n)) return n;
	return null;
}

/** Score the page and return the best content root, or null if nothing reads like an article. */
export function scoreContent(doc: Document = document): Detection | null {
	const body = doc.body;
	if (!body) return null;

	const scores = new Map<Element, number>();
	const found: { el: Element; count: number }[] = [];

	for (const el of body.querySelectorAll(PARAGRAPH_SELECTOR)) {
		if (!isParagraphLike(el)) continue;
		if (el.closest('nav, footer, aside, [role="navigation"], [role="complementary"], [aria-hidden="true"]')) continue;
		const isBlock = el.tagName === 'DIV' || el.tagName === 'SECTION' || el.tagName === 'TD';
		const text = isBlock ? ownText(el) : textOf(el);
		if (text.length < MIN_PARAGRAPH) continue;
		found.push({ el, count: text.length >= 80 ? brParagraphs(el) : 0 });

		const contribution = 1 + (text.split(/[,，、]/).length - 1) + Math.min(Math.floor(text.length / 100), 3);
		// A bare text block (old table layouts, <br><br> paragraphs) is itself a
		// container worth scoring, not just its parent.
		const ancestors = isBlock ? [el, ...ancestorsOf(el, 4)] : ancestorsOf(el, 5);
		ancestors.forEach((anc, level) => {
			if (!scores.has(anc)) scores.set(anc, tagWeight(anc) + classWeight(anc));
			const divider = level === 0 ? 1 : level === 1 ? 2 : level * 3;
			scores.set(anc, scores.get(anc)! + contribution / divider);
		});
	}

	if (!scores.size) return null;

	const ranked = [...scores.entries()]
		.map(([el, score]) => ({ el, score: score * (1 - linkDensity(el)) }))
		.filter(({ el }) => el !== body && isVisible(el))
		.sort((a, b) => b.score - a.score);

	if (!ranked.length) return null;
	let root = ranked[0].el;

	// If content is split across several strong siblings (e.g. one div per
	// section), climb to the ancestor that holds most of them.
	const top = ranked[0].score;
	const strong = ranked.slice(1, 6).filter((c) => c.score >= top * 0.75 && !root.contains(c.el) && !c.el.contains(root));
	if (strong.length >= 2) {
		let lca: Element | null = root;
		for (const c of strong) lca = lca && commonAncestor(lca, c.el);
		if (lca && lca !== body && lca !== doc.documentElement) root = lca;
	}

	// An <article> or <main> wrapping the winner is nearly always the better boundary.
	const semantic = root.parentElement?.closest('article, [itemprop="articleBody"]');
	if (semantic && semantic !== body && textOf(semantic).length < textOf(root).length * 1.5) root = semantic;

	const text = textOf(root);
	const extras = findExtras(root, doc);
	return {
		root,
		extras,
		textLength: text.length,
		linkDensity: linkDensity(root, text),
		paragraphs: found.reduce((n, f) => (root.contains(f.el) ? n + f.count : n), 0),
		source: 'score',
	};
}

/** Paragraphs in a block, counting each `<br><br>` break as a new one. */
function brParagraphs(el: Element): number {
	let n = 1;
	for (const br of el.querySelectorAll('br')) {
		let next = br.nextSibling;
		while (next && next.nodeType === Node.TEXT_NODE && !next.textContent!.trim()) next = next.nextSibling;
		if (next instanceof HTMLBRElement) n++;
	}
	return n;
}

/** Does the detection look like something worth turning into reader mode? */
export function isReadable(d: Detection): boolean {
	return d.textLength >= 500 && d.linkDensity < 0.5 && d.paragraphs >= 3;
}

/**
 * The article title (and its byline/dek) often lives in a header that is a
 * sibling of the body text, along with a lead image. Find those so they stay visible.
 */
function findExtras(root: Element, doc: Document): Element[] {
	const extras: Element[] = [];
	const title = findTitle(root, doc);
	if (title && !root.contains(title)) {
		// Keep the small block around the heading so the dek and byline come too.
		let block: Element = title;
		const parent = title.parentElement;
		if (parent && !parent.contains(root) && parent !== doc.body) {
			const t = textOf(parent);
			if (t.length < 600 && linkDensity(parent, t) < 0.5) block = parent;
		}
		extras.push(block);

		const lead = findLeadImage(block, root);
		if (lead) extras.push(lead);
	}
	return extras;
}

function findTitle(root: Element, doc: Document): Element | null {
	const docTitle = doc.title.toLowerCase();
	const headings = [...doc.querySelectorAll('h1')].filter(isVisible);
	if (!headings.length) return null;
	// Prefer an h1 inside the root, then the one that matches <title>, then the first.
	const inside = headings.find((h) => root.contains(h));
	if (inside) return inside;
	const matching = headings.find((h) => {
		const t = textOf(h).toLowerCase();
		return t.length > 3 && docTitle.includes(t.slice(0, 40));
	});
	const h = matching ?? headings[0];
	// Only accept a heading reasonably close to the root, not one in the site masthead.
	const lca = commonAncestor(h, root);
	if (!lca || lca === doc.documentElement) return null;
	if (lca === doc.body && !matching) return null;
	return h;
}

function findLeadImage(titleBlock: Element, root: Element): Element | null {
	let best: HTMLImageElement | null = null;
	let bestArea = 0;
	for (const img of document.querySelectorAll('img')) {
		if (root.contains(img) || titleBlock.contains(img)) continue;
		// Lead images sit between the title and the body text.
		const afterTitle = titleBlock.compareDocumentPosition(img) & Node.DOCUMENT_POSITION_FOLLOWING;
		const beforeRoot = root.compareDocumentPosition(img) & Node.DOCUMENT_POSITION_PRECEDING;
		if (!afterTitle || !beforeRoot) continue;
		const r = img.getBoundingClientRect();
		const area = r.width * r.height;
		if (r.width >= 300 && area > bestArea) {
			best = img;
			bestArea = area;
		}
	}
	return best ? best.closest('figure, picture') ?? best : null;
}

/** Junk inside the content root that reader views normally drop. */
const JUNK_SELECTOR = [
	'nav',
	'[role="navigation"]',
	'ins.adsbygoogle',
	'iframe[src*="doubleclick"]',
	'iframe[src*="googlesyndication"]',
	'[id^="google_ads"]',
	'[data-ad]',
	'[data-ad-slot]',
].join(',');

export function findJunk(root: Element): Element[] {
	const rootLen = textOf(root).length || 1;
	const junk = new Set<Element>(root.querySelectorAll(JUNK_SELECTOR));
	for (const el of root.querySelectorAll('div, section, aside, ul, form, footer, header')) {
		if (junk.has(el)) continue;
		const sig = `${typeof el.className === 'string' ? el.className : ''} ${el.id}`;
		const negative = NEGATIVE.test(sig) && !POSITIVE.test(el.id);
		const isAside = el.tagName === 'ASIDE';
		if (!negative && !isAside) continue;
		const t = textOf(el);
		// Never drop something that holds a big share of the article.
		if (t.length > rootLen * 0.3) continue;
		if (el.querySelector('h1')) continue;
		const ld = linkDensity(el, t);
		if (isAside ? ld > 0.5 : ld > 0.35 || t.length < 200) junk.add(el);
	}
	// Drop nested duplicates so we only mark outermost junk.
	return [...junk].filter((el) => ![...junk].some((o) => o !== el && o.contains(el)));
}
