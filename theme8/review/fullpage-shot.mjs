import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto("file:///Users/wahlberg/HZY/hemsidor/hazey-storefront/theme8/review/hero-pilot.html");
await page.waitForTimeout(3200);
const height = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < height; y += 520) {
  await page.evaluate((nextY) => window.scrollTo(0, nextY), y);
  await page.waitForTimeout(180);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(1200);
const diagnostics = await page.evaluate(() => ({
  width: window.innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  scrollHeight: document.documentElement.scrollHeight,
  modules: window.__HZ8_DIAGNOSTICS__?.modules || []
}));
console.log(JSON.stringify(diagnostics));
await page.screenshot({ path: "/private/tmp/hz8-home-full-1440-scrolled.png", fullPage: true });
await browser.close();
