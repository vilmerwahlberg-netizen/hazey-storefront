/* Kategorisidor (riktning F, preview/hazey-master-locked-v2/category):
   kategoritopp med bild, format- och serienavigation, filterdocka,
   "Populärast här", produktgrid, vägledningsband och kategorins egen
   SEO-text längst ned.

   All data är Nyehandels egen:
   - H1, brödsmulor, beskrivning, produkter, filter, sortering och
     paginering är de native elementen (ingen DOM-flytt; ordningen
     sätts med CSS-grid i 80-category.css).
   - Format-/serielänkar kommer från headerns verifierade kategorikarta
     (HZ8.navContent). Antal och bild hämtas från respektive riktig
     kategorisida; en länk med 0 produkter visas inte.
   - "Populärast i ..." = kategorins fem första produkter i Nyehandels
     egen sortering "Mest populära" (?sort=popular). Visas bara när
     kategorin har minst åtta produkter och ingen filtrering är aktiv.
   Taxonomin hålls isär: rälsen visar exakt de grupprubriker headern
   redan använder (Serier / Format / Cannabinoider), aldrig ihopslagna. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  var MIN_FOR_POPULAR = 8; // mindre kategorier visar redan allt i gridet
  var MAX_POPULAR = 5;

  function groupForPath(path) {
    var content = HZ8.navContent || {};
    var keys = Object.keys(content);
    for (var i = 0; i < keys.length; i += 1) {
      var group = content[keys[i]];
      var hrefs = [group.cta && group.cta.href];
      (group.groups || []).forEach(function (g) {
        (g.links || []).forEach(function (l) { hrefs.push(l.href); });
      });
      for (var j = 0; j < hrefs.length; j += 1) {
        if (hrefs[j] && HZ8.path(hrefs[j]).split("?")[0] === path) return { key: keys[i], group: group };
      }
    }
    return null;
  }

  function groupLabel(key) {
    var cats = HZ8.navCategories || [];
    var content = HZ8.navContent || {};
    var i = Object.keys(content).indexOf(key);
    var dropdowns = cats.filter(function (c) { return c.dropdown; });
    return dropdowns[i] ? dropdowns[i].label : "";
  }

  function railItem(link, currentFull, variant) {
    var isCurrent = HZ8.path(link.href) === currentFull ||
      (HZ8.path(link.href).indexOf("?") === -1 && HZ8.path(link.href) === currentFull.split("?")[0] && currentFull.indexOf("?") === -1);
    var a = document.createElement("a");
    a.className = "hz8-rail__item hz8-rail__item--" + variant + " is-loading";
    a.href = HZ8.link(link.href);
    if (isCurrent) a.setAttribute("aria-current", "page");
    a.innerHTML = '<span class="hz8-rail__media" aria-hidden="true"></span>' +
      '<span class="hz8-rail__text"><span class="hz8-rail__label">' + HZ8.esc(link.label) + '</span>' +
      '<span class="hz8-rail__count"></span></span>';
    HZ8.fetchPage(link.href, HZ8.categoryInfo).then(function (info) {
      a.classList.remove("is-loading");
      if (info.count === 0) { a.remove(); return; }
      if (info.count != null) a.querySelector(".hz8-rail__count").textContent = info.count + (info.count === 1 ? " produkt" : " produkter");
      if (info.image) {
        var img = document.createElement("img");
        img.src = info.image; img.alt = ""; img.loading = "lazy"; img.decoding = "async";
        img.width = 160; img.height = 160;
        a.querySelector(".hz8-rail__media").appendChild(img);
      }
    }).catch(function () { a.classList.remove("is-loading"); });
    return a;
  }

  function buildRails(found) {
    var current = HZ8.path(location.href);
    var wrap = document.createElement("div");
    wrap.className = "hz8-cat-rails";
    wrap.setAttribute("data-hz8-cat", "rails");
    var groups = found.group.groups || [];
    /* Format-gruppen först (riktning F: formatkort överst), därefter
       serier/cannabinoider som en smalare räls. "Alla ..." (grupp-CTA)
       leder formaträlsen. */
    var format = groups.filter(function (g) { return /format/i.test(g.heading); })[0];
    var others = groups.filter(function (g) { return g !== format; });
    function section(heading, links, variant) {
      var usable = links.filter(function (l) { return !!l.href; });
      if (usable.length < 2) return;
      var nav = document.createElement("nav");
      nav.className = "hz8-rail hz8-rail--" + variant;
      nav.setAttribute("aria-label", heading);
      nav.innerHTML = '<p class="hz8-rail__heading">' + HZ8.esc(heading) + "</p>";
      var list = document.createElement("div");
      list.className = "hz8-rail__list";
      usable.forEach(function (l) { list.appendChild(railItem(l, current, variant)); });
      nav.appendChild(list);
      wrap.appendChild(nav);
    }
    var formatLinks = [];
    if (found.group.cta) formatLinks.push({ label: found.group.cta.label, href: found.group.cta.href });
    if (format) formatLinks = formatLinks.concat(format.links || []);
    section("Format", formatLinks, "format");
    others.forEach(function (g) {
      var heading = g.heading.charAt(0) + g.heading.slice(1).toLowerCase();
      section(heading, g.links || [], "series");
    });
    return wrap.children.length ? wrap : null;
  }


  /* ======================================================================
     Format- och serienavigation ur den centrala relationskartan
     (HZ8.catalog, 06-catalog-map.js). Tre sidtyper:
     - format ("Alla Vapes"): alla format + serierna som finns i formatet
     - combo  (serie x format, "THCA Vapes"): seriens format (frostade
       om de saknas i serien men finns i andra) + serier i samma format
     - series-hub ("Magic Sauce"): seriens format som lokala hopp till
       produktraderna + alla serier
     Antal och bilder läses ur respektive riktig sida; 0 produkter = dold.
     ====================================================================== */
  function catalogCount(href) {
    return HZ8.fetchPage(href, HZ8.categoryInfo).then(function (info) { return info.count; }).catch(function () { return null; });
  }

  function navSection(heading, variant) {
    var nav = document.createElement("nav");
    nav.className = "hz8-rail hz8-rail--" + variant;
    nav.setAttribute("aria-label", heading);
    nav.innerHTML = '<p class="hz8-rail__heading">' + HZ8.esc(heading) + '</p><div class="hz8-rail__list"></div>';
    return nav;
  }

  /* Frostat upptäcktskort: formatet saknas i aktuell serie men finns i
     andra. Aktiveras (riktig knapp, inte disabled) -> valpanel med de
     serier där formatet finns, som riktiga länkar med riktiga antal. */
  function frostedItem(format, series) {
    var others = HZ8.catalog.seriesWithFormat(format.key, series);
    if (!others.length) return null;
    var b = document.createElement("button");
    b.type = "button";
    b.className = "hz8-rail__item hz8-rail__item--format is-frosted";
    b.setAttribute("aria-haspopup", "dialog");
    b.setAttribute("aria-expanded", "false");
    b.innerHTML = '<span class="hz8-rail__media" aria-hidden="true"></span><span class="hz8-rail__text"><span class="hz8-rail__label">' + HZ8.esc(format.label) +
      '</span><span class="hz8-rail__count">Finns inte i ' + HZ8.esc(series.name) + '</span><span class="hz8-rail__alt"></span></span>';
    var resolved = null;
    var ready = Promise.all(others.map(function (o) {
      return catalogCount(o.routes[format.key]).then(function (n) { return { label: o.name, href: HZ8.link(o.routes[format.key]), count: n }; });
    })).then(function (items) {
      resolved = items.filter(function (it) { return it.count !== 0; });
      if (!resolved.length) { b.remove(); return; }
      b.querySelector(".hz8-rail__alt").textContent = "Finns i " + resolved.length + (resolved.length === 1 ? " annan serie" : " andra serier");
      b.setAttribute("aria-label", format.label + ", finns inte i " + series.name + ". Visa " + resolved.length + (resolved.length === 1 ? " serie" : " serier") + " med " + format.label.toLowerCase());
    });
    b.addEventListener("click", function () {
      ready.then(function () { if (resolved && resolved.length) HZ8.openChoicePanel(b, format.label + " finns i", resolved); });
    });
    return b;
  }

  function buildCatalogNav(ctx) {
    var map = HZ8.catalog.build();
    var wrap = document.createElement("div");
    wrap.className = "hz8-cat-rails";
    wrap.setAttribute("data-hz8-cat", "rails");
    var current = HZ8.path(location.href);
    var isHub = ctx.type === "series-hub";

    /* -- Produkttyp / format -- */
    var fnav = navSection(isHub ? "Format" : "Produkttyp", "format");
    var flist = fnav.querySelector(".hz8-rail__list");
    if (ctx.format && (ctx.type === "format" || ctx.type === "combo")) {
      /* Format- och serie x format-sidor: samma katalogskal. Bara produkt-
         typerna i samma familj (Alla Vapes: Vapes, Carts, Refill,
         Batterier) -- aktiv typ markerad, länkarna går till typernas
         riktiga sidor (valda serier följer med, se seriesPicker). */
      HZ8.catalog.familyFormats(ctx.format.key).forEach(function (f) {
        var item = railItem({ label: f.label, href: f.href }, current, "format");
        item.setAttribute("data-hz8-format", f.key);
        if (f.key === ctx.format.key) item.setAttribute("aria-current", "page");
        else item.removeAttribute("aria-current");
        flist.appendChild(item);
      });
    } else if (ctx.series) {
      if (ctx.series.hub) {
        var all = railItem({ label: "Alla " + ctx.series.name, href: ctx.series.hub }, current, "format");
        flist.appendChild(all);
      }
      map.formats.forEach(function (f) {
        if (f.seriesless) return;
        var route = ctx.series.routes[f.key];
        if (route) {
          var item = railItem({ label: f.label, href: route }, current, "format");
          if (isHub) {
            /* Seriehubb: formatkortet hoppar till produktraden längre ned
               (#vapes osv.); raden har egen "Visa alla" till routen. */
            item.setAttribute("href", "#" + f.key);
            item.setAttribute("data-hz8-local", f.key);
          }
          if (ctx.format && ctx.format.key === f.key) item.setAttribute("aria-current", "page");
          flist.appendChild(item);
        } else {
          var frost = frostedItem(f, ctx.series);
          if (frost) flist.appendChild(frost);
        }
      });
    } else {
      if (ctx.type === "all" && map.all) {
        var allItem = railItem({ label: map.all.label, href: map.all.href }, current, "format");
        allItem.setAttribute("aria-current", "page");
        flist.appendChild(allItem);
      }
      map.formats.forEach(function (f) { flist.appendChild(railItem({ label: f.label, href: f.href }, current, "format")); });
    }
    wrap.appendChild(fnav);

    /* -- Serier -- */
    var snav = navSection("Serier", "series");
    var slist = snav.querySelector(".hz8-rail__list");
    var formatKey = ctx.format && ctx.format.key;
    if (ctx.type === "format" || ctx.type === "combo") {
      /* Flerval (seriesPicker nedan): varje serie är en riktig knapp
         (aria-pressed) med en separat, riktig länk till serie x format-
         sidan bredvid -- inga nästlade interaktiva element. */
      if (ctx.format && !ctx.format.seriesless) {
        snav.querySelector(".hz8-rail__heading").innerHTML = 'Serier <span class="hz8-rail__hint">· välj flera</span>';
        snav.setAttribute("aria-label", "Serier, välj en eller flera");
        HZ8.catalog.seriesWithFormat(formatKey).forEach(function (s) {
          slist.appendChild(seriesToggle(s, s.routes[formatKey], ctx.format));
        });
      }
    } else {
      if (ctx.type === "all" && map.all) {
        var allSeries = railItem({ label: "Alla serier", href: map.all.href }, current, "series");
        allSeries.classList.add("hz8-rail__item--all");
        allSeries.setAttribute("aria-current", "page");
        slist.appendChild(allSeries);
      }
      map.series.forEach(function (s) {
        var landing = HZ8.catalog.landingFor(s);
        if (!landing) return;
        var it = railItem({ label: s.name, href: landing }, current, "series");
        if (ctx.series === s) it.setAttribute("aria-current", "page");
        slist.appendChild(it);
      });
    }
    var isPicker = !!slist.querySelector(".hz8-serie");
    if (isPicker ? slist.children.length : slist.children.length > 1) wrap.appendChild(snav);
    return wrap;
  }

  /* Serieväxlare: knapp (val) + länk (seriens egen sida) som syskon.
     Bild från seriens riktiga sida; antalet räknas inom produkttypen av
     seriesPicker. */
  function seriesToggle(series, route, format) {
    var item = document.createElement("div");
    item.className = "hz8-serie";
    item.setAttribute("data-hz8-series", series.name);
    item.innerHTML = '<button type="button" class="hz8-rail__item hz8-rail__item--series hz8-rail__item--toggle is-loading" aria-pressed="false">' +
      '<span class="hz8-rail__media" aria-hidden="true"></span>' +
      '<span class="hz8-rail__text"><span class="hz8-rail__label">' + HZ8.esc(series.name) + '</span><span class="hz8-rail__count"></span></span></button>' +
      '<a class="hz8-serie__open" href="' + HZ8.esc(HZ8.link(route)) + '" aria-label="Gå till sidan ' + HZ8.esc(series.name + " " + format.label.toLowerCase()) + '" title="Gå till sidan ' + HZ8.esc(series.name + " " + format.label.toLowerCase()) + '">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg></a>';
    var button = item.querySelector("button");
    HZ8.fetchPage(route, HZ8.categoryInfo).then(function (info) {
      button.classList.remove("is-loading");
      if (info.count === 0) { item.remove(); return; }
      if (info.image) {
        var img = document.createElement("img");
        img.src = info.image; img.alt = ""; img.loading = "lazy"; img.decoding = "async"; img.width = 160; img.height = 160;
        item.querySelector(".hz8-rail__media").appendChild(img);
      }
    }).catch(function () { button.classList.remove("is-loading"); });
    return item;
  }

  /* ======================================================================
     Flerval av serier på format- och serie x format-sidor.

     Nyehandels native Serie-filter OR:ar värden på servern
     (filters=Serie_Core~Serie_Magic+Sauce, verifierat 2026-10-06), men
     bara Core, Magic Sauce och Nano11 finns som attribut -- THCaB, THCbA,
     D10, THCV och HHCPM är egna kategorier. Unionen byggs därför av
     riktiga sidor:
     - medlemmar = produkterna på varje vald series riktiga serie x
       format-route;
     - lista     = typens egen sida med aktuell sortering och övriga native
       filter (Serie-värden borttagna), filtrerad på medlemmarna -> samma
       ordning och filter som native. Typens sida avgör produkttypen.
     Fullständighet: varje källa hämtas med Nyehandels egen paginering och
     antalet unika kort måste stämma med sidans egen räknare. Stämmer det
     inte, eller blir en källa större än MAX_PAGES sidor, visas inget
     ofullständigt resultat -- native grid ligger kvar och statusraden
     säger varför. Native grid/paginering döljs först när hela mängden är
     laddad; resultatet visas sedan stegvis ("Visa fler").
     Valet ligger i ?serie= (delbart, bakåt/framåt); canonical är
     plattformens och pekar alltid på basidan.
     ====================================================================== */
  var MAX_PAGES = 40;      // per källa, ~1000 produkter med Nyehandels 25 per sida
  var SHOW_STEP = 24;

  function cardPath(html) {
    var m = html.match(/href="([^"]*\/products\/[^"]+)"/);
    return m ? HZ8.path(m[1]).split("?")[0].replace(/\/\d+$/, "") : "";
  }

  function withPage(href, page) {
    if (page < 2) return href;
    return href + (href.indexOf("?") === -1 ? "?" : "&") + "page=" + page;
  }

  function Incomplete(reason) { this.reason = reason; }

  /* Alla produktkort på en kategorisida (alla sidor). Avvisar med
     Incomplete om mängden inte kan laddas fullständigt. */
  function allCards(href) {
    return Promise.all([HZ8.fetchPage(href, HZ8.categoryInfo), HZ8.fetchPage(href, HZ8.categoryCards)]).then(function (first) {
      var total = first[0].count;
      var page1 = first[1];
      if (total == null) throw new Incomplete("count");
      if (total <= page1.length) return page1;
      var size = page1.length;
      if (!size) throw new Incomplete("count");
      var pages = Math.ceil(total / size);
      if (pages > MAX_PAGES) throw new Incomplete("size");
      var jobs = [];
      for (var p = 2; p <= pages; p += 1) jobs.push(HZ8.fetchPage(withPage(href, p), HZ8.categoryCards));
      return Promise.all(jobs).then(function (lists) {
        var all = page1.concat.apply(page1, lists);
        var seen = {};
        all.forEach(function (c) { var path = cardPath(c.html); if (path) seen[path] = true; });
        if (Object.keys(seen).length !== total) throw new Incomplete("count");
        return all;
      });
    });
  }

  /* Aktuella native filter utom Serie (serierna styrs av växlarna). */
  function nativeFilterTokens() {
    var raw = new URLSearchParams(location.search).get("filters") || "";
    return raw.split("~").filter(function (t) { return t && !/^Serie_/.test(t); });
  }

  /* Ordning för den sammanslagna listan. Nyehandel sorterar i två block
     (produkter i lager först, sedan slutsålda) och sorterar inom varje
     block -- med price_low blir den sammanslagna listan t.ex. 745, 725,
     985 kr. Pris och namn sorteras därför strikt här, på kortens riktiga
     data (nuvarande pris, namn), stabilt: lika värden behåller Nyehandels
     ordning. Övriga lägen (popular, published, in-stock, out-of-stock och
     standard) har ingen data på korten att räkna fram -- där följer
     listan Nyehandels egen ordning för samma sortering, vilket är korrekt
     eftersom unionen är en delmängd av den listan i samma ordning. */
  var SERVER_ORDER = { popular: 1, published: 1, "in-stock": 1, "out-of-stock": 1 };
  function cardPrice(html) {
    var doc = document.createElement("div");
    doc.innerHTML = html;
    var price = doc.querySelector(".price");
    if (!price) return null;
    var cur = price.querySelector("ins") || price;
    var all = cur.textContent.replace(/\s+/g, " ").match(/\d[\d ]*(?:[.,]\d+)?(?=\s*kr)/g);
    if (!all || !all.length) return null;
    return parseFloat(all[all.length - 1].replace(/ /g, "").replace(",", "."));
  }
  function cardName(html) {
    var m = html.match(/class="name"[^>]*>\s*([^<]+?)\s*</);
    return m ? m[1].replace(/&amp;/g, "&").trim() : "";
  }
  /* Returnerar sorterad lista, eller null om läget inte kan återskapas. */
  function orderUnion(out, sort) {
    if (!sort || SERVER_ORDER[sort]) return out;
    var keyed = out.map(function (c, i) { return { c: c, i: i }; });
    var cmp;
    if (sort === "price_low" || sort === "price_high") {
      var dir = sort === "price_low" ? 1 : -1;
      keyed.forEach(function (k) { k.v = cardPrice(k.c.html); });
      if (keyed.some(function (k) { return k.v == null; })) return null;
      cmp = function (a, b) { return (a.v - b.v) * dir || a.i - b.i; };
    } else if (sort === "name_a" || sort === "name_z") {
      var nd = sort === "name_a" ? 1 : -1;
      keyed.forEach(function (k) { k.v = cardName(k.c.html); });
      cmp = function (a, b) { return a.v.localeCompare(b.v, "sv") * nd || a.i - b.i; };
    } else {
      return null;
    }
    return keyed.sort(cmp).map(function (k) { return k.c; });
  }

  function seriesPicker(root, ctx, nav) {
    var formatKey = ctx.format.key;
    var param = HZ8.catalog.seriesParam;
    var items = Array.prototype.slice.call(nav.querySelectorAll(".hz8-serie[data-hz8-series]"));
    if (!items.length) return null;
    var byName = {};
    HZ8.catalog.seriesWithFormat(formatKey).forEach(function (s) { byName[s.name] = s; });
    /* Sidans eget innehåll: serie x format-sidans serie plus serier som
       redan är valda i Nyehandels native Serie-filter i URL:en. */
    var defaults = ctx.type === "combo" && ctx.series ? [ctx.series.name] : [];
    var nativeSerie = (new URLSearchParams(location.search).get("filters") || "").split("~")
      .filter(function (t) { return /^Serie_/.test(t); }).map(function (t) { return t.slice(6); });
    Object.keys(byName).forEach(function (n) {
      if (byName[n].attr && nativeSerie.indexOf(byName[n].attr) !== -1 && defaults.indexOf(n) === -1) defaults.push(n);
    });
    var designer = root.querySelector(".designer-category");
    var token = 0;
    var shownKey = null;
    var unionCount = null;

    var status = document.createElement("p");
    status.className = "hz8-series-status";
    status.hidden = true;
    status.innerHTML = '<span class="hz8-series-status__text" role="status" aria-live="polite"></span>' +
      '<button type="button" class="hz8-series-status__action" hidden></button>' +
      '<button type="button" class="hz8-series-status__clear">Rensa</button>';
    nav.parentNode.insertBefore(status, nav.nextSibling);
    var statusText = status.querySelector(".hz8-series-status__text");
    var actionBtn = status.querySelector(".hz8-series-status__action");
    var clearBtn = status.querySelector(".hz8-series-status__clear");

    var results = document.createElement("section");
    results.className = "hz8-series-results";
    results.id = "hz8-series-results";
    results.setAttribute("aria-label", "Produkter i valda serier");
    results.hidden = true;

    function buttons() { return items.filter(function (it) { return it.isConnected; }).map(function (it) { return it.querySelector("button"); }); }
    function slugToName(slug) {
      var names = Object.keys(byName);
      for (var i = 0; i < names.length; i += 1) if (HZ8.catalog.seriesSlug(byName[names[i]]) === slug) return names[i];
      return null;
    }
    function read() {
      var raw = new URLSearchParams(location.search).get(param);
      if (raw === null) return defaults.slice();
      return raw.split(",").map(slugToName).filter(function (n, i, a) { return n && a.indexOf(n) === i; });
    }
    function sameSet(a, b) { return a.length === b.length && a.every(function (x) { return b.indexOf(x) !== -1; }); }
    function isNative(sel) { return sameSet(sel, defaults); }
    function ordered(sel) { return Object.keys(byName).filter(function (n) { return sel.indexOf(n) !== -1; }); }
    function slugs(sel) { return ordered(sel).map(function (n) { return HZ8.catalog.seriesSlug(byName[n]); }).join(","); }

    function write(sel) {
      var url = new URL(location.href);
      if (isNative(sel)) url.searchParams.delete(param);
      else url.searchParams.set(param, slugs(sel));
      if (url.href !== location.href) history.pushState(history.state, "", url.pathname + url.search + url.hash);
    }

    /* Produkttypkorten tar med de valda serier som finns i måltypen. */
    function syncTypeLinks(sel) {
      nav.parentNode.querySelectorAll("[data-hz8-format]").forEach(function (a) {
        var f = HZ8.catalog.formatByKey(a.getAttribute("data-hz8-format"));
        if (!f || f.key === formatKey) return;
        var carry = f.seriesless ? [] : HZ8.catalog.build().series.filter(function (x) { return sel.indexOf(x.name) !== -1 && x.routes[f.key]; });
        var href = f.href;
        if (carry.length) href += (href.indexOf("?") === -1 ? "?" : "&") + param + "=" + carry.map(HZ8.catalog.seriesSlug).join(",");
        a.setAttribute("href", HZ8.link(href));
      });
    }

    function setStatus(sel, text) {
      var n = sel.length;
      var base = n ? n + (n === 1 ? " serie vald" : " serier valda") : "Inga serier valda";
      statusText.textContent = text ? base + " · " + text : base;
      clearBtn.hidden = !n;
      status.hidden = !n && isNative(sel) && actionBtn.hidden;
    }

    function renderControls(sel) {
      items.forEach(function (it) {
        var on = sel.indexOf(it.getAttribute("data-hz8-series")) !== -1;
        it.querySelector("button").setAttribute("aria-pressed", String(on));
        it.classList.toggle("is-selected", on);
      });
      syncTypeLinks(sel);
    }

    function deactivate() {
      token += 1;
      shownKey = null;
      unionCount = null;
      document.documentElement.classList.remove("hz8-series-union");
      results.hidden = true;
      results.innerHTML = "";
      root.removeAttribute("aria-busy");
      if (designer) designer.classList.remove("hz8-series-pending");
    }

    function resultKey(sel) { return ordered(sel).join("|") + "#" + nativeFilterTokens().join("~") + "#" + (new URLSearchParams(location.search).get("sort") || ""); }

    function renderPage(out, limit) {
      var grid = results.querySelector(".hz8-series-results__grid");
      if (!grid) {
        grid = document.createElement("div");
        grid.className = "products hz8-series-results__grid";
        results.appendChild(grid);
      }
      out.slice(grid.children.length, limit).forEach(function (c) {
        var cell = document.createElement("div");
        cell.innerHTML = c.html;
        cell.querySelectorAll("[id]").forEach(function (el) { el.removeAttribute("id"); });
        grid.appendChild(cell);
      });
      var more = results.querySelector(".hz8-series-results__more");
      var left = out.length - Math.min(limit, out.length);
      if (left > 0) {
        if (!more) {
          more = document.createElement("button");
          more.type = "button";
          more.className = "hz8-btn hz8-btn--secondary hz8-series-results__more";
          results.appendChild(more);
        }
        more.textContent = "Visa fler (" + left + " kvar)";
        more.onclick = function () {
          var firstNew = grid.children.length;
          renderPage(out, limit + SHOW_STEP);
          var link = grid.children[firstNew] && grid.children[firstNew].querySelector("a[href]");
          if (link) link.focus({ preventScroll: true });
        };
      } else if (more) {
        more.remove();
      }
    }

    function showUnion(sel) {
      var key = resultKey(sel);
      if (key === shownKey) return;
      shownKey = key;
      var mine = ++token;
      root.setAttribute("aria-busy", "true");
      if (designer) designer.classList.add("hz8-series-pending");
      actionBtn.hidden = true;
      setStatus(sel, "uppdaterar …");

      var params = new URLSearchParams();
      var filters = nativeFilterTokens();
      if (filters.length) params.set("filters", filters.join("~"));
      var sort = new URLSearchParams(location.search).get("sort");
      if (sort) params.set("sort", sort);
      var base = ctx.format.href + (params.toString() ? "?" + params.toString() : "");
      var members = sel.length ? Promise.all(ordered(sel).map(function (n) { return allCards(byName[n].routes[formatKey]); })) : Promise.resolve(null);

      Promise.all([members, allCards(base)]).then(function (res) {
        if (mine !== token) return;
        var set = null;
        if (res[0]) {
          set = {};
          res[0].forEach(function (list) { list.forEach(function (c) { var path = cardPath(c.html); if (path) set[path] = true; }); });
        }
        var seen = {};
        var out = [];
        res[1].forEach(function (c) {
          var path = cardPath(c.html);
          if (!path || seen[path] || (set && !set[path])) return;
          seen[path] = true;
          out.push(c);
        });

        var sorted = orderUnion(out, sort);
        if (!sorted) {
          /* Okänt sorteringsläge: visa inte en lista som ser sorterad ut. */
          deactivate();
          actionBtn.hidden = true;
          setStatus(sel, "den här sorteringen kan inte kombineras med flera serier, sidans egna produkter visas");
          status.hidden = false;
          return;
        }
        out = sorted;
        results.innerHTML = "";
        if (designer && results.parentNode !== designer) designer.appendChild(results);
        if (!out.length) {
          results.innerHTML = '<div class="hz8-state hz8-cat-empty" role="status"><h2>Inga produkter matchar</h2><p>Valda serier har inga produkter med de här filtren.</p></div>';
          var b = document.createElement("button");
          b.type = "button";
          b.className = "hz8-btn hz8-btn--secondary";
          b.textContent = "Rensa serierna";
          b.addEventListener("click", function () { apply([]); });
          results.firstChild.appendChild(b);
        } else {
          renderPage(out, SHOW_STEP);
        }
        unionCount = out.length;
        results.hidden = false;
        document.documentElement.classList.add("hz8-series-union");
        if (designer) designer.classList.remove("hz8-series-pending");
        root.removeAttribute("aria-busy");
        setStatus(sel, out.length + (out.length === 1 ? " produkt" : " produkter"));
      }).catch(function (err) {
        if (mine !== token) return;
        deactivate();
        var tooBig = err instanceof Incomplete && err.reason === "size";
        actionBtn.hidden = false;
        if (tooBig) {
          var first = ordered(sel)[0];
          actionBtn.textContent = "Öppna " + first;
          actionBtn.onclick = function () { location.href = HZ8.link(byName[first].routes[formatKey]); };
        } else {
          actionBtn.textContent = "Försök igen";
          actionBtn.onclick = function () { shownKey = null; showUnion(read()); };
        }
        setStatus(sel, tooBig ? "urvalet är för stort för att kombineras här" : "kunde inte kombineras just nu, sidans egna produkter visas");
      });
    }

    function render(sel) {
      renderControls(sel);
      if (isNative(sel)) { deactivate(); actionBtn.hidden = true; setStatus(sel, ""); }
      else showUnion(sel);
    }

    function apply(sel) {
      write(sel);
      render(sel);
    }

    items.forEach(function (it) {
      it.querySelector("button").addEventListener("click", function () {
        var name = it.getAttribute("data-hz8-series");
        var sel = read();
        var i = sel.indexOf(name);
        if (i === -1) sel.push(name); else sel.splice(i, 1);
        apply(sel);
      });
    });
    clearBtn.addEventListener("click", function () {
      apply([]);
      var first = buttons()[0];
      if (first) first.focus({ preventScroll: true });
    });

    /* Native filter/sortering byter URL med pushState: räkna om unionen,
       och lägg tillbaka ?serie= om plattformen tappade den. */
    var lastSel = read();
    HZ8.watch(function () {
      var hasParam = new URLSearchParams(location.search).has(param);
      if (!hasParam && !isNative(lastSel) && shownKey) {
        var url = new URL(location.href);
        url.searchParams.set(param, slugs(lastSel));
        history.replaceState(history.state, "", url.pathname + url.search + url.hash);
      }
      lastSel = read();
      if (!isNative(lastSel)) {
        if (designer && unionCount !== null && results.parentNode !== designer) designer.appendChild(results);
        showUnion(lastSel);
      }
    });

    /* Antal per serie = seriens produkter som finns på typens egen sida
       (samma mängd som unionen visar). 0 -> serien döljs. */
    allCards(ctx.format.href).then(function (typeCards) {
      var inType = {};
      typeCards.forEach(function (c) { var path = cardPath(c.html); if (path) inType[path] = true; });
      items.forEach(function (it) {
        var s = byName[it.getAttribute("data-hz8-series")];
        if (!s) return;
        allCards(s.routes[formatKey]).then(function (list) {
          var n = {};
          list.forEach(function (c) { var path = cardPath(c.html); if (path && inType[path]) n[path] = true; });
          var count = Object.keys(n).length;
          if (!count && it.querySelector("button").getAttribute("aria-pressed") !== "true") { it.remove(); return; }
          var el = it.querySelector(".hz8-rail__count");
          if (el) el.textContent = count + (count === 1 ? " produkt" : " produkter");
        }).catch(function () {});
      });
    }).catch(function () {});

    render(read());
    return {
      sync: function () { render(read()); },
      active: function () { return unionCount !== null; },
      count: function () { return unionCount === null ? null : unionCount + (unionCount === 1 ? " produkt" : " produkter"); }
    };
  }

  function buildHero(h1, root) {
    var hero = document.createElement("div");
    hero.className = "hz8-cat-hero";
    hero.setAttribute("aria-hidden", "true");
    hero.innerHTML = '<div class="hz8-cat-hero__art"></div>';
    root.insertBefore(hero, root.firstChild);

    /* Ingressen: första stycket i kategorins EGEN beskrivning (samma
       text som finns längre ned), kortad visuellt till två rader. */
    var desc = root.querySelector("article.category-description");
    var first = desc && Array.prototype.find.call(desc.querySelectorAll(".nh-cat-lead, .readmore__content p, .readmore__content h1, .readmore__content h2, p"), function (p) {
      return p.textContent.trim().length > 30;
    });
    var lead = document.createElement("p");
    lead.className = "hz8-cat-lead";
    lead.setAttribute("data-hz8-cat", "lead");
    if (first) lead.textContent = first.textContent.trim().replace(/\s+/g, " ");
    var actions = document.createElement("div");
    actions.className = "hz8-cat-actions";
    actions.setAttribute("data-hz8-cat", "actions");
    actions.innerHTML = '<a class="hz8-btn hz8-btn--primary" href="#category-products">Visa produkterna</a>';
    root.appendChild(lead);
    root.appendChild(actions);
    if (!first) lead.hidden = true;
  }

  var activePicker = null;
  function syncCount(actions) {
    var union = activePicker && activePicker.active() && activePicker.count();
    if (union && /\d/.test(union)) {
      var b = actions && actions.querySelector("a");
      if (b) { b.textContent = "Visa " + union; b.setAttribute("href", "#hz8-series-results"); }
      return;
    }
    var counter = document.getElementById("products_count");
    var match = counter && counter.textContent.match(/(\d+)/);
    var btn = actions && actions.querySelector("a");
    if (btn) { btn.textContent = match ? "Visa " + match[1] + " produkter" : "Visa produkterna"; btn.setAttribute("href", "#category-products"); }
  }

  /* ---- Filtergrupper: bara de som skiljer produkter åt ----
     Volym (och liknande storleksattribut) visas bara med minst två
     värden; native "Serie" döljs där seriefältet ovan gör samma jobb
     (inklusive plattformens egen valda-filter-tagg för serievärdet).
     Gäller vilka attribut Nyehandel än har -- inga filter skapas här. */
  var VOLUME_GROUP = /^(volym|storlek|innehåll|mängd)/i;
  function filterGroupHidden(name, options) {
    if (VOLUME_GROUP.test(name) && options < 2) return true;
    return name === "Serie" && document.documentElement.classList.contains("hz8-series-picker");
  }
  function syncFilterGroups() {
    document.querySelectorAll("#sidebar .vertical-filters__product-filter__item").forEach(function (item) {
      var h = item.querySelector("h4");
      var hide = filterGroupHidden(h ? h.textContent.trim() : "", item.querySelectorAll(".product-filter-item").length);
      if (item.classList.contains("hz8-filter-hidden") !== hide) item.classList.toggle("hz8-filter-hidden", hide);
    });
    if (!document.documentElement.classList.contains("hz8-series-picker") || !HZ8.catalog) return;
    var attrs = HZ8.catalog.build().series.map(function (x) { return x.attr; }).filter(Boolean);
    document.querySelectorAll(".category-sort .selected-filters-item:not(.no-chip)").forEach(function (chip) {
      var t = chip.textContent.trim();
      var hide = attrs.some(function (a) { return t === a || t.indexOf(a + " ") === 0 || /^Serie\b/.test(t); });
      if (chip.classList.contains("hz8-filter-hidden") !== hide) chip.classList.toggle("hz8-filter-hidden", hide);
    });
  }

  /* ---- Filterdocka: genvägar till Nyehandels egna filtergrupper ---- */
  var sidebarRelease = null;
  function openSidebarAt(groupName) {
    var trigger = document.querySelector(".category-sort .product-filter-button[aria-label='Öppna filter'], .category-sort .product-filter-button");
    if (!trigger) return;
    trigger.click();
    window.setTimeout(function () {
      var sidebar = document.getElementById("sidebar");
      if (!sidebar || !groupName) return;
      var heads = sidebar.querySelectorAll(".vertical-filters__product-filter__item h4");
      for (var i = 0; i < heads.length; i += 1) {
        if (heads[i].textContent.trim() === groupName) {
          heads[i].scrollIntoView({ block: "start" });
          var firstOption = heads[i].parentNode.querySelector("a[role='button'], input");
          if (firstOption) firstOption.focus({ preventScroll: true });
          break;
        }
      }
    }, 120);
  }

  function syncDock() {
    var sort = document.querySelector(".category-sort");
    if (!sort) return;
    var groups = Array.prototype.map.call(
      document.querySelectorAll("#sidebar .vertical-filters__product-filter__item"),
      function (item) {
        var h = item.querySelector("h4");
        return { name: h ? h.textContent.trim() : "", options: item.querySelectorAll(".product-filter-item").length };
      }
    ).filter(function (g) { return g.name && g.options > 0 && !filterGroupHidden(g.name, g.options); });
    var dock = sort.parentNode.querySelector(".hz8-filter-shortcuts");
    var signature = groups.map(function (g) { return g.name; }).join("|");
    if (dock && dock.getAttribute("data-sig") === signature) return;
    if (dock) dock.remove();
    if (!groups.length) return;
    dock = document.createElement("div");
    dock.className = "hz8-filter-shortcuts";
    dock.setAttribute("data-sig", signature);
    dock.setAttribute("role", "group");
    dock.setAttribute("aria-label", "Filtrera på");
    groups.forEach(function (g) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "hz8-chip";
      b.innerHTML = HZ8.esc(g.name) + HZ8.icon("chevron");
      b.addEventListener("click", function () { openSidebarAt(g.name); });
      dock.appendChild(b);
    });
    sort.parentNode.insertBefore(dock, sort.nextSibling);
  }

  /* Nyehandels filterpanel saknar egen bakgrund/Escape/fokusfälla --
     läggs till här ovanpå den native panelen (öppnas/stängs fortfarande
     av plattformens egna knappar). */
  var backdrop = null;
  function syncSidebar() {
    var sidebar = document.getElementById("sidebar");
    if (!sidebar) return;
    var open = sidebar.classList.contains("is-active");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "hz8-backdrop hz8-filter-backdrop";
      backdrop.addEventListener("click", closeSidebar);
      document.body.appendChild(backdrop);
    }
    backdrop.classList.toggle("is-visible", open);
    if (open && !sidebarRelease) {
      HZ8.lockScroll();
      sidebar.setAttribute("role", "dialog");
      sidebar.setAttribute("aria-modal", "true");
      sidebar.setAttribute("aria-label", "Filtrera produkter");
      sidebarRelease = HZ8.trapFocus(sidebar, closeSidebar);
    } else if (!open && sidebarRelease) {
      HZ8.unlockScroll();
      sidebarRelease();
      sidebarRelease = null;
    }
  }
  function closeSidebar() {
    var close = document.querySelector("#sidebar .sidebar__close");
    if (close) close.click();
  }

  /* ---- Begripliga sorteringsetiketter ----
     Nyehandels egna sorteringsval (alla är riktiga, "Mest populära" är
     plattformens egen popularitetssortering). Texten i Vue-noderna rörs
     inte: etiketten läggs som data-attribut + aria-label och visas via
     CSS. Platshållaren "-- Välj --" döljs. */
  var SORT_LABELS = {
    "Mest populära": "Populärast",
    "Publiceringsdatum": "Nyast",
    "Lägsta pris": "Pris: lägst först",
    "Högsta pris": "Pris: högst först",
    "Namn A-Ö": "Namn A–Ö",
    "Namn Ö-A": "Namn Ö–A",
    "Finns i lager": "I lager först",
    "Slut i lager": "Slut i lager först"
  };
  function syncSortLabels() {
    document.querySelectorAll(".category-sort .sort-button .dropdown-item").forEach(function (a) {
      var t = a.textContent.trim();
      if (/^-+\s*Välj/.test(t)) { a.classList.add("hz8-sort-placeholder"); return; }
      var label = SORT_LABELS[t];
      if (label && a.getAttribute("data-hz8-label") !== label) { a.setAttribute("data-hz8-label", label); a.setAttribute("aria-label", label); }
    });
    var cur = document.querySelector(".category-sort .sort-button .dropdown-trigger button span:nth-child(2)");
    if (cur) {
      var label = SORT_LABELS[cur.textContent.trim()] || "";
      if (cur.getAttribute("data-hz8-label") !== label) cur.setAttribute("data-hz8-label", label);
      var btn = cur.closest("button");
      if (btn && label) btn.setAttribute("aria-label", "Sortering: " + label);
    }
  }

  /* Filterpanelens primärknapp visar riktigt resultatantal. */
  function syncDrawerCount() {
    var counter = document.getElementById("products_count");
    var n = counter && (counter.textContent.match(/(\d+)/) || [])[1];
    var btn = document.querySelector("#sidebar .sidebar__action .button span");
    if (btn && n && btn.getAttribute("data-hz8-label") !== "Visa " + n + " produkter") btn.setAttribute("data-hz8-label", "Visa " + n + " produkter");
    var active = Array.prototype.filter.call(document.querySelectorAll(".category-sort .selected-filters-item:not(.no-chip)"), function (el) { return !el.closest("#sidebar"); }).length;
    var trigger = document.querySelector(".category-sort .product-filter-button[aria-label='Öppna filter']");
    if (trigger) trigger.setAttribute("data-hz8-active", active ? String(active) : "");
  }

  /* ---- Tomt resultat ---- */
  function syncEmpty() {
    var grid = document.getElementById("category-products");
    var host = grid && grid.parentNode;
    /* Nyehandel renderar varken grid eller verktygsrad när filter i URL:en
       ger noll träffar -- då ett tomläge med riktig länk som rensar
       filtren (samma sida utan filters-parametern). */
    if (!host) {
      var root = document.getElementById("skip-to-main-content");
      if (!root || root.querySelector(".hz8-cat-empty") || !/[?&]filters=/.test(location.search)) return;
      var clean = new URL(location.href);
      clean.searchParams.delete("filters");
      clean.searchParams.delete("page");
      var box = document.createElement("div");
      box.className = "hz8-state hz8-cat-empty hz8-cat-empty--nogrid";
      box.setAttribute("role", "status");
      box.innerHTML = "<h2>Inga produkter matchar</h2><p>Kombinationen av filter gav inga träffar.</p>" +
        '<a class="hz8-btn hz8-btn--secondary" href="' + HZ8.esc(clean.pathname + clean.search) + '">Rensa alla filter</a>';
      var guide = root.querySelector(".hz8-cat-guide");
      root.insertBefore(box, guide || null);
      return;
    }
    var hasCards = !!grid.querySelector(".product-card");
    var empty = host.querySelector(".hz8-cat-empty");
    if (hasCards) { if (empty) empty.remove(); return; }
    if (empty) return;
    empty = document.createElement("div");
    empty.className = "hz8-state hz8-cat-empty";
    empty.setAttribute("role", "status");
    var clear = document.querySelector(".product-filter__clear");
    empty.innerHTML = "<h2>Inga produkter matchar</h2><p>Prova att ta bort ett filter eller visa hela kategorin.</p>";
    if (clear) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "hz8-btn hz8-btn--secondary";
      b.textContent = "Rensa alla filter";
      b.addEventListener("click", function () { var c = document.querySelector(".product-filter__clear"); if (c) c.click(); });
      empty.appendChild(b);
    }
    host.insertBefore(empty, grid.nextSibling);
  }

  /* ---- Populärast här: Nyehandels egen "Mest populära"-sortering ---- */
  function buildPopular(root, h1Text) {
    var counter = document.getElementById("products_count");
    var total = counter && parseInt((counter.textContent.match(/(\d+)/) || [])[1], 10);
    if (!total || total < MIN_FOR_POPULAR || /[?&]sort=popular/.test(location.search) || /[?&]filters=/.test(location.search)) return;
    var url = new URL(location.href);
    url.searchParams.set("sort", "popular");
    url.searchParams.delete("page");
    HZ8.fetchPage(url.pathname + url.search, HZ8.popularCards).then(function (cards) {
      if (root.querySelector(".hz8-cat-popular") || !cards || cards.length < 3) return;
      var section = document.createElement("section");
      section.className = "hz8-cat-popular";
      section.setAttribute("data-hz8-cat", "popular");
      section.setAttribute("aria-labelledby", "hz8-cat-popular-title");
      url.searchParams.delete("preview");
      section.innerHTML = '<div class="hz8-section-head"><h2 id="hz8-cat-popular-title">Populärast i ' + HZ8.esc(h1Text) +
        '</h2><a href="' + HZ8.esc(HZ8.link(url.pathname + url.search)) + '">Sortera på populärast</a></div>';
      var list = document.createElement("div");
      list.className = "products hz8-cat-popular__list";
      cards.slice(0, MAX_POPULAR).forEach(function (html, i) {
        var cell = document.createElement("div");
        if (i === 0) cell.className = "hz8-cat-popular__lead";
        cell.innerHTML = html;
        cell.querySelectorAll("[id]").forEach(function (el) { el.removeAttribute("id"); });
        list.appendChild(cell);
      });
      section.appendChild(list);
      root.insertBefore(section, root.querySelector(".designer-category"));
    }).catch(function () { /* utan data visas sektionen inte */ });
  }

  /* Katalogportal: Nyehandels "Mest populära" som EN kompakt karusell
     (gemensam produktkarusell) så att griden nås snabbt. */
  function buildPortalPopular(root, h1Text) {
    if (/[?&](sort|filters)=/.test(location.search) || !HZ8.productRail) return;
    var url = new URL(location.href);
    url.searchParams.set("sort", "popular");
    url.searchParams.delete("page");
    url.searchParams.delete("preview");
    var rail = HZ8.productRail({
      id: "hz8-portal-popular",
      className: "hz8-prail--compact hz8-cat-popular hz8-portal-popular",
      title: "Populärast just nu",
      href: HZ8.link(url.pathname + url.search),
      allLabel: "Sortera på populärast",
      hideCount: true,
      limit: 10,
      source: url.pathname + url.search,
      eager: true
    });
    rail.setAttribute("data-hz8-cat", "popular");
    root.insertBefore(rail, root.querySelector(".designer-category"));
  }

  /* ---- Vägledning + kategorins egen text längst ned ---- */
  function buildGuide(root, h1Text) {
    var band = document.createElement("section");
    band.className = "hz8-band hz8-cat-guide";
    band.setAttribute("data-hz8-cat", "guide");
    band.setAttribute("aria-labelledby", "hz8-cat-guide-title");
    band.innerHTML = '<div class="hz8-cat-guide__art" aria-hidden="true"></div>' +
      '<div class="hz8-cat-guide__copy"><span class="hz8-kicker">Kundservice</span>' +
      '<h2 id="hz8-cat-guide-title">Frågor om leverans, betalning eller våra produkter?</h2>' +
      "<p>Vi har samlat svaren på det kunder oftast undrar. Hittar du inte det du söker hjälper kundservice dig gärna.</p>" +
      '<div class="hz8-cat-guide__actions"><a class="hz8-btn hz8-btn--primary" href="' + HZ8.esc(HZ8.link("/sv/page/faq")) + '">Vanliga frågor</a>' +
      '<a class="hz8-btn hz8-btn--light" href="' + HZ8.esc(HZ8.link("/sv/page/kontakt")) + '">Kontakta oss</a></div></div>';
    root.appendChild(band);

    var desc = root.querySelector("article.category-description .readmore, article.category-description .nh-cat-box");
    if (!desc) return;
    var about = document.createElement("div");
    about.className = "hz8-cat-about-head";
    about.setAttribute("data-hz8-cat", "about-head");
    about.innerHTML = '<span class="hz8-kicker">Om kategorin</span><p class="hz8-cat-about-title">' + HZ8.esc(h1Text) + "</p>";
    root.appendChild(about);
  }

  HZ8.register("category", function (context) {
    if (context.page !== "category") return;
    var root = document.getElementById("skip-to-main-content");
    var h1 = root && root.querySelector("article.category-description h1");
    if (!root || !h1 || root.querySelector(".hz8-cat-hero")) return;
    var h1Text = h1.textContent.trim();
    /* Kategoritexten i katalogen innehåller ibland en egen <h1> (t.ex.
       Alla produkter, Alla Vapes). Den blir ett riktigt <h2> med samma
       text, attribut och utseende, så sidan har exakt ett H1 -- även för
       sökmotorer som renderar sidan. Körs om om texten ritas om. */
    function demoteExtraH1() {
      root.querySelectorAll("article.category-description .readmore__content h1").forEach(function (extra) {
        var h2 = document.createElement("h2");
        Array.prototype.forEach.call(extra.attributes, function (a) { if (a.name !== "role" && a.name !== "aria-level") h2.setAttribute(a.name, a.value); });
        while (extra.firstChild) h2.appendChild(extra.firstChild);
        extra.parentNode.replaceChild(h2, extra);
      });
    }
    demoteExtraH1();
    HZ8.watch(demoteExtraH1);

    buildHero(h1, root);
    var ctx = HZ8.catalog ? HZ8.catalog.contextFor(location.href) : null;
    if (ctx && ctx.type === "all") document.documentElement.classList.add("hz8-cat-portal");
    var picker = null;
    if (ctx) {
      var navWrap = buildCatalogNav(ctx);
      root.appendChild(navWrap);
      root.setAttribute("data-hz8-nav", ctx.type);
      var seriesNav = navWrap.querySelector(".hz8-rail--series");
      if (seriesNav && seriesNav.querySelector(".hz8-serie")) picker = seriesPicker(root, ctx, seriesNav);
      if (picker) { document.documentElement.classList.add("hz8-series-picker"); activePicker = picker; }
    } else {
      /* Sidor som relationskartan inte beskriver (CBD-familjen,
         tillverkarsidor): headerns grupprälsar som tidigare. */
      var found = groupForPath(HZ8.path(location.href).split("?")[0]);
      if (found) {
        var rails = buildRails(found);
        if (rails) root.appendChild(rails);
        var label = groupLabel(found.key);
        if (label) root.setAttribute("data-hz8-group", label);
      }
    }
    buildGuide(root, h1Text);
    if (ctx && ctx.type === "series-hub" && HZ8.seriesHub) HZ8.seriesHub(root, ctx, h1Text);
    else if (ctx && ctx.type === "all") buildPortalPopular(root, h1Text);
    else buildPopular(root, h1Text);
    if (ctx && ctx.type === "combo" && HZ8.comboRelated) HZ8.comboRelated(root, ctx);

    /* Nyehandel byter filter-URL med pushState men ritar inte om vid
       bakåt/framåt -- då laddas sidan om så att resultat och URL alltid
       stämmer. Hash-ändringar (seriehubbens hopp) påverkas inte. */
    /* ?serie= (flervalet) ritas om på plats utan omladdning. */
    function nativeSearch() { return HZ8.catalog ? HZ8.catalog.withoutSeriesState(location.href).replace(/^[^?]*/, "") : location.search; }
    var lastSearch = nativeSearch();
    window.addEventListener("popstate", function () {
      if (nativeSearch() !== lastSearch) location.reload();
      else if (picker) picker.sync();
    });
    HZ8.watch(function () { lastSearch = nativeSearch(); });

    var actions = root.querySelector("[data-hz8-cat='actions']");
    HZ8.watch(function () {
      syncCount(actions);
      syncSortLabels();
      syncDrawerCount();
      syncFilterGroups();
      syncDock();
      syncSidebar();
      syncEmpty();
    });
  });
})();
