
    /* ── Filterable product tabs (Govee-style) ──
       A [data-nh-tabs] bar of .nh-tab buttons swaps the sibling
       [data-nh-tabgrid] without a page reload and updates the
       [data-nh-tabcta] ("TILL BUTIKEN") link to the active category.
       data-cat = category slug, or "__news" (Nyhet-badge) / "__sale" (rea).
       All fetches use ?sort=in-stock so sold-out products sink. */
    function initTabs() {
      var bars = document.querySelectorAll("[data-nh-tabs]");
      Array.prototype.forEach.call(bars, function (bar) {
        if (bar.__nhTabs) return;
        var wrap = bar.closest(".pl-list") || bar.parentNode;
        var grid = wrap.querySelector("[data-nh-tabgrid]");
        if (!grid) return;
        bar.__nhTabs = true;
        var cta = wrap.querySelector("[data-nh-tabcta]");
        var limit = parseInt(grid.getAttribute("data-nh-limit") || "8", 10);
        var token = 0;

        function isDiscounted(c) {
          return !!(c.querySelector(".price.has-comparison del") || c.querySelector(".price del") || c.querySelector(".ribbon.sale"));
        }
        function isNews(c) { return !!c.querySelector(".ribbon.news"); }
        function mountCard(card) {
          card.querySelectorAll("img").forEach(function (img) {
            var ds = img.getAttribute("data-src") || img.getAttribute("data-original");
            if (ds && (!img.getAttribute("src") || /no-image|placeholder|data:/.test(img.getAttribute("src") || ""))) { img.setAttribute("src", ds); }
            img.removeAttribute("loading"); img.classList.remove("lazy");
          });
          var o = document.createElement("div"), i = document.createElement("div");
          i.appendChild(card); o.appendChild(i); return o;
        }
        function skeletons(n) {
          var s = ""; for (var i = 0; i < n; i++) { s += '<div><div><div class="nh-skel"><div class="nh-skel__img"></div><div class="nh-skel__line"></div><div class="nh-skel__line short"></div></div></div></div>'; }
          return s;
        }
        function scrape(url) {
          return fetch(url, { credentials: nhSO })
            .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
            .then(function (html) {
              var doc = new DOMParser().parseFromString(html, "text/html");
              return Array.prototype.slice.call(doc.querySelectorAll("#category-products .product-card, .pl-list .product-card, .product-card"));
            });
        }
        function getCards(cat) {
          if (cat === "__news" || cat === "__sale") {
            var test = cat === "__news" ? isNews : isDiscounted;
            return scrape("/sv/categories/alla-produkter?sort=in-stock").then(function (c1) {
              var got = c1.filter(test);
              if (got.length >= limit) return got;
              return scrape("/sv/categories/alla-produkter?sort=in-stock&page=2")
                .then(function (c2) { return got.concat(c2.filter(test)); })
                .catch(function () { return got; });
            });
          }
          return scrape("/sv/categories/" + cat + "?sort=in-stock");
        }
        function ctaHref(cat) {
          return (cat === "__news" || cat === "__sale") ? "/sv/categories/alla-produkter" : "/sv/categories/" + cat;
        }
        function load(tab) {
          var cat = tab.getAttribute("data-cat");
          var myToken = ++token;
          grid.innerHTML = skeletons(limit < 8 ? limit : 8);
          if (cta) cta.setAttribute("href", ctaHref(cat));
          getCards(cat).then(function (cards) {
            if (myToken !== token) return;
            grid.innerHTML = "";
            if (!cards.length) { grid.innerHTML = '<div class="nh-pl-empty">Inga produkter just nu.</div>'; return; }
            cards.slice(0, limit).forEach(function (c) { grid.appendChild(mountCard(c.cloneNode(true))); });
            if (window.nhInitCards) window.nhInitCards();
          }).catch(function () {
            if (myToken !== token) return;
            grid.innerHTML = '<div class="nh-pl-empty">Kunde inte ladda produkter.</div>';
          });
        }

        bar.addEventListener("click", function (e) {
          var tab = e.target.closest(".nh-tab");
          if (!tab || !bar.contains(tab) || tab.classList.contains("is-active")) return;
          Array.prototype.forEach.call(bar.querySelectorAll(".nh-tab"), function (t) { t.classList.remove("is-active"); });
          tab.classList.add("is-active");
          load(tab);
        });
        var active = bar.querySelector(".nh-tab.is-active") || bar.querySelector(".nh-tab");
        if (active) { active.classList.add("is-active"); load(active); }
      });
    }
