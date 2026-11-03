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
