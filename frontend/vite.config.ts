import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      "/api": {
        //changed to 5003
        target: "http://localhost:5003", // your backend when testing locally
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
