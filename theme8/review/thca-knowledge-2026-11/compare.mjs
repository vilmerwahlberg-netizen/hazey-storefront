// Sida vid sida: vald designreferens (AI-bild: ljus, material, rytm -- inte
// produktdata eller text) | riktig webbläsarvy. Kör efter verify.mjs.
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const REF = "/Users/wahlberg/HZY/design/thca-knowledge-2026-11-15";
const file = f => { const w = f.replace(/\.png$/, ".webp"); const g = fs.existsSync(f) ? f : w; return `data:image/${g.endsWith(".webp") ? "webp" : "png"};base64,` + fs.readFileSync(g).toString("base64"); };
const shot = n => file(path.join(DIR, "shots", n + ".png")); // .webp om png saknas
// [nyckel, rubrik, referens, byggd, beskärning av byggd (css-px * dpr), skala referens till byggd bredd]
const SHEETS = [
  ["393-fold", "Första skärmen 393 × 852 (iPhone 16): referens | riktig webbläsare", "koncept-c-iphone16-393x852.png", "thca-393-fold", null],
  ["1440-fold", "Första skärmen 1440 × 900: referens (beskuren till 900 px höjd) | riktig webbläsare", "koncept-c-hybrid-desktop.png", "thca-1440-fold", null, [0, 0, 1487, 930]],
  ["1440-topp", "Övre delen 1440: referens hel | byggd sida till och med alternativen", "koncept-c-hybrid-desktop.png", "thca-1440-full", [0, 0, 1440, 1520]],
  ["393-helsida", "Mobil helsida: rytmreferens (koncept-c-hybrid-mobil-v2, inte måttfacit) | byggd sida", "koncept-c-hybrid-mobil-v2.png", "thca-393-full", null]
];
const b = await chromium.launch({ channel: "chrome" }); const p = await b.newPage({ viewport: { width: 2000, height: 900 } });
for (const [key, title, ref, built, crop, refCrop] of SHEETS) {
  const W = key.startsWith("393") ? 1100 : 2000;
  const cols = [["Referens (AI-bild, inte produktdata)", file(path.join(REF, ref)), refCrop || null], ["Byggd (riktig data, " + new Date().toISOString().slice(0, 10) + ")", shot(built), crop]];
  await p.setViewportSize({ width: W, height: 900 });
  await p.setContent(`<body style="margin:0;padding:16px;background:#222;color:#eee;font:600 18px Helvetica;width:${W}px;box-sizing:border-box"><div style="margin:0 0 12px">${title}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start">${cols.map(([t]) => `<figure style="margin:0"><figcaption style="margin:0 0 8px;font-weight:400">${t}</figcaption><canvas style="width:100%;display:block"></canvas></figure>`).join("")}</div></body>`);
  await p.evaluate(async cols => {
    const cs = document.querySelectorAll("canvas");
    for (let n = 0; n < cols.length; n++) {
      const [, src, crop] = cols[n]; const i = new Image(); i.src = src; await i.decode();
      const [x, y, w, h] = crop || [0, 0, i.width, i.height]; const hh = Math.min(h, i.height - y); const c = cs[n]; c.width = w; c.height = hh; c.getContext("2d").drawImage(i, x, y, w, hh, 0, 0, w, hh);
    }
  }, cols);
  await p.screenshot({ path: path.join(DIR, `shots/jamfor-${key}.png`), fullPage: true });
}
await b.close();
