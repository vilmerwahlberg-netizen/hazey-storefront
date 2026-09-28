/* Minicart / varukorg. Nyehandel har ingen separat varukorgssida --
   varukorgen ÄR Vue-drawern #cartAside (plus kassans eget steg). All
   varukorgslogik (antal, ta bort, summa, moms, "Till Kassan") är
   plattformens egen och lämnas orörd; Theme 8 läser bara Nyehandels
   Vuex-store och lägger till:
   - fri frakt-indikator (butikens egen regel, se FREE_SHIPPING_FROM),
   - Escape stänger, fokus hålls i drawern medan den är öppen,
   - tillgängliga namn/roll på drawern.
   Allt är idempotent och körs om när Vue ritar om drawern. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  /* "Fri frakt på alla beställningar över 499 kr" -- butikens egen text
     på /sv/page/faq och i produktsidornas USP-rad (admin). Ändra här om
     butiken ändrar sin fraktregel. */
  var FREE_SHIPPING_FROM = 499;
  var BONUS_FROM = 2700;   // prototypens bonusmål (150 kr)
  var BONUS_AMOUNT = 150;
  /* Mål visas bara när kassan faktiskt tillämpar dem. Verifierat
     2026-09-28: Nyehandels kassa tar 49 kr frakt även vid 990 och
     3 168 kr, och ingen bonus/rabatt appliceras vid >2 700 kr -- båda
     målen är därför AV tills butikens frakt-/kampanjregler finns i
     Nyehandel (se slutrapport). */
  HZ8.flags = HZ8.flags || {};
  if (HZ8.flags.freeShippingGoal == null) HZ8.flags.freeShippingGoal = false;
  if (HZ8.flags.bonusGoal == null) HZ8.flags.bonusGoal = false;

  function cartState() {
    var store = HZ8.store();
    var c = store && store.state.cart && store.state.cart.cart;
    if (!c || !c.totals || !c.totals.incVat) return null;
    var money = c.totals.incVat.money;
    var total = money && typeof money.value === "number" ? money.value / 10000 : null;
    return { total: total, count: c.quantity_count || 0 };
  }

  function formatKr(value) {
    return Math.ceil(value).toLocaleString("sv-SE") + " kr";
  }

  /* Tvåstegsmål (fri frakt -> bonus) -- bara när respektive flagga är på. */
  function syncShipping(aside) {
    var footer = aside.querySelector(".section.footer");
    var existing = aside.querySelector(".hz8-cart-shipping");
    var state = cartState();
    var show = HZ8.flags.freeShippingGoal || HZ8.flags.bonusGoal;
    if (!footer || !state || state.total == null || !state.count || !show) {
      if (existing) existing.remove();
      return;
    }
    if (!existing) {
      existing = document.createElement("div");
      existing.className = "hz8-cart-shipping";
      existing.setAttribute("role", "status");
      existing.innerHTML = '<p class="hz8-cart-shipping__text"></p><div class="hz8-cart-shipping__bar" aria-hidden="true"><span></span><i class="hz8-cart-shipping__mark"></i></div>';
      var items = aside.querySelector(".section.items");
      (items ? items.parentNode : aside).insertBefore(existing, items || null);
    }
    var t = state.total, text, pct;
    var fs = HZ8.flags.freeShippingGoal, bo = HZ8.flags.bonusGoal;
    if (fs && t < FREE_SHIPPING_FROM) text = formatKr(FREE_SHIPPING_FROM - t) + " kvar till fri frakt";
    else if (bo && t < BONUS_FROM) text = (fs ? "Fri frakt uppnådd · " : "") + formatKr(BONUS_FROM - t) + " kvar till " + BONUS_AMOUNT + " kr bonus";
    else text = fs && bo ? "Fri frakt + " + BONUS_AMOUNT + " kr bonus uppnått" : fs ? "Fri frakt uppnådd" : BONUS_AMOUNT + " kr bonus uppnådd";
    var max = bo ? BONUS_FROM : FREE_SHIPPING_FROM;
    pct = Math.min(100, Math.max(3, t / max * 100));
    var p = existing.querySelector(".hz8-cart-shipping__text");
    if (p.textContent !== text) p.textContent = text;
    existing.classList.toggle("is-complete", t >= max);
    existing.querySelector(".hz8-cart-shipping__bar span").style.width = pct + "%";
    var mark = existing.querySelector(".hz8-cart-shipping__mark");
    mark.hidden = !(fs && bo);
    mark.style.left = (FREE_SHIPPING_FROM / BONUS_FROM * 100) + "%";
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
        var sig = it.id + ":" + qty + ":" + next.min;
        if (box && box.getAttribute("data-sig") === sig) return;
        if (!box) { box = document.createElement("div"); box.className = "hz8-upgrade"; row.appendChild(box); }
        box.setAttribute("data-sig", sig);
        box.innerHTML = '<p class="hz8-upgrade__text">Uppgradera till <strong>' + next.min + " st</strong> för " + kr(newTotal - nowTotal) + " till" +
          (extraSave >= 0.5 ? ' <span class="hz8-upgrade__save">· du sparar ' + kr(extraSave) + " till</span>" : "") + "</p>" +
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
      ship.innerHTML = "<span>Frakt</span><span>Beräknas i kassan</span>";
      var total = footer.querySelector(".total");
      if (total) total.insertBefore(ship, total.firstChild);
    }
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
    HZ8.watch(function () {
      watchWrap();
      var wrap = document.getElementById("cart-side-wrap");
      var aside = document.getElementById("cartAside");
      if (!wrap || !aside) return;
      if (!aside.getAttribute("role")) {
        aside.setAttribute("role", "dialog");
        aside.setAttribute("aria-modal", "true");
        aside.setAttribute("aria-label", "Din varukorg");
      }
      syncShipping(aside);
      syncHeader(aside);
      syncUpgrades(aside);
      syncSummary(aside);
      syncEmpty(aside);
      syncSavings(aside);
      syncTrust(aside);
      if (wrap.classList.contains("is-active")) syncCrossSell(aside);
      syncOpen(wrap, aside);
    });
  });
})();
