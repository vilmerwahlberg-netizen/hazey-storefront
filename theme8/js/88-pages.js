/* Innehållssidor (/sv/page/*) och FAQ.

   - Sidhuvud: om sidans eget innehåll saknar H1 läggs ett H1 in med
     sidans riktiga namn (brödsmulans sista led, normaliserat från
     VERSALER). En identisk första rubrik i innehållet döljs då
     visuellt så att namnet inte står två gånger.
   - Om oss: sidan finns inte i Nyehandel ännu. Innehållsblocket
     theme8/blocks/om-oss.html klistras in i en ny sida i admin; dess
     klasser (hz8-about*) stylas i 88-pages.css. Samma gäller
     theme8/blocks/leverans-och-retur.html (hz8-journey*).
   - Kontakt, FAQ, sökning, villkorsdokument och blocken Om Hazey /
     Leverans och retur byggs av 89-service.js (gemensam sidfamilj). */
(function () {
  "use strict";

  var HZ8 = window.HZ8;

  function sentenceCase(text) {
    if (text !== text.toUpperCase()) return text;
    var lower = text.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }

  function pageTitle() {
    var crumbs = document.querySelectorAll(".breadcrumb li");
    var last = crumbs[crumbs.length - 1];
    var text = last ? last.textContent.trim() : document.title.split("|")[0].trim();
    return sentenceCase(text);
  }

  function ensureH1(page, override) {
    if (page.querySelector("h1")) return;
    var title = override || pageTitle();
    var head = document.createElement("div");
    head.className = "hz8-page-head";
    head.innerHTML = '<h1>' + HZ8.esc(title) + "</h1>";
    page.insertBefore(head, page.firstChild);
    var firstHeading = page.querySelector(".template-components__html-editor h2, section h2");
    if (firstHeading && firstHeading.textContent.trim().toLowerCase() === title.toLowerCase()) {
      firstHeading.classList.add("hz8-visually-hidden");
    }
  }

  /* Admininnehållets H1 i VERSALER ("KÖP- OCH LEVERANSVILLKOR – Hazey.se")
     visas i meningsversal; bara skiftläget ändras, inte texten. */
  function normalizeH1(page) {
    var h1 = page.querySelector("h1");
    if (!h1 || h1.getAttribute("data-hz8-case")) return;
    var t = h1.textContent.trim();
    var letters = t.replace(/[^A-Za-zÅÄÖåäö]/g, "");
    var upper = t.split(/\s+/).filter(function (w) { return /[A-ZÅÄÖ]{3,}/.test(w) && w === w.toUpperCase(); }).length;
    if (!letters || upper < 2) return;
    h1.setAttribute("data-hz8-case", "1");
    h1.textContent = t.replace(/[A-ZÅÄÖ][A-ZÅÄÖ\-]+/g, function (w, i) { return i === 0 ? w.charAt(0) + w.slice(1).toLowerCase() : w.toLowerCase(); });
  }

  /* Publicerad sida utan innehåll (t.ex. /sv/page/kopvillkor): ärligt
     tomläge med vägar vidare i stället för en tom yta. */
  function emptyPageState(page) {
    if (page.querySelector(".hz8-page-empty")) return;
    var text = (page.textContent || "").replace(/\s+/g, " ").trim();
    var h1 = page.querySelector("h1");
    var rest = h1 ? text.replace(h1.textContent.replace(/\s+/g, " ").trim(), "").trim() : text;
    if (rest.length > 40 || page.querySelector("img, form, [data-nh-source], .products")) return;
    var terms = /villkor/i.test(h1 ? h1.textContent : "");
    var box = document.createElement("div");
    box.className = "hz8-state hz8-page-empty";
    box.innerHTML = "<p>Den här sidan har inget innehåll ännu.</p>" +
      '<div class="hz8-page-empty__links">' +
      (terms ? '<a class="hz8-btn hz8-btn--primary" href="' + HZ8.esc(HZ8.link("/sv/page/kop-och-leveransvillkor")) + '">Köp- och leveransvillkor</a>' : "") +
      '<a class="hz8-btn hz8-btn--secondary" href="' + HZ8.esc(HZ8.link("/sv/page/faq")) + '">Vanliga frågor</a>' +
      '<a class="hz8-btn hz8-btn--secondary" href="' + HZ8.esc(HZ8.link("/sv/page/kontakt")) + '">Kontakta oss</a></div>';
    page.appendChild(box);
  }

  /* Produktlistor i admininnehållet (Butik, Bästsäljare, Kampanjer)
     deklarerar sin källa: data-nh-source (kategori), data-nh-limit,
     data-nh-order="fixed" (kategorins egen ordning) och data-nh-filter=
     "discounted" (bara produkter med jämförelsepris). Tidigare fylldes de
     ENBART av den äldre kontraktor-bundlen; nu fyller Theme 8 dem själv
     med riktiga kort från respektive kategorisida. Utan data -> tomt
     läge med länk vidare, aldrig påhittade produkter. */
  var MAX_SALE_PAGES = 6; // rea-listor: Nyehandels egen paginering, 25 per sida

  function cardsFor(source, opts) {
    var url = new URL(source, location.origin);
    if (opts.filter === "discounted") {
      /* Rea kräver hela sortimentet i standardordning (de populäraste
         25 har inte alltid någon rea): sida för sida tills listan är
         full, sidorna tar slut eller taket nås. */
      var collected = [];
      var page = 1;
      var next = function () {
        url.searchParams.set("page", String(page));
        return HZ8.fetchPage(url.pathname + url.search, HZ8.categoryCards).then(function (cards) {
          collected = collected.concat(cards.filter(function (c) { return c.sale; }));
          if (!cards.length || collected.length >= opts.limit || page >= MAX_SALE_PAGES || cards.length < 25) return collected;
          page += 1;
          return next();
        });
      };
      return next();
    }
    if (opts.order !== "fixed") url.searchParams.set("sort", "popular");
    return HZ8.fetchPage(url.pathname + url.search, HZ8.categoryCards);
  }

  function fillList(grid, source, opts) {
    grid.setAttribute("aria-busy", "true");
    return cardsFor(source, opts).then(function (cards) {
      var picked = cards.slice(0, opts.limit || 8);
      if (!picked.length) {
        grid.innerHTML = '<div class="hz8-state hz8-list-empty"><p>Inga produkter att visa just nu.</p></div>';
      } else {
        grid.innerHTML = picked.map(function (c) { return "<div>" + c.html + "</div>"; }).join("");
        grid.querySelectorAll("[id]").forEach(function (el) { el.removeAttribute("id"); });
      }
      grid.setAttribute("data-hz8-filled", source);
    }).catch(function () {
      grid.innerHTML = '<div class="hz8-state hz8-state--error hz8-list-empty"><p>Produkterna kunde inte laddas. Försök igen om en stund.</p></div>';
    }).finally(function () { grid.removeAttribute("aria-busy"); });
  }

  function initProductLists(page) {
    page.querySelectorAll("[data-nh-source]").forEach(function (grid) {
      if (grid.getAttribute("data-hz8-filled")) return;
      fillList(grid, grid.getAttribute("data-nh-source"), {
        limit: parseInt(grid.getAttribute("data-nh-limit"), 10) || 8,
        order: grid.getAttribute("data-nh-order"),
        filter: grid.getAttribute("data-nh-filter")
      });
    });
    /* Butikens kampanjgrid saknar egen källa: produkter med
       jämförelsepris ur hela sortimentet (samma regel som Kampanjer-sidan). */
    var campaign = page.querySelector("#nh-kampanjer-grid");
    if (campaign && !campaign.getAttribute("data-hz8-filled")) fillList(campaign, "/sv/categories/alla-produkter", { limit: 8, filter: "discounted" });
    /* Filterbar lista (Bästsäljare): knapparna byter kategori. */
    var filters = page.querySelector(".nh-bs-filters");
    if (filters && !filters.getAttribute("data-hz8-bound")) {
      filters.setAttribute("data-hz8-bound", "1");
      var grid = filters.parentNode.querySelector(".products");
      var buttons = filters.querySelectorAll("[data-cat]");
      function select(btn) {
        buttons.forEach(function (b) { b.classList.toggle("is-active", b === btn); b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
        if (grid) fillList(grid, "/sv/categories/" + btn.getAttribute("data-cat"), { limit: 12 });
      }
      buttons.forEach(function (b) { b.addEventListener("click", function () { select(b); }); });
      var active = filters.querySelector(".is-active") || buttons[0];
      if (active && grid && !grid.getAttribute("data-hz8-filled")) select(active);
    }
  }

  HZ8.register("content-pages", function (context) {
    if (context.page !== "page" && context.page !== "faq") return;
    /* Butik ägs av 87-shop.js (katalogportal) -- inga generella listor här. */
    if (HZ8.isShopPage && HZ8.isShopPage()) return;
    var page = document.querySelector("#skip-to-main-content .store-page") || document.querySelector(".store-page");
    if (!page) return;
    var S = HZ8.service;
    /* Servicesidorna (89-service.js) äger sin egen masthead och H1. */
    if (context.page === "faq" || page.querySelector(".nh-faq")) {
      document.documentElement.setAttribute("data-hz8-page", "faq");
      S.initFaq(page);
    } else if (page.querySelector(".nh-contact")) {
      document.documentElement.classList.add("hz8-contact-page");
      S.initContact(page);
    } else if (!S.initBlocks(page)) {
      ensureH1(page);
      normalizeH1(page);
      if (!S.initDocument(page)) emptyPageState(page);
    }
    initProductLists(page);
  });

  /* Kontosidorna har inget H1 -- sidans egen första rubrik ("Logga in")
     exponeras som nivå 1. */
  HZ8.register("utility-pages", function (context) {
    if (context.page === "search") { HZ8.service.initSearch(); return; }
    if (context.page !== "account") return;
    var main = document.getElementById("store-main");
    if (!main || main.querySelector("h1")) return;
    var first = main.querySelector("h2");
    if (first) { first.setAttribute("role", "heading"); first.setAttribute("aria-level", "1"); first.classList.add("hz8-utility-title"); }
  });
})();
