// TASK 10B -- köp via adapterns köpstation hela vägen till Nyehandels
// varukorg: varukorgsanrop (POST /frontend-api/cart*) och raden i
// varukorgslådan. Egen ny sessionsvarukorg per fall; ingen order läggs.
// Fall: 88 antal 2 (1440), 91 byt till annan köpbar strain (1440),
// 84 via mobilens sticky köpzon (393), 57 Faraoh (regression, 1440).
// node buy.mjs <before|after> [fall,..]
import { chromium, ctxFor, open, ready, DIR } from "./lib.mjs"; import fs from "node:fs";
import { PRODUCTS } from "./products.mjs";
const [which = "after", only = ""] = process.argv.slice(2);
const CASES = [
  { key: "88-qty2-1440", id: 88, w: 1440, qty: 2 },
  { key: "91-strain-1440", id: 91, w: 1440, strain: true },
  { key: "84-sticky-393", id: 84, w: 393, sticky: true },
  { key: "57-faraoh-1440", id: 57, w: 1440 },
  { key: "2-color-393", id: 2, w: 393 }
].filter(c => !only || only.split(",").includes(c.key));
const b = await chromium.launch(); const R = {};
for (const c of CASES) {
  const ctx = await ctxFor(b, c.w, c.w < 768 ? 852 : 900, { which });
  const posts = []; ctx.on("response", r => { if (r.request().method() === "POST" && /frontend-api\/cart/.test(r.url())) posts.push({ url: r.url().replace(/^.*frontend-api/, ""), status: r.status(), body: (r.request().postData() || "").slice(0, 120) }); });
  const p = await open(ctx, PRODUCTS[c.id].route); await ready(p, 5000);
  const res = { key: c.key };
  try {
    if (c.qty) for (let i = 1; i < c.qty; i++) { await p.click('.hz8-pp__qbtn[data-step="1"]'); await p.waitForTimeout(150); }
    if (c.strain) {
      res.chose = await p.evaluate(() => { const t = [...document.querySelectorAll(".hz8-pp__tile")].find(b => b.getAttribute("aria-pressed") !== "true" && b.getAttribute("aria-disabled") !== "true"); t.click(); return t.querySelector(".hz8-pp__tile-name").textContent; });
      await p.waitForTimeout(1500);
      res.report = await p.evaluate(() => (document.querySelector(".hz8-acc__report") || {}).textContent);
    }
    res.station = await p.evaluate(() => ({ price: document.querySelector(".hz8-pp__price").textContent, qty: (document.querySelector(".hz8-pp__qval") || {}).textContent, cta: document.querySelector(".hz8-pp__cta").textContent, selected: (document.querySelector('.hz8-pp__tile[aria-pressed="true"] .hz8-pp__tile-name') || {}).textContent || null }));
    if (c.sticky) {
      await p.evaluate(() => { const cta = document.querySelector(".hz8-pp__cta"); scrollTo({ top: cta.getBoundingClientRect().bottom + scrollY + 200, behavior: "instant" }); });
      await p.waitForTimeout(900);
      res.stickyOn = await p.evaluate(() => { const s = document.querySelector(".hz8-pp-sticky"); return !!s && s.classList.contains("is-on"); });
      await p.click(".hz8-pp-sticky__cta");
    } else await p.click(".hz8-pp__cta");
    await p.waitForFunction(() => /Tillagd|har lagts/.test((document.querySelector(".hz8-pp__cta") || {}).textContent + (document.querySelector(".hz8-pp__msg") || {}).textContent) || document.querySelector("#cart-side-wrap.is-active"), null, { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(1200);
    res.msg = await p.evaluate(() => (document.querySelector(".hz8-pp__msg") || {}).textContent);
    res.cart = await p.evaluate(() => { const st = window.HZ8 && HZ8.store && HZ8.store(); const c = st && st.state && st.state.cart && st.state.cart.cart; return c ? { count: c.quantity_count, items: (c.items || []).map(i => (i.name || i.product_name || "").slice(0, 60) + " ×" + i.quantity + " " + (i.variant_name || i.option_values || "")) } : null; });
  } catch (e) { res.error = String(e).slice(0, 200); }
  res.posts = posts; res.errors = p.errors;
  R[c.key] = res; console.log(JSON.stringify(res));
  await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/buy-${which}${only ? "-" + only.replace(/,/g, "_") : ""}.json`, JSON.stringify(R, null, 1));
await b.close();
