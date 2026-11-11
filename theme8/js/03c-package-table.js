/* Paketens enda datakälla (TASK 20 v5 → TASK 21).
   Basprodukt-id -> {
     home:  basproduktens PDP (paketvalet 1/3/5 och dit paketsidorna
            skickas vidare),
     label: kort kundnamn för paketrader i minicart och kassa
            ("<label> · N-pack"). Ändrar INTE produktnamnet i Nyehandel,
            bara hur Theme 8 visar raden,
     packs: verifierade paketartiklar (route = paketets egen produktsida,
            där pivot_id läses live av loadPivots)
   }.
   Läses av 85-pdp-pilot.js (paketval, omdirigering), 84-cart.js (minicart)
   och build-theme8.js (kassans CSS-regler genereras ur samma tabell --
   kassan kör inte temats JavaScript). Alla paket lästa och kontrollerade
   live 2026-11-11 (core3-pdp-upsell-2026-11/evidence/probe-*.json). */
(function () {
  "use strict";
  window.HZ8.packageTable = {
    255: { home: "/sv/products/thc-x-vape-hero-core-2ml", label: "Hero's Core 2\u00a0ml", packs: [
      { kind: "strain", qty: 3, packageId: 263, route: "/sv/products/pilot-t19-heros-core-2ml-3-pack", verified: true, display: "upsell" },
      { kind: "strain", qty: 5, packageId: 265, route: "/sv/products/heros-core-2ml-5-pack-blandbart", verified: true, display: "upsell" }
    ] },
    261: { home: "/sv/products/vape-magic-sauce-magic-farmers-2ml", label: "Magic Sauce 3.0 2\u00a0ml", packs: [
      { kind: "strain", qty: 3, packageId: 266, route: "/sv/products/magic-sauce-30-2ml-3-pack-blandbart", verified: true, display: "upsell" },
      { kind: "strain", qty: 5, packageId: 267, route: "/sv/products/magic-sauce-30-2ml-5-pack-blandbart", verified: true, display: "upsell" }
    ] },
    260: { home: "/sv/products/magic-sauce-vape-5ml", label: "Magic Sauce 3.0 5\u00a0ml", packs: [
      { kind: "strain", qty: 3, packageId: 268, route: "/sv/products/magic-sauce-30-5ml-3-pack-blandbart", verified: true, display: "upsell" },
      { kind: "strain", qty: 5, packageId: 269, route: "/sv/products/magic-sauce-30-5ml-5-pack-blandbart", verified: true, display: "upsell" }
    ] }
  };
  /* Paketartikelns produkt-id -> { pid, home, label, qty, route }. */
  window.HZ8.packageIdentity = function (packageProductId) {
    var T = window.HZ8.packageTable, out = null;
    Object.keys(T).forEach(function (pid) {
      T[pid].packs.forEach(function (e) {
        if (+e.packageId === +packageProductId) out = { pid: +pid, home: T[pid].home, label: T[pid].label, qty: e.qty, route: e.route };
      });
    });
    return out;
  };
})();
