// TASK 10B-0 -- tillståndsprobe per PDP: Nyehandels egna köpkontroller
// (native knapp, #stock, varianter ur product/state, JSON-LD availability)
// och Theme 8:s köpytor (#hz8-buybar, .hz8-pdp-sticky, pilotens sticky),
// samt om någon synlig/aktiv köp-CTA finns. Ingenting klickas.
// node probe.mjs <before|after|external> [id,..] [width,..]
import { chromium, ctxFor, open, ready, DIR } from "./lib.mjs"; import fs from "node:fs";
export const PRODUCTS = {
  17: "/sv/products/blommor-cbn-10-great-white-shark",
  20: "/sv/products/fraktandring",
  15: "/sv/products/vape-thc-h-20-hazey-2ml-500puffs",
  58: "/sv/products/prerolled-thca-22-bangkok-1-gram",
  27: "/sv/products/cart-thc-b-20-tatra-hemp-1ml",
  78: "/sv/products/vape-thcx-19-core-2ml",
  91: "/sv/products/vape-magic-sauce-99-2ml",
  56: "/sv/products/cart-nano10-10-tatra-hemp-1ml",
  84: "/sv/products/buds-magic-sauce-50-samurai-jack-5-gram",
  87: "/sv/products/vape-cbd-25-cbn-35-magic-farmers-2ml",
  57: "/sv/products/vape-thc-a-45-faraoh-2ml"
};
export const PROBE = () => {
  const vis = e => { if (!e) return false; const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none" && parseFloat(cs.opacity) > 0.05 && r.bottom > 0 && r.top < innerHeight; };
  const btn = e => e && { text: e.textContent.trim().replace(/\s+/g, " ").slice(0, 60), aria: e.getAttribute("aria-label"), disabled: !!e.disabled, ariaDisabled: e.getAttribute("aria-disabled"), tabindex: e.getAttribute("tabindex"), visible: vis(e), cursor: getComputedStyle(e).cursor, opacity: getComputedStyle(e).opacity, bg: getComputedStyle(e).backgroundColor };
  const nb = document.querySelector(".buy-form .button.buy");
  const stock = document.getElementById("stock");
  const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => { try { return JSON.parse(s.textContent); } catch (e) { return null; } }).filter(Boolean);
  const avail = JSON.stringify(ld).match(/schema\.org\/(InStock|OutOfStock|PreOrder|BackOrder|LimitedAvailability|SoldOut)/g);
  const bar = document.getElementById("hz8-buybar"), sticky = document.querySelector(".hz8-pdp-sticky");
  const pilotSticky = document.querySelector(".hz8-pp-sticky, [class*=hz8-pp-sticky], .hz8-pilot-sticky");
  const sel = document.querySelector("#product-variants select");
  return {
    pilot: document.documentElement.classList.contains("hz8-pdp-pilot"),
    h1: (document.querySelector(".product-detail__information h1") || {}).textContent?.trim().slice(0, 50),
    price: (document.getElementById("product-price") || {}).textContent?.trim(),
    stock: stock && { text: stock.textContent.trim().replace(/\s+/g, " "), cls: stock.className },
    htmlOut: document.documentElement.classList.contains("hz8-pdp-out"),
    ldAvailability: avail,
    native: btn(nb), nativeExists: !!nb, buyForm: !!document.querySelector(".buy-form"),
    qty: !!document.querySelector(".buy-form .amount-input"), qtyVisible: vis(document.querySelector(".buy-form .amount-input")),
    packages: document.querySelectorAll(".hz8-package").length,
    select: sel && { value: sel.value, options: [...sel.options].map(o => o.textContent.trim().slice(0, 30) + (o.disabled ? " [disabled]" : "")) },
    buybar: bar && { cls: bar.className, cta: btn(bar.querySelector(".hz8-buybar__cta")), qtyBtns: [...bar.querySelectorAll(".hz8-buybar__qty button")].map(b => btn(b)), inViewport: vis(bar), transform: getComputedStyle(bar).transform, display: getComputedStyle(bar).display },
    sticky: sticky && { cls: sticky.className, ariaHidden: sticky.getAttribute("aria-hidden"), btn: btn(sticky.querySelector("button")), display: getComputedStyle(sticky).display },
    pilotSticky: pilotSticky && { cls: pilotSticky.className, inViewport: vis(pilotSticky) },
    activeBuyCtas: [...document.querySelectorAll("button, a, [role=button]")].filter(e => /lägg i (varu)?korgen|köp nu|lägg till/i.test(e.textContent + " " + (e.getAttribute("aria-label") || "")) && !e.disabled && e.getAttribute("aria-disabled") !== "true" && !e.closest(".hz8-prail, .product-card, .hz8-card, .product-page-lists, [class*=rail], #cartAside, #cart-side-wrap")).map(e => ({ cls: (e.className || "").toString().slice(0, 40), text: e.textContent.trim().slice(0, 30), visible: vis(e) })),
    overflowX: document.documentElement.scrollWidth > innerWidth + 1,
    h1s: document.querySelectorAll("h1:not([role=heading])").length
  };
};
const isMain = process.argv[1] && process.argv[1].endsWith("probe.mjs");
if (isMain) {
  const [which = "before", ids = Object.keys(PRODUCTS).join(","), ws = "393,1440"] = process.argv.slice(2);
  const b = await chromium.launch(); const rows = [];
  // Statusdata direkt ur Nyehandels API (sanningen) för varje produkt.
  for (const id of ids.split(",")) for (const w of ws.split(",").map(Number)) {
    const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which });
    const p = await open(ctx, PRODUCTS[id]); await ready(p, 4000);
    const state = await p.evaluate(async () => { const m = document.documentElement.innerHTML.match(/viewProduct\(.(\d+)/); if (!m) return null; try { const r = await fetch("/frontend-api/product/state", { method: "POST", credentials: "same-origin", headers: HZ8.apiHeaders(), body: JSON.stringify({ product_id: +m[1], variant_ids: [null] }) }); const d = await r.json(); return { id: +m[1], buyable: d.product && d.product.buyable, variants: ((d.product && d.product.variants) || []).map(v => ({ id: v.id, name: (v.option_values || []).map(o => o.name || o.value).join("/") || v.name, buyable: v.buyable, track: v.track_inventory, stock: v.available_stock, status: v.stock_status && (v.stock_status.name || v.stock_status.label || v.stock_status) })) }; } catch (e) { return String(e); } });
    // Scrolla ned så att mobilens köpbar (visas när huvudköpraden lämnat vyn) syns.
    const top = await p.evaluate(PROBE);
    await p.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight * 0.45, behavior: "instant" })); await p.waitForTimeout(1200);
    const scrolled = await p.evaluate(PROBE);
    await p.screenshot({ path: `${DIR}/runs/probe-${which}-${id}-${w}.jpg`, type: "jpeg", quality: 70 });
    const row = { which, id, w, state, top, scrolled, errors: p.errors };
    rows.push(row); console.log(JSON.stringify({ id, w, state, pilot: top.pilot, stock: top.stock?.text, ld: top.ldAvailability, native: top.native, select: top.select, buybar: scrolled.buybar && { inViewport: scrolled.buybar.inViewport, cta: scrolled.buybar.cta }, sticky: scrolled.sticky && scrolled.sticky.btn, activeTop: top.activeBuyCtas, activeScrolled: scrolled.activeBuyCtas, err: p.errors.length }));
    await ctx.close();
  }
  fs.writeFileSync(`${DIR}/runs/probe-${which}-${ws.replace(/,/g, "_")}.json`, JSON.stringify(rows, null, 1));
  await b.close();
}
