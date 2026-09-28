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
   4. "Mer från <tillverkare>": tillverkaren läses ur Nyehandels egen
      Varumärke-filtergrupp på sidan och används bara när serien har
      EXAKT en tillverkare. Innehållet = tillverkarens övriga produkter
      (serverfiltrerad Varumärke-route) minus seriens egna. Inga träffar
      -> ingen sektion. Kollapsad: dekorativ förhandsvisning + knapp;
      riktiga kort först efter expandering. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;

  function productPath(html) {
    var m = html.match(/href="([^"]*\/products\/[^"]+)"/);
    return m ? HZ8.path(m[1]) : "";
  }
  function firstImage(html) {
    var m = html.match(/<img[^>]+src="([^"]+)"/);
    return m ? m[1] : "";
  }

  function nativeBrands() {
    var groups = document.querySelectorAll("#sidebar .vertical-filters__product-filter__item");
    for (var i = 0; i < groups.length; i += 1) {
      var h = groups[i].querySelector("h4");
      if (h && /varumärke/i.test(h.textContent)) {
        return Array.prototype.map.call(groups[i].querySelectorAll(".product-filter-item a"), function (a) { return a.textContent.trim(); }).filter(Boolean);
      }
    }
    return [];
  }

  function focusRail(key, smooth) {
    var section = document.getElementById(key);
    if (!section || !section.classList.contains("hz8-prail")) return;
    var title = section.querySelector(".hz8-prail__title");
    if (smooth !== false) section.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    if (title) title.focus({ preventScroll: true });
  }

  function moreFrom(hub, series, brand) {
    var seriesSource = series.hub;
    var brandRoute = HZ8.catalog.manufacturerRoute(brand);
    Promise.all([
      HZ8.fetchPage(brandRoute, HZ8.categoryCards),
      HZ8.fetchPage(seriesSource, HZ8.categoryCards)
    ]).then(function (res) {
      var own = {};
      res[1].forEach(function (c) { own[productPath(c.html)] = true; });
      var others = res[0].filter(function (c) { return !own[productPath(c.html)]; });
      if (!others.length) return;
      var regionId = "hz8-more-" + brand.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      var section = document.createElement("section");
      section.className = "hz8-more";
      section.setAttribute("aria-labelledby", regionId + "-title");
      var thumbs = others.slice(0, 5).map(function (c) {
        var src = firstImage(c.html);
        return src ? '<span class="hz8-more__thumb"><img src="' + HZ8.esc(src) + '" alt="" loading="lazy" decoding="async" width="200" height="200"></span>' : "";
      }).join("");
      section.innerHTML =
        '<div class="hz8-more__head"><span class="hz8-kicker">Samma tillverkare</span>' +
        '<h2 id="' + regionId + '-title">Mer från ' + HZ8.esc(brand) + "</h2>" +
        "<p>Produkter från " + HZ8.esc(brand) + " utanför " + HZ8.esc(series.name) + '. <a class="hz8-link" href="' + HZ8.esc(HZ8.link(brandRoute)) + '">Alla produkter från ' + HZ8.esc(brand) + "</a></p></div>" +
        '<div class="hz8-more__teaser" aria-hidden="true">' + thumbs + "</div>" +
        '<button type="button" class="hz8-btn hz8-btn--secondary hz8-more__toggle" aria-expanded="false" aria-controls="' + regionId + '">Visa mer från ' + HZ8.esc(brand) + "</button>" +
        '<div class="hz8-more__region" id="' + regionId + '" hidden></div>';
      var region = section.querySelector(".hz8-more__region");
      var toggle = section.querySelector(".hz8-more__toggle");
      var built = false;
      toggle.addEventListener("click", function () {
        var open = toggle.getAttribute("aria-expanded") !== "true";
        if (open && !built) {
          built = true;
          region.appendChild(HZ8.productRail({
            id: regionId + "-rail",
            title: "Övrigt från " + brand,
            cards: others,
            count: others.length,
            eager: true
          }));
        }
        toggle.setAttribute("aria-expanded", String(open));
        toggle.textContent = open ? "Visa mindre" : "Visa mer från " + brand;
        region.hidden = !open;
        section.classList.toggle("is-open", open);
      });
      hub.appendChild(section);
    }).catch(function () { /* utan data visas ingen sektion */ });
  }

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

    /* Tillverkare: exakt ett riktigt Varumärke i seriens egen filterpanel. */
    var tries = 0;
    (function detect() {
      var brands = nativeBrands();
      if (!brands.length && tries++ < 20) { window.setTimeout(detect, 250); return; }
      if (brands.length === 1) moreFrom(hub, series, brands[0]);
    })();

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
