
    function nhSafe(fn) {
      return function () { try { return fn.apply(this, arguments); } catch (e) {} };
    }
    initSlideshow = nhSafe(initSlideshow);
    initCardRatings = nhSafe(initCardRatings);
    initTopbarMarquee = nhSafe(initTopbarMarquee);
    initAllCards = nhSafe(initAllCards);
    initReadMore = nhSafe(initReadMore);
    initCategoryPage = nhSafe(initCategoryPage);
    initKampanjer = nhSafe(initKampanjer);
    initProductSections = nhSafe(initProductSections);
    initAllProducts = nhSafe(initAllProducts);
    initBsListing = nhSafe(initBsListing);
    initUspBars = nhSafe(initUspBars);
    initHeroRotator = nhSafe(initHeroRotator);
    initSlideshowButtons = nhSafe(initSlideshowButtons);
    initTabs = nhSafe(initTabs);
    initFaq = nhSafe(initFaq);
    initTrustpilot = nhSafe(initTrustpilot);
    initPdpVariant = nhSafe(initPdpVariant);
    initVariantBoxes = nhSafe(initVariantBoxes);
    initPdpRating = nhSafe(initPdpRating);
    initPdpReviewCta = nhSafe(initPdpReviewCta);
    initPdpShortDesc = nhSafe(initPdpShortDesc);
    initBulkPricing = nhSafe(initBulkPricing);
    initCheckout = nhSafe(initCheckout);
    initCartSwish = nhSafe(initCartSwish);
    initFooter = nhSafe(initFooter);
    initHeaderScroll = nhSafe(initHeaderScroll);
    window.nhInitCards = initAllCards;

    new MutationObserver(function () {
      initSlideshow();
      initTopbarMarquee();
      initAllCards();
      initCardRatings();
      initReadMore();
      initCategoryPage();
      initKampanjer();
      initProductSections();
      initAllProducts();
      initBsListing();
      initUspBars();
      initHeroRotator();
      initSlideshowButtons();
      initTabs();
      initFaq();
      initTrustpilot();
      initPdpVariant();
      initVariantBoxes();
      initPdpRating();
      initPdpReviewCta();
      initPdpShortDesc();
      initBulkPricing();
      initCheckout();
      initCartSwish();
    }).observe(document.body, { childList: true, subtree: true });

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", function () {
        initSlideshow();
        initAllCards();
        initReadMore();
        initCategoryPage();
        initKampanjer();
      });
    } else {
      initSlideshow();
      initAllCards();
      initCardRatings();
      initReadMore();
      initCategoryPage();
      initKampanjer();
      initProductSections();
      initAllProducts();
      initBsListing();
      initUspBars();
    }

    setTimeout(function () {
      initSlideshow();
      initTopbarMarquee();
      initAllCards();
      initCardRatings();
      initReadMore();
      initCategoryPage();
      initKampanjer();
      initProductSections();
      initAllProducts();
      initBsListing();
      initUspBars();
      initHeaderScroll();
      initHeroRotator();
      initSlideshowButtons();
      initTabs();
      initFaq();
      initTrustpilot();
      initPdpVariant();
      initVariantBoxes();
      initPdpRating();
      initPdpReviewCta();
      initPdpShortDesc();
      initBulkPricing();
      initCheckout();
      initCartSwish();
    }, 500);
    setTimeout(function () {
      initSlideshow();
      initAllCards();
      initKampanjer();
      initSlideshowButtons();
      initPdpVariant();
      initVariantBoxes();
      initPdpRating();
      initPdpReviewCta();
      initPdpShortDesc();
      initBulkPricing();
      initCheckout();
      initCartSwish();
    }, 1500);

    /* ── Custom Footer ── */
    function initFooter() {
      if (document.querySelector(".nh-footer")) return;
      var existing = document.querySelector(".page-footer");
      if (!existing) return;

      var footer = document.createElement("footer");
      footer.className = "nh-footer";
      footer.innerHTML =
        '<div class="nh-footer__disclaimer">' +
        "<p>Du måste vara minst 18 år för att handla på Hazey.se. Våra produkter är avsedda för samlings- och prydnadsändamål. Förvaras oåtkomligt för barn. Vi uppmanar inte till användning eller konsumtion av produkterna.</p>" +
        "</div>" +
        '<div class="nh-footer__inner">' +
        '<div class="nh-footer__grid">' +
        '<div class="nh-footer__brand-col">' +
        '<img class="nh-footer__logo" src="https://d3dnwnveix5428.cloudfront.net/store_183a511a-0ded-44c9-829d-21099b0158f9/images/mini-header-hazey-49d6a763.webp" alt="Hazey">' +
        '<p class="nh-footer__tagline">Lagliga cannabinoider — labbtestat, diskret skickat från Sverige.</p>' +
        "</div>" +
        '<div class="nh-footer__col">' +
        "<h3>Kundservice</h3>" +
        "<ul>" +
        '<li><a href="/sv/page/kontakt">Kontakta oss</a></li>' +
        '<li><a href="/sv/page/faq">Vanliga frågor</a></li>' +
        '<li><a href="/sv/page/kop-och-leveransvillkor">Köp &amp; Leveransvillkor</a></li>' +
        '<li><a href="/sv/page/integritetspolicy">Integritets- &amp; cookiepolicy</a></li>' +
        '<li><a href="/sv/page/kontakt">Bli återförsäljare</a></li>' +
        "</ul>" +
        "</div>" +
        '<div class="nh-footer__col">' +
        "<h3>Utforska</h3>" +
        "<ul>" +
        '<li><a href="/sv/categories/alla-produkter">Butik</a></li>' +
        '<li><a href="/sv/page/vara-bastsaljare">Bästsäljare</a></li>' +
        '<li><a href="/sv/page/kampanjer">Kampanjer</a></li>' +
        '<li><a href="/sv/categories/alla-produkter">Alla produkter</a></li>' +
        '<li><a href="/sv/page/kontakt">Kontakt</a></li>' +
        "</ul>" +
        "</div>" +
        '<div class="nh-footer__col">' +
        "<h3>Populära kategorier</h3>" +
        "<ul>" +
        '<li><a href="/sv/categories/thca">THCA</a></li>' +
        '<li><a href="/sv/categories/alla-vapes">Vapes</a></li>' +
        '<li><a href="/sv/categories/blommor-buds">Buds</a></li>' +
        '<li><a href="/sv/categories/hasch">Hasch</a></li>' +
        '<li><a href="/sv/categories/cbd-group">CBD</a></li>' +
        '<li><a href="/sv/categories/magic-sauce">Magic Sauce</a></li>' +
        "</ul>" +
        "</div>" +
        '<div class="nh-footer__nl-col">' +
        "<h3>Nyhetsbrev</h3>" +
        "<p>Få <strong>10%</strong> på ditt första köp — plus drops, nyheter och exklusiva erbjudanden.</p>" +
        '<form class="nh-footer__nl-form" id="nh-nl-form">' +
        '<input type="email" placeholder="Din e-post" name="email" autocomplete="email" required>' +
        '<button type="submit" aria-label="Prenumerera">→</button>' +
        "</form>" +
        '<p class="nh-footer__nl-ok" id="nh-nl-ok" style="display:none">Välkommen! Din rabattkod: <strong>testahazey10</strong></p>' +
        '<div class="nh-footer__contact">' +
        '<a href="mailto:Hej@hazey.se">Hej@hazey.se</a>' +
        '<a href="mailto:Butik@hazey.se">Butik@hazey.se</a>' +
        "</div>" +
        "</div>" +
        "</div>" +
        '<div class="nh-footer__trust">' +
        '<span class="nh-footer__trust-item">Säker betalning</span>' +
        '<span class="nh-footer__trust-item">Diskret frakt</span>' +
        '<span class="nh-footer__trust-item">Skickas från Sverige</span>' +
        '<span class="nh-footer__trust-item">Labbtestade produkter</span>' +
        '<span class="nh-footer__trust-item">18+ åldersgräns</span>' +
        "</div>" +
        "</div>" +
        '<div class="nh-footer__bottom">' +
        '<div class="nh-footer__pay">' +
        '<span class="nh-footer__pay-label">Trygg betalning</span>' +
        '<span class="nh-footer__pay-chip nh-footer__pay-chip--logo"><img src="https://www.hazey.se/wp-content/uploads/2023/04/Swish-Logo-Secondary-Light-BG.png" alt="Swish" loading="lazy"></span>' +
        "</div>" +
        '<p class="nh-footer__copy">© Hazey.se 2026 · Stockholm, Sweden</p>' +
        "</div>";

      existing.parentNode.insertBefore(footer, existing);
      existing.style.display = "none";

      var form = document.getElementById("nh-nl-form");
      if (form) {
        form.addEventListener("submit", function (e) {
          e.preventDefault();
          var ok = document.getElementById("nh-nl-ok");
          if (ok) ok.style.display = "block";
          form.querySelector("button").disabled = true;
        });
      }
    }
