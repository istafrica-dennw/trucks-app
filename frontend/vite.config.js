import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Single config enabling LAN access
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // explicitly bind to all interfaces
    port: 3000,
    strictPort: true,
    cors: true
  }
})
