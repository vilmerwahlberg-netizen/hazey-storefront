
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

    /* ── Utskriftssäkring för hero-slidedata (2026-09-11, gransknings-
       fix ovanpå e9909a1) ──
       Native hero-slidedata (rubrik/underrubrik/CTA-text/CTA-länk/
       bild-URL) kommer från Nyehandel-adminen, men skrivs in i en
       HTML-sträng via ren textkonkatenering (samma mönster som resten
       av filen redan använder) -- osanerat skulle det låta en
       administratörspost (avsiktligt eller av misstag) bryta ut ur
       sitt HTML-sammanhang eller peka på en farlig CTA-länk
       (javascript:/data:). Två små, tydliga hjälpfunktioner täcker de
       kontexter denna fil interpolerar värden i. */
    // Textnod-innehåll (mellan taggar, t.ex. <h1>HÄR</h1>).
    function nhEscHtml(s) {
      return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    // Ett dubbelciterat HTML-attributvärde (t.ex. href="HÄR").
    function nhEscAttr(s) {
      return nhEscHtml(s).replace(/"/g, "&quot;");
    }
    /* Säker CTA-länk: relativ (path/fragment/query, inget schema) eller
       absolut http(s) -- blockerar javascript:/data:/vbscript: m.fl.
       Returnerar null vid allt annat (inkl. en trasig URL som new URL()
       inte kan tolka), vilket gör den lästa native-sliden OGILTIG (se
       nhReadNativeHeroSlides) i stället för att gissa en tolkning eller
       rendera en farlig länk. */
    // Kontrolltecken (radbrytning/tab/m.fl., inkl. DEL) -- byggd via
    // teckenkoder (inte en inbäddad kontrolltecken-regexliteral, som är
    // osynlig och skör vid framtida redigering/kopiering) för tydlighet.
    function nhStripControlChars(s) {
      var out = "";
      for (var i = 0; i < s.length; i++) {
        var code = s.charCodeAt(i);
        if (code <= 31 || code === 127) continue;
        out += s.charAt(i);
      }
      return out;
    }
    function nhHasControlChars(s) {
      return nhStripControlChars(s) !== s;
    }
    function nhSafeHref(raw) {
      var href = (raw == null ? "" : String(raw)).trim();
      if (!href || nhHasControlChars(href)) return null;
      if (/^[/#?]/.test(href)) return href; // relativ (path/fragment/query)
      if (/^https?:\/\//i.test(href)) {
        try { new URL(href); return href; } catch (e) { return null; }
      }
      return null;
    }
    /* Säkrar en bild-URL för inbäddning i ett CSS url('...')-token som i
       sin tur sitter i ett dubbelciterat HTML style-/data-attribut --
       måste göras i RÄTT ORDNING: (1) ta bort kontrolltecken
       (radbrytning m.m. -- en URL ska aldrig innehålla dem), (2)
       CSS-escapa backslash och enkelt citattecken (så URL:en inte kan
       bryta ut ur den enkelciterade url()-token), (3) HTML-attribut-
       escapa RESULTATET (& och dubbelt citattecken) -- utan detta sista
       steg skulle ett bokstavligt " i URL:en avsluta HELA HTML-
       attributet i förtid. */
    function nhSanitizeCssUrl(raw) {
      var noControl = nhStripControlChars(String(raw == null ? "" : raw));
      var cssEscaped = noControl.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
      return nhEscAttr(cssEscaped);
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

    /* ── Hero-datakällemigrering (2026-09-10, granskningsfix 2026-09-11) ──
       Heron läser RIKTIGA slides direkt ur Nyehandels egen native
       bildspels-DOM (se nhReadNativeHeroSlides längre ner) -- INTE
       längre den hårdkodade kampanjkonfigurationen nedan.
       NH_HERO_CAMPAIGNS_FALLBACK finns KVAR i koden (se
       nhActiveHeroSlides) men anropas INTE automatiskt någonstans
       (varken härifrån eller från initHomepageV2) -- den är ett rent
       manuellt skyddsnät, inte en aktiv reservväg. Faktiskt beteende:
       finns minst en giltig native-slide byggs Hazey-heron av DEN;
       finns ingen giltig native-slide rörs native-bildspelet INTE alls
       och det förblir synligt (se initHomepageV2 för den fullständiga
       motiveringen till varför detta väger tyngre än att tyst byta till
       den hårdkodade konfigurationen). Rör inte renderings-/kub-logiken
       (nhHeroSlideHtml/nhHeroHtml/nhInitHeroCarousel) för att lägga till
       en ny riktig kampanj -- lägg till/redigera slidet direkt i
       Nyehandel-admins bildspel i stället, det läses automatiskt härifrån.

       Varje post stödjer: id, enabled, order, startsAt/endsAt (ISO-
       datumsträngar, styr AUTOMATISKT om kampanjen visas -- se
       nhActiveHeroSlides), imageMobile/imageDesktop (desktop faller
       tillbaka till mobilbilden om ingen egen desktopbild finns än --
       INGEN ny bild fabricerad för detta), alt (bildens alt-text),
       eyebrowMobile/eyebrowDesktop (kicker), h1, pMobile/pDesktop,
       primaryCta{label,href}, secondaryCta{labelMobile,labelDesktop,
       openHr}|null, theme (overlay-ton, se .nh-hero-slide[data-theme]
       i CSS -- just nu bara "default", förberett för fler).

       nhActiveHeroSlides() validerar/filtrerar/sorterar: en ogiltig post
       (saknar bild/rubrik/CTA) hoppas tyst över i stället för att krascha
       heron; om INGEN post blir kvar (allt inaktiverat/ogiltigt/utanför
       datumfönster) tvingas evergreen-sliden fram som garanterad fallback
       -- heron kan alltså aldrig bli helt tom. */
    // Delad mellan native- och fallback-vägen (samma permanenta funktion,
    // se uppdragets krav -- inga NYA kampanjspecifika sekundär-CTA:er för
    // native-slides, bara den här, redan godkända, på den FÖRSTA sliden).
    var NH_HERO_SECONDARY_CTA = { labelMobile: "Hjälp mig →", labelDesktop: "Hjälp mig hitta rätt", openHr: true };
    var NH_HERO_CAMPAIGNS_FALLBACK = [
      {
        id: "assortment",
        enabled: true,
        order: 1,
        startsAt: null,
        endsAt: null,
        imageMobile: "hero-westcoast-v4.jpg",
        // PRELIMINÄR (godkänd desktop-parity-runda, se STATUS.md): riktig
        // Hazey-bild med PRELIMINÄRA AI-genererade produktförpackningar
        // och grafittitext ("GOOD PLANTS BETTER DAYS"/"Same Plants
        // Brighter Days") -- godkänt av Vilmer uttryckligen för denna
        // omgång ("Vilmer har uttryckligen valt att först bygga
        // referensen visuellt 1:1"). Ska kompositeras om med riktiga
        // Hazey-produktförpackningar i en senare bildomgång. Mobilens
        // bild (imageMobile ovan) är OFÖRÄNDRAD -- separat fält, ingen
        // mobil-påverkan.
        imageDesktop: "v2/hero-westcoast-products-graffiti.jpg",
        alt: "Västkustinspirerad livsstilsbild med cannabisprodukter",
        // Två olika eyebrow/underrubrik-texter per breddpunkt (uppmätt ur
        // facit — INTE samma text skalad, se historiken nedan). Desktop-
        // eyebrowen byttes till den godkända referensens egen kicker
        // ("California State of Mind") i desktop-parity-rundan -- ren
        // tonsättande marknadsföringstext, ingen fakta-/handelsuppgift,
        // se STATUS.md. Mobilens eyebrow är OFÖRÄNDRAD.
        eyebrowMobile: "Brett sortiment · öppen information",
        // Referensen bryter uttryckligen kickern i två rader ("California"
        // / "State of Mind", inte en löpande rad) -- samma text, bara en
        // avsiktlig radbrytning för att matcha den italiska/handskrivna
        // kompositionen. Mobilens eyebrowMobile är en annan, kortare, redan
        // godkänd text -- orörd.
        eyebrowDesktop: "California<br>State of Mind",
        h1: "Hitta rätt utan att kunna allt.",
        pMobile: "Sök direkt eller jämför på innehåll, format och framställning.",
        pDesktop: "Sök direkt, eller jämför produkter på innehåll, framställning och publicerat analyscertifikat.",
        primaryCta: { label: "Utforska sortimentet", href: "#populara-vagar" },
        secondaryCta: NH_HERO_SECONDARY_CTA,
        theme: "default"
      },
      // Slide 2: riktig, verifierad destination -- INGEN fabricerad
      // rabatt/kampanj, se uppdragets uttryckliga förbud. Bilden är samma
      // godkända Magic Sauce-derivat som redan används i Populära serier.
      // startsAt/endsAt lämnade null (ingen tidsgräns) -- sätt datum här
      // den dagen kampanjen ska tidsstyras, ingen kodändring krävs.
      {
        id: "magic-sauce",
        enabled: true,
        order: 2,
        startsAt: null,
        endsAt: null,
        imageMobile: "series/magic-sauce.jpg",
        imageDesktop: null,
        alt: "Magic Sauce-vapes i sin förpackning",
        eyebrowMobile: "Populär serie",
        eyebrowDesktop: "Populär serie hos Hazey",
        h1: "Upptäck Magic Sauce.",
        pMobile: "Vape, buds och hash i en av våra mest efterfrågade serier.",
        pDesktop: "Vape, buds och hash i en av våra mest efterfrågade serier — se hela sortimentet.",
        primaryCta: { label: "Se Magic Sauce-sortimentet", href: "/sv/categories/magic-sauce" },
        secondaryCta: null,
        theme: "default"
      }
    ];

    function nhValidHeroSlide(s) {
      return !!(s && s.id && s.imageMobile && s.h1
        && s.primaryCta && s.primaryCta.href && s.primaryCta.label);
    }
    // Fallback-ENDAST (se filens kommentar ovan) -- anropas av
    // initHomepageV2 bara när nhReadNativeHeroSlides gav noll giltiga
    // resultat.
    function nhActiveHeroSlides() {
      var now = Date.now();
      var candidates = NH_HERO_CAMPAIGNS_FALLBACK.filter(function (s) {
        if (!s || !s.enabled) return false;
        if (s.startsAt && now < new Date(s.startsAt).getTime()) return false;
        if (s.endsAt && now > new Date(s.endsAt).getTime()) return false;
        if (!nhValidHeroSlide(s)) return false; // ogiltig post -- hoppas över, kraschar aldrig heron
        return true;
      }).sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
      if (candidates.length) return candidates;
      // Garanterad fallback: evergreen-sliden visas ändå om den själv är
      // giltig, även om den råkat inaktiveras eller filtrerats bort ovan --
      // heron ska ALDRIG kunna bli helt tom.
      var evergreen = NH_HERO_CAMPAIGNS_FALLBACK.filter(function (s) { return s.id === "assortment" && nhValidHeroSlide(s); })[0];
      return evergreen ? [evergreen] : [];
    }

    /* ── Läser RIKTIGA hero-slides direkt ur Nyehandels egen native
       bildspels-DOM (.template-components__slideshow .slideshow) --
       detta är DEN FAKTISKA datakällan när minst en giltig slide finns.
       NH_HERO_CAMPAIGNS_FALLBACK/nhActiveHeroSlides() nedan anropas INTE
       automatiskt härifrån eller från initHomepageV2 (se den funktionen
       för fullständig motivering) -- kvar i koden bara som ett manuellt
       skyddsnät, inte en aktiv reservväg. Ren avläsningsfunktion -- rör
       ALDRIG native-DOM:en (ingen mutation här), returnerar bara enkla
       dataobjekt. Rubrik/underrubrik/CTA-text/CTA-länk är Nyehandel-
       adminens EGNA, redan sparade, riktiga värden -- ingen fabricerad
       text.

       Verifierat live i tema 6 (2026-09-10) innan denna funktion
       skrevs (curl/DOM-inspektion, inte gissat):
       - root: .template-components__slideshow, karusell: .slideshow
       - varje slide: .slideshow__slides__slide[data-index]
       - bild: slidens EGEN inline background-image (absolut
         CloudFront-URL) -- läst via getComputedStyle (robust mot
         citattecken-/kodning i style-attributet, ingen regex mot rå
         HTML-sträng).
       - rubrik: .slideshow__slides__slide__content__title h2
       - underrubrik: den enda <p> i .slideshow__slides__slide__content
       - primär CTA: .action a (text + href, adminens egna)
       - ingen alt-text exponeras i den renderade DOM:en -- fabricerar
         ingen (se nhNativeSlideToHeroSlide, alt lämnas null).

       Granskningsfix (2026-09-11) ovanpå e9909a1: CTA-länken körs genom
       nhSafeHref (bara relativ path/fragment/query eller absolut
       http/https, blockerar javascript:/data:/vbscript: och trasiga
       URL:er) INNAN giltighetskontrollen nedan -- en osäker/trasig länk
       gör alltså hela sliden ogiltig, precis som en saknad bild/rubrik
       redan gjorde. Själva HTML-escapingen av rubrik/underrubrik/CTA-
       text/bild-URL sker i nhHeroSlideHtml (rätt ställe, där värdena
       faktiskt skrivs in i en HTML-sträng) -- se den funktionen. */
    function nhReadNativeHeroSlides(slideshow) {
      if (!slideshow) return [];
      var slideEls = Array.prototype.slice.call(slideshow.querySelectorAll(".slideshow__slides__slide[data-index]"));
      var read = slideEls.map(function (el) {
        var idx = parseInt(el.getAttribute("data-index"), 10);
        var bg = (getComputedStyle(el).backgroundImage || "").trim();
        var m = /^url\((["']?)(.*)\1\)$/.exec(bg);
        var image = m ? m[2] : null;
        var titleEl = el.querySelector(".slideshow__slides__slide__content__title h2");
        var title = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : null;
        var contentWrap = el.querySelector(".slideshow__slides__slide__content");
        var pEl = contentWrap ? contentWrap.querySelector("p") : null;
        var sub = pEl ? pEl.textContent.replace(/\s+/g, " ").trim() : "";
        var actionA = el.querySelector(".action a");
        var ctaText = actionA ? actionA.textContent.replace(/\s+/g, " ").trim() : null;
        var ctaHref = actionA ? nhSafeHref(actionA.getAttribute("href")) : null;
        return { index: isNaN(idx) ? null : idx, image: image, title: title, sub: sub, ctaText: ctaText, ctaHref: ctaHref };
      });
      // Endast giltiga slides (bild + rubrik + fungerande, SÄKER
      // CTA-text+länk) -- en trasig/ofullständig/osäker adminpost hoppas
      // tyst över, precis som nhValidHeroSlide redan gör för fallback-
      // konfigurationen. Sorteras explicit på data-index (uppdragets
      // krav "rätt ordning") snarare än att lita blint på DOM-ordningen.
      return read
        .filter(function (s) { return !!(s.image && s.title && s.ctaText && s.ctaHref); })
        .sort(function (a, b) { return (a.index || 0) - (b.index || 0); });
    }
    /* Konverterar en läst native-slide (se ovan) till samma objektform
       som nhHeroSlideHtml/nhValidHeroSlide redan förväntar sig -- samma
       rendering/kub-logik återanvänds helt oförändrad, bara datakällan
       byts. SAMMA bild används för mobil och desktop i denna första
       version (uppdragets krav, punkt 8) -- ingen gissad separat
       mobilbeskärning. Ingen eyebrow (kicker) -- native har inget sådant
       fält (nhHeroSlideHtml utelämnar helt tomma eyebrow-element). Ingen
       bild-alt-text fabricerad -- gruppens tillgängliga namn kommer i
       stället från rubriken via aria-labelledby (se nhHeroSlideHtml). */
    function nhNativeSlideToHeroSlide(native, i) {
      return {
        id: "native-" + native.index,
        imageMobile: native.image,
        imageDesktop: native.image,
        alt: null,
        eyebrowMobile: "",
        eyebrowDesktop: "",
        h1: native.title,
        pMobile: native.sub,
        pDesktop: native.sub,
        primaryCta: { label: native.ctaText, href: native.ctaHref },
        // Uppdragets krav (punkt 12): den permanenta "Hjälp mig hitta
        // rätt"-funktionen finns KVAR bara på FÖRSTA sliden -- inga nya
        // kampanjspecifika sekundär-CTA:er för native-slides ännu.
        secondaryCta: i === 0 ? NH_HERO_SECONDARY_CTA : null,
        theme: "default"
      };
    }

    function nhHeroSlideHtml(slide, i, kampanjerHref, catLinks) {
      // Datakällemigrering (2026-09-10): native hero-slides (se
      // nhReadNativeHeroSlides/nhNativeSlideToHeroSlide) ger en ABSOLUT
      // CloudFront-bild-URL -- den ska ALDRIG prefixas med NH_ASSET_BASE
      // (uppdragets uttryckliga krav). Den äldre, hårdkodade fallback-
      // konfigurationen (NH_HERO_CAMPAIGNS_FALLBACK) använder fortfarande
      // relativa filnamn som redan förutsätter NH_ASSET_BASE-prefixet --
      // båda formaten stöds här utan att den ena vägen påverkar den andra.
      var mobileIsAbsolute = /^https?:\/\//i.test(slide.imageMobile || "");
      var desktopImg = slide.imageDesktop || slide.imageMobile;
      var desktopIsAbsolute = /^https?:\/\//i.test(desktopImg || "");
      // Granskningsfix (2026-09-11): nhSanitizeCssUrl tar bort kontroll-
      // tecken och escapar backslash/citattecken i RÄTT ordning för ett
      // CSS url('...')-token inuti ett dubbelciterat HTML-attribut (se
      // funktionens egen kommentar) -- ersätter de tidigare enkla,
      // ofullständiga .replace()-anropen som bara hanterade EN av de två
      // citattecken-nivåerna.
      var mobileSrc = mobileIsAbsolute ? slide.imageMobile : NH_ASSET_BASE + slide.imageMobile;
      var desktopSrc = desktopIsAbsolute ? desktopImg : NH_ASSET_BASE + desktopImg;
      var mobileSrcSafe = nhSanitizeCssUrl(mobileSrc);
      var desktopSrcSafe = nhSanitizeCssUrl(desktopSrc);
      // --hero-img-m/--hero-img-d: responsiv bildväxling via CSS custom
      // properties (se css/22-homepage-v2.css) i stället för att JS måste
      // skriva om bakgrundsbilden vid varje breakpoint-byte. Faller
      // tillbaka till samma bild för båda om ingen egen desktopbild finns
      // konfigurerad än -- syns INTE som en visuell skillnad idag, bara
      // förberett. data-hero-src: oförändrad QA-selektorkrok (lockImplImages).
      var bg = ' style="--hero-img-m:url(\'' + mobileSrcSafe + '\');--hero-img-d:url(\'' + desktopSrcSafe + '\')"'
        + ' data-hero-src="' + nhEscAttr(mobileSrc) + '"';
      var secondary = slide.secondaryCta
        ? '<button type="button" class="hero-link"' + (slide.secondaryCta.openHr ? ' data-open-hr="1"' : "")
          + '><span class="nh-hero-v2__btn--mobile">' + slide.secondaryCta.labelMobile + '</span>'
          + '<span class="nh-hero-v2__btn--desktop">' + slide.secondaryCta.labelDesktop + '</span></button>'
        : "";
      // SEO-krav (oförändrat sen tidigare rundor): startsidan får ha EXAKT
      // EN <h1> i DOM:en, oavsett hur många hero-slides som finns (alla
      // slides ligger samtidigt i DOM:en som kubsidor, bara ROTERADE ur
      // synligt läge -- en andra <h1> hade återinfört det redan verifierat
      // fixade two-H1-problemet). Bara första slidet (i===0) får en riktig
      // <h1>; övriga slides återanvänder EXAKT samma CSS-klass på en <p> i
      // stället, visuellt identiskt, semantiskt en rubrik lägre. Detta är
      // en INDEXBASERAD regel (positionen i den lästa slide-listan), inte
      // en gissning utifrån rubrik/URL -- se STATUS.md ("Nyehandels
      // FÖRSTA slide är den kanoniska huvudsliden") för den fullständiga
      // motiveringen till varför just index 0 äger detta.
      var headingTag = i === 0 ? "h1" : "p";
      // KORRIGERAT (Refine 2026-09-09 -- sekundära kampanjslides fick
      // exakt samma komposition/typografi som evergreen-sliden, trots att
      // de kan ha en helt annan bildkomposition (t.ex. Magic Sauce-bilden,
      // med produkterna mycket mer dominant centrerade) -- en generell
      // modifierarklass, inte en engångsregel för just "Magic Sauce"-
      // texten. Rör aldrig evergreen-slidens redan godkända layout (den
      // får sin egen, oförändrade klass). Baserat på samma i===0-antagande
      // som headingTag ovan (endast den första, garanterat evergreen,
      // sliden får h1/--evergreen; alla ANDRA -- oavsett hur många
      // framtida kampanjer som läggs till -- får p/--campaign). */
      var slideKindClass = i === 0 ? "nh-hero-slide--evergreen" : "nh-hero-slide--campaign";
      // Granskningsfix (2026-09-11): gruppens tillgängliga namn kommer nu
      // från rubriken (aria-labelledby → ett unikt id på <h1>/<p>) i
      // stället för en aria-label baserad på slide.alt. Bilden förblir
      // rent dekorativ och får ALDRIG en fabricerad alt-text/beskrivning
      // -- rubriken/undertexten/CTA:n bär redan hela den meningsfulla
      // informationen, precis som tidigare, bara via ett mer korrekt/
      // standardmässigt ARIA-mönster (ett element kan inte själv vara
      // sin egen aria-labelledby-referens på ett tillförlitligt sätt om
      // det saknar ett id, vilket saknades innan denna fix).
      var headingId = "nh-hero-heading-" + i;
      // Eyebrow (kicker) finns bara för den hårdkodade fallback-
      // konfigurationen -- native-slides har inget sådant fält (se
      // nhNativeSlideToHeroSlide). Renderas bara när text faktiskt finns,
      // annars hade en tom <div> lämnat kvar sin egen margin-bottom som
      // ett litet, omotiverat tomrum ovanför rubriken. Escapas INTE (till
      // skillnad från h1/pMobile/pDesktop nedan) -- fallback-konfigen
      // (NH_HERO_CAMPAIGNS_FALLBACK) lägger medvetet in en egen <br> i
      // eyebrowDesktop för en avsiktlig radbrytning; native-slides sätter
      // alltid tomma strängar här (renderas inte alls) så det finns
      // ingen native-data att sanera i just dessa två fält.
      var eyebrowMobileHtml = slide.eyebrowMobile
        ? '<div class="nh-hero-v2__eyebrow nh-hero-v2__eyebrow--mobile">' + slide.eyebrowMobile + '</div>' : "";
      var eyebrowDesktopHtml = slide.eyebrowDesktop
        ? '<div class="nh-hero-v2__eyebrow nh-hero-v2__eyebrow--desktop">' + slide.eyebrowDesktop + '</div>' : "";
      // Granskningsfix (2026-09-11): h1/underrubrik/CTA-text HTML-
      // escapas (nhEscHtml) och CTA-länken attribut-escapas (nhEscAttr)
      // här, vid själva interpoleringspunkten -- native-slidens
      // CTA-länk är dessutom redan schema-validerad (nhSafeHref) i
      // nhReadNativeHeroSlides, så escapingen här är ett andra,
      // oberoende skyddslager (skadar aldrig fallback-konfigurationens
      // egna, redan trygga text-/länkvärden).
      return '<div class="nh-hero-slide ' + slideKindClass + '" role="group" aria-roledescription="slide" aria-labelledby="' + headingId + '" aria-hidden="' + (i === 0 ? "false" : "true") + '" data-theme="' + (slide.theme || "default") + '"' + bg + '>'
        + '  <div class="nh-hero-v2__inner">'
        + eyebrowMobileHtml
        + eyebrowDesktopHtml
        + '    <' + headingTag + ' id="' + headingId + '" class="nh-hero-v2__h1">' + nhEscHtml(slide.h1) + '</' + headingTag + '>'
        + '    <p class="nh-hero-v2__p--mobile">' + nhEscHtml(slide.pMobile) + '</p>'
        + '    <p class="nh-hero-v2__p--desktop">' + nhEscHtml(slide.pDesktop) + '</p>'
        // Kategori-genvägsraden finns BARA på desktop i rätt fil (dVp),
        // inte i mVp — döljs på mobil via CSS. Delad mellan slides (samma
        // riktiga navigationslänkar oavsett vilken slide som visas).
        + '    <div class="nh-hero-v2__cats">' + catLinks + '</div>'
        + '    <div class="nh-hero-v2__cta">'
        + '      <a class="btn-solid" href="' + nhEscAttr(slide.primaryCta.href) + '">' + nhEscHtml(slide.primaryCta.label) + '</a>'
        + secondary
        + '    </div>'
        + '  </div>'
        + '</div>';
    }

    function nhHeroHtml(navData, kampanjerHref, active) {
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

      // Datakällemigrering (2026-09-10): `active` kommer nu in som
      // parameter (redan upplöst i initHomepageV2 -- de RIKTIGA lästa
      // native-slidesen, se nhReadNativeHeroSlides/nhNativeSlideToHero
      // Slide; denna funktion anropas bara alls när minst en giltig
      // sådan finns) i stället för att denna funktion själv ringde
      // nhActiveHeroSlides(). Renderings-/kub-logiken nedan är HELT
      // oförändrad oavsett vilken källa slidesen kom ifrån.
      // "Om endast en slide är aktiv ska kubkontroller och autoplay stängas
      // av" (uppdragets krav) -- multi styr både dots/pilar (nedan) och
      // hela autoplay-/kub-initieringen (se nhInitHeroCarousel: total<=1
      // ger tidig retur, inga lyssnare, ingen timer).
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

      // Kort trust-rad längst ner över heron (uppdragets krav, desktop-
      // parity-runda) -- ENDAST redan verifierade fakta, samma tre som
      // redan visas i den övre mikrotrust-raden (js/18a-header-v2.js),
      // ingen ny/fabricerad siffra. Egen, delad rad ovanpå/under kuben --
      // INTE en del av varje enskild slide (skulle annars dupliceras per
      // slide och blinka till vid varje kubrotation).
      // KORRIGERAT (Refine 2026-09-09 -- referensens kompakta trustobjekt
      // med ikon, inte tre stora textstycken utan ikon): samma tre redan
      // verifierade fakta som förut, bara med en liten dekorativ
      // inline-SVG per objekt (aria-hidden="true" -- ingen egen mening,
      // texten bär redan hela informationen för skärmläsare).
      var heroTrust = '<div class="nh-hero-v2__trust">'
        + '  <span class="nh-hero-v2__trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 20c7-1 13-6 15-15-9 1-14 6-15 15z"/><path d="M6 18c3-3 6-6 12-13"/></svg><span><b>Fri frakt</b> från 499 kr</span></span>'
        + '  <span class="nh-hero-v2__trust-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/></svg><span>Skickas <b>1–2 vardagar</b></span></span>'
        + '  <span class="nh-hero-v2__trust-item"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.3 6.6.7-4.9 4.5 1.3 6.5L12 16.8 6.1 20l1.3-6.5L2.5 9l6.6-.7z"/></svg><span><b>Trustpilot 4,7/5</b></span></span>'
        + '</div>';
      // KORRIGERAT (Korrigeringsrunda 2026-09-09): den redundanta
      // "Vad söker du?"-CRO-raden (.nh-qfind, "Jag är nybörjare"/Vapes &
      // carts/Blommor/Naturidentiskt/Semisyntetiskt/Kampanjer) togs bort
      // helt ur DOM/JS -- fyllde ingen tillräckligt tydlig egen funktion
      // och duplicerade navigation som redan finns på andra ställen.
      // Verifierat FÖRE borttagning att varje riktig, distinkt destination
      // redan finns kvar: "Jag är nybörjare" (data-open-hr="1", öppnar
      // samma hjälp-quiz) finns redan som herons egen sekundära CTA
      // ("Hjälp mig hitta rätt →", se secondaryCta.openHr ovan); Vapes &
      // carts/Blommor/Kampanjer finns redan i herons egen catLinks-rad
      // (se .nh-hero-v2__cats, samma vapeHref/blommaHref/kampanjerHref
      // som redan används där). "Naturidentiskt"/"Semisyntetiskt" pekade
      // båda mot samma generiska /alla-produkter-sida (ingen egen
      // destination att bevara) och använde dessutom en ännu inte
      // beslutad terminologi (samma öppna fråga som i Populära vägar).
      return '<section class="nh-hero-v2 nh-qfind-hero" id="nhHero" data-slides="' + active.length + '" tabindex="' + (multi ? "0" : "-1") + '">'
        + '  <div class="nh-hero-track"><div class="nh-hero-cube">' + slidesHtml + '</div></div>'
        + arrows + dots
        + heroTrust
        + '</section>';
    }

    /* Karusellbeteende — no-op när bara 1 slide är aktiv (inga lyssnare
       registreras alls, se early return). Svep (pointer events, fungerar
       för touch OCH mus), pilar, prickar, valfri diskret autoplay som
       pausar permanent vid första interaktionen och pausar/återupptas med
       fliksynlighet (document.visibilitychange) — aldrig aktiv om
       `prefers-reduced-motion: reduce`. */
    /* ── Hero-karusell: 3D-kubövergång (2026-09-09) ──
       ROTORSAK, "fastnar efter slide 2" (undersökt denna omgång, se
       slutrapporten): den TIDIGARE versionen anropade
       onManualInteraction() redan vid `pointerdown` -- INNAN riktningen
       på rörelsen var känd. Ett helt vanligt LODRÄTT sidscroll som råkar
       STARTA med fingret ovanpå hero-bilden (mycket vanligt -- besökare
       scrollar neråt direkt från toppen) tolkades då som en avsiktlig
       swipe, satte `userStopped=true` PERMANENT och stängde av autoplay
       för gott -- det förklarar mönstret "går 1→2 (första autoplay-
       ticket hinner före), sedan fastnar" utan att besökaren medvetet
       gjort något. Fixat genom att aldrig räkna interaktionen som en
       swipe förrän rörelsen faktiskt är tydligt horisontell (se
       `horizLock` nedan) OCH genom att byta bort den permanenta
       "userStopped"-flaggan mot en tidsbegränsad paus som återupptas
       efter rimlig inaktivitet (uppdragets nya, uttryckliga krav).

       Kubmekanik: vid varje navigering positioneras MÅLSIDAN instant
       (ingen transition) på kubens sida (±90°, se runTransition), sedan
       roterar HELA `.nh-hero-cube` -90/+90° så målsidan svänger in i
       fronten. När rotationen är klar nollställs kubens EGEN transform
       till 0 UTAN transition (`cube.style.transition="none"`, tvingad
       reflow, transition återställd) -- detta är precis den
       normalisering uppdraget efterfrågar: rotationsvärdet växer ALDRIG
       obegränsat (…-90,-180,-270…), varje cykel startar om från 0. */
    function nhInitHeroCarousel(root) {
      var section = root.querySelector("#nhHero");
      if (!section) return;
      var total = parseInt(section.getAttribute("data-slides"), 10) || 1;
      if (total <= 1) return; // "endast en slide -> kubkontroller/autoplay av" (inga dots/pilar renderade heller, se nhHeroHtml)
      var cube = section.querySelector(".nh-hero-cube");
      var slides = Array.prototype.slice.call(section.querySelectorAll(".nh-hero-slide"));
      if (!cube || slides.length < 2) return;
      var dots = Array.prototype.slice.call(section.querySelectorAll(".nh-hero-dot"));
      var prevBtn = section.querySelector(".nh-hero-arrow--prev");
      var nextBtn = section.querySelector(".nh-hero-arrow--next");
      var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      var index = 0;
      var animating = false;
      var pendingStep = null; // högst ETT köat nästa steg medan en transition redan pågår
      var autoplayTimer = null;
      var resumeTimer = null;
      var AUTOPLAY_MS = 7000;   // "cirka 6-8 sekunder", mitt i intervallet
      var RESUME_AFTER_MS = 9000; // "återuppta efter rimlig inaktivitet" -- INTE permanent paus längre

      /* Desktop correction pass (2026-09-09): kuben (perspective/preserve-3d/
         translateZ/rotateY) är nu ENDAST mobil (<=860px, samma brytpunkt som
         resten av projektets desktop/mobil-CSS). Desktop använder en lugn
         opacity-crossfade (se runTransitionFade) -- ingen 3D-transform sätts
         någonsin på desktop, bekräftat via isDesktop()-grenen nedan i stället
         för att lita på CSS @media ensamt (JS måste veta vilket LÄGE den ska
         driva övergången i, inte bara vilken stil som råkar gälla). */
      function isDesktop() { return window.innerWidth > 860; }

      slides.forEach(function (s, i) { s.classList.toggle("is-front", i === 0); });

      function setCubeHalf() {
        var w = section.getBoundingClientRect().width;
        if (w > 0) cube.style.setProperty("--cube-half", (w / 2) + "px");
      }
      setCubeHalf();
      var wasDesktop = isDesktop();
      var resizeQueued = false;
      window.addEventListener("resize", function () {
        if (resizeQueued) return;
        resizeQueued = true;
        requestAnimationFrame(function () {
          resizeQueued = false;
          setCubeHalf();
          var nowDesktop = isDesktop();
          if (nowDesktop !== wasDesktop) {
            wasDesktop = nowDesktop;
            resetTransitionState();
          }
        });
      });
      cube.classList.add("nh-hero-cube--ready");

      /* Byte över 860/861-brytpunkten (t.ex. ett verkligt fönster som
         dras om, eller devtools-breddändring) -- städar allt övergångs-
         tillstånd från BÅDA lägena så nästa navigering startar rent,
         oavsett vilket läge man kom ifrån. Rör ALDRIG `index`/vilken
         slide som logiskt är aktiv, bara de tillfälliga övergångsspåren. */
      function resetTransitionState() {
        animating = false;
        pendingStep = null;
        cube.style.transition = "none";
        cube.style.setProperty("--cube-rot", "0deg");
        void cube.offsetWidth;
        cube.style.transition = "";
        slides.forEach(function (s, i) {
          s.classList.remove("is-target", "nh-hero-fade-in");
          s.classList.toggle("is-front", i === index);
          s.style.transform = "";
          s.style.transition = "";
        });
      }

      function updateDots() { dots.forEach(function (d, i) { d.setAttribute("aria-current", i === index ? "true" : "false"); }); }
      function updateAriaHidden() { slides.forEach(function (s, i) { s.setAttribute("aria-hidden", i === index ? "false" : "true"); }); }

      // Reduced-motion-väg (och en generell säkerhetsfallback): omedelbart
      // byte, ingen 3D-rotation alls -- uppdragets krav "ingen 3D-rotation
      // vid reduced motion, manuell navigation ska fortsatt fungera".
      function instantShow(newIndex) {
        slides.forEach(function (s, i) {
          s.classList.toggle("is-front", i === newIndex);
          s.classList.remove("is-target");
          s.style.transform = "";
        });
        index = newIndex;
        updateDots();
        updateAriaHidden();
      }

      function runTransition(newIndex, dir) {
        if (newIndex === index) return;
        if (animating) { pendingStep = { newIndex: newIndex, dir: dir }; return; } // "lås ny navigation... köa högst ett nästa steg"
        if (reduceMotion) { instantShow(newIndex); return; }
        if (isDesktop()) { runTransitionFade(newIndex); return; }
        runTransitionCube(newIndex, dir);
      }

      /* Desktop: lugn premium-crossfade (~420ms), INGEN 3D-transform sätts
         någonsin här -- ingen perspective/rotateY/translateZ, ingen
         bildzoom, inget beskuret utsnitt under bytet. Målsidan (toSlide)
         tonas in OVANPÅ den nuvarande (z-index:2, se CSS), som ligger kvar
         orörd undertill tills bytet är klart -- ingen egen fade-out-
         animation behövs (den täcks helt, ingen synlig lucka). */
      function runTransitionFade(newIndex) {
        animating = true;
        var fromSlide = slides[index];
        var toSlide = slides[newIndex];

        toSlide.classList.add("nh-hero-fade-in");
        void toSlide.offsetWidth; // tvingad reflow, samma skäl som kub-varianten

        function finish() {
          toSlide.removeEventListener("transitionend", onEnd);
          clearTimeout(safetyTimer);
          fromSlide.classList.remove("is-front");
          // Utan detta ärver fromSlide fortfarande .nh-hero-slide{transition:
          // opacity 420ms} när den faller tillbaka till basreglens opacity:0
          // -- overskådligt när fromSlide råkar ligga FÖRE toSlide i DOM-
          // ordning (samma z-index, DOM-ordning avgör då stapling) blir det
          // osynligt (toSlide, redan fullt opak, täcker helt), men vid nästa
          // varv (motsatt riktning, fromSlide EFTER toSlide i DOM) skulle
          // fromSlide fortsätta synas ovanpå och tona ut i ytterligare
          // ~420ms -- en riktig "spöke ovanpå"-glitch. Nollställs instant,
          // samma mönster som kub-variantens egna transform-reset.
          fromSlide.style.transition = "none";
          void fromSlide.offsetWidth;
          fromSlide.style.transition = "";
          toSlide.classList.remove("nh-hero-fade-in");
          toSlide.classList.add("is-front");

          index = newIndex;
          updateDots();
          updateAriaHidden();
          animating = false;

          if (pendingStep) {
            var next = pendingStep; pendingStep = null;
            runTransition(next.newIndex, next.dir);
          }
        }
        function onEnd(e) {
          if (e.target !== toSlide || e.propertyName !== "opacity") return;
          finish();
        }
        toSlide.addEventListener("transitionend", onEnd);
        // Samma städningsprincip som kub-varianten: fastna aldrig permanent
        // i "animating" om transitionend av någon anledning uteblir.
        var safetyTimer = setTimeout(function () {
          toSlide.removeEventListener("transitionend", onEnd);
          finish();
        }, 550);
      }

      function runTransitionCube(newIndex, dir) {
        animating = true;

        var fromSlide = slides[index];
        var toSlide = slides[newIndex];

        // Placera målsidan på kubens sida INNAN kuben roterar, utan egen
        // transition (annars syns en extra "resa" till sidoläget som ett
        // ryck strax före själva kubrotationen).
        toSlide.style.transition = "none";
        toSlide.style.transform = "rotateY(" + (dir * 90) + "deg) translateZ(var(--cube-half))";
        toSlide.classList.add("is-target");
        void toSlide.offsetWidth; // tvingad reflow — se kommentaren ovan
        toSlide.style.transition = "";

        // Kuben ändrar ALDRIG .style.transform direkt -- basrotationen
        // (translateZ(-cube-half) rotateY(--cube-rot)) sitter i CSS (se
        // .nh-hero-cube, kub-korrigeringsrundan), JS sätter bara vinkeln.
        cube.style.setProperty("--cube-rot", "0deg");
        void cube.offsetWidth;
        cube.style.setProperty("--cube-rot", (-dir * 90) + "deg");

        function finish() {
          cube.removeEventListener("transitionend", onEnd);
          clearTimeout(safetyTimer);
          // Normalisera kubens EGEN rotation till 0 igen, UTAN transition —
          // se filkommentaren ovan ("rotorsak"/normalisering).
          cube.style.transition = "none";
          cube.style.setProperty("--cube-rot", "0deg");
          void cube.offsetWidth;
          cube.style.transition = "";

          fromSlide.classList.remove("is-front");
          fromSlide.style.transform = "";
          toSlide.classList.remove("is-target");
          toSlide.classList.add("is-front");
          toSlide.style.transform = "";

          index = newIndex;
          updateDots();
          updateAriaHidden();
          animating = false;

          if (pendingStep) {
            var next = pendingStep; pendingStep = null;
            runTransition(next.newIndex, next.dir);
          }
        }
        function onEnd(e) {
          if (e.target !== cube || e.propertyName !== "transform") return;
          finish();
        }
        cube.addEventListener("transitionend", onEnd);
        // Städning: om transitionend av någon anledning aldrig fyrar (dold
        // flik mitt i animationen, en webbläsarkant) ska karusellen ändå
        // aldrig fastna permanent låst i "animating".
        var safetyTimer = setTimeout(function () {
          cube.removeEventListener("transitionend", onEnd);
          finish();
        }, 900);
      }

      function goTo(newIndexRaw, dir) {
        var newIndex = ((newIndexRaw % total) + total) % total; // normaliserar korrekt oavsett hur långt/åt vilket håll man hoppar
        if (dir == null) dir = 1;
        runTransition(newIndex, dir);
      }

      function stopAutoplay() { if (autoplayTimer) { clearInterval(autoplayTimer); autoplayTimer = null; } }
      function startAutoplay() {
        if (reduceMotion || autoplayTimer) return;
        autoplayTimer = setInterval(function () { goTo(index + 1, 1); }, AUTOPLAY_MS);
      }
      // Paus är nu TIDSBEGRÄNSAD, inte permanent (uppdragets nya krav) --
      // varje ny interaktion skjuter bara upp återupptagandet ytterligare.
      function pauseForNow() { stopAutoplay(); if (resumeTimer) { clearTimeout(resumeTimer); resumeTimer = null; } }
      function scheduleResume() {
        if (resumeTimer) clearTimeout(resumeTimer);
        resumeTimer = setTimeout(function () {
          resumeTimer = null;
          if (!document.hidden) startAutoplay();
        }, RESUME_AFTER_MS);
      }
      function onManualInteraction() { pauseForNow(); scheduleResume(); }

      dots.forEach(function (d) {
        d.addEventListener("click", function () {
          var i = parseInt(d.getAttribute("data-i"), 10);
          onManualInteraction();
          goTo(i, i > index || (index === total - 1 && i === 0) ? 1 : -1);
        });
      });
      if (prevBtn) prevBtn.addEventListener("click", function () { onManualInteraction(); goTo(index - 1, -1); });
      if (nextBtn) nextBtn.addEventListener("click", function () { onManualInteraction(); goTo(index + 1, 1); });

      // Hover/fokus pausar TILLFÄLLIGT (inte permanent, se ovan).
      section.addEventListener("mouseenter", pauseForNow);
      section.addEventListener("mouseleave", scheduleResume);
      section.addEventListener("focusin", pauseForNow);
      section.addEventListener("focusout", scheduleResume);

      // Svep — pointer events (touch+mus i ett API), men navigering
      // triggas ENDAST när rörelsen är tydligt horisontell (se
      // filkommentaren ovan för varför). `touch-action:pan-y` i CSS
      // (.nh-hero-cube) säkerställer dessutom att webbläsaren ALDRIG
      // hindrar den native lodräta scrollen, oavsett vad JS gör här --
      // två oberoende skyddslager mot samma bugg.
      var startX = null, startY = null, dx = 0, dy = 0, dragging = false, horizLock = null;
      cube.addEventListener("pointerdown", function (e) {
        dragging = true; startX = e.clientX; startY = e.clientY; dx = 0; dy = 0; horizLock = null;
      });
      cube.addEventListener("pointermove", function (e) {
        if (!dragging) return;
        dx = e.clientX - startX;
        dy = e.clientY - startY;
        if (horizLock === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
          horizLock = Math.abs(dx) > Math.abs(dy);
          if (horizLock) onManualInteraction(); // räknas som avsiktlig interaktion FÖRST när riktningen är bekräftat horisontell
        }
      });
      function endDrag() {
        if (!dragging) return;
        dragging = false;
        if (horizLock && Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
        dx = 0; dy = 0; horizLock = null;
      }
      cube.addEventListener("pointerup", endDrag);
      cube.addEventListener("pointercancel", endDrag);
      cube.addEventListener("pointerleave", function () { if (dragging) endDrag(); });
      // Ren tap/tryck som aldrig blir en swipe räknas ändå som
      // touchinteraktion (uppdragets egen punkt, skilt från swipe-fallet
      // ovan) — pausar tillfälligt utan att navigera eller blockera klick
      // på riktiga länkar/knappar inuti slidet (ingen preventDefault
      // någonstans i denna funktion).
      cube.addEventListener("touchstart", onManualInteraction, { passive: true });

      // Tangentbord — höger/vänster pil när komponenten har fokus
      // (sektionen är tabindex="0" när >1 slide, se nhHeroHtml).
      section.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") { onManualInteraction(); goTo(index - 1, -1); }
        if (e.key === "ArrowRight") { onManualInteraction(); goTo(index + 1, 1); }
      });

      document.addEventListener("visibilitychange", function () {
        if (document.hidden) stopAutoplay();
        else if (!resumeTimer && !reduceMotion) startAutoplay();
      });

      updateDots();
      updateAriaHidden();
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
      // Magic Sauce: enda kortet med en godkänd, PRELIMINÄR v2-livsstilsbild
      // (desktop-parity-runda) -- riktig serie, riktig destination, bara
      // fotot är AI-genererat konceptmaterial i väntan på en riktig
      // Hazey-fotosession (se STATUS.md). Övriga fem serier behåller sina
      // redan etablerade, riktiga produktfoton -- INGEN av dem bytt mot
      // felaktiga v2-serier (Venice Vibes/Hash Culture/CBD & Chill fanns
      // aldrig som riktiga Hazey-serier och används inte här).
      // imgDesktop: PRELIMINÄR (desktop-parity-runda) -- se kommentaren
      // ovanför NH_PSER_CARDS. `img` (mobilens bild) OFÖRÄNDRAD.
      { name: "Magic Sauce", img: "series/magic-sauce.jpg", imgDesktop: "v2/series-magic-sauce-v2.jpg", imgPreliminary: true, serie: "Magic Sauce", liveCount: true },
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
      var allHref = "/sv/categories/alla-produkter";

      return '<section class="nh-pser section-gap" id="populara-serier">'
        + '  <div class="sec-head">'
        + '    <div><span class="nh-pser-kicker">Upptäck mer<svg class="nh-pser-kicker__sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.5 5.5l-2.1 2.1M7.6 16.4l-2.1 2.1M18.5 18.5l-2.1-2.1M7.6 7.6L5.5 5.5"/></svg></span>'
        + '    <h2>Populära serier</h2></div>'
        + '    <div class="nh-pser-controls"><a class="more" href="' + allHref + '">Visa alla serier →</a>'
        + '      <button type="button" class="nh-pser-nav nh-pser-nav--prev" aria-label="Föregående serier"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 4l-8 8 8 8"/></svg></button>'
        + '      <button type="button" class="nh-pser-nav nh-pser-nav--next" aria-label="Fler serier"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 4l8 8-8 8"/></svg></button>'
        + '    </div>'
        + '  </div>'
        + '  <div class="pser-row" id="nhPserRow">'
        + NH_PSER_CARDS.map(function (c) {
            var href = c.serie ? (serieHrefs[c.serie] || null) : (c.href || null);
            // Samma responsiva bildväxlingsmönster som heron (--hero-img-m/-d,
            // se nhHeroSlideHtml): mobilens bild ändras ALDRIG av en
            // eventuell desktop-only-bild (c.imgDesktop), ren CSS-växling,
            // ingen JS-omrendering vid breakpoint-byte.
            var mUrl = NH_ASSET_BASE + c.img;
            var dUrl = NH_ASSET_BASE + (c.imgDesktop || c.img);
            var avatar = '<span class="pser-avatar has-photo" style="--pser-img-m:url(\'' + mUrl.replace(/'/g, "\\'") + '\');--pser-img-d:url(\'' + dUrl.replace(/'/g, "\\'") + '\')"></span>';
            var countAttr = (c.liveCount && href) ? ' data-count-href="' + href + '"' : "";
            // KORRIGERAT (Desktop correction pass 2026-09-09): "Preliminär
            // bild" renderades tidigare som en kundsynlig badge -- flaggat
            // explicit ("får inte visas i det publika kortet"). c.imgPreliminary
            // behålls som INTERN status i datan (Magic Sauce-kortet ovan)
            // för att komma ihåg att bilden ska ersättas med riktig Hazey-
            // fotografering, men bygger inte längre någon synlig badge.
            var inner = avatar
              + '<span class="pser-name">' + c.name + '</span>'
              + '<span class="pser-n"></span>';
            // Utan riktig destination (THCaB/THCbA/D10 i dag): rendera ett
            // semantiskt icke-klickbart kort med SAMMA visuella markup --
            // aldrig href="#", tom sträng eller en irrelevant kategori.
            return href
              ? '<a class="pser-item" href="' + href + '"' + countAttr + '>' + inner + '</a>'
              : '<div class="pser-item pser-item--soon" aria-disabled="true">' + inner + '</div>';
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

    /* BUGGFYND (Fas 6, mätbar desktop-paritetsrunda -- funktionell
       verifiering): `.nh-pser-nav--prev`/`--next` (pilknapparna vid
       "Populära serier", se nhPopularaSerierHtml) renderades i markupen
       men hade ALDRIG en click-lyssnare som skrollade #nhPserRow --
       verifierat live (scrollLeft oförändrat 0 efter klick, trots att
       raden faktiskt har overflow, scrollWidth 1931 > clientWidth 1280
       vid 1440px). Två helt döda knappar. Skrollar nu ett kort+gap åt
       gången, samma smooth-scroll-mönster som .pser-row redan har
       (scroll-snap-type:x proximity, se css/22-homepage-v2.css). */
    function nhInitPserNav(root) {
      var row = root.querySelector("#nhPserRow");
      if (!row || row.__nhPserNav) return;
      row.__nhPserNav = true;
      var prevBtn = root.querySelector(".nh-pser-nav--prev");
      var nextBtn = root.querySelector(".nh-pser-nav--next");
      if (!prevBtn && !nextBtn) return;

      function step() {
        var item = row.querySelector(".pser-item");
        if (!item) return row.clientWidth * 0.8;
        var style = getComputedStyle(row);
        var gap = parseFloat(style.columnGap || style.gap || "0") || 0;
        return item.getBoundingClientRect().width + gap;
      }
      function updateDisabled() {
        var max = row.scrollWidth - row.clientWidth - 1;
        if (prevBtn) prevBtn.disabled = row.scrollLeft <= 0;
        if (nextBtn) nextBtn.disabled = row.scrollLeft >= max;
      }
      if (prevBtn) prevBtn.addEventListener("click", function () {
        row.scrollBy({ left: -step(), behavior: "smooth" });
      });
      if (nextBtn) nextBtn.addEventListener("click", function () {
        row.scrollBy({ left: step(), behavior: "smooth" });
      });
      row.addEventListener("scroll", function () {
        if (!row.__nhPserNavTicking) {
          row.__nhPserNavTicking = true;
          requestAnimationFrame(function () { row.__nhPserNavTicking = false; updateDisabled(); });
        }
      }, { passive: true });
      updateDisabled();
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
            return '<a class="route visual has-photo' + iconCls + '" href="' + c.href + '"' + bg + '>'
              + iconHtml
              + '<div class="route-kicker">' + c.kicker + '</div><h3>' + c.label + '</h3>'
              + '<p class="route-sub">' + c.sub + '</p></a>';
          }).join("")
        + '  </div>'
        + '  <p class="seg-note">Vill du hellre utgå från hur produkten är framställd?</p>'
        + '  <div class="seg">'
        + framCards.map(function (c) {
            return '<a class="seg-btn" href="' + framHref + '">'
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
    /* ── "Good People Higher Moments" — fullbredds redaktionellt
       rytmbrott (desktop-parity-runda, NY sektion, finns inte sen
       tidigare). Bilden (editorial-bonfire-good-people-v2.jpg) är
       PRELIMINÄR redaktionell livsstilsbild (inga produkter, inga
       handelspåståenden avbildade) -- godkänd för denna omgång, se
       STATUS.md. Ingen riktig "vår story"-sida finns ännu på sajten
       (uttömmande sökt i footerns riktiga länkar) -- CTA:n pekar därför
       till en riktig, redan etablerad destination (alla-produkter)
       med en text som ärligt beskriver VAD den faktiskt leder till,
       i stället för att hitta på en story-sida eller använda href="#".
       Endast synlig på desktop (>=861px): en HELT NY sektion får inte
       ändra mobilens komposition, se uppdragets uttryckliga förbud --
       innehållet ligger ändå kvar i initial DOM (riktig text, riktig
       länk), bara visuellt dold under 861px via CSS. */
    function nhBonfireHtml() {
      return '<section class="nh-bonfire section-gap" id="nh-bonfire" aria-hidden="false">'
        + '  <div class="nh-bonfire-scrim"></div>'
        + '  <div class="nh-bonfire-copy">'
        + '    <h2>Mer än bara produkter.</h2>'
        + '    <p>En gemenskap byggd på bra vibbar, bättre val och en ljusare morgondag.</p>'
        + '    <a class="nh-bonfire-cta" href="/sv/categories/alla-produkter">Utforska sortimentet →</a>'
        + '  </div>'
        + '</section>';
    }

    function nhTrustBlockHtml() {
      var stepIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>';
      // Ikoner: rent dekorativa (samma redan etablerade linjeikon-språk
      // som resten av filen, stroke="currentColor") -- visas ENDAST i den
      // kompakta desktop-raden (css), mobilens redan godkända numrerade
      // vy (.nh-tb-step__n) är helt oförändrad.
      var steps = [
        { n: "01", title: "Kurerat sortiment", text: "Vi säljer endast cannabinoider som är lagliga i Sverige.",
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>' },
        { n: "02", title: "Tydligt innehåll", text: "Innehåll och styrka anges på varje produktsida, analyscertifikat där de finns.",
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 3h8l4 4v14H7z"/><path d="M9 11h6M9 15h6"/></svg>' },
        { n: "03", title: "Diskret paketerat", text: "Neutral avsändare, spårbar leverans från Sverige — aldrig gränsöverskridande.",
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/></svg>' },
        { n: "04", title: "Snabb leverans", text: "Normalt inom 1–2 vardagar.",
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6z"/><path d="M12 8v5l3 2"/></svg>' }
      ];
      // Femte, desktop-KOMPAKTA raden (uppdragets krav: "läsa som EN
      // sammanhållen desktoprad", inte fem separata kort) -- SAMMA redan
      // verifierade Trustpilot-värde som mikrotrust-raden och Verifierade
      // omdömen (4,7/5), ingen ny siffra. `nh-tb-step--desktop-only` döljs
      // helt under 861px (se css) så mobilens 4-stegslista förblir OFÖRÄNDRAD
      // -- elementet ligger kvar i initial DOM (riktig text), bara visuellt
      // dolt, inte en synlig mobil-regression.
      var trustpilotStep = '<div class="nh-tb-step nh-tb-step--desktop-only"><span class="nh-tb-step__ico"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.6 7.9H23l-6.7 4.9 2.6 7.9L12 17.8 5.1 22.7l2.6-7.9L1 9.9h8.4z"/></svg></span>'
        + '<div><h3>Trustpilot 4,7/5</h3><p>584 verifierade omdömen</p></div></div>';
      return '<section class="nh-trustblock section-gap">'
        + '  <div class="nh-tb-inner">'
        + '    <h2>Så arbetar Hazey med innehåll och ursprung</h2>'
        + '    <p>Vi är öppna med vad som finns i våra produkter och var de kommer ifrån — inga effektlöften, bara verifierbara fakta.</p>'
        + '    <div class="nh-tb-steps">'
        + steps.map(function (s) {
            return '<div class="nh-tb-step"><span class="nh-tb-step__n">' + s.n + '</span>'
              + '<span class="nh-tb-step__ico">' + s.icon + '</span>'
              + '<div><h3>' + s.title + '</h3><p>' + s.text + '</p></div></div>';
          }).join("")
        + trustpilotStep
        + '    </div>'
        + '    <div class="nh-tb-foot">'
        + '      <span>Leveransgaranti — försvinner paketet skickar vi ett nytt · Svenskt bolag, sedan 2020</span>'
        + '      <a class="nh-tb-link" href="/sv/page/kop-och-leveransvillkor">'
        + '        ' + stepIcon
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
          // Korten finns inte i DOM:en förrän nu (asynkront hämtade) --
          // den första scanScrollReveal(document) vid sidladdning kunde
          // alltså aldrig se dem. Kör om samma sökning, scopad till just
          // denna rad: sektionen själv är redan armerad sen tidigare
          // (no-op via revealSeen), men fadeInImages hittar nu de riktiga
          // <img>-taggarna och kan fada in dem vid behov.
          scanScrollReveal(rowEl.parentNode);
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
      // Riktig serietillhörighet (verifierad -- produkten är en Magic
      // Sauce-vape, se productHref/JSON-LD), inte en fabricerad rubrik --
      // används för desktopens H2 ("Magic Sauce är i lager."/"...snart
      // tillbaka i lager.", se nhInitSpotlight) OCH CTA-texten
      // ("Köp Magic Sauce →"), båda härledda, ingen hårdkodad SKU-text.
      seriesLabel: "Magic Sauce",
      rationale: "En av våra mest populära Magic Sauce-produkter — engångsvape, redo direkt ur förpackningen.",
      secondaryLabel: "Se hela Magic Sauce-sortimentet →",
      secondaryHref: "/sv/categories/magic-sauce"
    };
    function nhSpotlightHtml() {
      if (!NH_SPOTLIGHT.active || !NH_SPOTLIGHT.productHref) return "";
      // KORRIGERINGSRUNDA (2026-09-10, Vilmer jämförde direkt mot en ny
      // referensbild och flaggade stor avvikelse i typsnitt/text/bild-
      // format/CTA): .nh-spotlight-backdrop fyller nu HELA kortet (inte
      // en 33%-kolumn) -- .nh-spotlight-body ligger som en separat,
      // diagonalt avskuren kräm-panel OVANPÅ fotot (se css, clip-path),
      // exakt referensens komposition, i stället för en 50/50- eller
      // 67/33-sida-vid-sida-delning. Typ/pris/lager/betyg
      // (#nhSpotlightType/#nhSpotlightMeta) är KVAR i DOM:en med samma
      // riktiga data som förut -- bara visuellt dolda på desktop (css),
      // eftersom referensen inte visar den raden alls på den här
      // kortstilen. Mobilen (#nhSpotlightImg + typ/pris/lager/betyg)
      // är HELT oförändrad. */
      return '<section class="nh-spotlight section-gap" id="nh-spotlight">'
        + '  <div class="nh-spotlight-inner">'
        + '    <div class="nh-spotlight-media">'
        + '      <div class="nh-spotlight-backdrop" style="background-image:url(\'' + NH_ASSET_BASE + 'v2/feature-magic-sauce-higher-things-v2.jpg\')" aria-hidden="true"></div>'
        + '      <div class="nh-spotlight-img" id="nhSpotlightImg"></div>'
        + '    </div>'
        + '    <div class="nh-spotlight-body">'
        + '      <div class="nh-spotlight-kicker">Featured</div>'
        + '      <p class="nh-spotlight-type" id="nhSpotlightType"></p>'
        + '      <h2 id="nhSpotlightName">Laddar…</h2>'
        // Desktop-ENDA rubrik (se css: visas i stället för #nhSpotlightName
        // på desktop, tvärtom på mobil) -- kort lagerstatusrad, se
        // motivering vid NH_SPOTLIGHT.seriesLabel ovan och nhInitSpotlight.
        + '      <h2 id="nhSpotlightHeadline" class="nh-spotlight-headline">Laddar…</h2>'
        + '      <p class="nh-spotlight-rationale">' + NH_SPOTLIGHT.rationale + '</p>'
        + '      <div class="nh-spotlight-meta" id="nhSpotlightMeta"></div>'
        + '      <div class="nh-spotlight-cta">'
        + '        <a class="btn-solid" id="nhSpotlightBuy" href="' + NH_SPOTLIGHT.productHref + '">'
        + '          <span id="nhSpotlightBuyLabel">Köp ' + NH_SPOTLIGHT.seriesLabel + '</span>'
        + '          <span aria-hidden="true">→</span>'
        + '        </a>'
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
          // Mobil: OFÖRÄNDRAD, visar fortfarande den riktiga fullständiga
          // SKU-titeln (t.ex. "Vape - Magic Sauce 99% - 2ml").
          section.querySelector("#nhSpotlightName").textContent = data.name || "";
          // Desktop (2026-09-10, matchar referensbildens rubrikstil): en
          // kort, ärlig lagerstatusrad ("Magic Sauce är i lager."/"...snart
          // tillbaka i lager.") i stället för SKU-titeln -- HELT härlett
          // av samma riktiga `inStock`-fält som redan beräknas ovan (live
          // JSON-LD), ingen hårdkodad påstådd lagerstatus. Se css för
          // vilken av de två <h2>-raderna som visas var.
          section.querySelector("#nhSpotlightHeadline").textContent = NH_SPOTLIGHT.seriesLabel
            + (inStock ? " är i lager." : " är snart tillbaka i lager.");
          section.querySelector("#nhSpotlightType").textContent = [typeLabel, brand].filter(Boolean).join(" · ");
          var rating = data.aggregateRating;
          var ratingHtml = (rating && rating.ratingValue && rating.reviewCount)
            ? '<span class="nh-spotlight-rating">★ ' + Number(rating.ratingValue).toFixed(1).replace(".", ",") + ' <span>(' + rating.reviewCount + ')</span></span>'
            : "";
          section.querySelector("#nhSpotlightMeta").innerHTML = ''
            + '<span class="nh-spotlight-price">' + ((data.offers || {}).price ? data.offers.price + " kr" : "") + '</span>'
            + '<span class="nh-spotlight-stock' + (inStock ? "" : " is-out") + '">' + (inStock ? "I lager" : "Slut i lager") + '</span>'
            + ratingHtml;
          // Bilden sattes just NU (asynkront) -- fadeInBackgroundImages
          // hoppade över detta element vid boot (ingen bild fanns då att
          // förladda). Körs om, scopat till sektionen.
          fadeInBackgroundImages(section);
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
    /* KORRIGERINGSRUNDA (2026-09-08, hazey-commerce-design-skillen, REDESIGN
       av just denna sektion -- se `agent-skills/hazey-commerce-design/`):
       den tidigare tvåkorts-versionen (två höjdlika kort, "Kategori"/
       "Support"-pillar, smala textkolumner) hade INGEN riktig hierarki --
       en produktupptäcktsdestination (THCA) och en supportdestination
       (FAQ) behandlades som visuellt likvärdiga, vilket uppdraget
       uttryckligen pekade ut som fel ("om två innehållsspår inte förtjänar
       två likvärdiga kort ska de inte behandlas likvärdigt"). Ombyggd till
       EN dominant, fotografisk "feature"-yta (THCA -- den riktiga
       sortimentsdestinationen, samma live-hämtade produktbild som förut,
       se nhInitGuides) + EN tyst, sekundär "vidare läsning"-modul på sidans
       egna varma botten (FAQ-länken + den redan befintliga hopfällda
       SEO-texten, båda som rader i SAMMA yta i stället för ett eget kort
       vardera) -- riktig prioritering, inte två identiska vita rutor.
       Bildbehandling (verifierat, inte gissat, se STATUS.md): den riktiga
       THCA-bilden är en transparent produktbeskärning (bud + prisetikett,
       vitt/genomskinligt fält, plattformens vattenstämpel) -- INTE ett
       fullramat lifestylefoto. En background-size:cover-fullbleed-
       behandling (första försöket denna omgång) klippte etikettens hörn
       mot kortets egen rundning och lutade sig på att transparensen råkade
       visa kortets mörka bakgrundsfärg i stället för ett avsiktligt fält.
       Samma redan beprövade mönster som Spotlight (.nh-spotlight-img,
       background-size:contain + varm radial glow bakom en flytande
       produktbild) återanvänds i stället -- produkten "flyter" i ett eget
       varmt ljusfält, texten ligger i ett eget stycke UNDER (inte bakat
       ovanpå fotot), robust mot en framtida annan produktbild oavsett dess
       komposition.

       Ingen ny/fabricerad destination: exakt samma två riktiga länkar och
       exakt samma redan godkända copy som innan, bara omstrukturerade. */
    function nhGuidesHtml(navData) {
      var thcaHref = (navData.bySlug && navData.bySlug["thca"]) || "/sv/categories/thca";
      return '<section class="nh-guides section-gap" id="nh-guides">'
        + '  <div class="sec-head"><div><h2>Guider &amp; aktuellt</h2>'
        + '  <p>Läs mer innan du handlar — samlat på ett ställe.</p></div></div>'
        + '  <div class="nh-guides-layout">'
        + '    <a class="nh-guide-feature" href="' + thcaHref + '" data-photo-href="' + thcaHref + '">'
        + '      <span class="nh-guide-feature__media"><span class="nh-guide-feature__photo"></span></span>'
        + '      <span class="nh-guide-feature__body">'
        + '        <span class="nh-guide-feature__kicker">Sortiment</span>'
        + '        <h3>THCA</h3>'
        + '        <p>Bläddra hela vårt THCA-sortiment — vapes, buds och information om vad som gäller i Sverige.</p>'
        + '        <span class="nh-guide-cta">Till THCA-sortimentet →</span>'
        + '      </span>'
        + '    </a>'
        + '    <div class="nh-guide-aside">'
        + '      <a class="nh-guide-faq" href="/sv/page/faq">'
        + '        <svg class="nh-guide-faq__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 0 1 4.6-1.35c.4.6.4 1.4 0 2A2.5 2.5 0 0 1 12 12v1"/><circle cx="12" cy="16.3" r=".1" fill="currentColor" stroke-width="1.5"/></svg>'
        + '        <span class="nh-guide-faq__body">'
        + '          <span class="nh-guide-faq__title">Vanliga frågor</span>'
        + '          <span class="nh-guide-faq__text">Svar på det som frågas mest om beställning, leverans och lagstatus.</span>'
        + '        </span>'
        + '        <span class="nh-guide-faq__arrow" aria-hidden="true">→</span>'
        + '      </a>'
        + '      <details class="nh-guide-legacy" id="nhGuideLegacy">'
        + '        <summary>Mer om vårt sortiment</summary>'
        + '        <div class="nh-guide-legacy-body" id="nhGuideLegacyBody"></div>'
        + '      </details>'
        + '    </div>'
        + '  </div>'
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
      var photoCard = document.querySelector(".nh-guide-feature[data-photo-href]");
      if (photoCard) {
        fetch(photoCard.getAttribute("data-photo-href"), { credentials: "same-origin" })
          .then(function (r) { return r.ok ? r.text() : ""; })
          .then(function (html) {
            if (!html) return;
            var doc = new DOMParser().parseFromString(html, "text/html");
            var img = doc.querySelector(".product-card__image img");
            var src = img ? (img.getAttribute("src") || img.getAttribute("data-src")) : null;
            if (!src) return;
            var photoEl = photoCard.querySelector(".nh-guide-feature__photo");
            if (photoEl) photoEl.style.backgroundImage = "url('" + src + "')";
            // Bilden sattes just NU (asynkront) -- samma efterhandskörning
            // som Spotlight ovan, se den kommentaren.
            fadeInBackgroundImages(photoCard);
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
            var cls = "g-card" + (c.href ? "" : " g-card--soon");
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
      // KORRIGERINGSRUNDA (2026-09-10): .nh-reviews-editorial ÅTERSTÄLLD
      // till den ORIGINALA, redan godkända redaktionella stämningsbilden
      // (editorial-venice-good-idea-v2.jpg) -- föregående runda bytte
      // felaktigt till Spotlightens Magic Sauce-bild i ett försök att
      // skapa "en sammanhängande bild genom båda sektionerna", vilket
      // Vilmer INTE bett om ("förrförrförra prompten... bilden var
      // identisk innan"). Ingen produkt/påstående avbildas, bara
      // stämning, precis som ursprungligen.
      //
      // Ny sammanfattningsrad (stjärnor + "X av 5" + "Y verifierade
      // omdömen") och en separat "Läs alla omdömen"-länk + föregående/
      // nästa-knappar (matchar en ny referensbild 1:1, se css) -- alla
      // tre värden är RIKTIGA, live-hämtade Trustpilot-tal
      // (nhInitReviewsLive), samma datakälla som förut, bara omstylad.
      // Föregående/nästa styr en RIKTIG paginering genom flera riktiga
      // produktomdömen (se nhInitProductReviews) -- inte dekorativa
      // knappar, se motivering där.
      return '<section class="nh-reviews section-gap">'
        + '  <div class="nh-reviews-layout">'
        + '    <div class="nh-reviews-main">'
        + '      <div class="sec-head">'
        + '        <div><p class="nh-reviews-kicker">Äkta röster</p><h2>Verifierade omdömen</h2></div>'
        + '        <div class="nh-reviews-controls">'
        + '          <a class="nh-reviews-readall" href="https://www.trustpilot.com/review/hazey.se" target="_blank" rel="noopener">Läs alla omdömen →</a>'
        + '          <div class="nh-reviews-nav" id="nhReviewsNav" hidden>'
        + '            <button type="button" class="nh-reviews-nav__btn" id="nhReviewsPrev" aria-label="Föregående omdömen">‹</button>'
        + '            <button type="button" class="nh-reviews-nav__btn" id="nhReviewsNext" aria-label="Nästa omdömen">›</button>'
        + '          </div>'
        + '        </div>'
        + '      </div>'
        + '      <div class="nh-reviews-summary">'
        + '        <span class="nh-reviews-stars" aria-hidden="true"><span class="nh-reviews-stars__bg">★★★★★</span><span class="nh-reviews-stars__fg" id="nhReviewsStarsFg" style="width:94%">★★★★★</span></span>'
        + '        <span class="nh-reviews-score" id="nhReviewsScore">4,7 av 5</span>'
        + '        <p class="nh-reviews-count" id="nhReviewsCount">584 verifierade omdömen</p>'
        + '      </div>'
        + '      <div class="nh-reviews-grid" id="nhReviewsGrid" hidden data-status="ingen-verifierad-recensionskalla-an"></div>'
        + '    </div>'
        + '    <div class="nh-reviews-editorial" style="background-image:url(\'' + NH_ASSET_BASE + 'v2/editorial-venice-good-idea-v2.jpg\')" aria-hidden="true"></div>'
        + '  </div>'
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
      // KORRIGERINGSRUNDA (2026-09-10): tidigare togs bara EN recension
      // per produkt (pick[0]), max 2 kort totalt. Referensbilden visar
      // 3 kort + en fungerande föregående/nästa-paginering -- verifierat
      // via curl (2026-09-10) att BÅDA produkterna har FLERA säkra
      // recensioner var (CCELL M4: "Krille"+"Tobias" godkänns av filtret
      // nedan, CCELL M3 Plus: "O"+"Jonte"+"Fred Winters"+"Erik"), så
      // fler riktiga kort går att visa utan att hitta på något -- bara
      // filtrets `pick[0]`-begränsning togs bort, samma säkerhetsfilter
      // (icke-anonym, 12-170 tecken, inget rus-/effektspråk) gäller
      // oförändrat för VARJE recension, inte bara den första.
      Promise.all(NH_REVIEW_PRODUCTS.map(function (p) {
        return fetch(p.href, { credentials: "same-origin" })
          .then(function (r) { return r.ok ? r.text() : ""; })
          .then(function (html) {
            if (!html) return [];
            var m = html.match(/:reviews="(\[.*?\])"/);
            if (!m) return [];
            var list;
            try { list = JSON.parse(decodeEntities(m[1])); } catch (e) { return []; }
            return list.filter(function (r) {
              return !r.anonymous && r.review && r.review.length >= 12 && r.review.length <= 170
                && !NH_REVIEW_UNSAFE_RE.test(r.review);
            }).map(function (r) {
              return { name: r.name, text: r.review, stars: r.rating, product: p.name, href: p.href };
            });
          })
          .catch(function () { return []; });
      })).then(function (perProduct) {
        // Round-robin-interfoliera produkterna (samma "variation mellan
        // produkter"-avsikt som redan fanns) i stället för att gruppera
        // en produkt i taget.
        var queues = perProduct.map(function (list) { return list.slice(); });
        var real = [];
        var more = true;
        while (more) {
          more = false;
          queues.forEach(function (q) { if (q.length) { real.push(q.shift()); more = true; } });
        }
        if (!real.length) return; // ingen ändring -- grid förblir dold, sammanfattningsraden ovan är redan sann

        var PAGE_SIZE = 3;
        var pages = [];
        for (var i = 0; i < real.length; i += PAGE_SIZE) pages.push(real.slice(i, i + PAGE_SIZE));
        var pageIndex = 0;

        function renderPage() {
          // Medvetet INGEN .nh-reveal-klass här (samma beslut som redan
          // gäller Bästsäljare-korten, nhInitBestsellers): nhInitReveal
          // skannar bara EN gång vid boot, långt innan dessa asynkront
          // hämtade/ombytta kort finns i DOM:en -- ett .nh-reveal-kort
          // som aldrig observeras stannar permanent osynligt.
          grid.innerHTML = pages[pageIndex].map(function (r) {
            var starsHtml = '<span class="nh-rc-stars" aria-hidden="true">' + "★".repeat(r.stars) + "☆".repeat(5 - r.stars) + '</span>';
            return '<div class="nh-rc-card">'
              + starsHtml
              + '<p class="nh-rc-quote">”' + r.text.replace(/</g, "&lt;") + '”</p>'
              + '<div class="nh-rc-source"><span class="nh-rc-name">' + r.name.replace(/</g, "&lt;") + '</span>'
              + '<a href="' + r.href + '">' + r.product + '</a></div>'
              + '</div>';
          }).join("");
          grid.hidden = false;
        }
        renderPage();

        var nav = root.querySelector("#nhReviewsNav");
        if (pages.length > 1 && nav) {
          nav.hidden = false;
          var prevBtn = root.querySelector("#nhReviewsPrev");
          var nextBtn = root.querySelector("#nhReviewsNext");
          if (nextBtn) nextBtn.addEventListener("click", function () { pageIndex = (pageIndex + 1) % pages.length; renderPage(); });
          if (prevBtn) prevBtn.addEventListener("click", function () { pageIndex = (pageIndex - 1 + pages.length) % pages.length; renderPage(); });
        }
      });
    }
    /* Hämtar det RIKTIGA, live TrustScore + antal omdömen från Trustpilots
       egen publika data-endpoint (samma som deras bootstrap-widget redan
       anropar) — ingen nyckel, inget konto, ingen scraping av HTML. Vid
       fel/oväntat svar rörs texten INTE (den redan sanna statiska raden
       ligger kvar som fallback). */
    function nhInitReviewsLive(root) {
      var scoreEl = root.querySelector("#nhReviewsScore");
      var countEl = root.querySelector("#nhReviewsCount");
      var starsFg = root.querySelector("#nhReviewsStarsFg");
      if (!scoreEl || !countEl) return;
      var url = "https://widget.trustpilot.com/trustbox-data/" + NH_TRUSTPILOT_TEMPLATE_ID
        + "?businessUnitId=" + NH_TRUSTPILOT_BUSINESS_UNIT_ID + "&locale=sv-SE";
      fetch(url)
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (data) {
          var bu = data && data.businessUnit;
          var total = bu && bu.numberOfReviews && bu.numberOfReviews.total;
          if (!bu || !bu.trustScore || !total) return; // oväntat svar — behåll den sanna fallback-texten/bredden
          var score = Number(bu.trustScore);
          scoreEl.textContent = String(score).replace(".", ",") + " av 5";
          countEl.textContent = total.toLocaleString("sv-SE") + " verifierade omdömen";
          if (starsFg) starsFg.style.width = Math.max(0, Math.min(100, (score / 5) * 100)) + "%";
        })
        .catch(function () { /* nätverksfel — den redan sanna statiska texten/bredden ligger kvar oförändrad */ });
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

    /* ---------- Scroll-reveal ("premiumkänsla" vid scroll) ----------
       PORTAT (2026-09-09) från det redan beprövade, uttryckligen utpekade
       facit-systemet:
       /Users/wahlberg/HZY/chatgpt-claude-handover/CLAUDE-HANDOFF-2026-08-17/
       prototyp/index.html — samma funktionsnamn (armReveal/scanScrollReveal/
       cleanUpReveal/revealPassedElements/fadeInImages), samma klassnamn
       (.pre-reveal/.in-view/.img-fade/.is-loaded), samma säkerhetsprinciper
       och samma mätta värden (24px/620ms, se .pre-reveal i css/22). Bara
       SELEKTORERNA är anpassade till tema 6:s riktiga DOM — logiken är
       oförändrad från facit.

       Progressiv förbättring: vi lägger själva .pre-reveal-klassen på med
       JS, precis innan vi börjar observera elementet. Om något går fel
       innan dess (skriptfel, gammal webbläsare utan IntersectionObserver)
       har elementet aldrig fått klassen och är redan synligt — inget kan
       fastna osynligt. Varje element avslöjas bara en gång (unobserve
       direkt efter), så man inte kan få saker att blinka ut och in genom
       att scrolla upp och ner. */
    var revealSeen = (typeof WeakSet !== "undefined") ? new WeakSet() : null;
    function nhPrefersReducedMotion() {
      return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    }
    var revealIO = (!nhPrefersReducedMotion() && "IntersectionObserver" in window)
      ? new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              revealIO.unobserve(entry.target);
              cleanUpReveal(entry.target);
            }
          });
        }, { threshold: 0.01, rootMargin: "0px 0px 60px 0px" })
      : null;

    /* Städa bort reveal-spåren när intoningen är klar. INTE kosmetiskt:
       .pre-reveal sätter will-change:opacity,transform, vilket lyfter
       elementet till ett eget kompositorlager — ligger det kvar på många
       kort/sektioner kostar det onödigt minne/GPU-lager. revealSeen
       säkerställer att elementet inte kan bli re-armat efteråt. */
    function cleanUpReveal(el) {
      var delay = parseFloat(el.style.transitionDelay) || 0; // "90ms" -> 90
      setTimeout(function () {
        el.classList.remove("pre-reveal", "in-view");
        el.style.transitionDelay = "";
      }, 620 + delay + 140);
    }

    function armReveal(el, staggerIndex) {
      if (!el || (revealSeen && revealSeen.has(el))) return;
      if (revealSeen) revealSeen.add(el);
      if (!revealIO) return; // reducerad rörelse eller ingen IO-support: lämna som den är, redan synlig
      el.classList.add("pre-reveal");
      // 90ms trappsteg, max 4 steg — utan kap får en sektion med många
      // kort nästan två sekunder innan sista kortet syns.
      if (staggerIndex) el.style.transitionDelay = (Math.min(staggerIndex, 4) * 90) + "ms";
      revealIO.observe(el);
      // KORRIGERINGSRUNDA (2026-09-XX): en tidigare version hade här en
      // GLOBAL 2,2s-timer som tvingade fram `.in-view` på varje element
      // oavsett skrollposition. Det var fel och är borttaget -- Vilmer
      // rapporterade korrekt att det gjorde att hela sidan redan var
      // "inladdad"/synlig innan han hann scrolla dit, så reveal-effekten
      // aldrig syntes vid en riktig besökares faktiska scroll. Ingen
      // ersättningstimer läggs till: `revealPassedElements()` (se nedan)
      // körs redan dels EN gång direkt efter arming (fångar sånt som
      // faktiskt redan ligger i första vyn vid sidladdning), dels vid
      // varje scroll-event (fångar snabbt passerade element) -- det är
      // den avsedda, riktiga "genuine failure"-vägen ut om
      // IntersectionObserver av någon anledning aldrig rapporterar ett
      // visst element, INTE en gemensam kort timer som avslöjar hela
      // sidan i förväg.
    }

    function scanScrollReveal(root) {
      root = root || document;
      // Hela sektioner/block tonar in som helhet. `.section-gap` täcker
      // redan Populära serier/vägar, Bästsäljare, Spotlight, Transparens/
      // leverans, Snabb koll, Guider & aktuellt, Omdömen och Nyhetsbrev
      // (alla våra egna sektioner delar redan den klassen) — `.nh-faq`
      // läggs till separat (äldre komponent, delar inte .section-gap).
      var blocks = root.querySelectorAll(".section-gap, .nh-faq");
      Array.prototype.forEach.call(blocks, function (el) { armReveal(el); });

      // Kort i rader/grids tonar in i en lätt kaskad.
      var groups = root.querySelectorAll(
        /* .nh-guides-grid borttagen (redesign-runda 2026-09-08, se
           nhGuidesHtml) -- den nya "Guider & aktuellt"-kompositionen är en
           asymmetrisk feature+aside-yta, inte en upprepad lista/rutnät, så
           barn-stagger hör inte hemma där (motion-regeln: stagger bara på
           riktiga listor/rutnät). Hela sektionen tonar ändå in som helhet
           via .section-gap ovan. */
        ".pser-row, .nh-featured-row, .routes-grid, .guide-grid, .nh-tb-steps, .nh-reviews-grid"
      );
      Array.prototype.forEach.call(groups, function (group) {
        /* Animera ALDRIG barnen inuti en vågrät scroller (Populära serier/
           Bästsäljare/Omdömen på mobil) — verifierat beteende: kör man
           transform på korten inuti en scroll-snap-container slutar
           containern släppa igenom LODRÄTA svep till sidan. Villkoret
           läses ur elementet i stället för att lista selektorer, eftersom
           exakt samma rad är en scroller i mobilbredd men ett vanligt
           rutnät på desktop (overflow-x blir visible där) — sektionen
           runt omkring tonar fortfarande in som helhet ovan, så effekten
           försvinner inte, den blir bara ett block i stället för en
           korthaskad. */
        var gcs = getComputedStyle(group);
        var isHorizScroller = (group.scrollWidth > group.clientWidth + 2) && /auto|scroll/.test(gcs.overflowX);
        if (isHorizScroller) return;
        Array.prototype.forEach.call(group.children, function (child, i) { armReveal(child, i); });
      });

      fadeInImages(root);
      fadeInBackgroundImages(root);
      requestAnimationFrame(revealPassedElements);
    }

    /* Ett snabbt trackpad-/PageDown-hopp kan passera ett helt observerat
       block mellan två bildrutor — då hann IntersectionObserver aldrig
       rapportera skärningen och blocket låg osynligt ovanför vyn. Den här
       billiga sweepen visar både det som redan passerats och det som
       faktiskt ligger i vyn. */
    var revealSweepQueued = false;
    function revealPassedElements() {
      revealSweepQueued = false;
      document.querySelectorAll(".pre-reveal:not(.in-view)").forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < 0 || (r.top < window.innerHeight * .96 && r.bottom > 0)) {
          el.classList.add("in-view");
          if (revealIO) revealIO.unobserve(el);
          cleanUpReveal(el);
        }
      });
    }
    window.addEventListener("scroll", function () {
      if (revealSweepQueued) return;
      revealSweepQueued = true;
      requestAnimationFrame(revealPassedElements);
    }, { passive: true });

    /* Bildintoning (riktiga <img>-taggar) — samma failsafe-ordning som
       facit: bilder som redan är klara (cache) får ALDRIG klassen alls,
       och både load OCH error markerar som klar, så en trasig bild aldrig
       kan fastna osynlig. Täcker Bästsäljare-kortens riktiga, klonade
       <img>-taggar (produktfoton). */
    function fadeInImages(root) {
      if (nhPrefersReducedMotion()) return;
      var imgs = (root || document).querySelectorAll(".nh-featured-row img, .pser-item img");
      Array.prototype.forEach.call(imgs, function (img) {
        if (img.getAttribute("data-fade-bound")) return;
        img.setAttribute("data-fade-bound", "1");
        if (img.complete && img.naturalWidth) return; // redan hämtad: visa direkt, ingen fade
        img.classList.add("img-fade");
        var done = function () { img.classList.add("is-loaded"); };
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      });
    }

    /* Bildintoning, ANPASSAD för CSS-bakgrundsbilder (nödvändig avvikelse
       från facits <img>-baserade fadeInImages, se slutrapporten: flera av
       våra bilder — seriekort, Populära vägar, Spotlight, Guider-kortet —
       är CSS background-image, inte <img>-taggar, och har därför ingen
       inbyggd load/error-händelse att lyssna på). Samma säkerhetsprincip
       återskapas ändå exakt: en osynlig, frånkopplad Image() förladdar
       SAMMA url som redan står i background-image, och load/error (båda)
       utlöser fadet — en bild kan alltså aldrig fastna osynlig här heller. */
    function fadeInBackgroundImages(root) {
      if (nhPrefersReducedMotion()) return;
      var els = (root || document).querySelectorAll(
        ".pser-avatar.has-photo, .route.has-photo, .nh-spotlight-img, .nh-guide-feature__photo"
      );
      Array.prototype.forEach.call(els, function (el) {
        if (el.getAttribute("data-fade-bound")) return;
        var bg = el.style.backgroundImage;
        var m = /url\((['"]?)(.*?)\1\)/.exec(bg || "");
        if (!m || !m[2]) return; // ingen bild satt än (t.ex. asynkront hämtad Spotlight/Guide-bild) -- fadeInBackgroundImages körs igen när den sätts, se resp. init-funktion
        el.setAttribute("data-fade-bound", "1");
        var probe = new Image();
        probe.onload = probe.onerror = function () { el.classList.add("is-loaded"); };
        probe.src = m[2];
        if (probe.complete) { el.classList.add("is-loaded"); return; } // redan i webbläsarens bildcache
        el.classList.add("img-fade");
      });
    }

    window.scanScrollReveal = scanScrollReveal;

    /* ── Transparent glasheader ovanpå heron (desktop-parity-runda) ──
       Återanvänder Nyehandels RIKTIGA #store-header (redan position:fixed,
       se CLAUDE.md/js/14-header-scroll.js) -- ingen parallell låtsasheader
       byggs, ingen navigation/sök/konto/varukorg dupliceras. Två delar:

       1) #store-main har en delad, native padding-top (uppmätt 180px,
          samma variabel/mekanism används på VARJE sida på sajten -- ändras
          INTE globalt). För att heron ska synas BAKOM den fixed:a headern
          i stället för UNDER den reserverade luckan, dras bara heron själv
          upp med exakt headerns egen renderade höjd (margin-top:-<h>px,
          mätt live -- samma teknik redan beprövad i Shape-rundornas
          hero-prototyper). Görs EN gång vid boot, bara på startsidan
          (denna funktion anropas bara från initHomepageV2).

       2) Klassen "nh-home-hero"/"nh-home-hero--scrolled" på #store-header
          styr utseendet via CSS (@media min-width:861px, se css/22) --
          transparent/glasigt i vila, övergår kontrollerat till ett
          läsbart Hazey-glas efter en kort scroll.

          KORRIGERAT (Korrigeringsrunda 2026-09-09 -- headerns
          scrollbugg): den ursprungliga kommentaren här hävdade att detta
          var "helt separat från och stör inte" den befintliga hide-on-
          scroll-down-mekaniken (initHeaderScroll/.nh-header-hidden,
          js/14-header-scroll.js) -- det stämde INTE. Båda lyssnade på
          `scroll` och skrev till SAMMA headers visuella tillstånd, bara
          vid olika trösklar (40px här, 90px där) och med olika effekt
          (färg/blur vs. hela headern osynlig via translateY(-100%)) --
          nettoresultatet var att headern bytte glas-nyans vid 40px och
          sedan försvann HELT vid 90px tills man scrollade upp igen, en
          riktig bugg, inte bara en subjektiv känsla. Konsoliderat:
          js/14-header-scroll.js's update() kollar nu explicit efter
          .nh-home-hero och rör den ALDRIG (varken döljer eller visar) --
          den här funktionen är nu den ENDA som styr det visuella
          tillståndet för startsidans header. Headerns geometri (höjd/
          position:fixed/top:0) ändras aldrig av någon av de två
          funktionerna, bara bakgrund/blur/skugga via CSS-klassen. */
    /* KORRIGERAT (Mästeruppdrag 2026-09-09 -- äkta EN-radshuvud, se
       STATUS.md/slutrapporten): föregående omgångs header var två
       ÖVERLAPPANDE lager (.main och nav.navbar staplade i samma grid-cell,
       z-index-lager, en medvetet TOM kolumn i .main så nav.navbar:s
       länkar skulle synas igenom) -- uttryckligen förbjudet av detta
       uppdrag ("Bygg inte två överlappande lager med separat navigation
       och sök/konto"). Ny arkitektur: den redan byggda .nh-cat-row
       (js/18a-header-v2.js, RIKTIGA nav-länkar, byggd EN gång sitewide av
       initHeaderV2 och som default monteras inuti nav.navbar för alla
       andra sidtyper -- den defaulten rörs INTE) flyttas HÄR, bara för
       startsidans headerinstans, till att bli ett RIKTIGT syskon-element
       mellan .left (logga) och .center (sök) inuti .main:s egen native
       .container -- en enda flex-rad, en enda DOM-nod äger navigationen,
       ingen overlay/z-index-choreografi kvar. nav.navbar blir tomt (dess
       enda riktiga innehåll var just .nh-cat-row) och döljs helt via CSS
       (se @media min-width:861px i css/22). Flytten görs EN gång vid
       boot -- ingen resize-baserad omflytt behövs, CSS:ens breddpunkter
       styr fortfarande allt responsivt beteende oavsett var noden bor i
       DOM:en. Andra sidtyper anropar aldrig denna funktion (den är bara
       kopplad från initHomepageV2), så deras tvårads-header (accepterad,
       oförändrad, utanför detta uppdrags scope) påverkas inte alls. */
    function nhMoveCatRowIntoMainRow(header) {
      var mainContainer = header.querySelector(".main > .container");
      var catRow = header.querySelector(".nh-cat-row");
      var searchCol = mainContainer ? mainContainer.querySelector(".center") : null;
      if (!mainContainer || !catRow || !searchCol) return;
      if (catRow.parentNode !== mainContainer) {
        mainContainer.insertBefore(catRow, searchCol);
      }
    }

    /* ── "Fler ▾"-översvämningsmeny (§9 -- desktopnavigationen får ALDRIG
       radbryta till två rader, vilket ersätter föregående omgångs
       861-1279px-kompromiss som uttryckligen tillät det). Riktig,
       mätningsdriven prioritetsnavigation (mönstret kallas ofta
       "priority+ nav") -- ingen gissad breddpunktslista. Mäter om
       .nh-cat-row:s riktiga innehåll (scrollWidth) ryms i sin tillgängliga
       bredd (clientWidth) vid varje resize; om inte, flyttas länkar in i
       en "Fler"-meny bakifrån (Merch/Kampanjer/CBD osv, ALDRIG "Alla
       produkter" som alltid är fäst kvar) tills raden ryms -- eller
       flyttas TILLBAKA ut igen om fönstret breddas. Ingen text krymper
       under läsbarhet, ingen rad döljs bakom sökfältet -- allt som inte
       ryms syns i stället i menyn. */
    function nhInitHeaderOverflowNav(header) {
      var row = header.querySelector(".nh-cat-row");
      if (!row || row.__nhOverflowNav) return;
      row.__nhOverflowNav = true;
      var pinned = row.querySelector(".cat-item"); // "Alla produkter" -- fäst, flyttas aldrig
      var items = Array.prototype.slice.call(row.querySelectorAll(".cat-item")).filter(function (el) {
        return el !== pinned && !el.classList.contains("cat-item--find");
      });
      if (!items.length) return;

      var more = document.createElement("div");
      more.className = "cat-item nh-cat-more";
      more.innerHTML = '<button type="button" class="cat-link nh-cat-more__btn" aria-haspopup="true" aria-expanded="false">Fler'
        + '<svg class="chev" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.5 4.5L6 8l3.5-3.5"/></svg></button>'
        + '<div class="ddrop cat-panel nh-cat-more__panel"></div>';
      row.appendChild(more);
      var panel = more.querySelector(".nh-cat-more__panel");
      var btn = more.querySelector(".nh-cat-more__btn");
      more.hidden = true;

      function fits() { return row.scrollWidth <= row.clientWidth + 1; }

      function recalc() {
        // Återställ: flytta allt ur menyn tillbaka till raden (i sin
        // ursprungliga ordning, direkt före "Fler"-knappen) innan mätning
        // -- annars skulle en tidigare övermående aldrig kunna krympa
        // tillbaka när fönstret breddas igen.
        items.forEach(function (el) { row.insertBefore(el, more); });
        more.hidden = true;
        if (fits()) return;
        more.hidden = false;
        for (var i = items.length - 1; i >= 0 && !fits(); i--) {
          panel.insertBefore(items[i], panel.firstChild);
        }
      }

      function closeMenu() { btn.setAttribute("aria-expanded", "false"); more.classList.remove("is-open"); }
      function openMenu() { btn.setAttribute("aria-expanded", "true"); more.classList.add("is-open"); }
      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") === "true";
        if (open) closeMenu(); else openMenu();
      });
      document.addEventListener("click", function (e) {
        if (!more.contains(e.target)) closeMenu();
      });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(); });

      var queued = false;
      window.addEventListener("resize", function () {
        if (queued) return;
        queued = true;
        requestAnimationFrame(function () { queued = false; closeMenu(); recalc(); });
      });
      recalc();
    }

    function nhInitHomeHeroHeader() {
      var header = document.getElementById("store-header");
      var hero = document.getElementById("nhHero");
      var storeMain = document.getElementById("store-main");
      if (!header || !hero) return;
      header.classList.add("nh-home-hero");
      nhMoveCatRowIntoMainRow(header);
      nhInitHeaderOverflowNav(header);

      /* KORRIGERAT (Desktop correction pass 2026-09-09): drog tidigare upp
         heron med exakt HEADERNS renderade höjd, i tysta antagandet att
         #store-mains egen native padding-top (se filkommentaren ovan)
         alltid råkar matcha den nästan exakt -- höll bara för att den
         gamla, tre-vånings-headern (175px) råkade ligga nära den uppmätta
         180px-paddingen. Den nya, kompakta headern (68px) avslöjade att de
         ALDRIG var kopplade till varandra: padding-top är en delad,
         statisk/breakpoint-egen native platt-siffra (uppmätt live till
         149px vid 1440px i denna omgång, INTE 180 -- ändras alltså även
         den, oberoende av vår header), inte härledd ur headerns riktiga
         höjd. Att bara dra upp med headerhöjden lämnade ett ~80px vitt/
         cream-glapp mellan headerns botten och där hero-fotot faktiskt
         började (native paddingen "vann" resten av utrymmet). Drar nu i
         stället upp med #store-mains FAKTISKA, live uppmätta padding-top
         rakt av -- det är den enda siffran som avgör var hero (headerns
         fasta syskon i normalt flöde) naturligt hamnar innan någon
         marginal alls sätts, så att dra upp med EXAKT det talet lägger
         heron perfekt mot sidans riktiga topp (y=0) alltid, oavsett vilket
         tal den delade native paddingen råkar vara just nu. */
      function syncOverlap() {
        // Bara vid bredder där headern faktiskt är transparent/overlay
        // (se css @media min-width:861px) -- under det behåller heron sin
        // vanliga mobila plats, ingen negativ marginal där.
        if (window.innerWidth >= 861) {
          var padTop = storeMain ? parseFloat(getComputedStyle(storeMain).paddingTop) || 0 : 0;
          hero.style.marginTop = (-padTop) + "px";
        } else {
          hero.style.marginTop = "";
        }
      }
      syncOverlap();
      window.addEventListener("resize", syncOverlap);

      /* KORRIGERAT (Mästeruppdrag 2026-09-09 -- gradvis glas i stället för
         en binär tröskel): föregående version växlade en enda gång vid
         y>40 (transparent → cream-glas, ett tydligt "hopp"). Uppdraget
         kräver att bakgrunden GRADVIS blir mörkare/mindre transparent
         medan man scrollar GENOM heron, inte ett abrupt byte. Sätter en
         CSS custom property (--nh-scroll, 0..1) som headerns egen CSS
         (se css/22) läser via calc() för opacity/blur -- samma headernod,
         samma geometri (höjd/position) hela tiden, bara en kontinuerlig
         bakgrundsvariabel. 0 vid toppen (heron full synlig genom glaset),
         1 efter en kort scrollsträcka (läsbart Hazey-glas). Sträckan
         (220px) är en kort, avsiktlig övergångszon -- inte kopplad till
         hero-höjden, som varierar per viewport (se .nh-qfind-hero-formeln)
         och skulle göra övergången olika lång beroende på skärmstorlek. */
      var REDUCE_MOTION_MQ = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
      var SCROLL_GLASS_DISTANCE = 220;
      function updateScrolled() {
        var y = window.pageYOffset || document.documentElement.scrollTop || 0;
        var progress = Math.max(0, Math.min(1, y / SCROLL_GLASS_DISTANCE));
        header.style.setProperty("--nh-scroll", String(progress));
        // Klassen behålls (binär) som en enkel state-hook för ev. JS/CSS
        // som bara behöver veta "i praktiken klar" (t.ex. :not()-scopade
        // reset-regler) -- den visuella övergången själv styrs nu helt av
        // --nh-scroll, inte av denna klass.
        header.classList.toggle("nh-home-hero--scrolled", progress >= 1);
      }
      updateScrolled();
      var ticking = false;
      window.addEventListener("scroll", function () {
        if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; updateScrolled(); }); }
      }, { passive: true });
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

      // Datakällemigrering (2026-09-10): läser RIKTIGA slides ur
      // Nyehandels egna native bildspel (ren avläsning, ingen DOM-
      // mutation ännu -- se nhReadNativeHeroSlides).
      //
      // Uppdragets krav punkt 6 (upprepat explicit i "Verifiera minst":
      // "Om native-slides tillfälligt saknas lämnas native-bildspelet
      // synligt") väger tyngre än att automatiskt återgå till den
      // hårdkodade NH_HERO_CAMPAIGNS_FALLBACK-konfigurationen -- om
      // avläsningen ger NOLL giltiga slides rörs native-DOM:en därför
      // INTE ALLS här (varken dold eller ersatt); den förblir synlig och
      // fullt fungerande på egen hand, vilket redan uppfyller "heron
      // kan aldrig bli tom" utan att vår egen (numera sekundära)
      // fallback-konfiguration behöver aktiveras automatiskt.
      // NH_HERO_CAMPAIGNS_FALLBACK/nhActiveHeroSlides() BEHÅLLS i koden
      // oanvänd (punkt 13 -- "ta inte bort... tydligt markerad som
      // fallback") som ett manuellt skyddsnät, inte en automatisk
      // ersättning.
      var nativeSlides = nhReadNativeHeroSlides(slideshow);
      var active = nativeSlides.map(nhNativeSlideToHeroSlide);

      // Kravet (punkt 5/6): native-bildspelet döljs FÖRST när minst en
      // giltig native-slide faktiskt lästs/validerats och det egna
      // hero-kortet är byggt.
      if (active.length) {
        // Döljer den nativa karusellen (rör den inte, bara CSS
        // display:none) och ersätter med det egna hero-kortet.
        slideRoot.classList.add("nh-native-hero-hidden");

        var heroWrap = document.createElement("div");
        heroWrap.innerHTML = nhHeroHtml(navData, kampanjerHref, active);
        slideRoot.parentNode.insertBefore(heroWrap, slideRoot);
        while (heroWrap.firstChild) slideRoot.parentNode.insertBefore(heroWrap.firstChild, slideRoot);
        heroWrap.remove();
      }

      // ALLA home-extra-sektioner delar NU en enda flex-wrapper (utökat
      // 2026-09-08, desktop-parity-rundan -- tidigare låg bara Populära
      // serier/vägar i denna wrapper, resten som fristående syskon). Detta
      // krävs för att CSS `order` ska kunna ge desktop en HELT ANNAN
      // sektionsordning (matchar den godkända referensen: serier →
      // bästsäljare → bonfire → trust → featured → omdömen → [befintligt
      // innehåll som inte syns i referensen, men aldrig tas bort: vägar →
      // snabb koll → guider → nyhetsbrev]) UTAN att röra mobilens redan
      // godkända, oförändrade sekvens. Varje sektion får ett explicit
      // `order`-värde både i bas-CSS (= dagens mobila ordning, se css/22)
      // och i @media (min-width:861px) (den nya desktop-ordningen) --
      // ingen sektion tas bort, bara omflyttad visuellt vid bredare
      // breddpunkter.
      var kunskapCards = nhBuildKunskapCards(navData);
      var flexWrap = document.createElement("div");
      flexWrap.className = "nh-startpage-flex";
      flexWrap.innerHTML = ''
        + '<section class="nh-aura-guide" id="aura-guiden" hidden data-status="juridik-ej-klar"></section>'
        + nhContinueShellHtml()
        + nhPopularaSerierHtml(navData)
        + nhPopularaVagarHtml(navData)
        + nhBestsellersHtml()
        + nhBonfireHtml()
        + nhSpotlightHtml()
        + nhTrustBlockHtml()
        + nhKunskapHtml(kunskapCards)
        + nhGuidesHtml(navData)
        + nhReviewsHtml()
        + nhNewsletterHtml();

      var anchor = slideRoot.nextSibling;
      slideRoot.parentNode.insertBefore(flexWrap, anchor);

      scanScrollReveal(document);
      nhInitHeroCarousel(document);
      nhInitPserNav(document);
      nhEnhanceWithRealPhotos(document);
      nhInitBestsellers(document);
      nhInitSpotlight(document);
      nhInitReviewsLive(document);
      nhInitProductReviews(document);
      nhInitInactiveForms(document);
      nhHideSupersededTabsSection();
      nhInitGuides();
      nhInitHomeHeroHeader();
    }
