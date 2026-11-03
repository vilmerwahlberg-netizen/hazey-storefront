# Route-avstämning: Nyehandel-kategorier ↔ Theme 8

TASK 17 · 2026-11-03. Underlag: `runs/nh.json` (alla 68 kategorier som nås från startsidan, Alla produkter, Theme 8-koden och produktsidornas brödsmulor/relaterade kategorier, med alla sidor), `runs/nh-facets.json`, `runs/routes-before.json` och `runs/routes-after.json` (statisk genomgång av `theme8/js`), samt `runs/verify-*.json` (renderat i previewen med lokal build).

## 1. Statisk genomgång av Theme 8-koden

| | Före (origin/dev 5ad3944) | Efter TASK 17 |
|---|---|---|
| Kategori-routes i koden: OK (finns, har produkter) | 49 | 69 |
| TOM (finns, 0 produkter) | 18 | 7 – bara legacy HHCPM/THCNM (6) och THCa-kortet (ägarbeslut) |
| DÖD (Serie-/Varumärke-filter som inte finns) | 4 + 1 i relationskartan (`alla-cartridges?filters=Serie_Magic Sauce`) | 0 |
| Produkt-routes i koden som inte finns | 22 av 25 | 4 av 51 – alla i startsidans omdömeslista, medvetet kvar (STALE-ID-MAP.md) |
| Numeriska produkt-id som finns i Nyehandel | 0 av 21+ | alla (FAMILIES 38, PACKAGE_PLAN 49, VERIFIED_DOCS 18) |

## 2. Kategori för kategori

Kolumner: Nyehandel-route (H1, antal i dag) · vad Theme 8 använde före · efter · kommentar. "Olistade" = produkter i kategorin som WooCommerce inte listar (paket, strainbarn, sökbara) – rättas i admin, inte i Theme 8.

### Breda formatsidor

| Route | H1 / antal | Theme 8 före → efter | Kommentar |
|---|---|---|---|
| `alla-produkter` | Alla produkter / 140 | portal, Bästsäljare-källa, minicartens reserv | 63 olistade (alla Woo-dolda) |
| `alla-vapes` | Alla Vapes / 37 | Vapes-meny + CTA | 24 olistade |
| `alla-cartridges` | Alla Carts / 9 | Carts | 6 olistade |
| `blommor-buds` | Alla Buds / 64 | Buds-meny + CTA | 27 olistade |
| `hasch` | Allt Hasch / 19 | Hasch-meny + CTA | 4 olistade |
| `pennor` | Pennor/Batteri / 9 | 510-batterier | 3 olistade |
| `alla-liquids` | Alla Liquids / 2 | `null` → **Refill/Liquid 10 ml** | ny; 1 av 2 olistad (kollektionen) |
| `cbd` | CBD / 21 | `h4cbd` → **CBD (meny, CTA, sidfot)** | `h4cbd` (5) är H4CBD-familjen |
| `alla-vapes?typ=vapes&volym=1ml/2ml/5ml` | (Alla Vapes) | `null` → **1/2/5 ml engångsvapes** | Theme 8:s egna, verifierade volymstate; 1+1 ml = 2 ml |

### Seriehubbar (06-catalog-map.js `hub`)

| Serie | Före | Efter | Antal i dag | Kommentar |
|---|---|---|---|---|
| Magic Sauce | `magic-sauce` | `magic-sauce` | 39 | 17 olistade, varav D10-paket (admin) |
| THCaB | `thca` (tom) | **`thca-b`** | 4 | alla 4 olistade; Woo visar THCA-B-sidan utan produkter |
| THCbA | `thcb` (THCB legacy) | **`thcba`** | 8 | 7 olistade (paket, felkategoriserade THCA-B-paket) |
| Core | `core` (tom) | **`hero-vapes`** | 11 | Core-vape + High Life + El Gringo; 7 olistade |
| D10 | `10-oh-thc` (tom, **10-OH-THC**), legacy | **`d10-1`**, inte legacy | 9 | exakt = Woo `d10` |
| Nano-11 | `nano-11` | `nano-11` | 22 | 16 olistade strainbarn/paket |
| THCV / HHCPM / THCNM | legacy | legacy (oförändrat) | 4 / 0 / 0 | inga automatiska länkar |

### Serie × format (05-header.js SERIER-länkar + 06 `extra`)

| Kombination | Före | Efter | Antal i dag |
|---|---|---|---|
| Magic Sauce · vapes | `m-s-vapes` (tom) | **`ms-vapes`** (navHref oförändrad: Alla Vapes `?serie=magic-sauce`) | 15 |
| Magic Sauce · carts | `alla-cartridges?filters=Serie_Magic Sauce` (död) | **`ms-carts`** | 1 |
| Magic Sauce · buds | `m-s-buds` (tom) | **`ms-buds`** | 21 |
| Magic Sauce · hasch | `hasch?filters=Serie_Magic Sauce` (död) | **`ms-hash`** | 5 |
| THCaB · vapes | `thca-vapes` (tom) | **`thcab-vapes`** | 4 |
| THCaB · carts | `thca-carts` (tom) | – (carten ligger i `thcab-vapes`) | – |
| THCaB · buds / hasch | `thca-blommor` / `thca-hash` (tomma) | `null` (finns inte) | – |
| THCbA · vapes | `thcb-vapes` (**THCB**) | **`thcba-vapes`** | 8 |
| THCbA · carts | `thcb-carts` (tom) | – | – |
| Core · vapes | `alla-vapes?filters=Serie_Core` (död) | **`core-vapes`** | 4 |
| Core · hasch | `null` | **`high-life-hash`** | 3 |
| Core · buds | `null` | `null` (bara sökbara i Woo) | – |
| D10 · vapes | `10-oh-thc-vapes` (tom, **10-OH-THC**) | **`d10-vapes`** | 1 |
| D10 · buds / hasch | `null` | **`d10-buds` / `d10-hash`** | 4 / 4 |
| Nano11 · buds | `nano11-blommor` | `nano11-blommor` | 21 |
| THCV · vapes / carts | `thcv-vape` / `thcv-carts` (tom) | `thcv-vape` / – | 4 / – |
| HHCPM, THCNM | tomma | oförändrat (legacy, ägarbeslut 8) | 0 |
| CBD · buds | `cbd-buds` (tom) | **`cbd-buds-1`** | 12 |
| CBD · vapes | `h4cbd-vape` (H4CBD) | **`cbd-vapes`** | 6 |
| CBD · hasch | `h4cbd-hasch` | oförändrat | 1 |

### Övriga Theme 8-kopplingar

| Koppling | Fil | Före | Efter |
|---|---|---|---|
| Startsidans seriekort | 40-catalog.js | THCaB → `thcb` (THCB), D10 → `alla-vapes`, Nano-11 → `alla-produkter` | THCaB → `thca-b`, D10 → `d10-1`, Nano-11 → `nano-11`; THCa → `thca` kvar (ägarbeslut 9) |
| Seriesektionens "Handla" | 45-series-education.js | `thca?filters=Varumärke_Faraoh`, `thcb?filters=Varumärke_Faraoh` (döda) | `thca-b`, `thcba` |
| Sidfoten | 60-social-footer.js | THCA-B → `thca`, CBD → `h4cbd` | `thca-b`, `cbd` |
| Seriehubbens format | 81-series-hub.js | typ bara ur namnets första ord | + reserv: typord var som helst i namnet (pre-rolls först) → Pre-rolls syns som eget format |
| Syskonserie (D10 i Magic Sauce) | 81-series-hub.js | `alla-vapes?filters=Serie_D10` (död) | seriens egen route `d10-vapes`; raden visas först när varumärket finns på korten (admin) |
| Pausregeln | 80-category.js | D10 pausad som 10-OH-THC | bara HHCPM/THCNM/10-OH-THC |
| "Fler i serien" (PDP) | 85-pdp-pilot.js | produktens relaterade kategorier → gamla routes | samma logik, nu med de importerade routes (ms-*, d10-*, thcba-vapes …) |
| Minicartens rekommendationer | 84-cart.js | `alla-produkter`-sidor + formatets route | oförändrad kod; källan läcker olistade tills admin döljer dem |
| Paket-/familjeregister | 85-pdp-pilot.js | gamla id | nya id (STALE-ID-MAP.md) |
| Analys-PDF:er | 85-pdp-pilot.js | gamla S3-filer, inte längre länkade | nya filer, verifierade per strain |

## 3. Verifiering i previewen (lokal build, 393 och 1440)

Se REPORT.md, avsnitt 10, för tabellen per route och PDP (före/efter).
