---
name: hazey-commerce-design
description: Shape, redesign, critique, or polish Hazey.se storefront UI in the hazey-storefront project. Use for visual direction, homepage or commerce-component design, responsive composition, motion, UX/CRO, design-system decisions, and screenshot-to-code work. Not for backend-only work, catalog administration, or ordinary bug fixes whose visual direction is already settled.
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

If the user says the current page is ugly, bland, repetitive, template-like, or not premium, use **Redesign**, not Refine. Do not answer a rejected visual world with smaller radius, shadow, spacing, or color tweaks.

## Required context

Before any Hazey design decision:

1. Read repository `CLAUDE.md`, `STATUS.md`, and `docs/HAZEY-DESIGN-SYSTEM.md`.
2. Inspect current rendered output at both mobile and desktop widths when a browser or screenshots are available.
3. Read [references/product-and-platform.md](references/product-and-platform.md).
4. Read the mode-specific reference:
   - Shape or Redesign: [references/art-direction.md](references/art-direction.md) and [references/workflow.md](references/workflow.md).
   - Refine or Critique: [references/visual-quality.md](references/visual-quality.md) and [references/workflow.md](references/workflow.md).
   - Motion: [references/motion.md](references/motion.md) and [references/visual-quality.md](references/visual-quality.md).
5. For homepage, product-card, navigation, trust, or conversion work, also read [references/commerce-cro.md](references/commerce-cro.md).
6. Read [references/decisions.md](references/decisions.md) before proposing a direction, and update it only after the user explicitly accepts or rejects a material visual decision.

## Non-negotiable design thesis

Hazey should feel like a market-leading Swedish specialist with a culturally specific visual identity: West Coast warmth, independent record-label confidence, botanical materiality, and calm legal/commercial trust. It must feel adult, expensive, friendly, and credible. It must not feel clinical, childish, aggressively stoner-coded, generically luxurious, or AI-generated.

The visitor is shopping, not viewing an art installation. One authored focal moment can be cinematic; routine browsing, product comparison, navigation, and purchase remain immediate.

## Working rules

- The brief and accepted reference images outrank generic skill defaults.
- Use real Hazey content, products, reviews, routes, imagery, and claims. Never fabricate proof or commerce data.
- Give each viewport one dominant focal point. Most elements should support it quietly.
- Establish hierarchy through scale, composition, imagery, contrast, and rhythm before adding containers or effects.
- Do not wrap every idea in a rounded cream or white card. Use proximity, rules, full-bleed media, open editorial composition, controlled dark fields, and changes in density.
- Avoid repeating the same two-column/card skeleton down the page. Vary tempo because content priority changes, not for randomness.
- Preserve conversion clarity: primary actions remain obvious and usable before animation completes.
- Prefer native CSS and the existing vanilla JavaScript architecture. Do not introduce React, Tailwind, GSAP, a component framework, or another dependency unless the user approves the concrete benefit.
- Preserve one semantic H1, initial-DOM content, crawlable links, truthful schema, keyboard use, contrast, reduced-motion behavior, and zero horizontal overflow.
- Never touch Nyehandel admin, themes 3 or 5, production loader, or PUBLICERA unless the user separately and explicitly authorizes it.

## Design before code

For Shape or Redesign, produce 2–3 meaningfully different visual concepts using the same real content. Each concept must define composition, typography, palette distribution, image treatment, section rhythm, and one motion thesis. Show rendered mockups or implementation-faithful HTML prototypes when tools allow. Do not modify production code until the user selects a direction.

For Refine, name the component's primary job, the visible defect, and the single strongest correction before editing. Do not expand the visual system as a side effect.

## Verification

Visual work is not complete because tests are green. Compare rendered before/after captures at representative mobile and desktop sizes. Check hierarchy with a squint test, content density, crop integrity, CTA clarity, contrast, touch and keyboard behavior, reduced motion, loading failure, dynamic-content extremes, and platform integration. Run the repository's established tests after visual acceptance, not as a substitute for it.

Stop after the requested mode and scope. Present the result for human visual review before broadening the redesign.
