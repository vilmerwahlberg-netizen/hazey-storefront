// Jämförelseblad: designreferens (AI-bild, bara ljus/material/rytm) | byggd
// sida, för övre och nedre halvan vid 1440 och 393. Kör efter verify.mjs.
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const REF = "/Users/wahlberg/HZY/design/engangsvape-seo-2026-11-15/referenser";
const file = f => { const w = f.replace(/\.png$/, ".webp"); const g = fs.existsSync(f) ? f : w; return `data:image/${g.endsWith(".webp") ? "webp" : "png"};base64,` + fs.readFileSync(g).toString("base64"); };
const shot = n => file(path.join(DIR, "shots", n + ".png"));
// [nyckel, rubrik, referensbild, byggd bild, beskärning av byggd bild (null = hel)]
const SHEETS = [
  ["1440-topp", "Övre halvan 1440: hero, serievägar, storlek", "engangsvape-desktop-koncept.png", "eng-1440-full", [0, 0, 1440, 1240]],
  ["1440-nedre", "Nedre halvan 1440: sortiment, uppslag, serier, analysintyg, FAQ, sidfot", "engangsvape-desktop-nedre-halva.png", "eng-1440-nedre", null],
  ["393-topp", "Övre halvan 393: hero, serievägar, storlek", "engangsvape-mobil-koncept.png", "eng-393-full", [0, 0, 786, 2240]],
  ["393-nedre", "Nedre halvan 393: sortiment till sidfot", "engangsvape-mobil-nedre-halva.png", "eng-393-nedre", null]
];
const b = await chromium.launch({ channel: "chrome" }); const p = await b.newPage({ viewport: { width: 2000, height: 900 } });
for (const [key, title, ref, built, crop] of SHEETS) {
  const W = key.startsWith("393") ? 1100 : 2000;
  const cols = [["Designreferens (AI, inte produktdata)", file(path.join(REF, ref)), null], ["Byggd sida (riktig data, " + new Date().toISOString().slice(0, 10) + ")", shot(built), crop]];
  await p.setViewportSize({ width: W, height: 900 });
  await p.setContent(`<body style="margin:0;padding:16px;background:#222;color:#eee;font:600 18px Helvetica;width:${W}px;box-sizing:border-box"><div style="margin:0 0 12px">${title}</div><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px;align-items:start">${cols.map(([t]) => `<figure style="margin:0"><figcaption style="margin:0 0 8px;font-weight:400">${t}</figcaption><canvas style="width:100%;display:block"></canvas></figure>`).join("")}</div></body>`);
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
