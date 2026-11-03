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
