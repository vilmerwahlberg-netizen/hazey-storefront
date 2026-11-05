# Produktbilder: bildtyp, friläggning och sekundära bilder

TASK 17B · 2026-11-03, uppdaterad TASK 17C 2026-11-05 · genererad av `lists.mjs` ur `runs/media-audit.json`. Klassningen är **samma analys som Theme 8:s bildmanifest** (`theme8/tools/media-manifest.mjs` → `theme8/js/03b-media-manifest.js`; 127 av 127 första-bilder identiska med TASK 17B:s webbläsarklassning) på Nyehandels riktiga bilder (product/state, 140 produkter). Ingen bild är ändrad, frilagd eller genererad.

## Sammanfattning (77 kundlistade)

| Bildtyp (första bilden) | Antal | Behandling |
|---|---:|---|
| transparent | 6 | R2B (frilagt, direkt i scenen) |
| white | 3 | R2A (vit studio, kanten tonas inom marginalen) |
| embedded | 49 | R2A (inbakad bakgrund, kanttonen integreras) |
| environment | 14 | Miljöbild (hel, ingen mask) |
| saknar bild | 5 | Platshållare (ingen bild) |

- **Säker friläggning finns bara för de 6 riktigt frilagda packshotsen** (minst halva kanten genomskinlig i originalet). Ingen friläggning är skapad i Theme 8: en automatisk borttagning av vit eller inbakad bakgrund kan inte uteslutas att den äter av ljusa produktdelar (etikettkanter, stjälkar) eller lämnar halokanter, så fallbacken är originalbilden intakt.
- **Tonzon** = hur mycket av varje kant (topp/höger/botten/vänster, %) som tonas ut. Den ligger alltid utanför produktens uppmätta yta minus 1,2 % säkerhetsavstånd. 0 på en sida = produkten når kanten, ingen ton.
- **Endast en bild:** 48 listade produkter. **Saknar bild:** 5. **Med riktiga sekundära bilder** (fler bilder än strainbilder): 12.

## A. Kräver frilagt original (alla som inte är `transparent`), kundlistade

De här visas i R2A, som miljöbild eller som platshållare. Theme 8 friläggger eller maskerar dem inte. För R2B behövs ett riktigt frilagt original (PNG med alfa, t.ex. en Canva-export) som matchats mot exakt bild med `cutout-match.mjs`. Kolumnen *Canva-kandidat* visar lokala exporter med verifierad alfa och entydig bildmatchning (ännu inte godkända eller använda).

| NH-id | Slug | Format | Serie | Bildtyp | Tonzon % | Bilder | Canva-kandidat |
|---:|---|---|---|---|---|---:|---|
| 178 | ccell-m3-plus-vape-batteri-510 | batteri | – | environment | – | 1 | – |
| 237 | ccell-m3b-vape-batteri-510 | batteri | – | white | t4 r3 b2 l2 | 3 | – |
| 171 | ccell-m4-penna | batteri | – | environment | – | 3 | – |
| 212 | ccell-palm-pro-vape-batteri-510-ganga | batteri | – | white | t0 r0 b0 l1 | 5 | – |
| 250 | ccell-stylo-vape-batteri-510 | batteri | – | environment | – | 3 | – |
| 146 | blommor-magic-sauce-buds-tinky-winki-5-gram | buds | Magic Sauce | embedded | t2 r1 b1 l12 | 1 | – |
| 175 | buds-magic-sauce-50-crazy-dog-5-gram | buds | Magic Sauce | embedded | t2 r3 b2 l12 | 1 | – |
| 197 | buds-nanno-11-critical-berries | buds | Nano-11 | saknar bild | – | 0 | – |
| 136 | cbd-30-long-island-35g | buds | – | embedded | t2 r1 b0 l8 | 1 | – |
| 127 | cbd-buds-10-gram-russian-roulette | buds | – | embedded | t1 r12 b2 l12 | 2 | – |
| 232 | cbd-buds-cookies-hollywood | buds | – | embedded | t3 r0 b0 l9 | 1 | – |
| 161 | cbd-buds-cookies-tequila-sunrise-35-gram | buds | – | embedded | t2 r2 b0 l10 | 1 | – |
| 128 | cbd-buds-triple-scoop-cookies-cannabis | buds | – | embedded | t3 r2 b0 l10 | 1 | – |
| 133 | cbd-cookies-adios-m-f | buds | – | embedded | t2 r1 b0 l8 | 1 | – |
| 138 | cookies-buds-cbd-hawaiian-rain | buds | – | embedded | t2 r2 b0 l8 | 1 | – |
| 130 | cookies-cannabis-buds-cbd-cereal-milk-35-gram | buds | – | embedded | t5 r7 b0 l11 | 2 | – |
| 230 | cookies-cbd-buds-blue-raz | buds | – | embedded | t3 r1 b0 l9 | 1 | – |
| 209 | d10-buds-cosmic-trip-5g | buds | D10 | embedded | t2 r0 b0 l12 | 1 | – |
| 211 | d10-buds-porn-star-og-magic-farmers | buds | D10 | embedded | t2 r1 b0 l12 | 1 | – |
| 214 | d10-buds-skywalker-og-magic-farmers-thcx | buds | D10 | embedded | t2 r1 b0 l12 | 1 | – |
| 223 | d10-buds-white-widow-5g | buds | D10 | embedded | t2 r0 b0 l12 | 1 | – |
| 172 | magic-sauce-buds-donny-burger-5g | buds | Magic Sauce | embedded | t3 r3 b0 l12 | 1 | – |
| 231 | magic-sauce-buds-grape-gasoline | buds | Magic Sauce | embedded | t1 r0 b2 l2 | 1 | – |
| 221 | magic-sauce-buds-kowa-bunga-5g | buds | Magic Sauce | embedded | t2 r0 b0 l12 | 1 | – |
| 198 | magic-sauce-buds-la-chupacabra-5-gram | buds | Magic Sauce | embedded | t2 r0 b0 l11 | 1 | – |
| 226 | magic-sauce-buds-london-lobster-ersatt-thc-a | buds | Magic Sauce | embedded | t3 r0 b1 l12 | 1 | – |
| 134 | magic-sauce-buds-magic-farmers-gorilla-cookies-5-gram | buds | Magic Sauce | embedded | t2 r3 b2 l12 | 1 | – |
| 168 | magic-sauce-buds-magic-farmers-sverige-khalifa-kush-5-gram | buds | Magic Sauce | embedded | t3 r5 b0 l12 | 1 | – |
| 155 | magic-sauce-buds-samurai-jack-magic-farmers-weed | buds | Magic Sauce | embedded | t1 r2 b1 l12 | 1 | – |
| 203 | magic-sauce-buds-thca-ersatt-john-lemon-5g | buds | Magic Sauce | embedded | t4 r1 b0 l11 | 1 | – |
| 201 | magic-sauce-buds-titty-sprinkles-5-gram | buds | Magic Sauce | embedded | t4 r4 b0 l12 | 1 | – |
| 132 | magic-sauce-buds-yoda-ice-cream-5-gram | buds | Magic Sauce | embedded | t2 r1 b1 l12 | 3 | yoda-ice-cream-canva-768.png (godkänd kandidat) |
| 208 | nano-11-buds-orange-zkittlez-5g | buds | Nano-11 | embedded | t6 r1 b0 l11 | 1 | – |
| 194 | nano-11-buds-thca-substitut-royal-og | buds | Nano-11 | embedded | t2 r3 b1 l11 | 1 | – |
| 191 | nano-buds-ersatt-thca-bubba-kush-5g | buds | Nano-11 | saknar bild | – | 0 | – |
| 262 | cart-magic-sauce-magic-farmers-1ml | cart | Magic Sauce | environment | – | 2 | – |
| 253 | cbd-510-cart-cookies-1ml | cart | – | environment | – | 3 | – |
| 227 | cbd-hash-london-pound-cake-100g | hasch | – | embedded | t12 r3 b12 l6 | 1 | – |
| 234 | d10-hash-blue-diamond-5g | hasch | D10 | saknar bild | – | 0 | – |
| 235 | d10-hash-purple-storm-5g | hasch | D10 | embedded | t2 r2 b0 l12 | 1 | – |
| 216 | d10-hash-rosinella-magic-farmers | hasch | D10 | embedded | t2 r0 b0 l12 | 1 | – |
| 218 | d10-hash-silk-road-magic-farmers-thcx | hasch | D10 | embedded | t2 r1 b0 l12 | 1 | – |
| 148 | el-gringo-hash-strawberry-shortcake-5g | hasch | Core | embedded | t1 r1 b0 l12 | 1 | – |
| 137 | high-life-hash-malaga-magic-5g | hasch | Core | embedded | t3 r0 b0 l12 | 1 | – |
| 139 | high-life-hash-northern-lights-5g | hasch | Core | embedded | t2 r2 b0 l12 | 1 | – |
| 228 | magic-sauce-dubai-chocolate-istallet-for-thc-a-hash | hasch | Magic Sauce | embedded | t0 r0 b0 l8 | 1 | – |
| 196 | magic-sauce-hash-charas-5-gram | hasch | Magic Sauce | saknar bild | – | 0 | – |
| 188 | magic-sauce-hash-kitkat-5g | hasch | Magic Sauce | embedded | t3 r12 b0 l12 | 1 | – |
| 200 | nano-hash-zkittlez-mousse-ersatt-thca-hash | hasch | Nano-11 | embedded | t1 r8 b0 l1 | 1 | nano11-buds.png (godkänd kandidat) |
| 217 | cookies-c-bite-buds-tray | merch | – | embedded | t12 r5 b8 l7 | 1 | – |
| 248 | cookies-medium-metal-tray | merch | – | embedded | t7 r2 b12 l1 | 1 | – |
| 219 | cookies-original-beanie | merch | – | embedded | t6 r7 b12 l7 | 1 | – |
| 222 | cookies-original-snapback | merch | – | embedded | t12 r5 b12 l1 | 1 | – |
| 224 | cookies-v2-large-stackables | merch | – | embedded | t12 r2 b10 l0 | 1 | – |
| 165 | 7-nano11-prerolled-1-gram | pre-roll | Nano-11 | embedded | t1 r12 b3 l12 | 1 | nano11-preroll.png (ingen säker matchning) |
| 258 | cbd-prerolled-cookies-1g | pre-roll | – | environment | – | 4 | – |
| 257 | magic-sauce-pre-rolls-1g | pre-roll | Magic Sauce | embedded | t12 r0 b12 l1 | 6 | – |
| 252 | magic-sauce-10ml | refill | Magic Sauce | embedded | t7 r1 b9 l1 | 3 | – |
| 259 | cbd-vape-cbn-vape-magic-farmers | vape | – | environment | – | 3 | – |
| 195 | cbn-vape-canapuff-1ml | vape | – | environment | – | 2 | – |
| 141 | cookies-cbd-vape-adios-mother-f-miami-mint | vape | – | embedded | t1 r8 b5 l7 | 1 | – |
| 144 | cookies-cbd-vape-dual-chamber-triple-scoop-apples-bananas | vape | – | embedded | t1 r7 b5 l7 | 1 | – |
| 215 | cookies-dual-chamber-cbd-vape-cereal-milk-london-pound-cake | vape | – | embedded | t0 r8 b5 l6 | 1 | – |
| 254 | d10-vape-magic-farmers | vape | D10 | environment | – | 4 | – |
| 207 | h4cbd-vape-canntropy-1ml | vape | – | environment | – | 4 | – |
| 182 | h4cbd-vape-cbd-group-2ml | vape | – | white | t12 r12 b2 l12 | 2 | – |
| 260 | magic-sauce-vape-5ml | vape | Magic Sauce | environment | – | 6 | – |
| 255 | thc-x-vape-hero-core-2ml | vape | Core | environment | – | 6 | – |
| 236 | thcba-vape-faraoh-2ml | vape | THCbA | environment | – | 4 | – |
| 220 | thcv-vape-cbd-group-2ml | vape | THCV | saknar bild | – | 0 | – |
| 261 | vape-magic-sauce-magic-farmers-2ml | vape | Magic Sauce | environment | – | 10 | – |

## B. Riktigt frilagda (R2B)

- 229 `cbn-buds-magic-farmers-great-white-shark-1-25-gram` (PUBLIC + LISTED)
- 129 `cbn-buds-malibu-skittelz` (PUBLIC + LISTED)
- 124 `h4cbd-buds-30-kusher-kush-magic-farmers-5-gram` (PUBLIC + LISTED)
- 158 `hash-cbn-yellowstone-5-gram` (PUBLIC + LISTED)
- 125 `hash-h4cbd-20-cbn-20-h-bomb-5-gram` (PUBLIC + LISTED)
- 123 `merch-nyckelring-hazey` (PUBLIC + LISTED)
- 249 `blommor-cbg9-60-snow-ice` (PUBLIC BUT DIRECT-ONLY)
- 152 `magic-sauce-hash-marrakesh-dream-5-gram` (PUBLIC BUT DIRECT-ONLY)
- 185 `isolat-cbd-isolate-15-gram` (PUBLIC BUT DIRECT-ONLY)
- 189 `h4cbd-vape-canapuff-1ml` (PUBLIC BUT DIRECT-ONLY)
- 177 `buds-nano11-snow-white-popcorn-5-gram` (PACKAGE/CHILD PRODUCT)
- 131 `nano-buds-lemon-purple-5-gram` (PACKAGE/CHILD PRODUCT)
- 126 `fraktandring` (HIDDEN/LEGACY)

## C. Saknar riktiga sekundära bilder (bara en bild, eller bara strainbilder), kundlistade

PDP-galleriet visar bara verkliga bilder: har en produkt en bild visas en. Underlag för fotobeställning: baksida/etikett, storleksreferens och miljöbild.

| NH-id | Slug | Bilder | Varav strainbilder |
|---:|---|---:|---:|
| 178 | ccell-m3-plus-vape-batteri-510 | 1 | 1 |
| 237 | ccell-m3b-vape-batteri-510 | 3 | 3 |
| 171 | ccell-m4-penna | 3 | 3 |
| 212 | ccell-palm-pro-vape-batteri-510-ganga | 5 | 5 |
| 250 | ccell-stylo-vape-batteri-510 | 3 | 3 |
| 146 | blommor-magic-sauce-buds-tinky-winki-5-gram | 1 | 1 |
| 175 | buds-magic-sauce-50-crazy-dog-5-gram | 1 | 1 |
| 197 | buds-nanno-11-critical-berries | 0 | 0 |
| 136 | cbd-30-long-island-35g | 1 | 1 |
| 232 | cbd-buds-cookies-hollywood | 1 | 1 |
| 161 | cbd-buds-cookies-tequila-sunrise-35-gram | 1 | 1 |
| 128 | cbd-buds-triple-scoop-cookies-cannabis | 1 | 1 |
| 133 | cbd-cookies-adios-m-f | 1 | 1 |
| 229 | cbn-buds-magic-farmers-great-white-shark-1-25-gram | 1 | 1 |
| 129 | cbn-buds-malibu-skittelz | 1 | 1 |
| 138 | cookies-buds-cbd-hawaiian-rain | 1 | 1 |
| 230 | cookies-cbd-buds-blue-raz | 1 | 1 |
| 209 | d10-buds-cosmic-trip-5g | 1 | 1 |
| 211 | d10-buds-porn-star-og-magic-farmers | 1 | 1 |
| 214 | d10-buds-skywalker-og-magic-farmers-thcx | 1 | 1 |
| 223 | d10-buds-white-widow-5g | 1 | 1 |
| 172 | magic-sauce-buds-donny-burger-5g | 1 | 1 |
| 231 | magic-sauce-buds-grape-gasoline | 1 | 1 |
| 221 | magic-sauce-buds-kowa-bunga-5g | 1 | 1 |
| 198 | magic-sauce-buds-la-chupacabra-5-gram | 1 | 1 |
| 226 | magic-sauce-buds-london-lobster-ersatt-thc-a | 1 | 1 |
| 134 | magic-sauce-buds-magic-farmers-gorilla-cookies-5-gram | 1 | 1 |
| 168 | magic-sauce-buds-magic-farmers-sverige-khalifa-kush-5-gram | 1 | 1 |
| 155 | magic-sauce-buds-samurai-jack-magic-farmers-weed | 1 | 1 |
| 203 | magic-sauce-buds-thca-ersatt-john-lemon-5g | 1 | 1 |
| 201 | magic-sauce-buds-titty-sprinkles-5-gram | 1 | 1 |
| 208 | nano-11-buds-orange-zkittlez-5g | 1 | 1 |
| 194 | nano-11-buds-thca-substitut-royal-og | 1 | 1 |
| 191 | nano-buds-ersatt-thca-bubba-kush-5g | 0 | 0 |
| 262 | cart-magic-sauce-magic-farmers-1ml | 2 | 2 |
| 253 | cbd-510-cart-cookies-1ml | 3 | 3 |
| 227 | cbd-hash-london-pound-cake-100g | 1 | 1 |
| 234 | d10-hash-blue-diamond-5g | 0 | 0 |
| 235 | d10-hash-purple-storm-5g | 1 | 1 |
| 216 | d10-hash-rosinella-magic-farmers | 1 | 1 |
| 218 | d10-hash-silk-road-magic-farmers-thcx | 1 | 1 |
| 148 | el-gringo-hash-strawberry-shortcake-5g | 1 | 1 |
| 158 | hash-cbn-yellowstone-5-gram | 1 | 1 |
| 137 | high-life-hash-malaga-magic-5g | 1 | 1 |
| 139 | high-life-hash-northern-lights-5g | 1 | 1 |
| 228 | magic-sauce-dubai-chocolate-istallet-for-thc-a-hash | 1 | 1 |
| 196 | magic-sauce-hash-charas-5-gram | 0 | 0 |
| 188 | magic-sauce-hash-kitkat-5g | 1 | 1 |
| 200 | nano-hash-zkittlez-mousse-ersatt-thca-hash | 1 | 1 |
| 217 | cookies-c-bite-buds-tray | 1 | 1 |
| 248 | cookies-medium-metal-tray | 1 | 1 |
| 219 | cookies-original-beanie | 1 | 1 |
| 222 | cookies-original-snapback | 1 | 1 |
| 224 | cookies-v2-large-stackables | 1 | 1 |
| 165 | 7-nano11-prerolled-1-gram | 1 | 1 |
| 258 | cbd-prerolled-cookies-1g | 4 | 4 |
| 259 | cbd-vape-cbn-vape-magic-farmers | 3 | 3 |
| 195 | cbn-vape-canapuff-1ml | 2 | 2 |
| 141 | cookies-cbd-vape-adios-mother-f-miami-mint | 1 | 1 |
| 144 | cookies-cbd-vape-dual-chamber-triple-scoop-apples-bananas | 1 | 1 |
| 215 | cookies-dual-chamber-cbd-vape-cereal-milk-london-pound-cake | 1 | 1 |
| 182 | h4cbd-vape-cbd-group-2ml | 2 | 2 |
| 255 | thc-x-vape-hero-core-2ml | 6 | 6 |
| 236 | thcba-vape-faraoh-2ml | 4 | 4 |
| 220 | thcv-vape-cbd-group-2ml | 0 | 0 |

## D. Alla 140 (bildtyp per bild)

| NH-id | Slug | Klass | Bildtyper |
|---:|---|---|---|
| 178 | ccell-m3-plus-vape-batteri-510 | PUBLIC + LISTED | environment |
| 237 | ccell-m3b-vape-batteri-510 | PUBLIC + LISTED | white, transparent, white |
| 171 | ccell-m4-penna | PUBLIC + LISTED | environment, environment, embedded |
| 212 | ccell-palm-pro-vape-batteri-510-ganga | PUBLIC + LISTED | white, white, white, white, white |
| 250 | ccell-stylo-vape-batteri-510 | PUBLIC + LISTED | environment, environment, environment |
| 146 | blommor-magic-sauce-buds-tinky-winki-5-gram | PUBLIC + LISTED | embedded |
| 175 | buds-magic-sauce-50-crazy-dog-5-gram | PUBLIC + LISTED | embedded |
| 197 | buds-nanno-11-critical-berries | PUBLIC + LISTED | – |
| 136 | cbd-30-long-island-35g | PUBLIC + LISTED | embedded |
| 127 | cbd-buds-10-gram-russian-roulette | PUBLIC + LISTED | embedded, embedded |
| 232 | cbd-buds-cookies-hollywood | PUBLIC + LISTED | embedded |
| 161 | cbd-buds-cookies-tequila-sunrise-35-gram | PUBLIC + LISTED | embedded |
| 128 | cbd-buds-triple-scoop-cookies-cannabis | PUBLIC + LISTED | embedded |
| 133 | cbd-cookies-adios-m-f | PUBLIC + LISTED | embedded |
| 229 | cbn-buds-magic-farmers-great-white-shark-1-25-gram | PUBLIC + LISTED | transparent |
| 129 | cbn-buds-malibu-skittelz | PUBLIC + LISTED | transparent |
| 138 | cookies-buds-cbd-hawaiian-rain | PUBLIC + LISTED | embedded |
| 130 | cookies-cannabis-buds-cbd-cereal-milk-35-gram | PUBLIC + LISTED | embedded, embedded |
| 230 | cookies-cbd-buds-blue-raz | PUBLIC + LISTED | embedded |
| 209 | d10-buds-cosmic-trip-5g | PUBLIC + LISTED | embedded |
| 211 | d10-buds-porn-star-og-magic-farmers | PUBLIC + LISTED | embedded |
| 214 | d10-buds-skywalker-og-magic-farmers-thcx | PUBLIC + LISTED | embedded |
| 223 | d10-buds-white-widow-5g | PUBLIC + LISTED | embedded |
| 124 | h4cbd-buds-30-kusher-kush-magic-farmers-5-gram | PUBLIC + LISTED | transparent, transparent |
| 172 | magic-sauce-buds-donny-burger-5g | PUBLIC + LISTED | embedded |
| 231 | magic-sauce-buds-grape-gasoline | PUBLIC + LISTED | embedded |
| 221 | magic-sauce-buds-kowa-bunga-5g | PUBLIC + LISTED | embedded |
| 198 | magic-sauce-buds-la-chupacabra-5-gram | PUBLIC + LISTED | embedded |
| 226 | magic-sauce-buds-london-lobster-ersatt-thc-a | PUBLIC + LISTED | embedded |
| 134 | magic-sauce-buds-magic-farmers-gorilla-cookies-5-gram | PUBLIC + LISTED | embedded |
| 168 | magic-sauce-buds-magic-farmers-sverige-khalifa-kush-5-gram | PUBLIC + LISTED | embedded |
| 155 | magic-sauce-buds-samurai-jack-magic-farmers-weed | PUBLIC + LISTED | embedded |
| 203 | magic-sauce-buds-thca-ersatt-john-lemon-5g | PUBLIC + LISTED | embedded |
| 201 | magic-sauce-buds-titty-sprinkles-5-gram | PUBLIC + LISTED | embedded |
| 132 | magic-sauce-buds-yoda-ice-cream-5-gram | PUBLIC + LISTED | embedded, embedded, embedded |
| 208 | nano-11-buds-orange-zkittlez-5g | PUBLIC + LISTED | embedded |
| 194 | nano-11-buds-thca-substitut-royal-og | PUBLIC + LISTED | embedded |
| 191 | nano-buds-ersatt-thca-bubba-kush-5g | PUBLIC + LISTED | – |
| 262 | cart-magic-sauce-magic-farmers-1ml | PUBLIC + LISTED | environment, environment |
| 253 | cbd-510-cart-cookies-1ml | PUBLIC + LISTED | environment, environment, environment |
| 227 | cbd-hash-london-pound-cake-100g | PUBLIC + LISTED | embedded |
| 234 | d10-hash-blue-diamond-5g | PUBLIC + LISTED | – |
| 235 | d10-hash-purple-storm-5g | PUBLIC + LISTED | embedded |
| 216 | d10-hash-rosinella-magic-farmers | PUBLIC + LISTED | embedded |
| 218 | d10-hash-silk-road-magic-farmers-thcx | PUBLIC + LISTED | embedded |
| 148 | el-gringo-hash-strawberry-shortcake-5g | PUBLIC + LISTED | embedded |
| 158 | hash-cbn-yellowstone-5-gram | PUBLIC + LISTED | transparent |
| 125 | hash-h4cbd-20-cbn-20-h-bomb-5-gram | PUBLIC + LISTED | transparent, transparent |
| 137 | high-life-hash-malaga-magic-5g | PUBLIC + LISTED | embedded |
| 139 | high-life-hash-northern-lights-5g | PUBLIC + LISTED | embedded |
| 228 | magic-sauce-dubai-chocolate-istallet-for-thc-a-hash | PUBLIC + LISTED | embedded |
| 196 | magic-sauce-hash-charas-5-gram | PUBLIC + LISTED | – |
| 188 | magic-sauce-hash-kitkat-5g | PUBLIC + LISTED | embedded |
| 200 | nano-hash-zkittlez-mousse-ersatt-thca-hash | PUBLIC + LISTED | embedded |
| 217 | cookies-c-bite-buds-tray | PUBLIC + LISTED | embedded |
| 248 | cookies-medium-metal-tray | PUBLIC + LISTED | embedded |
| 219 | cookies-original-beanie | PUBLIC + LISTED | embedded |
| 222 | cookies-original-snapback | PUBLIC + LISTED | embedded |
| 224 | cookies-v2-large-stackables | PUBLIC + LISTED | embedded |
| 123 | merch-nyckelring-hazey | PUBLIC + LISTED | transparent, transparent |
| 165 | 7-nano11-prerolled-1-gram | PUBLIC + LISTED | embedded |
| 258 | cbd-prerolled-cookies-1g | PUBLIC + LISTED | environment, environment, environment, environment |
| 257 | magic-sauce-pre-rolls-1g | PUBLIC + LISTED | embedded, environment, environment, environment, environment, environment |
| 252 | magic-sauce-10ml | PUBLIC + LISTED | embedded, environment, environment |
| 259 | cbd-vape-cbn-vape-magic-farmers | PUBLIC + LISTED | environment, environment, environment |
| 195 | cbn-vape-canapuff-1ml | PUBLIC + LISTED | environment, environment |
| 141 | cookies-cbd-vape-adios-mother-f-miami-mint | PUBLIC + LISTED | embedded |
| 144 | cookies-cbd-vape-dual-chamber-triple-scoop-apples-bananas | PUBLIC + LISTED | embedded |
| 215 | cookies-dual-chamber-cbd-vape-cereal-milk-london-pound-cake | PUBLIC + LISTED | embedded |
| 254 | d10-vape-magic-farmers | PUBLIC + LISTED | environment, environment, environment, environment |
| 207 | h4cbd-vape-canntropy-1ml | PUBLIC + LISTED | environment, transparent, environment, environment |
| 182 | h4cbd-vape-cbd-group-2ml | PUBLIC + LISTED | white, white |
| 260 | magic-sauce-vape-5ml | PUBLIC + LISTED | environment, environment, environment, environment, environment, environment |
| 255 | thc-x-vape-hero-core-2ml | PUBLIC + LISTED | environment, environment, environment, environment, environment, environment |
| 236 | thcba-vape-faraoh-2ml | PUBLIC + LISTED | environment, environment, environment, environment |
| 220 | thcv-vape-cbd-group-2ml | PUBLIC + LISTED | – |
| 261 | vape-magic-sauce-magic-farmers-2ml | PUBLIC + LISTED | environment, environment, environment, environment, environment, environment, environment, environment, environment, environment |
| 244 | ccell-fino-vape-batteri-510 | PUBLIC BUT DIRECT-ONLY | white, white |
| 247 | ccell-sandwave-vape-batteri-510 | PUBLIC BUT DIRECT-ONLY | white, transparent |
| 249 | blommor-cbg9-60-snow-ice | PUBLIC BUT DIRECT-ONLY | transparent |
| 204 | high-life-gelato-hero-vapes-core-5g | PUBLIC BUT DIRECT-ONLY | embedded |
| 135 | high-life-white-widow-sativa-buds-5-gram-hero-vapes | PUBLIC BUT DIRECT-ONLY | embedded |
| 256 | thca-b-faraoh-carts-1ml | PUBLIC BUT DIRECT-ONLY | embedded |
| 152 | magic-sauce-hash-marrakesh-dream-5-gram | PUBLIC BUT DIRECT-ONLY | transparent |
| 185 | isolat-cbd-isolate-15-gram | PUBLIC BUT DIRECT-ONLY | transparent |
| 225 | cbd-vape-1ml-46-hazey | PUBLIC BUT DIRECT-ONLY | environment |
| 189 | h4cbd-vape-canapuff-1ml | PUBLIC BUT DIRECT-ONLY | transparent, environment |
| 251 | thc-b-vape-faraoh-1ml | PUBLIC BUT DIRECT-ONLY | embedded, embedded, embedded |
| 242 | thca-b-vape-faraoh-2ml | PUBLIC BUT DIRECT-ONLY | environment |
| 199 | thcv-vape-canapuff-1ml | PUBLIC BUT DIRECT-ONLY | environment, environment |
| 202 | thcv-vape-canntropy-1ml | PUBLIC BUT DIRECT-ONLY | environment, environment, environment |
| 233 | thcv-vape-euphoria-2ml | PUBLIC BUT DIRECT-ONLY | environment, environment |
| 180 | buds-nano11-abacous-5-gram | PACKAGE/CHILD PRODUCT | – |
| 190 | buds-nano11-crystal-snow-5-gram | PACKAGE/CHILD PRODUCT | embedded |
| 177 | buds-nano11-snow-white-popcorn-5-gram | PACKAGE/CHILD PRODUCT | transparent |
| 174 | high-life-5g-3-pack | PACKAGE/CHILD PRODUCT | embedded |
| 176 | high-life-5g-5-pack | PACKAGE/CHILD PRODUCT | embedded |
| 173 | ms50-5g-10-pack | PACKAGE/CHILD PRODUCT | environment |
| 167 | ms50-5g-3-pack | PACKAGE/CHILD PRODUCT | environment |
| 170 | ms50-5g-5-pack | PACKAGE/CHILD PRODUCT | environment |
| 206 | nano-11-buds-lemon-mandarine-5g | PACKAGE/CHILD PRODUCT | embedded |
| 192 | nano-buds-gary-payton-5-gram | PACKAGE/CHILD PRODUCT | – |
| 131 | nano-buds-lemon-purple-5-gram | PACKAGE/CHILD PRODUCT | transparent |
| 187 | nano-buds-raspberry-popcorn-5-gram | PACKAGE/CHILD PRODUCT | – |
| 193 | nano-buds-strawberry-og-5-gram | PACKAGE/CHILD PRODUCT | embedded |
| 184 | nano11-buds-10-pack | PACKAGE/CHILD PRODUCT | embedded |
| 179 | nano11-buds-3-pack | PACKAGE/CHILD PRODUCT | embedded |
| 181 | nano11-buds-5-pack | PACKAGE/CHILD PRODUCT | embedded |
| 210 | nano11-buds-godzilla-5g | PACKAGE/CHILD PRODUCT | embedded |
| 183 | nano11-lemon-sorbet-5-gram | PACKAGE/CHILD PRODUCT | embedded |
| 213 | nano11-naranja-popcorn-buds-5g | PACKAGE/CHILD PRODUCT | embedded |
| 151 | ms-30-1ml-3-pack | PACKAGE/CHILD PRODUCT | environment |
| 153 | ms-30-1ml-5-pack | PACKAGE/CHILD PRODUCT | environment |
| 156 | ms-30-1ml-kollektion | PACKAGE/CHILD PRODUCT | environment |
| 150 | thca-b-50-faraoh-1ml-10-pack | PACKAGE/CHILD PRODUCT | environment |
| 240 | thca-b-50-faraoh-1ml-3-pack | PACKAGE/CHILD PRODUCT | – |
| 241 | thca-b-50-faraoh-1ml-5-pack | PACKAGE/CHILD PRODUCT | environment |
| 205 | startpaket-magic-sauce-batteri | PACKAGE/CHILD PRODUCT | environment |
| 246 | startpaket-thca-b-batteri | PACKAGE/CHILD PRODUCT | environment |
| 157 | magic-sauce-50-pre-rolls-1g-10-pack | PACKAGE/CHILD PRODUCT | embedded |
| 154 | magic-sauce-50-pre-rolls-1g-5-pack | PACKAGE/CHILD PRODUCT | embedded |
| 160 | nano-11-pre-rolls-1g-10-pack | PACKAGE/CHILD PRODUCT | – |
| 163 | nano-11-pre-rolls-1g-5-pack | PACKAGE/CHILD PRODUCT | embedded |
| 186 | ms-30-10ml-kollektion | PACKAGE/CHILD PRODUCT | embedded |
| 243 | d10-2ml-3-pack | PACKAGE/CHILD PRODUCT | environment |
| 245 | d10-2ml-5-pack | PACKAGE/CHILD PRODUCT | – |
| 140 | faraoh-thca-b-3-pack | PACKAGE/CHILD PRODUCT | environment |
| 142 | faraoh-thca-b-5-pack | PACKAGE/CHILD PRODUCT | environment |
| 143 | faraoh-thca-b-hela-kollektionen | PACKAGE/CHILD PRODUCT | environment |
| 159 | heros-core-2ml-3-pack | PACKAGE/CHILD PRODUCT | environment |
| 162 | heros-core-2ml-5-pack | PACKAGE/CHILD PRODUCT | – |
| 164 | heros-core-2ml-kollektion | PACKAGE/CHILD PRODUCT | environment |
| 166 | ms-3-0-5ml-3-pack | PACKAGE/CHILD PRODUCT | environment |
| 169 | ms-3-0-5ml-5-pack | PACKAGE/CHILD PRODUCT | environment |
| 145 | ms-30-2ml-3-pack | PACKAGE/CHILD PRODUCT | environment |
| 147 | ms-30-2ml-5-pack | PACKAGE/CHILD PRODUCT | environment |
| 149 | ms-30-2ml-kollektion | PACKAGE/CHILD PRODUCT | environment |
| 238 | thca-b-50-faraoh-2ml-3-pack | PACKAGE/CHILD PRODUCT | – |
| 239 | thca-b-50-faraoh-2ml-5-pack | PACKAGE/CHILD PRODUCT | environment |
| 126 | fraktandring | HIDDEN/LEGACY | transparent |
