# Task 20: paketkort på produktsidan (Core 3-pack som pilot)

2026-11-11 · worktree `../hazey-storefront-task20`, gren `feat/task-20-core3-pdp-upsell`, bas `origin/dev` = 276efa2.
Lokal kodändring. Ingen push, ingen merge, ingen publicering. Nyehandel-admin, bilder, bildmanifest, kassan och andra worktrees är inte rörda. Inga order och inga betalningar. Alla testkorgar är tömda (`cleaned: true` i varje körning).

## Vad som är byggt

- **1 st är kvar som den vanliga köpvägen:** strainkarusell, antal, orange köpknapp och mobilens stickybar. Paketet tar inte längre över köpknappen, som Task 19:s "Välj förpackning" gjorde.
- **Paketkortet** ligger direkt under köpknappen. Det har:
  - storleksval när det finns flera storlekar;
  - en plats per enhet med Nyehandels egen variantbild;
  - totalpris, överstruket ordinarie pris och verklig besparing, som står en enda gång;
  - en sammanfattning, egna lagerspärrar och en egen olivgrön köpknapp.
- **Mobil:** kortet är hopfällt till en rad (bilder, "Bygg ditt 3‑pack", pris, "Välj strains") och fälls ut med ett tryck. Fem platser visas som 3 + 2.
- **Desktop med 3 platser:** vågräta fack, så att köpkolumnen inte växer långt förbi galleriet (efter 1920-kontrollen).
- **Inget serie- eller produktnamn i koden.** Rubriken är "Bygg ditt N‑pack" med hårt bindestreck, så den aldrig bryts.
  - Storlekar styrs av data: `PACKAGE_PRODUCTS` (verifierade, `display: "upsell"`) och `PACKAGE_PREVIEW` (bara `?hz8-pkg-review=1`, spärrade).
  - Bara variantfamiljer stöds. Separata buds- och haschprodukter kan inte blandas med paketartikeln (Task 19, 406 `cart_item_data_is_invalid`).
- **Köpet** går genom ett gemensamt anrop (`postPackage`), samma som Task 19 verifierade: `{product_variant_id: 467, meta.data.packageProductVariants: [{id, pivot_id}]}`.
  - `pivot_id` läses ur paketsidans serverrenderade rader (1, 2, 3). Inget plats-id är hårdkodat.
  - Minicartens "Ändra" (84-cart.js) är oförändrad och fungerar med kortets rader.

Kontrollerat live 2026-11-11 (`evidence/probe-263*.json`, `evidence/probe-refs.json`):
- 263 är aktiv, `is_package=true`, 1 920 kr, SKU `HZ-T19-CORE-3PK`, variant 467.
- Paketet har tre olåsta rader av produkt 255 med antal 1 och pivot 1/2/3.

## Granskning

**Förhandsvisningen kräver en flagga.** Utan flagga är registret tomt och ingenting syns, så inget säljs publikt. `?hz8-pkg-pilot=0` stänger av flaggan för fliken igen.

| Läge | Parameter |
|---|---|
| Core 3-pack, köpbart | `?hz8-pkg-pilot=1` |
| Plus spärrade storlekar (5-pack, andra variantfamiljer) | `?hz8-pkg-pilot=1&hz8-pkg-review=1` |

**Theme 8-previewn hämtar CSS/JS från GitHub Pages, som byggs från `origin/dev`.** Den här grenen är inte pushad, så den publika previewlänken visar fortfarande Task 19:s gamla byggare. Granska lokalt i stället:

```
cd ../hazey-storefront-task20
CI=1 node build-theme8.js
node theme8/review/core3-pdp-upsell-2026-11/evidence/open-preview.mjs        # 1440 px
node theme8/review/core3-pdp-upsell-2026-11/evidence/open-preview.mjs 393    # mobil
```

Det öppnar ett riktigt Chromium-fönster mot Theme 8-previewn med den lokala builden. Lägg till `&hz8-pkg-review=1` i adressfältet för de spärrade storlekarna. Efter godkänd merge till `dev` blir länkarna:
- `https://hazeyse.nyehandel.se/sv/products/thc-x-vape-hero-core-2ml?preview=v9kzdmqz4w60l5n&hz8-pkg-pilot=1`
- `https://hazeyse.nyehandel.se/sv/products/magic-sauce-vape-5ml?preview=v9kzdmqz4w60l5n&hz8-pkg-pilot=1&hz8-pkg-review=1`

## Resultat

Fullständiga resultat, se `RESULTS.md`.
