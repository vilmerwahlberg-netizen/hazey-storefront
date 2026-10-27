# TASK 01G — broad category shell parity

- **Base:** `dev` at `a28292a`, i.e. 01E on top of 01D `dd07366`, 01F
  `f9d7d68` and 01C `f635252`.
- **"Before":** a `git archive a28292a` build.
- **"After":** the working copy.
- **How both run:** the harness in this folder injects each build into the
  real Theme 8 preview. Nyehandel admin is untouched.
- **Commit:** local only, as part of the night run (`TASK 01G`). Nothing is
  pushed or published.

**Decisions it builds on** (`decisions.md`):
- 2026-10-22: broad format pages accepted, with series as the primary shelf.
- 2026-10-22: a filter state must never select the template.
- 2026-10-23: lower discovery follows the unused axis (broad pages show other
  formats).
- 2026-10-26: mobile filter dock (01E).

## What changed

### `theme8/js/80-category.js`

1. **Alla Vapes gets the shared visual shell.** Every pilot page now gets
   `data-hz8-shell="broad"`.
   - The `broad` variable still controls only the *data*: sources (Alla Vapes
     keeps its merged vapes/carts/batteries list), the pause list (Alla Vapes
     still hides the paused series for legal reasons) and the quiz's format
     step.
2. **The broad anatomy applies to the whole family:**
   - series tabs as the primary shelf, built from the engine's own option
     rows (`syncFamTabs`, real filters via `picker.apply`, `?serie=`);
   - one "Filter & sortera" in the mobile row;
   - the filter sheet's Sortera section;
   - the sheet closing after a sort choice;
   - the mobile dock (01E): Sortera opens the sheet's Sortera section.
3. **Lower discovery:** `portalLower(root, except)` is now shared by the
   portal and the format pages.
   - **On format pages:** "Fler format / Fortsätt i ett annat format". It
     lists the other formats that exist in `PORTAL_ROUTES` and excludes the
     page's own sources.
     - Alla Vapes shows Buds and Hasch.
     - Alla Buds shows Vapes and Hasch.
     - Allt Hasch shows Vapes and Buds.
   - **Hiding rule:** a card whose target has 0 products is removed.
   - **Portal:** its own copy and "Om Hazeys sortiment" are unchanged.
4. **"Utforska våra serier" (`seriesBand` + `wireRail`) is removed.** It
   repeated the series that the shelf already shows. The task explicitly
   requires other formats instead.

### `theme8/css/80-category.css`

1. **`.hz8-ptool__type` is hidden in the shelf for the whole broad shell.**
   Product type (and Volym) are only reachable under "Filter & sortera" /
   "Alla filter".
   - This was already the rule for the portal.
   - Buds and Hasch only have one type.
2. **`.hz8-proutes`:** the selectors are widened from portal-only to
   `hz8-cat-pilot`, with `grid-row: 9` (the series band's row) on format
   pages. The portal keeps row 10.
3. **Shared hero rhythm.** A page without description text (Alla Buds has no
   lead in Nyehandel) reserves the lead's two lines.
   - The reserved row is empty and invisible (`visibility: hidden`,
     `min-height: 2lh`). No copy is fabricated.

**Unchanged:** product cards, the desktop dock, the header, heroes and images,
the series hubs, series × format pages, the portal (0 px diff) and every
filter value.

## Results

### Geometry (`runs/family-after-393_1440_1920-normal.json`)

The three routes are now **identical**:

| width | hero height | guide top/height | shelf top/height (radius) | grid start |
|---|---|---|---|---|
| 393 | 546 | 373 / 133 | 517 / 54 (18 px) | 637 |
| 1440 | 481 | 244 / 159 | 491 / 64 (20 px) | 571 |
| 1920 | 524 | 273 / 159 | 534 / 64 (20 px) | 614 |

**Before:**
- **Alla Vapes:** 647 / 481 / 524 hero, a separate shelf (62 px, Produkttyp +
  Cannabinoid/serie dropdowns), a grid start of 725 at 393, and series
  repeated at the bottom.
- **Alla Buds:** a hero of 497 / 403 / 444.

**Shelf, desktop**, in the same order on all three:
- tabs: All + the real series of the format;
- count;
- I lager;
- Alla filter;
- Sortera.

**Shelf, mobile:** tabs, count, "Filter & sortera".

### States (`runs/family-after-…-normal_filtered_sorted_empty.json`)

| State | URL | Vapes | Buds | Hasch |
|---|---|---|---|---|
| normal | — | 29 | 54 | 16 |
| filtered | `?serie=magic-sauce` | 2 | 7 | 2 |
| sorted | `?sort=price_high` | 29 | 54 | 16 |
| empty | Vapes `?serie=core&volym=1ml&filters=smart-filter_in-stock`; Buds `?serie=nano-11&filters=smart-filter_in-stock` | 0 | 0 | — |

- **Empty state for Hasch:** no real 0-result combination exists among the
  shelf's series + I lager. It is not fabricated.
- **Pressed tab:** always correct (All, or the selected series).
- **Overflow and errors:** none, in all 33 views.

### Tabs (`runs/tabs-after.json`; all three routes at 1440 and 393)

- **Click on "Magic Sauce":** gives `?serie=magic-sauce` and the right count.
  The page path stays the same (a real in-page filter, not navigation).
- **Enter on the "Alla" tab:** clears the filter.
- **Back:** steps back to magic-sauce, then to the start.
- **Forward and reload:** restore the selection.
- **Errors:** none.

### Mobile dock after the family change (`dock-verify.mjs` = 01E's verify; Vapes and Buds at 393)

- **Filter sheet content:** no search and no other formats; volumes 1 ml and
  2 ml.
- **Row and dock never visible together** (scan and fast scroll: 0).
- **Sheets and focus:** Filter and Sortera open the sheet, and focus returns
  to the dock.
- **Overflow and errors:** none.

### Portal regression (`portal.mjs`, `diff.mjs`)

Alla produkter top and format routes at 393 and 1440: 0 px changed, before
vs after.

### Functional suite (`functional.mjs`, base vs after)

14 of 15 steps are identical.

**The 15th step is `allavapes-mobile-sort`.** It fails *by design*: it clicks
Alla Vapes' old separate mobile button `[data-pt="sort-sheet"]`, which the
family contract replaces with the shared "Filter & sortera".

**`mobile-sort.mjs` runs the same assertion through the new control:**
- "Pris: högst först" in the sheet's Sortera section;
- it gives `?sort=price_high` and descending prices `985, 985, 745, 745, 725,
  725, 649, 649`, identical to the base suite's result.

The copied suite is left unchanged.

## Proof (`proof/`)

Three-column sheets (Alla Vapes | Alla Buds | Allt Hasch), with rows for the
hero, shelf + first product row, and lower discovery:
- `family-after-{393,1440,1920}-normal.jpg`;
- `family-after-{393,1440}-filtered.jpg`;
- `family-after-1440-sorted.jpg`;
- `family-after-1440-empty.jpg` (Hasch has no empty state);
- `family-before-{393,1440}-normal.jpg`, for comparison.

Raw crops (`runs/shots`) stay local.

**Scripts:**
- `family.mjs`, `empty.mjs`, `tabs.mjs`, `mobile-sort.mjs` and `portal.mjs`;
- `sheet.mjs`;
- copies: `dock-verify.mjs`, `functional.mjs` and `diff.mjs`;
- `run.sh`.

## Visual notes and risks

- **01D's plaster edge on Alla Vapes mobile** now sits, as on Buds and Hasch,
  mostly behind the guide card and shelf (the broad shell's composition).
  - That is the cost of identical family geometry.
  - The edge's expressive contour is now visible only at the sides.
- **Alla Buds has no lead** (no description text in Nyehandel). The reserved,
  invisible two-line row gives it the same rhythm but a visible gap between
  H1 and count.
  - The right fix is real copy in Nyehandel (Vilmer's call).
- **"Utforska våra serier"** is gone from the broad pages. Series pages are
  still reached from the tabs, the header and the series hubs.
- **Alla Vapes' separate mobile sort sheet (`#hz8-psortsheet`)** is still in
  the DOM, but nothing opens it on mobile any more (desktop sorting uses its
  own popover).
- **The new lower-module copy** ("Fler format / Fortsätt i ett annat format /
  Öppna en fokuserad kategori för en annan produkttyp.") is neutral and makes
  no claims, but needs copy approval.
