#!/bin/sh
# TASK 01F -- alla videor, sekventiellt.
cd "$(dirname "$0")"
while read W R X M; do node record.mjs $W $R $X $M 2>&1 | tail -1; done <<LIST
after home 393
after home 1440
after alla-vapes 393
after alla-vapes 1440
after magic-sauce 393
after pdp 393
before home 393
before alla-vapes 393
before alla-vapes 1440
after alla-vapes 393 reduce
LIST
