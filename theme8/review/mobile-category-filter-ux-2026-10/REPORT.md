# TASK 01E — mobile category filter truth and bottom glass dock

- **Base:** `dev` at `dd07366`. That is Task 01D, committed locally on top of
  01F `f9d7d68` and 01C `f635252`.
- **"Before":** a `git archive dd07366` build.
- **"After":** the working copy.
- **How both run:** the harness in this folder (`lib.mjs`, a copy of 01D's)
  injects each build into the real Theme 8 preview. Nyehandel admin is
  untouched.
- **Commit:** local only, in the night run (`TASK 01E`). Nothing is pushed or
  published.
- **Mode:** Refine + Systemize. It is implemented once in the shared mobile
  `hz8-cat-pilot` family (Alla Vapes, Alla produkter, Alla Buds, Allt Hasch).

## Changed files

### `theme8/js/80-category.js`

1. **`cardVolume`:** a dual product is classified by its total capacity.
   - `1+1ml` becomes key `2ml`, label `2 ml`.
   - There is no longer a separate `1+1 ml` option or URL value. The
     product's own name is unchanged.
2. **`VAPES_VOLUMES = {1ml, 2ml, 5ml}`:** the customer-facing volume choices
   on Alla Vapes (the `vapes` shell, not broad or portal), applied in two
   places:
   - in `loadDims` (option generation);
   - in the volume test of the filter engine.

   A product with another parsed volume (the legacy `0,5 ml` cart) is not
   classified and stays under Alla. An approved value with no real product is
   never shown.
3. **`data-hz8-short`:** set on the filter sheet's series section when it has
   at most `SERIES_SEARCH_MIN = 12` options. CSS then hides the local search
   on mobile only.
4. **`syncStuck`:** the mobile row is never stuck again (`is-stuck` and
   `is-past` are always removed). Desktop already had it in flow.
5. **`mobileDock()`:** a new `.hz8-mdock` with two equal buttons, Filter and
   Sortera, and a hairline divider.
   - **When it shows:** only after the in-flow row is more than 96 px above
     the viewport, so it has slid out before the row returns.
   - **Fast-scroll safety (`is-row-in`):** if the row is actually in view,
     the dock disappears instantly.
   - **Page ending:** it leaves before the product area ends (area bottom
     less than viewport + 40 px), so customer service, the series band and
     the footer are never covered.
   - **Yielding (`is-yield`):** it moves out of the way while a filter or sort
     sheet, the mobile menu, mobile search or the cart is open, while the page
     is scroll-locked, and while the cookie banner is shown
     (`html.show--consent`). It stays focusable for the sheet's focus return.
   - **What the buttons open:** the existing sheets. Filter opens `#hz8-pfilter`
     with the same initial section as the row. Sortera opens
     `#hz8-psortsheet` on Alla Vapes; on the broad shell and portal it opens
     the filter sheet's own `Sortera` section, exactly what the row's
     "Filter & sortera" contains.
   - **No second filtering engine.** The active count comes from the same
     `syncFilterDock` count as the desktop dock.

### `theme8/css/80-category.css`

There is one new block at the end, and all of it applies at `max-width: 767px`
only:
- hide the series search when the list is short;
- hide `.hz8-ppop__other` ("Finns i andra format") in the filter sheet;
- `.hz8-ptool { position: relative }`;
- the `.hz8-mdock` material, reusing the header's glass tokens:
  - `--hz8-glass-bg` (60 % ivory), `--hz8-glass-blur`, `--hz8-glass-border`
    and `--hz8-glass-shadow`;
  - the opaque fallback when backdrop-filter is unsupported;
  - safe-area bottom, 16 px side margins, max 320 px wide, 50 px tall;
  - 44 px buttons and a reduced-motion rule.

Desktop rules are untouched.

## Volume normalization (Alla Vapes, `runs/vol-truth-*.json`)

Source names come from the pilot's own sources (vapes, carts, batteries;
all pages).

| Parsed from name | Before (option) | After (option) |
|---|---|---|
| `- 2ml` (11 vapes) | 2 ml | 2 ml |
| `- 1+1ml` (2 dual vapes) | separate "1+1 ml" | **2 ml** (13 products in total) |
| `- 1ml` (11 vapes + 6 carts) | 1 ml | 1 ml |
| `- 0,5ml` (1 cart, Tatra Hemp CBD 60 %) | separate "0,5 ml" | not a choice (stays under Alla) |
| batteries (no volume) | — | — |

**Options now:** `1 ml` (16) and `2 ml` (12). These are the counts after
excluding the paused series.

**Catalog dependency: 5 ml.** The catalog currently has **no** product whose
name gives 5 ml. Under the rule "never fabricate an option", `5 ml` is
therefore not shown. It appears automatically as soon as a real product named
`… - 5ml` exists.

**URLs:** old URLs `?volym=1+1ml` and `?volym=0-5ml` are ignored (no active
filter, 29 products), and the new `?volym=2ml` works.

## Option truth per route (mobile filter sheet, after)

| Route | Series options (all backed by products on the page) | Search field | "Finns i andra format" | Volume |
|---|---|---|---|---|
| Alla Vapes | Magic Sauce, THCaB, THCbA, Core, THCV (5) | no (was yes) | no (was 1: Nano-11) | 1 ml, 2 ml |
| Alla produkter | 9 series | no (9 ≤ 12) | no | shown only for a type with one shared unit (unchanged) |
| Alla Buds | Magic Sauce, THCaB, Nano-11, HHCPM, THCNM | no | no (was 4) | — (grams; broad shell unchanged) |
| Allt Hasch | 3 series | no | no | — |

## Results (`runs/verify-after-…-320_393_430_720z.json`, `flows-after.json`, `desk-*.json`, `diff.json`)

All four families were tested at 320, 393 and 430, and at 200 % zoom
(1440 window = 720 px CSS):

- **Row:** `position: relative`, `is-stuck` 0 times.
- **Row and dock never visible together:**
  - 0 samples in a full scroll scan at 140 px steps;
  - 0 frames in a fast up/down sequence (6 × 260 ms throws, read every frame).
- **Dock and page ending:** the dock is only visible while the product area
  still covers the viewport bottom. It was out ("beyond area") 0 times and
  is gone at the page ending.
- **Filter and Sortera from the dock:**
  - each opens the correct existing sheet (Alla Vapes: the sort sheet; broad
    and portal: the sheet's Sortera section);
  - focus is inside the dialog and stays there through 25 Tab presses;
  - Escape closes it and focus returns to the dock button, which is shown
    again;
  - from the row, focus returns to the row.
- **Active count (Alla Vapes 393, real clicks):**
  - selecting `2 ml` in the sheet gives `?volym=2ml`, 12 products, and a real
    `Vape Dual … 1+1ml` product in the grid;
  - the dock badge shows `1`.
- **History:**
  - back gives the URL without the filter, 29 products, no badge;
  - forward gives `2ml` again (pressed, badge 1);
  - reload keeps the same state.
- **Cookie banner:** with no consent given (`html.show--consent`), the dock
  yields (`is-yield`). After "Godkänn alla" it is shown.
  `proof/cookie-banner-dock-yields-393.png`
- **Overflow and errors:** no horizontal overflow and no console errors
  (after).
- **Desktop 1440/1920:**
  - the desktop dock behaves as before (`is-shown` after scroll);
  - `.hz8-mdock` has `display: none`;
  - **pixel diff** before vs after (top, edge, docked):
    - 0 px everywhere except 99 px (0.03 %, Alla Vapes 1440, docked) and
      284 px (0.04 %, Hasch 1920, edge);
    - both are inside the product grid (images or card content loading),
      not in any control.
- **Functional suite** (`functional.mjs`, base vs after): 14 of 15 steps
  are identical. This covers Alla Vapes filter, history and mobile sort, the
  family tabs, quick-add, hub, menus, search, cart and variant purchase.
  - The 15th step, `pdp-core-buy`, crashed **in the base run**
    (`Page crashed`, memory pressure on the 8 GB machine).
  - In the after run it is green (buy button enabled, cart POST 200), and its
    values are identical to the green 01D run of the same step.

## Proof (`proof/`)

- **Frame sheets** `frames-alla-vapes-393.jpg` and
  `frames-alla-produkter-393.jpg`: before over after. The six frames are:
  1. in-flow row;
  2. just after the row has left view (before: the stuck row on Alla Vapes);
  3. active filter;
  4. filter sheet;
  5. sort;
  6. near the page ending.
- **Videos** `video-after-alla-vapes-393.webm` and
  `video-before-alla-vapes-393.webm`, about 15 s each at normal speed:
  - the row;
  - the dock entering;
  - Filter, then close;
  - Sortera, then close;
  - towards the page ending (the dock yields);
  - back up.
- **Full pages** `full-page-{alla-vapes,alla-produkter,buds,hasch}-393.jpg`:
  after, through the footer.

**Scripts:**
- `vol-truth.mjs`, `verify.mjs`, `flows.mjs` and `desk.mjs`;
- `active.mjs`, `before-frames.mjs`, `sheet.mjs` and `record.mjs`;
- copies: `shoot.mjs`, `diff.mjs` and `functional.mjs`;
- all run by `run.sh`.

Raw frames and crops (`runs/frames`, `runs/shots`) stay local.

## Remaining risks and dependencies

- **5 ml:** the product data has none (see above). The approved set is ready
  but shows only what exists.
- **The dock covers the bottom 62 px of the viewport while scrolling.**
  Product buttons can lie temporarily under it until the visitor scrolls.
  - The last row of cards is uncovered, because the dock leaves before the
    end of the area.
  - The dock is translucent glass and 320 px wide, not full width.
- **The cookie check** is based on the cookie banner's `show--consent` class.
  A future replacement consent UI would need the same hook.
- **The broad shell and portal** have no separate sort sheet. Their dock
  Sortera opens the existing "Filter & sortera" sheet directly on its Sortera
  section, a deliberate reuse with no new engine.
