/* Återanvändbara byggstenar: produktkarusell (HZ8.productRail) och
   valpanel (HZ8.openChoicePanel -- popover på desktop, bottom sheet på
   mobil). Används av kategori-/seriesidorna och kan återanvändas av
   startsidan och kampanjsidor senare. Inga externa bibliotek.

   Produktkarusell
   - Källa = en riktig kategori-/filter-route; korten är Nyehandels egna
     serverrenderade .product-card (samma gemensamma kort och "+ Lägg
     till"/"Välj variant" som i gridet, via 03-product-card.js).
   - Data hämtas först när raden närmar sig viewporten; bilder lazy med
     explicita mått. Tom källa -> raden tas bort (onEmpty).
   - Native horisontell scroll + scroll snap; på desktop diskreta
     föregående/nästa-knappar som bara visas när innehållet är bredare
     än raden och som inaktiveras i början/slutet. Ingen autoplay, ingen
     loop. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  var uid = 0;

  function countLabel(n) { return n + (n === 1 ? " produkt" : " produkter"); }
  HZ8.countLabel = countLabel;

  function prepareCardHtml(html) {
    var tmp = document.createElement("div");
    tmp.innerHTML = html;
    tmp.querySelectorAll("[id]").forEach(function (el) { el.removeAttribute("id"); });
    tmp.querySelectorAll("img").forEach(function (img) {
      img.loading = "lazy";
      img.decoding = "async";
      if (!img.getAttribute("width")) { img.setAttribute("width", "400"); img.setAttribute("height", "400"); }
    });
    return tmp.innerHTML;
  }

  HZ8.productRail = function (opts) {
    uid += 1;
    var id = opts.id || "hz8-rail-" + uid;
    var titleId = id + "-title";
    var section = document.createElement("section");
    section.className = "hz8-prail" + (opts.className ? " " + opts.className : "");
    section.id = id;
    section.setAttribute("aria-labelledby", titleId);
    section.innerHTML =
      '<div class="hz8-prail__head">' +
        '<h2 class="hz8-prail__title" id="' + titleId + '" tabindex="-1">' + HZ8.esc(opts.title) + "</h2>" +
        '<span class="hz8-prail__count"></span>' +
        (opts.href ? '<a class="hz8-prail__all" href="' + HZ8.esc(opts.href) + '">Visa alla<span class="hz8-visually-hidden"> ' + HZ8.esc(opts.title) + "</span>" + HZ8.icon("arrow") + "</a>" : "") +
        '<div class="hz8-prail__controls" hidden>' +
          '<button type="button" class="hz8-prail__btn" data-dir="-1" aria-label="Föregående produkter" aria-controls="' + id + '-list">' + HZ8.icon("chevron") + "</button>" +
          '<button type="button" class="hz8-prail__btn" data-dir="1" aria-label="Nästa produkter" aria-controls="' + id + '-list">' + HZ8.icon("chevron") + "</button>" +
        "</div>" +
      "</div>" +
      '<ul class="hz8-prail__list products" id="' + id + '-list" role="list" aria-busy="true"></ul>';
    var list = section.querySelector(".hz8-prail__list");
    var controls = section.querySelector(".hz8-prail__controls");
    var buttons = controls.querySelectorAll("button");

    function syncButtons() {
      var max = list.scrollWidth - list.clientWidth;
      var overflow = max > 4;
      controls.hidden = !overflow;
      if (!overflow) return;
      buttons[0].disabled = list.scrollLeft <= 2;
      buttons[1].disabled = list.scrollLeft >= max - 2;
    }
    Array.prototype.forEach.call(buttons, function (b) {
      b.addEventListener("click", function () {
        var dir = parseInt(b.getAttribute("data-dir"), 10);
        var card = list.querySelector("li");
        var step = card ? card.getBoundingClientRect().width + 16 : list.clientWidth * 0.8;
        var perView = Math.max(1, Math.floor(list.clientWidth / step));
        list.scrollBy({ left: dir * step * perView, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      });
    });
    list.addEventListener("scroll", function () { window.requestAnimationFrame(syncButtons); }, { passive: true });
    window.addEventListener("resize", syncButtons);

    function render(cards) {
      var items = (cards || []).slice(0, opts.limit || 12);
      list.removeAttribute("aria-busy");
      if (!items.length) {
        section.remove();
        if (opts.onEmpty) opts.onEmpty();
        return;
      }
      list.innerHTML = items.map(function (c) { return '<li class="hz8-prail__item">' + prepareCardHtml(c.html) + "</li>"; }).join("");
      if (opts.count != null || cards.length) section.querySelector(".hz8-prail__count").textContent = countLabel(opts.count != null ? opts.count : cards.length);
      section.classList.toggle("is-single", items.length === 1);
      window.requestAnimationFrame(syncButtons);
      if (opts.onRender) opts.onRender(items);
    }

    function load() {
      if (opts.cards) { render(opts.cards); return; }
      HZ8.fetchPage(opts.source, HZ8.categoryCards).then(function (cards) {
        if (opts.exclude) cards = cards.filter(function (c) { return !opts.exclude(c); });
        render(cards);
      }).catch(function () {
        list.removeAttribute("aria-busy");
        list.innerHTML = '<li class="hz8-state hz8-state--error"><p>Produkterna kunde inte laddas.</p></li>';
      });
    }

    if (opts.eager || !("IntersectionObserver" in window)) load();
    else {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); load(); }
      }, { rootMargin: "600px 0px" });
      window.requestAnimationFrame(function () { io.observe(section); });
    }
    return section;
  };

  /* ---- Valpanel: popover (desktop) / bottom sheet (mobil) ----
     Alternativen är riktiga länkar (vanlig navigering, ny flik, bakåt/
     framåt, preview-propagation, crawlbara). */
  var openPanel = null;
  HZ8.openChoicePanel = function (trigger, title, items) {
    if (openPanel) openPanel.close();
    uid += 1;
    var mobile = window.matchMedia("(max-width: 767px)").matches;
    var panel = document.createElement("div");
    panel.className = "hz8-choice" + (mobile ? " is-sheet" : " is-popover");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", mobile ? "true" : "false");
    panel.setAttribute("aria-labelledby", "hz8-choice-" + uid);
    panel.innerHTML = '<div class="hz8-choice__head"><p class="hz8-choice__title" id="hz8-choice-' + uid + '">' + HZ8.esc(title) + "</p>" +
      '<button type="button" class="hz8-choice__close" aria-label="Stäng">' + HZ8.icon("close") + "</button></div>" +
      '<ul class="hz8-choice__list" role="list">' + items.map(function (it) {
        return '<li><a class="hz8-choice__item" href="' + HZ8.esc(it.href) + '"><span>' + HZ8.esc(it.label) + "</span>" +
          (it.count != null ? '<span class="hz8-choice__count">' + HZ8.esc(countLabel(it.count)) + "</span>" : "") + "</a></li>";
      }).join("") + "</ul>";
    var backdrop = null;
    if (mobile) {
      backdrop = document.createElement("div");
      backdrop.className = "hz8-backdrop hz8-choice-backdrop is-visible";
      document.body.appendChild(backdrop);
      HZ8.lockScroll();
    }
    document.body.appendChild(panel);
    if (!mobile) {
      var r = trigger.getBoundingClientRect();
      var w = Math.min(320, window.innerWidth - 24);
      panel.style.width = w + "px";
      var left = Math.min(Math.max(12, r.left), window.innerWidth - w - 12);
      var top = r.bottom + 8;
      panel.style.left = left + window.scrollX + "px";
      panel.style.top = top + window.scrollY + "px";
      var ph = panel.getBoundingClientRect().height;
      if (top + ph > window.innerHeight - 12 && r.top - ph - 8 > 12) panel.style.top = r.top - ph - 8 + window.scrollY + "px";
    }
    trigger.setAttribute("aria-expanded", "true");
    var release = HZ8.trapFocus(panel, close);
    function outside(e) { if (!panel.contains(e.target) && !trigger.contains(e.target)) close(); }
    function close() {
      if (!panel.isConnected) return;
      panel.remove();
      if (backdrop) { backdrop.remove(); HZ8.unlockScroll(); }
      document.removeEventListener("pointerdown", outside, true);
      trigger.setAttribute("aria-expanded", "false");
      release();
      openPanel = null;
    }
    panel.querySelector(".hz8-choice__close").addEventListener("click", close);
    panel.addEventListener("click", function (e) { if (e.target.closest(".hz8-choice__item") && !(e.metaKey || e.ctrlKey || e.shiftKey)) window.setTimeout(close, 0); });
    window.setTimeout(function () { document.addEventListener("pointerdown", outside, true); }, 0);
    openPanel = { close: close };
    return openPanel;
  };
})();
