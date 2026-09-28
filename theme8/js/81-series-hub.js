/* Seriehubb (t.ex. /magic-sauce, /thca, /nano-11): generell mall, inget
   specialskript per serie. Anropas av 80-category.js när relations-
   kartan säger att sidan är en seriehubb.

   1. En produktrad per format som serien verkligen har (HZ8.productRail),
      källa + "Visa alla" = seriens riktiga serie x format-route. Tomma
      format ger ingen rad (formatet syns i stället frostat i formatraden).
   2. Formatkorten överst hoppar till raderna (#vapes, #carts ...);
      rubriken hamnar under headern och får fokus; bakåt/framåt följer
      hashen.
   3. Nyehandels egen produktgrid (hela serien) ligger kvar och kan
      visas med en knapp -- filter och sortering fungerar som vanligt.
   4. Efter varje formatrad: "Mer <format> från <tillverkare>" med en
      egen hylla per annan verklig serie (HZ8.relatedByManufacturer,
      samma kodväg för alla serier/tillverkare). Även på serie x
      format-sidor.
   5. Mörk masthead + headerns kontrastlägen (hz8-header--on-dark). */
(function () {
  "use strict";

  var HZ8 = window.HZ8;

  function productPath(html) {
    var m = html.match(/href="([^"]*\/products\/[^"]+)"/);
    return m ? HZ8.path(m[1]).split("?")[0].replace(/\/\d+$/, "") : "";
  }

  /* Alla produkter i serien: seriens hubb (alla sidor, Nyehandels egen
     paginering) + serie x format-routen. Fångar produkter som tillhör
     serien men saknas i formatets underkategori. */
  var MAX_HUB_PAGES = 5;
  function seriesProducts(series, route) {
    var sources = [route];
    var jobs = [HZ8.fetchPage(route, HZ8.categoryCards)];
    if (series.hub) {
      jobs.push(HZ8.fetchPage(series.hub, HZ8.categoryInfo).then(function (info) {
        var pages = Math.min(MAX_HUB_PAGES, Math.max(1, Math.ceil((info.count || 1) / 25)));
        var all = [];
        for (var p = 1; p <= pages; p += 1) all.push(HZ8.fetchPage(series.hub + (p > 1 ? "?page=" + p : ""), HZ8.categoryCards));
        return Promise.all(all).then(function (lists) { return [].concat.apply([], lists); });
      }));
    }
    return Promise.all(jobs).then(function (res) { return { own: res[0], all: [].concat.apply([], res) }; });
  }

  function focusRail(key, smooth) {
    var section = document.getElementById(key);
    if (!section || !section.classList.contains("hz8-prail")) return;
    var title = section.querySelector(".hz8-prail__title");
    if (smooth !== false) section.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    if (title) title.focus({ preventScroll: true });
  }

  function cardBrand(html) {
    var m = html.match(/class="brand"[^>]*>\s*([^<]+?)\s*</);
    return m ? m[1].trim() : "";
  }

  /* ---- Generell relation, grupperad per varumärke och serie ----
     aktiv serie S, format F:
     för varje verkligt varumärke B bland S:s produkter i F
       -> B:s övriga produkter i F (formatets sida serverfiltrerad på
          Varumärke) exkl. hela S, dubbletter och kort utan pris/URL
       -> grupperas per annan verklig serie T (relationskartans T x F-
          route) = en egen namngiven hylla per T
       -> produkter utan serie -> EN reservhylla "Övriga F från B" sist
     -> en teaser "Fler F från B" per B med innehåll.
     - Varumärkets namn = Nyehandels kanoniska Varumärke (kortens .brand,
       samma värde som filtret) -- ingenting hårdkodat.
     - Flera varumärken i S gissas inte fram till ett: varje varumärke får
       sin egen, tydligt namngivna grupp. Butikens eget varumärke räknas
       inte som tillverkare.
     - Samma kodväg för alla serier/varumärken. */
  function brandRouteFor(format, brand) {
    return format.href + (format.href.indexOf("?") === -1 ? "?" : "&") + "filters=" + encodeURIComponent("Varumärke_" + brand);
  }
  function validCard(c) { return !!productPath(c.html) && /\d\s*kr/.test(c.html); }

  HZ8.relatedByManufacturer = function (opts) {
    var format = opts.format, series = opts.series, route = opts.route;
    return seriesProducts(series, route).then(function (res) {
      var counts = {};
      res.own.forEach(function (c) { var b = cardBrand(c.html); if (b && !HZ8.catalog.isHouseBrand(b)) counts[b] = (counts[b] || 0) + 1; });
      var brands = Object.keys(counts).sort(function (x, y) { return counts[y] - counts[x]; });
      if (!brands.length) return [];
      var inSeries = {};
      res.all.forEach(function (c) { inSeries[productPath(c.html)] = true; });
      var others = HZ8.catalog.build().series.filter(function (t) { return t !== series && t.routes[format.key]; });
      var seriesLists = Promise.all(others.map(function (t) {
        return HZ8.fetchPage(t.routes[format.key], HZ8.categoryCards).then(function (cards) {
          return { series: t, route: t.routes[format.key], cards: cards };
        }).catch(function () { return null; });
      }));
      return seriesLists.then(function (lists) {
        return Promise.all(brands.map(function (brand) {
          var brandRoute = brandRouteFor(format, brand);
          return HZ8.fetchPage(brandRoute, HZ8.categoryCards).catch(function () { return []; }).then(function (cands) {
            var pool = {};
            cands.forEach(function (c) {
              var path = productPath(c.html);
              if (validCard(c) && !inSeries[path] && cardBrand(c.html) === brand) pool[path] = c;
            });
            var shelves = [];
            lists.forEach(function (l) {
              if (!l) return;
              var cards = l.cards.filter(function (c) {
                var path = productPath(c.html);
                if (!pool[path]) return false;
                delete pool[path];
                return true;
              });
              if (cards.length) shelves.push({ series: l.series, route: l.route, cards: cards });
            });
            shelves.sort(function (x, y) { return y.cards.length - x.cards.length; });
            var rest = Object.keys(pool).map(function (k) { return pool[k]; });
            if (!shelves.length && !rest.length) return null;
            return buildMore({ brand: brand, format: format, series: series, shelves: shelves, rest: rest, brandRoute: brandRoute });
          });
        }));
      }).then(function (sections) { return sections.filter(Boolean); });
    }).catch(function () { return []; });
  };

  function firstImage(html) {
    var m = html.match(/<img[^>]+src="([^"]+)"/);
    return m ? m[1] : "";
  }

  var moreUid = 0;
  function buildMore(o) {
    moreUid += 1;
    var fmt = o.format.label.toLowerCase();
    var base = "hz8-more-" + moreUid;
    var title = "Fler " + fmt + " från " + o.brand;
    var section = document.createElement("section");
    section.className = "hz8-more";
    section.setAttribute("aria-labelledby", base + "-title");
    var peekCards = o.shelves.map(function (sh) { return sh.cards[0]; }).concat(o.rest.slice(0, 1)).slice(0, 3);
    section.innerHTML =
      '<div class="hz8-more__bar">' +
        '<div class="hz8-more__text"><span class="hz8-kicker">Samma tillverkare</span>' +
        '<h2 class="hz8-more__title" id="' + base + '-title">' + HZ8.esc(title) + "</h2></div>" +
        '<div class="hz8-more__peek" aria-hidden="true">' + peekCards.map(function (c) {
          var src = firstImage(c.html);
          return src ? '<span class="hz8-more__peek-item"><img src="' + HZ8.esc(src) + '" alt="" loading="lazy" decoding="async" width="120" height="90"></span>' : "";
        }).join("") + "</div>" +
        '<button type="button" class="hz8-more__toggle" aria-expanded="false" aria-controls="' + base + '">' +
          '<span class="hz8-more__toggle-closed"><span class="hz8-visually-hidden">' + HZ8.esc(title) + "</span></span>" +
          '<span class="hz8-more__toggle-open">Visa mindre</span>' + HZ8.icon("chevron") +
        "</button>" +
      "</div>" +
      '<div class="hz8-more__region" id="' + base + '" inert aria-hidden="true"><div class="hz8-more__inner"></div></div>';
    var inner = section.querySelector(".hz8-more__inner");
    /* En namngiven hylla per verklig serie; "Visa alla" = seriens riktiga
       serie x format-route. */
    o.shelves.forEach(function (sh) {
      inner.appendChild(HZ8.productRail({
        id: base + "-" + sh.series.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        className: "hz8-prail--compact hz8-more__shelf",
        title: sh.series.name + " " + o.format.label,
        href: HZ8.link(sh.route),
        cards: sh.cards,
        count: sh.cards.length,
        eager: true
      }));
    });
    if (o.rest.length) {
      /* Reservhylla (inget serienamn). Destination = formatets sida
         filtrerad på varumärket -- riktig route, därav den uttryckliga
         etiketten. */
      inner.appendChild(HZ8.productRail({
        id: base + "-ovriga",
        className: "hz8-prail--compact hz8-more__shelf hz8-more__shelf--rest",
        title: "Övriga " + fmt + " från " + o.brand,
        href: HZ8.link(o.brandRoute),
        allLabel: "Alla " + fmt + " från " + o.brand,
        cards: o.rest,
        count: o.rest.length,
        eager: true
      }));
    }
    var region = section.querySelector(".hz8-more__region");
    var toggle = section.querySelector(".hz8-more__toggle");
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") !== "true";
      section.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      region.inert = !open;
      if (open) region.removeAttribute("aria-hidden"); else region.setAttribute("aria-hidden", "true");
    });
    return section;
  }

  /* Relaterade sektionen hämtar data först när den närmar sig viewporten. */
  function whenNear(el, fn) {
    if (!("IntersectionObserver" in window)) { fn(); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); fn(); }
    }, { rootMargin: "700px 0px" });
    io.observe(el);
  }

  /* ---- Headerns kontrastlägen över seriens mörka masthead ----
     Explicit state-klass på #store-header (ingen mix-blend-mode):
     hz8-header--on-dark när headern ligger över mastheaden, annars
     ljust läge. Styrs av mastheadens faktiska position (IO med en
     rootMargin lika med headerns höjd). Defaultläge vid start = mörkt
     (sidan laddas med mastheaden överst). */
  function initHeaderContrast(masthead) {
    var header = document.getElementById("store-header");
    if (!header || !masthead) return;
    header.classList.add("hz8-header--on-dark");
    if (!("IntersectionObserver" in window)) return;
    var headerH = 84;
    var io = new IntersectionObserver(function (entries) {
      var e = entries[0];
      header.classList.toggle("hz8-header--on-dark", e.isIntersecting);
    }, { rootMargin: "-" + headerH + "px 0px 0px 0px", threshold: 0 });
    io.observe(masthead);
  }

  /* Serie x format-sida (t.ex. THCA Vapes): samma relation efter
     Nyehandels grid. */
  HZ8.comboRelated = function (root, ctx) {
    if (!ctx.series || !ctx.format) return;
    var route = ctx.series.routes[ctx.format.key];
    HZ8.relatedByManufacturer({ format: ctx.format, series: ctx.series, route: route }).then(function (sections) {
      if (!sections.length) return;
      var wrap = document.createElement("div");
      wrap.className = "hz8-combo-related";
      sections.forEach(function (sec) { wrap.appendChild(sec); });
      root.insertBefore(wrap, root.querySelector(".hz8-cat-guide"));
    });
  };

  HZ8.seriesHub = function (root, ctx) {
    var series = ctx.series;
    var map = HZ8.catalog.build();
    document.documentElement.classList.add("hz8-series-hub");
    /* Masthead: kategoritoppen (80-category.js) i seriens mörka uttryck;
       accentlinje som eget dekorativt element. */
    var masthead = root.querySelector(".hz8-cat-hero");
    var rule = document.createElement("span");
    rule.className = "hz8-masthead__rule";
    rule.setAttribute("aria-hidden", "true");
    root.appendChild(rule);
    initHeaderContrast(masthead);
    var hub = document.createElement("div");
    hub.className = "hz8-hub";
    hub.setAttribute("data-hz8-cat", "hub");

    map.formats.forEach(function (f) {
      var route = series.routes[f.key];
      if (!route || f.seriesless) return;
      var rail = HZ8.productRail({
        id: f.key,
        className: "hz8-hub__rail hz8-prail--compact",
        title: series.name + " " + f.label,
        titleHref: HZ8.link(route),
        href: HZ8.link(f.href),
        allLabel: "Alla " + f.label.toLowerCase(),
        source: route,
        onEmpty: function () {
          var navItem = root.querySelector('[data-hz8-local="' + f.key + '"]');
          if (navItem) navItem.remove();
        },
        onRender: function () {
          HZ8.fetchPage(route, HZ8.categoryInfo).then(function (info) {
            if (info.count != null) rail.querySelector(".hz8-prail__count").textContent = HZ8.countLabel(info.count);
          }).catch(function () {});
        }
      });
      hub.appendChild(rail);
      var slot = document.createElement("div");
      slot.className = "hz8-hub__related";
      hub.appendChild(slot);
      whenNear(rail, function () {
        HZ8.relatedByManufacturer({ format: f, series: series, route: route }).then(function (sections) {
          if (sections.length && rail.isConnected) sections.forEach(function (sec) { slot.appendChild(sec); }); else slot.remove();
        });
      });
    });

    /* Hela seriens native grid (filter/sortering) bakom en knapp. */
    var counter = document.getElementById("products_count");
    var total = counter && (counter.textContent.match(/(\d+)/) || [])[1];
    var gridToggle = document.createElement("div");
    gridToggle.className = "hz8-hub__grid-toggle";
    gridToggle.innerHTML = '<button type="button" class="hz8-btn hz8-btn--dark" aria-expanded="false" aria-controls="category-products">Visa hela sortimentet i ' +
      HZ8.esc(series.name) + (total ? " (" + total + ")" : "") + "</button>";
    gridToggle.querySelector("button").addEventListener("click", function (e) {
      var open = document.documentElement.classList.toggle("hz8-hub-grid-open");
      e.currentTarget.setAttribute("aria-expanded", String(open));
      e.currentTarget.textContent = open ? "Dölj hela sortimentet" : "Visa hela sortimentet i " + series.name + (total ? " (" + total + ")" : "");
      if (open) { var grid = document.querySelector(".designer-category"); if (grid) grid.scrollIntoView({ block: "start" }); }
    });
    hub.appendChild(gridToggle);

    root.insertBefore(hub, root.querySelector(".designer-category"));

    /* Hash-navigation till raderna. */
    root.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest("[data-hz8-local]");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
      e.preventDefault();
      var key = a.getAttribute("data-hz8-local");
      if (location.hash !== "#" + key) history.pushState(null, "", "#" + key);
      focusRail(key);
    });
    window.addEventListener("popstate", function () { if (location.hash) focusRail(location.hash.slice(1)); });
    if (location.hash) window.setTimeout(function () { focusRail(location.hash.slice(1)); }, 400);
  };
})();
