# Hazey storefront facelift

CSS + injected JavaScript that re-skins the Hazey.se store running on **Nyehandel**
(`hazeyse.nyehandel.se`). The platform only exposes a global CSS field, a global
JS field, and a custom-code-in-`<head>` field in admin — the *built* files in
this repo (`hazey.css`, `hazey.min.js`) are what goes in them. The source of
truth for editing is the `css/` and `js/` folders below, never the built files.

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

The global JS field **truncates at ~64 KB** and **mangles** pasted JS (it
CSS-beautifies selectors, collapses `-`/`:` spacing, strips descendant spaces).
Hosting `hazey.min.js` on a CDN and loading it via a `<script src>` loader in
`<head>` removes both the size limit and the mangling.

## Two loaders — production vs. dev preview

- **`blocks/loader.html`** — pasted into nyehandel's real `<head>` custom-code
  field. Points at a version-pinned jsDelivr tag (`@vX.Y.Z`), which jsDelivr
  serves **immutably and permanently cached**. This is what real visitors get.
  Changing it is a deliberate release (see below).
- **`blocks/loader-dev.html`** — pasted **once** into nyehandel's `?preview=`
  code field, never into the live `<head>` field. Points at the `dev` branch
  via `raw.githack.com` (uncached, updates within seconds of a `git push`).
  After that one-time paste, iterating is just: edit `css/`/`js/` → `node
  build.js` → commit + push to `dev` → reload the preview tab. No repeated
  copy-paste into nyehandel.

## Deploy a new JS/CSS version (production)

```bash
# 1. edit files in css/ and js/, then rebuild
node build.js                 # -> hazey.css, hazey.html, hazey.min.js, hazey.min.html

# 2. release
git add -A && git commit -m "js: <what changed>"
git tag v1.0.4                # bump the version
git push && git push --tags

# 3. point the production loader at the new tag + hash
openssl dgst -sha384 -binary hazey.min.js | openssl base64 -A
#    - edit blocks/loader.html: @v1.0.4 + integrity="sha384-<hash>"
#    - paste blocks/loader.html into Nyehandel's <head> custom-code field
```

Pinned tags (`@vX.Y.Z`) are served **immutably and permanently cached** by jsDelivr —
no cache purge needed, and the SRI hash makes the file tamper-proof.

## Deploy CSS (production)

`hazey.css` is still pasted directly into the Nyehandel global CSS field (no size
limit there). Just copy the built file's contents over after running `node build.js`.

## Verify

Rendering is checked headless with Playwright against the **live** Nyehandel
foundation CSS (animations disabled, `channel: 'chrome'`). See the project notes for
the exact harness.
