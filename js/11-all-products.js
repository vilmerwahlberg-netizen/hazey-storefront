
    /* ── "Alla Produkter" section with load-more pagination ──
       Fills #nh-all-grid in batches; the "Visa fler" button loads the next
       category page and appends. Order is kept (no shuffle) so paging is stable. */
    function initAllProducts() {
      var grid = document.getElementById("nh-all-grid");
      if (!grid || grid.__nhAllInit) return;
      grid.__nhAllInit = true;

      var BATCH = parseInt(grid.getAttribute("data-nh-batch") || "12", 10);
      var moreBtn = document.getElementById("nh-all-more");
      var pool = [];
      var nextPage = 1;
      var noMore = false;
      var firstPaint = true;
      var busy = false;

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

      function fetchNextPage() {
        if (noMore) return Promise.resolve();
        var pg = nextPage++;
        return fetch("/sv/categories/alla-produkter?sort=in-stock&page=" + pg, { credentials: nhSO })
          .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
          .then(function (html) {
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
        if (window.nhInitCards) window.nhInitCards();
        if (moreBtn) moreBtn.style.display = (pool.length === 0 && noMore) ? "none" : "";
      }

      function loadMore() {
        if (busy) return;
        busy = true;
        (function step() {
          if (pool.length >= BATCH || noMore) { appendBatch(); busy = false; return; }
          fetchNextPage().then(step).catch(function () { noMore = true; appendBatch(); busy = false; });
        })();
      }

      if (moreBtn) {
        moreBtn.textContent = "Visa fler";
        moreBtn.addEventListener("click", loadMore);
      }
      loadMore();
    }
