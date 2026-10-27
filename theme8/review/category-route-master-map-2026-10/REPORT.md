# TASK 04 — Report

- Status: **complete, stopped locally**. Read-only. No production CSS/JS, bundles,
  admin, categories, navigation, commit, push or publish were touched.
- Worktree: `../hazey-storefront-task04` (branch `audit/task-04-route-map` from local `dev` 8a7132e).
- Network: 56 category routes + 108 PDPs + facet GETs, sequential, 0 timeouts/retries.

## Totals by family (56 category routes + 4 non-category destinations)

| Family | Routes | Of which filtered/state |
|---|---:|---:|
| Alla produkter portal | 1 | — |
| Broad format | 6 (`alla-vapes`, `blommor-buds`, `hasch`, `alla-cartridges`, `prerolled` → Pre-rolls, `alla-vapes?serie=` state) | 1 |
| Series hub | 5 (`magic-sauce`, `thca`, `thcb`, `nano-11`, `core`) | — |
| Series × format | 11 (9 dedicated + 2 filtered Magic Sauce) | 2 |
| Legacy taxonomy (pending migration) | 11 (HHCPM ×3, THCNM ×3 → Core family; THCV ×3 on hold; 10-OH-THC ×2, not D10) | — |
| Cannabinoid family | 7 | — |
| Accessory/battery | 2 | — |
| Manufacturer/filter state | 6 (5 manufacturers + `alla-vapes?filters=Serie_Core`) | 1 |
| Legacy duplicate / dormant | 3 (`core-1`, `merch-ny`, `isolat` dormant) | — |
| Orphan/hidden structural | 4 (`hazey-v2`, `vapes-ny`, `buds-ny`, `hash-ny`) | — |
| Broken | 0 | — |
| Search / campaign-special | 1 / 2 (outside the category list) | — |

## Magic Sauce quartet: confirmed

- Vapes `m-s-vapes` and Buds `m-s-buds` are dedicated categories.
- Carts and Hasch are filtered broad pages (canonical → parent), **not** dedicated.
- New: both dedicated pages have wrong membership. M.S Vapes holds the cart, and
  M.S Buds holds both hash products and lacks La Chupacabra.
- A query string does not change the broad page family: verified on
  `hasch?filters=Serie_Magic Sauce` (pilot shell, H1 Allt Hasch).

## Current state vs target (final catalog decisions 2026-10-27)

- **Current state:** this audit describes legacy Nyehandel data. The 4 pre-rolls (all sold out) and 2 isolates
  are legacy and leave with the WooCommerce migration (about 1–2 days away). They are documented, but they do not drive decisions.
- **Target:** the migrated assortment. Pre-rolls get their own broad format page `/prerolled` ("Pre-rolls"), and the page and
  header link are activated now. Every future pre-roll is also in Buds (flower) or Hasch (hash) based on real data.
  Isolat is dormant and never linked.
- **Not blockers:** stock, the migration, the Faraoh Bangkok contents question (resolved by the migration) and the legacy
  isolate memberships (cleaned up in the migration).
- **Before/after the migration:** see `MIGRATION-CHECKLIST.md` (8 steps + post-migration checks).

## Legacy taxonomy (final decisions 2026-10-27)

- **HHCPM/THCNM** are legacy categories, not future series. High Life and El Gringo products join Core in **one Core family**
  at `/core`. Their routes are cleaned up at migration and must never auto-generate visible navigation.
- **THCV** is on hold (not in the planned new assortment). No new THCV pages.
- **D10 ≠ 10-OH-THC:** `/10-oh-thc` + `10-oh-thc-vapes` hold the legacy 10-OH-THC product. The D10 hub waits for real D10 products.
- Theme 8 code still links these routes (header, catalog map; D10 → 10-OH-THC). Fixing that is a post-migration code task, not done here.

## Missing / duplicate / broken

- Missing dedicated: Magic Sauce Hasch (2), Magic Sauce Carts (1). Real combinations without a route
  (Core buds/hasch → hub shelves; THCaB legacy pre-roll and isolate → leave with the migration) get no
  dedicated series × format page. Pre-rolls as a format gets its own page.
- Duplicates: `core-1` (empty), `merch-ny`; identical assortments `nano-11` = `nano11-blommor` (and legacy `10-oh-thc` = `10-oh-thc-vapes`).
- Hidden: the `hazey-v2` tree is every product's breadcrumb parent. `prerolled` holds 4 legacy
  products while the header says "kommer snart" (decided: becomes the public Pre-rolls page now). 2 THC-H vapes are reachable only via hidden `vapes-ny`.
- Broken: none. Every discovered destination returned 200.

## Admin blockers (detail in ADMIN-GAPS.md)

1. Membership fixes B1/B2/B4 (Magic Sauce buds/vapes, THCaB carts) before Batch A/C review.
2. Decision on `m-s-hasch` / `m-s-carts` (Task 04B worksheet).
3. Product main-category / hidden tree (affects every PDP breadcrumb).
4. Production-domain robots/SEO fields are unknown and need checking in admin.
5. Pre-rolls: publish `/prerolled` as "Pre-rolls" (not a blocker for code; stock and migration are irrelevant).
6. The carts-inside-vapes rule.

No longer blockers: the Faraoh Bangkok contents question (resolved by the migration) and the legacy isolates (cleaned up in the migration).

## Ready rollout batches

- **Batch A** (9 non-legacy dedicated series × format routes) is ready once 04A lands. It is verification
  only, because all routes already resolve to the series × format family.
- **Batch B**: Core is built (9d65a85) and is the shared Core-family destination. The D10 hub waits for real D10 products from
  the migration (never `/10-oh-thc`). HHCPM/THCNM are not hubs (legacy taxonomy → Core). THCV is on hold.
- **Batch C**: Magic Sauce Hasch/Carts are blocked on 04B + admin. **Pre-rolls is not blocked:** after you publish `/prerolled`,
  the page + header link can be built and activated now, regardless of stock or the migration.
- **Batch D**: blocked on Tasks 05–09.

## Unresolved decisions for you

1. Header "Core" link: `/core` hub, or keep the vapes filter?
2. Should the 1-product dedicated categories (`thca-carts`, `thcb-carts`) stay, or be consolidated?
3. ~~Pre-rolls/isolates~~: **finally decided 2026-10-27**. Pre-rolls get their own page; the header link goes live now;
   secondary Buds/Hasch membership comes from data; Isolat is dormant. No open sub-questions.
4. Do carts belong inside series *vapes* categories (`thca-vapes`, `m-s-vapes`, `h4cbd-vape`)?
5. `hero-vapes`: rename it, or split it?
6. ~~HHCPM/THCNM hubs~~: decided 2026-10-27. They are legacy taxonomy, and the Core family is at `/core`. Redirect/canonical for old URLs
   is decided after the migration.

## Evidence

`runs/inventory.json`, `runs/membership.json`, `runs/combos.json`, `shots/*.jpg` + `shots/shots.json`, `MIGRATION-CHECKLIST.md`
(10 representative/anomaly captures at 1440, external preview). Scripts: `inventory.mjs`,
`membership.mjs`, `combos.mjs`, `build-matrix.mjs`, `shots.mjs`.

Visual debt observed: `hero-vapes` legacy bento card renders an empty image area;
legacy-shell routes (cannabinoid, manufacturer, hidden, `core` in the external preview) still use the
older catshelf composition.
