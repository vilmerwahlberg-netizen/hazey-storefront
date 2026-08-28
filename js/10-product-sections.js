
    /* ── Generic product-section loader ──
       Any .products grid with data-nh-source gets filled with products
       scraped from that category. Optional data-nh-limit (default 4) and
       data-nh-filter="discounted". Used by THC-A and any future sections. */
    function initProductSections() {
      var grids = document.querySelectorAll(".products[data-nh-source]");
      // Shared page cache: several sections on one page (e.g. Kampanjer has a
      // "discounted" + a "bestseller" grid) pull from the SAME category pages —
      // fetch each URL once and reuse. "" = failed/redirect (past last page).
      var pageCache = {};
      function fetchPage(url) {
        if (!pageCache[url]) {
          pageCache[url] = fetch(url, { credentials: nhSO })
            .then(function (r) { return (r.ok && !r.redirected) ? r.text() : ""; })
            .catch(function () { return ""; });
        }
        return pageCache[url];
      }
      Array.prototype.forEach.call(grids, function (grid) {
        if (grid.__nhSecInit) return;
        grid.__nhSecInit = true;

        var source = grid.getAttribute("data-nh-source") || "/sv/categories/alla-produkter";
        var limit = parseInt(grid.getAttribute("data-nh-limit") || "4", 10);
        var filter = grid.getAttribute("data-nh-filter") || "";

        function isDiscounted(c) {
          return !!(
            c.querySelector(".price.has-comparison del") ||
            c.querySelector(".price del") ||
            c.querySelector(".ribbon.sale")
          );
        }
        function mountCard(card) {
          card.querySelectorAll("img").forEach(function (img) {
            var ds = img.getAttribute("data-src") || img.getAttribute("data-original");
            if (ds && (!img.getAttribute("src") || /no-image|placeholder|data:/.test(img.getAttribute("src") || ""))) {
              img.setAttribute("src", ds);
            }
            img.removeAttribute("loading");
            img.classList.remove("lazy");
          });
          var outer = document.createElement("div");
          var inner = document.createElement("div");
          inner.appendChild(card);
          outer.appendChild(inner);
          return outer;
        }
        function paint(cards) {
          grid.innerHTML = "";
          if (!cards.length) {
            grid.innerHTML =
              '<div class="nh-pl-empty">Inga produkter just nu. ' +
              '<a href="' + source + '" style="color:#d2691e">Visa alla →</a></div>';
            return;
          }
          cards.slice(0, limit).forEach(function (c) {
            grid.appendChild(mountCard(c.cloneNode(true)));
          });
          if (window.nhInitCards) window.nhInitCards();
        }

        // When a filter is set (e.g. "discounted") the matching products can be
        // spread across MANY category pages — crawl up to 8 pages and collect them
        // ALL, so the Kampanjer page shows EVERY campaign, not just page 1's.
        // Unfiltered sections (e.g. Bästsäljare) keep the fast single-page behaviour.
        var crawlPages = filter ? 8 : 1;
        var base = source + (source.indexOf("?") < 0 ? "?" : "&") + "sort=in-stock";
        var pool = [];
        function cardsFromHtml(html) {
          var doc = new DOMParser().parseFromString(html, "text/html");
          return Array.prototype.slice.call(
            doc.querySelectorAll("#category-products .product-card, .pl-list .product-card, .product-card")
          );
        }
        // Fetch one page → its cards. Tolerant: a 301 past the last page (→ the
        // unpaginated list) or any error yields [] so it never contributes
        // duplicates or blocks the parallel batch.
        function grabCards(pg) {
          return fetchPage(base + "&page=" + pg).then(function (html) { return html ? cardsFromHtml(html) : []; });
        }
        // Highest ?page=N in page 1's pagination → only fetch pages that exist
        // (avoids the 301 over-crawl), capped at crawlPages.
        function lastPageFrom(html) {
          try {
            var links = new DOMParser().parseFromString(html, "text/html")
              .querySelectorAll('a[href*="page="]');
            var mx = 1;
            Array.prototype.forEach.call(links, function (a) {
              var m = (a.getAttribute("href") || "").match(/page=(\d+)/);
              if (m) { var n = parseInt(m[1], 10); if (n > mx) mx = n; }
            });
            return mx;
          } catch (e) { return 1; }
        }
        function render() {
          // Dedupe by product href — the category markup repeats each card
          // (desktop+mobile copies), so without this the same products appear
          // multiple times once we gather across pages.
          var seen = {}, uniq = [];
          pool.forEach(function (c) {
            var a = c.querySelector("a.product-card__image") || c.querySelector('a[href*="/sv/products/"]');
            var key = a && a.getAttribute("href");
            if (key && seen[key]) return;
            if (key) seen[key] = 1;
            uniq.push(c);
          });
          var cards = filter === "discounted" ? uniq.filter(isDiscounted) : uniq;
          // shuffle so it's not the same products every load (opt out: data-nh-order="fixed")
          if (grid.getAttribute("data-nh-order") !== "fixed") {
            for (var i = cards.length - 1; i > 0; i--) {
              var j = Math.floor(Math.random() * (i + 1));
              var tmp = cards[i]; cards[i] = cards[j]; cards[j] = tmp;
            }
          }
          paint(cards);
        }
        // Page 1 gives both the first batch AND the page count; fetch the rest in
        // PARALLEL. Was sequential (up to 8 back-to-back round-trips → ~6.5 s and
        // 3.8 MB on Kampanjer, incl. 301 over-crawl). Now: 1 + (last−1) concurrent,
        // only real pages.
        fetchPage(base + "&page=1")
          .then(function (html) {
            if (!html) throw new Error("no page 1");
            pool = cardsFromHtml(html);
            var last = Math.min(crawlPages, lastPageFrom(html));
            var rest = [];
            for (var pg = 2; pg <= last; pg++) rest.push(grabCards(pg));
            if (!rest.length) { render(); return; }
            Promise.all(rest).then(function (pages) {
              pages.forEach(function (cards) { if (cards && cards.length) pool = pool.concat(cards); });
              render();
            });
          })
          .catch(function () {
            if (pool.length) { render(); return; }
            grid.innerHTML =
              '<div class="nh-pl-empty">Kunde inte ladda produkter. ' +
              '<a href="' + source + '" style="color:#d2691e">Visa alla →</a></div>';
          });
      });
    }
