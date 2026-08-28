
    /* =============================================
		 SLIDESHOW
		 ============================================= */
    function initSlideshow() {
      if (slideshowInitialized) return;
      // .slideshow-component renderas endast i layout/preview-läge, ta bort eller ersätt med 'template-components__slideshow' om du behöver specificiteten
      // Split selector (no descendant-combinator string) — the deploy pipeline
      // has mangled ".template-components__slideshow .slideshow" into an invalid
      // selector; querying in two steps avoids that fragile string.
      var nhSlideRoot = document.querySelector(".template-components__slideshow");
      var wrapper = nhSlideRoot ? nhSlideRoot.querySelector(".slideshow") : null;
      if (!wrapper) return;
      slideshowInitialized = true;

      var whiteTextLock = false;
      function forceWhiteText() {
        if (whiteTextLock) return;
        whiteTextLock = true;
        // Hero-style: dark text on the light overlay (no white, no shadow)
        wrapper
          .querySelectorAll(".slideshow__slides__slide h2")
          .forEach(function (el) {
            el.style.setProperty("color", "#23231d", "important");
            el.style.setProperty("text-shadow", "none", "important");
          });
        wrapper
          .querySelectorAll(".slideshow__slides__slide p:not(.nh-tp-score)")
          .forEach(function (el) {
            el.style.setProperty("color", "#23231d", "important");
          });
        setTimeout(function () {
          whiteTextLock = false;
        }, 100);
      }
      forceWhiteText();
      setTimeout(forceWhiteText, 200);
      setTimeout(forceWhiteText, 600);
      setTimeout(forceWhiteText, 1200);
      setTimeout(forceWhiteText, 2500);

      var textObserver = new MutationObserver(function () {
        forceWhiteText();
      });
      wrapper
        .querySelectorAll(
          ".slideshow__slides__slide h2, .slideshow__slides__slide p:not(.nh-tp-score)",
        )
        .forEach(function (el) {
          textObserver.observe(el, {
            attributes: true,
            attributeFilter: ["style"],
          });
        });

      function forceButtonStyles() {
        wrapper.querySelectorAll(".button.is-primary").forEach(function (btn) {
          btn.style.setProperty("text-decoration", "none", "important");
          btn.style.setProperty("text-align", "center", "important");
          btn.style.setProperty("background", "#D2691E", "important");
          btn.style.setProperty("color", "#ffffff", "important");
          btn.style.setProperty("border-width", "1px", "important");
          btn.style.setProperty("border-style", "solid", "important");
          btn.style.setProperty("border-color", "#D2691E", "important");
          btn.style.setProperty("border-image", "none", "important");
          btn.style.setProperty("border-radius", "2px", "important");
          btn.style.setProperty("box-shadow", "none", "important");
          btn.style.setProperty("padding", "11px 28px", "important");
          btn.style.setProperty("font-size", "0.85rem", "important");
          btn.style.setProperty("font-weight", "600", "important");
          btn.style.setProperty("letter-spacing", "0.1em", "important");
          btn.style.setProperty("text-transform", "uppercase", "important");
          btn.style.setProperty("display", "inline-flex", "important");
          btn.style.setProperty("align-items", "center", "important");
          btn.style.setProperty("justify-content", "center", "important");
          btn.style.setProperty("line-height", "1", "important");
          btn.style.setProperty("cursor", "pointer", "important");
        });
      }
      forceButtonStyles();
      setTimeout(forceButtonStyles, 300);
      setTimeout(forceButtonStyles, 800);

      var slidesWrapper =
        wrapper.querySelector(".slideshow__slides-wrapper") || wrapper;
      if (window.getComputedStyle(slidesWrapper).position === "static") {
        slidesWrapper.style.position = "relative";
      }

      var bar = document.createElement("div");
      bar.className = "nh-progress-bar";
      slidesWrapper.appendChild(bar);

      // Trustpilot block removed — strip any previously injected ones.
      wrapper
        .querySelectorAll(".nh-tp-inline")
        .forEach(function (el) { el.parentNode.removeChild(el); });

      var animFrame = null;
      var startTime = null;

      function startProgress() {
        cancelAnimationFrame(animFrame);
        startTime = performance.now();
        bar.style.transition = "none";
        bar.style.width = "0%";
        (function tick(now) {
          var pct = Math.min(((now - startTime) / DURATION) * 100, 100);
          bar.style.width = pct + "%";
          if (pct < 100) animFrame = requestAnimationFrame(tick);
        })(startTime);
      }

      function markActive(slide) {
        wrapper
          .querySelectorAll(".slideshow__slides__slide")
          .forEach(function (s) {
            s.classList.remove("nh-active");
          });
        slide.classList.add("nh-active");
        forceWhiteText();
        forceButtonStyles();
        var content = slide.querySelector(".slideshow__slides__slide__content");
        if (content) {
          content.style.animation = "none";
          void content.offsetWidth;
          content.style.animation = "";
        }
        startProgress();
      }

      function checkActiveSlide() {
        wrapper
          .querySelectorAll(".slideshow__slides__slide")
          .forEach(function (slide) {
            var t = slide.style.transform;
            if (t === "translateX(0px)" || t === "translate(0px, 0px)") {
              if (!slide.classList.contains("nh-active")) markActive(slide);
            }
          });
      }

      var observer = new MutationObserver(checkActiveSlide);
      wrapper
        .querySelectorAll(".slideshow__slides__slide")
        .forEach(function (s) {
          observer.observe(s, { attributes: true, attributeFilter: ["style"] });
        });

      var pauseBtn = document.getElementById("pause");
      if (pauseBtn) {
        pauseBtn.addEventListener("click", function () {
          var nowPaused = pauseBtn.getAttribute("aria-pressed") === "true";
          if (nowPaused) cancelAnimationFrame(animFrame);
          else startProgress();
        });
      }

      checkActiveSlide();
      setTimeout(checkActiveSlide, 300);

      /* ---- Autoplay (5s) + dot navigators + pause-on-hover (added) ----
         We drive the slide transforms; the observer above then marks the
         active slide, re-runs the entrance animation and restarts the
         progress bar — so autoplay reuses all existing logic. */
      var apSlides = Array.prototype.slice.call(
        wrapper.querySelectorAll(".slideshow__slides__slide"),
      );
      if (apSlides.length > 1) {
        var cur = 0;
        apSlides.forEach(function (s, i) {
          var t = s.style.transform;
          if (t === "translateX(0px)" || t === "translate(0px, 0px)") cur = i;
        });
        function apW() {
          return (
            apSlides[0].getBoundingClientRect().width ||
            slidesWrapper.clientWidth ||
            window.innerWidth
          );
        }
        function apPlace(s, x, animate) {
          s.style.transition = animate
            ? "transform 0.6s cubic-bezier(0.22,1,0.36,1)"
            : "none";
          s.style.transform = "translateX(" + x + "px)";
        }
        // queue every non-active slide just off the right edge
        apSlides.forEach(function (s, i) {
          if (i !== cur) apPlace(s, apW(), false);
        });

        // dot navigators
        var dots = document.createElement("div");
        dots.className = "nh-slider-dots";
        apSlides.forEach(function (s, i) {
          var dot = document.createElement("button");
          dot.type = "button";
          dot.className = "nh-slider-dot" + (i === cur ? " is-active" : "");
          dot.setAttribute("aria-label", "Gå till slide " + (i + 1));
          dot.addEventListener("click", function () {
            apGoTo(i);
            apStart();
          });
          dots.appendChild(dot);
        });
        slidesWrapper.appendChild(dots);
        function apSyncDots() {
          var ds = dots.querySelectorAll(".nh-slider-dot");
          for (var i = 0; i < ds.length; i++)
            ds[i].classList.toggle("is-active", i === cur);
        }

        function apGoTo(n) {
          if (n === cur || n < 0 || n >= apSlides.length) return;
          var w = apW();
          apPlace(apSlides[cur], -w, true); // current exits left
          var incoming = apSlides[n];
          if (incoming.style.transform !== "translateX(" + w + "px)") {
            apPlace(incoming, w, false); // ensure it starts off the right
            void incoming.offsetWidth;
          }
          apPlace(incoming, 0, true); // incoming slides in
          var prev = cur;
          cur = n;
          apSyncDots();
          setTimeout(function () {
            if (cur !== prev) apPlace(apSlides[prev], apW(), false); // requeue right
          }, 650);
        }
        function apNext() {
          apGoTo((cur + 1) % apSlides.length);
        }

        var apTimer = null;
        function apStart() {
          apStop();
          apTimer = setInterval(apNext, DURATION);
        }
        function apStop() {
          if (apTimer) {
            clearInterval(apTimer);
            apTimer = null;
          }
        }
        wrapper.addEventListener("mouseenter", apStop);
        wrapper.addEventListener("mouseleave", apStart);
        document.addEventListener("visibilitychange", function () {
          if (document.hidden) apStop();
          else apStart();
        });
        apStart();
      }
    }
