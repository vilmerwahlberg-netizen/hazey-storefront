# 04C-B2 — THCbA series hub (`/sv/categories/thcb`)

- **Base:** `dev` at `ceb240a` (THCaB).
  - "Before" = `git archive ceb240a` + build.
  - "After" = the working copy.
- **Commit:** local, not pushed; Nyehandel admin untouched.

## Change

**`theme8/js/81-series-hub.js`**
- One `"THCbA"` entry in `SERIES_PILOTS`:
  - the hero WebPs;
  - focus `pos 50% 45%`, `posTablet 50% 78%`;
  - mobile lead `min(21ch, 46vw)`;
  - formats vapes/carts.
- **New generic option: the lead may contain `{formats}`.**
  - The renderer fills in the live formats (capitalized at the start of a
    sentence), so the prototype's "Vapes och carts samlade i en tydlig
    serieöversikt." is generated from data.
  - If the cart source becomes empty, it reads "Vapes samlade i …"; an empty
    format never appears in the copy.
  - The template text is never shown before the data: the lead is empty and is
    filled at the same time as the count, under the readiness mask.
  - A lead without `{formats}` keeps the old behaviour, i.e. Magic Sauce and
    THCaB are unchanged.
- **Guide text:** "Utforska serien efter format." The prototype's "Två format
  – …" hardcodes the number of formats and is therefore not used.

**`theme8/assets/series-thcba-hero-2026-10/`:** the three supplied WebPs,
unchanged.

**`theme8/css/81-series-hub.css`:** comment only.

## Live data (2026-10-27)

Hub `thcb` (4) ∪ `thcb-vapes` (3) ∪ `thcb-carts` (1):

| Shelf | Products |
|---|---|
| Vapes | 3: Faraoh 35 % 1 ml, Tatra Hemp 20 % 2 ml, Tatra Hemp 20 % 1 ml |
| Carts | **1** (one-item state): Tatra Hemp 20 % 1 ml |

Total 4, the same as the hub's own count; 0 duplicates.
- **Stand-in replaced:** the reference's repeated Faraoh cart image is a
  stand-in, and the real cart (Tatra Hemp) is shown instead.
- **Stock:** sold-out items have "Slutsåld".

## Tests (`runs/*thcba*.json`, `runs/regress-diff.json`)

| Test | Result |
|---|---|
| 320/393/430, 1440/1920, 200 % | complete, 0 overflow, 0 console errors |
| Deep link `#thcb-carts` | 98/90 px under the header (80/72), Carts active |
| Chip → back → forward | correct hash, title focused |
| Keyboard CTA + Enter | the format row, focus on the first chip |
| Mobile dock | the page is short; the dock never appears (0/18), never together with the row |
| Partial failure (`thcb-vapes` aborted) | all 4 products still there via the hub |
| Slow fetch (+2.5 s) | complete |
| **Regressions against `ceb240a`:** THCaB hub, Magic Sauce hub, Alla Vapes, M&S Vapes, home, PDP at 393/1440 | 0 px, except THCaB 393 195 px and Alla Vapes 1440 6 564 px. Both are inside a product image that had not finished its fade-in (the crop shows the same image at different opacity; class 2, dynamic) |

## Images (`proof/thcba/`)

- `reference-vs-after-full.jpg`
- `before-after-first-view.jpg`
- `responsive-after.jpg`

## Remaining differences / debt

- **The H1 is Nyehandel's "THC-B"** (the reference shows "THCbA"). That is a
  copy/admin decision.
- **On mobile the products sit partly behind the guide card** (bottom-anchored
  crop). This is the same principle as on Magic Sauce: the pack peeks out
  above the glass.
- **The reference's "Fortsätt utforska"** corresponds to the existing series
  row (current series without a link).
