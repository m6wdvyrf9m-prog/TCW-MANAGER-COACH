import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  workers: 1,
  expect: {
    timeout: 10_000
  },
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure"
  },
  webServer: {
    command:
      "E2E_IN_MEMORY=1 OPENAI_MODEL=test-model TCW_FILE_STORE_PATH=.data/e2e-coach-sessions.json NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000 ADMIN_USERNAME=admin ADMIN_PASSWORD_HASH='$2b$12$peVZoysAWKHAw2bYQg6UCOWRrFNtb5URd/0fBHdZAnwafslqGL.2G' ADMIN_SESSION_SECRET='test-session-secret-with-more-than-32-chars' pnpm exec next start -H 127.0.0.1 -p 3000",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1100 } } },
    { name: "mobile", use: { ...devices["Desktop Chrome"], viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } }
  ]
});
