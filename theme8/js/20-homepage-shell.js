(function () {
  "use strict";

  window.HZ8.register("homepage-shell", function (context) {
    if (document.querySelector("[data-hz8-home]")) return;

    var nativeHero = context.nativeHero;
    var nativeRoot = nativeHero && (nativeHero.closest(".template-components__slideshow") || nativeHero);
    if (!nativeRoot || !nativeRoot.parentNode) return;

    var root = document.createElement("div");
    root.className = "hz8-home";
    root.setAttribute("data-hz8-home", "1");
    nativeRoot.parentNode.insertBefore(root, nativeRoot);
    context.home = root;

    var sibling = nativeRoot;
    while (sibling) {
      if (sibling.nodeType === 1) sibling.classList.add("hz8-native-content-hidden");
      sibling = sibling.nextElementSibling;
    }

    /* Dolt native-innehåll (t.ex. textredigerarens "THCA med flera"-rubrik)
       får inte bära ett andra <h1> -- herons #hz8-hero-title är sidans enda.
       Rubriken byts mot ett neutralt <p> med samma text och attribut (ingen
       Theme 8-modul läser den som h1; kontrollerat 2026-10-08). Körs efter
       att övriga moduler initierats och igen om Nyehandel ritar om. Utan
       Theme 8 körs inget av detta och native-rubriken är orörd. */
    function demoteHiddenH1() {
      document.querySelectorAll(".hz8-native-content-hidden h1").forEach(function (h) {
        if (h.id === "hz8-hero-title" || h.closest("[data-hz8-home]")) return;
        var p = document.createElement("p");
        Array.prototype.forEach.call(h.attributes, function (a) { p.setAttribute(a.name, a.value); });
        p.setAttribute("data-hz8-demoted-h1", "");
        while (h.firstChild) p.appendChild(h.firstChild);
        h.parentNode.replaceChild(p, h);
      });
    }
    window.setTimeout(function () { demoteHiddenH1(); if (window.HZ8.watch) window.HZ8.watch(demoteHiddenH1); }, 0);

    var footers = document.querySelectorAll("body > footer, .store-footer, footer");
    for (var i = 0; i < footers.length; i += 1) {
      if (!footers[i].closest("[data-hz8-home]")) footers[i].classList.add("hz8-native-footer-hidden");
    }
  });
})();
