# 04C-B5 — Core family hub (`/sv/categories/core`)

- **Base:** `dev` at `8a7132e` (Nano-11).
  - "Before" = `git archive 8a7132e` + build.
  - "After" = the working copy.
- **Commit:** local, not pushed; Nyehandel admin untouched.
- **The setup duplicate `/core-1` is not used anywhere.** Theme 8 reads it
  nowhere: via `HZ8.fetchPage` it returns no count and no cards.

## Preflight (2026-10-27, `routes.mjs`, the same `HZ8.fetchPage` code path as the hub)

`/sv/categories/core`: 200, H1 "Core", count 4. The cards match the brief
exactly:
1. `Vape - THCX 19% - Core - 2ml`
2. `Buds – THCA 23% + HHCPM 12% – Wedding Cake – 5 gram` (El Gringo)
3. `Hash – THCA 20% + THCNM 20% – Malaga Magic – 5 gram` (High Life)
4. `Hash – THCA 40% – Northern Lights – 5 gram` (High Life)

## Change

**`theme8/js/06-catalog-map.js`:** Core gets `hub: "core"`.
- This is written the same way as the other series (`"thca"`, `"nano-11"`).
  The map prefixes `https://hazeyse.nyehandel.se/sv/categories/`, so it
  resolves to exactly `/sv/categories/core`.
- A literal `"/sv/categories/core"` would have produced a double path.

**`theme8/js/81-series-hub.js`:** one `"Core"` entry in `SERIES_PILOTS`, with
no renderer fork:
- **Hero:** `core-family-hero-*`.
- **Focus:**
  - desktop `50% 8%`: the product group sits at 20–77 % of the image height;
  - tablet `50% 70%`;
  - mobile lead `min(21ch, 33vw)`: the group starts at 37 % of the width.
- **Formats:** vapes/buds/hasch.
- **Lead `{formats} från Core-familjen.`**, which reads "Vapes, buds och hasch
  från Core-familjen." from live data.
  - The prototype's "Core, High Life och El Gringo – …" would hardcode the
    family's brands, so it is not used.
  - THCNM and HHCPM do not appear as series names.
- **Guide:** "Utforska familjen / Hela familjen samlad efter format. / Se
  sortimentet". The prototype's "Core-vapes och familjens buds/hasch på samma
  sida." hardcodes formats.

**`theme8/assets/series-core-family-hero-2026-10/`:** the three supplied WebPs,
unchanged.

**`theme8/css/81-series-hub.css`:** comment only.

## Live shelves

Hub `core` (4) ∪ `alla-vapes?filters=Serie_Core` (1), deduplicated on canonical
URL. The shelves come from the product type in the names:

| Shelf | Products | "Visa alla" |
|---|---|---|
| Vapes | 1 (Core 2 ml) | `alla-vapes?filters=Serie_Core` (Core's existing series × format route) |
| Buds | 1 (Wedding Cake) | none: no dedicated Core Buds route exists, and none is invented |
| Hasch | 2 (Malaga Magic, Northern Lights) | none, for the same reason |

Total 4, the same as the hub's count; 0 duplicates.

## Tests (`runs/*core*.json`, `runs/regress-diff.json`)

| Test | Result |
|---|---|
| 320/393/430, 1440/1920, 200 % | complete, 0 overflow, 0 console errors |
| Mobile lead contrast (320/393, measured) | 5.3–6.7 |
| Deep link `#core-hasch` | 98/90 px under the header (80/72), Hasch active |
| Chip → back → forward | correct hash, title focused |
| Keyboard CTA + Enter | the format row, focus on the first chip |
| Mobile dock (393) | row and dock both visible 0/20 |
| Partial failure (`FAIL_PATH=/sv/categories/alla-vapes`, Core vapes source aborted) | all 4 products still there via the hub |
| Slow fetch (+2.5 s) | complete |

**Regressions** against `8a7132e`, at 393/1440: Magic Sauce, THCaB, THCbA,
Nano-11, Alla Vapes, Alla Buds, the Core series × format page, M&S Vapes, home,
PDP and the shop page:
- 0 px on most pages; the rest is accounted for below.
- **Expected and data-driven, because Core now has a real hub:**
  - the series row on the hubs (65 px) shows the Core tile as "4 produkter"
    (the hub's count) instead of "1 produkt";
  - `/page/butik` 1440 (11.5 %) gets a Core tile linking to `/core`, so the
    grid shifts one step.
- **Remaining small diffs** (1–525 px) are inside product images during their
  fade-in (class 2).

## Images (`proof/core/`)

- `reference-vs-after-full.jpg`
- `before-after-first-view.jpg` ("before" = the generic page without a pilot)
- `responsive-after.jpg`

## Remaining differences / debt

- **The reference shows 4 cards per shelf.** Those are stand-ins. Live there
  are 1/1/2 products, so the shelves are short. This is real data.
- **On desktop the Core vapes in the photo sit partly behind the guide card.**
  The shared hero height (locked by Magic Sauce) is lower than the reference's.
  The El Gringo and High Life packs are fully visible.
- **The Core tile on `/page/butik` says only "Vapes".** That shop page builds
  its format caption from the series' dedicated format routes, and Core has
  only a vapes route. It is incomplete rather than incorrect. Fixing it means
  either changing that caption to be counted from the hub's cards (a separate
  change), or adding Core Buds/Hasch sub-routes in Nyehandel.
- **The products are also in THCaB, THCNM and HHCPM** (Nyehandel's
  categories). That is correct membership and is not deduplicated across hubs.
