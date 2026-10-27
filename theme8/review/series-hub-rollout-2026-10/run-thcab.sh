#!/bin/sh
# TASK 04C-B1 THCaB -- sekventiellt. SH_BASE = git archive 6f6df13 + build.
cd "$(dirname "$0")"
node hub.mjs after thcab 320,393,430
node hub.mjs after thcab 1440,1920
node hub.mjs after thcab 1440 zoom
node hub.mjs after thcab 393 "" fail
node hub.mjs after thcab 1440 "" slow
node interact.mjs after thcab 1440
node interact.mjs after thcab 393
node hub.mjs before thcab 393,1440
node regress.mjs before magic-sauce,alla-vapes,m-s-vapes,home,pdp 393,1440
node regress.mjs after magic-sauce,alla-vapes,m-s-vapes,home,pdp 393,1440
node regress.mjs diff
