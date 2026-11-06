import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { port: 5190 },
  preview: { port: 5191 },
  build: { chunkSizeWarningLimit: 900 },
});
