# Adminåtgärder: kategorier, attribut och routes i Nyehandel

TASK 17 · 2026-11-03. **Ingenting här är utfört.** Varje punkt kräver ett nytt godkännande och görs i admin, inte i Theme 8. Underlag: `runs/nh.json` (68 kategorier, alla sidor), `runs/nh-facets.json`, `runs/old-slug-redirects.txt`, `CURRENT-CATALOG-MATRIX.json`.

## 1. Läget efter importen

- Importen skapade nya kategorier som speglar WooCommerce (`ms-vapes`, `ms-buds`, `ms-hash`, `ms-carts`, `thca-b`, `thcab-vapes`, `thcba`, `thcba-vapes`, `d10-1`, `d10-vapes`, `d10-buds`, `d10-hash`, `core-vapes`, `high-life-buds`, `high-life-hash`, `cbd`, `cbd-buds-1`, `cbd-vapes`, `cookies-1`, `nano11-hash`, `thcx`, `thcx-hash`, `bundles`, `alla-liquids`). **Medlemskapen stämmer:** ingen produkt som WooCommerce listar i en kategori saknas i motsvarande Nyehandel-kategori.
- Överskottet i Nyehandel består exakt av det som WooCommerce *inte* listar: 36 paket, 11 strainbarn, 15 sökbara/olistade och fraktändringen. Se NYEHANDEL-VISIBILITY-ACTIONS.md.
- 19 gamla kategorier från tiden före migreringen finns kvar men är **tomma** (status 200, 0 produkter). Nyehandels egen meny länkar fortfarande till flera av dem.
- **Filterpanelen har bara "Lagerstatus".** Attributen Serie, Varumärke och Volym finns inte längre, så alla `?filters=Serie_…`/`Varumärke_…`-URL:er ger 0 produkter.
- **Varumärke:** 69 produkter har JSON-LD-varumärket "Canapuff" (även Magic Sauce, D10, Nano-11, Cookies m.fl.). Övriga 71 saknar varumärke, och produktkorten visar tomt. WooCommerce har inga varumärken satta.

## 2. Kategorier att skapa

| Kategori | Innehåll (ur produktdatan) | Varför |
|---|---|---|
| **Pre-rolls** (förslag: `pre-rolls`) | `magic-sauce-pre-rolls-1g` (257), `7-nano11-prerolled-1-gram` (165), `cbd-prerolled-cookies-1g` (258) | Eget format enligt uppdraget; ingen kategori finns i Woo eller NH. Headerns "Pre-rolls" är inaktiv tills den finns. Behåll också nuvarande Buds-/Hasch-medlemskap: MS-pre-rollen har varianter med både "(Buds)" och "Go Fast (Hash)"; Nano11 och CBD → Buds. |
| *(valfri)* **Nano11 hasch**-länk | `nano11-hash` finns redan (1 produkt) | Ingen ny kategori behövs; headern länkar den inte i dag (Nano11 utelämnas under Hasch enligt tidigare uppdrag). Ägarbeslut. |

## 3. Kategorier att ändra

| Kategori | Åtgärd |
|---|---|
| `thcba` / `thcba-vapes` | Ta bort *THCA-B 50% Faraoh 1ml – 3-pack* (240), *– 5-pack* (241), *THCA-B 50% Faraoh 2ml – 3-pack* (238) och *– 5-pack* (239): namnet och de ingående produkterna är THCA-B (THCaB), inte THCbA. Felet finns redan i WooCommerce-kategorierna. |
| `thca-b` / `thcab-vapes` | Lägg till samma fyra paket om de ska visas under THCaB när paketen är ombyggda (de är dolda tills dess). |
| `magic-sauce` / `ms-vapes` | Ta bort *D10 2ml – 3-pack* (243) och *– 5-pack* (245) → in i `d10-1`/`d10-vapes` (namnet och delen = D10; WooCommerce har dem under Magic Sauce). |
| `alla-vapes` | 1 ml-paketen 240/241 är carts (delen är *THCA-B 50% – Faraoh – 1ml*, en cart) → `alla-cartridges`. |
| `cookies-1`, `d10-1`, `cbd-buds-1`, `core-1` | Suffixen beror på att den äldre sluggen är upptagen: `d10` och `cookies` svarar 404, `cbd-buds` och `core` finns och är tomma. Rekommendation: ta bort eller inaktivera de tomma gamla och ge de importerade de rena slugarna (`d10`, `cookies`, `cbd-buds`). Theme 8 uppdateras i samma ändring (en rad per route i 05-header.js/06-catalog-map.js). |
| `hero-vapes` (H1 "Hero Vapes") | Det här är Core-familjens hubb (Core-vape, High Life, El Gringo). Ägarbeslut om kategorin ska döpas om till "Core" så att H1 och brödsmulor matchar Theme 8:s serienamn. |
| Alla med varumärke | Rätta Varumärke: ta bort det felaktiga "Canapuff" på de 69 produkterna och sätt den riktiga tillverkaren (Magic Farmers, Faraoh, Tatra Hemp, Cookies, CCELL …) – underlaget finns i WooCommerce-kategorierna `magic-farmers`, `faraoh`, `tatra-hemp`, `cookies`, `cbd-group`. Syskonserien i Magic Sauce-hubben (D10) och tillverkarlänkar kräver detta. |

## 4. Tomma gamla kategorier (före migreringen) – ta bort, dölj eller omdirigera

`m-s-vapes`, `m-s-buds`, `thca`, `thca-vapes`, `thca-blommor`, `thca-hash`, `thca-carts`, `thcb-carts`, `thcv-carts`, `core`, `10-oh-thc`, `10-oh-thc-vapes`, `hhcpm`, `hhcpm-vapes`, `hhcpm-blommor`, `thcnm`, `thcnm-blommor`, `thcnm-hash`, `cbd-buds`.

Föreslagna 301-omdirigeringar (för SEO och gamla länkar): `m-s-vapes → ms-vapes`, `m-s-buds → ms-buds`, `thca → thca-b`, `thca-vapes → thcab-vapes`, `thca-carts → thcab-vapes`, `core → hero-vapes`, `10-oh-thc*` → ingen (10-OH-THC är pausad och är inte D10), `cbd-buds → cbd-buds-1`. HHCPM/THCNM/THCV-carts: dölj (legacy). **Rör inte** `thcb`/`thcb-vapes`: där ligger THCB-produkten (legacy, sökbar i Woo).

Nyehandels **egen meny** (native header) länkar fortfarande till flera tomma kategorier (`10-oh-thc`, `m-s-vapes`, `thca-*`, `hhcpm-*`, `thcnm-*` …). Theme 8 ersätter menyn, men den native menyn och sidfotslänkarna i admin bör uppdateras eller tas bort.

## 5. Gamla produkt-URL:er

Alla gamla produkt-slugs (t.ex. `vape-magic-sauce-99-2ml`) svarar **301 till tomma, olänkade kategorier** `vapes-ny`, `buds-ny` och `hash-ny` (`runs/old-slug-redirects.txt`). Rekommendation: peka om de 38 säkert mappade gamla produkterna direkt till sin nya produktsida (tabellen i STALE-ID-MAP.md, status MAPPAD), och övriga till närmaste listade kategori. Ta bort eller fyll `vapes-ny`/`buds-ny`/`hash-ny`.

## 6. Attribut

| Attribut | Behov | Åtgärd |
|---|---|---|
| Serie | Theme 8 behöver det inte längre (alla serier har kategorier) | Ingen, om kategorierna ovan rättas. |
| Varumärke | Syskonserie, tillverkarlänkar, JSON-LD | Rätta (punkt 3). |
| Volym | Theme 8 läser volym ur namnet (1+1 ml = 2 ml) | Ingen. Ett riktigt attribut vore robustare: 1 ml / 2 ml / 5 ml / 10 ml, där dual räknas som totalvolym. |

## 7. Övrigt i admin som påverkar kategorisidorna

- **Bästsäljare-sidan** (`/sv/page/vara-bastsaljare`): blockets aktiva flik är "Alla" = `alla-produkter`, som listar alla 140, även paket och dolda (Theme 8:s Bästsäljare, startsidans rad och Butik läser samma källa). Flikarna behöver rättas: "THC-A" → `thca` (tom) ska bli `thca-b`; "THC-B" → `thcb` (den äldre THCB-serien) ska bli `thcba`; "CBD" → `cbd-group` (en varumärkessida med 2 produkter) ska bli `cbd`. Ett produktblock pekar dessutom på `thcnm` (tom, pausad) och ska tas bort. Dessutom: efter importen har ingen produkt säljhistorik, så sorteringen "Mest populära" är inte belagd.
- **Seriesidorna** `/sv/page/thcab`, `/sv/page/thcba`, `/sv/page/nano11` svarar 404 (länkas från startsidans seriesektion, 45-series-education.js). `/sv/page/magic-sauce` är en 301 till kategorin.
- **Analys-PDF:er:** 105 PDF-länkar i produkttexterna pekar på `www.hazey.se/wp-content/uploads/…`. Ladda upp dem i Nyehandel och byt länkarna innan WooCommerce stängs. 10 produkter länkar analys för fel strain (ärvt från Woo, se REPORT.md).
- **Omdömen:** 0 produktomdömen efter importen (Woo har omdömen). Importera dem, eller fatta ett beslut om att avstå.
