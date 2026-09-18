(function () {
  "use strict";

  window.HZ8.register("homepage-motion", function (context) {
    if (!context.home) return;

    if (context.bestsellers) {
      window.setTimeout(function () { context.bestsellers.classList.add("is-sequenced"); }, 2300);
    }

    var targets = context.home.querySelectorAll(".hz8-reveal, .hz8-reveal-group");
    if (!("IntersectionObserver" in window)) {
      for (var i = 0; i < targets.length; i += 1) targets[i].classList.add("is-visible");
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });

    for (var j = 0; j < targets.length; j += 1) observer.observe(targets[j]);
  });
})();
