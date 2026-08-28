
    /* =============================================
		 QUICK ADD
		 ============================================= */

    function fetchProductData(productUrl) {
      return fetch(productUrl, { credentials: nhSO })
        .then(function (r) {
          return r.text();
        })
        .then(function (html) {
          var match = html.match(/window\.visitor\.viewProduct\('(\d+)'\)/);
          if (!match) throw new Error("No product ID found");
          var productId = parseInt(match[1]);

          return fetch("/frontend-api/product/state", {
            method: "POST",
            credentials: nhSO,
            headers: apiHeaders(),
            body: JSON.stringify({
              product_id: productId,
              variant_ids: [null],
            }),
          })
            .then(function (r) {
              return r.json();
            })
            .then(function (data) {
              var sv = data.selected_variant;
              var variants = (data.product && data.product.variants) || [];
              var variantOptions = [];

              if (
                variants.length > 1 &&
                data.product &&
                data.product.options &&
                data.product.options.length > 0
              ) {
                variants.forEach(function (v) {
                  var label = v.sku
                    ? String(v.sku).split(" - ").pop().trim()
                    : "Variant " + v.id;
                  variantOptions.push({
                    name: label,
                    variantId: v.id,
                    packageSize: v.package_size || 1,
                    price: (v.price && v.price.formatted_price) || "",
                    disabled: v.active === false,
                  });
                });
              }

              return {
                productId: productId,
                variantId: sv.id,
                packageSize: sv.package_size || 1,
                priceText: (sv.price && sv.price.formatted_price) || "",
                variants: variantOptions,
              };
            });
        });
    }

    function renderPanel(panel, data, productUrl, onClose) {
      var hasVariants = data.variants.length > 1;
      var currentVariantId = data.variantId;
      var currentPackageSize = data.packageSize;

      var html =
        '<button class="nh-qa-close" type="button" aria-label="Stäng">×</button>';
      if (hasVariants) {
        html +=
          '<span class="nh-qa-label">Välj variant</span><select class="nh-qa-select">';
        data.variants.forEach(function (v) {
          html +=
            '<option value="' +
            v.variantId +
            '"' +
            (v.disabled ? " disabled" : "") +
            ">" +
            v.name +
            "</option>";
        });
        html += "</select>";
      }
      html +=
        '<button class="nh-qa-add-btn" type="button">Lägg i varukorg</button>';
      panel.innerHTML = html;

      var addBtn = panel.querySelector(".nh-qa-add-btn");
      var select = panel.querySelector(".nh-qa-select");

      if (select) {
        select.addEventListener("change", function () {
          var val = parseInt(this.value);
          var found = data.variants.filter(function (v) {
            return v.variantId === val;
          })[0];
          if (found) {
            currentVariantId = found.variantId;
            currentPackageSize = found.packageSize;
          }
        });
      }

      addBtn.addEventListener("click", function () {
        if (addBtn.disabled) return;
        addBtn.disabled = true;
        addBtn.textContent = "...";
        addBtn.style.background = "rgba(210,105,30,0.5)";
        addBtn.style.color = "#ffffff";

        nhAddToCart(currentVariantId, currentPackageSize, function () {
          addBtn.textContent = "✓ Tillagd";
          addBtn.style.background = "#ffffff";
          addBtn.style.color = "#2d7a4e";
          setTimeout(function () {
            if (onClose) onClose();
            setTimeout(openCartSidebar, 100);
          }, 900);
        });
      });

      var closeBtn = panel.querySelector(".nh-qa-close");
      if (closeBtn) {
        closeBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          if (onClose) onClose();
        });
      }
    }

    // Group a card's ribbons (Nyhet / sale) into one flex row across the top
    function wrapRibbons(card) {
      if (card.__nhRibbons) return;
      var ribbons = [];
      for (var i = 0; i < card.children.length; i++) {
        var ch = card.children[i];
        if (ch.classList && ch.classList.contains("ribbon")) ribbons.push(ch);
      }
      if (!ribbons.length) return;
      card.__nhRibbons = true;
      var row = document.createElement("div");
      row.className = "nh-ribbon-row";
      card.insertBefore(row, card.firstChild);
      ribbons.forEach(function (r) {
        row.appendChild(r);
      });
    }

    function initCard(card) {
      wrapRibbons(card);
      if (card.__qaInit) return;
      card.__qaInit = true;

      var imageLink = card.querySelector("a.product-card__image");
      if (!imageLink) return;
      var productUrl = imageLink.getAttribute("href");
      if (!productUrl) return;

      var wrapEl = card.querySelector(".details-wrapper") || card;
      var hasVariants = !!card.querySelector(".has-variants");
      var buyBtn = document.createElement("button");
      buyBtn.type = "button";
      buyBtn.className = "nh-card-buy";
      buyBtn.textContent = hasVariants ? "Välj & köp" : "Lägg i korg";

      function setBusy(txt) {
        buyBtn.__busy = true;
        if (buyBtn.__orig == null) buyBtn.__orig = buyBtn.textContent;
        buyBtn.textContent = txt;
        buyBtn.style.opacity = "0.75";
      }
      function clearBusy() {
        buyBtn.style.opacity = "";
        if (buyBtn.__orig != null) buyBtn.textContent = buyBtn.__orig;
        buyBtn.__busy = false;
      }

      // Product WITHOUT variants → add directly in ONE click (no popup).
      function addDirect() {
        if (buyBtn.__busy) return;
        setBusy("Lägger till…");
        fetchProductData(productUrl)
          .then(function (data) {
            nhAddToCart(data.variantId, data.packageSize, function () {
              buyBtn.style.opacity = "";
              buyBtn.textContent = "✓ Tillagd";
              setTimeout(clearBusy, 1600);
            });
          })
          .catch(function () {
            clearBusy();
            window.location.href = productUrl;
          });
      }

      // Product WITH variants → open the centered "Välj alternativ" modal.
      function openVariants() {
        if (buyBtn.__busy) return;
        setBusy("Laddar…");
        fetchProductData(productUrl)
          .then(function (data) {
            clearBusy();
            if (!data.variants || data.variants.length < 2) {
              nhAddToCart(data.variantId, data.packageSize); // no real variants
              return;
            }
            nhOpenVariantModal(data, card);
          })
          .catch(function () {
            clearBusy();
            window.location.href = productUrl;
          });
      }

      buyBtn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (hasVariants) openVariants();
        else addDirect();
      });
      wrapEl.appendChild(buyBtn);
    }

    function initAllCards() {
      /* bara ".product-card" (en klass) — fältet äter mellanslaget i
         descendant-selektorer (".pl-list .product-card" → kompound som matchar
         inget). Alla produktkort ska ändå få köp-knapp; initCard är idempotent. */
      document.querySelectorAll(".product-card").forEach(initCard);
    }
    window.nhInitCards = initAllCards;
