// Shared facit/implementation config for the home-parity visual test.
// All selectors below were verified live (Playwright + getBoundingClientRect)
// against both pages on 2026-09-01 — see the session report for the raw
// inventory. Don't hand-guess new selectors here without the same check;
// past sessions (see STATUS.md) repeatedly got burned by reading source
// instead of the rendered DOM.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

export const FACIT_URL = "http://localhost:8765/index.html#/";
export const IMPL_URL = "https://hazeyse.nyehandel.se/";
export const VIEWPORT = { width: 390, height: 844 };
export const DEVICE_SCALE_FACTOR = 1;

export const GOLDEN_DIR = path.join(ROOT, "tests/golden");
export const RESULTS_DIR = path.join(ROOT, "tests/results");

// Separate, deliberately-distinct baseline: a locked snapshot of the
// IMPLEMENTATION itself (not facit), captured once a section's redesign is
// reviewed/approved (see STATUS.md entries per section). `tests/golden/`
// answers "how close is the implementation to facit" — many sections are
// EXPECTED to diverge from facit by explicit, documented product decisions
// (real data instead of facit's mock content, a deliberately different
// component, etc., see SECTIONS below), so a facit-parity failure there is
// not automatically a bug. `tests/golden-impl/` answers a different
// question entirely: "did the approved implementation change AT ALL since
// it was last locked" — tight tolerances, meant to always be green, and a
// failure here IS a real regression signal regardless of what facit-parity
// says. Never conflate the two: a facit-parity FAIL + implementation-
// regression PASS means "known, already-approved divergence from facit,
// nothing new broke" — not a silently-green false pass.
export const GOLDEN_IMPL_DIR = path.join(ROOT, "tests/golden-impl");

const QA_FREEZE_CSS = fs.readFileSync(path.join(__dirname, "qa-freeze.css"), "utf8");

// The facit prototype's own asset folder — the single real source for every
// "same locked image on both sides" fixture below. Read directly off disk
// and inlined as data: URLs at test time; never written into a repo file,
// never referenced by a localhost URL from a page context (that's exactly
// the https→localhost mixed-content trap this replaces — see session
// report). Test-only; nothing here ships to production.
const PROTO_ASSETS_DIR =
  "/Users/wahlberg/HZY/chatgpt-claude-handover/CLAUDE-HANDOFF-2026-08-17/prototyp/assets";

function assetDataUrl(filename) {
  const buf = fs.readFileSync(path.join(PROTO_ASSETS_DIR, filename));
  return "data:image/jpeg;base64," + buf.toString("base64");
}

// Locked image fixtures — same bytes injected on both facit and
// implementation during the parity test, so "Hero" / "Populära serier" /
// "Populära vägar" diff on layout, not on which random photo happened to be
// live-fetched or which fallback kicked in.
export const LOCKED_IMAGES = {
  hero: assetDataUrl("hero-westcoast-v4.jpg"),
  // Facit's own 4 mock series photos, cycled by card position — our real
  // implementation has 6 real series (a different set entirely, see
  // PROTOTYP-INVENTERING.md), so this is positional, not semantic, parity.
  series: [
    assetDataUrl("kat-magicsauce.jpg"),
    assetDataUrl("kat-nano11.jpg"),
    assetDataUrl("kat-thcx.jpg"),
    assetDataUrl("vape-blueberry.jpg"),
  ],
  // Facit's 4 format photos — both sides render these 4 cards in the exact
  // same order (Vapes&carts/Blommor/Hash/CBD, verified in
  // js/18b-homepage-v2.js nhPopularaVagarHtml), so this IS a true 1:1
  // positional match, not just cycling.
  routes: [
    assetDataUrl("category-vapes-v3.jpg"),
    assetDataUrl("category-buds-v3.jpg"),
    assetDataUrl("category-hash-v3.jpg"),
    assetDataUrl("category-cbd-v3.jpg"),
  ],
  // One fixed stand-in photo for the "Bästsäljare i lager" QA normalization
  // below — content doesn't need to be a real product, just identical and
  // stable on both sides.
  product: assetDataUrl("vape-blueberry.jpg"),
};

// Fixed text/number fixture for the "Bästsäljare i lager" card
// normalization — same literal values written into both facit's and the
// implementation's REAL card DOM (see normalizeFacitBestsellers /
// normalizeImplBestsellers below), so the only thing left to pixel-diff is
// each side's actual card layout/CSS, not incidental real-content variance.
export const QA_PRODUCT = {
  name: "QA Testprodukt",
  brand: "QA Testmärke",
  price: "199 kr",
  ratingGlyph: "★★★★☆",
  ratingSuffix: "4,0 · 20 omdömen",
  ratingPct: "80%", // 4.0/5 as the width facit's own .stars-inner-style bar would use
  maxCards: 4,
};

// Legacy, pre-redesign SEO text blocks that have no counterpart section in
// the facit prototype at all (see LEGACY-SEO-INNEHALL.md) — hidden ONLY
// inside this test's own injected CSS so they don't skew the full-page
// overflow/order checks. Never touches production rendering.
const LEGACY_SEO_HIDE_CSS = `
.store-startpage .template-components__text-editor,
.store-startpage .template-components__columns {
  display: none !important;
}
`;

/**
 * Explicit section map, in true top-to-bottom render order on both sides.
 * `order` doubles as the expected relative sequence used by the
 * section-order assertion.
 *
 * sizeTolerancePx: {w,h} absolute pixel tolerance before a section is
 * flagged as a size mismatch. Kept fairly tight (structural chrome) except
 * where a real, already-known, documented divergence exists — those are
 * left at their honest (still not "generous") tolerance rather than
 * inflated to force a pass; see the session report for which sections are
 * currently expected to fail and why.
 *
 * maxDiffRatio: fraction of compared pixels allowed to differ (0–1) before
 * a section is flagged FAIL.
 *
 * Every section is pixel-diffed. "Bästsäljare i lager" renders real, live
 * product data on the implementation side (see gotoImpl), but both sides
 * get their card count locked and their dynamic name/brand/price/rating/
 * image content overwritten with the same fixed QA_PRODUCT values before
 * capture (normalizeFacitBestsellers / normalizeImplBestsellers) — real
 * card DOM/CSS, fixed content — so the diff reflects each side's actual
 * card layout, not incidental live-content variance. A `pixelDiff:false`
 * escape hatch still exists in home-parity.spec.mjs for a future section
 * that turns out to have no meaningful shared fixture, but nothing uses it
 * right now.
 */
export const SECTIONS = [
  {
    key: "header",
    order: 1,
    label: "Header",
    facitSelector: "#mHeader",
    implSelector: "#store-header",
    sizeTolerancePx: { w: 20, h: 30 },
    maxDiffRatio: 0.12,
  },
  {
    key: "sokfalt",
    order: 2,
    label: "Sökfält",
    facitSelector: ".m-searchbar",
    implSelector: ".nh-mobile-searchbar",
    sizeTolerancePx: { w: 20, h: 20 },
    maxDiffRatio: 0.12,
  },
  {
    key: "mikrotrust",
    order: 3,
    label: "Övre mikrotrust",
    facitSelector: ".mt-mobile",
    implSelector: ".nh-mobile-trust",
    sizeTolerancePx: { w: 20, h: 20 },
    maxDiffRatio: 0.12,
  },
  {
    key: "hero",
    order: 4,
    label: "Hero",
    facitSelector: "#mVp .hero",
    implSelector: ".nh-hero-v2",
    sizeTolerancePx: { w: 40, h: 30 },
    // Higher tolerance: hero photo is a deliberate, documented divergence
    // (real configured nyehandel image vs. the prototype's own demo asset,
    // see STATUS.md "Ytterligare två hero-buggar" note) — not a bug.
    maxDiffRatio: 0.35,
  },
  {
    key: "populara-serier",
    order: 5,
    label: "Populära serier",
    facitSelector: "#m-populara-serier",
    implSelector: "#populara-serier",
    sizeTolerancePx: { w: 40, h: 40 },
    maxDiffRatio: 0.15,
  },
  {
    key: "populara-vagar",
    order: 6,
    label: "Populära vägar (inkl. framställningssegment)",
    facitSelector: "#m-populara-vagar",
    implSelector: "#populara-vagar",
    sizeTolerancePx: { w: 60, h: 60 },
    maxDiffRatio: 0.15,
  },
  {
    key: "bestsallare",
    order: 7,
    label: "Bästsäljare i lager",
    facitSelector: "#featuredProductsSection",
    implSelector: "#nh-featured",
    // Card count is now locked to QA_PRODUCT.maxCards (4) on both sides, and
    // every card's name/brand/price/rating/image is overwritten with the
    // same fixed QA_PRODUCT values (see normalizeFacitBestsellers /
    // normalizeImplBestsellers) — real DOM/CSS, fixed content. Still a
    // genuinely different card COMPONENT between the two sides (facit's
    // `.card` vs. our real `.product-card`), so tolerance stays looser than
    // the "shared component" sections above, but this is now a real,
    // meaningful pixel comparison, not a skip.
    sizeTolerancePx: { w: 20, h: 120 },
    maxDiffRatio: 0.3,
  },
  {
    key: "trustblock",
    order: 8,
    label: "Transparens/trustblock",
    facitSelector: ".trust-block",
    implSelector: ".nh-trustblock",
    sizeTolerancePx: { w: 20, h: 60 },
    maxDiffRatio: 0.15,
  },
  {
    key: "kunskap",
    order: 9,
    label: "Snabb koll: vad är vad?",
    facitSelector: "#kunskap",
    implSelector: ".nh-kunskap",
    sizeTolerancePx: { w: 20, h: 100 },
    maxDiffRatio: 0.2,
  },
  {
    key: "omdomen",
    order: 10,
    label: "Verifierade omdömen",
    // Two ".reviews-row" nodes exist in the facit DOM (a hidden 0×0 duplicate
    // alongside the real one) — verified live, see session report. ":visible"
    // is Playwright's own locator extension, picks the rendered one.
    facitSelector: ".reviews-row:visible",
    implSelector: ".nh-reviews",
    sizeTolerancePx: { w: 20, h: 80 },
    // Facit shows 3 fabricated quote cards; our implementation deliberately
    // shows rating+link only (no real review-quote source yet, see open
    // question #2 in STATUS.md "Samlade datafrågor till Vilmer") — real,
    // documented, currently-expected divergence.
    maxDiffRatio: 0.3,
  },
  {
    key: "nyhetsbrev",
    order: 11,
    label: "Nyhetsbrev",
    facitSelector: ".signup-block",
    implSelector: ".nh-signup",
    sizeTolerancePx: { w: 20, h: 60 },
    maxDiffRatio: 0.15,
  },
  {
    key: "footer",
    order: 12,
    label: "Truststrip och footer",
    facitSelector: ".hz-footer",
    implSelector: ".nh-footer",
    sizeTolerancePx: { w: 20, h: 80 },
    maxDiffRatio: 0.25,
  },
];

export async function acceptCookies(page) {
  for (const t of ["Godkänn alla", "Godkänn", "Acceptera alla"]) {
    try {
      await page.click(`button:has-text("${t}")`, { timeout: 800 });
      break;
    } catch (e) {
      /* not present, fine */
    }
  }
}

export async function injectFreeze(page, extraCss = "") {
  await page.addStyleTag({ content: QA_FREEZE_CSS + extraCss });
}

export async function waitFontsAndImages(page) {
  await page.evaluate(() => document.fonts ? document.fonts.ready : null).catch(() => {});
  await page
    .waitForFunction(() => Array.from(document.images).every((img) => img.complete), undefined, { timeout: 5000 })
    .catch(() => {});
}

/**
 * Blocks the live-data fetches that would otherwise make sections
 * nondeterministic between runs:
 *  - /sv/categories/** (excluding ?sort=in-stock) — real category photo +
 *    real product-count enrichment for "Populära serier"/"Populära vägar",
 *    see js/18b-homepage-v2.js nhEnhanceWithRealPhotos. Left ALLOWED: the
 *    "Bästsäljare i lager" listing fetch itself (?sort=in-stock) — that
 *    section's cards are needed (then normalized, see
 *    normalizeImplBestsellers), and js/18b hides the whole section on a
 *    failed fetch, which we don't want to trigger.
 *  - /sv/products/** — each bestseller card lazily fetches its OWN product
 *    page (IntersectionObserver, see js/07-ratings.js initCardRatings) to
 *    read a real aggregateRating and repaint ".rating" with a live
 *    "(N omdömen)" count, asynchronously, well after page load. Blocking it
 *    makes nhRatPaint() no-op (its early "if (!data) return" on a failed
 *    fetch), which is exactly what keeps normalizeImplBestsellers' fixed
 *    ".stars-inner" width from being silently overwritten later.
 *
 * This never touches production code — it only runs inside this test's own
 * Playwright page.route(), and only against the read-only public site,
 * same safe method as preview.mjs.
 */
export async function freezeLiveCategoryFetches(page) {
  await page.route("**/sv/categories/**", async (route) => {
    const url = route.request().url();
    if (url.includes("sort=in-stock")) {
      await route.continue();
      return;
    }
    await route.fulfill({ status: 200, contentType: "text/html", body: "" });
  });
  await page.route("**/sv/products/**", async (route) => {
    await route.fulfill({ status: 200, contentType: "text/html", body: "" });
  });
}

/**
 * Overwrites the facit's own "Bästsäljare i lager" mock cards
 * (#featuredProductsSection .hx-scroll .card) with the shared QA_PRODUCT
 * fixture — same name/brand/price/rating/image string on every card,
 * capped at QA_PRODUCT.maxCards. Facit's card DOM/CSS (.card/.card-img/
 * .card-body/...) is untouched structurally, only text/attribute content
 * changes.
 */
export async function normalizeFacitBestsellers(page) {
  await page.evaluate(
    ({ qa, image }) => {
      const cards = Array.from(document.querySelectorAll("#featuredProductsSection .hx-scroll .card"));
      cards.forEach((card, i) => {
        if (i >= qa.maxCards) {
          card.style.display = "none"; // test-only, extra card beyond the locked count
          return;
        }
        const img = card.querySelector(".card-img img");
        if (img) img.src = image;
        const name = card.querySelector(".card-name a");
        if (name) name.textContent = qa.name;
        const rate = card.querySelector(".card-rate");
        if (rate) rate.innerHTML = '<span class="stars">' + qa.ratingGlyph + "</span> " + qa.ratingSuffix;
        const price = card.querySelector(".card-price");
        if (price) price.textContent = qa.price;
      });
    },
    { qa: QA_PRODUCT, image: LOCKED_IMAGES.product }
  );
}

/**
 * Same normalization as above, for the implementation's REAL
 * #nhFeaturedRow .product-card cards (native nyehandel product-card
 * markup, cloned in by js/18b-homepage-v2.js nhInitBestsellers). Waits for
 * the real fetch to populate the row first — the section is genuinely
 * async/live, see gotoImpl — then overwrites the same fields with the same
 * QA_PRODUCT fixture, plus strips the two product-specific badges
 * ("Köp mer - Betala mindre" / "Finns i flera varianter") since their
 * presence is itself tied to whichever real products happen to be
 * bestsellers today, which would otherwise reintroduce nondeterminism.
 */
export async function normalizeImplBestsellers(page) {
  const found = await page
    .waitForSelector("#nhFeaturedRow .product-card", { timeout: 8000 })
    .then(() => true)
    .catch(() => false);
  if (!found) return; // real fetch failed/empty — section hides itself, nothing to normalize

  await page.evaluate(
    ({ qa, image }) => {
      const cards = Array.from(document.querySelectorAll("#nhFeaturedRow .product-card"));
      cards.forEach((card, i) => {
        if (i >= qa.maxCards) {
          const wrapper = card.closest("#nhFeaturedRow > div") || card;
          wrapper.style.display = "none"; // test-only, extra card beyond the locked count
          return;
        }
        const img = card.querySelector(".product-card__image img");
        if (img) img.src = image;
        card.querySelector(".buy-more-pay-less")?.remove();
        card.querySelector(".has-variants")?.remove();
        const starsInner = card.querySelector(".stars-inner");
        if (starsInner) starsInner.style.width = qa.ratingPct;
        const brand = card.querySelector(".brand");
        if (brand) brand.textContent = qa.brand;
        const name = card.querySelector(".name");
        if (name) name.textContent = qa.name;
        const price = card.querySelector(".price ins");
        if (price) price.textContent = qa.price;
      });
    },
    { qa: QA_PRODUCT, image: LOCKED_IMAGES.product }
  );
}

/**
 * Paints the shared LOCKED_IMAGES fixtures onto the facit's own hero —
 * facit already loads hero-westcoast-v4.jpg correctly via its own
 * same-origin server, so this exists only to guarantee byte-identical
 * source pixels with the implementation side (same data: URL both places),
 * not to fix anything broken on the facit side.
 */
export async function lockFacitHeroImage(page) {
  await page.evaluate((src) => {
    const hero = document.querySelector("#mVp .hero");
    if (hero) hero.style.backgroundImage = "url('" + src + "')";
  }, LOCKED_IMAGES.hero);
}

/**
 * Fixes the implementation's hero, "Populära serier" and "Populära vägar"
 * photos to the same LOCKED_IMAGES bytes as the facit — replaces the
 * production code's own attempt (a hardcoded, QA-only
 * http://localhost:8767 URL in js/18b-homepage-v2.js that Chrome's mixed-
 * content/Private Network Access policy blocks when the page is loaded
 * over https, see STATUS.md) with a direct post-load style override using
 * inlined data: URLs. No network request happens for these images at all,
 * so there's nothing for the browser to block. Purely test-side — doesn't
 * touch js/18b-homepage-v2.js, doesn't leave any localhost URL anywhere.
 *
 * Must run AFTER freezeLiveCategoryFetches has already blocked the real
 * category-photo fetch (see gotoImpl) — otherwise a late-resolving real
 * fetch could overwrite these images with live content after the fact.
 */
export async function lockImplImages(page) {
  await page.evaluate(
    (imgs) => {
      const hero = document.querySelector(".nh-hero-v2[data-hero-src]");
      if (hero) hero.style.backgroundImage = "url('" + imgs.hero + "')";

      const avatars = Array.from(document.querySelectorAll(".pser-avatar[data-photo-href]"));
      avatars.forEach((el, i) => {
        el.style.backgroundImage = "url('" + imgs.series[i % imgs.series.length] + "')";
        el.classList.add("has-photo");
      });

      // nhEnhanceWithRealPhotos' count-enrichment sets `[data-count-href]`
      // (the ".pser-item" card itself, not just its ".pser-n" count span)
      // `hidden = true` whenever the fetch returns zero products — which is
      // exactly what our blocked /sv/categories/** route always returns,
      // wiping out every series card. Since we're painting a locked photo
      // in regardless, force every card back to visible.
      document.querySelectorAll(".pser-item[data-count-href][hidden]").forEach((el) => {
        el.hidden = false;
      });

      const routeIcons = Array.from(document.querySelectorAll(".route .route-icon[data-photo-href]"));
      routeIcons.forEach((el, i) => {
        const parent = el.parentElement;
        if (!parent) return;
        parent.style.backgroundImage = "url('" + imgs.routes[i % imgs.routes.length] + "')";
        parent.classList.add("visual", "has-photo");
      });
    },
    LOCKED_IMAGES
  );
}

export async function gotoFacit(page) {
  await page.goto(FACIT_URL, { waitUntil: "networkidle", timeout: 20000 });
  await page.waitForTimeout(400);
  await injectFreeze(page);
  await waitFontsAndImages(page);
  await lockFacitHeroImage(page);
  await normalizeFacitBestsellers(page);
  await waitFontsAndImages(page); // re-check: normalization just swapped several <img src>
  await page.waitForTimeout(200); // let the hero's background-image data: URL decode+paint (not covered by img.complete)
}

/**
 * hazeyse.nyehandel.se already carries a stale, directly-pasted snapshot of
 * an OLDER hazey.css/js baked straight into Nyehandel's Kodläge Head field
 * (a large inline <style> + matching inline logic, independent of the
 * jsDelivr loader — confirmed live 2026-09-03/04, see STATUS.md "Viktig
 * sidoupptäckt"), plus the previous contractor's Oliverforss8 loader
 * script tag. Both run BEFORE this test's own addStyleTag/addScriptTag,
 * and the stale snapshot's inline logic already builds its own `.nh-footer`
 * — which makes js/08-footer.js's OWN initFooter() guard
 * (`if (document.querySelector(".nh-footer")) return;`) see a footer
 * already exists and skip entirely, leaving the WHOLE footer section
 * testing 100% stale content with zero relation to the current repo.
 * Stripped here, inside this throwaway test page only — nothing is written
 * back to Nyehandel, and this has no effect on any other section (their
 * init functions don't share that create-if-missing guard pattern).
 */
async function stripStaleInjectedContent(page) {
  await page.route("**/cdn.jsdelivr.net/gh/Oliverforss8/**", (route) => route.abort());
  await page.evaluate(() => {
    document.querySelectorAll(".nh-footer").forEach((el) => el.remove());
    const pf = document.querySelector(".page-footer");
    if (pf) pf.style.display = "";
    document.querySelectorAll("style").forEach((el) => {
      if (el.textContent.includes("nh-footer") || el.textContent.includes("--primary-color")) el.remove();
    });
  });
}

export async function gotoImpl(page) {
  await freezeLiveCategoryFetches(page);
  page.on("pageerror", (err) => console.log("[impl pageerror]", err.message));
  const css = fs.readFileSync(path.join(ROOT, "hazey.css"), "utf8");
  const js = fs.readFileSync(path.join(ROOT, "hazey.min.js"), "utf8");
  await page.route("**/cdn.jsdelivr.net/gh/Oliverforss8/**", (route) => route.abort());
  await page.goto(IMPL_URL, { waitUntil: "networkidle", timeout: 45000 });
  await page.waitForTimeout(1000);
  await acceptCookies(page);
  await stripStaleInjectedContent(page);
  await page.addStyleTag({ content: css });
  await page.addScriptTag({ content: js });
  await page.waitForTimeout(900);
  await injectFreeze(page, LEGACY_SEO_HIDE_CSS);
  await waitFontsAndImages(page);
  // Let the (now-blocked) enhancement fetches finish rejecting/resolving
  // and their .catch()/.then() handlers settle into their final DOM state
  // before anything gets measured or screenshotted.
  await page.waitForTimeout(500);
  await lockImplImages(page); // must run after freezeLiveCategoryFetches, see docstring
  await normalizeImplBestsellers(page); // waits for the real bestsellers fetch itself
  await waitFontsAndImages(page); // re-check: normalization just swapped several <img src>/backgrounds
  await page.waitForTimeout(200); // let the hero/series/route background-image data: URLs decode+paint
}

/**
 * Reads every selector's document-absolute top in one synchronous batch via
 * a single page.evaluate() call. Deliberately NOT built on repeated
 * locator.boundingBox()/`.screenshot()` calls on an already-scrolled page —
 * empirically (see session report), Chromium's getBoundingClientRect()
 * starts returning inconsistent, non-monotonic values for elements on this
 * facit page after many prior scroll-triggered screenshot captures on the
 * same page. Always call this on a freshly-navigated page, before any
 * per-section screenshot has been taken on it.
 */
export async function measureTops(page, selectorsByKey) {
  return page.evaluate((pairs) => {
    return pairs.map(([key, sel]) => {
      // ":visible" is a Playwright locator-engine extension, not valid in
      // native querySelectorAll — strip it and pick the rendered (non-zero
      // size) match ourselves, same intent, native-DOM-safe.
      const nativeSel = sel.replace(/:visible$/, "");
      const els = Array.from(document.querySelectorAll(nativeSel));
      const el = els.find((e) => e.offsetWidth > 0 || e.offsetHeight > 0) || els[0];
      if (!el) return [key, null];
      const r = el.getBoundingClientRect();
      return [key, r.top + window.scrollY];
    });
  }, selectorsByKey);
}

export async function hasHorizontalOverflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth - doc.clientWidth > 1; // 1px slack for subpixel rounding
  });
}

/**
 * Header-paket-geometri — den absoluta dokumentkontroll som saknades
 * innan 2026-09-01: tidigare jämförde parity bara beskurna, isolerade
 * komponentbilder (header/sökfält/mikrotrust var för sig), vilket kunde
 * ge tre individuella PASS samtidigt som ett osynligt tomrum mellan
 * sökfält och mikrotrust (ett verkligt, av Vilmer synligt fel — se
 * STATUS.md) aldrig fångades av något test. Detta mäter hela paketets
 * sammanhängande layout i DOKUMENTETS egna koordinater (inte beskurna
 * elementbilder) — header topp/botten, sökfält topp/botten, mikrotrust
 * topp/botten, hero topp/botten, "Populära serier"-topp, och alla
 * mellanrum dem emellan. `series`-nyckeln tillagd 2026-09-01 i samma
 * omgång som mobil hero implementerades (se tests/blueprints/
 * mobile-hero-port.md §I) — samma mönster som header-paketet.
 */
export const PACKAGE_GEOMETRY_SELECTORS = {
  facit: { header: "#mHeader", search: ".m-searchbar", trust: ".mt-mobile", hero: "#mVp .hero", series: "#m-populara-serier" },
  impl: { header: "#store-header", search: ".nh-mobile-searchbar", trust: ".nh-mobile-trust", hero: ".nh-hero-v2", series: "#populara-serier" },
};

// Breddpunkter geometrikontrollen körs vid — Vilmers explicita krav
// (390/430/600px), inte bara defaultbredden 390px som resten av
// sviten kör.
export const PACKAGE_GEOMETRY_WIDTHS = [390, 430, 600];

// Tolerans i px för gap-jämförelser (implementation mot facit). Ett
// "tomt mellanrum" (se buggen som föranledde detta test) var ~26px —
// tolerensen måste vara betydligt mindre än det för att fånga
// motsvarande regression, men inte så stram att den bryter på normal
// sub-pixel-avrundning mellan två olika DOM-implementationer.
export const PACKAGE_GEOMETRY_GAP_TOLERANCE_PX = 10;

export function packageGeometryGoldenPath() {
  return path.join(GOLDEN_DIR, "header-package-geometry.json");
}

/**
 * Mäter header/sökfält/mikrotrust/hero i EN sammanhängande, dokument-
 * absolut batch (inte beskurna elementbilder) på den redan navigerade
 * `page` (måste redan ha rätt viewport-bredd satt och facit/impl-CSS/JS
 * injicerat av anroparen). `side` väljer rätt selektor-uppsättning.
 */
export async function measurePackageGeometry(page, side) {
  const sel = PACKAGE_GEOMETRY_SELECTORS[side];
  return page.evaluate((sel) => {
    function box(s) {
      const el = document.querySelector(s);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: r.top + window.scrollY, bottom: r.bottom + window.scrollY };
    }
    const header = box(sel.header);
    const search = box(sel.search);
    const trust = box(sel.trust);
    const hero = box(sel.hero);
    const series = box(sel.series);
    return {
      header,
      search,
      trust,
      hero,
      series,
      gapSearchTrust: search && trust ? trust.top - search.bottom : null,
      gapTrustHero: trust && hero ? hero.top - trust.bottom : null,
      gapHeroSeries: hero && series ? series.top - hero.bottom : null,
      totalToHero: hero ? hero.top : null,
      totalToSeries: series ? series.top : null,
    };
  }, sel);
}

export function goldenPngPath(key) {
  return path.join(GOLDEN_DIR, `${key}.png`);
}
export function goldenMetaPath(key) {
  return path.join(GOLDEN_DIR, `${key}.json`);
}
export function implGoldenPngPath(key) {
  return path.join(GOLDEN_IMPL_DIR, `${key}.png`);
}
export function implGoldenMetaPath(key) {
  return path.join(GOLDEN_IMPL_DIR, `${key}.json`);
}
export function resultDir(key) {
  return path.join(RESULTS_DIR, key);
}
