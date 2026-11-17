# D10 2 ml (produkt 254): kartläggning och innehållspost (2026-11-17)

Gren: `feat/theme8-herocore-pdp`. Lokal build, inte mergad till dev. Ingen adminändring.

## Riktig Nyehandel-data (`map.json`)

| Område | Läst värde |
|---|---|
| Produkt | id 254, "D10 - 2ml", Magic Farmers, `/sv/products/d10-vape-magic-farmers` |
| Varianter | 5 strains à 595 kr, **alla slutsålda** (lager 0; JSON-LD OutOfStock): Cherry Sour (421), Lemon Cheese (424), Cotton Candy (426), Maui Mango (427), Kiwi Sorbet (428) |
| Bilder | 12 galleribilder, en förpackningsbild per strain plus en gruppbild |
| Paket | 3-pack: produkt 270, 1 655 kr. 5-pack: produkt 271, 2 618 kr. Kan inte väljas när lagret är 0 |
| Omdömen | 0 i Nyehandel, så inga betyg visas |
| Intyg | 5 PDF:er, "LABBTEST <strain>", en per strain och alla svarar 200. Läst: Cherry Sour är en rapport från "Cannabis Analysis" för "Disposable Vape-pen – Cherry Sour – 99% D10", batch 1999_C7I3N4R8, 2026-06-15, D10 99,3 %, Δ9-THC n.d. **Labbets adress är densamma som kundens** (GB Czech s.r.o., 28. října 770/6, Ostrava) |
| Titel | `D10 Vape 2ml %%sep%% Magic Farmers Egenutvecklad Cannabinoidformula` |
| Meta | "… ett steg upp från Magic Sauce … Laglig i sverige." |
| Rubriker | H3 Beskrivning av …, H2 D10 – 2ml Vape från Magic Farmers, H3 Vad är D10?, H3 D10 eller Magic Sauce, H3 Om Magic Farmers, H3 En laglig cannabis. Ingen extra H1 |
| Kategorier | Alla Vapes, Alla produkter, D10, D10 Vapes (bara den här produkten), Magic Farmers |

## Efter

Egen copy i `85c-pdp-content.js` (post 254). Inget från MS- eller Hero-posten, och ny copy säger inget om vad D10 är.
- **Kort svar:** typ, märke och strains, plus lagerläget live ("Just nu är alla strains slutsålda").
- **Strains och labbrapporter:** 3 + 2, där sista gruppen fylls ut. Det är första provet med riktig data. Alla fem rapporterna listas.
- **Om:**
  - vänster: "D10 – 2ml Vape från Magic Farmers" och "Vad är D10?" (egen sektion så att rubriken syns)
  - höger: Om Magic Farmers, bild och specifikationer
  - Full produktinformation: "D10 eller Magic Sauce", laglighet, produktinformation, labbtest och ansvar
- **Sex FAQ:** strains, labbrapporter, slutsålt, paketpriser, märke, leverans och retur.

## Kontroller (`shots/check/check.json`, `COVERAGE.md`, `shots/regress/`)

- **Struktur:** en H1 och ingen sidledsscroll vid 393, 1440 och 1920.
- **Text och länkar:** inga nyckelrader saknas, ingen produkttext tappas och inga trasiga länkar.
- **Slutsålt:**
  - ingen köpknapp och inget antal
  - inga paketkort
  - Nyehandels "Bevaka" visas
  - klick på en slutsåld strain ändrar inget och ger 0 px scrollhopp
- **Övrigt:** FAQ fungerar med tangentbordet. Inga betyg visas, men omdömesfixturen fungerar.
- **Köp:** kunde inte provas, eftersom inget finns i lager. Köpflödet är samma kod som i MS och Hero.
- **Regression:** MS 2 ml, Hero's Core, MS 5 ml och Faraoh THCbA är 0 % ändrade.

## Bilder

- Före → efter: `shots/jamforelse/fore-efter-{393,1440,1920}.jpg`
- Sektionsutsnitt: `shots/sections/efter-*`
- Köpdelen: `shots/check/kop-*.jpg`
