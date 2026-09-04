// Read-only smoke test against Nyehandel's REAL, INACTIVE tema 6 preview
// instance -- verifies that the dev-loader (blocks/loader-dev.html,
// already pasted into tema 6's own JavaScript field) works correctly
// end-to-end on the actual platform, not just against our own
// injected-CSS/JS test harness (home-parity.spec.mjs). Nothing here writes
// to Nyehandel admin or changes tema 6/tema 3/tema 5 in any way -- it's a
// normal, read-only page load, same visitor's-eye-view as a human opening
// the preview link in a browser.
//
// The preview URL (including its bypass token) is DELIBERATELY not
// hardcoded anywhere in this file or in any shared/production code --
// pass it via the NH_TEMA6_URL env var. Every test in this file skips
// cleanly (not a failure) when the var is unset, so the default
// `npm run parity` run is completely unaffected for anyone without it.
//
// Run:
//   NH_TEMA6_URL="https://hazeyse.nyehandel.se/sv?preview=<token>" \
//     npx playwright test tests/tema6-smoke.spec.mjs
//   # or: npm run test:tema6  (same env var required)
import { test, expect } from "@playwright/test";

const TEMA6_URL = process.env.NH_TEMA6_URL;
const WIDTHS = [390, 430, 600, 1440];

async function acceptCookies(page) {
  for (const t of ["Godkänn alla", "Godkänn", "Acceptera alla"]) {
    try {
      await page.click(`button:has-text("${t}")`, { timeout: 800 });
      break;
    } catch (e) {
      /* not present, fine */
    }
  }
}

/**
 * Normal page load against the real tema 6 preview -- NO addStyleTag/
 * addScriptTag here. Tema 6's own JavaScript field already runs
 * blocks/loader-dev.html, which loads hazey.css/hazey.min.js itself;
 * injecting our own copy on top would create a duplicate and defeat the
 * entire point of testing the real, already-deployed loader.
 */
async function gotoTema6(page, path) {
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => pageErrors.push(err.message));

  const url = new URL(TEMA6_URL);
  if (path) url.pathname = path;

  // hazeyse.nyehandel.se has shown intermittent ERR_ADDRESS_UNREACHABLE
  // blips unrelated to this repo (confirmed: general internet
  // connectivity and other hosts stay reachable throughout) -- retry the
  // navigation itself a couple of times before giving up, rather than
  // failing the whole test on a transient host hiccup.
  // The page's own dev-loader (blocks/loader-dev.html, already pasted into
  // tema 6's JavaScript field) fetches hazey.css/hazey.min.js itself,
  // autonomously, once the HTML parses -- that fetch runs OUTSIDE this
  // goto call and isn't covered by retrying page.goto alone. If it hits
  // the same transient host flakiness, the page loads "successfully" but
  // our own CSS/JS silently never arrives. Detect that (via the loader's
  // own data-nh-dev-js marker) and do a full reload, not just a retry.
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await page.goto(url.toString(), { waitUntil: "networkidle", timeout: 45000 });
      lastErr = null;
    } catch (e) {
      lastErr = e;
      await page.waitForTimeout(2000 * attempt);
      continue;
    }
    await page.waitForTimeout(1500);
    const loaderOk = await page.evaluate(() => !!document.querySelector("[data-nh-dev-js]"));
    if (loaderOk) break;
    lastErr = new Error("dev-loaderns hazey.min.js hittades inte i DOM efter sidladdning (troligen en transient nätverksmiss mot raw.githack.com)");
    await page.waitForTimeout(1500 * attempt);
  }
  if (lastErr) throw lastErr;

  await page.waitForTimeout(1200);
  await acceptCookies(page);
  await page.waitForTimeout(400);
  return { consoleErrors, pageErrors };
}

// Ignore known third-party noise unrelated to our own code.
// ERR_ADDRESS_UNREACHABLE specifically (not a generic "Failed to load
// resource", which would also catch a real broken URL/404 in our own
// code) -- hazeyse.nyehandel.se has shown intermittent connectivity blips
// unrelated to this repo (independently confirmed via curl: other hosts
// stay reachable throughout). This only suppresses that exact transient
// DNS/connection-level failure class, nothing else.
function realErrors(errors) {
  return errors.filter((e) => !/recaptcha|ERR_BLOCKED_BY_CLIENT|ERR_ADDRESS_UNREACHABLE/i.test(e));
}

async function findProductHref(page) {
  return page.evaluate(() => {
    const a = document.querySelector('a[href*="/sv/products/"]');
    return a ? a.getAttribute("href") : null;
  });
}

test.describe("Tema 6 (inaktiv Nyehandel-preview) — dev-loader + smoke", () => {
  test.beforeEach(async () => {
    test.skip(
      !TEMA6_URL,
      'NH_TEMA6_URL inte satt -- hoppar över tema 6-smoketestet. Sätt miljövariabeln (se filens header för exakt kommando) och kör om.'
    );
  });

  test("dev-loadern laddar exakt EN hazey.css och ETT hazey.min.js", async ({ page }) => {
    await gotoTema6(page);
    const info = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).filter((l) =>
        l.href.includes("hazey.css")
      );
      const scripts = Array.from(document.scripts).filter((s) => s.src.includes("hazey.min.js"));
      return {
        cssCount: links.length,
        jsCount: scripts.length,
        cssHref: links[0] ? links[0].href : null,
        jsSrc: scripts[0] ? scripts[0].src : null,
        devCssMarker: document.querySelectorAll("[data-nh-dev-css]").length,
        devJsMarker: document.querySelectorAll("[data-nh-dev-js]").length,
      };
    });
    expect(info.cssCount, "förväntade exakt en hazey.css").toBe(1);
    expect(info.jsCount, "förväntade exakt ett hazey.min.js").toBe(1);
    expect(info.devCssMarker, "förväntade exakt en data-nh-dev-css-markering").toBe(1);
    expect(info.devJsMarker, "förväntade exakt en data-nh-dev-js-markering").toBe(1);
    expect(info.cssHref, "hazey.css laddades inte från dev-grenen").toContain("/dev/hazey.css");
    expect(info.jsSrc, "hazey.min.js laddades inte från dev-grenen").toContain("/dev/hazey.min.js");
  });

  for (const w of WIDTHS) {
    test(`${w}px: ingen horisontell overflow, inga sid-JS-fel (startsida)`, async ({ page }) => {
      const { pageErrors } = await gotoTema6(page);
      await page.setViewportSize({ width: w, height: 900 });
      await page.waitForTimeout(300);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth
      );
      expect(overflow, `horisontell overflow vid ${w}px`).toBeLessThanOrEqual(1);
      expect(pageErrors, "sid-JS-fel (uncaught exceptions)").toEqual([]);
    });
  }

  test("startsida: hero + footer renderas", async ({ page }) => {
    await gotoTema6(page);
    const info = await page.evaluate(() => ({
      hero: !!document.querySelector(".nh-hero-v2, .nh-qfind-hero"),
      footer: !!document.querySelector(".nh-footer"),
    }));
    expect(info.hero, "hero saknas").toBe(true);
    expect(info.footer, "footer saknas").toBe(true);
  });

  test("kategori (mobil 390px): produktkort renderas, ingen overflow", async ({ page }) => {
    const { consoleErrors } = await gotoTema6(page, "/sv/categories/alla-produkter");
    await page.setViewportSize({ width: 390, height: 900 });
    await page.waitForTimeout(500);
    const cardCount = await page.evaluate(() => document.querySelectorAll(".product-card").length);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(cardCount, "inga produktkort hittades på kategorisidan").toBeGreaterThan(0);
    expect(overflow, "horisontell overflow på kategorisidan (mobil)").toBeLessThanOrEqual(1);
    expect(realErrors(consoleErrors), "konsolfel på kategorisidan").toEqual([]);
  });

  test("produkt (mobil 390px): PDP laddar, ingen overflow, köpknapp finns", async ({ page }) => {
    await gotoTema6(page, "/sv/categories/alla-produkter");
    const href = await findProductHref(page);
    test.skip(!href, "ingen produktlänk hittades på kategorisidan");

    const { consoleErrors } = await gotoTema6(page, new URL(href, TEMA6_URL).pathname);
    await page.setViewportSize({ width: 390, height: 900 });
    await page.waitForTimeout(500);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    const hasBuyBtn = await page.evaluate(() => !!document.querySelector(".button.buy"));
    expect(overflow, "horisontell overflow på PDP (mobil)").toBeLessThanOrEqual(1);
    expect(hasBuyBtn, "köpknappen (.button.buy) saknas på PDP").toBe(true);
    expect(realErrors(consoleErrors), "konsolfel på PDP").toEqual([]);
  });

  test("sökning: dropdown visas vid inmatning", async ({ page }) => {
    // Desktop-bredd medvetet: på mobil (denna filens standardviewport,
    // 390px) ligger Nyehandels riktiga sökfält bakom en platthanterad
    // native modal/trigger (#mobile-search-trigger) som inte renderar
    // konsekvent i en headless testkontext -- verifierat live (elementets
    // egen bounding box är null även efter klick). Vår EGNA mobila
    // "fejk-sökrad" (.nh-mobile-searchbar, js/18a-header-v2.js) triggar
    // uttryckligen samma nativa modal och innehåller ingen egen input att
    // testa mot (se den filens kommentar: "ingen egen söklogik"). På
    // desktop är det riktiga sökfältet direkt synligt och testbart utan
    // någon modal-interaktion, så funktionen verifieras här i stället.
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoTema6(page);
    const input = await page.$('input[placeholder*="ök" i], input[type="search"]');
    test.skip(!input, "inget sökfält hittades");
    await input.click();
    await input.type("vape", { delay: 30 });
    await page.waitForTimeout(1200);
    const hasResults = await page.evaluate(() => !!document.querySelector('[class*="search"] a, [class*="Search"] a'));
    expect(hasResults, "inga sökresultat visades").toBe(true);
  });

  test("meny: mobil hamburgare öppnar menyn", async ({ page }) => {
    await gotoTema6(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(300);
    const burger = await page.$(".nh-burger");
    test.skip(!burger, "ingen hamburgare hittades");
    await burger.click({ force: true });
    await page.waitForTimeout(500);
    const menuOpen = await page.evaluate(() => {
      const m = document.querySelector(".nh-mobile-menu");
      return !!m && getComputedStyle(m).display !== "none";
    });
    expect(menuOpen, "mobilmenyn öppnades inte").toBe(true);
  });

  test("konto: kontolänk finns", async ({ page }) => {
    await gotoTema6(page);
    const acc = await page.$('a[href*="/account"], a[href*="/login"]');
    expect(acc, "ingen kontolänk hittades").not.toBeNull();
  });

  test("varukorg: lägg till produkt öppnar #cartAside", async ({ page }) => {
    await gotoTema6(page, "/sv/categories/alla-produkter");
    const href = await findProductHref(page);
    test.skip(!href, "ingen produktlänk hittades");

    await gotoTema6(page, new URL(href, TEMA6_URL).pathname);
    const btn = await page.$(".button.buy");
    test.skip(!btn, "ingen köpknapp hittades på PDP");
    await btn.click({ force: true });
    await page.waitForTimeout(1200);
    const cartOpened = await page.evaluate(() => {
      const aside = document.querySelector("#cartAside");
      return !!aside && getComputedStyle(aside).display !== "none";
    });
    expect(cartOpened, "varukorgen (#cartAside) öppnades inte efter köp").toBe(true);
  });
});
