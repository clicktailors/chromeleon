import type { UIAdapter } from '../provider';

export const daisyAdapter: UIAdapter = {
	button: {
		base: 'btn',
		primary: 'btn btn-primary',
		secondary: 'btn btn-secondary',
	},
	text: {
		base: 'text-base-content',
		muted: 'text-base-content/60',
		heading: 'text-xl font-semibold text-base-content',
	},
	link: {
		base: 'link link-primary',
	},
	image: {
		base: 'rounded-md',
	},
	input: {
		base: 'input input-bordered',
	},
	select: {
		base: 'select select-bordered',
	},
	textarea: {
		base: 'textarea textarea-bordered',
	},
	table: {
		wrapper: 'table w-full',
		th: 'bg-base-200 text-base-content font-semibold p-2',
		td: 'p-2',
	},
};


