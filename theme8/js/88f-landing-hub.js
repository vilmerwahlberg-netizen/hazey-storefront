/* Rättslägeshubben (theme8/blocks/rattslage.html, .hz8-atlas--hub) i
   fältatlasfamiljen. Hela ämnesindexet -- ämnen, status, datum, källor och
   länkar -- står som en vanlig tabell i blockets initiala HTML. Modulen lägger
   bara till två saker ovanpå, och sidan fungerar fullt ut utan den:

   1. Sök: ett sökfält ovanför tabellen som filtrerar raderna på ämnesnamn,
      skrivsätt och status (data-hz8-terms + radens text). Antal träffar
      meddelas via aria-live. Inga träffar -> en rad med länk till metoden.
      Raderna döljs bara visuellt i tabellen; länkarna finns kvar i DOM:en.
   2. Öppningsbara rader på smal skärm (< 768 px): varje rad visar ämne och
      status, och en knapp (aria-expanded) visar datum, källa och fördjupning.
      Över 768 px och utan JS är allt synligt som en tabell.

   html.hz8-atlas-page sätts av 88e (samma .hz8-lp--atlas-rot). */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  if (!HZ8) return;

  var NARROW = "(max-width: 767px)";

  /* Ett ord: gemener, utan diakritiska tecken och utan bindestreck/skiljetecken
     (THC-H och thch blir samma). Raden indexeras ord för ord, så att ord från
     olika celler inte flyter ihop ("THCB" + "delta" gav annars träff på "cbd"). */
  function word(s) {
    return (s || "").toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[\-–_.,/()]+/g, "");
  }
  function rowIndex(s) { return " " + (s || "").split(/\s+/).map(word).filter(Boolean).join(" ") + " "; }
  function query(s) { return word(s).replace(/\s+/g, ""); }

  function setupSearch(root, table) {
    var rows = Array.prototype.slice.call(table.querySelectorAll("tbody tr"));
    if (!rows.length || root.querySelector(".hz8-hub__search")) return;
    /* Textnoderna var för sig: namn och skrivsätt står i intilliggande spans utan
       mellanslag ("THCB" + "delta-9-…"), och textContent skulle limma ihop dem. */
    function words(tr) {
      var out = [], w = document.createTreeWalker(tr, NodeFilter.SHOW_TEXT, null), n;
      while ((n = w.nextNode())) out.push(n.nodeValue);
      return out.join(" ");
    }
    var index = rows.map(function (tr) { return rowIndex((tr.getAttribute("data-hz8-terms") || "") + " " + words(tr)); });

    var wrap = document.createElement("div");
    wrap.className = "hz8-hub__search";
    wrap.setAttribute("role", "search");
    var id = "hz8-hub-q";
    wrap.innerHTML =
      '<label class="hz8-visually-hidden" for="' + id + '">Sök ämne i indexet</label>' +
      '<input id="' + id + '" type="search" autocomplete="off" spellcheck="false" placeholder="Sök ämne, t.ex. HHC eller CBD" aria-describedby="hz8-hub-count">' +
      '<p class="hz8-hub__count" id="hz8-hub-count" aria-live="polite"></p>';
    table.parentNode.insertBefore(wrap, table);
    var input = wrap.querySelector("input");
    var count = wrap.querySelector(".hz8-hub__count");

    var empty = document.createElement("p");
    empty.className = "hz8-hub__empty";
    empty.hidden = true;
    empty.innerHTML = 'Inget ämne i indexet matchar. Indexet tar bara upp ämnen vi har kontrollerat; läs <a href="#metod">hur vi väljer och kontrollerar ämnen</a>.';
    table.parentNode.insertBefore(empty, table.nextSibling);

    function total(n) { return n + (n === 1 ? " ämne" : " ämnen"); }
    function run() {
      var q = query(input.value);
      var shown = 0;
      rows.forEach(function (tr, i) {
        var hit = !q || index[i].indexOf(q) !== -1;
        tr.classList.toggle("is-filtered", !hit);
        if (hit) shown++;
      });
      count.textContent = q ? "Visar " + shown + " av " + total(rows.length) + "." : total(rows.length) + " i indexet.";
      empty.hidden = shown !== 0;
      table.classList.toggle("is-empty", shown === 0);
    }
    input.addEventListener("input", run);
    input.addEventListener("keydown", function (e) { if (e.key === "Escape" && input.value) { input.value = ""; run(); } });
    run();
  }

  function setupRows(root, table) {
    var mq = window.matchMedia ? window.matchMedia(NARROW) : null;
    var rows = Array.prototype.slice.call(table.querySelectorAll("tbody tr"));
    rows.forEach(function (tr, i) {
      var th = tr.querySelector("th");
      if (!th || th.querySelector(".hz8-hub__toggle")) return;
      var detailIds = [];
      Array.prototype.forEach.call(tr.querySelectorAll("td.hz8-hub__more"), function (td, j) {
        td.id = td.id || "hz8-hub-r" + i + "-" + j;
        detailIds.push(td.id);
      });
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "hz8-hub__toggle";
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-controls", detailIds.join(" "));
      btn.innerHTML = '<span class="hz8-visually-hidden">Visa datum och källa för ' + (th.querySelector(".hz8-hub__name") || th).textContent.trim() + "</span>";
      btn.addEventListener("click", function () {
        var open = tr.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
      th.appendChild(btn);
    });
    function apply() { table.classList.toggle("is-collapsible", !!(mq && mq.matches)); }
    if (mq) { if (mq.addEventListener) mq.addEventListener("change", apply); else if (mq.addListener) mq.addListener(apply); }
    apply();
  }

  HZ8.register("landing-hub", function (context) {
    if (context.page !== "page") return;
    var root = document.querySelector(".store-page .hz8-atlas--hub");
    if (!root) return;
    var table = root.querySelector(".hz8-hub__table");
    if (!table) return;
    setupSearch(root, table);
    setupRows(root, table);
    root.classList.add("is-enhanced");
  });
})();
