# Task 01 evidence and acceptance contract

This is a technical **Refine/repair** task. No new page design or image asset
is needed. The already accepted fully loaded Theme 8 render is the visual
reference.

## Confirmed visible defects

- `evidence/current-desktop-footer-gap.png` — thin warm/light strip between
  page canvas and the dark footer field on desktop.
- `evidence/current-mobile-footer-reserve.png` — large light reserve below
  the footer on mobile.
- Cold loading can expose Nyehandel/native or obsolete Oliverforss styling
  before Theme 8 CSS/JS becomes ready. This is a timed behavior and must be
  demonstrated with a recording or frame sequence, not represented by a
  fabricated static mockup.

## Target appearance

### Successful load

1. The viewport begins on a quiet Theme 8 warm canvas while assets load.
2. The accepted page appears once ready, without an intermediate old header,
   product grid, footer or other legacy layout.
3. The warm boot treatment is not a splash screen and must not remain visible.

### Failure

If CSS or JavaScript fails or times out, the mask releases and the usable
native page is shown. A blank or permanently covered page is a release blocker.

### Footer end

The actual footer is the final painted document surface. There is no white,
cream or differently toned strip after it. Internal footer padding and mobile
sticky-purchase clearance remain intact.

## Evidence required from implementation

- Cold-cache frame sequence at 393 and 1440 showing boot → ready.
- Throttled-load frame sequence at 393 and 1440.
- CSS-failure and JavaScript-failure screenshots proving fail-open behavior.
- Exact bottom-of-document captures at 393, 1440 and 1920 on every route in
  `PROMPT.md`.
- Before/after measurements for document height, footer bottom, viewport
  bottom color and horizontal overflow.
- Loaded-state visual diffs proving the accepted header, hero, product cards,
  sticky controls and footer content did not change.

## Human gate

Stop locally after evidence and tests. No commit, push, admin edit or publish
before the loading sequence and footer-end captures are visually reviewed.
