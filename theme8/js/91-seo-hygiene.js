/* Teknisk SEO-hygien vid körning (TASK 17, 2026-11-12). Global, alla sidtyper.

   1. Yoast-variabler som följde med WooCommerce-importen ligger kvar
      bokstavligt i Nyehandels metatitlar/-beskrivningar (97 titlar och 27
      beskrivningar med "%%sep%%", inventerat 2026-11-12). De ersätts här
      exakt som WordPress renderade dem på hazey.se ("%%sep%%" -> "-",
      "%%sitename%%" -> "Hazey.se", "%%title%%" -> sidans H1), så att
      titeln Google redan känner igen bevaras. Detta är en skyddsåtgärd;
      den riktiga rättningen är admindata (se
      theme8/review/blog-seo-2026-11/data/META-FIXES.csv).
   2. Blogg/artikel utan kanonisk länk får en självrefererande canonical
      (utan query). Befintliga canonical-taggar ändras aldrig.
   Inget annat i <head> rörs. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  var TOKEN = /%%[a-z_]+%%/i;

  function h1Text() {
    var h = document.querySelector("#product-page h1, main h1, h1");
    return h ? h.textContent.replace(/\s+/g, " ").trim() : "";
  }
  function clean(value) {
    if (!value || !TOKEN.test(value)) return value;
    var title = h1Text();
    return value
      .replace(/%%sep%%/gi, "-")
      .replace(/%%sitename%%/gi, "Hazey.se")
      .replace(/%%title%%/gi, title)
      .replace(/%%[a-z_]+%%/gi, "")
      .replace(/\s+-\s+(-\s+)+/g, " - ")
      .replace(/\s{2,}/g, " ")
      .replace(/^[\s\-|]+|[\s\-|]+$/g, "");
  }
  HZ8.cleanMeta = clean;

  function fixHead() {
    if (TOKEN.test(document.title)) document.title = clean(document.title);
    var sel = 'meta[name="description"], meta[property="og:title"], meta[property="og:description"], meta[name="twitter:title"], meta[name="twitter:description"]';
    Array.prototype.forEach.call(document.querySelectorAll(sel), function (m) {
      var c = m.getAttribute("content");
      if (c && TOKEN.test(c)) m.setAttribute("content", clean(c));
    });
  }

  function ensureCanonical(page) {
    if (page !== "blog" && page !== "post") return;
    if (document.querySelector('link[rel="canonical"]')) return;
    var l = document.createElement("link");
    l.rel = "canonical";
    l.href = location.origin + location.pathname.replace(/\/+$/, "");
    l.setAttribute("data-hz8", "seo");
    document.head.appendChild(l);
  }

  /* 3. Produktsidor: adminbeskrivningarna (importerade från WooCommerce)
     innehåller egna H1:or ("NANO 11 Buds – ..."), så sidan får 2-3 H1.
     Produktnamnet (.product-title) är sidans H1; beskrivningens H1:or blir
     H2 med samma innehåll och klasser. Idempotent och körs om vid Vue-
     omrendering. Kategorisidornas beskrivnings-H1 är Theme 8:s avsiktliga
     sidrubrik och rörs inte. */
  var DESC = "#product-page :is(.short-description, article.product-description, .hz8-acc__text) h1";
  function demoteProductH1() {
    if (!document.querySelector("#product-page .product-title")) return;
    Array.prototype.forEach.call(document.querySelectorAll(DESC), function (h1) {
      try {
        var h2 = document.createElement("h2");
        h2.innerHTML = h1.innerHTML;
        if (h1.className) h2.className = h1.className;
        h2.setAttribute("data-hz8-was", "h1");
        h1.parentNode.replaceChild(h2, h1);
      } catch (e) { /* noden ägs av Vue mitt i en omrendering -- nästa watch-varv tar den */ }
    });
  }

  HZ8.register("seo-hygiene", function (context) {
    fixHead();
    ensureCanonical(context.page);
    if (context.page === "product") { demoteProductH1(); HZ8.watch(demoteProductH1); }
  });
})();
