import { ensureShadowHost } from "../utils/domUtils";
import React from "react";
import { createRoot } from "react-dom/client";
import { getRoot, setRoot, clearRoot } from "@/content/utils/rootRegistry";
import { chromeStorage } from "@/utils/chromeApi";
import { OverlayApp } from "./OverlayApp";

const HOST_ID = "chromeleon-root";

export function ensureOverlay(): {
	host: HTMLElement;
	shadow: ShadowRoot;
	mount: HTMLElement;
} {
	console.log("Ensuring overlay exists...");
	const { host, shadow } = ensureShadowHost(HOST_ID);
	console.log("Host:", host, "Shadow:", shadow);

	// Prevent background page from scrolling while overlay is active
	const scrollLockId = "chromeleon-scroll-lock";
	let scrollLock = document.getElementById(scrollLockId);
	if (!scrollLock) {
		scrollLock = document.createElement("div");
		scrollLock.id = scrollLockId;
		scrollLock.className = "fixed inset-0 z-[2147483645] pointer-events-none";
		// Use class-based scroll lock - no style manipulation
		document.body.classList.add('overflow-hidden');
		document.head.appendChild(scrollLock);
	}

	// Load CSS as web accessible resource - no injection
	const cssId = "chromeleon-daisyui-css";
	let link = shadow.getElementById(cssId) as HTMLLinkElement | null;
	if (!link) {
		link = document.createElement("link");
		link.id = cssId;
		link.rel = "stylesheet";
		// Use web accessible resource path
		link.href = chrome.runtime.getURL("src/styles/content.css");
		shadow.appendChild(link);
	}

	// Overlay styling is now handled through Tailwind classes in the elements themselves

	// Ensure a full-viewport overlay container that will capture scroll
	let overlay = shadow.getElementById("overlay") as HTMLElement | null;
	if (!overlay) {
		console.log("Creating overlay element...");
		overlay = document.createElement("div");
		overlay.id = "overlay";
		// Apply Tailwind classes for proper positioning and theming
		overlay.className = "fixed inset-0 z-[2147483647] pointer-events-auto overflow-auto bg-base-100";
		shadow.appendChild(overlay);
		console.log("Overlay element created with classes:", overlay.className);
	} else {
		console.log("Overlay element already exists");
	}

	// Ensure a backdrop exists (kept for layering, but no longer styled)
	let backdrop = shadow.getElementById("backdrop") as HTMLElement | null;
	if (!backdrop) {
		backdrop = document.createElement("div");
		backdrop.id = "backdrop";
		backdrop.className = "fixed inset-0 z-[2147483646] pointer-events-none";
		shadow.appendChild(backdrop);
	}

	let mount = shadow.getElementById("mount") as HTMLElement | null;
	if (!mount) {
		mount = document.createElement("div");
		mount.id = "mount";
		// Apply Tailwind classes for proper sizing and theming
		mount.className = "w-full h-full overflow-auto p-0 m-0";
		overlay.appendChild(mount);
	} else if (mount.parentElement !== overlay) {
		overlay.appendChild(mount);
	}

	// Read settings to determine overlay style (transparent+blur vs solid)
	const applyOverlayMode = (solid: boolean) => {
		if (!overlay) {
			console.log("Overlay not found for mode application");
			return;
		}
		console.log("Applying overlay mode:", solid ? "solid" : "translucent");

		// Reset to base classes
		overlay.className = "fixed inset-0 z-[2147483647] pointer-events-auto overflow-auto";

		if (solid) {
			// Solid background using DaisyUI token - let DaisyUI handle theming
			overlay.classList.add("bg-base-100");
		} else {
			// Translucent blurred backdrop
			overlay.classList.add("bg-black/50", "backdrop-blur");
		}
	};
	// Apply theme settings to overlay
	try {
		chromeStorage?.sync?.get?.("themeSettings")?.then?.((res: any) => {
			const st = res?.themeSettings || {};
			const mode = st.mode || "system";
			const lightTheme = st.selectedLightTheme || "retro";
			const darkTheme = st.selectedDarkTheme || "dracula";
			const isSystemDark =
				window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ??
				false;
			const effective =
				mode === "dark"
					? darkTheme
					: mode === "light"
					? lightTheme
					: isSystemDark
					? darkTheme
					: lightTheme;
			
			// Apply theme to both host and overlay elements
			if (overlay) overlay.setAttribute("data-theme", effective);
			host.setAttribute("data-theme", effective);
			
			// Apply overlay mode
			applyOverlayMode(Boolean(st.overlaySolidBackground));
		});
	} catch {
		// Fallback: apply default solid background
		applyOverlayMode(true);
	}
	return { host, shadow, mount };
}

/**
 * Hide the overlay when extension is disabled
 */
export function hideOverlay(): void {
	console.log("Hiding overlay...");
	const host = document.getElementById(HOST_ID) as HTMLElement | null;
	const shadow = (host as any)?.shadowRoot as ShadowRoot | undefined;

	if (!host || !shadow) {
		console.log("Host or shadow not found, nothing to hide");
		return;
	}

	// Hide overlay by adding hidden class but preserve other classes
	const overlay = shadow.getElementById("overlay");
	if (overlay) {
		console.log("Hiding overlay element...");
		overlay.classList.add("hidden");
		// Keep all classes so they can be restored when shown
	} else {
		console.log("Overlay element not found");
	}

	// Remove scroll lock
	const scrollLockId = "chromeleon-scroll-lock";
	const scrollLock = document.getElementById(scrollLockId);
	if (scrollLock) {
		scrollLock.remove();
		console.log("Scroll lock removed");
	} else {
		console.log("Scroll lock not found");
	}

	const mount = shadow.getElementById("mount") as HTMLElement | null;
	if (mount) {
		const root = getRoot(mount);
		root?.unmount();
		clearRoot(mount);
	}

	console.log("Chromeleon overlay hidden");
}

/**
 * Render the React overlay app
 */
export function renderOverlayApp(): void {
	const host = document.getElementById(HOST_ID) as HTMLElement | null;
	const shadow = (host as any)?.shadowRoot as ShadowRoot | undefined;

	if (!host || !shadow) {
		console.error("Cannot render overlay app - host or shadow not found");
		return;
	}

	const mount = shadow.getElementById("mount");
	if (!mount) {
		console.error("Mount element not found in shadow DOM");
		return;
	}

	// Create React root and render the overlay app
	try {
		let root = getRoot(mount);
		if (!root) {
			root = createRoot(mount);
			setRoot(mount, root);
			console.log("Created new React root for overlay");
		} else {
			console.log("Using existing React root for overlay");
		}
		
		// Render the React app
		root.render(React.createElement(OverlayApp));
		console.log("React overlay app rendered successfully");
		console.log("Mount element content:", mount.innerHTML.substring(0, 200) + "...");
	} catch (error) {
		console.error("Failed to render React overlay app:", error);
	}
}

/**
 * Show the overlay when extension is enabled
 */
export function showOverlay(): void {
	const host = document.getElementById(HOST_ID) as HTMLElement | null;
	const shadow = (host as any)?.shadowRoot as ShadowRoot | undefined;

	if (!host || !shadow) {
		console.error("Chromeleon overlay not found - host or shadow missing");
		return;
	}

	// Show overlay by removing hidden class and applying theme
	const overlay = shadow.getElementById("overlay");
	if (overlay) {
		console.log("Found overlay element, showing it...");
		console.log("Overlay current classes:", overlay.className);
		console.log("Overlay computed style:", window.getComputedStyle(overlay));

		// Remove hidden class
		overlay.classList.remove("hidden");

		// Apply the current overlay mode (solid vs translucent)
		try {
			chromeStorage?.sync?.get?.("themeSettings", (res: any) => {
				const st = res?.themeSettings || {};
				if (st.overlaySolidBackground) {
					// Solid background - let DaisyUI handle theming
					overlay.className = "fixed inset-0 z-[2147483647] pointer-events-auto overflow-auto bg-base-100";
				} else {
					// Translucent background
					overlay.className = "fixed inset-0 z-[2147483647] pointer-events-auto overflow-auto bg-black/50 backdrop-blur";
				}
				console.log(
					"Applied overlay mode:",
					st.overlaySolidBackground ? "solid" : "translucent"
				);
			});
		} catch (error) {
			console.error("Failed to apply overlay mode:", error);
			// Fallback to solid background
			overlay.className = "fixed inset-0 z-[2147483647] pointer-events-auto overflow-auto bg-base-100";
		}
	} else {
		console.error("Overlay element not found in shadow DOM");
	}

	// Re-apply scroll lock
	const scrollLockId = "chromeleon-scroll-lock";
	let scrollLock = document.getElementById(scrollLockId);
	if (!scrollLock) {
		scrollLock = document.createElement("div");
		scrollLock.id = scrollLockId;
		scrollLock.className = "fixed inset-0 z-[2147483645] pointer-events-none";
		document.body.classList.add('overflow-hidden');
		document.head.appendChild(scrollLock);
		console.log("Scroll lock applied");
	} else {
		console.log("Scroll lock already exists");
	}

	console.log("Chromeleon overlay shown");

	// Render React app into the overlay
	renderOverlayApp();
}
