/* Gemensamt produktkort: en kompakt, tillgänglig kontroll längst ned på
   varje native .product-card utanför startsidan -- "+ Lägg till" för
   enkla produkter (Nyehandels egen varukorgsaction), "Välj variant" för
   variantprodukter. Idempotent; körs om vid Vue-re-render. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  /* Etiketter kan bytas per sida (kategoripiloten sätter HZ8.cardLabels
     till "Lägg i varukorg" / "Välj alternativ" och kör relabelCards). */
  function labels() {
    var l = HZ8.cardLabels || {};
    function pair(long, short, before, after) {
      return (before || "") + '<span class="hz8-pill-long">' + HZ8.esc(long) + '</span><span class="hz8-pill-short" aria-hidden="true">' + HZ8.esc(short) + "</span>" + (after || "");
    }
    return {
      add: l.add ? pair(l.add, l.addShort || l.add, l.addIcon) : pair("+ Lägg till", "Lägg till"),
      variants: l.variants ? pair(l.variants, l.variantsShort || l.variants, "", l.variantsIcon) : pair("Välj variant", "Välj"),
      variantsAria: l.variantsAria || l.variants || "Välj variant"
    };
  }
  HZ8.relabelCards = function () {
    var L = labels();
    document.querySelectorAll("#store-main .hz8-card-pill").forEach(function (pill) {
      if (pill.getAttribute("aria-busy") === "true") return;
      var isVariant = pill.tagName === "A";
      pill.innerHTML = isVariant ? L.variants : L.add;
      if (isVariant) pill.setAttribute("aria-label", L.variantsAria + ": " + (pill.getAttribute("aria-label") || "").replace(/^[^:]*:\s*/, ""));
    });
  };

  function enhance(card) {
    /* TASK 23: paketkort (3-/5-pack, 04-variant-cards) visas aldrig i
       listor som inte redan filtrerat bort dem (rälsar, bästsäljare). */
    if (!card.hasAttribute("data-hz8-pkgchecked")) {
      card.setAttribute("data-hz8-pkgchecked", "");
      if (HZ8.variantCards && HZ8.variantCards.isPackageCard(card.outerHTML)) {
        card.classList.add("hz8-pack-card");
        var cell = card.parentNode;
        if (cell && cell !== document.body && cell.children.length === 1) cell.classList.add("hz8-pack-cell");
        return;
      }
    }
    if (card.classList.contains("hz8-pack-card")) return;
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
    /* TASK 23: variantkort (04-variant-cards) -- köp av just den varianten.
       Slutsåld variant: ingen köpknapp (kortet visar Slutsåld, länken
       öppnar produktsidan med varianten vald). */
    var variantId = card.getAttribute("data-hz8-variant");
    if (variantId && card.getAttribute("data-hz8-instock") !== "1") {
      /* Samma inaktiva etikett som portalkortet (80-category decorateCard)
         även där den dekoren inte körs -- aldrig köpbar, alltid tydlig. */
      card.classList.add("hz8-is-soldout");
      if (!wrapper.querySelector(".hz8-psold")) {
        var sold = document.createElement("span");
        sold.className = "hz8-psold";
        sold.textContent = "Slutsåld";
        sold.setAttribute("role", "button");
        sold.setAttribute("aria-disabled", "true");
        sold.setAttribute("aria-label", "Slutsåld: " + name + (card.querySelector(".brand") ? ", " + card.querySelector(".brand").textContent.trim() : ""));
        wrapper.appendChild(sold);
      }
      return;
    }
    var pill;
    if (variantId) {
      pill = document.createElement("button");
      pill.type = "button";
      pill.innerHTML = labels().add;
      pill.setAttribute("aria-label", "Lägg i varukorgen: " + name + (card.querySelector(".brand") ? ", " + card.querySelector(".brand").textContent.trim() : ""));
      pill.addEventListener("click", function () {
        if (pill.getAttribute("aria-busy") === "true") return;
        pill.setAttribute("aria-busy", "true");
        pill.textContent = "Lägger till…";
        HZ8.addVariant(+variantId).then(function () {
          pill.textContent = "Tillagd";
          window.setTimeout(function () { pill.innerHTML = labels().add; }, 1800);
        }).catch(function () { location.href = HZ8.link(href); })
          .finally(function () { pill.removeAttribute("aria-busy"); });
      });
    } else if (variants) {
      pill = document.createElement("a");
      pill.href = href;
      pill.innerHTML = labels().variants;
      pill.setAttribute("aria-label", labels().variantsAria + ": " + name);
    } else {
      pill = document.createElement("button");
      pill.type = "button";
      pill.innerHTML = labels().add;
      pill.setAttribute("aria-label", "Lägg i varukorgen: " + name);
      pill.addEventListener("click", function () {
        if (pill.getAttribute("aria-busy") === "true") return;
        pill.setAttribute("aria-busy", "true");
        pill.textContent = "Lägger till…";
        HZ8.productState(href).then(function (state) {
          if (!state.variantId || !state.buyable || state.variants > 1) { location.href = HZ8.link(href); return null; }
          return HZ8.addVariant(state.variantId).then(function () {
            pill.textContent = "Tillagd";
            window.setTimeout(function () { pill.innerHTML = labels().add; }, 1800);
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
