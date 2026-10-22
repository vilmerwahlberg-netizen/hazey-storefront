# Competitive and reference audit

Use this workflow when studying another storefront, an accepted mockup, or an earlier Hazey version. The goal is to extract decisions and trade-offs, not to copy branding, code, copy, or assets.

## Capture comparable evidence

1. Capture current Hazey and each reference in a real browser at the same viewport and comparable page state.
2. Take first-view, full-page, and relevant interaction-state captures. A full-page image alone is unreliable for fixed and sticky elements.
3. Record computed measurements where geometry matters: content edges, hero height, type scale, image ratio, card density, control height, section gaps, radius, border, shadow, and transition timing.
4. Separate source-resolution problems, real product-image differences, and missing data from layout/style differences.

## Read the design in layers

Assess:

- composition and focal hierarchy;
- typography roles and scale jumps;
- palette distribution, not only sampled hex values;
- content width, density, and whitespace rhythm;
- image crop, grading, resolution, and relationship to the canvas;
- material language: open field, rule, card, glass, shadow, texture;
- control language: filters, CTA, tabs, accordions, sticky tools;
- commerce sequence, trust placement, cross-sell, and purchase friction;
- motion purpose, frequency, origin, timing, and interruption;
- mobile recomposition rather than simple stacking.

## Extract design DNA

For each strong pattern, write:

- **Trigger:** the situation the designer needed to solve.
- **Decision:** the concrete visual or interaction choice.
- **Reason:** why that choice supports the page.
- **Evidence:** visible or measured proof.
- **Trade-off:** what the choice sacrifices.
- **Hazey adaptation:** adopt, adapt, or reject, with the brand/platform reason.

Generic conclusions such as "clean", "premium", or "modern" are failures. Prefer concrete statements such as: "The utility row is visually quieter than product titles because its controls use a 40px height, transparent surface, and one accent only."

## Synthesis

Return the three highest-leverage differences first. Distinguish:

1. defects against an already accepted Hazey reference;
2. optional inspiration worth testing;
3. deliberate differences required by assortment, platform, legal copy, accessibility, or performance.

Do not rebuild from a competitor audit. Translate accepted findings into a Hazey mockup or tightly scoped refinement, then obtain visual acceptance before production code changes.
