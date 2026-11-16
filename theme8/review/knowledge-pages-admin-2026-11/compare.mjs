// Jämförelseblad för de riktiga Content-sidorna i Theme 8-preview: THCB | THCH | HHC
// sida vid sida, första vyn och hela sidan vid 393 × 852 och 1440 × 900. Kör efter check-live.mjs.
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const SHOTS = path.join(DIR, "shots");
const file = f => { const w = f.replace(/\.png$/, ".webp"); const g = fs.existsSync(f) ? f : w; return `data:image/${g.endsWith(".webp") ? "webp" : "png"};base64,` + fs.readFileSync(g).toString("base64"); };
const shot = n => file(path.join(SHOTS, n + ".png"));
const SHEETS = [
  ["familj-393-fold", "Riktig sida i preview · Första vyn 393 × 852: THCB | THCH | HHC", 1500, "393-fold"],
  ["familj-1440-fold", "Riktig sida i preview · Första vyn 1440 × 900: THCB | THCH | HHC", 2400, "1440-fold"],
  ["familj-393-helsida", "Riktig sida i preview · Hela sidan 393: THCB | THCH | HHC", 1500, "393-full"],
  ["familj-1440-helsida", "Riktig sida i preview · Hela sidan 1440: THCB | THCH | HHC", 2400, "1440-full"]
];
const b = await chromium.launch({ channel: "chrome" }); const p = await b.newPage({ viewport: { width: 2000, height: 900 } });
for (const [key, title, W, suffix] of SHEETS) {
  const cols = ["thcb", "thch", "hhc"].map(s => [s.toUpperCase(), shot(`${s}-${suffix}`)]);
  await p.setViewportSize({ width: W, height: 900 });
  await p.setContent(`<body style="margin:0;padding:16px;background:#222;color:#eee;font:600 18px Helvetica;width:${W}px;box-sizing:border-box"><div style="margin:0 0 12px">${title}</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;align-items:start">${cols.map(([t]) => `<figure style="margin:0"><figcaption style="margin:0 0 8px;font-weight:400">${t}</figcaption><canvas style="width:100%;display:block"></canvas></figure>`).join("")}</div></body>`);
  await p.evaluate(async cols => {
    const cs = document.querySelectorAll("canvas");
    for (let n = 0; n < cols.length; n++) { const i = new Image(); i.src = cols[n][1]; await i.decode(); const c = cs[n]; c.width = i.width; c.height = i.height; c.getContext("2d").drawImage(i, 0, 0); }
  }, cols);
  await p.screenshot({ path: path.join(SHOTS, `${key}.png`), fullPage: true });
}
await b.close();
