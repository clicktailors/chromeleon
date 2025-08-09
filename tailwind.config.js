import daisyui from "daisyui";

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
		daisyui({
			themes: "all",
			logs: true,
		})
	],
} 