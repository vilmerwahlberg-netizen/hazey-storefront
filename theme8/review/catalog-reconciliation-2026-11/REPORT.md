# TASK 17 – katalogavstämning efter migreringen (Theme 8)

- Datum: 2026-11-03. Worktree `../hazey-storefront-task17`, branch `audit/task-17-catalog-reconciliation`, utgår från **origin/dev = 5ad3944** (oförändrad sedan Task 15). Huvudrepots smutsiga dev-checkout är inte rörd.
- **Ingen push, ingen publicering, inga adminändringar** (Nyehandel eller WooCommerce), inga produktdata, ingen loader och inget produktionstema. WooCommerce lästes bara med GET (concurrency 1, 2,5 s + jitter, cache). Nyehandel lästes med GET och sin egen läsande `product/state`. Varukorgstestet använde en preview-session, och ingen order lades.
- Reproducera: `node woo.mjs && node nh.mjs && node facets.mjs && node analyze.mjs && node stale-ids.mjs && node docs-verify.mjs && node registry.mjs && node routes.mjs && node image-audit.mjs && node build-docs.mjs`. Verifiering: `node verify.mjs after all`, `XD_BASE=<build av 5ad3944> node verify.mjs before routes|pdp`, `node cart.mjs`, `node sheets.mjs`.

## Leverabler

| Fil | Innehåll |
|---|---|
| `CURRENT-CATALOG-MATRIX.md/.json` | Alla 140 produkter: Woo ↔ NH (id, slug, URL), synlighetsklass, kategorier, pris, rea, lager per variant, typ, serie/cannabinoid/format, volym, bilder, avvikelse → åtgärd |
| `SERIES-FORMAT-MATRIX.md/.json` | Serie × format med antal, volymer, Woo/NH-kategori, Theme 8-route, luckor och särskilt kontrollerade delar |
| `ROUTE-RECONCILIATION.md` | Alla Nyehandel-kategorier ↔ header, relationskarta, hubbar, combos, PDP, minicart, före/efter |
| `STALE-ID-MAP.md` | Alla 121 gamla produkt-id → nya, register i koden, kvarvarande tomma routes |
| `NYEHANDEL-VISIBILITY-ACTIONS.md` | Exakt lista: dölj (A–D), granska (E), visa (F), plus lageravvikelser |
| `ADMIN-CATEGORY-ACTIONS.md` | Kategorier att skapa och ändra, tomma gamla kategorier, redirects, attribut, bästsäljarblocket, PDF:er, omdömen |
| `OWNER-DECISIONS.md` | 19 punkter med rekommendation |
| `PACKAGE-MIGRATION-PLAN.md` + `PACKAGE-REGISTRY.json` | Alla 36 paket, 134 steg, modeller, priser (Woo-facit), tillåtna produkter, vad som krävs; maskinläsbart register |
| `PRODUCT-IMAGE-AUDIT.md` + `sheets/product-images-{393,1440}.jpg` | Mätt bildinventering och jämförelseblad |

## 1. Vad som har importerats korrekt

- **Sortimentet:** 140 produkter i WooCommerce (alla synlighetslägen) = 140 i Nyehandel. Alla matchar på slug, och variant-SKU:n `HZY-WC-<Woo-id>` (paket: `HZ-…-3PK`) bekräftar identiteten. 0 saknas och 0 är extra.
- **Priser:** alla 140 stämmer. Nyehandels `product/state` anger pris exkl. moms; ×1,25 = JSON-LD = WooCommerce. Alla 16 reaprodukter (D10 buds/hasch, High Life, El Gringo, startpaket, MS 10 ml-kollektion, High Life-paket) har samma jämförelsepris i Nyehandel.
- **Kategorimedlemskap:** importen skapade kategorier som speglar WooCommerce (`ms-*`, `thca-b`, `thcab-vapes`, `thcba(-vapes)`, `d10-1/-vapes/-buds/-hash`, `core-vapes`, `high-life-*`, `cbd`, `cbd-buds-1`, `cbd-vapes`, `alla-liquids` …). **Ingen produkt som Woo listar i en kategori saknas i motsvarande NH-kategori.**
- **Varianter och lager** för de listade produkterna stämmer, med två undantag (punkt 2).
- **Paketen finns som produkter** (alla 36, rätt pris), men inte som paket (punkt 6).

## 2. Lageravvikelser som återstår

| NH-id | Produkt | Woo | NH | Åtgärd |
|---:|---|---|---|---|
| 168 | Magic Sauce 50% – Khalifa Kush – 5g | slut | i lager (2) | **säljbar i NH men slut i Woo** – rätta före launch |
| 175 | Magic Sauce 50% – Crazy Dog – 5g | slut | i lager (3) | samma |
| 21 paket | t.ex. MS 3.0 2ml/5ml-pack, ms50, nano11, High Life, Core, pre-roll-pack | i lager (paketlager ur delarna) | 0 | följer av att paketen inte är paket |
| 126 | Fraktändring | i lager | slut | tjänst, döljs |

Övriga 117 stämmer: 54 av 77 listade produkter är i lager.

## 3. Produkter som bör döljas (63, exakt lista i NYEHANDEL-VISIBILITY-ACTIONS.md)

- **A. 36 Woo-paket** som är importerade som vanliga produkter (ligger i Alla produkter och i kategorier).
- **B. 11 Nano11-strainbarn** (dolda i Woo, säljs bara i Nano11-paketen/familjen).
- **C. 15 sökbara men olistade** (THCaB vape och cart, THCB, 3 THCV, 2 High Life-buds, Marrakesh Dream, 2 batterier, CBG, H4CBD Canapuff, CBD 1 ml, isolat). Behåll direktlänk och sök.
- **D. Fraktändring** – dölj helt.

I dag läcker de ut genom Alla produkter, kategorierna, hubbarna, Bästsäljare-källan och PDP:ns rälsar. I Theme 8-previewen gav det till exempel 32 olistade kort på Alla Vapes, 16 på Nano-11 och 18 på Magic Sauce-hubben. Theme 8 döljer dem inte (ingen hårdkodad lista). Rättningen görs i admin.

## 4. Kategorier som måste skapas eller ändras i admin (ADMIN-CATEGORY-ACTIONS.md)

1. **Skapa Pre-rolls** (3 listade: MS 1 g, Nano11 1 g, CBD Cookies 1 g). MS-pre-rollen ligger också kvar i Buds och Hasch (varianter "(Buds)" och "Go Fast (Hash)").
2. **Flytta fyra "THCA-B 50% Faraoh"-paket** från `thcba`/`thcba-vapes` till THCaB (felet finns redan i Woo). **D10 2ml 3-/5-pack** från Magic Sauce till D10. 1 ml-paketen är carts, inte vapes.
3. **Rätta Varumärke:** 69 produkter har "Canapuff" (syns för kund på kort och PDP, och i "Alla produkter från Canapuff"); 71 saknar varumärke.
4. **19 tomma gamla kategorier** (`m-s-vapes`, `thca*`, `core`, `10-oh-thc*`, `hhcpm*`, `thcnm*`, `cbd-buds` …): ta bort eller omdirigera, och ge de importerade de rena slugarna (`d10-1` → `d10`, `cookies-1` → `cookies`, `cbd-buds-1` → `cbd-buds`). Nyehandels egen meny länkar fortfarande till de tomma.
5. **Gamla produkt-URL:er** 301:ar till tomma, olänkade `vapes-ny`/`buds-ny`/`hash-ny`. Peka om de 38 säkert mappade till sina nya produkter.
6. **Bästsäljarblocket:** "Alla" = alla 140; flikarna THC-A → `thca` (tom), THC-B → `thcb` (THCB) och CBD → `cbd-group`; ett block pekar på `thcnm`.
7. Filterattributen Serie, Varumärke och Volym finns inte längre (bara Lagerstatus). Theme 8 behöver dem inte efter TASK 17, men Varumärke behövs för PDP:n (punkt 9).

## 5. Theme 8-kopplingar som rättats (commit 2)

| Fil | Rättning |
|---|---|
| `05-header.js` | Magic Sauce → `ms-vapes`/`ms-buds`/`ms-hash`; THCaB → `thcab-vapes` (buds/hasch inaktiva: finns inte); **THCbA → `thcba-vapes`** (var THCB); Core → `core-vapes` + `high-life-hash`; **D10 → `d10-vapes`/`d10-buds`/`d10-hash`** (var 10-OH-THC); 1/2/5 ml → `alla-vapes?typ=vapes&volym=…`; Refill → `alla-liquids`; CBD → `cbd`, `cbd-buds-1`, `cbd-vapes`; 4 utvalda produkter (gamla 301) → befintliga, badge UTVALD PRODUKT |
| `06-catalog-map.js` | Hubbar THCaB `thca-b`, THCbA `thcba`, Core `hero-vapes`, **D10 `d10-1` (inte legacy, ingen 10-OH-THC)**; MS carts `ms-carts`; döda carts-extra borttagna |
| `80-category.js` | **D10 borttagen ur pausregeln**, som bara gäller HHCPM/THCNM/10-OH-THC (beslut 2026-08-28) |
| `81-series-hub.js` | Formatklassning med reserv för namn som inleds med serien → Pre-rolls syns som eget format i Magic Sauce- och Nano-11-hubbarna; syskonserien läser seriens route i stället för det borttagna Serie-filtret |
| `85-pdp-pilot.js` | FAMILIES (ms50 17, nano11 16, **highlife 5** – ny), PACKAGE_PLAN (49 basprodukter), VERIFIED_DOCS (18 strain-verifierade nya filer); allt genererat av `registry.mjs`; `PACKAGE_PRODUCTS` fortfarande `{}` |
| `40-catalog.js`, `45-series-education.js`, `60-social-footer.js` | Seriekort, "Handla"-länkar och sidfot → `thca-b`, `thcba`, `d10-1`, `nano-11`, `cbd` |
| `55-reviews.js` | 3 omdömesposter → nya slugs (säker kedja). Inga omdömen visas förrän de importeras |

Statiskt: tomma eller döda routes i koden 22 → 7 (kvar: legacy HHCPM/THCNM och THCa-kortet, ägarbeslut); gamla produkt-routes 22 → 4 (omdömeslistan); 0 gamla numeriska id kvar.

## 6. Status för de särskilda delarna

| Del | Status |
|---|---|
| **5 ml** | Finns: Magic Sauce 3.0 – 5ml (i lager, 5 strains) + 3-/5-pack. Headerlänken "5 ml engångsvapes" fungerar (3 kort, varav 2 paket som ska döljas). |
| **Pre-rolls** | 3 listade + 4 paket. Ingen kategori → headerlänken inaktiv; i hubbarna syns de som eget format; MS-pre-rollen hör till både Buds och Hasch. |
| **THCaB** | 2 produkter + 6 paket/kit, **alla slut och ingen listad i Woo** (THCA-B-sidan visar 0). Routes rättade. 4 paket är felkategoriserade som THCbA. Ägarbeslut 5. |
| **THCbA** | THCbA 47% Faraoh 2ml (listad, slut) + 3 paket. Inte längre ihopblandad med THCB (`thcb-vapes`). |
| **D10** | 9 listade (vape, 4 buds, 4 hasch), 3 i lager, + 2 paket. Egen serie och hubb, aldrig 10-OH-THC. Inte pausad (bekräfta, ägarbeslut 1). |
| **Core** | Familj = Hero's Core THC-X 2ml + High Life (hasch ×2, buds ×2 bara sökbara) + El Gringo, hubb `hero-vapes`, + 5 paket. |
| **1+1 ml** | 3 listade CBD dual-chamber, klassade som 2 ml i volymfiltret (verifierat: syns under 2 ml), namnet oförändrat. Namnet på en av dem visar `&amp;` (dubbelkodat i NH). |

## 7. Paketstatus

**BLOCKED.** 36 Woo-paket (fast pris per steg, 5 modeller: strain, family, same, collection, kit) är i Nyehandel vanliga produkter (`is_package=false`, lager 0, listade). Inget paket är provköpt. Registret (`PACKAGE-REGISTRY.json`) innehåller alla steg med Woo-pris, ordinarie total, tillåtna produkter och varianter samt NH-id. Granskningsläget `?hz8-pkg-review=1` renderar planen spärrad med de nya id:na, utan fel. Krav per pakettyp: se PACKAGE-MIGRATION-PLAN.md.

## 8. Produktbildsproblem (PRODUCT-IMAGE-AUDIT.md)

5 listade produkter saknar bild. Alla originalbilder är högst 768 px, även i Woo. Vape-, cart- och batteribilderna är miljö- och kompositbilder med motiv ut i kanten (42 st), så skalan skiljer mot de konsekventa beige buds- och haschbilderna (51 st). 3 vita bakgrunder. Inga stående huvudbilder finns.

## 9. Launch-blockerare

1. **Varumärke och PDP:** universell PDP kräver varumärkeslänk (`HZ8.isPdpPilot`). 71 produkter utan varumärke får ingen universell PDP: bl.a. Magic Sauce 2 ml/5 ml/cart, 1+1 ml och batterier, alltså ingen analysrad, ingen strain- eller paketlogik och inget "Fler i serien". 69 visar fel varumärke "Canapuff". Rotorsaken är adminens Varumärke. *Möjlig Theme 8-fallback, inte gjord, kräver beslut:* godkänn som kundprodukt också när någon av produktens relaterade kategorier är en känd format- eller serieroute i relationskartan, vilket utesluter fraktändringen.
2. **63 olistade produkter och paket läcker** genom listningar, hubbar, Bästsäljare-källan och PDP-rälsar (admin, punkt 3).
3. **Paket fungerar inte** (punkt 7), och 21 paket som är i lager i Woo är slut i NH.
4. **Analys-PDF:er ligger på www.hazey.se** (105 länkar) och slutar fungera när WooCommerce stängs. 10 produkter länkar COA för fel strain (bl.a. Tinky Winky-COA på 6 andra Magic Sauce-buds), ärvt från Woo. Theme 8 visar dem inte som analys.
5. **Lager:** 2 produkter säljbara i NH men slut i Woo.
6. **0 produktomdömen** efter importen.
7. **Kategoristruktur:** pre-rolls saknas, felkategoriserade THCA-B- och D10-paket, tomma gamla kategorier i native-menyn, gamla produkt-URL:er till tomma sidor.
8. **Mobil kassaöverlämning:** i testmiljön (393 px) visar `/sv/checkout` "Du har ännu inte lagt några varor" trots en rad i minicarten. Det är **identiskt före och efter** TASK 17, och 1440 fungerar. Inte rotorsakat här, så det behöver kontrolleras på en riktig mobil.
9. Ägarbesluten i OWNER-DECISIONS.md (särskilt THCaB utan listade produkter, legacy-länkar i headern och THCa-kortet).

## 10. Verifiering (lokal build i Theme 8-previewen)

Gjort: alla breda formatsidor, alla verkliga seriehubbar, alla verkliga serie × format-kombinationer, volymvyerna, Bästsäljare, sök, en tom kategori, 13 PDP-klasser + paketgranskning (393 och 1440), 320/430/1920 och 200 % zoom (start, Alla Vapes, Magic Sauce, D10, PDP), långsamt nät (CSS +3 s, JS +4 s), JS som inte laddas, en felande datakälla (hubbens `ms-vapes`-hämtning blockerad), tangentbord, bakåt/framåt, minicart och kassaöverlämning.

- **0 konsolfel** (utom de avsiktliga i felfallen), **0 px horisontellt överflöd** och **0 trasiga bilder** på alla routes, bredder och zoomnivåer.
- **Långsamt nät:** samma innehåll, inga fel. **JS saknas:** fail-open, native sida med 15 kort. **Felande källa:** hubben renderar 24 kort utan fel i stället för 39 och utan statusrad. *(Iakttagelse: ingen synlig "ofullständig"-markering i seriehubben.)*
- **Bakåt/framåt:** Alla Vapes → 5 ml → PDP → bakåt (5 ml, 3 kort) → bakåt (Alla Vapes, 48) → framåt (5 ml, 3). Korrekt.
- **Tangentbord:** tabbordningen når skip-länken, logotypen, alla huvudlänkar, sök, konto och varukorg. Dropdown-länkarna har rätt destinationer. I mitt test ändrades inte `aria-expanded` på Vapes-knappen av Enter (headerkoden är oförändrad i TASK 17). Kontrollera mot Task 01:s tangentbordsspec.
- **Minicart:** öppnas med rätt rad och 495 kr; rekommendationen (Nano11 pre-roll) är listad. Kassaknappen → `/sv/checkout` med produkten (1440). 393: se blockerare 8.
- **Sök och Bästsäljare:** 25 resp. 12 kort, inga olistade i första vyn. Sökresultaten var identiska för "magic" och "pre roll", så sidan visar troligen standardrälsar och inte träffar, och sökning är därför **inte entydigt verifierad**. Bästsäljare-källan är `alla-produkter`, så läckage är möjligt tills admin döljer.
- **Kort och "Fler i serien":** PDP:er med adapter visar seriens kicker (Magic Sauce · Buds, Magic Sauce · Hasch, Nano-11 · Buds, Core · Hasch, THCbA · Vapes) med nya routes. PDP:er utan varumärke har ingen adapter, före som efter (blockerare 1).

Före = build av origin/dev 5ad3944 med samma harness. Antal kort per sida (inklusive rälsar):
| Typ | Route | Bredd | H1 | Kort före → efter | Olistade (läckage) efter | Fel / överflöd / trasiga bilder |
|---|---|---:|---|---|---:|---|
| broad | alla-cartridges | 393 | Alla Carts | 14 → 14 | 7 | 0 / 0 / 0 |
| broad | alla-cartridges | 1440 | Alla Carts | 14 → 14 | 7 | 0 / 0 / 0 |
| broad | alla-liquids | 393 | Alla Liquids | 2 → 2 | 1 | 0 / 0 / 0 |
| broad | alla-liquids | 1440 | Alla Liquids | 2 → 2 | 1 | 0 / 0 / 0 |
| broad | alla-produkter | 393 | Alla produkter | 24 → 24 | 0 | 0 / 0 / 0 |
| broad | alla-produkter | 1440 | Alla produkter | 48 → 48 | 0 | 0 / 0 / 0 |
| broad | alla-vapes | 393 | Alla Vapes | 46 → 48 | 32 | 0 / 0 / 0 |
| broad | alla-vapes | 1440 | Alla Vapes | 46 → 48 | 32 | 0 / 0 / 0 |
| broad | blommor-buds | 393 | Alla Buds | 25 → 25 | 0 | 0 / 0 / 0 |
| broad | blommor-buds | 1440 | Alla Buds | 25 → 25 | 0 | 0 / 0 / 0 |
| broad | cbd | 393 | CBD | 26 → 26 | 3 | 0 / 0 / 0 |
| broad | cbd | 1440 | CBD | 26 → 26 | 3 | 0 / 0 / 0 |
| broad | hasch | 393 | Allt Hasch | 19 → 19 | 4 | 0 / 0 / 0 |
| broad | hasch | 1440 | Allt Hasch | 19 → 19 | 4 | 0 / 0 / 0 |
| broad | pennor | 393 | Pennor/Batteri | 14 → 14 | 4 | 0 / 0 / 0 |
| broad | pennor | 1440 | Pennor/Batteri | 14 → 14 | 4 | 0 / 0 / 0 |
| combos | cbd-buds-1 | 393 | CBD Buds | 17 → 17 | 1 | 0 / 0 / 0 |
| combos | cbd-buds-1 | 1440 | CBD Buds | 17 → 17 | 1 | 0 / 0 / 0 |
| combos | cbd-vapes | 393 | CBD Vapes | 6 → 6 | 1 | 0 / 0 / 0 |
| combos | cbd-vapes | 1440 | CBD Vapes | 6 → 6 | 1 | 0 / 0 / 0 |
| combos | core-vapes | 393 | Core Vapes | 4 → 4 | 3 | 0 / 0 / 0 |
| combos | core-vapes | 1440 | Core Vapes | 4 → 4 | 3 | 0 / 0 / 0 |
| combos | d10-buds | 393 | D10 Buds | 4 → 4 | 0 | 0 / 0 / 0 |
| combos | d10-buds | 1440 | D10 Buds | 4 → 4 | 0 | 0 / 0 / 0 |
| combos | d10-hash | 393 | D10 Hasch | 4 → 4 | 0 | 0 / 0 / 0 |
| combos | d10-hash | 1440 | D10 Hasch | 4 → 4 | 0 | 0 / 0 / 0 |
| combos | d10-vapes | 393 | D10 Vapes | 1 → 1 | 0 | 0 / 0 / 0 |
| combos | d10-vapes | 1440 | D10 Vapes | 1 → 1 | 0 | 0 / 0 / 0 |
| combos | high-life-hash | 393 | Core Hasch | 3 → 3 | 0 | 0 / 0 / 0 |
| combos | high-life-hash | 1440 | Core Hasch | 3 → 3 | 0 | 0 / 0 / 0 |
| combos | ms-buds | 393 | Magic Sauce Buds | 26 → 21 | 6 | 0 / 0 / 0 |
| combos | ms-buds | 1440 | Magic Sauce Buds | 26 → 21 | 6 | 0 / 0 / 0 |
| combos | ms-carts | 393 | Magic Sauce Carts | 1 → 1 | 1 | 0 / 0 / 0 |
| combos | ms-carts | 1440 | Magic Sauce Carts | 1 → 1 | 1 | 0 / 0 / 0 |
| combos | ms-hash | 393 | Magic Sauce Hasch | 5 → 5 | 2 | 0 / 0 / 0 |
| combos | ms-hash | 1440 | Magic Sauce Hasch | 5 → 5 | 2 | 0 / 0 / 0 |
| combos | ms-vapes | 393 | Magic Sauce Vapes | 20 → 15 | 11 | 0 / 0 / 0 |
| combos | ms-vapes | 1440 | Magic Sauce Vapes | 20 → 15 | 11 | 0 / 0 / 0 |
| combos | nano11-blommor | 393 | Nano-11 Buds | 21 → 21 | 16 | 0 / 0 / 0 |
| combos | nano11-blommor | 1440 | Nano-11 Buds | 21 → 21 | 16 | 0 / 0 / 0 |
| combos | nano11-hash | 393 | Nano11 Hash | 1 → 1 | 0 | 0 / 0 / 0 |
| combos | nano11-hash | 1440 | Nano11 Hash | 1 → 1 | 0 | 0 / 0 / 0 |
| combos | thcab-vapes | 393 | THCaB Vapes | 4 → 4 | 4 | 0 / 0 / 0 |
| combos | thcab-vapes | 1440 | THCaB Vapes | 4 → 4 | 4 | 0 / 0 / 0 |
| combos | thcba-vapes | 393 | THCbA Vapes | 13 → 8 | 7 | 0 / 0 / 0 |
| combos | thcba-vapes | 1440 | THCbA Vapes | 13 → 8 | 7 | 0 / 0 / 0 |
| empty | thca-vapes | 393 | THCA Vapes | 0 → 0 | 0 | 0 / 0 / 0 |
| empty | thca-vapes | 1440 | THCA Vapes | 0 → 0 | 0 | 0 / 0 / 0 |
| hubs | d10-1 | 393 | D10 | 14 → 9 | 0 | 0 / 0 / 0 |
| hubs | d10-1 | 1440 | D10 | 14 → 9 | 0 | 0 / 0 / 0 |
| hubs | hero-vapes | 393 | Hero Vapes | 16 → 7 | 3 | 0 / 0 / 0 |
| hubs | hero-vapes | 1440 | Hero Vapes | 16 → 7 | 3 | 0 / 0 / 0 |
| hubs | magic-sauce | 393 | Magic Sauce | 1 → 39 | 18 | 0 / 0 / 0 |
| hubs | magic-sauce | 1440 | Magic Sauce | 1 → 39 | 18 | 0 / 0 / 0 |
| hubs | nano-11 | 393 | Nano-11 | 21 → 21 | 16 | 0 / 0 / 0 |
| hubs | nano-11 | 1440 | Nano-11 | 21 → 21 | 16 | 0 / 0 / 0 |
| hubs | thca-b | 393 | THCA-B | 4 → 4 | 4 | 0 / 0 / 0 |
| hubs | thca-b | 1440 | THCA-B | 4 → 4 | 4 | 0 / 0 / 0 |
| hubs | thcba | 393 | THCbA | 13 → 8 | 7 | 0 / 0 / 0 |
| hubs | thcba | 1440 | THCbA | 13 → 8 | 7 | 0 / 0 / 0 |
| pages | / | 393 | Sveriges #1 för lagliga cannabinoider | 0 → 0 | 0 | 0 / 0 / 0 |
| pages | / | 1440 | Sveriges #1 för lagliga cannabinoider | 0 → 0 | 0 | 0 / 0 / 0 |
| pages | /sv/page/vara-bastsaljare | 393 | Bästsäljare | 12 → 12 | 0 | 0 / 0 / 0 |
| pages | /sv/page/vara-bastsaljare | 1440 | Bästsäljare | 12 → 12 | 0 | 0 / 0 / 0 |
| pages | /sv/search?q=magic | 393 | Sök i sortimentet | 25 → 25 | 0 | 0 / 0 / 0 |
| pages | /sv/search?q=magic | 1440 | Sök i sortimentet | 25 → 25 | 0 | 0 / 0 / 0 |
| pages | /sv/search?q=pre%20roll | 393 | Sök i sortimentet | 25 → 25 | 0 | 0 / 0 / 0 |
| pages | /sv/search?q=pre%20roll | 1440 | Sök i sortimentet | 25 → 25 | 0 | 0 / 0 / 0 |
| volume | alla-vapes?typ=vapes&volym=1ml | 393 | Alla Vapes | 9 → 9 | 7 | 0 / 0 / 0 |
| volume | alla-vapes?typ=vapes&volym=1ml | 1440 | Alla Vapes | 9 → 9 | 7 | 0 / 0 / 0 |
| volume | alla-vapes?typ=vapes&volym=2ml | 393 | Alla Vapes | 25 → 25 | 15 | 0 / 0 / 0 |
| volume | alla-vapes?typ=vapes&volym=2ml | 1440 | Alla Vapes | 25 → 25 | 15 | 0 / 0 / 0 |
| volume | alla-vapes?typ=vapes&volym=5ml | 393 | Alla Vapes | 3 → 3 | 2 | 0 / 0 / 0 |
| volume | alla-vapes?typ=vapes&volym=5ml | 1440 | Alla Vapes | 3 → 3 | 2 | 0 / 0 / 0 |

| PDP-klass | Bredd | H1 | Köp-CTA | Analys | Fler i serien före → efter | Fel/överflöd |
|---|---:|---|---|---|---|---|
| batteri | 393 | CCELL M3 Plus – Vape Batteri – 510 | Lägg i varukorgen | – (ingen adapter) | – → – | 0/0 |
| batteri | 1440 | CCELL M3 Plus – Vape Batteri – 510 | Lägg i varukorgen | – (ingen adapter) | – → – | 0/0 |
| cart | 393 | Magic Sauce 3.0 - 1ml | Börja handla | – (ingen adapter) | – → – | 0/0 |
| cart | 1440 | Magic Sauce 3.0 - 1ml | Börja handla | – (ingen adapter) | – → – | 0/0 |
| Core hasch | 393 | High Life – Malaga Magic – 5g | Lägg i varukorgen | Labbrapport skickas på begäran | format → Core · Hasch | 0/0 |
| Core hasch | 1440 | High Life – Malaga Magic – 5g | Lägg i varukorgen | Labbrapport skickas på begäran | format → Core · Hasch | 0/0 |
| enkel buds | 393 | Magic Sauce 50% – Yoda Ice Cream – 5g | Lägg i varukorgen | Visa labbrapport (PDF) | format → Magic Sauce · Buds | 0/0 |
| enkel buds | 1440 | Magic Sauce 50% – Yoda Ice Cream – 5g | Lägg i varukorgen | Visa labbrapport (PDF) | format → Magic Sauce · Buds | 0/0 |
| familj Nano11 | 393 | 7% Nano11 – Orange Zkittlez – 5g | Lägg i varukorgen | Labbrapport skickas på begäran | Nano-11 · Buds → Nano-11 · Buds | 0/0 |
| familj Nano11 | 1440 | 7% Nano11 – Orange Zkittlez – 5g | Lägg i varukorgen | Labbrapport skickas på begäran | Nano-11 · Buds → Nano-11 · Buds | 0/0 |
| hasch | 393 | Magic Sauce 50% – KitKat – 5g | Lägg i varukorgen | Labbrapport skickas på begäran | format → Magic Sauce · Hasch | 0/0 |
| hasch | 1440 | Magic Sauce 50% – KitKat – 5g | Lägg i varukorgen | Labbrapport skickas på begäran | format → Magic Sauce · Hasch | 0/0 |
| paket (importerad som vanlig) | 393 | MS 3.0 – 2ml – 3-pack | Börja handla | – (ingen adapter) | – → – | 0/0 |
| paket (importerad som vanlig) | 1440 | MS 3.0 – 2ml – 3-pack | Börja handla | – (ingen adapter) | – → – | 0/0 |
| paketgranskning familj | 1440 | Magic Sauce 50% – Yoda Ice Cream – 5g | Lägg i varukorgen | Visa labbrapport (PDF) | format → Magic Sauce · Buds | 0/0 |
| paketgranskning strain | 393 | Magic Sauce 3.0 - 2ml | Lägg i varukorgen | – (ingen adapter) | – → – | 0/0 |
| pre-roll | 393 | Magic Sauce 50% – Pre Rolls – 1g | Lägg i varukorgen | Labbrapport skickas på begäran | format → Magic Sauce · Buds | 0/0 |
| pre-roll | 1440 | Magic Sauce 50% – Pre Rolls – 1g | Lägg i varukorgen | Labbrapport skickas på begäran | format → Magic Sauce · Buds | 0/0 |
| slutsåld D10-vape | 393 | D10 - 2ml | Börja handla | – (ingen adapter) | – → – | 0/0 |
| slutsåld D10-vape | 1440 | D10 - 2ml | Börja handla | – (ingen adapter) | – → – | 0/0 |
| THCbA | 393 | THCbA 47% - Faraoh - 2ml | Börja handla | Labbrapport skickas på begäran | format → THCbA · Vapes | 0/0 |
| THCbA | 1440 | THCbA 47% - Faraoh - 2ml | Börja handla | Labbrapport skickas på begäran | format → THCbA · Vapes | 0/0 |
| vape 1+1ml | 393 | CBD 56% - Triple Scoop + Apples &amp;amp; Bananas - 1+1ml | Lägg i varukorgen | – (ingen adapter) | – → – | 0/0 |
| vape 1+1ml | 1440 | CBD 56% - Triple Scoop + Apples &amp;amp; Bananas - 1+1ml | Lägg i varukorgen | – (ingen adapter) | – → – | 0/0 |
| vape 2ml flera strains | 393 | Magic Sauce 3.0 - 2ml | Lägg i varukorgen | – (ingen adapter) | – → – | 0/0 |
| vape 2ml flera strains | 1440 | Magic Sauce 3.0 - 2ml | Lägg i varukorgen | – (ingen adapter) | – → – | 0/0 |
| vape 5ml | 393 | Magic Sauce 3.0 - 5ml | Lägg i varukorgen | – (ingen adapter) | – → – | 0/0 |
| vape 5ml | 1440 | Magic Sauce 3.0 - 5ml | Lägg i varukorgen | – (ingen adapter) | – → – | 0/0 |
