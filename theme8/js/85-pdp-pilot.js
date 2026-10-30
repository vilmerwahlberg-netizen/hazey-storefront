/* Universell produktsida (TASK 10B, från Faraoh-piloten PDP MASTER V1,
   2026-10-13): EN kapabilitetsstyrd mall på Nyehandels riktiga
   produktdata för varje kundvänd produkt. Vakt: produkten har ett
   varumärke (.brand a) -- tjänsteposter och olistade poster utan
   varumärke lämnas till plattformen (82/83). ?hz8-pdp=0 stänger av
   adaptern för jämförelse. Klassnamnen (hz8-pdp-pilot, hz8-pp*) är
   kvar från piloten.

   Kapabilitetsprofil (HZ8.pdpProfile): variantmodell (simple / strain /
   size / color / generic) och etikett (doft + strain = "Strain", farg =
   "Färg", vikt = "Vikt"), lager (in-stock / partial / sold-out) ur
   HZ8.variantOrderable (02-shared.js, samma definition som korten och
   83:s slutsåld-skydd från TASK 10B-0), analys (verifierad PDF per
   produkt eller vald variant, annars "Labbrapport skickas på
   begäran") och paket (endast riktiga paketprodukter, se PACKAGES).

   Allt härleds live ur /frontend-api/product/state (varianter, lager,
   pristrappa, bilder), sidans egen DOM (namn, betyg, varumärke) och
   /frontend-api/product-reviews/{id}. Nyehandels egna kontroller är
   sanningen: strainval = native <select>, antal = native +/-, köp =
   native köpknapp (Vue:s egen cart/addVariant).

   Paket (TASK 10B-3): bara riktiga, verifierade paketprodukter i
   Nyehandel (is_package, fast pris) -- se PACKAGE_PRODUCTS. Saknas de
   visas inga paket; ?hz8-pkg-review=1 visar migreringsplanen spärrad
   (BLOCKED). Nyehandels −15/−20 %-trappa är legacy och används aldrig. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  var productId = null;
  function readProductId() {
    if (productId === null) productId = +(document.documentElement.innerHTML.match(/viewProduct\(.(\d+)/) || [])[1] || 0;
    return productId;
  }
  var ADAPTER_OFF = /[?&]hz8-pdp=0/.test(location.search);
  /* Kundvänd produkt = varumärke i Nyehandels serverrenderade köpdel.
     (Namnet på funktionen är kvar från piloten; 82/83 läser den.) */
  HZ8.isPdpPilot = function () {
    if (!/\/products\//.test(location.pathname) || ADAPTER_OFF) return false;
    return !!document.querySelector(".product-detail__information .brand a");
  };
  HZ8.isPdpAdapter = HZ8.isPdpPilot;

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
  /* Ett köpbarhetsbeslut för station, strainval, sticky och paket:
     HZ8.variantOrderable (02-shared.js; TASK 10B-0). Före API-svaret:
     sidans egen lagerstatus. */
  function isBuyable(v) {
    if (!S.product) return !document.querySelector("#stock:not(.is-positive)");
    return HZ8.variantOrderable(v);
  }
  function stockOf(v) { return !v || !isBuyable(v) ? 0 : (!v.track_inventory || v.always_orderable ? Infinity : Math.max(0, v.available_stock || 0)); }
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
    if (variantModel() !== "strain") return "";
    var t = "Strains är varianter av samma produkt – inte olika " + (nameParts(((document.querySelector(".product-detail__information h1") || {}).textContent || "").replace(/\u00a0/g, " ")).type.toLowerCase() || "produkt") + "produkter.";
    if (S.product && S.values.length > 1) {
      var sigs = S.values.map(function (x) { var u = x.variant && x.variant.price ? x.variant.price.formatted_price : ""; return u; });
      if (sigs.every(function (g) { return g && g === sigs[0]; })) t += " Priset är detsamma för alla strains.";
    }
    return t;
  }
  /* Variantmodell ur alternativets namn i Nyehandel (aldrig ur produkt-
     namnet): doft och strain visas båda som strain (beslut 2026-10-29),
     farg som färg, vikt/storlek/volym som storlek med pris per värde. */
  function optionKey() { return String(S.optionName || "").toLowerCase().replace(/[^a-zåäö]/g, ""); }
  function variantModel() {
    if (S.values.length < 2) return "simple";
    var k = optionKey();
    if (/^(strain|doft)$/.test(k)) return "strain";
    if (/^(vikt|storlek|volym)$/.test(k)) return "size";
    if (/^(farg|färg)$/.test(k)) return "color";
    return "generic";
  }
  var LABELS = { strain: ["strain", "strains"], color: ["färg", "färger"], vikt: ["vikt", "vikter"], storlek: ["storlek", "storlekar"], volym: ["volym", "volymer"] };
  function labelPair() {
    var m = variantModel(), k = optionKey();
    if (m === "strain" || m === "simple" && /^(strain|doft)$/.test(k)) return LABELS.strain;
    if (m === "color") return LABELS.color;
    if (LABELS[k]) return LABELS[k];
    var n = String(S.optionName || "").trim().toLowerCase();
    return n ? [n, "alternativ"] : ["alternativ", "alternativ"];
  }
  function label() { return labelPair()[0]; }
  function labelPlural() { return labelPair()[1]; }

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
  var B = { pack: 1, qty: 1, slots: [], busy: false, msg: "", manual: false };

  /* ---------------- Paket (TASK 10B-3) ----------------
     Paketsteg kommer ENDAST ur riktiga paketprodukter i Nyehandel
     (product.is_package) med fast pris, verifierade i varukorg och kassa
     (pris, rader, lagerdrag). Varje paketprodukt läses live ur
     product/state: is_package, köpbar variant och pris -- inget pris
     beräknas och ingen procentregel finns. Nyehandels −15/−20 %-trappa
     per variantrad är legacy (beslut 2026-10-29) och används aldrig.

     Modeller (data, inte UI-fall): same (samma variant × N), strain
     (blandade strains ur produktens egna varianter, en plats per enhet),
     family (strains ur separata produkter i en familj), collection (en av
     varje), threeForTwo. Steg som 1/3/5, 1/3/5/10, 1/5/10, Hela
     kollektionen och 3 för 2 är bara olika rader i datan.

     PACKAGE_PRODUCTS: produkt-id -> [{ kind, qty, packageId, verified }].
     Tom tills paketprodukterna är skapade i admin OCH verifierade; bara
     verified: true visas och kan köpas. Utan dem: ingen paketväljare.

     Granskningsläge (?hz8-pkg-review=1): migreringsplanen (PACKAGE_PLAN,
     ur WooCommerce -- bara modell och stegstruktur, aldrig priser) visas
     spärrad: "Paketprodukt saknas", byggaren med en plats per enhet,
     slutsålda synliga men inte valbara, köpknappen avstängd. */
  var PKG_REVIEW = /[?&]hz8-pkg-review=1/.test(location.search);
  var PACKAGE_PRODUCTS = {};
  /* Familjer (WooCommerce "familjebyggare") med Nyehandel-motsvarighet
     (Task 10A woo-pdp-matrix.json, match "säker"). Medlemmarnas namn och
     lager läses live. */
  var FAMILIES = {
    ms50: { name: "Magic Sauce 50 % – 5 g", members: {
      84: "/sv/products/buds-magic-sauce-50-samurai-jack-5-gram", 59: "/sv/products/buds-magic-sauce-50-yoda-ice-cream-5-gram",
      60: "/sv/products/buds-magic-sauce-50-gorilla-cookies-5-gram", 74: "/sv/products/buds-magic-sauce-50-tinky-winky-5-gram",
      93: "/sv/products/buds-magic-sauce-50-khalifa-kush-5-gram", 96: "/sv/products/buds-magic-sauce-50-donny-burger-5-gram",
      100: "/sv/products/buds-magic-sauce-50-crazy-dog-5-gram", 120: "/sv/products/buds-magic-sauce-50-la-chupacabra-5-gram",
      77: "/sv/products/hash-magic-sauce-50-marrakesh-dream-5-gram", 119: "/sv/products/hash-magic-sauce-50-charas-5-gram" } },
    nano11: { name: "Nano11 – 5 g", members: { 41: "/sv/products/buds-7-nano11-lemon-purple-5-gram", 112: "/sv/products/buds-7-nano11-raspberry-popcorn-5-gram" } }
  };
  /* Stegkod: "3" = 3 st, "9K" = hela kollektionen (9 st), "3F2" = 3 för 2. */
  var PACKAGE_PLAN = (function () {
    var plan = { 91: { model: "strain", steps: ["3", "5", "9K"] }, 92: { model: "strain", steps: ["3", "5", "9K"] } };
    [84, 59, 60, 74, 93, 96, 100, 120, 77, 119].forEach(function (id) { plan[id] = { model: "family", family: "ms50", steps: ["3", "5", "10"] }; });
    [41, 112].forEach(function (id) { plan[id] = { model: "family", family: "nano11", steps: ["3", "5", "10"] }; });
    return plan;
  })();
  /* Minicarten (84-cart.js, TASK 15) läser SAMMA register -- en källa
     för paketprodukter, migreringsplan och familjer, ingen kopia. */
  HZ8.packageRegistry = { products: PACKAGE_PRODUCTS, plan: PACKAGE_PLAN, families: FAMILIES, review: PKG_REVIEW };
  var PK = { steps: [], plan: null, family: [], loaded: false };
  function stepOf(code, model) {
    var m = String(code).match(/^(\d+)(K|F2)?$/);
    var kind = m[2] === "K" ? "collection" : m[2] === "F2" ? "threeForTwo" : model;
    return { qty: +m[1], kind: kind, review: false };
  }
  function fetchState(id) {
    return fetch("/frontend-api/product/state", { method: "POST", credentials: "same-origin", headers: HZ8.apiHeaders(), body: JSON.stringify({ product_id: +id, variant_ids: [null] }) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
  }
  function loadFamily(key) {
    var fam = FAMILIES[key];
    if (!fam) return Promise.resolve();
    return Promise.all(Object.keys(fam.members).map(function (id) {
      return fetchState(id).then(function (d) {
        var P2 = d.product || {}, v = (P2.variants || [])[0];
        return v ? { id: String(id), name: String(P2.name || "").replace(/&amp;/g, "&"), route: fam.members[id], variant: v, ok: HZ8.variantOrderable(v) } : null;
      }, function () { return null; });
    })).then(function (rows) {
      PK.family = rows.filter(Boolean); PK.familyName = fam.name;
      /* Kort namn i byggaren: led som alla medlemmar delar ("Magic Sauce
         50%", "5 gram") tas bort -- kvar blir t.ex. "Buds · Samurai Jack". */
      var parts = PK.family.map(function (m) { return m.name.split(/\s+[-–]\s+/); });
      var common = parts.length > 1 ? parts[0].filter(function (seg) { return parts.every(function (p2) { return p2.indexOf(seg) !== -1; }); }) : [];
      PK.family.forEach(function (m, i) { var rest = parts[i].filter(function (seg) { return common.indexOf(seg) === -1; }); m.short = rest.length ? rest.join(" · ") : m.name; });
    });
  }
  function loadPackages() {
    var pid = readProductId();
    var list = PACKAGE_PRODUCTS[pid] || [];
    return Promise.all(list.map(function (e) {
      return fetchState(e.packageId).then(function (d) {
        var P2 = d && d.product, v = P2 && (P2.variants || [])[0];
        if (!P2 || P2.is_package !== true || !v || !HZ8.variantOrderable(v) || !v.price) return null;
        return { qty: +e.qty, kind: e.kind, packageId: e.packageId, variantId: v.id, price: parseKr(v.price.formatted_price), formatted: v.price.formatted_price, verified: e.verified === true, review: false };
      }, function () { return null; });
    })).then(function (rows) {
      var steps = rows.filter(function (x) { return x && x.verified; }).sort(function (a, b) { return a.qty - b.qty; });
      PK.plan = PACKAGE_PLAN[pid] || null;
      /* Kollektion = en av varje av produktens egna strains i Nyehandel
         (planens antal kommer från WooCommerce och kan skilja -- då
         rapporteras avvikelsen, platserna följer Nyehandels sortiment). */
      if (!steps.length && PKG_REVIEW && PK.plan) steps = PK.plan.steps.map(function (c) {
        var st = stepOf(c, PK.plan.model); st.review = true;
        if (st.kind === "collection" && S.values.length > 1) { st.plannedQty = st.qty; st.qty = S.values.length; }
        return st;
      });
      /* Stegen visas först när familjens produkter är lästa. */
      var fam = steps.some(function (x) { return x.kind === "family"; }) && PK.plan && PK.plan.family;
      return (fam ? loadFamily(PK.plan.family) : Promise.resolve()).then(function () { PK.steps = steps; });
    }).then(function () { PK.loaded = true; syncStation(); }, function () { PK.loaded = true; });
  }
  /* Steg identifieras av modell + antal (en kollektion kan ha samma antal
     som ett vanligt steg). B.step = vald nyckel, B.pack = dess antal. */
  function stepKey(x) { return x.one ? "1" : x.kind + ":" + x.qty; }
  function currentStep() { return B.step ? PK.steps.filter(function (x) { return stepKey(x) === B.step; })[0] || null : null; }
  function reviewPack() { var c = currentStep(); return !!(c && c.review); }
  packageProfile = function () {
    var real = PK.steps.filter(function (x) { return !x.review; }), plan = PACKAGE_PLAN[readProductId()] || null;
    return { model: plan ? plan.model : null, plannedSteps: plan ? plan.steps : [], verifiedSteps: real.map(function (x) { return x.qty; }),
      status: real.length ? "PASS" : plan ? "BLOCKED" : "none", review: PKG_REVIEW,
      collectionMismatch: PK.steps.filter(function (x) { return x.plannedQty && x.plannedQty !== x.qty; }).map(function (x) { return "plan " + x.plannedQty + " st (WooCommerce), Nyehandel " + x.qty + " strains"; })[0] || null, family: PK.family.map(function (m) { return m.name + (m.ok ? "" : " (slut)"); }) };
  };
  /* Byggarens alternativ: hela sortimentet, slutsålda synliga men inte
     valbara. Familj = familjens produkter, annars produktens varianter. */
  function builderOptions() {
    var c = currentStep();
    if (c && c.kind === "family") return PK.family.map(function (m) { return { id: m.id, name: m.short || m.name, ok: m.ok, stock: m.ok ? stockOf(m.variant) : 0, variant: m.variant }; });
    return S.values.map(function (x) { return { id: x.id, name: x.name, ok: isBuyable(x.variant), stock: stockOf(x.variant), variant: x.variant }; });
  }
  function optName(id) { var o = builderOptions().filter(function (x) { return x.id === id; })[0]; return o ? o.name : valueName(id); }
  /* Antal (utan paket): högst lagret, aldrig fler än 99. */
  function maxQty() { var n = stockOf(currentVariant()); return Math.max(1, Math.min(99, n === Infinity ? 99 : n)); }
  function buyableValues() { return S.values.filter(function (x) { return isBuyable(x.variant); }); }
  /* Ett valt paketsteg styr köpzonen direkt -- även innan byggarens
     alternativ hunnit laddas (då är köpet spärrat, aldrig 1 st i tysthet). */
  function builderActive() { return !!currentStep(); }
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
  function stationHtml() {
    /* Lager + betyg på en rad under H1 (Faraoh-referensen). */
    var h = '<div class="hz8-pp__status"><p class="hz8-pp__stock" aria-live="polite"></p><div class="hz8-pp__meta"></div></div>';
    /* Strainsektionen fylls i syncStation (data kan komma efter bygget). */
    h += '<fieldset class="hz8-pp__group hz8-pp__strains" hidden><legend class="hz8-pp__legend"><span class="hz8-pp__legend-text"></span><button type="button" class="hz8-pp__info" aria-expanded="false" aria-controls="hz8-pp-help"><svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true" focusable="false"><circle cx="10" cy="10" r="7.5"/><path d="M10 9v5M10 6.3v.1" stroke-linecap="round"/></svg><span class="hz8-visually-hidden">Vad är en strain?</span></button></legend><p class="hz8-pp__help" id="hz8-pp-help" hidden></p>' +
      /* Karusell: en rad, scroll-snap per kort, pilar vid radens kanter
         (dämpade/inaktiva vid start och slut), ingen autoplay. */
      '<div class="hz8-pp__car"><button type="button" class="hz8-pp__carbtn" data-dir="-1" aria-label="Föregående strains" aria-controls="hz8-pp-tiles">' + ICON.chev + '</button>' +
      '<div class="hz8-pp__tiles" id="hz8-pp-tiles" role="group"></div>' +
      '<button type="button" class="hz8-pp__carbtn" data-dir="1" aria-label="Nästa strains" aria-controls="hz8-pp-tiles">' + ICON.chev + '</button></div>' +
      '<p class="hz8-pp__carstatus" aria-hidden="true"></p></fieldset>';
    h += '<fieldset class="hz8-pp__group hz8-pp__packs" hidden><legend class="hz8-pp__legend">Välj förpackning</legend><div class="hz8-pp__packlist" role="radiogroup" aria-label="Välj förpackning"></div><p class="hz8-pp__pknote" hidden></p></fieldset>';
    /* Byggare: en rad per position (nummer, strain, Ändra). Ingen H2 --
       den hör till köpformuläret, inte sidans kapitelstruktur. */
    h += '<div class="hz8-pp__builder" role="group" aria-labelledby="hz8-pp-builder-title" hidden><div class="hz8-pp__bhead"><button type="button" class="hz8-pp__btoggle" aria-expanded="true" aria-controls="hz8-pp-bslots">' + ICON.box + '<span class="hz8-pp__btoggle-t"></span>' + ICON.chev + '</button><p id="hz8-pp-builder-title" class="hz8-pp__btitle"></p><span class="hz8-pp__count" aria-live="polite"></span><button type="button" class="hz8-pp__fill"></button></div>' +
      '<ol class="hz8-pp__slots" id="hz8-pp-bslots"></ol><p class="hz8-pp__mixnote" hidden></p></div>';
    h += '<div class="hz8-pp__sum"><p class="hz8-pp__total"><span class="hz8-pp__price"></span><del class="hz8-pp__cmp" hidden></del><span class="hz8-pp__unit"></span><span class="hz8-pp__save"></span></p></div>';
    h += '<div class="hz8-pp__buy"><div class="hz8-pp__qty" role="group" aria-label="Antal"><button type="button" class="hz8-pp__qbtn" data-step="-1" aria-label="Minska antalet">−</button><output class="hz8-pp__qval" aria-live="polite">1</output><button type="button" class="hz8-pp__qbtn" data-step="1" aria-label="Öka antalet">+</button></div>' +
      '<button type="button" class="hz8-pp__cta">Lägg i varukorgen</button></div><p class="hz8-pp__msg" role="status" aria-live="polite"></p>';
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
    /* Nyehandels andra betygsmarkup: stjärnrad med procentbredd. */
    var inner = isNaN(avg) && document.querySelector(".product-detail__information .price-features .rating .stars-inner");
    if (inner && inner.style.width) avg = Math.round(parseFloat(inner.style.width) / 20 * 10) / 10;
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
    var nativeOut = document.documentElement.classList.contains("hz8-pdp-out");
    var stTxt = !anyBuyable || nativeOut && isBuyable(v) ? "Slutsåld" : isBuyable(v) ? (S.values.length > 1 && S.product && inStock < S.values.length ? "I lager · " + inStock + " av " + S.values.length + " " + labelPlural() : "I lager") : valueName(cur) + " är slut i lager";
    if (stock.textContent !== stTxt) stock.textContent = stTxt;
    stock.classList.toggle("is-out", !isBuyable(v) || nativeOut);
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
    var infoBtn = sf.querySelector(".hz8-pp__info");
    if (infoBtn.hidden !== !ht) { infoBtn.hidden = !ht; if (!ht) { help.hidden = true; infoBtn.setAttribute("aria-expanded", "false"); } }
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
      /* Storlek: värdets eget pris (storlekar har egna priser). Övriga:
         lagerstatus. Bara känd status -- före API-svaret ingen rad. */
      var t = out ? "Slut" : !S.product ? "" : variantModel() === "size" && x && x.price ? x.price.formatted_price : "I lager";
      if (s.textContent !== t) s.textContent = t;
      b.setAttribute("aria-label", valueName(b.getAttribute("data-value")) + (out ? ", slut i lager" : ""));
    });
    if (!st.querySelector('.hz8-pp__tile[tabindex="0"]')) { var f = st.querySelector(".hz8-pp__tile"); if (f) f.tabIndex = 0; }
    var idx = S.values.map(function (x) { return x.id; }).indexOf(cur);
    var cs = sf.querySelector(".hz8-pp__carstatus"), ct = idx >= 0 ? "Vald " + label() + " " + (idx + 1) + " av " + S.values.length : "";
    if (cs.textContent !== ct) cs.textContent = ct;
    if (sf.__cur !== cur) { sf.__cur = cur; revealSelected(sf, false); }
    syncCarousel(sf);
    /* Förpackning: 1 st + riktiga paketsteg (eller spärrad plan i
       granskningsläge). Inget steg -> ingen väljare, bara antal. */
    var steps = PK.steps;
    var packs = st.querySelector(".hz8-pp__packs");
    packs.hidden = !steps.length || !anyBuyable;
    packs.classList.toggle("is-review", steps.some(function (x) { return x.review; }));
    if (B.step && !currentStep()) { B.step = ""; B.pack = 1; }
    if (steps.length) {
      var unit1 = tierUnit(v, 1);
      var stepName = function (x) { return x.kind === "collection" ? "Hela kollektionen" : x.kind === "threeForTwo" ? "3 för 2" : x.qty + " st"; };
      var cards = [{ qty: 1, one: true }].concat(steps);
      var html = cards.map(function (x) {
        var on = stepKey(x) === (B.step || "1"), body, aria;
        if (x.one) { body = '<span class="hz8-pp__pack-qty">1 st</span><span class="hz8-pp__pack-total">' + (unit1 != null ? kr(unit1) : "") + "</span>"; aria = "1 st"; }
        else if (x.review) {
          body = '<span class="hz8-pp__pack-qty">' + esc(stepName(x)) + "</span>" + (x.kind === "collection" ? '<span class="hz8-pp__pack-unit">' + x.qty + " st, en av varje</span>" : "") + '<span class="hz8-pp__pack-missing">Paketprodukt saknas</span>';
          aria = stepName(x) + ", paketprodukt saknas, kan inte köpas än";
        } else {
          var saved = unit1 != null ? x.qty * unit1 - x.price : 0;
          body = '<span class="hz8-pp__pack-qty">' + esc(stepName(x)) + '</span><span class="hz8-pp__pack-total">' + esc(x.formatted) + '</span><span class="hz8-pp__pack-unit">' + kr(x.price / x.qty) + "/st</span>" + (saved >= 0.5 ? '<span class="hz8-pp__pack-save">Spara ' + kr(saved) + "</span>" : "");
          aria = stepName(x) + ", " + x.formatted;
        }
        return '<button type="button" role="radio" class="hz8-pp__pack' + (x.review ? " is-review" : "") + '" data-qty="' + x.qty + '" data-key="' + esc(stepKey(x)) + '" aria-checked="' + on + '" tabindex="' + (on ? 0 : -1) + '" aria-label="' + esc(aria) + '">' + body + "</button>";
      }).join("");
      var list = packs.querySelector(".hz8-pp__packlist");
      if (list.__html !== html) { list.innerHTML = html; list.__html = html; }
      var note = packs.querySelector(".hz8-pp__pknote");
      var nt = packs.classList.contains("is-review") ? "Granskningsläge: paketen kan inte köpas än – paketprodukterna finns inte i Nyehandel." : "";
      if (note.textContent !== nt) note.textContent = nt;
      note.hidden = !nt;
    }
    /* Byte i strainkarusellen fyller platserna så länge kunden inte själv
       ändrat någon plats. */
    if (builderActive() && B.__cur !== cur) { B.__cur = cur; if (isBuyable(v)) fillSlots(cur, false); }
    renderBuilder(st);
    renderSum(st);
    renderCta(st, anyBuyable);
    syncAnalysis();
  }

  function renderBuilder(st) {
    var host = st.querySelector(".hz8-pp__builder");
    var on = builderActive();
    host.hidden = !on;
    if (!on) return;
    var size = B.pack;
    var step = currentStep();
    var all = builderOptions(), opts = all.filter(function (o) { return o.ok; });
    var cur = step.kind === "family" ? String(readProductId()) : currentValue();
    var curOpt = all.filter(function (o) { return o.id === cur; })[0];
    if (step.kind === "collection") B.slots = all.map(function (o) { return o.id; }).slice(0, size);
    if (!B.slots.length) fillSlots(curOpt && curOpt.ok ? cur : (opts[0] && opts[0].id), true);
    while (step.kind !== "collection" && B.slots.length < size) B.slots.push(B.manual ? "" : (B.slots[0] || ""));
    B.slots = B.slots.slice(0, size);
    /* Val som inte längre är köpbara töms; aldrig fler av en strain än lagret. */
    if (step.kind !== "collection") B.slots = B.slots.map(function (val) { return val && opts.some(function (o) { return o.id === val; }) ? val : ""; });
    var ps = packState();
    host.classList.toggle("is-review", !!step.review);
    host.querySelector(".hz8-pp__btitle").textContent = step.kind === "collection" ? "Hela kollektionen · " + size + " st" : (step.kind === "family" && PK.familyName ? PK.familyName + " · " : "") + "Ditt " + size + "-pack";
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
    var curOk = !!(curOpt && curOpt.ok && curOpt.stock >= size) && step.kind !== "collection";
    var ft = "Alla som " + (curOpt ? curOpt.name : "");
    if (fill.textContent !== ft) fill.textContent = ft;
    fill.hidden = !curOk || (ps.single === cur && !ps.missing.length);
    var ol = host.querySelector(".hz8-pp__slots");
    var html = B.slots.map(function (val, idx) {
      var nm = val ? optName(val) : "Välj " + label();
      /* Kollektion: en av varje -- ingen väljare per plats. */
      if (step.kind === "collection") {
        var o0 = all.filter(function (o) { return o.id === val; })[0];
        return '<li class="hz8-pp__slot is-set is-fixed' + (o0 && !o0.ok ? " is-out" : "") + '"><span class="hz8-pp__slotnum" aria-hidden="true">' + (idx + 1) + '</span><span class="hz8-pp__slotname">' + esc(nm) + (o0 && !o0.ok ? " (slut i lager)" : "") + "</span></li>";
      }
      return '<li class="hz8-pp__slot' + (val ? " is-set" : "") + '"><span class="hz8-pp__slotnum" aria-hidden="true">' + (idx + 1) + "</span>" +
        '<span class="hz8-pp__slotname" aria-hidden="true">' + esc(nm) + "</span>" +
        '<span class="hz8-pp__slotedit" aria-hidden="true">' + (val ? "Ändra" : "Välj") + ICON.chev + "</span>" +
        '<select id="hz8-pp-slot-' + idx + '" data-slot="' + idx + '" aria-label="Plats ' + (idx + 1) + " av " + size + ", " + esc(label()) + '">' + '<option value="">Välj ' + esc(label()) + "</option>" +
        all.map(function (o) {
          var used = B.slots.filter(function (x, j) { return x === o.id && j !== idx; }).length;
          var full = o.ok && o.id !== val && used >= o.stock;
          var off = !o.ok || full;
          return '<option value="' + esc(o.id) + '"' + (o.id === val ? " selected" : "") + (off ? " disabled" : "") + ">" + esc(o.name) + (!o.ok ? " (slut i lager)" : full ? " (inga fler i lager)" : "") + "</option>";
        }).join("") + "</select></li>";
    }).join("");
    if (ol.__html !== html) {
      var active = document.activeElement && ol.contains(document.activeElement) ? document.activeElement.getAttribute("data-slot") : null;
      ol.innerHTML = html; ol.__html = html;
      if (active != null) { var again = ol.querySelector('select[data-slot="' + active + '"]'); if (again) again.focus({ preventScroll: true }); }
    }
    var note = host.querySelector(".hz8-pp__mixnote");
    var nt = step.review ? "Granskningsläge: paketet kan inte köpas än. Paketprodukten saknas i Nyehandel." : "";
    if (note.textContent !== nt) note.textContent = nt;
    note.hidden = !nt;
  }

  function renderSum(st) {
    var v = currentVariant();
    var price = st.querySelector(".hz8-pp__price"), unit = st.querySelector(".hz8-pp__unit"), save = st.querySelector(".hz8-pp__save"), cmp = st.querySelector(".hz8-pp__cmp");
    var step = builderActive() ? currentStep() : null;
    price.classList.toggle("is-missing", !!(step && step.review));
    if (step) {
      /* Paket: paketproduktens eget pris -- eller inget pris alls när
         paketprodukten saknas (granskningsläge). Aldrig beräknat. */
      var u1 = tierUnit(v, 1);
      var pt = step.review ? "Paketpris saknas" : step.formatted;
      if (price.textContent !== pt) price.textContent = pt;
      var ut = step.review ? "" : "(" + kr(step.price / step.qty) + "/st)";
      if (unit.textContent !== ut) unit.textContent = ut;
      var sv = !step.review && u1 != null && step.qty * u1 - step.price >= 0.5 ? "Spara " + kr(step.qty * u1 - step.price) : "";
      if (save.textContent !== sv) save.textContent = sv;
      cmp.hidden = true;
      return;
    }
    /* Utan paket: valt antal. Summan är det Nyehandels varukorg tar för
       raden (plattformens eget pris för antalet) -- ingen besparing visas. */
    var qty = B.qty, u = tierUnit(v, qty);
    if (u == null) u = parseKr((document.getElementById("product-price") || {}).textContent);
    var priceTxt = u != null ? kr(u * qty) : "";
    if (price.textContent !== priceTxt) price.textContent = priceTxt;
    if (unit.textContent) unit.textContent = "";
    if (save.textContent) save.textContent = "";
    /* Jämförelsepris bara när Nyehandel har ett (rea) -- för 1 st. */
    var hasCmp = qty === 1 && v && v.price && v.price.has_compare_price;
    cmp.hidden = !hasCmp;
    if (hasCmp && cmp.textContent !== v.price.formatted_compare_price) cmp.textContent = v.price.formatted_compare_price;
  }

  function blockReason() {
    var v = currentVariant();
    if (!builderActive()) return isBuyable(v) ? "" : valueName(currentValue()) + " är slut i lager. Välj en annan " + label() + ".";
    if (reviewPack()) return "Paketet kan inte köpas än – paketprodukten saknas i Nyehandel.";
    if (!builderOptions().some(function (o) { return o.ok; })) return "Inget alternativ i paketet finns i lager.";
    var ps = packState();
    if (ps.missing.length) return "Välj " + label() + " för plats " + ps.missing.join(", ").replace(/, (\d+)$/, " och $1") + ".";
    return "";
  }
  /* En enda källa för köpknappens text och läge -- ordinarie CTA och
     stickybaren visar alltid samma. */
  function ctaLabel(anyBuyable) {
    if (B.busy) return "Lägger till…";
    if (B.added) return "Tillagd ✓";
    if (!anyBuyable) return "Slutsåld";
    if (builderActive() && reviewPack()) return "Paket kan inte köpas än";
    if (builderActive() && packState().missing.length) return "Välj alternativ";
    if (!builderActive() && !isBuyable(currentVariant())) return "Slutsåld";
    return "Lägg i varukorgen";
  }
  function renderCta(st, anyBuyable) {
    var cta = st.querySelector(".hz8-pp__cta");
    var buyControls = document.querySelector(".product-detail__information .buy-controls");
    /* Slutsåld (hela produkten eller vald variant): ingen köpknapp, inget
       antal, ingen sticky köpzon -- Nyehandels egen bevakning ("Bevaka")
       visas i stället (TASK 10B-0/10B, R4). */
    /* 83-pdp-purchase.js:s slutsåld-beslut (html.hz8-pdp-out: ingen native
       köpknapp, eller vald variant utan köpbart lager) gäller också här --
       t.ex. när Nyehandel ersatt köpknappen efter att sidan laddats. */
    var nativeOut = document.documentElement.classList.contains("hz8-pdp-out");
    var soldOut = !anyBuyable || nativeOut || (!builderActive() && !isBuyable(currentVariant()));
    document.documentElement.classList.toggle("hz8-pp-soldout", soldOut);
    var buyRow = st.querySelector(".hz8-pp__buy");
    if (buyRow) buyRow.hidden = soldOut;
    cta.hidden = soldOut;
    if (buyControls) buyControls.classList.toggle("hz8-pp-monitor", soldOut);
    /* Antal: dolt när ett paket styr antalet. */
    var q = st.querySelector(".hz8-pp__qty");
    if (q) {
      q.hidden = builderActive();
      if (B.qty > maxQty()) B.qty = maxQty();
      var out = q.querySelector("output"); if (out.textContent !== String(B.qty)) out.textContent = String(B.qty);
      var bs = q.querySelectorAll("button");
      bs[0].disabled = B.qty <= 1; bs[1].disabled = B.qty >= maxQty();
    }
    var reason = blockReason();
    cta.setAttribute("aria-disabled", reason && !B.busy ? "true" : "false");
    /* Spärrat paket (granskningsläge): riktigt avstängd -- inte klickbar,
       inte fokuserbar, inget varukorgsanrop. */
    var blockedPack = builderActive() && reviewPack();
    if (cta.disabled !== blockedPack) cta.disabled = blockedPack;
    cta.classList.toggle("is-blocked", !!reason);
    cta.setAttribute("aria-busy", B.busy ? "true" : "false");
    var lbl = ctaLabel(anyBuyable);
    if (cta.textContent !== lbl) cta.textContent = lbl;
    cta.setAttribute("data-state", B.busy ? "busy" : B.added ? "added" : !anyBuyable || (!builderActive() && !isBuyable(currentVariant())) ? "soldout" : blockedPack ? "blocked" : reason ? "missing" : "ready");
    var msg = st.querySelector(".hz8-pp__msg");
    var m = B.msg || (reason && B.tried ? reason : "");
    if (msg.textContent !== m) msg.textContent = m;
    msg.classList.toggle("is-warn", !!(reason && m));
    syncSticky();
  }

  /* Förval = första köpbara värdet, när Nyehandel förvalt ett slutsålt
     och URL:en inte pekar ut en variant (/products/<slug>/<variant-id>). */
  function preferBuyable() {
    if (!S.values.length || /\/products\/[^/?#]+\/\d+/.test(location.pathname)) return;
    if (isBuyable(currentVariant())) return;
    var first = S.values.filter(function (x) { return isBuyable(x.variant); })[0];
    if (first) chooseValue(first.id);
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
    if (builderActive()) { var step = currentStep(); if (!step || step.review) return; return buyPackage(step); }
    var target = builderActive() ? packState().single : currentValue();
    var qty = builderActive() ? B.pack : B.qty;
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
      var what = (qty > 1 ? qty + " st " : "") + (target && S.values.length ? valueName(target) : "");
      B.msg = (what.trim() ? what.trim() + " har" : "Produkten har") + " lagts i varukorgen.";
      syncStation();
      window.setTimeout(function () { B.msg = ""; syncStation(); }, 5000);
    }).catch(function () {
      /* Läs om lagret: tog varan slut under tiden säger köpzonen det i
         stället för "försök igen" (TASK 10B-0-skyddet stoppade köpet). */
      B.busy = false; B.msg = ""; syncStation();
      loadState().then(function () {
        var gone = !isBuyable(target && S.values.length ? S.byOption[target] : currentVariant()) || document.documentElement.classList.contains("hz8-pdp-out");
        B.msg = gone ? (target && S.values.length ? valueName(target) : "Produkten") + " har tagit slut och kunde inte läggas i varukorgen." : "Det gick inte att lägga i varukorgen. Försök igen.";
        syncStation();
      }, function () { B.msg = "Det gick inte att lägga i varukorgen. Försök igen."; syncStation(); });
    });
    if (st) st.setAttribute("data-last", String(qty));
  }

  /* Paket: EN rad i Nyehandels varukorg -- paketproduktens variant med
     valda platser (packageProductVariants), så att Nyehandel sätter
     paketpriset och drar lagret. Bara för steg som verifierats i varukorg
     och kassa (PACKAGE_PRODUCTS verified: true). "Tillagd" först när
     varukorgens antal faktiskt ökat. */
  function buyPackage(step) {
    if (B.busy || !step || step.review || !step.verified) return;
    var all = builderOptions();
    var rows = B.slots.map(function (id) { var o = all.filter(function (x) { return x.id === id; })[0]; return o && o.ok ? o.variant.id : null; });
    if (rows.some(function (x) { return !x; })) { B.tried = true; syncStation(); return; }
    var store = HZ8.store && HZ8.store();
    var count = function () { var c = store && store.state && store.state.cart && store.state.cart.cart; return c ? +(c.quantity_count || 0) : null; };
    var before = count();
    B.busy = true; B.added = false; B.msg = ""; syncStation();
    fetch("/frontend-api/cart/item", { method: "POST", credentials: "same-origin", headers: HZ8.apiHeaders(),
      body: JSON.stringify({ product_variant_id: step.variantId, quantity: 1, meta: { data: { packageProductVariants: rows.map(function (vid, i) { return { slot: i, product_variant_id: vid }; }) } } }) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return store && store.dispatch ? store.dispatch("cart/reload") : null; })
      .then(function () { return wait(300); })
      .then(function () {
        B.busy = false;
        if (before !== null && !(count() > before)) throw new Error("not-added");
        B.added = true; B.tried = false; B.msg = (step.kind === "collection" ? "Hela kollektionen" : step.qty + "-pack") + " har lagts i varukorgen.";
        window.clearTimeout(B.addedT); B.addedT = window.setTimeout(function () { B.added = false; syncStation(); }, 2600);
        syncStation();
        if (store && store.dispatch) store.dispatch("cart/open");
      })
      .catch(function () { B.busy = false; B.msg = "Det gick inte att lägga paketet i varukorgen. Försök igen."; syncStation(); });
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
        var n = +pack.getAttribute("data-qty"), key = pack.getAttribute("data-key") || String(n);
        B.pack = n; B.step = key === "1" ? "" : key; B.msg = ""; B.tried = false;
        B.slots = []; B.manual = false;
        syncStation(); return;
      }
      var qb = e.target.closest(".hz8-pp__qbtn");
      if (qb) { B.qty = Math.max(1, Math.min(maxQty(), B.qty + +qb.getAttribute("data-step"))); B.msg = ""; B.added = false; syncStation(); return; }
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
      e.preventDefault(); nx.click(); window.setTimeout(function () { var again = group.querySelector('[data-value="' + nx.getAttribute("data-value") + '"], [data-key="' + nx.getAttribute("data-key") + '"]'); (again || nx).focus(); }, 80);
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
    var show = !!(sticky.__past && cta && !cta.hidden && cta.getAttribute("data-state") !== "blocked" && window.matchMedia("(max-width: 1023px)").matches && !overlayOpen() && !document.documentElement.classList.contains("hz8-ppnav-deep") && !document.documentElement.classList.contains("hz8-pp-nearfoot") && !document.documentElement.classList.contains("hz8-pp-to-product"));
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
    if (builderActive() ? B.pack > 1 : B.qty > 1) parts.push((builderActive() ? B.pack : B.qty) + " st");
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

  /* Produktens plats i katalogkartan ur dess egna kategorilänkar:
     format (Alla Vapes, Alla Carts ...) och serie (seriehubb eller serie x
     format). Formatet kommer i första hand ur formatlänken, annars ur en
     serie x format-länk. Seriedestinationen är katalogkartans etablerade
     route för serie + format -- även när den är en filtrerad formatsida
     (t.ex. Magic Sauce Carts = Alla Carts filtrerad på serien). Legacy-
     serier (HZ8.catalog.discoverable) och påhittade destinationer används
     aldrig. Aldrig ur produktnamnet. */
  function productContexts() {
    var formats = {}, series = {}, comboFormats = [];
    if (!HZ8.catalog) return { formats: [], series: null, format: null, route: null };
    document.querySelectorAll(".related-categories a[href]").forEach(function (a) {
      var c = HZ8.catalog.contextFor(a.href);
      if (!c) return;
      if (c.type === "format" && c.format) formats[c.format.key] = c.format;
      if (c.type === "combo" && c.format) comboFormats.push(c.format);
      if ((c.type === "combo" || c.type === "series-hub") && c.series && HZ8.catalog.discoverable(c.series)) series[c.series.name] = c.series;
    });
    var fmts = Object.keys(formats).map(function (k) { return formats[k]; });
    var format = fmts[0] || comboFormats[0] || null;
    var names = Object.keys(series);
    var s = names.length === 1 ? series[names[0]] : null; // flera serier = ingen säker serie
    var route = s && format && s.routes[format.key] ? s.routes[format.key] : null;
    return { formats: fmts, series: s, format: format, route: route };
  }
  function buildSimilar(host, brandName, band) {
    var ctxs = productContexts();
    var here = HZ8.path(location.href).split("?")[0].replace(/\/\d+$/, "");
    var other = function (c) { var m = c.html.match(/href="([^"]*\/products\/[^"]+)"/); return !m || HZ8.path(m[1]).split("?")[0].replace(/\/\d+$/, "") !== here; };
    /* 1) samma serie x samma format (minst två andra), 2) samma format. */
    var sources = [];
    if (ctxs.route) sources.push({ href: ctxs.route, kicker: "Fler i serien", title: "Fler i serien", all: "Alla " + ctxs.series.name + " " + ctxs.format.label.toLowerCase(), kind: "series" });
    var f = ctxs.format;
    if (f && f.href) sources.push({ href: f.href, kicker: "", title: "Liknande produkter", all: "Alla " + f.label.toLowerCase(), kind: "format" });
    if (!sources.length || !HZ8.productRail) return Promise.resolve(null);
    var slot = node("div", "hz8-pp-similar-slot"); host.appendChild(slot);
    function tryNext(i) {
      if (i >= sources.length) { slot.remove(); return null; }
      var src = sources[i];
      return HZ8.fetchPage(src.href, HZ8.categoryCards).then(function (cards) {
        cards = cards.filter(other);
        if (cards.length < 2) return tryNext(i + 1);
        /* Rubrik och kicker följer innehållet: serie -> "Fler i serien" med
           seriens namn som kicker; format -> "Liknande produkter". */
        var rail = HZ8.productRail({ id: "liknande", className: "hz8-pp-similar", title: src.title, href: HZ8.link(src.href), allLabel: src.all, hideCount: true, cards: cards, limit: 8, eager: true });
        rail.setAttribute("data-hz8-similar", src.kind);
        var head = rail.querySelector(".hz8-prail__title");
        if (src.kind === "series" && head) head.insertAdjacentHTML("beforebegin", '<p class="hz8-pp-similar__kicker">' + esc(ctxs.series.name + " · " + ctxs.format.label) + "</p>");
        slot.replaceWith(rail);
        return rail;
      }, function () { return tryNext(i + 1); });
    }
    return tryNext(0);
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
    /* Innehåll och analys finns alltid: verifierad PDF (per produkt eller
       vald strain) eller "Labbrapport skickas på begäran". Ingen batch,
       inget datum eller labb som inte finns i datan. */
    S.analysis = analysisProfile();
    hideUnverifiedDocs(S.analysis);
    {
      var ana = acc("analys", "Innehåll och analys", "flask", !MOBILE.matches);
      ana.querySelector(".hz8-acc__body").innerHTML = '<dl class="hz8-acc__dl" data-hz8-facts="content" data-hz8-hide-empty-self></dl>' +
        '<p class="hz8-acc__report" aria-live="polite"></p>' +
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

    /* Liknande produkter (TASK 10B): riktiga produkter ur produktens egna
       kategorier i katalogkartan -- samma serie x format ("Fler i
       serien") när minst två andra finns, annars samma format. Aldrig ur
       produktnamnet. Nyehandels egen lista (namnfiltrerad blandning) döljs.
       Inga dubbletter mot Bästsäljare (som väntar på den här listan). */
    var native = document.querySelector(".product-page-lists__similar-products");
    if (native) native.hidden = true;
    var band = document.querySelector(".product-detail__information .brand a[href]");
    var brandName = band ? band.textContent.trim() : "";
    var simReady = buildSimilar(host, brandName, band);
    /* Bästsäljare just nu: butikens egna bästsäljarurval (/page/vara-
       bastsaljare, Nyehandels sortering "Mest populära" -- samma källa
       som startsidan). Bara kort med pris och varumärke, utan aktuell
       produkt och utan produkter som redan står i Liknande produkter.
       Ingen källa -> ingen sektion. */
    var bestBox = node("section", "hz8-ppbest"); bestBox.id = "hz8-ppbest"; bestBox.hidden = true;
    bestBox.setAttribute("aria-labelledby", "hz8-ppbest-h");
    host.appendChild(bestBox);
    simReady.then(function (sim) { loadBestsellers(bestBox, sim); });

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
      if (band && brandName && !document.querySelector("#liknande .hz8-pp-brandlink")) rel.insertAdjacentHTML("beforeend", '<p class="hz8-pp-brandlink"><a href="' + esc(band.getAttribute("href")) + '">Alla produkter från ' + esc(brandName) + "</a></p>");
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

  /* ---- Analys (TASK 10B §7) ----
     En PDF visas bara när den är VERIFIERAD för just den här produkten
     (eller vald variant): Nyehandel-filen är byte-identisk med en
     WooCommerce-fil vars filnamn anger samma strain
     (theme8/review/universal-pdp-build-2026-10/ANALYSIS-VERIFIED.md,
     ur Task 10A ANALYSIS-DOCUMENT-MAP.md). Batch-/destillatfiler (copy-
     beslut saknas), fel strain, okända filer, bloggartiklar och
     myndighetsrapporter visas aldrig som analys. Saknas verifierad PDF:
     "Labbrapport skickas på begäran". Länken läses alltid ur produktens
     egen text -- tas den bort i admin försvinner den här också. */
  var VERIFIED_DOCS = {
    37: { doc: "19rrcW2L5Gf6AXf1779352050.pdf" },
    59: { doc: "ojo0zzScCBGu6gy1779352051.pdf" },
    60: { doc: "NmUchonZgUwJb4P1779352051.pdf" },
    65: { doc: "p4vCO2OvP0y3dEE1779352051.pdf" },
    74: { doc: "zg59nv2Auft0UWR1779352050.pdf" },
    84: { doc: "lY1pJXgHfxFM8b01779352053.pdf" },
    93: { doc: ["wNRiFbSXRo9DRuj1779352055.pdf", "LBfA221dWjqNjmj1779352424.pdf"] },
    96: { doc: ["zTOE7RpoyYkKHa61779352055.pdf", "eKNuDapPT4zdWjE1779352424.pdf"] },
    100: { doc: ["PYwtgHnnWw3vv4d1779352055.pdf", "KrCA5frGLYWCSqT1779352424.pdf"] },
    91: { variants: { "Crazy Dog": "l0NgRCtAD74iTGE1779352423.pdf", "Gorilla Cookies": "NXar8ZZ3wR5QrOP1779352054.pdf", "High Pepito": "BtF0HZ3iAmGEopJ1779352054.pdf", "Samurai Jack": "GgJNCiH47aEpW8P1779352423.pdf", "Yoda Ice Cream": "V1funsKGwRGyh8N1779352054.pdf" } },
    92: { variants: { "Crazy Dog": "l0NgRCtAD74iTGE1779352423.pdf", "Gorilla Cookies": "NXar8ZZ3wR5QrOP1779352054.pdf", "High Pepito": "BtF0HZ3iAmGEopJ1779352054.pdf", "Samurai Jack": "1tlHW9YYyoLxZJd1779352054.pdf", "Yoda Ice Cream": "V1funsKGwRGyh8N1779352054.pdf" } }
  };
  var DOC_LINK = /\.pdf(\?|#|$)/i;
  /* Labbdokument = PDF vars länktext är en analys (LABBTEST, LABBRAPPORT,
     Labbtestat destillat, COA, certifikat). Andra PDF:er (t.ex.
     Folkhälsomyndighetens rapport) är inte analys och lämnas orörda. */
  var LAB_TEXT = /labb|analys|\bcoa\b|certifikat|certificate/i;
  function textLinks() {
    return Array.prototype.slice.call(document.querySelectorAll("#product-page .short-description a[href], #product-information a[href], .hz8-acc__text a[href], .hz8-acc__lead a[href]"));
  }
  function fileOf(href) { return String(href || "").split(/[?#]/)[0].split("/").pop(); }
  /* Klassning: "variant" (PDF följer vald strain), "product" (en PDF för
     produkten) eller "request" (Labbrapport skickas på begäran). */
  function analysisProfile() {
    var rule = VERIFIED_DOCS[readProductId()] || null;
    var links = textLinks().filter(function (a) { return DOC_LINK.test(a.getAttribute("href")) && LAB_TEXT.test(a.textContent) && !/folkhalsomyndigheten/i.test(a.href); });
    var byFile = {}; links.forEach(function (a) { if (!byFile[fileOf(a.href)]) byFile[fileOf(a.href)] = a; });
    if (rule && rule.variants) {
      var map = {};
      Object.keys(rule.variants).forEach(function (k) { if (byFile[rule.variants[k]]) map[k] = byFile[rule.variants[k]].href; });
      if (Object.keys(map).length) return { kind: "variant", byValue: map, links: links };
    }
    if (rule && rule.doc) {
      var hit = [].concat(rule.doc).map(function (f) { return byFile[f]; }).filter(Boolean)[0];
      if (hit) return { kind: "product", href: hit.href, links: links };
    }
    return { kind: "request", links: links };
  }
  function analysisHref(prof) {
    prof = prof || S.analysis;
    if (!prof) return "";
    if (prof.kind === "product") return prof.href;
    if (prof.kind === "variant") return prof.byValue[valueName(currentValue())] || "";
    return "";
  }
  /* Overifierade PDF-länkar i produkttexten (fel strain, batch, okänt)
     döljs -- de är inte produktens analys. Verifierade ligger kvar. */
  function hideUnverifiedDocs(prof) {
    var ok = {};
    if (prof.kind === "product") ok[fileOf(prof.href)] = true;
    if (prof.kind === "variant") Object.keys(prof.byValue).forEach(function (k) { ok[fileOf(prof.byValue[k])] = true; });
    prof.links.forEach(function (a) {
      if (ok[fileOf(a.href)]) return;
      a.hidden = true; a.setAttribute("data-hz8-unverified-doc", "");
      /* Listpunkt/stycke som bara bar länken döljs också. */
      var box = a.closest("li, p");
      if (box && box.textContent.replace(/\s+/g, " ").trim() === a.textContent.replace(/\s+/g, " ").trim()) box.hidden = true;
    });
  }
  function syncAnalysis() {
    var box = document.querySelector(".hz8-acc__report");
    if (!box || !S.analysis) return;
    var href = analysisHref();
    var html = href ? '<a class="hz8-ppc__reportlink" href="' + esc(href) + '" target="_blank" rel="noopener">' + ICON.doc + "<span>Visa labbrapport (PDF)" + (S.analysis.kind === "variant" ? '<span class="hz8-ppc__reportfor"> · ' + esc(valueName(currentValue())) + "</span>" : "") + "</span>" + ICON.arrow + "</a>"
      : '<span class="hz8-ppc__request">' + ICON.doc + "<span>Labbrapport skickas på begäran</span></span>";
    if (box.__html !== html) { box.innerHTML = html; box.__html = html; }
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
    /* Varumärke som eyebrow ovanför H1, länk till varumärkets riktiga
       sida (Nyehandels egen .brand-rad är dold). */
    var brandA = info.querySelector(".brand a");
    if (brandA && !info.querySelector(".hz8-pp__brand")) {
      var eb = node("a", "hz8-pp__brand"); eb.href = brandA.getAttribute("href"); eb.textContent = brandA.textContent.trim();
      h1.parentNode.insertBefore(eb, h1);
    }
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
    /* Slutsåld-beslutet från 83 (klass på <html>) ändrar köpzonen direkt. */
    var wasOut = null;
    new MutationObserver(function () {
      var out = document.documentElement.classList.contains("hz8-pdp-out");
      if (out !== wasOut) { wasOut = out; syncStation(); }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    window.addEventListener("resize", syncSticky, { passive: true });
    /* Bakåt/framåt och bfcache: stationen följer Nyehandels variant-URL. */
    ["popstate", "pageshow"].forEach(function (ev) { window.addEventListener(ev, function () { window.setTimeout(function () { syncStation(); syncLedger(); }, 120); }); });
  }

  /* Kapabilitetsprofilen (läses av granskningsskripten och 10C-batcherna). */
  HZ8.pdpProfile = function () {
    var vs = S.values.length ? S.values.map(function (x) { return x.variant; }) : ((S.product && S.product.variants) || []);
    var n = vs.filter(isBuyable).length;
    return {
      id: readProductId(), adapter: true, loaded: !!S.product,
      variantModel: variantModel(), optionName: S.optionName, optionLabel: label(),
      stock: !vs.length ? "unknown" : n === 0 ? "sold-out" : n < vs.length ? "partial" : "in-stock",
      selected: valueName(currentValue()) || null, selectedBuyable: isBuyable(currentVariant()),
      analysis: S.analysis ? S.analysis.kind : null, analysisHref: analysisHref() || null,
      packages: packageProfile ? packageProfile() : null
    };
  };
  var packageProfile; // sätts av paketdelen ovan (TASK 10B-3)

  /* 83-pdp-purchase.js (slutsåld-skyddet) läser om lagret efter ett köp. */
  HZ8.pdpRefresh = function () { return loadState().then(function () { syncStation(); }).catch(function () {}); };

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
    loadState().then(function () { preferBuyable(); syncStation(); syncLedger(); return loadPackages(); }).catch(function () {});
  });
})();
