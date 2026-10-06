/* Butik (/sv/page/butik) -- navigerande katalogportal.
   Facit: preview/design-targets/butik-portal-final (form, aldrig data).

   Butik = navigering (format, populärt, serier, några hyllor, kampanj,
   hjälp). Alla produkter (/sv/categories/alla-produkter) förblir den
   fulla filtrerbara listan.

   Data (inget hårdkodat):
   - format och serier: HZ8.catalog (headerns verifierade kategorikarta),
     antal och bild: HZ8.categoryInfo / categoryCards på respektive route,
   - Populärt just nu: den kuraterade sidan /sv/page/vara-bastsaljare --
     dess aktiva urval (data-cat) och källa, Nyehandels "Mest populära",
   - kampanj: produkter med verkligt jämförelsepris (samma regel som
     /sv/page/kampanjer), annars ingen sektion,
   - trust: HZ8.commerce.deliveryLines() (lanseringsspärren gäller).

   Admininnehållet (gamla nh-cat-grid/nh-cat-dir från WooCommerce-eran,
   som den äldre bundlen också skriver i) ligger kvar i DOM:en men döljs
   när portalen är monterad; 88-pages.js lämnar sidan. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  if (!HZ8) return;
  var esc = function (v) { return HZ8.esc(v); };
  var link = function (h) { return HZ8.link(h); };
  var locale = function () { return (window.config && window.config.locale) || "sv"; };
  var ROUTE = /^\/[a-z]{2}\/page\/butik\/?$/;
  var MAX_SALE_PAGES = 6;

  function isShop() { return ROUTE.test(location.pathname); }
  HZ8.isShopPage = isShop;

  function withSort(href) { return href + (href.indexOf("?") === -1 ? "?" : "&") + "sort=popular"; }
  /* Representativ bild: första produkten med bild, men inte THC-A
     (narkotikaklassad 14 juli 2026) och ingen bild som redan används. */
  var usedImages = {};
  function firstImage(cards) {
    var pick = null;
    (cards || []).some(function (c) {
      var m = c.html.match(/<img[^>]+src="([^"]+)"[^>]*>/) || c.html.match(/<img[^>]+src="([^"]+)"/);
      var alt = (c.html.match(/alt="([^"]*)"/) || [])[1] || "";
      if (!m || usedImages[m[1]] || /\bTHC-?A\b/i.test(alt)) return false;
      pick = m[1]; return true;
    });
    if (pick) usedImages[pick] = true;
    return pick;
  }
  function arrow() { return HZ8.icon("arrow"); }

  /* ---------- Markup ---------- */
  function sectionHead(id, title, href, label) {
    return '<div class="hz8-shop__head"><h2 id="' + id + '">' + esc(title) + "</h2>" +
      (href ? '<a class="hz8-shop__all" href="' + esc(link(href)) + '">' + esc(label) + arrow() + "</a>" : "") + "</div>";
  }

  function build(map) {
    var formats = map.formats.slice();
    var root = document.createElement("div");
    root.className = "hz8-shop";
    root.innerHTML =
      '<section class="hz8-shop__mast">' +
        '<div class="hz8-shop__mast-inner">' +
          '<div class="hz8-shop__mast-copy">' +
            '<nav class="hz8-shop__crumbs" aria-label="Brödsmulor"><ol><li><a href="' + esc(link("/" + locale())) + '">Hem</a></li><li><span aria-current="page">Butik</span></li></ol></nav>' +
            "<h1>Hitta rätt i sortimentet</h1>" +
            '<p class="hz8-shop__lead">Utforska format, serier och våra mest populära produkter.</p>' +
          "</div>" +
          '<form class="hz8-shop__search" role="search" action="/' + locale() + '/search" method="get">' +
            '<label class="hz8-visually-hidden" for="hz8-shop-q">Sök i sortimentet</label>' + HZ8.icon("search") +
            '<input id="hz8-shop-q" name="query" type="search" inputmode="search" enterkeyhint="search" autocomplete="off" placeholder="Sök i sortimentet">' +
            '<button type="submit" class="hz8-visually-hidden">Sök</button>' +
          "</form>" +
        "</div>" +
      "</section>" +
      '<div class="hz8-shop__body">' +
        '<section class="hz8-shop__sec hz8-shop__formats" aria-labelledby="hz8-shop-f">' +
          sectionHead("hz8-shop-f", "Shoppa efter format", map.all && map.all.href, "Alla produkter") +
          '<ul class="hz8-shop__ftiles" role="list">' +
            formats.map(function (f) {
              return '<li class="hz8-shop__ftile" data-src="' + esc(f.href) + '"><a href="' + esc(link(f.href)) + '"><span class="hz8-shop__fimg" aria-hidden="true"></span>' +
                '<span class="hz8-shop__flabel">' + esc(f.short || f.label) + '</span><span class="hz8-shop__fcount"></span></a></li>';
            }).join("") +
            (map.all ? '<li class="hz8-shop__ftile hz8-shop__ftile--all" data-src="' + esc(map.all.href) + '"><a href="' + esc(link(map.all.href)) + '"><span class="hz8-shop__fall-ic" aria-hidden="true">' + HZ8.icon("arrow") + "</span>" +
              '<span class="hz8-shop__flabel">' + esc(map.all.label) + '</span><span class="hz8-shop__fcount"></span></a></li>' : "") +
          "</ul>" +
          '<div class="hz8-shop__track" aria-hidden="true"><span></span></div>' +
        "</section>" +
        '<div class="hz8-shop__slot" data-slot="popular"></div>' +
        '<section class="hz8-shop__sec hz8-shop__series" aria-labelledby="hz8-shop-s" hidden>' +
          sectionHead("hz8-shop-s", "Utforska serier", null) +
          '<ul class="hz8-shop__stiles" role="list"></ul>' +
        "</section>" +
        '<div class="hz8-shop__slot" data-slot="shelves"></div>' +
        '<div class="hz8-shop__slot" data-slot="sale"></div>' +
        '<section class="hz8-shop__sec hz8-shop__help" aria-labelledby="hz8-shop-h">' +
          '<div class="hz8-shop__help-copy"><h2 id="hz8-shop-h">Behöver du hjälp att välja?</h2>' +
          "<p>Svaren på vanliga frågor finns samlade, och kundservice hjälper dig gärna.</p>" +
          '<ul class="hz8-shop__trust" role="list"></ul></div>' +
          '<ul class="hz8-shop__help-links" role="list">' +
            [["Vanliga frågor", "/sv/page/faq", "chat"], ["Kontakta oss", "/sv/page/kontakt", "chat"], ["Köp- och leveransvillkor", "/sv/page/kop-och-leveransvillkor", "doc"]].map(function (x) {
              return '<li><a href="' + esc(link(x[1])) + '"><span>' + esc(x[0]) + "</span>" + arrow() + "</a></li>";
            }).join("") +
          "</ul>" +
        "</section>" +
      "</div>";
    return root;
  }

  /* ---------- Formatplattor: antal + representativ produktbild ---------- */
  function fillFormats(root) {
    var tiles = Array.prototype.slice.call(root.querySelectorAll(".hz8-shop__ftile"));
    tiles.forEach(function (li) {
      var src = li.getAttribute("data-src");
      var all = li.classList.contains("hz8-shop__ftile--all");
      HZ8.fetchPage(src, HZ8.categoryInfo).then(function (info) {
        if (info && info.count === 0 && !all) { li.remove(); return; }
        if (info && info.count != null) li.querySelector(".hz8-shop__fcount").textContent = HZ8.countLabel(info.count);
      }).catch(function () {});
      if (all) return;
      /* Bild: första produktbilden under Nyehandels "Mest populära". */
      HZ8.fetchPage(withSort(src), HZ8.categoryCards).then(function (cards) {
        var url = firstImage(cards);
        var img = li.querySelector(".hz8-shop__fimg");
        if (url) { img.style.backgroundImage = 'url("' + url.replace(/"/g, "%22") + '")'; li.classList.add("has-img"); }
        else li.classList.add("is-plain");
      }).catch(function () { li.classList.add("is-plain"); });
    });
    /* Mobil: diskret scrollindikator för den svepbara raden. */
    var list = root.querySelector(".hz8-shop__ftiles");
    var bar = root.querySelector(".hz8-shop__track span");
    function sync() {
      var max = list.scrollWidth - list.clientWidth;
      root.querySelector(".hz8-shop__track").hidden = max < 4;
      if (max < 4) return;
      var vis = list.clientWidth / list.scrollWidth;
      bar.style.width = (vis * 100).toFixed(1) + "%";
      bar.style.transform = "translateX(" + ((list.scrollLeft / list.scrollWidth) * list.clientWidth / (vis * list.clientWidth) * 100).toFixed(1) + "%)";
    }
    list.addEventListener("scroll", function () { window.requestAnimationFrame(sync); }, { passive: true });
    window.addEventListener("resize", sync);
    window.requestAnimationFrame(sync);
  }

  /* ---------- Populärt just nu: bästsäljarsidans aktiva urval ---------- */
  var bestsellerSource = HZ8.bestsellerSource;
  function popular(root, map) {
    var slot = root.querySelector('[data-slot="popular"]');
    HZ8.fetchPage("/sv/page/vara-bastsaljare", bestsellerSource).then(function (bs) {
      var src = bs.cat ? "/" + locale() + "/categories/" + bs.cat : bs.source;
      if (!src) throw new Error("no source");
      slot.replaceWith(HZ8.productRail({
        id: "hz8-shop-popular", className: "hz8-prail--compact hz8-shop__rail hz8-shop__rail--lead", title: "Populärt just nu",
        href: link("/sv/page/vara-bastsaljare"), allLabel: "Visa alla", hideCount: true, eager: true, limit: 12,
        source: bs.fixed ? src : withSort(src)
      }));
    }).catch(function () { slot.remove(); });
  }

  /* ---------- Serier: bara med egen hubb och verkliga produkter ---------- */
  function series(root, map) {
    var sec = root.querySelector(".hz8-shop__series");
    var list = sec.querySelector(".hz8-shop__stiles");
    var withHub = map.series.filter(function (s) { return s.hub; });
    if (!withHub.length) return;
    list.innerHTML = withHub.map(function (s, i) {
      var fm = Object.keys(s.routes).map(function (k) { var f = HZ8.catalog.formatByKey(k); return f ? (f.short || f.label) : null; }).filter(Boolean);
      return '<li class="hz8-shop__stile" data-i="' + i + '"><a href="' + esc(link(s.hub)) + '"><span class="hz8-shop__simg" aria-hidden="true"></span>' +
        '<span class="hz8-shop__stext"><span class="hz8-shop__sname">' + esc(s.name) + "</span>" +
        (fm.length ? '<span class="hz8-shop__sformats">' + esc(fm.join(" · ")) + "</span>" : "") +
        '<span class="hz8-shop__scount"></span></span>' + arrow() + "</a></li>";
    }).join("");
    sec.hidden = false;
    withHub.forEach(function (s, i) {
      var li = list.querySelector('[data-i="' + i + '"]');
      HZ8.fetchPage(s.hub, HZ8.categoryInfo).then(function (info) {
        if (info && info.count === 0) { li.remove(); return; }
        if (info && info.count != null) li.querySelector(".hz8-shop__scount").textContent = HZ8.countLabel(info.count);
        if (!list.children.length) sec.hidden = true;
      }).catch(function () {});
      HZ8.fetchPage(withSort(s.hub), HZ8.categoryCards).then(function (cards) {
        var url = firstImage(cards);
        if (url) { li.querySelector(".hz8-shop__simg").style.backgroundImage = 'url("' + url.replace(/"/g, "%22") + '")'; li.classList.add("has-img"); }
        else li.classList.add("is-plain");
      }).catch(function () { li.classList.add("is-plain"); });
    });
  }

  /* ---------- Hyllor: högst tre format, riktiga kategorier ---------- */
  function shelves(root, map) {
    var slot = root.querySelector('[data-slot="shelves"]');
    var pick = ["vapes", "buds", "hasch"].map(HZ8.catalog.formatByKey).filter(Boolean);
    var frag = document.createDocumentFragment();
    pick.forEach(function (f) {
      frag.appendChild(HZ8.productRail({
        id: "hz8-shop-" + f.key, className: "hz8-prail--compact hz8-shop__rail", title: "Populära " + (f.short || f.label).toLowerCase(),
        href: link(f.href), allLabel: "Visa alla", hideCount: true, limit: 10, source: withSort(f.href)
      }));
    });
    slot.replaceWith(frag);
  }

  /* ---------- Kampanj: bara verkliga jämförelsepriser ---------- */
  function sale(root, map) {
    var slot = root.querySelector('[data-slot="sale"]');
    var all = map.all && map.all.href;
    if (!all) { slot.remove(); return; }
    var got = [], page = 1;
    function next() {
      var href = all + (all.indexOf("?") === -1 ? "?" : "&") + "page=" + page;
      return HZ8.fetchPage(href, HZ8.categoryCards).then(function (cards) {
        got = got.concat(cards.filter(function (c) { return c.sale; }));
        if (!cards.length || got.length >= 8 || page >= MAX_SALE_PAGES || cards.length < 25) return got;
        page += 1;
        return next();
      });
    }
    next().then(function (cards) {
      if (!cards.length) { slot.remove(); return; }
      slot.replaceWith(HZ8.productRail({
        id: "hz8-shop-sale", className: "hz8-prail--compact hz8-shop__rail", title: "Sänkta priser just nu",
        href: link("/sv/page/kampanjer"), allLabel: "Alla kampanjer", hideCount: true, cards: cards.slice(0, 8)
      }));
    }).catch(function () { slot.remove(); });
  }

  function trust(root) {
    var ul = root.querySelector(".hz8-shop__trust");
    var lines = HZ8.commerce ? HZ8.commerce.deliveryLines() : [];
    if (!lines.length) { ul.remove(); return; }
    ul.innerHTML = lines.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("");
  }

  function mount() {
    var main = document.getElementById("store-main");
    if (!main || main.querySelector(".hz8-shop")) return;
    var map = HZ8.catalog && HZ8.catalog.build();
    if (!map || !map.formats.length) return;
    var root = build(map);
    main.insertBefore(root, main.firstChild);
    document.documentElement.classList.add("hz8-shop-page");
    var form = root.querySelector(".hz8-shop__search");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var inp = form.querySelector("input"), q = inp.value.trim();
      if (!q) { inp.value = ""; inp.focus(); return; }
      location.href = link("/" + locale() + "/search?query=" + encodeURIComponent(q));
    });
    fillFormats(root);
    popular(root, map);
    series(root, map);
    shelves(root, map);
    sale(root, map);
    trust(root);
  }

  HZ8.register("shop-portal", function (context) {
    if (context.page !== "page" || !isShop()) return;
    mount();
  });
})();
