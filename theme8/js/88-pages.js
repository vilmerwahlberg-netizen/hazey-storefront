/* Innehållssidor (/sv/page/*) och FAQ.

   - Sidhuvud: om sidans eget innehåll saknar H1 läggs ett H1 in med
     sidans riktiga namn (brödsmulans sista led, normaliserat från
     VERSALER). En identisk första rubrik i innehållet döljs då
     visuellt så att namnet inte står två gånger.
   - FAQ: frågorna är butikens egna <details> (nh-faq) -- Theme 8 lägger
     till sök (filtrerar på fråga + svar), antal, tomläge och en
     kontaktväg. Ingen fråga eller svarstext skapas här.
   - Om oss: sidan finns inte i Nyehandel ännu. Innehållsblocket
     theme8/blocks/om-oss.html klistras in i en ny sida i admin; dess
     klasser (hz8-about*) stylas i 88-pages.css. Samma gäller
     theme8/blocks/leverans-och-retur.html (hz8-journey*).
   - Långa textsidor (villkor, integritet) får en innehållsförteckning
     av sidans egna numrerade rubriker; texten ändras inte.
   - Kontakt: butikens mailto:-formulär (öppnade e-postprogrammet utan
     förvarning) döljs och ersätts av en ärlig kontaktväg med riktiga
     mejllänkar per ämne och kopierbar adress. Se theme8/blocks/
     INFO-PAGES.md för Nyehandels riktiga kontakt-/nyhetsbrevsformulär. */
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

  /* Innehållsförteckning för långa textsidor: sidans egna numrerade
     huvudrubriker ("1. Allmänt", "2. ..."), inga nya rubriker skapas. */
  function buildToc(page) {
    if (page.querySelector(".hz8-toc")) return;
    var heads = Array.prototype.filter.call(page.querySelectorAll("h2, h3"), function (h) {
      return /^\d+\.\s+\S/.test(h.textContent.trim()) && !h.closest(".hz8-toc");
    });
    if (heads.length < 5 || (page.textContent || "").length < 2000) return;
    var items = heads.map(function (h, i) {
      if (!h.id) h.id = "avsnitt-" + (i + 1);
      h.classList.add("hz8-toc-target");
      return '<li><a href="#' + h.id + '">' + HZ8.esc(h.textContent.trim()) + "</a></li>";
    }).join("");
    var nav = document.createElement("details");
    nav.className = "hz8-toc";
    if (window.matchMedia("(min-width: 1024px)").matches) nav.open = true;
    nav.innerHTML = '<summary><span>Innehåll</span><span class="hz8-toc__count">' + heads.length + " avsnitt</span></summary>" +
      '<nav aria-label="Innehåll på sidan"><ol>' + items + "</ol></nav>";
    var h1 = page.querySelector("h1");
    var anchor = h1 && (h1.closest(".hz8-page-head") || h1);
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(nav, anchor.nextSibling);
    else page.insertBefore(nav, page.firstChild);
    document.documentElement.classList.add("hz8-longread");
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

  function initFaq(page) {
    var list = page.querySelector(".nh-faq__inner, .nh-faq");
    var items = page.querySelectorAll("details.nh-faq__item, .nh-faq details");
    if (!list || !items.length || page.querySelector(".hz8-faq-tools")) return;
    var faqTitle = page.querySelector(".nh-faq__title");
    ensureH1(page, faqTitle ? faqTitle.textContent.trim() : "Vanliga frågor");
    var section = page.querySelector(".nh-faq");
    if (section) section.classList.add("hz8-accordion");

    var tools = document.createElement("div");
    tools.className = "hz8-faq-tools";
    tools.innerHTML = '<label class="hz8-faq-search"><span class="hz8-visually-hidden">Sök bland frågorna</span>' + HZ8.icon("search") +
      '<input type="search" placeholder="Sök bland frågorna" autocomplete="off"></label>' +
      '<p class="hz8-faq-count" aria-live="polite"></p>';
    var host = items[0].parentNode;
    host.insertBefore(tools, items[0]);
    var empty = document.createElement("div");
    empty.className = "hz8-state hz8-faq-empty";
    empty.hidden = true;
    empty.innerHTML = '<h2>Ingen fråga matchar</h2><p>Prova ett annat ord, eller kontakta oss så hjälper vi dig.</p>' +
      '<a class="hz8-btn hz8-btn--secondary" href="' + HZ8.esc(HZ8.link("/sv/page/kontakt")) + '">Kontakta oss</a>';
    host.appendChild(empty);

    var input = tools.querySelector("input");
    var count = tools.querySelector(".hz8-faq-count");
    function update() {
      var q = input.value.trim().toLowerCase();
      var shown = 0;
      Array.prototype.forEach.call(items, function (d) {
        var hit = !q || d.textContent.toLowerCase().indexOf(q) !== -1;
        d.hidden = !hit;
        if (hit) shown += 1;
        if (q && hit && !d.open) { d.open = true; d.setAttribute("data-hz8-auto-open", "1"); }
        if (!q && d.getAttribute("data-hz8-auto-open")) { d.open = false; d.removeAttribute("data-hz8-auto-open"); }
      });
      count.textContent = q ? shown + " av " + items.length + " frågor" : items.length + " frågor";
      empty.hidden = shown > 0;
    }
    input.addEventListener("input", update);
    update();

    var aside = document.createElement("aside");
    aside.className = "hz8-faq-contact";
    aside.setAttribute("aria-labelledby", "hz8-faq-contact-title");
    aside.innerHTML = '<span class="hz8-kicker">Kundservice</span><h2 id="hz8-faq-contact-title">Hittar du inte svaret?</h2>' +
      "<p>Skriv till oss så svarar vi så snart vi kan. Har du en order, skicka gärna med ordernumret.</p>" +
      '<div class="hz8-faq-contact__actions"><a class="hz8-btn hz8-btn--primary" href="' + HZ8.esc(HZ8.link("/sv/page/kontakt")) + '">Kontakta oss</a>' +
      '<a class="hz8-link" href="mailto:hej@hazey.se">hej@hazey.se</a></div>';
    page.appendChild(aside);
  }

  /* Kontaktsidan: butikens formulär är mailto:-formulär som ser ut som
     riktiga webbformulär men bara öppnar besökarens e-postprogram (och
     nyhetsbrevsformuläret lovar en rabattkod som inget system delar ut).
     De döljs (finns kvar i DOM:en) och ersätts av en ärlig kontaktväg:
     riktiga mejllänkar per ämne och kopierbar adress. Adresserna läses
     ur butikens egna formulär -- inga nya adresser. */
  var TOPICS = {
    kundservice: ["Fråga om min order", "Fråga om en produkt", "Retur eller reklamation"],
    aterforsaljare: ["Bli återförsäljare"]
  };
  function mailto(address, subject) {
    return "mailto:" + address + (subject ? "?subject=" + encodeURIComponent(subject) : "");
  }
  function contactCard(id, title, text, address, topics, dark) {
    return '<div class="hz8-contact__card' + (dark ? " hz8-contact__card--dark" : "") + '" id="' + id + '">' +
      "<h3>" + HZ8.esc(title) + "</h3><p>" + HZ8.esc(text) + "</p>" +
      '<div class="hz8-contact__addr"><a href="' + HZ8.esc(mailto(address)) + '">' + HZ8.esc(address) + "</a>" +
      '<button type="button" class="hz8-contact__copy" data-copy="' + HZ8.esc(address) + '" aria-label="Kopiera ' + HZ8.esc(address) + '">Kopiera</button></div>' +
      '<p class="hz8-contact__label">Välj ämne <span>– öppnar ditt e-postprogram</span></p>' +
      '<ul class="hz8-contact__topics">' + topics.map(function (t) {
        return '<li><a href="' + HZ8.esc(mailto(address, t)) + '">' + HZ8.esc(t) + "</a></li>";
      }).join("") + "</ul></div>";
  }
  function initContact(page) {
    var forms = page.querySelectorAll("form[action^='mailto:']");
    if (!forms.length || page.querySelector(".hz8-contact")) return;
    var addr = function (re, fallback) {
      var f = Array.prototype.filter.call(forms, function (x) { return re.test(x.getAttribute("action")); })[0];
      return f ? f.getAttribute("action").replace(/^mailto:/, "").split("?")[0] : fallback;
    };
    var service = addr(/^mailto:hej@/i, null);
    var reseller = addr(/^mailto:butik@/i, null);
    if (!service) return;
    var sec = document.createElement("section");
    sec.className = "hz8-contact";
    sec.setAttribute("aria-labelledby", "hz8-contact-title");
    sec.innerHTML = '<h2 id="hz8-contact-title">Skriv till oss</h2>' +
      '<p class="hz8-contact__lead">Mejla oss direkt så svarar vi så snart vi kan. Har du en order, skicka gärna med ordernumret.</p>' +
      '<div class="hz8-contact__grid">' +
      contactCard("kundservice", "Kundservice", "Frågor om beställningar, produkter, leverans eller retur.", service, TOPICS.kundservice, false) +
      (reseller ? contactCard("aterforsaljare", "Återförsäljare och företag", "Vill du sälja vårt sortiment eller har en fråga som företag?", reseller, TOPICS.aterforsaljare, true) : "") +
      "</div>" +
      '<p class="hz8-contact__faq">Snabba svar på vanliga frågor hittar du i <a href="' + HZ8.esc(HZ8.link("/sv/page/faq")) + '">Vanliga frågor</a>.</p>' +
      '<p class="hz8-visually-hidden" role="status" aria-live="polite" data-hz8-copy-status></p>';
    var formCards = [];
    Array.prototype.forEach.call(forms, function (f) {
      var card = f.closest(".nh-contact__card") || f;
      if (formCards.indexOf(card) === -1) formCards.push(card);
    });
    var grid = page.querySelector(".nh-contact__grid");
    var first = grid || formCards[0];
    first.parentNode.insertBefore(sec, first);
    if (grid) grid.classList.add("hz8-contact-replaced");
    formCards.forEach(function (c) { c.classList.add("hz8-contact-replaced"); });
    /* Länkar som "#aterforsaljare" pekar på kort som skapas här, efter
       att webbläsaren redan försökt scrolla -- scrolla dit nu. */
    var target = location.hash && sec.querySelector(location.hash.replace(/[^#\w-]/g, ""));
    if (target) window.requestAnimationFrame(function () { target.scrollIntoView({ block: "start" }); });
    sec.addEventListener("click", function (e) {
      var btn = e.target.closest(".hz8-contact__copy");
      if (!btn) return;
      var value = btn.getAttribute("data-copy");
      var status = sec.querySelector("[data-hz8-copy-status]");
      var done = function (ok) {
        btn.textContent = ok ? "Kopierad" : "Kopiera";
        status.textContent = ok ? value + " är kopierad" : "Kunde inte kopiera – markera adressen och kopiera den själv";
        window.setTimeout(function () { btn.textContent = "Kopiera"; }, 2000);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(value).then(function () { done(true); }, function () { done(false); });
      else done(false);
    });
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
    var page = document.querySelector("#skip-to-main-content .store-page") || document.querySelector(".store-page");
    if (!page) return;
    if (context.page === "faq" || page.querySelector(".nh-faq")) {
      document.documentElement.setAttribute("data-hz8-page", "faq");
      initFaq(page);
    } else {
      ensureH1(page);
      normalizeH1(page);
      buildToc(page);
      emptyPageState(page);
    }
    initContact(page);
    initProductLists(page);
    if (page.querySelector(".nh-contact")) document.documentElement.classList.add("hz8-contact-page");
    if (page.querySelector(".hz8-about")) document.documentElement.classList.add("hz8-about-page");
  });

  /* Sökresultat: ett riktigt H1 med sökordet (Nyehandels egen rubrik
     "Sökresultat för ..." döljs visuellt men finns kvar), och vid noll
     träffar ett tomläge med ny sökning och riktiga huvudkategorier ur
     headerns verifierade kategorilista. Inga produkter hittas på. */
  function searchQuery() {
    try { return (new URLSearchParams(location.search).get("query") || "").trim(); } catch (e) { return ""; }
  }
  function searchForm(q) {
    var loc = (window.config && window.config.locale) || "sv";
    return '<form class="hz8-search-again" role="search" action="/' + loc + '/search" method="get">' +
      '<label class="hz8-visually-hidden" for="hz8-search-again">Sök igen</label>' +
      '<input id="hz8-search-again" name="query" type="search" inputmode="search" enterkeyhint="search" autocomplete="off" value="' + HZ8.esc(q) + '" placeholder="Sök produkter, serier, varumärken">' +
      '<button type="submit" class="hz8-btn hz8-btn--primary">Sök</button></form>';
  }
  function initSearchPage() {
    var head = document.querySelector(".search-result__header");
    if (!head || head.querySelector(".hz8-search-h1")) return;
    var q = searchQuery();
    var native = head.querySelector("h2, h1");
    var h1 = document.createElement("h1");
    h1.className = "hz8-search-h1";
    h1.innerHTML = q ? 'Sökresultat för <span class="hz8-search-h1__q">”' + HZ8.esc(q) + "”</span>" : "Sök i sortimentet";
    if (native) { native.classList.add("hz8-visually-hidden"); native.setAttribute("aria-hidden", "true"); native.removeAttribute("role"); native.removeAttribute("aria-level"); }
    head.insertBefore(h1, head.firstChild);
    var count = (head.querySelector("p") || {}).textContent || "";
    var n = parseInt((count.match(/\d+/) || [])[0], 10);
    var wrap = document.createElement("div");
    wrap.className = "hz8-search-tools";
    wrap.innerHTML = searchForm(q);
    head.insertBefore(wrap, h1.nextSibling);
    wrap.querySelector("form").addEventListener("submit", function (e) {
      var v = e.target.querySelector("input").value.trim();
      e.preventDefault();
      if (!v) { e.target.querySelector("input").focus(); return; }
      location.href = HZ8.link("/" + ((window.config && window.config.locale) || "sv") + "/search?query=" + encodeURIComponent(v));
    });
    if (q && n === 0) {
      var cats = (HZ8.navCategories || []).filter(function (c) { return !c.campaign && c.href; });
      var empty = document.createElement("div");
      empty.className = "hz8-state hz8-search-empty";
      empty.innerHTML = "<h2>Inga produkter matchade din sökning</h2>" +
        "<p>Kontrollera stavningen, prova ett kortare eller mer allmänt ord – eller bläddra i sortimentet.</p>" +
        (cats.length ? '<nav aria-label="Sortiment"><ul class="hz8-search-empty__cats">' + cats.map(function (c) {
          return '<li><a href="' + HZ8.esc(HZ8.link(c.href)) + '">' + HZ8.esc(c.label) + "</a></li>";
        }).join("") + "</ul></nav>" : "") +
        '<p class="hz8-search-empty__help">Hittar du inte det du letar efter? <a href="' + HZ8.esc(HZ8.link("/sv/page/kontakt")) + '">Kontakta oss</a>.</p>';
      head.parentNode.insertBefore(empty, head.nextSibling);
      document.documentElement.classList.add("hz8-search-noresults");
    }
  }

  /* Kontosidorna har inget H1 -- sidans egen första rubrik ("Logga in")
     exponeras som nivå 1. */
  HZ8.register("utility-pages", function (context) {
    if (context.page === "search") { initSearchPage(); return; }
    if (context.page !== "account") return;
    var main = document.getElementById("store-main");
    if (!main || main.querySelector("h1")) return;
    var first = main.querySelector("h2");
    if (first) { first.setAttribute("role", "heading"); first.setAttribute("aria-level", "1"); first.classList.add("hz8-utility-title"); }
  });
})();
