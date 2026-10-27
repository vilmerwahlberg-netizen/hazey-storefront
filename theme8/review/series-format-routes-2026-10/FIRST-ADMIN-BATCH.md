# First admin batch: Magic Sauce + Pre-rolls (proposal, not created)

Target: the migrated WooCommerce assortment. Migration steps: `../category-route-master-map-2026-10/MIGRATION-CHECKLIST.md`.

Items 1–2 are new categories that do not exist yet. Item 4 exists but is hidden. Nothing has been changed. This is a checklist for you to work through in Nyehandel admin.
When you're done, tell Claude to run the Task 04C-C verification (`POST-ADMIN-HANDOFF.md`).

## 1. New category: Magic Sauce Hasch (recommended)

- [ ] **Name:** `Magic Sauce Hasch`
- [ ] **Slug:** `m-s-hasch` → `/sv/categories/m-s-hasch`
- [ ] **Products (exactly 2):**
  - Hash – Magic Sauce 50% – Charas – 5 gram
  - Hash – Magic Sauce 50% – Marrakesh Dream – 5 gram
- [ ] **H1:** Magic Sauce Hasch (H1 = category name in Nyehandel)
- [ ] **Intro (category description):** Hasch i Magic Sauce-serien från Magic Farmers, samlad på en sida. Jämför sorter, förpackningar och pris.
- [ ] **SEO title** (if the field exists): Magic Sauce Hasch – Magic Farmers | Hazey.se
- [ ] **SEO description** (if the field exists): Hasch i Magic Sauce-serien från Magic Farmers. Se alla sorter, förpackningsstorlekar och priser i Hazeys sortiment.
- [ ] **Parent/placement:** same as `M.S Buds` (`m-s-buds`). *Confirm in admin where that one sits.*
- [ ] **Visible in the native menu?** Same setting as `M.S Buds`. *Confirm.*
- [ ] **At the same time, in `M.S Buds`:** remove Charas and Marrakesh Dream, and add **Buds – Magic Sauce 50% – La Chupacabra – 5 gram**.

Why: the 2 hash products are real, and the header already lists Magic Sauce under Hasch → SERIER.
Today they sit inside "M.S Buds", which is wrong. The filter URL canonicalizes to `/hasch`
and can never be its own landing page. Duplicate risk: none once they're removed from M.S Buds.
The same products also appear on `/magic-sauce` (hub) and `/hasch` (parent), which is intended.

## 2. New category: Magic Sauce Carts (OPTIONAL, your decision)

Recommendation: **wait.** There's only 1 product, which makes a thin page. Create it only if you want
complete Magic Sauce format navigation (precedent: THCA/THCB Carts also have 1 product each).

- [ ] **Name:** `Magic Sauce Carts`
- [ ] **Slug:** `m-s-carts` → `/sv/categories/m-s-carts`
- [ ] **Products (exactly 1):** Cart – Magic Sauce 99% – 1ml
- [ ] **H1:** Magic Sauce Carts
- [ ] **Intro:** Carts i Magic Sauce-serien från Magic Farmers, samlade på en sida.
- [ ] **SEO title:** Magic Sauce Carts – Magic Farmers | Hazey.se
- [ ] **SEO description:** Carts i Magic Sauce-serien från Magic Farmers. Se volym och pris i Hazeys sortiment.
- [ ] **Parent/placement + menu visibility:** same as `M.S Vapes`. *Confirm.*
- [ ] **At the same time, in `M.S Vapes`:** remove Cart – Magic Sauce 99% – 1ml.

If you skip item 2: decide whether the cart should stay in M.S Vapes. Alla Vapes treats carts
as a filter within vapes, so leaving it there is defensible. Just say which.

## 3. Membership fix outside Magic Sauce (quick)

- [ ] `THCA Carts`: add **Cart – THC-A 50% Live Resin – Faraoh – 1ml**.

## 4. Make Pre-rolls public now (not blocked by stock or the migration)

The category already exists, hidden: `/sv/categories/prerolled` (id 70). No new URL.

- [ ] **Publish/activate** the category.
- [ ] **Customer name/H1:** `Pre-rolls` (today it is "PreRolled"). Keep the slug `prerolled`. *Confirm the slug is unchanged.*
- [ ] **Intro:** Pre-rolls i Hazeys sortiment, samlade på en sida. Jämför sorter, innehåll och pris.
- [ ] **SEO title / description** (if the fields exist): Pre-rolls | Hazey.se / Alla pre-rolls hos Hazey.se. Jämför sorter, cannabinoidinnehåll och pris.
- [ ] The header link is activated in the Task 04C-C code step right away; it does not wait for stock.
- Current products: 4 legacy pre-rolls, sold out. They leave with the migration. **Nothing to investigate**
  (the Bangkok question is resolved by the migration).
- After the migration: each new pre-roll is in Pre-rolls **and** in Buds (flower) or Hasch (hash), according to real
  product data or explicit admin categorization. See `MIGRATION-CHECKLIST.md`.

## 5. Isolat: nothing to do

- `/isolat` stays dormant and hidden. Do not link or delete it.
- The 2 legacy isolates and their memberships in Buds/Hasch/THCA/CBD disappear in the migration
  (checklist step 5). Not a blocker.

## To confirm in admin and report back (do not guess)

- [ ] Do categories have their own SEO title/description fields?
- [ ] Does renaming a category change its slug? (Relevant if `M.S Vapes/Buds` are renamed to "Magic Sauce …".)
- [ ] Is `noindex, nofollow` on hazeyse.nyehandel.se a host-only setting, or does it also apply to the production domain?
- [ ] Where do `m-s-vapes`/`m-s-buds` sit in the category tree (parent)?
