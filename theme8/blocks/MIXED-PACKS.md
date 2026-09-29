# Blandade strains i paket — spik, blockerare och minsta väg

Verifierat 2026-09-28 i Theme 8-preview med testkorg (inget köp).

## Vad Nyehandel gör idag

| Test | Resultat |
|---|---|
| 3 olika strains (3 `cart/item`-rader) | 3 × 745 kr = 2 235 kr — pristrappan gäller **per variantrad**, inte per produkt |
| 5 st av en strain | 5 × 396 kr = 1 980 kr (trappnivå 5) — korrekt, fungerar redan |
| `POST /frontend-api/cart/item` med `meta: {…}` | Sparas och returneras på raden (`item.meta`). Pris = variantens trappa. Lager dras från **den enda** varianten. Kassan visar inte meta. |
| `product.is_package` | Finns i datamodellen, men ingen av sortimentets 104 produkter är ett paket |
| "3 för 2"/kampanjdata | Ingen sådan data i Nyehandel för någon produkt |

Nyehandels frontend har redan stöd för **paketprodukter**: när
`product.is_package` är sant väljer kunden en variant per paketplats
(`product/setPackageVariant({ key, variant })`), köpknappen kräver att
alla barnvarianter är köpbara, och raden läggs med

```json
POST /frontend-api/cart/item
{
  "product_variant_id": 9001,
  "quantity": 1,
  "meta": { "data": { "packageProductVariants": [
    { "id": 186, "pivot_id": 1 },
    { "id": 186, "pivot_id": 2 },
    { "id": 187, "pivot_id": 3 },
    { "id": 187, "pivot_id": 4 },
    { "id": 188, "pivot_id": 5 }
  ] } }
}
```

(ur `foundation.js`; `9001` = paketproduktens variant, `186–188` =
strainvarianterna, `pivot_id` = paketets platser).

## Minsta hållbara väg (kräver admin — inte gjord)

1. Skapa en paketprodukt per produkt och storlek i Nyehandel, t.ex.
   "Cart – THC-A 45% – Faraoh – 5-pack", med paketpriset (1 980 kr) och
   5 paketplatser som var och en tillåter produktens strainvarianter.
2. Bekräfta med Nyehandel att en paketorder (a) drar lager från de valda
   barnvarianterna och (b) visar valda strains på orderraden i admin och
   i kassan.
3. Slå på `HZ8.flags.mixedPacks` i `theme8/js/83-pdp-purchase.js` och
   koppla byggarens platser till `setPackageVariant` + paketproduktens
   variant i stället för den vanliga varianten.

Tills dess: vanliga paket med en och samma strain fungerar med korrekt
pris (antal på en variant). Byggaren kan förhandsvisas med
`?hz8-mixed=1`; köpknappen är då låst ("Blandade paket kommer snart").

## Byggaren (2026-09-29, `83-pdp-purchase.js`)

- Paketstorlek väljs först (Nyehandels egna paket-/antalsknappar). Vid 2+
  visas en rad per plats med variantbild om Nyehandel har en, annars
  platsnumret.
- "Slumpa strains" fyller alla platser med köpbara strains och tar
  aldrig fler av en strain än dess `available_stock`. Slutsålda strains
  väljs aldrig. Varje plats kan ändras efteråt, och val som skulle
  överskrida lagret är spärrade.
- Köp är låst tills alla platser är giltiga **och** en verifierad
  paketprodukt finns i `PACKAGE_PRODUCTS` (`{ produktId: { storlek:
  paketvariantId } }`, tom idag) **och** `HZ8.flags.mixedPacks` är på.
- `HZ8.mixedPack.payload()` bygger payloaden ovan av valen. Köpknappen
  skickar den som en rad och öppnar sedan minicarten.

## Önskat paketpris mot Nyehandels pris idag

Uppmätt i previewn, Cart THC-A 45 % Faraoh 1 ml, 5-pack (nivåpris 396 kr/st):

| Val | Önskat (paket) | Nyehandel idag (en rad per strain) |
|---|---|---|
| 5 × samma strain | 1 980 kr | 1 980 kr |
| 3 + 1 + 1 | 1 980 kr | 3 × 420,75 + 495 + 495 = **2 252,25 kr** |
| 2 + 2 + 1 | 1 980 kr | 2 × 495 + 2 × 495 + 495 = **2 475 kr** |

Skillnaden visas bara i förhandsvisningen. Ingen frontendrabatt läggs
på, eftersom Nyehandel ska ta det pris som visas.

## Befintliga Nyehandel-modeller

- **Paketprodukt (`is_package`)**: den enda modell som bär ett eget pris
  och valda barnvarianter i en rad. Frontendstödet finns i `foundation.js`.
  Lagerdragning per barnvariant och hur orderraden visas är **inte
  verifierat**. Ingen paketprodukt finns i katalogen, och en dold
  testprodukt kräver admin (ADMIN-TODO.md punkt 7).
- **Fast bundle / kombo** (som WooCommerce "Kombo – …"): fast innehåll,
  ingen strainval per plats. Duger inte för blandade paket.
- **Rad-`meta`**: sparas på raden men påverkar varken pris eller lager.
  Duger inte.
