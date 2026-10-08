(function () {
  "use strict";

  var HZ8 = window.HZ8;

  /* Startsidans seriepresentation (2026-10-08): fyra serier med två
     länkändamål -- primärt "Läs om" (informationssida) och sekundärt
     "Utforska" (seriens riktiga katalogsida ur relationskartan).
     - Katalogroute, format och produktantal: HZ8.catalog + seriens sida.
     - Informationssida: finns ingen än (inventerat 2026-10-08: /sv/posts
       är tom, /sv/page/<serie> leder till katalogen). Kandidatadressen i
       `info` provas; svarar den med en riktig sida visas "Läs om",
       annars bara "Utforska" (ingen falsk länk).
     - Bilder: produktkorrekta kompositer (originalprodukter oförändrade
       på en miljö från art direction), theme8/review/series-blocks-2026-10/.
     `catalog` = seriens namn i relationskartan. */
  var SERIES = [
    { key: "thcab", name: "THCaB", catalog: "THCaB", info: "/sv/posts/thcab", asset: "series-thcab-v1.webp",
      alt: "THCaB från Faraoh: vape Sour Candy Strawberry och cart Super Lemon Haze i en mörk egyptisk miljö" },
    { key: "thcba", name: "THCbA", catalog: "THCbA", info: "/sv/posts/thcba", asset: "series-thcba-v1.webp",
      alt: "THCbA från Faraoh: vape Cranberry Frost Cream i månljus på blek sand" },
    { key: "magic", name: "Magic Sauce", catalog: "Magic Sauce", info: "/sv/posts/magic-sauce", asset: "series-magic-sauce-v1.webp",
      alt: "Magic Sauce från Magic Farmers: refillvätska Yoda, cart Tinky Winky, vape Kowa Bunga och buds Gorilla Cookies i solnedgång" },
    { key: "nano", name: "Nano11", catalog: "Nano-11", info: "/sv/posts/nano11", asset: "series-nano11-v1.webp",
      alt: "Nano11 från Tatra Hemp: pre-roll-förpackning och påse vid havet i blå skymning" }
  ];

  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';

  /* En riktig informationssida: svar 200 med en sidrubrik (inte Nyehandels
     404-mall eller en vidarebefordran till katalogen). */
  var infoPage = {
    key: "info1",
    run: function (doc) {
      var h1 = doc.querySelector("h1");
      var isCatalog = !!doc.querySelector("section.main-container.category");
      return { ok: !!h1 && !isCatalog && !/hittades inte|404/i.test(h1.textContent) };
    }
  };
  function checkInfo(href) {
    return fetch(HZ8.link(href), { credentials: "same-origin", redirect: "manual" }).then(function (r) {
      if (r.status !== 200) return false;
      return HZ8.fetchPage(href, infoPage).then(function (v) { return v.ok; });
    }).catch(function () { return false; });
  }

  function formatList(series) {
    var labels = Object.keys(series.routes).map(function (k) { var f = HZ8.catalog.formatByKey(k); return f ? f.short || f.label : null; }).filter(Boolean);
    if (!labels.length) return "";
    var lower = labels.map(function (l) { return l.toLowerCase(); });
    return lower.length > 1 ? lower.slice(0, -1).join(", ") + " och " + lower[lower.length - 1] : lower[0];
  }

  function seriesBlock(item, assetBase, series) {
    var hub = series && (series.hub || HZ8.catalog.landingFor(series));
    if (!hub) return "";
    var formats = series ? formatList(series) : "";
    return '<article class="hz8-serie-block hz8-serie-block--' + item.key + '" aria-labelledby="hz8-serie-' + item.key + '">' +
      '<div class="hz8-serie-block__media"><img src="' + assetBase + item.asset + '" alt="' + HZ8.esc(item.alt) + '" loading="lazy" decoding="async" width="1600" height="1067"></div>' +
      '<div class="hz8-serie-block__body">' +
      '<p class="hz8-serie-block__meta" data-hz8-serie-count="' + HZ8.esc(HZ8.link(hub)) + '">Serie</p>' +
      '<h3 class="hz8-serie-block__title" id="hz8-serie-' + item.key + '">' + HZ8.esc(item.name) + '</h3>' +
      (formats ? '<p class="hz8-serie-block__text">Finns som ' + HZ8.esc(formats) + '.</p>' : '') +
      '<div class="hz8-serie-block__actions" data-hz8-info="' + HZ8.esc(item.info) + '" data-hz8-name="' + HZ8.esc(item.name) + '">' +
      '<a class="hz8-serie-block__explore" href="' + HZ8.esc(HZ8.link(hub)) + '">Utforska ' + HZ8.esc(item.name) + ARROW + '</a>' +
      '</div></div></article>';
  }

  var products = [
    { cat:"carts", name:"Magic Sauce 3.0", meta:"Cart | 1ml", price:"325 kr", href:"/sv/categories/magic-sauce", image:"https://www.hazey.se/wp-content/uploads/2026/07/Magic-Sauce-Carts-thca-alternativ-1ml-Magic-Farmers-320x320.jpg" },
    { cat:"vapes", name:"THCbA 47%", meta:"Faraoh | 2ml", price:"895 kr", href:"/sv/products/vape-thc-b-35-faraoh-1ml", image:"https://www.hazey.se/wp-content/uploads/2025/01/THCA-B_vape_Faraoh_2ml_byt_ut_thca_alternativ_live_resin_terpenes-320x320.jpg" },
    { cat:"buds", name:"THCa Flower", meta:"Premium buds", price:"299 kr", href:"/sv/categories/thca", asset:"campaign-thca.jpg" },
    { cat:"hash", name:"THCaB Hash", meta:"2g", price:"349 kr", href:"/sv/categories/hasch", asset:"campaign-thcab.jpg" },
    { cat:"vapes", name:"CCELL M4", meta:"Vape batteri", price:"125 kr", href:"/sv/products/ccell-m4-vape-batteri-510", asset:"hero-products-layer.png" }
  ];

  function productCard(item, assetBase) {
    var src = item.image || assetBase + item.asset;
    return '<article class="hz8-product" data-hz8-category="' + item.cat + '"><a class="hz8-product__media" href="' + item.href + '"><img src="' + src + '" alt="' + item.name + '" loading="lazy"></a><h3>' + item.name + '</h3><small>' + item.meta + '</small><div class="hz8-product__foot"><strong>' + item.price + '</strong><a class="hz8-add" href="' + item.href + '" aria-label="Visa ' + item.name + '">Visa</a></div><a class="hz8-card-link" href="' + item.href + '" tabindex="-1" aria-hidden="true"></a></article>';
  }

  window.HZ8.register("homepage-catalog", function (context) {
    if (!context.home) return;
    var section = document.createElement("div");
    var map = HZ8.catalog ? HZ8.catalog.build() : { series: [] };
    var blocks = SERIES.map(function (item) {
      var series = map.series.filter(function (x) { return x.name === item.catalog; })[0];
      return seriesBlock(item, context.assetBase, series);
    }).join("");
    section.innerHTML = (blocks ? '<section class="hz8-home__section hz8-series2" aria-labelledby="hz8-series2-title"><div class="hz8-home__head hz8-series2__head"><div><p class="hz8-bs-eyebrow">Upptäck</p><h2 id="hz8-series2-title">Våra serier</h2></div></div><div class="hz8-series2__grid">' + blocks + '</div></section>' : '')
      + '<section class="hz8-home__section hz8-products"><div class="hz8-home__head"><h2 class="hz8-reveal">Våra produkter</h2><a href="/sv/categories/alla-produkter">Visa alla</a></div><div class="hz8-products__filters hz8-reveal"><button class="is-active" data-filter="all">Alla produkter</button><button data-filter="buds">Buds</button><button data-filter="hash">Hash</button><button data-filter="carts">Carts</button><button data-filter="vapes">Vapes</button></div><div class="hz8-products__grid hz8-reveal-group">' + products.map(function (item) { return productCard(item, context.assetBase); }).join("") + '</div></section>'
      + '<section class="hz8-mobile-lifestyle"><h2>Mer än produkter<br>– en livsstil</h2><p>Kvalitet. Gemenskap. Frihet.<br>Välkommen till Hazey.</p><a href="/sv/categories/alla-produkter">Utforska våra serier</a></section>';
    while (section.firstChild) context.home.appendChild(section.firstChild);

    /* Riktiga produktantal per serie (seriens egen sida) och primär CTA
       när en informationssida finns. */
    context.home.querySelectorAll("[data-hz8-serie-count]").forEach(function (el) {
      HZ8.fetchPage(el.getAttribute("data-hz8-serie-count"), HZ8.categoryInfo).then(function (info) {
        if (info.count) el.textContent = "Serie · " + info.count + (info.count === 1 ? " produkt" : " produkter");
      }).catch(function () {});
    });
    context.home.querySelectorAll("[data-hz8-info]").forEach(function (box) {
      var href = box.getAttribute("data-hz8-info");
      checkInfo(href).then(function (ok) {
        if (!ok) return;
        var a = document.createElement("a");
        a.className = "hz8-serie-block__read";
        a.href = HZ8.link(href);
        a.innerHTML = "Läs om " + HZ8.esc(box.getAttribute("data-hz8-name")) + ARROW;
        box.insertBefore(a, box.firstChild);
        box.classList.add("has-info");
      });
    });

    var filters = context.home.querySelectorAll("[data-filter]");
    for (var i = 0; i < filters.length; i += 1) {
      filters[i].addEventListener("click", function () {
        var filter = this.getAttribute("data-filter");
        for (var j = 0; j < filters.length; j += 1) filters[j].classList.toggle("is-active", filters[j] === this);
        var cards = context.home.querySelectorAll("[data-hz8-category]");
        for (var k = 0; k < cards.length; k += 1) cards[k].classList.toggle("is-hidden", filter !== "all" && cards[k].getAttribute("data-hz8-category") !== filter);
      });
    }
  });
})();
