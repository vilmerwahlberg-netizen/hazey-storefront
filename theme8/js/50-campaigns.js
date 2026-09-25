(function () {
  "use strict";

  window.HZ8.register("homepage-campaigns", function (context) {
    if (!context.home) return;
    var section = document.createElement("section");
    section.className = "hz8-home__section hz8-campaigns hz8-reveal-group";
    section.innerHTML = ''
      + '<svg width="0" height="0" aria-hidden="true"><defs><clipPath id="hz8-campaign-tl" clipPathUnits="objectBoundingBox"><path d="M.012 0H.988Q1 0 1 .04V.77Q1 .81 .96 .81H.59C.57 .81 .56 .84 .56 .87V.93C.56 .97 .54 1 .52 1H.012Q0 1 0 .96V.04Q0 0 .012 0Z"/></clipPath><clipPath id="hz8-campaign-bl" clipPathUnits="objectBoundingBox"><path d="M.012 .314H.54C.56 .314 .58 .28 .58 .24V.18C.58 .14 .6 .122 .62 .122H.988Q1 .122 1 .162V.96Q1 1 .988 1H.012Q0 1 0 .96V.354Q0 .314 .012 .314Z"/></clipPath></defs></svg>'
      + campaign("thcab", "THCaB", "Kraftfullt. Rent.<br>Äkta.", "Utforska THCaB", "/sv/categories/thcb", "campaign-thcab.jpg", context.assetBase)
      + campaign("thca", "THCa", "Premium flower<br>för livsnjutare.", "Shoppa THCa", "/sv/categories/thca", "campaign-thca.jpg", context.assetBase)
      + campaign("magic", "Magic Sauce", "Smak. Effekt. Balans.", "Upptäck Magic Sauce", "/sv/categories/magic-sauce", "campaign-magic.webp", context.assetBase)
      + campaign("nano", "Nano-11", "Nästa generation<br>välbefinnande.", "Utforska Nano-11", "/sv/categories/alla-produkter", "campaign-nano.jpg", context.assetBase);
    context.home.appendChild(section);
  });

  function campaign(kind, title, text, cta, href, asset, assetBase) {
    return '<a class="hz8-campaign hz8-campaign--' + kind + '" href="' + href + '"><img src="' + assetBase + asset + '" alt=""><span class="hz8-campaign__copy"><strong>' + title + '</strong><span>' + text + '</span></span><span class="hz8-campaign__cta">' + cta + '</span></a>';
  }
})();
