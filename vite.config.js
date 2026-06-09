import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const basePath = process.env.PAGES_BASE_PATH

export default defineConfig(({ mode }) => ({
  root: 'bolao-app',
  base: mode === 'production' ? (basePath || '/bolao2026/') : '/',
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
  },
  preview: {
    host: '0.0.0.0',
  },
}))
