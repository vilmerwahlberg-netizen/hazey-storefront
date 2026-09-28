/* Produktsidor -- desktopriktning från hazey-master-locked-v2/product,
   mobil härledd med köpprioritet (bild -> namn -> pris -> variant ->
   lager -> köp -> trygghet -> fördjupning -> relaterat/FAQ).

   Nyehandels köpflöde är orört: native <select>, antal, "Lägg i
   varukorgen", lager, pristrappa och galleri är plattformens egna.
   Theme 8 lägger bara till:
   - variantknappar som styr den native <select>:en (samma värde,
     change-event -> Vue uppdaterar pris/lager/SKU som vanligt),
   - ankarnavigering, en produktinformationstabell (etikett/värde-par
     som redan står i produktens egen text + varumärke/SKU/variant),
     ett varumärkesband (länk till varumärkets riktiga kategori), en
     hjälp-panel (FAQ/kontakt) och en mobil köpbar som klickar den
     native köpknappen.
   Inga nya påståenden -- all text är antingen produktens egen eller
   neutral navigation. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  var MAX_VARIANT_BUTTONS = 16; // fler alternativ -> native select behålls synlig

  /* ---- Variantknappar ---- */
  function syncVariants() {
    var host = document.getElementById("product-variants");
    if (!host) return;
    var fields = host.querySelectorAll(".field");
    Array.prototype.forEach.call(fields, function (field, index) {
      var select = field.querySelector("select");
      if (!select) return;
      var options = Array.prototype.filter.call(select.options, function (o) { return o.value !== ""; });
      var group = field.querySelector(".hz8-variant-group");
      if (options.length < 2 || options.length > MAX_VARIANT_BUTTONS) {
        if (group) group.remove();
        field.classList.remove("hz8-has-variant-buttons");
        return;
      }
      var labelEl = field.querySelector(".label");
      var label = labelEl ? labelEl.textContent.trim() : "Variant";
      var signature = options.map(function (o) { return o.value + ":" + o.disabled; }).join("|");
      if (!group || group.getAttribute("data-sig") !== signature) {
        if (group) group.remove();
        group = document.createElement("div");
        group.className = "hz8-variant-group";
        group.setAttribute("role", "group");
        group.setAttribute("aria-label", "Välj " + label.toLowerCase());
        group.setAttribute("data-sig", signature);
        options.forEach(function (o) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "hz8-variant";
          b.textContent = o.textContent.trim();
          b.setAttribute("data-value", o.value);
          if (o.disabled) { b.disabled = true; b.setAttribute("aria-disabled", "true"); }
          b.addEventListener("click", function () {
            if (select.value === o.value) return;
            select.value = o.value;
            select.dispatchEvent(new Event("change", { bubbles: true }));
            select.dispatchEvent(new Event("input", { bubbles: true }));
          });
          group.appendChild(b);
        });
        field.appendChild(group);
        field.classList.add("hz8-has-variant-buttons");
        if (!field.getAttribute("data-hz8-variant-index")) field.setAttribute("data-hz8-variant-index", String(index));
      }
      Array.prototype.forEach.call(group.children, function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-value") === select.value ? "true" : "false");
      });
    });
  }

  /* ---- Produktinformation (etikett/värde ur produktens egen text) ---- */
  function specRows() {
    var rows = [];
    var seen = {};
    function add(label, value) {
      label = (label || "").replace(/[:：]\s*$/, "").trim();
      value = (value || "").trim();
      if (!label || !value || seen[label.toLowerCase()]) return;
      seen[label.toLowerCase()] = true;
      rows.push([label, value]);
    }
    var brand = document.querySelector(".product-detail__information .brand a");
    if (brand) add("Varumärke", brand.textContent);
    document.querySelectorAll(".product-detail__information .short-description li").forEach(function (li) {
      var strong = li.querySelector("strong, b");
      if (!strong) return;
      var label = strong.textContent;
      var value = li.textContent.replace(label, "");
      if (label.length < 40 && value.trim().length > 0 && value.length < 160) add(label, value);
    });
    document.querySelectorAll("#product-variants .field").forEach(function (field) {
      var select = field.querySelector("select");
      var label = field.querySelector(".label");
      if (select && label && select.selectedOptions[0]) add(label.textContent.trim().replace(/^\w/, function (c) { return c.toUpperCase(); }), select.selectedOptions[0].textContent);
    });
    var sku = document.getElementById("product-sku");
    if (sku) add("Artikel", sku.textContent);
    return rows;
  }

  function renderSpec(section) {
    var rows = specRows();
    var dl = section.querySelector("dl");
    if (!rows.length) { section.hidden = true; return; }
    section.hidden = false;
    var html = rows.map(function (r) { return "<div><dt>" + HZ8.esc(r[0]) + "</dt><dd>" + HZ8.esc(r[1]) + "</dd></div>"; }).join("");
    if (dl.getAttribute("data-html") !== html) { dl.innerHTML = html; dl.setAttribute("data-html", html); }
  }

  /* ---- Mobil köpbar ---- */
  function buildStickyBuy() {
    var buy = document.querySelector(".buy-form .button.buy");
    if (!buy) return null;
    var bar = document.createElement("div");
    bar.className = "hz8-pdp-sticky";
    bar.setAttribute("aria-hidden", "true");
    bar.innerHTML = '<div class="hz8-pdp-sticky__info"><span class="hz8-pdp-sticky__name"></span><span class="hz8-pdp-sticky__price"></span></div>' +
      '<button type="button" class="hz8-btn hz8-btn--primary" tabindex="-1">Lägg i varukorgen</button>';
    bar.querySelector("button").addEventListener("click", function () {
      var native = document.querySelector(".buy-form .button.buy");
      if (native && !native.disabled) native.click();
      else {
        var form = document.querySelector(".buy-form, .product-detail__information");
        if (form) form.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
    document.body.appendChild(bar);
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        var visible = entries[0].isIntersecting || entries[0].boundingClientRect.top > window.innerHeight;
        bar.classList.toggle("is-visible", !visible);
      });
      io.observe(document.querySelector(".buy-form") || buy);
    }
    return bar;
  }
  function syncSticky(bar) {
    if (!bar) return;
    var title = document.querySelector(".product-detail__information h1");
    var price = document.getElementById("product-price");
    var native = document.querySelector(".buy-form .button.buy");
    bar.querySelector(".hz8-pdp-sticky__name").textContent = title ? title.textContent.trim() : "";
    bar.querySelector(".hz8-pdp-sticky__price").textContent = price ? price.textContent.trim() : "";
    var btn = bar.querySelector("button");
    var label = native ? native.textContent.trim() || "Lägg i varukorgen" : "Lägg i varukorgen";
    if (btn.textContent !== label) btn.textContent = label;
  }

  HZ8.register("product", function (context) {
    if (context.page !== "product") return;
    var info = document.querySelector(".product-detail__information");
    var detailInfo = document.getElementById("product-information");
    if (!info || document.querySelector(".hz8-pdp-nav")) return;
    var title = info.querySelector("h1");
    /* Produkttexter i katalogen innehåller ibland egna <h1> -- exponeras
       som nivå 2 för hjälpmedel (sidans enda H1 är produktnamnet). */
    document.querySelectorAll("#product-page h1").forEach(function (h) {
      if (h === title) return;
      h.setAttribute("role", "heading");
      h.setAttribute("aria-level", "2");
    });
    var brandLink = info.querySelector(".brand a");
    var brandName = brandLink ? brandLink.textContent.trim() : "";

    /* Kort "Läs mer" till den fullständiga beskrivningen längre ned. */
    var shortDesc = info.querySelector(".short-description");
    if (shortDesc) {
      var more = document.createElement("a");
      more.className = "hz8-link hz8-pdp-more";
      more.href = "#hz8-pdp-about";
      more.textContent = "Läs hela beskrivningen";
      shortDesc.parentNode.insertBefore(more, shortDesc.nextSibling);
    }

    /* Ankarnavigering + sektioner under köpdelen. */
    var article = document.querySelector("#product-page > article.section") || document.getElementById("product-page");
    var hasReviews = !!document.querySelector("#product-reviews.accordion-button, .accordion-button#product-reviews");
    var similar = document.querySelector(".product-page-lists__similar-products");
    var nav = document.createElement("nav");
    nav.className = "hz8-pdp-nav";
    nav.setAttribute("aria-label", "På den här sidan");
    var links = [["#hz8-pdp-about", "Om produkten"], ["#hz8-pdp-spec", "Produktinformation"]];
    if (hasReviews) links.push(["#hz8-pdp-reviews", "Recensioner"]);
    if (similar) links.push(["#hz8-pdp-similar", "Liknande produkter"]);
    links.push(["#hz8-pdp-help", "Frågor"]);
    nav.innerHTML = '<div class="hz8-pdp-nav__inner">' + links.map(function (l) { return '<a href="' + l[0] + '">' + l[1] + "</a>"; }).join("") + "</div>";

    var extra = document.createElement("div");
    extra.className = "hz8-pdp-extra";
    extra.innerHTML =
      '<section class="hz8-pdp-spec" id="hz8-pdp-spec" aria-labelledby="hz8-pdp-spec-title"><h2 id="hz8-pdp-spec-title">Produktinformation</h2><dl></dl></section>' +
      (brandName ? '<section class="hz8-band hz8-pdp-brand" aria-labelledby="hz8-pdp-brand-title"><div class="hz8-pdp-brand__copy"><span class="hz8-kicker">Varumärke</span><h2 id="hz8-pdp-brand-title">Mer från ' + HZ8.esc(brandName) +
        '</h2><p>Se alla produkter från ' + HZ8.esc(brandName) + ' i vårt sortiment.</p><a class="hz8-btn hz8-btn--light" href="' + HZ8.esc(HZ8.link(brandLink.getAttribute("href"))) + '">Visa ' + HZ8.esc(brandName) +
        '</a></div><div class="hz8-pdp-brand__art" aria-hidden="true"></div></section>' : "") +
      '<section class="hz8-pdp-help" id="hz8-pdp-help" aria-labelledby="hz8-pdp-help-title"><div><span class="hz8-kicker">Kundservice</span><h2 id="hz8-pdp-help-title">Har du frågor om produkten?</h2>' +
      '<p>Läs svaren på vanliga frågor om leverans, betalning och sortiment, eller kontakta oss direkt.</p></div>' +
      '<div class="hz8-pdp-help__actions"><a class="hz8-btn hz8-btn--primary" href="' + HZ8.esc(HZ8.link("/sv/page/faq")) + '">Vanliga frågor</a><a class="hz8-btn hz8-btn--secondary" href="' + HZ8.esc(HZ8.link("/sv/page/kontakt")) + '">Kontakta oss</a></div></section>';

    if (detailInfo) {
      detailInfo.parentNode.insertBefore(nav, detailInfo);
      var aboutAnchor = document.createElement("span");
      aboutAnchor.id = "hz8-pdp-about";
      aboutAnchor.className = "hz8-pdp-anchor";
      detailInfo.parentNode.insertBefore(aboutAnchor, detailInfo);
      detailInfo.parentNode.insertBefore(extra, detailInfo.nextSibling);
    } else if (article) {
      article.appendChild(nav);
      article.appendChild(extra);
    }
    if (brandName && /magic/i.test(brandName + (title ? title.textContent : ""))) {
      var art = extra.querySelector(".hz8-pdp-brand__art");
      if (art) art.classList.add("is-magic");
    }
    if (hasReviews) {
      var reviewsItem = document.querySelector(".accordion-button#product-reviews");
      var anchor = document.createElement("span");
      anchor.id = "hz8-pdp-reviews";
      anchor.className = "hz8-pdp-anchor";
      if (reviewsItem && reviewsItem.parentNode) reviewsItem.parentNode.insertBefore(anchor, reviewsItem);
      nav.querySelector('a[href="#hz8-pdp-reviews"]').addEventListener("click", function () {
        var btn = document.querySelector(".accordion-button#product-reviews");
        if (btn && !btn.classList.contains("active")) btn.click();
      });
    }
    if (similar) {
      var simAnchor = document.createElement("span");
      simAnchor.id = "hz8-pdp-similar";
      simAnchor.className = "hz8-pdp-anchor";
      similar.parentNode.insertBefore(simAnchor, similar);
    }

    var spec = extra.querySelector(".hz8-pdp-spec");
    var sticky = buildStickyBuy();
    HZ8.watch(function () {
      syncVariants();
      renderSpec(spec);
      syncSticky(sticky);
      var stock = document.getElementById("stock");
      document.documentElement.classList.toggle("hz8-pdp-out", !!(stock && stock.classList.contains("is-negative")));
    });
  });
})();
