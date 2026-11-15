/* =========================================================
   LAOYU RESOURCES 3.0 — library page
   Renders category tiles, AI demos, the searchable library with
   six filters, the preview panel and solution paths, all from
   resources-data.js.
   Shareable links: #c-quality (category), #type-demo,
   #level-beginner, #access-open, #lang-zh, #q-downtime,
   #path-solve. Older #cat-solve and #problem-* links still work.
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

  /* c3 = library category, goal = older goal links (#cat-…) from the homepage and footer */
  function blank() { return { q: "", c3: "all", goal: "all", level: "all", type: "all", lang: "all", access: "all", ai: false }; }
  var state = blank();
  var OLD = { downtime: ["cat", "solve"], output: ["cat", "perf"], quality: ["cat", "solve"], mistake: ["cat", "solve"], complaint: ["cat", "solve"], handover: ["q", "handover"], manpower: ["q", "manpower"], kpi: ["cat", "perf"], team: ["cat", "people"], talk: ["cat", "people"], skills: ["q", "skills"], decide: ["q", "decision"], escalate: ["q", "escalation"], chaos: ["cat", "time"], actions: ["q", "action"], ai: ["cat", "ai"] };
  /* which state key each link prefix sets, and the values it accepts */
  var KEYS = {
    c: ["c3", function () { return Object.keys(D.cats3); }], cat: ["goal", function () { return Object.keys(D.cats); }],
    type: ["type", function () { return Object.keys(D.types); }], level: ["level", function () { return Object.keys(D.levels); }],
    lang: ["lang", function () { return Object.keys(D.langs); }], access: ["access", function () { return Object.keys(D.access); }]
  };

  document.addEventListener("DOMContentLoaded", function () {
    if (!$("#rlGrid")) return;
    var demos = D.resources.filter(function (r) { return r.type === "demo"; }).length;
    var open = D.resources.filter(function (r) { return !r.gated; }).length;
    function count(k) { return D.resources.filter(function (r) { return r.cat3 === k; }).length; }

    /* ---------- category tiles ---------- */
    function tiles() {
      $("#rlCats").innerHTML = Object.keys(D.cats3).map(function (k) {
        var c = D.cats3[k], n = count(k);
        var ico = '<i aria-hidden="true"><svg viewBox="0 0 24 24">' + c.ico + "</svg></i>";
        if (!n) return '<div class="goal off" aria-disabled="true">' + ico + "<b>" + esc(L(c.t)) + "</b><span>" + esc(L(c.d)) + "</span><em>" + T("Coming soon", "即将推出") + "</em></div>";
        return '<button type="button" class="goal' + (state.c3 === k ? " on" : "") + '" data-c3="' + k + '" data-jump aria-pressed="' + (state.c3 === k) + '">' + ico + "<b>" + esc(L(c.t)) + "</b><span>" + esc(L(c.d)) + "</span><em>" + n + " " + T(n === 1 ? "resource" : "resources", "个资源") + " →</em></button>";
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
    function seg(host, attr, key, all, opts) {
      var rows = [["all", all]].concat(opts);
      $(host).innerHTML = rows.map(function (x) { return '<button type="button" data-' + attr + '="' + x[0] + '" aria-pressed="' + (state[key] === x[0]) + '">' + esc(L(x[1])) + "</button>"; }).join("");
    }
    function segs() {
      seg("#rlCat", "c3", "c3", ["All categories", "全部分类"], Object.keys(D.cats3).filter(count).map(function (k) { return [k, D.cats3[k].t]; }));
      seg("#rlType", "type", "type", ["All types", "全部类型"], Object.keys(D.types).map(function (k) { return [k, D.types[k]]; }));
      seg("#rlLevel", "level", "level", ["All levels", "全部难度"], Object.keys(D.levels).map(function (k) { return [k, D.levels[k]]; }));
      seg("#rlLang", "lang", "lang", ["All languages", "全部语言"], Object.keys(D.langs).map(function (k) { return [k, D.langs[k]]; }));
      seg("#rlAccess", "access", "access", ["All", "全部"], Object.keys(D.access).map(function (k) { return [k, D.access[k]]; }));
      $("#rlAi").setAttribute("aria-pressed", state.ai);
    }

    function match(r) {
      if (state.c3 !== "all" && r.cat3 !== state.c3) return false;
      if (state.goal !== "all" && r.cats.indexOf(state.goal) < 0) return false;
      if (state.level !== "all" && r.level !== state.level) return false;
      if (state.type !== "all" && r.type !== state.type) return false;
      if (state.lang !== "all" && r.lang.indexOf(state.lang) < 0) return false;
      if (state.access !== "all" && r.access !== state.access) return false;
      if (state.ai && !r.ai) return false;
      if (state.q) {
        var hay = [r.title, r.problem, r.desc, D.cats3[r.cat3].t, D.types[r.type]].map(function (a) { return a.join(" "); }).join(" ").toLowerCase() + " " + r.id.replace(/-/g, " ");
        var words = state.q.toLowerCase().split(/\s+/).filter(Boolean);
        if (!words.every(function (w) { return hay.indexOf(w) > -1; })) return false;
      }
      return true;
    }

    /* ---------- shared bits ---------- */
    function shot(r) { return "assets/previews/" + r.id + "-" + (zh() ? "zh" : "en") + ".jpg"; }
    function langs(r) { return r.lang.map(function (k) { return k === "en" ? "EN" : "中文"; }).join(" · "); }
    function aiBadge(r) { return r.ai ? '<span class="bAi">' + (r.type === "demo" || r.sim ? T("SIMULATED AI", "模拟 AI") : T("AI PROMPT INCLUDED", "含 AI 提示词")) + "</span>" : ""; }
    function badges(r) {
      return '<span class="bFree">' + esc(L(D.access[r.access])) + "</span>" + aiBadge(r) +
        '<span class="bLv lv-' + r.level + '">' + esc(L(D.levels[r.level])) + '</span><span class="bLv">' + langs(r) + "</span>";
    }
    function openLabel(r) { return r.type === "demo" ? T("TRY DEMO", "试用演示") : r.type === "aitool" ? T("OPEN TOOL", "打开工具") : T("VIEW RESOURCE", "查看资源"); }

    /* ---------- cards ---------- */
    function card(r) {
      var fm = r.formats.map(function (f) { return "<li>" + esc(L(D.formats[f])) + "</li>"; }).join("");
      var top = r.noShot
        ? '<a class="rShot rNoShot" href="' + r.url + '" tabindex="-1" aria-hidden="true"><svg viewBox="0 0 24 24">' + D.cats3[r.cat3].ico + '</svg><span class="rType t-' + r.type + '">' + esc(L(D.types[r.type])) + "</span></a>"
        : '<a class="rShot" href="' + r.url + '" tabindex="-1" aria-hidden="true"><img src="' + shot(r) + '" alt="" loading="lazy" width="680" height="427"><span class="rType t-' + r.type + '">' + esc(L(D.types[r.type])) + "</span></a>";
      return '<article class="rCard">' + top +
        '<div class="rBody">' +
          '<div class="rBadges">' + badges(r) + "</div>" +
          '<h3><a href="' + r.url + '">' + esc(L(r.title)) + "</a></h3>" +
          '<p class="rProb"><b>' + T("Solves:", "解决：") + "</b> " + esc(L(r.problem)) + "</p>" +
          '<p class="rDesc">' + esc(L(r.desc)) + "</p>" +
          '<dl class="rMeta">' +
            "<div><dt>" + T("Category", "分类") + "</dt><dd>" + esc(L(D.cats3[r.cat3].t)) + "</dd></div>" +
            "<div><dt>" + T("Setup time", "上手时间") + "</dt><dd>" + esc(L(r.setup)) + "</dd></div>" +
            "<div><dt>" + T("Software", "所需软件") + "</dt><dd>" + esc(L(r.software)) + "</dd></div>" +
            "<div><dt>" + T("Formats", "格式") + '</dt><dd><ul class="rFmt">' + fm + "</ul></dd></div>" +
          "</dl>" +
          '<div class="rFoot"><span class="rVer">v' + r.version + " · " + T("Updated ", "更新于 ") + date(r.updated) + '</span><div class="rAct">' +
            '<button type="button" class="btn outline" data-prev="' + r.id + '" aria-haspopup="dialog">' + T("PREVIEW", "预览") + "</button>" +
            '<a class="btn orange" href="' + r.url + '">' + openLabel(r) + "</a></div></div>" +
        "</div></article>";
    }

    function active() { return !!(state.q || state.ai || ["c3", "goal", "level", "type", "lang", "access"].some(function (k) { return state[k] !== "all"; })); }

    function render(fromUser) {
      var list = D.resources.filter(match);
      $("#rlGrid").innerHTML = list.map(card).join("");
      var goal = state.goal !== "all" && D.cats[state.goal]
        ? ' <button type="button" class="fGoal" data-goal-clear>' + esc(L(D.cats[state.goal].t)) + ' <span aria-hidden="true">✕</span><span class="sr"> ' + T("remove this filter", "移除此筛选") + "</span></button>" : "";
      $("#rlCount").innerHTML = "<b>" + list.length + "</b> " + T(list.length === 1 ? "resource" : "resources", "个资源") + goal;
      $("#rlEmpty").hidden = list.length > 0;
      $("#rlClear").hidden = !active();
      $("#rlClear").textContent = T("✕ Clear filters", "✕ 清除筛选");
      segs(); tiles();
      if (fromUser) {
        var h = state.c3 !== "all" ? "c-" + state.c3 : state.goal !== "all" ? "cat-" + state.goal : state.type !== "all" ? "type-" + state.type
          : state.level !== "all" ? "level-" + state.level : state.access !== "all" ? "access-" + state.access : state.lang !== "all" ? "lang-" + state.lang : "";
        try { history.replaceState(null, "", h ? "#" + h : location.pathname); } catch (e) {}
      }
    }

    /* ---------- preview before opening ---------- */
    var dlg = $("#rlPrev"), lastTrigger = null, shown = null;
    function previewHTML(r) {
      var demo = r.demo ? byId(r.demo) : null;
      var inc = r.kit && r.kit.inc ? "<h3>" + T("What you get", "包含内容") + "</h3><ul class=\"pvInc\">" + r.kit.inc.map(function (x) { return "<li>" + esc(L(x)) + "</li>"; }).join("") + "</ul>" : "";
      var who = r.kit && r.kit.who ? '<p class="pvWho"><b>' + T("For:", "适合：") + "</b> " + esc(L(r.kit.who)) + "</p>" : "";
      var lim = r.sim || r.type === "demo" ? '<p class="pvNote">' + T("Simulated AI: fixed rules in your browser, not a live AI. Nothing you type is sent anywhere.", "模拟 AI：在你的浏览器中按固定规则运行，不是真正的 AI。你输入的内容不会被发送到任何地方。") + "</p>" : "";
      var gate = r.gated ? '<p class="pvNote">' + T("Opens after a free one-time sign-up with your name and email.", "只需用姓名和邮箱免费注册一次即可打开。") + "</p>" : "";
      var rel = r.related.map(byId).filter(Boolean);
      return '<div class="pvHead"><div><div class="rBadges"><span class="bLv">' + esc(L(D.types[r.type])) + "</span>" + badges(r) + "</div>" +
          '<h2 id="rlPrevTitle" tabindex="-1">' + esc(L(r.title)) + "</h2></div>" +
          '<button type="button" class="pvClose" data-prev-close aria-label="' + T("Close preview", "关闭预览") + '">✕</button></div>' +
        '<div class="pvBody">' +
          (r.noShot ? "" : '<img class="pvShot" src="' + shot(r) + '" alt="' + esc(T("Screenshot of " + r.title[0], r.title[1] + " 的截图")) + '" width="680" height="427">') +
          '<p class="rProb"><b>' + T("Solves:", "解决：") + "</b> " + esc(L(r.problem)) + "</p>" +
          "<p>" + esc(L(r.desc)) + "</p>" + who + inc +
          '<dl class="rMeta">' +
            "<div><dt>" + T("Category", "分类") + "</dt><dd>" + esc(L(D.cats3[r.cat3].t)) + "</dd></div>" +
            "<div><dt>" + T("Difficulty", "难度") + "</dt><dd>" + esc(L(D.levels[r.level])) + "</dd></div>" +
            "<div><dt>" + T("Language", "语言") + "</dt><dd>" + r.lang.map(function (k) { return esc(L(D.langs[k])); }).join(" · ") + "</dd></div>" +
            "<div><dt>" + T("Access", "获取方式") + "</dt><dd>" + esc(L(D.access[r.access])) + "</dd></div>" +
            "<div><dt>" + T("Setup time", "上手时间") + "</dt><dd>" + esc(L(r.setup)) + "</dd></div>" +
            "<div><dt>" + T("Formats", "格式") + "</dt><dd>" + r.formats.map(function (f) { return esc(L(D.formats[f])); }).join(" · ") + "</dd></div>" +
            "<div><dt>" + T("Last updated", "最近更新") + "</dt><dd>" + date(r.updated) + " · v" + r.version + "</dd></div>" +
          "</dl>" + lim + gate +
          (rel.length ? "<h3>" + T("Related resources", "相关资源") + '</h3><div class="pvRel">' + rel.map(function (x) {
            return '<button type="button" data-prev="' + x.id + '"><b>' + esc(L(x.title)) + "</b><span>" + esc(L(x.problem)) + "</span></button>";
          }).join("") + "</div>" : "") +
        "</div>" +
        '<div class="pvFoot">' + (demo ? '<a class="btn outline" href="' + demo.url + '">' + T("TRY DEMO", "试用演示") + "</a>" : "") +
          '<a class="btn orange" href="' + r.url + '">' + openLabel(r) + " →</a></div>";
    }
    function preview(id, trigger) {
      var r = byId(id);
      if (!r) return;
      if (!dlg || !dlg.showModal) { location.href = r.url; return; } /* very old browser: go straight to the page */
      if (trigger && !dlg.contains(trigger)) lastTrigger = trigger;
      shown = id;
      dlg.innerHTML = previewHTML(r);
      if (!dlg.open) dlg.showModal();
      dlg.scrollTop = 0;
      var body = dlg.querySelector(".pvBody"); if (body) body.scrollTop = 0;
      var h = dlg.querySelector("#rlPrevTitle"); if (h) h.focus();
    }
    if (dlg) {
      dlg.addEventListener("click", function (e) {
        if (e.target === dlg || e.target.closest("[data-prev-close]")) dlg.close(); /* backdrop or ✕ */
      });
      dlg.addEventListener("close", function () {
        shown = null;
        /* the card was re-drawn if the language changed, so find it again */
        var t = lastTrigger && document.contains(lastTrigger) ? lastTrigger : null;
        if (t) t.focus();
      });
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
    function toLibrary() { var t = document.getElementById("library"); if (t) t.scrollIntoView(); }
    function setQ(v) { state.q = v.trim(); if (search.value !== v) search.value = v; if (search2.value !== v) search2.value = v; render(true); }
    search.addEventListener("input", function () { setQ(search.value); });
    search2.addEventListener("input", function () { setQ(search2.value); });
    $("#rlHeroForm").addEventListener("submit", function (e) { e.preventDefault(); toLibrary(); });
    document.addEventListener("click", function (e) {
      var pv = e.target.closest("[data-prev]");
      if (pv) { preview(pv.getAttribute("data-prev"), pv); return; }
      var b = e.target.closest("[data-c3],[data-level],[data-type],[data-lang],[data-access],[data-goal-clear],#rlAi,#rlClear,[data-q]");
      if (!b || !b.closest(".resLib2")) return;
      var d = b.dataset;
      if (b.id === "rlAi") state.ai = !state.ai;
      else if (b.id === "rlClear") { state = blank(); search.value = search2.value = ""; }
      else if ("goalClear" in d) state.goal = "all";
      else if (d.q) { setQ(d.q); toLibrary(); return; }
      else if (d.c3) { state.c3 = "jump" in d && state.c3 === d.c3 ? "all" : d.c3; if ("jump" in d) setTimeout(toLibrary, 50); }
      else if (d.level) state.level = d.level;
      else if (d.type) state.type = d.type;
      else if (d.lang) state.lang = d.lang;
      else if (d.access) state.access = d.access;
      render(true);
    });
    function fromHash() {
      var h = (location.hash || "").slice(1), m = h.match(/^(c|cat|type|level|lang|access|q|problem|path)-(.+)$/);
      state = blank();
      if (m) {
        var k = m[1], v;
        try { v = decodeURIComponent(m[2]); } catch (e) { v = m[2]; }
        if (k === "problem") { if (OLD[v]) { k = OLD[v][0]; v = OLD[v][1]; } else k = ""; }
        if (k === "q") state.q = v.slice(0, 80);
        else if (KEYS[k] && KEYS[k][1]().indexOf(v) > -1) state[KEYS[k][0]] = v; /* unknown values are ignored: show everything */
      }
      search.value = search2.value = state.q;
      render(false);
      if (m) setTimeout(function () { var t = document.getElementById(m[1] === "path" ? "path-" + m[2] : "library"); if (t) t.scrollIntoView(); }, 300);
    }
    window.addEventListener("hashchange", fromHash);
    document.addEventListener("laoyu:lang", function () { demosUI(); paths(); render(false); if (shown && dlg && dlg.open) preview(shown); });

    document.querySelectorAll("[data-n-all]").forEach(function (el) { el.textContent = D.resources.length; });
    document.querySelectorAll("[data-n-open]").forEach(function (el) { el.textContent = open; });
    document.querySelectorAll("[data-n-gated]").forEach(function (el) { el.textContent = D.resources.length - open; });
    document.querySelectorAll("[data-n-demos]").forEach(function (el) { el.textContent = demos; });
    document.querySelectorAll("[data-n-cats]").forEach(function (el) { el.textContent = Object.keys(D.cats3).filter(count).length; });
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
