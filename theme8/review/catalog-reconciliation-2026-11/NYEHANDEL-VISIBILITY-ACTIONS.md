# Synlighetsåtgärder i Nyehandel (ingen ändring gjord)

TASK 17 · 2026-11-03 · källor: WooCommerce-livesidan (Store API alla synlighetslägen, kategorisidornas listningar, produktsidornas HZY_PRODUKT/HZY_PAKET/HZY_EXTRA) och Nyehandel (sitemap, 68 kategorier med alla sidor, produktsidor, product/state). Genererad av `build-docs.mjs` ur JSON-filerna i samma mapp.

**Inga adminändringar är gjorda i denna körning.** Listan är exakt: varje rad är en Nyehandel-produkt (id och slug) och vad WooCommerce visar en kund i dag. "Dölj i listningar" = ska inte synas i Alla produkter, kategorisidor, Bästsäljare-källan, sök och rekommendationer; produktsidan behövs fortfarande (paket/strainbarn/direktlänk) och ska inte raderas. Bekräfta Nyehandels exakta synlighetsinställning (t.ex. dold i listning kontra avpublicerad) innan massändring

## A. Dölj i listningar – Woo-paket importerade som vanliga produkter (36)

Dölj tills paketprodukten är ombyggd och provköpt (PACKAGE-MIGRATION-PLAN.md). Säljs i dag som vanlig produkt med eget pris men lager 0.

| NH-id | Slug | Namn | Woo-synlighet | Lager Woo / NH | Listad i NH i dag | Varför |
|---:|---|---|---|---|---|---|
| 169 | ms-3-0-5ml-5-pack | MS 3.0 – 5ml – 5-pack | hidden | i lager / slut | alla-produkter, alla-vapes, magic-farmers, magic-sauce, ms-vapes | WooCommerce-paket (hidden, olistad) |
| 166 | ms-3-0-5ml-3-pack | MS 3.0 – 5ml – 3-pack | hidden | i lager / slut | alla-produkter, alla-vapes, magic-farmers, magic-sauce, ms-vapes | WooCommerce-paket (hidden, olistad) |
| 163 | nano-11-pre-rolls-1g-5-pack | Nano 11 Pre Rolls 1g – 5-pack | hidden | i lager / slut | alla-produkter, blommor-buds, nano-11, nano11-blommor, tatra-hemp | WooCommerce-paket (hidden, olistad) |
| 160 | nano-11-pre-rolls-1g-10-pack | Nano 11 Pre Rolls 1g – 10-pack | hidden | i lager / slut | alla-produkter, blommor-buds, nano-11, nano11-blommor, tatra-hemp | WooCommerce-paket (hidden, olistad) |
| 157 | magic-sauce-50-pre-rolls-1g-10-pack | Magic Sauce 50% Pre Rolls 1g – 10-pack | hidden | i lager / slut | alla-produkter, blommor-buds, hasch, magic-farmers, magic-sauce, ms-buds, ms-hash | WooCommerce-paket (hidden, olistad) |
| 154 | magic-sauce-50-pre-rolls-1g-5-pack | Magic Sauce 50% Pre Rolls 1g – 5-pack | hidden | i lager / slut | alla-produkter, blommor-buds, hasch, magic-farmers, magic-sauce, ms-buds, ms-hash | WooCommerce-paket (hidden, olistad) |
| 246 | startpaket-thca-b-batteri | Startpaket – M3b Pro Batteri + 2× THCA-B 50% 1ml | search | slut / slut | alla-cartridges, alla-produkter, bundles, pennor, thca-b, thcab-vapes | WooCommerce-paket (search, olistad) |
| 150 | thca-b-50-faraoh-1ml-10-pack | THCA-B 50% Faraoh 1ml – 10-pack | hidden | slut / slut | alla-cartridges, alla-produkter, thca-b, thcab-vapes | WooCommerce-paket (hidden, olistad) |
| 245 | d10-2ml-5-pack | D10 2ml – 5-pack | hidden | slut / slut | alla-produkter, alla-vapes, magic-farmers, magic-sauce, ms-vapes | WooCommerce-paket (hidden, olistad) |
| 243 | d10-2ml-3-pack | D10 2ml – 3-pack | hidden | slut / slut | alla-produkter, alla-vapes, magic-farmers, magic-sauce, ms-vapes | WooCommerce-paket (hidden, olistad) |
| 241 | thca-b-50-faraoh-1ml-5-pack | THCA-B 50% Faraoh 1ml – 5-pack | hidden | slut / slut | alla-produkter, alla-vapes, thcba, thcba-vapes | WooCommerce-paket (hidden, olistad) |
| 240 | thca-b-50-faraoh-1ml-3-pack | THCA-B 50% Faraoh 1ml – 3-pack | hidden | slut / slut | alla-produkter, alla-vapes, thcba, thcba-vapes | WooCommerce-paket (hidden, olistad) |
| 239 | thca-b-50-faraoh-2ml-5-pack | THCA-B 50% Faraoh 2ml – 5-pack | hidden | slut / slut | alla-produkter, alla-vapes, thcba, thcba-vapes | WooCommerce-paket (hidden, olistad) |
| 238 | thca-b-50-faraoh-2ml-3-pack | THCA-B 50% Faraoh 2ml – 3-pack | hidden | slut / slut | alla-produkter, alla-vapes, thcba, thcba-vapes | WooCommerce-paket (hidden, olistad) |
| 205 | startpaket-magic-sauce-batteri | Startpaket – M3b Pro Batteri + 2× Magic Sauce 3.0 1ml | visible | slut / slut | alla-cartridges, alla-produkter, bundles, magic-farmers, magic-sauce, ms-carts, pennor | WooCommerce-paket (visible, listad i butik, alla-cartridges, alla-produkter, bundles, magic-farmers, magic-sauce, ms-carts, pennor) |
| 186 | ms-30-10ml-kollektion | MS 3.0 – 10ml – Kollektion | hidden | slut / slut | alla-liquids, alla-produkter, magic-farmers, magic-sauce, ms-vapes | WooCommerce-paket (hidden, olistad) |
| 184 | nano11-buds-10-pack | Nano 11 Buds 5g – 10-pack | hidden | i lager / slut | alla-produkter, blommor-buds, nano-11, nano11-blommor, tatra-hemp | WooCommerce-paket (hidden, olistad) |
| 181 | nano11-buds-5-pack | Nano 11 Buds 5g – 5-pack | hidden | i lager / slut | alla-produkter, blommor-buds, nano-11, nano11-blommor, tatra-hemp | WooCommerce-paket (hidden, olistad) |
| 179 | nano11-buds-3-pack | Nano 11 Buds 5g – 3-pack | hidden | i lager / slut | alla-produkter, blommor-buds, nano-11, nano11-blommor, tatra-hemp | WooCommerce-paket (hidden, olistad) |
| 176 | high-life-5g-5-pack | High Life 5g – 5-pack | hidden | i lager / slut | alla-produkter, blommor-buds, hero-vapes, high-life-buds | WooCommerce-paket (hidden, olistad) |
| 174 | high-life-5g-3-pack | High Life 5g – 3-pack | hidden | i lager / slut | alla-produkter, blommor-buds, hero-vapes, high-life-buds | WooCommerce-paket (hidden, olistad) |
| 173 | ms50-5g-10-pack | Magic Sauce 50% 5g – 10-pack | hidden | i lager / slut | alla-produkter, blommor-buds, magic-farmers, magic-sauce, ms-buds | WooCommerce-paket (hidden, olistad) |
| 170 | ms50-5g-5-pack | Magic Sauce 50% 5g – 5-pack | hidden | i lager / slut | alla-produkter, blommor-buds, magic-farmers, magic-sauce, ms-buds | WooCommerce-paket (hidden, olistad) |
| 167 | ms50-5g-3-pack | Magic Sauce 50% 5g – 3-pack | hidden | i lager / slut | alla-produkter, blommor-buds, magic-farmers, magic-sauce, ms-buds | WooCommerce-paket (hidden, olistad) |
| 164 | heros-core-2ml-kollektion | Hero's Core 2ml – Kollektion | hidden | i lager / slut | alla-produkter, alla-vapes, core-vapes, hero-vapes | WooCommerce-paket (hidden, olistad) |
| 162 | heros-core-2ml-5-pack | Hero's Core 2ml – 5-pack | hidden | i lager / slut | alla-produkter, alla-vapes, core-vapes, hero-vapes | WooCommerce-paket (hidden, olistad) |
| 159 | heros-core-2ml-3-pack | Hero's Core 2ml – 3-pack | hidden | i lager / slut | alla-produkter, alla-vapes, core-vapes, hero-vapes | WooCommerce-paket (hidden, olistad) |
| 156 | ms-30-1ml-kollektion | MS 3.0 – 1ml – Kollektion | hidden | slut / slut | alla-cartridges, alla-produkter, magic-farmers, magic-sauce, ms-vapes | WooCommerce-paket (hidden, olistad) |
| 153 | ms-30-1ml-5-pack | MS 3.0 – 1ml – 5-pack | hidden | slut / slut | alla-cartridges, alla-produkter, magic-farmers, magic-sauce, ms-vapes | WooCommerce-paket (hidden, olistad) |
| 151 | ms-30-1ml-3-pack | MS 3.0 – 1ml – 3-pack | hidden | slut / slut | alla-cartridges, alla-produkter, magic-farmers, magic-sauce, ms-vapes | WooCommerce-paket (hidden, olistad) |
| 149 | ms-30-2ml-kollektion | MS 3.0 – 2ml – Kollektion | hidden | i lager / slut | alla-produkter, alla-vapes, magic-farmers, magic-sauce, ms-vapes | WooCommerce-paket (hidden, olistad) |
| 147 | ms-30-2ml-5-pack | MS 3.0 – 2ml – 5-pack | hidden | i lager / slut | alla-produkter, alla-vapes, magic-farmers, magic-sauce, ms-vapes | WooCommerce-paket (hidden, olistad) |
| 145 | ms-30-2ml-3-pack | MS 3.0 – 2ml – 3-pack | hidden | i lager / slut | alla-produkter, alla-vapes, magic-farmers, magic-sauce, ms-vapes | WooCommerce-paket (hidden, olistad) |
| 143 | faraoh-thca-b-hela-kollektionen | Faraoh THCbA Vape 2ml - Hela kollektionen | hidden | slut / slut | alla-produkter, alla-vapes, thcba, thcba-vapes | WooCommerce-paket (hidden, olistad) |
| 142 | faraoh-thca-b-5-pack | Faraoh THCbA Vape 2ml - 5-pack | hidden | slut / slut | alla-produkter, alla-vapes, thcba, thcba-vapes | WooCommerce-paket (hidden, olistad) |
| 140 | faraoh-thca-b-3-pack | Faraoh THCbA Vape 2ml - 3-pack | hidden | slut / slut | alla-produkter, alla-vapes, thcba, thcba-vapes | WooCommerce-paket (hidden, olistad) |

## B. Dölj i listningar – strainbarn som bara säljs via paket/familjebyggare

Dolda i WooCommerce (catalog_visibility=hidden), ingår i Nano11-paketen. Behövs som paketdelar.

| NH-id | Slug | Namn | Woo-synlighet | Lager Woo / NH | Listad i NH i dag | Varför |
|---:|---|---|---|---|---|---|
| 213 | nano11-naranja-popcorn-buds-5g | 7% Nano11 – Naranja Pop. – 5g | hidden | slut / slut | alla-produkter, blommor-buds, nano-11, nano11-blommor, tatra-hemp | olistad, ingår i paket nano11-buds-10-pack, nano11-buds-5-pack, nano11-buds-3-pack; slut |
| 210 | nano11-buds-godzilla-5g | 7% Nano11 – Godzilla – 5g | hidden | slut / slut | alla-produkter, blommor-buds, nano-11, nano11-blommor, tatra-hemp | olistad, ingår i paket nano11-buds-10-pack, nano11-buds-5-pack, nano11-buds-3-pack; slut |
| 206 | nano-11-buds-lemon-mandarine-5g | 7% Nano11 – Lemon Mandarine – 5g | hidden | slut / slut | alla-produkter, blommor-buds, nano-11, nano11-blommor, tatra-hemp | olistad, ingår i paket nano11-buds-10-pack, nano11-buds-5-pack, nano11-buds-3-pack; slut |
| 183 | nano11-lemon-sorbet-5-gram | 7% Nano11 – Lemon Sorbet – 5g | hidden | slut / slut | alla-produkter, blommor-buds, nano-11, nano11-blommor, tatra-hemp | olistad, ingår i paket nano11-buds-10-pack, nano11-buds-5-pack, nano11-buds-3-pack; slut |
| 193 | nano-buds-strawberry-og-5-gram | 7% Nano11 – Strawberry OG – 5g | hidden | slut / slut | alla-produkter, blommor-buds, nano-11, nano11-blommor, tatra-hemp | olistad, ingår i paket nano11-buds-10-pack, nano11-buds-5-pack, nano11-buds-3-pack; slut |
| 192 | nano-buds-gary-payton-5-gram | 7% Nano11 – Gary Payton – 5g | hidden | slut / slut | alla-produkter, blommor-buds, nano-11, nano11-blommor, tatra-hemp | olistad, ingår i paket nano11-buds-10-pack, nano11-buds-5-pack, nano11-buds-3-pack; slut |
| 190 | buds-nano11-crystal-snow-5-gram | 7% Nano11 – Crystal Snow – 5g | hidden | slut / slut | alla-produkter, blommor-buds, nano-11, nano11-blommor, tatra-hemp | olistad, ingår i paket nano11-buds-10-pack, nano11-buds-5-pack, nano11-buds-3-pack; slut |
| 187 | nano-buds-raspberry-popcorn-5-gram | Buds – 7% Nano11 – Raspberry Popcorn – 5 gram | hidden | slut / slut | alla-produkter, blommor-buds, nano-11, nano11-blommor, tatra-hemp | olistad, ingår i paket nano11-buds-10-pack, nano11-buds-5-pack, nano11-buds-3-pack; slut |
| 131 | nano-buds-lemon-purple-5-gram | Buds – 7% Nano11 – Lemon Purple – 5 gram | hidden | slut / slut | alla-produkter, blommor-buds, nano-11, nano11-blommor, tatra-hemp | olistad, ingår i paket nano11-buds-10-pack, nano11-buds-5-pack, nano11-buds-3-pack; slut |
| 177 | buds-nano11-snow-white-popcorn-5-gram | Buds – 7% Nano11 – Snow White Popcorn – 5 gram | hidden | slut / slut | alla-produkter, blommor-buds, nano-11, nano11-blommor, tatra-hemp | olistad, ingår i paket nano11-buds-10-pack, nano11-buds-5-pack, nano11-buds-3-pack; slut |
| 180 | buds-nano11-abacous-5-gram | Buds – 7% Nano11 – Abacous – 5 gram | hidden | slut / slut | alla-produkter, blommor-buds, nano-11, nano11-blommor, tatra-hemp | olistad, ingår i paket nano11-buds-10-pack, nano11-buds-5-pack, nano11-buds-3-pack; slut |

## C. Dölj i listningar, behåll direktlänk/sök – sökbara men olistade i WooCommerce

catalog_visibility=search i WooCommerce: nås via sök och direktlänk men listas aldrig i kategorier.

| NH-id | Slug | Namn | Woo-synlighet | Lager Woo / NH | Listad i NH i dag | Varför |
|---:|---|---|---|---|---|---|
| 256 | thca-b-faraoh-carts-1ml | THCA-B 50% - Faraoh - 1ml | search | slut / slut | alla-cartridges, alla-produkter, thca-b, thcab-vapes | synlig bara i sök/direktlänk (catalog_visibility=search), ingår även i paket startpaket-thca-b-batteri, thca-b-50-faraoh-1ml-10-pack, thca-b-50-faraoh-1ml-5-pack, thca-b-50-faraoh-1ml-3-pack, slut |
| 242 | thca-b-vape-faraoh-2ml | THCA-B 50% - Faraoh - 2ml | search | slut / slut | alla-produkter, alla-vapes, thca-b, thcab-vapes | synlig bara i sök/direktlänk (catalog_visibility=search), ingår även i paket thca-b-50-faraoh-2ml-5-pack, thca-b-50-faraoh-2ml-3-pack, slut |
| 202 | thcv-vape-canntropy-1ml | THCV 20% + CBG + CBN - 1ml | search | slut / slut | alla-produkter, alla-vapes, cbn, cbn-vapes, thcv, thcv-vape | synlig bara i sök/direktlänk (catalog_visibility=search), slut |
| 204 | high-life-gelato-hero-vapes-core-5g | High Life – Gelato – 5g | search | slut / slut | alla-produkter, blommor-buds, hero-vapes, high-life-buds | synlig bara i sök/direktlänk (catalog_visibility=search), ingår även i paket high-life-5g-5-pack, high-life-5g-3-pack, slut |
| 135 | high-life-white-widow-sativa-buds-5-gram-hero-vapes | High Life – White Widow – 5g | search | slut / slut | alla-produkter, blommor-buds, hero-vapes, high-life-buds | synlig bara i sök/direktlänk (catalog_visibility=search), ingår även i paket high-life-5g-5-pack, high-life-5g-3-pack, slut |
| 185 | isolat-cbd-isolate-15-gram | Isolat – CBD 99% – Isolate – 15 gram | search | slut / slut | alla-produkter, blommor-buds, cbd, cbd-buds-1, hasch, tatra-hemp | synlig bara i sök/direktlänk (catalog_visibility=search), slut |
| 152 | magic-sauce-hash-marrakesh-dream-5-gram | Hash – Magic Sauce 50% – Marrakesh Dream – 5 gram | search | slut / slut | alla-produkter, hasch, magic-farmers, magic-sauce, ms-buds | synlig bara i sök/direktlänk (catalog_visibility=search), ingår även i paket ms50-5g-10-pack, ms50-5g-5-pack, ms50-5g-3-pack, slut |
| 251 | thc-b-vape-faraoh-1ml | Vape - THC-B 35% - Faraoh - 1ml | search | slut / slut | alla-produkter, alla-vapes, faraoh, thcb, thcb-vapes | synlig bara i sök/direktlänk (catalog_visibility=search), slut |
| 249 | blommor-cbg9-60-snow-ice | Buds – CBG9 60% – Snow Ice | search | slut / slut | alla-produkter, blommor-buds, cbd, cbn, magic-farmers | synlig bara i sök/direktlänk (catalog_visibility=search), slut |
| 247 | ccell-sandwave-vape-batteri-510 | CCELL Sandwave – Vape Batteri – 510 | search | slut / slut | alla-produkter, pennor | synlig bara i sök/direktlänk (catalog_visibility=search), slut |
| 244 | ccell-fino-vape-batteri-510 | CCELL Fino – Vape Batteri – 510 | search | slut / slut | alla-produkter, pennor | synlig bara i sök/direktlänk (catalog_visibility=search), slut |
| 189 | h4cbd-vape-canapuff-1ml | Vape - H4CBD 96% - Canapuff - 1ml | search | slut / slut | alla-produkter, alla-vapes, h4cbd, h4cbd-vape | synlig bara i sök/direktlänk (catalog_visibility=search), slut |
| 233 | thcv-vape-euphoria-2ml | Vape - THCV - Euphoria - 2ml | search | slut / slut | alla-produkter, alla-vapes, thcv, thcv-vape | synlig bara i sök/direktlänk (catalog_visibility=search), slut |
| 225 | cbd-vape-1ml-46-hazey | Vape - CBD 46% - Hazey - 1ml | search | slut / slut | alla-produkter, alla-vapes, cbd, cbd-vapes | synlig bara i sök/direktlänk (catalog_visibility=search), slut |
| 199 | thcv-vape-canapuff-1ml | Vape - THC-V 79% - Canapuff - 1ml | search | slut / slut | alla-produkter, alla-vapes, thcv, thcv-vape | synlig bara i sök/direktlänk (catalog_visibility=search), slut |

## D. Dölj helt – tjänst/legacy

Fraktändring är en tjänstepost, aldrig sortiment.

| NH-id | Slug | Namn | Woo-synlighet | Lager Woo / NH | Listad i NH i dag | Varför |
|---:|---|---|---|---|---|---|
| 126 | fraktandring | Fraktändring | visible | i lager / slut | alla-produkter | tjänstepost (fraktändring), aldrig en produkt i sortimentet |

## E. Granska – ägarbeslut



Inga.

## F. Visa (redan listade i båda, ingen åtgärd)

Listade i WooCommerce och i motsvarande Nyehandel-kategorier (medlemskapen stämmer: 0 Woo-listade produkter saknas i NH-kategorin).

260 `magic-sauce-vape-5ml` · 257 `magic-sauce-pre-rolls-1g` · 198 `magic-sauce-buds-la-chupacabra-5-gram` · 201 `magic-sauce-buds-titty-sprinkles-5-gram` · 168 `magic-sauce-buds-magic-farmers-sverige-khalifa-kush-5-gram` · 175 `buds-magic-sauce-50-crazy-dog-5-gram` · 235 `d10-hash-purple-storm-5g` · 234 `d10-hash-blue-diamond-5g` · 231 `magic-sauce-buds-grape-gasoline` · 228 `magic-sauce-dubai-chocolate-istallet-for-thc-a-hash` · 226 `magic-sauce-buds-london-lobster-ersatt-thc-a` · 223 `d10-buds-white-widow-5g` · 221 `magic-sauce-buds-kowa-bunga-5g` · 218 `d10-hash-silk-road-magic-farmers-thcx` · 216 `d10-hash-rosinella-magic-farmers` · 214 `d10-buds-skywalker-og-magic-farmers-thcx` · 211 `d10-buds-porn-star-og-magic-farmers` · 209 `d10-buds-cosmic-trip-5g` · 254 `d10-vape-magic-farmers` · 203 `magic-sauce-buds-thca-ersatt-john-lemon-5g` · 200 `nano-hash-zkittlez-mousse-ersatt-thca-hash` · 197 `buds-nanno-11-critical-berries` · 165 `7-nano11-prerolled-1-gram` · 194 `nano-11-buds-thca-substitut-royal-og` · 191 `nano-buds-ersatt-thca-bubba-kush-5g` · 188 `magic-sauce-hash-kitkat-5g` · 236 `thcba-vape-faraoh-2ml` · 252 `magic-sauce-10ml` · 138 `cookies-buds-cbd-hawaiian-rain` · 136 `cbd-30-long-island-35g` · 133 `cbd-cookies-adios-m-f` · 232 `cbd-buds-cookies-hollywood` · 230 `cookies-cbd-buds-blue-raz` · 250 `ccell-stylo-vape-batteri-510` · 227 `cbd-hash-london-pound-cake-100g` · 224 `cookies-v2-large-stackables` · 222 `cookies-original-snapback` · 219 `cookies-original-beanie` · 248 `cookies-medium-metal-tray` · 217 `cookies-c-bite-buds-tray` · 215 `cookies-dual-chamber-cbd-vape-cereal-milk-london-pound-cake` · 208 `nano-11-buds-orange-zkittlez-5g` · 128 `cbd-buds-triple-scoop-cookies-cannabis` · 262 `cart-magic-sauce-magic-farmers-1ml` · 146 `blommor-magic-sauce-buds-tinky-winki-5-gram` · 155 `magic-sauce-buds-samurai-jack-magic-farmers-weed` · 172 `magic-sauce-buds-donny-burger-5g` · 261 `vape-magic-sauce-magic-farmers-2ml` · 134 `magic-sauce-buds-magic-farmers-gorilla-cookies-5-gram` · 132 `magic-sauce-buds-yoda-ice-cream-5-gram` · 139 `high-life-hash-northern-lights-5g` · 137 `high-life-hash-malaga-magic-5g` · 148 `el-gringo-hash-strawberry-shortcake-5g` · 255 `thc-x-vape-hero-core-2ml` · 258 `cbd-prerolled-cookies-1g` · 196 `magic-sauce-hash-charas-5-gram` · 127 `cbd-buds-10-gram-russian-roulette` · 259 `cbd-vape-cbn-vape-magic-farmers` · 161 `cbd-buds-cookies-tequila-sunrise-35-gram` · 158 `hash-cbn-yellowstone-5-gram` · 144 `cookies-cbd-vape-dual-chamber-triple-scoop-apples-bananas` · 253 `cbd-510-cart-cookies-1ml` · 141 `cookies-cbd-vape-adios-mother-f-miami-mint` · 130 `cookies-cannabis-buds-cbd-cereal-milk-35-gram` · 129 `cbn-buds-malibu-skittelz` · 123 `merch-nyckelring-hazey` · 237 `ccell-m3b-vape-batteri-510` · 125 `hash-h4cbd-20-cbn-20-h-bomb-5-gram` · 124 `h4cbd-buds-30-kusher-kush-magic-farmers-5-gram` · 229 `cbn-buds-magic-farmers-great-white-shark-1-25-gram` · 220 `thcv-vape-cbd-group-2ml` · 212 `ccell-palm-pro-vape-batteri-510-ganga` · 207 `h4cbd-vape-canntropy-1ml` · 195 `cbn-vape-canapuff-1ml` · 182 `h4cbd-vape-cbd-group-2ml` · 178 `ccell-m3-plus-vape-batteri-510` · 171 `ccell-m4-penna`

## Lageravvikelser att rätta samtidigt

| NH-id | Slug | Woo | NH | Not |
|---:|---|---|---|---|
| 169 | ms-3-0-5ml-5-pack | i lager | slut | paket: NH-lager 0, Woo räknar paketlager ur delarna |
| 166 | ms-3-0-5ml-3-pack | i lager | slut | paket: NH-lager 0, Woo räknar paketlager ur delarna |
| 163 | nano-11-pre-rolls-1g-5-pack | i lager | slut | paket: NH-lager 0, Woo räknar paketlager ur delarna |
| 160 | nano-11-pre-rolls-1g-10-pack | i lager | slut | paket: NH-lager 0, Woo räknar paketlager ur delarna |
| 157 | magic-sauce-50-pre-rolls-1g-10-pack | i lager | slut | paket: NH-lager 0, Woo räknar paketlager ur delarna |
| 154 | magic-sauce-50-pre-rolls-1g-5-pack | i lager | slut | paket: NH-lager 0, Woo räknar paketlager ur delarna |
| 168 | magic-sauce-buds-magic-farmers-sverige-khalifa-kush-5-gram | slut | i lager | **säljbar i NH men slut i Woo** – rätta lagret före launch |
| 175 | buds-magic-sauce-50-crazy-dog-5-gram | slut | i lager | **säljbar i NH men slut i Woo** – rätta lagret före launch |
| 184 | nano11-buds-10-pack | i lager | slut | paket: NH-lager 0, Woo räknar paketlager ur delarna |
| 181 | nano11-buds-5-pack | i lager | slut | paket: NH-lager 0, Woo räknar paketlager ur delarna |
| 179 | nano11-buds-3-pack | i lager | slut | paket: NH-lager 0, Woo räknar paketlager ur delarna |
| 176 | high-life-5g-5-pack | i lager | slut | paket: NH-lager 0, Woo räknar paketlager ur delarna |
| 174 | high-life-5g-3-pack | i lager | slut | paket: NH-lager 0, Woo räknar paketlager ur delarna |
| 173 | ms50-5g-10-pack | i lager | slut | paket: NH-lager 0, Woo räknar paketlager ur delarna |
| 170 | ms50-5g-5-pack | i lager | slut | paket: NH-lager 0, Woo räknar paketlager ur delarna |
| 167 | ms50-5g-3-pack | i lager | slut | paket: NH-lager 0, Woo räknar paketlager ur delarna |
| 164 | heros-core-2ml-kollektion | i lager | slut | paket: NH-lager 0, Woo räknar paketlager ur delarna |
| 162 | heros-core-2ml-5-pack | i lager | slut | paket: NH-lager 0, Woo räknar paketlager ur delarna |
| 159 | heros-core-2ml-3-pack | i lager | slut | paket: NH-lager 0, Woo räknar paketlager ur delarna |
| 149 | ms-30-2ml-kollektion | i lager | slut | paket: NH-lager 0, Woo räknar paketlager ur delarna |
| 147 | ms-30-2ml-5-pack | i lager | slut | paket: NH-lager 0, Woo räknar paketlager ur delarna |
| 145 | ms-30-2ml-3-pack | i lager | slut | paket: NH-lager 0, Woo räknar paketlager ur delarna |
| 126 | fraktandring | i lager | slut | tjänst, ingen åtgärd |
