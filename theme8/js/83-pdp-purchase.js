/* Produktsidans köpflöde -- paritet med hazey.se (WooCommerce) och
   Hazeys prototyp (#ppBuilder/#ppRandomStrains/#ppSticky), på Nyehandels
   riktiga data. En delad state: Nyehandels egna kontroller (variant-
   select, antal, köpknapp) är sanningen; allt här speglar och styr dem.

   - Variantdata (lager per strain) ur /frontend-api/product/state.
   - Strainchips under galleriet (samma val som strainknapparna),
     slutsålda nedtonade "Slut i lager"; lagersummering "3 av 4 strains
     i lager". Byter huvudbild bara om Nyehandel har en variantbild.
   - Mobil köpbar (#hz8-buybar): alltid synlig utom när huvudköpraden är
     synlig; -/antal/+ och CTA styr de native kontrollerna.
   - Strainbyggare för blandade paket: komplett UI men AVSTÄNGD
     (HZ8.flags.mixedPacks). Nyehandels pristrappa gäller per variantrad,
     så blandade strains skulle bli fel prissatta. Kan förhandsvisas med
     ?hz8-mixed=1 -- köpknappen är då låst. Se theme8/blocks/MIXED-PACKS.md.
   - "Passar bra med": carts med 510-gänga -> Batterier & tillbehör. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  HZ8.flags = HZ8.flags || {};
  /* Blandade strains i paket: av tills Nyehandel-paketprodukter finns. */
  HZ8.flags.mixedPacks = false;
  var mixedPreview = /[?&]hz8-mixed=1/.test(location.search);

  function esc(v) { return HZ8.esc(v); }
  function parseKr(t) { var m = String(t || "").replace(/\s/g, "").match(/(\d+(?:,\d+)?)/); return m ? parseFloat(m[1].replace(",", ".")) : null; }
  function kr(v) { var r = Math.round(v * 100) / 100; return r.toLocaleString("sv-SE", { minimumFractionDigits: r % 1 ? 2 : 0, maximumFractionDigits: 2 }) + " kr"; }

  var state = { product: null, variants: [], byOption: {} };

  function loadVariants() {
    var m = document.documentElement.innerHTML.match(/viewProduct\(.(\d+)/);
    if (!m) return Promise.resolve(null);
    return fetch("/frontend-api/product/state", {
      method: "POST", credentials: "same-origin", headers: HZ8.apiHeaders(),
      body: JSON.stringify({ product_id: +m[1], variant_ids: [null] })
    }).then(function (r) { return r.json(); }).then(function (d) {
      state.product = d.product;
      state.variants = (d.product && d.product.variants) || [];
      state.variants.forEach(function (v) {
        (v.option_values || []).forEach(function (o) { state.byOption[String(o.id)] = v; });
      });
      return state;
    }).catch(function () { return null; });
  }

  function select() { return document.querySelector("#product-variants select"); }
  function variantFor(optionValue) { return state.byOption[String(optionValue)] || null; }
  function isBuyable(v) { return !!(v && v.buyable && v.available_stock > 0); }

  function chooseOption(value) {
    var sel = select();
    if (!sel || sel.value === String(value)) return;
    sel.value = String(value);
    sel.dispatchEvent(new Event("change", { bubbles: true }));
    sel.dispatchEvent(new Event("input", { bubbles: true }));
  }

  /* ---- Lager på strainknappar + strainchips + summering ---- */
  /* USP-punkter utan verifierad källa (omdömesbetyg, absoluta laglighets-
     påståenden) visas inte nära köpbeslutet; texten finns kvar i DOM. */
  function markUnverifiedUsps() {
    document.querySelectorAll(".product-usp li").forEach(function (li) {
      /* Overifierat nära köpbeslutet: omdöme/laglighet samt leveranstid
         och transportör (motstridiga uppgifter i butikens innehåll). */
      if (/trustpilot|lagligt|\d\s*[–-]\s*\d\s*(arbets|vardag|dag)|dhl|postnord/i.test(li.textContent)) li.classList.add("hz8-usp-unverified");
    });
  }

  function syncStock() {
    markUnverifiedUsps();
    var sel = select();
    if (!sel || !state.variants.length) return;
    var options = Array.prototype.filter.call(sel.options, function (o) { return o.value !== ""; });
    document.querySelectorAll(".hz8-variant[data-value]").forEach(function (b) {
      var v = variantFor(b.getAttribute("data-value"));
      var out = v && !isBuyable(v);
      b.classList.toggle("is-out", !!out);
      if (out) { b.setAttribute("aria-label", b.textContent.replace(/ – Slut i lager$/, "") + " – Slut i lager"); }
    });
    var info = document.querySelector(".product-detail__information");
    if (options.length > 1) {
      var inStock = options.filter(function (o) { return isBuyable(variantFor(o.value)); }).length;
      var sum = info.querySelector(".hz8-stock-sum");
      if (!sum) { sum = document.createElement("p"); sum.className = "hz8-stock-sum"; info.appendChild(sum); }
      var txt = inStock === options.length ? "Alla " + options.length + " strains i lager" : inStock + " av " + options.length + " strains i lager";
      if (sum.textContent !== txt) sum.textContent = txt;
    }
    buildChips(options);
  }

  function buildChips(options) {
    var media = document.querySelector(".product-detail__media");
    if (!media || options.length < 2) return;
    var row = media.querySelector(".hz8-strain-chips");
    if (!row) {
      row = document.createElement("div");
      row.className = "hz8-strain-chips";
      row.setAttribute("role", "group");
      row.setAttribute("aria-label", "Välj strain");
      media.appendChild(row);
    }
    var sel = select();
    var sig = options.map(function (o) { var v = variantFor(o.value); return o.value + ":" + (isBuyable(v) ? 1 : 0); }).join("|");
    if (row.getAttribute("data-sig") !== sig) {
      row.setAttribute("data-sig", sig);
      row.innerHTML = options.map(function (o) {
        var v = variantFor(o.value);
        var out = !isBuyable(v);
        return '<button type="button" class="hz8-strain-chip' + (out ? " is-out" : "") + '" data-value="' + esc(o.value) + '"' + (out ? ' aria-disabled="true"' : "") +
          ' aria-label="' + esc(o.textContent.trim() + (out ? " – Slut i lager" : "")) + '">' + esc(o.textContent.trim()) + (out ? '<span aria-hidden="true"> · Slut</span>' : "") + "</button>";
      }).join("");
      row.querySelectorAll(".hz8-strain-chip").forEach(function (b) {
        b.addEventListener("click", function () {
          if (b.classList.contains("is-out")) return;
          chooseOption(b.getAttribute("data-value"));
          var v = variantFor(b.getAttribute("data-value"));
          swapImage(v);
        });
      });
    }
    row.querySelectorAll(".hz8-strain-chip").forEach(function (b) { b.setAttribute("aria-pressed", sel && b.getAttribute("data-value") === sel.value ? "true" : "false"); });
  }

  /* Variantbild: bara om Nyehandel har en bild kopplad till varianten. */
  function swapImage(v) {
    if (!v || !v.image_id || !state.product || !state.product.images) return;
    var img = (state.product.images || []).filter(function (i) { return i.id === v.image_id; })[0];
    var main = document.querySelector("#product-slides .slide img");
    var url = img && (img.url || img.src || img.large || img.original);
    if (main && url) main.src = url;
  }

  /* ---- Köpbar (mobil): delad state med huvudköpraden ---- */
  function nativeQty() { return document.querySelector(".buy-form .amount-input .input"); }
  function nativeBuy() { return document.querySelector(".buy-form .button.buy"); }
  function usps() { return Array.prototype.map.call(document.querySelectorAll(".product-usp li"), function (li) { return li.textContent.trim(); }); }

  function trustItems() {
    /* Endast verifierade, generella uppgifter (HZ8.commerce): ingen
       transportör och ingen leveranstid förrän butikens motstridiga
       uppgifter (1–2/1–3/1–4 dagar, DHL/PostNord) är lösta. */
    var R = HZ8.commerce.rules;
    var items = [];
    if (HZ8.commerce.goalsEnabled()) items.push({ short: "Fri frakt " + R.freeShippingFrom + " kr", long: "Fri frakt från " + R.freeShippingFrom + " kr" });
    items.push({ short: "Sverige", long: "Skickas från Sverige" });
    items.push({ short: "Diskret", long: "Diskret förpackning" });
    items.push({ short: "18 år", long: "18 års åldersgräns" });
    return items;
  }

  function buildBuybar() {
    if (document.getElementById("hz8-buybar") || !nativeBuy()) return null;
    var bar = document.createElement("div");
    bar.id = "hz8-buybar";
    bar.className = "hz8-buybar";
    bar.innerHTML =
      '<button type="button" class="hz8-buybar__handle" aria-label="Visa varukorgen"><span aria-hidden="true"></span></button>' +
      '<div class="hz8-buybar__row">' +
        '<button type="button" class="hz8-buybar__cta"></button>' +
        '<div class="hz8-buybar__qty" role="group" aria-label="Antal">' +
          '<button type="button" data-step="-1" aria-label="Minska antalet">−</button>' +
          '<output aria-live="polite" aria-label="Valt antal">1</output>' +
          '<button type="button" data-step="1" aria-label="Öka antalet">+</button>' +
        "</div>" +
      "</div>" +
      '<ul class="hz8-buybar__trust">' + trustItems().map(function (t) { return '<li aria-label="' + esc(t.long) + '"><span aria-hidden="true">' + esc(t.short) + "</span></li>"; }).join("") + "</ul>";
    document.body.appendChild(bar);
    document.documentElement.classList.add("hz8-has-buybar");
    bar.querySelector(".hz8-buybar__cta").addEventListener("click", function () {
      if (bar.getAttribute("data-block")) { focusFirstMissing(); return; }
      var b = nativeBuy();
      if (b && !b.disabled) b.click();
      else { var info = document.querySelector(".product-detail__information"); if (info) info.scrollIntoView({ behavior: "smooth", block: "start" }); }
    });
    bar.querySelectorAll(".hz8-buybar__qty button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var target = btn.getAttribute("data-step") === "1" ? "Öka antalet" : "Minska antalet";
        var nb = document.querySelector('.buy-form .amount-input button[aria-label="' + target + '"]');
        if (nb) nb.click();
        window.setTimeout(syncBuybar, 80);
      });
    });
    bar.querySelector(".hz8-buybar__handle").addEventListener("click", function () {
      var cart = document.querySelector("#store-header .basket-icon .cart-button, #store-header .basket-icon button, #store-header .basket-icon a");
      if (cart) cart.click();
    });
    var form = document.querySelector(".buy-form");
    if ("IntersectionObserver" in window && form) {
      new IntersectionObserver(function (entries) {
        bar.classList.toggle("is-main-visible", entries[0].isIntersecting);
      }, { threshold: 0.6 }).observe(form);
    }
    return bar;
  }

  function syncBuybar() {
    var bar = document.getElementById("hz8-buybar");
    if (!bar) return;
    var span = document.querySelector(".buy-form .button.buy span");
    var nb = nativeBuy();
    var q = nativeQty();
    var block = builderBlock();
    var label = block || (nb && nb.disabled ? (nb.textContent.trim() || "Slut i lager") : (span && span.getAttribute("data-hz8-label")) || "Lägg i varukorgen");
    var cta = bar.querySelector(".hz8-buybar__cta");
    if (cta.textContent !== label) { cta.textContent = label; cta.setAttribute("aria-label", label); }
    if (block) bar.setAttribute("data-block", "1"); else bar.removeAttribute("data-block");
    /* Huvudköpknappen visar samma spärr (klicket stoppas i capture). */
    if (nb) {
      if (block) { if (nb.getAttribute("data-hz8-block") !== block) { nb.setAttribute("data-hz8-block", block); nb.setAttribute("aria-disabled", "true"); nb.setAttribute("aria-label", block); } }
      else if (nb.hasAttribute("data-hz8-block")) { nb.removeAttribute("data-hz8-block"); nb.removeAttribute("aria-disabled"); nb.removeAttribute("aria-label"); }
    }
    cta.disabled = !block && !!(nb && nb.disabled);
    bar.querySelector("output").textContent = q ? (q.value || "1") : "1";
    var blocked = !!document.querySelector("#cart-side-wrap.is-active, #hz8MobileDrawer.is-open, .hz8-choice, #sidebar.is-active");
    bar.classList.toggle("is-hidden", blocked);
  }

  /* ---- Strainbyggare (blandade paket) -- bakom flagga ----
     Kunden väljer paketstorlek (Nyehandels egna antal/paketknappar),
     sedan en strain per plats. Slumpa fyller ALLA platser med köpbara
     strains inom lagersaldot; varje plats kan ändras efteråt. Köp är
     låst tills alla platser är giltiga OCH en verifierad Nyehandel-
     paketprodukt finns för produkten (PACKAGE_PRODUCTS nedan) -- annars
     skulle Nyehandel prissätta varje strain som en egen rad. */
  /* Produktens id -> { size: paketproduktens variant-id }. Tom tills en
     riktig, dold paketprodukt är verifierad (MIXED-PACKS.md). */
  var PACKAGE_PRODUCTS = {};
  var builder = { size: 0, slots: [], scrambleLabel: "Slumpa strains" };
  function builderEnabled() { return HZ8.flags.mixedPacks || mixedPreview; }
  function currentPackSize() { var q = nativeQty(); return q ? parseInt(q.value, 10) || 1 : 1; }
  function packageVariantId() {
    var map = state.product && PACKAGE_PRODUCTS[state.product.id];
    return map && map[builder.size] || null;
  }
  function builderBlock() {
    if (!builderEnabled() || builder.size < 2) return "";
    var missing = builder.slots.filter(function (s) { return !s; }).length;
    if (missing) return "Välj " + missing + (missing === 1 ? " strain till" : " strains till");
    if (!HZ8.flags.mixedPacks || !packageVariantId()) return "Blandade paket kommer snart";
    return "";
  }
  function focusFirstMissing() {
    var idx = builder.slots.findIndex(function (s) { return !s; });
    var el = document.querySelector('.hz8-builder select[data-slot="' + (idx < 0 ? 0 : idx) + '"]');
    if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.focus({ preventScroll: true }); }
  }
  function buyableOptions() {
    var sel = select();
    if (!sel) return [];
    return Array.prototype.filter.call(sel.options, function (o) { return o.value !== "" && isBuyable(variantFor(o.value)); })
      .map(function (o) { var v = variantFor(o.value); return { value: o.value, label: o.textContent.trim(), variant: v, stock: v.track_inventory === false ? Infinity : v.available_stock }; });
  }
  function variantImage(v) {
    if (!v || !v.image_id || !state.product || !state.product.images) return null;
    var img = state.product.images.filter(function (i) { return i.id === v.image_id; })[0];
    return img ? (img.thumb_url || img.image_url) : null;
  }
  /* Pristrappa (inkl. moms) för en variant: [{min, unit}] stigande. */
  function tiersOf(v) {
    return ((v && v.prices) || []).map(function (p) { return { min: p.price.tier || 1, unit: parseKr(p.price.formatted_price) }; })
      .filter(function (t) { return t.unit != null; }).sort(function (a, b) { return a.min - b.min; });
  }
  function tierTotal(v, qty) {
    var t = tiersOf(v).filter(function (x) { return x.min <= qty; }).pop();
    return t ? t.unit * qty : null;
  }
  /* Önskat paketpris = produktens nivåpris för hela paketet. Nyehandels
     faktiska pris idag = varje strain som egen rad med egen nivå. */
  function packPrices(opts) {
    var groups = {};
    builder.slots.forEach(function (v) { if (v) groups[v] = (groups[v] || 0) + 1; });
    var first = opts[0] && opts[0].variant;
    var wanted = tierTotal(first, builder.size);
    var actual = 0, ok = true;
    Object.keys(groups).forEach(function (val) {
      var o = opts.filter(function (x) { return x.value === val; })[0];
      var t = o && tierTotal(o.variant, groups[val]);
      if (t == null) ok = false; else actual += t;
    });
    return { groups: groups, wanted: wanted, actual: ok ? actual : null };
  }
  /* Nyehandels paketformat (foundation.js): en rad för paketprodukten,
     valda strainvarianter per paketplats i meta. */
  function packagePayload() {
    var opts = buyableOptions();
    return {
      product_variant_id: packageVariantId(),
      quantity: 1,
      meta: { data: { packageProductVariants: builder.slots.map(function (val, i) {
        var o = opts.filter(function (x) { return x.value === val; })[0];
        return { id: o ? o.variant.id : null, pivot_id: i + 1 };
      }) } }
    };
  }
  HZ8.mixedPack = { payload: packagePayload, packages: PACKAGE_PRODUCTS };
  function usedBy(val, exceptIdx) {
    return builder.slots.filter(function (v, i) { return v === val && i !== exceptIdx; }).length;
  }
  function renderBuilder() {
    if (!builderEnabled()) return;
    var opts = buyableOptions();
    var size = currentPackSize();
    var host = document.querySelector(".hz8-builder");
    if (size < 2 || opts.length < 2) { if (host) host.remove(); builder.size = 0; syncBuybar(); return; }
    if (builder.size !== size) {
      builder.slots = builder.slots.slice(0, size);
      while (builder.slots.length < size) builder.slots.push("");
      builder.size = size;
    }
    /* Val som inte längre är köpbara (lager ändrat) töms. */
    builder.slots = builder.slots.map(function (v) { return v && opts.some(function (o) { return o.value === v; }) ? v : ""; });
    if (!host) {
      host = document.createElement("section");
      host.className = "hz8-builder";
      host.setAttribute("aria-labelledby", "hz8-builder-title");
      var anchor = document.getElementById("product-variants");
      anchor.parentNode.insertBefore(host, anchor.nextSibling);
      bindBuilder(host);
    }
    var done = builder.slots.filter(Boolean).length;
    var pr = packPrices(opts);
    var summary = Object.keys(pr.groups).map(function (v) { var o = opts.filter(function (x) { return x.value === v; })[0]; return "<li>" + esc(o ? o.label : v) + " <span>× " + pr.groups[v] + "</span></li>"; }).join("");
    var capacity = opts.reduce(function (n, o) { return n + Math.min(o.stock, size); }, 0);
    var locked = !HZ8.flags.mixedPacks || !packageVariantId();
    var html =
      '<div class="hz8-builder__head"><p id="hz8-builder-title" class="hz8-builder__title">Välj strains för ' + size + "-pack</p>" +
      '<span class="hz8-builder__count" aria-live="polite">' + done + " av " + size + " valda</span></div>" +
      (locked ? '<p class="hz8-builder__note">Förhandsvisning: blandade paket kan inte köpas ännu. Nyehandel prissätter idag varje strain som en egen rad.</p>' : "") +
      '<ol class="hz8-builder__slots">' + builder.slots.map(function (v, i) {
        var o = opts.filter(function (x) { return x.value === v; })[0];
        var img = o && variantImage(o.variant);
        return '<li class="hz8-builder__slot' + (v ? " is-set" : "") + '"><span class="hz8-builder__thumb" aria-hidden="true">' + (img ? '<img src="' + esc(img) + '" alt="" width="36" height="36" loading="lazy">' : (i + 1)) + "</span>" +
          '<label class="hz8-visually-hidden" for="hz8-slot-' + i + '">Plats ' + (i + 1) + " av " + size + "</label>" +
          '<select id="hz8-slot-' + i + '" data-slot="' + i + '"><option value="">Plats ' + (i + 1) + ": välj strain</option>" +
          opts.map(function (x) {
            var full = x.value !== v && usedBy(x.value, i) >= x.stock;
            return '<option value="' + esc(x.value) + '"' + (x.value === v ? " selected" : "") + (full ? " disabled" : "") + ">" + esc(x.label) + (full ? " (inga fler i lager)" : "") + "</option>";
          }).join("") + "</select></li>";
      }).join("") + "</ol>" +
      '<div class="hz8-builder__actions"><button type="button" class="hz8-btn hz8-btn--secondary hz8-btn--small hz8-builder__scramble"' + (capacity < size ? " disabled" : "") + ">" + esc(builder.scrambleLabel) + "</button>" +
      '<button type="button" class="hz8-link hz8-builder__same">Samma strain i alla</button></div>' +
      (summary ? '<div class="hz8-builder__summary"><p><strong>' + size + "-pack</strong>" + (pr.wanted != null ? " · " + kr(pr.wanted) : "") + "</p><ul>" + summary + "</ul>" +
        (locked && done === size && pr.actual != null && pr.wanted != null && Math.abs(pr.actual - pr.wanted) >= 0.5 ? '<p class="hz8-builder__diff">Nyehandel skulle idag ta ' + kr(pr.actual) + " för samma val.</p>" : "") + "</div>" : "");
    /* Rita bara om när innehållet ändrats -- annars tappar ett fokuserat
       fält fokus vid varje DOM-mutation på sidan. */
    if (host.__hz8Html !== html) {
      var active = document.activeElement && host.contains(document.activeElement) ? document.activeElement : null;
      var focusKey = active ? (active.getAttribute("data-slot") != null ? 'select[data-slot="' + active.getAttribute("data-slot") + '"]' : active.classList.contains("hz8-builder__scramble") ? ".hz8-builder__scramble" : active.classList.contains("hz8-builder__same") ? ".hz8-builder__same" : null) : null;
      host.innerHTML = html;
      host.__hz8Html = html;
      if (focusKey) { var again = host.querySelector(focusKey); if (again) again.focus({ preventScroll: true }); }
    }
  }
  function builderOpts() { return buyableOptions(); }
  function bindBuilder(host) {
    host.addEventListener("change", function (e) {
      var s = e.target.closest("select[data-slot]");
      if (!s) return;
      builder.slots[+s.getAttribute("data-slot")] = s.value; renderBuilder(); syncBuybar();
    });
    host.addEventListener("click", function (e) {
      var opts = builderOpts(), size = builder.size;
      if (e.target.closest(".hz8-builder__scramble")) {
        /* Alla platser, slumpat bland köpbara strains, aldrig över saldot;
           varierat innan en strain upprepas. */
        var left = {}; opts.forEach(function (o) { left[o.value] = o.stock; });
        var bag = [];
        builder.slots = builder.slots.map(function () {
          for (var guard = 0; guard < 3; guard++) {
            if (!bag.length) bag = opts.map(function (o) { return o.value; }).filter(function (v) { return left[v] > 0; }).sort(function () { return Math.random() - 0.5; });
            var pick = bag.shift();
            if (pick && left[pick] > 0) { left[pick]--; return pick; }
          }
          return "";
        });
        builder.scrambleLabel = "Slumpat ✓";
        renderBuilder(); syncBuybar();
        window.setTimeout(function () { builder.scrambleLabel = "Slumpa igen"; renderBuilder(); }, 1400);
      } else if (e.target.closest(".hz8-builder__same")) {
        var sel = select();
        var cur = opts.filter(function (o) { return sel && o.value === sel.value && o.stock >= size; })[0] || opts.filter(function (o) { return o.stock >= size; })[0];
        if (!cur) return;
        builder.slots = builder.slots.map(function () { return cur.value; });
        renderBuilder(); syncBuybar();
      }
    });
  }

  /* ---- "Passar bra med": cart vars egen text nämner ett varumärke som
     finns bland Batterier & tillbehör (t.ex. "CCELL Cart" -> CCELL-
     batterier). Datadriven ur båda sidornas riktiga data. ---- */
  function compatRail() {
    if (!HZ8.catalog || !HZ8.productRail || document.querySelector(".hz8-pdp-compat")) return;
    var title = (document.querySelector(".product-detail__information h1") || {}).textContent || "";
    var bat = HZ8.catalog.formatByKey("batterier");
    var extra = document.querySelector(".hz8-pdp-extra");
    if (!/^\s*cart\b/i.test(title) || !bat || !extra) return;
    var text = (document.getElementById("product-page") || {}).textContent || "";
    HZ8.fetchPage(bat.href, HZ8.categoryCards).then(function (cards) {
      var brands = {};
      cards.forEach(function (c) { var m = c.html.match(/class="brand"[^>]*>\s*([^<]+?)\s*</); if (m) brands[m[1].trim()] = true; });
      var hit = Object.keys(brands).filter(function (br) { return new RegExp("\\b" + br.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i").test(text); })[0];
      if (!hit || document.querySelector(".hz8-pdp-compat")) return;
      extra.appendChild(HZ8.productRail({
        id: "hz8-pdp-compat",
        className: "hz8-prail--compact hz8-pdp-compat",
        title: "Passar bra med",
        href: HZ8.link(bat.href),
        allLabel: "Alla batterier",
        hideCount: true,
        cards: cards.filter(function (c) { var m = c.html.match(/class="brand"[^>]*>\s*([^<]+?)\s*</); return m && m[1].trim() === hit; }),
        eager: true
      }));
    }).catch(function () {});
  }

  HZ8.register("pdp-purchase", function (context) {
    if (context.page !== "product") return;
    loadVariants().then(function () {
      buildBuybar();
      HZ8.watch(function () { syncStock(); renderBuilder(); syncBuybar(); });
      window.setTimeout(compatRail, 1200);
    });
    document.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest(".buy-form .amount-input, .hz8-package, .hz8-variant")) window.setTimeout(function () { renderBuilder(); syncBuybar(); }, 120);
    });
    /* Dölj köpbaren när minicart/meny/panel öppnas (klassbyten, throttlat). */
    var raf = 0;
    new MutationObserver(function () {
      if (raf) return;
      raf = window.requestAnimationFrame(function () { raf = 0; syncBuybar(); });
    }).observe(document.body, { attributes: true, subtree: true, attributeFilter: ["class"] });
    /* Ofullständigt blandat paket: native köpknapp får inte lägga en
       standardvariant i korgen. */
    document.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest(".buy-form .button.buy");
      if (!b || !builderEnabled() || builder.size < 2) return;
      e.preventDefault(); e.stopImmediatePropagation();
      if (builderBlock()) { focusFirstMissing(); return; }
      /* Endast med verifierad paketprodukt (PACKAGE_PRODUCTS): en rad,
         valda strains i meta -- Nyehandel sätter pris och lager. */
      fetch("/frontend-api/cart/item", { method: "POST", credentials: "same-origin", headers: HZ8.apiHeaders(), body: JSON.stringify(packagePayload()) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); var st = HZ8.store(); return st && st.dispatch("cart/reload").then(function () { st.dispatch("cart/open"); }); })
        .catch(function () { b.setAttribute("data-hz8-error", "1"); });
    }, true);
  });
})();
