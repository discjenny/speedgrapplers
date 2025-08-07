import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'robots.txt'],
      manifest: {
        name: 'SpeedGrapplers Controller',
        short_name: 'Controller',
        start_url: '/controller/',
        scope: '/controller/',
        display: 'standalone',
        orientation: 'landscape',
        background_color: '#0b0d12',
        theme_color: '#0b0d12',
        icons: []
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /\/socket\.io\//,
            handler: 'NetworkOnly'
          }
        ]
      },
      strategies: 'generateSW',
      injectRegister: null,
      // Ensure SW only controls /controller/
      devOptions: { enabled: false }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:4000',
        ws: true
      }
    }
  },
  build: {
    target: 'es2020'
  }
});


