import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})