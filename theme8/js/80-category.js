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
      /* Nyehandel renderar varken grid eller räknare när filtren ger noll
         träffar (verifierat 2026-10-13 på alla-cartridges) -- ett äkta
         tomt resultat, inte en ofullständig hämtning. */
      if (total == null && !page1.length) return [];
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
     exclude(path) = kort som aldrig visas i resultatet (pausade serier),
     sources = [{ key, href }] -- flera riktiga kategorisidor slås ihop till
     ett resultat (dubbletter bort på produktens kanoniska URL); varje kort
     får c.src = källans nyckel. always = resultatet byggs alltid (även
     utan val), quiet = sidans grid dämpas inte under laddning,
     step = antal kort per "Visa fler". */
  function seriesPicker(root, ctx, nav, opts) {
    opts = opts || {};
    var formatKey = ctx.format.key;
    var sources = opts.sources || [{ key: formatKey, href: ctx.format.href }];
    var step = opts.step || SHOW_STEP;
    var param = HZ8.catalog.seriesParam;
    var items = [];
    (opts.roots || [nav]).forEach(function (r) { items = items.concat(Array.prototype.slice.call(r.querySelectorAll(".hz8-serie[data-hz8-series]"))); });
    if (!items.length) return null;
    var byName = {};
    if (opts.seriesList) opts.seriesList.forEach(function (s) { byName[s.name] = s; });
    else sources.forEach(function (src) { HZ8.catalog.seriesWithFormat(src.key).forEach(function (s) { byName[s.name] = s; }); });
    /* Seriens riktiga routes inom källorna (t.ex. THCaB vapes + carts).
       Portalen: seriens alla format-routes. */
    function memberRoutes(s) { return opts.memberRoutes ? opts.memberRoutes(s) : sources.map(function (src) { return s.routes[src.key]; }).filter(Boolean); }
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
    function nativeAll(sel) { return !opts.always && isNative(sel) && !extraOn(); }
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
      var base = n ? n + (n === 1 ? " serie vald" : " serier valda") : opts.always ? "Alla produkter" : "Inga serier valda";
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
      if (opts.onShown) opts.onShown(Math.min(limit, out.length));
      out.slice(grid.children.length, limit).forEach(function (c) {
        var cell = document.createElement("div");
        cell.innerHTML = c.html;
        cell.querySelectorAll("[id]").forEach(function (el) { el.removeAttribute("id"); });
        grid.appendChild(cell);
      });
      if (opts.moreUi) {
        opts.moreUi(results, Math.min(limit, out.length), out.length, function () {
          var firstNew = grid.children.length;
          renderPage(out, limit + step);
          var link = grid.children[firstNew] && grid.children[firstNew].querySelector("a[href]");
          if (link) link.focus({ preventScroll: true });
        });
        return;
      }
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
          renderPage(out, limit + step);
          var link = grid.children[firstNew] && grid.children[firstNew].querySelector("a[href]");
          if (link) link.focus({ preventScroll: true });
        };
      } else if (more) {
        more.remove();
      }
    }

    var failedKey = null;
    function showUnion(sel, retry) {
      var key = resultKey(sel);
      if (key === shownKey) return;
      /* Ett misslyckat urval försöks inte om automatiskt vid varje
         DOM-ändring -- bara via "Försök igen" eller ett nytt urval. */
      if (key === failedKey && !retry) return;
      failedKey = null;
      shownKey = key;
      var mine = ++token;
      root.setAttribute("aria-busy", "true");
      /* quiet: ingen nedtoning vid sidans första laddning (gridet byts
         på plats) -- däremot vid filterbyten, som feedback. */
      if (designer && !(opts.quiet && unionCount === null)) designer.classList.add("hz8-series-pending");
      actionBtn.hidden = true;
      setStatus(sel, "uppdaterar …");

      var params = new URLSearchParams();
      var filters = nativeFilterTokens();
      if (filters.length) params.set("filters", filters.join("~"));
      var sort = new URLSearchParams(location.search).get("sort");
      if (sort) params.set("sort", sort);
      var qs = params.toString() ? "?" + params.toString() : "";
      var members = sel.length ? Promise.all([].concat.apply([], ordered(sel).map(function (n) { return memberRoutes(byName[n]).map(allCards); }))) : Promise.resolve(null);
      /* Alla källor måste laddas fullständigt -- annars inget sammanslaget
         resultat (sidans eget grid ligger kvar, statusraden säger varför). */
      var baseAll = Promise.all(sources.map(function (src) {
        return allCards(src.href + (src.href.indexOf("?") === -1 ? qs : qs.replace(/^\?/, "&"))).then(function (list) {
          return list.map(function (c) { return { html: c.html, sale: c.sale, src: src.key }; });
        });
      })).then(function (lists) { return [].concat.apply([], lists); });

      Promise.all([members, baseAll]).then(function (res) {
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
        if (!out.length && opts.emptyUi) {
          opts.emptyUi(results);
        } else if (!out.length) {
          results.innerHTML = '<div class="hz8-state hz8-cat-empty" role="status"><h2>Inga produkter matchar</h2><p>' + (sel.length ? "Valda serier har inga produkter med de här filtren." : "Inga produkter matchar de här filtren.") + '</p></div>';
          var b = document.createElement("button");
          b.type = "button";
          b.className = "hz8-btn hz8-btn--secondary";
          b.textContent = opts.clearLabel || "Rensa serierna";
          b.addEventListener("click", function () { if (opts.onClearAll) opts.onClearAll(); else apply([]); });
          results.firstChild.appendChild(b);
        } else {
          var first = opts.firstLimit ? opts.firstLimit() : step;
          renderPage(out, Math.max(step, first || step));
        }
        if (opts.onResult) opts.onResult(out);
        unionCount = out.length;
        results.hidden = false;
        document.documentElement.classList.add("hz8-series-union");
        if (designer) designer.classList.remove("hz8-series-pending");
        root.removeAttribute("aria-busy");
        setStatus(sel, out.length + (out.length === 1 ? " produkt" : " produkter"));
      }).catch(function (err) {
        if (mine !== token) return;
        deactivate();
        failedKey = key;
        var tooBig = err instanceof Incomplete && err.reason === "size";
        actionBtn.hidden = false;
        if (tooBig) {
          var first = ordered(sel)[0];
          actionBtn.textContent = "Öppna " + first;
          actionBtn.onclick = function () { location.href = HZ8.link(memberRoutes(byName[first])[0] || HZ8.catalog.landingFor(byName[first])); };
        } else {
          actionBtn.textContent = "Försök igen";
          actionBtn.onclick = function () { shownKey = null; showUnion(read(), true); };
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
      /* Bevakningen nedan lägger tillbaka ?serie= om plattformen tappar
         den -- den måste känna till det nya urvalet direkt. */
      lastSel = sel.slice();
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
       (samma mängd som unionen visar). 0 -> serien döljs. Portalen
       (lazyCounts): först när en filteryta öppnas eller en serie är vald --
       annars hämtas varje serie x format-sida vid varje sidvisning. */
    var countsStarted = false;
    function runCounts() {
    if (countsStarted) return;
    countsStarted = true;
    Promise.all(sources.map(function (src) { return allCards(src.href); })).then(function (lists) {
      var inType = {};
      lists.forEach(function (typeCards) { typeCards.forEach(function (c) { var path = cardPath(c.html); if (path) inType[path] = true; }); });
      items.forEach(function (it) {
        var s = byName[it.getAttribute("data-hz8-series")];
        if (!s) return;
        Promise.all(memberRoutes(s).map(allCards)).then(function (lists2) {
          var list = [].concat.apply([], lists2);
          var n = {};
          list.forEach(function (c) { var path = cardPath(c.html); if (path && inType[path] && !(opts.exclude && opts.exclude(path))) n[path] = true; });
          var count = Object.keys(n).length;
          if (!count && it.querySelector("button").getAttribute("aria-pressed") !== "true") { it.remove(); return; }
          var el = it.querySelector(".hz8-rail__count");
          if (el) el.textContent = opts.countText ? opts.countText(count) : count + (count === 1 ? " produkt" : " produkter");
          if (opts.onUpdate) opts.onUpdate();
        }).catch(function () {});
      });
    }).catch(function () {});
    }
    if (!opts.lazyCounts || read().length) runCounts();

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
      count: function () { return unionCount === null ? null : unionCount + (unionCount === 1 ? " produkt" : " produkter"); },
      loadCounts: runCounts
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
  /* Skriver bara vid ändring: syncCount körs i HZ8.watch, och en
     ovillkorlig textContent-skrivning är själv en DOM-mutation som
     startade nästa watch-omgång var 140:e ms för evigt (TASK 01C). */
  function setCta(btn, text, href) {
    if (btn.textContent !== text) btn.textContent = text;
    if (btn.getAttribute("href") !== href) btn.setAttribute("href", href);
  }
  function syncCount(actions) {
    var union = activePicker && activePicker.active() && activePicker.count();
    if (union && /\d/.test(union)) {
      var b = actions && actions.querySelector("a");
      if (b) setCta(b, "Visa " + union, "#hz8-series-results");
      return;
    }
    var counter = document.getElementById("products_count");
    var match = counter && counter.textContent.match(/(\d+)/);
    var btn = actions && actions.querySelector("a");
    if (btn) setCta(btn, match ? "Visa " + match[1] + " produkter" : "Visa produkterna", "#category-products");
  }

  /* ---- Filtergrupper: bara de som skiljer produkter åt ----
     Volym (och liknande storleksattribut) visas bara med minst två
     värden; native "Serie" döljs där seriefältet ovan gör samma jobb
     (inklusive plattformens egen valda-filter-tagg för serievärdet).
     Gäller vilka attribut Nyehandel än har -- inga filter skapas här. */
  var VOLUME_GROUP = /^(volym|storlek|innehåll|mängd)/i;
  function filterGroupHidden(name, options) {
    if (VOLUME_GROUP.test(name) && options < 2) return true;
    var cl = document.documentElement.classList;
    return name === "Serie" && (cl.contains("hz8-series-picker") || cl.contains("hz8-sf"));
  }
  function syncFilterGroups() {
    document.querySelectorAll("#sidebar .vertical-filters__product-filter__item").forEach(function (item) {
      var h = item.querySelector("h4");
      var hide = filterGroupHidden(h ? h.textContent.trim() : "", item.querySelectorAll(".product-filter-item").length);
      if (item.classList.contains("hz8-filter-hidden") !== hide) item.classList.toggle("hz8-filter-hidden", hide);
    });
    /* Serie-chippet döljs bara där serien redan är vald (serie x format-
       mallen). På formatsidor är ett native Serie-filter (t.ex.
       /hasch?filters=Serie_Magic Sauce) ett riktigt, synligt filter. */
    if (!document.documentElement.classList.contains("hz8-sf") || !HZ8.catalog) return;
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
    ).filter(function (g) { return g.name && g.options > 0 && !filterGroupHidden(g.name, g.options); })
      /* Serie x format: lagerstatus är en egen växel i verktygsraden. */
      .filter(function (g) { return !(g.name === STOCK_GROUP && document.documentElement.classList.contains("hz8-catshelf")); });
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
    /* Bara etiketten: kategoritextens egen första rubrik bär innehållet
       (sidans H1 upprepas inte). */
    about.innerHTML = '<span class="hz8-kicker">Om kategorin</span>';
    root.appendChild(about);
  }

  /* ---- Kategoritext längst ned (2026-10-22) ----
     Nyehandels egen text ligger kvar i initial DOM (crawlbar). Plattformens
     "Läs mer" fällde ihop behållaren till 0 px medan texten ritades utanför
     den, ovanpå knapp och footer. Ersätts av en egen, tillgänglig
     disclosure: hopfälld visas början av texten med mjuk toning, knappen
     växlar "Visa mer"/"Visa mindre" (aria-expanded). Utan riktig text döljs
     hela blocket. */
  var SEO_MIN_CHARS = 120;
  function buildSeoText(root) {
    var box = root.querySelector("article.category-description .nh-cat-box, article.category-description .readmore");
    var content = root.querySelector("article.category-description .readmore__content");
    var html = document.documentElement;
    var text = content ? content.textContent.replace(/\s+/g, " ").trim() : "";
    if (!box || text.length < SEO_MIN_CHARS) { html.classList.add("hz8-seo-empty"); return null; }
    html.classList.add("hz8-seo");
    if (!content.id) content.id = "hz8-cat-seo-text";
    var open = false;
    var btn = node("button", "hz8-seo-toggle");
    btn.type = "button";
    btn.setAttribute("aria-controls", content.id);
    function paint() {
      var rm = root.querySelector("article.category-description .readmore");
      if (rm && rm.classList.contains("hz8-seo-open") !== open) rm.classList.toggle("hz8-seo-open", open);
      btn.setAttribute("aria-expanded", String(open));
      var t = open ? "Visa mindre" : "Visa mer";
      if (btn.textContent !== t) btn.textContent = t;
    }
    btn.addEventListener("click", function () {
      open = !open;
      paint();
      if (!open) { var a = root.querySelector(".hz8-cat-about-head") || content; var r = a.getBoundingClientRect(); if (r.top < 0) window.scrollTo({ top: r.top + window.scrollY - 120, behavior: "auto" }); }
    });
    function sync() {
      var c = root.querySelector("article.category-description .readmore__content");
      if (c && btn.previousElementSibling !== c && c.parentNode) c.parentNode.insertBefore(btn, c.nextSibling);
      paint();
    }
    sync();
    return { sync: sync };
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
  /* Pausen gäller Alla Vapes-piloten och dess korslänkar. De breda
     formatsidorna (shell "broad") visar redan pausade serier i sitt eget
     sortiment och i de godkända referenserna -- inget döljs där. */
  var pauseOff = false;
  function shown(series) { return pauseOff || !PILOT_PAUSED.test(series.name); }
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
  var EMBLEM = '<svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.05" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8.5 25.5C9.4 15.6 15.2 8.4 24.6 5.6c-.6 9.6-6.4 16.7-16.1 19.9z"/><path d="M8.5 25.5L20.4 11.2M12.4 20.6l-3.1-1.3M14.8 17.8l-3.4-1.1M17.2 14.9l-3.2-.8M14.6 20.4l3.4.4M17 17.6l3.2.2"/><path d="M6.4 27.6l2.1-2.1"/></svg>';
  /* ---- Visuellt skal (2026-10-22) ----
     Skalet väljs ENBART ur sidans pathname och kategorikartans formatroute,
     aldrig ur query/filterstatus. Ett filter (?serie=, ?filters=Serie_...,
     lager, sortering) ändrar produkter, antal, aktiva kontroller och URL --
     aldrig skalet.
       "vapes"  Alla Vapes-piloten (oförändrad kontroll)
       "broad"  breda formatsidor i BROAD_SHELL_FORMATS: Alla Vapes-makrot
                med serieflikar; formatet är fast
       null     övriga sidor (serie x format, seriehubb, äldre mall) */
  var BROAD_SHELL_FORMATS = { hasch: true, buds: true };
  function shellOf(ctx) {
    var path = HZ8.path(location.href).split("?")[0];
    if (ctx && ctx.type === "all") return "portal";
    if (PILOT_PATHS.indexOf(path) !== -1) return "vapes";
    if (ctx && ctx.type === "format" && ctx.format && BROAD_SHELL_FORMATS[ctx.format.key] && HZ8.path(ctx.format.href).split("?")[0] === path) return "broad";
    return null;
  }
  function isBroad(ctx) { return shellOf(ctx) === "broad" || isPortal(ctx); }
  function isPilot(ctx) {
    return !!ctx && (ctx.type === "format" || ctx.type === "all") && !!shellOf(ctx);
  }

  /* ---- Alla produkter: katalogportal (2026-10-25, facit G3 + Hybrid C) ----
     Samma skal och motor som de breda formatsidorna (verktygshylla,
     flervalet, filterark, docka, sortering), men formatet är sidans
     primära filter: flikarna Alla/Vapes/Carts/Buds/Hasch/Tillbehör sätter
     ?typ= på SAMMA produktlista (Nyehandels egen alla-produkter-lista med
     dess filter och sortering) -- aldrig ett sidbyte. Formattillhörighet =
     produkten finns på formatets riktiga kategorisida (06-catalog-map).
     Volym/vikt läses ur produktnamnet och visas bara när vald produkttyp
     har en gemensam enhet (ml eller gram blandas aldrig). */
  var PORTAL_LABEL = { batterier: "Tillbehör" };
  var PORTAL_UNIT = { vapes: "ml", carts: "ml", refill: "ml", buds: "g", hasch: "g" };
  var portalOn = false;
  var portalTypes = {};   // path -> [formatnycklar]
  function isPortal(ctx) { return !!(ctx && (ctx.portal || ctx.type === "all")); }
  function portalCtx() {
    var all = HZ8.catalog.build().all;
    return { type: "format", portal: true, series: null, format: { key: "all", href: all.href, label: "Alla produkter", short: "Alla produkter", seriesless: false } };
  }
  function portalFormats() {
    return HZ8.catalog.build().formats.map(function (f) { return { key: f.key, href: f.href, label: PORTAL_LABEL[f.key] || f.label }; });
  }
  /* Vikt ur namnet ("- 5 gram", "3,5g"); sista förekomsten gäller. */
  function cardWeight(name) {
    var all = String(name || "").match(/(\d+(?:[.,]\d+)?)\s*(?:g|gram)\b/gi);
    if (!all) return null;
    var v = all[all.length - 1].replace(/\s*(?:gram|g)$/i, "").trim();
    var num = parseFloat(v.replace(",", "."));
    if (!(num > 0)) return null;
    return { key: v.replace(/[.,]/, "-") + "g", label: v.replace(".", ",") + " g", order: 1000 + num, unit: "g" };
  }
  /* Sidlokal katalogsökning (Hybrid H): ?q= filtrerar SAMMA lista i
     unionsmotorn. Söker i produktens hela namn, varumärke, format och
     serie (seriernas riktiga routes, laddas en gång vid första fokus).
     Gemener, utan diakritik och skiljetecken; alla ord måste finnas, i
     valfri ordning. Ingen fuzzy-matchning, inga nätverksanrop per tangent. */
  var SEARCH_PARAM = "q";
  var portalSeries = null;   // path -> [serie], null = inte laddad
  var hayMemo = {};
  function searchNorm(t) {
    return String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  }
  function searchTokens(q) { return searchNorm(q).split(" ").filter(Boolean); }
  function readQuery() { return (new URLSearchParams(location.search).get(SEARCH_PARAM) || "").trim(); }
  function cardBrand(html) {
    var m = html.match(/class="brand"[^>]*>\s*([^<]+?)\s*</);
    return m ? m[1].replace(/&amp;/g, "&").trim() : "";
  }
  function cardLink(html) {
    var m = html.match(/href="([^"]*\/products\/[^"]+)"/);
    return m ? m[1].replace(/&amp;/g, "&") : "";
  }
  function haystack(path, name, brand) {
    var key = path + "|" + (portalSeries ? 1 : 0);
    if (hayMemo[key]) return hayMemo[key];
    var parts = [name, brand];
    (portalTypes[path] || []).forEach(function (k) {
      var f = portalFormats().filter(function (x) { return x.key === k; })[0];
      parts.push(TYPE_ONE[k] || "", f ? f.label : "");
    });
    if (portalSeries) parts = parts.concat(portalSeries[path] || []);
    var h = searchNorm(parts.join(" "));
    return (hayMemo[key] = { text: " " + h + " ", compact: h.replace(/ /g, "") });
  }
  function searchHit(hay, tokens) {
    return tokens.every(function (t) { return hay.text.indexOf(t) !== -1 || hay.compact.indexOf(t) !== -1; });
  }
  function cardUnit(name) {
    var v = cardVolume(name);
    if (v) { v.unit = "ml"; return v; }
    return portalOn ? cardWeight(name) : null;
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
  /* Sammanslaget resultat (flera källor): bara sorteringar som kan
     räknas fram över hela unionen på kortens riktiga data (pris, namn)
     erbjuds. Popularitet, publiceringsdatum och lagerordning finns bara
     per källa i Nyehandel -- de påstås aldrig globalt. null = alla. */
  var pilotSortAllowed = null;
  function sortOptions() {
    return Array.prototype.filter.call(document.querySelectorAll(".category-sort .sort-button .dropdown-item"), function (a) {
      var t = a.textContent.trim();
      return !/^-+\s*Välj/.test(t) && (!pilotSortAllowed || pilotSortAllowed[t]);
    }).map(function (a) { var t = a.textContent.trim(); return { native: t, label: SORT_LABELS[t] || t, el: a }; });
  }
  function currentSort() {
    var cur = document.querySelector(".category-sort .sort-button .dropdown-trigger button span:nth-child(2)");
    var t = cur ? cur.textContent.trim() : "";
    if (pilotSortAllowed && !pilotSortAllowed[t]) return "";
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
    return pilotSeriesList(ctx).filter(shown).map(function (s) {
      return '<div class="hz8-serie hz8-popt" data-hz8-series="' + HZ8.esc(s.name) + '"><button type="button" class="hz8-popt__btn" aria-pressed="false">' +
        '<span class="hz8-popt__box" aria-hidden="true"></span><span class="hz8-rail__label">' + HZ8.esc(s.name) + '</span>' +
        '<span class="hz8-rail__count hz8-popt__count"></span></button></div>';
    }).join("");
  }

  /* Serier som saknas i formatet men finns i andra format (riktiga
     routes ur relationskartan). Navigationsrader, aldrig filter. */
  function otherFormats(ctx, list, group) {
    var inGrid = pilotSeriesList(ctx);
    var jobs = [];
    HZ8.catalog.build().series.forEach(function (s) {
      if (inGrid.indexOf(s) !== -1 || !shown(s)) return;
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
    if (lead && isPortal(ctx)) {
      /* Portal: kort ingress ur de format som faktiskt finns (riktiga
         routes); den långa kategoritexten ligger kvar längre ned. */
      lead.hidden = false;
      lead.textContent = "Upptäck hela vårt sortiment av " + joinSv(portalFormats().map(function (f) { return f.label.toLowerCase(); })) + ".";
      /* Eyebrow ovanför H1 (samma rad i griden, H1 får luft i CSS). */
      if (!root.querySelector(".hz8-portal-kicker")) lead.insertAdjacentHTML("beforebegin", '<p class="hz8-kicker hz8-portal-kicker">Hela sortimentet</p>');
    } else
    /* Bred formatsida: kategorins egen ingress. Vue ritar ibland
       beskrivningen först efter buildHero -- då fylls ingressen i när
       texten finns (annars saknades raden och hela heron flyttade upp). */
    if (lead && !isBroad(ctx)) {
      lead.hidden = false;
      lead.textContent = PILOT_LEAD;
    } else if (lead && !lead.textContent.trim()) {
      var fillLead = function () {
        if (lead.textContent.trim()) return;
        var desc = root.querySelector("article.category-description");
        var first = desc && Array.prototype.find.call(desc.querySelectorAll(".nh-cat-lead, .readmore__content p, .readmore__content h1, .readmore__content h2, p"), function (p) {
          return p.textContent.trim().length > 30;
        });
        if (!first) return;
        lead.textContent = first.textContent.trim().replace(/\s+/g, " ");
        lead.hidden = false;
      };
      fillLead();
      HZ8.watch(fillLead);
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

  function pilotGuide(root, steps, openQuiz, noun) {
    noun = noun || "vape";
    var g = node("aside", "hz8-pguide");
    g.setAttribute("aria-labelledby", "hz8-pguide-title");
    g.innerHTML = '<span class="hz8-pguide__emblem" aria-hidden="true">' + EMBLEM + '</span>' +
      '<div class="hz8-pguide__body"><p class="hz8-pguide__title" id="hz8-pguide-title">Osäker på vad som passar?</p>' +
      '<div class="hz8-pguide__row"><button type="button" class="hz8-pcta hz8-pguide__cta" aria-haspopup="dialog"><span>Hitta rätt ' + HZ8.esc(noun) + '</span>' + ARROW + '</button>' +
      '<p class="hz8-pguide__steps">' + HZ8.esc(steps.join(" · ")) + '</p></div></div>';
    g.querySelector("button").addEventListener("click", openQuiz);
    root.appendChild(g);
    return g;
  }

  /* ---- Hitta rätt vape: guide som bara leder till riktiga filter/routes.
     Steg utan riktig data (Användning, Doft / strain) visas inte. Format
     kan leda vidare till andra sidor (Carts, Batterier) -- filterraden
     begränsar däremot bara den här sidan. ---- */
  /* Bred formatsida: "Hitta rätt buds"/"Hitta rätt hasch"; formatet är
     fast, så guiden frågar bara efter cannabinoid/serie. */
  function quizNoun(ctx) { return isPortal(ctx) ? "produkt" : isBroad(ctx) ? ctx.format.label.toLowerCase() : "vape"; }
  function buildQuiz(ctx, getPicker, getCount, applyType) {
    var broad = isBroad(ctx) && !isPortal(ctx);
    var dlg = sheet("hz8-pquiz", "Hitta rätt " + quizNoun(ctx), "quiz");
    var fresh = function () { return { step: 0, format: broad ? ctx.format.key : null, series: [] }; };
    var state = fresh();
    var formats = broad ? [ctx.format] : isPortal(ctx) ? portalFormats() : HZ8.catalog.familyFormats(ctx.format.key);
    var counts = {};
    formats.forEach(function (f) { catalogCount(f.href).then(function (n) { counts[f.key] = n; if (dlg.isOpen()) render(); }); });

    function steps() {
      var f = HZ8.catalog.formatByKey(state.format || ctx.format.key);
      var out = broad ? [] : [{ key: "format", label: "Format" }];
      if (f && !f.seriesless && (broad || seriesFor(f.key).length)) out.push({ key: "series", label: "Cannabinoid / serie" });
      return out;
    }
    /* Serier i formatet. För sidans eget format: bara de som finns bland
       sidans produkter (flervalets kontroller tas bort vid 0). Antal visas
       inte -- en produktpost kan rymma flera varianter. */
    function seriesFor(fkey) {
      var list = HZ8.catalog.seriesWithFormat(fkey).filter(shown);
      if (!isSource(ctx, fkey)) return list;
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
    var FORMAT_NOTE = { vapes: "Engångsvapes", carts: "Kräver 510-batteri", refill: "Påfyllning", batterier: isPortal(ctx) ? "Batterier till carts" : "Till carts · egen sida" };
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
            var cnt = isSource(ctx, f.key) && getCount ? getCount(f.key) : counts[f.key];
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
      var next = !last ? "Nästa" : f && !isSource(ctx, f.key) ? "Gå till " + f.label.toLowerCase() : "Visa produkter";
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
      if (isSource(ctx, f.key) && picker) {
        dlg.close();
        if (applyType && !broad) applyType(f.key);
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
        state = fresh();
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

  /* ---- Portal: sidlokal sökruta (Hybrid H) ----
     combobox + listbox med högst fem riktiga produkter ur samma underlag.
     Skriver ?q= med replaceState (ett historiksteg när en sökning börjar,
     inte ett per tangent); listan ritas om av unionsmotorn via HZ8.watch.
     Escape stänger förslagen men behåller texten; X rensar sökningen. */
  var SUGGEST_MAX = 5;
  function portalSearch(root) {
    var wrap = node("div", "hz8-pq");
    wrap.setAttribute("role", "search");
    wrap.innerHTML = '<label class="hz8-visually-hidden" for="hz8-pq-input">Sök bland produkterna på sidan</label>' +
      '<div class="hz8-pq__field">' + HZ8.icon("search") +
        '<input id="hz8-pq-input" class="hz8-pq__input" type="search" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="hz8-pq-list" aria-describedby="hz8-pq-hint" autocomplete="off" spellcheck="false" enterkeyhint="search" placeholder="Sök bland produkterna">' +
        '<button type="button" class="hz8-pq__clear" aria-label="Rensa sökning" hidden><svg class="hz8-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
      '</div>' +
      '<ul id="hz8-pq-list" class="hz8-pq__list" role="listbox" aria-label="Förslag" hidden></ul>' +
      '<p class="hz8-pq__hint" id="hz8-pq-hint">Sök produkt, serie, format eller cannabinoid</p>';
    root.appendChild(wrap);
    var input = wrap.querySelector("input"), clearBtn = wrap.querySelector(".hz8-pq__clear"), list = wrap.querySelector("ul");
    var timer = 0, active = -1, items = [], seriesAsked = false;
    input.value = readQuery();
    clearBtn.hidden = !input.value;

    function base() { return window.HZ8.portalBase ? window.HZ8.portalBase() : null; }
    function write(q) {
      var url = new URL(location.href);
      var had = url.searchParams.has(SEARCH_PARAM);
      if (q) url.searchParams.set(SEARCH_PARAM, q); else url.searchParams.delete(SEARCH_PARAM);
      if (url.href === location.href) return;
      var href = url.pathname + url.search + url.hash;
      /* Ny sökning = ett historiksteg; skrivandet därefter ersätter det. */
      if (!had && q) history.pushState(history.state, "", href); else history.replaceState(history.state, "", href);
      if (window.HZ8.pilotSync) window.HZ8.pilotSync();
      if (activePicker) activePicker.sync();
    }
    /* Serietillhörighet (seriernas riktiga routes) en gång, vid första
       fokus -- därefter matchar "THCaB" även produkter vars namn säger THCA. */
    function loadSeries() {
      if (seriesAsked) return;
      seriesAsked = true;
      var map = {};
      var jobs = HZ8.catalog.build().series.map(function (s) {
        var routes = Object.keys(s.routes).map(function (k) { return s.routes[k]; }).filter(function (r, i, a) { return a.indexOf(r) === i; });
        return Promise.all(routes.map(function (r) { return allCards(r).catch(function () { return []; }); })).then(function (lists) {
          lists.forEach(function (cards) { cards.forEach(function (c) { var p = cardPath(c.html); if (!p) return; (map[p] = map[p] || []); if (map[p].indexOf(s.name) === -1) map[p].push(s.name); }); });
        });
      });
      Promise.all(jobs).then(function () {
        portalSeries = map;
        if (readQuery()) { if (window.HZ8.pilotSync) window.HZ8.pilotSync(); if (activePicker) activePicker.sync(); }
        if (document.activeElement === input) suggest();
      });
    }
    function close() {
      list.hidden = true;
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
      active = -1;
    }
    function mark(i) {
      active = i;
      Array.prototype.forEach.call(list.children, function (li, j) { li.setAttribute("aria-selected", String(j === i)); });
      if (i >= 0) input.setAttribute("aria-activedescendant", list.children[i].id); else input.removeAttribute("aria-activedescendant");
    }
    function suggest() {
      var tokens = searchTokens(input.value);
      var b = base();
      if (!tokens.length || !b) { close(); return; }
      var tsel = readList(TYPE_PARAM);
      items = b.filter(function (it) {
        if (tsel.length && !(portalTypes[it.p] || []).some(function (k) { return tsel.indexOf(k) !== -1; })) return false;
        return searchHit(haystack(it.p, it.name, it.brand), tokens);
      }).slice(0, SUGGEST_MAX);
      if (!items.length) { close(); return; }
      list.innerHTML = items.map(function (it, i) {
        var f = (portalTypes[it.p] || [])[0];
        var meta = [it.brand, f ? TYPE_ONE[f] || f : ""].filter(Boolean).join(" · ");
        return '<li role="option" id="hz8-pq-opt-' + i + '" class="hz8-pq__opt" aria-selected="false" data-i="' + i + '"><span class="hz8-pq__name">' + HZ8.esc(it.name) + '</span>' + (meta ? '<span class="hz8-pq__meta">' + HZ8.esc(meta) + "</span>" : "") + "</li>";
      }).join("");
      list.hidden = false;
      input.setAttribute("aria-expanded", "true");
      mark(-1);
    }
    function go(i) {
      var it = items[i];
      if (it && it.href) location.href = HZ8.link(it.href);
    }
    function clear(focus) {
      input.value = "";
      clearBtn.hidden = true;
      close();
      write("");
      if (focus) input.focus({ preventScroll: true });
    }
    input.addEventListener("focus", function () { loadSeries(); if (input.value) suggest(); });
    /* Klick i ett redan fokuserat fält (t.ex. efter Escape) öppnar förslagen igen. */
    input.addEventListener("click", function () { if (input.value && list.hidden) suggest(); });
    input.addEventListener("input", function () {
      clearBtn.hidden = !input.value;
      window.clearTimeout(timer);
      timer = window.setTimeout(function () { write(input.value.trim()); suggest(); }, 180);
    });
    input.addEventListener("keydown", function (e) {
      var open = !list.hidden && items.length;
      if (e.key === "ArrowDown") { e.preventDefault(); if (!open) suggest(); else mark((active + 1) % items.length); }
      else if (e.key === "ArrowUp") { if (open) { e.preventDefault(); mark(active <= 0 ? items.length - 1 : active - 1); } }
      else if (e.key === "Enter") {
        e.preventDefault();
        window.clearTimeout(timer);
        write(input.value.trim());
        if (open && active >= 0) go(active); else { close(); scrollToProducts(); }
      } else if (e.key === "Escape") { if (open) { e.preventDefault(); e.stopPropagation(); close(); } }
    });
    input.addEventListener("blur", function () { window.setTimeout(function () { if (!wrap.contains(document.activeElement)) close(); }, 120); });
    list.addEventListener("mousedown", function (e) { e.preventDefault(); });
    list.addEventListener("click", function (e) { var li = e.target.closest(".hz8-pq__opt"); if (li) go(+li.getAttribute("data-i")); });
    list.addEventListener("mousemove", function (e) { var li = e.target.closest(".hz8-pq__opt"); if (li && +li.getAttribute("data-i") !== active) mark(+li.getAttribute("data-i")); });
    clearBtn.addEventListener("click", function () { clear(true); });
    /* Bakåt/framåt: URL:en är sanningen även när fältet har fokus. */
    window.addEventListener("popstate", function () {
      var q = readQuery();
      if (input.value.trim() !== q) { input.value = q; clearBtn.hidden = !q; close(); }
    });
    return {
      clear: clear,
      /* URL är sanningen (bakåt/framåt, rensa allt) -- fältet följer med
         när det inte används; platshållaren bär hela sortimentets antal. */
      sync: function () {
        var q = readQuery();
        if (document.activeElement !== input && input.value.trim() !== q) { input.value = q; clearBtn.hidden = !q; close(); }
        var b = base();
        var ph = b ? "Sök bland " + plural(b.length) : "Sök bland produkterna";
        if (input.placeholder !== ph) input.placeholder = ph;
      }
    };
  }

  /* ---- Portal: resultatets slut (Hybrid C) ----
     Sann progression (visade av totalt), "Visa fler produkter" och en
     sekundär väg tillbaka till filtren. */
  function portalMore(results, shownN, total, more) {
    var box = results.querySelector(".hz8-pmore");
    if (!box) {
      box = node("div", "hz8-pmore");
      box.innerHTML = '<p class="hz8-pmore__text" aria-live="polite"></p><span class="hz8-pmore__bar" aria-hidden="true"><span class="hz8-pmore__fill"></span></span>' +
        '<button type="button" class="hz8-pcta hz8-pmore__btn">Visa fler produkter</button>' +
        '<button type="button" class="hz8-plink hz8-pmore__back">Tillbaka till filter</button>';
      box.querySelector(".hz8-pmore__back").addEventListener("click", function () {
        var tool = document.querySelector(".hz8-ptool");
        if (!tool) return;
        var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        tool.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
        var first = tool.querySelector('.hz8-pfam__tab[aria-pressed="true"]') || tool.querySelector("button");
        if (first) first.focus({ preventScroll: true });
      });
      results.appendChild(box);
    }
    box.querySelector(".hz8-pmore__text").textContent = "Visar " + shownN + " av " + plural(total);
    box.querySelector(".hz8-pmore__fill").style.transform = "scaleX(" + (total ? shownN / total : 1) + ")";
    var btn = box.querySelector(".hz8-pmore__btn");
    btn.hidden = shownN >= total;
    btn.onclick = more;
    box.hidden = total === 0;
  }

  /* Formatvägar, kategoritext och övergång till footern. Vägarna är
     riktiga länkar till formatens egna sidor (inte filter); en väg utan
     produkter visas inte. */
  var PORTAL_ROUTES = [
    { key: "vapes", group: "vapes", sub: "Jämför vapes och styrkor" },
    { key: "buds", group: "buds", sub: "Utforska buds och serier" },
    { key: "hasch", group: "hasch", sub: "Se hela haschsortimentet" }
  ];
  function portalLower(root, except) {
    var nav = HZ8.navContent || {};
    var onFormat = !!except;
    var rows = PORTAL_ROUTES.filter(function (r) { return !onFormat || except.indexOf(r.key) === -1; }).map(function (r) {
      var f = HZ8.catalog.formatByKey(r.key);
      var cta = nav[r.group] && nav[r.group].cta;
      if (!f || !f.href) return null;
      /* Namnet ur headerns egen länk ("Alla vapes" -> "Alla Vapes"). */
      var name = cta && cta.label ? cta.label.replace(/(\s)(\S+)$/, function (m, sp, w) { return sp + w.charAt(0).toUpperCase() + w.slice(1); }) : f.label;
      return { f: f, name: name, sub: r.sub };
    }).filter(Boolean);
    if (rows.length) {
      var sec = node("section", "hz8-proutes");
      sec.setAttribute("aria-labelledby", "hz8-proutes-title");
      sec.innerHTML = onFormat
        ? '<div class="hz8-proutes__head"><p class="hz8-kicker">Fler format</p><h2 id="hz8-proutes-title">Fortsätt i ett annat format</h2>' +
          '<p class="hz8-proutes__lead">Öppna en fokuserad kategori för en annan produkttyp.</p></div><ul class="hz8-proutes__list" role="list"></ul>'
        : '<div class="hz8-proutes__head"><p class="hz8-kicker">Fortsätt i ett format</p><h2 id="hz8-proutes-title">Jämför enklare</h2>' +
          '<p class="hz8-proutes__lead">Öppna en fokuserad kategori när du vet vilken produkttyp du söker.</p></div><ul class="hz8-proutes__list" role="list"></ul>';
      var ul = sec.querySelector("ul");
      rows.forEach(function (r) {
        var li = node("li", "hz8-proutes__item");
        li.innerHTML = '<a class="hz8-proutes__card" href="' + HZ8.esc(HZ8.link(r.f.href)) + '"><span class="hz8-proutes__text"><span class="hz8-proutes__name">' + HZ8.esc(r.name) + '</span>' +
          '<span class="hz8-proutes__sub">' + HZ8.esc(r.sub) + '</span></span><span class="hz8-proutes__arrow" aria-hidden="true">' + ARROW + '</span></a>';
        ul.appendChild(li);
        catalogCount(r.f.href).then(function (n) { if (n === 0) li.remove(); if (!ul.children.length) sec.remove(); });
      });
      root.appendChild(sec);
    }
    var desc = onFormat ? null : root.querySelector("article.category-description .readmore, article.category-description .nh-cat-box");
    if (desc) {
      var about = node("div", "hz8-cat-about-head hz8-pabout");
      about.setAttribute("data-hz8-cat", "about-head");
      about.innerHTML = '<h2 class="hz8-pabout__title">Om Hazeys sortiment</h2>';
      root.appendChild(about);
    }
  }

  /* ---- Sortimentet på Alla Vapes: Vapes + Carts (+ Refills) ----
     Produkttyperna i formatets familj (relationskartan 06-catalog-map.js)
     är riktiga kategorisidor; deras produkter slås ihop till ETT grid.
     Batterier hör till Tillbehör och ingår inte. Refills har ingen route
     i Nyehandel ännu (headerns "Refill/Liquid 10 ml" saknar länk) och
     tillkommer automatiskt när kategorin finns i kartan. */
  var PILOT_NOT_IN_GRID = { batterier: true };
  var TYPE_LABEL = { vapes: "Vapes", carts: "Carts", refill: "Refills" };
  var TYPE_ONE = { vapes: "Vape", carts: "Cart", refill: "Refill", buds: "Buds", hasch: "Hasch", prerolls: "Pre-roll", batterier: "Tillbehör" };
  function pilotSources(ctx) {
    /* Portal: Nyehandels egen alla-produkter-lista är källan. */
    if (isPortal(ctx)) return [{ key: "all", href: ctx.format.href, label: ctx.format.label }];
    /* Bred formatsida: formatet är fast -- bara sidans egen route. */
    if (isBroad(ctx)) return [{ key: ctx.format.key, href: ctx.format.href, label: ctx.format.label }];
    return HZ8.catalog.familyFormats(ctx.format.key).filter(function (f) { return !PILOT_NOT_IN_GRID[f.key]; })
      .map(function (f) { return { key: f.key, href: f.href, label: TYPE_LABEL[f.key] || f.label }; });
  }
  function isSource(ctx, key) {
    if (isPortal(ctx)) return portalFormats().some(function (f) { return f.key === key; });
    return pilotSources(ctx).some(function (s) { return s.key === key; });
  }
  /* Serier i någon av källorna (union, i kartans ordning). */
  function pilotSeriesList(ctx) {
    if (isPortal(ctx)) return HZ8.catalog.build().series.filter(function (s) { return Object.keys(s.routes).length > 0; });
    var keys = pilotSources(ctx).map(function (s) { return s.key; });
    return HZ8.catalog.build().series.filter(function (s) { return keys.some(function (k) { return !!s.routes[k]; }); });
  }

  /* Volym/konfiguration: egen dimension, inte produkttyp. Nyehandel har
     ingen strukturerad volymdata för de här produkterna, så den läses ur
     produktnamnets verifierbara format ("- 2ml", "- 0,5ml", "Dual ...
     1+1ml"). Utan säker volym: ingen klassning (finns under Alla).
     TASK 01E: en dual-produkt klassas på sin totala volym ("1+1ml" = 2 ml)
     -- ingen egen "1+1 ml"-rad eller URL-värde. Produktens namn ändras inte. */
  var TYPE_PARAM = "typ";
  var VOLUME_PARAM = "volym";
  /* TASK 01E: kundvalbara volymer på Alla Vapes (godkända 2026-10-26). En
     produkt med annan tolkad volym (t.ex. äldre 0,5 ml) klassas inte och
     finns kvar under Alla; ett godkänt värde utan riktig produkt visas inte. */
  var VAPES_VOLUMES = { "1ml": true, "2ml": true, "5ml": true };
  var SERIES_SEARCH_MIN = 12;  /* fler serier än så: sökfältet behövs */
  function cardVolume(name) {
    var n = String(name || "").replace(/&amp;/g, "&");
    var dual = n.match(/(\d+(?:[.,]\d+)?)\s*\+\s*(\d+(?:[.,]\d+)?)\s*ml\b/i);
    if (dual) {
      var total = Math.round((parseFloat(dual[1].replace(",", ".")) + parseFloat(dual[2].replace(",", "."))) * 100) / 100;
      if (!(total > 0)) return null;
      var t = String(total);
      return { key: t.replace(".", "-") + "ml", label: t.replace(".", ",") + " ml", order: total };
    }
    var all = n.match(/(\d+(?:[.,]\d+)?)\s*ml\b/gi);
    if (!all) return null;
    var v = all[all.length - 1].replace(/\s*ml/i, "");
    var num = parseFloat(v.replace(",", "."));
    if (!(num > 0)) return null;
    return { key: v.replace(/[.,]/, "-") + "ml", label: v.replace(".", ",") + " ml", order: num };
  }
  HZ8.pilotVolume = cardVolume;
  function readList(param) {
    var raw = new URLSearchParams(location.search).get(param);
    return raw ? raw.split(",").filter(Boolean) : [];
  }
  function writeLists(map) {
    var url = new URL(location.href);
    Object.keys(map).forEach(function (param) {
      if (map[param].length) url.searchParams.set(param, map[param].join(",")); else url.searchParams.delete(param);
    });
    if (url.href !== location.href) history.pushState(history.state, "", url.pathname + url.search + url.hash);
  }

  /* ---- Produktkort: serie, lagerstatus och tydlig köphandling.
     Serie och lager läggs i .details (grid i CSS) så att pris och
     knapp hamnar på samma nivå oavsett namnlängd. ---- */
  var pilotStock = null;   // { path: true } för produkter i lager, null = okänt
  var pilotStockKnown = {}; // källnyckel -> lagerlistan laddad
  var pilotPaused = null;  // { path: true } produkter i pausade serier (ur seriernas riktiga routes)
  var pilotSeries = {};    // path -> [serie]
  var pilotType = {};      // path -> källans nyckel (vapes/carts/refill)
  var pilotSeriesPending = 0;  // serie-hämtningar som pågår (antal visas först när 0)
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
      /* Egenskapschips: produkttyp + volym (+ serie på desktop). Bara
         verifierad data; tom rad reserverar höjd (inget layoutskift). */
      var nameEl = card.querySelector(".name");
      /* Nyehandel dubbelkodar "&" i vissa namn ("&amp;amp;" i källan ->
         "&amp;" på skärmen). Visa den avkodade riktiga texten, även i
         bildens alt/title och köpknappens tillgängliga namn. */
      if (nameEl && nameEl.textContent.indexOf("&amp;") !== -1) {
        nameEl.textContent = nameEl.textContent.replace(/&amp;/g, "&");
        card.querySelectorAll("img[alt], img[title], [aria-label]").forEach(function (el) {
          ["alt", "title", "aria-label"].forEach(function (a) { var v = el.getAttribute(a); if (v && v.indexOf("&amp;") !== -1) el.setAttribute(a, v.replace(/&amp;/g, "&")); });
        });
      }
      /* Betyg: det riktiga snittet (stjärnornas title) som decimal mellan
         stjärnor och antal. Ingen rad utan omdömen. */
      var stars = card.querySelector(".rating .nh-stars[title]");
      if (stars) {
        var avg = parseFloat(stars.getAttribute("title"));
        var rate = stars.parentNode.querySelector(".hz8-prate");
        var txt = avg > 0 ? avg.toFixed(1).replace(".", ",") : "";
        if (txt && !rate) { rate = node("span", "hz8-prate"); stars.insertAdjacentElement("afterend", rate); }
        if (rate && rate.textContent !== txt) rate.textContent = txt;
      }
      /* Hela namnet är källan även när titeln visuellt kortats nedan. */
      var shortName = nameEl && nameEl.getAttribute("data-hz8-short");
      var fullName = nameEl ? (shortName && nameEl.textContent === shortName ? nameEl.getAttribute("data-hz8-full") : nameEl.textContent.trim()) : "";
      var vol = cardUnit(fullName);
      var chips = [];
      if (pilotType[path]) chips.push([TYPE_ONE[pilotType[path]] || pilotType[path], ""]);
      if (vol) chips.push([vol.label, ""]);
      (pilotSeries[path] || []).slice(0, 1).forEach(function (n) { chips.push([n, " is-extra"]); });
      /* Täthet (2026-10-22): avslutande "- 2ml" i den synliga titeln när
         exakt samma volym redan står som tagg. Produktens riktiga namn,
         länk, H1 och metadata rörs inte; länken bär hela namnet. */
      if (nameEl && vol) {
        var trimmed = fullName.replace(/\s*[-–]\s*\d+(?:[.,]\d+)?(?:\s*\+\s*\d+(?:[.,]\d+)?)?\s*ml\s*$/i, "");
        var endVol = trimmed !== fullName ? cardVolume(fullName.slice(trimmed.length)) : null;
        if (vol.unit === "g") endVol = null;
        if (endVol && endVol.key === vol.key && trimmed.length >= 8) {
          if (nameEl.textContent !== trimmed) {
            nameEl.setAttribute("data-hz8-full", fullName);
            nameEl.setAttribute("data-hz8-short", trimmed);
            nameEl.textContent = trimmed;
          }
          var nameLink = nameEl.closest("a");
          if (nameLink && nameLink.getAttribute("aria-label") !== fullName) nameLink.setAttribute("aria-label", fullName);
          /* Köpknappens tillgängliga namn (03-product-card) ska också bära
             hela produktnamnet om den skapades efter kortningen. */
          card.querySelectorAll(".hz8-card-pill[aria-label]").forEach(function (pill) {
            var l = pill.getAttribute("aria-label");
            if (l.indexOf(fullName) === -1 && l.slice(-trimmed.length) === trimmed) pill.setAttribute("aria-label", l.slice(0, l.length - trimmed.length) + fullName);
          });
        }
      }
      var row = details.querySelector(".hz8-pcardchips");
      if (!row) { row = node("p", "hz8-pcardchips"); details.appendChild(row); }
      var sig = chips.map(function (c) { return c[0]; }).join("|");
      if (row.getAttribute("data-sig") !== sig) {
        row.setAttribute("data-sig", sig);
        row.innerHTML = chips.map(function (c) { return '<span class="hz8-pcardchip' + c[1] + '">' + HZ8.esc(c[0]) + "</span>"; }).join("");
      }
      /* Trasig produktbild: neutral bildbrunn (samma mått, inget skift). */
      var img = card.querySelector(".product-card__image img");
      if (img && !img.hasAttribute("data-hz8-watch")) {
        img.setAttribute("data-hz8-watch", "");
        var broken = function () { var a = img.closest(".product-card__image"); if (a) a.classList.add("hz8-img-broken"); };
        img.addEventListener("error", broken);
        if (img.complete && !img.naturalWidth && img.getAttribute("src")) broken();
      }

      /* Lagerraden finns från start (tom, reserverad höjd) så att kortet
         inte växer när lagerdatan kommer -- annars layoutskift. */
      var stock = details.querySelector(".hz8-pstock");
      if (!stock) { stock = node("p", "hz8-pstock is-pending"); stock.setAttribute("aria-hidden", "true"); details.appendChild(stock); }
      if (!pilotStock) return;
      /* Lagerstatus bara när produktens källa är känd och laddad (en enkel
         formatsida utan källor: sidans egen lista räcker). */
      var srcKey = portalOn ? "all" : pilotType[path];
      if (Object.keys(pilotStockKnown).length && (!srcKey || !pilotStockKnown[srcKey])) return;
      var inStock = !!pilotStock[path];
      stock.classList.remove("is-pending");
      stock.removeAttribute("aria-hidden");
      var label = inStock ? "I lager" : "Slutsåld";
      if (stock.textContent !== label) stock.textContent = label;
      stock.classList.toggle("is-out", !inStock);
      card.classList.toggle("hz8-is-soldout", !inStock);
      var sold = wrapper.querySelector(".hz8-psold");
      /* Slutsåld: inaktiv etikett i knappens plats; bild och namn är
         fortsatt riktiga länkar till produkten. */
      if (!inStock && !sold) {
        var name = card.querySelector(".name");
        sold = node("span", "hz8-psold", "Slutsåld");
        sold.setAttribute("role", "button");
        sold.setAttribute("aria-disabled", "true");
        sold.setAttribute("aria-label", "Slutsåld: " + (name ? (name.getAttribute("data-hz8-full") || name.textContent.trim()) : ""));
        wrapper.appendChild(sold);
      } else if (inStock && sold) sold.remove();
    });
  }
  var pilotPausedReady = null;
  function loadCardData(ctx) {
    var sources = pilotSources(ctx);
    var keys = sources.map(function (s) { return s.key; });
    /* Först i kön: döljningen av pausade kort ska vara klar innan kunden
       hunnit scrolla (annars flyttar sig synliga kort). Pausade serier
       (PILOT_PAUSED) klassas med samma källa som övriga serier: seriens
       riktiga routes i källorna. Misslyckas hämtningen döljs inget. */
    var pausedRoutes = [];
    HZ8.catalog.build().series.forEach(function (s) { if (!shown(s)) keys.forEach(function (k) { if (s.routes[k]) pausedRoutes.push(s.routes[k]); }); });
    Promise.all(pausedRoutes.map(allCards)).then(function (lists) {
      var set = {};
      lists.forEach(function (cards) { cards.forEach(function (c) { var p = cardPath(c.html); if (p) set[p] = true; }); });
      pilotPaused = set;
      syncPilotCards();
      if (pilotPausedReady) pilotPausedReady();
    }).catch(function () {});
    if (isPortal(ctx)) {
      /* Formattillhörighet ur formatens riktiga sidor (en gång). */
      var fmts = portalFormats();
      Promise.all(fmts.map(function (f) { return allCards(f.href).catch(function () { return null; }); })).then(function (lists) {
        lists.forEach(function (cards, i) {
          if (!cards) return;
          cards.forEach(function (c) {
            var p = cardPath(c.html);
            if (!p) return;
            (portalTypes[p] = portalTypes[p] || []);
            if (portalTypes[p].indexOf(fmts[i].key) === -1) portalTypes[p].push(fmts[i].key);
            if (!pilotType[p]) pilotType[p] = fmts[i].key;
          });
        });
        syncPilotCards();
        if (pilotPausedReady) pilotPausedReady();
      });
    } else Promise.all(sources.map(function (src) { return allCards(src.href); })).then(function (lists) {
      lists.forEach(function (cards, i) { cards.forEach(function (c) { var p = cardPath(c.html); if (p && !pilotType[p]) pilotType[p] = sources[i].key; }); });
      syncPilotCards();
    }).catch(function () {});
    /* Lager per källa: en källa som inte svarar gör bara SINA produkters
       lagerstatus okänd (ingen rad, köpknappen avgör vid klick). */
    sources.forEach(function (src) {
      allCards(src.href + "?filters=" + STOCK_TOKEN).then(function (cards) {
        pilotStock = pilotStock || {};
        pilotStockKnown[src.key] = true;
        cards.forEach(function (c) { var p = cardPath(c.html); if (p) pilotStock[p] = true; });
        syncPilotCards();
      }).catch(function () { /* okänd för den här källan */ });
    });
    if (!isPortal(ctx)) pilotSeriesList(ctx).filter(shown).forEach(function (s) {
      keys.forEach(function (k) {
        if (!s.routes[k]) return;
        pilotSeriesPending += 1;
        allCards(s.routes[k]).then(function (cards) {
          cards.forEach(function (c) {
            var p = cardPath(c.html);
            if (!p) return;
            (pilotSeries[p] = pilotSeries[p] || []);
            if (pilotSeries[p].indexOf(s.name) === -1) pilotSeries[p].push(s.name);
          });
          pilotSeriesPending -= 1;
          syncPilotCards();
          if (window.HZ8.pilotSync) window.HZ8.pilotSync();
        }).catch(function () { pilotSeriesPending = -1000; /* ofullständigt: inga antal */ });
      });
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
    var portal = isPortal(ctx);
    if (portal) { ctx = portalCtx(); portalOn = true; }
    var broad = isBroad(ctx);
    if (broad) pauseOff = true;
    html.classList.add("hz8-cat-pilot");
    /* Skalets ägare -- sätts en gång ur pathname, ändras aldrig av filter.
       TASK 01G: Alla Vapes, Alla Buds och Allt Hasch är EN familj breda
       formatsidor -- samma visuella skal (hero-rytm, guide, varm glashylla
       med serieflikar, gridstart, nedre formatvägar). `broad` styr bara
       datan (källor, pauslista, quizets formatsteg); Alla Vapes behåller sin
       sammanslagna vapes/carts/batterier-lista och sina pausade serier. */
    html.setAttribute("data-hz8-shell", "broad");
    /* Kompakt actionrad (07): "Lägg till" med påse, "Välj alternativ →"
       (kort "Välj →" på mobil), aldrig plus-only. */
    HZ8.cardLabels = {
      add: "Lägg till", addShort: "Lägg till", variants: "Välj", variantsShort: "Välj", variantsAria: "Välj alternativ",
      addIcon: '<svg class="hz8-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 8h12l-1 12H7z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/></svg>',
      variantsIcon: ""
    };
    if (HZ8.relabelCards) HZ8.relabelCards();
    loadCardData(ctx);
    var countEl = pilotMasthead(root, ctx);
    /* Portal (Hybrid H): sökrutan tar emblemets plats i heron. */
    if (!portal) pilotDecor(root);
    /* Kalkputslagret (CSS) ligger mellan fotot och texten i heron. */
    var heroEl = root.querySelector(".hz8-cat-hero");
    if (heroEl && !heroEl.querySelector(".hz8-cat-hero__plaster")) {
      var plaster = node("div", "hz8-cat-hero__plaster");
      plaster.setAttribute("aria-hidden", "true");
      heroEl.appendChild(plaster);
    }
    var picker = null;
    /* Portal: visat antal och scrollposition följer historikposten, så att
       "tillbaka" från en produkt återställer listan (även utan bfcache). */
    var search = null;
    var hstate = history.state || {};
    var shownBack = portal ? hstate.hz8Shown || 0 : 0;
    var scrollBack = portal && hstate.hz8Card != null ? { i: hstate.hz8Card, off: hstate.hz8Off || 0 } : null;
    function saveHistory(obj) {
      try { history.replaceState(Object.assign({}, history.state || {}, obj), "", location.href); } catch (e) { /* oförändrad */ }
    }
    if (portal) {
      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
      /* Ankare = första produktkort i vyn + dess avstånd från toppen
         (absolut scrollY flyttar sig när gridet byggs upp igen). */
      window.addEventListener("pagehide", function () {
        var cards = document.querySelectorAll(".hz8-series-results .product-card");
        var at = null;
        for (var i = 0; i < cards.length; i += 1) { var r = cards[i].getBoundingClientRect(); if (r.bottom > 0) { at = { hz8Card: i, hz8Off: Math.round(r.top) }; break; } }
        saveHistory(at && window.scrollY > 0 ? at : { hz8Card: null, hz8Off: 0 });
      });
      search = portalSearch(root);
    }

    var tool = node("div", "hz8-ptool");
    tool.setAttribute("role", "group");
    tool.setAttribute("aria-label", "Filtrera och sortera");
    tool.innerHTML =
      '<div class="hz8-ptool__desk">' +
        '<div class="hz8-ptool__slot hz8-ptool__type" hidden><button type="button" class="hz8-ptool__btn" data-pt="type"><span>Produkttyp</span><span class="hz8-ptool__n" data-n="type" hidden></span> ' + CHEV + '</button>' +
          '<div class="hz8-ppop hz8-ppop--type" id="hz8-ppop-type" role="dialog" aria-label="Produkttyp">' +
            '<div class="hz8-popts" data-pt-dim="typ"></div>' +
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
          '<div class="hz8-ppop hz8-ppop--sort" id="hz8-ppop-sort" role="dialog" aria-label="Sortera"><div class="hz8-psorts"></div><p class="hz8-psort-note" hidden>Popularitet och datum kan inte jämföras mellan vapes och carts.</p></div></div>' +
      '</div>' +
      '<div class="hz8-ptool__mob">' +
        '<button type="button" class="hz8-ptool__btn hz8-ptool__filter" data-pt="sheet" aria-haspopup="dialog">' + SLIDERS + ' <span class="hz8-pfilter-label">Filter</span></button>' +
        '<button type="button" class="hz8-ptool__btn" data-pt="sort-sheet" aria-haspopup="dialog">' + SORTICON + ' <span class="hz8-psort-label">Sortera</span></button>' +
      '</div>' +
      '<p class="hz8-visually-hidden" role="status" aria-live="polite" data-pt="live"></p>';
    root.appendChild(tool);

    /* Bred formatsida: primär hylla = serieflikar (formatet är fast), sedan
       antal, I lager, Alla filter och sortering. Flikarna styr samma
       flervalsmotor som popover/ark (picker.apply) -- ingen egen filterlogik.
       Alternativen speglar motorns egna rader (serier utan produkter i
       formatet tas bort av motorn = inga döda val). */
    /* Desktopraden väntar på typ-/volymdatan (loadDims): utan markören
       dyker "Produkttyp" upp efter att sidan visats och knuffar raden
       ~140 px åt höger (TASK 01C, läses av beredskapen i 00-bootstrap).
       Portalen har typerna som flikar och väntar inte på datan. */
    if (!portal) tool.querySelector(".hz8-ptool__desk").setAttribute("aria-busy", "true");
    function dimsSettled() { tool.querySelector(".hz8-ptool__desk").removeAttribute("aria-busy"); }
    var tabs = null, toolCount = null;
    {
      tabs = node("div", "hz8-pfam");
      tabs.setAttribute("role", "group");
      tabs.setAttribute("aria-label", "Cannabinoid / serie");
      var allLabel = portal ? "Alla" : (root.querySelector("article.category-description h1") || {}).textContent || ctx.format.label;
      if (portal) tabs.setAttribute("aria-label", "Produkttyp");
      tabs.innerHTML = '<button type="button" class="hz8-pfam__tab" data-fam="" aria-pressed="true">' + HZ8.esc(allLabel.trim()) + "</button>";
      var desk = tool.querySelector(".hz8-ptool__desk");
      desk.insertBefore(tabs, desk.firstChild);
      toolCount = node("p", "hz8-ptool__count");
      toolCount.setAttribute("aria-hidden", "true");
      desk.insertBefore(toolCount, tool.querySelector('[data-pt="stock"]'));
      /* Mobil: flikarna överst (svepbara), sedan antal + en samlad
         "Filter & sortera" (filterarket, nu med sortering). */
      var mob = tool.querySelector(".hz8-ptool__mob");
      mob.innerHTML = '<p class="hz8-ptool__count hz8-ptool__count--mob" aria-hidden="true"></p>' +
        '<button type="button" class="hz8-ptool__btn hz8-ptool__filter" data-pt="sheet" aria-haspopup="dialog">' + SLIDERS + ' <span class="hz8-pfilter-label">Filter &amp; sortera</span></button>';
      tabs.addEventListener("click", function (e) {
        var t = e.target.closest(".hz8-pfam__tab");
        if (!t) return;
        var name = t.getAttribute("data-fam");
        /* Portal: formatfliken är ett filter på samma lista (?typ=). */
        if (portal) { applyDims({ typ: name ? [name] : [] }); return; }
        if (!picker) return;
        picker.apply(name ? [name] : []);
      });
    }

    var chips = node("div", "hz8-pchips");
    chips.hidden = true;
    chips.innerHTML = '<span class="hz8-pchips__label">Aktiva filter:</span><ul class="hz8-pchips__list" role="list" aria-label="Aktiva filter"></ul>';
    root.appendChild(chips);
    var statusHost = node("div", "hz8-pstatus");
    root.appendChild(statusHost);
    /* Portal (G3): gridets rubrikrad -- stabil rubrik, aktuell sortering
       och en liten väg till guiden. */
    var gridSort = null;
    if (portal) {
      var gh = node("div", "hz8-pgridhead");
      gh.innerHTML = '<h2 class="hz8-pgridhead__title">Alla produkter</h2><p class="hz8-pgridhead__sort"></p>';
      root.appendChild(gh);
      gridSort = gh.querySelector(".hz8-pgridhead__sort");
    }

    /* Filterark (mobil bottom sheet, desktop "Alla filter"-panel). */
    var fs = sheet("hz8-pfilter", "Filter", "filter");
    var sections = [
      { key: "type", title: "Produkttyp" },
      { key: "volume", title: "Volym" },
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
    acc("type").innerHTML = '<div class="hz8-popts" data-pt-dim="typ"></div>';
    acc("volume").innerHTML = '<div class="hz8-popts" data-pt-dim="volym"></div>';
    fs.body.querySelector('[data-acc="type"]').hidden = true;
    fs.body.querySelector('[data-acc="volume"]').hidden = true;
    fs.body.insertAdjacentHTML("beforeend", accSection("sort", "Sortera", "hz8-pacc-sort", '<div class="hz8-psorts"></div>'));
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
    ss.body.innerHTML = '<div class="hz8-psorts"></div><p class="hz8-psort-note" hidden>Popularitet och datum kan inte jämföras mellan vapes och carts.</p>';

    /* Filterdocka (desktop/surfplatta, 2026-10-21): den ordinarie raden
       ligger kvar i flödet; när den helt lämnat vyn glider en liten
       Filter-knapp in från vänster och öppnar en kompakt panel. Samma
       alternativ, antal och motor som raden och arket (renderDims,
       flervalet, syncSort) -- ingen egen filterlogik. */
    function dockSec(key, title, body) {
      return '<section class="hz8-pdock__sec" data-pd-sec="' + key + '"><h3 class="hz8-pdock__h"><button type="button" class="hz8-pdock__row" aria-expanded="false" aria-controls="hz8-pd-' + key + '">' +
        '<span class="hz8-pdock__lbl">' + HZ8.esc(title) + '</span><span class="hz8-pdock__val"></span>' + CHEV + '</button></h3>' +
        '<div class="hz8-pdock__body" id="hz8-pd-' + key + '" hidden>' + body + '</div></section>';
    }
    var dock = node("div", "hz8-pdock");
    dock.setAttribute("inert", "");
    dock.innerHTML =
      '<button type="button" class="hz8-pdock__btn" aria-haspopup="dialog">' + SLIDERS + '<span>Filter</span><span class="hz8-pdock__n" aria-hidden="true" hidden></span></button>' +
      '<div class="hz8-pdock__panel" id="hz8-pdock-panel" role="dialog" aria-labelledby="hz8-pdock-title">' +
        '<div class="hz8-pdock__head"><h2 class="hz8-pdock__title" id="hz8-pdock-title">Filter</h2><span class="hz8-pdock__n" aria-hidden="true" hidden></span>' +
          '<button type="button" class="hz8-plink hz8-pdock__clear" data-pd="clear" hidden>Rensa</button></div>' +
        dockSec("type", "Produkttyp", '<div class="hz8-popts" data-pt-dim="typ"></div>') +
        dockSec("series", "Cannabinoid / serie", '<div class="hz8-popts" data-pt-series></div>') +
        dockSec("volume", "Volym", '<div class="hz8-popts" data-pt-dim="volym"></div>') +
        '<div class="hz8-pdock__sec hz8-pdock__sec--stock" data-pd-sec="stock" hidden><button type="button" class="hz8-pdock__row hz8-pdock__switch" role="switch" aria-checked="false" data-pd="stock"><span class="hz8-pdock__lbl">I lager</span><span class="hz8-pswitch__track" aria-hidden="true"></span></button></div>' +
        dockSec("sort", "Sortera", '<div class="hz8-psorts"></div>') +
        '<div class="hz8-pdock__foot"><button type="button" class="hz8-pcta hz8-pshow hz8-pdock__show" data-pd="show">Visa produkter</button></div>' +
      '</div>';
    document.body.appendChild(dock);
    var dockBtn = dock.querySelector(".hz8-pdock__btn");
    var mdock = mobileDock();
    var dockPanel = dock.querySelector(".hz8-pdock__panel");
    dock.querySelector("[data-pt-series]").innerHTML = seriesOptions(ctx);
    dock.querySelector('[data-pd-sec="type"]').hidden = true;
    dock.querySelector('[data-pd-sec="volume"]').hidden = true;

    /* Innehåll som finns i både popover och ark. */
    [tool.querySelector("#hz8-ppop-series"), fs.el.querySelector('[data-acc="series"]')].forEach(function (scope) {
      scope.querySelector("[data-pt-series]").innerHTML = seriesOptions(ctx);
      /* TASK 01E: hela den korta listan syns redan -- mobilarket visar då
         ingen lokal sökning (CSS, data-hz8-short). Desktop oförändrat. */
      if (scope.querySelectorAll(".hz8-popt[data-hz8-series]").length <= SERIES_SEARCH_MIN) scope.setAttribute("data-hz8-short", "");
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

    /* Produkttyp (källa) och Volym (ur namnet) -- två separata dimensioner,
       alternativen ur det sammanslagna sortimentet (pausade undantagna),
       0 träffar = dolt. Filtreringen sker i unionsmotorn (extra). */
    var sources = pilotSources(ctx);
    if (sources.length > 1) {
      pilotSortAllowed = { "Lägsta pris": true, "Högsta pris": true, "Namn A-Ö": true, "Namn Ö-A": true };
      document.querySelectorAll(".hz8-psort-note").forEach(function (n) { n.hidden = false; });
    }
    var dims = {
      typ: { param: TYPE_PARAM, opts: [], acc: "type" },
      volym: { param: VOLUME_PARAM, opts: [], acc: "volume" }
    };
    function excludePaused(path) { return !!(pilotPaused && pilotPaused[path]); }
    function valid(d) { return readList(dims[d].param).filter(function (k) { return dims[d].opts.some(function (o) { return o.key === k; }); }); }
    function optLabel(d, k) { var o = dims[d].opts.filter(function (x) { return x.key === k; })[0]; return o ? o.label : k; }
    var typeExtra = {
      active: function () { return valid("typ").length > 0 || valid("volym").length > 0 || (portal && !!readQuery()); },
      key: function () { return valid("typ").join(",") + "/" + valid("volym").join(",") + (portal ? "/" + searchTokens(readQuery()).join(" ") + "/" + (portalSeries ? 1 : 0) : ""); },
      test: function (c) {
        var t = valid("typ"), v = valid("volym");
        if (portal) {
          var qt = searchTokens(readQuery());
          if (qt.length && !searchHit(haystack(cardPath(c.html), cardName(c.html), cardBrand(c.html)), qt)) return false;
        }
        if (t.length) {
          var types = portal ? portalTypes[cardPath(c.html)] || [] : [c.src];
          if (!types.some(function (k) { return t.indexOf(k) !== -1; })) return false;
        }
        if (v.length) { var vol = cardUnit(cardName(c.html)); if (!vol || v.indexOf(vol.key) === -1 || (!broad && !portal && !VAPES_VOLUMES[vol.key])) return false; }
        return true;
      }
    };
    function renderDims() {
      Object.keys(dims).forEach(function (d) {
        var sel = valid(d);
        document.querySelectorAll('[data-pt-dim="' + d + '"]').forEach(function (box) {
          var sig = dims[d].opts.map(function (o) { return o.key; }).join("|");
          if (box.getAttribute("data-sig") !== sig) {
            box.setAttribute("data-sig", sig);
            box.innerHTML = dims[d].opts.map(function (o) {
              return '<div class="hz8-popt" data-hz8-dim="' + d + '" data-value="' + HZ8.esc(o.key) + '"><button type="button" class="hz8-popt__btn" aria-pressed="false"><span class="hz8-popt__box" aria-hidden="true"></span><span class="hz8-rail__label">' + HZ8.esc(o.label) + '</span><span class="hz8-popt__count"></span></button></div>';
            }).join("");
          }
          var counts = facetCounts(d);
          box.querySelectorAll("[data-hz8-dim]").forEach(function (row) {
            var k = row.getAttribute("data-value");
            var btn = row.querySelector("button");
            btn.setAttribute("aria-pressed", String(sel.indexOf(k) !== -1));
            var t = counts && counts[k] != null ? String(counts[k]) : "";
            /* 0 träffar givet övriga val: alternativet döljs (aldrig tomt
               visat) -- t.ex. bara carts-volymer när Carts är valt. Ett
               redan valt alternativ ligger kvar så att det kan väljas bort. */
            var none = t === "0" && sel.indexOf(k) === -1;
            if (row.hidden !== none) row.hidden = none;
            var el = btn.querySelector(".hz8-popt__count");
            if (el.textContent !== t) el.textContent = t;
            var label = optLabel(d, k) + (t ? ", " + t + (t === "1" ? " produkt" : " produkter") : "");
            if (btn.getAttribute("aria-label") !== label) btn.setAttribute("aria-label", label);
          });
        });
      });
      /* Produkttyp visas när sortimentet har minst två typer; volym när
         minst två volymer finns. Portal: volym/vikt bara när de valda
         typerna har en gemensam enhet -- ml och gram blandas aldrig. */
      var hasType = dims.typ.opts.length > 1, hasVol = dims.volym.opts.length > 1;
      if (portal) {
        var unit = portalUnit();
        var nUnit = 0;
        document.querySelectorAll('[data-pt-dim="volym"] [data-hz8-dim]').forEach(function (row) {
          var o = dims.volym.opts.filter(function (x) { return x.key === row.getAttribute("data-value"); })[0];
          var off = !unit || !o || o.unit !== unit;
          if (off) row.hidden = true; else if (!row.hidden) nUnit += 1;
        });
        hasVol = !!unit && nUnit > 1;
        var vt = unit === "g" ? "Vikt" : "Volym";
        document.querySelectorAll('[data-acc="volume"] .hz8-pacc__title, [data-pd-sec="volume"] .hz8-pdock__lbl').forEach(function (el) { if (el.textContent !== vt) el.textContent = vt; });
      }
      tool.querySelector(".hz8-ptool__type").hidden = !hasType;
      fs.body.querySelector('[data-acc="type"]').hidden = !hasType;
      fs.body.querySelector('[data-acc="volume"]').hidden = !hasVol;
      dock.querySelector('[data-pd-sec="type"]').hidden = !hasType;
      dock.querySelector('[data-pd-sec="volume"]').hidden = !hasVol;
    }
    /* Gemensam enhet för valda typer (portal), annars null. */
    function unitFor(t) {
      if (!t.length) return null;
      var u = t.map(function (k) { return PORTAL_UNIT[k] || null; });
      return u.every(function (x) { return x && x === u[0]; }) ? u[0] : null;
    }
    function portalUnit() { return unitFor(valid("typ")); }
    function applyDims(map) {
      /* Portal: ny typ med annan enhet -- tidigare volym-/viktval gäller
         inte längre (samma historiksteg). */
      if (portal && map.typ && !map.volym && unitFor(map.typ) !== portalUnit()) map.volym = [];
      var w = {};
      Object.keys(map).forEach(function (d) { w[dims[d].param] = map[d]; });
      writeLists(w);
      renderDims();
      if (picker) picker.sync();
      schedule();
    }
    function applyType(key) { applyDims({ typ: [key] }); }
    document.addEventListener("click", function (e) {
      var row = e.target.closest("[data-hz8-dim]");
      if (!row || !row.closest(".hz8-ptool, #hz8-pfilter, .hz8-pdock")) return;
      var d = row.getAttribute("data-hz8-dim"), k = row.getAttribute("data-value");
      var sel = valid(d);
      var i = sel.indexOf(k);
      if (i === -1) sel.push(k); else sel.splice(i, 1);
      var m = {}; m[d] = sel; applyDims(m);
    });
    /* Träffantal per alternativ: ur det fullständiga, deduplicerade
       underlaget (pausade undantagna), givet ÖVRIGA aktiva val (typ,
       volym, serie, I lager). Utelämnas när det inte kan räknas säkert:
       underlaget eller serie-/lagerdata saknas, eller ett native filter
       vi inte har per-produktdata för (t.ex. Varumärke) är aktivt. */
    var pilotBase = null;
    function facetCounts(d) {
      if (!pilotBase || pilotSeriesPending !== 0) return null;
      /* Portal: seriemedlemskap per produkt laddas inte -- med en vald
         serie utelämnas antalen hellre än att gissas. */
      if (portal && picker && picker.selected().length) return null;
      var stockOn = !!(stockOption() && stockOption().checked);
      if (stockOn && !pilotStock) return null;
      if (nativeChips().some(function (c) { return c.label !== "Finns i lager"; })) return null;
      var sel = picker ? picker.selected() : [];
      var t = d === "typ" ? [] : valid("typ"), v = d === "volym" ? [] : valid("volym");
      var qt = portal ? searchTokens(readQuery()) : [];
      var out = {};
      pilotBase.forEach(function (it) {
        if (excludePaused(it.p)) return;
        var types = portal ? portalTypes[it.p] || [] : [it.src];
        if (qt.length && !searchHit(haystack(it.p, it.name, it.brand), qt)) return;
        if (t.length && !types.some(function (k) { return t.indexOf(k) !== -1; })) return;
        if (v.length && (!it.vol || v.indexOf(it.vol) === -1)) return;
        if (!portal && sel.length && !(pilotSeries[it.p] || []).some(function (n) { return sel.indexOf(n) !== -1; })) return;
        if (stockOn && !pilotStock[it.p]) return;
        if (d === "typ") types.forEach(function (k) { out[k] = (out[k] || 0) + 1; });
        else if (it.vol) out[it.vol] = (out[it.vol] || 0) + 1;
      });
      dims[d].opts.forEach(function (o) { if (out[o.key] == null) out[o.key] = 0; });
      return out;
    }
    var typeCount = {};
    function loadDims() {
      Promise.all(sources.map(function (src) { return allCards(src.href); })).then(function (lists) {
        var seen = {}, vols = {}, base = [];
        typeCount = {};
        lists.forEach(function (cards, i) {
          cards.forEach(function (c) {
            var p = cardPath(c.html);
            if (!p || seen[p] || excludePaused(p)) return;
            seen[p] = true;
            if (portal) (portalTypes[p] || []).forEach(function (k) { typeCount[k] = (typeCount[k] || 0) + 1; });
            else typeCount[sources[i].key] = (typeCount[sources[i].key] || 0) + 1;
            var cv = cardUnit(cardName(c.html));
            if (cv && !broad && !portal && !VAPES_VOLUMES[cv.key]) cv = null;
            base.push({ p: p, src: sources[i].key, vol: cv ? cv.key : null, name: cardName(c.html), brand: cardBrand(c.html), href: cardLink(c.html) });
            if (cv) vols[cv.key] = vols[cv.key] || cv;
          });
        });
        pilotBase = base;
        if (portal) window.HZ8.portalBase = function () { return pilotBase; };
        dims.typ.opts = (portal ? portalFormats() : sources).filter(function (s) { return typeCount[s.key] > 0; }).map(function (s) { return { key: s.key, label: s.label }; });
        dims.volym.opts = Object.keys(vols).map(function (k) { return vols[k]; }).sort(function (a, b) { return a.order - b.order; });
        renderDims();
        dimsSettled();
        if (picker) picker.sync();
        schedule();
      }).catch(function () { dimsSettled(); /* utan fullständiga listor: inga typ-/volymval */ });
    }
    pilotPausedReady = function () { loadDims(); if (picker) picker.sync(); schedule(); };

    /* Portal: guiden/quizet är en separat framtida task -- ingen CTA här. */
    if (!portal) {
      var quiz = buildQuiz(ctx, function () { return picker; }, function (key) { return typeCount[key] || null; }, applyType);
      pilotGuide(root, quiz.steps(), function () { quiz.open(); }, quizNoun(ctx));
    }

    /* Portal: tomt resultat med vägar tillbaka på samma sida -- rensa
       sökningen, ta bort senaste aktiva filtret, rensa allt. */
    function portalEmpty(results) {
      var q = readQuery();
      var data = chipData();
      results.innerHTML = '<div class="hz8-state hz8-cat-empty hz8-pempty" role="status"><h2>Inga produkter matchar</h2><p></p><div class="hz8-pempty__actions"></div></div>';
      results.querySelector("p").textContent = q ? "Ingen produkt matchar ”" + q + "”" + (data.length ? " med de valda filtren." : ".") : "Inga produkter matchar de valda filtren.";
      var box = results.querySelector(".hz8-pempty__actions");
      function action(label, cls, fn) {
        var b = node("button", cls);
        b.type = "button";
        b.textContent = label;
        b.addEventListener("click", fn);
        box.appendChild(b);
      }
      if (q) action("Rensa sökning", "hz8-pcta hz8-pempty__q", function () { search.clear(true); });
      if (data.length) { var last = data[data.length - 1]; action("Ta bort " + last.label, "hz8-pghost hz8-pempty__last", last.remove); }
      if ((q ? 1 : 0) + data.length > 1) action("Rensa alla filter", "hz8-plink hz8-pempty__all", function () { clearAll(); });
    }

    /* Flervalsmotorn (samma som övriga formatsidor). */
    var seriesRoots = [tool.querySelector("[data-pt-series]"), fs.el.querySelector("[data-pt-series]"), dock.querySelector("[data-pt-series]")];
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
        exclude: excludePaused,
        sources: sources,
        always: sources.length > 1 || portal,
        quiet: true,
        /* Portal: 24 produkter först på mobil, 48 på desktop. */
        step: portal && window.matchMedia("(max-width: 767px)").matches ? 24 : 48,
        clearLabel: "Rensa alla filter",
        onClearAll: function () { clearAll(); },
        seriesList: portal ? pilotSeriesList(ctx).filter(shown) : null,
        memberRoutes: portal ? function (s) { return Object.keys(s.routes).map(function (k) { return s.routes[k]; }).filter(function (r, i, a) { return a.indexOf(r) === i; }); } : null,
        lazyCounts: portal,
        moreUi: portal ? portalMore : null,
        emptyUi: portal ? portalEmpty : null,
        onResult: portal ? function () {
          if (!scrollBack) return;
          var a = scrollBack; scrollBack = null;
          /* Efter att unionsgridet ersatt sidans eget grid (samma tick),
             och en gång till när bilder och lagerrader satt sig. */
          /* Ankaret hålls medan layouten sätter sig (bilder, lagerrader,
             chips): justera vid varje storleksändring, sluta efter 600 ms
             stillhet eller direkt när kunden själv scrollar; tak 6 s. */
          var done = false, quiet = 0, raf = 0, ro = null;
          var INPUT = ["wheel", "touchmove", "keydown"];
          function align() {
            raf = 0;
            if (done) return;
            var card = document.querySelectorAll(".hz8-series-results .product-card")[a.i];
            if (!card) return;
            var d = card.getBoundingClientRect().top - a.off;
            if (Math.abs(d) > 1) window.scrollTo({ top: window.scrollY + d, behavior: "instant" });
          }
          function stop() {
            if (done) return;
            done = true;
            if (ro) ro.disconnect();
            window.clearTimeout(quiet);
            INPUT.forEach(function (ev) { window.removeEventListener(ev, stop, true); });
          }
          function settle() { window.clearTimeout(quiet); quiet = window.setTimeout(stop, 600); }
          INPUT.forEach(function (ev) { window.addEventListener(ev, stop, { capture: true, passive: true }); });
          window.setTimeout(function () {
            align();
            if ("ResizeObserver" in window) {
              ro = new ResizeObserver(function () { if (!raf) raf = window.requestAnimationFrame(align); settle(); });
              /* #store-main är gridet (roten har display: contents). */
              ro.observe(document.getElementById("store-main") || document.body);
            }
            settle();
            window.setTimeout(stop, 6000);
          }, 0);
        } : null,
        firstLimit: portal ? function () { var n = shownBack; shownBack = 0; return n; } : null,
        onShown: portal ? function (n) { saveHistory({ hz8Shown: n }); } : null
      });
      if (picker) { html.classList.add("hz8-series-picker"); activePicker = picker; }
    }

    loadDims();
    var pops = {
      type: popover(tool.querySelector('[data-pt="type"]'), tool.querySelector("#hz8-ppop-type")),
      series: popover(tool.querySelector('[data-pt="series"]'), tool.querySelector("#hz8-ppop-series")),
      sort: popover(tool.querySelector('[data-pt="sort"]'), tool.querySelector("#hz8-ppop-sort"))
    };
    /* Dockans panel: samma popover-beteende (Escape och klick utanför
       stänger, Escape lämnar fokus på knappen, en öppen åt gången,
       intern scroll om fönstret är lågt). is-open håller headern synlig. */
    var dockPop = popover(dockBtn, dockPanel);
    var popShow = dockPop.show, popClose = dockPop.close;
    dockPop.show = function () {
      if (picker && picker.loadCounts) picker.loadCounts();
      dock.classList.add("is-open");
      popShow();
      /* Valt alternativ i en hopfälld sektion kan inte ta fokus: första
         synliga kontrollen i panelen i stället. */
      var a = document.activeElement;
      if (!dockPanel.contains(a) || !a.getClientRects().length) {
        var f = Array.prototype.find.call(dockPanel.querySelectorAll("button"), function (x) { return x.getClientRects().length; });
        if (f) f.focus({ preventScroll: true });
      }
    };
    dockPop.close = function (focus) { popClose(focus); dock.classList.toggle("is-open", !dockPanel.hidden); };
    dockPanel.addEventListener("click", function (e) {
      var row = e.target.closest(".hz8-pdock__row[aria-controls]");
      if (row) {
        var open = row.getAttribute("aria-expanded") !== "true";
        dockPanel.querySelectorAll(".hz8-pdock__row[aria-controls]").forEach(function (r) {
          var on = open && r === row;
          r.setAttribute("aria-expanded", String(on));
          document.getElementById(r.getAttribute("aria-controls")).hidden = !on;
        });
        return;
      }
      var b = e.target.closest("[data-pd]");
      if (!b) return;
      var k = b.getAttribute("data-pd");
      if (k === "stock") { var o = stockOption(); if (o) toggleNative(STOCK_GROUP, o.label); }
      else if (k === "clear") { clearAll(); var f = dockPanel.querySelector(".hz8-pdock__row"); if (f) f.focus({ preventScroll: true }); }
      else if (k === "show") { dockPop.close(false); dockBtn.focus({ preventScroll: true }); scrollToProducts(); }
    });
    function syncFilterDock(data, sel, tsel, vsel, so) {
      var n = data.length;
      dock.querySelectorAll(".hz8-pdock__n").forEach(function (el) {
        el.hidden = !n;
        if (el.textContent !== (n ? String(n) : "")) el.textContent = n ? String(n) : "";
      });
      dockBtn.setAttribute("aria-label", n ? "Filter, " + n + (n === 1 ? " aktivt filter" : " aktiva filter") : "Filter");
      if (mdock) mdock.sync(n);
      dockBtn.classList.toggle("is-active", !!n);
      dock.querySelector(".hz8-pdock__clear").hidden = !n;
      function val(key, text) {
        var el = dock.querySelector('[data-pd-sec="' + key + '"] .hz8-pdock__val');
        if (el && el.textContent !== text) el.textContent = text;
      }
      val("type", tsel.length ? tsel.map(function (k) { return optLabel("typ", k); }).join(", ") : "Alla");
      val("series", sel.length === 1 ? sel[0] : sel.length ? sel.length + " val" : "Alla");
      val("volume", vsel.length ? vsel.map(function (k) { return optLabel("volym", k); }).join(", ") : "Alla");
      var cur = currentSort();
      val("sort", cur && SORT_LABELS[cur] ? SORT_LABELS[cur] : "Standard");
      dock.querySelector('[data-pd-sec="sort"]').hidden = !sortOptions().length;
      var sw = dock.querySelector('[data-pd="stock"]');
      dock.querySelector('[data-pd-sec="stock"]').hidden = !so;
      sw.setAttribute("aria-checked", String(!!(so && so.checked)));
    }

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
      ["typ", "volym"].forEach(function (d) {
        valid(d).forEach(function (k) {
          out.push({ label: optLabel(d, k), remove: function () { var m = {}; m[d] = valid(d).filter(function (x) { return x !== k; }); applyDims(m); } });
        });
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
      writeLists((function () { var w = {}; w[TYPE_PARAM] = []; w[VOLUME_PARAM] = []; if (portal) w[SEARCH_PARAM] = []; return w; })());
      if (search) search.sync();
      renderDims();
      if (picker && picker.selected().length) picker.apply([]); else if (picker) picker.sync();
      var clear = document.querySelector(".category-sort .product-filter__clear");
      if (clear) clear.click();
    }

    tool.addEventListener("click", function (e) {
      var b = e.target.closest("[data-pt]");
      if (!b) return;
      var k = b.getAttribute("data-pt");
      if (picker && picker.loadCounts && /^(all|sheet|series)$/.test(k)) picker.loadCounts();
      if (k === "stock") { var o = stockOption(); if (o) toggleNative(STOCK_GROUP, o.label); }
      else if (k === "all") { openSection(null); fs.open(); }
      else if (k === "sheet") { openSection(portal ? "type" : picker ? "series" : null); fs.open(); }
      else if (k === "sort-sheet") ss.open();
      else if (k === "clear-series") { if (picker) picker.apply([]); }
      else if (k === "clear-types") applyDims({ typ: [] });
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
        /* Portal (Hybrid H): knappen visar bara aktuellt läge ("Nyast"). */
        if (portal && label) { if (l.textContent !== label) l.textContent = label; }
        else if (l.textContent !== t) l.innerHTML = "Sortera" + (label ? '<span class="hz8-psort-cur">: ' + HZ8.esc(label) + "</span>" : "");
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
      if (fs.isOpen()) fs.close();
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
      var fbase = "Filter & sortera";
      var fl = data.length ? fbase + " (" + data.length + ")" : fbase;
      tool.querySelectorAll(".hz8-pfilter-label").forEach(function (l) { if (l.textContent !== fl) l.textContent = fl; });
      tool.querySelector(".hz8-ptool__filter").classList.toggle("is-active", !!data.length);
      var sel = picker ? picker.selected() : [];
      var tsel = valid("typ");
      var vsel = valid("volym");
      setSum(fs.body.querySelector('[data-acc="volume"]'), vsel.length ? "Valt: " + vsel.map(function (k) { return optLabel("volym", k); }).join(", ") : dims.volym.opts.filter(function (o) { return !portal || o.unit === portalUnit(); }).map(function (o) { return o.label; }).join(", "), vsel.length);
      var tn = tool.querySelector('[data-n="type"]');
      tn.hidden = !tsel.length;
      tn.textContent = tsel.length ? String(tsel.length) : "";
      tool.querySelector('[data-pt="type"]').classList.toggle("is-active", !!tsel.length);
      setSum(fs.body.querySelector('[data-acc="type"]'), tsel.length ? "Valt: " + tsel.map(function (k) { return optLabel("typ", k); }).join(", ") : dims.typ.opts.map(function (o) { return o.label; }).join(", "), tsel.length);
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
      syncFilterDock(data, sel, tsel, vsel, so);
      if (portal) {
        syncTypeTabs(tsel, countText);
        if (search) search.sync();
        var sortCur = currentSort();
        if (gridSort) { var st = sortCur && SORT_LABELS[sortCur] ? "Sorterat på " + SORT_LABELS[sortCur].toLowerCase().replace(/:\s*/, ", ") : ""; if (gridSort.textContent !== st) gridSort.textContent = st; }
        var typeLabels = tsel.map(function (k) { return optLabel("typ", k); });
        var typeOnly = data.length > 0 && data.every(function (d) { return typeLabels.indexOf(d.label) !== -1; });
        if (chips.classList.contains("hz8-pchips--fam-only") !== typeOnly) chips.classList.toggle("hz8-pchips--fam-only", typeOnly);
      } else {
        syncFamTabs(sel, countText);
        /* Mobil: chipraden döljs när den bara upprepar vald(a) flik(ar)
           (valet syns i fliken och i knappens antal). Övriga filter visas. */
        var famOnly = data.length > 0 && data.every(function (d) { return sel.indexOf(d.label) !== -1; });
        if (chips.classList.contains("hz8-pchips--fam-only") !== famOnly) chips.classList.toggle("hz8-pchips--fam-only", famOnly);
      }
      if (n != null && lastLive !== null && n !== lastLive) live.textContent = plural(n) + " visas";
      if (n != null) lastLive = n;
      syncMirror();
      syncSort();
      syncPilotCards();
      renderDims();
    }
    var lastPressed = "";
    /* Toning i högerkanten bara när raden har fler flikar åt höger. */
    function syncTabEdge() {
      if (!tabs) return;
      var more = tabs.scrollWidth - tabs.clientWidth - tabs.scrollLeft > 4;
      if (tabs.classList.contains("is-more") !== more) tabs.classList.toggle("is-more", more);
    }
    if (portal && tabs) {
      tabs.addEventListener("scroll", function () { window.requestAnimationFrame(syncTabEdge); }, { passive: true });
      window.addEventListener("resize", syncTabEdge);
    }
    /* Portal: formatflikar ur typalternativen (0 träffar = ingen flik). */
    function syncTypeTabs(tsel, countText) {
      var opts = dims.typ.opts;
      var sig = opts.map(function (o) { return o.key; }).join("|");
      if (tabs.getAttribute("data-sig") !== sig) {
        tabs.setAttribute("data-sig", sig);
        tabs.querySelectorAll('.hz8-pfam__tab:not([data-fam=""])').forEach(function (t) { t.remove(); });
        opts.forEach(function (o) {
          var b = node("button", "hz8-pfam__tab");
          b.type = "button";
          b.setAttribute("data-fam", o.key);
          b.textContent = o.label;
          tabs.appendChild(b);
        });
      }
      var pressed = null;
      tabs.querySelectorAll(".hz8-pfam__tab").forEach(function (t) {
        var k = t.getAttribute("data-fam");
        var on = k ? tsel.indexOf(k) !== -1 : !tsel.length;
        if (on && !pressed) pressed = t;
        if (t.getAttribute("aria-pressed") !== String(on)) t.setAttribute("aria-pressed", String(on));
      });
      /* Smal skärm: vald flik i bild (bara radens egen scroll) -- endast
         när valet byts, annars snäpper raden tillbaka när kunden sveper. */
      var pkey = pressed ? pressed.getAttribute("data-fam") : null;
      if (pressed && pkey !== lastPressed && tabs.scrollWidth > tabs.clientWidth) {
        var tr = tabs.getBoundingClientRect(), pr = pressed.getBoundingClientRect();
        if (pr.left < tr.left || pr.right > tr.right) tabs.scrollLeft += pr.left < tr.left ? pr.left - tr.left - 8 : pr.right - tr.right + 24;
      }
      lastPressed = pkey;
      syncTabEdge();
      tool.querySelectorAll(".hz8-ptool__count").forEach(function (c) { if (c.textContent !== countText) c.textContent = countText; });
    }
    function syncFamTabs(sel, countText) {
      var rows = Array.prototype.filter.call(tool.querySelectorAll(".hz8-ptool__desk .hz8-popt[data-hz8-series]"), function (r) { return !r.hidden; });
      var names = rows.map(function (r) { return r.getAttribute("data-hz8-series"); });
      var sig = names.join("|");
      if (tabs.getAttribute("data-sig") !== sig) {
        tabs.setAttribute("data-sig", sig);
        tabs.querySelectorAll('.hz8-pfam__tab[data-fam]:not([data-fam=""])').forEach(function (t) { if (names.indexOf(t.getAttribute("data-fam")) === -1) t.remove(); });
        names.forEach(function (n) {
          if (tabs.querySelector('.hz8-pfam__tab[data-fam="' + n.replace(/"/g, '\\"') + '"]')) return;
          var b = node("button", "hz8-pfam__tab");
          b.type = "button";
          b.setAttribute("data-fam", n);
          b.textContent = n;
          tabs.appendChild(b);
        });
      }
      tabs.querySelectorAll(".hz8-pfam__tab").forEach(function (t) {
        var n = t.getAttribute("data-fam");
        var on = n ? sel.indexOf(n) !== -1 : !sel.length;
        if (t.getAttribute("aria-pressed") !== String(on)) t.setAttribute("aria-pressed", String(on));
      });
      tool.querySelectorAll(".hz8-ptool__count").forEach(function (c) { if (c.textContent !== countText) c.textContent = countText; });
    }
    HZ8.watch(syncAll);
    HZ8.pilotSync = function () { renderDims(); schedule(); };
    /* Fast verktygsrad: täckande bakgrund bara när den sitter fast, och
       den lämnar skärmen när produktområdet är slut (seriebandet och
       kundservice ska inte ligga under den). */
    var area = root.querySelector(".designer-category");
    var deskMQ = window.matchMedia("(min-width: 768px)");
    function syncStuck() {
      /* Från 768 px ligger raden kvar i flödet (dockan tar över). TASK 01E:
         även mobilraden ligger i flödet och sitter aldrig fast under
         headern -- bottendockan (mobileDock) tar över där. */
      tool.classList.remove("is-stuck", "is-past");
    }
    window.addEventListener("scroll", function () { window.requestAnimationFrame(syncStuck); }, { passive: true });
    window.addEventListener("resize", syncStuck);
    syncStuck();
    /* Dockan visas när raden helt lämnat vyn uppåt och produktområdet
       fortfarande syns under knappen; aldrig samtidigt som raden. Raden
       räknas som "nära" redan 96 px ovanför vyn, så att dockans
       utglidning (240 ms) är klar innan raden syns igen. */
    var rowAbove = false, areaOn = false;
    function setDock() {
      var on = deskMQ.matches && rowAbove && areaOn;
      if (dock.classList.contains("is-shown") === on) return;
      dock.classList.toggle("is-shown", on);
      if (on) {
        dock.removeAttribute("inert");
        if (openPop && tool.contains(openPop.panel)) openPop.close(false);
      } else {
        var had = dock.contains(document.activeElement);
        dockPop.close(false);
        dock.setAttribute("inert", "");
        if (had) tool.querySelector('[data-pt="all"]').focus({ preventScroll: true });
      }
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        var e = entries[entries.length - 1];
        rowAbove = !e.isIntersecting && e.boundingClientRect.bottom <= 0;
        setDock();
      }, { rootMargin: "96px 0px 0px 0px" }).observe(tool);
      /* Säkring vid mycket snabb scroll: syns raden faktiskt i vyn medan
         knappen fortfarande glider ut, försvinner knappen direkt. */
      new IntersectionObserver(function (entries) {
        dock.classList.toggle("is-row-in", entries[entries.length - 1].isIntersecting);
      }).observe(tool);
      if (area) new IntersectionObserver(function (entries) {
        areaOn = entries[entries.length - 1].isIntersecting;
        setDock();
      }, { rootMargin: "-180px 0px 0px 0px" }).observe(area);
      var onMQ = function () { setDock(); };
      if (deskMQ.addEventListener) deskMQ.addEventListener("change", onMQ); else deskMQ.addListener(onMQ);
    }
    mdock.start();
    /* Nedre upptäckt följer den oanvända axeln (beslut 2026-10-23): breda
       formatsidor visar redan sina serier -- längst ned andra format. */
    if (portal) portalLower(root);
    else portalLower(root, pilotSources(ctx).map(function (s) { return s.key; }));
    return picker;

    /* ---- TASK 01E: mobil bottendocka (<=767 px) ----
       Filter + Sortera i ett lågt varmt glas nära nederkanten. Visas först
       när den vanliga raden helt lämnat vyn uppåt (96 px marginal, så att
       dockan hunnit glida ut innan raden syns igen), aldrig samtidigt som
       raden, och viker undan före sidans slut (produktområdets nederkant),
       när ett ark/en meny/varukorgen är öppen och när cookierutan visas.
       Knapparna öppnar de befintliga arken (samma motor och tillstånd). */
    function mobileDock() {
      var el = node("div", "hz8-mdock");
      el.setAttribute("role", "group");
      el.setAttribute("aria-label", "Filter och sortering");
      el.setAttribute("inert", "");
      el.innerHTML = '<button type="button" class="hz8-mdock__btn" data-md="filter" aria-haspopup="dialog">' + SLIDERS + '<span>Filter</span><span class="hz8-mdock__n" aria-hidden="true" hidden></span></button>' +
        '<span class="hz8-mdock__div" aria-hidden="true"></span>' +
        '<button type="button" class="hz8-mdock__btn" data-md="sort" aria-haspopup="dialog">' + SORTICON + '<span>Sortera</span></button>';
      document.body.appendChild(el);
      var fBtn = el.querySelector('[data-md="filter"]');
      var mobMQ = window.matchMedia("(max-width: 767px)");
      var shown = false, ticking = false;
      el.addEventListener("click", function (e) {
        var b = e.target.closest("[data-md]");
        if (!b) return;
        if (picker && picker.loadCounts) picker.loadCounts();
        if (b.getAttribute("data-md") === "filter") { openSection(portal ? "type" : picker ? "series" : null); fs.open(); }
        else { openSection("sort"); fs.open(); }
        update();
      });
      function blocked() {
        var h = document.documentElement;
        return h.classList.contains("hz8-scroll-locked") || h.classList.contains("show--consent") || fs.isOpen() || ss.isOpen() ||
          !!document.querySelector("#hz8MobileDrawer.is-open, .hz8-msearch.is-open, #cart-side-wrap.is-active, .upselling-sidebar__container.is-active");
      }
      function update() {
        ticking = false;
        var vh = window.innerHeight;
        var rowBottom = tool.getBoundingClientRect().bottom;
        var rowAbove = rowBottom <= -96;
        /* Säkring vid mycket snabb scroll: syns raden faktiskt i vyn medan
           dockan fortfarande glider ut, försvinner dockan direkt. */
        el.classList.toggle("is-row-in", rowBottom > 0);
        var areaOn = !!area && area.getBoundingClientRect().bottom > vh + 40;
        var want = mobMQ.matches && rowAbove && areaOn;
        /* Ark/meny öppen: dockan viker undan men behåller fokusbarheten, så
           att arkets fokusretur kan landa på knappen som öppnade det. */
        var yieldNow = want && blocked();
        el.classList.toggle("is-yield", yieldNow);
        if (want === shown) return;
        shown = want;
        el.classList.toggle("is-shown", want);
        if (want) el.removeAttribute("inert");
        else {
          var had = el.contains(document.activeElement);
          el.setAttribute("inert", "");
          if (had) { var f = tool.querySelector(".hz8-ptool__filter"); if (f) f.focus({ preventScroll: true }); }
        }
      }
      function schedule() { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } }
      return {
        start: function () {
          window.addEventListener("scroll", schedule, { passive: true });
          window.addEventListener("resize", schedule, { passive: true });
          if (mobMQ.addEventListener) mobMQ.addEventListener("change", schedule); else mobMQ.addListener(schedule);
          HZ8.watch(schedule);
          new MutationObserver(schedule).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
          update();
        },
        sync: function (n) {
          var b = el.querySelector(".hz8-mdock__n");
          b.hidden = !n;
          if (b.textContent !== (n ? String(n) : "")) b.textContent = n ? String(n) : "";
          fBtn.classList.toggle("is-active", !!n);
          var label = n ? "Filter, " + n + (n === 1 ? " aktivt filter" : " aktiva filter") : "Filter";
          if (fBtn.getAttribute("aria-label") !== label) fBtn.setAttribute("aria-label", label);
        }
      };
    }
  }

  /* ======================================================================
     Serie x format-mall (2026-10-21): EN datadriven mall för alla sidor
     som kartan säkert identifierar som combo (06-catalog-map, contextFor):
     dedikerade kategorier (/m-s-vapes, /thca-hash ...) och verifierade
     filtrerade vyer (/hasch?filters=Serie_Magic%20Sauce). Allt härleds ur
     kontexten (serie, format, route) och sidans riktiga DOM:
       kompakt intro -> kontextflikar (seriens format) -> Nyehandels egen
       verktygsrad (antal, återstående filter, sortering) -> produkter med
       Alla Vapes-kortet -> (1-3 produkter) "Fler sätt att utforska" ->
       "Fortsätt i serien" / "Andra serier i <format>" -> service.
     Filtrerade vyer behåller sin native H1, canonical och metadata; bara
     dedikerade sidor visar seriens kundnamn i sin H1 (t.ex. "M.S Vapes"
     -> "Magic Sauce Vapes", "THCA Vapes" -> "THCaB Vapes"). Inga antal,
     länkar eller texter hittas på: en destination visas först när dess
     riktiga sida svarat med minst en produkt.
     ====================================================================== */
  var SF_LOW = 3;           // 1-3 produkter = lågantalsläge (kontextpanel)
  /* R3: godkända seriebilder (assets/series-format-r3/) -- ren bildnyckel
     per verifierat serienamn. Serier utan post behåller produktbilden. */
  var SF_SERIES_ART = { "Magic Sauce": "magic-sauce", "THCaB": "thcab", "THCbA": "thcba", "Core": "core", "THCV": "thcv" };
  function sfTitle(ctx) { return ctx.series.name + " " + ctx.format.label; }
  function sfFormats(ctx) {
    return HZ8.catalog.build().formats.filter(function (f) { return !f.seriesless && ctx.series.routes[f.key]; });
  }
  function withFilterToken(href, token) {
    try {
      var u = new URL(href, location.origin);
      var f = u.searchParams.get("filters");
      u.searchParams.set("filters", f ? f + "~" + token : token);
      return u.pathname + u.search;
    } catch (e) { return href; }
  }
  /* Riktiga destinationer i ordning: [{key,label,href,current}] -- bara
     de som svarar med minst en produkt (0 = dold, okänd = visas). */
  function sfDestinations(ctx) {
    var list = sfFormats(ctx).map(function (f) {
      return { key: f.key, label: f.label, href: ctx.series.routes[f.key], current: f.key === ctx.format.key };
    });
    return Promise.all(list.map(function (d) {
      if (d.current) return d;
      return catalogCount(d.href).then(function (n) { d.count = n; return n === 0 ? null : d; });
    })).then(function (out) { return out.filter(Boolean); });
  }
  function sfLink(href, cls, html, current) {
    var a = node("a", cls, html);
    a.href = HZ8.link(href);
    if (current) a.setAttribute("aria-current", "page");
    return a;
  }

  /* ======================================================================
     Kategorihylla (2026-10-22): R3-filterhyllans beteende för alla
     kategorisidor utom Alla Vapes-piloten (egen hylla) -- serie x format-
     mallen och de breda formatsidorna. Allt är presentation/trigger ovanpå
     Nyehandels egen verktygsrad: "I lager" = native Lagerstatus, genvägar =
     native filtergrupper, mobilens "Filter & sortera" = native sortering
     och filterpanel. Noderna läggs in i .category-sort igen om Vue ritar om.
     ====================================================================== */
  function buildShelf() {
    var html = document.documentElement;
    html.classList.add("hz8-catshelf");
    /* -- Verktygsrad: "I lager" som växel (native Lagerstatus). -- */
    var stockSw = node("button", "hz8-sf-stock");
    stockSw.type = "button";
    stockSw.setAttribute("role", "switch");
    stockSw.setAttribute("aria-checked", "false");
    stockSw.innerHTML = 'I lager <span class="hz8-pswitch__track" aria-hidden="true"></span>';
    stockSw.hidden = true;
    stockSw.addEventListener("click", function () { var o = stockOption(); if (o) toggleNative(STOCK_GROUP, o.label); });

    /* -- Mobil: en samlad "Filter & sortera" (presentation/trigger
          ovanpå Nyehandels riktiga sortering och filterpanel). -- */
    var fsWrap = node("div", "hz8-sf-fs");
    fsWrap.innerHTML = '<button type="button" class="hz8-sf-fs__btn" aria-haspopup="dialog">' + SLIDERS + '<span>Filter &amp; sortera</span><span class="hz8-sf-fs__n" aria-hidden="true" hidden></span>' + CHEV + '</button>' +
      '<div class="hz8-sf-fs__panel" id="hz8-sf-fs-panel" role="dialog" aria-label="Filter och sortering">' +
        '<button type="button" class="hz8-sf-fs__stock" role="switch" aria-checked="false" hidden><span>I lager</span><span class="hz8-pswitch__track" aria-hidden="true"></span></button>' +
        '<p class="hz8-sf-fs__h">Sortera</p><div class="hz8-sf-fs__sorts"></div>' +
        '<button type="button" class="hz8-sf-fs__all" hidden>' + SLIDERS + '<span>Alla filter</span></button></div>';
    var fsBtn = fsWrap.querySelector(".hz8-sf-fs__btn"), fsPanel = fsWrap.querySelector(".hz8-sf-fs__panel");
    var fsPop = popover(fsBtn, fsPanel);
    function nativeFilterBtn() { return document.querySelector(".category-sort .product-filter-button"); }
    function renderFs() {
      var cur = currentSort();
      var box = fsPanel.querySelector(".hz8-sf-fs__sorts");
      var sig = sortOptions().map(function (o) { return o.native; }).join("|") + "#" + cur;
      if (box.getAttribute("data-sig") !== sig) {
        box.setAttribute("data-sig", sig);
        box.innerHTML = sortOptions().map(function (o) {
          return '<button type="button" class="hz8-psort hz8-sf-fs__sort" data-native="' + HZ8.esc(o.native) + '"' + (o.native === cur ? ' aria-current="true"' : "") + '>' + HZ8.esc(o.label) + "</button>";
        }).join("");
      }
      var so = stockOption(), st = fsPanel.querySelector(".hz8-sf-fs__stock");
      st.hidden = !so;
      st.setAttribute("aria-checked", String(!!(so && so.checked)));
      /* "Alla filter" bara om panelen har något utöver serie och lager. */
      var rest = nativeGroups().filter(function (g) { return g.options.length && !filterGroupHidden(g.name, g.options.length) && g.name !== STOCK_GROUP; });
      fsPanel.querySelector(".hz8-sf-fs__all").hidden = !(rest.length && nativeFilterBtn());
      var n = nativeChips().length, badge = fsBtn.querySelector(".hz8-sf-fs__n");
      badge.hidden = !n;
      if (badge.textContent !== (n ? String(n) : "")) badge.textContent = n ? String(n) : "";
      fsBtn.setAttribute("aria-label", n ? "Filter och sortering, " + n + (n === 1 ? " aktivt filter" : " aktiva filter") : "Filter och sortering");
    }
    fsPanel.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      if (b.classList.contains("hz8-sf-fs__stock")) { var o = stockOption(); if (o) toggleNative(STOCK_GROUP, o.label); }
      else if (b.classList.contains("hz8-sf-fs__all")) { fsPop.close(false); var nb = nativeFilterBtn(); if (nb) nb.click(); }
      else if (b.classList.contains("hz8-sf-fs__sort")) {
        var opt = sortOptions().filter(function (x) { return x.native === b.getAttribute("data-native"); })[0];
        fsPop.close(true);
        if (opt) opt.el.click();
      }
    });


    function sync() {
      var sort = document.querySelector(".category-sort");
      if (!sort) return;
      if (stockSw.parentNode !== sort) sort.appendChild(stockSw);
      var shortcuts = sort.parentNode.querySelector(".hz8-filter-shortcuts");
      if (shortcuts && shortcuts.parentNode !== sort) sort.appendChild(shortcuts);
      html.classList.toggle("hz8-sf-has-shortcuts", !!shortcuts);
      if (fsWrap.parentNode !== sort) sort.appendChild(fsWrap);
      renderFs();
      var so = stockOption();
      if (stockSw.hidden !== !so) stockSw.hidden = !so;
      stockSw.setAttribute("aria-checked", String(!!(so && so.checked)));
    }
    return { stockSw: stockSw, sync: sync };
  }

  function buildSeriesFormat(root, ctx, h1) {
    var html = document.documentElement;
    html.classList.add("hz8-sf");
    root.setAttribute("data-hz8-nav", "series-format");
    var series = ctx.series, format = ctx.format;
    var title = sfTitle(ctx);

    /* -- Intro: delad kusthero (samma assets som Alla Vapes), eyebrow,
          H1, ingress, antal. -- */
    var hero = node("div", "hz8-cat-hero hz8-sf-hero");
    hero.setAttribute("aria-hidden", "true");
    hero.innerHTML = '<div class="hz8-cat-hero__art"></div><div class="hz8-sf-hero__paper"></div>';
    root.insertBefore(hero, root.firstChild);
    var seal = node("div", "hz8-sf-seal");
    seal.setAttribute("aria-hidden", "true");
    var ring = (series.name + " · " + format.label + " · Hazey.se · ").toUpperCase();
    seal.innerHTML = '<svg viewBox="0 0 120 120" focusable="false"><defs><path id="hz8-sf-ring" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0"/></defs>' +
      '<circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" stroke-width=".8" opacity=".5"/>' +
      '<text font-size="9" letter-spacing="2.4" fill="currentColor"><textPath href="#hz8-sf-ring" startOffset="2%">' + HZ8.esc(ring) + '</textPath></text>' +
      '<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M46 80c4-20 14-36 30-44-2 18-12 34-30 44z"/><path d="M46 80l22-34M55 66l-6-4M61 57l-7-3M65 50l-6-1"/></g></svg>';
    root.appendChild(seal);
    var eyebrow = node("p", "hz8-sf-eyebrow");
    eyebrow.textContent = series.name + " · " + format.label;
    root.appendChild(eyebrow);
    if (!ctx.query && h1) h1.textContent = title;
    /* Ingress: kategorins egen beskrivning om den finns (längre än en
       rubrik), annars seriens godkända formatrad. Filtrerad vy: ärlig
       beskrivning av vyn. */
    var desc = root.querySelector("article.category-description");
    var real = desc && Array.prototype.find.call(desc.querySelectorAll(".readmore__content p, .nh-cat-lead, p"), function (p) {
      return p.textContent.trim().length > 30;
    });
    var lead = node("p", "hz8-cat-lead hz8-sf-lead");
    if (ctx.query) { lead.textContent = (h1 ? h1.textContent.trim() : format.label) + ", filtrerat på " + series.name + "."; lead.setAttribute("data-hz8-source", "filter"); }
    else if (real) { lead.textContent = real.textContent.trim().replace(/\s+/g, " "); lead.setAttribute("data-hz8-source", "category"); }
    else if (HZ8.formatSub && HZ8.formatSub(format.key, series.name)) { lead.textContent = HZ8.formatSub(format.key, series.name); lead.setAttribute("data-hz8-source", "series"); }
    else lead.hidden = true;
    root.appendChild(lead);
    var count = node("p", "hz8-sf-count");
    count.setAttribute("aria-live", "polite");
    root.appendChild(count);

    /* Brödsmulor: riktiga länkar; bara etiketten för seriens hubb och den
       aktuella sidan får kundnamnet. */
    function syncCrumbs() {
      document.querySelectorAll(".designer-breadcrumbs a").forEach(function (a) {
        var href = a.getAttribute("href") || "";
        var li = a.closest("li");
        if (series.hub && HZ8.catalog.routeMatches(series.hub, href) && a.textContent.trim() !== series.name) a.textContent = series.name;
        else if (!ctx.query && li && li.classList.contains("is-active") && a.textContent.trim() !== title) a.textContent = title;
      });
    }
    syncCrumbs();

    /* -- Kontextflikar: Alla <serie> + seriens format med riktig
          destination. -- */
    var tabs = node("nav", "hz8-sf-tabs");
    tabs.setAttribute("aria-label", series.name + " i olika format");
    var tlist = node("ul", "hz8-sf-tabs__list");
    tlist.setAttribute("role", "list");
    tabs.appendChild(tlist);
    root.appendChild(tabs);
    function tabItem(label, href, current) {
      var li = node("li");
      li.appendChild(sfLink(href, "hz8-sf-tab", HZ8.esc(label), current));
      return li;
    }
    if (series.hub) tlist.appendChild(tabItem("Alla " + series.name, series.hub, false));
    /* Direkt: alla kartans format (nuvarande markerad). Ett format vars
       sida svarar 0 produkter tas bort när svaret kommit. */
    var tabByKey = {};
    sfFormats(ctx).forEach(function (f) {
      var li = tabItem(f.label, ctx.series.routes[f.key], f.key === format.key);
      tabByKey[f.key] = li;
      tlist.appendChild(li);
    });
    var destinations = sfDestinations(ctx).then(function (list) {
      Object.keys(tabByKey).forEach(function (k) { if (!list.some(function (d) { return d.key === k; })) tabByKey[k].remove(); });
      return list;
    });

    /* -- Produktkort: samma komponent och data som Alla Vapes. -- */
    HZ8.cardLabels = {
      add: "Lägg till", addShort: "Lägg till", variants: "Välj", variantsShort: "Välj", variantsAria: "Välj alternativ",
      addIcon: '<svg class="hz8-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 8h12l-1 12H7z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/></svg>',
      variantsIcon: ""
    };
    if (HZ8.relabelCards) HZ8.relabelCards();
    /* Typchip ur produktens eget namn (Nyehandels underkategorier blandar
       ibland format, t.ex. m-s-vapes innehåller carten). Ingen seriechip:
       serien är redan vald. Lager ur samma route med Nyehandels
       lagerfilter (smart-filter_in-stock). */
    function sfTypes() {
      document.querySelectorAll("#category-products .product-card").forEach(function (card) {
        var path = cardHref(card), name = card.querySelector(".name");
        if (!path || pilotType[path]) return;
        var t = HZ8.cardTypeOf ? HZ8.cardTypeOf(name ? name.textContent : "") : "";
        if (t) pilotType[path] = t;
      });
    }
    var route = ctx.route || series.routes[format.key];
    allCards(withFilterToken(route, STOCK_TOKEN)).then(function (cards) {
      pilotStock = pilotStock || {};
      cards.forEach(function (c) { var p = cardPath(c.html); if (p) pilotStock[p] = true; });
      syncPilotCards();
    }).catch(function () { /* okänd lagerstatus: ingen rad */ });

    /* -- Verktygsrad: gemensam kategorihylla (buildShelf). -- */
    var shelf = buildShelf();
    var stockSw = shelf.stockSw;

    /* -- Lågantal: kontextpanel (desktop bredvid korten, mobil efter). -- */
    var more = node("aside", "hz8-sf-more");
    more.setAttribute("aria-labelledby", "hz8-sf-more-title");
    more.hidden = true;
    more.innerHTML = '<div class="hz8-sf-more__body"><p class="hz8-sf-more__eyebrow">' + HZ8.esc(series.name) + ' · upptäck mer</p><h2 class="hz8-sf-more__title" id="hz8-sf-more-title">Fler sätt att utforska ' + HZ8.esc(series.name) + '</h2>' +
      /* Generisk och sann för varje serie där panelen visas (minst ett
         annat format med produkter). */
      '<p class="hz8-sf-more__lead">Samma serie i fler format.</p><ul class="hz8-sf-more__list" role="list"></ul></div>' +
      '<span class="hz8-sf-more__art" aria-hidden="true"></span>';
    /* -- Efter sortimentet. -- */
    var after = node("div", "hz8-sf-after");
    after.innerHTML = '<section class="hz8-sf-cont" aria-labelledby="hz8-sf-cont-title" hidden><h2 class="hz8-sf-row__title" id="hz8-sf-cont-title">Fortsätt i serien</h2><ul class="hz8-sf-chips" role="list"></ul></section>' +
      '<section class="hz8-sf-others" aria-labelledby="hz8-sf-others-title" hidden><div class="hz8-sf-row__head"><h2 class="hz8-sf-row__title" id="hz8-sf-others-title">Andra serier i ' + HZ8.esc(format.label) + '</h2></div><ul class="hz8-sf-series" role="list"></ul></section>';
    /* "Visa alla" = formatets egen sida (alla serier i formatet) -- bara
       när den finns och inte är sidan själv. */
    if (format.href && !HZ8.catalog.routeMatches(format.href, location.href)) {
      var allLink = sfLink(format.href, "hz8-sf-row__all", "Visa alla " + HZ8.esc(format.label.toLowerCase()) + ARROW, false);
      after.querySelector(".hz8-sf-others .hz8-sf-row__head").appendChild(allLink);
    }
    root.appendChild(after);

    var cardsN = null, siblings = null;
    function layout() {
      var grid = document.getElementById("category-products");
      var n = grid ? grid.querySelectorAll(".product-card").length : 0;
      var native = nativeCount();
      /* Lågantalsläget avgörs av hela resultatet, inte bara sidan. */
      var total = native == null ? n : native;
      var low = total >= 1 && total <= SF_LOW && !!(siblings && siblings.length);
      html.setAttribute("data-hz8-sf-n", total >= 1 && total <= SF_LOW ? String(total) : total ? "many" : "0");
      html.classList.toggle("hz8-sf-low", low);
      if (grid && grid.parentNode && more.parentNode !== grid.parentNode) grid.parentNode.insertBefore(more, grid.nextSibling);
      if (more.hidden !== !low) more.hidden = !low;
      var cont = after.querySelector(".hz8-sf-cont");
      var showCont = !low && !!(siblings && siblings.length);
      if (cont.hidden !== !showCont) cont.hidden = !showCont;
      cardsN = total;
    }
    destinations.then(function (list) {
      siblings = list.filter(function (d) { return !d.current; });
      var ul = more.querySelector(".hz8-sf-more__list");
      ul.innerHTML = "";
      siblings.forEach(function (d) {
        var li = node("li");
        /* Mobil visar bara formatet (låg remsa); serienamnet finns kvar
           i länktexten för skärmläsare och på desktop. */
        li.appendChild(sfLink(d.href, "hz8-sf-more__link", '<span><span class="hz8-sf-more__s">' + HZ8.esc(series.name) + ' </span>' + HZ8.esc(d.label) + '</span>' + ARROW, false));
        ul.appendChild(li);
      });
      var chips = after.querySelector(".hz8-sf-cont .hz8-sf-chips");
      chips.innerHTML = "";
      if (series.hub) { var li0 = node("li"); li0.appendChild(sfLink(series.hub, "hz8-sf-chip", "Alla " + HZ8.esc(series.name), false)); chips.appendChild(li0); }
      siblings.forEach(function (d) { var li = node("li"); li.appendChild(sfLink(d.href, "hz8-sf-chip", HZ8.esc(d.label), false)); chips.appendChild(li); });
      layout();
    });

    /* Andra serier i samma format: kartans serier med route i formatet,
       utom aktuell och pausade (STATUS: juridik ej klar), med riktig bild
       och riktigt antal från respektive sida (0 = dold). */
    var others = HZ8.catalog.seriesWithFormat(format.key, series).filter(shown);
    if (others.length) {
      Promise.all(others.map(function (o) {
        var r = o.routes[format.key];
        return HZ8.fetchPage(r, HZ8.categoryInfo).then(function (info) { return { s: o, href: r, info: info }; }).catch(function () { return null; });
      })).then(function (rows) {
        rows = rows.filter(function (x) { return x && x.info && x.info.count > 0; });
        if (!rows.length) return;
        var ul = after.querySelector(".hz8-sf-series");
        rows.forEach(function (x) {
          var li = node("li");
          var a = sfLink(x.href, "hz8-sf-serie" + (SF_SERIES_ART[x.s.name] ? " has-art" : ""), '<span class="hz8-sf-serie__media" aria-hidden="true"></span><span class="hz8-sf-serie__text"><span class="hz8-sf-serie__name">' + HZ8.esc(x.s.name + " " + format.label) + '</span><span class="hz8-sf-serie__count">' + HZ8.esc(plural(x.info.count)) + "</span></span>" + ARROW, false);
          if (SF_SERIES_ART[x.s.name]) a.setAttribute("data-hz8-series-art", SF_SERIES_ART[x.s.name]);
          else if (x.info.image) {
            var img = document.createElement("img");
            img.src = x.info.image; img.alt = ""; img.loading = "lazy"; img.decoding = "async"; img.width = 120; img.height = 120;
            a.querySelector(".hz8-sf-serie__media").appendChild(img);
          }
          li.appendChild(a);
          ul.appendChild(li);
        });
        after.querySelector(".hz8-sf-others").hidden = false;
        /* Tangentbord: fokuserat kort scrollas in i railen (bara railen,
           aldrig dokumentet i sidled). */
        ul.addEventListener("focusin", function (e) {
          var a = e.target.closest("a");
          if (!a) return;
          var lr = ul.getBoundingClientRect(), ar = a.getBoundingClientRect();
          var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          if (ar.left < lr.left || ar.right > lr.right) ul.scrollTo({ left: ul.scrollLeft + (ar.left < lr.left ? ar.left - lr.left - 2 : ar.right - lr.right + 2), behavior: reduce ? "auto" : "smooth" });
        });
      });
    }

    /* -- Desktop: flikar och verktygsrad i EN glashylla när båda ryms på
          en rad (mäts på riktiga bredder; annars två rader i samma
          material). -- */
    var deskMQ = window.matchMedia("(min-width: 1280px)");
    var stackTimer = 0;
    function syncShelf() {
      var sort = document.querySelector(".category-sort");
      var list = tabs.querySelector(".hz8-sf-tabs__list");
      if (!sort || !deskMQ.matches) { html.classList.remove("hz8-sf-stack"); return; }
      /* Bara synliga kontroller räknas (Nyehandels tomma filterbehållare
         är breda flexlådor utan innehåll). */
      var ctrl = 0;
      var parts = [document.getElementById("products_count"), stockSw, sort.querySelector(".hz8-filter-shortcuts"), sort.querySelector(":scope > div:has(.sort-control)"), sort.querySelector(".product-filter-button")]
        .concat(Array.prototype.slice.call(sort.querySelectorAll(".selected-filters.is-hidden-touch .selected-filters-item:not(.hz8-filter-hidden)")));
      parts.forEach(function (el) {
        if (!el || !el.getClientRects().length) return;
        ctrl += el.getBoundingClientRect().width + 12;
      });
      var lis = list.children;
      var used = lis.length ? lis[lis.length - 1].getBoundingClientRect().right - lis[0].getBoundingClientRect().left : 0;
      var fits = used + ctrl + 72 <= tabs.clientWidth;
      /* Tillbaka till en rad direkt; till två rader först när två
         mätningar med 400 ms mellanrum är överens (inget falskt skift
         medan verktygsraden fortfarande byggs). */
      if (fits) { window.clearTimeout(stackTimer); stackTimer = 0; html.classList.remove("hz8-sf-stack"); return; }
      if (html.classList.contains("hz8-sf-stack") || stackTimer) return;
      stackTimer = window.setTimeout(function () { stackTimer = 0; if (!measureFits()) html.classList.add("hz8-sf-stack"); }, 400);
    }
    function measureFits() {
      var sort = document.querySelector(".category-sort");
      var list = tabs.querySelector(".hz8-sf-tabs__list");
      if (!sort || !deskMQ.matches) return true;
      var ctrl = 0;
      var parts = [document.getElementById("products_count"), stockSw, sort.querySelector(".hz8-filter-shortcuts"), sort.querySelector(":scope > div:has(.sort-control)"), sort.querySelector(".product-filter-button")]
        .concat(Array.prototype.slice.call(sort.querySelectorAll(".selected-filters.is-hidden-touch .selected-filters-item:not(.hz8-filter-hidden)")));
      parts.forEach(function (el) { if (el && el.getClientRects().length) ctrl += el.getBoundingClientRect().width + 12; });
      var lis = list.children;
      var used = lis.length ? lis[lis.length - 1].getBoundingClientRect().right - lis[0].getBoundingClientRect().left : 0;
      return used + ctrl + 72 <= tabs.clientWidth;
    }
    window.addEventListener("resize", function () { window.requestAnimationFrame(syncShelf); }, { passive: true });

    function syncSf() {
      syncCrumbs();
      var n = nativeCount();
      var t = n == null ? "" : plural(n);
      if (count.textContent !== t) count.textContent = t;
      /* Verktygsraden: antal | I lager | återstående filtergenvägar |
         sortering -- i Nyehandels egen rad (noderna läggs in igen om Vue
         ritar om raden). */
      shelf.sync();
      syncShelf();
      sfTypes();
      syncPilotCards();
      layout();
    }
    HZ8.watch(syncSf);
    syncSf();
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

    /* Pilotens egna filterparametrar (?typ=, ?volym=) är URL-state, inte
       en annan sida -- räknas bort när sidans kontext bestäms. */
    var ctxHref = location.href;
    try { var cu = new URL(location.href); cu.searchParams.delete("typ"); cu.searchParams.delete("volym"); cu.searchParams.delete(SEARCH_PARAM); ctxHref = cu.href; } catch (e) { /* oförändrad */ }
    var ctx = HZ8.catalog ? HZ8.catalog.contextFor(ctxHref) : null;
    /* Filtrerad vy (t.ex. /hasch?filters=Serie_Magic Sauce) är den breda
       kategorin med ett aktivt filter -- aldrig en serie x format-landning.
       Kontexten blir formatsidans; filtret syns som chip (2026-10-22). */
    if (ctx && ctx.type === "combo" && ctx.query) {
      try {
        var base = new URL(ctxHref);
        ["filters", "sort", "page"].forEach(function (k) { base.searchParams.delete(k); });
        ctx = HZ8.catalog.contextFor(base.href);
      } catch (e) { ctx = null; }
    }
    /* Alla Vapes-piloten väljer serier med ?serie= (flervalet). Ett native
       Serie-filter i URL:en (äldre länkar, t.ex. ?filters=Serie_Core)
       översätts en gång till samma val, så att resultatet och chippen
       kommer från samma motor. Övriga filter behålls. */
    if (isPilot(ctx) && /[?&]filters=[^&]*Serie_/.test(location.search)) {
      try {
        var u = new URL(location.href);
        var toks = (u.searchParams.get("filters") || "").split("~").filter(Boolean);
        var picked = [];
        var rest = toks.filter(function (t) {
          if (!/^Serie_/.test(t)) return true;
          var name = t.slice(6);
          var hit = HZ8.catalog.build().series.filter(function (x) { return x.attr === name || x.name === name; })[0];
          if (hit) { picked.push(HZ8.catalog.seriesSlug(hit)); return false; }
          return true;
        });
        if (picked.length) {
          if (rest.length) u.searchParams.set("filters", rest.join("~")); else u.searchParams.delete("filters");
          var prev = (u.searchParams.get(HZ8.catalog.seriesParam) || "").split(",").filter(Boolean);
          u.searchParams.set(HZ8.catalog.seriesParam, prev.concat(picked).filter(function (v, i, a) { return a.indexOf(v) === i; }).join(","));
          location.replace(u.pathname + u.search + u.hash);
          return;
        }
      } catch (e) { /* oförändrad */ }
    }
    var sfMode = !!(ctx && ctx.type === "combo" && ctx.series && ctx.format && !ctx.query);
    if (!sfMode) buildHero(h1, root);
    if (ctx && ctx.type === "all") document.documentElement.classList.add("hz8-cat-portal");
    var picker = null;
    if (sfMode) {
      buildSeriesFormat(root, ctx, h1);
    } else if (isPilot(ctx)) {
      root.setAttribute("data-hz8-nav", "pilot");
      /* Alla produkter renderas med Nyehandels .category-content (övriga
         kategorier: .designer-category). Samma roll -- samma klass, så att
         skalets regler och unionsgridet gäller oförändrade. */
      var portalGrid = isPortal(ctx) && root.querySelector(".category-content:not(.designer-category)");
      if (portalGrid) portalGrid.classList.add("designer-category");
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
    /* Portalen (Hybrid C) slutar med formatvägar, kategoritext och footer
       -- inget kundserviceband. */
    if (!isPortal(ctx)) buildGuide(root, h1Text);
    if (ctx && ctx.type === "series-hub" && HZ8.seriesHub) HZ8.seriesHub(root, ctx, h1Text);
    else if (!isPilot(ctx) && !sfMode) buildPopular(root, h1Text);

    /* Nyehandel byter filter-URL med pushState men ritar inte om vid
       bakåt/framåt -- då laddas sidan om så att resultat och URL alltid
       stämmer. Hash-ändringar (seriehubbens hopp) påverkas inte. */
    /* ?serie= (flervalet) ritas om på plats utan omladdning. */
    function nativeSearch() {
      var href = HZ8.catalog ? HZ8.catalog.withoutSeriesState(location.href) : location.href;
      try { var u = new URL(href, location.origin); u.searchParams.delete("typ"); u.searchParams.delete("volym"); u.searchParams.delete(SEARCH_PARAM); href = u.pathname + u.search; } catch (e) { /* oförändrad */ }
      return href.replace(/^[^?]*/, "");
    }
    var lastSearch = nativeSearch();
    window.addEventListener("popstate", function () {
      if (nativeSearch() !== lastSearch) location.reload();
      else if (picker) { picker.sync(); if (window.HZ8.pilotSync) window.HZ8.pilotSync(); }
    });
    HZ8.watch(function () { lastSearch = nativeSearch(); });

    /* Seriehubbar har egen, godkänd design -- ingen kategorihylla där. */
    var genericShelf = !sfMode && !isPilot(ctx) && !(ctx && ctx.type === "series-hub") ? buildShelf() : null;
    var seo = buildSeoText(root);
    var actions = root.querySelector("[data-hz8-cat='actions']");
    HZ8.watch(function () {
      if (genericShelf) genericShelf.sync();
      if (seo) seo.sync();
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
