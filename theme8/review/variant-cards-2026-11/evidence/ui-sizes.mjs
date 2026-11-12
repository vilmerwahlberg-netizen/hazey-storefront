// TASK 23c — storleksval på MS Vapes + "Populärast"-ordningen med variantkort. Lokal build, Theme 8-preview.
// Inga korgar. Kör: VP=393|1440 node ui-sizes.mjs [filter]
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, url } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const VP = +(process.env.VP || 1440), M = VP < 768, SUF = "-" + VP;
const UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36";
const only = process.argv[2] ? new RegExp(process.argv[2]) : null;
const b = await chromium.launch(); const all = {};
const page = async route => { const ctx = await ctxFor(M ? { newContext: o => b.newContext({ ...o, userAgent: UA }) } : b, VP, M ? 852 : 1000, { which: "after" }); const p = await open(ctx, route); await ready(p, 8000); try { await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 1500 }); } catch { } return { ctx, p }; };
const expandAll = async p => { for (let i = 0; i < 25; i++) { const m = p.locator(".hz8-series-results__more:visible").first(); if (!(await m.count())) break; await m.click().catch(() => { }); await p.waitForTimeout(350); } };
const state = p => p.evaluate(() => {
  const vis = e => !!e && e.getClientRects().length > 0 && getComputedStyle(e).display !== "none";
  const cards = [...document.querySelectorAll(".hz8-series-results .product-card")].filter(vis);
  const cnt = [".hz8-sf-count", ".hz8-ptool__count", ".hz8-pcount"].map(s => document.querySelector(s)).find(vis);
  return { url: location.search, count: cnt ? +(cnt.textContent.match(/\d+/) || [])[0] : null, sizes: [...document.querySelectorAll(".hz8-sf-size")].filter(vis).map(x => (x.getAttribute("aria-pressed") === "true" ? "*" : "") + x.childNodes[0].textContent.trim() + ":" + x.querySelector(".hz8-sf-size__n").textContent),
    overflow: document.documentElement.scrollWidth > innerWidth + 1,
    cards: cards.map(c => ({ v: c.getAttribute("data-hz8-variant"), st: c.getAttribute("data-hz8-instock"), brand: (c.querySelector(".brand") || {}).textContent?.trim(), name: (c.querySelector(".name") || {}).textContent?.trim(), path: new URL(c.querySelector("a[href]").href).pathname.replace(/\/\d+$/, ""), price: (c.querySelector(".price ins, .price") || {}).textContent?.replace(/\s+/g, " ").trim(), pill: !!c.querySelector(".hz8-card-pill") && vis(c.querySelector(".hz8-card-pill")), sold: !!c.querySelector(".hz8-psold") })) };
});
const clickSize = async (p, label) => { await p.locator(".hz8-sf-size", { hasText: label }).first().click(); await p.waitForTimeout(2500); await expandAll(p); };
const SC = {
  "S1-ms-vapes-storlek": async () => {
    const { ctx, p } = await page("/sv/categories/ms-vapes"); await expandAll(p);
    const a = await state(p); await p.screenshot({ path: path.join(DIR, "shots", "S1-ms-vapes-alla" + SUF + ".png") });
    await clickSize(p, "2 ml"); const s2 = await state(p); await p.evaluate(() => scrollTo(0, 0)); await p.screenshot({ path: path.join(DIR, "shots", "S1-ms-vapes-2ml" + SUF + ".png") });
    await clickSize(p, "5 ml"); const s5 = await state(p);
    await clickSize(p, "Alla"); const back = await state(p);
    await ctx.close();
    const only = (s, vol) => s.cards.every(c => new RegExp("\\b" + vol + "\\b", "i").test(c.brand || ""));
    const foreign = s => s.cards.filter(c => /\b(1|10)\s*ml\b/i.test(c.brand || "") || /pack|kollektion/i.test(c.name + " " + c.brand)).map(c => c.brand + " " + c.name);
    const r = { alla: { count: a.count, n: a.cards.length, sizes: a.sizes, foreign: foreign(a) }, ml2: { count: s2.count, n: s2.cards.length, url: s2.url, soldShownNotBuyable: s2.cards.filter(c => c.st === "0").every(c => c.sold && !c.pill), sold: s2.cards.filter(c => c.st === "0").length }, ml5: { count: s5.count, n: s5.cards.length }, back: { count: back.count, n: back.cards.length, url: back.url }, overflow: a.overflow || s2.overflow };
    r.pass = JSON.stringify(a.sizes) === JSON.stringify(["*Alla:" + a.cards.length, "2 ml:" + s2.cards.length, "5 ml:" + s5.cards.length]) && a.count === a.cards.length && !r.alla.foreign.length && s2.count === s2.cards.length && only(s2, "2ml") && s2.cards.length === 9 && r.ml2.sold === 7 && r.ml2.soldShownNotBuyable && /volym=2ml/.test(s2.url) && s5.count === s5.cards.length && only(s5, "5ml") && s5.cards.length === 5 && back.cards.length === a.cards.length && !/volym=/.test(back.url) && !r.overflow;
    return r;
  },
  "S2-ms-vapes-i-lager": async () => {
    const { ctx, p } = await page("/sv/categories/ms-vapes?filters=smart-filter_in-stock"); await expandAll(p);
    const a = await state(p); await clickSize(p, "2 ml"); const s2 = await state(p); await p.evaluate(() => scrollTo(0, 0)); await p.screenshot({ path: path.join(DIR, "shots", "S2-ms-vapes-2ml-i-lager" + SUF + ".png") });
    await clickSize(p, "5 ml"); const s5 = await state(p); await ctx.close();
    const r = { alla: { count: a.count, n: a.cards.length, sizes: a.sizes }, ml2: s2.cards.map(c => c.name), ml5: s5.cards.map(c => c.name), notInStock: [...a.cards, ...s2.cards, ...s5.cards].filter(c => c.st !== "1").length };
    r.pass = a.count === a.cards.length && a.cards.length === 7 && JSON.stringify(a.sizes) === JSON.stringify(["*Alla:7", "2 ml:2", "5 ml:5"]) && JSON.stringify(r.ml2.slice().sort()) === JSON.stringify(["Gorilla Cookies", "Tinky Winky"]) && s2.count === 2 && s5.cards.length === 5 && s5.count === 5 && !r.notInStock;
    return r;
  },
  "S3-ms-vapes-sortering": async () => {
    const { ctx, p } = await page("/sv/categories/ms-vapes?sort=name_a&volym=2ml"); await expandAll(p); const n = await state(p);
    await p.goto(url("/sv/categories/ms-vapes?sort=price_high"), { waitUntil: "domcontentloaded" }); await ready(p, 8000); await expandAll(p); const pr = await state(p);
    await ctx.close();
    const names = n.cards.map(c => c.brand + " – " + c.name); const sortedN = names.slice().sort((x, y) => x.localeCompare(y, "sv"));
    const prices = pr.cards.map(c => +(c.price || "").replace(/[^\d]/g, ""));
    const r = { nameSort: { count: n.count, n: n.cards.length, sizes: n.sizes, names }, priceHigh: prices };
    r.pass = JSON.stringify(names) === JSON.stringify(sortedN) && n.count === n.cards.length && n.cards.length === 9 && /^\*2 ml/.test((n.sizes.find(x => x.startsWith("*")) || "")) && prices.every((x, i) => i === 0 || prices[i - 1] >= x);
    return r;
  },
  "S4-populart-ordning": async () => {
    const out = {};
    for (const route of ["/sv/categories/alla-vapes", "/sv/categories/ms-vapes"]) {
      const { ctx, p } = await page(route + "?sort=popular"); await expandAll(p); const s = await state(p);
      // Nyehandels egen ordning för samma sortering (serverrenderade sidor, alla sidor)
      const server = await p.evaluate(async r => { const out = []; for (let pg = 1; pg < 10; pg++) { const d = new DOMParser().parseFromString(await (await fetch(r + "?sort=popular" + (pg > 1 ? "&page=" + pg : ""))).text(), "text/html"); const cs = [...d.querySelectorAll("#category-products .product-card")]; cs.forEach(c => out.push(new URL(c.querySelector("a[href*='/products/']").href).pathname)); if (cs.length < 25) break; } return out; }, route);
      await ctx.close();
      const firstSeen = []; s.cards.forEach(c => { if (firstSeen.indexOf(c.path) === -1) firstSeen.push(c.path); });
      // ordning bland produkter som visas: samma relativa ordning som servern (alla källor för alla-vapes: delsekvens-kontroll per källa räcker inte -> jämför bara produkter som finns i serverlistan)
      const inServer = firstSeen.filter(x => server.indexOf(x) !== -1);
      const serverOrder = server.filter(x => inServer.indexOf(x) !== -1);
      // köpbara varianter för samma produkt ligger i följd
      const contiguous = Object.values(s.cards.reduce((m, c, i) => { if (c.v && c.st === "1") (m[c.path] = m[c.path] || []).push(i); return m; }, {})).every(ix => ix.every((x, k) => k === 0 || x === ix[k - 1] + 1));
      out[route] = { n: s.cards.length, count: s.count, sameOrder: JSON.stringify(inServer) === JSON.stringify(serverOrder), compared: inServer.length, contiguous, first: firstSeen.slice(0, 6).map(x => x.split("/").pop()) };
    }
    return { ...out, pass: Object.values(out).every(x => x.sameOrder && x.contiguous && x.count === x.n) };
  }
};
for (const [name, fn] of Object.entries(SC)) {
  if (only && !only.test(name)) continue;
  let r; try { r = await fn(); } catch (e) { r = { error: String(e).slice(0, 300), pass: false }; }
  all[name] = r; console.log(`\n### ${name}${SUF}: ${r.pass ? "PASS" : "FAIL"}`); console.log(JSON.stringify(r).slice(0, 1600));
}
fs.writeFileSync(path.join(DIR, "ui-sizes-" + (process.argv[2] || "all").replace(/\W+/g, "_") + SUF + ".json"), JSON.stringify(all, null, 1));
await b.close();
