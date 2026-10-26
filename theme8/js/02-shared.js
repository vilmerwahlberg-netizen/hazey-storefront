/* Theme 8 delade hjälpfunktioner -- används av sidtypsmodulerna
   (kategori, produkt, varukorg, innehållssidor, global footer).
   Registrerar ingen egen modul; lägger bara verktyg på window.HZ8. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  if (!HZ8 || HZ8.esc) return;

  HZ8.esc = function (value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };

  HZ8.path = function (href) {
    try {
      var url = new URL(href, location.origin);
      return url.pathname.replace(/\/+$/, "") + (url.search || "").replace(/[?&]preview=[^&]*/, "").replace(/^&/, "?");
    } catch (e) { return ""; }
  };

  /* Behåll ?preview= vid interna länkar så att förhandsvisningen av
     ett inaktivt tema inte tappar temat vid klick (utan preview-token
     är det här en no-op). */
  HZ8.link = function (href) {
    var m = location.search.match(/[?&]preview=([^&]+)/);
    if (!m || !href) return href;
    try {
      var url = new URL(href, location.origin);
      if (url.origin !== location.origin && url.hostname !== location.hostname) return href;
      url.searchParams.set("preview", decodeURIComponent(m[1]));
      return url.pathname + url.search + url.hash;
    } catch (e) { return href; }
  };

  /* ---- Vue-re-render-bevakning ----
     Nyehandels Vue-app skriver om delar av DOM:en (filter, sortering,
     varukorg). Alla injektioner i Vue-ägda träd körs därför via EN
     delad, debouncad MutationObserver och måste vara idempotenta. */
  var watchers = [];
  var observer = null;
  var pending = 0;
  function flush() {
    pending = 0;
    watchers.forEach(function (fn) {
      try { fn(); } catch (error) { if (window.console) console.error("Theme 8 watcher failed:", error); }
    });
  }
  HZ8.watch = function (fn) {
    watchers.push(fn);
    fn();
    if (observer) return;
    var root = document.getElementById("store-instance") || document.body;
    observer = new MutationObserver(function () {
      if (pending) return;
      pending = window.setTimeout(flush, 140);
    });
    observer.observe(root, { childList: true, subtree: true });
  };
  /* Läses av beredskapskontraktet i 00-bootstrap.js: en väntande
     watch-omgång betyder att synliga kontroller ännu kan flyttas. */
  HZ8.watchBusy = function () { return !!pending; };

  /* ---- Nyehandels Vuex-store (samma integrationspunkt som Theme 6) ---- */
  HZ8.store = function () {
    var root = document.getElementById("store-instance");
    var vm = root && root.__vue__;
    return vm && vm.$store ? vm.$store : null;
  };

  /* ---- Hämta en annan butikssida (samma origin) och läs riktig data ----
     Resultatet cachas per sida i sessionStorage i 30 minuter så att
     kategorinavigationen inte hämtar om samma sidor vid varje klick. */
  var CACHE_TTL = 30 * 60 * 1000;
  var inflight = {};
  function cacheGet(key) {
    try {
      var raw = sessionStorage.getItem("hz8:" + key);
      if (!raw) return null;
      var hit = JSON.parse(raw);
      return Date.now() - hit.t < CACHE_TTL ? hit.v : null;
    } catch (e) { return null; }
  }
  function cacheSet(key, value) {
    try { sessionStorage.setItem("hz8:" + key, JSON.stringify({ t: Date.now(), v: value })); } catch (e) { /* privat läge */ }
  }
  /* Nyehandel svarar 429 (och dess proxy "upstream ... overflow" 503)
     vid många samtidiga sidhämtningar -- därför köer med begränsad
     samtidighet och omförsök med backoff vid 429/503. Två köer: sidor
     (kategorier, recensioner m.m.) och produktdata (HZ8.productState),
     och köpklick startar direkt (se userInitiated).
     Varje försök avbryts efter FETCH_TIMEOUT så att en hängande
     anslutning varken låser en plats i kön eller lämnar skeletons kvar. */
  var MAX_PARALLEL = 3;
  var FETCH_TIMEOUT = 15000;
  function lane(max) { return { max: max, active: 0, queue: [] }; }
  var PAGES = lane(MAX_PARALLEL);
  var STATES = lane(3);
  function start(l, job) {
    l.active += 1;
    job.run().finally(function () { l.active -= 1; pump(l); });
  }
  function pump(l) {
    while (l.active < l.max && l.queue.length) start(l, l.queue.shift());
  }
  /* Direkt efter en användarhandling (klick/tangent) startar anropet
     genast, förbi kön -- ett köpklick väntar aldrig på bakgrundsdata. */
  function userInitiated() {
    return !!(navigator.userActivation && navigator.userActivation.isActive);
  }
  function promote(url) {
    [PAGES, STATES].forEach(function (l) {
      for (var i = 0; i < l.queue.length; i += 1) {
        if (l.queue[i].url === url) { start(l, l.queue.splice(i, 1)[0]); return; }
      }
    });
  }
  function withTimeout(run) {
    var ctl = typeof AbortController === "function" ? new AbortController() : null;
    var timer = ctl ? window.setTimeout(function () { ctl.abort(); }, FETCH_TIMEOUT) : 0;
    return run(ctl ? ctl.signal : undefined).finally(function () { window.clearTimeout(timer); });
  }
  function queuedFetch(url, l, priority) {
    l = l || PAGES;
    return new Promise(function (resolve, reject) {
      function attempt(n) {
        var job = { url: url, run: function () {
          return withTimeout(function (signal) {
            return fetch(url, { credentials: "same-origin", signal: signal }).then(function (res) {
              if ((res.status === 429 || res.status === 503) && n < 3) {
                window.setTimeout(function () { attempt(n + 1); }, 700 * Math.pow(2, n));
                return;
              }
              if (!res.ok) throw new Error(res.status);
              return res.text().then(resolve);
            });
          }).catch(reject);
        } };
        if (priority) start(l, job);
        else { l.queue.push(job); pump(l); }
      }
      attempt(0);
    });
  }
  /* Samma URL hämtas en gång även när flera extraktorer (t.ex.
     categoryInfo + categoryCards) eller productState vill ha den.
     Texten sparas kort i minnet (inte DOM:en) för sekventiella anrop.
     Bara lyckade svar sparas; fel och avbrott lämnar ingen cache. */
  var TEXT_TTL = 60 * 1000;
  var htmlInflight = {};
  var htmlRecent = [];
  function pageText(url, l, priority) {
    var now = Date.now();
    htmlRecent = htmlRecent.filter(function (h) { return now - h.t < TEXT_TTL; });
    for (var i = 0; i < htmlRecent.length; i += 1) if (htmlRecent[i].url === url) return Promise.resolve(htmlRecent[i].text);
    if (htmlInflight[url]) { if (priority) promote(url); return htmlInflight[url]; }
    htmlInflight[url] = queuedFetch(url, l, priority).then(function (text) {
      htmlRecent.push({ url: url, text: text, t: Date.now() });
      if (htmlRecent.length > 12) htmlRecent.shift();
      return text;
    }).finally(function () { delete htmlInflight[url]; });
    return htmlInflight[url];
  }
  HZ8.fetchPage = function (href, extract) {
    if (!href) return Promise.reject(new Error("no href"));
    var key = extract.key + ":" + HZ8.path(href);
    var cached = cacheGet(key);
    if (cached) return Promise.resolve(cached);
    if (inflight[key]) return inflight[key];
    inflight[key] = pageText(HZ8.link(href))
      .then(function (text) {
        var doc = new DOMParser().parseFromString(text, "text/html");
        var value = extract.run(doc);
        cacheSet(key, value);
        return value;
      })
      .finally(function () { delete inflight[key]; });
    return inflight[key];
  };

  /* Riktig kategoridata: antal (Nyehandels egen räknare) + första
     produktbild. Aldrig en gissning -- saknas räknaren returneras null. */
  HZ8.categoryInfo = {
    key: "cat1",
    run: function (doc) {
      var counter = doc.querySelector("#products_count");
      var match = counter && counter.textContent.match(/(\d+)/);
      var img = doc.querySelector(".product-card__image img");
      return {
        count: match ? parseInt(match[1], 10) : null,
        image: img ? img.getAttribute("src") : null,
        imageAlt: img ? img.getAttribute("alt") : ""
      };
    }
  };

  /* De första produktkorten på en kategorisida hämtad med Nyehandels
     egen sortering "Mest populära" (?sort=popular) -- serverrenderade,
     samma markup som i gridet. */
  HZ8.popularCards = {
    key: "pop1",
    run: function (doc) {
      return Array.prototype.slice.call(doc.querySelectorAll("#category-products .product-card"), 0, 5)
        .map(function (card) { return card.outerHTML; });
    }
  };

  /* Alla serverrenderade produktkort på en kategorisida (första sidan). */
  HZ8.categoryCards = {
    key: "cards1",
    run: function (doc) {
      return Array.prototype.map.call(doc.querySelectorAll("#category-products .product-card"), function (card) {
        return { html: card.outerHTML, sale: !!card.querySelector(".price.has-comparison, del.comparison") };
      });
    }
  };

  /* ---- Nyehandels frontend-API (samma mönster som Theme 6:s quick add):
     produktsidans HTML -> produkt-id -> /frontend-api/product/state ->
     vald variant. Resultatet cachas per produkt i sessionStorage. ---- */
  HZ8.apiHeaders = function () {
    var m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
    var h = { Accept: "application/json", "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" };
    if (m) h["X-XSRF-TOKEN"] = decodeURIComponent(m[1]);
    return h;
  };
  var stateInflight = {};
  HZ8.productState = function (productUrl) {
    if (!productUrl) return Promise.reject(new Error("no product url"));
    var key = "state5:" + HZ8.path(productUrl);
    var cached = cacheGet(key);
    if (cached) return Promise.resolve(cached);
    var priority = userInitiated();
    if (stateInflight[key]) { if (priority) promote(HZ8.link(productUrl)); return stateInflight[key]; }
    var page = null;
    stateInflight[key] = pageText(HZ8.link(productUrl), STATES, priority)
      .then(function (html) {
        var m = html.match(/window\.visitor\.viewProduct\('(\d+)'\)/);
        if (!m) throw new Error("no product id");
        page = new DOMParser().parseFromString(html, "text/html");
        return withTimeout(function (signal) {
          return fetch("/frontend-api/product/state", {
            method: "POST",
            credentials: "same-origin",
            headers: HZ8.apiHeaders(),
            body: JSON.stringify({ product_id: parseInt(m[1], 10), variant_ids: [null] }),
            signal: signal
          }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); });
        });
      })
      .then(function (data) {
        var sv = data.selected_variant || {};
        var product = data.product || {};
        var variants = product.variants || [];
        var images = product.images || [];
        /* Lager enligt Nyehandels egna fält -- inget antal visas. */
        var inStock = !sv.track_inventory || sv.always_orderable || (sv.available_stock || 0) > 0;
        var status = inStock ? sv.positive_inventory_status : sv.negative_inventory_status;
        /* Kategori = sista brödsmulan före produkten (produktnamnet och
           "Hem" räknas inte). */
        var name = product.name || "";
        var crumbs = page ? Array.prototype.map.call(page.querySelectorAll(".designer-breadcrumbs a"), function (a) { return a.textContent.replace(/\s+/g, " ").trim(); })
          .filter(function (t) { return t && t !== name && !/^hem$/i.test(t); }) : [];
        var value = {
          variantId: sv.id || null,
          variants: variants.length,
          buyable: sv.buyable !== false && sv.in_stock !== false && sv.active !== false && inStock,
          inStock: inStock,
          /* Högsta antal som kan läggas i korgen (Nyehandel svarar 406 över
             lagret). Visas aldrig som siffra. null = ingen gräns. */
          maxQty: sv.track_inventory && !sv.always_orderable ? Math.max(0, sv.available_stock || 0) : null,
          stockLabel: status && status.name ? status.name : (inStock ? "I lager" : "Slut i lager"),
          image: images[0] && images[0].image_url ? images[0].image_url : null,
          imageAlt: images[0] && images[0].alt ? images[0].alt : "",
          /* Första riktiga stycket i produktens korta beskrivning. */
          intro: page ? firstParagraph(page.querySelector(".short-description")) : "",
          category: crumbs.length ? crumbs[crumbs.length - 1] : "",
          /* Snittbetyg och antal ur produktens JSON-LD (Nyehandels egna
             produktomdömen). null när omdömen saknas -- aldrig antaget. */
          rating: page ? productRating(page) : null
        };
        cacheSet(key, value);
        return value;
      })
      .finally(function () { delete stateInflight[key]; });
    return stateInflight[key];
  };
  function productRating(doc) {
    var scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i += 1) {
      try {
        var data = JSON.parse(scripts[i].textContent);
        var agg = data && data["@type"] === "Product" ? data.aggregateRating : null;
        var value = agg ? parseFloat(agg.ratingValue) : NaN;
        var count = agg ? parseInt(agg.reviewCount, 10) : 0;
        if (!isNaN(value) && count > 0) return { value: value, count: count };
      } catch (e) { /* annan JSON-LD */ }
    }
    return null;
  }
  function firstParagraph(root) {
    if (!root) return "";
    var ps = root.querySelectorAll("p");
    for (var i = 0; i < ps.length; i += 1) {
      var t = ps[i].textContent.replace(/\s+/g, " ").trim();
      if (t.length >= 40) return t;
    }
    return "";
  }

  /* Bästsäljarsidans aktiva urval (Nyehandels egen sida /page/vara-
     bastsaljare): kategori eller källa, och om ordningen är fast. Delas
     av startsidans bästsäljare (30-bestsellers.js) och Butik (87-shop.js). */
  HZ8.bestsellerSource = {
    key: "bs-src1",
    run: function (doc) {
      var btn = doc.querySelector(".nh-bs-filters .is-active[data-cat], .nh-bs-filters [data-cat]");
      var grid = doc.querySelector("[data-nh-source]");
      return {
        cat: btn ? btn.getAttribute("data-cat") : null,
        source: grid ? grid.getAttribute("data-nh-source") : null,
        fixed: grid ? grid.getAttribute("data-nh-order") === "fixed" : false
      };
    }
  };
  /* Lägg i varukorgen via Nyehandels egen Vuex-action (drawern öppnas
     reaktivt, precis som från produktsidans köpknapp). */
  HZ8.addVariant = function (variantId, quantity) {
    var store = HZ8.store();
    var payload = { product_variant_id: Number(variantId), quantity: Math.max(1, parseInt(quantity, 10) || 1), meta: null };
    if (store && store._actions && store._actions["cart/addVariant"]) return Promise.resolve(store.dispatch("cart/addVariant", payload));
    return fetch("/frontend-api/cart/item", { method: "POST", credentials: "same-origin", headers: HZ8.apiHeaders(), body: JSON.stringify(payload) })
      .then(function (r) { if (!r.ok) { var e = new Error(r.status); e.status = r.status; throw e; } return r.json(); });
  };

  /* ---- Overlay-hjälp: scroll-lås + fokusfälla + Escape ---- */
  var lockCount = 0;
  HZ8.lockScroll = function () {
    lockCount += 1;
    if (lockCount === 1) document.documentElement.classList.add("hz8-scroll-locked");
  };
  HZ8.unlockScroll = function () {
    lockCount = Math.max(0, lockCount - 1);
    if (!lockCount) document.documentElement.classList.remove("hz8-scroll-locked");
  };

  var FOCUSABLE = "a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])";
  HZ8.trapFocus = function (container, onEscape) {
    var previous = document.activeElement;
    function visible(el) { return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length); }
    function onKey(e) {
      if (e.key === "Escape") { e.preventDefault(); if (onEscape) onEscape(); return; }
      if (e.key !== "Tab") return;
      var items = Array.prototype.filter.call(container.querySelectorAll(FOCUSABLE), visible);
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", onKey, true);
    window.setTimeout(function () {
      var target = container.querySelector("[data-hz8-autofocus]") ||
        Array.prototype.filter.call(container.querySelectorAll(FOCUSABLE), visible)[0];
      if (target) target.focus({ preventScroll: true });
    }, 60);
    return function release() {
      document.removeEventListener("keydown", onKey, true);
      if (previous && previous.focus && document.contains(previous)) previous.focus({ preventScroll: true });
    };
  };

  HZ8.icon = function (name) {
    var paths = {
      truck: '<path d="M3 6h11v9H3z"/><path d="M14 9h4l3 3v3h-7"/><circle cx="7" cy="17" r="1.6"/><circle cx="17" cy="17" r="1.6"/>',
      shield: '<path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z"/><path d="M9 12l2 2 4-4"/>',
      box: '<path d="M4 8l8-4 8 4v8l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v8"/>',
      chat: '<path d="M4 5h16v10H9l-5 4z"/>',
      doc: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M10 12h5M10 16h5"/>',
      search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
      filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
      close: '<path d="M6 6l12 12M18 6L6 18"/>',
      chevron: '<path d="M6 9l6 6 6-6"/>',
      arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
      leaf: '<path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z"/><path d="M5 19l8-8"/>'
    };
    return '<svg class="hz8-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + (paths[name] || "") + "</svg>";
  };
})();
