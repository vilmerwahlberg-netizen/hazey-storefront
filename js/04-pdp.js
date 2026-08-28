
    // PDP: move the variant <select> (#product-variants) INTO the buy box,
    // right above the qty/add row, so it reads stock → variant → qty → add.
    // Idempotent: once it lives inside the box, contains() short-circuits.
    function initPdpVariant() {
      var box = document.querySelector(".meta-usp-buy-container");
      var variants = document.querySelector("#product-variants, .variants");
      if (!box || !variants) return;
      if (box.contains(variants)) return;
      variants.classList.add("nh-in-buybox");
      var bc = box.querySelector(".buy-controls");
      if (bc) box.insertBefore(variants, bc);
      else box.appendChild(variants);
    }

    // PDP: turn each variant <select> (Vit/Svart, doft, strain…) into a row of
    // tappable boxes — the MMSports "Välj storlek" look, hazey-styled. The native
    // <select> stays in the DOM (Vue keeps it in sync); we hide its .control via
    // the nh-has-vbox class and mirror clicks back onto the select + fire a native
    // change so Vuex updates SKU/price/stock. Guard on the select element itself so
    // a Vue re-render (new <select>) rebuilds automatically. Mangle-safe: only
    // single-class/tag querySelectors (no descendant-space), innerHTML-free.
    function initVariantBoxes() {
      var vroot = document.getElementById("product-variants");
      if (!vroot) return;
      var fields = vroot.querySelectorAll(".field");
      if (!fields.length) return;
      vroot.classList.add("nh-has-vbox");
      Array.prototype.forEach.call(fields, function (field) {
        var sel = field.querySelector("select");
        if (!sel || sel.__nhVbox) return;
        var opts = sel.querySelectorAll("option");
        if (opts.length < 2) { return; }
        sel.__nhVbox = true;
        var row = document.createElement("div");
        row.className = "nh-vbox-row";
        Array.prototype.forEach.call(opts, function (o) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "nh-vbox" + (o.selected ? " is-active" : "");
          b.setAttribute("data-val", o.value);
          if (o.disabled) b.setAttribute("disabled", "disabled");
          b.textContent = (o.textContent || "").trim();
          b.addEventListener("click", function () {
            if (o.disabled) return;
            sel.value = o.value;
            sel.dispatchEvent(new Event("change", { bubbles: true }));
            Array.prototype.forEach.call(row.querySelectorAll(".nh-vbox"), function (x) {
              x.classList.remove("is-active");
            });
            b.classList.add("is-active");
          });
          row.appendChild(b);
        });
        field.appendChild(row);
        sel.addEventListener("change", function () {
          Array.prototype.forEach.call(row.querySelectorAll(".nh-vbox"), function (x) {
            x.classList.toggle("is-active", x.getAttribute("data-val") === sel.value);
          });
        });
      });
    }

    // PDP: paint the top rating widget in .price-features. The platform sets
    // .stars-inner width:0% (no filled stars) and hides the count on mobile
    // (.count.is-hidden-mobile) -> the rating is invisible. We read the
    // aggregate from JSON-LD (fallback: average of the review list's star
    // widths), paint our amber nh-stars markup AND set the native width as a
    // belt-and-suspenders fallback. Mangle-safe: only chained single-class
    // querySelector, no regex, all innerHTML uses nh- classes.
    function nhPdpRatingValue() {
      // 1) JSON-LD: aggregateRating.ratingValue (+ reviewCount), maybe in @graph.
      var scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (var s = 0; s < scripts.length; s++) {
        var raw = scripts[s].textContent;
        if (!raw) continue;
        var obj;
        try { obj = JSON.parse(raw); } catch (e) { continue; }
        var stack = [obj];
        while (stack.length) {
          var node = stack.shift();
          if (!node || typeof node !== "object") continue;
          if (node.aggregateRating && node.aggregateRating.ratingValue != null) {
            var v = parseFloat(node.aggregateRating.ratingValue);
            var c = parseInt(node.aggregateRating.reviewCount != null
              ? node.aggregateRating.reviewCount
              : node.aggregateRating.ratingCount, 10);
            if (!isNaN(v)) return { v: v, c: isNaN(c) ? 0 : c };
          }
          if (node["@graph"] && node["@graph"].length) {
            for (var g = 0; g < node["@graph"].length; g++) stack.push(node["@graph"][g]);
          }
          if (node.length) { for (var a = 0; a < node.length; a++) stack.push(node[a]); }
        }
      }
      // 2) Fallback: average the review list's star widths ("100%" -> 5.0).
      var rev = document.querySelector(".product-reviews");
      if (rev) {
        var inners = rev.querySelectorAll(".stars-inner");
        if (inners.length) {
          var sum = 0, n = 0;
          for (var i = 0; i < inners.length; i++) {
            var w = parseFloat(inners[i].style.width);
            if (!isNaN(w)) { sum += w / 100 * 5; n++; }
          }
          if (n) return { v: sum / n, c: n };
        }
      }
      return null;
    }

    function initPdpRating() {
      var pf = document.querySelector(".price-features");
      var rating = pf && pf.querySelector(".rating");
      if (!rating) return;
      if (rating.__nhRat) return;
      var data = nhPdpRatingValue();
      if (!data) return;
      rating.__nhRat = true;

      // Belt-and-suspenders: fill the native .stars-inner width so the native
      // glyphs fill even if our markup is mangled away.
      var inner = rating.querySelector(".stars-inner");
      if (inner) inner.style.width = (data.v / 5 * 100) + "%";

      // Keep the link to the reviews; paint our amber nh-stars markup into it.
      var target = rating.querySelector("a") || rating;
      if (!target.getAttribute("href")) target.setAttribute("href", "#" + "product-reviews");
      var full = Math.round(data.v * 2) / 2;
      var fullCount = Math.floor(full);
      var hasHalf = full - fullCount >= 0.5;
      var h = '<span class="nh-stars" title="' + data.v + ' av 5">';
      for (var i = 1; i <= 5; i++) {
        var cls = "nh-star";
        if (i <= fullCount) cls += " is-on";
        else if (i === fullCount + 1 && hasHalf) cls += " is-on nh-star--half";
        h += '<span class="' + cls + '">★</span>';
      }
      h += "</span>";
      var cnt = data.c
        ? '<span class="nh-stars__count">' + data.c + " omdömen</span>"
        : "";
      target.innerHTML = h + cnt;
    }

    // PDP: the platform lets customers SEE reviews but not WRITE them (the
    // per-product review-submission form is backend-locked). Give a real path
    // to leave a review via Trustpilot. Chained single-class querySelector (no
    // descendant-space, mode-3 safe); innerHTML carries nh- classes → self-
    // repair-safe; the full https URL survives the field (plain URLs aren't
    // mangled). Guard by our own element so it re-injects if the PDP re-renders.
    function initPdpReviewCta() {
      var pp = document.getElementById("product-page");
      if (!pp) return;
      if (pp.querySelector(".nh-review-cta")) return;
      // Anchor on .product-detail (rendered early + always visible) — NOT the
      // reviews list, which lives in a COLLAPSED accordion (height:0) where the
      // CTA would be hidden. Insert as a sibling right after the buy area.
      var anchor = pp.querySelector(".product-detail") ||
                   pp.querySelector(".meta-usp-buy-container");
      if (!anchor) return;
      var host = anchor.parentNode;
      if (!host) return;
      var box = document.createElement("div");
      box.className = "nh-review-cta";
      box.innerHTML =
        '<span class="nh-review-cta__txt">Har du köpt denna produkt? Dela din upplevelse.</span>' +
        '<a class="nh-review-cta__btn" href="https://www.trustpilot.com/evaluate/hazey.se" target="_blank" rel="noopener">Lämna ett omdöme</a>';
      host.insertBefore(box, anchor.nextSibling);
    }

    // PDP: gör den långa "short-description" till en kort teaser + "Läs mer".
    // Plattformen dumpar HELA sammanfattningen (rubrik + stycken + spec-lista +
    // en inbäddad #product-information-länk) i köp-kolumnen → alldeles för lång.
    // Vi wrappar innehållet i .nh-sd-body, klampar det (fade + max-height) och
    // lägger en toggle som fäller ut in-place. Den fulla "Beskrivning"-accordionen
    // finns kvar nedanför. Idempotent (guard: .nh-sd-body finns redan) + själv-
    // läkande vid Vue-omrender (ny node saknar wrappern → wrappas om).
    function initPdpShortDesc() {
      var pp = document.getElementById("product-page");
      if (!pp) return;
      var sd = pp.querySelector(".short-description");
      if (!sd) return;
      if (sd.querySelector(".nh-sd-body")) return; // redan wrappad
      // Klampa bara när det finns mer än en teaser att vinna på (annars lämna).
      if (sd.scrollHeight < 280) return;

      // Wrappa allt innehåll i en klamp-body så toggeln kan ligga UTANFÖR
      // overflow:hidden och alltid synas.
      var body = document.createElement("div");
      body.className = "nh-sd-body nh-sd-clamped";
      while (sd.firstChild) body.appendChild(sd.firstChild);
      sd.appendChild(body);

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "nh-sd-toggle";
      btn.setAttribute("aria-expanded", "false");
      btn.textContent = "Läs mer";
      sd.appendChild(btn);

      btn.addEventListener("click", function () {
        var clamped = body.classList.toggle("nh-sd-clamped");
        btn.setAttribute("aria-expanded", clamped ? "false" : "true");
        btn.textContent = clamped ? "Läs mer" : "Visa mindre";
        if (clamped) {
          try { sd.scrollIntoView({ block: "nearest" }); } catch (e) {}
        }
      });
    }

    // PDP: MÄNGDRABATT-visning i köp-boxen. Det RIKTIGA avdraget sätts i
    // Nyehandel-admin (kvantitetsrabatt per produkt); det här visar bara
    // erbjudandet + pris/styck och lyfter aktiv nivå när antalet ändras.
    // JUSTERA nivåerna här (antal + procent) — eller sätt window.NH_BULK_TIERS.
    // Mangle-safe: chained single-class querySelector (ingen descendant-space),
    // innerHTML bär nh- klasser (self-repair), regex-LITERALER (överlever fältet).
    function initBulkPricing() {
      var pp = document.getElementById("product-page");
      if (!pp) return;
      var box = pp.querySelector(".meta-usp-buy-container");
      if (!box) return;
      var pf = pp.querySelector(".price-features");
      if (!pf) return;
      var priceEl = pf.querySelector(".price");
      if (!priceEl) return;
      // container (create once, keep position before .buy-controls)
      var wrap = box.querySelector(".nh-bulk");
      if (!wrap) {
        wrap = document.createElement("div");
        wrap.className = "nh-bulk";
        var bc = box.querySelector(".buy-controls");
        if (bc && bc.parentNode) bc.parentNode.insertBefore(wrap, bc);
        else box.appendChild(wrap);
      }

      function num(s) {
        var t = (s || "").replace(/[^\d.,]/g, "").replace(/\s/g, "");
        if (t.indexOf(",") > -1) t = t.replace(/\./g, "").replace(/,/g, ".");
        var v = parseFloat(t);
        return isNaN(v) ? 0 : v;
      }
      function baseP() {
        var ins = priceEl.querySelector("ins") || priceEl;
        return num(ins.textContent);
      }
      function kr(n) { return Math.round(n) + " kr"; }

      // Prefer the platform's native tier table (#product-pricing-table) for
      // EXACT prices; fall back to computing from tierCfg + base price.
      function readTiers() {
        var table = pp.querySelector("#product-pricing-table");
        var rows = table ? table.querySelectorAll("tr") : null;
        var out = [];
        if (rows && rows.length) {
          var base = 0;
          Array.prototype.forEach.call(rows, function (tr, idx) {
            var tds = tr.querySelectorAll("td");
            if (tds.length < 2) return;
            var m = (tds[0].textContent || "").match(/\d+/);
            var q = m ? parseInt(m[0], 10) : (out.length ? 0 : 1);
            var p = num(tds[1].textContent);
            if (!p) return;
            if (!out.length) base = p;
            out.push({ qty: q, price: p, pct: base ? Math.round((1 - p / base) * 100) : 0 });
          });
          if (out.length) { out.__native = table; return out; }
        }
        // No native tier table → only show boxes if tiers were EXPLICITLY set
        // (never invent a discount that the product doesn't actually have).
        var cfg = window.NH_BULK_TIERS;
        var b = baseP();
        if (!b || !cfg || !cfg.length) return null;
        out.push({ qty: 1, price: b, pct: 0 });
        cfg.forEach(function (t) {
          out.push({ qty: t.qty, price: b * (1 - t.pct / 100), pct: t.pct });
        });
        return out;
      }

      function currentQty() {
        var ai = box.querySelector(".amount-input");
        var i = ai ? ai.querySelector(".input") : null;
        return i ? (parseInt(i.value, 10) || 1) : 1;
      }
      // Reach a target qty by clicking the native +/- stepper (Vue-wired, so the
      // cart quantity truly updates — safer than writing .value directly).
      function setQty(t) {
        var ai = box.querySelector(".amount-input");
        if (!ai) return;
        var i = ai.querySelector(".input");
        var cur = i ? (parseInt(i.value, 10) || 1) : 1;
        var btns = ai.querySelectorAll(".button");
        if (!btns.length) return;
        var b = (t - cur) > 0 ? btns[btns.length - 1] : btns[0];
        var n = Math.abs(t - cur);
        for (var k = 0; k < n; k++) { if (b) b.click(); }
      }
      function highlight() {
        var q = currentQty(), active = 0;
        Array.prototype.forEach.call(wrap.querySelectorAll(".nh-tier"), function (el) {
          var dq = parseInt(el.getAttribute("data-q"), 10) || 0;
          if (q >= dq) active = Math.max(active, dq);
        });
        Array.prototype.forEach.call(wrap.querySelectorAll(".nh-tier"), function (el) {
          el.classList.toggle("is-active", (parseInt(el.getAttribute("data-q"), 10) || 0) === active);
        });
      }
      function render() {
        var tiers = readTiers();
        if (!tiers || tiers.length < 2) { wrap.style.display = "none"; wrap.__sig = ""; return; }
        wrap.style.display = "";
        var sig = tiers.map(function (t) { return t.qty + ":" + Math.round(t.price) + ":" + t.pct; }).join("|");
        if (sig !== wrap.__sig) {
          wrap.__sig = sig;
          var h = '<div class="nh-bulk__head">Köp fler — betala mindre</div><div class="nh-tier-grid">';
          tiers.forEach(function (t) {
            h += '<button type="button" class="nh-tier' + (t.pct > 0 ? " is-deal" : "") + '" data-q="' + t.qty + '">'
              + (t.pct > 0 ? '<span class="nh-tier__badge">−' + t.pct + "%</span>" : "")
              + '<span class="nh-tier__qty">' + t.qty + " st</span>"
              + '<span class="nh-tier__price">' + kr(t.price) + "/st</span>"
              + "</button>";
          });
          h += "</div>";
          wrap.innerHTML = h;
        }
        if (tiers.__native) tiers.__native.style.display = "none";
        highlight();
      }

      render();
      if (!box.__nhBulkWired) {
        box.__nhBulkWired = true;
        wrap.addEventListener("click", function (e) {
          var t = e.target;
          while (t && t !== wrap && !(t.classList && t.classList.contains("nh-tier"))) t = t.parentNode;
          if (!t || t === wrap) return;
          var q = parseInt(t.getAttribute("data-q"), 10);
          if (q) setQty(q);
          setTimeout(highlight, 40);
        });
        box.addEventListener("input", highlight);
        box.addEventListener("click", function () { setTimeout(highlight, 60); });
        try { new MutationObserver(render).observe(priceEl, { childList: true, subtree: true, characterData: true }); } catch (e) {}
      }
    }
