(function () {
  "use strict";

  /* Startar den officiella TrustBoxen bara på mobil (raden är dold från
     768 px). Trustpilots bootstrap laddas av Head-fältet; finns den inte
     läggs samma officiella skript till. Laddar den aldrig syns fallback-
     länken "Omdömen på Trustpilot" utan betyg. */
  function mountTrustbox(widget) {
    if (!widget || !window.matchMedia) return;
    var mq = window.matchMedia("(max-width: 767px)");
    var started = false;
    function start() {
      if (started || !mq.matches) return;
      started = true;
      /* Klassen sätts först här: Trustpilots bootstrap laddar annars alla
         .trustpilot-widget automatiskt, även den dolda raden på desktop. */
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
        } else if (tries++ < 40) {
          window.setTimeout(load, 250);
        }
      })();
    }
    start();
    if (!started && mq.addEventListener) mq.addEventListener("change", start);
  }

  window.HZ8.register("homepage-hero", function (context) {
    var nativeHero = context.nativeHero;
    if (!nativeHero || document.querySelector("[data-hz8-hero]")) return;

    /* Trustpilot: länk och business unit återanvänds från adminens egen,
       officiella TrustBox i DOM:en. Desktopraden är en neutral länk (inget
       betyg); mobilen visar en officiell Micro TrustScore-widget som hämtar
       Hazeys aktuella betyg direkt från Trustpilot -- inget värde i koden. */
    var tpNative = document.querySelector(".trustpilot-widget[data-businessunit-id]");
    var tpLink = document.querySelector(".trustpilot-widget a[href*='trustpilot.com']");
    var tpHref = tpLink ? tpLink.href : "https://se.trustpilot.com/review/hazey.se";
    var tpUnit = tpNative ? tpNative.getAttribute("data-businessunit-id") : "6479dc28f0b041b3c79af588";
    var arrow = '<svg class="hz8-hero__cta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';

    var section = document.createElement("section");
    section.className = "hz8-hero";
    section.setAttribute("data-hz8-hero", "1");
    section.setAttribute("aria-labelledby", "hz8-hero-title");
    section.innerHTML = ''
      + '<div class="hz8-hero__background" aria-hidden="true"></div>'
      + '<div class="hz8-hero__van-photo" aria-hidden="true"></div>'
      + '<div class="hz8-hero__inner">'
      + '  <div class="hz8-hero__copy">'
      /* Två radblock utan <br>: mobil bryter "Sveriges #1 för / lagliga /
         cannabinoider" (B5), desktop "Sveriges #1 för / lagliga
         cannabinoider" -- styrs av H1:ns maxbredd i 10-hero.css. */
      + '    <h1 id="hz8-hero-title"><span class="hz8-hero__title-line" data-line="1">Sveriges #1 för</span> <span class="hz8-hero__title-line" data-line="2">lagliga cannabinoider</span></h1>'
      + '    <p class="hz8-hero__lede">Noggrant testade och lagliga i Sverige – vi följer lagstiftningen löpande. <span class="hz8-hero__lede-end">Din trygghet först.</span></p>'
      + '    <a class="hz8-hero__trust" href="' + tpHref + '" target="_blank" rel="noopener"><svg class="hz8-hero__star" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2.6l2.8 6.1 6.7.7-5 4.5 1.4 6.6L12 17.1l-5.9 3.4 1.4-6.6-5-4.5 6.7-.7z"/></svg><span>Omdömen på Trustpilot</span><span class="hz8-visually-hidden"> (öppnas i ny flik)</span></a>'
      + '    <div class="hz8-hero__tp">'
      + '      <div class="hz8-hero__tp-widget" data-locale="sv-SE" data-template-id="5419b637fa0340045cd0c936" data-businessunit-id="' + tpUnit + '" data-style-height="24px" data-style-width="100%" data-theme="dark"><a href="' + tpHref + '" target="_blank" rel="noopener">Omdömen på Trustpilot<span class="hz8-visually-hidden"> (öppnas i ny flik)</span></a></div>'
      + '      <a class="hz8-hero__tp-hit" href="' + tpHref + '" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true"></a>'
      + '    </div>'
      + '    <div class="hz8-hero__actions">'
      + '      <a class="hz8-hero__primary" href="/sv/categories/thcb"><span>Handla THCA-B</span>' + arrow + '</a>'
      + '      <a class="hz8-hero__secondary" href="/sv/categories/magic-sauce"><span>Upptäck Magic Sauce</span>' + arrow + '</a>'
      + '    </div>'
      + '    <a class="hz8-hero__more" href="/sv/categories/alla-produkter">Populära serier</a>'
      + '    <div class="hz8-hero__microtrust">'
      + '      <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="1" y="7" width="14" height="10" rx="1"/><path d="M15 10h4l3 3v4h-7z"/></svg>' + (window.HZ8 && HZ8.commerce && HZ8.commerce.goalsEnabled() ? "Fri frakt från " + HZ8.commerce.rules.freeShippingFrom + " kr" : "Skickas från Sverige") + '</span>'
      + '      <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7z"/></svg>Diskret förpackning</span>'
      + '      <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 12l5 5L20 6"/></svg>Spårbar leverans</span>'
      + '    </div>'
      + '  </div>'
      + '</div>'
      /* Mobilens trusthylla (B5) i övergången hero -> Bästsäljare. Bara
         verifierade budskap (footer/FAQ/produkt-USP), ingen fri frakt --
         fraktsättet i admin matchar inte gränsen än (ADMIN-TODO 1-3).
         Desktop visar i stället .hz8-hero__microtrust ovan. */
      + '<ul class="hz8-hero__shelf" aria-label="Trygg handel">'
      + '  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.5 3.5 7v10l8.5 4.5 8.5-4.5V7z"/><path d="M3.5 7 12 11.5 20.5 7M12 11.5v10"/></svg><span aria-hidden="true">Svenskt lager</span><span class="hz8-visually-hidden">Skickas från Sverige</span></li>'
      + '  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.5 4 5.5v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10v-6z"/></svg><span aria-hidden="true">Diskret paket</span><span class="hz8-visually-hidden">Diskret förpackning</span></li>'
      + '  <li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="m3 6.5 9 6.5 9-6.5"/></svg><span aria-hidden="true">Spårbart</span><span class="hz8-visually-hidden">Spårningsnummer via e-post</span></li>'
      + '</ul>';
    /* Mobil hade tidigare en separat urklippt bussbild (.hz8-hero__van)
       inklistrad OVANPÅ en flat strandbild -- bytt (2026-09-25) mot ett
       enda riktigt beskuret fotoutsnitt av samma äkta desktop-scen som
       redan visas på >=768px (se .hz8-hero__background i mobil-media-
       queryn i 10-hero.css), där bussen redan står naturligt på vägen i
       bilden själv. Elementet och dess <picture>-hämtning är alltså
       helt borttagna -- inget att dölja med CSS, inget att ladda. */

    mountTrustbox(section.querySelector(".hz8-hero__tp-widget"));

    var nativeRoot = nativeHero.closest(".template-components__slideshow") || nativeHero;
    nativeRoot.parentNode.insertBefore(section, nativeRoot);
    nativeRoot.classList.add("hz8-native-hero-hidden");
    nativeRoot.setAttribute("aria-hidden", "true");

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () { section.classList.add("is-entering"); });
    });
  });
})();
