    initFooter();
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
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", nhBoot);
  } else {
    nhBoot();
  }
</script>
