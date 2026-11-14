// Jämförelseblad: koncept B | avvisat nuläge (eb477bb) | ombyggnad. Kör efter verify.mjs.
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const REF = "/Users/wahlberg/HZY/design/thcx-mall-2026-11-13/visual-redesign/assets/reference/koncept-b-produktnara.png";
// Läser .png (färsk verify-körning) eller incheckad .webp.
const img = f => { const w = f.replace(/\.png$/, ".webp"); const g = fs.existsSync(f) ? f : w; return `data:image/${g.endsWith(".webp") ? "webp" : "png"};base64,` + fs.readFileSync(g).toString("base64"); };
const sheets = [
  ["compare-1440-fold", [["Koncept B (desktopdelen)", img(REF), "object-position:0 0;object-fit:cover;aspect-ratio:1136/1010"], ["Avvisat nuläge eb477bb", img(path.join(DIR, "before-eb477bb/thcx-1440-fold.png"))], ["Ombyggnad", img(path.join(DIR, "shots/thcx-1440-fold.png"))]], 1440],
  ["compare-393-fold", [["Koncept B (mobil, ritad telefon)", img(REF), "object-position:100% 0;object-fit:cover;aspect-ratio:380/1010"], ["Avvisat nuläge eb477bb", img(path.join(DIR, "before-eb477bb/thcx-393-fold.png"))], ["Ombyggnad", img(path.join(DIR, "shots/thcx-393-fold.png"))]], 393]
];
const b = await chromium.launch({ channel: "chrome" }); const p = await b.newPage({ viewport: { width: 2400, height: 900 } });
for (const [name, cols, w] of sheets) {
  await p.setContent(`<body style="margin:0;padding:16px;background:#222;color:#eee;font:600 18px Helvetica;display:grid;grid-template-columns:repeat(3,1fr);gap:16px;width:${w < 500 ? 1200 : 2400}px;box-sizing:border-box">${cols.map(([t, s, st]) => `<figure style="margin:0"><figcaption style="margin:0 0 8px">${t}</figcaption><img src="${s}" style="width:100%;display:block;${st || ""}"></figure>`).join("")}</body>`);
  await p.setViewportSize({ width: w < 500 ? 1200 : 2400, height: 900 });
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(DIR, `shots/${name}.png`), fullPage: true });
}
await b.close();
