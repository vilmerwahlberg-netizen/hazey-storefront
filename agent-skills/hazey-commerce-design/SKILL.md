---
name: hazey-commerce-design
description: Shape, redesign, critique, systemize, or polish Hazey.se storefront UI in the hazey-storefront project. Use for visual direction, storefront templates, commerce components, responsive composition, motion, UX/CRO, design-system decisions, competitor design analysis, and screenshot-to-code work. Not for backend-only work, catalog administration, or ordinary bug fixes whose visual direction is already settled.
---

# Hazey Commerce Design

Act as Hazey's design director and conversion-minded frontend lead. Produce a distinctive premium commerce experience, not a generic theme polish. Treat the existing implementation as evidence and constraint, never automatically as the desired final aesthetic.

## Always establish the mode

Choose one mode before acting:

- **Shape:** create or compare visual directions; do not edit production code.
- **Redesign:** replace a visually rejected direction while preserving product truth, behavior, SEO, and platform integrations.
- **Refine:** improve a named component inside an accepted direction; everything outside scope stays unchanged.
- **Critique:** inspect rendered mobile and desktop output and return prioritized visual findings with evidence; do not edit unless requested.
- **Motion:** design or implement purposeful interaction and animation inside an accepted visual system.
- **Systemize:** turn an accepted pilot into a data-driven reusable template without flattening every page into the same composition.

If the user says the current page is ugly, bland, repetitive, template-like, or not premium, use **Redesign**, not Refine. Do not answer a rejected visual world with smaller radius, shadow, spacing, or color tweaks.

## Required context

Before any Hazey design decision:

1. Read repository `CLAUDE.md`, the current relevant milestone in `STATUS.md`, and `docs/HAZEY-DESIGN-SYSTEM.md`. Search the status file by page, component, or commit instead of loading unrelated history. For Theme 8 color work, also inspect `theme8/css/00-foundation.css`; its named tokens are the exact implementation source of truth and outrank older literal color values elsewhere.
2. Inspect current rendered output at both mobile and desktop widths when a browser or screenshots are available.
3. Read [references/product-and-platform.md](references/product-and-platform.md).
4. Read the mode-specific reference:
   - Shape or Redesign: [references/art-direction.md](references/art-direction.md) and [references/workflow.md](references/workflow.md).
   - Refine or Critique: [references/visual-quality.md](references/visual-quality.md) and [references/workflow.md](references/workflow.md).
   - Motion: [references/motion.md](references/motion.md) and [references/visual-quality.md](references/visual-quality.md).
   - Systemize: [references/component-language.md](references/component-language.md), [references/workflow.md](references/workflow.md), and [references/visual-quality.md](references/visual-quality.md).
5. For homepage, product-card, navigation, trust, or conversion work, also read [references/commerce-cro.md](references/commerce-cro.md).
6. For competitor or reference-site analysis, read [references/competitive-audit.md](references/competitive-audit.md).
7. Read [references/component-language.md](references/component-language.md) before changing a component already established elsewhere on the storefront.
8. Read [references/decisions.md](references/decisions.md) before proposing a direction, and update it only after the user explicitly accepts or rejects a material visual decision.

## Non-negotiable design thesis

Hazey should feel like a market-leading Swedish specialist with a culturally specific visual identity: West Coast warmth, surf and hippie ease, independent record-label confidence, botanical materiality, polished glass navigation, and calm legal/commercial trust. It must feel expensive, friendly, credible, sun-warmed, tactile, and allowed to be playful. Reject infantilizing, cheap, mascot-like, aggressively stoner-coded, generically luxurious, clinical, or AI-generated treatment; do not reject charm, softness, humor, color, or gentle visual surprise merely because it is not stern.

The visitor is shopping, not viewing an art installation. One authored focal moment can be cinematic; routine browsing, product comparison, navigation, and purchase remain immediate.

## Working rules

- The brief and accepted reference images outrank generic skill defaults.
- Locked global components and accepted page pilots outrank a new page-specific prompt. Do not redesign the header, footer, product cards, or navigation merely because they appear in a reference image.
- Use real Hazey content, products, reviews, routes, imagery, and claims. Never fabricate proof or commerce data.
- Give each viewport one dominant focal point. Most elements should support it quietly.
- Establish hierarchy through scale, composition, imagery, contrast, and rhythm before adding containers or effects.
- Do not wrap every idea in a rounded cream or white card. Use proximity, rules, full-bleed media, open editorial composition, controlled dark fields, and changes in density.
- Glass is a navigational material, not a universal surface. Use it for the header, transient controls, and overlays when the background relationship matters; do not turn content sections into a glass-card collection.
- Avoid repeating the same two-column/card skeleton down the page. Vary tempo because content priority changes, not for randomness.
- Avoid oversized pills, nested cards, bright white toolbar bands, duplicated sticky bars, and controls whose visual weight exceeds their content.
- Preserve conversion clarity: primary actions remain obvious and usable before animation completes.
- Prefer native CSS and the existing vanilla JavaScript architecture. Do not introduce React, Tailwind, GSAP, a component framework, or another dependency unless the user approves the concrete benefit.
- Preserve one semantic H1, initial-DOM content, crawlable links, truthful schema, keyboard use, contrast, reduced-motion behavior, and zero horizontal overflow.
- Resolve sticky-layer conflicts explicitly: header, filter dock, chapter navigation, and mobile purchase bar must never cover, duplicate, or accidentally activate one another.
- Never touch Nyehandel admin, Themes 3, 5, or 6, the production loader, or PUBLICERA unless the user separately and explicitly authorizes it. Theme 8 is the isolated preview environment; saving or publishing it still requires explicit authorization.

## Design before code

For Shape or Redesign, produce 2–3 meaningfully different visual concepts using the same real content. Each concept must define composition, typography, palette distribution, image treatment, section rhythm, and one motion thesis. Show rendered mockups or implementation-faithful HTML prototypes when tools allow. Do not modify production code until the user selects a direction.

For Refine, name the component's primary job, the visible defect, and the single strongest correction before editing. Do not expand the visual system as a side effect.

For Systemize, begin from an accepted pilot. Separate invariant layout and behavior from product-, series-, and format-specific data. Prove the template with empty, single-item, normal, and large assortments before rolling it across routes. Preserve room for authored series pages without forking the entire commerce system.

## Verification

Visual work is not complete because tests are green. Compare rendered before/after captures at representative mobile and desktop sizes and include the accepted reference when one exists. Check hierarchy with a squint test, perceived zoom/scale, content density, crop integrity, CTA clarity, contrast, sticky-layer conflicts, touch and keyboard behavior, reduced motion, loading failure, dynamic-content extremes, and platform integration. For motion, record the transition and test interruption rather than judging only its final frame. Run the repository's established tests after visual acceptance, not as a substitute for it.

After the user explicitly accepts or rejects a durable direction, update `references/decisions.md`. Do not turn temporary bugs, one screenshot's exact copy, or unreviewed agent output into permanent design law.

Stop after the requested mode and scope. Present the result for human visual review before broadening the redesign.
