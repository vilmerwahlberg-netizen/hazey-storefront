
    /* ── Hero rotating message carousel (Tershine-style) ──
       Title + subtext cycle every 5s; buttons + background stay static.
       Messages live in a hidden <ul class="nh-hero__messages"> in the block
       (no <script> needed there — those get stripped). */
    function initHeroRotator() {
      var root = document.getElementById("nh-hero-root");
      if (!root || root.__nhHero) return;
      var rotor = root.querySelector(".nh-hero__rotor");
      var titleEl = root.querySelector(".nh-hero__title");
      var subEl = root.querySelector(".nh-hero__sub");
      var lis = root.querySelectorAll(".nh-hero__messages li");
      if (!rotor || !titleEl || !subEl || !lis.length) return;
      root.__nhHero = true;

      var data = Array.prototype.map.call(lis, function (li) {
        return { title: li.getAttribute("data-title") || "", sub: li.getAttribute("data-sub") || "" };
      });
      var i = 0;
      function paint(n) { titleEl.innerHTML = data[n].title; subEl.innerHTML = data[n].sub; }
      paint(0);
      if (data.length < 2) return;

      setInterval(function () {
        rotor.classList.add("is-fading");
        setTimeout(function () {
          i = (i + 1) % data.length;
          paint(i);
          rotor.classList.remove("is-fading");
        }, 500);
      }, 5000);
    }
