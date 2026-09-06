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

// Ignore ONLY known, always-present third-party noise that is genuinely
// unrelated to whether our own CSS/JS/assets loaded correctly (Google's
// reCAPTCHA background beacon; ERR_BLOCKED_BY_CLIENT, which indicates a
// browser-level block unrelated to our code). Deliberately does NOT
// filter ERR_ADDRESS_UNREACHABLE (or any other network-failure class) --
// that would silently hide a real failure to load our own CSS/JS/assets
// behind "it's just network noise". Bounded retry for genuine transient
// host flakiness already happens once, at the page-navigation level in
// gotoTema6() (including an explicit check that hazey.min.js actually
// landed in the DOM) -- by the time a test body runs, gotoTema6() already
// succeeded or the whole test has failed outright. Any resource-load
// error that still shows up in the console AFTER that point is real and
// must fail the test, not be waved away as noise (never a false green).
function realErrors(errors) {
  return errors.filter((e) => !/recaptcha|ERR_BLOCKED_BY_CLIENT/i.test(e));
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

  test("dev-loadern laddar exakt EN hazey.css och ETT hazey.min.js (bekräftat färdigladdade)", async ({ page }) => {
    await gotoTema6(page);
    const info = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).filter((l) =>
        l.href.includes("hazey.css")
      );
      const scripts = Array.from(document.scripts).filter((s) => s.src.includes("hazey.min.js"));

      // Ett <link>/<script> KAN finnas i DOM:en även om nedladdningen
      // fortfarande väntar eller misslyckades -- kolla att stilarket
      // faktiskt är laddat OCH att vårt JS faktiskt kört klart, inte bara
      // att taggarna existerar.
      //
      // CSS: `link.sheet` är null tills stilarket verkligen är laddat och
      // associerat (spec-definierat beteende, verifierat live: en trasig
      // URL ger sheet=null/onerror, en riktig laddad länk ger ett riktigt
      // CSSStyleSheet-objekt). `.cssRules` går INTE att läsa här (raw.
      // githack.com skickar inga CORS-headers för JS-introspektion av
      // korsursprungsstilark, verifierat live -- SecurityError), så
      // `.sheet`/`.disabled` är den pålitliga, CORS-säkra kontrollen.
      const cssLink = links[0];
      const cssActuallyLoaded = !!cssLink && cssLink.sheet !== null && cssLink.sheet.disabled === false;

      // JS: ett konkret DOM-element som BARA vår kod skapar (inte
      // plattformens egna element) -- bevisar att hazey.min.js faktiskt
      // kördes klart förbi initHeaderV2(), inte bara att <script>-taggen
      // hann laddas.
      const jsActuallyRan = !!document.querySelector(".nh-burger") || !!document.querySelector(".nh-mobile-searchbar");

      return {
        cssCount: links.length,
        jsCount: scripts.length,
        cssHref: cssLink ? cssLink.href : null,
        jsSrc: scripts[0] ? scripts[0].src : null,
        devCssMarker: document.querySelectorAll("[data-nh-dev-css]").length,
        devJsMarker: document.querySelectorAll("[data-nh-dev-js]").length,
        cssActuallyLoaded,
        jsActuallyRan,
      };
    });
    expect(info.cssCount, "förväntade exakt en hazey.css").toBe(1);
    expect(info.jsCount, "förväntade exakt ett hazey.min.js").toBe(1);
    expect(info.devCssMarker, "förväntade exakt en data-nh-dev-css-markering").toBe(1);
    expect(info.devJsMarker, "förväntade exakt en data-nh-dev-js-markering").toBe(1);
    expect(info.cssHref, "hazey.css laddades inte från dev-grenen").toContain("/dev/hazey.css");
    expect(info.jsSrc, "hazey.min.js laddades inte från dev-grenen").toContain("/dev/hazey.min.js");
    expect(info.cssActuallyLoaded, "hazey.css-taggen finns i DOM men stilarket är inte faktiskt laddat (link.sheet är null/disabled)").toBe(true);
    expect(info.jsActuallyRan, "hazey.min.js-taggen finns i DOM men inget av vårt JS har faktiskt körts (varken .nh-burger eller .nh-mobile-searchbar skapades)").toBe(true);
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

  test("logga: länkar till /sv och bevarar aktuell preview-parameter", async ({ page }) => {
    // Rotorsakad och fixad 2026-09-06 (se STATUS.md): nyehandels egen,
    // hårdkodade href="/" tappade både /sv-prefixet och ?preview=-token:en
    // -- ett klick lämnade tema 6 helt. js/18a-header-v2.js sätter nu
    // href dynamiskt ur location.search, aldrig ett hårdkodat token.
    await gotoTema6(page);
    const href = await page.evaluate(
      () => document.querySelector("#store-header .main .left .brand a").getAttribute("href")
    );
    const previewToken = new URL(TEMA6_URL).searchParams.get("preview");
    expect(href, "loggans href").toBe("/sv?preview=" + previewToken);
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

  test("sökning (mobil 390px): fejk-sökraden öppnar riktig sök, text går att skriva, riktiga resultat visas", async ({ page }) => {
    // Rotorsakad och fixad 2026-09-06 (se STATUS.md) -- tidigare öppnade
    // .nh-mobile-searchbar aldrig något synligt på mobil, av två skäl:
    // (1) #search-container (nyehandels riktiga sök-UI) bor INUTI .center,
    // som vi gömde ovillkorligt -- fixat med ett CSS-undantag när
    // #search-container har klassen "active" (css/21-header-v2.css).
    // (2) nativeSearchTrigger.click() öppnade sökrutan korrekt, men SAMMA
    // klickhändelse bubblade vidare till nyehandels egen "klick utanför
    // stänger sökrutan"-lyssnare och stängde den igen inom loggat 0.1ms --
    // fixat genom att skjuta upp klicket till en ny event-loop-tick
    // (setTimeout 0, js/18a-header-v2.js). Testar den RIKTIGA
    // produktionsflödet (klick på vår egen knapp, ingen genväg rakt mot
    // #mobile-search-trigger) för att verkligen täcka regressionen.
    const { consoleErrors } = await gotoTema6(page);
    await page.click(".nh-mobile-searchbar button");
    await page.waitForTimeout(600);
    const searchContainer = await page.$("#search-container.active");
    expect(searchContainer, "sökrutan öppnades inte på mobil -- se rotorsak ovan").not.toBeNull();
    const input = await page.$("#search-container input");
    expect(input, "sökfältet inuti #search-container saknas efter öppning").not.toBeNull();
    await input.type("vape", { delay: 30 });
    await page.waitForTimeout(1200);
    const hasRealResults = await page.evaluate(() => {
      const sc = document.querySelector("#search-container");
      return Array.from(sc.querySelectorAll("a")).some((a) => a.href.includes("nyehandel.se"));
    });
    expect(hasRealResults, "inga riktiga sökresultat (nyehandel.se-länkar) visades på mobil").toBe(true);
    expect(realErrors(consoleErrors), "konsolfel under mobil sökning").toEqual([]);
  });

  test("sökning (desktop 1440px): riktiga sökfältet direkt synligt, oförändrat av mobilfixen", async ({ page }) => {
    // Desktop har inget kollapsat/dolt sökfält -- #search-container ligger
    // alltid synligt i .center där, och mobilfixen ovan är scopad till
    // @media (max-width:880px), så det här verifierar uttryckligen att
    // desktop-sökningen inte påverkades av dagens ändring.
    await page.setViewportSize({ width: 1440, height: 900 });
    await gotoTema6(page);
    const input = await page.$('input[placeholder*="ök" i], input[type="search"]');
    expect(input, "sökfältet saknas -- borde alltid finnas på desktop").not.toBeNull();
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
