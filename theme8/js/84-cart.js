/* Minicart / varukorg (TASK 15, godkänt v4-facit 2026-10-30:
   theme8/review/minicart-task15-2026-10/concepts-codex/).

   Nyehandel har ingen separat varukorgssida -- varukorgen ÄR Vue-drawern
   #cartAside. Vuex `cart` är enda sanningen: rader, antal, ta bort,
   summa, kassaknapp, fortsätt handla och dela varukorg är Nyehandels
   egna och klonas aldrig. Theme 8 läser storen och lägger till
   idempotenta, härledda delar som ritas om efter varje Vue-rerender:

   - en tvåstegsmätare fri frakt -> bonus överst (regler och spärr i
     02a-commerce.js; döljs helt när reglerna inte får visas),
   - paketväljare i raden + strainvy som barnvy i samma drawer. Bara
     verifierade paketprodukter (HZ8.packageRegistry, 85-pdp-pilot.js)
     är köpbara; ?hz8-pkg-review=1 visar migreringsplanen spärrad och
     utan varukorgsanrop. Ingen procentsats, ingen antalstrappa som paket,
     inget pris som inte kommer ur en riktig paketprodukt,
   - ett kontextuellt tillägg (pre-roll / batteri / cart) ur riktigt,
     köpbart sortiment,
   - rabattkod via Nyehandels eget kupongflöde (/frontend-api/coupon-codes),
   - summering Varor / Frakt / Du sparar totalt + Nyehandels Totalt,
   - trygghetsrad med officiella PostNord- och Swish-logotyper,
   - fel, lagergräns och väntan på varukorgens skrivanrop (observeras,
     Nyehandels egna anrop ändras inte), fokus, Escape och live-regioner. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  var C = HZ8.commerce; // frakt-/bonusregler (02a-commerce.js)
  /* Frakt- och bonusmål visas bara när Nyehandels kassa verifierat
     tillämpar reglerna (rules.backendVerified). Previewn räcker inte:
     kassan tar idag 49 kr frakt även över 499 kr (uppmätt TASK 15), så
     mätare, "Fri" och fraktbesparing vore osanna. ?hz8-goals-review=1
     visar utformningen märkt som förhandsvisning, för granskning. */
  var GOALS_REVIEW = /[?&]hz8-goals-review=1/.test(location.search);
  function goalsOn() { return C.rules.backendVerified === true || GOALS_REVIEW; }
  var parseKr = C.parseKr, kr = C.kr;
  function esc(v) { return HZ8.esc(v); }
  function decode(t) { return String(t || "").replace(/&amp;/g, "&").replace(/&#0?39;/g, "'").replace(/&quot;/g, '"'); }
  function cartObj() { var s = HZ8.store(); return s && s.state.cart && s.state.cart.cart || null; }
  function cartItems() { var c = cartObj(); return c && c.items ? c.items : []; }
  function qtyOf(it) { return parseFloat(it.quantity) || 0; }
  function incVat() {
    var c = cartObj(), m = c && c.totals && c.totals.incVat && c.totals.incVat.money;
    return m && typeof m.value === "number" ? m.value / 10000 : null;
  }
  function aside() { return document.getElementById("cartAside"); }
  function reload() {
    var st = HZ8.store();
    return st ? Promise.resolve(st.dispatch("cart/reload")) : Promise.resolve();
  }
  function api(method, url, body) {
    begin();
    return fetch(url, { method: method, credentials: "same-origin", headers: HZ8.apiHeaders(), body: body ? JSON.stringify(body) : undefined })
      .then(function (r) {
        end({ m: method, u: url, own: true }, r.status);
        return r.json().catch(function () { return {}; }).then(function (d) { if (!r.ok) { var e = new Error(r.status); e.status = r.status; e.data = d; throw e; } return d; });
      }, function (e) { end({ m: method, u: url, own: true }, 0); e.status = 0; throw e; });
  }
  function SVG(paths, size) {
    return '<svg viewBox="0 0 24 24" width="' + (size || 20) + '" height="' + (size || 20) + '" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + paths + "</svg>";
  }
  var ICON = {
    check: SVG('<path d="M5 12.5l4.2 4.2L19 7"/>'),
    chev: SVG('<path d="M9 6l6 6-6 6"/>', 16),
    down: SVG('<path d="M6 9l6 6 6-6"/>', 16),
    back: SVG('<path d="M15 6l-6 6 6 6"/>', 22),
    tag: SVG('<path d="M3.5 12.2V4.5a1 1 0 0 1 1-1h7.7l8.3 8.3a1 1 0 0 1 0 1.4l-7.3 7.3a1 1 0 0 1-1.4 0z"/><circle cx="8" cy="8" r="1.4"/>'),
    dice: SVG('<rect x="5" y="5" width="14" height="14" rx="2.6" transform="rotate(45 12 12)"/><circle cx="12" cy="8.2" r=".9" fill="currentColor"/><circle cx="12" cy="15.8" r=".9" fill="currentColor"/><circle cx="8.2" cy="12" r=".9" fill="currentColor"/><circle cx="15.8" cy="12" r=".9" fill="currentColor"/>', 24),
    none: SVG('<circle cx="12" cy="12" r="9"/><path d="M5.8 18.2L18.2 5.8"/>', 24)
  };

  /* Svensk numerus. */
  function varor(n) { return n + (n === 1 ? " vara" : " varor"); }
  function live(text) {
    var el = document.getElementById("hz8-cart-live");
    if (!el) {
      el = document.createElement("div");
      el.id = "hz8-cart-live";
      el.className = "hz8-visually-hidden";
      el.setAttribute("aria-live", "polite");
      document.body.appendChild(el);
    }
    el.textContent = "";
    window.setTimeout(function () { el.textContent = text; }, 30);
  }

  /* ================= Skrivanrop: väntan, fel, lagergräns =================
     Nyehandels egen varukorg skriver via XHR (axios). Anropen observeras
     bara (öppna/skicka/loadend) -- inget ändras. Under väntan är kassan
     spärrad; vid fel körs cart/reload så att Nyehandels sparade läge
     återställs, och raden får ett meddelande. Theme 8 skriver aldrig ett
     eget antal. */
  var W = { pending: 0, soon: 0, msgs: {}, stockAt: {}, global: null };
  function isCartWrite(m, u) { return m !== "GET" && /\/frontend-api\/(cart\/item|coupon-codes)/.test(u); }
  (function observe() {
    var P = XMLHttpRequest.prototype, open = P.open, send = P.send;
    P.open = function (m, u) {
      var M = String(m || "").toUpperCase(), U = String(u || "");
      this.__hz8 = isCartWrite(M, U) ? { m: M, u: U } : null;
      return open.apply(this, arguments);
    };
    P.send = function () {
      var info = this.__hz8, xhr = this;
      if (info) {
        begin();
        xhr.addEventListener("loadend", function () { end(info, xhr.status); });
      }
      return send.apply(this, arguments);
    };
  })();
  function itemIdOf(u) { var m = String(u).match(/cart\/item\/(\d+)/); return m ? m[1] : null; }
  function begin() { W.pending += 1; paintBusy(); }
  function end(info, status) {
    W.pending = Math.max(0, W.pending - 1);
    if (!info.own && (status === 0 || status >= 400) && /cart\/item/.test(info.u)) nativeFailed(info, status);
    window.setTimeout(paintBusy, 0);
  }
  function nativeFailed(info, status) {
    var id = itemIdOf(info.u);
    if (id && (status === 406 || status === 422)) {
      W.msgs[id] = { role: "status", text: "Du har valt allt som finns i lager just nu.", stock: true, at: Date.now() };
      /* Gränsen = det sparade antalet efter återställningen, inte Vuex
         optimistiska antal (som annars direkt "sänks" och släpper spärren). */
      W.stockAt[id] = -1;
      reload().then(function () {
        var back = cartItems().filter(function (x) { return String(x.id) === id; })[0];
        if (W.stockAt[id] === -1) W.stockAt[id] = back ? Math.round(qtyOf(back)) : null;
        schedule();
      }, function () { W.global = "Varukorgen kunde inte uppdateras. Ladda om sidan."; schedule(); });
      schedule();
      return;
    } else if (id && info.m === "DELETE") {
      W.msgs[id] = { role: "alert", text: "Varan kunde inte tas bort. Försök igen." };
    } else if (id) {
      W.msgs[id] = { role: "alert", text: "Antalet kunde inte ändras. Varukorgen visar det som är sparat.", retry: true };
    }
    reload().catch(function () { W.global = "Varukorgen kunde inte uppdateras. Ladda om sidan."; schedule(); });
    schedule();
  }
  /* Nyehandel debouncar ± innan anropet skickas -- under den tiden är
     summan redan inaktuell. Ett klick på ± markerar väntan direkt. */
  var lastControl = null;
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("#cartAside article.item .amount-input .button");
    if (!b) return;
    var row = b.closest("article.item"), id = row && row.getAttribute("data-hz8-item");
    var label = b.getAttribute("aria-label") || "";
    if (/^Öka/.test(label) && id && W.stockAt[id] != null) { e.preventDefault(); e.stopImmediatePropagation(); return; }
    if (id) { delete W.msgs[id]; if (!/^Öka/.test(label)) delete W.stockAt[id]; }
    W.global = null;
    lastControl = { id: id, label: label };
    if (/^Ta bort/.test(label)) rememberRemoval(row);
    W.soon = Date.now();
    paintBusy();
    window.setTimeout(paintBusy, 1600);
  }, true);
  function busy() { return W.pending > 0 || (W.soon && Date.now() - W.soon < 1500); }
  function paintBusy() {
    var a = aside();
    if (!a) return;
    var on = busy();
    a.classList.toggle("hz8-cart-busy", !!on);
    a.setAttribute("aria-busy", on ? "true" : "false");
    syncCheckout(a);
  }
  /* Kassan används aldrig med en gammal summa. */
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("#cartAside .section.footer .button.buy");
    if (b && (busy() || E.open)) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);

  /* Fokus efter "Ta bort": nästa rads produktlänk, annars föregående,
     annars rubriken. Aldrig body. */
  var removal = null;
  function rememberRemoval(row) {
    var rows = Array.prototype.slice.call(document.querySelectorAll("#cartAside article.item"));
    removal = { index: rows.indexOf(row), count: rows.length, at: Date.now() };
  }
  function restoreRemovalFocus(a) {
    if (!removal || Date.now() - removal.at > 8000) { removal = null; return; }
    var rows = a.querySelectorAll("article.item");
    if (rows.length >= removal.count) return; // inte borttagen än
    var target = rows[removal.index] || rows[removal.index - 1];
    var link = target && target.querySelector(".content a");
    removal = null;
    if (link) { link.focus({ preventScroll: false }); return; }
    var h = a.querySelector(".header h2");
    if (h) { h.setAttribute("tabindex", "-1"); h.focus(); }
  }

  /* ================= Rubrik ================= */
  var lastCount = null;
  function syncHeader(a) {
    var head = a.querySelector(".header"), h2 = head && head.querySelector("h2");
    if (!h2) return;
    if (h2.id !== "hz8-cart-title") h2.id = "hz8-cart-title";
    if (a.getAttribute("aria-labelledby") !== "hz8-cart-title") { a.setAttribute("aria-labelledby", "hz8-cart-title"); a.removeAttribute("aria-label"); }
    var tn = h2.firstChild;
    if (tn && tn.nodeType === 3 && /varukorg/i.test(tn.textContent) && tn.textContent !== "Varukorg") tn.textContent = "Varukorg";
    var c = cartObj(), n = c ? c.quantity_count || 0 : 0;
    var badge = h2.querySelector(".hz8-cart-count");
    if (!badge) { badge = document.createElement("span"); badge.className = "hz8-cart-count"; h2.appendChild(badge); }
    if (badge.getAttribute("data-sig") !== String(n)) {
      badge.innerHTML = n ? '<span aria-hidden="true">(' + n + ')</span><span class="hz8-visually-hidden">, ' + varor(n) + "</span>" : "";
      badge.setAttribute("data-sig", String(n));
    }
    if (lastCount !== null && n !== lastCount) live(n ? "Varukorgen uppdaterad: " + varor(n) : "Varukorgen är tom");
    lastCount = n;
  }

  /* ================= Målmätare (fri frakt -> bonus) =================
     Allt ur HZ8.commerce på Nyehandels verkliga korg. Visas bara när
     reglerna får visas (C.goalsEnabled) och beloppet är känt -- annars
     ingen mätare och ingen tom yta. */
  function fmtInt(v) { return Math.round(v).toLocaleString("sv-SE"); }
  function syncGoals(a) {
    var el = a.querySelector(".hz8-goal");
    var s = C.current();
    var head = a.querySelector(".header");
    if (!head || !s || !s.known || s.stage === "empty" || !goalsOn() || E.open) { if (el) el.remove(); return; }
    var R = C.rules;
    var sig = [s.stage, s.goods].join(":");
    if (!el) { el = document.createElement("div"); el.className = "hz8-goal"; }
    if (el.previousElementSibling !== head) head.parentNode.insertBefore(el, head.nextSibling);
    if (el.getAttribute("data-sig") === sig) return;
    el.setAttribute("data-sig", sig);
    el.setAttribute("data-stage", s.stage);
    function ok(t) { return '<span class="hz8-goal__ok"><span class="hz8-goal__tick">' + ICON.check + "</span>" + t + "</span>"; }
    var top, prog, startLabel, endLabel;
    if (s.stage === "shipping") {
      top = "<span><strong>" + kr(s.shipping.remaining) + "</strong> kvar till fri frakt</span>";
      prog = s.shipping.progress;
      startLabel = ""; endLabel = R.freeShippingFrom + " kr · fri frakt";
    } else {
      top = ok("Fri frakt") + (s.stage === "bonus" ? "<span>" + kr(s.bonus.remaining) + " kvar till " + R.bonusAmount + " kr bonus</span>" : ok(R.bonusAmount + " kr bonus"));
      prog = s.stage === "bonus" ? Math.max(0, Math.min(1, (s.goods - R.freeShippingFrom) / (R.bonusFrom - R.freeShippingFrom))) : 1;
      startLabel = R.freeShippingFrom + " kr · fri frakt"; endLabel = fmtInt(R.bonusFrom) + " kr · " + R.bonusAmount + " kr bonus";
    }
    var now = s.stage === "shipping" ? "Fri frakt: " + kr(s.goods) + " av " + R.freeShippingFrom + " kr" : s.stage === "bonus" ? "Bonus: " + kr(s.goods) + " av " + fmtInt(R.bonusFrom) + " kr" : "Fri frakt och bonus uppnådda";
    el.innerHTML = '<p class="hz8-goal__top" aria-live="polite">' + top + "</p>" +
      '<div class="hz8-goal__track" role="img" aria-label="' + esc(now) + '"><span class="hz8-goal__start' + (s.stage !== "shipping" ? " is-done" : "") + '"></span><span class="hz8-goal__bar"><span class="hz8-goal__fill" style="transform:scaleX(' + prog.toFixed(4) + ')"></span></span><span class="hz8-goal__end' + (s.stage === "done" ? " is-done" : "") + '"></span></div>' +
      '<p class="hz8-goal__ends" aria-hidden="true"><span>' + startLabel + "</span><span>" + endLabel + "</span></p>" +
      (C.rules.backendVerified === true ? "" : '<p class="hz8-goal__review">Förhandsvisning · reglerna är inte aktiva i kassan ännu.</p>');
  }

  /* ================= Paket ================= */
  function registry() { return HZ8.packageRegistry || { products: {}, plan: {}, families: {}, review: false }; }
  var stateCache = {};
  function stateById(id) {
    if (stateCache[id]) return stateCache[id];
    stateCache[id] = fetch("/frontend-api/product/state", { method: "POST", credentials: "same-origin", headers: HZ8.apiHeaders(), body: JSON.stringify({ product_id: +id, variant_ids: [null] }) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .catch(function (e) { delete stateCache[id]; throw e; });
    return stateCache[id];
  }
  function unitPrice(v) {
    var tier1 = (v && v.prices || []).filter(function (p) { return p.price && p.price.tier === 1; })[0];
    var p = tier1 ? tier1.price : v && v.price;
    return p ? parseKr(p.formatted_price) : null;
  }
  function stockOf(v) { return !v || !v.track_inventory || v.always_orderable ? Infinity : Math.max(0, v.available_stock || 0); }
  function variantImage(v, product) {
    if (!v || !v.image_id) return null;
    var img = (product.images || []).filter(function (i) { return i.id === v.image_id; })[0];
    return img ? img.thumb_url || img.image_url : null;
  }
  /* Paketprodukt -> moderprodukt (bara verifierade rader i registret). */
  function packageParents() {
    var out = {}, P = registry().products;
    Object.keys(P).forEach(function (pid) {
      (P[pid] || []).forEach(function (e) { if (e.verified === true) out[e.packageId] = { pid: +pid, entry: e }; });
    });
    return out;
  }
  function stepCode(code, model) {
    var m = String(code).match(/^(\d+)(K|F2)?$/);
    return { qty: +m[1], kind: m[2] === "K" ? "collection" : m[2] === "F2" ? "threeForTwo" : model, review: true };
  }
  function stepKey(s) { return s.one ? "1" : s.kind + ":" + s.qty; }
  function stepLabel(s) { return s.kind === "collection" ? "Alla " + s.qty : s.qty + " st"; }
  function packLabel(s) { return s.kind === "collection" ? "Hela kollektionen" : s.kind === "threeForTwo" ? "3 för 2" : s.qty + "-pack"; }

  var PKG = {};
  function loadPkg(pid) {
    if (PKG[pid]) return PKG[pid].promise;
    var reg = registry(), plan = reg.plan[pid] || null;
    var listed = (reg.products[pid] || []).filter(function (e) { return e.verified === true; });
    var info = PKG[pid] = { pid: pid, steps: [], options: [], loaded: false, review: false };
    if (!listed.length && !(reg.review && plan)) { info.loaded = true; info.promise = Promise.resolve(info); return info.promise; }
    info.promise = stateById(pid).then(function (d) {
      var P = d.product || {}, vs = P.variants || [];
      info.name = decode(P.name);
      info.image = P.images && P.images[0] ? P.images[0].thumb_url || P.images[0].image_url : null;
      info.unit = unitPrice(P.primary_variant || vs[0]);
      info.word = /^\s*vape\b/i.test(info.name) ? "vape" : /^\s*cart\b/i.test(info.name) ? "cart" : "plats";
      var optionsReady;
      if (plan && plan.model === "family" && reg.families[plan.family]) {
        var fam = reg.families[plan.family];
        optionsReady = Promise.all(Object.keys(fam.members).map(function (id) {
          return stateById(id).then(function (d2) {
            var P2 = d2.product || {}, v = (P2.variants || [])[0];
            return v ? { id: v.id, name: decode(P2.name), ok: HZ8.variantOrderable(v), stock: stockOf(v), image: P2.images && P2.images[0] ? P2.images[0].thumb_url : null } : null;
          }, function () { return null; });
        })).then(function (rows) { info.options = rows.filter(Boolean); });
      } else {
        info.options = vs.map(function (v) {
          return { id: v.id, name: decode((v.option_values || []).map(function (o) { return o.name; }).join(" · ") || P.name), ok: HZ8.variantOrderable(v), stock: stockOf(v), image: variantImage(v, P) };
        });
        optionsReady = Promise.resolve();
      }
      var real = Promise.all(listed.map(function (e) {
        return stateById(e.packageId).then(function (d2) {
          var P2 = d2.product, v = P2 && (P2.variants || [])[0];
          if (!P2 || P2.is_package !== true || !v || !HZ8.variantOrderable(v) || !v.price) return null;
          return { qty: +e.qty, kind: e.kind, packageId: e.packageId, variantId: v.id, price: parseKr(v.price.formatted_price), review: false };
        }, function () { return null; });
      }));
      return Promise.all([optionsReady, real]).then(function (r) {
        var steps = r[1].filter(Boolean).sort(function (x, y) { return x.qty - y.qty; });
        if (!steps.length && reg.review && plan) {
          info.review = true;
          steps = plan.steps.map(function (c) { var s = stepCode(c, plan.model); if (s.kind === "collection" && info.options.length > 1) s.qty = info.options.length; return s; });
        }
        info.steps = steps.length ? [{ one: true, qty: 1, price: info.unit, review: false }].concat(steps) : [];
        info.loaded = true;
        return info;
      });
    }).catch(function () { info.loaded = true; info.steps = []; return info; });
    return info.promise;
  }

  /* Granskningsläge: lokala val per korgrad, aldrig skickade. */
  var reviewSel = {};
  function metaSlots(it) {
    var m = it.meta && it.meta.data && it.meta.data.packageProductVariants;
    return Array.isArray(m) ? m.map(function (x) { return x.product_variant_id || x.id; }) : [];
  }
  function rowState(it) {
    var parent = packageParents()[it.product_id];
    if (parent) return { pid: parent.pid, real: true, key: stepKey(parent.entry), slots: metaSlots(it) };
    var sel = reviewSel[it.id];
    return { pid: it.product_id, real: false, key: sel ? sel.key : "1", slots: sel ? sel.slots.slice() : [] };
  }
  function optionById(info, id) { return info.options.filter(function (o) { return String(o.id) === String(id); })[0]; }
  function strainSummary(info, slots, size) {
    var names = [];
    slots.forEach(function (id) { var o = optionById(info, id); if (o && names.indexOf(o.name) === -1) names.push(o.name); });
    var filled = slots.filter(Boolean).length;
    if (filled < size) return filled + " av " + size + " strains valda";
    if (names.length === 1) return size + " st · " + names[0];
    return names.length + " strains · " + names.slice(0, 2).join(", ") + (names.length > 2 ? " +" + (names.length - 2) : "");
  }
  /* Förval: kollektion = en av varje köpbar strain (slutsålda platser
     lämnas tomma); annars fyller radens strain alla platser om lagret
     räcker, annars tomt. */
  function prefill(info, variantId, step) {
    var size = step.qty, out = [];
    if (step.kind === "collection") return info.options.slice(0, size).map(function (o) { return o.ok ? o.id : null; });
    var o = optionById(info, variantId);
    for (var i = 0; i < size; i++) out.push(o && o.ok && o.stock >= size ? o.id : null);
    return out;
  }

  function syncPackages(a) {
    var rows = a.querySelectorAll("article.item");
    cartItems().forEach(function (it, idx) {
      var row = rows[idx];
      if (!row) return;
      var rs = rowState(it);
      var info = PKG[rs.pid];
      if (!info) { loadPkg(rs.pid).then(schedule); return; }
      var host = row.querySelector(".hz8-pack");
      var tag = row.querySelector(".hz8-pack-tag");
      if (!info.loaded || !info.steps.length) {
        if (host) host.remove();
        if (tag) tag.remove();
        row.classList.remove("hz8-has-pack", "hz8-pack-active");
        return;
      }
      var step = info.steps.filter(function (s) { return stepKey(s) === rs.key; })[0] || info.steps[0];
      var active = !step.one;
      row.classList.add("hz8-has-pack");
      row.classList.toggle("hz8-pack-active", active);
      /* Paketnamn efter produktnamnet ("· 3-pack") när ett paket är valt. */
      if (active) {
        var link = row.querySelector(".content a");
        if (!tag && link) { tag = document.createElement("span"); tag.className = "hz8-pack-tag"; link.parentNode.insertBefore(tag, link.nextSibling); }
        if (tag && tag.textContent !== " · " + packLabel(step)) tag.textContent = " · " + packLabel(step);
      } else if (tag) tag.remove();
      var sig = [it.id, rs.key, rs.slots.join(","), info.review, it.formatted_total, qtyOf(it)].join("|");
      if (host && host.getAttribute("data-sig") === sig && host.parentNode === row) return;
      if (!host) { host = document.createElement("div"); host.className = "hz8-pack"; row.appendChild(host); }
      host.setAttribute("data-sig", sig);
      var single = info.unit;
      var tiles = info.steps.map(function (s) {
        var key = stepKey(s), on = key === rs.key, body;
        if (s.one) body = '<span class="hz8-pack__price">' + (single ? kr(single) + "/st" : "") + "</span>";
        else if (s.review) body = '<span class="hz8-pack__price is-missing">Paket saknas</span>';
        else {
          var per = s.price / s.qty, save = single ? s.qty * single - s.price : 0;
          body = '<span class="hz8-pack__price">' + kr(per) + "/st</span>" + (save >= 0.5 ? '<span class="hz8-pack__save">−' + kr(save) + "</span>" : "");
        }
        return '<button type="button" class="hz8-pack__step' + (s.review ? " is-review" : "") + '" aria-pressed="' + on + '" data-hz8-step="' + esc(key) + '" data-item="' + it.id + '"><span class="hz8-pack__qty">' + esc(stepLabel(s)) + "</span>" + body + "</button>";
      }).join("");
      var sum = "";
      if (active) {
        sum = '<div class="hz8-pack__sum"><span class="hz8-pack__strains">' + esc(strainSummary(info, rs.slots, step.qty)) + "</span>" +
          '<button type="button" class="hz8-pack__edit" data-hz8-edit="' + it.id + '" aria-label="Ändra strains: ' + esc(info.name) + ", " + esc(packLabel(step)) + '">Ändra' + ICON.chev + "</button></div>";
      }
      var note = info.review ? '<p class="hz8-pack__note">' + (active ? "Förhandsvisning · paketprodukten finns inte ännu. Varukorgen är oförändrad." : "Paketen förhandsvisas · inget läggs i varukorgen.") + "</p>" : "";
      host.innerHTML = sum + '<div class="hz8-pack__steps" role="group" aria-label="Paketstorlek: ' + esc(info.name) + '" style="--hz8-steps:' + Math.min(info.steps.length, 4) + '">' + tiles + "</div>" + note;
    });
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest(".hz8-pack__step, .hz8-pack__edit");
    if (!t) return;
    var id = t.getAttribute("data-item") || t.getAttribute("data-hz8-edit");
    var it = cartItems().filter(function (x) { return String(x.id) === id; })[0];
    if (!it) return;
    var rs = rowState(it), info = PKG[rs.pid];
    if (!info || !info.loaded) return;
    if (t.classList.contains("hz8-pack__edit")) { openEditor(it, rs, info); return; }
    var key = t.getAttribute("data-hz8-step");
    if (key === rs.key) return;
    var step = info.steps.filter(function (s) { return stepKey(s) === key; })[0];
    if (!step) return;
    if (rs.real || (!step.review && !step.one)) {
      /* Verifierade paketprodukter: byte sker via strainvyn (platserna
         måste väljas) och sparas där som riktig paketrad. 1 st = vanlig
         variantrad. Inget av detta körs innan registret har verified:true. */
      if (step.one) { replaceRow(it, { one: true }, [rs.slots[0] || it.variant_id]); return; }
      openEditor(it, { pid: rs.pid, real: rs.real, key: key, slots: prefill(info, rs.slots[0] || it.variant_id, step) }, info);
      return;
    }
    /* Granskningsläge: bara lokalt, inget varukorgsanrop. */
    if (step.one) delete reviewSel[it.id];
    else reviewSel[it.id] = { key: key, slots: prefill(info, it.variant_id, step) };
    live(step.one ? "Styckpris valt i förhandsvisningen." : packLabel(step) + " valt i förhandsvisningen. Varukorgen är oförändrad.");
    schedule();
    focusIn('.hz8-pack__step[data-item="' + it.id + '"][data-hz8-step="' + key + '"]');
  });

  /* Riktig paketrad (endast verifierade paketprodukter): ny rad med valda
     platser enligt Nyehandels paketformat, sedan tas den gamla raden bort
     och korgen läses om. */
  function replaceRow(it, step, slots) {
    var body = step.one
      ? { product_variant_id: +slots[0], quantity: 1, meta: null }
      : { product_variant_id: step.variantId, quantity: 1, meta: { data: { packageProductVariants: slots.map(function (vid, i) { return { slot: i, product_variant_id: +vid }; }) } } };
    delete W.msgs[it.id];
    return api("POST", "/frontend-api/cart/item", body)
      .then(function () { return api("DELETE", "/frontend-api/cart/item/" + it.id); })
      .then(reload)
      .catch(function () {
        W.msgs[it.id] = { role: "alert", text: "Paketet kunde inte ändras. Varukorgen visar det som är sparat." };
        return reload();
      }).then(schedule, schedule);
  }

  /* ================= Strainvyn (barnvy i samma drawer) ================= */
  var E = { open: false };
  function focusIn(sel) { window.setTimeout(function () { var n = document.querySelector(sel); if (n) n.focus({ preventScroll: false }); }, 30); }
  function openEditor(it, rs, info) {
    var step = info.steps.filter(function (s) { return stepKey(s) === rs.key; })[0];
    if (!step || step.one) return;
    var a = aside();
    var slots = rs.slots.slice(0, step.qty);
    while (slots.length < step.qty) slots.push(null);
    E = { open: true, itemId: it.id, pid: rs.pid, key: rs.key, real: rs.real, slots: slots, openSlot: -1, scroll: a ? a.scrollTop : 0 };
    renderEditor(true);
  }
  function closeEditor(saved) {
    var a = aside();
    var itemId = E.itemId, scroll = E.scroll || 0;
    E = { open: false };
    if (!a) return;
    a.classList.remove("hz8-view-strains");
    var ed = a.querySelector(".hz8-strains");
    if (ed) ed.remove();
    sync();
    a.scrollTop = scroll;
    window.setTimeout(function () {
      var btn = a.querySelector('.hz8-pack__edit[data-hz8-edit="' + itemId + '"]') || a.querySelector('.hz8-pack__step[data-item="' + itemId + '"][aria-pressed="true"]');
      if (btn) btn.focus({ preventScroll: true });
      a.scrollTop = scroll;
    }, 40);
    if (saved) live(saved);
  }
  function renderEditor(first) {
    var a = aside();
    if (!a || !E.open) return;
    var info = PKG[E.pid];
    var step = info && info.steps.filter(function (s) { return stepKey(s) === E.key; })[0];
    if (!info || !step) { closeEditor(); return; }
    var ed = a.querySelector(".hz8-strains");
    if (!ed) { ed = document.createElement("section"); ed.className = "hz8-strains"; ed.setAttribute("aria-labelledby", "hz8-strains-title"); a.appendChild(ed); }
    a.classList.add("hz8-view-strains");
    /* Variantbilder bara när Nyehandel har dem -- annars ingen bildkolumn. */
    ed.classList.toggle("is-imageless", !info.options.some(function (o) { return o.image; }));
    var filled = E.slots.filter(Boolean).length, size = E.slots.length, missing = size - filled;
    var price = step.review ? "paketpris saknas" : kr(step.price);
    var slotHtml = E.slots.map(function (id, i) {
      var o = id ? optionById(info, id) : null, open = E.openSlot === i;
      var row = '<li class="hz8-slot' + (open ? " is-open" : "") + (o ? " is-filled" : "") + '">' +
        '<button type="button" class="hz8-slot__btn" data-hz8-slot="' + i + '" aria-expanded="' + open + '"' + (open ? ' aria-controls="hz8-slot-list-' + i + '"' : "") + ">" +
        '<span class="hz8-slot__n" aria-hidden="true">' + (i + 1) + "</span>" +
        '<span class="hz8-slot__img">' + (o && o.image ? '<img src="' + esc(o.image) + '" alt="" width="48" height="48" loading="lazy">' : "") + "</span>" +
        '<span class="hz8-slot__name"><span class="hz8-visually-hidden">Plats ' + (i + 1) + " av " + size + ": </span>" + (o ? esc(o.name) : "Välj strain") + "</span>" +
        '<span class="hz8-slot__state' + (o ? " is-on" : "") + '">' + (o ? ICON.check : "") + "</span>" +
        '<span class="hz8-slot__chev">' + ICON.chev + "</span></button>";
      if (open) {
        row += '<div class="hz8-slot__list" id="hz8-slot-list-' + i + '" role="radiogroup" aria-label="Strain för plats ' + (i + 1) + '">' + info.options.map(function (op) {
          var used = E.slots.filter(function (x, j) { return j !== i && String(x) === String(op.id); }).length;
          var can = op.ok && op.stock > used;
          var sel = String(op.id) === String(id);
          return '<button type="button" role="radio" class="hz8-opt' + (can ? "" : " is-out") + '" aria-checked="' + sel + '"' + (can ? "" : ' aria-disabled="true"') + ' data-hz8-opt="' + esc(op.id) + '" data-slot="' + i + '">' +
            '<span class="hz8-slot__img">' + (op.image ? '<img src="' + esc(op.image) + '" alt="" width="48" height="48" loading="lazy">' : "") + "</span>" +
            '<span class="hz8-opt__name">' + esc(op.name) + (op.ok ? (can ? "" : " · Inte fler i lager") : " · Slut i lager") + "</span>" +
            '<span class="hz8-slot__state' + (sel ? " is-on" : "") + '">' + (sel ? ICON.check : !can ? ICON.none : "") + "</span></button>";
        }).join("") + "</div>";
      }
      return row + "</li>";
    }).join("");
    var anyOk = info.options.some(function (o) { return o.ok; });
    ed.innerHTML =
      '<div class="hz8-strains__head">' +
        '<button type="button" class="hz8-strains__back" aria-label="Tillbaka till varukorgen">' + ICON.back + "</button>" +
        '<div class="hz8-strains__titles"><h2 id="hz8-strains-title" tabindex="-1">Välj strains</h2><p>' + esc(packLabel(step)) + "</p></div>" +
        '<button type="button" class="hz8-strains__close" aria-label="Stäng varukorgen">' + SVG('<path d="M6 6l12 12M18 6L6 18"/>', 22) + "</button>" +
      "</div>" +
      '<div class="hz8-strains__body">' +
        '<p class="hz8-strains__lead">Välj en strain för varje ' + esc(info.word) + ".</p>" +
        '<div class="hz8-strains__product">' + (info.image ? '<img src="' + esc(info.image) + '" alt="" width="72" height="72">' : "") + "<div><strong>" + esc(info.name) + "</strong><span>" + esc(packLabel(step)) + " · " + esc(price) + "</span></div></div>" +
        (step.review ? '<p class="hz8-strains__review">Förhandsvisning: paketprodukten finns inte i Nyehandel ännu. Inget läggs i varukorgen när du sparar.</p>' : "") +
        '<ol class="hz8-slots">' + slotHtml + "</ol>" +
        (anyOk ? '<button type="button" class="hz8-strains__random">' + ICON.dice + "<span>Slumpa strains</span></button>" : "") +
      "</div>" +
      '<div class="hz8-strains__foot">' +
        '<p class="hz8-strains__count" aria-live="polite"><span>' + filled + " av " + size + " valda</span><span>" + (step.review ? "" : kr(step.price)) + "</span></p>" +
        '<button type="button" class="hz8-strains__save"' + (missing ? ' aria-disabled="true"' : "") + ">" + (missing ? "Välj " + missing + (missing === 1 ? " strain" : " strains") + " till" : "Spara val") + "</button>" +
        '<button type="button" class="hz8-strains__cancel">Avbryt</button>' +
      "</div>";
    if (first) {
      a.scrollTop = 0;
      window.setTimeout(function () { var h = a.querySelector("#hz8-strains-title"); if (h) h.focus({ preventScroll: true }); }, 30);
    }
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest(".hz8-strains button");
    if (!t || !E.open) return;
    var info = PKG[E.pid];
    if (t.classList.contains("hz8-strains__back") || t.classList.contains("hz8-strains__cancel")) { closeEditor(); return; }
    if (t.classList.contains("hz8-strains__close")) { closeEditor(); var c = document.querySelector("#cartAside .close-cart"); if (c) c.click(); return; }
    if (t.hasAttribute("data-hz8-slot")) {
      var i = +t.getAttribute("data-hz8-slot");
      E.openSlot = E.openSlot === i ? -1 : i;
      renderEditor();
      focusIn(E.openSlot === i ? '#hz8-slot-list-' + i + ' .hz8-opt:not([aria-disabled])' : '.hz8-slot__btn[data-hz8-slot="' + i + '"]');
      return;
    }
    if (t.hasAttribute("data-hz8-opt")) {
      if (t.getAttribute("aria-disabled") === "true") return;
      var slot = +t.getAttribute("data-slot");
      E.slots[slot] = t.getAttribute("data-hz8-opt");
      var next = E.slots.indexOf(null);
      E.openSlot = -1;
      renderEditor();
      focusIn(next === -1 ? ".hz8-strains__save" : '.hz8-slot__btn[data-hz8-slot="' + next + '"]');
      return;
    }
    if (t.classList.contains("hz8-strains__random")) {
      /* Bara köpbara strains, aldrig fler av en strain än lagret. */
      var pool = [];
      info.options.forEach(function (o) { if (o.ok) for (var k = 0; k < Math.min(o.stock, E.slots.length); k++) pool.push(o.id); });
      for (var j = pool.length - 1; j > 0; j--) { var r = Math.floor(Math.random() * (j + 1)); var tmp = pool[j]; pool[j] = pool[r]; pool[r] = tmp; }
      E.slots = E.slots.map(function (x, i2) { return pool[i2] != null ? pool[i2] : null; });
      E.openSlot = -1;
      renderEditor();
      live("Strains slumpade: " + E.slots.filter(Boolean).length + " av " + E.slots.length + " valda.");
      focusIn(".hz8-strains__random");
      return;
    }
    if (t.classList.contains("hz8-strains__save")) {
      if (t.getAttribute("aria-disabled") === "true" || E.saving) return;
      var step = info.steps.filter(function (s) { return stepKey(s) === E.key; })[0];
      if (step.review) {
        reviewSel[E.itemId] = { key: E.key, slots: E.slots.slice() };
        closeEditor("Paketvalet sparades i förhandsvisningen. Varukorgen är oförändrad.");
        return;
      }
      var it = cartItems().filter(function (x) { return String(x.id) === String(E.itemId); })[0];
      if (!it) { closeEditor(); return; }
      E.saving = true; t.textContent = "Sparar…"; t.setAttribute("aria-disabled", "true");
      replaceRow(it, step, E.slots).then(function () { closeEditor("Paketet är uppdaterat."); });
    }
  });
  /* Escape i strainvyn går tillbaka (öppen lista -> plats -> varukorg),
     före drawerns egen fokusfälla. */
  window.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" || !E.open) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (E.openSlot !== -1) { var i = E.openSlot; E.openSlot = -1; renderEditor(); focusIn('.hz8-slot__btn[data-hz8-slot="' + i + '"]'); return; }
    closeEditor();
  }, true);

  /* ================= Rader: text, meddelanden, nåbarhet ================= */
  function syncRows(a) {
    var rows = a.querySelectorAll("article.item");
    var its = cartItems();
    Array.prototype.forEach.call(rows, function (row, idx) {
      var it = its[idx];
      if (!it) return;
      if (row.getAttribute("data-hz8-item") !== String(it.id)) row.setAttribute("data-hz8-item", String(it.id));
      /* Plattformens råa &amp; avkodas bara för visning (textnoden). */
      var strong = row.querySelector(".content a strong");
      if (strong && /&amp;|&#0?39;/.test(strong.textContent)) strong.textContent = decode(strong.textContent);
      /* Antalsfältet lämnas med Nyehandels tabindex=-1: gjort nåbart
         uppdaterar Nyehandel antalet vid blur, Vue ritar om raden och
         fokus tappas (uppmätt TASK 15). −/+ är fullt nåbara. */
      var name = strong ? strong.textContent.trim() : decode(it.name);
      Array.prototype.forEach.call(row.querySelectorAll(".amount-input .button"), function (b) {
        var l = b.getAttribute("aria-label") || "";
        if (/^(Minska antalet|Öka antalet|Ta bort varan)$/.test(l)) b.setAttribute("aria-label", l + ": " + name);
      });
      /* Lagergräns: + spärras tills antalet sänks. */
      var plus = row.querySelector('.amount-input .button[aria-label^="Öka antalet"]');
      var q = Math.round(qtyOf(it));
      if (W.stockAt[it.id] > 0 && q < W.stockAt[it.id]) { delete W.stockAt[it.id]; delete W.msgs[it.id]; }
      if (plus) { if (W.stockAt[it.id] != null) plus.setAttribute("aria-disabled", "true"); else if (plus.hasAttribute("aria-disabled")) plus.removeAttribute("aria-disabled"); }
      var msg = W.msgs[it.id], box = row.querySelector(".hz8-row-msg");
      if (!msg) { if (box) box.remove(); return; }
      /* Lagergräns: Nyehandel visar ofta en egen toast. Medan den syns
         (eller strax innan den hunnit visas) ligger Theme 8:s rad bara i
         tillgänglighetsträdet -- toasten saknar role/aria-live -- så att
         kunden ser ETT meddelande. Försvinner toasten, eller kommer den
         aldrig, blir raden synlig. */
      var deferred = !!(msg.stock && (nativeStockToast() || Date.now() - msg.at < 900));
      if (deferred) recheckToast();
      var sig = msg.role + msg.text;
      if (!box) { box = document.createElement("div"); row.appendChild(box); }
      var cls = "hz8-row-msg is-" + msg.role + (deferred ? " is-deferred" : "");
      if (box.className !== cls) box.className = cls;
      if (box.getAttribute("data-sig") !== sig) {
        box.setAttribute("data-sig", sig);
        box.setAttribute("role", msg.role);
        box.innerHTML = "<span>" + esc(msg.text) + "</span>" + (msg.retry ? '<button type="button" class="hz8-row-msg__retry" data-item="' + it.id + '">Försök igen</button>' : "");
      }
    });
  }
  function nativeStockToast() {
    /* Toasten är position:fixed -> offsetParent är alltid null; mät rutan. */
    var t = document.querySelector(".toaster-container");
    if (!t || !/lager/i.test(t.textContent || "")) return false;
    var r = t.getBoundingClientRect(), cs = getComputedStyle(t);
    return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none" && +cs.opacity > 0.05;
  }
  var toastTimer = 0;
  function recheckToast() {
    if (toastTimer) return;
    toastTimer = window.setTimeout(function () { toastTimer = 0; schedule(); }, 400);
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".hz8-row-msg__retry");
    if (!b) return;
    var id = b.getAttribute("data-item");
    var row = document.querySelector('#cartAside article.item[data-hz8-item="' + id + '"]');
    delete W.msgs[id];
    var ctl = row && lastControl && lastControl.id === id && row.querySelector('.amount-input .button[aria-label="' + lastControl.label + '"]');
    if (ctl) { ctl.click(); ctl.focus(); } else schedule();
  });

  /* Ny rad: kort tonmarkering (ingen vid reduced motion, se CSS). */
  var knownIds = null;
  function markNew(a) {
    var ids = cartItems().map(function (i) { return String(i.id); });
    if (knownIds) ids.forEach(function (id) {
      if (knownIds.indexOf(id) !== -1) return;
      var row = a.querySelector('article.item[data-hz8-item="' + id + '"]');
      if (row) { row.classList.add("hz8-row-new"); window.setTimeout(function () { row.classList.remove("hz8-row-new"); }, 1200); }
    });
    knownIds = ids;
  }

  /* ================= Ett kontextuellt tillägg =================
     Standard: pre-roll. Cart i korgen -> batteri. Batteri i korgen ->
     cart. Bara verklig, köpbar produkt med giltigt pris som inte redan
     ligger i korgen; annars ingen modul. Neutral copy, inga påståenden
     om vad andra kunder köper. */
  var addonKey = null;
  function productPathOf(href) { return HZ8.path(href || "").split("?")[0].replace(/\/\d+$/, ""); }
  function cardInfo(c) {
    var t = document.createElement("div"); t.innerHTML = c.html;
    var a = t.querySelector("a[href*='/products/']"), img = t.querySelector("img");
    var price = t.querySelector(".price ins") || t.querySelector(".price");
    return { href: a ? HZ8.link(a.getAttribute("href")) : "", path: a ? productPathOf(a.getAttribute("href")) : "", name: decode(((t.querySelector(".name") || {}).textContent || "").trim()), image: img ? img.getAttribute("src") : "", price: price ? price.textContent.replace(/\s+/g, " ").trim() : "", priceValue: price ? parseKr(price.textContent) : 0, variants: !!t.querySelector(".has-variants") };
  }
  var allCardsP = null;
  function allProducts() {
    if (allCardsP) return allCardsP;
    /* Alla sidor av Alla produkter; stopp när en sida inte tillför nya
       produkter (Nyehandel visar sida 1 igen efter sista sidan). */
    var out = [], seen = {};
    function page(n) {
      return HZ8.fetchPage("/sv/categories/alla-produkter?page=" + n, HZ8.categoryCards).then(function (cards) {
        var fresh = cards.filter(function (c) { var k = cardInfo(c).path; if (!k || seen[k]) return false; seen[k] = true; return true; });
        out = out.concat(fresh);
        return fresh.length && n < 12 ? page(n + 1) : out;
      }, function () { return out; });
    }
    allCardsP = page(1);
    return allCardsP;
  }
  function isCart(n) { return /^\s*cart\b/i.test(n || ""); }
  function isBattery(n) { return /batteri/i.test(n || ""); }
  function isPreroll(n) { return /pre-?roll/i.test(n || ""); }
  function isCbd(n) { return /\bcbd\b/i.test(n || "") && !/\bthc/i.test(n || ""); }
  function syncAddon(a) {
    var its = cartItems();
    var host = a.querySelector(".hz8-addon");
    var list = a.querySelector(".section.items");
    if (!its.length || !list) { if (host) host.remove(); addonKey = null; return; }
    if (host && host.previousElementSibling !== list) list.parentNode.insertBefore(host, list.nextSibling);
    var inCart = {};
    its.forEach(function (i) { inCart[productPathOf(i.href)] = true; });
    var names = its.map(function (i) { return decode(i.name); });
    var hasCart = names.some(isCart), hasBat = names.some(isBattery);
    var kind = hasCart && !hasBat ? "battery" : hasBat && !hasCart ? "cart" : "pre";
    var key = kind + "|" + Object.keys(inCart).sort().join("|");
    if (key === addonKey) return;
    addonKey = key;
    var pool;
    if (kind !== "pre") {
      var fmt = HZ8.catalog && HZ8.catalog.formatByKey(kind === "battery" ? "batterier" : "carts");
      pool = fmt ? HZ8.fetchPage(fmt.href, HZ8.categoryCards) : Promise.resolve([]);
    } else {
      /* Relevant pre-roll: samma cannabinoidfamilj som korgen först. */
      var cbdOnly = names.every(isCbd);
      pool = allProducts().then(function (cards) {
        var pre = cards.filter(function (c) { return isPreroll(cardInfo(c).name); });
        return pre.filter(function (c) { return isCbd(cardInfo(c).name) === cbdOnly; }).concat(pre.filter(function (c) { return isCbd(cardInfo(c).name) !== cbdOnly; }));
      });
    }
    pool.then(function (cards) {
      var seen = {};
      var cands = cards.map(cardInfo).filter(function (c) {
        if (!c.path || inCart[c.path] || seen[c.path] || !(c.priceValue > 0)) return false;
        if (kind === "battery" && !isBattery(c.name)) return false;
        if (kind === "cart" && !isCart(c.name)) return false;
        seen[c.path] = true; return true;
      }).slice(0, 6);
      /* Första köpbara enligt Nyehandels product/state, i ordning. */
      return cands.reduce(function (p, c) {
        return p.then(function (found) {
          if (found) return found;
          return HZ8.productState(c.href).then(function (st) { return st.buyable ? c : null; }, function () { return null; });
        });
      }, Promise.resolve(null));
    }).then(function (pick) {
      if (addonKey !== key) return;
      var cur = a.querySelector(".hz8-addon");
      if (!pick) { if (cur) cur.remove(); return; }
      var box = cur || document.createElement("section");
      box.className = "hz8-addon";
      box.setAttribute("aria-labelledby", "hz8-addon-title");
      box.innerHTML = '<h3 id="hz8-addon-title">Komplettera ordern</h3>' +
        '<div class="hz8-addon__item"><a class="hz8-addon__media" href="' + esc(pick.href) + '" tabindex="-1" aria-hidden="true">' + (pick.image ? '<img src="' + esc(pick.image) + '" alt="" loading="lazy" width="64" height="64">' : "") + "</a>" +
        '<div class="hz8-addon__text"><a href="' + esc(pick.href) + '">' + esc(pick.name) + "</a><span>" + esc(pick.price) + "</span></div>" +
        (pick.variants ? '<a class="hz8-addon__btn" href="' + esc(pick.href) + '" aria-label="Välj variant: ' + esc(pick.name) + '">Välj</a>'
                       : '<button type="button" class="hz8-addon__btn" data-href="' + esc(pick.href) + '" aria-label="Lägg till i varukorgen: ' + esc(pick.name) + '">Lägg till</button>') +
        '</div><p class="hz8-addon__msg" role="status"></p>';
      var l2 = a.querySelector(".section.items");
      if (!cur && l2) l2.parentNode.insertBefore(box, l2.nextSibling);
    });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".hz8-addon__btn[data-href]");
    if (!b || b.getAttribute("aria-busy") === "true") return;
    var href = b.getAttribute("data-href");
    var msg = b.closest(".hz8-addon").querySelector(".hz8-addon__msg");
    b.setAttribute("aria-busy", "true"); b.textContent = "Lägger till…";
    HZ8.productState(href).then(function (st) {
      if (!st.variantId || !st.buyable || st.variants > 1) { location.href = href; return null; }
      return HZ8.addVariant(st.variantId).then(reload);
    }).catch(function () {
      if (msg) msg.textContent = "Produkten kunde inte läggas till. Försök igen.";
      b.removeAttribute("aria-busy"); b.textContent = "Lägg till";
    });
  });

  /* ================= Rabattkod (Nyehandels kupongflöde) ================= */
  var CP = { open: false, busy: false, error: "" };
  function coupon() { var c = cartObj(); var k = c && c.cart_coupon; return k && k.code ? k : null; }
  function couponOff() { var k = coupon(); return k && k.cart_discount > 0 ? parseKr(k.cart_discount_formatted) : 0; }
  function syncCoupon(ledger) {
    var k = coupon(), off = couponOff();
    var box = ledger.querySelector(".hz8-coupon");
    if (!box) {
      box = document.createElement("div");
      box.className = "hz8-coupon";
      box.innerHTML = '<div class="hz8-coupon__row"><span class="hz8-coupon__icon">' + ICON.tag + '</span><span class="hz8-coupon__label"></span><span class="hz8-coupon__off"></span>' +
        '<button type="button" class="hz8-coupon__toggle" aria-expanded="false" aria-controls="hz8-coupon-form"><span></span>' + ICON.down + "</button></div>" +
        '<form class="hz8-coupon__form" id="hz8-coupon-form" hidden novalidate><label class="hz8-visually-hidden" for="hz8-coupon-input">Rabattkod</label>' +
        '<div class="hz8-coupon__field"><input id="hz8-coupon-input" name="coupon_code" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Skriv din kod" aria-describedby="hz8-coupon-err"><button type="submit" class="hz8-coupon__apply">Använd</button></div>' +
        '<button type="button" class="hz8-coupon__remove" hidden>Ta bort koden</button><p class="hz8-coupon__err" id="hz8-coupon-err" role="alert"></p></form>';
      ledger.insertBefore(box, ledger.firstChild);
    }
    var sig = [k ? k.code : "", off, CP.open, CP.busy, CP.error].join("|");
    if (box.getAttribute("data-sig") === sig) return;
    box.setAttribute("data-sig", sig);
    box.querySelector(".hz8-coupon__label").textContent = k ? "Rabattkod · " + k.code : "Rabattkod";
    box.querySelector(".hz8-coupon__off").textContent = off ? "−" + kr(off) : "";
    var tg = box.querySelector(".hz8-coupon__toggle");
    tg.firstChild.textContent = k ? "Ändra" : "Lägg till";
    tg.setAttribute("aria-label", k ? "Ändra rabattkod" : "Lägg till rabattkod");
    tg.setAttribute("aria-expanded", String(CP.open));
    var form = box.querySelector("form");
    form.hidden = !CP.open;
    box.classList.toggle("is-open", CP.open);
    var apply = form.querySelector(".hz8-coupon__apply");
    apply.textContent = CP.busy ? "Kontrollerar…" : "Använd";
    apply.setAttribute("aria-disabled", CP.busy ? "true" : "false");
    form.querySelector(".hz8-coupon__remove").hidden = !k;
    form.querySelector(".hz8-coupon__err").textContent = CP.error;
    form.querySelector("input").setAttribute("aria-invalid", CP.error ? "true" : "false");
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest(".hz8-coupon__toggle, .hz8-coupon__remove");
    if (!t) return;
    if (t.classList.contains("hz8-coupon__toggle")) {
      CP.open = !CP.open; CP.error = "";
      sync();
      if (CP.open) focusIn("#hz8-coupon-input");
      return;
    }
    var k = coupon();
    if (!k || CP.busy) return;
    CP.busy = true; sync();
    api("DELETE", "/frontend-api/coupon-codes/" + k.id).then(reload).then(function () {
      CP.busy = false; CP.open = false; live("Rabattkoden är borttagen."); sync(); focusIn(".hz8-coupon__toggle");
    }, function () { CP.busy = false; CP.error = "Koden kunde inte tas bort. Försök igen."; sync(); });
  });
  document.addEventListener("submit", function (e) {
    var f = e.target.closest && e.target.closest(".hz8-coupon__form");
    if (!f) return;
    e.preventDefault();
    var input = f.querySelector("input"), code = input.value.trim();
    if (CP.busy) return;
    if (!code) { CP.error = "Skriv en rabattkod."; sync(); input.focus(); return; }
    CP.busy = true; CP.error = ""; sync();
    api("POST", "/frontend-api/coupon-codes", { coupon_code: code, payment_method_id: null }).then(reload).then(function () {
      CP.busy = false;
      if (coupon()) { CP.open = false; input.value = ""; live("Rabattkoden " + coupon().code + " är tillagd."); sync(); focusIn(".hz8-coupon__toggle"); }
      else { CP.error = "Koden kunde inte användas på den här varukorgen."; sync(); input.focus(); }
    }, function (err) {
      CP.busy = false;
      var d = err && err.data, m = d && d.errors && (d.errors.coupon_code || [])[0] || d && d.message;
      CP.error = err && err.status === 0 ? "Det gick inte att kontrollera koden. Försök igen." : m && !/given data was invalid|server error/i.test(m) ? m : "Koden finns inte eller kan inte användas.";
      sync(); input.focus();
    });
  });

  /* ================= Summering =================
     Varor = radernas ordinarie värde (Nyehandels jämförbelopp när raden
     har ett, annars radens summa). Du sparar totalt = rad-/kampanj-/
     paketbesparing (jämförbelopp − summa) + kodrabatt + fri frakt, en
     gång vardera. Totalt = Nyehandels egen total. */
  function couponInTotal(sumRows, total, off) {
    if (!off || total == null) return null;
    if (Math.abs(total - (sumRows - off)) < 1) return true;
    if (Math.abs(total - sumRows) < 1) return false;
    return null;
  }
  function figures() {
    var parents = packageParents();
    var goods = 0, rows = 0;
    cartItems().forEach(function (i) {
      var tot = parseKr(i.formatted_total);
      var ord = i.has_compare ? parseKr(i.formatted_comparison_row_total) : 0;
      /* Verifierad paketrad utan jämförbelopp: ordinarie = antal platser ×
         moderproduktens styckpris (båda riktiga Nyehandel-priser). */
      var par = parents[i.product_id];
      if (!ord && par && PKG[par.pid] && PKG[par.pid].unit) ord = par.entry.qty * PKG[par.pid].unit * qtyOf(i);
      rows += tot;
      goods += Math.max(ord, tot);
    });
    var total = incVat(), off = couponOff();
    var inTotal = couponInTotal(rows, total, off);
    var payable = total == null ? null : inTotal === false ? total - off : total;
    var s = C.current();
    var shipFree = !!(s && s.known && goalsOn() && s.shipping.reached);
    var saved = Math.max(0, goods - rows) + (inTotal === null ? 0 : off) + (shipFree ? C.rules.shippingFee : 0);
    return { goods: goods, payable: payable, saved: saved, shipFree: shipFree, off: off, couponKnown: inTotal !== null };
  }
  function syncLedger(a) {
    var footer = a.querySelector(".section.footer");
    var ledger = a.querySelector(".hz8-ledger");
    if (!footer || !cartItems().length) { if (ledger) ledger.remove(); return; }
    if (!ledger) {
      ledger = document.createElement("section");
      ledger.className = "hz8-ledger";
      ledger.setAttribute("aria-label", "Ordersummering");
      ledger.innerHTML = '<dl class="hz8-ledger__rows"></dl>';
    }
    if (ledger.nextElementSibling !== footer) footer.parentNode.insertBefore(ledger, footer);
    syncCoupon(ledger);
    var f = figures();
    var ship = f.shipFree ? '<s><span class="hz8-visually-hidden">Ordinarie </span>' + C.rules.shippingFee + " kr</s> Fri" : "Beräknas i kassan";
    var html = "<div><dt>Varor</dt><dd>" + kr(f.goods) + "</dd></div>" +
      '<div><dt>Frakt</dt><dd class="hz8-ledger__ship">' + ship + "</dd></div>" +
      (f.saved >= 0.5 ? '<div class="is-save"><dt>Du sparar totalt</dt><dd>' + kr(f.saved) + "</dd></div>" : "");
    var dl = ledger.querySelector(".hz8-ledger__rows");
    if (dl.getAttribute("data-sig") !== html) { dl.innerHTML = html; dl.setAttribute("data-sig", html); }
  }
  /* Totalt + kassaknapp. En kodrabatt som Nyehandel redovisar separat
     (ej i totals) dras av en gång; okänt -> Nyehandels total orörd. */
  function syncCheckout(a) {
    var footer = a.querySelector(".section.footer");
    if (!footer || !cartItems().length) return;
    var f = figures();
    var sum = footer.querySelector(".sum");
    var sumVal = sum && sum.lastElementChild;
    if (sumVal) {
      var override = f.payable != null && f.couponKnown && f.off && Math.abs(f.payable - (incVat() || 0)) >= 0.5 ? kr(f.payable) : null;
      if (override && sumVal.getAttribute("data-hz8-total") !== override) { sumVal.setAttribute("data-hz8-total", override); sumVal.setAttribute("aria-label", override); }
      else if (!override && sumVal.hasAttribute("data-hz8-total")) { sumVal.removeAttribute("data-hz8-total"); sumVal.removeAttribute("aria-label"); }
    }
    var btn = footer.querySelector(".button.buy");
    if (!btn) return;
    var label = busy() ? "Uppdaterar…" : "Till kassan · " + (f.payable != null ? kr(f.payable) : "");
    if (btn.getAttribute("data-hz8-label") !== label) { btn.setAttribute("data-hz8-label", label); btn.setAttribute("aria-label", label); }
    if (busy() || E.open) { if (btn.getAttribute("aria-disabled") !== "true") btn.setAttribute("aria-disabled", "true"); }
    else if (btn.hasAttribute("aria-disabled")) btn.removeAttribute("aria-disabled");
  }

  /* ================= Trygghet ================= */
  function syncTrust(a) {
    var footer = a.querySelector(".section.footer");
    var t = a.querySelector(".hz8-trust");
    if (!footer || !cartItems().length) { if (t) t.remove(); return; }
    if (!t) {
      t = document.createElement("ul");
      t.className = "hz8-trust";
      t.setAttribute("aria-label", "Trygghet");
      /* PostNord: ingen godkänd PostNord-bilasset finns (sökt i projektet,
         Task 15-referenserna och hazey.se) -- Theme 8:s befintliga
         outline-lastbil (HZ8.icon) bredvid texten, aldrig en ritad logotyp.
         Swish: den officiella logotypen står som rad ovanför texten. */
      t.innerHTML = '<li><span class="hz8-trust__icon">' + HZ8.icon("truck") + '</span><span><b>PostNord</b>Skickas från Sverige</span></li>' +
        '<li class="is-swish"><span><span class="hz8-trust__logo is-swish" role="img" aria-label="Swish"></span>Trygg betalning</span></li>' +
        '<li><span class="hz8-trust__check">' + ICON.check + "</span><span>Diskret paket</span></li>";
    }
    var btn = footer.querySelector(".button.buy");
    if (btn && t.previousElementSibling !== btn) btn.parentNode.insertBefore(t, btn.nextSibling);
  }

  /* ================= Tom korg ================= */
  function syncEmpty(a) {
    var empty = a.querySelector("section.empty");
    if (cartItems().length) { Array.prototype.forEach.call(a.querySelectorAll(".hz8-cart-empty-links, .hz8-cart-empty-lead"), function (n) { n.remove(); }); return; }
    if (!empty || empty.querySelector(".hz8-cart-empty-links")) return;
    var cats = (HZ8.navCategories || []).filter(function (c) { return !c.campaign && /\/categories\//.test(c.href || ""); });
    if (!cats.length) return;
    var p = document.createElement("p");
    p.className = "hz8-cart-empty-lead";
    p.textContent = "Hitta något du gillar i sortimentet.";
    var nav = document.createElement("nav");
    nav.className = "hz8-cart-empty-links";
    nav.setAttribute("aria-label", "Sortiment");
    nav.innerHTML = cats.map(function (c) { return '<a href="' + esc(HZ8.link(c.href)) + '"><span>' + esc(c.label) + "</span>" + ICON.chev + "</a>"; }).join("");
    var h3 = empty.querySelector("h3");
    if (h3) { h3.parentNode.insertBefore(p, h3.nextSibling); p.parentNode.insertBefore(nav, p.nextSibling); }
  }

  function syncGlobal(a) {
    var g = a.querySelector(".hz8-cart-alert");
    if (!W.global) { if (g) g.remove(); return; }
    if (!g) { g = document.createElement("p"); g.className = "hz8-cart-alert"; g.setAttribute("role", "alert"); var h = a.querySelector(".header"); if (h) h.parentNode.insertBefore(g, h.nextSibling); }
    if (g.textContent !== W.global) g.textContent = W.global;
  }

  /* ================= Öppna / stänga / fokus ================= */
  var release = null;
  var lastTrigger = null;
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("button, a");
    if (t && !t.closest("#cartAside")) lastTrigger = t;
  }, true);
  function syncOpen(wrap, a) {
    var open = wrap.classList.contains("is-active");
    if (open && !release) {
      release = HZ8.trapFocus(a, function () {
        var close = a.querySelector(".close-cart");
        if (close) close.click();
      });
    } else if (!open && release) {
      release();
      release = null;
      if (E.open) closeEditor();
      CP.open = false; CP.error = "";
      var back = lastTrigger && document.contains(lastTrigger) ? lastTrigger : document.getElementById("cart-button");
      if (back) back.focus({ preventScroll: true });
    }
  }

  var queued = 0;
  function schedule() {
    if (queued) return;
    queued = window.setTimeout(function () { queued = 0; sync(); }, 0);
  }
  function sync() {
    var wrap = document.getElementById("cart-side-wrap");
    var a = aside();
    if (!wrap || !a) return;
    if (!a.getAttribute("role")) { a.setAttribute("role", "dialog"); a.setAttribute("aria-modal", "true"); }
    syncHeader(a);
    syncGlobal(a);
    syncGoals(a);
    syncRows(a);
    markNew(a);
    syncPackages(a);
    if (wrap.classList.contains("is-active") || a.querySelector(".hz8-addon")) syncAddon(a);
    syncLedger(a);
    syncCheckout(a);
    syncTrust(a);
    syncEmpty(a);
    restoreRemovalFocus(a);
    if (E.open && !a.querySelector(".hz8-strains")) renderEditor();
    if (a.classList.contains("hz8-view-strains") !== !!E.open) a.classList.toggle("hz8-view-strains", !!E.open);
    syncOpen(wrap, a);
  }

  HZ8.register("cart", function () {
    /* Öppna/stäng ändrar bara klassen på #cart-side-wrap. */
    var attrObserved = false;
    function watchWrap() {
      var wrap = document.getElementById("cart-side-wrap");
      if (!wrap || attrObserved) return;
      attrObserved = true;
      new MutationObserver(sync).observe(wrap, { attributes: true, attributeFilter: ["class"] });
    }
    /* Vue uppdaterar belopp som ren textändring -- synka efter varje
       cart/*-mutation, när Vue hunnit rita om. */
    var subscribed = false, pending = 0;
    function subscribe() {
      var st = HZ8.store();
      if (subscribed || !st || !st.subscribe) return;
      subscribed = true;
      st.subscribe(function (m) {
        if (!/^cart\//.test(m.type)) return;
        if (m.type === "cart/setCart") { W.soon = 0; W.global = null; }
        if (pending) return;
        pending = requestAnimationFrame(function () { pending = 0; window.setTimeout(function () { sync(); paintBusy(); }, 0); });
      });
    }
    HZ8.watch(function () {
      watchWrap();
      subscribe();
      sync();
    });
  });
})();
