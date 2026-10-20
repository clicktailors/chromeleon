import { start } from './engine';

// Only the top frame gets reader mode; iframes (embeds, ads) are left alone.
if (window.top === window && document.documentElement instanceof HTMLHtmlElement) {
	void start();
}
