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

  /* interleave: varva källorna (en produkt ur varje i tur och ordning) i
     stället för att lägga dem efter varandra -- för led med flera serier
     (data-hz8-interleave). Utan attributet: oförändrad ordning. */
  function mergedCards(sources, inStockOnly, interleave) {
    return Promise.all(sources.map(function (src) {
      return HZ8.fetchPage(inStockOnly ? withParam(src, STOCK_FILTER) : src, HZ8.categoryCards).catch(function () { return []; });
    })).then(function (lists) {
      var seen = {}, flat = [];
      if (interleave) {
        for (var i = 0, more = true; more; i += 1) {
          more = false;
          lists.forEach(function (l) { if (i < l.length) { flat.push(l[i]); more = true; } });
        }
      } else flat = [].concat.apply([], lists);
      return flat.filter(function (c) {
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
    var name = box.querySelector(".product-card[data-hz8-variant] .name");
    if (!name) return html;
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

  /* Produktnivå (före variantuppdelning): delas av raden och uppställningen. */
  function sourceOf(root) {
    var slot = root.querySelector("[data-hz8-lp-products]");
    if (!slot) return null;
    var sources = (slot.getAttribute("data-hz8-sources") || "").split(/\s+/).filter(Boolean);
    if (!sources.length) return null;
    var inStockOnly = slot.getAttribute("data-hz8-instock") === "only";
    return { slot: slot, inStockOnly: inStockOnly, cards: mergedCards(sources, inStockOnly, slot.hasAttribute("data-hz8-interleave")).then(function (cards) {
      return HZ8.variantCards ? cards.filter(function (c) { return !HZ8.variantCards.isPackageCard(c.html); }) : cards;
    }) };
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
    src.cards.then(function (cards) {
      return expandVariants(cards, inStockOnly);
    }).then(function (cards) {
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
     rubrik är "High Life". Ingen ny text -- bara katalognamnet kortat. */
  function shortName(name, title) {
    var t = title.replace(/[’']/g, "'").toLowerCase();
    var parts = name.split(/\s+[-–—]\s*|\s*[-–—]\s+/).map(function (x) { return x.trim(); }).filter(function (x) {
      return x && x.replace(/[’']/g, "'").toLowerCase() !== t && !/^\d+\s*(g|ml)$/i.test(x) && !/^(indica|sativa|hybrid)$/i.test(x);
    });
    return parts.join(" ");
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
          var names = hits.map(function (h) { return { key: h.key, n: shortName(h.name, title.trim()) }; }).filter(function (h) { return h.n; });
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
    initNav(root);
    var src = sourceOf(root);
    if (src) initProducts(root, src);
    initLeads(root, src);
  });
})();
