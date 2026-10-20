# Faraoh PDP botanical composites — 2026-10-20

Two transparent decorative overlays for the bounded Faraoh PDP A Light refinement.

## Runtime assets

- `pdp-summary-botanical-composite-runtime-v1.webp`
  - 1200 × 854, transparent WebP, approximately 131 kB.
  - One coherent plant + cast-shadow + late-afternoon light composition for `#hz8-ppsum`.
  - The shadow is intentionally included in the raster so plant and light cannot drift apart.
- `pdp-media-light-shadow-runtime-v1.webp`
  - 1024 × 729, transparent WebP, approximately 187 kB.
  - Projected botanical shadow and warm light only; no plant or product.
  - Desktop product-media stage decoration behind the real product image.

The corresponding `*-source-v1.png` files are editable RGBA sources and must never be requested by the storefront.

## Integration rules

- Decorative only: no alt text, pointer events, focus, product facts, or commerce meaning.
- The real Nyehandel product image remains unchanged, unfiltered, and above the media overlay.
- CSS owns responsive position, scale, opacity, crop, and final edge masking only. Do not synthesize another plant shadow with CSS.
- Load these assets only for the Faraoh PDP pilot and only at desktop breakpoints unless a later visual review explicitly approves mobile use.
- Do not combine the two overlays: their coordinate systems and jobs are different.

## Visual reference

Primary authority: `theme8/review/pdp-a-light-direction-2026-10/01-a-light-desktop-top.png`.

Local integration preview: `theme8/review/pdp-a-light-assets-v2-preview.png`.
