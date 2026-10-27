# Post-admin handoff: Task 04C-C (do not run until you approve)

Start this only after you have created and approved the categories in FIRST-ADMIN-BATCH
and said which optional items were done.

## Preflight (stop if anything fails)

1. `GET /sv/categories/m-s-hasch`: 200, own category-id, H1 "Magic Sauce Hasch", exactly
   Charas + Marrakesh Dream, self-canonical.
2. `m-s-buds`: no hash products, La Chupacabra included (8 buds).
3. If created: `m-s-carts` = 1 cart, self-canonical; `m-s-vapes` no longer contains the cart.
4. Re-run Task 04 scripts (`inventory.mjs`, `membership.mjs`, `combos.mjs`) and diff
   against `route-matrix.json` from 2026-10-27. Only the expected changes may appear.

## Bounded code scope (one local commit, no push)

- `theme8/js/05-header.js`: Hasch → SERIER → Magic Sauce `href` → `/sv/categories/m-s-hasch`
  (and, if created, the Vapes-group carts entry → `m-s-carts`).
- `theme8/js/06-catalog-map.js`: Magic Sauce `extra.carts` → `m-s-carts` if created, otherwise
  leave the filter. `hasch` will then come from the header SERIER link automatically.
- **Pre-rolls (activate now, independent of stock/migration):** `05-header.js` Buds → Pre-rolls `href` (now `null`) →
  `/sv/categories/prerolled`, label "Pre-rolls". No product names or IDs in code. `06-catalog-map.js`: a new
  `FORMAT_DEFS` entry `prerolls` (family `plant`) pointing at the header link, so the broad shell
  (`BROAD_SHELL_FORMATS` in `80-category.js` + `prerolls`) and the hub format shelves pick it up from data.
  Secondary Buds/Hasch membership is read from the real categories and is never inferred in code.
- **Isolat:** nothing. No catalog-map entry, no nav item, no hub/category link (dormant).
- No new template code beyond the one-line `BROAD_SHELL_FORMATS` addition. `contextFor` already resolves dedicated path-only routes to `combo`
  → series × format family. Do not touch the CSS/JS of hub, broad or portal pages.
- `npm run build:theme8` only for local verification. Do not commit generated bundles
  unless that matches repo practice for the batch.

## Verification

- `m-s-hasch` (and `m-s-carts`) render `hz8-sf`, one H1, real count, the parent-format link and
  same-format sibling discovery (`thca-hash`, `thcnm-hash` ↔ `m-s-hasch`).
- `/magic-sauce` hub hasch shelf links the new route. `/hasch` Magic Sauce tab still works.
  `hasch?filters=Serie_Magic Sauce` still keeps the broad shell.
- `/prerolled` renders the broad shell with one H1 "Pre-rolls" and is verified for **0, 1, many and sold-out** products
  (0/1 via request interception of the product list, many/sold-out with current legacy data), plus newly added products
  after the migration. Empty state is truthful, with no fake stock and no hidden header link.
- Secondary placement is never inferred in code; Buds/Hasch show a pre-roll only if the category data says so.
  No link to `/isolat` exists anywhere.
- Controls unchanged: `m-s-vapes`, `m-s-buds`, `thca-vapes`, `blommor-buds`, `alla-produkter`.
- Widths 393 / 1440 / 1920, no horizontal overflow, keyboard focus.
- Report before/after captures and stop locally. No push, no publish, no admin.
