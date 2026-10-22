// Jämförelseblad: godkänd referens -> trasig (förra rundan) -> korrigerad. node sheets.mjs
import { chromium } from "../pdp-pilot-2026-10/lib.mjs"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname), REF = path.resolve(DIR, "../launch-task-queue-2026-10/02-universal-broad-category/references/approved");
const B = DIR + "/after/", C = DIR + "/r4/", P = DIR + "/before/", CMP = DIR + "/compare/";
const b = await chromium.launch();
async function sheet(name, cols, width) {
  const html = `<html><body style="margin:0;background:#2b2b2b;font:600 15px Arial;color:#fff"><div style="display:grid;grid-template-columns:repeat(${cols.length},1fr);gap:16px;padding:16px;align-items:start">` +
    cols.map(([label, file]) => `<div><div style="padding:0 0 8px">${label}</div>${fs.existsSync(file) ? `<img src="file://${file}" style="width:100%;display:block;border:1px solid #555">` : `<div style="padding:40px;border:1px dashed #777">saknas</div>`}</div>`).join("") + `</div></body></html>`;
  const f = CMP + name + ".html"; fs.writeFileSync(f, html); const ctx = await b.newContext({ viewport: { width, height: 800 } }); const p = await ctx.newPage(); await p.goto("file://" + f); await p.waitForTimeout(900);
  await p.screenshot({ path: CMP + name + ".png", fullPage: true }); await ctx.close(); fs.unlinkSync(f); console.log("sheet", name); }
await sheet("allt-hasch-1440", [["Godkänd referens", REF + "/allt-hasch-desktop-approved.png"], ["Trasig (förra rundan)", B + "hasch-1440-first.png"], ["Korrigerad", C + "hasch-1440-first.png"]], 3400);
await sheet("allt-hasch-magic-sauce-1440", [["Godkänd referens (ofiltrerad)", REF + "/allt-hasch-desktop-approved.png"], ["Trasig: filtrerad", B + "hasch-ms-1440-first.png"], ["Korrigerad: filtrerad", C + "hasch-ms-1440-first.png"]], 3400);
await sheet("alla-buds-1440", [["Godkänd referens", REF + "/alla-buds-desktop-approved.png"], ["Trasig (förra rundan)", B + "blommor-buds-1440-first.png"], ["Korrigerad", C + "blommor-buds-1440-first.png"]], 3400);
await sheet("alla-buds-thcab-1440", [["Godkänd referens (ofiltrerad)", REF + "/alla-buds-desktop-approved.png"], ["Korrigerad: THCaB", C + "buds-thcab-1440-first.png"]], 2400);
await sheet("alla-buds-393", [["Godkänd referens", REF + "/alla-buds-mobile-approved.png"], ["Trasig (förra rundan)", B + "blommor-buds-393-first.png"], ["Korrigerad", C + "blommor-buds-393-first.png"]], 1500);
await sheet("allt-hasch-393", [["Trasig (förra rundan)", B + "hasch-393-first.png"], ["Korrigerad", C + "hasch-393-first.png"], ["Korrigerad: Magic Sauce", C + "hasch-ms-393-first.png"]], 1500);
await sheet("control-alla-vapes-1440", [["Före (a175230)", P + "alla-vapes-1440-first.png"], ["Korrigerad", C + "alla-vapes-1440-first.png"]], 2400);
await sheet("control-alla-vapes-393", [["Före (a175230)", P + "alla-vapes-393-first.png"], ["Korrigerad", C + "alla-vapes-393-first.png"]], 1100);
await sheet("control-ms-vapes-1440", [["Före (a175230)", P + "m-s-vapes-1440-first.png"], ["Korrigerad", C + "m-s-vapes-1440-first.png"]], 2400);
await b.close();
