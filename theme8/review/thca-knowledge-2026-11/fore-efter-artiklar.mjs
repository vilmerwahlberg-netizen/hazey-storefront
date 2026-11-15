// Före/efter för "Läs mer om THCA" (Nano11-artikeln lyfts inte fram).
// Kör: BEFORE=<mapp med tidigare shots> node fore-efter-artiklar.mjs (efter verify.mjs).
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname); const BEFORE = process.env.BEFORE;
const img = f => { const w = f.replace(/\.png$/, ".webp"); const g = fs.existsSync(f) ? f : w; return `data:image/${g.endsWith(".webp") ? "webp" : "png"};base64,` + fs.readFileSync(g).toString("base64"); };
const b = await chromium.launch({ channel: "chrome" }); const p = await b.newPage({ viewport: { width: 1600, height: 900 } });
for (const w of ["393", "1440"]) {
  const W = w === "393" ? 1100 : 2000;
  const cols = [["Före (ddeb747): tre artiklar inkl. Nano11", img(path.join(BEFORE, `thca-${w}-nedre.png`))], ["Efter: två THCA-artiklar", img(path.join(DIR, "shots", `thca-${w}-nedre.png`))]];
  await p.setViewportSize({ width: W, height: 900 });
  await p.setContent(`<body style="margin:0;padding:16px;background:#222;color:#eee;font:600 18px Helvetica;width:${W}px;box-sizing:border-box"><div style="margin:0 0 12px">Nedre delen ${w} px: sortiment, Läs mer om THCA, FAQ, sidfot</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start">${cols.map(([t, s]) => `<figure style="margin:0"><figcaption style="margin:0 0 8px;font-weight:400">${t}</figcaption><img style="width:100%;display:block" src="${s}"></figure>`).join("")}</div></body>`);
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(DIR, `shots/fore-efter-artiklar-${w}.png`), fullPage: true });
}
await b.close();
