# TASK 11 — Bästsäljare (`/sv/page/vara-bastsaljare`) — rapport

Status: **implementerad, korrigerad (runda 2) och verifierad lokalt, inte stagad/committad/pushad.** Väntar på visuellt
godkännande. Worktree `hazey-storefront-task11b`, gren `feat/task-11-bastsaljare` från `origin/dev`
`a9081ee`. Före = build av `a9081ee` (git archive i scratch), efter = arbetskopian. Extern preview
med dokumentets dev-loader utbytt mot lokal build (samma harness som 10B). Inget skrivet till Nyehandel.

## Korrigering 2 (2026-10-29)

Avgränsad runda efter godkänd riktning; bara Task 11-filerna (`88a-bestsellers.js/.css`) ändrade.
Låsta beslut: nedre moduler efter formatguiden, 5 kolumner vid 1920, headern orörd
(`aria-current="page"`), sanningsenliga tomma format, kort/hero/TrustBox/footer oförändrade.

1. **Expansion.** 12 i grundläget. `Visa fler bästsäljare` lägger till 12 per klick och finns kvar tills
   alla filtrerade produkter visas; då får den `hidden` (borta ur fokus- och tillgänglighetsträdet,
   fokus har redan flyttats till första nya kortet). Efter första expansionen visas även en visuellt
   sekundär `Visa färre ⌃` (textknapp, understruken, 44 px träffyta). Den återställer 12 och fokuserar
   listrubriken med headerns **viloläge** som offset (`--hz8-header-reserve`, även när headern just är
   undanskjuten). `?visa=` (replaceState), reload, bakåt/framåt, format- och lagerfilter behållna.
   ≤ 12 träffar: inga kontroller.
2. **Exakt en H1.** Nyehandels `h1.nh-bs-hero__title` flyttas in i den synliga heron (får `title` +
   `id`); en egen H1 skapas bara om den saknas. Inga CSS-regler riktar sig mot native-klassen, så
   typografin är portalens (1440: Iowan Old Style 64,8 px/600; första vy pixelmässigt oförändrad).
   Övriga adminblock orörda (`.nh-bs-hero` kvar med sina övriga barn, 10 filterchips, 9 källsektioner).
3. **Vald formatruta.** 2 px grön kontur → 1 px inre olivlinje (62 %) + den vanliga mjuka skuggan.
   `aria-pressed` oförändrad; struktur, mått och funktion oförändrade.

### Verifiering runda 2 (`r2.mjs` → `runs/r2-after.json`, `runs/r2-after-h1.json`) — alla gröna

| Kontroll | 393 | 1440 |
|---|---|---|
| Alla: 12 → 24 → 36 → Visa färre → 12; fokus cell 13 resp. 25, sedan listrubriken (84/92 px = header 72/80 + 12); `?visa=24/36`; historiklängd oförändrad; scrollhopp 0 px; ingen omladdning | ✓ | ✓ |
| Buds (53 > 24): 12/24/36/48/53, därefter `Visa fler` hidden, `Visa färre` kvar, fokus på kort 49 | ✓ | ✓ |
| Carts (7 ≤ 12): inga expansionskontroller | ✓ | ✓ |
| Reload `?visa=36` → 36 (två gånger); Alla 24 → Buds (pushState, 12) → 24 (replaceState) → bakåt = Alla 24 → framåt = Buds 24 | ✓ | ✓ |
| Exakt 1 H1 i DOM (`nh-bs-hero__title title`, i heron); 6 bredder `h1Dom = 1` | ✓ | ✓ |
| Fail-open (Theme 8-JS avbruten / syntaxfel): native H1 synlig, adminhero + filterchips synliga, inga Theme 8-markörer | ✓ | ✓ |
| Reduced motion: Visa färre → omedelbar scroll till listrubriken, fokus där | ✓ | ✓ |
| Tangentbord (1440): Enter på Visa fler → 24 + fokusring på kort 13; Tab Visa fler → Visa färre (fokusring); Space på Visa färre → 12 + listrubriken | ✓ | |

Fail-open-not: nativeadminsidans produktsektioner renderar inga produktkort på egen hand
(platshållare) — **identiskt före (`a9081ee`) och efter**, med och utan Theme 8-CSS (`failopen.mjs`).
Befintligt Nyehandel/admin-beteende, inte orsakat av Task 11.

Task 11-regressioner på slutbygget: `interact.mjs` 15/15 (expand-kriteriet uppdaterat till den nya
modellen), `states.mjs` 14/14, `page.mjs` 6 bredder (1 synlig + 1 i DOM, 0 överflöd, 0 konsolfel) +
ordning 10/10 identisk med källan. Andra sidor: inga ändringar i delad kod denna runda (bara
`88a-*`, registrerad bara på bästsäljarrouten, CSS under `html.hz8-bs-page`); runda 1:s
regressioner (42 route×bredd, DOM identisk) gäller oförändrat.

Blad: `proof/correction-2/` — 01–02 helsida 1440/393 före (runda 1) | efter · 03 expanderad helsida ·
04–05 sekvens 36 → Visa färre → Buds allt visat · 06 vald formatruta före | efter · 07 första vy (H1) ·
08 fail-open · 09 utökningsraden närbild (12 / 24 / allt) · 10 vald formatruta närbild.

## Ändrade filer

| Fil | Ändring |
|---|---|
| `theme8/js/88a-bestsellers.js` (ny) | Hela sidan: portalens skal på innehållssidan, data, flikar, I lager, expansion, formatguide, URL-tillstånd, TrustBox, återanvändbara nedre moduler (`HZ8.helpModules`) |
| `theme8/css/88a-bestsellers.css` (ny) | Dold adminyta (B4), trustrad (+72 px hero), lagerväxel, utökning, tillstånd, skeleton, formatrutor, `.hz8-lmod*` |
| `theme8/js/88-pages.js` | 1 rad: `content-pages` hoppar över bästsäljarsidan |
| `theme8/js/80-category.js` | Kortdekoratorn bruten ut oförändrad till `decorateCard()` + `HZ8.decoratePortalCard`; `cardUnit(name, weights)` tar en valfri flagga (vikt-chips utanför portalen). Diffen är mest omindentering |

Inget i header, footer, produktkort-CSS/JS, `30-bestsellers.js`, `87-shop.js`, `85-pdp-pilot.js`,
`02-shared.js`, genererade bundles eller admin.

## Beslut B1–B4

- **B1** H1 `Bästsäljare`, listrubrik `Populärast just nu`, inga ranknummer/försäljningssiffror (kontroll: 0 träffar på `#N`/`sålda` i korten, alla bredder).
- **B2** Batterier syns under Alla (chip `Tillbehör`), ingen egen flik — flikar = Alla/Vapes/Carts/Buds/Hasch, var och en bara vid ≥ 1 träff.
- **B3** `Visar 12 av 103` — riktigt antal efter borttagning av varumärkeslösa poster/dubbletter.
- **B4** Adminblocken (`.nh-bs-hero`, `.nh-bs-filters`, `[data-nh-source]`, sektionerna) ligger kvar i DOM:en och döljs med CSS. Under uppstarten döljs de redan via `hz8-boot` (fail-open: faller JS bort syns adminsidan igen). Undantag (korrigering 2): adminherons H1 flyttas in i den synliga heron, så sidan har exakt en H1.

## Verifiering (alla gröna)

| Kontroll | Resultat | Data |
|---|---|---|
| 320/393/430/1440/1920/200 %: 1 synlig H1, 0 överflöd, 0 konsolfel, adminyta dold, 12 kort, 0 varumärkeslösa, TrustBox-iframe, 4 formatrutor, 3 moduler | ✓ 6/6 | `runs/page-after-widths.json` |
| Ordning = `alla-produkter?sort=popular` (alla sidor) utan varumärkeslösa, och per format | ✓ 10/10 identiska (Alla 103, Vapes 24, Carts 7, Buds 53, Hasch 15; 393 + 1440) | `runs/page-after-order.json` |
| Visa fler/Visa färre: +12, fokus på första nya kortet, `aria-expanded`, `?visa=24` utan historikpost, 0 px scrollhopp, ingen omladdning; Visa färre → 12 + fokus på listrubriken under headern | ✓ 393/1440 | `runs/interact-after.json` |
| Flik (pushState `?typ=`), I lager (`filters=smart-filter_in-stock`, slutsålda bort), kombination, formatbyte behåller lager, bakåt/framåt, omladdning återställer format+lager+antal | ✓ 393/1440 | 〃 |
| Formatguide: filter + scroll till listrubriken (12 px under headern), ingen navigering; reduced motion = omedelbar scroll | ✓ 393/1440 | 〃 |
| Lägg till → `POST /frontend-api/cart/item` 2xx + rad i varukorgen; Välj → PDP-href | ✓ 393/1440 | 〃 |
| TrustBox laddar; blockerad widget → `Omdömen på Trustpilot` | ✓ 393/1440 | 〃 |
| Tangentbord 1440: flikar, växel, kort, knapp, guide, details; Enter/Space aktiverar | ✓ | 〃 |
| Tomt (0), tomt format, fel + Försök igen (återhämtar), 3 resp. 6 kort (ingen knapp/räknerad), skeleton | ✓ 14/14 | `runs/states-after.json` |
| Skeleton: 12 celler i kortens mått (360/360 px @393, 507/508 @1440), rutnätet står still, CLS 0,0002, innehåll under listan ±4 px | ✓ | 〃 |
| Kall laddning + Fast 3G: 0 bildrutor med adminytan, ingen målad ram utan sidan | ✓ 393/1440 | 〃 |

## Regressioner före (a9081ee) | efter — DOM-signatur + fullsidig pixeldiff

42 route×bredd, **DOM-signatur identisk i alla 42** (rubriker, kortordning, modulkort, köpknappar,
sidmarkörer, överflöd, konsolfel). `runs/compare.json`, diffbilder `runs/shots/diff-reg-*.png`.

- Delad källa: startsida, Butik, PDP Core "Bästsäljare just nu", kampanjer, FAQ — 0 % (start 393: 0,02 %).
- Kategori: portal (+ `?typ=hasch`), Alla Vapes, Buds, Hasch filtrerad, m-s-vapes, Magic Sauce- och Core-hubbar, sök — 0 %.
- **Universell PDP (a9081ee)**: 91, 92, 57, 84, 88, 17 — DOM identisk; 1440 0 %; 393 0–0,18 %.
- Varukorg/kassa 393/1440: DOM identisk, ≤ 0,11 %.

Klassning av kvarvarande pixelskillnader:
- PDP 91/92/57 @393 (0,15–0,18 %): strainkarusellens horisontella läge vid skärmdumpen (samma vald strain "3 av 5"; PDP-koden orörd) → **klass 2, dynamiskt/tidsberoende**.
- Start 393 (0,02 %), varukorg 1440 (0,11 %): bildavkodning/antialiasing i identiska kort → **klass 4**.

Not: varukorgsregressionens snabbköp på Alla Vapes lade ingen rad varken före eller efter (samma beteende),
så själva köpflödet är bevisat på bästsäljarsidan (`buy` ovan), inte där.

## Jämförelseblad (`proof/`)

01–02 före|efter helsida 1440/393 · 03–06 referens|efter (1440 första vy/helsida, 1920, 393) ·
07 expanderad · 08 Carts · 09 Hasch + tomt format 393 · 10 320/430/200 % · 11–12 tillstånd ·
13–14 interaktion.

## Avvikelser mot referensen / beslut att ta ställning till

1. **Expansion** — avgjord i korrigering 2: `Visa fler` tills allt visas + sekundär `Visa färre` (avviker därmed medvetet från `desktop-1440-expanded.jpg`, klass 5).
2. **Nedre modulernas placering.** `desktop-1440-full.jpg`/`1920-full` visar modulerna ovanför listan (artefakt i referensbygget); kontraktet och mobilreferensen placerar dem efter formatguiden — implementerat så.
3. **1920 = 5 kolumner** (portalens egen brytpunkt, samma som referensen 1920); kontraktet säger "4 desktop".
4. **Aktiv i navigationen** = `aria-current="page"` på Bästsäljare-länkarna, ingen visuell ändring (headern är låst och har inget aktivt läge; referensen visar inget).
5. **Vald formatruta** — nedtonad i korrigering 2 till en 1 px inre olivlinje.
6. **Tomt format** visas med lagerväxeln på och bara relevanta flikar (Alla + valt format) — referensen simulerade läget utan lagerfilter och visade alla flikar; beteendet följer PAGE-COVERAGE ("0 träffar → fliken visas inte").
7. Underraderna i formatrutorna ("… i flera volymer/vikter") härleds ur produktnamnen och visas bara när ≥ 2 olika volymer/vikter finns.
8. Skeleton/sista sidan: alla sidor hämtas i bakgrunden direkt (krävs för det riktiga antalet), inte först vid klick.

## Visuell skuld

Ingen känd utöver punkterna ovan. TrustBox-widgetens egen centrering styrs av Trustpilot (behållaren 300 px bred som i referensen).

Uppskjuten (accepterad 2026-10-30, ingen designändring gjord):

- Trustpilot-raden kan i en senare polishrunda provas något längre åt vänster/ned, tydligare förankrad mot den ljusa putsytan. Detta är inte ett launchblockerande fel.

## Skript (`theme8/review/bestsellers-page-2026-10/`)

`lib.mjs` (harness, `XD_BASE` = före-build), `probe.mjs`, `page.mjs`, `interact.mjs`, `states.mjs`,
`reg.mjs` + `compare.mjs`, `capture.mjs`, `sheet.mjs`, `products.mjs`; runda 2: `r2.mjs`, `failopen.mjs`,
`closeup.mjs`, `sheet-r2.mjs`, `h1probe.mjs`.
