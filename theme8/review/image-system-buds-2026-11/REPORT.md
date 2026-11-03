# TASK 17B – bildsystem, PDP-media och Alla Buds-filter

- Datum: 2026-11-03. Branch `audit/task-17-catalog-reconciliation` (worktree `../hazey-storefront-task17`), byggt ovanpå Task 17:s HEAD `f0ac3be`. Ingenting har återställts eller skrivits över.
- **Ingen push, publicering, adminändring eller ändring av produktdata.** Verifieringen gjordes i Theme 8-previewen med lokal build via harness (`lib/harness.mjs`). Före = build av `f0ac3be`.
- Läge enligt `hazey-commerce-design`: Systemize/Refine inom vald riktning (R2B rekommenderad, R2A som fallback). Inga nya visuella koncept har tagits fram.
- Frysta områden är orörda: header, footer, kategorihero, putskant, quiz-UI, köpflöde, priser, lager, paketregister, minicart, checkout, startsidans continuous canvas, admin, produktionstema och loader. *Not:* Alla Buds-quizet läser seriernas lista ur samma väljare och visar därför Core när Core har buds. Det är data, inte en ändring av quiz-UI:t.

## 1. Bildsystemet

**Nya filer:** `theme8/js/03a-product-media.js` (klassificerare) och `theme8/css/96-product-media.css` (behandling, sist i ordningen).

**Klassning ur bildens egna pixlar.** Nyehandels CDN skickar `Access-Control-Allow-Origin: *`. Bilden läses i 128 × 128 och klassas så här:

| Typ | Regel | Behandling (kort) | PDP desktop |
|---|---|---|---|
| `transparent` | minst 50 % av kantringen genomskinlig | direkt på kortets yta | **R2B**: direkt i Faraoh-scenen, låg kontaktskugga, ingen andra bildruta |
| `white` | jämn kant (p90-avvikelse ≤ 16), alla kanaler > 236 | kanten tonas ut **inom uppmätt marginal** | **R2A**: samma tonzon och scenens slöja i bildens kantton |
| `embedded` | jämn kant i annan ton (t.ex. Magic Sauce-beige) | som `white` | **R2A** |
| `environment` | ojämn kant | hel bild, rundade hörn, ingen mask | hel, rundad, låg skugga |
| `unverified` | kunde inte läsas | originalet orört | originalet orört |

**Tonzonen** räknas per sida: produktens bounding box (pixlar som avviker > 30 från kanttonen) minus 1,2 % säkerhetsavstånd, högst 12 %. Den rör aldrig produktpixlar. Når produkten kanten tonas den sidan inte, och det gäller de flesta Magic Sauce-påsarna upptill och till höger. Ingen produkt friläggs, ritas om eller genereras.

**Borttaget**, i alla kortsammanhang och på PDP:n:
- mörkare beige/bruna bildbrunnar, korn, inre skuggor och kantlinjer (03, 07, 80, 81, 85, 87 och startsidans 30/40);
- `mix-blend-mode: multiply`, som ändrade produktens färger mot scenen;
- `clip-path`-beskärning av en "etikettremsa" (gamla bilder) och överskalning till 108–134 %, som kapade förpackningar på startsidan, i Bästsäljare-rälsen och i Butik;
- spotlightens elliptiska mask över produkten;
- PDP:ns oskarpa "eko" av bilden bakom den skarpa, en brun slöja;
- den ljusa ringen och skuggan runt bildkvadraten (en andra bildruta);
- PDP:ns egen hörnkontroll och det mörka `immersive`-läget, som stängde av den botaniska scenen.

**Behållet:** Faraohs scen (sand, fiber, solfält och den godkända botaniska ljus-/skuggassetten `pdp-media-light-shadow-runtime-v1.webp`), summary-växten, kolumnproportionerna och bildens storlek (`--pp-top-h`, oförändrad). Mobilens komposition är oförändrad. Där är bara den konstgjorda brunnen ersatt med bildens egen kantton.

**Specificitet:** kontextreglerna har specificitet upp till (1,6,1). `:not(#hz8-media)` höjer med ett id utan att kräva klassning, så systemet gäller redan innan bilden är läst, och det blir ingen blinkning.

## 2. PDP desktop mot facit

Jämförelse: `review/01-pdp-r2a-r2b-vs-faraoh-1440.jpg` (facit composite-r, koncept R2A/R2B, låst Faraoh-kontroll, Yoda R2A före/efter, CBN Yellowstone R2B före/efter) och `review/02-pdp-media-classes-1440.jpg` (vit studio, miljöbild, Faraoh, MS 2 ml).

- **Faraoh (låst kontroll):** facitprodukten (gamla id 57) finns inte efter migreringen. Kontrollen är dagens *THCbA 47% – Faraoh – 2ml*. Den är en miljöbild och renderas oförändrad, med samma kolumner, scen och bildtyngd.
- **R2B:** 6 kundlistade riktiga packshots (CBN Yellowstone, CBN Malibu Skittelz, H4CBD+CBN H-Bomb, H4CBD Kusher Kush, CBN Great White Shark och nyckelringen). Yellowstones etikettremsa ("CBN+ 40% – 5g") ingår i originalbilden och står kvar.
- **R2A:** 49 + 3 kundlistade. Yoda: bildkvadratens kant möter scenens slöja i samma kantton (rgb 216,194,173). Det finns ingen ram och inget lager ovanpå produkten.
- **Galleri, zoom och strainbyte** (MS pre-roll med 6 bilder, Yoda med 3, CBD pre-roll med 4 och CBN med 1, vid 393 och 1440): varje steg visar en av produktens egna bilder ur `product/state`. 0 främmande bilder, scenens klassning följer alltid den aktiva bilden och zoom öppnas. Har produkten en bild visas en.
- **Begränsning (oförändrad, Task 17-blockerare 1):** produkter utan varumärke (bl.a. alla Magic Sauce-vapes, carts och batterier) får ingen universell PDP och därmed ingen R2A/R2B-scen. Korten och miniatyrerna följer ändå bildsystemet.

## 3. Alla Buds

**Nuläge före (reproducerat mot previewen, build `f0ac3be`):** serieväljaren visade Magic Sauce, D10 och Nano-11, men inte Core. Ingen viktdimension fanns (`Volym (dold)`) och ingen Pre-rolls-typ. Före Task 17:s rättade routes visades bara Nano-11, eftersom de andra seriernas buds-routes var tomma.

**Efter:**
- **Serier** härleds ur verkligt kategorimedlemskap: seriens hubb plus alla dess serie × format-routes (`seriesMemberRoutes`), i snitt med sidans eget underlag. Kandidater är upptäckbara serier med hubb eller route. Legacy (THCV, HHCPM, THCNM) är aldrig kandidater. 0 träffar = serien döljs (befintlig logik). Resultat: **Magic Sauce, Core, D10, Nano-11**. THCaB och THCbA döljs, eftersom de saknar buds. D10 och 10-OH-THC hålls isär (D10-hubben `d10-1`), och THCaB och THCbA är separata.
- **Vikt** under Alla filter (och dockan) på breda gram-sidor, med den befintliga namnparsern `cardWeight` och samma `?volym=`-state: **1 g (7), 3,5 g (8), 5 g (45), 10 g (1), 15 g (1)**. 2 produkter utan vikt i namnet klassas inte (Great White Shark med viktvarianter, Fraktändring).
- **Pre-rolls under Produkttyp: BLOCKERAD.** Ingen Pre-rolls-kategori finns i Nyehandel (`pre-rolls`, `prerolls`, `pre-roll`, `alla-pre-rolls`, `pre-rolled` ger 404). Typen hade bara kunnat gissas ur namnet, och det görs inte. Se adminlistan.

**Filtertest** (`buds-filter.mjs`). Förväntad mängd är hämtad live ur Nyehandels kategorisidor i samma körning. **Alla steg PASS vid 1440 och 393**:

| Steg | Förväntat | Visat | Dubbletter |
|---|---:|---:|---:|
| Serie Magic Sauce | 19 | 19 | 0 |
| Serie Core | 4 | 4 | 0 |
| Serie D10 | 4 | 4 | 0 |
| Serie Nano-11 | 21 | 21 | 0 |
| Vikt 3,5 g | 8 | 8 | 0 |
| Vikt 5 g | 45 | 45 | 0 |
| Magic Sauce + Nano-11 + 5 g | 34 | 34 | 0 |
| Omladdning av `?serie=magic-sauce,nano-11&volym=5g` | 34 | 34 | 0 |
| Bakåt från PDP | 34 | 34 | 0 |

0 konsolfel och 0 px överflöd. Bilder: `review/06-alla-buds-filter-1440.jpg`, `review/07-alla-buds-filter-393.jpg` (filterarket öppet och resultatet efter varje filter).

**Regression** (`regress-filters.mjs`): **Alla Vapes** är identisk före/efter (serier, Produkttyp Vapes/Carts/Refill, Volym 1/2/5 ml, 48 kort). **Allt Hasch** får samma härledning: Nano-11 tillkommer (*Zkittlez Mousse* via hubben) och Vikt 1 g (3), 5 g (14), 15 g (1), 100 g (1). 19 kort, oförändrat.

## 4. Verifiering (`verify.mjs`, `cls.mjs`)

| Sida | 320 | 393 | 430 | 1440 | 1920 | 200 % | Beskurna bilder | Fel | Överflöd |
|---|---|---|---|---|---|---|---:|---:|---:|
| Startsida | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **0** (före: 4) | 0 | 0 |
| Alla Buds | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 |
| Yoda-PDP (inbakad beige) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | 0 | 0 | 0 |
| Bästsäljare | – | ✓ | – | ✓ | ✓ | ✓ | 0 | 0 | 0 |

Utöver tabellen är vit studio (H4CBD), miljöbild (batteri), frilagd (CBN), Faraoh, MS 2 ml, Alla Vapes och Allt Hasch fotade vid 393 och 1440 (`capture.mjs`). Alla har 0 fel och 0 överflöd. Köpknappar och produktlänkar finns i samma antal före och efter på varje sida. Relaterade produkter och PDP-miniatyrer klassas och visas hela (`review/04-closeups-pdp-yoda.jpg`).

**Layoutskift:** Alla Buds, PDP och Bästsäljare har CLS 0–0,002. Startsidan har CLS 0,24–0,77 **både före och efter**. Källan är densamma i båda byggena: feedbacksektionen `hz8-fb__sheet` vid scroll (`cls.mjs`, tre körningar per build). Det är ett befintligt fel och inte orsakat av bildsystemet.

## 5. Granskningspaket (`review/`)

| Fil | Innehåll |
|---|---|
| `01-pdp-r2a-r2b-vs-faraoh-1440.jpg` | Facit, koncept, Faraoh-kontroll, R2A och R2B före/efter |
| `02-pdp-media-classes-1440.jpg` | PDP per bildtyp, före/efter |
| `03-pdp-mobile-393.jpg` | PDP mobil, före/efter |
| `04-closeups-{home,buds,bestsellers,pdp-yoda}.jpg` | Närbilder på kortens bildytor, 393 och 1440, före/efter |
| `05-fullpage-{home,buds,vapes,hasch,bestsellers,pdp-yoda}.jpg` | Fullsidor 393 och 1440, före/efter |
| `06/07-alla-buds-filter-*.jpg` | Filterarket öppet och resultat per filter |
| `08-regression-vapes-hasch-bestsellers.jpg` | Regression, första vyn |
| `MEDIA-LISTS.md` | Bildtyp per produkt, vilka som saknar säker friläggning (A) och riktiga sekundära bilder (C) |

Råa skärmdumpar (`shots/`) och facitkopior (`facit/`) committas inte. De genereras med `capture.mjs`, `buds-filter.mjs` och `sheets.sh`.

## 6. Produkter som saknar säker friläggning eller riktiga sekundära bilder

Se `MEDIA-LISTS.md`. Kortversion för de 77 kundlistade:
- **71 saknar säker friläggning** (49 inbakad bakgrund, 3 vit studio, 14 miljöbild, 5 utan bild). Bara 6 är riktigt frilagda.
- **65 saknar riktiga sekundära bilder** utöver strainbilderna. 48 har en enda bild.
- **5 saknar bild helt:** 197 `buds-nanno-11-critical-berries`, 234 `d10-hash-blue-diamond-5g`, 196 `magic-sauce-hash-charas-5-gram`, 191 `nano-buds-ersatt-thca-bubba-kush-5g`, 220 `thcv-vape-cbd-group-2ml`.
- Rättelse till Task 17:s `PRODUCT-IMAGE-AUDIT.md`: de "transparenta" bilderna där hade "fyllnad 98 %" på grund av ett mätfel. Alfakanalen visar att 50–88 % av ytan är genomskinlig, så de är riktiga packshots.

## 7. Kräver admin eller migrering (inte gjort)

1. **Skapa kategorin Pre-rolls** (förslag `pre-rolls`) med *Magic Sauce 50% – Pre Rolls – 1g* (257), *7% Nano11 – Prerolled – 1 gram* (165) och *CBD – Cookies – 1g* (258). Behåll Buds- och Hasch-medlemskapen. Därefter läggs routen in i headern (05-header.js, Buds → FORMAT "Pre-rolls"), och produkttypen kan läggas till på Alla Buds och Allt Hasch.
2. **Frilagda original (PNG med alfa, ≥ 1 600 px)** för de 71 kundlistade utan säker friläggning, med prioritet på Magic Sauce, Nano-11 och D10 (de inbakade beige påsarna). Theme 8 visar dem då automatiskt i R2B, utan kodändring.
3. **Bilder till de 5 listade produkterna utan bild**, och riktiga sekundärbilder (baksida/etikett, storleksreferens, miljö) enligt `MEDIA-LISTS.md` C.
4. **Varumärke** (Task 17-blockerare 1): utan det får 71 produkter ingen universell PDP och ingen R2A/R2B-scen.
5. **Dölj paket och strainbarn** (Task 17, `NYEHANDEL-VISIBILITY-ACTIONS.md`): Core-buds på Alla Buds är i dag High Life-buds och High Life-paket, som WooCommerce bara visar i sök. När de döljs i Nyehandel försvinner Core från Alla Buds automatiskt, eftersom det härleds ur data.
6. *Isolat – CBD 99% – 15 gram* ligger i `blommor-buds` i Nyehandel och ger alternativet "15 g" på Alla Buds. Ta bort det ur Buds, eftersom det är olistat i WooCommerce.

## 8. Commits

1. `feat(theme8): data-driven product media system and PDP R2A/R2B stage (TASK 17B)`: `03a-product-media.js`, `96-product-media.css`, `85-pdp-pilot.js` plus bildgranskningen (`capture.mjs`, `pair.mjs`, `verify.mjs`, `cls.mjs`, `media-audit.mjs`, `lists.mjs`, `sheets.sh`, `MEDIA-LISTS.md`, `review/01–05, 08`, `runs/`).
2. `feat(theme8): derive Alla Buds series and weight from catalog data (TASK 17B)`: `80-category.js` plus `buds-filter.mjs`, `regress-filters.mjs`, `review/06–07`, `runs/buds-filter-*`, `runs/regress-filters-*` och denna rapport.

Ingen push.
