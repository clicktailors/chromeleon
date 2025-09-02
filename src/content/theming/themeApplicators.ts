// No CSS injection for page overrides; only optional test component remains

/**
 * Apply gentle theme that preserves existing styles and adds DaisyUI
 */
export function applyGentleTheme(daisyTheme: string, showTestPane: boolean): void {
	console.log('🌙 Applying theme with minimal overrides');
	
	// Add test component to verify DaisyUI theme switching
	if (showTestPane) {
		addTestComponent(daisyTheme);
	}

	// Minimal override using DaisyUI v5 variables
	const minimal = `
		body { background-color: var(--b1) !important; color: var(--bc) !important; }
		a { color: var(--p) !important; }
	`;
	try {
		const styleId = 'chromeleon-theme';
		const existing = document.getElementById(styleId);
		if (existing) existing.remove();
		const style = document.createElement('style');
		style.id = styleId;
		style.textContent = minimal;
		document.head?.appendChild(style);
	} catch {}

	console.log('Chromeleon theme applied with DaisyUI theme:', daisyTheme);
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
				<h2 class="card-title text-sm">Chromeleon Test</h2>
				<p class="text-xs text-base-content/70">Theme: ${theme}</p>
				<div class="flex gap-2 mt-2">
					<button class="btn btn-primary btn-xs">Primary</button>
					<button class="btn btn-secondary btn-xs">Secondary</button>
				</div>
				<div class="badge badge-accent badge-sm mt-2">DaisyUI Working</div>
			</div>
		</div>
	`;
	
	// Prefer Shadow DOM overlay if available to avoid clashing with the page
	const host = document.getElementById('chromeleon-root') as HTMLElement | null;
	const shadow = (host as any)?.shadowRoot as ShadowRoot | undefined;
	if (shadow) {
		shadow.appendChild(testComponent);
	} else {
		document.body.appendChild(testComponent);
	}
	
	console.log('🎨 DaisyUI test component added with theme:', theme);
} 