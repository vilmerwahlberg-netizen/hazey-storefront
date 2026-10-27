# TASK 04B — Series × format worksheet

- Generated 2026-10-27, read-only. Source: Task 04 live data
  (`../category-route-master-map-2026-10/runs/combos.json`, `route-matrix.json`).
- Machine-readable: `series-format-worksheet.json` (one row per combination, with
  full product lists, proposed copy, canonical note, parent/internal links, template, admin action).
- Reproduce: `node worksheet.mjs` (preflight fails if any Task 04 output is missing).

**Preflight:** Task 04's ROUTE-MATRIX, route-matrix.json, ADMIN-GAPS, ROLLOUT-BATCHES
and REPORT exist and are complete. Passed.

## Current state vs target (final catalog decisions 2026-10-27)

- **Current state** = legacy Nyehandel data (what this worksheet measures). **Target** = the assortment after the
  WooCommerce migration (about 1–2 days away). Legacy pre-rolls (4, sold out) and isolates (2) are documented,
  but they do not drive page architecture, navigation or rollout.
- **Pre-rolls:** own broad format page `/prerolled`, customer name "Pre-rolls". The page and header link are activated **now**;
  stock and the migration are not blockers. It must handle 0/1/many/sold-out/new products with no hardcoded names/IDs.
  Every future pre-roll is always in Pre-rolls, and also in Buds (flower-based) or Hasch (hash-based) based on real
  data or explicit admin categorization. The **Bangkok question is resolved by the migration** and is not a blocker.
- **Isolat:** dormant. No isolate in the new assortment, no page, and no visible link. The legacy isolates' memberships in
  Buds/Hasch/THCA/CBD disappear in the migration.
- **Before/after the migration:** `../category-route-master-map-2026-10/MIGRATION-CHECKLIST.md`.

## Legacy taxonomy (final decisions 2026-10-27)

- **HHCPM and THCNM** are legacy Nyehandel categories, **not future series**. High Life and El Gringo products belong with
  Core in **one Core family**, and the shared customer destination is **`/core`**. HHCPM/THCNM series × format routes are legacy data;
  no pages are mass-produced from them. Old routes never auto-generate visible navigation. Redirect/canonical is decided
  after the migration, based on which URLs are still used or indexed.
- **THCV** is on hold (not in the planned new assortment). `/thcv`, `thcv-vape` and `thcv-carts` are legacy. No new THCV pages.
- **D10 ≠ 10-OH-THC.** The combination previously labelled "D10 × Vapes" is the legacy **10-OH-THC** product. `/10-oh-thc` and
  `10-oh-thc-vapes` are never a data source or destination for Delta-10. The D10 hub waits for real products + the migrated
  category; D10 material is kept for that page.

## Method and definitions

- **Series:** the nine series in Theme 8's catalog map, as of current legacy data. In the target, HHCPM/THCNM merge into the Core family, THCV is on hold, and Theme 8's "D10" is relabelled 10-OH-THC (legacy). Membership = the product is in the
  series' own Nyehandel hub category, or carries the native Serie attribute
  (`Magic Sauce`, `Core`, `Nano11`; there are only these three).
- **Format:** taken from Nyehandel's product-name type prefix (`Vape -`, `Cart -`,
  `Buds/Blommor –`, `Hash –`, `PreRolled –`, `Isolat –`). Category membership was not used,
  because the categories themselves contain off-format items.
- Only combinations with **≥1 real product in current (legacy) data** are listed. No zero-product or future route is proposed.
- `/sv/categories/core` is treated as a real series hub (id 67, H1 "Core", 4 products:
  1 Core vape, 1 THCA+HHCPM buds, 2 THCA(+THCNM) hash). Its duplicate `/core-1` is empty.

## Confirmed facts / recommendations / unknowns

- **Confirmed:** the membership, counts, current destinations and canonical behaviour below
  (filtered URLs canonicalize to their parent; dedicated categories are self-canonical).
- **Recommendation:** each `decision` and all proposed slugs, names, H1s, intros and SEO text.
- **Unknown, needs admin verification:** production-domain indexing (the nyehandel host
  serves `noindex, nofollow` everywhere); whether Nyehandel has per-category SEO
  title/description fields; whether renaming a category changes its slug; whether a category
  can be hidden from the native menu while staying reachable; the native parent/child
  placement of the existing `m-s-*` categories.

## Worksheet (23 combinations)

| Series × format | Real | Current destination | State | Membership issues | Decision | Proposed slug | Admin action |
|---|---:|---|---|---|---|---|---|
| 10-OH-THC × Vapes | 1 | `10-oh-thc-vapes` (1) | dedicated | — | **legacy** | — | None. The product is 10-OH-THC (legacy), NOT Delta-10. 10-oh-thc-vapes is not a D10 route; D10 waits for real products + the migrated category. |
| Core × Buds | 1 | `core (hub shelf)` (—) | missing | — | **keep-hub-shelf** | — | — (Core family grows with High Life/El Gringo at migration) |
| Core × Hasch | 2 | `core (hub shelf)` (—) | missing | — | **keep-hub-shelf** | — | — (Core family grows with High Life/El Gringo at migration) |
| Core × Vapes | 1 | `alla-vapes?filters=Serie_Core` (1) | filtered/shared | — | **keep-filter** | — | — |
| HHCPM × Buds | 3 | `hhcpm-blommor` (3) | dedicated | — | **legacy** | — | None. HHCPM is legacy taxonomy; Wedding Cake (El Gringo) → Core family at /core; Amnesia/Durban Poison legacy. Cleanup at migration. |
| HHCPM × Vapes | 1 | `hhcpm-vapes` (1) | dedicated | — | **legacy** | — | None. HHCPM is legacy taxonomy; the Canntropy vape is a legacy item. Admin cleanup at migration. |
| Magic Sauce × Buds | 8 | `m-s-buds` (9) | dedicated | off-format: Hash – Magic Sauce 50% – Charas – 5 gram; Hash – Magic Sauce 50% – Marrakesh Dream – 5 gram / missing: Buds – Magic Sauce 50% – La Chupacabra – 5 gram | **keep-dedicated** | — | Add 'Buds – Magic Sauce 50% – La Chupacabra – 5 gram'. Remove both Magic Sauce hash products (move them to M.S Hasch). Optional rename 'M.S Buds' → 'Magic Sauce Buds' (verify the slug is unchanged). |
| Magic Sauce × Carts | 1 | `alla-cartridges?filters=Serie_Magic Sauce` (1) | filtered/shared | — | **optional-dedicated** | `m-s-carts` | Your decision: 1 product. Recommended: keep as filter now; create only if you want full Magic Sauce format parity (FIRST-ADMIN-BATCH item 2, optional). |
| Magic Sauce × Hasch | 2 | `hasch?filters=Serie_Magic Sauce` (2) | filtered/shared | — | **propose-dedicated** | `m-s-hasch` | Create the category (FIRST-ADMIN-BATCH item 1). |
| Magic Sauce × Vapes | 1 | `m-s-vapes` (2) | dedicated | off-format: Cart - Magic Sauce 99% - 1ml | **keep-dedicated** | — | Remove 'Cart – Magic Sauce 99% – 1ml' from M.S Vapes (move to M.S Carts if created). Optional: rename the category display name 'M.S Vapes' → 'Magic Sauce Vapes' (verify the slug stays m-s-vapes). |
| Nano-11 × Buds | 8 | `nano11-blommor` (8) | dedicated | — | **keep-dedicated** | — | — (identical to /nano-11 hub) |
| THCaB × Buds | 14 | `thca-blommor` (16) | dedicated | off-format: Isolat – THCA 99% – Isolate – 5 gram; PreRolled – THCA 22% – Bangkok – 1 gram | **keep-dedicated** | — | Legacy THCA pre-roll + THCA isolate are listed here; both leave with the WooCommerce migration (not a blocker). After migration: pre-rolls only if flower-based. |
| THCaB × Carts | 2 | `thca-carts` (1) | dedicated | missing: Cart - THC-A 50% Live Resin - Faraoh - 1ml | **keep-dedicated** | — | Add 'Cart – THC-A 50% Live Resin – Faraoh – 1ml' to THCA Carts. |
| THCaB × Hasch | 9 | `thca-hash` (10) | dedicated | off-format: Isolat – THCA 99% – Isolate – 5 gram | **keep-dedicated** | — | Legacy THCA isolate is listed here; leaves with the migration (not a blocker). |
| THCaB × Isolat | 1 | `thca (hub shelf)` (—) | missing | — | **dormant** | — | None. Legacy isolate leaves with the migration; Isolat stays dormant and unlinked. |
| THCaB × Pre-rolls | 1 | `thca (hub shelf)` (—) | missing | — | **legacy** | — | None. The 1 legacy pre-roll leaves with the migration; the Bangkok contents question is resolved by the migration. The Pre-rolls format page itself: FIRST-ADMIN-BATCH item 4. |
| THCaB × Vapes | 3 | `thca-vapes` (4) | dedicated | off-format: Cart - THC-A 45% - Faraoh - 1ml | **keep-dedicated** | — | Decide the carts-in-vapes rule; 'Cart – THC-A 45% – Faraoh – 1ml' is listed in THCA Vapes. |
| THCbA × Carts | 1 | `thcb-carts` (1) | dedicated | — | **keep-dedicated** | — | — (1 product; see ADMIN-GAPS C9) |
| THCbA × Vapes | 3 | `thcb-vapes` (3) | dedicated | — | **keep-dedicated** | — | — |
| THCNM × Buds | 2 | `thcnm-blommor` (2) | dedicated | — | **legacy** | — | None. THCNM is legacy taxonomy; GSC + Black Widow (High Life) → Core family at /core. Cleanup at migration. |
| THCNM × Hasch | 2 | `thcnm-hash` (2) | dedicated | — | **legacy** | — | None. THCNM is legacy taxonomy; Malaga Magic + Royal Gorilla → Core family at /core. Cleanup at migration. |
| THCV × Carts | 1 | `thcv-carts` (1) | dedicated | — | **legacy** | — | None. THCV on hold. |
| THCV × Vapes | 6 | `thcv-vape` (6) | dedicated | — | **legacy** | — | None. THCV is on hold (not in the planned new assortment). No new THCV pages until real products exist. |

## Summary

| | Count |
|---|---:|
| Combinations with real products | **23** |
| Dedicated pages that exist | **16** in legacy data, of which **9** stay in the target (6 have membership errors: m-s-vapes, m-s-buds, thca-vapes, thca-carts, thca-blommor, thca-hash) and **7** are legacy taxonomy (HHCPM ×2, THCNM ×2, THCV ×2, 10-OH-THC ×1) |
| Proposed new dedicated | **1** (`m-s-hasch`), plus **1 optional** (`m-s-carts`) |
| Remain filters | **1** (Core × Vapes), plus Magic Sauce × Carts if you decline the option |
| Legacy (leaves/cleaned up at migration) | **8** (THCaB × Pre-rolls; HHCPM × Vapes/Buds, THCNM × Buds/Hasch → Core family; THCV × Vapes/Carts on hold; 10-OH-THC × Vapes ≠ D10) |
| Dormant | **1** (THCaB × Isolat) |
| New primary format page (not series × format) | **Pre-rolls** `/prerolled`, activated now |
| Remain hub shelves | **2** (Core × Buds, Core × Hasch; the Core family grows with High Life/El Gringo at `/core`) |

## Proposed copy for existing dedicated pages (they have no meta description today)

The JSON row of each dedicated combination holds a factual H1, intro, SEO title and description
following one pattern: H1 `{Serie} {Format}` (as Theme 8 already renders it),
intro `{Format} i {Serie}-serien, samlade på en sida.`, title `{Serie} {Format} | Hazey.se`.
None of it states effects or medical claims, and none of it includes counts (counts are read live).
These are optional SEO improvements, not part of the first admin batch.
