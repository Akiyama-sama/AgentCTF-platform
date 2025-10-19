import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    TanStackRouterVite({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    basicSsl(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/attacker': {
        target: 'http://localhost:18888',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/attacker/, ''),
      },
      '/defender': {
        target: 'http://localhost:17777',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/defender/, ''),
      },
      '/backend': {
        target: 'http://localhost:16666',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/backend/, ''),
      },
      '/assessment': {
        target: 'http://localhost:8002',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/assessment/, ''),
      },
      '/compose': {
        target: 'http://localhost:14444',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/compose/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),

      // fix loading all icon chunks in dev mode
      // https://github.com/tabler/tabler-icons/issues/1233
      '@tabler/icons-react': '@tabler/icons-react/dist/esm/icons/index.mjs',
    },
  },
})
