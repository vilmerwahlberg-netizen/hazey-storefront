#!/usr/bin/env python3
"""Inventerar WordPress-inlägg (REST-export) artikel för artikel.
Användning: wp-inventory.py posts.json categories.json tags.json media.json outdir
Skriver inventory.json, inventory.csv och articles/<slug>.html (rensat innehåll,
ordagrant; endast WP/Divi-shortcodes och tomma wrappers tas bort)."""
import sys, json, re, html, csv, os, collections
from urllib.parse import urlparse
posts, cats, tags, media = (json.load(open(p)) for p in sys.argv[1:5])
out = sys.argv[5]; os.makedirs(out + "/articles", exist_ok=True)
cat = {c["id"]: c for c in cats}; tag = {t["id"]: t for t in tags}
med = {m["id"]: m for m in media}
OLD = ("hazey.se", "www.hazey.se")
def text(s): return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s))).strip()
rows = []
for p in sorted(posts, key=lambda p: p["date"]):
    c = p["content"]["rendered"]; y = p.get("yoast_head_json") or {}
    heads = [(int(l), text(t)) for l, t in re.findall(r"<h([1-6])[^>]*>(.*?)</h\1>", c, re.S)]
    imgs = []
    for tagm in re.findall(r"<img[^>]*>", c):
        src = re.search(r'src="([^"]*)"', tagm); alt = re.search(r'alt="([^"]*)"', tagm)
        imgs.append({"src": src.group(1) if src else "", "alt": html.unescape(alt.group(1)) if alt else None})
    links = re.findall(r'<a[^>]+href="([^"]*)"[^>]*>(.*?)</a>', c, re.S)
    internal, external = [], []
    for href, anchor in links:
        u = urlparse(html.unescape(href))
        (internal if (u.netloc in OLD or (not u.netloc and href.startswith("/"))) else external).append({"href": html.unescape(href), "anchor": text(anchor)})
    fm = med.get(p["featured_media"]) if p["featured_media"] else None
    shortcodes = sorted(set(re.findall(r"\[(/?[a-z_]+)[^\]]*\]", c)))
    rows.append({
        "id": p["id"], "slug": p["slug"], "old_url": p["link"], "date": p["date"], "modified": p["modified"],
        "status": p["status"], "title": text(p["title"]["rendered"]), "seo_title": y.get("title"),
        "meta_description": y.get("description"), "robots": " ".join(v for v in (y.get("robots") or {}).values()),
        "canonical": y.get("canonical"), "og_image": (y.get("og_image") or [{}])[0].get("url"),
        "categories": [cat[i]["name"] for i in p["categories"] if i in cat],
        "category_slugs": [cat[i]["slug"] for i in p["categories"] if i in cat],
        "tags": [tag[i]["name"] for i in p["tags"] if i in tag],
        "featured_image": fm and fm.get("source_url"), "featured_alt": fm and fm.get("alt_text"),
        "featured_media_id": p["featured_media"],
        "excerpt": text(p["excerpt"]["rendered"]), "words": len(text(c).split()),
        "headings": heads, "h1_in_body": sum(1 for l, _ in heads if l == 1),
        "heading_skips": [f"h{a}->h{b}" for (a, _), (b, _) in zip([(2, "")] + heads, heads) if b > a + 1],
        "images": imgs, "images_missing_alt": sum(1 for i in imgs if not i["alt"]),
        "internal_links": internal, "external_links": external, "shortcodes": shortcodes,
        "new_url": "/sv/posts/" + p["slug"],
    })
    open(f"{out}/articles/{p['slug']}.html", "w").write(c)
json.dump(rows, open(out + "/inventory.json", "w"), ensure_ascii=False, indent=1)
with open(out + "/inventory.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["id", "date", "modified", "old_url", "new_url", "title", "seo_title", "meta_description", "robots", "categories", "tags", "featured_image", "featured_alt", "words", "h1_in_body", "heading_skips", "images", "images_missing_alt", "internal_links", "shortcodes"])
    for r in rows:
        w.writerow([r["id"], r["date"][:10], r["modified"][:10], r["old_url"], r["new_url"], r["title"], r["seo_title"], r["meta_description"], r["robots"], "|".join(r["categories"]), "|".join(r["tags"]), r["featured_image"], r["featured_alt"], r["words"], r["h1_in_body"], " ".join(r["heading_skips"]), len(r["images"]), r["images_missing_alt"], len(r["internal_links"]), " ".join(r["shortcodes"])])
print(len(rows), "articles")
