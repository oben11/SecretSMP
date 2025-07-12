import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000; // Use process.env.PORT for flexibility

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());

// --- Existing functionality (unconditional middleware) ---
// Serve all of node_modules directly. This will work in both dev and prod.
// In dev, it runs before Vite's middleware. In prod, it serves from the actual node_modules.
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

// get skins from usernames.txt
function getSkins() {
    const nameFilePath = path.join(process.cwd(), 'usernames.txt');
    try {
        const usernames = fs.readFileSync(nameFilePath, 'utf-8')
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean);
        return usernames.map(username => `https://minotar.net/skin/${username}`);
    } catch (error) {
        console.error('Error reading usernames.txt:', error);
        return [];
    }
}

let currentPlayers = []; // This will persist in memory for the server instance

// API routes - these should always come before any static file serving fallbacks
app.get('/api/skins', (req, res) => {
    const skins = getSkins();
    res.json(skins);
});

app.post('/api/active', (req, res) => {
    const { players } = req.body;

    if (!Array.isArray(players)) {
        return res.status(400).send("Invalid JSON: 'players' must be an array.");
    }

    currentPlayers = players;
    console.log('Current active players:', currentPlayers);
    res.sendStatus(200);
});

app.get('/api/active', (req, res) => {
    res.json({ players: currentPlayers });
});

// --- Vite Integration Logic ---
const isDevelopment = process.env.NODE_ENV === 'development';

if (isDevelopment) {
    console.log('Running in DEVELOPMENT mode...');
    // Dynamically import vite. This ensures vite is only loaded in dev mode,
    // as it's a devDependency and not needed in production.
    import('vite').then(async (vite) => {
        // Create Vite server in middleware mode.
        // This tells Vite to handle the frontend assets, but lets Express control the main HTTP server.
        const viteDevServer = await vite.createServer({
            server: {
                middlewareMode: true,
            },
            appType: 'custom', // Prevents Vite from serving its own HTML, letting Express handle it.
            // The 'root' here must match the 'root' in your vite.config.js
            root: path.resolve(__dirname, 'public'),
        });

        // Use Vite's connect instance as middleware.
        // This allows Vite to intercept requests for your frontend files (HTML, JS, CSS, images)
        // and serve them with HMR, etc.
        app.use(viteDevServer.middlewares);

        // All other routes (that are not API or node_modules) will fall through to Vite's middleware.
        // If Vite doesn't find a match, it will eventually return a 404, or your Express
        // server's default 404 handler will catch it.

        // Start the Express server after Vite middleware is ready
        app.listen(PORT, () => {
            console.log(`Server (backend API) running on http://localhost:${PORT}`);
            // In development, the frontend is served by Vite, usually on a different port (5173 by default)
            console.log(`Frontend served by Vite dev server. Access at http://localhost:${viteDevServer.config.server.port}`);
        });

    }).catch(error => {
        console.error('Error starting Vite dev server middleware:', error);
        process.exit(1); // Exit if Vite server fails to start
    });

} else {
    // Production setup
    console.log('Running in PRODUCTION mode...');

    // Serve static assets from the Vite build output (the 'dist' folder)
    // This middleware will automatically serve `index.html`, `channel.html`,
    // and any other files (JS, CSS, images) directly when requested by their full path.
    app.use(express.static(path.resolve(__dirname, 'dist')));

    // For any other request that isn't an API route, node_modules, or a physical file in 'dist',
    // serve the index.html from the dist folder. This is for client-side routing fallbacks.
    // This should come *after* all your API routes and the express.static middleware.
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });

    // Start the Express server for production
    app.listen(PORT, () => {
        console.log(`Production server running on http://localhost:${PORT}`);
        console.log(`Serving static files from ${path.resolve(__dirname, 'dist')}`);
    });
}
