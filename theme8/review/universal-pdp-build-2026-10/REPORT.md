# TASK 10B — Universal PDP adapter from the accepted Faraoh design

- **Base:** `6ab37b5` (10B-0) on `949542d`. Local commits only: nothing is pushed or published, Nyehandel admin is untouched, and no package products were created.
- **"Before":** `git archive 6ab37b5` + build, i.e. the generic template, or the Faraoh pilot on id 57.
- **"After":** the commits below.
- **Harness:** `lib.mjs`, which injects the build into the real Theme 8 preview.

| Commit | Part |
|---|---|
| `253b7bc` | 10B-1: capability profile, adapter guard, variant model and labels, shared purchase decision, sold-out state, analysis classification, 82/83 duplicates off |
| `0050502` | 10B-2: complete Faraoh-faithful page (brand eyebrow, stock + rating row, styled "Bevaka", real "Liknande / Fler i serien" rail, analysis line) |
| `2690200` | 10B-3: package architecture; real package products only, locked review mode, BLOCKED without data |
| (this commit) | 10B-4: verification, matrix, evidence |

## Ownership and files

- **Changed source:**
  - `theme8/js/85-pdp-pilot.js` and `theme8/css/85-pdp-pilot.css`: the adapter, which owns the template.
  - `theme8/js/82-product.js`: the duplicates are not built on adapter pages; only the customer service panel is built.
  - `theme8/js/83-pdp-purchase.js`: the 10B-0 sold-out protection now also runs on adapter pages; "Passar bra med" uses Carts membership instead of the name.
- **10B-0 is preserved:** `HZ8.variantOrderable` and 83's `html.hz8-pdp-out` are used by the adapter, which also honours them.
- **No third PDP.** The class names `hz8-pdp-pilot`/`hz8-pp*` remain from the pilot.

## Which products use the adapter

Every product page with a brand in Nyehandel's purchase area (`.brand a`).

The following stay on the generic template, which keeps 10B-0's protection:
- service items without a brand (Fraktändring, id 20);
- unlisted items without a brand.

Task 10A counted 14 products without a brand. Some of them may be customer products with missing brand data (admin).

`?hz8-pdp=0` turns the adapter off for comparison.

## Result per control product (`CONTROL-MATRIX.md`, `runs/control-matrix.json`)

All 14 controls are **PASS** at both 1440 and 393. Each was checked for:
- adapter;
- variant model and label;
- stock status;
- analysis;
- 1 H1;
- 0 overflow;
- 0 duplicates;
- 0 console errors;
- no legacy tier;
- a purchase CTA, or sold out with "Bevaka".

**Package purchase is BLOCKED** on 84, 91, 92 and 119: Nyehandel has no package products.

| Id | Class | Model / label | Stock | Package rule | Analysis | Status | Evidence |
|---:|---|---|---|---|---|---|---|
| 88 | R1 simple, no packages | simple | in stock | none (quantity) | "på begäran" | PASS | `proof/full-R-88-{393,1440}.jpg` |
| 91 | R2 strain + builder | strain / Strain | partly sold out (2/5) | strain 3/5/collection: **BLOCKED** | PDF **per strain**, follows the selection | PASS (packages BLOCKED) | `proof/full-R-91-*`, `package-review-91-*`, `state-variant-out.jpg` |
| 84 | R3 family 1/3/5/10 | simple | in stock | family 3/5/10, 10 real members: **BLOCKED** | verified PDF (Samurai Jack) | PASS (packages BLOCKED) | `proof/full-R-84-*`, `package-review-84-*` |
| 17 | R4 sold out | size / Vikt | sold out | none | "på begäran" | PASS | `proof/full-R-17-*` |
| 2 | colour | color / Färg | partly sold out (1/5) | none | "på begäran" | PASS | `proof/control-2.jpg` |
| 87 | doft → Strain, no reviews/analysis | strain / Strain | in stock | none | "på begäran" | PASS | `proof/control-87.jpg` |
| 78 | partly sold out, sale, no reviews | strain / Strain | partly sold out | none | "på begäran" | PASS | `proof/control-78.jpg` |
| 92 | cart, PDF per strain | strain / Strain | in stock | strain 3/5/collection: **BLOCKED** | per strain | PASS (packages BLOCKED) | `proof/control-92.jpg` |
| 72 | long title, `&amp;` | simple | in stock | none | "på begäran" (unknown PDF hidden) | PASS | `proof/control-72.jpg` |
| 3 | missing image, sold out | strain / Strain | sold out | none | "på begäran" | PASS | `proof/control-3.jpg` |
| 119 | sale, mis-linked PDF | simple | in stock | family: **BLOCKED** | "på begäran" (Gorilla Cookies COA hidden) | PASS (packages BLOCKED) | `proof/control-119.jpg` |
| 27 | sold-out cart | strain / Strain | sold out | none | "på begäran" | PASS | `proof/control-27.jpg` |
| 57 | Faraoh (regression) | strain / Strain | in stock | none | "på begäran" | PASS | `proof/faraoh-57.jpg` |
| 20 | service item without brand | no adapter | sold out (10B-0) | — | — | PASS | `proof/control-20.jpg` |

## Tests

- **Purchase to Nyehandel's cart** (`buy.mjs`):
  - quantity 2 (88);
  - strain change, where the PDF follows the strain (91);
  - mobile sticky bar (84);
  - Faraoh (57);
  - colour (2).

  All return POST 200 and show the correct row in the cart.
- **Sold out after page load** (`stale.mjs`, 84 at 393 via the sticky bar and at 1440 via the CTA). In all six cases, nothing ends up in the cart and the zone becomes "Slutsåld" (no CTA, quantity or sticky bar). The three modes:
  - `always_orderable` at 0 stock;
  - normal sell-out, which the server rejects with 406;
  - the button removed.

  The message reads "Produkten har tagit slut…", not "försök igen".
- **10B-0 safety suite on the new build:** for 17, 20, 15 and 58, there are 0 visible or focusable purchase controls, 0 cart calls and CLS 0.
- **Packages** (`pkg.mjs`):
  - Normal mode: no package selector (BLOCKED or none).
  - `?hz8-pkg-review=1`:
    - every step is locked: "Paketprodukt saknas", "Paketpris saknas", CTA `disabled` (not focusable);
    - no sticky bar and 0 cart calls;
    - one slot per unit, with sold-out options visible but locked;
    - the gallery height is unchanged (540 / 310 px) at 3, 5, 10 and the collection.
  - A bug found and fixed before the commit: a step chosen before the family data loaded could buy 1 item.
- **Sticky** (`states.mjs`):
  - hidden at rest;
  - shown once the CTA has left the view;
  - hidden near the footer and with the menu open;
  - hidden when the selected strain sells out, where the dock takes over;
  - never shown together with the chapter dock.
- **Keyboard:**
  - Tab goes from the H1 through the review link, strain help, cards, arrows, quantity and CTA, with `:focus-visible` throughout.
  - Arrow keys move between strain cards.
  - On sold-out products the only reachable control is "Bevaka".
- **Reduced motion:** the CTA, cards, sticky bar, dock and to-top have no transitions.
- **Widths:** 320, 393, 430, 768, 1280, 1440, 1512, 1920 and 200 % zoom on R1–R4, plus 393/1440 on all controls. That is 68 + 28 views: 0 horizontal overflow, 0 console errors, 1 H1.
- **Functional suite** (`functional.mjs`, base vs after): 12/15 identical. The 3 differences are intended:
  - Core PDP: the adapter's stock line, and the purchase still returns 200 via the adapter's CTA;
  - Faraoh: the strain cards show a stock line;
  - "Liknande": 9 real cards instead of 7.

  Category filter/history/sort, tabs, home quick-add, the series hub, header, mobile menu, search and quick-add → cart → checkout are unchanged. `allavapes-mobile-sort` fails identically in both, as before.
- **Regression images:** Alla Vapes, the Magic Sauce hub and search, before | after at 393/1440 (`proof/reg-*`), give the same H1 and card counts. The cart image in `regshots.mjs` shows 0 rows both before and after: the test's quick-add selector misses on the category page. The real quick-add → cart → checkout chain is covered by the functional suite.

## Matches the accepted direction

**Following** `pdp-universal-redesign-2026-10/faithful-*` and `pdp-final-handoff`:
- first-viewport composition: gallery + station, brand eyebrow, stock + rating, strain cards with a stock line, price, CTA, micro-trust;
- "Kort om produkten" with the approved botanical assets: desktop composite, mobile plant cutout with the pilot's positioning;
- chapter navigation, four disclosures, "Liknande produkter" before reviews, bestsellers, related categories, customer service, footer.

See `proof/faithful-vs-after-*`.

**Deliberate differences from the faithful image:**
- The package cards with prices (1 599 / 2 530 kr, "Hela kollektionen 4 099 kr") are not shown, because Nyehandel has no package products. That is a hard rule. The review mode shows the structure locked.
- The "Kort om produkten" heading uses the real "Kort om produkten" and the product's own introduction, not the mockup copy "En serie. Flera strains.".
- The review cards are real: no placeholder reviews.
- There is no green "X strains i lager" box in the image and no fake thumbnail rail. Thumbnails appear only with several real images.

## Remaining dependencies (admin / migration / decisions)

1. **Package products (BLOCKED, launch blocker):**
   - Create package products in Nyehandel with WooCommerce's fixed prices (PACKAGE-RULES.md): strain builders 91/92 (3/5/9K, where the collection in Nyehandel has 5 strains versus 9 in WooCommerce), the Magic Sauce 50% 5g family (84, 59, 60, 74, 77, 93, 96, 100, 119, 120: 3/5/10), Nano11 (41, 112).
   - Verify each in the cart and checkout (price, rows, stock deduction, and the `packageProductVariants` format), then enter them in `PACKAGE_PRODUCTS` with `verified: true`.
   - Ten-packs, mixed strains, the collection and 3 för 2 stay BLOCKED until then.
2. **Legacy tier:** Nyehandel still applies −15/−20 % in the cart at 3+ items of the same variant. The PDP does not advertise it, but the price shown at quantity 3+ is the cart's real price. Remove the tier in admin before launch.
3. **PDFs:**
   - Fix the mis-linked files (120, 119, 77, 82, plus Tinky Winky on 59/60).
   - Copy decision for batch/distillate reports (Nano10, Nano11, HHCPM).
   - Verify the 16 files without a WooCommerce counterpart.
   - All of these show "på begäran" today.
4. **"Bevaka":** Nyehandel's own button, kept and styled. The alert function itself is not verified.
5. **Brand missing** on some customer products, which then do not get the adapter (see Task 10A).
6. **Bästsäljare** uses the store's own bestseller source. "Senast besökta" appears only when Nyehandel's list has 2 or more other products.

## Evidence to review (`proof/`)

| What | Files |
|---|---|
| R1–R4 full pages, before \| after | `full-R-{88,91,84,17}-{393,1440}.jpg` |
| Accepted direction → after | `faithful-vs-after-first.jpg`, `faithful-vs-after-{1440,393}.jpg` |
| Faraoh regression | `faraoh-57.jpg` |
| First viewport 320/430/768 and 1280/1512/1920/200 % | `widths-mobile-{id}.jpg`, `widths-desktop-{id}.jpg` |
| Sticky / dock | `state-sticky-393.jpg` |
| Sold-out strain selected | `state-variant-out.jpg` |
| Packages, locked review mode | `package-review-{91,84}-{393,1440}.jpg` |
| Sold out after page load | `stale-sold-out.jpg` |
| Other controls | `control-{2,87,78,92,72,3,119,27,20}.jpg` |
| Regression | `reg-{category,hub,search}-{393,1440}.jpg`, `reg-cart-checkout.jpg` |

**Other documents:**
- `CAPABILITY-MATRIX.md`: rules per module.
- `CONTROL-MATRIX.md`: results.
- `ANALYSIS-VERIFIED.md`: verified PDFs.
- `runs/*.json`: raw data.
- Scripts: `capture`, `profile`, `buy`, `stale`, `pkg`, `states`, `regshots`, `functional`, `matrix`, `sheet`.
