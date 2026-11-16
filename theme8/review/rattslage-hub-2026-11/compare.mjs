// Jämförelseblad för rättslägeshubben: skissen (rattslageshubb.png), gamla
// WooCommerce-sidan (old-page.mjs, shots/gamla-*.png) och den nya
// sidan, första vyn och hela sidan vid 393 × 852 och 1440 × 900. Kör efter verify.mjs.
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const SHOTS = path.join(DIR, "shots");
const DESIGN = "/Users/wahlberg/HZY/design/kunskap-rattslage-2026-11-16";
const img = f => { const g = fs.existsSync(f) ? f : f.replace(/\.png$/, ".webp"); return `data:image/${g.endsWith(".webp") ? "webp" : "png"};base64,` + fs.readFileSync(g).toString("base64"); };
const FORE = path.join(SHOTS, "fore-mobil");
const AVV = path.join(SHOTS, "avvisad");
const R2 = [
  ["r2-393-fold", "Mobilhero R2, 393 × 852: skiss · avvisad (87577a3) · ny", 1500, [["Skiss (telefonen)", img(path.join(DESIGN, "rattslageshubb.png")), [0.735, 0.08, 0.235, 0.84]], ["Avvisad: fade över bilden", img(path.join(AVV, "hub-393-fold.webp"))], ["Ny: papper + skarpt bildband", img(path.join(SHOTS, "hub-393-fold.png"))]]],
  ["r2-430-fold", "430 × 932: avvisad · ny", 1100, [["Avvisad", img(path.join(AVV, "hub-430-fold.webp"))], ["Ny", img(path.join(SHOTS, "hub-430-fold.png"))]]],
  ["r2-1440-fold", "1440 × 900: avvisad (havsbild) · ny (kustljus)", 2400, [["Avvisad", img(path.join(AVV, "hub-1440-fold.webp"))], ["Ny", img(path.join(SHOTS, "hub-1440-fold.png"))]]],
  ["r2-393-helsida", "393, hela sidan: avvisad · ny", 900, [["Avvisad", img(path.join(AVV, "hub-393-full.webp"))], ["Ny", img(path.join(SHOTS, "hub-393-full.png"))]]]
];
const ONLY_R2 = process.env.R2 === "1";
const SHEETS_ALL = [
  ["korr-393-fold", "Mobilkorrigering: 393 × 852 före · efter · efter med öppnad rad · 430 × 932 efter · 320 × 700 efter", 2600, [["Före (7913ef1)", img(path.join(FORE, "hub-393-fold.webp"))], ["Efter", img(path.join(SHOTS, "hub-393-fold.png"))], ["Efter, rad öppnad med tangentbord", img(path.join(SHOTS, "hub-393-rad-oppen.png"))], ["430 × 932 efter", img(path.join(SHOTS, "hub-430-fold.png"))], ["320 × 700 efter", img(path.join(SHOTS, "hub-320-fold.png"))]]],
  ["korr-1920-fold", "1920 × 1080 första vyn: före · efter (pixelidentiska)", 2600, [["Före", img(path.join(FORE, "hub-1920-fold.webp"))], ["Efter", img(path.join(SHOTS, "hub-1920-fold.png"))]]],
  ["korr-393-helsida", "393, hela sidan: före · efter", 900, [["Före", img(path.join(FORE, "hub-393-full.webp"))], ["Efter", img(path.join(SHOTS, "hub-393-full.png"))]]],
  ["jamfor-1440-fold", "1440 × 900, första vyn: skiss · gamla sidan · ny sida", 2700, [["Skiss (rattslageshubb.png, desktopdelen)", img(path.join(DESIGN, "rattslageshubb.png")), [0.027, 0.09, 0.68, 0.84]], ["Gamla /lagliga-cannabinoider-sverige/", img(path.join(SHOTS, "gamla-1440-fold.png"))], ["Ny sida (Theme 8, fixtur)", img(path.join(SHOTS, "hub-1440-fold.png"))]]],
  ["jamfor-393-fold", "393 × 852, första vyn: skiss · gamla sidan · ny sida", 1500, [["Skiss (telefonen)", img(path.join(DESIGN, "rattslageshubb.png")), [0.735, 0.08, 0.235, 0.84]], ["Gamla sidan", img(path.join(SHOTS, "gamla-393-fold.png"))], ["Ny sida", img(path.join(SHOTS, "hub-393-fold.png"))]]],
  ["jamfor-1440-helsida", "1440, hela sidan: gamla sidan · ny sida", 2000, [["Gamla sidan", img(path.join(SHOTS, "gamla-1440-full.png"))], ["Ny sida", img(path.join(SHOTS, "hub-1440-full.png"))]]],
  ["jamfor-393-helsida", "393, hela sidan: gamla sidan · ny sida · ny sida med öppnad rad (första vyn)", 1500, [["Gamla sidan", img(path.join(SHOTS, "gamla-393-full.png"))], ["Ny sida", img(path.join(SHOTS, "hub-393-full.png"))], ["Ny sida, rad öppnad med tangentbord", img(path.join(SHOTS, "hub-393-rad-oppen.png"))]]]
];
const SHEETS = ONLY_R2 ? R2 : [...R2, ...SHEETS_ALL];
const b = await chromium.launch({ channel: "chrome" }); const p = await b.newPage({ viewport: { width: 2000, height: 900 } });
for (const [key, title, W, cols] of SHEETS) {
  await p.setViewportSize({ width: W, height: 900 });
  await p.setContent(`<body style="margin:0;padding:16px;background:#222;color:#eee;font:600 18px Helvetica;width:${W}px;box-sizing:border-box"><div style="margin:0 0 12px">${title}</div><div style="display:grid;grid-template-columns:repeat(${cols.length},1fr);gap:16px;align-items:start">${cols.map(([t]) => `<figure style="margin:0"><figcaption style="margin:0 0 8px;font-weight:400">${t}</figcaption><canvas style="width:100%;display:block"></canvas></figure>`).join("")}</div></body>`);
  await p.evaluate(async cols => {
    const cs = document.querySelectorAll("canvas");
    for (let n = 0; n < cols.length; n++) {
      const [, src, crop] = cols[n]; const i = new Image(); i.src = src; await i.decode();
      // crop: [x, y, w, h] som andel av bredden/höjden; h > 1 = höjd i CSS-px av en bild i full bredd
      let sx = 0, sy = 0, sw = i.width, sh = i.height;
      if (crop) { sx = crop[0] * i.width; sy = crop[1] * i.height; sw = crop[2] * i.width; sh = crop[3] * i.height; }
      const c = cs[n]; c.width = sw; c.height = sh; c.getContext("2d").drawImage(i, sx, sy, sw, sh, 0, 0, sw, sh);
    }
  }, cols);
  await p.screenshot({ path: path.join(SHOTS, `${key}.png`), fullPage: true });
}
await b.close();
