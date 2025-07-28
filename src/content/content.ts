// Minimal DaisyUI test injection

function injectTestButton() {
	const theme = "cyberpunk";
	const existing = document.getElementById("chromeleon-test-btn");
	if (existing) existing.remove();

	const wrapper = document.createElement("div");
	wrapper.id = "chromeleon-test-btn";
	wrapper.setAttribute("data-theme", theme);
	wrapper.style.position = "fixed";
	wrapper.style.top = "10px";
	wrapper.style.right = "10px";
	wrapper.style.zIndex = "99999";
	wrapper.innerHTML = `<button class="btn btn-primary">Test</button>`;

	document.body.appendChild(wrapper);
}

// Wait for <body> to exist, then inject
function waitForBodyAndInject() {
	if (document.body) {
		injectTestButton();
	} else {
		setTimeout(waitForBodyAndInject, 50);
	}
}

waitForBodyAndInject(); 