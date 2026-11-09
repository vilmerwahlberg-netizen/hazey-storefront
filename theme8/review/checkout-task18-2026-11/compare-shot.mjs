// Renderar compare.html-sektionerna som PNG i verklig storlek (mobil i 2x för skärpa).
import { chromium } from "playwright"; import path from "node:path";
const d = path.dirname(new URL(import.meta.url).pathname); const b = await chromium.launch();
for (const [id, dpr] of [["m-fold", 2], ["m-full", 2], ["d-fold", 1], ["d-full", 1], ["d-dev", 1]]) {
  const p = await b.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: dpr });
  await p.goto("file://" + d + "/compare.html"); await p.waitForLoadState("load"); await p.waitForTimeout(500);
  await p.locator("#" + id).screenshot({ path: `${d}/compare-${id}.png` }); await p.close();
}
await b.close();
