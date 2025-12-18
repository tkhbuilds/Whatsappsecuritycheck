import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const REPO_NAME = 'Whatsappsecuritycheck';
const BASE = process.env.GITHUB_PAGES === 'true' ? `/${REPO_NAME}/` : '/';

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Family Privacy Copilot',
        short_name: 'Privacy Copilot',
        description: 'Local-first privacy audit copilot for families.',
        theme_color: '#0b1220',
        background_color: '#0b1220',
        display: 'standalone',
        scope: BASE,
        start_url: `${BASE}#/`,
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,webmanifest}']
      }
    })
  ]
});
