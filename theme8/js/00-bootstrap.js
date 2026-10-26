(function () {
  "use strict";

  if (window.__HZ8_BOOTED__) return;
  window.__HZ8_BOOTED__ = true;

  var html = document.documentElement;
  var modules = [];
  var HOME_SELECTORS = [
    ".store-startpage",
    ".template-components__slideshow",
    ".slideshow"
  ];

  function first(selectors, root) {
    root = root || document;
    for (var i = 0; i < selectors.length; i += 1) {
      var node = root.querySelector(selectors[i]);
      if (node) return node;
    }
    return null;
  }

  /* ---- Visuell beredskap (TASK 01C) ----
     "Bundlen har bootat" betyder inte "sidan är visuellt klar". Loaderns
     boot-mask (html.hz8-boot) täcker tiden tills CSS/JS har kommit; från
     boot tar bundlens egen mask html.hz8-settling (01-base.css, samma
     varma yta) över och släpps först när det globala skalet och den
     aktiva sidmodulen är färdiga i den aktuella viewporten:
       1. ingen väntande HZ8.watch-omgång (debouncad DOM-synk),
       2. inga synliga väntemarkörer (PENDING) i viewporten,
       3. inga synliga, ännu inte laddade bilder i header/huvudinnehåll,
     två bildrutor i rad. Innehåll i en region märkt data-hz8-defer
     (reserverad, stabil geometri -- t.ex. seriehubbens hyllor) får bli
     klart efter visningen; regionens egen markör räknas fortfarande.
     Taket READY_CAP räknas från boot och gäller alltid (fail-open). Egen klass i stället för hz8-boot: loadern som
     redan ligger i admin släpper hz8-boot 100 ms efter att skriptet
     laddats, och dess 6 s-timeout ligger kvar för fallet att bundlen
     aldrig når hit. */
  var READY_CAP = 2500;
  var PENDING = "[aria-busy='true'], .is-loading, .is-pending, .hz8-series-pending";
  var ready = false;

  function inView(el, vh) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.top < vh && r.bottom > 0 && r.left < window.innerWidth && r.right > 0;
  }
  function deferred(el) {
    return !!(el.parentElement && el.parentElement.closest("[data-hz8-defer]"));
  }
  function visiblyPending() {
    var vh = window.innerHeight;
    var marks = document.querySelectorAll(PENDING);
    for (var i = 0; i < marks.length; i += 1) {
      if (!marks[i].closest("#sidebar, #cartAside, [hidden]") && !deferred(marks[i]) && inView(marks[i], vh)) return true;
    }
    var imgs = document.querySelectorAll("#store-header img, #store-main img");
    for (var j = 0; j < imgs.length; j += 1) {
      if (!imgs[j].complete && !deferred(imgs[j]) && inView(imgs[j], vh)) return true;
    }
    return false;
  }
  function reveal(reason) {
    if (ready) return;
    ready = true;
    html.classList.remove("hz8-settling", "hz8-boot");
    if (window.__HZ8_DIAGNOSTICS__) {
      window.__HZ8_DIAGNOSTICS__.readyMs = Math.round(window.performance.now());
      window.__HZ8_DIAGNOSTICS__.readyReason = reason === "settled" ? "settled" : "cap";
    }
  }
  function waitReady() {
    var quiet = 0;
    function check() {
      if (ready) return;
      var busy = (window.HZ8.watchBusy && window.HZ8.watchBusy()) || visiblyPending();
      quiet = busy ? 0 : quiet + 1;
      if (quiet >= 2) reveal("settled");
      else window.requestAnimationFrame(check);
    }
    window.requestAnimationFrame(check);
  }

  window.HZ8 = {
    first: first,
    register: function (name, mount) {
      modules.push({ name: name, mount: mount });
    }
  };

  /* Sidtyp härleds ur Nyehandels egen DOM/URL (aldrig en hårdkodad
     lista av sidor) och exponeras som html[data-hz8-page] så att CSS
     för varje sidtyp kan scopas utan att läcka till startsidan. */
  function detectPage(homepageRoot) {
    var path = location.pathname;
    if (homepageRoot && document.body.classList.contains("store-startpage")) return "home";
    if (document.body.classList.contains("checkout-page")) return "checkout";
    if (document.getElementById("product-page")) return "product";
    if (document.querySelector("section.main-container.category")) return "category";
    if (/\/search/.test(path)) return "search";
    if (/\/account/.test(path)) return "account";
    if (/\/page\/faq\/?$/.test(path)) return "faq";
    if (document.querySelector(".store-page")) return "page";
    if (homepageRoot) return "home";
    return "other";
  }

  function boot() {
    html.classList.add("hz8-settling");
    window.setTimeout(function () { reveal("cap"); }, READY_CAP);
    var homepageRoot = first(HOME_SELECTORS);
    var header = first(["header", ".header", "[class*='header']"]);
    var hero = first([".template-components__slideshow", ".slideshow"]);
    var products = document.querySelectorAll(
      "[data-product-id], .product-item, .product-card, [class*='product-card']"
    );
    var context = {
      homepageRoot: homepageRoot,
      nativeHeader: header,
      nativeHero: hero,
      assetBase: window.HZ8_ASSET_BASE || ""
    };
    context.page = detectPage(homepageRoot);

    window.__HZ8_DIAGNOSTICS__ = {
      version: "0.3.0-modular",
      homepageDetected: !!homepageRoot,
      page: context.page,
      nativeHeaderDetected: !!header,
      nativeHeroDetected: !!hero,
      nativeProductCount: products.length,
      bootMs: Math.round(window.performance.now()),
      assetBase: context.assetBase,
      modules: modules.map(function (module) { return module.name; })
    };

    /* Theme 8 körs numera på ALLA sidtyper, inte bara startsidan --
       headern (se 05-header.js) är global. Homepage-specifika moduler
       (hero/bestsellers/catalog/campaigns/social-footer) skyddar sig
       redan själva med "if (!context.home) return;", och context.home
       sätts bara av homepage-shell.js när en riktig startsida hittas --
       så de no-opar korrekt på kategori-/produktsidor utan ändring. */
    html.classList.add("hz8");
    html.setAttribute("data-hz8-page", context.page);
    if (homepageRoot) homepageRoot.setAttribute("data-hz8-state", "native-safe");

    modules.forEach(function (module) {
      try {
        module.mount(context);
      } catch (error) {
        if (window.console && console.error) console.error("Theme 8 module failed:", module.name, error);
      }
    });
    waitReady();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    window.setTimeout(boot, 0);
  }
})();
