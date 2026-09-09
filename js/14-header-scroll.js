
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
        // KORRIGERAT (Korrigeringsrunda 2026-09-09 -- headerns scrollbugg):
        // startsidans transparenta glasheader (.nh-home-hero, se
        // nhInitHomeHeroHeader i js/18b-homepage-v2.js) hade TVÅ oberoende
        // scrollhandlers som konkurrerade om samma headers visuella
        // tillstånd -- den här (döljer headern helt vid y>90, ett mönster
        // som är rätt för ANDRA sidtyper med en solid/opak header som
        // annars permanent tar skärmyta) och nhInitHomeHeroHeader:s egen
        // (växlar bara .nh-home-hero--scrolled vid y>40 för färg/blur).
        // Nettoresultatet: headern bytte färg vid 40px, försvann sedan
        // HELT vid 90px tills man scrollade upp igen -- exakt "trasig
        // efter en liten scroll". Konsoliderat genom att låta DEN HÄR
        // funktionen kontrollera .nh-home-hero-headers vid VARJE
        // scrollsteg (inte bara vid init -- klassen kan läggas till efter
        // att denna redan startat) och aldrig röra den: en alltid-synlig
        // glasheader ska aldrig döljas, bara nhInitHomeHeroHeaders egen
        // logik äger dess visuella tillstånd. Andra sidtypers header
        // (utan .nh-home-hero) fungerar exakt som förut, oförändrat.
        if (header.classList.contains("nh-home-hero")) { ticking = false; return; }
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
