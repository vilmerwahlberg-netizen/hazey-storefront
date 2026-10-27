# Catalog migration checklist (Nyehandel → WooCommerce)

Final catalog decisions from 2026-10-27. The migration is expected within about 1–2 days.

## Current state vs target

| | Current state (legacy Nyehandel data) | Target (after the WooCommerce migration) |
|---|---|---|
| Pre-rolls | 4 legacy products (3 Cookies CBD, 1 Faraoh THCA Bangkok), all sold out, in the hidden `/prerolled` + Buds/CBD Buds/THCA Buds | Public **Pre-rolls** page `/prerolled` with the migrated pre-rolls; each one also in Buds *or* Hasch based on its contents |
| Isolat | 2 legacy products (THCA 99%, CBD 99%) in hidden `/isolat` + Buds/Hasch/THCA/CBD | No isolate products; `/isolat` dormant and unlinked |
| Header Pre-rolls | `href:null` ("kommer snart") | Live link to `/prerolled` |

The legacy products are **documentation only**. They do not drive page architecture, navigation or
rollout decisions. The Faraoh Bangkok question (flower or hash?) and the isolate memberships are
**resolved by the migration** and are **not blockers**.

## Rules for every future pre-roll

1. It always belongs to **Pre-rolls**.
2. It also belongs to **Buds** if it is made from flower/buds.
3. It also belongs to **Hasch** if it is made from hash.

The secondary placement comes from real product data or an explicit admin categorization, never from
"all pre-rolls are buds" or from name parsing in code. Product names and IDs are never hardcoded.

## Before the migration (can be done now, not blocked by stock)

- Publish/activate `/prerolled` with the customer name "Pre-rolls" (slug unchanged).
- Activate the header's Pre-rolls link (Task 04C-C code step, local commit, after your approval).
- Verify the page with the current data: 4 sold-out products give a truthful sold-out state, and no fake stock.

## Checklist

1. [ ] Publish/activate `/prerolled` with the customer name "Pre-rolls".
2. [ ] Activate the Pre-rolls link in the header.
3. [ ] Import the new pre-roll products, with no hardcoded legacy product IDs.
4. [ ] Check that every pre-roll is also assigned to Buds or Hasch based on its contents.
5. [ ] Remove or unpublish the legacy pre-rolls and isolate products.
6. [ ] Check that `/isolat` is not exposed in the navigation.
7. [ ] Check product counts, filters, breadcrumbs, canonical and the empty state after the migration.
8. [ ] Run a smoke test on mobile and desktop once the new products exist.

## Core family, THCV, D10 (final decisions 2026-10-27)

9. [ ] Assign the migrated High Life and El Gringo products to the Core family alongside the Core products. Destination: `/core`.
10. [ ] Do not recreate HHCPM/THCNM as series. Clean up the legacy categories (`/hhcpm`, `/thcnm` + their series × format routes, `hero-vapes`).
11. [ ] THCV: no THCV categories/pages unless real THCV products are in the new assortment.
12. [ ] D10: create/link the D10 category only for real Delta-10 products. Never reuse `/10-oh-thc` or `10-oh-thc-vapes`.
13. [ ] Post-migration code task: remove/remap Theme 8 header + catalog-map links to HHCPM/THCNM/THCV/10-OH-THC.
    Decide redirects/canonicals for old URLs based on actual use/indexing.

## Checks right after the migration

- `/prerolled`: H1 "Pre-rolls", count = real pre-rolls (0 is allowed and must show the empty state), self-canonical.
- `/blommor-buds`, `/hasch`: contain their pre-rolls only according to the secondary-placement rule (flower → Buds, hash → Hasch). No isolates. No stale legacy items.
- THCA Buds/Hash and CBD Buds: no legacy pre-rolls or isolates left.
- No visible link to `/isolat` (header, category navigation, hubs, footer, breadcrumbs of live products).
- `/core`: count includes the High Life/El Gringo products. No D10 link points to 10-OH-THC data. No auto-generated nav to HHCPM/THCNM/THCV.
- Re-run the Task 04 scripts (`inventory.mjs` → `membership.mjs` → `combos.mjs` → `build-matrix.mjs`)
  and diff `route-matrix.json`. Note that slugs/IDs may change if the WooCommerce import recreates categories.
