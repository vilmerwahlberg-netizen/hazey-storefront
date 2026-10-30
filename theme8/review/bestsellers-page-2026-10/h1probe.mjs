// Sondering: native h1.nh-bs-hero__title (text, attribut, klasser, stilar som riktar sig mot den). node h1probe.mjs [which]
import { chromium, ctxFor, open, ready } from "./lib.mjs";
const which = process.argv[2] || "after";
const b = await chromium.launch(); const ctx = await ctxFor(b, 1440, 900, { which }); const p = await open(ctx, "/sv/page/vara-bastsaljare"); await ready(p, 5000);
console.log(JSON.stringify(await p.evaluate(() => {
  const h = document.querySelector("h1.nh-bs-hero__title");
  const rules = []; for (const s of document.styleSheets) { let r; try { r = s.cssRules; } catch { continue; } for (const x of r) if (x.selectorText && /nh-bs-hero__title|nh-bs-hero h1/.test(x.selectorText)) rules.push((s.href || "inline").slice(-40) + " :: " + x.cssText.slice(0, 220)); }
  return { outer: h && h.outerHTML.slice(0, 400), parent: h && h.parentElement.className, h1s: [...document.querySelectorAll("h1")].map(e => e.className + "|" + e.textContent.trim()), rules };
}), null, 1));
await b.close();
