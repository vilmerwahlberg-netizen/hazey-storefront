// TASK 20 (v3) — "Välj paket" (1 st | 3-pack | 5-pack) + EN köpmodul på PDP 255 i Theme 8-previewn med LOKAL build.
// Varje scenario: egen session/korg, kundens egna kontroller, verklig korg (API), minicart, kassa (ingen betalning),
// korgen töms. Ingen order. Kör: node ui-paketval.mjs [filter]   VP=393 | 768 | 1440 | 1920 (VH valfri).
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, url } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const PDP = "/sv/products/thc-x-vape-hero-core-2ml";
const GEL = "Gelato - Indica", STR = "Strawberry Kush - Sativa", MEL = "Melon Haze", PIN = "Pineapple Express -Sativa", COC = "Coconut Cake - Indica", SLH = "Super Lemon Haze";
const SC = {
  "S1-tre-olika": { pack: 3, picks: [GEL, MEL, COC], expect: { ok: true, variants: [425, 431, 438] }, checkout: true },
  "S2-samma-x3": { pack: 3, picks: [GEL, GEL, GEL], expect: { ok: true, variants: [425, 425, 425] }, checkout: true },
  "S3-2plus1": { pack: 3, picks: [STR, STR, PIN], expect: { ok: true, variants: [429, 429, 433] }, checkout: true },
  "X1-vaxling-kvarhallna-val": { review: true, switching: true, expect: { ok: true, variants: [429, 431, 438] } },
  "X2-5pack-forhandsvisning": { review: true, preview5: true },
  "F1-tom-plats": { pack: 3, picks: [GEL, MEL, ""], expect: { ok: false, noPost: true } },
  "F2-otillatet-val": { pack: 3, picks: [GEL, MEL, COC], tamper: true, expect: { ok: false, msg: /godkändes inte/ } },
  "F3-lager-slut-server": { pack: 3, picks: [GEL, GEL, GEL], preload: 23, expect: { ok: false, msg: /Lagret räcker inte|inte tillräckligt i lager/ } },
  "F4-lagerbegransning-i-valet": { pack: 3, simulate: true },
  "R1-singel-efter-paket": { single: true },
  "R0-utan-flagga": { noFlag: true },
  "E1-minicart-andra": { pack: 3, picks: [GEL, MEL, COC], edit: true }
};
const VP = +(process.env.VP || 1440), MOBILE = VP < 768, SUF = "-" + VP;
const VH = +(process.env.VH || (MOBILE ? 852 : VP === 768 ? 1024 : VP >= 1920 ? 1080 : 1000));
const MOBILE_UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36";
const layout = (p, sel) => p.evaluate(sel => {
  const W = window.innerWidth, root = sel ? document.querySelector(sel) : document.body;
  const off = root ? Array.from(root.querySelectorAll("*")).filter(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && (r.right > W + 1 || r.left < -1) && !e.closest(".hz8-pp__tiles, .hz8-pp__car, [class*=swiper], iframe"); }).slice(0, 5).map(e => (e.className && e.className.baseVal == null ? e.className : e.tagName) + "@" + Math.round(e.getBoundingClientRect().right)) : null;
  return { innerWidth: W, scrollWidth: document.documentElement.scrollWidth, pageOverflow: document.documentElement.scrollWidth > W + 1, offscreen: off };
}, sel);
const sp = t => String(t || "").replace(/[  ‑]/g, m => m === "‑" ? "-" : " ").trim();
const only = process.argv[2] ? new RegExp(process.argv[2]) : null;
const b = await chromium.launch(); const all = {};
const api = (p, method, u, body) => p.evaluate(async ({ method, u, body }) => {
  const x = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || "");
  const r = await fetch("/frontend-api/" + u, { method, credentials: "same-origin", headers: { Accept: "application/json", "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest", "X-XSRF-TOKEN": x }, body: body ? JSON.stringify(body) : undefined });
  let j = null; try { j = await r.json(); } catch { } return { status: r.status, json: j };
}, { method, u, body });
const summarize = C => C ? { total: C.formatted_total, items: C.items.map(i => ({ id: i.id, variant_id: i.variant_id, qty: i.quantity, total: i.formatted_total, parts: (i.package_items || []).map(x => ({ q: +x.quantity, variant: (x.option_values || [])[0] && x.option_values[0].laravel_through_key, strain: (x.option_values || [])[0] && x.option_values[0].name })) })) } : null;
/* Läge ur DOM:en (vad kunden ser). */
const zone = p => p.evaluate(() => {
  const t = s => { const e = document.querySelector(s); return e ? e.textContent : null; };
  const vis = s => { const e = document.querySelector(s); return !!e && !e.hidden && e.getClientRects().length > 0; };
  return { cards: Array.from(document.querySelectorAll(".hz8-pc")).map(c => (c.getAttribute("aria-checked") === "true" ? "*" : "") + c.innerText.replace(/\s+/g, " ")),
    builderVisible: vis(".hz8-up"), strainsVisible: vis(".hz8-pp__strains"), title: t(".hz8-up__title"),
    slots: Array.from(document.querySelectorAll(".hz8-up__name > span:first-child")).map(e => e.textContent), sum: (document.querySelector(".hz8-up__sum") || {}).innerText,
    note: vis(".hz8-up__note") ? t(".hz8-up__note") : null, price: t(".hz8-pp__price"), cmp: vis(".hz8-pp__cmp") ? t(".hz8-pp__cmp") : null, save: t(".hz8-pp__save"),
    ctas: Array.from(document.querySelectorAll("button")).filter(x => /varukorg|köpas|Välj strains/i.test(x.textContent) && x.getClientRects().length && x.getBoundingClientRect().left < innerWidth && x.getBoundingClientRect().right > 0 && !x.closest(".hz8-pp-sticky, #cartAside, #cart-side-wrap")).map(x => x.textContent),
    cta: t(".hz8-pp__cta"), ctaState: (document.querySelector(".hz8-pp__cta") || { getAttribute() { } }).getAttribute("data-state"), ctaDisabled: (document.querySelector(".hz8-pp__cta") || {}).disabled, msg: t(".hz8-pp__msg"),
    options: Array.from(document.querySelectorAll(".hz8-up select[data-upslot]")).map(s => Array.from(s.options).filter(o => o.value).map(o => (o.disabled ? "×" : "") + o.textContent)) };
});
const pick = async (p, picks) => { for (let i = 0; i < picks.length; i++) { await p.locator(`.hz8-up select[data-upslot="${i}"]`).selectOption(picks[i] ? { label: picks[i] } : ""); await p.waitForTimeout(220); } };
const choose = async (p, q) => { await p.locator(`.hz8-pc[data-qty="${q}"]`).click(); await p.waitForTimeout(400); };
const shot = (p, n) => p.locator(".hz8-pp").screenshot({ path: path.join(DIR, "shots", n + SUF + ".png") }).catch(() => { });
for (const [name, s] of Object.entries(SC)) {
  if (only && !only.test(name)) continue;
  const R = all[name] = { posts: [], nativePosts: 0 };
  const ctx = await ctxFor(MOBILE ? { newContext: o => b.newContext({ ...o, userAgent: MOBILE_UA }) } : b, VP, VH, { which: "after" });
  if (s.simulate) await ctx.route(/\/frontend-api\/product\/state$/, async r => {
    // SIMULERAT lager (bara i den här webbläsaren): Melon Haze 0 st, Coconut Cake 2 st.
    const body = JSON.parse(r.request().postData() || "{}"); if (+body.product_id !== 255) return r.continue();
    const res = await r.fetch(); const j = await res.json();
    j.product.variants.forEach(v => { if (v.id === 431) { v.available_stock = 0; v.buyable = false; } if (v.id === 438) v.available_stock = 2; });
    return r.fulfill({ response: res, json: j });
  });
  const q = s.noFlag ? "?hz8-pkg-pilot=0" : s.review ? "?hz8-pkg-pilot=1&hz8-pkg-review=1" : "?hz8-pkg-pilot=1";
  const p = await open(ctx, PDP + q); await ready(p, 3000);
  try { await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 2000 }); } catch { }
  p.on("request", rq => { if (/pilot-t19-heros-core-2ml-3-pack/.test(rq.url())) R.pilotFetches = (R.pilotFetches || 0) + 1; if (/\/frontend-api\/cart\/item$/.test(rq.url()) && rq.method() === "POST") { let body = null; try { body = JSON.parse(rq.postData() || "null"); } catch { } if (body && body.meta && body.meta.data && body.meta.data.packageProductVariants) R.posts.push({ body }); else R.nativePosts++; } });
  p.on("response", async rs => { if (/\/frontend-api\/cart\/item$/.test(rs.url()) && rs.request().method() === "POST") { let j = null; try { j = await rs.json(); } catch { } R.postResponse = { status: rs.status(), error: rs.status() >= 300 ? j : null }; } });
  if (s.preload) {
    const pre = await api(p, "POST", "cart/item", { product_variant_id: 467, quantity: s.preload, meta: { data: { packageProductVariants: [{ id: 425, pivot_id: 1 }, { id: 425, pivot_id: 2 }, { id: 425, pivot_id: 3 }] } } });
    R.preload = { status: pre.status, cart: summarize(pre.json && pre.json.data) };
    await p.reload({ waitUntil: "domcontentloaded" }); await ready(p, 3000);
  }
  if (s.tamper) await p.route(/\/frontend-api\/cart\/item$/, r => {
    if (r.request().method() !== "POST") return r.continue();
    const body = JSON.parse(r.request().postData()); if (body.meta) body.meta.data.packageProductVariants[2].id = 243; // MS50 Yoda i Core-plats 3
    R.tampered = body; return r.continue({ postData: JSON.stringify(body) });
  });
  R.choiceVisible = await p.locator(".hz8-pp__choice:not([hidden])").waitFor({ timeout: s.noFlag ? 8000 : 30000 }).then(() => true, () => false);
  R.initial = await zone(p);
  if (s.noFlag) {
    R.registry = await p.evaluate(() => JSON.stringify(window.HZ8.packageRegistry.products));
    R.pass = !R.choiceVisible && !R.initial.builderVisible && !R.pilotFetches && R.registry === "{}" && R.initial.ctaState === "ready";
  } else if (!R.choiceVisible) { R.pass = false; R.error = "inget paketval"; }
  else if (s.single) {
    await choose(p, 3); R.inPack = await zone(p); await choose(p, 0); R.back = await zone(p);
    await p.locator(".hz8-pp__cta").click(); await p.waitForTimeout(5000);
  } else if (s.switching) {
    await choose(p, 3); await pick(p, [STR, MEL, COC]); R.at3 = await zone(p); await shot(p, name + "-a-3pack");
    await choose(p, 5); R.at5 = await zone(p); await shot(p, name + "-b-5pack");
    await p.locator(".hz8-pp__cta").click({ force: true, timeout: 3000 }).catch(() => { }); await p.waitForTimeout(800); R.at5click = await zone(p);
    await choose(p, 3); R.back3 = await zone(p);
    await choose(p, 0); R.at1 = await zone(p); await choose(p, 3); R.again3 = await zone(p);
    await p.locator(".hz8-pp__cta").click(); await p.waitForTimeout(5000);
  } else if (s.preview5) {
    await choose(p, 5); R.at5 = await zone(p); await shot(p, name);
    await p.locator(".hz8-pp__cta").click({ force: true, timeout: 3000 }).catch(() => { }); await p.waitForTimeout(1500);
    R.after = await zone(p);
  } else if (s.simulate) {
    await choose(p, 3); R.simOptions = (await zone(p)).options[0];
    await pick(p, [COC, COC]); R.simAfter = await zone(p); await shot(p, name);
  } else {
    await choose(p, s.pack); await pick(p, s.picks); R.pdp = await zone(p);
    R.layoutPdp = await layout(p, ".hz8-pp"); await shot(p, name + "-pdp");
    await p.locator(".hz8-pp__cta").click({ force: true }); await p.waitForTimeout(5000);
    R.pdpAfter = await zone(p); if (/^F/.test(name)) await shot(p, name + "-pdp-efter");
  }
  const cart = await api(p, "GET", "cart"); R.cart = summarize(cart.json && cart.json.data);
  if (R.cart && R.cart.items.length && !s.preload) {
    await p.evaluate(() => { const st = window.HZ8 && window.HZ8.store && window.HZ8.store(); if (st) return st.dispatch("cart/reload").then(() => st.dispatch("cart/open")); });
    await p.waitForTimeout(3500);
    R.minicart = await p.evaluate(() => { const a = document.getElementById("cartAside"); return a ? { strains: Array.from(a.querySelectorAll(".hz8-pack__strains")).map(e => e.textContent), rows: Array.from(a.querySelectorAll("article.item")).map(r => r.innerText.replace(/\s+/g, " ").slice(0, 200)) } : null; });
    R.layoutMinicart = await layout(p, "#cartAside");
    await p.screenshot({ path: path.join(DIR, "shots", name + SUF + "-minicart.png") });
    if (s.edit) {
      R.edit = { posts: [], deletes: [] }; R.oldRow = String(R.cart.items[0].id);
      p.on("request", rq => { if (/\/frontend-api\/cart\/item/.test(rq.url())) { if (rq.method() === "POST") R.edit.posts.push(JSON.parse(rq.postData())); if (rq.method() === "DELETE") R.edit.deletes.push(rq.url().split("/").pop()); } });
      await p.locator("#cartAside .hz8-pack__edit").first().click(); await p.waitForTimeout(800);
      await p.locator('[data-hz8-slot="2"]').click(); await p.waitForTimeout(400);
      await p.locator('[data-hz8-opt="433"][data-slot="2"]').click(); await p.waitForTimeout(400);
      await p.locator(".hz8-strains__save").click(); await p.waitForTimeout(6000);
      const c2 = await api(p, "GET", "cart"); R.edit.cart = summarize(c2.json && c2.json.data); R.edit.deletesAtSave = R.edit.deletes.slice();
      await p.screenshot({ path: path.join(DIR, "shots", name + SUF + "-minicart-efter.png") });
    }
    if (s.checkout) {
      await p.goto(url("/sv/checkout"), { waitUntil: "domcontentloaded", timeout: 60000 }); await p.waitForTimeout(9000);
      const txt = await p.evaluate(() => document.body.innerText);
      R.checkout = { has1920: /1\s?920/.test(txt), strains: s.picks.filter(Boolean).every(x => txt.includes(x)) };
      R.layoutCheckout = await layout(p, null);
      await p.screenshot({ path: path.join(DIR, "shots", name + SUF + "-checkout.png"), fullPage: true });
      await p.goto(url(PDP), { waitUntil: "domcontentloaded", timeout: 60000 }); await p.waitForTimeout(1500);
    }
  }
  const cNow = await api(p, "GET", "cart");
  for (const it of ((cNow.json && cNow.json.data && cNow.json.data.items) || [])) await api(p, "DELETE", "cart/item/" + it.id);
  const after = await api(p, "GET", "cart"); R.cleaned = !!(after.json && after.json.data && after.json.data.items.length === 0);
  // Bedömning
  const flatOf = it => it ? it.parts.flatMap(x => Array(+x.q).fill(x.variant)) : [];
  const got = R.cart && R.cart.items.find(x => x.variant_id === 467);
  const pivOk = post => post && post.body.meta.data.packageProductVariants.every((x, k) => x.pivot_id === k + 1 && "id" in x);
  const oneBuyButton = z => z.ctas.length === 1;
  if (s.noFlag) { }
  else if (s.single) R.pass = R.inPack.builderVisible && !R.inPack.strainsVisible && !R.back.builderVisible && R.back.strainsVisible && R.cart.items.length === 1 && R.cart.items[0].variant_id === 425 && +R.cart.items[0].qty === 1 && R.cart.items[0].total === "675 kr" && R.posts.length === 0 && oneBuyButton(R.back);
  else if (s.switching) R.pass = JSON.stringify(R.at5.slots) === JSON.stringify(["Strawberry Kush", "Melon Haze", "Coconut Cake", "Välj strain", "Välj strain"]) && R.at5.ctaDisabled === true && R.at5.ctaState === "blocked" && !!R.at5.note
    && JSON.stringify(R.back3.slots) === JSON.stringify(["Strawberry Kush", "Melon Haze", "Coconut Cake"]) && JSON.stringify(R.again3.slots) === JSON.stringify(R.back3.slots) && R.posts.length === 1 && pivOk(R.posts[0])
    && !!got && got.total === "1 920 kr" && JSON.stringify(flatOf(got).sort()) === JSON.stringify(s.expect.variants.slice().sort()) && oneBuyButton(R.at5) && oneBuyButton(R.at3);
  else if (s.preview5) R.pass = R.at5.ctaDisabled === true && R.at5.ctaState === "blocked" && /kan inte köpas/.test(R.at5.cta) && /Designförhandsvisning/.test(R.at5.note || "") && R.posts.length === 0 && R.nativePosts === 0 && (!R.cart || !R.cart.items.length) && R.at5.slots.length === 5 && oneBuyButton(R.at5);
  else if (s.simulate) R.pass = R.posts.length === 0 && R.simOptions.includes("×Melon Haze (slut i lager)") && (R.simAfter.options[2] || []).includes("×" + COC + " (inga fler i lager)");
  else if (s.edit) R.pass = !!R.edit && R.edit.cart.items.length === 1 && R.edit.cart.items[0].total === "1 920 kr" && JSON.stringify(flatOf(R.edit.cart.items[0])) === JSON.stringify([425, 431, 433]) && R.edit.posts.length === 1 && R.edit.deletesAtSave.length === 1 && R.edit.deletesAtSave[0] === R.oldRow && pivOk(R.posts[0]);
  else if (s.expect.ok) R.pass = !!got && got.total === "1 920 kr" && R.cart.items.length === 1 && JSON.stringify(flatOf(got).sort()) === JSON.stringify(s.expect.variants.slice().sort()) && R.posts.length === 1 && pivOk(R.posts[0]) && sp(R.pdp.price) === "1 920 kr" && sp(R.pdp.cmp) === "2 025 kr" && sp(R.pdp.save) === "Spara 105 kr" && oneBuyButton(R.pdp) && (!s.checkout || (R.checkout && R.checkout.has1920 && R.checkout.strains));
  else if (s.expect.noPost) R.pass = R.posts.length === 0 && (!R.cart || !R.cart.items.length) && /plats 3/.test(R.pdpAfter.msg || "") && R.pdpAfter.ctaState === "missing";
  else R.pass = s.expect.msg.test(R.pdpAfter.msg || "") && (s.preload ? got && +got.qty === s.preload : !got);
  R.errors = p.errors.filter(e => !/trustpilot|gtm|google|Failed to load resource/i.test(e)).slice(0, 5);
  if (R.errors.length || !R.cleaned) R.pass = false;
  console.log(`\n### ${name}${SUF}: ${R.pass ? "PASS" : "FAIL"}`);
  console.log(JSON.stringify({ initial: R.initial && R.initial.cards, pdp: R.pdp && { slots: R.pdp.slots, sum: R.pdp.sum, price: R.pdp.price, cta: R.pdp.cta, ctas: R.pdp.ctas }, at3: R.at3 && R.at3.slots, at5: R.at5 && { slots: R.at5.slots, cta: R.at5.cta, state: R.at5.ctaState, ctas: R.at5.ctas }, back3: R.back3 && R.back3.slots, again3: R.again3 && R.again3.slots, posts: R.posts.map(x => x.body.meta.data.packageProductVariants), native: R.nativePosts, postResponse: R.postResponse, pdpAfter: R.pdpAfter && { msg: R.pdpAfter.msg, cta: R.pdpAfter.cta }, cart: R.cart && R.cart.items.map(i => [i.variant_id, i.qty, i.total, flatOf(i).join("/")]), minicart: R.minicart && R.minicart.strains, edit: R.edit && R.edit.cart.items.map(i => [i.total, flatOf(i).join("/")]), checkout: R.checkout, sim: R.simOptions && [R.simOptions, R.simAfter.options[2]], layout: R.layoutPdp, cleaned: R.cleaned, errors: R.errors }));
  await ctx.close();
}
fs.writeFileSync(path.join(DIR, "runs", "paketval-" + (process.argv[2] || "all").replace(/\W+/g, "_") + SUF + ".json"), JSON.stringify(all, null, 1));
await b.close();
