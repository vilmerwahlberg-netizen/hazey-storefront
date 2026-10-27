# TASK 04B — Report

- Status: **complete, stopped locally**. Read-only. No code, admin, categories, products,
  commit, push or publish.
- Preflight: Task 04 outputs present and complete.

## Numbers

| | |
|---|---:|
| Series × format combinations with real products | **23** |
| Dedicated pages that exist | **16** in legacy data → **9** in the target (7 are legacy taxonomy) |
| Proposed new dedicated | **1** (`m-s-hasch`) + **1 optional** (`m-s-carts`, recommended to wait) |
| Remain filters | **1** (+1 if `m-s-carts` is declined) |
| Legacy (leaves/cleaned up at migration) | **8** (THCaB × Pre-rolls; HHCPM/THCNM ×4 → Core family; THCV ×2 on hold; 10-OH-THC ×1, not D10) |
| Dormant | **1** (THCaB × Isolat) |
| New primary format page | **Pre-rolls** `/prerolled`, activated now (admin item 4) |
| Remain hub shelves | **2** |
| Existing dedicated pages with membership errors | **6** |

## Current state vs target (final catalog decisions 2026-10-27)

- Numbers above are **current state** (legacy Nyehandel). Target = the assortment after the WooCommerce migration.
- Pre-rolls: own page `/prerolled` ("Pre-rolls"); the page and header link are activated now. Future pre-rolls also go in Buds or
  Hasch based on contents. Isolat is dormant. Legacy pre-rolls/isolates leave with the migration.
- **No longer blockers:** the Faraoh Bangkok contents question (resolved by the migration) and the legacy isolates and their
  wrong memberships (cleaned up in the migration). Stock is not a blocker for building/activating Pre-rolls.
- Migration steps + post-migration checks: `../category-route-master-map-2026-10/MIGRATION-CHECKLIST.md`.

## Legacy taxonomy (final decisions 2026-10-27)

- HHCPM and THCNM are **no longer future separate hubs or series**. High Life/El Gringo products join Core in **one Core family at `/core`**.
- THCV is **on hold**. No new THCV pages.
- **D10 is not mixed up with 10-OH-THC**: the former "D10 × Vapes" row is the 10-OH-THC legacy product, and the D10 hub waits for real products.
- Old routes never auto-generate visible nav. Redirect/canonical is decided after the migration.

## Magic Sauce quartet

- Vapes `m-s-vapes`: dedicated, but holds the Magic Sauce cart.
- Buds `m-s-buds`: dedicated, but holds both hash products and lacks La Chupacabra.
- Carts: filtered `alla-cartridges` view, 1 product. Not dedicated, and not called dedicated.
- Hasch: filtered `hasch` view, 2 products. Not dedicated. Proposed as `m-s-hasch`, because
  membership is real and duplicate risk disappears once the hash leaves M.S Buds.

## Unresolved decisions for you

1. Create `m-s-carts` (1 product), or keep it as a filter?
2. If not: should the Magic Sauce cart stay in M.S Vapes (carts-in-vapes rule, also `thca-vapes`, `h4cbd-vape`)?
3. Header "Core" link: `/core` hub, or the vapes filter?
4. ~~Pre-rolls/isolates~~: finally decided 2026-10-27. No open sub-questions (Bangkok and isolates are resolved by the migration).
5. Rename the display names `M.S Vapes/Buds` → `Magic Sauce …`? Only if the slug stays unchanged.
6. Admin facts to report back: SEO fields, robots on the production domain, parent placement.

## Files

`SERIES-FORMAT-WORKSHEET.md`, `series-format-worksheet.json`, `FIRST-ADMIN-BATCH.md`,
`KEEP-AS-FILTER.md`, `POST-ADMIN-HANDOFF.md`, `worksheet.mjs`, `runs/worksheet-table.md`.
