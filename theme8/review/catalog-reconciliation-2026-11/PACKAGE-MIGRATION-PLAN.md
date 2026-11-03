# Paketmigrering – plan och register

TASK 17 · 2026-11-03 · källor: WooCommerce-livesidan (Store API alla synlighetslägen, kategorisidornas listningar, produktsidornas HZY_PRODUKT/HZY_PAKET/HZY_EXTRA) och Nyehandel (sitemap, 68 kategorier med alla sidor, produktsidor, product/state). Genererad av `build-docs.mjs` ur JSON-filerna i samma mapp.

**Status: alla paket BLOCKED.** Inga paketköp är aktiverade och inga priser är påhittade: `PACKAGE_PRODUCTS` i 85-pdp-pilot.js/83-pdp-purchase.js är fortfarande `{}`. Registret `PACKAGE-REGISTRY.json` är maskinläsbart och genereras av `registry.mjs`. `PACKAGE_PLAN`/`FAMILIES` i Theme 8 genereras ur samma körning: bara modell och stegstruktur, aldrig priser.

## Läget efter importen

- **WooCommerce:** 36 paket (Product Bundles) med **fast paketpris per steg**: 33 nås från basprodukternas paketväljare (`HZY_PAKET`), plus 3 fristående (två startpaket, *THCA-B 50% Faraoh 1ml – 3-pack*).
- **Nyehandel:** alla 36 är importerade som **vanliga produkter** (`is_package = false`, en variant, SKU `HZ-…-3PK/5PK/10PK/KOLL`, lager 0). Priset stämmer med Woo, men ingen paketstruktur, inga platser och inga tillåtna strains. De ligger listade i Alla produkter och i kategorierna (A-listan i NYEHANDEL-VISIBILITY-ACTIONS.md).
- **Nyehandels egen pristrappa** används inte av någon importerad produkt (0 produkter med fler än ett prissteg). Den gamla −15/−20 %-trappan är legacy (beslut 2026-10-29).

## Modeller

| Modell | Woo-mekanik | Basprodukter | Steg | Blandning | Lagerregel |
|---|---|---|---|---|---|
| **strain** | en variabel produkt, en plats per enhet | 10 (MS 2 ml, MS 5 ml, MS cart 1 ml, MS 10 ml, MS pre-roll, THCaB vape 2 ml, THCaB cart 1 ml, THCbA 2 ml, D10 2 ml, Core THC-X 2 ml) | 3/5, 5/10, 3/5/9K, 3/5/8K, 3/5/6K, 3K | ja, valfri strain per plats | slutsålda strains syns men kan inte väljas; paketlager = Woo `bundle_stock_status` |
| **family** | blandade strains över separata produkter | ms50 (17), nano11 (16), highlife (5) | 3/5/10 resp. 3/5 | ja, alla familjemedlemmar (även olistade Nano11-strains) | samma |
| **same** | samma variant × N | Nano11 pre-roll 1 g | 5/10 | nej | basproduktens lager ≥ N |
| **collection** | en av varje strain (K) | MS 2 ml (9), MS cart (9), THCbA (8), Core (6), MS 10 ml (3) | K | nej (fast sammansättning) | alla strains i lager |
| **kit** | startpaket (batteri + 2 carts) | – (fristående) | 1 | nej | båda delarna i lager |

*Magic Sauce 3.0 – 10ml:* Woo kallar 3-packet "Kollektion" (3 strains = hela sortimentet) och priset är exakt 3 för 2 (2 390 kr = 2 × 1 195 kr). Registret har det som `3K`.

## Vad som krävs per pakettyp innan den kan provköpas

1. **Admin (Nyehandel):** bygg om Woo-paketet som en riktig Nyehandel-paketprodukt (`is_package`) med Woo:s fasta pris, rätt antal platser och tillåtna varianter/produkter enligt `allowedProducts` och `allowedVariations` i registret. Dold i listningar.
2. **Lager:** paketets köpbarhet ska följa delarnas lager (Woo: `bundle_stock_status`); i dag har alla importerade paket lager 0.
3. **Provköp:** minst **en riktig produkt per pakettyp** (strain, family, same, collection, kit) läggs i varukorgen i Theme 8-previewen och följs till kassan: rätt rader, rätt totalpris, rätt strains per plats och ingen dubbelprissättning. Ingen order läggs.
4. **Theme 8:** först därefter läggs paketet in i `PACKAGE_PRODUCTS` med `verified: true` (produkt-id → `[{ kind, qty, packageId, verified }]`). PDP:n och minicarten läser samma register (`HZ8.packageRegistry`); omärkta steg visas aldrig som köpbara.
5. **Rensning:** de 36 importerade "vanliga" paketprodukterna döljs, eller ersätts av de ombyggda.

Granskningsläget `?hz8-pkg-review=1` visar planen spärrad ("Paketprodukt saknas") med de nya id:na. Det är verifierat för family- och strain-modellen (se REPORT.md).


## Paketsteg per basprodukt

Pris = WooCommerce fast paketpris; ord. = ordinarie totalpris (antal × styckpris). Alla steg: **BLOCKED**.

| Bas (NH-id) | Basprodukt | Modell | Blandning | Steg | Woo-paket (NH-id) | Fast pris | Ord. totalt | Spar | Woo-lager | NH is_package |
|---:|---|---|---|---|---|---:|---:|---:|---|---|
| 260 | Magic Sauce 3.0 - 5ml | strain | ja | 3 | MS 3.0 – 5ml – 3-pack (166) | 2 950 | 3 585 | 17.7 % | i lager | nej (vanlig produkt) |
| 260 | Magic Sauce 3.0 - 5ml | strain | ja | 5 | MS 3.0 – 5ml – 5-pack (169) | 4 450 | 5 975 | 25.5 % | i lager | nej (vanlig produkt) |
| 257 | Magic Sauce 50% – Pre Rolls – 1g | strain | ja | 5 | Magic Sauce 50% Pre Rolls 1g – 5-pack (154) | 695 | 875 | 20.6 % | i lager | nej (vanlig produkt) |
| 257 | Magic Sauce 50% – Pre Rolls – 1g | strain | ja | 10 | Magic Sauce 50% Pre Rolls 1g – 10-pack (157) | 1 250 | 1 750 | 28.6 % | i lager | nej (vanlig produkt) |
| 198 | Magic Sauce 50% – La Chupacabra – 5g | family (ms50) | ja | 3 | Magic Sauce 50% 5g – 3-pack (167) | 1 380 | 1 485 | 7.1 % | i lager | nej (vanlig produkt) |
| 198 | Magic Sauce 50% – La Chupacabra – 5g | family (ms50) | ja | 5 | Magic Sauce 50% 5g – 5-pack (170) | 2 200 | 2 475 | 11.1 % | i lager | nej (vanlig produkt) |
| 198 | Magic Sauce 50% – La Chupacabra – 5g | family (ms50) | ja | 10 | Magic Sauce 50% 5g – 10-pack (173) | 3 999 | 4 950 | 19.2 % | i lager | nej (vanlig produkt) |
| 201 | Magic Sauce 50% – Titty Sprinkles – 5g | family (ms50) | ja | 3 | Magic Sauce 50% 5g – 3-pack (167) | 1 380 | 1 485 | 7.1 % | i lager | nej (vanlig produkt) |
| 201 | Magic Sauce 50% – Titty Sprinkles – 5g | family (ms50) | ja | 5 | Magic Sauce 50% 5g – 5-pack (170) | 2 200 | 2 475 | 11.1 % | i lager | nej (vanlig produkt) |
| 201 | Magic Sauce 50% – Titty Sprinkles – 5g | family (ms50) | ja | 10 | Magic Sauce 50% 5g – 10-pack (173) | 3 999 | 4 950 | 19.2 % | i lager | nej (vanlig produkt) |
| 168 | Magic Sauce 50% – Khalifa Kush – 5g | family (ms50) | ja | 3 | Magic Sauce 50% 5g – 3-pack (167) | 1 380 | 1 485 | 7.1 % | i lager | nej (vanlig produkt) |
| 168 | Magic Sauce 50% – Khalifa Kush – 5g | family (ms50) | ja | 5 | Magic Sauce 50% 5g – 5-pack (170) | 2 200 | 2 475 | 11.1 % | i lager | nej (vanlig produkt) |
| 168 | Magic Sauce 50% – Khalifa Kush – 5g | family (ms50) | ja | 10 | Magic Sauce 50% 5g – 10-pack (173) | 3 999 | 4 950 | 19.2 % | i lager | nej (vanlig produkt) |
| 175 | Magic Sauce 50% – Crazy Dog – 5g | family (ms50) | ja | 3 | Magic Sauce 50% 5g – 3-pack (167) | 1 380 | 1 485 | 7.1 % | i lager | nej (vanlig produkt) |
| 175 | Magic Sauce 50% – Crazy Dog – 5g | family (ms50) | ja | 5 | Magic Sauce 50% 5g – 5-pack (170) | 2 200 | 2 475 | 11.1 % | i lager | nej (vanlig produkt) |
| 175 | Magic Sauce 50% – Crazy Dog – 5g | family (ms50) | ja | 10 | Magic Sauce 50% 5g – 10-pack (173) | 3 999 | 4 950 | 19.2 % | i lager | nej (vanlig produkt) |
| 256 | THCA-B 50% - Faraoh - 1ml | strain | ja | 5 | THCA-B 50% Faraoh 1ml – 5-pack (241) | 1 835 | 1 975 | 7.1 % | slut | nej (vanlig produkt) |
| 256 | THCA-B 50% - Faraoh - 1ml | strain | ja | 10 | THCA-B 50% Faraoh 1ml – 10-pack (150) | 3 519 | 3 950 | 10.9 % | slut | nej (vanlig produkt) |
| 231 | Magic Sauce 50% – Grape Gasoline – 5g | family (ms50) | ja | 3 | Magic Sauce 50% 5g – 3-pack (167) | 1 380 | 1 485 | 7.1 % | i lager | nej (vanlig produkt) |
| 231 | Magic Sauce 50% – Grape Gasoline – 5g | family (ms50) | ja | 5 | Magic Sauce 50% 5g – 5-pack (170) | 2 200 | 2 475 | 11.1 % | i lager | nej (vanlig produkt) |
| 231 | Magic Sauce 50% – Grape Gasoline – 5g | family (ms50) | ja | 10 | Magic Sauce 50% 5g – 10-pack (173) | 3 999 | 4 950 | 19.2 % | i lager | nej (vanlig produkt) |
| 228 | Magic Sauce 50% – Dubai Chocolate – 5g | family (ms50) | ja | 3 | Magic Sauce 50% 5g – 3-pack (167) | 1 380 | 1 485 | 7.1 % | i lager | nej (vanlig produkt) |
| 228 | Magic Sauce 50% – Dubai Chocolate – 5g | family (ms50) | ja | 5 | Magic Sauce 50% 5g – 5-pack (170) | 2 200 | 2 475 | 11.1 % | i lager | nej (vanlig produkt) |
| 228 | Magic Sauce 50% – Dubai Chocolate – 5g | family (ms50) | ja | 10 | Magic Sauce 50% 5g – 10-pack (173) | 3 999 | 4 950 | 19.2 % | i lager | nej (vanlig produkt) |
| 226 | Magic Sauce 50% – London Lobster – 5g | family (ms50) | ja | 3 | Magic Sauce 50% 5g – 3-pack (167) | 1 380 | 1 485 | 7.1 % | i lager | nej (vanlig produkt) |
| 226 | Magic Sauce 50% – London Lobster – 5g | family (ms50) | ja | 5 | Magic Sauce 50% 5g – 5-pack (170) | 2 200 | 2 475 | 11.1 % | i lager | nej (vanlig produkt) |
| 226 | Magic Sauce 50% – London Lobster – 5g | family (ms50) | ja | 10 | Magic Sauce 50% 5g – 10-pack (173) | 3 999 | 4 950 | 19.2 % | i lager | nej (vanlig produkt) |
| 221 | Magic Sauce 50% – Kowa Bunga – 5g | family (ms50) | ja | 3 | Magic Sauce 50% 5g – 3-pack (167) | 1 380 | 1 485 | 7.1 % | i lager | nej (vanlig produkt) |
| 221 | Magic Sauce 50% – Kowa Bunga – 5g | family (ms50) | ja | 5 | Magic Sauce 50% 5g – 5-pack (170) | 2 200 | 2 475 | 11.1 % | i lager | nej (vanlig produkt) |
| 221 | Magic Sauce 50% – Kowa Bunga – 5g | family (ms50) | ja | 10 | Magic Sauce 50% 5g – 10-pack (173) | 3 999 | 4 950 | 19.2 % | i lager | nej (vanlig produkt) |
| 242 | THCA-B 50% - Faraoh - 2ml | strain | ja | 3 | THCA-B 50% Faraoh 2ml – 3-pack (238) | 2 216 | 2 385 | 7.1 % | slut | nej (vanlig produkt) |
| 242 | THCA-B 50% - Faraoh - 2ml | strain | ja | 5 | THCA-B 50% Faraoh 2ml – 5-pack (239) | 3 542 | 3 975 | 10.9 % | slut | nej (vanlig produkt) |
| 254 | D10 - 2ml | strain | ja | 3 | D10 2ml – 3-pack (243) | 1 655 | 1 785 | 7.3 % | slut | nej (vanlig produkt) |
| 254 | D10 - 2ml | strain | ja | 5 | D10 2ml – 5-pack (245) | 2 618 | 2 975 | 12 % | slut | nej (vanlig produkt) |
| 203 | Magic Sauce 50% – John Lemon – 5g | family (ms50) | ja | 3 | Magic Sauce 50% 5g – 3-pack (167) | 1 380 | 1 485 | 7.1 % | i lager | nej (vanlig produkt) |
| 203 | Magic Sauce 50% – John Lemon – 5g | family (ms50) | ja | 5 | Magic Sauce 50% 5g – 5-pack (170) | 2 200 | 2 475 | 11.1 % | i lager | nej (vanlig produkt) |
| 203 | Magic Sauce 50% – John Lemon – 5g | family (ms50) | ja | 10 | Magic Sauce 50% 5g – 10-pack (173) | 3 999 | 4 950 | 19.2 % | i lager | nej (vanlig produkt) |
| 200 | 7% Nano11 – Zkittlez Mousse – 5g | family (nano11) | ja | 3 | Nano 11 Buds 5g – 3-pack (179) | 1 680 | 1 785 | 5.9 % | i lager | nej (vanlig produkt) |
| 200 | 7% Nano11 – Zkittlez Mousse – 5g | family (nano11) | ja | 5 | Nano 11 Buds 5g – 5-pack (181) | 2 700 | 2 975 | 9.2 % | i lager | nej (vanlig produkt) |
| 200 | 7% Nano11 – Zkittlez Mousse – 5g | family (nano11) | ja | 10 | Nano 11 Buds 5g – 10-pack (184) | 4 879 | 5 950 | 18 % | i lager | nej (vanlig produkt) |
| 197 | 7% Nano11 – Critical Berries – 5g | family (nano11) | ja | 3 | Nano 11 Buds 5g – 3-pack (179) | 1 680 | 1 785 | 5.9 % | i lager | nej (vanlig produkt) |
| 197 | 7% Nano11 – Critical Berries – 5g | family (nano11) | ja | 5 | Nano 11 Buds 5g – 5-pack (181) | 2 700 | 2 975 | 9.2 % | i lager | nej (vanlig produkt) |
| 197 | 7% Nano11 – Critical Berries – 5g | family (nano11) | ja | 10 | Nano 11 Buds 5g – 10-pack (184) | 4 879 | 5 950 | 18 % | i lager | nej (vanlig produkt) |
| 165 | 7% Nano11 – Prerolled – 1 gram | same | nej (samma variant × N) | 5 | Nano 11 Pre Rolls 1g – 5-pack (163) | 895 | 975 | 8.2 % | i lager | nej (vanlig produkt) |
| 165 | 7% Nano11 – Prerolled – 1 gram | same | nej (samma variant × N) | 10 | Nano 11 Pre Rolls 1g – 10-pack (160) | 1 550 | 1 950 | 20.5 % | i lager | nej (vanlig produkt) |
| 194 | 7% Nano11 – Royal OG – 5g | family (nano11) | ja | 3 | Nano 11 Buds 5g – 3-pack (179) | 1 680 | 1 785 | 5.9 % | i lager | nej (vanlig produkt) |
| 194 | 7% Nano11 – Royal OG – 5g | family (nano11) | ja | 5 | Nano 11 Buds 5g – 5-pack (181) | 2 700 | 2 975 | 9.2 % | i lager | nej (vanlig produkt) |
| 194 | 7% Nano11 – Royal OG – 5g | family (nano11) | ja | 10 | Nano 11 Buds 5g – 10-pack (184) | 4 879 | 5 950 | 18 % | i lager | nej (vanlig produkt) |
| 191 | 7% Nano11 – Bubba Kush – 5g | family (nano11) | ja | 3 | Nano 11 Buds 5g – 3-pack (179) | 1 680 | 1 785 | 5.9 % | i lager | nej (vanlig produkt) |
| 191 | 7% Nano11 – Bubba Kush – 5g | family (nano11) | ja | 5 | Nano 11 Buds 5g – 5-pack (181) | 2 700 | 2 975 | 9.2 % | i lager | nej (vanlig produkt) |
| 191 | 7% Nano11 – Bubba Kush – 5g | family (nano11) | ja | 10 | Nano 11 Buds 5g – 10-pack (184) | 4 879 | 5 950 | 18 % | i lager | nej (vanlig produkt) |
| 188 | Magic Sauce 50% – KitKat – 5g | family (ms50) | ja | 3 | Magic Sauce 50% 5g – 3-pack (167) | 1 380 | 1 485 | 7.1 % | i lager | nej (vanlig produkt) |
| 188 | Magic Sauce 50% – KitKat – 5g | family (ms50) | ja | 5 | Magic Sauce 50% 5g – 5-pack (170) | 2 200 | 2 475 | 11.1 % | i lager | nej (vanlig produkt) |
| 188 | Magic Sauce 50% – KitKat – 5g | family (ms50) | ja | 10 | Magic Sauce 50% 5g – 10-pack (173) | 3 999 | 4 950 | 19.2 % | i lager | nej (vanlig produkt) |
| 236 | THCbA 47% - Faraoh - 2ml | strain | ja | 3 | Faraoh THCbA Vape 2ml – 3-pack (140) | 2 076 | 2 235 | 7.1 % | slut | nej (vanlig produkt) |
| 236 | THCbA 47% - Faraoh - 2ml | strain | ja | 5 | Faraoh THCbA Vape 2ml – 5-pack (142) | 3 319 | 3 725 | 10.9 % | slut | nej (vanlig produkt) |
| 236 | THCbA 47% - Faraoh - 2ml | strain | ja | 8K | Faraoh THCbA Vape 2ml – Hela kollektionen (143) | 4 827 | 5 960 | 19 % | slut | nej (vanlig produkt) |
| 252 | Magic Sauce 3.0 - 10ml | strain | ja | 3K | MS 3.0 – 10ml – Kollektion (186) | 2 390 | 3 585 | 33.3 % | slut | nej (vanlig produkt) |
| 213 | 7% Nano11 – Naranja Pop. – 5g | family (nano11) | ja | 3 | Nano 11 Buds 5g – 3-pack (179) | 1 680 | 1 785 | 5.9 % | i lager | nej (vanlig produkt) |
| 213 | 7% Nano11 – Naranja Pop. – 5g | family (nano11) | ja | 5 | Nano 11 Buds 5g – 5-pack (181) | 2 700 | 2 975 | 9.2 % | i lager | nej (vanlig produkt) |
| 213 | 7% Nano11 – Naranja Pop. – 5g | family (nano11) | ja | 10 | Nano 11 Buds 5g – 10-pack (184) | 4 879 | 5 950 | 18 % | i lager | nej (vanlig produkt) |
| 210 | 7% Nano11 – Godzilla – 5g | family (nano11) | ja | 3 | Nano 11 Buds 5g – 3-pack (179) | 1 680 | 1 785 | 5.9 % | i lager | nej (vanlig produkt) |
| 210 | 7% Nano11 – Godzilla – 5g | family (nano11) | ja | 5 | Nano 11 Buds 5g – 5-pack (181) | 2 700 | 2 975 | 9.2 % | i lager | nej (vanlig produkt) |
| 210 | 7% Nano11 – Godzilla – 5g | family (nano11) | ja | 10 | Nano 11 Buds 5g – 10-pack (184) | 4 879 | 5 950 | 18 % | i lager | nej (vanlig produkt) |
| 208 | 7% Nano11 – Orange Zkittlez – 5g | family (nano11) | ja | 3 | Nano 11 Buds 5g – 3-pack (179) | 1 680 | 1 785 | 5.9 % | i lager | nej (vanlig produkt) |
| 208 | 7% Nano11 – Orange Zkittlez – 5g | family (nano11) | ja | 5 | Nano 11 Buds 5g – 5-pack (181) | 2 700 | 2 975 | 9.2 % | i lager | nej (vanlig produkt) |
| 208 | 7% Nano11 – Orange Zkittlez – 5g | family (nano11) | ja | 10 | Nano 11 Buds 5g – 10-pack (184) | 4 879 | 5 950 | 18 % | i lager | nej (vanlig produkt) |
| 206 | 7% Nano11 – Lemon Mandarine – 5g | family (nano11) | ja | 3 | Nano 11 Buds 5g – 3-pack (179) | 1 680 | 1 785 | 5.9 % | i lager | nej (vanlig produkt) |
| 206 | 7% Nano11 – Lemon Mandarine – 5g | family (nano11) | ja | 5 | Nano 11 Buds 5g – 5-pack (181) | 2 700 | 2 975 | 9.2 % | i lager | nej (vanlig produkt) |
| 206 | 7% Nano11 – Lemon Mandarine – 5g | family (nano11) | ja | 10 | Nano 11 Buds 5g – 10-pack (184) | 4 879 | 5 950 | 18 % | i lager | nej (vanlig produkt) |
| 204 | High Life – Gelato – 5g | family (highlife) | ja | 3 | High Life 5g – 3-pack (174) | 1 657 | 2 025 | 18.2 % | i lager | nej (vanlig produkt) |
| 204 | High Life – Gelato – 5g | family (highlife) | ja | 5 | High Life 5g – 5-pack (176) | 2 673 | 3 375 | 20.8 % | i lager | nej (vanlig produkt) |
| 135 | High Life – White Widow – 5g | family (highlife) | ja | 3 | High Life 5g – 3-pack (174) | 1 657 | 2 025 | 18.2 % | i lager | nej (vanlig produkt) |
| 135 | High Life – White Widow – 5g | family (highlife) | ja | 5 | High Life 5g – 5-pack (176) | 2 673 | 3 375 | 20.8 % | i lager | nej (vanlig produkt) |
| 262 | Magic Sauce 3.0 - 1ml | strain | ja | 3 | MS 3.0 – 1ml – 3-pack (151) | 899 | 975 | 7.8 % | slut | nej (vanlig produkt) |
| 262 | Magic Sauce 3.0 - 1ml | strain | ja | 5 | MS 3.0 – 1ml – 5-pack (153) | 1 430 | 1 625 | 12 % | slut | nej (vanlig produkt) |
| 262 | Magic Sauce 3.0 - 1ml | strain | ja | 9K | MS 3.0 – 1ml – Kollektion (156) | 2 299 | 2 925 | 21.4 % | slut | nej (vanlig produkt) |
| 146 | Magic Sauce 50% – Tinky Winky – 5g | family (ms50) | ja | 3 | Magic Sauce 50% 5g – 3-pack (167) | 1 380 | 1 485 | 7.1 % | i lager | nej (vanlig produkt) |
| 146 | Magic Sauce 50% – Tinky Winky – 5g | family (ms50) | ja | 5 | Magic Sauce 50% 5g – 5-pack (170) | 2 200 | 2 475 | 11.1 % | i lager | nej (vanlig produkt) |
| 146 | Magic Sauce 50% – Tinky Winky – 5g | family (ms50) | ja | 10 | Magic Sauce 50% 5g – 10-pack (173) | 3 999 | 4 950 | 19.2 % | i lager | nej (vanlig produkt) |
| 155 | Magic Sauce 50% – Samurai Jack – 5g | family (ms50) | ja | 3 | Magic Sauce 50% 5g – 3-pack (167) | 1 380 | 1 485 | 7.1 % | i lager | nej (vanlig produkt) |
| 155 | Magic Sauce 50% – Samurai Jack – 5g | family (ms50) | ja | 5 | Magic Sauce 50% 5g – 5-pack (170) | 2 200 | 2 475 | 11.1 % | i lager | nej (vanlig produkt) |
| 155 | Magic Sauce 50% – Samurai Jack – 5g | family (ms50) | ja | 10 | Magic Sauce 50% 5g – 10-pack (173) | 3 999 | 4 950 | 19.2 % | i lager | nej (vanlig produkt) |
| 172 | Magic Sauce 50% – Donny Burger – 5g | family (ms50) | ja | 3 | Magic Sauce 50% 5g – 3-pack (167) | 1 380 | 1 485 | 7.1 % | i lager | nej (vanlig produkt) |
| 172 | Magic Sauce 50% – Donny Burger – 5g | family (ms50) | ja | 5 | Magic Sauce 50% 5g – 5-pack (170) | 2 200 | 2 475 | 11.1 % | i lager | nej (vanlig produkt) |
| 172 | Magic Sauce 50% – Donny Burger – 5g | family (ms50) | ja | 10 | Magic Sauce 50% 5g – 10-pack (173) | 3 999 | 4 950 | 19.2 % | i lager | nej (vanlig produkt) |
| 261 | Magic Sauce 3.0 - 2ml | strain | ja | 3 | MS 3.0 – 2ml – 3-pack (145) | 1 599 | 1 725 | 7.3 % | i lager | nej (vanlig produkt) |
| 261 | Magic Sauce 3.0 - 2ml | strain | ja | 5 | MS 3.0 – 2ml – 5-pack (147) | 2 530 | 2 875 | 12 % | i lager | nej (vanlig produkt) |
| 261 | Magic Sauce 3.0 - 2ml | strain | ja | 9K | MS 3.0 – 2ml – Kollektion (149) | 4 099 | 5 175 | 20.8 % | i lager | nej (vanlig produkt) |
| 134 | Magic Sauce 50% – Gorilla Cookies – 5g | family (ms50) | ja | 3 | Magic Sauce 50% 5g – 3-pack (167) | 1 380 | 1 485 | 7.1 % | i lager | nej (vanlig produkt) |
| 134 | Magic Sauce 50% – Gorilla Cookies – 5g | family (ms50) | ja | 5 | Magic Sauce 50% 5g – 5-pack (170) | 2 200 | 2 475 | 11.1 % | i lager | nej (vanlig produkt) |
| 134 | Magic Sauce 50% – Gorilla Cookies – 5g | family (ms50) | ja | 10 | Magic Sauce 50% 5g – 10-pack (173) | 3 999 | 4 950 | 19.2 % | i lager | nej (vanlig produkt) |
| 132 | Magic Sauce 50% – Yoda Ice Cream – 5g | family (ms50) | ja | 3 | Magic Sauce 50% 5g – 3-pack (167) | 1 380 | 1 485 | 7.1 % | i lager | nej (vanlig produkt) |
| 132 | Magic Sauce 50% – Yoda Ice Cream – 5g | family (ms50) | ja | 5 | Magic Sauce 50% 5g – 5-pack (170) | 2 200 | 2 475 | 11.1 % | i lager | nej (vanlig produkt) |
| 132 | Magic Sauce 50% – Yoda Ice Cream – 5g | family (ms50) | ja | 10 | Magic Sauce 50% 5g – 10-pack (173) | 3 999 | 4 950 | 19.2 % | i lager | nej (vanlig produkt) |
| 183 | 7% Nano11 – Lemon Sorbet – 5g | family (nano11) | ja | 3 | Nano 11 Buds 5g – 3-pack (179) | 1 680 | 1 785 | 5.9 % | i lager | nej (vanlig produkt) |
| 183 | 7% Nano11 – Lemon Sorbet – 5g | family (nano11) | ja | 5 | Nano 11 Buds 5g – 5-pack (181) | 2 700 | 2 975 | 9.2 % | i lager | nej (vanlig produkt) |
| 183 | 7% Nano11 – Lemon Sorbet – 5g | family (nano11) | ja | 10 | Nano 11 Buds 5g – 10-pack (184) | 4 879 | 5 950 | 18 % | i lager | nej (vanlig produkt) |
| 193 | 7% Nano11 – Strawberry OG – 5g | family (nano11) | ja | 3 | Nano 11 Buds 5g – 3-pack (179) | 1 680 | 1 785 | 5.9 % | i lager | nej (vanlig produkt) |
| 193 | 7% Nano11 – Strawberry OG – 5g | family (nano11) | ja | 5 | Nano 11 Buds 5g – 5-pack (181) | 2 700 | 2 975 | 9.2 % | i lager | nej (vanlig produkt) |
| 193 | 7% Nano11 – Strawberry OG – 5g | family (nano11) | ja | 10 | Nano 11 Buds 5g – 10-pack (184) | 4 879 | 5 950 | 18 % | i lager | nej (vanlig produkt) |
| 192 | 7% Nano11 – Gary Payton – 5g | family (nano11) | ja | 3 | Nano 11 Buds 5g – 3-pack (179) | 1 680 | 1 785 | 5.9 % | i lager | nej (vanlig produkt) |
| 192 | 7% Nano11 – Gary Payton – 5g | family (nano11) | ja | 5 | Nano 11 Buds 5g – 5-pack (181) | 2 700 | 2 975 | 9.2 % | i lager | nej (vanlig produkt) |
| 192 | 7% Nano11 – Gary Payton – 5g | family (nano11) | ja | 10 | Nano 11 Buds 5g – 10-pack (184) | 4 879 | 5 950 | 18 % | i lager | nej (vanlig produkt) |
| 190 | 7% Nano11 – Crystal Snow – 5g | family (nano11) | ja | 3 | Nano 11 Buds 5g – 3-pack (179) | 1 680 | 1 785 | 5.9 % | i lager | nej (vanlig produkt) |
| 190 | 7% Nano11 – Crystal Snow – 5g | family (nano11) | ja | 5 | Nano 11 Buds 5g – 5-pack (181) | 2 700 | 2 975 | 9.2 % | i lager | nej (vanlig produkt) |
| 190 | 7% Nano11 – Crystal Snow – 5g | family (nano11) | ja | 10 | Nano 11 Buds 5g – 10-pack (184) | 4 879 | 5 950 | 18 % | i lager | nej (vanlig produkt) |
| 139 | High Life – Northern Lights – 5g | family (highlife) | ja | 3 | High Life 5g – 3-pack (174) | 1 657 | 2 085 | 20.5 % | i lager | nej (vanlig produkt) |
| 139 | High Life – Northern Lights – 5g | family (highlife) | ja | 5 | High Life 5g – 5-pack (176) | 2 673 | 3 475 | 23.1 % | i lager | nej (vanlig produkt) |
| 137 | High Life – Malaga Magic – 5g | family (highlife) | ja | 3 | High Life 5g – 3-pack (174) | 1 657 | 2 085 | 20.5 % | i lager | nej (vanlig produkt) |
| 137 | High Life – Malaga Magic – 5g | family (highlife) | ja | 5 | High Life 5g – 5-pack (176) | 2 673 | 3 475 | 23.1 % | i lager | nej (vanlig produkt) |
| 148 | EL Gringo – Strawberry Shortcake – 5g | family (highlife) | ja | 3 | High Life 5g – 3-pack (174) | 1 657 | 2 085 | 20.5 % | i lager | nej (vanlig produkt) |
| 148 | EL Gringo – Strawberry Shortcake – 5g | family (highlife) | ja | 5 | High Life 5g – 5-pack (176) | 2 673 | 3 475 | 23.1 % | i lager | nej (vanlig produkt) |
| 255 | Hero's Core - 2ml | strain | ja | 3 | Hero’s Core 2ml – 3-pack (159) | 1 920 | 2 025 | 5.2 % | i lager | nej (vanlig produkt) |
| 255 | Hero's Core - 2ml | strain | ja | 5 | Hero’s Core 2ml – 5-pack (162) | 3 135 | 3 375 | 7.1 % | i lager | nej (vanlig produkt) |
| 255 | Hero's Core - 2ml | strain | ja | 6K | Hero’s Core 2ml – Kollektion (164) | 3 645 | 4 050 | 10 % | i lager | nej (vanlig produkt) |
| 196 | Magic Sauce 50% – Charas – 5g | family (ms50) | ja | 3 | Magic Sauce 50% 5g – 3-pack (167) | 1 380 | 1 485 | 7.1 % | i lager | nej (vanlig produkt) |
| 196 | Magic Sauce 50% – Charas – 5g | family (ms50) | ja | 5 | Magic Sauce 50% 5g – 5-pack (170) | 2 200 | 2 475 | 11.1 % | i lager | nej (vanlig produkt) |
| 196 | Magic Sauce 50% – Charas – 5g | family (ms50) | ja | 10 | Magic Sauce 50% 5g – 10-pack (173) | 3 999 | 4 950 | 19.2 % | i lager | nej (vanlig produkt) |
| 187 | Buds – 7% Nano11 – Raspberry Popcorn – 5 gram | family (nano11) | ja | 3 | Nano 11 Buds 5g – 3-pack (179) | 1 680 | 1 785 | 5.9 % | i lager | nej (vanlig produkt) |
| 187 | Buds – 7% Nano11 – Raspberry Popcorn – 5 gram | family (nano11) | ja | 5 | Nano 11 Buds 5g – 5-pack (181) | 2 700 | 2 975 | 9.2 % | i lager | nej (vanlig produkt) |
| 187 | Buds – 7% Nano11 – Raspberry Popcorn – 5 gram | family (nano11) | ja | 10 | Nano 11 Buds 5g – 10-pack (184) | 4 879 | 5 950 | 18 % | i lager | nej (vanlig produkt) |
| 131 | Buds – 7% Nano11 – Lemon Purple – 5 gram | family (nano11) | ja | 3 | Nano 11 Buds 5g – 3-pack (179) | 1 680 | 1 785 | 5.9 % | i lager | nej (vanlig produkt) |
| 131 | Buds – 7% Nano11 – Lemon Purple – 5 gram | family (nano11) | ja | 5 | Nano 11 Buds 5g – 5-pack (181) | 2 700 | 2 975 | 9.2 % | i lager | nej (vanlig produkt) |
| 131 | Buds – 7% Nano11 – Lemon Purple – 5 gram | family (nano11) | ja | 10 | Nano 11 Buds 5g – 10-pack (184) | 4 879 | 5 950 | 18 % | i lager | nej (vanlig produkt) |
| 177 | Buds – 7% Nano11 – Snow White Popcorn – 5 gram | family (nano11) | ja | 3 | Nano 11 Buds 5g – 3-pack (179) | 1 680 | 1 785 | 5.9 % | i lager | nej (vanlig produkt) |
| 177 | Buds – 7% Nano11 – Snow White Popcorn – 5 gram | family (nano11) | ja | 5 | Nano 11 Buds 5g – 5-pack (181) | 2 700 | 2 975 | 9.2 % | i lager | nej (vanlig produkt) |
| 177 | Buds – 7% Nano11 – Snow White Popcorn – 5 gram | family (nano11) | ja | 10 | Nano 11 Buds 5g – 10-pack (184) | 4 879 | 5 950 | 18 % | i lager | nej (vanlig produkt) |
| 180 | Buds – 7% Nano11 – Abacous – 5 gram | family (nano11) | ja | 3 | Nano 11 Buds 5g – 3-pack (179) | 1 680 | 1 785 | 5.9 % | i lager | nej (vanlig produkt) |
| 180 | Buds – 7% Nano11 – Abacous – 5 gram | family (nano11) | ja | 5 | Nano 11 Buds 5g – 5-pack (181) | 2 700 | 2 975 | 9.2 % | i lager | nej (vanlig produkt) |
| 180 | Buds – 7% Nano11 – Abacous – 5 gram | family (nano11) | ja | 10 | Nano 11 Buds 5g – 10-pack (184) | 4 879 | 5 950 | 18 % | i lager | nej (vanlig produkt) |
| 152 | Hash – Magic Sauce 50% – Marrakesh Dream – 5 gram | family (ms50) | ja | 3 | Magic Sauce 50% 5g – 3-pack (167) | 1 380 | 1 485 | 7.1 % | i lager | nej (vanlig produkt) |
| 152 | Hash – Magic Sauce 50% – Marrakesh Dream – 5 gram | family (ms50) | ja | 5 | Magic Sauce 50% 5g – 5-pack (170) | 2 200 | 2 475 | 11.1 % | i lager | nej (vanlig produkt) |
| 152 | Hash – Magic Sauce 50% – Marrakesh Dream – 5 gram | family (ms50) | ja | 10 | Magic Sauce 50% 5g – 10-pack (173) | 3 999 | 4 950 | 19.2 % | i lager | nej (vanlig produkt) |

## Paket som ingen basprodukt säljer

| NH-id | Woo-paket | Delar | Pris | Woo-lager | Woo-synlighet |
|---:|---|---|---:|---|---|
| 246 | Startpaket – M3b Pro Batteri + 2× THCA-B 50% 1ml | ccell-m3b-vape-batteri-510, thca-b-faraoh-carts-1ml | 675 | insufficientstock | search |
| 240 | THCA-B 50% Faraoh 1ml – 3-pack | thca-b-faraoh-carts-1ml | 1 101 | insufficientstock | hidden |
| 205 | Startpaket – M3b Pro Batteri + 2× Magic Sauce 3.0 1ml | ccell-m3b-vape-batteri-510, cart-magic-sauce-magic-farmers-1ml | 675 | insufficientstock | visible |

## Familjer (tillåtna produkter i familjebyggaren)

**ms50 – Magic Sauce 50% 5g** (17): 132 Magic Sauce 50% – Yoda Ice Cream – 5g · 134 Magic Sauce 50% – Gorilla Cookies – 5g · 146 Magic Sauce 50% – Tinky Winky – 5g · 152 Hash – Magic Sauce 50% – Marrakesh Dream – 5 gram *(public but direct-only)* · 155 Magic Sauce 50% – Samurai Jack – 5g · 168 Magic Sauce 50% – Khalifa Kush – 5g · 172 Magic Sauce 50% – Donny Burger – 5g · 175 Magic Sauce 50% – Crazy Dog – 5g · 188 Magic Sauce 50% – KitKat – 5g · 196 Magic Sauce 50% – Charas – 5g · 198 Magic Sauce 50% – La Chupacabra – 5g · 201 Magic Sauce 50% – Titty Sprinkles – 5g · 203 Magic Sauce 50% – John Lemon – 5g · 221 Magic Sauce 50% – Kowa Bunga – 5g · 226 Magic Sauce 50% – London Lobster – 5g · 228 Magic Sauce 50% – Dubai Chocolate – 5g · 231 Magic Sauce 50% – Grape Gasoline – 5g

**nano11 – Nano 11 Buds 5g** (16): 131 Buds – 7% Nano11 – Lemon Purple – 5 gram *(package/child product)* · 177 Buds – 7% Nano11 – Snow White Popcorn – 5 gram *(package/child product)* · 180 Buds – 7% Nano11 – Abacous – 5 gram *(package/child product)* · 183 7% Nano11 – Lemon Sorbet – 5g *(package/child product)* · 187 Buds – 7% Nano11 – Raspberry Popcorn – 5 gram *(package/child product)* · 190 7% Nano11 – Crystal Snow – 5g *(package/child product)* · 191 7% Nano11 – Bubba Kush – 5g · 192 7% Nano11 – Gary Payton – 5g *(package/child product)* · 193 7% Nano11 – Strawberry OG – 5g *(package/child product)* · 194 7% Nano11 – Royal OG – 5g · 197 7% Nano11 – Critical Berries – 5g · 200 7% Nano11 – Zkittlez Mousse – 5g · 206 7% Nano11 – Lemon Mandarine – 5g *(package/child product)* · 208 7% Nano11 – Orange Zkittlez – 5g · 210 7% Nano11 – Godzilla – 5g *(package/child product)* · 213 7% Nano11 – Naranja Pop. – 5g *(package/child product)*

**highlife – High Life / El Gringo 5g** (5): 135 High Life – White Widow – 5g *(public but direct-only)* · 137 High Life – Malaga Magic – 5g · 139 High Life – Northern Lights – 5g · 148 EL Gringo – Strawberry Shortcake – 5g · 204 High Life – Gelato – 5g *(public but direct-only)*
