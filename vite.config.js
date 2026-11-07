import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mediaManifest from './scripts/vite-media-plugin.mjs';

// Served from https://annabellegrimes.github.io/annabelles-mineral-museum/
// Override with BASE_PATH=/ if the site is ever moved to its own domain.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/annabelles-mineral-museum/',
  plugins: [react(), mediaManifest()],
  build: {
    // three.js lives in the lazily-loaded viewer chunk and is ~1 MB before gzip.
    chunkSizeWarningLimit: 1500,
  },
});
