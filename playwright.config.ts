import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const baseURL =
  process.env.BASE_URL ?? 'https://uae.sdgstage.com/';

const isCI = process.env.CI === 'true';

export default defineConfig({
  testDir: './tests',

  fullyParallel: false,

  forbidOnly: isCI,

  retries: isCI ? 1 : 0,

  workers: isCI ? 1 : undefined,

  timeout: 45_000,

  expect: {
    timeout: 10_000,
  },

  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: 'playwright-report',
        open: 'never',
      },
    ],
  ],

  use: {
  baseURL,

  headless: process.env.HEADLESS !== 'false',

  httpCredentials:
    process.env.BASIC_AUTH_USERNAME && process.env.BASIC_AUTH_PASSWORD
      ? {
          username: process.env.BASIC_AUTH_USERNAME,
          password: process.env.BASIC_AUTH_PASSWORD,
        }
      : undefined,

  actionTimeout: 15_000,

  navigationTimeout: 30_000,

  screenshot: 'only-on-failure',

  video: 'retain-on-failure',

  trace: 'on-first-retry',

  colorScheme: 'light',
},

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    }/*,

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
    },*/
  ],

  outputDir: 'test-results/',
});