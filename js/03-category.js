
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
