// Följer tabbordningen visuell ordning med reading-flow på .checkout-layout? (ren nativ, 393)
import fs from "node:fs"; import path from "node:path";
import { chromium, filledCheckout, emptyCart, stripThemeCheckout, css } from "./lib.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch(); const { ctx, p } = await filledCheckout(b, 393); await stripThemeCheckout(p);
const out = { version: b.version() };
for (const [k, c] of [["native", ""], ["flex-visual", "body.checkout-page .checkout-layout{reading-flow:flex-visual}"]]) {
  await css(p, c + "body.checkout-page .coupon-code__form{display:block!important}");
  await p.evaluate(() => { scrollTo(0, 0); document.querySelector(".checkout-back a").focus(); });
  const seq = [];
  const rd = () => p.evaluate(() => { const e = document.activeElement; const r = e.getBoundingClientRect(); return { t: (e.getAttribute("aria-label") || e.textContent || e.id || e.tagName).replace(/\s+/g, " ").trim().slice(0, 20), tag: e.tagName, id: e.id, y: Math.round(r.top + scrollY), parent: e.parentElement && (e.parentElement.id || e.parentElement.className) }; });
  for (let i = 0; i < 22; i++) { await p.keyboard.press("Tab"); await p.waitForTimeout(150);
    const a = await rd(); seq.push(a.t + "@" + a.y + (a.tag === "IFRAME" ? "[" + a.parent + "]" : "")); if (a.id === "klarna-checkout-iframe") break; }
  // Skift+Tab från Kustom-ramen bakåt 3 steg
  for (let i = 0; i < 3; i++) { await p.keyboard.press("Shift+Tab"); await p.waitForTimeout(150); const a = await rd(); seq.push("⇧" + a.t + "@" + a.y); }
  // baklänges från Kustom-ramen
  out[k] = seq.join(" → ");
}
fs.writeFileSync(path.join(DIR, "runs/reading-flow.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
await emptyCart(p); await b.close();
