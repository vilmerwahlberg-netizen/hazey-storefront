import { defineConfig } from "@playwright/test";

// Visual-parity harness config. Everything here is read-only against both
// the local facit server (localhost:8765) and the real, live Nyehandel
// storefront (same injected-CSS/JS method as preview.mjs) — nothing here
// writes to Nyehandel admin or publishes anything. See tests/parity-sections.mjs
// for the section map and README-level notes in the task/session report.
export default defineConfig({
  testDir: "./tests",
  testMatch: /.*\.spec\.mjs/,
  outputDir: "./tests/results/.pw-artifacts",
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [
    ["list"],
    ["html", { outputFolder: "tests/results/html-report", open: "never" }],
    ["json", { outputFile: "tests/results/report.json" }],
  ],
  use: {
    channel: "chrome",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    trace: "off",
    screenshot: "off",
    video: "off",
  },
});
