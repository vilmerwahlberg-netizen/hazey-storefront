
    /* ============================================================
       HEADER v2 — ny header enligt Vilmers prototyp (../header-startsida/
       ny-header-child.html), byggd mot nyehandels RIKTIGA DOM (#store-header),
       INTE en port av prototypens kod. Se CLAUDE.md ("Uppdraget") och
       STATUS.md (arbetsloggen/besluten bakom klassificeringen nedan).

       Arkitektur: nyehandel renderar redan en ÄKTA nav-meny server/Vue-sidan
       (en enda platt "Alla produkter"-megameny med alla riktiga kategorier
       nästlade i den). Vi läser den listan LIVE ur DOM:en (aldrig hårdkodad),
       klassificerar varje länk mot fyraxel-principen med reglerna nedan, och
       bygger om presentationen till separata lätta dropdowns per format.
       Riktiga fält vi ALDRIG rör (Vue-bundna, återanvänds rakt av, bara
       omstylade via CSS): #search-container (nativ sök), .account-button,
       #cart-button. Se CLAUDE.md för varför.
       ============================================================ */

    // Cannabinoider som redan är juridiskt klara att visa (Vilmer, 2026-08-28).
    var NH_ACTIVE_CANNABINOIDS = ["thca", "thcb", "thcv", "cbn", "h4cbd", "cbd"];

    // PAUSADE — juridik ej klar (flera cannabinoidvarianter blev olagliga i
    // Sverige från 2025-12-10; Vilmer kollar status per variant). Dessa ska
    // ALDRIG synas i navigationen, inte ens med platshållarnamn, förrän han
    // säger till. Prefix-matchning (täcker t.ex. "thcnm-hash" också).
    var NH_PAUSED_PREFIXES = ["hhcpm", "thcnm", "10-oh-thc"];

    // Kända serier/varumärken (namnen finns inte i kategori-sluggen på ett
    // gissningsbart sätt, så de listas explicit). Källa: riktiga nav-länkar
    // verifierade mot hazeyse.nyehandel.se 2026-08-28.
    var NH_SERIE_OVERRIDES = {
      "magic-sauce": "Magic Sauce", "m-s-vapes": "Magic Sauce", "m-s-buds": "Magic Sauce",
      "nano-11": "Nano-11", "nano11-blommor": "Nano-11",
      "faraoh": "Faraoh", "hero-vapes": "Hero",
      "tatra-hemp": "Tatra Hemp", "magic-farmers": "Magic Farmers"
    };
    // Format kan oftast härledas ur sluggens suffix (se nhClassify). Dessa två
    // saknar ett format-suffix men är kända vapes-serier (se STATUS.md för
    // resonemang — VERIFIERA med Vilmer, osäker klassificering).
    var NH_FORMAT_OVERRIDES = { "hero-vapes": "vape", "faraoh": "vape" };

    // Serier utan känt/säkert format (Tatra Hemp, Magic Farmers) hamnar här
    // och visas i alla tre format-dropdowns hellre än att gissa fel format —
    // se STATUS.md, flaggat för Vilmer att bekräfta.
    var NH_UNCERTAIN_FORMAT_SERIES = ["Tatra Hemp", "Magic Farmers"];

    function nhSlugFromHref(href) {
      try {
        return (href || "").replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, "").split("/").pop().split("?")[0];
      } catch (e) { return ""; }
    }

    function nhClassify(slug) {
      if (NH_PAUSED_PREFIXES.some(function (p) { return slug === p || slug.indexOf(p + "-") === 0; })) {
        return { paused: true };
      }
      var format = NH_FORMAT_OVERRIDES[slug] || null;
      if (!format) {
        if (/(^|-)(vapes?|carts?|cartridges)$/.test(slug) || slug === "pennor") format = "vape";
        else if (/(^|-)(blommor|buds)$/.test(slug)) format = "blomma";
        else if (/(^|-)(hasch?|hash)$/.test(slug)) format = "hash";
      }
      var cannabinoid = null;
      var prefix = slug.split("-")[0];
      if (NH_ACTIVE_CANNABINOIDS.indexOf(prefix) > -1) cannabinoid = prefix.toUpperCase();
      else if (slug === "cbd-group") cannabinoid = "CBD";
      var serie = NH_SERIE_OVERRIDES[slug] || null;
      return { format: format, cannabinoid: cannabinoid, serie: serie };
    }

    // Läser den riktiga, redan renderade nav-menyn en gång och bygger
    // format-grupperad data. Ingen räkning/inga produkter hårdkodas — allt
    // kommer från de faktiska <a>-länkarna nyehandel redan la i DOM:en.
    function nhBuildNavData(navMenuEl) {
      var groups = { vape: { label: "Vapes & carts", items: [], cannabinoids: {}, series: {} },
                     blomma: { label: "Blommor", items: [], cannabinoids: {}, series: {} },
                     hash: { label: "Hash", items: [], cannabinoids: {}, series: {} } };
      var flatExtra = []; // t.ex. Merch — hör inte till nåt format
      var footerLinks = []; // t.ex. CBD Group — egen landningssida, länkas i footer/trust, inte i topnav

      var links = Array.prototype.slice.call(navMenuEl.querySelectorAll(".index-menu a[href]"));
      links.forEach(function (a) {
        var slug = nhSlugFromHref(a.getAttribute("href"));
        if (!slug || slug === "alla-produkter") return;
        var c = nhClassify(slug);
        if (c.paused) return; // juridik ej klar — dölj helt

        var entry = { label: a.textContent.trim().replace(/\s+/g, " "), href: a.getAttribute("href"), slug: slug };

        if (c.format && groups[c.format]) {
          groups[c.format].items.push(entry);
          if (c.cannabinoid) groups[c.format].cannabinoids[c.cannabinoid] = entry.href;
          if (c.serie) groups[c.format].series[c.serie] = entry.href;
        } else if (c.cannabinoid && !c.format) {
          // Cannabinoid-katalog utan formatuppdelning (t.ex. "CBD Group") —
          // egen landningssida, se STATUS.md/Vilmers beslut 2026-08-28.
          footerLinks.push(entry);
        } else if (c.serie && !c.format) {
          // Serie utan säkert format — visa i alla tre dropdowns hellre än
          // att gissa fel (flaggat i STATUS.md för Vilmer att bekräfta).
          Object.keys(groups).forEach(function (k) { groups[k].series[c.serie] = entry.href; });
        } else {
          flatExtra.push(entry);
        }
      });
      return { groups: groups, flatExtra: flatExtra, footerLinks: footerLinks };
    }

    function nhFormatDropdownHtml(key, group) {
      var subLinks = group.items.filter(function (it) {
        // "Viktiga underformat"-listan: länkar som inte redan räknas som en
        // serie (annars dubbleras Magic Sauce/Nano-11 i båda listorna).
        return !Object.keys(group.series).some(function (s) { return group.series[s] === it.href; })
          && it.slug.indexOf("alla-") !== 0;
      }).slice(0, 6);
      var serieKeys = Object.keys(group.series);
      var cannaKeys = Object.keys(group.cannabinoids);
      var allHref = group.items.filter(function (it) { return it.slug.indexOf("alla-") === 0; })[0];

      var html = '<div class="cat-item" data-nh-cat="' + key + '">'
        + '<a class="cat-link" href="' + (allHref ? allHref.href : "#") + '" aria-expanded="false">' + group.label
        + ' <svg class="chev" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.5 4.5L6 8l3.5-3.5"/></svg></a>'
        + '<div class="ddrop cat-panel">'
        + (allHref ? '<a class="dd-all" href="' + allHref.href + '">Visa alla ' + group.label.toLowerCase() + '</a>' : "");

      if (subLinks.length) {
        html += '<div class="dd-sub"><h5>Fler i ' + group.label.toLowerCase() + '</h5>'
          + subLinks.map(function (it) { return '<a class="dd-line" href="' + it.href + '">' + it.label + '</a>'; }).join("")
          + '</div>';
      }
      if (serieKeys.length) {
        html += '<div class="dd-sub"><h5>Populära serier</h5>'
          + serieKeys.map(function (s) { return '<a class="dd-line" href="' + group.series[s] + '">' + s + '</a>'; }).join("")
          + '</div>';
      }
      if (cannaKeys.length) {
        html += '<div class="dd-chips">'
          + cannaKeys.map(function (c) { return '<a class="chip" href="' + group.cannabinoids[c] + '">' + c + '</a>'; }).join("")
          + '</div>';
      }
      html += '<a class="dd-find" href="#hitta-ratt" data-open-hr="1">Osäker på skillnaden? Öppna Hitta rätt '
        + '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.5 4.5L6 8l3.5-3.5" transform="rotate(-90 6 6)"/></svg></a>';
      html += "</div></div>";
      return html;
    }

    function nhBuildNewNavHtml(navData, allProdukterHref, kampanjerHref) {
      var order = ["vape", "blomma", "hash"];
      var html = '<div class="cat-item"><a class="cat-link" href="' + allProdukterHref + '">Alla produkter</a></div>'
        + order.map(function (k) { return nhFormatDropdownHtml(k, navData.groups[k]); }).join("")
        + '<div class="cat-item"><a class="cat-link campaign" href="' + kampanjerHref + '">Kampanjer</a></div>'
        + navData.flatExtra.map(function (it) { return '<div class="cat-item"><a class="cat-link" href="' + it.href + '">' + it.label + '</a></div>'; }).join("")
        + '<div class="cat-item"><a class="cat-link find" href="#hitta-ratt" data-open-hr="1">'
        + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v3M12 18v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M3 12h3M18 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/><circle cx="12" cy="12" r="4"/></svg>Hitta rätt</a></div>';
      return html;
    }

    function nhBuildMobileMenuHtml(navData, allProdukterHref, kampanjerHref) {
      var order = ["vape", "blomma", "hash"];
      function section(key, group) {
        var serieKeys = Object.keys(group.series);
        var cannaKeys = Object.keys(group.cannabinoids);
        var allHref = group.items.filter(function (it) { return it.slug.indexOf("alla-") === 0; })[0];
        var subLinks = group.items.filter(function (it) {
          return !Object.keys(group.series).some(function (s) { return group.series[s] === it.href; }) && it.slug.indexOf("alla-") !== 0;
        }).slice(0, 6);
        return '<li class="mm-cat"><button class="mm-top" aria-expanded="false">' + group.label
          + '<span class="r"><svg class="chev" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.5 4.5L6 8l3.5-3.5"/></svg></span></button>'
          + '<div class="mm-sub">'
          + (allHref ? '<a class="mm-viewall" href="' + allHref.href + '">Visa alla ' + group.label.toLowerCase() + ' <span>→</span></a>' : "")
          + (subLinks.length ? '<p class="mm-sub-h">Fler i ' + group.label.toLowerCase() + '</p>'
              + subLinks.map(function (it) { return '<a class="mm-sub-link"><span class="t">' + it.label + '</span></a>'.replace("<a class", '<a href="' + it.href + '" class'); }).join("") : "")
          + (serieKeys.length ? '<p class="mm-sub-h">Populära serier</p>'
              + serieKeys.map(function (s) { return '<a class="mm-sub-link" href="' + group.series[s] + '"><span class="t">' + s + '</span></a>'; }).join("") : "")
          + (cannaKeys.length ? '<div class="chips">' + cannaKeys.map(function (c) { return '<span class="chip">' + c + '</span>'; }).join("") + '</div>' : "")
          + '</div></li>';
      }
      return '<ul class="mm-cats">'
        + '<li class="mm-cat"><a class="mm-flat" href="' + allProdukterHref + '">Alla produkter <span>→</span></a></li>'
        + order.map(function (k) { return section(k, navData.groups[k]); }).join("")
        + '<li class="mm-cat"><a class="mm-flat campaign" href="' + kampanjerHref + '">Kampanjer</a></li>'
        + navData.flatExtra.map(function (it) { return '<li class="mm-cat"><a class="mm-flat" href="' + it.href + '">' + it.label + '</a></li>'; }).join("")
        + '<li class="mm-cat"><a class="mm-flat find" href="#hitta-ratt" data-open-hr="1">Hitta rätt</a></li>'
        + '</ul>';
    }

    /* ── "Hitta rätt" — delad 3-stegs guide (format → cannabinoid → vad ska
       jämföras). Helt ny komponent, inte kopplad till nativ DOM, så säker att
       bygga fritt. Tredje steget är AVSIKTLIGT inte känsla/effekt (juridiskt
       krav, se CLAUDE.md varumärkesröst). */
    function nhBuildHittaRattHtml(navData) {
      var vapeHref = (navData.groups.vape.items.filter(function(it){return it.slug==="alla-vapes";})[0]||{}).href || "/sv/categories/alla-vapes";
      var blommaHref = (navData.groups.blomma.items.filter(function(it){return it.slug==="blommor-buds";})[0]||{}).href || "/sv/categories/blommor-buds";
      var hashHref = (navData.groups.hash.items.filter(function(it){return it.slug==="hasch";})[0]||{}).href || "/sv/categories/hasch";
      return ''
        + '<div class="hr-scrim" id="hrScrim"></div>'
        + '<aside class="hr-drawer" id="hrDrawer" aria-label="Hitta rätt" role="dialog" aria-modal="true" hidden>'
        + '  <div class="hr-head"><h2>Hitta rätt på tre val</h2><button class="hr-close" id="hrClose" aria-label="Stäng">×</button></div>'
        + '  <p class="hr-intro">Guiden frågar efter produktens egenskaper — inte efter medicinska behov eller effekt.</p>'
        + '  <div class="hr-step"><b>1. Vilket format?</b><div class="hr-opts" data-step="format">'
        + '    <a class="hr-opt" href="' + vapeHref + '">Vape</a>'
        + '    <a class="hr-opt" href="' + blommaHref + '">Blomma</a>'
        + '    <a class="hr-opt" href="' + hashHref + '">Hash</a>'
        + '  </div></div>'
        + '  <div class="hr-step"><b>2. Vilken cannabinoid?</b><div class="hr-opts" data-step="cannabinoid">'
        + NH_ACTIVE_CANNABINOIDS.map(function (c) { return '<span class="hr-opt hr-opt--info">' + c.toUpperCase() + '</span>'; }).join("")
        + '  </div><p class="hr-note">Välj format ovan för att se just den cannabinoidens produkter.</p></div>'
        + '  <a class="hr-result" href="/sv/categories/alla-produkter">Visa alla produkter '
        + '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.5 4.5L6 8l3.5-3.5" transform="rotate(-90 6 6)"/></svg></a>'
        + '</aside>';
    }

    function nhInitHittaRatt(root) {
      var scrim = root.querySelector("#hrScrim"), drawer = root.querySelector("#hrDrawer"), close = root.querySelector("#hrClose");
      // Scrimet tonas via klass (mjuk fade), kortet snäpper in/ut via [hidden]
      // — samma uppdelning som prototypens .hr-scrim/.hr-drawer.
      function open() { drawer.hidden = false; scrim.classList.add("is-open"); document.body.classList.add("nh-hr-open"); }
      function shut() { drawer.hidden = true; scrim.classList.remove("is-open"); document.body.classList.remove("nh-hr-open"); }
      drawer.hidden = true;
      document.addEventListener("click", function (e) {
        var trigger = e.target.closest && e.target.closest("[data-open-hr]");
        if (trigger) { e.preventDefault(); open(); }
      });
      close.addEventListener("click", shut);
      scrim.addEventListener("click", shut);
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !drawer.hidden) shut(); });
    }

    function initHeaderV2() {
      var sh = document.getElementById("store-header");
      if (!sh || sh.__nhHeaderV2) return;
      sh.__nhHeaderV2 = true;
      sh.classList.add("nh-header-v2");

      // 18+ — juridiskt krav, saknas i dagens topbar-USP-lista. Ren UI-text,
      // ingen påhittad trust-data.
      var topbarInner = sh.querySelector(".topbar .container");
      if (topbarInner && !topbarInner.querySelector(".nh-age-badge")) {
        var age = document.createElement("span");
        age.className = "nh-age-badge";
        age.textContent = "18+";
        topbarInner.appendChild(age);
      }

      var navMenu = sh.querySelector("nav.navbar .navbar-menu");
      var mega = navMenu ? navMenu.querySelector(".navbar-item.has-dropdown.is-mega") : null;
      if (!navMenu || !mega) return; // okänd DOM — avbryt hellre än att gissa

      var allProdukterHref = (mega.querySelector(".navbar-link") || {}).getAttribute
        ? mega.querySelector(".navbar-link").getAttribute("href") : "/sv/categories/alla-produkter";
      var kampanjerHref = "/sv/page/kampanjer"; // verifierad riktig sida, se blocks/kampanjer-page.html

      var navData = nhBuildNavData(mega);

      // Bygg NY nav bredvid den nativa (som vi döljer via CSS, inte tar
      // bort — bevarar den som fallback/länk-källa om något går fel).
      var newNav = document.createElement("div");
      newNav.className = "nh-cat-row";
      newNav.innerHTML = nhBuildNewNavHtml(navData, allProdukterHref, kampanjerHref);
      navMenu.parentNode.insertBefore(newNav, navMenu);
      navMenu.classList.add("nh-native-nav-hidden");

      // Ny mobilmeny (samma navData — EN datakälla för både desktop- och
      // mobilmarkup, se CLAUDE.md om varför inte två separata träd).
      var mobileMenu = document.createElement("div");
      mobileMenu.className = "nh-mobile-menu";
      mobileMenu.id = "nhMobileMenu";
      mobileMenu.hidden = true;
      // Fotnot med 18+-kravet (juridiskt krav — flyttas hit på mobil eftersom
      // den mörkgröna topbaren döljs där, se CSS). Läggs till UTANFÖR
      // nhBuildMobileMenuHtml (den funktionen rörs inte — nav-innehållet är
      // flaggat, se STATUS.md).
      mobileMenu.innerHTML = '<div class="mm-head"><span>hazey</span><button class="ms-close" id="nhMobileMenuClose" aria-label="Stäng">×</button></div>'
        + nhBuildMobileMenuHtml(navData, allProdukterHref, kampanjerHref)
        + '<div class="nh-mm-foot">Fri frakt över 499 kr · 18+ krävs vid köp</div>';
      var mobileScrim = document.createElement("div");
      mobileScrim.className = "nh-mobile-menu-scrim";
      mobileScrim.hidden = true;
      // Monteras på <body>, INTE i #store-header: headern har (eller får)
      // en transform vid scroll (se js/14-header-scroll.js), vilket skapar
      // ett nytt containing block för position:fixed-barn och skulle klämma
      // ihop den här panelen till headerns egen låga höjd. Samma anledning
      // gäller nh-hr-root nedan.
      document.body.appendChild(mobileScrim);
      document.body.appendChild(mobileMenu);

      // Egen hamburger-knapp (döljer nativ visuellt via CSS men rör inte dess
      // Vue-bindning — se CLAUDE.md: rör aldrig nativa interaktiva element).
      // Monteras som EGEN, FÖRSTA barn i .main (inte inuti .right) — på mobil
      // ska den sitta längst till vänster med loggan centrerad, enligt rätt
      // prototyp (chatgpt-claude-handover/.../prototyp/index.html, mVp-header:
      // hamburgare vänster + centrerad logga + konto/varukorg höger).
      var mainRow = sh.querySelector(".main");
      var newBurger = document.createElement("button");
      newBurger.className = "nh-burger";
      newBurger.setAttribute("aria-label", "Öppna meny");
      newBurger.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
      if (mainRow) mainRow.insertBefore(newBurger, mainRow.firstChild);

      // Mobil sökrad: nyehandels riktiga sök ligger dold bakom en ikon i
      // .right på mobil. Prototypens mVp har istället ett alltid synligt
      // sökfält direkt under headern. Vi bygger en egen, alltid synlig
      // "fejk-input" som bara TRIGGAR den riktiga sökfunktionen (klickar på
      // den nativa #mobile-search-trigger-knappen) — ingen egen söklogik,
      // ingen dubblettdata.
      var nativeSearchTrigger = sh.querySelector("#mobile-search-trigger");
      if (nativeSearchTrigger && mainRow && !sh.querySelector(".nh-mobile-searchbar")) {
        var mobileSearchBar = document.createElement("div");
        mobileSearchBar.className = "nh-mobile-searchbar";
        mobileSearchBar.innerHTML = '<button type="button" aria-label="Öppna produktsökning">'
          + '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>'
          + 'Sök produkt, serie eller cannabinoid…</button>';
        mobileSearchBar.querySelector("button").addEventListener("click", function () {
          nativeSearchTrigger.click();
        });
        mainRow.parentNode.insertBefore(mobileSearchBar, mainRow.nextSibling);

        // Kompakt trust-rad (2×2) direkt under sökfältet, matchar rätt
        // prototyp. RIKTIGA värden, bekräftade av Vilmer 2026-08-31:
        //   - Trustpilot 4,7/5, länkad till den riktiga recensionssidan
        //     (samma URL som redan används i blocks/testimonials-section.html).
        //   - "8 000+ ordrar" (INTE "kunder" — Vilmer påpekade skillnaden;
        //     ordersiffran rör sig uppåt mot 9000, så det här talet MÅSTE
        //     uppdateras manuellt då och då — sätt inte och glöm).
        //   - Leverans/diskretion-texten återanvänds LIVE ur den redan
        //     riktiga topbar-USP-listan (ingen ny hårdkodad kopia av samma
        //     fakta två gånger).
        var uspTexts = Array.prototype.slice.call(sh.querySelectorAll(".topbar .usp li"))
          .map(function (li) { return li.textContent.trim(); });
        var leveransText = uspTexts.filter(function (t) { return /vardag|leverans|skicka/i.test(t); })[0] || "Snabb leverans";
        var diskretText = uspTexts.filter(function (t) { return /diskret/i.test(t); })[0] || "Diskreta paket";

        var trustRow = document.createElement("div");
        trustRow.className = "nh-mobile-trust";
        trustRow.innerHTML = ''
          + '<a class="nh-mt-item" href="https://www.trustpilot.com/review/hazey.se" target="_blank" rel="noopener">'
          + '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.9L22 9.6l-5.4 4.9L18 22l-6-3.9L6 22l1.4-7.5L2 9.6l7.1-.7L12 2z"/></svg>'
          + '<span><b>4,7/5</b> på Trustpilot</span></a>'
          + '<div class="nh-mt-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.5 7.3c-.4-.2-.9-.1-1.2.2l-3.4 3.4-2.9-5.1c-.2-.4-.6-.6-1-.6s-.8.2-1 .6l-2.9 5.1-3.4-3.4c-.3-.3-.8-.4-1.2-.2s-.6.6-.5 1l1.9 9.8c.1.5.5.9 1 .9h12.4c.5 0 .9-.4 1-.9l1.9-9.8c.1-.4-.1-.8-.5-1z"/></svg>'
          + '<span><b>8 000+</b> ordrar</span></div>'
          + '<div class="nh-mt-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="6" width="15" height="12" rx="1.5"/><path d="M16 10h3.5l2.5 3v5h-6z"/><circle cx="6" cy="19.5" r="1.6"/><circle cx="17.5" cy="19.5" r="1.6"/></svg>'
          + '<span>' + leveransText + '</span></div>'
          + '<div class="nh-mt-item"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l8 3.5V11c0 5-3.4 8.7-8 9.9C7.4 19.7 4 16 4 11V5.5L12 2z"/></svg>'
          + '<span>' + diskretText + '</span></div>';
        mobileSearchBar.parentNode.insertBefore(trustRow, mobileSearchBar.nextSibling);
      }

      function openMobile() { mobileMenu.hidden = false; mobileScrim.hidden = false; document.body.classList.add("nh-mm-open"); }
      function shutMobile() { mobileMenu.hidden = true; mobileScrim.hidden = true; document.body.classList.remove("nh-mm-open"); }
      newBurger.addEventListener("click", openMobile);
      mobileScrim.addEventListener("click", shutMobile);
      mobileMenu.querySelector("#nhMobileMenuClose").addEventListener("click", shutMobile);
      mobileMenu.addEventListener("click", function (e) {
        var top = e.target.closest && e.target.closest(".mm-top");
        if (!top) return;
        var open = top.getAttribute("aria-expanded") === "true";
        top.setAttribute("aria-expanded", open ? "false" : "true");
        top.parentNode.classList.toggle("is-open", !open);
      });

      // "Hitta rätt" — egen overlay. Monteras på <body>, se motivering ovan
      // vid mobilmenyn (containing-block för position:fixed).
      var hrRoot = document.createElement("div");
      hrRoot.className = "nh-hr-root";
      hrRoot.innerHTML = nhBuildHittaRattHtml(navData);
      document.body.appendChild(hrRoot);
      nhInitHittaRatt(hrRoot);

      // BUGGFIX 2026-08-31: #store-main har en statisk, nativ
      // padding-top:100px som matchar den GAMLA (kortare) headern. Vi gjorde
      // mobil-headern högre (sökrad + trust-rad) utan att synka det värdet
      // — sidans riktiga innehåll (hero m.m.) gled in UNDER den nu högre
      // fasta headern. Mäter headerns faktiska höjd och sätter #store-main
      // padding-top därefter, om och bara om den behöver ökas (rör inte
      // desktop där headerns höjd inte ändrats). Körs igen vid resize
      // eftersom sökrad/trust-rad bara visas under 880px.
      var storeMain = document.getElementById("store-main");
      function nhSyncMainOffset() {
        if (!storeMain) return;
        // scrollHeight, INTE getBoundingClientRect().height — #store-header
        // har en egen fast CSS-höjd (native), så dess "riktiga" höjd
        // rapporteras fel om innehållet (vår sökrad/trust-rad) överskrider
        // den — scrollHeight räknar med det överskjutande innehållet.
        var headerH = Math.round(sh.scrollHeight);
        var current = parseInt(getComputedStyle(storeMain).paddingTop, 10) || 0;
        if (headerH !== current) storeMain.style.paddingTop = headerH + "px";
      }
      nhSyncMainOffset();
      window.addEventListener("resize", nhSyncMainOffset);
    }
