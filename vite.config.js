import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"], // Archivos que guardará en caché para que cargue rápido
      },
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "FinancePro",
        short_name: "FinancePro",
        description: "Análisis de Liquidez y Control Financiero",
        theme_color: "#0f172a", // Color slate-900 del TopHeader
        background_color: "#f8fafc", // Color slate-50 de fondo
        display: "standalone", // Obliga a la app a abrirse sin la barra del navegador (pantalla completa)
        orientation: "portrait", // Bloquea la app en formato vertical para móviles
        icons: [
          {
            src: "/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable", // Necesario para que Android adapte el icono a la forma del sistema
          },
        ],
      },
    }),
  ],
});
