(function () {
  "use strict";

  /* Godkänd kategorilista (från uppdraget, inte nyehandels nuvarande
     mega-meny) -- hrefs är VERIFIERADE riktiga Nyehandel-kategorisidor
     (kontrollerade live 2026-09-22 mot hazeyse.nyehandel.se), inte
     gissade. Dropdown-innehållet byggs av DROPDOWN_CONTENT nedan.

     KORRIGERING 2026-09-24: CBD-triggerns/CTA:ns mål bytt från
     "cbd-group" (en 2-produkters VARUMÄRKES-sida, "CBD Group" --
     bekräftat i Vapes egen Varumärke-filterfacett, inte en CBD-hubb)
     till "h4cbd" (29 produkter, den riktiga, största konsoliderade
     CBD-hubben på plattformen). Se DROPDOWN_CONTENT.cbd för samma
     korrigering i undersidorna.

     "Bästsäljare" tillagd som egen huvudlänk (uppdrag 2026-09-24 §9)
     -- pekar på nyehandels EGNA, riktiga, merchant-kurerade
     "Våra bästsäljare"-sida (verifierad live, ~45 riktiga produkter),
     inte en gissad/konstruerad lista. */
  var CATEGORIES = [
    { label: "Alla produkter", href: "https://hazeyse.nyehandel.se/sv/categories/alla-produkter", dropdown: false },
    { label: "Bästsäljare", href: "https://hazeyse.nyehandel.se/sv/page/vara-bastsaljare", dropdown: false },
    { label: "Vapes", href: "https://hazeyse.nyehandel.se/sv/categories/alla-vapes", dropdown: true },
    { label: "Buds", href: "https://hazeyse.nyehandel.se/sv/categories/blommor-buds", dropdown: true },
    { label: "Hasch", href: "https://hazeyse.nyehandel.se/sv/categories/hasch", dropdown: true },
    { label: "CBD", href: "https://hazeyse.nyehandel.se/sv/categories/h4cbd", dropdown: true },
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

  /* Andel av .hz8-hero:s höjd som ska scrollas förbi innan headern går
     till fullbreddsläge (2026-09-25) -- byt bara detta tal för att
     justera hur länge glaspanelen svävar. 0.7 = headern blir fullbredd
     efter att 70% av heron passerat. */
  var HERO_SCROLL_FRACTION = 0.7;
  var HEADER_SCROLL_FALLBACK = 40; // px -- samma fasta tröskel som förut, används på sidor UTAN hero
  var HEADER_SCROLL_HYSTERESIS = 10; // px -- förhindrar flimmer om scrollpositionen står still exakt vid tröskeln

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

  /* ============ Dropdown-innehåll ============
     EN samlad datakälla, återanvänd av BÅDE desktop-dropdown och
     mobil-accordion. Håll ALL manuell kuration -- länkar, ordning,
     utvald produkt -- HÄR, ingenstans annanstans (inte i CSS, inte i
     en andra JS-fil).

     NAMNBYTE (uppdrag 2026-09-24 §1): "THCaB" är det NYA kundvända
     namnet för det GAMLA/interna "THC-A"/"THCA" -- och "THCbA" för
     det gamla/interna "THC-B"/"THCB". De interna Nyehandel-slugarna
     (thca-vapes, thcb-vapes, osv) fortsätter använda de gamla
     namnen; bara den kundvända etiketten här har bytts. "D10" är
     Vilmers egna tidigare valda kundnamn -- dess enda verifierade
     interna motsvarighet på plattformen är "10-OH-THC" (10-oh-thc-*),
     inte bokstavligen "D10" någonstans i Nyehandels egen data.

     STOR KORRIGERING 2026-09-24 (efter en andra, djupare research-
     omgång): THCaB/THCbA/D10 trodddes tidigare sakna riktiga
     destinationer helt. De gör INTE det för Vapes -- Nyehandel har
     egna cannabinoid-nivå-kategorisidor (thca-vapes/thcb-vapes/
     10-oh-thc-vapes) utöver Serie-filtret (Core/Magic Sauce). Kvar
     som "kommer snart" ENDAST där en riktig destination verkligen
     saknas per format (se kommentarer per länk).

     "product"-fältet per dropdown är headerns EGEN, centrala plats
     för "utvald produkt"-konfigurationen. badge är "POPULÄRAST"
     ENDAST när produkten är verifierad mot Nyehandels egen, riktiga
     "Våra bästsäljare"-sida (https://hazeyse.nyehandel.se/sv/page/
     vara-bastsaljare) -- annars "UTVALD PRODUKT". Aldrig gissat. */
  var DROPDOWN_CONTENT = {
    vapes: {
      groups: [
        {
          heading: "SERIER",
          links: [
            /* Egen, dedikerad kategorisida -- verifierad live. */
            { label: "Magic Sauce", href: "https://hazeyse.nyehandel.se/sv/categories/m-s-vapes" },
            /* THCaB = gamla "THC-A". Egen kategorisida (thca-vapes,
               8 produkter) -- verifierad live 2026-09-24. */
            { label: "THCaB", href: "https://hazeyse.nyehandel.se/sv/categories/thca-vapes" },
            /* THCbA = gamla "THC-B". Egen kategorisida (thcb-vapes,
               6 produkter) -- verifierad live 2026-09-24. */
            { label: "THCbA", href: "https://hazeyse.nyehandel.se/sv/categories/thcb-vapes" },
            /* "Core" = produktnamnsbeslut (ersätter THCX i kundvänd
               copy). Ingen egen kategorisida, men det riktiga
               Serie-filtret är verifierat. */
            { label: "Core", href: "https://hazeyse.nyehandel.se/sv/categories/alla-vapes?filters=Serie_Core" },
            /* D10 = "10-OH-THC" internt. Egen kategorisida
               (10-oh-thc-vapes, 2 produkter) -- verifierad live. */
            { label: "D10", href: "https://hazeyse.nyehandel.se/sv/categories/10-oh-thc-vapes" },
            /* Extra aktiva cannabinoider hittade utöver minimilistan
               (uppdraget bad om att inventera och lägga till fler om
               de finns) -- båda egna kategorisidor, verifierade live. */
            { label: "THCV", href: "https://hazeyse.nyehandel.se/sv/categories/thcv-vape" },
            { label: "HHCPM", href: "https://hazeyse.nyehandel.se/sv/categories/hhcpm-vapes" }
          ]
        },
        {
          heading: "FORMAT",
          links: [
            /* 1ml/2ml engångsvapes: produktnamn nämner ofta volymen,
               men Nyehandel exponerar INGET filter/kategori för volym
               -- att bygga en länk hade krävt en gissad URL. Kommer
               snart tills en riktig destination finns. */
            { label: "1 ml engångsvapes", href: null },
            { label: "2 ml engångsvapes", href: null },
            /* 5 ml: research bekräftade att INGEN produkt i hela
               sortimentet ens nämner "5ml" -- produkten finns inte
               alls än, inte bara kategorin. */
            { label: "5 ml engångsvapes", href: null },
            { label: "Carts", href: "https://hazeyse.nyehandel.se/sv/categories/alla-cartridges" },
            { label: "510-batterier & tillbehör", href: "https://hazeyse.nyehandel.se/sv/categories/pennor" },
            /* Refill/Liquid 10ml: ingen produkt av den typen hittad
               i sortimentet. */
            { label: "Refill/Liquid 10 ml", href: null }
          ]
        }
      ],
      cta: { label: "Alla vapes", href: "https://hazeyse.nyehandel.se/sv/categories/alla-vapes" },
      /* "Vape - Magic Sauce 99% - 2ml" är VERIFIERAD på Nyehandels
         egna riktiga "Våra bästsäljare"-sida (kontrollerad live
         2026-09-24) -- äkta POPULÄRAST, inte gissat. Ersätter
         föregående "Vape - THCX 19% - Core - 2ml" som INTE fanns på
         bästsäljarlistan. */
      product: {
        badge: "POPULÄRAST",
        name: "Vape - Magic Sauce 99% - 2ml",
        price: "499 kr",
        image: "https://d3dnwnveix5428.cloudfront.net/eyJrZXkiOiJzdG9yZV8xODNhNTExYS0wZGVkLTQ0YzktODI5ZC0yMTA5OWIwMTU4ZjlcL2ltYWdlc1wvbWFnaWMtc2F1Y2UtdmFwZXMtMm1sLW1hZ2ljLWZhcm1lcnMtNTA1NTk4MTMucG5nIiwiZWRpdHMiOnsicmVzaXplIjp7IndpZHRoIjo4MDAsImhlaWdodCI6ODAwLCJmaXQiOiJpbnNpZGUifX19",
        url: "https://hazeyse.nyehandel.se/sv/products/vape-magic-sauce-99-2ml",
        stock: null
      }
    },
    buds: {
      groups: [
        {
          heading: "SERIER",
          links: [
            { label: "Magic Sauce", href: "https://hazeyse.nyehandel.se/sv/categories/m-s-buds" },
            /* THCaB = gamla "THC-A". Egen kategorisida (thca-blommor,
               32 produkter) -- verifierad live 2026-09-24. */
            { label: "THCaB", href: "https://hazeyse.nyehandel.se/sv/categories/thca-blommor" },
            /* THCbA/Core/D10: research hittade INGEN egen buds-
               destination för något av dessa tre (varken kategorisida
               eller Serie-filtervärde -- Buds egna Serie-facett
               innehåller bara Nano11 och Magic Sauce). D10 och THCbA
               visas ändå (uppdraget kräver att de finns under Buds
               även om ofullständiga) som "kommer snart". Core
               utelämnas INTE heller (samma minimilista), samma status. */
            { label: "THCbA", href: null },
            { label: "Core", href: null },
            { label: "D10", href: null },
            { label: "Nano11", href: "https://hazeyse.nyehandel.se/sv/categories/nano11-blommor" },
            /* Extra aktiva serier/cannabinoider hittade utöver
               minimilistan -- båda egna kategorisidor, verifierade live. */
            { label: "HHCPM", href: "https://hazeyse.nyehandel.se/sv/categories/hhcpm-blommor" },
            { label: "THCNM", href: "https://hazeyse.nyehandel.se/sv/categories/thcnm-blommor" }
          ]
        },
        {
          heading: "FORMAT",
          links: [
            { label: "Buds/Blommor", href: "https://hazeyse.nyehandel.se/sv/categories/blommor-buds" },
            /* Pre-rolls: research sökte hela sortimentet (flera sökord)
               -- INGA pre-roll-produkter finns alls än, i något format.
               Detta är alltså inte bara en saknad kategori utan en
               produkttyp som ännu inte lanserats. Visas "kommer snart"
               enligt uppdragets egen regel, ingen gissad länk. */
            { label: "Pre-rolls", href: null }
            /* Flerpack/Bundles: uppdraget bad om detta ENDAST "om en
               riktig aktiv destination finns" -- ingen hittades, så
               utelämnas helt (villkorad, till skillnad från D10/THCbA
               som uttryckligen ska finnas kvar oavsett). */
          ]
        }
      ],
      cta: { label: "Alla buds", href: "https://hazeyse.nyehandel.se/sv/categories/blommor-buds" },
      /* Redan verifierad på Nyehandels riktiga "Våra bästsäljare"-sida
         -- äkta POPULÄRAST (uppgraderad från UTVALD PRODUKT, samma
         produkt som innan). */
      product: {
        badge: "POPULÄRAST",
        name: "Buds – THCA 22% – Orange Small Buds – 5 gram",
        price: "495 kr",
        image: "https://d3dnwnveix5428.cloudfront.net/eyJrZXkiOiJzdG9yZV8xODNhNTExYS0wZGVkLTQ0YzktODI5ZC0yMTA5OWIwMTU4ZjlcL2ltYWdlc1wvdGhjYS1idWRzLWhhemV5LW9yYW5nZS1zbWFsbC1idWRzLXRoYy1hLTUtZ3JhbXMtaGFtcGEtYmxvbW1vci10aGMtYnVkcy1jNmQ5MDQ0NC5wbmciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjgwMCwiaGVpZ2h0Ijo4MDAsImZpdCI6Imluc2lkZSJ9fX0=",
        url: "https://hazeyse.nyehandel.se/sv/products/buds-thca-22-orange-small-buds-5-gram",
        stock: null
      }
    },
    hasch: {
      groups: [
        {
          heading: "SERIER",
          links: [
            /* Ingen egen Magic-Sauce-Hasch-sida finns -- det riktiga,
               verifierade Serie-filtret på huvud-hasch-sidan används. */
            { label: "Magic Sauce", href: "https://hazeyse.nyehandel.se/sv/categories/hasch?filters=Serie_Magic%20Sauce" },
            /* THCaB = gamla "THC-A". Egen kategorisida (thca-hash,
               20 produkter) -- verifierad live 2026-09-24. */
            { label: "THCaB", href: "https://hazeyse.nyehandel.se/sv/categories/thca-hash" },
            /* THCbA/Core/D10: ingen egen hasch-destination hittad för
               något av dessa -- visas ändå som "kommer snart" (samma
               regel som under Buds). */
            { label: "THCbA", href: null },
            { label: "Core", href: null },
            { label: "D10", href: null },
            /* Extra: THCNM har en egen hasch-kategorisida (thcnm-hash,
               4 produkter) -- verifierad live. Nano11/Nano-11
               UTELÄMNAS helt här (inte "kommer snart") -- uppdraget
               bad om Nano11 under Hasch bara "om serien har aktuella
               haschprodukter", och ingen sådan destination hittades
               (Hasch egen Serie-facett innehåller bara Magic Sauce). */
            { label: "THCNM", href: "https://hazeyse.nyehandel.se/sv/categories/thcnm-hash" }
          ]
        }
        /* Inget eget Format-behov hittat under Hasch -- research fann
           inga verifierade sub-format utöver huvudkategorin. */
      ],
      cta: { label: "Allt hasch", href: "https://hazeyse.nyehandel.se/sv/categories/hasch" },
      /* KORRIGERING (CBD-separation, uppdrag 2026-09-24 §3): föregående
         kort visade "Hash – CBD 15% – Primero", en CBD-familjeprodukt
         -- bryter mot den nya, hårda regeln att CBD/CBG/CBN ALDRIG ska
         visas under Vapes/Buds/Hasch. Ersatt med en riktig, icke-CBD
         Hasch-bästsäljare ("Hash – THCA 50% – Bubble Hash",
         verifierad på Nyehandels egna "Våra bästsäljare"-sida). Den
         gamla CBD-produkten flyttad till CBD→Hasch-formatlänken
         nedan istället, där den hör hemma. */
      product: {
        badge: "POPULÄRAST",
        name: "Hash – THCA 50% – Bubble Hash – 5 gram",
        price: "499 kr",
        image: "https://d3dnwnveix5428.cloudfront.net/eyJrZXkiOiJzdG9yZV8xODNhNTExYS0wZGVkLTQ0YzktODI5ZC0yMTA5OWIwMTU4ZjlcL2ltYWdlc1wvdGhjYS1idWRzLWhhemV5LWJ1YmJsZS1oYXNoLXRoYy1hLTUtZ3JhbXMtaGFtcGEtYmxvbW1vci01Z3JhbS10aGMtaGFzaC1iMjJjZDcxOS5wbmciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjgwMCwiaGVpZ2h0Ijo4MDAsImZpdCI6Imluc2lkZSJ9fX0=",
        url: "https://hazeyse.nyehandel.se/sv/products/hash-thca-50-bubble-hash-5-gram",
        stock: null
      }
    },
    cbd: {
      groups: [
        /* KORRIGERING 2026-09-24: föregående version hade CBD/CBG
           helt utelämnade. Uppdraget kräver nu uttryckligen att alla
           tre (CBD/CBG/CBN) visas -- CBG som "kommer snart" om ingen
           destination finns, ALDRIG helt dold. */
        {
          heading: "CANNABINOIDER",
          links: [
            /* Ingen fristående "CBD"-sida finns (404) -- Nyehandels
               egen, största konsoliderade CBD-hubb är "h4cbd" (29
               produkter). Används som den mest verifierat riktiga
               motsvarigheten till ren "CBD", dokumenterat här snarare
               än att gissa en annan URL. */
            { label: "CBD", href: "https://hazeyse.nyehandel.se/sv/categories/h4cbd" },
            /* CBG: research bekräftade NOLL produkter/kategorier för
               CBG någonstans i sortimentet. Visas ändå (uppdragets
               minimilista är ovillkorad för CBD/CBG/CBN) som
               "kommer snart", inte dold. */
            { label: "CBG", href: null },
            { label: "CBN", href: "https://hazeyse.nyehandel.se/sv/categories/cbn" }
          ]
        },
        {
          heading: "FORMAT",
          links: [
            /* Alla FORMAT-länkar här pekar på CBD/H4CBD-SPECIFIKA
               kategorisidor, INTE de allmänna Vapes/Buds/Hasch-sidorna
               -- exakt uppdragets krav ("CBD → Hasch ska visa CBD-
               relaterat hasch, inte allmänt hasch"). */
            { label: "Buds/Blommor", href: "https://hazeyse.nyehandel.se/sv/categories/cbd-buds" },
            /* h4cbd-hasch: enda produkten där är en riktig, verifierad
               bästsäljare ("Hash – H4CBD 20% + CBN 20% – H-Bomb"). */
            { label: "Hasch", href: "https://hazeyse.nyehandel.se/sv/categories/h4cbd-hasch" },
            /* Pre-rolls finns inte alls i sortimentet (se Buds-
               kommentaren ovan) -- gäller alla format, inklusive CBD. */
            { label: "Pre-rolls", href: null },
            /* KORRIGERING: tidigare pekade detta på "cbd-group", en
               2-produkters VARUMÄRKES-sida (bekräftat i Vapes egen
               Varumärke-filterfacett), inte en CBD-vapes-kategori.
               Rätt destination är "h4cbd-vape" (18 produkter). */
            { label: "Vapes", href: "https://hazeyse.nyehandel.se/sv/categories/h4cbd-vape" },
            /* Riktiga CBD-carts-produkter existerar (t.ex. "Cart - CBD
               60% - Tatra Hemp"), men ingen egen, filtrerad
               kategorisida hittades för dem. */
            { label: "Carts", href: null }
          ]
        }
      ],
      /* KORRIGERING: "cbd-group" (huvudtrigger + denna CTA) var en
         2-produkters VARUMÄRKES-sida, inte en CBD-hubb -- bytt till
         "h4cbd" (29 produkter), plattformens riktiga, största
         konsoliderade CBD-samlingssida. */
      cta: { label: "Visa allt inom CBD", href: "https://hazeyse.nyehandel.se/sv/categories/h4cbd" },
      /* Redan verifierad på Nyehandels riktiga "Våra bästsäljare"-sida
         -- äkta POPULÄRAST (uppgraderad från UTVALD PRODUKT, samma
         produkt som innan). */
      product: {
        badge: "POPULÄRAST",
        name: "Blommor – CBD 30% – Tequila Sunrise – 3,5 gram",
        price: "435 kr",
        image: "https://d3dnwnveix5428.cloudfront.net/eyJrZXkiOiJzdG9yZV8xODNhNTExYS0wZGVkLTQ0YzktODI5ZC0yMTA5OWIwMTU4ZjlcL2ltYWdlc1wvY29va2llcy1idWRzLXN2ZXJpZ2UtY2JkLWJ1ZHMtdGVxdWlsYS1zdW5yaXNlLWxhZ2xpZ2EtY2FubmFiaXMtYnVkcy1jb29raWVzLWYyODA5Y2FmLnBuZyIsImVkaXRzIjp7InJlc2l6ZSI6eyJ3aWR0aCI6ODAwLCJoZWlnaHQiOjgwMCwiZml0IjoiaW5zaWRlIn19fQ==",
        url: "https://hazeyse.nyehandel.se/sv/products/blommor-cbd-30-tequila-sunrise-35-gram",
        stock: null
      }
    }
  };

  function chevronSvg() {
    return '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  /* Länkar utan bekräftad destination (href:null) renderas som INAKTIV
     text, inte klickbara och inte href="#" -- uppdraget förbjuder
     uttryckligen båda. En liten "(kommer snart)"-etikett gör det
     tydligt att det INTE är ett fel, bara ännu inte kopplat. */
  function renderDropdownLink(link, listClass) {
    if (!link.href) {
      return '<li><span class="' + listClass + '__missing" aria-disabled="true">'
        + link.label + ' <em>(kommer snart)</em></span></li>';
    }
    return '<li><a href="' + link.href + '">' + link.label + '</a></li>';
  }

  function renderProductCard(product, variant) {
    if (!product || !product.name) return "";
    var cls = variant === "mobile" ? "hz8-mobile-accordion__product" : "hz8-dropdown__product";
    var img = product.image
      ? '<img src="' + product.image + '" alt="" loading="lazy">'
      : "";
    var stock = product.stock
      ? '<span class="' + cls + '-stock">' + product.stock + '</span>'
      : "";
    if (variant === "mobile") {
      return '<a class="' + cls + '" href="' + product.url + '">'
        + '<span class="' + cls + '-media">' + img + '</span>'
        + '<span class="' + cls + '-body">'
        + '<span class="' + cls + '-badge">' + product.badge + '</span>'
        + '<span class="' + cls + '-name">' + product.name + '</span>'
        + '<span class="' + cls + '-price">' + product.price + '</span>'
        + '</span>'
        + '</a>';
    }
    return '<a class="' + cls + '" href="' + product.url + '">'
      + '<span class="' + cls + '-media">'
      + img
      + '</span>'
      + '<span class="' + cls + '-body">'
      + '<span class="' + cls + '-badge">' + product.badge + '</span>'
      + '<span class="' + cls + '-name">' + product.name + '</span>'
      + '<span class="' + cls + '-price">' + product.price + '</span>'
      + stock
      + '<span class="' + cls + '-link">Visa produkten</span>'
      + '</span>'
      + '</a>';
  }

  /* Bygger den GEMENSAMMA gruppmarkupen (rubriker + länklistor + CTA)
     -- variant styr bara vilka klassnamn som används (desktop-panelen
     resp. mobil-accordionens klasspar), datan och strukturen är
     identisk mellan de två. */
  function buildDropdownGroups(content, variant) {
    var groupClass = variant === "mobile" ? "hz8-mobile-accordion__group" : "hz8-dropdown__group";
    var headingClass = variant === "mobile" ? "hz8-mobile-accordion__heading" : "hz8-dropdown__heading";
    var listClass = variant === "mobile" ? "hz8-mobile-accordion__list" : "hz8-dropdown__list";
    var ctaClass = variant === "mobile" ? "hz8-mobile-accordion__cta" : "hz8-dropdown__cta";
    var groupsHtml = content.groups.map(function (group) {
      if (!group.links.length) return "";
      return '<div class="' + groupClass + '">'
        + '<h3 class="' + headingClass + '">' + group.heading + '</h3>'
        + '<ul class="' + listClass + '">'
        + group.links.map(function (l) { return renderDropdownLink(l, listClass); }).join("")
        + '</ul>'
        + '</div>';
    }).join("");
    var ctaHtml = content.cta
      ? '<a class="' + ctaClass + '" href="' + content.cta.href + '">' + content.cta.label + '</a>'
      : "";
    return groupsHtml + ctaHtml;
  }

  function buildDesktopDropdownPanel(catKey) {
    var content = DROPDOWN_CONTENT[catKey];
    if (!content) return "";
    var product = renderProductCard(content.product, "desktop");
    return '<div class="hz8-dropdown__grid">'
      + '<div class="hz8-dropdown__col hz8-dropdown__col--links">'
      + buildDropdownGroups(content, "desktop")
      + '</div>'
      + (product ? '<div class="hz8-dropdown__col hz8-dropdown__col--product">' + product + '</div>' : '')
      + '</div>';
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
      var catKey = cat.label.toLowerCase();
      var panelId = "hz8Dropdown-" + catKey;
      return '<div class="hz8-cat-item" data-hz8-cat="' + catKey + '">'
        + '<a href="' + cat.href + '" class="hz8-cat" aria-haspopup="true" aria-expanded="false" aria-controls="' + panelId + '">' + cat.label + chevronSvg() + '</a>'
        + '<div class="hz8-dropdown" id="' + panelId + '" role="region" aria-label="' + cat.label + ' -- undersortiment">'
        + buildDesktopDropdownPanel(catKey)
        + '</div>'
        + '</div>';
    }).join("");
    return nav;
  }

  /* Mobil-accordion för en kategori med dropdown -- ÅTERANVÄNDER samma
     DROPDOWN_CONTENT/buildDropdownGroups/renderProductCard som desktop,
     bara annan yttre skal-markup (knapp + kollapsbar panel i stället
     för hover-panel). id:t kopplas till knappens aria-controls. */
  function buildMobileAccordionItem(catKey, label) {
    var content = DROPDOWN_CONTENT[catKey];
    var panelId = "hz8Accordion-" + catKey;
    var groupsHtml = content ? buildDropdownGroups(content, "mobile") : "";
    var productHtml = content ? renderProductCard(content.product, "mobile") : "";
    return '<div class="hz8-mobile-accordion" data-hz8-cat="' + catKey + '">'
      + '<button type="button" class="hz8-mobile-accordion__trigger" aria-expanded="false" aria-controls="' + panelId + '">'
      + label + chevronSvg()
      + '</button>'
      + '<div class="hz8-mobile-accordion__panel" id="' + panelId + '" role="region" aria-label="' + label + ' -- undersortiment">'
      + '<div class="hz8-mobile-accordion__inner">'
      + groupsHtml
      + productHtml
      + '</div>'
      + '</div>'
      + '</div>';
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
      + '<div class="hz8-mobile-drawer__list">'
      + CATEGORIES.map(function (cat) {
          if (cat.dropdown) {
            var catKey = cat.label.toLowerCase();
            return buildMobileAccordionItem(catKey, cat.label);
          }
          var campaignClass = cat.campaign ? " hz8-cat--campaign" : "";
          return '<a href="' + cat.href + '" class="' + campaignClass.trim() + '">' + cat.label + '</a>';
        }).join("")
      + '</div>'
      + '</div>';
    return wrap;
  }

  /* ============ Desktop dropdown-interaktion ============
     JS-styrd (.is-open), inte ren :hover/:focus-within -- se kravet
     "hover OCH klick OCH tangentbord". En panel åt gången; kort
     öppnings-fördröjning (skydd mot att pekaren bara passerar över
     navet) och kort stängnings-fördröjning (tid att flytta pekaren
     från länken till panelen -- själva panelen ligger DOM-mässigt
     inuti .hz8-cat-item, så mouseleave på hela item-wrappern täcker
     redan förflyttningen dit, ingen separat panel-hover-koppling
     behövs). */
  function initDropdowns(header) {
    var items = Array.prototype.slice.call(header.querySelectorAll(".hz8-cat-item[data-hz8-cat]"));
    if (!items.length) return;

    var OPEN_DELAY = 120;
    var CLOSE_DELAY = 220;
    var openTimer = null;
    var closeTimer = null;
    var current = null;

    function clearTimers() {
      if (openTimer) { window.clearTimeout(openTimer); openTimer = null; }
      if (closeTimer) { window.clearTimeout(closeTimer); closeTimer = null; }
    }

    function openItem(item, immediate) {
      clearTimers();
      function doOpen() {
        if (current && current !== item) closeItem(current, true);
        item.classList.add("is-open");
        var trigger = item.querySelector(".hz8-cat");
        if (trigger) trigger.setAttribute("aria-expanded", "true");
        current = item;
      }
      if (immediate) doOpen();
      else openTimer = window.setTimeout(doOpen, OPEN_DELAY);
    }

    function closeItem(item, immediate) {
      clearTimers();
      function doClose() {
        item.classList.remove("is-open");
        var trigger = item.querySelector(".hz8-cat");
        if (trigger) trigger.setAttribute("aria-expanded", "false");
        if (current === item) current = null;
      }
      if (immediate) doClose();
      else closeTimer = window.setTimeout(doClose, CLOSE_DELAY);
    }

    function focusTrigger(item) {
      var trigger = item.querySelector(".hz8-cat");
      if (trigger) trigger.focus();
    }

    items.forEach(function (item) {
      var trigger = item.querySelector(".hz8-cat");
      if (!trigger) return;

      item.addEventListener("mouseenter", function () { openItem(item, false); });
      item.addEventListener("mouseleave", function () { closeItem(item, false); });

      trigger.addEventListener("click", function (e) {
        /* Toppnivå-triggern är dropdown-VÄXLARE, inte en direktlänk --
           full kategorisida nås via panelens egen CTA ("Alla vapes"
           osv), så navigering hit skulle bara stänga panelen man just
           öppnade. */
        e.preventDefault();
        if (item.classList.contains("is-open")) closeItem(item, true);
        else openItem(item, true);
      });

      trigger.addEventListener("keydown", function (e) {
        if (e.key === " " || e.key === "Spacebar") {
          e.preventDefault();
          trigger.click();
        } else if (e.key === "Escape" && item.classList.contains("is-open")) {
          closeItem(item, true);
          focusTrigger(item);
        }
      });

      item.addEventListener("focusout", function (e) {
        /* Stäng bara om fokus lämnar hela item-wrappern (inte vid en
           intern Tab mellan panelens egna länkar/produktkort). */
        if (!item.contains(e.relatedTarget)) closeItem(item, false);
      });
    });

    document.addEventListener("click", function (e) {
      if (current && !current.contains(e.target)) closeItem(current, true);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && current) {
        var item = current;
        closeItem(item, true);
        focusTrigger(item);
      }
    });
  }

  /* ============ Mobil accordion-interaktion ============
     En sektion åt gången (samma princip som desktop, för konsekvent
     beteende mellan brytpunkterna). `inert` utesluter en hopfälld
     panels länkar/produktkort ur både tabbordning och skärmläsare
     samtidigt som max-height-övergången i CSS kan animeras mjukt
     (till skillnad från `hidden`, som inte kan transitionas). */
  function initMobileAccordions(drawer) {
    var sections = Array.prototype.slice.call(drawer.querySelectorAll(".hz8-mobile-accordion"));
    if (!sections.length) return;

    function setInert(panel, isInert) {
      if ("inert" in panel) panel.inert = isInert;
      else if (isInert) panel.setAttribute("aria-hidden", "true");
      else panel.removeAttribute("aria-hidden");
    }

    sections.forEach(function (section) {
      var trigger = section.querySelector(".hz8-mobile-accordion__trigger");
      var panel = section.querySelector(".hz8-mobile-accordion__panel");
      if (!trigger || !panel) return;
      setInert(panel, true);

      trigger.addEventListener("click", function () {
        var isOpen = panel.classList.contains("is-open");
        sections.forEach(function (other) {
          if (other === section) return;
          var otherTrigger = other.querySelector(".hz8-mobile-accordion__trigger");
          var otherPanel = other.querySelector(".hz8-mobile-accordion__panel");
          if (otherPanel && otherPanel.classList.contains("is-open")) {
            otherPanel.classList.remove("is-open");
            setInert(otherPanel, true);
          }
          if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
        });
        panel.classList.toggle("is-open", !isOpen);
        setInert(panel, isOpen);
        trigger.setAttribute("aria-expanded", String(!isOpen));
      });
    });
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
    initDropdowns(header);

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
      var lockedScrollY = 0;

      /* Bakgrundsscroll måste låsas medan drawern är öppen (annars
         scrollar sidan BAKOM den fasta drawer-panelen på touch-enheter).
         position:fixed+top=-scrollY är det enda pålitliga sättet att
         låsa scroll på iOS Safari (overflow:hidden ensamt läcker
         igenom där) -- scrollpositionen återställs exakt vid stängning. */
      function lockBodyScroll() {
        lockedScrollY = window.scrollY;
        document.body.style.position = "fixed";
        document.body.style.top = "-" + lockedScrollY + "px";
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.classList.add("hz8-scroll-locked");
      }
      function unlockBodyScroll() {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.classList.remove("hz8-scroll-locked");
        window.scrollTo(0, lockedScrollY);
      }

      function openDrawer() {
        drawer.classList.add("is-open");
        if (burger) burger.setAttribute("aria-expanded", "true");
        lockBodyScroll();
      }
      function closeDrawer() {
        drawer.classList.remove("is-open");
        if (burger) burger.setAttribute("aria-expanded", "false");
        unlockBodyScroll();
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

      initMobileAccordions(drawer);
    }

    /* Glasig flytande header (vila) -> fullbredds sticky bar (scrollat).
       KORRIGERING (2026-09-25): tröskeln var tidigare ett fast 40px-tal
       -- bytt mot HERO_SCROLL_FRACTION (70%) av den riktiga herons
       höjd, så headern svävar längre på sidor med en hög hero. Räknas
       om vid resize (herons höjd ändras vid varje brytpunkt: 410/520/
       570/740px). Sidor utan hero (kategori/produkt) faller tillbaka
       till samma fasta 40px som förut. */
    var threshold = HEADER_SCROLL_FALLBACK;
    function computeThreshold() {
      var hero = document.querySelector(".hz8-hero");
      threshold = hero ? hero.getBoundingClientRect().height * HERO_SCROLL_FRACTION : HEADER_SCROLL_FALLBACK;
    }

    var ticking = false;
    var scrolled = false;
    /* Hysteres (±10px runt tröskeln): utan den skulle scrollY som ligger
       still på pixeln exakt vid tröskeln kunna växla klassen fram och
       tillbaka varje litet, ofrivilliga scroll-jitter (t.ex. adressfält
       som döljs/visas på mobil) -- klassen byter bara läge när
       scrollpositionen passerat tydligt förbi tröskeln åt endera hållet. */
    function syncScroll() {
      var y = window.scrollY;
      if (!scrolled && y > threshold + HEADER_SCROLL_HYSTERESIS) scrolled = true;
      else if (scrolled && y < threshold - HEADER_SCROLL_HYSTERESIS) scrolled = false;
      document.body.classList.toggle("hz8-header-scrolled", scrolled);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(syncScroll);
    }, { passive: true });

    var resizeTicking = false;
    window.addEventListener("resize", function () {
      if (resizeTicking) return;
      resizeTicking = true;
      window.requestAnimationFrame(function () {
        computeThreshold();
        syncScroll();
        resizeTicking = false;
      });
    });

    /* .hz8-hero injiceras av 10-hero.js, ett SENARE modul i uppstarts-
       ordningen (se 00-bootstrap.js: modulerna monteras i registrerings-
       ordning, och 05-header.js registrerar sig FÖRE 10-hero.js) -- vid
       denna punkt i körningen finns heron alltså ännu inte i DOM:en.
       Den omedelbara syncScroll() nedan använder därför fallback-värdet
       (ofarligt, korrigeras direkt i nästa bildruta). Den riktiga,
       hero-medvetna uträkningen görs i en rAF som körs EFTER att hela
       uppstarts-loopen (och därmed 10-hero.js) hunnit köra klart. */
    syncScroll();
    window.requestAnimationFrame(function () {
      computeThreshold();
      syncScroll();
    });
  });
})();
