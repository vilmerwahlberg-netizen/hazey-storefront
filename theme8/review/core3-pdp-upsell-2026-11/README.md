# Task 20: paketval på produktsidan

> **v4 (senast):** 1/3/5-paketval för 255 (Core), 261 (MS 2 ml) och 260 (MS 5 ml) med sex verifierade paketartiklar och en gemensam lagerspärr. Se `RESULTS-V4.md` och `LAGERSPARR.md`. Texten nedan beskriver v3-designen, som är oförändrad. Under v3 var 5‑pack bara en förhandsvisning; i v4 är det köpbart i förhandsvisningen.

2026-11-11 · worktree `../hazey-storefront-task20`, gren `feat/task-20-core3-pdp-upsell`, bas `origin/dev` = 276efa2.
Lokal kodändring. Ingen push, ingen merge, ingen publicering. Nyehandel-admin, bilder, bildmanifest, kassan och andra worktrees är inte rörda. Inga order och inga betalningar. Alla testkorgar är tömda.

## Vad som är byggt (v3: ett paketval, en köpmodul)

- **"Välj paket"** visas som valbara kort i en rad: **1 st | 3‑pack | 5‑pack**.
  - Varje kort visar pris, pris per styck och verklig besparing. Besparing visas bara för verifierade paket.
  - Valt kort har olivgrön 2 px-kant och bock.
  - 5‑pack visas bara med review-flaggan, med streckad kant och märkt "Förhandsvisning".
- **En enda köpmodul** under valet:
  - 1 st: det vanliga strainvalet och antalsväljaren.
  - 3‑pack/5‑pack: "Bygg ditt N‑pack" med en plats per enhet.
  - Stationens orange knapp och mobilens stickybar är den enda köpknappen. Den köper det som är valt.
- **Platserna:**
  - Desktop och surfplatta: kompakta rader i ett tråg, 3 i bredd, och 5 visas som 3 + 2.
  - Mobil: en lista med en rad per plats (ca 50 px).
  - Varje plats visar nummer, Nyehandels egen variantbild, strain, typ och "Byt".
- **Växling:** gjorda val i plats 1–3 ligger kvar när man byter 3 ↔ 5. Nya platser är tomma och kräver aktiva val.
- **Tydligt vad som köps:** modulen visar "Läggs i varukorgen: 3‑pack, 3 st" och innehållet. Under den visas totalpris, överstruket ordinarie pris och besparing en gång, och sedan knappen.
- **Datastyrt:**
  - `PACKAGE_PRODUCTS` (verifierade, `display: "upsell"`) är köpbara. Riktiga `pivot_id` läses ur paketsidan.
  - `PACKAGE_PREVIEW` (bara `?hz8-pkg-review=1`) visar priset från referensprodukten, och knappen är riktigt avstängd.
  - Inga serie- eller produktnamn i koden.
  - Bara variantfamiljer stöds. Separata buds- och haschprodukter kan inte blandas med paketartikeln (Task 19).
- **Minicartens "Ändra"** (84-cart.js) är oförändrad.

Kontrollerat live 2026-11-11:
- 263 är aktiv, `is_package=true`, 1 920 kr, SKU `HZ-T19-CORE-3PK`, variant 467. Paketet har tre olåsta rader av 255 med pivot 1/2/3 (`evidence/probe-263*.json`).
- 162 (`HZ-CORE-5PK`, 3 135 kr) är en importerad vanlig produkt: `is_package=false`, inte köpbar (`evidence/probe-refs.json`).

## Granskning

**Aktuellt paketval för Core 2 ml och Magic Sauce 2/5 ml:**

| Läge | Parameter |
|---|---|
| Theme 8-förhandsvisning: köpbara 1 st, 3-pack och 5-pack | `?preview=v9kzdmqz4w60l5n` |
| Manuell granskning utanför förhandsvisningen | `?hz8-pkg-pilot=1` |

Utan förhandsvisning eller pilotflagga syns inget paketval. `?hz8-pkg-pilot=0`
stänger av det för fliken, även i förhandsvisningen. Alla sex paket behöver
fortfarande slutliga namn, bilder och ett beslut om lagerhantering före lansering.

**Theme 8-previewn hämtar koden från `dev` via GitHub Pages**, så den här grenen syns där först efter en merge. Granska lokalt så länge:

```
cd ../hazey-storefront-task20 && CI=1 node build-theme8.js
node theme8/review/core3-pdp-upsell-2026-11/evidence/open-preview.mjs        # 1440
node theme8/review/core3-pdp-upsell-2026-11/evidence/open-preview.mjs 393    # mobil
```

Lägg till `&hz8-pkg-review=1` i adressfältet för 5‑pack.

**Bilder** i `evidence/shots/`:
- `v3-{393,768,1440,1920}-{1-st,3-pack,5-pack-forhandsvisning}.jpg`
- `v3-1920-forsta-vyn-*.jpg`
- scenariobilder: `S*`, `X*`, `F*`, `R*`, `E*`

**Före-bilder** (`origin/dev`) ligger i `evidence/v1-fristaende-kort/fore-*.jpg`. Där ligger också den första versionen (fristående kort, ersatt).

Resultat: se `RESULTS.md`.
