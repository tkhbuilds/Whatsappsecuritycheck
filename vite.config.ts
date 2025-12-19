import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const REPO_NAME = 'Whatsappsecuritycheck';
const IS_GITHUB_PAGES = process.env.GITHUB_PAGES === 'true';
// For Android WebView loading `file:///android_asset/...`, we need *relative* asset URLs (no leading '/'),
// otherwise WebView will look for `file:///assets/...` and render a blank page.
const BASE = IS_GITHUB_PAGES ? `/${REPO_NAME}/` : './';
const PWA_SCOPE = IS_GITHUB_PAGES ? BASE : '/';
const PWA_START_URL = IS_GITHUB_PAGES ? `${BASE}#/` : '#/';

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
        scope: PWA_SCOPE,
        start_url: PWA_START_URL,
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
