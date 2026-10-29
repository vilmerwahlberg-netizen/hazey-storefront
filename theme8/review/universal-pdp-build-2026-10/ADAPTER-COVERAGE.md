# Adapter coverage — every published PDP (Task 10B-R1)

**Source:** today's Nyehandel sitemap (`/channel/1/products/1/sitemap.xml`, 121 products, the same set as Task 10A). Each page was opened in the real Theme 8 preview with the local build (`coverage.mjs`, 1440).

**Columns:** brand = rendered DOM; adapter = `html.hz8-pdp-pilot`; listing and stock from Task 10A `routes.tsv`.

## Summary

- **Adapter:** active on 107 of 121 published PDPs.
- **Customer-facing (listed) products:** 107, of which **0** lack the adapter. **No customer-facing product lacks a brand**, so none sits silently on the old template.
- **Without the adapter (14):**
  - Fraktändring (service item);
  - 13 unlisted legacy items without brand or format category. They keep the generic template with the 10B-0 protection.
- **On every page:** 1 H1, 0 horizontal overflow, 0 console errors.

## Launch blockers / admin actions (no admin changes made)

| Id | Route | Product | Stock | Admin action |
|---:|---|---|---|---|
| 20 | `/sv/products/fraktandring` | Fraktändring | sold-out | Hide from listings and search (Task 10A A3); keep as a service item |
| 31 | `/sv/products/blommor-nano10-20-amnesia-haze-5-gram` | Blommor – Nano10 20% – Amnesia Haze – 5 gram | sold-out | Deactivate/unpublish (sold out, legacy Nano10/Nano9/NanoX) or set brand + format category if it should be sold |
| 43 | `/sv/products/blommor-nano10-20-bz1-5-gram` | Blommor – Nano10 20% – BZ1 – 5 gram | sold-out | Deactivate/unpublish (sold out, legacy Nano10/Nano9/NanoX) or set brand + format category if it should be sold |
| 44 | `/sv/products/hash-nano10-20-zkittlez-mousse-5-gram` | Hash – Nano10 20% – Zkittlez Mousse – 5 gram | sold-out | Deactivate/unpublish (sold out, legacy Nano10/Nano9/NanoX) or set brand + format category if it should be sold |
| 45 | `/sv/products/hash-nano9-20-maroccan-hash-5-gram` | Hash – Nano9 20% – Maroccan Hash – 5 gram | sold-out | Deactivate/unpublish (sold out, legacy Nano10/Nano9/NanoX) or set brand + format category if it should be sold |
| 46 | `/sv/products/crumble-nano10-20-white-runtz-5-gram` | Crumble – Nano10 20% – White Runtz – 5 gram | sold-out | Deactivate/unpublish (sold out, legacy Nano10/Nano9/NanoX) or set brand + format category if it should be sold |
| 47 | `/sv/products/crumble-nano10-20-raspberry-5-gram` | Crumble – Nano10 20% – Raspberry – 5 gram | sold-out | Deactivate/unpublish (sold out, legacy Nano10/Nano9/NanoX) or set brand + format category if it should be sold |
| 48 | `/sv/products/blommor-nano10-20-og-kush-5-gram` | Blommor – Nano10 20% – OG Kush – 5 gram | sold-out | Deactivate/unpublish (sold out, legacy Nano10/Nano9/NanoX) or set brand + format category if it should be sold |
| 49 | `/sv/products/blommor-nano10-20-tequila-sunrise-5-gram` | Blommor – Nano10 20% – Tequila Sunrise – 5 gram | sold-out | Deactivate/unpublish (sold out, legacy Nano10/Nano9/NanoX) or set brand + format category if it should be sold |
| 50 | `/sv/products/blommor-nano10-20-gelato-33-5-gram` | Blommor – Nano10 20% – Gelato 33 – 5 gram | sold-out | Deactivate/unpublish (sold out, legacy Nano10/Nano9/NanoX) or set brand + format category if it should be sold |
| 51 | `/sv/products/blommor-nano10-20-jack-herer-5-gram` | Blommor – Nano10 20% – Jack Herer – 5 gram | sold-out | Deactivate/unpublish (sold out, legacy Nano10/Nano9/NanoX) or set brand + format category if it should be sold |
| 52 | `/sv/products/blommor-nano10-20-mimosa-5-gram` | Blommor – Nano10 20% – Mimosa – 5 gram | sold-out | Deactivate/unpublish (sold out, legacy Nano10/Nano9/NanoX) or set brand + format category if it should be sold |
| 56 | `/sv/products/cart-nano10-10-tatra-hemp-1ml` | Cart - Nano10 10% - Tatra Hemp - 1ml | partial | **Purchasable via direct link (1/5 variants).** Either deactivate it (legacy) or, if it should be sold, set brand Tatra Hemp and add it to Alla Carts; it then gets the adapter automatically |
| 89 | `/sv/products/prerolled-nanox-6-strawberry-sorbet-1-gram` | PreRolled – NanoX 6% – Strawberry Sorbet – 1 gram | sold-out | Deactivate/unpublish (sold out, legacy Nano10/Nano9/NanoX) or set brand + format category if it should be sold |

**Further issue:** the 13 unlisted items are still in the sitemap, so they can be reached and indexed. Remove or redirect them when they are deactivated.

## All published PDPs

| Id | Route | Type | Brand | Adapter | Reason if not |
|---:|---|---|---|---|---|
| 1 | `/sv/products/ccell-m4-vape-batteri-510` | customer-facing | CCELL | yes | – |
| 2 | `/sv/products/ccell-m3-plus-vape-batteri-510` | customer-facing | CCELL | yes | – |
| 3 | `/sv/products/vape-h4cbd-97-cbd-group-2ml` | customer-facing | CBD Group | yes | – |
| 4 | `/sv/products/vape-h4cbd-96-canapuff-1ml` | customer-facing | Canapuff | yes | – |
| 5 | `/sv/products/hazeyse-merch-nyckelring` | customer-facing | Hazey.se | yes | – |
| 6 | `/sv/products/vape-cbn-89-canapuff-1ml` | customer-facing | Canapuff | yes | – |
| 7 | `/sv/products/vape-thc-v-79-canapuff-1ml` | customer-facing | Canapuff | yes | – |
| 8 | `/sv/products/vape-thc-v-20-canntropy-1ml` | customer-facing | Canntropy | yes | – |
| 9 | `/sv/products/vape-h4cbd-95-canntropy-1ml` | customer-facing | Canntropy | yes | – |
| 10 | `/sv/products/ccell-palm-pro-vape-batteri-510` | customer-facing | CCELL | yes | – |
| 11 | `/sv/products/vape-thc-v-20-cbd-group-2ml` | customer-facing | CBD Group | yes | – |
| 12 | `/sv/products/blommor-cbd-3g-purple-haze-trinacria-hemp` | customer-facing | Trinacria Hemp | yes | – |
| 13 | `/sv/products/blommor-cbd-3g-gorilla-glue-trinacria-hemp` | customer-facing | Trinacria Hemp | yes | – |
| 14 | `/sv/products/blommor-cbd-3g-lemon-skunk-trinacria-hemp` | customer-facing | Trinacria Hemp | yes | – |
| 15 | `/sv/products/vape-thc-h-20-hazey-2ml-500puffs` | customer-facing | Hazey.se | yes | – |
| 16 | `/sv/products/vape-cbd-46-hazey-1ml` | customer-facing | Hazey.se | yes | – |
| 17 | `/sv/products/blommor-cbn-10-great-white-shark` | customer-facing | Hazey.se | yes | – |
| 18 | `/sv/products/buds-h4cbd-30-kusher-kush-5-gram` | customer-facing | Hazey.se | yes | – |
| 19 | `/sv/products/hash-h4cbd-20-cbn-20-h-bomb-5-gram` | customer-facing | Hazey.se | yes | – |
| 20 | `/sv/products/fraktandring` | service item | **missing** | no | service item (shipping change), no brand or format category: generic template with 10B-0 |
| 21 | `/sv/products/vape-thcv-euphoria-2ml` | customer-facing | Euphoria | yes | – |
| 22 | `/sv/products/buds-15-cbd-10-gram-russian-roulette` | customer-facing | Hazey.se | yes | – |
| 23 | `/sv/products/vape-thc-h-20-hazey-2ml-600puffs` | customer-facing | Hazey.se | yes | – |
| 24 | `/sv/products/ccell-m3b-vape-batteri-510` | customer-facing | CCELL | yes | – |
| 25 | `/sv/products/vape-thc-b-20-tatra-hemp-2ml` | customer-facing | Tatra Hemp | yes | – |
| 26 | `/sv/products/vape-thc-b-20-tatra-hemp-1ml` | customer-facing | Tatra Hemp | yes | – |
| 27 | `/sv/products/cart-thc-b-20-tatra-hemp-1ml` | customer-facing | Tatra Hemp | yes | – |
| 28 | `/sv/products/vape-thc-v-20-tatra-hemp-2ml` | customer-facing | Tatra Hemp | yes | – |
| 29 | `/sv/products/vape-thc-v-20-tatra-hemp-1ml` | customer-facing | Tatra Hemp | yes | – |
| 30 | `/sv/products/cart-thc-v-20-tatra-hemp-1ml` | customer-facing | Tatra Hemp | yes | – |
| 31 | `/sv/products/blommor-nano10-20-amnesia-haze-5-gram` | unlisted | **missing** | no | unlisted legacy item without brand or format category: generic template with 10B-0 |
| 32 | `/sv/products/ccell-fino-vape-batteri-510` | customer-facing | CCELL | yes | – |
| 33 | `/sv/products/ccell-sandwave-vape-batteri-510` | customer-facing | CCELL | yes | – |
| 34 | `/sv/products/buds-cbd-30-triple-scoop-35-gram` | customer-facing | Hazey.se | yes | – |
| 35 | `/sv/products/buds-cbg9-60-snow-ice` | customer-facing | Hazey.se | yes | – |
| 36 | `/sv/products/buds-cbn-30-malibu-skittelz-5-gram` | customer-facing | Hazey.se | yes | – |
| 37 | `/sv/products/isolat-thca-99-isolate-5-gram` | customer-facing | Hazey.se | yes | – |
| 38 | `/sv/products/buds-cbd-30-cereal-milk-35-gram` | customer-facing | Hazey.se | yes | – |
| 39 | `/sv/products/hash-thca-30-dry-sift-5-gram` | customer-facing | Hazey.se | yes | – |
| 40 | `/sv/products/buds-thca-23-orange-indoor-5-gram` | customer-facing | Hazey.se | yes | – |
| 41 | `/sv/products/buds-7-nano11-lemon-purple-5-gram` | customer-facing | Tatra Hemp | yes | – |
| 42 | `/sv/products/vape-thc-b-35-faraoh-1ml` | customer-facing | Faraoh | yes | – |
| 43 | `/sv/products/blommor-nano10-20-bz1-5-gram` | unlisted | **missing** | no | unlisted legacy item without brand or format category: generic template with 10B-0 |
| 44 | `/sv/products/hash-nano10-20-zkittlez-mousse-5-gram` | unlisted | **missing** | no | unlisted legacy item without brand or format category: generic template with 10B-0 |
| 45 | `/sv/products/hash-nano9-20-maroccan-hash-5-gram` | unlisted | **missing** | no | unlisted legacy item without brand or format category: generic template with 10B-0 |
| 46 | `/sv/products/crumble-nano10-20-white-runtz-5-gram` | unlisted | **missing** | no | unlisted legacy item without brand or format category: generic template with 10B-0 |
| 47 | `/sv/products/crumble-nano10-20-raspberry-5-gram` | unlisted | **missing** | no | unlisted legacy item without brand or format category: generic template with 10B-0 |
| 48 | `/sv/products/blommor-nano10-20-og-kush-5-gram` | unlisted | **missing** | no | unlisted legacy item without brand or format category: generic template with 10B-0 |
| 49 | `/sv/products/blommor-nano10-20-tequila-sunrise-5-gram` | unlisted | **missing** | no | unlisted legacy item without brand or format category: generic template with 10B-0 |
| 50 | `/sv/products/blommor-nano10-20-gelato-33-5-gram` | unlisted | **missing** | no | unlisted legacy item without brand or format category: generic template with 10B-0 |
| 51 | `/sv/products/blommor-nano10-20-jack-herer-5-gram` | unlisted | **missing** | no | unlisted legacy item without brand or format category: generic template with 10B-0 |
| 52 | `/sv/products/blommor-nano10-20-mimosa-5-gram` | unlisted | **missing** | no | unlisted legacy item without brand or format category: generic template with 10B-0 |
| 53 | `/sv/products/prerolled-cbd-blue-raz-1-gram` | customer-facing | Hazey.se | yes | – |
| 54 | `/sv/products/prerolled-cbd-apples-amp-bananas-1-gram` | customer-facing | Hazey.se | yes | – |
| 55 | `/sv/products/hash-thca-30-dry-static-5-gram` | customer-facing | Hazey.se | yes | – |
| 56 | `/sv/products/cart-nano10-10-tatra-hemp-1ml` | unlisted | **missing** | no | unlisted legacy item without brand or format category: generic template with 10B-0 |
| 57 | `/sv/products/vape-thc-a-45-faraoh-2ml` | customer-facing | Faraoh | yes | – |
| 58 | `/sv/products/prerolled-thca-22-bangkok-1-gram` | customer-facing | Hazey.se | yes | – |
| 59 | `/sv/products/buds-magic-sauce-50-yoda-ice-cream-5-gram` | customer-facing | Magic Farmers | yes | – |
| 60 | `/sv/products/buds-magic-sauce-50-gorilla-cookies-5-gram` | customer-facing | Magic Farmers | yes | – |
| 61 | `/sv/products/buds-thca-23-amnesia-5-gram` | customer-facing | Hazey.se | yes | – |
| 62 | `/sv/products/buds-thca-18-strawberry-og-5-gram` | customer-facing | Hazey.se | yes | – |
| 63 | `/sv/products/cart-cbd-60-tatra-hemp-05ml` | customer-facing | Tatra Hemp | yes | – |
| 64 | `/sv/products/buds-thca-20-white-widow-5-gram` | customer-facing | Hazey.se | yes | – |
| 65 | `/sv/products/buds-thca-20-thcnm-10-black-widow-5-gram` | customer-facing | Hazey.se | yes | – |
| 66 | `/sv/products/hash-thca-20-thcnm-20-malaga-magic-5-gram` | customer-facing | Hazey.se | yes | – |
| 67 | `/sv/products/hash-thca-40-northern-lights-5-gram` | customer-facing | Hazey.se | yes | – |
| 68 | `/sv/products/blommor-hhcpm-15-amnesia-5-gram` | customer-facing | Hazey.se | yes | – |
| 69 | `/sv/products/blommor-hhcpm-15-durban-poison-5-gram` | customer-facing | Hazey.se | yes | – |
| 70 | `/sv/products/vape-hhcpm-15-canntropy-2ml` | customer-facing | Canntropy | yes | – |
| 71 | `/sv/products/vape-dual-cbd-57-hana-butter-amp-long-island-11ml` | customer-facing | Hazey.se | yes | – |
| 72 | `/sv/products/vape-dual-cbd-56-blueberry-banana-amp-tequila-sunrise-11ml` | customer-facing | Hazey.se | yes | – |
| 73 | `/sv/products/cart-cbd-60-cookies-1ml` | customer-facing | Cookies | yes | – |
| 74 | `/sv/products/buds-magic-sauce-50-tinky-winky-5-gram` | customer-facing | Magic Farmers | yes | – |
| 75 | `/sv/products/buds-highlife-thcnm-gsc-5-gram` | customer-facing | Hazey.se | yes | – |
| 76 | `/sv/products/hash-thca-30-thcnm-10-royal-gorilla-5-gram` | customer-facing | Hazey.se | yes | – |
| 77 | `/sv/products/hash-magic-sauce-50-marrakesh-dream-5-gram` | customer-facing | Magic Farmers | yes | – |
| 78 | `/sv/products/vape-thcx-19-core-2ml` | customer-facing | Hero | yes | – |
| 79 | `/sv/products/buds-cbd-purple-haze-5-gram` | customer-facing | Hazey.se | yes | – |
| 80 | `/sv/products/buds-cbd-strawberry-haze-5-gram` | customer-facing | Hazey.se | yes | – |
| 81 | `/sv/products/buds-cbd-trim-royal-10-gram` | customer-facing | Hazey.se | yes | – |
| 82 | `/sv/products/buds-thca-23-hhcpm-12-wedding-cake-5-gram` | customer-facing | Hazey.se | yes | – |
| 83 | `/sv/products/vape-10-oh-thc-95-canapuff-1ml` | customer-facing | Canapuff | yes | – |
| 84 | `/sv/products/buds-magic-sauce-50-samurai-jack-5-gram` | customer-facing | Magic Farmers | yes | – |
| 85 | `/sv/products/prerolled-cbd-tequila-sunrise-1-gram` | customer-facing | Hazey.se | yes | – |
| 86 | `/sv/products/hash-cbn-40-yellowstone-5-gram` | customer-facing | Hazey.se | yes | – |
| 87 | `/sv/products/vape-cbd-25-cbn-35-magic-farmers-2ml` | customer-facing | Magic Farmers | yes | – |
| 88 | `/sv/products/blommor-cbd-30-tequila-sunrise-35-gram` | customer-facing | Hazey.se | yes | – |
| 89 | `/sv/products/prerolled-nanox-6-strawberry-sorbet-1-gram` | unlisted | **missing** | no | unlisted legacy item without brand or format category: generic template with 10B-0 |
| 90 | `/sv/products/cart-thc-a-45-faraoh-1ml` | customer-facing | Faraoh | yes | – |
| 91 | `/sv/products/vape-magic-sauce-99-2ml` | customer-facing | Magic Farmers | yes | – |
| 92 | `/sv/products/cart-magic-sauce-99-1ml` | customer-facing | Magic Farmers | yes | – |
| 93 | `/sv/products/buds-magic-sauce-50-khalifa-kush-5-gram` | customer-facing | Magic Farmers | yes | – |
| 94 | `/sv/products/buds-thca-22-kitty-indoor-5-gram` | customer-facing | Hazey.se | yes | – |
| 95 | `/sv/products/buds-thca-22-og-kush-small-buds-5-gram` | customer-facing | Hazey.se | yes | – |
| 96 | `/sv/products/buds-magic-sauce-50-donny-burger-5-gram` | customer-facing | Magic Farmers | yes | – |
| 97 | `/sv/products/buds-thca-25-bubbelgum-og-5-gram` | customer-facing | Hazey.se | yes | – |
| 98 | `/sv/products/buds-thca-24-ice-indoor-5-gram` | customer-facing | Hazey.se | yes | – |
| 99 | `/sv/products/hash-thca-50-bubble-hash-5-gram` | customer-facing | Hazey.se | yes | – |
| 100 | `/sv/products/buds-magic-sauce-50-crazy-dog-5-gram` | customer-facing | Magic Farmers | yes | – |
| 101 | `/sv/products/vape-thc-a-50-live-resin-faraoh-2ml` | customer-facing | Faraoh | yes | – |
| 102 | `/sv/products/vape-thc-a-50-live-resin-faraoh-1ml` | customer-facing | Faraoh | yes | – |
| 103 | `/sv/products/hash-thca-25-la-mousse-5-gram` | customer-facing | Hazey.se | yes | – |
| 104 | `/sv/products/buds-7-nano11-sweet-karma-popcorn-5-gram` | customer-facing | Tatra Hemp | yes | – |
| 105 | `/sv/products/buds-7-nano11-amnezia-haze-5-gram` | customer-facing | Tatra Hemp | yes | – |
| 106 | `/sv/products/buds-7-nano11-super-skunk-5-gram` | customer-facing | Tatra Hemp | yes | – |
| 107 | `/sv/products/isolat-cbd-99-isolate-15-gram` | customer-facing | Hazey.se | yes | – |
| 108 | `/sv/products/hash-cbd-15-primero-1-gram` | customer-facing | Hazey.se | yes | – |
| 109 | `/sv/products/hash-thca-60-piatella-hash-5-gram` | customer-facing | Hazey.se | yes | – |
| 110 | `/sv/products/buds-thca-22-orange-small-buds-5-gram` | customer-facing | Hazey.se | yes | – |
| 111 | `/sv/products/buds-thca-24-zkittles-indoor-5-gram` | customer-facing | Hazey.se | yes | – |
| 112 | `/sv/products/buds-7-nano11-raspberry-popcorn-5-gram` | customer-facing | Tatra Hemp | yes | – |
| 113 | `/sv/products/buds-7-nano11-cali-grape-5-gram` | customer-facing | Tatra Hemp | yes | – |
| 114 | `/sv/products/buds-7-nano11-bruce-banner-5-gram` | customer-facing | Tatra Hemp | yes | – |
| 115 | `/sv/products/buds-7-nano11-apple-fritter-5-gram` | customer-facing | Tatra Hemp | yes | – |
| 116 | `/sv/products/hash-thca-25-ketama-5-gram` | customer-facing | Hazey.se | yes | – |
| 117 | `/sv/products/buds-thca-25-raspberry-5-gram` | customer-facing | Hazey.se | yes | – |
| 118 | `/sv/products/cart-thc-a-50-live-resin-faraoh-1ml` | customer-facing | Faraoh | yes | – |
| 119 | `/sv/products/hash-magic-sauce-50-charas-5-gram` | customer-facing | Magic Farmers | yes | – |
| 120 | `/sv/products/buds-magic-sauce-50-la-chupacabra-5-gram` | customer-facing | Magic Farmers | yes | – |
| 121 | `/sv/products/buds-thca-23-amnesia-infused-5-gram` | customer-facing | Hazey.se | yes | – |
