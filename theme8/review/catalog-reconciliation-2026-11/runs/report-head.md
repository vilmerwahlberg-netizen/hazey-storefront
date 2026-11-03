# TASK 17 – katalogavstämning efter migreringen (Theme 8)

- Datum: 2026-11-03. Worktree `../hazey-storefront-task17`, branch `audit/task-17-catalog-reconciliation`, utgår från **origin/dev = 5ad3944** (oförändrad sedan Task 15). Huvudrepots smutsiga dev-checkout är inte rörd.
- **Ingen push, ingen publicering, inga adminändringar** (Nyehandel eller WooCommerce), inga produktdata, ingen loader och inget produktionstema. WooCommerce lästes bara med GET (concurrency 1, 2,5 s + jitter, cache). Nyehandel lästes med GET och sin egen läsande `product/state`. Varukorgstestet använde en preview-session, och ingen order lades.
- Reproducera: `node woo.mjs && node nh.mjs && node facets.mjs && node analyze.mjs && node stale-ids.mjs && node docs-verify.mjs && node registry.mjs && node routes.mjs && node image-audit.mjs && node build-docs.mjs`. Verifiering: `node verify.mjs after all`, `XD_BASE=<build av 5ad3944> node verify.mjs before routes|pdp`, `node cart.mjs`, `node sheets.mjs`.

## Leverabler

| Fil | Innehåll |
|---|---|
| `CURRENT-CATALOG-MATRIX.md/.json` | Alla 140 produkter: Woo ↔ NH (id, slug, URL), synlighetsklass, kategorier, pris, rea, lager per variant, typ, serie/cannabinoid/format, volym, bilder, avvikelse → åtgärd |
| `SERIES-FORMAT-MATRIX.md/.json` | Serie × format med antal, volymer, Woo/NH-kategori, Theme 8-route, luckor och särskilt kontrollerade delar |
| `ROUTE-RECONCILIATION.md` | Alla Nyehandel-kategorier ↔ header, relationskarta, hubbar, combos, PDP, minicart, före/efter |
| `STALE-ID-MAP.md` | Alla 121 gamla produkt-id → nya, register i koden, kvarvarande tomma routes |
| `NYEHANDEL-VISIBILITY-ACTIONS.md` | Exakt lista: dölj (A–D), granska (E), visa (F), plus lageravvikelser |
| `ADMIN-CATEGORY-ACTIONS.md` | Kategorier att skapa och ändra, tomma gamla kategorier, redirects, attribut, bästsäljarblocket, PDF:er, omdömen |
| `OWNER-DECISIONS.md` | 19 punkter med rekommendation |
| `PACKAGE-MIGRATION-PLAN.md` + `PACKAGE-REGISTRY.json` | Alla 36 paket, 134 steg, modeller, priser (Woo-facit), tillåtna produkter, vad som krävs; maskinläsbart register |
| `PRODUCT-IMAGE-AUDIT.md` + `sheets/product-images-{393,1440}.jpg` | Mätt bildinventering och jämförelseblad |
