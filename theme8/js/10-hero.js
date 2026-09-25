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
      /* .hz8-hero__van is display:none on >=768px (desktop uses the
         separate .hz8-hero__van-photo background layer instead, see
         10-hero.css) -- but a <picture>'s fallback <img src> is still
         eagerly fetched by the browser regardless of that CSS, since
         source selection happens at parse time before layout/CSS is
         even considered. Verified live: the 1MB desktop van PNG was
         downloading on every desktop pageview despite never being
         shown. Fix: the fallback img now points at a 1x1 transparent
         GIF data URI (zero network bytes) instead of a real desktop
         image -- the mobile <source> continues to take over exactly
         as before whenever its own media query actually matches, so
         mobile is completely unaffected. */
      + '  <picture class="hz8-hero__van" aria-hidden="true">'
      + '    <source media="(max-width: 767px)" srcset="' + context.assetBase + 'hero-van-mobile-v2.webp">'
      + '    <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt="">'
      + '  </picture>'
      + '</div>';

    var nativeRoot = nativeHero.closest(".template-components__slideshow") || nativeHero;
    nativeRoot.parentNode.insertBefore(section, nativeRoot);
    nativeRoot.classList.add("hz8-native-hero-hidden");
    nativeRoot.setAttribute("aria-hidden", "true");

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () { section.classList.add("is-entering"); });
    });
  });
})();
