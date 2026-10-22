# Visual quality review

## Evidence first

Inspect rendered output. Source code and green tests cannot establish visual quality. Use screenshots or browser inspection at representative mobile and desktop widths and compare against the accepted reference or direction contract.

## Review order

1. **Specificity:** could this page belong to an unrelated wellness or Shopify brand?
2. **Hierarchy:** with detail blurred, is one focal point obvious per viewport?
3. **Rhythm:** do section scale, density, background, and whitespace create chapters, or repeat one template?
4. **Commerce clarity:** are discovery and purchase paths immediately legible?
5. **Trust:** is evidence present at the right moments without becoming a wall?
6. **Typography:** does type carry identity, and are the jumps in scale meaningful?
7. **Imagery:** are crop, grading, identity, and composition art-directed?
8. **Material:** do borders, radii, shadow, texture, and depth follow rules rather than decorate every element?
9. **Motion:** is there one authored focal moment and restrained supporting behavior?
10. **Adaptation:** does each viewport feel composed rather than merely reflowed?
11. **Scale:** does the page feel accidentally zoomed or stretched on large desktop because type, controls, images, or gaps grew with the viewport?
12. **Layering:** can the visitor distinguish persistent navigation, transient tools, sticky purchase UI, and page content without duplicate bars or collisions?

## Frequent Hazey failure modes

- Calling a page premium after only changing spacing, radius, shadow, and hover states.
- Absorbing a visible regression into a new golden baseline.
- Matching measurements while missing hierarchy and emotional tone.
- Treating the prototype/facit as the forever art direction after the user has rejected its overall look.
- Repeating cream cards until every section has equal weight.
- Applying the same reveal to every descendant.
- Oversized pills and bright toolbar bands becoming more visually important than the products they control.
- A cinematic image being accepted despite blur, weak crop, excessive saturation, or insufficient source resolution.
- Page-specific work silently restyling the accepted global header or footer.
- Two sticky systems occupying the same edge or appearing simultaneously without an explicit priority rule.
- Reporting desktop “unchanged” as success when desktop design is in scope.
- Hiding missing real data behind fabricated labels, links, counts, badges, or claims.

## Acceptance evidence

For significant changes, provide:
- Before and after captures with identical viewport and page state.
- A concise list of visible changes, not only implementation details.
- Motion recordings or frame sequences for interactions.
- A reference/current/after comparison at the same viewport when a visual facit exists.
- Computed measurements only where geometry is the requirement.
- Explicit remaining visual debt and anything intentionally deferred.

Do not create or update a golden baseline until the human has accepted the intended visual result.
