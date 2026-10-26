// TASK 03 regression: frysta routes, före (BASE = HEAD 38cfe89) vs efter (dist).
// Topp, mitt (scrollY 1000) och slut per bredd, pixelmatch. node regress.mjs [routes] [widths]
import fs from "node:fs"; import path from "node:path"; import { PNG } from "pngjs"; import pixelmatch from "pixelmatch";
import { launch, open, scrollAll, DIR, ROOT } from "./lib.mjs";
const ROUTES = { home: "/", "alla-vapes": "/sv/categories/alla-vapes", "alla-buds": "/sv/categories/blommor-buds", hasch: "/sv/categories/hasch", "magic-sauce": "/sv/categories/magic-sauce", "m-s-vapes": "/sv/categories/m-s-vapes", "pdp-faraoh": "/sv/products/vape-thc-a-45-faraoh-2ml/133" };
const routes = (process.argv[2] || Object.keys(ROUTES).join(",")).split(",");
const widths = (process.argv[3] || "393,1440,1920").split(",").map(Number);
const OUT = path.join(DIR, "regress"); fs.mkdirSync(OUT, { recursive: true });
const b = await launch(); const rows = [];
async function grab(build, r, w) {
  const { p, ctx } = await open(b, w, ROUTES[r], { build });
  await p.waitForTimeout(3000); await scrollAll(p); await p.waitForTimeout(5000);
  const shots = {};
  for (const [k, y] of [["top", 0], ["mid", 1000], ["end", 1e7]]) { await p.evaluate(v => scrollTo({ top: v, behavior: "instant" }), y); await p.waitForTimeout(900); shots[k] = await p.screenshot(); }
  const meta = await p.evaluate(() => ({ docH: document.documentElement.scrollHeight, ov: document.documentElement.scrollWidth - innerWidth }));
  const errs = p.errs; await ctx.close(); return { shots, meta, errs };
}
function diff(a, bb, name) { const A = PNG.sync.read(a), B = PNG.sync.read(bb); if (A.width !== B.width || A.height !== B.height) return "size"; const D = new PNG({ width: A.width, height: A.height }); const n = pixelmatch(A.data, B.data, D.data, A.width, A.height, { threshold: 0.1 }); if (n) { fs.writeFileSync(`${OUT}/${name}-diff.png`, PNG.sync.write(D)); fs.writeFileSync(`${OUT}/${name}-before.png`, a); fs.writeFileSync(`${OUT}/${name}-after.png`, bb); } return n; }
for (const r of routes) for (const w of widths) {
  /* AFTER=external: efter = extern preview utan injektion. */
  const A = await grab(process.env.BASE, r, w), B = await grab(process.env.AFTER === "external" ? null : path.join(ROOT, "dist/theme8"), r, w);
  const row = { route: r, w, top: diff(A.shots.top, B.shots.top, `${r}-${w}-top`), mid: diff(A.shots.mid, B.shots.mid, `${r}-${w}-mid`), end: diff(A.shots.end, B.shots.end, `${r}-${w}-end`), docH: [A.meta.docH, B.meta.docH], ov: B.meta.ov, errsAfter: B.errs, errsBefore: A.errs };
  rows.push(row); console.log(JSON.stringify(row));
}
fs.writeFileSync(path.join(OUT, `regress-${process.env.AFTER === "external" ? "external-" : ""}${routes.join("_")}.json`), JSON.stringify(rows, null, 1));
await b.close();
