import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['./src/utils/reporter.ts'],
  ],
  use: {
    baseURL: 'https://www.saucedemo.com',
    actionTimeout: 15000,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    headless: false,
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});