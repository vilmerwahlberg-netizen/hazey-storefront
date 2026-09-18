import { chromium } from "playwright";

const [targetUrl, referencePath, outputPath, widthRaw, heightRaw] = process.argv.slice(2);
const width = Number(widthRaw);
const height = Number(heightRaw);
if (!targetUrl || !referencePath || !outputPath || !width || !height) throw new Error("Usage: overlay-shot.mjs URL REFERENCE OUTPUT WIDTH HEIGHT");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
await page.goto(targetUrl, { waitUntil: "networkidle" });
await page.waitForTimeout(2800);
const documentHeight = await page.evaluate(() => document.documentElement.scrollHeight);
for (let y = 0; y < documentHeight; y += Math.max(320, Math.round(height * .6))) {
  await page.evaluate((nextY) => window.scrollTo(0, nextY), y);
  await page.waitForTimeout(120);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(700);
await page.evaluate((src) => {
  const overlay = document.createElement("img");
  overlay.src = src;
  overlay.alt = "";
  overlay.style.cssText = "position:absolute;z-index:2147483647;left:0;top:0;width:100%;height:auto;opacity:.5;pointer-events:none";
  document.body.appendChild(overlay);
}, `file://${referencePath}`);
await page.waitForTimeout(400);
await page.screenshot({ path: outputPath, fullPage: true });
await browser.close();
