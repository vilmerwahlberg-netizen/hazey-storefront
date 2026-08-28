
    /* ── Header headroom — hide on scroll down, show on scroll up ──
       #store-header is position:fixed, so we just slide it out with a
       transform (CSS handles the 0.3s transition). Shows again near the
       top or as soon as the user scrolls up. */
    function initHeaderScroll() {
      var header = document.getElementById("store-header");
      if (!header || header.__nhScroll) return;
      header.__nhScroll = true;

      var last = window.pageYOffset || document.documentElement.scrollTop || 0;
      var ticking = false;

      function update() {
        var y = window.pageYOffset || document.documentElement.scrollTop || 0;
        var delta = y - last;
        if (y < 90) {
          header.classList.remove("nh-header-hidden");
        } else if (delta > 6) {
          header.classList.add("nh-header-hidden");
        } else if (delta < -6) {
          header.classList.remove("nh-header-hidden");
        }
        last = y;
        ticking = false;
      }

      window.addEventListener("scroll", function () {
        if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
      }, { passive: true });
    }
