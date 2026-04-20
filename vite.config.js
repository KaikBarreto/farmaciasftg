import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'esbuild',
  },
  server: {
    port: 5173,
    open: true,
  },
})
