/* Produktsidespilot (PDP MASTER V1, 2026-10-13): adaptiv köpstation på
   Nyehandels riktiga produktdata. Aktiv på pilotprodukten (PILOT_IDS)
   och, för lokal granskning av adaptiva lägen, på valfri produktsida
   med ?hz8-pdp=1. Övriga produktsidor är orörda.

   Allt härleds live ur /frontend-api/product/state (varianter, lager,
   pristrappa, bilder), sidans egen DOM (namn, betyg, varumärke) och
   /frontend-api/product-reviews/{id}. Nyehandels egna kontroller är
   sanningen: strainval = native <select>, antal = native +/-, köp =
   native köpknapp (Vue:s egen cart/addVariant).

   Flerpack: Nyehandels pristrappa gäller per variantrad (verifierat
   2026-10-13, theme8/review/pdp-pilot-2026-10/carttest-*.json). Ett
   paket med EN strain blir en rad med antal N -> korrekt paketpris och
   köpbart. Ett blandat paket kan inte läggas i varukorgen till rätt pris
   förrän Nyehandel har en paketprodukt (theme8/blocks/MIXED-PACKS.md) --
   byggaren fungerar då som granskningsläge och köpet spärras. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  var PILOT_IDS = { 57: true }; // Vape - THC-A 45% - Faraoh - 2ml
  /* Blandade paket (3/5 valfria strains). Byggaren visas alltid vid 3/5,
     men KÖP av en blandning är spärrat tills Nyehandel har en riktig
     prisregel som ger paketrabatten över flera varianter (verifierat
     2026-10-15: pristrappan gäller per variantrad, ingen paketprodukt,
     se review/pdp-pilot-2026-10/carttest-*.json). När regeln finns sätts
     MIXED_PACK_RULE = true -- först då får en blandning köpas, och priset
     som visas ska då vara varukorgens. ?hz8-mixed-buy=1 slår på det
     blandade varukorgsflödet ENDAST för verifiering i previewn, och visar
     då varukorgens verkliga pris (utan paketrabatt). */
  var MIXED_PACK_RULE = false;
  var MIXED_TEST = /[?&]hz8-mixed-buy=1/.test(location.search);
  function mixedBuyAllowed() { return MIXED_PACK_RULE || MIXED_TEST; }
  var productId = null;
  function readProductId() {
    if (productId === null) productId = +(document.documentElement.innerHTML.match(/viewProduct\(.(\d+)/) || [])[1] || 0;
    return productId;
  }
  HZ8.isPdpPilot = function () {
    if (!/\/products\//.test(location.pathname)) return false;
    return /[?&]hz8-pdp=1/.test(location.search) || !!PILOT_IDS[readProductId()];
  };

  function esc(v) { return HZ8.esc(v); }
  function parseKr(t) { var m = String(t || "").replace(/\s/g, "").match(/(\d+(?:,\d+)?)/); return m ? parseFloat(m[1].replace(",", ".")) : null; }
  function kr(v) { var r = Math.round(v * 100) / 100; return r.toLocaleString("sv-SE", { minimumFractionDigits: r % 1 ? 2 : 0, maximumFractionDigits: 2 }) + " kr"; }
  function node(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function wait(ms) { return new Promise(function (r) { window.setTimeout(r, ms); }); }

  var ICON = {
    box: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/></svg>',
    truck: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.6"/><circle cx="17.5" cy="17.5" r="1.6"/></svg>',
    flag: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
    parcel: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M8 6l8 4"/></svg>',
    zoom: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true" focusable="false"><circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5M10.5 8v5M8 10.5h5"/></svg>',
    chev: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 9l6 6 6-6"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    doc: '<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 15.5h7M9 9h3"/></svg>',
    star: '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M10 1.8l2.5 5.2 5.7.8-4.1 4 1 5.6L10 14.7l-5.1 2.7 1-5.6-4.1-4 5.7-.8z"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 21V11M12 11c0-4 2.5-7 7-8 0 5-2.5 8-7 8zM12 14c0-3.2-2-5.6-6-6.4 0 4 2 6.4 6 6.4z"/></svg>',
    list: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 11h7M9 14.5h7M9 18h4"/></svg>',
    flask: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 3h6M10 3v6l-5.5 9.5A1.7 1.7 0 0 0 6 21h12a1.7 1.7 0 0 0 1.5-2.5L14 9V3"/><path d="M7.2 15h9.6"/></svg>',
    ret: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4M12 8v4l2.5 2"/></svg>'
  };

  /* ---------------- Data ---------------- */
  var S = { product: null, byOption: {}, optionName: "", values: [], tiers: [], reviews: null };
  function loadState() {
    return fetch("/frontend-api/product/state", {
      method: "POST", credentials: "same-origin", headers: HZ8.apiHeaders(),
      body: JSON.stringify({ product_id: readProductId(), variant_ids: [null] })
    }).then(function (r) { return r.json(); }).then(function (d) {
      var P = d.product || {};
      S.product = P;
      (P.variants || []).forEach(function (v) { (v.option_values || []).forEach(function (o) { S.byOption[String(o.id)] = v; }); });
      /* Ett variantval (t.ex. "strain") med minst två värden = valbar dimension. */
      var opt = (P.options || []).length === 1 ? P.options[0] : null;
      if (opt) S.optionName = String(opt.name || "").trim();
      if (opt) S.values = (opt.values || []).map(function (val) { return { id: String(val.id), name: val.name, variant: S.byOption[String(val.id)] }; }).filter(function (x) { return x.variant; });
      return S;
    });
  }
  function loadReviews(total) {
    if (!total) return Promise.resolve([]);
    var all = [];
    function next() {
      return fetch("/frontend-api/product-reviews/" + readProductId() + "?offset=" + all.length, { credentials: "same-origin", headers: HZ8.apiHeaders() })
        .then(function (r) { return r.json(); }).then(function (d) {
          var list = (d && d.data) || d || [];
          if (!list.length) return all;
          all = all.concat(list);
          return all.length >= total || all.length > 400 ? all : next();
        });
    }
    return next().catch(function () { return null; });
  }

  /* Innan product/state har svarat byggs stationen ur sidans egen,
     serverrenderade DOM (strainlistan i den native select:en, pristrappan
     i #product-pricing-table) -- samma data, inget layoutskift när API:t
     svarar. Lager per strain kommer med API-svaret. */
  function domValues() {
    var sel = nativeSelect();
    var label = sel && sel.closest(".field") && sel.closest(".field").querySelector(".label");
    S.optionName = label ? (Array.prototype.filter.call(label.childNodes, function (n) { return n.nodeType === 3; }).map(function (n) { return n.textContent; }).join("").trim() || "strain") : "";
    S.values = sel ? Array.prototype.filter.call(sel.options, function (o) { return o.value !== ""; }).map(function (o) { return { id: o.value, name: o.textContent.trim(), variant: null }; }) : [];
  }
  function domTiers() {
    return Array.prototype.map.call(document.querySelectorAll("#product-pricing-table tr"), function (tr) {
      var c = tr.cells; if (!c || c.length < 2) return null;
      var min = parseInt((c[0].textContent.match(/\d+/) || [])[0], 10), unit = parseKr(c[1].textContent);
      return min && unit ? { min: min, unit: unit } : null;
    }).filter(Boolean).sort(function (a, b) { return a.min - b.min; });
  }
  function nativeSelect() { return document.querySelector("#product-variants select"); }
  function nativeQty() { return document.querySelector(".buy-form .amount-input .input"); }
  function nativeBuy() { return document.querySelector(".buy-form .button.buy"); }
  function isBuyable(v) {
    if (!S.product) return !document.querySelector("#stock:not(.is-positive)"); // före API-svaret: sidans egen lagerstatus
    return !!(v && v.buyable && (v.track_inventory === false || !v.track_inventory || v.available_stock > 0));
  }
  function stockOf(v) { return !v ? 0 : (!v.track_inventory ? Infinity : Math.max(0, v.available_stock || 0)); }
  function currentValue() { var s = nativeSelect(); return s && s.value ? s.value : (S.values[0] && S.values[0].id) || ""; }
  function currentVariant() {
    if (S.values.length) return S.byOption[currentValue()] || null;
    var vs = (S.product && S.product.variants) || [];
    return vs[0] || null;
  }
  function tiersOf(v) {
    if (!v) return domTiers();
    return ((v && v.prices) || []).map(function (p) { return { min: p.price.tier || 1, unit: parseKr(p.price.formatted_price) }; })
      .filter(function (t) { return t.unit != null; }).sort(function (a, b) { return a.min - b.min; });
  }
  function tierUnit(v, qty) { var t = tiersOf(v).filter(function (x) { return x.min <= qty; }).pop(); return t ? t.unit : null; }
  function valueName(id) { var x = S.values.filter(function (v) { return v.id === id; })[0]; return x ? x.name : ""; }
  /* Hjälptext: bara verifierbara påståenden (pris jämförs ur trappan). */
  function strainHelp() {
    var t = "Strains är varianter av samma produkt – inte olika " + (nameParts(((document.querySelector(".product-detail__information h1") || {}).textContent || "").replace(/\u00a0/g, " ")).type.toLowerCase() || "produkt") + "produkter.";
    if (S.product && S.values.length > 1) {
      var sigs = S.values.map(function (x) { return tiersOf(x.variant).map(function (t) { return t.min + ":" + t.unit; }).join("|"); });
      if (sigs.every(function (g) { return g && g === sigs[0]; })) t += " Pris och paketpris är desamma för alla " + label() + "s.";
    }
    return t;
  }
  function label() { return /^strain$/i.test(S.optionName) ? "strain" : S.optionName.toLowerCase(); }

  /* Produktnamnets verifierbara delar: "Vape - THC-A 45% - Faraoh - 2ml". */
  function nameParts(name) {
    var segs = String(name || "").split(/\s+[-–]\s+/).map(function (s) { return s.trim(); }).filter(Boolean);
    var size = segs.slice(1).reverse().filter(function (s) { return /^\d+(?:[.,]\d+)?\s*(?:\+\s*\d+(?:[.,]\d+)?\s*)?(ml|g|gram)$/i.test(s); })[0] || "";
    return {
      type: segs.length > 1 ? segs[0] : "",
      content: segs.filter(function (s) { return /\d\s*%/.test(s); })[0] || "",
      size: size.replace(/(\d)\s*(ml|g)\b/i, "$1 $2").replace(/\bgram\b/i, "g")
    };
  }

  /* ---------------- Köpstation ---------------- */
  var B = { pack: 1, slots: [], busy: false, msg: "", manual: false };

  function packTiers() {
    var v = currentVariant();
    var t = tiersOf(v);
    return t.length > 1 ? t : [];
  }
  function buyableValues() { return S.values.filter(function (x) { return isBuyable(x.variant); }); }
  function builderActive() { return B.pack > 1 && buyableValues().length > 1; }
  /* Förvald strain fyller alla platser -- men bara tills kunden själv
     ändrat en plats (B.manual); manuella val skrivs aldrig över tyst. */
  function fillSlots(id, force) {
    if (!id || (B.manual && !force)) return;
    B.slots = []; for (var i = 0; i < B.pack; i++) B.slots.push(id);
    if (force) B.manual = false;
  }
  function packState() {
    var size = B.pack;
    var filled = B.slots.filter(Boolean);
    var missing = [];
    B.slots.forEach(function (v, i) { if (!v) missing.push(i + 1); });
    var groups = {};
    filled.forEach(function (v) { groups[v] = (groups[v] || 0) + 1; });
    var distinct = Object.keys(groups);
    return { size: size, done: filled.length, missing: missing, groups: groups, mixed: distinct.length > 1, single: distinct.length === 1 && !missing.length ? distinct[0] : null };
  }
  /* Vad Nyehandel faktiskt tar för valet (en rad per strain, egen nivå). */
  function nyehandelPrice(groups) {
    var sum = 0;
    for (var k in groups) { var u = tierUnit(S.byOption[k], groups[k]); if (u == null) return null; sum += u * groups[k]; }
    return sum;
  }

  function stationHtml() {
    var h = '<div class="hz8-pp__meta"></div><p class="hz8-pp__stock" aria-live="polite"></p>';
    /* Strainsektionen fylls i syncStation (data kan komma efter bygget). */
    h += '<fieldset class="hz8-pp__group hz8-pp__strains" hidden><legend class="hz8-pp__legend"><span class="hz8-pp__legend-text"></span><button type="button" class="hz8-pp__info" aria-expanded="false" aria-controls="hz8-pp-help"><svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="7.5"/><path d="M10 9v5M10 6.3v.1" stroke-linecap="round"/></svg><span class="hz8-visually-hidden">Vad är en strain?</span></button></legend><p class="hz8-pp__help" id="hz8-pp-help" hidden></p>' +
      /* Karusell: en rad, scroll-snap per kort, pilar vid radens kanter
         (dämpade/inaktiva vid start och slut), ingen autoplay. */
      '<div class="hz8-pp__car"><button type="button" class="hz8-pp__carbtn" data-dir="-1" aria-label="Föregående strains" aria-controls="hz8-pp-tiles">' + ICON.chev + '</button>' +
      '<div class="hz8-pp__tiles" id="hz8-pp-tiles" role="group"></div>' +
      '<button type="button" class="hz8-pp__carbtn" data-dir="1" aria-label="Nästa strains" aria-controls="hz8-pp-tiles">' + ICON.chev + '</button></div>' +
      '<p class="hz8-pp__carstatus" aria-hidden="true"></p></fieldset>';
    h += '<fieldset class="hz8-pp__group hz8-pp__packs" hidden><legend class="hz8-pp__legend">Välj förpackning</legend><div class="hz8-pp__packlist" role="radiogroup" aria-label="Välj förpackning"></div></fieldset>';
    /* Byggare: en rad per position (nummer, strain, Ändra). Ingen H2 --
       den hör till köpformuläret, inte sidans kapitelstruktur. */
    h += '<div class="hz8-pp__builder" role="group" aria-labelledby="hz8-pp-builder-title" hidden><div class="hz8-pp__bhead"><p id="hz8-pp-builder-title" class="hz8-pp__btitle"></p><span class="hz8-pp__count" aria-live="polite"></span><button type="button" class="hz8-pp__fill"></button></div>' +
      '<ol class="hz8-pp__slots"></ol><p class="hz8-pp__mixnote" hidden></p></div>';
    h += '<div class="hz8-pp__sum"><p class="hz8-pp__total"><span class="hz8-pp__price"></span><del class="hz8-pp__cmp" hidden></del><span class="hz8-pp__unit"></span><span class="hz8-pp__save"></span></p></div>';
    h += '<button type="button" class="hz8-pp__cta">Lägg i varukorgen</button><p class="hz8-pp__msg" role="status" aria-live="polite"></p>';
    var trust = trustItems();
    if (trust.length) h += '<ul class="hz8-pp__trust">' + trust.map(function (t) { return "<li>" + t[0] + "<span>" + esc(t[1]) + "</span></li>"; }).join("") + "</ul>";
    return h;
  }
  /* Bara butikens verifierade regler (HZ8.commerce) -- inga nya löften,
     ingen transportör/leveranstid (motstridiga uppgifter i butiken). */
  function trustItems() {
    var lines = HZ8.commerce && HZ8.commerce.deliveryLines ? HZ8.commerce.deliveryLines() : [];
    var out = [];
    lines.forEach(function (l) {
      if (/^Fri frakt/.test(l)) out.push([ICON.truck, l]);
      else if (/^Skickas från Sverige/.test(l)) out.push([ICON.flag, l]);
      else if (/^Diskret/.test(l)) out.push([ICON.parcel, l]);
    });
    return out.slice(0, 3);
  }

  function renderMeta(st) {
    var meta = st.querySelector(".hz8-pp__meta");
    var stars = document.querySelector(".product-detail__information .price-features .rating .nh-stars[title]");
    var count = (((document.querySelector(".product-detail__information .price-features .rating") || {}).textContent || "").match(/(\d+)\s*omdöm/) || [])[1];
    var avg = stars ? parseFloat(stars.getAttribute("title")) : NaN;
    var html = "";
    /* Betyg som text + riktig ankarlänk till omdömessektionen (bara när
       sektionen finns, dvs. när Nyehandels omdömen faktiskt laddats). */
    if (!isNaN(avg) && count) {
      var a = avg.toFixed(1).replace(".", ",");
      html = '<p class="hz8-pp__rating"><span class="hz8-pp__stars" aria-hidden="true"><span style="width:' + Math.round(avg * 20) + '%"></span></span><span class="hz8-visually-hidden">Betyg ' + a + " av 5, " + count + ' omdömen</span><span aria-hidden="true">' + a + " (" + count + ")</span></p>" +
        (document.getElementById("omdomen") ? '<a class="hz8-pp__revlink" href="#omdomen">Visa ' + count + (+count === 1 ? " omdöme" : " omdömen") + "</a>" : "");
    }
    if (meta.innerHTML !== html) meta.innerHTML = html;
    meta.hidden = !html;
  }

  function syncStation() {
    var st = document.querySelector(".hz8-pp");
    if (!st) return;
    if (!S.values.length) domValues();
    var v = currentVariant();
    var cur = currentValue();
    renderMeta(st);
    var all = S.values.length ? S.values.map(function (x) { return x.variant; }) : ((S.product && S.product.variants) || [null]);
    var anyBuyable = all.some(isBuyable);
    /* Lager */
    var stock = st.querySelector(".hz8-pp__stock");
    var inStock = buyableValues().length;
    var stTxt = !anyBuyable ? "Slut i lager" : isBuyable(v) ? (S.values.length > 1 && S.product && inStock < S.values.length ? "I lager · " + inStock + " av " + S.values.length + " " + label() + "s" : "I lager") : valueName(cur) + " är slut i lager";
    if (stock.textContent !== stTxt) stock.textContent = stTxt;
    stock.classList.toggle("is-out", !isBuyable(v));
    /* Strainval: bara med minst två strains (en strain = ingen väljare). */
    var sf = st.querySelector(".hz8-pp__strains");
    sf.hidden = S.values.length < 2;
    var sig = S.values.map(function (x) { return x.id + ":" + x.name; }).join("|");
    if (sf.__sig !== sig) {
      sf.__sig = sig;
      sf.querySelector(".hz8-pp__legend-text").textContent = "Välj " + label();
      var tl = sf.querySelector(".hz8-pp__tiles");
      tl.setAttribute("aria-label", "Välj " + label() + ", " + S.values.length + " alternativ");
      tl.innerHTML = S.values.map(function (x) { return '<button type="button" class="hz8-pp__tile" aria-pressed="false" data-value="' + esc(x.id) + '"><span class="hz8-pp__tile-name">' + esc(x.name) + '</span><span class="hz8-pp__tile-stock"></span></button>'; }).join("");
    }
    var help = sf.querySelector(".hz8-pp__help"), ht = strainHelp();
    if (help.textContent !== ht) help.textContent = ht;
    var focused = document.activeElement && document.activeElement.classList && document.activeElement.classList.contains("hz8-pp__tile") ? document.activeElement : null;
    st.querySelectorAll(".hz8-pp__tile").forEach(function (b) {
      var x = S.byOption[b.getAttribute("data-value")];
      var out = !isBuyable(x);
      var on = b.getAttribute("data-value") === cur;
      b.setAttribute("aria-pressed", on ? "true" : "false");
      /* Roving tabindex: fokuserat kort (piltangenter) annars valt kort. */
      b.tabIndex = (focused ? b === focused : on) ? 0 : -1;
      b.classList.toggle("is-out", out);
      b.setAttribute("aria-disabled", out ? "true" : "false");
      var s = b.querySelector(".hz8-pp__tile-stock");
      var t = out ? "Slut i lager" : "";
      if (s.textContent !== t) s.textContent = t;
      b.setAttribute("aria-label", valueName(b.getAttribute("data-value")) + (out ? ", slut i lager" : ""));
    });
    if (!st.querySelector('.hz8-pp__tile[tabindex="0"]')) { var f = st.querySelector(".hz8-pp__tile"); if (f) f.tabIndex = 0; }
    var idx = S.values.map(function (x) { return x.id; }).indexOf(cur);
    var cs = sf.querySelector(".hz8-pp__carstatus"), ct = idx >= 0 ? "Vald " + label() + " " + (idx + 1) + " av " + S.values.length : "";
    if (cs.textContent !== ct) cs.textContent = ct;
    if (sf.__cur !== cur) { sf.__cur = cur; revealSelected(sf, false); }
    syncCarousel(sf);
    /* Förpackning */
    var tiers = packTiers();
    var packs = st.querySelector(".hz8-pp__packs");
    packs.hidden = !tiers.length || !anyBuyable;
    if (!tiers.some(function (t) { return t.min === B.pack; })) B.pack = 1;
    if (tiers.length) {
      var base = tiers[0].unit;
      var best = tiers.reduce(function (a, b) { return b.unit < a.unit ? b : a; });
      var html = tiers.map(function (t) {
        var total = t.min * t.unit, saved = t.min * (base - t.unit), pct = Math.round((1 - t.unit / base) * 100);
        var badge = t === best && t !== tiers[0] ? '<span class="hz8-pp__badge is-best">Bäst värde</span>' : pct >= 1 ? '<span class="hz8-pp__badge">Spara ' + pct + " %</span>" : "";
        return '<button type="button" role="radio" class="hz8-pp__pack" data-qty="' + t.min + '" aria-checked="' + (t.min === B.pack) + '" tabindex="' + (t.min === B.pack ? 0 : -1) + '">' + badge +
          '<span class="hz8-pp__pack-qty">' + t.min + ' st</span><span class="hz8-pp__pack-total">' + kr(total) + '</span><span class="hz8-pp__pack-unit">' + kr(t.unit) + "/st</span>" +
          (saved >= 0.5 ? '<span class="hz8-pp__pack-save">Spara ' + kr(saved) + "</span>" : '<span class="hz8-pp__pack-save is-empty" aria-hidden="true"></span>') + "</button>";
      }).join("");
      var list = packs.querySelector(".hz8-pp__packlist");
      if (list.__html !== html) { list.innerHTML = html; list.__html = html; }
    }
    /* Byte i strainkarusellen fyller platserna så länge kunden inte själv
       ändrat någon plats. */
    if (builderActive() && B.__cur !== cur) { B.__cur = cur; if (isBuyable(v)) fillSlots(cur, false); }
    renderBuilder(st);
    renderSum(st, tiers);
    renderCta(st, anyBuyable);
  }

  function renderBuilder(st) {
    var host = st.querySelector(".hz8-pp__builder");
    var on = builderActive();
    host.hidden = !on;
    if (!on) return;
    var size = B.pack;
    var opts = buyableValues();
    var cur = currentValue();
    if (!B.slots.length) fillSlots(isBuyable(S.byOption[cur]) ? cur : (opts[0] && opts[0].id), true);
    while (B.slots.length < size) B.slots.push(B.manual ? "" : (B.slots[0] || ""));
    B.slots = B.slots.slice(0, size);
    /* Val som inte längre är köpbara töms; aldrig fler av en strain än lagret. */
    B.slots = B.slots.map(function (val) { return val && opts.some(function (o) { return o.id === val; }) ? val : ""; });
    var ps = packState();
    host.querySelector(".hz8-pp__btitle").textContent = "Ditt " + size + "-pack";
    var cnt = host.querySelector(".hz8-pp__count"), t = ps.done + " av " + size + " valda";
    if (cnt.textContent !== t) cnt.textContent = t;
    var fill = host.querySelector(".hz8-pp__fill");
    var curOk = isBuyable(S.byOption[cur]) && stockOf(S.byOption[cur]) >= size;
    var ft = "Alla som " + valueName(cur);
    if (fill.textContent !== ft) fill.textContent = ft;
    fill.hidden = !curOk || (ps.single === cur && !ps.missing.length);
    var ol = host.querySelector(".hz8-pp__slots");
    var html = B.slots.map(function (val, idx) {
      return '<li class="hz8-pp__slot' + (val ? " is-set" : "") + '"><span class="hz8-pp__slotnum" aria-hidden="true">' + (idx + 1) + "</span>" +
        '<span class="hz8-pp__slotname" aria-hidden="true">' + (val ? esc(valueName(val)) : "Välj " + esc(label())) + "</span>" +
        '<span class="hz8-pp__slotedit" aria-hidden="true">' + (val ? "Ändra" : "Välj") + ICON.chev + "</span>" +
        '<select id="hz8-pp-slot-' + idx + '" data-slot="' + idx + '" aria-label="Plats ' + (idx + 1) + " av " + size + ", " + esc(label()) + '">' + '<option value="">Välj ' + esc(label()) + "</option>" +
        opts.map(function (o) {
          var used = B.slots.filter(function (x, j) { return x === o.id && j !== idx; }).length;
          var full = o.id !== val && used >= stockOf(o.variant);
          return '<option value="' + esc(o.id) + '"' + (o.id === val ? " selected" : "") + (full ? " disabled" : "") + ">" + esc(o.name) + (full ? " (inga fler i lager)" : "") + "</option>";
        }).join("") + "</select></li>";
    }).join("");
    if (ol.__html !== html) {
      var active = document.activeElement && ol.contains(document.activeElement) ? document.activeElement.getAttribute("data-slot") : null;
      ol.innerHTML = html; ol.__html = html;
      if (active != null) { var again = ol.querySelector('select[data-slot="' + active + '"]'); if (again) again.focus({ preventScroll: true }); }
    }
    var note = host.querySelector(".hz8-pp__mixnote");
    var nt = ps.mixed ? (mixedBuyAllowed() ? "Testläge: blandat paket läggs som en rad per " + label() + " till varukorgens ordinarie pris." : "Blandade " + label() + "s kan inte köpas till paketpris ännu. Paketpriset gäller när alla platser har samma " + label() + ".") : "";
    if (note.textContent !== nt) note.textContent = nt;
    note.hidden = !nt;
  }

  function renderSum(st, tiers) {
    var v = currentVariant();
    var price = st.querySelector(".hz8-pp__price"), unit = st.querySelector(".hz8-pp__unit"), save = st.querySelector(".hz8-pp__save"), cmp = st.querySelector(".hz8-pp__cmp");
    var qty = B.pack, u = tierUnit(v, qty);
    if (builderActive()) {
      var ps = packState();
      if (ps.single) u = tierUnit(S.byOption[ps.single], qty);
      /* Blandning: aldrig paketpris -- visa vad varukorgen faktiskt tar
         (en rad per strain med sin egen nivå), utan besparing. */
      if (ps.mixed && !MIXED_PACK_RULE) {
        var real = nyehandelPrice(ps.groups), pt = real != null ? kr(real) : "";
        if (price.textContent !== pt) price.textContent = pt;
        unit.textContent = ""; save.textContent = ""; cmp.hidden = true;
        return;
      }
    }
    if (u == null) u = parseKr((document.getElementById("product-price") || {}).textContent);
    var base = tiers.length ? tiers[0].unit : u;
    var saved = qty * (base - u);
    var priceTxt = u != null ? kr(u * qty) : "";
    if (price.textContent !== priceTxt) price.textContent = priceTxt;
    var unitTxt = qty > 1 && u != null ? "(" + kr(u) + "/st)" : "";
    if (unit.textContent !== unitTxt) unit.textContent = unitTxt;
    var saveTxt = qty > 1 && saved >= 0.5 ? "Spara " + kr(saved) : "";
    if (save.textContent !== saveTxt) save.textContent = saveTxt;
    /* Jämförelsepris bara när Nyehandel har ett (rea) -- för 1 st. */
    var hasCmp = qty === 1 && v && v.price && v.price.has_compare_price;
    cmp.hidden = !hasCmp;
    if (hasCmp && cmp.textContent !== v.price.formatted_compare_price) cmp.textContent = v.price.formatted_compare_price;
  }

  function blockReason() {
    var v = currentVariant();
    if (!builderActive()) return isBuyable(v) ? "" : valueName(currentValue()) + " är slut i lager. Välj en annan " + label() + ".";
    var ps = packState();
    if (ps.missing.length) return "Välj " + label() + " för plats " + ps.missing.join(", ").replace(/, (\d+)$/, " och $1") + ".";
    if (ps.mixed && !mixedBuyAllowed()) return "Blandade paket kan inte köpas ännu. Välj samma " + label() + " på alla platser för paketpriset.";
    return "";
  }
  /* En enda källa för köpknappens text och läge -- ordinarie CTA och
     stickybaren visar alltid samma. */
  function ctaLabel(anyBuyable) {
    if (B.busy) return "Lägger till…";
    if (B.added) return "Tillagd ✓";
    if (!anyBuyable) return "Slutsåld";
    if (builderActive() && packState().missing.length) return "Välj alternativ";
    if (builderActive() && packState().mixed && !mixedBuyAllowed()) return "Blandat paket – ej köpbart än";
    if (!builderActive() && !isBuyable(currentVariant())) return "Slutsåld";
    return "Lägg i varukorgen";
  }
  function renderCta(st, anyBuyable) {
    var cta = st.querySelector(".hz8-pp__cta");
    var buyControls = document.querySelector(".product-detail__information .buy-controls");
    /* Helt slutsåld: Nyehandels egen bevakning ("Bevaka") visas i stället. */
    var soldOut = !anyBuyable;
    document.documentElement.classList.toggle("hz8-pp-soldout", soldOut);
    cta.hidden = soldOut;
    if (buyControls) buyControls.classList.toggle("hz8-pp-monitor", soldOut);
    var reason = blockReason();
    cta.setAttribute("aria-disabled", reason && !B.busy ? "true" : "false");
    cta.classList.toggle("is-blocked", !!reason);
    cta.setAttribute("aria-busy", B.busy ? "true" : "false");
    var lbl = ctaLabel(anyBuyable);
    if (cta.textContent !== lbl) cta.textContent = lbl;
    cta.setAttribute("data-state", B.busy ? "busy" : B.added ? "added" : !anyBuyable || (!builderActive() && !isBuyable(currentVariant())) ? "soldout" : builderActive() && packState().mixed && !mixedBuyAllowed() ? "blocked" : reason ? "missing" : "ready");
    var msg = st.querySelector(".hz8-pp__msg");
    var m = B.msg || (reason && B.tried ? reason : "");
    if (msg.textContent !== m) msg.textContent = m;
    msg.classList.toggle("is-warn", !!(reason && m));
    syncSticky();
  }

  function chooseValue(id) {
    var sel = nativeSelect();
    if (!sel || sel.value === String(id)) return;
    sel.value = String(id);
    sel.dispatchEvent(new Event("change", { bubbles: true }));
    sel.dispatchEvent(new Event("input", { bubbles: true }));
  }
  function setQty(target) {
    return new Promise(function (resolve) {
      var guard = 0;
      (function step() {
        var input = nativeQty();
        var plus = document.querySelector(".buy-form .amount-input button[aria-label='Öka antalet']");
        var minus = document.querySelector(".buy-form .amount-input button[aria-label='Minska antalet']");
        if (!input || !plus || !minus) return resolve(false);
        var c = parseInt(input.value, 10) || 1;
        if (c === target) return resolve(true);
        if (guard++ > 40) return resolve(false);
        (c < target ? plus : minus).click();
        window.setTimeout(step, 40);
      })();
    });
  }
  function focusFirstMissing() {
    var idx = B.slots.slice(0, B.pack).findIndex(function (s) { return !s; });
    var el = document.querySelector('.hz8-pp__slots select[data-slot="' + (idx < 0 ? 0 : idx) + '"]');
    if (el) { el.scrollIntoView({ behavior: HZ8.reducedMotion && HZ8.reducedMotion() ? "auto" : "smooth", block: "center" }); el.focus({ preventScroll: true }); }
  }
  /* Köp: alltid via Nyehandels egen köpknapp (en variant, antal N). */
  function buy() {
    var st = document.querySelector(".hz8-pp");
    if (B.busy) return;
    B.added = false;
    var reason = blockReason();
    if (reason) {
      B.tried = true; B.msg = "";
      syncStation();
      if (builderActive() && packState().missing.length) focusFirstMissing();
      return;
    }
    if (builderActive() && packState().mixed) return buyMixed(packState().groups);
    var target = builderActive() ? packState().single : currentValue();
    var qty = B.pack;
    /* Bekräftelse ur Nyehandels egen varukorg (Vuex): "Tillagd" bara när
       antalet faktiskt ökat. Utan store: native-knappens eget flöde. */
    var store = HZ8.store && HZ8.store();
    var countNow = function () { var c = store && store.state && store.state.cart && store.state.cart.cart; return c ? +(c.quantity_count || 0) : null; };
    var before = countNow();
    B.busy = true; B.msg = ""; syncStation();
    if (target && S.values.length) chooseValue(target);
    wait(target && S.values.length ? 350 : 0).then(function () { return setQty(qty); }).then(function (ok) {
      var nb = nativeBuy();
      if (!ok || !nb || nb.disabled) throw new Error("native");
      nb.click();
      var tries = 0;
      return new Promise(function (resolve, reject) {
        (function poll() {
          var now = countNow();
          if (before === null || (now !== null && now > before)) return resolve();
          if (++tries > 30) return reject(new Error("not-added"));
          window.setTimeout(poll, 150);
        })();
      });
    }).then(function () {
      B.busy = false; B.tried = false; B.added = true;
      window.clearTimeout(B.addedT);
      B.addedT = window.setTimeout(function () { B.added = false; syncStation(); }, 2600);
      B.msg = (qty > 1 ? qty + " st " : "") + (target && S.values.length ? valueName(target) + " " : "") + "har lagts i varukorgen.";
      syncStation();
      window.setTimeout(function () { B.msg = ""; syncStation(); }, 5000);
    }).catch(function () {
      B.busy = false; B.msg = "Det gick inte att lägga i varukorgen. Försök igen."; syncStation();
    });
    if (st) st.setAttribute("data-last", String(qty));
  }

  /* Blandat paket (bara när mixedBuyAllowed): en rad per strain med rätt
     antal via samma varukorgsintegration som resten av temat
     (HZ8.addVariant -> Nyehandels cart/addVariant), en i taget.
     "Tillagd" först när VARJE variants antal i Nyehandels egen varukorg
     ökat med rätt mängd; delvis fel rapporteras som delvis fel och
     kundens val ligger kvar. */
  function cartQtyByVariant() {
    var store = HZ8.store && HZ8.store(); var c = store && store.state && store.state.cart && store.state.cart.cart;
    if (!c) return null;
    var m = {}; (c.items || []).forEach(function (i) { m[i.variant_id] = (m[i.variant_id] || 0) + (+i.quantity || 0); }); return m;
  }
  function buyMixed(groups) {
    if (B.busy) return;
    var rows = Object.keys(groups).map(function (id) { return { id: id, variant: S.byOption[id], qty: groups[id] }; });
    if (rows.some(function (r) { return !r.variant || !isBuyable(r.variant); })) { B.msg = "En vald " + label() + " är slut i lager."; syncStation(); return; }
    var before = cartQtyByVariant();
    B.busy = true; B.added = false; B.msg = ""; syncStation();
    /* En rad i taget; nästa skickas först när Nyehandels varukorg visar
       föregående (annars ignoreras samtidiga anrop). */
    var waitFor = function (r) {
      var base = (before && before[r.variant.id]) || 0, tries = 0;
      return new Promise(function (resolve, reject) {
        (function poll() {
          var now = cartQtyByVariant();
          if (now && (now[r.variant.id] || 0) - base >= r.qty) return resolve();
          if (++tries > 40) return reject(new Error("timeout"));
          window.setTimeout(poll, 150);
        })();
      });
    };
    rows.reduce(function (p, r) {
      return p.then(function () { return Promise.resolve(HZ8.addVariant(r.variant.id, r.qty)).then(function () { return waitFor(r); }); });
    }, Promise.resolve()).catch(function () {}).then(function () { return wait(300); }).then(function () {
      var after = cartQtyByVariant();
      var ok = rows.filter(function (r) { return after && before && (after[r.variant.id] || 0) - (before[r.variant.id] || 0) >= r.qty; });
      B.busy = false;
      if (after && ok.length === rows.length) {
        B.added = true; B.tried = false;
        window.clearTimeout(B.addedT); B.addedT = window.setTimeout(function () { B.added = false; syncStation(); }, 2600);
        B.msg = B.pack + "-pack har lagts i varukorgen.";
      } else {
        B.msg = ok.length ? "Bara " + ok.length + " av " + rows.length + " " + label() + "s lades i varukorgen. Kontrollera varukorgen och försök igen." : "Det gick inte att lägga paketet i varukorgen. Försök igen.";
      }
      syncStation();
    });
  }

  /* ---- Strainkarusell ---- */
  function reduced() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
  /* Rulla in ett kort horisontellt (aldrig vertikalt: scrollTo på raden,
     inte scrollIntoView). */
  function revealTile(track, tile, smooth) {
    if (!track || !tile) return;
    var t = track.getBoundingClientRect(), r = tile.getBoundingClientRect(), left = null;
    /* Mål = en snappunkt (kortstart), annars snäpper raden tillbaka och
       kortet blir delvis dolt. Höger: minsta kortstart där kortet ryms. */
    var starts = Array.prototype.map.call(track.children, function (c) { return c.offsetLeft - track.firstElementChild.offsetLeft; });
    var max = track.scrollWidth - track.clientWidth;
    if (r.left < t.left) left = tile.offsetLeft - track.firstElementChild.offsetLeft;
    else if (r.right > t.right + 1) {
      var need = track.scrollLeft + (r.right - t.right) + 2;
      left = starts.filter(function (x) { return x >= need; })[0];
      if (left == null || left > max) left = max;
    }
    if (left !== null) track.scrollTo({ left: left, behavior: smooth && !reduced() ? "smooth" : "auto" });
  }
  function revealSelected(sf, smooth) {
    var track = sf.querySelector(".hz8-pp__tiles");
    revealTile(track, track && track.querySelector('.hz8-pp__tile[aria-pressed="true"]'), smooth);
  }
  function syncCarousel(sf) {
    var track = sf.querySelector(".hz8-pp__tiles");
    if (!track) return;
    var max = track.scrollWidth - track.clientWidth;
    var atStart = track.scrollLeft <= 2, atEnd = track.scrollLeft >= max - 2;
    sf.querySelectorAll(".hz8-pp__carbtn").forEach(function (b) {
      var off = max <= 2 || (b.getAttribute("data-dir") === "-1" ? atStart : atEnd);
      if (b.disabled !== off) b.disabled = off;
    });
    sf.classList.toggle("is-scrollable", max > 2);
    sf.classList.toggle("is-at-start", atStart);
    sf.classList.toggle("is-at-end", atEnd);
  }
  function bindCarousel(st) {
    var sf = st.querySelector(".hz8-pp__strains"), track = sf.querySelector(".hz8-pp__tiles");
    var raf = 0;
    track.addEventListener("scroll", function () { if (!raf) raf = window.requestAnimationFrame(function () { raf = 0; syncCarousel(sf); }); }, { passive: true });
    window.addEventListener("resize", function () { syncCarousel(sf); revealSelected(sf, false); }, { passive: true });
    sf.addEventListener("click", function (e) {
      var b = e.target.closest(".hz8-pp__carbtn");
      if (!b || b.disabled) return;
      var card = track.querySelector(".hz8-pp__tile");
      var step = card ? (card.getBoundingClientRect().width + 8) * Math.max(1, Math.floor(track.clientWidth / (card.getBoundingClientRect().width + 8)) - 1) : track.clientWidth * .8;
      track.scrollBy({ left: +b.getAttribute("data-dir") * step, behavior: reduced() ? "auto" : "smooth" });
    });
    /* Tangentbord: vänster/höger flyttar fokus, Home/End första/sista,
       Enter/Space väljer (vanlig knapp). */
    track.addEventListener("keydown", function (e) {
      var tile = e.target.closest(".hz8-pp__tile");
      if (!tile) return;
      var tiles = Array.prototype.slice.call(track.querySelectorAll(".hz8-pp__tile"));
      var i = tiles.indexOf(tile), n = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") n = tiles[Math.min(tiles.length - 1, i + 1)];
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = tiles[Math.max(0, i - 1)];
      else if (e.key === "Home") n = tiles[0];
      else if (e.key === "End") n = tiles[tiles.length - 1];
      if (!n) return;
      e.preventDefault();
      tiles.forEach(function (t) { t.tabIndex = t === n ? 0 : -1; });
      n.focus({ preventScroll: true });
      revealTile(track, n, true);
    });
    track.addEventListener("focusin", function (e) { var t = e.target.closest(".hz8-pp__tile"); if (t) revealTile(track, t, true); });
  }

  function bindStation(st) {
    st.addEventListener("click", function (e) {
      var tile = e.target.closest(".hz8-pp__tile");
      if (tile) {
        if (tile.getAttribute("aria-disabled") === "true") return;
        chooseValue(tile.getAttribute("data-value"));
        B.msg = ""; window.setTimeout(function () { syncStation(); revealTile(tile.parentNode, tile, true); }, 60); return;
      }
      var pack = e.target.closest(".hz8-pp__pack");
      if (pack) {
        var n = +pack.getAttribute("data-qty");
        B.pack = n; B.msg = ""; B.tried = false;
        if (n > 1 && !B.manual && isBuyable(currentVariant())) fillSlots(currentValue(), false);
        syncStation(); return;
      }
      var info = e.target.closest(".hz8-pp__info");
      if (info) { var hp = st.querySelector(".hz8-pp__help"); hp.hidden = !hp.hidden; info.setAttribute("aria-expanded", String(!hp.hidden)); return; }
      if (e.target.closest(".hz8-pp__fill")) { fillSlots(currentValue(), true); B.msg = ""; syncStation(); return; }
      if (e.target.closest(".hz8-pp__cta")) buy();
    });
    st.addEventListener("change", function (e) {
      var s = e.target.closest("select[data-slot]");
      if (!s) return;
      B.slots[+s.getAttribute("data-slot")] = s.value; B.manual = true; B.msg = ""; B.added = false; syncStation();
    });
    /* Piltangenter i radiogrupperna (roving tabindex). */
    st.addEventListener("keydown", function (e) {
      var item = e.target.closest('[role="radio"]');
      if (!item || ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].indexOf(e.key) === -1) return;
      var group = item.parentNode;
      var items = Array.prototype.filter.call(group.querySelectorAll('[role="radio"]'), function (b) { return b.getAttribute("aria-disabled") !== "true"; });
      var i = items.indexOf(item), d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
      var nx = items[(i + d + items.length) % items.length];
      if (!nx) return;
      e.preventDefault(); nx.click(); window.setTimeout(function () { var again = group.querySelector('[data-value="' + nx.getAttribute("data-value") + '"], [data-qty="' + nx.getAttribute("data-qty") + '"]'); (again || nx).focus(); }, 80);
    });
  }

  /* ---------------- Sticky köpbar (mobil) ----------------
     Spegel av köpstationen, inget eget köpsystem: pris och val läses ur
     stationens state, knappen anropar samma buy() som ordinarie CTA och
     visar samma etikett (ctaLabel). Visas när ordinarie CTA lämnat vyn
     uppåt, döljs över meny, varukorg, sök och andra modala lager. */
  var sticky = null;
  function overlayOpen() {
    if (document.querySelector("#cart-side-wrap.is-active, #hz8MobileDrawer.is-open, .hz8-mobile-drawer.is-open, .hz8-msearch.is-open, #sidebar.is-active, .hz8-psheet.is-open, .modal.is-active")) return true;
    return Array.prototype.some.call(document.querySelectorAll('[aria-modal="true"], dialog[open]'), function (d) {
      if (d.closest("[inert]") || !d.getClientRects().length) return false;
      var cs = getComputedStyle(d); return cs.visibility !== "hidden" && cs.display !== "none" && +cs.opacity > 0;
    });
  }
  function buildSticky() {
    sticky = node("div", "hz8-pp-sticky");
    sticky.setAttribute("role", "region");
    sticky.setAttribute("aria-label", "Snabbköp");
    sticky.innerHTML = '<p class="hz8-pp-sticky__sum"><span class="hz8-pp-sticky__price"></span><span class="hz8-pp-sticky__sel"></span></p><button type="button" class="hz8-pp-sticky__cta">Lägg i varukorgen</button>';
    sticky.setAttribute("aria-hidden", "true");
    sticky.inert = true;
    document.body.appendChild(sticky);
    sticky.querySelector("button").addEventListener("click", function () {
      var cta = document.querySelector(".hz8-pp__cta");
      if (!cta || cta.hidden) return;
      var state = cta.getAttribute("data-state");
      if ((state === "missing" || state === "blocked") && builderActive()) {
        if (state === "missing") focusFirstMissing();
        else { var b0 = document.querySelector(".hz8-pp__builder"); if (b0) { b0.scrollIntoView({ block: "center", behavior: reduced() ? "auto" : "smooth" }); var s0 = b0.querySelector("select"); if (s0) s0.focus({ preventScroll: true }); } }
        B.tried = true; syncStation(); return;
      }
      if (state === "soldout") {
        /* Vald strain slutsåld: till strainvalet, fokus på valt kort. */
        var t = document.querySelector('.hz8-pp__tile[aria-pressed="true"]') || document.querySelector(".hz8-pp__tile");
        if (t) { t.scrollIntoView({ block: "center", behavior: reduced() ? "auto" : "smooth" }); t.focus({ preventScroll: true }); }
        return;
      }
      buy();
    });
    /* Ordinarie CTA ovanför vyn = visa. Scroll + rAF i stället för
       IntersectionObserver: ett snabbt hopp förbi knappen (ankare,
       tangentbord, återställd scroll) byter aldrig "synlig"-läget och
       gav då ingen observer-händelse. */
    var sraf = 0;
    var check = function () {
      sraf = 0;
      var cta = document.querySelector(".hz8-pp__cta");
      var past = !!(cta && cta.getBoundingClientRect().bottom < 0);
      if (past !== sticky.__past) { sticky.__past = past; syncSticky(); }
    };
    window.addEventListener("scroll", function () { if (!sraf) sraf = window.requestAnimationFrame(check); }, { passive: true });
    /* Tangentbordsfokus under baren: flytta upp kontrollen ovanför den
       (Chrome räknar inte scroll-padding vid fokusnavigering). Nästa frame:
       efter browserns egen fokusscroll, som också kan tända baren. */
    document.addEventListener("focusin", function () { window.requestAnimationFrame(uncoverFocus); });
    window.addEventListener("resize", function () { if (!sraf) sraf = window.requestAnimationFrame(check); }, { passive: true });
    check();
    /* Meny/varukorg öppnas via klassbyten -- följ dem (throttlat). */
    var raf = 0;
    new MutationObserver(function () { if (!raf) raf = window.requestAnimationFrame(function () { raf = 0; syncSticky(); }); })
      .observe(document.body, { attributes: true, subtree: true, attributeFilter: ["class", "aria-modal", "open", "inert"] });
  }
  function uncoverFocus() {
    var el = document.activeElement;
    if (!sticky || !sticky.classList.contains("is-on") || !el || el === document.body || sticky.contains(el)) return;
    var r = el.getBoundingClientRect(), top = sticky.getBoundingClientRect().top;
    if (r.bottom > top - 8 && r.top < window.innerHeight) window.scrollBy({ top: r.bottom - top + 16, behavior: "instant" });
  }
  function syncSticky() {
    if (!sticky) return;
    var st = document.querySelector(".hz8-pp");
    var cta = st && st.querySelector(".hz8-pp__cta");
    var show = !!(sticky.__past && cta && !cta.hidden && window.matchMedia("(max-width: 767px)").matches && !overlayOpen());
    if (sticky.classList.contains("is-on") !== show) {
      sticky.classList.toggle("is-on", show);
      sticky.setAttribute("aria-hidden", show ? "false" : "true");
      sticky.inert = !show;
      if (show) uncoverFocus();
    }
    document.documentElement.classList.toggle("hz8-pp-sticky-on", show);
    if (!st) return;
    var p = st.querySelector(".hz8-pp__price").textContent;
    var pe = sticky.querySelector(".hz8-pp-sticky__price"); if (pe.textContent !== p) pe.textContent = p;
    /* Val: strain och paket ur stationens state (ingen egen tolkning). */
    var parts = [];
    if (S.values.length > 1 && !(builderActive() && packState().mixed)) parts.push(valueName(builderActive() && packState().single ? packState().single : currentValue()));
    if (B.pack > 1) parts.push(B.pack + " st");
    var sel = parts.join(" · "), se = sticky.querySelector(".hz8-pp-sticky__sel");
    if (se.textContent !== sel) se.textContent = sel;
    var b = sticky.querySelector("button");
    if (b.textContent !== cta.textContent) b.textContent = cta.textContent;
    /* "Välj alternativ" är en handling (för till väljaren) -- inte inaktiv.
       "Slutsåld" ser inaktiv ut men leder ändå till strainvalet. */
    b.setAttribute("aria-disabled", /^(soldout|blocked)$/.test(cta.getAttribute("data-state")) ? "true" : "false");
    b.setAttribute("aria-busy", cta.getAttribute("aria-busy") || "false");
    b.setAttribute("data-state", cta.getAttribute("data-state") || "ready");
  }

  /* ---------------- Produktteater ---------------- */
  function buildTheatre() {
    var media = document.querySelector(".product-detail__media");
    if (!media || media.querySelector(".hz8-pp-zoom")) return;
    media.classList.add("hz8-pp-theatre");
    media.setAttribute("data-hz8-media", "contained");
    detectMediaMode(media);
    var thumbs = media.querySelectorAll("#product-thumbnails .thumb");
    media.classList.toggle("has-thumbs", thumbs.length > 1);
    var mainLink = media.querySelector("#product-slides .slide a.product-lightbox");
    if (mainLink) {
      var z = node("button", "hz8-pp-zoom", ICON.zoom);
      z.type = "button";
      z.setAttribute("aria-label", "Förstora produktbilden");
      z.addEventListener("click", function () {
        var active = media.querySelector("#product-slides .slide.is-active a.product-lightbox, #product-slides .slide.active a.product-lightbox") || media.querySelector("#product-slides .slide a.product-lightbox");
        if (active) active.click();
      });
      media.appendChild(z);
    }
    /* Trasig/saknad bild: neutral brunn med samma mått (ingen ersättningsbild). */
    media.querySelectorAll("#product-slides img").forEach(function (img) {
      var mark = function () { media.classList.add("hz8-pp-img-broken"); };
      img.addEventListener("error", mark);
      if (img.complete && !img.naturalWidth) mark();
    });
    if (thumbs.length > 1) {
      var row = media.querySelector("#product-thumbnails");
      row.setAttribute("role", "group");
      row.setAttribute("aria-label", "Produktbilder");
      thumbs.forEach(function (t, i) {
        t.setAttribute("role", "button");
        t.setAttribute("aria-label", "Visa bild " + (i + 1) + " av " + thumbs.length);
        t.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); t.click(); } });
      });
    }
  }
  /* Immersive (mörk teater) bara när bilden verifierat är frilagd:
     transparenta hörn. Annars contained (standard i CSS). Kräver CORS för
     pixelläsning -- utan det förblir läget contained. */
  function detectMediaMode(media) {
    var img = media.querySelector("#product-slides img");
    var src = img && (img.currentSrc || img.src);
    if (!src) return;
    var probe = new Image();
    probe.crossOrigin = "anonymous";
    probe.onload = function () {
      try {
        var c = document.createElement("canvas"); c.width = 24; c.height = 24;
        var x = c.getContext("2d"); x.drawImage(probe, 0, 0, 24, 24);
        var d = x.getImageData(0, 0, 24, 24).data;
        var corners = [0, 23, 24 * 23, 24 * 24 - 1].map(function (i) { return d[i * 4 + 3]; });
        media.classList.toggle("hz8-pp-immersive", corners.every(function (a) { return a < 16; }));
        media.setAttribute("data-hz8-media", corners.every(function (a) { return a < 16; }) ? "immersive" : "contained");
      } catch (e) { media.setAttribute("data-hz8-media", "contained-unverified"); }
    };
    probe.onerror = function () { media.setAttribute("data-hz8-media", "contained-unverified"); };
    probe.src = src;
  }
  function syncThumbs() {
    document.querySelectorAll(".hz8-pp-theatre #product-thumbnails .thumb").forEach(function (t) { t.setAttribute("aria-pressed", t.classList.contains("active") ? "true" : "false"); });
  }

  /* ---------------- Under köpet: fakta + omdömen ---------------- */
  /* ---------------- Kapitel under köpet ----------------
     Ordning (DOM = läsordning): översikt -> Produktinformation ->
     Innehåll och analys -> Leverans och retur -> Omdömen -> Passar till
     -> Liknande produkter -> kategorier/varumärke -> Kundservice.
     Statiska plattformsnoder (produkttexten, Liknande produkter,
     kategorilänkar, kundservice) flyttas in i rätt kapitel; Vue-ägda
     komponenter (accordion, native recensioner) lämnas orörda och döljs
     -- deras data visas en gång, i pilotens kapitel. */
  function productName() { return ((document.querySelector(".product-detail__information h1") || {}).textContent || (S.product && S.product.name) || "").replace(/\u00a0/g, " ").trim(); }
  var CONTENT_LABEL = /cannabinoid|innehåll|halt|mängd|volym|förvaring|extrakt|terpen/i;
  function factRows(kind) {
    var np = nameParts(productName());
    var brand = document.querySelector(".product-detail__information .brand a");
    var specLabels = (S.otherSpecs || []).map(function (r) { return r[0].toLowerCase(); });
    /* Innehåll: produktens egna innehållsrader när de finns, annars det
       som går att läsa ur namnet. Aldrig båda (konkurrerande värden). */
    if (kind === "content" && S.contentSpecs && S.contentSpecs.length) return S.contentSpecs;
    /* Produktfakta: varumärke + produkttextens egna rader (produkttyp,
       produktnamn). Vald strain/antal strains står redan i köpstationen. */
    var rows = kind === "facts" ? [
      ["Varumärke", brand ? brand.textContent.trim() : "", brand ? brand.getAttribute("href") : ""],
      [specLabels.indexOf("produkttyp") !== -1 ? "" : "Produkttyp", np.type]
    ].concat(S.otherSpecs || []) : [
      ["Cannabinoid", np.content],
      [/g$/i.test(np.size) ? "Vikt" : "Volym", np.size]
    ];
    return rows.filter(function (r) { return r[0] && r[1]; });
  }
  function dlHtml(rows) {
    return rows.map(function (r) { return "<div><dt>" + esc(r[0]) + "</dt><dd>" + (r[2] ? '<a href="' + esc(r[2]) + '">' + esc(r[1]) + "</a>" : esc(r[1])) + "</dd></div>"; }).join("");
  }
  function syncLedger() {
    document.querySelectorAll("[data-hz8-facts]").forEach(function (dl) {
      var html = dlHtml(factRows(dl.getAttribute("data-hz8-facts")));
      if (dl.__html !== html) { dl.innerHTML = html; dl.__html = html; }
      var box = dl.closest("[data-hz8-hide-empty]");
      if (box) box.hidden = !html;
    });
  }
  /* Kapitel: H2 med desktop- och mobilrubrik (V4: "Produktöversikt" /
     "Om produkten", "Produktinformation" / "Produktfakta"). Mobil:
     disclosure-rader (knapp-rubrik, aria-expanded); desktop: öppet. */
  var MOBILE = window.matchMedia("(max-width: 767px)");
  function chapter(id, title, cls, opts) {
    opts = opts || {};
    var sec = node("section", "hz8-ppc__sec " + cls);
    sec.id = id;
    sec.setAttribute("aria-labelledby", id + "-h");
    sec.setAttribute("data-t-d", title);
    sec.setAttribute("data-t-m", opts.mobile || title);
    if (opts.icon) sec.setAttribute("data-ico", opts.icon);
    if (opts.collapsible) sec.setAttribute("data-collapsible", "");
    sec.innerHTML = '<h2 class="hz8-ppc__h" id="' + id + '-h"></h2><div class="hz8-ppc__body" id="' + id + '-b"></div>';
    return sec;
  }
  function setHead(sec, mobile) {
    var h = sec.querySelector(".hz8-ppc__h"), body = sec.querySelector(".hz8-ppc__body");
    var t = sec.getAttribute(mobile ? "data-t-m" : "data-t-d"), ico = sec.getAttribute("data-ico");
    var coll = mobile && sec.hasAttribute("data-collapsible");
    var key = (coll ? "c:" : "o:") + t;
    if (h.__key === key) return;
    var btn = h.querySelector("button"), open = !!btn && btn.getAttribute("aria-expanded") === "true";
    h.__key = key;
    var inner = (ico && ICON[ico] ? '<span class="hz8-ppc__ico">' + ICON[ico] + "</span>" : "") + '<span class="hz8-ppc__htext">' + esc(t) + "</span>";
    if (coll) { h.innerHTML = '<button type="button" class="hz8-ppc__toggle" aria-expanded="' + open + '" aria-controls="' + body.id + '">' + inner + ICON.chev + "</button>"; body.hidden = !open; }
    else { h.innerHTML = inner; body.hidden = false; }
  }
  /* Samma noder, två kompositioner: desktop = produkttexten under
     Produktinformation och fakta i översikten; mobil = texten under Om
     produkten och fakta i Produktfakta-raden. Bara statiska noder flyttas. */
  function syncLayout() {
    var m = MOBILE.matches;
    document.querySelectorAll(".hz8-ppc__sec").forEach(function (s) { setHead(s, m); });
    var text = document.getElementById("hz8-ppc-textwrap"), facts = document.getElementById("hz8-ppc-facts");
    var ovBody = document.getElementById("hz8-ppc-oversikt-b"), infoBody = document.getElementById("hz8-ppc-info-b");
    if (infoBody) {
      var textHome = m ? ovBody : infoBody, factsHome = m ? infoBody : ovBody;
      if (text && text.parentNode !== textHome) { if (m) textHome.appendChild(text); else textHome.insertBefore(text, textHome.firstChild); }
      if (facts && facts.parentNode !== factsHome) factsHome.appendChild(facts);
    }
    balance();
  }
  /* Desktop: produkttexten klipps så att Produktinformation slutar i höjd
     med Innehåll och analys (kolumnerna delar topp och botten). */
  function balance() {
    var text = document.querySelector(".hz8-ppc__text"), more = document.querySelector(".hz8-ppc__more");
    if (!text || !more) return;
    var grid = document.querySelector(".hz8-ppc__grid"), ana = document.getElementById("hz8-ppc-analys"), info = document.getElementById("hz8-ppc-info");
    var target = MOBILE.matches ? 300 : 420;
    if (!MOBILE.matches && grid && ana && info && getComputedStyle(grid).gridTemplateColumns.split(" ").length > 1) {
      var h = function (el) { return el ? el.getBoundingClientRect().height : 0; };
      var natural = h(ana.querySelector(".hz8-ppc__h")) + h(ana.querySelector(".hz8-ppc__body"));
      target = Math.max(200, Math.round(natural - h(info.querySelector(".hz8-ppc__h")) - h(more) - 12));
    }
    text.style.setProperty("--pp-clamp", target + "px");
    var long = text.scrollHeight > target + 48;
    more.hidden = !long;
    text.classList.toggle("is-clamped", long && more.getAttribute("aria-expanded") !== "true");
  }
  function deliveryHtml() {
    var R = HZ8.commerce && HZ8.commerce.rules, lines = HZ8.commerce && HZ8.commerce.deliveryLines ? HZ8.commerce.deliveryLines() : [];
    var free = lines.filter(function (l) { return /^Fri frakt/.test(l); })[0], fee = lines.filter(function (l) { return /frakt under/.test(l); })[0];
    var se = lines.some(function (l) { return /Sverige/.test(l); });
    var items = [];
    /* Nästa informationsnivå efter köpstationens korta rader: samma
       verifierade regler (HZ8.commerce, köp- och leveransvillkoren), inga
       nya löften eller leveranstider. */
    var ship = (free && R ? "Fraktfritt från " + R.freeShippingFrom + " kr" + (fee && R.shippingFee ? ", annars " + R.shippingFee + " kr." : ".") : "") + (se ? (free ? " " : "") + "Vi skickar från Sverige och levererar endast inom Sverige." : "");
    if (ship) items.push(["truck", "Frakt och leverans", ship]);
    if (lines.some(function (l) { return /^Diskret/.test(l); })) items.push(["parcel", "Förpackning", "Paketet är diskret förpackat."]);
    items.push(["ret", "Retur", "14 dagars ångerrätt enligt distansavtalslagen. Returfrakten betalas av kunden."]);
    return '<ul class="hz8-ppc__del">' + items.map(function (r) { return '<li><span class="hz8-ppc__delico">' + ICON[r[0]] + "</span><div><h3>" + esc(r[1]) + "</h3><p>" + esc(r[2]) + "</p></div></li>"; }).join("") + "</ul>" +
      '<p class="hz8-ppc__links"><a href="' + esc(HZ8.link("/sv/page/kop-och-leveransvillkor")) + '">Köp- och leveransvillkor</a><a href="' + esc(HZ8.link("/sv/page/faq")) + '">Vanliga frågor</a></p>';
  }
  /* Produkttextens egna rubriker hamnar under H2 Produktinformation: en
     nivå ned (h2 -> 3, h3 -> 4). Rubriken som bara upprepar produktnamnet
     ("Beskrivning av <namn>") döljs. */
  function adoptDescription(article, intro) {
    var name = productName().toLowerCase();
    article.querySelectorAll("h1, h2, h3, h4, h5").forEach(function (h) {
      var t = h.textContent.replace(/\s+/g, " ").trim().toLowerCase();
      if (/^beskrivning av /.test(t) && t.indexOf(name.slice(0, 12)) !== -1) { h.hidden = true; return; }
      /* h1/h2 -> nivå 3, övriga -> nivå 4 (texten skrevs utan sidans
         kapitelstruktur; hopp 3 -> 5 undviks). */
      var lv = +h.tagName.charAt(1);
      h.setAttribute("role", "heading"); h.setAttribute("aria-level", lv <= 2 ? "3" : "4");
    });
    /* Ingressen visas i översikten; samma stycke i den långa texten tas
       bort (texten finns kvar i DOM, en gång). */
    if (intro) {
      var norm = function (el) { return el.textContent.replace(/\s+/g, " ").trim(); };
      var paras = Array.prototype.map.call(intro.matches("p") ? [intro] : intro.querySelectorAll("p"), norm).filter(Boolean);
      article.querySelectorAll("p").forEach(function (p) { if (paras.indexOf(norm(p)) !== -1) p.remove(); });
      /* Ingressens rubrik som redan står i produkttexten visas en gång --
         i produktinformationen, inte i översikten. */
      var heads = Array.prototype.map.call(article.querySelectorAll("h1, h2, h3, h4"), norm);
      intro.querySelectorAll("h1, h2, h3, h4, h5").forEach(function (h) { if (heads.indexOf(norm(h)) !== -1) { h.hidden = true; h.setAttribute("aria-hidden", "true"); } });
      intro.querySelectorAll("br").forEach(function (br) { br.remove(); });
    }
  }
  function specRows(article) {
    var rows = [], seen = {};
    article.querySelectorAll("li").forEach(function (li) {
      var strong = li.querySelector("strong, b"); if (!strong) return;
      var lab = strong.textContent.replace(/[:：]\s*$/, "").trim(), val = li.textContent.replace(strong.textContent, "").replace(/^\s*[:：-]\s*/, "").trim();
      if (lab && val && lab.length < 40 && val.length < 140 && !seen[lab.toLowerCase()]) { seen[lab.toLowerCase()] = 1; rows.push([lab, val]); }
    });
    return rows;
  }
  /* Produkttextens "Produktinformation:"-lista visas som fakta/innehåll --
     listan (och dess etikett) döljs i texten när varje rad blivit en
     faktarad, annars samma uppgifter två gånger. */
  function hideSpecList(article) {
    article.querySelectorAll("ul, ol").forEach(function (list) {
      var lis = list.querySelectorAll(":scope > li");
      if (!lis.length || Array.prototype.some.call(lis, function (li) { return !li.querySelector("strong, b"); })) return;
      list.hidden = true;
      var prev = list.previousElementSibling;
      while (prev && prev.tagName === "BR") prev = prev.previousElementSibling;
      if (prev && /^(produktinformation|specifikationer|fakta)\s*:?$/i.test(prev.textContent.trim())) prev.hidden = true;
    });
  }
  function buildChapters(detail) {
    if (document.querySelector(".hz8-ppc")) return;
    var host = node("div", "hz8-ppc");
    detail.parentNode.insertBefore(host, detail.nextSibling);
    var chap = node("div", "hz8-ppc__chapter"); host.appendChild(chap);

    /* 1. Produktöversikt: befintlig ingress + produktfakta, ett botaniskt
       bildmoment (befintlig asset, dekorativ). */
    var shortDesc = document.querySelector(".product-detail__information .short-description");
    var article = document.querySelector("#product-information article.product-description");
    /* Ingress = första riktiga stycket (kort beskrivning i första hand).
       Resten av den korta beskrivningen ligger kvar, dold, i köpdelen som
       tidigare -- dess specifikationsrader finns i produkttexten. */
    var firstP = function (root) { return root ? Array.prototype.filter.call(root.querySelectorAll("p"), function (p) { return p.textContent.trim().length > 40; })[0] || null : null; };
    var lead = firstP(shortDesc) || firstP(article);
    var ov = chapter("hz8-ppc-oversikt", "Produktöversikt", "hz8-ppc--overview", { mobile: "Om produkten", icon: "leaf" });
    var ovBody = ov.querySelector(".hz8-ppc__body");
    if (lead) { lead.classList.add("hz8-ppc__lead"); ovBody.appendChild(lead); }
    if (ASSET_BASE) ov.insertAdjacentHTML("beforeend", '<figure class="hz8-ppc__ovimg" aria-hidden="true"><img src="' + esc(ASSET_BASE + "campaign-thca.jpg") + '" alt="" width="800" height="800" loading="lazy" decoding="async"></figure>');
    chap.appendChild(ov);

    /* 2-3. Produktinformation | Innehåll och analys (en rad på desktop). */
    var grid = node("div", "hz8-ppc__grid"); chap.appendChild(grid);
    var facts = node("div", "hz8-ppc__facts"); facts.id = "hz8-ppc-facts"; facts.setAttribute("data-hz8-hide-empty", "");
    facts.innerHTML = '<dl data-hz8-facts="facts" aria-label="Produktfakta"></dl>';
    if (article) {
      var info = chapter("hz8-ppc-info", "Produktinformation", "hz8-ppc--info", { mobile: "Produktfakta", icon: "list", collapsible: true });
      adoptDescription(article, lead);
      /* Produkttextens egna "Etikett: värde"-rader. Innehållsrader
         (halt, mängd, förvaring) visas under Innehåll och analys; rader
         som upprepar varumärket visas inte igen. */
      var brandTxt = ((document.querySelector(".product-detail__information .brand a") || {}).textContent || "").trim().toLowerCase();
      var specs = specRows(article).filter(function (r) { return r[1].trim().toLowerCase() !== brandTxt; });
      S.contentSpecs = specs.filter(function (r) { return CONTENT_LABEL.test(r[0]); });
      S.otherSpecs = specs.filter(function (r) { return !CONTENT_LABEL.test(r[0]); });
      hideSpecList(article);
      var wrap = node("div", "hz8-ppc__textwrap"); wrap.id = "hz8-ppc-textwrap";
      var text = node("div", "hz8-ppc__text"); text.id = "hz8-ppc-text"; text.appendChild(article); wrap.appendChild(text);
      wrap.insertAdjacentHTML("beforeend", '<button type="button" class="hz8-ppc__more" aria-expanded="false" aria-controls="hz8-ppc-text" hidden><span>Visa mer om produkten</span>' + ICON.arrow + "</button>");
      info.querySelector(".hz8-ppc__body").appendChild(wrap);
      grid.appendChild(info);
    }
    ovBody.appendChild(facts);
    var ana = chapter("hz8-ppc-analys", "Innehåll och analys", "hz8-ppc--analys", { icon: "flask", collapsible: true });
    var a = analysisLink();
    /* Rapportlänk bara när produkten har en verklig rapport; ingen batch,
       inget datum eller labb som inte finns i datan. */
    ana.querySelector(".hz8-ppc__body").innerHTML = '<dl class="hz8-ppc__dl" data-hz8-facts="content"></dl>' +
      (a ? '<p class="hz8-ppc__report"><a class="hz8-ppc__reportlink" href="' + esc(a.href) + '" target="_blank" rel="noopener">' + ICON.doc + "<span>Visa " + (/labbrapport/i.test(a.textContent) ? "labbrapport" : "full analys") + (/\.pdf(\?|$)/i.test(a.href) ? " (PDF)" : "") + "</span>" + ICON.arrow + "</a></p>" : "");
    if (factRows("content").length || a) grid.appendChild(ana);
    /* 4. Leverans och retur: en tunn rad i full bredd. */
    var del = chapter("hz8-ppc-leverans", "Leverans och retur", "hz8-ppc--leverans", { icon: "truck", collapsible: true });
    del.querySelector(".hz8-ppc__body").innerHTML = deliveryHtml();
    chap.appendChild(del);
    syncLedger();

    /* 5. Passar till (kompletterande tillbehör, före omdömena -- bara när
       83-pdp-purchase hittar verifierad kompatibilitet; asynkront). */
    var fit = node("div", "hz8-ppc__fit"); host.appendChild(fit);
    var moveCompat = function () { var c = document.querySelector(".hz8-pdp-compat"); if (c && c.parentNode !== fit) { fit.appendChild(c); var t = c.querySelector(".hz8-prail__title, h2"); if (t) t.textContent = "Passar till"; } };
    moveCompat(); window.setTimeout(moveCompat, 2500); window.setTimeout(moveCompat, 5000);

    /* 6. Omdömen (fylls när Nyehandels omdömen laddats). Stabilt ID för
       ankarlänken vid betyget ovanför vecket. */
    var rev = node("div", "hz8-ppc__reviews"); rev.id = "omdomen"; host.appendChild(rev);
    var count = +((((document.querySelector(".accordion-button#product-reviews") || {}).textContent || "").match(/\((\d+)\)/) || [])[1] || 0);
    loadReviews(count).then(function (list) {
      var html = list && list.length ? reviewsHtml(list) : "";
      if (!html) { rev.remove(); syncStation(); return; }
      rev.innerHTML = html;
      var cta = document.querySelector(".nh-review-cta a[href]");
      if (cta) rev.querySelector(".hz8-pr__foot").insertAdjacentHTML("beforeend", '<a class="hz8-pr__leave" href="' + esc(cta.getAttribute("href")) + '" target="_blank" rel="noopener">' + esc(cta.textContent.trim()) + "</a>");
      var all = rev.querySelector(".hz8-pr__all"), full = rev.querySelector(".hz8-pr__full");
      all.addEventListener("click", function () {
        var open = all.getAttribute("aria-expanded") === "true";
        if (!full.__done) { full.innerHTML = list.map(reviewItem).join(""); full.__done = true; }
        full.hidden = open; all.setAttribute("aria-expanded", String(!open));
        all.firstChild.textContent = open ? "Läs alla " + list.length + " omdömen " : "Visa färre omdömen ";
      });
      syncStation();
    });

    /* 7. Liknande produkter: bara alternativ i samma produkttyp, efter
       omdömena (kunden leds inte bort innan förtroendet etablerats). */
    var sim = document.querySelector(".product-page-lists__similar-products");
    if (sim) {
      host.appendChild(sim);
      var typeWord = function (n) { return (nameParts(n).type.split(/\s+/)[0] || "").toLowerCase(); };
      var type = typeWord(productName());
      var filterSim = function () {
        var shown = 0;
        sim.querySelectorAll(".product-card").forEach(function (c) {
          var nm = c.querySelector(".name");
          /* Nyehandel dubbelkodar "&" i vissa namn -- visa riktig text. */
          if (nm && nm.textContent.indexOf("&amp;") !== -1) nm.textContent = nm.textContent.replace(/&amp;/g, "&");
          c.querySelectorAll("img[alt], [aria-label]").forEach(function (el) { ["alt", "aria-label"].forEach(function (k) { var v = el.getAttribute(k); if (v && v.indexOf("&amp;") !== -1) el.setAttribute(k, v.replace(/&amp;/g, "&")); }); });
          var n = ((nm || {}).textContent || "").trim();
          var t = typeWord(n);
          var keep = !type || !t || t === type;
          var cell = c.parentNode && c.parentNode !== sim && !c.parentNode.classList.contains("products") ? c.parentNode : c;
          cell.hidden = !keep; if (keep) shown++;
        });
        sim.hidden = shown === 0;
      };
      filterSim(); window.setTimeout(filterSim, 1500);
    }
    /* 8. Kategorier + varumärkeslänk (riktiga <a href>). Kategori vars
       namn är ett formats namn men pekar på en annan route än formatets
       etablerade sida (t.ex. "Vapes" -> vapes-ny när Vapes = alla-vapes)
       döljs -- annars två konkurrerande taxonomier. */
    var rel = document.querySelector(".related-categories");
    if (rel) {
      host.appendChild(rel);
      var formats = (HZ8.catalog && HZ8.catalog.build().formats) || [];
      rel.querySelectorAll("a[href]").forEach(function (link) {
        var t = link.textContent.trim().toLowerCase();
        var f = formats.filter(function (x) { return x.label.toLowerCase() === t; })[0];
        if (f && HZ8.path(f.href) !== HZ8.path(link.href)) (link.closest(".tag") || link).hidden = true;
      });
      var band = document.querySelector(".hz8-pdp-brand a[href]");
      var brandName = ((document.querySelector(".product-detail__information .brand a") || {}).textContent || "").trim();
      if (band && brandName) rel.insertAdjacentHTML("beforeend", '<p class="hz8-pp-brandlink"><a href="' + esc(band.getAttribute("href")) + '">Alla produkter från ' + esc(brandName) + "</a></p>");
    }
    /* 9. Kundservice. */
    var help = document.querySelector(".hz8-pdp-help");
    if (help) host.appendChild(help);
    /* 10. Senast besökta: utan aktuell produkt, dold under två andra. */
    var syncRecent = function () {
      var rec = document.querySelector(".product-page-lists__recently-visited-products");
      if (!rec) return;
      var here = HZ8.path(location.href).split("?")[0].replace(/\/\d+$/, "");
      var others = 0;
      rec.querySelectorAll(".product-card").forEach(function (c) {
        var a2 = c.querySelector("a[href]"); var same = a2 && HZ8.path(a2.getAttribute("href")).split("?")[0].replace(/\/\d+$/, "") === here;
        var cell = c.parentNode && !c.parentNode.classList.contains("products") ? c.parentNode : c;
        cell.hidden = !!same; if (!same) others++;
      });
      rec.hidden = others < 2;
    };
    syncRecent(); window.setTimeout(syncRecent, 3000);
    /* Visa mer: samma text expanderas på plats (finns redan i DOM). */
    var textEl = document.getElementById("hz8-ppc-text"), more = document.querySelector(".hz8-ppc__more");
    if (textEl && more) {
      more.addEventListener("click", function () {
        var o = more.getAttribute("aria-expanded") === "true";
        more.setAttribute("aria-expanded", String(!o));
        more.firstChild.textContent = o ? (MOBILE.matches ? "Läs mer" : "Visa mer om produkten") : "Visa mindre";
        textEl.classList.toggle("is-clamped", o);
        if (o && textEl.getBoundingClientRect().top < 0) textEl.scrollIntoView({ block: "start", behavior: reduced() ? "auto" : "smooth" });
      });
    }
    syncLayout();
    if (more && more.getAttribute("aria-expanded") !== "true") more.firstChild.textContent = MOBILE.matches ? "Läs mer" : "Visa mer om produkten";
    window.setTimeout(balance, 1500);
    var rt = 0;
    window.addEventListener("resize", function () { window.clearTimeout(rt); rt = window.setTimeout(balance, 150); }, { passive: true });
    MOBILE.addEventListener("change", function () {
      syncLayout();
      if (more && more.getAttribute("aria-expanded") !== "true") more.firstChild.textContent = MOBILE.matches ? "Läs mer" : "Visa mer om produkten";
    });
    host.addEventListener("click", function (e) {
      var b = e.target.closest(".hz8-ppc__toggle"); if (!b) return;
      var body = document.getElementById(b.getAttribute("aria-controls")); var o = b.getAttribute("aria-expanded") === "true";
      b.setAttribute("aria-expanded", String(!o)); body.hidden = o;
      if (!o) balance();
    });
  }

  /* Utvalda omdömen: det senaste högst betygsatta och det senaste med
     lägre betyg. Varumärkesregel (CLAUDE.md): texter med rus-/effekt-
     eller hälsopåståenden lyfts inte fram här -- de finns kvar orörda i
     den fullständiga recensionslistan. */
  var EFFECT_WORDS = /smak|njut|skit|jävl|fan\b|sten(ad|ade)|hög\b|high|kick|rus|ångest|sömn|sova|smärt|värk|medicin|potent|effekt|tryck|bloss|peek|peak|pigg|mysig|satisfaction|stark|svag|lugn|avslapp|indika|sativa|soffan|natten/i;
  /* Publicerbara: inga effekt-/hälsopåståenden, inget "smak", inget
     olämpligt språk. Senaste med lägre betyg först om ett sådant finns,
     annars de två senaste. Finns inga: bara fördelning + länk. */
  function pickReviews(list) {
    var seen = {};
    var ok = list.filter(function (r) {
      var key = String(r.review || "").replace(/\s+/g, " ").trim().toLowerCase();
      if (!key || key.length <= 12 || EFFECT_WORDS.test(key) || seen[key]) return false;
      seen[key] = true; // samma text inskickad två gånger visas en gång
      return true;
    }).sort(function (a, b) { return String(b.created_at).localeCompare(String(a.created_at)); });
    var low = ok.filter(function (r) { return r.rating < 5; })[0];
    var top = ok.filter(function (r) { return r.rating === 5; });
    return (low ? [top[0], low, top[1]] : top.slice(0, 3)).filter(Boolean);
  }
  function fmtDate(iso) {
    var d = new Date(iso);
    return isNaN(d) ? "" : d.toLocaleDateString("sv-SE", { day: "numeric", month: "short", year: "numeric" });
  }
  /* Ett omdöme -- kundens text oförändrad. Ingen "verifierat köp" eller
     köpt strain (finns inte i datan). */
  function reviewItem(r, card) {
    var initial = String(r.anonymous ? "?" : r.name || "?").trim().charAt(0).toUpperCase();
    return '<li class="' + (card ? "hz8-pr__card" : "hz8-pr__row") + '"><div class="hz8-pr__who"><span class="hz8-pr__av" aria-hidden="true">' + esc(initial) + '</span><div><span class="hz8-pr__stars" role="img" aria-label="' + r.rating + ' av 5"><span style="width:' + (r.rating * 20) + '%"></span></span>' +
      '<span class="hz8-pr__meta">' + esc(r.anonymous ? "Anonym" : r.name) + " · " + esc(fmtDate(r.created_at)) + "</span></div></div><p>" + esc(r.review) + "</p>" + (r.store_reply ? '<p class="hz8-pr__reply"><span>Svar från butiken:</span> ' + esc(r.store_reply) + "</p>" : "") + "</li>";
  }
  function reviewsHtml(list) {
    if (!list || !list.length) return "";
    var n = list.length;
    var dist = [5, 4, 3, 2, 1].map(function (s) { return [s, list.filter(function (r) { return Math.round(r.rating) === s; }).length]; });
    var avg = list.reduce(function (a, r) { return a + r.rating; }, 0) / n;
    var a = avg.toFixed(1).replace(".", ",");
    var picks = pickReviews(list);
    return '<section class="hz8-pr" id="hz8-pr" aria-labelledby="hz8-pr-title"><div class="hz8-pr__head"><h2 id="hz8-pr-title">' + ICON.star + "Omdömen</h2><p>" + a + " (" + n + ")</p></div>" +
      '<div class="hz8-pr__body"><div class="hz8-pr__dist"><ul aria-label="Betygsfördelning">' + dist.map(function (d) {
        var pct = Math.round(d[1] / n * 100);
        return '<li><span class="hz8-pr__s">' + d[0] + ' <span aria-hidden="true">★</span><span class="hz8-visually-hidden"> stjärnor</span></span><span class="hz8-pr__bar" aria-hidden="true"><span style="width:' + pct + '%"></span></span><span class="hz8-pr__n">' + pct + ' %<span class="hz8-visually-hidden"> (' + d[1] + " omdömen)</span></span></li>";
      }).join("") + "</ul></div>" +
      (picks.length ? '<ul class="hz8-pr__cards" data-picks="' + esc(picks.map(function (r) { return r.name + "@" + r.created_at; }).join("|")) + '">' + picks.map(function (r) { return reviewItem(r, true); }).join("") + "</ul>" : "") + "</div>" +
      '<div class="hz8-pr__foot"><button type="button" class="hz8-pr__all" aria-expanded="false" aria-controls="hz8-pr-full">Läs alla ' + n + " omdömen " + ICON.arrow + "</button></div>" +
      '<ul class="hz8-pr__full" id="hz8-pr-full" hidden></ul></section>';
  }

  /* Analys/batch: bara med en verklig produktspecifik rapportlänk i
     produktens egen text (länktext eller adress nämner analys/COA/lab). */
  function analysisLink() {
    /* Produkttexten kan redan ha flyttats in i kapitlet (.hz8-ppc__text). */
    var links = document.querySelectorAll("#product-page .short-description a[href], #product-information a[href], .hz8-ppc__text a[href]");
    return Array.prototype.filter.call(links, function (a) {
      return /(analys|labbrapport|certifikat|\bcoa\b|certificate of analysis)/i.test(a.textContent + " " + a.getAttribute("href")) && !/folkhalsomyndigheten/i.test(a.href);
    })[0] || null;
  }

  function build() {
    var info = document.querySelector(".product-detail__information");
    var detail = document.querySelector(".product-detail");
    var h1 = info && info.querySelector("h1");
    if (!info || !detail || !h1 || info.querySelector(".hz8-pp")) return;
    document.documentElement.classList.add("hz8-pdp-pilot");
    /* Nyehandel dubbelkodar "&" i vissa namn -- visa den riktiga texten. */
    if (h1.textContent.indexOf("&amp;") !== -1) h1.textContent = h1.textContent.replace(/&amp;/g, "&");
    /* Radbrytning: bindestrecket följer ordet före ("45% -" / "Faraoh"),
       så att ingen rad börjar med "-". Samma tecken, bara hårt mellanslag. */
    if (/ [-–] /.test(h1.textContent)) h1.textContent = h1.textContent.replace(/ ([-–]) /g, "\u00a0$1 ");
    var st = node("section", "hz8-pp");
    st.setAttribute("aria-label", "Köp");
    st.innerHTML = stationHtml();
    h1.parentNode.insertBefore(st, h1.nextSibling);
    bindStation(st);
    bindCarousel(st);
    buildTheatre();
    /* Nyehandels slider räknar bildbredd i px vid start -- räkna om efter
       pilotlayouten (samma resize-hantering som vid fönsterändring). */
    window.dispatchEvent(new Event("resize"));
    window.setTimeout(function () { window.dispatchEvent(new Event("resize")); }, 400);
    buildChapters(detail);
    buildSticky();
    syncStation();
    HZ8.watch(function () { syncStation(); syncThumbs(); syncLedger(); });
    var sel = nativeSelect();
    if (sel) sel.addEventListener("change", function () { window.setTimeout(function () { syncStation(); syncLedger(); }, 60); });
    window.addEventListener("resize", syncSticky, { passive: true });
    /* Bakåt/framåt och bfcache: stationen följer Nyehandels variant-URL. */
    ["popstate", "pageshow"].forEach(function (ev) { window.addEventListener(ev, function () { window.setTimeout(function () { syncStation(); syncLedger(); }, 120); }); });
  }

  var ASSET_BASE = "";
  HZ8.register("pdp-pilot", function (context) {
    if (context.page !== "product" || !HZ8.isPdpPilot()) return;
    ASSET_BASE = context.assetBase || "";
    document.documentElement.classList.add("hz8-pdp-pilot");
    domValues();
    build();
    /* Stationen och bildplattan visas när strainlistan/datan finns (eller
       senast efter 2,5 s) -- inget synligt hopp när Vue fyller listan. */
    var built = Date.now();
    var ready = function () {
      var left = 520 - (Date.now() - built); // efter sliderns sista omräkning (resize vid 0 och 400 ms)
      if (left > 0) return window.setTimeout(ready, left);
      syncStation();
      var sf0 = document.querySelector(".hz8-pp__strains");
      if (sf0) { revealSelected(sf0, false); syncCarousel(sf0); }
      window.requestAnimationFrame(function () { document.documentElement.classList.add("hz8-pp-ready"); });
    };
    var t0 = Date.now();
    (function poll() {
      if (S.values.length || S.product || !nativeSelect() && document.querySelector(".buy-form, .buy-controls")) {
        if (!S.values.length) domValues();
        return window.setTimeout(ready, 60);
      }
      if (Date.now() - t0 > 2500) return ready();
      window.setTimeout(poll, 50);
    })();
    /* API-svaret förfinar lager per strain, pristrappa per variant och
       variantnamn; misslyckas det fortsätter stationen på sidans egen data. */
    loadState().then(function () { syncStation(); syncLedger(); }).catch(function () {});
  });
})();
