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
    drop: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3.5c3 3.6 5.5 6.8 5.5 10a5.5 5.5 0 0 1-11 0c0-3.2 2.5-6.4 5.5-10z"/></svg>',
    help: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.4a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.7M12 16.9v.1"/></svg>',
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
    h += '<div class="hz8-pp__builder" role="group" aria-labelledby="hz8-pp-builder-title" hidden><div class="hz8-pp__bhead"><button type="button" class="hz8-pp__btoggle" aria-expanded="true" aria-controls="hz8-pp-bslots">' + ICON.box + '<span class="hz8-pp__btoggle-t"></span>' + ICON.chev + '</button><p id="hz8-pp-builder-title" class="hz8-pp__btitle"></p><span class="hz8-pp__count" aria-live="polite"></span><button type="button" class="hz8-pp__fill"></button></div>' +
      '<ol class="hz8-pp__slots" id="hz8-pp-bslots"></ol><p class="hz8-pp__mixnote" hidden></p></div>';
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
        /* Högst ett märke: "Bäst värde" (lägsta styckpris i Nyehandels
           pristrappa). "Populärast" kräver försäljningsdata som saknas;
           besparingen står i kortet. */
        var badge = t === best && t !== tiers[0] ? '<span class="hz8-pp__badge is-best">Bäst värde</span>' : "";
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
    /* Mobil (V5): byggaren hopfälld som "Bygg ditt N-pack" när paketet är
       komplett med en strain; öppen så fort något kräver ett val. */
    var attention = ps.missing.length > 0 || ps.mixed || B.manual;
    var collapsed = MOBILE.matches && !B.open && !attention;
    host.classList.toggle("is-collapsed", collapsed);
    var tg = host.querySelector(".hz8-pp__btoggle");
    tg.setAttribute("aria-expanded", String(!collapsed));
    tg.querySelector(".hz8-pp__btoggle-t").textContent = "Bygg ditt " + size + "-pack";
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
    sticky.innerHTML = '<img class="hz8-pp-sticky__img" alt="" width="44" height="44" hidden><p class="hz8-pp-sticky__sum"><span class="hz8-pp-sticky__price"></span><span class="hz8-pp-sticky__sel"></span></p><button type="button" class="hz8-pp-sticky__cta">Lägg i varukorgen</button>';
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
    /* Längre ned tar kapitelnavigeringen över platsen -- aldrig båda. */
    var show = !!(sticky.__past && cta && !cta.hidden && window.matchMedia("(max-width: 1023px)").matches && !overlayOpen() && !document.documentElement.classList.contains("hz8-ppnav-deep") && !document.documentElement.classList.contains("hz8-pp-nearfoot") && !document.documentElement.classList.contains("hz8-pp-to-product"));
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
    /* Produktens riktiga huvudbild som miniatyr (dekorativ). */
    var main = document.querySelector("#product-slides img"), im = sticky.querySelector(".hz8-pp-sticky__img"), src = main && (main.currentSrc || main.src);
    if (src && im.getAttribute("src") !== src) { im.src = src; im.hidden = false; }
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
    /* A Light: dekorativt eko av den aktiva riktiga bilden bakom den skarpa
       (oskarp, blek, maskad i CSS) -- samma URL, ingen ny storlek, ingen
       egen nätverkshämtning (webbläsarens cache återanvänds). */
    var slider = media.querySelector(".product-image-slider");
    if (slider && !media.querySelector(".hz8-pp-stage-echo")) {
      var echo = document.createElement("img");
      echo.className = "hz8-pp-stage-echo";
      echo.alt = "";
      echo.setAttribute("aria-hidden", "true");
      echo.setAttribute("draggable", "false");
      echo.decoding = "async";
      echo.addEventListener("error", function () { echo.hidden = true; });
      slider.parentNode.insertBefore(echo, slider);
      /* Bildbyte (miniatyr, pil, svep) ändrar bara klassen på sliden --
         följ användarens egna händelser i stället för en ny observer. */
      var echoRaf = 0;
      var later = function () { if (!echoRaf) echoRaf = window.requestAnimationFrame(function () { echoRaf = 0; syncStageEcho(media); }); };
      ["click", "keyup", "transitionend"].forEach(function (ev) { media.addEventListener(ev, later, { passive: true }); });
      if (STAGE_MQ.addEventListener) STAGE_MQ.addEventListener("change", function () { syncStageEcho(media); });
    }
    syncStageEcho(media);
    /* Trasig/saknad bild: neutral brunn med samma mått (ingen ersättningsbild). */
    media.querySelectorAll("#product-slides img").forEach(function (img) {
      var mark = function () { media.classList.add("hz8-pp-img-broken"); syncStageEcho(media); };
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
  /* Ekot används bara på desktop i contained-läge (CSS döljer det annars);
     src sätts bara när den aktiva bildens URL faktiskt ändrats. */
  var STAGE_MQ = window.matchMedia("(min-width: 1024px)");
  function syncStageEcho(media) {
    media = media || document.querySelector(".hz8-pp-theatre");
    var echo = media && media.querySelector(".hz8-pp-stage-echo");
    if (!echo) return;
    if (!STAGE_MQ.matches || media.classList.contains("hz8-pp-immersive") || media.classList.contains("hz8-pp-img-broken")) { echo.hidden = true; return; }
    var img = media.querySelector("#product-slides .slide.is-active img, #product-slides .slide.active img") || media.querySelector("#product-slides .slide img");
    var src = img && (img.currentSrc || img.src);
    if (!src) { echo.hidden = true; return; }
    if (echo.src !== src) { echo.hidden = false; echo.src = src; }
    else if (echo.hidden && echo.complete && echo.naturalWidth) echo.hidden = false;
  }
  function syncThumbs() {
    document.querySelectorAll(".hz8-pp-theatre #product-thumbnails .thumb").forEach(function (t) { t.setAttribute("aria-pressed", t.classList.contains("active") ? "true" : "false"); });
  }

  /* ---------------- Under köpet (PDP facit V5) ----------------
     Läsordning: Kort om produkten (köpdelens vänstra kolumn, under
     bilden) -> fyra SEO-säkra <details> (innehållet i DOM från start,
     fungerar utan JS) -> Passar till -> Omdömen -> Liknande produkter ->
     kategorier -> Kundservice. Statiska plattformsnoder (produkttexten,
     Liknande produkter, kategorier, kundservice) flyttas; Vue-ägda
     komponenter (accordion, native recensioner) lämnas orörda och döljs. */
  function productName() { return ((document.querySelector(".product-detail__information h1") || {}).textContent || (S.product && S.product.name) || "").replace(/ /g, " ").trim(); }
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
  var MOBILE = window.matchMedia("(max-width: 767px)");
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
    return '<ul class="hz8-acc__del">' + items.map(function (r) { return '<li><span class="hz8-acc__delico">' + ICON[r[0]] + "</span><div><h3>" + esc(r[1]) + "</h3><p>" + esc(r[2]) + "</p></div></li>"; }).join("") + "</ul>" +
      '<p class="hz8-acc__links"><a href="' + esc(HZ8.link("/sv/page/kop-och-leveransvillkor")) + '">Köp- och leveransvillkor</a><a href="' + esc(HZ8.link("/sv/page/faq")) + '">Vanliga frågor</a></p>';
  }
  /* Produkttextens egna rubriker hamnar under H2 Produktfakta: en nivå
     ned (h2 -> 3, h3 -> 4). Rubriken som bara upprepar produktnamnet
     ("Beskrivning av <namn>") döljs. */
  function adoptDescription(article, intro) {
    var name = productName().toLowerCase();
    article.querySelectorAll("h1, h2, h3, h4, h5").forEach(function (h) {
      var t = h.textContent.replace(/\s+/g, " ").trim().toLowerCase();
      if (/^beskrivning av /.test(t) && t.indexOf(name.slice(0, 12)) !== -1) { h.hidden = true; return; }
      var lv = +h.tagName.charAt(1);
      h.setAttribute("role", "heading"); h.setAttribute("aria-level", lv <= 2 ? "3" : "4");
    });
    /* Ingressen står överst i Produktfakta; samma stycke i den långa
       texten tas bort (texten finns kvar i DOM, en gång). */
    if (intro) {
      var norm = function (el) { return el.textContent.replace(/\s+/g, " ").trim(); };
      var paras = Array.prototype.map.call(intro.matches("p") ? [intro] : intro.querySelectorAll("p"), norm).filter(Boolean);
      article.querySelectorAll("p").forEach(function (p) { if (paras.indexOf(norm(p)) !== -1) p.remove(); });
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
  /* Kort om produkten: de första meningarna ur den verifierade ingressen
     (hela stycket står överst i Produktfakta) -- aldrig klippt mitt i en
     mening, ingen fade. */
  function excerpt(text) {
    var parts = String(text || "").replace(/\s+/g, " ").trim().match(/[^.!?]+[.!?]+(?=\s|$)/g);
    if (!parts) return String(text || "").trim();
    var out = "";
    for (var i = 0; i < parts.length; i++) { if (out && (out + parts[i]).length > 200) break; out += parts[i]; }
    return out.trim();
  }
  /* Högst tre faktacues, bara ur produktens egna data (namn, produkttyp). */
  function cueRows() {
    var np = nameParts(productName());
    var typ = (S.otherSpecs || []).filter(function (r) { return /produkttyp/i.test(r[0]); })[0];
    var cues = [];
    if (np.content) cues.push(["leaf", np.content.replace(/(\d)%/, "$1 %")]);
    if (np.size) cues.push(["drop", np.size]);
    var t = typ ? typ[1].split("/")[0].trim() : np.type;
    if (t) cues.push(["box", t]);
    return cues.slice(0, 3);
  }
  /* Miljöbild för Kort om produkten (generell botanisk miljö, aldrig
     produktbild). Övergången görs med CSS-mask, inte i bilden. */
  /* Kort om produkten bär ingen egen bild längre: plantan och dess
     kastskugga är CSS-lager (85-pdp-pilot.css, samma WebP för båda). */
  function buildSummary(host, lead) {
    var text = lead ? excerpt(lead.textContent) : "";
    var cues = cueRows();
    if (!text && !cues.length) return null;
    var sum = node("section", "hz8-ppsum");
    sum.id = "hz8-ppsum";
    sum.setAttribute("aria-labelledby", "hz8-ppsum-h");
    sum.innerHTML = '<h2 class="hz8-ppsum__h" id="hz8-ppsum-h"><span class="hz8-ppsum__ico">' + ICON.leaf + "</span>Kort om produkten</h2>" +
      (text ? '<p class="hz8-ppsum__lead">' + esc(text) + "</p>" : "") +
      (cues.length ? '<ul class="hz8-ppsum__cues" aria-label="I korthet">' + cues.map(function (c) { return "<li>" + ICON[c[0]] + "<span>" + esc(c[1]) + "</span></li>"; }).join("") + "</ul>" : "");
    sum.innerHTML = '<div class="hz8-ppsum__text">' + sum.innerHTML + "</div>";
    host.appendChild(sum);
    return sum;
  }
  /* En disclosure: <details> med H2 i <summary>. Innehållet ligger i DOM
     redan stängt (sök/indexering, Ctrl+F) och öppnas utan JS. */
  function acc(id, title, icon, open) {
    var d = node("details", "hz8-acc hz8-acc--" + id);
    d.id = "hz8-acc-" + id;
    if (open) d.open = true;
    d.innerHTML = '<summary class="hz8-acc__sum"><span class="hz8-acc__ico">' + ICON[icon] + '</span><h2 class="hz8-acc__h" id="hz8-acc-' + id + '-h">' + esc(title) + '</h2><span class="hz8-acc__mark" aria-hidden="true"></span></summary>' +
      '<div class="hz8-acc__body" id="hz8-acc-' + id + '-b" role="region" aria-labelledby="hz8-acc-' + id + '-h"></div>';
    return d;
  }
  /* Vanliga frågor: butikens egna, publicerade svar (/sv/page/faq),
     ordagrant -- de frågor som gäller produkten, leveransen och köpet.
     Hämtas vid sidladdning, inte vid klick; misslyckas det döljs raden. */
  var FAQ_PICK = [/labbtestade/i, /THC-halten/i, /lagliga i Sverige/i, /Hur snabbt/i, /diskret/i, /åldersgräns/i];
  function loadFaq(box) {
    var body = box.querySelector(".hz8-acc__body");
    return fetch(HZ8.link("/sv/page/faq"), { credentials: "same-origin" }).then(function (r) { return r.ok ? r.text() : ""; }).then(function (html) {
      var doc = new DOMParser().parseFromString(html || "", "text/html");
      var items = Array.prototype.slice.call(doc.querySelectorAll("details"));
      var picked = FAQ_PICK.map(function (re) { return items.filter(function (d) { var s = d.querySelector("summary"); return s && re.test(s.textContent); })[0]; }).filter(Boolean);
      if (!picked.length) { box.remove(); return; }
      body.innerHTML = '<ul class="hz8-acc__faq">' + picked.map(function (d) {
        var q = d.querySelector("summary").textContent.replace(/\s+/g, " ").trim();
        var a = d.querySelector(".nh-faq__a") || d;
        var clean = a.cloneNode(true); var s2 = clean.querySelector("summary"); if (s2) s2.remove();
        /* Bara text, <strong> och riktiga länkar följer med. */
        clean.querySelectorAll("*").forEach(function (el) { if (!/^(STRONG|B|A|EM|BR)$/.test(el.tagName)) el.replaceWith.apply(el, el.childNodes); else Array.prototype.slice.call(el.attributes).forEach(function (at) { if (!(el.tagName === "A" && at.name === "href")) el.removeAttribute(at.name); }); });
        return "<li><h3>" + esc(q) + "</h3><p>" + clean.innerHTML.replace(/\s+/g, " ").trim() + "</p></li>";
      }).join("") + "</ul>" + '<p class="hz8-acc__links"><a href="' + esc(HZ8.link("/sv/page/faq")) + '">Alla vanliga frågor</a></p>';
    }).catch(function () { box.remove(); });
  }
  /* ---- Bästsäljare just nu (se buildBelow) ---- */
  function loadBestsellers(box, sim) {
    if (!HZ8.bestsellerSource) { box.remove(); return; }
    var here = HZ8.path(location.href).split("?")[0].replace(/\/\d+$/, "");
    var pathOf = function (href) { return HZ8.path(href || "").split("?")[0].replace(/\/\d+$/, ""); };
    HZ8.fetchPage("/sv/page/vara-bastsaljare", HZ8.bestsellerSource).then(function (bs) {
      var src = bs.cat ? "/sv/categories/" + bs.cat : bs.source;
      if (!src) throw new Error("ingen källa");
      if (!bs.fixed) src += (src.indexOf("?") === -1 ? "?" : "&") + "sort=popular";
      return HZ8.fetchPage(src, HZ8.categoryCards);
    }).then(function (cards) {
      var taken = {}; taken[here] = true;
      if (sim) sim.querySelectorAll(".product-card a[href*='/products/']").forEach(function (a) { taken[pathOf(a.getAttribute("href"))] = true; });
      var rows = [];
      cards.forEach(function (c) {
        var d = document.createElement("div"); d.innerHTML = c.html;
        var a = d.querySelector("a[href*='/products/']"), name = d.querySelector(".name"), brand = d.querySelector(".brand"), price = d.querySelector(".price ins, .price"), img = d.querySelector("img");
        if (!a || !name || !brand || !price) return;
        var path = pathOf(a.getAttribute("href")), nm = name.textContent.replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
        if (taken[path] || /frakt|avgift|presentkort|batteri/i.test(nm)) return;
        taken[path] = true;
        rows.push({ href: a.getAttribute("href"), name: nm, brand: brand.textContent.trim(), price: price.textContent.replace(/\s+/g, " ").trim(), img: img ? img.getAttribute("src") : "" });
      });
      rows = rows.slice(0, 6);
      if (rows.length < 2) { box.remove(); return; }
      box.innerHTML = '<div class="hz8-ppbest__head"><h2 class="hz8-ppbest__h" id="hz8-ppbest-h">Bästsäljare just nu</h2><a class="hz8-ppbest__all" href="' + esc(HZ8.link("/sv/page/vara-bastsaljare")) + '">Alla bästsäljare' + ICON.arrow + "</a></div>" +
        '<ul class="hz8-ppbest__list" role="list">' + rows.map(function (r) {
          return '<li><a class="hz8-ppbest__item" href="' + esc(r.href) + '">' + (r.img ? '<span class="hz8-ppbest__img"><img src="' + esc(r.img) + '" alt="" width="56" height="56" loading="lazy" decoding="async"></span>' : "") +
            '<span class="hz8-ppbest__txt"><span class="hz8-ppbest__brand">' + esc(r.brand) + '</span><span class="hz8-ppbest__name">' + esc(r.name) + '</span><span class="hz8-ppbest__price">' + esc(r.price) + "</span></span></a></li>";
        }).join("") + "</ul>";
      box.hidden = false;
      bindBestNav(box);
    }).catch(function () { box.remove(); });
  }

  /* Bästsäljarraden: två små pilar i rubrikraden (före "Alla bästsäljare"),
     ett kort + gap per steg, avstängda vid kanterna, dolda utan overflow. */
  function bindBestNav(box) {
    var list = box.querySelector(".hz8-ppbest__list"), head = box.querySelector(".hz8-ppbest__head"), all = box.querySelector(".hz8-ppbest__all");
    if (!list || !head || box.querySelector(".hz8-ppbest__nav")) return;
    var navEl = node("div", "hz8-ppbest__nav");
    navEl.setAttribute("role", "group"); navEl.setAttribute("aria-label", "Bläddra bland bästsäljare");
    navEl.innerHTML = '<button type="button" class="hz8-ppbest__btn" data-dir="-1" aria-label="Föregående bästsäljare" aria-controls="hz8-ppbest-list">' + ICON.arrow + "</button>" +
      '<button type="button" class="hz8-ppbest__btn" data-dir="1" aria-label="Nästa bästsäljare" aria-controls="hz8-ppbest-list">' + ICON.arrow + "</button>";
    list.id = "hz8-ppbest-list";
    head.insertBefore(navEl, all || null);
    var btns = navEl.querySelectorAll("button"), reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    function step() { var li = list.querySelector("li"); if (!li) return list.clientWidth; var gap = parseFloat(getComputedStyle(list).columnGap) || 0; return li.getBoundingClientRect().width + gap; }
    function syncBest() {
      var max = list.scrollWidth - list.clientWidth;
      navEl.hidden = max <= 2;
      var had = document.activeElement;
      btns[0].disabled = list.scrollLeft <= 2;
      btns[1].disabled = list.scrollLeft >= max - 2;
      /* En avstängd knapp tappar fokus -- lämna det till den andra pilen. */
      if (had === btns[0] && btns[0].disabled && !btns[1].disabled) btns[1].focus();
      else if (had === btns[1] && btns[1].disabled && !btns[0].disabled) btns[0].focus();
    }
    Array.prototype.forEach.call(btns, function (b) {
      b.addEventListener("click", function () {
        var dir = +b.getAttribute("data-dir"), st = step();
        var target = Math.round((list.scrollLeft + dir * st) / st) * st;
        list.scrollTo({ left: Math.max(0, target), behavior: reduce.matches ? "auto" : "smooth" });
      });
    });
    var r = 0; var later = function () { if (!r) r = window.requestAnimationFrame(function () { r = 0; syncBest(); }); };
    list.addEventListener("scroll", later, { passive: true });
    window.addEventListener("resize", later, { passive: true });
    list.querySelectorAll("img").forEach(function (im) { im.addEventListener("load", later); });
    syncBest(); window.setTimeout(syncBest, 400);
  }

  /* ---- Kapitelnavigering + Till toppen ----
     Originalraden ligger efter Kort om produkten. När den lämnat vyn:
     desktop -> kompakt kopia under headern (följer headerns semisticky
     läge); mobil/platta -> kompakt rad längst ned som ersätter köpbaren
     (aldrig båda). Aldrig över footer, dialog, meny eller varukorg.
     Till toppen efter ~1,75 vyer, ovanför eventuell bottenkontroll. */
  /* Stabilt, unikt ankare direkt före produktytan (Vue-ägd .product-detail
     -- ankaret ligger utanför den och läggs tillbaka om en omritning tar
     bort det). */
  function ensureProductAnchor() {
    var detail = document.querySelector(".product-detail");
    if (!detail || !detail.parentNode) return null;
    var a = document.getElementById("produkt");
    if (!a) { a = node("span", "hz8-pp-anchor"); a.id = "produkt"; a.setAttribute("aria-hidden", "true"); }
    if (a.nextElementSibling !== detail) detail.parentNode.insertBefore(a, detail);
    return a;
  }
  function bindChapterNav(host) {
    var nav = document.getElementById("hz8-ppnav");
    if (!nav) return;
    var html = document.documentElement;
    /* "Produkt" är vägen tillbaka till bild, val, pris och huvud-CTA
       (ersätter Översikt; Kort om produkten ligger kvar i flödet). */
    ensureProductAnchor();
    var items = [
      ["produkt", "Produkt", "produkt"],
      ["hz8-acc-produktfakta", "Fakta", "fakta"],
      ["omdomen", "Omdömen", "omdomen"],
      ["liknande", "Liknande", "liknande"]
    ];
    var render = function () {
      var have = items.filter(function (it) { return document.getElementById(it[0]); });
      var h = have.map(function (it) { return '<li><a class="hz8-ppnav__a" href="#' + it[0] + '" data-k="' + it[2] + '">' + esc(it[1]) + "</a></li>"; }).join("");
      [nav, dock].forEach(function (n) { var ul = n.querySelector("ul"); if (ul.__h !== h) { ul.innerHTML = h; ul.__h = h; } });
      return have;
    };
    var dock = node("div", "hz8-ppnav-dock");
    dock.innerHTML = '<nav class="hz8-ppnav hz8-ppnav--dock" aria-label="Kapitel på sidan (snabbval)"><ul class="hz8-ppnav__list" role="list"></ul></nav>';
    dock.setAttribute("aria-hidden", "true"); dock.inert = true;
    document.body.appendChild(dock);
    var top = node("button", "hz8-totop");
    top.type = "button"; top.setAttribute("aria-label", "Till toppen"); top.innerHTML = ICON.chev;
    top.setAttribute("aria-hidden", "true"); top.tabIndex = -1;
    document.body.appendChild(top);
    var have = render();
    /* Omdömen och Liknande kommer asynkront. */
    var rt = 0; HZ8.watch(function () { window.clearTimeout(rt); rt = window.setTimeout(function () { have = render(); observe(); }, 120); });
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    var narrow = window.matchMedia("(max-width: 1023px)");
    function go(e) {
      var a = e.target.closest && e.target.closest(".hz8-ppnav__a");
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      var t = document.getElementById(a.getAttribute("href").slice(1)); if (!t) return;
      e.preventDefault();
      if (location.hash !== a.getAttribute("href")) history.pushState(null, "", a.getAttribute("href"));
      if (a.getAttribute("data-k") === "produkt") { toProduct(true); setActive("produkt"); return; }
      t.scrollIntoView({ behavior: reduce.matches ? "auto" : "smooth", block: "start" });
      var f = t.querySelector("summary, h2") || t; if (f.tagName !== "SUMMARY" && !f.hasAttribute("tabindex")) f.setAttribute("tabindex", "-1"); f.focus({ preventScroll: true });
      setActive(a.getAttribute("data-k"));
    }
    nav.addEventListener("click", go); dock.addEventListener("click", go);
    var active = "";
    function setActive(k) {
      if (k === active) return; active = k;
      [nav, dock].forEach(function (n) { n.querySelectorAll(".hz8-ppnav__a").forEach(function (a) { if (a.getAttribute("data-k") === k) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); }); });
    }
    /* Aktivt kapitel = sista kapitlet vars topp passerat en linje 40 % ned
       i vyn (beräknat ur läget; en låg stängd accordion missades annars). */
    function spy() {
      /* Närmast ovanför linjen vinner (navigeringens ordning skiljer sig
         från sidans: Liknande ligger före Omdömen). */
      var line = window.innerHeight * .4, cur = "", best = -Infinity;
      have.forEach(function (it) { var el = document.getElementById(it[0]); if (!el) return; var t = el.getBoundingClientRect().top; if (t <= line && t > best) { best = t; cur = it[2]; } });
      setActive(cur);
    }
    function observe() { spy(); }
    window.addEventListener("scroll", function () { window.requestAnimationFrame(spy); }, { passive: true });
    observe();
    /* Mobil/platta: ett bottenlager åt gången, styrt av ett tillstånd med
       hysteres (inte av en ögonblicksmätning mitt i en smooth scroll):
       - köp: köpbaren enligt sin egen logik (ordinarie CTA ovanför vyn);
       - kapitel: docken. Går in när översikten är passerad (dess botten
         ovanför headerlinjen) eller direkt vid klick på en kapitellänk /
         laddning med kapitelankare; går ut först när översiktens topp åter
         ligger under 60 % av vyn (användaren har scrollat upp ovanför
         kapitlet). Ankarhopp nedåt kan därför aldrig vända läget.
       - nearFoot: footern närmar sig -> båda döljs. Overlays döljer båda.
       Desktop: ingen docka. */
    var deep = false, nearFoot = false;
    var sumEl = document.getElementById("hz8-ppsum") || nav;
    var HDR = 80;
    new IntersectionObserver(function (en) {
      var e = en[0]; if (!e.isIntersecting && e.boundingClientRect.bottom < HDR) { deep = true; sync(); }
    }, { rootMargin: "-" + HDR + "px 0px 0px 0px" }).observe(sumEl);
    new IntersectionObserver(function (en) {
      var e = en[0]; if (!e.isIntersecting && e.boundingClientRect.top > 0 && Date.now() > lockUntil) { deep = false; sync(); }
    }, { rootMargin: "0px 0px -40% 0px" }).observe(sumEl);
    var chapterIds = items.map(function (it) { return it[0]; }).filter(function (id) { return id !== "produkt"; });
    /* Tillbaka till produkten: köpbaren hålls borta under hela hoppet
       (annars passerar CTA:n "ovanför vyn" på vägen upp och baren blinkar);
       docken lämnar när översikten passerat 60 %-gränsen. Läget släpps när
       scrollen stannat -- därefter visas köpbaren först när användaren på
       nytt scrollar förbi den ordinarie CTA:n. */
    var settle = 0;
    function toProduct(smooth) {
      var anchor = ensureProductAnchor(); if (!anchor) return;
      html.classList.add("hz8-pp-to-product");
      lockUntil = 0;
      anchor.scrollIntoView({ behavior: smooth && !reduce.matches ? "smooth" : "auto", block: "start" });
      var h1 = document.querySelector(".product-detail__information h1");
      if (h1) { if (!h1.hasAttribute("tabindex")) h1.setAttribute("tabindex", "-1"); h1.focus({ preventScroll: true }); }
      window.clearTimeout(settle); settle = window.setTimeout(release, 2200);
      sync();
    }
    function release() { window.clearTimeout(settle); html.classList.remove("hz8-pp-to-product"); sync(); }
    window.addEventListener("scroll", function () {
      if (!html.classList.contains("hz8-pp-to-product")) return;
      window.clearTimeout(settle); settle = window.setTimeout(release, 180);
    }, { passive: true });
    /* Klick/hash: kapitelläget hålls under hela ankarscrollen (även uppåt
       mot Översikt, där översiktens topp kortvarigt kan ligga under 60 %). */
    var lockUntil = 0;
    function enterChapters() { deep = true; lockUntil = Date.now() + 1500; sync(); }
    var chapterClick = function (e) { var a = e.target.closest(".hz8-ppnav__a"); if (a && a.getAttribute("data-k") !== "produkt") enterChapters(); };
    nav.addEventListener("click", chapterClick, true);
    dock.addEventListener("click", chapterClick, true);
    function fromHash() {
      if (location.hash === "#produkt") { toProduct(false); return; }
      if (chapterIds.indexOf(location.hash.slice(1)) !== -1) enterChapters();
    }
    /* Direktladdning med #produkt: ankaret skapas av skriptet, efter
       webbläsarens egen hashscroll. */
    if (location.hash === "#produkt") { window.setTimeout(function () { toProduct(false); }, 250); window.setTimeout(function () { toProduct(false); }, 900); }
    window.addEventListener("hashchange", fromHash);
    window.addEventListener("popstate", fromHash);
    window.setTimeout(function () {
      var r = sumEl.getBoundingClientRect();
      if (r.bottom < HDR || (chapterIds.indexOf(location.hash.slice(1)) !== -1 && r.top < window.innerHeight * .6)) enterChapters();
    }, 0);
    function sync() {
      /* Samma två gränser, kontrollerade geometriskt: ett direkt hopp förbi
         en gräns (Home/End, ankare, återställd scroll) korsar den aldrig och
         ger då ingen observerhändelse. Hysteresen gör att inget vänder mitt
         i ett hopp: in under headerlinjen, ut först under 60 %. */
      var sr = sumEl.getBoundingClientRect();
      if (!deep && sr.bottom < HDR) deep = true;
      else if (deep && sr.top > window.innerHeight * .6 && Date.now() > lockUntil) deep = false;
      var on = narrow.matches && deep && !nearFoot && !overlayOpen();
      if (dock.classList.contains("is-on") !== on) {
        dock.classList.toggle("is-on", on); dock.setAttribute("aria-hidden", on ? "false" : "true"); dock.inert = !on;
      }
      html.classList.toggle("hz8-ppnav-deep", deep && narrow.matches);
      html.classList.toggle("hz8-pp-nearfoot", nearFoot);
      var y = window.scrollY, showTop = y > window.innerHeight * 1.75 && !overlayOpen() && !nearFoot;
      if (top.classList.contains("is-on") !== showTop) { top.classList.toggle("is-on", showTop); top.setAttribute("aria-hidden", showTop ? "false" : "true"); top.tabIndex = showTop ? 0 : -1; }
      if (typeof syncSticky === "function") syncSticky();
    }
    var foot = document.querySelector(".hz8-footer, footer.page-footer");
    if (foot) new IntersectionObserver(function (en) { nearFoot = en[0].isIntersecting; sync(); }, { rootMargin: "0px 0px 24px 0px" }).observe(foot);
    var raf = 0;
    window.addEventListener("scroll", function () { if (!raf) raf = window.requestAnimationFrame(function () { raf = 0; sync(); }); }, { passive: true });
    if (narrow.addEventListener) narrow.addEventListener("change", sync);
    new MutationObserver(function () { window.requestAnimationFrame(sync); }).observe(document.body, { attributes: true, subtree: true, attributeFilter: ["class", "aria-modal", "open"] });
    top.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduce.matches ? "auto" : "smooth" });
      var h1 = document.querySelector(".product-detail__information h1");
      if (h1) { if (!h1.hasAttribute("tabindex")) h1.setAttribute("tabindex", "-1"); h1.focus({ preventScroll: true }); }
    });
  }

  function buildBelow(detail) {
    if (document.querySelector(".hz8-ppc")) return;
    var host = node("div", "hz8-ppc");
    detail.parentNode.insertBefore(host, detail.nextSibling);
    var shortDesc = document.querySelector(".product-detail__information .short-description");
    var article = document.querySelector("#product-information article.product-description");
    /* Ingress = första riktiga stycket (kort beskrivning i första hand). */
    var firstP = function (root) { return root ? Array.prototype.filter.call(root.querySelectorAll("p"), function (p) { return p.textContent.trim().length > 40; })[0] || null : null; };
    var lead = firstP(shortDesc) || firstP(article);
    if (article) {
      adoptDescription(article, lead);
      var brandTxt = ((document.querySelector(".product-detail__information .brand a") || {}).textContent || "").trim().toLowerCase();
      var specs = specRows(article).filter(function (r) { return r[1].trim().toLowerCase() !== brandTxt; });
      S.contentSpecs = specs.filter(function (r) { return CONTENT_LABEL.test(r[0]); });
      S.otherSpecs = specs.filter(function (r) { return !CONTENT_LABEL.test(r[0]); });
      hideSpecList(article);
    }
    S.summary = buildSummary(host, lead);
    /* In-page navigation: riktiga ankare till kapitlen (sticky-kopian
       byggs i bindChapterNav). */
    host.insertAdjacentHTML("beforeend", '<nav class="hz8-ppnav" id="hz8-ppnav" aria-label="Kapitel på sidan"><ul class="hz8-ppnav__list" role="list"></ul></nav>');

    /* Fyra disclosures. Innehåll och analys är kapitlets gröna material
       och står öppen på desktop. */
    var list = node("div", "hz8-acc-list"); host.appendChild(list);
    var facts = acc("produktfakta", "Produktfakta", "list", false), fb = facts.querySelector(".hz8-acc__body");
    if (lead) { lead.classList.add("hz8-acc__lead"); fb.appendChild(lead); }
    if (article) { var text = node("div", "hz8-acc__text"); text.appendChild(article); fb.appendChild(text); }
    fb.insertAdjacentHTML("beforeend", '<div class="hz8-acc__facts" data-hz8-hide-empty><h3>Specifikationer</h3><dl class="hz8-acc__dl" data-hz8-facts="facts"></dl></div>');
    list.appendChild(facts);
    var a = analysisLink();
    if (factRows("content").length || a) {
      var ana = acc("analys", "Innehåll och analys", "flask", !MOBILE.matches);
      /* Rapportlänk bara när produkten har en verklig rapport; ingen
         batch, inget datum eller labb som inte finns i datan. */
      ana.querySelector(".hz8-acc__body").innerHTML = '<dl class="hz8-acc__dl" data-hz8-facts="content"></dl>' +
        (a ? '<p class="hz8-acc__report"><a class="hz8-ppc__reportlink" href="' + esc(a.href) + '" target="_blank" rel="noopener">' + ICON.doc + "<span>Visa " + (/labbrapport/i.test(a.textContent) ? "labbrapport" : "full analys") + (/\.pdf(\?|$)/i.test(a.href) ? " (PDF)" : "") + "</span>" + ICON.arrow + "</a></p>" : "") +
        (ASSET_BASE ? '<figure class="hz8-acc__leaf" aria-hidden="true"><img src="' + esc(ASSET_BASE + "trust-environment-2026-10/trust-environment-desktop-v1.webp") + '" alt="" width="1672" height="941" loading="lazy" decoding="async"></figure>' : "");
      list.appendChild(ana);
    }
    var del = acc("leverans", "Leverans och retur", "truck", false);
    del.querySelector(".hz8-acc__body").innerHTML = deliveryHtml();
    list.appendChild(del);
    var faq = acc("faq", "Vanliga frågor", "help", false);
    list.appendChild(faq); loadFaq(faq);
    syncLedger();

    /* Bra tillsammans med: i köpstationen, bara när 83-pdp-purchase hittar
       verifierad kompatibilitet (cart -> CCELL-batteri). Aldrig för
       engångsvapes (ingen sådan relation finns i datan). Dold vid 3/5-pack. */
    var fit = node("div", "hz8-pp__fit"); fit.hidden = true;
    var st0 = document.querySelector(".hz8-pp"); if (st0) st0.appendChild(fit);
    var moveCompat = function () {
      var c = document.querySelector(".hz8-pdp-compat"); if (!c || c.parentNode === fit) return;
      fit.appendChild(c); fit.hidden = false;
      var t = c.querySelector(".hz8-prail__title, h2"); if (t) t.textContent = "Bra tillsammans med";
    };
    moveCompat(); window.setTimeout(moveCompat, 2500); window.setTimeout(moveCompat, 5000);

    /* Liknande produkter: bara alternativ i samma produkttyp, efter
       omdömena (kunden leds inte bort innan förtroendet etablerats).
       Varumärkeslänken står i sektionens rubrikrad (V5). */
    var sim = document.querySelector(".product-page-lists__similar-products");
    var band = document.querySelector(".hz8-pdp-brand a[href]");
    var brandName = ((document.querySelector(".product-detail__information .brand a") || {}).textContent || "").trim();
    if (sim) {
      host.appendChild(sim);
      if (!sim.id) sim.id = "liknande";
      var simHead = sim.querySelector("h2");
      if (simHead && band && brandName) simHead.insertAdjacentHTML("afterend", '<a class="hz8-pp-brandlink" href="' + esc(band.getAttribute("href")) + '">Alla produkter från ' + esc(brandName) + ICON.arrow + "</a>");
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
    /* Bästsäljare just nu: butikens egna bästsäljarurval (/page/vara-
       bastsaljare, Nyehandels sortering "Mest populära" -- samma källa
       som startsidan). Bara kort med pris och varumärke, utan aktuell
       produkt och utan produkter som redan står i Liknande produkter.
       Ingen källa -> ingen sektion. */
    var bestBox = node("section", "hz8-ppbest"); bestBox.id = "hz8-ppbest"; bestBox.hidden = true;
    bestBox.setAttribute("aria-labelledby", "hz8-ppbest-h");
    host.appendChild(bestBox);
    loadBestsellers(bestBox, sim);

    /* Omdömen (fylls när Nyehandels omdömen laddats). Stabilt ID för
       ankarlänken vid betyget ovanför vecket. */
    var rev = node("div", "hz8-ppc__reviews"); rev.id = "omdomen"; host.appendChild(rev);
    var count = +((((document.querySelector(".accordion-button#product-reviews") || {}).textContent || "").match(/\((\d+)\)/) || [])[1] || 0);
    loadReviews(count).then(function (list2) {
      var html = list2 && list2.length ? reviewsHtml(list2) : "";
      if (!html) { rev.remove(); syncStation(); return; }
      rev.innerHTML = html;
      var cta = document.querySelector(".nh-review-cta a[href]");
      if (cta) rev.querySelector(".hz8-pr__foot").insertAdjacentHTML("beforeend", '<a class="hz8-pr__leave" href="' + esc(cta.getAttribute("href")) + '" target="_blank" rel="noopener">' + esc(cta.textContent.trim()) + "</a>");
      var all = rev.querySelector(".hz8-pr__all"), full = rev.querySelector(".hz8-pr__full");
      all.addEventListener("click", function () {
        var open = all.getAttribute("aria-expanded") === "true";
        if (!full.__done) { full.innerHTML = list2.map(reviewItem).join(""); full.__done = true; }
        full.hidden = open; all.setAttribute("aria-expanded", String(!open));
        all.firstChild.textContent = open ? "Läs alla " + list2.length + " omdömen " : "Visa färre omdömen ";
      });
      syncStation();
    });

    /* Kategorier (riktiga <a href>). Kategori vars namn är ett formats
       namn men pekar på en annan route än formatets etablerade sida (t.ex.
       "Vapes" -> vapes-ny när Vapes = alla-vapes) döljs -- annars två
       konkurrerande taxonomier. */
    var rel = document.querySelector(".related-categories");
    if (rel) {
      host.appendChild(rel);
      var formats = (HZ8.catalog && HZ8.catalog.build().formats) || [];
      rel.querySelectorAll("a[href]").forEach(function (link) {
        var t = link.textContent.trim().toLowerCase();
        var f = formats.filter(function (x) { return x.label.toLowerCase() === t; })[0];
        if (f && HZ8.path(f.href) !== HZ8.path(link.href)) (link.closest(".tag") || link).hidden = true;
      });
      if (!(sim && sim.querySelector(".hz8-pp-brandlink")) && band && brandName) rel.insertAdjacentHTML("beforeend", '<p class="hz8-pp-brandlink"><a href="' + esc(band.getAttribute("href")) + '">Alla produkter från ' + esc(brandName) + "</a></p>");
    }
    /* Kundservice. */
    var help = document.querySelector(".hz8-pdp-help");
    if (help) host.appendChild(help);
    /* Senast besökta: utan aktuell produkt, dold under två andra. */
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
      /* Tom listbehållare (Liknande produkter flyttad, senast besökta dold)
         ska inte lämna luft mellan kundservicebandet och footern. */
      var lists = rec.closest(".product-page-lists");
      if (lists) lists.hidden = rec.hidden && !Array.prototype.some.call(lists.querySelectorAll(".product-card"), function (c) { return c.offsetParent && !rec.contains(c); });
    };
    syncRecent(); window.setTimeout(syncRecent, 3000);
    bindChapterNav(host);
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
    st.addEventListener("click", function (e) {
      if (!e.target.closest(".hz8-pp__btoggle")) return;
      B.open = e.target.closest(".hz8-pp__btoggle").getAttribute("aria-expanded") !== "true";
      syncStation();
    });
    buildTheatre();
    /* Nyehandels slider räknar bildbredd i px vid start -- räkna om efter
       pilotlayouten (samma resize-hantering som vid fönsterändring). */
    window.dispatchEvent(new Event("resize"));
    window.setTimeout(function () { window.dispatchEvent(new Event("resize")); }, 400);
    buildBelow(detail);
    buildSticky();
    syncStation();
    HZ8.watch(function () {
      syncStation(); syncThumbs(); syncStageEcho(); syncLedger();
      /* Kort om produkten ligger i Vue-ägda .product-detail: tillbaka om
         en omritning tar bort den. */
      var d = document.querySelector(".product-detail");
      var hostEl = document.querySelector(".hz8-ppc");
      if (S.summary && hostEl && !hostEl.contains(S.summary)) hostEl.insertBefore(S.summary, hostEl.firstChild);
      if (document.getElementById("hz8-ppnav")) ensureProductAnchor();
    });
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
