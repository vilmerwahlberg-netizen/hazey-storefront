# Produktbilder efter migreringen – inventering

TASK 17 · 2026-11-03 · källor: WooCommerce-livesidan (Store API alla synlighetslägen, kategorisidornas listningar, produktsidornas HZY_PRODUKT/HZY_PAKET/HZY_EXTRA) och Nyehandel (sitemap, 68 kategorier med alla sidor, produktsidor, product/state). Genererad av `build-docs.mjs` ur JSON-filerna i samma mapp.

**Ingen redesign i den här körningen.** Det här är underlaget för nästa visuella task. Jämförelseblad: `sheets/product-images-393.jpg` och `sheets/product-images-1440.jpg`. De visar PDP:ns första vy per bildklass och kortrutnätet på Alla vapes, Alla buds, Allt hasch och Magic Sauce vapes. Lokal build i Theme 8-previewen, 2026-11-03.

## Sammanfattning (140 produkter, första bilden mätt)

| Fynd | Antal | Kommentar |
|---|---:|---|
| Saknar bild helt | 13 | 5 av dem är **listade**: `d10-hash-blue-diamond-5g`, `buds-nanno-11-critical-berries`, `nano-buds-ersatt-thca-bubba-kush-5g`, `magic-sauce-hash-charas-5-gram`, `thcv-vape-cbd-group-2ml`; resten är paket och strainbarn. Visas som grå platshållare. |
| Lågupplöst (högst 768 px) | 124 | Även WooCommerce-originalen är 768 × 768 (kontrollerat), så ingen förlust i importen. PDP-scenen på 1440 visar bilden i ca 520 px CSS-bredd, alltså över 1 000 px på 2×-skärmar: uppskalning. Behöver 1 600 px-original. |
| Bildformat | 139 kvadratiska, 1 liggande | Den liggande är fraktändringen. Inga stående huvudbilder finns i sortimentet. Kvadrat-mot-stående-jämförelsen kan därför inte göras på huvudbilder. |
| Bakgrund buds/hasch | 51 på enhetlig beige (≈ rgb 224,192,176) | Konsekvent studiomaterial, fyllnad ca 81 %. Det är bäst i sortimentet. |
| Miljöbilder (vapes, carts, batterier) | 26 ojämna, 42 med motiv ut i kanten | Vape- och cart-bilderna är helbildskompositioner (palmer, "Hazey.se"-vattenstämpel, förpackning). Kortens beskärning kapar text och förpackningskant, och skalan skiljer mot buds-korten. Batteribilderna är livsstilsfoton (hand i park) med produkten liten. |
| Vit bakgrund | 3 listade | `h4cbd-vape-cbd-group-2ml`, `ccell-m3b-vape-batteri-510`, `ccell-palm-pro-vape-batteri-510-ganga`. De bryter mot de varma korten (tydligt i rutnätet Alla vapes). |
| Liten produkt i bild | 3 | `merch-nyckelring-hazey` (14 %), `cbd-hash-london-pound-cake-100g` (38 %), `cbd-buds-10-gram-russian-roulette` (45 %). |
| Paketbilder | 36 paket | Egna kompositbilder (3–5 förpackningar), visuellt tätare och mindre per enhet än baskortet. Två paket saknar bild. Ska ändå döljas tills paketen fungerar. |
| Färre bilder än WooCommerce | 5 | Se tabellen. |

## Observationer från jämförelsebladen

1. **Två PDP-utseenden:** produkter *med* varumärke får den universella PDP:n (varm bakgrund, orange CTA, "Kort om produkten"). Produkter *utan* varumärke (bl.a. alla Magic Sauce-vapes, carts, 1+1 ml, batterier) får Nyehandels sida med Theme 8-styling. Orsak: `HZ8.isPdpPilot` kräver en varumärkeslänk, och 71 produkter saknar varumärke efter importen (REPORT.md, launch-blockerare 1).
2. **"CANAPUFF"** står som varumärkesrad på kort och PDP för Magic Sauce, D10, Nano-11 och CBD. Det är fel data, inte en bildfråga, men det syns överallt i bladen.
3. **Vape-kort:** produktens visuella storlek varierar mycket. Magic Sauce 3.0-bilderna är kompositioner med kartong och vape. Cookies-dual och H4CBD är friläggningar. Kortens nedtonade bakgrund gör att friläggningarna (vit platta) sticker ut.
4. **Pre-roll:** MS-pre-rollen har fem varianter, var och en med egen bild. Huvudbilden är en tub mot vattenstämpel. Den visas korrekt både i Alla buds och i Allt hasch.
5. **Text som kapas:** i kortrutnätet (393 och 1440) kapas förpackningens text i Magic Sauce-vapes och paketkompositionerna i kortens nedre kant. På PDP:n är bilderna hela.
6. **`&amp;` i namnet:** *CBD 56% - Triple Scoop + Apples &amp; Bananas - 1+1ml* visar `&amp;` ordagrant i H1 och brödsmulor. Namnet är dubbelkodat i Nyehandel och ska rättas i admin.

## Förslag till nästa visuella task (inte gjort)

- Beställ eller ta fram 1 600 px-originalbilder i två standarder: studio på beige för buds, hasch och pre-rolls, och friläggning på samma beige för vapes, carts och batterier, med samma visuella skala (produkten ca 70 % av höjden).
- Beslut om miljöbilder: behåll dem som bild 2–n i galleriet och använd friläggningen som kort- och huvudbild.
- Ersätt de 5 listade produkterna utan bild före launch.


## Alla produkter (första bilden)

Mätt på Nyehandels original (`image_url`), nedskalad till 400 px för analys. Fyllnad = produktens bounding box som andel av bildytan (bakgrund = hörnens färg). Kant = andel av kanten där motivet går ut i bildkanten.

| NH-id | Slug | Klass | Format | Bilder NH/Woo | Storlek | Bakgrund | Fyllnad | Kant | Flaggor |
|---:|---|---|---|---|---|---|---:|---:|---|
| 178 | ccell-m3-plus-vape-batteri-510 | PUBLIC + LISTED | batteri | 1/1 | 768×768 | ojämn/miljö | 100 % | 187 % | lågupplöst (<800 px); ojämn bakgrund/miljöbild; motiv går ut i kanten (kapas lätt) |
| 237 | ccell-m3b-vape-batteri-510 | PUBLIC + LISTED | batteri | 3/1 | 672×672 | vit | 84 % | 0 % | lågupplöst (<800 px); vit bakgrund |
| 171 | ccell-m4-penna | PUBLIC + LISTED | batteri | 3/1 | 768×768 | ojämn/miljö | 100 % | 173 % | lågupplöst (<800 px); ojämn bakgrund/miljöbild; motiv går ut i kanten (kapas lätt) |
| 212 | ccell-palm-pro-vape-batteri-510-ganga | PUBLIC + LISTED | batteri | 5/5 | 768×768 | vit | 93 % | 0 % | lågupplöst (<800 px); vit bakgrund |
| 250 | ccell-stylo-vape-batteri-510 | PUBLIC + LISTED | batteri | 3/4 | 768×768 | ojämn/miljö | 100 % | 174 % | lågupplöst (<800 px); ojämn bakgrund/miljöbild; motiv går ut i kanten (kapas lätt); färre bilder än WooCommerce (3/4) |
| 146 | blommor-magic-sauce-buds-tinky-winki-5-gram | PUBLIC + LISTED | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 77 % | 0 % | lågupplöst (<800 px) |
| 175 | buds-magic-sauce-50-crazy-dog-5-gram | PUBLIC + LISTED | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 76 % | 0 % | lågupplöst (<800 px) |
| 197 | buds-nanno-11-critical-berries | PUBLIC + LISTED | buds | 0/1 | – | – | – | – | saknar bild |
| 136 | cbd-30-long-island-35g | PUBLIC + LISTED | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 85 % | 0 % | lågupplöst (<800 px) |
| 127 | cbd-buds-10-gram-russian-roulette | PUBLIC + LISTED | buds | 2/1 | 768×768 | enhetlig (219,193,176) | 45 % | 0 % | lågupplöst (<800 px) |
| 232 | cbd-buds-cookies-hollywood | PUBLIC + LISTED | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 84 % | 0 % | lågupplöst (<800 px) |
| 161 | cbd-buds-cookies-tequila-sunrise-35-gram | PUBLIC + LISTED | buds | 1/1 | 768×768 | enhetlig (217,195,173) | 83 % | 0 % | lågupplöst (<800 px) |
| 128 | cbd-buds-triple-scoop-cookies-cannabis | PUBLIC + LISTED | buds | 1/1 | 768×768 | enhetlig (219,193,176) | 82 % | 0 % | lågupplöst (<800 px) |
| 133 | cbd-cookies-adios-m-f | PUBLIC + LISTED | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 85 % | 0 % | lågupplöst (<800 px) |
| 229 | cbn-buds-magic-farmers-great-white-shark-1-25-gram | PUBLIC + LISTED | buds | 1/1 | 576×576 | transparent | 98 % | 60 % | lågupplöst (<800 px); motiv går ut i kanten (kapas lätt) |
| 129 | cbn-buds-malibu-skittelz | PUBLIC + LISTED | buds | 1/1 | 576×576 | transparent | 98 % | 60 % | lågupplöst (<800 px); motiv går ut i kanten (kapas lätt) |
| 138 | cookies-buds-cbd-hawaiian-rain | PUBLIC + LISTED | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 85 % | 0 % | lågupplöst (<800 px) |
| 130 | cookies-cannabis-buds-cbd-cereal-milk-35-gram | PUBLIC + LISTED | buds | 2/1 | 768×768 | enhetlig (217,195,174) | 74 % | 0 % | lågupplöst (<800 px) |
| 230 | cookies-cbd-buds-blue-raz | PUBLIC + LISTED | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 83 % | 0 % | lågupplöst (<800 px) |
| 209 | d10-buds-cosmic-trip-5g | PUBLIC + LISTED | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 82 % | 0 % | lågupplöst (<800 px) |
| 211 | d10-buds-porn-star-og-magic-farmers | PUBLIC + LISTED | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 82 % | 1 % | lågupplöst (<800 px) |
| 214 | d10-buds-skywalker-og-magic-farmers-thcx | PUBLIC + LISTED | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 81 % | 0 % | lågupplöst (<800 px) |
| 223 | d10-buds-white-widow-5g | PUBLIC + LISTED | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 82 % | 0 % | lågupplöst (<800 px) |
| 124 | h4cbd-buds-30-kusher-kush-magic-farmers-5-gram | PUBLIC + LISTED | buds | 2/1 | 576×576 | transparent | 98 % | 60 % | lågupplöst (<800 px); motiv går ut i kanten (kapas lätt) |
| 172 | magic-sauce-buds-donny-burger-5g | PUBLIC + LISTED | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 71 % | 0 % | lågupplöst (<800 px) |
| 231 | magic-sauce-buds-grape-gasoline | PUBLIC + LISTED | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 90 % | 0 % | lågupplöst (<800 px) |
| 221 | magic-sauce-buds-kowa-bunga-5g | PUBLIC + LISTED | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 76 % | 0 % | lågupplöst (<800 px) |
| 198 | magic-sauce-buds-la-chupacabra-5-gram | PUBLIC + LISTED | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 82 % | 0 % | lågupplöst (<800 px) |
| 226 | magic-sauce-buds-london-lobster-ersatt-thc-a | PUBLIC + LISTED | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 81 % | 0 % | lågupplöst (<800 px) |
| 134 | magic-sauce-buds-magic-farmers-gorilla-cookies-5-gram | PUBLIC + LISTED | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 72 % | 0 % | lågupplöst (<800 px) |
| 168 | magic-sauce-buds-magic-farmers-sverige-khalifa-kush-5-gram | PUBLIC + LISTED | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 72 % | 1 % | lågupplöst (<800 px) |
| 155 | magic-sauce-buds-samurai-jack-magic-farmers-weed | PUBLIC + LISTED | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 76 % | 0 % | lågupplöst (<800 px) |
| 203 | magic-sauce-buds-thca-ersatt-john-lemon-5g | PUBLIC + LISTED | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 80 % | 0 % | lågupplöst (<800 px) |
| 201 | magic-sauce-buds-titty-sprinkles-5-gram | PUBLIC + LISTED | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 76 % | 0 % | lågupplöst (<800 px) |
| 132 | magic-sauce-buds-yoda-ice-cream-5-gram | PUBLIC + LISTED | buds | 3/1 | 768×768 | enhetlig (217,195,174) | 74 % | 0 % | lågupplöst (<800 px) |
| 208 | nano-11-buds-orange-zkittlez-5g | PUBLIC + LISTED | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 78 % | 0 % | lågupplöst (<800 px) |
| 194 | nano-11-buds-thca-substitut-royal-og | PUBLIC + LISTED | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 79 % | 0 % | lågupplöst (<800 px) |
| 191 | nano-buds-ersatt-thca-bubba-kush-5g | PUBLIC + LISTED | buds | 0/1 | – | – | – | – | saknar bild |
| 262 | cart-magic-sauce-magic-farmers-1ml | PUBLIC + LISTED | cart | 2/1 | 768×768 | ojämn/miljö | 100 % | 176 % | lågupplöst (<800 px); ojämn bakgrund/miljöbild; motiv går ut i kanten (kapas lätt) |
| 253 | cbd-510-cart-cookies-1ml | PUBLIC + LISTED | cart | 3/1 | 768×768 | ojämn/miljö | 100 % | 173 % | lågupplöst (<800 px); ojämn bakgrund/miljöbild; motiv går ut i kanten (kapas lätt) |
| 227 | cbd-hash-london-pound-cake-100g | PUBLIC + LISTED | hasch | 1/1 | 768×768 | enhetlig (217,194,176) | 38 % | 0 % | lågupplöst (<800 px) |
| 234 | d10-hash-blue-diamond-5g | PUBLIC + LISTED | hasch | 0/1 | – | – | – | – | saknar bild |
| 235 | d10-hash-purple-storm-5g | PUBLIC + LISTED | hasch | 1/1 | 768×768 | enhetlig (217,195,174) | 81 % | 0 % | lågupplöst (<800 px) |
| 216 | d10-hash-rosinella-magic-farmers | PUBLIC + LISTED | hasch | 1/1 | 768×768 | enhetlig (217,195,174) | 82 % | 0 % | lågupplöst (<800 px) |
| 218 | d10-hash-silk-road-magic-farmers-thcx | PUBLIC + LISTED | hasch | 1/1 | 768×768 | enhetlig (217,195,174) | 81 % | 0 % | lågupplöst (<800 px) |
| 148 | el-gringo-hash-strawberry-shortcake-5g | PUBLIC + LISTED | hasch | 1/1 | 768×768 | enhetlig (217,195,174) | 73 % | 1 % | lågupplöst (<800 px) |
| 158 | hash-cbn-yellowstone-5-gram | PUBLIC + LISTED | hasch | 1/1 | 576×576 | transparent | 98 % | 60 % | lågupplöst (<800 px); motiv går ut i kanten (kapas lätt) |
| 125 | hash-h4cbd-20-cbn-20-h-bomb-5-gram | PUBLIC + LISTED | hasch | 2/1 | 576×576 | transparent | 98 % | 60 % | lågupplöst (<800 px); motiv går ut i kanten (kapas lätt) |
| 137 | high-life-hash-malaga-magic-5g | PUBLIC + LISTED | hasch | 1/1 | 768×768 | enhetlig (217,195,174) | 74 % | 0 % | lågupplöst (<800 px) |
| 139 | high-life-hash-northern-lights-5g | PUBLIC + LISTED | hasch | 1/1 | 768×768 | enhetlig (217,195,174) | 74 % | 0 % | lågupplöst (<800 px) |
| 228 | magic-sauce-dubai-chocolate-istallet-for-thc-a-hash | PUBLIC + LISTED | hasch | 1/1 | 768×768 | enhetlig (217,195,174) | 88 % | 0 % | lågupplöst (<800 px) |
| 196 | magic-sauce-hash-charas-5-gram | PUBLIC + LISTED | hasch | 0/1 | – | – | – | – | saknar bild |
| 188 | magic-sauce-hash-kitkat-5g | PUBLIC + LISTED | hasch | 1/1 | 768×768 | enhetlig (217,195,174) | 65 % | 0 % | lågupplöst (<800 px) |
| 200 | nano-hash-zkittlez-mousse-ersatt-thca-hash | PUBLIC + LISTED | hasch | 1/1 | 768×768 | enhetlig (217,195,174) | 85 % | 0 % | lågupplöst (<800 px) |
| 217 | cookies-c-bite-buds-tray | PUBLIC + LISTED | merch | 1/1 | 768×768 | enhetlig (217,195,174) | 62 % | 0 % | lågupplöst (<800 px) |
| 248 | cookies-medium-metal-tray | PUBLIC + LISTED | merch | 1/1 | 768×768 | enhetlig (219,193,176) | 72 % | 0 % | lågupplöst (<800 px) |
| 219 | cookies-original-beanie | PUBLIC + LISTED | merch | 1/1 | 768×768 | enhetlig (217,195,174) | 67 % | 0 % | lågupplöst (<800 px) |
| 222 | cookies-original-snapback | PUBLIC + LISTED | merch | 1/1 | 768×768 | enhetlig (217,195,174) | 59 % | 0 % | lågupplöst (<800 px) |
| 224 | cookies-v2-large-stackables | PUBLIC + LISTED | merch | 1/2 | 768×768 | enhetlig (217,195,174) | 61 % | 0 % | lågupplöst (<800 px); färre bilder än WooCommerce (1/2) |
| 123 | merch-nyckelring-hazey | PUBLIC + LISTED | merch | 2/1 | 576×576 | transparent | 14 % | 0 % | lågupplöst (<800 px); liten produkt i bild (14 % av ytan) |
| 165 | 7-nano11-prerolled-1-gram | PUBLIC + LISTED | pre-roll | 1/1 | 768×768 | enhetlig (217,195,174) | 46 % | 0 % | lågupplöst (<800 px) |
| 258 | cbd-prerolled-cookies-1g | PUBLIC + LISTED | pre-roll | 4/1 | 768×768 | ojämn/miljö | 100 % | 173 % | lågupplöst (<800 px); ojämn bakgrund/miljöbild; motiv går ut i kanten (kapas lätt) |
| 257 | magic-sauce-pre-rolls-1g | PUBLIC + LISTED | pre-roll | 6/1 | 768×768 | enhetlig (217,195,174) | 53 % | 0 % | lågupplöst (<800 px) |
| 252 | magic-sauce-10ml | PUBLIC + LISTED | refill | 3/1 | 768×768 | enhetlig (217,195,174) | 78 % | 0 % | lågupplöst (<800 px) |
| 259 | cbd-vape-cbn-vape-magic-farmers | PUBLIC + LISTED | vape | 3/1 | 576×576 | ojämn/miljö | 100 % | 175 % | lågupplöst (<800 px); ojämn bakgrund/miljöbild; motiv går ut i kanten (kapas lätt) |
| 195 | cbn-vape-canapuff-1ml | PUBLIC + LISTED | vape | 2/1 | 768×768 | ojämn/miljö | 100 % | 114 % | lågupplöst (<800 px); ojämn bakgrund/miljöbild; motiv går ut i kanten (kapas lätt) |
| 141 | cookies-cbd-vape-adios-mother-f-miami-mint | PUBLIC + LISTED | vape | 1/1 | 768×768 | enhetlig (217,195,173) | 77 % | 0 % | lågupplöst (<800 px) |
| 144 | cookies-cbd-vape-dual-chamber-triple-scoop-apples-bananas | PUBLIC + LISTED | vape | 1/1 | 768×768 | enhetlig (217,195,173) | 76 % | 0 % | lågupplöst (<800 px) |
| 215 | cookies-dual-chamber-cbd-vape-cereal-milk-london-pound-cake | PUBLIC + LISTED | vape | 1/1 | 768×768 | enhetlig (217,195,173) | 77 % | 0 % | lågupplöst (<800 px) |
| 254 | d10-vape-magic-farmers | PUBLIC + LISTED | vape | 4/1 | 768×768 | ojämn/miljö | 100 % | 174 % | lågupplöst (<800 px); ojämn bakgrund/miljöbild; motiv går ut i kanten (kapas lätt) |
| 207 | h4cbd-vape-canntropy-1ml | PUBLIC + LISTED | vape | 4/1 | 768×768 | ojämn/miljö | 100 % | 118 % | lågupplöst (<800 px); ojämn bakgrund/miljöbild; motiv går ut i kanten (kapas lätt) |
| 182 | h4cbd-vape-cbd-group-2ml | PUBLIC + LISTED | vape | 2/1 | 768×768 | vit | 47 % | 0 % | lågupplöst (<800 px); vit bakgrund |
| 260 | magic-sauce-vape-5ml | PUBLIC + LISTED | vape | 6/1 | 768×768 | ojämn/miljö | 100 % | 175 % | lågupplöst (<800 px); ojämn bakgrund/miljöbild; motiv går ut i kanten (kapas lätt) |
| 255 | thc-x-vape-hero-core-2ml | PUBLIC + LISTED | vape | 6/1 | 768×768 | ojämn/miljö | 100 % | 173 % | lågupplöst (<800 px); ojämn bakgrund/miljöbild; motiv går ut i kanten (kapas lätt) |
| 236 | thcba-vape-faraoh-2ml | PUBLIC + LISTED | vape | 4/1 | 768×768 | ojämn/miljö | 100 % | 173 % | lågupplöst (<800 px); ojämn bakgrund/miljöbild; motiv går ut i kanten (kapas lätt) |
| 220 | thcv-vape-cbd-group-2ml | PUBLIC + LISTED | vape | 0/1 | – | – | – | – | saknar bild |
| 261 | vape-magic-sauce-magic-farmers-2ml | PUBLIC + LISTED | vape | 10/1 | 768×768 | enhetlig (217,195,174) | 95 % | 19 % | lågupplöst (<800 px) |
| 244 | ccell-fino-vape-batteri-510 | PUBLIC BUT DIRECT-ONLY | batteri | 2/3 | 768×768 | vit | 90 % | 0 % | lågupplöst (<800 px); vit bakgrund; färre bilder än WooCommerce (2/3) |
| 247 | ccell-sandwave-vape-batteri-510 | PUBLIC BUT DIRECT-ONLY | batteri | 2/3 | 768×768 | vit | 65 % | 0 % | lågupplöst (<800 px); vit bakgrund; färre bilder än WooCommerce (2/3) |
| 249 | blommor-cbg9-60-snow-ice | PUBLIC BUT DIRECT-ONLY | buds | 1/1 | 576×576 | transparent | 98 % | 60 % | lågupplöst (<800 px); motiv går ut i kanten (kapas lätt) |
| 204 | high-life-gelato-hero-vapes-core-5g | PUBLIC BUT DIRECT-ONLY | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 77 % | 3 % | lågupplöst (<800 px) |
| 135 | high-life-white-widow-sativa-buds-5-gram-hero-vapes | PUBLIC BUT DIRECT-ONLY | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 77 % | 0 % | lågupplöst (<800 px) |
| 256 | thca-b-faraoh-carts-1ml | PUBLIC BUT DIRECT-ONLY | cart | 1/1 | 768×768 | enhetlig (217,195,174) | 90 % | 0 % | lågupplöst (<800 px) |
| 152 | magic-sauce-hash-marrakesh-dream-5-gram | PUBLIC BUT DIRECT-ONLY | hasch | 1/1 | 576×576 | transparent | 99 % | 60 % | lågupplöst (<800 px); motiv går ut i kanten (kapas lätt) |
| 185 | isolat-cbd-isolate-15-gram | PUBLIC BUT DIRECT-ONLY | isolat | 1/1 | 576×576 | transparent | 99 % | 60 % | lågupplöst (<800 px); motiv går ut i kanten (kapas lätt) |
| 225 | cbd-vape-1ml-46-hazey | PUBLIC BUT DIRECT-ONLY | vape | 1/4 | 864×864 | ojämn/miljö | 100 % | 116 % | ojämn bakgrund/miljöbild; motiv går ut i kanten (kapas lätt); färre bilder än WooCommerce (1/4) |
| 189 | h4cbd-vape-canapuff-1ml | PUBLIC BUT DIRECT-ONLY | vape | 2/1 | 576×576 | transparent | 92 % | 60 % | lågupplöst (<800 px); motiv går ut i kanten (kapas lätt) |
| 251 | thc-b-vape-faraoh-1ml | PUBLIC BUT DIRECT-ONLY | vape | 3/1 | 2048×2048 | enhetlig (227,227,230) | 17 % | 0 % | liten produkt i bild (17 % av ytan) |
| 242 | thca-b-vape-faraoh-2ml | PUBLIC BUT DIRECT-ONLY | vape | 1/1 | 768×768 | ojämn/miljö | 100 % | 173 % | lågupplöst (<800 px); ojämn bakgrund/miljöbild; motiv går ut i kanten (kapas lätt) |
| 199 | thcv-vape-canapuff-1ml | PUBLIC BUT DIRECT-ONLY | vape | 2/1 | 768×768 | ojämn/miljö | 100 % | 114 % | lågupplöst (<800 px); ojämn bakgrund/miljöbild; motiv går ut i kanten (kapas lätt) |
| 202 | thcv-vape-canntropy-1ml | PUBLIC BUT DIRECT-ONLY | vape | 3/1 | 768×768 | ojämn/miljö | 100 % | 173 % | lågupplöst (<800 px); ojämn bakgrund/miljöbild; motiv går ut i kanten (kapas lätt) |
| 233 | thcv-vape-euphoria-2ml | PUBLIC BUT DIRECT-ONLY | vape | 2/1 | 768×768 | ojämn/miljö | 100 % | 117 % | lågupplöst (<800 px); ojämn bakgrund/miljöbild; motiv går ut i kanten (kapas lätt) |
| 180 | buds-nano11-abacous-5-gram | PACKAGE/CHILD PRODUCT | buds | 0/1 | – | – | – | – | saknar bild |
| 190 | buds-nano11-crystal-snow-5-gram | PACKAGE/CHILD PRODUCT | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 86 % | 0 % | lågupplöst (<800 px) |
| 177 | buds-nano11-snow-white-popcorn-5-gram | PACKAGE/CHILD PRODUCT | buds | 1/1 | 576×576 | transparent | 100 % | 60 % | lågupplöst (<800 px); motiv går ut i kanten (kapas lätt) |
| 174 | high-life-5g-3-pack | PACKAGE/CHILD PRODUCT | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 77 % | 3 % | lågupplöst (<800 px) |
| 176 | high-life-5g-5-pack | PACKAGE/CHILD PRODUCT | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 77 % | 3 % | lågupplöst (<800 px) |
| 173 | ms50-5g-10-pack | PACKAGE/CHILD PRODUCT | buds | 1/1 | 768×768 | ojämn/miljö | 100 % | 71 % | lågupplöst (<800 px); ojämn bakgrund/miljöbild; motiv går ut i kanten (kapas lätt) |
| 167 | ms50-5g-3-pack | PACKAGE/CHILD PRODUCT | buds | 1/1 | 768×768 | enhetlig (197,171,152) | 100 % | 48 % | lågupplöst (<800 px); motiv går ut i kanten (kapas lätt) |
| 170 | ms50-5g-5-pack | PACKAGE/CHILD PRODUCT | buds | 1/1 | 768×768 | ojämn/miljö | 100 % | 67 % | lågupplöst (<800 px); ojämn bakgrund/miljöbild; motiv går ut i kanten (kapas lätt) |
| 206 | nano-11-buds-lemon-mandarine-5g | PACKAGE/CHILD PRODUCT | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 77 % | 0 % | lågupplöst (<800 px) |
| 192 | nano-buds-gary-payton-5-gram | PACKAGE/CHILD PRODUCT | buds | 0/1 | – | – | – | – | saknar bild |
| 131 | nano-buds-lemon-purple-5-gram | PACKAGE/CHILD PRODUCT | buds | 1/1 | 576×576 | transparent | 99 % | 60 % | lågupplöst (<800 px); motiv går ut i kanten (kapas lätt) |
| 187 | nano-buds-raspberry-popcorn-5-gram | PACKAGE/CHILD PRODUCT | buds | 0/1 | – | – | – | – | saknar bild |
| 193 | nano-buds-strawberry-og-5-gram | PACKAGE/CHILD PRODUCT | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 73 % | 0 % | lågupplöst (<800 px) |
| 184 | nano11-buds-10-pack | PACKAGE/CHILD PRODUCT | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 81 % | 0 % | lågupplöst (<800 px) |
| 179 | nano11-buds-3-pack | PACKAGE/CHILD PRODUCT | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 81 % | 0 % | lågupplöst (<800 px) |
| 181 | nano11-buds-5-pack | PACKAGE/CHILD PRODUCT | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 81 % | 0 % | lågupplöst (<800 px) |
| 210 | nano11-buds-godzilla-5g | PACKAGE/CHILD PRODUCT | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 72 % | 0 % | lågupplöst (<800 px) |
| 183 | nano11-lemon-sorbet-5-gram | PACKAGE/CHILD PRODUCT | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 82 % | 0 % | lågupplöst (<800 px) |
| 213 | nano11-naranja-popcorn-buds-5g | PACKAGE/CHILD PRODUCT | buds | 1/1 | 768×768 | enhetlig (217,195,174) | 81 % | 0 % | lågupplöst (<800 px) |
| 151 | ms-30-1ml-3-pack | PACKAGE/CHILD PRODUCT | cart | 1/1 | 768×768 | enhetlig (217,195,174) | 93 % | 0 % | lågupplöst (<800 px) |
| 153 | ms-30-1ml-5-pack | PACKAGE/CHILD PRODUCT | cart | 1/1 | 768×768 | enhetlig (217,195,174) | 93 % | 0 % | lågupplöst (<800 px) |
| 156 | ms-30-1ml-kollektion | PACKAGE/CHILD PRODUCT | cart | 1/1 | 768×768 | enhetlig (217,195,174) | 93 % | 0 % | lågupplöst (<800 px) |
| 150 | thca-b-50-faraoh-1ml-10-pack | PACKAGE/CHILD PRODUCT | cart | 1/1 | 768×768 | enhetlig (217,195,174) | 73 % | 0 % | lågupplöst (<800 px) |
| 240 | thca-b-50-faraoh-1ml-3-pack | PACKAGE/CHILD PRODUCT | cart | 0/1 | – | – | – | – | saknar bild |
| 241 | thca-b-50-faraoh-1ml-5-pack | PACKAGE/CHILD PRODUCT | cart | 1/1 | 768×768 | enhetlig (217,195,174) | 95 % | 0 % | lågupplöst (<800 px) |
| 205 | startpaket-magic-sauce-batteri | PACKAGE/CHILD PRODUCT | kit | 1/1 | 768×768 | enhetlig (217,195,174) | 95 % | 0 % | lågupplöst (<800 px) |
| 246 | startpaket-thca-b-batteri | PACKAGE/CHILD PRODUCT | kit | 1/1 | 768×768 | enhetlig (217,195,174) | 91 % | 0 % | lågupplöst (<800 px) |
| 157 | magic-sauce-50-pre-rolls-1g-10-pack | PACKAGE/CHILD PRODUCT | pre-roll | 1/1 | 768×768 | enhetlig (217,195,174) | 53 % | 0 % | lågupplöst (<800 px) |
| 154 | magic-sauce-50-pre-rolls-1g-5-pack | PACKAGE/CHILD PRODUCT | pre-roll | 1/1 | 768×768 | enhetlig (217,195,174) | 53 % | 0 % | lågupplöst (<800 px) |
| 160 | nano-11-pre-rolls-1g-10-pack | PACKAGE/CHILD PRODUCT | pre-roll | 0/1 | – | – | – | – | saknar bild |
| 163 | nano-11-pre-rolls-1g-5-pack | PACKAGE/CHILD PRODUCT | pre-roll | 1/1 | 768×768 | enhetlig (217,195,174) | 46 % | 0 % | lågupplöst (<800 px) |
| 186 | ms-30-10ml-kollektion | PACKAGE/CHILD PRODUCT | refill | 1/1 | 768×768 | enhetlig (217,195,174) | 78 % | 0 % | lågupplöst (<800 px) |
| 243 | d10-2ml-3-pack | PACKAGE/CHILD PRODUCT | vape | 1/1 | 768×768 | enhetlig (217,195,174) | 97 % | 0 % | lågupplöst (<800 px) |
| 245 | d10-2ml-5-pack | PACKAGE/CHILD PRODUCT | vape | 0/1 | – | – | – | – | saknar bild |
| 140 | faraoh-thca-b-3-pack | PACKAGE/CHILD PRODUCT | vape | 1/1 | 768×768 | enhetlig (197,171,152) | 100 % | 46 % | lågupplöst (<800 px); motiv går ut i kanten (kapas lätt) |
| 142 | faraoh-thca-b-5-pack | PACKAGE/CHILD PRODUCT | vape | 1/1 | 768×768 | ojämn/miljö | 100 % | 67 % | lågupplöst (<800 px); ojämn bakgrund/miljöbild; motiv går ut i kanten (kapas lätt) |
| 143 | faraoh-thca-b-hela-kollektionen | PACKAGE/CHILD PRODUCT | vape | 1/1 | 768×768 | ojämn/miljö | 100 % | 71 % | lågupplöst (<800 px); ojämn bakgrund/miljöbild; motiv går ut i kanten (kapas lätt) |
| 159 | heros-core-2ml-3-pack | PACKAGE/CHILD PRODUCT | vape | 1/1 | 768×768 | enhetlig (197,171,152) | 100 % | 34 % | lågupplöst (<800 px); motiv går ut i kanten (kapas lätt) |
| 162 | heros-core-2ml-5-pack | PACKAGE/CHILD PRODUCT | vape | 0/1 | – | – | – | – | saknar bild |
| 164 | heros-core-2ml-kollektion | PACKAGE/CHILD PRODUCT | vape | 1/1 | 768×768 | ojämn/miljö | 100 % | 87 % | lågupplöst (<800 px); ojämn bakgrund/miljöbild; motiv går ut i kanten (kapas lätt) |
| 166 | ms-3-0-5ml-3-pack | PACKAGE/CHILD PRODUCT | vape | 1/1 | 768×768 | enhetlig (197,171,152) | 100 % | 47 % | lågupplöst (<800 px); motiv går ut i kanten (kapas lätt) |
| 169 | ms-3-0-5ml-5-pack | PACKAGE/CHILD PRODUCT | vape | 1/1 | 768×768 | ojämn/miljö | 100 % | 67 % | lågupplöst (<800 px); ojämn bakgrund/miljöbild; motiv går ut i kanten (kapas lätt) |
| 145 | ms-30-2ml-3-pack | PACKAGE/CHILD PRODUCT | vape | 1/1 | 768×768 | enhetlig (197,171,152) | 100 % | 41 % | lågupplöst (<800 px); motiv går ut i kanten (kapas lätt) |
| 147 | ms-30-2ml-5-pack | PACKAGE/CHILD PRODUCT | vape | 1/1 | 768×768 | ojämn/miljö | 100 % | 68 % | lågupplöst (<800 px); ojämn bakgrund/miljöbild; motiv går ut i kanten (kapas lätt) |
| 149 | ms-30-2ml-kollektion | PACKAGE/CHILD PRODUCT | vape | 1/1 | 768×768 | ojämn/miljö | 100 % | 70 % | lågupplöst (<800 px); ojämn bakgrund/miljöbild; motiv går ut i kanten (kapas lätt) |
| 238 | thca-b-50-faraoh-2ml-3-pack | PACKAGE/CHILD PRODUCT | vape | 0/1 | – | – | – | – | saknar bild |
| 239 | thca-b-50-faraoh-2ml-5-pack | PACKAGE/CHILD PRODUCT | vape | 1/1 | 768×768 | enhetlig (217,195,174) | 95 % | 0 % | lågupplöst (<800 px) |
| 126 | fraktandring | HIDDEN/LEGACY | tjänst | 1/1 | 800×512 | transparent | – | 0 % | liggande bild (1.563) |
