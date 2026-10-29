# TASK 10B-0: Sold-out product pages, safe and truthful

- **Base:** `dev` = `949542d`.
- **"Before"** is `git archive 949542d` + build.
- **"After"** is the working copy.
- **Harness:** `lib.mjs`, a copy of the 04A harness. It injects each build into the real Theme 8 preview.
- **Scope:** a standalone fix. It is not the universal PDP from Task 10B.
- **Not touched:**
  - the bundle builder, tier pricing ("Köp mer – betala mindre"), PDP layout, the pilot template (`85-pdp-pilot.*`), header, footer, category pages, admin and checkout;
  - Nyehandel's own "Bevaka" button.

## Root cause

**1. Dead active CTA in the mobile buy bar.**
`83-pdp-purchase.js` `syncBuybar()` treated a *missing* native buy button as purchasable. The label became "Lägg i varukorgen" and the button was enabled. A click only scrolled the page. This happens when Nyehandel replaces the buy button with "Bevaka", as it does when a sold-out variant is selected on a partly sold-out product (id 91/78, `proof/variant-out-*`). It also happens when the button disappears after the bar was built (Task 10A X1).

**2. Sold-out products could be ordered.**
Products 15 (THC-H 500 puffs) and 20 (Fraktändring) are `buyable` and `always_orderable`, with 0 in stock. The status Nyehandel then shows is `negative_inventory_status` "Slut på lager", which has `orderable: false`. Nyehandel still kept the buy button active. Theme 8 had three readings of stock:
- the PDP trusted the native button;
- `HZ8.productState` counted `always_orderable` as in stock;
- `83`'s `isBuyable` required `available_stock > 0`.

The real server accepts the order. A `POST /frontend-api/cart/item` for variant 49 returns **200**, while sold-out regular variants get **406 `{"available":0}`** (`runs/server-cart-probe.json`, fresh session cart, no order placed).

**3. The sold-out flag came from the wrong source.**
`82-product.js` set `html.hz8-pdp-out` from Nyehandel's `#stock.is-negative`. That class is `is-positive` on products 15 and 20, which also showed a green dot with "Slut på lager".

## Change (owning files only, no CSS end block)

**`theme8/js/02-shared.js`: one definition, `HZ8.variantOrderable(v)`.**
- A variant is orderable if it is buyable and active, and either:
  - it has stock (or is not stock-tracked), or
  - it is `always_orderable` **and** the status Nyehandel shows at 0 in stock (`negative_inventory_status`) is itself `orderable`. That would be a real back-order status.
- `HZ8.productState` (cards, quick-add, bestsellers, catalog, cart tips) uses it.
- The cache key is bumped (`state6`) so old session values are dropped.
- Effect on cards: products 15 and 20 can no longer be quick-added. Their status reads "Slut på lager" instead of "Finns i lager".

**`theme8/js/83-pdp-purchase.js`: owner of the purchase decision on the generic PDP.**
- `isBuyable = HZ8.variantOrderable`.
- `soldOut()` is true when there is no native buy button, or when the selected variant is not orderable. The button's own `disabled` does not count, because Nyehandel disables it while an add is in flight.
- `syncSoldOut()` sets `html.hz8-pdp-out`.
- The mobile buy bar is built hidden. It is shown only when the selected variant can be bought, and is removed completely (`hidden`) when sold out. Sold out means no disabled-but-visible control and no `hz8-has-buybar` padding.
- The bar's own observer starts when the buy row exists, so it also works when a sellable variant is chosen later.
- **Buy click (capture phase):**
  - If sold out, the click is stopped.
  - For an `always_orderable` variant, the click first fetches fresh `product/state`. Purchasable means the click is passed through; sold out means "Slutsåld" and **no** cart call. In today's catalog this is 3 variants (15 and 20, both sold out; `runs/stock-flags.json`).
  - Every other variant goes straight to Nyehandel, with no delay; its server rejects a sold-out variant (406). Stock data is then refreshed so the buy row becomes "Slutsåld".

**`theme8/js/82-product.js`:** the incorrect `hz8-pdp-out` assignment is removed. The comment points to its owner.

**`theme8/css/82-product.css`, next to the existing `#stock` and buy-row rules:**
- When `html.hz8-pdp-out` is set:
  - the badge shows **"Slutsåld"** (`content: "Slutsåld" / ""`, so screen readers read the platform status once, not twice);
  - it uses the existing sold-out colours;
  - `.buy-form` (quantity and buy button) is not shown.
- Price, tier pricing, variant selection, description, reviews, "Liknande produkter", navigation and Nyehandel's "Bevaka" are unchanged.

## Control products and states (393 and 1440, before → after)

| Product | State | Before | After |
|---|---|---|---|
| 17 Great White Shark | sold out, size variants | "Slut på lager" + "Bevaka", no buy bar | **"Slutsåld"** + "Bevaka", no buy bar, 0 cart calls |
| 20 Fraktändring | `always_orderable`, 0 in stock | green "Slut på lager", **active button; product was added to the cart** (drawer in `proof/soldout-20-393.jpg`), active buy bar | **"Slutsåld"**, no buy row, no buy bar. Programmatic click and the bar: **0 cart calls** |
| 15 THC-H 500 puffs | same, 2 variants | same as 20: 2 cart calls | same as 20: 0 cart calls |
| 58 Bangkok (X1) | sold out | "Slut på lager" + "Bevaka" | "Slutsåld" + "Bevaka" |
| 91 Magic Sauce (2/5) and 78 Core (2/4) | sold-out variant selected | "Bevaka" in the station, **but an active "Lägg i varukorgen" in the mobile buy bar** | "Slutsåld", buy bar hidden, 0 focusable buy controls |
| 91 / 78 | then switch to an in-stock variant | buy row and bar | buy row and bar come back ("Lägg i varukorgen – 595/495 kr"), buy button focusable |
| 84 Samurai Jack (simple) | in stock | added via buy bar (393) and main button (1440), drawer shows the row | **identical**: drawer shows the row, 0 errors |
| 87 Magic Farmers (variant "Tart Apricot") | in stock | as above | **identical** |
| 84, sold out after page load | see below | item added to cart, or a dead active bar remains | blocked or rejected; the page becomes "Slutsåld" |

**Sold out after page load** (`stale-*`, `proof/stale-*`):

| Case | Before | After |
|---|---|---|
| `always_orderable` variant whose stock hits 0 after load | **POST 200, row in the cart** | **no cart call**, the page becomes "Slutsåld" and the bar is hidden |
| Regular variant (server 406, the real response) | POST rejected, but **the bar stays active** | POST rejected by Nyehandel, then the page becomes "Slutsåld" and the bar is hidden |
| Nyehandel removes the buy button | **active "Lägg i varukorgen" remains** in the bar (X1) | bar hidden, "Slutsåld" |

**Accessibility and behaviour:**
- **Keyboard:** Tab from the H1 through the purchase area.
  - Sold out: no buy control receives focus (only variants, tier pricing, "Bevaka" and links).
  - In stock: the buy button is focusable.
- **Screen reader** (`ariaSnapshot`): the H1, the price and the status are read once.
- **Reload and history** (393 and 1440):
  - 20 → reload → 84 → back → forward shows Slutsåld / Slutsåld / purchasable / Slutsåld / purchasable;
  - 0 cart calls.
- **Reduced motion:** the in-stock buy bar transition is ~0 s, as before. Sold out has no buy bar, so there is nothing to animate.
- **Layout:** CLS 0, horizontal overflow 0 and one H1 on every view.
- **Console:** 0 new errors. The only error appears in `stale-sold-normal`: the 406 response from the simulated server, which is the same before and after.

## Regression

- **Functional suite** (`functional.mjs`, base vs after, final build): **15/15 identical** apart from timing fields. It covers:
  - a category page (Alla Vapes filter, history and sort);
  - Hasch and Buds tabs;
  - home quick-add;
  - the Core PDP buy (POST 200);
  - Faraoh, the pilot (variant change and buy);
  - the Magic Sauce series hub;
  - header navigation and the mobile menu;
  - mobile and desktop search (25 hits);
  - quick-add → cart drawer → checkout showing the product.

  `allavapes-mobile-sort` fails identically in both, as before.
- **In-stock purchase latency** (click → POST): unchanged for every in-stock product, because they go straight to Nyehandel.
  - An intermediate version checked every click first and added 300–800 ms. It was replaced (the older `runs/verify-after-soldout_variants_…` file is not committed).
  - Final, measured 3 times each (`runs/latency-{before,after}-{1,2,3}.json`, 84 and 87 at 393 and 1440, 12 clicks per build): before 42–197 ms (median 95), after 50–318 ms (median 104). The slowest value in both builds came from 84 at 1440. The path in-stock purchases take has no added request (the click goes straight to Nyehandel), so the difference is network variation.

## Evidence

- **`proof/`, before | after:**
  - `soldout-{17,20,15,58}-{393,1440}` (buy station and scrolled view);
  - `variant-out-{91,78}-{393,1440}`;
  - `stale-{393,1440}`;
  - `instock-{84,87}-{393,1440}` (control: unchanged).
- **`runs/`:**
  - `verify-*` (all steps);
  - `functional-{base,after}`;
  - `probe-*`;
  - `server-cart-probe.json`;
  - `stock-flags.json` (always_orderable and stock for all 232 variants).
- **Scripts:** `verify.mjs`, `probe.mjs`, `functional.mjs`, `sheet.mjs`, `summarize*.mjs`, `compare-functional.mjs`.

## Remaining (admin, migration, Task 10B)

- **Admin (A1):** products 15 and 20 have "Alltid beställbar" but show "Slut på lager". Theme 8 now treats them as sold out. If Fraktändring should be purchasable, it needs stock or a purchasable status in admin. It is also a service item that appears in listings (A3).
- **"Bevaka":** Nyehandel's own stock alert is visible on sold-out products (17, 58, 91/78 sold-out variant). It was not added or changed here. Whether it actually sends an alert is not verified (the status is `watchable: true`), so it needs a decision or test in 10B.
- **Not changed (Task 10B / decision #4):**
  - tier pricing "Köp mer – betala mindre" is still shown on sold-out products;
  - "0 av 3 strains i lager" says "strains" for size variants;
  - the pilot template (57) has its own sold-out logic. Its `isBuyable` ignores `always_orderable`, which is safe today.
- **Card quick-add:** it reads `HZ8.productState`, which is cached for 30 minutes per session. A product that sells out in that window is rejected by Nyehandel's server (406), except an `always_orderable` variant. Today only 15 and 20 are `always_orderable`, and they are now never offered.
