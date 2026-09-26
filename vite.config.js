import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  // Use relative base path so assets load properly whether deployed on
  // GitHub Pages (https://username.github.io/repo-name/) or Vercel / Netlify
  base: './',
});
