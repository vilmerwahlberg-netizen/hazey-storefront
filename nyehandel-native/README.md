# nyehandel-native — template 8 migration

Separate from the current CSS/JS reskin (`css/`, `js/`, `blocks/` at the
repo root, which stays untouched and keeps running on theme 3/5/6). This
directory is the start of a native migration to Nyehandel template 8:
instead of re-skinning the Vue DOM from the outside with an externally
loaded `hazey.min.js`, the header/main/etc. are written directly against
Nyehandel's own documented `[#slot]` template variables, so the platform
renders its real components (search, nav, account, cart, mobile menu)
natively — no cloning, no reparenting, no external loader.

## Scope of this delivery

Only: the export structure + build command, a native header, a minimal
Main field, and a clean Head field. **No hero, no footer, no category/
product/product-card fields, no mobile-menu field yet** — those are
scaffolded as empty placeholders in `source/` (see the comment in each)
so the directory shape matches the full planned structure, but
`build-native.js` skips them and they are not in `dist/`.

## Build

```
cd nyehandel-native
node build-native.js
```

Safe to rerun any time after editing anything under `source/` — same
command, no changes needed. It picks up whatever source files now have
real content and regenerates `dist/` accordingly (see the comment at
the top of `build-native.js` for exactly how a file is judged "empty
scaffold" vs. "real, ready to build").

## Paste map — local file → Nyehandel field

| Local file (`dist/`) | Nyehandel admin field |
|---|---|
| `header.html` | **Header** |
| `main.html` | **Main** |
| `head.html` | **Head** |
| `styles.css` | the theme's native **CSS** field (never Head — see CLAUDE.md) |

### Paste these first, in this order
1. `dist/styles.css` → CSS field (so the header has its styling as soon as it renders)
2. `dist/header.html` → Header field
3. `dist/main.html` → Main field (only after confirming the `[#main-content]` placeholder — see limitation below)

`dist/head.html` is also ready, but only needed if the target theme
instance's Head field isn't already carrying Nyehandel's own Google
Fonts/Trustpilot snippet — see the comment inside that file.

No JS file is produced this round (`dist/scripts.js` does not exist
yet) — native slots don't need one, see `source/js/header.js`.

## Nyehandel limitations / open questions (verify before pasting live)

- **Header slots are documented and used exactly as documented**
  (`CLAUDE.md` / support.nyehandel.se article 8679707): `[#logo]`
  `[#navbar]` `[#search]` `[#account-icon]` `[#basket-icon]`
  `[#hamburger]`. Not independently confirmed against template 8 this
  round (no admin access) — in particular, whether a slot may be
  wrapped in an arbitrary `<div>` (as `fields/header.html` does, for
  layout) without breaking Nyehandel's own substitution. If a slot
  renders as literal text instead of the real component after pasting,
  remove the wrapper around that one slot and retest — don't assume
  the whole file is broken.
- **No documented Main-field slot exists anywhere in this repo.**
  `fields/main.html` uses `[#main-content]` as a best-guess placeholder
  following the same bracket convention as the header slots — this is
  NOT a confirmed slot name. Confirm the real one with Nyehandel
  support (or by inspecting a live template-8 Main field, if one
  already exists on the account) before pasting. An unrecognized slot
  should just render as visible literal text rather than break
  anything else on the page, but real content will not appear until
  the right slot name is used.
- **Real internal markup inside each slot is unknown.** `header.css`
  only ever styles the wrapper elements this repo creates around a
  slot (`.hz-header__*`), never a native class/DOM node inside it, so
  it stays safe regardless of what template 8 actually renders there —
  but it also means things like the search field's real width/behavior
  can't be fully polished blind. `.hz-header__search` currently caps
  itself at `max-width:220px` defensively so an unexpectedly wide
  native input can't force horizontal overflow.

## What's deliberately not here yet

`source/fields/footer.html`, `category.html`, `product.html`,
`product-card.html`, `mobile-menu.html`, `source/css/hero.css`, and
`source/js/hero.js` exist as empty scaffold stubs (directory shape
only) for future rounds — each says so in its own header comment via
the exact phrase `NOT part of this delivery`, which is also what
`build-native.js` checks for to skip them.
