// TASK 20 — visuell slutkontroll vid 1920 × 1080 (faktisk skala, DPR 1, desktop-UA), lokal build i Theme 8-previewn.
// Skärmbilder av viewporten (inte helsida): första vyn, köpzonen med öppet 3-pack-kort. Mätvärden: överflöd,
// sticky-element, kortets mått, bildstorlekar, textbrytning. Ingen korg (köpflödet körs av ui-upsell.mjs VP=1920).
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch(); const ctx = await ctxFor(b, 1920, 1080, { which: "after" });
const p = await open(ctx, "/sv/products/thc-x-vape-hero-core-2ml?hz8-pkg-pilot=1"); await ready(p, 3000);
await p.waitForSelector(".hz8-up:not([hidden])", { timeout: 30000 });
await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(600);
await p.screenshot({ path: path.join(DIR, "shots", "efter-1920-forsta-vyn.png") });
const measure = () => p.evaluate(() => {
  const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height) }; };
  const lines = e => e ? Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight)) : null;
  const fixed = Array.from(document.querySelectorAll("body *")).filter(e => { const cs = getComputedStyle(e); return (cs.position === "fixed" || cs.position === "sticky") && cs.display !== "none" && cs.visibility !== "hidden" && e.getBoundingClientRect().height > 0 && +cs.opacity > 0; })
    .map(e => ({ el: (e.id ? "#" + e.id : "") + "." + String(e.className).split(" ").slice(0, 2).join("."), pos: getComputedStyle(e).position, ...R(e) })).slice(0, 12);
  const card = document.querySelector(".hz8-up");
  return { viewport: [innerWidth, innerHeight], scrollWidth: document.documentElement.scrollWidth, overflow: document.documentElement.scrollWidth > innerWidth,
    gallery: R(document.querySelector(".product-detail__media, .product-detail .media, #product-slides")), station: R(document.querySelector(".hz8-pp")), h1: R(document.querySelector(".product-detail__information h1")),
    mainCta: R(document.querySelector(".hz8-pp__cta")), card: R(card), cardBottomInFirstView: card ? Math.round(card.getBoundingClientRect().bottom) <= innerHeight : null,
    slot: R(document.querySelector(".hz8-up__slot")), slotImg: R(document.querySelector(".hz8-up__img img")), artImg: R(document.querySelector(".hz8-up__art img")),
    titleLines: lines(document.querySelector(".hz8-up__title")), ledeLines: lines(document.querySelector(".hz8-up__lede")), slotNameLines: Array.from(document.querySelectorAll(".hz8-up__name > span")).map(lines),
    ctaText: (document.querySelector(".hz8-up__cta") || {}).textContent, stickyOn: document.documentElement.classList.contains("hz8-pp-sticky-on"), fixed };
});
const R = { first: await measure() };
await p.locator(".hz8-up").scrollIntoViewIfNeeded(); await p.evaluate(() => window.scrollBy(0, -220)); await p.waitForTimeout(700);
await p.screenshot({ path: path.join(DIR, "shots", "efter-1920-kopzon-3pack.png") });
R.scrolled = await measure();
R.errors = p.errors.filter(e => !/trustpilot|gtm|google|Failed to load resource/i.test(e));
fs.writeFileSync(path.join(DIR, "runs", "check-1920.json"), JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1));
await b.close();
