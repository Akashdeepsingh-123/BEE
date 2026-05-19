import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /.*\.jsx?$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  resolve: {
    alias: {

      '@': path.resolve(__dirname, '.')

    }

  },
  server: {
    port: 5173,
    


    proxy: {
      '/api': {
        
        target: 'http://localhost:5120',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://localhost:5120',
        changeOrigin: true
      },
      '/ssr-demo': {
        target: 'http://localhost:5120',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:5120',
        ws: true,
        changeOrigin: true
      }
    }
  }
})


