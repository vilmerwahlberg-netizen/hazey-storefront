
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
