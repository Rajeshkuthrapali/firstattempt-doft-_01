import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for Lumière Candles E2E tests.
 * Launches the Vite dev server automatically, runs tests
 * against Desktop Chrome + Mobile Safari viewports.
 *
 * Reporters:
 *  - HTML   → visual report (open manually)
 *  - JSON   → structured pass/fail data for CI pipelines
 *  - list   → real-time console progress with timing
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["json", { outputFile: "e2e-report.json" }],
  ],
  timeout: 30_000,
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "Desktop Chrome",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 13"] },
    },
  ],
});
