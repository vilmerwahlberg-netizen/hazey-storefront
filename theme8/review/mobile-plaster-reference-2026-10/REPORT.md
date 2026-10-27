# TASK 01D-R — mobil putsövergång mot accepterat facit

- **Bas:** `dev` vid `73fd9c1` (01G ovanpå 01E `a28292a`, 01D `dd07366`,
  01F `f9d7d68`). "Före" = `git archive 73fd9c1` + build, "efter" =
  arbetskopian. Harnessen (`lib.mjs`, kopia av 01D:s, `T01DR_BASE`) injicerar
  respektive build i den riktiga Theme 8-previewn. Nyehandel-admin orört.
- **Facit:** `theme8/review/mobile-hero-plaster-transition-concepts-2026-10/concept-b-eroded-plaster-edge.png`.
- **Asset:** `theme8/assets/category-vapes-hero-2026-10/category-mobile-plaster-edge-v2.webp`
  (2048 × 768, riktig alfa ovanför kanten; kanten går från y≈155 till y≈506,
  helt opak från y≈512; puts ≈ `#f5e2c6`, nederkant ≈ `#f4e6d1`).
- **Visuella rundor:** 2 av max 2 (se nedan). Commit lokal, inte pushad.

## Vad som ersattes (`theme8/css/80-category.css`, bara `max-width: 767px`)

Bort:
- `--hz8-mplaster-h`, `--hz8-mplaster-edge` (SVG-turbulensmasken med lösa flagor);
- `::before` med CSS-sprickor och den nästan vita kalkgradienten;
- `::after` med separat SVG-brus + `category-vapes-plaster-v1.webp` (mobil: `content: none`);
- `filter: drop-shadow(...)` på `.hz8-cat-hero__plaster`.

In (en delad regel för hela `hz8-cat-pilot`-familjen, inga routekopior):
1. `.hz8-cat-hero__plaster::before` = asseten ovanpå livefotot:
   `100% calc(100% + min(6.6vw, 28px)) / min(200%, 860px) auto no-repeat`.
   - **Beskärning, inte sträckning:** bredd 200 % av heron, höjd `auto`
     (proportionerna låsta). Förankrad nere till höger så att den låga,
     brett vågiga högerhalvan av konturen syns — vänsterhalvan av asseten
     sluttar ~70 px över bredden och gav en diagonal, inte facits låga kant.
   - 26 px (393) av den jämna putsen nedtill skjuts under herons kant så att
     konturen hamnar en bit under quizkortet, som i facit.
   - Elementet är `min(42vw, 190px)` högt (räcker för konturens topp).
2. **Söm mot butiksytan:** ett gradientlager ovanpå bilden, bara de nedersta
   34 px: `transparent → var(--hz8-pilot-shop)`. Asseten slutar i `#f4e6d1`,
   butiksytan är `#f1e6d5` — en tonövergång mellan två nästan identiska
   kalktoner, ingen vit dimma.
3. **Synlig övergång efter 01G-skalet:** `--hz8-mplaster-gap:
   clamp(140px, 44.8vw, 192px)` (176 px vid 393).
   - Formatsidorna: quizkortets `margin-bottom` 40 px → `var(--hz8-mplaster-gap)`.
     Hyllan överlappar fortfarande herons sista 29 px (01G oförändrat).
   - Alla produkter: sökfältets nedmarginal (effektivt 54 px; den äldre mobila
     26 px-regeln skrevs alltid över av den senare grundregeln och är kvar
     orörd) → `gap − 29 px`, och antalet "104 produkter", som delar rad 4 med
     sökfältet, flyttas upp exakt lika mycket så att det ligger kvar ovanför
     fältet (347–367 px, identiskt med före).
4. **Asseten har en inbyggd smal varm kantskugga.** Över livefotot blev den
   varken bred eller mörk (ingen halo, se utsnitten), så ingen korrigering av
   skuggan behövdes; inget dimlager, ingen vit gradient, ingen ny procedur-effekt.

Ingen JS ändrad. Desktop-regler, quizkort, header, hyllans/filterradens
utseende, produktkort och produktdata är orörda.

## Rundor

| Runda | Ändring | Utfall vid 393 |
|---|---|---|
| Prototyp (injicerad CSS, inte i källan) | 4 placeringar: full bredd vs 160/200 % beskärning, 130–170 px under kortet | 200 %, nere till höger valdes: lägst och bredast kontur |
| 1 | gap 160 px, förskjutning 16 px | material/färg/skugga rätt; men konturen bara ~55 px under kortet (facit ~100) och för mycket slät puts före hyllan |
| 2 | gap 176 px, förskjutning 26 px | ~80 px foto under kortet, sedan kontur, ~50–70 px puts, hyllan i höjd med facits filterrad — **behållen** |

Efter runda 2 provades (endast prototyp) att ta bort breddtaket 860 px för
200 % zoom; det lyfte putsen bakom quizkortet och förkastades.

## Geometri (`runs/shoot-*.json`; Alla produkter: `shoot-after-portalfix-*`)

| Sida / bredd | hero före → efter | quizkort/sök underkant | hylla topp | första kort |
|---|---|---|---|---|
| Vapes/Buds/Hasch 320 | — → 619 | 476 | 590 | 710 |
| Vapes/Buds/Hasch 393 | 546 → 682 | 506 (oförändrad) | 517 → 653 | 637 → 773 |
| Vapes/Buds/Hasch 430 | — → 713 | 521 | 684 | 804 |
| Vapes/Buds/Hasch 200 % (720) | — → 718 | 526 | 689 | 809 |
| Alla produkter 393 | 483 → 576 | 429 (oförändrad) | 483 → 576 | — |

Matris-JSON:erna `shoot-after-…-320_393_430`, `-1440-z200` och `-393-full`
innehåller Alla produkter *före* antalsfixen (antalet låg då bakom
sökfältet); `portalfix`-filerna ersätter de raderna.

## Verifiering

- **Jämförelse 393** `proof/compare-393-reference-before-after-{alla-vapes,buds,hasch,alla-produkter}.jpg`:
  facit | före | efter, samma viewport, utsnitt quizkortets/sökfältets
  underkant −230/+290 px.
- **Alla fyra sidor 320/393/430/200 %:** `proof/after-320-393-430-zoom200.jpg`.
- **Beredskap** (`ready.mjs`, varje målad ram): Alla Vapes och Alla produkter
  cold/warm/Fast 3G + Buds/Hasch cold — 0 ramar med den gamla faden, 0 ramar
  med foto utan putslager, 0 fel.
- **Laddningsordning** (`loadorder.mjs`, Alla Vapes): fotot och putsasseten
  blir klara inom 0–15 ms från varandra och före avmaskningen — cold 2,9 s vs
  målning 4,8 s; warm 2,3 vs 3,4 s; Fast 3G 14,3 vs 16,2 s
  (`loadorder-after-alla-vapes-throttled.json`; i den första körningen bröt
  loopen innan målningen).
- **Träffytor** (`taps.mjs`, kontrollen scrollad till vyns mitt): quiz-CTA
  (portal: sökfältet), första fliken och "Filter & sortera" träffas på alla
  fyra sidor vid 320/393/430/200 %. `shoot.mjs`:s "BLOCKED null" för CTA vid
  200 % är samma i före (CTA:ns mitt ligger under den 450 px höga vyn).
- **Horisontell scroll:** ingen i någon vy.
- **Konsolfel:** inga nya. En enstaka `404` i `taps.mjs` (Buds 320) gick inte
  att återskapa i två omkörningar och fanns inte i övriga körningar —
  tillfällig plattformsresurs.
- **Pixelstabilt** (`diff.mjs`, `runs/diff.json`): desktop 1440/1920 för alla
  fyra (topp + kant), Magic Sauce-hubben, M&S Vapes, THCaB Vapes (serie ×
  format) och PDP vid 393/1440: **0 px**, utom THCaB 1440 kant 596 px
  (0,099 %) — inne i en produktbild (dynamiskt innehåll, klass 2). Mobilrutterna
  ändras avsiktligt.
- **01E-dockan och filterarket** (`dock-verify.mjs`, Alla Vapes + Buds 393):
  rad och docka aldrig samtidigt (skanning 0, snabb scroll 0 av 108/110
  ramar), fokus tillbaka till dockan, volym 1 ml/2 ml, ingen sökning.
- **Funktionssvit** (`functional.mjs` base vs after): 14/15 identiska; 15:e,
  `home-quick-add`, skiljer bara i svarstid (648 vs 606 ms, samma produkt,
  "Tillagd ✓", POST 200). `allavapes-mobile-sort` fallerar likadant i båda (den
  gamla separata sorteringsknappen som 01G ersatte, se 01G:s rapport).
- **Headerns 01F-beteende:** orört (ingen headerregel ändrad); 01F:s externa
  kontroll efter push: `runs/external-01f-header-after-push-f9d7d68.json`.

## Kvarstående avvikelser mot facit

- **Facit har ingen H1/ingress ovanför quizkortet och ett äldre Filter |
  Sortera-fält.** Livekomponenterna (01G:s flikar + "Filter & sortera") är
  behållna, så sidan ovanför övergången är längre än i facit.
- **Kommersiell kostnad:** för att putsen ska synas mellan quizkortet och
  hyllan börjar produktgriden 136 px längre ned vid 393 (637 → 773); på
  Alla produkter flyttas hyllan 93 px. Vid 852 px vyhöjd syns ~80 px av första
  kortraden i första vyn. Det är facits proportion (kort → filterrad ≈ 155 px),
  men ett medvetet byte av första-vy-yta mot materialövergången.
- **Konturen** är assetens egen och lite mer rytmisk/upprepad i små bucklor än
  facits. Facit har dessutom ett svagt ljusare skimmer vid kanten nere till
  höger; det är inte efterbildat (ingen extra dimma).
- **200 % zoom / 720 CSS-px:** bredden är takad till 860 px, så en större del
  av assetens vänstra sluttning syns och kanten stiger mer åt vänster (den når
  inte quizkortet). Att ta bort taket gav sämre resultat.
- **Laddning på riktigt långsamt nät:** i harnessen levereras asseten lokalt.
  Båda bilderna är CSS-bakgrunder i samma stilmall och ungefär lika stora
  (313 kB vs 264 kB), så ordningen bör vara likvärdig även från Pages, men om
  fotot någon gång blir klart före putsen syns en kort stund en rak nederkant.

## Filer

- Skript: `lib.mjs`, `shoot.mjs` (+ utsnittet `cmp`), `sheet.mjs`, `diff.mjs`,
  `ready.mjs`, `loadorder.mjs`, `taps.mjs`, `dock-verify.mjs` (01G:s kopia),
  `functional.mjs`, `run.sh`.
- Resultat: `runs/*.json`. Råa utsnitt/ramar (`runs/shots`, `runs/frames`)
  ligger kvar lokalt.
