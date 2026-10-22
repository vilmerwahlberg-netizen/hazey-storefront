// compare/r5: facit/R4/R5 vid 393 med linje vid y=560 CSS-px och uppmätta värden.
import { chromium } from "../pdp-pilot-2026-10/lib.mjs"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname), REF = path.resolve(DIR, "../launch-task-queue-2026-10/02-universal-broad-category/references/approved/alla-buds-mobile-approved.png");
const M4 = JSON.parse(fs.readFileSync(DIR + "/r4-same/measure.json")), M5 = JSON.parse(fs.readFileSync(DIR + "/r5/measure.json"));
const OUT = DIR + "/compare/r5/"; const b = await chromium.launch();
const lab = m => m ? `understrykning y=${m.underline ?? "–"} · första kortet y=${m.card}` : "";
async function sheet(name, cols) {
  /* Alla bilder är 393x852 CSS-px (facit 852x1846); linjen ligger vid 560/852. */
  const html = `<html><body style="margin:0;background:#2b2b2b;font:600 14px Arial;color:#fff"><div style="display:grid;grid-template-columns:repeat(${cols.length},430px);gap:18px;padding:16px">` +
    cols.map(([t, f, m]) => `<div><div style="padding:0 0 4px">${t}</div><div style="padding:0 0 8px;font-weight:400;color:#ffd9a8">${m}</div><div style="position:relative;width:430px"><img src="file://${f}" style="width:430px;display:block;border:1px solid #555"><div style="position:absolute;left:0;right:0;top:${(560 / 852 * 100).toFixed(3)}%;border-top:1.5px solid #ff2d55"></div><div style="position:absolute;right:4px;top:calc(${(560 / 852 * 100).toFixed(3)}% - 18px);font:700 11px Arial;color:#ff2d55;background:rgba(0,0,0,.55);padding:1px 4px">y=560</div></div></div>`).join("") + `</div></body></html>`;
  const f = OUT + name + ".html"; fs.writeFileSync(f, html); const ctx = await b.newContext({ viewport: { width: cols.length * 448 + 20, height: 900 } }); const p = await ctx.newPage(); await p.goto("file://" + f); await p.waitForTimeout(900);
  await p.screenshot({ path: OUT + name + ".png", fullPage: true }); await ctx.close(); fs.unlinkSync(f); console.log("sheet", name); }
await sheet("alla-buds-393", [["Facit", REF, "understrykning y≈560 · första kortet y≈628"], ["R4", DIR + "/r4-same/blommor-buds-393-first.png", lab(M4["blommor-buds-393"])], ["R5", DIR + "/r5/blommor-buds-393-first.png", lab(M5["blommor-buds-393"])]]);
await sheet("allt-hasch-393", [["R4", DIR + "/r4-same/hasch-393-first.png", lab(M4["hasch-393"])], ["R5", DIR + "/r5/hasch-393-first.png", lab(M5["hasch-393"])], ["R5 Magic Sauce", DIR + "/r5/hasch-ms-393-first.png", lab(M5["hasch-ms-393"])]]);
await sheet("control-alla-vapes-393", [["R4", DIR + "/r4-same/alla-vapes-393-first.png", `verktygsrad y=${M4["alla-vapes-393"].tool} · första kortet y=${M4["alla-vapes-393"].card}`], ["R5", DIR + "/r5/alla-vapes-393-first.png", `verktygsrad y=${M5["alla-vapes-393"].tool} · första kortet y=${M5["alla-vapes-393"].card}`]]);
await b.close();
