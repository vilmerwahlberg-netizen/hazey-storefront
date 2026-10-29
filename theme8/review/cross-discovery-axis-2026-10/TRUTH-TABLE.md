# TASK 04A — Route truth table

Measured in the real Theme 8 preview at 1440 px with the local build injected. "Before" is `4a19a16`
(`runs/truth-before-1440.json`) and "after" is the working copy (`runs/truth-after-1440.json`).

**Column notes:**
- **`contextFor()`:** `HZ8.catalog.contextFor()` on the URL the visitor opens.
- **Effective context:** the context after the category boot rebases a filtered combo onto its format root.
- **`isBroad()`:** `shellOf(ctx) === "broad"` or the portal. It is read from the path only.
- **`sfMode`:** `ctx.type === "combo" && !ctx.query`.

**Dedicated `/m-s-vapes` vs filtered `/alla-vapes`:**
- **`/m-s-vapes`** is a real category. It resolves to `combo / Magic Sauce / vapes`, `query: false`, so `sfMode` is on.
- **`/alla-vapes?filters=Serie_Magic Sauce`** (or `?serie=magic-sauce`) resolves to `format / vapes`, because `?serie=` is stripped and `filters` is list state. The page keeps the broad shell, H1 "Alla Vapes" and the format axis. The query only changes products, count and chips.

## Broad format family — axis: other formats

| Route | `contextFor()` | Effective | `isBroad` | `sfMode` | Module before | Module after |
|---|---|---|---|---|---|---|
| `/alla-vapes` | format / vapes | same | yes | no | "Fortsätt i ett annat format", text cards: Alla Buds, Allt Hasch | **"Utforska andra format"**: Alla Buds (54), Allt Hasch (16), plus "Visa alla produkter" |
| `/blommor-buds` | format / buds | same | yes | no | same text cards: Alla Vapes, Allt Hasch | **"Utforska andra format"**: Alla Vapes (24), Allt Hasch (16) |
| `/hasch` | format / hasch | same | yes | no | same text cards: Alla Vapes, Alla Buds | **"Utforska andra format"**: Alla Vapes (24), Alla Buds (54) |
| `/hasch?filters=Serie_Magic Sauce` | combo / Magic Sauce / hasch, `query: true` | format / hasch (rebased) | yes | no | as `/hasch` | as `/hasch` (the filter does not switch family) |
| `/blommor-buds?filters=Serie_Magic Sauce` | combo / Magic Sauce / buds, `query: true` | format / buds | yes | no | as `/blommor-buds` | as `/blommor-buds` |
| `/alla-vapes?filters=Serie_Magic Sauce`, `?filters=Serie_Core`, `?serie=magic-sauce` | format / vapes (`?filters=Serie_*` is rewritten to `?serie=`) | same | yes | no | as `/alla-vapes` | as `/alla-vapes` |

## Series hub family — axis: other series, current series excluded

| Route | `contextFor()` | `isBroad` | `sfMode` | Module before | Module after |
|---|---|---|---|---|---|
| `/thca` | series-hub / THCaB | no | no | same 9-series rail | Magic Sauce (12), THCbA, Core, Nano-11 |
| `/thcb` | series-hub / THCbA | no | no | same | Magic Sauce, THCaB, Core, Nano-11 |
| `/nano-11` | series-hub / Nano-11 | no | no | same | Magic Sauce, THCaB, THCbA, Core |
| `/core` | series-hub / Core | no | no | same | Magic Sauce, THCaB, THCbA, Nano-11 |

## Series × format family — axis: other series in the same format

| Route | `contextFor()` | `isBroad` | `sfMode` | "Andra serier i …" before | After |
|---|---|---|---|---|---|
| `/m-s-vapes` | combo / Magic Sauce / vapes | no | **yes** | THCaB, THCbA, Core, **THCV** Vapes | THCaB (4), THCbA (3), Core (1) |
| `/thca-vapes` (control) | combo / THCaB / vapes | no | yes | Magic Sauce, THCbA, Core, **THCV** | Magic Sauce (2), THCbA (3), Core (1) |
| `/thcb-vapes` | combo / THCbA / vapes | no | yes | Magic Sauce, THCaB, Core, **THCV** | Magic Sauce, THCaB, Core |
| `/thca-carts` | combo / THCaB / carts | no | yes | Magic Sauce Carts (filter), THCbA, **THCV** Carts | Magic Sauce Carts (1), THCbA Carts (1) |
| `/thcb-carts` | combo / THCbA / carts | no | yes | Magic Sauce, THCaB, **THCV** | Magic Sauce Carts, THCaB Carts |
| `/m-s-buds` | combo / Magic Sauce / buds | no | yes | THCaB, Nano-11 Buds | unchanged |
| `/thca-blommor` | combo / THCaB / buds | no | yes | Magic Sauce, Nano-11 Buds | unchanged |
| `/nano11-blommor` | combo / Nano-11 / buds | no | yes | Magic Sauce, THCaB Buds | unchanged |
| `/thca-hash` | combo / THCaB / hasch | no | yes | Magic Sauce Hasch → `hasch?filters=Serie_Magic Sauce` | unchanged (1 destination) |

After the Nano-11 correction (2026-10-29), every hub card uses its R3 landscape. Nano-11 is `series-nano11-r3.webp`, also on the "Nano-11 Buds" card of the Buds series × format pages. Destinations and counts are unchanged (`runs/truth-after-1440.json`, 33 routes).

The "Fortsätt i serien" chip row (same series, other formats) is unchanged on every series × format page.

## Out of scope, and unchanged

| Route | `contextFor()` | `isBroad` | `sfMode` | Module | Why |
|---|---|---|---|---|---|
| `/alla-produkter` | all | portal | no | "Jämför enklare" (C07, accepted) | Portal control. It is not a format page. |
| `/alla-cartridges`, `?filters=Serie_Magic Sauce` | format / carts (filter rebased) | no (legacy catshelf) | no | legacy Produkttyp/Serier rails | Task 05 owns the Carts shell. |
| `/thcv-vape` and other legacy routes | combo / THCV / vapes | no | yes | template renders. "Andra serier" now omits THCV/HHCPM/THCNM/D10. | Legacy taxonomy. These routes are no longer linked from the module. Header links are a post-migration task. |
