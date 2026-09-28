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
      : "Din order har fri frakt";
    var p = existing.querySelector(".hz8-cart-shipping__text");
    if (p.textContent !== text) p.textContent = text;
    existing.classList.toggle("is-complete", left <= 0);
    existing.querySelector(".hz8-cart-shipping__bar span").style.width = Math.min(100, Math.max(4, state.total / FREE_SHIPPING_FROM * 100)) + "%";
  }

  var release = null;
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
    }
  }

  HZ8.register("cart", function () {
    HZ8.watch(function () {
      var wrap = document.getElementById("cart-side-wrap");
      var aside = document.getElementById("cartAside");
      if (!wrap || !aside) return;
      if (!aside.getAttribute("role")) {
        aside.setAttribute("role", "dialog");
        aside.setAttribute("aria-modal", "true");
        aside.setAttribute("aria-label", "Din varukorg");
      }
      syncShipping(aside);
      syncOpen(wrap, aside);
    });
  });
})();
