/* Startsidans Bästsäljare + produkt i fokus -- facit Concept B:
   theme8/review/bestsellers-spotlight-concepts-2026-10/concept-b-cinematic-stage.png

   All produktdata är Nyehandels egen, inget hårdkodat:
   - Ordning: bästsäljarsidans aktiva urval (/page/vara-bastsaljare,
     HZ8.bestsellerSource) i Nyehandels sortering "Mest populära" -- samma
     källa som Butiks "Populärt just nu". Ingen egen popularitet.
   - Kort: namn, varumärke, pris (inkl. rea), bild och länk ur de
     serverrenderade produktkorten. Kort utan varumärke (t.ex. tjänste-
     produkten "Fraktändring") är inga sortimentsprodukter och hoppas över.
   - Köp/lager: HZ8.productState (produktsidan + /frontend-api/product/
     state): variant-id, lager och lagertext, bild, kort beskrivning.
   - Produkt i fokus: den högst rankade enkla produkten som är i lager
     och köpbar. Den visas inte också som kort.
   - Bild i fokus: produktens egen bild på en CSS-scen (ingen separat
     lifestylebild finns för produkterna). Byt via data-hz8-art-src om
     en godkänd bild av SAMMA produkt tas fram.
   Köp går via HZ8.addVariant (Nyehandels egen varukorgsaction). */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  var CARDS = 3;

  function text(el) { return el ? el.textContent.replace(/\s+/g, " ").trim() : ""; }

  /* Ett serverrenderat produktkort -> ren data. */
  var bestsellerCards = {
    key: "bs-cards1",
    run: function (doc) {
      return Array.prototype.map.call(doc.querySelectorAll("#category-products .product-card"), function (card) {
        var link = card.querySelector("a[href*='/products/']");
        var img = card.querySelector(".product-card__image img");
        var price = card.querySelector(".price");
        var now = price && (price.querySelector("ins") || price);
        var was = price && price.querySelector("del, .comparison");
        return {
          href: link ? link.getAttribute("href") : "",
          name: text(card.querySelector(".name")),
          brand: text(card.querySelector(".brand")),
          price: now ? text(now) : "",
          was: was ? text(was) : "",
          image: img ? img.getAttribute("src") : "",
          alt: img ? (img.getAttribute("alt") || "") : "",
          variants: !!card.querySelector(".has-variants")
        };
      }).filter(function (p) { return p.href && p.name && p.brand && p.price; });
    }
  };

  function source() {
    return HZ8.fetchPage("/sv/page/vara-bastsaljare", HZ8.bestsellerSource).then(function (bs) {
      var locale = (window.config && window.config.locale) || "sv";
      var src = bs.cat ? "/" + locale + "/categories/" + bs.cat : bs.source;
      if (!src) throw new Error("no bestseller source");
      return bs.fixed ? src : src + (src.indexOf("?") === -1 ? "?" : "&") + "sort=popular";
    });
  }

  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';
  var PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  var TUNE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg>';

  function priceHtml(p, cls) {
    return '<p class="' + cls + '">' + (p.was ? '<del aria-label="Tidigare pris">' + HZ8.esc(p.was) + '</del> ' : '') +
      '<strong' + (p.was ? ' class="is-sale"' : '') + '>' + HZ8.esc(p.price) + '</strong></p>';
  }

  function img(src, alt, cls, eager) {
    if (!src) return '<span class="' + cls + ' is-missing" aria-hidden="true"></span>';
    return '<img class="' + cls + '" src="' + HZ8.esc(src) + '" alt="' + HZ8.esc(alt) + '" ' + (eager ? 'fetchpriority="high"' : 'loading="lazy"') + ' decoding="async" width="400" height="400">';
  }

  /* Trasig bild -> neutral yta i stället för en trasig ikon. */
  function guardImages(root) {
    root.querySelectorAll("img").forEach(function (i) {
      i.addEventListener("error", function () { i.classList.add("is-missing"); i.removeAttribute("src"); }, { once: true });
    });
  }

  function cardHtml(p) {
    var href = HZ8.esc(HZ8.link(p.href));
    var action = p.variants
      ? '<a class="hz8-bs-cta" href="' + href + '" aria-label="Välj variant: ' + HZ8.esc(p.name) + '">' + TUNE + '<span>Välj</span></a>'
      : '<button type="button" class="hz8-bs-cta" data-hz8-buy aria-label="Lägg i varukorgen: ' + HZ8.esc(p.name) + '" disabled>' + PLUS + '<span>Lägg till</span></button>';
    return '<article class="hz8-bs-card" data-href="' + href + '">' +
      '<a class="hz8-bs-card__media" href="' + href + '" tabindex="-1" aria-hidden="true">' + img(p.image, "", "hz8-bs-card__img") + '</a>' +
      '<div class="hz8-bs-card__body">' +
      '<h3 class="hz8-bs-card__name"><a href="' + href + '">' + HZ8.esc(p.name) + '</a></h3>' +
      '<p class="hz8-bs-card__brand">' + HZ8.esc(p.brand) + '</p>' +
      '<div class="hz8-bs-card__foot">' + priceHtml(p, "hz8-bs-card__price") + action + '</div>' +
      '</div></article>';
  }

  /* Ingress: första meningen ur produktens egen korta beskrivning. Visas
     inte om den innehåller ord som kan läsas som effekt- eller
     hälsopåståenden (varumärkesrösten, CLAUDE.md). */
  var CLAIMS = /(^|[^a-zåäö])(rus|ruset|rusig|high|aura)([^a-zåäö]|$)|effekt|medicin|lindr|smärt|sömn|ångest|avslapp|stress/i;
  function introSentence(t) {
    if (!t) return "";
    var first = (t.match(/^.{20,240}?[.!?](?=\s|$)/) || [t.slice(0, 200)])[0].trim();
    return CLAIMS.test(first) ? "" : first;
  }

  function spotlightHtml(p, st) {
    var href = HZ8.esc(HZ8.link(p.href));
    var art = st.image || p.image;
    return '<article class="hz8-spot" aria-labelledby="hz8-spot-title">' +
      '<a class="hz8-spot__art" href="' + href + '" tabindex="-1" aria-hidden="true" data-hz8-art-src="' + HZ8.esc(art || "") + '">' +
      '<span class="hz8-spot__scene" aria-hidden="true"></span>' + img(art, "", "hz8-spot__img") + '</a>' +
      '<div class="hz8-spot__info">' +
      (st.category && st.category !== p.name ? '<p class="hz8-spot__eyebrow">' + HZ8.esc(st.category) + ' · Produkt i fokus</p>' : '<p class="hz8-spot__eyebrow">Produkt i fokus</p>') +
      '<h3 class="hz8-spot__title" id="hz8-spot-title"><a href="' + href + '">' + HZ8.esc(p.name) + '</a></h3>' +
      (introSentence(st.intro) ? '<p class="hz8-spot__intro">' + HZ8.esc(introSentence(st.intro)) + '</p>' : '') +
      '<div class="hz8-spot__row">' + priceHtml(p, "hz8-spot__price") +
      '<p class="hz8-spot__stock' + (st.inStock ? "" : " is-out") + '">' + HZ8.esc(st.stockLabel) + '</p></div>' +
      '<div class="hz8-spot__buy">' +
      '<div class="hz8-qty" role="group" aria-label="Antal">' +
      '<button type="button" class="hz8-qty__btn" data-step="-1" aria-label="Minska antal" disabled>−</button>' +
      '<input class="hz8-qty__input" type="number" inputmode="numeric" min="1" max="99" value="1" aria-label="Antal">' +
      '<button type="button" class="hz8-qty__btn" data-step="1" aria-label="Öka antal">+</button></div>' +
      '<button type="button" class="hz8-spot__cta" data-hz8-spot-buy>Lägg i varukorg</button>' +
      '</div></div></article>';
  }

  /* Köp med tydliga lägen: laddar -> tillagd / fel. Knappen behåller sin
     storlek (texten byts i ett eget span), så inget hoppar. */
  function buy(button, variantId, qty, status, name) {
    if (button.getAttribute("aria-busy") === "true") return Promise.resolve(false);
    var label = button.querySelector("span") || button;
    var original = label.textContent;
    button.setAttribute("aria-busy", "true");
    button.classList.remove("is-error", "is-done");
    label.textContent = "Lägger till…";
    return HZ8.addVariant(variantId, qty).then(function () {
      button.classList.add("is-done");
      label.textContent = "Tillagd";
      status.textContent = name + (qty > 1 ? " (" + qty + " st)" : "") + " har lagts i varukorgen.";
      return true;
    }).catch(function () {
      button.classList.add("is-error");
      label.textContent = "Försök igen";
      status.textContent = "Det gick inte att lägga " + name + " i varukorgen. Försök igen.";
      return false;
    }).then(function (ok) {
      button.removeAttribute("aria-busy");
      window.setTimeout(function () {
        if (button.classList.contains("is-done")) { button.classList.remove("is-done"); label.textContent = original; }
      }, 2200);
      return ok;
    });
  }

  function wireCard(card, p, status) {
    /* Kortets övriga yta öppnar produkten (inte en länk ovanpå, så inget
       överlappar köpknappen eller nästlas). */
    card.addEventListener("click", function (e) {
      if (e.target.closest("a, button") || window.getSelection().toString()) return;
      location.href = card.getAttribute("data-href");
    });
    var btn = card.querySelector("[data-hz8-buy]");
    if (!btn) return;
    HZ8.productState(p.href).then(function (st) {
      if (st.variants > 1) {
        /* Kortet sa enkel produkt men den har varianter: välj på sidan. */
        var a = document.createElement("a");
        a.className = "hz8-bs-cta"; a.href = card.getAttribute("data-href");
        a.setAttribute("aria-label", "Välj variant: " + p.name);
        a.innerHTML = TUNE + "<span>Välj</span>";
        btn.replaceWith(a);
        return;
      }
      if (!st.buyable || !st.variantId) {
        btn.innerHTML = "<span>Slutsåld</span>";
        btn.classList.add("is-soldout");
        btn.setAttribute("aria-label", p.name + " är slutsåld");
        btn.disabled = true;
        return;
      }
      btn.disabled = false;
      btn.addEventListener("click", function () { buy(btn, st.variantId, 1, status, p.name); });
    }).catch(function () {
      /* Utan köpdata: leder till produktsidan i stället för ett låtsat köp. */
      var a = document.createElement("a");
      a.className = "hz8-bs-cta"; a.href = card.getAttribute("data-href");
      a.innerHTML = ARROW + "<span>Visa</span>";
      a.setAttribute("aria-label", "Visa " + p.name);
      btn.replaceWith(a);
    });
  }

  function wireSpotlight(spot, p, st, status) {
    var input = spot.querySelector(".hz8-qty__input");
    var minus = spot.querySelector('[data-step="-1"]');
    var plus = spot.querySelector('[data-step="1"]');
    var cta = spot.querySelector("[data-hz8-spot-buy]");
    function value() { return Math.min(99, Math.max(1, parseInt(input.value, 10) || 1)); }
    function set(n) { input.value = String(Math.min(99, Math.max(1, n))); minus.disabled = value() <= 1; plus.disabled = value() >= 99; }
    minus.addEventListener("click", function () { set(value() - 1); });
    plus.addEventListener("click", function () { set(value() + 1); });
    input.addEventListener("change", function () { set(value()); });
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); cta.click(); } });
    cta.addEventListener("click", function () {
      buy(cta, st.variantId, value(), status, p.name).then(function (ok) { if (ok) set(1); });
    });
  }

  function skeleton() {
    var cards = "";
    for (var i = 0; i < CARDS; i += 1) cards += '<div class="hz8-bs-card is-skeleton" aria-hidden="true"><span class="hz8-bs-card__media"></span><span class="hz8-bs-card__body"></span></div>';
    return '<div class="hz8-bs-cards" data-count="' + CARDS + '">' + cards + '</div><div class="hz8-spot is-skeleton" aria-hidden="true"></div>';
  }

  window.HZ8.register("homepage-bestsellers", function (context) {
    if (!context.home) return;
    var letters = "Bästsäljare".split("").map(function (letter, index) {
      return '<i style="--i:' + index + '">' + letter + '</i>';
    }).join("");
    var section = document.createElement("section");
    section.className = "hz8-home__section hz8-bestsellers";
    section.setAttribute("aria-labelledby", "hz8-bs-title");
    section.innerHTML = '<div class="hz8-home__head hz8-bs-head">' +
      '<h2 class="hz8-bestsellers__title" id="hz8-bs-title" aria-label="Bästsäljare"><span aria-hidden="true">' + letters + '</span></h2>' +
      '<a class="hz8-bs-all" href="' + HZ8.esc(HZ8.link("/sv/page/vara-bastsaljare")) + '">Visa alla bästsäljare' + ARROW + '</a></div>' +
      '<div class="hz8-bestsellers__grid">' + skeleton() + '</div>' +
      '<p class="hz8-visually-hidden" role="status" aria-live="polite" data-hz8-bs-status></p>';
    context.home.appendChild(section);
    context.bestsellers = section;
    var grid = section.querySelector(".hz8-bestsellers__grid");
    var status = section.querySelector("[data-hz8-bs-status]");

    source().then(function (src) { return HZ8.fetchPage(src, bestsellerCards); }).then(function (list) {
      var seen = {};
      list = list.filter(function (p) { var k = HZ8.path(p.href).split("?")[0]; if (seen[k]) return false; seen[k] = true; return true; });
      /* Produkt i fokus: första enkla, köpbara produkten i lager. */
      var simple = list.filter(function (p) { return !p.variants; });
      function pick(i) {
        if (i >= simple.length) return Promise.resolve(null);
        return HZ8.productState(simple[i].href).then(function (st) {
          return st.buyable && st.inStock && st.variantId && st.variants <= 1 ? { p: simple[i], st: st } : pick(i + 1);
        }).catch(function () { return pick(i + 1); });
      }
      return pick(0).then(function (spot) {
        var cards = list.filter(function (p) { return !spot || p !== spot.p; }).slice(0, CARDS);
        if (!cards.length && !spot) { section.remove(); return; }
        grid.innerHTML = (cards.length ? '<div class="hz8-bs-cards" data-count="' + cards.length + '">' + cards.map(cardHtml).join("") + '</div>' : '') +
          (spot ? spotlightHtml(spot.p, spot.st) : '');
        guardImages(grid);
        grid.querySelectorAll(".hz8-bs-card").forEach(function (el, i) { wireCard(el, cards[i], status); });
        if (spot) wireSpotlight(grid.querySelector(".hz8-spot"), spot.p, spot.st, status);
      });
    }).catch(function () {
      /* Ingen data: hela sektionen döljs hellre än att visa påhittat. */
      section.remove();
    });
  });
})();
