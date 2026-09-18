(function () {
  "use strict";

  var series = [
    { name: "Magic Sauce", label: "Smak. Effekt. Balans.", href: "/sv/categories/magic-sauce", asset: "campaign-magic.webp" },
    { name: "THCaB", label: "Kraftfullt. Rent. Äkta.", href: "/sv/categories/thcb", asset: "campaign-thcab.jpg" },
    { name: "D10", label: "West Coast", href: "/sv/categories/alla-vapes", asset: "hero-venice-background.png" },
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

  function productCard(item, assetBase) {
    var src = item.image || assetBase + item.asset;
    return '<article class="hz8-product" data-hz8-category="' + item.cat + '"><a class="hz8-product__media" href="' + item.href + '"><img src="' + src + '" alt="' + item.name + '" loading="lazy"></a><h3>' + item.name + '</h3><small>' + item.meta + '</small><strong>' + item.price + '</strong><a class="hz8-add" href="' + item.href + '" aria-label="Visa ' + item.name + '">+</a></article>';
  }

  window.HZ8.register("homepage-catalog", function (context) {
    if (!context.home) return;
    var section = document.createElement("div");
    section.innerHTML = '<section class="hz8-home__section hz8-series"><div class="hz8-home__head"><h2 class="hz8-reveal">Handla efter populär serie</h2><a href="/sv/categories/alla-produkter">Visa alla →</a></div><div class="hz8-series__grid hz8-reveal-group">' + series.map(function (item) { return seriesCard(item, context.assetBase); }).join("") + '</div></section>'
      + '<section class="hz8-home__section hz8-products"><div class="hz8-home__head"><h2 class="hz8-reveal">Våra produkter</h2><a href="/sv/categories/alla-produkter">Visa alla →</a></div><div class="hz8-products__filters hz8-reveal"><button class="is-active" data-filter="all">Alla produkter</button><button data-filter="buds">Buds</button><button data-filter="hash">Hash</button><button data-filter="carts">Carts</button><button data-filter="vapes">Vapes</button></div><div class="hz8-products__grid hz8-reveal-group">' + products.map(function (item) { return productCard(item, context.assetBase); }).join("") + '</div></section>';
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
