# Omdesign etapp 1: produktbild, köpyta och övergången till "Vad är …?" (2026-11-17)

- **Läge:** Redesign. R2-stilen är inte facit.
- **Facit:** `ms-2ml-seo-first-{desktop,mobile}-v2.png`.
- **Ändrade filer:**
  - `theme8/css/85e-pdp-stage-authored.css` (ny; bara `html.hz8-pdp-authored`, dvs. produkter med författat innehåll).
  - `85-pdp-pilot.js`: sätter klassen.
  - `85d-pdp-chapters.js`: lägger till ljuslagret och två dekorlager i bandet.
- **Rörs inte:** FAQ, karusell, Om-kapitlet och footer. Inte heller priser, lager, köplogik, analysdokument, påståenden eller SEO-text.

## Gest i referensen → befintlig komponent/asset → hur den byggs → mobil

| Gest i facit | Befintlig komponent / asset | Hur den byggs | Mobil (393) |
|---|---|---|---|
| Varm ljuskälla uppe till vänster, ljusare mitt, djupare aprikoskanter | `#store-main` (tidigare jämnt blekbeige) | Nytt lager `.hz8-pcx-light` först i `#store-main`: ljuskägla 16 %/10 %, en ljusare mitt och djupare kanter till höger och nere till vänster | Egen fördelning: kägla överst till vänster, kanter längre ned |
| Bladskuggor över sidan och scenen | `landing-engangsvape/leaf-shadow-1600.webp` (bara skugga i alfa, inga cannabisblad; används redan på landningen) | `multiply` cirka 0,34 uppe till höger, maskad mot mitten | `leaf-shadow-800.webp` i scenen och på sidan |
| Produktscen: varm kortyta med lövskugga och kastskugga | `.product-detail__media` + `pdp-media-light-shadow-runtime-v1.webp` (README: bara desktop) | Ljusare mitt, djupare kantvinjett, mjukare kastskugga; kompositen 0,62 → 0,78 | Kompositen används inte (README). Bladskugga ur `leaf-shadow-800`. **Miniatyrerna ligger som kolumn till vänster i scenen**, som i facit, i stället för en egen rad |
| Skarp produktförpackning | Nyehandels slider-bild | Orörd: samma `currentSrc`, opacitet 1, ingen blandning. Den befintliga mjuka `drop-shadow`-kastskuggan från Faraoh-scenen ligger kvar | samma |
| Köpkontroller i glas | `.hz8-pc` (paket), `.hz8-pp__tile` (strain), `.hz8-pp__qty` | Varm halvtransparent yta, `backdrop-filter: blur(14px) saturate(1.3)`, 1 px ljuskant, inre toppreflex, varm inre bottenton och kontrollerad skugga. Valt paket: olivgrön kant + bock. Vald strain: orange kant + bock. Slutsåld: dovare glas med texten "Slut" | Samma material. Strains i 114 px (nästa syns). Paketkorten är lägre (80 px) |
| Tre strains i linje med paketkorten | Strainkarusellen | Kolumnbredd = (raden − 2 mellanrum) / 3 på desktop | Svepbar, ett kort syns delvis |
| Rubrik och köpknapp i facits skala | H1 + `.hz8-pp__cta` | H1 `clamp(38px, 3.15vw, 48px)` på desktop. Knappen djupare orange med toppljus och varm skugga | H1 28 px. Trygghetsraden på en rad, ikon före text |
| Papperskapitel: eget lager med riven kant, fiberyta och skugga mot sidan | `#hz8-pcx-sum` (tidigare en platt remsa) | `.hz8-pcx-sum__paper`: SVG med `feTurbulence` och `feDisplacementMap` som mask ger riven kant runt om. Fiber + fläckighet + ljus från vänster. Kastskuggan är samma form, mörk, flyttad och oskarp | Egen SVG-proportion (400 × 420), papperet i nästan full bredd |
| Ljus och bladskuggor över skarven | `leaf-shadow-1600/800` | `.hz8-pcx-sum__shade` under texten över skarven, maskat upp- och nedåt | samma, `leaf-shadow-800` |
| **Skarpa gröna blad över papperets hörn** | **Saknas.** Plantutklippet är cannabis och används inte här | **Inte byggt.** Se nedan | – |

## Saknat dekorlager

Det som saknas är ett **frilagt, skarpt, grönt bladverk utan cannabisblad** (t.ex. bambu- eller pilliknande, motljus från vänster), som PNG eller WebP med alfa:
- cirka 1200 × 900 för desktophörnen
- cirka 600 × 450 för mobilen

Jag genererade ett utkast i Canva: media-id `MAHbHyXQy5A`, "Open generated image" → https://www.canva.com/M/MAHbHyXQy5A. Verktyget lämnar bara ut en förhandsvisning på 199 × 150 px utan alfa. Den går inte att använda, och jag laddar inte ned originalet utan inloggning.

Lagret är reserverat: papperets hörn och mobilens övre hörn står utan dekor över text. Det är inte ersatt med en gradient.

## Granskningsbilder

Alla ligger i `shots/etapp1/`:
- `e1-1440-sida-vid-sida.jpg` och `e1-393-sida-vid-sida.jpg`: facit och resultat, toppen till och med pappersbandet.
- `e1-{1440,393}-forsta-vyn.jpg`: första vyn, 1440 × 900 och 393 × 852.
- `e1-{1440,393}-kopkontroller.jpg`: närbild på köpkontrollerna.
- `e1-{1440,393}-pappersskarv.jpg`: närbild på pappersskarven.

**Teknisk not om bilderna:** `backdrop-filter` ritas inte utanför vyn i Playwrights fullPage-läge. Utsnitten tas därför med en vy som är lika hög som utsnittet. Skriptet kontrollerar att layouten är densamma (bandets y-läge).

## Kontroller

- `check.mjs` vid 393, 1440 och 1920: en H1, ingen sidledsscroll och inga trasiga länkar. Strainval och köp fungerar: 1 st lades i varukorgen och togs bort. Ingen betygsrad (inga riktiga omdömen).
- Produktbilden: samma `currentSrc`, opacitet 1, ingen `mix-blend-mode` (`etapp1.mjs` → `e1.json`).
