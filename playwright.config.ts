import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5173/traceable-clinical-summary/',
    headless: true,
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173/traceable-clinical-summary/',
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
});
