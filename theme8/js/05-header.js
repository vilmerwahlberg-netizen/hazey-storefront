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

  /* ============ Entré-animation ============
     Ordning matchar samma order:-värden headern redan använder i CSS
     (hamburgare=0, logga=1, nav/mobil-sök-trigger=2, sök=3, konto=4,
     varukorg=5) -- ren vänster-till-höger-stagger, inget hittepå. */
  var ANIM_ITEM_SELECTORS = [
    ".hamburger",
    ".brand.header-logo a",
    ".hz8-header-nav",
    "#mobile-search-trigger",
    "#search-container",
    ".account-button",
    ".basket-icon"
  ];
  var ANIM_BASE_DELAY = 420; // ms -- inom kravet 400-500ms efter start
  var ANIM_STAGGER = 50;     // ms -- inom kravet 45-70ms
  var ANIM_SAFETY_TIMEOUT = 1600; // ms -- gott om marginal över ~950ms total animation

  function initHeaderEntrance(header) {
    var html = document.documentElement;
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      /* Ingen "priming"-klass läggs alls -- default-CSS:en (panel full
         bredd, allt innehåll synligt) gäller direkt, exakt kravet
         "visa den färdiga headern omedelbart utan skala, stagger eller
         väntetid". */
      return;
    }

    var items = [];
    ANIM_ITEM_SELECTORS.forEach(function (sel) {
      var el = header.querySelector(sel);
      if (el) items.push(el);
    });
    /* Nav-kategoriernas EGNA barn (chip-länkarna) räknas inte som egna
       stagger-steg -- hela .hz8-header-nav är redan ETT steg i listan
       ovan, matchar uppdragets "navigationslänkar" som EN grupp. */

    items.forEach(function (el, i) {
      el.classList.add("hz8-header-anim-item");
      el.style.setProperty("--hz8-anim-delay", (ANIM_BASE_DELAY + i * ANIM_STAGGER) + "ms");
    });

    /* Arma det gömda läget FÖRST här -- aldrig som ett obetingat
       CSS-default -- och bara om vi faktiskt tänker animera. Utan
       JavaScript, eller om detta aldrig körs, förblir headern i sitt
       normala (fullt synliga) default-läge permanent. */
    html.classList.add("hz8-header-priming");

    var settled = false;
    function settle() {
      if (settled) return;
      settled = true;
      html.classList.remove("hz8-header-priming");
      html.classList.add("hz8-header-entering");

      /* Städa bort alla tillfälliga klasser/inline-egenskaper när sista
         objektet garanterat hunnit klart (sista stagger-steget + dess
         egen 280ms-transition + marginal) -- annars ligger "entering"
         kvar på <html> och --hz8-anim-delay kvar inline för alltid.
         Harmlöst rent visuellt (samma sluttillstånd som default-CSS:en
         utan klasserna), men städat bort ändå så ingen framtida,
         orelaterad opacity/transform-ändring på dessa element av misstag
         skulle kunna ärva ett gammalt transition-delay. */
      var lastItemDelay = ANIM_BASE_DELAY + Math.max(0, items.length - 1) * ANIM_STAGGER;
      var itemTransitionDuration = 280;
      window.setTimeout(function () {
        html.classList.remove("hz8-header-entering");
        items.forEach(function (el) {
          el.classList.remove("hz8-header-anim-item");
          el.style.removeProperty("--hz8-anim-delay");
        });
      }, lastItemDelay + itemTransitionDuration + 100);
    }

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(settle);
    });

    /* Säkerhetsnät: oavsett om rAF-kedjan ovan av någon anledning
       aldrig kör klart (t.ex. en bildresurs eller ett annat skript
       fryser fliken), tvingas det synliga läget fram efter en fast
       tidsgräns -- innehållet kan alltså aldrig förbli permanent
       osynligt. */
    window.setTimeout(settle, ANIM_SAFETY_TIMEOUT);
  }

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

    initHeaderEntrance(header);

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
