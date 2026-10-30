/* =========================================================
   LAOYU — Tool Finder (Resources page)
   Problem chips + role/type filters over the tool cards,
   shareable links (#problem-mistake, #type-template, #role-manager)
   and the "one sign-up unlocks all" pass banner.
   ========================================================= */
(function () {
  "use strict";
  function t(s) { return window.LAOYU_I18N ? window.LAOYU_I18N.t(s) : s; }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  document.addEventListener("DOMContentLoaded", function () {
    var grid = document.querySelector(".toolGrid");
    if (!grid) return;
    var cards = $$(".toolCard", grid);
    var state = { prob: null, role: "all", type: "all" };
    var countEl = document.querySelector("[data-count-shown]");
    var labelEl = document.querySelector("[data-count-label]");
    var clearBtn = document.querySelector("[data-clear]");
    var empty = document.querySelector(".fEmpty");

    function apply(fromUser) {
      var shown = 0;
      cards.forEach(function (c) {
        var ok = (!state.prob || (" " + c.dataset.probs + " ").indexOf(" " + state.prob + " ") > -1) &&
                 (state.role === "all" || (" " + c.dataset.roles + " ").indexOf(" " + state.role + " ") > -1) &&
                 (state.type === "all" || c.dataset.type === state.type);
        c.classList.toggle("out", !ok);
        c.classList.toggle("hit", ok && !!state.prob);
        if (ok) shown++;
      });
      if (countEl) countEl.textContent = shown;
      if (labelEl) { var k = shown === 1 ? "tool ready" : "tools ready"; labelEl.setAttribute("data-en", k); labelEl.textContent = t(k); }
      if (empty) empty.hidden = shown > 0;
      var active = state.prob || state.role !== "all" || state.type !== "all";
      if (clearBtn) clearBtn.hidden = !active;
      $$(".chip").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.prob === state.prob ? "true" : "false"); });
      $$("[data-role]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.role === state.role ? "true" : "false"); });
      $$("[data-type]").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.type === state.type ? "true" : "false"); });
      if (fromUser) {
        var h = state.prob ? "problem-" + state.prob : state.type !== "all" ? "type-" + state.type : state.role !== "all" ? "role-" + state.role : "";
        try { history.replaceState(null, "", h ? "#" + h : location.pathname); } catch (e) {}
      }
    }

    $$(".chip").forEach(function (b) {
      b.addEventListener("click", function () {
        state.prob = state.prob === b.dataset.prob ? null : b.dataset.prob;
        apply(true);
        if (state.prob && window.innerWidth < 760) grid.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    $$("[data-role]").forEach(function (b) { b.addEventListener("click", function () { state.role = b.dataset.role; apply(true); }); });
    $$("[data-type]").forEach(function (b) { b.addEventListener("click", function () { state.type = b.dataset.type; apply(true); }); });
    if (clearBtn) clearBtn.addEventListener("click", function () { state = { prob: null, role: "all", type: "all" }; apply(true); });

    function fromHash() {
      var m = (location.hash || "").match(/^#(problem|type|role)-([a-z]+)$/);
      state = { prob: null, role: "all", type: "all" };
      if (m) { if (m[1] === "problem") state.prob = m[2]; else state[m[1]] = m[2]; }
      apply(false);
      if (m) setTimeout(function () { document.getElementById("finder").scrollIntoView({ behavior: "smooth" }); }, 300);
    }
    window.addEventListener("hashchange", fromHash);
    fromHash();

    /* ---- Pass banner ---- */
    var pass = document.querySelector("[data-pass]");
    function profile() { try { return JSON.parse(localStorage.getItem("laoyuProfile") || "null"); } catch (e) { return null; } }
    function renderPass() {
      if (!pass) return;
      var p = profile();
      var msg = pass.querySelector("[data-pass-msg]"), st = pass.querySelector("[data-pass-state]");
      if (p && p.email) {
        pass.classList.add("on");
        msg.textContent = t("Welcome back, {name}. Your pass is active, so every tool opens instantly.").replace("{name}", p.name || "");
        st.textContent = t("✓ PASS ACTIVE");
      }
    }
    renderPass();
    document.addEventListener("laoyu:lang", function () {
      renderPass();
      if (labelEl && labelEl.getAttribute("data-en")) labelEl.textContent = t(labelEl.getAttribute("data-en"));
    });
  });
})();
