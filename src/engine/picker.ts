// Lets the user point at an element: to mark the content area, or to hide
// something. The highlight lives in a closed shadow root so page CSS can't touch it.

export const PICKER_HOST_ID = 'chromeleon-picker';

export interface PickOptions {
	prompt: string;
	/** Called for each pick. Return true to keep picking. */
	onPick: (el: Element) => boolean | Promise<boolean>;
	onDone?: () => void;
}

export function startPicker({ prompt, onPick, onDone }: PickOptions): () => void {
	document.getElementById(PICKER_HOST_ID)?.remove();

	const host = document.createElement('div');
	host.id = PICKER_HOST_ID;
	const shadow = host.attachShadow({ mode: 'closed' });
	shadow.innerHTML = `
		<style>
			:host { all: initial; }
			.box { position: fixed; pointer-events: none; z-index: 2147483647; border: 2px solid #2f7bf5;
				background: rgba(47,123,245,.12); border-radius: 3px; transition: all 60ms ease-out; display: none; }
			.bar { position: fixed; left: 50%; top: 16px; transform: translateX(-50%); z-index: 2147483647;
				font: 13px/1.4 system-ui, sans-serif; color: #fff; background: #1d2330; padding: 8px 14px;
				border-radius: 999px; box-shadow: 0 6px 24px rgba(0,0,0,.25); pointer-events: none; white-space: nowrap; }
			.bar b { color: #9cc2ff; font-weight: 600; }
			.tag { position: fixed; z-index: 2147483647; pointer-events: none; font: 11px/1 ui-monospace, monospace;
				background: #2f7bf5; color: #fff; padding: 3px 5px; border-radius: 3px; display: none; }
		</style>
		<div class="box"></div><div class="tag"></div>
		<div class="bar">${prompt} · <b>↑</b> parent · <b>↓</b> child · <b>Esc</b> done</div>`;
	document.documentElement.appendChild(host);

	const box = shadow.querySelector<HTMLElement>('.box')!;
	const tag = shadow.querySelector<HTMLElement>('.tag')!;
	let current: Element | null = null;
	const trail: Element[] = [];

	const draw = (el: Element | null) => {
		current = el;
		if (!el) {
			box.style.display = tag.style.display = 'none';
			return;
		}
		const r = el.getBoundingClientRect();
		Object.assign(box.style, { display: 'block', left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px` });
		tag.textContent = describe(el);
		Object.assign(tag.style, { display: 'block', left: `${Math.max(0, r.left)}px`, top: `${Math.max(0, r.top - 18)}px` });
	};

	const onMove = (e: MouseEvent) => {
		const el = document.elementFromPoint(e.clientX, e.clientY);
		if (!el || el === host) return;
		trail.length = 0;
		draw(el);
	};

	const swallow = (e: Event) => {
		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
	};

	const onClick = async (e: MouseEvent) => {
		swallow(e);
		if (!current) return;
		const keepGoing = await onPick(current);
		if (!keepGoing) stop();
		else draw(null);
	};

	const onKey = (e: KeyboardEvent) => {
		if (e.key === 'Escape') {
			swallow(e);
			stop();
		} else if (e.key === 'ArrowUp' && current?.parentElement && current.parentElement !== document.documentElement) {
			swallow(e);
			trail.push(current);
			draw(current.parentElement);
		} else if (e.key === 'ArrowDown' && trail.length) {
			swallow(e);
			draw(trail.pop()!);
		} else if (e.key === 'Enter' && current) {
			void onClick(e as unknown as MouseEvent);
		}
	};

	const opts = { capture: true };
	window.addEventListener('mousemove', onMove, opts);
	window.addEventListener('click', onClick, opts);
	for (const type of ['mousedown', 'mouseup', 'pointerdown', 'pointerup'] as const) window.addEventListener(type, swallow, opts);
	window.addEventListener('keydown', onKey, opts);

	let stopped = false;
	function stop() {
		if (stopped) return;
		stopped = true;
		window.removeEventListener('mousemove', onMove, opts);
		window.removeEventListener('click', onClick, opts);
		for (const type of ['mousedown', 'mouseup', 'pointerdown', 'pointerup'] as const) window.removeEventListener(type, swallow, opts);
		window.removeEventListener('keydown', onKey, opts);
		host.remove();
		onDone?.();
	}
	return stop;
}

function describe(el: Element): string {
	let s = el.localName;
	if (el.id) s += `#${el.id}`;
	const cls = [...el.classList].slice(0, 2);
	if (cls.length) s += `.${cls.join('.')}`;
	return s.length > 60 ? `${s.slice(0, 57)}…` : s;
}

// Hash-like class names from CSS-in-JS and CSS modules change between deploys.
const UNSTABLE_CLASS = /\d{3,}|^css-|^sc-|^jsx-|^emotion-|__[A-Za-z0-9_-]{5,}$|^_[A-Za-z0-9]{5,}$|^[a-z]{1,3}[A-Z0-9][A-Za-z0-9]{4,}$/;
const UNSTABLE_ID = /\d{4,}|^:r|^ember\d|^react-|^radix-|^headlessui-/;

/** A selector that matches `el` uniquely now and has a fair chance of surviving a reload. */
export function selectorFor(el: Element): string {
	const parts: string[] = [];
	let node: Element | null = el;
	while (node && node !== document.documentElement) {
		if (node.id && !UNSTABLE_ID.test(node.id) && document.querySelectorAll(`#${CSS.escape(node.id)}`).length === 1) {
			parts.unshift(`#${CSS.escape(node.id)}`);
			break;
		}
		let part = node.localName;
		const classes = [...node.classList].filter((c) => !UNSTABLE_CLASS.test(c) && c.length < 40).slice(0, 2);
		part += classes.map((c) => `.${CSS.escape(c)}`).join('');
		const parent: Element | null = node.parentElement;
		if (parent) {
			const sameTag = [...parent.children].filter((c) => c.localName === node!.localName);
			const sameMatch = [...parent.children].filter((c) => c.matches(part));
			if (sameMatch.length > 1) part += `:nth-of-type(${sameTag.indexOf(node) + 1})`;
		}
		parts.unshift(part);
		const sel = parts.join(' > ');
		if (document.querySelectorAll(sel).length === 1) return sel;
		node = parent;
	}
	return parts.join(' > ');
}
