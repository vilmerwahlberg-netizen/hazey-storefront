// Jämförelseblad: koncept B (beskuret) | före | efter, för hero + produktkort
// och uppslag + FAQ vid 393 och 1440. Kör efter verify.mjs.
//   BEFORE=before-2235591 (standard) eller before-eb477bb
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const REF = "/Users/wahlberg/HZY/design/thcx-mall-2026-11-13/visual-redesign/assets/reference/koncept-b-produktnara.png";
const BEFORE = process.env.BEFORE || "before-2235591";
const file = f => { const w = f.replace(/\.png$/, ".webp"); const g = fs.existsSync(f) ? f : w; return `data:image/${g.endsWith(".webp") ? "webp" : "png"};base64,` + fs.readFileSync(g).toString("base64"); };
const ref = file(REF);
// Konceptbildens delar (px i 1536x1024-originalet): desktopramen och den ritade telefonens skärm.
const CROP = { "1440-hero": [58, 62, 1076, 470], "1440-faq": [58, 545, 1076, 465], "393-hero": [1182, 112, 328, 570], "393-faq": [1182, 680, 328, 320] };
const SHEETS = [
  ["1440-hero", "Hero + produktkort 1440", "thcx-1440-fold"],
  ["393-hero", "Hero + produktkort 393", "thcx-393-fold"],
  ["1440-faq", "Uppslag + FAQ 1440", "thcx-1440-uppslag-faq"],
  ["393-faq", "Uppslag + FAQ 393 (konceptets telefon visar bara uppslagets början)", "thcx-393-uppslag-faq"]
];
const b = await chromium.launch({ channel: "chrome" }); const p = await b.newPage({ viewport: { width: 2400, height: 900 } });
for (const [key, title, shot] of SHEETS) {
  const mobile = key.startsWith("393"); const W = mobile ? 1260 : 2400;
  const cols = [["Koncept B", ref, CROP[key]], [BEFORE.replace("before-", "Före "), file(path.join(DIR, BEFORE, shot + ".png"))], ["Efter", file(path.join(DIR, "shots", shot + ".png"))]];
  await p.setViewportSize({ width: W, height: 900 });
  await p.setContent(`<body style="margin:0;padding:16px;background:#222;color:#eee;font:600 18px Helvetica;width:${W}px;box-sizing:border-box"><div style="margin:0 0 12px">${title}</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;align-items:start">${cols.map(([t]) => `<figure style="margin:0"><figcaption style="margin:0 0 8px;font-weight:400">${t}</figcaption><canvas style="width:100%;display:block"></canvas></figure>`).join("")}</div></body>`);
  await p.evaluate(async cols => {
    const cs = document.querySelectorAll("canvas");
    for (let n = 0; n < cols.length; n++) {
      const [, src, crop] = cols[n]; const i = new Image(); i.src = src; await i.decode();
      const [x, y, w, h] = crop || [0, 0, i.width, i.height]; const c = cs[n]; c.width = w; c.height = h; c.getContext("2d").drawImage(i, x, y, w, h, 0, 0, w, h);
    }
  }, cols);
  await p.screenshot({ path: path.join(DIR, `shots/compare-${key}.png`), fullPage: true });
}
await b.close();
