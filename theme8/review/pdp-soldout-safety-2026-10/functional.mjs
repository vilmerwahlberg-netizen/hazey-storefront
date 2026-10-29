// TASK 10B-0: kopia av 04A:s functional.mjs (oförändrad logik), körs här så att andra rapporters runs/ inte skrivs över.
// TASK 04A: kopia av 01D-R:s functional.mjs (oförändrad logik), körs här så att andra rapporters runs/ inte skrivs över.
// TASK 01D: kopia av global-visual-readiness-2026-10/functional.mjs (oförändrad logik; ursprungligen stability-perf-audit-2026-10), körs här så att andra rapporters runs/ inte skrivs över.
// Funktionell regressionsjämförelse base vs after (samma steg, samma data):
// filter, sortering, bakåt/framåt, produktantal, köpknappar/varukorg,
// lagerstatus, recensioner och navigering. node functional.mjs <base|after>
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const ROOT = path.resolve(DIR, "../../..");
const which = process.argv[2] || "after";
const B = which === "base" ? process.env.AUDIT_BASE : path.join(ROOT, "dist/theme8");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const b = await chromium.launch(); const R = {};
async function open(route, w = 1440, q = "") {
  const m = w < 768;
  const ctx = await b.newContext({ viewport: { width: w, height: m ? 852 : 900 }, deviceScaleFactor: m ? 2 : 1, isMobile: m, hasTouch: m, userAgent: m ? undefined : UA });
  if (which !== "external") await ctx.route(/theme8\/hazey-theme8\.css/, r => r.fulfill({ path: path.join(B, "hazey-theme8.css"), contentType: "text/css" }));
  if (which !== "external") await ctx.route(/theme8\/hazey-theme8\.min\.js/, r => r.fulfill({ path: path.join(B, "hazey-theme8.min.js"), contentType: "application/javascript" }));
  if (which !== "external") await ctx.route(/github\.io\/hazey-storefront\/theme8\/assets\/([^?]+)/, r => { const f = path.join(ROOT, "theme8/assets", decodeURIComponent(new URL(r.request().url()).pathname.split("/theme8/assets/")[1])); return fs.existsSync(f) ? r.fulfill({ path: f }) : r.fulfill({ status: 404 }); });
  const p = await ctx.newPage(); p.errs = []; p.cartPosts = [];
  p.on("pageerror", e => p.errs.push(String(e).slice(0, 140)));
  p.on("response", res => { if (/frontend-api\/cart\/item/.test(res.url()) && res.request().method() === "POST") p.cartPosts.push(res.status()); });
  await p.goto(`https://hazeyse.nyehandel.se${route}?${q ? q + "&" : ""}preview=v9kzdmqz4w60l5n`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await p.waitForFunction(() => document.documentElement.classList.contains("hz8"), null, { timeout: 90000 });
  try { await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 4000 }); } catch {}
  return { p, ctx };
}
const ONLY = process.env.STEPS ? process.env.STEPS.split(",") : null;
const step = async (name, fn) => { if (ONLY && !ONLY.includes(name)) return; try { R[name] = await fn(); } catch (e) { R[name] = { error: String(e).slice(0, 200) }; } console.log(name, JSON.stringify(R[name]).slice(0, 400)); };
const listState = p => p.evaluate(() => ({ url: location.search.replace(/&?preview=[^&]+/, ""), chips: [...document.querySelectorAll(".hz8-pchip")].map(c => c.textContent.trim()), n: document.querySelectorAll(".hz8-series-results .product-card").length, count: (document.querySelector(".hz8-pcount") || {}).textContent }));

// 1. Alla Vapes: delbar URL, chip-klick, bakåt/framåt, rensa, sortering (desktop)
await step("allavapes-filter-history-sort", async () => {
  const { p, ctx } = await open("/sv/categories/alla-vapes", 1440, "serie=thcab,thcba&filters=smart-filter_in-stock");
  await p.waitForSelector(".hz8-series-results .product-card", { timeout: 60000 }); await p.waitForTimeout(6000);
  const s1 = await listState(p);
  await p.click('.hz8-pchip >> text="THCbA"'); await p.waitForTimeout(6000); const s2 = await listState(p);
  await p.goBack(); await p.waitForTimeout(8000); const s3 = await listState(p);
  await p.goForward(); await p.waitForTimeout(8000); const s4 = await listState(p);
  await p.click(".hz8-pchips__clear"); await p.waitForTimeout(7000); const s5 = await listState(p);
  await p.click('[data-pt="sort"]'); await p.waitForTimeout(400);
  await p.click('#hz8-ppop-sort >> text="Pris: lägst först"'); await p.waitForTimeout(7000);
  const s6 = await p.evaluate(() => ({ url: location.search.replace(/&?preview=[^&]+/, ""), prices: [...document.querySelectorAll(".hz8-series-results .product-card .price ins, .hz8-series-results .product-card .price:not(.has-comparison)")].slice(0, 8).map(e => parseInt(e.textContent.replace(/\D/g, ""), 10)) }));
  s6.ascending = s6.prices.length > 2 && s6.prices.every((v, i, a) => !i || a[i - 1] <= v);
  const errs = p.errs; await ctx.close(); return { s1, s2, s3, s4, s5, s6, errs };
});
// 2. Mobil sortering (ark)
await step("allavapes-mobile-sort", async () => {
  const { p, ctx } = await open("/sv/categories/alla-vapes", 393);
  await p.waitForSelector(".hz8-series-results .product-card", { timeout: 60000 }); await p.waitForTimeout(5000);
  await p.click('[data-pt="sort-sheet"]'); await p.waitForTimeout(600);
  await p.click('#hz8-psortsheet .hz8-psort >> text="Pris: högst först"'); await p.waitForTimeout(7000);
  const s = await p.evaluate(() => ({ url: location.search.replace(/&?preview=[^&]+/, ""), label: (document.querySelector(".hz8-ptool__mob .hz8-psort-label") || {}).textContent, prices: [...document.querySelectorAll(".hz8-series-results .product-card .price ins, .hz8-series-results .product-card .price:not(.has-comparison)")].slice(0, 8).map(e => parseInt(e.textContent.replace(/\D/g, ""), 10)) }));
  s.descending = s.prices.length > 2 && s.prices.every((v, i, a) => !i || a[i - 1] >= v);
  await ctx.close(); return s;
});
// 3. Allt Hasch: familjeflikar ändrar produkter/antal/URL, bakåt återställer
await step("hasch-tabs-history", async () => {
  const { p, ctx } = await open("/sv/categories/hasch", 1440);
  await p.waitForTimeout(9000);
  const tabs = await p.evaluate(() => [...document.querySelectorAll(".hz8-sf-tabs a, .hz8-sf-tabs button")].filter(e => e.offsetParent).map(e => e.textContent.trim()));
  const before = await listState(p);
  const target = tabs.find((t, i) => i > 0);
  if (target) { await p.click(`.hz8-sf-tabs >> text="${target}"`); await p.waitForTimeout(7000); }
  const after = await listState(p);
  await p.goBack(); await p.waitForTimeout(8000); const back = await listState(p);
  await ctx.close(); return { tabs, before, clicked: target || null, after, back };
});
// 3b. Allt Hasch / Alla Buds: familjeflikar (.hz8-pfam__tab) filtrerar, URL, bakåt
for (const [nm, route] of [["hasch", "/sv/categories/hasch"], ["buds", "/sv/categories/blommor-buds"]]) await step(`${nm}-family-tabs`, async () => {
  const { p, ctx } = await open(route, 1440);
  await p.waitForSelector(".hz8-pfam__tab", { timeout: 60000 }); await p.waitForTimeout(8000);
  const vis = () => p.evaluate(() => ({ url: location.search.replace(/&?preview=[^&]+/, ""), pressed: (document.querySelector('.hz8-pfam__tab[aria-pressed="true"]') || {}).textContent, count: (document.querySelector(".hz8-pcount") || {}).textContent, cards: [...document.querySelectorAll(".hz8-series-results .product-card, #category-products .product-card")].filter(c => c.offsetParent).length }));
  const tabs = await p.evaluate(() => [...document.querySelectorAll(".hz8-pfam__tab")].filter(e => e.offsetParent).map(e => e.textContent.trim()));
  const before = await vis();
  const target = tabs[1];
  if (target) { await p.locator(".hz8-pfam__tab").filter({ hasText: target }).first().click(); await p.waitForTimeout(7000); }
  const after = await vis();
  await p.goBack(); await p.waitForTimeout(8000); const back = await vis();
  await ctx.close(); return { tabs, before, clicked: target || null, after, back };
});
// 4. Startsidan: köpknapp på katalogkort -> "Tillagd", POST 200, tid från klick
await step("home-quick-add", async () => {
  const { p, ctx } = await open("/", 1440);
  await p.waitForTimeout(4000);
  await p.locator(".hz8-products").scrollIntoViewIfNeeded(); await p.waitForTimeout(9000);
  const btn = p.locator(".hz8-products .hz8-pcard button.hz8-pcard__cta:not(.hz8-pcard__cta--choose):not([disabled])").first();
  const has = await btn.count(); if (!has) { await ctx.close(); return { has: 0 }; }
  const name = await btn.evaluate(b => b.closest(".hz8-pcard").querySelector(".hz8-pcard__name a").getAttribute("title"));
  const t0 = Date.now(); await btn.click();
  await p.waitForFunction(() => /Tillagd|Försök igen|Slut i lager/.test([...document.querySelectorAll(".hz8-products .hz8-pcard__label")].map(l => l.textContent).join("|")), null, { timeout: 30000 }).catch(() => {});
  const ms = Date.now() - t0;
  const label = await p.evaluate(() => [...document.querySelectorAll(".hz8-products .hz8-pcard__label")].map(l => l.textContent).find(t => /Tillagd|Försök|Slut/.test(t)) || null);
  const res = { has, name, label, clickToResultMs: ms, cartPosts: p.cartPosts, bestsellerCards: await p.evaluate(() => document.querySelectorAll(".hz8-bs-card").length), productCards: await p.evaluate(() => document.querySelectorAll(".hz8-products .hz8-pcard[data-src]").length), errs: p.errs };
  await ctx.close(); return res;
});
// 5. PDP (vanlig): lagerstatus, köpknapp, lägg i varukorg
await step("pdp-core-buy", async () => {
  const { p, ctx } = await open("/sv/products/vape-thcx-19-core-2ml", 1440);
  await p.waitForTimeout(7000);
  const st = await p.evaluate(() => ({ stock: [...document.querySelectorAll(".hz8-stock, .stock-status, [class*='stock']")].filter(e => e.offsetParent).map(e => e.textContent.trim()).filter(Boolean).slice(0, 2), buy: (b => b ? { text: b.textContent.trim(), disabled: b.disabled } : null)(document.querySelector(".buy-form .button.buy")), price: (document.querySelector(".product-detail__information .price") || {}).textContent?.replace(/\s+/g, " ").trim() }));
  await p.click(".buy-form .button.buy"); await p.waitForTimeout(5000);
  st.cartPosts = p.cartPosts; st.errs = p.errs; await ctx.close(); return st;
});
// 6. Faraoh-PDP: varianter/lager, recensioner, köp
await step("pdp-faraoh", async () => {
  const { p, ctx } = await open("/sv/products/vape-thc-a-45-faraoh-2ml/133", 1440);
  await p.waitForTimeout(9000);
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); }); await p.waitForTimeout(4000);
  const st = await p.evaluate(() => ({ reviews: document.querySelectorAll("[class*='pp-review'], [class*='rv-card'], .hz8-pp-rv__item, .hz8-ppr__item").length, reviewText: ((document.querySelector("[class*='pp-review'], [id*='omdomen'], [id*='reviews']") || {}).textContent || "").replace(/\s+/g, " ").trim().slice(0, 80), variants: document.querySelectorAll("[class*='pp-variant'], [class*='strain'] button, .hz8-pp-opt").length, stock: [...document.querySelectorAll("[class*='stock']")].filter(e => e.offsetParent).map(e => e.textContent.trim()).filter(Boolean).slice(0, 2), similar: document.querySelectorAll(".hz8-prail .product-card, [class*='similar'] .product-card").length }));
  st.errs = p.errs; await ctx.close(); return st;
});
// 7. Magic Sauce-hubben: hyllor laddade, ankarnav
await step("magic-sauce-hub", async () => {
  const { p, ctx } = await open("/sv/categories/magic-sauce", 1440);
  await p.waitForTimeout(10000);
  const st = await p.evaluate(() => ({ loading: !!document.querySelector(".hz8-sh-shelves.is-loading"), error: !!document.querySelector(".hz8-sh-shelves .hz8-state--error"), cards: document.querySelectorAll(".hz8-sh-shelves .product-card").length, nav: [...document.querySelectorAll(".hz8-sh-nav a, .hz8-sh-nav button")].map(a => a.textContent.trim()).filter(Boolean), count: (document.querySelector(".hz8-sh-hero__count") || {}).textContent }));
  st.errs = p.errs; await ctx.close(); return st;
});
// 8. Headernavigering
await step("header-nav", async () => {
  const { p, ctx } = await open("/", 1440);
  await p.waitForTimeout(4000);
  const link = p.locator(".hz8-header-nav a[href*='/sv/categories/']").first();
  const href = await link.getAttribute("href");
  await Promise.all([p.waitForURL(/\/sv\/categories\//, { timeout: 60000 }).catch(() => {}), link.click()]);
  const st = { href: href.replace(/[?&]preview=[^&]+/, ""), landed: new URL(p.url()).pathname };
  await ctx.close(); return st;
});
// 9. Mobilmeny (393): hamburgare öppnar Theme 8-lådan med länkar, Escape stänger
await step("mobile-menu", async () => {
  const { p, ctx } = await open("/", 393); await p.waitForTimeout(5000);
  await p.locator("#mobile-nav-menu, #store-header .hamburger").first().click();
  await p.waitForTimeout(800);
  const open1 = await p.evaluate(() => { const d = document.getElementById("hz8MobileDrawer"); return { open: !!d && d.classList.contains("is-open"), links: d ? [...d.querySelectorAll("a[href]")].filter(a => a.offsetParent).length : 0, logo: (d && d.querySelector("img") || {}).currentSrc?.split("/").pop() || null }; });
  await p.keyboard.press("Escape"); await p.waitForTimeout(600);
  const closed = await p.evaluate(() => !document.getElementById("hz8MobileDrawer").classList.contains("is-open"));
  const r = { ...open1, closedByEscape: closed, errs: p.errs }; await ctx.close(); return r;
});
// 10. Mobilsök (393): sökikon öppnar sökpanelen, förslag från Nyehandels sök-API, Enter går till söksidan
await step("mobile-search", async () => {
  const { p, ctx } = await open("/", 393); await p.waitForTimeout(5000);
  await p.locator("#mobile-search-trigger").first().click(); await p.waitForTimeout(800);
  const opened = await p.evaluate(() => { const s = document.getElementById("hz8MobileSearch"); return !!s && s.classList.contains("is-open"); });
  if (!opened) { await ctx.close(); return { opened }; }
  await p.fill("#hz8MsearchInput", "vape"); await p.waitForTimeout(4000);
  const res = await p.evaluate(() => [...document.querySelectorAll("#hz8MsearchResults a[href]")].length);
  await p.press("#hz8MsearchInput", "Enter"); await p.waitForURL(/\/search/, { timeout: 30000 }).catch(() => {});
  const r = { opened, results: res, landed: new URL(p.url()).pathname + new URL(p.url()).search.replace(/&?preview=[^&]+/, ""), errs: p.errs }; await ctx.close(); return r;
});
// 11. Desktopsök (1440): skriv i headerns sökfält -> förslag, Enter -> söksida
await step("desktop-search", async () => {
  const { p, ctx } = await open("/", 1440); await p.waitForTimeout(5000);
  const input = p.locator('#store-header input[type="search"], #store-header input[name="query"], #store-header input[type="text"]').first();
  const has = await input.count(); if (!has) { await ctx.close(); return { input: false }; }
  await input.click(); await input.fill("vape"); await p.waitForTimeout(4000);
  const sugg = await p.evaluate(() => [...document.querySelectorAll("#store-header a[href*='/products/'], .search-results a[href*='/products/'], [class*='search'] a[href*='/products/']")].filter(a => a.offsetParent).length);
  await input.press("Enter"); await p.waitForURL(/\/search/, { timeout: 30000 }).catch(() => {});
  const cards = await p.waitForSelector(".product-card", { timeout: 30000 }).then(() => p.evaluate(() => document.querySelectorAll(".product-card").length)).catch(() => 0);
  const r = { input: true, suggestions: sugg, landed: new URL(p.url()).pathname, resultCards: cards, errs: p.errs }; await ctx.close(); return r;
});
// 12. Varukorg och köpflöde: snabbköp -> varukorgslådan visar raden -> kassan visar produkten (ingen order läggs)
await step("cart-checkout", async () => {
  const { p, ctx } = await open("/", 1440); await p.waitForTimeout(4000);
  await p.locator(".hz8-products").scrollIntoViewIfNeeded(); await p.waitForTimeout(9000);
  const btn = p.locator(".hz8-products .hz8-pcard button.hz8-pcard__cta:not(.hz8-pcard__cta--choose):not([disabled])").first();
  const name = await btn.evaluate(b => b.closest(".hz8-pcard").querySelector(".hz8-pcard__name a").getAttribute("title"));
  await btn.click(); await p.waitForFunction(() => /Tillagd/.test(document.querySelector(".hz8-products").textContent), null, { timeout: 30000 }).catch(() => {});
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(800);
  await p.locator('#store-header .right a[href*="checkout"], #store-header [class*="cart"], #store-header [aria-label*="arukorg" i]').first().click().catch(() => {});
  await p.waitForTimeout(3000);
  const drawer = await p.evaluate(() => ({ open: !!document.querySelector("#cart-side-wrap.is-active"), rows: document.querySelectorAll("#cartAside article.item").length, text: ((document.querySelector("#cartAside") || {}).textContent || "").replace(/\s+/g, " ").slice(0, 200) }));
  await p.goto("https://hazeyse.nyehandel.se/sv/checkout?preview=v9kzdmqz4w60l5n", { waitUntil: "domcontentloaded", timeout: 90000 }); await p.waitForTimeout(8000);
  const co = await p.evaluate(n => { const t = document.body.innerText; return { hasProduct: t.includes(n.split(" - ").pop()) || t.includes(n), url: location.pathname, hasForm: !!document.querySelector("form, input[type=email]") }; }, name);
  const r = { name, cartPosts: p.cartPosts, drawer, checkout: co, errs: p.errs }; await ctx.close(); return r;
});
// 13. Faraoh: byt strain -> lager/pris uppdateras, lägg i varukorg -> POST 200
await step("faraoh-variant-buy", async () => {
  const { p, ctx } = await open("/sv/products/vape-thc-a-45-faraoh-2ml/133", 1440); await p.waitForTimeout(9000);
  const st = () => p.evaluate(() => ({ stock: (document.querySelector(".hz8-pp__stock") || {}).textContent?.trim(), price: (document.querySelector(".hz8-pp__price") || {}).textContent?.trim(), selected: (document.querySelector('.hz8-pp__tiles [aria-pressed="true"], .hz8-pp__tiles [aria-checked="true"], .hz8-pp__tiles .is-selected') || {}).textContent?.replace(/\s+/g, " ").trim().slice(0, 40), url: location.search.replace(/&?preview=[^&]+/, "") }));
  const s1 = await st();
  const tiles = p.locator(".hz8-pp__tiles button:not([disabled]):not([aria-pressed='true']):not([aria-checked='true'])");
  const n = await tiles.count(); if (n) { await tiles.nth(Math.min(1, n - 1)).click(); await p.waitForTimeout(2500); }
  const s2 = await st();
  await p.locator(".hz8-pp__cta").first().click(); await p.waitForTimeout(5000);
  const msg = await p.evaluate(() => (document.querySelector(".hz8-pp__msg") || {}).textContent?.trim());
  const r = { tiles: n, before: s1, after: s2, changed: s1.selected !== s2.selected, cartPosts: p.cartPosts, msg, errs: p.errs }; await ctx.close(); return r;
});
fs.mkdirSync(path.join(DIR, "runs"), { recursive: true });
fs.writeFileSync(path.join(DIR, "runs", `functional-${which}${ONLY ? "-" + ONLY.join("_") : ""}.json`), JSON.stringify(R, null, 1));
await b.close();
