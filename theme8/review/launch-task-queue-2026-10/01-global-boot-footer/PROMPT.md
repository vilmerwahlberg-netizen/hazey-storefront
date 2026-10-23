# TASK 01 — global cold-load/FOUC + footer-end strip

Use the canonical project instructions and `agent-skills/hazey-commerce-design/SKILL.md`. This is a tightly scoped technical refine/repair task, not a redesign.

## Goal

Remove the visibly old/native page flash during Theme 8 cold loading and remove the light/white strip below the footer across page types. Preserve the accepted header, homepage, category, series-format and Faraoh/PDP designs pixel-for-pixel once Theme 8 is ready.

Read `EVIDENCE.md` before editing. Its screenshots are defect evidence, not
design references. This task has no new visual direction: the accepted loaded
page is the reference, and the correction is complete only when the transient
old page and the post-footer strip are absent.

## Confirmed causes to verify before editing

- Theme 8 admin Head has been observed loading the old Oliverforss bundle before the Theme 8 loader. Do not edit admin in this task. Report the exact obsolete script line that must later be removed manually, while preserving Google Fonts and Trustpilot.
- `theme8/blocks/loader-theme8-dev.html` adds `hz8-boot`, but no immediately available style currently masks the native/legacy flash while CSS/JS arrive.
- `#hz8-cart-live` is appended to `body` and contributes roughly 1 px to document height.
- Homepage has approximately 32 px bottom space under the footer; ordinary mobile PDPs can inherit a larger footer-shell reserve.

## Allowed files

- `theme8/blocks/loader-theme8-dev.html`
- `theme8/css/01-base.css`
- `theme8/css/60-social-footer.css`
- a new isolated review folder inside `theme8/review/launch-task-queue-2026-10/01-global-boot-footer/`

Do not edit category, series-format, PDP, homepage, header or routing source files. Do not edit Nyehandel admin. Do not touch `.gitignore` or unrelated dirty files.

## Implementation requirements

1. Add the smallest synchronous warm boot treatment inside the development loader so native/legacy markup cannot flash before Theme 8 CSS/JS is ready.
2. It must fail open: CSS error, JS error or timeout must restore a usable native page. Never leave a blank page.
3. No layout animation, fake progress screen or branded intro. This is only a brief warm background/mask matching Theme 8.
4. Preserve CSS-before-JS order and existing asset base behavior.
5. Make `#hz8-cart-live` truly visually hidden without affecting document height or footer position.
6. Remove only the unintended space after the actual footer. Do not crop footer content and do not change the designed space inside the footer.
7. On normal mobile PDPs, preserve any required sticky purchase clearance while ensuring the canvas below the footer uses the footer color and does not appear as a beige/white bar.

## Verification matrix

Test cold cache, warm cache and throttled loading at 393, 1440 and 1920 on:

- homepage
- Alla Vapes
- Magic Sauce hub
- one series × format page
- a normal non-Faraoh PDP
- Faraoh PDP
- cart and checkout if reachable without creating an order

Also simulate CSS failure and JS failure. Verify:

- no old styled page is visible during successful load;
- failure reveals a usable native page;
- footer ends cleanly at the viewport/document edge;
- no content is hidden;
- no new horizontal overflow, console error or CLS regression;
- accepted header, hero, product cards and sticky controls are unchanged after ready.

## Deliverable and stop

Create identical-viewport before/after screenshots for loading and footer end, plus a short measurement table. Report the exact files changed and the separate manual admin Head action required. Then STOP. Do not stage, commit, push, edit admin or publish.

