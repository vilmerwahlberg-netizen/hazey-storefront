
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
