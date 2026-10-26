#!/bin/sh
# TASK 01C runda 2 (hubbhyllor utan mask, header utan entré efter maskerad boot). Sekventiellt.
cd "$(dirname "$0")"
R=magic-sauce,alla-vapes,ms-carts,pdp
node verify.mjs before cold,throttled $R 393,1440 r2
node verify.mjs after cold,warm,throttled $R 393,1440 r2
node verify.mjs after cold home,alla-produkter,hasch,m-s-vapes 393,1440 r2
node verify.mjs after css-fail,js-fail,js-throw,never-boots,never-ready,css-hang ms-carts 1440 r2
node nav.mjs after 393,1440
node functional.mjs after
for W in before after; do
  SHEET=1 node verify.mjs $W cold magic-sauce 393,1440 sheet2
  SHEET=1 node verify.mjs $W throttled magic-sauce 393 sheet2
  SHEET=1 node verify.mjs $W cold ms-carts,pdp 1440 sheet2
done
