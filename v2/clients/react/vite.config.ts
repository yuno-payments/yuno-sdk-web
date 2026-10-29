import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // The merchant server in ../../server owns the private key; the browser only talks to /api.
    proxy: { '/api': 'http://localhost:8090' },
  },
})
