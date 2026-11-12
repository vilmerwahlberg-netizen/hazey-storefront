// Jämförelse i samma riktiga kassa och samma korg: previewn idag (gammalt block i CSS-fältet),
// ren nativ, underkända 2e7004b (Task 18), koncept A och B. 393 + 1440. Ingen order.
import fs from "node:fs"; import path from "node:path";
import { chromium, filledCheckout, emptyCart, stripThemeCheckout, css, ROOT } from "./lib.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const rd = f => fs.readFileSync(f, "utf8");
const dist = rd(path.join(ROOT, "dist/theme8/hazey-theme8-checkout.css"));
const PKG = dist.slice(dist.indexOf("/* GENERERAD av build-theme8.js"));
const BASE = rd(path.join(ROOT, "theme8/css/00-foundation.css")) + "\n:root{" + (rd(path.join(ROOT, "theme8/css/01-base.css")).match(/--hz8-font-display:[^;]+;\s*--hz8-font-ui:[^;]+;/) || [""])[0] + "}\n" + PKG;
const T18 = rd(path.join(ROOT, "../hazey-storefront-checkout-header/dist/theme8/hazey-theme8-checkout.css"));
const C = d => BASE + rd(path.join(DIR, "concepts/shared.css")) + rd(path.join(DIR, "concepts", d));
const STATES = [["today", null], ["native", ""], ["t18", T18], ["A", C("A-kvittot.css")], ["B", C("B-olivramen.css")]];
const only = process.env.STATES ? process.env.STATES.split(",") : null;
const b = await chromium.launch(); const out = {};
for (const w of (process.env.WIDTHS || "393,1440").split(",").map(Number)) {
  const { ctx, p, cart, h } = await filledCheckout(b, w); out[w] = { cart };
  if (cart.length !== 2) console.error("OVÄNTAD KORG", cart);
  let stripped = false;
  for (const [k, text] of STATES) {
    if (only && !only.includes(k) && k !== "today") continue;
    if (text !== null && !stripped) { await stripThemeCheckout(p); stripped = true; }
    await css(p, text || ""); await p.waitForTimeout(600);
    const m = await p.evaluate(() => { const q = s => { const e = document.querySelector(s); if (!e || !e.getClientRects().length) return null; const r = e.getBoundingClientRect(); return Math.round(r.top + scrollY); };
      return { firstItem: q(".checkout-items-summary article.item"), secondItem: q(".checkout-items-summary article.item + article.item"), total: q(".checkout-total"), coupon: q("#coupon_code"), kustom: q("#kustom-checkout"), country: q(".country-select select"), docH: document.documentElement.scrollHeight, overflowX: document.documentElement.scrollWidth - innerWidth,
        couponReachable: (() => { const i = document.getElementById("coupon_code"); return !!(i && i.getClientRects().length && getComputedStyle(i).visibility !== "hidden"); })() }; });
    m.inFold = { items: m.secondItem != null && m.secondItem < h, total: m.total != null && m.total < h, coupon: m.coupon != null && m.coupon < h };
    out[w][k] = m;
    await p.evaluate(() => scrollTo(0, 0));
    await p.screenshot({ path: path.join(DIR, `shots/${k}-${w}-fold.png`) });
    /* Helsida: fönstret sträcks till sidhöjden så att Kustoms ram (cross-origin) målas. */
    await p.setViewportSize({ width: w, height: Math.min(m.docH, 4000) }); await p.waitForTimeout(2500);
    await p.screenshot({ path: path.join(DIR, `shots/${k}-${w}-full.png`) });
    await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(800);
    if (k === "A" || k === "B") {
      // Rabattkod via tangentbord (ogiltig) -- påverkar inte korgen
      await p.locator("#coupon_code").focus(); await p.keyboard.type("HZTEST"); await p.keyboard.press("Tab"); await p.keyboard.press("Enter"); await p.waitForTimeout(3000);
      m.couponMsg = await p.evaluate(() => document.querySelector(".coupon-code")?.innerText.replace(/\s+/g, " ").trim());
      await p.screenshot({ path: path.join(DIR, `shots/${k}-${w}-coupon.png`), clip: await p.locator(".checkout-items-summary").boundingBox().then(bb => ({ x: 0, y: Math.max(0, bb.y), width: w, height: Math.min(1200, bb.height + 16) })) }).catch(() => { });
      await p.fill("#coupon_code", ""); await p.waitForTimeout(500);
    }
  }
  out[w].cleaned = await emptyCart(p); await ctx.close();
}
fs.writeFileSync(path.join(DIR, "runs/compare.json"), JSON.stringify(out, null, 1));
for (const [w, R] of Object.entries(out)) { console.log("\n==", w, R.cart, "tömd:", R.cleaned); for (const k of STATES.map(s => s[0])) if (R[k]) console.log(k.padEnd(7), JSON.stringify(R[k])); }
await b.close();
