// TASK 20 v4 — paketval 1/3/5 för basprodukterna 255 (Core), 261 (MS 2 ml) och 260 (MS 5 ml) i Theme 8-previewn med
// LOKAL build. Egen session/korg per scenario, kundens egna kontroller, verklig korg (API), minicart, kassa (ingen
// betalning), korgen töms. Ingen order. Kör: node ui-familjer.mjs [filter]   VP=393 | 768 | 1440 | 1920.
// "force" = en plats sätts via DOM trots att alternativet är spärrat (simulerar gammalt UI/manipulation) för att
// prova lagerspärren i köpsteget. "stockTo" = product/state mockas EFTER valen (lagret ändras före köp).
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, url } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const FAM = {
  core: { pid: 255, route: "/sv/products/thc-x-vape-hero-core-2ml", pkg: { 3: [467, "1 920 kr"], 5: [469, "3 135 kr"] } },
  ms2: { pid: 261, route: "/sv/products/vape-magic-sauce-magic-farmers-2ml", pkg: { 3: [470, "1 599 kr"], 5: [471, "2 530 kr"] } },
  ms5: { pid: 260, route: "/sv/products/magic-sauce-vape-5ml", pkg: { 3: [472, "2 950 kr"], 5: [473, "4 450 kr"] } }
};
const V = { GEL: ["Gelato - Indica", 425], MEL: ["Melon Haze", 431], COC: ["Coconut Cake - Indica", 438], PIN: ["Pineapple Express -Sativa", 433],
  GOR: ["Gorilla Cookies", 454], TIN: ["Tinky Winky", 464], SPA: ["This is Sparta", 449], KOW: ["Kowa Bunga", 451], CHU: ["La Chupacabra", 453], YOD: ["Yoda Ice Cream", 455], BRU: ["Bruce Banner OG", 456] };
const SC = {
  "C3-blandat": { fam: "core", pack: 3, picks: ["GEL", "MEL", "COC"], buy: true, checkout: true },
  "C5-blandat-upprepat": { fam: "core", pack: 5, picks: ["GEL", "GEL", "MEL", "PIN", "COC"], buy: true, checkout: true },
  "M2-3-blandat": { fam: "ms2", pack: 3, picks: ["GOR", "GOR", "TIN"], buy: true, checkout: true },
  "M2-5-grans-tinky3": { fam: "ms2", pack: 5, picks: ["TIN", "TIN", "TIN", "GOR", "GOR"], buy: true, checkout: true },
  "M2-5-kompakt-minicart": { fam: "ms2", pack: 5, picks: ["GOR", "GOR", "GOR", "TIN", "TIN"], buy: true, summary: "3 × Gorilla Cookies · 2 × Tinky Winky" },
  "M2-5-tinky5-sparr": { fam: "ms2", pack: 5, picks: ["TIN", "TIN", "TIN"], force: { 3: "TIN", 4: "TIN" }, blocked: /Tinky Winky: bara 3 kvar i lager – du har valt 5/ },
  "M2-3-tinky4-sparr": { fam: "ms2", pack: 3, picks: ["TIN", "TIN"], force: { 2: "TIN" }, preTinkyInCart: 1, cartLabel: "×Tinky Winky (inga fler – 1 i varukorgen)", blocked: /Tinky Winky: 3 kvar i lager och 1 ligger redan i din varukorg/ },
  "M2-lager-andras-fore-kop": { fam: "ms2", pack: 3, picks: ["TIN", "TIN", "GOR"], stockTo: { 464: 1 }, blocked: /Tinky Winky: bara 1 kvar i lager – du har valt 2/ },
  "M2-slutsalt-fore-kop": { fam: "ms2", pack: 3, picks: ["TIN", "GOR", "GOR"], stockTo: { 464: 0 }, blocked: /Tinky Winky är slut i lager/ },
  "M2-slutsalda-i-listan": { fam: "ms2", pack: 3, picks: [], listOnly: true },
  "M5-5-grans-yoda4": { fam: "ms5", pack: 5, picks: ["YOD", "YOD", "YOD", "YOD", "SPA"], buy: true, checkout: true },
  "M5-3-blandat": { fam: "ms5", pack: 3, picks: ["SPA", "KOW", "CHU"], buy: true, checkout: true },
  "M5-tom-plats": { fam: "ms5", pack: 5, picks: ["SPA", "KOW", "CHU", "BRU", ""], empty: true },
  "M5-vaxling": { fam: "ms5", switching: true },
  "M2-singel": { fam: "ms2", single: true },
  "M2-minicart-andra": { fam: "ms2", pack: 5, picks: ["GOR", "GOR", "GOR", "GOR", "GOR"], buy: true, edit: true },
  "M2-utan-flagga": { fam: "ms2", noFlag: true }
};
const VP = +(process.env.VP || 1440), MOBILE = VP < 768, SUF = "-" + VP;
const VH = MOBILE ? 852 : VP === 768 ? 1024 : VP >= 1920 ? 1080 : 1000;
const MOBILE_UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36";
const sp = t => String(t || "").replace(/[  ]/g, " ").replace(/‑/g, "-").trim();
const layout = p => p.evaluate(() => ({ w: innerWidth, sw: document.documentElement.scrollWidth, overflow: document.documentElement.scrollWidth > innerWidth + 1 }));
const api = (p, method, u, body) => p.evaluate(async ({ method, u, body }) => {
  const x = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || "");
  const r = await fetch("/frontend-api/" + u, { method, credentials: "same-origin", headers: { Accept: "application/json", "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest", "X-XSRF-TOKEN": x }, body: body ? JSON.stringify(body) : undefined });
  let j = null; try { j = await r.json(); } catch { } return { status: r.status, json: j };
}, { method, u, body });
const summarize = C => C ? C.items.map(i => ({ id: i.id, variant: i.variant_id, qty: +i.quantity, total: sp(i.formatted_total), parts: (i.package_items || []).flatMap(x => Array(+x.quantity).fill((x.option_values || [])[0] && x.option_values[0].laravel_through_key)) })) : [];
const zone = p => p.evaluate(() => {
  const t = s => { const e = document.querySelector(s); return e ? e.textContent : null; };
  const vis = s => { const e = document.querySelector(s); return !!e && !e.hidden && e.getClientRects().length > 0; };
  return { cards: Array.from(document.querySelectorAll(".hz8-pc")).map(c => (c.getAttribute("aria-checked") === "true" ? "*" : "") + c.innerText.replace(/\s+/g, " ")),
    builder: vis(".hz8-up"), strains: vis(".hz8-pp__strains"), slots: Array.from(document.querySelectorAll(".hz8-up__name > span:first-child")).map(e => e.textContent),
    over: Array.from(document.querySelectorAll(".hz8-up__slot")).map(e => e.classList.contains("is-over")), sum: (document.querySelector(".hz8-up__sum") || {}).innerText,
    price: t(".hz8-pp__price"), cta: t(".hz8-pp__cta"), state: (document.querySelector(".hz8-pp__cta") || { getAttribute() { } }).getAttribute("data-state"), msg: t(".hz8-pp__msg"),
    buttons: Array.from(document.querySelectorAll("button")).filter(x => /varukorg|köpas|Välj strains|Ändra valen/i.test(x.textContent) && x.getClientRects().length && x.getBoundingClientRect().left < innerWidth && x.getBoundingClientRect().right > 0 && !x.closest(".hz8-pp-sticky, #cartAside, #cart-side-wrap")).length,
    options: Array.from(document.querySelectorAll(".hz8-up select[data-upslot]")).map(s => Array.from(s.options).filter(o => o.value).map(o => (o.disabled ? "×" : "") + o.textContent)) };
});
const choose = async (p, q) => { await p.locator(`.hz8-pc[data-qty="${q}"]`).click(); await p.waitForTimeout(400); };
const pick = async (p, picks) => { for (let i = 0; i < picks.length; i++) { await p.locator(`.hz8-up select[data-upslot="${i}"]`).selectOption(picks[i] ? { label: V[picks[i]][0] } : ""); await p.waitForTimeout(200); } };
const force = (p, i, key) => p.evaluate(({ i, label }) => { const s = document.querySelector(`.hz8-up select[data-upslot="${i}"]`); const o = [...s.options].find(o => o.textContent.startsWith(label)); o.disabled = false; s.value = o.value; s.dispatchEvent(new Event("change", { bubbles: true })); }, { i, label: V[key][0] });
const shot = (p, n) => p.locator(".hz8-pp").screenshot({ path: path.join(DIR, "shots", "v4-" + n + SUF + ".png") }).catch(() => { });
const only = process.argv[2] ? new RegExp(process.argv[2]) : null;
const b = await chromium.launch(); const all = {};
for (const [name, s] of Object.entries(SC)) {
  if (only && !only.test(name)) continue;
  const F = FAM[s.fam]; const R = all[name] = { posts: [], native: 0 };
  const ctx = await ctxFor(MOBILE ? { newContext: o => b.newContext({ ...o, userAgent: MOBILE_UA }) } : b, VP, VH, { which: "after" });
  const p = await open(ctx, F.route + (s.noFlag ? "?hz8-pkg-pilot=0" : "?hz8-pkg-pilot=1")); await ready(p, 3000);
  try { await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 2000 }); } catch { }
  p.on("request", rq => { if (/-pack(-blandbart)?$/.test(new URL(rq.url()).pathname) && rq.resourceType() !== "document") R.pkgFetches = (R.pkgFetches || 0) + 1; if (/\/frontend-api\/cart\/item$/.test(rq.url()) && rq.method() === "POST") { let body = null; try { body = JSON.parse(rq.postData() || "null"); } catch { } if (body && body.meta && body.meta.data) R.posts.push(body); else R.native++; } });
  p.on("response", async rs => { if (/\/frontend-api\/cart\/item$/.test(rs.url()) && rs.request().method() === "POST") { let j = null; try { j = await rs.json(); } catch { } R.postResponse = { status: rs.status(), error: rs.status() >= 300 ? j : null }; } });
  if (s.preTinkyInCart) { const pre = await api(p, "POST", "cart/item", { product_variant_id: 464, quantity: s.preTinkyInCart }); R.pre = pre.status; await p.reload({ waitUntil: "domcontentloaded" }); await ready(p, 3000); }
  R.choice = await p.locator(".hz8-pp__choice:not([hidden])").waitFor({ timeout: s.noFlag ? 8000 : 30000 }).then(() => true, () => false);
  R.initial = await zone(p);
  if (s.noFlag) { R.registry = await p.evaluate(() => JSON.stringify(window.HZ8.packageRegistry.products)); }
  else if (s.single) {
    await choose(p, 3); await choose(p, 0); R.back = await zone(p);
    await p.locator(".hz8-pp__cta").click(); await p.waitForTimeout(5000);
  } else if (s.switching) {
    await choose(p, 3); await pick(p, ["KOW", "CHU", "BRU"]); R.at3 = await zone(p);
    await choose(p, 5); R.at5 = await zone(p); await shot(p, name + "-5pack");
    await choose(p, 3); R.back3 = await zone(p); await choose(p, 0); R.at1 = await zone(p); await choose(p, 5); R.again5 = await zone(p);
  } else {
    await choose(p, s.pack); await pick(p, s.picks);
    R.preOpts = (await zone(p)).options[s.picks.length] || [];
    if (s.force) for (const [i, k] of Object.entries(s.force)) { await force(p, +i, k); await p.waitForTimeout(250); }
    R.pdp = await zone(p);
    if (s.listOnly) R.tileOrder = await p.locator(".hz8-pp__tile").evaluateAll(tiles => tiles.map(t => ({ name: t.querySelector(".hz8-pp__tile-name").textContent.trim(), out: t.classList.contains("is-out") })));
    if (s.stockTo) await ctx.route(/\/frontend-api\/product\/state$/, async r => {
      const body = JSON.parse(r.request().postData() || "{}"); if (+body.product_id !== F.pid) return r.continue();
      const res = await r.fetch(); const j = await res.json();
      j.product.variants.forEach(v => { if (v.id in s.stockTo) { v.available_stock = s.stockTo[v.id]; if (!s.stockTo[v.id]) v.buyable = false; } });
      R.stockMocked = true; return r.fulfill({ response: res, json: j });
    });
    await shot(p, name);
    if (!s.listOnly) { await p.locator(".hz8-pp__cta").click({ force: true }); await p.waitForTimeout(5000); }
    R.after = await zone(p); R.layout = await layout(p);
    if (s.blocked || s.empty) await shot(p, name + "-efter");
  }
  const cart = await api(p, "GET", "cart"); R.cart = summarize(cart.json && cart.json.data);
  if (R.cart.length && (s.buy || s.single)) {
    await p.evaluate(() => { const st = window.HZ8.store && window.HZ8.store(); if (st) return st.dispatch("cart/reload").then(() => st.dispatch("cart/open")); });
    await p.waitForTimeout(3500);
    R.minicart = await p.evaluate(() => { const a = document.getElementById("cartAside"); return a ? Array.from(a.querySelectorAll(".hz8-pack__strains")).map(e => e.textContent) : null; });
    if (s.summary) R.nativePackageHidden = await p.locator("#cartAside article.item.hz8-pack-compact .item__package").first().evaluate(e => getComputedStyle(e).display === "none");
    R.minicartLayout = await layout(p);
    await p.screenshot({ path: path.join(DIR, "shots", "v4-" + name + SUF + "-minicart.png") });
    if (s.edit) {
      R.edit = { posts: [], deletes: [] }; R.oldRow = String(R.cart[0].id);
      p.on("request", rq => { if (/\/frontend-api\/cart\/item/.test(rq.url())) { if (rq.method() === "POST") R.edit.posts.push(JSON.parse(rq.postData())); if (rq.method() === "DELETE") R.edit.deletes.push(rq.url().split("/").pop()); } });
      await p.locator("#cartAside .hz8-pack__edit").first().click(); await p.waitForTimeout(800);
      for (let i = 0; i < 3; i++) { await p.locator(`[data-hz8-slot="${i}"]`).click(); await p.waitForTimeout(300); await p.locator(`[data-hz8-opt="464"][data-slot="${i}"]`).click(); await p.waitForTimeout(300); }
      await p.locator('[data-hz8-slot="3"]').click(); await p.waitForTimeout(300);
      R.edit.tinkySlot4Disabled = await p.locator('[data-hz8-opt="464"][data-slot="3"]').getAttribute("aria-disabled");
      await p.screenshot({ path: path.join(DIR, "shots", "v4-" + name + SUF + "-strainvy.png") });
      await p.locator('[data-hz8-slot="3"]').click(); await p.waitForTimeout(300);
      await p.locator(".hz8-strains__save").click(); await p.waitForTimeout(6000);
      const c2 = await api(p, "GET", "cart"); R.edit.cart = summarize(c2.json && c2.json.data); R.edit.deletesAtSave = R.edit.deletes.slice();
    }
    if (s.checkout) {
      await p.goto(url("/sv/checkout"), { waitUntil: "domcontentloaded", timeout: 60000 }); await p.waitForTimeout(9000);
      const txt = sp(await p.evaluate(() => document.body.innerText));
      R.checkout = { price: txt.includes(F.pkg[s.pack][1]), strains: [...new Set(s.picks)].every(k => txt.includes(V[k][0])) };
      R.checkoutLayout = await layout(p);
      await p.screenshot({ path: path.join(DIR, "shots", "v4-" + name + SUF + "-kassa.png"), fullPage: true });
      await p.goto(url(F.route), { waitUntil: "domcontentloaded", timeout: 60000 }); await p.waitForTimeout(1500);
    }
  }
  const cNow = await api(p, "GET", "cart");
  for (const it of ((cNow.json && cNow.json.data && cNow.json.data.items) || [])) await api(p, "DELETE", "cart/item/" + it.id);
  const fin = await api(p, "GET", "cart"); R.cleaned = !!(fin.json && fin.json.data && fin.json.data.items.length === 0);
  // Bedömning
  const pkgRow = q => R.cart.find(x => x.variant === F.pkg[q][0]);
  const want = s.picks ? s.picks.filter(Boolean).map(k => V[k][1]) : [];
  const sorted = a => JSON.stringify(a.slice().sort((x, y) => x - y));
  const pivOk = (post, q) => post && post.meta.data.packageProductVariants.length === q && post.product_variant_id === F.pkg[q][0];
  if (s.noFlag) R.pass = !R.choice && R.registry === "{}" && !R.pkgFetches;
  else if (s.single) R.pass = !R.back.builder && R.back.strains && R.cart.length === 1 && !R.cart[0].parts.length && R.cart[0].qty === 1 && R.posts.length === 0;
  else if (s.switching) R.pass = JSON.stringify(R.at5.slots) === JSON.stringify(["Kowa Bunga", "La Chupacabra", "Bruce Banner OG", "This is Sparta", "This is Sparta"]) && R.posts.length === 0
    && JSON.stringify(R.back3.slots) === JSON.stringify(["Kowa Bunga", "La Chupacabra", "Bruce Banner OG"]) && R.at1.strains && !R.at1.builder && JSON.stringify(R.again5.slots) === JSON.stringify(R.at5.slots) && R.at5.buttons === 1;
  else if (s.listOnly) R.pass = R.pdp.options[0].includes("×Crazy Dog (slut i lager)") && R.pdp.options[0].includes("×Samurai Jack (slut i lager)") && R.posts.length === 0
    && R.tileOrder[0].name === "Gorilla Cookies" && R.tileOrder[1].name === "Tinky Winky" && R.tileOrder.slice(2).every(x => x.out);
  else if (s.summary) R.pass = R.minicart.includes(s.summary) && R.nativePackageHidden && R.cart.length === 1 && R.cart[0].total === F.pkg[s.pack][1];
  else if (s.blocked) R.pass = R.posts.length === 0 && !R.cart.some(x => x.parts.length) && s.blocked.test(sp(R.after.msg || R.after.sum || "")) && /Ändra valen|Välj/.test(R.after.cta) && (s.preTinkyInCart ? R.cart.length === 1 : R.cart.length === 0) && (!s.force && !s.preTinkyInCart || R.pdp.over.some(Boolean)) && (!s.cartLabel || R.preOpts.includes(s.cartLabel));
  else if (s.empty) R.pass = R.posts.length === 0 && !R.cart.length && /plats 5/.test(R.after.msg || "") && R.after.state === "missing";
  else if (s.edit) R.pass = R.posts.length === 2 && R.edit.posts.length === 1 && R.posts[0].product_variant_id === F.pkg[5][0] && R.edit.tinkySlot4Disabled === "true" && R.edit.cart.length === 1 && R.edit.cart[0].total === "2 530 kr" && sorted(R.edit.cart[0].parts) === sorted([464, 464, 464, 454, 454]) && R.edit.deletesAtSave.length === 1 && R.edit.deletesAtSave[0] === R.oldRow;
  else { const row = pkgRow(s.pack); R.pass = !!row && R.cart.length === 1 && row.total === F.pkg[s.pack][1] && sorted(row.parts) === sorted(want) && R.posts.length === 1 && pivOk(R.posts[0], s.pack) && sp(R.pdp.price) === F.pkg[s.pack][1] && R.pdp.buttons === 1 && (!s.checkout || (R.checkout.price && R.checkout.strains)); }
  R.errors = p.errors.filter(e => !/trustpilot|gtm|google|Failed to load resource/i.test(e)).slice(0, 5);
  if (R.errors.length || !R.cleaned || (R.layout && R.layout.overflow)) R.pass = false;
  console.log(`\n### ${name}${SUF}: ${R.pass ? "PASS" : "FAIL"}`);
  console.log(JSON.stringify({ cards: R.initial && R.initial.cards, pdp: R.pdp && { slots: R.pdp.slots, over: R.pdp.over, price: R.pdp.price, cta: R.pdp.cta, buttons: R.pdp.buttons, opt0: R.pdp.options[0] }, tileOrder: R.tileOrder, after: R.after && { msg: R.after.msg, sum: R.after.sum, cta: R.after.cta, state: R.after.state }, at5: R.at5 && R.at5.slots, back3: R.back3 && R.back3.slots, again5: R.again5 && R.again5.slots, posts: R.posts.map(x => [x.product_variant_id, x.meta.data.packageProductVariants.map(y => y.id + "@" + y.pivot_id).join(" ")]), native: R.native, postResponse: R.postResponse, cart: R.cart.map(x => [x.variant, x.qty, x.total, x.parts.join("/")]), minicart: R.minicart, edit: R.edit && { tinky4: R.edit.tinkySlot4Disabled, cart: R.edit.cart.map(x => [x.total, x.parts.join("/")]), posts: R.edit.posts.length, deletes: R.edit.deletesAtSave }, checkout: R.checkout, stockMocked: R.stockMocked, cleaned: R.cleaned, errors: R.errors }));
  await ctx.close();
}
fs.writeFileSync(path.join(DIR, "runs", "v4-" + (process.argv[2] || "all").replace(/\W+/g, "_") + SUF + ".json"), JSON.stringify(all, null, 1));
await b.close();
