/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

/**
 * Vitest configuration for Lumière Candles frontend.
 * Uses jsdom for DOM simulation, sets up globals and
 * test setup file for @testing-library/jest-dom matchers.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    css: false,
    coverage: {
      provider: "v8",
      include: [
        "src/components/**",
        "src/pages/**",
        "src/stores/**",
        "src/data/**",
      ],
      exclude: ["src/__tests__/**"],
    },
  },
});
