import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Treat .js files containing JSX as JSX during dev/build
const treatJsAsJsx = {
  name: 'treat-js-as-jsx',
  enforce: 'pre',
  async transform(code, id) {
    if (id.endsWith('.js')) {
      const esbuild = await import('esbuild')
      const result = await esbuild.transform(code, {
        loader: 'jsx',
        jsx: 'automatic',
        sourcemap: true
      })
      return { code: result.code, map: result.map }
    }
    return null
  }
}

export default defineConfig({
  plugins: [treatJsAsJsx, react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.')
    }
  },
  server: {
    port: 5173
  }
})


