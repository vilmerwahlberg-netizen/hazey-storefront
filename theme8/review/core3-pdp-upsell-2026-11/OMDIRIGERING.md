# Task 20 v5: paketsidorna skickas vidare till basproduktens PDP

2026-11-11. Lokal kodändring och lokal build. Ingen adminändring, ingen push och ingen publicering. Ingen order.

## 1. Körs Theme 8 på paketens direktsidor?
Källa: `evidence/redirect/probe-direct.json`.

| Miljö | Theme 8 körs? | Bevis |
|---|---|---|
| Theme 8-previewn (`?preview=…`), publicerad build (GitHub Pages) | **Ja** | `html.hz8`, `data-hz8-page="product"`, Theme 8-loadern finns, viewProduct 265 |
| Theme 8-previewn, lokal build | **Ja** | samma |
| Skarpa sajten (tema 3, utan preview) | **Nej** | Sidan laddar den gamla produktionsbunten `hazey-storefront@v1.0.3/hazey.min.js` (jsDelivr). Ingen Theme 8-loader |

## 2. Lösningen i Theme 8 (`85-pdp-pilot.js`)

- **`PACKAGE_TABLE`, alltid laddad:** basprodukt → `home` (basens PDP) och dess paket (`route` = paketets egen sida).
  - Paketvalet (`PACKAGE_PRODUCTS`) byggs ur tabellen bara med `?hz8-pkg-pilot=1`, precis som förut.
  - Omdirigeringen använder tabellen alltid.
- **`packagePageRedirect()` körs direkt när bunten utvärderas**, medan Theme 8:s bootmask fortfarande döljer sidan.
  1. Den matchar `location.pathname` mot paketens `route` (även `…/<variant-id>`).
  2. Den sätter `html.hz8-redirecting`, så att `body` förblir dold även om masken släpps.
  3. Den skickar vidare med `location.replace`, så att det inte blir någon historikpost.
- **Måladress:**
  - basens PDP med samma parametrar som förut, inklusive `preview`;
  - med pilotflaggan läggs `hz8-pack=N` till, och basens PDP förväljer då rätt paketstorlek;
  - utan flaggan blir det bara basens PDP, utan paketval.
- **`?hz8-pkg-direct=1`** visar paketsidan ändå. Det är till för felsökning och kontroll i admin.
- **Byggarens och minicartens pivot-läsning påverkas inte.** `loadPivots()` hämtar paketsidans HTML med `fetch()`, och där körs inget JavaScript. Ingen 301 i Nyehandel behövs eller ska läggas in, eftersom en serveromdirigering skulle ge `loadPivots()` basens HTML och därmed stoppa alla paketköp.

## 3. Test (`evidence/redirect/test-redirect.mjs`)

Paket 265 testades först, sedan 263, 266, 267, 268 och 269. Varje paket kördes vid 1440 px och vid 393 px (Android-Chrome-UA).

**12/12 PASS** (`redirect/redirect-all-{1440,393}.json`, `redirect/log-*.txt`). Per paket:
- **Navigering med pilotflagga** (från en kategorisida) landar på basens PDP. `preview` och `hz8-pack=N` följer med, och rätt storlek är förvald med byggaren synlig.
- **Paketsidan målades aldrig.** En rAF-logg per dokument visar ingen synlig `body` på paketsidan.
- **Bakåtknappen** går till kategorisidan, inte till paketsidan.
- **Utan pilotflagga:** basens PDP, inget paketval och ingen `hz8-pack`.
- **`?hz8-pkg-direct=1`:** paketsidan visas.
- **Byggarens HTML-hämtning av paketsidan** ger 200, `redirected: false` och rätt antal `<package-product-variants>` (3 eller 5).
- **Riktigt köp via byggaren:** rätt paketvariant och pivot (1–3, 7–11, 12–14, 15–19, 20–22, 23–27). Korgen fick en rad med rätt pris (1 920 / 3 135 / 1 599 / 2 530 / 2 950 / 4 450 kr).
- **Minicartens länk** (pekar på paketsidan) landar på basens PDP med rätt storlek förvald.
- Korgen töms. Inga konsolfel.

**Regression av v4 med samma build:** Core 5‑pack-köp, Tinky × 5-spärren, minicartens "Ändra" och läget utan flagga är 4/4 PASS (`runs/v5-regress-1440.txt`).

## 4. Den skarpa sajten (tema 3), där Theme 8 inte körs

Här skyddar Theme 8:s omdirigering inte. Paketsidorna svarar 200 på direktlänk, med `noindex, nofollow` och utan att synas i kategorierna. Där kör Nyehandels egen paketköpare utan Theme 8:s lagerspärr. Möjliga vägar, varav ingen är gjord:

| Väg | Fungerar? | Kräver |
|---|---|---|
| **A. Publicera Theme 8** (med omdirigeringen) | Ja, samma kod som ovan | Godkännande av Theme 8-lanseringen |
| **B. Samma omdirigering i tema 3:s produktionsbunt** (`js/` → ny tagg → loaderns pinnade jsDelivr-tagg) | Ja, samma princip: `fetch` påverkas inte. Tema 3 har inget paketval, så målet blir basens PDP utan förval | Produktionsrelease och en ändring av loadertaggen i tema 3:s JS-fält, alltså admin och live |
| **C. Inaktivera paketen i Nyehandel** | **Nej** när paketvalet ska sälja dem. Task 19 visade att en inaktiv paketprodukt ger 301 på sidan **och** `406 cart_item_not_available` i korgen | Admin |
| **D. 301 i Nyehandel på paketens adresser** | **Nej.** `loadPivots()` följer omdirigeringen, får basens HTML och hittar inga paketrader, så paketvalet försvinner | Admin |

**Rekommendation:**
- Behåll paketen aktiva och dolda, som nu.
- Låt Theme 8:s omdirigering gälla från lanseringen (väg A).
- Om den skarpa sajten behöver skyddas före det är väg B den enda som inte bryter köpen. Den kräver ditt uttryckliga klartecken till en produktionsrelease.
