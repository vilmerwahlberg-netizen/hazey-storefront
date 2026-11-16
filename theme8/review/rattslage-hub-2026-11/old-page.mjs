// Gamla WooCommerce-sidan /lagliga-cannabinoider-sverige/ (bara läsning): första
// vy och hel sida vid 393 × 852 och 1440 × 900, som underlag för jämförelsebladen.
import { chromium } from "playwright"; import path from "node:path";
const SHOTS = path.join(path.dirname(new URL(import.meta.url).pathname), "shots");
const b = await chromium.launch({ channel: "chrome" });
for (const [w, h] of [[393, 852], [1440, 900]]) {
  const m = w < 768; const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: m ? 2 : 1, isMobile: m, hasTouch: m });
  const p = await ctx.newPage(); await p.goto("https://www.hazey.se/lagliga-cannabinoider-sverige/", { waitUntil: "load", timeout: 60000 });
  await p.waitForTimeout(3000);
  await p.screenshot({ path: path.join(SHOTS, `gamla-${w}-fold.png`) });
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } scrollTo(0, 0); });
  await p.waitForTimeout(1000); await p.screenshot({ path: path.join(SHOTS, `gamla-${w}-full.png`), fullPage: true });
  await ctx.close();
}
await b.close();
