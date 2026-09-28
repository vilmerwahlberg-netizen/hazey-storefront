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

    /* -- Format -- */
    var fnav = navSection("Format", "format");
    var flist = fnav.querySelector(".hz8-rail__list");
    if (ctx.series) {
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
      map.formats.forEach(function (f) { flist.appendChild(railItem({ label: f.label, href: f.href }, current, "format")); });
    }
    wrap.appendChild(fnav);

    /* -- Serier -- */
    var snav = navSection("Serier", "series");
    var slist = snav.querySelector(".hz8-rail__list");
    var formatKey = ctx.format && ctx.format.key;
    if (ctx.type === "format" || ctx.type === "combo") {
      if (ctx.type === "combo" && ctx.format) slist.appendChild(railItem({ label: "Alla serier", href: ctx.format.href }, current, "series"));
      HZ8.catalog.seriesWithFormat(formatKey).forEach(function (s) {
        var it = railItem({ label: s.name, href: s.routes[formatKey] }, current, "series");
        if (ctx.series === s) it.setAttribute("aria-current", "page");
        slist.appendChild(it);
      });
    } else {
      map.series.forEach(function (s) {
        var landing = HZ8.catalog.landingFor(s);
        if (!landing) return;
        var it = railItem({ label: s.name, href: landing }, current, "series");
        if (ctx.series === s) it.setAttribute("aria-current", "page");
        slist.appendChild(it);
      });
    }
    if (slist.children.length > 1) wrap.appendChild(snav);
    return wrap;
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

  function syncCount(actions) {
    var counter = document.getElementById("products_count");
    var match = counter && counter.textContent.match(/(\d+)/);
    var btn = actions && actions.querySelector("a");
    if (btn) btn.textContent = match ? "Visa " + match[1] + " produkter" : "Visa produkterna";
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
    ).filter(function (g) { return g.name && g.options > 0; });
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

  /* ---- Tomt resultat ---- */
  function syncEmpty() {
    var grid = document.getElementById("category-products");
    var host = grid && grid.parentNode;
    if (!host) return;
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
    about.innerHTML = '<span class="hz8-kicker">Om kategorin</span><p class="hz8-cat-about-title">' + HZ8.esc(h1Text) + "</p>";
    root.appendChild(about);
  }

  HZ8.register("category", function (context) {
    if (context.page !== "category") return;
    var root = document.getElementById("skip-to-main-content");
    var h1 = root && root.querySelector("article.category-description h1");
    if (!root || !h1 || root.querySelector(".hz8-cat-hero")) return;
    var h1Text = h1.textContent.trim();
    /* Kategoritexten i katalogen innehåller ibland en egen <h1> --
       exponeras som nivå 2 för hjälpmedel så sidan har ett enda H1.
       Texten och elementet lämnas orörda. */
    root.querySelectorAll("article.category-description .readmore__content h1").forEach(function (extra) {
      extra.setAttribute("role", "heading");
      extra.setAttribute("aria-level", "2");
    });

    buildHero(h1, root);
    var ctx = HZ8.catalog ? HZ8.catalog.contextFor(location.href) : null;
    if (ctx) {
      root.appendChild(buildCatalogNav(ctx));
      root.setAttribute("data-hz8-nav", ctx.type);
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
    else buildPopular(root, h1Text);
    if (ctx && ctx.type === "combo" && HZ8.comboRelated) HZ8.comboRelated(root, ctx);

    var actions = root.querySelector("[data-hz8-cat='actions']");
    HZ8.watch(function () {
      syncCount(actions);
      syncDock();
      syncSidebar();
      syncEmpty();
    });
  });
})();
