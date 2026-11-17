// Etapp 1: produktbild + köpyta + övergång till "Vad är …?".
// Tar (1) första vyn, (2) toppen t.o.m. pappersbandet, (3) närbild köpkontroller,
// (4) närbild pappersskarven -- vid 393x852 och 1440x900 -- och bygger
// sida-vid-sida mot facit. node etapp1.mjs <prefix>
import { chromium, ctxFor, open, URL_ } from "../pdp-pilot-2026-10/lib.mjs";
import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(DIR, "shots", "etapp1"); fs.mkdirSync(OUT, { recursive: true });
const prefix = process.argv[2] || "e1";
const REF = "/Users/wahlberg/HZY/design/top30-paritet-2026-11-16/nasta-batch/";
const PDP = "/sv/products/vape-magic-sauce-magic-farmers-2ml/454";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const meta = {};
for (const [w, h] of [[393, 852], [1440, 900]]) {
  const ctx = await ctxFor(browser, w, h, { scale: w < 768 ? 2 : 1 });
  const p = await open(ctx, URL_(PDP));
  await p.waitForSelector(".hz8-pcx-sum", { timeout: 30000 }); await p.waitForTimeout(5000);
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(600);
  const r = await p.evaluate(() => {
    const b = s => { const e = document.querySelector(s); if (!e) return null; const q = e.getBoundingClientRect(); return { x: q.left, y: q.top + scrollY, w: q.width, h: q.height }; };
    return { sum: b("#hz8-pcx-sum"), pp: b(".hz8-pp"), info: b(".product-detail__information"), media: b(".product-detail__media"), h1: b(".product-detail__information h1"), cta: b(".hz8-pp__cta"), sw: document.documentElement.scrollWidth, iw: innerWidth,
      img: (() => { const i = document.querySelector(".product-detail__media .product-image-slider__slide img"); if (!i) return null; const cs = getComputedStyle(i); return { filter: cs.filter, opacity: cs.opacity, mix: cs.mixBlendMode, src: i.currentSrc.split("/").pop() }; })() };
  });
  meta[w] = r;
  await p.screenshot({ path: path.join(OUT, `${prefix}-${w}-forsta-vyn.jpg`), type: "jpeg", quality: 85 });
  const topH = Math.round(r.sum.y + r.sum.h + 40);
  /* backdrop-filter (glaset) ritas inte utanför vyn i Playwrights
     fullPage-läge: vyn görs lika hög som utsnittet i stället. Måtten på
     sidan beror på bredden, inte höjden (kontrollerat: samma sum.y). */
  await p.setViewportSize({ width: w, height: topH }); await p.waitForTimeout(900);
  const chk = await p.evaluate(() => Math.round(document.querySelector("#hz8-pcx-sum").getBoundingClientRect().top + scrollY));
  if (Math.abs(chk - r.sum.y) > 2) console.warn("layout ändrades med vyhöjden", w, chk, r.sum.y);
  await p.screenshot({ path: path.join(OUT, `${prefix}-${w}-topp.jpg`), clip: { x: 0, y: 0, width: w, height: topH }, type: "jpeg", quality: 85 });
  const pp = w < 768 ? r.pp : r.info;
  await p.screenshot({ path: path.join(OUT, `${prefix}-${w}-kopkontroller.jpg`), clip: { x: Math.max(0, pp.x - 16), y: pp.y - 16, width: Math.min(w, pp.w + 32), height: pp.h + 32 }, type: "jpeg", quality: 90 });
  const sy = Math.max(0, r.sum.y - (w < 768 ? 160 : 220));
  await p.screenshot({ path: path.join(OUT, `${prefix}-${w}-pappersskarv.jpg`), clip: { x: 0, y: sy, width: w, height: Math.min(r.sum.y + r.sum.h + 60 - sy, 900) }, type: "jpeg", quality: 90 });
  await ctx.close();
}
// Sida vid sida: facit (vänster) och resultat (höger), samma bredd.
const side = async (refFile, crop, ours, outName, width) => {
  const p = await browser.newPage();
  const enc = f => "data:image/" + (f.endsWith(".png") ? "png" : "jpeg") + ";base64," + fs.readFileSync(f).toString("base64");
  const url = await p.evaluate(async ([a, c, b, W]) => {
    const load = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = s; });
    const A = await load(a), B = await load(b);
    const ah = c[3] * (W / c[2]), bh = B.naturalHeight * (W / B.naturalWidth), H = Math.max(ah, bh);
    const cv = document.createElement("canvas"); cv.width = W * 2 + 24; cv.height = H + 34; const g = cv.getContext("2d");
    g.fillStyle = "#222"; g.fillRect(0, 0, cv.width, cv.height); g.imageSmoothingQuality = "high";
    g.drawImage(A, c[0], c[1], c[2], c[3], 0, 34, W, ah); g.drawImage(B, W + 24, 34, W, bh);
    g.fillStyle = "#fff"; g.font = "600 16px Helvetica"; g.fillText("FACIT (AI-koncept v2)", 8, 22); g.fillText("RESULTAT (lokal build)", W + 32, 22);
    return cv.toDataURL("image/jpeg", .86);
  }, [enc(refFile), crop, enc(ours), width]);
  fs.writeFileSync(path.join(OUT, outName), Buffer.from(url.split(",")[1], "base64")); await p.close();
};
// Facits motsvarande utsnitt (från toppen t.o.m. pappersbandet).
await side(REF + "ms-2ml-seo-first-desktop-v2.png", [0, 0, 864, 625], path.join(OUT, `${prefix}-1440-topp.jpg`), `${prefix}-1440-sida-vid-sida.jpg`, 1100);
await side(REF + "ms-2ml-seo-first-mobile-v2.png", [178, 0, 370, 860], path.join(OUT, `${prefix}-393-topp.jpg`), `${prefix}-393-sida-vid-sida.jpg`, 520);
fs.writeFileSync(path.join(OUT, `${prefix}.json`), JSON.stringify(meta, null, 1));
console.log(JSON.stringify(meta, null, 1));
await browser.close();
