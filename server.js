const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'urls.json');

// Persistent URL Store (loads from urls.json on startup)
let urlStore = {};

if (fs.existsSync(DB_FILE)) {
    try {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        urlStore = JSON.parse(raw);
    } catch (e) {
        console.error('Could not load urls.json:', e);
        urlStore = {};
    }
}

function saveStore() {
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(urlStore, null, 2), 'utf8');
    } catch (e) {
        console.error('Failed to save urls.json:', e);
    }
}

function generateShortCode(length = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// MIME types
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf',
};

const server = http.createServer((req, res) => {
    const parsed = url.parse(req.url, true);
    const pathname = parsed.pathname;

    // CORS headers for all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // --- Native Clean Shortener API: /api/shorten?url=<longUrl> ---
    if (pathname === '/api/shorten') {
        let longUrl = parsed.query.url;

        // Support POST body as well
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    if (data && data.url) longUrl = data.url;
                } catch (e) {}
                handleShorten(longUrl, req, res);
            });
            return;
        } else {
            handleShorten(longUrl, req, res);
            return;
        }
    }

    function handleShorten(longUrl, req, res) {
        if (!longUrl) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing url parameter' }));
            return;
        }

        // Check if longUrl is already in urlStore
        for (const [code, target] of Object.entries(urlStore)) {
            if (target === longUrl) {
                const host = req.headers.host || `localhost:${PORT}`;
                const protocol = req.headers['x-forwarded-proto'] || 'http';
                const shortUrl = `${protocol}://${host}/s/${code}`;
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ shortUrl, code }));
                return;
            }
        }

        // Create new clean short code
        let code = generateShortCode(6);
        while (urlStore[code]) {
            code = generateShortCode(6);
        }

        urlStore[code] = longUrl;
        saveStore();

        const host = req.headers.host || `localhost:${PORT}`;
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const shortUrl = `${protocol}://${host}/s/${code}`;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ shortUrl, code }));
    }

    // --- Direct Instant Short Link Redirect Route: /s/:code ---
    if (pathname.startsWith('/s/')) {
        const code = pathname.substring(3).trim();
        const targetUrl = urlStore[code];

        if (targetUrl) {
            // Instant HTTP 302 Redirect with zero ads or delays
            res.writeHead(302, { 'Location': targetUrl });
            res.end();
            return;
        } else {
            // Fallback to index if code not found
            res.writeHead(302, { 'Location': '/' });
            res.end();
            return;
        }
    }

    // --- Static file serving ---
    let filePath = pathname === '/' ? '/index.html' : pathname;
    filePath = path.join(__dirname, filePath);

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // SPA fallback: serve index.html for unknown routes
                fs.readFile(path.join(__dirname, 'index.html'), (err2, indexContent) => {
                    if (err2) {
                        res.writeHead(500);
                        res.end('Server error');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(indexContent);
                    }
                });
            } else {
                res.writeHead(500);
                res.end('Server error: ' + err.code);
            }
            return;
        }

        const ext = path.extname(filePath);
        const contentType = MIME[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    });
});

server.listen(PORT, () => {
    console.log(`Surprise Lab server running on port ${PORT}`);
});
