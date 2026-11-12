// TASK 23: läs en Theme 8-lista (lokal build) -- kort, antal, paket, länkar. node probe-list.mjs <route> [vp] [shot]
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const [route = "/sv/categories/alla-vapes", vp = "1440", shot = ""] = process.argv.slice(2);
const W = +vp, M = W < 768;
const UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36";
const b = await chromium.launch();
const ctx = await ctxFor(M ? { newContext: o => b.newContext({ ...o, userAgent: UA }) } : b, W, M ? 852 : W === 768 ? 1024 : W >= 1920 ? 1080 : 1000, { which: process.env.WHICH || "after" });
const p = await open(ctx, route); await ready(p, 9000);
// visa alla ("Visa fler" tills slut) för en fullständig räkning
for (let i = 0; i < 20; i++) { const more = p.locator(".hz8-series-results__more:visible, .hz8-pmore__btn:visible").first(); if (!(await more.count())) break; await more.click().catch(() => {}); await p.waitForTimeout(500); }
const r = await p.evaluate(() => {
  const vis = e => !!e && e.getClientRects().length > 0 && getComputedStyle(e).display !== "none";
  const cards = [...document.querySelectorAll("#store-main .product-card")].filter(vis).filter(c => document.documentElement.classList.contains("hz8-sh-pilot") ? !!c.closest(".hz8-sh-shelf") : document.documentElement.classList.contains("hz8-series-hub") ? !!c.closest(".hz8-hub__rail") : !c.closest(".hz8-prail, .hz8-cat-popular, .hz8-pp-similar"));
  const t = s => { const e = document.querySelector(s); return e && vis(e) ? e.textContent.replace(/\s+/g, " ").trim() : null; };
  return { url: location.pathname + location.search, union: document.documentElement.classList.contains("hz8-series-union"),
    count: t(".hz8-sh-hero__count") || t(".hz8-hub__rail .hz8-prail__count") || t(".hz8-ptool__count") || t(".hz8-sf-count") || t(".hz8-series-status__text") || t("#products_count"), statusTxt: t(".hz8-series-status__text"),
    n: cards.length, sw: document.documentElement.scrollWidth, w: innerWidth,
    cards: cards.map(c => ({ v: c.getAttribute("data-hz8-variant"), st: c.getAttribute("data-hz8-instock"), brand: (c.querySelector(".brand") || {}).textContent?.trim(), name: (c.querySelector(".name") || {}).textContent?.trim(), href: (c.querySelector("a[href]") || {}).getAttribute?.("href")?.replace(/^https:\/\/[^/]+/, ""), img: ((c.querySelector(".product-card__image img") || {}).getAttribute?.("src") || "").slice(-40), stock: t.call ? (c.querySelector(".hz8-pstock") || {}).textContent : null, pill: !!c.querySelector(".hz8-card-pill"), sold: !!c.querySelector(".hz8-psold") })) };
});
if (shot) await p.screenshot({ path: path.join(DIR, "shots", shot + ".png"), fullPage: false });
console.log(JSON.stringify({ ...r, cards: undefined, errors: p.errors.filter(e => !/trustpilot|gtm|google|Failed to load/i.test(e)).slice(0, 4) }));
const pk = r.cards.filter(c => /[-–]\s*[35]\s*-?pack/i.test(c.name || "") || /blandbart|pilot-t19/.test(c.href || ""));
console.log("paketkort synliga:", pk.length, pk.map(c => c.name));
for (const c of r.cards) console.log([c.v || "-", c.st ?? "-", c.brand, "|", c.name, "|", c.href, "|", (c.stock || "").trim(), c.pill ? "köp" : "", c.sold ? "SLUT" : ""].join(" "));
fs.writeFileSync(path.join(DIR, "list-" + route.replace(/\W+/g, "_") + "-" + W + ".json"), JSON.stringify(r, null, 1));
await b.close();
