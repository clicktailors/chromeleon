import { injectThemeCSS } from './cssInjector';

/**
 * Apply aggressive theme that strips existing styles and rebuilds with DaisyUI
 */
export function applyAggressiveTheme(daisyTheme: string): void {
	console.log('🔥 Applying AGGRESSIVE theme');
	
	const cssContent = generateAggressiveCSS();
	
	injectThemeCSS(cssContent);
	
	// Add test component to verify DaisyUI theme switching
	addTestComponent(daisyTheme);
	
	console.log('Chromeleon aggressive theme applied with theme:', daisyTheme);
	console.log('DaisyUI CSS variables will handle all theming');
}

/**
 * Apply gentle theme that preserves existing styles and adds DaisyUI
 */
export function applyGentleTheme(daisyTheme: string): void {
	console.log('🌙 Applying GENTLE theme');
	
	const cssContent = generateGentleCSS();
	
	injectThemeCSS(cssContent);
	
	// Add test component to verify DaisyUI theme switching
	addTestComponent(daisyTheme);
	
	console.log('Chromeleon gentle theme applied with DaisyUI theme:', daisyTheme);
}

/**
 * Generate CSS content for aggressive theme - uses pure DaisyUI CSS variables
 */
function generateAggressiveCSS(): string {
	return `
		/* SELECTIVE RESET: Remove website styles but preserve layout and scrolling */
		
		/* Reset visual styling but preserve essential layout properties */
		* {
			/* Reset decorative styles but preserve layout */
			border: unset !important;
			border-radius: unset !important;
			box-shadow: unset !important;
			text-shadow: unset !important;
			outline: unset !important;
			box-sizing: border-box !important;
			
			/* Reset website colors and backgrounds to allow DaisyUI theming */
			background-color: unset !important;
			background-image: unset !important;
			
			/* DON'T reset: margin, padding, display, position, visibility, opacity, content */
		}

		/* Document structure with pure DaisyUI CSS variables */
		html {
			font-size: 16px !important;
			line-height: 1.5 !important;
		}

		body {
			font-family: ui-sans-serif, system-ui, -apple-system, sans-serif !important;
			font-size: 1rem !important;
			line-height: 1.6 !important;
			/* Preserve existing body padding/margin for layout */
			/* Pure DaisyUI CSS variables - no fallbacks needed */
			background-color: var(--color-base-100) !important;
			color: var(--color-base-content) !important;
			/* Ensure scrolling works */
			overflow-x: auto !important;
			overflow-y: auto !important;
		}

		/* Typography with DaisyUI theme colors */
		h1, h2, h3, h4, h5, h6 {
			font-weight: bold !important;
			margin-bottom: 0.5em !important;
			margin-top: 1em !important;
			color: var(--color-base-content) !important;
		}

		h1 { font-size: 2rem !important; }
		h2 { font-size: 1.75rem !important; }
		h3 { font-size: 1.5rem !important; }
		h4 { font-size: 1.25rem !important; }
		h5 { font-size: 1.125rem !important; }
		h6 { font-size: 1rem !important; }

		p {
			margin-bottom: 1em !important;
			line-height: 1.6 !important;
			color: var(--color-base-content) !important;
		}

		/* Lists with proper spacing */
		ul, ol {
			margin: 1em 0 !important;
			padding-left: 2em !important;
		}

		li {
			margin-bottom: 0.25em !important;
			color: var(--color-base-content) !important;
		}

		/* Preserve list styles */
		ul li { list-style-type: disc !important; }
		ol li { list-style-type: decimal !important; }

		/* Forms with DaisyUI theme colors */
		input, textarea, select, button {
			font-size: 1rem !important;
			padding: 0.5rem !important;
			margin: 0.25rem !important;
			border: 1px solid var(--color-base-300) !important;
			border-radius: 0.5rem !important;
			background-color: var(--color-base-100) !important;
			color: var(--color-base-content) !important;
		}

		button {
			cursor: pointer !important;
			background-color: var(--color-primary) !important;
			color: var(--color-primary-content) !important;
			border-color: var(--color-primary) !important;
		}

		button:hover {
			opacity: 0.8 !important;
		}

		/* Links with primary accent color */
		a {
			text-decoration: underline !important;
			cursor: pointer !important;
			color: var(--color-primary) !important;
		}

		a:hover {
			opacity: 0.8 !important;
		}

		/* Tables with DaisyUI theme colors */
		table {
			border-collapse: collapse !important;
			width: 100% !important;
			margin: 1em 0 !important;
			background-color: var(--color-base-100) !important;
		}

		th, td {
			padding: 0.5rem !important;
			text-align: left !important;
			border: 1px solid var(--color-base-300) !important;
			color: var(--color-base-content) !important;
		}

		th {
			font-weight: bold !important;
			background-color: var(--color-base-200) !important;
		}

		/* Media elements */
		img, video, audio, svg {
			max-width: 100% !important;
			height: auto !important;
		}

		/* Hide non-content elements */
		script, style, noscript, meta, link[rel="stylesheet"] {
			display: none !important;
		}

		/* Apply DaisyUI theme colors to all text elements */
		span, div, section, article, header, footer, main, nav, aside, 
		li, blockquote, pre, code, small, strong, em, i, b, u, mark {
			color: var(--color-base-content) !important;
		}

		/* Ensure content visibility */
		* {
			visibility: visible !important;
			opacity: 1 !important;
		}

		/* Ensure interactive elements work */
		button, a, input, select, textarea, [onclick], [role="button"] {
			pointer-events: auto !important;
		}

		/* Preserve scrolling behavior */
		html, body {
			overflow-x: auto !important;
			overflow-y: auto !important;
		}

		/* Ensure scrollable containers work */
		[style*="overflow"], [class*="scroll"], [class*="overflow"] {
			overflow: auto !important;
		}
	`;
}

/**
 * Generate CSS content for gentle theme
 */
function generateGentleCSS(): string {
	return `
		/* Gentle theming - preserve existing styles, just add DaisyUI */
		/* Apply basic DaisyUI theme colors to common elements */
		
		/* Apply DaisyUI theme colors to body and basic elements */
		body {
			background-color: var(--color-base-100) !important;
			color: var(--color-base-content) !important;
		}
		
		/* Style headings with theme colors */
		h1, h2, h3, h4, h5, h6 {
			color: var(--color-base-content) !important;
		}
		
		/* Style links with primary color */
		a {
			color: var(--color-primary) !important;
		}
		
		/* Style buttons with theme colors */
		button:not([class*="btn"]) {
			background-color: var(--color-primary) !important;
			color: var(--color-primary-content) !important;
			border: 1px solid var(--color-primary) !important;
		}
		
		/* Style form elements */
		input, textarea, select {
			background-color: var(--color-base-100) !important;
			color: var(--color-base-content) !important;
			border: 1px solid var(--color-base-300) !important;
		}
		
		/* Style paragraphs and text */
		p, span, div {
			color: var(--color-base-content) !important;
		}
	`;
}

/**
 * Add a test component to verify DaisyUI theme switching
 */
function addTestComponent(theme: string): void {
	// Remove existing test component
	const existingTest = document.getElementById('chromeleon-theme-test');
	if (existingTest) {
		existingTest.remove();
	}
	
	// Create test component with DaisyUI classes
	const testComponent = document.createElement('div');
	testComponent.id = 'chromeleon-theme-test';
	testComponent.setAttribute('data-theme', theme);
	testComponent.innerHTML = `
		<div class="card bg-base-100 shadow-xl p-4 m-4 max-w-sm" style="position: fixed; top: 10px; right: 10px; z-index: 10000;">
			<div class="card-body p-3">
				<h2 class="card-title text-sm">🦎 Chromeleon Test</h2>
				<p class="text-xs text-base-content/70">Theme: ${theme}</p>
				<div class="flex gap-2 mt-2">
					<button class="btn btn-primary btn-xs">Primary</button>
					<button class="btn btn-secondary btn-xs">Secondary</button>
				</div>
				<div class="badge badge-accent badge-sm mt-2">DaisyUI Working</div>
			</div>
		</div>
	`;
	
	// Add to page
	document.body.appendChild(testComponent);
	
	console.log('🎨 DaisyUI test component added with theme:', theme);
} 