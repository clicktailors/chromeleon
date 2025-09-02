import { PageIR, IRNode } from './pageIR';

function extractText(el: Element): string {
	return (el.textContent || '').trim().replace(/\s+/g, ' ');
}

function scrapeNode(el: Element): IRNode[] {
	const nodes: IRNode[] = [];

	if (/^H[1-6]$/.test(el.tagName)) {
		const level = Number(el.tagName.substring(1)) as 1|2|3|4|5|6;
		nodes.push({ type: 'heading', level, text: extractText(el) });
		return nodes;
	}

	if (el.tagName === 'P') {
		nodes.push({ type: 'paragraph', text: extractText(el) });
		return nodes;
	}

	if (el.tagName === 'A') {
		const href = (el as HTMLAnchorElement).href;
		nodes.push({ type: 'link', href, text: extractText(el) });
		return nodes;
	}

	if (el.tagName === 'IMG') {
		const img = el as HTMLImageElement;
		nodes.push({ type: 'image', src: img.src, alt: img.alt });
		return nodes;
	}

	if (el.tagName === 'UL' || el.tagName === 'OL') {
		const ordered = el.tagName === 'OL';
		const items: IRNode[] = [];
		el.querySelectorAll(':scope > li').forEach((li) => {
			items.push(...scrapeNode(li));
		});
		nodes.push({ type: 'list', ordered, items });
		return nodes;
	}

	if (el.tagName === 'TABLE') {
		const headers: string[] = [];
		const headRow = el.querySelector('thead tr') || el.querySelector('tr');
		if (headRow) {
			headRow.querySelectorAll('th,td').forEach((th) => headers.push(extractText(th)));
		}
		const rows: string[][] = [];
		el.querySelectorAll('tbody tr').forEach((tr) => {
			const row: string[] = [];
			tr.querySelectorAll('td').forEach((td) => row.push(extractText(td)));
			if (row.length) rows.push(row);
		});
		nodes.push({ type: 'table', headers, rows });
		return nodes;
	}

	if (el.tagName === 'INPUT') {
		const typeAttr = (el as HTMLInputElement).type || 'text';
		const typeMap = ['text','email','password','number'] as const;
		const kind = (typeMap.includes(typeAttr as any) ? typeAttr : 'text') as 'text'|'email'|'password'|'number';
		nodes.push({ type: 'input', kind });
		return nodes;
	}

	if (el.tagName === 'SELECT') {
		const options: string[] = [];
		el.querySelectorAll('option').forEach((o) => options.push(extractText(o)));
		nodes.push({ type: 'select', options });
		return nodes;
	}

	if (el.tagName === 'TEXTAREA') {
		nodes.push({ type: 'textarea', text: extractText(el) });
		return nodes;
	}

	// Generic container becomes a section of its children
	const children: IRNode[] = [];
	el.childNodes.forEach((child) => {
		if (child.nodeType === Node.ELEMENT_NODE) {
			children.push(...scrapeNode(child as Element));
		}
	});
	if (children.length) {
		nodes.push({ type: 'section', children });
	}
	return nodes;
}

export function scrapePage(root: Document | Element = document): PageIR {
	const bodyEl = root instanceof Document ? root.body : (root as Element);
	const title = root instanceof Document ? (root as Document).title : undefined;
	const body: IRNode[] = [];
	bodyEl.childNodes.forEach((child) => {
		if (child.nodeType === Node.ELEMENT_NODE) {
			body.push(...scrapeNode(child as Element));
		}
	});
	return { title, body };
}


