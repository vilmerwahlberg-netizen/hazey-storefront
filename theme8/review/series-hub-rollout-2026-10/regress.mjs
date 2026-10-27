// TASK 04C-B -- regressionslås: samma utsnitt (topp 0..2400 px) före och
// efter för sidor utanför familjen, sedan pixeldiff.
// node regress.mjs before|after <route,..> <width,..>   |   node regress.mjs diff
import { chromium, ctxFor, open, ready, DIR, ROUTES } from "./lib.mjs"; import fs from "node:fs";
import { PNG } from "pngjs"; import pixelmatch from "pixelmatch";
const [which = "after", rs = "", ws = "393,1440"] = process.argv.slice(2);
const OUT = `${DIR}/runs/regress`; fs.mkdirSync(OUT, { recursive: true });
if (which === "diff") {
  const rows = [];
  for (const f of fs.readdirSync(OUT).filter(f => f.startsWith("before-"))) {
    const a = `${OUT}/${f}`, bb = `${OUT}/${f.replace(/^before-/, "after-")}`; if (!fs.existsSync(bb)) continue;
    const A = PNG.sync.read(fs.readFileSync(a)), B = PNG.sync.read(fs.readFileSync(bb));
    if (A.width !== B.width || A.height !== B.height) { rows.push({ f, size: [A.width, A.height, B.width, B.height] }); continue; }
    const D = new PNG({ width: A.width, height: A.height }); const n = pixelmatch(A.data, B.data, D.data, A.width, A.height, { threshold: .1 });
    let box = null; if (n) { let x0 = 1e9, y0 = 1e9, x1 = 0, y1 = 0; for (let y = 0; y < A.height; y++) for (let x = 0; x < A.width; x++) { const i = (y * A.width + x) * 4; if (D.data[i] === 255 && D.data[i + 1] === 0) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } } box = [x0, y0, x1, y1]; }
    rows.push({ f: f.replace(/^before-/, ""), changedPx: n, pct: +(100 * n / (A.width * A.height)).toFixed(3), box });
  }
  console.table(rows); fs.writeFileSync(`${DIR}/runs/regress-diff.json`, JSON.stringify(rows, null, 1)); process.exit(0);
}
const b = await chromium.launch();
for (const r of rs.split(",")) for (const w of ws.split(",").map(Number)) {
  const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which });
  const p = await open(ctx, ROUTES[r]); await ready(p, 6000);
  await p.waitForSelector("#hz8-sh-nav .hz8-sh-chip, .hz8-sh-shelves .hz8-state", { timeout: 20000 }).catch(() => {});
  await p.evaluate(async () => { for (let y = 0; y < 2600; y += 500) { scrollTo({ top: y, behavior: "instant" }); await new Promise(r => setTimeout(r, 200)); } scrollTo({ top: 0, behavior: "instant" }); });
  await p.waitForTimeout(2000);
  const h = await p.evaluate(() => Math.min(2400, document.documentElement.scrollHeight));
  await p.screenshot({ path: `${OUT}/${which}-${r}-${w}.png`, clip: { x: 0, y: 0, width: w, height: h }, fullPage: true });
  console.log(which, r, w, h, p.errors.length);
  await ctx.close();
}
await b.close();
