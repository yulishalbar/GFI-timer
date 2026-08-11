import react from "@vitejs/plugin-react";
import { configDefaults, defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: "/GFI-timer/",
  plugins: [
    react(),
    VitePWA({
      registerType: "prompt",
      injectRegister: "auto",
      includeAssets: ["app-icon.svg"],
      manifest: {
        name: "GFI Timer",
        short_name: "GFI Timer",
        description: "An instructor-focused fitness class timer.",
        theme_color: "#121814",
        background_color: "#121814",
        display: "standalone",
        orientation: "any",
        scope: "./",
        start_url: "./",
        icons: [
          {
            src: "app-icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any"
          },
          {
            src: "app-icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2,mp3,wav}"]
      }
    })
  ],
  test: {
    exclude: [...configDefaults.exclude, "tests/e2e/**"],
    coverage: {
      reporter: ["text", "html"]
    }
  }
});
