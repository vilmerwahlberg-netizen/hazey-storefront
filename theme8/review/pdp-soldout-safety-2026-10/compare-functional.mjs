// Jämför runs/functional-base.json och functional-after.json (tidsfält *Ms undantagna).
import fs from "node:fs";
const A = JSON.parse(fs.readFileSync("runs/functional-after.json")), B = JSON.parse(fs.readFileSync("runs/functional-base.json"));
const strip = o => JSON.stringify(o, (k, v) => /Ms$/.test(k) ? undefined : v).replace(/preview=[^&"]+/g, "");
const diff = Object.keys(B).filter(k => strip(A[k]) !== strip(B[k]));
console.log("identiska (utom tidsfält):", Object.keys(B).length - diff.length + "/" + Object.keys(B).length);
for (const k of diff) console.log(k, "\n B", strip(B[k]).slice(0, 400), "\n A", strip(A[k]).slice(0, 400));
console.log("fel i båda:", Object.keys(B).filter(k => B[k] && B[k].error).join(","));
