/**
 * Apply gentle theme that preserves existing styles and adds DaisyUI
 * Since we're now using React/Tailwind components, we only manage test components
 */
export function applyGentleTheme(daisyTheme: string, showTestPane: boolean): void {
	console.log('🌙 Applying theme with React/Tailwind components');

	// Ensure test component is synchronized to the toggle state
	if (showTestPane) {
		addTestComponent(daisyTheme);
	} else {
		removeTestComponent();
	}

	console.log('Chromeleon theme applied with DaisyUI theme:', daisyTheme);
}

/**
 * Add a test component to verify DaisyUI theme switching
 */
function getOverlayContainer(): { shadow?: ShadowRoot; overlay?: HTMLElement } {
	const host = document.getElementById('chromeleon-root') as HTMLElement | null;
	const shadow = (host as any)?.shadowRoot as ShadowRoot | undefined;
	const overlay = shadow?.getElementById?.('overlay') as HTMLElement | undefined;
	return { shadow, overlay };
}

function removeTestComponent(): void {
	const { shadow } = getOverlayContainer();
	const inShadow = shadow?.getElementById?.('chromeleon-theme-test') as HTMLElement | undefined;
	if (inShadow) {
		inShadow.remove();
		return;
	}
	const inDoc = document.getElementById('chromeleon-theme-test');
	if (inDoc) inDoc.remove();
}

function addTestComponent(theme: string): void {
	// Remove any existing instance (document or shadow)
	removeTestComponent();

	// Create test component with DaisyUI classes
	const testComponent = document.createElement('div');
	testComponent.id = 'chromeleon-theme-test';
	testComponent.setAttribute('data-theme', theme);
	testComponent.innerHTML = `
		<div class="card bg-base-100 shadow-xl p-4 m-4 max-w-sm fixed top-2.5 right-2.5 z-[99999]">
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

	// Always prefer overlay container inside Shadow DOM to keep everything isolated
	const { shadow, overlay } = getOverlayContainer();
	if (overlay) {
		overlay.appendChild(testComponent);
	} else if (shadow) {
		shadow.appendChild(testComponent);
	} else {
		// Fallback to document body only if shadow DOM doesn't exist
		console.warn('Shadow DOM not available, test component added to document body');
		document.body.appendChild(testComponent);
	}

	console.log('🎨 DaisyUI test component added with theme:', theme);
}