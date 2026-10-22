# Design decisions and rejections

This file records durable human decisions, not agent opinions. Add an entry only after the user explicitly accepts or rejects a material direction. Keep entries short and preserve their date and scope.

## Accepted product and brand truths

- Hazey should appear market-leading, expensive, thoughtful, cool, serious, and trustworthy.
- The cultural direction combines West Coast, surf, hippie, rap, cannabis, friendliness, and controlled playfulness. “Childish” is not the right exclusion: reject infantilizing, cheap, mascot-like, toy-like, or credibility-damaging execution, while preserving warmth, charm, softness, humor, and visual surprise.
- Conversion and customer journey outrank decorative spectacle.
- Relevant motion and interaction are desirable when they do not block browsing or purchase.
- Delivery, analysis/content transparency, domestic fulfilment/no cross-border shipping, and genuine reviews are core trust material.
- Desktop deserves a dedicated composition rather than enlarged mobile.

## Rejected outcomes

- The current repeated cream/white rounded-card treatment is too flat, safe, and visually generic as a complete homepage direction.
- Technical correctness, green tests, or pixel measurements alone are not evidence that the design is premium.
- Small spacing, radius, shadow, and hover adjustments are not an acceptable answer to a requested visual redesign.
- Autoplay-only hero control, a carousel that cannot loop, image zoom/crop drift, and reveal animations that complete before the user scrolls are rejected.
- 2026-10-09 | sitewide product cards | rejected | Round dark-green purchase buttons containing only a plus sign | They look generic/vibecoded, communicate the action too weakly, and were already rejected on the homepage; use a compact text-labelled purchase action instead.

## Provisional, not locked

- Working art-direction label: California Editorial Apothecary / West Coast Counterculture Commerce.
- Cream, olive, serif, and orange are available brand materials, but their current proportions and repeated card treatment are not locked.
- A 3D hero cube may become a signature interaction if crop, usability, performance, looping, and reduced motion are all correct.
- Apple-like polish is desirable as a motion quality bar, not as permission for scroll-jacking, gratuitous glass, or animation on every element.

## Recorded decisions

- 2026-10-09 | category pages, Alla Vapes pilot | accepted | Use `theme8/review/category-redesign-build-reference-2026-10/07-final-hybrid-sunset-editorial.png` as the primary visual reference: editorial paper-to-coast composition, visible sunset photography, integrated olive quiz surface, compact filters and labelled rectangular purchase actions | It combines the clearest commerce layout with stronger Hazey identity and avoids the washed-out white overlay.
- 2026-10-09 | category hero details | accepted | H1 and adjacent editorial marks/handwritten decorative details should use Hazey green; orange remains a controlled CTA and active-filter accent | This keeps the decorative layer coherent with the brand rather than introducing unrelated black/grey ink.
- 2026-10-09 | Alla Vapes information architecture | accepted | Alla Vapes is the unified shopping surface for vapes, carts and refills; carts and refills are product-type filters within the page rather than separate category journeys. Batteries remain under Tillbehör and may be cross-sold contextually with carts | Customers should compare these closely related formats in one catalog instead of being sent between fragmented landing pages.
- 2026-10-13 | Alla Vapes discovery taxonomy | accepted, provisional | Cannabinoid and commercial series are intentionally treated as one combined filter/search dimension for now, with grouped presentation allowed inside the same control | Customers currently search for Hazey's single-supplier series and cannabinoid families in the same way; separating them would add friction. Revisit only through a later explicit taxonomy decision.
- 2026-10-13 | Alla Vapes volume filters after catalog migration | accepted | The intended assortment sizes are 1 ml carts, 2 ml carts, 2 ml vapes, 5 ml vapes and 10 ml refills; 0.5 ml and 1+1 ml are legacy values that should disappear once the real catalog migration is complete | Filters must be derived from the migrated live assortment and must not preserve obsolete sizes merely because they occur in the current Nyehandel data.
- 2026-10-16 | Faraoh PDP final visual direction | accepted | Use `theme8/review/pdp-final-handoff-2026-10/01-accepted-mobile-direction.png` as the locked mobile composition and `02-accepted-desktop-v2-direction.png` as the desktop structural direction: warm nuanced sand canvas, aligned desktop first viewport, centered compact strain rail and an open botanical product overview blended into the page rather than a dark campaign block | The mobile proposal feels coherent and warm; Desktop V2 corrects the mismatched column heights and pasted-in high-contrast product-story treatment. Future rounds should refine components instead of replacing this visual world.
- 2026-10-21 | global header | accepted | Use one compact, centered translucent glass bubble on desktop with adaptive light/dark content and semi-sticky behavior: remain initially, hide after meaningful downward scroll, return after upward intent | It preserves the hero beneath, reduces dead width, and keeps navigation available without becoming a permanently covering solid bar.
- 2026-10-21 | desktop content geometry | accepted | Finished commerce surfaces use a centered large-screen content cap and shared alignment rather than stretching grids and text indefinitely; heroes and atmospheric decoration may use deliberate wider exceptions | The previous full-width scaling felt zoomed and budget-like on 1920px displays.
- 2026-10-21 | category filter dock | accepted | Keep the full filter row in normal flow and reveal a compact translucent desktop dock from the left only after that row has left view; never show both simultaneously and never show the dock on mobile | This preserves conversion access without producing two stacked hero/header-like bars.
- 2026-10-22 | control styling | rejected | Oversized monotone pill rows, bright white full-width filter bands, and duplicated sticky navigation blocks | They compete with product content, feel template-generated, and create unclear hierarchy.

## Entry format

`YYYY-MM-DD | scope | accepted/rejected | decision | reason`

Do not rewrite prior entries to make later work appear consistent. Append corrections.
