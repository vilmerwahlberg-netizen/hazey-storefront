# TASK 01D — shared mobile category plaster transition

- **Base:** `dev` at `f9d7d68`, i.e. Task 01F committed locally on top of Task
  01C `f635252`.
- **"Before":** a `git archive f9d7d68` build in the scratchpad.
- **"After":** the working copy.
- **How both run:** the harness in this folder (`lib.mjs`, copied from 01F)
  injects each build into the real Theme 8 preview. Nyehandel admin is
  untouched.
- **Commit:** local commit only (`TASK 01D`), as part of the night run.
  Nothing is pushed or published.
- **Mode:** Systemize. It is the accepted concept B
  (`mobile-hero-plaster-transition-concepts-2026-10/concept-b-eroded-plaster-edge.png`,
  `decisions.md` 2026-10-26), applied once to the shared `hz8-cat-pilot`
  hero.

## Route matrix (live paths read from `HZ8.catalog`, `runs/routes-probe.json`)

| Family | Route | Shell / classes | Filtered state tested |
|---|---|---|---|
| Alla Vapes | `/sv/categories/alla-vapes` | `hz8-cat-pilot`, shell `vapes` | `?filters=Serie_Core` (1 product) |
| Alla Buds | `/sv/categories/blommor-buds` (format key `buds`) | `hz8-cat-pilot`, shell `broad` | `?filters=Serie_Magic+Sauce` (7) |
| Allt Hasch | `/sv/categories/hasch` (format key `hasch`) | `hz8-cat-pilot`, shell `broad` | `?filters=Serie_Magic+Sauce` (2) |
| Alla produkter | `/sv/categories/alla-produkter` | `hz8-cat-portal hz8-cat-pilot`, shell `broad` | searched and filtered: `?typ=vapes&q=core` (1) |
| *Excluded, regression-locked* | `/sv/categories/magic-sauce` (`hz8-sh-pilot`), `/sv/categories/m-s-vapes` and `/sv/categories/thca-vapes` (`hz8-sf`) | — | — |

## Root cause and change (one file: `theme8/css/80-category.css`)

**Root cause.** Inside `@media (max-width: 767px)`:
- `.hz8-cat-hero__art` faded its bottom 96 px to transparency through a
  linear mask, which produced the milky fog;
- `.hz8-cat-hero__plaster::before/::after` were `content: none`.

**Change.** It is one shared rule set, still inside that media query and
scoped only to `html.hz8-cat-pilot[data-hz8-page="category"]`.

1. **The art mask is removed** (`mask-image: none`). The photo is fully opaque
   right up to the plaster edge.
2. **`.hz8-cat-hero__plaster::before` is the plaster surface**, in the bottom
   104 px of the hero.
   - Its colour is `var(--hz8-pilot-shop)`, the product canvas colour, so there
     is no seam. It is a slightly lighter lime close to the rim.
   - Two restrained hairline cracks are layered on top.
   - It is fully opaque (`opacity: 1`). The desktop value of 0.9 would let the
     photo show through.
3. **`::after` adds the mineral texture.** It reuses the existing
   `category-vapes-plaster-v1.webp` plus fine SVG noise, at opacity 0.55.
   - The texture is masked by the edge and intersected with a vertical
     gradient, so it fades out before the hero bottom.
4. **The edge silhouette** is one shared SVG mask, `--hz8-mplaster-edge`.
   - It is a deterministic eroded contour, displaced by turbulence, with a few
     loose flecks.
   - The fill continues below the viewBox, so the displacement can never lift
     the bottom edge.
   - The edge rises roughly 40–85 px above the hero bottom (more photo is
     kept than the old 96 px fade).
5. **The rim gets a hairline warm `drop-shadow`** on the plaster element, so
   it reads as a material with thickness.

**Unchanged:**
- hero height and crop (identical `hero.height` before and after at 393,
  1440, 1920 and 200 % zoom, the widths measured in both builds);
- header, guide CTA, filter/sort shelf, cards, grid, lower modules and footer;
- desktop: every rule sits inside `max-width: 767px`;
- no JS changed, no route-specific copies, no new image asset, no motion.

**Selector ownership:**
- `html.hz8-cat-pilot { --hz8-mplaster-h; --hz8-mplaster-edge }`;
- `html.hz8-cat-pilot[data-hz8-page="category"] .hz8-cat-hero__art`;
- `.hz8-cat-hero__plaster` (adds `filter`);
- `.hz8-cat-hero__plaster::before` and `::after`.

## Results

- **Readiness** (`ready.mjs`; cold, warm and Fast 3G with CPU 4×, at 393):
  - **Covered:** Alla Vapes and Alla produkter in all three conditions; Buds
    and Hasch cold.
  - **Edge at first paint:** from the first painted frame onward, every frame
    already has the plaster edge.
  - **Retired fade:** 0 frames. **Hero art without the edge:** 0 frames.
  - **No errors.**
- **Usable controls** (`shoot.mjs`, `hits`, and `functional.mjs`):
  - **Guide CTA:** reachable at its centre on all four families at 320, 393
    and 430.
  - **Functional suite:** all 15 steps identical to base (filter, history,
    sort, family tabs, quick-add, PDP buy and variants, hub, menus, search,
    cart). The only difference is a click timing.
  - **Pre-existing measurement artefact, identical in both builds:** the
    `filterBtn` probe reports BLOCKED on Alla Vapes mobile and on some 200 %
    cases. The probe picks the first matching button in the DOM (the hidden
    desktop variant), or the 450 px tall zoom view puts the button under the
    header. The real Filter button is exercised by the functional suite.
- **Overflow and errors:** no horizontal overflow and no console errors on
  any route, width or zoom level.
- **Desktop pixel stability** (`diff.mjs`, before vs after, hero bottom and
  top viewport):
  - 0 changed pixels on all four families at 1440 and 1920.
- **Excluded surfaces:**
  - Magic Sauce hub 393/1440 and Magic Sauce Vapes 393/1440: 0 px.
  - THCaB Vapes 393: 0 px.
  - THCaB Vapes 1440 edge: 480 px (0.08 %). That is the product grid
    (dynamic catalog content), not the hero.
- **The 200 % zoom case** (1440 window = 720 px CSS, DPR 2) gets the mobile
  rules. The edge stretches wider and flatter but stays low and seamless.

## Proof (`proof/`)

- `compare-393-before-reference-after.jpg`: before, accepted reference and
  after at 393, for all four families.
- `after-320-430-zoom200.jpg`: after at 320 and 430, plus before and after at
  200 % zoom.
- `full-page-{alla-vapes,buds,hasch,alla-produkter}-393.jpg`: after, full
  page through the footer.

**Scripts and results:**
- **Scripts:** `routes-probe.mjs`, `shoot.mjs`, `diff.mjs`, `ready.mjs`,
  `sheet.mjs`, `functional.mjs` (a copy) and `run.sh`.
- **Results:** `runs/*.json`. Raw crops in `runs/shots/` stay local.

## Visual notes and remaining risk

- **On the broad shell** (Buds, Hasch, Alla produkter), the guide card or
  search field and the glass format shelf sit over the bottom ~30–80 px of the
  hero, a frozen layout.
  - Most of the eroded contour is therefore hidden. It shows at the left and
    right sides and around the Alla produkter search field.
  - The visible result is: photo, then a short plaster band, then the tabs
    over solid canvas. There is no fog and no seam, but the edge character is
    much stronger on Alla Vapes.
  - Making it as expressive on the broad shell would require moving the
    guide or shelf, which this task freezes.
- **Mask geometry:** the mask is a fixed 400 × 104 SVG stretched to the
  viewport width.
  - At 320 the peaks are slightly narrower.
  - At 720 (200 % zoom) they are wider and flatter.
- **Cracks** are deliberately faint. At 320, on Alla produkter, they sit close
  to the search field.
