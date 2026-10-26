#!/bin/sh
# TASK 01C -- navigering/funktion (båda builds) + kurerade ramark. Sekventiellt.
cd "$(dirname "$0")"
for W in before after; do node nav.mjs $W 393,1440; done
for W in before after; do
  SHEET=1 node verify.mjs $W cold ms-carts,magic-sauce,alla-vapes 1440 sheet
  SHEET=1 node verify.mjs $W cold home,pdp 393 sheet
  SHEET=1 node verify.mjs $W throttled ms-carts 393 sheet
done
SHEET=1 node verify.mjs after never-ready,js-throw ms-carts 1440 sheet
SHEET=1 node verify.mjs after css-fail,css-hang home 393 sheet
