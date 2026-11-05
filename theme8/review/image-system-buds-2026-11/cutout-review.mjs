// TASK 17C — frilagt original i den lokala granskningskopplingen (lib/review-images.mjs), före/efter.
// före = arbetskopians build med Nyehandels nuvarande bild, efter = samma build + lokal WebP med alfa.
// Per produkt: PDP 393/1440 (första vy + scenen), och produktens kort på startsidan, Bästsäljare,
// Alla Buds och som relaterad produkt på en syskon-PDP. Saknas kortet på en sida står det så.
// Kör: node cutout-review.mjs <slug> [syskon-slug]  ->  shots/cutout/<slug>/... + runs/cutout-review-<slug>.json
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, DIR } from "./lib/harness.mjs";
import { loadCutouts, reviewImages } from "./lib/review-images.mjs";
const slug = process.argv[2], sibling = process.argv[3];
const cut = loadCutouts([slug]); if (!Object.keys(cut).length) { console.log("ingen godkänd friläggning för", slug); process.exit(1); }
const OUT = path.join(DIR, "shots/cutout", slug); fs.mkdirSync(OUT, { recursive: true });
const PAGES = { pdp: "/sv/products/" + slug, home: "/", bestsellers: "/sv/page/vara-bastsaljare", buds: "/sv/categories/blommor-buds", ...(sibling ? { related: sibling.startsWith("/") ? sibling : "/sv/products/" + sibling } : {}) };
const ONLY = process.env.ONLY ? process.env.ONLY.split(",") : null;
const b = await chromium.launch(); const RF = path.join(DIR, `runs/cutout-review-${slug}.json`);
const R = ONLY && fs.existsSync(RF) ? JSON.parse(fs.readFileSync(RF, "utf8")) : { slug, cutouts: cut, shots: [] };
if (ONLY) R.shots = R.shots.filter(x => !ONLY.includes(x.key));
for (const state of ["fore", "efter"]) for (const [w, h] of [[393, 852], [1440, 900]]) for (const [key, route] of Object.entries(PAGES)) {
  if (ONLY && !ONLY.includes(key)) continue;
  const ctx = await ctxFor(b, w, h, { which: "after", review: state === "efter" ? reviewImages(cut) : null });
  const p = await open(ctx, route); await ready(p, 5000);
  for (let i = 0; i < 10; i++) { await p.mouse.wheel(0, 1200); await p.waitForTimeout(250); } await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(1200);
  const base = `${state}-${w}-${key}`; let info;
  if (key === "pdp") {
    await p.screenshot({ path: path.join(OUT, base + "-top.png") });
    info = await p.evaluate(() => { const m = document.querySelector(".product-detail__media"); return { media: m && m.getAttribute("data-hz8-media"), src: m && m.getAttribute("data-hz8-media-src") }; });
  } else {
    // Produktens kort (startsidans egna kort, Nyehandels kort och rälsar), med grannar som sammanhang.
    for (let i = 0; i < 4; i++) { const more = p.locator("button:has-text('Visa fler')").first(); if (await more.count() && await more.isVisible().catch(() => false)) { await more.click().catch(() => {}); await p.waitForTimeout(1500); } else break; }
    info = await p.evaluate(s => {
      // Rälskort (relaterat/serie-räls) i första hand, annars första synliga kort.
      const all = [...document.querySelectorAll(`a[href*='/products/${s}']`)].filter(x => { const c = x.closest(".product-card, .hz8-bs-card, .hz8-pcard, .hz8-spot"); return c && c.getBoundingClientRect().width > 60; });
      const a = all.find(x => x.closest(".hz8-prail")) || all[0];
      if (!a) return { found: false };
      const card = a.closest(".product-card, .hz8-bs-card, .hz8-pcard, .hz8-spot"); card.scrollIntoView({ block: "center", inline: "center" });
      // Horisontell räls: rulla spåret så att kortet ligger i viewporten (scrollIntoView rör inte alltid spåret).
      for (let el = card.parentElement; el; el = el.parentElement) { if (el.scrollWidth > el.clientWidth + 4 && /auto|scroll/.test(getComputedStyle(el).overflowX)) { el.style.scrollSnapType = "none"; el.scrollLeft += card.getBoundingClientRect().left - el.getBoundingClientRect().left - 24; break; } }
      card.setAttribute("data-hz8-shot", "");
      const box = card.querySelector("[data-hz8-media]");
      const r = card.getBoundingClientRect();
      return { found: true, rect: { x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height }, media: box && box.getAttribute("data-hz8-media"), where: card.className.toString().split(" ")[0], rail: a.closest(".hz8-prail") ? ((a.closest(".hz8-prail").querySelector(".hz8-prail__title") || {}).textContent || "").trim() : null };
    }, slug);
    // Kort utanför sidans bredd (horisontell räls): elementbild -- Playwright rullar spåret själv.
    if (info.found && info.rect.x + info.rect.w > w) { await p.waitForTimeout(800); await p.locator("[data-hz8-shot]").first().screenshot({ path: path.join(OUT, base + "-card.png") }).catch(e => console.log("skärmbild:", e.message.slice(0, 80))); }
    else if (info.found) { await p.waitForTimeout(800); const r = info.rect, pad = 24; await p.screenshot({ path: path.join(OUT, base + "-card.png"), fullPage: true, clip: { x: Math.max(0, r.x - r.w * 0.6 - pad), y: Math.max(0, r.y - pad), width: Math.min(w, r.w * 2.2 + pad * 2), height: r.h + pad * 2 } }).catch(() => {}); }
  }
  info.hits = ctx.reviewHits || 0; info.errors = p.errors.filter(e => !/trustpilot|gtm|status of 4/i.test(e)).length;
  info.overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  R.shots.push({ state, w, key, ...info }); console.log(base, JSON.stringify(info));
  await ctx.close();
}
fs.writeFileSync(RF, JSON.stringify(R, null, 1)); await b.close();
