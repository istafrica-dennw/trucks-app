import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Single config enabling LAN access
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // bind 0.0.0.0
    port: 5173,
    strictPort: true,
    cors: true
  }
})
