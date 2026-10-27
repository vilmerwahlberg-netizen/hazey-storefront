# 04C-B4 — Nano-11 series hub (`/sv/categories/nano-11`)

- **Base:** `dev` at `ce18e40` (THCbA).
  - "Before" = `git archive ce18e40` + build.
  - "After" = the working copy.
- **Commit:** local, not pushed; Nyehandel admin untouched.

## Change

**`theme8/js/81-series-hub.js`**
- One `"Nano-11"` entry in `SERIES_PILOTS`:
  - the hero WebPs and the same focus/lead-width settings as THCbA;
  - formats buds/prerolls;
  - lead `{formats} från Nano-11-serien.`;
  - guide copy "Upptäck serien / Hela Nano-11 samlat efter format. / Se
    produkterna". The prototype's "Två format – …" hardcodes the number of
    formats and is not used.
- **New generic rule from the design contract** ("guide card when the series
  has more than one meaningful format"):
  - when fewer than two formats have products, the guide card is hidden and
    the hero gets `is-one-format`;
  - this is set at the same time as the count, under the readiness mask, so
    there is no jump after reveal;
  - Magic Sauce, THCaB and THCbA have ≥ 2 formats and are unchanged.

**`theme8/css/81-series-hub.css`:** `.hz8-sh-guide[hidden] { display: none
!important }`. The card's own `display: grid` would otherwise override
`hidden`.

**`theme8/assets/series-nano11-hero-2026-10/`:** the three supplied WebPs,
unchanged.

## Live data (2026-10-27)

Hub `nano-11` (8) ∪ `nano11-blommor` (8), deduplicated:

| Shelf | Products |
|---|---|
| Buds | **8** (all `Buds – 7% Nano11 – … – 5 gram`, Tatra Hemp) |
| Pre-rolls | **0** → no shelf, no chip, no copy |

**Discrepancy with `SERIES-DATA.md`:**
- The intended Pre-rolls do not exist live. No pre-roll route exists
  (`/pre-rolls` 404), and no pre-roll name is in the hub or in `blommor-buds`.
- The page therefore shows Buds only; nothing is fabricated.
- The format row shows "Alla 8 · Buds 8".

## Tests (`runs/*nano11*.json`, `runs/regress-diff.json`)

| Test | Result |
|---|---|
| 320/393/430, 1440/1920, 200 % | complete, guide hidden, 0 overflow, 0 console errors |
| Deep link `#nano-11-buds` | 98/90 px under the header, Buds active |
| Chip → back → forward | correct |
| Keyboard | no hero CTA (guide hidden); format row and shelf title reachable |
| Mobile dock | short page; the dock never appears (0/18) |
| Partial failure (`FAIL_PATH=/sv/categories/nano11-blommor`) | all 8 products still there via the hub |
| Slow fetch (+2.5 s) | complete |
| Regressions against `ce18e40`: Magic Sauce, THCaB, THCbA, Alla Vapes, M&S Vapes, home, PDP at 393/1440 | 0 px. Exceptions: THCaB 393 6 207 px and Alla Vapes 1440 3 871 px, both inside a product image during its fade-in (class 2) |

**Magic Sauce 1440** first gave 144 207 px three times in a row: the product
images were blank in the after run, with `ERR_NAME_NOT_RESOLVED` in the
console. The cause was located with two controls:
- the after build run in the "before" slot gave 0 px against the real before;
- a new after run then also gave 0 px.

The cause was therefore network/DNS on the machine, not the code.

## Images (`proof/nano11/`)

- `reference-vs-after-full.jpg`
- `before-after-first-view.jpg`
- `responsive-after.jpg`

## Remaining differences / debt

- **The supplied hero shows an N11 pre-roll pack** (next to the real Tatra Hemp
  pouch), which is not sold today. The photo is used unchanged as instructed.
  If pre-rolls are not coming, the hero should be replaced (Vilmer's call).
- **The reference shows "Buds och pre-rolls" and a guide card.** Live there is
  one format, so the lead says "Buds från Nano-11-serien." and there is no
  guide card.
- **All 8 buds are currently "Slutsåld"** (Nyehandel's I lager filter).
- **The H1 is Nyehandel's own "Nano-11"**, which matches the reference.
