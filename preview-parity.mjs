// Stegvis scroll-jämförelse (INTE fullPage — se CLAUDE.md om varför
// fullPage/"Capture full size screenshot" ger falska tomrum p.g.a.
// reveal-on-scroll). Tar riktiga viewport-skärmdumpar av facit
// (localhost:8765) och av vår version (riktiga sajten + injicerad
// hazey.css/hazey.min.js) sida vid sida, vid 390/430/600px bredd.
// Skrivskyddat mot den riktiga sajten (samma metod som preview.mjs).
import { chromium } from "playwright";
import fs from "fs";

const css = fs.readFileSync("hazey.css", "utf8");
const js = fs.readFileSync("hazey.min.js", "utf8");
const WIDTHS = [390, 430, 600];
const STEP = 900;
const MAX_STEPS = 9;

fs.mkdirSync("preview/parity", { recursive: true });

async function acceptCookies(p) {
  for (const t of ["Godkänn alla", "Godkänn", "Acceptera alla"]) {
    try { await p.click(`button:has-text("${t}")`, { timeout: 800 }); break; } catch (e) {}
  }
}

async function steppedScroll(page, width, prefix) {
  await page.setViewportSize({ width, height: 900 });
  await page.waitForTimeout(300);
  const height = await page.evaluate(() => document.body.scrollHeight);
  const steps = Math.min(MAX_STEPS, Math.ceil(height / STEP) + 1);
  for (let i = 0; i < steps; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * STEP);
    await page.waitForTimeout(650); // låt reveal-on-scroll hinna trigga på riktigt
    await page.screenshot({ path: `preview/parity/${prefix}-w${width}-s${i}.png` });
  }
  return { height, steps };
}

const browser = await chromium.launch({ channel: "chrome", headless: false });

// 1) Facit
const facitPage = await browser.newPage({ deviceScaleFactor: 1 });
await facitPage.goto("http://localhost:8765/index.html", { waitUntil: "networkidle", timeout: 20000 });
for (const w of WIDTHS) {
  const r = await steppedScroll(facitPage, w, "facit");
  console.log(`facit w${w}: height=${r.height} steps=${r.steps}`);
}
await facitPage.close();

// 2) Vår version (riktig sajt + injicerad kod)
const oursPage = await browser.newPage({ deviceScaleFactor: 1 });
oursPage.on("pageerror", (err) => console.log("[pageerror]", err.message));
await oursPage.goto("https://hazeyse.nyehandel.se/", { waitUntil: "networkidle", timeout: 45000 });
await oursPage.waitForTimeout(1200);
await acceptCookies(oursPage);
await oursPage.addStyleTag({ content: css });
await oursPage.addScriptTag({ content: js });
await oursPage.waitForTimeout(900);
for (const w of WIDTHS) {
  const r = await steppedScroll(oursPage, w, "ours");
  console.log(`ours w${w}: height=${r.height} steps=${r.steps}`);
}
await oursPage.close();

await browser.close();
console.log("Klart. Bilder i preview/parity/.");
