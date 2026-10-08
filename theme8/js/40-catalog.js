(function () {
  "use strict";

  var HZ8 = window.HZ8;

  var series = [
    { name: "Magic Sauce", label: "Smak. Effekt. Balans.", href: "/sv/categories/magic-sauce", asset: "campaign-magic.webp" },
    { name: "THCaB", label: "Kraftfullt. Rent. Äkta.", href: "/sv/categories/thcb", asset: "campaign-thcab.jpg" },
    { name: "D10", label: "West Coast", href: "/sv/categories/alla-vapes", asset: "hero-venice-background.webp" },
    { name: "Nano-11", label: "Nästa generation", href: "/sv/categories/alla-produkter", asset: "campaign-nano.jpg" },
    { name: "THCa", label: "Premium flower", href: "/sv/categories/thca", asset: "campaign-thca.jpg" }
  ];

  var products = [
    { cat:"carts", name:"Magic Sauce 3.0", meta:"Cart | 1ml", price:"325 kr", href:"/sv/categories/magic-sauce", image:"https://www.hazey.se/wp-content/uploads/2026/07/Magic-Sauce-Carts-thca-alternativ-1ml-Magic-Farmers-320x320.jpg" },
    { cat:"vapes", name:"THCbA 47%", meta:"Faraoh | 2ml", price:"895 kr", href:"/sv/products/vape-thc-b-35-faraoh-1ml", image:"https://www.hazey.se/wp-content/uploads/2025/01/THCA-B_vape_Faraoh_2ml_byt_ut_thca_alternativ_live_resin_terpenes-320x320.jpg" },
    { cat:"buds", name:"THCa Flower", meta:"Premium buds", price:"299 kr", href:"/sv/categories/thca", asset:"campaign-thca.jpg" },
    { cat:"hash", name:"THCaB Hash", meta:"2g", price:"349 kr", href:"/sv/categories/hasch", asset:"campaign-thcab.jpg" },
    { cat:"vapes", name:"CCELL M4", meta:"Vape batteri", price:"125 kr", href:"/sv/products/ccell-m4-vape-batteri-510", asset:"hero-products-layer.png" }
  ];

  function seriesCard(item, assetBase) {
    return '<a class="hz8-series-card" href="' + item.href + '"><img src="' + assetBase + item.asset + '" alt=""><b>' + item.name + '</b><span>' + item.label + '</span></a>';
  }

  /* Kampanjmodul efter "Våra produkter" (2026-10-08): fyra låga banners,
     egen klassfamilj (.hz8-series-campaigns) -- "Våra populära serier"
     ovan (.hz8-series) är en annan sektion och rörs inte.
     - "Utforska <serie>" = seriens katalogsida ur relationskartan
       (06-catalog-map.js: THCaB = gamla THC-A -> /thca, THCbA = gamla
       THC-B -> /thcb, se namnbytet i 05-header.js). Saknas serien i
       kartan visas inget kort.
     - "Läs om <serie>" visas bara när `info` är satt till en verifierad
       informationssida. Ingen finns ännu (kontrollerat 2026-10-08), så
       alla är null -- ingen gissad adress, inget "#".
     - Formatraden räknas fram ur relationskartan, inga produktantal.
     `catalog` = seriens namn i relationskartan. */
  var CAMPAIGNS = [
    { key: "thcab", name: "THCaB", catalog: "THCaB", info: null, asset: "series-thcab-v1.webp", w: 1600, h: 1067,
      alt: "THCaB från Faraoh: vape Sour Candy Strawberry och cart Super Lemon Haze i en mörk egyptisk miljö" },
    { key: "thcba", name: "THCbA", catalog: "THCbA", info: null, asset: "series-thcba-v1.webp", w: 1600, h: 1067,
      alt: "THCbA från Faraoh: vape Cranberry Frost Cream i månljus på blek sand" },
    { key: "magic", name: "Magic Sauce", catalog: "Magic Sauce", info: null, asset: "series-magic-sauce-v1.webp", w: 1600, h: 1067,
      alt: "Magic Sauce från Magic Farmers: refillvätska Yoda, cart Tinky Winky, vape Kowa Bunga och buds Gorilla Cookies i solnedgång" },
    { key: "nano", name: "Nano11", catalog: "Nano-11", info: null, asset: "series-nano11-v1.webp", w: 1600, h: 901,
      alt: "Nano11 från Tatra Hemp: pre-roll-förpackning och påse vid havet i blå skymning" }
  ];

  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';

  function formatList(series) {
    var labels = Object.keys(series.routes).map(function (k) { var f = HZ8.catalog.formatByKey(k); return f ? f.short || f.label : null; }).filter(Boolean);
    if (!labels.length) return "";
    var lower = labels.map(function (l) { return l.toLowerCase(); });
    return lower.length > 1 ? lower.slice(0, -1).join(", ") + " och " + lower[lower.length - 1] : lower[0];
  }

  /* Bilden visas två gånger: suddad som fyllnad över hela kortet och
     skarp i full höjd längs högerkanten, så att de höga förpackningarna
     aldrig beskärs i ett lågt kort. Samma fil, en nedladdning. */
  function campaignCard(item, assetBase, series) {
    var hub = series && (series.hub || HZ8.catalog.landingFor(series));
    if (!hub) return "";
    var src = assetBase + item.asset;
    var formats = formatList(series);
    var id = "hz8-sc-" + item.key;
    var actions = (item.info ? '<a class="hz8-series-campaign__cta hz8-series-campaign__cta--read" href="' + HZ8.esc(HZ8.link(item.info)) + '">Läs om ' + HZ8.esc(item.name) + ARROW + '</a>' : '') +
      '<a class="hz8-series-campaign__cta hz8-series-campaign__cta--explore" href="' + HZ8.esc(HZ8.link(hub)) + '">Utforska ' + HZ8.esc(item.name) + ARROW + '</a>';
    return '<article class="hz8-series-campaign hz8-series-campaign--' + item.key + '" aria-labelledby="' + id + '">' +
      '<div class="hz8-series-campaign__media">' +
      '<img class="hz8-series-campaign__backdrop" src="' + src + '" alt="" loading="lazy" decoding="async">' +
      '<img class="hz8-series-campaign__img" src="' + src + '" alt="' + HZ8.esc(item.alt) + '" loading="lazy" decoding="async" width="' + item.w + '" height="' + item.h + '">' +
      '</div>' +
      '<div class="hz8-series-campaign__body">' +
      '<div class="hz8-series-campaign__heading"><h3 class="hz8-series-campaign__title" id="' + id + '">' + HZ8.esc(item.name) + '</h3>' +
      (formats ? '<p class="hz8-series-campaign__text">' + HZ8.esc(formats.charAt(0).toUpperCase() + formats.slice(1)) + '</p>' : '') + '</div>' +
      '<div class="hz8-series-campaign__actions' + (item.info ? ' has-info' : '') + '">' + actions + '</div>' +
      '</div></article>';
  }

  function campaignSection(assetBase) {
    if (!HZ8.catalog) return "";
    var map = HZ8.catalog.build();
    var cards = CAMPAIGNS.map(function (item) {
      var series = map.series.filter(function (x) { return x.name === item.catalog; })[0];
      return campaignCard(item, assetBase, series);
    }).join("");
    if (!cards) return "";
    return '<section class="hz8-home__section hz8-series-campaigns" aria-labelledby="hz8-series-campaigns-title"><h2 class="hz8-visually-hidden" id="hz8-series-campaigns-title">Utvalda serier</h2><div class="hz8-series-campaigns__grid">' + cards + '</div></section>';
  }

  function productCard(item, assetBase) {
    var src = item.image || assetBase + item.asset;
    return '<article class="hz8-product" data-hz8-category="' + item.cat + '"><a class="hz8-product__media" href="' + item.href + '"><img src="' + src + '" alt="' + item.name + '" loading="lazy"></a><h3>' + item.name + '</h3><small>' + item.meta + '</small><div class="hz8-product__foot"><strong>' + item.price + '</strong><a class="hz8-add" href="' + item.href + '" aria-label="Visa ' + item.name + '">Visa</a></div><a class="hz8-card-link" href="' + item.href + '" tabindex="-1" aria-hidden="true"></a></article>';
  }

  window.HZ8.register("homepage-catalog", function (context) {
    if (!context.home) return;
    var section = document.createElement("div");
    section.innerHTML = '<section class="hz8-home__section hz8-series"><div class="hz8-home__head"><h2 class="hz8-reveal">Våra populära serier</h2><a href="/sv/categories/alla-produkter">Visa alla</a></div><div class="hz8-series__grid hz8-reveal-group">' + series.map(function (item) { return seriesCard(item, context.assetBase); }).join("") + '</div></section>'
      + '<section class="hz8-home__section hz8-products"><div class="hz8-home__head"><h2 class="hz8-reveal">Våra produkter</h2><a href="/sv/categories/alla-produkter">Visa alla</a></div><div class="hz8-products__filters hz8-reveal"><button class="is-active" data-filter="all">Alla produkter</button><button data-filter="buds">Buds</button><button data-filter="hash">Hash</button><button data-filter="carts">Carts</button><button data-filter="vapes">Vapes</button></div><div class="hz8-products__grid hz8-reveal-group">' + products.map(function (item) { return productCard(item, context.assetBase); }).join("") + '</div></section>'
      + campaignSection(context.assetBase)
      + '<section class="hz8-mobile-lifestyle"><h2>Mer än produkter<br>– en livsstil</h2><p>Kvalitet. Gemenskap. Frihet.<br>Välkommen till Hazey.</p><a href="/sv/categories/alla-produkter">Utforska våra serier</a></section>';
    while (section.firstChild) context.home.appendChild(section.firstChild);

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
