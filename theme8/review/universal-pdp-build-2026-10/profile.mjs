// TASK 10B -- kapabilitetsprofil per produkt (HZ8.pdpProfile) + det som
// faktiskt syns i köpstationen och under köpet. Ingenting klickas.
// node profile.mjs <before|after> [id,..] [width]
import { chromium, ctxFor, open, ready, DIR } from "./lib.mjs"; import fs from "node:fs";
import { PRODUCTS } from "./products.mjs";
const [which = "after", ids = Object.keys(PRODUCTS).join(","), w = "1440"] = process.argv.slice(2);
export const STATION = () => {
  const vis = e => { if (!e) return false; const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none" && !e.closest("[hidden]"); };
  const t = s => { const e = document.querySelector(s); return e && vis(e) ? e.textContent.replace(/\s+/g, " ").trim() : null; };
  const all = s => [...document.querySelectorAll(s)].filter(vis);
  return {
    profile: window.HZ8 && HZ8.pdpProfile && document.documentElement.classList.contains("hz8-pdp-pilot") ? HZ8.pdpProfile() : null,
    adapter: document.documentElement.classList.contains("hz8-pdp-pilot"),
    soldoutClass: document.documentElement.classList.contains("hz8-pp-soldout"), pdpOut: document.documentElement.classList.contains("hz8-pdp-out"),
    brand: t(".hz8-pp__brand"), h1: t(".product-detail__information h1"),
    stock: t(".hz8-pp__stock"), rating: t(".hz8-pp__meta"),
    legend: t(".hz8-pp__legend-text"), infoBtn: !!all(".hz8-pp__info").length,
    tiles: all(".hz8-pp__tile").map(b => b.textContent.replace(/\s+/g, " ").trim() + (b.getAttribute("aria-pressed") === "true" ? " [vald]" : "") + (b.getAttribute("aria-disabled") === "true" ? " [låst]" : "")),
    packs: all(".hz8-pp__pack").map(b => b.textContent.replace(/\s+/g, " ").trim()), packReview: t(".hz8-pkg"),
    price: t(".hz8-pp__price"), qty: t(".hz8-pp__qval"), cta: t(".hz8-pp__cta"), ctaState: (document.querySelector(".hz8-pp__cta") || {}).getAttribute?.("data-state"),
    bevaka: !!all(".monitor__button").length, legacyPackages: !!all(".hz8-packages, #product-pricing-table").length,
    fit: t(".hz8-pp__fit .hz8-prail__title, .hz8-pp__fit h2"),
    report: t(".hz8-acc__report"), unverifiedDocsHidden: document.querySelectorAll("[data-hz8-unverified-doc]").length,
    accordions: [...document.querySelectorAll(".hz8-acc .hz8-acc__h")].map(h => h.textContent.trim()),
    sections: [...document.querySelectorAll(".hz8-ppc > *, .hz8-ppc section[id], .hz8-ppc > div[id]")].filter(vis).map(e => e.id || e.className.toString().split(" ")[0]),
    similar: all("#liknande .product-card, .hz8-pp-similar .product-card").length,
    duplicates: all(".hz8-variant-group, .hz8-strain-chips, #hz8-buybar, .hz8-pdp-sticky, .hz8-pdp-nav, .hz8-pdp-spec, .hz8-pdp-rsum, #hz8-pdp-series, .hz8-pdp-brand").map(e => e.id || e.className.toString().split(" ")[0]),
    h1s: document.querySelectorAll("h1:not([role=heading])").length, overflowX: document.documentElement.scrollWidth > innerWidth + 1
  };
};
if (process.argv[1] && process.argv[1].endsWith("profile.mjs")) {
  const b = await chromium.launch(); const rows = [];
  for (const id of ids.split(",")) {
    const ctx = await ctxFor(b, +w, +w < 768 ? 852 : 900, { which });
    const p = await open(ctx, PRODUCTS[id].route); await ready(p, 5500);
    await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { scrollTo({ top: y, behavior: "instant" }); await new Promise(r => setTimeout(r, 90)); } scrollTo({ top: 0, behavior: "instant" }); });
    await p.waitForTimeout(2000);
    const r = { id, role: PRODUCTS[id].role, ...(await p.evaluate(STATION)), errors: p.errors };
    rows.push(r); console.log(JSON.stringify(r));
    await ctx.close();
  }
  fs.writeFileSync(`${DIR}/runs/profile-${which}-${w}.json`, JSON.stringify(rows, null, 1));
  await b.close();
}
