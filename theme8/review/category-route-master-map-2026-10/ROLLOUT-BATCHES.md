# TASK 04 — Rollout batches

Every route in `route-matrix.json` has exactly one owner below. Batches follow
`needs-prep/task-04c-category-template-rollout/TASK.md`. Each batch is a separate local review unit.

## Controls (accepted, do not change in rollout)

| Route | Family | Role |
|---|---|---|
| `/alla-produkter` | portal | C07 control |
| `/alla-vapes` | broad (pilot) | broad-family control |
| `/blommor-buds`, `/hasch` | broad | 01G controls; filtered states must keep this shell (verified: `hasch?filters=Serie_Magic Sauce` → pilot shell, H1 Allt Hasch) |
| `/thca-vapes` | series × format | accepted THCaB pattern |
| `/magic-sauce` | series hub | hub pilot |

## Batch A — series × format template on existing dedicated routes (Task 04C-A)

Depends on: Task 04A (lower-page discovery axis). The admin membership fixes B1–B4 are recommended first,
otherwise the template will show wrong products.

| Route | Count | Size class | Note |
|---|---:|---|---|
| `m-s-vapes` | 2 | low | admin B2 |
| `m-s-buds` | 9 | normal | admin B1 (hash inside) |
| `thca-vapes` | 4 | normal | control; admin B3 |
| `thca-carts` | 1 | single | admin B4 |
| `thca-blommor` | 16 | large | legacy pre-roll/isolate inside (leave with migration) |
| `thca-hash` | 10 | normal | legacy isolate inside (leaves with migration) |
| `thcb-vapes` | 3 | low | — |
| `thcb-carts` | 1 | single | — |
| `nano11-blommor` | 8 | normal | same assortment as hub |

**Removed from Batch A (legacy taxonomy, 2026-10-27):** `10-oh-thc-vapes` (10-OH-THC, not D10), `thcv-vape`,
`thcv-carts` (THCV on hold), `hhcpm-vapes`, `hhcpm-blommor`, `thcnm-blommor`, `thcnm-hash` (HHCPM/THCNM →
Core family). No series × format pages are mass-produced from these. See "Legacy taxonomy" below.

According to the code (`06-catalog-map.js` `contextFor` → `sfMode` in `80-category.js`), all 9
resolve to the series × format family. The external preview confirmed `hz8-sf` on `m-s-vapes`,
`m-s-buds` and `thca-vapes`. Batch A means verifying them, not building new pages. The representatives for zero/one/normal/large are
`thca-carts` (1), `thcb-vapes` (3), `m-s-buds` (9) and `thca-blommor` (16). No real zero case exists.

## Batch B — series hubs (Task 04C-B, ready package)

| Route | Count | State in dev 8a7132e | Action |
|---|---:|---|---|
| `/magic-sauce` | 12 | hub pilot | control |
| `/thca` | 30 | hub pilot (ceb240a) | review |
| `/thcb` | 4 | hub pilot (ce18e40) | review |
| `/nano-11` | 8 | hub pilot (8a7132e) | review |
| `/core` | 4 | hub pilot (9d65a85 on dev) | review. **Target: the single Core-family destination** (Core + High Life + El Gringo); membership grows with the migration |
| D10 hub (future) | 0 real D10 | — | **waits** for real Delta-10 products + migrated category. Never built on `/10-oh-thc` (10-OH-THC legacy). Keep D10 hub material |

**Removed from Batch B:** `/hhcpm`, `/thcnm` (legacy taxonomy → Core family), `/thcv` (on hold),
`/10-oh-thc` (10-OH-THC legacy, not D10).

## Legacy taxonomy (no rollout; admin cleanup at migration)

| Routes | Status | Target |
|---|---|---|
| `/hhcpm`, `hhcpm-vapes`, `hhcpm-blommor`, `/thcnm`, `thcnm-blommor`, `thcnm-hash` | legacy categories | High Life/El Gringo products → Core family at `/core`. Other HHCPM items (Amnesia, Durban Poison, Canntropy vape) are legacy assortment |
| `/thcv`, `thcv-vape`, `thcv-carts` | legacy / on hold | No THCV pages until real THCV products exist in the new assortment |
| `/10-oh-thc`, `10-oh-thc-vapes` | 10-OH-THC legacy product | Not D10. Not a D10 data source or destination |
| `hero-vapes` | legacy Core-family grouping | Its products → Core family at `/core` |

Rules: these routes must never automatically generate visible navigation. Redirect/canonical from old URLs is
decided **after** the migration, based on which URLs are still used or indexed. Theme 8 code still links several of them
(header SERIER, `06-catalog-map.js`; D10 → `10-oh-thc`). That is a post-migration code task, not done here.

## Batch C — new series × format categories (after Task 04B + your admin work)

| Route now | Becomes | Gate |
|---|---|---|
| `hasch?filters=Serie_Magic Sauce` | proposed `/m-s-hasch` | 04B worksheet → you create category → Task 04C-C |
| `alla-cartridges?filters=Serie_Magic Sauce` | proposed `/m-s-carts`, or stays a filter | 04B decision (1 product) |
| hidden `/prerolled` | public **Pre-rolls** format page (customer name "Pre-rolls"), broad format family, page + header link activated now | you publish/rename in admin → Task 04C-C. **Not blocked** by stock or the migration; must be verified with 0/1/many/sold-out products |

Code work in Batch C: catalog map entries in `06-catalog-map.js` (Magic Sauce extras; a new
`prerolls` FORMAT_DEFS entry in the plant family), header links in `05-header.js` (Hasch → Magic Sauce;
Buds → Pre-rolls `href`, now `null`), the broad shell for `/prerolled` (`BROAD_SHELL_FORMATS`),
and verification against `m-s-vapes`/`m-s-buds`/`thca-vapes`/`blommor-buds`.

## Batch D — remaining families (after their task is ready)

| Task | Routes |
|---|---|
| Task 05 Alla Carts | `alla-cartridges` |
| Task 06 cannabinoid | `h4cbd`, `h4cbd-vape`, `cbd-buds`, `h4cbd-buds`, `h4cbd-hasch`, `cbn`, `cbn-vapes` |
| Task 07 accessories | `pennor`, `merch` |
| Task 08 manufacturer/filter | `hero-vapes`, `faraoh`, `tatra-hemp`, `magic-farmers`, `cbd-group`, `alla-vapes?filters=Serie_Core`, `alla-vapes?serie=…` (Theme 8 state), all `?filters=Varumärke_…` states |
| Task 09 search | `/sv/search?query=` |
| Task 11 | `/sv/page/vara-bastsaljare` |

## Admin-only (no template work until decided)

`core-1`, `merch-ny`, `hazey-v2`, `vapes-ny`, `buds-ny`, `hash-ny`.

## Dormant: no work, no links

`/isolat` stays hidden and unlinked until a real isolate product exists. The 2 legacy isolates leave
with the migration. No Isolat template, catalog-map entry or nav item.

## Migration (not a batch, not a blocker)

The WooCommerce migration replaces the legacy pre-rolls/isolates. Run `MIGRATION-CHECKLIST.md`
steps 3–8 when it lands, then re-run the Task 04 scripts.

## Shortest critical path

1. You: admin fixes B1, B2, B4 (minutes in Nyehandel), the 04B decision on `m-s-hasch`/`m-s-carts`,
   and publishing `/prerolled` as "Pre-rolls".
2. Task 04A (discovery axis), running in parallel with step 1 because it doesn't depend on admin.
3. Task 04C-A verification of the 9 non-legacy dedicated series × format routes.
4. Task 04C-B: review Core (built). D10 waits for migration data. HHCPM/THCNM/THCV are not hubs.
5. Task 04C-C connects `m-s-hasch` (and `m-s-carts` if created) and the Pre-rolls page.
6. Tasks 05–09 → Batch D.
7. After the migration: re-run the inventory, add the High Life/El Gringo products to the Core family, then the post-migration code task removes/remaps legacy nav links (HHCPM/THCNM/THCV/10-OH-THC) and decides redirects/canonicals.
