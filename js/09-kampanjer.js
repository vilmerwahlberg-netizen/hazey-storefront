
    /* ── Custom Kampanjer (campaigns) loader ──
       The script lives here (global custom JS) because <script> tags pasted
       into an html-editor block are stripped and never run. The block only
       provides the markup with #nh-kampanjer-grid. */
    function initKampanjer() {
      var grid = document.getElementById("nh-kampanjer-grid");
      if (!grid || grid.__nhKampInit) return;
      grid.__nhKampInit = true;

      var MAX = 4;

      function isDiscounted(card) {
        return !!(
          card.querySelector(".price.has-comparison del") ||
          card.querySelector(".price del") ||
          card.querySelector(".ribbon.sale")
        );
      }

      // grid flattens two wrapper levels (display:contents), so the
      // .product-card must sit at .products > div > div > .product-card
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
            '<div class="nh-pl-empty">Inga kampanjer just nu. ' +
            '<a href="/sv/categories/alla-produkter" style="color:#d2691e">Visa alla produkter →</a></div>';
          return;
        }
        cards.slice(0, MAX).forEach(function (c) {
          grid.appendChild(mountCard(c.cloneNode(true)));
        });
        if (window.nhInitCards) window.nhInitCards();
      }

      function scrape(url) {
        return fetch(url, { credentials: nhSO })
          .then(function (r) {
            if (!r.ok) throw new Error("HTTP " + r.status);
            return r.text();
          })
          .then(function (html) {
            var doc = new DOMParser().parseFromString(html, "text/html");
            return Array.from(
              doc.querySelectorAll(
                "#category-products .product-card, .pl-list .product-card, .product-card"
              )
            );
          });
      }

      function fromCategory(slug) {
        return scrape("/sv/categories/" + slug).then(function (cards) {
          var d = cards.filter(isDiscounted);
          if (d.length) return d;
          throw new Error("none");
        });
      }

      fromCategory("kampanjer")
        .catch(function () { return fromCategory("rea"); })
        .catch(function () {
          return scrape("/sv/categories/alla-produkter").then(function (cards) {
            return cards.filter(isDiscounted);
          });
        })
        .then(paint)
        .catch(function () {
          grid.innerHTML =
            '<div class="nh-pl-empty">Kunde inte ladda kampanjer. ' +
            '<a href="/sv/categories/alla-produkter" style="color:#d2691e">Visa alla produkter →</a></div>';
        });
    }
