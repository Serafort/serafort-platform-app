import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for E2E authentication tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  // Add additional test directory via project logic or glob
  fullyParallel: true,
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:5173',
    actionTimeout: 15 * 1000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  projects: [
    // Setup project for authentication state
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },

    // New project for Authentication Package E2E
    {
      name: 'auth-package',
      testDir: '../../../Authentication/tests/e2e',
      use: {
        ...devices['Desktop Chrome'],
        // Enable virtual authenticator for passkey tests
        permissions: ['web-authentication'],
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],

  webServer: [
    {
      command: 'npm run dev',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 300 * 1000,
    },
    {
      command: 'cd ../../../Authentication && npm run dev',
      url: 'http://127.0.0.1:3333',
      reuseExistingServer: !process.env.CI,
      timeout: 300 * 1000,
    },
  ],
})
