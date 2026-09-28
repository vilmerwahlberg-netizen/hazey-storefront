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
        var current = document.createElement("span");
        current.className = "hz8-variant-current";
        current.setAttribute("aria-hidden", "true");
        if (labelEl) labelEl.appendChild(current);
        field.appendChild(group);
        field.classList.add("hz8-has-variant-buttons");
        if (options.length > 6) field.classList.add("hz8-many-variants");
        if (!field.getAttribute("data-hz8-variant-index")) field.setAttribute("data-hz8-variant-index", String(index));
      }
      Array.prototype.forEach.call(group.children, function (b) {
        b.setAttribute("aria-pressed", b.getAttribute("data-value") === select.value ? "true" : "false");
      });
      var cur = field.querySelector(".hz8-variant-current");
      var sel = select.selectedOptions && select.selectedOptions[0];
      if (cur && sel && cur.textContent !== ": " + sel.textContent.trim()) cur.textContent = ": " + sel.textContent.trim();
    });
  }

  /* ---- Paketväljare: Nyehandels egen pristrappa ("Köp mer - Betala
     mindre", #product-pricing-table) som valbara nivåer. Antal, styckpris
     och besparing räknas ur plattformens egna värden; valet styr den
     native antal-väljaren (+/-), så Nyehandel sätter priset i varukorgen.
     Saknas pristrappan visas ingenting. "Prisvärdast" = nivån med lägst
     styckpris (faktum ur tabellen). */
  function parseKr(text) {
    var m = (text || "").replace(/\s/g, "").match(/(\d+(?:,\d+)?)/);
    return m ? parseFloat(m[1].replace(",", ".")) : null;
  }
  function kr(value) {
    var rounded = Math.round(value * 100) / 100;
    return rounded.toLocaleString("sv-SE", { minimumFractionDigits: rounded % 1 ? 2 : 0, maximumFractionDigits: 2 }) + " kr";
  }
  function readTiers() {
    return Array.prototype.map.call(document.querySelectorAll("#product-pricing-table tr"), function (tr) {
      var cells = tr.cells;
      if (!cells || cells.length < 2) return null;
      var min = parseInt((cells[0].textContent.match(/\d+/) || [])[0], 10);
      var unit = parseKr(cells[1].textContent);
      return min && unit ? { min: min, unit: unit } : null;
    }).filter(Boolean);
  }
  function qtyInput() { return document.querySelector(".buy-form .amount-input .input"); }
  function setQty(target) {
    var input = qtyInput();
    var plus = document.querySelector(".buy-form .amount-input button[aria-label='Öka antalet']");
    var minus = document.querySelector(".buy-form .amount-input button[aria-label='Minska antalet']");
    if (!input || !plus || !minus) return;
    var guard = 0;
    (function step() {
      var current = parseInt(input.value, 10) || 1;
      if (current === target || guard++ > 60) { syncPackages(); syncBuyLabel(); return; }
      (current < target ? plus : minus).click();
      window.setTimeout(step, 30);
    })();
  }
  function syncPackages() {
    var table = document.getElementById("product-pricing-table");
    var tiers = readTiers();
    var host = document.querySelector(".hz8-packages");
    if (!table || tiers.length < 2) { if (host) host.remove(); return; }
    var base = tiers[0].unit;
    var sig = tiers.map(function (t) { return t.min + ":" + t.unit; }).join("|");
    if (!host || host.getAttribute("data-sig") !== sig) {
      if (host) host.remove();
      host = document.createElement("div");
      host.className = "hz8-packages";
      host.setAttribute("data-sig", sig);
      var best = tiers.reduce(function (a, b) { return b.unit < a.unit ? b : a; });
      var heading = table.querySelector("h4");
      host.innerHTML = '<p class="hz8-packages__title" id="hz8-packages-title">' + HZ8.esc(heading ? heading.textContent.trim() : "Köp fler, betala mindre") + "</p>";
      var list = document.createElement("div");
      list.className = "hz8-packages__list";
      list.setAttribute("role", "group");
      list.setAttribute("aria-labelledby", "hz8-packages-title");
      tiers.forEach(function (t) {
        var total = t.min * t.unit;
        var saved = t.min * (base - t.unit);
        var b = document.createElement("button");
        b.type = "button";
        b.className = "hz8-package";
        b.setAttribute("data-qty", String(t.min));
        b.innerHTML = (t === best && t !== tiers[0] ? '<span class="hz8-package__badge">Prisvärdast</span>' : "") +
          '<span class="hz8-package__qty">' + t.min + " st</span>" +
          '<span class="hz8-package__total">' + kr(total) + "</span>" +
          '<span class="hz8-package__unit">' + kr(t.unit) + " / st</span>" +
          (saved > 0.5 ? '<span class="hz8-package__save">Spara ' + kr(saved) + "</span>" : '<span class="hz8-package__save is-empty">Ordinarie pris</span>');
        b.addEventListener("click", function () { setQty(t.min); });
        list.appendChild(b);
      });
      host.appendChild(list);
      table.parentNode.insertBefore(host, table);
    }
    var input = qtyInput();
    var qty = input ? parseInt(input.value, 10) || 1 : 1;
    var activeMin = tiers.filter(function (t) { return t.min <= qty; }).pop();
    Array.prototype.forEach.call(host.querySelectorAll(".hz8-package"), function (b) {
      b.setAttribute("aria-pressed", activeMin && String(activeMin.min) === b.getAttribute("data-qty") ? "true" : "false");
    });
  }

  /* ---- Kort ingress i köpdelen: första riktiga stycket i produktens
     egen korta beskrivning (resten syns i full beskrivning längre ned). */
  function markLead(shortDesc) {
    if (!shortDesc || shortDesc.querySelector(".hz8-pdp-lead")) return;
    var lead = Array.prototype.find.call(shortDesc.querySelectorAll("p"), function (p) { return p.textContent.trim().length > 40; });
    if (lead) { lead.classList.add("hz8-pdp-lead"); shortDesc.classList.add("hz8-has-lead"); }
  }

  /* ---- Analys & dokument: visas bara om produktens egen text nämner
     labbrapport/analys -- meningen citeras ur texten, inget nytt. */
  function docsSentence() {
    var el = document.querySelector(".product-detail__information .short-description");
    /* textContent (inte innerText): delar av texten är visuellt dolda i
       köpdelen. Blockgränser blir radbrytningar så meningen avgränsas. */
    var text = "";
    if (el) Array.prototype.forEach.call(el.querySelectorAll("p, li, span, b, strong, u, a, h2, h3"), function (n) { if (!n.children.length) text += n.textContent + "\n"; });
    var m = text.match(/(labbrapport|analysintyg|analysrapport)[^.!?\n]*[.!?]?/i);
    if (!m) return "";
    var sentence = m[0].trim();
    return sentence.charAt(0).toUpperCase() + sentence.slice(1);
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
      var labelText = label ? Array.prototype.filter.call(label.childNodes, function (n) { return n.nodeType === 3; }).map(function (n) { return n.textContent; }).join("").trim() : "";
      if (select && labelText && select.selectedOptions[0]) add(labelText.replace(/^\w/, function (c) { return c.toUpperCase(); }), select.selectedOptions[0].textContent);
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

  /* Produktens egna USP-punkter (Nyehandel-admin). Omdömes- och
     laglighetspåståenden utan källa används inte i mikrotrust. */
  function realUsps() {
    return Array.prototype.map.call(document.querySelectorAll(".product-usp li"), function (li) { return li.textContent.trim(); })
      .filter(function (t) { return t && !/trustpilot|lagligt/i.test(t); });
  }

  /* Aktuellt totalpris = antal x Nyehandels pris för den nivån
     (pristrappan), annars antal x produktens pris. */
  function currentTotal() {
    var input = qtyInput();
    var qty = input ? parseInt(input.value, 10) || 1 : 1;
    var tiers = readTiers();
    var unit = null;
    if (tiers.length) { var t = tiers.filter(function (x) { return x.min <= qty; }).pop(); if (t) unit = t.unit; }
    if (unit == null) unit = parseKr((document.getElementById("product-price") || {}).textContent);
    return unit == null ? null : { qty: qty, total: unit * qty };
  }
  function buyLabel() {
    var native = document.querySelector(".buy-form .button.buy");
    if (!native) return null;
    if (native.disabled) return native.textContent.trim() || "Slut i lager";
    var t = currentTotal();
    return t ? "Lägg i varukorgen – " + kr(t.total) : "Lägg i varukorgen";
  }
  function syncBuyLabel() {
    var span = document.querySelector(".buy-form .button.buy span");
    var label = buyLabel();
    if (span && label && span.getAttribute("data-hz8-label") !== label) {
      span.setAttribute("data-hz8-label", label);
      span.setAttribute("data-hz8-short", label.replace("Lägg i varukorgen", "Lägg i korgen"));
      span.parentNode.setAttribute("aria-label", label);
    }
  }

  /* ---- Mobil köpbar ---- */
  function buildStickyBuy() {
    var buy = document.querySelector(".buy-form .button.buy");
    if (!buy) return null;
    var bar = document.createElement("div");
    bar.className = "hz8-pdp-sticky";
    bar.setAttribute("aria-hidden", "true");
    bar.innerHTML = '<div class="hz8-pdp-sticky__trust" aria-hidden="true"></div><div class="hz8-pdp-sticky__info"><span class="hz8-pdp-sticky__name"></span><span class="hz8-pdp-sticky__price"></span></div>' +
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
    var t = currentTotal();
    bar.querySelector(".hz8-pdp-sticky__name").textContent = title ? title.textContent.trim() : "";
    bar.querySelector(".hz8-pdp-sticky__price").textContent = t ? (t.qty > 1 ? t.qty + " st · " : "") + kr(t.total) : "";
    var btn = bar.querySelector("button");
    var native = document.querySelector(".buy-form .button.buy");
    var label = native && native.disabled ? (native.textContent.trim() || "Slut i lager") : "Lägg i varukorgen";
    if (btn.textContent !== label) btn.textContent = label;
    var trust = bar.querySelector(".hz8-pdp-sticky__trust");
    var items = realUsps().filter(function (u) { return u.length <= 26; }).slice(0, 3);
    var html = items.map(function (u) { return "<span>" + HZ8.esc(u) + "</span>"; }).join("");
    if (trust.innerHTML !== html) trust.innerHTML = html;
    var cartOpen = !!document.querySelector("#cart-side-wrap.is-active");
    bar.classList.toggle("is-cart-open", cartOpen);
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
    markLead(shortDesc);
    if (shortDesc) {
      var more = document.createElement("a");
      more.className = "hz8-link hz8-pdp-more";
      more.href = "#hz8-pdp-about";
      more.textContent = "Läs hela beskrivningen";
      shortDesc.parentNode.insertBefore(more, shortDesc.nextSibling);
    }

    /* Ankarnavigering + sektioner under köpdelen. */
    var article = document.querySelector("#product-page > article.section") || document.getElementById("product-page");
    var reviewsBtn = document.querySelector(".accordion-button#product-reviews");
    var hasReviews = !!reviewsBtn;
    var reviewCount = reviewsBtn ? parseInt((reviewsBtn.textContent.match(/\((\d+)\)/) || [])[1] || "0", 10) : 0;
    document.documentElement.classList.toggle("hz8-pdp-no-reviews", !reviewCount);
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
    var docs = docsSentence();
    /* Leveranspunkter = produktens egna USP-rad (admin), utan omdömes-/
       laglighetspåståenden. */
    var usps = realUsps().filter(function (u) { return /frakt|skickas|leverans|diskret|paket/i.test(u); });
    extra.innerHTML =
      '<div class="hz8-pdp-acc hz8-accordion" id="hz8-pdp-spec">' +
        '<details class="hz8-pdp-spec" open><summary>Specifikation</summary><dl></dl></details>' +
        (docs ? '<details class="hz8-pdp-docs"><summary>Innehåll och analys</summary><p>' + HZ8.esc(docs) + ' <a href="mailto:hej@hazey.se">hej@hazey.se</a></p></details>' : "") +
        (usps.length ? '<details class="hz8-pdp-delivery"><summary>Leverans och retur</summary><ul>' + usps.map(function (u) { return "<li>" + HZ8.esc(u) + "</li>"; }).join("") +
          '</ul><p><a href="' + HZ8.esc(HZ8.link("/sv/page/kop-och-leveransvillkor")) + '">Köp- och leveransvillkor</a> · <a href="' + HZ8.esc(HZ8.link("/sv/page/faq")) + '">Vanliga frågor</a></p></details>' : "") +
      "</div>" +
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

    /* Recensionssammanfattning (riktig data ur Nyehandels betygsrad). */
    var ratingEl = info.querySelector(".price-features .rating");
    var starsInner = ratingEl && ratingEl.querySelector(".stars-inner");
    var countTxt = ratingEl && (ratingEl.textContent.match(/(\d+)\s*omdöm/) || [])[1];
    var reviewsContent = document.querySelector(".accordion-content #product-reviews.product-reviews, #product-reviews.product-reviews");
    var nhStars = ratingEl && ratingEl.querySelector(".nh-stars[title]");
    var avgFromTitle = nhStars ? parseFloat((nhStars.getAttribute("title").match(/([\d.,]+)/) || [])[1]) : NaN;
    if ((starsInner || !isNaN(avgFromTitle)) && countTxt && reviewsContent && !document.querySelector(".hz8-review-summary")) {
      var pct = !isNaN(avgFromTitle) ? avgFromTitle * 20 : (parseFloat(starsInner.style.width) || 0);
      var avg = Math.round(pct / 20 * 10) / 10;
      var sum = document.createElement("div");
      sum.className = "hz8-review-summary";
      sum.innerHTML = '<span class="hz8-review-summary__avg">' + String(avg).replace(".", ",") + '</span><span class="hz8-review-summary__stars" aria-hidden="true"><span style="width:' + pct + '%"></span></span>' +
        '<span class="hz8-review-summary__count">' + countTxt + " omdömen</span>";
      sum.setAttribute("aria-label", "Snittbetyg " + String(avg).replace(".", ",") + " av 5 baserat på " + countTxt + " omdömen");
      reviewsContent.parentNode.insertBefore(sum, reviewsContent);
    }

    /* Mer från serien (+ tillverkarens övriga serier): produktens egna
       "Relaterade kategorier" -> relationskartans serie x format. */
    /* Produkten kan ligga i flera serie x format-kategorier (t.ex. en cart
       som även ligger i "THCA Vapes"). Välj den vars format stämmer med
       produkttypen i namnet ("Cart - ...", "Vape - ..."), annars den första. */
    var combos = [];
    document.querySelectorAll(".related-categories .tag a[href]").forEach(function (a) {
      var c = HZ8.catalog && HZ8.catalog.contextFor(a.href);
      if (c && c.type === "combo") combos.push(c);
    });
    var typeWord = ((title ? title.textContent : "").trim().split(/[\s–-]+/)[0] || "").toLowerCase();
    var combo = combos.filter(function (c) {
      var k = c.format.key, l = c.format.label.toLowerCase();
      return typeWord && (k.indexOf(typeWord) === 0 || l.indexOf(typeWord) === 0 || typeWord.indexOf(k.replace(/s$/, "")) === 0);
    })[0] || combos[0] || null;
    if (combo && HZ8.productRail) {
      var here = HZ8.path(location.href).split("?")[0].replace(/\/\d+$/, "");
      var comboRoute = combo.series.routes[combo.format.key];
      var seriesRail = HZ8.productRail({
        id: "hz8-pdp-series",
        className: "hz8-prail--compact hz8-pdp-series",
        title: "Mer från " + combo.series.name,
        href: HZ8.link(comboRoute),
        allLabel: "Alla " + combo.series.name + " " + combo.format.label.toLowerCase(),
        hideCount: true,
        source: comboRoute,
        exclude: function (c) { var m = c.html.match(/href="([^"]*\/products\/[^"]+)"/); return m && HZ8.path(m[1]).split("?")[0].replace(/\/\d+$/, "") === here; }
      });
      extra.appendChild(seriesRail);
      if (HZ8.relatedByManufacturer) {
        HZ8.relatedByManufacturer({ format: combo.format, series: combo.series, route: comboRoute }).then(function (sections) {
          sections.forEach(function (sec) { sec.classList.add("hz8-pdp-brandmore"); extra.appendChild(sec); });
        });
      }
    }

    /* Antalsfältets värde ändras utan DOM-mutation -- synka paketvalet
       när antal-väljaren används. */
    document.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest(".buy-form .amount-input")) window.setTimeout(function () { syncPackages(); syncBuyLabel(); syncSticky(sticky); }, 60);
    });
    document.addEventListener("input", function (e) {
      if (e.target.closest && e.target.closest(".buy-form .amount-input")) { syncPackages(); syncBuyLabel(); }
    });
    document.addEventListener("change", function (e) {
      if (e.target.closest && e.target.closest(".buy-form .amount-input")) { syncPackages(); syncBuyLabel(); }
    });

    var spec = extra.querySelector(".hz8-pdp-spec");
    /* Sticky bar på alla bredder (inte bara mobil) -- se 82-product.css. */
    var sticky = buildStickyBuy();
    HZ8.watch(function () {
      syncVariants();
      syncPackages();
      renderSpec(spec);
      syncBuyLabel();
      syncSticky(sticky);
      var stock = document.getElementById("stock");
      document.documentElement.classList.toggle("hz8-pdp-out", !!(stock && stock.classList.contains("is-negative")));
    });
  });
})();
