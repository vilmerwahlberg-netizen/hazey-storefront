/* "Guider & aktuellt" + nyhetsbrev (2026-10-08). Startsidan, efter FAQ och
   före footern. Referens: theme8/review/guides-newsletter-concepts-2026-10/.

   ÄRLIGT LÄGE (kontrollerat 2026-10-08, read-only):
   - Guidesidorna /sv/page/{vad-ar-thcab, vapes-carts-eller-buds,
     sa-arbetar-vi-med-analyser} ger 404, och ingen guideöversikt finns
     (/sv/posts är en tom blogg). Korten märks data-hz8-pending-info-route.
     I Theme 8-previewn visas de som designfacit; utanför previewn visas
     bara kort vars sida svarar som en riktig sida, och hela kapitlet
     döljs om ingen gör det. "Visa alla guider" visas bara när GUIDES_INDEX
     är satt till en verifierad översikt.
   - Nyhetsbrev: Nyehandels nyhetsbrevskomponent är inte aktiverad för
     Theme 8, samtycket är inte verifierat (kassans ruta är förkryssad,
     ADMIN-TODO 8) och ingen rabattkod eller verifierade 10 %-villkor
     finns. NEWSLETTER nedan är därför avstängd: signupen visas bara i
     previewn, skickar ingenting och visar ett ärligt meddelande. Utanför
     previewn renderas den inte alls förrän alla fyra delar är verifierade
     och konfigurerade -- ingen designombyggnad behövs då.
   - E-post lagras, loggas eller skickas aldrig av den här koden. Endast
     UI-status (triggern stängd) sparas i sessionStorage. Ingen Article-,
     Offer- eller Discount-schema. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  var GUIDES_INDEX = null;
  var GUIDES = [
    { tag: "Guide", title: "Vad är THCaB?", text: "En tydlig genomgång av serien, innehållet och hur produkterna skiljer sig.", route: "/sv/page/vad-ar-thcab", asset: "series-thcab-v1.webp", w: 1600, h: 1067, pos: "62% 50%" },
    { tag: "Välj rätt", title: "Vapes, carts eller buds?", text: "Så hittar du formatet som passar det du söker.", route: "/sv/page/vapes-carts-eller-buds", asset: "series-magic-sauce-v1.webp", w: 1600, h: 1067, pos: "60% 58%" },
    { tag: "Trygghet", title: "Så arbetar vi med analyser", text: "Om transparens, innehåll och svensk lagstiftning.", route: "/sv/page/sa-arbetar-vi-med-analyser", asset: "checkout-stockholm.webp", w: 1600, h: 625, pos: "72% 50%" }
  ];
  /* Riktig integration: sätt endpoint + verifieringsflaggor. */
  var NEWSLETTER = { endpoint: null, consentVerified: false, offerVerified: false, termsUrl: null, privacyUrl: "/sv/page/integritetspolicy" };
  var DEV_MESSAGE = "Nyhetsbrevet och rabattkoden kopplas innan publicering. Din e-postadress har inte skickats.";
  var DISMISS_KEY = "hz8-nl-trigger-dismissed";
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';
  var CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  function previewActive() {
    try { return !!new URLSearchParams(location.search).get("preview"); } catch (e) { return false; }
  }
  function newsletterLive() {
    return !!(NEWSLETTER.endpoint && NEWSLETTER.consentVerified && NEWSLETTER.offerVerified && NEWSLETTER.termsUrl);
  }

  /* ---------- Guider ---------- */
  function cardHtml(g, i, total, assetBase) {
    var id = "hz8-guide-" + i;
    return '<li class="hz8-gd-card' + (i === 0 ? ' hz8-gd-card--lead' : '') + '" data-index="' + i + '" aria-label="Guide ' + (i + 1) + ' av ' + total + '">' +
      '<article aria-labelledby="' + id + '">' +
      '<div class="hz8-gd-card__media"><img src="' + assetBase + g.asset + '" alt="" loading="lazy" decoding="async" width="' + g.w + '" height="' + g.h + '" style="object-position:' + g.pos + '"></div>' +
      '<div class="hz8-gd-card__body">' +
      '<p class="hz8-gd-card__tag">' + HZ8.esc(g.tag) + '</p>' +
      '<h3 class="hz8-gd-card__title" id="' + id + '">' + HZ8.esc(g.title) + '</h3>' +
      '<p class="hz8-gd-card__text">' + HZ8.esc(g.text) + '</p>' +
      '<a class="hz8-gd-card__cta" href="' + HZ8.esc(HZ8.link(g.route)) + '" data-hz8-pending-info-route="' + HZ8.esc(g.route) + '" aria-label="Läs guiden: ' + HZ8.esc(g.title) + '">Läs guiden' + ARROW + '</a>' +
      '</div></article></li>';
  }

  function guidesHtml(list, assetBase) {
    return '<section class="hz8-home__section hz8-gd" aria-labelledby="hz8-gd-title">' +
      '<div class="hz8-gd__head"><div class="hz8-gd__intro">' +
      '<p class="hz8-gd__kicker">Kunskap &amp; inspiration</p>' +
      '<h2 class="hz8-gd__title" id="hz8-gd-title">Guider &amp; aktuellt</h2></div>' +
      '<p class="hz8-gd__lead">Lär dig mer om produkter, analyser och vad som gäller i Sverige.</p>' +
      (GUIDES_INDEX ? '<a class="hz8-gd__all" href="' + HZ8.esc(HZ8.link(GUIDES_INDEX)) + '">Visa alla guider' + ARROW + '</a>' : '') +
      '</div>' +
      '<ul class="hz8-gd__rail" aria-label="Guider">' + list.map(function (g, i) { return cardHtml(g, i, list.length, assetBase); }).join("") + '</ul>' +
      '<div class="hz8-gd__dots" aria-hidden="true">' + list.map(function () { return "<span></span>"; }).join("") + '</div>' +
      '<p class="hz8-visually-hidden" data-hz8-gd-status aria-live="polite"></p>' +
      '</section>';
  }

  /* Mobilräls: scroll-snap (swipe/styrplatta), piltangenter när rälsen
     har fokus, fokus rullar in hela kortet, indikatorerna följer. */
  function wireRail(section) {
    var rail = section.querySelector(".hz8-gd__rail");
    var cards = rail.querySelectorAll(".hz8-gd-card");
    var dots = section.querySelectorAll(".hz8-gd__dots span");
    var status = section.querySelector("[data-hz8-gd-status]");
    var mq = window.matchMedia("(max-width: 767px)");
    var last = -1;
    function index() {
      var best = 0, dist = Infinity;
      cards.forEach(function (c, i) { var d = Math.abs(c.offsetLeft - rail.offsetLeft - rail.scrollLeft); if (d < dist) { dist = d; best = i; } });
      return best;
    }
    function paint(announce) {
      var i = index();
      dots.forEach(function (d, k) { d.classList.toggle("is-on", k === i); });
      if (mq.matches && announce && i !== last) status.textContent = "Guide " + (i + 1) + " av " + cards.length + ": " + cards[i].querySelector("h3").textContent;
      last = i;
    }
    function go(i) {
      var c = cards[Math.max(0, Math.min(cards.length - 1, i))];
      rail.scrollTo({ left: c.offsetLeft - rail.offsetLeft, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
    if (mq.matches) rail.setAttribute("tabindex", "0");
    rail.addEventListener("keydown", function (e) {
      if (!mq.matches || e.target !== rail || (e.key !== "ArrowRight" && e.key !== "ArrowLeft")) return;
      e.preventDefault(); go(index() + (e.key === "ArrowRight" ? 1 : -1));
    });
    rail.addEventListener("focusin", function (e) {
      var card = e.target.closest(".hz8-gd-card");
      if (!card || !mq.matches) return;
      var left = card.offsetLeft - rail.offsetLeft;
      if (left < rail.scrollLeft || left + card.offsetWidth > rail.scrollLeft + rail.clientWidth) rail.scrollTo({ left: left, behavior: "auto" });
    });
    var raf = 0;
    rail.addEventListener("scroll", function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(function () { paint(true); }); }, { passive: true });
    paint(false);
  }

  function verifiedGuides() {
    return Promise.all(GUIDES.map(function (g) {
      return fetch(g.route, { credentials: "same-origin", redirect: "manual" })
        .then(function (r) { if (r.status !== 200) return null; return r.text().then(function (t) { return /hittades inte|main-container category/i.test(t) ? null : g; }); })
        .catch(function () { return null; });
    })).then(function (list) { return list.filter(Boolean); });
  }

  /* ---------- Nyhetsbrev (delad formulärfabrik) ---------- */
  var formSeq = 0;
  function formHtml(variant) {
    var n = ++formSeq;
    var id = "hz8-nl-email-" + n;
    return '<form class="hz8-nl-form hz8-nl-form--' + variant + '" novalidate>' +
      '<div class="hz8-nl-form__row">' +
      '<label class="hz8-visually-hidden" for="' + id + '">E-postadress</label>' +
      '<input class="hz8-nl-form__input" id="' + id + '" name="email" type="email" inputmode="email" autocomplete="email" required placeholder="Din e-postadress" aria-describedby="' + id + '-err ' + id + '-terms">' +
      '<button class="hz8-nl-form__submit" type="submit"><span>Ge mig 10 %</span>' + ARROW + '</button></div>' +
      '<p class="hz8-nl-form__error" id="' + id + '-err" hidden>Skriv en giltig e-postadress, till exempel namn@exempel.se.</p>' +
      '<p class="hz8-nl-form__terms" id="' + id + '-terms">Genom att registrera dig godkänner du vår <a href="' + HZ8.esc(HZ8.link(NEWSLETTER.privacyUrl)) + '">integritetspolicy</a>. ' +
      (NEWSLETTER.termsUrl ? '<a href="' + HZ8.esc(HZ8.link(NEWSLETTER.termsUrl)) + '">Villkor gäller</a>.' : 'Villkor gäller.') + '</p>' +
      '<p class="hz8-nl-form__status" role="status" aria-live="polite"></p></form>';
  }

  function submitNewsletter(email) {
    if (!newsletterLive()) return Promise.reject({ code: "not-connected" });
    return fetch(NEWSLETTER.endpoint, { method: "POST", credentials: "same-origin", headers: HZ8.apiHeaders(), body: JSON.stringify({ email: email }) })
      .then(function (r) { if (!r.ok) throw { code: "http" }; return true; })
      .catch(function (e) { throw e && e.code ? e : { code: "network" }; });
  }

  function wireForm(form, onSuccess) {
    var input = form.querySelector("input[type=email]");
    var err = form.querySelector(".hz8-nl-form__error");
    var btn = form.querySelector(".hz8-nl-form__submit");
    var label = btn.querySelector("span");
    var status = form.querySelector(".hz8-nl-form__status");
    function setErr(on) { err.hidden = !on; if (on) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid"); }
    input.addEventListener("input", function () { if (input.checkValidity()) setErr(false); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (btn.getAttribute("aria-busy") === "true") return;
      var email = input.value.trim();
      if (!email || !input.checkValidity()) { setErr(true); status.textContent = ""; status.className = "hz8-nl-form__status"; input.focus(); return; }
      setErr(false);
      btn.setAttribute("aria-busy", "true"); btn.disabled = true; label.textContent = "Skickar…";
      submitNewsletter(email).then(function () {
        status.className = "hz8-nl-form__status is-success"; status.textContent = "Tack! Kolla din inkorg.";
        input.value = "";
        if (onSuccess) onSuccess();
      }).catch(function (x) {
        status.className = "hz8-nl-form__status " + (x.code === "not-connected" ? "is-info" : "is-error");
        status.textContent = x.code === "not-connected" ? DEV_MESSAGE : "Det gick inte att registrera dig just nu. Försök igen – din e-postadress finns kvar i fältet.";
      }).then(function () {
        btn.removeAttribute("aria-busy"); btn.disabled = false; label.textContent = "Ge mig 10 %";
      });
    });
  }

  function signupHtml() {
    return '<section class="hz8-home__section hz8-nl" aria-labelledby="hz8-nl-title">' +
      '<div class="hz8-nl__offer"><p class="hz8-nl__badge" aria-hidden="true">10 %</p>' +
      '<div><h2 class="hz8-nl__title" id="hz8-nl-title">10 % på din första order</h2>' +
      '<p class="hz8-nl__text">Få produktnyheter, guider och utvalda lanseringar – utan onödigt brus.</p></div></div>' +
      formHtml("inline") + '</section>';
  }

  /* Mobil: liten sticky etikett -> tillgängligt bottom sheet. */
  function mountSticky(home) {
    var mq = window.matchMedia("(max-width: 767px)");
    var dismissed = false;
    try { dismissed = sessionStorage.getItem(DISMISS_KEY) === "1"; } catch (e) { /* privat läge */ }
    if (dismissed) return;
    var wrap = document.createElement("div");
    wrap.className = "hz8-nl-sticky";
    wrap.innerHTML =
      '<div class="hz8-nl-tab" hidden>' +
      '<button type="button" class="hz8-nl-tab__open" aria-haspopup="dialog" aria-controls="hz8-nl-sheet">Få 10 % på första ordern' + ARROW + '</button>' +
      '<button type="button" class="hz8-nl-tab__close" aria-label="Stäng erbjudandet">' + CLOSE + '</button></div>' +
      '<div class="hz8-nl-sheet" id="hz8-nl-sheet" role="dialog" aria-modal="true" aria-labelledby="hz8-nl-sheet-title" hidden>' +
      '<div class="hz8-nl-sheet__backdrop" data-hz8-nl-close></div>' +
      '<div class="hz8-nl-sheet__panel">' +
      '<button type="button" class="hz8-nl-sheet__close" data-hz8-nl-close aria-label="Stäng">' + CLOSE + '</button>' +
      '<p class="hz8-nl__badge hz8-nl__badge--sheet" aria-hidden="true">10 %</p>' +
      '<h2 class="hz8-nl__title" id="hz8-nl-sheet-title">10 % på din första order</h2>' +
      '<p class="hz8-nl__text">Få produktnyheter, guider och utvalda lanseringar – utan onödigt brus.</p>' +
      formHtml("sheet") + '</div></div>';
    document.body.appendChild(wrap);
    var tab = wrap.querySelector(".hz8-nl-tab");
    var openBtn = wrap.querySelector(".hz8-nl-tab__open");
    var sheet = wrap.querySelector(".hz8-nl-sheet");
    var release = null;
    var state = { pastHero: false, footer: false, open: false, done: false, gone: false };

    function blocked() {
      return document.documentElement.classList.contains("hz8-scroll-locked") && !state.open ||
        document.body.classList.contains("hz8-scroll-locked") ||
        !!document.querySelector("#cart-side-wrap.is-active");
    }
    function sync() {
      var show = mq.matches && state.pastHero && !state.footer && !state.open && !state.done && !state.gone && !blocked();
      tab.hidden = !show;
    }
    function open() {
      state.open = true; sheet.hidden = false; sync();
      HZ8.lockScroll();
      window.requestAnimationFrame(function () { sheet.classList.add("is-open"); });
      release = HZ8.trapFocus(sheet, close);
      var input = sheet.querySelector("input"); if (input) input.focus({ preventScroll: true });
    }
    function close() {
      if (!state.open) return;
      state.open = false; sheet.classList.remove("is-open"); sheet.hidden = true;
      HZ8.unlockScroll();
      if (release) release(); release = null;
      sync();
      if (!tab.hidden) openBtn.focus({ preventScroll: true });
    }
    openBtn.addEventListener("click", open);
    wrap.querySelector(".hz8-nl-tab__close").addEventListener("click", function () {
      state.gone = true; sync();
      try { sessionStorage.setItem(DISMISS_KEY, "1"); } catch (e) { /* privat läge */ }
    });
    sheet.querySelectorAll("[data-hz8-nl-close]").forEach(function (b) { b.addEventListener("click", close); });
    wireForm(sheet.querySelector("form"), function () { state.done = true; window.setTimeout(close, 1600); });

    var hero = document.querySelector(".hz8-hero") || document.querySelector("[data-hz8-hero]");
    var footer = home.querySelector(".hz8-footer");
    if ("IntersectionObserver" in window) {
      if (hero) new IntersectionObserver(function (en) { state.pastHero = !en[0].isIntersecting && en[0].boundingClientRect.top < 0; sync(); }).observe(hero);
      else state.pastHero = true;
      if (footer) new IntersectionObserver(function (en) { state.footer = en[0].isIntersecting; sync(); }).observe(footer);
    }
    /* Meny/varukorg: reagera på klassändringar, ingen polling. */
    var mo = new MutationObserver(sync);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    mo.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    var cart = document.getElementById("cart-side-wrap");
    if (cart) mo.observe(cart, { attributes: true, attributeFilter: ["class"] });
    if (mq.addEventListener) mq.addEventListener("change", function () { if (!mq.matches) close(); sync(); });
  }

  HZ8.register("homepage-guides-newsletter", function (context) {
    if (!context.home) return;
    var home = context.home;
    var footer = home.querySelector(".hz8-footer");
    var preview = previewActive();
    function insert(html) {
      var holder = document.createElement("div");
      holder.innerHTML = html;
      var el = holder.firstChild;
      if (footer) home.insertBefore(el, footer); else home.appendChild(el);
      return el;
    }
    function mountGuides(list) {
      if (!list.length) return;
      var section = insert(guidesHtml(list, context.assetBase));
      if (!preview) section.querySelectorAll("[data-hz8-pending-info-route]").forEach(function (a) { a.removeAttribute("data-hz8-pending-info-route"); });
      wireRail(section);
    }
    if (preview) mountGuides(GUIDES);
    else verifiedGuides().then(function (list) { mountGuides(list); if (signupShown) { var nl = home.querySelector(".hz8-nl"); if (nl && footer) home.insertBefore(nl, footer); } });

    var signupShown = preview || newsletterLive();
    if (!signupShown) return;
    var nl = insert(signupHtml());
    wireForm(nl.querySelector("form"));
    /* Kustbilden bakom signupen laddas först när den närmar sig (desktop). */
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting && window.matchMedia("(min-width: 768px)").matches) { io.disconnect(); nl.classList.add("is-lit"); } }, { rootMargin: "600px 0px" });
      io.observe(nl);
    }
    mountSticky(home);
  });
})();
