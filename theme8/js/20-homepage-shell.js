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

    var footers = document.querySelectorAll("body > footer, .store-footer, footer");
    for (var i = 0; i < footers.length; i += 1) {
      if (!footers[i].closest("[data-hz8-home]")) footers[i].classList.add("hz8-native-footer-hidden");
    }
  });
})();
