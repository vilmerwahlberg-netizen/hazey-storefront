// TASK 20 — paketkortet "Bygg ditt Core 3-pack" på PDP 255 i Theme 8-previewn med LOKAL build (dist/theme8)
// via catalog-reconciliation-harnessen. Varje scenario: egen session (egen korg), kortets egna kontroller som en
// kund, verklig korg (API), minicart, kassa (ingen betalning), korgen töms. Ingen order.
// Kör: node ui-upsell.mjs [filter]   VP=393 för mobil (393×852, touch, DPR 2, Android-Chrome-UA).
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, url } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const PDP = "/sv/products/thc-x-vape-hero-core-2ml";
const GEL = "Gelato - Indica", STR = "Strawberry Kush - Sativa", MEL = "Melon Haze", PIN = "Pineapple Express -Sativa", COC = "Coconut Cake - Indica";
const SC = {
  "S1-tre-olika": { picks: [GEL, MEL, COC], expect: { ok: true, variants: [425, 431, 438] }, checkout: true },
  "S2-samma-x3": { picks: [GEL, GEL, GEL], expect: { ok: true, variants: [425, 425, 425] }, checkout: true },
  "S3-2plus1": { picks: [STR, STR, PIN], expect: { ok: true, variants: [429, 429, 433] }, checkout: true },
  "F1-tom-plats": { picks: [GEL, MEL, ""], expect: { ok: false, noPost: true } },
  "F2-otillatet-val": { picks: [GEL, MEL, COC], tamper: true, expect: { ok: false, msg: /godkändes inte/ } },
  "F3-lager-slut-server": { picks: [GEL, GEL, GEL], preload: 23, expect: { ok: false, msg: /Lagret räcker inte|inte tillräckligt i lager/ } },
  "F4-slutsalt-i-kortet": { simulate: true, expect: { ok: false, simulated: true } },
  "R1-singel": { single: true, expect: { single: true } },
  "R0-utan-flagga": { noFlag: true, expect: { noCard: true } },
  "E1-minicart-andra": { picks: [GEL, MEL, COC], edit: true, expect: { ok: true, variants: [425, 431, 438] } }
};
const VP = +(process.env.VP || 1440), MOBILE = VP < 768, SUF = "-" + VP;
const MOBILE_UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36";
const layout = (p, sel) => p.evaluate(sel => {
  const W = window.innerWidth, root = sel ? document.querySelector(sel) : document.body;
  const off = root ? Array.from(root.querySelectorAll("*")).filter(e => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && (r.right > W + 1 || r.left < -1) && !e.closest(".hz8-pp__tiles, .hz8-pp__car, [class*=swiper], iframe"); }).slice(0, 5).map(e => (e.className && e.className.baseVal == null ? e.className : e.tagName) + "@" + Math.round(e.getBoundingClientRect().right)) : null;
  return { innerWidth: W, scrollWidth: document.documentElement.scrollWidth, pageOverflow: document.documentElement.scrollWidth > W + 1, offscreen: off };
}, sel);
const only = process.argv[2] ? new RegExp(process.argv[2]) : null;
const b = await chromium.launch(); const all = {};
const api = (p, method, u, body) => p.evaluate(async ({ method, u, body }) => {
  const x = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || "");
  const r = await fetch("/frontend-api/" + u, { method, credentials: "same-origin", headers: { Accept: "application/json", "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest", "X-XSRF-TOKEN": x }, body: body ? JSON.stringify(body) : undefined });
  let j = null; try { j = await r.json(); } catch { } return { status: r.status, json: j };
}, { method, u, body });
const summarize = C => C ? { total: C.formatted_total, quantity_count: C.quantity_count, items: C.items.map(i => ({ id: i.id, variant_id: i.variant_id, sku: i.variant_sku, qty: i.quantity, total: i.formatted_total, meta: i.meta && i.meta.data && i.meta.data.packageProductVariants, parts: (i.package_items || []).map(x => ({ q: x.quantity, variant: (x.option_values || [])[0] && x.option_values[0].laravel_through_key, strain: (x.option_values || [])[0] && x.option_values[0].name })) })) } : null;
const cardState = p => p.evaluate(() => {
  const c = document.querySelector(".hz8-up"); if (!c) return null; const t = s => (c.querySelector(s) || {}).textContent;
  return { hidden: c.hidden, collapsed: c.classList.contains("is-collapsed"), title: t(".hz8-up__title"), now: t(".hz8-up__now"), was: t(".hz8-up__was"), save: t(".hz8-up__save"), unit: t(".hz8-up__unit"), count: t(".hz8-up__count"),
    slots: Array.from(c.querySelectorAll(".hz8-up__name")).map(e => e.innerText.replace(/\s+/g, " ")), sum: t(".hz8-up__sum"), cta: t(".hz8-up__cta"), ctaState: c.querySelector(".hz8-up__cta").getAttribute("data-state"), msg: t(".hz8-up__msg"),
    imgs: Array.from(c.querySelectorAll(".hz8-up__img img")).map(i => decodeURIComponent(escape(atob(i.src.split("/").pop()))).match(/images\\?\/([^"]+?)"/)?.[1] || i.src),
    options: Array.from(c.querySelectorAll('select[data-upslot]')).map(s => Array.from(s.options).filter(o => o.value).map(o => (o.disabled ? "×" : "") + o.textContent)) };
});
for (const [name, s] of Object.entries(SC)) {
  if (only && !only.test(name)) continue;
  const R = all[name] = { posts: [], pilotFetches: 0 };
  const ctx = await ctxFor(MOBILE ? { newContext: o => b.newContext({ ...o, userAgent: MOBILE_UA }) } : b, VP, MOBILE ? 852 : +(process.env.VH || 1000), { which: "after" });
  R.viewport = VP; R.ua = MOBILE ? MOBILE_UA : "desktop Chrome (harness)";
  if (s.simulate) await ctx.route(/\/frontend-api\/product\/state$/, async r => {
    // SIMULERAT lager (bara i den här sessionens webbläsare): Melon Haze 0 st, Coconut Cake 2 st.
    const body = JSON.parse(r.request().postData() || "{}"); if (+body.product_id !== 255) return r.continue();
    const res = await r.fetch(); const j = await res.json();
    j.product.variants.forEach(v => { if (v.id === 431) { v.available_stock = 0; v.buyable = false; } if (v.id === 438) v.available_stock = 2; });
    return r.fulfill({ response: res, json: j });
  });
  const p = await open(ctx, PDP + (s.noFlag ? "?hz8-pkg-pilot=0" : "?hz8-pkg-pilot=1")); await ready(p, 3000);
  try { await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 2000 }); } catch { }
  p.on("request", rq => { if (/pilot-t19-heros-core-2ml-3-pack/.test(rq.url())) R.pilotFetches++; if (/\/frontend-api\/cart\/item$/.test(rq.url()) && rq.method() === "POST") { let body = null; try { body = JSON.parse(rq.postData() || "null"); } catch { } if (body && body.meta && body.meta.data && body.meta.data.packageProductVariants) R.posts.push({ body }); else R.nativePosts = (R.nativePosts || 0) + 1; } });
  p.on("response", async rs => { if (/\/frontend-api\/cart\/item$/.test(rs.url()) && rs.request().method() === "POST") { let j = null; try { j = await rs.json(); } catch { } R.postResponse = { status: rs.status(), error: rs.status() >= 300 ? j : null }; } });
  if (s.preload) {
    const pre = await api(p, "POST", "cart/item", { product_variant_id: 467, quantity: s.preload, meta: { data: { packageProductVariants: [{ id: 425, pivot_id: 1 }, { id: 425, pivot_id: 2 }, { id: 425, pivot_id: 3 }] } } });
    R.preload = { status: pre.status, cart: summarize(pre.json && pre.json.data) };
    await p.reload({ waitUntil: "domcontentloaded" }); await ready(p, 3000);
  }
  if (s.tamper) await p.route(/\/frontend-api\/cart\/item$/, r => {
    if (r.request().method() !== "POST") return r.continue();
    const body = JSON.parse(r.request().postData()); body.meta.data.packageProductVariants[2].id = 243; // MS50 Yoda i Core-plats 3
    R.tampered = body; return r.continue({ postData: JSON.stringify(body) });
  });
  R.cardVisible = await p.locator(".hz8-up:not([hidden])").waitFor({ timeout: s.noFlag ? 8000 : 30000 }).then(() => true, () => false);
  R.oldStepVisible = await p.locator(".hz8-pp__packs:not([hidden])").count() > 0;
  R.mainCta = await p.evaluate(() => { const c = document.querySelector(".hz8-pp__cta"); return c && { text: c.textContent, state: c.getAttribute("data-state"), hidden: c.hidden }; });
  if (s.noFlag) {
    await p.waitForTimeout(2000);
    R.registry = await p.evaluate(() => JSON.stringify(window.HZ8.packageRegistry.products));
    R.pass = !R.cardVisible && !R.oldStepVisible && R.pilotFetches === 0 && R.registry === "{}" && R.mainCta && R.mainCta.state === "ready";
  } else if (!R.cardVisible) { R.error = "inget paketkort"; R.pass = false; }
  else {
    R.initial = await cardState(p);
    if (MOBILE && R.initial.collapsed) {
      await p.locator(".hz8-up").scrollIntoViewIfNeeded();
      await p.locator(".hz8-up").screenshot({ path: path.join(DIR, "shots", name + SUF + "-kort-hopfallt.png") }).catch(() => { });
      await p.locator(".hz8-up__toggle").click(); await p.waitForTimeout(400); R.openedCollapsed = true;
    }
    if (s.single) {
      // Vanlig singelprodukt: ordinarie köpknapp, kortet orört.
      await p.locator(".hz8-pp__cta").click(); await p.waitForTimeout(5000);
    } else if (s.simulate) {
      R.simOptions = (await cardState(p)).options[0];
      await p.locator('.hz8-up__slots select[data-upslot="0"]').selectOption({ label: COC }); await p.waitForTimeout(200);
      await p.locator('.hz8-up__slots select[data-upslot="1"]').selectOption({ label: COC }); await p.waitForTimeout(200);
      R.simAfter = await cardState(p);
      await p.locator(".hz8-up").screenshot({ path: path.join(DIR, "shots", name + SUF + "-pdp.png") }).catch(() => { });
    } else {
      for (let i = 0; i < 3; i++) {
        const sel = p.locator(`.hz8-up__slots select[data-upslot="${i}"]`);
        if (s.picks[i]) await sel.selectOption({ label: s.picks[i] }); else await sel.selectOption("");
        await p.waitForTimeout(250);
      }
      R.pdp = await cardState(p);
      R.layoutPdp = await layout(p, ".hz8-pp");
      await p.locator(".hz8-up").screenshot({ path: path.join(DIR, "shots", name + SUF + "-pdp.png") }).catch(() => { });
      await p.locator(".hz8-up__cta").click({ force: true }); // spärrad knapp tar ändå emot klick och förklarar
      await p.waitForTimeout(5000);
    }
    R.pdpAfter = await cardState(p);
    R.mainCtaAfter = await p.evaluate(() => { const c = document.querySelector(".hz8-pp__cta"); return c && { text: c.textContent, state: c.getAttribute("data-state") }; });
    if (/^F/.test(name)) await p.locator(".hz8-up").screenshot({ path: path.join(DIR, "shots", name + SUF + "-pdp-efter.png") }).catch(() => { });
  }
  const cart = await api(p, "GET", "cart"); R.cart = summarize(cart.json && cart.json.data);
  if (R.cart && R.cart.items.length && !s.preload) {
    await p.evaluate(() => { const st = window.HZ8 && window.HZ8.store && window.HZ8.store(); if (st) return st.dispatch("cart/reload").then(() => st.dispatch("cart/open")); });
    await p.waitForTimeout(3500);
    R.minicart = await p.evaluate(() => { const a = document.getElementById("cartAside"); if (!a) return null; return { open: !!document.querySelector("#cart-side-wrap.is-active"), rows: Array.from(a.querySelectorAll("article.item")).map(r => r.innerText.replace(/\s+/g, " ").slice(0, 400)), strains: Array.from(a.querySelectorAll(".hz8-pack__strains")).map(e => e.textContent), edit: a.querySelectorAll(".hz8-pack__edit").length }; });
    R.layoutMinicart = await layout(p, "#cartAside");
    await p.screenshot({ path: path.join(DIR, "shots", name + SUF + "-minicart.png") });
    if (s.edit) {
      R.edit = { posts: [], deletes: [] };
      p.on("request", rq => { if (/\/frontend-api\/cart\/item/.test(rq.url())) { if (rq.method() === "POST") R.edit.posts.push(JSON.parse(rq.postData())); if (rq.method() === "DELETE") R.edit.deletes.push(rq.url().split("/").pop()); } });
      await p.locator("#cartAside .hz8-pack__edit").first().click(); await p.waitForTimeout(800);
      await p.locator('[data-hz8-slot="2"]').click(); await p.waitForTimeout(400);
      await p.locator('[data-hz8-opt="433"][data-slot="2"]').click(); await p.waitForTimeout(400);
      await p.screenshot({ path: path.join(DIR, "shots", name + SUF + "-minicart-strainvy.png") });
      await p.locator(".hz8-strains__save").click(); await p.waitForTimeout(6000);
      const c2 = await api(p, "GET", "cart"); R.edit.cart = summarize(c2.json && c2.json.data); R.edit.deletesAtSave = R.edit.deletes.slice(); R.edit.oldRow = R.cart && R.cart.items[0] && String(R.cart.items[0].id);
      R.edit.strains = await p.locator("#cartAside .hz8-pack__strains").first().innerText().catch(() => null);
      R.edit.live = await p.evaluate(() => (document.getElementById("hz8-cart-live") || {}).textContent || "");
      await p.screenshot({ path: path.join(DIR, "shots", name + SUF + "-minicart-efter.png") });
      R.cart = R.edit.cart;
    }
    if (s.checkout) {
      await p.goto(url("/sv/checkout"), { waitUntil: "domcontentloaded", timeout: 60000 }); await p.waitForTimeout(9000);
      const txt = await p.evaluate(() => document.body.innerText);
      const i = txt.indexOf("Din beställning");
      R.checkout = { summary: (i >= 0 ? txt.slice(i, i + 900) : txt.slice(0, 900)).replace(/\n{2,}/g, "\n"), has1920: /1\s?920/.test(txt), kustom: p.frames().some(f => /kustom/.test(f.url())) };
      R.layoutCheckout = await layout(p, null);
      await p.screenshot({ path: path.join(DIR, "shots", name + SUF + "-checkout.png"), fullPage: true });
      await p.goto(url(PDP), { waitUntil: "domcontentloaded", timeout: 60000 }); await p.waitForTimeout(1500);
    }
  }
  const cNow = await api(p, "GET", "cart");
  for (const it of ((cNow.json && cNow.json.data && cNow.json.data.items) || [])) await api(p, "DELETE", "cart/item/" + it.id);
  const after = await api(p, "GET", "cart"); R.cleaned = !!(after.json && after.json.data && after.json.data.items.length === 0);
  // Bedömning
  const sp = t => String(t || "").replace(/[\u00a0\u202f]/g, " ");
  const flatOf = it => it ? it.parts.flatMap(x => Array(+x.q).fill(x.variant)) : [];
  const got = R.cart && R.cart.items.find(x => x.variant_id === 467);
  const pivOk = post => post && post.body.meta.data.packageProductVariants.every((x, k) => x.pivot_id === k + 1 && "id" in x);
  if (s.noFlag) { /* satt ovan */ }
  else if (s.edit) R.pass = !!R.edit && R.edit.cart.items.length === 1 && R.edit.cart.items[0].total === "1 920 kr" && JSON.stringify(flatOf(R.edit.cart.items[0])) === JSON.stringify([425, 431, 433]) && R.edit.posts.length === 1 && JSON.stringify(R.edit.posts[0].meta.data.packageProductVariants) === JSON.stringify([{ id: 425, pivot_id: 1 }, { id: 431, pivot_id: 2 }, { id: 433, pivot_id: 3 }]) && R.edit.deletesAtSave.length === 1 && R.edit.deletesAtSave[0] === R.edit.oldRow && pivOk(R.posts[0]);
  else if (s.single) R.pass = R.cart && R.cart.items.length === 1 && R.cart.items[0].variant_id === 425 && +R.cart.items[0].qty === 1 && R.cart.items[0].total === "675 kr" && R.posts.length === 0 && !R.cart.items.some(x => x.variant_id === 467) && R.pdpAfter && !R.pdpAfter.hidden;
  else if (s.simulate) R.pass = R.posts.length === 0 && R.simOptions.some(o => o === "×Melon Haze (slut i lager)") && (R.simAfter.options[2] || []).some(o => o === "×" + COC + " (inga fler i lager)") && !R.simAfter.slots.some(x => /Melon/.test(x));
  else if (s.expect.ok) R.pass = !!got && got.total === "1 920 kr" && R.cart.items.length === 1 && JSON.stringify(flatOf(got).slice().sort()) === JSON.stringify(s.expect.variants.slice().sort()) && R.posts.length === 1 && pivOk(R.posts[0]) && sp(R.pdp.now) === "1 920 kr" && sp(R.pdp.was) === "2 025 kr" && sp(R.pdp.save) === "Spara 105 kr" && (!s.checkout || (R.checkout && R.checkout.has1920));
  else if (s.expect.noPost) R.pass = R.posts.length === 0 && (!R.cart || !R.cart.items.length) && /plats 3/.test(R.pdpAfter.sum || "") && R.pdpAfter.ctaState === "missing";
  else R.pass = s.expect.msg.test(R.pdpAfter.msg || "") && (s.preload ? got && +got.qty === s.preload : !got);
  R.mainUntouched = !R.mainCtaAfter || (R.mainCtaAfter.state === "ready" || R.mainCtaAfter.state === "added");
  R.errors = p.errors.filter(e => !/trustpilot|gtm|google|Failed to load resource/i.test(e)).slice(0, 5);
  if (R.errors.length) R.pass = false;
  console.log(`\n### ${name}${SUF}: ${R.pass ? "PASS" : "FAIL"}`); console.log(JSON.stringify({ initial: R.initial, pdp: R.pdp, posts: R.posts.map(x => x.body.meta && x.body.meta.data.packageProductVariants), postResponse: R.postResponse, pdpAfter: R.pdpAfter && { sum: R.pdpAfter.sum, msg: R.pdpAfter.msg, cta: R.pdpAfter.cta }, mainCtaAfter: R.mainCtaAfter, cart: R.cart && R.cart.items.map(i => [i.variant_id, i.qty, i.total, i.parts.map(x => x.q + "×" + x.strain).join(", ")]), minicart: R.minicart && R.minicart.strains, edit: R.edit && { strains: R.edit.strains, posts: R.edit.posts.map(x => x.meta && x.meta.data.packageProductVariants), deletes: R.edit.deletes }, checkout: R.checkout && R.checkout.has1920, simOptions: R.simOptions, sim: R.simAfter && R.simAfter.options[2], layout: R.layoutPdp, cleaned: R.cleaned, errors: R.errors }, null, 0));
  await ctx.close();
}
fs.writeFileSync(path.join(DIR, "runs", "ui-upsell-" + (process.argv[2] || "all").replace(/\W+/g, "_") + SUF + ".json"), JSON.stringify(all, null, 1));
await b.close();
