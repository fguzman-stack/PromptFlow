import { defineConfig } from 'vite';

export default defineConfig({
  // Para GitHub Pages https://fguzman-stack.github.io/PromptFlow/
  base: '/PromptFlow/',
  server: { port: 3000, open: false },
  build: { outDir: 'dist', emptyOutDir: true },
});
