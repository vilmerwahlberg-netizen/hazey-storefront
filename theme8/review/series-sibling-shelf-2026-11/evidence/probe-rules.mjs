// TASK 25c — vilka CSS-regler träffar korten i hubbens D10-ruta resp. PDP-rutan (lokal build). Läser bara.
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const VP = +(process.env.VP || 1440);
const CSS = fs.readFileSync(path.resolve(DIR, "../../../../dist/theme8/hazey-theme8.css"), "utf8");
const b = await chromium.launch(); const out = {};
for (const [k, route, box] of [["hub", "/sv/categories/magic-sauce", ".hz8-sh-more"], ["pdp", "/sv/products/magic-sauce-hash-kitkat-5g", ".hz8-pp-sibling .hz8-sh-more"]]) {
  const ctx = await ctxFor(b, VP, VP < 768 ? 852 : 1000, { which: "after" }); const p = await open(ctx, route); await ready(p, 8000);
  for (let i = 0; i < 30 && !(await p.locator(box).count()); i++) { await p.mouse.wheel(0, 900); await p.waitForTimeout(500); }
  await p.locator(box + " .hz8-sh-more__btn").first().click(); await p.waitForTimeout(3000);
  out[k] = await p.evaluate(([box, css]) => {
    const region = document.querySelector(box + " .hz8-sh-more__region");
    const els = [region, ...region.querySelectorAll("*")];
    const hits = new Set();
    const walk = (rules, media) => { for (const r of rules) { if (r.cssRules && !r.selectorText) { const ok = !r.media || matchMedia(r.media.mediaText).matches; if (ok) walk(r.cssRules, r.media ? r.media.mediaText : media); continue; } if (!r.selectorText) continue; try { if (els.some(e => e.matches(r.selectorText))) hits.add((media ? "@" + media + " " : "") + r.selectorText); } catch { } } };
    const sh = new CSSStyleSheet(); sh.replaceSync(css); walk(sh.cssRules, "");
    return [...hits];
  }, [box, CSS]);
  await ctx.close();
}
fs.writeFileSync(path.join(DIR, "probe-rules-" + VP + ".json"), JSON.stringify(out, null, 1));
console.log("hub", out.hub.length, "pdp", out.pdp.length);
await b.close();
