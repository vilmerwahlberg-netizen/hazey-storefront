# Task 19: lokalt Theme 8-prov för Core vapes 3-pack (pilotpaket 263)

Slutpass körd 2026-11-08 i Theme 8-previewn (`?preview=v9kzdmqz4w60l5n`) med **lokal build** (`CI=1 node build-theme8.js` → `dist/theme8`, inläst av `catalog-reconciliation-2026-11/lib/harness.mjs`). Varje scenario har körts i en egen session, och alla testkorgar är tömda (`cleaned: true`). **Ingen order, ingen betalning, ingen push och ingen publicering.** Nyehandel-admin, kassans CSS och andra worktrees är inte rörda.

**Status för piloterna (kontrollerat 2026-11-08):**
- **263 är aktiv.** Sidan svarar 200, och `product/state` ger `is_package=true`, köpbar, 1 920 kr.
- **264 är inaktiv.** Sidan omdirigerar med 301 till `/sv`. `product/state` svarar fortfarande `buyable=true`, men servern nekar den i varukorgen med `406 {"cart_item_not_available": true}`; se `evidence/cart-runs/P2-inaktiv-264-api.json`.
- Även en dold produkts direktlänk är åtkomlig så länge produkten är aktiv. Det gäller fortfarande 263.

## Kodändringar (lokal commit på `audit/task-19-mixed-pack-feasibility`)

| Fil | Ändring |
|---|---|
| `theme8/js/85-pdp-pilot.js` | `PACKAGE_PRODUCTS` får pilotposten `255 → {kind: strain, qty: 3, packageId: 263, route, verified: true}`, **bara** med `?hz8-pkg-pilot=1` (sparas i flikens sessionStorage). Utan flaggan är registret `{}` som tidigare. Ny `loadPivots()` (exponerad som `HZ8.packagePivots`) läser paketsidans serverrenderade `<package-product-variants>` och godkänner bara exakt `qty` olåsta rader av basprodukten med antal 1. Resultatet blir verkliga `pivot_id` (1, 2, 3). Paketsteget visas bara om både `product/state` (`is_package`, köpbar, pris) och raderna godkänns. `buyPackage()` skickar Nyehandels verifierade format `{id, pivot_id}` via `packagePayload()` och visar serverns besked: 406 `cart_item_data_is_invalid`, 406 `available` och kapat antal. Därefter läses lagret om. |
| `theme8/js/84-cart.js` | Minicartens verifierade paketsteg får `pivots` via `HZ8.packagePivots`. `replaceRow()` skickar `{id, pivot_id}`; saknas pivots skickas inget. Den gamla raden tas bara bort om korgen faktiskt ökat (servern kan kapa). `metaSlots()` expanderar serverns sammanslagna `{id, pivot_id, quantity: N}` till N platser i pivotordning. Taggen "· 3-pack" läggs inte till när radens eget namn redan innehåller paketnamnet; det tidigare gav "3-pack · 3-pack". |
| `theme8/css/84-cart.css` | En regel: Nyehandels egna delrader (`.item__package .option`) visas i en aktiv paketrad. Tidigare dolde regeln för simulerade paket också kundens strain per del. |

`83-pdp-purchase.js` är **inte** ändrad. Dess byggare är avstängd (`mixedPacks = false`), men den gissar fortfarande `pivot_id = i + 1`.

## Resultat (slutlig build)

Skript: `evidence/ui-pilot.mjs` (`VP=393` för mobil), `evidence/ui-minicart-edit.mjs`, `evidence/ui-regress.mjs`. Rådata: `evidence/cart-runs/ui-pilot-all.json`, `ui-pilot-all-393.json`, `ui-minicart-edit.json`, `ui-regress.json`. Skärmbilder (JPEG, urval): `evidence/shots/UI-S1-tre-olika-{pdp,minicart,checkout}.jpg` (1440 px), `UI-S1-tre-olika-393-{pdp,minicart,checkout}.jpg` (393 px) och `UI-E1-minicart-efter.jpg`. Övriga körningar finns som rådata i JSON-filerna.

**Sammanfattning: 15/15 godkända**
- 1440 px: S1–S3 och F1–F3 (6).
- 393 px med mobil-UA: S1–S3 och F1–F3 (6).
- E1 redigering i minicarten (1).
- R1 och R2 regression (2).

Alla körda mot samma slutliga build 2026-11-08, med tömda korgar och utan konsolfel.

### Desktop 1440 px (harnessens desktop-Chrome-UA)

| # | Scenario | PDP (Theme 8) | POST som Theme 8 skickade | Serverns svar och verklig korg | Minicart | Kassa | Resultat |
|---|---|---|---|---|---|---|---|
| S1 | Gelato, Melon Haze, Coconut Cake | 3-pack: 1 920 kr, 640 kr/st, Spara 105 kr, "3 av 3 valda" | `[{425,1},{431,2},{438,3}]` | 200. En rad, 1 920 kr, delar 425/431/438 | Tre "Strain:"-rader och 1 920 kr | "Paketet innehåller" med de tre strainsen. Delsumma 1 920, totalt 1 969 kr inkl. frakt | **PASS** |
| S2 | Gelato × 3 | samma pris | `[{425,1},{425,2},{425,3}]` | 200. 1 920 kr, servern slår ihop till `{425, pivot 1, quantity 3}` | "3 Styck x … Strain: Gelato" | Gelato, 1 920 kr | **PASS** |
| S3 | Strawberry Kush × 2 + Pineapple Express | samma pris | `[{429,1},{429,2},{433,3}]` | 200. 1 920 kr, `{429 ×2}`, `{433 ×1}` | "2 Styck … Strawberry Kush", "1 Styck … Pineapple Express" | båda, 1 920 kr | **PASS** |
| F1 | Plats 3 tom | "2 av 3 valda". Köpknappen spärrad ("Välj alternativ") | **inget anrop** | korgen tom | – | – | **PASS**: "Välj strain för plats 3." |
| F2 | Payload ändrad i nätverket: variant 243 (MS50) på plats 3 | korrekt val | `[{425,1},{431,2},{243,3}]` (manipulerad) | **406** `cart_item_data_is_invalid`, korgen tom | – | – | **PASS**: "Paketvalet godkändes inte av butiken. Välj strains igen." |
| F3 | 23 × Gelato-3-pack redan i korgen (69 st = hela lagret), sedan ett till | korrekt val | `[{425,1},{425,2},{425,3}]` | **406** `{"available": 0}`, korgen oförändrad (23 paket) | oförändrad | – | **PASS**: "Det finns inte tillräckligt i lager för det här paketet." |
| E1 | Minicart → Ändra → plats 3 till Pineapple Express → Spara val | – | `[{425,1},{431,2},{433,3}]` | ny rad 425/431/433, 1 920 kr, gammal rad borttagen | "Paketet är uppdaterat." | – | **PASS** |
| R1 | PDP 255 utan flagga | inget paketsteg, registret `{}` | inga | inga anrop till pilotsidan eller korgen | – | – | **PASS** |
| R2 | Flagga, men pilotsidan svarar 404 (som efter avpublicering) | inget paketsteg | inga | inga korganrop | – | – | **PASS** |

I alla scenarier: tagg "· 3-pack" saknas (namnet räcker), inga konsolfel och ingen horisontell överflödning i PDP, minicart och kassa.

### 393 px: två olika kontroller

**Responsiv layoutkontroll** (viewport 393 × 852, DPR 2, touch): för varje scenario mäts `scrollWidth` mot `innerWidth` och element utanför viewporten i Theme 8-köpzonen, minicarten och kassan. Resultat: `scrollWidth = 393` och inga element utanför i något läge (karusellen och betalningsiframen räknas inte, eftersom de scrollar eller ritas av Kustom). Mobilbyggaren är hopfälld ("Bygg ditt 3-pack") och öppnas med ett tryck, som en kund gör. Skärmbilder: `UI-*-393-pdp.png`, `-minicart.png`, `-checkout.png`.

**Emulerat mobilköp** med en riktig mobilidentitet: Android-Chrome-UA `Mozilla/5.0 (Linux; Android 14; Pixel 8) … Chrome/128 Mobile Safari/537.36`.
- Kontrollerat först: Nyehandel sparar korgen för Android-Chrome, Pixel 7 (Playwright) och iPhone-Safari. Det är bara den tomma UA:n i harnessens mobilläge (som blir `HeadlessChrome`) som inte sparar korgen.
- Därför behövdes **ingen reserv med desktop-Chrome-identitet**.
- Detta är fortfarande en emulering i Chromium, inte ett köp på en fysisk telefon.

| Scenario (393 px, mobil-UA) | Resultat |
|---|---|
| S1 tre olika | **PASS**: 425/431/438, 1 920 kr i korg, minicart och kassa |
| S2 samma × 3 | **PASS**: 1 920 kr, "3 Styck x … Gelato" |
| S3 2 + 1 | **PASS**: 429 × 2 + 433, 1 920 kr |
| F1 tom plats | **PASS**: inget anrop, "Välj strain för plats 3." |
| F2 servern nekar | **PASS**: 406 `cart_item_data_is_invalid`, rätt meddelande |
| F3 lager slut | **PASS**: 406 `available: 0`, rätt meddelande, korgen oförändrad |

Serverns lagerbegränsning har två former: en begäran om flera paket i ett anrop **kapas** (24 → 23 i det tidigare provet V2), och ett paket när lagret redan är slut i korgen **nekas** med `406 {"available": 0}`. Theme 8 hanterar båda.

## Kvar att observera

- **Kosmetiskt (393 px, befintlig layout):** rubriken "Bygg ditt 3-pack" i byggaren bryts till "3-/pack" bredvid länken "Alla som Gelato - Indica". Den är inte ändrad i denna task.
- **Kosmetiskt:** strainkarusellen på PDP:n visar fortfarande basproduktens valda strain medan byggaren har andra val (befintligt beteende).
- **Inget köp på en fysisk mobil**, bara emulering med mobil-UA (se ovan).
- **Lagerdrag vid order är inte provat**, eftersom ingen order fick läggas.
- **Kustom-kassan står i testläge** ("Test Mode", "Test Shop").

## Det som fortfarande blockerar blandning mellan separata buds- och haschprodukter

1. **Datamodellen:** en paketrad har exakt ett `product_id` (API v3 `package_items`). Pilot 264 och prov P1-V1/F2 visar att servern nekar en variant från en annan produkt med `406 cart_item_data_is_invalid`. Ingen admininställning ändrar det.
2. **Inget annat stöd ger exakt fast pris:** kampanjer finns bara som `discount`/`buy_x_pay_y`, och rabattkoder har inget villkor om antal och gäller en per korg.
3. **Vägarna framåt är beslut, inte kod i Theme 8:**
   - En egen integration, t.ex. vanliga rader med en servergenererad engångsrabatt via API v3 och kontroll vid order.
   - Strainsen som varianter av en produkt per prisgrupp. Det ändrar befintliga produktsidor, så det kräver ägarbeslut.
   - En leverantörsändring från Nyehandel.
4. **Prisbeslut som saknas:** nya fasta priser för Core hasch (590 kr/st), Core buds (675 kr/st) och D10-grupperna. Woo-priset för Core blandade 590 och 675 kr.
