/* Landningsmall (.hz8-lp) för informations- och shoppinglandningar som
   ligger som Content -> Sidor i Nyehandel, t.ex. /sv/page/thcx (koncept B,
   "produktnära magasin"). Blocket i admin (theme8/blocks/thcx.html) äger
   ALL text, alla rubriker och länkar -- de finns i initial HTML. Modulen
   lägger bara till det som kräver riktig data:

   1. Produktraden: [data-hz8-lp-products] deklarerar sina källor
      (data-hz8-sources, mellanslagsseparerade kategori-routes) och tak
      (data-hz8-limit). Korten är Nyehandels egna .product-card via
      HZ8.productRail; källorna slås ihop, samma produkt visas en gång och
      varianter blir egna kort (samma regel som seriehubbarna).
      data-hz8-instock="only": bara det som finns i lager (Nyehandels
      I lager-filter + köpbara varianter). Inga produkter -> blockets egen
      reservlänk står kvar. Aldrig fritextsökning som källa.
   2. Uppslagets uppställning: [data-hz8-lp-lineup] visar samma produkters
      EGNA frilagda produktbilder ur Nyehandel (en per produkt, i lager,
      högst data-hz8-limit), som länkar till produkten. Inga tema-assets,
      inga genererade förpackningar. Ingen data -> figuren förblir dold och
      texten tar hela bredden (88b-landing.css).

   Samma mall är tänkt för nästa landning (/engangsvape/): nytt adminblock
   med andra källor och annan text, ingen ny kod. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  if (!HZ8) return;

  function productKey(html) {
    var m = html.match(/href="([^"]*\/products\/[^"?#]+)/);
    return m ? HZ8.path(m[1]).replace(/\/\d+$/, "") : html;
  }

  var STOCK_FILTER = "filters=smart-filter_in-stock"; // Nyehandels I lager-filter (samma som 81-series-hub.js)
  function withParam(href, kv) { return href + (href.indexOf("?") === -1 ? "?" : "&") + kv; }

  function mergedCards(sources, inStockOnly) {
    return Promise.all(sources.map(function (src) {
      return HZ8.fetchPage(inStockOnly ? withParam(src, STOCK_FILTER) : src, HZ8.categoryCards).catch(function () { return []; });
    })).then(function (lists) {
      var seen = {};
      return [].concat.apply([], lists).filter(function (c) {
        var k = productKey(c.html);
        if (seen[k]) return false;
        seen[k] = true;
        return true;
      });
    });
  }

  /* data-hz8-strain-only: variantkortets titel visar bara strainnamnet.
     Katalogens variantnamn bär "– Indica"/"– Sativa"/"– Hybrid", vilket
     Hazeys riktlinje räknar som effektpåstående (Agent A, F5b). Bara
     visningen på landningen ändras -- Nyehandels data är orörd. */
  var STRAIN_SUFFIX = /\s*[-–—·]\s*(indica|sativa|hybrid)\b.*$/i;
  function strainOnly(html) {
    var box = document.createElement("div");
    box.innerHTML = html;
    var name = box.querySelector(".product-card[data-hz8-variant] .name");
    if (!name) return html;
    name.textContent = name.textContent.replace(STRAIN_SUFFIX, "");
    box.querySelectorAll(".product-card__image img").forEach(function (img) {
      ["alt", "title"].forEach(function (a) { var v = img.getAttribute(a); if (v) img.setAttribute(a, v.replace(STRAIN_SUFFIX, "")); });
    });
    return box.innerHTML;
  }

  function expandVariants(cards, inStockOnly) {
    if (!HZ8.variantCards) return Promise.resolve(cards);
    return HZ8.variantCards.expand(cards, { inStockOnly: inStockOnly }).then(function (x) {
      return HZ8.variantCards.settle(x, "");
    }, function () { return cards; });
  }

  /* Produktnivå (före variantuppdelning): delas av raden och uppställningen. */
  function sourceOf(root) {
    var slot = root.querySelector("[data-hz8-lp-products]");
    if (!slot) return null;
    var sources = (slot.getAttribute("data-hz8-sources") || "").split(/\s+/).filter(Boolean);
    if (!sources.length) return null;
    var inStockOnly = slot.getAttribute("data-hz8-instock") === "only";
    return { slot: slot, inStockOnly: inStockOnly, cards: mergedCards(sources, inStockOnly).then(function (cards) {
      return HZ8.variantCards ? cards.filter(function (c) { return !HZ8.variantCards.isPackageCard(c.html); }) : cards;
    }) };
  }

  function initProducts(root, src) {
    var slot = src.slot;
    if (slot.getAttribute("data-hz8-filled")) return;
    slot.setAttribute("data-hz8-filled", "1");
    var inStockOnly = src.inStockOnly;
    var strain = slot.hasAttribute("data-hz8-strain-only");
    var section = slot.closest("section");
    var heading = section && section.querySelector("h2[id]");
    var limit = parseInt(slot.getAttribute("data-hz8-limit"), 10) || 12;
    src.cards.then(function (cards) {
      return expandVariants(cards, inStockOnly);
    }).then(function (cards) {
      if (!cards.length) return; // reservlänken i blocket står kvar
      if (strain) cards = cards.map(function (c) { var o = {}; Object.keys(c).forEach(function (k) { o[k] = c[k]; }); o.html = strainOnly(c.html); return o; });
      var rail = HZ8.productRail({
        id: (section && section.id ? section.id : "hz8-lp") + "-rail",
        className: "hz8-prail--compact hz8-lp__rail",
        title: heading ? heading.textContent.trim() : "Produkter",
        hideCount: true,
        cards: cards,
        limit: limit,
        eager: true
      });
      /* Sektionens synliga H2 kommer från adminblocket; rälsens egen
         rubrik tas bort så att sidan inte får två rubriker för samma
         sak. Rälsens bläddringsknappar ligger kvar. */
      var own = rail.querySelector(".hz8-prail__title");
      if (own && heading) { own.remove(); rail.setAttribute("aria-labelledby", heading.id); }
      slot.innerHTML = "";
      slot.appendChild(rail);
    });
  }

  /* Uppställning av riktiga produktbilder (en per produkt). Bilden är
     produktkortets egen bild ur Nyehandel; alt = produktens namn. */
  function initLineup(root, src) {
    var fig = root.querySelector("[data-hz8-lp-lineup]");
    if (!fig || fig.querySelector(".hz8-lp__stage")) return;
    var limit = parseInt(fig.getAttribute("data-hz8-limit"), 10) || 4;
    if (!src) return;
    src.cards.then(function (cards) {
      var items = [];
      cards.forEach(function (c) {
        if (items.length >= limit) return;
        var box = document.createElement("div");
        box.innerHTML = c.html;
        var img = box.querySelector(".product-card__image img");
        var a = box.querySelector('a[href*="/products/"]');
        var name = box.querySelector(".name");
        if (!img || !a || !img.getAttribute("src") || /no-image/.test(img.getAttribute("src"))) return;
        items.push({ href: a.getAttribute("href"), src: img.getAttribute("src"), name: (name ? name.textContent : img.getAttribute("alt") || "").replace(/\s+/g, " ").trim() });
      });
      if (items.length < 2) return; // en ensam bild är ingen uppställning
      var stage = document.createElement("div");
      stage.className = "hz8-lp__stage";
      stage.setAttribute("data-count", String(items.length));
      stage.innerHTML = items.map(function (it, i) {
        return '<a class="hz8-lp__piece" style="--i:' + i + '" href="' + HZ8.esc(HZ8.link(it.href)) + '">' +
          '<img src="' + HZ8.esc(it.src) + '" alt="' + HZ8.esc(it.name) + '" loading="lazy" decoding="async" width="400" height="400"></a>';
      }).join("");
      fig.insertBefore(stage, fig.firstChild);
      fig.classList.add("has-img");
    });
  }

  /* Ankarlänkarna: rubriken under den fasta headern får fokus, så
     tangentbords- och skärmläsaranvändare hamnar i rätt kapitel. */
  function initNav(root) {
    var nav = root.querySelector(".hz8-lp__nav");
    if (!nav || nav.getAttribute("data-hz8-bound")) return;
    nav.setAttribute("data-hz8-bound", "1");
    nav.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var target = document.getElementById(a.getAttribute("href").slice(1));
      if (!target) return;
      e.preventDefault();
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      var h = target.querySelector("h2");
      if (h) { if (!h.hasAttribute("tabindex")) h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
      if (history.replaceState) history.replaceState(null, "", "#" + target.id);
    });
  }

  HZ8.isLandingPage = function () { return !!document.querySelector(".store-page .hz8-lp"); };

  HZ8.register("landing", function (context) {
    if (context.page !== "page") return;
    var root = document.querySelector(".store-page .hz8-lp");
    if (!root) return;
    document.documentElement.classList.add("hz8-lp-page");
    initNav(root);
    var src = sourceOf(root);
    if (src) initProducts(root, src);
    initLineup(root, src);
  });
})();
