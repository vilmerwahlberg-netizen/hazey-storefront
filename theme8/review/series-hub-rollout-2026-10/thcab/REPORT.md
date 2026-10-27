# 04C-B1 — THCaB series hub (`/sv/categories/thca`)

- **Base:** `dev` at `6f6df13` (01D-R3).
  - "Before" = `git archive 6f6df13` + build.
  - "After" = the working copy.
  - Both are injected into the real Theme 8 preview by the harness
    (`../lib.mjs`, `SH_BASE`).
- **Commit:** local, not pushed; Nyehandel admin untouched.

## Change

**`theme8/js/81-series-hub.js`**
- One `"THCaB"` entry in `SERIES_PILOTS`, using the same renderer as Magic
  Sauce:
  - hero (three exact WebPs);
  - lead "En serie. Flera format.";
  - guide copy taken from the package prototype;
  - formats vapes/carts/buds/hasch.
- Generic, optional extensions; Magic Sauce has none of these values, so its
  rendering is unchanged:
  - `hero.pos`: the image's vertical focus on desktop/wide. THCaB uses
    `50% 34%`, because the products sit higher in the photo.
  - `hero.posTablet`: the focus at 480–767 px and 200 % zoom (`50% 68%`).
    Otherwise only the foreground is visible.
  - `hero.leadMobile`: the lead width on mobile (`min(21ch, 46vw)`), so the
    text ends before the packs. Measured contrast behind the lead went from
    4.3 → 5.4–6.2.
  - The seal/script decor is rendered only when `seal` and `script` exist;
    only Magic Sauce has approved decor.

**`theme8/css/81-series-hub.css`**
- `object-position: var(--sh-art-pos, 50% 100%)`.
- A 480–767 rule with `var(--sh-art-pos-t, 50% 100%)`.
- Mobile lead `max-width: var(--sh-lead-m, 33ch)`.

**`theme8/assets/series-thcab-hero-2026-10/`:** the three supplied WebPs, copied
unchanged (1920×744, 1512×664, 900×1802).

## Live data (Nyehandel, 2026-10-27)

Union of the hub (2 pages) plus `thca-vapes`, `thca-carts`, `thca-blommor` and
`thca-hash`, deduplicated on canonical URL:

| Shelf | Products | Source of "Visa alla" |
|---|---|---|
| Vapes | 3 | `/sv/categories/thca-vapes` |
| Carts | 2 (one of them sits in Nyehandel's thca-vapes; classified by name) | `/sv/categories/thca-carts` |
| Buds | 16 (including "Isolat – THCA 99 %", which is in both buds and hash; shown once) | `/sv/categories/thca-blommor` |
| Hasch | 9 | `/sv/categories/thca-hash` |
| **Total** | **30**, the same as the hub's own count; 0 duplicates | |

Stock, price, rating and images come from the cards. Sold-out items show
"Slutsåld" (Live Resin 2 ml / 1 ml).

## Tests (`runs/*thcab*.json`, `runs/regress-diff.json`)

| Test | Result |
|---|---|
| 320/393/430, 1440/1920, 200 % | 1 H1, the same shelves and counts, 0 overflow, 0 console errors |
| Deep link `#thca-hasch` (1440/393) | lands at 98/90 px under the header (80/72 px), Hasch active |
| Chip click → back → forward | hash `#thca-hasch` ↔ `""` ↔ `#thca-hasch`, title focused |
| Keyboard: CTA + Enter | `#hz8-sh-nav`, focus on the first chip |
| Mobile dock (393) | row and dock both visible 0/24 |
| Partial failure (`thca-vapes` aborted) | all 30 products still there (via the hub), the only error is the aborted request itself |
| Slow (+2.5 s per category fetch) | data after 10.5 s, complete, no state errors |
| Regressions (top 0–2400 px): Magic Sauce 393/600/1440, Alla Vapes, M&S Vapes, home, PDP | 0 px. Exceptions: Alla Vapes 1440 1–18 px and home 393 921 px, both inside product rails (dynamic content, class 2) |

**One transient case:** in one 393 run the shelves' data had not arrived after
~8 s (no state, no error). Three later runs loaded within 0.1 s. The readiness
mask covers the hero and row, so this is platform latency, not a regression,
and it occurred the same way before (Magic Sauce uses the same data path).

## Images (`proof/thcab/`)

- `reference-vs-after-full.jpg`: full-page reference vs after, at 1440 and 393.
- `before-after-first-view.jpg`: the old generic hub vs the new one, first
  view.
- `responsive-after.jpg`: 320/393/430/200 %/1920.

## Remaining differences / debt

- **The H1 is Nyehandel's own "THC-A".** The reference shows "THCaB" (the
  shelves say "THCaB Vapes"). Changing the H1 is a copy/admin decision.
- **The reference's lower module "Fortsätt utforska"** corresponds to the
  existing series row. As on Magic Sauce, the current series is shown as
  "här är du" without a link.
- **The reference hero is taller (~650 px) than the shared hub's (446/483 px)**,
  which is locked by Magic Sauce. The focus point compensates.
- **The "Om kategorin" text** (Nyehandel's category description) appears below
  the series row, as on Magic Sauce.
