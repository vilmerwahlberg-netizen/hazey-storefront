#!/bin/sh
# TASK 04C-R -- korrigering mobilhero + butikens Core-ruta. SH_BASE = git archive 9d65a85 + build.
cd "$(dirname "$0")"
H=magic-sauce,thcab,thcba,nano11,core
node hub.mjs after $H 320,393,430
node contrast.mjs before $H 320,393,430
node contrast.mjs after $H 320,393,430
SHADOW=1 node contrast.mjs before $H 320,393,430
SHADOW=1 node contrast.mjs after $H 320,393,430
node load.mjs core,magic-sauce cold,throttled
node shop.mjs before 393,1440
node shop.mjs after 393,1440
rm -f runs/regress/*.png
node regress.mjs before $H,alla-vapes,alla-buds,core-vapes,m-s-vapes,home,pdp 1440
node regress.mjs after $H,alla-vapes,alla-buds,core-vapes,m-s-vapes,home,pdp 1440
node regress.mjs before magic-sauce,core 1920
node regress.mjs after magic-sauce,core 1920
node regress.mjs before alla-vapes,alla-buds,core-vapes,m-s-vapes,home,pdp 393
node regress.mjs after alla-vapes,alla-buds,core-vapes,m-s-vapes,home,pdp 393
node regress.mjs diff
