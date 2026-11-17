/* =========================================================
   LAOYUTALKS — Automation Lab 2.0 (automation.html)
   · Module overview, opportunity finder, featured workflows
   · Automation Library: keyword search + filters (category,
     difficulty, build type, area, tool), detail view per
     workflow with flow diagram, steps, code and example.
   Shareable links: #wf-sheets (a workflow), #cat-forms,
   #tool-appsheet (a filtered list). Data: workflows-data.js.
   Nothing is stored or sent: filters live in memory only.
   ========================================================= */
(function () {
  "use strict";
  var D = window.LAOYU_DATA;
  if (!D || !D.workflows) return;
  function zh() { return document.documentElement.getAttribute("data-lang") === "zh"; }
  function biPick(en, cn) { var I = window.LAOYU_I18N; return I && I.pick ? I.pick(en, cn) : (zh() ? cn : en); } /* EN+中: both, see i18n.js */
  function L(a) { return a ? biPick(a[0], a[1]) : ""; }
  function T(en, cn) { return biPick(en, cn); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function $(id) { return document.getElementById(id); }
  function wf(id) { return D.workflows.filter(function (w) { return w.id === id; })[0]; }
  function res(id) { return (D.resources || []).filter(function (r) { return r.id === id; })[0]; }

  var CATS = D.autoCats || {}, BUILDS = D.builds || {}, AREAS = D.areas || {};
  var LEVELS = ["beginner", "intermediate", "advanced"];
  var S = { q: "", cat: "all", level: "", build: "", area: "", tool: "", finder: "" };
  var openId = null;

  var ICON = {
    flow: '<path d="M3 5h6v5H3zM15 14h6v5h-6z"/><path d="M9 7.500h4a3 3 0 0 1 3 3V14"/>',
    report: '<path d="M4 20V4h16v16z"/><path d="M8 16v-4M12 16V8M16 16v-6"/>',
    chase: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    paper: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    approve: '<path d="m5 12 4 4 10-10"/><path d="M4 20h16"/>',
    doc: '<path d="M7 3h10v18H7z"/><path d="M10 7h4M10 11h4M10 15h2"/>',
    people: '<circle cx="9" cy="8" r="3.500"/><path d="M2.500 20c.600-3.600 3.200-5.500 6.500-5.500s5.900 1.900 6.500 5.500M16 4.500a3.500 3.500 0 0 1 0 7M18.500 15c1.700.900 2.700 2.600 3 5"/>'
  };

  /* Opportunity finder: a familiar task -> the workflows that fit it */
  var FINDER = [
    { id: "report", icon: "report", t: ["Writing the same report every day or week", "每天或每周写同样的报告"], ids: ["wf-production-report", "wf-mgmt-reporting", "wf-sheets-combine"] },
    { id: "chase", icon: "chase", t: ["Chasing people for updates and overdue actions", "催更新、追逾期行动"], ids: ["wf-sheets", "wf-due-alerts", "wf-meeting-actions"] },
    { id: "paper", icon: "paper", t: ["Copying data from paper into spreadsheets", "把纸上的数据抄进表格"], ids: ["wf-forms-checklist", "wf-downtime-qr", "wf-appsheet-6s"] },
    { id: "approve", icon: "approve", t: ["Waiting for requests and approvals", "等待申请和审批"], ids: ["wf-request-approval", "wf-appsheet"] },
    { id: "doc", icon: "doc", t: ["Writing documents, emails and records by hand", "手工写文档、邮件和记录"], ids: ["wf-doc-generation", "wf-ai-email", "wf-inbox-templates"] },
    { id: "people", icon: "people", t: ["Planning people, skills and shifts", "安排人员、技能和班次"], ids: ["wf-manpower", "wf-due-alerts"] }
  ];
  var FEATURED = ["wf-production-report", "wf-appsheet-6s", "wf-manpower"];

  var MODULES = [
    { k: "A", t: ["Automation Library", "自动化资源库"], d: ["Searchable workflows with steps, diagrams and code.", "可搜索的工作流程，含步骤、流程图和代码。"], href: "#library", live: true },
    { k: "B", t: ["Workflow Builder", "工作流程设计器"], d: ["Map your own process from input to output.", "从输入到输出，梳理你自己的流程。"], href: "#builder", live: true },
    { k: "C", t: ["ASK LAOYU – Automation Advisor", "问老鱼 – 自动化顾问"], d: ["Describe a task and get a suggested approach.", "描述一项任务，获得建议的自动化方案。"] },
    { k: "D", t: ["ROI Calculator", "投资回报计算器"], d: ["Estimate the hours an automation could save.", "估算自动化可节省的工时。"], href: "#roi", live: true },
    { k: "E", t: ["Case studies", "实践案例"], d: ["Manufacturing examples, step by step.", "制造业实例，逐步讲解。"] }
  ];

  /* ---------- small renderers ---------- */
  function lvl(w) { return '<span class="chip g">' + esc(L(D.levels[w.level])) + "</span>"; }
  function bld(w) { return BUILDS[w.build] ? '<span class="chip">' + esc(L(BUILDS[w.build])) + "</span>" : ""; }
  function catChip(w) { return CATS[w.cat] ? '<span class="chip cat">' + esc(L(CATS[w.cat])) + "</span>" : ""; }
  function flowHtml(w, cls) {
    if (!w.flow || !w.flow.length) return "";
    return '<ol class="flowH ' + (cls || "") + '" aria-label="' + esc(T("Workflow diagram", "流程图")) + '">' +
      w.flow.map(function (f) { return "<li>" + esc(L(f)) + "</li>"; }).join("") + "</ol>";
  }
  function card(w) {
    return '<a class="card wfCard" href="#' + w.id + '">' +
      '<span class="wfCardTop"><span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICON.flow + "</svg></span>" + catChip(w) + "</span>" +
      "<h3>" + esc(L(w.title)) + "</h3><p>" + esc(L(w.problem)) + "</p>" +
      '<span class="chips">' + lvl(w) + bld(w) + (w.time ? '<span class="chip">' + esc(L(w.time)) + "</span>" : "") + "</span>" +
      '<span class="go">' + T("View workflow →", "查看工作流程 →") + "</span></a>";
  }

  function renderModules() {
    $("modGrid").innerHTML = MODULES.map(function (m) {
      var inner = '<span class="modK">' + m.k + "</span><b>" + esc(L(m.t)) + "</b><span>" + esc(L(m.d)) + "</span>" +
        (m.live ? '<span class="chip g">' + T("Available", "已上线") + "</span>" : '<span class="chip">' + T("In development", "开发中") + "</span>");
      return m.live ? '<a class="modCard live" href="' + m.href + '">' + inner + "</a>" : '<div class="modCard">' + inner + "</div>";
    }).join("");
  }

  function renderFinder() {
    $("finderGrid").innerHTML = FINDER.map(function (f) {
      return '<button type="button" class="card tile finderTile" data-finder="' + f.id + '" aria-pressed="' + (S.finder === f.id) + '">' +
        '<span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[f.icon] + "</svg></span>" +
        "<div><b>" + esc(L(f.t)) + "</b><small>" + T(f.ids.length + " matching workflows", f.ids.length + " 个匹配的工作流程") + "</small></div></button>";
    }).join("");
  }

  function renderFeatured() {
    $("featGrid").innerHTML = FEATURED.map(wf).filter(Boolean).map(function (w) {
      return '<a class="card featCard" href="#' + w.id + '"><span class="chips">' + catChip(w) + lvl(w) + "</span>" +
        "<h3>" + esc(L(w.title)) + "</h3>" + flowHtml(w, "mini") + "<p>" + esc(L(w.solution)) + "</p>" +
        '<span class="go">' + T("View workflow →", "查看工作流程 →") + "</span></a>";
    }).join("");
  }

  /* ---------- library: filters ---------- */
  function sel(key, label, opts) {
    return '<label class="libSel"><span>' + esc(label) + '</span><select data-f="' + key + '">' +
      '<option value="">' + esc(T("All", "全部")) + "</option>" +
      opts.map(function (o) { return '<option value="' + o[0] + '"' + (S[key] === o[0] ? " selected" : "") + ">" + esc(L(o[1])) + "</option>"; }).join("") +
      "</select></label>";
  }
  function usedTools() {
    var u = [];
    D.workflows.forEach(function (w) { w.tools.forEach(function (t) { if (u.indexOf(t) < 0 && D.tools[t]) u.push(t); }); });
    return u;
  }
  function renderFilters() {
    var q = $("libQ");
    q.placeholder = T("Search workflows, e.g. downtime, approval, report", "搜索工作流程，例如：停机、审批、报告");
    q.setAttribute("aria-label", T("Search the Automation Library", "搜索自动化资源库"));
    $("libCats").setAttribute("aria-label", T("Filter by category", "按类别筛选"));
    $("libCats").innerHTML = [["all", [T("All categories", "全部类别"), T("All categories", "全部类别")]]]
      .concat(Object.keys(CATS).map(function (k) { return [k, CATS[k]]; }))
      .map(function (c) {
        var n = c[0] === "all" ? D.workflows.length : D.workflows.filter(function (w) { return w.cat === c[0]; }).length;
        return '<button type="button" class="labChip" data-cat="' + c[0] + '" aria-pressed="' + (S.cat === c[0]) + '">' + esc(L(c[1])) + ' <span class="n">' + n + "</span></button>";
      }).join("");
    $("libSelects").innerHTML =
      sel("level", T("Difficulty", "难度"), LEVELS.map(function (k) { return [k, D.levels[k]]; })) +
      sel("build", T("Build type", "实现方式"), Object.keys(BUILDS).map(function (k) { return [k, BUILDS[k]]; })) +
      sel("area", T("Used in", "适用领域"), Object.keys(AREAS).map(function (k) { return [k, AREAS[k]]; })) +
      sel("tool", T("Tool", "工具"), usedTools().map(function (k) { return [k, D.tools[k]]; }));
  }

  function norm(s) { return String(s || "").toLowerCase().replace(/\s+/g, " ").trim(); }
  function hay(w) {
    if (w.__hay) return w.__hay;
    var parts = [w.title, w.problem, w.solution, CATS[w.cat], BUILDS[w.build]];
    (w.flow || []).forEach(function (x) { parts.push(x); });
    (w.steps || []).forEach(function (x) { parts.push(x); });
    w.tools.forEach(function (t) { parts.push(D.tools[t]); });
    (w.aud || []).forEach(function (a) { parts.push(AREAS[a]); });
    w.__hay = norm(parts.filter(Boolean).map(function (p) { return p.join(" "); }).join(" "));
    return w.__hay;
  }
  function matches(w) {
    if (S.finder) {
      var f = FINDER.filter(function (x) { return x.id === S.finder; })[0];
      if (f && f.ids.indexOf(w.id) < 0) return false;
    }
    if (S.cat !== "all" && w.cat !== S.cat) return false;
    if (S.level && w.level !== S.level) return false;
    if (S.build && w.build !== S.build) return false;
    if (S.area && (w.aud || []).indexOf(S.area) < 0) return false;
    if (S.tool && w.tools.indexOf(S.tool) < 0) return false;
    if (S.q) {
      var h = hay(w);
      return norm(S.q).split(" ").every(function (word) { return h.indexOf(word) > -1; });
    }
    return true;
  }
  function anyFilter() { return !!(S.q || S.cat !== "all" || S.level || S.build || S.area || S.tool || S.finder); }

  function renderActive() {
    var out = [];
    if (S.finder) {
      var f = FINDER.filter(function (x) { return x.id === S.finder; })[0];
      if (f) out.push('<span class="actChip">' + T("Task: ", "任务：") + esc(L(f.t)) + ' <button type="button" data-clear="finder" aria-label="' + esc(T("Remove task filter", "移除任务筛选")) + '">✕</button></span>');
    }
    if (anyFilter()) out.push('<button type="button" class="tryLink" data-clear="all">' + T("Clear all filters", "清除全部筛选") + "</button>");
    $("libActive").innerHTML = out.join("");
  }

  function renderList() {
    var list = D.workflows.filter(matches);
    $("wfCount").textContent = T(list.length + (list.length === 1 ? " workflow" : " workflows") + (anyFilter() ? " match" : ""),
      (anyFilter() ? "匹配 " : "共 ") + list.length + " 个工作流程");
    $("wfGrid").innerHTML = list.map(card).join("");
    $("wfEmpty").hidden = list.length > 0;
    $("wfEmpty").innerHTML = "<p><b>" + T("No workflow matches these filters.", "没有符合这些筛选条件的工作流程。") + "</b></p><p>" +
      T("Try fewer words, or clear a filter.", "试试减少关键词，或清除部分筛选。") + '</p><button type="button" class="btn" data-clear="all">' + T("Clear all filters", "清除全部筛选") + "</button>";
    renderActive();
    [].forEach.call($("libCats").querySelectorAll("[data-cat]"), function (b) { b.setAttribute("aria-pressed", String(S.cat === b.dataset.cat)); });
    [].forEach.call($("libSelects").querySelectorAll("select"), function (s) { s.value = S[s.dataset.f] || ""; });
    [].forEach.call($("finderGrid").querySelectorAll("[data-finder]"), function (b) { b.setAttribute("aria-pressed", String(S.finder === b.dataset.finder)); });
  }

  /* ---------- detail ---------- */
  function section(title, body, cls) { return '<section class="wfPart' + (cls ? " " + cls : "") + '"><h2>' + esc(title) + "</h2>" + body + "</section>"; }
  function items(list, tag) { return "<" + tag + ">" + list.map(function (x) { return "<li>" + esc(L(x)) + "</li>"; }).join("") + "</" + tag + ">"; }
  function facts(w) {
    var row = function (k, v) { return "<div><dt>" + esc(k) + "</dt><dd>" + v + "</dd></div>"; };
    return '<dl class="wfFacts">' +
      row(T("Category", "类别"), esc(L(CATS[w.cat]))) +
      row(T("Difficulty", "难度"), esc(L(D.levels[w.level]))) +
      row(T("Build type", "实现方式"), esc(L(BUILDS[w.build]))) +
      row(T("Set-up time", "搭建时间"), esc(L(w.time)) + ' <small class="muted">' + T("(estimate)", "（估计）") + "</small>") +
      row(T("Tools required", "所需工具"), w.tools.map(function (t) { return esc(L(D.tools[t])); }).join(", ")) +
      row(T("Business application", "适用场景"), (w.aud || []).map(function (a) { return esc(L(AREAS[a])); }).join(", ")) +
      "</dl>";
  }
  function codeBlock(w) {
    if (!w.code) return "";
    return section(T("Template code", "模板代码"),
      '<p class="fine">' + T("Apps Script written for this workflow. Read it, set the values at the top and test it on a copy of your sheet first.",
        "为这个工作流程编写的 Apps Script。请先阅读，修改顶部的设置，并先在表格副本上测试。") + "</p>" +
      '<div class="wfEx"><div class="wfExTop"><span class="chip">' + esc(w.code.file) + '</span><span class="wfBtns">' +
      '<button type="button" class="ansCopy" data-copy="wfCode">' + T("Copy", "复制") + "</button>" +
      '<button type="button" class="ansCopy" data-download>' + T("Download .gs", "下载 .gs") + "</button></span></div>" +
      '<pre id="wfCode" class="code" tabindex="0" translate="no">' + esc(w.code.text) + "</pre></div>");
  }

  function renderDetail(w) {
    var idx = D.workflows.indexOf(w), prev = D.workflows[idx - 1], next = D.workflows[idx + 1];
    var rel = (w.related || []).map(res).filter(Boolean);
    $("wfDetail").innerHTML =
      '<a class="wfBack" href="#library" data-back>' + T("← Automation Library", "← 自动化资源库") + "</a>" +
      '<header class="wfHead"><span class="chips">' + catChip(w) + lvl(w) + bld(w) + '</span><h1 id="wfTitle" tabindex="-1">' + esc(L(w.title)) + "</h1></header>" +
      section(T("Workflow diagram", "流程图"), flowHtml(w)) +
      '<div class="wfBody">' +
        '<div class="wfMain">' +
          section(T("Problem", "问题"), "<p>" + esc(L(w.problem)) + "</p>") +
          section(T("Proposed automation", "自动化方案"), "<p>" + esc(L(w.solution)) + "</p>") +
          section(T("Step-by-step instructions", "实施步骤"), items(w.steps, "ol")) +
          codeBlock(w) +
          section(T("Example output", "示例结果"),
            '<div class="wfEx"><div class="wfExTop"><span class="chip a">' + T("Sample data", "示例数据") + '</span><button type="button" class="ansCopy" data-copy="wfExample">' + T("Copy", "复制") + "</button></div>" +
            '<pre id="wfExample" tabindex="0">' + esc(L(w.example)) + "</pre></div>") +
        "</div>" +
        '<aside class="wfSide">' +
          section(T("At a glance", "概览"), facts(w)) +
          section(T("Expected outcome", "预期效果"), items(w.benefits, "ul")) +
          (rel.length ? section(T("Related resources", "相关资源"), '<div class="wfRel">' + rel.map(function (r) {
            return '<a href="' + esc(r.url) + '"><b>' + esc(L(r.title)) + "</b><span>" + esc(L(r.problem)) + "</span></a>";
          }).join("") + "</div>") : "") +
        "</aside>" +
      "</div>" +
      '<nav class="wfPager" aria-label="' + esc(T("More workflows", "更多工作流程")) + '">' +
        (prev ? '<a href="#' + prev.id + '">← ' + esc(L(prev.title)) + "</a>" : "<span></span>") +
        (next ? '<a href="#' + next.id + '">' + esc(L(next.title)) + " →</a>" : "<span></span>") +
      "</nav>";
  }

  /* ---------- routing ---------- */
  function listHash() { return S.cat !== "all" ? "#cat-" + S.cat : S.tool ? "#tool-" + S.tool : "#library"; }
  function show(fromHash) {
    var h = (location.hash || "").slice(1), w = /^wf-/.test(h) ? wf(h) : null, m;
    if ((m = h.match(/^tool-(.+)$/)) && D.tools[m[1]]) { S.tool = m[1]; S.cat = "all"; }
    if ((m = h.match(/^cat-(.+)$/)) && CATS[m[1]]) { S.cat = m[1]; }
    openId = w ? w.id : null;
    $("wfList").hidden = !!w;
    $("wfDetail").hidden = !w;
    if (w) {
      renderDetail(w);
      document.title = L(w.title) + " | LAOYU";
      if (fromHash) { $("library").scrollIntoView(); var t = $("wfTitle"); if (t) t.focus({ preventScroll: true }); }
    } else {
      renderList();
      document.title = T("Automation Lab | LAOYU", "自动化实验室 | LAOYU 老鱼");
      if (fromHash && /^(tool|cat)-/.test(h)) $("library").scrollIntoView();
    }
  }
  function renderAll() { renderModules(); renderFinder(); renderFeatured(); renderFilters(); show(false); }
  function toList(scroll) {
    try { history.replaceState(null, "", listHash()); } catch (er) {}
    if (openId) show(false); else renderList();
    if (scroll) $("library").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------- copy / download ---------- */
  function textOf(id) {
    var el = $(id), z = el.querySelector(".biZh"), all = el.textContent;
    /* EN+中 shows both; copy only the visitor's language */
    return z ? (zh() ? z.textContent : all.slice(0, all.length - z.textContent.length)) : all;
  }
  function copy(btn, id) {
    var label = btn.textContent;
    var ok = function () { btn.textContent = T("Copied ✓", "已复制 ✓"); setTimeout(function () { btn.textContent = label; }, 1800); };
    var manual = function () {
      var sel = window.getSelection && window.getSelection();
      if (sel) { var r = document.createRange(); r.selectNodeContents($(id)); sel.removeAllRanges(); sel.addRange(r); }
      btn.textContent = T("Selected: press Ctrl+C", "已选中：按 Ctrl+C 复制");
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(textOf(id)).then(ok, manual); else manual();
  }
  function download(w) {
    try {
      var url = URL.createObjectURL(new Blob([w.code.text], { type: "text/plain;charset=utf-8" }));
      var a = document.createElement("a");
      a.href = url; a.download = w.code.file;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    } catch (e) { var b = document.querySelector("[data-copy='wfCode']"); if (b) copy(b, "wfCode"); }
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!$("wfGrid")) return;
    var timer;
    $("libQ").addEventListener("input", function (e) {
      clearTimeout(timer);
      var v = e.target.value.slice(0, 80);
      timer = setTimeout(function () { S.q = v.trim(); toList(false); }, 150);
    });
    $("libQ").addEventListener("keydown", function (e) { if (e.key === "Enter") e.preventDefault(); });
    document.addEventListener("change", function (e) {
      var s = e.target.closest("select[data-f]");
      if (s) { S[s.dataset.f] = s.value; toList(false); }
    });
    document.addEventListener("click", function (e) {
      var t;
      if ((t = e.target.closest("[data-cat]")) && t.closest("main")) { S.cat = t.dataset.cat; toList(false); return; }
      if ((t = e.target.closest("[data-finder]"))) {
        S.finder = S.finder === t.dataset.finder ? "" : t.dataset.finder;
        renderFinder(); toList(!!S.finder); return;
      }
      if ((t = e.target.closest("[data-clear]"))) {
        if (t.dataset.clear === "finder") S.finder = "";
        else { S.q = ""; S.cat = "all"; S.level = ""; S.build = ""; S.area = ""; S.tool = ""; S.finder = ""; $("libQ").value = ""; }
        toList(false); $("libQ").focus(); return;
      }
      if ((t = e.target.closest("[data-copy]")) && $(t.dataset.copy)) { copy(t, t.dataset.copy); return; }
      if (e.target.closest("[data-download]") && openId) { download(wf(openId)); return; }
      if (e.target.closest("[data-back]")) {
        e.preventDefault();
        var back = openId;
        try { history.pushState(null, "", listHash()); } catch (er) {}
        show(false);
        var c = back && document.querySelector('#wfGrid a[href="#' + back + '"]');
        if (c) c.focus(); else $("library").scrollIntoView();
      }
    });
    window.addEventListener("hashchange", function () { show(true); });
    window.addEventListener("popstate", function () { show(true); });
    document.addEventListener("laoyu:lang", renderAll);
    renderAll();
    if (/^#(wf|tool|cat)-/.test(location.hash)) show(true);
  });
})();
