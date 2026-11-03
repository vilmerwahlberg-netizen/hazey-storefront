// TASK 17B — Alla Buds: serie-, vikt- och kombinationsfilter mot förväntad mängd ur Nyehandels kategoridata.
// Förväntat: kort på /blommor-buds som också finns på seriens hubb eller någon av dess routes (seriesMemberRoutes),
// resp. vars namn ger vikten (samma parser som Theme 8). Datan hämtas live (GET) i samma körning.
// Kontroller: antal + exakt mängd, inga dubbletter, delbar URL, omladdning, bakåt/framåt, inga konsolfel/överflöd.
// Kör: node buds-filter.mjs [which] [w]  ->  runs/buds-filter-<which>-<w>.json + shots/filters/
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, DIR, url } from "./lib/harness.mjs";
const which = process.argv[2] || "after", W = +(process.argv[3] || 1440);
const O = "https://hazeyse.nyehandel.se", UA = "Mozilla/5.0 (Macintosh) Chrome/128";
const SHOTS = path.join(DIR, "shots/filters"); fs.mkdirSync(SHOTS, { recursive: true });
async function slugsOf(route) {
  const out = new Set();
  for (let pg = 1; pg < 10; pg++) {
    const h = await (await fetch(O + route + (route.includes("?") ? "&" : "?") + "page=" + pg, { headers: { "User-Agent": UA } })).text();
    const i = h.indexOf('id="category-products"'); if (i < 0) break;
    const before = out.size;
    for (const m of h.slice(i).matchAll(/class="product-card"[\s\S]*?href="(?:https:\/\/hazeyse\.nyehandel\.se)?\/sv\/products\/([^"]+)"[\s\S]*?<span class="name">([^<]*)</g)) out.add(m[1] + "\t" + m[2].replace(/&amp;/g, "&"));
    if (out.size === before || !/[?&]page=\d/.test(h)) break;
  }
  return [...out].map(x => { const [slug, name] = x.split("\t"); return { slug, name }; });
}
const SERIES = {
  "Magic Sauce": ["/sv/categories/magic-sauce", "/sv/categories/ms-vapes", "/sv/categories/ms-carts", "/sv/categories/ms-buds", "/sv/categories/ms-hash"],
  "Core": ["/sv/categories/hero-vapes", "/sv/categories/core-vapes", "/sv/categories/high-life-hash"],
  "D10": ["/sv/categories/d10-1", "/sv/categories/d10-vapes", "/sv/categories/d10-buds", "/sv/categories/d10-hash"],
  "Nano-11": ["/sv/categories/nano-11", "/sv/categories/nano11-blommor"],
  "THCaB": ["/sv/categories/thca-b", "/sv/categories/thcab-vapes"], "THCbA": ["/sv/categories/thcba", "/sv/categories/thcba-vapes"]
};
const weight = name => { const a = String(name).match(/(\d+(?:[.,]\d+)?)\s*(?:g|gram)\b/gi); if (!a) return null; const v = a[a.length - 1].replace(/\s*(?:gram|g)$/i, "").trim(); return v.replace(/[.,]/, "-") + "g"; };
const base = await slugsOf("/sv/categories/blommor-buds");
const inBase = new Set(base.map(x => x.slug));
const expectSeries = {};
for (const [s, routes] of Object.entries(SERIES)) { const set = new Set(); for (const r of routes) (await slugsOf(r)).forEach(x => inBase.has(x.slug) && set.add(x.slug)); expectSeries[s] = set; }
const expectWeight = w => new Set(base.filter(x => weight(x.name) === w).map(x => x.slug));
const inter = (a, b) => new Set([...a].filter(x => b.has(x)));
const union = (...s) => new Set(s.flatMap(x => [...x]));

const b = await chromium.launch(); const ctx = await ctxFor(b, W, W < 768 ? 852 : 900, { which });
const p = await open(ctx, "/sv/categories/blommor-buds"); await ready(p, 8000); await p.waitForTimeout(5000);
const R = { which, w: W, base: base.length, expected: Object.fromEntries(Object.entries(expectSeries).map(([k, v]) => [k, v.size])), steps: [] };
async function shown() {
  await p.waitForTimeout(3500);
  for (let i = 0; i < 6; i++) { const more = p.locator(".hz8-series-results:not([hidden]) button:has-text('Visa fler'), .hz8-pmore button").first(); if (await more.count() && await more.isVisible().catch(() => false)) { await more.click().catch(() => {}); await p.waitForTimeout(1200); } else break; }
  return p.evaluate(() => {
    const res = document.querySelector(".hz8-series-results:not([hidden])");
    const scope = res || document.querySelector("#category-products") || document.body;
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 20 && r.height > 20 && !e.closest("[hidden]"); };
    const slugs = [...scope.querySelectorAll(".product-card")].filter(vis).map(c => { const a = c.querySelector("a[href*='/products/']"); return a ? new URL(a.href).pathname.replace(/^\/sv\/products\//, "").replace(/\/$/, "") : null; }).filter(Boolean);
    const u = new URL(location.href); u.searchParams.delete("preview");
    return { url: u.pathname + u.search, slugs, union: !!res, status: (document.querySelector(".hz8-series-status__text") || {}).textContent || "" };
  });
}
function judge(label, got, exp) {
  const g = new Set(got.slugs), dup = got.slugs.length - g.size;
  const missing = [...exp].filter(x => !g.has(x)), extra = [...g].filter(x => !exp.has(x));
  const ok = !missing.length && !extra.length && !dup;
  R.steps.push({ label, url: got.url, expected: exp.size, shown: g.size, dup, missing, extra, ok, status: got.status.trim() });
  console.log(`${ok ? "PASS" : "FAIL"} ${label}: förväntat ${exp.size}, visat ${g.size}, dubbletter ${dup}${missing.length ? " saknas " + missing.slice(0, 4).join(",") : ""}${extra.length ? " extra " + extra.slice(0, 4).join(",") : ""} | ${got.url}`);
}
const opts = await p.evaluate(() => [...document.querySelectorAll(".hz8-ptool [data-hz8-series]")].map(e => e.getAttribute("data-hz8-series")));
R.options = opts;
console.log("serieval:", opts.join(", "), "| förväntat med träffar:", Object.entries(expectSeries).filter(([, v]) => v.size).map(([k, v]) => k + " " + v.size).join(", "));
const serieBtn = name => p.locator(`.hz8-ptool [data-hz8-series="${name}"] button`).first();
async function clickSeries(name) { const bt = serieBtn(name); if (await bt.count() && await bt.isVisible()) await bt.click(); else await p.evaluate(n => { const e = document.querySelector(`[data-hz8-series="${n}"] button`); if (e) e.click(); }, name); }
async function clickDim(d, v) { await p.evaluate(([d, v]) => { const e = document.querySelector(`[data-hz8-dim="${d}"][data-value="${v}"] button`); if (e) e.click(); }, [d, v]); }
for (const s of opts) {
  await clickSeries(s); const got = await shown(); judge("serie " + s, got, expectSeries[s] || new Set());
  await p.screenshot({ path: path.join(SHOTS, `${which}-${W}-serie-${s.replace(/\W+/g, "")}.png`) });
  await clickSeries(s); await p.waitForTimeout(1500);
}
for (const w of ["3-5g", "5g"]) {
  await clickDim("volym", w); const got = await shown(); judge("vikt " + w, got, expectWeight(w));
  await p.screenshot({ path: path.join(SHOTS, `${which}-${W}-vikt-${w}.png`) });
  await clickDim("volym", w); await p.waitForTimeout(1500);
}
// Kombination: Magic Sauce + Nano-11 (flerval, OR) och vikt 5 g (AND)
await clickSeries("Magic Sauce"); await p.waitForTimeout(800); await clickSeries("Nano-11"); await p.waitForTimeout(800); await clickDim("volym", "5g");
let got = await shown(); const comboExp = inter(union(expectSeries["Magic Sauce"], expectSeries["Nano-11"]), expectWeight("5g"));
judge("Magic Sauce + Nano-11 + 5 g", got, comboExp);
await p.screenshot({ path: path.join(SHOTS, `${which}-${W}-kombination.png`) });
const comboUrl = got.url;
// Omladdning med delbar URL
await p.goto(url(comboUrl)); await ready(p, 6000); got = await shown(); judge("omladdning " + comboUrl, got, comboExp);
// Bakåt/framåt: till en PDP och tillbaka
const first = got.slugs[0];
if (first) { await p.goto(url("/sv/products/" + first)); await ready(p, 3000); await p.goBack(); await ready(p, 6000); got = await shown(); judge("bakåt från PDP", got, comboExp); await p.goForward(); await ready(p, 3000); { const u = new URL(p.url()); u.searchParams.delete("preview"); R.forward = u.pathname + u.search; } await p.goBack(); await ready(p, 5000); }
R.errors = p.errors.filter(e => !/trustpilot|gtm|Failed to load resource: the server responded with a status of 4/i.test(e));
R.overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
// Filterarket/panelen öppet för granskningsbilden
await p.goto(url("/sv/categories/blommor-buds")); await ready(p, 6000); await p.waitForTimeout(4000);
const fbtn = p.locator("button:has-text('Alla filter'), button:has-text('Filter & sortera')").first();
if (await fbtn.count()) { await fbtn.click().catch(() => {}); await p.waitForTimeout(1200); for (const t of ["Vikt", "Serie", "Cannabinoid / serie"]) { const acc = p.locator(`#hz8-pfilter button:has-text("${t}")`).first(); if (await acc.count()) { await acc.click().catch(() => {}); await p.waitForTimeout(400); } } await p.screenshot({ path: path.join(SHOTS, `${which}-${W}-filterark-oppet.png`) }); }
fs.writeFileSync(path.join(DIR, `runs/buds-filter-${which}-${W}.json`), JSON.stringify(R, null, 1));
console.log("fel:", R.errors.length, "överflöd:", R.overflow);
await b.close();
