// vite.config.js
import { defineConfig } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import * as glob from 'glob'; // Corrected import for glob

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to dynamically get HTML entry points
function getHtmlEntryPoints(rootPath) {
  const htmlFiles = glob.sync(path.resolve(rootPath, '**/*.html'));
  const entries = {};
  for (const file of htmlFiles) {
    // Create a name for the entry (e.g., 'index', 'channel')
    // This removes the root path and the .html extension
    const name = path.relative(rootPath, file).replace(/\.html$/, '');
    entries[name] = file;
  }
  return entries;
}

export default defineConfig({
  root: path.resolve(__dirname, 'public'),

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
    port: 5173,
  },

  build: {
    outDir: path.resolve(__dirname, 'dist'),
    manifest: true,
    rollupOptions: {
      // Use the dynamically generated entry points
      input: getHtmlEntryPoints(path.resolve(__dirname, 'public')),
    },
  },
  // plugins: [react()], // Uncomment if you're using React
});