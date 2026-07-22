import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    allowedHosts: ['www.tnsmiley21.work', 'tnsmiley21.work']
  },
  preview: {
    allowedHosts: ['www.tnsmiley21.work', 'tnsmiley21.work']
  }
})
