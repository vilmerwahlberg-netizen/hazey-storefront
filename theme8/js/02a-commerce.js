/* Gemensam handelsberäkning -- EN källa för frakt- och bonusregler.

   Facit = WooCommerce på hazey.se, uppmätt 2026-09-29 med gästkorgar
   (theme8/blocks/COMMERCE-RULES.md):
   - frakt 79 kr inkl. moms under 499 kr, fri frakt från exakt 499 kr,
   - bonus "150 kr bonus" från exakt 2 700 kr (dras INTE av från ordern;
     mekanismen är okänd, så bara statusen kommuniceras),
   - båda gränserna räknas på varuvärdet efter produkt- och kodrabatter,
     exklusive frakt,
   - leverans endast inom Sverige, fraktalternativ "Garanterad Leverans".

   Minicart, produktsida och köpbar läser härifrån -- lägg aldrig egna
   gränsvärden i en komponent.

   LANSERINGSSPÄRR: backendVerified är false tills Nyehandels kassa
   faktiskt tar 79 kr under 499 kr och 0 kr från 499 kr (se
   theme8/blocks/ADMIN-TODO.md). Fram till dess visas mål och
   fraktlöften bara i Theme 8-förhandsvisningen (?preview=<token>),
   aldrig för kunder på ett publicerat tema. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  if (!HZ8 || HZ8.commerce) return;
  var PREVIEW_TOKEN = "v9kzdmqz4w60l5n"; // Theme 8 (ALDRIG Theme 6)

  var RULES = Object.freeze({
    freeShippingFrom: 499,
    shippingFee: 79,
    bonusFrom: 2700,
    bonusAmount: 150,
    shippingName: "Garanterad Leverans",
    countries: ["SE"],
    /* Ingår en aktiv kodrabatt (cart_coupon) redan i totals.incVat?
       Ej verifierat (ingen kod finns i Nyehandel att testa med) --
       null = okänt -> ingen mätare när en kod är aktiv. */
    couponIncludedInTotal: null,
    backendVerified: false
  });

  function inPreview() {
    try { return new URLSearchParams(location.search).get("preview") === PREVIEW_TOKEN; } catch (e) { return false; }
  }

  /* Öresavrundning: Nyehandels belopp är heltal i 1/10 000 kr. */
  function ore(v) { return Math.round(v * 100) / 100; }

  function goal(from, goods) {
    var remaining = ore(Math.max(0, from - goods));
    return {
      from: from,
      reached: remaining <= 0,
      remaining: remaining,
      progress: Math.max(0, Math.min(1, goods / from))
    };
  }

  /* Ren beräkning utifrån varuvärde (kr, inkl. moms, efter rabatter). */
  function evaluate(goods, count) {
    goods = ore(Math.max(0, goods || 0));
    var shipping = goal(RULES.freeShippingFrom, goods);
    var bonus = goal(RULES.bonusFrom, goods);
    var stage = !count ? "empty" : !shipping.reached ? "shipping" : !bonus.reached ? "bonus" : "done";
    return {
      known: true,
      goods: goods,
      count: count || 0,
      stage: stage,
      shipping: shipping,
      bonus: bonus,
      shippingCost: shipping.reached ? 0 : RULES.shippingFee
    };
  }

  /* Från Nyehandels korg (Vuex state.cart.cart). totals.incVat är
     summan av radernas totaler (radrabatter redan dragna). En kod-
     rabatt ligger separat i cart_coupon; om den är aktiv men det inte
     går att avgöra beloppet efter rabatt returneras known:false och
     komponenterna visar ingen mätare hellre än en felaktig. */
  function fromCart(cart) {
    if (!cart || !cart.totals || !cart.totals.incVat) return null;
    var money = cart.totals.incVat.money;
    if (!money || typeof money.value !== "number") return null;
    var goods = money.value / 10000;
    var coupon = cart.cart_coupon;
    if (coupon && coupon.cart_discount > 0) {
      var off = parseKr(coupon.cart_discount_formatted);
      /* Nyehandels minicart visar rabatten som en egen rad under
         totalsumman -- om totalen redan är rabatterad är okänt. */
      if (!off || RULES.couponIncludedInTotal == null) return { known: false, count: cart.quantity_count || 0 };
      if (!RULES.couponIncludedInTotal) goods -= off;
    }
    return evaluate(goods, cart.quantity_count || 0);
  }

  function parseKr(t) {
    var m = String(t || "").replace(/\s| /g, "").match(/(\d+(?:,\d+)?)/);
    return m ? parseFloat(m[1].replace(",", ".")) : 0;
  }

  function kr(v) {
    var r = ore(v);
    return r.toLocaleString("sv-SE", { minimumFractionDigits: r % 1 ? 2 : 0, maximumFractionDigits: 2 }) + " kr";
  }

  /* Kundtexter -- samma status som WooCommerce, inga övriga löften. */
  function statusText(s) {
    if (!s || !s.known || s.stage === "empty") return "";
    if (s.stage === "shipping") return kr(s.shipping.remaining) + " kvar till fri frakt";
    if (s.stage === "bonus") return kr(s.bonus.remaining) + " kvar till " + RULES.bonusAmount + " kr bonus";
    return "Fri frakt + " + RULES.bonusAmount + " kr bonus uppnått";
  }

  HZ8.commerce = {
    rules: RULES,
    evaluate: evaluate,
    fromCart: fromCart,
    current: function () {
      var st = HZ8.store();
      return fromCart(st && st.state.cart && st.state.cart.cart);
    },
    statusText: statusText,
    kr: kr,
    parseKr: parseKr,
    /* Får frakt-/bonuslöften visas? Bara när Nyehandel verifierat
       tillämpar reglerna, eller i Theme 8-förhandsvisningen. */
    goalsEnabled: function () { return RULES.backendVerified || inPreview(); },
    /* Verifierade, generella fraktrader (inga transportörer/leveranstider). */
    deliveryLines: function () {
      var lines = ["Skickas från Sverige", "Diskret förpackning"];
      if (RULES.backendVerified || inPreview()) {
        lines.unshift("Fri frakt från " + RULES.freeShippingFrom + " kr", RULES.shippingFee + " kr frakt under " + RULES.freeShippingFrom + " kr");
        lines.push("Endast leverans inom Sverige");
      }
      return lines;
    }
  };
})();
