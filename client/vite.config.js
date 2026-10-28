import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Locally, /api is forwarded to the Express server so the app behaves like the single-address deploy
const proxy = { '/api': 'http://localhost:5050' };

export default defineConfig({
  plugins: [react()],
  server: { port: 5180, strictPort: true, proxy },
  preview: { port: 5180, proxy },
});
