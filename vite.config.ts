import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    global: 'globalThis',
  },
  plugins: [react(), cloudflare()],
  server: {
    port: 8000,
    host: true,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})