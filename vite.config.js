import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: false,

    },
    watch: {
      usePolling: true,
      interval: 100,
      // Add patterns to watch
      include: ['src/**/*'],
      // Ignore node_modules and other unnecessary directories
      ignored: ['**/node_modules/**', '**/dist/**', '.git/**']
    },
    // Enable hot reloading
    hot: true
  }
})