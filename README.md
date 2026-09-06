# Hazey storefront facelift

CSS + injected JavaScript that re-skins the Hazey.se store running on **Nyehandel**
(`hazeyse.nyehandel.se`). The platform exposes three separate admin fields with
non-overlapping jobs: a global CSS field, a separate JavaScript field, and a
custom-code-in-`<head>` field. Only the JavaScript field ever holds the Hazey
loader (see "Two loaders" below) — the `<head>` field is reserved for Google
Fonts and the Trustpilot widget and must never also contain a Hazey loader.
The *built* files in this repo (`hazey.css`, `hazey.min.js`) are what goes in
the CSS field and (via the loader) the JavaScript field. The source of truth
for editing is the `css/` and `js/` folders below, never the built files.

## Structure

```
css/      Modular CSS fragments, concatenated in filename order -> hazey.css
js/       Modular JS fragments, concatenated in filename order -> hazey.html
blocks/   Standalone content blocks (hero, footer text, FAQ, kampanjer, etc.)
          pasted per-page into nyehandel's html-editor blocks. Includes
          loader.html (production) and loader-dev.html (preview).
build.js  Concatenates css/ + js/, then minifies the JS with terser.
hazey.css        Built file — global CSS field. Generated, don't hand-edit.
hazey.html       Built file — readable JS source (one <script>). Generated.
hazey.min.js     Built file — minified JS, hosted via jsDelivr. Generated.
hazey.min.html   hazey.min.js wrapped in <script> (legacy inline paste). Generated.
```

**Never hand-edit `hazey.css`, `hazey.html`, `hazey.min.js` or `hazey.min.html`
directly** — they're overwritten by `node build.js`. Edit the files in `css/`
or `js/` instead.

### css/ — how it's organized

The stylesheet grew over ~2 months of dated patches (mobile fixes, PDP polish
v2/v3, footer v2.1, etc.), so a handful of topics (PDP, kassan) have fixes in
more than one file — that's inherited from the original single-file history,
not a mistake. Files are numbered in the exact order they're concatenated;
that order is preserved from the original file and should not be reshuffled
casually, since some later files intentionally override earlier ones with
matching selectors (that's how the "polish" and "fix" passes worked). Adding
genuinely new, unrelated styling (like the header/homepage redesign) should go
in a new, clearly-named file at the end of the sequence (e.g. `21-header-v2.css`)
rather than edited into an old numbered file.

### js/ — how it's organized

All fragments share one function scope (`nhBoot()`), which is why they aren't
independently valid JS files on their own. `00-core-open.js` (self-repair patch
+ shared helpers like `nhAddToCart`) must stay first and `19-core-close.js`
(the explicit `initX()` boot calls) must stay last. Everything in between is
one or more `function initX() {}` declarations — JavaScript hoists function
declarations, so their relative order among themselves doesn't matter. A new
feature gets its own new file; it just needs an explicit call added to
`19-core-close.js`'s boot-call list to actually run.

## Why external hosting (JS)

The global JavaScript field **truncates at ~64 KB** and **mangles** pasted JS
(it CSS-beautifies selectors, collapses `-`/`:` spacing, strips descendant
spaces). Hosting `hazey.min.js` on a CDN and pasting a small `<script>` loader
(below) into that same JavaScript field instead — which then programmatically
appends a real `<script src>` tag to the page's `document.head` at runtime —
removes both the size limit and the mangling. That runtime DOM insertion is
unrelated to Nyehandel's admin-side `<head>` custom-code field; the loader
snippet itself never goes there.

## Two loaders — production vs. dev preview

Both loaders go in the **same place**: nyehandel's separate **JavaScript**
field (Layout ▸ Manage ▸ "JavaScript"), never the `<head>` custom-code field
(that field is reserved for Google Fonts + Trustpilot and must never also
carry a Hazey loader) and never the footer/body slot (runs too late, footer
etc. get dropped). Exactly **one** Hazey loader belongs in the JavaScript
field at a time. If migrating a new theme instance that already has an older
loader there (e.g. the previous contractor's `Oliverforss8/hazey-storefront`
pointer), **replace** its entire contents with the new loader — do not paste
alongside it. Two loaders running simultaneously fire two competing
`initX()` passes against the same DOM (confirmed root cause of a confusing,
hard-to-diagnose test session — see `STATUS.md`).

- **`blocks/loader.html`** — production. Points at a version-pinned jsDelivr
  tag (`@vX.Y.Z`), which jsDelivr serves **immutably and permanently
  cached**. This is what real visitors get. Only loads JS — `hazey.css`
  is still pasted directly into the CSS field (see "Deploy CSS" below).
  Changing it is a deliberate release (see below).
- **`blocks/loader-dev.html`** — dev preview only, pasted into an **inactive**
  theme instance's JavaScript field (e.g. tema 6), never into the live
  theme's. Loads BOTH `hazey.css` and `hazey.min.js` from this repo's own
  **GitHub Pages** deployment
  (`https://vilmerwahlberg-netizen.github.io/hazey-storefront/`) — no
  manual CSS paste needed in dev, unlike production. A dedicated GitHub
  Actions workflow (`.github/workflows/pages-dev.yml`) builds and
  publishes that Pages site automatically on every push to `dev` (or a
  manual run from the Actions tab); it publishes ONLY the built dev
  assets tema 6 actually needs (`hazey.css`, `hazey.min.js`, `assets/*`) —
  no docs, tests or git history. (Replaces an earlier `raw.githack.com`-
  based version of this loader, dropped 2026-09-06 — githack's CDN could
  take 20+ minutes to reflect a new push, making the dev loop unreliable;
  see `STATUS.md`.) Each file's URL carries a `?t=<timestamp>` cache-busting
  query, unique per page load, so a plain browser reload always fetches the
  latest published version rather than a stale cached copy. `hazey.min.js`
  measures real layout, so it only starts loading once `hazey.css` has
  finished (via the stylesheet's own `onload`) — never in parallel. The
  loader is idempotent (guards on a `data-nh-dev-css`/`data-nh-dev-js`
  marker), so pasting or executing it more than once on the same page
  never creates duplicate `<link>`/`<script>` elements. After the
  one-time paste into tema 6, iterating is just: edit `css/`/`js/` →
  `node build.js` → explicit `git add` (never `-A`) + commit → `git push
  origin dev` → wait for the Pages workflow to go green (Actions tab) →
  reload tema 6. No repeated copy-paste into nyehandel.

## Deploy a new JS/CSS version (production)

```bash
# 1. edit files in css/ and js/, then rebuild
node build.js                 # -> hazey.css, hazey.html, hazey.min.js, hazey.min.html

# 2. release
# Stage only the built release files explicitly -- never `git add -A`,
# which can accidentally sweep up unrelated scratch/test/user files.
git add hazey.css hazey.html hazey.min.html hazey.min.js
git commit -m "js: <what changed>"
git tag -a v1.0.4 -m "v1.0.4"  # bump the version
git push && git push --tags

# 3. point the production loader at the new tag + hash
openssl dgst -sha384 -binary hazey.min.js | openssl base64 -A
#    - edit blocks/loader.html: @v1.0.4 + integrity="sha384-<hash>"
#    - paste blocks/loader.html into Nyehandel's separate JavaScript field
#      (Layout > Manage > "JavaScript" — NOT the <head> custom-code field),
#      replacing whatever loader content was there before, not alongside it
```

Pinned tags (`@vX.Y.Z`) are served **immutably and permanently cached** by jsDelivr —
no cache purge needed, and the SRI hash makes the file tamper-proof.

## Deploy CSS (production)

`hazey.css` is still pasted directly into the Nyehandel global CSS field (no size
limit there). Just copy the built file's contents over after running `node build.js`.
This manual paste is production-only — `blocks/loader-dev.html` loads
`hazey.css` automatically from the `dev` branch, so tema 6/dev preview
never needs it.

## Verify

Rendering is checked headless with Playwright against the **live** Nyehandel
foundation CSS (animations disabled, `channel: 'chrome'`). See the project notes for
the exact harness.
