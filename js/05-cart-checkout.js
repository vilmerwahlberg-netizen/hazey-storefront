
    // CART: add a Swish trust row under the checkout button in the slide-out
    // cart (#cartAside). Guard by checking for our own row (not a flag) so it
    // re-injects if the Vue cart re-renders and wipes it. innerHTML carries
    // nh- classes → self-repair-safe.
    function initCartSwish() {
      // chained (getElementById + compound class) — NO descendant-space selector,
      // which the field would mangle (mode 3: "#cartAside .footer" → compound).
      var ca = document.getElementById("cartAside");
      if (!ca) return;
      var foot = ca.querySelector(".section.footer") || ca.querySelector(".footer");
      if (!foot) return;
      if (foot.querySelector(".nh-cart-swish")) return;
      var buy = foot.querySelector(".button.buy");
      var row = document.createElement("div");
      row.className = "nh-cart-swish";
      row.innerHTML =
        '<span class="nh-cart-swish__txt">Trygg betalning med</span>' +
        '<span class="nh-cart-swish__chip"><img src="https://www.hazey.se/wp-content/uploads/2023/04/Swish-Logo-Secondary-Light-BG.png" alt="Swish" loading="lazy"></span>';
      if (buy && buy.parentNode) buy.parentNode.insertBefore(row, buy.nextSibling);
      else foot.appendChild(row);
    }

    // CHECKOUT: the hosted Vue checkout ships a near-black "Fortsätt"/submit
    // button (and others). Recolor any near-black button to brand green —
    // EXCEPT Klarna's own buttons (must stay black). Class-agnostic so it
    // survives the platform's markup; each button is processed once.
    function initCheckout() {
      if (!document.body.classList.contains("checkout-page")) return;
      var btns = document.querySelectorAll(
        "main.checkout button, .checkout-page button, main.checkout .button, .checkout-page .button",
      );
      btns.forEach(function (btn) {
        if (btn.__nhCo) return;
        var cls = (typeof btn.className === "string" ? btn.className : "") + " " + (btn.id || "");
        // Skip Klarna-branded buttons (brand requirement → keep black)
        if (/klarna/i.test(cls)) return;
        if (/klarna/i.test(btn.innerText || "")) return;
        if (btn.querySelector('[class*="klarna" i], img[src*="klarna" i]')) return;
        var cs = getComputedStyle(btn);
        var m = cs.backgroundColor.match(/(\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?/);
        if (!m) return;
        var a = m[4] === undefined ? 1 : parseFloat(m[4]);
        if (a < 0.5) return;
        var r = +m[1], g = +m[2], b = +m[3];
        if (r < 45 && g < 45 && b < 45) {
          btn.__nhCo = true;
          btn.style.setProperty("background-color", "#323d25", "important");
          btn.style.setProperty("color", "#ffffff", "important");
          btn.style.setProperty("border-color", "#323d25", "important");
        }
      });
    }
