/* Startsidans kundomdömen (2026-10-08).

   Två källor, alltid åtskilda och namngivna:
   1. Trustpilot -- endast Trustpilots officiella TrustBox "Mini" (mall
      53aa8807dec7e10d38f59f32, samma business unit som adminens widget)
      visar betyg och antal, live i Trustpilots egen iframe. Kontot har
      inte tillgång till TrustBoxar med enskilda omdömen, Review
      Highlights, AI Summary eller Display API (kontrollerat 2026-10-08):
      därför ingen siffra, inget citat, ingen sammanfattning och inga
      ämnen i vår egen markup. Blockeras Trustpilot syns den riktiga
      länken i samma reserverade höjd.
   2. Produktomdömen från hazey.se -- Nyehandels egna omdömen, ENDAST de
      poster som står i WHITELIST nedan (granskade ordagrant 2026-10-08,
      se theme8/review/homepage-trust-final/candidate-reviews.json).
      Varje post hämtas live från produktsidan och visas bara om namn,
      datum och text fortfarande stämmer exakt -- ändrar kunden sitt
      omdöme eller tas det bort visas det inte. Texten visas ordagrant
      utan tillagda citattecken; betyget är det riktiga. Ingen
      Review-/AggregateRating-schema, ingen "verifierad"-märkning och
      ingen Trustpilot-logotyp på dessa kort.
   Ett nytt omdöme kommer bara med genom att en människa granskar det
   och lägger in det i WHITELIST. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  var TP_PROFILE = "https://se.trustpilot.com/review/hazey.se";
  var TP_WRITE = "https://se.trustpilot.com/evaluate/hazey.se";
  var TP_TEMPLATE = "53aa8807dec7e10d38f59f32";
  var TP_UNIT = "6479dc28f0b041b3c79af588";

  /* Godkända produktomdömen, i visningsordning. product = produktsidans
     sökväg, name/date/text = exakt som i Nyehandels data. */
  var WHITELIST = [
    { product: "/sv/products/vape-magic-sauce-99-2ml", name: "Josefine", date: "2026-04-08T10:01:09.000000Z",
      text: "Alltid bra grejer från hazey!\r\nHar ibland varit lite fel på vapesen men alltid bra och snabb respons samt att dom skickade en ny! \r\nHar beställde många gånger från er och kommer fortsätta med det!" },
    { product: "/sv/products/ccell-m4-vape-batteri-510", name: "Oscar", date: "2025-05-14T15:07:44.000000Z",
      text: "För att vara så pass billig blev jag förvånad över hur bra den fungerade. Liten och kompakt passar perfekt för att ta med sig för en dagsutflykt, riktigt skön omväxling mot min vanliga." },
    { product: "/sv/products/buds-cbd-30-triple-scoop-35-gram", name: "Aida", date: "2025-07-17T07:05:40.000000Z",
      text: "Verkligen fin doft av glass med 3 smaker" },
    { product: "/sv/products/cart-magic-sauce-99-1ml", name: "Booose", date: "2026-03-13T18:32:51.000000Z",
      text: "Fick fel produkt först, men bra support gjorde så jag fick rätt tillslut. \r\nRekommenderas stay, återkommer." },
    { product: "/sv/products/ccell-m3-plus-vape-batteri-510", name: "Fred Winters", date: "2023-05-08T18:18:03.000000Z",
      text: "Smidig. Lätt. Omöjligt att göra fel.\r\nFinns två olika smak-inställningar, men det hade varit kul att kontrollera temperaturen mer exakt. Ändå ett klart köp." },
    { product: "/sv/products/buds-thca-24-zkittles-indoor-5-gram", name: "Clay", date: "2026-03-23T13:16:00.000000Z",
      text: "Jag är nöjd! Skönt att kunna hitta produkter på kampanj för den fattigare." },
    { product: "/sv/products/vape-thc-a-50-live-resin-faraoh-1ml", name: "Kristoffer R", date: "2026-02-15T14:28:21.000000Z",
      text: "Kvalitet rakt igenom!" },
    { product: "/sv/products/buds-magic-sauce-50-samurai-jack-5-gram", name: "Virre", date: "2026-02-21T00:32:48.000000Z",
      text: "Den här var helt fantastisk 😍 har testat 4 eller 5 buds från Hazey och den här är helt klart bäst." },
    { product: "/sv/products/ccell-m3-plus-vape-batteri-510", name: "O", date: "2024-05-02T14:42:55.000000Z",
      text: "riktigt bra konstruktion, lätt värt pengarna" }
  ];

  var EXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>';
  var PREV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>';
  var NEXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
  var NEW_TAB = '<span class="hz8-visually-hidden"> (öppnas i ny flik)</span>';

  function mountTrustbox(widget) {
    if (!widget || widget.classList.contains("trustpilot-widget")) return;
    widget.classList.add("trustpilot-widget");
    if (!document.querySelector("script[src*='tp.widget.bootstrap']")) {
      var s = document.createElement("script");
      s.src = "https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";
      s.async = true;
      document.head.appendChild(s);
    }
    var tries = 0;
    (function load() {
      if (window.Trustpilot && window.Trustpilot.loadFromElement) {
        try { window.Trustpilot.loadFromElement(widget, true); } catch (e) {}
      } else if (tries++ < 40) window.setTimeout(load, 250);
    })();
  }

  /* Produktsidans namn och omdömen (Nyehandels <product-reviews :reviews>). */
  var productReviews = {
    key: "reviews1",
    run: function (doc) {
      var h1 = doc.querySelector("h1");
      var el = doc.querySelector("product-reviews");
      var raw = el && el.getAttribute(":reviews");
      var list = [];
      try { list = raw ? JSON.parse(raw) : []; } catch (e) { list = []; }
      return {
        title: h1 ? h1.textContent.replace(/\s+/g, " ").trim() : "",
        reviews: list.map(function (r) { return { name: r.anonymous ? null : r.name, anonymous: !!r.anonymous, rating: Number(r.rating), date: r.created_at, text: r.review }; })
      };
    }
  };

  /* Godkända poster som fortfarande finns ordagrant på produktsidan. */
  function approved() {
    var pages = {};
    WHITELIST.forEach(function (w) { pages[w.product] = pages[w.product] || HZ8.fetchPage(w.product, productReviews).catch(function () { return null; }); });
    return Promise.all(WHITELIST.map(function (w) {
      return pages[w.product].then(function (page) {
        if (!page || !page.title) return null;
        var live = page.reviews.filter(function (r) { return r.date === w.date && r.text === w.text && (r.anonymous ? w.name === null : r.name === w.name); })[0];
        return live && live.rating >= 1 && live.rating <= 5 ? { product: w.product, title: page.title, review: live } : null;
      });
    })).then(function (rows) { return rows.filter(Boolean); });
  }

  function dateLabel(iso) {
    var d = new Date(iso);
    if (isNaN(d)) return "";
    try { return d.toLocaleDateString("sv-SE", { month: "long", year: "numeric" }); } catch (e) { return String(d.getFullYear()); }
  }

  function cardHtml(row, i, total) {
    var r = row.review;
    var when = dateLabel(r.date);
    var who = r.anonymous ? "" : HZ8.esc(r.name);
    return '<li class="hz8-rv-card" aria-label="Omdöme ' + (i + 1) + ' av ' + total + '">' +
      '<p class="hz8-rv-card__stars"><span style="--hz8-fill:' + (r.rating / 5 * 100) + '%" aria-hidden="true"></span><span class="hz8-visually-hidden">Betyg ' + r.rating + ' av 5</span></p>' +
      '<p class="hz8-rv-card__text">' + HZ8.esc(r.text.trim()) + '</p>' +
      '<div class="hz8-rv-card__foot">' +
      (who || when ? '<p class="hz8-rv-card__who">' + who + (who && when ? ' · ' : '') + (when ? '<time datetime="' + HZ8.esc(r.date.slice(0, 10)) + '">' + HZ8.esc(when) + '</time>' : '') + '</p>' : '') +
      '<p class="hz8-rv-card__about"><a href="' + HZ8.esc(HZ8.link(row.product)) + '">' + HZ8.esc(row.title) + '</a></p>' +
      '<p class="hz8-rv-card__src">Källa: hazey.se</p></div></li>';
  }

  function wireRail(rail) {
    var track = rail.querySelector(".hz8-rv-track");
    var prev = rail.querySelector("[data-hz8-rv-prev]");
    var next = rail.querySelector("[data-hz8-rv-next]");
    var pos = rail.querySelector(".hz8-rv-pos__text");
    var cards = track.querySelectorAll(".hz8-rv-card");
    function reduce() { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
    function step() { return cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : track.clientWidth; }
    function perView() { var s = step(); return Math.max(1, Math.round((track.clientWidth + s - cards[0].offsetWidth) / s)); }
    function update() {
      var first = Math.round(track.scrollLeft / step());
      var last = Math.min(cards.length, first + perView());
      pos.textContent = (last - first > 1 ? (first + 1) + "–" + last : String(first + 1)) + " av " + cards.length;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
      rail.classList.toggle("is-static", prev.disabled && next.disabled);
    }
    function go(dir) { track.scrollBy({ left: dir * step() * perView(), behavior: reduce() ? "auto" : "smooth" }); }
    prev.addEventListener("click", function () { go(-1); });
    next.addEventListener("click", function () { go(1); });
    /* Tangentbordsfokus i ett kort: hela kortet rullas in i rälsen. */
    track.addEventListener("focusin", function (e) {
      var card = e.target.closest(".hz8-rv-card");
      if (!card) return;
      var left = card.offsetLeft - track.offsetLeft;
      if (left < track.scrollLeft || left + card.offsetWidth > track.scrollLeft + track.clientWidth) {
        track.scrollTo({ left: left, behavior: reduce() ? "auto" : "smooth" });
      }
    });
    var raf = 0;
    track.addEventListener("scroll", function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  function sectionHtml() {
    return '<section class="hz8-home__section hz8-rv" aria-labelledby="hz8-rv-title">' +
      '<div class="hz8-rv__top">' +
      '<div class="hz8-rv__intro"><p class="hz8-rv__eyebrow">Kundomdömen</p>' +
      '<h2 class="hz8-rv__title" id="hz8-rv-title">Vad kunderna säger om Hazey</h2>' +
      '<p class="hz8-rv__lead">Betyget och antalet omdömen visas direkt från Trustpilot.</p></div>' +
      '<div class="hz8-rv__score">' +
      '<div class="hz8-rv__tp-box" data-locale="sv-SE" data-template-id="' + TP_TEMPLATE + '" data-businessunit-id="' + TP_UNIT + '" data-style-height="120px" data-style-width="100%" data-theme="dark">' +
      '<a class="hz8-rv__tp-fallback" href="' + TP_PROFILE + '" target="_blank" rel="noopener">Se Hazeys betyg på Trustpilot' + EXT + NEW_TAB + '</a></div>' +
      '<p class="hz8-rv__links"><a href="' + TP_PROFILE + '" target="_blank" rel="noopener">Läs alla på Trustpilot' + EXT + NEW_TAB + '</a>' +
      '<a href="' + TP_WRITE + '" target="_blank" rel="noopener">Skriv ett omdöme' + EXT + NEW_TAB + '</a></p></div>' +
      '</div>' +
      '<div class="hz8-rv__rail" data-state="loading">' +
      '<div class="hz8-rv__rail-head"><div class="hz8-rv__rail-intro"><h3 class="hz8-rv__rail-title">Produktomdömen från hazey.se</h3>' +
      '<p class="hz8-rv__rail-src">Lämnade på våra produktsidor – inte på Trustpilot.</p></div>' +
      '<div class="hz8-rv__ctrl"><button type="button" class="hz8-rv__btn" data-hz8-rv-prev aria-label="Föregående omdömen">' + PREV + '</button>' +
      '<p class="hz8-rv-pos"><span class="hz8-rv-pos__text" aria-live="polite"></span></p>' +
      '<button type="button" class="hz8-rv__btn" data-hz8-rv-next aria-label="Nästa omdömen">' + NEXT + '</button></div></div>' +
      '<ul class="hz8-rv-track" aria-label="Produktomdömen från hazey.se">' +
      '<li class="hz8-rv-card is-skeleton" aria-hidden="true"></li><li class="hz8-rv-card is-skeleton" aria-hidden="true"></li><li class="hz8-rv-card is-skeleton" aria-hidden="true"></li><li class="hz8-rv-card is-skeleton" aria-hidden="true"></li>' +
      '</ul></div></section>';
  }

  HZ8.register("homepage-reviews", function (context) {
    if (!context.home) return;
    var holder = document.createElement("div");
    holder.innerHTML = sectionHtml();
    var section = holder.firstChild;
    context.home.appendChild(section);

    var started = false;
    function start() {
      if (started) return;
      started = true;
      /* Miljöbilden (55-reviews.css) laddas först när sektionen närmar sig. */
      section.classList.add("is-lit");
      mountTrustbox(section.querySelector(".hz8-rv__tp-box"));
      var rail = section.querySelector(".hz8-rv__rail");
      approved().then(function (rows) {
        if (!rows.length) { rail.remove(); return; }
        rail.querySelector(".hz8-rv-track").innerHTML = rows.map(function (row, i) { return cardHtml(row, i, rows.length); }).join("");
        rail.setAttribute("data-state", "ready");
        wireRail(rail);
      });
    }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); start(); }
      }, { rootMargin: "1600px 0px" });
      io.observe(section);
    } else start();
  });
})();
