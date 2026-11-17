# MS 2 ml-PDP-pilot (SEO först)

2026-11-16 · worktree `../hazey-storefront-ms2ml` · gren `feat/theme8-ms2ml-pdp-pilot` · bas `origin/dev` 4bb79fc.
Allt är lokalt. Inget är committat, pushat eller mergat. Nyehandel-admin är inte rörd. Testkorgen är tömd: testet tar bort exakt de rader det själv lade till.

## Kod

- `theme8/js/85c-pdp-content.js`: författat innehåll per produkt-id. Bara 261 har en post. En ny vapeprodukt får en egen post; ingen text delas mellan produkter.
- `theme8/js/85d-pdp-chapters.js`: generiska kapitel i ordningen Vad är → Strains och gemensam analys → Om produkten → FAQ → Upptäck fler → Kundomdömen → kategorier/service.
- `theme8/css/85c-pdp-chapters.css`: kapitlens stil.
- `theme8/js/85-pdp-pilot.js`, små krokar:
  - `authored()` och `kit()`.
  - Köpytans trygghetsrad kan bära en länk.
  - Betygsraden faller tillbaka på hämtade omdömen.
  - `reviewsHtml` tar en rubrik.
  - Produkter utan innehållspost får exakt samma flöde som förut.

## Runda 2 (2026-11-16)

- Produkttexten delas vid sina egna rubriker. "Om Magic Sauce" och "Om Magic Farmers" visas öppet i två spalter; resten ligger i originalordning i "Full produktinformation". Den dubbla rubriken "Vad är …?" är dold.
- Labbrapporterna: alla fem PDF:er listas exakt, och ingen döljs. Inget gemensamt intyg påstås.
- Granskningsläge: `&hz8-factcheck=1`.
- Ljus och ytor är förfinade. Dekorbilden är bara `pdp-media-light-shadow-runtime-v1.webp`, och bara på desktop.
- Dokument: `TEXT-DIFF.md` (radvis), `COVERAGE.md` (maskinell täckning), `SEO.md` (rå HTML, utan skript, renderad).

## Granska

```
cd ../hazey-storefront-ms2ml && CI=1 node build-theme8.js
node theme8/review/ms2ml-pdp-pilot-2026-11/shot.mjs final      # helsidor 393/1440/1920 -> shots/
node theme8/review/ms2ml-pdp-pilot-2026-11/check.mjs           # köp, länkar, tangentbord, H1, overflow, omdömesfixtur
SECTIONS=1 node theme8/review/ms2ml-pdp-pilot-2026-11/shot.mjs r2 393 1440               # + närbilder i shots/sections/
QS=hz8-factcheck=1 OPEN=1 SECTIONS=1 node theme8/review/ms2ml-pdp-pilot-2026-11/shot.mjs fc 393 1440
node theme8/review/ms2ml-pdp-pilot-2026-11/seo.mjs             # A/B/C-jämförelse
node theme8/review/ms2ml-pdp-pilot-2026-11/coverage.mjs        # radvis täckning -> COVERAGE.md
```

- Före → R1 → R2: `shots/before-{393,1440}.jpg`, `shots/r1-{393,1440,1920}.jpg`, `shots/r2-{393,1440}.jpg`. Närbilder: `shots/sections/`.
- Kontrollresultat: `check.json`. Textjämförelse: `TEXT-DIFF.md`.
