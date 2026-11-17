# THCbA 47 % – Faraoh – 2 ml (produkt 236): kartläggning och innehållspost (2026-11-17)

Gren: `feat/theme8-herocore-pdp`. Lokal build, inte mergad till dev. Ingen adminändring.

## Riktig Nyehandel-data (`map.json`)

| Område | Läst värde |
|---|---|
| Produkt | id 236, "THCbA 47% - Faraoh - 2ml", Faraoh, `/sv/products/thcba-vape-faraoh-2ml` |
| Varianter | 8 strains à 745 kr, **alla slutsålda** (lager 0; JSON-LD OutOfStock): Cranberry Frost Cream, M.A.C., Super Lemon Haze, Sour Candy Strawberry, Peach Pizzazz, Lemon Skunk, Juicy Blueberry, Florida Kush |
| Bilder | 16 galleribilder, en förpackningsbild per strain |
| Paket | 3-pack: produkt 272, 2 076 kr. 5-pack: produkt 273, 3 319 kr. Kan inte väljas när lagret är 0 |
| Omdömen | 0, så inga betyg visas |
| Intyg | **Ingen PDF.** Texten säger "Labbrapport skickas på begäran. Maila hej@hazey.se" |
| Produkttyp och förvaring | "Laddningsbar vape – CCELL", "Kylskåp under 5°C" |
| Titel | `Faraoh THCbA Vape 2ml %%sep%% Lagligt alternativ till THCA Sverige` |
| Meta | "… %%sep%% det lagliga alternativet efter THCA-förbudet. Full spectrum live resin med 47% THCbA. Samma aura, fortfarande lagligt i Sverige." |
| Rubriker | H3 Beskrivning av …, H2 Faraoh THCbA Vape 2ml – …, H3 Vad är THCbA?, H3 Faraoh Signature Live Resin Blend™, H3 Vad är Full Spectrum Live Resin?, H3 CCELL-enhet, H3 Viktig förvaringsinformation, H3 En laglig cannabis |
| Kategorier | Alla Vapes, Alla produkter, Faraoh, THCbA, THCbA Vapes (bara den här produkten) |

## Efter

Egen copy (post 236). Den säger inget om THCbA, halter, rättsläge eller THCA. Produkttyp och förvaring visas ordagrant via två nya generella tokens, `{typelabel}` och `{storage}`.
- **Kort svar:** märke, volym och strains, plus lagerläget live. Snabbfakta visar "Laddningsbar vape – CCELL".
- **Strains och lagerläge:** 3 + 3 + 2. Labbpanelen säger att rapport saknas i produkttexten och länkar till kundservice.
- **Om:**
  - vänster: inledningen och "Vad är THCbA?"
  - höger: "Vad är Full Spectrum Live Resin?", "Viktig förvaringsinformation", bild och specifikationer (typ, tillverkare, innehåll, förvaring, strains)
  - Full produktinformation: Signature Blend, CCELL-enhet, laglighet, produktinformation och ansvar
- **Sex FAQ:** strains, engångsvape eller inte, förvaring, labbrapport, paketpriser, leverans och retur.

## Kontroller

- **Struktur:** en H1 och ingen sidledsscroll vid 393, 1440 och 1920.
- **Text och länkar:** alla nyckelrader i DOM. Ingen produkttext tappas (`COVERAGE.md`). Inga trasiga länkar.
- **Slutsålt:** ingen köpknapp och inga paketkort. "Bevaka" visas. Klick på en slutsåld strain ändrar inget och ger 0 px scrollhopp.
- **Övrigt:** FAQ fungerar med tangentbordet. Inga betyg visas, men omdömesfixturen fungerar.
- **Karusell:** 10 vapes; Faraohs THC-B 1 ml står först.
- **Regression** mot D10-committen (aec98a2): MS 2 ml, Hero's Core, D10, MS 5 ml och en buds-PDP är 0 % ändrade (`shots/regress/`).

## Bilder

- Före → efter: `shots/jamforelse/fore-efter-{393,1440,1920}.jpg`
- Sektionsutsnitt: `shots/sections/efter-*`
- Köpdelen: `shots/check/kop-*.jpg`
