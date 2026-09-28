# Den äldre kontraktor-bundlen i Theme 8

Theme 8:s **Head-fält** laddar fortfarande
`https://cdn.jsdelivr.net/gh/Oliverforss8/hazey-storefront@v1.0.3/hazey.min.js`
(den tidigare kontraktorns bundle, samma som live-temat). Theme 8:s egen
loader ligger separat i JavaScript-fältet. Enligt CLAUDE.md ska exakt EN
Hazey-loader finnas, och den gamla ska tas bort — **inte gjort** (admin).

Inventering 2026-09-28 (Theme 8-preview, kategori/produkt/innehållssidor):

| Vad den gamla bundlen gör | Theme 8 idag | Beroende kvar? |
|---|---|---|
| `nh-card-buy` köpknapp på produktkort | Dold; Theme 8:s "+ Lägg till"/"Välj variant" (cart/addVariant) | Nej |
| `nh-ribbon-row`, `nh-stars` på kort | Nyehandels egna ribbon/stjärnor stylas också | Nej |
| `nh-cat-box`/`nh-cat-lead` kategoritext | Theme 8 använder Nyehandels native `.readmore` | Nej |
| `nh-vbox` variantknappar, `nh-bulk`/`nh-tier` pristrappa | Dolda; Theme 8:s variantknappar + paketväljare | Nej |
| `nh-sd-body`/`nh-sd-toggle` produkttext-klamp | Theme 8:s ingress fungerar med och utan omslaget | Nej |
| `nh-review-cta` "Lämna ett omdöme" | Stylas; utan bundlen finns Nyehandels egen Recensioner-sektion | Nej (funktionen finns natively) |
| `nh-footer` | Dold; Theme 8:s gemensamma footer | Nej |
| `nh-cart-swish` i varukorgen | Bara dekor (Swish-logga) — försvinner utan bundlen | Nej |
| `nh-topbar-marquee` | Topbaren döljs redan av Theme 8 | Nej |
| **Produktlistor på Butik, Bästsäljare, Kampanjer** (`data-nh-source`, `nh-bs-filters`, `#nh-kampanjer-grid`) | **Theme 8 fyller dem nu själv** (88-pages.js) med riktiga kort | Nej |
| Kassan (Head-fältet laddas där) | Ingen synlig påverkan observerad i den fyllda kassan | Okänt — kontrollera efter borttagning |

Verifierat med bundlen **blockerad**: kategori, produkt, FAQ, Butik,
Bästsäljare och Kampanjer renderar och fungerar (produktlistor fylls,
0 skelett kvar, 0 horisontell scroll).

## Innan skriptet kan tas bort (manuellt i admin)

1. Theme 8 → Head-fältet: ta bort raden som laddar
   `Oliverforss8/hazey-storefront@v1.0.3/hazey.min.js` (behåll typsnitt +
   Trustpilot). Spara Theme 8 — klicka **inte** Publicera.
2. Kontrollera i previewen: startsida, en kategori, en produkt (variant +
   köp), Butik, Bästsäljare, Kampanjer, FAQ, Kontakt, varukorg och kassa.
3. Kontrollera kassan särskilt (Head-fältet är det enda som laddas där).
