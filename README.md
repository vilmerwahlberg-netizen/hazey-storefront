# Hazey storefront facelift

CSS + injected JavaScript that re-skins the Hazey.se store running on **Nyehandel**
(`hazeyse.nyehandel.se`). The platform only exposes a global CSS field and a global
JS field in admin — this repo is the source of truth for what goes in them.

## Files

| File | What it is | Where it goes |
|------|------------|---------------|
| `hazey.css` | Full facelift stylesheet | Nyehandel ▸ global CSS field |
| `hazey.html` | JS **source** (readable, one `<script>`) | edit this |
| `hazey.min.js` | Minified JS bundle (built from `hazey.html`) | **hosted via jsDelivr** |
| `hazey.min.html` | `hazey.min.js` wrapped in `<script>` | legacy inline paste (superseded by `loader.html`) |
| `loader.html` | Tiny loader that pulls `hazey.min.js` from jsDelivr | Nyehandel ▸ custom code in **`<head>`** (not the footer/body slot) |
| `*.html` (blocks) | Content blocks for html-editor blocks | pasted per-page in admin |

## Why external hosting

The global JS field **truncates at ~64 KB** and **mangles** pasted JS (it
CSS-beautifies selectors, collapses `-`/`:` spacing, strips descendant spaces).
`hazey.min.js` had grown to ~64.7 KB — right at the ceiling. Hosting it on a CDN and
loading it with `loader.html` removes the size limit and the mangling entirely.

The store already loads third-party JS (jsDelivr for icons, Trustpilot), so nothing
in the platform's CSP blocks this.

## Deploy a new JS version

```bash
# 1. edit hazey.html, then rebuild the bundle
sed '1d;$d' hazey.html > /tmp/body.js          # strip the <script> wrapper lines
node --check /tmp/body.js                        # syntax gate
node build.js                                    # terser -> hazey.min.js + hazey.min.html
                                                 # (compress:false, mangle:false)

# 2. release
git add -A && git commit -m "js: <what changed>"
git tag v1.0.1                                   # bump the version
git push && git push --tags

# 3. point the loader at the new tag + hash
#    - new SRI hash:
openssl dgst -sha384 -binary hazey.min.js | openssl base64 -A
#    - edit loader.html: @v1.0.1 + integrity="sha384-<hash>"
#    - paste loader.html into the Nyehandel global JS field
```

Pinned tags (`@v1.0.1`) are served **immutably and permanently cached** by jsDelivr —
no cache purge needed, and the SRI hash makes the file tamper-proof.

## Deploy CSS

`hazey.css` is still pasted directly into the Nyehandel global CSS field (no size
limit there). Just copy the file contents over after editing.

## Verify

Rendering is checked headless with Playwright against the **live** Nyehandel
foundation CSS (animations disabled, `channel: 'chrome'`). See the project notes for
the exact harness.
