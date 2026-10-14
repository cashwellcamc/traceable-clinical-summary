import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  base: '/traceable-clinical-summary/',
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
