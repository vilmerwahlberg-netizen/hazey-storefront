# pdp-ms2ml-2026-11: dekor för MS 2 ml-PDP:n (författad produktsida)

Används bara av `85e-pdp-stage-authored.css` och `85f-pdp-authored-r4.css` (`html.hz8-pdp-authored`). Allt är dekor: ingen alt-text, inga pekhändelser, inget innehåll.

| Fil | Mått | Användning |
|---|---|---|
| `ms2ml-tropical-leaf-l-600.webp` | 600 × 400 | Bladverk vid pappersarkets nedre vänstra hörn (desktop och mobil) |
| `ms2ml-tropical-leaf-r-600.webp` | 600 × 400 | Samma, spegelvänt, nedre högra hörnet |
| `ms2ml-tropical-leaf-{l,r}-1200.webp` | 1200 × 800 | Reserv för 2x/större visning (används inte i CSS ännu) |
| `ms2ml-tropical-leaf-shadow-{l,r}-600.webp` | 600 × 400 | Separat, mycket svag varm kastskugga (opacitet 0,16 i CSS) |
| `ms2ml-paper-{desktop,mobile}.svg` | viewBox 1360 × 330 / 390 × 440 | Arkets kontur (mask) |
| `ms2ml-paper-{desktop,mobile}-rim.svg` | samma | 1,5 px större kontur, ljus fiberkant |
| `ms2ml-paper-{desktop,mobile}-shadow.svg` | samma | Kastskugga under arket (oskarp i CSS) |

## Ursprung

**Bladverket**
- Källa: `HZY/design/top30-paritet-2026-11-16/nasta-batch/tropical-leaf-corner-cutout-v1.png` (1536 × 1024, RGBA, SHA-256 `da02cc1d4fbb20a6…`).
- Levererat av Vilmer i designmappen 2026-11-17 för den här sidan. Rättigheterna är Vilmers att bekräfta.
- Fotografiskt utklipp av breda blad och palmblad, inga cannabisblad.
- De gula kanterna syns bara mot svart bakgrund: förmultiplicerad färg i genomskinliga pixlar. Mot sidans beige är kanten ren (testat med `tools/leaf-test.mjs`).

**Bearbetning** (`theme8/review/ms2ml-pdp-pilot-2026-11/tools/leaf-photo.mjs`)
- Nedskalad till 1200 och 600 px, WebP q 0,86.
- Höger variant är spegelvänd. Ingen färgkorrigering.
- Skuggan är alfakanalen fylld med varm brun, oskarp, förskjuten ned/höger för båda varianterna, samma ljusriktning som sidan (uppe vänster).

**Pappret** genereras deterministiskt av `tools/paper-gen.mjs`: fin deckel i överkant, nästan raka sidor och något rivare nederkant.

De tidigare kodritade bambukvistarna är borttagna. Källfilerna ligger kvar i `theme8/review/ms2ml-pdp-pilot-2026-11/asset-src/`.
