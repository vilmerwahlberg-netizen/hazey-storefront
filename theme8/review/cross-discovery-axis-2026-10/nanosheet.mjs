// TASK 04A Nano-11-korrigering -- före | efter-blad. "Före" = 04A utan
// Nano-11-bilden (prenano), "efter" = arbetskopian. Modulens vy (lower0) per
// rutt och bredd, plus en kortnivårad ur runs/nano (efter).
// node nanosheet.mjs
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const S = `${DIR}/runs/shots`, N = `${DIR}/runs/nano`, OUT = `${DIR}/proof`; fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch();
const css = `body{margin:0;background:#2b2b2b;color:#f4ece0;font:600 15px/1.3 system-ui}.row{display:flex;gap:18px;padding:16px;align-items:flex-start}.col{flex:1;min-width:0}.col img{width:100%;display:block;border:1px solid #555}h1{font-size:18px;margin:16px 16px 0}p{margin:0 0 6px}`;
async function sheet(name, title, cols, width) {
  const html = `<style>${css}</style><h1>${title}</h1><div class="row">${cols.map(([l, f]) => `<div class="col"><p>${l}</p>${fs.existsSync(f) ? `<img src="file://${f}">` : "<p>(saknas)</p>"}</div>`).join("")}</div>`;
  const tmp = `${DIR}/runs/sheet-${name}.html`; fs.writeFileSync(tmp, html);
  const p = await b.newPage({ viewport: { width, height: 800 } }); await p.goto("file://" + tmp); await p.waitForTimeout(400);
  await p.screenshot({ path: `${OUT}/${name}.jpg`, fullPage: true, type: "jpeg", quality: 78 }); await p.close(); fs.unlinkSync(tmp);
}
const T = { "magic-sauce": "Magic Sauce (seriehubb)", core: "Core (seriehubb)", nano11: "Nano-11 (seriehubb, kontroll: eget kort visas inte)", "ms-buds": "Magic Sauce Buds (serie x format, Nano-11 Buds-kortet)" };
const views = [["magic-sauce", "393"], ["magic-sauce", "1440"], ["core", "393"], ["core", "1440"], ["magic-sauce", "320"], ["core", "320"], ["magic-sauce", "1920"], ["core", "1920"], ["magic-sauce", "1440-z200"], ["core", "1440-z200"], ["nano11", "1440"], ["ms-buds", "393"], ["ms-buds", "1440"]];
for (const [r, w] of views) {
  const n = parseInt(w, 10), z = w.includes("z200");
  await sheet(`nano11-${r}-${w}`, `${T[r]} · ${z ? "200 % zoom" : w + "px"} · före | efter Nano-11-korrigeringen`,
    [["FÖRE (04A, produktbildsfallback)", `${S}/prenano-${r}-${w}-lower0.jpg`], ["EFTER (series-nano11-r3.webp)", `${S}/after-${r}-${w}-lower0.jpg`]], n < 768 ? 900 : 1900);
}
// Kortrad i full upplösning (modulutsnitt), efter.
await sheet("nano11-row-cards", "Nano-11 i raden · modulutsnitt efter korrigeringen", [["Magic Sauce-hubb 1440", `${N}/after-magic-sauce-1440.png`], ["Core-hubb 1440", `${N}/after-core-1440.png`]], 1900);
await sheet("nano11-row-cards-mobile", "Nano-11 i raden · modulutsnitt efter korrigeringen (mobil)", [["Magic Sauce 393", `${N}/after-magic-sauce-393.png`], ["Core 393", `${N}/after-core-393.png`], ["Core 320", `${N}/after-core-320.png`]], 1300);
await b.close(); console.log("ok");
