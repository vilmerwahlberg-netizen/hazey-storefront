# TASK 04 — Category route master map

- Generated: 2026-10-27, read-only. Data: live `hazeyse.nyehandel.se` (native HTML,
  `GET /frontend-api/products/filters`, PDP BreadcrumbList), Theme 8 at `dev` 8a7132e,
  external Theme 8 preview screenshots (`shots/`).
- Machine-readable: `route-matrix.json` (schema `hazey.task04.route-matrix/1`).
- Reproduce: `node inventory.mjs /sv/categories/core /sv/categories/core-1 && node membership.mjs && node combos.mjs && node build-matrix.mjs`
  (`shots.mjs` optional; needs Playwright, see header comment).

## Catalog decisions (final, 2026-10-27): current state vs target

This matrix describes the **current state = legacy Nyehandel data**. The **target** is the assortment after
the WooCommerce migration (about 1–2 days away). The current pre-rolls and isolate products are legacy: they are documented
here, but they do not drive page architecture, navigation or rollout decisions. See `MIGRATION-CHECKLIST.md`.

1. **Pre-rolls:** own broad format page `/prerolled` (slug kept, customer name "Pre-rolls"). The page
   and header link are activated **now**. Stock levels and the migration are **not blockers**. The page must handle
   0, 1, many, sold-out and newly migrated products from live data, with no hardcoded names or IDs.
2. **Secondary placement:** every future pre-roll is also in Buds (flower-based) or Hasch (hash-based),
   based on real product data or explicit admin categorization. Pre-rolls are never automatically classified as Buds.
   The 4 legacy pre-rolls (incl. Faraoh Bangkok) need no further investigation: **resolved by the migration**.
3. **Isolat:** dormant. No page, and no link in the header, category navigation, hubs or other visible paths
   (verified: none exists today; `/isolat` is reachable only via legacy PDP breadcrumbs). The 2 legacy isolates and their wrong
   memberships in Buds/Hasch/THCA/CBD disappear with the migration. Isolat is reactivated only if a real product arrives.

4. **Core family:** the legacy Nyehandel categories `HHCPM` and `THCNM` are legacy taxonomy, not future series.
   High Life and El Gringo products belong with Core in one **Core family**. The target customer destination is
   `/core`. HHCPM/THCNM routes (hub + series × format) are cleaned up at migration. They must never automatically generate
   visible navigation. Redirect/canonical is decided **after** the migration, based on which URLs are still used or indexed.
   Current candidates (legacy grouping `hero-vapes`): White Widow, GSC, Black Widow, Royal Gorilla, Malaga Magic,
   Northern Lights, Wedding Cake, Core vape. Non-family legacy items: HHCPM Amnesia, Durban Poison, Canntropy HHCPM vape.
5. **THCV:** not in the planned new assortment. `/thcv`, `thcv-vape` and `thcv-carts` are legacy/on hold. Build or expose no
   new THCV page until real products exist.
6. **D10 ≠ 10-OH-THC:** `/10-oh-thc` and `/10-oh-thc-vapes` hold the legacy 10-OH-THC product. They are not a data
   source or destination for Delta-10. The D10 hub waits for the real products and the migrated category; D10 hub
   material is kept for that future page.
7. **Theme 8 code debt (not changed here):** the header and `06-catalog-map.js` still link HHCPM, THCNM, THCV and D10
   (D10 → `10-oh-thc`, `10-oh-thc-vapes`). A later, post-migration code task must remove or remap these links.

## How routes were discovered (no URL guessing)

1. Native DOM category links on `/`, Alla produkter, `/sv/page/kampanjer`,
   `/sv/page/vara-bastsaljare`, then BFS over every discovered category page.
2. Theme 8 sources: `05-header.js` hrefs, `06-catalog-map.js` hubs/extras.
3. Breadcrumbs (JSON-LD) on all 108 product pages → hidden `hazey-v2` tree.
4. Human-verified seeds: `/core` (new Core hub) and its duplicate `/core-1`.

All 56 category routes answered HTTP 200 on first attempt (0 timeouts, 0 retries).
No 404/redirect was found among discovered destinations, so the "broken route"
family is empty; problems are membership, labelling, duplication and hidden routes.

## Facts that apply to every route

- **Canonical:** every route is self-canonical by pathname; filtered URLs
  (`?filters=…`) canonicalize to their parent (e.g. `hasch?filters=Serie_Magic Sauce`
  → `/sv/categories/hasch`). Nyehandel does this automatically.
- **Robots:** every route on the `hazeyse.nyehandel.se` host returns
  `noindex, nofollow`, including Alla produkter and search. Whether the production
  domain differs is **unknown**. Verify in Nyehandel admin before any SEO decision.
- **Title tag** = native category name only (e.g. `M.S Vapes`). Most series ×
  format, hub and manufacturer routes have **no meta description**. Broad and
  cannabinoid routes carry long legacy SEO copy (not audited for brand-voice compliance here).
- **Native Serie attribute** has exactly three values: `Magic Sauce`, `Core`,
  `Nano11`. THCaB, THCbA, D10, THCV, HHCPM and THCNM exist only as categories.
- **Theme 8 H1:** the series × format template rewrites the visible H1 (e.g.
  native `M.S Vapes` → `Magic Sauce Vapes`, `THCA Vapes` → `THCaB Vapes`); the
  native title tag is unchanged.
- **Link sources:** the native navbar DOM, which Theme 8 replaces visually but which
  stays crawlable, links 43 routes. The Theme 8 header links 27. The Theme 8 catalog map
  feeds hub format shelves, series × format sibling discovery and broad-page
  series tabs. No category route is linked from the footer.

## Magic Sauce quartet (verified)

| Label | Destination | Kind | H1 native/Theme 8 | Count | Real members | Verdict |
|---|---|---|---|---:|---:|---|
| Vapes | `/sv/categories/m-s-vapes` | dedicated category id 45 | M.S Vapes / Magic Sauce Vapes | 2 | 1 vape | dedicated, but **also contains the Magic Sauce cart** |
| Buds | `/sv/categories/m-s-buds` | dedicated category id 34 | M.S Buds / Magic Sauce Buds | 9 | 8 buds | dedicated, but **contains both Magic Sauce hash products and lacks La Chupacabra** |
| Carts | `/sv/categories/alla-cartridges?filters=Serie_Magic Sauce` | filtered broad (Alla Carts, id 22) | Alla Carts | 1 | 1 cart | **not dedicated**; canonical → `/alla-cartridges` |
| Hasch | `/sv/categories/hasch?filters=Serie_Magic Sauce` | filtered broad (Allt Hasch, id 18) | Allt Hasch | 2 | 2 hash | **not dedicated**; canonical → `/hasch`; Theme 8 correctly keeps broad shell |

The Theme 8 header's Magic Sauce link under Vapes has `href=m-s-vapes`, but
its `navHref` is `alla-vapes?serie=magic-sauce`. The server ignores `?serie=`
and returns 24 products; Theme 8 filters them client-side.

## Matrix (current state, legacy data)

### Alla produkter portal (1)

| Route | Kind | Native H1 → Theme 8 H1 | Count | Canonical | Theme 8 family now | Desired template | Control | Sources | Admin gap | Debt | Batch |
|---|---|---|---:|---|---|---|---|---|---|---|---|
| `alla-produkter` | dedicated | Alla produkter | 104 | self | portal | Alla produkter portal (C07) | self | Theme 8 header; native navbar DOM (visually replaced by Theme 8 header); PDP breadcrumb | Fraktändring is a listed product; 2 THCA products missing from category | non-product in grid | control (C07 done) |

### broad format (6)

| Route | Kind | Native H1 → Theme 8 H1 | Count | Canonical | Theme 8 family now | Desired template | Control | Sources | Admin gap | Debt | Batch |
|---|---|---|---:|---|---|---|---|---|---|---|---|
| `alla-vapes` | dedicated | Alla Vapes | 24 | self | vapes-pilot | broad format family (Alla Vapes macro, 01G) | self (pilot) | Theme 8 header; native navbar DOM (visually replaced by Theme 8 header) | — | — | control |
| `blommor-buds` | dedicated | Alla Buds | 54 | self | broad | broad format family (Alla Vapes macro, 01G) | self | Theme 8 header; native navbar DOM (visually replaced by Theme 8 header) | NOW (legacy Nyehandel): 4 legacy pre-rolls, 2 legacy isolates and 1 hash (CBN Yellowstone) listed; the pre-rolls/isolates leave with the WooCommerce migration. TARGET: Buds holds buds + buds-based pre-rolls (secondary) | off-format legacy products | Batch A control |
| `hasch` | dedicated | Allt Hasch | 16 | self | broad | broad format family (Alla Vapes macro, 01G) | /blommor-buds | Theme 8 header; native navbar DOM (visually replaced by Theme 8 header) | NOW (legacy): 2 legacy isolates listed, leaving with the migration. TARGET: Hasch holds hash + hash-based pre-rolls (secondary) | — | Batch A control |
| `alla-vapes?serie=magic-sauce` | Theme 8 client state | Alla Vapes | 24 | `/sv/categories/alla-vapes` | vapes-pilot | broad format family (Alla Vapes macro, 01G) | /alla-vapes | Theme 8 header | — | server ignores ?serie= (count 24); header navHref only | Task 08 (state contract) |
| `alla-cartridges` | dedicated | Alla Carts | 7 | self | format-legacy (nav=format) | broad format family — Carts adaptation (Task 05) | /alla-vapes | Theme 8 header; native navbar DOM (visually replaced by Theme 8 header) | — | not in accepted broad family | Task 05 → Batch D |
| `prerolled` | dedicated (activate now) | PreRolled | 4 | self | legacy-shell | broad format family (Alla Vapes macro, 01G) — Pre-rolls adaptation (0/1/many/sold-out/new products, data-driven) | /blommor-buds | PDP breadcrumb | hidden today; header shows Pre-rolls as 'kommer snart' (href null) | must render a truthful empty state (likely 0 products right after migration) | Batch C — activate page + header link now; migration/stock NOT a blocker |

### series hub (5)

| Route | Kind | Native H1 → Theme 8 H1 | Count | Canonical | Theme 8 family now | Desired template | Control | Sources | Admin gap | Debt | Batch |
|---|---|---|---:|---|---|---|---|---|---|---|---|
| `magic-sauce` | dedicated | Magic Sauce | 12 | self | hub-pilot | series hub system (Magic Sauce pilot, 04C-B) | self (pilot) | Theme 8 catalog map (hub/extra); native navbar DOM (visually replaced by Theme 8 header) | — | — | Batch B control |
| `thca` | dedicated | THC-A | 30 | self | hub-pilot | series hub system (Magic Sauce pilot, 04C-B) | /magic-sauce | Theme 8 catalog map (hub/extra); native navbar DOM (visually replaced by Theme 8 header) | — | — | Batch B (done ceb240a, review) |
| `thcb` | dedicated | THC-B | 4 | self | hub-pilot | series hub system (Magic Sauce pilot, 04C-B) | /magic-sauce | Theme 8 catalog map (hub/extra); native navbar DOM (visually replaced by Theme 8 header) | — | — | Batch B (done ce18e40, review) |
| `nano-11` | dedicated | Nano-11 | 8 | self | hub-pilot | series hub system (Magic Sauce pilot, 04C-B) | /magic-sauce | Theme 8 catalog map (hub/extra); native navbar DOM (visually replaced by Theme 8 header) | — | — | Batch B (done 8a7132e, review) |
| `core` | dedicated | Core | 4 | self | hub-pilot (committed 9d65a85 on dev) | series hub system (Magic Sauce pilot, 04C-B) | /magic-sauce | self-link only; human-verified seed | NOW: 4 products (Core vape, Wedding Cake, Malaga Magic, Northern Lights); legacy hero-vapes groups 8 family candidates; duplicate /core-1 | — | Batch B (built; review); membership grows at migration |

### series × format (11)

| Route | Kind | Native H1 → Theme 8 H1 | Count | Canonical | Theme 8 family now | Desired template | Control | Sources | Admin gap | Debt | Batch |
|---|---|---|---:|---|---|---|---|---|---|---|---|
| `m-s-vapes` | dedicated | M.S Vapes → Magic Sauce Vapes | 2 | self | series-format | series × format template (C04/80b) | /thca-vapes | Theme 8 header; native navbar DOM (visually replaced by Theme 8 header) | contains the Magic Sauce cart (off-format) | 2 products, 1 is a cart | Batch A (control) |
| `thca-vapes` | dedicated | THCA Vapes → THCaB Vapes | 4 | self | series-format | series × format template (C04/80b) | self (accepted THCaB control) | Theme 8 header; native navbar DOM (visually replaced by Theme 8 header) | contains 1 cart (THC-A 45%) | off-format product | Batch A control |
| `thcb-vapes` | dedicated | THCB Vapes | 3 | self | series-format | series × format template (C04/80b) | /thca-vapes | Theme 8 header; native navbar DOM (visually replaced by Theme 8 header) | — | — | Batch A |
| `m-s-buds` | dedicated | M.S Buds → Magic Sauce Buds | 9 | self | series-format | series × format template (C04/80b) | /thca-vapes | Theme 8 header; native navbar DOM (visually replaced by Theme 8 header) | contains 2 Magic Sauce hash; missing La Chupacabra | wrong membership | Batch A (after admin fix) |
| `thca-blommor` | dedicated | THCA Buds | 16 | self | series-format | series × format template (C04/80b) | /thca-vapes | Theme 8 header; native navbar DOM (visually replaced by Theme 8 header) | NOW (legacy): legacy pre-roll Bangkok + legacy THCA isolate listed; both leave with the migration (no investigation needed) | legacy off-format products | Batch A |
| `nano11-blommor` | dedicated | Nano11 Buds | 8 | self | series-format | series × format template (C04/80b) | /thca-vapes | Theme 8 header; native navbar DOM (visually replaced by Theme 8 header) | — | identical assortment to /nano-11 hub (8/8) | Batch A |
| `hasch?filters=Serie_Magic Sauce` | filtered/shared (NOT dedicated) | Allt Hasch | 2 | `/sv/categories/hasch` | broad (correct, filter chip) | broad format family (Alla Vapes macro, 01G) until dedicated route exists | /hasch | Theme 8 header | dedicated category missing; products currently filed in m-s-buds | — | Batch C after 04B admin |
| `thca-hash` | dedicated | THCA Hash | 10 | self | series-format | series × format template (C04/80b) | /thca-vapes | Theme 8 header; native navbar DOM (visually replaced by Theme 8 header) | NOW (legacy): legacy THCA isolate listed; leaves with the migration | legacy off-format product | Batch A |
| `alla-cartridges?filters=Serie_Magic Sauce` | filtered/shared (NOT dedicated) | Alla Carts | 1 | `/sv/categories/alla-cartridges` | format-legacy (filter) | broad format family — Carts adaptation (Task 05) | /alla-cartridges | Theme 8 catalog map (hub/extra) | Magic Sauce cart also filed in m-s-vapes | 1 product | Batch C (only if 04B approves) else Task 08 |
| `thca-carts` | dedicated | THCA Carts | 1 | self | series-format | series × format template (C04/80b) | /thca-vapes | Theme 8 catalog map (hub/extra); native navbar DOM (visually replaced by Theme 8 header) | missing THC-A 50% Live Resin cart | 1 product (thin) | Batch A |
| `thcb-carts` | dedicated | THCB Carts | 1 | self | series-format | series × format template (C04/80b) | /thca-vapes | Theme 8 catalog map (hub/extra); native navbar DOM (visually replaced by Theme 8 header) | — | 1 product (thin) | Batch A |

### cannabinoid family (7)

| Route | Kind | Native H1 → Theme 8 H1 | Count | Canonical | Theme 8 family now | Desired template | Control | Sources | Admin gap | Debt | Batch |
|---|---|---|---:|---|---|---|---|---|---|---|---|
| `h4cbd` | dedicated | H4CBD | 29 | self | legacy-shell | cannabinoid family (Task 06 decision) | — | Theme 8 header; native navbar DOM (visually replaced by Theme 8 header) | H1 'H4CBD' vs header label 'CBD' | legacy description copy | Task 06 → Batch D |
| `cbn` | dedicated | CBN | 8 | self | legacy-shell | cannabinoid family (Task 06 decision) | — | Theme 8 header; native navbar DOM (visually replaced by Theme 8 header) | also holds CBG9 product (CBG has no route) | legacy description copy | Task 06 → Batch D |
| `cbd-buds` | dedicated | CBD Buds | 15 | self | legacy-shell | cannabinoid family (Task 06 decision) | — | Theme 8 header; native navbar DOM (visually replaced by Theme 8 header) | NOW (legacy): 3 legacy pre-rolls + 1 legacy isolate (leave with migration); 1 hash (Primero) misfiled | off-format products | Task 06 → Batch D |
| `h4cbd-hasch` | dedicated | H4CBD Hasch | 1 | self | legacy-shell | cannabinoid family (Task 06 decision) | — | Theme 8 header; native navbar DOM (visually replaced by Theme 8 header) | 1 product | single-item | Task 06 → Batch D |
| `h4cbd-vape` | dedicated | H4CBD Vapes | 9 | self | legacy-shell | cannabinoid family (Task 06 decision) | — | Theme 8 header; native navbar DOM (visually replaced by Theme 8 header) | contains 2 CBD carts (off-format); slug singular | — | Task 06 → Batch D |
| `cbn-vapes` | dedicated | CBN Vapes | 3 | self | legacy-shell | cannabinoid family (Task 06 decision) | — | native navbar DOM (visually replaced by Theme 8 header) | not in Theme 8 header | — | Task 06 → Batch D |
| `h4cbd-buds` | dedicated | H4CBD Buds | 1 | self | legacy-shell | cannabinoid family (Task 06 decision) | — | native navbar DOM (visually replaced by Theme 8 header) | overlaps cbd-buds; 1 product | single-item | Task 06 → Batch D |

### accessory/battery (2)

| Route | Kind | Native H1 → Theme 8 H1 | Count | Canonical | Theme 8 family now | Desired template | Control | Sources | Admin gap | Debt | Batch |
|---|---|---|---:|---|---|---|---|---|---|---|---|
| `pennor` | dedicated | Pennor/Batteri | 6 | self | format-legacy (nav=format) | accessory/battery template (Task 07) | — | Theme 8 header; native navbar DOM (visually replaced by Theme 8 header) | H1 'Pennor/Batteri' is legacy wording | — | Task 07 → Batch D |
| `merch` | dedicated | Merch | 1 | self | legacy-shell | accessory/battery template (Task 07) | — | native navbar DOM (visually replaced by Theme 8 header) | 1 product; duplicate of merch-ny | single-item | Task 07 → Batch D |

### manufacturer/filter state (6)

| Route | Kind | Native H1 → Theme 8 H1 | Count | Canonical | Theme 8 family now | Desired template | Control | Sources | Admin gap | Debt | Batch |
|---|---|---|---:|---|---|---|---|---|---|---|---|
| `alla-vapes?filters=Serie_Core` | filtered/shared | Alla Vapes | 1 | `/sv/categories/alla-vapes` | vapes-pilot (rewritten to ?serie=core) | broad format family (Alla Vapes macro, 01G) | /alla-vapes | Theme 8 header | decide header Core target: /core hub vs vapes filter | 1 product | Task 08; header link decision in 04A/04C |
| `hero-vapes` | dedicated | Hero Vapes | 8 | self | legacy-shell | manufacturer/filter-state contract (Task 08) | — | native navbar DOM (visually replaced by Theme 8 header) | H1/slug 'Hero Vapes' but 7 of 8 are High Life/El Gringo buds/hash; all 8 are Core-family candidates (White Widow, GSC, Black Widow, Royal Gorilla, Malaga Magic, Northern Lights, Wedding Cake, Core vape) | misleading H1; empty bento image | admin cleanup at migration; family → /core |
| `faraoh` | dedicated | Faraoh | 8 | self | legacy-shell | manufacturer/filter-state contract (Task 08) | — | native navbar DOM (visually replaced by Theme 8 header) | — | — | Task 08 → Batch D |
| `tatra-hemp` | dedicated | Tatra Hemp | 16 | self | legacy-shell | manufacturer/filter-state contract (Task 08) | — | native navbar DOM (visually replaced by Theme 8 header) | — | — | Task 08 → Batch D |
| `magic-farmers` | dedicated | Magic Farmers | 18 | self | legacy-shell | manufacturer/filter-state contract (Task 08) | — | native navbar DOM (visually replaced by Theme 8 header) | — | — | Task 08 → Batch D |
| `cbd-group` | dedicated | CBD Group | 2 | self | legacy-shell | manufacturer/filter-state contract (Task 08) | — | native navbar DOM (visually replaced by Theme 8 header) | — | — | Task 08 → Batch D |

### legacy duplicate (3)

| Route | Kind | Native H1 → Theme 8 H1 | Count | Canonical | Theme 8 family now | Desired template | Control | Sources | Admin gap | Debt | Batch |
|---|---|---|---:|---|---|---|---|---|---|---|---|
| `core-1` | dedicated (empty) | Core | 0 | self | legacy-shell | none — not a customer destination | — | self-link only; human-verified seed | empty duplicate of /core: hide/delete/redirect | 0 products | admin cleanup |
| `isolat` | dormant | Isolat | 2 | self | legacy-shell | none — not a customer destination (dormant; reactivate only when a real isolate product exists) | — | PDP breadcrumb | NOW (legacy): 2 legacy isolates leave with the migration; their extra memberships in Buds/Hasch/THCA/CBD disappear with them. Never link /isolat | no visible Theme 8/native nav link (verified) | none (dormant) |
| `merch-ny` | structural (hidden) | Merch | 1 | self | legacy-shell | none — not a customer destination | — | PDP breadcrumb | duplicate of /merch | — | admin cleanup |

### legacy taxonomy (pending migration) (11)

| Route | Kind | Native H1 → Theme 8 H1 | Count | Canonical | Theme 8 family now | Desired template | Control | Sources | Admin gap | Debt | Batch |
|---|---|---|---:|---|---|---|---|---|---|---|---|
| `10-oh-thc-vapes` | legacy product category | 10-OH-THC Vapes | 1 | self | series-format | none — not a customer destination (not a D10 destination) | — | Theme 8 header; native navbar DOM (visually replaced by Theme 8 header) | must not be used for Delta-10 | header D10 link currently points here (code debt, later task) | on hold (removed from Batch A) |
| `thcv-vape` | legacy / on hold | THCV Vapes | 6 | self | series-format | none — not a customer destination (on hold until real THCV products exist in the new assortment) | — | Theme 8 header; native navbar DOM (visually replaced by Theme 8 header) | build/expose no new THCV pages; never auto-generate visible nav from this route; redirect/canonical decided after migration | currently linked by Theme 8 header/catalog map (code debt, later task) | on hold (removed from Batch A/B) |
| `hhcpm-vapes` | legacy category | HHCPM Vapes | 1 | self | series-format | none — not a customer destination (do not mass-produce series × format pages) | — | Theme 8 header; native navbar DOM (visually replaced by Theme 8 header) | Canntropy HHCPM vape: legacy, not Core family; never auto-generate visible nav from this route; redirect/canonical decided after migration | currently in Theme 8 header SERIER (code debt, later task) | admin cleanup at migration (removed from Batch A) |
| `hhcpm-blommor` | legacy category | HHCPM Buds | 3 | self | series-format | none — not a customer destination (do not mass-produce series × format pages) | — | Theme 8 header; native navbar DOM (visually replaced by Theme 8 header) | Wedding Cake → Core family; Amnesia/Durban Poison legacy; never auto-generate visible nav from this route; redirect/canonical decided after migration | currently in Theme 8 header SERIER (code debt, later task) | admin cleanup at migration (removed from Batch A) |
| `thcnm-blommor` | legacy category | THCNM Buds | 2 | self | series-format | none — not a customer destination (do not mass-produce series × format pages) | — | Theme 8 header; native navbar DOM (visually replaced by Theme 8 header) | GSC + Black Widow (High Life) → Core family candidates; never auto-generate visible nav from this route; redirect/canonical decided after migration | currently in Theme 8 header SERIER (code debt, later task) | admin cleanup at migration (removed from Batch A) |
| `thcnm-hash` | legacy category | THCNM Hash | 2 | self | series-format | none — not a customer destination (do not mass-produce series × format pages) | — | Theme 8 header; native navbar DOM (visually replaced by Theme 8 header) | Malaga Magic (High Life) + Royal Gorilla (hero-vapes grouping) → Core family candidates; never auto-generate visible nav from this route; redirect/canonical decided after migration | currently in Theme 8 header SERIER (code debt, later task) | admin cleanup at migration (removed from Batch A) |
| `10-oh-thc` | legacy product category | 10-OH-THC | 1 | self | hub-legacy | none — not a customer destination (D10 hub waits for real D10 products + migrated category) | — | Theme 8 catalog map (hub/extra); native navbar DOM (visually replaced by Theme 8 header) | must not be the data source or customer destination for D10; keep D10 hub material for the future page | Theme 8 catalog map currently maps D10 hub → /10-oh-thc and header D10 → 10-oh-thc-vapes (code debt, later task) | on hold: D10 hub after migration (removed from Batch B) |
| `thcv` | legacy / on hold | THC-V | 7 | self | hub-legacy | none — not a customer destination (on hold until real THCV products exist in the new assortment) | — | Theme 8 catalog map (hub/extra); native navbar DOM (visually replaced by Theme 8 header) | build/expose no new THCV pages; never auto-generate visible nav from this route; redirect/canonical decided after migration | currently linked by Theme 8 header/catalog map (code debt, later task) | on hold (removed from Batch A/B) |
| `hhcpm` | legacy category | HHCPM | 4 | self | hub-legacy | none — not a customer destination (no hub; Core family relevant products → /core) | — | Theme 8 catalog map (hub/extra); native navbar DOM (visually replaced by Theme 8 header) | Wedding Cake (El Gringo packaging) → Core family; Amnesia/Durban Poison (Blommor HHCPM 15%) and Canntropy HHCPM vape are not Core-family legacy items; never auto-generate visible nav from this route; redirect/canonical decided after migration | currently linked by Theme 8 header/catalog map (code debt, later task) | admin cleanup at migration (removed from Batch B) |
| `thcnm` | legacy category | THC-NM | 4 | self | hub-legacy | none — not a customer destination (no hub; Core family → /core) | — | Theme 8 catalog map (hub/extra); native navbar DOM (visually replaced by Theme 8 header) | all 4 are Core-family candidates: GSC (HighLife in name), Black Widow and Malaga Magic (High Life packaging observed), Royal Gorilla (grouped in legacy hero-vapes); final membership from migration data; never auto-generate visible nav from this route; redirect/canonical decided after migration | currently linked by Theme 8 header/catalog map (code debt, later task) | admin cleanup at migration (removed from Batch B) |
| `thcv-carts` | legacy / on hold | THCV Carts | 1 | self | series-format | none — not a customer destination (on hold until real THCV products exist in the new assortment) | — | Theme 8 catalog map (hub/extra); native navbar DOM (visually replaced by Theme 8 header) | build/expose no new THCV pages; never auto-generate visible nav from this route; redirect/canonical decided after migration | currently linked by Theme 8 header/catalog map (code debt, later task) | on hold (removed from Batch A/B) |

### orphan (4)

| Route | Kind | Native H1 → Theme 8 H1 | Count | Canonical | Theme 8 family now | Desired template | Control | Sources | Admin gap | Debt | Batch |
|---|---|---|---:|---|---|---|---|---|---|---|---|
| `hazey-v2` | structural (hidden) | Hazey V2 | 0 | self | legacy-shell | none — not a customer destination | — | PDP breadcrumb | PDP breadcrumb exposes hidden tree | 0 products | admin decision |
| `hash-ny` | structural (hidden) | Hash | 14 | self | legacy-shell | none — not a customer destination | — | PDP breadcrumb | PDP breadcrumb link to hidden page | — | admin decision |
| `buds-ny` | structural (hidden) | Buds | 47 | self | legacy-shell | none — not a customer destination | — | PDP breadcrumb | PDP breadcrumb link to hidden page | — | admin decision |
| `vapes-ny` | structural (hidden) | Vapes | 39 | self | legacy-shell | none — not a customer destination | — | PDP breadcrumb | holds 2 THC-H vapes found nowhere else | — | admin decision |

### Non-category destinations

| Route | Family | H1 | Canonical/robots | Desired template | Batch |
|---|---|---|---|---|---|
| `/sv/search?query={q}` | search result | none in server HTML | `/sv/search`, noindex | Task 09 | Task 09 → Batch D |
| `/sv/categories/alla-produkter?typ=…&q=…` | portal client state | Alla produkter | parent | C07 portal | control |
| `/sv/page/kampanjer` | campaign/special | native page | — | outside category scope | — |
| `/sv/page/vara-bastsaljare` | campaign/special | native page | — | Task 11 | Task 11 |

## Series × format coverage (real products → destination)

Membership is taken from the series' own hub category or the native Serie attribute.
Format is read from Nyehandel's product-name type prefix. Full lists are in `runs/combos.json`.

| Series | Vapes | Carts | Buds | Hasch | Pre-rolls | Isolat |
|---|---|---|---|---|---|---|
| Magic Sauce | 1 → `m-s-vapes` ✱ | 1 → filter | 8 → `m-s-buds` ✱ | 2 → filter | — | — |
| THCaB | 3 → `thca-vapes` ✱ | 2 → `thca-carts` (has 1) | 14 → `thca-blommor` ✱ | 9 → `thca-hash` ✱ | 1 legacy → leaves at migration | 1 legacy → leaves at migration (Isolat dormant) |
| THCbA | 3 → `thcb-vapes` | 1 → `thcb-carts` | — | — | — | — |
| Core | 1 → `alla-vapes?filters=Serie_Core` | — | 1 → none (hub only) | 2 → none (hub only) | — | — |
| D10 | 0 (target). Today: 1 *10-OH-THC* legacy product in `10-oh-thc-vapes`, **not D10** | — | — | — | — | — |
| Nano-11 | — | — | 8 → `nano11-blommor` | — | — | — |
| THCV (on hold) | 6 legacy → `thcv-vape` | 1 legacy → `thcv-carts` | — | — | — | — |
| HHCPM (legacy taxonomy) | 1 legacy → `hhcpm-vapes` | — | 3 legacy → `hhcpm-blommor` (1 → Core family) | — | — | — |
| THCNM (legacy taxonomy) | — | — | 2 legacy → `thcnm-blommor` (→ Core family) | 2 legacy → `thcnm-hash` (→ Core family) | — | — |

✱ = membership error (off-format product inside, or real member missing). Pre-roll/isolate entries are legacy data. Details are in `ADMIN-GAPS.md`.
