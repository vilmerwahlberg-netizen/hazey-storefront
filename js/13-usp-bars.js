
    /* Remove emojis from trust/USP bars across all pages (doc v3.1: emojis
       look unprofessional and glitch on Android). Clean text stays; CSS adds
       a consistent green checkmark. Covers the butik-grid band, the reusable
       USP bar and any [data-nh-usp] placeholder. */
    function stripUspEmojis() {
      var EMOJI = /[\u{1F000}-\u{1FAFF}\u{1F1E6}-\u{1F1FF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu;
      document
        .querySelectorAll(
          ".nh-cat-grid__usp span, .nh-usp__inner span, [data-nh-usp] span",
        )
        .forEach(function (el) {
          if (el.__nhNoEmoji) return;
          el.__nhNoEmoji = true;
          var cleaned = el.textContent
            .replace(EMOJI, "")
            .replace(/\s{2,}/g, " ")
            .trim();
          if (cleaned !== el.textContent) el.textContent = cleaned;
        });
    }

    /* ── Reusable trust / USP bar ──
       Turns any <div data-nh-usp></div> into a styled trust bar. Text lives
       here (one place → updates everywhere). Custom per-bar items: put your
       own <span>…</span> inside the placeholder and they're kept. */
    function initUspBars() {
      var DEFAULT = [
        "Fri frakt från 499 kr",
        "Skickas från Sverige",
        "Alltid diskreta paket",
      ];
      document.querySelectorAll("[data-nh-usp]").forEach(function (el) {
        if (el.__nhUsp) return;
        el.__nhUsp = true;
        var existing = el.querySelectorAll("span");
        var items = existing.length
          ? Array.prototype.map.call(existing, function (s) { return s.innerHTML; })
          : DEFAULT;
        el.classList.add("nh-usp");
        el.innerHTML =
          '<div class="nh-usp__inner">' +
          items.map(function (t) { return "<span>" + t + "</span>"; }).join("") +
          "</div>";
      });
      stripUspEmojis();
    }
