# MS 2 ml (produkt 261): text före → efter, rad för rad (runda 2)

2026-11-16.
- **Före** = Theme 8 på `origin/dev` (4bb79fc), bilden `shots/before-*.jpg`.
- **R1** = första piloten, `shots/r1-*.jpg`.
- **R2** = den här rundan, `shots/r2-*.jpg`.

Ingen text är ändrad i Nyehandel. Produktbeskrivningens noder **flyttas** i DOM:en; ingenting kopieras eller skrivs om. Maskinell kontroll av varje rad och länk mot serverns HTML: `COVERAGE.md` (`coverage.mjs`). Resultat: **0 rader och 0 länkar saknas**.

## Produktbeskrivningen (Nyehandel)

| # | Befintlig rad | Före | R2: var | R2: läge | Not |
|---|---|---|---|---|---|
| 1 | H3 `Beskrivning av Magic Sauce 3.0 - 2ml` | Dold | Full produktinformation | Dold, som förut | Upprepar bara H1 |
| 2 | H2 `Magic Sauce 3.0 - 2ml Vape från Magic Farmers` | Produktfakta (stängd) | Om-kapitlet, vänster | Öppen | Underrubrik i avsnittet om Magic Sauce |
| 3 | Ingress `…senaste generationen… semisyntetiska… EU-certifierad… varje sats testas… utan behov av påfyllning eller uppladdning.` | Första meningen i "Kort om produkten", hela stycket i Produktfakta (stängd) | Om-kapitlet, vänster | Öppen, ordagrann | ⚑ 6 formuleringar markerade i granskningsläget. Inte lyft till Vad är, specifikationer eller FAQ |
| 4 | H3 `🔬 Vad är Magic Sauce 3.0?` | Produktfakta (stängd) | Om-kapitlet, vänster | **Dold rubrik** (`data-hz8-merged-heading`, kvar i DOM) | Dubblerade H2 "Vad är Magic Sauce 3.0?". Stycket under står kvar, se rad 5 |
| 5 | Stycket `…semisyntetisk cannabinoidblend… naturliga och syntetiska… varje sats… förbättrad stabilitet.` | Produktfakta (stängd) | Om-kapitlet, vänster, direkt efter rad 3 | Öppen, ordagrann | ⚑ 4 markeringar |
| 6 | H3 `🌍 Om Magic Farmers` | Produktfakta (stängd) | Om-kapitlet, höger | Öppen | Emojin är dold som dekor (`hidden`); rubriktexten är oförändrad |
| 7 | Stycket `europeiskt varumärke… lagliga ramar… legala cannabinoidmarknaden… forskning, laboratorietestning…` | Produktfakta (stängd) | Om-kapitlet, höger | Öppen, ordagrann | ⚑ 3 markeringar |
| 8 | H4 `En laglig cannabis:` + stycket (svensk lag, <0,3 % THC, ej för konsumtion, förtrogna leverantör) | Produktfakta (stängd) | **Full produktinformation** | I DOM, bakom klick | ⚑ 4 markeringar. Inte framlyft |
| 9 | `Produktinformation:` + listan (Produkttyp, Tillverkare, 99 %, Blend, Innehållsmängd, Förvaring) | Dold som lista, visad som fakta-/innehållsrader | **Full produktinformation**, hela listan | I DOM, bakom klick | ⚑ 99 %, blend och förvaring. Bara Produkttyp, Tillverkare och Innehållsmängd (som "Volym") syns i Specifikationer |
| 10 | 5 × `LABBTEST <strain>` | En rapport åt gången, efter vald strain | **(a)** Strains och analys → "Labbrapporter": alla fem med exakt länktext, "PDF · hazey.se", ny flik. **(b)** Full produktinformation: på sin ursprungliga plats | Synliga (a), bakom klick (b) | **Ingen döljs (R1 dolde dem).** Inget kopplas till vald strain och inget påstås gälla hela produkten |
| 11 | `Laglighet och ansvar:` + stycket (<0,3 % THC, EU-regelverk, samlarändamål, 18+) | Produktfakta (stängd) | Full produktinformation | I DOM, bakom klick | ⚑ 3 markeringar |
| 12 | Folkhälsomyndigheten + länken | Produktfakta (stängd) | Full produktinformation | I DOM, bakom klick | Ordagrann |

### Kort beskrivning (köpdelen)

Rubriken `Magic Sauce 3.0 - Nästa generation…` (ett **H1** i adminens text), stycket `…senaste versionen av Magic Farmers mest uppskattade formula…`, produktinformationslistan och `Läs mer`.

- **Före:** blocket var dolt i köpdelen. Stycket gav första meningen till "Kort om produkten".
- **R2:** blocket ligger i DOM men är dolt. Meningen **"…senaste versionen av Magic Farmers mest uppskattade formula." visas inte längre.** "Mest uppskattade" är ett obelagt jämförande påstående.

Ersatt av den nya copyn under H2 "Vad är Magic Sauce 3.0?". Säg till om meningen ska tillbaka.

## Länkar som är viktiga för SEO och köp

Alla finns kvar och syns i R2 (`COVERAGE.md` länk 1–34):
- **Brödsmulor:** Hem, Alla produkter, Alla Vapes, produkten.
- **Relaterade kategorier:** Alla Vapes, Alla produkter, Magic Farmers, Magic Sauce, MS Vapes.
- **Tillverkare:** `/sv/brand/magic-farmers` i köpdelen, i Specifikationer och som "Alla produkter från Magic Farmers".
- **5 ml:** i FAQ och i karusellen.
- **Labbrapporter:** alla fem PDF:er.
- **Nya länkar i R2:** Kontakt, FAQ och Köp- och leveransvillkor.

| Länk | Före | R2 |
|---|---|---|
| Nyehandels egen "Liknande produkter" (bl.a. Magic Sauce buds 5 g: Crazy Dog, Donny Burger, Khalifa Kush) | Dold (samma i alla Theme 8-PDP:er) | Dold. Ersatt av "Upptäck fler vapes" med 10 riktiga vapekort |
| "Bästsäljare just nu" | Synlig | Finns inte i piloten. Briefen kräver verifierad försäljningsdata |
| Kapitelnavigering Produkt / Fakta / Liknande | Synlig | Finns inte, eftersom den inte finns i referensen |

## Ny copy

All ny copy ligger i `85c-pdp-content.js`, bara för produkt 261. Inga nya påståenden om laglighet, THC, 99 %, sammansättning eller testning.

- **Vad är Magic Sauce 3.0?:** "Magic Sauce 3.0 – 2 ml är en engångsvape från Magic Farmers. Den finns i {9} strains, bland annat {…}. Du väljer strain och paket i köpdelen ovan."
- **Labbrapporter:** "Det här är de {5} PDF-dokument som finns i produktbeskrivningen i dag. De är namngivna efter strain." Därefter listan och "Ingen egen rapport här för {Tinky Winky, London Lobster, Kowa Bunga och Bruce Banner OG}. Kontakta kundservice om du vill ha underlag." Antal och namn läses live.
- **FAQ "Finns det labbrapporter …?":** samma fakta som ytan, med ankarlänk till den.
- **Specifikationer:** Produkttyp, Tillverkare (länk), Volym och Strains (live).

## Granskningsläge

Lägg till `&hz8-factcheck=1` i adressen. Då markeras 22 befintliga formuleringar gula, med skäl, och Full produktinformation får en streckad ram. Kunden ser aldrig markeringen.

Formuleringarna står i `factcheck` i `85c-pdp-content.js`. Bild: `shots/sections/fc-{393,1440}-04-om.jpg`, där Full produktinformation är öppnad.
