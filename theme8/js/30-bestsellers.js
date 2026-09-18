(function () {
  "use strict";

  var products = [
    { name: "Magic Sauce 3.0", meta: "1ml", price: "325 kr", href: "/sv/categories/magic-sauce", image: "https://www.hazey.se/wp-content/uploads/2026/07/Magic-Sauce-Carts-thca-alternativ-1ml-Magic-Farmers-320x320.jpg" },
    { name: "THCbA 47% – Faraoh", meta: "2ml", price: "895 kr", href: "/sv/products/vape-thc-b-35-faraoh-1ml", image: "https://www.hazey.se/wp-content/uploads/2025/01/THCA-B_vape_Faraoh_2ml_byt_ut_thca_alternativ_live_resin_terpenes-320x320.jpg" },
    { name: "THCaB Hash", meta: "2g", price: "349 kr", href: "/sv/categories/hasch", asset: "campaign-thcab.jpg" },
    { name: "D10 Vape", meta: "1ml", price: "399 kr", href: "/sv/categories/alla-vapes", asset: "hero-products-layer.png" }
  ];

  function card(product, assetBase) {
    var src = product.image || assetBase + product.asset;
    return '<article class="hz8-mini-product">'
      + '<a class="hz8-mini-product__media" href="' + product.href + '"><img src="' + src + '" alt="' + product.name + '" loading="lazy"></a>'
      + '<h3>' + product.name + '</h3><small>' + product.meta + '</small><strong>' + product.price + '</strong>'
      + '<a class="hz8-add" href="' + product.href + '" aria-label="Visa ' + product.name + '">+</a>'
      + '</article>';
  }

  window.HZ8.register("homepage-bestsellers", function (context) {
    if (!context.home) return;
    var letters = "Bästsäljare".split("").map(function (letter, index) {
      return '<i style="--i:' + index + '">' + letter + '</i>';
    }).join("");
    var section = document.createElement("section");
    section.className = "hz8-home__section hz8-bestsellers";
    section.innerHTML = '<div class="hz8-home__head">'
      + '<h2 class="hz8-bestsellers__title" aria-label="Bästsäljare"><span aria-hidden="true">' + letters + '</span></h2>'
      + '<a href="/sv/page/vara-bastsaljare">Visa alla →</a></div>'
      + '<div class="hz8-bestsellers__grid">'
      + products.map(function (product) { return card(product, context.assetBase); }).join("")
      + '<article class="hz8-featured">'
      + '<a class="hz8-featured__art" href="/sv/categories/thca"><span class="hz8-featured__badge">BÄSTSÄLJARE</span><img src="' + context.assetBase + 'campaign-thca.jpg" alt="THCa Flower"></a>'
      + '<div class="hz8-featured__copy"><h3>THCa Flower – Sunset Gelato</h3><p>Premium indoor flower med fyllig arom, balanserad profil och hög kvalitet.</p><strong class="hz8-featured__price">299 kr</strong><span class="hz8-featured__stock">I lager</span><a class="hz8-featured__cta" href="/sv/categories/thca">Visa produkten</a></div>'
      + '</article></div>';
    context.home.appendChild(section);
    context.bestsellers = section;
  });
})();
