/* "Utvalda serier" (2026-10-08): education-first, efter "Våra produkter".
   Vald riktning: theme8/review/series-campaign-education-concepts-2026-10/
   concept-b-editorial-split.png. Ingen beskrivande brödtext förrän
   faktagranskad copy finns -- bara överrubrik, namn, format och CTA:er.

   Desktop (>= 768 px): redaktionella split-paneler, ingen autoplay.
   Mobil (< 768 px): karusell, ett kort i taget (se wireCarousel).

   Destinationer (kontrollerade mot Nyehandel 2026-10-08):
   - "Se produkter": THCaB och THCbA finns inte som egna kategorier eller
     serieattribut i Nyehandel. Seriebildernas produkter är Faraohs THC-A-
     linje (4 vapes + 1 cart) resp. Faraohs THC-B-vape, och de enda
     listor som visar exakt dem är Nyehandels egna filtrerade vyer
     (THC-A resp. THC-B, Varumärke Faraoh). /thca (30 produkter, buds,
     hasch m.m.) och /thcb (även Tatra Hemp) visar fel urval. Magic Sauce
     och Nano11: seriernas egna kategorisidor (samma urval som Nyehandels
     Serie-attribut).
   - "Läs om serien": framtida kanoniska informationssidor som inte finns
     än (data-hz8-pending-info-route). I Theme 8-previewn visas knappen
     för att demonstrera modulen; utanför previewn provas adressen och
     knappen döljs automatiskt om sidan inte svarar med en riktig sida.
     Theme 8 får inte publiceras skarpt innan sidorna finns.
   - Formatraderna är fastställda av Vilmer 2026-10-08 (formats nedan).
     Sortimentskontroll samma dag: Magic Sauce-sidan har även två hasch-
     produkter och någon Nano11-pre-roll säljs inte i dag -- rapporterat,
     raderna följer beslutet tills sortimentet/beslutet ändras.
   - Motiven (symbol + linjeteckning) är ren dekor, aria-hidden. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  var SERIES = [
    { key: "thcab", name: "THCaB", formats: "Vapes · carts", motif: "ankh", scene: "pyramids", info: "/sv/page/thcab", shop: "/sv/categories/thca?filters=Varum%C3%A4rke_Faraoh", asset: "series-thcab-v1.webp", focus: "70% 50%",
      alt: "THCaB från Faraoh: vape och cart i en mörk egyptisk miljö" },
    { key: "thcba", name: "THCbA", formats: "Vapes", motif: "eye", scene: "pyramids", info: "/sv/page/thcba", shop: "/sv/categories/thcb?filters=Varum%C3%A4rke_Faraoh", asset: "series-thcba-v1.webp", focus: "62% 50%",
      alt: "THCbA från Faraoh: vape i månljus på blek sand" },
    { key: "magic", name: "Magic Sauce", formats: "Vapes · carts · buds", motif: "palm", scene: "palms", info: "/sv/page/magic-sauce", shop: "/sv/categories/magic-sauce", asset: "series-magic-sauce-v1.webp", focus: "100% 50%",
      alt: "Magic Sauce från Magic Farmers: refillvätska, cart, vape och buds i solnedgång" },
    { key: "nano", name: "Nano11", formats: "Buds · pre-rolls", motif: "mountain", scene: "mountains", info: "/sv/page/nano11", shop: "/sv/categories/nano-11", asset: "series-nano11-v1.webp", focus: "100% 50%",
      alt: "Nano11 från Tatra Hemp: förpackningar vid havet i blå skymning" }
  ];
  var AUTOPLAY_MS = 5000;
  var MOBILE = "(max-width: 767px)";
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';
  var PREV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>';
  var NEXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
  var PAUSE = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="7" y="6" width="3.2" height="12" rx="1"/><rect x="13.8" y="6" width="3.2" height="12" rx="1"/></svg>';
  var PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>';

  /* Diskreta linjemotiv (dekor). */
  var MOTIFS = {
    ankh: '<path d="M12 3c-2.2 0-3.5 1.8-3.5 3.8 0 2.4 2 4.2 3.5 5.2 1.5-1 3.5-2.8 3.5-5.2C15.5 4.8 14.2 3 12 3z"/><path d="M12 12v9M7.5 13.6h9"/>',
    eye: '<path d="M2.5 10c3-3.4 6.2-4.6 9.5-4.6s6.6 1.4 9.5 4.6c-2.7 2.6-5.8 3.6-9.5 3.6S5.3 12.6 2.5 10z"/><circle cx="12" cy="9.7" r="2.2"/><path d="M10.2 13.5l-1.6 5.2M14.6 13.3l1.4 3.6 2.6.6"/>',
    palm: '<path d="M12.4 21c0-4.8.4-8.6 1.3-11.8"/><path d="M13.7 9.2c-1.5-2.5-4-3.5-7.1-3 2 .5 3.6 1.7 4.6 3.3M13.7 9.2c1-2.7 3.4-4.3 6.5-4.3-1.8.8-3.2 2.2-4 4M13.7 9.2c2.5-.5 4.8.4 6.5 2.5-2-.4-3.8-.2-5.4.5M13.7 9.2c-2.6-.2-4.8.9-6 3 1.6-.8 3.3-1 5-.5"/>',
    mountain: '<path d="M1.5 19l6.8-10.5 3.6 5.2 2.6-3.7L22.5 19z"/><path d="M8.3 8.5l1.6 2.6 1.3-1"/>'
  };
  var SCENES = {
    pyramids: '<path d="M2 58h116"/><path d="M14 58l24-32 24 32M46 58l22-26 22 26M28 44.5h21M58 46h22"/><circle cx="98" cy="18" r="6"/><path d="M84 18h-6M118 18h-6M98 4v-3"/>',
    palms: '<path d="M2 58h116"/><path d="M84 58c0-12 1-22 4-30M88 28c-4-5-9-7-15-6 4 1 7 3 9 6M88 28c2-6 7-9 13-9-4 2-6 5-8 8M88 28c5-1 10 1 13 5-4-1-8 0-11 1"/><path d="M104 58c0-8 .6-14 2.4-19M106.4 39c-2.6-3.2-5.6-4.3-9.4-3.7M106.4 39c1.3-3.7 4.4-5.6 8-5.6"/><path d="M8 58c6-4 14-6 22-6s16 2 22 6"/>',
    mountains: '<path d="M2 58l24-28 12 13 20-26 24 30 12-9 24 20"/><path d="M46 31l6 7 6-5M70 45l6 6"/>'
  };
  function svg(paths, vb, cls) { return '<svg class="' + cls + '" viewBox="' + vb + '" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + paths + '</svg>'; }

  function previewActive() {
    try { return !!new URLSearchParams(location.search).get("preview"); } catch (e) { return false; }
  }

  function cardHtml(s, i, total, assetBase) {
    var n = i + 1;
    var id = "hz8-sedu-" + s.key;
    return '<li class="hz8-sedu__slide" data-index="' + i + '" role="group" aria-roledescription="serie" aria-label="Serie ' + n + ' av ' + total + ': ' + HZ8.esc(s.name) + '">' +
      '<article class="hz8-sedu-card hz8-sedu-card--' + s.key + '" aria-labelledby="' + id + '">' +
      '<div class="hz8-sedu-card__media"><img src="' + assetBase + s.asset + '" alt="' + HZ8.esc(s.alt) + '" loading="lazy" decoding="async" width="1600" height="1067" style="object-position:' + s.focus + '"></div>' +
      '<div class="hz8-sedu-card__info">' +
      '<p class="hz8-sedu-card__top"><span class="hz8-sedu-card__eyebrow">Lär känna serien</span><span class="hz8-sedu-card__num" aria-hidden="true">Serie 0' + n + svg(MOTIFS[s.motif], "0 0 24 24", "hz8-sedu-card__motif") + '</span></p>' +
      '<h3 class="hz8-sedu-card__name" id="' + id + '">' + HZ8.esc(s.name) + '</h3>' +
      '<p class="hz8-sedu-card__formats">' + HZ8.esc(s.formats) + '</p>' +
      svg(SCENES[s.scene], "0 0 120 60", "hz8-sedu-card__scene") +
      '<div class="hz8-sedu-card__actions">' +
      '<a class="hz8-sedu-card__read" href="' + HZ8.esc(HZ8.link(s.info)) + '" data-hz8-pending-info-route="' + HZ8.esc(s.info) + '" aria-label="Läs om serien ' + HZ8.esc(s.name) + '">Läs om serien' + ARROW + '</a>' +
      '<a class="hz8-sedu-card__shop" href="' + HZ8.esc(HZ8.link(s.shop)) + '" aria-label="Se produkter i serien ' + HZ8.esc(s.name) + '">Se produkter</a>' +
      '</div></div></article></li>';
  }

  function sectionHtml(assetBase) {
    return '<section class="hz8-home__section hz8-sedu" aria-labelledby="hz8-sedu-title">' +
      '<div class="hz8-sedu__head"><h2 id="hz8-sedu-title">Utvalda serier</h2></div>' +
      '<div class="hz8-sedu__stage">' +
      '<div class="hz8-sedu__viewport" role="region" aria-label="Utvalda serier">' +
      '<ul class="hz8-sedu__track">' + SERIES.map(function (s, i) { return cardHtml(s, i, SERIES.length, assetBase); }).join("") + '</ul></div>' +
      '<button type="button" class="hz8-sedu__arrow hz8-sedu__arrow--prev" data-hz8-sedu-prev aria-label="Föregående serie">' + PREV + '</button>' +
      '<button type="button" class="hz8-sedu__arrow hz8-sedu__arrow--next" data-hz8-sedu-next aria-label="Nästa serie">' + NEXT + '</button>' +
      '</div>' +
      '<div class="hz8-sedu__ctrl">' +
      '<div class="hz8-sedu__dots">' + SERIES.map(function (s, i) { return '<button type="button" class="hz8-sedu__dot" data-hz8-sedu-dot="' + i + '" aria-label="Visa serie ' + (i + 1) + ' av ' + SERIES.length + ': ' + HZ8.esc(s.name) + '"><span aria-hidden="true"></span></button>'; }).join("") + '</div>' +
      '<button type="button" class="hz8-sedu__play" data-hz8-sedu-play aria-pressed="false" aria-label="Pausa automatisk visning">' + PAUSE + '</button>' +
      '</div>' +
      '<p class="hz8-visually-hidden" data-hz8-sedu-status aria-live="off"></p>' +
      '</section>';
  }

  /* Mobilkarusell:
     - scroll-snap ger swipe och horisontell styrplatta; pilar, prickar och
       piltangenter (när karusellen har fokus) flyttar ett kort;
     - fokus i ett kort rullar fram hela kortet;
     - autoplay var 5:e sekund, bara på mobil, bara när karusellen syns och
       fliken är aktiv; pausar vid hover och fokus; touch/pekare eller egen
       navigering pausar för resten av besöket (play-knappen kan starta
       igen); aldrig vid prefers-reduced-motion;
     - statusraden annonserar bara användarens egna byten (aria-live sätts
       till "polite" först då). */
  function wireCarousel(section) {
    var viewport = section.querySelector(".hz8-sedu__viewport");
    var slides = section.querySelectorAll(".hz8-sedu__slide");
    var dots = section.querySelectorAll("[data-hz8-sedu-dot]");
    var playBtn = section.querySelector("[data-hz8-sedu-play]");
    var status = section.querySelector("[data-hz8-sedu-status]");
    var mq = window.matchMedia(MOBILE);
    var rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    var index = 0;
    var timer = 0;
    var visible = false;
    var hold = 0;            /* hover/fokus: tillfällig paus */
    var stopped = rm.matches; /* användarens paus eller reduced motion */

    function mobile() { return mq.matches; }
    /* Det rullande elementet är viewporten (overflow-x på mobil). */
    function current() { return Math.max(0, Math.min(slides.length - 1, Math.round(viewport.scrollLeft / Math.max(1, viewport.clientWidth)))); }
    function paint() {
      index = current();
      if (mobile()) { viewport.setAttribute("aria-roledescription", "karusell"); viewport.setAttribute("tabindex", "0"); }
      else { viewport.removeAttribute("aria-roledescription"); viewport.removeAttribute("tabindex"); }
      dots.forEach(function (d, i) { d.setAttribute("aria-current", i === index ? "true" : "false"); });
      /* Statusraden speglar alltid synlig serie; den annonseras bara när
         användaren själv bytt (aria-live sätts då till "polite"). */
      if (mobile()) status.textContent = "Serie " + (index + 1) + " av " + slides.length + ": " + slides[index].querySelector("h3").textContent;
      slides.forEach(function (s, i) { s.toggleAttribute("inert", mobile() && i !== index && !s.contains(document.activeElement)); });
    }
    function go(i, byUser) {
      if (!mobile()) return;
      var n = (i + slides.length) % slides.length;
      viewport.scrollTo({ left: n * viewport.clientWidth, behavior: rm.matches ? "auto" : "smooth" });
      if (byUser) {
        stop();
        status.setAttribute("aria-live", "polite");
      }
    }
    function running() { return mobile() && visible && !stopped && !hold && document.visibilityState === "visible" && !rm.matches; }
    function schedule() {
      window.clearTimeout(timer);
      if (!running()) return;
      timer = window.setTimeout(function () { if (running()) go(current() + 1, false); schedule(); }, AUTOPLAY_MS);
    }
    function setPlayUi() {
      var paused = stopped || rm.matches;
      playBtn.innerHTML = paused ? PLAY : PAUSE;
      playBtn.setAttribute("aria-pressed", paused ? "true" : "false");
      playBtn.setAttribute("aria-label", paused ? "Starta automatisk visning" : "Pausa automatisk visning");
      section.classList.toggle("is-autoplay", !paused);
      /* Med reducerad rörelse startar autoplay aldrig -- ingen död knapp. */
      playBtn.hidden = rm.matches;
    }
    function stop() { stopped = true; status.setAttribute("aria-live", "polite"); setPlayUi(); schedule(); }

    section.querySelector("[data-hz8-sedu-prev]").addEventListener("click", function () { go(current() - 1, true); });
    section.querySelector("[data-hz8-sedu-next]").addEventListener("click", function () { go(current() + 1, true); });
    dots.forEach(function (d) { d.addEventListener("click", function () { go(parseInt(d.getAttribute("data-hz8-sedu-dot"), 10), true); }); });
    playBtn.addEventListener("click", function () {
      if (rm.matches) return;
      stopped = !stopped;
      setPlayUi();
      status.setAttribute("aria-live", stopped ? "polite" : "off");
      schedule();
    });
    viewport.addEventListener("keydown", function (e) {
      if (!mobile() || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
      e.preventDefault();
      go(current() + (e.key === "ArrowRight" ? 1 : -1), true);
    });
    /* Swipe/styrplatta/pekare = egen navigering. */
    ["pointerdown", "touchstart", "wheel"].forEach(function (t) {
      viewport.addEventListener(t, function (e) { if (t !== "wheel" || Math.abs(e.deltaX) > Math.abs(e.deltaY)) { if (mobile() && !stopped) stop(); } }, { passive: true });
    });
    section.addEventListener("mouseenter", function () { hold += 1; schedule(); });
    section.addEventListener("mouseleave", function () { hold = Math.max(0, hold - 1); schedule(); });
    section.addEventListener("focusin", function (e) {
      hold = 1;
      var slide = e.target.closest(".hz8-sedu__slide");
      if (slide && mobile()) {
        var i = parseInt(slide.getAttribute("data-index"), 10);
        if (i !== current()) viewport.scrollTo({ left: i * viewport.clientWidth, behavior: "auto" });
      }
      schedule();
    });
    section.addEventListener("focusout", function () { if (!section.contains(document.activeElement)) { hold = 0; schedule(); } });
    document.addEventListener("visibilitychange", schedule);
    var raf = 0;
    viewport.addEventListener("scroll", function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(paint); }, { passive: true });
    function modeChange() { paint(); schedule(); }
    if (mq.addEventListener) { mq.addEventListener("change", modeChange); rm.addEventListener("change", function () { if (rm.matches) stopped = true; setPlayUi(); schedule(); }); }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; schedule(); }, { threshold: 0.6 }).observe(viewport);
    } else visible = true;
    setPlayUi();
    paint();
  }

  /* Skydd mot publicering med saknade informationssidor: utanför
     Theme 8-previewn provas varje adress och knappen tas bort om den inte
     svarar med en riktig informationssida. */
  function hydrate(section) {
    if (previewActive()) return;
    section.querySelectorAll("[data-hz8-pending-info-route]").forEach(function (a) {
      fetch(a.getAttribute("data-hz8-pending-info-route"), { credentials: "same-origin", redirect: "manual" })
        .then(function (r) { if (r.status !== 200) throw new Error(r.status); return r.text(); })
        .then(function (t) { if (/section class="main-container category|hittades inte/i.test(t)) throw new Error("not an info page"); })
        .catch(function () { a.closest(".hz8-sedu-card__actions").classList.add("no-info"); a.remove(); });
    });
  }

  function guardImages(section) {
    section.querySelectorAll(".hz8-sedu-card__media img").forEach(function (img) {
      img.addEventListener("error", function () { img.parentNode.classList.add("is-missing"); img.remove(); }, { once: true });
    });
  }

  HZ8.register("homepage-series-education", function (context) {
    if (!context.home) return;
    var products = context.home.querySelector(".hz8-products");
    var holder = document.createElement("div");
    holder.innerHTML = sectionHtml(context.assetBase);
    var section = holder.firstChild;
    if (products && products.parentNode) products.parentNode.insertBefore(section, products.nextSibling);
    else context.home.appendChild(section);
    guardImages(section);
    wireCarousel(section);
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); hydrate(section); }
      }, { rootMargin: "1200px 0px" });
      io.observe(section);
    } else hydrate(section);
  });
})();
