# Keep as filter or hub shelf (no new categories)

| Combination | Real products | Stays as | Reason |
|---|---:|---|---|
| Core × Vapes | 1 (Vape – THCX 19% – Core – 2ml) | `alla-vapes?filters=Serie_Core` + `/core` hub shelf | 1 product. The Core hub now gathers the whole family. Open decision: should the header "Core" link go to `/core` instead of the filter? |
| Core × Buds | 1 today (Wedding Cake, El Gringo) | `/core` hub shelf | Core family destination. Grows at migration with High Life/El Gringo buds; reassess only on a real, stable assortment |
| Core × Hasch | 2 today (Malaga Magic, Northern Lights) | `/core` hub shelf | Same as above (High Life hash joins at migration) |
| THCaB × Pre-rolls | 1 legacy (sold out) | nothing; leaves with the migration | Legacy data. Post-migration series × pre-roll combos appear on the Pre-rolls page via filters, and get pages only on a real, stable assortment |
| THCaB × Isolat | 1 legacy | **dormant: no page, no link** | No isolate in the new assortment; the legacy product leaves with the migration |
| Magic Sauce × Carts | 1 | `alla-cartridges?filters=Serie_Magic Sauce` | **Only if you decline** FIRST-ADMIN-BATCH item 2 |

Legacy taxonomy (not filters, not pages; cleaned up at migration): HHCPM × Vapes/Buds, THCNM × Buds/Hasch (→ Core family
at `/core`), THCV × Vapes/Carts (on hold), 10-OH-THC × Vapes (not D10). Their routes never auto-generate visible nav.

Rules for all of the above:

- A query string never selects the series × format template; the page keeps its parent's
  broad shell (verified on `hasch?filters=Serie_Magic Sauce`).
- Filtered URLs canonicalize to their parent (confirmed), so they are not SEO landings.
- Reassess when the real assortment grows (e.g. ≥3 stable products) or a format decision is made.
  Never base it on expected future stock.
