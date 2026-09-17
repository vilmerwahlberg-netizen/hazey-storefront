
    function initCategoryPage() {
      // Collapse empty category-menu sidebar block
      var menu = document.getElementById("category-menu");
      if (menu && !menu.children.length) {
        var sec = menu.closest(".category-sidebar");
        if (sec) sec.style.display = "none";
      }
    }

    function initReadMore() {
      var desc = document.querySelector(".category-description");
      var btn = document.querySelector(".readmore__toggle button");
      var content = document.getElementById("read-more-content");
      if (!desc || !btn || !content || btn.__rmInit) return;
      btn.__rmInit = true;

      content.style.overflow = "hidden";

      // Use the embedded image as the decorative bg, then drop it from the text
      var heroImg = content.querySelector("img");
      if (heroImg && heroImg.src && !desc.style.getPropertyValue("--cat-bg-img")) {
        desc.style.setProperty("--cat-bg-img", 'url("' + heroImg.src + '")');
      }
      content.querySelectorAll("img").forEach(function (i) { i.remove(); });

      // Strip WordPress [shortcode] artifacts and collect text nodes
      var walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, null);
      var textNodes = [];
      while (walker.nextNode()) textNodes.push(walker.currentNode);
      textNodes.forEach(function (n) {
        n.nodeValue = n.nodeValue.replace(/\[[^\]]*\]/g, "");
      });

      // Build a clean lead line (first real sentence) shown under the title
      var container = desc.querySelector(".container");
      if (container && !container.querySelector(".nh-cat-lead")) {
        var lead = "";
        for (var k = 0; k < textNodes.length; k++) {
          var t = textNodes[k].nodeValue.replace(/\s+/g, " ").trim();
          if (t.length > 40) { lead = t; break; }
        }
        if (lead.length > 200) lead = lead.slice(0, 197).replace(/\s+\S*$/, "") + "…";
        if (lead) {
          var p = document.createElement("p");
          p.className = "nh-cat-lead";
          p.textContent = lead;
          var title = container.querySelector("h1.title");
          var readmore = container.querySelector(".readmore");
          // wrap the lead + full article in a clean card ("box")
          var box = document.createElement("div");
          box.className = "nh-cat-box";
          if (title) title.insertAdjacentElement("afterend", box);
          box.appendChild(p);
          if (readmore) box.appendChild(readmore);
        }
      }

      // Full article is hidden by default; the toggle reveals it
      function setExpanded(on) {
        if (on) {
          content.style.maxHeight = content.scrollHeight + "px";
          btn.setAttribute("aria-expanded", "true");
          btn.textContent = "Visa mindre";
        } else {
          content.style.maxHeight = "0px";
          btn.setAttribute("aria-expanded", "false");
          btn.textContent = "Läs mer";
        }
      }
      setExpanded(false);

      btn.addEventListener("click", function () {
        setExpanded(btn.getAttribute("aria-expanded") !== "true");
      });
    }

    /* ===================================================================
       Kategoritopp: West Coast-markör + dynamiska snabbval (Refine,
       preview/category-direction-round-2 är godkänt visuellt facit).

       Primär snabbvalsaxel avgörs från RIKTIG data på sidan varje gång
       funktionen körs -- ingen hårdkodad lista per kategori:
       1. Om de riktiga produktkortens namn visar >=2 olika produkttyper
          (första ordet i produktnamnet, t.ex. "Vape"/"Cart"/"Batteri")
          blir produkttyp primär axel, med Nyehandels egen "Serie"-
          filtergrupp som sekundär nivå (döljs om <2 relevanta serier).
       2. Annars, om Nyehandels egen "Serie"-filtergrupp redan har >=2
          riktiga alternativ (plattformen visar bara serier som faktiskt
          har träffar i kategorin), blir serie primär axel direkt.
       3. Annars visas ingen snabbvalsrad alls (ingen tom dekoration).

       Verifierat 2026-09-17 mot Theme 6-previewn: "Alla Vapes" och
       "Blommor" hamnar båda i gren 2 idag (produkttyp är redan homogent
       inom varje riktig kategori just nu) -- se slutrapporten för vad
       det betyder för grenen 1 (byggd och redo, men overifierad live).

       "Serie"-snabbvalen triggar Nyehandels EGNA riktiga filter (klickar
       den befintliga <a role="button">-kontrollen i #sidebar) i stället
       för att bygga en egen parallell filtermotor -- native URL/state/
       produkträkning bevaras oförändrat. Produkttyp-axeln (gren 1) har
       ingen native motsvarighet och döljer/visar riktiga produktkort
       klientsidan; se rapport för den kända begränsningen (uppdaterar
       inte Nyehandels egen "N produkter"-räknare i det läget). */
    function initCategoryTop() {
      var desc = document.querySelector(".category-description");
      var grid = document.querySelector(".products");
      if (!desc || !grid) return;

      var key = location.pathname;
      var needsBuild = desc.getAttribute("data-nh-cattop-key") !== key ||
        !document.querySelector(".nh-cattop-quickpicks-wrap");

      if (needsBuild) {
        desc.setAttribute("data-nh-cattop-key", key);
        nhCatTopBuild(desc, grid);
      }
      nhCatTopSyncActive();
    }

    var NH_CATTOP_PAUSED_CANNABINOIDS = ["hhcpm", "thcnm", "10-oh-thc"];

    function nhCatTopReadCards(grid) {
      var out = [];
      grid.querySelectorAll(".product-card").forEach(function (card) {
        var nameEl = card.querySelector(".details .name, .name");
        var imgEl = card.querySelector(".product-card__image img, img");
        if (!nameEl || !imgEl) return;
        var name = nameEl.textContent.replace(/\s+/g, " ").trim();
        if (!name) return;
        out.push({
          el: card,
          name: name,
          nameLower: name.toLowerCase(),
          firstWord: (name.split(" ")[0] || "").toLowerCase(),
          img: imgEl.currentSrc || imgEl.src || ""
        });
      });
      return out;
    }

    function nhCatTopReadNativeSerieOptions() {
      var headers = document.querySelectorAll(".vertical-filters__product-filter__item h4");
      var serieHeader = null;
      for (var i = 0; i < headers.length; i++) {
        if (headers[i].textContent.trim() === "Serie") { serieHeader = headers[i]; break; }
      }
      if (!serieHeader) return [];
      var item = serieHeader.closest(".vertical-filters__product-filter__item") || serieHeader.parentElement;
      var links = item.querySelectorAll('a[aria-label$=" filter"]');
      var out = [];
      links.forEach(function (a) {
        var label = a.textContent.replace(/\s+/g, " ").trim();
        if (label) out.push({ label: label, el: a });
      });
      return out;
    }

    function nhCatTopFindSample(cards, matchFn) {
      for (var i = 0; i < cards.length; i++) { if (matchFn(cards[i])) return cards[i]; }
      return null;
    }

    function nhCatTopBuild(desc, grid) {
      // Rensa ev. tidigare injicerat innehåll (byte av kategori i SPA:n)
      var oldWrap = document.querySelector(".nh-cattop-quickpicks-wrap");
      if (oldWrap) oldWrap.remove();
      var oldHeadrow = desc.querySelector(".nh-cattop-headrow");
      var h1Restore = null;
      if (oldHeadrow) {
        h1Restore = oldHeadrow.querySelector("h1.title");
        if (h1Restore) oldHeadrow.insertAdjacentElement("beforebegin", h1Restore);
        oldHeadrow.remove();
      }

      var container = desc.querySelector(".container");
      var h1 = container && container.querySelector("h1.title");
      if (container && h1 && !container.querySelector(".nh-cattop-headrow")) {
        var headrow = document.createElement("div");
        headrow.className = "nh-cattop-headrow";
        h1.insertAdjacentElement("beforebegin", headrow);
        headrow.appendChild(h1);
        var mark = document.createElement("div");
        mark.className = "nh-cattop-mark";
        mark.setAttribute("aria-hidden", "true");
        mark.innerHTML = '<svg viewBox="0 0 40 56" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
          '<path d="M20 56V26"/><path d="M20 26c-6-4-10-4-16-2"/><path d="M20 26c-4-7-8-9-14-10"/>' +
          '<path d="M20 26c-1-8-3-12-6-16"/><path d="M20 26c1-8 3-12 6-16"/><path d="M20 26c4-7 8-9 14-10"/><path d="M20 26c6-4 10-4 16-2"/></svg>';
        headrow.appendChild(mark);
      }

      var cards = nhCatTopReadCards(grid);
      if (!cards.length) return;
      var serieOptions = nhCatTopReadNativeSerieOptions();

      var producttypeCounts = {};
      cards.forEach(function (c) {
        if (NH_CATTOP_PAUSED_CANNABINOIDS.indexOf(c.firstWord) !== -1) return;
        producttypeCounts[c.firstWord] = (producttypeCounts[c.firstWord] || 0) + 1;
      });
      var producttypes = Object.keys(producttypeCounts);

      var axis = null, options = [];
      if (producttypes.length >= 2) {
        axis = "producttype";
        options = producttypes.map(function (pt) {
          var sample = nhCatTopFindSample(cards, function (c) { return c.firstWord === pt; });
          return { value: pt, label: pt.charAt(0).toUpperCase() + pt.slice(1), img: sample ? sample.img : "" };
        });
      } else if (serieOptions.length >= 2) {
        axis = "serie";
        options = serieOptions.map(function (s) {
          var needle = s.label.toLowerCase();
          var sample = nhCatTopFindSample(cards, function (c) { return c.nameLower.indexOf(needle) !== -1; });
          return { value: s.label, label: s.label, img: sample ? sample.img : "", nativeEl: s.el };
        });
      }

      if (!axis || !options.length) return;

      var wrap = document.createElement("div");
      wrap.className = "nh-cattop-quickpicks-wrap";
      wrap.setAttribute("data-nh-cattop-axis", axis);

      var qpRow = document.createElement("div");
      qpRow.className = "nh-cattop-quickpicks";
      qpRow.setAttribute("role", "group");
      qpRow.setAttribute("aria-label", "Snabbval");

      qpRow.appendChild(nhCatTopBuildQp("", "Alla", "", axis));
      options.forEach(function (o) {
        qpRow.appendChild(nhCatTopBuildQp(o.value, o.label, o.img, axis));
      });
      wrap.appendChild(qpRow);

      if (axis === "producttype" && serieOptions.length) {
        var secWrap = document.createElement("div");
        secWrap.className = "nh-cattop-secondary-wrap";
        secWrap.hidden = true;
        secWrap.innerHTML = '<p class="nh-cattop-secondary-label">Välj serie</p>';
        var secRow = document.createElement("div");
        secRow.className = "nh-cattop-secondary";
        secRow.setAttribute("role", "group");
        secRow.setAttribute("aria-label", "Välj serie");
        secWrap.appendChild(secRow);
        wrap.appendChild(secWrap);
      }

      desc.insertAdjacentElement("afterend", wrap);
      nhCatTopBindEvents(wrap, cards, serieOptions, axis);
    }

    function nhCatTopBuildQp(value, label, img, axis) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "nh-cattop-qp";
      btn.setAttribute("data-nh-cattop-value", value);
      btn.setAttribute("aria-current", String(value === ""));
      var ring = document.createElement("span");
      ring.className = "nh-cattop-qp-ring";
      if (img) {
        ring.innerHTML = '<span class="nh-cattop-qp-img"><img src="' + nhEscAttr(img) + '" alt="" loading="lazy"></span>';
      } else {
        ring.innerHTML = '<span class="nh-cattop-qp-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg></span>';
      }
      var labelEl = document.createElement("span");
      labelEl.className = "nh-cattop-qp-label";
      labelEl.textContent = label;
      btn.appendChild(ring);
      btn.appendChild(labelEl);
      return btn;
    }

    function nhCatTopNativeChecked(a) {
      var li = a.closest(".product-filter-item");
      var cb = li ? li.querySelector('input[type="checkbox"]') : null;
      return !!(cb && cb.checked);
    }

    function nhCatTopSetSerie(serieOptions, targetLabel) {
      serieOptions.forEach(function (s) {
        var isChecked = nhCatTopNativeChecked(s.el);
        var shouldBeChecked = targetLabel !== "" && s.label === targetLabel;
        if (isChecked !== shouldBeChecked) s.el.click();
      });
    }

    function nhCatTopBindEvents(wrap, cards, serieOptions, axis) {
      var qpButtons = wrap.querySelectorAll(".nh-cattop-qp");
      var secWrap = wrap.querySelector(".nh-cattop-secondary-wrap");
      var secRow = wrap.querySelector(".nh-cattop-secondary");

      qpButtons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var value = btn.getAttribute("data-nh-cattop-value");
          qpButtons.forEach(function (b) { b.setAttribute("aria-current", String(b === btn)); });
          if (axis === "serie") {
            nhCatTopSetSerie(serieOptions, value);
          } else if (axis === "producttype") {
            cards.forEach(function (c) {
              var show = value === "" || c.firstWord === value;
              c.el.classList.toggle("nh-cattop-hidden", !show);
            });
            if (secWrap && secRow) {
              if (value === "") {
                secWrap.hidden = true;
                nhCatTopSetSerie(serieOptions, "");
              } else {
                var visible = cards.filter(function (c) { return c.firstWord === value; });
                secRow.innerHTML = "";
                var any = false;
                serieOptions.forEach(function (s) {
                  var needle = s.label.toLowerCase();
                  var hasMatch = visible.some(function (c) { return c.nameLower.indexOf(needle) !== -1; });
                  if (!hasMatch) return;
                  any = true;
                  var sBtn = document.createElement("button");
                  sBtn.type = "button";
                  sBtn.className = "nh-cattop-sopt";
                  sBtn.setAttribute("data-nh-cattop-serie", s.label);
                  sBtn.setAttribute("aria-pressed", "false");
                  sBtn.textContent = s.label;
                  sBtn.addEventListener("click", function () {
                    var isPressed = sBtn.getAttribute("aria-pressed") === "true";
                    secRow.querySelectorAll(".nh-cattop-sopt").forEach(function (o) {
                      o.setAttribute("aria-pressed", String(!isPressed && o === sBtn));
                    });
                    nhCatTopSetSerie(serieOptions, isPressed ? "" : s.label);
                  });
                  secRow.appendChild(sBtn);
                });
                secWrap.hidden = !any;
                secWrap.querySelector(".nh-cattop-secondary-label").textContent =
                  any ? "Välj serie" : "";
              }
            }
          }
        });
      });

      wrap.setAttribute("data-nh-cattop-bound", "true");
    }

    function nhCatTopSyncActive() {
      var wrap = document.querySelector(".nh-cattop-quickpicks-wrap");
      if (!wrap) return;
      var axis = wrap.getAttribute("data-nh-cattop-axis");
      if (axis !== "serie") return; // produkttyp-axeln har egen klientstate, ingen native att läsa tillbaka
      var serieOptions = nhCatTopReadNativeSerieOptions();
      var activeLabel = "";
      serieOptions.forEach(function (s) { if (nhCatTopNativeChecked(s.el)) activeLabel = s.label; });
      wrap.querySelectorAll(".nh-cattop-qp").forEach(function (btn) {
        var v = btn.getAttribute("data-nh-cattop-value");
        btn.setAttribute("aria-current", String(v === activeLabel));
      });
    }
