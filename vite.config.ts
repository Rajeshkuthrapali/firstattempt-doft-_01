/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom", "gsap"],
          admin: [
            "./src/pages/admin/AdminOverview",
            "./src/pages/admin/AdminProducts",
            "./src/pages/admin/AdminOrders",
            "./src/pages/admin/AdminInventory",
          ],
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
  },
});
