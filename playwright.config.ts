import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    video: "on",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "public",
      testDir: "./e2e/public",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "auth",
      testDir: "./e2e/auth",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "admin",
      testDir: "./e2e/admin",
      use: { ...devices["Desktop Chrome"], storageState: "test-results/.e2e-state.json" },
    },
    {
      name: "matrix-chromium",
      testDir: "./e2e/matrix",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "matrix-webkit",
      testDir: "./e2e/matrix",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "matrix-mobile",
      testDir: "./e2e/matrix-mobile",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "journeys",
      testDir: "./e2e/journeys",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        trace: "off",
        screenshot: "off",
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
  },
  globalSetup: "./e2e/global-setup.ts",
  globalTeardown: "./e2e/global-teardown.ts",
});
