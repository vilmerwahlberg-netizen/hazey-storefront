# TASK 01B — Series hub navigation and shelf cleanup

Work from the accepted `origin/dev` state after TASK 01A has been reviewed and pushed. This is a narrow correction of the existing reusable series hub, first verified on Magic Sauce. Do not redesign the approved hero, header, product cards, format shelves, lower service block or footer.

## Problem to solve

The current Magic Sauce hub has three visible UX defects:

1. The local format navigation (`Alla`, `Vapes`, `Carts`, `Buds`, `Hasch`) is presented as a flat full-width pale strip. It does not match the warm rounded glass shelf used by the approved series × format template.
2. Horizontal product shelves show a grey native scrollbar on desktop even though arrow controls already communicate horizontal movement.
3. The bottom action `Visa hela sortimentet i Magic Sauce (12)` is redundant and misleading: the visitor is already on the complete Magic Sauce hub and every product is already exposed by format above. It opens a duplicate native grid.

## Required result

### A. Format navigation

- Keep the existing local-anchor behavior and counts. These are section navigation controls, not links that reload another page and not catalog filters.
- Restyle the navigation as one compact, rounded, warm translucent/glass shelf aligned to the shared content width.
- It may overlap the lower hero edge slightly if measurement proves safe, but it must never obscure hero copy, product content or header.
- Remove the full-viewport flat white/pale band appearance.
- Reuse the visual language of the approved series × format shelf, without copying its route logic.
- Active state remains clear without a heavy filled tab.
- On mobile it may scroll horizontally, but its native scrollbar must remain hidden. Preserve keyboard access, focus visibility and 44 px touch targets.

Visual language references:

- `theme8/review/series-format-template-r3-assets-2026-10/external/ms-vapes-1440-first.png`
- `theme8/review/series-format-template-r3-assets-2026-10/external/ms-vapes-393-first.png`

### B. Product rails

- Hide the native grey scrollbar for series-hub product rails at all widths.
- Preserve mouse/touch/trackpad scrolling, keyboard access, scroll snapping and the existing previous/next controls.
- Scope this to the series hub in `81-series-hub.css`; do not silently change product rails globally.
- Confirm single-product Carts does not stretch and long Buds/Hash rails remain usable.

### C. Remove the redundant duplicate grid

- Do not create or show the `Visa hela sortimentet i [series]` / `Dölj hela sortimentet` toggle on the reusable series hub.
- Keep the native duplicate grid hidden on the hub. The four visible format shelves remain the complete hub presentation.
- Do not remove `Visa alla` actions belonging to an individual format shelf; those lead to the relevant dedicated SEO category or accepted fallback route.
- Keep the lower `Serier` navigation, but the current series must not link back to the page the visitor is already viewing.

## File ownership

Prefer only:

- `theme8/css/81-series-hub.css`
- `theme8/js/81-series-hub.js`
- a new review folder under `theme8/review/series-hub-polish-2026-10/`

If another production file is genuinely required, stop and explain why before editing it.

## Regression controls

Verify at 393, 1440 and 1920:

- Magic Sauce hub top, every format shelf and page ending.
- A second series hub if one exists in the catalog map.
- Magic Sauce Vapes dedicated series × format page is pixel-unchanged outside normal loading noise.
- Alla Vapes, Allt Hasch, homepage and Faraoh PDP are unchanged.
- No native horizontal scrollbar is visible, while rails still move by arrows, trackpad/touch and keyboard focus.
- Format anchors update/retain hash behavior correctly and land below the sticky header.
- 0 px page-level horizontal overflow and no new console errors.

## Deliverable and stop condition

Provide before/after images for the hub at 393, 1440 and 1920, including:

- hero-to-format-navigation transition,
- a long product rail,
- the bottom series navigation and service/footer transition.

Report exact changed files and test results. Stop without staging, committing, pushing or publishing. Do not touch Nyehandel admin.
