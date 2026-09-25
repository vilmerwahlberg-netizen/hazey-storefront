(function () {
  "use strict";

  window.HZ8.register("homepage-hero", function (context) {
    var nativeHero = context.nativeHero;
    if (!nativeHero || document.querySelector("[data-hz8-hero]")) return;

    var section = document.createElement("section");
    section.className = "hz8-hero";
    section.setAttribute("data-hz8-hero", "1");
    section.setAttribute("aria-labelledby", "hz8-hero-title");
    section.innerHTML = ''
      + '<div class="hz8-hero__background" aria-hidden="true"></div>'
      + '<div class="hz8-hero__van-photo" aria-hidden="true"></div>'
      + '<div class="hz8-hero__inner">'
      + '  <div class="hz8-hero__copy">'
      + '    <h1 id="hz8-hero-title"><span class="hz8-hero__title-line" data-line="1">Sveriges bredaste</span><br><span class="hz8-hero__title-line" data-line="2">sortiment.</span></h1>'
      + '    <p class="hz8-hero__lede">Ett brett utbud av lagliga cannabinoider för ett skönare liv. Inspirerad av naturen. Formad av frihet.</p>'
      + '    <div class="hz8-hero__trust"><span class="hz8-hero__stars" aria-hidden="true">★★★★★</span><span>4,7/5 på Trustpilot</span></div>'
      + '    <div class="hz8-hero__actions">'
      + '      <a class="hz8-hero__primary" href="/sv/categories/thcb">Handla THCA-B&nbsp; →</a>'
      + '      <a class="hz8-hero__secondary" href="/sv/categories/magic-sauce">Upptäck Magic Sauce</a>'
      + '    </div>'
      + '    <a class="hz8-hero__more" href="/sv/categories/alla-produkter">Populära serier</a>'
      + '    <div class="hz8-hero__microtrust">'
      + '      <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="1" y="7" width="14" height="10" rx="1"/><path d="M15 10h4l3 3v4h-7z"/></svg>Snabb leverans</span>'
      + '      <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2 3 7v6c0 5 4 8 9 9 5-1 9-4 9-9V7z"/></svg>Diskret förpackning</span>'
      + '      <span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 12l5 5L20 6"/></svg>Leveransgaranti</span>'
      + '    </div>'
      + '  </div>'
      + '</div>';
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
