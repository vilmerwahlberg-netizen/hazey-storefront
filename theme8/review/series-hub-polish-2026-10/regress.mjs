// TASK 01B regression: sidor som ska vara oförändrade, före (HEAD) vs efter.
// Topp, mitt (scrollY 1000) och slut (sista viewport) per bredd, pixelmatch.
// node regress.mjs [route,..] [widths]
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
import { PNG } from "pngjs"; import pixelmatch from "pixelmatch";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const ROOT = path.resolve(DIR, "../../..");
const ROUTES = { "magic-sauce": "/sv/categories/magic-sauce", "m-s-vapes": "/sv/categories/m-s-vapes", thca: "/sv/categories/thca", "alla-vapes": "/sv/categories/alla-vapes", hasch: "/sv/categories/hasch", home: "/", "pdp-faraoh": "/sv/products/vape-thc-a-45-faraoh-2ml/133" };
const routes = (process.argv[2] || Object.keys(ROUTES).join(",")).split(",");
const widths = (process.argv[3] || "393,1440,1920").split(",").map(Number);
const H = { 393: 852, 1440: 900, 1920: 1080 };
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const OUT = path.join(DIR, "regress"); fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch(); const rows = [];
async function grab(which, r, w) {
  const B = which === "before" ? process.env.HUB_BASE : path.join(ROOT, "dist/theme8"); const m = w < 768;
  const ctx = await b.newContext({ viewport: { width: w, height: H[w] }, deviceScaleFactor: m ? 2 : 1, isMobile: m, hasTouch: m, userAgent: m ? undefined : UA, reducedMotion: "reduce" });
  await ctx.route(/theme8\/hazey-theme8\.css/, rt => rt.fulfill({ path: path.join(B, "hazey-theme8.css"), contentType: "text/css" }));
  await ctx.route(/theme8\/hazey-theme8\.min\.js/, rt => rt.fulfill({ path: path.join(B, "hazey-theme8.min.js"), contentType: "application/javascript" }));
  await ctx.route(/github\.io\/hazey-storefront\/theme8\/assets\/([^?]+)/, rt => { const f = path.join(ROOT, "theme8/assets", decodeURIComponent(new URL(rt.request().url()).pathname.split("/theme8/assets/")[1])); return fs.existsSync(f) ? rt.fulfill({ path: f }) : rt.fulfill({ status: 404 }); });
  const p = await ctx.newPage(); const errs = [];
  p.on("pageerror", e => errs.push(String(e).slice(0, 120))); p.on("console", mm => { if (mm.type() === "error" && !/recaptcha|trustpilot|favicon|Failed to load|requestStorageAccess/i.test(mm.text())) errs.push(mm.text().slice(0, 120)); });
  await p.goto(`https://hazeyse.nyehandel.se${ROUTES[r]}?preview=v9kzdmqz4w60l5n`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await p.waitForFunction(() => document.documentElement.classList.contains("hz8"), null, { timeout: 90000 });
  try { await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 4000 }); } catch {}
  await p.waitForTimeout(3000);
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 100)); } scrollTo(0, 0); });
  await p.waitForTimeout(5000);
  const shots = {};
  for (const [k, y] of [["top", 0], ["mid", 1000], ["end", 1e7]]) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(900); shots[k] = await p.screenshot(); }
  const meta = await p.evaluate(() => ({ docH: document.documentElement.scrollHeight, ov: document.documentElement.scrollWidth - innerWidth, hub: document.documentElement.className.split(" ").filter(c => /hz8-(sh|series|hub|sf|cat)/.test(c)).join(" "), railSb: [...document.querySelectorAll(".hz8-prail__list")].slice(0, 2).map(l => getComputedStyle(l).scrollbarWidth).join(",") }));
  await ctx.close(); return { shots, meta, errs };
}
function diff(a, bb, name) { const A = PNG.sync.read(a), Bp = PNG.sync.read(bb); if (A.width !== Bp.width || A.height !== Bp.height) return { size: true }; const D = new PNG({ width: A.width, height: A.height }); const n = pixelmatch(A.data, Bp.data, D.data, A.width, A.height, { threshold: 0.1 }); if (n) { fs.writeFileSync(`${OUT}/${name}-diff.png`, PNG.sync.write(D)); fs.writeFileSync(`${OUT}/${name}-before.png`, a); fs.writeFileSync(`${OUT}/${name}-after.png`, bb); } return n; }
for (const r of routes) for (const w of widths) {
  const A = await grab("before", r, w), Bq = await grab("after", r, w);
  const row = { route: r, w, top: diff(A.shots.top, Bq.shots.top, `${r}-${w}-top`), mid: diff(A.shots.mid, Bq.shots.mid, `${r}-${w}-mid`), end: diff(A.shots.end, Bq.shots.end, `${r}-${w}-end`), docH: [A.meta.docH, Bq.meta.docH], ov: [A.meta.ov, Bq.meta.ov], railSb: [A.meta.railSb, Bq.meta.railSb], cls: Bq.meta.hub, errsAfter: Bq.errs, errsBefore: A.errs };
  rows.push(row); console.log(JSON.stringify(row));
}
fs.writeFileSync(path.join(OUT, `regress-${routes.join("_")}.json`), JSON.stringify(rows, null, 1));
await b.close();
