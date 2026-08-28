<script>
  (function () {
    var l = document.createElement("link");
    l.rel = "stylesheet";
    l.href =
      "https://cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.1/src/fill/style.css";
    document.head.appendChild(l);
  })();

  // Boot. NOTE: this file is loaded as an EXTERNAL script (see loader.html),
  // and a dynamically-inserted <script> is async — so it can (and on page
  // navigations usually does) execute AFTER DOMContentLoaded has already fired.
  // Gating everything on addEventListener("DOMContentLoaded") would then register
  // a listener for an event that never fires again → the whole bundle silently
  // dies and the page loses all styling/logic. So: run immediately if the DOM is
  // already parsed, otherwise wait for DOMContentLoaded.
  function nhBoot() {
    /* SJÄLV-REPARATION av selektorer ──────────────────────────────
       Nyehandels globala JS-fält kör en CSS-beautifier på inklistrad kod som
       lägger mellanslag runt bindestreck och efter kolon INNE i selektor-
       strängar: ".nh-footer" → ".nh - footer", ":not(" → ": not(". Då slutar
       alla querySelector matcha och hela sajten dör. Vi monkey-patchar
       querySelector/All/closest/matches så selektorn lagas i runtime innan den
       körs. Patchen byggs från char-koder (45='-', 58=':', 32=' ') så att
       beautifiern inte kan mangla själva patchen. Reparationen är en no-op för
       redan korrekta selektorer → påverkar inte plattformens egen kod.
       (Permanent lösning = hosta hazey.min.js externt och ladda via <script src>.) */
    (function () {
      var SP = String.fromCharCode(32), DASH = String.fromCharCode(45), COL = String.fromCharCode(58);
      /* matcha mellanslag via tecken-kod (SP), INTE "\\s" — beautifiern
         kollapsar "\\s" i sträng-literaler till "\s" (= "s") och förstör regexen */
      var reDash = new RegExp(SP + "*" + DASH + SP + "*", "g");
      var reCol = new RegExp(COL + SP + "+", "g");
      function nhFixSel(s) {
        return typeof s === "string" ? s.replace(reDash, DASH).replace(reCol, COL) : s;
      }
      var protos = [Document.prototype, Element.prototype];
      if (window.DocumentFragment) protos.push(DocumentFragment.prototype);
      protos.forEach(function (P) {
        ["querySelector", "querySelectorAll", "closest", "matches"].forEach(function (m) {
          if (typeof P[m] !== "function" || P[m].__nhFixed) return;
          var orig = P[m];
          var wrapped = function () {
            var args = arguments;
            try {
              if (args.length) { args = Array.prototype.slice.call(args); args[0] = nhFixSel(args[0]); }
              return orig.apply(this, args);
            } catch (e) { return orig.apply(this, arguments); }
          };
          wrapped.__nhFixed = true;
          P[m] = wrapped;
        });
      });

      /* Manglingen drabbar ÄVEN fristående strängar (inte bara selektorer):
         className/id/attribut-namn. T.ex. footer.className="nh-footer" blir
         "nh - footer" → elementet får klasserna nh / - / footer och CSS:en
         (.nh-footer) matchar aldrig → footer, köp-knappar, ribbons, slideshow-
         prickar m.m. dör tyst. Vi lagar därför class/id/attr i runtime. nhFixId
         tar bort mellanslag runt bindestreck; no-op för korrekta värden (legitima
         klasser/id har aldrig " - "), så plattformens egen kod påverkas inte. */
      function nhFixId(s) { return typeof s === "string" ? s.replace(reDash, DASH) : s; }
      try {
        var cd = Object.getOwnPropertyDescriptor(Element.prototype, "className");
        if (cd && cd.get && cd.set) {
          Object.defineProperty(Element.prototype, "className", {
            configurable: true,
            enumerable: cd.enumerable,
            get: cd.get,
            set: function (v) { cd.set.call(this, nhFixId(v)); }
          });
        }
      } catch (e) {}
      function nhPatch(obj, name, fn) {
        try {
          var orig = obj && obj[name];
          if (typeof orig !== "function" || orig.__nhFixed) return;
          var w = function () {
            try { return fn.call(this, orig, arguments); }
            catch (e) { return orig.apply(this, arguments); }
          };
          w.__nhFixed = true;
          obj[name] = w;
        } catch (e) {}
      }
      nhPatch(Element.prototype, "setAttribute", function (orig, a) {
        var n = nhFixId(a[0]);
        return orig.call(this, n, n === "class" ? nhFixId(a[1]) : a[1]);
      });
      nhPatch(Element.prototype, "getAttribute", function (orig, a) { return orig.call(this, nhFixId(a[0])); });
      nhPatch(Document.prototype, "getElementById", function (orig, a) { return orig.call(this, nhFixId(a[0])); });
      nhPatch(Document.prototype, "getElementsByClassName", function (orig, a) { return orig.call(this, nhFixId(a[0])); });
      nhPatch(Element.prototype, "getElementsByClassName", function (orig, a) { return orig.call(this, nhFixId(a[0])); });
      if (window.DOMTokenList) {
        ["add", "remove", "toggle", "contains", "replace"].forEach(function (m) {
          nhPatch(DOMTokenList.prototype, m, function (orig, a) {
            return orig.apply(this, Array.prototype.map.call(a, nhFixId));
          });
        });
      }
      /* innerHTML manglas på TVÅ sätt: (a) taggar "<p>" → "< p >" (renderas som
         text), och (b) bindestreck i klass/attribut "nh-footer" → "nh - footer"
         (då matchar INGEN CSS → ostylad footer). Laga BÅDA i innerHTML-strängen.
         Guard på class="nh (vår markör; saknar bindestreck → kan ej manglas bort,
         fångar både "nh-x" och "nh - x") → plattformens/Vues egen innerHTML rörs
         ALDRIG (säkert för kassan); no-op på korrekt HTML. reDash/SP byggda från
         char-koder, reAttrVal är ett regex-literal (överlever fältet). */
      try {
        var ihd = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML");
        if (ihd && ihd.get && ihd.set) {
          var NHMARK = "class=" + String.fromCharCode(34) + "nh";
          var reTagLt = new RegExp("<" + SP + "+([^" + SP + ">])", "g");
          var reTagGt = new RegExp("([^" + SP + ">])" + SP + "+>", "g");
          var reAttrVal = /="[^"]*"/g;
          Object.defineProperty(Element.prototype, "innerHTML", {
            configurable: true, enumerable: ihd.enumerable, get: ihd.get,
            set: function (v) {
              if (typeof v === "string" && v.indexOf(NHMARK) !== -1) {
                v = v.replace(reTagLt, "<$1").replace(reTagGt, "$1>");
                v = v.replace(reAttrVal, function (m) { return m.replace(reDash, DASH); });
              }
              ihd.set.call(this, v);
            }
          });
        }
      } catch (e) {}
      /* FETCH-URL:er manglas också: path-literaler med bindestreck/snedstreck
         får inkilade mellanslag ("/frontend-api/product/state" → "/ frontend -
         api / product / state") → 404 → quick-add/varukorg/produktsektioner
         faller. Wrappa fetch och strippa mellanslag ur sträng-URL:er. Riktiga
         URL:er har aldrig råa mellanslag → guard på indexOf(" ") gör det till
         en no-op för plattformen/kassan. /  /g är ett regex-literal (överlever). */
      try {
        var nhOrigFetch = window.fetch;
        if (typeof nhOrigFetch === "function" && !nhOrigFetch.__nhFixed) {
          var nhWrapFetch = function (u) {
            if (typeof u === "string" && u.indexOf(" ") !== -1) arguments[0] = u.replace(/ /g, "");
            return nhOrigFetch.apply(this, arguments);
          };
          nhWrapFetch.__nhFixed = true;
          window.fetch = nhWrapFetch;
        }
      } catch (e) {}
    })();

    var DURATION = 5000;
    /* fetch-strängen "same-origin" manglas också av fältet ("same - origin")
       och kan INTE lagas via DOM-patchen → bygg den mellanslagsfritt så att den
       överlever (replace tar bort ev. inklistrade mellanslag, hyphen kvar). */
    var nhSO = "same-origin".replace(/ /g, "");
    var slideshowInitialized = false;

    var TP_SVG =
      '<svg viewBox="0 0 126 31" width="100" height="25" xmlns="http://www.w3.org/2000/svg" aria-label="Trustpilot">' +
      '<path fill="#ffffff" d="M33.074774 11.07005H45.81806v2.364196h-5.010656v13.290316h-2.755306V13.434246h-4.988435V11.07005h.01111zm12.198892 4.319629h2.355341v2.187433h.04444c.077771-.309334.222203-.60762.433295-.894859.211092-.287239.466624-.56343.766597-.79543.299972-.243048.633276-.430858.999909-.585525.366633-.14362.744377-.220953 1.12212-.220953.288863 0 .499955.011047.611056.022095.1111.011048.222202.033143.344413.04419v2.408387c-.177762-.033143-.355523-.055238-.544395-.077333-.188872-.022096-.366633-.033143-.544395-.033143-.422184 0-.822148.08838-1.199891.254096-.377744.165714-.699936.41981-.977689.740192-.277753.331429-.499955.729144-.666606 1.21524-.166652.486097-.244422 1.03848-.244422 1.668195v5.39125h-2.510883V15.38968h.01111zm18.220567 11.334883H61.02779v-1.579813h-.04444c-.311083.574477-.766597 1.02743-1.377653 1.369908-.611055.342477-1.233221.51924-1.866497.51924-1.499864 0-2.588654-.364573-3.25526-1.104765-.666606-.740193-.999909-1.856005-.999909-3.347437V15.38968h2.510883v6.948968c0 .994288.188872 1.701337.577725 2.1101.377744.408763.922139.618668 1.610965.618668.533285 0 .96658-.077333 1.322102-.243048.355524-.165714.644386-.37562.855478-.65181.222202-.265144.377744-.596574.477735-.972194.09999-.37562.144431-.784382.144431-1.226288v-6.573349h2.510883v11.323836zm4.27739-3.634675c.07777.729144.355522 1.237336.833257 1.535623.488844.287238 1.06657.441905 1.744286.441905.233312 0 .499954-.022095.799927-.055238.299973-.033143.588836-.110476.844368-.209905.266642-.099429.477734-.254096.655496-.452954.166652-.198857.244422-.452953.233312-.773335-.01111-.320381-.133321-.585525-.355523-.784382-.222202-.209906-.499955-.364573-.844368-.497144-.344413-.121525-.733267-.232-1.17767-.320382-.444405-.088381-.888809-.18781-1.344323-.287239-.466624-.099429-.922138-.232-1.355432-.37562-.433294-.14362-.822148-.342477-1.166561-.596573-.344413-.243048-.622166-.56343-.822148-.950097-.211092-.386668-.311083-.861716-.311083-1.436194 0-.618668.155542-1.12686.455515-1.54667.299972-.41981.688826-.75124 1.14434-1.005336.466624-.254095.97769-.430858 1.544304-.541334.566615-.099429 1.11101-.154667 1.622075-.154667.588836 0 1.15545.066286 1.688736.18781.533285.121524 1.02213.320381 1.455423.60762.433294.276191.788817.640764 1.07768 1.08267.288863.441905.466624.98324.544395 1.612955h-2.621984c-.122211-.596572-.388854-1.005335-.822148-1.204193-.433294-.209905-.933248-.309334-1.488753-.309334-.177762 0-.388854.011048-.633276.04419-.244422.033144-.466624.088382-.688826.165715-.211092.077334-.388854.198858-.544395.353525-.144432.154667-.222203.353525-.222203.60762 0 .309335.111101.552383.322193.740193.211092.18781.488845.342477.833258.475048.344413.121524.733267.232 1.177671.320382.444404.088381.899918.18781 1.366542.287239.455515.099429.899919.232 1.344323.37562.444404.14362.833257.342477 1.17767.596573.344414.254095.622166.56343.833258.93905.211092.37562.322193.850668.322193 1.40305 0 .673906-.155541 1.237336-.466624 1.712385-.311083.464001-.711047.850669-1.199891 1.137907-.488845.28724-1.04435.508192-1.644295.640764-.599946.132572-1.199891.198857-1.788727.198857-.722156 0-1.388762-.077333-1.999818-.243048-.611056-.165714-1.14434-.408763-1.588745-.729144-.444404-.33143-.799927-.740192-1.05546-1.226289-.255532-.486096-.388853-1.071621-.411073-1.745528h2.533103v-.022095zm8.288135-7.700208h1.899828v-3.402675h2.510883v3.402675h2.26646v1.867052h-2.26646v6.054109c0 .265143.01111.486096.03333.684954.02222.18781.07777.353524.155542.486096.07777.132572.199981.232.366633.298287.166651.066285.377743.099428.666606.099428.177762 0 .355523 0 .533285-.011047.177762-.011048.355523-.033143.533285-.077334v1.933338c-.277753.033143-.555505.055238-.811038.088381-.266642.033143-.533285.04419-.811037.04419-.666606 0-1.199891-.066285-1.599855-.18781-.399963-.121523-.722156-.309333-.944358-.552381-.233313-.243049-.377744-.541335-.466625-.905907-.07777-.364573-.13332-.784383-.144431-1.248384v-6.683825h-1.899827v-1.889147h-.02222zm8.454788 0h2.377562V16.9253h.04444c.355523-.662858.844368-1.12686 1.477644-1.414098.633276-.287239 1.310992-.430858 2.055369-.430858.899918 0 1.677625.154667 2.344231.475048.666606.309335 1.222111.740193 1.666515 1.292575.444405.552382.766597 1.193145.9888 1.92229.222202.729145.333303 1.513527.333303 2.3421 0 .762288-.099991 1.50248-.299973 2.20953-.199982.718096-.499955 1.347812-.899918 1.900194-.399964.552383-.911029.98324-1.533194 1.31467-.622166.33143-1.344323.497144-2.18869.497144-.366634 0-.733267-.033143-1.0999-.099429-.366634-.066286-.722157-.176762-1.05546-.320381-.333303-.14362-.655496-.33143-.933249-.56343-.288863-.232-.522175-.497144-.722157-.79543h-.04444v5.656393h-2.510883V15.38968zm8.77698 5.67849c0-.508193-.06666-1.005337-.199981-1.491433-.133321-.486096-.333303-.905907-.599946-1.281527-.266642-.37562-.599945-.673906-.988799-.894859-.399963-.220953-.855478-.342477-1.366542-.342477-1.05546 0-1.855387.364572-2.388672 1.093717-.533285.729144-.799928 1.701337-.799928 2.916578 0 .574478.066661 1.104764.211092 1.59086.144432.486097.344414.905908.633276 1.259432.277753.353525.611056.629716.99991.828574.388853.209905.844367.309334 1.355432.309334.577725 0 1.05546-.121524 1.455423-.353525.399964-.232.722157-.541335.97769-.905907.255531-.37562.444403-.79543.555504-1.270479.099991-.475049.155542-.961145.155542-1.458289zm4.432931-9.99812h2.510883v2.364197h-2.510883V11.07005zm0 4.31963h2.510883v11.334883h-2.510883V15.389679zm4.755124-4.31963h2.510883v15.654513h-2.510883V11.07005zm10.210184 15.963847c-.911029 0-1.722066-.154667-2.433113-.452953-.711046-.298287-1.310992-.718097-1.810946-1.237337-.488845-.530287-.866588-1.160002-1.12212-1.889147-.255533-.729144-.388854-1.535622-.388854-2.408386 0-.861716.133321-1.657147.388853-2.386291.255533-.729145.633276-1.35886 1.12212-1.889148.488845-.530287 1.0999-.93905 1.810947-1.237336.711047-.298286 1.522084-.452953 2.433113-.452953.911028 0 1.722066.154667 2.433112.452953.711047.298287 1.310992.718097 1.810947 1.237336.488844.530287.866588 1.160003 1.12212 1.889148.255532.729144.388854 1.524575.388854 2.38629 0 .872765-.133322 1.679243-.388854 2.408387-.255532.729145-.633276 1.35886-1.12212 1.889147-.488845.530287-1.0999.93905-1.810947 1.237337-.711046.298286-1.522084.452953-2.433112.452953zm0-1.977528c.555505 0 1.04435-.121524 1.455423-.353525.411074-.232.744377-.541335 1.01102-.916954.266642-.37562.455513-.806478.588835-1.281527.12221-.475049.188872-.961145.188872-1.45829 0-.486096-.066661-.961144-.188872-1.44724-.122211-.486097-.322193-.905907-.588836-1.281527-.266642-.37562-.599945-.673907-1.011019-.905907-.411074-.232-.899918-.353525-1.455423-.353525-.555505 0-1.04435.121524-1.455424.353525-.411073.232-.744376.541334-1.011019.905907-.266642.37562-.455514.79543-.588835 1.281526-.122211.486097-.188872.961145-.188872 1.447242 0 .497144.06666.98324.188872 1.458289.12221.475049.322193.905907.588835 1.281527.266643.37562.599946.684954 1.01102.916954.411073.243048.899918.353525 1.455423.353525zm6.4883-9.66669h1.899827v-3.402674h2.510883v3.402675h2.26646v1.867052h-2.26646v6.054109c0 .265143.01111.486096.03333.684954.02222.18781.07777.353524.155541.486096.077771.132572.199982.232.366634.298287.166651.066285.377743.099428.666606.099428.177762 0 .355523 0 .533285-.011047.177762-.011048.355523-.033143.533285-.077334v1.933338c-.277753.033143-.555505.055238-.811038.088381-.266642.033143-.533285.04419-.811037.04419-.666606 0-1.199891-.066285-1.599855-.18781-.399963-.121523-.722156-.309333-.944358-.552381-.233313-.243049-.377744-.541335-.466625-.905907-.07777-.364573-.133321-.784383-.144431-1.248384v-6.683825h-1.899827v-1.889147h-.02222z" />' +
      '<path fill="#00B67A" d="M30.141707 11.07005H18.63164L15.076408.177071l-3.566342 10.892977L0 11.059002l9.321376 6.739063-3.566343 10.88193 9.321375-6.728016 9.310266 6.728016-3.555233-10.88193 9.310266-6.728016z" />' +
      '<path fill="#005128" d="M21.631369 20.26169l-.799928-2.463625-5.755033 4.153914z" />' +
      "</svg>";

    function getCsrfToken() {
      var m = document.querySelector('meta[name="csrf-token"]');
      return m ? m.content : "";
    }

    function getXsrfToken() {
      var match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
      return match ? decodeURIComponent(match[1]) : "";
    }

    function apiHeaders() {
      return {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRF-TOKEN": getCsrfToken(),
        "X-XSRF-TOKEN": getXsrfToken(),
      };
    }

    function openCartSidebar() {
      fetch("/frontend-api/cart", {
        credentials: nhSO,
        headers: apiHeaders(),
      }).then(function () {
        var cartBtn = document.getElementById("cart-button");
        if (cartBtn) cartBtn.click();
      });
    }

    /* Add a variant to the cart through the platform's OWN Vuex action
       (cart/addVariant {product_variant_id, quantity, meta}) — captured from
       the product page's real buy button. This updates the cart badge AND
       slides the cart drawer open reactively, so it shows up live with NO
       page refresh. Fallback (if the store isn't exposed): POST the cart
       endpoint + open the drawer; last resort, the synthetic add button. */
    function nhAddToCart(variantId, packageSize, done) {
      var payload = {
        product_variant_id: Number(variantId),
        quantity: 1,
        meta: null,
      };
      var st = window.storeVue && window.storeVue.$store;
      if (st && st._actions && st._actions["cart/addVariant"]) {
        var pr;
        try {
          pr = st.dispatch("cart/addVariant", payload);
        } catch (e) {
          pr = null;
        }
        if (pr && typeof pr.then === "function") {
          pr.then(function () { if (done) done(true); })
            .catch(function () { if (done) done(false); });
          return;
        }
        if (done) done(true);
        return;
      }
      // Fallback: no Vuex store available → POST then open the slide-out cart.
      fetch("/frontend-api/cart/item", {
        method: "POST",
        credentials: nhSO,
        headers: apiHeaders(),
        body: JSON.stringify(payload),
      })
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.json().catch(function () { return null; });
        })
        .then(function () {
          openCartSidebar();
          if (done) done(true);
        })
        .catch(function () {
          try {
            var vb = document.createElement("button");
            vb.className = "button buy add-to-cart";
            vb.setAttribute("data-id", String(variantId));
            vb.setAttribute("data-quantity", "1.0");
            vb.setAttribute("data-package-size", String(packageSize || 1));
            vb.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;";
            document.body.appendChild(vb);
            vb.click();
            setTimeout(function () { if (vb.parentNode) vb.parentNode.removeChild(vb); }, 700);
          } catch (e) {}
          if (done) done(false);
        });
    }

    /* ── Centered variant modal (one shared dialog in the middle of the
       screen, with a dark backdrop). Replaces the old card-overlay panel
       for "Välj alternativ". ── */
    var nhModalEl = null;
    function nhCloseModal() {
      if (nhModalEl) nhModalEl.classList.remove("is-open");
      document.documentElement.style.overflow = "";
    }
    function nhGetModal() {
      if (nhModalEl) return nhModalEl;
      var overlay = document.createElement("div");
      overlay.className = "nh-qa-overlay";
      overlay.innerHTML =
        '<div class="nh-qa-modal" role="dialog" aria-modal="true"></div>';
      document.body.appendChild(overlay);
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) nhCloseModal();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") nhCloseModal();
      });
      nhModalEl = overlay;
      return overlay;
    }
    function nhOpenVariantModal(data, card) {
      var overlay = nhGetModal();
      var modal = overlay.querySelector(".nh-qa-modal");
      var cur = data.variantId;
      var ps = data.packageSize;

      // Image + name come from the clicked card (already branded + correct).
      var imgSrc = "", name = "";
      if (card) {
        var im = card.querySelector(".product-card__image img");
        if (im) imgSrc = im.currentSrc || im.src || "";
        var nm = card.querySelector(".details .name") || card.querySelector(".name");
        if (nm) name = nm.textContent.trim();
      }
      function priceFor(vid) {
        var f = data.variants.filter(function (x) { return x.variantId === vid; })[0];
        return (f && f.price) || data.priceText || "";
      }
      var opts = data.variants
        .map(function (v) {
          return (
            '<option value="' + v.variantId + '"' +
            (v.disabled ? " disabled" : "") +
            (v.variantId === cur ? " selected" : "") +
            ">" + v.name + "</option>"
          );
        })
        .join("");
      modal.innerHTML =
        '<button class="nh-qa-close" type="button" aria-label="Stäng">×</button>' +
        '<div class="nh-qa-head">' +
        (imgSrc ? '<div class="nh-qa-thumb"><img src="' + imgSrc + '" alt=""></div>' : "") +
        '<div class="nh-qa-meta">' +
        (name ? '<div class="nh-qa-name">' + name + "</div>" : "") +
        '<div class="nh-qa-price">' + priceFor(cur) + "</div>" +
        "</div>" +
        "</div>" +
        '<label class="nh-qa-label">Välj variant</label>' +
        '<select class="nh-qa-select">' + opts + "</select>" +
        '<button class="nh-qa-add-btn" type="button">Lägg i varukorg</button>';
      var sel = modal.querySelector(".nh-qa-select");
      var addBtn = modal.querySelector(".nh-qa-add-btn");
      var priceEl = modal.querySelector(".nh-qa-price");
      sel.addEventListener("change", function () {
        var val = parseInt(sel.value, 10);
        var f = data.variants.filter(function (x) { return x.variantId === val; })[0];
        if (f) {
          cur = f.variantId;
          ps = f.packageSize;
          if (priceEl) priceEl.textContent = priceFor(cur);
        }
      });
      addBtn.addEventListener("click", function () {
        if (addBtn.disabled) return;
        addBtn.disabled = true;
        addBtn.textContent = "Lägger till…";
        nhAddToCart(cur, ps, function () {
          addBtn.textContent = "✓ Tillagd";
          setTimeout(nhCloseModal, 650);
        });
      });
      modal.querySelector(".nh-qa-close").addEventListener("click", nhCloseModal);
      overlay.classList.add("is-open");
      document.documentElement.style.overflow = "hidden";
    }
