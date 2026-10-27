# 04C-R — shared mobile hero for the series hubs, and the Core tile on the shop page

- **Base:** `dev` at `9d65a85` (Core).
  - "Before" = `git archive 9d65a85` + build.
  - "After" = the working copy.
- **Commit:** a separate local correction commit, not pushed; Nyehandel admin
  untouched.
- **Visual rounds:** 2.
  - Round 1: a feathered rectangle behind the whole text block. Contrast was
    good, but it covered nearly the full width as a visible rectangle and
    veiled the top of the Core packs.
  - Round 2: a layer the width of the lead, plus a breadcrumb strip and a glyph
    halo; finished with a softer strip.

## 1. Mobile hero (`theme8/css/81-series-hub.css`, only `max-width: 767px`)

**Before:** `.hz8-sh-hero__scrim` was a full-width radial layer over the top
330 px of the hero (up to 56 % cream). It washed out the photo regardless of
where the text sat, most visibly on Core's darker forest image.

**After:** one shared rule for all `hz8-sh-pilot` hubs (Magic Sauce, THCaB,
THCbA, Nano-11, Core). There are no series selectors.

- **The old full-width scrim is off on mobile** (`display: none`).
- **`.hz8-sh-hero__copy::before`** is the main contrast layer.
  - It is warm (`rgba(250, 239, 221, .6)`, variable `--sh-scrim-a`), sits
    behind breadcrumb, H1, lead and count, and is exactly the lead's line
    width (`--sh-lead-m`, the same variable the lead already uses, default
    33ch).
  - It fades out over 64 px to the right and about 30 px downwards (feathered
    mask). It stops where each series' subject/products begin.
- **`.hz8-sh-hero__copy::after`** is a thin, weaker strip (opacity .78) behind
  only the breadcrumb line where it is wider than the lead. Its fade is
  complementary to the main layer, so there is no light seam.
- **Glyph-close halo:** the same subtle cream `text-shadow` that lead and count
  already had now also applies to breadcrumb and H1.
- **The guide card gets no extra layer:** the scrim lives inside the copy
  element, not over the guide.
- **Unchanged:** images, crops, focus values, content and functions. No new
  series variable. Desktop rules are untouched (0 px, see below).
- **Static:** no animation, so reduced motion is unaffected and there is no
  fade-in.

### Contrast (`contrast.mjs`)

How it is measured: the text is made transparent, then the background is
photographed behind each text node's line rectangles. The table compares the
**darkest 10 %** of the background with the text colour.
- **with halo (`SHADOW=1`):** what the visitor sees. These figures are the
  acceptance values.
- **without halo:** a conservative alternative, reported in the JSON files.

`runs/contrast-*-320_393_430.json`, `p10` with halo, after:

| Hub | 320 (crumb/H1/lead/count) | 393 | 430 |
|---|---|---|---|
| Magic Sauce | 8.2 / 6.9 / 11.0 / 5.9 | 6.8 / 6.3 / 10.6 / 6.7 | 6.8 / 6.4 / 10.4 / 5.8 |
| THCaB | 5.7 / 5.5 / 9.6 / 5.1 | 5.5 / 5.4 / 9.2 / 5.5 | 5.5 / 5.4 / 9.3 / 5.4 |
| THCbA | 7.5 / 6.6 / 10.5 / 5.6 | 6.6 / 6.2 / 10.4 / 6.8 | 7.0 / 6.3 / 10.8 / 5.5 |
| Nano-11 | 5.5 / 5.7 / 10.1 / 5.8 | 5.6 / 5.6 / 9.7 / 6.0 | 5.6 / 5.7 / 10.2 / 5.4 |
| Core | 5.4 / 6.8 / 9.1 / 4.8 | **4.65** / 5.6 / 8.5 / 5.0 | 5.4 / 6.1 / 8.6 / 4.9 |

- **All values are ≥ 4.5:1.** The H1 (large text, where 3:1 is required) is ≥
  5.3.
- **Before**, measured the same way without halo at 393, the breadcrumb and
  count were 3.7–3.9 on Core and THCaB, i.e. below 4.5 even with the wide
  wash.

### Other tests

| Test | Result |
|---|---|
| 5 hubs × 320/393/430 (`hub-after-…`) | correct counts and shelves, 0 overflow, 0 console errors |
| Cold load + Fast 3G (`load.mjs`, Core, THCbA, Magic Sauce, every painted frame) | the photo is ready at first paint, and **0 frames** have the contrast layer or the hero without the photo, so no white surface flashes |
| Desktop 1440 (5 hubs) and 1920 (Magic Sauce, Core) against before | 0 px. One exception: Nano-11 1440 at 370 px, inside a product image (class 2) |

**Data in the desktop regression shots came late.** The first run happened
during a network outage on the machine (`ERR_INTERNET_DISCONNECTED`). That run
showed differences in stock rows and series-row images that had not arrived.
After rerunning, with `regress.mjs` waiting for pending stock rows, the result
is 0 px.

## 2. Core tile on `/page/butik` (`theme8/js/87-shop.js`)

**The format line is now derived from the hub's real products:**
- it uses `HZ8.cardTypeOf`, the same product-type interpretation as the series
  hub;
- it works from the hub's first page of cards, which are already fetched for
  the tile image;
- that result is unioned with the series' dedicated format routes.

**Ordering:** existing routes keep their order, and formats that exist only in
the hub's products are appended in catalogue order. No new links or routes.

| Tile | Before | After |
|---|---|---|
| Core | Vapes | **Vapes · Buds · Hasch** |
| Magic Sauce, THCaB, THCbA, D10, Nano-11, THCV, HHCPM, THCNM | unchanged | unchanged (same text and order) |

- **No layout shift:** the tile height is the same before and after data
  (133 px at 393, 112 px at 1440).
- 0 overflow, 0 errors (`shop-*.json`).
- The separator ` · ` follows the other tiles. The requested wording
  "Vapes, Buds och Hasch" would make Core the only tile written differently.

## Regressions

- **Pages** at 393/1440: Alla Vapes, Alla Buds, Core series × format, M&S
  Vapes, home and PDP give 0 px. Exceptions: Alla Vapes 1440 at 109 px and
  Alla Buds 1440 at 1 px, inside product images.
- **Functional suite** (`functional-mobile-hero-{base,after}.json`) covers
  filter/history/sort, family tabs, quick-add, PDP purchase and variants,
  Magic Sauce hub, header, mobile menu, mobile and desktop search, and
  cart/checkout. **14/15 are identical.** `home-quick-add` differs only in
  response time (the same product, "Tillagd ✓", POST 200).
- **Checkout:** checkout CSS is not affected (no checkout rules changed).

## Images (`proof/mobile-hero-correction/`)

- `mobile-hero-before-after-{320,393,430}.jpg`: all five hubs, before (top
  row) and after (bottom row), the whole mobile hero plus the format row.
- `core-vs-magic-sauce-393.jpg`: Magic Sauce before/after next to Core
  before/after.

## Remaining visual differences

- **Core at 393:** the breadcrumb's last segment ("Core") is the weakest point,
  at 4.65:1. It is just above the top of the El Gringo pack.
- **The breadcrumb strip is a weak, light edge** that can be faintly visible at
  its right end over a dark sky (THC-B, Nano-11), but much softer than in
  round 1.
- **The lead is still narrow on Core, THCaB/THCbA and Nano-11** (the existing
  `--sh-lead-m`), so the text does not run over the products.
