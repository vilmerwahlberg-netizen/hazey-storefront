
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

    function nhHeroQfindHtml(navData, kampanjerHref, nativeHeroImgUrl) {
      var vapeHref = nhFirstHref(navData.groups.vape, "alla-vapes") || "/sv/categories/alla-vapes";
      var blommaHref = nhFirstHref(navData.groups.blomma, "blommor-buds") || "/sv/categories/blommor-buds";
      var hashHref = nhFirstHref(navData.groups.hash, "hasch") || "/sv/categories/hasch";
      var cbdEntry = navData.footerLinks.filter(function (it) { return it.slug === "cbd-group"; })[0];
      var cbdHref = cbdEntry ? cbdEntry.href : "/sv/categories/cbd-group";

      var heroSrc = NH_ASSET_BASE + "hero-westcoast-v4.jpg";
      // data-hero-src: en QA-selektorkrok för lockImplImages (se ovan) —
      // värdet spelar ingen roll för testresultatet (skrivs över), bara
      // att attributet finns. Sätts till samma URL som faktiskt visas.
      var bg = ' style="background-image:url(\'' + heroSrc.replace(/'/g, "\\'") + '\')" data-hero-src="' + heroSrc.replace(/"/g, "&quot;") + '"';

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

    /* ── "Populära serier" ──
       Facit-kalibrering 2026-09-06, ANDRA omgången (ersätter föregående
       omgångs felaktiga slutsats, se STATUS.md): föregående omgång antog
       att facits "THC-X"/"THCbA"-etiketter var interna kodnamn för våra
       riktiga "Hero"/"Faraoh"-serier och bytte BARA bilderna, men behöll
       namnen/länkarna Hero/Faraoh -- det gav en synlig etikett-mismatch
       mot facit (facit säger "THC-X", vi sa "Hero") och är INTE
       godkänt som 1:1.

       Verifierat på nytt, denna gång mot den RIKTIGA, live nav-menyn på
       hazeyse.nyehandel.se (2026-09-06, alla ~48 kategorislugs lästa och
       klassificerade): det finns INGEN kategori, cannabinoidgrupp eller
       serie med sluggen "thcx"/"thc-x" eller "thcba"/"thc-ba" någonstans
       på skarpa sajten. Närmaste RIKTIGA cannabinoidkategorier är
       thca/thcb/thcv (juridiskt aktiva, NH_ACTIVE_CANNABINOIDS i
       js/18a-header-v2.js) samt thcnm/10-oh-thc/hhcpm (medvetet PAUSADE,
       juridik ej klar -- får inte visas, se samma fil) -- ingen av dessa
       är samma sträng som "THC-X"/"THCbA", och att anta att de menar
       samma sak vore att gissa en identitet ingen kan verifiera.

       Beslut: bygg INGEN "THC-X"/"THCbA"-platshållare med ett gissat
       eller lånat länkmål (uttryckligen förbjudet i uppdraget). Rader 3
       och 4 visar i stället helt enkelt näst mest relevanta RIKTIGA
       serierna i sin egen, riktiga, redan etablerade namn (Hero/Faraoh)
       -- vilket för övrigt redan är exakt var de hamnar helt UTAN någon
       priority-styrning alls (verifierat: series-arrayen byggs i nav-
       menyns egen DOM-ordning, och Hero/Faraoh råkar redan ligga direkt
       efter Magic Sauce/Nano-11 där). NH_PSER_PRIORITY pinnar därför
       bara de två FAKTISKT verifierade positionerna (Magic Sauce/Nano-11,
       som matchar facits egen ordning); allt annat (Hero, Faraoh, Tatra
       Hemp, Magic Farmers) behåller sin naturliga nav-ordning oförändrat.
       Riktig data/länkar/antal påverkas inte alls av detta.

       Öppen fråga till Vilmer (se slutrapport): motsvarar facits
       "THC-X"/"THCbA" något som ÄNNU INTE finns i nav-menyn (en planerad
       serie), eller ska de bytas mot riktiga namn i facit-prototypen? Vi
       gissar inte svaret här. */
    var NH_PSER_PRIORITY = ["Magic Sauce", "Nano-11"];
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
      series.sort(function (a, b) {
        var ia = NH_PSER_PRIORITY.indexOf(a.label);
        var ib = NH_PSER_PRIORITY.indexOf(b.label);
        if (ia === -1 && ib === -1) return 0; // stable: keep natural order for the rest
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      });
      return '<section class="nh-pser section-gap" id="populara-serier">'
        + '  <div class="sec-head"><h2>Populära serier</h2></div>'
        + '  <div class="pser-row">'
        + series.map(function (s) {
            // Alla serier (inkl. Hero/Faraoh) använder samma riktiga,
            // live-hämtade produktfoto-mekanism (nhEnhanceWithRealPhotos)
            // -- ingen serie får längre en facit-lånad platshållarbild,
            // se kommentaren ovan NH_PSER_PRIORITY.
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
    function nhTrustBlockHtml() {
      return '<section class="nh-trustblock section-gap">'
        + '  <div class="nh-tb-inner">'
        + '    <h2>Så arbetar Hazey med innehåll och ursprung</h2>'
        + '    <p>Vi är öppna med vad som finns i våra produkter och var de kommer ifrån — inga effektlöften, bara verifierbara fakta.</p>'
        + '    <a class="nh-tb-link" href="/sv/page/kop-och-leveransvillkor">'
        + '      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>'
        + '      Läs våra köp- och leveransvillkor</a>'
        + '    <ul class="nh-tb-points">'
        + '      <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>Leveransgaranti — försvinner paketet skickar vi ett nytt</li>'
        + '      <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>Diskret paket, neutral avsändare</li>'
        + '      <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>Spårbar leverans från Sverige</li>'
        + '      <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>Svenskt bolag, sedan 2020</li>'
        + '    </ul>'
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
        + '  <p>Snabbval för produkter utan variantval.</p></div>'
        + '  <a class="more" href="/sv/categories/alla-produkter">Se allt →</a></div>'
        + '  <div class="nh-featured-row pl-list" id="nhFeaturedRow"><div class="nh-featured-empty">Laddar…</div></div>'
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
       där den redan var, bara inte kopierad hit.

       Facit-kalibrering 2026-09-06 (se STATUS.md för fullständig
       utredning): facit visar FYRA kort (THCA/HHC, THCB/THCBA, Magic
       Sauce, Nano-11). Uttömmande sökt igenom HELA den riktiga sajten
       (startsidans egna textblock + samtliga ~32 riktiga kategorisidor)
       efter varje verkligt "Vad är X?"-textblock som finns publicerat:
       endast TRE existerar (THCA, THCNM, Magic Sauce, alla på
       startsidan) -- INGEN sådan text finns någonstans för Nano-11
       eller THCB/THCBA. THCNM är juridiskt pausad (utesluten ovan,
       oförändrat). Ett fjärde kandidat-textblock hittades på CBN-
       kategorisidan ("Vad är CBN?...") men INNEHÅLLER uttryckliga
       hälso-/effektpåståenden ("sömnfrämjande", "hälsofördelar",
       "avslappning", "minska stress och ångest") -- att lyfta fram DEN
       texten mer synligt här hade varit precis den typen av "starkare
       påstående än facit" uppdraget uttryckligen förbjöd (facit gör
       aldrig effekt-/hälsopåståenden i denna sektion), så den används
       INTE. Resultatet blir alltså fortsatt TVÅ kort (samma antal som
       innan denna omgång) -- en verifierad, INTE gissad, äkta
       innehållsbegränsning, rapporterad i slutrapporten i stället för
       att fyllas ut med påhittad text för Nano-11/THCB. */
    function nhBuildKunskapFromRealContent(navData) {
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
          cards.push({ title: title, text: p.textContent.trim(), href: nhKunskapHref(navData, title) });
          // FLYTTAT, inte kopierat: original-rubriken/stycket döljs här så
          // samma text inte visas två gånger på sidan (Vilmer 2026-08-31:
          // "flytta och formatera om", inte duplicera).
          h.style.display = "none";
          p.style.display = "none";
        });
      });
      return cards;
    }

    /* Hittar en riktig länk för ett kunskapskort genom att matcha kortets
       RUBRIK mot samma riktiga navigationsdata som resten av sidan redan
       använder (footerLinks för formatlösa cannabinoid-landningssidor,
       t.ex. THC-A; groups[*].series för seriesidor, t.ex. Magic Sauce) —
       inget hårdkodat per kort, samma mekanism återanvänds automatiskt
       om ett framtida riktigt "Vad är X?"-textblock tillkommer. Returnerar
       null (inte "#") om inget riktigt mål hittas — kortet renderas då
       utan länk, se nhKunskapHtml. */
    function nhKunskapHref(navData, title) {
      var t = title.toLowerCase();
      var cannaHit = navData.footerLinks.filter(function (it) {
        return t.indexOf(it.slug) > -1 || t.indexOf(it.label.toLowerCase()) > -1;
      })[0];
      if (cannaHit) return cannaHit.href;
      var groups = navData.groups;
      for (var g in groups) {
        var series = groups[g].series;
        for (var name in series) {
          if (t.indexOf(name.toLowerCase()) > -1) return series[name];
        }
      }
      return null;
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
        // Facit-kalibrering 2026-09-06: exakt facit-text (index.html rad
        // 4594) -- nämner uttryckligen aktuell laglighet, vilket stämmer
        // för våra egna kort (THCA/Magic Sauce handlar båda om just det).
        + '    <p class="lede">Korta förklaringar av det som frågas mest om — och vad som är lagligt i Sverige just nu. Vi beskriver innehåll och framställning, aldrig hur en produkt känns att använda.</p>'
        + '    <div class="guide-grid">'
        + cards.map(function (c) {
            // Riktig länk om ett verkligt mål hittades (nhKunskapHref) --
            // annars ett rent informativt kort utan `href="#"`, se
            // uppdragets krav. Ingen kort-fabricerad länk.
            var tag = c.href ? "a" : "div";
            var hrefAttr = c.href ? ' href="' + c.href + '"' : "";
            return '<' + tag + ' class="g-card nh-reveal"' + hrefAttr + '><span class="g-name">' + c.title + '</span><p>' + c.text + '</p></' + tag + '>';
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
      var kunskapCards = nhBuildKunskapFromRealContent(navData);
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
