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
   5. Mörk masthead (headerns mörka läge styrs av 05-header.js TONE_SECTIONS). */
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
            return buildMore({ brand: brand, format: format, series: series, shelves: shelves, rest: rest });
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
  function cardName(html) {
    var m = html.match(/class="name"[^>]*>\s*([^<]+?)\s*</);
    return m ? m[1].trim() : "";
  }

  /* Adaptiv panel efter verkligt innehåll:
     - 1 produkt totalt: kortet direkt, ingen hyllrubrik/antal/länk.
     - 1 serie (flera produkter): seriens namn en gång, en karusell,
       "Visa alla" till seriens serie x format-route.
     - flera serier/grupper: en karusell per grupp, rubrik = gruppnamn.
     Produkter utan serie: försiktig familjeetikett ur verifierad
     cannabinoidvokabulär ("CBD + CBN Vapes"), annars "Fler vapes".
     Varumärket nämns bara i panelens rubrik. */
  function buildMore(o) {
    moreUid += 1;
    var fmt = o.format.label.toLowerCase();
    var base = "hz8-more-" + moreUid;
    var title = "Fler " + fmt + " från " + o.brand;
    var groups = o.shelves.map(function (sh) {
      return { name: sh.series.name, cards: sh.cards, href: HZ8.link(sh.route) };
    });
    if (o.rest.length) {
      var fam = HZ8.catalog.familyLabel(o.rest.map(function (c) { return cardName(c.html); }));
      groups.push({ name: fam ? fam + " " + o.format.label : "Fler " + fmt, cards: o.rest, href: null, rest: true });
    }
    var total = groups.reduce(function (n, g) { return n + g.cards.length; }, 0);
    var mode = total === 1 ? "single" : groups.length === 1 ? "one" : "multi";

    var section = document.createElement("section");
    section.className = "hz8-more hz8-more--" + mode;
    section.setAttribute("aria-labelledby", base + "-title");
    var peekCards = groups.map(function (g) { return g.cards[0]; }).slice(0, 3);
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
    groups.forEach(function (g, i) {
      /* Enkelläge: gruppens sanna namn (serie eller familj, t.ex.
         "CBD + CBN Vapes") som liten bildtext -- ingen hyllrubrik. Den
         neutrala reservetiketten ("Fler vapes") upprepar bara panelen och
         utelämnas. */
      if (mode === "single" && !(g.rest && /^Fler /.test(g.name))) {
        var cap = document.createElement("p");
        cap.className = "hz8-more__caption";
        cap.textContent = g.name;
        inner.appendChild(cap);
      }
      inner.appendChild(HZ8.productRail({
        id: base + "-" + i,
        className: "hz8-prail--compact hz8-more__shelf",
        title: mode === "single" ? title : g.name,
        href: mode === "single" ? null : g.href,
        bare: mode === "single",
        hideCount: true,
        cards: g.cards,
        eager: true
      }));
    });
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

  /* Headerns kontrastläge över mastheaden ägs av 05-header.js
     (TONE_SECTIONS: html.hz8-series-hub .hz8-cat-hero = mörkt läge). */

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


  /* ======================================================================
     Seriehubb, ny riktning (pilot). Återanvändbar komponent som styrs av
     SERIES_PILOTS -- aktiv bara för serier som har en post där (i den här
     rundan: Magic Sauce). Övriga seriehubbar använder HZ8.seriesHub ovan.

     Data (inget hårdkodat): seriens produkter = union av seriens egen hubb
     (alla sidor) och alla serie x format-routes i relationskartan,
     deduplicerade på kanonisk produkt-URL. Format avgörs av produktens
     egen typ i namnet ("Vape -", "Cart -", "Buds –", "Hash –" ...) och
     bara om namnet saknar typ av källans format -- Nyehandels underkate-
     gorier blandar ibland format (m-s-vapes innehåller carten, m-s-buds
     haschen). Format utan produkter visas inte. Pris, lager, bild och
     länkar kommer ur Nyehandels kort.
     ====================================================================== */
  var FORMAT_TYPES = [
    { key: "vapes", label: "Vapes", one: "Vape", test: /^vapes?\b/i, sub: "Våra vapes i {s}-serien." },
    { key: "carts", label: "Carts", one: "Cart", test: /^(cart|cartridge)s?\b/i, sub: "Våra carts i {s}-serien." },
    { key: "buds", label: "Buds", one: "Buds", test: /^(buds?|blommor)\b/i, sub: "Utvalda buds från {s}-serien." },
    { key: "hasch", label: "Hasch", one: "Hasch", test: /^(hash|hasch)\b/i, sub: "Utvalt hasch från {s}-serien." },
    { key: "prerolls", label: "Pre-rolls", one: "Pre-roll", test: /^pre-?rolls?\b/i, sub: "Våra pre-rolls i {s}-serien." }
  ];
  var SERIES_PILOTS = {
    "Magic Sauce": {
      lead: "En serie. Flera format.",
      hero: {
        dir: "series-magic-sauce-hero-2026-10/",
        wide: ["magic-sauce-hero-v4-1920x744.webp", 1920, 744],
        desk: ["magic-sauce-hero-v4-1512x664.webp", 1512, 664],
        mobile: ["magic-sauce-hero-v4-mobile-900x1802.webp", 900, 1802]
      },
      formats: ["vapes", "carts", "buds", "hasch", "prerolls"],
      /* Syskonserie hos samma tillverkare, direkt efter formatets hylla.
         Medlemskap = plattformens Serie-attribut (verifierad relation),
         inte namn/varumärke/cannabinoidkategori. Tomt -> ingen rad. */
      siblings: [{ series: "D10", format: "vapes" }],
      guide: { title: "Hitta ditt format", text: "Samma serie – olika sätt att hitta rätt.", cta: "Utforska formaten" },
      seal: "MAGIC SAUCE · HAZEY.SE · MAGIC SAUCE ·",
      script: ["Sunsets &", "Higher Horizons"]
    }
  };
  var SH_MAX_PAGES = 8;
  var SH_STOCK = "smart-filter_in-stock";
  var ARROW_SVG = '<svg class="hz8-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var LEAF_SVG = '<svg viewBox="0 0 32 32" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.05" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8.5 25.5C9.4 15.6 15.2 8.4 24.6 5.6c-.6 9.6-6.4 16.7-16.1 19.9z"/><path d="M8.5 25.5L20.4 11.2M12.4 20.6l-3.1-1.3M14.8 17.8l-3.4-1.1M17.2 14.9l-3.2-.8M14.6 20.4l3.4.4M17 17.6l3.2.2"/><path d="M6.4 27.6l2.1-2.1"/></svg>';

  function withParam(href, kv) { return href + (href.indexOf("?") === -1 ? "?" : "&") + kv; }
  /* En källa i sin helhet (Nyehandels paginering). Misslyckas -> null. */
  function allPages(route) {
    return Promise.all([HZ8.fetchPage(route, HZ8.categoryInfo), HZ8.fetchPage(route, HZ8.categoryCards)]).then(function (first) {
      var total = first[0].count, page1 = first[1];
      if (!total || !page1.length || total <= page1.length) return page1;
      var pages = Math.min(SH_MAX_PAGES, Math.ceil(total / page1.length));
      var jobs = [];
      for (var p = 2; p <= pages; p += 1) jobs.push(HZ8.fetchPage(withParam(route, "page=" + p), HZ8.categoryCards));
      return Promise.all(jobs).then(function (rest) { return page1.concat.apply(page1, rest); });
    }).catch(function () { return null; });
  }
  function decode(t) { return String(t || "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim(); }
  function typeOf(name) {
    var n = decode(name);
    for (var i = 0; i < FORMAT_TYPES.length; i++) if (FORMAT_TYPES[i].test.test(n)) return FORMAT_TYPES[i].key;
    return "";
  }
  function fmtDef(key) { return FORMAT_TYPES.filter(function (f) { return f.key === key; })[0]; }
  /* Delas med serie x format-mallen (80-category.js): produkttyp ur
     produktnamnet och seriens godkända formatrad ("Våra vapes i
     {s}-serien.") -- en källa, ingen andra lista. */
  HZ8.cardTypeOf = typeOf;
  HZ8.formatSub = function (key, seriesName) { var f = fmtDef(key); return f ? f.sub.replace("{s}", seriesName) : ""; };
  function sizeOf(name) {
    var m = decode(name).match(/(\d+(?:[.,]\d+)?)\s*(ml|g|gram)\b/i);
    return m ? m[1] + " " + (/^g/i.test(m[2]) ? "g" : "ml") : "";
  }
  function joinSv(list) { return list.length < 2 ? list.join("") : list.slice(0, -1).join(", ") + " och " + list[list.length - 1]; }

  /* Seriens produkter per format. */
  function seriesUnion(series) {
    var sources = [];
    if (series.hub) sources.push({ href: series.hub, key: "" });
    Object.keys(series.routes).forEach(function (k) { sources.push({ href: series.routes[k], key: k }); });
    return Promise.all(sources.map(function (s) { return allPages(s.href); })).then(function (lists) {
      var seen = {}, byFormat = {}, hubSet = null, failed = 0;
      lists.forEach(function (cards, i) {
        if (!cards) { failed += 1; return; }
        if (sources[i].key === "") hubSet = {};
        cards.forEach(function (c) {
          var path = productPath(c.html);
          if (!validCard(c)) return;
          if (hubSet && sources[i].key === "") hubSet[path] = true;
          if (seen[path]) return;
          var key = typeOf(cardName(c.html)) || sources[i].key;
          if (!key) return;
          seen[path] = true;
          (byFormat[key] = byFormat[key] || []).push(c);
        });
      });
      return { byFormat: byFormat, paths: seen, hubSet: hubSet, failed: failed, total: Object.keys(seen).length, sources: sources.length };
    });
  }

  /* Syskonserie (t.ex. D10) hos seriens egen tillverkare, i ett format.
     Verifierat medlemskap = formatets sida filtrerad på plattformens
     Serie-attribut (samma mekanism som seriens egna carts/hasch-routes).
     Dessutom: samma varumärke som seriens egna produkter i formatet, rätt
     produkttyp, och inget som redan finns i serien. Inga träffar -> null
     (raden döljs). En cannabinoidkategori som 10-oh-thc-vapes räknas inte. */
  function siblingSeries(sib, own, inSeries) {
    var format = HZ8.catalog.formatByKey(sib.format);
    var counts = {};
    own.forEach(function (c) { var b = cardBrand(c.html); if (b && !HZ8.catalog.isHouseBrand(b)) counts[b] = (counts[b] || 0) + 1; });
    var brand = Object.keys(counts).sort(function (x, y) { return counts[y] - counts[x]; })[0];
    if (!format || !brand) return Promise.resolve(null);
    var route = withParam(format.href, "filters=" + encodeURIComponent("Serie_" + sib.series));
    return allPages(route).then(function (list) {
      var seen = {};
      var cards = (list || []).filter(function (c) {
        var p = productPath(c.html);
        if (!validCard(c) || inSeries[p] || seen[p]) return false;
        seen[p] = true;
        return cardBrand(c.html) === brand && (typeOf(cardName(c.html)) || sib.format) === sib.format;
      });
      return cards.length ? { brand: brand, format: format, cards: cards, series: [sib.series] } : null;
    });
  }

  function assetUrl(file) { return (window.HZ8_ASSET_BASE || "") + file; }

  function shHero(root, series, cfg, union, formats) {
    var h = cfg.hero;
    var hero = document.createElement("section");
    hero.className = "hz8-sh-hero";
    hero.setAttribute("data-hz8-tone", "light");
    hero.setAttribute("aria-labelledby", "hz8-sh-h1");
    hero.innerHTML =
      '<picture class="hz8-sh-hero__art" aria-hidden="true">' +
        '<source media="(min-width: 1600px)" srcset="' + HZ8.esc(assetUrl(h.dir + h.wide[0])) + '" width="' + h.wide[1] + '" height="' + h.wide[2] + '">' +
        '<source media="(min-width: 768px)" srcset="' + HZ8.esc(assetUrl(h.dir + h.desk[0])) + '" width="' + h.desk[1] + '" height="' + h.desk[2] + '">' +
        '<img src="' + HZ8.esc(assetUrl(h.dir + h.mobile[0])) + '" alt="" width="' + h.mobile[1] + '" height="' + h.mobile[2] + '" decoding="async" fetchpriority="high">' +
      "</picture>" +
      '<div class="hz8-sh-hero__plaster" aria-hidden="true"></div>' +
      '<div class="hz8-sh-hero__scrim" aria-hidden="true"></div>' +
      '<div class="hz8-sh-hero__inner">' +
        '<div class="hz8-sh-hero__copy"><p class="hz8-sh-hero__lead"></p><p class="hz8-sh-hero__count" aria-live="polite"></p></div>' +
        '<aside class="hz8-sh-guide" aria-labelledby="hz8-sh-guide-title"><span class="hz8-sh-guide__emblem" aria-hidden="true">' + LEAF_SVG + "</span>" +
          '<div class="hz8-sh-guide__body"><p class="hz8-sh-guide__title" id="hz8-sh-guide-title">' + HZ8.esc(cfg.guide.title) + "</p>" +
          '<p class="hz8-sh-guide__text">' + HZ8.esc(cfg.guide.text) + "</p>" +
          '<a class="hz8-sh-cta" href="#hz8-sh-nav"><span>' + HZ8.esc(cfg.guide.cta) + "</span>" + ARROW_SVG + "</a></div></aside>" +
        '<div class="hz8-sh-decor" aria-hidden="true">' +
          '<svg class="hz8-sh-decor__seal" viewBox="0 0 120 120" focusable="false"><defs><path id="hz8-sh-ring" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0"/></defs>' +
            '<circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" stroke-width=".8" opacity=".55"/>' +
            '<text font-size="9.2" letter-spacing="2.4" fill="currentColor"><textPath href="#hz8-sh-ring" startOffset="2%">' + HZ8.esc(cfg.seal) + "</textPath></text>" +
            '<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M46 80c4-20 14-36 30-44-2 18-12 34-30 44z"/><path d="M46 80l22-34M55 66l-6-4M61 57l-7-3M65 50l-6-1"/></g></svg>' +
          '<p class="hz8-sh-decor__script">' + cfg.script.map(HZ8.esc).join("<br>") + "</p></div>" +
      "</div>";
    var copy = hero.querySelector(".hz8-sh-hero__copy");
    /* Brödsmulor: Nyehandels egna länkar (klon -- originalet i plattformens
       DOM rörs inte, döljs bara i piloten). */
    var crumbs = document.querySelector(".designer-breadcrumbs nav.breadcrumb");
    if (crumbs) {
      var c = crumbs.cloneNode(true);
      c.removeAttribute("id");
      c.querySelectorAll("[id]").forEach(function (e) { e.removeAttribute("id"); });
      copy.insertBefore(c, copy.firstChild);
    }
    /* Sidans enda H1 (kategorins egen, serverrenderade) flyttas in. */
    var h1 = root.querySelector("article.category-description h1");
    if (h1) { h1.id = "hz8-sh-h1"; copy.insertBefore(h1, copy.querySelector(".hz8-sh-hero__lead")); }
    hero.querySelector(".hz8-sh-hero__lead").textContent = cfg.lead;
    return hero;
  }

  function shNavHtml(id, label, extraClass) {
    return '<nav class="hz8-sh-nav' + (extraClass ? " " + extraClass : "") + '" id="' + id + '" aria-label="' + HZ8.esc(label) + '"><ul class="hz8-sh-nav__list" role="list"></ul></nav>';
  }
  function navItems(list, items) {
    list.innerHTML = items.map(function (it) {
      return '<li><a class="hz8-sh-chip" href="#' + it.id + '" data-sh="' + it.key + '"' + (it.key === "all" ? ' aria-current="true"' : "") + '>' + HZ8.esc(it.label) +
        '<span class="hz8-sh-chip__n" aria-hidden="true">' + it.n + '</span><span class="hz8-visually-hidden">, ' + HZ8.esc(HZ8.countLabel(it.n)) + "</span></a></li>";
    }).join("");
  }

  /* Kortens egenskapschips (typ + volym/vikt ur namnet) och lagerrad
     (Nyehandels I lager-filter på seriens hubb). Lagerraden finns från
     start med reserverad höjd -- inget skift när datan kommer. */
  function decorateCards(scope, stock) {
    scope.querySelectorAll(".product-card").forEach(function (card) {
      var details = card.querySelector(".details"), wrapper = card.querySelector(".details-wrapper"), nameEl = card.querySelector(".name");
      if (!details || !wrapper) return;
      if (nameEl && nameEl.textContent.indexOf("&amp;") !== -1) nameEl.textContent = decode(nameEl.textContent);
      card.querySelectorAll("img[alt], img[title], [aria-label]").forEach(function (el) { ["alt", "title", "aria-label"].forEach(function (a) { var v = el.getAttribute(a); if (v && v.indexOf("&amp;") !== -1) el.setAttribute(a, decode(v)); }); });
      var name = nameEl ? nameEl.textContent : "";
      if (!details.querySelector(".hz8-pcardchips")) {
        var f = fmtDef(typeOf(name)), size = sizeOf(name);
        var chips = [f && f.one, size].filter(Boolean);
        var row = document.createElement("p");
        row.className = "hz8-pcardchips";
        row.innerHTML = chips.map(function (t) { return '<span class="hz8-pcardchip">' + HZ8.esc(t) + "</span>"; }).join("");
        details.appendChild(row);
      }
      /* Trasig produktbild: neutral bildbrunn (samma mått, inget skift). */
      var img = card.querySelector(".product-card__image img");
      if (img && !img.hasAttribute("data-hz8-watch")) {
        img.setAttribute("data-hz8-watch", "");
        var broken = function () { var w = img.closest(".product-card__image"); if (w) w.classList.add("hz8-img-broken"); };
        img.addEventListener("error", broken);
        if (img.complete && !img.naturalWidth && img.getAttribute("src")) broken();
      }
      var stars = card.querySelector(".rating .nh-stars[title]");
      if (stars && !stars.parentNode.querySelector(".hz8-prate")) {
        var avg = parseFloat(stars.getAttribute("title"));
        if (avg > 0) { var rate = document.createElement("span"); rate.className = "hz8-prate"; rate.textContent = avg.toFixed(1).replace(".", ","); stars.insertAdjacentElement("afterend", rate); }
      }
      var st = details.querySelector(".hz8-pstock");
      if (!st) { st = document.createElement("p"); st.className = "hz8-pstock is-pending"; st.setAttribute("aria-hidden", "true"); details.appendChild(st); }
      if (!stock) return;
      var a = card.querySelector("a.product-card__image[href], .details a[href]");
      var path = a ? HZ8.path(a.getAttribute("href")).split("?")[0].replace(/\/\d+$/, "") : "";
      /* Utanför seriehubbens lagerkälla (t.ex. tillverkarens övriga):
         ingen gissning -- raden tas bort i stället för att stå tom. */
      if (!stock.known[path]) { st.hidden = true; return; }
      var inStock = !!stock.in[path];
      st.classList.remove("is-pending"); st.removeAttribute("aria-hidden");
      st.textContent = inStock ? "I lager" : "Slutsåld";
      st.classList.toggle("is-out", !inStock);
      card.classList.toggle("hz8-is-soldout", !inStock);
      if (!inStock && !wrapper.querySelector(".hz8-psold")) {
        var sold = document.createElement("span");
        sold.className = "hz8-psold"; sold.textContent = "Slutsåld";
        sold.setAttribute("role", "button"); sold.setAttribute("aria-disabled", "true");
        sold.setAttribute("aria-label", "Slutsåld: " + name.trim());
        wrapper.appendChild(sold);
      }
    });
  }

  /* Hyllans rubrik: rälsens h2 med seriens namn; disclosure-rälsen får
     h4 (under disclosurens h3). */
  function retitle(rail, tag) {
    var t = rail.querySelector(".hz8-prail__title");
    if (!t || t.tagName.toLowerCase() === tag) return;
    var n = document.createElement(tag);
    Array.prototype.forEach.call(t.attributes, function (a) { n.setAttribute(a.name, a.value); });
    n.innerHTML = t.innerHTML;
    t.parentNode.replaceChild(n, t);
  }

  var shUid = 0;
  function shMore(extra, series, stock) {
    shUid += 1;
    var base = "hz8-sh-more-" + shUid;
    var fmt = extra.format.label.toLowerCase();
    var title = "Fler " + fmt + " från " + extra.brand;
    var support = "Upptäck " + joinSv(extra.series) + "-serien från " + extra.brand + ".";
    /* Små seriemärken (t.ex. D10) bara för verkliga serier i datan. */
    var tags = extra.series.slice(0, 2).map(function (n) { return '<span class="hz8-sh-more__tag">' + HZ8.esc(n) + "</span>"; }).join("");
    var sec = document.createElement("section");
    sec.className = "hz8-sh-more";
    sec.setAttribute("aria-labelledby", base + "-t");
    /* Vänsteridentitet: en riktig produktbild ur raden (ingen logotyp
       finns verifierad). */
    var peek = extra.cards.slice(0, 1).map(function (c) { var s = firstImage(c.html); return s ? '<span class="hz8-sh-more__peek-i"><img src="' + HZ8.esc(s) + '" alt="" width="64" height="64" loading="lazy" decoding="async"></span>' : ""; }).join("");
    sec.innerHTML =
      '<h3 class="hz8-sh-more__h"><button type="button" class="hz8-sh-more__btn" aria-expanded="false" aria-controls="' + base + '" aria-labelledby="' + base + '-t" aria-describedby="' + base + '-s">' +
        (peek ? '<span class="hz8-sh-more__peek" aria-hidden="true">' + peek + "</span>" : "") +
        '<span class="hz8-sh-more__txt"><span class="hz8-sh-more__row"><span class="hz8-sh-more__t" id="' + base + '-t">' + HZ8.esc(title) + "</span>" + tags + "</span>" +
          '<span class="hz8-sh-more__s" id="' + base + '-s">' + HZ8.esc(support) + '<span class="hz8-visually-hidden"> ' + HZ8.esc(HZ8.countLabel(extra.cards.length)) + ".</span></span></span>" +
        '<span class="hz8-sh-more__chev" aria-hidden="true">' + HZ8.icon("chevron") + "</span></button></h3>" +
      '<div class="hz8-sh-more__region" id="' + base + '" role="region" aria-labelledby="' + base + '-t" hidden></div>';
    var btn = sec.querySelector("button"), region = sec.querySelector(".hz8-sh-more__region"), built = false;
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") !== "true";
      btn.setAttribute("aria-expanded", String(open));
      sec.classList.toggle("is-open", open);
      if (open && !built) {
        built = true;
        var rail = HZ8.productRail({ id: base + "-rail", className: "hz8-sh-shelf hz8-sh-shelf--sub", title: extra.brand + " " + extra.format.label, bare: true, hideCount: true, cards: extra.cards, eager: true });
        retitle(rail, "h4");
        region.appendChild(rail);
        decorateCards(region, stock());
      }
      region.hidden = !open;
    });
    return sec;
  }

  function overlayOpen() {
    return !!(document.body.classList.contains("hz8-scroll-locked") ||
      document.querySelector("#hz8MobileDrawer.is-open, .hz8-msearch.is-open, #cart-side-wrap.is-active, .upselling-sidebar__container.is-active, .hz8-choice, .hz8-sheet.is-open"));
  }

  /* Djuplänk till ett format: asynkront innehåll ovanför målet (bilder,
     syskonrader) ändrar höjd efter första scrollen, så målet hamnade för
     högt -- under en synlig header. Hubbens faktiska layout bevakas
     (ResizeObserver) och målet justeras till sin scroll-margin-top
     (headerreserv + luft) vid varje storleksändring. Avslutas när layouten
     varit stilla en kort stund eller direkt när besökaren själv scrollar
     (hjul, touchdrag, tangentbord) -- ett klick, t.ex. på cookiebannern,
     avbryter inte. Taket är bara en säkerhetsspärr. */
  function holdAnchor(target) {
    var area = target.closest(".hz8-sh") || document.body;
    var done = false, quiet = 0, cap = 0, raf = 0, ro = null;
    var INPUT = ["wheel", "touchmove", "keydown"];
    function align() {
      raf = 0;
      if (done) return;
      var want = parseFloat(window.getComputedStyle(target).scrollMarginTop) || 0;
      var delta = target.getBoundingClientRect().top - want;
      if (Math.abs(delta) > 1) window.scrollTo({ top: window.scrollY + delta, behavior: "instant" });
    }
    function stop() {
      if (done) return;
      done = true;
      if (ro) ro.disconnect();
      window.clearTimeout(quiet); window.clearTimeout(cap);
      INPUT.forEach(function (ev) { window.removeEventListener(ev, stop, true); });
    }
    function settle() { window.clearTimeout(quiet); quiet = window.setTimeout(stop, 600); }
    INPUT.forEach(function (ev) { window.addEventListener(ev, stop, { capture: true, passive: true }); });
    target.scrollIntoView({ block: "start", behavior: "instant" });
    if ("ResizeObserver" in window) {
      ro = new ResizeObserver(function () { if (!raf) raf = window.requestAnimationFrame(align); settle(); });
      ro.observe(area);
    }
    settle();
    cap = window.setTimeout(stop, 8000);
  }

  function seriesHubPilot(root, ctx, cfg) {
    var series = ctx.series;
    var html = document.documentElement;
    html.classList.add("hz8-sh-pilot");
    HZ8.cardLabels = {
      add: "Lägg till", addShort: "Lägg till", variants: "Välj", variantsShort: "Välj", variantsAria: "Välj alternativ",
      addIcon: '<svg class="hz8-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 8h12l-1 12H7z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/></svg>',
      variantsIcon: ""
    };
    if (HZ8.relabelCards) HZ8.relabelCards();

    var wrap = document.createElement("div");
    wrap.className = "hz8-sh";
    var hero = shHero(root, series, cfg);
    wrap.appendChild(hero);
    /* Formatraden finns från start (reserverad höjd); chippen fylls när
       datan finns. */
    wrap.insertAdjacentHTML("beforeend", shNavHtml("hz8-sh-nav", series.name + " efter format"));
    var nav = wrap.querySelector("#hz8-sh-nav");
    var shelves = document.createElement("div");
    shelves.className = "hz8-sh-shelves is-loading";
    shelves.id = "hz8-sh-shelves";
    shelves.setAttribute("aria-busy", "true");
    wrap.appendChild(shelves);
    /* Övriga serier (befintlig serienavigering) ligger kvar efter
       hyllorna. Formathyllorna är hubbens kompletta sortiment, så
       Nyehandels dubblerade grid förblir dold och ingen "Visa hela
       sortimentet"-knapp skapas. Den aktuella serien visas som "här är
       du" utan länk tillbaka till samma sida. */
    var seriesRail = root.querySelector(".hz8-cat-rails .hz8-rail--series");
    var after = document.createElement("div");
    after.className = "hz8-sh-after";
    if (seriesRail) {
      after.appendChild(seriesRail);
      Array.prototype.forEach.call(seriesRail.querySelectorAll("a.hz8-rail__item[href]"), function (a) {
        if (HZ8.path(a.getAttribute("href")).split("?")[0].replace(/\/$/, "") !== location.pathname.replace(/\/$/, "")) return;
        /* Samma element (80-category.js fyller bild och antal i det
           asynkront); utan href är det varken länk eller tabbstopp. */
        a.removeAttribute("href");
        a.setAttribute("aria-current", "page");
      });
    }
    wrap.appendChild(after);
    root.insertBefore(wrap, root.firstChild);

    var dock = document.createElement("div");
    dock.className = "hz8-sh-dock";
    dock.innerHTML = shNavHtml("hz8-sh-dock", "Snabbval: " + series.name + " efter format", "hz8-sh-nav--dock");
    dock.setAttribute("aria-hidden", "true");
    dock.inert = true;
    document.body.appendChild(dock);

    /* Putsens kant följer textkolumnens verkliga högerkant (mätt), inte
       fotots crop. */
    var copy = hero.querySelector(".hz8-sh-hero__copy");
    function syncPlaster() {
      var hr = hero.getBoundingClientRect();
      var right = 0;
      copy.querySelectorAll(":scope > *").forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (el.offsetParent && r.width) right = Math.max(right, r.left + (el.tagName === "H1" ? Math.min(r.width, el.scrollWidth) : r.width));
      });
      /* H1:ans text kan vara smalare än blocket: mät textens egen bredd. */
      var h1 = copy.querySelector("h1");
      if (h1) { var rg = document.createRange(); rg.selectNodeContents(h1); var tr = rg.getBoundingClientRect(); right = Math.max(right, tr.right); }
      var lead = copy.querySelector(".hz8-sh-hero__lead");
      if (lead) { var rg2 = document.createRange(); rg2.selectNodeContents(lead); right = Math.max(right, rg2.getBoundingClientRect().right); }
      hero.style.setProperty("--sh-pe", Math.round(right - hr.left) + "px");
      /* Samma kant relativt den centrerade innerytan (dekor och quizkort
         positioneras där; --sh-pe gäller putsen som täcker hela heron). */
      var inner = hero.querySelector(".hz8-sh-hero__inner");
      if (inner) hero.style.setProperty("--sh-pi", Math.round(right - inner.getBoundingClientRect().left) + "px");
      /* Säker zon under den delade headern: headerns underkant i vila + luft. */
      var m = document.querySelector("#store-header .main");
      if (m && window.scrollY < 4) {
        var gap = window.matchMedia("(max-width: 767px)").matches ? 16 : 24;
        hero.style.setProperty("--sh-top", Math.round(m.getBoundingClientRect().bottom - hr.top + gap) + "px");
      }
    }
    syncPlaster();
    window.requestAnimationFrame(syncPlaster);
    window.addEventListener("load", syncPlaster);
    if ("ResizeObserver" in window) new ResizeObserver(function () { window.requestAnimationFrame(syncPlaster); }).observe(copy);
    window.addEventListener("resize", function () { window.requestAnimationFrame(syncPlaster); }, { passive: true });

    var stock = null;
    seriesUnion(series).then(function (u) {
      shelves.removeAttribute("aria-busy");
      shelves.classList.remove("is-loading");
      var keys = cfg.formats.filter(function (k) { return (u.byFormat[k] || []).length; });
      var count = hero.querySelector(".hz8-sh-hero__count");
      if (!keys.length) {
        shelves.innerHTML = '<p class="hz8-state hz8-state--error">Produkterna kunde inte laddas just nu. <a href="' + HZ8.esc(HZ8.link(series.hub || location.pathname)) + '">Ladda om sidan</a></p>';
        nav.hidden = true;
        return;
      }
      count.textContent = HZ8.countLabel(u.total);
      var labels = keys.map(function (k) { return fmtDef(k).label.toLowerCase(); });
      hero.querySelector(".hz8-sh-hero__lead").textContent = cfg.lead + " Utforska " + joinSv(labels) + ".";
      var slug = (series.hub ? HZ8.path(series.hub).split("/").pop() : series.name.toLowerCase().replace(/\s+/g, "-"));
      var items = [{ key: "all", id: "hz8-sh-shelves", label: "Alla", n: u.total }].concat(keys.map(function (k) { return { key: k, id: slug + "-" + k, label: fmtDef(k).label, n: u.byFormat[k].length }; }));
      navItems(nav.querySelector("ul"), items);
      /* Dockan: bara formaten (sidans egen rad har Alla). */
      navItems(dock.querySelector("ul"), items.filter(function (it) { return it.key !== "all"; }));
      keys.forEach(function (k) {
        var f = fmtDef(k), route = series.routes[k];
        var rail = HZ8.productRail({
          id: slug + "-" + k,
          className: "hz8-sh-shelf",
          title: series.name + " " + f.label,
          href: route ? HZ8.link(route) : null,
          cards: u.byFormat[k],
          limit: 30,
          eager: true
        });
        rail.setAttribute("data-sh", k);
        var t = rail.querySelector(".hz8-prail__title");
        if (t && f.sub) t.insertAdjacentHTML("afterend", '<p class="hz8-sh-shelf__sub">' + HZ8.esc(f.sub.replace("{s}", series.name)) + "</p>");
        shelves.appendChild(rail);
        (cfg.siblings || []).filter(function (sb) { return sb.format === k; }).forEach(function (sb) {
          var slot = document.createElement("div");
          slot.className = "hz8-sh-more-slot";
          shelves.appendChild(slot);
          siblingSeries(sb, u.byFormat[k], u.paths).then(function (extra) {
            if (extra) slot.appendChild(shMore(extra, series, function () { return stock; }));
            else slot.remove();
          }).catch(function () { slot.remove(); });
        });
      });
      decorateCards(shelves, null);
      /* Lager: Nyehandels I lager-filter på seriens hubb (alla sidor). */
      if (series.hub && u.hubSet) {
        allPages(withParam(series.hub, "filters=" + SH_STOCK)).then(function (cards) {
          if (!cards) return;
          stock = { known: u.hubSet, in: {} };
          cards.forEach(function (c) { stock.in[productPath(c.html)] = true; });
          decorateCards(wrap, stock);
        });
      }
      HZ8.watch(function () { decorateCards(wrap, stock); });
      bindNav(items);
    }).catch(function () {
      shelves.removeAttribute("aria-busy");
      shelves.classList.remove("is-loading");
      shelves.innerHTML = '<p class="hz8-state hz8-state--error">Produkterna kunde inte laddas just nu.</p>';
    });

    /* ---- Ankarnavigering, scrollspy och mobil dock ---- */
    function bindNav(items) {
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
      var mobile = window.matchMedia("(max-width: 767px)");
      var active = "all";
      function setActive(k) {
        if (k === active) return;
        active = k;
        [nav, dock].forEach(function (n) {
          n.querySelectorAll(".hz8-sh-chip").forEach(function (a) {
            if (a.getAttribute("data-sh") === k) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
          });
        });
        /* Valt chip in i dockans synliga del -- bara vågrätt. */
        var list = dock.querySelector("ul"), chip = dock.querySelector('[data-sh="' + k + '"]');
        if (list && chip) {
          var li = chip.parentNode, left = li.offsetLeft - (list.clientWidth - li.offsetWidth) / 2;
          list.scrollTo({ left: Math.max(0, left), behavior: reduce.matches ? "auto" : "smooth" });
        }
      }
      wrap.addEventListener("click", go);
      dock.addEventListener("click", go);
      function go(e) {
        var a = e.target.closest && e.target.closest('a[href^="#hz8-sh-"], a.hz8-sh-chip');
        if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
        var id = a.getAttribute("href").slice(1), target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        if (location.hash !== "#" + id) history.pushState(null, "", "#" + id);
        target.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth", block: "start" });
        var focusEl = target.querySelector(".hz8-prail__title") || (target.id === "hz8-sh-nav" ? target.querySelector("a") : target);
        if (focusEl) { if (!focusEl.hasAttribute("tabindex") && focusEl.tagName !== "A") focusEl.setAttribute("tabindex", "-1"); focusEl.focus({ preventScroll: true }); }
        var k = a.getAttribute("data-sh"); if (k) setActive(k);
      }
      /* Scrollspy: sista hyllan vars topp passerat en mätlinje ~40 % ned i
         vyn; ovanför första hyllan (eller om hela sidan ryms) = Alla.
         Beräknas från läget vid varje scroll -- en IntersectionObserver
         lämnade fel format aktivt när linjen låg mellan två hyllor. */
      var rails = Array.prototype.slice.call(shelves.querySelectorAll(":scope > .hz8-sh-shelf"));
      function spy() {
        if (document.documentElement.scrollHeight <= window.innerHeight + 2) { setActive("all"); return; }
        var line = window.innerHeight * .4, cur = "all";
        rails.forEach(function (r) { if (r.getBoundingClientRect().top <= line) cur = r.getAttribute("data-sh"); });
        setActive(cur);
      }
      var spyRaf = 0;
      window.addEventListener("scroll", function () { if (!spyRaf) spyRaf = window.requestAnimationFrame(function () { spyRaf = 0; spy(); }); }, { passive: true });
      window.addEventListener("resize", spy, { passive: true });
      spy();

      /* Dock: bara mobil, först när hela originalraden lämnat vyn uppåt,
         aldrig samtidigt med den, inte bakom overlays. Den lämnar så fort
         hubbens slut (efter serieraden) kommer in i vyn, så den aldrig
         ligger över kundservice eller footern. */
      var navGone = false, nearFoot = false, pastEnd = false;
      function syncDock() {
        var show = mobile.matches && navGone && !nearFoot && !pastEnd && !overlayOpen();
        if (dock.classList.contains("is-on") === show) return;
        dock.classList.toggle("is-on", show);
        dock.setAttribute("aria-hidden", show ? "false" : "true");
        dock.inert = !show;
        html.classList.toggle("hz8-sh-dock-on", show);
      }
      new IntersectionObserver(function (en) { var e = en[0]; navGone = !e.isIntersecting && e.boundingClientRect.bottom <= 0; syncDock(); }, { threshold: 0 }).observe(nav);
      var end = document.createElement("div");
      end.className = "hz8-sh-end";
      end.setAttribute("aria-hidden", "true");
      wrap.appendChild(end);
      new IntersectionObserver(function (en) { var e = en[0]; pastEnd = e.isIntersecting || e.boundingClientRect.top < 0; syncDock(); }, { threshold: 0 }).observe(end);
      var foot = document.querySelector(".hz8-footer, footer.page-footer");
      if (foot) new IntersectionObserver(function (en) { nearFoot = en[0].isIntersecting; syncDock(); }, { rootMargin: "0px 0px 40px 0px", threshold: 0 }).observe(foot);
      var raf = 0;
      new MutationObserver(function () { if (!raf) raf = window.requestAnimationFrame(function () { raf = 0; syncDock(); }); })
        .observe(document.body, { attributes: true, subtree: true, attributeFilter: ["class", "aria-modal", "hidden"] });
      mobile.addEventListener("change", syncDock);
      if (location.hash && document.getElementById(location.hash.slice(1))) window.setTimeout(function () { holdAnchor(document.getElementById(location.hash.slice(1))); }, 300);
      /* Efter webbläsarens egen scrollåterställning (annars skrivs ankaret
         över vid framåt/bakåt). */
      window.addEventListener("popstate", function () { window.setTimeout(function () { var t = location.hash && document.getElementById(location.hash.slice(1)); if (t) t.scrollIntoView({ block: "start" }); }, 60); });
    }
  }

  HZ8.seriesHub = function (root, ctx) {
    var series = ctx.series;
    if (SERIES_PILOTS[series.name]) { seriesHubPilot(root, ctx, SERIES_PILOTS[series.name]); return; }
    var map = HZ8.catalog.build();
    document.documentElement.classList.add("hz8-series-hub");
    /* Masthead: kategoritoppen (80-category.js) i seriens mörka uttryck;
       accentlinje som eget dekorativt element. */
    var masthead = root.querySelector(".hz8-cat-hero");
    var rule = document.createElement("span");
    rule.className = "hz8-masthead__rule";
    rule.setAttribute("aria-hidden", "true");
    root.appendChild(rule);
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
