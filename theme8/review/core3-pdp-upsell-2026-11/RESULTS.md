# Task 20: resultat

Körd 2026-11-11 i Theme 8-previewn (`?preview=v9kzdmqz4w60l5n`) med lokal build via `catalog-reconciliation-2026-11/lib/harness.mjs`.
- Varje scenario körs i en egen session med en egen korg, och korgen töms efteråt.
- Ingen order och ingen betalning. Kustom står i testläge.
- Skript: `evidence/ui-upsell.mjs` (`VP=393` / `VP=1920 VH=1080`), `evidence/check-1920.mjs`, `evidence/shot.mjs`.
- Rådata: `evidence/runs/`. Skärmbilder: `evidence/shots/*.jpg`.

## Scenariomatris (paket 263, Core 3-pack)

| # | Scenario | 393 px (Android-Chrome-UA, touch) | 1440 px | 1920 × 1080 |
|---|---|---|---|---|
| S1 | Gelato, Melon Haze, Coconut Cake → `[{425,1},{431,2},{438,3}]`. En rad 1 920 kr, minicart och kassa | PASS | PASS | **PASS** (korg, minicart, kassa) |
| S2 | Gelato × 3. 1 920 kr, servern slår ihop till 425 × 3 | PASS | PASS | – |
| S3 | Strawberry Kush × 2 + Pineapple Express | PASS | PASS | – |
| F1 | Plats 3 tom: inget anrop. "Välj strain för plats 3.", knappen visar "Välj strains för alla platser" | PASS | PASS | – |
| F2 | Otillåtet val (variant 243 på plats 3, manipulerat i nätverket): 406, "Paketvalet godkändes inte av butiken …" | PASS | PASS | – |
| F3 | Lagret slut i servern (23 paket redan i korgen): 406 `available`, korgen oförändrad | PASS | PASS | – |
| F4 | Slutsålt i kortet (simulerat lager i webbläsaren: Melon Haze 0, Coconut Cake 2): Melon Haze "(slut i lager)" kan inte väljas, och efter två Coconut Cake står den som "(inga fler i lager)". Inget anrop | PASS | PASS | – |
| R1 | Vanlig singelprodukt via orange knappen: variant 425, 1 st, 675 kr, inget paket. Kortet ligger kvar orört | PASS | PASS | – |
| R0 | Utan flagga: inget kort, inget anrop till pilotsidan, registret `{}` | PASS | PASS | – |
| E1 | Kortet → minicart → "Ändra" → plats 3 byts till Pineapple Express → "Spara val": ny rad 425/431/433 för 1 920 kr, den gamla raden borttagen | PASS | PASS | – |

**Hela matrisen: 20/20.** Den kördes på builden före två rent visuella ändringar:
- vågräta 3-platsfack på desktop;
- räknaren dold och ingressens text.

**På slutbygget är S1 och F1 omkörda vid 393 och 1440, och S1 vid 1920. Alla är PASS.** Inga konsolfel och inget horisontellt överflöd på PDP, i minicart eller i kassan.

## Visuell kontroll per bredd

### 393 px
- Kortet är hopfällt till en rad direkt under den orange knappen: tre bilder, "Bygg ditt 3‑pack", 1 920 kr, ~~2 025 kr~~, Spara 105 kr och "Välj strains". Det tar ett tryck att öppna.
- 5 platser visas som 3 + 2.
- Stickybaren gäller fortfarande bara 1 st.
- `scrollWidth` = 393.

### 1440 px
- Kortet är öppet. Storleksvalet visas bara när det finns flera storlekar.
- 3 platser sitter i ett tråg med vågräta fack.
- Totalpris och besparing står en gång, i kortets huvud.

### 1920 × 1080 (faktisk skala)
- Hela kortet ryms i första vyn. Kortets underkant ligger på 892 px före kompakteringen och 784 px efter.
- Köpkolumnen är 613 px och galleriet 566 px, så det tomma bandet under bilden är litet.
- Rubrik, ingress och strainnamn går på 1 rad. Strainbilden i facket är 52 × 64 px.
- Inget överflöd. Inga sticky-element i konflikt: stickybaren är av på desktop och headern är fast.
- Minicarten visar paketet med tre strains, "Ändra" och totalt 1 920 kr.

## Status per pakettyp

| Pakettyp | Visuellt | Tekniskt köpklart | Blockerat |
|---|---|---|---|
| **Core 3-pack (263, 1 920 kr)** | Färdig för granskning | **Ja, i förhandsvisning:** PDP, korg, minicart, "Ändra" och kassa vid 393, 1440 och 1920 | <ul><li>Lagerdrag vid genomförd order är inte bevisat (ingen order fick läggas).</li><li>Paketets namn i admin är "PILOT T19 – …" och det saknar bild i minicart och kassa.</li><li>Kassan står i testläge.</li><li>Publikt kräver det merge till `dev` och ett beslut om att flaggan ska bort.</li></ul> |
| **Core 5-pack** (pris 3 135 kr ur produkt 162, `HZ-CORE-5PK`) | Visas spärrat i granskningsläget | **Nej** | <ul><li>Ingen paketartikel med 5 olåsta rader av 255 finns.</li><li>162 är en vanlig, ej köpbar produkt (`is_package=false`).</li></ul> |
| **Magic Sauce 3.0 – 5 ml** (260; 3-pack 2 950 kr ur 166, 5-pack 4 450 kr ur 169) | Visas spärrat i granskningsläget | **Nej** | <ul><li>Inga paketartiklar.</li><li>Yoda Ice Cream har 4 i lager, så den räcker inte till 5 av samma. Kortet spärrar då plats 5 för den.</li></ul> |
| Magic Sauce 3.0 – 2 ml (261; 145 / 147) | I registret (granskningsläget) men inte avbildad | Nej | Bara 2 strains finns i lager. |
| Separata buds- och haschfamiljer (MS50, Core buds/hasch, D10) | Visas inte | Nej | Plattformen stöder inte separata produkter per paketrad (Task 19). Det kräver ett beslut om datamodell eller en leverantörsändring. |
