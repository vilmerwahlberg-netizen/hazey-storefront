// TASK 17 (kopia av Task 10A:s fetch-cache, egen cache, 2,5 s grundpaus). Artig, read-only GET-hämtning mot www.hazey.se med lokal cache.
// - Concurrency 1 (en global kö), grundpaus + jitter mellan nätverksanrop.
// - Exponentiell backoff på 429/5xx/nätverksfel (respekterar Retry-After).
// - Cache: cache/<sha1>.json {url, status, headers, body, fetchedAt}. Cachad sida hämtas aldrig igen
//   (återupptagning). Bara GET. Inga cookies sparas, ingen inloggning, ingen varukorg.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
export const CACHE = path.join(DIR, "cache");
const LOG = path.join(DIR, "logs", "fetch.log");
fs.mkdirSync(CACHE, { recursive: true });
fs.mkdirSync(path.dirname(LOG), { recursive: true });
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const BASE_DELAY = +(process.env.WOO_DELAY_MS || 2500);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = line => fs.appendFileSync(LOG, `${new Date().toISOString()} ${line}\n`);
const keyOf = url => crypto.createHash("sha1").update(url).digest("hex");
export const cachePath = url => path.join(CACHE, keyOf(url) + ".json");

export function cached(url) {
  const f = cachePath(url);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null;
}

let last = 0;
export async function get(url, { accept = "text/html" } = {}) {
  if (!/^https:\/\/www\.hazey\.se\//.test(url)) throw new Error("utanför scope: " + url);
  if (/add-to-cart|wp-admin|admin-ajax/i.test(url) || /^\/(cart|varukorg|kassa|checkout|my-account|mitt-konto)(\/|$)/i.test(new URL(url).pathname) || /\/wc\/store\/v1\/(cart|checkout)/i.test(url)) throw new Error("förbjuden route: " + url);
  const hit = cached(url);
  if (hit) return hit;
  for (let attempt = 0; attempt < 7; attempt++) {
    const wait = Math.max(0, last + BASE_DELAY + Math.random() * 1500 - Date.now());
    if (wait) await sleep(wait);
    last = Date.now();
    let res, body;
    try {
      const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 45000);
      res = await fetch(url, { method: "GET", redirect: "follow", signal: ctl.signal, headers: { "User-Agent": UA, Accept: accept, "Accept-Language": "sv-SE,sv;q=0.9" } });
      body = await res.text(); clearTimeout(t);
    } catch (e) {
      const back = 5000 * 2 ** attempt; log(`ERR ${url} ${e} backoff ${back}`); await sleep(back); continue;
    }
    if (res.status === 429 || res.status >= 500) {
      const ra = +res.headers.get("retry-after");
      const back = (ra ? ra * 1000 : 0) || 8000 * 2 ** attempt;
      log(`${res.status} ${url} backoff ${back}`); await sleep(back); continue;
    }
    const rec = { url, finalUrl: res.url, status: res.status, headers: Object.fromEntries([...res.headers].filter(([k]) => /^(content-type|x-wp-total|x-wp-totalpages|link|last-modified)$/i.test(k))), body, fetchedAt: new Date().toISOString() };
    fs.writeFileSync(cachePath(url), JSON.stringify(rec));
    log(`${res.status} ${url} ${body.length}B`);
    return rec;
  }
  log(`GIVEUP ${url}`);
  return { url, status: 0, body: "", failed: true };
}

// HEAD (endast headers, ingen kropp) för dokument-URL:er. Samma takt, backoff och cache som get().
// Tillåtna värdar: www.hazey.se och Nyehandels S3-dokumentlagring (för PDF-jämförelse).
export async function head(url) {
  if (!/^https:\/\/(www\.hazey\.se\/wp-content\/uploads\/|nyehandel-develop-storage\.s3\.eu-north-1\.amazonaws\.com\/|www\.folkhalsomyndigheten\.se\/)/.test(url)) throw new Error("HEAD utanför scope: " + url);
  const f = cachePath("HEAD " + url);
  if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, "utf8"));
  const polite = /hazey\.se/.test(url);
  for (let attempt = 0; attempt < 6; attempt++) {
    if (polite) { const wait = Math.max(0, last + BASE_DELAY + Math.random() * 1500 - Date.now()); if (wait) await sleep(wait); last = Date.now(); }
    else await sleep(300);
    let res;
    try { res = await fetch(url, { method: "HEAD", redirect: "follow", headers: { "User-Agent": UA } }); }
    catch (e) { log(`ERR HEAD ${url} ${e}`); await sleep(5000 * 2 ** attempt); continue; }
    if (res.status === 429 || res.status >= 500) { const back = 8000 * 2 ** attempt; log(`${res.status} HEAD ${url} backoff ${back}`); await sleep(back); continue; }
    const rec = { url, method: "HEAD", status: res.status, length: +res.headers.get("content-length") || null, type: res.headers.get("content-type"), etag: res.headers.get("etag"), lastModified: res.headers.get("last-modified"), fetchedAt: new Date().toISOString() };
    fs.writeFileSync(f, JSON.stringify(rec)); log(`${res.status} HEAD ${url} ${rec.length}B`);
    return rec;
  }
  return { url, status: 0, failed: true };
}
