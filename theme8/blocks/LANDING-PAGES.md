# Landningsmall (.hz8-lp) – THCX först, sedan /engangsvape/

Status 2026-11-14, gren `feat/theme8-thcx-landing` (granskningsgren, inte
mergad). **Inget är gjort i Nyehandel-admin, inget publicerat, ingen
omdirigering eller katalogändring.**

Visuell riktning: koncept B "produktnära magasin" (Vilmers val 14 november,
`HZY/design/thcx-mall-2026-11-13/koncept-b-produktnara.png`). Första kodade
versionen (`eb477bb`) underkändes visuellt; ombyggd samma dag enligt
`TASK-THCX-VISUAL-REDESIGN.md` – se
`theme8/review/thcx-landing-2026-11/VISUAL-COMPARISON.md`. Skissens
förpackningar, effekttext och citat används inte. Copy: Agent A
(`AGENT-A-THCX-SEO-INNEHALL.md`), korrigerad efter `FAKTAKOLL-2026-11-14.md`.

## Delar

| Fil | Ansvar |
|---|---|
| `theme8/blocks/thcx.html` | Hela sidans innehåll som ett HTML-block: H1, ingress, ankarlänkar, H2-kapitel, FAQ (`<details>`), alla länkar. Allt i initial HTML. |
| `theme8/js/88b-landing.js` | Ur blockets `data-hz8-sources` (I lager-filter): ställer varje produktvägs (`data-hz8-match`) verkliga frilagda Nyehandel-bild på stenstagen med pris och sortnamn, och fyller sortimentsledet (Nyehandels egna kort, varianter som egna kort). Ingen ny text skapas i JS. |
| `theme8/css/88b-landing.css` | Mallens lager: varm canvas, solbelyst puts, stenstage, kontaktskugga, kustuppslag, FAQ-yta. Färger ur `00-foundation.css` + en provtagen putston (`--lp-sun`). |
| `theme8/assets/landing-thcx/` | Produktfria atmosfärsbilder (optimerade kopior ur `visual-redesign/assets/atmosphere/`): puts 1672/900, stage 960, kust 1672/900, olivgren 768 och stenplan 900 (ingår, används inte – grenen togs bort ur FAQ 2026-11-14 eftersom den såg påklistrad ut). Aldrig produktbild eller `og:image`. |
| `theme8/js/88-pages.js` | Lämnar sidor med `.hz8-lp` åt 88b (ingen injicerad H1, ingen dokumentmall). |
| `theme8/review/thcx-landing-2026-11/` | `verify.mjs` (320–1920 + felfall utan atmosfär, utan produktbild, utan produkter), `compare.mjs` (koncept/före/efter), `verify.json`, `VISUAL-COMPARISON.md`, `shots/`, `before-eb477bb/`. |

Ordning (B): H1 `THCX` + ingress + ankarlänkar på solbelyst puts → tre
redaktionella produktvägar på stenstage → sekundärt sortimentsled "Alla
sorter i lager" → öppet uppslag "Vad är THCX?" med kustbild → två
faktaspalter → FAQ med väg till katalogen. Header, footer och
sortimentsledets produktkort är de globala Theme 8-komponenterna.

### Bilder

- **Produktvägarnas förpackningar** hämtas live: produktkortets bild ur
  Nyehandel, begärd som 720 px WebP ur samma bildtjänst (samma original).
  Förpackningen ändras aldrig; bara stagen bakom tonas varmare.
- **Atmosfären** (puts, stage, kust, olivgren) är produktfri och ligger i
  `theme8/assets/landing-thcx/`. Saknas den står canvasens toning kvar.
- Core-hubbens hero (`series-core-family-hero-2026-10`) används **inte**
  (F13).

### Blockets parametrar

```html
<li class="hz8-lp__path" data-hz8-match="/sv/products/a /sv/products/b">  <!-- första i lager visas; ingen i lager -> vägen döljs -->
  <div class="hz8-lp__scene" aria-hidden="true"></div>                 <!-- stenstage + bild från JS -->
  <div class="hz8-lp__path-body"><h3><a class="hz8-lp__path-link" href="/sv/products/a">Namn</a></h3> … <p data-hz8-live></p> …</div>
</li>
<div data-hz8-lp-products
     data-hz8-sources="/sv/categories/hero-vapes /sv/categories/thcx"
     data-hz8-instock="only"      <!-- bara i lager -->
     data-hz8-strain-only         <!-- variantkort utan "– Indica/Sativa" -->
     data-hz8-limit="12">
  <p class="hz8-lp__fallback">…reservlänkar om inget kan hämtas…</p>
</div>
<div class="hz8-lp__photo hz8-lp__photo--coast" role="presentation"></div>  <!-- uppslagets stämningsbild -->
```

Källor är alltid kategorimedlemskap, aldrig fritextsökning. Nästa landning
(`/engangsvape/`) = nytt block med egna källor, vägar och text; nya
atmosfärsbilder = en ny `hz8-lp__photo--…`-modifierare och stagebild i CSS.

## Adminsteg (först efter Vilmers godkännande – Theme 8, klicka inte Publicera)

1. Content → Sidor → Ny sida. Slug **`thcx`** (`/sv/page/thcx` gav 404 i
   preview 2026-11-14 och ser ledig ut; bekräfta i admin innan sparning).
2. Sidnamn: `THCX` (blir brödsmulan "Hem / THCX"). Blocket har egen H1;
   Nyehandel renderar inte sidnamnet som H1 på innehållssidor (kontrollerat
   på `/sv/page/kopvillkor`: ingen H1 i sidmallen).
3. Ett HTML-block med hela `theme8/blocks/thcx.html`.
4. Sidans SEO-fält:
   - Titel: `THCX i Sverige – vapes, hasch och fakta | Hazey`
   - Metabeskrivning: `Vad är THCX? Se Hazeys THCX-sortiment med Hero's Core-vapes och hasch från High Life och El Gringo, analysintyg och svar på vanliga frågor.`
     **Inget fraktlöfte** – kassan har tagit 49 kr även över 499 kr
     (faktakollen). Lägg inte till "Fri frakt" förrän kassaregeln är rättad
     och kontrollerad.
   - Canonical: sidans egen URL, inte `/sv/categories/thcx`. Robots: `index, follow` vid lansering.
5. Verifiera `/sv/page/thcx?preview=…`: en H1 (`THCX`), tre produktvägar
   med riktiga förpackningar och priser, sortimentsledet (idag 6 Hero's
   Core-strains + 3 hasch), inga Indica/Sativa i korttitlar, kustuppslaget.

## Lanseringshinder (måste lösas före publicering)

1. **`/sv/categories/thcx` har en produkt** (El Gringo). Tre länkar på
   landningen pekar dit och är markerade `LANSERINGSHINDER` i blocket:
   "Se hela THCX-sortimentet" (produktraden), "THCX-kategorin" (FAQ 3) och
   "Se hela THCX-sortimentet" (CTA-knappen). Kategorin fylls i katalog-
   arbetet (#28) – eller pekas länkarna om. Ingen katalogändring i den här
   uppgiften.
   Agent A:s förslag (`AGENT-A-THCX-LANSERINGSPLAN.md` avsnitt 5, inte
   utfört): lägg Hero's Core (id 255), Northern Lights (139) och Malaga
   Magic (137) i `thcx`, och 139 + 137 i `thcx-hash`. Därefter kan blockets
   `data-hz8-sources` förenklas till bara `/sv/categories/thcx` (dagens två
   källor fungerar även då – dubbletter tas bort per produkt).
2. **301 `/thcx`, `/thcx/`, `/sv/thcx`, `/sv/pages/thcx` → `/sv/categories/thcx`
   finns redan i Nyehandel** (Agent A fynd 1). Ska riktas till landningen
   när den är godkänd. Inte ändrat.
   Agent A:s senare fynd: det är troligen ingen egen regel, utan Nyehandels
   slug-uppslag på sista ledet (även `/zzz/thcx` omdirigeras). När sidan med
   slug `thcx` skapas kan `/thcx` därför börja leda till sidan i stället för
   kategorin – testas i lanseringsplanens steg L3.
3. **noindex** på hela Nyehandel-miljön (Agent A fynd 6) – landningen måste
   vara indexerbar vid lansering.

## Öppna beslut och blockerat innehåll

4. **Core och THCX – leverantörsbekräftelse saknas.** Lika halt på
   produktsidan (Core 19,34 %) och i intyget (THCX 19,34 %) är ett indicium,
   inte bevis för kemisk identitet. Sidan beskriver Hero's Core som en
   produkt i Hazeys valda THCX-familj och säger uttryckligen att Core och
   THCX inte beskrivs som samma ämne (kapitlet "Hero's Core i THCX-
   familjen" och FAQ 2). Ändras först efter leverantörens bekräftelse.
5. **Analysvärden gäller ett testat batch.** Sidan anger bara THCX 19,34 %
   och "Δ9-THC påvisades inte" för batchet i CBM-Labs Europes intyg utfärdat
   17 oktober 2025, med uttrycklig reservation att det inte beskriver varje
   förpackning som säljs i dag. Övriga cannabinoidvärden är borttagna
   eftersom kopplingen mellan batch PA 45570394 och nuvarande lager inte är
   verifierad. Begär batchspecifika intyg.
6. **Laglighet blockerad (F1).** Varken kapitel eller FAQ-svar; platsen är
   markerad i blocket. Läggs in först när exakt ämnesidentitet och aktuell
   svensk klassificering (Läkemedelsverkets förteckning LVFS 2011:10 med
   ändringar, förordning 1999:58, Folkhälsomyndighetens NPS-beslut) är
   granskade av ansvarig – aldrig ett jakande påstående före dess.
7. **Haschens THCX-innehåll (F3).** Haschen visas bara som del av ägarens
   valda familj; ingen halt eller kemisk tillhörighet anges.
8. **FAQ 6** ("Beskriver ni hur THCX känns eller verkar?") är ny text som
   kräver Vilmers godkännande.
9. **Variantnamnen i katalogen innehåller Indica/Sativa** (F5b). Landningen
   döljer det i korttitel och alt-text (`data-hz8-strain-only`); katalogen,
   produktsidan och förpackningarna visar det fortfarande.
10. **Analysintygens PDF:er ligger på `www.hazey.se/wp-content`** (F11) –
    ingen direktlänk på landningen; intygen nås via produktsidorna.
11. "Se hela utbudet av THCX" i CTA-rutan är medvetet en `<p>`, inte en
    rubrik.

## Före/efter mot gamla `/thcx/`

Fullständig paragraf-för-paragraf-mappning: Agent A,
`HZY/design/thcx-mall-2026-11-13/AGENT-A-THCX-SEO-INNEHALL.md` avsnitt 3.
Kort: H1 `THCX` (sidtiteln i SEO-fältet bär "vapes, hasch och fakta"); titel/meta utan laglighets-, effekt- och fraktlöften; "Vad är
THCX?" omskrivet (handelsnamn + ett daterat, testat batch); laglighet
blockerad; produkter som tre redaktionella vägar + riktiga kort (inte H2); "Därför köper
du"-sektionen och USP-bandet ersatta av den globala trygghetsraden och
sidfoten; FAQ 1, 3, 4 förbättrade, "Skiljer sig mellan tillverkare?"
ersatt av "Är THCX och Core samma sak?" (med svaret att de inte beskrivs
som samma ämne). Inget av "Avstå"-förslagen är beslutat.
