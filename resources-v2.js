/* =========================================================
   LAOYU RESOURCES 2.0 — library page
   Renders goal categories, AI demos, the searchable/filterable
   resource library and solution paths from resources-data.js.
   Shareable links: #cat-solve, #type-demo, #level-beginner,
   #q-downtime, #path-solve (old #problem-* links still work).
   ========================================================= */
(function () {
  "use strict";
  var D = window.LAOYU_DATA;
  if (!D) return;
  function zh() { return document.documentElement.getAttribute("data-lang") === "zh"; }
  function L(a) { return a ? (zh() ? a[1] : a[0]) : ""; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function $(s) { return document.querySelector(s); }
  function byId(id) { return D.resources.filter(function (r) { return r.id === id; })[0]; }
  function T(en, cn) { return zh() ? cn : en; }
  function date(s) {
    var d = new Date(s + "T00:00:00");
    if (zh()) return d.getFullYear() + " 年 " + (d.getMonth() + 1) + " 月 " + d.getDate() + " 日";
    return d.getDate() + " " + ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()] + " " + d.getFullYear();
  }

  var state = { q: "", cat: "all", level: "all", type: "all", ai: false };
  var OLD = { downtime: ["cat", "solve"], output: ["cat", "perf"], quality: ["cat", "solve"], mistake: ["cat", "solve"], complaint: ["cat", "solve"], handover: ["q", "handover"], manpower: ["q", "manpower"], kpi: ["cat", "perf"], team: ["cat", "people"], talk: ["cat", "people"], skills: ["q", "skills"], decide: ["q", "decision"], escalate: ["q", "escalation"], chaos: ["cat", "time"], actions: ["q", "action"], ai: ["cat", "ai"] };

  document.addEventListener("DOMContentLoaded", function () {
    if (!$("#rlGrid")) return;
    var tools = D.resources.filter(function (r) { return r.type !== "demo"; }).length;
    var demos = D.resources.length - tools;

    /* ---------- goal tiles ---------- */
    function tiles() {
      $("#rlCats").innerHTML = Object.keys(D.cats).map(function (k) {
        var c = D.cats[k], n = D.resources.filter(function (r) { return r.cats.indexOf(k) > -1; }).length;
        return '<button type="button" class="goal' + (state.cat === k ? " on" : "") + '" data-cat="' + k + '"><i aria-hidden="true">' + c.icon + "</i><b>" + esc(L(c.t)) + "</b><span>" + esc(L(c.d)) + '</span><em>' + n + " " + T("resources", "个资源") + " →</em></button>";
      }).join("");
    }

    /* ---------- demo strip ---------- */
    function demosUI() {
      $("#rlDemos").innerHTML = D.resources.filter(function (r) { return r.type === "demo"; }).map(function (r) {
        return '<a class="demoCard" href="' + r.url + '"><div class="dcTop"><span class="bAi">' + T("SIMULATED AI", "模拟 AI") + '</span><span class="bFree">' + T("NO SIGN-UP", "无需注册") + "</span></div>" +
          "<h3>" + esc(L(r.title)) + "</h3><p>" + esc(L(r.problem)) + '</p><span class="btn orange">' + T("TRY DEMO →", "试用演示 →") + "</span></a>";
      }).join("");
    }

    /* ---------- filters ---------- */
    function segs() {
      var lv = [["all", ["All levels", "全部难度"]]].concat(Object.keys(D.levels).map(function (k) { return [k, D.levels[k]]; }));
      $("#rlLevel").innerHTML = lv.map(function (x) { return '<button type="button" data-level="' + x[0] + '" aria-pressed="' + (state.level === x[0]) + '">' + esc(L(x[1])) + "</button>"; }).join("");
      var ty = [["all", ["All types", "全部类型"]]].concat(Object.keys(D.types).map(function (k) { return [k, D.types[k]]; }));
      $("#rlType").innerHTML = ty.map(function (x) { return '<button type="button" data-type="' + x[0] + '" aria-pressed="' + (state.type === x[0]) + '">' + esc(L(x[1])) + "</button>"; }).join("");
      var ca = [["all", ["All categories", "全部分类"]]].concat(Object.keys(D.cats).map(function (k) { return [k, D.cats[k].t]; }));
      $("#rlCat").innerHTML = ca.map(function (x) { return '<button type="button" data-cat="' + x[0] + '" aria-pressed="' + (state.cat === x[0]) + '">' + esc(L(x[1])) + "</button>"; }).join("");
      $("#rlAi").setAttribute("aria-pressed", state.ai);
    }

    function match(r) {
      if (state.cat !== "all" && r.cats.indexOf(state.cat) < 0) return false;
      if (state.level !== "all" && r.level !== state.level) return false;
      if (state.type !== "all" && r.type !== state.type) return false;
      if (state.ai && !r.ai) return false;
      if (state.q) {
        var hay = [r.title, r.problem, r.desc].map(function (a) { return a.join(" "); }).join(" ").toLowerCase() + " " + r.id.replace(/-/g, " ");
        var words = state.q.toLowerCase().split(/\s+/).filter(Boolean);
        if (!words.every(function (w) { return hay.indexOf(w) > -1; })) return false;
      }
      return true;
    }

    /* ---------- cards ---------- */
    function card(r) {
      var cats = r.cats.map(function (k) { return esc(L(D.cats[k].t)); }).join(" · ");
      var fm = r.formats.map(function (f) { return "<li>" + esc(L(D.formats[f])) + "</li>"; }).join("");
      var demo = r.type === "demo" ? r : r.demo ? byId(r.demo) : null;
      var actions = (demo ? '<a class="btn ' + (r.type === "demo" ? "orange" : "outline") + '" href="' + demo.url + '">' + T("TRY DEMO", "试用演示") + "</a>" : "") +
        (r.type !== "demo" ? '<a class="btn orange" href="' + r.url + '">' + T("VIEW RESOURCE", "查看资源") + "</a>" : "");
      var shot = r.type === "demo" ? "assets/previews/" + r.id + "-" + (zh() ? "zh" : "en") + ".jpg" : "assets/previews/" + r.id + "-" + (zh() ? "zh" : "en") + ".jpg";
      return '<article class="rCard">' +
        '<a class="rShot" href="' + r.url + '" tabindex="-1" aria-hidden="true"><img src="' + shot + '" alt="" loading="lazy" width="680" height="427">' +
          '<span class="rType t-' + r.type + '">' + esc(L(D.types[r.type])) + "</span></a>" +
        '<div class="rBody">' +
          '<div class="rBadges"><span class="bFree">' + T("FREE", "免费") + "</span>" + (r.ai ? '<span class="bAi">' + (r.type === "demo" ? T("SIMULATED AI", "模拟 AI") : T("AI PROMPT INCLUDED", "含 AI 提示词")) + "</span>" : "") + '<span class="bLv lv-' + r.level + '">' + esc(L(D.levels[r.level])) + "</span></div>" +
          '<h3><a href="' + r.url + '">' + esc(L(r.title)) + "</a></h3>" +
          '<p class="rProb"><b>' + T("Solves:", "解决：") + "</b> " + esc(L(r.problem)) + "</p>" +
          '<p class="rDesc">' + esc(L(r.desc)) + "</p>" +
          '<dl class="rMeta">' +
            "<div><dt>" + T("Category", "分类") + "</dt><dd>" + cats + "</dd></div>" +
            "<div><dt>" + T("Setup time", "上手时间") + "</dt><dd>" + esc(L(r.setup)) + "</dd></div>" +
            "<div><dt>" + T("Software", "所需软件") + "</dt><dd>" + esc(L(r.software)) + "</dd></div>" +
            "<div><dt>" + T("Formats", "格式") + '</dt><dd><ul class="rFmt">' + fm + "</ul></dd></div>" +
          "</dl>" +
          '<div class="rFoot"><span class="rVer">v' + r.version + " · " + T("Updated ", "更新于 ") + date(r.updated) + '</span><div class="rAct">' + actions + "</div></div>" +
        "</div></article>";
    }
    function render(fromUser) {
      var list = D.resources.filter(match);
      $("#rlGrid").innerHTML = list.map(card).join("");
      $("#rlCount").innerHTML = "<b>" + list.length + "</b> " + T(list.length === 1 ? "resource" : "resources", "个资源");
      $("#rlEmpty").hidden = list.length > 0;
      var active = state.q || state.cat !== "all" || state.level !== "all" || state.type !== "all" || state.ai;
      $("#rlClear").hidden = !active;
      segs(); tiles();
      if (fromUser) {
        var h = state.cat !== "all" ? "cat-" + state.cat : state.type !== "all" ? "type-" + state.type : state.level !== "all" ? "level-" + state.level : "";
        try { history.replaceState(null, "", h ? "#" + h : location.pathname); } catch (e) {}
      }
    }

    /* ---------- paths ---------- */
    function paths() {
      $("#rlPaths").innerHTML = D.paths.map(function (p) {
        return '<article class="path" id="path-' + p.id + '"><header><i aria-hidden="true">' + p.icon + "</i><div><h3>" + esc(L(p.t)) + "</h3><p>" + esc(L(p.d)) + "</p></div></header><ol>" +
          p.steps.map(function (s, i) {
            var r = byId(s[0]);
            return '<li><a href="' + r.url + '"><span class="pN">' + (i + 1) + '</span><span class="pT"><b>' + esc(L(r.title)) + "</b><small>" + esc(zh() ? s[2] : s[1]) + '</small></span><span class="pTy t-' + r.type + '">' + esc(L(D.types[r.type])) + "</span></a></li>";
          }).join("") + "</ol></article>";
      }).join("");
    }

    /* ---------- events ---------- */
    var search = $("#rlSearch"), search2 = $("#rlSearch2");
    function setQ(v) { state.q = v.trim(); if (search.value !== v) search.value = v; if (search2.value !== v) search2.value = v; render(true); }
    search.addEventListener("input", function () { setQ(search.value); });
    search2.addEventListener("input", function () { setQ(search2.value); });
    $("#rlHeroForm").addEventListener("submit", function (e) { e.preventDefault(); document.getElementById("library").scrollIntoView({ behavior: "smooth" }); });
    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-cat],[data-level],[data-type],#rlAi,#rlClear,[data-q]");
      if (!b || !b.closest(".resLib2")) return;
      if (b.id === "rlAi") state.ai = !state.ai;
      else if (b.id === "rlClear") { state = { q: "", cat: "all", level: "all", type: "all", ai: false }; search.value = search2.value = ""; }
      else if (b.dataset.q) { setQ(b.dataset.q); document.getElementById("library").scrollIntoView({ behavior: "smooth" }); return; }
      else if (b.dataset.cat) { state.cat = b.classList.contains("goal") && state.cat === b.dataset.cat ? "all" : b.dataset.cat; if (b.classList.contains("goal")) setTimeout(function () { document.getElementById("library").scrollIntoView({ behavior: "smooth" }); }, 50); }
      else if (b.dataset.level) state.level = b.dataset.level;
      else if (b.dataset.type) state.type = b.dataset.type;
      render(true);
    });
    function fromHash() {
      var h = (location.hash || "").slice(1), m = h.match(/^(cat|type|level|q|problem|path)-(.+)$/);
      state = { q: "", cat: "all", level: "all", type: "all", ai: false };
      if (m) {
        var k = m[1], v = decodeURIComponent(m[2]);
        if (k === "problem" && OLD[v]) { k = OLD[v][0]; v = OLD[v][1]; }
        if (k === "q") state.q = v; else if (k !== "path") state[k] = v;
      }
      search.value = search2.value = state.q;
      render(false);
      if (m) setTimeout(function () { var t = document.getElementById(m[1] === "path" ? "path-" + m[2] : "library"); if (t) t.scrollIntoView({ behavior: "smooth" }); }, 300);
    }
    window.addEventListener("hashchange", fromHash);
    document.addEventListener("laoyu:lang", function () { demosUI(); paths(); render(false); });

    document.querySelectorAll("[data-n-tools]").forEach(function (el) { el.textContent = tools; });
    document.querySelectorAll("[data-n-demos]").forEach(function (el) { el.textContent = demos; });
    function ph() {
      search.placeholder = T("Search a tool or a problem, e.g. downtime, handover, OEE", "搜索工具或问题，如：停机、交接班、OEE");
      search2.placeholder = T("Search resources", "搜索资源");
      search.setAttribute("aria-label", T("Search resources", "搜索资源")); search2.setAttribute("aria-label", T("Search resources", "搜索资源"));
    }
    document.addEventListener("laoyu:lang", ph);
    ph(); demosUI(); paths(); fromHash();

    /* ---------- pass banner ---------- */
    try {
      var p = JSON.parse(localStorage.getItem("laoyuProfile") || "null");
      var pass = $("[data-pass]");
      if (p && p.email && pass) {
        pass.classList.add("on");
        var upd = function () {
          pass.querySelector("[data-pass-msg]").textContent = T("Welcome back, " + p.name + ". Your pass is active, so every tool opens instantly.", "欢迎回来，" + p.name + "。你的通行证已生效，每个工具都能直接打开。");
          pass.querySelector("[data-pass-state]").textContent = T("✓ PASS ACTIVE", "✓ 通行证已生效");
        };
        upd(); document.addEventListener("laoyu:lang", upd);
      }
    } catch (e) {}
  });
})();
