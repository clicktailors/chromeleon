import type { UIAdapter } from '../provider';

// Minimal shadcn-like classes; in a real integration you'd map to shadcn components or classes.
export const shadcnAdapter: UIAdapter = {
	button: {
		base: 'inline-flex items-center justify-center rounded-md border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50',
		primary: 'bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2',
		secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2',
	},
	text: {
		base: 'text-foreground',
		muted: 'text-muted-foreground',
		heading: 'text-xl font-semibold text-foreground',
	},
	link: {
		base: 'text-primary underline-offset-4 hover:underline',
	},
	image: {
		base: 'rounded-md',
	},
	input: {
		base: 'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50',
	},
	select: {
		base: 'h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1',
	},
	textarea: {
		base: 'min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1',
	},
	table: {
		wrapper: 'w-full text-sm',
		th: 'text-left font-medium text-muted-foreground p-2 border-b',
		td: 'p-2 border-b',
	},
};


