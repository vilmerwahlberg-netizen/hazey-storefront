(function () {
  "use strict";

  window.HZ8.register("homepage-motion", function (context) {
    if (!context.home) return;

    /* Bästsäljare: kort intoning när sektionen syns (tidigare en fast
       väntan på 2,3 s, som gömde produkterna i flera sekunder). */
    if (context.bestsellers) {
      var bs = context.bestsellers;
      if ("IntersectionObserver" in window) {
        var bsObs = new IntersectionObserver(function (entries) {
          if (!entries.some(function (e) { return e.isIntersecting; })) return;
          bs.classList.add("is-sequenced");
          bsObs.disconnect();
        }, { rootMargin: "0px 0px -6% 0px" });
        bsObs.observe(bs);
      } else {
        bs.classList.add("is-sequenced");
      }
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
