/* Kunskapssida "fältatlas" (.hz8-lp--atlas), första sidan: THCB (theme8/
   blocks/thcb.html). Bygger på landningsmallen (88b: canvas, FAQ, ankar-
   fokus). All text står i blockets initiala HTML; modulen gör bara två saker:

   - sätter html.hz8-atlas-page (CSS-omfånget i 88e-landing-atlas.css),
   - fyller lagerraden [data-hz8-atlas-stock="/sv/categories/..."] med
     Nyehandels egen räknare (#products_count), med och utan I lager-filtret
     (samma filter som kategorisidan och 88d).

   Okänt (hämtningen misslyckas eller kategorin saknar räknare) -> raden
   förblir dold. Aldrig ett gissat värde. Ingen köpknapp skapas. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  if (!HZ8) return;

  var STOCK_FILTER = "filters=smart-filter_in-stock"; // samma som 81/88b/88d
  function withParam(href, kv) { return href + (href.indexOf("?") === -1 ? "?" : "&") + kv; }
  function produkter(n) { return n + (n === 1 ? " produkt" : " produkter"); }

  function fillStock(line) {
    if (line.getAttribute("data-hz8-filled")) return;
    line.setAttribute("data-hz8-filled", "1");
    var hub = line.getAttribute("data-hz8-atlas-stock");
    if (!hub || !/^\/sv\/categories\/[a-z0-9-]+$/.test(hub)) return;
    Promise.all([
      HZ8.fetchPage(hub, HZ8.categoryInfo),
      HZ8.fetchPage(withParam(hub, STOCK_FILTER), HZ8.categoryInfo).catch(function () { return null; })
    ]).then(function (r) {
      var all = r[0] && r[0].count, inStock = r[1] && r[1].count;
      if (!all) return; // okänt eller tom kategori -> inget visas
      /* En tom filtrerad lista saknar räknaren: då 0 i lager (kategorin har
         produkter enligt den ofiltrerade räknaren). */
      if (inStock === null || inStock === undefined) inStock = 0;
      line.textContent = "I kategorin nu: " + produkter(all) + ", " + (inStock ? inStock + " i lager" : "ingen i lager") + ".";
      line.classList.toggle("is-out", !inStock);
      line.hidden = false;
    }).catch(function () { /* raden förblir dold */ });
  }

  HZ8.register("landing-atlas", function (context) {
    if (context.page !== "page") return;
    var root = document.querySelector(".store-page .hz8-lp--atlas");
    if (!root) return;
    document.documentElement.classList.add("hz8-atlas-page");
    Array.prototype.forEach.call(root.querySelectorAll("[data-hz8-atlas-stock]"), fillStock);
  });
})();
