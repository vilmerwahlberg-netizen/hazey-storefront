
    /* =============================================
		 INIT
		 ============================================= */

    /* Trust-bar (topbar USP) → scrolling marquee on mobile. Builds a
       duplicated track so all three USPs loop seamlessly; CSS shows the
       marquee only on phones and hides the static .usp there. */
    function initTopbarMarquee() {
      var nhSh = document.getElementById("store-header");
      var topbar = nhSh ? nhSh.querySelector(".topbar") : null;
      if (!topbar) return;
      var usp = topbar.querySelector(".usp");
      if (!usp || topbar.querySelector(".nh-topbar-marquee")) return;
      var items = Array.prototype.slice
        .call(usp.querySelectorAll("li"))
        .map(function (li) {
          return li.textContent.trim();
        })
        .filter(Boolean);
      if (!items.length) return;
      var wrap = document.createElement("div");
      wrap.className = "nh-topbar-marquee";
      wrap.setAttribute("aria-hidden", "true");
      var track = document.createElement("div");
      track.className = "nh-topbar-marquee__track";
      for (var c = 0; c < 2; c++) {
        items.forEach(function (t) {
          var span = document.createElement("span");
          span.className = "nh-topbar-marquee__item";
          span.textContent = t;
          track.appendChild(span);
        });
      }
      wrap.appendChild(track);
      usp.parentNode.insertBefore(wrap, usp.nextSibling);
    }

    /* RESILIENS: deploy-pipelinen har vid flera tillfällen korrumperat enstaka
       rader (trunkering, editor-överskrivning, och nu mellanslag runt bindestreck
       så en selektor blev ogiltig). Om EN init kastar fel ska resten ändå köra.
       Vi wrappar därför varje init i try/catch (funktionerna är hoistade, så de
       går att skriva om här innan de anropas). */
    /* ── Review-stjärnor på produktkort ──────────────────────────────
       Plattformens kort har en tom <div class="rating"> men fyller den aldrig,
       och det finns inget rating-API. Betyget ligger bara i varje produktsidas
       JSON-LD (aggregateRating). Vi hämtar därför per kort LAZY (bara när det
       scrollas in), cachar i sessionStorage och har ett hårt tak, så servern
       inte hamras. Produkter utan omdöme får inga stjärnor. */
    var nhRatCache = {};
    var nhRatQueue = [];
    var nhRatActive = 0;
    var nhRatDone = 0;
    var nhRatIO = null;
    var NH_RAT_MAX = 60;
