import { chromium } from "playwright"; import path from "node:path";
const d = path.dirname(new URL(import.meta.url).pathname); const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1000, height: 1000 }, deviceScaleFactor: 2 });
await p.goto("file://" + d + "/final-mobile.html"); await p.waitForLoadState("load"); await p.waitForTimeout(500);
await p.locator("#final").screenshot({ path: d + "/FINAL-mobile-393-fore-efter.png" }); await b.close();
