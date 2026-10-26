#!/bin/sh
# TASK 01C -- hela laddningsmatrisen, sekventiellt (aldrig parallella jobb mot previewn).
# Kräver T01C_BASE=<katalog med HEAD-build> för "before".
cd "$(dirname "$0")"
R=home,alla-produkter,alla-vapes,hasch,magic-sauce,m-s-vapes,ms-carts,pdp
for W in ${WHICH:-before after}; do
  node verify.mjs $W cold,warm $R 393,1440,1920
  node verify.mjs $W throttled $R 393,1440
  node verify.mjs $W zoom200 home,alla-vapes,ms-carts,pdp 1440
  node verify.mjs $W css-fail,js-fail,js-throw,never-boots,never-ready,css-hang home,ms-carts 393,1440
done
