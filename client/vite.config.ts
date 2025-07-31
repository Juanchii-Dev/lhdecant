import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
          stripe: ['@stripe/stripe-js'],
          query: ['@tanstack/react-query'],
        },
      },
    },
    chunkSizeWarningLimit: 2000,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
  },
  css: {
    devSourcemap: false,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://lhdecant-backend.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    __DEV__: false,
  },
}) 