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


  function seriesCard(item, assetBase) {
    return '<a class="hz8-series-card" href="' + item.href + '"><img src="' + assetBase + item.asset + '" alt=""><b>' + item.name + '</b><span>' + item.label + '</span></a>';
  }

  /* ---- "Våra produkter" (2026-10-08): kategorihylla + riktiga produktkort.
     Data: Nyehandels egna listor sorterade "Mest populära" -- "Alla" =
     katalogportalen, övriga = formatens sidor ur relationskartan
     (06-catalog-map.js). Pris, namn, bild och variantmarkering ur
     kortet; köpbarhet, lager och omdömen ur HZ8.productState (produkt-
     sidan + Nyehandels product/state). Ingen siffra eller text gissas. */
  var SHELF = [
    { key: "all", label: "Alla produkter", icon: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>' },
    /* Påse, inte blad -- neutral formatikon. */
    { key: "buds", label: "Buds", icon: '<path d="M7 8h10l1.2 12H5.8z"/><path d="M8 8l1-3.5h6L16 8"/><path d="M9.5 12.5h5"/>' },
    { key: "hasch", label: "Hasch", icon: '<path d="M3.5 11l8.5-4.5 8.5 4.5-8.5 4.5z"/><path d="M3.5 11v3.5l8.5 4.5 8.5-4.5V11"/><path d="M12 15.5V19"/>' },
    { key: "carts", label: "Carts", icon: '<path d="M10.5 3h3v3h-3z"/><path d="M9 6h6v10.5H9z"/><path d="M9 10.5h6"/><path d="M10 16.5h4V21h-4z"/>' },
    { key: "vapes", label: "Vapes", icon: '<path d="M10.5 2.5h3v3h-3z"/><rect x="8" y="5.5" width="8" height="16" rx="2.6"/><path d="M11 17.5h2"/>' }
  ];
  var SHOWN = 6;
  var ICON_BASKET = '<svg class="hz8-pcard__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9h16l-1.6 10.2a1.5 1.5 0 0 1-1.5 1.3H7.1a1.5 1.5 0 0 1-1.5-1.3z"/><path d="M8.5 9l3.5-5 3.5 5"/></svg>';
  function svg(paths) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>'; }
  function text(el) { return el ? el.textContent.replace(/\s+/g, " ").replace(/&amp;/g, "&").trim() : ""; }

  var shelfCards = {
    key: "shelf-cards1",
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

  /* Samma urvalsregler som bästsäljarna (30-bestsellers.js): bort med
     ofullständiga kort, tjänsteprodukter utan varumärke och frakt/avgift.
     THCNM: pausad i väntan på juridisk bedömning (STATUS.md) -- visas
     tills vidare inte i startsidans kuraterade produktmodul. Tillfällig,
     dokumenterad regel; Nyehandels katalog ändras inte. */
  var PAUSED = /thc-?nm/i;
  function pkey(p) { return HZ8.path(p.href).split("?")[0]; }
  function usable(list) {
    var seen = {};
    return list.filter(function (p) {
      var k = pkey(p);
      if (!p.href || !p.name || !p.price || !p.brand || seen[k] || /frakt|avgift|presentkort/i.test(p.name) || PAUSED.test(p.name + " " + p.brand)) return false;
      seen[k] = true;
      return true;
    });
  }
  function listFor(route) {
    var href = route + (route.indexOf("?") === -1 ? "?" : "&") + "sort=popular";
    return HZ8.fetchPage(href, shelfCards).then(usable);
  }

  /* "Alla produkter" = sortimentets bredd, inte bara den globala topp-
     listan: först en köpbar produkt per format i rundgång (formatens
     egna "Mest populära", i hyllans ordning + tillbehör), sedan fylls
     resten ur den globala populära listan. Deterministiskt, inga
     hårdkodade produkter; köpbarhet enligt Nyehandels product/state. */
  var ROUND = ["buds", "hasch", "carts", "vapes", "batterier"];
  var TRIES = 4;
  /* En produkt representerar ett format bara om dess eget typord (första
     ledet i namnet, t.ex. "Hash –") stämmer med formatet. Kategorier kan
     innehålla annat (Isolat ligger i Hasch och Buds) -- sådana kort får
     inte stå för formatet. Produkter utan typord (t.ex. batterier) godtas. */
  var ROUND_TYPE = { buds: "Buds", hasch: "Hasch", carts: "Cart", vapes: "Vape" };
  function fitsFormat(p, key) {
    var want = ROUND_TYPE[key];
    if (!want) return true;
    var type = splitName(p.name).format;
    return !type || type === want;
  }
  function curated(routes) {
    var keys = ROUND.filter(function (k) { return routes[k]; });
    return Promise.all([listFor(routes.all)].concat(keys.map(function (k) { return listFor(routes[k]).catch(function () { return []; }); })))
      .then(function (lists) {
        var picked = [];
        var seen = {};
        function firstBuyable(list, k) {
          var i = 0;
          function next() {
            while (i < list.length && (seen[pkey(list[i])] || !fitsFormat(list[i], k))) i += 1;
            if (i >= list.length || i >= TRIES) return Promise.resolve(null);
            var p = list[i];
            i += 1;
            return HZ8.productState(p.href).then(function (st) { return st.buyable ? p : next(); }, next);
          }
          return next();
        }
        return keys.reduce(function (chain, k, n) {
          return chain.then(function () {
            return firstBuyable(lists[n + 1], k).then(function (p) { if (p) { seen[pkey(p)] = true; p.source = k; picked.push(p); } });
          });
        }, Promise.resolve()).then(function () {
          lists[0].forEach(function (p) { if (picked.length < SHOWN && !seen[pkey(p)]) { seen[pkey(p)] = true; p.source = "all"; picked.push(p); } });
          return picked.slice(0, SHOWN);
        });
      });
  }

  /* "Buds – THCA 22% – Orange Small Buds – 5 gram" -> namn + storlek.
     Storlek endast när sista ledet verkligen är en mängd. */
  /* "Buds – THCA 22% – Orange Small Buds – 5 gram" -> titel "THCA 22% –
     Orange Small Buds", rad två "Buds · 5 gram". Bara omflyttning av
     produktens eget namn: formatordet först och mängden sist. */
  var SIZE = /^\d+(?:[.,]\d+)?\s*(?:ml|g|gram|st|mg)$/i;
  var FORMAT_WORD = { buds: "Buds", hash: "Hasch", hasch: "Hasch", cart: "Cart", vape: "Vape", isolat: "Isolat", refill: "Refill", "pre-roll": "Pre-roll" };
  function splitName(name) {
    var parts = name.split(/\s+[–-]\s+/);
    var size = "";
    var format = "";
    if (parts.length > 1 && SIZE.test(parts[parts.length - 1])) size = parts.pop();
    if (parts.length > 1 && FORMAT_WORD[parts[0].toLowerCase()]) format = FORMAT_WORD[parts.shift().toLowerCase()];
    return { title: parts.join(" – "), size: size, format: format };
  }

  function ctaHtml(kind, p) {
    var name = HZ8.esc(p.name);
    var href = HZ8.esc(HZ8.link(p.href));
    if (kind === "choose") return '<a class="hz8-pcard__cta hz8-pcard__cta--choose" href="' + href + '" aria-label="Välj alternativ: ' + name + '">' + ICON_BASKET + '<span class="hz8-pcard__label">Välj alternativ</span><span class="hz8-pcard__arrow" aria-hidden="true">→</span></a>';
    if (kind === "soldout") return '<button type="button" class="hz8-pcard__cta is-soldout" disabled aria-label="' + name + ' är slutsåld"><span class="hz8-pcard__label">Slutsåld</span></button>';
    return '<button type="button" class="hz8-pcard__cta" data-hz8-buy aria-label="Lägg i varukorgen: ' + name + '">' + ICON_BASKET + '<span class="hz8-pcard__label">Lägg till</span></button>';
  }

  function cardHtml(p) {
    var href = HZ8.esc(HZ8.link(p.href));
    var n = splitName(p.name);
    var meta = [n.format, n.size].filter(Boolean).join(" · ") || (p.variants ? "Flera varianter" : p.brand);
    return '<article class="hz8-pcard" data-href="' + href + '" data-src="' + HZ8.esc(p.href) + '"' + (p.source ? ' data-hz8-source="' + p.source + '"' : '') + '>' +
      '<a class="hz8-pcard__media' + (p.image ? '' : ' is-missing') + '" href="' + href + '" tabindex="-1" aria-hidden="true"><span class="hz8-pcard__shadow"></span>' +
      (p.image ? '<img src="' + HZ8.esc(p.image) + '" alt="" loading="lazy" decoding="async" width="400" height="400">' : '') + '</a>' +
      '<div class="hz8-pcard__body">' +
      '<h3 class="hz8-pcard__name"><a href="' + href + '" title="' + HZ8.esc(p.name) + '">' + HZ8.esc(n.title || p.name) + '</a></h3>' +
      '<p class="hz8-pcard__meta">' + HZ8.esc(meta) + '</p>' +
      '<p class="hz8-pcard__rating is-pending"></p>' +
      '<p class="hz8-pcard__price">' + (p.was ? '<del aria-label="Tidigare pris">' + HZ8.esc(p.was) + '</del> ' : '') + '<strong' + (p.was ? ' class="is-sale"' : '') + '>' + HZ8.esc(p.price) + '</strong></p>' +
      '<div class="hz8-pcard__action">' + ctaHtml(p.variants ? "choose" : "buy", p) + '</div>' +
      '</div></article>';
  }

  /* Trasig produktbild: bildscenen står kvar tom, ingen trasig ikon. */
  function guardImages(root) {
    root.querySelectorAll(".hz8-pcard__media img").forEach(function (img) {
      img.addEventListener("error", function () { img.parentNode.classList.add("is-missing"); img.remove(); }, { once: true });
    });
  }

  function ratingHtml(r) {
    var v = Math.round(r.value * 10) / 10;
    var shown = String(v.toFixed(1)).replace(".", ",");
    return '<span class="hz8-pcard__stars" style="--hz8-fill:' + Math.max(0, Math.min(100, v / 5 * 100)) + '%" aria-hidden="true"></span>' +
      '<span class="hz8-pcard__score" aria-hidden="true">' + shown + '</span><span class="hz8-pcard__count" aria-hidden="true">(' + r.count + ')</span>' +
      '<span class="hz8-visually-hidden">Betyg ' + shown + ' av 5 från ' + r.count + (r.count === 1 ? ' omdöme' : ' omdömen') + '</span>';
  }

  /* Köp med tydliga lägen, samma som bästsäljarna: Lägger till… ->
     Tillagd ✓ / fel (406 = fler än lagret). Ingen sidladdning. */
  function buy(button, card, status) {
    if (button.getAttribute("aria-busy") === "true") return;
    var label = button.querySelector(".hz8-pcard__label");
    var name = card.querySelector(".hz8-pcard__name a").getAttribute("title");
    button.setAttribute("aria-busy", "true");
    button.classList.remove("is-error", "is-done");
    label.textContent = "Lägger till…";
    HZ8.productState(card.getAttribute("data-src")).then(function (st) {
      if (!st.variantId || st.variants > 1) { location.href = card.getAttribute("data-href"); return null; }
      if (!st.buyable) { applyState(card, st); return null; }
      return HZ8.addVariant(st.variantId, 1).then(function () {
        button.classList.add("is-done");
        label.innerHTML = 'Tillagd <span aria-hidden="true">✓</span>';
        status.textContent = name + " har lagts i varukorgen.";
        return true;
      });
    }).catch(function (err) {
      var tooMany = err && (err.status === 406 || /406/.test(err.message || ""));
      button.classList.add("is-error");
      label.textContent = tooMany ? "Slut i lager" : "Försök igen";
      status.textContent = tooMany ? "Det finns inte fler av " + name + " i lager." : "Det gick inte att lägga " + name + " i varukorgen. Försök igen.";
      return false;
    }).then(function (ok) {
      button.removeAttribute("aria-busy");
      if (ok === null) return;
      window.setTimeout(function () {
        if (!button.isConnected || !(button.classList.contains("is-done") || button.classList.contains("is-error"))) return;
        button.classList.remove("is-done", "is-error");
        label.textContent = "Lägg till";
      }, ok ? 2200 : 4000);
    });
  }

  function applyState(card, st) {
    var row = card.querySelector(".hz8-pcard__rating");
    if (row) {
      if (st.rating) { row.innerHTML = ratingHtml(st.rating); row.classList.remove("is-pending"); }
      else row.remove();
    }
    var action = card.querySelector(".hz8-pcard__action");
    var current = action.querySelector(".hz8-pcard__cta");
    if (!current || current.getAttribute("aria-busy") === "true" || current.classList.contains("is-done")) return;
    var p = { href: card.getAttribute("data-src"), name: card.querySelector(".hz8-pcard__name a").getAttribute("title") };
    var isChoose = current.classList.contains("hz8-pcard__cta--choose");
    if (!isChoose && st.variants > 1) action.innerHTML = ctaHtml("choose", p);
    else if (!isChoose && (!st.buyable || !st.variantId)) action.innerHTML = ctaHtml("soldout", p);
  }

  function hydrate(grid) {
    grid.querySelectorAll(".hz8-pcard").forEach(function (card) {
      HZ8.productState(card.getAttribute("data-src")).then(function (st) { if (card.isConnected) applyState(card, st); })
        .catch(function () { var row = card.querySelector(".hz8-pcard__rating"); if (row) row.remove(); });
    });
  }

  function productsSection() {
    var map = HZ8.catalog ? HZ8.catalog.build() : { formats: [], all: null };
    var routes = {};
    SHELF.forEach(function (f) {
      var route = f.key === "all" ? (map.all && map.all.href) : (HZ8.catalog && HZ8.catalog.formatByKey(f.key) || {}).href;
      if (route) routes[f.key] = route;
    });
    var acc = HZ8.catalog && HZ8.catalog.formatByKey("batterier");
    if (acc && acc.href) routes.batterier = acc.href;
    if (!routes.all) return { html: "", routes: routes };
    var shelf = SHELF.filter(function (f) { return routes[f.key]; }).map(function (f) {
      return '<button type="button" class="hz8-shelf__opt" data-hz8-shelf="' + f.key + '" aria-pressed="' + (f.key === "all") + '">' + svg(f.icon) + '<span>' + f.label + '</span></button>';
    }).join("");
    return {
      routes: routes,
      html: '<section class="hz8-home__section hz8-products" aria-labelledby="hz8-products-title"><div class="hz8-home__head"><h2 class="hz8-reveal" id="hz8-products-title">Våra produkter</h2><a class="hz8-products__all" href="' + HZ8.esc(HZ8.link(routes.all)) + '">Visa alla <span aria-hidden="true">→</span></a></div>' +
        '<div class="hz8-shelf" role="group" aria-label="Visa produkter efter typ">' + shelf + '</div>' +
        '<div class="hz8-products__grid" aria-live="off" aria-busy="true">' + new Array(SHOWN + 1).join('<div class="hz8-pcard is-skeleton" aria-hidden="true"><span class="hz8-pcard__media"></span><span class="hz8-pcard__body"></span></div>') + '</div>' +
        '<p class="hz8-visually-hidden" role="status" data-hz8-products-status></p></section>'
    };
  }

  function wireProducts(section, routes) {
    var grid = section.querySelector(".hz8-products__grid");
    var status = section.querySelector("[data-hz8-products-status]");
    var all = section.querySelector(".hz8-products__all");
    var opts = section.querySelectorAll("[data-hz8-shelf]");
    var visible = false;
    var current = null;

    function show(key, announce) {
      current = key;
      grid.setAttribute("aria-busy", "true");
      var source = key === "all" ? curated(routes) : listFor(routes[key]);
      return source.then(function (list) {
        if (current !== key) return;
        grid.innerHTML = list.slice(0, SHOWN).map(cardHtml).join("");
        guardImages(grid);
        grid.setAttribute("aria-busy", "false");
        all.href = HZ8.link(routes[key]);
        if (announce) status.textContent = "Visar " + (key === "all" ? "alla produkter" : section.querySelector('[data-hz8-shelf="' + key + '"] span').textContent);
        if (visible) hydrate(grid);
      }).catch(function () { grid.setAttribute("aria-busy", "false"); });
    }

    opts.forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (btn.getAttribute("aria-pressed") === "true") return;
        opts.forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
        show(btn.getAttribute("data-hz8-shelf"), true);
      });
    });
    grid.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-hz8-buy]");
      if (btn) buy(btn, btn.closest(".hz8-pcard"), status);
    });

    /* Typer utan produkter döljs (aldrig ett tomt val). Hämtas först när
       sektionen närmar sig, samma som köpstatus och omdömen. */
    function prefetchShelf() {
      opts.forEach(function (btn) {
        var key = btn.getAttribute("data-hz8-shelf");
        if (key === "all") return;
        listFor(routes[key]).then(function (list) { if (!list.length) btn.hidden = true; }).catch(function () {});
      });
    }
    function onVisible() {
      if (visible) return;
      visible = true;
      hydrate(grid);
      prefetchShelf();
    }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); onVisible(); }
      }, { rootMargin: "600px 0px" });
      io.observe(section);
    } else onVisible();
    show("all", false);
  }

  window.HZ8.register("homepage-catalog", function (context) {
    if (!context.home) return;
    var section = document.createElement("div");
    var products = productsSection();
    section.innerHTML = '<section class="hz8-home__section hz8-series"><div class="hz8-home__head"><h2 class="hz8-reveal">Våra populära serier</h2><a href="/sv/categories/alla-produkter">Visa alla</a></div><div class="hz8-series__grid hz8-reveal-group">' + series.map(function (item) { return seriesCard(item, context.assetBase); }).join("") + '</div></section>'
      + products.html
      + '<section class="hz8-mobile-lifestyle"><h2>Mer än produkter<br>– en livsstil</h2><p>Kvalitet. Gemenskap. Frihet.<br>Välkommen till Hazey.</p><a href="/sv/categories/alla-produkter">Utforska våra serier</a></section>';
    while (section.firstChild) context.home.appendChild(section.firstChild);

    var productsEl = context.home.querySelector(".hz8-products");
    if (productsEl) wireProducts(productsEl, products.routes);
  });
})();
