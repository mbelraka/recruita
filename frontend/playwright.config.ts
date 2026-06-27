import { defineConfig, devices } from '@playwright/test';

/**
 * E2E tests run against the dev server started below (or reuse `ng serve` locally).
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'https://127.0.0.1:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command:
      'npx ng serve --host 127.0.0.1 --port 4200 --configuration development',
    url: 'https://127.0.0.1:4200',
    reuseExistingServer: !process.env['CI'],
    timeout: 180_000,
  },
});
