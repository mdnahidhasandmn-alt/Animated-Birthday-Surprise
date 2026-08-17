const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'urls.json');
const USERS_FILE = path.join(__dirname, 'users.json');

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

// Persistent Users & Admin Store (loads from users.json on startup)
let authStore = {
    admin: {
        username: "admin",
        password: "Nahid@123"
    },
    users: []
};

if (fs.existsSync(USERS_FILE)) {
    try {
        const rawUsers = fs.readFileSync(USERS_FILE, 'utf8');
        authStore = JSON.parse(rawUsers);
        if (!authStore.admin) authStore.admin = { username: "admin", password: "Nahid@123" };
        if (!authStore.users) authStore.users = [];
    } catch (e) {
        console.error('Could not load users.json:', e);
    }
} else {
    saveAuthStore();
}

function saveAuthStore() {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(authStore, null, 2), 'utf8');
    } catch (e) {
        console.error('Failed to save users.json:', e);
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Helper to parse JSON body
    function getJsonBody(req, cb) {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                cb(null, data);
            } catch (e) {
                cb(e, null);
            }
        });
    }

    // --- Authentication & Admin API Routes ---
    if (pathname === '/api/auth/login' && req.method === 'POST') {
        getJsonBody(req, (err, data) => {
            if (err || !data || !data.username || !data.password) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Username and password required' }));
                return;
            }

            const inputUser = String(data.username).trim();
            const inputPass = String(data.password).trim();

            // Check Admin login
            if ((inputUser.toLowerCase() === authStore.admin.username.toLowerCase() || inputUser.toLowerCase() === 'nahid') && inputPass === authStore.admin.password) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, role: 'admin', username: authStore.admin.username }));
                return;
            }

            // Check created Users login
            const matchedUser = authStore.users.find(u => u.username.toLowerCase() === inputUser.toLowerCase() && u.password === inputPass);
            if (matchedUser) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, role: 'user', username: matchedUser.username }));
                return;
            }

            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Invalid username or password' }));
        });
        return;
    }

    if (pathname === '/api/auth/admin/change-password' && req.method === 'POST') {
        getJsonBody(req, (err, data) => {
            if (err || !data || !data.currentPassword || !data.newPassword) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Current and new password required' }));
                return;
            }

            if (String(data.currentPassword).trim() !== authStore.admin.password) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Current admin password incorrect' }));
                return;
            }

            authStore.admin.password = String(data.newPassword).trim();
            saveAuthStore();

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Admin password updated successfully!' }));
        });
        return;
    }

    if (pathname === '/api/auth/admin/create-user' && req.method === 'POST') {
        getJsonBody(req, (err, data) => {
            if (err || !data || !data.username || !data.password) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Username and password required' }));
                return;
            }

            const newUser = String(data.username).trim();
            const newPass = String(data.password).trim();

            if (authStore.users.some(u => u.username.toLowerCase() === newUser.toLowerCase())) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Username already exists' }));
                return;
            }

            authStore.users.push({
                username: newUser,
                password: newPass,
                createdAt: new Date().toISOString()
            });
            saveAuthStore();

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: `User '${newUser}' created successfully!` }));
        });
        return;
    }

    if (pathname === '/api/auth/admin/users' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            adminUsername: authStore.admin.username,
            users: authStore.users.map(u => ({ username: u.username, createdAt: u.createdAt }))
        }));
        return;
    }

    if (pathname === '/api/auth/admin/delete-user' && req.method === 'POST') {
        getJsonBody(req, (err, data) => {
            if (err || !data || !data.username) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Username required' }));
                return;
            }

            const targetUser = String(data.username).trim();
            authStore.users = authStore.users.filter(u => u.username.toLowerCase() !== targetUser.toLowerCase());
            saveAuthStore();

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: `User '${targetUser}' deleted!` }));
        });
        return;
    }

    // --- Native Clean Shortener API: /api/shorten ---
    if (pathname === '/api/shorten') {
        let longUrl = parsed.query.url;
        let payloadConfig = null;

        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    if (data && data.url) longUrl = data.url;
                    if (data && data.config) payloadConfig = data.config;
                } catch (e) {}
                handleShorten(longUrl, payloadConfig, req, res);
            });
            return;
        } else {
            handleShorten(longUrl, null, req, res);
            return;
        }
    }

    function handleShorten(longUrl, payloadConfig, req, res) {
        if (!longUrl && !payloadConfig) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing url or config payload' }));
            return;
        }

        // Create new clean short code
        let code = generateShortCode(6);
        while (urlStore[code]) {
            code = generateShortCode(6);
        }

        urlStore[code] = payloadConfig || longUrl;
        saveStore();

        const host = req.headers.host || `localhost:${PORT}`;
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const shortUrl = `${protocol}://${host}/s/${code}`;

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ shortUrl, code }));
    }

    // --- Wish config lookup API: /api/wish/:code ---
    if (pathname.startsWith('/api/wish/')) {
        const code = pathname.substring(10).trim();
        const storedItem = urlStore[code];

        if (!storedItem) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Wish not found' }));
            return;
        }

        let config = null;
        if (typeof storedItem === 'object') {
            config = storedItem;
        } else if (typeof storedItem === 'string' && storedItem.includes('?w=')) {
            const rawW = storedItem.split('?w=')[1];
            try {
                const jsonStr = Buffer.from(decodeURIComponent(rawW), 'base64').toString('utf8');
                config = JSON.parse(jsonStr);
            } catch (e) {
                config = { rawUrl: storedItem };
            }
        } else {
            config = { rawUrl: storedItem };
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, config, code }));
        return;
    }

    // --- Direct Short Link Route: /s/:code (Serves index.html directly to prevent HTTP 431 header overflow) ---
    if (pathname.startsWith('/s/')) {
        const code = pathname.substring(3).trim();
        if (urlStore[code]) {
            fs.readFile(path.join(__dirname, 'index.html'), (err, indexContent) => {
                if (err) {
                    res.writeHead(500);
                    res.end('Server Error');
                } else {
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(indexContent);
                }
            });
            return;
        } else {
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
