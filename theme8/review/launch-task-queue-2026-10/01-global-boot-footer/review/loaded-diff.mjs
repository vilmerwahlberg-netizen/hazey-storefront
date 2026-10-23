// Färdigladdat läge före (HEAD) vs efter: pixeldiff av första viewporten
// (header, hero, kort), av själva footer-elementet, geometri för
// nyckelelement samt CLS. Reducerad rörelse på båda sidor för stabilitet.
// node loaded-diff.mjs [route,..] [width,..]
import { chromium, ctxFor, open, ready, ROUTES, DIR } from "./lib.mjs"; import fs from "node:fs";
import { PNG } from "pngjs"; import pixelmatch from "pixelmatch";
const routes = process.argv[2] ? process.argv[2].split(",") : Object.keys(ROUTES).filter(r => r !== "checkout");
const widths = process.argv[3] ? process.argv[3].split(",").map(Number) : [393, 1440, 1920];
const H = { 393: 852, 1440: 900, 1920: 1080 };
const OUT = `${DIR}/loaded`; fs.mkdirSync(OUT, { recursive: true });
const KEYS = ["#store-header", ".hz8-header", "[class*='hz8-hero']", ".hz8-cat-hero", ".hz8-ptool", ".hz8-pdock", ".hz8-buybar", ".hz8-pp-buy, .hz8-ppc", ".product-card", ".hz8-footer", ".hz8-footer__inner", ".hz8-footer__bottom"];
const b = await chromium.launch(); const rows = [];
async function grab(which, r, w) {
  const ctx = await ctxFor(b, w, H[w], { which });
  await ctx.addInitScript(() => { window.__cls = 0; try { new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true }); } catch (e) {} });
  const p = await open(ctx, ROUTES[r]); await ready(p, 6000);
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(800);
  const top = await p.screenshot();
  const geo = await p.evaluate(keys => Object.fromEntries(keys.map(k => { const e = [...document.querySelectorAll(k)].find(x => x.getBoundingClientRect().height > 0); if (!e) return [k, null]; const r = e.getBoundingClientRect(); return [k, [r.x, r.y + scrollY, r.width, r.height].map(v => Math.round(v * 10) / 10)]; })), KEYS);
  const cls = await p.evaluate(() => Math.round(window.__cls * 1000) / 1000);
  // Sticky-kontroller: scrolla till mitten av sidan och mät fasta element.
  await p.evaluate(() => scrollTo(0, 1000)); await p.waitForTimeout(900);
  const mid = await p.screenshot();
  const fixed = await p.evaluate(() => [...document.querySelectorAll("body *")].filter(e => { const cs = getComputedStyle(e); return (cs.position === "fixed" || cs.position === "sticky") && e.getBoundingClientRect().height > 0 && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0; }).map(e => { const r = e.getBoundingClientRect(); return `${e.id || [...e.classList].slice(0, 1).join(".") || e.tagName} ${[r.x, r.y, r.width, r.height].map(Math.round).join(",")}`; }).sort());
  const foot = p.locator(".hz8-footer").first(); let footPng = null;
  if (await foot.count()) { await foot.scrollIntoViewIfNeeded(); await p.waitForTimeout(500); footPng = await foot.screenshot(); }
  await ctx.close();
  return { top, mid, geo, cls, fixed, footPng, errors: p.errors.filter(e => !/recaptcha|trustpilot|favicon|ERR_|net::|integrity|status of 4/i.test(e)) };
}
function diff(a, b, name) {
  if (!a || !b) return null; const A = PNG.sync.read(a), B = PNG.sync.read(b);
  if (A.width !== B.width || A.height !== B.height) return { sizeA: [A.width, A.height], sizeB: [B.width, B.height] };
  const D = new PNG({ width: A.width, height: A.height }); const n = pixelmatch(A.data, B.data, D.data, A.width, A.height, { threshold: 0.1 });
  if (n) fs.writeFileSync(`${OUT}/${name}-diff.png`, PNG.sync.write(D));
  return { px: n, pct: Math.round(n / (A.width * A.height) * 10000) / 100 };
}
for (const r of routes) for (const w of widths) {
  const A = await grab("before", r, w), B = await grab("after", r, w);
  fs.writeFileSync(`${OUT}/${r}-${w}-top-before.png`, A.top); fs.writeFileSync(`${OUT}/${r}-${w}-top-after.png`, B.top);
  if (A.footPng) fs.writeFileSync(`${OUT}/${r}-${w}-footer-before.png`, A.footPng); if (B.footPng) fs.writeFileSync(`${OUT}/${r}-${w}-footer-after.png`, B.footPng);
  const geoDiff = Object.keys(A.geo).filter(k => JSON.stringify(A.geo[k]) !== JSON.stringify(B.geo[k])).map(k => `${k}: ${JSON.stringify(A.geo[k])} -> ${JSON.stringify(B.geo[k])}`);
  const row = { route: r, w, top: diff(A.top, B.top, `${r}-${w}-top`), mid: diff(A.mid, B.mid, `${r}-${w}-mid`), footer: diff(A.footPng, B.footPng, `${r}-${w}-footer`), geoDiff, fixedSame: JSON.stringify(A.fixed) === JSON.stringify(B.fixed), fixedA: A.fixed, fixedB: B.fixed, clsA: A.cls, clsB: B.cls, errorsA: A.errors.slice(0, 3), errorsB: B.errors.slice(0, 3) };
  rows.push(row); console.log(JSON.stringify(row).slice(0, 900));
}
fs.writeFileSync(`${OUT}/loaded-diff${process.argv[2] ? "-" + routes.join("_") : ""}${process.argv[3] ? "-" + widths.join("_") : ""}.json`, JSON.stringify(rows, null, 1));
await b.close();
