
    /* ── FAQ accordion → inject FAQPage JSON-LD ──
       The accordion itself is native <details>; this only builds the
       structured-data <script> in <head> from the Q/A in [data-nh-faq]. */
    function initFaq() {
      var faq = document.querySelector("[data-nh-faq]");
      if (!faq || faq.__nhFaq || document.getElementById("nh-faq-jsonld")) return;
      faq.__nhFaq = true;
      var entities = [];
      faq.querySelectorAll(".nh-faq__item").forEach(function (it) {
        var q = it.querySelector("summary");
        var a = it.querySelector(".nh-faq__a");
        if (!q || !a) return;
        entities.push({
          "@type": "Question",
          name: q.textContent.trim(),
          acceptedAnswer: { "@type": "Answer", text: a.textContent.replace(/\s+/g, " ").trim() }
        });
      });
      if (!entities.length) return;
      var s = document.createElement("script");
      s.type = "application/ld+json";
      s.id = "nh-faq-jsonld";
      s.textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: entities });
      document.head.appendChild(s);
    }

    /* ── Trustpilot widget loader ──
       <div class="trustpilot-widget"> renderar inget utan Trustpilots
       bootstrap-script, och <script> i html-editor-block strips bort. Så vi
       laddar bootstrap EN gång här och renderar alla widget-divar (t.ex. i
       .nh-trust__tp). Byt data-template-id i blocket för carousel/citat. */
    function nhRenderTp() {
      if (!window.Trustpilot) return;
      document.querySelectorAll(".trustpilot-widget").forEach(function (el) {
        if (el.__nhTp) return;
        el.__nhTp = true;
        try { window.Trustpilot.loadFromElement(el, true); } catch (e) {}
      });
    }
    function initTrustpilot() {
      if (!document.querySelector(".trustpilot-widget")) return;
      if (window.Trustpilot) { nhRenderTp(); return; }
      if (window.__nhTpLoading) return;
      window.__nhTpLoading = true;
      var s = document.createElement("script");
      s.src = "https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";
      s.async = true;
      s.onload = nhRenderTp;
      document.head.appendChild(s);
    }

