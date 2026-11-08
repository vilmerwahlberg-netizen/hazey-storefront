// TASK 19 — Theme 8-prov för pilotpaket 263 (Core vapes 3-pack) i Theme 8-previewn med LOKAL build (dist/theme8)
// via catalog-reconciliation-harnessen. Varje scenario: egen session, PDP 255 med ?hz8-pkg-pilot=1, välj 3-pack +
// strains i Theme 8-byggaren, klick på Theme 8:s köpknapp, läs verklig korg (API), minicart, kassa; töm korgen.
// Ingen order, ingen betalning. Kör: node ui-pilot.mjs [filter]   (VP=393 för mobil: 393×852, touch, DPR 2 och en
// riktig Android-Chrome-UA -- harnessens mobilläge saknar UA och blir HeadlessChrome, som Nyehandel inte sparar korg för).
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, url } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const PDP = "/sv/products/thc-x-vape-hero-core-2ml?hz8-pkg-pilot=1";
const GEL = "Gelato - Indica", STR = "Strawberry Kush - Sativa", MEL = "Melon Haze", PIN = "Pineapple Express -Sativa", COC = "Coconut Cake - Indica";
const SC = {
  "UI-S1-tre-olika": { picks: [GEL, MEL, COC], expect: { ok: true, variants: [425, 431, 438] } },
  "UI-S2-samma-x3": { picks: [GEL, GEL, GEL], expect: { ok: true, variants: [425, 425, 425] } },
  "UI-S3-2plus1": { picks: [STR, STR, PIN], expect: { ok: true, variants: [429, 429, 433] } },
  "UI-F1-tom-plats": { picks: [GEL, MEL, ""], expect: { ok: false, noPost: true } },
  "UI-F2-server-nekar": { picks: [GEL, MEL, COC], tamper: true, expect: { ok: false, msg: /godkändes inte/ } },
  "UI-F3-lager-slut": { picks: [GEL, GEL, GEL], preload: 23, expect: { ok: false, msg: /Lagret räcker inte|inte tillräckligt i lager/ } }
};
const VP = +(process.env.VP || 1440), MOBILE = VP < 768, SUF = MOBILE ? "-" + VP : "";
const MOBILE_UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36";
/* Layoutkontroll: horisontellt överflöde på sidan och element i en region som går utanför viewporten. */
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
for (const [name, s] of Object.entries(SC)) {
  if (only && !only.test(name)) continue;
  const R = all[name] = { posts: [] };
  const ctx = await ctxFor(MOBILE ? { newContext: o => b.newContext({ ...o, userAgent: MOBILE_UA }) } : b, VP, MOBILE ? 852 : 1000, { which: "after" });
  R.viewport = VP; R.ua = MOBILE ? MOBILE_UA : "desktop Chrome (harness)";
  const p = await open(ctx, PDP); await ready(p, 3000);
  try { await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 2000 }); } catch { }
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
  p.on("request", rq => { if (/\/frontend-api\/cart\/item$/.test(rq.url()) && rq.method() === "POST") R.posts.push({ body: JSON.parse(rq.postData() || "null") }); });
  p.on("response", async rs => { if (/\/frontend-api\/cart\/item$/.test(rs.url()) && rs.request().method() === "POST") { let j = null; try { j = await rs.json(); } catch { } R.postResponse = { status: rs.status(), error: rs.status() >= 300 ? j : null }; } });
  // Paketsteget (kräver att pivots lästs ur paketsidan).
  const pack = p.locator('.hz8-pp__pack[data-key="strain:3"]');
  R.packVisible = await pack.waitFor({ timeout: 30000 }).then(() => true, () => false);
  if (!R.packVisible) { R.error = "inget 3-pack-steg"; await p.screenshot({ path: path.join(DIR, "shots", name + SUF + "-pdp.png") }); await ctx.close(); continue; }
  R.packCard = (await pack.innerText()).replace(/\s+/g, " ");
  await pack.click(); await p.waitForTimeout(600);
  /* Mobil: byggaren kan vara hopfälld ("Bygg ditt 3-pack") -- öppna den som en kund. */
  if (await p.locator(".hz8-pp__builder.is-collapsed").count()) { await p.locator(".hz8-pp__btoggle").click(); await p.waitForTimeout(400); R.openedCollapsedBuilder = true; }
  for (let i = 0; i < 3; i++) {
    const sel = p.locator(`.hz8-pp__slots select[data-slot="${i}"]`);
    if (s.picks[i]) await sel.selectOption({ label: s.picks[i] }); else await sel.selectOption("");
    await p.waitForTimeout(250);
  }
  R.pdp = await p.evaluate(() => ({ price: (document.querySelector(".hz8-pp__price") || {}).textContent, unit: (document.querySelector(".hz8-pp__unit") || {}).textContent, save: (document.querySelector(".hz8-pp__save") || {}).textContent,
    title: (document.querySelector(".hz8-pp__btitle") || {}).textContent, count: (document.querySelector(".hz8-pp__count") || {}).textContent,
    slots: Array.from(document.querySelectorAll(".hz8-pp__slotname")).map(e => e.textContent), cta: (document.querySelector(".hz8-pp__cta") || {}).textContent }));
  R.layoutPdp = await layout(p, ".hz8-pp");
  await p.locator(".hz8-pp").screenshot({ path: path.join(DIR, "shots", name + SUF + "-pdp.png") }).catch(() => { });
  await p.locator(".hz8-pp__cta").click({ force: true }); // spärrad knapp ska ändå ta emot klick och förklara
  await p.waitForTimeout(5000);
  R.pdpAfter = await p.evaluate(() => ({ msg: (document.querySelector(".hz8-pp__msg") || {}).textContent, cta: (document.querySelector(".hz8-pp__cta") || {}).textContent, state: (document.querySelector(".hz8-pp__cta") || { getAttribute() { } }).getAttribute("data-state") }));
  const cart = await api(p, "GET", "cart"); R.cart = summarize(cart.json && cart.json.data);
  // Minicart (Theme 8 84-cart.js i Nyehandels drawer).
  await p.evaluate(() => { const st = window.HZ8 && window.HZ8.store && window.HZ8.store(); if (st) st.dispatch("cart/open"); });
  await p.waitForTimeout(3500);
  R.minicart = await p.evaluate(() => { const a = document.getElementById("cartAside"); if (!a) return null; return { open: !!document.querySelector("#cart-side-wrap.is-active"), rows: Array.from(a.querySelectorAll("article.item")).map(r => r.innerText.replace(/\s+/g, " ").slice(0, 400)), packTag: Array.from(a.querySelectorAll(".hz8-pack-tag")).map(e => e.textContent), strains: Array.from(a.querySelectorAll(".hz8-pack__strains")).map(e => e.textContent), alerts: Array.from(a.querySelectorAll("[role=alert]")).map(e => e.textContent) }; });
  R.layoutMinicart = await layout(p, "#cartAside");
  await p.screenshot({ path: path.join(DIR, "shots", name + SUF + "-minicart.png") });
  if (R.cart && R.cart.items.length) {
    await p.goto(url("/sv/checkout"), { waitUntil: "domcontentloaded", timeout: 60000 }); await p.waitForTimeout(9000);
    const txt = await p.evaluate(() => document.body.innerText);
    const i = txt.indexOf("Din beställning");
    R.checkout = { summary: (i >= 0 ? txt.slice(i, i + 900) : txt.slice(0, 900)).replace(/\n{2,}/g, "\n"), kustom: p.frames().some(f => /kustom/.test(f.url())) };
    R.layoutCheckout = await layout(p, null);
    await p.screenshot({ path: path.join(DIR, "shots", name + SUF + "-checkout.png"), fullPage: true });
    await p.goto(url("/sv/products/thc-x-vape-hero-core-2ml"), { waitUntil: "domcontentloaded", timeout: 60000 }); await p.waitForTimeout(1500);
    for (const it of R.cart.items) await api(p, "DELETE", "cart/item/" + it.id);
  }
  const after = await api(p, "GET", "cart"); R.cleaned = !!(after.json && after.json.data && after.json.data.items.length === 0);
  // Bedömning
  const got = R.cart && R.cart.items.find(x => x.variant_id === 467);
  const flat = got ? got.parts.flatMap(x => Array(x.q).fill(x.variant)) : [];
  if (s.expect.ok) R.pass = !!got && got.total === "1 920 kr" && JSON.stringify(flat.slice().sort()) === JSON.stringify(s.expect.variants.slice().sort()) && R.posts.length === 1 && R.posts[0].body.meta.data.packageProductVariants.every((x, k) => x.pivot_id === k + 1 && "id" in x);
  else if (s.expect.noPost) R.pass = R.posts.length === 0 && (!R.cart || !R.cart.items.length) && /plats 3/.test(R.pdpAfter.msg || "");
  else R.pass = s.expect.msg.test(R.pdpAfter.msg || "") && (s.preload ? got && got.qty === String(R.preload.cart.items[0].qty) || (got && +got.qty === s.preload) : !got);
  R.errors = p.errors.filter(e => !/trustpilot|gtm|google|Failed to load resource/i.test(e)).slice(0, 5);
  console.log(`\n### ${name}: ${R.pass ? "PASS" : "FAIL"}`); console.log(JSON.stringify({ packCard: R.packCard, pdp: R.pdp, posts: R.posts.map(x => x.body), tampered: R.tampered, postResponse: R.postResponse, pdpAfter: R.pdpAfter, cart: R.cart, minicart: R.minicart && { strains: R.minicart.strains, packTag: R.minicart.packTag, alerts: R.minicart.alerts }, checkout: R.checkout && R.checkout.summary.slice(0, 500), cleaned: R.cleaned, errors: R.errors }, null, 1));
  await ctx.close();
}
fs.writeFileSync(path.join(DIR, "cart-runs", "ui-pilot-" + (process.argv[2] || "all").replace(/\W+/g, "_") + SUF + ".json"), JSON.stringify(all, null, 1));
await b.close();
