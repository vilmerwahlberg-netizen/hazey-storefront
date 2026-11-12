/* Blogg: index (/sv/posts) och artikel (/sv/posts/{slug}). TASK 17, 2026-11-12.
   Vald riktning: "A Tidskrift" (theme8/review/blog-seo-2026-11/concepts/).

   Datakällor -- inget hårdkodat:
   - Artiklarna läses ur Nyehandels egen bloggmarkup (.store-posts). Den
     exakta kortmarkupen är OVERIFIERAD (bloggen var tom vid bygget), så
     tolkningen är markup-agnostisk: varje unik länk till /posts/{slug}
     inom listan är en artikel; titel, bild, datum och ingress hämtas ur
     länkens närmaste gemensamma kortbehållare.
   - Ämneschipp = serier i headerns kategorikarta (HZ8.catalog, pausade
     serier exkluderade) som faktiskt förekommer i artikeltitlarna. Ämne
     med 0 artiklar visas inte.
   - Föregående/nästa och "Läs vidare" på artikelsidan hämtas ur
     bloggindexet (samma tolkning, följer paginering).
   - Datum visas bara om sidan själv anger ett; lästid räknas ur texten.
   Om tolkningen inte hittar något lämnas Nyehandels markup orörd. */
(function () {
  "use strict";

  var HZ8 = window.HZ8;
  var MONTHS = ["januari", "februari", "mars", "april", "maj", "juni", "juli", "augusti", "september", "oktober", "november", "december"];
  var POST_RE = /\/posts\/([^/?#]+)\/?$/;
  var ARROW = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function text(el) { return el ? el.textContent.replace(/\s+/g, " ").trim() : ""; }
  function slugOf(href) { var m = HZ8.path(href).split("?")[0].match(POST_RE); return m ? m[1] : null; }
  function norm(s) { return String(s || "").toLowerCase().replace(/[^a-z0-9åäö]/g, ""); }

  /* Datum: <time datetime>, ISO-datum eller "12 juli 2026" i texten. */
  function parseDate(root) {
    var t = root.querySelector("time[datetime]");
    var raw = t ? t.getAttribute("datetime") : "";
    var m = (raw || text(root)).match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m) return { iso: m[0], label: +m[3] + " " + MONTHS[+m[2] - 1] + " " + m[1], node: dateNode(root, m[0]) };
    m = text(root).match(new RegExp("(\\d{1,2})\\s+(" + MONTHS.join("|") + ")\\s+(\\d{4})", "i"));
    if (m) {
      var mo = MONTHS.indexOf(m[2].toLowerCase()) + 1;
      return { iso: m[3] + "-" + (mo < 10 ? "0" : "") + mo + "-" + (+m[1] < 10 ? "0" : "") + +m[1], label: +m[1] + " " + m[2].toLowerCase() + " " + m[3], node: dateNode(root, m[0]) };
    }
    return null;
  }

  /* Minsta element vars text bara är datumet (för att dölja dubbletten). */
  function dateNode(root, needle) {
    var t = root.querySelector("time[datetime]"); if (t) return t;
    var hit = null;
    Array.prototype.forEach.call(root.querySelectorAll("span, time, p, div, small"), function (el) {
      if (!hit && !el.children.length && text(el).indexOf(needle) !== -1 && text(el).length < needle.length + 24) hit = el;
    });
    return hit;
  }

  /* Varje unik /posts/{slug}-länk i listan -> artikel. Kortbehållaren är
     länkens högsta förfader inom listan som inte innehåller någon annan
     artikels länk. */
  function readList(list) {
    var seen = {}, out = [];
    Array.prototype.forEach.call(list.querySelectorAll("a[href]"), function (a) {
      var slug = slugOf(a.getAttribute("href"));
      if (!slug || seen[slug]) return;
      var card = a;
      while (card.parentElement && card.parentElement !== list) {
        var p = card.parentElement, other = false;
        Array.prototype.forEach.call(p.querySelectorAll("a[href]"), function (b) { var s = slugOf(b.getAttribute("href")); if (s && s !== slug) other = true; });
        if (other) break;
        card = p;
      }
      seen[slug] = 1;
      var h = card.querySelector("h1,h2,h3,h4");
      var img = card.querySelector("img");
      var paras = Array.prototype.filter.call(card.querySelectorAll("p"), function (p) { return text(p).length > 40; });
      var title = text(h) || a.getAttribute("title") || text(a);
      if (!title) return;
      out.push({
        slug: slug, href: a.getAttribute("href"), title: title,
        img: img ? (img.getAttribute("src") || img.getAttribute("data-src")) : null, alt: img ? img.getAttribute("alt") || "" : "",
        excerpt: paras.length ? text(paras[0]) : "", date: parseDate(card)
      });
    });
    return out;
  }

  /* Ämnen ur headerns kategorikarta; bara serier som är kunddestinationer. */
  function topicDefs() {
    if (!HZ8.catalog) return [];
    return HZ8.catalog.build().series.filter(HZ8.catalog.discoverable).map(function (s) {
      return { name: s.name, keys: [norm(s.name)].concat(s.attr ? [norm(s.attr)] : []), href: HZ8.catalog.landingFor(s) };
    });
  }
  function topicsFor(title, defs) {
    var t = norm(title);
    return defs.filter(function (d) { return d.keys.some(function (k) { return k && t.indexOf(k) !== -1; }); });
  }

  function thumb(x, cls) {
    return '<span class="' + cls + '"' + (x.img ? "" : ' data-empty="1"') + ">" +
      (x.img ? '<img src="' + HZ8.esc(x.img) + '" alt="' + HZ8.esc(x.alt) + '" loading="lazy" decoding="async">' : '<span aria-hidden="true">Hazey</span>') + "</span>";
  }
  function meta(x) { return x.date ? '<time class="hz8-blog__meta" datetime="' + x.date.iso + '">' + x.date.label + "</time>" : ""; }

  /* ---------------- Index ---------------- */
  function mountIndex(root) {
    var list = root.querySelector(".blog-posts") || root;
    if (root.querySelector(".hz8-blog")) return;
    var posts = readList(list);
    var h1 = root.querySelector("h1");
    var defs = topicDefs();
    posts.forEach(function (p) { p.topics = topicsFor(p.title, defs).map(function (d) { return d.name; }); });
    var counts = {};
    posts.forEach(function (p) { p.topics.forEach(function (t) { counts[t] = (counts[t] || 0) + 1; }); });
    var chips = defs.filter(function (d) { return counts[d.name]; });

    var wrap = document.createElement("div");
    wrap.className = "hz8-blog";
    if (!posts.length) {
      wrap.innerHTML = '<div class="hz8-blog__head"><p class="hz8-blog__kicker">Hazey Journal</p><div class="hz8-blog__h1slot"></div></div>' +
        '<div class="hz8-state hz8-blog__empty"><p>Här samlar vi guider och fördjupning om cannabinoider, format och lagstiftning. Inga artiklar är publicerade ännu.</p>' +
        '<a class="hz8-btn hz8-btn--secondary" href="' + HZ8.esc(HZ8.link("/sv/page/faq")) + '">Vanliga frågor</a></div>';
      list.parentNode.insertBefore(wrap, list);
      if (h1) { wrap.querySelector(".hz8-blog__h1slot").appendChild(h1); h1.classList.add("hz8-blog__title"); }
      else wrap.querySelector(".hz8-blog__h1slot").outerHTML = '<h1 class="hz8-blog__title">Guider &amp; fördjupning</h1>';
      root.setAttribute("data-hz8-blog", "empty");
      return;
    }
    var lead = posts[0], rest = posts.slice(1);
    wrap.innerHTML =
      '<div class="hz8-blog__head"><p class="hz8-blog__kicker">Hazey Journal</p><div class="hz8-blog__h1slot"></div>' +
      '<p class="hz8-blog__lede">Guider och fördjupning om cannabinoider, format och lagstiftning.</p></div>' +
      (chips.length ? '<div class="hz8-blog__chips" role="group" aria-label="Filtrera på ämne"><button type="button" aria-pressed="true" data-topic="">Alla <small>' + posts.length + "</small></button>" +
        chips.map(function (c) { return '<button type="button" aria-pressed="false" data-topic="' + HZ8.esc(c.name) + '">' + HZ8.esc(c.name) + " <small>" + counts[c.name] + "</small></button>"; }).join("") + "</div>" : "") +
      '<a class="hz8-blog__lead" href="' + HZ8.esc(HZ8.link(lead.href)) + '" data-topics="' + HZ8.esc(lead.topics.join("|")) + '">' + thumb(lead, "hz8-blog__lead-media") +
        '<span class="hz8-blog__lead-body"><span class="hz8-blog__kicker">Senaste</span><h2>' + HZ8.esc(lead.title) + "</h2>" +
        (lead.excerpt ? "<p>" + HZ8.esc(lead.excerpt) + "</p>" : "") + meta(lead) + '<span class="hz8-blog__read">Läs artikeln' + ARROW + "</span></span></a>" +
      '<ol class="hz8-blog__list" start="2">' + rest.map(function (x, i) {
        return '<li data-topics="' + HZ8.esc(x.topics.join("|")) + '"><a class="hz8-blog__row" href="' + HZ8.esc(HZ8.link(x.href)) + '">' +
          '<span class="hz8-blog__n" aria-hidden="true">' + (i + 2 < 10 ? "0" : "") + (i + 2) + "</span>" +
          '<span class="hz8-blog__row-body"><h3>' + HZ8.esc(x.title) + "</h3>" + (x.excerpt ? "<p>" + HZ8.esc(x.excerpt) + "</p>" : "") + meta(x) + "</span>" +
          thumb(x, "hz8-blog__thumb") + "</a></li>";
      }).join("") + "</ol>" +
      '<p class="hz8-blog__none" hidden>Inga artiklar i det här ämnet på den här sidan.</p>';

    /* Sidans riktiga H1 (Nyehandels) flyttas in i huvudet -- en H1. */
    if (h1) { wrap.querySelector(".hz8-blog__h1slot").appendChild(h1); h1.classList.add("hz8-blog__title"); }
    else wrap.querySelector(".hz8-blog__h1slot").outerHTML = '<h1 class="hz8-blog__title">Guider &amp; fördjupning</h1>';
    list.parentNode.insertBefore(wrap, list);
    /* Native lista behålls i DOM (crawlbara länkar, paginering) men döljs. */
    list.classList.add("hz8-blog__native");
    var pager = root.querySelector(".pagination, nav[aria-label*='aginering'], nav[role='navigation']");
    if (pager) wrap.appendChild(pager);

    var buttons = wrap.querySelectorAll(".hz8-blog__chips button");
    Array.prototype.forEach.call(buttons, function (b) {
      b.addEventListener("click", function () {
        var t = b.getAttribute("data-topic"), shown = 0;
        Array.prototype.forEach.call(buttons, function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
        Array.prototype.forEach.call(wrap.querySelectorAll("[data-topics]"), function (el) {
          var on = !t || el.getAttribute("data-topics").split("|").indexOf(t) !== -1;
          el.hidden = !on; if (on) shown += 1;
        });
        wrap.querySelector(".hz8-blog__none").hidden = shown > 0;
      });
    });
    root.setAttribute("data-hz8-blog", "index");
  }

  /* ---------------- Indexdata för artikelsidan ---------------- */
  var INDEX_KEY = "hz8-blog-index-v1";
  function loadIndex() {
    try { var c = JSON.parse(sessionStorage.getItem(INDEX_KEY) || "null"); if (c && Date.now() - c.at < 6e5) return Promise.resolve(c.posts); } catch (e) {}
    var all = [], seen = {}, pages = 0;
    function page(href) {
      pages += 1;
      return fetch(HZ8.link(href), { credentials: "same-origin" }).then(function (r) { return r.ok ? r.text() : ""; }).then(function (html) {
        var doc = new DOMParser().parseFromString(html, "text/html");
        var root = doc.querySelector(".store-posts .blog-posts") || doc.querySelector(".store-posts");
        if (!root) return;
        readList(root).forEach(function (p) { if (!seen[p.slug]) { seen[p.slug] = 1; all.push(p); } });
        var next = doc.querySelector("a[rel='next'], .pagination-next:not([disabled])");
        if (next && next.getAttribute("href") && pages < 12) return page(next.getAttribute("href"));
      });
    }
    var indexHref = location.pathname.replace(/\/posts\/[^/]+\/?$/, "/posts");
    return page(indexHref).then(function () {
      try { sessionStorage.setItem(INDEX_KEY, JSON.stringify({ at: Date.now(), posts: all })); } catch (e) {}
      return all;
    });
  }

  /* ---------------- Artikel ---------------- */
  /* Brödtexten = det element som rymmer flest av sidans stycken, utan
     att innehålla H1. */
  function findBody(root, h1) {
    var ps = root.querySelectorAll("p, li");
    var best = null, bestN = 0;
    Array.prototype.forEach.call(root.querySelectorAll("div, article, section"), function (el) {
      if (h1 && el.contains(h1)) return;
      var n = 0; Array.prototype.forEach.call(ps, function (p) { if (el.contains(p)) n += 1; });
      if (n > bestN || (n === bestN && best && best.contains(el))) { best = el; bestN = n; }
    });
    return bestN >= 2 ? best : null;
  }

  function mountArticle(root) {
    if (root.querySelector(".hz8-post")) return;
    var h1 = root.querySelector("h1");
    var body = findBody(root, h1);
    if (!h1 || !body) return;
    var slug = slugOf(location.pathname);
    var title = text(h1);
    var heroImg = null;
    Array.prototype.forEach.call(root.querySelectorAll("img"), function (img) { if (!heroImg && !body.contains(img)) heroImg = img; });
    var date = parseDate(root.querySelector("time") ? root : (h1.parentElement || root));
    if (date && date.node && !body.contains(date.node)) date.node.classList.add("hz8-blog__native");
    var words = text(body).split(" ").length;
    var minutes = Math.max(1, Math.round(words / 200));
    var defs = topicDefs(), topics = topicsFor(title, defs);

    /* Första rubriken i brödtexten som bara upprepar titeln döljs visuellt. */
    var firstH = body.querySelector("h1, h2");
    if (firstH && norm(text(firstH)) === norm(title)) firstH.classList.add("hz8-visually-hidden");
    /* Säkerhetsnät: en H1 i brödtext (importerat innehåll) blir H2. */
    Array.prototype.forEach.call(body.querySelectorAll("h1"), function (h) {
      var h2 = document.createElement("h2"); h2.innerHTML = h.innerHTML; h2.className = h.className; h.parentNode.replaceChild(h2, h);
    });

    var post = document.createElement("div");
    post.className = "hz8-post";
    post.innerHTML =
      '<div class="hz8-post__head"><nav class="hz8-post__crumb" aria-label="Brödsmulor"><a href="' + HZ8.esc(HZ8.link("/sv/posts")) + '">Guider &amp; fördjupning</a></nav>' +
      (topics[0] ? '<p class="hz8-blog__kicker">' + HZ8.esc(topics[0].name) + "</p>" : "") +
      '<div class="hz8-post__h1slot"></div><p class="hz8-post__meta">' + (date ? '<time datetime="' + date.iso + '">' + date.label + "</time> · " : "") + minutes + " min läsning</p></div>" +
      '<div class="hz8-post__hero" hidden></div>' +
      '<div class="hz8-post__grid"><nav class="hz8-post__toc" aria-label="I artikeln" hidden></nav><div class="hz8-post__bodyslot"></div><aside class="hz8-post__aside"></aside></div>' +
      '<div class="hz8-post__after" data-hz8-defer></div>';
    post.querySelector(".hz8-post__h1slot").appendChild(h1);
    h1.classList.add("hz8-post__title");
    if (heroImg) {
      var hero = post.querySelector(".hz8-post__hero");
      hero.hidden = false; hero.appendChild(heroImg);
      heroImg.setAttribute("fetchpriority", "high"); heroImg.removeAttribute("loading");
    }
    body.classList.add("hz8-post__body");
    var host = body.parentNode;
    host.insertBefore(post, body);
    post.querySelector(".hz8-post__bodyslot").appendChild(body);

    /* Innehållsförteckning ur artikelns egna H2:or (minst 3). */
    var hs = Array.prototype.filter.call(body.querySelectorAll("h2"), function (h) { return !h.classList.contains("hz8-visually-hidden") && text(h); });
    if (hs.length >= 3) {
      var toc = post.querySelector(".hz8-post__toc");
      toc.innerHTML = '<p class="hz8-blog__kicker">I artikeln</p><ol>' + hs.map(function (h, i) {
        if (!h.id) h.id = "avsnitt-" + (i + 1);
        return '<li><a href="#' + h.id + '">' + HZ8.esc(text(h)) + "</a></li>";
      }).join("") + "</ol>";
      toc.hidden = false;
    }
    /* Relaterat i butiken: seriens riktiga landningssida. */
    if (topics[0] && topics[0].href) {
      post.querySelector(".hz8-post__aside").innerHTML = '<p class="hz8-blog__kicker">I butiken</p><a class="hz8-post__shop" href="' + HZ8.esc(HZ8.link(topics[0].href)) + '">Se ' + HZ8.esc(topics[0].name) + ARROW + "</a>";
    }

    addSchema(title, date, heroImg, root);

    var after = post.querySelector(".hz8-post__after");
    after.setAttribute("aria-busy", "true");
    loadIndex().then(function (all) {
      after.removeAttribute("aria-busy");
      var i = -1; all.forEach(function (p, k) { if (p.slug === slug) i = k; });
      var prev = i >= 0 ? all[i + 1] : null, next = i > 0 ? all[i - 1] : null;
      var others = all.filter(function (p) { return p.slug !== slug && p !== prev && p !== next; });
      var related = others.filter(function (p) { return topics.length && topicsFor(p.title, topics).length; });
      var more = related.concat(others.filter(function (p) { return related.indexOf(p) === -1; })).slice(0, 8);
      function pn(p, label, cls) { return p ? '<a class="' + cls + '" href="' + HZ8.esc(HZ8.link(p.href)) + '" rel="' + (cls.indexOf("prev") > -1 ? "prev" : "next") + '"><span class="hz8-blog__kicker">' + label + "</span><b>" + HZ8.esc(p.title) + "</b></a>" : "<span></span>"; }
      after.innerHTML = (prev || next ? '<nav class="hz8-post__pn" aria-label="Fler artiklar">' + pn(prev, "Föregående", "hz8-post__prev") + pn(next, "Nästa", "hz8-post__next") + "</nav>" : "") +
        (more.length ? '<section class="hz8-post__more" aria-labelledby="hz8-more-t"><div class="hz8-post__more-head"><h2 id="hz8-more-t">Läs vidare</h2><a href="' + HZ8.esc(HZ8.link("/sv/posts")) + '">Alla artiklar' + ARROW + "</a></div>" +
          '<ul class="hz8-post__rail">' + more.map(function (p) { return '<li><a href="' + HZ8.esc(HZ8.link(p.href)) + '">' + thumb(p, "hz8-blog__thumb") + meta(p) + "<h3>" + HZ8.esc(p.title) + "</h3></a></li>"; }).join("") + "</ul></section>" : "");
    }).catch(function () { after.removeAttribute("aria-busy"); });
    root.setAttribute("data-hz8-blog", "article");
  }

  /* Article + BreadcrumbList, bara om sidan saknar egen Article-schema.
     Endast fakta som finns på sidan. */
  function addSchema(title, date, img, root) {
    var has = Array.prototype.some.call(document.querySelectorAll('script[type="application/ld+json"]'), function (s) { return /"(Blog)?Posting"|"Article"/.test(s.textContent); });
    if (has) return;
    var url = location.origin + location.pathname;
    var desc = document.querySelector('meta[name="description"]');
    var art = { "@context": "https://schema.org", "@type": "BlogPosting", headline: title, mainEntityOfPage: url, url: url,
      author: { "@type": "Organization", name: "Hazey" }, publisher: { "@type": "Organization", name: "Hazey" }, inLanguage: "sv-SE" };
    if (date) art.datePublished = date.iso;
    if (img && img.src) art.image = img.src;
    if (desc && desc.content) art.description = desc.content;
    var crumbs = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Hem", item: location.origin + "/sv" },
      { "@type": "ListItem", position: 2, name: "Guider & fördjupning", item: location.origin + "/sv/posts" },
      { "@type": "ListItem", position: 3, name: title, item: url }] };
    [art, crumbs].forEach(function (o) {
      var s = document.createElement("script"); s.type = "application/ld+json"; s.setAttribute("data-hz8", "blog");
      s.textContent = JSON.stringify(o); document.head.appendChild(s);
    });
  }

  HZ8.blog = { readList: readList, topicsFor: topicsFor, findBody: findBody };

  HZ8.register("blog", function (context) {
    if (context.page !== "blog" && context.page !== "post") return;
    var root = document.querySelector(".store-posts, .store-post, #skip-to-main-content");
    if (!root) return;
    try { if (context.page === "blog") mountIndex(root); else mountArticle(root); }
    catch (e) { if (window.console) console.error("Theme 8 blog failed:", e); }
  });
})();
