/* Produktkapitel för PDP:er med författat innehåll (85c-pdp-content.js).
   MS 2 ml-piloten (2026-11-16). Anropas av 85-pdp-pilot.js buildBelow()
   med produktens innehållspost och adapterns kit (samma data och samma
   kontroller som köpstationen). Generiska moduler -- all produkttext kommer
   ur innehållsposten eller ur Nyehandels egen produktdata.

   Ordning (samma i HTML på mobil och desktop):
   1 Vad är …? (kort svar + fakta)   2 Strains och analys (gemensam analys)
   3 Om produkten (specifikationer + hela befintliga produkttexten)
   4 Vanliga frågor (<details>, svaren i DOM)   5 Upptäck fler (karusell)
   6 Kundomdömen (#omdomen, bara med riktiga omdömen)
   7 Relaterade kategorier + kundservice (befintliga).

   Regler: inga påhittade siffror, strains, omdömen eller dokument. Saknas
   data döljs raden/modulen (aldrig tom stjärnrad eller tomma kort). */
(function () {
  "use strict";
  var HZ8 = window.HZ8;

  HZ8.pdpChapters = function (host, C, k) {
    var esc = k.esc, node = k.node, ICON = k.ICON, S = k.S;
    var article = document.querySelector("#product-information article.product-description");
    var brandA = document.querySelector(".product-detail__information .brand a[href]");
    var brand = brandA ? brandA.textContent.trim() : "";
    var here = HZ8.path(location.href).split("?")[0].replace(/\/\d+$/, "");
    var pathOf = function (href) { return HZ8.path(href || "").split("?")[0].replace(/\/\d+$/, ""); };

    /* ---- produktens egna data ---- */
    var specs = article ? k.specRows(article) : [];
    var spec = function (re) { var r = specs.filter(function (x) { return re.test(x[0]); })[0]; return r ? r[1] : ""; };
    function strains() {
      return S.values.map(function (x) {
        return { id: x.id, name: k.strainParts(x.name)[0], full: x.name, v: x.variant, ok: x.variant ? k.isBuyable(x.variant) : null };
      });
    }
    function list(names) {
      if (names.length < 2) return names.join("");
      return names.slice(0, -1).join(", ") + " och " + names[names.length - 1];
    }
    function contactHref() { return HZ8.link("/sv/page/kontakt"); }
    /* Labbdokument = PDF-länkar i produktens egen text vars länktext är
       en analys. Läses live -- tas en länk bort i admin försvinner den
       här också. Inget dokument kopplas till vald strain och inget
       påstås gälla hela produkten (se TEXT-DIFF.md). */
    var docs = (article ? Array.prototype.slice.call(article.querySelectorAll("a[href]")) : []).filter(function (a) {
      return /\.pdf(\?|#|$)/i.test(a.getAttribute("href")) && /labb|analys|\bcoa\b|certifikat/i.test(a.textContent);
    }).map(function (a) {
      var t = a.textContent.replace(/\s+/g, " ").trim();
      return { href: a.href, text: t, name: t.replace(/^(labbtest|labbrapport|analys|coa)\s*[:\-–]?\s*/i, "").trim(), host: (function () { try { return new URL(a.href).hostname.replace(/^www\./, ""); } catch (e) { return ""; } })() };
    });
    /* Saknade rapporter räknas bara om dokumenten faktiskt är namngivna
       efter strains (minst ett namn matchar). Ett produktgemensamt dokument
       ("LABBTEST") ger ingen lista över "saknade" strains. */
    function docsMissing() {
      var have = docs.map(function (d) { return d.name.toLowerCase(); });
      var ss = strains(), named = ss.some(function (s) { return have.indexOf(s.name.toLowerCase()) !== -1; });
      return named ? ss.filter(function (s) { return have.indexOf(s.name.toLowerCase()) === -1; }).map(function (s) { return s.name; }) : [];
    }
    function analysisHtml() {
      if (!docs.length) return 'Labbrapporter finns inte i produktbeskrivningen just nu – <a href="' + esc(contactHref()) + '">kontakta kundservice</a> om du vill ha underlag.';
      return "I produktbeskrivningen finns " + docs.length + " labbrapporter (PDF) som är namngivna efter strain: " + esc(list(docs.map(function (d) { return d.name; }))) + '. De listas under <a href="#hz8-pcx-strains">Strains och analys</a>.' +
        (docsMissing().length ? ' För övriga strains finns ingen egen rapport här – <a href="' + esc(contactHref()) + '">kontakta kundservice</a> om du vill ha underlag.' : "");
    }
    function packsHtml() {
      var unit = k.tierUnit(k.currentVariant(), 1); if (unit == null) unit = k.commonUnit();
      var sizes = (k.packSizes() || []).filter(function (s) { return s.verified && s.price != null; });
      if (unit == null || !sizes.length) return "";
      var parts = sizes.map(function (s) { return s.qty + "-pack kostar " + esc(s.formatted || k.kr(s.price)) + " (" + esc(k.kr(Math.round(s.price / s.qty))) + "/st)"; });
      return "1 st kostar " + esc(k.kr(unit)) + ". " + list(parts) + ". I ett paket väljer du strain för varje plats bland de strains som finns i lager." +
        (sizes.some(function (s) { return !k.packFillable(s.qty); }) ? " Ett paket kan bara väljas när lagret räcker till alla platser." : "");
    }
    function deliveryHtml() {
      var lines = HZ8.commerce && HZ8.commerce.deliveryLines ? HZ8.commerce.deliveryLines() : [];
      var out = [];
      if (lines.some(function (l) { return /Sverige/.test(l); })) out.push("Vi skickar från Sverige och levererar endast inom Sverige.");
      if (lines.some(function (l) { return /^Diskret/.test(l); })) out.push("Paketet är diskret förpackat.");
      out.push("Du har 14 dagars ångerrätt enligt distansavtalslagen; returfrakten betalas av kunden.");
      return esc(out.join(" ")) + ' Frakt och villkor: <a href="' + esc(HZ8.link("/sv/page/kop-och-leveransvillkor")) + '">Köp- och leveransvillkor</a>.';
    }
    /* Mallens text escapas, sedan ersätts {token} med (redan escapad) HTML.
       En token utan data gör hela meningen tom -> raden döljs. */
    function fill(tpl) {
      var ss = strains(), names = ss.map(function (s) { return s.name; });
      var known = ss.length && ss.every(function (s) { return s.ok !== null; });
      var inStock = ss.filter(function (s) { return s.ok; }).map(function (s) { return s.name; });
      var nm = k.nameParts(k.productName());
      var T = {
        name: esc(k.productName()), brand: esc(brand),
        type: esc((spec(/produkttyp/i) || nm.type || "").split("/")[0].trim().toLowerCase()),
        size: esc(spec(/innehållsmängd|volym/i) || nm.size),
        count: ss.length ? String(ss.length) : "",
        some: esc(list(names.slice(0, 3))), all: esc(list(names)),
        instock: !known ? "" : inStock.length ? esc("Just nu i lager: " + list(inStock) + ".") : "Just nu är alla strains slutsålda.",
        compare: C.compare ? '<a href="' + esc(HZ8.link(C.compare.href)) + '">' + esc(C.compare.label) + "</a>" : "",
        allvapes: '<a href="' + esc(HZ8.link("/sv/categories/alla-vapes")) + '">alla vapes</a>',
        analysis: analysisHtml(), packs: packsHtml(), delivery: deliveryHtml(),
        docs: docs.length ? String(docs.length) : ""
      };
      var missing = false;
      var html = esc(tpl).replace(/\{(\w+)\}/g, function (m, key) { if (!(key in T)) return m; if (!T[key] && key !== "instock") missing = true; return T[key]; });
      return missing ? "" : html.replace(/\s+/g, " ").trim();
    }

    /* ---- 1. Kort svar + snabbfakta ---- */
    var sum = node("section", "hz8-pcx hz8-pcx-sum");
    sum.id = "hz8-pcx-sum"; sum.setAttribute("aria-labelledby", "hz8-pcx-sum-h");
    sum.innerHTML = '<div class="hz8-pcx-sum__paper" aria-hidden="true"></div><div class="hz8-pcx-sum__leaf hz8-pcx-sum__leaf--a" aria-hidden="true"></div><div class="hz8-pcx-sum__leaf hz8-pcx-sum__leaf--b" aria-hidden="true"></div><div class="hz8-pcx-sum__leaf hz8-pcx-sum__leaf--c" aria-hidden="true"></div><div class="hz8-pcx-sum__text"><h2 id="hz8-pcx-sum-h">' + esc(C.summary.h) + '</h2><p class="hz8-pcx-sum__lead"></p></div><ul class="hz8-pcx-sum__cues" aria-label="I korthet"></ul>';
    host.appendChild(sum);
    /* Ljuslagret bakom produktscen, köpdel och pappersband (85e-css): ett
       dekorativt element först i #store-main, utan innehåll. */
    var main = document.getElementById("store-main");
    if (main && !main.querySelector(":scope > .hz8-pcx-light")) {
      var light = node("div", "hz8-pcx-light"); light.setAttribute("aria-hidden", "true");
      main.insertBefore(light, main.firstChild);
    }
    function syncSummary() {
      var p = sum.querySelector(".hz8-pcx-sum__lead"), t = fill(C.summary.text);
      if (p.__h !== t) { p.innerHTML = t; p.__h = t; p.hidden = !t; }
      var nm = k.nameParts(k.productName()), ss = strains();
      var cue = {
        type: ["pen", (spec(/produkttyp/i) || nm.type || "").split("/")[0].trim()], size: ["drop", spec(/innehållsmängd|volym/i) || nm.size],
        brand: ["shop", brand], strains: ["leaf", ss.length ? ss.length + " strains" : ""]
      };
      var h = (C.cues || []).map(function (c) { return cue[c]; }).filter(function (c) { return c && c[1]; })
        .map(function (c) { return "<li>" + (ICONS[c[0]] || "") + "<span>" + esc(c[1]) + "</span></li>"; }).join("");
      var ul = sum.querySelector(".hz8-pcx-sum__cues");
      if (ul.__h !== h) { ul.innerHTML = h; ul.__h = h; ul.hidden = !h; }
    }

    /* ---- 2. Strains (tre åt gången) och labbrapporter ----
       Strainraden visar exakt tre hela kort per grupp: 1–3, 4–6, 7–9 …
       Antalet, bilderna, namnen och lagret läses ur de riktiga varianterna.
       En sista grupp med färre än tre fylls ut med tomma (dolda) celler så
       att bara de riktiga korten syns. Pilarna står direkt före och efter
       korten, inom modulen, och är avstängda vid början och slutet. Svep
       fungerar (scroll-snap per grupp). Klick väljer strain i köpdelen utan
       att sidan scrollar; slutsålda strains syns men går inte att välja. */
    var sa = node("section", "hz8-pcx hz8-pcx-sa");
    sa.id = "hz8-pcx-strains"; sa.setAttribute("aria-labelledby", "hz8-pcx-sa-h");
    var A = C.analysis || {};
    sa.innerHTML = '<div class="hz8-pcx-sa__head"><h2 id="hz8-pcx-sa-h">' + esc(C.strains.h) + '</h2><p>' + esc(C.strains.lead) + "</p></div>" +
      '<div class="hz8-pcx-sa__grid"><div class="hz8-pcx-sa__strip" role="group" aria-roledescription="karusell" aria-label="Strains, tre åt gången">' +
      '<button type="button" class="hz8-pcx-sa__arrow" data-dir="-1" aria-controls="hz8-pcx-sa-list" aria-label="Föregående tre strains">' + ICONS.prev + "</button>" +
      '<ul class="hz8-pcx-sa__list" id="hz8-pcx-sa-list" role="list"></ul>' +
      '<button type="button" class="hz8-pcx-sa__arrow" data-dir="1" aria-controls="hz8-pcx-sa-list" aria-label="Nästa tre strains">' + ICONS.next + "</button>" +
      '<p class="hz8-pcx-sa__pos" aria-live="polite"></p></div>' +
      '<aside class="hz8-pcx-ana" aria-labelledby="hz8-pcx-ana-h"><h3 id="hz8-pcx-ana-h">' + esc(A.h || "Labbrapporter") + '</h3><p class="hz8-pcx-ana__lead"></p><ul class="hz8-pcx-ana__docs" role="list">' +
      docs.map(function (d) { return '<li><a href="' + esc(d.href) + '" target="_blank" rel="noopener">' + ICONS.doc + '<span class="hz8-pcx-ana__t">' + esc(d.text) + '</span><span class="hz8-pcx-ana__m">PDF<span class="hz8-visually-hidden"> (öppnas i ny flik)</span></span>' + ICONS.ext + "</a></li>"; }).join("") +
      '</ul><p class="hz8-pcx-ana__note"></p></aside></div>';
    host.appendChild(sa);
    var saList = sa.querySelector(".hz8-pcx-sa__list"), saArrows = sa.querySelectorAll(".hz8-pcx-sa__arrow"), saPos = sa.querySelector(".hz8-pcx-sa__pos");
    var PER = 3, saPage = 0, saKeys = "", saPlaced = false;
    function saGap() { return parseFloat(getComputedStyle(saList).columnGap) || 0; }
    function saPages() { return Math.max(1, Math.ceil(strains().length / PER)); }
    function saStep() { return saList.clientWidth + saGap(); }
    /* Exakt startläge för grupp pg: första kortets läge i listan. */
    function saLeft(pg) { var c = saList.children[pg * PER], f = saList.firstElementChild; return c && f ? c.offsetLeft - f.offsetLeft : pg * saStep(); }
    function saGo(pg, smooth) {
      saPage = Math.max(0, Math.min(saPages() - 1, pg));
      saList.scrollTo({ left: saLeft(saPage), behavior: smooth && !window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "auto" });
      saUi();
    }
    function saUi() {
      var n = strains().length, last = saPages() - 1, had = document.activeElement;
      saArrows[0].disabled = saPage <= 0; saArrows[1].disabled = saPage >= last;
      if (had === saArrows[0] && saArrows[0].disabled && !saArrows[1].disabled) saArrows[1].focus();
      if (had === saArrows[1] && saArrows[1].disabled && !saArrows[0].disabled) saArrows[0].focus();
      sa.querySelector(".hz8-pcx-sa__strip").classList.toggle("is-single", last <= 0);
      var from = saPage * PER + 1, to = Math.min(n, from + PER - 1);
      var t = n ? (from === to ? from : from + "–" + to) + " av " + n + " strains" : "";
      if (saPos.textContent !== t) saPos.textContent = t;
      /* Kort utanför aktuell grupp kan inte fångas av Tab (de syns inte). */
      saList.querySelectorAll(".hz8-pcx-sa__item").forEach(function (b, i) { var on = Math.floor(i / PER) === saPage; b.tabIndex = on ? 0 : -1; b.closest("li").setAttribute("aria-hidden", on ? "false" : "true"); });
    }
    function syncStrains() {
      var ss = strains(), cur = String(k.currentValue());
      var keys = ss.map(function (s) { return s.id; }).join(",");
      if (keys !== saKeys) {
        saKeys = keys;
        var pad = (PER - ss.length % PER) % PER, h = ss.map(function (s) {
          return '<li><button type="button" class="hz8-pcx-sa__item" data-value="' + esc(s.id) + '" aria-pressed="false"><span class="hz8-pcx-sa__img"><img alt="" width="200" height="200" loading="lazy" decoding="async" hidden></span><span class="hz8-pcx-sa__name">' + esc(s.name) + '</span><span class="hz8-pcx-sa__stock"></span></button></li>';
        }).join("");
        for (var f = 0; f < pad; f++) h += '<li class="hz8-pcx-sa__filler" aria-hidden="true"></li>';
        saList.innerHTML = h;
      }
      /* Uppdateras på plats: ingen ny markup, inget fokus- eller scrollhopp. */
      ss.forEach(function (s, i) {
        var b = saList.children[i] && saList.children[i].firstChild; if (!b) return;
        var img = b.querySelector("img"), src = s.v ? k.variantThumb(s.v) : "";
        if (src && img.getAttribute("src") !== src) { img.src = src; img.hidden = false; }
        var stock = s.ok === null ? "" : s.ok ? "I lager" : "Slut";
        var st = b.querySelector(".hz8-pcx-sa__stock"); if (st.textContent !== stock) st.textContent = stock;
        b.classList.toggle("is-out", s.ok === false);
        if (s.ok === false) b.setAttribute("aria-disabled", "true"); else b.removeAttribute("aria-disabled");
        b.setAttribute("aria-pressed", String(String(s.id) === cur));
        b.setAttribute("aria-label", s.name + (stock ? ", " + stock.toLowerCase() : "") + (s.ok === false ? " – kan inte väljas" : " – välj i köpdelen"));
      });
      sa.querySelector(".hz8-pcx-sa__grid").classList.toggle("is-empty", !ss.length);
      if (!saPlaced && ss.length && ss.every(function (s) { return s.ok !== null; })) {
        /* Första gången: visa gruppen med vald strain. Sedan aldrig automatiskt. */
        saPlaced = true;
        var idx = ss.map(function (s) { return String(s.id); }).indexOf(cur);
        saGo(idx > 0 ? Math.floor(idx / PER) : 0, false);
      } else saUi();
      var miss = docsMissing(), lead = docs.length ? fill(A.text || "") : "", note;
      note = !docs.length ? 'Det finns inga labbrapporter i produktbeskrivningen just nu. <a href="' + esc(contactHref()) + '">Kontakta kundservice</a> om du vill ha underlag.'
        : miss.length && ss.length ? "Ingen egen rapport här för " + esc(list(miss)) + '. <a href="' + esc(contactHref()) + '">Kontakta kundservice</a> om du vill ha underlag.' : "";
      var lp = sa.querySelector(".hz8-pcx-ana__lead"), np = sa.querySelector(".hz8-pcx-ana__note");
      if (lp.__h !== lead) { lp.innerHTML = lead; lp.__h = lead; lp.hidden = !lead; }
      if (np.__h !== note) { np.innerHTML = note; np.__h = note; np.hidden = !note; }
    }
    saList.addEventListener("click", function (e) {
      var b = e.target.closest(".hz8-pcx-sa__item"); if (!b || b.getAttribute("aria-disabled") === "true") return;
      var v = b.getAttribute("data-value");
      saList.querySelectorAll(".hz8-pcx-sa__item").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      k.chooseValue(v);
      window.setTimeout(function () { k.syncStation(); syncAll(); }, 80);
    });
    /* Tangentbord: vänster/höger mellan kort; vid gruppkant byts grupp. */
    saList.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var items = Array.prototype.slice.call(saList.querySelectorAll(".hz8-pcx-sa__item")), i = items.indexOf(document.activeElement);
      if (i < 0) return;
      var j = Math.max(0, Math.min(items.length - 1, i + (e.key === "ArrowRight" ? 1 : -1)));
      if (j === i) return;
      e.preventDefault();
      if (Math.floor(j / PER) !== saPage) saGo(Math.floor(j / PER), true);
      items[j].tabIndex = 0; items[j].focus({ preventScroll: true });
    });
    saArrows.forEach(function (btn) { btn.addEventListener("click", function () { if (!btn.disabled) saGo(saPage + +btn.getAttribute("data-dir"), true); }); });
    var saRaf = 0;
    saList.addEventListener("scroll", function () {
      if (saRaf) return;
      saRaf = window.requestAnimationFrame(function () { saRaf = 0; var pg = Math.round(saList.scrollLeft / saStep()); if (pg !== saPage) { saPage = pg; saUi(); } });
    }, { passive: true });
    window.addEventListener("resize", function () { saList.scrollTo({ left: saLeft(saPage) }); }, { passive: true });

    /* ---- 3. Om produkten ----
       Produkttexten delas vid sina EGNA rubriker (h2-h4 och fristående
       "<strong>Rubrik:</strong>") i grupper. Innehållsposten (C.chapter.
       sections) säger vilka grupper som visas öppet och i vilken kolumn;
       allt annat -- i originalordning -- ligger i "Full produktinformation"
       (<details>, i DOM från start). Noderna FLYTTAS, inget kopieras eller
       skrivs om. Rubrik som bara upprepar kapitelrubriken ovan döljs. */
    var CH = C.chapter;
    var ch = node("section", "hz8-pcx hz8-pcx-ch");
    ch.id = "hz8-pcx-om"; ch.setAttribute("aria-labelledby", "hz8-pcx-ch-h");
    ch.innerHTML = '<h2 id="hz8-pcx-ch-h">' + esc(CH.h) + "</h2>" +
      '<div class="hz8-pcx-ch__grid"><div class="hz8-pcx-ch__col hz8-pcx-ch__col--a"></div><div class="hz8-pcx-ch__col hz8-pcx-ch__col--b"></div></div>' +
      '<details class="hz8-pcx-full" id="hz8-pcx-full"><summary><span class="hz8-pcx-full__t">' + esc(CH.fullH) + '</span><span class="hz8-pcx-full__n">' + esc(CH.fullNote) + '</span><span class="hz8-pcx-faq__mark" aria-hidden="true"></span></summary><div class="hz8-pcx-full__body"></div></details>';
    host.appendChild(ch);
    var colA = ch.querySelector(".hz8-pcx-ch__col--a"), colB = ch.querySelector(".hz8-pcx-ch__col--b"), fullBody = ch.querySelector(".hz8-pcx-full__body");
    var specsBox = node("div", "hz8-pcx-ch__specs", "<h3>" + esc(CH.specsH) + '</h3><dl class="hz8-pcx-ch__dl"></dl>');
    /* Bild i uppslaget: innehållspostens stämningsbild med känt ursprung
       (C.chapter.image, README i assets-mappen) -- aldrig samma
       produktförpackning en gång till. Saknas den visas ingen bild. */
    var CI = CH.image, fig = node("figure", "hz8-pcx-ch__fig");
    if (CI && k.assetBase) fig.innerHTML = '<picture><source media="(max-width: 767px)" srcset="' + esc(k.assetBase + CI.mobile) + '"><img src="' + esc(k.assetBase + CI.desktop) + '" alt="" width="' + CI.w + '" height="' + CI.h + '" loading="lazy" decoding="async"></picture>';
    fig.hidden = !(CI && k.assetBase);
    var isHead = function (n) {
      if (n.nodeType !== 1) return false;
      if (/^H[1-6]$/.test(n.tagName)) return true;
      return /^(STRONG|B)$/.test(n.tagName) && /:\s*$/.test(n.textContent.trim()) && n.textContent.trim().length < 60;
    };
    var headText = function (n) { return n.textContent.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "").replace(/\s+/g, " ").trim(); };
    if (article) {
      k.adoptDescription(article, null);
      var root = article.querySelector(":scope > .content") || article;
      /* Tomma stycken och radbrytningar ur adminens editor döljs (ingen
         text). Dolda rubriker (t.ex. "Beskrivning av …") följer med till
         Full produktinformation. */
      root.querySelectorAll("p, div, span").forEach(function (el) {
        if (!el.textContent.replace(/[\s ]+/g, "") && !el.querySelector("img, a, iframe")) el.hidden = true;
      });
      var groups = [{ head: null, nodes: [] }];
      Array.prototype.slice.call(article.childNodes).forEach(function (n) { if (n !== root) groups[0].nodes.push(n); });
      Array.prototype.slice.call(root.childNodes).forEach(function (n) {
        if (isHead(n) && !n.hidden) groups.push({ head: n, title: headText(n), nodes: [n] });
        else groups[groups.length - 1].nodes.push(n);
      });
      var used = {};
      (CH.sections || []).forEach(function (sec) {
        var box = node("div", "hz8-pcx-ch__sec");
        var hits = groups.filter(function (g, i) { return g.head && !used[i] && sec.match.some(function (re) { return re.test(g.title); }) && (used[i] = true); });
        if (!hits.length) return;
        hits.forEach(function (g, j) {
          /* Första gruppens rubrik är sektionens; följande gruppers rubriker
             i samma sektion (t.ex. "Vad är …?", som redan är H2 ovan) döljs. */
          if (j > 0 || sec.hideHead) { g.head.hidden = true; g.head.setAttribute("data-hz8-merged-heading", ""); }
          g.nodes.forEach(function (n) { box.appendChild(n); });
        });
        (sec.col === "b" ? colB : colA).appendChild(box);
      });
      colB.appendChild(fig);
      /* Specifikationerna under bilden i högerspalten när den har innehåll
         (balanserar den långa vänstertexten), annars i vänsterspalten. */
      (colB.querySelector(".hz8-pcx-ch__sec") || !fig.hidden ? colB : colA).appendChild(specsBox);
      /* Resten i originalordning, inklusive labbrapportlänkarna (synliga). */
      var restRoot = node("div", "product-description hz8-pcx-full__text");
      groups.forEach(function (g, i) { if (!used[i]) g.nodes.forEach(function (n) { restRoot.appendChild(n); }); });
      /* De delar som flyttats ut lämnar originalbehållaren tom: den
         (#product-information-artikeln) hamnar sist i Full produktinformation. */
      fullBody.appendChild(restRoot);
      article.hidden = !article.textContent.trim();
      fullBody.appendChild(article);
      restRoot.querySelectorAll("ul, ol").forEach(function (l) { l.hidden = false; });
      restRoot.querySelectorAll("p").forEach(function (pp) { if (/^\s*produktinformation\s*:?\s*$/i.test(pp.textContent)) pp.hidden = false; });
      ch.querySelectorAll("br").forEach(function (br) {
        var prev = br.previousSibling;
        while (prev && prev.nodeType === 3 && !prev.textContent.trim()) prev = prev.previousSibling;
        if (/^(UL|OL)$/.test(br.parentNode.nodeName) || !prev || prev.nodeName === "BR" || /^(P|UL|OL|H\d|DIV)$/.test(prev.nodeName) || prev.hidden) br.style.display = "none";
      });
      /* Emoji i rubrikerna är dekor: visas inte, läses inte upp. */
      ch.querySelectorAll("h2 span, h3 span, h4 span").forEach(function (sp) { if (!headText(sp) && sp.textContent.trim()) sp.hidden = true; });
      markClaims(ch);
      /* Bara en spalt med innehåll (t.ex. inget tillverkarkapitel): uppslaget
         blir en spalt i stället för en tom halva. */
      ch.querySelector(".hz8-pcx-ch__grid").classList.toggle("is-single", !colB.querySelector(".hz8-pcx-ch__sec") && fig.hidden);
    } else { colA.appendChild(specsBox); colB.appendChild(fig); }
    function syncSpecs() {
      var rows = (C.specs || []).map(function (lab) { var r = specs.filter(function (x) { return x[0].toLowerCase() === lab.toLowerCase(); })[0]; return r ? [r[0] === "Innehållsmängd" ? "Volym" : r[0], esc(r[1])] : null; }).filter(Boolean);
      if (brand) rows.splice(1, 0, ["Tillverkare", '<a href="' + esc(brandA.getAttribute("href")) + '">' + esc(brand) + "</a>"]);
      var n = strains().length; if (n) rows.push(["Strains", String(n)]);
      var h = rows.map(function (r) { return "<div><dt>" + esc(r[0]) + "</dt><dd>" + r[1] + "</dd></div>"; }).join("");
      var dl = ch.querySelector(".hz8-pcx-ch__dl");
      if (dl.__h !== h) { dl.innerHTML = h; dl.__h = h; dl.parentNode.hidden = !h; }
    }

    /* ---- 4. Vanliga frågor ---- */
    var faq = node("section", "hz8-pcx hz8-pcx-faq");
    faq.id = "hz8-pcx-faq"; faq.setAttribute("aria-labelledby", "hz8-pcx-faq-h");
    faq.innerHTML = '<h2 id="hz8-pcx-faq-h">' + esc(C.faq.h) + '</h2><div class="hz8-pcx-faq__list"></div><p class="hz8-pcx-faq__more"><a href="' + esc(HZ8.link("/sv/page/faq")) + '">Alla vanliga frågor</a></p>';
    host.appendChild(faq);
    var faqList = faq.querySelector(".hz8-pcx-faq__list");
    faqList.innerHTML = C.faq.items.map(function (it, i) {
      return '<details class="hz8-pcx-faq__item" data-i="' + i + '"><summary><h3>' + esc(it.q) + '</h3><span class="hz8-pcx-faq__mark" aria-hidden="true"></span></summary><div class="hz8-pcx-faq__a"><p></p></div></details>';
    }).join("");
    function syncFaq() {
      faqList.querySelectorAll(".hz8-pcx-faq__item").forEach(function (d) {
        var it = C.faq.items[+d.getAttribute("data-i")], h = fill(it.a), p = d.querySelector("p");
        if (p.__h !== h) { p.innerHTML = h; p.__h = h; }
        d.hidden = !h;
      });
    }

    /* ---- 5. Upptäck fler (karusell, riktiga produktkort) ---- */
    var slot = node("div", "hz8-pcx-more-slot"); host.appendChild(slot);
    buildMore(slot);

    /* ---- 6. Kundomdömen (bara riktiga, godkända omdömen) ---- */
    var rev = node("div", "hz8-ppc__reviews hz8-pcx-rev"); rev.id = "omdomen"; host.appendChild(rev);
    rev.hidden = true;
    k.loadReviews(400).then(function (all) {
      var seen = {};
      all = (all || []).filter(function (r) {
        var key = r && (r.id || (r.name + "@" + r.created_at + "@" + r.review));
        if (!r || !(r.rating >= 1 && r.rating <= 5) || seen[key]) return false;
        seen[key] = true; return true;
      });
      S.reviews = all;
      var html = all.length ? k.reviewsHtml(all, C.reviews && C.reviews.h) : "";
      if (!html) { rev.remove(); k.syncStation(); return; }
      rev.innerHTML = html; rev.hidden = false;
      var btn = rev.querySelector(".hz8-pr__all"), full = rev.querySelector(".hz8-pr__full");
      /* Alla omdömen ligger i DOM från början (sök/indexering); knappen
         visar dem bara. */
      full.innerHTML = all.map(function (r) { return k.reviewItem(r); }).join("");
      btn.addEventListener("click", function () {
        var open = btn.getAttribute("aria-expanded") === "true";
        full.hidden = open; btn.setAttribute("aria-expanded", String(!open));
        btn.firstChild.textContent = open ? "Läs alla " + all.length + " omdömen " : "Visa färre omdömen ";
      });
      k.syncStation();
    });

    /* ---- 7. Relaterade kategorier + kundservice (befintliga noder) ---- */
    var rel = document.querySelector(".related-categories");
    if (rel) {
      host.appendChild(rel);
      if (brandA && !rel.querySelector(".hz8-pp-brandlink")) rel.insertAdjacentHTML("beforeend", '<p class="hz8-pp-brandlink"><a href="' + esc(brandA.getAttribute("href")) + '">Alla produkter från ' + esc(brand) + "</a></p>");
    }
    var help = document.querySelector(".hz8-pdp-help"); if (help) host.appendChild(help);
    var native = document.querySelector(".product-page-lists__similar-products"); if (native) native.hidden = true;
    var recent = document.querySelector(".product-page-lists__recently-visited-products"); if (recent) recent.hidden = true;
    var lists = document.querySelector(".product-page-lists"); if (lists) lists.hidden = true;

    /* Granskningsläge (?hz8-factcheck=1): befintliga formuleringar som ska
       faktagranskas markeras i texten. Kunden ser dem aldrig markerade --
       och de lyfts inte till fakta, specifikationer eller nya moduler. */
    function markClaims(root) {
      if (!/[?&]hz8-factcheck=1/.test(location.search) || !C.factcheck) return;
      document.documentElement.classList.add("hz8-factcheck");
      var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), nodes = [], t;
      while ((t = walker.nextNode())) nodes.push(t);
      /* Varje textnod: tidigaste träffen bland alla formuleringar markeras,
         sedan fortsätter sökningen i resten av noden. */
      nodes.forEach(function mark(tn) {
        if (!tn || !tn.parentNode || tn.parentNode.closest("mark")) return;
        var hit = null;
        C.factcheck.forEach(function (fc) { var m = tn.textContent.match(fc.re); if (m && (!hit || m.index < hit.m.index)) hit = { m: m, fc: fc }; });
        if (!hit) return;
        var mid = tn.splitText(hit.m.index), rest = mid.splitText(hit.m[0].length);
        var mk = document.createElement("mark"); mk.className = "hz8-fc"; mk.setAttribute("data-why", hit.fc.why); mk.title = "Faktagranskas: " + hit.fc.why;
        mid.parentNode.insertBefore(mk, mid); mk.appendChild(mid);
        mark(rest);
      });
    }

    function syncAll() { syncSummary(); syncStrains(); syncSpecs(); syncFaq(); }
    syncAll();
    var t = 0; HZ8.watch(function () { window.clearTimeout(t); t = window.setTimeout(syncAll, 90); });
    var sel = document.querySelector("#product-variants select");
    if (sel) sel.addEventListener("change", function () { window.setTimeout(syncAll, 80); });
    [600, 1800, 4000].forEach(function (ms) { window.setTimeout(syncAll, ms); });

    /* Karusell "Upptäck fler": små egna produktkort (bild, varumärke,
       namn, riktigt pris) ur produktens vapekategorier, prioritetsordning
       enligt innehållsposten. Bort: aktuell PDP, paketartiklar (alla
       paketroutes i HZ8.packageTable + "N-pack" i namnet), frakt/avgift och
       serier som inte marknadsförs just nu (C.more.exclude, bara i den här
       karusellen -- katalogen ändras inte). Namn med dubbelkodade tecken
       (&amp;amp;) avkodas. */
    function decode(t) { var ta = document.createElement("textarea"), n = 0; t = String(t || ""); while (/&(amp|#\d+|quot|lt|gt);/.test(t) && n++ < 3) { ta.innerHTML = t; t = ta.value; } return t.replace(/\s+/g, " ").trim(); }
    function buildMore(slot) {
      var M = C.more; if (!M) { slot.remove(); return; }
      var packRoutes = {};
      var PT = HZ8.packageTable || {};
      Object.keys(PT).forEach(function (id) { (PT[id].packs || []).forEach(function (p) { packRoutes[pathOf(p.route)] = true; }); });
      var taken = {}; taken[here] = true;
      Promise.all(M.sources.map(function (src) { return HZ8.fetchPage(src, HZ8.categoryCards).catch(function () { return []; }); })).then(function (groups) {
        var items = [];
        groups.forEach(function (g) {
          var ok = [];
          g.forEach(function (c) {
            var d = document.createElement("div"); d.innerHTML = c.html;
            var a = d.querySelector("a[href*='/products/']"), nameEl = d.querySelector(".name"), price = d.querySelector(".price ins") || d.querySelector(".price"), img = d.querySelector("img");
            if (!a || !nameEl || !price) return;
            var href = a.getAttribute("href"), p = pathOf(href), name = decode(nameEl.textContent);
            if (taken[p] || packRoutes[p] || /\b\d+\s*[-‑]?\s*pack\b|paket|frakt|avgift|presentkort/i.test(name)) return;
            if (M.exclude && M.exclude.test(name)) return;
            taken[p] = true;
            ok.push({ href: href, name: name, brand: decode((d.querySelector(".brand") || {}).textContent), price: decode(price.textContent), img: img ? img.getAttribute("src") || img.getAttribute("data-src") || "" : "" });
          });
          if (M.preferBrand && brand) ok = ok.filter(function (c) { return c.brand === brand; }).concat(ok.filter(function (c) { return c.brand !== brand; }));
          items = items.concat(ok);
        });
        items = items.slice(0, M.limit || 10);
        if (items.length < 2) { slot.remove(); return; }
        var sec = node("section", "hz8-pcx hz8-pcx-more");
        sec.id = "liknande"; sec.setAttribute("aria-labelledby", "hz8-pcx-more-h"); sec.setAttribute("data-hz8-ms-rail", "");
        sec.innerHTML = '<div class="hz8-pcx-more__head"><h2 id="hz8-pcx-more-h">' + esc(M.h) + "</h2>" + navHtml("hz8-pcx-more-list", "produkter") +
          '<a class="hz8-pcx-more__all" href="' + esc(HZ8.link(M.all.href)) + '">' + esc(M.all.label) + "</a></div>" +
          '<ul class="hz8-pcx-more__list" id="hz8-pcx-more-list" role="list">' + items.map(function (it) {
            return '<li><a class="hz8-pcx-more__card" href="' + esc(it.href) + '">' +
              '<span class="hz8-pcx-more__img">' + (it.img ? '<img src="' + esc(it.img) + '" alt="" width="180" height="180" loading="lazy" decoding="async">' : "") + "</span>" +
              '<span class="hz8-pcx-more__txt"><span class="hz8-pcx-more__name">' + esc(it.name) + '</span><span class="hz8-pcx-more__brand">' + esc(it.brand) + '</span><span class="hz8-pcx-more__price">' + esc(it.price) + "</span></span>" +
              '<span class="hz8-pcx-more__go" aria-hidden="true">' + ICONS.next + "</span></a></li>";
          }).join("") + "</ul>";
        slot.replaceWith(sec);
        bindScroller(sec, sec.querySelector(".hz8-pcx-more__list"));
      }, function () { slot.remove(); });
    }
  };

  /* ---- delad svepbar lista: pilar i rubriken, avstängda vid kanterna,
     dolda utan overflow; tangentbord via vanliga knappar + Tab ---- */
  function navHtml(listId, what) {
    return '<div class="hz8-pcx-nav" role="group" aria-label="Bläddra bland ' + what + '" hidden>' +
      '<button type="button" class="hz8-pcx-nav__btn" data-dir="-1" aria-controls="' + listId + '" aria-label="Föregående">' + ICONS.prev + "</button>" +
      '<button type="button" class="hz8-pcx-nav__btn" data-dir="1" aria-controls="' + listId + '" aria-label="Nästa">' + ICONS.next + "</button></div>";
  }
  function scrollSync(sec) {
    var list = sec.querySelector("[role=list]"), nav = sec.querySelector(".hz8-pcx-nav");
    if (!list || !nav) return;
    var max = list.scrollWidth - list.clientWidth;
    nav.hidden = max <= 2;
    var b = nav.querySelectorAll("button");
    b[0].disabled = list.scrollLeft <= 2; b[1].disabled = list.scrollLeft >= max - 2;
  }
  function bindScroller(sec, list) {
    var nav = sec.querySelector(".hz8-pcx-nav"); if (!nav) return;
    nav.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b || b.disabled) return;
      var li = list.querySelector("li"), step = li ? li.getBoundingClientRect().width + (parseFloat(getComputedStyle(list).columnGap) || 0) : list.clientWidth * .8;
      var per = Math.max(1, Math.floor(list.clientWidth / step) - 1);
      list.scrollBy({ left: +b.getAttribute("data-dir") * step * per, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    });
    var r = 0, later = function () { if (!r) r = window.requestAnimationFrame(function () { r = 0; scrollSync(sec); }); };
    list.addEventListener("scroll", later, { passive: true });
    window.addEventListener("resize", later, { passive: true });
    window.setTimeout(later, 500);
  }

  var SV = ' viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"';
  var ICONS = {
    pen: "<svg" + SV + ' width="30" height="30" stroke-width="1.3"><path d="M16.5 3.5l4 4L9 19l-4.5.5L5 15z"/><path d="M14 6l4 4M5 15l4 4"/></svg>',
    drop: "<svg" + SV + ' width="30" height="30" stroke-width="1.3"><path d="M12 3.5c3 3.6 5.5 6.8 5.5 10a5.5 5.5 0 0 1-11 0c0-3.2 2.5-6.4 5.5-10z"/></svg>',
    shop: "<svg" + SV + ' width="30" height="30" stroke-width="1.3"><path d="M4 9.5V20h16V9.5M3 9.5l1.6-5h14.8l1.6 5zM3 9.5a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0M10 20v-5h4v5"/></svg>',
    leaf: "<svg" + SV + ' width="30" height="30" stroke-width="1.3"><path d="M5 19C5 10 10 5 20 4c0 9-5 15-15 15zM5 19l8-8"/></svg>',
    doc: "<svg" + SV + ' width="22" height="22" stroke-width="1.4"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 12h7M9 15.5h7"/></svg>',
    ext: "<svg" + SV + ' width="16" height="16" stroke-width="1.6"><path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6"/></svg>',
    prev: "<svg" + SV + ' width="18" height="18" stroke-width="1.7"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>',
    next: "<svg" + SV + ' width="18" height="18" stroke-width="1.7"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
  };
})();
