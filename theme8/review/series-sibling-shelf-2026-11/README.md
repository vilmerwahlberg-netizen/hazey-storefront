# TASK 25b/25c – D10-rutan på Magic Sauce buds- och hasch-PDP

## 25c – korrigering: samma komponent och kort som D10 vape-rutan
25b använde PDP:ns stora "Fler i serien"-kort inne i rutan. Nu används hubbens egen D10-ruta i sin helhet: ruta, rail och kort.

- **Rail:** PDP-rutan använder hubbens rail (`hz8-sh-shelf hz8-sh-shelf--sub`), samma `shMore` och samma `decorateCards`. PDP-korten och PDP:ns egna kortregler för rutan är borttagna.
- **CSS:** hubbens kortregler är skrivna för kategorisidan (`[data-hz8-page="category"] … .hz8-sh`). Bygget ger varje sådan kortselektor en PDP-gren, `:is(<hubbprefix>, :where(html.hz8.hz8-pdp-pilot #store-main .hz8-pp-sibling))`. Det rör 127 selektorer i `80-category.css`, `81-series-hub.css` och `96-product-media.css`, och logiken ligger i `theme8/tools/scope-sibling-cards.js` som anropas från `build-theme8.js`.
  - `:where()` ger ingen specificitet, så hubbens regler är exakt som förut.
  - Kontrollerat: om PDP-grenarna tas bort ur bygget blir källfilerna byte-identiska.
  - Nya kortregler för hubben följer automatiskt med till PDP-rutan.
- **Tokens:** hubbens tokens (`--hz8-pilot-*`) gäller också i `.hz8-pp-sibling`.
- **Kortuppställning som vape-korten:** vape-korten har produktlinjen som överrad och strainen som titel. Buds- och haschkorten följer katalogens tredelade namn, "D10 50% – Porn Star OG – 5g", och visas därför med överraden "D10 50% · 5g" och titeln "Porn Star OG". Hela namnet ligger kvar i bildens alt-text och i `data-hz8-product`. Andra namnmönster lämnas orörda. Utan uppdelningen kortades namnen av på mobil ("White Widow…").
- **Ta bort i 25b-CSS:en:** PDP-specifika regler för lagerrad, Slutsåld, chips och etiketter. Hubbens regler gäller nu.

### Jämförelse (`evidence/compare.mjs`, `compare-393.json`, `compare-1440.json`)
Facit är hubbens "Fler vapes från Magic Farmers". Buds- och hasch-rutan vid 393 och 1440 klarar alla kontroller:
- samma rail
- samma kortbredd, radie och bakgrund (vid 393 är PDP:ns innehållsyta 8 px bredare, vilket ger 100 mot 98 px med samma kolumnformel)
- samma bildyta (radie, gradient och proportion)
- samma kolumngap
- samma typografi för överrad, titel, pris och lager
- samma Slutsåld-knapp
- inga storleks-chips
- fyra kort ryms på desktop: alla fyra syns helt, och facit visar fem
- mobilraden kan svepas med touch (CDP)
- hela bilder: `object-fit: contain` och bilden ryms i bildytan
- inga överlappande etiketter
- inga avkortade namn
- produkter, priser, lager och köpknapp stämmer med D10-kategorierna
- öppna och stäng fungerar
- rutan skyms inte av den fasta kapitelraden
- kortlänken öppnar rätt PDP

Uppmätt vertikal rytm för ett slutsålt kort: identisk vid 1440. Vid 393 är bildytan 2 px högre, eftersom kolumnen är 2 px bredare.

Bilder (`evidence/shots/`):
- `C-sida-vid-sida-{393,1440}.jpg`: de tre rutorna sida vid sida
- `C-<ruta>-narbild-*.jpg`: närbild av varje ruta
- `C-<ruta>-helsida-*.jpg`: hela sidan; den fasta headern och kapitelraden syns mitt på sidan, vilket är normalt för helsidesbilder
- `C-<ruta>-svept-393.jpg`: mobilraden efter svep

Funktionstesterna (`ui-sibling.mjs`) gav 8/8 vid 393 och 8/8 vid 1440. Hubbens regression är oförändrad: en D10-rad, "Fler vapes".

## 25b (ursprunglig leverans)

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
