// Development content script for testing theming functionality
class DevThemeManager {
	private currentTheme = 'dark';
	private showTestPane = true;
	private isEnabled = true;

	constructor() {
		this.initialize();
	}

	private initialize() {
		console.log('🎨 Dev Theme Manager initialized');
		this.applyTheme();
		
		// Listen for theme changes from the popup
		window.addEventListener('message', (event) => {
			if (event.data.type === 'DEV_THEME_UPDATE') {
				this.currentTheme = event.data.theme;
				this.isEnabled = event.data.enabled;
				this.showTestPane = event.data.showTestPane ?? true;
				this.applyTheme();
			}
		});
	}

	private applyTheme() {
		if (!this.isEnabled) {
			this.removeTheme();
			return;
		}

		// Apply DaisyUI theme to the page
		document.documentElement.setAttribute('data-theme', this.currentTheme);
		
		// Add some visual feedback
		if (this.showTestPane) {
			this.addThemeIndicator();
		} else {
			this.removeThemeIndicator();
		}
		
		console.log(`🎨 Applied theme: ${this.currentTheme}`);
	}

	private removeTheme() {
		document.documentElement.removeAttribute('data-theme');
		this.removeThemeIndicator();
		console.log('🎨 Theme removed');
	}

	private addThemeIndicator() {
		let indicator = document.getElementById('dev-theme-indicator');
		if (!indicator) {
			indicator = document.createElement('div');
			indicator.id = 'dev-theme-indicator';
			indicator.style.cssText = `
				position: fixed;
				top: 10px;
				left: 10px;
				background: #4f46e5;
				color: white;
				padding: 8px 12px;
				border-radius: 6px;
				font-size: 12px;
				font-weight: 500;
				z-index: 999999;
				box-shadow: 0 2px 8px rgba(0,0,0,0.2);
			`;
			document.body.appendChild(indicator);
		}
		indicator.textContent = `Theme: ${this.currentTheme}`;
	}

	private removeThemeIndicator() {
		const indicator = document.getElementById('dev-theme-indicator');
		if (indicator) {
			indicator.remove();
		}
	}
}

// Initialize the dev theme manager
new DevThemeManager(); 