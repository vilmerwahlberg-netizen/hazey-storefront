/* PROTOTYP för förslaget, inte produktion. Räknar storlekar ur samma
   lagerfiltrerade Nyehandel-kort som sortimentsledet (I lager-filtret) och
   fyller storleksraden + sammanfattningsraden. Ingen siffra skrivs utan
   data; storlek med 0 i lager döljs. Injiceras bara av render.mjs. */
(function () {
  var HZ8 = window.HZ8, root = document.querySelector(".hz8-lp--format");
  if (!HZ8 || !root) return;
  /* Mallfix som behövs i produktion (88b shortName): avkoda entiteter ur
     katalognamnet och kapa halt-prefix ("CBD 56%") och volym ("1+1ml"),
     så att vägens sortnamn blir bara smaknamnet. */
  function tidyNames() {
    root.querySelectorAll(".hz8-lp__path-names a").forEach(function (a) {
      var t = a.textContent.replace(/&amp;/g, "&").replace(/^[A-Za-z0-9-]+\s+\d+(?:[.,]\d+)?%\s*/, "").replace(/\s*\d+(?:\+\d+)?\s*ml$/i, "").trim();
      if (t && t !== a.textContent) a.textContent = t; // spärr: skriv bara vid ändring (annars observer-loop)
    });
  }
  new MutationObserver(tidyNames).observe(root, { childList: true, subtree: true }); tidyNames();
  var src = (root.querySelector("[data-hz8-lp-products]").getAttribute("data-hz8-sources") || "").split(/\s+/).filter(Boolean);
  function kr(n) { return n.toLocaleString("sv-SE") + " kr"; }
  Promise.all(src.map(function (s) { return HZ8.fetchPage(s + "?filters=smart-filter_in-stock", HZ8.categoryCards).catch(function () { return []; }); })).then(function (lists) {
    var seen = {}, by = {};
    [].concat.apply([], lists).forEach(function (c) {
      var box = document.createElement("div"); box.innerHTML = c.html;
      var a = box.querySelector('a[href*="/products/"]'), name = (box.querySelector(".name") || {}).textContent || "";
      var key = a ? a.getAttribute("href").split("?")[0] : name; if (seen[key]) return; seen[key] = 1;
      if (HZ8.variantCards && HZ8.variantCards.isPackageCard && HZ8.variantCards.isPackageCard(c.html)) return;
      var m = name.replace(/\s/g, "").match(/(\d\+\d|\d+)ml/i); if (!m) return;
      var size = m[1] + "ml", price = parseInt(((box.querySelector(".price ins, .price") || {}).textContent || "").replace(/[^\d]/g, ""), 10);
      var g = by[size] || (by[size] = { n: 0, min: Infinity }); g.n++; if (price) g.min = Math.min(g.min, price);
    });
    var total = 0, shown = [];
    root.querySelectorAll("[data-hz8-size]").forEach(function (li) {
      var g = by[li.getAttribute("data-hz8-size")];
      if (!g) { li.hidden = true; return; }
      total += g.n; shown.push(li.querySelector("strong").textContent.replace(" ml", ""));
      li.querySelector("[data-hz8-size-live]").innerHTML = "<b>" + g.n + (g.n === 1 ? " produkt" : " produkter") + "</b>" + (isFinite(g.min) ? "från " + kr(g.min) : "");
    });
    var line = root.querySelector("[data-hz8-format-summary]");
    if (line && total) {
      line.innerHTML = "<strong>" + total + " produkter i lager</strong> · " + shown.join(", ").replace(/, ([^,]*)$/, " och $1") + " ml";
      line.hidden = false;
    }
  });
})();
