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
     klasser (hz8-about*) stylas i 88-pages.css. */
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

  HZ8.register("content-pages", function (context) {
    if (context.page !== "page" && context.page !== "faq") return;
    var page = document.querySelector("#skip-to-main-content .store-page") || document.querySelector(".store-page");
    if (!page) return;
    if (context.page === "faq" || page.querySelector(".nh-faq")) {
      document.documentElement.setAttribute("data-hz8-page", "faq");
      initFaq(page);
    } else {
      ensureH1(page);
    }
    if (page.querySelector(".hz8-about")) document.documentElement.classList.add("hz8-about-page");
  });

  /* Sök- och kontosidorna har inget H1 -- sidans egen första rubrik
     ("Sökresultat för", "Logga in") exponeras som nivå 1. */
  HZ8.register("utility-pages", function (context) {
    if (context.page !== "search" && context.page !== "account") return;
    var main = document.getElementById("store-main");
    if (!main || main.querySelector("h1")) return;
    var first = main.querySelector("h2");
    if (first) { first.setAttribute("role", "heading"); first.setAttribute("aria-level", "1"); first.classList.add("hz8-utility-title"); }
  });
})();
