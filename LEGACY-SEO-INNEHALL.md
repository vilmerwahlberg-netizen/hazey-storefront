# Legacy SEO-innehåll på startsidan — inventering 2026-09-01

Detta dokumenterar det äldre, redan publicerade textinnehållet på
startsidan som INTE finns med i den nya prototypens sektionsordning, per
instruktion: "Radera dem inte utan beslut, eftersom de kan bära befintlig
SEO."

## Var det ligger idag

Startsidan, direkt i `.store-startpage`, i två native nyehandel-komponenter:
- `.template-components__text-editor` — en fri textblock-typ.
- `.template-components__columns` — en kolumn-layout-typ.

Ingen av dessa har en egen, dedikerad hubb-/kategorisida idag (ingen sådan
URL hittad i navigationen eller footer-länkarna) — innehållet lever bara
här, på startsidan.

## Innehåll (rubrik + fullständig text, ordagrant)

### 1. "THCA med flera – Svenska lagliga cannabinoider" (intro, text-editor)

> Hazey samlar de bästa lagliga cannabinoiderna så som: THCA, THCB, CBD,
> THCV, H4CBD och Magic Sauce. I olika format: vapes, buds & carts vilket
> erbjuder dig den bästa upplevelsen hemma i Sverige.
>
> Vi arbetar med noggranna utvalda leverantörer för att garantera en
> högkvalitativ produkt och att vi hjälpa människor att uppleva livet på
> sitt allra bästa. Oavsett vad det handlar om att koppla av efter en
> stressig dag eller hitta en naturlig lösning för ett hälsoproblem – vi
> har det du söker.

**Status:** LÄMNAS ORÖRD på sin nuvarande plats (visas fortfarande,
oflyttad) — det här är inte ett "Vad är X?"-par, utan en fristående
introduktion. Ingår inte i den nya "Snabb koll: vad är vad?"-sektionen.

### 2. "Vad är THCA?" (columns)

> THCA (tetrahydrocannabinolic acid) är en naturlig cannabinoid som finns
> i rå cannabis och hampaplantor. I Sverige är THCA lagligt så länge det
> inte omvandlas till THC och totalhalten THC i produkten är under 0,3 %.
> THCA ger ingen rusande effekt i sin naturliga form och är populär i
> vapes och buds.

**Status:** FLYTTAD till "Snabb koll: vad är vad?"-kortgriden (original
rubrik+stycke döljs på sin gamla plats med `display:none` via JS, för att
undvika att samma text visas två gånger — se `js/18b-homepage-v2.js`,
`nhBuildKunskapFromRealContent`).

### 3. "Vad är THCNM?" (columns)

> THCNM, är en syntetisk cannabinoid som utmärker sig med sin klassiska
> kemi. Den är framtagen för att uppfylla dina förväntningar. THCNM
> används ofta i buds och vapes, där dess egenskaper lyfts fram. THCNM
> från HERO har vi valt att sluta sälja.

**Status:** MEDVETET EJ FLYTTAD — kvarstår synlig på sin ursprungliga
plats, orörd. THCNM är en av de cannabinoider som är juridiskt pausade i
navigationsarbetet (se CLAUDE.md/STATUS.md, cannabinoidlagstiftningen
ändrades 2025-12-10) — vi gör den INTE mer framträdande genom att lyfta in
den i den nya, mer synliga kortgriden förrän Vilmer bekräftat juridisk
status. Värt att notera: textens egen sista mening ("...har vi valt att
sluta sälja") antyder att produkten redan är på väg ut ur sortimentet,
vilket stärker att försiktighet är rätt linje.

### 4. "Vad är Magic Sauce?" (columns)

> Magic Sauce är en syntetisk cannabinoid-formulering baserad på
> hamparelaterade föreningar som utvecklats inom gällande lagstiftning.
> Den kombinerar flera noggrant utvalda cannabinoider i en balanserad
> sammansättning och representerar en ny generation av innovativa
> hampabaserade alternativ. Magic Sauce är framtagen med fokus på
> kvalitet, spårbar produktion och konsekvent profil.

**Status:** FLYTTAD till "Snabb koll: vad är vad?"-kortgriden (samma
mekanism som punkt 2).

## Vad som INTE gjorts i denna uppgift

- Ingen ny hubb-/kategorisida har skapats för dessa ämnen.
- Ingen produktionsändring eller SEO-migrering — allt sker bara i den
  lokala, klientsidiga visningen (JS döljer/visar, texten finns kvar
  oförändrad i sitt native nyehandel-innehåll).
- Ingen text är borttagen ur systemet — bara `display:none` på två av tre
  rubrik+styckepar, klientsidan, reversibelt.

## Öppen fråga till Vilmer

Bör "THCA med flera"-introt och de kvarvarande "Vad är X?"-styckena
(THCNM) flyttas till egna, dedikerade hubbsidor inför lanseringen (för att
bevara/stärka SEO-värdet separat från startsidan), eller är det tänkt att
ligga kvar på startsidan permanent? Ingen sådan hubbsida finns byggd idag.
