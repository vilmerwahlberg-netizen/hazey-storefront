# TASK 04A — Contextual cross-discovery axis

- **Status:** visually reviewed (2026-10-29). Series × format and broad format pages were approved unchanged. Hubs were approved except Nano-11's product-image fallback, which is corrected below. Committed as one Task 04A commit and pushed to `origin/dev`. Nothing is published in Nyehandel, and admin is untouched.
- **Base:** `origin/dev` = `4a19a16`.
- **"Before":** `git archive 4a19a16` + build (`XD_BASE`).
- **"After":** the working copy.
- **Harness:** `lib.mjs`, a copy of the 04C-B harness. It injects each build into the real Theme 8 preview.
- **Preflight:** Task 04's route master map is complete (`category-route-master-map-2026-10/`: ROUTE-MATRIX, route-matrix.json, ADMIN-GAPS, ROLLOUT-BATCHES, REPORT).
- **Mode:** Systemize. The accepted pilot is the compact THCaB "Andra serier i Vapes" landscape-card rail (R3).

## What changed

**One shared module.** `xdModule()` in `theme8/js/80-category.js` (exposed as `HZ8.crossDiscovery`) renders THCaB's accepted markup (`.hz8-sf-others` / `.hz8-sf-series` / `.hz8-sf-serie`) for all three families.

**The axis comes from the page family, which is chosen from the pathname only:**

| Family | Axis | Title | Destinations | Parent link |
|---|---|---|---|---|
| Broad format (Alla Vapes, Alla Buds, Allt Hasch, and their filtered states) | other formats | Utforska andra format | the other broad format pages, named from the header (Alla Vapes / Alla Buds / Allt Hasch) | Visa alla produkter |
| Series hub (Magic Sauce, THCaB, THCbA, Nano-11, Core) | other series | Utforska andra serier | the other customer series' hubs; the current series is excluded | none |
| Series × format | other series, same format | Andra serier i {format} | other series with a route in the format | Visa alla {format} (unchanged) |

**Behavior:**
- **Links are written into the DOM immediately** from the catalog map, so they are crawlable and focusable before any count arrives (`runs/crawl.json`). Count and image are then read from each destination page.
- **A destination with 0 products** is removed. If no card remains, the module is `hidden` and leaves no shell.
- **A network failure** leaves the link in place without a count. Nothing is fabricated.
- **Card images:**
  - Series cards use the approved R3 series landscapes (Magic Sauce, THCaB, THCbA, Core, and Nano-11 after the correction below).
  - A series without approved art would use the existing fallback: the destination's real first product image.
  - Format cards use that fallback with each format page's real first product image.

**Legacy taxonomy.** `06-catalog-map.js` marks D10 (which points at the 10-OH-THC legacy route), THCV, HHCPM and THCNM as `legacy` per the Task 04 decisions of 2026-10-27. The new `HZ8.catalog.discoverable()` keeps them out of the module. This removes **THCV Vapes/Carts** from every "Andra serier i …" row, and removes D10/THCV/HHCPM/THCNM and the current series from the hubs. Header, filters and the catalog map itself are not changed (that is a post-migration task).

**CSS:**
- **`80b-series-format.css`:** the accepted rail selectors were generalized from `html.hz8-sf .hz8-sf-*` to `:is(html.hz8-sf, html .hz8-xd) .hz8-sf-*`. The specificity is identical, so series × format pages compute the same.
- **New, `.hz8-xd`-scoped only:**
  - the head wraps when the title and link don't fit;
  - cards in a row share their height;
  - at ≥768 px, a right-edge fade appears when there are more cards than visible;
  - transitions are off under reduced motion.
- **`80-category.css`:** grid slot and spacing on broad pages. `[hidden]` hides the module.
- **`81-series-hub.css`:** top rule and spacing inside `.hz8-sh-after`.

**Removed from view:**
- **Broad pages:** the "Fortsätt i ett annat format" text cards. They are replaced by the module, with the same destinations.
- **Hubs:** the old "Serier" chip rail. It is replaced by the module. The current series and the legacy series are no longer shown.
- **Portal:** `/alla-produkter` keeps its accepted "Jämför enklare".
- The rejected dark "Utforska våra serier" band is not restored anywhere.

**Frozen (diffed):** header, hero, filter shelf, product cards, service section and footer.

## Changed files

- `theme8/js/80-category.js`: shared module, broad and series × format wiring, `routeName()` helper.
- `theme8/js/81-series-hub.js`: hub lower module.
- `theme8/js/06-catalog-map.js`: `legacy` flag and `discoverable()`.
- `theme8/css/80b-series-format.css`, `theme8/css/80-category.css`, `theme8/css/81-series-hub.css`.
- `theme8/assets/series-format-r3/series-nano11-r3.webp` (new, Nano-11 correction).
- Review folder: `theme8/review/cross-discovery-axis-2026-10/` (this report, `TRUTH-TABLE.md`, scripts, `runs/`, `proof/`).

`dist/` was rebuilt and is untracked. Generated bundles were not hand-edited.

## Route truth table

See `TRUTH-TABLE.md`. It covers 26 routes with before/after module, `contextFor()`, `isBroad`, `sfMode`, and the explicit dedicated `/m-s-vapes` vs filtered `/alla-vapes` distinction.

## Verification

**Widths:** 393, 1440 and 1920, plus 320 and 200 % zoom (`shots.mjs`, `runs/shots-*.json`).

**Routes:** Magic Sauce Vapes, THCaB Vapes (control), Alla Buds, Allt Hasch, Alla Vapes, Allt Hasch `?filters=Serie_Magic Sauce`, and the Magic Sauce, THCaB and Core hubs.

- **H1:** exactly one on every view.
- **Horizontal page overflow:** 0 in every view, including 320 and 200 %.
- **Rail scrollbar:** never visible (`offsetHeight − clientHeight = 0`).
- **Overlap:** the module overlaps no neighbour (previous/next section, service, footer).
- **Console errors:** none.
- **Card sizes:** match the accepted R3 measurements, 251×104 at 1440 and 274–288×96 at 393. On mobile the next card peeks, so it is clear more items exist.

**Destination states** (`states.mjs`, `runs/states-393_1440.json`, `proof/states-*`):

| State | How it was produced | Result |
|---|---|---|
| 3 | THCaB Vapes, real | 3 cards |
| 2 / 1 | 1 or 2 sibling pages answer "0 produkter" (network) | the card is removed; the remaining cards keep their width (not stretched) |
| 0 | all siblings at 0; also Alla Buds with both formats at 0 | module `hidden`, no heading or empty shell |
| 4 | real on all hubs; also a fixture | 4 cards. 1440: all visible. 393: swipe rail with peek. |
| 6 | fixture via `HZ8.crossDiscovery.module` | 1440: right edge fades (`is-more`); keyboard focus scrolls only the rail (`scrollX` stays 0) |
| Long Swedish names | fixture | wraps to 2–4 lines and stays inside the card (`nameFits`); all cards in the row grow to the same height |

The fixtures use real routes and real fetched counts, with fixture names only. They render in a test container on a real page, and are layout proof only.

- **Keyboard:** Tab from the heading reaches "Visa alla vapes" and then each card in order. Each has `:focus-visible` and the real `href`.
- **Reduced motion:** with `prefers-reduced-motion: reduce`, the cards' `transition-duration` is 0s.
- **Slow and failed data** (`crawl.mjs`): when category fetches are delayed 6 s, all links are present right after boot with a reserved card height (104) and an empty count. When the fetches fail, the links stay and no count is invented.

**Frozen-region regression** (`frozen.mjs`, `runs/frozen-diff.json`, full page, before vs after; the module itself is excluded):
- **Above the module** (header, hero, filters, products): 0 px on every route at 393 and 1440. The one exception is Alla Buds 1440, at 161 px: a 40×8 px spot inside a product card, which is dynamic content (class 2).
- **Below the module** (category text, service, footer), bottom-aligned:
  - Series × format and Magic Sauce at 393: 0 px.
  - The remaining 130–233 px diffs at 1440 are in the footer's last row. They also appear on the series × format pages, where the module height is unchanged, so they are dynamic (class 2).
  - Broad pages at 393 and Magic Sauce at 1440: the new module height is not a whole number of device pixels, so the sections below shift by half a CSS pixel. The side-by-side crop (`runs/frozen`) shows identical content (class 4).

**Functional suite** (`functional.mjs`, base vs after): **15/15 identical**:
- Alla Vapes filter, history and sort;
- Hasch and Buds tabs;
- home quick-add;
- PDP buys;
- Faraoh variant buy;
- Magic Sauce hub;
- header nav;
- mobile menu;
- mobile and desktop search;
- cart → checkout.

`allavapes-mobile-sort` fails identically in both. This is pre-existing: the test clicks the old sort button that 01G replaced.

## Nano-11 correction (after visual review)

**Decision:** only the Nano-11 card changes. Its product-pack fallback (a small Tatra Hemp bag in a light box) is replaced by a landscape card like the rest of the row.

**Asset:** `theme8/assets/series-format-r3/series-nano11-r3.webp`.
- **Size:** 1000 × 384, the same as the other R3 cards. WebP, 57 KB (the others are 32–69 KB).
- **Source:** cut only from the accepted Nano-11 hero, `series-nano11-hero-2026-10/nano11-hero-1512x664.webp`. The crop is x 0–1086, y 168–585, scaled 0.92 (`cwebp -q 80 -m 6 -sharp_yuv`).
- **Content:** sunset coastline, sea and cliffs only. The crop stops left of the hero's Tatra Hemp products, so it has no product and no text. Nothing was generated and the art direction is unchanged. The horizon sits in the upper third, as on Magic Sauce and THCaB.

**Code:**
- `"Nano-11": "nano11"` is added to the existing `SF_SERIES_ART` (`80-category.js`).
- One `[data-hz8-series-art="nano11"]` rule is added next to the others (`80b-series-format.css`).
- Nothing else changes: layout, card width, spacing, titles, copy, destinations and behaviour are the same.

**Side effect, as a direct result of the shared map:** on the Buds series × format pages (`/m-s-buds`, `/thca-blommor`), the "Nano-11 Buds" card in "Andra serier i Buds" gets the same landscape. Before, it showed the product fallback. Nothing else on those pages changes (`proof/nano11-ms-buds-*`).

**Card-level check** (`nano.mjs`, `runs/nano-*.json`, `runs/nano/`). Magic Sauce and Core hubs, at 320, 393, 1440, 1920 and 200 % zoom:

| | Before (fallback) | After |
|---|---|---|
| `has-art` / inner product box | no / visible | yes / none |
| Size (1440 · 393 · 320 · 1920 · 200 %) | same | 251×104 · 274×96 · 219×96 · 267×104 · 523×96, the same as every card in the row |
| Material (border, radius, shadow, cover) | 2 variants in the row | 1 variant: identical to the row |
| Image | — | loads 1000×384 on every view |
| Contrast behind white text (text hidden; mean / darkest pixel) | 11.9 / 10.9 | **14.4–14.6 / 7.7–9.7**. The other cards measure 11.1–17.7 / 5.4–16.9; the accepted Magic Sauce card is lowest at 5.4–6.8. |
| Text fits / page overflow / console | yes / none / 0 | yes / none / 0 |

**Full 04A suite, rerun after the correction:**
- **Truth table:** 26/26 routes unchanged against the pre-correction run (titles, destinations, contexts, H1). The probe now covers 33 routes.
- **Legacy series:** D10, THCV, HHCPM and THCNM appear in no discovery module.
- **Alla produkter:** still "Jämför enklare" only, identical.
- **Dynamic states and keyboard:** 0/1/2/3 (real, throttled), 4/6/long (fixtures), keyboard and reduced motion give results identical to the pre-correction run (`runs/states-393_1440.json`).
- **Slow and failed network:** links present, empty counts, 0 errors (`runs/crawl.json`).
- **Frozen regions:** identical to the pre-correction run. Core 393/1440 was added and behaves like Magic Sauce: 0 above the module, and the half-pixel shift below it (class 4).
- **Functional suite:** 14/15 identical to base. The 15th, `home-quick-add`, differs only in its timing field (`clickToResultMs` 387 → 1395 ms, network). The result, label and cart POST are identical. `allavapes-mobile-sort` fails as before (pre-existing).
- **Overflow:** 0 at 320, 393, 1440, 1920 and 200 %. No visible scrollbar.

**Evidence** (before = 04A without the Nano-11 image, after = working copy):
- `proof/nano11-magic-sauce-{393,1440}.jpg`, `proof/nano11-core-{393,1440}.jpg`.
- `proof/nano11-{magic-sauce,core}-{320,1920,1440-z200}.jpg`. At 200 % the Nano-11 card is further along the rail; its measurements are in `runs/nano-after-magic-sauce_core-1440-z200.json`.
- `proof/nano11-row-cards.jpg`, `proof/nano11-row-cards-mobile.jpg`: module crops.
- `proof/nano11-nano11-1440.jpg` (control: the Nano-11 hub does not show itself), `proof/nano11-ms-buds-{393,1440}.jpg` (side effect).

## Visual evidence to inspect

`proof/`, before | after, from the module through the footer. The stacked viewports repeat about one viewport at the bottom because the last scroll position is clamped:
- **Series × format:** `lower-m-s-vapes-{393,1440,1920}.jpg`, plus `lower-thcab-vapes-*` (control: the THCV card is gone, the rest is identical).
- **Broad:** `lower-buds-*`, `lower-hasch-*`, `lower-alla-vapes-*`, plus `lower-hasch-f-*` (filtered).
- **Hubs:** `lower-magic-sauce-*`, `lower-thcab-*`, `lower-core-*`. These show the pre-correction Nano-11 fallback; see `nano11-*` for the final card.
- **Full pages:** `full-*-{393,1440}.jpg` and `lower-*-1920.jpg` stay local (in the working copy, not committed) to keep the commit small.
- **320 and 200 %:** `lower-*-320.jpg`, `lower-*-1440-z200.jpg`.
- **States:** `states-real-{393,1440}.jpg` (3/2/1/0) and `states-fixture-{393,1440}.jpg` (4/6/long).

## Open points and remaining dependencies

- **Format cards use a product pack shot** (the accepted fallback). No format-specific landscape art exists. A format-art set (Vapes/Buds/Hasch) would make the broad module as atmospheric as the series cards, but that needs your approved imagery.
- **Core Vapes points to `alla-vapes?filters=Serie_Core`,** a filtered broad state with 1 real product. It is kept because it is a real destination. Whether Core should go to the `/core` hub instead is your open header/Core decision (Task 04, question 1).
- **Admin, from ADMIN-GAPS:** the M.S Vapes cart, the M.S Buds hash/La Chupacabra membership, and the THCaB Carts membership affect the counts shown on cards (they are read live). When `m-s-hasch` / `m-s-carts` exist (04B), the module picks them up through `06-catalog-map.js` `extra`. Pre-rolls appear on broad pages when `/prerolled` is published and added to `PORTAL_ROUTES`/the catalog map (Batch C).
- **Not in scope:** Alla Carts (Task 05, legacy shell) has no module. Legacy header links (THCV/HHCPM/THCNM/10-OH-THC) remain a post-migration task.
- **Dead CSS:** the hub's old `.hz8-sh-after .hz8-rail--series` rules (81-series-hub.css) are now unused. They were left for a cleanup pass.
- **Accepted-design note:** the hub's lower module changes from the small "Serier" chip rail to landscape cards. The task requires this ("other real series, exclude current"), but it is a visible change to the accepted hub pilots, so please check `lower-magic-sauce-*`.
