(function () {
  "use strict";

  window.HZ8.register("homepage-hero", function (context) {
    var nativeHero = context.nativeHero;
    if (!nativeHero || document.querySelector("[data-hz8-hero]")) return;

    /* Trustpilot: länken återanvänds från adminens egen TrustBox-widget
       om den finns i DOM:en. Widgeten är en iframe -- betyget går inte
       att läsa, så raden visar inget tal eller omdöme ("Utmärkt"),
       bara en neutral text. Stjärnorna är dekorativa. */
    var tpLink = document.querySelector(".trustpilot-widget a[href*='trustpilot.com']");
    var tpHref = tpLink ? tpLink.href : "https://se.trustpilot.com/review/hazey.se";
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
      + '    <a class="hz8-hero__trust" href="' + tpHref + '" target="_blank" rel="noopener"><span class="hz8-hero__stars" aria-hidden="true">★★★★★</span><span>Omdömen på Trustpilot</span><span class="hz8-visually-hidden"> (öppnas i ny flik)</span></a>'
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

    var nativeRoot = nativeHero.closest(".template-components__slideshow") || nativeHero;
    nativeRoot.parentNode.insertBefore(section, nativeRoot);
    nativeRoot.classList.add("hz8-native-hero-hidden");
    nativeRoot.setAttribute("aria-hidden", "true");

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () { section.classList.add("is-entering"); });
    });
  });
})();
