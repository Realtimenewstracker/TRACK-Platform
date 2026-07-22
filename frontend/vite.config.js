import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy /api requests to the backend in development
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      // Proxy Socket.IO WebSocket connections in development
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
        changeOrigin: true
      }
    }
  }
})
