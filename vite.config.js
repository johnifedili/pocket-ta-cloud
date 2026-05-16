import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Standard Vite + React setup. The base path is left as the default so the
// build runs the same way locally and when deployed to a static host.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  }
})
