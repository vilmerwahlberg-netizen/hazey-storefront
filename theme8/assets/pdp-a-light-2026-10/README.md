# Faraoh PDP — A Light assets

These assets support the bounded **A Light** desktop refinement of the Faraoh PDP.

## Production asset

- `pdp-stage-botanical-shadow-v1.webp`
  - 800 × 800 px, transparent WebP, approximately 43 kB.
  - Generic cast botanical shadow and restrained golden-hour edge light.
  - Desktop-only decorative layer for the product-media stage.
  - Load only inside the `min-width: 1024px` PDP pilot rule.
  - Decorative only: no alt text, pointer events, focus, product facts or commerce meaning.
  - Intended CSS opacity: 0.12–0.18. Never render at full opacity.

## Source

- `pdp-stage-botanical-shadow-source.png`
  - 1254 × 1254 px RGBA source from which the WebP was encoded.
  - Keep for future re-encoding; do not load it on the storefront.

- `pdp-botanical-plant-cutout-v2.png`
  - 1487 × 1058 px RGBA source with a genuinely transparent background.
  - A photorealistic, late-afternoon-lit plant cluster designed to enter from the lower-right.
  - Keep as the editable source; never load this PNG on the storefront.

## Final pre-push botanical asset

- `pdp-botanical-plant-cutout-runtime-v2.webp`
  - 1200 px wide transparent WebP, approximately 170 kB.
  - This is the only new plant file that may be requested by the browser.
  - Reuse the same file for both the sharp plant and its blurred, tinted cast-shadow layer.
  - Do not bake a landscape, wall, product, text, logo or shadow into the image.
  - The visible plant and its shadow must share one positioning system so they stay aligned at every breakpoint.

### Generation brief

The source was generated from the accepted A Light desktop direction only as a lighting and composition reference. It contains an isolated photorealistic cannabis/hemp plant branch cluster with warm upper-right rim light, transparent negative space above and left, and no baked shadow or scene. It must remain decorative and must never obscure commerce controls or product information.

## Important implementation note

Neither botanical asset is the product backdrop by itself. The visual bridge between the square Nyehandel product image and the larger stage is created with decorative layers behind the real sharp product image. The real product image must keep its exact `currentSrc`, full opacity and unfiltered appearance. The new plant cutout may be duplicated in CSS/DOM to create a continuous, low-opacity cast shadow; both copies must use the same coordinates and the source PNG must never be loaded on the storefront.

