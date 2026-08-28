
    /* ── Filterable "Alla produkter" listing ──
       #nh-bs-grid + a filter bar (#nh-bs-filters with .nh-pl-filter[data-cat])
       + a "Visa fler" button (#nh-bs-more). Clicking a chip switches the active
       category and reloads; "Visa fler" paginates within the active category.
       A token guards against stale fetches when the user switches fast. */
    function initBsListing() {
      var grid = document.getElementById("nh-bs-grid");
      if (!grid || grid.__nhBsInit) return;
      grid.__nhBsInit = true;

      var BATCH = parseInt(grid.getAttribute("data-nh-batch") || "12", 10);
      var moreBtn = document.getElementById("nh-bs-more");
      var countEl = document.getElementById("nh-bs-count");
      var filterBar = document.getElementById("nh-bs-filters");

      var cat = "alla-produkter";
      var pool = [], nextPage = 1, noMore = false, firstPaint = true, busy = false, token = 0;

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

      function skeletons(n) {
        var s = "";
        for (var i = 0; i < n; i++) {
          s += '<div><div><div class="nh-skel"><div class="nh-skel__img"></div>' +
               '<div class="nh-skel__line"></div><div class="nh-skel__line short"></div></div></div></div>';
        }
        return s;
      }

      function fetchNextPage(myToken) {
        if (noMore) return Promise.resolve();
        var pg = nextPage++;
        return fetch("/sv/categories/" + cat + "?sort=in-stock&page=" + pg, { credentials: nhSO })
          .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
          .then(function (html) {
            if (myToken !== token) return;
            var doc = new DOMParser().parseFromString(html, "text/html");
            var cards = Array.prototype.slice.call(doc.querySelectorAll(".product-card"));
            if (!cards.length) { noMore = true; return; }
            pool = pool.concat(cards);
          });
      }

      function appendBatch() {
        if (firstPaint) { grid.innerHTML = ""; firstPaint = false; }
        pool.splice(0, BATCH).forEach(function (c) {
          grid.appendChild(mountCard(c.cloneNode(true)));
        });
        var shown = grid.querySelectorAll(".product-card").length;
        if (countEl) countEl.textContent = shown ? ("Visar " + shown + " produkter") : "";
        if (window.nhInitCards) window.nhInitCards();
        if (moreBtn) moreBtn.style.display = (pool.length === 0 && noMore) ? "none" : "";
      }

      function loadMore() {
        if (busy) return;
        busy = true;
        var myToken = token;
        (function step() {
          if (myToken !== token) { busy = false; return; }
          if (pool.length >= BATCH || noMore) { appendBatch(); busy = false; return; }
          fetchNextPage(myToken).then(step).catch(function () { noMore = true; appendBatch(); busy = false; });
        })();
      }

      function switchTo(newCat) {
        token++;
        cat = newCat || "alla-produkter";
        pool = []; nextPage = 1; noMore = false; firstPaint = true; busy = false;
        grid.innerHTML = skeletons(BATCH < 8 ? BATCH : 8);
        if (moreBtn) moreBtn.style.display = "none";
        if (countEl) countEl.textContent = "";
        loadMore();
      }

      if (filterBar) {
        filterBar.addEventListener("click", function (e) {
          var btn = e.target.closest(".nh-pl-filter");
          if (!btn || !filterBar.contains(btn) || btn.classList.contains("is-active")) return;
          Array.prototype.forEach.call(filterBar.querySelectorAll(".nh-pl-filter"), function (b) {
            b.classList.remove("is-active");
          });
          btn.classList.add("is-active");
          switchTo(btn.getAttribute("data-cat"));
        });
      }
      if (moreBtn) {
        moreBtn.textContent = "Visa fler";
        moreBtn.addEventListener("click", loadMore);
      }
      loadMore();
    }
