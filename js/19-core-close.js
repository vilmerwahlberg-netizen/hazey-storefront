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
    initHeaderV2();
    initHomepageV2();

    /* Flash-of-native-theme-guard (§8, Mästeruppdrag 2026-09-09, se
       STATUS.md/slutrapporten + blocks/loader-dev.html för rotorsaken):
       loadern satte klassen "nh-boot" på <html> SYNKRONT innan hazey.css/
       hazey.min.js ens började laddas, för att täcka gapet mellan
       Nyehandels egen DOMContentLoaded-baserade FOUC-guard (native,
       "this fixes Flash of Unstyled Text" -- gör body synlig igen OAVSETT
       om vår reskin hunnit bli klar) och att sidan faktiskt är
       färdigombyggd. All boot-logik ovan körs SYNKRONT (vanliga DOM-
       mutationer, inget async/await) -- när nhBoot() når hit är headern/
       startsidan/produktsektionerna redan i sitt slutgiltiga DOM-skick,
       så det är säkert att ta bort klassen HÄR, som allra sista steget. */
    document.documentElement.classList.remove("nh-boot");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", nhBoot);
  } else {
    nhBoot();
  }
</script>
