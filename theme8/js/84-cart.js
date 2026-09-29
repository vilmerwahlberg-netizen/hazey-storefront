/* Minicart / varukorg. Nyehandel har ingen separat varukorgssida --
   varukorgen ÄR Vue-drawern #cartAside (plus kassans eget steg). All
   varukorgslogik (antal, ta bort, summa, moms, "Till Kassan") är
   plattformens egen och lämnas orörd; Theme 8 läser bara Nyehandels
   Vuex-store och lägger till:
   - statusyta fri frakt -> 150 kr bonus (regler i 02a-commerce.js),
   - Escape stänger, fokus hålls i drawern medan den är öppen,
   - tillgängliga namn/roll på drawern.
   Allt är idempotent och körs om när Vue ritar om drawern. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  var C = HZ8.commerce; // gemensamma frakt-/bonusregler (02a-commerce.js)

  function cartState() {
    var store = HZ8.store();
    var c = store && store.state.cart && store.state.cart.cart;
    if (!c || !c.totals || !c.totals.incVat) return null;
    var money = c.totals.incVat.money;
    var total = money && typeof money.value === "number" ? money.value / 10000 : null;
    return { total: total, count: c.quantity_count || 0 };
  }

  /* Statusyta fri frakt -> 150 kr bonus, nära ordersumman. Allt räknas
     av HZ8.commerce på Nyehandels verkliga korg; tom korg eller okänt
     belopp (aktiv kod utan verifierat nettobelopp) -> ingen mätare. */
  function syncGoals(aside) {
    var footer = aside.querySelector(".section.footer");
    var el = aside.querySelector(".hz8-goal");
    var s = C.current();
    if (!footer || !s || !s.known || s.stage === "empty" || !C.goalsEnabled()) {
      if (el) el.remove();
      return;
    }
    if (!el) {
      el = document.createElement("div");
      el.className = "hz8-goal";
      el.innerHTML = '<p class="hz8-goal__text" aria-live="polite" aria-atomic="true"></p>' +
        '<div class="hz8-goal__track" aria-hidden="true"><span class="hz8-goal__fill"></span></div>';
    }
    var total = footer.querySelector(".total");
    if (el.parentNode !== footer || el.nextElementSibling !== total) footer.insertBefore(el, total || footer.firstChild);
    var R = C.rules, html;
    if (s.stage === "shipping") html = "<strong>" + C.kr(s.shipping.remaining) + "</strong> kvar till fri frakt";
    else if (s.stage === "bonus") html = '<span class="hz8-goal__ok">Fri frakt<span class="hz8-visually-hidden"> uppnådd.</span></span> <span><strong>' + C.kr(s.bonus.remaining) + "</strong> kvar till " + R.bonusAmount + " kr bonus</span>";
    else html = '<span class="hz8-goal__ok">Fri frakt + ' + R.bonusAmount + " kr bonus uppnått</span>";
    var p = el.querySelector(".hz8-goal__text");
    if (p.innerHTML !== html) p.innerHTML = html;
    el.setAttribute("data-stage", s.stage);
    var prog = s.stage === "shipping" ? s.shipping.progress : s.stage === "bonus" ? s.bonus.progress : 1;
    el.querySelector(".hz8-goal__fill").style.transform = "scaleX(" + prog.toFixed(4) + ")";
  }

  function parseKr(t) { var m = String(t || "").replace(/\s/g, "").match(/(\d+(?:,\d+)?)/); return m ? parseFloat(m[1].replace(",", ".")) : 0; }
  function kr(v) { var r = Math.round(v * 100) / 100; return r.toLocaleString("sv-SE", { minimumFractionDigits: r % 1 ? 2 : 0, maximumFractionDigits: 2 }) + " kr"; }
  function cartItems() {
    var store = HZ8.store();
    var c = store && store.state.cart && store.state.cart.cart;
    return c && c.items ? c.items : [];
  }

  /* Rubrikens artikelantal + live region (tillagd/borttagen/uppdaterad). */
  var lastCount = null;
  function syncHeader(aside) {
    var state = cartState();
    var head = aside.querySelector(".header");
    if (!head) return;
    var badge = head.querySelector(".hz8-cart-count");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "hz8-cart-count";
      var h2 = head.querySelector("h2");
      if (h2) h2.appendChild(badge);
    }
    var n = state ? state.count : 0;
    var txt = n ? "(" + n + ")" : "";
    var h2 = head.querySelector("h2");
    if (h2 && h2.firstChild && h2.firstChild.nodeType === 3 && /Din varukorg/.test(h2.firstChild.textContent)) h2.firstChild.textContent = "Varukorg ";
    if (badge.textContent !== txt) badge.textContent = txt;
    var live = document.getElementById("hz8-cart-live");
    if (!live) {
      live = document.createElement("div");
      live.id = "hz8-cart-live";
      live.className = "hz8-visually-hidden";
      live.setAttribute("aria-live", "polite");
      document.body.appendChild(live);
    }
    if (lastCount !== null && n !== lastCount) live.textContent = n > lastCount ? "Varukorgen uppdaterad: " + n + " artiklar" : (n ? "Varukorgen uppdaterad: " + n + " artiklar" : "Varukorgen är tom");
    lastCount = n;
  }

  /* Verklig besparing: Nyehandels jämförelsebelopp per rad
     (formatted_comparison_row_total) minus radens total. */
  function syncSavings(aside) {
    var footer = aside.querySelector(".section.footer");
    var el = aside.querySelector(".hz8-cart-savings");
    var saved = cartItems().reduce(function (sum, i) {
      if (!i.has_compare) return sum;
      var cmp = parseKr(i.formatted_comparison_row_total);
      var tot = parseKr(i.formatted_total);
      return cmp > tot ? sum + (cmp - tot) : sum;
    }, 0);
    if (!footer || saved < 0.5) { if (el) el.remove(); return; }
    if (!el) {
      el = document.createElement("div");
      el.className = "hz8-cart-savings";
      var total = footer.querySelector(".total");
      footer.insertBefore(el, total ? total.nextSibling : footer.firstChild);
    }
    var txt = "Du sparar " + kr(saved);
    if (el.textContent !== txt) el.textContent = txt;
  }

  /* Trygghetsrad -- samma verifierade punkter som footern. */
  function syncTrust(aside) {
    var footer = aside.querySelector(".section.footer");
    if (!footer || !cartItems().length) { var old = aside.querySelector(".hz8-cart-trust"); if (old) old.remove(); return; }
    if (aside.querySelector(".hz8-cart-trust")) return;
    var t = document.createElement("ul");
    t.className = "hz8-cart-trust";
    t.innerHTML = "<li>Trygg betalning</li><li>Diskret paket</li><li>Skickas från Sverige</li>";
    footer.appendChild(t);
  }

  /* "Komplettera din order": andra produkter ur samma serie som varorna
     i korgen (relationskartans seriehubbar -- verifierad relation), inte
     redan i korgen, max 3. Direktköp via Nyehandels action; variant-
     produkter leder till produktsidan. Ingen data -> inget område. */
  var xsellKey = null;
  function productPathOf(href) { return HZ8.path(href || "").split("?")[0].replace(/\/\d+$/, ""); }
  function syncCrossSell(aside) {
    var items = cartItems();
    var list = aside.querySelector(".section.items");
    var host = aside.querySelector(".hz8-xsell");
    if (!items.length || !list || !HZ8.catalog) { if (host) host.remove(); xsellKey = null; return; }
    var inCart = {};
    items.forEach(function (i) { inCart[productPathOf(i.href)] = true; });
    var key = Object.keys(inCart).sort().join("|");
    if (key === xsellKey && host) return;
    xsellKey = key;
    var hubs = HZ8.catalog.build().series.filter(function (x) { return x.hub; });
    var bat = HZ8.catalog.formatByKey("batterier");
    var pageText = { key: "text1", run: function (doc) { return ((doc.getElementById("product-page") || doc.body).textContent || "").slice(0, 20000); } };
    var brandOf = function (c) { var m = c.html.match(/class="brand"[^>]*>\s*([^<]+?)\s*</); return m ? m[1].trim() : ""; };
    var pathOf = function (c) { var m = c.html.match(/href="([^"]*\/products\/[^"]+)"/); return m ? productPathOf(m[1]) : ""; };
    /* 1) Kompatibelt tillbehör: cart i korgen och inget batteri -> batterier
       vars varumärke nämns i cartens egen produkttext. */
    var carts = items.filter(function (i) { return /^\s*cart\b/i.test(i.name || ""); });
    var compat = !bat || !carts.length ? Promise.resolve([]) : HZ8.fetchPage(bat.href, HZ8.categoryCards).then(function (bcards) {
      var batPaths = bcards.map(pathOf);
      if (items.some(function (i) { return batPaths.indexOf(productPathOf(i.href)) !== -1; })) return [];
      return Promise.all(carts.map(function (c) { return HZ8.fetchPage(c.href, pageText).catch(function () { return ""; }); })).then(function (texts) {
        var t = texts.join(" ");
        return bcards.filter(function (c) { var br = brandOf(c); return br && new RegExp("\\b" + br.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b", "i").test(t); });
      });
    }).catch(function () { return []; });
    /* 2) Kompletterande produkter ur samma serie. */
    var series = Promise.all(hubs.map(function (h) {
      return HZ8.fetchPage(h.hub, HZ8.categoryCards).then(function (cards) { return { series: h, cards: cards }; }).catch(function () { return null; });
    })).then(function (res) {
      var out = [];
      res.forEach(function (r) {
        if (!r) return;
        var paths = r.cards.map(pathOf);
        if (!paths.some(function (p) { return inCart[p]; })) return;
        r.cards.forEach(function (c) { out.push(c); });
      });
      return out;
    });
    Promise.all([compat, series]).then(function (lists) {
      var seen = {};
      var cands = lists[0].concat(lists[1]).filter(function (c) {
        var p = pathOf(c);
        if (!p || inCart[p] || seen[p]) return false;
        seen[p] = true; return true;
      }).slice(0, 8);
      /* Bara köpbara (Nyehandels product/state). */
      return Promise.all(cands.map(function (c) {
        var a = c.html.match(/href="([^"]*\/products\/[^"]+)"/);
        /* Giltigt pris krävs (kortets eget pris, > 0 kr). */
        var tmp = document.createElement("div"); tmp.innerHTML = c.html;
        var pr = tmp.querySelector(".price ins") || tmp.querySelector(".price");
        if (!pr || !(C.parseKr(pr.textContent) > 0)) return null;
        return HZ8.productState(a[1]).then(function (st) { return st.buyable ? c : null; }).catch(function () { return null; });
      }));
    }).then(function (checked) {
      if (xsellKey !== key) return;
      var picks = checked.filter(Boolean).slice(0, 3);
      var cur = aside.querySelector(".hz8-xsell");
      if (!picks.length) { if (cur) cur.remove(); return; }
      var box = cur || document.createElement("section");
      box.className = "hz8-xsell";
      box.setAttribute("aria-labelledby", "hz8-xsell-title");
      box.innerHTML = '<h3 id="hz8-xsell-title">Komplettera din order</h3><ul class="hz8-xsell__list">' + picks.map(function (c) {
        var tmp = document.createElement("div"); tmp.innerHTML = c.html;
        var a = tmp.querySelector("a[href*='/products/']"); var img = tmp.querySelector("img");
        var name = (tmp.querySelector(".name") || {}).textContent || "";
        var price = (tmp.querySelector(".price ins") || tmp.querySelector(".price") || {}).textContent || "";
        var variants = !!tmp.querySelector(".has-variants");
        var href = HZ8.link(a ? a.getAttribute("href") : "#");
        return '<li class="hz8-xsell__item"><a class="hz8-xsell__media" href="' + HZ8.esc(href) + '" tabindex="-1" aria-hidden="true">' + (img ? '<img src="' + HZ8.esc(img.getAttribute("src")) + '" alt="" loading="lazy" width="80" height="80">' : "") + "</a>" +
          '<div class="hz8-xsell__text"><a href="' + HZ8.esc(href) + '">' + HZ8.esc(name.trim()) + '</a><span>' + HZ8.esc(price.trim()) + "</span></div>" +
          (variants ? '<a class="hz8-xsell__btn" href="' + HZ8.esc(href) + '" aria-label="Välj variant: ' + HZ8.esc(name.trim()) + '">Välj</a>'
                    : '<button type="button" class="hz8-xsell__btn" data-href="' + HZ8.esc(href) + '" aria-label="Lägg i varukorgen: ' + HZ8.esc(name.trim()) + '">Lägg till</button>') + "</li>";
      }).join("") + "</ul>";
      if (!cur) list.parentNode.insertBefore(box, list.nextSibling);
    });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".hz8-xsell__btn[data-href]");
    if (!b || b.getAttribute("aria-busy") === "true") return;
    var href = b.getAttribute("data-href");
    b.setAttribute("aria-busy", "true"); b.textContent = "…";
    HZ8.productState(href).then(function (st) {
      if (!st.variantId || !st.buyable || st.variants > 1) { location.href = href; return null; }
      return HZ8.addVariant(st.variantId);
    }).catch(function () { location.href = href; }).finally(function () { b.removeAttribute("aria-busy"); b.textContent = "Lägg till"; });
  });

  /* ---- Paketuppgradering per korgrad ----
     Nästa riktiga nivå i produktens pristrappa (product/state, prices[].
     price.tier). Uppgradering = samma strain, högre antal (PUT
     /frontend-api/cart/item/{id} + cart/reload) -- Nyehandel sätter
     nivåpriset, inga dubbla rader. Nya strains i samma paket kräver
     paketprodukter (se theme8/blocks/MIXED-PACKS.md). */
  var tierCache = {};
  function tiersFor(productId) {
    if (tierCache[productId]) return tierCache[productId];
    tierCache[productId] = fetch("/frontend-api/product/state", {
      method: "POST", credentials: "same-origin", headers: HZ8.apiHeaders(),
      body: JSON.stringify({ product_id: productId, variant_ids: [null] })
    }).then(function (r) { return r.json(); }).then(function (d) {
      var v = (d.product && d.product.variants || [])[0];
      var byVariant = {};
      (d.product && d.product.variants || []).forEach(function (x) { byVariant[x.id] = x; });
      return { tiers: (v && v.prices || []).map(function (p) { return { min: p.price.tier, unit: parseKr(p.price.formatted_price) }; }).filter(function (t) { return t.min; }).sort(function (a, b) { return a.min - b.min; }), variants: byVariant };
    }).catch(function () { return { tiers: [], variants: {} }; });
    return tierCache[productId];
  }
  function syncUpgrades(aside) {
    var items = cartItems();
    var rows = aside.querySelectorAll("#cartAside article.item");
    items.forEach(function (it, idx) {
      var row = rows[idx];
      if (!row) return;
      var qty = parseFloat(it.quantity) || 1;
      tiersFor(it.product_id).then(function (info) {
        var next = info.tiers.filter(function (t) { return t.min > qty; })[0];
        var v = info.variants[it.variant_id];
        var box = row.querySelector(".hz8-upgrade");
        var stockOk = !v || !v.track_inventory || v.available_stock >= (next ? next.min : 0);
        if (!next || !stockOk) { if (box) box.remove(); return; }
        var nowTotal = parseKr(it.formatted_total);
        var newTotal = next.min * next.unit;
        var cur = info.tiers.filter(function (t) { return t.min <= qty; }).pop() || info.tiers[0];
        var extraSave = next.min * (cur.unit - next.unit);
        /* Når uppgraderingen nästa mål? Räknat på korgens verkliga
           varuvärde + prisskillnaden enligt Nyehandels egen pristrappa. */
        var hint = "", cs = C.current();
        if (cs && cs.known && C.goalsEnabled()) {
          var after = C.evaluate(cs.goods + (newTotal - nowTotal), cs.count);
          if (!cs.bonus.reached && after.bonus.reached) hint = C.rules.bonusAmount + " kr bonus";
          else if (!cs.shipping.reached && after.shipping.reached) hint = "fri frakt";
        }
        var sig = it.id + ":" + qty + ":" + next.min + ":" + hint;
        if (box && box.getAttribute("data-sig") === sig) return;
        if (!box) { box = document.createElement("div"); box.className = "hz8-upgrade"; row.appendChild(box); }
        box.setAttribute("data-sig", sig);
        box.innerHTML = '<p class="hz8-upgrade__text">Uppgradera till <strong>' + next.min + " st</strong> för " + kr(newTotal - nowTotal) + " till" +
          (extraSave >= 0.5 ? ' <span class="hz8-upgrade__save">· du sparar ' + kr(extraSave) + " till</span>" : "") +
          (hint ? ' <span class="hz8-upgrade__goal">· ger ' + hint + "</span>" : "") + "</p>" +
          '<button type="button" class="hz8-upgrade__btn" data-item="' + it.id + '" data-qty="' + next.min + '">Uppgradera</button>';
      });
    });
  }
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest(".hz8-upgrade__btn");
    if (!b || b.getAttribute("aria-busy") === "true") return;
    b.setAttribute("aria-busy", "true"); b.textContent = "…";
    var id = b.getAttribute("data-item"), q = +b.getAttribute("data-qty");
    fetch("/frontend-api/cart/item/" + id, { method: "PUT", credentials: "same-origin", headers: HZ8.apiHeaders(), body: JSON.stringify({ id: +id, quantity: q }) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); var st = HZ8.store(); return st && st.dispatch("cart/reload"); })
      .catch(function () { b.textContent = "Försök igen"; b.removeAttribute("aria-busy"); });
  });

  /* ---- Ordersammanställning + kassaknapp med total ---- */
  function syncSummary(aside) {
    var footer = aside.querySelector(".section.footer");
    var state = cartState();
    if (!footer || !state || !state.count) return;
    var ship = footer.querySelector(".hz8-cart-shipline");
    if (!ship) {
      ship = document.createElement("div");
      ship.className = "hz8-cart-shipline";
      ship.innerHTML = "<span>Frakt</span><span></span>";
    }
    var total = footer.querySelector(".total");
    if (total && ship.parentNode !== total) total.insertBefore(ship, total.firstChild);
    /* Fraktkostnaden visas bara när regeln får visas (se
       HZ8.commerce.goalsEnabled) -- annars räknar kassan fram den. */
    var s = C.current();
    var shipTxt = s && s.known && C.goalsEnabled() ? (s.shippingCost ? C.kr(s.shippingCost) + " tillkommer" : "Fri frakt") : "Beräknas i kassan";
    var shipVal = ship.lastElementChild;
    if (shipVal.textContent !== shipTxt) shipVal.textContent = shipTxt;
    ship.classList.toggle("is-free", shipTxt === "Fri frakt");
    var btn = footer.querySelector(".button.buy");
    var label = "Till kassan · " + kr(state.total);
    if (btn && btn.getAttribute("data-hz8-label") !== label) { btn.setAttribute("data-hz8-label", label); btn.setAttribute("aria-label", label); }
    var trust = aside.querySelector(".hz8-cart-trust");
    if (trust && btn && trust.previousElementSibling !== btn) btn.parentNode.insertBefore(trust, btn.nextSibling);
  }

  /* ---- Tom korg: riktiga ingångar ---- */
  function syncEmpty(aside) {
    var empty = aside.querySelector("section.empty");
    var st = cartState();
    if (st && st.count) { aside.querySelectorAll(".hz8-cart-empty-links, .hz8-cart-empty-lead").forEach(function (n) { n.remove(); }); return; }
    if (!empty || empty.querySelector(".hz8-cart-empty-links")) return;
    var cats = (HZ8.navCategories || []).filter(function (c) { return !c.campaign && /\/categories\//.test(c.href || ""); });
    if (!cats.length) return;
    var p = document.createElement("p");
    p.className = "hz8-cart-empty-lead";
    p.textContent = "Hitta något du gillar i sortimentet.";
    var nav = document.createElement("nav");
    nav.className = "hz8-cart-empty-links";
    nav.setAttribute("aria-label", "Sortiment");
    nav.innerHTML = cats.map(function (c) { return '<a href="' + HZ8.esc(HZ8.link(c.href)) + '">' + HZ8.esc(c.label) + "</a>"; }).join("");
    var h3 = empty.querySelector("h3");
    if (h3) { h3.parentNode.insertBefore(p, h3.nextSibling); p.parentNode.insertBefore(nav, p.nextSibling); }
  }

  var release = null;
  /* Utlösaren (varukorgsikon, köpknapp ...) sparas vid klick, eftersom
     Nyehandel själv flyttar fokus till drawern innan fällan startar. */
  var lastTrigger = null;
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest("button, a");
    if (t && !t.closest("#cartAside")) lastTrigger = t;
  }, true);
  function syncOpen(wrap, aside) {
    var open = wrap.classList.contains("is-active");
    if (open && !release) {
      release = HZ8.trapFocus(aside, function () {
        var close = aside.querySelector(".close-cart");
        if (close) close.click();
      });
    } else if (!open && release) {
      release();
      release = null;
      if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus({ preventScroll: true });
    }
  }

  HZ8.register("cart", function () {
    /* Öppning/stängning ändrar bara klassen på #cart-side-wrap (ingen
       childList-mutation) -- bevakas separat så att fokusfälla/Escape
       alltid gäller, även för tom korg. */
    var attrObserved = false;
    function watchWrap() {
      var wrap = document.getElementById("cart-side-wrap");
      var aside = document.getElementById("cartAside");
      if (!wrap || !aside || attrObserved) return;
      attrObserved = true;
      new MutationObserver(function () {
        syncOpen(wrap, document.getElementById("cartAside") || aside);
        if (wrap.classList.contains("is-active")) syncCrossSell(document.getElementById("cartAside") || aside);
      }).observe(wrap, { attributes: true, attributeFilter: ["class"] });
    }
    /* Vue uppdaterar belopp som ren textändring (ingen childList-
       mutation) -- därför synkas också vid varje cart/*-mutation i
       Nyehandels Vuex-store, efter att Vue hunnit rita om. */
    var subscribed = false, pending = 0;
    function subscribe() {
      var st = HZ8.store();
      if (subscribed || !st || !st.subscribe) return;
      subscribed = true;
      st.subscribe(function (m) {
        if (!/^cart\//.test(m.type) || pending) return;
        pending = requestAnimationFrame(function () { pending = 0; setTimeout(sync, 0); });
      });
    }
    function sync() {
      var wrap = document.getElementById("cart-side-wrap");
      var aside = document.getElementById("cartAside");
      if (!wrap || !aside) return;
      if (!aside.getAttribute("role")) {
        aside.setAttribute("role", "dialog");
        aside.setAttribute("aria-modal", "true");
        aside.setAttribute("aria-label", "Din varukorg");
      }
      syncGoals(aside);
      syncHeader(aside);
      syncUpgrades(aside);
      syncSummary(aside);
      syncEmpty(aside);
      syncSavings(aside);
      syncTrust(aside);
      if (wrap.classList.contains("is-active")) syncCrossSell(aside);
      syncOpen(wrap, aside);
    }
    HZ8.watch(function () {
      watchWrap();
      subscribe();
      sync();
    });
  });
})();
