    function nhRatSlug(url) { var m = url.match(/\/sv\/products\/([a-z0-9-]+)/i); return m ? m[1] : url; }
    function nhRatGet(slug) {
      if (slug in nhRatCache) return nhRatCache[slug];
      try { var s = sessionStorage.getItem("nhrat:" + slug); if (s != null) { nhRatCache[slug] = s === "0" ? false : JSON.parse(s); return nhRatCache[slug]; } } catch (e) {}
      return undefined;
    }
    function nhRatSet(slug, val) { nhRatCache[slug] = val; try { sessionStorage.setItem("nhrat:" + slug, val ? JSON.stringify(val) : "0"); } catch (e) {} }
    function nhRatPaint(rEl, data) {
      if (!data || !rEl) return;
      var full = Math.round(data.v), h = '<span class="nh-stars" title="' + data.v + ' av 5">';
      for (var i = 1; i <= 5; i++) h += '<span class="nh-star' + (i <= full ? " is-on" : "") + '">★</span>';
      rEl.innerHTML = h + '</span><span class="nh-stars__count">(' + data.c + ")</span>";
      rEl.classList.add("nh-rating-shown");
    }
    function nhRatPump() {
      while (nhRatActive < 4 && nhRatQueue.length && nhRatDone < NH_RAT_MAX) {
        var job = nhRatQueue.shift();
        var cached = nhRatGet(job.slug);
        if (cached !== undefined) { nhRatPaint(job.rEl, cached); continue; }
        nhRatActive++; nhRatDone++;
        (function (job) {
          fetch(job.url, { credentials: nhSO })
            .then(function (r) { return r.text(); })
            .then(function (html) {
              var m = html.match(/"aggregateRating":\{[^}]*?"ratingValue":\s*"?([0-9.]+)"?[^}]*?"reviewCount":\s*"?([0-9]+)"?/);
              var data = m ? { v: parseFloat(m[1]), c: parseInt(m[2], 10) } : false;
              nhRatSet(job.slug, data); nhRatPaint(job.rEl, data);
            })
            .catch(function () {})
            .then(function () { nhRatActive--; nhRatPump(); });
        })(job);
      }
    }
    function nhRatQueueCard(card) {
      if (card.__nhRat) return;
      var rEl = card.querySelector(".rating");
      if (!rEl) return;
      var link = card.querySelector("a.product-card__image") || card.querySelector('a[href*="/sv/products/"]');
      if (!link) return;
      var url = link.getAttribute("href");
      if (!url) return;
      card.__nhRat = true;
      nhRatQueue.push({ rEl: rEl, url: url, slug: nhRatSlug(url) });
      nhRatPump();
    }
    function initCardRatings() {
      var cards = document.querySelectorAll(".product-card");
      if (!cards.length) return;
      if (!("IntersectionObserver" in window)) { Array.prototype.forEach.call(cards, nhRatQueueCard); return; }
      if (!nhRatIO) {
        nhRatIO = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { if (e.isIntersecting) { nhRatIO.unobserve(e.target); nhRatQueueCard(e.target); } });
        }, { rootMargin: "300px" });
      }
      Array.prototype.forEach.call(cards, function (card) {
        if (card.__nhRatObs) return;
        card.__nhRatObs = true;
        if (card.querySelector(".rating")) nhRatIO.observe(card);
      });
    }
