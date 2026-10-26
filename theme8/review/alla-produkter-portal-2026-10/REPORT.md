# TASK 03: Alla produkter — final correction to Hybrid H (local, for review)

> **Status (2026-10-26):** the Hybrid H correction round is implemented locally.
> - Base: `dev` = `38cfe89`, building on the uncommitted G3 round (history at the end of this file).
> - Nothing is staged, committed, pushed or published. Nyehandel admin is untouched. The user's other dirty and untracked files are left alone; `cro-concepts/` in this folder is not mine.
>
> | Check | Result |
> |---|---|
> | Portal at 393/1440/1920 | **84/84** |
> | Small widths and zoom (320/430/640 = 200 % zoom/1280/1512) | **18/18** |
> | Frozen routes vs HEAD (7 × 3 widths) | **19/21 at 0 px**, 2 known dynamic chips (class 2) |
> | Final check before delivery, `verify.mjs after 393,1440` (`verify-final-check.json`) | **56/56** |
>
> **Accepted 2026-10-26:**
> - The customer service band and the old campaign block stay hidden.
> - No extra trust row above the footer.
> - 5 columns at ≥1600 px.

## Exactly changed files

| File | Contents |
|---|---|
| `theme8/js/80-category.js` | Portal shell, page-local search, empty-state recovery, history and scroll restore, tab overflow signal, seriesPicker hooks |
| `theme8/css/80-category.css` | Isolated `hz8-cat-portal` block at the end of the file |
| `theme8/review/alla-produkter-portal-2026-10/` | `lib.mjs`, `verify.mjs`, `regress.mjs`, `sheet.mjs`, logs/json, `shots/`, `compare/`, `regress/`, this report |

Not touched: header, footer, loader, `80b-series-format`, series hubs, PDP, homepage, `.gitignore`, bundles (`dist/` is generated locally only), admin.

## Changes in this round (Hybrid H)

**1. Hero**
- No seal or handwriting.
- The local search box sits to the right of the H1 over the photo at ≥1280 px, with the hint "Sök produkt, serie, format eller cannabinoid" below it.
- Below 1280 px (mobile and tablet) it is its own row under the count, above the shelf.
- The lead is on one line on desktop.

**2. Page-local catalog search (`?q=`)**
- A `role="search"` box with a combobox/listbox. The placeholder carries the real total: "Sök bland 104 produkter".
- **Where it searches:** full product name, brand, format (for example "Vape/Vapes", "Hasch", "Tillbehör") and series. Series membership comes from the series' real routes, loaded once on first focus. After that, for example, "THCaB" also matches products named "THCA".
- **Matching rules:**
  - Lowercase, no diacritics, punctuation ignored ("thca" matches "THC-A").
  - Every word must match, in any order. No fuzzy matching.
- **Same engine as the filters:** the query sits in the union engine's filter alongside format, volume, series, stock, the full filter and sort. Grid, counts, progress, facet counts, empty state and `aria-live` ("N produkter visas") update from the same state.
- **No network traffic per key:** debounced at 180 ms, and every page is served from the existing session cache. Verified: 0 requests while typing.
- **URL:** one history step when a search starts, then `replaceState` while typing. Reload and back/forward restore the query and the rest of the state. On back/forward the URL controls the field even when it has focus.
- **Suggestions:** up to 5 real products from the same data, shown as name plus brand · format.
  - Arrow up/down moves the selection (`aria-activedescendant`/`aria-selected`).
  - Enter opens the selected product; with nothing selected it closes the list and scrolls to the products.
  - Escape closes the list and keeps the text. Clicking in the field reopens the list.
  - Mouse click opens the product.
  - A separate clear button (44 px, `aria-label="Rensa sökning"`) resets the search and returns focus to the field.

**3. Empty result**
- "Inga produkter matchar" plus an honest description.
- Recovery on the same page, in order: "Rensa sökning" (if there is a query), "Ta bort <senaste filtret>" (if a filter is active), "Rensa alla filter" (when more than one thing is active).
- No made-up alternatives.

**4. Product count**
- 24 first on mobile and 48 on desktop, then "Visa fler produkter".
- The text reads "Visar X av Y produkter", with a progress bar.

**5. Back from a product**
- The number shown and the anchor (the first card in view plus its offset) are stored in the history entry (`history.state`).
- The anchor is held with a ResizeObserver until the layout has settled. It stops on the user's own scroll input, with a 6 s cap.
- Verified: the same card at the same pixel position at 393 and 1440, with 48 or 96 products shown.

**6. Format row**
- All six real formats (Alla, Vapes, Carts, Buds, Hasch, Tillbehör) are filters.
- On mobile the row scrolls without a scrollbar. The fade at the right edge shows only while more tabs are to the right.
- The selected tab is scrolled into view only when the selection changes; before, the row snapped back while swiping.

**7. Sort**
- The button shows only the current mode, "Nyast", which is the platform's actual default.
- The grid heading reads "Sorterat på nyast".

**8. Removed:** "Hitta rätt produkt" and the quiz on this page (a separate future task).

## State matrix (verified at 393/1440/1920 unless noted)

| State | URL | Result |
|---|---|---|
| Initial | `/alla-produkter` | 104, "Alla", 24 (mobile) or 48 (desktop), "Visar 24/48 av 104 produkter" |
| Search | `?q=magic+sauce` | 12, all matching, no reload, 0 network requests while typing |
| Suggestions | — | 5, keyboard navigation, Escape keeps the text, a mouse click opens the product, back restores the search |
| Search + format + stock + sort | `?q=thca&typ=buds&filters=…in-stock…&sort=price_low` | Only in-stock buds matching "thca", ascending by price, Vikt facet in grams only; reload restores everything |
| Back/forward | search "magic" → Carts → back → back → forward | Carts gone → search gone → search restored; the field follows; no reload |
| Empty | `?q=zzqxy&typ=buds` | Recovery buttons tested below |
| Visa fler | — | 24→48 (mobile), 48→96 (desktop) |
| Back from product | — | Same number shown and same card position |
| Desktop dock | — | Shown only once the shelf has left the view; on mobile no sticky shelf and no dock |
| Keyboard | — | Tabs and search field have a visible focus ring |

Empty-state recovery:
- "Rensa sökning" keeps the Buds filter and shows its products.
- "Ta bort Buds" keeps the search and leaves only "Rensa sökning".
- "Rensa alla filter" returns to 104.

Small widths (320/430/640/1280/1512):
- search "thca buds" works;
- 0 px overflow;
- touch targets ≥ 44 px;
- 0 console errors.

## Regression (vs HEAD `38cfe89`, top/mid/end, 393/1440/1920)

Covers home, Alla Vapes, Alla Buds, Allt Hasch, the Magic Sauce hub, `m-s-vapes` (series × format) and Faraoh PDP.

**19/21 at 0 px.**
- **Alla Buds 1440 mid (161 px):** one series chip on "THCA 23% + HHCPM 12%" that loads in a different order. Class 2.
- **Allt Hasch 1920 top (143 px):** the same chip phenomenon, identical to Task 01B, where the diff also appeared when a build was compared with itself. Class 2.

Identical document heights, no console errors. No unexplained difference in locked areas.

## Images (`compare/`, before | after | facit)

| File | Contents |
|---|---|
| `top-{393,1440,1920}.png` | Before \| after \| Hybrid H |
| `grid-*.png` | Grid start, before \| after |
| `search-*.png` | Suggestions open (keyboard selection) \| search result |
| `combined-*.png` | Full filter open with search + Buds + I lager \| combined result sorted by price \| after back/forward |
| `empty-*.png` | Empty state with recovery |
| `lower-*.png` | Before (end) \| after, result ending \| after, footer transition \| Hybrid C |

Single shots are in `shots/after/`, `shots/before/` and `shots/after/w{320,430,640,1280,1512}-*`.

## Remaining deviations (classified)

1. **Hidden blocks, unchanged from the first round** (class 5, decision to confirm):
   - the customer service band;
   - the admin campaign block (`nh-cat-grid`: BÄSTSÄLJARE/KAMPANJER, still in the DOM);
   - the old carousel and card rails.

   Hybrid C/H defines the page without them.
2. **Trust row above the footer is not duplicated** (class 3): the locked footer already has the same row.
3. **Hero height** (class 4/locked component):
   - Desktop: the shelf lands about 18 px lower than in Hybrid H, because of the real header's breadcrumb padding (frozen).
   - Mobile: the search box sits about 20 px higher, because the H1 is two lines at the same size.
4. **Card chips show type + volume/weight, not series as in the mockup** (locked component plus data). The shared card is unchanged; on this page series membership loads only when search is used.
5. **5 columns at ≥1600** (locked card contract), as on the other broad pages.

## Technical debt / notes

- **Background requests per cold view:**
  - the full list (5 pages);
  - 5 format pages (about 7 pages);
  - the stock list.
  - Series routes only on first search focus or when a filter surface opens.
  - All go through the existing queue, timeout and 30-minute cache.
- **History:** a sort or stock change on back/forward reloads the page on purpose (existing category behavior). Search, format and volume restore without a reload.
- **Search scope:** the haystack does not cover cannabinoid as a separate attribute. Nyehandel has no such field, so it matches via the name and the series.

---

# History: first G3 round (superseded by Hybrid H above)

> **Status (2026-10-26):** implemented locally.
> - Base: `dev` = `38cfe89`.
> - Nothing is staged, committed, pushed or published.
> - Nyehandel admin is untouched.
>
> | Check | Result |
> |---|---|
> | Portal verification at 393/1440/1920 | 56/56 |
> | Small widths and zoom (320/430/640 = 200 % zoom/1280/1512) | 13/13 |
> | Frozen routes vs HEAD | 20/21 at 0 px; the 1 difference is dynamic data (class 2) |

## Changed files

| File | Change |
|---|---|
| `theme8/js/80-category.js` | Portal shell in the existing pilot/broad machinery, small opt-in hooks in `seriesPicker`, removal of the old portal carousel |
| `theme8/css/80-category.css` | Isolated portal block at the end of the file, plus removal of 6 old `hz8-cat-portal` rules (the old portal no longer exists) |
| `theme8/review/alla-produkter-portal-2026-10/` | New review folder: scripts, images, report |

Not touched: header, footer, loader, `80b-series-format`, series hubs, PDP, homepage, `.gitignore`, admin, bundles in `dist/` (generated locally only).

## Architecture: no second catalog system

- **One engine.** `/alla-produkter` now runs the same shell as Allt Hasch and Alla Buds (`buildPilot` with `data-hz8-shell="broad"`), plus `hz8-cat-portal`. That means:
  - the same warm glass shelf
  - the same multi-select engine (`seriesPicker`)
  - the same filter sheet, desktop dock, sort and chips
- **Format = filter, not navigation.** The tabs Alla/Vapes/Carts/Buds/Hasch/Tillbehör:
  - write `?typ=` to the same product list (Nyehandel's own `alla-produkter` list, with its native filters and sort, fetched in full);
  - use `pushState` only: no reload and no change of category.
- **Shared state.** The tabs, the "Produkttyp" section in the filter sheet, the dock and the guide ("Hitta rätt produkt") all read and write the same `?typ=`.
- **Format membership is real data.** A product belongs to a format if it is on that format's own category page (`06-catalog-map`). Tabs with 0 hits are not shown.
- **Volume and weight** are read from the product name:
  - shown only when the selected types share a unit: Vapes/Carts give ml ("Volym"), Buds/Hasch give gram ("Vikt");
  - mixed types or Tillbehör hide the section;
  - switching to another unit clears the old selection in the same history step.
- **Brand and cannabinoid/series** live under "Alla filter":
  - Brand mirrors Nyehandel's own "Varumärke" filter.
  - Series uses the existing multi-select with the series' real routes.
  - Series counts load lazily, only when a filter surface opens or a series is selected. This avoids around 20 extra background requests per page view.
- **State and history.**
  - URL, reload and back/forward restore the exact state.
  - The H1 is always "Alla produkter".
- **Hooks are opt-in.** The new `seriesPicker` options (`seriesList`, `memberRoutes`, `lazyCounts`, `moreUi`) do nothing on other pages, as the regression run shows.
- **Small shared changes, inert on frozen pages.**
  - `TYPE_ONE.batterier` and `cardUnit` (gram is parsed only when the portal is active).
  - The `pilotDecor` parameters.
  - The Nyehandel grid wrapper `.category-content` on this route gets the class `designer-category`, the same role as on other category pages, so existing rules apply.

## Page map (G3 → Hybrid C)

| # | Chapter | Classification |
|---|---|---|
| 1 | Global header | Locked existing component, unchanged |
| 2 | Hero | New accepted reference (G3), described below |
| 3 | Glass shelf | New accepted reference (G3), described below |
| 4 | Active filters | Behavior contract, described below |
| 5 | Grid heading | G3, described below |
| 6 | Product grid | Locked component plus data-driven repetition, described below |
| 7 | Result ending | Hybrid C, described below |
| 8 | Format routes | Hybrid C, described below |
| 9 | "Om Hazeys sortiment" | Hybrid C plus platform content, described below |
| 10 | Trust row | Footer's own row, see deviation 3 |
| 11 | Footer | Locked, unchanged |
| — | Customer service band, "Populärast just nu" carousel, format/series card rails, admin campaign block | Intentionally absent, see deviations 1–2 |

- **2. Hero:**
  - kicker "Hela sortimentet", the stable H1 and a data-driven lead built from the real formats;
  - the real count;
  - the existing sunset/plaster assets, with full-bleed photo on mobile;
  - the seal "HAZEY.SE · HELA SORTIMENTET" (decorative, `aria-hidden`).
- **3. Glass shelf:**
  - Desktop: format tabs (active tab = filled dark green), count, I lager, Alla filter, sort.
  - Mobile: one glass card with the tabs and count plus "Filter & sortera".
- **4. Active filters:** shown only when something is selected. Chips that only repeat the selected format tab are hidden.
- **5. Grid heading:**
  - "Alla produkter" (H2);
  - the actual current sort label;
  - "Hitta rätt produkt →", which opens the existing guide (desktop only).
- **6. Product grid:**
  - the real `.product-card` with its existing rules;
  - 4 columns at 1280/1440, 5 at ≥1600 (the existing card contract), 2 on mobile;
  - 48 products per step.
- **7. Result ending:**
  - "48 av 104 produkter" with a true progress bar;
  - "Visa fler produkter";
  - "Tillbaka till filter".
- **8. Format routes:** "Fortsätt i ett format / Jämför enklare", three real links. Names come from the header's own links: Alla Vapes → `/alla-vapes`, Alla Buds → `/blommor-buds`, Allt Hasch → `/hasch`. A route with 0 products is removed.
- **9. "Om Hazeys sortiment":** the category's own admin text, unchanged and still crawlable in the DOM, in a two-column disclosure with "Visa mer" (one column on mobile).

## Route/state matrix (verified at 393/1440/1920)

| State | URL | Result |
|---|---|---|
| Unfiltered | `/alla-produkter` | 104 products, "Alla" active, 48 shown |
| Format | `?typ=vapes` | 24, all with a "Vape" chip, no reload (marker survives) |
| Format | `?typ=buds` | 53, weight filter (g only) |
| Full filter | `?typ=vapes` + sheet | Produkttyp, Volym (ml only), Cannabinoid / serie, Tillgänglighet, Varumärke, Sortera |
| Sort | `?sort=price_low` | Ascending by real price; heading reads "Sorterat på pris, lägst först" |
| Empty | `?typ=batterier&serie=magic-sauce` | "Inga produkter matchar" plus "Rensa alla filter", which leads back to 104 |
| Back/forward | Vapes → Buds → back → back → forward | Vapes → Alla → Vapes, exact; no reload |
| Reload | `?typ=vapes` | Same state |
| Visa fler | — | 48 → 96 → 104 of 104; button hidden at the end |
| Desktop dock | — | Hidden while the shelf is in view; shown only once it has left |
| Keyboard | — | Tabs reachable with Tab, visible 2 px focus ring |

**Data cases observed in the real list:**
- long titles, up to 56 characters;
- products without a rating (21 of 48);
- sale prices (4);
- sold out (3, with a "Slutsåld" button);
- several image badges (18);
- shortened titles: all 15 keep the full name as `aria-label`.

## Tests

- **`verify.mjs after`: 56/56.**
- **`verify.mjs small`: 13/13.**
  - 0 px overflow at 320/430/640/1280/1512.
  - Touch targets ≥ 44 px on mobile.
  - 0 console errors.
- **`regress.mjs` vs HEAD (7 routes × 3 widths, top/mid/end): 20/21 at 0 px.**
  - Routes: home, Alla Vapes, Alla Buds, Allt Hasch, the Magic Sauce hub, `m-s-vapes`, Faraoh PDP.
  - Exception: Alla Buds 1920 mid (161 px), one series chip on "THCA 23% + HHCPM 12%" that loads in a different order. Same phenomenon as in Task 01B: class 2, dynamic content.
  - All document heights are identical.

## Images

**Comparisons:**

| File | Contents |
|---|---|
| `compare/top-{393,1440,1920}.png` | Before \| after \| G3 |
| `compare/grid-*.png` | Before \| after, grid start |
| `compare/lower-*.png` | Before (end) \| after, result ending \| after, footer transition \| Hybrid C |
| `compare/states-*.png` | Format active, full filter, sort open, empty result, after back/forward |

**Single shots:**

| File | Contents |
|---|---|
| `shots/after/*` | All states, including the sort result and the full page (`-0-full.jpg`) |
| `shots/before/*` | Before shots |

## Remaining deviations (classified)

1. **Customer service band and the admin campaign block "BÄSTSÄLJARE/KAMPANJER" (`section.nh-cat-grid`) are hidden** (class 5, product decision to confirm).
   - Hybrid C ends with SEO → trust → footer and explicitly has no campaign block.
   - The admin block remains in the DOM, and admin is unchanged.
   - Both can be restored with one line if you want them kept.
2. **"Populärast just nu" carousel and the format/series card rails are removed** (class 5, by reference). G3 starts the grid directly. Series sit under Alla filter, and the format pages are linked in the format routes.
3. **Trust row** (class 3, locked component).
   - Hybrid C shows "Trygg betalning · Diskret frakt · Skickas från Sverige · 18+" above the footer.
   - The locked footer already has the same row (`hz8-footer__trustrow`), so it is not duplicated.
4. **Default sort is "Nyast", not "Populärast" as in G3** (class 5).
   - The page shows the platform's actual default sort.
   - "Populärast" as the default is a setting in Nyehandel, or a separate decision. I have not changed the ordering.
5. **The heading row "Fortsätt utforska … / Senast visade produkter" in Hybrid C is interpreted as the grid continuing** (class 5). There is no real data source for "recently viewed", so it is not built.
6. **5 columns at 1920** (locked component). This is the existing card contract for ≥1600 (Alla Vapes, Allt Hasch). G3 at 1440 shows 4, which we match.
7. **Subpixel/antialiasing differences against the G3 mockup** (class 4).
   - The mockup's header and cards are illustrations.
   - The real header and cards are used unchanged.

## Technical debt / notes

- **Background requests per cold portal view:**
  - the full `alla-produkter` list (5 pages);
  - the 5 format pages (about 7 pages);
  - the stock list.
  - Series counts only on demand.
  - All go through the existing queue, timeout and 30-minute cache.
- **Native back/forward with sort or stock filter:** the existing category code reloads the page on purpose (Nyehandel does not redraw on popstate). Format changes (`?typ=`) restore in place.
- **Old code removed:** `buildPortalPopular` and the old portal CSS rules are unused and have been deleted.
- **`hz8-cat-portal` CSS block:** isolated at the end of `80-category.css`, so it can be moved to its own file later if desired.
