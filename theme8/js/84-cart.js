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

  function syncShipping(aside) {
    var footer = aside.querySelector(".section.footer");
    var existing = aside.querySelector(".hz8-cart-shipping");
    var state = cartState();
    if (!footer || !state || state.total == null || !state.count) {
      if (existing) existing.remove();
      return;
    }
    if (!existing) {
      existing = document.createElement("div");
      existing.className = "hz8-cart-shipping";
      existing.setAttribute("role", "status");
      existing.innerHTML = '<p class="hz8-cart-shipping__text"></p><div class="hz8-cart-shipping__bar" aria-hidden="true"><span></span></div>';
      footer.insertBefore(existing, footer.firstChild);
    }
    var left = FREE_SHIPPING_FROM - state.total;
    var text = left > 0
      ? "Handla för " + formatKr(left) + " till för fri frakt"
      : "Du har fri frakt";
    var p = existing.querySelector(".hz8-cart-shipping__text");
    if (p.textContent !== text) p.textContent = text;
    existing.classList.toggle("is-complete", left <= 0);
    existing.querySelector(".hz8-cart-shipping__bar span").style.width = Math.min(100, Math.max(4, state.total / FREE_SHIPPING_FROM * 100)) + "%";
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
    Promise.all(hubs.map(function (h) {
      return HZ8.fetchPage(h.hub, HZ8.categoryCards).then(function (cards) { return { series: h, cards: cards }; }).catch(function () { return null; });
    })).then(function (res) {
      if (xsellKey !== key) return;
      var picks = [];
      var seen = {};
      res.forEach(function (r) {
        if (!r) return;
        var paths = r.cards.map(function (c) { var m = c.html.match(/href="([^"]*\/products\/[^"]+)"/); return m ? productPathOf(m[1]) : ""; });
        if (!paths.some(function (p) { return inCart[p]; })) return;
        r.cards.forEach(function (c, idx) {
          var p = paths[idx];
          if (!p || inCart[p] || seen[p] || picks.length >= 3) return;
          seen[p] = true;
          picks.push(c);
        });
      });
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
      syncSavings(aside);
      syncTrust(aside);
      if (wrap.classList.contains("is-active")) syncCrossSell(aside);
      syncOpen(wrap, aside);
    });
  });
})();
