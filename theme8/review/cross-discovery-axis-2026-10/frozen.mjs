// TASK 04A -- frysta delar: helsida före och efter, pixeldiff av
// (1) allt OVANFÖR nedre upptäcktsmodulen (header, hero, filterhylla,
//     produktkort) och (2) allt UNDER den (kundservice, kategoritext,
//     footer), bottenjusterat. Modulen själv är avsiktligt ändrad.
// node frozen.mjs capture before|after <route,..> <width,..>  |  node frozen.mjs diff
import { chromium, ctxFor, open, ready, DIR, ROUTES } from "./lib.mjs"; import fs from "node:fs";
import { PNG } from "pngjs"; import pixelmatch from "pixelmatch";
const [cmd, which, rs = "", ws = "393,1440"] = process.argv.slice(2);
const OUT = `${DIR}/runs/frozen`; fs.mkdirSync(OUT, { recursive: true });
const MOD = ".hz8-xd, .hz8-sf-others, .hz8-proutes:not(.hz8-xd), .hz8-sh-after";
if (cmd === "diff") {
  const rows = [];
  for (const f of fs.readdirSync(OUT).filter(f => f.startsWith("before-") && f.endsWith(".png"))) {
    const key = f.slice(7, -4), A = PNG.sync.read(fs.readFileSync(`${OUT}/${f}`)), B = PNG.sync.read(fs.readFileSync(`${OUT}/after-${key}.png`));
    const ma = JSON.parse(fs.readFileSync(`${OUT}/before-${key}.json`)), mb = JSON.parse(fs.readFileSync(`${OUT}/after-${key}.json`));
    const cmp = (ya, yb, h) => { const w = Math.min(A.width, B.width); if (h <= 0) return 0; const a = new PNG({ width: w, height: h }), b = new PNG({ width: w, height: h });
      PNG.bitblt(A, a, 0, ya, w, h, 0, 0); PNG.bitblt(B, b, 0, yb, w, h, 0, 0); return pixelmatch(a.data, b.data, null, w, h, { threshold: .1 }); };
    // Mobil fotograferas med DPR 2: CSS-px -> bildpx.
    const k = A.width / +key.split("-").pop();
    const above = Math.round(Math.min(ma.top, mb.top) * k);
    const below = Math.min(A.height - Math.round(ma.bottom * k), B.height - Math.round(mb.bottom * k));
    rows.push({ key, dpr: k, docH: [A.height, B.height], module: [ma.top + "-" + ma.bottom, mb.top + "-" + mb.bottom], abovePx: above, aboveDiff: cmp(0, 0, above), belowPx: below, belowDiff: cmp(A.height - below, B.height - below, below),
      // Bästa diff vid ±1-2 bildpx vertikal förskjutning (modulens nya höjd är
      // inte ett heltal på DPR 2 -> sektionerna under hamnar en halv CSS-px annorlunda).
      belowBestShift: Math.min(...[-2, -1, 1, 2].map(s => cmp(A.height - below + 4 + s, B.height - below + 4, below - 8))) });
  }
  console.table(rows); fs.writeFileSync(`${DIR}/runs/frozen-diff.json`, JSON.stringify(rows, null, 1)); process.exit(0);
}
const b = await chromium.launch();
for (const r of rs.split(",")) for (const w of ws.split(",").map(Number)) {
  const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which });
  const p = await open(ctx, ROUTES[r]); await ready(p, 3000);
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { scrollTo({ top: y, behavior: "instant" }); await new Promise(r => setTimeout(r, 150)); } scrollTo({ top: 0, behavior: "instant" }); });
  await p.waitForFunction(() => !document.querySelector(".hz8-pstock.is-pending:not([hidden])"), null, { timeout: 20000 }).catch(() => {});
  await p.waitForTimeout(3500);
  // Den fasta headern ritas annars in mitt i helsidan; den kontrolleras i vyns topp.
  const m = await p.evaluate(MOD => { const e = [...document.querySelectorAll(MOD)].find(x => x.getClientRects().length && !x.hidden); if (!e) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), bottom: Math.round(r.bottom + scrollY) }; }, MOD);
  await p.screenshot({ path: `${OUT}/${which}-${r}-${w}.png`, fullPage: true });
  fs.writeFileSync(`${OUT}/${which}-${r}-${w}.json`, JSON.stringify(m || { top: 0, bottom: 0 }));
  console.log(which, r, w, JSON.stringify(m), p.errors.length);
  await ctx.close();
}
await b.close();
