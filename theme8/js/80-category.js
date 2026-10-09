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

  /* opts (pilotsidan, se nedan): roots = flera behållare med samma
     växlare (popover + filterark), statusHost = var statusraden hamnar,
     linkScope = var produkttyplänkarna finns, countText = antalsformat,
     onUpdate = anropas när urval eller resultat ändras,
     extra = { active(), key(), test(card) } -- ytterligare kortfilter
     (produkttyp) som också kräver den fullständiga listan,
     exclude(path) = kort som aldrig visas i resultatet (pausade serier). */
  function seriesPicker(root, ctx, nav, opts) {
    opts = opts || {};
    var formatKey = ctx.format.key;
    var param = HZ8.catalog.seriesParam;
    var items = [];
    (opts.roots || [nav]).forEach(function (r) { items = items.concat(Array.prototype.slice.call(r.querySelectorAll(".hz8-serie[data-hz8-series]"))); });
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
    if (opts.statusHost) opts.statusHost.appendChild(status);
    else nav.parentNode.insertBefore(status, nav.nextSibling);
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
    function extraOn() { return !!(opts.extra && opts.extra.active()); }
    function nativeAll(sel) { return isNative(sel) && !extraOn(); }
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
      (opts.linkScope || nav.parentNode).querySelectorAll("[data-hz8-format]").forEach(function (a) {
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
      status.classList.toggle("has-action", !actionBtn.hidden);
      if (opts.onUpdate) opts.onUpdate();
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

    function resultKey(sel) { return ordered(sel).join("|") + "#" + nativeFilterTokens().join("~") + "#" + (new URLSearchParams(location.search).get("sort") || "") + "#" + (opts.extra ? opts.extra.key() : ""); }

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
          if (opts.exclude && opts.exclude(path)) return;
          if (extraOn() && !opts.extra.test(c)) return;
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
      if (nativeAll(sel)) { deactivate(); actionBtn.hidden = true; setStatus(sel, ""); }
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
      if (!nativeAll(lastSel)) {
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
          if (el) el.textContent = opts.countText ? opts.countText(count) : count + (count === 1 ? " produkt" : " produkter");
          if (opts.onUpdate) opts.onUpdate();
        }).catch(function () {});
      });
    }).catch(function () {});

    /* Scrollsignal på desktop: tona högerkanten bara när rälsen har mer. */
    var list = nav.querySelector(".hz8-rail__list");
    function syncMore() {
      if (!list) return;
      var more = list.scrollWidth - list.clientWidth - list.scrollLeft > 4;
      if (list.classList.contains("is-more") !== more) list.classList.toggle("is-more", more);
    }
    if (list) {
      /* Shift + mushjul scrollar rälsen i sidled även där webbläsaren
         inte själv gör om lodrät rullning till vågrät. */
      list.addEventListener("wheel", function (e) {
        if (!e.shiftKey || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
        if (list.scrollWidth <= list.clientWidth) return;
        e.preventDefault();
        list.scrollBy({ left: e.deltaY, behavior: "auto" });
      }, { passive: false });
      /* Tangentbord: fokus i ett kort scrollar hela kortet i bild, linjerat
         mot ett snap-läge (annars drar scroll-snap tillbaka rälsen så att
         det fokuserade elementet hamnar delvis utanför). */
      list.addEventListener("focusin", function (e) {
        var card = e.target.closest(".hz8-serie");
        if (!card) return;
        var lr = list.getBoundingClientRect(), cr = card.getBoundingClientRect();
        if (cr.left >= lr.left - 1 && cr.right <= lr.right + 1) return;
        var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        var delta = cr.left < lr.left ? cr.left - lr.left - 2 : cr.right - lr.right + 2;
        /* Kortet hamnar vid närmaste kortstart som visar hela kortet. */
        if (cr.right > lr.right) {
          var cards = Array.prototype.slice.call(list.querySelectorAll(".hz8-serie"));
          for (var i = 0; i < cards.length; i += 1) {
            var r = cards[i].getBoundingClientRect();
            if (r.left - lr.left >= delta - 1) { delta = r.left - lr.left - 2; break; }
          }
        }
        list.scrollBy({ left: delta, behavior: reduce ? "auto" : "smooth" });
      });
      list.addEventListener("scroll", function () { window.requestAnimationFrame(syncMore); }, { passive: true });
      window.addEventListener("resize", syncMore);
      HZ8.watch(syncMore);
    }

    render(read());
    return {
      /* Bakåt/framåt: URL:en är sanningen -- uppdatera även bevakningens
         senast kända urval, annars lägger den tillbaka ?serie=. */
      sync: function () { lastSel = read(); render(lastSel); },
      selected: read,
      apply: apply,
      pending: function () { return root.getAttribute("aria-busy") === "true"; },
      total: function () { return unionCount; },
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

  /* ======================================================================
     PILOT (2026-10-09): ny kategoridesign, endast /sv/categories/alla-vapes.
     Facit: theme8/review/category-redesign-build-reference-2026-10/
     (01 = desktop, 02 = mobil, 03 = öppen popover + köpknappar).

     Samma native motor som övriga kategorisidor -- bara ny yta:
     - Filter: Nyehandels egna filtergrupper i #sidebar (Varumärke,
       Lagerstatus) klickas på riktigt; URL, räknare och rendering är
       plattformens. Den dolda native-verktygsraden finns kvar i DOM:en.
     - Cannabinoid / serie: samma flervalsunion som tidigare
       (seriesPicker, ?serie=), nu med växlare i popover och filterark.
       "Finns i andra format" = serier i relationskartan utan route i
       formatet men med riktiga routes i andra format (riktiga länkar,
       antal läses ur sidorna, 0 = dold).
     - Sortering: Nyehandels egna sorteringsval klickas.
     - Lagerstatus per kort: kategorins egen "I lager"-lista
       (smart-filter_in-stock) hämtas en gång; okänt = ingen rad.
     - Innehåll / halt, Doft / strain, Användning och Pris saknas som data
       i Nyehandel (inga filtergrupper, product.properties är tom,
       kontrollerat 2026-10-09) och visas därför inte. Grupper som
       Nyehandel senare exponerar i #sidebar dyker upp automatiskt under
       "Alla filter" (alla grupper utom Serie/Lagerstatus speglas).
     ====================================================================== */
  var PILOT_PATHS = ["/sv/categories/alla-vapes"];
  var STOCK_TOKEN = "smart-filter_in-stock";
  var STOCK_GROUP = "Lagerstatus";
  var MIRROR_SKIP = { Serie: true, Lagerstatus: true };
  /* Pausade cannabinoider (STATUS.md: THCNM, HHCPM och 10-OH-THC/D10,
     juridik ej klar -- filtreras bort från ny navigation). Visas inte i
     pilotens dropdown, sökning, quiz, korslänkar eller rekommendationer.
     Ren presentationslogik; katalog, routes och produkter ändras inte. */
  var PILOT_PAUSED = /^(thc-?nm|hhc-?pm|d10|10-?oh(-?thc)?)$/i;
  function shown(series) { return !PILOT_PAUSED.test(series.name); }
  /* Linjeikoner per format (presentation, påverkar ingen data). */
  var FORMAT_ICONS = {
    vapes: '<path d="M10 3h4v3h-4z"/><rect x="8.5" y="6" width="7" height="15" rx="2"/><path d="M10.5 10h3"/>',
    carts: '<path d="M11 2h2v3h-2z"/><rect x="9" y="5" width="6" height="11" rx="1.2"/><path d="M9 9h6M10 16v3a2 2 0 0 0 4 0v-3"/>',
    batterier: '<rect x="8" y="3" width="8" height="18" rx="2"/><path d="M10.5 3V2h3v1M12 9v4M10.5 11h3"/>'
  };
  function formatIcon(key) {
    return '<svg class="hz8-icon" viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (FORMAT_ICONS[key] || FORMAT_ICONS.vapes) + "</svg>";
  }
  /* Guidens emblem: kompass i samma linjespråk som HZ8.icon. */
  var EMBLEM = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/><circle cx="12" cy="12" r=".6"/></svg>';
  function isPilot(ctx) {
    return !!ctx && ctx.type === "format" && PILOT_PATHS.indexOf(HZ8.path(location.href).split("?")[0]) !== -1;
  }

  function node(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function plural(n) { return n + (n === 1 ? " produkt" : " produkter"); }
  function joinSv(list) { return list.length < 2 ? list.join("") : list.slice(0, -1).join(", ") + " och " + list[list.length - 1]; }
  function nativeCount() {
    var c = document.getElementById("products_count");
    var m = c && c.textContent.match(/(\d+)/);
    return m ? parseInt(m[1], 10) : null;
  }
  var ARROW = '<svg class="hz8-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var CHEV = '<svg class="hz8-icon hz8-pchev" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 9l6 6 6-6"/></svg>';
  var SLIDERS = '<svg class="hz8-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg>';
  var SORTICON = '<svg class="hz8-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 4v16M4 8l4-4 4 4M16 20V4M12 16l4 4 4-4"/></svg>';

  /* ---- Nyehandels egna filter (dold native-panel) ---- */
  function nativeGroups() {
    var out = [];
    document.querySelectorAll("#sidebar .vertical-filters__product-filter__item").forEach(function (g) {
      var h = g.querySelector("h4");
      if (!h) return;
      out.push({
        name: h.textContent.trim(),
        options: Array.prototype.map.call(g.querySelectorAll(".product-filter-item"), function (li) {
          var input = li.querySelector("input");
          return { label: li.textContent.replace(/\s+/g, " ").trim(), checked: !!(input && input.checked), li: li };
        })
      });
    });
    return out;
  }
  function nativeOption(group, label) {
    var g = nativeGroups().filter(function (x) { return x.name === group; })[0];
    return g ? g.options.filter(function (o) { return o.label === label; })[0] || null : null;
  }
  function toggleNative(group, label) {
    var o = nativeOption(group, label);
    if (!o) return;
    (o.li.querySelector("a[role='button']") || o.li).click();
  }
  function stockOption() {
    var g = nativeGroups().filter(function (x) { return x.name === STOCK_GROUP; })[0];
    return g && g.options[0] ? g.options[0] : null;
  }
  function nativeChips() {
    var host = document.querySelector(".category-sort .selected-filters.is-hidden-touch") || document.querySelector(".category-sort .selected-filters");
    if (!host) return [];
    return Array.prototype.filter.call(host.querySelectorAll(".selected-filters-item:not(.no-chip)"), function (c) {
      return !c.classList.contains("hz8-filter-hidden");
    }).map(function (c) {
      var l = c.querySelector(".selected-filters-item__label");
      return { label: (l || c).textContent.replace(/\s+/g, " ").trim(), remove: c.querySelector(".selected-filters-item__remove") };
    });
  }
  function sortOptions() {
    return Array.prototype.filter.call(document.querySelectorAll(".category-sort .sort-button .dropdown-item"), function (a) {
      return !/^-+\s*Välj/.test(a.textContent.trim());
    }).map(function (a) { var t = a.textContent.trim(); return { native: t, label: SORT_LABELS[t] || t, el: a }; });
  }
  function currentSort() {
    var cur = document.querySelector(".category-sort .sort-button .dropdown-trigger button span:nth-child(2)");
    var t = cur ? cur.textContent.trim() : "";
    return SORT_LABELS[t] ? t : "";
  }

  /* ---- Popover (desktop) ---- */
  var openPop = null;
  var FOCUSABLE_IN = "a[href],button:not([disabled]),input:not([disabled])";
  function popover(trigger, panel) {
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", panel.id);
    panel.hidden = true;
    var api = {
      panel: panel,
      trigger: trigger,
      close: function (focus) {
        if (panel.hidden) return;
        panel.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
        if (openPop === api) openPop = null;
        if (focus) trigger.focus({ preventScroll: true });
      },
      show: function () {
        if (openPop && openPop !== api) openPop.close(false);
        panel.hidden = false;
        trigger.setAttribute("aria-expanded", "true");
        openPop = api;
        /* Panelen får aldrig sticka ut under fönstret (scrollar internt). */
        panel.style.maxHeight = "";
        var room = window.innerHeight - panel.getBoundingClientRect().top - 16;
        if (room < panel.scrollHeight) panel.style.maxHeight = Math.max(220, room) + "px";
        var first = panel.querySelector("[aria-pressed='true'], [aria-current='true']") || panel.querySelector(FOCUSABLE_IN);
        if (first) first.focus({ preventScroll: true });
      }
    };
    trigger.addEventListener("click", function () { if (panel.hidden) api.show(); else api.close(true); });
    [trigger, panel].forEach(function (n) {
      n.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) { e.preventDefault(); api.close(true); } });
    });
    return api;
  }
  function outside(e) {
    if (openPop && !openPop.panel.contains(e.target) && !openPop.trigger.contains(e.target)) openPop.close(false);
  }
  document.addEventListener("pointerdown", outside);
  document.addEventListener("focusin", outside);

  /* ---- Dialog: bottom sheet på mobil, sidopanel/mittdialog på desktop ---- */
  function sheet(id, title, variant) {
    var wrap = node("div", "hz8-psheet hz8-psheet--" + variant);
    wrap.id = id;
    wrap.hidden = true;
    wrap.innerHTML = '<div class="hz8-psheet__scrim"></div>' +
      '<div class="hz8-psheet__panel" role="dialog" aria-modal="true" aria-labelledby="' + id + '-title">' +
      '<div class="hz8-psheet__grip" aria-hidden="true"></div>' +
      '<div class="hz8-psheet__head"><h2 class="hz8-psheet__title" id="' + id + '-title">' + HZ8.esc(title) + '</h2>' +
      '<button type="button" class="hz8-psheet__close" aria-label="Stäng">' + HZ8.icon("close") + '</button></div>' +
      '<div class="hz8-psheet__body"></div><div class="hz8-psheet__foot"></div></div>';
    document.body.appendChild(wrap);
    var panel = wrap.querySelector(".hz8-psheet__panel");
    var release = null;
    var api = {
      el: wrap,
      body: wrap.querySelector(".hz8-psheet__body"),
      foot: wrap.querySelector(".hz8-psheet__foot"),
      isOpen: function () { return !wrap.hidden; },
      open: function () {
        if (!wrap.hidden) return;
        if (openPop) openPop.close(false);
        wrap.hidden = false;
        window.requestAnimationFrame(function () { wrap.classList.add("is-open"); });
        HZ8.lockScroll();
        release = HZ8.trapFocus(panel, api.close);
      },
      close: function () {
        if (wrap.hidden) return;
        wrap.classList.remove("is-open");
        wrap.hidden = true;
        HZ8.unlockScroll();
        if (release) { var r = release; release = null; r(); }
        if (api.onClose) api.onClose();
      }
    };
    wrap.querySelector(".hz8-psheet__scrim").addEventListener("click", api.close);
    wrap.querySelector(".hz8-psheet__close").addEventListener("click", api.close);
    return api;
  }

  /* ---- Gemensamma byggstenar för popover och filterark ---- */
  function seriesOptions(ctx) {
    return HZ8.catalog.seriesWithFormat(ctx.format.key).filter(shown).map(function (s) {
      return '<div class="hz8-serie hz8-popt" data-hz8-series="' + HZ8.esc(s.name) + '"><button type="button" class="hz8-popt__btn" aria-pressed="false">' +
        '<span class="hz8-popt__box" aria-hidden="true"></span><span class="hz8-rail__label">' + HZ8.esc(s.name) + '</span>' +
        '<span class="hz8-rail__count hz8-popt__count"></span></button></div>';
    }).join("");
  }

  /* Serier som saknas i formatet men finns i andra format (riktiga
     routes ur relationskartan). Navigationsrader, aldrig filter. */
  function otherFormats(ctx, list, group) {
    var key = ctx.format.key;
    var jobs = [];
    HZ8.catalog.build().series.forEach(function (s) {
      if (s.routes[key] || !shown(s)) return;
      var formats = Object.keys(s.routes).map(HZ8.catalog.formatByKey).filter(Boolean);
      var href = HZ8.catalog.landingFor(s);
      if (!formats.length || !href) return;
      var where = joinSv(formats.map(function (f) { return f.short.toLowerCase(); }));
      var a = node("a", "hz8-pother");
      a.href = HZ8.link(href);
      a.hidden = true;
      a.setAttribute("aria-label", s.name + ", finns som " + where + ". Visa produkter");
      a.innerHTML = '<span class="hz8-pother__text"><span class="hz8-pother__name">' + HZ8.esc(s.name) + '</span>' +
        '<span class="hz8-pother__where">Finns som ' + HZ8.esc(where) + '</span></span>' +
        '<span class="hz8-pother__cta" aria-hidden="true"><span>Visa produkter</span>' + ARROW + '</span>';
      list.appendChild(a);
      jobs.push(catalogCount(href).then(function (n) { if (n) a.hidden = false; else a.remove(); }));
    });
    function sync() { group.hidden = !list.querySelector(".hz8-pother:not([hidden]):not(.is-filtered)"); }
    group.hz8Sync = sync;
    sync();
    jobs.forEach(function (j) { j.then(sync); });
  }

  /* ---- Masthead + guide ---- */
  function pilotMasthead(root, ctx) {
    var lead = root.querySelector(".hz8-cat-lead");
    if (lead) {
      lead.hidden = false;
      lead.textContent = PILOT_LEAD;
    }
    var count = node("p", "hz8-pcount");
    count.setAttribute("data-hz8-cat", "count");
    root.appendChild(count);
    return count;
  }

  /* Ingress ur riktig data: antal tillverkare (Nyehandels Varumärke-
     filter) och serierna som faktiskt finns som vape. */
  /* Ingress enligt facit 07 (godkänd copy). Antalet ligger separat. */
  var PILOT_LEAD = "Alla våra vapes på ett ställe. Filtrera på cannabinoid, serie och lagerstatus.";

  /* Redaktionellt dekorationslager (07): emblem med cirkeltext, små
     markeringar och handskrift. Inline-SVG, dekor -- aria-hidden och
     pointer-events:none i CSS. Inga koordinater eller påståenden. */
  function pilotDecor(root) {
    var d = node("div", "hz8-pdecor");
    d.setAttribute("aria-hidden", "true");
    d.innerHTML =
      '<svg class="hz8-pdecor__seal" viewBox="0 0 120 120" focusable="false"><defs><path id="hz8-pdecor-ring" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0"/></defs>' +
        '<circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" stroke-width=".8" opacity=".55"/>' +
        '<text font-size="9.2" letter-spacing="2.6" fill="currentColor"><textPath href="#hz8-pdecor-ring" startOffset="2%">KUSTJOURNALEN · HAZEY.SE · KUSTJOURNALEN ·</textPath></text>' +
        '<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M46 80c4-20 14-36 30-44-2 18-12 34-30 44z"/><path d="M46 80l22-34M55 66l-6-4M61 57l-7-3M65 50l-6-1"/></g></svg>' +
      '<svg class="hz8-pdecor__marks" viewBox="0 0 80 40" focusable="false"><g fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"><path d="M10 6v8M6 10h8M8 8l4 4M12 8l-4 4"/><path d="M60 22a8 8 0 0 1 16 0M68 10v4M58 15l3 2M78 15l-3 2"/><path d="M28 30c8-3 16-3 24 0"/></g></svg>' +
      '<p class="hz8-pdecor__script">Good Products<br>Higher Horizons</p>';
    root.appendChild(d);
  }

  function pilotGuide(root, steps, openQuiz) {
    var g = node("aside", "hz8-pguide");
    g.setAttribute("aria-labelledby", "hz8-pguide-title");
    g.innerHTML = '<span class="hz8-pguide__emblem" aria-hidden="true">' + EMBLEM + '</span>' +
      '<div class="hz8-pguide__body"><p class="hz8-pguide__title" id="hz8-pguide-title">Osäker på vad som passar?</p>' +
      '<div class="hz8-pguide__row"><button type="button" class="hz8-pcta hz8-pguide__cta" aria-haspopup="dialog"><span>Hitta rätt vape</span>' + ARROW + '</button>' +
      '<p class="hz8-pguide__steps">' + HZ8.esc(steps.join(" · ")) + '</p></div></div>';
    g.querySelector("button").addEventListener("click", openQuiz);
    root.appendChild(g);
    return g;
  }

  /* ---- Hitta rätt vape: guide som bara leder till riktiga filter/routes.
     Steg utan riktig data (Användning, Doft / strain) visas inte. Format
     kan leda vidare till andra sidor (Carts, Batterier) -- filterraden
     begränsar däremot bara den här sidan. ---- */
  function buildQuiz(ctx, getPicker, getTotal) {
    var dlg = sheet("hz8-pquiz", "Hitta rätt vape", "quiz");
    var state = { step: 0, format: null, series: [] };
    var formats = HZ8.catalog.familyFormats(ctx.format.key);
    var counts = {};
    formats.forEach(function (f) { catalogCount(f.href).then(function (n) { counts[f.key] = n; if (dlg.isOpen()) render(); }); });

    function steps() {
      var f = HZ8.catalog.formatByKey(state.format || ctx.format.key);
      var out = [{ key: "format", label: "Format" }];
      if (f && !f.seriesless && seriesFor(f.key).length) out.push({ key: "series", label: "Cannabinoid / serie" });
      return out;
    }
    /* Serier i formatet. För sidans eget format: bara de som finns bland
       sidans produkter (flervalets kontroller tas bort vid 0). Antal visas
       inte -- en produktpost kan rymma flera varianter. */
    function seriesFor(fkey) {
      var list = HZ8.catalog.seriesWithFormat(fkey).filter(shown);
      if (fkey !== ctx.format.key) return list;
      return list.filter(function (s) {
        return !!document.querySelector('.hz8-ptool .hz8-popt[data-hz8-series="' + s.name.replace(/"/g, '\\"') + '"]');
      });
    }
    function option(value, label, meta, pressed, icon) {
      return '<button type="button" class="hz8-pquiz__opt' + (icon ? " has-icon" : "") + '" data-value="' + HZ8.esc(value) + '" aria-pressed="' + pressed + '">' +
        (icon ? '<span class="hz8-pquiz__icon" aria-hidden="true">' + icon + '</span>' : "") +
        '<span class="hz8-pquiz__label">' + HZ8.esc(label) + '</span>' + (meta ? '<span class="hz8-pquiz__meta">' + HZ8.esc(meta) + '</span>' : "") +
        '<span class="hz8-pquiz__check" aria-hidden="true"></span></button>';
    }
    var FORMAT_NOTE = { vapes: "Den här sidan", carts: "Kräver 510-batteri", batterier: "Till carts" };
    function render() {
      var all = steps();
      var step = all[Math.min(state.step, all.length - 1)];
      var last = state.step >= all.length - 1;
      var html = '<div class="hz8-pquiz__progress"><p>Steg ' + (state.step + 1) + ' av ' + all.length + '</p><ol class="hz8-pquiz__steps">' +
        all.map(function (s, i) { return '<li class="' + (i < state.step ? "is-done" : i === state.step ? "is-current" : "") + '"' + (i === state.step ? ' aria-current="step"' : "") + '>' + HZ8.esc(s.label) + '</li>'; }).join("") + '</ol></div>';
      if (step.key === "format") {
        html += '<fieldset class="hz8-pquiz__set"><legend class="hz8-pquiz__q">Vilket format söker du?</legend>' +
          formats.filter(function (f) { return counts[f.key] !== 0; }).map(function (f) {
            /* Sidans eget format: samma antal som sidan visar (pausade
               serier undantagna); andra format: målsidans räknare. */
            var cnt = f.key === ctx.format.key && getTotal ? getTotal() : counts[f.key];
            var meta = [FORMAT_NOTE[f.key], cnt ? plural(cnt) : ""].filter(Boolean).join(" · ");
            return option(f.key, f.label, meta, state.format === f.key, formatIcon(f.key));
          }).join("") + '</fieldset>';
      } else {
        html += '<fieldset class="hz8-pquiz__set hz8-pquiz__set--grid"><legend class="hz8-pquiz__q">Vilken cannabinoid eller serie?</legend>' +
          '<p class="hz8-pquiz__hint">Välj en eller flera – eller gå vidare utan val.</p>' +
          seriesFor(state.format).map(function (s) { return option(s.name, s.name, "", state.series.indexOf(s.name) !== -1); }).join("") + '</fieldset>';
      }
      dlg.body.innerHTML = html;
      var f = HZ8.catalog.formatByKey(state.format);
      var next = !last ? "Nästa" : f && f.key !== ctx.format.key ? "Gå till " + f.label.toLowerCase() : "Visa produkter";
      dlg.foot.innerHTML = (state.step > 0 ? '<button type="button" class="hz8-pghost hz8-pquiz__back">Tillbaka</button>' : "") +
        '<button type="button" class="hz8-pcta hz8-pquiz__next"' + (step.key === "format" && !state.format ? " disabled" : "") + '><span>' + HZ8.esc(next) + '</span>' + ARROW + '</button>';
      dlg.body.querySelectorAll(".hz8-pquiz__opt").forEach(function (b) {
        b.addEventListener("click", function () {
          var v = b.getAttribute("data-value");
          if (step.key === "format") { if (state.format !== v) state.series = []; state.format = v; }
          else { var i = state.series.indexOf(v); if (i === -1) state.series.push(v); else state.series.splice(i, 1); }
          render();
          var again = dlg.body.querySelector('.hz8-pquiz__opt[data-value="' + v.replace(/"/g, '\\"') + '"]');
          if (again) again.focus({ preventScroll: true });
        });
      });
      var back = dlg.foot.querySelector(".hz8-pquiz__back");
      if (back) back.addEventListener("click", function () { state.step -= 1; render(); focusFirst(); });
      dlg.foot.querySelector(".hz8-pquiz__next").addEventListener("click", function () {
        if (!last) { state.step += 1; render(); focusFirst(); return; }
        finish();
      });
    }
    function focusFirst() { var f = dlg.body.querySelector(".hz8-pquiz__opt"); if (f) f.focus({ preventScroll: true }); }
    function finish() {
      var f = HZ8.catalog.formatByKey(state.format);
      if (!f) return;
      var picker = getPicker();
      if (f.key === ctx.format.key && picker) {
        dlg.close();
        picker.apply(state.series.slice());
        scrollToProducts();
        return;
      }
      var href = f.href;
      var carry = HZ8.catalog.build().series.filter(function (s) { return state.series.indexOf(s.name) !== -1 && s.routes[f.key]; });
      if (carry.length && !f.seriesless) href += (href.indexOf("?") === -1 ? "?" : "&") + HZ8.catalog.seriesParam + "=" + carry.map(HZ8.catalog.seriesSlug).join(",");
      location.href = HZ8.link(href);
    }
    return {
      open: function () {
        state = { step: 0, format: null, series: [] };
        render();
        dlg.open();
      },
      steps: function () { return steps().map(function (s) { return s.label; }); }
    };
  }

  function scrollToProducts() {
    var target = document.querySelector("html.hz8-series-union .hz8-series-results") || document.getElementById("category-products") || document.querySelector(".hz8-ptool");
    if (!target) return;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  /* ---- Utforska våra serier: efter produkterna, riktiga seriesidor.
     Antal visas bara för seriens egen hubbsida och märks "totalt" (hela
     serien över alla format) -- aldrig blandat med sidans egna antal. ---- */
  function seriesBand(root, ctx) {
    var key = ctx.format.key;
    var list = HZ8.catalog.seriesWithFormat(key).filter(shown);
    if (!list.length) return;
    var band = node("section", "hz8-pseries");
    band.setAttribute("aria-labelledby", "hz8-pseries-title");
    band.innerHTML = '<div class="hz8-pseries__head"><p class="hz8-kicker">Våra serier</p><h2 id="hz8-pseries-title">Utforska våra serier</h2>' +
      '<p class="hz8-pseries__lead">Varje serie har en egen sida med hela sortimentet.</p></div>' +
      '<ul class="hz8-pseries__list" role="list"></ul>' +
      '<div class="hz8-pseries__nav" hidden><button type="button" class="hz8-pseries__step" data-dir="-1" aria-label="Föregående serie">' + CHEV + '</button>' +
      '<button type="button" class="hz8-pseries__step" data-dir="1" aria-label="Nästa serie">' + CHEV + '</button></div>';
    var ul = band.querySelector("ul");
    var MAX = 4;
    /* Platshållare med kortens höjd så att innehållet nedanför inte
       flyttas när seriedatan kommer (ingen layoutskift). */
    for (var i = 0; i < Math.min(MAX, list.length); i += 1) ul.insertAdjacentHTML("beforeend", '<li class="hz8-pseries__item is-loading" aria-hidden="true"><span class="hz8-pseries__card"></span></li>');
    root.appendChild(band);
    Promise.all(list.map(function (s) {
      var href = HZ8.catalog.landingFor(s, key);
      return HZ8.fetchPage(href, HZ8.categoryInfo).then(function (info) { return { s: s, href: href, info: info }; }).catch(function () { return null; });
    })).then(function (rows) {
      rows = rows.filter(function (r) { return r && r.info && r.info.count > 0; }).slice(0, MAX);
      ul.querySelectorAll(".is-loading").forEach(function (li) { li.remove(); });
      if (!rows.length) { band.remove(); return; }
      rows.forEach(function (r) {
        var isHub = r.s.hub && HZ8.path(r.href) === HZ8.path(r.s.hub);
        var li = node("li", "hz8-pseries__item");
        li.innerHTML = '<a class="hz8-pseries__card" href="' + HZ8.esc(HZ8.link(r.href)) + '">' +
          '<span class="hz8-pseries__text"><span class="hz8-pseries__name">' + HZ8.esc(r.s.name) + '</span>' +
          (isHub ? '<span class="hz8-pseries__count">' + plural(r.info.count) + ' totalt</span>' : "") +
          '<span class="hz8-pseries__cta">Visa serien ' + ARROW + '</span></span>' +
          '<span class="hz8-pseries__media" aria-hidden="true">' + (r.info.image ? '<img src="' + HZ8.esc(r.info.image) + '" alt="" loading="lazy" decoding="async" width="200" height="200">' : "") + '</span></a>';
        var img = li.querySelector("img");
        if (img) img.addEventListener("error", function () { img.remove(); });
        ul.appendChild(li);
      });
      wireRail(band, ul);
    });
  }
  function wireRail(band, ul) {
    var nav = band.querySelector(".hz8-pseries__nav");
    function sync() {
      var more = ul.scrollWidth - ul.clientWidth > 4;
      nav.hidden = !more;
      if (!more) return;
      nav.querySelector('[data-dir="-1"]').disabled = ul.scrollLeft < 4;
      nav.querySelector('[data-dir="1"]').disabled = ul.scrollLeft > ul.scrollWidth - ul.clientWidth - 4;
    }
    nav.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        var item = ul.querySelector(".hz8-pseries__item");
        var step = item ? item.getBoundingClientRect().width + 12 : ul.clientWidth * .8;
        var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        ul.scrollBy({ left: step * Number(b.getAttribute("data-dir")), behavior: reduce ? "auto" : "smooth" });
      });
    });
    ul.addEventListener("scroll", function () { window.requestAnimationFrame(sync); }, { passive: true });
    window.addEventListener("resize", sync);
    sync();
  }

  /* ---- Produkttyp (köpintention) ----
     Nyehandel har ingen strukturerad volym-/typdimension inom Alla Vapes
     (inga underkategorier eller filtergrupper; headerns "1/2/5 ml
     engångsvapes" saknar routes). Typen härleds därför ur de riktiga
     produktnamnens verifierbara format ("Vape - ... - 2ml", "Vape Dual -
     ... - 1+1ml"). Ett namn utan säker volym klassas inte (ligger kvar
     under Alla). Alternativ byggs ur sidans fullständiga produktlista --
     nya volymer (t.ex. 5 ml) dyker upp automatiskt, 0 träffar = dolt.
     Övriga produkttyper (carts, batterier, refill) är egna sidor och
     visas som riktiga länkar, aldrig som filter. */
  var TYPE_PARAM = "typ";
  function cardType(name) {
    var n = String(name || "").replace(/&amp;/g, "&");
    var dual = n.match(/(\d+(?:[.,]\d+)?)\s*\+\s*(\d+(?:[.,]\d+)?)\s*ml\b/i);
    if (dual && /\bdual\b/i.test(n)) return { key: "dual-" + dual[1] + "-" + dual[2], label: "Dual " + dual[1] + "+" + dual[2] + " ml", order: 1000 };
    var all = n.match(/(\d+(?:[.,]\d+)?)\s*ml\b/gi);
    if (!all || /\+/.test(all[all.length - 1])) return null;
    var v = all[all.length - 1].replace(/\s*ml/i, "").replace(",", ".");
    return { key: v.replace(".", "-") + "ml", label: v.replace(".", ",") + " ml vape", order: -parseFloat(v) };
  }
  function typeOptions(cards, exclude) {
    var byKey = {};
    cards.forEach(function (c) {
      var p = cardPath(c.html);
      if (exclude && p && exclude(p)) return;
      var t = cardType(cardName(c.html));
      if (!t) return;
      (byKey[t.key] = byKey[t.key] || { key: t.key, label: t.label, order: t.order, n: 0 }).n += 1;
    });
    return Object.keys(byKey).map(function (k) { return byKey[k]; }).sort(function (a, b) { return a.order - b.order; });
  }
  function readTypes() {
    var raw = new URLSearchParams(location.search).get(TYPE_PARAM);
    return raw ? raw.split(",").filter(Boolean) : [];
  }
  function writeTypes(list) {
    var url = new URL(location.href);
    if (list.length) url.searchParams.set(TYPE_PARAM, list.join(",")); else url.searchParams.delete(TYPE_PARAM);
    if (url.href !== location.href) history.pushState(history.state, "", url.pathname + url.search + url.hash);
  }
  /* Andra produkttyper i samma familj: riktiga sidor, storlekar ur
     respektive sidas egna produktnamn när de finns. */
  function otherTypes(ctx, list, group, onReady) {
    var jobs = [];
    HZ8.catalog.familyFormats(ctx.format.key).forEach(function (f) {
      if (f.key === ctx.format.key) return;
      var a = node("a", "hz8-pother");
      a.href = HZ8.link(f.href);
      a.hidden = true;
      a.innerHTML = '<span class="hz8-pother__text"><span class="hz8-pother__name">' + HZ8.esc(f.label) + '</span><span class="hz8-pother__where">Egen sida</span></span>' +
        '<span class="hz8-pother__cta" aria-hidden="true"><span>Visa produkter</span>' + ARROW + '</span>';
      a.setAttribute("aria-label", f.label + ", egen sida. Visa produkter");
      list.appendChild(a);
      jobs.push(allCards(f.href).then(function (cards) {
        if (!cards.length) { a.remove(); return; }
        var sizes = [];
        cards.forEach(function (c) { var t = cardType(cardName(c.html)); if (t && sizes.indexOf(t.label.replace(/ vape$/, "")) === -1) sizes.push(t.label.replace(/ vape$/, "")); });
        if (sizes.length) a.querySelector(".hz8-pother__where").textContent = "Egen sida · " + joinSv(sizes);
        a.hidden = false;
      }).catch(function () { a.remove(); }));
    });
    Promise.all(jobs).then(function () { group.hidden = !list.querySelector(".hz8-pother:not([hidden])"); if (onReady) onReady(); });
  }

  /* ---- Produktkort: serie, lagerstatus och tydlig köphandling.
     Serie och lager läggs i .details (grid i CSS) så att pris och
     knapp hamnar på samma nivå oavsett namnlängd. ---- */
  var pilotStock = null;   // { path: true } för produkter i lager, null = okänt
  var pilotPaused = null;  // { path: true } produkter i pausade serier (ur seriernas riktiga routes)
  var pilotSeries = {};    // path -> [serie]
  function cardHref(card) {
    var a = card.querySelector("a.product-card__image[href], .details a[href]");
    return a ? HZ8.path(a.getAttribute("href")).split("?")[0].replace(/\/\d+$/, "") : "";
  }
  function syncPilotCards() {
    document.querySelectorAll("#category-products .product-card, .hz8-series-results .product-card").forEach(function (card) {
      var path = cardHref(card);
      var details = card.querySelector(".details");
      var wrapper = card.querySelector(".details-wrapper");
      if (!path || !details || !wrapper) return;
      var paused = !!(pilotPaused && pilotPaused[path]);
      if (card.classList.contains("hz8-paused") !== paused) card.classList.toggle("hz8-paused", paused);
      var cell = card.parentNode;
      if (cell && cell !== document.body && cell.classList.contains("hz8-paused-cell") !== paused) cell.classList.toggle("hz8-paused-cell", paused);
      var metaText = (pilotSeries[path] || []).join(" · ");
      var meta = details.querySelector(".hz8-pmeta");
      if (!meta) { meta = node("p", "hz8-pmeta"); details.appendChild(meta); }
      if (meta.textContent !== metaText) meta.textContent = metaText;

      /* Lagerraden finns från start (tom, reserverad höjd) så att kortet
         inte växer när lagerdatan kommer -- annars layoutskift. */
      var stock = details.querySelector(".hz8-pstock");
      if (!stock) { stock = node("p", "hz8-pstock is-pending"); stock.setAttribute("aria-hidden", "true"); details.appendChild(stock); }
      if (!pilotStock) return;
      var inStock = !!pilotStock[path];
      stock.classList.remove("is-pending");
      stock.removeAttribute("aria-hidden");
      var label = inStock ? "I lager" : "Slut i lager";
      if (stock.textContent !== label) stock.textContent = label;
      stock.classList.toggle("is-out", !inStock);
      card.classList.toggle("hz8-is-soldout", !inStock);
      var sold = wrapper.querySelector(".hz8-psold");
      if (!inStock && !sold) {
        var name = card.querySelector(".name");
        sold = node("a", "hz8-psold", "Slutsåld");
        sold.href = HZ8.link(card.querySelector("a[href]").getAttribute("href"));
        sold.setAttribute("aria-label", "Slutsåld: " + (name ? name.textContent.trim() : "") + ". Visa produkten");
        wrapper.appendChild(sold);
      } else if (inStock && sold) sold.remove();
    });
  }
  var pilotPausedReady = null;
  function loadCardData(ctx) {
    var key = ctx.format.key;
    allCards(ctx.format.href + "?filters=" + STOCK_TOKEN).then(function (cards) {
      var set = {};
      cards.forEach(function (c) { var p = cardPath(c.html); if (p) set[p] = true; });
      pilotStock = set;
      syncPilotCards();
    }).catch(function () {
      /* Okänd lagerstatus: ingen rad (reserverad plats ligger kvar tom,
         osynlig), köpknappen avgör vid klick. */
    });
    /* Pausade serier (PILOT_PAUSED) klassas med samma källa som övriga
       serier: produkterna på seriens riktiga route i formatet. Misslyckas
       hämtningen döljs inget (ingen gissning på namn). */
    var paused = HZ8.catalog.seriesWithFormat(key).filter(function (s) { return !shown(s); });
    Promise.all(paused.map(function (s) { return allCards(s.routes[key]); })).then(function (lists) {
      var set = {};
      lists.forEach(function (cards) { cards.forEach(function (c) { var p = cardPath(c.html); if (p) set[p] = true; }); });
      pilotPaused = set;
      syncPilotCards();
      if (pilotPausedReady) pilotPausedReady();
    }).catch(function () {});
    HZ8.catalog.seriesWithFormat(key).filter(shown).forEach(function (s) {
      allCards(s.routes[key]).then(function (cards) {
        cards.forEach(function (c) {
          var p = cardPath(c.html);
          if (!p) return;
          (pilotSeries[p] = pilotSeries[p] || []);
          if (pilotSeries[p].indexOf(s.name) === -1) pilotSeries[p].push(s.name);
        });
        syncPilotCards();
      }).catch(function () {});
    });
  }

  /* Dragspelssektion i filterarket: rubrik + kort sammanfattning
     (valda alternativ eller vad sektionen innehåller). */
  function accSection(key, title, id, body) {
    return '<section class="hz8-pacc" data-acc="' + HZ8.esc(key) + '"><h3 class="hz8-pacc__h"><button type="button" class="hz8-pacc__btn" aria-expanded="false" aria-controls="' + id + '">' +
      '<span class="hz8-pacc__t"><span class="hz8-pacc__title">' + HZ8.esc(title) + '</span><span class="hz8-pacc__sum"></span></span>' + CHEV + '</button></h3>' +
      '<div class="hz8-pacc__body" id="' + id + '" hidden>' + body + '</div></section>';
  }
  function setSum(section, text, chosen) {
    var el = section && section.querySelector(".hz8-pacc__sum");
    if (!el) return;
    if (el.textContent !== text) el.textContent = text;
    el.classList.toggle("is-chosen", !!chosen);
  }

  /* ---- Verktygsrad, popovers, filterark, chips ---- */
  function buildPilot(root, ctx) {
    var html = document.documentElement;
    html.classList.add("hz8-cat-pilot");
    /* Kompakt actionrad (07): "Lägg till" med påse, "Välj alternativ →"
       (kort "Välj →" på mobil), aldrig plus-only. */
    HZ8.cardLabels = {
      add: "Lägg till", addShort: "Lägg till", variants: "Välj alternativ", variantsShort: "Välj",
      addIcon: '<svg class="hz8-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 8h12l-1 12H7z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/></svg>',
      variantsIcon: ARROW
    };
    if (HZ8.relabelCards) HZ8.relabelCards();
    var countEl = pilotMasthead(root, ctx);
    pilotDecor(root);
    var picker = null;

    var tool = node("div", "hz8-ptool");
    tool.setAttribute("role", "group");
    tool.setAttribute("aria-label", "Filtrera och sortera");
    tool.innerHTML =
      '<div class="hz8-ptool__desk">' +
        '<div class="hz8-ptool__slot hz8-ptool__type" hidden><button type="button" class="hz8-ptool__btn" data-pt="type"><span>Produkttyp</span><span class="hz8-ptool__n" data-n="type" hidden></span> ' + CHEV + '</button>' +
          '<div class="hz8-ppop hz8-ppop--type" id="hz8-ppop-type" role="dialog" aria-label="Produkttyp">' +
            '<p class="hz8-ppop__h">' + HZ8.esc(ctx.format.label) + ' på den här sidan</p><div class="hz8-popts" data-pt-types></div>' +
            '<div class="hz8-ppop__other" hidden><p class="hz8-ppop__h">Andra produkttyper</p><div class="hz8-pothers"></div></div>' +
            '<div class="hz8-ppop__foot"><button type="button" class="hz8-plink" data-pt="clear-types">Rensa</button>' +
            '<button type="button" class="hz8-pcta hz8-pshow" data-pt="show">Visa produkter</button></div></div></div>' +
        '<div class="hz8-ptool__slot"><button type="button" class="hz8-ptool__btn" data-pt="series"><span>Cannabinoid / serie</span><span class="hz8-ptool__n" hidden></span> ' + CHEV + '</button>' +
          '<div class="hz8-ppop hz8-ppop--series" id="hz8-ppop-series" role="dialog" aria-label="Cannabinoid / serie">' +
            '<label class="hz8-psearch"><span class="hz8-visually-hidden">Sök cannabinoid eller serie</span>' + HZ8.icon("search") + '<input type="search" placeholder="Sök cannabinoid eller serie" autocomplete="off" spellcheck="false"></label>' +
            '<p class="hz8-psearch__empty" hidden>Ingen cannabinoid eller serie matchar.</p>' +
            '<p class="hz8-ppop__h">Finns som ' + HZ8.esc(ctx.format.label.toLowerCase().replace(/s$/, "")) + '</p><div class="hz8-popts" data-pt-series></div>' +
            '<div class="hz8-ppop__other" hidden><p class="hz8-ppop__h">Finns i andra format</p><div class="hz8-pothers"></div></div>' +
            '<div class="hz8-ppop__foot"><button type="button" class="hz8-plink" data-pt="clear-series">Rensa</button>' +
            '<button type="button" class="hz8-pcta hz8-pshow" data-pt="show">Visa produkter</button></div></div></div>' +
        '<button type="button" class="hz8-ptool__btn hz8-pswitch" role="switch" aria-checked="false" data-pt="stock" hidden>I lager <span class="hz8-pswitch__track" aria-hidden="true"></span></button>' +
        '<button type="button" class="hz8-ptool__btn" data-pt="all" aria-haspopup="dialog">' + SLIDERS + ' Alla filter</button>' +
        '<div class="hz8-ptool__slot hz8-ptool__sort"><button type="button" class="hz8-ptool__btn" data-pt="sort"><span class="hz8-psort-label">Sortera</span> ' + CHEV + '</button>' +
          '<div class="hz8-ppop hz8-ppop--sort" id="hz8-ppop-sort" role="dialog" aria-label="Sortera"><div class="hz8-psorts"></div></div></div>' +
      '</div>' +
      '<div class="hz8-ptool__mob">' +
        '<button type="button" class="hz8-ptool__btn hz8-ptool__filter" data-pt="sheet" aria-haspopup="dialog">' + SLIDERS + ' <span class="hz8-pfilter-label">Filter</span></button>' +
        '<button type="button" class="hz8-ptool__btn" data-pt="sort-sheet" aria-haspopup="dialog">' + SORTICON + ' <span class="hz8-psort-label">Sortera</span></button>' +
      '</div>' +
      '<p class="hz8-visually-hidden" role="status" aria-live="polite" data-pt="live"></p>';
    root.appendChild(tool);

    var chips = node("div", "hz8-pchips");
    chips.hidden = true;
    chips.innerHTML = '<span class="hz8-pchips__label">Aktiva filter:</span><ul class="hz8-pchips__list" role="list" aria-label="Aktiva filter"></ul>';
    root.appendChild(chips);
    var statusHost = node("div", "hz8-pstatus");
    root.appendChild(statusHost);

    /* Filterark (mobil bottom sheet, desktop "Alla filter"-panel). */
    var fs = sheet("hz8-pfilter", "Filter", "filter");
    var sections = [
      { key: "type", title: "Produkttyp" },
      { key: "series", title: "Cannabinoid / serie" },
      { key: "stock", title: "Tillgänglighet" }
    ];
    fs.body.innerHTML = sections.map(function (s) {
      return accSection(s.key, s.title, "hz8-pacc-" + s.key, "");
    }).join("") + '<div class="hz8-pacc-mirror"></div>';
    fs.body.insertAdjacentHTML("afterbegin", '<p class="hz8-pfilter__note">Begränsar produkterna på den här sidan.</p>');
    fs.foot.innerHTML = '<button type="button" class="hz8-pghost hz8-pclear-all">Rensa</button><button type="button" class="hz8-pcta hz8-pshow">Visa produkter</button>';
    var acc = function (k) { return fs.body.querySelector('[data-acc="' + k + '"] .hz8-pacc__body'); };
    acc("series").innerHTML = '<label class="hz8-psearch"><span class="hz8-visually-hidden">Sök cannabinoid eller serie</span>' + HZ8.icon("search") + '<input type="search" placeholder="Sök cannabinoid eller serie" autocomplete="off" spellcheck="false"></label>' +
    '<p class="hz8-psearch__empty" hidden>Ingen cannabinoid eller serie matchar.</p>' +
      '<p class="hz8-ppop__h">Finns som ' + HZ8.esc(ctx.format.label.toLowerCase().replace(/s$/, "")) + '</p><div class="hz8-popts" data-pt-series></div>' +
      '<div class="hz8-ppop__other" hidden><p class="hz8-ppop__h">Finns i andra format</p><div class="hz8-pothers"></div></div>';
    acc("type").innerHTML = '<p class="hz8-ppop__h">' + HZ8.esc(ctx.format.label) + ' på den här sidan</p><div class="hz8-popts" data-pt-types></div>' +
      '<div class="hz8-ppop__other" hidden><p class="hz8-ppop__h">Andra produkttyper</p><div class="hz8-pothers"></div></div>';
    fs.body.querySelector('[data-acc="type"]').hidden = true;
    acc("stock").innerHTML = '<button type="button" class="hz8-popt__btn hz8-pstock-opt" aria-pressed="false"><span class="hz8-popt__box" aria-hidden="true"></span><span class="hz8-rail__label">I lager</span></button>';

    function openSection(keyName) {
      fs.body.querySelectorAll(".hz8-pacc").forEach(function (s) {
        var on = s.getAttribute("data-acc") === keyName;
        s.querySelector(".hz8-pacc__btn").setAttribute("aria-expanded", String(on));
        s.querySelector(".hz8-pacc__body").hidden = !on;
      });
    }
    fs.body.addEventListener("click", function (e) {
      var b = e.target.closest(".hz8-pacc__btn");
      if (!b) return;
      var sec = b.closest(".hz8-pacc");
      openSection(b.getAttribute("aria-expanded") === "true" ? null : sec.getAttribute("data-acc"));
    });

    /* Sorteringsark (mobil). */
    var ss = sheet("hz8-psortsheet", "Sortera", "sort");
    ss.body.innerHTML = '<div class="hz8-psorts"></div>';

    /* Innehåll som finns i både popover och ark. */
    [tool.querySelector("#hz8-ppop-series"), fs.el.querySelector('[data-acc="series"]')].forEach(function (scope) {
      scope.querySelector("[data-pt-series]").innerHTML = seriesOptions(ctx);
      var otherGroup = scope.querySelector(".hz8-ppop__other");
      otherFormats(ctx, scope.querySelector(".hz8-pothers"), otherGroup);
      /* Lokal sökning i listan -- filtrerar bara vilka rader som syns,
         valen går fortfarande via flervalet/Nyehandel. */
      var input = scope.querySelector(".hz8-psearch input");
      var empty = scope.querySelector(".hz8-psearch__empty");
      input.addEventListener("input", function () {
        var q = input.value.trim().toLowerCase();
        var any = false;
        scope.querySelectorAll(".hz8-popt[data-hz8-series], .hz8-pother").forEach(function (row) {
          var name = (row.getAttribute("data-hz8-series") || (row.querySelector(".hz8-pother__name") || {}).textContent || "").toLowerCase();
          var hit = !q || name.replace(/[^a-z0-9åäö]/g, "").indexOf(q.replace(/[^a-z0-9åäö]/g, "")) !== -1;
          row.classList.toggle("is-filtered", !hit);
          if (hit && !row.hidden) any = true;
        });
        var vapeHead = scope.querySelector("[data-pt-series]").previousElementSibling;
        if (vapeHead) vapeHead.hidden = !scope.querySelector(".hz8-popt[data-hz8-series]:not(.is-filtered)");
        if (otherGroup.hz8Sync) otherGroup.hz8Sync();
        empty.hidden = any;
      });
    });

    /* Produkttyp: alternativ ur sidans fullständiga lista (riktiga namn),
       pausade serier undantagna. */
    var typeOpts = [];
    function excludePaused(path) { return !!(pilotPaused && pilotPaused[path]); }
    var typeExtra = {
      active: function () { return readTypes().some(function (k) { return typeOpts.some(function (o) { return o.key === k; }); }); },
      key: function () { return readTypes().join(","); },
      test: function (c) { var t = cardType(cardName(c.html)); return !!t && readTypes().indexOf(t.key) !== -1; }
    };
    function renderTypes() {
      var sel = readTypes();
      document.querySelectorAll("[data-pt-types]").forEach(function (box) {
        var sig = typeOpts.map(function (o) { return o.key; }).join("|");
        if (box.getAttribute("data-sig") !== sig) {
          box.setAttribute("data-sig", sig);
          box.innerHTML = typeOpts.map(function (o) {
            return '<div class="hz8-popt" data-hz8-type="' + HZ8.esc(o.key) + '"><button type="button" class="hz8-popt__btn" aria-pressed="false"><span class="hz8-popt__box" aria-hidden="true"></span><span class="hz8-rail__label">' + HZ8.esc(o.label) + '</span></button></div>';
          }).join("");
        }
        box.querySelectorAll("[data-hz8-type]").forEach(function (row) {
          row.querySelector("button").setAttribute("aria-pressed", String(sel.indexOf(row.getAttribute("data-hz8-type")) !== -1));
        });
      });
      var has = typeOpts.length > 1 || !!document.querySelector(".hz8-ppop--type .hz8-pother:not([hidden])");
      tool.querySelector(".hz8-ptool__type").hidden = !has;
      fs.body.querySelector('[data-acc="type"]').hidden = !has;
    }
    function applyTypes(list) {
      writeTypes(list);
      renderTypes();
      if (picker) picker.sync();
      schedule();
    }
    document.addEventListener("click", function (e) {
      var row = e.target.closest("[data-hz8-type]");
      if (!row || !row.closest(".hz8-ptool, #hz8-pfilter")) return;
      var k = row.getAttribute("data-hz8-type");
      var sel = readTypes();
      var i = sel.indexOf(k);
      if (i === -1) sel.push(k); else sel.splice(i, 1);
      applyTypes(sel);
    });
    [tool, fs.el].forEach(function (scope) {
      var group = scope.querySelector(".hz8-ppop--type .hz8-ppop__other, [data-acc=\"type\"] .hz8-ppop__other");
      otherTypes(ctx, group.querySelector(".hz8-pothers"), group, renderTypes);
    });
    function loadTypes() {
      allCards(ctx.format.href).then(function (cards) {
        typeOpts = typeOptions(cards, excludePaused);
        renderTypes();
        if (picker && typeExtra.active()) picker.sync();
      }).catch(function () { /* utan fullständig lista: ingen produkttypskontroll */ });
    }
    pilotPausedReady = function () { loadTypes(); if (picker) picker.sync(); schedule(); };

    var quiz = buildQuiz(ctx, function () { return picker; }, function () { return total(); });
    var guide = pilotGuide(root, quiz.steps(), function () { quiz.open(); });

    /* Flervalsmotorn (samma som övriga formatsidor). */
    var seriesRoots = [tool.querySelector("[data-pt-series]"), fs.el.querySelector("[data-pt-series]")];
    if (seriesRoots[0].children.length) {
      picker = seriesPicker(root, ctx, seriesRoots[0], {
        roots: seriesRoots,
        statusHost: statusHost,
        linkScope: document,
        /* Inga antal i listan: en produktpost kan rymma flera varianter,
           så "1" vore kundmässigt missvisande. Antalet styr bara att
           serier utan produkter döljs. */
        countText: function () { return ""; },
        onUpdate: function () { schedule(); },
        extra: typeExtra,
        exclude: excludePaused
      });
      if (picker) { html.classList.add("hz8-series-picker"); activePicker = picker; }
    }

    loadTypes();
    var pops = {
      type: popover(tool.querySelector('[data-pt="type"]'), tool.querySelector("#hz8-ppop-type")),
      series: popover(tool.querySelector('[data-pt="series"]'), tool.querySelector("#hz8-ppop-series")),
      sort: popover(tool.querySelector('[data-pt="sort"]'), tool.querySelector("#hz8-ppop-sort"))
    };

    /* Antal: unionens resultat, annars Nyehandels räknare minus dolda
       pausade kort på sidan (alla Alla Vapes-produkter ryms på en sida). */
    function total() {
      if (picker && picker.pending()) return null;
      if (picker && picker.active()) return picker.total();
      var n = nativeCount();
      if (n == null) return null;
      return Math.max(0, n - document.querySelectorAll("#category-products .product-card.hz8-paused").length);
    }
    function chipData() {
      var out = [];
      readTypes().forEach(function (k) {
        var o = typeOpts.filter(function (x) { return x.key === k; })[0];
        if (o) out.push({ label: o.label, remove: function () { applyTypes(readTypes().filter(function (x) { return x !== k; })); } });
      });
      if (picker) picker.selected().forEach(function (n) {
        out.push({ label: n, remove: function () { picker.apply(picker.selected().filter(function (x) { return x !== n; })); } });
      });
      nativeChips().forEach(function (c) {
        out.push({ label: c.label === "Finns i lager" ? "I lager" : c.label, remove: function () {
          var again = nativeChips().filter(function (x) { return x.label === c.label; })[0];
          if (again && again.remove) again.remove.click();
        } });
      });
      return out;
    }
    function clearAll() {
      if (readTypes().length) writeTypes([]);
      renderTypes();
      if (picker && picker.selected().length) picker.apply([]); else if (picker) picker.sync();
      var clear = document.querySelector(".category-sort .product-filter__clear");
      if (clear) clear.click();
    }

    tool.addEventListener("click", function (e) {
      var b = e.target.closest("[data-pt]");
      if (!b) return;
      var k = b.getAttribute("data-pt");
      if (k === "stock") { var o = stockOption(); if (o) toggleNative(STOCK_GROUP, o.label); }
      else if (k === "all") { openSection(null); fs.open(); }
      else if (k === "sheet") { openSection(picker ? "series" : null); fs.open(); }
      else if (k === "sort-sheet") ss.open();
      else if (k === "clear-series") { if (picker) picker.apply([]); }
      else if (k === "clear-types") applyTypes([]);
      else if (k === "show") { if (openPop) openPop.close(false); scrollToProducts(); }
    });
    fs.el.querySelector(".hz8-pclear-all").addEventListener("click", clearAll);
    fs.el.querySelector(".hz8-pshow").addEventListener("click", function () { fs.close(); scrollToProducts(); });
    fs.el.querySelector(".hz8-pstock-opt").addEventListener("click", function () { var o = stockOption(); if (o) toggleNative(STOCK_GROUP, o.label); });

    /* Speglade native-grupper (t.ex. Varumärke) i filterarket. */
    var mirror = fs.body.querySelector(".hz8-pacc-mirror");
    function syncMirror() {
      var groups = nativeGroups().filter(function (g) { return !MIRROR_SKIP[g.name] && g.options.length > 0 && !filterGroupHidden(g.name, g.options.length); });
      var sig = groups.map(function (g) { return g.name + ":" + g.options.map(function (o) { return o.label; }).join(","); }).join("|");
      if (mirror.getAttribute("data-sig") !== sig) {
        var openKey = (fs.body.querySelector('.hz8-pacc__btn[aria-expanded="true"]') || { closest: function () { return null; } }).closest(".hz8-pacc");
        openKey = openKey && openKey.getAttribute("data-acc");
        var focusLabel = document.activeElement && mirror.contains(document.activeElement) ? document.activeElement.getAttribute("data-label") : null;
        mirror.setAttribute("data-sig", sig);
        mirror.innerHTML = groups.map(function (g, i) {
          return accSection("m-" + g.name, g.name, "hz8-pacc-m" + i, g.options.map(function (o) {
            return '<button type="button" class="hz8-popt__btn" data-group="' + HZ8.esc(g.name) + '" data-label="' + HZ8.esc(o.label) + '" aria-pressed="false"><span class="hz8-popt__box" aria-hidden="true"></span><span class="hz8-rail__label">' + HZ8.esc(o.label) + '</span></button>';
          }).join(""));
        }).join("");
        if (openKey) openSection(openKey);
        if (focusLabel) { var f = mirror.querySelector('[data-label="' + focusLabel.replace(/"/g, '\\"') + '"]'); if (f) f.focus({ preventScroll: true }); }
      }
      groups.forEach(function (g) {
        g.options.forEach(function (o) {
          mirror.querySelectorAll('.hz8-popt__btn[data-group="' + g.name.replace(/"/g, '\\"') + '"]').forEach(function (b) {
            if (b.getAttribute("data-label") === o.label) b.setAttribute("aria-pressed", String(o.checked));
          });
        });
        var picked = g.options.filter(function (o) { return o.checked; }).map(function (o) { return o.label; });
        var sec = mirror.querySelector('[data-acc="m-' + g.name.replace(/"/g, '\\"') + '"]');
        setSum(sec, picked.length ? "Valt: " + picked.join(", ") : g.options.length + (g.name === "Varumärke" ? " tillverkare" : " alternativ"), picked.length);
      });
    }
    mirror.addEventListener("click", function (e) {
      var b = e.target.closest(".hz8-popt__btn[data-group]");
      if (b) toggleNative(b.getAttribute("data-group"), b.getAttribute("data-label"));
    });

    /* Sortering. */
    function syncSort() {
      var opts = sortOptions();
      var cur = currentSort();
      var label = cur ? SORT_LABELS[cur] : "";
      document.querySelectorAll(".hz8-psort-label").forEach(function (l) {
        /* Aktuellt läge i eget span: smala mobiler visar bara "Sortera"
           (knappens aria-label behåller hela texten). */
        var t = label ? "Sortera: " + label : "Sortera";
        if (l.textContent !== t) l.innerHTML = "Sortera" + (label ? '<span class="hz8-psort-cur">: ' + HZ8.esc(label) + "</span>" : "");
        var btn = l.closest("button");
        if (btn) btn.setAttribute("aria-label", t);
      });
      document.querySelectorAll(".hz8-psorts").forEach(function (box) {
        var sig = opts.map(function (o) { return o.native; }).join("|") + "#" + cur;
        if (box.getAttribute("data-sig") === sig) return;
        var hadFocus = box.contains(document.activeElement);
        box.setAttribute("data-sig", sig);
        box.innerHTML = opts.map(function (o) {
          return '<button type="button" class="hz8-psort" data-native="' + HZ8.esc(o.native) + '"' + (o.native === cur ? ' aria-current="true"' : "") + '>' + HZ8.esc(o.label) + '</button>';
        }).join("");
        if (hadFocus) { var f = box.querySelector('[aria-current="true"]') || box.firstChild; if (f) f.focus({ preventScroll: true }); }
      });
    }
    document.addEventListener("click", function (e) {
      var b = e.target.closest(".hz8-psort");
      if (!b) return;
      var o = sortOptions().filter(function (x) { return x.native === b.getAttribute("data-native"); })[0];
      if (pops.sort) pops.sort.close(true);
      ss.close();
      if (o) o.el.click();
    });

    /* Chips + räknare + tillstånd. */
    var chipList = chips.querySelector("ul");
    var live = tool.querySelector('[data-pt="live"]');
    var lastLive = null;
    var timer = 0;
    function schedule() { if (!timer) timer = window.setTimeout(function () { timer = 0; syncAll(); }, 60); }
    function syncAll() {
      var data = chipData();
      var sig = data.map(function (d) { return d.label; }).join("|");
      if (chipList.getAttribute("data-sig") !== sig) {
        var focused = chipList.contains(document.activeElement);
        chipList.setAttribute("data-sig", sig);
        chipList.innerHTML = "";
        data.forEach(function (d) {
          var li = node("li");
          var b = node("button", "hz8-pchip", HZ8.esc(d.label) + '<span aria-hidden="true">×</span>');
          b.type = "button";
          b.setAttribute("aria-label", "Ta bort filter: " + d.label);
          b.addEventListener("click", d.remove);
          li.appendChild(b);
          chipList.appendChild(li);
        });
        if (data.length) {
          var li2 = node("li");
          var c = node("button", "hz8-plink hz8-pchips__clear", "Rensa alla");
          c.type = "button";
          c.addEventListener("click", clearAll);
          li2.appendChild(c);
          chipList.appendChild(li2);
        }
        chips.hidden = !data.length;
        if (focused) { var f = chipList.querySelector("button"); if (f) f.focus({ preventScroll: true }); else tool.querySelector(".hz8-ptool__btn").focus({ preventScroll: true }); }
      }
      var n = total();
      var countText = n == null ? "" : plural(n);
      if (countEl.textContent !== countText) countEl.textContent = countText;
      document.querySelectorAll(".hz8-pshow").forEach(function (b) {
        var t = n == null ? "Visa produkter" : "Visa produkter (" + n + ")";
        if (b.textContent !== t) b.textContent = t;
      });
      var fl = data.length ? "Filter (" + data.length + ")" : "Filter";
      tool.querySelectorAll(".hz8-pfilter-label").forEach(function (l) { if (l.textContent !== fl) l.textContent = fl; });
      tool.querySelector(".hz8-ptool__filter").classList.toggle("is-active", !!data.length);
      var sel = picker ? picker.selected() : [];
      var tsel = readTypes().filter(function (k) { return typeOpts.some(function (o) { return o.key === k; }); });
      var tn = tool.querySelector('[data-n="type"]');
      tn.hidden = !tsel.length;
      tn.textContent = tsel.length ? String(tsel.length) : "";
      tool.querySelector('[data-pt="type"]').classList.toggle("is-active", !!tsel.length);
      setSum(fs.body.querySelector('[data-acc="type"]'), tsel.length ? "Valt: " + tsel.map(function (k) { return typeOpts.filter(function (o) { return o.key === k; })[0].label; }).join(", ") : typeOpts.map(function (o) { return o.label; }).join(", "), tsel.length);
      var sn = tool.querySelector('[data-pt="series"] .hz8-ptool__n');
      sn.hidden = !sel.length;
      sn.textContent = sel.length ? String(sel.length) : "";
      tool.querySelector('[data-pt="series"]').classList.toggle("is-active", !!sel.length);
      var names = Array.prototype.map.call(tool.querySelectorAll(".hz8-popt[data-hz8-series]"), function (o) { return o.getAttribute("data-hz8-series"); });
      setSum(fs.body.querySelector('[data-acc="series"]'), sel.length ? "Valt: " + sel.join(", ") : names.slice(0, 3).join(", ") + (names.length > 3 ? " m.fl." : ""), sel.length);
      var so = stockOption();
      var sw = tool.querySelector('[data-pt="stock"]');
      sw.hidden = !so;
      sw.setAttribute("aria-checked", String(!!(so && so.checked)));
      var sopt = fs.el.querySelector(".hz8-pstock-opt");
      sopt.setAttribute("aria-pressed", String(!!(so && so.checked)));
      fs.body.querySelector('[data-acc="stock"]').hidden = !so;
      setSum(fs.body.querySelector('[data-acc="stock"]'), so && so.checked ? "Valt: I lager" : "Visa bara produkter i lager", so && so.checked);
      if (n != null && lastLive !== null && n !== lastLive) live.textContent = plural(n) + " visas";
      if (n != null) lastLive = n;
      syncMirror();
      syncSort();
      syncPilotCards();
    }
    HZ8.watch(syncAll);
    HZ8.pilotSync = function () { renderTypes(); schedule(); };
    /* Fast verktygsrad: täckande bakgrund bara när den sitter fast, och
       den lämnar skärmen när produktområdet är slut (seriebandet och
       kundservice ska inte ligga under den). */
    var area = root.querySelector(".designer-category");
    function syncStuck() {
      var top = parseFloat(window.getComputedStyle(tool).top) || 0;
      var r = tool.getBoundingClientRect();
      var stuck = window.scrollY > 0 && r.top <= top + .5;
      var past = stuck && !!area && area.getBoundingClientRect().bottom < r.bottom + 24;
      if (tool.classList.contains("is-stuck") !== stuck) tool.classList.toggle("is-stuck", stuck);
      if (tool.classList.contains("is-past") !== past) {
        tool.classList.toggle("is-past", past);
        if (past && openPop) openPop.close(false);
      }
    }
    window.addEventListener("scroll", function () { window.requestAnimationFrame(syncStuck); }, { passive: true });
    window.addEventListener("resize", syncStuck);
    syncStuck();
    loadCardData(ctx);
    seriesBand(root, ctx);
    return picker;
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
    if (isPilot(ctx)) {
      root.setAttribute("data-hz8-nav", "pilot");
      picker = buildPilot(root, ctx);
    } else if (ctx) {
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
    else if (!isPilot(ctx)) buildPopular(root, h1Text);
    if (ctx && ctx.type === "combo" && HZ8.comboRelated) HZ8.comboRelated(root, ctx);

    /* Nyehandel byter filter-URL med pushState men ritar inte om vid
       bakåt/framåt -- då laddas sidan om så att resultat och URL alltid
       stämmer. Hash-ändringar (seriehubbens hopp) påverkas inte. */
    /* ?serie= (flervalet) ritas om på plats utan omladdning. */
    function nativeSearch() {
      var href = HZ8.catalog ? HZ8.catalog.withoutSeriesState(location.href) : location.href;
      try { var u = new URL(href, location.origin); u.searchParams.delete("typ"); href = u.pathname + u.search; } catch (e) { /* oförändrad */ }
      return href.replace(/^[^?]*/, "");
    }
    var lastSearch = nativeSearch();
    window.addEventListener("popstate", function () {
      if (nativeSearch() !== lastSearch) location.reload();
      else if (picker) { picker.sync(); if (window.HZ8.pilotSync) window.HZ8.pilotSync(); }
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
