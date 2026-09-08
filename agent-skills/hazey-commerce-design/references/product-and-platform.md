# Product and platform constraints

## Product truth

Hazey is a Swedish ecommerce specialist with a broad assortment. The desired impression is market-leading, serious, transparent, culturally distinctive, and friendly. Avoid medical or intoxication claims and terminology that indirectly implies them.

Core trust considerations include truthful analysis/content transparency, domestic fulfilment, no cross-border shipment, delivery expectations and guarantee, and genuine review sources. Verify every claim and number from the current platform or approved documentation.

## Nyehandel architecture

The storefront is a CSS/JavaScript reskin over Nyehandel's Vue/Vuex DOM. Preserve native search, account, navigation, cart, product data, checkout, and accessibility behavior. Work with current integration points documented in repository `CLAUDE.md`; do not replace the platform with a parallel application shell.

The project uses ordered CSS sources and modular vanilla JavaScript that build to generated bundles. Edit owning source files, not generated outputs or accumulated final-fix blocks. Respect existing later-file override order.

## Environments

- Theme 6/dev is the design and verification environment.
- Themes 3 and 5 and the production loader stay untouched.
- Never click PUBLICERA without separate explicit authorization.
- Admin/catalog changes are a separate workflow from storefront code.

## Data architecture

Prefer live data and verified routes. Series administration may use filter tags while selected hidden category landing pages provide indexable SEO destinations. Preserve the established four-axis taxonomy and do not invent routes or hardcode counts because a screenshot shows them.

## SEO and accessibility

- One semantic H1 per page.
- Core copy and links remain in initial DOM.
- Use real anchor destinations; unavailable routes are not `href="#"`.
- Do not change title, meta, canonical, robots, hreflang, or schema during a visual round unless explicitly scoped.
- Do not fabricate Review or AggregateRating schema.
- Maintain meaningful focus order, visible focus, contrast, touch targets, reduced motion, and zero horizontal overflow.

## Responsive reality

Mobile and desktop share product truth and semantic content but receive deliberate compositions. Desktop is not enlarged mobile. Validate current representative widths named in the repository documentation and dynamic-content extremes.
