import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: false // Disable the error overlay
    },
    watch: {
      usePolling: true, // Enable polling for file changes
      interval: 100 // Check for changes every 100ms
    }
  }
}) 