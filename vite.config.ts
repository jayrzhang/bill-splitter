import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['splitaa-logo.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'SplitAA — Split bills, beautifully',
        short_name: 'SplitAA',
        description: 'Account-free, local-first, private bill splitting.',
        theme_color: '#1fb6ab',
        background_color: '#eef0f4',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // the two big legacy logo PNGs are unused (favicon is the SVG) — keep them
        // out of the offline precache so installs stay small.
        globIgnores: ['**/splitaa-logo.png', '**/splitaa-logo-large.png'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
