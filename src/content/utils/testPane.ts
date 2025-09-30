import { getChromeleonOverlay } from './domUtils';

/**
 * Test pane component for verifying DaisyUI theme switching
 * Shows a small card with sample DaisyUI components to preview the current theme
 */

const TEST_COMPONENT_ID = 'chromeleon-theme-test';

/**
 * Toggle the test pane visibility based on user settings
 */
export function toggleTestPane(daisyTheme: string, showTestPane: boolean): void {
	console.log('🧪 Managing test pane, show:', showTestPane);

	if (showTestPane) {
		showTestComponent(daisyTheme);
	} else {
		hideTestComponent();
	}
}

/**
 * Hide the test component
 */
function hideTestComponent(): void {
	const { shadow } = getChromeleonOverlay();
	const inShadow = shadow?.getElementById?.(TEST_COMPONENT_ID) as HTMLElement | undefined;
	if (inShadow) {
		inShadow.remove();
		return;
	}
	const inDoc = document.getElementById(TEST_COMPONENT_ID);
	if (inDoc) inDoc.remove();
}

/**
 * Show the test component with DaisyUI theme preview
 */
function showTestComponent(theme: string): void {
	// Remove any existing instance (document or shadow)
	hideTestComponent();

	// Create test component with DaisyUI classes
	const testComponent = document.createElement('div');
	testComponent.id = TEST_COMPONENT_ID;
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
	const { shadow, overlay } = getChromeleonOverlay();
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
