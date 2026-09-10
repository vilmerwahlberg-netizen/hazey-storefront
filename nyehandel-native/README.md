# nyehandel-native — template 8 migration

Separate from the current CSS/JS reskin (`css/`, `js/`, `blocks/` at the
repo root, which stays untouched and keeps running on theme 3/5/6). This
directory is the start of a native migration to Nyehandel template 8:
instead of re-skinning the Vue DOM from the outside with an externally
loaded `hazey.min.js`, the header/main/etc. are written directly against
Nyehandel's own native `[#slot]` template variables, so the platform
renders its real components (search, nav, account, cart, mobile menu,
mobile search) natively — no cloning, no reparenting, no external loader.

## Scope of this delivery (header POC)

Only: the export structure + build command, a native header, a clean
Head field, and a clean JavaScript field. **Main is left EMPTY** —
template 8 renders its own normal Main content automatically when the
field has nothing in it (confirmed directly in template 8), so nothing
needs to be pasted there for this POC. **No hero, no footer, no
category/product/product-card fields, no mobile-menu field yet** —
those stay scaffolded as empty placeholders in `source/` (see the
comment in each) so the directory shape matches the full planned
structure, but `build-native.js` skips them and they are not in `dist/`.

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
| `head.html` | **Head** |
| `javascript.html` | **JavaScript** |
| `styles.css` | **CSS** |
| `header.html` | **Header** |

`main.html` is intentionally not in `dist/` this round — see Scope
above. Do not paste anything into Main; leave it exactly as empty as
it is now.

## Paste order (Autosave is confirmed OFF — save once, at the end)

1. **Head** — paste `dist/head.html` (replaces the field's current
   content, which today has the Oliver loader — remove it entirely,
   don't append this alongside it).
2. **JavaScript** — paste `dist/javascript.html` (same: replaces the
   field's current content, which also currently has the Oliver
   loader — confirmed present in both fields, not just Head).
3. **CSS** — paste `dist/styles.css`. This **fully replaces** the
   theme's current CSS field. The existing ~10,000-line CSS in that
   field must not be left in place alongside `dist/styles.css` — the
   field should end up containing only `dist/styles.css`'s content,
   nothing else, after this step.
4. **Header** — paste `dist/header.html`.
5. **Verify Main is still empty** — don't paste anything there.
6. **Save the template once**, after all four fields above are in
   place. Because Autosave is off, nothing takes effect until this
   explicit save — there is no partial/interim save state to worry
   about between steps 1–5.

## What's confirmed vs. still open

Confirmed directly in Nyehandel template 8 and its official docs this
round (not assumptions):
- A native slot may be placed inside its own HTML wrapper without
  breaking Nyehandel's substitution.
- The Main field supports `[#campaign-bar]`, `[#main-content]`, and
  `[#default-main]`; template 8 renders its own normal Main content
  automatically when the Main field is empty.
- Template 8 currently has the Oliver loader in **both** the Head
  field and the JavaScript field (not just one).
- Autosave is off for this theme instance.

Still open / not yet inspected live:
- The real internal markup each header slot renders (e.g. what's
  actually inside `[#navbar]` or `[#search]`) — `header.css` only ever
  styles the wrapper elements this repo creates around a slot, never a
  native class/DOM node inside it, so it stays safe regardless.
- The exact weight list on the Manrope Google Fonts link in
  `dist/head.html` — built from this repo's own typography notes
  (Manrope as template 8's native default), not read back from the
  live Head field's current content. Confirm it matches before
  assuming it's byte-for-byte identical to what's live today.
- No visual or functional verification has been done inside real
  Nyehandel — everything below was checked locally/synthetically only.
  Real confirmation can only happen after these four files are
  actually pasted in and the template is saved and viewed.

## What's deliberately not here yet

`source/fields/footer.html`, `category.html`, `product.html`,
`product-card.html`, `mobile-menu.html`, `source/css/hero.css`, and
`source/js/hero.js` exist as empty scaffold stubs (directory shape
only) for future rounds — each says so in its own header comment via
the exact phrase `NOT part of this delivery`, which is also what
`build-native.js` checks for to skip them. `source/fields/main.html`
carries real, confirmed slot names in its comment for when the
hero/homepage round starts, but is scaffolded the same way for now.
