#!/bin/sh
# TASK 01E -- verifiering, sekventiellt (ett Playwright-jobb åt gången).
cd "$(dirname "$0")"
F=alla-vapes,alla-produkter,buds,hasch
node vol-truth.mjs after
node verify.mjs after $F 320,393,430,720z
node verify.mjs before alla-vapes,alla-produkter 393
node flows.mjs after
# (flows.mjs körs bara på efter-bygget: före saknar mobildockan.)
node desk.mjs before $F
node desk.mjs after $F
node shoot.mjs before $F 1440,1920
node shoot.mjs after $F 1440,1920
node shoot.mjs after $F 393 full
node diff.mjs
