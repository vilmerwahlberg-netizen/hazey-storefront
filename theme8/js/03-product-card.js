/* Gemensamt produktkort: en kompakt, tillgänglig kontroll längst ned på
   varje native .product-card utanför startsidan -- "+ Lägg till" för
   enkla produkter (Nyehandels egen varukorgsaction), "Välj variant" för
   variantprodukter. Idempotent; körs om vid Vue-re-render. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;

  function enhance(card) {
    if (card.querySelector(".hz8-card-pill")) return;
    var wrapper = card.querySelector(".details-wrapper");
    var link = card.querySelector("a.product-card__image[href], .details a[href]");
    if (!wrapper || !link) return;
    var nameEl = card.querySelector(".name");
    var name = nameEl ? nameEl.textContent.trim() : "";
    var href = link.getAttribute("href");
    /* Nyehandel märker själv kort med flera varianter ("Finns i flera
       varianter"). Övriga kort får direktköp via plattformens egen
       varukorgsaction; går det inte (slut, fel) leder knappen till
       produktsidan i stället -- aldrig ett låtsat resultat. Läggs SIST
       i kortet (flyttar aldrig Vue-ägda noder). */
    var variants = !!card.querySelector(".has-variants");
    var pill;
    if (variants) {
      pill = document.createElement("a");
      pill.href = href;
      pill.innerHTML = '<span class="hz8-pill-long">Välj variant</span><span class="hz8-pill-short" aria-hidden="true">Välj</span>';
      pill.setAttribute("aria-label", "Välj variant: " + name);
    } else {
      pill = document.createElement("button");
      pill.type = "button";
      var ADD = '<span class="hz8-pill-long">+ Lägg till</span><span class="hz8-pill-short" aria-hidden="true">Lägg till</span>';
      pill.innerHTML = ADD;
      pill.setAttribute("aria-label", "Lägg i varukorgen: " + name);
      pill.addEventListener("click", function () {
        if (pill.getAttribute("aria-busy") === "true") return;
        pill.setAttribute("aria-busy", "true");
        pill.textContent = "Lägger till…";
        HZ8.productState(href).then(function (state) {
          if (!state.variantId || !state.buyable || state.variants > 1) { location.href = HZ8.link(href); return null; }
          return HZ8.addVariant(state.variantId).then(function () {
            pill.textContent = "Tillagd";
            window.setTimeout(function () { pill.innerHTML = ADD; }, 1800);
          });
        }).catch(function () {
          location.href = HZ8.link(href);
        }).finally(function () { pill.removeAttribute("aria-busy"); });
      });
    }
    pill.className = "hz8-add-pill hz8-card-pill";
    wrapper.appendChild(pill);
  }

  HZ8.register("product-cards", function (context) {
    if (context.page === "home") return;
    var main = document.getElementById("store-main");
    if (!main) return;
    HZ8.watch(function () {
      var cards = main.querySelectorAll(".product-card");
      for (var i = 0; i < cards.length; i += 1) enhance(cards[i]);
    });
  });
})();
