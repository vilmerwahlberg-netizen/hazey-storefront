# Control matrix — universal PDP (Task 10B-4)

Measured in the real Theme 8 preview with the local build injected (`profile.mjs`, 1440 and 393). The expected values come from the 10B prompt and the Task 10A/WooCommerce data. **PASS** means every check passed at both widths. **BLOCKED** applies only to package purchases, which wait for real package products in Nyehandel.

| Id | Class | Variant model / label | Stock | Package rule | Analysis | Modules (disclosures) | Status | Blocker | Evidence |
|---:|---|---|---|---|---|---|---|---|---|
| 2 | färg | color / färg | partial | inga paket (antal) | request | Produktfakta / Innehåll och analys / Leverans och retur / Vanliga frågor | **PASS** | – | proof/control-2.jpg |
| 3 | saknad bild, slutsåld | strain / strain | sold-out | inga paket (antal) | request | Produktfakta / Innehåll och analys / Leverans och retur / Vanliga frågor | **PASS** | – | proof/control-3.jpg |
| 17 | R4 slutsåld | size / vikt | sold-out | inga paket (antal) | request | Produktfakta / Innehåll och analys / Leverans och retur / Vanliga frågor | **PASS** | – | proof/full-R-17-1440.jpg, proof/full-R-17-393.jpg |
| 20 | tjänstepost | – / – | – | inga paket (antal) | – | – | **PASS** | – | proof/control-20.jpg |
| 27 | slutsåld cart | strain / strain | sold-out | inga paket (antal) | request | Produktfakta / Innehåll och analys / Leverans och retur / Vanliga frågor | **PASS** | – | proof/control-27.jpg |
| 57 | strain | strain / strain | in-stock | inga paket (antal) | request | Produktfakta / Innehåll och analys / Leverans och retur / Vanliga frågor | **PASS** | – | proof/control-57.jpg |
| 72 | lång titel | simple / alternativ | in-stock | inga paket (antal) | request | Produktfakta / Innehåll och analys / Leverans och retur / Vanliga frågor | **PASS** | – | proof/control-72.jpg |
| 78 | delvis slut, rea | strain / strain | partial | inga paket (antal) | request | Produktfakta / Innehåll och analys / Leverans och retur / Vanliga frågor | **PASS** | – | proof/control-78.jpg |
| 84 | R3 familj | simple / alternativ | in-stock | family 3/5/10 | product | Produktfakta / Innehåll och analys / Leverans och retur / Vanliga frågor | **PASS (paket BLOCKED)** | paketprodukter saknas i Nyehandel (family 3/5/10); granskningsläge spärrat | proof/full-R-84-1440.jpg, proof/full-R-84-393.jpg |
| 87 | doft = Strain | strain / strain | in-stock | inga paket (antal) | request | Produktfakta / Innehåll och analys / Leverans och retur / Vanliga frågor | **PASS** | – | proof/control-87.jpg |
| 88 | R1 enkel | simple / alternativ | in-stock | inga paket (antal) | request | Produktfakta / Innehåll och analys / Leverans och retur / Vanliga frågor | **PASS** | – | proof/full-R-88-1440.jpg, proof/full-R-88-393.jpg |
| 91 | R2 strain | strain / strain | partial | strain 3/5/9K | variant | Produktfakta / Innehåll och analys / Leverans och retur / Vanliga frågor | **PASS (paket BLOCKED)** | paketprodukter saknas i Nyehandel (strain 3/5/9K); granskningsläge spärrat | proof/full-R-91-1440.jpg, proof/full-R-91-393.jpg |
| 92 | cart, PDF per strain | strain / strain | in-stock | strain 3/5/9K | variant | Produktfakta / Innehåll och analys / Leverans och retur / Vanliga frågor | **PASS (paket BLOCKED)** | paketprodukter saknas i Nyehandel (strain 3/5/9K); granskningsläge spärrat | proof/control-92.jpg |
| 119 | rea, fel PDF dold | simple / alternativ | in-stock | family 3/5/10 | request | Produktfakta / Innehåll och analys / Leverans och retur / Vanliga frågor | **PASS (paket BLOCKED)** | paketprodukter saknas i Nyehandel (family 3/5/10); granskningsläge spärrat | proof/control-119.jpg |

## Cross-cutting tests

- **Purchase to cart** (`buy.mjs`): 88-qty2-1440: 200 → 2 in cart; 91-strain-1440: 200 → 1 in cart; 84-sticky-393: 200 → 1 in cart; 57-faraoh-1440: 200 → 1 in cart; 2-color-393: 200 → 1 in cart
- **Sold out after page load** (`stale.mjs`): state-zero-393: in cart 0, CTA hidden, "Slutsåld"; sold-normal-393: in cart 0, CTA hidden, "Slutsåld"; button-removed-393: in cart 0, CTA hidden, "Slutsåld"; state-zero-1440: in cart 0, CTA hidden, "Slutsåld"; sold-normal-1440: in cart 0, CTA hidden, "Slutsåld"; button-removed-1440: in cart 0, CTA hidden, "Slutsåld"
- **Packages** (`pkg.mjs`): normal-91-393: BLOCKED, package cards 0; normal-84-393: BLOCKED, package cards 0; normal-88-393: none, package cards 0; review-91-393: 3 steps locked, cart calls 0, gallery height 310; review-84-393: 3 steps locked, cart calls 0, gallery height 310; normal-91-1440: BLOCKED, package cards 0; normal-84-1440: BLOCKED, package cards 0; normal-88-1440: none, package cards 0; review-91-1440: 3 steps locked, cart calls 0, gallery height 540; review-84-1440: 3 steps locked, cart calls 0, gallery height 540
- **Sticky** (`states.mjs`, 91 @393): rest: sticky off / dock off; pastCta: sticky on / dock off; chapters: sticky on / dock off; nearFooter: sticky off / dock off; menuOpen: sticky off / dock off; variantOut: sticky off / dock on
- **Reduced motion**: hz8-pp__cta:0s, hz8-pp__tile:0s, hz8-pp-sticky:1e-05s, hz8-ppnav-dock:1e-05s, hz8-totop:1e-05s
