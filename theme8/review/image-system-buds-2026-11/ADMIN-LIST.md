# Adminlista — TASK 17C (2026-11-05)

Exakt underlag för ändringar i Nyehandel-admin. **Inget av detta är gjort** — Theme 8 läser ändringarna automatiskt när de görs.
Varje rad är kontrollerad live mot Nyehandel i samma körning som listan skrevs (`node admin-list.mjs`). Facit = WooCommerce (Task 17:s katalogmatris).
SKU = varianternas SKU i Nyehandel (`HZY-WC-<Woo-id>`).

## 1. Skapa kategorin Pre-rolls (3 produkter)

Föreslagen slug `pre-rolls`, under Alla produkter. Behåll produkternas nuvarande Buds-/Hasch-kategorier. När kategorin finns visar Alla Buds den under Produkttyp utan kodändring (filter-hooken läser kategorin). Pre-roll-paketen ska inte in här — de döljs i punkt 2.

| NH-id | Slug | Namn | SKU | Live i kategorier nu |
|---|---|---|---|---|
| 257 | `magic-sauce-pre-rolls-1g` | Magic Sauce 50% – Pre Rolls – 1g | HZY-WC-396317 | alla-produkter, blommor-buds, hasch |
| 165 | `7-nano11-prerolled-1-gram` | 7% Nano11 – Prerolled – 1 gram | HZY-WC-350672 | alla-produkter, blommor-buds |
| 258 | `cbd-prerolled-cookies-1g` | CBD – Cookies – 1g | HZY-WC-381911 | alla-produkter, blommor-buds, cbd-buds-1 |

## 2. Dölj paket och High Life-buds

### 2a. Paket (36) — dolda i WooCommerce, listade i Nyehandel

Sätt synlighet till dold (eller ta bort ur kategorierna). Paketens sidor och paketköp ska inte aktiveras — se Task 17:s PACKAGE-MIGRATION-PLAN.md.

| NH-id | Slug | Namn | SKU | Woo | Listad live i |
|---|---|---|---|---|---|
| 169 | `ms-3-0-5ml-5-pack` | MS 3.0 – 5ml – 5-pack | HZ-MS5ML-5PK | hidden | alla-produkter, alla-vapes |
| 166 | `ms-3-0-5ml-3-pack` | MS 3.0 – 5ml – 3-pack | HZ-MS5ML-3PK | hidden | alla-produkter, alla-vapes |
| 163 | `nano-11-pre-rolls-1g-5-pack` | Nano 11 Pre Rolls 1g – 5-pack | HZ-N11PR-5PK | hidden | alla-produkter, blommor-buds |
| 160 | `nano-11-pre-rolls-1g-10-pack` | Nano 11 Pre Rolls 1g – 10-pack | HZ-N11PR-10PK | hidden | alla-produkter, blommor-buds |
| 157 | `magic-sauce-50-pre-rolls-1g-10-pack` | Magic Sauce 50% Pre Rolls 1g – 10-pack | HZ-MSPR-10PK | hidden | alla-produkter, blommor-buds, hasch |
| 154 | `magic-sauce-50-pre-rolls-1g-5-pack` | Magic Sauce 50% Pre Rolls 1g – 5-pack | HZ-MSPR-5PK | hidden | alla-produkter, blommor-buds, hasch |
| 246 | `startpaket-thca-b-batteri` | Startpaket – M3b Pro Batteri + 2× THCA-B 50% 1ml | HZY-WC-392536 | search | alla-produkter, alla-cartridges |
| 150 | `thca-b-50-faraoh-1ml-10-pack` | THCA-B 50% Faraoh 1ml – 10-pack | HZ-THCAB50-1ML-10PK | hidden | alla-produkter, alla-cartridges |
| 245 | `d10-2ml-5-pack` | D10 2ml – 5-pack | HZ-D10-2ML-5PK | hidden | alla-produkter, alla-vapes |
| 243 | `d10-2ml-3-pack` | D10 2ml – 3-pack | HZ-D10-2ML-3PK | hidden | alla-produkter, alla-vapes |
| 241 | `thca-b-50-faraoh-1ml-5-pack` | THCA-B 50% Faraoh 1ml – 5-pack | HZ-THCAB50-1ML-5PK | hidden | alla-produkter, alla-vapes |
| 240 | `thca-b-50-faraoh-1ml-3-pack` | THCA-B 50% Faraoh 1ml – 3-pack | HZ-THCAB50-1ML-3PK | hidden | alla-produkter, alla-vapes |
| 239 | `thca-b-50-faraoh-2ml-5-pack` | THCA-B 50% Faraoh 2ml – 5-pack | HZ-THCAB50-2ML-5PK | hidden | alla-produkter, alla-vapes |
| 238 | `thca-b-50-faraoh-2ml-3-pack` | THCA-B 50% Faraoh 2ml – 3-pack | HZ-THCAB50-2ML-3PK | hidden | alla-produkter, alla-vapes |
| 205 | `startpaket-magic-sauce-batteri` | Startpaket – M3b Pro Batteri + 2× Magic Sauce 3.0 1ml | HZY-WC-385842 | visible | alla-produkter, alla-cartridges |
| 186 | `ms-30-10ml-kollektion` | MS 3.0 – 10ml – Kollektion | HZ-MS10ML-KOLL | hidden | alla-produkter |
| 184 | `nano11-buds-10-pack` | Nano 11 Buds 5g – 10-pack | HZ-NANO-10PK | hidden | alla-produkter, blommor-buds |
| 181 | `nano11-buds-5-pack` | Nano 11 Buds 5g – 5-pack | HZ-NANO-5PK | hidden | alla-produkter, blommor-buds |
| 179 | `nano11-buds-3-pack` | Nano 11 Buds 5g – 3-pack | HZ-NANO-3PK | hidden | alla-produkter, blommor-buds |
| 176 | `high-life-5g-5-pack` | High Life 5g – 5-pack | HZ-HL-5PK | hidden | alla-produkter, blommor-buds, high-life-buds, hero-vapes |
| 174 | `high-life-5g-3-pack` | High Life 5g – 3-pack | HZ-HL-3PK | hidden | alla-produkter, blommor-buds, high-life-buds, hero-vapes |
| 173 | `ms50-5g-10-pack` | Magic Sauce 50% 5g – 10-pack | HZ-MS50-10PK | hidden | alla-produkter, blommor-buds |
| 170 | `ms50-5g-5-pack` | Magic Sauce 50% 5g – 5-pack | HZ-MS50-5PK | hidden | alla-produkter, blommor-buds |
| 167 | `ms50-5g-3-pack` | Magic Sauce 50% 5g – 3-pack | HZ-MS50-3PK | hidden | alla-produkter, blommor-buds |
| 164 | `heros-core-2ml-kollektion` | Hero's Core 2ml – Kollektion | HZ-CORE-KOLL | hidden | alla-produkter, alla-vapes, hero-vapes |
| 162 | `heros-core-2ml-5-pack` | Hero's Core 2ml – 5-pack | HZ-CORE-5PK | hidden | alla-produkter, alla-vapes, hero-vapes |
| 159 | `heros-core-2ml-3-pack` | Hero's Core 2ml – 3-pack | HZ-CORE-3PK | hidden | alla-produkter, alla-vapes, hero-vapes |
| 156 | `ms-30-1ml-kollektion` | MS 3.0 – 1ml – Kollektion | HZ-MS1ML-KOLL | hidden | alla-produkter, alla-cartridges |
| 153 | `ms-30-1ml-5-pack` | MS 3.0 – 1ml – 5-pack | HZ-MS1ML-5PK | hidden | alla-produkter, alla-cartridges |
| 151 | `ms-30-1ml-3-pack` | MS 3.0 – 1ml – 3-pack | HZ-MS1ML-3PK | hidden | alla-produkter, alla-cartridges |
| 149 | `ms-30-2ml-kollektion` | MS 3.0 – 2ml – Kollektion | HZ-MS2ML-KOLL | hidden | alla-produkter, alla-vapes |
| 147 | `ms-30-2ml-5-pack` | MS 3.0 – 2ml – 5-pack | HZ-MS2ML-5PK | hidden | alla-produkter, alla-vapes |
| 145 | `ms-30-2ml-3-pack` | MS 3.0 – 2ml – 3-pack | HZ-MS2ML-3PK | hidden | alla-produkter, alla-vapes |
| 143 | `faraoh-thca-b-hela-kollektionen` | Faraoh THCbA Vape 2ml - Hela kollektionen | HZ-THCAB-8PK | hidden | alla-produkter, alla-vapes |
| 142 | `faraoh-thca-b-5-pack` | Faraoh THCbA Vape 2ml - 5-pack | HZ-THCAB-5PK | hidden | alla-produkter, alla-vapes |
| 140 | `faraoh-thca-b-3-pack` | Faraoh THCbA Vape 2ml - 3-pack | HZ-THCAB-3PK | hidden | alla-produkter, alla-vapes |

### 2b. High Life-produkter (2) — inte listade i WooCommerce, listade i Nyehandel

När de är dolda försvinner Core automatiskt ur seriefiltret på Alla Buds (Core har då 0 buds-träffar).

| NH-id | Slug | Namn | SKU | Woo | Listad live i |
|---|---|---|---|---|---|
| 204 | `high-life-gelato-hero-vapes-core-5g` | High Life – Gelato – 5g | HZY-WC-381673 | search | alla-produkter, blommor-buds, high-life-buds, hero-vapes |
| 135 | `high-life-white-widow-sativa-buds-5-gram-hero-vapes` | High Life – White Widow – 5g | HZY-WC-346747 | search | alla-produkter, blommor-buds, high-life-buds, hero-vapes |

Behåll (listade i Woo): 139 `high-life-hash-northern-lights-5g`, 137 `high-life-hash-malaga-magic-5g`.

## 3. Ta bort CBD-isolatet ur Buds (1)

Ta bort kategorin Alla Buds (`blommor-buds`) från produkten. Isolatet aktiveras inte (Task 17-regel). I dag ger det viktvalet "15 g" på Alla Buds.

| NH-id | Slug | Namn | SKU | Woo | Listad live i |
|---|---|---|---|---|---|
| 185 | `isolat-cbd-isolate-15-gram` | Isolat – CBD 99% – Isolate – 15 gram | HZY-WC-362373 | search | alla-produkter, blommor-buds, hasch, cbd-buds-1 |

## 4. Produkter utan bild (13)

De listade produkterna (PUBLIC + LISTED) först — de syns för kunder i dag. Övriga är paket/delprodukter som ändå döljs enligt punkt 2. Ladda upp produktbild. Är bilden frilagd (PNG med alfa) visas den automatiskt som R2B efter att bildmanifestet genererats om.

| NH-id | Slug | Namn | SKU | Synlighet (Woo) | Woo har bild |
|---|---|---|---|---|---|
| 234 | `d10-hash-blue-diamond-5g` | D10 60% – Blue Diamond – 5g | HZY-WC-391495 | PUBLIC + LISTED | ja (1) |
| 197 | `buds-nanno-11-critical-berries` | 7% Nano11 – Critical Berries – 5g | HZY-WC-384976 | PUBLIC + LISTED | ja (1) |
| 191 | `nano-buds-ersatt-thca-bubba-kush-5g` | 7% Nano11 – Bubba Kush – 5g | HZY-WC-384956 | PUBLIC + LISTED | ja (1) |
| 196 | `magic-sauce-hash-charas-5-gram` | Magic Sauce 50% – Charas – 5g | HZY-WC-369801 | PUBLIC + LISTED | ja (1) |
| 220 | `thcv-vape-cbd-group-2ml` | Vape - THC-V 20% - CBD Group - 2ml | HZY-WC-329247 | PUBLIC + LISTED | ja (1) |
| 160 | `nano-11-pre-rolls-1g-10-pack` | Nano 11 Pre Rolls 1g – 10-pack | HZ-N11PR-10PK | PACKAGE/CHILD PRODUCT | ja (1) |
| 245 | `d10-2ml-5-pack` | D10 2ml – 5-pack | HZ-D10-2ML-5PK | PACKAGE/CHILD PRODUCT | ja (1) |
| 240 | `thca-b-50-faraoh-1ml-3-pack` | THCA-B 50% Faraoh 1ml – 3-pack | HZ-THCAB50-1ML-3PK | PACKAGE/CHILD PRODUCT | ja (1) |
| 238 | `thca-b-50-faraoh-2ml-3-pack` | THCA-B 50% Faraoh 2ml – 3-pack | HZ-THCAB50-2ML-3PK | PACKAGE/CHILD PRODUCT | ja (1) |
| 162 | `heros-core-2ml-5-pack` | Hero's Core 2ml – 5-pack | HZ-CORE-5PK | PACKAGE/CHILD PRODUCT | ja (1) |
| 192 | `nano-buds-gary-payton-5-gram` | 7% Nano11 – Gary Payton – 5g | HZY-WC-363689 | PACKAGE/CHILD PRODUCT | ja (1) |
| 187 | `nano-buds-raspberry-popcorn-5-gram` | Buds – 7% Nano11 – Raspberry Popcorn – 5 gram | HZY-WC-363133 | PACKAGE/CHILD PRODUCT | ja (1) |
| 180 | `buds-nano11-abacous-5-gram` | Buds – 7% Nano11 – Abacous – 5 gram | HZY-WC-361805 | PACKAGE/CHILD PRODUCT | ja (1) |

## 5. Varumärke saknas eller är fel (140: 69 fel, 71 saknas)

Utan varumärke får produkten ingen universell PDP (och därmed ingen R2A/R2B-scen). "Fel" = Nyehandel säger Canapuff men varken namnet eller Woos tillverkarkategori stödjer det.
Förslaget kommer bara ur belägg (Woos tillverkarkategorier `magic-farmers`, `tatra-hemp`, `cookies`, `faraoh`, `cbd-group` och tillverkarnamn i produktnamnet). WooCommerce har inga varumärken satta, så rader utan belägg måste ägaren ange.

| NH-id | Slug | Namn | SKU | Nu | Status | Förslag | Belägg |
|---|---|---|---|---|---|---|---|
| 138 | `cookies-buds-cbd-hawaiian-rain` | CBD 30% – Hawaiian Rain – 3,5g | HZY-WC-383595 | Canapuff | fel | Cookies | Woo-kategori Cookies |
| 136 | `cbd-30-long-island-35g` | CBD 30% – Long Island – 3,5g | HZY-WC-383594 | Canapuff | fel | Cookies | Woo-kategori Cookies |
| 133 | `cbd-cookies-adios-m-f` | CBD 30% – Adios M.F. – 3,5g | HZY-WC-383592 | Canapuff | fel | Cookies | Woo-kategori Cookies |
| 232 | `cbd-buds-cookies-hollywood` | CBD 30% – Hollywood – 3,5g | HZY-WC-383587 | Canapuff | fel | Cookies | Woo-kategori Cookies |
| 230 | `cookies-cbd-buds-blue-raz` | CBD 30% – Blue Raz – 3,5g | HZY-WC-383580 | Canapuff | fel | Cookies | Woo-kategori Cookies |
| 227 | `cbd-hash-london-pound-cake-100g` | CBD Hash – London Pound Cake – 100g | HZY-WC-383170 | Canapuff | fel | Cookies | Woo-kategori Cookies |
| 128 | `cbd-buds-triple-scoop-cookies-cannabis` | CBD 30% – Triple Scoop – 3,5g | HZY-WC-337446 | Canapuff | fel | Cookies | Woo-kategori Cookies |
| 258 | `cbd-prerolled-cookies-1g` | CBD – Cookies – 1g | HZY-WC-381911 | Canapuff | fel | Cookies | Woo-kategori Cookies |
| 161 | `cbd-buds-cookies-tequila-sunrise-35-gram` | CBD 30% – Tequila Sunrise – 3,5g | HZY-WC-350421 | Canapuff | fel | Cookies | Woo-kategori Cookies |
| 130 | `cookies-cannabis-buds-cbd-cereal-milk-35-gram` | CBD 30% – Cereal Milk – 3,5g | HZY-WC-338043 | Canapuff | fel | Cookies | Woo-kategori Cookies |
| 256 | `thca-b-faraoh-carts-1ml` | THCA-B 50% - Faraoh - 1ml | HZY-WC-392215 | Canapuff | fel | Faraoh | namn Faraoh |
| 242 | `thca-b-vape-faraoh-2ml` | THCA-B 50% - Faraoh - 2ml | HZY-WC-388208 | Canapuff | fel | Faraoh | namn Faraoh |
| 236 | `thcba-vape-faraoh-2ml` | THCbA 47% - Faraoh - 2ml | HZY-WC-383694 | Canapuff | fel | Faraoh | Woo-kategori Faraoh |
| 204 | `high-life-gelato-hero-vapes-core-5g` | High Life – Gelato – 5g | HZY-WC-381673 | Canapuff | fel | Hero Vapes | namn Hero Vapes |
| 135 | `high-life-white-widow-sativa-buds-5-gram-hero-vapes` | High Life – White Widow – 5g | HZY-WC-346747 | Canapuff | fel | Hero Vapes | namn Hero Vapes |
| 257 | `magic-sauce-pre-rolls-1g` | Magic Sauce 50% – Pre Rolls – 1g | HZY-WC-396317 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 198 | `magic-sauce-buds-la-chupacabra-5-gram` | Magic Sauce 50% – La Chupacabra – 5g | HZY-WC-369804 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 201 | `magic-sauce-buds-titty-sprinkles-5-gram` | Magic Sauce 50% – Titty Sprinkles – 5g | HZY-WC-373209 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 168 | `magic-sauce-buds-magic-farmers-sverige-khalifa-kush-5-gram` | Magic Sauce 50% – Khalifa Kush – 5g | HZY-WC-351589 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 175 | `buds-magic-sauce-50-crazy-dog-5-gram` | Magic Sauce 50% – Crazy Dog – 5g | HZY-WC-359731 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 235 | `d10-hash-purple-storm-5g` | D10 60% – Purple Storm – 5g | HZY-WC-391497 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 234 | `d10-hash-blue-diamond-5g` | D10 60% – Blue Diamond – 5g | HZY-WC-391495 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 231 | `magic-sauce-buds-grape-gasoline` | Magic Sauce 50% – Grape Gasoline – 5g | HZY-WC-389900 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 228 | `magic-sauce-dubai-chocolate-istallet-for-thc-a-hash` | Magic Sauce 50% – Dubai Chocolate – 5g | HZY-WC-389897 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 226 | `magic-sauce-buds-london-lobster-ersatt-thc-a` | Magic Sauce 50% – London Lobster – 5g | HZY-WC-389894 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 223 | `d10-buds-white-widow-5g` | D10 50% – White Widow – 5g | HZY-WC-389267 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 221 | `magic-sauce-buds-kowa-bunga-5g` | Magic Sauce 50% – Kowa Bunga – 5g | HZY-WC-389252 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 218 | `d10-hash-silk-road-magic-farmers-thcx` | D10 60% – Silk Road – 5g | HZY-WC-387724 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 216 | `d10-hash-rosinella-magic-farmers` | D10 60% – Rosinella – 5g | HZY-WC-387722 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 214 | `d10-buds-skywalker-og-magic-farmers-thcx` | D10 50% – Skywalker OG – 5g | HZY-WC-387717 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 211 | `d10-buds-porn-star-og-magic-farmers` | D10 50% – Porn Star OG – 5g | HZY-WC-387714 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 209 | `d10-buds-cosmic-trip-5g` | D10 50% – Cosmic Trip – 5g | HZY-WC-387709 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 203 | `magic-sauce-buds-thca-ersatt-john-lemon-5g` | Magic Sauce 50% – John Lemon – 5g | HZY-WC-385730 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 188 | `magic-sauce-hash-kitkat-5g` | Magic Sauce 50% – KitKat – 5g | HZY-WC-384695 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 146 | `blommor-magic-sauce-buds-tinky-winki-5-gram` | Magic Sauce 50% – Tinky Winky – 5g | HZY-WC-347282 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 155 | `magic-sauce-buds-samurai-jack-magic-farmers-weed` | Magic Sauce 50% – Samurai Jack – 5g | HZY-WC-348916 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 172 | `magic-sauce-buds-donny-burger-5g` | Magic Sauce 50% – Donny Burger – 5g | HZY-WC-357297 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 132 | `magic-sauce-buds-yoda-ice-cream-5-gram` | Magic Sauce 50% – Yoda Ice Cream – 5g | HZY-WC-344340 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 196 | `magic-sauce-hash-charas-5-gram` | Magic Sauce 50% – Charas – 5g | HZY-WC-369801 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 158 | `hash-cbn-yellowstone-5-gram` | Hash – CBN+ 40% – Yellowstone - 5 gram | HZY-WC-349930 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 152 | `magic-sauce-hash-marrakesh-dream-5-gram` | Hash – Magic Sauce 50% – Marrakesh Dream – 5 gram | HZY-WC-347471 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 129 | `cbn-buds-malibu-skittelz` | Buds – CBN+ 30% – Malibu Skittelz - 5 gram | HZY-WC-337510 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 249 | `blommor-cbg9-60-snow-ice` | Buds – CBG9 60% – Snow Ice | HZY-WC-337455 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 125 | `hash-h4cbd-20-cbn-20-h-bomb-5-gram` | Hash – H4CBD 20% + CBN 20% – H-Bomb - 5 gram | HZY-WC-330382 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 124 | `h4cbd-buds-30-kusher-kush-magic-farmers-5-gram` | Buds – H4CBD 30% – Kusher Kush – 5 gram | HZY-WC-330341 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 229 | `cbn-buds-magic-farmers-great-white-shark-1-25-gram` | Blommor – CBN 10% – Great White Shark | HZY-WC-330333 | Canapuff | fel | Magic Farmers | Woo-kategori Magic Farmers |
| 139 | `high-life-hash-northern-lights-5g` | High Life – Northern Lights – 5g | HZY-WC-346756 | Canapuff | fel | okänt – ägaren anger | inget belägg |
| 137 | `high-life-hash-malaga-magic-5g` | High Life – Malaga Magic – 5g | HZY-WC-346753 | Canapuff | fel | okänt – ägaren anger | inget belägg |
| 148 | `el-gringo-hash-strawberry-shortcake-5g` | EL Gringo – Strawberry Shortcake – 5g | HZY-WC-347450 | Canapuff | fel | okänt – ägaren anger | inget belägg |
| 127 | `cbd-buds-10-gram-russian-roulette` | CBD ≈15% - Russian Roulette - 10g | HZY-WC-331936 | Canapuff | fel | okänt – ägaren anger | inget belägg |
| 134 | `magic-sauce-buds-magic-farmers-gorilla-cookies-5-gram` | Magic Sauce 50% – Gorilla Cookies – 5g | HZY-WC-344347 | Canapuff | fel | oklart: Magic Farmers / Cookies | Woo-kategori Magic Farmers, namn Cookies |
| 200 | `nano-hash-zkittlez-mousse-ersatt-thca-hash` | 7% Nano11 – Zkittlez Mousse – 5g | HZY-WC-384986 | Canapuff | fel | Tatra Hemp | Woo-kategori Tatra Hemp |
| 197 | `buds-nanno-11-critical-berries` | 7% Nano11 – Critical Berries – 5g | HZY-WC-384976 | Canapuff | fel | Tatra Hemp | Woo-kategori Tatra Hemp |
| 165 | `7-nano11-prerolled-1-gram` | 7% Nano11 – Prerolled – 1 gram | HZY-WC-350672 | Canapuff | fel | Tatra Hemp | Woo-kategori Tatra Hemp |
| 194 | `nano-11-buds-thca-substitut-royal-og` | 7% Nano11 – Royal OG – 5g | HZY-WC-384962 | Canapuff | fel | Tatra Hemp | Woo-kategori Tatra Hemp |
| 191 | `nano-buds-ersatt-thca-bubba-kush-5g` | 7% Nano11 – Bubba Kush – 5g | HZY-WC-384956 | Canapuff | fel | Tatra Hemp | Woo-kategori Tatra Hemp |
| 213 | `nano11-naranja-popcorn-buds-5g` | 7% Nano11 – Naranja Pop. – 5g | HZY-WC-382727 | Canapuff | fel | Tatra Hemp | Woo-kategori Tatra Hemp |
| 210 | `nano11-buds-godzilla-5g` | 7% Nano11 – Godzilla – 5g | HZY-WC-382725 | Canapuff | fel | Tatra Hemp | Woo-kategori Tatra Hemp |
| 208 | `nano-11-buds-orange-zkittlez-5g` | 7% Nano11 – Orange Zkittlez – 5g | HZY-WC-382723 | Canapuff | fel | Tatra Hemp | Woo-kategori Tatra Hemp |
| 206 | `nano-11-buds-lemon-mandarine-5g` | 7% Nano11 – Lemon Mandarine – 5g | HZY-WC-382721 | Canapuff | fel | Tatra Hemp | Woo-kategori Tatra Hemp |
| 183 | `nano11-lemon-sorbet-5-gram` | 7% Nano11 – Lemon Sorbet – 5g | HZY-WC-361807 | Canapuff | fel | Tatra Hemp | Woo-kategori Tatra Hemp |
| 193 | `nano-buds-strawberry-og-5-gram` | 7% Nano11 – Strawberry OG – 5g | HZY-WC-363691 | Canapuff | fel | Tatra Hemp | Woo-kategori Tatra Hemp |
| 192 | `nano-buds-gary-payton-5-gram` | 7% Nano11 – Gary Payton – 5g | HZY-WC-363689 | Canapuff | fel | Tatra Hemp | Woo-kategori Tatra Hemp |
| 190 | `buds-nano11-crystal-snow-5-gram` | 7% Nano11 – Crystal Snow – 5g | HZY-WC-363135 | Canapuff | fel | Tatra Hemp | Woo-kategori Tatra Hemp |
| 187 | `nano-buds-raspberry-popcorn-5-gram` | Buds – 7% Nano11 – Raspberry Popcorn – 5 gram | HZY-WC-363133 | Canapuff | fel | Tatra Hemp | Woo-kategori Tatra Hemp |
| 185 | `isolat-cbd-isolate-15-gram` | Isolat – CBD 99% – Isolate – 15 gram | HZY-WC-362373 | Canapuff | fel | Tatra Hemp | Woo-kategori Tatra Hemp |
| 131 | `nano-buds-lemon-purple-5-gram` | Buds – 7% Nano11 – Lemon Purple – 5 gram | HZY-WC-338896 | Canapuff | fel | Tatra Hemp | Woo-kategori Tatra Hemp |
| 177 | `buds-nano11-snow-white-popcorn-5-gram` | Buds – 7% Nano11 – Snow White Popcorn – 5 gram | HZY-WC-361803 | Canapuff | fel | Tatra Hemp | Woo-kategori Tatra Hemp |
| 180 | `buds-nano11-abacous-5-gram` | Buds – 7% Nano11 – Abacous – 5 gram | HZY-WC-361805 | Canapuff | fel | Tatra Hemp | Woo-kategori Tatra Hemp |
| 189 | `h4cbd-vape-canapuff-1ml` | Vape - H4CBD 96% - Canapuff - 1ml | HZY-WC-328984 | – | saknas | Canapuff | namn Canapuff |
| 199 | `thcv-vape-canapuff-1ml` | Vape - THC-V 79% - Canapuff - 1ml | HZY-WC-328629 | – | saknas | Canapuff | namn Canapuff |
| 195 | `cbn-vape-canapuff-1ml` | Vape - CBN 89% - Canapuff - 1ml | HZY-WC-328618 | – | saknas | Canapuff | namn Canapuff |
| 202 | `thcv-vape-canntropy-1ml` | THCV 20% + CBG + CBN - 1ml | HZY-WC-329090 | – | saknas | Canntropy | namn Canntropy |
| 207 | `h4cbd-vape-canntropy-1ml` | Vape - H4CBD 95% - Canntropy - 1ml | HZY-WC-329118 | – | saknas | Canntropy | namn Canntropy |
| 220 | `thcv-vape-cbd-group-2ml` | Vape - THC-V 20% - CBD Group - 2ml | HZY-WC-329247 | – | saknas | CBD Group | Woo-kategori CBD Group |
| 182 | `h4cbd-vape-cbd-group-2ml` | H4CBD 97% - 2ml | HZY-WC-224593 | – | saknas | CBD Group | Woo-kategori CBD Group |
| 250 | `ccell-stylo-vape-batteri-510` | CCELL Stylo – Vape Batteri – 510 | HZY-WC-383560 | – | saknas | CCELL | namn CCELL |
| 247 | `ccell-sandwave-vape-batteri-510` | CCELL Sandwave – Vape Batteri – 510 | HZY-WC-337304 | – | saknas | CCELL | namn CCELL |
| 244 | `ccell-fino-vape-batteri-510` | CCELL Fino – Vape Batteri – 510 | HZY-WC-337294 | – | saknas | CCELL | namn CCELL |
| 237 | `ccell-m3b-vape-batteri-510` | CCELL M3b Pro – Vape Batteri – 510 | HZY-WC-332361 | – | saknas | CCELL | namn CCELL |
| 212 | `ccell-palm-pro-vape-batteri-510-ganga` | CCELL Palm Pro – Vape Batteri – 510 | HZY-WC-329188 | – | saknas | CCELL | namn CCELL |
| 178 | `ccell-m3-plus-vape-batteri-510` | CCELL M3 Plus – Vape Batteri – 510 | HZY-WC-328927 | – | saknas | CCELL | namn CCELL |
| 171 | `ccell-m4-penna` | CCELL M4 – Vape Batteri – 510 | HZY-WC-1152 | – | saknas | CCELL | namn CCELL |
| 224 | `cookies-v2-large-stackables` | Cookies - V2 Large Stackables | HZY-WC-383037 | – | saknas | Cookies | Woo-kategori Cookies |
| 222 | `cookies-original-snapback` | Cookies Original Snapback | HZY-WC-383033 | – | saknas | Cookies | Woo-kategori Cookies |
| 219 | `cookies-original-beanie` | Cookies Original Beanie | HZY-WC-383031 | – | saknas | Cookies | Woo-kategori Cookies |
| 248 | `cookies-medium-metal-tray` | Cookies Medium Metal Tray | HZY-WC-382970 | – | saknas | Cookies | Woo-kategori Cookies |
| 217 | `cookies-c-bite-buds-tray` | Cookies C-Bite - Buds Tray | HZY-WC-382966 | – | saknas | Cookies | Woo-kategori Cookies |
| 215 | `cookies-dual-chamber-cbd-vape-cereal-milk-london-pound-cake` | CBD 56% - Cereal Milk + London P.C. - 1+1ml | HZY-WC-382965 | – | saknas | Cookies | Woo-kategori Cookies |
| 144 | `cookies-cbd-vape-dual-chamber-triple-scoop-apples-bananas` | CBD 56% - Triple Scoop + Apples & Bananas - 1+1ml | HZY-WC-347269 | – | saknas | Cookies | Woo-kategori Cookies |
| 253 | `cbd-510-cart-cookies-1ml` | CBD 60% - Cookies - 1ml | HZY-WC-347277 | – | saknas | Cookies | Woo-kategori Cookies |
| 141 | `cookies-cbd-vape-adios-mother-f-miami-mint` | CBD 57% - Adios M.F. + Miami Mint - 1+1ml | HZY-WC-347264 | – | saknas | Cookies | Woo-kategori Cookies |
| 150 | `thca-b-50-faraoh-1ml-10-pack` | THCA-B 50% Faraoh 1ml – 10-pack | HZ-THCAB50-1ML-10PK | – | saknas | Faraoh | namn Faraoh |
| 241 | `thca-b-50-faraoh-1ml-5-pack` | THCA-B 50% Faraoh 1ml – 5-pack | HZ-THCAB50-1ML-5PK | – | saknas | Faraoh | namn Faraoh |
| 240 | `thca-b-50-faraoh-1ml-3-pack` | THCA-B 50% Faraoh 1ml – 3-pack | HZ-THCAB50-1ML-3PK | – | saknas | Faraoh | namn Faraoh |
| 239 | `thca-b-50-faraoh-2ml-5-pack` | THCA-B 50% Faraoh 2ml – 5-pack | HZ-THCAB50-2ML-5PK | – | saknas | Faraoh | namn Faraoh |
| 238 | `thca-b-50-faraoh-2ml-3-pack` | THCA-B 50% Faraoh 2ml – 3-pack | HZ-THCAB50-2ML-3PK | – | saknas | Faraoh | namn Faraoh |
| 143 | `faraoh-thca-b-hela-kollektionen` | Faraoh THCbA Vape 2ml - Hela kollektionen | HZ-THCAB-8PK | – | saknas | Faraoh | namn Faraoh |
| 142 | `faraoh-thca-b-5-pack` | Faraoh THCbA Vape 2ml - 5-pack | HZ-THCAB-5PK | – | saknas | Faraoh | namn Faraoh |
| 140 | `faraoh-thca-b-3-pack` | Faraoh THCbA Vape 2ml - 3-pack | HZ-THCAB-3PK | – | saknas | Faraoh | namn Faraoh |
| 251 | `thc-b-vape-faraoh-1ml` | Vape - THC-B 35% - Faraoh - 1ml | HZY-WC-338935 | – | saknas | Faraoh | Woo-kategori Faraoh |
| 169 | `ms-3-0-5ml-5-pack` | MS 3.0 – 5ml – 5-pack | HZ-MS5ML-5PK | – | saknas | Magic Farmers | Woo-kategori Magic Farmers |
| 166 | `ms-3-0-5ml-3-pack` | MS 3.0 – 5ml – 3-pack | HZ-MS5ML-3PK | – | saknas | Magic Farmers | Woo-kategori Magic Farmers |
| 157 | `magic-sauce-50-pre-rolls-1g-10-pack` | Magic Sauce 50% Pre Rolls 1g – 10-pack | HZ-MSPR-10PK | – | saknas | Magic Farmers | Woo-kategori Magic Farmers |
| 154 | `magic-sauce-50-pre-rolls-1g-5-pack` | Magic Sauce 50% Pre Rolls 1g – 5-pack | HZ-MSPR-5PK | – | saknas | Magic Farmers | Woo-kategori Magic Farmers |
| 260 | `magic-sauce-vape-5ml` | Magic Sauce 3.0 - 5ml | HZY-WC-396672 | – | saknas | Magic Farmers | Woo-kategori Magic Farmers |
| 245 | `d10-2ml-5-pack` | D10 2ml – 5-pack | HZ-D10-2ML-5PK | – | saknas | Magic Farmers | Woo-kategori Magic Farmers |
| 243 | `d10-2ml-3-pack` | D10 2ml – 3-pack | HZ-D10-2ML-3PK | – | saknas | Magic Farmers | Woo-kategori Magic Farmers |
| 254 | `d10-vape-magic-farmers` | D10 - 2ml | HZY-WC-387654 | – | saknas | Magic Farmers | Woo-kategori Magic Farmers |
| 205 | `startpaket-magic-sauce-batteri` | Startpaket – M3b Pro Batteri + 2× Magic Sauce 3.0 1ml | HZY-WC-385842 | – | saknas | Magic Farmers | Woo-kategori Magic Farmers |
| 186 | `ms-30-10ml-kollektion` | MS 3.0 – 10ml – Kollektion | HZ-MS10ML-KOLL | – | saknas | Magic Farmers | Woo-kategori Magic Farmers |
| 173 | `ms50-5g-10-pack` | Magic Sauce 50% 5g – 10-pack | HZ-MS50-10PK | – | saknas | Magic Farmers | Woo-kategori Magic Farmers |
| 170 | `ms50-5g-5-pack` | Magic Sauce 50% 5g – 5-pack | HZ-MS50-5PK | – | saknas | Magic Farmers | Woo-kategori Magic Farmers |
| 167 | `ms50-5g-3-pack` | Magic Sauce 50% 5g – 3-pack | HZ-MS50-3PK | – | saknas | Magic Farmers | Woo-kategori Magic Farmers |
| 156 | `ms-30-1ml-kollektion` | MS 3.0 – 1ml – Kollektion | HZ-MS1ML-KOLL | – | saknas | Magic Farmers | Woo-kategori Magic Farmers |
| 153 | `ms-30-1ml-5-pack` | MS 3.0 – 1ml – 5-pack | HZ-MS1ML-5PK | – | saknas | Magic Farmers | Woo-kategori Magic Farmers |
| 151 | `ms-30-1ml-3-pack` | MS 3.0 – 1ml – 3-pack | HZ-MS1ML-3PK | – | saknas | Magic Farmers | Woo-kategori Magic Farmers |
| 149 | `ms-30-2ml-kollektion` | MS 3.0 – 2ml – Kollektion | HZ-MS2ML-KOLL | – | saknas | Magic Farmers | Woo-kategori Magic Farmers |
| 147 | `ms-30-2ml-5-pack` | MS 3.0 – 2ml – 5-pack | HZ-MS2ML-5PK | – | saknas | Magic Farmers | Woo-kategori Magic Farmers |
| 145 | `ms-30-2ml-3-pack` | MS 3.0 – 2ml – 3-pack | HZ-MS2ML-3PK | – | saknas | Magic Farmers | Woo-kategori Magic Farmers |
| 252 | `magic-sauce-10ml` | Magic Sauce 3.0 - 10ml | HZY-WC-383600 | – | saknas | Magic Farmers | Woo-kategori Magic Farmers |
| 262 | `cart-magic-sauce-magic-farmers-1ml` | Magic Sauce 3.0 - 1ml | HZY-WC-351575 | – | saknas | Magic Farmers | Woo-kategori Magic Farmers |
| 261 | `vape-magic-sauce-magic-farmers-2ml` | Magic Sauce 3.0 - 2ml | HZY-WC-351565 | – | saknas | Magic Farmers | Woo-kategori Magic Farmers |
| 259 | `cbd-vape-cbn-vape-magic-farmers` | CBD 25% + CBN 35% - 2ml | HZY-WC-350348 | – | saknas | Magic Farmers | namn Magic Farmers |
| 246 | `startpaket-thca-b-batteri` | Startpaket – M3b Pro Batteri + 2× THCA-B 50% 1ml | HZY-WC-392536 | – | saknas | okänt – ägaren anger | inget belägg |
| 176 | `high-life-5g-5-pack` | High Life 5g – 5-pack | HZ-HL-5PK | – | saknas | okänt – ägaren anger | inget belägg |
| 174 | `high-life-5g-3-pack` | High Life 5g – 3-pack | HZ-HL-3PK | – | saknas | okänt – ägaren anger | inget belägg |
| 164 | `heros-core-2ml-kollektion` | Hero's Core 2ml – Kollektion | HZ-CORE-KOLL | – | saknas | okänt – ägaren anger | inget belägg |
| 162 | `heros-core-2ml-5-pack` | Hero's Core 2ml – 5-pack | HZ-CORE-5PK | – | saknas | okänt – ägaren anger | inget belägg |
| 159 | `heros-core-2ml-3-pack` | Hero's Core 2ml – 3-pack | HZ-CORE-3PK | – | saknas | okänt – ägaren anger | inget belägg |
| 255 | `thc-x-vape-hero-core-2ml` | Hero's Core - 2ml | HZY-WC-347476 | – | saknas | okänt – ägaren anger | inget belägg |
| 123 | `merch-nyckelring-hazey` | Hazey.se Merch - Nyckelring | HZY-WC-225093 | – | saknas | okänt – ägaren anger | inget belägg |
| 233 | `thcv-vape-euphoria-2ml` | Vape - THCV - Euphoria - 2ml | HZY-WC-331902 | – | saknas | okänt – ägaren anger | inget belägg |
| 225 | `cbd-vape-1ml-46-hazey` | Vape - CBD 46% - Hazey - 1ml | HZY-WC-330220 | – | saknas | okänt – ägaren anger | inget belägg |
| 126 | `fraktandring` | Fraktändring | HZY-WC-331735 | – | saknas | okänt – ägaren anger | inget belägg |
| 163 | `nano-11-pre-rolls-1g-5-pack` | Nano 11 Pre Rolls 1g – 5-pack | HZ-N11PR-5PK | – | saknas | Tatra Hemp | Woo-kategori Tatra Hemp |
| 160 | `nano-11-pre-rolls-1g-10-pack` | Nano 11 Pre Rolls 1g – 10-pack | HZ-N11PR-10PK | – | saknas | Tatra Hemp | Woo-kategori Tatra Hemp |
| 184 | `nano11-buds-10-pack` | Nano 11 Buds 5g – 10-pack | HZ-NANO-10PK | – | saknas | Tatra Hemp | Woo-kategori Tatra Hemp |
| 181 | `nano11-buds-5-pack` | Nano 11 Buds 5g – 5-pack | HZ-NANO-5PK | – | saknas | Tatra Hemp | Woo-kategori Tatra Hemp |
| 179 | `nano11-buds-3-pack` | Nano 11 Buds 5g – 3-pack | HZ-NANO-3PK | – | saknas | Tatra Hemp | Woo-kategori Tatra Hemp |

## 6. Samma bild uppladdad flera gånger (6)

Bilderna är byte-identiska på CDN:en, så PDP-galleriet visar likadana miniatyrer. Behåll en (den som varianterna pekar på) och ta bort övriga — eller ersätt dem med riktiga sekundära bilder.

| NH-id | Slug | Namn | SKU | Synlighet (Woo) | Identiska bild-id |
|---|---|---|---|---|---|
| 132 | `magic-sauce-buds-yoda-ice-cream-5-gram` | Magic Sauce 50% – Yoda Ice Cream – 5g | HZY-WC-344340 | PUBLIC + LISTED | 194 = 204 = 205 |
| 127 | `cbd-buds-10-gram-russian-roulette` | CBD ≈15% - Russian Roulette - 10g | HZY-WC-331936 | PUBLIC + LISTED | 192 = 199 |
| 130 | `cookies-cannabis-buds-cbd-cereal-milk-35-gram` | CBD 30% – Cereal Milk – 3,5g | HZY-WC-338043 | PUBLIC + LISTED | 193 = 202 |
| 123 | `merch-nyckelring-hazey` | Hazey.se Merch - Nyckelring | HZY-WC-225093 | PUBLIC + LISTED | 190 = 195 |
| 125 | `hash-h4cbd-20-cbn-20-h-bomb-5-gram` | Hash – H4CBD 20% + CBN 20% – H-Bomb - 5 gram | HZY-WC-330382 | PUBLIC + LISTED | 191 = 197 |
| 124 | `h4cbd-buds-30-kusher-kush-magic-farmers-5-gram` | Buds – H4CBD 30% – Kusher Kush – 5 gram | HZY-WC-330341 | PUBLIC + LISTED | 189 = 196 |
