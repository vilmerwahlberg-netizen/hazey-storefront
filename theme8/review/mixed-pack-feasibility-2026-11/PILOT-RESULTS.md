# Task 19: resultat från pilotpaketen 263 och 264

Körd 2026-11-06 och 2026-11-08. Varje scenario körs i en egen isolerad headless-session med desktop-UA via Theme 8-previewn (`?preview=v9kzdmqz4w60l5n`). Varukorgen lades och lästes, `/sv/checkout` med Kustom renderades och korgen tömdes sedan. Alla korgar är tomma efteråt (`cleaned: true`). **Ingen order och ingen betalning.**

Underlag:
- Rådata: `evidence/cart-runs/P1-*.json`, `P2-*.json`, `package-263-structure.json`, `package-264-structure.json`
- Skärmbilder: ersatta av Theme 8-provets bilder i `evidence/shots/UI-*.jpg` (se `THEME8-PROV.md`)
- Script: `evidence/probe-package.mjs`, `evidence/scenarios.mjs`, `evidence/probe-checkout.mjs`

**Status 2026-11-08:** 263 är **aktiv**. 264 är **inaktiv** (sidan ger 301 till `/sv`, och servern nekar varianten 468 i varukorgen med `406 cart_item_not_available`). Theme 8-provet mot 263 finns i `THEME8-PROV.md`.

## Pilotobjekt (skapade av Chrome-agenten)

| | P1 | P2 |
|---|---|---|
| Produkt-id / paketvariant | 263 / **467** | 264 / **468** |
| SKU | HZ-T19-CORE-3PK | HZ-T19-MS50-3PK |
| Pris | 1 920 kr | 1 380 kr |
| `is_package` / `parts_buyable` / typ | true / true / 3 | true / true / 3 |
| Paketvariantens lager | spåras inte (`track 0`) | spåras inte |
| Paketrader ur PDP-HTML | `package-product-variants`: produkt 255, **pivot 1, 2, 3**, `locked-variant=false`, förval 425 | `package-product`: produkt 132, **pivot 4, 5, 6**, låst variant 243 |
| Direktlänk | `/sv/products/pilot-t19-heros-core-2ml-3-pack` (svarar 200, aktiv) | `/sv/products/pilot-t19-magic-sauce-50-5g-3-pack` (svarade 200 under provet; nu 301, inaktiv) |

## P1 Core vapes: variantblandning fungerar

Payload: `POST /frontend-api/cart/item {product_variant_id: 467, quantity: N, meta: {data: {packageProductVariants: [{id, pivot_id}]}}}`

| Scenario | Serverns svar | Korgen | Kassan (Kustom-sidan) |
|---|---|---|---|
| S1: Gelato, Melon Haze, Coconut Cake (425/431/438 → pivot 1/2/3) | 200 | **1 rad, 1 920 kr**. `package_items` med variant (`laravel_through_key`) 425, 431, 438 | "Paketet innehåller" med de tre strainsen. Delsumma 1 920, frakt 49, totalt 1 969 kr |
| S2: Gelato × 3 | 200 | 1 920 kr. Servern slår ihop till `{id 425, pivot 1, quantity 3}` | Gelato visas. Delsumma 1 920 kr |
| S3: Strawberry Kush × 2 + Pineapple Express | 200 | 1 920 kr. `{429, pivot 1, qty 2}, {433, pivot 3, qty 1}` | Båda strainsen visas |
| S4: två olika paket | 200, 200 | **2 rader**, 3 840 kr. Varje rad har sitt eget innehåll | Båda paketen med sina strains |
| V1: variant 243 (MS50) i pivot 3 | **406** `cart_item_data_is_invalid` | tom | – |
| V2: Gelato × 3, antal 24 (72 st, men lagret är 69) | 200 men **kapat till 23 paket** (69 st) | 44 160 kr = 23 × 1 920 | – |
| V3: pivot-id 4–6 från ett annat paket | **406** | tom | – |
| V4: bara två platser | **406** | tom | – |
| V5: ingen meta | **406** | tom | – |
| V6: samma pivot tre gånger | **406** | tom | – |

Slutsats för P1: **Fungerar i dag**, med Nyehandels egen paketartikel och tre olåsta rader av samma produkt.
- Rätt pris och rätt variant per plats.
- Servern validerar produkt, pivot, antal platser och totalt lager.
- Kassan visar innehållet. Kustom fick summan 1 969 kr inkl. frakt (iframen syns i skärmbilderna).

Kvar:
1. **Lagerdrag vid order är inte provat**, eftersom ingen order fick läggas. Officiellt API: `package` "has no stock of its own" och orderraden sparar `package_items` med `product_variant_id`/`sku`. Kapningen i V2 visar att servern räknar barnvariantens lager.
2. Kustom körs i **testläge** ("Test Mode", "Test Shop", `js.playground.kustom.co`). Det är inte orsakat av piloten.

## P2 MS buds/hasch: separata produkter fungerar inte

| Scenario | Serverns svar |
|---|---|
| S0: låst Yoda 243 × 3 (pivot 4–6) | 200, 1 380 kr. Kassan visar "Paketet innehåller Yoda Ice Cream" |
| V1: 243 / **324 John Lemon** / **303 KitKat** | **406 `cart_item_data_is_invalid`** |
| V2: med slutsåld 257 Tinky Winky | **406** |
| V3: med Core-variant 425 | **406** |

Slutsats för P2: Servern godtar **inte** en variant från en annan produkt i en paketrad, och det finns inget i admin för flera produkter per rad. Blandning mellan separata produkter **kräver egen integration**, eller att strainsen redan är varianter av en produkt.

## Fel i Theme 8-koden

- **Rättat i Task 19:** `85-pdp-pilot.js` och `84-cart.js` skickade `{slot, product_variant_id}`. Nu skickas `{id, pivot_id}` med pivot-id som läses ur paketprodukten; se `THEME8-PROV.md`.
- **Kvar:** `83-pdp-purchase.js` gissar `pivot_id = i + 1`. Det stämmer för 263 men **inte** för 264 (4–6). Byggaren i 83 är avstängd (`mixedPacks = false`).
