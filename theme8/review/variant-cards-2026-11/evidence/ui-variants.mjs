// TASK 23 — variantkort, paketfilter och D10/Faraoh-paket i Theme 8-previewn (lokal build). Ingen order; korgen töms.
// Kör: node ui-variants.mjs [filter]   VP=393|768|1440|1920
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, url } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const VP = +(process.env.VP || 1440), M = VP < 768, SUF = "-" + VP;
const VH = M ? 852 : VP === 768 ? 1024 : VP >= 1920 ? 1080 : 1000;
const UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36";
const only = process.argv[2] ? new RegExp(process.argv[2]) : null;
const b = await chromium.launch(); const all = {};
const newPage = async route => {
  const ctx = await ctxFor(M ? { newContext: o => b.newContext({ ...o, userAgent: UA }) } : b, VP, VH, { which: "after" });
  const p = await open(ctx, route); await ready(p, 8000);
  try { await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 1500 }); } catch { }
  return { ctx, p };
};
const api = (p, method, u, body) => p.evaluate(async ({ method, u, body }) => {
  const x = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || "");
  const r = await fetch("/frontend-api/" + u, { method, credentials: "same-origin", headers: { Accept: "application/json", "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest", "X-XSRF-TOKEN": x }, body: body ? JSON.stringify(body) : undefined });
  let j = null; try { j = await r.json(); } catch { } return { status: r.status, json: j };
}, { method, u, body });
const expandAll = async p => { for (let i = 0; i < 25; i++) { const m = p.locator(".hz8-series-results__more:visible, .hz8-pmore__btn:visible").first(); if (!(await m.count())) break; await m.click().catch(() => { }); await p.waitForTimeout(400); } };
const listState = p => p.evaluate(() => {
  const vis = e => !!e && e.getClientRects().length > 0 && getComputedStyle(e).display !== "none";
  const H = document.documentElement;
  const cards = [...document.querySelectorAll("#store-main .product-card")].filter(vis).filter(c => H.classList.contains("hz8-sh-pilot") ? !!c.closest(".hz8-sh-shelf") : H.classList.contains("hz8-series-hub") ? !!c.closest(".hz8-hub__rail") : !c.closest(".hz8-prail, .hz8-cat-popular"));
  const t = s => { const e = document.querySelector(s); return e && vis(e) ? e.textContent.replace(/\s+/g, " ").trim() : null; };
  const count = t(".hz8-sh-hero__count") || t(".hz8-ptool__count") || t(".hz8-pcount") || t(".hz8-sf-count") || t(".hz8-series-status__text");
  return { count, countN: count ? +(count.match(/\d+/) || [])[0] : null, n: cards.length, overflow: document.documentElement.scrollWidth > innerWidth + 1,
    cards: cards.map(c => ({ v: c.getAttribute("data-hz8-variant"), st: c.getAttribute("data-hz8-instock"), brand: (c.querySelector(".brand") || {}).textContent?.trim(), name: (c.querySelector(".name") || {}).textContent?.trim(), href: ((c.querySelector("a[href]") || {}).getAttribute?.("href") || "").replace(/^https:\/\/[^/]+/, ""), img: (c.querySelector(".product-card__image img") || {}).getAttribute?.("src") || "", pill: !!c.querySelector(".hz8-card-pill") && vis(c.querySelector(".hz8-card-pill")), sold: !!c.querySelector(".hz8-psold") })) };
});
const isPkg = c => /[-–]\s*[35]\s*-?pack\s*(\(blandbart\))?$/i.test(c.name || "") || /blandbart|pilot-t19/.test(c.href);
const shot = (p, n) => p.screenshot({ path: path.join(DIR, "shots", n + SUF + ".png") });
const SC = {
  "L1-alla-vapes": async () => {
    const { ctx, p } = await newPage("/sv/categories/alla-vapes"); await expandAll(p); const s = await listState(p); await p.evaluate(() => scrollTo(0, 0)); await shot(p, "L1-alla-vapes");
    const core = s.cards.filter(c => /thc-x-vape-hero-core-2ml\/\d+$/.test(c.href)), ms2 = s.cards.filter(c => /vape-magic-sauce-magic-farmers-2ml\/\d+$/.test(c.href)), ms5 = s.cards.filter(c => /magic-sauce-vape-5ml\/\d+$/.test(c.href));
    const d10 = s.cards.filter(c => /d10-vape-magic-farmers\/\d+$/.test(c.href)), far = s.cards.filter(c => /(thcba-vape-faraoh-2ml|thca-b-vape-faraoh-2ml)\/\d+$/.test(c.href));
    const soldBuyable = s.cards.filter(c => c.st === "0" && c.pill);
    const r = { count: s.count, n: s.n, core: core.map(c => c.name), ms2: ms2.length, ms5: ms5.length, d10: d10.length, faraoh2ml: far.length, pkg: s.cards.filter(isPkg).map(c => c.name), soldBuyable: soldBuyable.length, overflow: s.overflow, dupHref: s.cards.length - new Set(s.cards.map(c => c.href)).size };
    r.pass = s.countN === s.n && core.length === 6 && ms2.length === 9 && ms5.length === 5 && d10.length === 5 && far.length === 12 && !r.pkg.length && !soldBuyable.length && !s.overflow && !r.dupHref && d10.every(c => c.st === "0" && c.sold);
    await ctx.close(); return r;
  },
  "L2-i-lager": async () => {
    const { ctx, p } = await newPage("/sv/categories/alla-vapes?filters=smart-filter_in-stock"); await expandAll(p); const s = await listState(p);
    const r = { count: s.count, n: s.n, notInStock: s.cards.filter(c => c.v && c.st !== "1").map(c => c.name), ms2: s.cards.filter(c => /magic-farmers-2ml\/\d+$/.test(c.href)).map(c => c.name), d10: s.cards.filter(c => /d10-vape/.test(c.href)).length, overflow: s.overflow };
    r.pass = s.countN === s.n && !r.notInStock.length && JSON.stringify(r.ms2.sort()) === JSON.stringify(["Gorilla Cookies", "Tinky Winky"]) && !r.d10 && !s.overflow;
    await ctx.close(); return r;
  },
  "L3-sok-gelato": async () => {
    const { ctx, p } = await newPage("/sv/categories/alla-produkter?q=gelato"); await p.waitForTimeout(3000); await expandAll(p); const s = await listState(p); await shot(p, "L3-sok-gelato");
    const r = { count: s.count, n: s.n, names: s.cards.map(c => c.brand + " | " + c.name) };
    r.pass = s.n >= 1 && s.cards.some(c => /hero-core-2ml\/425$/.test(c.href)) && s.cards.every(c => /gelato/i.test(c.name + " " + c.brand + " " + c.href)) && (s.countN == null || s.countN === s.n) && !s.overflow;
    await ctx.close(); return r;
  },
  "L4-ms-vapes": async () => {
    const { ctx, p } = await newPage("/sv/categories/ms-vapes"); await expandAll(p); const s = await listState(p); await p.evaluate(() => scrollTo(0, 0)); await shot(p, "L4-ms-vapes");
    const r = { count: s.count, n: s.n, pkg: s.cards.filter(isPkg).map(c => c.name), variants: s.cards.filter(c => c.v).length, overflow: s.overflow };
    r.pass = s.countN === s.n && !r.pkg.length && r.variants >= 14 && !s.overflow;
    await ctx.close(); return r;
  },
  "L5-hubbar": async () => {
    const out = {};
    for (const route of ["/sv/categories/magic-sauce", "/sv/categories/hero-vapes", "/sv/categories/d10-1", "/sv/categories/thca-b", "/sv/categories/thcba"]) {
      const { ctx, p } = await newPage(route); await p.waitForTimeout(2500); const s = await listState(p);
      out[route] = { count: s.count, n: s.n, variants: s.cards.filter(c => c.v).length, pkg: s.cards.filter(isPkg).length, soldBuyable: s.cards.filter(c => c.st === "0" && c.pill).length, overflow: s.overflow };
      if (route.endsWith("magic-sauce")) await shot(p, "L5-hub-magic-sauce");
      await ctx.close();
    }
    const v = Object.values(out);
    return { ...out, pass: v.every(x => !x.pkg && !x.soldBuyable && !x.overflow) && out["/sv/categories/magic-sauce"].variants >= 14 && out["/sv/categories/hero-vapes"].variants >= 6 && out["/sv/categories/d10-1"].variants === 5 };
  },
  "P1-kort-till-pdp-och-paket": async () => {
    const { ctx, p } = await newPage("/sv/categories/core-vapes"); await expandAll(p);
    const card = p.locator('.product-card[data-hz8-variant="431"] a.product-card__image').first();
    await card.click(); await p.waitForURL(u => /thc-x-vape-hero-core-2ml\/431/.test(u), { timeout: 30000 }).catch(() => { }); await ready(p, 4000);
    const pdp = await p.evaluate(() => ({ url: location.pathname, tile: (document.querySelector('.hz8-pp__tile[aria-pressed="true"] .hz8-pp__tile-name') || {}).textContent, select: (document.querySelector("#product-variants select") || {}).value, choice: !!document.querySelector(".hz8-pp__choice:not([hidden])"), cta: (document.querySelector(".hz8-pp__cta") || {}).textContent }));
    await shot(p, "P1-pdp-forvald");
    await p.locator('.hz8-pc[data-qty="3"]').click().catch(() => { }); await p.waitForTimeout(600);
    pdp.pack = await p.evaluate(() => [...document.querySelectorAll(".hz8-up__name > span:first-child")].map(e => e.textContent));
    const r = { ...pdp, pass: /\/431$/.test(pdp.url) && /Melon Haze/.test(pdp.tile || "") && pdp.select === undefined || true };
    r.pass = /\/431$/.test(pdp.url) && /Melon Haze/.test(pdp.tile || "") && pdp.choice && (pdp.pack || [])[0] === "Melon Haze";
    await ctx.close(); return r;
  },
  "P2-vanligt-kop-fran-kort": async () => {
    const { ctx, p } = await newPage("/sv/categories/alla-vapes"); await expandAll(p);
    const posts = []; p.on("request", rq => { if (/\/frontend-api\/cart\/item$/.test(rq.url()) && rq.method() === "POST") posts.push(rq.postData()); });
    const pill = p.locator('.product-card[data-hz8-variant="451"] .hz8-card-pill').first();
    await pill.scrollIntoViewIfNeeded(); await pill.click(); await p.waitForTimeout(4000);
    const cart = (await api(p, "GET", "cart")).json.data;
    await p.evaluate(() => window.HZ8.store().dispatch("cart/reload").then(() => window.HZ8.store().dispatch("cart/open"))); await p.waitForTimeout(3000);
    const mini = await p.evaluate(() => [...document.querySelectorAll("#cartAside article.item")].map(a => a.innerText.replace(/\s+/g, " ").slice(0, 160)));
    await shot(p, "P2-minicart");
    for (const it of cart.items) await api(p, "DELETE", "cart/item/" + it.id);
    const cleaned = (await api(p, "GET", "cart")).json.data.items.length === 0;
    const r = { cart: cart.items.map(i => [i.variant_id, i.quantity, i.formatted_total]), mini, cleaned };
    r.pass = cart.items.length === 1 && cart.items[0].variant_id === 451 && +cart.items[0].quantity === 1 && mini.some(t => /Kowa Bunga/.test(t)) && cleaned;
    await ctx.close(); return r;
  },
  "D1-d10-slutsald-pdp": async () => {
    const { ctx, p } = await newPage("/sv/categories/d10-vapes"); await expandAll(p);
    const s = await listState(p);
    await p.locator('.product-card[data-hz8-variant="424"] a.product-card__image').first().click(); await p.waitForURL(u => /d10-vape-magic-farmers\/424/.test(u), { timeout: 30000 }).catch(() => { }); await ready(p, 6000);
    const pdp = await p.evaluate(() => ({ url: location.pathname, tile: (document.querySelector('.hz8-pp__tile[aria-pressed="true"] .hz8-pp__tile-name') || {}).textContent, stock: (document.querySelector(".hz8-pp__stock") || {}).textContent, cta: (() => { const c = document.querySelector(".hz8-pp__cta"); return c && c.getClientRects().length && !c.hidden ? c.textContent : null; })(), choice: (() => { const e = document.querySelector(".hz8-pp__choice"); return !!e && !e.hidden && e.getClientRects().length > 0; })(), monitor: !!document.querySelector(".buy-controls.hz8-pp-monitor"), pkg: window.HZ8.packageUpsells ? window.HZ8.packageUpsells() : null }));
    await shot(p, "D1-d10-pdp-slutsald");
    const r = { listCount: s.count, listN: s.n, ...pdp };
    r.pass = s.countN === s.n && s.cards.every(c => c.st === "0" && !c.pill) && /\/424$/.test(pdp.url) && /Lemon Cheese/.test(pdp.tile || "") && !pdp.cta && !pdp.choice && pdp.monitor && pdp.pkg && pdp.pkg.sizes.map(x => x.qty + ":" + x.packageId).join(",") === "3:270,5:271";
    await ctx.close(); return r;
  },
  "D2-paketlank-och-pivots": async () => {
    const out = {};
    const { ctx, p } = await newPage("/sv/categories/alla-vapes");
    for (const [route, home, n] of [["/sv/products/d10-2ml-3-pack-blandbart", "/sv/products/d10-vape-magic-farmers", 3], ["/sv/products/d10-2ml-5-pack-blandbart", "/sv/products/d10-vape-magic-farmers", 5], ["/sv/products/faraoh-thcba-47-2ml-3-pack-blandbart", "/sv/products/thcba-vape-faraoh-2ml", 3], ["/sv/products/faraoh-thcba-47-2ml-5-pack-blandbart", "/sv/products/thcba-vape-faraoh-2ml", 5]]) {
      await p.goto(url(route), { waitUntil: "domcontentloaded" }); await p.waitForURL(u => new URL(u).pathname.startsWith(home), { timeout: 30000 }).catch(() => { }); await p.waitForTimeout(1500);
      const f = await p.evaluate(async r => { const x = await fetch(r, { credentials: "same-origin" }); const h = await x.text(); return { status: x.status, redirected: x.redirected, rows: (h.match(/<package-product-variants/g) || []).length }; }, route);
      out[route] = { landed: new URL(p.url()).pathname, ...f, ok: new URL(p.url()).pathname.startsWith(home) && f.status === 200 && !f.redirected && f.rows === n };
    }
    await ctx.close();
    return { ...out, pass: Object.values(out).every(x => x.ok) };
  }
};
/* TASK 23b: THCA-B (242/256, paket 274-277) inte kopplade; inga ml-flerpack i listorna. */
SC["D3-thca-b-ej-kopplat"] = async () => {
  const out = {};
  const { ctx, p } = await newPage("/sv/products/thca-b-vape-faraoh-2ml");
  await p.waitForTimeout(4000);
  out.pdp242 = await p.evaluate(() => ({ sizes: window.HZ8.packageUpsells ? window.HZ8.packageUpsells().sizes.length : null, choice: !!document.querySelector(".hz8-pp__choice") }));
  await p.goto(url("/sv/products/thca-b-faraoh-carts-1ml"), { waitUntil: "domcontentloaded" }); await ready(p, 4000);
  out.pdp256 = await p.evaluate(() => ({ sizes: window.HZ8.packageUpsells ? window.HZ8.packageUpsells().sizes.length : null, choice: !!document.querySelector(".hz8-pp__choice") }));
  out.links = {};
  for (const r of ["/sv/products/faraoh-thca-b-50-2ml-3-pack-blandbart", "/sv/products/faraoh-thca-b-50-1ml-5-pack-blandbart"]) {
    await p.goto(url(r), { waitUntil: "domcontentloaded" }); await p.waitForTimeout(3500);
    out.links[r] = new URL(p.url()).pathname;
  }
  await ctx.close();
  return { ...out, pass: out.pdp242.sizes === 0 && !out.pdp242.choice && out.pdp256.sizes === 0 && !out.pdp256.choice && Object.entries(out.links).every(([r, l]) => l === r) };
};
SC["L6-inga-flerpack"] = async () => {
  const ML_MULTI = c => /([-–]\s*\d+\s*-?\s*pack|kollektion(en)?)\s*$/i.test((c.name || "").replace(/\s*\(blandbart\)\s*$/i, "")) && /\d+(?:[.,]\d+)?\s*ml\b/i.test((c.brand || "") + " " + (c.name || ""));
  const ANY35 = c => /[-–]\s*[35]\s*-?\s*pack\s*(\(blandbart\))?\s*$/i.test(c.name || "");
  const GRAM10 = c => /[-–]\s*10\s*-?\s*pack\s*$/i.test(c.name || "") && !/ml\b/i.test(c.name || "");
  const out = {};
  for (const route of ["/sv/categories/alla-vapes", "/sv/categories/alla-cartridges", "/sv/categories/alla-liquids", "/sv/categories/ms-vapes", "/sv/categories/core-vapes", "/sv/categories/thcba-vapes", "/sv/categories/alla-produkter", "/sv/categories/magic-sauce", "/sv/categories/hero-vapes"]) {
    const { ctx, p } = await newPage(route); await p.waitForTimeout(2000); await expandAll(p); const s = await listState(p);
    out[route] = { count: s.count, n: s.n, mlMulti: s.cards.filter(ML_MULTI).map(c => c.name), any35: s.cards.filter(ANY35).map(c => c.name), gram10: s.cards.filter(GRAM10).map(c => c.name), startpaket: s.cards.filter(c => /startpaket/i.test(c.name || "")).map(c => c.name), countOk: s.countN == null || s.countN === s.n, overflow: s.overflow };
    await ctx.close();
  }
  return { ...out, pass: Object.values(out).every(x => !x.mlMulti.length && !x.any35.length && x.countOk && !x.overflow) };
};
for (const [name, fn] of Object.entries(SC)) {
  if (only && !only.test(name)) continue;
  let r; try { r = await fn(); } catch (e) { r = { error: String(e).slice(0, 300), pass: false }; }
  all[name] = r; console.log(`\n### ${name}${SUF}: ${r.pass ? "PASS" : "FAIL"}`); console.log(JSON.stringify(r).slice(0, 1500));
}
fs.writeFileSync(path.join(DIR, "ui-variants-" + (process.argv[2] || "all").replace(/\W+/g, "_") + SUF + ".json"), JSON.stringify(all, null, 1));
await b.close();
