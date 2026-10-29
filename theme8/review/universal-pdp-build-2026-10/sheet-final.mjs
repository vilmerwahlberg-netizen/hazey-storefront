// TASK 10B-R1 -- proof/final-correction/: endast nödvändiga blad.
// node sheet-final.mjs
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const SH = `${DIR}/runs/shots`, OUT = `${DIR}/proof/final-correction`; fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch();
const css = `body{margin:0;background:#2b2b2b;color:#f4ece0;font:600 15px/1.3 system-ui}.row{display:flex;gap:18px;padding:16px;align-items:flex-start}.col{flex:1;min-width:0}.col img{width:100%;display:block;border:1px solid #555}h1{font-size:18px;margin:16px 16px 0}p{margin:0 0 6px}`;
async function sheet(name, title, cols, width) {
  const html = `<style>${css}</style><h1>${title}</h1><div class="row">${cols.map(([l, f]) => `<div class="col"><p>${l}</p>${fs.existsSync(f) ? `<img src="file://${f}">` : "<p>(saknas)</p>"}</div>`).join("")}</div>`;
  const tmp = `${DIR}/runs/sheet-${name}.html`; fs.writeFileSync(tmp, html);
  const p = await b.newPage({ viewport: { width, height: 800 } }); await p.goto("file://" + tmp); await p.waitForTimeout(500);
  await p.screenshot({ path: `${OUT}/${name}.jpg`, fullPage: true, type: "jpeg", quality: 74 }); await p.close(); fs.unlinkSync(tmp);
}
const T = { 91: "Magic Sauce vape (91)", 92: "Magic Sauce cart (92)", 57: "Faraoh (57)", 84: "Samurai Jack, Magic Sauce Buds (84)", 88: "Hazey CBD buds (88)", 17: "Great White Shark, slutsåld (17)" };
for (const id of [91, 92, 57, 84, 88, 17])
  await sheet(`similar-${id}`, `${T[id]} · Liknande / Fler i serien · före (efb5336) | efter`, [["FÖRE 1440", `${SH}/before-similar-${id}-1440.jpg`], ["EFTER 1440", `${SH}/after-similar-${id}-1440.jpg`], ["FÖRE 393", `${SH}/before-similar-${id}-393.jpg`], ["EFTER 393", `${SH}/after-similar-${id}-393.jpg`]], 1900);
await sheet("first-view-1440-a", "Första vy 1440 · efter · 91, 92, 57", [91, 92, 57].map(id => [T[id], `${SH}/after-fc-${id}-1440-first.jpg`]), 1900);
await sheet("first-view-1440-b", "Första vy 1440 · efter · 84, 88 (enkel station), 17 (slutsåld, Bevaka)", [84, 88, 17].map(id => [T[id], `${SH}/after-fc-${id}-1440-first.jpg`]), 1900);
await sheet("first-view-393", "Första vy 393 · efter · 91, 92, 57, 84, 88, 17", [91, 92, 57, 84, 88, 17].map(id => [T[id], `${SH}/after-fc-${id}-393-first.jpg`]), 1900);
await b.close(); console.log(fs.readdirSync(OUT).length, "blad");
