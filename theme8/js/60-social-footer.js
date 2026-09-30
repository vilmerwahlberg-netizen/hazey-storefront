(function () {
  "use strict";

  /* Footern är gemensam för alla sidtyper -- exakt samma markup som
     startsidan redan använder, nu även monterad på övriga sidor. */
  function footerHTML() {
    return '<footer class="hz8-footer"><div class="hz8-footer__inner"><div class="hz8-footer__brand"><strong>HAZEY.se</strong><em>Good Plants. Brighter Days.</em></div><div class="hz8-footer__col"><b>Shop</b><a href="/sv/categories/alla-produkter">Alla produkter</a><a href="/sv/page/vara-bastsaljare">Bästsäljare</a><a href="/sv/page/butik" data-hz8-about-link>Butik</a></div><div class="hz8-footer__col"><b>Kundservice</b><a href="/sv/page/kontakt">Kontakta oss</a><a href="/sv/page/faq">Vanliga frågor</a><a href="/sv/page/kop-och-leveransvillkor">Köp- &amp; leveransvillkor</a><a href="/sv/page/integritetspolicy">Integritets- &amp; cookiepolicy</a><a href="/sv/page/kontakt#aterforsaljare">Bli återförsäljare</a><a href="/sv/account">Mitt konto</a></div><div class="hz8-footer__col"><b>Populära kategorier</b><a href="/sv/categories/thca">THCA-B</a><a href="/sv/categories/alla-vapes">Vapes</a><a href="/sv/categories/blommor-buds">Buds</a><a href="/sv/categories/hasch">Hasch</a><a href="/sv/categories/h4cbd">CBD</a><a href="/sv/categories/magic-sauce">Magic Sauce</a></div><div class="hz8-footer__col"><b>Följ oss</b><a href="https://www.instagram.com/hazey.se/">Instagram</a></div><div class="hz8-footer__col hz8-footer__col--nl"><b>Kontakt</b><div class="hz8-footer__contact"><a href="mailto:Hej@hazey.se">Hej@hazey.se</a><a href="mailto:Butik@hazey.se">Butik@hazey.se (återförsäljare)</a></div></div></div><div class="hz8-footer__trustrow"><span>Säker betalning</span><span>Diskret frakt</span><span>Skickas från Sverige</span><span>18+ åldersgräns</span></div><div class="hz8-footer__disclaimer"><p>Du måste vara minst 18 år för att handla på Hazey.se. Våra produkter är avsedda för samlings- och prydnadsändamål. Förvaras oåtkomligt för barn. Vi uppmanar inte till användning eller konsumtion av produkterna.</p></div><div class="hz8-footer__bottom"><div class="hz8-footer__pay"><span>Trygg betalning</span><img src="https://www.hazey.se/wp-content/uploads/2023/04/Swish-Logo-Secondary-Light-BG.png" alt="Swish" loading="lazy"></div><span>© 2026 Hazey.se · Stockholm, Sweden · Alla rättigheter förbehållna.</span><span>Kvalitet idag. En grönare morgondag.</span></div></footer>';
  }
  window.HZ8.footerHTML = footerHTML;

  /* Nyhetsbrev (2026-09-30): kolumnen lovade "10% på ditt första köp"
     med anmälan via kontaktsidans mailto:-formulär -- det finns ingen
     registrering och ingen rabattkod som delas ut. Löftet är borttaget
     tills Nyehandels nyhetsbrevsformulär är aktiverat (theme8/blocks/
     INFO-PAGES.md); kolumnen visar i stället kontaktadresserna.

     Footerkorrigeringar (visuell QA 2026-09-28), gemensamma för alla sidor:
     - "Om oss" visas bara när en Om oss-sida faktiskt är publicerad
       (den finns inte i Nyehandel ännu) -- annars leder länken, med rätt
       namn, till Butik-sidan som den tidigare felaktigt kallade "Om oss".
     - Mobil: länkgrupperna blir fällbara (native <details>-beteende via
       knapp + aria-expanded); juridisk text och kontakt syns alltid. */
  function enhanceFooter(footer) {
    if (!footer || footer.getAttribute("data-hz8-enhanced")) return;
    footer.setAttribute("data-hz8-enhanced", "1");
    /* Nyehandels egen (dolda) footer listar alla publicerade sidor --
       finns en Om oss-sida där används den, utan extra nätverksanrop. */
    var about = footer.querySelector("[data-hz8-about-link]");
    var nativeAbout = Array.prototype.find.call(document.querySelectorAll("footer.page-footer .page-links a[href]"), function (a) {
      return /\/page\/om-(oss|hazey)\/?$/.test(a.getAttribute("href")) || /^om (oss|hazey)$/i.test(a.textContent.trim());
    });
    if (about && nativeAbout) { about.href = nativeAbout.getAttribute("href"); about.textContent = "Om oss"; }
    var mq = window.matchMedia("(max-width: 767px)");
    var cols = footer.querySelectorAll(".hz8-footer__col:not(.hz8-footer__col--nl)");
    Array.prototype.forEach.call(cols, function (col, i) {
      var head = col.querySelector("b");
      if (!head) return;
      var id = "hz8-footer-col-" + i;
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "hz8-footer__toggle";
      btn.textContent = head.textContent;
      btn.setAttribute("aria-controls", id);
      var panel = document.createElement("div");
      panel.className = "hz8-footer__links";
      panel.id = id;
      Array.prototype.slice.call(col.querySelectorAll("a")).forEach(function (a) { panel.appendChild(a); });
      head.replaceWith(btn);
      col.appendChild(panel);
      function sync() {
        var collapsible = mq.matches;
        btn.disabled = !collapsible;
        btn.setAttribute("aria-expanded", collapsible ? String(col.classList.contains("is-open")) : "true");
        panel.hidden = collapsible && !col.classList.contains("is-open");
      }
      btn.addEventListener("click", function () { col.classList.toggle("is-open"); sync(); });
      if (mq.addEventListener) mq.addEventListener("change", sync); else mq.addListener(sync);
      sync();
    });
  }
  window.HZ8.enhanceFooter = enhanceFooter;

  window.HZ8.register("homepage-social-footer", function (context) {
    if (!context.home) return;
    var wrapper = document.createElement("div");
    wrapper.innerHTML = '<section class="hz8-home__section hz8-reviews"><div class="hz8-home__head"><h2 class="hz8-reveal">Vad våra kunder säger</h2><span class="hz8-score"><b>4,7 av 5 på Trustpilot</b><span class="hz8-score__stars">★★★★★</span></span></div><div class="hz8-reviews__grid hz8-reveal-group">'
      + '<blockquote class="hz8-review">“Otroligt bra kvalitet och snabb leverans. Diskret och smidigt som alltid.”<div class="hz8-review__foot"><strong>★★★★★</strong><span class="hz8-review__score">4,6/5</span><span class="hz8-review__verified">Verifierad kund</span></div></blockquote>'
      + '<blockquote class="hz8-review hz8-review--feature">“Hazey levererar verkligen premiumprodukter. Allt känns genomtänkt och servicen håller hög klass.”<div class="hz8-review__foot"><strong>★★★★★</strong><span class="hz8-review__score">4,8/5</span><span class="hz8-review__verified">Verifierad kund</span></div></blockquote>'
      + '<blockquote class="hz8-review">“Bra sortiment, tydlig information och snabb kundsupport.”<div class="hz8-review__foot"><strong>★★★★★</strong><span class="hz8-review__score">4,6/5</span><span class="hz8-review__verified">Verifierad kund</span></div></blockquote>'
      + '</div></section>'
      + '<section class="hz8-home__section hz8-faq"><div class="hz8-faq__card"><h2>Har du fler frågor?<br>Vi hjälper dig gärna.</h2><p>Kontakta vår kundtjänst så får du snabbt och personligt svar.</p><a href="/sv/page/kontakt">Kontakta oss</a></div><div class="hz8-faq__list"><details open><summary>Hur lägger jag en beställning på er hemsida?</summary><p>Välj en produkt och följ stegen i varukorgen.</p></details><details><summary>Finns det ett minsta ordervärde?</summary></details><details><summary>Kan jag ändra eller avbryta min beställning?</summary></details><details><summary>Vilka betalningsmetoder accepterar ni?</summary></details><details><summary>Erbjuder ni rabatter eller lojalitetsprogram?</summary></details></div></section>'
      /* Footer kompletterad (2026-09-25) med innehåll som redan finns på
         Theme 6/livesajten (hämtat READ-ONLY från https://hazeyse.
         nyehandel.se/, inget ändrat där) -- ansvarstext, utökad
         Kundservice, ny "Populära kategorier"-kolumn (samma länkar som
         headerns egna kategorier, se 05-header.js CATEGORIES), kontakt-
         mejl, nyhetsbrevets erbjudandetext, trygghetsrad och Swish-
         betalningslogga. "Labbtestade produkter" (som FINNS på Theme 6:s
         trygghetsrad) är MEDVETET utelämnad -- uppdraget listade bara
         4 specifika trygghetspunkter, inte den femte, och ingen ny
         hälso-/effektrelaterad formulering ska läggas till utan
         uttryckligt godkännande. */;

    wrapper.innerHTML += footerHTML();
    while (wrapper.firstChild) context.home.appendChild(wrapper.firstChild);
    enhanceFooter(context.home.querySelector(".hz8-footer"));
  });

  /* Övriga sidtyper: samma footer före Nyehandels egen footer, som
     döljs visuellt (den finns kvar i DOM:en). Kassan kör inte Theme 8. */
  window.HZ8.register("global-footer", function (context) {
    if (context.home || context.page === "home" || document.querySelector(".hz8-footer")) return;
    var native = document.querySelector("footer.page-footer") || document.querySelector("#store-instance > footer, body > footer");
    var shell = document.createElement("div");
    shell.className = "hz8-footer-shell";
    shell.innerHTML = footerHTML();
    enhanceFooter(shell.querySelector(".hz8-footer"));
    if (native && native.parentNode) {
      native.parentNode.insertBefore(shell, native);
      native.classList.add("hz8-native-footer-hidden");
    } else {
      (document.getElementById("store-instance") || document.body).appendChild(shell);
    }
  });
})();
