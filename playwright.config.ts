// playwright.config.ts · the waitlist on real tablet engines: Safari (iPad) and Chrome (Galaxy Tab), finger taps only 👆
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  timeout: 45_000,
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: { baseURL: process.env.BASE_URL ?? 'http://localhost:8799', trace: 'retain-on-failure' },
  projects: [
    { name: 'ipad-landscape-safari', use: { ...devices['iPad Pro 11 landscape'] } },
    { name: 'ipad-portrait-safari', use: { ...devices['iPad Pro 11'] } },
    { name: 'galaxy-tab-chrome', use: { ...devices['Galaxy Tab S4 landscape'] } },
  ],
  // local Worker with its own storage; the relay points nowhere, so tests never email anyone
  webServer: process.env.BASE_URL ? undefined : {
    command: 'node deck/build.mjs && node node_modules/wrangler/bin/wrangler.js dev --port 8799 --persist-to .wrangler/e2e --var RELAY_URL:http://127.0.0.1:9/no-email-in-tests',
    url: 'http://localhost:8799/api/health',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
