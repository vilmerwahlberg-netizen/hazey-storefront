# Task 18 – kassa, snabbhet och förtroende (lokal granskning)

Öppna `compare.html` (verklig storlek) eller `compare-*.png`
(m = mobil 393, d = desktop 1440; fold = första vyn, full = hela sidan).
Före = nativ kassa (som idag) och origin/dev `86-checkout.css`; efter = denna
gren. CSS injiceras lokalt i den riktiga Theme 8-previewkassan (`lib.mjs`);
inget i admin ändras och ingen order läggs.

- `flow.mjs` PDP → köpknapp → minicart → Till Kassan
- `shoot.mjs native|base|after` skärmbilder 1440/393
- `tests.mjs` variant, totalsumma mot Kustom, antal ±, ogiltig rabattkod, tab-ordning, överflöd (393/768/1440)
- `back-focus.mjs` Tillbaka-länkens fokus och storlek
- `kustom-probe.mjs` läser Kustom-ramen i Test Mode med fiktiva uppgifter, klickar aldrig "Betala köp"
- `state-probe.mjs` läser Nyehandels kassadata (Vuex) → `runs/checkout-state.json`
- `compare-shot.mjs` renderar jämförelserna
- `consent-probe.mjs` samtycken i Nyehandel + Kustom, avmarkerat nyhetsbrev → `runs/consent.json`
- `cookie-probe.mjs`, `cookie-settings.mjs` cookiebanner, endast läsande → `runs/cookies.json`
- `measure.mjs native|task18` avstånd till totalsumma och Kustoms första fält (393)
- `FINAL-mobile-393-fore-efter.png` (`final-mobile.html`, `final-shot.mjs`) slutlig före/efter i verklig mobilstorlek

Incheckat: skript, HTML, README och mätdata (`runs/*.json`). Skärmbilder
(`*.png`, `before/`, `after/`) och CSS-ögonblicksbilder i `runs/` är lokala
granskningsfiler och checkas inte in; generera om dem med `shoot.mjs`,
`compare-shot.mjs` och `final-shot.mjs`.
