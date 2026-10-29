// TASK 10B -- 10B-0:s slutsåld-skydd i den universella adaptern: 84 tar
// slut efter att sidan laddats, köpförsök via adapterns CTA (1440) och
// mobilens sticky köpzon (393).
//   state-zero      84 är "alltid beställbar" redan vid laddning; lagret
//                   går till 0 -> Nyehandels server skulle acceptera (200)
//   sold-normal     lagret tar slut, servern avvisar som för en slutsåld
//                   variant (406 {"available":0}, 10B-0 server-cart-probe)
//   button-removed  Nyehandel ersätter köpknappen (som vid slutsåld variant)
// Krav: ingen rad i varukorgen, köpzonen blir "Slutsåld" (CTA, antal och
// sticky borta). node stale.mjs <before|after>
import { chromium, ctxFor, open, ready, DIR } from "./lib.mjs"; import fs from "node:fs";
import { PRODUCTS } from "./products.mjs";
const [which = "after"] = process.argv.slice(2);
const b = await chromium.launch(); const R = {};
for (const w of [393, 1440]) for (const mode of ["state-zero", "sold-normal", "button-removed"]) {
  const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which });
  const flip = { on: false };
  await ctx.route(/frontend-api\/product\/state/, async route => {
    try { const res = await route.fetch(); const d = await res.json();
      for (const v of [d.selected_variant, ...((d.product || {}).variants || [])]) if (v) {
        if (mode === "state-zero") v.always_orderable = true;
        if (flip.on && mode !== "button-removed") { v.available_stock = 0; v.display_stock = 0; if (mode === "sold-normal") v.buyable = false; }
      }
      return await route.fulfill({ response: res, json: d }); } catch (e) { /* kontexten stängd */ }
  });
  const posts = [];
  ctx.on("response", r => { if (r.request().method() === "POST" && /frontend-api\/cart\/item/.test(r.url())) posts.push(r.status()); });
  if (mode === "sold-normal") await ctx.route(/frontend-api\/cart\/item/, route => route.request().method() === "POST" && flip.on ? route.fulfill({ status: 406, contentType: "application/json", body: JSON.stringify({ available: 0 }) }) : route.fallback());
  const p = await open(ctx, PRODUCTS[84].route); await ready(p, 5000);
  flip.on = true;
  if (mode === "button-removed") { await p.evaluate(() => { const nb = document.querySelector(".buy-form .button.buy"); nb.parentNode.removeChild(nb); }); await p.waitForTimeout(800); }
  let via;
  if (w < 768) {
    await p.evaluate(() => { const cta = document.querySelector(".hz8-pp__cta"); scrollTo({ top: cta.getBoundingClientRect().bottom + scrollY + 200, behavior: "instant" }); }); await p.waitForTimeout(900);
    const on = await p.evaluate(() => document.querySelector(".hz8-pp-sticky").classList.contains("is-on"));
    via = "sticky " + (on ? "synlig" : "dold");
    if (on) await p.click(".hz8-pp-sticky__cta").catch(() => {});
  } else {
    const vis = await p.evaluate(() => { const c = document.querySelector(".hz8-pp__cta"); return !!c && !c.hidden && c.offsetParent !== null; });
    via = "cta " + (vis ? "synlig" : "dold");
    if (vis) await p.click(".hz8-pp__cta").catch(() => {});
  }
  await p.waitForTimeout(6000);
  const after = await p.evaluate(() => {
    const st = window.HZ8 && HZ8.store && HZ8.store(); const c = st && st.state && st.state.cart && st.state.cart.cart;
    const cta = document.querySelector(".hz8-pp__cta"), sticky = document.querySelector(".hz8-pp-sticky");
    return { cartCount: c ? c.quantity_count : null, stock: (document.querySelector(".hz8-pp__stock") || {}).textContent, ctaVisible: !!cta && !cta.hidden && cta.offsetParent !== null, qtyVisible: !!document.querySelector(".hz8-pp__qty") && document.querySelector(".hz8-pp__qty").offsetParent !== null, stickyOn: !!sticky && sticky.classList.contains("is-on"), bevaka: !!document.querySelector(".monitor__button"), msg: (document.querySelector(".hz8-pp__msg") || {}).textContent };
  });
  await p.screenshot({ path: `${DIR}/runs/shots/${which}-stale-${mode}-${w}.jpg`, type: "jpeg", quality: 72 });
  R[`${mode}-${w}`] = { via, posts, ...after, errors: p.errors.filter(e => !/406/.test(e)) };
  console.log(`${mode}-${w}`, JSON.stringify(R[`${mode}-${w}`]));
  await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/stale-${which}.json`, JSON.stringify(R, null, 1));
await b.close();
