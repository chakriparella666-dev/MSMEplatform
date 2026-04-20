import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Listen on all addresses for Docker
    allowedHosts: 'all',
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://backend:5000',
        changeOrigin: true,
      },
    },
  },
})
