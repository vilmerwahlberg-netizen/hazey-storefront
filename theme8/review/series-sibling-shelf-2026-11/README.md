# TASK 25b – D10-rutan på Magic Sauce buds- och hasch-PDP

Gren `fix/task25-series-variant-shelf`. Lokal build mot Theme 8-preview. Inga korgar, inget i Nyehandel ändrat.

## Vad som byggdes
- **Samma komponent som D10-raden på Magic Sauce-hubben** (`shMore` i `81-series-hub.js`): en hopfälld ruta med rubrik, D10-märke, en produktbild och "Upptäck D10-serien från Magic Farmers.". Den öppnas och stängs med en knapp (`aria-expanded`).
- **Ny delad funktion** `HZ8.pdpSiblingShelves({ series, format, exclude })`. `85-pdp-pilot.js` anropar den direkt efter "Fler i serien".
- **Konfigurationen** ligger i `SERIES_PILOTS["Magic Sauce"].siblings`: `{ D10, buds, on: ["pdp"] }` och `{ D10, hasch, on: ["pdp"] }`. Hubbens befintliga vapes-rad gäller fortfarande bara hubben.
- **Produkterna i rutan:**
  - De kommer från D10-seriens egen formatkategori (`d10-buds`, `d10-hash`) via katalogkartan.
  - De måste ha samma tillverkare som Magic Sauce-produkterna i formatet.
  - Produkttypen i namnet måste matcha formatet.
  - Flerpack och paketartiklar tas bort, oavsett enhet.
  - Produkter som redan ligger i Magic Sauce-kategorin tas bort.
  - Ett kort per faktisk produkt, eller per variant om D10 har strainval.
- **Lager:** hämtas från D10-kategorins egen "I lager"-lista. Slutsålda kort har ingen köpknapp, utan en inaktiv "Slutsåld"-yta.
- **Format:** bestäms av produkttypen i namnet, annars av produktens formatkategori. Pre-rolls som ligger i MS Buds/MS Hash får därför ingen ruta.

## Produkter som visas (live 2026-11-12)
| PDP | Kort |
|---|---|
| Magic Sauce buds, t.ex. Grape Gasoline, Tinky Winky | D10 50 % Porn Star OG (I lager), White Widow (Slutsåld), Cosmic Trip (Slutsåld), Skywalker OG (Slutsåld). Alla 5 g. |
| Magic Sauce hasch, t.ex. KitKat, Dubai Chocolate | D10 60 % Purple Storm (I lager), Rosinella (I lager), Blue Diamond (Slutsåld), Silk Road (Slutsåld). Alla 5 g. |

Alla 8 har en egen produktbild (p104–p111), och ingen bild saknas. Priserna är D10-kategorins egna, med jämförpris.

## Test (`evidence/ui-sibling.mjs`, 393 + 1440)
B1/B2 är buds-PDP:er och H1/H2 hasch-PDP:er. Varje scenario kontrollerar:
- rubrik
- stängd från början, öppna och stäng
- exakt samma produkter som D10-kategorin, med rätt namn och pris
- att alla bilder laddats
- lagerrad
- att inga vapes, carts, pack eller pre-rolls finns med
- horisontell scroll: touchsvep vid 393; vid 1440 får alla 4 kort plats, så listan scrollar inte
- att kortlänken öppnar rätt PDP
- att sidan inte scrollar i sidled
- att rutan ligger direkt efter "Fler i serien"

Resultat: 4/4 godkända vid 393 och 4/4 vid 1440.

Kontrollscenarier N1–N4, alla godkända:
- **Vape-PDP:** ingen ny ruta.
- **Pre-rolls:** ingen ruta.
- **D10 buds-PDP:** ingen ruta. D10 har ingen konfiguration.
- **Charas** (hasch som ligger i MS Buds): visar "Fler hasch". Formatet kommer från produktens kategori "Allt Hasch".

Hubbens regression (`hub-regression.mjs`): Magic Sauce-hubben har fortfarande exakt en D10-rad, "Fler vapes", efter Vapes. Inga nya rader.

## Felplaceringar i katalogen (adminstädning)
- `ms-buds` innehåller **Charas** och **Marrakesh Dream**, som är hasch. Den innehåller också **Pre Rolls 1 g**.
- `ms-hash` innehåller **Pre Rolls 1 g**. Den syns därför i "Fler i serien" på hasch-PDP:n. Det är befintligt beteende och ändras inte här.
- `m-s-buds` är tom, och `m-s-hash` svarar 404. Gamla routes.
