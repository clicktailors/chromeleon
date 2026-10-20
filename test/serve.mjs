// Tiny static server for the fixture pages. `<name>.test/` serves
// fixtures/<name>.html, any path under /spa/ serves the
// SPA shell, and /img/WxH/color.svg returns a placeholder image.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

export function serve(port = 0) {
	const server = http.createServer((req, res) => {
		const url = new URL(req.url, 'http://x');
		const img = url.pathname.match(/^\/img\/(\d+)x(\d+)\/(\w+)\.svg$/);
		if (img) {
			const [, w, h, color] = img;
			res.writeHead(200, { 'content-type': 'image/svg+xml' });
			res.end(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="100%" height="100%" fill="#${color}"/><text x="50%" y="50%" font-family="sans-serif" font-size="${Math.round(h / 8)}" fill="#fff" text-anchor="middle" dominant-baseline="middle">${w}×${h}</text></svg>`);
			return;
		}
		// news.test:port/ serves news.html, so each fixture gets its own hostname.
		const site = (req.headers.host || '').split('.')[0];
		let file = url.pathname === '/' ? site : url.pathname.slice(1);
		if (file.startsWith('spa')) file = 'spa.html';
		if (!file.endsWith('.html')) file += '.html';
		const full = path.join(dir, path.basename(file));
		if (!fs.existsSync(full)) {
			res.writeHead(404).end('not found');
			return;
		}
		res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
		res.end(fs.readFileSync(full));
	});
	return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const server = await serve(Number(process.env.PORT) || 8787);
	console.log(`fixtures on http://127.0.0.1:${server.address().port}`);
}
