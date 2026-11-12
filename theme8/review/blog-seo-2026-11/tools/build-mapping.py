#!/usr/bin/env python3
"""Bygger artikel-för-artikel-mappning, omdirigeringslista och importpaket.
Användning: build-mapping.py inventory.json articles_dir nh-meta.json outdir
Innehållet ändras ALDRIG i sak: endast länkmål skrivs om, döda länkar packas
upp (ankartexten behålls), H1 i brödtext blir H2 (mallens H1 är titeln) och
Divi-shortcodes tas bort (deras text behålls). Varje ingrepp loggas."""
import sys, json, re, csv, os, html
inv = json.load(open(sys.argv[1])); adir = sys.argv[2]
nh = {x["url"].replace("https://hazeyse.nyehandel.se", ""): x for x in json.load(open(sys.argv[3]))}
out = sys.argv[4]; os.makedirs(out + "/import", exist_ok=True)
slugs = {x["slug"] for x in inv}
# Verifierade mål (finns i Nyehandels sitemap 2026-11-12, status 200).
STATIC = {
    "": "/sv", "/butik": "/sv/page/butik", "/kontakt": "/sv/page/kontakt", "/faq": "/sv/page/faq",
    "/kampanjer": "/sv/page/kampanjer", "/bastsaljare-vapes-laglig-cannabis-i-sverige": "/sv/page/vara-bastsaljare",
    "/artiklar-cannabis-laglig-alternativ-vad-ar-thch-thcjd": "/sv/posts", "/nyheter": "/sv/posts",
    "/category/fordjupning": "/sv/posts", "/author/hazey": "/sv/posts",
    "/produkt-kategori/alla-produkter": "/sv/categories/alla-produkter",
    "/produkt-kategori/blommor": "/sv/categories/blommor-buds",
    "/produkt-kategori/alla-produkter/blommor": "/sv/categories/blommor-buds",
    "/produkt-kategori/alla-produkter/cbd": "/sv/categories/cbd",
    "/produkt-kategori/alla-produkter/cbn": "/sv/categories/cbn",
    "/produkt-kategori/alla-produkter/h4cbd": "/sv/categories/h4cbd",
    "/produkt-kategori/alla-produkter/magic-sauce": "/sv/categories/magic-sauce",
    "/produkt-kategori/alla-produkter/nano-11": "/sv/categories/nano-11",
    "/produkt-kategori/alla-produkter/thcb": "/sv/categories/thcb",
    "/produkt-kategori/alla-produkter/thcv": "/sv/categories/thcv",
    "/produkt-kategori/pennor": "/sv/categories/pennor",
    "/produkt/blommor-cbd-13-fire-kush": "/sv/categories/cbd-buds",
    "/produkt/cart-thc-v-20-super-lemon-haze-1ml-250puffs": "/sv/categories/thcv-carts",
    "/?s=magic+farmers&post_type=product&dgwt_wcas=1": "/sv/brand/magic-farmers",
}
# Mål som finns i Nyehandel men är juridiskt pausade/ej i publik route-matris: kräver beslut.
DECISION = {
    "/produkt-kategori/alla-produkter/thch": "/sv/categories/thch",
    "/produkt-kategori/alla-produkter/thch/thch-gummies": "/sv/categories/thch",
    "/produkt-kategori/alla-produkter/thcnm": "/sv/categories/thcnm",
}
NONE = {"/produkt-kategori/alla-produkter/hhc-o", "/produkt-kategori/alla-produkter/hhcpo", "/produkt-kategori/alla-produkter/thc-jd",
        "/produkt-kategori/alla-produkter/thc-p", "/produkt-kategori/alla-produkter/thcpo", "/produkt-kategori/hhc/hhc-cartridge"}
PAUSED = {"THCNM", "HHCPM", "10-OH-THC"}
NO_ASSORTMENT = {"HHC", "THC-P", "THCJD", "HHC-O", "THCPO", "THCH"}
def norm(href):
    h = html.unescape(href).strip()
    h = re.sub(r"^https?://(www\.)?hazey\.se", "", h)
    path, _, frag = h.partition("#")
    return path.rstrip("/").lower(), frag
def resolve(href):
    p, frag = norm(href)
    m = re.match(r"^/\d{4}/\d{2}/\d{2}/([^/]+)$", p)
    if m and m.group(1) in slugs: return "/sv/posts/" + m.group(1), "artikel"
    if p in STATIC:
        t = STATIC[p]; return (t + ("#" + frag if frag and t.startswith("/sv/page") else "")), "ok"
    if p in DECISION: return DECISION[p], "beslut"
    if p in NONE: return None, "saknas"
    return None, "okänd"
rows, redirects, linklog = [], [], []
for x in inv:
    body = open(f"{adir}/{x['slug']}.html").read()
    log = []
    def relink(m):
        a, href = m.group(0), m.group(2)
        u = html.unescape(href)
        if not re.match(r"^(https?://(www\.)?hazey\.se|/)", u) or u.startswith("//"):
            if 'target="_blank"' in a and "noopener" not in a:
                a = a.replace("<a ", '<a rel="noopener" ', 1)
            return a
        tgt, kind = resolve(u)
        linklog.append({"article": x["slug"], "old": u, "new": tgt or "", "kind": kind})
        if kind == "beslut":
            log.append(f"länk {u} -> {tgt} (KRÄVER BESLUT: pausad/ej publik kategori, länken behålls tills vidare)")
        if tgt is None:
            log.append(f"död länk {u} packad upp (ankartext behållen, mål saknas i Nyehandel)")
            return "<!--hz8-unlinked " + html.escape(u) + "-->"
        return a.replace(m.group(1) + href + m.group(1), m.group(1) + tgt + m.group(1), 1)
    def unwrap(m):
        inner = re.sub(r'(<a\b[^>]*href=(["\'])([^"\']*)\2[^>]*>)', lambda mm: mm.group(1), m.group(0))
        return m.group(0)
    # 1) länkar: skriv om eller packa upp
    def anchor(m):
        full, q, href, inner = m.group(0), m.group(1), m.group(2), m.group(3)
        open_tag = full[: full.index(">") + 1]
        new = relink(re.match(r'<a\b[^>]*?href=(["\'])([^"\']*)\1[^>]*>', open_tag))
        if new.startswith("<!--hz8-unlinked"): return new + inner
        return new + inner + "</a>"
    body2 = re.sub(r'<a\b[^>]*?href=(["\'])([^"\']*)\1[^>]*>(.*?)</a>', anchor, body, flags=re.S)
    # 2) H1 i brödtext -> H2
    n_h1 = len(re.findall(r"<h1\b", body2))
    if n_h1:
        body2 = re.sub(r"<h1\b", "<h2", body2); body2 = re.sub(r"</h1>", "</h2>", body2)
        log.append(f"{n_h1} st H1 i brödtext -> H2 (mallens H1 är artikeltiteln)")
    # 3) Divi-shortcodes
    if re.search(r"\[/?et_pb_[^\]]*\]", body2):
        body2 = re.sub(r"\[/?et_pb_[^\]]*\]", "", body2); log.append("Divi-shortcodes borttagna (text behållen)")
    body2 = re.sub(r"\n{3,}", "\n\n", body2).strip()
    # Kvarvarande rubrikhopp efter H1->H2
    hs = [int(h) for h in re.findall(r"<h([2-6])\b", body2)]
    skips = [f"h{a}->h{b}" for a, b in zip([2] + hs, hs) if b > a + 1]
    if skips: log.append("rubrikhopp kvar: " + " ".join(skips) + " (lämnat, ändras ej utan granskning)")
    imgs_wp = [i["src"] for i in x["images"] if "hazey.se/wp-content" in i["src"]]
    imgs_ext = [i["src"] for i in x["images"] if "hazey.se" not in i["src"]]
    paused = [s for s in x["substances"] if s in PAUSED]; gone = [s for s in x["substances"] if s in NO_ASSORTMENT]
    if paused or gone: status = "BESLUT – juridik/sortiment"
    elif x["medical_terms"]: status = "GRANSKA – hälsoformuleringar"
    else: status = "KLAR för import"
    flags = []
    if paused: flags.append("nämner pausade: " + ", ".join(paused))
    if gone: flags.append("nämner ej sålda/ej publika: " + ", ".join(gone))
    if x["medical_terms"]: flags.append("hälsoord: " + ", ".join(x["medical_terms"]))
    if not x["meta_description"]: flags.append("metabeskrivning saknas i WP")
    if not x["featured_image"]: flags.append("utvald bild saknas i WP (indexkortet visar textkort)")
    elif not x["featured_alt"]: flags.append("utvald bild saknar alt-text i WP")
    if x["images_missing_alt"]: flags.append(f"{x['images_missing_alt']} brödtextbild utan alt")
    if imgs_wp: flags.append(f"{len(imgs_wp)} bild(er) på hazey.se/wp-content måste laddas upp i Nyehandel före domänbyte")
    if imgs_ext: flags.append(f"{len(imgs_ext)} bild(er) på extern CDN (usestyle/conversion.ai) – kontrollera rättigheter/permanens")
    open(f"{out}/import/{x['slug']}.html", "w").write(
        f"<!-- hz8-import slug={x['slug']} wp_id={x['id']} datum={x['date'][:10]} status={status} -->\n{body2}\n")
    old_path = re.sub(r"^https?://(www\.)?hazey\.se", "", x["old_url"])
    redirects.append({"from": old_path, "to": x["new_url"], "code": 301, "note": status})
    redirects.append({"from": old_path.rstrip("/"), "to": x["new_url"], "code": 301, "note": "utan avslutande snedstreck"})
    rows.append({**{k: x[k] for k in ("id", "slug", "date", "modified", "old_url", "new_url", "title", "seo_title", "meta_description", "featured_image", "featured_alt", "words", "categories", "tags")},
                 "status": status, "flags": flags, "fixes": log,
                 "internal_links": len(x["internal_links"]), "images": len(x["images"])})
for p, t in [("/artiklar-cannabis-laglig-alternativ-vad-ar-thch-thcjd/", "/sv/posts"), ("/nyheter/", "/sv/posts"),
             ("/category/fordjupning/", "/sv/posts"), ("/author/hazey/", "/sv/posts"), ("/feed/", "/sv/posts"), ("/category/fordjupning/feed/", "/sv/posts")]:
    redirects.append({"from": p, "to": t, "code": 301, "note": "blogghubb/arkiv"})
json.dump(rows, open(out + "/ARTICLE-MAPPING.json", "w"), ensure_ascii=False, indent=1)
with open(out + "/ARTICLE-MAPPING.csv", "w", newline="") as f:
    w = csv.writer(f); w.writerow(["wp_id", "datum", "status", "gammal_url", "ny_url", "titel", "seo_titel", "metabeskrivning", "utvald_bild", "alt", "ord", "flaggor", "åtgärder_i_importpaketet"])
    for r in rows: w.writerow([r["id"], r["date"][:10], r["status"], r["old_url"], r["new_url"], r["title"], r["seo_title"], r["meta_description"], r["featured_image"], r["featured_alt"], r["words"], " | ".join(r["flags"]), " | ".join(r["fixes"])])
with open(out + "/REDIRECTS.csv", "w", newline="") as f:
    w = csv.writer(f); w.writerow(["from", "to", "code", "note"])
    for r in redirects: w.writerow([r["from"], r["to"], r["code"], r["note"]])
with open(out + "/INTERNAL-LINKS.csv", "w", newline="") as f:
    w = csv.writer(f); w.writerow(["artikel", "gammalt_mål", "nytt_mål", "typ"])
    for r in linklog: w.writerow([r["article"], r["old"], r["new"], r["kind"]])
import collections
print(collections.Counter(r["status"] for r in rows)); print(collections.Counter(l["kind"] for l in linklog)); print(len(redirects), "redirects")
