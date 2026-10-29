// TASK 04A -- jämförelseblad (före | efter) ur runs/shots och runs/states.
// node sheet.mjs
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const S = `${DIR}/runs/shots`, ST = `${DIR}/runs/states`, OUT = `${DIR}/proof`; fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch();
const css = `body{margin:0;background:#2b2b2b;color:#f4ece0;font:600 15px/1.3 system-ui}.row{display:flex;gap:18px;padding:16px;align-items:flex-start}.col{flex:1;min-width:0}.col img{width:100%;display:block;border:1px solid #555}h1{font-size:18px;margin:16px 16px 0}p{margin:0 0 6px}`;
async function sheet(name, title, cols, width) {
  const html = `<style>${css}</style><h1>${title}</h1><div class="row">${cols.map(([l, f]) => `<div class="col"><p>${l}</p>${fs.existsSync(f) ? `<img src="file://${f}">` : "<p>(saknas)</p>"}</div>`).join("")}</div>`;
  const tmp = `${DIR}/runs/sheet-${name}.html`; fs.writeFileSync(tmp, html);
  const p = await b.newPage({ viewport: { width, height: 800 } }); await p.goto("file://" + tmp); await p.waitForTimeout(400);
  await p.screenshot({ path: `${OUT}/${name}.jpg`, fullPage: true, type: "jpeg", quality: 74 }); await p.close(); fs.unlinkSync(tmp);
}
const ROUTES = [["m-s-vapes", "Magic Sauce Vapes (dedikerad serie x format)"], ["thcab-vapes", "THCaB Vapes (visuell kontroll)"], ["buds", "Alla Buds (bred formatsida)"], ["hasch", "Allt Hasch (bred formatsida)"], ["hasch-f", "Allt Hasch ?filters=Serie_Magic Sauce (filtrerat brett läge)"], ["alla-vapes", "Alla Vapes (bred formatsida)"], ["magic-sauce", "Magic Sauce (seriehubb)"], ["thcab", "THCaB (seriehubb)"], ["core", "Core (seriehubb)"]];
// Modulens vy (lower0) och fortsättningen genom footern (lower1..), före | efter.
for (const [r, t] of ROUTES) for (const w of [393, 1440, 1920]) {
  const parts = [0, 1, 2, 3].filter(i => fs.existsSync(`${S}/before-${r}-${w}-lower${i}.jpg`) || fs.existsSync(`${S}/after-${r}-${w}-lower${i}.jpg`));
  const stack = async (which) => {
    const f = `${DIR}/runs/stack-${which}-${r}-${w}.html`;
    fs.writeFileSync(f, `<style>body{margin:0}img{display:block;width:100%}</style>` + parts.map(i => `<img src="file://${S}/${which}-${r}-${w}-lower${i}.jpg">`).join(""));
    const p = await b.newPage({ viewport: { width: w, height: 800 } }); await p.goto("file://" + f); await p.waitForTimeout(300);
    const out = `${DIR}/runs/stack-${which}-${r}-${w}.jpg`; await p.screenshot({ path: out, fullPage: true, type: "jpeg", quality: 72 }); await p.close(); fs.unlinkSync(f); return out;
  };
  const a = await stack("before"), c = await stack("after");
  await sheet(`lower-${r}-${w}`, `${t} · ${w}px · nedre del genom footern`, [["FÖRE (4a19a16)", a], ["EFTER (arbetskopia)", c]], w < 768 ? 900 : 1900);
}
// Helsidor (genom footern), före | efter.
for (const [r, t] of ROUTES.slice(0, 7)) for (const w of [393, 1440]) await sheet(`full-${r}-${w}`, `${t} · ${w}px · helsida`, [["FÖRE", `${S}/before-${r}-${w}-full.jpg`], ["EFTER", `${S}/after-${r}-${w}-full.jpg`]], w < 768 ? 900 : 1900);
// 320 och 200 %.
for (const [r, t] of ROUTES.filter(x => ["m-s-vapes", "buds", "magic-sauce"].includes(x[0]))) {
  await sheet(`lower-${r}-320`, `${t} · 320px`, [["FÖRE", `${S}/before-${r}-320-lower0.jpg`], ["EFTER", `${S}/after-${r}-320-lower0.jpg`]], 760);
  await sheet(`lower-${r}-1440-z200`, `${t} · 200 % zoom`, [["FÖRE", `${S}/before-${r}-1440-z200-lower0.jpg`], ["EFTER", `${S}/after-${r}-1440-z200-lower0.jpg`]], 1500);
}
// Destinationstillstånd.
for (const w of [393, 1440]) {
  await sheet(`states-real-${w}`, `THCaB Vapes · ${w}px · 3, 2, 1, 0 riktiga destinationer (strypta via nätet)`, [3, 2, 1, 0].map(n => [`${n} kvar`, `${ST}/thcab-vapes-${n}dest-${w}.jpg`]), w < 768 ? 1700 : 1900);
  await sheet(`states-fixture-${w}`, `Fixturer · ${w}px · 4, 6 och långa namn`, [["4", `${ST}/fixture-4-${w}.png`], ["6 (kanten tonar)", `${ST}/fixture-6-${w}.png`], ["Långa namn", `${ST}/fixture-long-${w}.png`]], w < 768 ? 1400 : 1900);
}
await b.close(); console.log(fs.readdirSync(OUT).length, "blad");
