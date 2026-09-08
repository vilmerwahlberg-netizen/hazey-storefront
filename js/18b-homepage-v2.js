
    /* ============================================================
       STARTSIDA v2 — enligt RÄTT prototyp (se CLAUDE.md för sökväg och
       forskningslogg). Fullständig ombyggnad 2026-08-31 efter Vilmers
       punktlista (A-I). navData kommer från js/18a-header-v2.js (samma
       datakälla, körs innan denna fil i 19-core-close.js).
       ============================================================ */

    // Enkla linjeikoner — dekoration, ingen produktdata, ofarligt att hårdkoda.
    var NH_ROUTE_ICONS = {
      vape: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><rect x="7" y="2" width="10" height="7" rx="2"/><path d="M9 9v3a3 3 0 003 3 3 3 0 003-3V9M12 15v6M9 21h6"/></svg>',
      blomma: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><path d="M4 20c7-1 13-6 15-15-9 1-14 6-15 15z"/><path d="M6 18c3-3 6-6 12-13"/></svg>',
      hash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
      cbd: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><path d="M4 20c7-1 13-6 15-15-9 1-14 6-15 15z"/><path d="M6 18c3-3 6-6 12-13"/></svg>',
      serie: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="2"/><circle cx="5" cy="10" r="2"/><circle cx="19" cy="10" r="2"/><circle cx="12" cy="19" r="2"/><path d="M12 7v5m-5.5-2.5L12 12m5.5-2.5L12 12m0 2v3"/></svg>'
    };

    function nhFirstHref(group, prefix) {
      var hit = group.items.filter(function (it) { return it.slug.indexOf(prefix) === 0 || it.slug === prefix; })[0];
      return hit ? hit.href : null;
    }

    /* ── Hero + qfind — ERSÄTTER nyehandels nativa bildkarusell på
       startsidan (döljs, INTE tas bort — samma "dölj, radera aldrig
       nativt"-mönster som resten av bygget). Copy är prototypens egen,
       uttryckligen begärd av Vilmer 2026-09-01 för exakt visuell paritet
       (se PROTOTYP-INVENTERING.md). Två textvarianter per breddpunkt
       (mVp/dVp har olika ingress/knapptext, uppmätt, inte samma text
       skalad). ──

       Bildkälla (rättad 2026-09-01, se tests/blueprints/
       mobile-hero-port.md §G/STATUS.md): facitens EGNA bild
       (hero-westcoast-v4.jpg) ligger nu SPÅRAD i det här repot
       (assets/hero-westcoast-v4.jpg, samma bytes som prototypens fil,
       inte regenererad) och hostas via SAMMA jsDelivr GitHub-mekanism
       som hazey.css/hazey.min.js (se blocks/loader.html/loader-dev.html)
       — inte längre den nativa nyehandel-bilden, som visade fel motiv
       (en cannabisplanta i stället för facitens västkust-lifestyle-foto).
       `NH_ASSET_BASE` är konfigurerbar (window.NH_ASSET_BASE) i stället
       för hårdkodad. Produktionsfallbacken pekar på SAMMA pinnade,
       evigt cachade jsDelivr-tagg som produktionsloadern
       (`blocks/loader.html`) — inte den ocachade `@dev`-grenen, som
       tidigare gjorde assets och kod versionsosynkade sinsemellan (JS/
       CSS pinnat vid en tagg, bilden alltid "senaste dev" — kunde tysta
       driva isär vid en framtida dev-ändring). Byt versionen HÄR
       tillsammans med `blocks/loader.html`s tagg vid varje release,
       aldrig ensam. `blocks/loader-dev.html` (dev/preview, pekar
       uttryckligen mot `@dev`) sätter i stället `window.NH_ASSET_BASE`
       explicit innan den här filen laddar — se den filens egen kommentar
       — så denna fallback används bara i produktion. INGEN localhost-URL
       i källkoden. QA/parity-testet överskriver ändå bilden med en
       pixelexakt data:-URL läst direkt från disk (`lockImplImages`/
       LOCKED_IMAGES) — opåverkat av vilken bas som används här. */
    var NH_ASSET_BASE =
      (typeof window !== "undefined" && window.NH_ASSET_BASE) ||
      "https://cdn.jsdelivr.net/gh/vilmerwahlberg-netizen/hazey-storefront@v1.1.0-rc1/assets/";

    /* ── Hero-karusell, konfigurationsdriven (2026-09-07, större homepage-
       runda, uttrycklig instruktion): redo för upp till 3 aktiva slides
       (1: evergreen sortiment/vägledning — dagens enda RIKTIGA slide,
       måste förbli slide 1; 2: kampanj/ny serie/aktuell drop; 3: signup/
       lojalitet/säsongserbjudande), men bygger ALDRIG in en fabricerad
       kampanj bara för att fylla slots — "active" styr allt. Just nu
       finns bara EN verifierad, riktig slide (samma innehåll som fanns
       innan denna omgång, oförändrat), så karusellen renderar/beter sig
       identiskt med en enda statisk hero (inga pilar/prickar, se
       nhHeroHtml/nhInitHeroCarousel nedan) — men mekaniken i sig hanterar
       generellt 1..3 aktiva slides utan att anta ett fast antal.

       Slide 2/3 är MEDVETET INTE instansierade som objekt med påhittad
       marknadsföringstext (det hade varit exakt den typen av gissat
       innehåll uppdraget förbjuder) — när Vilmer har en riktig kampanj/
       ett riktigt signup-erbjudande läggs den in som ett nytt objekt i
       NH_HERO_SLIDES med samma form som slide 1 nedan (eyebrowMobile/
       eyebrowDesktop/h1/pMobile/pDesktop/image/primaryCta/secondaryCta),
       `active:true`. Mekanismen (nhHeroHtml/nhInitHeroCarousel) kräver
       ingen kodändring för att gå från 1→2→3 aktiva slides. */
    var NH_HERO_SLIDES = [
      {
        id: "assortment",
        active: true,
        image: "hero-westcoast-v4.jpg",
        // Två olika eyebrow/underrubrik-texter per breddpunkt (uppmätt ur
        // facit — INTE samma text skalad, se historiken nedan).
        eyebrowMobile: "Brett sortiment · öppen information",
        eyebrowDesktop: "Sveriges bredaste cannabinoidsortiment",
        h1: "Hitta rätt utan att kunna allt.",
        pMobile: "Sök direkt eller jämför på innehåll, format och framställning.",
        pDesktop: "Sök direkt, eller jämför produkter på innehåll, framställning och publicerat analyscertifikat.",
        primaryCta: { label: "Utforska sortimentet", href: "#populara-vagar" },
        secondaryCta: { labelMobile: "Hjälp mig →", labelDesktop: "Hjälp mig hitta rätt →", openHr: true }
      },
      // Slide 2 (creative-direction-runda 2026-09-08): riktig, verifierad
      // destination -- INGEN fabricerad rabatt/kampanj, se uppdragets
      // uttryckliga förbud. Bilden är samma godkända Magic Sauce-derivat
      // som redan används i Populära serier (assets/series/magic-sauce.jpg).
      {
        id: "magic-sauce",
        active: true,
        image: "series/magic-sauce.jpg",
        eyebrowMobile: "Populär serie",
        eyebrowDesktop: "Populär serie hos Hazey",
        h1: "Upptäck Magic Sauce.",
        pMobile: "Vape, buds och hash i en av våra mest efterfrågade serier.",
        pDesktop: "Vape, buds och hash i en av våra mest efterfrågade serier — se hela sortimentet.",
        primaryCta: { label: "Se Magic Sauce-sortimentet", href: "/sv/categories/magic-sauce" },
        secondaryCta: null
      }
    ];

    function nhHeroSlideHtml(slide, i, kampanjerHref, catLinks) {
      var heroSrc = NH_ASSET_BASE + slide.image;
      // data-hero-src: en QA-selektorkrok för lockImplImages (se ovan) —
      // värdet spelar ingen roll för testresultatet (skrivs över), bara
      // att attributet finns. Sätts till samma URL som faktiskt visas.
      var bg = ' style="background-image:url(\'' + heroSrc.replace(/'/g, "\\'") + '\')" data-hero-src="' + heroSrc.replace(/"/g, "&quot;") + '"';
      var secondary = slide.secondaryCta
        ? '<button type="button" class="hero-link"' + (slide.secondaryCta.openHr ? ' data-open-hr="1"' : "")
          + '><span class="nh-hero-v2__btn--mobile">' + slide.secondaryCta.labelMobile + '</span>'
          + '<span class="nh-hero-v2__btn--desktop">' + slide.secondaryCta.labelDesktop + '</span></button>'
        : "";
      // SEO-krav (oförändrat sen förra rundan): startsidan får ha EXAKT EN
      // <h1> i DOM:en, oavsett hur många hero-slides som finns (alla slides
      // ligger samtidigt i DOM:en, bara förskjutna via transform -- en andra
      // <h1> hade återinfört det redan verifierat fixade two-H1-problemet).
      // Bara första slidet (i===0) får en riktig <h1>; övriga slides
      // återanvänder EXAKT samma CSS-klass på en <p> i stället, visuellt
      // identiskt, semantiskt en rubrik lägre.
      var headingTag = i === 0 ? "h1" : "p";
      return '<div class="nh-hero-slide" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + '"' + bg + '>'
        + '  <div class="nh-hero-v2__inner">'
        + '    <div class="nh-hero-v2__eyebrow nh-hero-v2__eyebrow--mobile">' + slide.eyebrowMobile + '</div>'
        + '    <div class="nh-hero-v2__eyebrow nh-hero-v2__eyebrow--desktop">' + slide.eyebrowDesktop + '</div>'
        + '    <' + headingTag + ' class="nh-hero-v2__h1">' + slide.h1 + '</' + headingTag + '>'
        + '    <p class="nh-hero-v2__p--mobile">' + slide.pMobile + '</p>'
        + '    <p class="nh-hero-v2__p--desktop">' + slide.pDesktop + '</p>'
        // Kategori-genvägsraden finns BARA på desktop i rätt fil (dVp),
        // inte i mVp — döljs på mobil via CSS. Delad mellan slides (samma
        // riktiga navigationslänkar oavsett vilken slide som visas).
        + '    <div class="nh-hero-v2__cats">' + catLinks + '</div>'
        + '    <div class="nh-hero-v2__cta">'
        + '      <a class="btn-solid" href="' + slide.primaryCta.href + '">' + slide.primaryCta.label + '</a>'
        + secondary
        + '    </div>'
        + '  </div>'
        + '</div>';
    }

    function nhHeroHtml(navData, kampanjerHref) {
      var vapeHref = nhFirstHref(navData.groups.vape, "alla-vapes") || "/sv/categories/alla-vapes";
      var blommaHref = nhFirstHref(navData.groups.blomma, "blommor-buds") || "/sv/categories/blommor-buds";
      var hashHref = nhFirstHref(navData.groups.hash, "hasch") || "/sv/categories/hasch";
      var cbdEntry = navData.footerLinks.filter(function (it) { return it.slug === "cbd-group"; })[0];
      var cbdHref = cbdEntry ? cbdEntry.href : "/sv/categories/cbd-group";
      var catLinks = ''
        + '<a href="' + vapeHref + '">Vapes &amp; carts</a>'
        + '<a href="' + blommaHref + '">Blommor</a>'
        + '<a href="' + hashHref + '">Hash</a>'
        + '<a href="' + cbdHref + '">CBD, CBG &amp; CBN</a>'
        + '<a href="' + kampanjerHref + '">Kampanjer</a>';

      var active = NH_HERO_SLIDES.filter(function (s) { return s.active; });
      var multi = active.length > 1;
      var slidesHtml = active.map(function (s, i) { return nhHeroSlideHtml(s, i, kampanjerHref, catLinks); }).join("");
      var dots = multi
        ? '<div class="nh-hero-dots" role="tablist" aria-label="Val av bild">'
          + active.map(function (s, i) {
              return '<button type="button" class="nh-hero-dot" role="tab" aria-label="Bild ' + (i + 1) + '" aria-current="' + (i === 0 ? "true" : "false") + '" data-i="' + i + '"></button>';
            }).join("")
          + '</div>'
        : "";
      var arrows = multi
        ? '<button type="button" class="nh-hero-arrow nh-hero-arrow--prev" aria-label="Föregående bild">‹</button>'
          + '<button type="button" class="nh-hero-arrow nh-hero-arrow--next" aria-label="Nästa bild">›</button>'
        : "";

      return '<section class="nh-hero-v2 nh-qfind-hero" id="nhHero" data-slides="' + active.length + '">'
        + '  <div class="nh-hero-track">' + slidesHtml + '</div>'
        + arrows + dots
        + '</section>'
        // qfind — "Vad söker du?"-chipsraden direkt under hero:n. OBS:
        // Naturidentiskt/Semisyntetiskt-chippen använder samma ej-beslutade
        // terminologi som segmentet i "Populära vägar" (se den kommentaren)
        // — flaggat, inte ett nytt beslut.
        + '<section class="nh-qfind" aria-label="Snabbval">'
        + '  <div class="nh-qfind__inner">'
        + '    <div class="nh-qfind__lbl">Vad söker du?<span>Ett klick — inget quiz.</span></div>'
        + '    <div class="nh-qfind__chips">'
        + '      <button type="button" class="nh-qfc nh-qfc--pri" data-open-hr="1">Jag är nybörjare</button>'
        + '      <a class="nh-qfc" href="' + vapeHref + '">Vapes &amp; carts</a>'
        + '      <a class="nh-qfc" href="' + blommaHref + '">Blommor</a>'
        + '      <a class="nh-qfc" href="/sv/categories/alla-produkter">Naturidentiskt</a>'
        + '      <a class="nh-qfc" href="/sv/categories/alla-produkter">Semisyntetiskt</a>'
        + '      <a class="nh-qfc" href="' + kampanjerHref + '">Kampanjer</a>'
        + '    </div>'
        + '  </div>'
        + '</section>';
    }

    /* Karusellbeteende — no-op när bara 1 slide är aktiv (inga lyssnare
       registreras alls, se early return). Svep (pointer events, fungerar
       för touch OCH mus), pilar, prickar, valfri diskret autoplay som
       pausar permanent vid första interaktionen och pausar/återupptas med
       fliksynlighet (document.visibilitychange) — aldrig aktiv om
       `prefers-reduced-motion: reduce`. */
    function nhInitHeroCarousel(root) {
      var section = root.querySelector("#nhHero");
      if (!section) return;
      var total = parseInt(section.getAttribute("data-slides"), 10) || 1;
      if (total <= 1) return; // inga kontroller när bara en slide finns
      var track = section.querySelector(".nh-hero-track");
      var dots = Array.prototype.slice.call(section.querySelectorAll(".nh-hero-dot"));
      var prevBtn = section.querySelector(".nh-hero-arrow--prev");
      var nextBtn = section.querySelector(".nh-hero-arrow--next");
      var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var index = 0;
      var autoplayTimer = null;
      var userStopped = false; // sant efter FÖRSTA manuella interaktionen — autoplay återupptas då aldrig, bara fliksynlighet får pausa/återuppta innan dess

      function render() {
        track.style.transform = "translateX(-" + (index * 100) + "%)";
        dots.forEach(function (d, i) { d.setAttribute("aria-current", i === index ? "true" : "false"); });
      }
      function goTo(i) {
        index = (i + total) % total;
        render();
      }
      function stopAutoplay() {
        if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; }
      }
      function startAutoplay() {
        if (reduceMotion || userStopped || autoplayTimer) return;
        autoplayTimer = setInterval(function () { goTo(index + 1); }, 6500);
      }
      function onManualInteraction() { userStopped = true; stopAutoplay(); } // pausar permanent vid interaktion, inte bara tillfälligt

      dots.forEach(function (d) {
        d.addEventListener("click", function () { onManualInteraction(); goTo(parseInt(d.getAttribute("data-i"), 10)); });
      });
      if (prevBtn) prevBtn.addEventListener("click", function () { onManualInteraction(); goTo(index - 1); });
      if (nextBtn) nextBtn.addEventListener("click", function () { onManualInteraction(); goTo(index + 1); });

      // Svep — pointer events täcker touch och mus i ett enda API.
      var startX = null, dx = 0, dragging = false;
      track.addEventListener("pointerdown", function (e) {
        dragging = true; startX = e.clientX; dx = 0;
        onManualInteraction();
      });
      track.addEventListener("pointermove", function (e) {
        if (!dragging) return;
        dx = e.clientX - startX;
      });
      function endDrag() {
        if (!dragging) return;
        dragging = false;
        if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1));
        dx = 0;
      }
      track.addEventListener("pointerup", endDrag);
      track.addEventListener("pointercancel", endDrag);
      track.addEventListener("pointerleave", function () { if (dragging) endDrag(); });

      // Tangentbord — höger/vänster pil när karusellen har fokus.
      section.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") { onManualInteraction(); goTo(index - 1); }
        if (e.key === "ArrowRight") { onManualInteraction(); goTo(index + 1); }
      });

      document.addEventListener("visibilitychange", function () {
        if (document.hidden) stopAutoplay();
        else if (!reduceMotion) startAutoplay();
      });

      render();
      startAutoplay();
    }

    /* ── "Populära serier" ──
       RÄDDNINGSRUNDA 2026-09-08 (fokuserad mobil-omgång, se STATUS.md):
       tidigare omgångar visade bara de serier en LIVE nav-DOM-genomsökning
       råkade klassificera (Magic Sauce/Nano-11/Magic Farmers/Tatra Hemp)
       -- riktigt datadrivet, men fel mot uppdraget, som uttryckligen vill
       se alla SEX kundnära identiteter (THCaB, THCbA, Magic Sauce,
       Nano-11, THC-X, D10) redan nu i tema 6, trots att tre av dem
       fortfarande saknar migrerade produkter. Tre av de sex kan därför
       INTE deriveras ur nav-DOM:en -- sektionen är nu en explicit
       konfigurationslista (NH_PSER_CARDS) i stället för en ren
       DOM-avläsning, med Magic Sauce/Nano-11 (som HAR riktig data)
       fortfarande hämtade från samma live-klassificerade nav-data som
       förut (NH_SERIE_OVERRIDES i js/18a-header-v2.js) -- inget
       hårdkodat länkmål för dem, bara VILKA sex namn som visas är fast.

       Verifierat på nytt 2026-09-08 (curl mot hazeyse.nyehandel.se,
       läsning av riktig HTML/titel, inget skrivet):
       - /sv/categories/magic-sauce -- 200, <title>Magic Sauce</title>,
         12 riktiga produkter (räknat via .product-card-noder/2, matchar
         Vilmers uppgift exakt).
       - /sv/categories/nano-11 -- 200, <title>Nano-11</title>,
         8 riktiga produkter (samma räkning, matchar exakt). Nyehandels
         interna filtertagg heter "Serie_Nano11" (utan bindestreck) --
         kundnamnet visas ändå alltid som "Nano-11" (bara etikett,
         påverkar inte hrefen/datan).
       - EXAKT en riktig THCX-produkt existerar
         (/sv/products/vape-thcx-19-core-2ml, 200, verifierat) men är
         taggad "Serie_Core" i Nyehandel -- en delad tagg som täcker fler
         produkter än bara THCX, INTE en dedikerad THC-X-kategori. Vi rör
         INTE Serie_Core och skapar INGEN ny Serie_THC-X härifrån (kan
         inte göras från terminalen ändå). Kortet länkar i stället direkt
         till den enda riktiga produktsidan -- en verifierad, relevant,
         fungerande destination, mer ärlig än att peka på en delad,
         missvisande Core-kategori som skulle visa fel produkter.
       - THCaB/THCbA/D10: uttömmande omprövat (sitemap.xml + fritext-
         sökning i hela produktkatalogen, se tidigare omgångars logg i
         STATUS.md) -- fortfarande INGEN kategori eller produkt med
         dessa namn någonstans på sajten. Byggs ändå visuellt färdiga nu
         (uttrycklig instruktion denna omgång), men UTAN <a href> --
         renderas som icke-klickbara kort (ingen gissad/lånad destination,
         se nedan) tills en riktig produktmigrering ger dem ett riktigt
         länkmål. Räkne-/tagg-/destinationsfälten i NH_PSER_CARDS är redan
         förberedda så en framtida migrering bara fyller i värden --
         ingen ny visuell ombyggnad ska behövas då.

       Bilder: sex av Vilmer denna omgång UTTRYCKLIGEN godkända
       kategoribilder, använda exakt som givna oavsett vilket varumärke/
       vilken förpackning som råkar synas i dem (uttrycklig instruktion,
       ersätter förra omgångens försiktighet där två av dem avvisades av
       just den anledningen -- se STATUS.md-historiken för den tidigare
       bedömningen). Nedskalade lokalt till assets/series/*.jpg (480×480,
       jpeg q80), originalfilerna utanför repot orörda. */
    // Umbrella-slug per serie -- FÖRETRÄDE framför formatspecifika
    // undersidor (m-s-vapes/m-s-buds/nano11-blommor). Rotorsaksfynd
    // 2026-09-08 (curl-verifierat mot hazeyse.nyehandel.se): den
    // tidigare "ta första gruppens group.series[namn]"-logiken (borttagen
    // nedan) råkade plocka "m-s-vapes" (2 riktiga produkter) i stället
    // för den fullständiga "magic-sauce"-kategorin (12 riktiga produkter,
    // Vilmers bekräftade tal) -- ren DOM-iterationsordning avgjorde vilken
    // som "vann" i group.series, inte vilken som faktiskt är rätt
    // destination för ett seriekort. Nano-11/nano11-blommor råkade redan
    // ge samma riktiga produktantal (8) oavsett vilken som vann, så buggen
    // syntes bara på Magic Sauce -- men den explicita slug-prioriteringen
    // här gör båda deterministiskt korrekta oavsett DOM-ordning framöver.
    // SEO-status (SEO-paritetsrunda 2026-09-08): dessa två umbrella-URL:er
    // är AVSIKTLIGA Nyehandel-landningssidor, inte en tillfällig fallback --
    // de är de rimliga framtida mottagarna för den gamla WordPress-sajtens
    // (www.hazey.se) indexerade P0-URL:er `/produkt-kategori/alla-produkter/
    // magic-sauce/` respektive `.../nano-11/` (se seo-data/URL-HUBB-
    // MASTERPLAN.md + SEO-RADATA-ARKIV-2026-08.md). Filter-URL:er
    // (`?filters=...`) ska ALDRIG ersätta dem som länkmål här -- Nyehandels
    // robots.txt blockerar redan `/*?filters` från crawling, så en
    // filterlänk vore osynlig för Google oavsett innehåll.
    var NH_PSER_SERIE_SLUGS = {
      "Magic Sauce": ["magic-sauce", "m-s-vapes", "m-s-buds"],
      "Nano-11": ["nano-11", "nano11-blommor"]
    };
    function nhSerieHref(navData, name) {
      var slugs = NH_PSER_SERIE_SLUGS[name] || [];
      // navData.bySlug: platt slug→href-karta över VARJE riktig nav-länk
      // (js/18a-header-v2.js, nhBuildNavData) — den enda uppslagningen som
      // hittar en "paraply"-slug utan eget format (t.ex. "magic-sauce",
      // som aldrig hamnar i något groups[k].items, se kommentaren där).
      for (var i = 0; i < slugs.length; i++) {
        var href = navData.bySlug ? navData.bySlug[slugs[i]] : null;
        if (href) return href;
      }
      // Fallback (bör inte behövas i praktiken): samma äldre, mindre
      // exakta group.series-uppslagning som fanns innan denna fix, ifall
      // Nyehandel någon gång byter bort de kända umbrella-sluggarna ovan.
      var fallback = null;
      ["vape", "blomma", "hash"].forEach(function (g) {
        if (fallback) return;
        fallback = navData.groups[g].series[name] || null;
      });
      return fallback;
    }
    // Ordning låst 2026-09-08 (SEO-paritetsrunda): Magic Sauce/THCaB/
    // Nano-11/THCbA visas direkt (fyra kort i första mobilvyn), D10/THC-X
    // nås via swipe -- uttrycklig instruktion denna omgång.
    var NH_PSER_CARDS = [
      { name: "Magic Sauce", img: "series/magic-sauce.jpg", serie: "Magic Sauce", liveCount: true },
      { name: "THCaB", img: "series/thcab.jpg" },
      { name: "Nano-11", img: "series/nano-11.jpg", serie: "Nano-11", liveCount: true },
      { name: "THCbA", img: "series/thcba.jpg" },
      { name: "D10", img: "series/d10.jpg" },
      { name: "THC-X", img: "series/thc-x.jpg", href: "/sv/products/vape-thcx-19-core-2ml" }
    ];
    function nhPopularaSerierHtml(navData) {
      var serieHrefs = {};
      Object.keys(NH_PSER_SERIE_SLUGS).forEach(function (name) {
        serieHrefs[name] = nhSerieHref(navData, name);
      });

      return '<section class="nh-pser section-gap" id="populara-serier">'
        + '  <div class="sec-head"><h2>Populära serier</h2></div>'
        + '  <div class="pser-row">'
        + NH_PSER_CARDS.map(function (c) {
            var href = c.serie ? (serieHrefs[c.serie] || null) : (c.href || null);
            var avatar = '<span class="pser-avatar has-photo" style="background-image:url(\''
              + NH_ASSET_BASE + c.img + '\')"></span>';
            var countAttr = (c.liveCount && href) ? ' data-count-href="' + href + '"' : "";
            var inner = avatar
              + '<span class="pser-name">' + c.name + '</span>'
              + '<span class="pser-n"></span>';
            // Utan riktig destination (THCaB/THCbA/D10 i dag): rendera ett
            // semantiskt icke-klickbart kort med SAMMA visuella markup --
            // aldrig href="#", tom sträng eller en irrelevant kategori.
            return href
              ? '<a class="pser-item nh-reveal" href="' + href + '"' + countAttr + '>' + inner + '</a>'
              : '<div class="pser-item pser-item--soon nh-reveal" aria-disabled="true">' + inner + '</div>';
          }).join("")
        + '  </div>'
        + '</section>';
    }

    /* Räknar fram RIKTIGT produktantal för Populära serier-kort som har
       en verifierad, riktig destination (data-count-href, se
       nhPopularaSerierHtml) — samma beprövade fetch-mönster som
       js/10-product-sections.js. Inga hårdkodade mocktal. Kort UTAN
       data-count-href (THC-X/THCbA/THCaB/D10 i dag, se kommentaren ovan
       nhPopularaSerierHtml) rörs inte här — deras ".pser-n" förblir tom,
       men kortet självt döljs ALDRIG av den anledningen (till skillnad
       från ett kort som HAR en count-källa men får 0 träffar — det
       antas då sakna riktiga produkter och döljs helt). */
    function nhEnhanceWithRealPhotos(root) {
      var countTargets = root.querySelectorAll("[data-count-href]");
      if (!countTargets.length) return;
      var cache = {};
      function fetchPage(href) {
        if (cache[href]) return cache[href];
        cache[href] = fetch(href, { credentials: "same-origin" })
          .then(function (r) { return r.ok ? r.text() : ""; })
          .then(function (html) { return html ? new DOMParser().parseFromString(html, "text/html") : null; })
          .catch(function () { return null; });
        return cache[href];
      }
      countTargets.forEach(function (el) {
        fetchPage(el.getAttribute("data-count-href")).then(function (doc) {
          var n = doc ? doc.querySelectorAll(".product-card").length : 0;
          if (!n) { el.hidden = true; return; }
          var nEl = el.querySelector(".pser-n");
          if (nEl) nEl.textContent = n + (n === 1 ? " produkt" : " produkter");
        });
      });
    }

    /* ── "Populära vägar" — FORMAT (inte serier, de är i egen sektion).
       4 kort: Vapes/Blommor/Hash + CBD,CBG&CBN (Vilmer 2026-08-31: ett
       vägkort som länkar till CBD-landningssidan är okej, skiljer sig från
       beslutet om ingen egen cannabinoid-FLIK i toppnav). Plus
       framställnings-segment (se flagga i koden).

       Bildkälla (rättad 2026-09-07, se den mid-turn-korrigeringen i
       STATUS.md om kategoribilder): kontrollerat att Nyehandels egna
       publika kategorisidor (alla-vapes/blommor-buds/hasch) INTE
       exponerar någon riktig kategori-/banner-bild i DOM:en — enda
       bilden inom de första 500px är sajtens genomgående mini-header-
       logga, ingen per-kategori-bild. Beslutsgren 2 (se korrigeringen)
       gäller alltså: ingen riktig Nyehandel-källa finns, så en
       optimerad presentationsderivat under assets/routes/ används i
       stället för den gamla nhEnhanceWithRealPhotos-mekanismen (som
       hämtade FÖRSTA slumpmässiga produktfoto från kategorisidan —
       exakt det uppdraget förbjuder när en uttryckligt vald bild finns).
       Källa: facitets EGNA, redan lokalt ägda lifestyle-bilder
       (index.html rad 3219-3231, category-{vapes,buds,hash,cbd}-v3.jpg)
       — en redan sammanhållen bildfamilj (varm studio/naturstil, samma
       färggradering), kopierade och nedskalade (800×800 jpeg q78) till
       assets/routes/. Originalen i prototyp/assets/ är oförändrade. */
    function nhPopularaVagarHtml(navData) {
      var vapeHref = nhFirstHref(navData.groups.vape, "alla-vapes") || "/sv/categories/alla-vapes";
      var blommaHref = nhFirstHref(navData.groups.blomma, "blommor-buds") || "/sv/categories/blommor-buds";
      var hashHref = nhFirstHref(navData.groups.hash, "hasch") || "/sv/categories/hasch";
      var cbdEntry = navData.footerLinks.filter(function (it) { return it.slug === "cbd-group"; })[0];
      var cbdHref = cbdEntry ? cbdEntry.href : "/sv/categories/cbd-group";

      var cards = [
        { kicker: "Format", label: "Vapes & carts", sub: "Engångsvapes & carts", href: vapeHref, icon: "vape", photo: "routes/vapes.jpg" },
        { kicker: "Format", label: "Blommor", sub: "Filtrerbar lista", href: blommaHref, icon: "blomma", photo: "routes/blommor.jpg" },
        { kicker: "Format", label: "Hash", sub: "Piatella & mousse", href: hashHref, icon: "hash", photo: "routes/hash.jpg" },
        { kicker: "Format", label: "CBD, CBG & CBN", sub: "Egen ingång", href: cbdHref, icon: "cbd", photo: "routes/cbd.jpg", showIcon: true }
      ];

      // Framställning (Naturidentiskt/Semisyntetiskt) — terminologin är
      // tagen rakt av från prototypen, INTE ett beslut vi tagit här. Se
      // CLAUDE.md/STATUS.md, fortfarande obesvarad fråga till Vilmer.
      // Länkar till alla-produkter tills vidare — inget riktigt
      // framställnings-filter finns byggt på kategorisidor än.
      var framHref = "/sv/categories/alla-produkter";
      var framCards = [
        { label: "Naturidentiskt", sub: "Finns i plantan",
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><path d="M9 3h6M10 3v6l-5.5 9.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-3L14 9V3"/><path d="M8 15h8"/></svg>' },
        { label: "Semisyntetiskt", sub: "Vidarebearbetad",
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><circle cx="12" cy="5" r="2"/><circle cx="5" cy="10" r="2"/><circle cx="19" cy="10" r="2"/><circle cx="12" cy="19" r="2"/><path d="M12 7v5m-5.5-2.5L12 12m5.5-2.5L12 12m0 2v3"/></svg>' }
      ];

      return '<section class="nh-routes section-gap" id="populara-vagar">'
        + '  <div class="sec-head"><div><h2>Populära vägar</h2>'
        + '  <p>Format för den som redan vet vad den vill ha.</p></div>'
        + '  <a class="more" href="/sv/categories/alla-produkter">Se allt →</a></div>'
        + '  <div class="routes-grid">'
        + cards.map(function (c) {
            var bg = ' style="background-image:url(\'' + NH_ASSET_BASE + c.photo + '\')"';
            // Facit (index.html rad 4306-4318): endast CBD/CBG/CBN-kortet
            // behåller en liten ikon-badge ovanpå fotot (de andra tre har
            // ingen), troligen för att CBD/CBG/CBN är en cannabinoid-grupp,
            // inte ett fysiskt format som de andra tre — .route-icon-keep
            // är den enda undantagsklassen från den generella
            // has-photo→dölj-ikon-regeln (css/22-homepage-v2.css).
            var iconCls = c.showIcon ? " route-icon-keep" : "";
            var iconHtml = c.showIcon ? '<div class="route-icon">' + NH_ROUTE_ICONS[c.icon] + '</div>' : "";
            return '<a class="route visual has-photo nh-reveal' + iconCls + '" href="' + c.href + '"' + bg + '>'
              + iconHtml
              + '<div class="route-kicker">' + c.kicker + '</div><h3>' + c.label + '</h3>'
              + '<p class="route-sub">' + c.sub + '</p></a>';
          }).join("")
        + '  </div>'
        + '  <p class="seg-note nh-reveal">Vill du hellre utgå från hur produkten är framställd?</p>'
        + '  <div class="seg">'
        + framCards.map(function (c) {
            return '<a class="seg-btn nh-reveal" href="' + framHref + '">'
              + '<span class="seg-ico">' + c.icon + '</span>'
              + '<span><span class="seg-t">' + c.label + '</span><span class="seg-s">' + c.sub + '</span></span></a>';
          }).join("")
        + '  </div>'
        + '</section>';
    }

    /* ── Trust-block, KONSOLIDERAD (ersätter det gamla, duplicerade
       ikon-raden — se STATUS.md om dubblettbuggen). Alla värden RIKTIGA,
       bekräftade av Vilmer 2026-08-31:
       - Trustpilot 4,7/5 — riktig, länkad till er faktiska recensionssida.
       - "Sedan 2020" — bolaget registrerades 2020, bekräftat.
       - "Leveransgaranti" — riktig policy, bekräftat att den får skrivas
         som fakta.
       "Analys på X %" är INTE med — verifierat att ingen riktig,
       tillförlitlig datakälla finns i produktkortens DOM för att räkna fram
       certifikattäckning (ingen data-lab-liknande attribut hittad). Skrivs
       inte in för hand — se öppen datafråga i STATUS.md. ── */
    /* PAKET B (2026-09-02, andra försöket): facits .trust-block är INTE
       en 2×2-ikonruta (det var vår tidigare, av Vilmer godkända EGNA
       tolkning 2026-08-31) — facit har en enkolumns struktur: rubrik +
       ingress + en 4-radig bock-lista (index.html rad 4554-4571).
       Portat till facits LAYOUT, men med VÅRA redan godkända, riktiga
       fakta (Trustpilot-betyg/leveransgaranti/diskretion/grundår) i
       stället för facits egna påståenden om batch-certifikat och
       "certifikattäckning just nu: X%" — den senare siffran är redan
       tidigare konstaterad OMÖJLIG att bakas med riktig data (ingen
       tillförlitlig källa i produktkortens DOM, se STATUS.md/CLAUDE.md)
       och skrivs därför INTE in, varken gissad eller fabricerad.
       Facit-kalibrering 2026-09-06 (se STATUS.md): CTA:n är BYTT bort
       från Trustpilot-länken igen. Verifierat att SAMMA "4,7/5 på
       Trustpilot"-länk redan är den riktiga, avsedda CTA:n i
       "Verifierade omdömen"-sektionen (nhReviewsHtml, nedan) — att
       återanvända den här också hade varit en tyst dubblettlänk, precis
       det uppdraget varnade för ("kontrollera avsedd informations-
       arkitektur innan flytt/duplicering"). Ingen riktig transparens-/
       labbrapportsida finns byggd (verifierat 404 på transparens/
       analyscertifikat/labbrapport/certifikat/coa/analys), så CTA:n
       pekar i stället på en ANNAN riktig sida vars innehåll faktiskt
       täcker punkterna nedan (leveransgaranti/diskretion/spårbarhet):
       /sv/page/kop-och-leveransvillkor (verifierat 200, riktig
       köp-/leveransvillkorssida). */
    /* ÄNDRAT 2026-09-07 (större homepage-runda): trustblocket hade en
       rubrik/ingress som lovade "innehåll och ursprung" men alla fyra
       punkter var uteslutande leveransfokuserade -- ett genuint innehålls-
       /rubrikmissförhållande, inte bara en visuell fråga. Delat i två
       tydligt namngivna grupper (Transparens/Leverans) per uppdragets
       progressiva trust-modell, i stället för att bygga en helt ny
       sektion. Transparens-punkterna är medvetet BARA två och BARA sådant
       som är verifierat sant: (1) innehåll/styrka anges verifierat på
       riktiga produktsidor (t.ex. "22%" upprepat på en riktig THCA-
       produkts PDP); (2) samma juridiska påstående som redan används
       ordagrant i den riktiga FAQ:n ("Vi säljer endast cannabinoider som
       är lagliga i Sverige"), inte en ny formulering. INGET om analys-
       certifikat/batch-koppling -- redan tidigare konstaterat att ingen
       tillförlitlig datakälla finns för det (se STATUS.md/CLAUDE.md),
       skrivs därför inte in. Leverans-punkterna är oförändrade (samma
       fyra som innan), bara omgrupperade under en egen etikett. */
    /* Creative-direction-runda 2026-09-08: omstrukturerad från en ljus
       "punktlista i två spalter" till en kompakt, mörk 4-stegsprocess
       (principen lånad från Lyfteds "urval till dörren"-storytelling,
       INTE kopierad kod/text/bild -- egen design, egna riktiga fakta).
       Samtliga sakuppgifter är OFÖRÄNDRADE, redan verifierade fakta från
       föregående omgångar -- bara omgrupperade till fyra steg i stället
       för två rubrikgrupper. Ingen ny SEO-utredning gjord denna omgång
       (uttryckligt förbud), ingen text borttagen: leveransgarantin och
       "sedan 2020" ligger kvar som en synlig fotnot under stegen i
       stället för i en egen punktlista. */
    function nhTrustBlockHtml() {
      var steps = [
        { n: "01", title: "Kurerat sortiment", text: "Vi säljer endast cannabinoider som är lagliga i Sverige." },
        { n: "02", title: "Tydligt innehåll", text: "Innehåll och styrka anges på varje produktsida, analyscertifikat där de finns." },
        { n: "03", title: "Diskret paketerat", text: "Neutral avsändare, spårbar leverans från Sverige — aldrig gränsöverskridande." },
        { n: "04", title: "Snabb leverans", text: "Normalt inom 1–2 vardagar." }
      ];
      return '<section class="nh-trustblock section-gap">'
        + '  <div class="nh-tb-inner">'
        + '    <h2>Så arbetar Hazey med innehåll och ursprung</h2>'
        + '    <p>Vi är öppna med vad som finns i våra produkter och var de kommer ifrån — inga effektlöften, bara verifierbara fakta.</p>'
        + '    <div class="nh-tb-steps">'
        + steps.map(function (s) {
            return '<div class="nh-tb-step nh-reveal"><span class="nh-tb-step__n">' + s.n + '</span>'
              + '<div><h3>' + s.title + '</h3><p>' + s.text + '</p></div></div>';
          }).join("")
        + '    </div>'
        + '    <div class="nh-tb-foot">'
        + '      <span>Leveransgaranti — försvinner paketet skickar vi ett nytt · Svenskt bolag, sedan 2020</span>'
        + '      <a class="nh-tb-link" href="/sv/page/kop-och-leveransvillkor">'
        + '        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>'
        + '        Läs våra köp- och leveransvillkor</a>'
        + '    </div>'
        + '  </div>'
        + '</section>';
    }

    /* ── "Fortsätt där du slutade" — HELT DOLD tills det finns riktig
       besökardata (senast visad/favorit/köpt). Kräver spårningsfunktion
       som inte finns byggd än (produktsida/konto). Bygger bara skalet,
       precis som prototypen själv gör (sektionen är `hidden` där också). ── */
    function nhContinueShellHtml() {
      return '<section class="nh-continue section-gap" id="nh-continue" hidden data-status="ingen-besokardata-an">'
        + '  <div class="sec-head"><div><h2>Fortsätt där du slutade</h2>'
        + '  <p>Visas bara när det finns riktig data — senast visade, favoriter eller ett tidigare köp.</p></div></div>'
        + '  <div class="nh-continue-row"></div>'
        + '</section>';
    }

    /* ── "Bästsäljare i lager" — återanvänder EXAKT samma beprövade
       kategori-skrap-mönster som js/12-bestsellers-listing.js redan
       använder på riktiga sidor (fetch /sv/categories/alla-produkter,
       plocka riktiga .product-card). "Bästsäljare" på den här sajten är
       redan definierat som alla-produkter-kategorin (samma som
       Bästsäljare-fliken i den befintliga tab-sektionen) — inte en
       uppfunnen algoritm.

       Facit-kalibrering 2026-09-06 (se STATUS.md): den STÖRSTA synliga
       avvikelsen var att korten renderades små/hoptryckta jämfört med
       facits två stora premiumkort. Rotorsak: `#nhFeaturedRow` klonar
       riktiga `.product-card`-element men saknade den klassen
       (`.pl-list`) som redan äger ALL premiumkort-styling någon annan-
       stans på sajten (radie/skugga/bildyta/pris/köpknapp, se
       css/02-divi-.../css/03-category-page-header.css m.fl.) — korten
       föll alltså tillbaka på nyehandels helt oskinnnade nativa stil.
       Lösning: återanvänd den befintliga klassen (`pl-list` på raden)
       i stället för att bygga en ny parallell kortstil — exakt samma
       premiumkort som redan finns, bara i en ny container. ── */
    function nhBestsellersHtml() {
      return '<section class="nh-featured section-gap" id="nh-featured">'
        + '  <div class="sec-head"><div><h2>Bästsäljare i lager</h2>'
        + '  <p>Redo att skickas idag — inget variantval krångel.</p></div>'
        + '  <a class="more" href="/sv/categories/alla-produkter">Se allt →</a></div>'
        + '  <div class="nh-featured-row pl-list" id="nhFeaturedRow"><div class="nh-featured-empty">Laddar…</div></div>'
        + '  <div class="nh-swipe-dots" id="nhFeaturedDots" hidden></div>'
        + '</section>';
    }
    /* Swipe-indikation (creative-direction-runda 2026-09-08): en rad
       prickar under svepraden, uppdaterade via IntersectionObserver (samma
       "en observer per rad"-mönster som redan används för Populära serier/
       reviews). Ingen automatisk rullning -- bara ett synligt "du är här"
       som följer besökarens egen swipe. Döljs helt om det bara finns ett
       kort (inget att svepa till). */
    function nhInitSwipeDots(rowEl, dotsEl) {
      if (!rowEl || !dotsEl) return;
      var cards = Array.prototype.slice.call(rowEl.children);
      if (cards.length < 2) { dotsEl.hidden = true; return; }
      dotsEl.hidden = false;
      dotsEl.innerHTML = cards.map(function (_, i) {
        return '<span class="nh-swipe-dot' + (i === 0 ? " is-active" : "") + '"></span>';
      }).join("");
      var dots = Array.prototype.slice.call(dotsEl.children);
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var idx = cards.indexOf(entry.target);
          if (idx === -1) return;
          dots.forEach(function (d, i) { d.classList.toggle("is-active", i === idx); });
        });
      }, { root: rowEl, threshold: 0.6 });
      cards.forEach(function (c) { io.observe(c); });
    }
    function nhInitBestsellers(root) {
      var rowEl = root.querySelector("#nhFeaturedRow");
      if (!rowEl) return;
      fetch("/sv/categories/alla-produkter?sort=in-stock", { credentials: "same-origin" })
        .then(function (r) { return r.ok ? r.text() : ""; })
        .then(function (html) {
          if (!html) throw new Error("no html");
          var doc = new DOMParser().parseFromString(html, "text/html");
          var cards = Array.prototype.slice.call(doc.querySelectorAll(".product-card")).slice(0, 4);
          if (!cards.length) throw new Error("no cards");
          rowEl.innerHTML = "";
          cards.forEach(function (c) {
            var outer = document.createElement("div");
            var inner = document.createElement("div");
            var clone = c.cloneNode(true);
            inner.appendChild(clone);
            // Facit-kalibrering 2026-09-08 (visuell skuld-runda): facits
            // kort har en leveransrad under köpknappen ("Skickas normalt
            // inom 1-2 vardagar"). INTE per-produkt-data -- samma redan
            // verifierade, riktiga, generella leveranspolicy som redan
            // visas i mikrotrust-raden (js/18a-header-v2.js, "Normalt
            // 1-2 vardagar"), bara skriven ut i sin helhet här. Gäller
            // alla produkter lika, fabricerar ingenting per kort.
            // Lagerstatus: RIKTIG, inte gissad -- kortet kommer från
            // fetchen ovan (?sort=in-stock, slice(0,4)), så "I lager" är
            // sant för just dessa fyra vid hämtningstillfället per
            // definition av sorteringen, inte ett hårdkodat påstående.
            var stock = document.createElement("div");
            stock.className = "nh-featured-stock";
            stock.innerHTML = '<span class="nh-featured-stock-dot"></span>I lager';
            clone.appendChild(stock);
            var ship = document.createElement("div");
            ship.className = "nh-featured-ship";
            ship.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/></svg>Skickas normalt inom 1–2 vardagar';
            clone.appendChild(ship);
            outer.appendChild(inner);
            rowEl.appendChild(outer);
          });
          if (window.nhInitCards) window.nhInitCards();
          nhWatchRealRatingValues(rowEl);
          nhInitSwipeDots(rowEl, rowEl.parentNode.querySelector("#nhFeaturedDots"));
        })
        .catch(function () {
          rowEl.parentNode.parentNode.hidden = true; // dölj hela sektionen, visa inget trasigt
        });
    }
    /* SEO-paritetsrunda 2026-09-08: facit visar ett numeriskt betyg
       ("4,6 · 63 omdömen"), inte bara stjärnor+antal. Den RIKTIGA
       decimalsiffran finns redan i DOM:en efter att js/07-ratings.js
       (sajtens delade, sitewide betygsmekanism, initCardRatings/
       nhRatPaint) asynkront fyllt kortets `.rating`-div — som ett
       `title="4.6 av 5"`-attribut på den nyinsatta `.nh-stars`-spannen.
       Rör INTE 07-ratings.js (sitewide, delad av alla produktkort på
       hela sajten, utanför detta uppdrags scope) -- läser bara av
       samma redan hämtade, riktiga data en gång till här, scopat till
       ENDAST denna rad, och lägger till en synlig decimaltext bredvid
       stjärnorna. Ingen ny fetch, ingen fabricerad siffra: om `.rating`
       aldrig får riktig data (nätverksfel/inga omdömen) visas ingen
       decimalsiffra, bara de redan befintliga stjärnorna+antalet. */
    function nhWatchRealRatingValues(rowEl) {
      var ratings = Array.prototype.slice.call(rowEl.querySelectorAll(".rating"));
      if (!ratings.length) return;
      var mo = new MutationObserver(function () {
        ratings.forEach(function (r) {
          if (r.__nhValDone) return;
          var starsEl = r.querySelector(".nh-stars");
          if (!starsEl) return;
          r.__nhValDone = true;
          var m = (starsEl.getAttribute("title") || "").match(/^([0-9.]+)/);
          if (!m) return;
          var val = document.createElement("span");
          val.className = "nh-featured-rating-val";
          val.textContent = parseFloat(m[1]).toFixed(1).replace(".", ",");
          starsEl.insertAdjacentElement("afterend", val);
        });
        if (ratings.every(function (r) { return r.__nhValDone; })) mo.disconnect();
      });
      mo.observe(rowEl, { attributes: true, attributeFilter: ["class"], subtree: true });
      // Timeout-städning: om vissa kort aldrig får riktig data (inga
      // omdömen alls) ska observern inte leva kvar för evigt.
      setTimeout(function () { mo.disconnect(); }, 8000);
    }

    /* ── "I rampljuset" (Spotlight), Fas 2 (2026-09-07) — placerad efter
       Bästsäljare, före trust-blocket. HELT konfigurationsdriven och
       HELT osynlig (renderar ingenting alls, inte ens ett dolt skal)
       när NH_SPOTLIGHT.active är false, vilket den är just nu.

       Uttryckligt krav: välj INTE automatiskt en teknisk/tråkig produkt
       bara för att den råkar ligga först i bästsäljarlistan -- kräver
       en explicit konfiguration eller en verifierad flagga. Ingen sådan
       finns ännu (Vilmer har inte pekat ut en riktig produkt), så
       komponenten byggs och testas (se STATUS.md för hur den
       verifierades med en tillfällig, INTE committad, riktig produkt)
       men lämnas AVSTÄNGD. Se slutrapporten för en konkret rekommenda-
       tion om VILKEN riktig produkt som är en bra kandidat och varför.

       Datakälla vid aktivering: samma robusta, redan beprövade JSON-LD
       `<script type="application/ld+json">`-block som varje riktig PDP
       redan skriver ut (namn/bild/pris/lagerstatus) -- statisk i den
       råa HTML:en, ingen Vue-hydrering behöver köras (samma upptäckt
       som löste "Verifierade omdömen" ovan, men här räcker JSON-LD:s
       EGNA fält, ingen entitetsavkodning av ett Vue-prop-attribut
       behövs). Rationale/sekundärlänk kommer ALLTID från konfigen,
       aldrig gissat eller skrapat. */
    /* Aktiverad 2026-09-08 (creative-direction-runda). Produktval enligt
       uppdragets egen prioritetsordning (relevant Magic Sauce-produkt
       först): "Vape - Magic Sauce 99% - 2ml" -- verifierat via produktens
       riktiga JSON-LD (curl mot hazeyse.nyehandel.se 2026-09-08): I lager,
       595 kr, riktigt betyg 4,69/5 (13 omdömen), varumärke Magic Farmers.
       Valt framför en bud-/hash-variant i samma serie eftersom en enskild
       vape-förpackning ger en renare, mer "kampanjmotiv"-lik produktbild
       (bud-/hash-fotona i denna kategori är gruppbilder av påsar/pulver,
       svårare att låta "bryta gridet" snyggt). Ingen fabricerad rabatt --
       produktens riktiga pris visas rakt av (ingen jämförelsepris/rea just
       nu på denna specifika produkt). */
    var NH_SPOTLIGHT = {
      active: true,
      productHref: "https://hazeyse.nyehandel.se/sv/products/vape-magic-sauce-99-2ml",
      rationale: "En av våra mest populära Magic Sauce-produkter — engångsvape, redo direkt ur förpackningen.",
      secondaryLabel: "Se hela Magic Sauce-sortimentet →",
      secondaryHref: "/sv/categories/magic-sauce"
    };
    function nhSpotlightHtml() {
      if (!NH_SPOTLIGHT.active || !NH_SPOTLIGHT.productHref) return "";
      return '<section class="nh-spotlight section-gap" id="nh-spotlight">'
        + '  <div class="nh-spotlight-inner nh-reveal">'
        + '    <div class="nh-spotlight-media"><div class="nh-spotlight-img nh-reveal-img" id="nhSpotlightImg"></div></div>'
        + '    <div class="nh-spotlight-body">'
        + '      <div class="nh-spotlight-kicker">I rampljuset</div>'
        + '      <p class="nh-spotlight-type" id="nhSpotlightType"></p>'
        + '      <h2 id="nhSpotlightName">Laddar…</h2>'
        + '      <p class="nh-spotlight-rationale">' + NH_SPOTLIGHT.rationale + '</p>'
        + '      <div class="nh-spotlight-meta" id="nhSpotlightMeta"></div>'
        + '      <div class="nh-spotlight-cta">'
        + '        <a class="btn-solid" id="nhSpotlightBuy" href="' + NH_SPOTLIGHT.productHref + '">Visa produkten</a>'
        + (NH_SPOTLIGHT.secondaryHref
            ? '<a class="hero-link nh-spotlight-secondary" href="' + NH_SPOTLIGHT.secondaryHref + '">' + NH_SPOTLIGHT.secondaryLabel + '</a>'
            : '')
        + '      </div>'
        + '    </div>'
        + '  </div>'
        + '</section>';
    }
    function nhInitSpotlight(root) {
      if (!NH_SPOTLIGHT.active || !NH_SPOTLIGHT.productHref) return;
      var section = root.querySelector("#nh-spotlight");
      if (!section) return;
      fetch(NH_SPOTLIGHT.productHref, { credentials: "same-origin" })
        .then(function (r) { return r.ok ? r.text() : ""; })
        .then(function (html) {
          if (!html) throw new Error("no html");
          var doc = new DOMParser().parseFromString(html, "text/html");
          // Sidan skriver ut FLERA ld+json-block (Organization m.fl.) --
          // måste hitta just Product-blocket, inte bara första träffen.
          var scripts = Array.prototype.slice.call(doc.querySelectorAll('script[type="application/ld+json"]'));
          var data = null;
          scripts.some(function (s) {
            try {
              var parsed = JSON.parse(s.textContent);
              if (parsed && parsed["@type"] === "Product") { data = parsed; return true; }
            } catch (e) {}
            return false;
          });
          if (!data) throw new Error("no Product ld+json");
          var img = Array.isArray(data.image) ? data.image[0] : data.image;
          var inStock = /InStock/i.test((data.offers || {}).availability || "");
          // Verklig kategori/typ: härledd ur produktnamnets eget prefix
          // ("Vape - ..." → "Vape") + varumärke -- inget gissat, samma
          // namnkonvention som redan används brett i produktkatalogen.
          var typeMatch = /^([^-–]+)[-–]/.exec(data.name || "");
          var typeLabel = typeMatch ? typeMatch[1].trim() : "";
          var brand = (data.brand && data.brand.name) || "";
          section.querySelector("#nhSpotlightImg").style.backgroundImage = "url('" + img + "')";
          section.querySelector("#nhSpotlightName").textContent = data.name || "";
          section.querySelector("#nhSpotlightType").textContent = [typeLabel, brand].filter(Boolean).join(" · ");
          var rating = data.aggregateRating;
          var ratingHtml = (rating && rating.ratingValue && rating.reviewCount)
            ? '<span class="nh-spotlight-rating">★ ' + Number(rating.ratingValue).toFixed(1).replace(".", ",") + ' <span>(' + rating.reviewCount + ')</span></span>'
            : "";
          section.querySelector("#nhSpotlightMeta").innerHTML = ''
            + '<span class="nh-spotlight-price">' + ((data.offers || {}).price ? data.offers.price + " kr" : "") + '</span>'
            + '<span class="nh-spotlight-stock' + (inStock ? "" : " is-out") + '">' + (inStock ? "I lager" : "Slut i lager") + '</span>'
            + ratingHtml;
        })
        .catch(function () {
          section.hidden = true; // trasig hämtning -- visa aldrig ett halvfärdigt kort
        });
    }

    /* ── "Snabb koll: vad är vad?" ──
       SEO-paritetsrunda 2026-09-08: uppdraget vill uttryckligen se ett
       fast 2×2-grid (THCaB, THCbA, Magic Sauce, Nano-11) plus en separat
       "Läs om THC-X"/"Läs om D10"-rad — INTE längre "visa alla riktiga
       'Vad är X?'-textblock som råkar finnas" (föregående omgångars
       modell, som av samma anledning aldrig kunde visa mer än THCA/Magic
       Sauce, se historik nedan). Eftersom bara Magic Sauce har ett
       riktigt, redan publicerat "Vad är X?"-textblock på sajten (se
       tidigare uttömmande sökning: INGEN sådan text finns för THCaB,
       THCbA eller Nano-11 — THCaB/THCbA existerar inte ens som
       kategori/produkt än) är de tre andra korten byggda med kort, saklig,
       juridiskt försiktig, MEDVETET tunn text (ingen kemi-/legal-
       specificering vi inte kan verifiera) i stället för att fabricera
       fakta. THCA flyttas INTE längre hit (borttaget ur grid:et denna
       omgång) — dess riktiga textblock lämnas därför OBERÖRT/synligt på
       sin ursprungliga plats och ingår i stället i den nya "Guider &
       aktuellt"-sektionen (se nhGuidesHtml). THCNM förblir uteslutet
       (juridiskt pausad, oförändrat sedan tidigare). */
    function nhBuildKunskapCards(navData) {
      // Magic Sauce: enda kortet med riktig, redan publicerad källtext —
      // samma flytta-inte-kopiera-mönster som tidigare (döljer originalets
      // rubrik+stycke så texten inte visas två gånger), men matchar NU
      // bara exakt "Magic Sauce" (inte en generisk "vad är"-scanning som
      // annars också skulle råkat plocka upp THCA/THCNM).
      var magicSauce = null;
      document.querySelectorAll(
        ".store-startpage .template-components__text-editor, .store-startpage .template-components__columns"
      ).forEach(function (block) {
        block.querySelectorAll("h1,h2,h3,h4").forEach(function (h) {
          if (!/^vad är magic sauce/i.test(h.textContent.trim())) return;
          var p = h.nextElementSibling;
          while (p && p.tagName !== "P") p = p.nextElementSibling;
          if (!p) return;
          magicSauce = { title: h.textContent.trim(), text: p.textContent.trim() };
          h.style.display = "none";
          p.style.display = "none";
        });
      });
      var magicSauceHref = nhSerieHref(navData, "Magic Sauce");
      var nano11Href = nhSerieHref(navData, "Nano-11");

      return [
        {
          title: "Vad är THCaB?",
          text: "THCaB tillhör samma familj av cannabinoider som THCA. Vi har ännu inga produkter med THCaB i sortimentet — den här rutan uppdateras så snart det finns riktig information att visa.",
          href: null
        },
        {
          title: "Vad är THCbA?",
          text: "THCbA tillhör samma familj av cannabinoider som THCB. Vi har ännu inga produkter med THCbA i sortimentet — den här rutan uppdateras så snart det finns riktig information att visa.",
          href: null
        },
        magicSauce
          ? { title: magicSauce.title, text: magicSauce.text, href: magicSauceHref }
          : { title: "Vad är Magic Sauce?", text: "Läs mer om Magic Sauce-serien i sortimentet.", href: magicSauceHref },
        {
          title: "Vad är Nano-11?",
          text: "Nano-11 är en av Hazeys egna serier. Se hela sortimentet och produktinformationen på kategorisidan.",
          href: nano11Href
        }
      ];
    }

    /* Den GAMLA flik-sektionen (Bästsäljare/Nyheter/Kampanjer + produktgrid,
       byggd i en tidigare omgång) blir redundant mot de nya
       home-extra-sektionerna ("Bästsäljare i lager" täcker samma behov).
       Döljs (INTE tas bort ur koden) för att undvika att samma produkter
       visas två gånger på samma sida — se Vilmers punkt F, 2026-08-31. */
    function nhHideSupersededTabsSection() {
      var tabs = document.querySelector(".nh-tabs");
      if (!tabs) return;
      var section = tabs.closest(".template-components__html-editor") || tabs.closest("section") || tabs.parentElement;
      if (section) section.style.display = "none";
    }

    /* ── "Guider & aktuellt" ──
       SEO-paritetsrunda 2026-09-08: ersätter den isolerade "THCA med
       flera"-textväggen + den lösa, FRIKOPPLADE "Till Butiken"-knappen
       med EN sammanhängande sektion. Två riktiga, verifierade
       destinationer finns på sajten för detta ämnesområde (uttömmande
       sökt, se historik i nhBuildKunskapCards/tidigare STATUS.md-
       omgångar -- sitemap.xml innehåller INGA /blog//artikel/-URL:er,
       bara statiska /sv/page/*-sidor):
       - THCA-kategorin (/sv/categories/thca, verifierad 200) -- riktig,
         aktiv, laglig kategori med egna produkter.
       - FAQ (/sv/page/faq, verifierad 200, redan länkad från Snabb koll).
       Visar ALLTID bara det antal kort som faktiskt har en verifierad
       destination (uppdragets krav) -- just nu exakt två, ingen tredje
       gissad/fabricerad.

       Den befintliga, redan publicerade SEO-texten ("THCA med flera" +
       "Vad är THCA?") TAS INTE BORT -- den flyttas (DOM-noder, inte en
       kopia) in i en riktig, semantisk <details><summary>, redan i
       initial renderad DOM (ingen klick-krävd fetch). Samma möjlighet
       att läsa den fulla texten kvarstår, bara visuellt kompakterad.
       Native <h1>-taggen i introt ("THCA med flera...") bytes till en
       riktig <h2> under tiden -- ROTORSAK-FYND denna omgång: den
       taggen var (innan denna fix) startsidans ENDA <h1> i den råa,
       icke-JS-körda HTML:en, och blev en ANDRA, dold-bakom-styling
       <h1> så fort vår egen hero-<h1> injicerades ovanpå -- ett äkta,
       verifierat two-H1-problem (curl-verifierat mot hazeyse.nyehandel.se
       2026-09-08), inte gissat. Fixat här eftersom vi ändå bygger om
       exakt detta DOM-område.

       Den separata, FRIKOPPLADE "Till Butiken"-knappen (eget
       `.template-components__html-editor`-block, href="/bestsellers")
       verifierades dessutom vara en TRASIG länk (curl → 404) -- döljs
       (INTE tas bort ur DOM:en) eftersom dess funktion (väg till
       sortimentet) redan täcks av de nya, riktiga korten ovan. */
    function nhGuidesHtml(navData) {
      var thcaHref = (navData.bySlug && navData.bySlug["thca"]) || "/sv/categories/thca";
      // Creative-direction-runda 2026-09-08: variera kortens visuella
      // tyngd (uppdragets krav) i stället för två identiska vita textkort.
      // THCA-kortet får en RIKTIG, live-hämtad produktbild (samma beprövade
      // fetch-mönster som Populära serier/vägar tidigare använde) --
      // "photo"-varianten. FAQ-kortet har inget naturligt produktfoto att
      // visa (det är en supportdestination, inte ett sortiment) och får i
      // stället en mörk, ikonburen "dark"-variant -- olika TYNGD, ingen
      // fabricerad bild.
      var cards = [
        { tag: "Kategori", title: "THCA", text: "Bläddra hela vårt THCA-sortiment — vapes, buds och information om vad som gäller i Sverige.", cta: "Till THCA-sortimentet →", href: thcaHref, variant: "photo", photoHref: thcaHref },
        { tag: "Support", title: "Vanliga frågor", text: "Svar på det som frågas mest om beställning, leverans och lagstatus.", cta: "Till FAQ:n →", href: "/sv/page/faq", variant: "dark" }
      ];
      return '<section class="nh-guides section-gap" id="nh-guides">'
        + '  <div class="sec-head"><div><h2>Guider &amp; aktuellt</h2>'
        + '  <p>Läs mer innan du handlar — samlat på ett ställe.</p></div></div>'
        + '  <div class="nh-guides-grid">'
        + cards.map(function (c) {
            var photoAttrs = c.variant === "photo" ? ' data-photo-href="' + c.photoHref + '"' : "";
            var iconHtml = c.variant === "dark"
              ? '<span class="nh-guide-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 0 1 4.6-1.35c.4.6.4 1.4 0 2A2.5 2.5 0 0 1 12 12v1"/><circle cx="12" cy="16.3" r=".1" fill="currentColor" stroke-width="1.5"/></svg></span>'
              : '';
            return '<a class="nh-guide-card nh-guide-card--' + c.variant + ' nh-reveal" href="' + c.href + '"' + photoAttrs + '>'
              + (c.variant === "photo" ? '<span class="nh-guide-photo nh-reveal-img"></span>' : '')
              + iconHtml
              + '<span class="nh-guide-tag">' + c.tag + '</span>'
              + '<h3>' + c.title + '</h3>'
              + '<p>' + c.text + '</p>'
              + '<span class="nh-guide-cta">' + c.cta + '</span>'
              + '</a>';
          }).join("")
        + '  </div>'
        + '  <details class="nh-guide-legacy" id="nhGuideLegacy">'
        + '    <summary>Mer om vårt sortiment</summary>'
        + '    <div class="nh-guide-legacy-body" id="nhGuideLegacyBody"></div>'
        + '  </details>'
        + '</section>';
    }
    function nhInitGuides() {
      var legacyBody = document.getElementById("nhGuideLegacyBody");
      if (!legacyBody || legacyBody.__nhDone) return;
      legacyBody.__nhDone = true;

      // 1) Introt ("THCA med flera...") -- fixar H1→H2 INNAN noden flyttas.
      var introBlock = document.querySelector(".store-startpage .et_pb_text_10")
        ? document.querySelector(".store-startpage .et_pb_text_10").closest(".template-components__text-editor")
        : null;
      if (introBlock) {
        var h1 = introBlock.querySelector("h1");
        if (h1) {
          var h2 = document.createElement("h2");
          h2.innerHTML = h1.innerHTML;
          h1.parentNode.replaceChild(h2, h1);
        }
        while (introBlock.firstChild) legacyBody.appendChild(introBlock.firstChild);
        introBlock.style.display = "none";
      }

      // 2) "Vad är THCA?" (rubrik+stycke) -- ROTORSAK-FYND denna omgång:
      // THCA/THCNM/Magic Sauce ligger som TRE h3+p-par EFTER VARANDRA
      // inuti SAMMA native "#test"-columns-block (component-47 = text,
      // component-46 = fabriksbilden) -- alltså exakt det block som
      // `.template-components__columns:has(#test){display:none!important}`
      // redan döljer HELT (se css/18-mobil-pass-...). Magic Sauce-texten
      // har alltid kunnat läsas ändå (textContent fungerar oavsett CSS-
      // display, se nhBuildKunskapCards), men en tidigare version av den
      // HÄR funktionen hoppade uttryckligen över just detta block när den
      // letade efter THCA (fel antagande att THCA/THCNM låg i separata
      // block) -- THCA:s text blev därför ALDRIG flyttad, bara kvar dold.
      // Fix: sök efter RUBRIKEN specifikt (inte hela blocket), flytta BARA
      // den + dess stycke -- THCNM:s eget par, "Alla artiklar"-knappen och
      // fabriksbilden i samma block lämnas HELT orörda och förblir dolda
      // (juridiskt pausad cannabinoid, oförändrat).
      var thcaHeading = Array.prototype.slice
        .call(document.querySelectorAll(".store-startpage h1,.store-startpage h2,.store-startpage h3,.store-startpage h4"))
        .filter(function (h) { return /^vad är thca\b/i.test(h.textContent.trim()); })[0];
      if (thcaHeading) {
        var thcaP = thcaHeading.nextElementSibling;
        while (thcaP && thcaP.tagName !== "P") thcaP = thcaP.nextElementSibling;
        legacyBody.appendChild(thcaHeading);
        if (thcaP) legacyBody.appendChild(thcaP);
      }

      // 3) Den trasiga, frikopplade "Till Butiken"-knappen (href="/bestsellers",
      // verifierad 404) -- döljs, ersätts funktionellt av korten ovan.
      var brokenBtn = document.querySelector('.store-startpage .nh-btn-bar__btn[href="/bestsellers"]');
      var brokenBar = brokenBtn ? brokenBtn.closest(".nh-btn-bar") : null;
      var brokenBlock = brokenBar ? (brokenBar.closest(".template-components__html-editor") || brokenBar.parentElement) : null;
      if (brokenBlock) brokenBlock.style.display = "none";
      // Bonusfynd (curl-verifierat 2026-09-08): länken pekade mot
      // "/bestsellers", som ger 404 -- en riktig, redan existerande bugg
      // i det native innehållet, inte orsakad av oss. Hela blocket döljs
      // ovan (dess funktion täcks nu av korten ovanför), men elementet
      // ligger KVAR i DOM:en (hidden är aldrig detsamma som borttagen) --
      // en dold `<a>` är fortfarande crawlbar, så vi rättar hrefen till en
      // riktig, fungerande destination i stället för att lämna en trasig
      // länk liggande för en eventuell crawler att hitta.
      if (brokenBtn) brokenBtn.setAttribute("href", "/sv/categories/alla-produkter");

      // 4) THCA-guidekortets riktiga produktbild -- samma beprövade
      // live-fetch-mönster som redan användes för Populära serier/vägar
      // innan de fick statiska tillgångar (fetch riktig kategorisida,
      // plocka FÖRSTA riktiga produktbilden). Progressiv förbättring:
      // kortet fungerar och är klickbart innan bilden hunnit laddas.
      var photoCard = document.querySelector(".nh-guide-card[data-photo-href]");
      if (photoCard) {
        fetch(photoCard.getAttribute("data-photo-href"), { credentials: "same-origin" })
          .then(function (r) { return r.ok ? r.text() : ""; })
          .then(function (html) {
            if (!html) return;
            var doc = new DOMParser().parseFromString(html, "text/html");
            var img = doc.querySelector(".product-card__image img");
            var src = img ? (img.getAttribute("src") || img.getAttribute("data-src")) : null;
            if (!src) return;
            var photoEl = photoCard.querySelector(".nh-guide-photo");
            if (photoEl) photoEl.style.backgroundImage = "url('" + src + "')";
          })
          .catch(function () {}); // ingen bild -- kortet fungerar ändå, bara utan foto
      }
    }
    // "Läs om THC-X"/"Läs om D10" — sekundär rad UNDER 2×2-grid:et.
    // THC-X: samma verifierade riktiga produktsida som Populära serier-
    // kortet (nhPopularaSerierHtml) länkar till — enda riktiga
    // destinationen, ingen ny gissad. D10: ingen riktig destination finns
    // ännu (samma verifierade databegränsning som Populära serier-kortet),
    // renderas icke-klickbart, samma mönster som där.
    var NH_KUNSKAP_MORE = [
      { title: "Läs om THC-X", href: "/sv/products/vape-thcx-19-core-2ml" },
      { title: "Läs om D10", href: null }
    ];
    function nhKunskapHtml(cards) {
      if (!cards.length) return "";
      return '<section class="nh-kunskap section-gap">'
        + '  <div class="guide guide-dark">'
        + '    <div class="guide-top"><h2>Snabb koll: vad är vad?</h2>'
        + '    <span class="skip"><a href="/sv/page/faq">Hela FAQ:n →</a></span></div>'
        // Facit-kalibrering 2026-09-06: exakt facit-text (index.html rad
        // 4594) -- nämner uttryckligen aktuell laglighet, vilket stämmer
        // för våra egna kort (THCA/Magic Sauce handlar båda om just det).
        + '    <p class="lede">Korta förklaringar av det som frågas mest om — och vad som är lagligt i Sverige just nu. Vi beskriver innehåll och framställning, aldrig hur en produkt känns att använda.</p>'
        + '    <div class="guide-grid">'
        + cards.map(function (c) {
            // Riktig länk om ett verkligt mål finns -- annars ett rent
            // informativt kort utan `href="#"`, se uppdragets krav. Ingen
            // kort-fabricerad länk.
            var tag = c.href ? "a" : "div";
            var hrefAttr = c.href ? ' href="' + c.href + '"' : ' aria-disabled="true"';
            // g-name som riktig <h3> (2026-09-07, SEO-krav: "riktiga
            // semantiska rubriker") i stället för en <span> -- underrubrik
            // till sektionens <h2>. Ren tag-ändring, .g-name-CSS:en är
            // redan taggnautral (klass-baserad), ingen visuell ändring.
            var cls = "g-card nh-reveal" + (c.href ? "" : " g-card--soon");
            return '<' + tag + ' class="' + cls + '"' + hrefAttr + '><h3 class="g-name">' + c.title + '</h3><p>' + c.text + '</p></' + tag + '>';
          }).join("")
        + '    </div>'
        + '    <div class="guide-more">'
        + NH_KUNSKAP_MORE.map(function (m) {
            var tag = m.href ? "a" : "div";
            var hrefAttr = m.href ? ' href="' + m.href + '"' : ' aria-disabled="true"';
            var cls = "guide-more-link" + (m.href ? "" : " guide-more-link--soon");
            return '<' + tag + ' class="' + cls + '"' + hrefAttr + '>' + m.title + ' →</' + tag + '>';
          }).join("")
        + '    </div>'
        + '  </div>'
        + '</section>';
    }

    /* ── "Verifierade omdömen" — ENDAST det riktiga Trustpilot-betyget
       + en ärlig länk, aldrig påhittade citat.

       Datagranskning 2026-09-07 (se STATUS.md, Paket 4 — löser den
       tidigare öppna business-unit-id-frågan):
       1. Head-fältets redan LIVE widget (verifierat direkt mot
          hazeyse.nyehandel.se utan ?preview=, nätverksanrop inspekterade)
          använder templateId "53aa8807dec7e10d38f59f32" (Trustpilots
          "Mini"-mall: stjärnor + TrustScore, INGA citat) med
          businessunitId "6479dc28f0b041b3c79af588" — DETTA är alltså det
          bekräftat RIKTIGA, aktiva business-unit-id:t. Det andra id:t som
          fanns i `blocks/testimonials-section.html`
          ("6513e1a93f98d9001a6cb9b0") är INTE live någonstans — troligen
          en kvarleva/felaktig kopia, aldrig inklistrad. Rör inte den
          dormanta blockfilen (utanför uppdragets scope), men frågan är
          nu besvarad här.
       2. Testat en officiell "Review Carousel"-TrustBox (mallen som
          faktiskt visar enskilda citat, templateId
          "54ad5defc6454f065c28af8b") mot SAMMA riktiga business-unit-id
          — Trustpilots egna publika data-endpoint svarar uttryckligen
          `{"Error":["BusinessUnit does not have access to that
          trustbox"]}`. Alltså: Hazeys nuvarande Trustpilot-plan har INTE
          tillgång till citat-widgeten, oavsett hur den stylas.
       3. Samma endpoint för den redan aktiva Mini-mallen visar dessutom
          `"settings":{"customStylesAllowed":false,"syndicationEnabled":
          false}` — syndikering (en förutsättning för att bygga egna,
          1:1-stylade kort ur riktig recensionstext) är uttryckligen
          AVSTÄNGD på kontot.
       4. Ingen Trustpilot-API-nyckel finns någonstans i det här repot
          (sökt igenom hela `js/`/`blocks/`/`.github/`) och min GitHub-
          token saknar behörighet att lista Actions-secrets (403) — kunde
          alltså inte bekräfta ELLER utesluta en redan sparad secret,
          men ingen kod refererar en, så pipelinen skulle ändå inte gå
          att koppla in utan att Vilmer själv bekräftar/skapar en.

       SLUTSATS: bygg INTE en 3-kort-pipeline med riktiga citat — varken
       Review-Carousel-TrustBoxen (kontot saknar åtkomst, bekräftat via
       Trustpilots egen API, inte gissat) eller en egen GitHub Actions-
       hämtning (ingen API-nyckel finns). Vad Vilmer behöver skaffa för
       att detta ska bli möjligt: antingen (a) uppgradera Trustpilot-
       planen så Review-Carousel-TrustBoxen blir tillgänglig (enklast,
       ingen kod behöver ändras — bara byta template-id), eller (b) en
       Trustpilot Business/Content-API-nyckel + aktiverad syndikering,
       sparad som en GitHub-secret (t.ex. `TRUSTPILOT_API_KEY`) för en
       daglig GitHub Actions-hämtning enligt uppdragets föredragna
       arkitektur.

       Vad som ÄR verkligt och dynamiskt: Trustpilots egen publika,
       CORS-öppna (`Access-Control-Allow-Origin: *`) data-endpoint för
       den redan aktiva Mini-mallen returnerar riktigt, LIVE
       `trustScore`+`numberOfReviews.total` — samma siffror widgeten
       själv visar, ingen autentisering krävs, ingen hemlighet
       exponeras. Hämtas klientsidan (nhInitReviewsLive nedan) och
       ersätter den statiska "4,7/5"-texten med det verkliga, aktuella
       betyget+antalet omdömen — uppdateras automatiskt vid varje
       sidladdning utan ny kodpush. Om hämtningen misslyckas (nätverk/
       CORS-ändring/rate-limit) behålls den redan sanna statiska texten
       oförändrad som fallback — ingen bruten funktion, bara en icke-
       uppdaterad men fortfarande korrekt siffra. ── */
    var NH_TRUSTPILOT_BUSINESS_UNIT_ID = "6479dc28f0b041b3c79af588";
    var NH_TRUSTPILOT_TEMPLATE_ID = "53aa8807dec7e10d38f59f32";
    /* ── Riktiga produktomdömen (2026-09-07, större homepage-runda) ──
       Datagranskning: Nyehandels egna PDP:er exponerar RIKTIGA, publika
       kundomdömen (#product-reviews, namn + relativt datum + citat +
       stjärnbredd i %) -- verifierat på flera riktiga produkter. Detta
       är data-prioritetsstegets steg 2 ("riktiga produktrecensioner om
       de exponeras publikt i Nyehandel"), som gör att vi INTE behöver
       falla tillbaka på steg 3 (bara betyg+CTA) för hela sektionen.

       VIKTIG BEGRÄNSNING, upptäckt under research, INTE en gissning:
       riktiga kundomdömen på faktiska cannabinoid-produkter (buds/hash)
       innehåller regelbundet uttryckliga rus-/effektbeskrivningar
       ("blir go", "helstekt", "munchies, skratt", "potent", "dosera") --
       exakt det CLAUDE.md:s varumärkesröst-regel förbjuder att lyfta
       fram, oavsett att det är en riktig kunds egna ord. Källorna här är
       därför MEDVETET begränsade till hårdvaru-/tillbehörsprodukter
       (vape-batterier), vars riktiga recensioner rimligen handlar om
       produktkvalitet, inte upplevelsen av att använda en cannabinoid --
       INTE fabricerat, men en medveten avgränsning av VILKA riktiga
       produkter som får vara källa. Det betyder att "variation mellan
       relevanta produktkategorier" (uppdragets önskemål) inte kan
       uppfyllas säkert med riktig recensionstext just nu -- flaggat i
       slutrapporten som en genuin innehållsbegränsning, inte en kodlucka.
       Ett sekundärt, defensivt textfilter (NH_REVIEW_UNSAFE_RE nedan)
       skyddar ändå mot en framtida ny recension på samma produkter som
       råkar innehålla rus-/effektspråk. "Verifierad köpare" visas INTE --
       den riktiga datan innehåller ingen sådan markör. */
    var NH_REVIEW_PRODUCTS = [
      { href: "https://hazeyse.nyehandel.se/sv/products/ccell-m4-vape-batteri-510", name: "CCELL M4 – Vape Batteri – 510" },
      { href: "https://hazeyse.nyehandel.se/sv/products/ccell-m3-plus-vape-batteri-510", name: "CCELL M3 Plus – Vape Batteri – 510" }
    ];
    var NH_REVIEW_UNSAFE_RE = /\brus\b|hög(?!re|sta)|skratt|munchies|kick|stoned|helstekt|påverkan|lugnande|avslappnande|smygande|potent|dosera|\bdos\b|sömnfrämjande|ångest|amnezia|minnesförlust|rök(?!else)|bäng|höjd(?!punkt)/i;

    function nhReviewsHtml() {
      return '<section class="nh-reviews section-gap">'
        + '  <div class="sec-head"><div><h2>Verifierade omdömen</h2>'
        + '  <p>Endast kunder som köpt produkten kan lämna ett omdöme på Trustpilot.</p></div></div>'
        + '  <a class="nh-reviews-cta nh-reveal" href="https://www.trustpilot.com/review/hazey.se" target="_blank" rel="noopener">'
        + '    <span class="stars">★★★★★</span><span id="nhReviewsCtaText">4,7/5 på Trustpilot — läs alla omdömen →</span>'
        + '  </a>'
        + '  <div class="nh-reviews-grid" id="nhReviewsGrid" hidden data-status="ingen-verifierad-recensionskalla-an"></div>'
        + '</section>';
    }
    function nhInitProductReviews(root) {
      var grid = root.querySelector("#nhReviewsGrid");
      if (!grid) return;
      // Rotorsak (2026-09-07): #product-reviews-listan (li>h4+p) finns
      // BARA i den klientsidesrenderade DOM:en, inte i den råa HTML:en --
      // en vanlig fetch()+DOMParser (som redan används för Populära vägar/
      // serier/Bästsäljare) hittar därför 0 element här. De RIKTIGA
      // recensionerna ligger däremot redan i den råa HTML:en, som ett
      // HTML-entitetskodat JSON-attribut på Vue-komponenten som senare
      // hydrerar listan (`:reviews="[{&quot;name&quot;:...}]"`) --
      // verifierat via `curl` mot en riktig produktsida. Extraherat med
      // regex + en <textarea>-baserad entitetsavkodning (etablerad,
      // pålitlig teknik, inget bibliotek behövs) + JSON.parse, i stället
      // för DOMParser. `rating` kommer som ett rent numeriskt fält
      // (1-5) i den här datan, inget %-bredd-antagande behövs.
      function decodeEntities(s) {
        var ta = document.createElement("textarea");
        ta.innerHTML = s;
        return ta.value;
      }
      Promise.all(NH_REVIEW_PRODUCTS.map(function (p) {
        return fetch(p.href, { credentials: "same-origin" })
          .then(function (r) { return r.ok ? r.text() : ""; })
          .then(function (html) {
            if (!html) return null;
            var m = html.match(/:reviews="(\[.*?\])"/);
            if (!m) return null;
            var list;
            try { list = JSON.parse(decodeEntities(m[1])); } catch (e) { return null; }
            var pick = list.filter(function (r) {
              return !r.anonymous && r.review && r.review.length >= 12 && r.review.length <= 170
                && !NH_REVIEW_UNSAFE_RE.test(r.review);
            });
            if (!pick.length) return null;
            var r = pick[0];
            return { name: r.name, text: r.review, stars: r.rating, product: p.name, href: p.href };
          })
          .catch(function () { return null; });
      })).then(function (results) {
        var real = results.filter(Boolean);
        if (!real.length) return; // ingen ändring -- grid förblir dold, Trustpilot-raden ovan är redan sann
        // Medvetet INGEN .nh-reveal-klass här (samma beslut som redan
        // gäller Bästsäljare-korten, nhInitBestsellers): nhInitReveal
        // skannar bara EN gång vid boot, långt innan dessa asynkront
        // hämtade kort finns i DOM:en -- ett .nh-reveal-kort som aldrig
        // observeras stannar permanent osynligt (upptäckt och fixat
        // direkt, se STATUS.md).
        grid.innerHTML = real.map(function (r) {
          var starsHtml = '<span class="nh-rc-stars" aria-hidden="true">' + "★".repeat(r.stars) + "☆".repeat(5 - r.stars) + '</span>';
          return '<div class="nh-rc-card">'
            + starsHtml
            + '<p class="nh-rc-quote">”' + r.text.replace(/</g, "&lt;") + '”</p>'
            + '<div class="nh-rc-source"><span class="nh-rc-name">' + r.name.replace(/</g, "&lt;") + '</span>'
            + '<a href="' + r.href + '">' + r.product + '</a></div>'
            + '</div>';
        }).join("");
        grid.hidden = false;
      });
    }
    /* Hämtar det RIKTIGA, live TrustScore + antal omdömen från Trustpilots
       egen publika data-endpoint (samma som deras bootstrap-widget redan
       anropar) — ingen nyckel, inget konto, ingen scraping av HTML. Vid
       fel/oväntat svar rörs texten INTE (den redan sanna statiska raden
       ligger kvar som fallback). */
    function nhInitReviewsLive(root) {
      var textEl = root.querySelector("#nhReviewsCtaText");
      if (!textEl) return;
      var url = "https://widget.trustpilot.com/trustbox-data/" + NH_TRUSTPILOT_TEMPLATE_ID
        + "?businessUnitId=" + NH_TRUSTPILOT_BUSINESS_UNIT_ID + "&locale=sv-SE";
      fetch(url)
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          var bu = data && data.businessUnit;
          var total = bu && bu.numberOfReviews && bu.numberOfReviews.total;
          if (!bu || !bu.trustScore || !total) return; // oväntat svar — behåll den sanna fallback-texten
          var score = String(bu.trustScore).replace(".", ",");
          textEl.textContent = score + "/5 på Trustpilot · " + total.toLocaleString("sv-SE") + " omdömen — läs alla →";
        })
        .catch(function () { /* nätverksfel — den redan sanna statiska texten ligger kvar oförändrad */ });
    }

    /* ── Nyhetsbrev, mitt på sidan (prototypen har ett HÄR + ett i
       footern, den senare utanför detta uppdrags scope — rörs inte).

       Datagranskning 2026-09-07 (se STATUS.md, Paket 4): letat igenom
       hela repot (js/blocks) och den riktiga sajten (kontosidor,
       registrering, `/sv/newsletter`) efter en riktig, redan kopplad
       nyhetsbrevsintegration — varken en Nyehandel-nativ prenumerations-
       endpoint eller ett externt e-postverktyg (Klaviyo/Mailchimp/
       liknande) hittades NÅGONSTANS. Detta bekräftar det Vilmer redan
       konstaterade 2026-08-31 ("inget verktyg kopplat än") — INGEN ny
       upptäckt, bara omverifierad.

       Eftersom ingen riktig backend finns förblir formuläret ÄRLIGT
       klassificerat som ej aktivt: förhindrar ALDRIG att knappen ser
       tryckbar ut och LÅTSAS ALDRIG att en prenumeration lyckades (ingen
       fabricerad "tack"-text, ingen rabattkod, ingen simulerad
       registrering) — i stället visas ett tydligt, sant statusmeddelande
       (aria-live, så skärmläsare hör det) om att nyhetsbrevet inte är
       aktivt än. Riktig HTML5-e-postvalidering (`type="email" required`)
       körs ändå på riktigt av webbläsaren innan statusmeddelandet visas.
       E-postadressen loggas ALDRIG (ingen console.log/nätverksanrop).

       Vad Vilmer behöver skaffa för att aktivera detta: ett riktigt
       e-postverktyg (t.ex. Klaviyo/Mailchimp/Brevo) med ett publikt
       prenumerations-API eller inbäddat formulär, ELLER bekräfta att
       Nyehandel har en nativ nyhetsbrevs-endpoint jag inte hittat --
       sedan kopplas formuläret om till en riktig `fetch()`/POST med ett
       verkligt success/error-svar. ── */
    function nhNewsletterHtml() {
      return '<section class="nh-signup section-gap">'
        + '  <div class="nh-signup-block">'
        + '    <div><h2>Håll dig uppdaterad</h2>'
        + '    <p>Lagerpåfyllning, nya serier och viktiga juridiska uppdateringar — inget annat.</p></div>'
        + '    <form class="nh-signup-form" data-nh-inactive-form="1">'
        + '      <input type="email" placeholder="Din e-postadress" aria-label="E-postadress" required>'
        + '      <button type="submit">Prenumerera</button>'
        + '    </form>'
        + '    <span class="nh-signup-status" aria-live="polite"></span>'
        + '    <span class="nh-signup-note">Du kan avsluta prenumerationen när du vill.</span>'
        + '  </div>'
        + '</section>';
    }
    /* Formulär som ÄRLIGT saknar en riktig backend (se kommentaren ovan
       nhNewsletterHtml). Kör riktig HTML5-validering (`form.checkValidity()`,
       samma mekanism webbläsaren redan skulle använt vid en normal submit),
       men LÅTSAS aldrig lyckas — visar i stället ett sant "inte aktivt
       än"-meddelande. Ingen e-postadress loggas eller skickas någonstans. */
    function nhInitInactiveForms(root) {
      root.querySelectorAll("[data-nh-inactive-form]").forEach(function (f) {
        var status = f.parentNode.querySelector(".nh-signup-status");
        f.addEventListener("submit", function (e) {
          e.preventDefault();
          if (!f.checkValidity()) { f.reportValidity(); return; }
          if (status) status.textContent = "Nyhetsbrevet går inte att prenumerera på ännu — mejla oss på hej@hazey.se så lägger vi till dig.";
          var btn = f.querySelector("button");
          if (btn) btn.disabled = true;
        });
      });
    }

    // Reveal-on-scroll (se css/22-homepage-v2.css .nh-reveal) — lägger bara
    // till/tar bort en klass, ingen layoutlogik.
    //
    // BUGGFIX 2026-08-31: stort rootMargin (element räknas som "synligt" långt
    // innan det faktiskt är i vy) + en hård tidsgräns som tvingar fram ALLT
    // dolt innehåll oavsett, efter 2 sekunder. Orsak: verifierat att
    // sidfulls-skärmdumpsverktyg (Chromes "Capture full size screenshot",
    // Playwrights fullPage-screenshot) inte alltid hinner trigga
    // IntersectionObserver innan bilden tas.
    function nhInitReveal(root) {
      var els = root.querySelectorAll(".nh-reveal, .nh-reveal-img");
      if (!els.length) return;
      function revealAll() {
        els.forEach(function (el) { el.classList.add("is-in"); });
      }
      if (!("IntersectionObserver" in window)) { revealAll(); return; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0, rootMargin: "600px 0px 600px 0px" });
      els.forEach(function (el) { io.observe(el); });
      setTimeout(revealAll, 2000);
    }

    function initHomepageV2() {
      var slideRoot = document.querySelector(".template-components__slideshow");
      var slideshow = slideRoot ? slideRoot.querySelector(".slideshow") : null;
      if (!slideshow || slideshow.__nhHomepageV2) return; // ingen hero-slideshow på den här sidan = inte startsidan
      slideshow.__nhHomepageV2 = true;

      var mega = document.querySelector("#store-header nav.navbar .navbar-item.has-dropdown.is-mega");
      if (!mega) return;
      var navData = nhBuildNavData(mega);
      var kampanjerHref = "/sv/page/kampanjer";

      // Döljer den nativa karusellen (rör den inte, bara CSS display:none)
      // och ersätter med det nya, konfigurationsdrivna hero-kortet.
      slideRoot.classList.add("nh-native-hero-hidden");

      var heroWrap = document.createElement("div");
      heroWrap.innerHTML = nhHeroHtml(navData, kampanjerHref);
      slideRoot.parentNode.insertBefore(heroWrap, slideRoot);
      while (heroWrap.firstChild) slideRoot.parentNode.insertBefore(heroWrap.firstChild, slideRoot);
      heroWrap.remove();

      // "Populära serier"/"Populära vägar" byts i INBÖRDES ORDNING mellan
      // mobil (serier→vägar) och desktop (vägar→serier) — uppmätt, se
      // STATUS.md. Kräver en flex-wrapper för att CSS `order` ska funka.
      var flexWrap = document.createElement("div");
      flexWrap.className = "nh-startpage-flex";
      flexWrap.innerHTML = nhPopularaSerierHtml(navData) + nhPopularaVagarHtml(navData);

      // Övriga home-extra-sektioner. Ordning uppdaterad 2026-09-08
      // (SEO-paritetsrunda, uppdragets egen prioritetslista): bästsäljare
      // → trust-block/"transparens" → kunskap ("Snabb koll") → NY
      // "Guider & aktuellt" (ersätter den gamla, isolerade THCA-väggens
      // position långt nere vid FAQ — dess DOM-noder flyttas hit av
      // nhInitGuides, se den funktionens kommentar) → omdömen →
      // nyhetsbrev.
      var kunskapCards = nhBuildKunskapCards(navData);
      var restWrap = document.createElement("div");
      restWrap.innerHTML = ''
        + '<section class="nh-aura-guide" id="aura-guiden" hidden data-status="juridik-ej-klar"></section>'
        + nhContinueShellHtml()
        + nhBestsellersHtml()
        + nhSpotlightHtml()
        + nhTrustBlockHtml()
        + nhKunskapHtml(kunskapCards)
        + nhGuidesHtml(navData)
        + nhReviewsHtml()
        + nhNewsletterHtml();

      var anchor = slideRoot.nextSibling;
      slideRoot.parentNode.insertBefore(flexWrap, anchor);
      while (restWrap.firstChild) slideRoot.parentNode.insertBefore(restWrap.firstChild, anchor);

      nhInitReveal(document);
      nhInitHeroCarousel(document);
      nhEnhanceWithRealPhotos(document);
      nhInitBestsellers(document);
      nhInitSpotlight(document);
      nhInitReviewsLive(document);
      nhInitProductReviews(document);
      nhInitInactiveForms(document);
      nhHideSupersededTabsSection();
      nhInitGuides();
    }
