// TASK 15 efter-verifiering. node after.mjs [widths] [states]
// Varje fall = ny kontext = ny sessionsvarukorg. Inget köp, ingen admin.
// Simulerat (endast i testwebbläsaren): fel/laddning (lib.mjs failMode),
// "coupon-applied" (cart_coupon injiceras i GET-svaret -- ingen riktig kod
// finns i Nyehandel) och "addon-none" (sortimentssidorna blockeras).
import { chromium, ctxFor, open, add, openCart, DIR } from "./lib.mjs"; import fs from "node:fs";
const [wArg = "393,1440", sArg = ""] = process.argv.slice(2);
const VP = { 320: [320, 700], 393: [393, 852], 430: [430, 932], 1440: [1440, 900], 1920: [1920, 1080], z200: [720, 450, 2] };
const FAR = "/sv/products/vape-thc-a-45-faraoh-2ml";
const MS = "/sv/products/vape-magic-sauce-99-2ml?hz8-pkg-review=1&hz8-goals-review=1";
const GR = "?hz8-goals-review=1";
const BAT = "/sv/products/ccell-m4-vape-batteri-510";
const STATES = {
  empty: { items: [] },
  simple: { items: [[183, 1]], note: "en rad, fri frakt ej nådd" },
  variant: { items: [[130, 1]], note: "variant, fri frakt nådd, bonus ej nådd" },
  multi: { items: [[130, 1], [197, 2], [177, 1], [230, 1]] },
  long: { items: [[156, 1], [180, 1], [130, 1]] },
  sale: { items: [[165, 1], [230, 1]] },
  bonus: { items: [[130, 5]], note: "standardläge: mål döljs (ej verifierade i kassan)" },
  goalsShip: { route: FAR + GR, items: [[183, 1]], note: "GRANSKNING ?hz8-goals-review=1: fri frakt ej nådd" },
  goalsBonusOpen: { route: FAR + GR, items: [[130, 1]], note: "GRANSKNING: fri frakt nådd, bonus ej nådd" },
  goalsBonusDone: { route: FAR + GR, items: [[130, 5]], note: "GRANSKNING: bonus nådd (Nyehandels egen mängdtrappa ger radpriset)" },
  addonBattery: { items: [[197, 1]], note: "cart i korgen -> batteri" },
  addonCart: { route: BAT, items: [["bat", 1]], note: "batteri i korgen -> cart" },
  addonNone: { items: [[130, 1]], blockCatalog: true, note: "inget sant tillägg -> ingen modul" },
  couponForm: { items: [[130, 1]], act: "coupon-open" },
  couponInvalid: { items: [[130, 1]], act: "coupon-invalid", note: "riktigt POST /coupon-codes med påhittad kod -> Nyehandels fel" },
  couponApplied: { items: [[130, 1]], coupon: true, note: "SIMULERAD cart_coupon (ingen kod finns i Nyehandel)" },
  plus: { items: [[130, 1]], act: "plus" },
  remove: { items: [[130, 1], [197, 1]], act: "remove" },
  removeLast: { items: [[183, 1]], act: "remove" },
  stocklimit: { items: [[183, 7]], act: "plus" },
  netfail: { items: [[130, 1]], act: "plus", fail: "abort" },
  apierr: { items: [[130, 1]], act: "plus", fail: "500" },
  apistock: { items: [[130, 1]], act: "plus", fail: "422" },
  loading: { items: [[130, 1]], act: "plus", fail: "slow", shotAt: 900 },
  pkgSingle: { route: MS, items: [[191, 1]], note: "granskningsläge, paketprodukt saknas" },
  pkg3: { route: MS, items: [[191, 1]], act: "pkg3" },
  strainComplete: { route: MS, items: [[191, 1]], act: "strain-complete" },
  strainSlot: { route: MS, items: [[191, 1]], act: "strain-slot", note: "plats öppen, slutsålda strains synliga men inaktiva" },
  strainIncomplete: { route: MS, items: [[191, 1]], act: "strain-incomplete" },
  strainSaved: { route: MS, items: [[191, 1]], act: "strain-saved" }
};
const SUBSET = ["empty", "multi", "long", "variant", "goalsBonusOpen", "couponApplied", "stocklimit", "pkg3", "strainComplete", "strainIncomplete", "strainSlot"];
const widths = wArg.split(","); const only = sArg ? sArg.split(",") : null;
const b = await chromium.launch(); const R = {};
const metrics = () => {
  const a = document.getElementById("cartAside"); const wrap = document.getElementById("cart-side-wrap");
  const r = el => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) }; };
  const st = HZ8.store(); const c = st.state.cart.cart || {};
  const q = s => a.querySelectorAll(s).length;
  const t = s => (a.querySelector(s) || {}).textContent?.replace(/\s+/g, " ").trim();
  const cta = a.querySelector(".section.footer .button.buy");
  const foot = a.querySelector(".section.footer");
  const sticky = cta ? (getComputedStyle(foot).display === "contents" ? cta : foot) : null;
  const sb = sticky && sticky.getBoundingClientRect();
  const first = a.querySelector("article.item");
  return {
    open: wrap.classList.contains("is-active"), vw: innerWidth, vh: innerHeight, aside: r(a),
    stickyH: sb ? Math.round(sb.height) : null, stickyPct: sb ? Math.round(sb.height / innerHeight * 100) : null,
    firstRowVisible: first && sb ? first.getBoundingClientRect().bottom <= sb.top + 1 : null,
    ctaLabel: cta && cta.getAttribute("data-hz8-label"), ctaDisabled: cta && cta.getAttribute("aria-disabled"),
    asideScroll: [a.scrollHeight, a.clientHeight],
    hOverflow: document.documentElement.scrollWidth > innerWidth || a.scrollWidth > a.clientWidth + 1 || a.getBoundingClientRect().x < 0,
    htmlOverflow: getComputedStyle(document.documentElement).overflow,
    dialog: { labelledby: a.getAttribute("aria-labelledby"), label: a.getAttribute("aria-label"), heading: t(".header h2") },
    tap: [...a.querySelectorAll("button, a, input")].filter(e => e.offsetParent && e.getBoundingClientRect().width).map(e => { const b = e.getBoundingClientRect(); return [e.getAttribute("aria-label") || e.textContent.trim().slice(0, 24), Math.round(b.width), Math.round(b.height)]; }).filter(x => x[1] < 44 || x[2] < 44).slice(0, 12),
    injected: { goal: q(".hz8-goal"), count: q(".hz8-cart-count"), pack: q(".hz8-pack"), addon: q(".hz8-addon"), ledger: q(".hz8-ledger"), coupon: q(".hz8-coupon"), trust: q(".hz8-trust"), strains: q(".hz8-strains"), msgs: q(".hz8-row-msg"), emptyLinks: q(".hz8-cart-empty-links"), live: document.querySelectorAll("#hz8-cart-live").length },
    texts: { goal: t(".hz8-goal__top"), ends: t(".hz8-goal__ends"), ledger: t(".hz8-ledger__rows"), coupon: t(".hz8-coupon__row"), couponErr: t(".hz8-coupon__err"), sum: t(".section.footer .sum"), sumOverride: a.querySelector(".sum [data-hz8-total]")?.getAttribute("data-hz8-total") || null, addon: t(".hz8-addon"), pack: [...a.querySelectorAll(".hz8-pack")].map(x => x.textContent.replace(/\s+/g, " ").trim()), msgs: [...a.querySelectorAll(".hz8-row-msg")].map(x => x.getAttribute("role") + ": " + x.textContent.trim()), strains: t(".hz8-strains__count") + " | " + t(".hz8-strains__save"), live: (document.getElementById("hz8-cart-live") || {}).textContent, items: [...a.querySelectorAll("article.item")].map(x => x.querySelector(".content")?.textContent.replace(/\s+/g, " ").trim().slice(0, 90) + " | " + x.querySelector(":scope > .total")?.textContent.replace(/\s+/g, " ").trim()) },
    plusDisabled: [...a.querySelectorAll('.amount-input .button[aria-label^="Öka"]')].map(x => x.getAttribute("aria-disabled")),
    qty: [...a.querySelectorAll("article.item input[name=quantity]")].map(i => i.value),
    vuex: { count: c.quantity_count, total: c.formatted_total, coupon: c.cart_coupon && c.cart_coupon.code, items: (c.items || []).map(i => i.name + " ×" + i.quantity + " = " + i.formatted_total) }
  };
};
for (const w of widths) for (const [key, S] of Object.entries(STATES)) {
  if (only && !only.includes(key)) continue;
  if (!only && !["393", "1440"].includes(w) && !SUBSET.includes(key)) continue;
  const [vw, vh, zoom] = VP[w];
  const ctx = await ctxFor(b, vw, vh, zoom ? { zoom } : {});
  if (S.blockCatalog) await ctx.route(/\/sv\/categories\/(alla-produkter|pennor|alla-cartridges)/, r => ["fetch", "xhr"].includes(r.request().resourceType()) ? r.abort("failed") : r.continue());
  if (S.coupon) await ctx.route(/frontend-api\/cart(\?|$)/, async r => {
    if (r.request().method() !== "GET") return r.continue();
    const res = await r.fetch(); let j; try { j = await res.json(); } catch { return r.fulfill({ response: res }); }
    const patch = o => { if (!o || typeof o !== "object") return; if (o.items && o.totals && o.items.length) { const v = o.totals.incVat.money.value / 10000; const off = Math.round(v * 10) / 100; o.cart_coupon = { id: 999999, code: "SIMULERAD10", cart_discount: off * 10000, cart_discount_formatted: off.toLocaleString("sv-SE") + " kr", cart_discount_ex_vat_formatted: "" }; } Object.values(o).forEach(patch); };
    patch(j); return r.fulfill({ response: res, json: j });
  });
  const writes = []; ctx.on("request", r => { if (/frontend-api\/(cart|coupon)/.test(r.url()) && r.method() !== "GET") writes.push(r.method() + " " + r.url().replace(/^.*frontend-api/, "")); });
  const res = { key, w, note: S.note || "" };
  try {
    const p = await open(ctx, S.route || FAR);
    for (const [v, qn] of S.items) {
      let vid = v;
      if (v === "bat") vid = await p.evaluate(async () => (await HZ8.productState("/sv/products/ccell-m4-vape-batteri-510")).variantId);
      res["add" + vid] = await add(p, vid, qn);
    }
    await p.evaluate(() => scrollTo(0, 0));
    await openCart(p);
    await p.waitForTimeout(4500); // tillägg/paketdata + bilder
    writes.length = 0;
    const base = `${DIR}/after/${w}-${key}`;
    const clickWait = async (sel, ms = 900) => { await p.locator(sel).first().click(); await p.waitForTimeout(ms); };
    if (S.act) {
      ctx.failMode = S.fail || null;
      if (S.act === "plus") { await clickWait('#cartAside article.item .button[aria-label^="Öka antalet"]', 10); }
      if (S.act === "remove") { await clickWait('#cartAside article.item .button[aria-label^="Ta bort varan"]', 10); }
      if (S.act === "coupon-open") await clickWait(".hz8-coupon__toggle");
      if (S.act === "coupon-invalid") { await clickWait(".hz8-coupon__toggle"); await p.fill("#hz8-coupon-input", "HZ8TEST15FINNSINTE"); await p.keyboard.press("Enter"); await p.waitForTimeout(3500); }
      if (/^pkg3|^strain/.test(S.act) && S.act !== "strain-incomplete") await clickWait('.hz8-pack__step[data-hz8-step="strain:3"]');
      if (S.act === "strain-incomplete") await clickWait('.hz8-pack__step[data-hz8-step^="collection:"]');
      if (/^strain/.test(S.act)) await clickWait(".hz8-pack__edit");
      if (S.act === "strain-slot") await clickWait('.hz8-slot__btn[data-hz8-slot="1"]');
      if (S.act === "strain-saved") { await clickWait(".hz8-slot__btn[data-hz8-slot=\"1\"]"); await clickWait(".hz8-opt:not([aria-disabled])>>nth=1"); await clickWait(".hz8-strains__save", 1200); }
      if (S.shotAt) { await p.waitForTimeout(S.shotAt); await p.screenshot({ path: `${base}-during.png` }); res.during = await p.evaluate(metrics); }
      if (["plus", "remove"].includes(S.act)) await p.waitForTimeout(S.fail === "slow" ? 8000 : 4000);
      ctx.failMode = null;
    }
    res.after = await p.evaluate(metrics);
    res.focus = await p.evaluate(() => { const e = document.activeElement; return e ? e.tagName + " " + (e.getAttribute("aria-label") || e.textContent.trim().slice(0, 40)) : null; });
    await p.screenshot({ path: `${base}-top.png` });
    const [sh, ch] = res.after.asideScroll;
    if (sh > ch + 4) {
      await p.evaluate(() => { const a = document.getElementById("cartAside"); a.scrollTop = a.scrollHeight; }); await p.waitForTimeout(400);
      await p.screenshot({ path: `${base}-bottom.png` });
      await p.setViewportSize({ width: vw, height: Math.min(sh + 2, 4000) }); await p.waitForTimeout(700);
      await p.evaluate(() => { document.getElementById("cartAside").scrollTop = 0; });
      await p.screenshot({ path: `${base}-full.png` });
    }
    res.writes = writes.slice();
    res.errors = p.errors.filter(e => !/favicon|trustpilot|gtm|analytics|recaptcha|ERR_ADDRESS_UNREACHABLE/i.test(e)).slice(0, 6);
  } catch (e) { res.error = String(e).slice(0, 300); }
  R[`${w}-${key}`] = res;
  const m = res.after || {};
  console.log(w, key, res.error || "", "sticky%", m.stickyPct, "row1", m.firstRowVisible, "hOvf", m.hOverflow, "writes", JSON.stringify(res.writes), JSON.stringify(m.texts || {}).slice(0, 300));
  await ctx.close();
}
const f = `${DIR}/runs/after-${wArg.replace(/,/g, "_")}${sArg ? "-" + sArg.replace(/,/g, "_") : ""}.json`;
fs.writeFileSync(f, JSON.stringify(R, null, 1));
await b.close();
