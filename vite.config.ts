import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'url';
import {defineConfig, Plugin} from 'vite';

function pwaPlugin(): Plugin {
  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#0f172a"><rect width="512" height="512" rx="100" fill="#0f172a"/><rect x="20" y="20" width="472" height="472" rx="80" stroke="#f59e0b" stroke-width="12" fill="none"/><path d="M375 140c-25-25-65-25-90 0l-20 20 60 60 20-20c25-25 25-65 0-90-10-10-25-15-40-15s-30 5-40 15l-150 150c-5 5-8 12-8 20v70c0 15 12 27 27 27h70c8 0 15-3 20-8l150-150c25-25 25-65 0-90z" fill="#f59e0b"/><circle cx="210" cy="300" r="25" fill="#38bdf8"/></svg>`;

  const manifestContent = JSON.stringify({
    id: "/",
    name: "TradeCost Pro - Mobile Job Estimator & Invoicing",
    short_name: "TradeCostPro",
    description: "Mobile CRM, instant job costing, GCash & card invoicing, and tap-to-pay for tradesmen.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    theme_color: "#0f172a",
    background_color: "#020617",
    categories: ["business", "productivity", "utilities"],
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      }
    ],
    screenshots: [
      {
        src: "/screenshot-mobile.png",
        sizes: "720x1280",
        type: "image/png",
        form_factor: "narrow",
        label: "TradeCost Pro Mobile Estimator"
      },
      {
        src: "/screenshot-desktop.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "TradeCost Pro Dashboard"
      }
    ]
  }, null, 2);

  const swContent = `
const CACHE_NAME = 'tcp-cache-v2';
self.addEventListener('install', (event) => {
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
`.trim();

  return {
    name: 'vite-pwa-generator',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'manifest.json',
        source: manifestContent
      });
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: swContent
      });
      this.emitFile({
        type: 'asset',
        fileName: 'icon.svg',
        source: iconSvg
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), pwaPlugin()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('.', import.meta.url)),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
