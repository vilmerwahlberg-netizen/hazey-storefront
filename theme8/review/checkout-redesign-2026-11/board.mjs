// Jämförelsetavlor ur shots/ (samma korg, samma kassa): compare-393.jpg, compare-393-full.jpg, compare-1440.jpg.
import fs from "node:fs"; import path from "node:path"; import { chromium } from "playwright";
const DIR = path.dirname(new URL(import.meta.url).pathname); const S = path.join(DIR, "shots");
const L = { native: "Nyehandel nativ (ingen Theme 8-kassa)", today: "Previewn idag (gammalt block i CSS-fältet)", t18: "2e7004b – underkänd", A: "A · Kvittot", B: "B · Olivramen" };
const page = (cols, kind, w, colW, title) => `<!doctype html><meta charset=utf-8><style>body{margin:0;padding:24px;background:#2a2a24;font:600 15px/1.3 Helvetica,Arial;color:#f3efe6}h1{margin:0 0 16px;font:600 20px/1.2 Georgia}
.g{display:flex;flex-wrap:wrap;gap:20px;align-items:flex-start}.c{width:${colW}px}.c p{margin:0 0 8px}.c.hl p{color:#ffc78f}img{width:100%;display:block;border-radius:6px;box-shadow:0 0 0 1px #555}</style>
<h1>${title}</h1><div class=g>${cols.map(k => `<div class="c${k === "A" || k === "B" ? " hl" : ""}"><p>${L[k]}</p><img src="file://${S}/${k}-${w}-${kind}.png"></div>`).join("")}</div>`;
const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 1 });
for (const [name, cols, kind, w, colW, vw, title] of [
  ["compare-393", ["native", "today", "t18", "A", "B"], "fold", 393, 393, 2120, "393 × 852 · första vyn · samma korg (3-pack + 1 st, 2 223 kr)"],
  ["compare-393-full", ["native", "A", "B"], "full", 393, 393, 1300, "393 · hela sidan"],
  ["compare-1440", ["native", "A", "B"], "fold", 1440, 1152, 1200, "1440 × 900 · första vyn (80 %)"],
  ["compare-1440-full", ["native", "A", "B"], "full", 1440, 720, 2280, "1440 · hela sidan (halv skala)"]]) {
  fs.writeFileSync(path.join(DIR, name + ".html"), page(cols, kind, w, colW, title));
  await p.setViewportSize({ width: vw, height: 800 }); await p.goto("file://" + path.join(DIR, name + ".html")); await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(DIR, name + ".jpg"), fullPage: true, type: "jpeg", quality: 82 });
}
await b.close(); console.log("ok");
