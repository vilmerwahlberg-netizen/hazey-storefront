/* Variantkort och paketfilter i produktlistor (TASK 23).

   EN plats för två regler som alla Theme 8-listor (kategoriunionen i
   80-category.js, serie x format-sidornas grid, seriehubbarna i
   81-series-hub.js) använder innan de räknar, sorterar och delar upp i sidor:

   1. Paketkort hålls borta från listorna. Ett kort är ett paketkort när
      dess länk är en paketartikel i HZ8.packageTable (03c), eller när
      namnet slutar på "– N-pack" där N är en paketstorlek i samma tabell
      (Woo-importerade paketskal före/efter adminstädningen). 10-pack och
      kollektioner av ml-produkter döljs också (TASK 23b). Paket-
      artiklarna inaktiveras inte -- köpmodulen hämtar dem som vanligt.

   2. Variantprodukter visas som ett kort per variant. Bara kort som
      Nyehandel själv märker "Finns i flera varianter" läses (en produktsida
      + product/state per produkt, köat och cachat i HZ8.productState), och
      bara när produkten har ett strain-/smakval. Kortet: smaknamn som
      titel, produktens namn som överrad, variantens egen bild (annars
      produktens), lager enligt samma regel som köpet (HZ8.variantOrderable)
      och länk till /products/<slug>/<variant-id> -- Nyehandels egen
      variant-URL som öppnar produktsidan med just den varianten vald.
      Inga nya produktsidor eller SEO-URL:er; canonical är produktens.
      Kan varianterna inte läsas ligger produktkortet kvar (inget kort
      försvinner tyst). Ingen strainlista i koden -- allt ur Nyehandel. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  var STRAIN_OPTION = /^(strain|smak|doft|sort|variant)/i;
  var weights = {};      // produktsökväg -> { all, inStock }
  var names = {};        // produktsökväg -> [{ name, orderable }] (sökning/antal)
  var listeners = [];

  function decode(t) { return String(t || "").replace(/&amp;/g, "&").replace(/&#0?39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim(); }
  function cardHref(html) { var m = String(html).match(/href="([^"]*\/products\/[^"]+)"/); return m ? m[1] : ""; }
  function pathOf(href) { return href ? HZ8.path(href).split("?")[0].replace(/\/\d+$/, "") : ""; }
  function cardPath(html) { return pathOf(cardHref(html)); }
  function cardName(html) { var m = String(html).match(/class="name"[^>]*>\s*([^<]+?)\s*</); return m ? decode(m[1]) : ""; }

  /* Paketregeln (se ovan). Tabellens routes och storlekar läses varje gång
     (03c kan utökas utan ändring här). */
  function packageRoutes() {
    var T = HZ8.packageTable || {}, routes = {}, sizes = {};
    Object.keys(T).forEach(function (pid) {
      (T[pid].packs || []).forEach(function (e) { routes[e.route] = true; sizes[e.qty] = true; });
    });
    return { routes: routes, sizes: Object.keys(sizes) };
  }
  /* TASK 23b: alla flerpack av ml-produkter (vapes, carts, liquids) --
     "– N-pack" eller "Kollektion" i namnet -- hålls borta oavsett N.
     3-/5-pack (tabellens storlekar) döljs i alla enheter som förut. Gram-
     10-pack (buds/pre-rolls) och startpaket (batteri + carts) visas. */
  var MULTI = /([-–]\s*\d+\s*-?\s*pack|[-–]\s*(hela\s+)?kollektion(en)?)\s*$/i;
  var ML = /\d+(?:[.,]\d+)?\s*ml\b/i;
  function isPackageCard(html) {
    var P = packageRoutes(), path = cardPath(html);
    if (path && P.routes[path]) return true;
    var name = cardName(html).replace(/\s*\(blandbart\)\s*$/i, "");
    if (MULTI.test(name) && ML.test(name)) return true;
    if (!P.sizes.length) return false;
    return new RegExp("[-–]\\s*(" + P.sizes.join("|") + ")\\s*-?\\s*pack\\s*$", "i").test(name);
  }

  function hasVariants(html) { return /class="has-variants"/.test(String(html)); }

  /* Ett produktkort -> ett kort per variant (DOM, inte strängbyten). */
  function variantHtml(html, state, v) {
    var box = document.createElement("div");
    box.innerHTML = html;
    var card = box.querySelector(".product-card");
    if (!card) return null;
    var href = cardHref(html), base = href.split("?")[0].replace(/\/\d+$/, "");
    var product = decode(state.name) || cardName(html);
    card.setAttribute("data-hz8-variant", String(v.id));
    card.setAttribute("data-hz8-instock", v.orderable ? "1" : "0");
    card.querySelectorAll('a[href*="/products/"]').forEach(function (a) { a.setAttribute("href", base + "/" + v.id); });
    var img = card.querySelector(".product-card__image img");
    if (img) {
      if (v.image) { img.setAttribute("src", v.image); img.removeAttribute("srcset"); }
      img.setAttribute("alt", product + " – " + v.name);
      img.setAttribute("title", product + " – " + v.name);
    }
    var flag = card.querySelector(".has-variants");
    if (flag) flag.remove();
    var nameEl = card.querySelector(".name");
    if (nameEl) { nameEl.textContent = v.name; nameEl.setAttribute("data-hz8-product", product); }
    var brand = card.querySelector(".brand");
    if (brand) { brand.setAttribute("data-hz8-brand", decode(brand.textContent)); brand.textContent = product; }
    var ins = card.querySelector(".price ins");
    if (ins && v.price) ins.textContent = v.price;
    return box.innerHTML.trim();
  }

  function variantsOf(state) {
    if (!state || state.isPackage || !STRAIN_OPTION.test(state.option || "")) return null;
    var list = state.variantList || [];
    return list.length > 1 ? list : null;
  }

  /* list: [{ html, ... }] (en per produkt, redan deduplicerad).
     opts.inStockOnly: bara köpbara varianter (kundens "I lager"-filter).
     Resultat: samma ordning; paketkort borta; variantprodukter ersatta av
     sina varianter (köpbara först, annars Nyehandels ordning). Varje
     variantpost får path (produktens), variant {id, name, orderable} och
     product (produktens namn). */
  function expand(list, opts) {
    opts = opts || {};
    var items = (list || []).filter(function (c) { return !isPackageCard(c.html); });
    return Promise.all(items.map(function (c) {
      if (!hasVariants(c.html)) return Promise.resolve([c]);
      var href = cardHref(c.html);
      return HZ8.productState(href).then(function (state) {
        var vs = variantsOf(state);
        if (!vs) return [c];
        var path = pathOf(href);
        var ordered = vs.filter(function (v) { return v.orderable; }).concat(vs.filter(function (v) { return !v.orderable; }));
        weights[path] = { all: ordered.length, inStock: vs.filter(function (v) { return v.orderable; }).length };
        names[path] = ordered.map(function (v) { return { name: v.name, orderable: v.orderable }; });
        if (opts.inStockOnly) ordered = ordered.filter(function (v) { return v.orderable; });
        return ordered.map(function (v) {
          var out = {};
          Object.keys(c).forEach(function (k) { out[k] = c[k]; });
          out.html = variantHtml(c.html, state, v) || c.html;
          out.path = path;
          out.product = decode(state.name);
          out.variant = { id: v.id, name: v.name, orderable: v.orderable };
          return out;
        });
      }, function () { return [c]; });
    })).then(function (groups) {
      notify();
      return [].concat.apply([], groups);
    });
  }

  /* Antal kort en produkt blir (null = okänt ännu, räkna 1). Paketkort = 0. */
  function weight(path, inStockOnly) {
    var w = weights[path];
    if (!w) return null;
    return inStockOnly ? w.inStock : w.all;
  }
  var pending = 0;
  function notify() {
    if (pending) return;
    pending = window.setTimeout(function () { pending = 0; listeners.forEach(function (fn) { try { fn(); } catch (e) { /* lyssnarens fel stoppar inte övriga */ } }); }, 0);
  }

  /* Nyehandel ordnar listor i två block (i lager först). En variant-
     produkt med både köpbara och slutsålda varianter står i lagerblocket --
     dess slutsålda varianter flyttas därför sist (relativ ordning bevaras).
     Bara för serverns ordningar (standard, populär, nyast, i lager);
     pris/namn sorteras strikt av anroparen. */
  var SERVER_SORT = { "": 1, popular: 1, published: 1, "in-stock": 1 };
  function settle(list, sort) {
    if (!SERVER_SORT[sort || ""]) return list;
    var mixed = {};
    list.forEach(function (c) { if (c.variant && c.variant.orderable) mixed[c.path] = true; });
    var keep = [], later = [];
    list.forEach(function (c) { (c.variant && !c.variant.orderable && mixed[c.path] ? later : keep).push(c); });
    return keep.concat(later);
  }

  HZ8.variantCards = {
    settle: settle,
    isPackageCard: isPackageCard,
    expand: expand,
    weight: weight,
    /* Kända varianter för en produkt (null = inte en variantprodukt/okänt). */
    variants: function (path) { return names[path] || null; },
    /* Sökväg för ett kort (variantkort = produktens sökväg). */
    path: cardPath,
    onChange: function (fn) { listeners.push(fn); }
  };
})();
