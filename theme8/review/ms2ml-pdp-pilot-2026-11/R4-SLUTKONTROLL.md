# R4: visuell slutrunda, hela MS 2 ml-sidan (2026-11-17)

Allt är lokalt: ingen commit, push, merge, adminändring eller utrullning.

## Bilder

| Vad | Fil |
|---|---|
| Facit → R3 → R4, hela sidan | `shots/r4-jamforelse/mobil-facit-r3-r4.jpg`, `shots/r4-jamforelse/desktop-facit-r3-r4.jpg` |
| Helsidor till footern | `shots/r4-393.jpg`, `shots/r4-1440.jpg`, `shots/r4-1920.jpg` |
| Papper och växt | `shots/etapp1/r4-{393,1440}-pappersskarv.jpg`, `shots/etapp1/r4-{393,1440}-sida-vid-sida.jpg` |
| Strain-grupp 1, 2, 3 | `shots/r4-strains/r4-{1440,393}-grupp-{1,2,3}.jpg` |
| Labbrapporter, Om, FAQ, karusell, avslut | `shots/sections/r4-{393,1440,1920}-0{3,4,5,6,7}-*.jpg` |

## Vad som ändrats

- **Växten.** Det levererade fotografiska utklippet ersätter de kodritade bambukvistarna. Den sitter vid arkets två nedre hörn, aldrig över text. Kastskuggan är separat, varm och mycket svag (opacitet 0,16), med samma ljusriktning. Bedömning: klart bättre än R3, som såg målad ut. Ursprunget står i `assets/pdp-ms2ml-2026-11/README.md`.
- **Pappret.** Arket är tunnare, med finare och mindre regelbunden kant och mjukare skugga under. Ytan är varmare och mindre vit, och arket ligger något mer indraget från fönsterkanten.
- **Ljuset.** Det fortsätter nedåt: svaga varma ljusfält till vänster vid Strains, Om och FAQ, och en djupare ton till höger. Bakom köpinformationen är ytan oförändrat lugn.
- **Strains.**
  - Exakt tre hela kort per grupp (1–3 → 4–6 → 7–9), med pilarna direkt före och efter korten.
  - Antal, bilder, namn och lager kommer från varianterna. Ofullständiga sista grupper fylls med dolda celler (kodväg; den här produkten har nio, så den är inte provad med riktiga data).
  - Korten är genomskinliga. Förpackningen står direkt i scenen med en mjuk kontaktskugga, och bilden är orörd.
  - Kontroll (`strains-test.mjs`, 1440 och 393):
    - Tre synliga kort i varje grupp.
    - Pilarna är avstängda vid början och slutet.
    - Klick väljer strain i köpdelen med 0 px scrollhopp.
    - Klick på slutsåld strain ändrar inte valet.
    - Markeringen ligger kvar vid bläddring.
    - Piltangent vid gruppkant byter grupp, och Enter på pilen fungerar.
    - Svep på mobil byter grupp.
    - Ingen sidledsscroll.
- **Labbrapporter.** Alla fem riktiga PDF-länkarna finns kvar i en kompaktare panel. Den tomma ytan under strainraden på desktop är borta. Inget gemensamt intyg påstås.
- **Om-uppslaget.**
  - Läsbar spalt (60ch, 16 px, radavstånd 1,72) och tydligare rubriker.
  - Produktförpackningen upprepas inte. I stället används stämningsbilden `knowledge-hub/kustljus-*.webp`, med känt ursprung enligt dess README (Vilmer 2026-11-16, illustrativ, ingen produkt).
  - Texten är fortfarande ordagrann. Ingen obelagd formulering är lyft till fakta.
- **FAQ.** Samma sex frågor i låga rader (46 px) direkt på sidan, med linjer i stället för kort. Svaren och tangentbordet fungerar.
- **Upptäck fler vapes.**
  - Egna små produktkort: bild, namn, varumärke, riktigt pris och orange pil.
  - Fem syns direkt på 1440, sex på 1920 och 2,5 på mobil.
  - THCA-B/THCaB är bortfiltrerat bara i den här karusellen (`C.more.exclude`); katalogen är orörd.
  - `&amp;` är avkodat.
  - **Obs:** "THCbA 47% - Faraoh - 2ml" och "Vape - THC-B 35% - Faraoh - 1ml" visas. De är andra produkter än THCaB enligt namn och katalog. Säg till om även de ska bort.
- **Avslut.** Kategorier och kundservicekort ligger i samma glasmaterial och ljus. Inga trygghetslöften dupliceras.

## Produktdata och SEO, slutkontroll

Underlag: `seo.mjs` → `seo.json`, `coverage.mjs` → `COVERAGE.md` (0 rader och 0 länkar saknas), `check.mjs` → `check.json`, briefen, `TEXT-DIFF.md` och gamla Woo-sidan.

| Kontroll | Serverns HTML (utan JS) | Efter JavaScript (pilot) | Kommentar |
|---|---|---|---|
| H1 | **2:** "Magic Sauce 3.0 - 2ml" + "Magic Sauce 3.0 - Nästa generation …" (kort beskrivning) | 1 | Extra H1 ska bort i admin |
| Titel | "Magic Sauce 3.0 Vape 2ml - Magic Farmers Cannabinoidblend" | samma | Magic Sauce 3.0, vape, 2 ml och Magic Farmers finns. Samma som Woo |
| Meta | "…engångsvape 2ml … Semisyntetisk … EU-certifierad industrihampa. Testad i oberoende laboratorier." | samma | Obelagda påståenden, se nedan |
| Canonical | `hazeyse.nyehandel.se/sv/products/vape-magic-sauce-magic-farmers-2ml` | samma | Byts vid domänflytt (Woo: hazey.se/produkt/…) |
| Robots | `noindex, nofollow` | samma | Globalt, känt |
| Produkttext | Hela texten (rubriker, stycken, lista, labblänkar, laglighet, källa) | Samma noder, flyttade: öppen eller i "Full produktinformation" | Inget tappat |
| "engångsvape" | Meta, text, produktinformationslista | + "Vad är …", Specifikationer, FAQ | – |
| Strainnamn | Bara i labblänkarnas text (5 av 9). Övriga fylls i av Vue | Alla 9 synliga (köpdel + strainmodul + FAQ) | Fyra strainnamn kräver JavaScript |
| Interna länkar | Kategorier (Alla Vapes, Magic Sauce, MS Vapes, Magic Farmers), varumärke, brödsmulor, 5 ml (Nyehandels lista) | + karusellens produktlänkar, Kontakt, FAQ, villkor | Inga tappade |
| Frågesvar | Inga | 6 | Bara efter JavaScript |
| Omdömen | Ingen aggregateRating | Ingen betygsrad, ingen sektion | Woo har 4,69/40. Kräver import |
| Synlighet utan JS | Ingenting (`<body style="visibility:hidden">`, Nyehandel, även på tema 3) | – | Plattformsrisk |

Ingen påstår att den visuella ändringen i sig höjer ranking.

### Framtida adminändringar (inte gjorda)

1. **Kort beskrivning, extra H1.** Byt `<h1>` "Magic Sauce 3.0 - Nästa generation av Magic Farmers semisyntetiska cannabinoidblend" till stycke eller H2, eller ta bort den efter beslut. Ta också ställning till "mest uppskattade formula".
2. **Produktbeskrivningens rubriker.** Den börjar med H3 "Beskrivning av …" och sedan H2 → H3 → H4 med emoji. Ordna nivåerna (H2 för huvudrubrik, H3 för avsnitt) och ta bort emojin om den inte ska synas.
3. **Söktexter i serverns HTML** (efter godkänd copy):
   - det korta svaret "Vad är Magic Sauce 3.0?"
   - de sex produktfrågorna med svar
   - en mening med alla strainnamn

   Då finns de utan JavaScript.
4. **Produktnamn.** "Magic Sauce 3.0 - 2ml" → "Magic Sauce 3.0 – 2 ml", om beslutet tas. Det påverkar H1, brödsmulor, varukorg och kassa.
5. **Meta description.** Ta bort eller verifiera "Semisyntetisk cannabinoidblend", "baserad på EU-certifierad industrihampa" och "Testad i oberoende laboratorier".
6. **Strukturerade data (Product.description).** Byggs ur produktbeskrivningen och innehåller samma obelagda påståenden. Ändras automatiskt när texten i punkt 7 ändras.
7. **Obelagda påståenden i produkttexten** (markeras med `&hz8-factcheck=1`, lista i `R3-GRANSKNING.md` §3):
   - sammansättning och semisyntetisk
   - EU-certifierad industrihampa
   - laboratorieprocesser
   - varje sats testas
   - laddning
   - förbättrad stabilitet
   - europeiskt varumärke och lagliga ramar
   - forskning och testning
   - svensk lag
   - <0,3 % THC
   - laglig cannabinoidupplevelse
   - 99 %
   - förvaring
   - "Avsedd för … Ej för konsumtion"
8. **Omdömen.** Importera de 40 Woo-omdömena som är matchade SÄKER till produkt 261 (reviews-recovery, importväg ej beslutad).
9. **Labbrapporter.** Identifiera det dokument som ska gälla för hela produkten. Flytta PDF:erna från `www.hazey.se/wp-content/…` före domänbytet.
10. **Vid domänbytet:** 301 från `/produkt/vape-magic-sauce-magic-farmers-2ml/`, canonical till hazey.se och borttagen global noindex.

## Kvarvarande skillnader mot facit

**D** = avsiktligt (riktig data eller regel). **F** = designfel eller kvarvarande avvikelse.

| # | Skillnad | Typ |
|---|---|---|
| 1 | Ingen betygsrad, ingen "Visa omdömen", ingen "Kundomdömen"-rad eller -sektion (0 importerade omdömen) | D |
| 2 | Fem namngivna PDF:er i "Labbrapporter" i stället för ett "Gemensam analys"-dokument | D |
| 3 | H1 "Magic Sauce 3.0 - 2ml" i stället för "– 2 ml" (Nyehandels produktnamn) | D (admin) |
| 4 | Om-kapitlet är ordagrann, längre produkttext, inte facits korta texter | D (väntar på faktagranskad copy) |
| 5 | Sex FAQ-frågor i stället för fyra, med längre rubrik | D (riktiga frågor) |
| 6 | Karusellen visar riktiga produkter från flera varumärken, inte påhittade Magic Farmers-namn | D |
| 7 | Växten bara vid arkets nedre hörn och mindre än i facit. Facit har även blad uppe till vänster, nere till höger nära footern och lövskuggor över papperet | F (medvetet sparsamt; kan utökas) |
| 8 | Arket är bredare och rakare än facits, som har tydligare rivna kortsidor | F |
| 9 | Mobilens första del är fortfarande ~1,2× facit: läsbar typografi och lagerraden | F |
| 10 | Strainkorten på mobil är små (~95 px), facit har större bilder med två och ett halvt kort | F (följer kravet på exakt tre) |
| 11 | Om-bilden är en solbelyst kust utan palmer, inte facits solnedgång med palmer | D (bild med känt ursprung) |
| 12 | "Full produktinformation" är en extra rad som facit saknar | D (vägen till full produktinformation) |
| 13 | Ingen ikonbaserad trygghetsrad före footern (inte duplicerad, enligt uppdraget). Footern är Theme 8:s globala, inte facits | D |
| 14 | Ljuset är lugnare och mindre aprikosmättat än facit | F (avvägning för läsbarhet) |
| 15 | Kodvägen för en sista strain-grupp med färre än tre är inte provad med riktiga data (produkten har nio) | Test saknas |
