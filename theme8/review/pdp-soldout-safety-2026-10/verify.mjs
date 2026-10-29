// TASK 10B-0 -- slutsålda produktsidor: säkra och sanningsenliga.
// Kör samma steg mot före (949542d) och efter (arbetskopian), på riktiga
// Theme 8-previewn med lokalt injicerad build. Varukorgsanrop räknas på
// nätverket (POST /frontend-api/cart*). Ingen order läggs; varje steg har
// en egen, ny sessionsvarukorg.
//   soldout   17/20/15/58: märkning, köpytor, tangentbord, a11y-träd,
//             programmatiskt klick/Enter -> 0 varukorgsanrop, innehåll kvar
//   variants  91/78 (delvis slut): slutsåld variant <-> köpbar variant
//   history   omladdning, bakåt/framåt mellan slutsåld och köpbar
//   buy       84 (enkel) och 87 (varianter): hela vägen till varukorgslådan,
//             via mobilens köpbar (393) och huvudknappen (1440)
//   stale     84 blir slutsåld efter sidladdning (product/state svarar 0 i
//             lager / Nyehandel tar bort köpknappen) -> köp går inte igenom
//   instock   84/87: köpstation och köpbar oförändrade (bilder)
//   motion    reducerad rörelse: köpbarens övergång
//   (stale: state-zero = alltid beställbar; sold-normal = servern avvisar
//    med 406, som Nyehandel gör för en slutsåld variant; button-removed)
// node verify.mjs <before|after> [step,..] [width,..]
import { chromium, ctxFor, open, ready, DIR } from "./lib.mjs"; import fs from "node:fs";
import { PRODUCTS } from "./probe.mjs";
const [which = "after", steps = "soldout,variants,history,buy,stale,motion", ws = "393,1440"] = process.argv.slice(2);
const W = ws.split(",").map(Number); const OUT = `${DIR}/runs/verify`; fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch(); const R = {};
const BUYRE = /lägg i (varu)?korgen|lägg i korgen|köp nu/i;

async function page(w, path, opts = {}) {
  const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which, ...opts });
  if (opts.setup) await opts.setup(ctx);
  const posts = [];
  ctx.on("request", r => { if (r.method() === "POST" && /frontend-api\/cart/.test(r.url())) posts.push({ url: r.url().replace(/^.*frontend-api/, ""), t: Date.now() }); });
  await ctx.addInitScript(() => { window.__cls = 0; window.__shifts = []; try { new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) { window.__cls += e.value; window.__shifts.push({ v: +e.value.toFixed(4), t: Math.round(e.startTime), src: (e.sources || []).map(s => s.node && s.node.className ? String(s.node.className).slice(0, 40) : (s.node && s.node.nodeName) || "?") }); } }).observe({ type: "layout-shift", buffered: true }); } catch (e) {} });
  const p = await open(ctx, path); await ready(p, 4000);
  p.posts = posts; return { p, ctx };
}
const state = p => p.evaluate(BUYRE_SRC => {
  const BUYRE = new RegExp(BUYRE_SRC, "i");
  const vis = e => { if (!e) return false; const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.05 && r.bottom > 0 && r.top < innerHeight && !e.closest("[hidden]"); };
  const st = document.getElementById("stock"); const after = st ? getComputedStyle(st, "::after") : null;
  const bar = document.getElementById("hz8-buybar"); const nb = document.querySelector(".buy-form .button.buy");
  const enabledBuy = [...document.querySelectorAll("button, a[href], [role=button], input[type=submit]")].filter(e => BUYRE.test(e.textContent + " " + (e.getAttribute("aria-label") || "") + " " + ((e.querySelector("[data-hz8-label]") || {}).getAttribute?.("data-hz8-label") || "")) && !e.disabled && e.getAttribute("aria-disabled") !== "true" && !e.closest(".product-card, .hz8-prail, .product-page-lists, #cartAside, #cart-side-wrap, .hz8-pcard, .hz8-bs-card"));
  return {
    out: document.documentElement.classList.contains("hz8-pdp-out"),
    badge: st ? (after && after.content !== "none" && after.display !== "none" ? after.content.replace(/"/g, "") : st.textContent.trim()) : null,
    badgeVisible: vis(st),
    price: (document.getElementById("product-price") || {}).textContent?.trim() || null,
    descr: !!document.querySelector("#product-information, .short-description, .product-description"),
    similar: document.querySelectorAll(".product-page-lists .product-card, .hz8-prail .product-card").length,
    nativeBuy: nb ? { visible: vis(nb), focusable: nb.offsetParent !== null && !nb.disabled && nb.tabIndex >= 0 } : null,
    buybar: bar ? { hidden: bar.hidden, shown: vis(bar) && !bar.classList.contains("is-main-visible") && !bar.classList.contains("is-hidden"), cta: bar.querySelector(".hz8-buybar__cta").textContent.trim(), ctaDisabled: bar.querySelector(".hz8-buybar__cta").disabled } : null,
    bevaka: !!document.querySelector(".monitor__button"),
    enabledBuyVisible: enabledBuy.filter(vis).map(e => (e.className || "").toString().slice(0, 30)),
    enabledBuyFocusable: enabledBuy.filter(e => { let n = e; while (n && n !== document.body) { const cs = getComputedStyle(n); if (cs.display === "none" || cs.visibility === "hidden" || n.hidden) return false; n = n.parentElement; } return e.tabIndex >= 0; }).map(e => (e.className || "").toString().slice(0, 30)),
    selected: (document.querySelector("#product-variants select") || {}).value || null,
    overflowX: document.documentElement.scrollWidth > innerWidth + 1,
    h1: document.querySelectorAll("h1:not([role=heading])").length,
    cls: +(window.__cls || 0).toFixed(4)
  };
}, BUYRE.source);
async function tabWalk(p, n = 40) {
  await p.evaluate(() => { const h = document.querySelector(".product-detail__information h1"); h.tabIndex = -1; h.focus(); });
  const seen = [];
  for (let i = 0; i < n; i++) {
    await p.keyboard.press("Tab");
    const f = await p.evaluate(src => { const a = document.activeElement; if (!a || a === document.body) return null; const re = new RegExp(src, "i"); return { tag: a.tagName.toLowerCase(), cls: (a.className || "").toString().slice(0, 34), text: (a.textContent || "").trim().replace(/\s+/g, " ").slice(0, 34), buy: re.test(a.textContent + " " + (a.getAttribute("aria-label") || "")) && !a.closest(".product-card, .hz8-prail, .product-page-lists"), inInfo: !!a.closest(".product-detail__information"), bar: !!a.closest("#hz8-buybar"), fv: a.matches(":focus-visible") }; }, BUYRE.source);
    if (f) seen.push(f);
    if (f && !f.inInfo && !f.bar && seen.some(s => s.inInfo)) break;
  }
  return seen;
}
async function shot(p, name) {
  await p.evaluate(() => { const i = document.querySelector(".product-detail__information"); scrollTo({ top: Math.max(0, i.getBoundingClientRect().top + scrollY - 90), behavior: "instant" }); }); await p.waitForTimeout(700);
  await p.screenshot({ path: `${OUT}/${which}-${name}-station.jpg`, type: "jpeg", quality: 72 });
  await p.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight * 0.45, behavior: "instant" })); await p.waitForTimeout(1200);
  await p.screenshot({ path: `${OUT}/${which}-${name}-scrolled.jpg`, type: "jpeg", quality: 72 });
}
const step = async (name, fn) => { try { R[name] = await fn(); } catch (e) { R[name] = { error: String(e).slice(0, 300) }; } console.log(name, JSON.stringify(R[name]).slice(0, 900)); };
const S = steps.split(",");

if (S.includes("soldout")) for (const id of [17, 20, 15, 58]) for (const w of W) await step(`soldout-${id}-${w}`, async () => {
  const { p, ctx } = await page(w, PRODUCTS[id]);
  const top = await state(p);
  const snap = await p.locator(".product-detail__information").ariaSnapshot().catch(e => String(e).slice(0, 80));
  const tabs = await tabWalk(p);
  // Försök köpa ändå: programmatiskt klick på (dold) native knapp, Enter-submit, köpbarens CTA.
  const tries = await p.evaluate(() => { const r = []; const nb = document.querySelector(".buy-form .button.buy"); if (nb) { nb.click(); r.push("native.click"); const f = nb.closest("form"); if (f && f.requestSubmit) { try { f.requestSubmit(nb); r.push("requestSubmit"); } catch (e) { r.push("requestSubmit:" + e.name); } } } const cta = document.querySelector("#hz8-buybar .hz8-buybar__cta"); if (cta) { cta.click(); r.push("buybar.click"); } return r; });
  await p.waitForTimeout(3000);
  await shot(p, `soldout-${id}-${w}`);
  const scrolled = await state(p);
  const r = { top, scrolled: { buybar: scrolled.buybar, enabledBuyVisible: scrolled.enabledBuyVisible }, a11y: snap, tabBuy: tabs.filter(t => t.buy || t.bar), tabsInInfo: tabs.filter(t => t.inInfo).map(t => t.text || t.cls), tries, cartPosts: p.posts.length, errors: p.errors, shifts: await p.evaluate(() => window.__shifts) };
  await ctx.close(); return r;
});

if (S.includes("variants")) for (const id of [91, 78]) for (const w of W) await step(`variants-${id}-${w}`, async () => {
  const { p, ctx } = await page(w, PRODUCTS[id]);
  const opts = await p.evaluate(async () => { const m = document.documentElement.innerHTML.match(/viewProduct\(.(\d+)/); const d = await (await fetch("/frontend-api/product/state", { method: "POST", credentials: "same-origin", headers: HZ8.apiHeaders(), body: JSON.stringify({ product_id: +m[1], variant_ids: [null] }) })).json(); return d.product.variants.map(v => ({ opt: String((v.option_values[0] || {}).id), name: (v.option_values[0] || {}).name, ok: !!v.buyable && (!v.track_inventory || v.available_stock > 0) })); });
  const choose = async val => { await p.evaluate(v => { const s = document.querySelector("#product-variants select"); s.value = v; s.dispatchEvent(new Event("change", { bubbles: true })); s.dispatchEvent(new Event("input", { bubbles: true })); }, val); await p.waitForTimeout(2500); };
  const out = opts.find(o => !o.ok), ok = opts.find(o => o.ok);
  const initial = await state(p);
  await choose(out.opt); await p.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight * 0.45, behavior: "instant" })); await p.waitForTimeout(1000);
  const soldVariant = await state(p); const tabsOut = await tabWalk(p);
  await shot(p, `variant-out-${id}-${w}`);
  await choose(ok.opt); await p.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight * 0.45, behavior: "instant" })); await p.waitForTimeout(1000);
  const okVariant = await state(p);
  const r = { options: opts.map(o => o.name + (o.ok ? "" : " (slut)")), chose: [out.name, ok.name], initial: { out: initial.out, selected: initial.selected }, soldVariant: { out: soldVariant.out, badge: soldVariant.badge, nativeBuy: soldVariant.nativeBuy, buybar: soldVariant.buybar, enabledBuyVisible: soldVariant.enabledBuyVisible, enabledBuyFocusable: soldVariant.enabledBuyFocusable, tabBuy: tabsOut.filter(t => t.buy) }, okVariant: { out: okVariant.out, badge: okVariant.badge, nativeBuy: okVariant.nativeBuy, buybar: okVariant.buybar }, cartPosts: p.posts.length, errors: p.errors };
  await ctx.close(); return r;
});

if (S.includes("history")) for (const w of W) await step(`history-${w}`, async () => {
  const { p, ctx } = await page(w, PRODUCTS[20]);
  const a = await state(p);
  await p.reload({ waitUntil: "domcontentloaded" }); await ready(p, 4000); const reload = await state(p);
  await p.goto(p.url().replace(/\/sv\/products\/[^?]+/, PRODUCTS[84].replace(/^\//, "/")), { waitUntil: "domcontentloaded" }); await ready(p, 4000); const instock = await state(p);
  await p.goBack({ waitUntil: "domcontentloaded" }); await ready(p, 4000); const back = await state(p);
  await p.goForward({ waitUntil: "domcontentloaded" }); await ready(p, 4000); const fwd = await state(p);
  const pick = s => ({ out: s.out, badge: s.badge, nativeVisible: s.nativeBuy && s.nativeBuy.visible, buybarHidden: s.buybar && s.buybar.hidden, enabledBuyVisible: s.enabledBuyVisible.length });
  const r = { load20: pick(a), reload20: pick(reload), go84: pick(instock), back20: pick(back), forward84: pick(fwd), cartPosts: p.posts.length, errors: p.errors };
  await ctx.close(); return r;
});

if (S.includes("buy")) for (const [id, w] of [[84, 393], [84, 1440], [87, 393], [87, 1440]]) await step(`buy-${id}-${w}`, async () => {
  const { p, ctx } = await page(w, PRODUCTS[id]);
  let chose = null;
  if (id === 87) chose = await p.evaluate(() => { const s = document.querySelector("#product-variants select"); const o = [...s.options].filter(o => o.value && o.value !== s.value)[0]; s.value = o.value; s.dispatchEvent(new Event("change", { bubbles: true })); return o.textContent.trim(); });
  await p.waitForTimeout(2000);
  const pre = await state(p);
  let via, t0;
  if (w < 768) { await p.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight * 0.45, behavior: "instant" })); await p.waitForTimeout(1200); via = "buybar"; t0 = Date.now(); await p.click("#hz8-buybar .hz8-buybar__cta"); }
  else { via = "native"; await p.locator(".buy-form .button.buy").scrollIntoViewIfNeeded(); t0 = Date.now(); await p.click(".buy-form .button.buy"); }
  await p.waitForFunction(() => document.querySelector("#cart-side-wrap.is-active, #cartAside article.item"), null, { timeout: 20000 }).catch(() => {});
  await p.waitForTimeout(1500);
  const name = await p.evaluate(() => document.querySelector(".product-detail__information h1").textContent.trim());
  const drawer = await p.evaluate(n => ({ open: !!document.querySelector("#cart-side-wrap.is-active"), rows: document.querySelectorAll("#cartAside article.item").length, hasProduct: ((document.querySelector("#cartAside") || {}).textContent || "").replace(/\s+/g, " ").includes(n.split(" – ").pop().trim()) }), name);
  const r = { chose, via, pre: { out: pre.out, nativeBuy: pre.nativeBuy, buybar: pre.buybar }, cartPosts: p.posts.map(x => x.url), clickToPostMs: p.posts[0] ? p.posts[0].t - t0 : null, drawer, errors: p.errors };
  await ctx.close(); return r;
});

if (S.includes("stale")) for (const w of W) for (const mode of ["state-zero", "sold-normal", "button-removed"]) await step(`stale-${mode}-${w}`, async () => {
  // state-zero: 84 konfigurerad som "alltid beställbar" (som Fraktändring) redan vid sidladdningen, med riktigt lager;
  // efter laddningen tar lagret slut -> product/state svarar 0 i lager. Nyehandels server skulle acceptera köpet (200).
  const flip = { zero: false };
  const setup = mode !== "state-zero" ? null : ctx => ctx.route(/frontend-api\/product\/state/, async route => { try { const res = await route.fetch(); const d = await res.json(); for (const v of [d.selected_variant, ...((d.product || {}).variants || [])]) if (v) { v.always_orderable = true; if (flip.zero) { v.available_stock = 0; v.display_stock = 0; } } return await route.fulfill({ response: res, json: d }); } catch (e) { /* kontexten stängd */ } });
  const { p, ctx } = await page(w, PRODUCTS[84], { setup });
  const pre = await state(p);
  if (mode === "state-zero") {
    flip.zero = true;
  } else if (mode === "sold-normal") {
    // Vanlig variant tar slut efter sidladdningen: product/state svarar slutsåld och Nyehandels server avvisar varukorgsanropet
    // med samma svar som den riktiga servern ger för en slutsåld variant (406 {"available":0}, runs/server-cart-probe.json).
    await ctx.route(/frontend-api\/product\/state/, async route => { try { const res = await route.fetch(); const d = await res.json(); for (const v of [d.selected_variant, ...((d.product || {}).variants || [])]) if (v) { v.available_stock = 0; v.display_stock = 0; v.buyable = false; } return await route.fulfill({ response: res, json: d }); } catch (e) { /* kontexten stängd */ } });
    await ctx.route(/frontend-api\/cart\/item/, route => route.request().method() === "POST" ? route.fulfill({ status: 406, contentType: "application/json", body: JSON.stringify({ available: 0 }) }) : route.fallback());
  } else {
    // Nyehandel ersätter köpknappen (som för en slutsåld variant).
    await p.evaluate(() => { const nb = document.querySelector(".buy-form .button.buy"); nb.parentNode.removeChild(nb); }); await p.waitForTimeout(800);
  }
  let via;
  if (w < 768) { await p.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight * 0.45, behavior: "instant" })); await p.waitForTimeout(1200); via = "buybar"; const shown = await p.evaluate(() => { const c = document.querySelector("#hz8-buybar .hz8-buybar__cta"); return c && !c.closest("[hidden]") ? c.textContent.trim() : null; }); if (shown) await p.click("#hz8-buybar .hz8-buybar__cta").catch(() => {}); via += shown ? " (synlig: " + shown + ")" : " (dold)"; }
  else { via = "native"; const has = await p.$(".buy-form .button.buy"); if (has && await has.isVisible()) await has.click().catch(() => {}); else via += " (saknas/dold)"; }
  await p.waitForTimeout(4000);
  const post = await state(p);
  await p.screenshot({ path: `${OUT}/${which}-stale-${mode}-${w}.jpg`, type: "jpeg", quality: 72 });
  const cartRows = await p.evaluate(() => document.querySelectorAll("#cartAside article.item").length);
  const r = { pre: { out: pre.out, buybar: pre.buybar }, via, after: { out: post.out, badge: post.badge, buybar: post.buybar, enabledBuyVisible: post.enabledBuyVisible }, cartPosts: p.posts.map(x => x.url), cartRows, errors: p.errors };
  await ctx.close(); return r;
});

if (S.includes("instock")) for (const id of [84, 87]) for (const w of W) await step(`instock-${id}-${w}`, async () => {
  const { p, ctx } = await page(w, PRODUCTS[id]);
  const s = await state(p); await shot(p, `instock-${id}-${w}`); const sc = await state(p);
  const r = { out: s.out, badge: s.badge, nativeBuy: s.nativeBuy, buybarScrolled: sc.buybar, cls: s.cls, overflowX: s.overflowX, errors: p.errors };
  await ctx.close(); return r;
});

if (S.includes("motion")) await step("motion-393", async () => {
  // ctxFor sätter ingen reducedMotion; emuleras i sidan.
  const { p, ctx: c3 } = await page(393, PRODUCTS[84]); await p.emulateMedia({ reducedMotion: "reduce" }); await p.waitForTimeout(300);
  const a = await p.evaluate(() => { const bar = document.getElementById("hz8-buybar"); return bar ? getComputedStyle(bar).transitionDuration : null; });
  const { p: q, ctx: c4 } = await page(393, PRODUCTS[20]); await q.emulateMedia({ reducedMotion: "reduce" });
  const s = await state(q);
  const r = { instockBuybarTransition: a, soldoutBuybar: s.buybar, soldoutOut: s.out };
  await c3.close(); await c4.close(); return r;
});

fs.writeFileSync(`${DIR}/runs/verify-${which}-${steps.replace(/,/g, "_")}-${ws.replace(/,/g, "_")}.json`, JSON.stringify(R, null, 1));
await b.close();
