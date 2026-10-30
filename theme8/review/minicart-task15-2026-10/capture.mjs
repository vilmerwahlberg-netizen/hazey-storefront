// TASK 15 före-inventering. node capture.mjs [widths] [states]
// Varje fall = ny kontext = ny sessionsvarukorg. Inget köp, ingen admin.
import { chromium, ctxFor, open, add, openCart, DIR } from "./lib.mjs"; import fs from "node:fs";
const [wArg = "393,1440", sArg = ""] = process.argv.slice(2);
const VP = { 320: [320, 700], 393: [393, 852], 430: [430, 932], 1440: [1440, 900], 1920: [1920, 1080], z200: [720, 450, 2] };
const PDP = "/sv/products/vape-thc-a-45-faraoh-2ml";
const STATES = {
  empty: { items: [] },
  simple: { items: [[183, 1]] },
  variant: { items: [[130, 1]] },
  multi: { items: [[130, 1], [197, 2], [177, 1], [230, 1]] },
  long: { items: [[156, 1], [180, 1], [130, 1]] },
  tier: { items: [[130, 3]] },
  sale: { items: [[165, 1], [230, 1]] },
  plus: { items: [[130, 1]], act: "plus" },
  minus: { items: [[130, 2]], act: "minus" },
  remove: { items: [[130, 1], [197, 1]], act: "remove" },
  removeLast: { items: [[183, 1]], act: "remove" },
  stocklimit: { items: [[183, 7]], act: "plus" },
  netfail: { items: [[130, 1]], act: "plus", fail: "abort" },
  apierr: { items: [[130, 1]], act: "plus", fail: "500" },
  apistock: { items: [[130, 1]], act: "plus", fail: "422" },
  loading: { items: [[130, 1]], act: "plus", fail: "slow", shotAt: 700 }
};
const widths = wArg.split(","); const only = sArg ? sArg.split(",") : null;
const b = await chromium.launch(); const R = {};
const metrics = () => {
  const a = document.getElementById("cartAside"); const wrap = document.getElementById("cart-side-wrap");
  const r = el => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
  const st = HZ8.store(); const c = st.state.cart.cart || {};
  const q = s => a.querySelectorAll(s).length;
  return {
    open: wrap.classList.contains("is-active"), vw: innerWidth, vh: innerHeight,
    aside: r(a), footer: r(a.querySelector(".section.footer")), cta: r(a.querySelector(".section.footer .button.buy")),
    ctaLabel: (a.querySelector(".section.footer .button.buy") || {}).getAttribute?.("data-hz8-label") || null,
    ctaInFirstViewport: (() => { const c = a.querySelector(".section.footer .button.buy"); if (!c) return null; const b = c.getBoundingClientRect(); return b.bottom <= innerHeight && b.top >= 0; })(),
    firstItem: r(a.querySelector("article.item")),
    tapTargets: [...a.querySelectorAll("article.item .amount-input .button")].slice(0, 4).map(x => { const b = x.getBoundingClientRect(); return [x.getAttribute("aria-label"), Math.round(b.width), Math.round(b.height)]; }),
    qtyValues: [...a.querySelectorAll("article.item input[name=quantity]")].map(i => i.value),
    asideScroll: [a.scrollHeight, a.clientHeight],
    hOverflow: document.documentElement.scrollWidth > innerWidth || a.scrollWidth > a.clientWidth + 1,
    htmlOverflow: getComputedStyle(document.documentElement).overflow,
    injected: { goal: q(".hz8-goal"), count: q(".hz8-cart-count"), upgrade: q(".hz8-upgrade"), savings: q(".hz8-cart-savings"), trust: q(".hz8-cart-trust"), xsell: q(".hz8-xsell"), ship: q(".hz8-cart-shipline"), emptyLinks: q(".hz8-cart-empty-links"), live: document.querySelectorAll("#hz8-cart-live").length },
    texts: { header: (a.querySelector(".header h2") || {}).textContent?.replace(/\s+/g, " ").trim(), goal: (a.querySelector(".hz8-goal") || {}).textContent?.trim(), ship: (a.querySelector(".hz8-cart-shipline") || {}).textContent?.trim(), sum: (a.querySelector(".sum") || {}).textContent?.replace(/\s+/g, " ").trim(), tax: (a.querySelector(".tax") || {}).textContent?.replace(/\s+/g, " ").trim(), savings: (a.querySelector(".hz8-cart-savings") || {}).textContent, upgrades: [...a.querySelectorAll(".hz8-upgrade__text")].map(x => x.textContent), xsell: [...a.querySelectorAll(".hz8-xsell__text a")].map(x => x.textContent), live: (document.getElementById("hz8-cart-live") || {}).textContent, notices: [...document.querySelectorAll(".notification, .toast, .snackbar, [role=alert], .message.is-danger, .nh-toast, .notices .notice, .vue-notification")].filter(n => n.offsetParent).map(n => n.textContent.replace(/\s+/g, " ").trim()).slice(0, 4), itemsText: [...a.querySelectorAll("article.item")].map(x => x.querySelector(".content").textContent.replace(/\s+/g, " ").trim() + " | " + (x.querySelector(":scope > .total") || {}).textContent?.replace(/\s+/g, " ").trim()) },
    vuex: { count: c.quantity_count, total: c.formatted_total, coupon: c.cart_coupon, checkout_message: c.checkout_message, items: (c.items || []).map(i => ({ id: i.id, name: i.name, variant: (i.option_values || []).map(o => o.option.name + ":" + o.name).join(","), qty: i.quantity, price: i.formatted_price, total: i.formatted_total, has_compare: i.has_compare, cmp: i.formatted_comparison_row_total, discount: i.discount, discount_type: i.discount_type, max: i.maximum_quantity_to_order })), upsell: st.state.cart.isUpsellingOpen, accessories: (st.state.cart.accessories || []).length }
  };
};
for (const w of widths) for (const [key, S] of Object.entries(STATES)) {
  if (only && !only.includes(key)) continue;
  const [vw, vh, zoom] = VP[w];
  const ctx = await ctxFor(b, vw, vh, zoom ? { zoom } : {});
  const net = []; ctx.on("response", r => { if (/frontend-api\/cart/.test(r.url()) && r.request().method() !== "GET") net.push({ m: r.request().method(), u: r.url().replace(/^.*frontend-api/, ""), s: r.status(), body: (r.request().postData() || "").slice(0, 100) }); });
  ctx.on("requestfailed", r => { if (/frontend-api\/cart/.test(r.url())) net.push({ m: r.method(), u: r.url().replace(/^.*frontend-api/, ""), failed: r.failure() && r.failure().errorText }); });
  const res = { key, w };
  try {
    const p = await open(ctx, PDP);
    for (const [v, q] of S.items) res["add" + v] = await add(p, v, q);
    await p.evaluate(() => scrollTo(0, 0));
    await openCart(p);
    await p.waitForTimeout(2500); // xsell/upgrade fetchar
    res.before = await p.evaluate(metrics);
    const base = `${DIR}/before/${w}-${key}`;
    if (S.act) {
      ctx.failMode = S.fail || null;
      const sel = S.act === "plus" ? 'article.item .button[aria-label="Öka antalet"]' : S.act === "minus" ? 'article.item .button[aria-label="Minska antalet"]' : 'article.item .button[aria-label="Ta bort varan"]';
      await p.locator(sel).first().click();
      if (S.shotAt) { await p.waitForTimeout(S.shotAt); await p.screenshot({ path: `${base}-during.png` }); res.during = await p.evaluate(metrics); }
      await p.waitForTimeout(S.fail === "slow" ? 7500 : 3000);
      ctx.failMode = null;
      res.after = await p.evaluate(metrics);
    }
    await p.screenshot({ path: `${base}-top.png` });
    await p.evaluate(() => { const a = document.getElementById("cartAside"); a.scrollTop = a.scrollHeight; });
    await p.waitForTimeout(400);
    if (res.before.asideScroll[0] > res.before.asideScroll[1] + 4) await p.screenshot({ path: `${base}-bottom.png` });
    res.errors = p.errors.filter(e => !/favicon|trustpilot|gtm|analytics/i.test(e)).slice(0, 6);
  } catch (e) { res.error = String(e).slice(0, 300); }
  res.net = net; R[`${w}-${key}`] = res;
  console.log(w, key, res.error || "", JSON.stringify((res.after || res.before || {}).texts || {}).slice(0, 260));
  await ctx.close();
}
const f = `${DIR}/runs/capture-${wArg.replace(/,/g, "_")}${sArg ? "-" + sArg.replace(/,/g, "_") : ""}.json`;
fs.writeFileSync(f, JSON.stringify(R, null, 1));
await b.close();
