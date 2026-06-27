import { defineConfig, devices } from '@playwright/test';

/* eslint-disable @microsoft/sdl/no-insecure-url -- loopback-only ng serve and Prism mock */
const repoRoot = '..';

/**
 * E2E tests run against ng serve with a Prism mock for `/api` (port 3001).
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
    baseURL: 'http://127.0.0.1:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: `node ${repoRoot}/scripts/bundle-openapi-prism.cjs && npx prism mock ${repoRoot}/backend/openapi/openapi.prism.yaml -p 3001 -h 127.0.0.1`,
      url: 'http://127.0.0.1:3001/api/health',
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000,
    },
    {
      command:
        'npx ng serve --host 127.0.0.1 --port 4200 --configuration development',
      url: 'http://127.0.0.1:4200',
      reuseExistingServer: !process.env['CI'],
      timeout: 180_000,
    },
  ],
});
