
    /* ── Slideshow: render TWO branded buttons per slide ──
       The native slideshow component only renders one .action button.
       This swaps each slide's action area for two buttons (THCA outline +
       BÄSTSÄLJARE fill). Edit SLIDE_BTNS to change text/links. */
    function initSlideshowButtons() {
      var SLIDE_BTNS = [
        { text: "THCA", url: "/sv/categories/thca", cls: "nh-hero__btn--outline" },
        { text: "BÄSTSÄLJARE", url: "/sv/page/vara-bastsaljare", cls: "nh-hero__btn--fill" }
      ];
      var html = SLIDE_BTNS.map(function (b) {
        return '<a class="nh-hero__btn ' + b.cls + '" href="' + b.url + '">' + b.text + "</a>";
      }).join("");
      var slides = document.querySelectorAll(".slideshow__slides__slide");
      Array.prototype.forEach.call(slides, function (slide) {
        if (slide.__nhBtns) return;
        var content = slide.querySelector(".slideshow__slides__slide__content > div") ||
                      slide.querySelector(".slideshow__slides__slide__content");
        if (!content) return;
        var action = slide.querySelector(".action");
        if (!action) {
          action = document.createElement("div");
          action.className = "action";
          content.appendChild(action);
        }
        action.innerHTML = html;
        slide.__nhBtns = true;
      });
    }
