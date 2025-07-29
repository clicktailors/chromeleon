import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { resolve, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = 3000;

const mimeTypes = {
	'.html': 'text/html',
	'.js': 'text/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.png': 'image/png',
	'.jpg': 'image/jpg',
	'.gif': 'image/gif',
	'.svg': 'image/svg+xml',
	'.wav': 'audio/wav',
	'.mp4': 'video/mp4',
	'.woff': 'application/font-woff',
	'.ttf': 'application/font-ttf',
	'.eot': 'application/vnd.ms-fontobject',
	'.otf': 'application/font-otf',
	'.wasm': 'application/wasm'
};

const server = createServer((req, res) => {
	console.log(`${req.method} ${req.url}`);

	let filePath = req.url === '/' ? '/dev.html' : req.url;
	filePath = resolve(__dirname, filePath.substring(1));

	if (!existsSync(filePath)) {
		res.writeHead(404);
		res.end('File not found');
		return;
	}

	const ext = extname(filePath);
	const contentType = mimeTypes[ext] || 'application/octet-stream';

	try {
		const content = readFileSync(filePath);
		res.writeHead(200, { 'Content-Type': contentType });
		res.end(content);
	} catch (error) {
		res.writeHead(500);
		res.end('Server error');
	}
});

server.listen(PORT, () => {
	console.log(`🚀 Development server running at http://localhost:${PORT}/`);
	console.log(`📱 Popup preview: http://localhost:${PORT}/`);
}); 