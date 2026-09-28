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
  HZ8.fetchPage = function (href, extract) {
    var key = extract.key + ":" + HZ8.path(href);
    var cached = cacheGet(key);
    if (cached) return Promise.resolve(cached);
    if (inflight[key]) return inflight[key];
    inflight[key] = fetch(HZ8.link(href), { credentials: "same-origin" })
      .then(function (res) { if (!res.ok) throw new Error(res.status); return res.text(); })
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

  /* Produktlänkar på Nyehandels egen "Våra bästsäljare"-sida. */
  HZ8.bestsellerPaths = {
    key: "best1",
    run: function (doc) {
      var seen = {};
      return Array.prototype.slice.call(doc.querySelectorAll(".product-card a[href*='/products/']"))
        .map(function (a) { return HZ8.path(a.getAttribute("href")); })
        .filter(function (p) { if (!p || seen[p]) return false; seen[p] = true; return true; });
    }
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
