import type { Root } from 'react-dom/client';

const roots = new WeakMap<HTMLElement, Root>();

export const getRoot = (node: HTMLElement): Root | undefined => roots.get(node);

export const setRoot = (node: HTMLElement, root: Root): void => {
	roots.set(node, root);
};

export const clearRoot = (node: HTMLElement): void => {
	roots.delete(node);
};

