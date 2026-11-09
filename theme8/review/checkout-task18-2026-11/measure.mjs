// Mobil 393: var ligger totalsumman, fraktraden och Kustoms första fält (Mejladress)?
import { chromium, injectCheckoutCss } from "./lib.mjs"; import { toCheckout } from "./flow.mjs";
const css = { native: null, task18: process.argv[3] || "dist/theme8/hazey-theme8-checkout.css" }[process.argv[2] || "task18"];
const b = await chromium.launch(); const { p } = await toCheckout(b, 393, 852); await injectCheckoutCss(p, css); await p.waitForTimeout(1500);
const frame = await p.locator("#klarna-checkout-iframe").boundingBox();
const field = await p.frameLocator("#klarna-checkout-iframe").locator("input").first().boundingBox();
const m = await p.evaluate(() => { const y = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return Math.round(r.top + scrollY) + "–" + Math.round(r.bottom + scrollY); };
  return { total: y(".checkout-total"), shipRow: y(".shipping .options li"), newsletter: y(".newsletter-subscription"), coupon: y(".coupon-code") }; });
console.log(process.argv[2] || "task18", JSON.stringify({ ...m, kustomFrame: Math.round(frame.y), firstKustomField: Math.round(field.y) + "–" + Math.round(field.y + field.height), inFirstView: field.y + field.height <= 852 }));
await b.close();
