import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      // Only proxy to local API if VITE_API_URL is not set
      ...(import.meta.env.VITE_API_URL ? {} : {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        '/uploads': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        '/socket.io': {
          target: 'ws://localhost:3000',
          ws: true,
        }
      })
    },
    hmr: {
      port: 5173
    }
  },
  plugins: [react()],
})
