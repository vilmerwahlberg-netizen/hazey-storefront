/* Kunskapslandning (.hz8-lp--guide), första sidan: THCA (theme8/blocks/
   thca.html). Bygger på landningsmallen (88b): canvas, puts, FAQ och
   sortimentsled kommer därifrån. Den här modulen fyller bara serievägarna
   (.hz8-guide__path[data-hz8-series]) med riktig butiksdata:

   - antal i lager: Nyehandels egen räknare (#products_count) på seriens
     kategori med I lager-filtret, samma filter som kategorisidan,
   - lägsta pris bland korten i lager (paketkort borträknade),
   - den första riktiga produktbilden (frilagd, ur Nyehandels bildtjänst),
     ställd på stenen i kortets scen.

   0 i lager -> "Tillfälligt slut i lager" och bilden tas ur seriens övriga
   produkter (vägen ligger kvar: serien finns, men ingenting påstås om lager).
   Hämtningen misslyckas -> kortet står kvar som i initial HTML (text och
   länk), utan siffror. Aldrig ett gissat värde. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  if (!HZ8) return;

  var STOCK_FILTER = "filters=smart-filter_in-stock"; // samma som 81-series-hub.js / 88b
  var PAGE_SIZE = 25;
  var MAX_PAGES = 4;
  function withParam(href, kv) { return href + (href.indexOf("?") === -1 ? "?" : "&") + kv; }

  function allCards(href, count) {
    var pages = Math.min(MAX_PAGES, Math.max(1, Math.ceil((count || 1) / PAGE_SIZE)));
    var jobs = [];
    for (var p = 1; p <= pages; p += 1) jobs.push(HZ8.fetchPage(p > 1 ? withParam(href, "page=" + p) : href, HZ8.categoryCards).catch(function () { return []; }));
    return Promise.all(jobs).then(function (lists) {
      return [].concat.apply([], lists).filter(function (c) { return !(HZ8.variantCards && HZ8.variantCards.isPackageCard(c.html)); });
    });
  }

  function cardBox(html) { var box = document.createElement("div"); box.innerHTML = html; return box; }
  function priceOf(box) {
    var p = box.querySelector(".price ins") || box.querySelector(".price");
    if (!p) return 0;
    var own = p.cloneNode(true);
    own.querySelectorAll("del").forEach(function (d) { d.remove(); });
    return parseInt(own.textContent.replace(/[^\d]/g, ""), 10) || 0;
  }
  function imageOf(box) {
    var img = box.querySelector(".product-card__image img");
    var src = img && img.getAttribute("src");
    return src && !/no-image/.test(src) ? src : "";
  }
  function kr(n) { return n.toLocaleString("sv-SE").replace(/\s/g, " ") + " kr"; }

  /* Nyehandels bildtjänst: base64-JSON {key, edits}. Samma original i
     större storlek och WebP; okänt format -> oförändrad URL (som 88b). */
  function largerSrc(src, w) {
    var m = /^(https:\/\/[^/]+\/)([A-Za-z0-9+/=]+)$/.exec(src || "");
    if (!m) return src;
    try {
      var o = JSON.parse(atob(m[2]));
      if (!o || !o.key) return src;
      o.edits = { resize: { width: w, height: w, fit: "inside" }, toFormat: "webp" };
      return m[1] + btoa(JSON.stringify(o));
    } catch (e) { return src; }
  }

  function placeImage(path, src, eager) {
    var scene = path.querySelector(".hz8-guide__path-scene");
    if (!scene || !src || scene.querySelector("img")) return;
    var img = document.createElement("img");
    img.className = "hz8-guide__pack";
    img.alt = "";
    img.decoding = "async";
    img.width = 600;
    img.height = 600;
    if (eager) img.setAttribute("fetchpriority", "high");
    else img.loading = "lazy";
    img.addEventListener("error", function () { if (img.src !== src) img.src = src; else img.remove(); });
    img.addEventListener("load", function () { scene.classList.add("has-pack"); });
    img.src = largerSrc(src, 600);
    scene.appendChild(img);
  }

  function fillPath(path, i) {
    if (path.getAttribute("data-hz8-filled")) return;
    path.setAttribute("data-hz8-filled", "1");
    var hub = path.getAttribute("data-hz8-series");
    var live = path.querySelector("[data-hz8-series-live]");
    if (!hub) return;
    var inStock = withParam(hub, STOCK_FILTER);
    HZ8.fetchPage(inStock, HZ8.categoryInfo).then(function (info) {
      /* En tom filtrerad lista saknar räknaren (och produktlistan): räkna
         då som 0 i lager, men bara om seriens ofiltrerade kategori har en
         riktig räknare med produkter. Annars okänt -> inget visas. */
      if (info && info.count !== null) return info;
      return HZ8.fetchPage(hub, HZ8.categoryInfo).then(function (all) {
        if (!all || !all.count) throw new Error("okänt lager");
        return { count: 0 };
      });
    }).then(function (info) {
      if (info.count > 0) {
        return allCards(inStock, info.count).then(function (cards) {
          var min = 0, src = "";
          cards.forEach(function (c) {
            var box = cardBox(c.html), pr = priceOf(box);
            if (pr && (!min || pr < min)) min = pr;
            if (!src) src = imageOf(box);
          });
          if (live) {
            live.textContent = info.count + (info.count === 1 ? " produkt" : " produkter") + " i lager" + (min ? " · från " + kr(min) : "");
            live.hidden = false;
          }
          path.classList.add("is-in-stock");
          placeImage(path, src, i === 0);
        });
      }
      /* Inget i lager: serien finns men säljs inte just nu. */
      if (live) { live.textContent = "Tillfälligt slut i lager"; live.hidden = false; }
      path.classList.add("is-out");
      return allCards(hub, PAGE_SIZE).then(function (cards) {
        for (var k = 0; k < cards.length; k += 1) { var s = imageOf(cardBox(cards[k].html)); if (s) return placeImage(path, s, i === 0); }
      });
    }).catch(function () { /* kortet står kvar som i initial HTML */ });
  }

  HZ8.register("landing-guide", function (context) {
    if (context.page !== "page") return;
    var root = document.querySelector(".store-page .hz8-lp--guide");
    if (!root) return;
    document.documentElement.classList.add("hz8-guide-page");
    Array.prototype.forEach.call(root.querySelectorAll(".hz8-guide__path[data-hz8-series]"), fillPath);
  });
})();
