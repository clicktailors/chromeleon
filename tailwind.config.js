/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./src/**/*.{js,ts,jsx,tsx}",
		"./src/popup/**/*.{html,js,ts,jsx,tsx}",
		"./dev.html"
	],
	theme: {
		extend: {},
	},
	plugins: [
		require("daisyui")
	],
	daisyui: {
		themes: [
			"light",
			"dark",
			"cupcake",
			"bumblebee",
			"emerald",
			"corporate",
			"synthwave",
			"retro",
			"cyberpunk",
			"valentine",
			"halloween",
			"garden",
			"forest",
			"aqua",
			"lofi",
			"pastel",
			"fantasy",
			"wireframe",
			"black",
			"luxury",
			"dracula",
			"cmyk",
			"autumn",
			"business",
			"acid",
			"lemonade",
			"night",
			"coffee",
			"winter"
		],
	},
} 