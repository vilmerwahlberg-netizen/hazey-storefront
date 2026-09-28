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
   4. Efter varje formatrad: "Mer <format> från <tillverkare>" via
      HZ8.relatedByManufacturer (samma kodväg för alla serier/
      tillverkare, se nedan). Används även på serie x format-sidor. */
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
  function firstImage(html) {
    var m = html.match(/<img[^>]+src="([^"]+)"/);
    return m ? m[1] : "";
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

  /* ---- Generell relation: aktiv serie -> faktisk tillverkare -> samma
     format -> tillverkarens övriga produkter i formatet, exkl. serien. ----
     - Tillverkaren = det ENDA varumärket bland seriens produkter i just
       det här formatet (ur Nyehandels egna kort). Flera varumärken ->
       ingen sektion (ingen tillverkare väljs automatiskt).
     - Kandidater = formatets egen sida serverfiltrerad på Varumärke
       (t.ex. alla-vapes?filters=Varumärke_Faraoh) -> samma tillverkare
       OCH samma format, publicerade, med riktigt pris och produkt-URL.
     - Exkluderar allt som finns i serien (hubbens alla sidor + serie x
       format-routen). Butikens eget varumärke räknas inte som tillverkare.
     - Inga träffar -> ingen sektion. Samma kodväg för alla serier och
       tillverkare. */
  HZ8.relatedByManufacturer = function (opts) {
    var format = opts.format, series = opts.series, route = opts.route;
    return seriesProducts(series, route).then(function (res) {
      var own = res.own;
      var brands = {};
      own.forEach(function (c) { var b = cardBrand(c.html); if (b) brands[b] = true; });
      var names = Object.keys(brands);
      /* Exakt en verklig tillverkare; butikens eget varumärke räknas inte. */
      if (names.length !== 1 || HZ8.catalog.isHouseBrand(names[0])) return null;
      var brand = names[0];
      var brandRoute = format.href + (format.href.indexOf("?") === -1 ? "?" : "&") + "filters=" + encodeURIComponent("Varumärke_" + brand);
      var ownPaths = {};
      res.all.forEach(function (c) { ownPaths[productPath(c.html)] = true; });
      return HZ8.fetchPage(brandRoute, HZ8.categoryCards).then(function (cands) {
        var others = cands.filter(function (c) { return !ownPaths[productPath(c.html)] && cardBrand(c.html) === brand && productPath(c.html); });
        if (!others.length) return null;
        return buildMore({ brand: brand, format: format, series: series, cards: others, brandRoute: brandRoute });
      });
    }).catch(function () { return null; });
  };

  function buildMore(o) {
    var fmt = o.format.label.toLowerCase();
    var regionId = "hz8-more-" + o.format.key + "-" + o.brand.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    var section = document.createElement("section");
    section.className = "hz8-more";
    section.setAttribute("aria-labelledby", regionId + "-title");
    var thumbs = o.cards.slice(0, 5).map(function (c) {
      var src = firstImage(c.html);
      return src ? '<span class="hz8-more__thumb"><img src="' + HZ8.esc(src) + '" alt="" loading="lazy" decoding="async" width="200" height="200"></span>' : "";
    }).join("");
    section.innerHTML =
      '<div class="hz8-more__head"><span class="hz8-kicker">Samma tillverkare</span>' +
      '<h2 id="' + regionId + '-title">Mer ' + HZ8.esc(fmt) + " från " + HZ8.esc(o.brand) + "</h2>" +
      "<p>" + HZ8.esc(o.format.label) + " från " + HZ8.esc(o.brand) + " utanför " + HZ8.esc(o.series.name) + "." + "</p></div>" +
      '<div class="hz8-more__teaser" aria-hidden="true">' + thumbs + "</div>" +
      '<button type="button" class="hz8-btn hz8-btn--secondary hz8-more__toggle" aria-expanded="false" aria-controls="' + regionId + '">Visa mer från ' + HZ8.esc(o.brand) + "</button>" +
      '<div class="hz8-more__region" id="' + regionId + '" hidden></div>';
    var region = section.querySelector(".hz8-more__region");
    var toggle = section.querySelector(".hz8-more__toggle");
    var built = false;
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") !== "true";
      if (open && !built) {
        built = true;
        /* "Visa alla" = formatets sida filtrerad på tillverkaren (riktig,
           beständig route) -- den innehåller även seriens egna produkter,
           därför en tydligt namngiven länk i stället för "Visa alla". */
        region.appendChild(HZ8.productRail({
          id: regionId + "-rail",
          title: o.format.label + " från " + o.brand,
          cards: o.cards,
          count: o.cards.length,
          eager: true
        }));
        var all = document.createElement("a");
        all.className = "hz8-link hz8-more__all";
        all.href = HZ8.link(o.brandRoute);
        all.textContent = "Alla " + fmt + " från " + o.brand;
        region.appendChild(all);
      }
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "Visa mindre" : "Visa mer från " + o.brand;
      region.hidden = !open;
      section.classList.toggle("is-open", open);
    });
    return section;
  }

  /* Serie x format-sida (t.ex. THCA Vapes): samma relation efter
     Nyehandels grid. */
  HZ8.comboRelated = function (root, ctx) {
    if (!ctx.series || !ctx.format) return;
    var route = ctx.series.routes[ctx.format.key];
    HZ8.relatedByManufacturer({ format: ctx.format, series: ctx.series, route: route }).then(function (section) {
      if (!section) return;
      section.classList.add("hz8-combo-related");
      root.insertBefore(section, root.querySelector(".hz8-cat-guide"));
    });
  };

  HZ8.seriesHub = function (root, ctx) {
    var series = ctx.series;
    var map = HZ8.catalog.build();
    document.documentElement.classList.add("hz8-series-hub");
    var hub = document.createElement("div");
    hub.className = "hz8-hub";
    hub.setAttribute("data-hz8-cat", "hub");

    map.formats.forEach(function (f) {
      var route = series.routes[f.key];
      if (!route || f.seriesless) return;
      var rail = HZ8.productRail({
        id: f.key,
        className: "hz8-hub__rail",
        title: series.name + " " + f.label,
        href: HZ8.link(route),
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
      HZ8.relatedByManufacturer({ format: f, series: series, route: route }).then(function (section) {
        if (section && rail.isConnected) slot.appendChild(section); else slot.remove();
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
