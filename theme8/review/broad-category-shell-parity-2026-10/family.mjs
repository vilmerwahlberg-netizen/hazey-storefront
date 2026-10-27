// TASK 01G -- familjeparitet Alla Vapes / Alla Buds / Allt Hasch.
// node family.mjs before|after <width,..> [states=normal,filtered,sorted,empty]
// Per rutt/bredd/läge: geometri (hero, guide, hylla, gridstart, nedre modul),
// hyllans innehåll (flikar, knappar), antal, överflöd, fel + utsnitt.
import { chromium, ctxFor, open, ready, DIR, ROUTES } from "./lib.mjs"; import fs from "node:fs";
const [which = "after", ws = "1440", ss = "normal"] = process.argv.slice(2);
const OUT = `${DIR}/runs/shots`; fs.mkdirSync(OUT, { recursive: true });
const ROUTE = { vapes: "/sv/categories/alla-vapes", buds: "/sv/categories/blommor-buds", hasch: "/sv/categories/hasch" };
// Lägen: riktiga URL-tillstånd. "empty": I lager + en serie utan lagerförda
// produkter i formatet väljs per rutt i runs/empty-probe.json (empty.mjs).
const EMPTY = fs.existsSync(`${DIR}/runs/empty-probe.json`) ? JSON.parse(fs.readFileSync(`${DIR}/runs/empty-probe.json`)) : {};
const Q = { normal: () => "", filtered: () => "?serie=magic-sauce", sorted: () => "?sort=price_high", empty: r => EMPTY[r] || "" };
const b = await chromium.launch(); const rows = [];
for (const st of ss.split(",")) for (const r of Object.keys(ROUTE)) for (const w of ws.split(",").map(Number)) {
  const q = Q[st](r); if (st === "empty" && !q) continue;
  const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which }); const p = await open(ctx, ROUTE[r] + q); await ready(p, 6000);
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 900) { scrollTo({ top: y, behavior: "instant" }); await new Promise(r => setTimeout(r, 110)); } scrollTo({ top: 0, behavior: "instant" }); });
  await p.waitForTimeout(900);
  const g = await p.evaluate(() => {
    const R = s => { const e = typeof s === "string" ? document.querySelector(s) : s; if (!e || !e.getClientRects().length) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), bottom: Math.round(r.bottom + scrollY), left: Math.round(r.left), width: Math.round(r.width), height: Math.round(r.height) }; };
    const vis = e => e && e.getClientRects().length && getComputedStyle(e).visibility !== "hidden";
    const desk = document.querySelector(".hz8-ptool__desk"), mob = document.querySelector(".hz8-ptool__mob");
    const shelf = vis(desk) ? desk : mob; const cs = shelf && getComputedStyle(shelf);
    const card = [...document.querySelectorAll(".hz8-series-results .product-card, .designer-category .product-card")].find(vis);
    const h1 = document.querySelector("article.category-description h1");
    return {
      shell: document.documentElement.getAttribute("data-hz8-shell"), h1: h1 && h1.textContent.trim(), h1Size: h1 && getComputedStyle(h1).fontSize,
      lead: (document.querySelector(".hz8-cat-lead") || {}).textContent, count: (document.querySelector(".hz8-pcount") || {}).textContent,
      hero: R(".hz8-cat-hero"), h1Rect: R(h1), guide: R(".hz8-pguide"), guideCta: (document.querySelector(".hz8-pguide__cta") || {}).textContent,
      shelf: R(shelf), shelfStyle: cs && { radius: cs.borderRadius, bg: cs.backgroundColor, border: cs.borderTopColor, blur: cs.backdropFilter },
      tabs: [...document.querySelectorAll(".hz8-pfam__tab")].filter(vis).map(t => t.textContent.trim() + (t.getAttribute("aria-pressed") === "true" ? "*" : "")),
      shelfControls: [...(shelf ? shelf.querySelectorAll("button") : [])].filter(vis).filter(b => !b.classList.contains("hz8-pfam__tab")).map(b => b.textContent.trim().replace(/\s+/g, " ")),
      firstCard: R(card), cards: [...document.querySelectorAll(".hz8-series-results .product-card, .designer-category .product-card")].filter(vis).length,
      status: (document.querySelector(".hz8-pstatus") || {}).textContent ? document.querySelector(".hz8-pstatus").textContent.trim().slice(0, 120) : "",
      lower: R(".hz8-proutes") || R(".hz8-pseries"), lowerKind: document.querySelector(".hz8-proutes") ? "formats" : document.querySelector(".hz8-pseries") ? "series" : "none",
      lowerItems: [...document.querySelectorAll(".hz8-proutes__name, .hz8-pseries__name")].map(e => e.textContent.trim()),
      overflowX: document.documentElement.scrollWidth > innerWidth + 1, url: location.search.replace(/[?&]preview=[^&]+/, "")
    };
  });
  const tag = `${which}-${r}-${w}-${st}`;
  const shotClip = async (name, top, h) => { if (top == null) return; await p.screenshot({ path: `${OUT}/${tag}-${name}.png`, clip: { x: 0, y: Math.max(0, top), width: w, height: h }, fullPage: true }); };
  if (st === "normal" || st === "filtered") {
    await shotClip("hero", 0, g.hero ? g.hero.bottom + 20 : 600);
    if (g.shelf) await shotClip("shelf", g.shelf.top - 24, (g.firstCard ? g.firstCard.bottom : g.shelf.bottom + 300) - g.shelf.top + 48);
  } else if (g.shelf) await shotClip("shelf", g.shelf.top - 24, Math.min(900, (g.firstCard ? g.firstCard.bottom : g.shelf.bottom + 300) - g.shelf.top + 48));
  if (st === "normal" && g.lower) await shotClip("lower", g.lower.top - 30, g.lower.height + 60);
  rows.push({ which, r, w, st, ...g, errors: p.errors }); console.log(JSON.stringify(rows.at(-1)).slice(0, 700));
  await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/family-${which}-${ws.replace(/,/g, "_")}-${ss.replace(/,/g, "_")}.json`, JSON.stringify(rows, null, 1));
await b.close();
