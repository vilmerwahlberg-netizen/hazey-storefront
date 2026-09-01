
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
       (hero-westcoast-v4.jpg) finns bara lokalt på disk
       (tests/parity-sections.mjs PROTO_ASSETS_DIR) och används redan för
       PIXELEXAKT QA via `lockImplImages`/LOCKED_IMAGES — den läser filen
       direkt från disk och inline:ar den som en data:-URL EFTER sidladdning,
       oberoende av vad denna funktion sätter som src. QA-mekanismen kräver
       alltså INGEN nätverks-URL alls, bara att `data-hero-src` finns som
       hook (behålls nedan). Produktionskällan är därför den RIKTIGA,
       redan konfigurerade nyehandel-bilden (`nativeHeroImgUrl`, plockad ur
       den nativa karusellens första slide) direkt — ingen
       localhost-URL någonsin i den byggda `hazey.min.js`, ingen
       ladda-och-fall-tillbaka-komplexitet. `hero-westcoast-v4.jpg` är
       filen som behöver stabil, riktig HTTPS-hosting den dag Vilmer vill
       ha facitens EGEN bild (inte bara den nativa) live i produktion —
       inte beslutat/löst här, bara dokumenterat. */
    function nhHeroQfindHtml(navData, kampanjerHref, nativeHeroImgUrl) {
      var vapeHref = nhFirstHref(navData.groups.vape, "alla-vapes") || "/sv/categories/alla-vapes";
      var blommaHref = nhFirstHref(navData.groups.blomma, "blommor-buds") || "/sv/categories/blommor-buds";
      var hashHref = nhFirstHref(navData.groups.hash, "hasch") || "/sv/categories/hasch";
      var cbdEntry = navData.footerLinks.filter(function (it) { return it.slug === "cbd-group"; })[0];
      var cbdHref = cbdEntry ? cbdEntry.href : "/sv/categories/cbd-group";

      // data-hero-src: bara en QA-selektorkrok för lockImplImages (se
      // ovan) — värdet spelar ingen roll för testresultatet, bara att
      // attributet finns. Sätts till samma URL som faktiskt visas.
      var bg = nativeHeroImgUrl
        ? ' style="background-image:url(\'' + nativeHeroImgUrl.replace(/'/g, "\\'") + '\')" data-hero-src="' + nativeHeroImgUrl.replace(/"/g, "&quot;") + '"'
        : ' data-hero-src=""';

      return '<section class="nh-hero-v2 nh-qfind-hero"' + bg + '>'
        + '  <div class="nh-hero-v2__inner">'
        // Två olika eyebrow-texter per breddpunkt (uppmätt ur facit — INTE
        // samma text skalad): mVp = "Brett sortiment · öppen information";
        // dVp behåller den tidigare, av Vilmer bekräftade "störst i Sverige"-
        // texten (2026-08-31: "vi är ju störst i Sverige och bredast utbud"),
        // men visas nu BARA på desktop i stället för universellt.
        + '    <div class="nh-hero-v2__eyebrow nh-hero-v2__eyebrow--mobile">Brett sortiment · öppen information</div>'
        + '    <div class="nh-hero-v2__eyebrow nh-hero-v2__eyebrow--desktop">Sveriges bredaste cannabinoidsortiment</div>'
        + '    <h1>Hitta rätt utan att kunna allt.</h1>'
        // Två olika underrubriker per breddpunkt (uppmätt, INTE samma text
        // skalad) — togglas med CSS, se .nh-hero-v2__p--mobile/desktop.
        + '    <p class="nh-hero-v2__p--mobile">Sök direkt eller jämför på innehåll, format och framställning.</p>'
        + '    <p class="nh-hero-v2__p--desktop">Sök direkt, eller jämför produkter på innehåll, framställning och publicerat analyscertifikat.</p>'
        // Kategori-genvägsraden finns BARA på desktop i rätt fil (dVp),
        // inte i mVp — döljs på mobil via CSS.
        + '    <div class="nh-hero-v2__cats">'
        + '      <a href="' + vapeHref + '">Vapes &amp; carts</a>'
        + '      <a href="' + blommaHref + '">Blommor</a>'
        + '      <a href="' + hashHref + '">Hash</a>'
        + '      <a href="' + cbdHref + '">CBD, CBG &amp; CBN</a>'
        + '      <a href="' + kampanjerHref + '">Kampanjer</a>'
        + '    </div>'
        + '    <div class="nh-hero-v2__cta">'
        + '      <a class="btn-solid" href="#populara-vagar">Utforska sortimentet</a>'
        + '      <button type="button" class="hero-link" data-open-hr="1"><span class="nh-hero-v2__btn--mobile">Hjälp mig →</span><span class="nh-hero-v2__btn--desktop">Hjälp mig hitta rätt →</span></button>'
        + '    </div>'
        + '  </div>'
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

    /* ── "Populära serier" ── */
    function nhPopularaSerierHtml(navData) {
      var seen = {};
      var series = [];
      ["vape", "blomma", "hash"].forEach(function (g) {
        var group = navData.groups[g];
        Object.keys(group.series).forEach(function (name) {
          if (seen[name]) return;
          seen[name] = true;
          series.push({ label: name, href: group.series[name] });
        });
      });
      if (!series.length) return "";
      return '<section class="nh-pser section-gap" id="populara-serier">'
        + '  <div class="sec-head"><h2>Populära serier</h2></div>'
        + '  <div class="pser-row">'
        + series.map(function (s) {
            return '<a class="pser-item nh-reveal" href="' + s.href + '" data-count-href="' + s.href + '">'
              + '<span class="pser-avatar" data-photo-href="' + s.href + '">' + NH_ROUTE_ICONS.serie + '</span>'
              + '<span class="pser-name">' + s.label + '</span>'
              + '<span class="pser-n"></span></a>';
          }).join("")
        + '  </div>'
        + '</section>';
    }

    /* Hämtar en riktig kategori-/serie-sida och plockar ut FÖRSTA riktiga
       produktbilden — samma beprövade mönster som js/10-product-sections.js.
       Progressiv förbättring: ikon visas direkt, byts tyst mot äkta foto.
       Samma fetch återanvänds för att räkna fram RIKTIGT produktantal till
       ".pser-n" (inga hårdkodade mocktal) — en serie utan produkter döljs. */
    function nhEnhanceWithRealPhotos(root) {
      var targets = root.querySelectorAll("[data-photo-href]");
      var countTargets = root.querySelectorAll("[data-count-href]");
      if (!targets.length && !countTargets.length) return;
      var cache = {};
      function fetchPage(href) {
        if (cache[href]) return cache[href];
        cache[href] = fetch(href, { credentials: "same-origin" })
          .then(function (r) { return r.ok ? r.text() : ""; })
          .then(function (html) { return html ? new DOMParser().parseFromString(html, "text/html") : null; })
          .catch(function () { return null; });
        return cache[href];
      }
      targets.forEach(function (el) {
        fetchPage(el.getAttribute("data-photo-href")).then(function (doc) {
          if (!doc) return;
          var img = doc.querySelector(".product-card__image img, .product-card img");
          var src = img ? (img.getAttribute("src") || img.getAttribute("data-src")) : null;
          if (!src) return;
          if (el.classList.contains("route-icon")) {
            el.parentNode.style.backgroundImage = "url('" + src + "')";
            el.parentNode.classList.add("visual", "has-photo");
            return;
          }
          el.style.backgroundImage = "url('" + src + "')";
          el.classList.add("has-photo");
        });
      });
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
       framställnings-segment (se flagga i koden). ── */
    function nhPopularaVagarHtml(navData) {
      var vapeHref = nhFirstHref(navData.groups.vape, "alla-vapes") || "/sv/categories/alla-vapes";
      var blommaHref = nhFirstHref(navData.groups.blomma, "blommor-buds") || "/sv/categories/blommor-buds";
      var hashHref = nhFirstHref(navData.groups.hash, "hasch") || "/sv/categories/hasch";
      var cbdEntry = navData.footerLinks.filter(function (it) { return it.slug === "cbd-group"; })[0];
      var cbdHref = cbdEntry ? cbdEntry.href : "/sv/categories/cbd-group";

      var cards = [
        { kicker: "Format", label: "Vapes & carts", sub: "Engångsvapes & carts", href: vapeHref, icon: "vape" },
        { kicker: "Format", label: "Blommor", sub: "Filtrerbar lista", href: blommaHref, icon: "blomma" },
        { kicker: "Format", label: "Hash", sub: "Piatella & mousse", href: hashHref, icon: "hash" },
        { kicker: "Format", label: "CBD, CBG & CBN", sub: "Egen ingång", href: cbdHref, icon: "cbd" }
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
            return '<a class="route nh-reveal" href="' + c.href + '">'
              + '<div class="route-icon" data-photo-href="' + c.href + '">' + NH_ROUTE_ICONS[c.icon] + '</div>'
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
    function nhTrustBlockHtml() {
      return '<section class="nh-trustblock section-gap">'
        + '  <div class="nh-tb-grid">'
        + '    <a class="nh-tb-item nh-reveal" href="https://www.trustpilot.com/review/hazey.se" target="_blank" rel="noopener">'
        + '      <svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2.5 2.8 5.7 6.3.9-4.6 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L2.9 9.1l6.3-.9L12 2.5z"/></svg>'
        + '      <span><b>4,7/5 på Trustpilot</b><span>Läs verifierade omdömen</span></span></a>'
        + '    <a class="nh-tb-item nh-reveal" href="/sv/page/kop-och-leveransvillkor">'
        + '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="1.5"/><circle cx="18" cy="18" r="1.5"/></svg>'
        + '      <span><b>Leveransgaranti</b><span>Försvinner paketet skickar vi ett nytt</span></span></a>'
        + '    <a class="nh-tb-item nh-reveal" href="/sv/page/kop-och-leveransvillkor">'
        + '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 3 20 6v6c0 4.5-3.2 7.5-8 9-4.8-1.5-8-4.5-8-9V6l8-3z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></svg>'
        + '      <span><b>Diskret &amp; spårbart</b><span>Neutral avsändare, spårbar leverans</span></span></a>'
        + '    <a class="nh-tb-item nh-reveal" href="/sv/page/kontakt">'
        + '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M4 20V9l8-5 8 5v11"/><path d="M9 20v-6h6v6"/></svg>'
        + '      <span><b>Sedan 2020</b><span>Svenskt bolag, skickas från Sverige</span></span></a>'
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
       uppfunnen algoritm. ── */
    function nhBestsellersHtml() {
      return '<section class="nh-featured section-gap" id="nh-featured">'
        + '  <div class="sec-head"><div><h2>Bästsäljare i lager</h2>'
        + '  <p>Snabbval för produkter utan variantval.</p></div>'
        + '  <a class="more" href="/sv/categories/alla-produkter">Se allt →</a></div>'
        + '  <div class="nh-featured-row" id="nhFeaturedRow"><div class="nh-featured-empty">Laddar…</div></div>'
        + '</section>';
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
            inner.appendChild(c.cloneNode(true));
            outer.appendChild(inner);
            rowEl.appendChild(outer);
          });
          if (window.nhInitCards) window.nhInitCards();
        })
        .catch(function () {
          rowEl.parentNode.parentNode.hidden = true; // dölj hela sektionen, visa inget trasigt
        });
    }

    /* ── "Snabb koll: vad är vad?" — FLYTTAR och FORMATERAR OM befintlig,
       redan publicerad text (tar INTE bort innehåll, se regel i CLAUDE.md)
       från "THCA med flera"-textblocket till kortformat. THCNM är
       medvetet UTESLUTET ur den nya, mer synliga kort-sektionen —
       cannabinoiden är juridiskt pausad (se STATUS.md, "juridik ej klar"),
       så vi gör den INTE mer framträdande. Paragrafen ligger kvar orörd
       där den redan var, bara inte kopierad hit. ── */
    function nhBuildKunskapFromRealContent() {
      var blocks = document.querySelectorAll(
        ".store-startpage .template-components__text-editor, .store-startpage .template-components__columns"
      );
      var cards = [];
      blocks.forEach(function (block) {
        block.querySelectorAll("h1,h2,h3,h4").forEach(function (h) {
          var title = h.textContent.trim();
          if (!/^vad är/i.test(title)) return;
          if (/thcnm/i.test(title)) return; // juridik ej klar, se ovan — lämnas SYNLIG i original-läget
          var p = h.nextElementSibling;
          while (p && p.tagName !== "P") p = p.nextElementSibling;
          if (!p) return;
          cards.push({ title: title, text: p.textContent.trim() });
          // FLYTTAT, inte kopierat: original-rubriken/stycket döljs här så
          // samma text inte visas två gånger på sidan (Vilmer 2026-08-31:
          // "flytta och formatera om", inte duplicera).
          h.style.display = "none";
          p.style.display = "none";
        });
      });
      return cards;
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
    function nhKunskapHtml(cards) {
      if (!cards.length) return "";
      return '<section class="nh-kunskap section-gap">'
        + '  <div class="guide guide-dark">'
        + '    <div class="guide-top"><h2>Snabb koll: vad är vad?</h2>'
        + '    <span class="skip"><a href="/sv/page/faq">Hela FAQ:n →</a></span></div>'
        + '    <p class="lede">Korta förklaringar av det som frågas mest om. Vi beskriver innehåll och framställning, aldrig hur en produkt känns att använda.</p>'
        + '    <div class="guide-grid">'
        + cards.map(function (c) {
            return '<div class="g-card nh-reveal"><span class="g-name">' + c.title + '</span><p>' + c.text + '</p></div>';
          }).join("")
        + '    </div>'
        + '  </div>'
        + '</section>';
    }

    /* ── "Verifierade omdömen" — ENDAST det riktiga, redan inkopplade
       Trustpilot-betyget + en ärlig länk. INGA påhittade citat: verifierat
       (2026-08-31) att vi inte har en bekräftad Trustpilot-widgetmall som
       visar enskilda recensioner (två olika business-unit-id hittades i
       koden, se öppen datafråga i STATUS.md) — så vi bygger INTE ett
       citat-baserat kort tills det är utrett. ── */
    /* Facit visar TRE separata recensionskort (stjärnor/verifierad-etikett/
       citat/kund-metadata). Vi har INGEN verifierad källa för enskilda
       recensionscitat att koppla (öppen datafråga, se STATUS.md — Trustpilot
       widget-mallen för citat är oklar, två olika business-unit-id hittade
       i koden). Att hitta på tre kundcitat vore fejkdata, uttryckligen
       förbjudet. Lösning: den ÄKTA, verifierbara raden (4,7/5 + länk) visas
       alltid; kort-layouten byggs som en FÖRBERED men dold platshållar-shell
       (samma "hidden shell tills riktig data finns"-mönster som
       nhContinueShellHtml) — redo att kopplas in den dagen en riktig
       recensions-källa (widget eller API) med citat är bekräftad. ── */
    function nhReviewsHtml() {
      return '<section class="nh-reviews section-gap">'
        + '  <div class="sec-head"><div><h2>Verifierade omdömen</h2>'
        + '  <p>Endast kunder som köpt produkten kan lämna ett omdöme på Trustpilot.</p></div></div>'
        + '  <a class="nh-reviews-cta nh-reveal" href="https://www.trustpilot.com/review/hazey.se" target="_blank" rel="noopener">'
        + '    <span class="stars">★★★★★</span><span>4,7/5 på Trustpilot — läs alla omdömen →</span>'
        + '  </a>'
        + '  <div class="nh-reviews-grid" hidden data-status="ingen-verifierad-recensionskalla-an"></div>'
        + '</section>';
    }

    /* ── Nyhetsbrev, mitt på sidan (prototypen har ett HÄR + ett i
       footern). Icke-kopplad platshållare — precis som prototypens EGEN
       formulär (`onsubmit="return false"` där också). Vilmer 2026-08-31:
       inget verktyg kopplat än, flaggat i STATUS.md att det behöver
       kopplas innan lansering. ── */
    function nhNewsletterHtml() {
      return '<section class="nh-signup section-gap">'
        + '  <div class="nh-signup-block">'
        + '    <div><h2>Håll dig uppdaterad</h2>'
        + '    <p>Lagerpåfyllning, nya serier och viktiga juridiska uppdateringar — inget annat.</p></div>'
        + '    <form class="nh-signup-form" data-nh-placeholder-form="1">'
        + '      <input type="email" placeholder="Din e-postadress" aria-label="E-postadress" required>'
        + '      <button type="submit">Prenumerera</button>'
        + '    </form>'
        + '    <span class="nh-signup-note">Du kan avsluta prenumerationen när du vill.</span>'
        + '  </div>'
        + '</section>';
    }
    function nhInitPlaceholderForms(root) {
      root.querySelectorAll("[data-nh-placeholder-form]").forEach(function (f) {
        f.addEventListener("submit", function (e) { e.preventDefault(); });
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
      var els = root.querySelectorAll(".nh-reveal");
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

      // Riktig, redan konfigurerad hero-bild — den enda produktionskällan
      // (se nhHeroQfindHtml ovan för hela resonemanget).
      var firstSlide = slideshow.querySelector(".slideshow__slides__slide");
      var nativeHeroImgUrl = null;
      if (firstSlide) {
        var m = (firstSlide.getAttribute("style") || "").match(/url\((?:"|')?(.*?)(?:"|')?\)/);
        if (m) nativeHeroImgUrl = m[1];
      }

      // Döljer den nativa karusellen (rör den inte, bara CSS display:none)
      // och ersätter med det nya qfind-hero-kortet.
      slideRoot.classList.add("nh-native-hero-hidden");

      var heroWrap = document.createElement("div");
      heroWrap.innerHTML = nhHeroQfindHtml(navData, kampanjerHref, nativeHeroImgUrl);
      slideRoot.parentNode.insertBefore(heroWrap, slideRoot);
      while (heroWrap.firstChild) slideRoot.parentNode.insertBefore(heroWrap.firstChild, slideRoot);
      heroWrap.remove();

      // "Populära serier"/"Populära vägar" byts i INBÖRDES ORDNING mellan
      // mobil (serier→vägar) och desktop (vägar→serier) — uppmätt, se
      // STATUS.md. Kräver en flex-wrapper för att CSS `order` ska funka.
      var flexWrap = document.createElement("div");
      flexWrap.className = "nh-startpage-flex";
      flexWrap.innerHTML = nhPopularaSerierHtml(navData) + nhPopularaVagarHtml(navData);

      // Övriga home-extra-sektioner, ordning enligt facit (uppmätt
      // 2026-09-01, se PROTOTYP-INVENTERING.md): aura (befintlig, dold) →
      // fortsätt där du slutade (dold) → bästsäljare → trust-block/
      // "transparens" → kunskap → omdömen → nyhetsbrev. Trust-blocket låg
      // FÖRE bästsäljare i föregående bygge — det var fel ordning.
      var kunskapCards = nhBuildKunskapFromRealContent();
      var restWrap = document.createElement("div");
      restWrap.innerHTML = ''
        + '<section class="nh-aura-guide" id="aura-guiden" hidden data-status="juridik-ej-klar"></section>'
        + nhContinueShellHtml()
        + nhBestsellersHtml()
        + nhTrustBlockHtml()
        + nhKunskapHtml(kunskapCards)
        + nhReviewsHtml()
        + nhNewsletterHtml();

      var anchor = slideRoot.nextSibling;
      slideRoot.parentNode.insertBefore(flexWrap, anchor);
      while (restWrap.firstChild) slideRoot.parentNode.insertBefore(restWrap.firstChild, anchor);

      nhInitReveal(document);
      nhEnhanceWithRealPhotos(document);
      nhInitBestsellers(document);
      nhInitPlaceholderForms(document);
      nhHideSupersededTabsSection();
    }
