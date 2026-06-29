import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";

// Load e2e/.env if present (base URLs + test credentials).
dotenv.config();

const WEB_BASE_URL = process.env.WEB_BASE_URL ?? "http://localhost:3000";
const ADMIN_BASE_URL = process.env.ADMIN_BASE_URL ?? "http://localhost:5173";

/**
 * Behavior-parity suite. Run this BEFORE the monorepo migration to capture the
 * baseline (`pnpm baseline:update` to seed visual snapshots), then re-run AFTER the
 * migration — a green run proves the apps still behave as they used to.
 *
 * Base URLs and credentials are env-driven (see e2e/.env.example) so the suite is
 * independent of where/how the apps are served.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["list"],
  ],
  // Visual baselines live here; committed so post-migration diffs are detectable.
  snapshotDir: "./snapshots",
  use: {
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  expect: {
    // Allow tiny rendering deltas across machines while catching real regressions.
    toHaveScreenshot: { maxDiffPixelRatio: 0.02 },
  },
  projects: [
    {
      name: "web",
      testDir: "./tests/web",
      use: { ...devices["Desktop Chrome"], baseURL: WEB_BASE_URL },
    },
    {
      name: "admin",
      testDir: "./tests/admin",
      use: { ...devices["Desktop Chrome"], baseURL: ADMIN_BASE_URL },
    },
  ],
});
