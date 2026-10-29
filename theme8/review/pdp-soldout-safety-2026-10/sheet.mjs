// TASK 10B-0 -- före | efter-blad ur runs/verify (verify.mjs).
// node sheet.mjs
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const V = `${DIR}/runs/verify`, OUT = `${DIR}/proof`; fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch();
const css = `body{margin:0;background:#2b2b2b;color:#f4ece0;font:600 15px/1.3 system-ui}.row{display:flex;gap:18px;padding:16px;align-items:flex-start}.col{flex:1;min-width:0}.col img{width:100%;display:block;border:1px solid #555}h1{font-size:18px;margin:16px 16px 0}p{margin:0 0 6px}`;
async function sheet(name, title, cols, width) {
  const html = `<style>${css}</style><h1>${title}</h1><div class="row">${cols.map(([l, f]) => `<div class="col"><p>${l}</p>${fs.existsSync(f) ? `<img src="file://${f}">` : "<p>(saknas)</p>"}</div>`).join("")}</div>`;
  const tmp = `${DIR}/runs/sheet-${name}.html`; fs.writeFileSync(tmp, html);
  const p = await b.newPage({ viewport: { width, height: 800 } }); await p.goto("file://" + tmp); await p.waitForTimeout(400);
  await p.screenshot({ path: `${OUT}/${name}.jpg`, fullPage: true, type: "jpeg", quality: 74 }); await p.close(); fs.unlinkSync(tmp);
}
const T = { 17: "Great White Shark (id 17, slutsåld, storleksvarianter)", 20: "Fraktändring (id 20, köpbar med 0 i lager)", 15: "THC-H 500 puffs (id 15, köpbar med 0 i lager)", 58: "Bangkok pre-roll (id 58, slutsåld, Task 10A X1)" };
for (const id of [17, 20, 15, 58]) for (const w of [393, 1440]) {
  const f = (wh, part) => `${V}/${wh}-soldout-${id}-${w}-${part}.jpg`;
  await sheet(`soldout-${id}-${w}`, `${T[id]} · ${w}px · köpstation och nedscrollat läge (mobilens köpbar)`,
    [["FÖRE · köpstation", f("before", "station")], ["EFTER · köpstation", f("after", "station")], ["FÖRE · nedscrollat", f("before", "scrolled")], ["EFTER · nedscrollat", f("after", "scrolled")]], w < 768 ? 1700 : 1900);
}
for (const id of [91, 78]) for (const w of [393, 1440]) {
  const f = (wh, part) => `${V}/${wh}-variant-out-${id}-${w}-${part}.jpg`;
  await sheet(`variant-out-${id}-${w}`, `Delvis slutsåld (id ${id}) · slutsåld variant vald · ${w}px`,
    [["FÖRE · köpstation", f("before", "station")], ["EFTER · köpstation", f("after", "station")], ["FÖRE · nedscrollat", f("before", "scrolled")], ["EFTER · nedscrollat", f("after", "scrolled")]], w < 768 ? 1700 : 1900);
}
for (const w of [393, 1440]) await sheet(`stale-${w}`, `Samurai Jack (id 84) tar slut efter sidladdning · ${w}px · efter köpförsök`,
  [["FÖRE · product/state 0 i lager", `${V}/before-stale-state-zero-${w}.jpg`], ["EFTER · product/state 0 i lager", `${V}/after-stale-state-zero-${w}.jpg`], ["FÖRE · köpknappen borttagen", `${V}/before-stale-button-removed-${w}.jpg`], ["EFTER · köpknappen borttagen", `${V}/after-stale-button-removed-${w}.jpg`]], w < 768 ? 1700 : 1900);
for (const id of [84, 87]) for (const w of [393, 1440]) {
  const f = (wh, part) => `${V}/${wh}-instock-${id}-${w}-${part}.jpg`;
  await sheet(`instock-${id}-${w}`, `I lager (id ${id}${id === 87 ? ", varianter" : ", enkel"}) · ${w}px · kontroll: oförändrad`,
    [["FÖRE · köpstation", f("before", "station")], ["EFTER · köpstation", f("after", "station")], ["FÖRE · nedscrollat", f("before", "scrolled")], ["EFTER · nedscrollat", f("after", "scrolled")]], w < 768 ? 1700 : 1900);
}
await b.close(); console.log(fs.readdirSync(OUT).length, "blad");
