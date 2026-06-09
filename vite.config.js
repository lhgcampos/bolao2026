import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  root: 'bolao-app',
  base: mode === 'production' ? '/bolao2026/' : '/',
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
  },
  preview: {
    host: '0.0.0.0',
  },
}))
