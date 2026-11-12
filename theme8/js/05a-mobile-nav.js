/* Mobilnavigation: meny (drawer) + sök som EN overlay åt gången.

   - Ett gemensamt lager (HZ8.mobileNav) äger scroll-lås, fokusfälla,
     inert-bakgrund, Escape och fokusåterställning för både menyn och
     sökytan. Öppnas det ena stängs det andra (och minicarten); öppnas
     minicarten stängs båda.
   - Sök: egen dialog i stället för Nyehandels mobilsökfält. Theme 8
     döljer #search-container under 768 px (headerns layout), så den
     native "Öppna sökfältet"-knappen tände bara Nyehandels .overlay
     utan synligt fält. Datakällan är densamma som Nyehandels egen
     sökruta (/frontend-api/{locale}/search/product?query=), och Enter
     går till den riktiga resultatsidan /{locale}/search?query=.
   - Interna länkar går via HZ8.link -> ?preview= behålls bara när
     sidan redan är öppnad i förhandsvisningen. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  if (!HZ8 || HZ8.mobileNav) return;

  var FOCUSABLE = "a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])";

  function locale() { return (window.config && window.config.locale) || "sv"; }
  /* Menyn/sökytan gäller så länge headerns egen knapp syns (hamburgaren
     under 768 px, sökknappen upp till Nyehandels 1024 px-gräns). */
  function shown(el) { return !!(el && getComputedStyle(el).display !== "none" && el.getClientRects().length); }
  /* Nyehandels egna absoluta butiks-URL:er -> sökväg på aktuell domän. */
  function rel(href) {
    try {
      var u = new URL(href, location.origin);
      if (/\.nyehandel\.se$/.test(u.hostname) || u.hostname === location.hostname) return HZ8.link(u.pathname + u.search + u.hash);
    } catch (e) {}
    return href;
  }

  /* ---------- Gemensamt overlay-lager ---------- */
  var layers = {};
  var active = null;      // namn på öppen overlay
  var release = null;     // fokusfällans release
  var inerted = [];
  var lockedY = 0;

  function lockScroll() {
    lockedY = window.scrollY;
    var b = document.body.style;
    b.position = "fixed"; b.top = "-" + lockedY + "px"; b.left = "0"; b.right = "0";
    document.body.classList.add("hz8-scroll-locked");
  }
  function unlockScroll() {
    var b = document.body.style;
    b.position = ""; b.top = ""; b.left = ""; b.right = "";
    document.body.classList.remove("hz8-scroll-locked");
    window.scrollTo(0, lockedY);
  }
  /* Allt utanför overlayn blir inert (tangentbord + skärmläsare). */
  function inertOutside(keep) {
    Array.prototype.forEach.call(document.body.children, function (el) {
      if (el === keep || el.tagName === "SCRIPT" || el.inert) return;
      el.inert = true;
      inerted.push(el);
    });
  }
  function restoreInert() {
    inerted.forEach(function (el) { el.inert = false; });
    inerted = [];
  }
  function focusables(container) {
    return Array.prototype.filter.call(container.querySelectorAll(FOCUSABLE), function (el) {
      if (el.closest("[inert], [hidden]")) return false;
      var cs = getComputedStyle(el);
      return cs.visibility !== "hidden" && cs.display !== "none" && (el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    });
  }
  function trap(container, first) {
    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); api.close(); return; }
      if (e.key !== "Tab") return;
      var items = focusables(container);
      if (!items.length) { e.preventDefault(); return; }
      var a = items[0], z = items[items.length - 1];
      var inside = container.contains(document.activeElement);
      if (e.shiftKey && (document.activeElement === a || !inside)) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && (document.activeElement === z || !inside)) { e.preventDefault(); a.focus(); }
    }
    document.addEventListener("keydown", onKey, true);
    window.setTimeout(function () {
      var t = first && first() || focusables(container)[0];
      if (t) t.focus({ preventScroll: true });
    }, 30);
    return function () { document.removeEventListener("keydown", onKey, true); };
  }
  function closeCart() {
    var wrap = document.getElementById("cart-side-wrap");
    if (!wrap || !wrap.classList.contains("is-active")) return;
    var st = HZ8.store && HZ8.store();
    var btn = document.querySelector("#cartAside .close-cart");
    if (btn) btn.click(); else if (st) st.dispatch("cart/close");
  }

  var api = {
    register: function (name, layer) { layers[name] = layer; },
    current: function () { return active; },
    open: function (name) {
      var L = layers[name];
      if (!L || active === name) return;
      var switching = !!active;
      if (active) api.close({ restore: false, keepLock: true });
      closeCart();
      active = name;
      if (!switching) lockScroll();
      L.show();
      inertOutside(L.root);
      release = trap(L.root, L.firstFocus);
      if (L.trigger) L.trigger.setAttribute("aria-expanded", "true");
    },
    /* opts.restore=false: ingen fokusåterställning (byte eller navigering). */
    close: function (opts) {
      opts = opts || {};
      if (!active) return;
      var L = layers[active];
      active = null;
      if (release) { release(); release = null; }
      restoreInert();
      L.hide();
      if (L.trigger) L.trigger.setAttribute("aria-expanded", "false");
      if (!opts.keepLock) unlockScroll();
      if (opts.restore !== false && L.trigger && document.contains(L.trigger)) L.trigger.focus({ preventScroll: true });
    }
  };
  HZ8.mobileNav = api;

  /* Minicarten öppnas -> stäng meny/sök (utan att flytta fokus). */
  function watchCart() {
    var wrap = document.getElementById("cart-side-wrap");
    if (!wrap || wrap.__hz8NavWatch) return;
    wrap.__hz8NavWatch = true;
    new MutationObserver(function () {
      if (wrap.classList.contains("is-active") && active) api.close({ restore: false });
    }).observe(wrap, { attributes: true, attributeFilter: ["class"] });
  }
  /* Bredd där overlayns knapp inte längre syns -> stäng. */
  var resizeRaf = 0;
  window.addEventListener("resize", function () {
    if (resizeRaf) return;
    resizeRaf = window.requestAnimationFrame(function () {
      resizeRaf = 0;
      if (active && !shown(layers[active].trigger)) api.close({ restore: false });
    });
  });
  /* Bakåt/framåt från bfcache: aldrig ett kvarhängande öppet läge. */
  window.addEventListener("pageshow", function (e) { if (e.persisted && active) api.close({ restore: false }); });
  window.addEventListener("pagehide", function () { if (active) api.close({ restore: false }); });

  /* ---------- Meny (drawer) ---------- */
  api.initDrawer = function (drawer, burger) {
    var panel = drawer.querySelector(".hz8-mobile-drawer__panel");
    if (panel && !panel.id) panel.id = "hz8MobileDrawerPanel";
    if (burger) {
      burger.setAttribute("aria-controls", panel.id);
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-haspopup", "dialog");
    }
    drawer.inert = true;
    api.register("menu", {
      root: drawer,
      trigger: burger,
      firstFocus: function () { return drawer.querySelector("[data-hz8-drawer-close]"); },
      show: function () { drawer.inert = false; drawer.classList.add("is-open"); },
      hide: function () { drawer.classList.remove("is-open"); drawer.inert = true; }
    });
    if (burger) burger.addEventListener("click", function () {
      if (active === "menu") api.close(); else api.open("menu");
    });
    drawer.addEventListener("click", function (e) {
      if (e.target.closest("[data-hz8-drawer-backdrop], [data-hz8-drawer-close]")) { api.close(); return; }
      if (e.target.closest("[data-hz8-open-search]")) { api.open("search"); return; }
      var a = e.target.closest("a[href]");
      /* Följd länk: stäng menyn (lås/inert släpps innan navigeringen). */
      if (a && !e.defaultPrevented && !e.metaKey && !e.ctrlKey && !e.shiftKey && a.target !== "_blank") api.close({ restore: false });
    });
    watchCart();
  };

  /* ---------- Sök ---------- */
  function esc(v) { return HZ8.esc(v); }
  /* Nyehandel markerar träffen med <em> -- allt annat escapas. */
  function highlight(title) {
    return esc(String(title || "").replace(/<(?!\/?em>)[^>]*>/g, "")).replace(/&lt;(\/?)em&gt;/g, "<$1mark>");
  }
  function plain(title) { return String(title || "").replace(/<[^>]*>/g, ""); }
  function searchUrl(q) { return HZ8.link("/" + locale() + "/search?query=" + encodeURIComponent(q)); }

  function buildSearch() {
    var root = document.createElement("div");
    root.id = "hz8MobileSearch";
    root.className = "hz8-msearch";
    root.hidden = true;
    root.innerHTML =
      '<div class="hz8-msearch__backdrop" data-hz8-search-close></div>' +
      '<div class="hz8-msearch__panel" role="dialog" aria-modal="true" aria-labelledby="hz8MsearchTitle">' +
        '<form class="hz8-msearch__form" role="search" action="/' + locale() + '/search" method="get" novalidate>' +
          '<h2 id="hz8MsearchTitle" class="hz8-msearch__title">Sök</h2>' +
          '<div class="hz8-msearch__row">' +
            '<div class="hz8-msearch__field">' +
              '<svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>' +
              '<label class="hz8-visually-hidden" for="hz8MsearchInput">Sök produkter, serier och varumärken</label>' +
              '<input id="hz8MsearchInput" name="query" type="search" inputmode="search" enterkeyhint="search" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Produkter, serier, varumärken" aria-controls="hz8MsearchResults">' +
              '<button type="button" class="hz8-msearch__clear" aria-label="Rensa sökningen" hidden><svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
            "</div>" +
            '<button type="submit" class="hz8-msearch__submit">Sök</button>' +
          "</div>" +
          '<button type="button" class="hz8-msearch__close" data-hz8-search-close aria-label="Stäng sökningen"><svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        "</form>" +
        '<p class="hz8-visually-hidden" id="hz8MsearchStatus" role="status" aria-live="polite"></p>' +
        '<div class="hz8-msearch__results" id="hz8MsearchResults"></div>' +
      "</div>";
    document.body.appendChild(root);
    return root;
  }

  /* ---------- Gemensam sökrendering (mobil dialog + desktop-popover) ----------
     Samma datakälla som Nyehandels sökruta (/frontend-api/{locale}/search/
     product?query=), samma markup och samma tillstånd: start, laddar,
     träffar, inga träffar, nätverksfel. TASK 02 (2026-11-12). */
  function startMarkup(categories) {
    var groups = HZ8.headerCannabinoids || [];
    function chips(list, label) {
      list = (list || []).filter(function (c) { return c && c.href; });
      return list.length ? '<p class="hz8-msearch__label">' + esc(label) + '</p><ul class="hz8-msearch__cats">' + list.map(function (c) {
        return '<li><a href="' + esc(rel(c.href)) + '">' + esc(c.label) + "</a></li>";
      }).join("") + "</ul>" : "";
    }
    /* Headerns grupper med egna rubriker (Magic Sauce står under "Serier
       och blandningar", aldrig under "Cannabinoider"). Länkar som redan
       finns under Bläddra (CBD) visas inte två gånger. */
    var seen = (categories || []).map(function (c) { return c.href; });
    var extra = groups.map(function (g) {
      return chips((g.links || []).filter(function (l) { return seen.indexOf(l.href) === -1; }), g.heading);
    }).join("");
    return '<div class="hz8-msearch__start"><p class="hz8-msearch__hint">Sök bland produkter, serier och varumärken.</p>' +
      chips(categories, "Bläddra") + extra + "</div>";
  }
  function resultsMarkup(q, d, max) {
    var hits = (d.hits || []).slice(0, max || 5);
    var cats = (d.categories || []).slice(0, 3);
    var total = d.total_count || hits.length;
    if (!hits.length && !cats.length) {
      return { empty: true, total: 0, html: '<div class="hz8-msearch__empty"><p>Inga träffar för ”' + esc(q) + '”.</p><p>Kontrollera stavningen eller bläddra i <a href="' + esc(HZ8.link("/" + locale() + "/categories/alla-produkter")) + '">alla produkter</a>.</p></div>' };
    }
    return { total: total, html:
      (cats.length ? '<p class="hz8-msearch__label">Kategorier</p><ul class="hz8-msearch__cats">' + cats.map(function (c) {
        return '<li><a href="' + esc(rel(c.url)) + '"><span>' + highlight(c.name) + "</span></a></li>";
      }).join("") + "</ul>" : "") +
      (hits.length ? '<p class="hz8-msearch__label">Produkter</p><ul class="hz8-msearch__hits">' + hits.map(function (h) {
        var price = h.formatted_price ? (String(h.has_compare_price) === "true" || h.has_compare_price === true) && h.formatted_comparison_price
          ? '<del>' + esc(h.formatted_comparison_price) + "</del> <ins>" + esc(h.formatted_price) + "</ins>" : esc(h.formatted_price) : "";
        return '<li><a class="hz8-msearch__hit" href="' + esc(rel(h.url)) + '">' +
          '<span class="hz8-msearch__thumb">' + (h.thumb_url ? '<img src="' + esc(h.thumb_url) + '" alt="" width="48" height="48" loading="lazy">' : "") + "</span>" +
          '<span class="hz8-msearch__name">' + highlight(h.title) + "</span>" +
          (price ? '<span class="hz8-msearch__price">' + price + "</span>" : "") + "</a></li>";
      }).join("") + "</ul>" : "") +
      '<a class="hz8-msearch__all" href="' + esc(searchUrl(q)) + '">Visa alla ' + total + (total === 1 ? " träff" : " träffar") + "</a>" };
  }
  /* En sökmotor per yta: debounce, avbryt gamla anrop, bara senaste svaret
     ritas. results = behållaren, status = role=status-noden. */
  function searchEngine(results, status, categories, max) {
    var ctrl = null, seq = 0, startHtml = startMarkup(categories);
    function start() { if (ctrl) { ctrl.abort(); ctrl = null; } seq++; results.removeAttribute("aria-busy"); results.innerHTML = startHtml; status.textContent = ""; }
    function run(q) {
      if (ctrl) { ctrl.abort(); ctrl = null; }
      if (q.length < 2) { start(); return; }
      var my = ++seq;
      ctrl = window.AbortController ? new AbortController() : null;
      results.setAttribute("aria-busy", "true");
      /* Laddar: bara när inga tidigare träffar syns (annars dämpas de). */
      if (!results.querySelector(".hz8-msearch__hits, .hz8-msearch__cats a span")) { results.innerHTML = '<p class="hz8-msearch__loading">Söker …</p>'; }
      status.textContent = "Söker";
      fetch("/frontend-api/" + locale() + "/search/product?query=" + encodeURIComponent(q), {
        credentials: "same-origin", headers: { Accept: "application/json" }, signal: ctrl ? ctrl.signal : undefined
      }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (d) {
          if (my !== seq) return;
          var m = resultsMarkup(q, d.data || d, max);
          results.innerHTML = m.html;
          status.textContent = m.empty ? "Inga träffar" : m.total + (m.total === 1 ? " träff" : " träffar");
        })
        .catch(function (e) {
          if (e && e.name === "AbortError" || my !== seq) return;
          results.innerHTML = '<div class="hz8-msearch__empty hz8-msearch__error"><p>Förslagen kunde inte laddas just nu.</p><p><a href="' + esc(searchUrl(q)) + '">Visa sökresultat för ”' + esc(q) + '”</a></p></div>';
          status.textContent = "Förslagen kunde inte laddas";
        })
        .then(function () { if (my === seq) results.removeAttribute("aria-busy"); });
    }
    return { start: start, run: run };
  }

  api.initSearch = function (trigger, categories) {
    if (document.getElementById("hz8MobileSearch")) return;
    var root = buildSearch();
    var input = root.querySelector("input");
    var clear = root.querySelector(".hz8-msearch__clear");
    var results = root.querySelector(".hz8-msearch__results");
    var status = root.querySelector("#hz8MsearchStatus");
    var timer = 0;
    var engine = searchEngine(results, status, categories, 5);
    function renderStart() { engine.start(); }
    function lookup() {
      clear.hidden = !input.value;
      engine.run(input.value.trim());
    }

    input.addEventListener("input", function () {
      window.clearTimeout(timer);
      timer = window.setTimeout(lookup, 250);
      clear.hidden = !input.value;
    });
    clear.addEventListener("click", function () { input.value = ""; lookup(); input.focus(); });
    root.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault();
      var q = input.value.trim();
      if (!q) { input.value = ""; input.focus(); return; }
      api.close({ restore: false });
      location.href = searchUrl(q);
    });
    root.addEventListener("click", function (e) {
      if (e.target.closest("[data-hz8-search-close]")) { api.close(); return; }
      var a = e.target.closest("a[href]");
      if (a && !e.metaKey && !e.ctrlKey && !e.shiftKey) api.close({ restore: false });
    });

    trigger.setAttribute("aria-haspopup", "dialog");
    trigger.setAttribute("aria-controls", "hz8MobileSearch");
    trigger.setAttribute("aria-expanded", "false");
    api.register("search", {
      root: root,
      trigger: trigger,
      firstFocus: function () { return input; },
      show: function () {
        root.hidden = false;
        if (!input.value.trim()) renderStart();
        /* Nästa bildruta: övergången startar från dolt läge. */
        window.requestAnimationFrame(function () { root.classList.add("is-open"); });
      },
      hide: function () { root.classList.remove("is-open"); root.hidden = true; }
    });
    /* Den native knappen öppnar annars Nyehandels (dolda) sökfält och
       dess .overlay -- på mobil tar vi klicket före Vue (capture). */
    document.addEventListener("click", function (e) {
      var t = e.target.closest && e.target.closest("#mobile-search-trigger");
      if (!t || !shown(t)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (active === "search") api.close(); else api.open("search");
    }, true);
    watchCart();
  };

  /* ---------- Desktop-sök (≥1180 px, TASK 02) ----------
     Nyehandels sökfält (#search-input) står kvar i headern med sitt
     v-model; dess breda vita förslagspanel (.store-search__dropdown) döljs
     i CSS. I stället öppnas en kompakt Theme 8-popover under fältet med
     samma sökmotor som mobilen. Lyssnarna är delegerade (Vue kan rita om
     fältet) och gäller bara när desktopfältet syns.
     Tangentbord: Pil ned från fältet -> första förslaget, Pil upp/ned
     mellan förslag, Escape stänger och lämnar fokus i fältet, Enter går
     till Nyehandels resultatsida (/{locale}/search?query=), Tab ut ur
     fält + popover stänger. Klick utanför stänger. */
  api.initDesktopSearch = function (categories) {
    if (document.getElementById("hz8DesktopSearch")) return;
    var mq = window.matchMedia ? window.matchMedia("(min-width: 1180px)") : { matches: true };
    var root = document.createElement("div");
    root.id = "hz8DesktopSearch";
    root.className = "hz8-dsearch";
    root.hidden = true;
    root.innerHTML = '<div class="hz8-dsearch__panel" role="region" aria-label="Sökförslag">' +
      '<p class="hz8-visually-hidden" id="hz8DsearchStatus" role="status" aria-live="polite"></p>' +
      '<div class="hz8-msearch__results hz8-dsearch__results" id="hz8DsearchResults"></div></div>';
    document.body.appendChild(root);
    var panel = root.firstChild, results = root.querySelector("#hz8DsearchResults"), status = root.querySelector("#hz8DsearchStatus");
    var engine = searchEngine(results, status, categories, 6);
    var timer = 0, isOpen = false, lastQ = null, restoring = false;

    function field() { return document.getElementById("search-input"); }
    function desktop(inp) { return mq.matches && inp && shown(inp); }
    function place(inp) {
      var pill = inp.closest(".search-field") || inp, r = pill.getBoundingClientRect();
      var w = Math.min(Math.max(r.width + 120, 420), 480, window.innerWidth - 32);
      var left = Math.max(16, Math.min(r.right - w, window.innerWidth - w - 16));
      root.style.setProperty("--hz8-ds-top", Math.round(r.bottom + 10) + "px");
      root.style.setProperty("--hz8-ds-left", Math.round(left) + "px");
      root.style.setProperty("--hz8-ds-width", Math.round(w) + "px");
    }
    function sync(inp) {
      var q = inp.value.trim();
      if (q === lastQ) return;
      lastQ = q;
      if (q.length < 2) engine.start(); else engine.run(q);
    }
    function open(inp) {
      inp.setAttribute("aria-controls", "hz8DsearchResults");
      inp.setAttribute("aria-expanded", "true");
      place(inp);
      if (!isOpen) {
        isOpen = true;
        root.hidden = false;
        window.requestAnimationFrame(function () { root.classList.add("is-open"); });
      }
      sync(inp);
    }
    function close(focusInput) {
      if (!isOpen) return;
      isOpen = false;
      window.clearTimeout(timer);
      root.classList.remove("is-open");
      root.hidden = true;
      var inp = field();
      if (inp) {
        inp.setAttribute("aria-expanded", "false");
        /* Fokus tillbaka till fältet ska inte öppna popovern igen. */
        if (focusInput) { restoring = true; inp.focus({ preventScroll: true }); restoring = false; }
      }
    }
    function links() { return Array.prototype.slice.call(results.querySelectorAll("a[href]")); }
    function move(from, step) {
      var l = links(); if (!l.length) return;
      var i = l.indexOf(from);
      if (i === -1) { l[step > 0 ? 0 : l.length - 1].focus(); return; }
      var n = i + step;
      if (n < 0) { var inp = field(); if (inp) inp.focus(); return; }
      if (n >= l.length) n = l.length - 1;
      l[n].focus();
    }

    document.addEventListener("focusin", function (e) {
      if (e.target && e.target.id === "search-input" && desktop(e.target) && !restoring) open(e.target);
    });
    document.addEventListener("input", function (e) {
      if (!e.target || e.target.id !== "search-input" || !desktop(e.target)) return;
      if (!isOpen) open(e.target);
      window.clearTimeout(timer);
      var inp = e.target;
      timer = window.setTimeout(function () { sync(inp); }, 250);
    }, true);
    /* Nyehandels egna förslag hämtas på keyup -- stoppas på desktop så
       att samma sökning inte körs två gånger (panelen syns ändå inte). */
    document.addEventListener("keyup", function (e) {
      if (e.target && e.target.id === "search-input" && desktop(e.target)) e.stopImmediatePropagation();
    }, true);
    document.addEventListener("keydown", function (e) {
      var t = e.target;
      if (t && t.id === "search-input" && desktop(t)) {
        if (e.key === "Enter") {
          e.preventDefault(); e.stopImmediatePropagation();
          var q = t.value.trim(); if (q) { close(false); location.href = searchUrl(q); }
        } else if (e.key === "ArrowDown") {
          if (!isOpen) open(t);
          e.preventDefault(); move(null, 1);
        } else if (e.key === "Escape" && isOpen) {
          e.preventDefault(); e.stopImmediatePropagation(); close(true);
        }
        return;
      }
      if (!isOpen || !root.contains(t)) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); move(t, e.key === "ArrowDown" ? 1 : -1); }
      else if (e.key === "Escape") { e.preventDefault(); e.stopImmediatePropagation(); close(true); }
    }, true);
    document.addEventListener("focusout", function () {
      window.setTimeout(function () {
        var a = document.activeElement;
        if (isOpen && !(a && (a.id === "search-input" || root.contains(a)))) close(false);
      }, 0);
    });
    document.addEventListener("pointerdown", function (e) {
      if (!isOpen) return;
      var t = e.target;
      if (root.contains(t) || (t.closest && t.closest("#search-container"))) return;
      close(false);
    }, true);
    root.addEventListener("click", function (e) {
      var a = e.target.closest("a[href]");
      if (a && !e.metaKey && !e.ctrlKey && !e.shiftKey) close(false);
    });
    var rraf = 0;
    window.addEventListener("resize", function () {
      if (rraf || !isOpen) return;
      rraf = window.requestAnimationFrame(function () { rraf = 0; var inp = field(); if (!desktop(inp)) close(false); else place(inp); });
    });
    window.addEventListener("pagehide", function () { close(false); });
    api.desktopSearchOpen = function () { return isOpen; };
  };

  /* Konto i förhandsvisningen: /sv/account svarar 302 till
     /sv/account/login utan ?preview= (servern tappar parametern), så en
     utloggad besökare hamnade i det publicerade temat. Bara i preview
     och bara utloggad går länken direkt till inloggningen. */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || !/[?&]preview=/.test(location.search) || e.metaKey || e.ctrlKey) return;
    var path;
    try { path = new URL(a.href, location.href).pathname.replace(/\/+$/, ""); } catch (err) { return; }
    if (path !== "/" + locale() + "/account") return;
    var st = HZ8.store && HZ8.store();
    var c = st && st.state.customer && st.state.customer.customer;
    if (c && c.email) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (active) api.close({ restore: false });
    location.href = HZ8.link("/" + locale() + "/account/login");
  }, true);

  /* Desktop: Nyehandels egen sökruta navigerar med window.location vid
     Enter och tappar då ?preview=. Bara i förhandsvisningen skickas
     Enter vidare med samma query + preview; utan preview är detta en
     no-op och plattformens beteende gäller. */
  function previewEnter(e) {
    if (e.key !== "Enter" || !e.target || e.target.id !== "search-input") return false;
    if (!/[?&]preview=/.test(location.search)) return false;
    e.preventDefault();
    e.stopImmediatePropagation();
    return true;
  }
  document.addEventListener("keydown", function (e) {
    if (!previewEnter(e)) return;
    var q = e.target.value.trim();
    if (q) location.href = searchUrl(q);
  }, true);
  /* Nyehandels v-debounce reagerar på keyup -- stoppas också. */
  document.addEventListener("keyup", previewEnter, true);
})();
