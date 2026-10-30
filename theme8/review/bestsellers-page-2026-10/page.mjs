// TASK 11 -- målsidan /sv/page/vara-bastsaljare.
//   widths  320/393/430/1440/1920 + 200 % (720 CSS-px, DPR 2): helsida,
//           1 synlig H1, 0 överflöd, 0 konsolfel, adminyta dold, 12 kort,
//           0 varumärkeslösa, inga ranknummer, flikar, antal, TrustBox,
//           formatguide, nedre moduler. Före = native sida (a9081ee).
//   order   393/1440 (bara efter): hela listan (?visa=108) = alla-produkter
//           ?sort=popular (alla sidor) utan varumärkeslösa/dubbletter;
//           ?typ=<format> = samma ordning filtrerad på formatets kategori.
// node page.mjs <before|after> [widths|order]
import { chromium, ctxFor, open, ready, DIR } from "./lib.mjs"; import fs from "node:fs";
const [which = "after", only] = process.argv.slice(2);
const ROUTE = "/sv/page/vara-bastsaljare";
const b = await chromium.launch(); const R = {};
const INFO = () => {
  const vis = e => !!e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== "hidden";
  const t = e => (e ? e.textContent.replace(/\s+/g, " ").trim() : null);
  const cards = [...document.querySelectorAll("#hz8-bs-grid .product-card")];
  return {
    h1Visible: [...document.querySelectorAll("h1")].filter(vis).map(t), h1Dom: document.querySelectorAll("h1").length,
    overflowX: document.documentElement.scrollWidth - innerWidth,
    adminHidden: [...document.querySelectorAll("#skip-to-main-content > .store-page")].every(e => !vis(e)),
    adminIntact: { filters: !!document.querySelector(".nh-bs-filters"), source: !!document.querySelector("[data-nh-source]"), hero: !!document.querySelector(".nh-bs-hero") },
    crumbs: [...document.querySelectorAll(".designer-breadcrumbs li")].map(t),
    kicker: t(document.querySelector(".hz8-bs-page .hz8-portal-kicker")), lead: t(document.querySelector(".hz8-bs-page .hz8-cat-lead")),
    trust: { iframe: !!document.querySelector(".hz8-bs-trust iframe"), fallback: t(document.querySelector(".hz8-bs-trust a")) },
    tabs: [...document.querySelectorAll(".hz8-pfam__tab")].filter(vis).map(t), stock: vis(document.querySelector('[data-bs="stock"]')),
    head: t(document.querySelector(".hz8-pgridhead__title")), sort: vis(document.querySelector(".hz8-pgridhead__sort")) ? t(document.querySelector(".hz8-pgridhead__sort")) : null,
    cards: cards.length, brandless: cards.filter(c => !t(c.querySelector(".brand"))).length,
    rank: cards.filter(c => /(^|\s)#\s?\d+\b|\b\d+\s*sålda\b/i.test(c.textContent)).length,
    pills: [...new Set(cards.map(c => t(c.querySelector(".hz8-card-pill"))))],
    cols: (() => { const tops = cards.slice(0, 8).map(c => Math.round(c.getBoundingClientRect().top)); return tops.filter(x => x === tops[0]).length; })(),
    more: vis(document.querySelector(".hz8-bs-more")) ? { text: t(document.querySelector(".hz8-bs-more__text")), btn: t(document.querySelector(".hz8-bs-more__btn")), exp: document.querySelector(".hz8-bs-more__btn").getAttribute("aria-expanded") } : null,
    guide: vis(document.querySelector(".hz8-bs-guide")) ? [...document.querySelectorAll(".hz8-bs-fmt")].map(t) : null,
    lower: [...document.querySelectorAll(".hz8-lmod")].filter(vis).map(m => t(m.querySelector("h2"))),
    faq: [...document.querySelectorAll(".hz8-lmod__qa summary")].map(t),
    navActive: [...document.querySelectorAll("#store-header a[aria-current], #store-header .is-active a, #store-header a.is-active")].map(t)
  };
};
if (!only || only === "widths") {
  for (const [w, zoom] of [[320], [393], [430], [1440], [1920], [720, 2]]) {
    const tag = zoom ? "200" : String(w);
    const ctx = await ctxFor(b, w, zoom ? 450 : w < 768 ? 852 : 900, { which, zoom }); const p = await open(ctx, ROUTE); await ready(p, 6000);
    await p.waitForSelector(".hz8-bs-trust iframe", { timeout: 10000 }).catch(() => {});
    await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { scrollTo({ top: y, behavior: "instant" }); await new Promise(r => setTimeout(r, 110)); } scrollTo({ top: 0, behavior: "instant" }); }); await p.waitForTimeout(2000);
    await p.screenshot({ path: `${DIR}/runs/shots/${which}-page-${tag}-first.jpg`, type: "jpeg", quality: 78 });
    await p.screenshot({ path: `${DIR}/runs/shots/${which}-page-${tag}-full.jpg`, fullPage: true, type: "jpeg", quality: 74 });
    R[`w-${tag}`] = { ...(await p.evaluate(INFO)), errors: p.errors }; console.log(tag, JSON.stringify(R[`w-${tag}`]));
    await ctx.close();
  }
}
if (which === "after" && (!only || only === "order")) {
  const SRC = async ({ fam }) => {
    const parse = h => new DOMParser().parseFromString(h, "text/html");
    const pathOf = h => new URL(h, location.origin).pathname.replace(/\/\d+$/, "");
    const pv = location.search.match(/preview=[^&]+/)[0];
    async function all(href) {
      const get = async n => parse(await (await fetch(href + (href.includes("?") ? "&" : "?") + pv + (n > 1 ? "&page=" + n : ""))).text());
      const d1 = await get(1); const cnt = parseInt((d1.getElementById("products_count") || {}).textContent, 10);
      let cards = [...d1.querySelectorAll(".product-card")]; const per = cards.length;
      for (let n = 2; per && n <= Math.ceil(cnt / per); n++) cards = cards.concat([...(await get(n)).querySelectorAll(".product-card")]);
      return cards.map(c => ({ path: pathOf(c.querySelector("a[href*='/products/']").getAttribute("href")), brand: (c.querySelector(".brand") || {}).textContent?.trim() || "" }));
    }
    const seen = {}; let src = (await all("/sv/categories/alla-produkter?sort=popular")).filter(c => c.brand && !seen[c.path] && (seen[c.path] = 1)).map(c => c.path);
    if (fam) { const f = HZ8.catalog.build().formats.find(x => x.key === fam); const set = new Set((await all(f.href)).map(c => c.path)); src = src.filter(p0 => set.has(p0)); }
    const shown = [...document.querySelectorAll("#hz8-bs-grid > [data-hz8-path]")].map(c => c.getAttribute("data-hz8-path"));
    return { src: src.length, shown: shown.length, equal: JSON.stringify(src) === JSON.stringify(shown), firstDiff: src.findIndex((x, i) => x !== shown[i]), countText: (document.querySelector(".hz8-bs-more__text") || {}).textContent || null };
  };
  for (const w of [393, 1440]) for (const fam of ["", "vapes", "carts", "buds", "hasch"]) {
    const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which }); const p = await open(ctx, `${ROUTE}?visa=120${fam ? "&typ=" + fam : ""}`); await ready(p, 9000);
    await p.waitForFunction(() => /av \d+/.test((document.querySelector(".hz8-bs-more__text") || {}).textContent || "") || document.querySelectorAll("#hz8-bs-grid > [data-hz8-path]").length > 0, null, { timeout: 30000 }).catch(() => {});
    await p.waitForTimeout(3000);
    R[`order-${w}-${fam || "alla"}`] = { ...(await p.evaluate(SRC, { fam })), errors: p.errors }; console.log("order", w, fam || "alla", JSON.stringify(R[`order-${w}-${fam || "alla"}`]));
    await ctx.close();
  }
}
fs.writeFileSync(`${DIR}/runs/page-${which}${only ? "-" + only : ""}.json`, JSON.stringify(R, null, 1));
await b.close();
