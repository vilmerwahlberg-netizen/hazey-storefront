/* Landningsmall (.hz8-lp) för informations- och shoppinglandningar som
   ligger som Content -> Sidor i Nyehandel, t.ex. /sv/page/thcx (koncept B,
   "produktnära magasin", visuell ombyggnad 2026-11-14). Blocket i admin
   (theme8/blocks/thcx.html) äger ALL text, alla rubriker och länkar -- de
   finns i initial HTML. Modulen lägger bara till det som kräver riktig data:

   1. Redaktionella produktvägar (.hz8-lp__path[data-hz8-match]): varje väg
      anger en eller flera riktiga produktsökvägar. Ur samma lagerfiltrerade
      källor som sortimentsledet väljs den första som finns i lager; dess
      EGEN frilagda Nyehandel-bild ställs på stenstagen och dess pris och
      namn visas. Ingen i lager -> vägen döljs. Bilden hämtas i större
      upplösning ur Nyehandels egen bildtjänst (samma original).
   2. Sortimentsledet ([data-hz8-lp-products]): källor (data-hz8-sources,
      kategori-routes) och tak (data-hz8-limit). Nyehandels egna
      .product-card via HZ8.productRail; samma produkt en gång, varianter
      som egna kort. data-hz8-instock="only": bara det som finns i lager.
      Inga produkter -> blockets reservlänk står kvar. Aldrig fritextsökning.

   Samma mall är tänkt för nästa landning (/engangsvape/): nytt adminblock
   med andra källor, vägar och text, ingen ny kod. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  if (!HZ8) return;

  function productKey(html) {
    var m = html.match(/href="([^"]*\/products\/[^"?#]+)/);
    return m ? HZ8.path(m[1]).replace(/\/\d+$/, "") : html;
  }

  var STOCK_FILTER = "filters=smart-filter_in-stock"; // Nyehandels I lager-filter (samma som 81-series-hub.js)
  function withParam(href, kv) { return href + (href.indexOf("?") === -1 ? "?" : "&") + kv; }

  function mergedCards(sources, inStockOnly) {
    return Promise.all(sources.map(function (src) {
      return HZ8.fetchPage(inStockOnly ? withParam(src, STOCK_FILTER) : src, HZ8.categoryCards).catch(function () { return []; });
    })).then(function (lists) {
      var seen = {};
      return [].concat.apply([], lists).filter(function (c) {
        var k = productKey(c.html);
        if (seen[k]) return false;
        seen[k] = true;
        return true;
      });
    });
  }

  /* data-hz8-strain-only: variantkortets titel visar bara strainnamnet.
     Katalogens variantnamn bär "– Indica"/"– Sativa"/"– Hybrid", vilket
     Hazeys riktlinje räknar som effektpåstående (Agent A, F5b). Bara
     visningen på landningen ändras -- Nyehandels data är orörd. */
  var STRAIN_SUFFIX = /\s*[-–—·]\s*(indica|sativa|hybrid)\b.*$/i;
  function strainOnly(html) {
    var box = document.createElement("div");
    box.innerHTML = html;
    /* Katalognamn med dubbelkodade entiteter ("Apples &amp; Bananas")
       visas avkodade på alla kort. */
    box.querySelectorAll(".product-card .name").forEach(function (n) { if (/&[a-z#0-9]+;/i.test(n.textContent)) n.textContent = decode(n.textContent); });
    var name = box.querySelector(".product-card[data-hz8-variant] .name");
    if (!name) return box.innerHTML;
    name.textContent = name.textContent.replace(STRAIN_SUFFIX, "");
    box.querySelectorAll(".product-card__image img").forEach(function (img) {
      ["alt", "title"].forEach(function (a) { var v = img.getAttribute(a); if (v) img.setAttribute(a, v.replace(STRAIN_SUFFIX, "")); });
    });
    return box.innerHTML;
  }

  function expandVariants(cards, inStockOnly) {
    if (!HZ8.variantCards) return Promise.resolve(cards);
    return HZ8.variantCards.expand(cards, { inStockOnly: inStockOnly }).then(function (x) {
      return HZ8.variantCards.settle(x, "");
    }, function () { return cards; });
  }

  function listAttr(el, name) { return (el.getAttribute(name) || "").split(/\s+/).filter(Boolean); }

  /* Produktnivå (före variantuppdelning): delas av raden och uppställningen.
     data-hz8-exclude: kategorier vars produkter räknas bort (t.ex. carts,
     refill och batterier på en formatlandning). Uteslutningen gäller hela
     produkten, med eller utan lager. */
  function sourceOf(root) {
    var slot = root.querySelector("[data-hz8-lp-products]");
    if (!slot) return null;
    var sources = listAttr(slot, "data-hz8-sources");
    if (!sources.length) return null;
    var inStockOnly = slot.getAttribute("data-hz8-instock") === "only";
    var exclude = listAttr(slot, "data-hz8-exclude");
    var excluded = exclude.length ? mergedCards(exclude, false).then(function (cards) {
      var set = {}; cards.forEach(function (c) { set[productKey(c.html)] = true; }); return set;
    }) : Promise.resolve({});
    var src = { slot: slot, inStockOnly: inStockOnly, cards: Promise.all([mergedCards(sources, inStockOnly), excluded]).then(function (r) {
      return r[0].filter(function (c) {
        if (r[1][productKey(c.html)]) return false;
        return !(HZ8.variantCards && HZ8.variantCards.isPackageCard(c.html));
      });
    }) };
    /* Variantnivå (en post per köpbar smak/strain): samma lista som ledet
       visar och som lagerraden räknar. Hämtas en gång. */
    var variants = null;
    src.variants = function () { return variants || (variants = src.cards.then(function (cards) { return expandVariants(cards, inStockOnly); })); };
    return src;
  }

  function initProducts(root, src) {
    var slot = src.slot;
    if (slot.getAttribute("data-hz8-filled")) return;
    slot.setAttribute("data-hz8-filled", "1");
    var inStockOnly = src.inStockOnly;
    var strain = slot.hasAttribute("data-hz8-strain-only");
    var section = slot.closest("section");
    var scope = slot.closest(".hz8-lp__range") || section;
    var heading = scope && scope.querySelector(":is(h2, h3)[id]");
    var limit = parseInt(slot.getAttribute("data-hz8-limit"), 10) || 12;
    src.variants().then(function (cards) {
      if (!cards.length) return; // reservlänken i blocket står kvar
      if (strain) cards = cards.map(function (c) { var o = {}; Object.keys(c).forEach(function (k) { o[k] = c[k]; }); o.html = strainOnly(c.html); return o; });
      var rail = HZ8.productRail({
        id: (section && section.id ? section.id : "hz8-lp") + "-rail",
        className: "hz8-prail--compact hz8-lp__rail",
        title: heading ? heading.textContent.trim() : "Produkter",
        hideCount: true,
        cards: cards,
        limit: limit,
        eager: true
      });
      /* Sektionens synliga H2 kommer från adminblocket; rälsens egen
         rubrik tas bort så att sidan inte får två rubriker för samma
         sak. Rälsens bläddringsknappar ligger kvar. */
      var own = rail.querySelector(".hz8-prail__title");
      if (own && heading) { own.remove(); rail.setAttribute("aria-labelledby", heading.id); }
      slot.innerHTML = "";
      slot.appendChild(rail);
    });
  }

  /* Nyehandels bildtjänst: base64-JSON {key, edits}. Samma original i
     större storlek och WebP för stagen; okänt format -> oförändrad URL. */
  function stageSrc(src, w) {
    var m = /^(https:\/\/[^/]+\/)([A-Za-z0-9+/=]+)$/.exec(src || "");
    if (!m) return src;
    try {
      var o = JSON.parse(atob(m[2]));
      if (!o || !o.key) return src;
      o.edits = { resize: { width: w, height: w, fit: "inside" }, toFormat: "webp" };
      return m[1] + btoa(JSON.stringify(o));
    } catch (e) { return src; }
  }

  function cardInfo(html) {
    var box = document.createElement("div");
    box.innerHTML = html;
    var img = box.querySelector(".product-card__image img");
    var price = box.querySelector(".price");
    var name = box.querySelector(".name");
    var src = img && img.getAttribute("src");
    return {
      key: productKey(html),
      src: src && !/no-image/.test(src) ? src : "",
      price: price ? price.innerHTML : "",
      sale: !!(price && price.classList.contains("has-comparison")),
      name: name ? name.textContent.replace(/\s+/g, " ").trim() : ""
    };
  }

  /* "High Life – Northern Lights – 5g" -> "Northern Lights" när vägens
     rubrik är "High Life". Ingen ny text -- bara katalognamnet kortat.
     Katalognamn kan bära halt först ("CBD 56% – Cereal Milk + …") och
     dubbelkodade entiteter ("&amp;"); båda tas bort ur visningen. Om bara
     storleken skiljer produkterna åt (Magic Sauce 3.0 – 2ml / 5ml) blir
     storleken namnet, men bara när vägen har flera träffar. */
  function decode(s) { var t = document.createElement("textarea"); t.innerHTML = s; return t.value; }
  var SIZE_RE = /^(\d+(?:\s*\+\s*\d+)?)\s*(g|ml)$/i;
  function sizeLabel(name) {
    var m = String(name).match(/(\d+(?:\s*\+\s*\d+)?)\s*(g|ml)\b/i);
    return m ? m[1].replace(/\s/g, "") + " " + m[2].toLowerCase() : "";
  }
  function shortName(name, title, many) {
    var t = title.replace(/[’']/g, "'").toLowerCase();
    var parts = decode(name).split(/\s+[-–—]\s*|\s*[-–—]\s+/).map(function (x) { return x.trim().replace(/^[A-Za-z0-9-]+\s+\d+(?:[.,]\d+)?\s*%\s*$/, ""); }).filter(function (x) {
      return x && x.replace(/[’']/g, "'").toLowerCase() !== t && !SIZE_RE.test(x) && !/^(indica|sativa|hybrid)$/i.test(x);
    });
    return parts.join(" ") || (many ? sizeLabel(name) : "");
  }

  function initLeads(root, src) {
    var leads = root.querySelectorAll(".hz8-lp__path[data-hz8-match]");
    if (!leads.length || !src) return;
    src.cards.then(function (cards) {
      var byKey = {};
      cards.forEach(function (c) { var info = cardInfo(c.html); if (!byKey[info.key]) byKey[info.key] = info; });
      /* Ingen data alls (hämtningen misslyckades eller källorna är tomma):
         vägarna står kvar som i initial HTML -- text och riktiga länkar på
         stagen -- i stället för en tom produktsektion. */
      if (!cards.length) { root.classList.add("hz8-lp--no-data"); return; }
      Array.prototype.forEach.call(leads, function (lead, i) {
        if (lead.getAttribute("data-hz8-filled")) return;
        lead.setAttribute("data-hz8-filled", "1");
        var title = (lead.querySelector("h3") || {}).textContent || "";
        var hits = lead.getAttribute("data-hz8-match").split(/\s+/).filter(Boolean)
          .map(function (p) { return byKey[HZ8.path(p).replace(/\/\d+$/, "")]; }).filter(Boolean);
        if (!hits.length) { lead.hidden = true; return; } // inget i lager
        var first = hits[0];
        var link = lead.querySelector(".hz8-lp__path-link");
        if (link) link.setAttribute("href", HZ8.link(first.key));
        var live = lead.querySelector("[data-hz8-live]");
        if (live) {
          var names = hits.map(function (h) { return { key: h.key, n: shortName(h.name, title.trim(), hits.length > 1) }; }).filter(function (h) { return h.n; });
          live.innerHTML =
            (names.length ? '<span class="hz8-lp__path-names">' + names.map(function (h) {
              return '<a href="' + HZ8.esc(HZ8.link(h.key)) + '">' + HZ8.esc(h.n) + "</a>";
            }).join('<span aria-hidden="true"> · </span>') + "</span>" : "") +
            (first.price ? '<span class="price' + (first.sale ? " has-comparison" : "") + '">' + first.price + "</span>" : "");
        }
        var scene = lead.querySelector(".hz8-lp__scene");
        if (scene && first.src) {
          var img = document.createElement("img");
          img.className = "hz8-lp__pack";
          img.alt = "";
          img.decoding = "async";
          img.width = 720;
          img.height = 720;
          if (i === 0) img.setAttribute("fetchpriority", "high"); // tre små WebP, alla i första vyn eller nästa svep
          img.addEventListener("error", function () { if (img.src !== first.src) img.src = first.src; else img.remove(); }, { once: false });
          img.addEventListener("load", function () { scene.classList.add("has-pack"); });
          img.src = stageSrc(first.src, 720);
          scene.appendChild(img);
        }
      });
      root.classList.toggle("hz8-lp--no-leads", !root.querySelector(".hz8-lp__path:not([hidden])"));
    });
  }

  /* ---- Formatlandning: storlekar, lagerrad och seriestatus ----
     Allt räknas ur samma lagerfiltrerade produktkort som sortimentsledet
     (produktnivå, paket och uteslutna format borträknade). Ingen data ->
     inget visas; en storlek eller serie utan lager får ingen siffra. */
  function priceOf(html) {
    var box = document.createElement("div"); box.innerHTML = html;
    var p = box.querySelector(".price ins") || box.querySelector(".price");
    if (!p) return 0;
    var own = p.cloneNode(true); own.querySelectorAll("del").forEach(function (d) { d.remove(); });
    return parseInt(own.textContent.replace(/[^\d]/g, ""), 10) || 0;
  }
  /* Storleksgrupp = total volym, samma klassning som katalogens volym-
     filter (80-category, TASK 01E): "1+1 ml" -> "2 ml". Bara grupperingen;
     produktens namn och märkning ändras inte. */
  function totalSize(label) {
    var m = /^(\d+(?:\s*\+\s*\d+)+)\s*(g|ml)$/i.exec(label);
    if (!m) return label;
    var sum = m[1].split("+").reduce(function (a, x) { return a + parseFloat(x); }, 0);
    return String(sum) + " " + m[2].toLowerCase();
  }
  function sizeGroups(cards) {
    var by = {};
    cards.forEach(function (c) {
      var info = cardInfo(c.html), label = totalSize(sizeLabel(decode(info.name)));
      if (!label) return;
      var key = label.replace(/\s/g, ""), g = by[key] || (by[key] = { label: label, n: 0, min: 0, first: info.key });
      var pr = priceOf(c.html);
      g.n++; if (pr && (!g.min || pr < g.min)) g.min = pr;
    });
    return by;
  }
  function kr(n) { return n.toLocaleString("sv-SE").replace(/ /g, " ") + " kr"; }
  function joinSv(list) { return list.length > 1 ? list.slice(0, -1).join(", ") + " och " + list[list.length - 1] : list.join(""); }
  function part(cls, text) { var s = document.createElement("span"); s.className = cls; s.textContent = text; return s; }
  function sizeSort(a, b) { return parseFloat(a) - parseFloat(b) || a.length - b.length; }

  function initFormat(root, src) {
    var sizes = root.querySelector("[data-hz8-sizes]");
    var summary = root.querySelector("[data-hz8-format-summary]");
    var rangeCount = root.querySelector("[data-hz8-range-count]");
    if ((!sizes && !summary && !rangeCount) || !src) return;
    src.cards.then(function (cards) {
      var by = sizeGroups(cards), total = 0, shown = [];
      if (sizes) {
        sizes.querySelectorAll("[data-hz8-size]").forEach(function (li) {
          var g = by[li.getAttribute("data-hz8-size")];
          if (!g) { li.hidden = true; return; }
          var a = li.querySelector("a");
          /* Storlek utan eget katalogfilter: länka till en riktig produkt i
             lager i den storleken (den första). */
          if (a && a.hasAttribute("data-hz8-size-product")) a.setAttribute("href", HZ8.link(g.first));
          var live = li.querySelector("[data-hz8-size-live]");
          if (live) {
            /* Två delar (antal, frånpris) så att mobilens storleksrad kan
               stapla dem; separatorn ritas av CSS. */
            live.textContent = "";
            live.appendChild(part("hz8-lp__size-n", g.n + (g.n === 1 ? " produkt" : " produkter")));
            if (g.min) { live.appendChild(document.createTextNode(" ")); live.appendChild(part("hz8-lp__size-from", "från " + kr(g.min))); }
          }
        });
        var visible = sizes.querySelectorAll("[data-hz8-size]:not([hidden])").length;
        sizes.setAttribute("data-hz8-n", String(visible));
        var block = sizes.closest(".hz8-lp__sizes");
        if (block && !visible) block.hidden = true;
      }
      total = cards.length;
      if (!total || !(summary || rangeCount)) return;
      shown = Object.keys(by).sort(sizeSort).map(function (k) { return by[k].label.replace(/\s*ml$/, ""); });
      /* Två nivåer ur samma livedata: produkter (en per produktsida, t.ex.
         "Magic Sauce 3.0 – 2ml") och smakvarianter (köpbara varianter, ett kort
         var i ledet). Antalet smakvarianter skrivs bara när variantdatan kom fram. */
      src.variants().then(function (vs) { return vs.length; }, function () { return 0; }).then(function (flavours) {
        var prod = total + (total === 1 ? " produkt" : " produkter");
        var fl = flavours && flavours !== total ? flavours + (flavours === 1 ? " smakvariant" : " smakvarianter") : "";
        if (summary) {
          summary.textContent = "";
          summary.appendChild(part("hz8-lp__live-n", prod));
          summary.appendChild(document.createTextNode(" i lager"));
          if (fl) { summary.appendChild(document.createTextNode(" med ")); summary.appendChild(part("hz8-lp__live-n", fl)); }
          if (shown.length) { summary.appendChild(part("hz8-lp__live-sep", " · ")); summary.appendChild(part("hz8-lp__live-n hz8-lp__live-sizes", joinSv(shown) + " ml")); }
          summary.hidden = false;
        }
        if (rangeCount && fl) { rangeCount.textContent = fl + " från " + prod + ". "; rangeCount.hidden = false; }
      });
    });
  }

  /* Serielänkar: "I lager: 2 och 5 ml" när seriens kategori har produkter
     som också finns i sidans lagerlista. Laddas när listan närmar sig
     vyn. Slut eller okänt -> ingen status (aldrig ett påstående). */
  function initSeries(root, src) {
    var items = root.querySelectorAll("[data-hz8-series]");
    if (!items.length || !src) return;
    var run = function () {
      src.cards.then(function (cards) {
        var mine = {}; cards.forEach(function (c) { mine[productKey(c.html)] = c; });
        Array.prototype.forEach.call(items, function (li) {
          if (li.getAttribute("data-hz8-filled")) return;
          li.setAttribute("data-hz8-filled", "1");
          mergedCards(listAttr(li, "data-hz8-series"), true).then(function (list) {
            var hits = list.filter(function (c) { return mine[productKey(c.html)]; });
            var live = li.querySelector("[data-hz8-series-live]");
            if (!hits.length || !live) return;
            var by = sizeGroups(hits), labels = Object.keys(by).sort(sizeSort).map(function (k) { return by[k].label.replace(/\s*ml$/, ""); });
            live.textContent = labels.length ? "I lager: " + joinSv(labels) + " ml" : "I lager";
            li.classList.add("is-in-stock");
          });
        });
      });
    };
    if (!("IntersectionObserver" in window)) return run();
    var io = new IntersectionObserver(function (e) { if (e.some(function (x) { return x.isIntersecting; })) { io.disconnect(); run(); } }, { rootMargin: "600px 0px" });
    io.observe(items[0]);
  }

  /* Ankarlänkarna: rubriken under den fasta headern får fokus, så
     tangentbords- och skärmläsaranvändare hamnar i rätt kapitel. */
  function initNav(root) {
    var nav = root.querySelector(".hz8-lp__nav");
    if (!nav || nav.getAttribute("data-hz8-bound")) return;
    nav.setAttribute("data-hz8-bound", "1");
    nav.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var target = document.getElementById(a.getAttribute("href").slice(1));
      if (!target) return;
      e.preventDefault();
      var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      var h = target.querySelector("h2");
      if (h) { if (!h.hasAttribute("tabindex")) h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
      if (history.replaceState) history.replaceState(null, "", "#" + target.id);
    });
  }

  HZ8.isLandingPage = function () { return !!document.querySelector(".store-page .hz8-lp"); };

  HZ8.register("landing", function (context) {
    if (context.page !== "page") return;
    var root = document.querySelector(".store-page .hz8-lp");
    if (!root) return;
    document.documentElement.classList.add("hz8-lp-page");
    /* Scenen (atmosfär och komposition) väljs av blocket; CSS läser den på
       <html> eftersom putsen ligger i body-bakgrunden. */
    var scene = root.getAttribute("data-hz8-scene");
    if (scene && /^[a-z0-9-]+$/.test(scene)) document.documentElement.setAttribute("data-hz8-lp-scene", scene);
    initNav(root);
    var src = sourceOf(root);
    if (src) initProducts(root, src);
    initLeads(root, src);
    initFormat(root, src);
    initSeries(root, src);
  });
})();
