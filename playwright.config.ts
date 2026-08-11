import { defineConfig } from "@playwright/test";
import { tmpdir } from "node:os";
import { join } from "node:path";

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:4173/GFI-timer/",
    trace: "on-first-retry",
    launchOptions: {
      args: ["--disable-logging"],
      env: {
        CHROME_LOG_FILE: join(tmpdir(), "gfi-timer-chromium.log")
      }
    }
  },
  projects: [
    {
      name: "desktop-chromium",
      use: {
        browserName: "chromium",
        viewport: { width: 1280, height: 900 }
      }
    },
    {
      name: "iphone-compact-chromium",
      use: {
        browserName: "chromium",
        viewport: { width: 390, height: 844 },
        hasTouch: true,
        isMobile: true
      }
    },
    {
      name: "iphone-15-pro-max-chromium",
      use: {
        browserName: "chromium",
        viewport: { width: 430, height: 932 },
        hasTouch: true,
        isMobile: true
      }
    }
  ]
});
