# Gamla id:n och routes efter migreringen

TASK 17 · 2026-11-03 · källor: WooCommerce-livesidan (Store API alla synlighetslägen, kategorisidornas listningar, produktsidornas HZY_PRODUKT/HZY_PAKET/HZY_EXTRA) och Nyehandel (sitemap, 68 kategorier med alla sidor, produktsidor, product/state). Genererad av `build-docs.mjs` ur JSON-filerna i samma mapp.

## 1. Produkt-id i Theme 8-koden (före → efter TASK 17)

Alla 121 gamla Nyehandel-produkt-id (1–121) är borta: de nya produkterna har id 124–262. Identitetskedja: gammalt id/route (Task 10A `routes.tsv`) → Woo-id (Task 10A, bara match "säker") → nytt id (samma slug som Woo, variant-SKU `HZY-WC-<Woo-id>`).

| Register (fil) | Före | Efter |
|---|---|---|
| `FAMILIES` (85-pdp-pilot.js) | ms50: 10 gamla id, nano11: 2 gamla id (alla borta) | ms50 17, nano11 16, highlife 5 – nya id ur WooCommerce HZY_EXTRA.familj |
| `PACKAGE_PLAN` (85-pdp-pilot.js, läses även av 84-cart.js) | 14 gamla id | 49 nya id ur WooCommerce HZY_PAKET (modell + steg, inga priser) |
| `PACKAGE_PRODUCTS` | {} | {} (oförändrat: inget paket verifierat) |
| `VERIFIED_DOCS` (85-pdp-pilot.js) | 11 gamla id med Nyehandel-S3-filer som inte längre är länkade | 18 nya id med de filer produkterna länkar i dag, strain-verifierade ur filnamnet |
| Headerns utvalda produkter (05-header.js) | 4 gamla slugs (301 → tom kategori) | 4 befintliga produkter, badge UTVALD PRODUKT |
| Startsidans produktomdömen (55-reviews.js) | 9 poster mot gamla slugs | 3 bytta (säker kedja), 6 kvar; inga omdömen finns i NH efter importen |

## 2. Gamla → nya produkt-id (alla 121)

Status: MAPPAD (säker kedja) · OSÄKER (10A-matchningen var osäker; kandidat anges men används inte i koden) · INGEN WOO-MOTSVARIGHET · PRODUKTEN FINNS INTE LÄNGRE (Woo-produkten är borttagen). Gamla routes svarar i dag 301 till tomma, olänkade kategorier (`vapes-ny`, `buds-ny`, `hash-ny`) – se ADMIN-CATEGORY-ACTIONS.md för redirects.

| Gammalt id | Gammal route | Woo-id | Nytt id | Ny route | Status | Kandidat (bara dokumentation) |
|---:|---|---:|---:|---|---|---|
| 1 | ccell-m4-vape-batteri-510 | 231 | 171 | ccell-m4-penna | MAPPAD |  |
| 2 | ccell-m3-plus-vape-batteri-510 | 972 | 178 | ccell-m3-plus-vape-batteri-510 | MAPPAD |  |
| 3 | vape-h4cbd-97-cbd-group-2ml | – | – | – | INGEN WOO-MOTSVARIGHET | 182 H4CBD 97% – 2ml (1) |
| 4 | vape-h4cbd-96-canapuff-1ml | 8644 | 189 | h4cbd-vape-canapuff-1ml | MAPPAD |  |
| 5 | hazeyse-merch-nyckelring | 225093 | 123 | merch-nyckelring-hazey | MAPPAD |  |
| 6 | vape-cbn-89-canapuff-1ml | 328617 | 195 | cbn-vape-canapuff-1ml | MAPPAD |  |
| 7 | vape-thc-v-79-canapuff-1ml | 328628 | 199 | thcv-vape-canapuff-1ml | MAPPAD |  |
| 8 | vape-thc-v-20-canntropy-1ml | – | – | – | INGEN WOO-MOTSVARIGHET | 202 THCV 20% + CBG + CBN – 1ml (0.38) |
| 9 | vape-h4cbd-95-canntropy-1ml | 329116 | 207 | h4cbd-vape-canntropy-1ml | MAPPAD |  |
| 10 | ccell-palm-pro-vape-batteri-510 | 329187 | 212 | ccell-palm-pro-vape-batteri-510-ganga | MAPPAD |  |
| 11 | vape-thc-v-20-cbd-group-2ml | 329246 | 220 | thcv-vape-cbd-group-2ml | MAPPAD |  |
| 12 | blommor-cbd-3g-purple-haze-trinacria-hemp | – | – | – | INGEN WOO-MOTSVARIGHET |  |
| 13 | blommor-cbd-3g-gorilla-glue-trinacria-hemp | – | – | – | INGEN WOO-MOTSVARIGHET |  |
| 14 | blommor-cbd-3g-lemon-skunk-trinacria-hemp | – | – | – | INGEN WOO-MOTSVARIGHET |  |
| 15 | vape-thc-h-20-hazey-2ml-500puffs | 330048 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) | 220 Vape – THC-V 20% – CBD Group – 2ml (0.3) |
| 16 | vape-cbd-46-hazey-1ml | 330219 | 225 | cbd-vape-1ml-46-hazey | MAPPAD |  |
| 17 | blommor-cbn-10-great-white-shark | 330332 | 229 | cbn-buds-magic-farmers-great-white-shark-1-25-gram | MAPPAD |  |
| 18 | buds-h4cbd-30-kusher-kush-5-gram | 330341 | 124 | h4cbd-buds-30-kusher-kush-magic-farmers-5-gram | MAPPAD |  |
| 19 | hash-h4cbd-20-cbn-20-h-bomb-5-gram | 330382 | 125 | hash-h4cbd-20-cbn-20-h-bomb-5-gram | MAPPAD |  |
| 20 | fraktandring | 331735 | 126 | fraktandring | MAPPAD |  |
| 21 | vape-thcv-euphoria-2ml | 331901 | 233 | thcv-vape-euphoria-2ml | MAPPAD |  |
| 22 | buds-15-cbd-10-gram-russian-roulette | 331936 | 127 | cbd-buds-10-gram-russian-roulette | MAPPAD |  |
| 23 | vape-thc-h-20-hazey-2ml-600puffs | 332093 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) | 220 Vape – THC-V 20% – CBD Group – 2ml (0.3) |
| 24 | ccell-m3b-vape-batteri-510 | – | – | – | INGEN WOO-MOTSVARIGHET | 237 CCELL M3b Pro – Vape Batteri – 510 (0.8) |
| 25 | vape-thc-b-20-tatra-hemp-2ml | 334747 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) | 220 Vape – THC-V 20% – CBD Group – 2ml (0.3) |
| 26 | vape-thc-b-20-tatra-hemp-1ml | 334754 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) | 251 Vape – THC-B 35% – Faraoh – 1ml (0.38) |
| 27 | cart-thc-b-20-tatra-hemp-1ml | 334759 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) | 251 Vape – THC-B 35% – Faraoh – 1ml (0.38) |
| 28 | vape-thc-v-20-tatra-hemp-2ml | 334765 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) | 220 Vape – THC-V 20% – CBD Group – 2ml (0.44) |
| 29 | vape-thc-v-20-tatra-hemp-1ml | 334770 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) | 199 Vape – THC-V 79% – Canapuff – 1ml (0.33) |
| 30 | cart-thc-v-20-tatra-hemp-1ml | 334775 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) | 199 Vape – THC-V 79% – Canapuff – 1ml (0.33) |
| 31 | blommor-nano10-20-amnesia-haze-5-gram | 336550 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) |  |
| 32 | ccell-fino-vape-batteri-510 | 337290 | 244 | ccell-fino-vape-batteri-510 | MAPPAD |  |
| 33 | ccell-sandwave-vape-batteri-510 | 337303 | 247 | ccell-sandwave-vape-batteri-510 | MAPPAD |  |
| 34 | buds-cbd-30-triple-scoop-35-gram | 337446 | 128 | cbd-buds-triple-scoop-cookies-cannabis | MAPPAD |  |
| 35 | buds-cbg9-60-snow-ice | 337454 | 249 | blommor-cbg9-60-snow-ice | MAPPAD |  |
| 36 | buds-cbn-30-malibu-skittelz-5-gram | 337510 | 129 | cbn-buds-malibu-skittelz | MAPPAD |  |
| 37 | isolat-thca-99-isolate-5-gram | 337939 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) | 185 Isolat – CBD 99% – Isolate – 15 gram (0.43) |
| 38 | buds-cbd-30-cereal-milk-35-gram | 338043 | 130 | cookies-cannabis-buds-cbd-cereal-milk-35-gram | MAPPAD |  |
| 39 | hash-thca-30-dry-sift-5-gram | 338891 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) | 129 Buds – CBN+ 30% – Malibu Skittelz – 5 gram (0.25) |
| 40 | buds-thca-23-orange-indoor-5-gram | 338893 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) |  |
| 41 | buds-7-nano11-lemon-purple-5-gram | 338896 | 131 | nano-buds-lemon-purple-5-gram | MAPPAD |  |
| 42 | vape-thc-b-35-faraoh-1ml | 338933 | 251 | thc-b-vape-faraoh-1ml | MAPPAD |  |
| 43 | blommor-nano10-20-bz1-5-gram | 339380 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) | 125 Hash – H4CBD 20% + CBN 20% – H-Bomb – 5 gram (0.25) |
| 44 | hash-nano10-20-zkittlez-mousse-5-gram | 339759 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) |  |
| 45 | hash-nano9-20-maroccan-hash-5-gram | 339761 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) | 125 Hash – H4CBD 20% + CBN 20% – H-Bomb – 5 gram (0.25) |
| 46 | crumble-nano10-20-white-runtz-5-gram | 339763 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) |  |
| 47 | crumble-nano10-20-raspberry-5-gram | 339767 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) |  |
| 48 | blommor-nano10-20-og-kush-5-gram | 339938 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) | 124 Buds – H4CBD 30% – Kusher Kush – 5 gram (0.25) |
| 49 | blommor-nano10-20-tequila-sunrise-5-gram | 339941 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) |  |
| 50 | blommor-nano10-20-gelato-33-5-gram | 340706 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) |  |
| 51 | blommor-nano10-20-jack-herer-5-gram | 340709 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) |  |
| 52 | blommor-nano10-20-mimosa-5-gram | 340711 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) | 125 Hash – H4CBD 20% + CBN 20% – H-Bomb – 5 gram (0.25) |
| 53 | prerolled-cbd-blue-raz-1-gram | – | – | – | OSÄKER (10A-match osäker) | 230 CBD 30% – Blue Raz – 3,5g (0.33) |
| 54 | prerolled-cbd-apples-amp-bananas-1-gram | – | – | – | INGEN WOO-MOTSVARIGHET | 144 CBD 56% – Triple Scoop + Apples & Bananas – 1+1ml (0.33) |
| 55 | hash-thca-30-dry-static-5-gram | 341730 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) | 129 Buds – CBN+ 30% – Malibu Skittelz – 5 gram (0.25) |
| 56 | cart-nano10-10-tatra-hemp-1ml | 342951 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) |  |
| 57 | vape-thc-a-45-faraoh-2ml | 343650 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) | 236 THCbA 47% – Faraoh – 2ml (0.29) |
| 58 | prerolled-thca-22-bangkok-1-gram | 344070 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) | 165 7% Nano11 – Prerolled – 1 gram (0.29) |
| 59 | buds-magic-sauce-50-yoda-ice-cream-5-gram | 344340 | 132 | magic-sauce-buds-yoda-ice-cream-5-gram | MAPPAD |  |
| 60 | buds-magic-sauce-50-gorilla-cookies-5-gram | 344347 | 134 | magic-sauce-buds-magic-farmers-gorilla-cookies-5-gram | MAPPAD |  |
| 61 | buds-thca-23-amnesia-5-gram | 344632 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) |  |
| 62 | buds-thca-18-strawberry-og-5-gram | 345777 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) | 193 7% Nano11 – Strawberry OG – 5g (0.33) |
| 63 | cart-cbd-60-tatra-hemp-05ml | 345992 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) | 253 CBD 60% – Cookies – 1ml (0.25) |
| 64 | buds-thca-20-white-widow-5-gram | – | – | – | INGEN WOO-MOTSVARIGHET | 135 High Life – White Widow – 5g (0.27) |
| 65 | buds-thca-20-thcnm-10-black-widow-5-gram | 346750 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) |  |
| 66 | hash-thca-20-thcnm-20-malaga-magic-5-gram | – | – | – | INGEN WOO-MOTSVARIGHET |  |
| 67 | hash-thca-40-northern-lights-5-gram | – | – | – | INGEN WOO-MOTSVARIGHET | 158 Hash – CBN+ 40% – Yellowstone – 5 gram (0.29) |
| 68 | blommor-hhcpm-15-amnesia-5-gram | 346782 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) |  |
| 69 | blommor-hhcpm-15-durban-poison-5-gram | 346787 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) |  |
| 70 | vape-hhcpm-15-canntropy-2ml | 346788 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) |  |
| 71 | vape-dual-cbd-57-hana-butter-amp-long-island-11ml | – | – | – | INGEN WOO-MOTSVARIGHET | 136 CBD 30% – Long Island – 3,5g (0.25) |
| 72 | vape-dual-cbd-56-blueberry-banana-amp-tequila-sunrise-11ml | – | – | – | INGEN WOO-MOTSVARIGHET |  |
| 73 | cart-cbd-60-cookies-1ml | – | – | – | INGEN WOO-MOTSVARIGHET | 253 CBD 60% – Cookies – 1ml (0.8) |
| 74 | buds-magic-sauce-50-tinky-winky-5-gram | 347282 | 146 | blommor-magic-sauce-buds-tinky-winki-5-gram | MAPPAD |  |
| 75 | buds-highlife-thcnm-gsc-5-gram | – | – | – | INGEN WOO-MOTSVARIGHET |  |
| 76 | hash-thca-30-thcnm-10-royal-gorilla-5-gram | – | – | – | INGEN WOO-MOTSVARIGHET |  |
| 77 | hash-magic-sauce-50-marrakesh-dream-5-gram | 347471 | 152 | magic-sauce-hash-marrakesh-dream-5-gram | MAPPAD |  |
| 78 | vape-thcx-19-core-2ml | – | – | – | INGEN WOO-MOTSVARIGHET | 164 Hero’s Core 2ml – Kollektion (0.25) |
| 79 | buds-cbd-purple-haze-5-gram | 347674 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) | 131 Buds – 7% Nano11 – Lemon Purple – 5 gram (0.25) |
| 80 | buds-cbd-strawberry-haze-5-gram | 347676 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) |  |
| 81 | buds-cbd-trim-royal-10-gram | 347679 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) | 127 CBD ≈15% – Russian Roulette – 10g (0.25) |
| 82 | buds-thca-23-hhcpm-12-wedding-cake-5-gram | – | – | – | INGEN WOO-MOTSVARIGHET |  |
| 83 | vape-10-oh-thc-95-canapuff-1ml | 348748 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) | 199 Vape – THC-V 79% – Canapuff – 1ml (0.33) |
| 84 | buds-magic-sauce-50-samurai-jack-5-gram | 348916 | 155 | magic-sauce-buds-samurai-jack-magic-farmers-weed | MAPPAD |  |
| 85 | prerolled-cbd-tequila-sunrise-1-gram | – | – | – | INGEN WOO-MOTSVARIGHET | 161 CBD 30% – Tequila Sunrise – 3,5g (0.3) |
| 86 | hash-cbn-40-yellowstone-5-gram | 349930 | 158 | hash-cbn-yellowstone-5-gram | MAPPAD |  |
| 87 | vape-cbd-25-cbn-35-magic-farmers-2ml | – | – | – | INGEN WOO-MOTSVARIGHET | 259 CBD 25% + CBN 35% – 2ml (1) |
| 88 | blommor-cbd-30-tequila-sunrise-35-gram | 350421 | 161 | cbd-buds-cookies-tequila-sunrise-35-gram | MAPPAD |  |
| 89 | prerolled-nanox-6-strawberry-sorbet-1-gram | – | – | – | INGEN WOO-MOTSVARIGHET | 165 7% Nano11 – Prerolled – 1 gram (0.25) |
| 90 | cart-thc-a-45-faraoh-1ml | 350937 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) | 251 Vape – THC-B 35% – Faraoh – 1ml (0.43) |
| 91 | vape-magic-sauce-99-2ml | – | – | – | OSÄKER (10A-match osäker) | 261 Magic Sauce 3.0 – 2ml (0.4) |
| 92 | cart-magic-sauce-99-1ml | – | – | – | OSÄKER (10A-match osäker) | 262 Magic Sauce 3.0 – 1ml (0.4) |
| 93 | buds-magic-sauce-50-khalifa-kush-5-gram | 351589 | 168 | magic-sauce-buds-magic-farmers-sverige-khalifa-kush-5-gram | MAPPAD |  |
| 94 | buds-thca-22-kitty-indoor-5-gram | 351947 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) |  |
| 95 | buds-thca-22-og-kush-small-buds-5-gram | – | – | – | OSÄKER (10A-match osäker) |  |
| 96 | buds-magic-sauce-50-donny-burger-5-gram | 357297 | 172 | magic-sauce-buds-donny-burger-5g | MAPPAD |  |
| 97 | buds-thca-25-bubbelgum-og-5-gram | 358598 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) |  |
| 98 | buds-thca-24-ice-indoor-5-gram | 358945 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) |  |
| 99 | hash-thca-50-bubble-hash-5-gram | – | – | – | OSÄKER (10A-match osäker) | 241 THCA-B 50% Faraoh 1ml – 5-pack (0.38) |
| 100 | buds-magic-sauce-50-crazy-dog-5-gram | 359731 | 175 | buds-magic-sauce-50-crazy-dog-5-gram | MAPPAD |  |
| 101 | vape-thc-a-50-live-resin-faraoh-2ml | 359751 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) | 242 THCA-B 50% – Faraoh – 2ml (0.33) |
| 102 | vape-thc-a-50-live-resin-faraoh-1ml | 359792 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) | 251 Vape – THC-B 35% – Faraoh – 1ml (0.33) |
| 103 | hash-thca-25-la-mousse-5-gram | 360855 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) |  |
| 104 | buds-7-nano11-sweet-karma-popcorn-5-gram | – | – | – | INGEN WOO-MOTSVARIGHET | 187 Buds – 7% Nano11 – Raspberry Popcorn – 5 gram (0.5) |
| 105 | buds-7-nano11-amnezia-haze-5-gram | – | – | – | INGEN WOO-MOTSVARIGHET | 180 Buds – 7% Nano11 – Abacous – 5 gram (0.5) |
| 106 | buds-7-nano11-super-skunk-5-gram | – | – | – | INGEN WOO-MOTSVARIGHET | 180 Buds – 7% Nano11 – Abacous – 5 gram (0.5) |
| 107 | isolat-cbd-99-isolate-15-gram | 362373 | 185 | isolat-cbd-isolate-15-gram | MAPPAD |  |
| 108 | hash-cbd-15-primero-1-gram | 362377 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) | 185 Isolat – CBD 99% – Isolate – 15 gram (0.29) |
| 109 | hash-thca-60-piatella-hash-5-gram | 362379 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) |  |
| 110 | buds-thca-22-orange-small-buds-5-gram | 362382 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) |  |
| 111 | buds-thca-24-zkittles-indoor-5-gram | 362831 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) |  |
| 112 | buds-7-nano11-raspberry-popcorn-5-gram | 363133 | 187 | nano-buds-raspberry-popcorn-5-gram | MAPPAD |  |
| 113 | buds-7-nano11-cali-grape-5-gram | – | – | – | INGEN WOO-MOTSVARIGHET | 180 Buds – 7% Nano11 – Abacous – 5 gram (0.5) |
| 114 | buds-7-nano11-bruce-banner-5-gram | – | – | – | INGEN WOO-MOTSVARIGHET | 180 Buds – 7% Nano11 – Abacous – 5 gram (0.5) |
| 115 | buds-7-nano11-apple-fritter-5-gram | – | – | – | INGEN WOO-MOTSVARIGHET | 180 Buds – 7% Nano11 – Abacous – 5 gram (0.5) |
| 116 | hash-thca-25-ketama-5-gram | 364381 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) |  |
| 117 | buds-thca-25-raspberry-5-gram | 365079 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) | 187 Buds – 7% Nano11 – Raspberry Popcorn – 5 gram (0.25) |
| 118 | cart-thc-a-50-live-resin-faraoh-1ml | 367533 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) | 251 Vape – THC-B 35% – Faraoh – 1ml (0.33) |
| 119 | hash-magic-sauce-50-charas-5-gram | 369801 | 196 | magic-sauce-hash-charas-5-gram | MAPPAD |  |
| 120 | buds-magic-sauce-50-la-chupacabra-5-gram | 369804 | 198 | magic-sauce-buds-la-chupacabra-5-gram | MAPPAD |  |
| 121 | buds-thca-23-amnesia-infused-5-gram | 370618 | – | – | PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH) |  |

## 3. Kategori-routes i Theme 8-koden (efter TASK 17)

Statisk genomgång av `theme8/js` mot dagens Nyehandel (`routes.mjs`). Kvarvarande TOM/DÖD är medvetna: legacy (HHCPM/THCNM), ägarbeslut (THCa-kortet) eller adminberoende.

| Fil:rad | Route | Status | NH H1 | Antal |
|---|---|---|---|---:|
| 05-header.js:310 | /sv/categories/hhcpm-vapes | TOM | HHCPM Vapes | 0 |
| 05-header.js:374 | /sv/categories/hhcpm-blommor | TOM | HHCPM Buds | 0 |
| 05-header.js:375 | /sv/categories/thcnm-blommor | TOM | THCNM Buds | 0 |
| 05-header.js:425 | /sv/categories/thcnm-hash | TOM | THCNM Hash | 0 |
| 06-catalog-map.js:71 | /sv/categories/hhcpm | TOM | HHCPM | 0 |
| 06-catalog-map.js:72 | /sv/categories/thcnm | TOM | THC-NM | 0 |
| 40-catalog.js:14 | /sv/categories/thca | TOM | THC-A | 0 |

Produkt-routes i koden som inte finns: `vape-magic-sauce-99-2ml` (55-reviews.js:40), `cart-magic-sauce-99-1ml` (55-reviews.js:46), `buds-thca-24-zkittles-indoor-5-gram` (55-reviews.js:50), `vape-thc-a-50-live-resin-faraoh-1ml` (55-reviews.js:52).
