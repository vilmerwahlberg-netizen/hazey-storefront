# TASK 15 — Minicart: native ägarskap

Underlag: `origin/dev` 648a551 (worktree `hazey-storefront-task15`, ingen
kod ändrad), Vuex-probe `runs/probe.json`, `theme8/js/84-cart.js`,
`theme8/css/84-cart.css`, `theme8/js/02a-commerce.js`, `theme8/js/02-shared.js`,
`theme8/js/05a-mobile-nav.js`. Uppmätt 2026-10-30 i Theme 8-preview med lokal
build och egna sessionsvarukorgar. Ingen order, ingen admin.

## Grundregel

Nyehandel har **ingen separat varukorgssida**. Varukorgen är Vue-drawern
`#cart-side-wrap > #cartAside` plus kassans eget steg. **Vuex-modulen `cart`
är den enda varukorgssanningen.** Theme 8 får läsa den, styla drawern och
lägga till idempotenta, härledda rader — aldrig hålla ett eget antal,
en egen summa eller en egen radlista.

## Vuex-modulen `cart` (uppmätt)

| Del | Namn | Vem använder |
|---|---|---|
| State | `cart.cart` (`items`, `quantity_count`, `items_count`, `totals.incVat/exVat/vat`, `formatted_total`, `formatted_total_vat`, `cart_coupon`, `checkout_message`, `add_ons`), `is_open`, `has_changed`, `isUpsellingOpen`, `lastAddedItem`, `accessories`, `meta` | Nyehandel skriver; Theme 8 läser |
| Actions | `cart/load`, `cart/reload`, `cart/setCart`, `cart/addItem`, `cart/addVariant`, `cart/open`, `cart/close`, `cart/closeUpselling`, `cart/addMetaItem`, `cart/setCartMessage`, `cart/*CheckoutMessage*` | Theme 8 får anropa `addVariant`, `reload`, `open`, `close` |
| Mutations | `cart/setCart`, `setIsOpen`, `addItem`, `setHasChanged`, `setUpsellingOpen`, `setLastAddedItem`, `setAccessories`, `setMeta`, `setCartAnonymous`, `setCheckoutMessage` | Theme 8 committar **inga** mutations, prenumererar bara (`store.subscribe`) |

Radobjekt (`items[]`), relevanta fält: `id`, `product_id`, `variant_id`,
`name`, `option_values[].option.name/name` (t.ex. `strain: Forbidden Fruit`),
`quantity` (sträng `"1.00"`, men **tal** efter optimistisk ändring),
`formatted_price` (styckpris efter mängdtrappa), `formatted_total`,
`has_compare`, `formatted_comparison_row_total`, `discount`, `discount_type`,
`minimum_quantity_to_order`, `maximum_quantity_to_order` (null i alla
testade), `href`, `image.thumb_url`, `unit` (`Styck`).

## Frontend-API (Nyehandels egna)

| Anrop | Vem startar | Kommentar |
|---|---|---|
| `POST /frontend-api/cart/item` `{product_variant_id, quantity, meta}` | Nyehandels köpknapp, `HZ8.addVariant` (fallback), PDP-paket (`83-pdp-purchase.js`), korsförsäljning | Svarar 406 över lager |
| `PUT /frontend-api/cart/item/{id}` `{… hela raden …, quantity}` | Nyehandels +/−/fält; Theme 8 `hz8-upgrade__btn` | Nyehandel uppdaterar raden optimistiskt **innan** svaret |
| `DELETE /frontend-api/cart/item/{id}` | Nyehandels papperskorg | |
| `POST /frontend-api/shared-cart` | "Dela varukorg" | Native, fungerar |
| `POST /frontend-api/product/state` | Theme 8 (`tiersFor`, `HZ8.productState`) | Läsning: pristrappa, lager per variant |

## Drawerns DOM — vem äger vad

| Region | Selektor | Ägare | Theme 8 får |
|---|---|---|---|
| Wrapper + öppet läge | `#cart-side-wrap(.is-active)`, `#cart-overlay` | Nyehandel (Vue) | Styla; läsa klassen; öppna/stänga via `cart/open`/`cart/close` eller `.close-cart`-klick |
| Dialogen | `#cartAside.cart.aside` | Nyehandel | Styla. Theme 8 sätter `role=dialog`, `aria-modal`, `aria-label` om de saknas |
| Rubrik | `.header h2` "Din varukorg" | Nyehandel | Theme 8 byter textnoden till "Varukorg " och lägger `span.hz8-cart-count` |
| Stäng | `.close-cart` | Nyehandel | Styla |
| Radlista | `.section.items > article.item` | Nyehandel, **ritas om av Vue** | Styla. Bara injicera i `article.item` med signaturkontroll |
| Bild, namn, styckpris, variant | `.media img`, `.content a strong`, `.price`, `.option` | Nyehandel | Styla. Ändra aldrig text/länk |
| Antal | `.item-amount .amount-input` (−, `input[name=quantity]`, +, papperskorg) | Nyehandel (logik, debounce, PUT/DELETE) | Styla, större träffyta. **Ingen egen stegare, ingen egen PUT för ±** |
| Radsumma | `article.item > .total` (+ `del` vid jämförpris) | Nyehandel | Styla |
| Summering | `.section.footer .total .sum`, `.tax` | Nyehandel | Styla |
| Kassaknapp | `.section.footer .button.buy` "Till Kassan" | Nyehandel (navigering till `/sv/checkout`) | Styla. Theme 8 lägger `data-hz8-label`/`aria-label` "Till kassan · {total}" och renderar etiketten via `::after` |
| Fortsätt handla | `.continue-shopping` | Nyehandel | Styla |
| Dela varukorg | `.share-cart` | Nyehandel | Styla |
| Tomläge | `section.empty` (h3 "Din varukorg är tom", "Börja handla") | Nyehandel | Styla; Theme 8 lägger kategorilänkar ur `HZ8.navCategories` |
| Rabattkod/kupong | `cart_coupon` (null), kodfält finns **inte** i drawern | Nyehandel kassa | Inget i drawern |
| Upselling-panel | `.upselling-sidebar__container` (`isUpsellingOpen`, `accessories`) | Nyehandel | Ej aktiverad i testerna (öppnades inte vid köp). Får inte dupliceras |
| Kassasidan | `body.checkout-page` | Nyehandel + Kustom-iframe | **Utanför Task 15.** Kassan kör inte Theme 8-JS |

## Theme 8:s injicerade element idag (`84-cart.js`)

| Element | Källa | Sanningsgrad | Kommentar |
|---|---|---|---|
| `.hz8-cart-count` | `quantity_count` | Härlett | OK |
| `#hz8-cart-live` | `quantity_count`-ändring | Härlett | Ett element på `body` |
| `.hz8-goal` (frakt → bonus) | `HZ8.commerce` + `totals.incVat` | **Regler ej verifierade i Nyehandel** | Spärrad bakom `backendVerified:false`, men **visas i previewn** |
| `.hz8-cart-shipline` "Frakt: Fri frakt / 79 kr tillkommer" | `HZ8.commerce` | **Motsäger kassan** (49 kr vid alla belopp idag) | Se ACCESSIBILITY-AND-ERRORS |
| `.hz8-upgrade` per rad | `product/state` pristrappa + egen PUT | Härlett, men egen skrivväg | Inaktuell text efter ± (se STATE-MATRIX) |
| `.hz8-cart-savings` "Du sparar X" | `formatted_comparison_row_total − formatted_total` | Härlett ur Nyehandel | OK |
| `.hz8-cart-trust` | Hårdkodad lista | "Trygg betalning" saknar belägg i COMMERCE-RULES; övriga två finns i footern | Behöver beslut |
| `.hz8-xsell` "Komplettera din order" | Seriehubbar + `product/state` | Härlett | Tung (många fetchar), kan flytta CTA nedåt |
| `.hz8-cart-empty-lead/-links` | `HZ8.navCategories` | Härlett | OK |
| Fokusfälla, Escape, fokusretur | `HZ8.trapFocus` | — | Fungerar (KEYBOARD) |
| Scroll-lås | CSS `html:has(#cart-side-wrap.is-active){overflow:hidden}` | — | Fungerar |

`js/05-cart-checkout.js` (Theme 6/legacy `nh-cart-swish`) laddas inte av
Theme 8; dess rad döljs ändå defensivt i `84-cart.css`.

## Säkra gränser för implementationen

1. Läs bara `HZ8.store().state.cart`. Committa aldrig `cart/*`-mutations.
2. Skriv bara via Nyehandels egna kontroller eller dokumenterade API-anrop
   följda av `cart/reload`. Inga egna antal, totaler eller radlistor.
3. Varje injicerat element: en markörklass, `querySelector`-guard, och
   synk vid både `HZ8.watch` (childList) och `store.subscribe(cart/*)`
   (textändringar). Signatur (`data-sig`) ska bygga på **samma** värden som
   visas, så att inaktuell text inte kan överleva.
4. Native text får döljas visuellt bara om samma information finns kvar i
   tillgänglighetsträdet (som `::after`-etiketten idag).
5. Plattformsregioner (`PLATFORM_MANAGED_SELECTORS`) — antalskontroll,
   kassaknapp, papperskorg — får restylas men inte ersättas eller klonas.
6. Inga frakt-, bonus- eller trygghetslöften som inte är verifierade mot
   Nyehandels faktiska kassa.
