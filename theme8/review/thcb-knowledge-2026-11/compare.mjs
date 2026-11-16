// Jämförelseblad för THCB: vald skiss (kunskapsmall-b.png, AI-bild: ljus,
// material och rytm -- inte text eller fakta) | gamla WooCommerce-sidan
// (https://www.hazey.se/thcb/, hämtas läsande här) | ny Theme 8-sida.
// Kör efter verify.mjs. Inget skrivs till någon butik.
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const SHOTS = path.join(DIR, "shots");
const REF = "/Users/wahlberg/HZY/design/kunskap-rattslage-2026-11-16/kunskapsmall-b.png";
const file = f => { const w = f.replace(/\.png$/, ".webp"); const g = fs.existsSync(f) ? f : w; return `data:image/${g.endsWith(".webp") ? "webp" : "png"};base64,` + fs.readFileSync(g).toString("base64"); };
const shot = n => file(path.join(SHOTS, n + ".png"));
const b = await chromium.launch({ channel: "chrome" });

// 1. Gamla sidan, hela sidan, båda bredderna (läsande, cookies avböjs inte/accepteras inte).
for (const [w, h] of [[393, 852], [1440, 900]]) {
  const target = path.join(SHOTS, `gammal-thcb-${w}-full.png`);
  if (fs.existsSync(target) || fs.existsSync(target.replace(/\.png$/, ".webp"))) continue;
  const m = w < 768;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: m ? 2 : 1, isMobile: m, hasTouch: m });
  const p = await ctx.newPage();
  await p.goto("https://www.hazey.se/thcb/", { waitUntil: "load", timeout: 60000 });
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } window.scrollTo(0, 0); });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: target, fullPage: true });
  await ctx.close();
}

// 2. Blad. [nyckel, rubrik, bredd, kolumner: [etikett, bild, beskärning]]
const ref = file(REF);
const SHEETS = [
  ["393-fold", "Första skärmen 393 × 852: skiss B (telefonen) | gamla /thcb/ | ny sida", 1500, [
    ["Skiss B (AI-bild, inte fakta)", ref, [1170, 135, 340, 812]],
    ["Gamla hazey.se/thcb/ (16 nov)", file("/Users/wahlberg/HZY/design/kunskap-rattslage-2026-11-16/current/thcb-mobile.png"), null],
    ["Ny Theme 8-sida (riktig webbläsare)", shot("thcb-393-fold"), null]]],
  ["1440-fold", "Första skärmen 1440 × 900: skiss B (desktopramen) | gamla /thcb/ | ny sida", 2400, [
    ["Skiss B (AI-bild, inte fakta)", ref, [25, 97, 1098, 882]],
    ["Gamla hazey.se/thcb/ (16 nov)", file("/Users/wahlberg/HZY/design/kunskap-rattslage-2026-11-16/current/thcb-desktop.png"), null],
    ["Ny Theme 8-sida (riktig webbläsare)", shot("thcb-1440-fold"), null]]],
  ["393-helsida", "Hela sidan 393: gamla /thcb/ | ny sida", 1300, [
    ["Gamla hazey.se/thcb/", shot("gammal-thcb-393-full"), null],
    ["Ny Theme 8-sida", shot("thcb-393-full"), null]]],
  ["1440-helsida", "Hela sidan 1440: gamla /thcb/ | ny sida", 2400, [
    ["Gamla hazey.se/thcb/", shot("gammal-thcb-1440-full"), null],
    ["Ny Theme 8-sida", shot("thcb-1440-full"), null]]]
];
// R3 (riktning A): referens A | R2 | R3, och R2 | R3 hela sidan.
const R3REF = "/Users/wahlberg/HZY/design/kunskap-rattslage-2026-11-16/thcb-redesign-r3";
const r2 = n => file(path.join(SHOTS, "r2", n + ".png"));
SHEETS.push(
  ["r3-393-fold", "393 × 852: referens A (mobil) | R2 | R3", 1500, [
    ["Referens A (AI-bild, inte fakta)", file(path.join(R3REF, "concept-mobile.png")), null],
    ["R2", r2("thcb-393-fold"), null],
    ["R3 (riktig webbläsare)", shot("thcb-393-fold"), null]]],
  ["r3-1440-fold", "1440 × 900: referens A (desktop) | R2 | R3", 2400, [
    ["Referens A (AI-bild, inte fakta)", file(path.join(R3REF, "concept-desktop.png")), [0, 0, 1487, 930]],
    ["R2", r2("thcb-1440-fold"), null],
    ["R3 (riktig webbläsare)", shot("thcb-1440-fold"), null]]],
  ["r3-393-helsida", "Hela sidan 393: R2 | R3", 1300, [["R2", r2("thcb-393-full"), null], ["R3", shot("thcb-393-full"), null]]],
  ["r3-1440-helsida", "Hela sidan 1440: R2 | R3", 2400, [["R2", r2("thcb-1440-full"), null], ["R3", shot("thcb-1440-full"), null]]]
);
const p = await b.newPage({ viewport: { width: 2000, height: 900 } });
for (const [key, title, W, cols] of SHEETS) {
  await p.setViewportSize({ width: W, height: 900 });
  await p.setContent(`<body style="margin:0;padding:16px;background:#222;color:#eee;font:600 18px Helvetica;width:${W}px;box-sizing:border-box"><div style="margin:0 0 12px">${title}</div><div style="display:grid;grid-template-columns:repeat(${cols.length},1fr);gap:16px;align-items:start">${cols.map(([t]) => `<figure style="margin:0"><figcaption style="margin:0 0 8px;font-weight:400">${t}</figcaption><canvas style="width:100%;display:block"></canvas></figure>`).join("")}</div></body>`);
  await p.evaluate(async cols => {
    const cs = document.querySelectorAll("canvas");
    for (let n = 0; n < cols.length; n++) {
      const [, src, crop] = cols[n]; const i = new Image(); i.src = src; await i.decode();
      const [x, y, w, h] = crop || [0, 0, i.width, i.height]; const hh = Math.min(h, i.height - y); const c = cs[n]; c.width = w; c.height = hh; c.getContext("2d").drawImage(i, x, y, w, hh, 0, 0, w, hh);
    }
  }, cols);
  await p.screenshot({ path: path.join(SHOTS, `jamfor-${key}.png`), fullPage: true });
}
await b.close();
