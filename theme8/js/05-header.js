(function () {
  "use strict";

  /* Godkänd kategorilista (från uppdraget, inte nyehandels nuvarande
     mega-meny) -- hrefs är VERIFIERADE riktiga Nyehandel-kategorisidor
     (kontrollerade live 2026-09-22 mot hazeyse.nyehandel.se), inte
     gissade. Dropdown-innehållet är medvetet en tom platshållare tills
     Vilmer bestämmer undersortimentet. */
  var CATEGORIES = [
    { label: "Alla produkter", href: "https://hazeyse.nyehandel.se/sv/categories/alla-produkter", dropdown: false },
    { label: "Vapes", href: "https://hazeyse.nyehandel.se/sv/categories/alla-vapes", dropdown: true },
    { label: "Buds", href: "https://hazeyse.nyehandel.se/sv/categories/blommor-buds", dropdown: true },
    { label: "Hasch", href: "https://hazeyse.nyehandel.se/sv/categories/hasch", dropdown: true },
    { label: "CBD", href: "https://hazeyse.nyehandel.se/sv/categories/cbd-group", dropdown: true },
    { label: "Kampanjer", href: "https://hazeyse.nyehandel.se/sv/page/kampanjer", dropdown: false, campaign: true }
  ];

  function chevronSvg() {
    return '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function buildDesktopNav() {
    var nav = document.createElement("nav");
    nav.className = "hz8-header-nav";
    nav.setAttribute("aria-label", "Huvudkategorier");
    nav.innerHTML = CATEGORIES.map(function (cat) {
      var campaignClass = cat.campaign ? " hz8-cat--campaign" : "";
      if (!cat.dropdown) {
        return '<a href="' + cat.href + '" class="hz8-cat' + campaignClass + '">' + cat.label + '</a>';
      }
      return '<div class="hz8-cat-item">'
        + '<a href="' + cat.href + '" class="hz8-cat" aria-haspopup="true">' + cat.label + chevronSvg() + '</a>'
        + '<div class="hz8-dropdown">Undersortiment för ' + cat.label + ' läggs till här.</div>'
        + '</div>';
    }).join("");
    return nav;
  }

  function buildMobileDrawer(assetBase) {
    var wrap = document.createElement("div");
    wrap.className = "hz8-mobile-drawer";
    wrap.id = "hz8MobileDrawer";
    var logoSrc = assetBase ? assetBase + "hazey-logo.png" : "";
    wrap.innerHTML = ''
      + '<div class="hz8-mobile-drawer__backdrop" data-hz8-drawer-backdrop></div>'
      + '<div class="hz8-mobile-drawer__panel" role="dialog" aria-modal="true" aria-label="Meny">'
      + '<div class="hz8-mobile-drawer__header">'
      + (logoSrc ? '<img src="' + logoSrc + '" alt="Hazey.se">' : '<strong>HAZEY.se</strong>')
      + '<button type="button" class="hz8-mobile-drawer__close" data-hz8-drawer-close aria-label="Stäng meny">'
      + '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
      + '</button>'
      + '</div>'
      + '<ul class="hz8-mobile-drawer__list">'
      + CATEGORIES.map(function (cat) {
          var campaignClass = cat.campaign ? " hz8-cat--campaign" : "";
          var arrow = cat.dropdown ? " ▾" : "";
          return '<li><a href="' + cat.href + '" class="' + campaignClass.trim() + '">' + cat.label + arrow + '</a></li>';
        }).join("")
      + '</ul>'
      + '</div>';
    return wrap;
  }

  window.HZ8.register("header", function (context) {
    if (document.querySelector("[data-hz8-header]")) return;
    var header = context.nativeHeader;
    /* Global header -- körs på ALLA sidtyper, inte bara startsidan.
       Kräver bara att den riktiga #store-header hittades (se
       00-bootstrap.js), inte context.home (som bara finns på
       startsidan). Ingen egen header byggs om det riktiga elementet
       saknas -- gissar/uppfinner aldrig en ersättning. */
    if (!header || header.id !== "store-header") return;
    header.setAttribute("data-hz8-header", "1");

    var leftCol = header.querySelector(".left");
    if (leftCol && !header.querySelector(".hz8-header-nav")) {
      leftCol.insertAdjacentElement("afterend", buildDesktopNav());
    }

    /* Native loggabilden är en admin-konfigurerad, lågupplöst
       mini-variant (t.ex. "mini-header-hazey.webp") -- byter bara
       src-attributet mot den godkända wordmark-loggan från prototypen.
       Rör INTE <img>-taggens övriga attribut/position i DOM:en, så
       Vues egen bindning till elementet (href, alt osv via samma <a>)
       påverkas inte. */
    var logoImg = header.querySelector(".brand.header-logo img");
    if (logoImg && context.assetBase) {
      logoImg.src = context.assetBase + "hazey-logo.png";
    }

    /* Mobil-drawer: ersätter INTE native #mobile-menu i DOM:en (den
       döljs bara visuellt via CSS, display:none!important, oavsett
       Vues egen öppen/stängd-transform-state -- den är Vue-hanterad
       och skulle kunna skriva över injicerat innehåll vid ett
       re-render). Vår egen, fristående drawer nedan har samma sex
       kategorier som desktop-navet och triggas av samma riktiga
       hamburgerknapp (dess native klick-hanterare fortsätter köra
       ofarligt i bakgrunden mot den nu dolda native-drawern). */
    if (!document.getElementById("hz8MobileDrawer")) {
      var drawer = buildMobileDrawer(context.assetBase);
      document.body.appendChild(drawer);

      var backdrop = drawer.querySelector("[data-hz8-drawer-backdrop]");
      var closeBtn = drawer.querySelector("[data-hz8-drawer-close]");
      var burger = document.getElementById("mobile-nav-menu") || header.querySelector(".hamburger");

      function openDrawer() {
        drawer.classList.add("is-open");
        if (burger) burger.setAttribute("aria-expanded", "true");
      }
      function closeDrawer() {
        drawer.classList.remove("is-open");
        if (burger) burger.setAttribute("aria-expanded", "false");
      }
      if (burger) {
        burger.addEventListener("click", function () {
          if (drawer.classList.contains("is-open")) closeDrawer();
          else openDrawer();
        });
      }
      if (backdrop) backdrop.addEventListener("click", closeDrawer);
      if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer();
      });
    }

    /* Glasig flytande header (vila) -> fullbredds sticky bar (scrollat),
       samma tröskel/mönster som prototypen. */
    var THRESHOLD = 40;
    var ticking = false;
    function syncScroll() {
      document.body.classList.toggle("hz8-header-scrolled", window.scrollY > THRESHOLD);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(syncScroll);
    }, { passive: true });
    syncScroll();
  });
})();
