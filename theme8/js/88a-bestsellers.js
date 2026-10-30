/* Bästsäljare (TASK 11) -- /sv/page/vara-bastsaljare som en avgränsad
   anpassning av den accepterade Alla produkter-portalen (C07): samma hero,
   verktygsrad, listrubrik, portalkort och formatrutor, på Nyehandels
   innehållssida. Sidan får portalens sidmarkörer (hz8-cat-pilot,
   hz8-cat-portal, data-hz8-page="category", data-hz8-shell="broad") så att
   portalens CSS gäller oförändrad; allt sidunikt ligger här och i
   88a-bestsellers.css.

   Data (inget hårdkodat):
   - Källa = sidans eget aktiva adminurval (HZ8.bestsellerSource, samma som
     startsidan, Butik och PDP:n): /sv/categories/alla-produkter?sort=popular,
     alla sidor, i Nyehandels ordning. Kort utan varumärke (tjänsteposter)
     och dubbletter tas bort.
   - Format = medlemskap på formatets riktiga kategorisida (HZ8.catalog),
     samma ordning. Flikar bara för Vapes, Carts, Buds och Hasch med ≥ 1
     träff (B2: batterier visas under Alla, ingen egen flik).
   - I lager = Nyehandels eget lagerfilter (smart-filter_in-stock).
   - Kortet = portalkortet (HZ8.decoratePortalCard, 80-category.js) +
     köpknappen från 03-product-card.js (1 variant: Lägg till via Vuex,
     fler: Välj -> PDP). Betyg bara när Nyehandel har omdömen.
   - Inga ranknummer, inga "sålda", inget hårdkodat Trustpilot-betyg (B1).
   - Antal: "Visar N av M" med det riktiga antalet (B3).
   - Nyehandels adminblock (hero, .nh-bs-filters, [data-nh-source],
     sektionerna) lämnas orörda och döljs bara visuellt (B4).

   URL: ?typ=<format> (pushState), ?filters=smart-filter_in-stock (pushState),
   ?visa=<antal> (replaceState). Bakåt/framåt/omladdning återställer. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  if (!HZ8) return;

  var ROUTE = /^\/[a-z]{2}\/page\/vara-bastsaljare\/?$/;
  HZ8.isBestsellerPage = function () { return ROUTE.test(location.pathname); };

  var STEP = 12;
  var MAX_PAGES = 40;
  var STOCK_TOKEN = "smart-filter_in-stock";
  var TAB_KEYS = ["vapes", "carts", "buds", "hasch"];
  var TP_TEMPLATE = "5419b637fa0340045cd0c936";
  var TP_UNIT = "6479dc28f0b041b3c79af588";
  var TP_REVIEW = "https://se.trustpilot.com/review/hazey.se";
  var SWISH_IMG = "https://www.hazey.se/wp-content/uploads/2023/04/Swish-Logo-Secondary-Light-BG.png";
  var FAQ_PICK = [/hur snabbt/i, /diskret/i, /hur betalar/i];
  var PORTAL_LABEL = { batterier: "Tillbehör" };

  var esc = function (v) { return HZ8.esc(v); };
  var link = function (h) { return HZ8.link(h); };
  function node(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function reduced() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
  var CHEV_DOWN = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 9l6 6 6-6"/></svg>';
  var CHEV_UP = CHEV_DOWN.replace("M6 9l6 6 6-6", "M6 15l6-6 6 6");
  var FILTER_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true" focusable="false"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>';

  /* ---------------- Data ---------------- */
  function cardPath(html) {
    var m = html.match(/href="([^"]*\/products\/[^"]+)"/);
    return m ? HZ8.path(m[1]).split("?")[0].replace(/\/\d+$/, "") : "";
  }
  function cardBrand(html) {
    var m = html.match(/class="brand"[^>]*>\s*([^<]*?)\s*</);
    return m ? m[1].trim() : "";
  }
  function cardName(html) {
    var m = html.match(/class="name"[^>]*>\s*([^<]*?)\s*</);
    return m ? m[1].replace(/&amp;/g, "&").trim() : "";
  }
  function withParam(href, key, value) { return href + (href.indexOf("?") === -1 ? "?" : "&") + key + "=" + value; }
  function withPage(href, page) { return page < 2 ? href : withParam(href, "page", page); }
  /* Alla kort på en kategorisida (alla sidor, Nyehandels ordning). Samma
     regel som portalen: antalet ur sidans egen räknare måste stämma. */
  function allCards(href) {
    return Promise.all([HZ8.fetchPage(href, HZ8.categoryInfo), HZ8.fetchPage(href, HZ8.categoryCards)]).then(function (first) {
      var total = first[0].count, page1 = first[1];
      if (!page1.length && !total) return [];   /* riktig nolla (räknare 0 eller saknas) */
      if (total == null || !page1.length) throw new Error("count");
      if (total <= page1.length) return page1;
      var pages = Math.ceil(total / page1.length);
      if (pages > MAX_PAGES) throw new Error("size");
      var jobs = [];
      for (var p = 2; p <= pages; p += 1) jobs.push(HZ8.fetchPage(withPage(href, p), HZ8.categoryCards));
      return Promise.all(jobs).then(function (lists) { return page1.concat.apply(page1, lists); });
    });
  }
  /* Branded, unika kort i ordning. */
  function clean(cards) {
    var seen = {}, out = [];
    (cards || []).forEach(function (c) {
      var path = cardPath(c.html);
      if (!path || seen[path] || !cardBrand(c.html)) return;
      seen[path] = true;
      out.push({ path: path, html: c.html, name: cardName(c.html) });
    });
    return out;
  }
  function sourceHref() {
    var src = HZ8.bestsellerSource ? HZ8.bestsellerSource.run(document) : {};
    var href = src.cat ? "/sv/categories/" + src.cat : src.source || "/sv/categories/alla-produkter";
    return src.fixed ? href : withParam(href, "sort", "popular");
  }

  var D = { list: null, first: null, member: {}, typeOf: {}, stock: null, error: false, ready: false, formats: [] };
  var V = { fam: "", stock: false, visible: STEP };

  /* ---------------- URL-tillstånd ---------------- */
  function readUrl() {
    var q = new URLSearchParams(location.search);
    var fam = q.get("typ") || "";
    V.fam = TAB_KEYS.indexOf(fam) !== -1 ? fam : "";
    V.stock = (q.get("filters") || "").split("~").indexOf(STOCK_TOKEN) !== -1;
    var n = parseInt(q.get("visa"), 10);
    V.visible = n > STEP ? Math.ceil(n / STEP) * STEP : STEP;
  }
  function urlFor(fam, stock, visible) {
    var q = new URLSearchParams(location.search);
    if (fam) q.set("typ", fam); else q.delete("typ");
    var tokens = (q.get("filters") || "").split("~").filter(function (t) { return t && t !== STOCK_TOKEN; });
    if (stock) tokens.push(STOCK_TOKEN);
    if (tokens.length) q.set("filters", tokens.join("~")); else q.delete("filters");
    if (visible > STEP) q.set("visa", String(visible)); else q.delete("visa");
    var s = q.toString();
    return location.pathname + (s ? "?" + s : "") + location.hash;
  }

  /* ---------------- Lista ---------------- */
  function current() {
    var list = D.list || D.first || [];
    if (V.fam) list = list.filter(function (c) { return D.member[V.fam] && D.member[V.fam][c.path]; });
    if (V.stock && D.stock) list = list.filter(function (c) { return D.stock[c.path]; });
    return list;
  }
  function countFor(fam) {
    var list = D.list || [];
    if (fam) list = list.filter(function (c) { return D.member[fam] && D.member[fam][c.path]; });
    if (V.stock && D.stock) list = list.filter(function (c) { return D.stock[c.path]; });
    return list.length;
  }

  var R = {}; // element-referenser

  function decorate(cell, c) {
    var card = cell.querySelector(".product-card");
    if (!card || !HZ8.decoratePortalCard) return;
    HZ8.decoratePortalCard(card, { paused: false, type: D.typeOf[c.path] || null, series: [], weights: true, stock: D.stock ? !!D.stock[c.path] : null });
  }
  function cellFor(c) {
    var cell = node("div", "", c.html);
    cell.setAttribute("data-hz8-path", c.path);
    cell.querySelectorAll("[id]").forEach(function (el) { el.removeAttribute("id"); });
    decorate(cell, c);
    return cell;
  }
  function skeleton() {
    var html = "";
    for (var i = 0; i < STEP; i += 1) html += '<div class="hz8-bs-skel" aria-hidden="true"><span class="hz8-bs-skel__img"></span><span class="hz8-bs-skel__line is-xs"></span><span class="hz8-bs-skel__line"></span><span class="hz8-bs-skel__line is-short"></span><span class="hz8-bs-skel__line is-chip"></span><span class="hz8-bs-skel__line is-xs"></span><span class="hz8-bs-skel__btn"></span></div>';
    return html;
  }

  /* Rendera rutnätet (idempotent, se nedan). */
  function renderGrid() {
    var grid = R.grid;
    if (D.error && !D.first) {
      grid.removeAttribute("aria-busy");
      grid.setAttribute("data-hz8-state", "error");
      grid.innerHTML = '<div class="hz8-bs-state hz8-bs-state--error"><p>Bästsäljarna kunde inte laddas. Försök igen om en stund.</p><button type="button" class="hz8-pcta" data-bs="retry">Försök igen</button></div>';
      R.more.hidden = true; R.guide.hidden = true;
      return;
    }
    /* Filtrerad vy (?typ= / I lager) väntar på hela listan och medlemskapet. */
    if (!D.first || ((V.fam || V.stock) && !D.ready)) { grid.setAttribute("aria-busy", "true"); grid.removeAttribute("data-hz8-state"); if (!grid.querySelector(".hz8-bs-skel")) grid.innerHTML = skeleton(); R.more.hidden = true; return; }
    grid.removeAttribute("aria-busy");
    grid.removeAttribute("data-hz8-state");
    var list = current();
    var total = D.list ? list.length : null;
    if (!list.length && (D.list || !V.fam)) {
      var all = !V.fam && !V.stock;
      var kind = all ? "empty" : "empty-format";
      if (grid.getAttribute("data-hz8-state") !== kind) grid.innerHTML = all
        ? '<div class="hz8-bs-state"><p><strong>Inga bästsäljare just nu.</strong></p><a class="hz8-pcta" href="' + esc(link("/sv/categories/alla-produkter")) + '">Alla produkter</a></div>'
        : '<div class="hz8-bs-state"><p><strong>Inga bästsäljare i det här formatet just nu.</strong><br>Välj ett annat format eller visa hela listan.</p><button type="button" class="hz8-pcta" data-bs="reset">Visa alla bästsäljare</button></div>';
      grid.setAttribute("data-hz8-state", kind);
      R.more.hidden = true;
      if (all && !(D.list || []).length) R.guide.hidden = true;   /* annars styr syncGuide (rutor med träffar) */
      return;
    }
    /* Idempotent: samma lista -> inget ritas om; en förlängning läggs till
       (expansion), annars byggs rutnätet om. */
    var show = list.slice(0, V.visible);
    var cells = grid.querySelectorAll(":scope > [data-hz8-path]");
    var prefix = cells.length <= show.length && grid.children.length === cells.length;
    for (var i = 0; prefix && i < cells.length; i += 1) prefix = cells[i].getAttribute("data-hz8-path") === show[i].path;
    if (!prefix) { grid.innerHTML = ""; cells = []; }
    var frag = document.createDocumentFragment();
    show.slice(cells.length).forEach(function (c) { frag.appendChild(cellFor(c)); });
    if (frag.childNodes.length) grid.appendChild(frag);
    syncMore(show.length, total);
  }
  function syncMore(shown, total) {
    var more = R.more;
    if (total == null || total <= STEP) { more.hidden = true; return; }
    more.hidden = false;
    var txt = "Visar " + shown + " av " + total;
    var p = more.querySelector(".hz8-bs-more__text");
    if (p.textContent !== txt) p.textContent = txt;
    /* "Visa fler bästsäljare" (+12 per klick) finns kvar tills allt visas
       och tas då bort ur fokus- och tillgänglighetsträdet (hidden); efter
       första expansionen visas även en sekundär "Visa färre". Samma läge
       efter omladdning med ?visa=. */
    var expanded = V.visible > STEP;
    var btn = more.querySelector(".hz8-bs-more__btn"), less = more.querySelector(".hz8-bs-more__less");
    btn.hidden = shown >= total;
    btn.setAttribute("aria-expanded", String(expanded));
    less.hidden = !expanded;
  }
  function redecorateAll() {
    R.grid.querySelectorAll(":scope > [data-hz8-path]").forEach(function (cell) {
      var path = cell.getAttribute("data-hz8-path");
      var c = (D.list || D.first || []).filter(function (x) { return x.path === path; })[0];
      if (c) decorate(cell, c);
    });
  }

  /* ---------------- Flikar och lager ---------------- */
  function syncTabs() {
    var fam = R.tabs;
    /* Bygg bara om när flikuppsättningen ändras; valt läge sätts på plats
       (fokus ligger kvar på den klickade fliken). */
    var html = '<button type="button" class="hz8-pfam__tab" data-fam="">Alla</button>' +
      D.formats.filter(function (f) { return TAB_KEYS.indexOf(f.key) !== -1 && (!D.list || countFor(f.key) > 0 || V.fam === f.key); }).map(function (f) {
        return '<button type="button" class="hz8-pfam__tab" data-fam="' + esc(f.key) + '">' + esc(f.label) + "</button>";
      }).join("");
    if (fam.__html !== html) { fam.innerHTML = html; fam.__html = html; }
    fam.querySelectorAll(".hz8-pfam__tab").forEach(function (t) { t.setAttribute("aria-pressed", String(t.getAttribute("data-fam") === V.fam)); });
    fam.classList.toggle("is-more", fam.scrollWidth > fam.clientWidth + 2);
    var sw = R.stock;
    sw.hidden = !D.stock;
    sw.setAttribute("aria-checked", String(V.stock));
    syncGuide();
  }
  function syncGuide() {
    var list = R.guide.querySelector(".hz8-proutes__list");
    var items = D.formats.filter(function (f) { return TAB_KEYS.indexOf(f.key) !== -1 && D.list && countFor(f.key) > 0; });
    var html = items.map(function (f) {
      var sub = guideSub(f.key);
      return '<li class="hz8-proutes__item"><button type="button" class="hz8-proutes__card hz8-bs-fmt" data-fam="' + esc(f.key) + '">' +
        '<span class="hz8-proutes__text"><span class="hz8-proutes__name">' + esc(f.label) + "</span>" + (sub ? '<span class="hz8-proutes__sub">' + esc(sub) + "</span>" : "") +
        '<span class="hz8-bs-cue">' + FILTER_ICON + "Visa i topplistan</span></span></button></li>";
    }).join("");
    if (list.__html !== html) { list.innerHTML = html; list.__html = html; }
    list.querySelectorAll(".hz8-bs-fmt").forEach(function (t) { t.setAttribute("aria-pressed", String(t.getAttribute("data-fam") === V.fam)); });
    R.guide.hidden = !items.length;
  }
  /* Underrad som går att belägga med produktnamnen: flera volymer/vikter. */
  function guideSub(key) {
    var units = {}, isWeight = key === "buds" || key === "hasch";
    var re = isWeight ? /(\d+(?:[.,]\d+)?)\s*(?:g|gram)\b/i : /(\d+(?:[.,]\d+)?)\s*ml\b/i;
    (D.list || []).forEach(function (c) { if (D.member[key] && D.member[key][c.path]) { var m = c.name.match(re); if (m) units[m[1].replace(",", ".")] = true; } });
    if (Object.keys(units).length < 2) return "";
    var noun = { vapes: "Vapes", carts: "Cartridges", buds: "Buds", hasch: "Hasch" }[key];
    return noun + " i flera " + (isWeight ? "vikter" : "volymer");
  }

  function apply(next, mode) {
    var famChanged = next.fam !== undefined && next.fam !== V.fam;
    var stockChanged = next.stock !== undefined && next.stock !== V.stock;
    if (famChanged) V.fam = next.fam;
    if (stockChanged) V.stock = next.stock;
    if (famChanged || stockChanged) V.visible = STEP;
    if (next.visible) V.visible = next.visible;
    var url = urlFor(V.fam, V.stock, V.visible);
    if (url !== location.pathname + location.search + location.hash) {
      if (mode === "push") history.pushState({ hz8bs: 1 }, "", url);
      else history.replaceState({ hz8bs: 1 }, "", url);
    }
    syncTabs();
    renderGrid();
    announce();
  }
  function announce() {
    var n = D.list ? current().length : null;
    var label = V.fam ? (D.formats.filter(function (f) { return f.key === V.fam; })[0] || {}).label : "Alla";
    var t = n == null ? "" : label + (V.stock ? ", i lager" : "") + ": " + n + (n === 1 ? " produkt" : " produkter");
    if (R.live.textContent !== t) R.live.textContent = t;
  }

  /* Headerns nederkant i vila (05-header.js sätter --hz8-header-reserve),
     även när headern just är undanskjuten -- den kommer tillbaka när man
     rullar uppåt och får inte täcka rubriken. */
  function headerOffset() {
    var header = document.getElementById("store-header");
    var reserve = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--hz8-header-reserve")) || 0;
    var now = header ? header.getBoundingClientRect().bottom : 0;
    return Math.max(reserve, now, header ? 0 : 84) + 12;
  }
  /* Rulla till listrubriken med headerns höjd som offset (ingen route). */
  function scrollToList() {
    var head = R.head;
    var off = headerOffset();
    var y = head.getBoundingClientRect().top + window.scrollY - off;
    window.scrollTo({ top: Math.max(0, y), behavior: reduced() ? "instant" : "smooth" }); /* "instant": Nyehandels egen CSS kan sätta scroll-behavior: smooth, som "auto" ärver */
    var h2 = head.querySelector("h2");
    h2.setAttribute("tabindex", "-1");
    h2.focus({ preventScroll: true });
  }

  /* ---------------- Återanvändbara nedre moduler ----------------
     Vanliga frågor (ur /sv/page/faq), Kundtjänst och Säker betalning (bara
     verifierade metoder: Swish). Generisk markup utan sidunika selektorer;
     valfria för andra sidor via HZ8.helpModules(). */
  function faqModule(picks) {
    var mod = node("div", "hz8-lmod hz8-lmod--faq");
    mod.hidden = true;
    mod.innerHTML = '<h2 class="hz8-lmod__h">Vanliga frågor</h2><div class="hz8-lmod__faq"></div><p class="hz8-lmod__more"><a href="' + esc(link("/sv/page/faq")) + '">Alla vanliga frågor</a></p>';
    HZ8.fetchPage("/sv/page/faq", {
      key: "faq-qa1",
      run: function (doc) {
        return Array.prototype.map.call(doc.querySelectorAll("details"), function (d) {
          var s = d.querySelector("summary"); if (!s) return null;
          var a = d.querySelector(".nh-faq__a") || d;
          var clean2 = a.cloneNode(true); var s2 = clean2.querySelector("summary"); if (s2) s2.remove();
          clean2.querySelectorAll("*").forEach(function (el) { if (!/^(STRONG|B|A|EM|BR)$/.test(el.tagName)) el.replaceWith.apply(el, el.childNodes); else Array.prototype.slice.call(el.attributes).forEach(function (at) { if (!(el.tagName === "A" && at.name === "href")) el.removeAttribute(at.name); }); });
          return { q: s.textContent.replace(/\s+/g, " ").trim(), a: clean2.innerHTML.replace(/\s+/g, " ").trim() };
        }).filter(Boolean);
      }
    }).then(function (items) {
      var picked = picks.map(function (re) { return items.filter(function (it) { return re.test(it.q); })[0]; }).filter(Boolean);
      if (!picked.length) { mod.remove(); return; }
      mod.querySelector(".hz8-lmod__faq").innerHTML = picked.map(function (it) { return '<details class="hz8-lmod__qa"><summary>' + esc(it.q) + "</summary><p>" + it.a + "</p></details>"; }).join("");
      mod.hidden = false;
    }).catch(function () { mod.remove(); });
    return mod;
  }
  function serviceModule() {
    return node("div", "hz8-lmod hz8-lmod--service",
      '<h2 class="hz8-lmod__h">Kundtjänst</h2><p>Hittar du inte rätt? Vi hjälper dig att välja.</p>' +
      '<div class="hz8-lmod__actions"><a class="hz8-lmod__btn" href="' + esc(link("/sv/page/kontakt")) + '">Kontakta oss</a><a class="hz8-lmod__btn" href="mailto:Hej@hazey.se">Hej@hazey.se</a></div>');
  }
  function paymentModule() {
    return node("div", "hz8-lmod hz8-lmod--pay",
      '<h2 class="hz8-lmod__h">Säker betalning</h2><p>Betala med Swish direkt i kassan.</p>' +
      '<p class="hz8-lmod__pay"><img src="' + SWISH_IMG + '" alt="Swish" width="120" height="34" loading="lazy" decoding="async"></p>');
  }
  HZ8.helpModules = function (opts) {
    opts = opts || {};
    var sec = node("section", "hz8-lmods" + (opts.className ? " " + opts.className : ""));
    sec.setAttribute("aria-label", "Hjälp och betalning");
    if (opts.faq !== false) sec.appendChild(faqModule(opts.faqPicks || FAQ_PICK));
    if (opts.service !== false) sec.appendChild(serviceModule());
    if (opts.payment !== false) sec.appendChild(paymentModule());
    return sec;
  };

  /* Officiell TrustBox (samma mönster som startsidans hero, 10-hero.js);
     fallback-länken syns tills widgeten laddat -- aldrig ett värde i koden. */
  function trustbox() {
    var wrap = node("div", "hz8-bs-trust");
    var native = document.querySelector(".trustpilot-widget[data-businessunit-id]");
    var unit = native ? native.getAttribute("data-businessunit-id") : TP_UNIT;
    var w = node("div", "", '<a href="' + TP_REVIEW + '" target="_blank" rel="noopener">Omdömen på Trustpilot</a>');
    w.setAttribute("data-locale", "sv-SE");
    w.setAttribute("data-template-id", TP_TEMPLATE);
    w.setAttribute("data-businessunit-id", unit);
    w.setAttribute("data-style-height", "24px");
    w.setAttribute("data-style-width", "100%");
    w.setAttribute("data-theme", "light");
    wrap.appendChild(w);
    var narrow = window.matchMedia("(max-width: 299px)");
    function mount() {
      w.classList.add("trustpilot-widget");
      if (!document.querySelector("script[src*='tp.widget.bootstrap']")) {
        var s = document.createElement("script"); s.src = "https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"; s.async = true; document.head.appendChild(s);
      }
      var tries = 0;
      (function load() {
        if (window.Trustpilot && window.Trustpilot.loadFromElement) { try { window.Trustpilot.loadFromElement(w, true); } catch (e) {} }
        else if (tries++ < 40) window.setTimeout(load, 250);
      })();
    }
    if (narrow.matches) { if (narrow.addEventListener) narrow.addEventListener("change", function once() { if (narrow.matches) return; narrow.removeEventListener("change", once); mount(); }); }
    else window.setTimeout(mount, 0);
    return wrap;
  }

  /* ---------------- Sidan ---------------- */
  function build() {
    var main = document.getElementById("store-main");
    var skip = document.getElementById("skip-to-main-content");
    if (!main || !skip || skip.querySelector(".hz8-bs-hero")) return false;
    var html = document.documentElement;
    html.classList.add("hz8-cat-pilot", "hz8-cat-portal", "hz8-bs-page");
    html.setAttribute("data-hz8-page", "category");
    html.setAttribute("data-hz8-shell", "broad");

    /* Aktiv i navigationen: bara aria-current (headern är låst, ingen
       visuell ändring). Mobilmenyn byggs vid öppning -- märks vid klick. */
    function markNav() {
      document.querySelectorAll("#store-header a[href], #hz8MobileDrawer a[href]").forEach(function (a) {
        if (ROUTE.test(HZ8.path(a.getAttribute("href")).split("?")[0]) && a.getAttribute("aria-current") !== "page") a.setAttribute("aria-current", "page");
      });
    }
    markNav();
    document.addEventListener("click", function () { window.setTimeout(markNav, 0); }, true);

    /* Brödsmula: Hem / Bästsäljare (sidans namn i navigationen). */
    var crumb = document.querySelector(".designer-breadcrumbs li:last-child a, .designer-breadcrumbs li:last-child");
    if (crumb && crumb.textContent.trim() !== "Bästsäljare") crumb.textContent = "Bästsäljare";

    var hero = node("div", "hz8-cat-hero hz8-bs-hero", '<div class="hz8-cat-hero__art"></div><div class="hz8-cat-hero__plaster" aria-hidden="true"></div>');
    hero.setAttribute("aria-hidden", "true");
    var kicker = node("p", "hz8-kicker hz8-portal-kicker", "Populärt hos Hazey");
    /* Exakt en H1: Nyehandels egen (h1.nh-bs-hero__title) flyttas in i den
       synliga heron; en egen skapas bara om den saknas. Övriga adminblock
       lämnas orörda. Utan Theme 8 ligger H1:an kvar i nativesidan. */
    var article = node("article", "category-description hz8-bs-desc", '<div class="container"></div>');
    var h1 = skip.querySelector(".store-page h1.nh-bs-hero__title") || skip.querySelector(".store-page .nh-bs-hero h1");
    if (!h1) { h1 = document.createElement("h1"); h1.textContent = "Bästsäljare"; }
    h1.classList.add("title");
    h1.id = "hz8-bs-title";
    article.firstChild.appendChild(h1);
    var lead = node("p", "hz8-cat-lead", "Våra mest populära produkter från hela sortimentet, samlade på ett ställe.");
    var trust = trustbox();
    var tool = node("div", "hz8-ptool hz8-bs-tool");
    tool.setAttribute("role", "group");
    tool.setAttribute("aria-label", "Filtrera bästsäljare");
    tool.innerHTML = '<div class="hz8-ptool__desk"><div class="hz8-pfam" role="group" aria-label="Format"></div>' +
      '<button type="button" class="hz8-ptool__btn hz8-pswitch" role="switch" aria-checked="false" data-bs="stock" hidden>I lager <span class="hz8-pswitch__track" aria-hidden="true"></span></button></div>' +
      '<div class="hz8-ptool__mob hz8-bs-mob"></div>';
    var live = node("p", "hz8-visually-hidden");
    live.setAttribute("role", "status");
    live.setAttribute("aria-live", "polite");
    var head = node("div", "hz8-pgridhead", '<h2 class="hz8-pgridhead__title" id="hz8-bs-list">Populärast just nu</h2><p class="hz8-pgridhead__sort">Sorterat på populärast</p>');
    var results = node("div", "container category-content designer-category hz8-bs-results");
    results.innerHTML = '<section class="hz8-series-results" aria-labelledby="hz8-bs-list"><div class="products hz8-series-results__grid"></div>' +
      '<div class="hz8-bs-more" hidden><p class="hz8-bs-more__text" aria-live="polite"></p><div class="hz8-bs-more__actions">' +
      '<button type="button" class="hz8-bs-more__btn" aria-controls="hz8-bs-grid" aria-expanded="false" data-bs="more">Visa fler bästsäljare' + CHEV_DOWN + "</button>" +
      '<button type="button" class="hz8-bs-more__less" aria-controls="hz8-bs-grid" data-bs="less" hidden>Visa färre' + CHEV_UP + "</button></div></div></section>";
    var guide = node("section", "hz8-proutes hz8-bs-guide");
    guide.setAttribute("aria-labelledby", "hz8-bs-guide-title");
    guide.hidden = true;
    guide.innerHTML = '<div class="hz8-proutes__head"><p class="hz8-kicker">Handla efter format</p><h2 id="hz8-bs-guide-title">Hitta rätt format</h2><p class="hz8-proutes__lead">Välj ett format så filtreras topplistan ovan.</p></div><ul class="hz8-proutes__list" role="list"></ul>';
    var lower = HZ8.helpModules({ className: "hz8-bs-lower" });

    [hero, kicker, article, lead, trust, tool, live, head, results, guide, lower].forEach(function (el) { skip.appendChild(el); });
    R.grid = results.querySelector(".hz8-series-results__grid");
    R.grid.id = "hz8-bs-grid";
    R.more = results.querySelector(".hz8-bs-more");
    R.tabs = tool.querySelector(".hz8-pfam");
    R.stock = tool.querySelector('[data-bs="stock"]');
    R.mob = tool.querySelector(".hz8-bs-mob");
    R.desk = tool.querySelector(".hz8-ptool__desk");
    R.head = head; R.guide = guide; R.live = live;

    /* Mobil: lagerväxeln på egen rad under flikarna (samma knapp). */
    var mq = window.matchMedia("(max-width: 767px)");
    function placeSwitch() { var target = mq.matches ? R.mob : R.desk; if (R.stock.parentNode !== target) target.appendChild(R.stock); syncTabs(); }
    if (mq.addEventListener) mq.addEventListener("change", placeSwitch);
    placeSwitch();
    window.addEventListener("resize", function () { R.tabs.classList.toggle("is-more", R.tabs.scrollWidth > R.tabs.clientWidth + 2); }, { passive: true });

    /* Interaktion */
    tool.addEventListener("click", function (e) {
      var t = e.target.closest(".hz8-pfam__tab");
      if (t) { apply({ fam: t.getAttribute("data-fam") }, "push"); return; }
      if (e.target.closest('[data-bs="stock"]')) apply({ stock: !V.stock }, "push");
    });
    results.addEventListener("click", function (e) {
      var b = e.target.closest("[data-bs]");
      if (!b) return;
      var act = b.getAttribute("data-bs");
      if (act === "more") {
        var y = window.scrollY;
        apply({ visible: V.visible + STEP }, "append");
        window.scrollTo({ top: y, behavior: "instant" });
        /* Fokus till första nya kortet (knappen flyttar sig nedåt). */
        var cells = R.grid.querySelectorAll(":scope > [data-hz8-path]");
        var firstNew = cells[V.visible - STEP];
        var focusEl = firstNew && firstNew.querySelector("a[href]");
        if (focusEl) focusEl.focus({ preventScroll: true });
      } else if (act === "less") {
        apply({ visible: STEP }, "replace");
        /* Tillbaka till listrubriken utan att hoppa förbi den. */
        var top = R.head.getBoundingClientRect().top;
        if (top < headerOffset()) scrollToList(); else { var h2 = R.head.querySelector("h2"); h2.setAttribute("tabindex", "-1"); h2.focus({ preventScroll: true }); }
      } else if (act === "reset") { apply({ fam: "", stock: false }, "push"); }
      else if (act === "retry") { D.error = false; renderGrid(); load(); }
    });
    guide.addEventListener("click", function (e) {
      var c = e.target.closest(".hz8-bs-fmt");
      if (!c) return;
      apply({ fam: c.getAttribute("data-fam") }, "push");
      scrollToList();
    });
    window.addEventListener("popstate", function () { readUrl(); syncTabs(); renderGrid(); announce(); });
    return true;
  }

  /* ---------------- Laddning ---------------- */
  function load() {
    var href = sourceHref();
    D.formats = HZ8.catalog ? HZ8.catalog.build().formats.filter(function (f) { return f.href; }).map(function (f) { return { key: f.key, href: f.href, label: PORTAL_LABEL[f.key] || f.label }; }) : [];
    /* 1) Första sidan: rutnätet visas direkt. */
    HZ8.fetchPage(href, HZ8.categoryCards).then(function (cards) {
      if (!D.first) { D.first = clean(cards); renderGrid(); }
    }).catch(function () { D.error = true; renderGrid(); });
    /* 2) Hela listan: antal, expansion och filter. */
    var full = allCards(href).then(function (cards) { D.list = clean(cards); if (!D.first) D.first = D.list.slice(0, STEP); });
    /* 3) Formatmedlemskap (en gång), samma ordning som formatlistan. */
    var fmts = Promise.all(D.formats.map(function (f) {
      return allCards(f.href).then(function (cards) {
        var set = {};
        cards.forEach(function (c) { var p = cardPath(c.html); if (p) set[p] = true; });
        D.member[f.key] = set;
      }).catch(function () { /* okänt format: ingen flik */ });
    })).then(function () {
      /* Korttyp = första formatet i katalogens ordning (som portalen). */
      D.formats.forEach(function (f) { Object.keys(D.member[f.key] || {}).forEach(function (p) { if (!D.typeOf[p]) D.typeOf[p] = f.key; }); });
    });
    /* 4) Lager ur Nyehandels eget lagerfilter. */
    var stock = allCards(withParam(href, "filters", STOCK_TOKEN)).then(function (cards) {
      var set = {};
      cards.forEach(function (c) { var p = cardPath(c.html); if (p) set[p] = true; });
      D.stock = set;
    }).catch(function () { /* okänt lager: ingen växel */ });
    function settle() { syncTabs(); renderGrid(); announce(); redecorateAll(); }
    var core = Promise.all([full, fmts]);
    core.then(settle, function () { if (!D.first) D.error = true; });
    stock.then(settle);
    Promise.all([core.catch(function () {}), stock]).then(function () { D.ready = true; settle(); });
  }

  HZ8.register("bestsellers-page", function (context) {
    if (context.page !== "page" || !HZ8.isBestsellerPage()) return;
    readUrl();
    if (!build()) return;
    /* Portalens kompakta actionrad (samma etiketter som 80-category.js). */
    HZ8.cardLabels = {
      add: "Lägg till", addShort: "Lägg till", variants: "Välj", variantsShort: "Välj", variantsAria: "Välj alternativ",
      addIcon: '<svg class="hz8-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 8h12l-1 12H7z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/></svg>',
      variantsIcon: ""
    };
    syncTabs();
    renderGrid();
    load();
  });
})();
