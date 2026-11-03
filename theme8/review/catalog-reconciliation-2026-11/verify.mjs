// TASK 17 — verifiering i Theme 8-previewen med lokal build (lib/harness.mjs: dokumentets dev-loader byts
// mot den lokala loadern, CSS/JS levereras från dist/theme8). Inget skrivs till Nyehandel-admin.
// Per route och bredd: H1, synliga produktkort, kort som WooCommerce INTE listar (läckage), konsolfel,
// horisontellt överflöd, trasiga bilder; PDP: köpknapp, analysrad, "Fler i serien", paketgranskning.
// Kör: node verify.mjs [before|after] [routes|pdp|extra|all]  ->  runs/verify-<which>-<part>.json
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, DIR } from "./lib/harness.mjs";
const which = process.argv[2] || "after", part = process.argv[3] || "all";
const MX = JSON.parse(fs.readFileSync(path.join(DIR, "CURRENT-CATALOG-MATRIX.json"), "utf8")).rows;
const CLS = Object.fromEntries(MX.map(r => [r.nhSlug, r.visibilityClass]));
const C = "/sv/categories/";
const ROUTES = {
  broad: ["alla-produkter", "alla-vapes", "blommor-buds", "hasch", "alla-cartridges", "pennor", "alla-liquids", "cbd"],
  hubs: ["magic-sauce", "thca-b", "thcba", "hero-vapes", "d10-1", "nano-11"],
  combos: ["ms-vapes", "ms-carts", "ms-buds", "ms-hash", "thcab-vapes", "thcba-vapes", "core-vapes", "high-life-hash", "d10-vapes", "d10-buds", "d10-hash", "nano11-blommor", "nano11-hash", "cbd-buds-1", "cbd-vapes"],
  volume: ["alla-vapes?typ=vapes&volym=1ml", "alla-vapes?typ=vapes&volym=2ml", "alla-vapes?typ=vapes&volym=5ml"],
  pages: ["/", "/sv/page/vara-bastsaljare", "/sv/search?q=magic", "/sv/search?q=pre%20roll"],
  empty: ["thca-vapes"]
};
const PDP = {
  "enkel buds": "magic-sauce-buds-yoda-ice-cream-5-gram", "vape 2ml flera strains": "vape-magic-sauce-magic-farmers-2ml", "vape 5ml": "magic-sauce-vape-5ml",
  "vape 1+1ml": "cookies-cbd-vape-dual-chamber-triple-scoop-apples-bananas", "cart": "cart-magic-sauce-magic-farmers-1ml", "hasch": "magic-sauce-hash-kitkat-5g",
  "pre-roll": "magic-sauce-pre-rolls-1g", "paket (importerad som vanlig)": "ms-30-2ml-3-pack", "slutsåld D10-vape": "d10-vape-magic-farmers",
  "familj Nano11": "nano-11-buds-orange-zkittlez-5g", "Core hasch": "high-life-hash-malaga-magic-5g", "batteri": "ccell-m3-plus-vape-batteri-510", "THCbA": "thcba-vape-faraoh-2ml"
};
const WIDTHS = [[393, 852], [1440, 900]];
const IGNORE = /trustpilot|googletagmanager|google-analytics|facebook|hotjar|clarity|Failed to load resource: the server responded with a status of 4\d\d|net::ERR_ABORTED|ERR_BLOCKED/i;

async function measure(p) {
  return p.evaluate(() => {
    const vis = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 4 && r.height > 4 && s.visibility !== "hidden" && s.display !== "none" && !el.closest("[hidden]"); };
    const cards = [...document.querySelectorAll(".product-card")].filter(vis);
    const slugs = [...new Set(cards.map(c => { const a = c.querySelector("a[href*='/products/']"); return a ? new URL(a.href).pathname.replace(/^\/sv\/products\//, "").replace(/\/$/, "") : null; }).filter(Boolean))];
    const imgs = [...document.querySelectorAll("img")].filter(i => vis(i) && i.complete && i.naturalWidth === 0 && i.currentSrc);
    const h1 = [...document.querySelectorAll("h1")].filter(vis).map(h => h.textContent.replace(/\s+/g, " ").trim());
    return { url: location.pathname + location.search.replace(/[?&]preview=[^&]+/, ""), h1, cards: cards.length, slugs, overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      brokenImgs: imgs.map(i => i.currentSrc.slice(-80)), hz8: document.documentElement.classList.contains("hz8"),
      empty: !!document.querySelector(".hz8-cat-empty, .hz8-empty, [data-hz8-empty]") || /Inga produkter/i.test(document.body.innerText.slice(0, 20000)),
      status: (document.querySelector(".hz8-cat-status, [data-hz8-status]") || {}).textContent || null };
  });
}
async function pdp(p) {
  return p.evaluate(() => {
    const t = s => (document.querySelector(s) || {}).textContent?.replace(/\s+/g, " ").trim() || null;
    const buy = document.querySelector(".hz8-pp-buy button, .hz8-ppc__buy, button.buy, .product-form button[type=submit]");
    const sim = document.querySelector("[data-hz8-similar]");
    return { h1: t(".product-detail__information h1") || t("h1"), price: t(".hz8-ppc__price, .product-detail__information .price"),
      buyDisabled: buy ? (buy.disabled || buy.getAttribute("aria-disabled") === "true") : null, buyLabel: buy ? buy.textContent.replace(/\s+/g, " ").trim().slice(0, 60) : null,
      analysis: t(".hz8-acc__report"), similar: sim ? { kind: sim.getAttribute("data-hz8-similar"), kicker: t(".hz8-pp-similar__kicker"), cards: sim.querySelectorAll(".product-card").length } : null,
      pkg: t(".hz8-pk, .hz8-pp-pkg, [data-hz8-pkg]"), images: document.querySelectorAll(".product-detail__images img, .hz8-pp-media img").length };
  });
}
const b = await chromium.launch();
const out = { which, generated: new Date().toISOString(), routes: [], pdp: [], extra: {} };
async function visit(route, w, h, extra = {}) {
  const ctx = await ctxFor(b, w, h, { which, ...extra.ctx });
  const p = await open(ctx, route);
  await ready(p, 5000);
  if (extra.scroll !== false) { for (let i = 0; i < 6; i++) { await p.mouse.wheel(0, 1400); await p.waitForTimeout(350); } await p.waitForTimeout(1500); }
  const m = await measure(p);
  m.route = route; m.w = w; m.zoom = extra.ctx && extra.ctx.zoom || 1;
  m.errors = p.errors.filter(e => !IGNORE.test(e)).slice(0, 6);
  m.leaks = m.slugs.filter(s => CLS[s] && CLS[s] !== "PUBLIC + LISTED").map(s => s + " [" + CLS[s] + "]");
  if (extra.pdp) m.pdp = await pdp(p);
  if (extra.shot) await p.screenshot({ path: extra.shot, fullPage: false });
  await ctx.close();
  process.stdout.write(`${w}${m.zoom > 1 ? "@" + m.zoom : ""} ${route} h1=${JSON.stringify(m.h1[0] || "")} cards=${m.cards} leaks=${m.leaks.length} ovf=${m.overflow} err=${m.errors.length} broken=${m.brokenImgs.length}\n`);
  return m;
}
async function pool(jobs, n = 3) { const res = []; let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < jobs.length) { const j = jobs[i++]; try { res.push(await j()); } catch (e) { res.push({ error: String(e) }); } } })); return res; }

if (part === "routes" || part === "all") {
  const jobs = [];
  for (const [kind, list] of Object.entries(ROUTES)) for (const r of list) for (const [w, h] of WIDTHS) jobs.push(() => visit(r.startsWith("/") ? r : C + r, w, h).then(m => ({ kind, ...m })));
  out.routes = await pool(jobs);
}
if (part === "pdp" || part === "all") {
  const jobs = [];
  for (const [cls, slug] of Object.entries(PDP)) for (const [w, h] of WIDTHS) jobs.push(() => visit("/sv/products/" + slug, w, h, { pdp: true }).then(m => ({ cls, ...m })));
  jobs.push(() => visit("/sv/products/magic-sauce-buds-yoda-ice-cream-5-gram?hz8-pkg-review=1", 1440, 900, { pdp: true }).then(m => ({ cls: "paketgranskning familj", ...m })));
  jobs.push(() => visit("/sv/products/vape-magic-sauce-magic-farmers-2ml?hz8-pkg-review=1", 393, 852, { pdp: true }).then(m => ({ cls: "paketgranskning strain", ...m })));
  out.pdp = await pool(jobs);
}
if (part === "extra" || part === "all") {
  const E = out.extra;
  E.widths = await pool([[320, 700], [430, 932], [1920, 1080]].flatMap(([w, h]) => ["/", C + "alla-vapes", C + "magic-sauce", "/sv/products/vape-magic-sauce-magic-farmers-2ml"].map(r => () => visit(r, w, h))).concat(
    ["/", C + "alla-vapes", C + "d10-1", "/sv/products/magic-sauce-vape-5ml"].map(r => () => visit(r, 1440, 900, { ctx: { zoom: 2 } }))));
  E.slow = await pool([C + "alla-vapes", C + "hero-vapes"].map(r => () => visit(r, 393, 852, { ctx: { cssDelay: 3000, jsDelay: 4000 } })));
  E.jsFail = await pool([C + "ms-vapes"].map(r => () => visit(r, 393, 852, { ctx: { jsFail: "abort" } })));
  // Felande datakälla: seriehubbens hämtning av en serie x format-route blockeras.
  { const ctx = await ctxFor(b, 1440, 900, { which }); await ctx.route(/\/sv\/categories\/ms-vapes(\?|$)/, r => r.request().resourceType() === "document" ? r.continue() : r.abort("failed"));
    const p = await open(ctx, C + "magic-sauce"); await ready(p, 6000); E.failedSource = { ...(await measure(p)), errors: p.errors.filter(e => !IGNORE.test(e)).slice(0, 5) }; await ctx.close(); }
  // Tangentbord: header-dropdown nås och öppnas med tangentbord, Escape stänger.
  { const ctx = await ctxFor(b, 1440, 900, { which }); const p = await open(ctx, C + "alla-vapes"); await ready(p, 4000);
    const seen = []; for (let i = 0; i < 14; i++) { await p.keyboard.press("Tab"); seen.push(await p.evaluate(() => { const a = document.activeElement; return a ? (a.getAttribute("aria-label") || a.textContent || a.tagName).replace(/\s+/g, " ").trim().slice(0, 30) + (a.getAttribute("aria-expanded") ? "[" + a.getAttribute("aria-expanded") + "]" : "") : null; })); }
    const vapes = p.locator("#store-header [aria-haspopup], #store-header button[aria-expanded]").filter({ hasText: "Vapes" }).first();
    let opened = null, closed = null, links = [];
    if (await vapes.count()) { await vapes.focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(600); opened = await vapes.getAttribute("aria-expanded");
      links = await p.evaluate(() => [...document.querySelectorAll(".hz8-dropdown a[href], [class*=dropdown] a[href]")].filter(a => a.offsetParent).map(a => a.textContent.replace(/\s+/g, " ").trim() + " -> " + new URL(a.href).pathname + new URL(a.href).search.replace(/[?&]preview=[^&]+/, "")).slice(0, 40));
      await p.keyboard.press("Escape"); await p.waitForTimeout(400); closed = await vapes.getAttribute("aria-expanded"); }
    E.keyboard = { tabOrder: seen, dropdownOpened: opened, dropdownClosedAfterEscape: closed, vapesDropdownLinks: links }; await ctx.close(); }
  // Bakåt/framåt: kategori -> volymvy -> PDP, sedan bakåt två steg och framåt ett.
  { const ctx = await ctxFor(b, 393, 852, { which }); const p = await open(ctx, C + "alla-vapes"); await ready(p, 4000);
    const u = s => `https://hazeyse.nyehandel.se${s}${s.includes("?") ? "&" : "?"}preview=v9kzdmqz4w60l5n`;
    await p.goto(u(C + "alla-vapes?typ=vapes&volym=5ml")); await ready(p, 4000); const vol = await measure(p);
    await p.goto(u("/sv/products/magic-sauce-vape-5ml")); await ready(p, 3000);
    await p.goBack(); await ready(p, 4000); const back1 = await measure(p);
    await p.goBack(); await ready(p, 4000); const back2 = await measure(p);
    await p.goForward(); await ready(p, 4000); const fwd = await measure(p);
    E.history = { vol5: { url: vol.url, cards: vol.cards, slugs: vol.slugs }, back1: { url: back1.url, cards: back1.cards }, back2: { url: back2.url, cards: back2.cards }, forward: { url: fwd.url, cards: fwd.cards }, errors: p.errors.filter(e => !IGNORE.test(e)).slice(0, 5) }; await ctx.close(); }
}
fs.writeFileSync(path.join(DIR, `runs/verify-${which}-${part}.json`), JSON.stringify(out, null, 1));
await b.close();
console.log("done");
