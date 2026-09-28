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
    html.classList.remove("hz8-boot");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    window.setTimeout(boot, 0);
  }
})();
