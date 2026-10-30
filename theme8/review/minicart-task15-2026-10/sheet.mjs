import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const files = fs.readdirSync(`${DIR}/before`).filter(f => f.endsWith(".png")).sort();
const groups = [["393", f => f.startsWith("393-") && /-(top|during)\.png$/.test(f)], ["1440", f => f.startsWith("1440-") && /-(top|during)\.png$/.test(f)], ["övriga", f => /^(320|430|1920|z200)-/.test(f) && /-top\.png$/.test(f)]];
const b = await chromium.launch();
for (const [g, test] of groups) {
  const fs_ = files.filter(test); const cw = g === "1440" ? 480 : 220;
  const html = `<!doctype html><meta charset="utf-8"><body style="margin:0;padding:16px;background:#ede9e8;font:600 12px Helvetica;display:grid;grid-template-columns:repeat(${g === "1440" ? 4 : 8},${cw}px);gap:14px">${fs_.map(f => `<figure style="margin:0"><img src="file://${DIR}/before/${f}" style="width:${cw}px;display:block;border:1px solid #ccc"><figcaption style="padding-top:4px">${f.replace(".png", "")}</figcaption></figure>`).join("")}</body>`;
  fs.writeFileSync(`${DIR}/before/_sheet-${g}.html`, html);
  const p = await b.newPage({ viewport: { width: (g === "1440" ? 4 : 8) * (cw + 14) + 32, height: 800 } });
  await p.goto(`file://${DIR}/before/_sheet-${g}.html`); await p.waitForTimeout(500);
  await p.screenshot({ path: `${DIR}/before/_overview-${g}.png`, fullPage: true }); await p.close();
}
await b.close(); console.log(files.length);
