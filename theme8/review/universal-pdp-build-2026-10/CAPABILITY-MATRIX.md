# Capability matrix — universal PDP adapter (`theme8/js/85-pdp-pilot.js`)

One template. Every module appears or disappears from the product's real data. Nothing is read from the product name, except text that is displayed as-is.

## Adapter guard

| Condition | Result |
|---|---|
| Product page with a brand in Nyehandel's purchase area (`.brand a`) | adapter (`html.hz8-pdp-pilot`) |
| No brand (service items such as Fraktändring, unlisted items without a brand) | generic template (82/83), including the 10B-0 sold-out protection |
| `?hz8-pdp=0` | adapter off (for comparison) |

## Variant model and label (`product/state` option name)

| Option in Nyehandel | Model | Label in the UI | Notes |
|---|---|---|---|
| none / 1 value | `simple` | – | no selector, short purchase station |
| `strain`, `doft` | `strain` | "Välj strain", "2 av 5 strains" | strain help (ⓘ) only here |
| `vikt`, `storlek`, `volym` | `size` | "Välj vikt" | each card shows its own price |
| `farg` | `color` | "Välj färg", "1 av 5 färger" | |
| other | `generic` | the option's own name | |

Sold-out values are visible but locked ("Slut", `aria-disabled`). The first purchasable value is preselected, unless the URL names a variant.

## Purchase decision (one definition)

`HZ8.variantOrderable` (02-shared.js, 10B-0) is used by the station, the selector, the sticky bar, the packages and the cards. In addition, 83's verdict `html.hz8-pdp-out` applies: no native buy button, or no orderable stock.

| State | Station |
|---|---|
| Purchasable | price, quantity (max = stock, ≤ 99), "Lägg i varukorgen", micro-trust, sticky purchase zone on mobile |
| Selected variant sold out | "X är slut i lager", no CTA, quantity or sticky bar; Nyehandel's "Bevaka" (styled) after the price |
| Whole product sold out | "Slutsåld", locked selector, "Bevaka"; no CTA, quantity, packages, sticky bar or "Passar bra med" |
| Sold out after page load | `always_orderable` is checked against fresh `product/state` before the cart call. Otherwise Nyehandel rejects the add (406) and the zone becomes "Slutsåld" |

## Packages (10B-3)

| Data | Customer view | `?hz8-pkg-review=1` |
|---|---|---|
| Verified package product (`is_package`, price, `verified: true` in `PACKAGE_PRODUCTS`) | step card with the package product's own price, per-unit price, "Spara X kr"; builder; purchase as one cart row | same |
| Plan in `PACKAGE_PLAN` but no package product | **no package selector**, quantity only (status **BLOCKED**) | locked steps "Paketprodukt saknas", builder preview, "Paketpris saknas", CTA disabled |
| No plan | quantity only | quantity only |

Data models: `same` (same variant × N), `strain`, `family` (separate products, members read live), `collection` (one of each of the product's own strains), `threeForTwo`.

Never used: Nyehandel's −15/−20 % tier, computed package prices, or percentages.

## Analysis

| Lab PDF in the product text | Shown |
|---|---|
| Verified for the product (`ANALYSIS-VERIFIED.md`) | "Visa labbrapport (PDF)" |
| Verified per strain (91, 92) | the link follows the selected strain |
| Wrong strain, batch/distillate, unknown file | the link is hidden in the text; "Labbrapport skickas på begäran" |
| No PDF | "Labbrapport skickas på begäran" |
| Folkhälsomyndigheten's report, blog articles | never treated as analysis; left in the text |

## Page sections (in order)

| # | Section | Condition |
|---:|---|---|
| 1–2 | Header, breadcrumbs | always (platform) |
| 3 | Gallery + purchase station | always. Thumbnails only when there are several real images. Brand eyebrow and stock + rating row from real data |
| 4 | Kort om produkten (botanical: desktop composite, mobile plant cutout) | when an introduction or fact cues exist |
| 5 | Chapter navigation | always (anchors to sections that exist) |
| 6 | Produktfakta | always (the product's own text, crawlable, in the initial DOM) |
| 7 | Innehåll och analys | always (content rows + verified PDF or "på begäran") |
| 8 | Leverans och retur | always (`HZ8.commerce`) |
| 9 | Vanliga frågor | when the store's FAQ page responds |
| 10 | Liknande produkter / Fler i serien | at least 2 real other products in series × format, otherwise in the format |
| 11 | Bästsäljare just nu | real source, at least 2 rows, no duplicates of 10 |
| 12 | Omdömen | at least 1 real review |
| 13 | Relaterade kategorier | the platform's own, competing taxonomies hidden |
| 14 | Kundservice | always |
| 15 | Senast besökta | at least 2 other products in the platform's list |
| 16 | Footer | always (platform) |
| — | Passar bra med | Carts membership + purchasable + verified brand match (CCELL) |
