/* Gemensamt produktkort: lägger en kompakt, tillgänglig kontroll på
   varje native .product-card utanför startsidan. Kortet har ingen
   variant-id i sin markup, så kontrollen leder alltid till produktens
   riktiga sida (där Nyehandels egna köpflöde finns) -- "Välj variant"
   när plattformen själv märkt kortet med flera varianter, annars
   "Visa". Idempotent; körs om vid Vue-re-render. */
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
    var variants = !!card.querySelector(".has-variants");
    /* Läggs SIST i kortet (flyttar aldrig Vue-ägda noder) och
       positioneras med CSS bredvid priset. */
    var pill = document.createElement("a");
    pill.className = "hz8-add-pill hz8-card-pill" + (variants ? " is-wide" : "");
    pill.href = link.getAttribute("href");
    pill.textContent = variants ? "Välj variant" : "Visa";
    pill.setAttribute("aria-label", (variants ? "Välj variant: " : "Visa produkt: ") + name);
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
