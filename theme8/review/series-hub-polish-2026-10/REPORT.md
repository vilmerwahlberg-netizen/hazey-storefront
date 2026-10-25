# TASK 01B — Series hub polish: final status

> **FINAL (2026-10-25): delivered.** Everything below this section is
> history from earlier rounds. The round 1 result **43/44** is
> **historical and superseded** by the final results here.

| Check | Result |
|---|---|
| Interaction suite (`interact.mjs`, 393/1440/1920) | **59/59 pass** |
| Mobile dock suite (`dock.mjs`, 320/393/430 × normal/reduced motion) | **120/120 pass** |
| Desktop Magic Sauce hub 1440/1920 vs round 2 (`regress.mjs magic-sauce`) | **0 px** (top/mid/end, same height) |
| Regression, 6 other routes × 393/1440/1920 vs HEAD `29b0881` | **16/18 at 0 px; 2 dynamic** (see below) |
| Console errors / horizontal overflow | 0 / 0 everywhere |

External preview (GitHub Pages, no local injection) is verified after the
push and reported in the delivery message.

## Final round — mobile format dock (2026-10-25)

Files: `theme8/css/81-series-hub.css`, `theme8/js/81-series-hub.js`.
Desktop format shelf, hero, product cards and all other pages are
unchanged (the dock is `display: none` from 768 px).

**Before:** five separate cream pills in a 56 px tray (Alla + 4 formats),
active = orange-outlined pill. Near the bottom the dock lay over the
customer service block.

**After:** one continuous segmented control in the same warm glass as the
desktop format shelf (`--sh-glass-border`, `--sh-glass-blur`, `#fbf3e4`
at 76 % for legibility over moving content, solid fallback without
backdrop-filter), 52 px tall, radius 16.
- Four equal segments: Vapes, Carts, Buds, Hasch (in-page anchors). "Alla"
  stays only in the page's own format row.
- Hairline sand dividers between segments, hidden next to the active one.
- Active = warm tinted segment (`--hz8-cta` 9 % on cream, 1 px warm ring)
  + an 18×2 px `--hz8-cta-fill` line, cross-faded in 0.2 s; text semibold
  `--hz8-pilot-green`. No transitions with reduced motion.
- Every segment 44 px tall (73 px wide at 320, 91 at 393, 101 at 430); no
  horizontal scroll needed, scrollbar hidden anyway (`scrollbar-width: none`).
- Visibility: only mobile, only after the page's own format row has left
  the view (never both), hidden behind overlays, and now also hidden as
  soon as the hub's end (after the series row) enters the view. It
  therefore never covers customer service or the footer. A 0-height
  sentinel `.hz8-sh-end` marks the hub end.
- Consequence: tapping **Hasch** (the last, short shelf) lands correctly
  at 90 px and the dock retracts, because the hub ends in the same view.
  Vapes likewise shows the page's own format row instead of the dock.
  `aria-current` is still set in both navs.
- Unchanged: `aria-label` "Snabbval: Magic Sauce efter format",
  `aria-hidden`/`inert` while hidden, focus moves to the shelf title,
  scroll spy, `holdAnchor` deep links, scroll-padding (76 px) keeps
  focused buy buttons above the dock.

**Dock suite (`dock.mjs test`, 20 checks per width/motion mode):**
hidden at top; shows after the format row; 4 segments ≥ 44 px, no clipped
labels; ≤ 52 px; no scrollbar or list overflow; reduced-motion durations;
screen-reader label; six anchor taps (with the header both visible and
hidden beforehand) land exactly at the shelf's scroll-margin (90 px)
below the header with the right segment active, focus in the shelf and no
buy button under the dock; dock + visible header without overlap; scroll
spy Vapes→Carts→Buds→Hasch; rapid up/down scrolling ends in the right
state; keyboard Tab + visible 2 px focus ring + Enter navigates; a sweep
from the format row to the page end every 90 px never overlaps customer
service, footer or header; 0 overflow; 0 console errors.

A fixed bottom bar always passes over content while scrolling; product
buy buttons pass under it mid-scroll (as before) but are never covered at
anchor landings, and every button can be scrolled clear above it.

**Images (393, before | after):** `compare/dock-393-1-normal.png`,
`compare/dock-393-2-active.png`, `compare/dock-393-3-header.png`,
`compare/dock-393-4-bottom.png` (single shots in `shots/dock/`).

**Regression note:** Allt Hasch differs at 1440 mid (77 px) and 1920 top
(143 px) in a single text chip on one card ("THCNM" vs "THCaB" for
"THCA 20% + THCNM 20% – Malaga Magic"). The same diff appears when the
**after build is compared with itself**, and round 2 vs final gives 0 px:
it is load-order-dependent data (class 2, dynamic content), not this
change. All other 16 comparisons are 0 px.

---

# History: earlier rounds (superseded)

## Changed files (only the allowed ones)

| File | Change |
|---|---|
| `theme8/css/81-series-hub.css` | **A** Format row → warm glass shelf (the same material values as the series × format shelf, mirrored as `--sh-glass-*` because the hub has no `.hz8-sf`), plain text tabs of 44 px, active = semibold + a 32 px orange line, measured overlap into the hero. **B** `scrollbar-width: none` + `::-webkit-scrollbar` on the hub's product rails only. Removed the dead `.hz8-sh-allbtn`/toggle styling. |
| `theme8/js/81-series-hub.js` | **C** The pilot hub no longer creates "Visa hela sortimentet / Dölj hela sortimentet". The native grid stays hidden through the existing CSS. In the lower "Serier" row the current series loses its `href` and gets `aria-current="page"` (the same element, so image and count still load). |
| `theme8/review/series-hub-polish-2026-10/` (new) | Scripts `capture.mjs`, `interact.mjs`, `regress.mjs`, images, measurements, this report. |

## A — Format navigation

- **One rounded shelf:** a single warm translucent glass shelf at the shared
  content width.
  - Radius 20 px (18 on mobile), `blur(20px) saturate(1.14)`, background
    `#fbf3e4` at 63 %, a fine sand border.
  - Solid fallback without backdrop-filter.
- **No full-width band:** the flat pale `100vmax` band is gone.
- **Hero overlap, measured:**
  - The decorative line "Sunsets & Higher Horizons" ends 26 px above the
    hero's bottom edge at both 1440 and 1920. A 14 px overlap gives exactly
    12 px clearance there.
  - 768–1179 px and mobile: no overlap, 12 px gap (the guide card sits in
    the flow).

  Measured clearance to the nearest hero content:

  | Width | Clearance |
  |---|---|
  | 393 | 26 px |
  | 1024 | 44 px |
  | 1440 | 12 px |
  | 1920 | 12 px |

- **Behavior unchanged:** local anchors, counts, scroll spy and `aria-current`.
- **Touch and focus:** every tab measures 44 px (before: 36 px visual plus
  an invisible hit area); focus ring 2 px olive.
- **Mobile:** the shelf scrolls inside its own rounded surface with the
  scrollbar hidden. All five tabs fit at 393 today, and overflow scrolls
  horizontally.
- **The sticky dock is unchanged** (separate transient control, outside the
  prompt).

## B — Product rails

- **Scrollbar hidden only in the hub:** computed `scrollbar-width: none`
  and `::-webkit-scrollbar display:none` on all hub rails.
  - Before on desktop: `thin`/`block`.
  - Other pages' rails (THCaB hub, Faraoh) still have `thin`.
- **Movement still works at 393/1440/1920:**

  | Method | Result |
  |---|---|
  | Arrow buttons (desktop) | 1328 / 1408 px |
  | Trackpad/wheel | 352–664 px |
  | Keyboard focus on the last card | Scrolls in and lands in view |

  Scroll snap `x mandatory` is kept.
- **Single-product Carts:** the card is exactly as wide as the Buds cards
  (150/312/332 px), so it doesn't stretch.

## C — Duplicate grid

- **Button removed:** "Visa hela sortimentet i Magic Sauce (12)" no longer
  appears at any width (before: present everywhere).
- **Native grid stays hidden,** so the four format shelves are the complete
  hub.
- **"Visa alla" per format is kept:**
  - `m-s-vapes`
  - `alla-cartridges?filters=Serie_Magic+Sauce`
  - `m-s-buds`
  - `hasch?filters=Serie_Magic+Sauce`
- **"Serier" row:** kept with 9 series. "Magic Sauce" is shown as "you are
  here" without a link and is not a tab stop; the 8 other series are links.

## Verification

**Interaction tests** (`interact.mjs`): **43/44 after (historical — superseded by 59/59 final)** (before: 33/44; the
11 extra failures are exactly the defects the task names).

| Area | Result |
|---|---|
| Anchors | Clicking "Buds" sets `#magic-sauce-buds` and marks the format active; the shelf lands at 90–98 px, below the header; Back returns. |
| Rails | Scrollbars hidden; arrows, wheel and keyboard focus move the rail; single cards don't stretch. |
| Shelf | 44 px tabs, visible focus ring, no toggle, grid hidden. |
| Series row | Current series not linked; "Visa alla" kept. |
| Mobile dock | Shows mid-page with the correct format and hides at the footer. |
| Page | 0 px horizontal overflow and 0 console errors at every width. |

- **The one failure is pre-existing,** not caused by this change: a direct
  link to `#magic-sauce-hasch` lands at 62 px in **both** before and after.
  - A lazily loaded row above the target shrinks the page by 36 px during
    the smooth scroll.
  - In normal flow the semi-sticky header is hidden there (6/6 runs before
    and after: header hidden, nothing covered).
  - The test caught a moment where the cookie click had brought the header
    back, giving 18 px overlap at 1920.
  - Not fixed; see open questions.

**Regression** (`regress.mjs`): **18/18 comparisons 0 px**.
- Covers the top, middle (scrollY 1000) and page end.
- Routes: Magic Sauce Vapes (series × format), the THCaB hub (second hub,
  generic path), Alla Vapes, Allt Hasch, the homepage and Faraoh PDP at
  393/1440/1920.
- Identical document heights, 0 overflow, no console errors.

## Images

Before/after side by side (`compare/`):

| View | Files |
|---|---|
| Hero → format nav | `hero-nav-393.png`, `hero-nav-1440.png`, `hero-nav-1920.png` |
| Long rail (Buds) | `long-rail-393.png`, `long-rail-1440.png`, `long-rail-1920.png` |
| Series row → customer service → footer | `bottom-393.png`, `bottom-1440.png`, `bottom-1920.png` |
| Full page | `full-393.png`, `full-1440.png`, `full-1920.png` |

The single images are in `shots/` (before/after × 1 hero-nav, 2 long rail,
3 bottom, 4 full page) and the measurements in
`shots/*-geometry.json`, `interact-*.json` and `regress/`.

Headless Chromium draws overlay scrollbars, so B is proven through computed
styles, not through screenshots.

## Deviations and open questions

1. **THCaB and the other series without a pilot configuration** run on the
   older generic hub path. It still has its own "Visa hela sortimentet"
   button and its own nav. I left it unchanged because those rails show a
   format sample, not the whole assortment; there the button is the only
   path to the full series grid. This needs a decision before that path is
   cleaned up or the series are moved onto the pilot.
2. ~~The mobile dock still has the older pill chips.~~ Resolved in the
   final round.
3. **Pre-existing:** a deep link to a format can land 36 px too high
   because of a layout shift during the smooth scroll. It's harmless today
   because the header is hidden at that point. A simple fix (re-aligning
   once after the content has settled) is possible in `81-series-hub.js`
   if you want it.


## Round 2 — final correction (2026-10-25)

Same files as above. Hero, format shelf, product rails, header, footer,
mobile dock and all other pages are frozen. Hero→nav and the long rail are
**0 px different** from round 1 at 393/1440/1920.

1. **Deep link** (`81-series-hub.js`, `holdAnchor`):
   - After the first scroll, a `ResizeObserver` watches the hub's actual
     layout (`.hz8-sh`).
   - On each size change above the target, the target is re-aligned
     instantly to its own `scroll-margin-top` (header reserve + 18 px).
   - It stops when the layout has been still for 600 ms, or immediately on
     the visitor's own scroll input (wheel, touch drag, keyboard). A click,
     for example on the cookie banner, does not stop it. The 8 s cap is
     only a safety net.
2. **Spacing:** `.hz8-sh-after` padding-bottom 40 → 8 px. The service
   block's own top margin (40/56 px) is unchanged. The soft tone gradient
   now starts below the series row instead of over it.
3. **The current series tile** keeps its active marking and
   `aria-current="page"`, but gets `cursor: default` and
   `pointer-events: none`, so no hover state can be triggered (touch
   scrolling still reaches the list). The other 8 series are ordinary links
   with `cursor: pointer`.

### Deep-link position (`#magic-sauce-hasch`, target top after settled layout)

| State | 393 | 1440 | 1920 |
|---|---|---|---|
| Direct link, no interaction (header visible, ends at 72/80) | 90 (= scroll-margin 90) | 98 (= 98) | 98 (= 98) |
| Direct link + cookie click during loading | 90 | 98 | 98 |
| Header shown afterwards by an upward scroll | 150 | 158 | 158 |
| Header hidden (scrolled down), in-page anchor navigation | 90, header hidden | 98, header hidden | 98, header hidden |

Before the correction a deep link ended at 62 px at every width: a 36 px
layout shift during the smooth scroll. Covered only when the header was
visible.

### Spacing between the series row and customer service

| Width | Before (with button) | Round 1 (button removed) | Round 2 |
|---|---|---|---|
| 393 | 142 px | 80 px | **48 px** |
| 1440 | 156 px | 94 px | **62 px** |
| 1920 | 156 px | 94 px | **62 px** |

### Tests

- **`interact.mjs`: 59/59 PASS.** The suite grew from 44:
  - The deep-link test now runs in 4 states per width (+9).
  - `series-current-inert` and `series-to-service-gap` were added per
    width (+6).
- **`regress.mjs`: 18/18 comparisons at 0 px.** Covers Magic Sauce Vapes,
  the THCaB hub, Alla Vapes, Allt Hasch, the homepage and Faraoh at
  393/1440/1920; same heights, 0 overflow, no console errors.
- **New images:**
  - `compare/bottom-393/1440/1920.png`
  - `compare/full-393/1440/1920.png`
  - round 1's after images are saved in `shots/round1/`.

### Remaining open questions

Question 1 (the generic hub path for THCaB and others) remains open.
Questions 2 and 3 are resolved.
