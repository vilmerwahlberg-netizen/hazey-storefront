# TASK 01F — global header glass and semi-sticky motion

- **Base:** `dev` at `f635252` (Task 01C, pushed).
- **"Before":** a `git archive f635252` build in the session scratchpad.
- **"After":** the working copy.
- **How both run:** the harness in this folder (`lib.mjs`, copied from Task
  01C) injects each build into the real Theme 8 preview
  `?preview=v9kzdmqz4w60l5n`. Nyehandel admin is untouched.
- **Commit:** local only, for the night run (`TASK 01F`). Nothing is pushed
  or published.

## Changed file

`theme8/css/05-header.css` is the only file changed. No JS was changed and no
route-specific overrides were added.

| What | Before | After |
|---|---|---|
| `--hz8-glass-bg` (light glass, shared) | `color-mix(#faf2e4 70%, transparent)` | `color-mix(#faf2e4 60%, transparent)` |
| `html.hz8 #store-header` (show) | `transform 260ms cubic-bezier(.22,1,.36,1)` | `transform 300ms cubic-bezier(.25,.46,.45,.94)` |
| `html.hz8.hz8-header-hidden #store-header` (hide) | 240 ms, same curve | 280 ms, `cubic-bezier(.4,0,.2,1)` |

**Unchanged:**
- blur and saturation (`blur(22px) saturate(1.28)`), border and shadow;
- the dark/photo glass (`#222c18 56%`);
- both no-backdrop-filter fallbacks (95 % / 92 %);
- the reduced-motion rule (1 ms);
- the thresholds (`TOP_ZONE` 180, `HIDE_AFTER` 108, `SHOW_AFTER` 28,
  `JUMP` 320);
- the locks, the tone switching and the header geometry;
- Task 01C's skip of the boot entrance.

## Diagnosis (before changing values)

Run with `diag.mjs` in Chromium and WebKit (the iOS engine), at 393 and 1440
on Alla Vapes.

1. **Reduced motion is not the cause in a normal browser.**
   `matchMedia('(prefers-reduced-motion: reduce)')` was false. The computed
   transition on `#store-header` was `transform 0.26s cubic-bezier(0.22, 1,
   0.36, 1)` with no delay.
   - The only other rules that touch the header's transition are Nyehandel's
     `header { transition: height .3s }`, which Theme 8 overrides, and the
     global reduced-motion rule, which applies only under `reduce`.
   - Nothing overrides the transition while the header is hidden.
   - A phone with iOS **Reduce Motion** switched on *will* get the intended
     1 ms jump. That is the designed fallback and is kept.
2. **The class timing is fine.** `hz8-header-hidden` toggles once per gesture.
   `getAnimations()` shows a running transform transition for the whole
   duration, in both engines.
3. **The cause is the curve.** `cubic-bezier(.22,1,.36,1)` is extremely
   front-loaded. Measured per frame on hide (−120 px at 393):

   | ms after toggle | 0 | 17 | 34 | 51 | 68 | 85 |
   |---|---|---|---|---|---|---|
   | before, px | −35 | −64 | −84 | −97 | −106 | −111 |
   | after, px | −1 | −5 | −12 | −25 | −43 | −60 |

   - About 30 % of the distance is covered in the first frame and about 80 %
     within roughly 70 ms.
   - The page content also moves upward under the finger during that time.
   - Together, on a phone this reads as the bubble vanishing without
     animation, even though the transition technically runs.

   The fix is the shared rule, done once. Hide now uses a soft start (50 % at
   about 85 ms, complete at 250 ms). Show uses Hazey's calm ease-out-quad
   (50 % at about 82 ms, complete at 283 ms). Both stay within the motion
   budget for routine UI (≤ 300 ms), and exit is faster than entry.

## Results (after; full tables in `MEASUREMENTS.md`)

Routes: home, Alla Vapes, Alla produkter, the Magic Sauce hub and a PDP, at
393 and 1440 (10 combinations).

- **Glide is visible on every route.** Hide is 66 / 83 / 166 / 250 ms to
  reach 25 / 50 / 90 / 100 % (before: 0 / 17 / 84 / 167). Show is
  33 / 83 / 200 / 283 (before: 0 / 33 / 84 / 184).
  - The largest single-frame step dropped from 35–39 px to 19–20 px.
  - There is no opacity, scale, bounce or stagger: only `transform`.
- **Quick reversal:** the transition retargets from its current position
  (largest step 20 px), with no jump to the end state.
- **Fast scroll** (70 px per frame) hides once (1 toggle).
- **Top zone** (0–170 px): the header never hides.
- **Anchor-sized jumps** (more than 320 px per frame) show the header, on
  9 of 10 combinations.
  - The exception is Magic Sauce at 1440, in both builds. There the
    600 px jump runs into the end of the page, so it never exceeds the jump
    threshold. This is a test-geometry artefact, not a regression.
- **Locks:** with search, menu or cart open, scrolling down keeps the header
  visible. All three close again afterwards, on all 10 combinations.
- **Keyboard:** with the header hidden, Tab from the start of the document
  focuses the header in 2 presses, the header is revealed, and the focus
  ring is visible.
- **Reduced motion:** the transition duration is `1e-05s`, with 0
  intermediate frames.
- **CLS 0, no horizontal overflow and no new console errors** on all 10
  combinations.
  - An earlier pass reported CLS 0.017–0.028 in *both* builds. That came
    from the test's own focus-start anchor, which sat in the document flow.
    The anchor is now absolutely positioned and the re-run is 0.

### Glass contrast

`verify.mjs` hides the header content and then screenshots the bare glass at
four scroll positions per route. It then computes the contrast between the
header text colour and the darkest 5 % of glass pixels (light tone) or the
brightest 5 % (dark tone).

- **Light glass, worst case after:** 5.81 at Alla Vapes 393, `y520`, over
  dark product photos (before: 7.01). Every measured position stays at or
  above AA 4.5.
  - The typical (median) contrast is 6.4–11.3.
- **Dark/photo glass:** unchanged (6.8–12.9).
- **No compensating adjustment** to blur, border or shadow was needed.

## Proof

- `proof/glass-before-after.jpg`: before and after header glass in context at
  393 and 1440, in four cases:
  - over the Alla Vapes photo;
  - over beige content on the homepage;
  - over the Alla produkter product grid;
  - the dark photo mode on the homepage (unchanged).
- `proof/video-*.webm`: short normal-speed recordings (VP8; boot trimmed).
  - **Steps in each recording:** rest at top, calm scroll down (hide), up
    (show), down and quickly up again, fast scroll, up, search open while
    scrolling (locked), and the top zone.
  - **Overlay:** a small label in the bottom-left corner names the build and
    the step.
  - **Files:**
    - after, 393: `video-after-home-393`, `video-after-alla-vapes-393`,
      `video-after-magic-sauce-393`, `video-after-pdp-393`;
    - after, 1440: `video-after-home-1440`, `video-after-alla-vapes-1440`;
    - before: `video-before-home-393`, `video-before-alla-vapes-393`,
      `video-before-alla-vapes-1440`;
    - reduced motion: `video-after-alla-vapes-393-reduce`.
  - Each video is about 12 s long and 0.5–0.7 MB.

## Scripts and results

- **Scripts:**
  - `diag.mjs` (runtime diagnosis);
  - `verify.mjs` (the full matrix), run by `run.sh`;
  - `stills.mjs`;
  - `record.mjs`, run by `record-all.sh`;
  - `summarize.mjs`, which writes `MEASUREMENTS.md`.
- **Results:**
  - `runs/verify-{before,after}-…json`;
  - `runs/diag-*.json` (Chromium, WebKit and reduced motion).
- Raw header crops (`runs/stills/`) stay local.

## Residual risk

- **Real-device check:** this was tested in Chromium and WebKit emulation,
  not on a physical iPhone. On iOS with Reduce Motion enabled, the header
  intentionally jumps.
- **Transparency over dark photos:** 60 % glass is visibly more transparent
  over dark product photos at the top of the grid. The measured worst case is
  5.8:1, which still passes AA, but visual approval should look at
  `glass-before-after.jpg`, row 3.
