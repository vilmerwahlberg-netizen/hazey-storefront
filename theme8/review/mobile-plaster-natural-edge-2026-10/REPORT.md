# TASK 01D-R3 — naturlig mobil putskant i full bredd

- **Bas:** `dev` vid `1c3b4e3`.
  - "Före" = `git archive 1c3b4e3` + build.
  - "Efter" = arbetskopian.
  - Harnessen (`lib.mjs`, `T01DR3_BASE`) injicerar respektive build i den
    riktiga Theme 8-previewn.
- **Facit:** vänsterpanelen i
  `storefront-task-system/ready-for-claude/task-01d-r3-natural-plaster-edge/references/reference-before-after.png`.
- **Asset:** `theme8/assets/category-vapes-hero-2026-10/category-mobile-plaster-edge-v3.webp`.
  - Kopierad oförändrad ur uppgiften: 1800 × 750, riktig alfa, 217 kB.
  - Kantprofil: y 129 längst till vänster, lägst ≈468 vid x≈1200, ≈400
    längst till höger. Helt opak från y 494.
- **Visuella rundor:** 1. Runda 1 följde facit och behölls.
- **Commit:** lokal, inte pushad. Nyehandel-admin är orörd.

## Ändring (`theme8/css/80-category.css`, bara `max-width: 767px`)

En delad regel för `hz8-cat-pilot` (Alla Vapes, Alla Buds, Allt Hasch, Alla
produkter):

```css
.hz8-cat-hero__plaster::before {
  height: 42vw;
  background:
    linear-gradient(180deg, transparent calc(100% - 34px), var(--hz8-pilot-shop)),
    url(".../category-mobile-plaster-edge-v3.webp")
      50% calc(100% + min(34.5vw - var(--hz8-mplaster-gap) + 50px, 15.67vw - 49px)) / 100% auto no-repeat;
}
```

- **Hela silhuetten visas.** Bilden ligger i `100% auto`, centrerad. Den gamla
  beskärningen (200 % bredd, förankrad till höger) är borta. Resultatet följer
  facit: högst till vänster, en bred sluttning och lägst i mitten/höger, utan
  upprepade lika stora kullar.
- **Endast den vertikala förskjutningen är räknad.** Konturens vänstra topp
  (7,17vw ned i bilden) landar ungefär 50 px under guidekortet. Det andra
  ledet i `min()` håller den lägsta zonen (26vw ned) minst 20 px ovanför
  hyllans 29 px överlapp. Vid 320 px och 200 % zoom är det det ledet som
  styr.
- **Sömmen mot butiksytan är oförändrad:** samma 34 px gradient i
  kalkton → `--hz8-pilot-shop`.
- **Ingen geometri är ändrad.**
  - `--hz8-mplaster-gap`, guide, hylla, antal och grid är exakt som i
    `1c3b4e3`. Vid 393: hero 682, guide 506, hylla 653 på formatsidorna;
    portalen 576 / 429 / 576.
  - Ingen JS är ändrad (bundlens JS och checkout-CSS är byte-identiska före
    och efter).
- **Inga tillägg:** ingen SVG-mask, procedursprickor, brus, vit gradient, dimma
  eller bloom.

## Verifiering (`run.sh`, `runs/*.json`)

| Test | Resultat |
|---|---|
| Geometri 320/393/430/200 %, fyra familjer + filtrerade/sökta lägen (`shoot-*`) | oförändrad, 0 överflöd, 0 fel |
| Träffytor (`taps-after.json`): CTA/sök, första flik, Filter & sortera | ok på alla fyra vid 320/393/430/720z |
| Beredskap (`ready-*`): cold, warm, Fast 3G (Vapes/portal) + cold (Buds/Hasch) | 0 ramar med gammal fade, 0 ramar med foto utan kant |
| Laddningsordning (`loadorder-*`): foto vs v3-puts | 0 / 2 / 0 ms isär (cold/warm/Fast 3G), före avmaskning |
| Pixeldiff (`diff.json`): desktop 1440/1920 för alla fyra, Magic Sauce-hubb, M&S Vapes, THCaB Vapes, startsida, PDP | 0 px, utom Hasch 1920 kant 493 px (0,06 %, inne i ett produktkort, x 1459–1695, dynamiskt innehåll) |
| 01E-dockan (`verify-after-…`) | rad + docka samtidigt 0 (skanning 0/55, snabb 0/109) |
| Funktionssvit base vs after | 14/15 identiska; `home-quick-add` skiljer bara i svarstid; `allavapes-mobile-sort` fallerar likadant i båda (01G ersatte knappen) |
| Sök / kassa | sök desktop + mobil i funktionssviten identiska; checkout-CSS byte-identisk |

## Bilder (`proof/`)

- `compare-393-reference-before-after-{alla-vapes,buds,hasch,alla-produkter}.jpg`:
  facit | före (v2, 200 %) | efter (v3), samma utsnitt.
- `after-320-393-430-zoom200.jpg`: alla fyra familjer efter.

## Kvarstående skillnader mot facit

- Facit har en äldre UI under kanten (Filter | Sortera-fält). Livesidan
  behåller 01G:s flikar och "Filter & sortera", så putsytan under den lägsta
  punkten är ≈25 px vid 393, mot facits ≈40 px.
- **Alla produkter:** konturen ligger 29 px högre relativt sökfältet än på
  formatsidorna, eftersom hyllan där inte överlappar heron.
- **Kantskuggan** är assetens egen och något mörkare än i facit.
- **Vid 200 % zoom (720 CSS-px)** är silhuetten större (300 px hög bild).
  Vänstertoppen ligger då strax under guidekortet.

Råa utsnitt (`runs/shots`) och `run.log` ligger kvar lokalt.
