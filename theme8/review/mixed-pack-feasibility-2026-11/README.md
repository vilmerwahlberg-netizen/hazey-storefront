# Task 19: blandbara flerpack i Nyehandel (version 2)

2026-11-06 · worktree `../hazey-storefront-task19`, gren `audit/task-19-mixed-pack-feasibility`, bas `origin/dev` = 9b296e1. Läsande kontroll: inget är ändrat i admin, Theme 8-koden eller produktionen, och ingen varukorg är skapad. Ingen commit.

**Ägarens mål (2026-11-06):** Kunden ska kunna blanda strains inom sju grupper: Magic Sauce buds + hasch, D10 buds + hasch, Core buds + hasch, Faraoh vapes, Core vapes, Magic Sauce 2 ml och Magic Sauce 5 ml. Produkter med olika styckpris blandas aldrig i samma fastprisgrupp. Endast varor som verkligen finns att köpa får vara valbara.

Filer:
- [`GROUP-MATRIX.md`](GROUP-MATRIX.md) / [`GROUP-MATRIX.json`](GROUP-MATRIX.json): exakt gruppmatris med produkt-id, variant-id, SKU, format, styckpris, lager, prisgrupp och 3-/5-pack. Genereras av [`evidence/build-matrix.mjs`](evidence/build-matrix.mjs) ur registret, Task 17-matrisen och live Nyehandel ([`evidence/groups-live.mjs`](evidence/groups-live.mjs) → `evidence/nh-groups-2026-11-06.json`).
- [`CHROME-AGENT-CHECKS.md`](CHROME-AGENT-CHECKS.md): läsande frågor, frågor till Nyehandel och exakta adminsteg för senare.
- [`evidence/foundation-excerpts.md`](evidence/foundation-excerpts.md): Nyehandels egen frontendkod för paket.

## 1. Svar i korthet

| Grupp | Prisgrupper (styckpris) | Blandar | Valbara nu | 3-/5-pack, fast pris | Status |
|---|---|---|---|---|---|
| **Core vapes** | 675 (255) | varianter av en produkt | 6 av 6 | 159: 1 920 / 162: 3 135 | **Kan byggas direkt\*** |
| **Magic Sauce 5 ml** | 1 195 (260) | varianter av en produkt | 5 av 5 (Yoda 4 st) | 166: 2 950 / 169: 4 450 | **Kan byggas direkt\*** |
| **Magic Sauce 2 ml** | 575 (261) | varianter av en produkt | 2 av 9 | 145: 1 599 / 147: 2 530 | **Kan byggas direkt\***, men bara 2 strains att blanda |
| **Faraoh vapes** | 745 (236) · 795 (242) · 395 cart (256) · 495 (251) | varianter av en produkt per prisgrupp | **0** i alla | 236: 2 076/3 319 · 242: 2 216/3 542 · 256: 1 101/1 835 · 251: inget | Plattformen räcker. **Väntar på lager.** 251 saknar paketpris, och att 256 (cart) ingår ska bekräftas |
| **Magic Sauce buds + hasch** | 495 (17 produkter) | **separata produkter** | 14 av 17 | 167: 1 380 / 170: 2 200 | **Väntar på plattformsbesked** (B1) |
| **Core buds + hasch** | hasch 590 (3 st) · buds 675 (2 st) | **separata produkter** | hasch 3 av 3 · buds 0 av 2 | Woo 1 657 / 2 673 blandade 590 och 675, så **priset gäller inte** | **Väntar på plattformsbesked och prisbeslut.** Buds väntar också på lager |
| **D10 buds + hasch** | 495 · 445 · 435 · 395 (2 produkter var) | **separata produkter** | högst 1 per prisgrupp | **inga paket** i Woo eller NH | **Väntar på plattformsbesked, prisbeslut och lager.** Medlemskapet bygger bara på kategori |

\* "Direkt" betyder att inget besked från Nyehandel behövs för att bygga. Det förutsätter att admin tillåter samma produkt på flera paketrader (A1). Det går inte att se utan att spara, så det avgörs i adminpiloten. Inget får släppas förrän testerna T1–T8 har passerat, särskilt servervalidering och lagerdrag.

## 2. Plattformen: kan en paketplats välja mellan separata produkter?

**Svar: Det finns ingen dokumenterad Nyehandel-funktion som gör det. Koden visar att funktionen saknas på frontendsidan.**

| Fråga | Bevis | Status |
|---|---|---|
| Paketartikel finns och byggs av produkter (och varianter) med antal per rad | Supportartikeln *Uppbyggnad av paketartikel* | **Bevis** |
| Varje paketrad (pivot) har **ett** `productId`. Kunden väljer variant av just den produkten, eller ser en låst variant | foundation.js: `package-product-variants` (props `productId`, `pivotId`, `lockedVariant`, `quantity`) och `package-product` (fast `primary_variant`) | **Bevis** |
| Det finns ingen annan paketplatskomponent | foundation.js: de enda paketkomponenterna är `package-product` och `package-product-variants`. `package-quantity-select` är bara antalsväljaren | **Bevis** (för frontend) |
| Servern kan ändå rendera ett val mellan produkter | Ingen kod som kan visa det | **Antagande: osannolikt.** Fråga B1 |
| Produktsamlingar ger fast pris eller val | *Produktsamlingar*: grupperar och visar produkter. Inget om pris, lager eller varukorg | **Bevis: nej** |
| Kampanj ger fast pris för N valfria | *Skapa kampanj*: bara procent, "köp X betala för Y" och medskick | **Bevis: nej** (3 för 2 ger 990 kr i stället för 1 380 kr) |
| Prisnivåer eller valbara paketstorlekar över flera produkter | Supportartiklarna och foundation.js (`virtualPackageProductVariants` = en variant) | **Bevis: nej**, gäller en variantrad |
| Varianter har eget pris, artikelnummer och lager | *Produktvarianter*: "Varje variant får sitt eget artikelnummer, pris och lagersaldo." | **Bevis** |
| Varukorgsraden visar paketets delar med strain | foundation.js: `item.package_items` med namn och `option_values` | **Bevis (kod)**. Inte sett med en riktig paketrad |
| Ordern drar lager från de valda delarna, och servern nekar fel variant eller för lite lager | – | **Antagande, kritiskt.** B2, T5, T6, T8 |

### Två ärliga alternativ (rätt fast pris, ett lagersaldo per artikel)

**Alternativ 1. Slå ihop varje prisgrupp till en produkt med strainvarianter.** Exempel: "Magic Sauce 50 % 5 g" med 17 varianter. Varje strain blir en variant med eget SKU och lager (bevis: *Produktvarianter*). De fristående produkterna läggs ner och deras lager flyttas, så inget lager finns dubbelt. Gruppen blir då samma modell som Core vapes, och Nyehandels riktiga paketartikel ger fast pris och strainval per plats.
- Kostnad: varje strain förlorar sin egen produktsida, som ersätts med en sida med strainval. Gamla URL:er måste omdirigeras (stödet i Nyehandel är inte verifierat, se A5). Bilder kopplas per variant (det finns stöd: *Koppla bild till en variant*). COA och texter per strain måste flyttas.
- Insats: ca 1 dag i admin per stor grupp (MS 17 produkter) plus 1–2 dagar i Theme 8 för innehåll per strain och omdirigeringar.
- Kräver ägarbeslut.

**Alternativ 2. Nyehandel bygger en paketrad med en lista av tillåtna produkter.** Det är en leverantörsändring (B1, B3). Rätt pris och lagerdrag kommer från plattformen, och katalogen behålls som den är. Tid och kostnad är okända.

Avfärdat: kampanj 3 för 2 (fel pris), ett paket per kombination (MS: C(16,3) = 560 paketprodukter för 3-pack), frontendpris och vanliga produkter som låtsas vara paket.

## 3. Gruppmatrisen (sammanfattning)

Fullständig matris: [`GROUP-MATRIX.md`](GROUP-MATRIX.md). Regler som används där:
- **Medlemskap** bygger aldrig på namn eller varumärke. Källor: WooCommerce-familj (`HZY_EXTRA.familj`) och tillåtna produkter i Woo-paketen (via registret), eller Nyehandels kategorilistning (live). Källan anges per grupp.
- **Prisgrupp** = ägargrupp × styckpris inkl. moms. Format delar inte grupper: MS buds och hasch kostar båda 495 kr och är en grupp.
- **Valbar** = aktiv, köpbar och lager > 0, live 2026-11-06.

Saker att observera i matrisen:
- **MS buds + hasch:** 152 Marrakesh Dream är bara nåbar via direktlänk och slutsåld. 196 Charas och 146 Tinky Winky är slutsålda. 168 Khalifa Kush (2 st) och 175 Crazy Dog (3 st) räcker inte till 3 av samma strain respektive 2 paket. NH-kategorin ms-buds/ms-hash innehåller också 257 Pre Rolls (140 kr). Den finns inte i Woo-familjen och tas inte med.
- **Core buds + hasch:** Woo-paketen 174 och 176 blandade buds för 675 kr med hasch för 590 kr (ordinarie pris 2 025 respektive 1 770). Det bryter mot ägarregeln, så **1 657 och 2 673 kr kan inte återanvändas**. Två nya fasta priser behövs. Båda Core-buds (135, 204) är slutsålda och nås bara via direktlänk.
- **D10 buds + hasch:** Det finns ingen Woo-familj och inget Woo-paket, och medlemskapet bygger bara på NH-kategorierna d10-buds och d10-hash. Fyra prisgrupper med två produkter var, och högst en valbar per grupp. **Ingen blandning är möjlig i dag**, även med en plattformslösning.
- **Faraoh vapes:** Kategorin faraoh innehåller 236 och 251. 242 och 256 kommer med via sina Woo-paket och kategorin thca-b, och ägaren ska bekräfta dem. Alla fyra har olika styckpris, så varje prisgrupp är en enda produkt (variantblandning). **Alla 22 varianter har lager 0.** 256 är en cart på 1 ml (3-pack 240 är ett fristående Woo-paket, dolt). 251 (THC-B 35 %, legacy) har inga paket.

## 4. Minsta piloter

**Variantblandning: Core vapes 3-pack** (ersätter version 1:s MS 2 ml-pilot)
- Bas 255 *Hero's Core - 2ml*. Fast pris **1 920 kr** (Woo 159; ordinarie 3 × 675 = 2 025).
- Alla 6 strains är valbara (31–80 st), så tre *olika* strains kan väljas. MS 2 ml har bara 2 strains i lager.
- Bevisar: tre rader med samma produkt, strainval per plats, paketpris, `package_items` i varukorgen och lagerkontroll.

**Blandning mellan separata produkter: Magic Sauce buds + hasch 3-pack**
- Fast pris **1 380 kr** (Woo 167, samma styckpris 495 kr för alla 17).
- Testval: 132 Yoda Ice Cream (buds, 237 st), 203 John Lemon (buds, 197 st) och 188 KitKat (hasch, 132 st). Det bevisar buds + hasch i samma paket. Lagerkantfall: 168 Khalifa Kush (2 st) × 3.
- Kan **bara** byggas om B1 = ja. Om svaret är nej kan pilotens bevis inte tas fram utan att alternativ 1 eller 2 först är beslutat. En testprodukt med egna kopior av strainsen skulle ge dubbelt lager, så den byggs inte.

## 5. Testplan (endast Theme 8-förhandsvisning)

Miljö: **Theme 8-previewn** `https://hazeyse.nyehandel.se/…?preview=v9kzdmqz4w60l5n`, körd med `catalog-reconciliation-2026-11/lib/harness.mjs` (`which: "after"`). Testkorgen töms efteråt, ingen betalning och ingen order. Obs:
- Admins produkter och lager är **gemensamma för alla teman**. En dold pilotprodukt finns därför också på den skarpa sajten via direktlänk. Se adminstegen för hur den hålls dold.
- `/sv/checkout` kör inte Theme 8-loadern (se kommentaren i harnessen). Kassan är Nyehandels egen även i previewn, men den nås med preview-parametern.

| # | Steg (V = variantpilot, S = separat-produkt-pilot) | Godkänt |
|---|---|---|
| T1 | `product/state` för pilot-id | `is_package=true`, fast pris 1 920 kr (V) / 1 380 kr (S), `parts_buyable` noterat |
| T2 | Pilotens PDP i previewn | Tre strainval. V: 6 strains. S: 17 produkter där 3 är slutsålda och inte går att välja. Köp spärrat tills alla platser är giltiga |
| T3 | Lägg i korgen. V: Gelato, Melon Haze, Coconut Cake. S: Yoda, John Lemon, KitKat | **En** rad med det fasta priset och `package_items` med exakt de tre valen, inga extra rader |
| T4 | Theme 8-minicarten | Paketnamn, fast pris och de tre strainsen visas. Ingen dubbelprissättning och ingen procenttrappa |
| T5 | Lager. V: Gelato × 3 med paketantal 24 (72 > 69). S: Khalifa Kush × 3 (3 > 2) | Servern nekar. Om den godtar: **blockerare** (överförsäljning) |
| T6 | Manipulerad payload: en plats med variant 243 (MS50 Yoda) i V-paketet och en slutsåld variant | Servern nekar båda. Om den godtar: **blockerare** (valfri vara till paketpris) |
| T7 | `/sv/checkout?preview=…` på 1440 och 393 | Paketrad, fast pris och delar. Klarna/Walley visar rätt belopp. **Ingen betalning** |
| T8 | Lagerdrag | Svar från Nyehandel (B2), eller en intern testorder som avbryts, **endast efter Vilmers godkännande**. Delarnas lager minskar, paketvariantens påverkas inte |
| T9 | Städning | Testraden borttagen, pilotprodukten fortfarande dold |

Först när T1–T8 är godkända: rätta Theme 8:s payload till `{id, pivot_id}` (fel i `85-pdp-pilot.js:835` och `84-cart.js:449`, gissat `pivot_id` i `83-pdp-purchase.js:334`). Sätt sedan `verified: true` för gruppen.

## 6. Ordning och insats

| Steg | Vad | Insats |
|---|---|---|
| 1 | Läsande kontroller och frågorna B1–B3 till Nyehandel (CHROME-AGENT-CHECKS) | 30–45 min plus Nyehandels svarstid |
| 2 | Ägarbeslut: Faraoh-medlemmar (242/256/251), D10-medlemskap, nya fasta priser för Core hasch 590 och Core buds 675 samt D10 | Vilmer |
| 3 | Adminpilot V (Core vapes 3-pack), efter godkännande | 30 min |
| 4 | T1–T8 för V | 0,5 dag plus väntan på T8 |
| 5 | Theme 8: payloadrättelse, pivot-id ur paketprodukten, lagerkontroll × paketantal, `verified` | 1 dag |
| 6 | Bygg ut de variantgrupper som har lager: MS 5 ml och MS 2 ml (3- och 5-pack, 4 paket), därefter Core vapes 5-pack | ca 30–45 min per paket plus T3–T7 |
| 7 | Faraoh när lager finns | samma som steg 6 |
| 8 | Separata produkter: pilot S efter B1, eller beslut om alternativ 1 eller 2 | S: 0,5 dag. Alternativ 1: ca 2–3 dagar per stor grupp. Alternativ 2: Nyehandels tid |

**Kan byggas direkt:** Core vapes, Magic Sauce 5 ml och Magic Sauce 2 ml (förutsatt A1).
**Väntar på lager:** Faraoh vapes (plattformen räcker).
**Väntar på plattformsbesked:** Magic Sauce buds + hasch, Core buds + hasch och D10 buds + hasch. De två sista behöver också prisbeslut, och D10 och Core buds behöver dessutom lager.
