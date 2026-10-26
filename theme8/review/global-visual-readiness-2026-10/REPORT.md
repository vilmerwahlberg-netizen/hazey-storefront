# TASK 01C — global visual readiness and transition stability

Committed to `dev` as `fix(theme8): stabilize visual readiness and deferred
content` after visual approval. Theme 8 is not published and Nyehandel admin
is untouched.

- **Base:** `dev` at `15518e4` (Task 03, already pushed).
- **"Before":** the HEAD build. It is made in the session scratchpad with
  `git archive HEAD` followed by `node build-theme8.js`.
- **"After":** the working copy, built with `node build-theme8.js`.
- **How both run:** the harness in this folder (`lib.mjs`, copied from
  Task 01) injects both builds into the real Theme 8 preview,
  `?preview=v9kzdmqz4w60l5n`.

All tables are in `MEASUREMENTS.md`. Only a curated subset of the raw runs is
committed in `runs/*.json`: the final before/after matrices, fail-open, zoom,
navigation and functional results. Intermediate diagnosis runs and the raw
`logs/` stay local. Proof sheets are in `proof/`.

## Round 2 — correction before commit (final state)

Requested by Vilmer after round 1. Everything else from round 1 is kept
unchanged: the readiness contract, the sidebar fix, the removed DOM loops,
the PDP wait, fail-open and the 2.5 s cap.

1. **Magic Sauce hub shelves no longer hold the page.**
   - The shelf container gets `data-hz8-defer`. Pending markers and images
     *inside* such a region no longer hold the mask.
   - The container's own `.is-loading` marker still counts. It clears at the
     same moment as the hero count, the hero lead and the format row are
     filled, all from one data call (`seriesUnion`). This means the page
     never reveals with an empty format row or with hero text that changes
     afterwards.
   - After that the shelves keep loading inside their existing reserved
     geometry: card images and the stock line (`.hz8-pstock.is-pending`,
     reserved height).
2. **The header is complete straight away after a masked boot.**
   - `initHeaderEntrance()` now skips the entrance whenever the page was
     masked (`hz8-settling`/`hz8-boot`), the same path reduced motion
     already used. No empty bubble grows.
   - The round-1 `onReady` deferral is removed again; it is no longer
     needed.
   - The semi-sticky hide/show on scroll (`initHeaderScroll`) is untouched,
     and is measured identical before/after (`header-scroll.mjs`).

**Round-2 results** (table "Round 2" in `MEASUREMENTS.md`; Magic Sauce hub,
Alla Vapes, filtered MS Carts and PDP at 393/1440, cold, warm and Fast 3G
with CPU 4×; plus a cold sanity pass over the other routes):

- **No empty header phase.** 0 ms painted in the entrance phase on every
  run. Before: about 1.1 s on every load.
- **Magic Sauce hub reveals earlier.**

  | Hub, cold | boot→ready, round 1 | boot→ready, round 2 |
  |---|---|---|
  | 393 | 1.5–1.6 s | 0.75 s |
  | 1440 | 1.5–1.6 s | 0.75 s |

  - Complete first paint at 1440: 1.40 s, versus 1.70 s for the old
    *complete* page.
  - Warm: about 1.05 s from boot to ready.
  - The shelves then fill for 0.43–0.52 s after reveal with **CLS 0**,
    0 moved controls and no native elements.
- **No sidebar and no native green CTA.** 0 sidebar px and no native CTA on
  every run.
- **No layout shift or overflow.** CLS after reveal ≤ 0.002 on every run,
  0 overflow, and no new console errors. The only errors are the fixtures'
  own expected messages: the loader's "could not be loaded" log and the
  injected syntax error.
- **Fast 3G + CPU 4×.**
  - The hub still reaches the 2.5 s cap, because its data call itself takes
    longer than that. The hero count, the lead and the format chips then
    fill into their reserved row after reveal (0 moved controls, CLS
    ≤ 0.001), the same as in round 1.
  - Filtered MS Carts and Alla Vapes at 1440 behave as in round 1: at the
    cap, 2–4 and 3 controls still move. Before: 7–14 and 3.
- **Navigation chain** (393/1440, clicks, back, forward and reload): 0 header
  phase, 0 pending, 0 sidebar, 0 moved controls, CLS ≤ 0.002.
- **Filter panel** opens, closes via Escape and via the close button, and
  reopens. Tab reaches the closed panel 0 times.
- **Functional suite.** `functional.mjs` is identical to base on all 14 steps
  (filter, history, sort, family tabs, quick-add, PDP buy, Faraoh variant
  buy, hub, header nav, mobile menu, search and cart drawer).
- **Fail-open.** All six fixtures (MS Carts 1440) still end on a visible,
  usable page; never-ready releases at the cap.

## Worktree at start, and Task 03 status

- Task 03 had stopped: no other agent or Playwright process was running.
  The only `claude` process was this session.
- Four tracked files were already modified before this task. None of them
  is an owner file here, and all were left untouched:
  - `.gitignore`
  - `agent-skills/…/decisions.md`
  - `01-global-boot-footer/review/lib.mjs`
  - `01-global-boot-footer/review/loaded-diff.mjs`
- 1,926 untracked paths were left in place.
- During the session, `agent-skills/hazey-commerce-design/references/component-language.md`
  changed (one added line, 19:04). This task did not change it, and it was
  left as is.

## Root causes (runtime evidence)

| Visible defect | Owner | Evidence |
|---|---|---|
| Unfinished page revealed. "Bundle booted" was treated as "ready". | `00-bootstrap.js` removed `hz8-boot` right after the synchronous `mount()` calls. | `probe.mjs` / `why.mjs`. On filtered MS Carts the page was revealed with these still unfinished in the viewport: 7 `.hz8-rail__item.is-loading` shelf tiles, unloaded shelf images and a pending `HZ8.watch` pass. The toolbar was rearranged after reveal (`hz8-sf-has-shortcuts`, 140 ms debounced watcher). |
| `#sidebar` flash: about 48 px at 1280 in the original report, and the full 420 px panel at x = 0 in the probe. | `80-category.css:274` | Nyehandel keeps the closed panel at `left:-500px`. Theme 8 sets `left:0; translateX(-104%)` with a 0.28 s transition, and it applies in the same task that reveals the page. The closed panel therefore *slides* out of view. Measured before: 334 836–492 480 visible px on every route that has the panel. Even when fully closed it stayed `visibility:visible`: 10 focusable controls off-canvas, Tab moved into it 6 times, focus stayed inside it after closing, and its 60 px shadow bled into the viewport. |
| Native/green actions before Theme 8 was complete. | Same early reveal. | PDP before: Nyehandel's light-green `Lägg i varukorgen` `rgb(74,222,128)` and white −/+ buttons in the first painted frame (`proof/pdp-393-cold.jpg`). Category before: the native white sort button ("Publiceringsdatum") and the untransformed toolbar. |
| "Ready" could never be detected on category pages. | `80-category.js` `syncCount()` and `81-series-hub.js` stock label. | Both wrote `textContent` unconditionally inside `HZ8.watch`. Each flush was itself a DOM mutation, which started the next flush 140 ms later, indefinitely. This was measured as about 7 flushes per second for as long as the page stayed open (`mutation-loop.mjs`). It is a pre-existing CPU cost on every category and series-hub page. |
| Toolbar jumps about 140 px after reveal (Alla Vapes desktop). | `80-category.js` `loadDims()`. | "Produkttyp" is unhidden only when the type data has been fetched. Measured 180 ms after reveal. |
| PDP buy row jumps 274 px after reveal (intermittent at 393). | `83-pdp-purchase.js` `loadVariants()` and Nyehandel's Vue. | The variant stock, pack builder and buybar are built after an async `product/state` POST. Nyehandel's own Vue component sometimes renders `#product-variants` (height 0 → select) only after Theme 8's boot (`pdp-variants-trace.mjs`). |

## The readiness contract (exact signals)

The bundle now owns its own mask, `html.hz8-settling`, defined in
`01-base.css` with the same warm surface as the loader mask: `--hz8-bg`
`#ede9e8`, body `visibility:hidden; opacity:0`.

- The bootstrap adds the mask on the first line of `boot()`.
- It removes the mask (together with `hz8-boot`) only when all three of these
  hold for **two consecutive animation frames**:
  1. `HZ8.watchBusy()` is false, so no debounced DOM sync is pending;
  2. no element matching
     `[aria-busy='true'], .is-loading, .is-pending, .hz8-series-pending`
     is visible in the *current* viewport (`#sidebar`, `#cartAside` and
     `[hidden]` are excluded; zero-size elements are ignored);
  3. no visible `img` in `#store-header` / `#store-main` is still loading.

  Markers and images *inside* a `[data-hz8-defer]` region (round 2:
  the hub shelves) are skipped; the region's own marker still counts.
- **Cap:** `READY_CAP` is 2.5 s from boot and always applies (`setTimeout`,
  so it also fires in background tabs). It is not a sleep: 52 of 52
  cold/warm/zoom loads settled before the cap.
- **Diagnostics:** `__HZ8_DIAGNOSTICS__.bootMs`, `.readyMs` and
  `.readyReason` (`settled` | `cap`).

Page modules join the contract with markers that already existed or are one
attribute, never with a sleep:

- **Shelf:** existing `.is-loading` markers.
- **Toolbar** (non-portal broad pages): `aria-busy` on `.hz8-ptool__desk`
  until `loadDims` resolves or fails. That element is `display:none` on
  mobile, so it does not delay mobile.
- **PDP:** `aria-busy` on `.product-detail__information` until the
  `product/state` data has arrived. For products with more than one variant
  it also waits until Nyehandel's variant `<select>` exists.

Why the loader is **unchanged:** the loader already pasted in admin releases
`hz8-boot` 100 ms after the script loads. If readiness were tied to
`hz8-boot`, it would need an admin paste to work. With its own class, the
current admin loader works as is. Its CSS-error, JS-error and 6 s timeout
paths are untouched.

## Files changed (no generated file edited by hand; `dist/` rebuilt with `node build-theme8.js`)

| File | Change |
|---|---|
| `theme8/js/00-bootstrap.js` | Readiness contract, `data-hz8-defer` regions, cap, diagnostics. |
| `theme8/js/02-shared.js` | `HZ8.watchBusy()` (read-only). |
| `theme8/js/05-header.js` | Round 2: no entrance animation after a masked boot (same path as reduced motion). The header is complete at reveal; scroll hide/show is unchanged. |
| `theme8/js/80-category.js` | `syncCount` writes only on change (ends the perpetual loop). Toolbar `aria-busy` until the type/volume data is in (not on the portal). |
| `theme8/js/81-series-hub.js` | The stock label writes only on change (ends the perpetual loop). Round 2: the shelf container is a `data-hz8-defer` region. |
| `theme8/js/83-pdp-purchase.js` | Purchase zone `aria-busy` until the variant data and Nyehandel's select exist. |
| `theme8/css/01-base.css` | `html.hz8-settling` mask (two rules). |
| `theme8/css/80-category.css` | The closed `#sidebar` is `visibility:hidden` (inert). Its visibility is released only after the 0.28 s close slide. While masked, the panel has no transition at all. Opening and closing are unchanged. |
| `theme8/review/global-visual-readiness-2026-10/` | New: this report, measurements, scripts, logs, runs and proof sheets. |

`theme8/blocks/loader-theme8-dev.html` is unchanged.

## Before → after (excerpt; full tables in `MEASUREMENTS.md`)

**Metric definitions:**

- **pending:** ms during which the page is painted while visible markers or
  images are still unfinished.
- **sidebar:** maximum visible px of the closed panel, including its shadow.
- **ctrl Δ:** visible controls in the first painted frame whose colour or
  text changed, that disappeared, or that moved more than 2 px before the
  final state.

| Cold, 1440 (final run) | first paint B → A (ms) | pending B → A | sidebar px B → A | ctrl Δ B → A |
|---|---|---|---|---|
| Start | 695 → 674 | 75 → 42* | 0 → 0 | 0 → 0 |
| Alla produkter | 379 → 945 | 108 → 0 | 0 → 0 | 0 → 0 |
| Alla Vapes | 353 → 1448 | 56 → 0 | 0 → 0 | 2 → 0 |
| Allt Hasch | 338 → 1215 | 51 → 0 | 0 → 0 | 0 → 0 |
| Magic Sauce hub | 331 → 2484 | 1303 → 0 | 0 → 0 | 0 → 0 |
| Magic Sauce Vapes | 573 → 1322 | 379 → 0 | 410 400 → 0 | 1 → 0 |
| Filtered MS Carts | 323 → 1338 | 697 → 0 | 410 400 → 0 | 8 → 0 |
| PDP | 617 → 890 | 55 → 0 | 0 → 0 | 4 → 0 |

\* The home bestseller rail arrives at the fold edge after reveal (dynamic
content; see the residuals).

- **Breadth:** the same holds at 393 and 1920, warm, and at 200 % zoom (720
  CSS px, DPR 2).
- **Sidebar:** 0 visible px on every route, width and state in the after
  build.
- **Pending, cold/warm/zoom:** 0 on every route except home's bestseller rail.
- **ctrl Δ, cold/warm/zoom:** 0 on every route and width, including all 12
  PDP runs.
- **Overflow and errors:** no horizontal overflow and no new console errors
  anywhere.

**Time to reveal.**

- After boot, cold/warm/zoom: p50 574 ms, p90 1.4 s, max 2.0 s, every one a
  genuine settle (52 of 52).
- The first paint now comes later by roughly the time the old page used to
  spend visibly unfinished, sometimes more.
- Worst case, the Magic Sauce hub at 1440:
  - Before: paint at 331 ms plus 1303 ms unfinished, so a complete page at
    about 1.63 s.
  - After: the complete page appears at 1.77 s in one run and 2.48 s in the
    final run.
  - Its series shelves are the slowest async content above the fold.
- Absolute times vary between runs by up to about 0.7 s because of machine
  load.

**Throttled** (CPU 4×, Fast 3G, CSS +1.8 s, JS +1.4 s):

- 6 of 16 settle and 10 reveal at the 2.5 s cap, with Theme 8's existing
  warm skeletons.
- Sidebar: 0 px everywhere.
- Native CTA: never.
- Remaining unfinished time after the cap: 0.4–2.1 s on category pages and
  3.1–4.2 s on the Magic Sauce hub (its series shelves).
- Moving controls after the cap: 2–4 on filtered MS Carts and 3 on Alla
  Vapes 1440. Before: 7–14.

**Fail-open** (home and MS Carts, 393 and 1440, 24 runs). Every run ends on a
visible, usable page with no mask left:

| Fixture | Ends on | First paint (after) |
|---|---|---|
| CSS error | native page | 0.31–0.40 s |
| JS network error | native page | 0.28–0.39 s |
| JS syntax error | native page | 0.36–0.40 s |
| Bundle that never boots | native page | 0.36–0.46 s |
| CSS never answers | native page (6 s timeout) | 6.23–6.27 s |
| Bundle boots but readiness is never met | Theme 8 | 2.79–2.95 s (cap 2.5 s from boot) |

**Navigation** (`nav.mjs`, 393 and 1440, after build):

- Steps: Alla Vapes → click → Allt Hasch → click → Magic Sauce → click →
  Magic Sauce Vapes, scrolled to 1,068–1,200 px → click a product → back,
  back, forward → reload with scroll 900.
- Every step: 0 pending, 0 sidebar px, 0 control changes, no overflow and no
  errors.
- Before: the sidebar flashed on every Magic Sauce Vapes visit, including
  back, forward and reload, and 1–3 controls moved.

**Function after readiness** (same script):

- **Filter panel:** opens through Theme 8's "Filter & sortera → Alla filter"
  (420 px in view, focus inside). Escape closes it (hidden, focus out). The
  native button reopens it, and the close button closes it.
- **Keyboard:** Tab reaches the closed panel 0 times (before: 6, and focus
  stayed in the closed panel).
- **Header:** the desktop dropdown and the mobile drawer open.

`functional.mjs` (the stability-audit suite, copied here) gives identical
results for base and after on all 14 steps:

- Alla Vapes filter, history and sort, and mobile sort;
- the Hasch and Buds family tabs;
- home quick-add, PDP buy and Faraoh variant buy;
- the Magic Sauce hub;
- header navigation, mobile menu, mobile and desktop search, and the cart
  drawer.

The only difference is a click timing. These steps put a product in the
*test browser's* cart; no order was created.

Proof sheets (`proof/`):

- **Round 2 (final code):** `magic-sauce-hub-1440-cold`,
  `magic-sauce-hub-393-cold`, `magic-sauce-hub-393-throttled`,
  `ms-carts-1440-cold`, `pdp-1440-cold`.
- **Round 1, still valid for these routes:** `ms-carts-393-throttled`,
  `alla-vapes-1440-cold`, `pdp-393-cold`, `home-393-cold`. They show the
  round-1 header entrance.
- **After only:** `failopen-*`.
- **Diagnosis:** the raw frame of the open sidebar plus the empty header in
  the before build.

## Residuals and risk

1. **Header entrance (resolved in round 2).** It is skipped after a masked
   boot. It can only still play if the bundle boots without any mask, which
   the current loader never does.
2. **Home bestseller rail.**
   - The cards arrive after reveal at the fold edge (top at 751 px on a
     852 px viewport), behind the existing skeleton.
   - Their lazy images then load for 26–50 ms (29–506 ms of measured pending
     on home).
   - This is dynamic lower content (class 2), not an unfinished control.
3. **Slow networks are bounded, not perfect.** At 4× CPU + Fast 3G most
   pages reach the cap and reveal with the existing skeletons. That is
   bounded fail-open by design.
   - The Magic Sauce hub's data call can take longer than the cap. Its hero
     count/lead and format chips then fill in after reveal (into a reserved
     row; CLS ≤ 0.001, 0 moved controls).
   - Its shelves fill for 2.5–3.2 s afterwards in the deferred region.
4. **Later first paint.** Routes reveal later than the old *half-built*
   page. In round 2 the hub reveals its complete top earlier than the old
   complete page did (1.40 s vs 1.70 s at 1440). Other routes show a warm
   mask for about 0.2–1.5 s instead of a half-built page.
5. **Back-navigation scroll restoration is off in both builds.** This is
   pre-existing, not caused or fixed here.

   | Scrolled to | Restored, before | Restored, after |
   |---|---|---|
   | 1,068 px (1440) | 82 px | 150 px |
   | 1,200 px (393) | 181 px | 130–144 px |

   Reload restores exactly (900 → 900). This is worth its own task.
6. **Pre-loader white frames.** The 0–200 ms before the JavaScript field can
   run are unchanged (the Task 01 residual). They need a Head/CSS-field
   pre-mask and admin approval.
7. **Intermittent Alla Vapes loop.** A card-chip / count rewrite loop was
   seen once and was not reproducible in four further runs. If it occurs,
   the cap bounds it.
8. **Variant UI without a `<select>`.** A PDP whose variant UI is not a
   `<select>` would wait for the cap (2.5 s) before revealing. Current
   products use `<select>`.
9. **Measurement conditions.** Load average was about 15 (other apps), so
   absolute milliseconds are indicative.
   - One Playwright job ran against the preview at a time.
   - At 393 the first nav click (→ Hasch) does not navigate in either build:
     the harness picks a link in the closed mobile drawer. The other three
     clicks cover internal navigation.
10. **Deploy.** Nothing is live. To reach the Theme 8 preview, the rebuilt
    bundle must be pushed (GitHub Pages). No admin paste is needed, because
    the loader is unchanged.

## Re-run

```sh
# Build "before" in a scratch folder.
git archive 15518e4 build-theme8.js theme8/js theme8/css theme8/blocks package.json | tar -x -C <dir>
# Then link node_modules into <dir> and run node build-theme8.js there.
export T01C_BASE=<dir>
./run-matrix.sh      # cold/warm 393/1440/1920, throttled 393/1440, zoom200, six fail fixtures
./run-rest.sh        # nav/history/function for both builds + frame sheets (SHEET=1)
./run-round2.sh      # round 2: target routes cold/warm/Fast 3G, sanity, fail-open, nav, functional, sheets
node summarize.mjs   # -> MEASUREMENTS.md
```

Diagnostics:

- `probe.mjs`: per-frame sidebar, header and cards.
- `why.mjs`: what holds readiness.
- `mutation-loop.mjs`: perpetual watch loops.
- `pdp-variants-trace.mjs`: the PDP variant area during load.
- `rules.mjs`: which CSS rules control `#sidebar`.
- `header-scroll.mjs`: header hide/show on scroll, before vs after.
- `snap.mjs`: above-fold markup at boot versus settled.
