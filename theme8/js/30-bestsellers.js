/* Startsidans Bästsäljare + produkt i fokus.
   Facit (responsivt hybridsystem, beslut 2026-10-08):
   - desktop: Concept A (2x2-produkter bredvid en redaktionell fokusprodukt)
     theme8/review/bestsellers-spotlight-concepts-2026-10/concept-a-editorial-gallery.png
   - mobil: Concept B (vågrätt produktspår + kompakt fokus)
     theme8/review/bestsellers-spotlight-concepts-2026-10/concept-b-cinematic-stage.png
   Samma DOM för båda; kompositionen sätts i 30-bestsellers.css.

   Urval -- bara Nyehandels egen data, inget hårdkodat:
   1. Ordning: bästsäljarsidans aktiva urval (/page/vara-bastsaljare,
      HZ8.bestsellerSource) i Nyehandels sortering "Mest populära".
   2. Bort: kort utan varumärke (tjänsteprodukter), frakt-/avgiftsposter,
      produkter som ligger på relationskartans "Batterier & tillbehör"-sida
      (batterier och rena tillbehör) och dubbletter.
   3. Format per produkt: vilken av relationskartans formatsidor (Vapes,
      Carts, Buds, Hasch, Refill när den finns) produkten ligger på; annars
      produktsidans kategori (brödsmulan, t.ex. "Isolat").
   4. Fokus: första enkla produkt i ordningen som är i lager och köpbar.
   5. Kort: första kvalificerade produkt per format i ordningen (fokus-
      produktens format räknas som använt), sedan
      resten i ordning, max CARDS. Finns en enkel köpbar produkt bland de
      tolv första men ingen bland korten, byts sista kortet mot den.
   Urvalet och varför varje produkt föll bort finns i HZ8.bestsellerPick. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  var CARDS = 4;
  var SIMPLE_WITHIN = 12;
  var PAGE_GUARD = 12;

  /* Nyehandel dubbelkodar ibland "&" i produktnamn ("&amp;"). */
  function text(el) { return el ? el.textContent.replace(/\s+/g, " ").replace(/&amp;/g, "&").trim() : ""; }
  function key(href) { return HZ8.path(href).split("?")[0].replace(/\/\d+$/, ""); }

  var bestsellerCards = {
    key: "bs-cards2",
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
          variants: !!card.querySelector(".has-variants")
        };
      });
    }
  };

  /* Produktnycklar på en kategorisida, alla sidor (Nyehandels paginering). */
  var pathList = {
    key: "bs-paths1",
    run: function (doc) {
      var counter = doc.querySelector("#products_count");
      return {
        count: counter ? parseInt((counter.textContent.match(/(\d+)/) || [])[1], 10) : null,
        paths: Array.prototype.map.call(doc.querySelectorAll("#category-products .product-card a[href*='/products/']"), function (a) { return a.getAttribute("href"); })
      };
    }
  };
  function allPaths(href) {
    function page(n) { return HZ8.fetchPage(href + (n > 1 ? (href.indexOf("?") === -1 ? "?" : "&") + "page=" + n : ""), pathList); }
    return page(1).then(function (first) {
      var per = first.paths.length || 1;
      var pages = Math.min(PAGE_GUARD, Math.ceil((first.count || first.paths.length) / per));
      var jobs = [];
      for (var n = 2; n <= pages; n += 1) jobs.push(page(n));
      return Promise.all(jobs).then(function (rest) {
        var set = {};
        [first].concat(rest).forEach(function (r) { r.paths.forEach(function (h) { set[key(h)] = true; }); });
        return set;
      });
    }).catch(function () { return {}; });
  }

  function source() {
    return HZ8.fetchPage("/sv/page/vara-bastsaljare", HZ8.bestsellerSource).then(function (bs) {
      var locale = (window.config && window.config.locale) || "sv";
      var src = bs.cat ? "/" + locale + "/categories/" + bs.cat : bs.source;
      if (!src) throw new Error("no bestseller source");
      return bs.fixed ? src : src + (src.indexOf("?") === -1 ? "?" : "&") + "sort=popular";
    });
  }

  /* Urvalet (se kommentaren överst). Returnerar { cards, spot, log }. */
  function select(list) {
    var map = HZ8.catalog ? HZ8.catalog.build() : { formats: [] };
    var accessory = map.formats.filter(function (f) { return f.key === "batterier"; })[0];
    var formats = map.formats.filter(function (f) { return f.key !== "batterier"; });
    var log = { order: [], excluded: [], picked: [] };
    var seen = {};
    var candidates = [];
    list.forEach(function (p, i) {
      var k = key(p.href);
      log.order.push(p.name);
      if (!p.href || !p.name || !p.price) return log.excluded.push({ name: p.name || "(okänd)", reason: "ofullständigt kort" });
      if (seen[k]) return log.excluded.push({ name: p.name, reason: "dubblett" });
      seen[k] = true;
      if (!p.brand) return log.excluded.push({ name: p.name, reason: "inget varumärke (tjänsteprodukt)" });
      if (/frakt|avgift|presentkort/i.test(p.name)) return log.excluded.push({ name: p.name, reason: "frakt/avgift" });
      p.rank = i;
      candidates.push(p);
    });
    return Promise.all([accessory ? allPaths(accessory.href) : Promise.resolve({})].concat(formats.map(function (f) { return allPaths(f.href); }))).then(function (sets) {
      var acc = sets[0];
      candidates = candidates.filter(function (p) {
        if (acc[key(p.href)]) { log.excluded.push({ name: p.name, reason: "batterier & tillbehör" }); return false; }
        for (var i = 0; i < formats.length; i += 1) if (sets[i + 1][key(p.href)]) { p.format = formats[i].label; break; }
        return true;
      });
      /* Köpdata (och kategori för produkter utanför formatsidorna). */
      return Promise.all(candidates.map(function (p) {
        return HZ8.productState(p.href).then(function (st) { p.state = st; if (!p.format) p.format = st.category || "Övrigt"; return p; })
          .catch(function () { p.state = null; if (!p.format) p.format = "Övrigt"; return p; });
      }));
    }).then(function (ready) {
      var spot = null;
      ready.forEach(function (p) {
        var st = p.state;
        if (!spot && st && !p.variants && st.variants <= 1 && st.buyable && st.inStock && st.variantId) spot = p;
      });
      var rest = ready.filter(function (p) { return p !== spot; });
      var cards = [];
      var formatsUsed = {};
      if (spot) formatsUsed[spot.format] = true;
      rest.forEach(function (p) { if (cards.length < CARDS && !formatsUsed[p.format]) { formatsUsed[p.format] = true; cards.push(p); } });
      rest.forEach(function (p) { if (cards.length < CARDS && cards.indexOf(p) === -1) cards.push(p); });
      cards.sort(function (a, b) { return a.rank - b.rank; });
      var simple = function (p) { return p.state && !p.variants && p.state.variants <= 1 && p.state.buyable; };
      if (cards.length === CARDS && !cards.some(simple)) {
        var swap = rest.filter(function (p) { return cards.indexOf(p) === -1 && simple(p) && p.rank < SIMPLE_WITHIN; })[0];
        if (swap) { cards[cards.length - 1] = swap; cards.sort(function (a, b) { return a.rank - b.rank; }); }
      }
      ready.forEach(function (p) {
        if (p === spot) log.picked.push({ name: p.name, role: "fokus", format: p.format, why: "första enkla produkten i lager" });
        else if (cards.indexOf(p) !== -1) log.picked.push({ name: p.name, role: "kort", format: p.format, why: "bästsäljarordning + formatvariation" });
        else log.excluded.push({ name: p.name, reason: "fler än " + CARDS + " kvalificerade (format " + p.format + ")" });
      });
      HZ8.bestsellerPick = log;
      return { cards: cards, spot: spot, log: log };
    });
  }

  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';
  var PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  var TUNE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></svg>';

  function priceHtml(p, cls) {
    return '<p class="' + cls + '">' + (p.was ? '<del aria-label="Tidigare pris">' + HZ8.esc(p.was) + '</del> ' : '') +
      '<strong' + (p.was ? ' class="is-sale"' : '') + '>' + HZ8.esc(p.price) + '</strong></p>';
  }
  function img(src, cls, eager) {
    if (!src) return '<span class="' + cls + ' is-missing" aria-hidden="true"></span>';
    return '<img class="' + cls + '" src="' + HZ8.esc(src) + '" alt="" ' + (eager ? 'fetchpriority="high"' : 'loading="lazy"') + ' decoding="async" width="400" height="400">';
  }
  function guardImages(root) {
    root.querySelectorAll("img").forEach(function (i) {
      i.addEventListener("error", function () { i.classList.add("is-missing"); i.removeAttribute("src"); }, { once: true });
    });
  }

  function cardHtml(p) {
    var href = HZ8.esc(HZ8.link(p.href));
    var st = p.state;
    var isSimple = st && !p.variants && st.variants <= 1;
    var action;
    if (!isSimple) action = '<a class="hz8-bs-cta hz8-bs-cta--choose" href="' + href + '" aria-label="Välj variant: ' + HZ8.esc(p.name) + '">' + TUNE + '<span>Välj</span></a>';
    else if (!st.buyable || !st.variantId) action = '<button type="button" class="hz8-bs-cta is-soldout" disabled aria-label="' + HZ8.esc(p.name) + ' är slutsåld"><span>Slutsåld</span></button>';
    else action = '<button type="button" class="hz8-bs-cta hz8-bs-cta--buy" data-hz8-buy aria-label="Lägg i varukorgen: ' + HZ8.esc(p.name) + '">' + PLUS + '<span>Lägg till</span></button>';
    return '<article class="hz8-bs-card" data-href="' + href + '">' +
      '<a class="hz8-bs-card__media" href="' + href + '" tabindex="-1" aria-hidden="true">' + img(p.image, "hz8-bs-card__img") + '</a>' +
      '<div class="hz8-bs-card__body">' +
      '<h3 class="hz8-bs-card__name"><a href="' + href + '">' + HZ8.esc(p.name) + '</a></h3>' +
      '<p class="hz8-bs-card__brand">' + HZ8.esc(p.brand) + '</p>' +
      '<div class="hz8-bs-card__foot">' + priceHtml(p, "hz8-bs-card__price") + action + '</div>' +
      '</div></article>';
  }

  /* Ingress: första meningen ur produktens egen beskrivning, utan ord som
     kan läsas som effekt- eller hälsopåståenden (varumärkesrösten). */
  var CLAIMS = /(^|[^a-zåäö])(rus|ruset|rusig|high|aura)([^a-zåäö]|$)|effekt|medicin|lindr|smärt|sömn|ångest|avslapp|stress/i;
  function introSentence(t) {
    if (!t) return "";
    var first = (t.match(/^.{20,200}?[.!?](?=\s|$)/) || [""])[0].trim();
    return CLAIMS.test(first) ? "" : first;
  }

  function spotlightHtml(p) {
    var st = p.state;
    var href = HZ8.esc(HZ8.link(p.href));
    var art = st.image || p.image;
    var intro = introSentence(st.intro);
    var max = st.maxQty == null ? 99 : Math.max(1, Math.min(99, st.maxQty));
    return '<article class="hz8-spot" aria-labelledby="hz8-spot-title">' +
      '<a class="hz8-spot__art" href="' + href + '" tabindex="-1" aria-hidden="true" data-hz8-art-src="' + HZ8.esc(art || "") + '">' +
      '<span class="hz8-spot__badge">Bästsäljare</span>' +
      '<span class="hz8-spot__scene" aria-hidden="true"></span>' + img(art, "hz8-spot__img") + '</a>' +
      '<div class="hz8-spot__info">' +
      '<p class="hz8-spot__eyebrow">' + HZ8.esc(p.format && p.format !== "Övrigt" ? p.format : "Produkt i fokus") + '</p>' +
      '<h3 class="hz8-spot__title" id="hz8-spot-title"><a href="' + href + '">' + HZ8.esc(p.name) + '</a></h3>' +
      (intro ? '<p class="hz8-spot__intro">' + HZ8.esc(intro) + '</p>' : '') +
      '<div class="hz8-spot__row">' + priceHtml(p, "hz8-spot__price") +
      '<p class="hz8-spot__stock">' + HZ8.esc(st.stockLabel) + '</p></div>' +
      '<div class="hz8-spot__buy">' +
      '<div class="hz8-qty" role="group" aria-label="Antal">' +
      '<button type="button" class="hz8-qty__btn" data-step="-1" aria-label="Minska antal" disabled>−</button>' +
      '<input class="hz8-qty__input" type="number" inputmode="numeric" min="1" max="' + max + '" value="1" aria-label="Antal">' +
      '<button type="button" class="hz8-qty__btn" data-step="1" aria-label="Öka antal"' + (max <= 1 ? ' disabled' : '') + '>+</button></div>' +
      '<button type="button" class="hz8-spot__cta" data-hz8-spot-buy>Lägg i varukorg</button>' +
      '</div></div></article>';
  }

  /* Köp med tydliga lägen: laddar -> tillagd / fel. 406 = fler än lagret. */
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
    }).catch(function (err) {
      var tooMany = err && (err.status === 406 || /406/.test(err.message || ""));
      button.classList.add("is-error");
      label.textContent = tooMany ? "För många" : "Försök igen";
      status.textContent = tooMany
        ? "Det finns inte så många av " + name + " i lager. Välj ett lägre antal."
        : "Det gick inte att lägga " + name + " i varukorgen. Försök igen.";
      return false;
    }).then(function (ok) {
      button.removeAttribute("aria-busy");
      window.setTimeout(function () {
        if (button.classList.contains("is-done") || button.classList.contains("is-error")) { button.classList.remove("is-done", "is-error"); label.textContent = original; }
      }, ok ? 2200 : 4000);
      return ok;
    });
  }

  function wireCard(card, p, status) {
    card.addEventListener("click", function (e) {
      if (e.target.closest("a, button") || window.getSelection().toString()) return;
      location.href = card.getAttribute("data-href");
    });
    var btn = card.querySelector("[data-hz8-buy]");
    if (btn) btn.addEventListener("click", function () { buy(btn, p.state.variantId, 1, status, p.name); });
  }

  function wireSpotlight(spot, p, status) {
    var input = spot.querySelector(".hz8-qty__input");
    var minus = spot.querySelector('[data-step="-1"]');
    var plus = spot.querySelector('[data-step="1"]');
    var cta = spot.querySelector("[data-hz8-spot-buy]");
    var max = parseInt(input.getAttribute("max"), 10) || 99;
    function value() { return Math.min(max, Math.max(1, parseInt(input.value, 10) || 1)); }
    function set(n) { input.value = String(Math.min(max, Math.max(1, n))); minus.disabled = value() <= 1; plus.disabled = value() >= max; }
    minus.addEventListener("click", function () { set(value() - 1); });
    plus.addEventListener("click", function () { set(value() + 1); });
    input.addEventListener("change", function () { set(value()); });
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); set(value()); cta.click(); } });
    cta.addEventListener("click", function () {
      set(value());
      buy(cta, p.state.variantId, value(), status, p.name).then(function (ok) { if (ok) set(1); });
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
      '<div class="hz8-bs-head__titles"><p class="hz8-bs-eyebrow">Populära just nu</p>' +
      '<h2 class="hz8-bestsellers__title" id="hz8-bs-title" aria-label="Bästsäljare"><span aria-hidden="true">' + letters + '</span></h2></div>' +
      '<a class="hz8-bs-all" href="' + HZ8.esc(HZ8.link("/sv/page/vara-bastsaljare")) + '">Visa alla<span class="hz8-visually-hidden"> bästsäljare</span>' + ARROW + '</a></div>' +
      '<div class="hz8-bestsellers__grid">' + skeleton() + '</div>' +
      '<p class="hz8-visually-hidden" role="status" aria-live="polite" data-hz8-bs-status></p>';
    context.home.appendChild(section);
    context.bestsellers = section;
    var grid = section.querySelector(".hz8-bestsellers__grid");
    var status = section.querySelector("[data-hz8-bs-status]");

    source().then(function (src) { return HZ8.fetchPage(src, bestsellerCards); }).then(select).then(function (pick) {
      if (!pick.cards.length && !pick.spot) { section.remove(); return; }
      grid.setAttribute("data-layout", pick.spot ? "with-spot" : "cards-only");
      grid.innerHTML = (pick.cards.length ? '<div class="hz8-bs-cards" data-count="' + pick.cards.length + '">' + pick.cards.map(cardHtml).join("") + '</div>' : '') +
        (pick.spot ? spotlightHtml(pick.spot) : '');
      guardImages(grid);
      grid.querySelectorAll(".hz8-bs-card").forEach(function (el, i) { wireCard(el, pick.cards[i], status); });
      if (pick.spot) wireSpotlight(grid.querySelector(".hz8-spot"), pick.spot, status);
    }).catch(function () {
      /* Ingen data: sektionen döljs hellre än att visa påhittat innehåll. */
      section.remove();
    });
  });
})();
