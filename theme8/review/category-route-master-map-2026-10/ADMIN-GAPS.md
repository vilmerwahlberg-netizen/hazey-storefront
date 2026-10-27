# TASK 04 — Admin gaps (missing, duplicate, membership, SEO)

Read-only findings. Nothing has been changed in Nyehandel. Each item says who must act.

**Current state vs target:** findings describe legacy Nyehandel data. The WooCommerce migration (about 1–2 days away)
is the target. Legacy pre-rolls and isolates are documented, but they are **not blockers** and do not drive decisions.
See `MIGRATION-CHECKLIST.md`.
"Confirmed" means it was observed in live data on 2026-10-27; "Recommendation" is a proposal awaiting your decision.

## A. Missing dedicated series × format categories

| # | Combination | Real products | Current destination | Confirmed | Recommendation |
|---|---|---:|---|---|---|
| A1 | Magic Sauce × Hasch | 2 (Charas, Marrakesh Dream) | `hasch?filters=Serie_Magic Sauce` | filtered broad, not dedicated | Worksheet in Task 04B (first admin batch) |
| A2 | Magic Sauce × Carts | 1 (Cart – Magic Sauce 99% – 1ml) | `alla-cartridges?filters=Serie_Magic Sauce` | filtered broad, not dedicated | Task 04B decides; it is thin at 1 product |
| A3 | Core × Buds / Core × Hasch | 1 / 2 (today) | only via `/core` hub | no route | Keep as hub shelves. Target: the Core family (Core + High Life + El Gringo) gathered at `/core`; grows with the migration |
| A4 | Pre-rolls (primary format) | current: 4 legacy, sold out; target: migrated pre-rolls | hidden `/prerolled` | exists but hidden; header says *kommer snart* | **Before migration:** publish `/prerolled` as "Pre-rolls" and activate the header link now. Not blocked by stock or migration |
| A5 | THCaB × Pre-rolls | 1 legacy | none | no route | Leaves with the migration. Future series × pre-roll pages only on real, stable assortment |
| A6 | Isolat | 2 legacy | hidden `/isolat` | dormant | No page, no link. Leaves with the migration |

## B. Wrong membership in existing categories (admin product↔category links)

| # | Category | Problem (confirmed) | Admin action |
|---|---|---|---|
| B1 | `m-s-buds` (M.S Buds) | Contains **Hash – Magic Sauce 50% – Charas** and **– Marrakesh Dream**; missing **Buds – Magic Sauce 50% – La Chupacabra – 5 gram** | Add La Chupacabra; move both hash products out (to `m-s-hasch` if A1 is approved) |
| B2 | `m-s-vapes` (M.S Vapes) | Contains **Cart – Magic Sauce 99% – 1ml** | Remove the cart (to `m-s-carts` if A2 is approved); otherwise decide whether Vapes intentionally includes carts |
| B3 | `thca-vapes` | Contains **Cart – THC-A 45% – Faraoh – 1ml** | Decide whether carts belong in series vapes pages (Alla Vapes IA says carts are a filter inside vapes). Make it consistent across THCaB/THCbA/THCV |
| B4 | `thca-carts` | Missing **Cart – THC-A 50% Live Resin – Faraoh – 1ml** | Add it |
| B5 | `blommor-buds`, `thca-blommor`, `cbd-buds` | Current: 4 legacy pre-rolls and 2 legacy isolates listed; hash Yellowstone (CBN) in Alla Buds; hash Primero (CBD) in CBD Buds | Legacy pre-rolls/isolates: removed/unpublished in migration (checklist 5); **Bangkok question resolved by the migration, not a blocker**. Move the 2 hash products out of buds pages (still relevant if they survive the migration). Target: each pre-roll in Buds only when flower-based (checklist 4) |
| B6 | `hasch`, `thca-hash` | Current: 2 legacy isolates listed | Leave with the migration. Target: hash-based pre-rolls also in Hasch (checklist 4) |
| B10 | Legacy isolate products | *Isolat – THCA 99% – 5 gram* and *Isolat – CBD 99% – 15 gram* are legacy. Their memberships in Alla produkter, Buds, Hasch, THCA Buds/Hash and CBD Buds are wrong | **Not a blocker.** Removed/unpublished in the migration (checklist 5); verify afterwards (checklist 6–7) |
| B7 | `h4cbd-vape` | 2 CBD carts listed as vapes | Same carts-in-vapes rule as B3 |
| B8 | `alla-produkter` | Missing **Buds – THCA 25% – Raspberry** and **Hash – THCA 60% – Piatella Hash**; includes **Fraktändring** (a shipping-adjustment item) as a product | Add the 2 products; hide Fraktändring from listings |
| B9 | `vapes-ny` (hidden) | **Vape – THC-H 20% – Hazey – 2ml ≈ 500/600 puffs** appear in no public category | Decide whether they are for sale. If yes, add them to `alla-vapes` and a series/cannabinoid route; if no, unpublish |

## C. Duplicates, hidden and legacy categories

| # | Route | Confirmed | Recommendation |
|---|---|---|---|
| C1 | `/core-1` | H1 "Core", 0 products, self-canonical, only self-linked | Hide or delete; redirect to `/core` if Nyehandel supports it |
| C2 | `/merch-ny` vs `/merch` | Both "Merch", 1 product each | Keep one public route (`/merch`) |
| C3 | `hazey-v2` → `vapes-ny`, `buds-ny`, `hash-ny`, `prerolled`, `isolat`, `merch-ny` | Hidden structural tree. It is **every product's main category**, so PDP breadcrumbs (JSON-LD) point to these hidden pages, not to public ones | Re-check after the migration (checklist 7). Target: product main category = public format route (pre-rolls → `/prerolled`; never `/isolat`). Affects PDP breadcrumbs in Task 10 |
| C4 | `/prerolled` | Current: hidden, H1 "PreRolled", 4 legacy sold-out products; header *kommer snart* (`href:null`) | **Decided:** public Pre-rolls page, slug `prerolled` kept, customer name "Pre-rolls"; page + header link activated now (Batch C). Must handle 0/1/many/sold-out/new products from live data |
| C5 | `/hero-vapes` | H1 "Hero Vapes", but 7 of 8 products are High Life buds/hash; acts as a manufacturer page | Rename to the actual brand/collection, or split vapes from buds/hash |
| C6 | `/h4cbd-buds` vs `/cbd-buds` | 1 vs 15 products, overlapping purpose | Task 06 decision |
| C7 | `/cbn` | Also holds the CBG9 product; header CBG is `href:null` | Task 06 decision |
| C11 | `/isolat` | Hidden, 2 legacy products, no visible nav link | **Dormant.** Do not delete it (keeps the reactivation path). Never link it from the header, category nav, hubs or other visible paths. Reactivate only when a real isolate product exists |
| C8 | `/core` | Real hub (id 67, 4 products), but not linked from the native nav or the dev-HEAD Theme 8 header | Linking is part of the Core hub work (main checkout); the header Core link still points to `alla-vapes?filters=Serie_Core` |
| C9 | 1-product dedicated routes: `thca-carts`, `thcb-carts` (`thcv-carts`, `hhcpm-vapes`, `10-oh-thc-vapes` and `/10-oh-thc` are now legacy taxonomy, see E) | Thin pages; `nano11-blommor` = `/nano-11` (identical assortments) | SEO decision: keep (navigational completeness) or consolidate. Do not create more 1-product categories without a reason |
| C10 | Slug inconsistency: `thcv-vape`, `h4cbd-vape` (singular), `blommor-buds`, `alla-cartridges`, `m-s-*` | Cosmetic | No change recommended (changing slugs breaks links); document only |

## E. Legacy taxonomy (final decisions 2026-10-27)

| # | Routes | Current state (legacy Nyehandel) | Target / action |
|---|---|---|---|
| E1 | `/hhcpm`, `hhcpm-vapes`, `hhcpm-blommor` | HHCPM category tree. Wedding Cake (El Gringo) + legacy Amnesia, Durban Poison, Canntropy HHCPM vape | **Not a future series.** Wedding Cake → Core family. Other items are legacy. Categories: admin cleanup at migration |
| E2 | `/thcnm`, `thcnm-blommor`, `thcnm-hash` | THCNM category tree: GSC, Black Widow, Malaga Magic, Royal Gorilla | **Not a future series.** High Life products → Core family at `/core`. Categories: admin cleanup at migration |
| E3 | `hero-vapes` | Legacy grouping of 8 Core-family candidates (High Life/El Gringo buds/hash + Core vape) | Products → Core family. Category: cleanup at migration |
| E4 | `/thcv`, `thcv-vape`, `thcv-carts` | 7 legacy THCV products | **On hold:** THCV is not in the planned new assortment. No new THCV pages until real products exist |
| E5 | `/10-oh-thc`, `10-oh-thc-vapes` | 1 legacy **10-OH-THC** vape (Canapuff) | **Not Delta-10.** Never a D10 data source or destination. The D10 hub waits for real D10 products + the migrated category |
| E6 | All of E1–E5 | Theme 8 header/`06-catalog-map.js` still link HHCPM, THCNM, THCV and "D10" (→ 10-OH-THC) | No visible nav may be auto-generated from these routes. Remove/remap in a post-migration code task. **Redirect/canonical decided after the migration**, based on which URLs are still used or indexed |

Core-family membership after the migration comes from migration data or explicit admin categorization, never
from name parsing. The candidates above come from today's legacy grouping (`hero-vapes`, `/core`) and observed packaging.

## D. SEO settings needing admin verification (unknown, not guessed)

1. `noindex, nofollow` on every route of `hazeyse.nyehandel.se`: is this host-only, or
   also on the production domain? (Visible in HTML; the production domain was not tested.)
2. Title tags are bare category names; 40 of 56 routes have no meta description.
   Find out whether Nyehandel exposes per-category SEO title/description fields.
3. Legacy long-form descriptions on broad and cannabinoid routes (e.g. "Njut av…",
   "Potentiella Fördelar") should be reviewed against the brand-voice rule (no effect or medical claims).
4. Filtered URLs canonicalize to the parent automatically. Confirm that this cannot be overridden
   per filter, since it means filtered views can never be SEO landings.
5. Whether a category can be hidden from the native menu but still indexable
   (needed for any new `m-s-*` route that should not appear in the native nav).
