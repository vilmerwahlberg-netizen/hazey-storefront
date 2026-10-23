# TASK 01 — global boot + footer end: implementation report

Base: `origin/dev` = `b18aba7`. Local only: nothing staged, committed, pushed,
published or changed in Nyehandel admin. "Before" = HEAD build, "after" =
working copy. Both are served into the Theme 8 preview by the harness in this
folder (`lib.mjs` rewrites only the inlined dev loader in the fetched HTML and
serves the CSS/JS locally).

## Files changed (all within the TASK 01 allowlist)

| File | Change |
|---|---|
| `theme8/blocks/loader-theme8-dev.html` | Synchronous inline boot mask (`html.hz8-boot` → canvas `#ede9e8` = `--hz8-bg`, body `visibility:hidden; opacity:0`). The mask releases when `00-bootstrap.js` finishes, or on CSS error, JS error, a bundle that loaded but never booted (100 ms after DCL), or a 6 s timeout (was 2.5 s, which fired before Theme 8 was ready on throttled loads). On a CSS error the JS is no longer loaded. CSS-before-JS order and `BASE`/`HZ8_ASSET_BASE` are unchanged. |
| `theme8/css/01-base.css` | `#hz8-cart-live` set to `position:fixed; top:0; left:0`, so it no longer adds 1 px after the footer. |
| `theme8/css/60-social-footer.css` | Footer-end block: (1) `#store-main:has(.hz8-footer)` padding-bottom 0, which removes the homepage's 32 px; (2) the footer shell is painted in the footer colour; (3) footer `margin-top:0` inside the shell, the same rule as the accepted Faraoh PDP; (4) on normal mobile PDPs with a buybar, the clearance is `calc(120px + env(safe-area-inset-bottom))`. |
| `…/01-global-boot-footer/review/` | New: harness, scripts, raw logs/JSON, screenshots, `MEASUREMENTS.md`, this report. |

`.gitignore` was dirty before this task and was not touched.

## Root causes (verified)

- **Flash:** Nyehandel hides `<body>` until DOMContentLoaded and then shows
  it. The JavaScript field runs at the end of `<body>`. It added `hz8-boot`,
  but no CSS used that class, so the native page plus the Oliverforss legacy
  bundle painted until Theme 8 CSS and JS finished. That was 63–253 ms on
  cold loads and about 3.4 s on throttled loads.
- **Homepage gap 33 px:** Nyehandel's `#store-main` padding-bottom (32 px),
  with the footer inside `#store-main`, plus 1 px from `#hz8-cart-live`.
- **Other pages +1 px:** `#hz8-cart-live` is absolutely positioned without
  `top`, so it sits after the footer.
- **8 px strip above the footer on non-home pages:** `.hz8-footer`
  `margin-top: 8px` shows the body colour. On today's routes the body colour
  matches the last section, so the strip was invisible there. The rule is
  still removed, so it cannot appear wherever the colours differ (the
  desktop evidence crop).
- **Mobile normal PDP:** the 76 px shell reserve (82-product.css:369) beat the
  intended 120 px buybar rule (82-product.css:712) on specificity. The
  110 px fixed buybar (plus iOS safe area) therefore covered the last footer
  line, and when the bar was away the reserve showed as a beige band.

## Results (full tables in `MEASUREMENTS.md`)

- **Successful load:** the old/native page is visible for 0 ms on every
  Theme 8 route, at 393/1440/1920, in cold, warm and throttled runs.
  - Before: 63–253 ms on cold loads, about 3.4 s on throttled loads.
  - The mask is visible for 60–220 ms on cold/warm loads and about 3.4 s
    when throttled (the time CSS and JS are in flight).
  - The release happens at the same point as before (end of `boot()`), so
    the mask adds no extra waiting time.
- **Failure:** every failure mode ends on a visible, usable native page.

  | Failure | Mask released after |
  |---|---|
  | CSS error | ≤72 ms |
  | JS network error | ≤178 ms |
  | JS syntax error | about 140 ms after the script loads |
  | Hanging CSS | 6.0 s |

  Before, a CSS failure left Theme 8 JS injecting unstyled markup with giant
  icons (`loading/before-css-fail-home-393-final.png`).
- **Footer end:** gap 0 (±0.5 sub-pixel rounding) on every route and width.
  - Home: −33 px.
  - Other pages: −9 px (8 px strip + 1 px live region).
  - Faraoh: unchanged.
  - Mobile normal PDP: a 120 px clearance in the footer colour, and the last
    footer line now clears the buybar.
  - Horizontal overflow is 0 everywhere.
- **Loaded state:** 0 px difference in the first viewport (header, hero,
  cards) on every route and width.
  - Mid-page diffs (scrollY 1000) are 0 except where the footer itself is in
    view and has moved up 8 px (m-s-vapes 1440/1920; the 398 px on
    alla-vapes 1920 is the same move).
  - The footer element diffs are 0–70 px, all on the outermost 1 px
    sub-pixel edge (class 4, browser rendering). Footer heights are
    identical.
  - The only new fixed element is the clipped 1×1 live region. Sticky
    controls are unchanged.
  - CLS is equal or lower; repeats are in `loaded/cls-repeat-*.json`.
  - No new console errors.
- **Checkout** (`/sv/checkout`, empty cart, no order created) does not run
  the Theme 8 loader by design (it uses the CSS field, see `build-theme8.js`).
  It has no Theme 8 footer, so it is unaffected; the native rendering is
  documented in the loading logs.

## Known residuals (outside this task's reach)

1. **Pre-loader frames.** Before the JavaScript field can run, the browser
   paints:
   - a white canvas (Nyehandel's `html` background) while the HTML downloads;
   - on routes with native hero/product media, one frame of 2–15 ms in which
     native hero text or the product image shows. Nyehandel's own CSS keeps
     those elements `visibility:visible` while `<body>` is hidden
     (verified in-page, also with the Oliverforss bundle blocked).

   No code in the JavaScript field can run earlier. Removing this would need
   a pre-mask in the Head or CSS field, or a matching admin background
   colour. That is an admin change and needs separate approval, with its
   own CSS-only fail-open (for example an animation-based release), because
   the CSS field also applies to checkout.
2. **Theme 8's own progressive states after ready** stay as they are: the
   accepted header entrance, the dark hero placeholder until the hero image
   loads, and the native Nyehandel consent banner.

## Manual admin action required later (NOT done)

In **Theme 8 → Head**, delete only this block (current preview HTML,
`?preview=v9kzdmqz4w60l5n`):

```html
<script>
  (function () {
      var s = document.createElement("script");
          s.src = "https://cdn.jsdelivr.net/gh/Oliverforss8/hazey-storefront@v1.0.3/hazey.min.js";
              s.crossOrigin = "anonymous";
                  s.integrity = "sha384-kT+aP+tmeoCyU+Cn8y6wuY6rHL1Z8G3XJjox6oZcs0s1nTROmMJ3oCA0cnJKIGKX";
                      document.head.appendChild(s);
                        })();
                        </script>
```

Keep exactly these Head lines:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600&display=swap" rel="stylesheet">
<script type="text/javascript" src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js" async></script>
```

The updated `loader-theme8-dev.html` also has to be pasted into Theme 8's
JavaScript field to take effect in the preview. Theme 8 must not be published.

## Evidence index

| What | Where |
|---|---|
| Loading frame sequences | `loading/{before,after}-{cold,throttled}-<route>-{393,1440}.png`, plus 1920 and warm (after only) |
| Failure end states | `loading/{before,after}-{css-fail,js-fail,js-throw,css-hang}-<route>-<w>-final.png` |
| Footer end, side by side | `sheets/footer-end-{393,1440,1920}.png`; raw bottom-of-document captures in `footer-end/` |
| Loaded-state diffs | `loaded/*-top-{before,after}.png`, `loaded/*-diff.png`, `loaded/loaded-diff*.json` |

Frame labels in the loading sequences:
- `BLANK` = white canvas
- `MASK` = boot canvas
- `NATIVE` = non-blank before ready
- `READY` = Theme 8 ready

`review/` is about 200 MB, almost all raw screenshots. If it is committed,
the sheets, reports, scripts and JSON are probably enough.

Re-run: `T01_BASE=<HEAD build dir> node load-sequence.mjs|probe-footer.mjs|loaded-diff.mjs …`
(the HEAD build is made with `git archive b18aba7` + `node build-theme8.js`).
