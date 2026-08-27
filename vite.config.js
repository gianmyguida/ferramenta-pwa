import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest', // ora scriviamo noi il Service Worker a mano
      srcDir: 'src',
      filename: 'sw.js', // il plugin legge da src/sw.js e genera dist/sw.js iniettando il precache
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      includeAssets: ['favicon.ico', 'offline.png'],
      manifest: {
        name: 'Guida al fai da Te',
        short_name: 'Ferramenta',
        description: 'PWA per l\'acquisto di articoli da ferramenta',
        theme_color: '#1e3a8a',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'logo.jpg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'logo.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any'
          }
        ]
      },
      injectManifest: {
        // "html" escluso di proposito: se index.html finisse nel precache, Workbox
        // lo servirebbe automaticamente per qualsiasi navigazione (anche offline),
        // intercettando la richiesta PRIMA del nostro fetch handler custom sotto.
        // Vogliamo che sia SOLO il nostro handler a decidere cosa fare in navigazione.
        globPatterns: ['**/*.{js,css,ico,png,svg,jpg,jpeg}']
      }
    })
  ]
})