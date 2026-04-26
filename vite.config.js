import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  // Use BASE_URL env var for GitHub Pages deployment, default to '/' for local dev
  base: process.env.BASE_URL || '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        present: resolve(__dirname, 'present.html'),
      },
    },
  },
})
