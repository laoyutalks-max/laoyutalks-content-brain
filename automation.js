/* =========================================================
   LAOYUTALKS 3.0 — Automation Lab page
   List of workflows (filter by tool) and a detail view per
   workflow. Shareable links: automation.html#wf-sheets,
   automation.html#tool-appsheet. Data: workflows-data.js.
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
  function res(id) { return D.resources.filter(function (r) { return r.id === id; })[0]; }

  var tool = "all", openId = null;
  var ICON = '<path d="M3 5h6v5H3zM15 14h6v5h-6z"/><path d="M9 7.500h4a3 3 0 0 1 3 3V14"/>';

  function chips(w) { return w.tools.map(function (t) { return '<span class="chip">' + esc(L(D.tools[t])) + "</span>"; }).join(""); }
  function level(w) { return '<span class="chip g">' + esc(L(D.levels[w.level])) + "</span>"; }

  function renderList() {
    var used = [];
    D.workflows.forEach(function (w) { w.tools.forEach(function (t) { if (used.indexOf(t) < 0) used.push(t); }); });
    $("wfFilter").innerHTML = [["all", [T("All tools", "全部工具"), T("All tools", "全部工具")]]].concat(used.map(function (t) { return [t, D.tools[t]]; }))
      .map(function (x) { return '<button type="button" class="labChip" data-tool="' + x[0] + '" aria-pressed="' + (tool === x[0]) + '">' + esc(L(x[1])) + "</button>"; }).join("");
    var list = D.workflows.filter(function (w) { return tool === "all" || w.tools.indexOf(tool) > -1; });
    $("wfCount").textContent = T(list.length + (list.length === 1 ? " workflow" : " workflows"), list.length + " 个工作流程");
    $("wfGrid").innerHTML = list.map(function (w) {
      return '<a class="card wfCard" href="#' + w.id + '"><span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICON + "</svg></span>" +
        "<h3>" + esc(L(w.title)) + "</h3><p>" + esc(L(w.problem)) + '</p><span class="chips">' + level(w) + chips(w) + '</span><span class="go">' + T("View workflow →", "查看工作流程 →") + "</span></a>";
    }).join("");
    $("wfEmpty").hidden = list.length > 0;
    $("wfEmpty").innerHTML = "<p>" + T("No workflow uses that tool yet.", "还没有使用该工具的工作流程。") + '</p><button type="button" class="btn" data-tool="all">' + T("Show all workflows", "显示全部工作流程") + "</button>";
  }

  function section(title, body) { return '<section class="wfPart"><h2>' + esc(title) + "</h2>" + body + "</section>"; }
  function items(list, tag) { return "<" + tag + ">" + list.map(function (x) { return "<li>" + esc(L(x)) + "</li>"; }).join("") + "</" + tag + ">"; }

  function renderDetail(w) {
    var idx = D.workflows.indexOf(w), prev = D.workflows[idx - 1], next = D.workflows[idx + 1];
    var rel = w.related.map(res).filter(Boolean);
    $("wfDetail").innerHTML =
      '<a class="wfBack" href="#workflows" data-back>' + T("← All workflows", "← 全部工作流程") + "</a>" +
      '<header class="wfHead"><span class="chips">' + level(w) + chips(w) + '</span><h1 id="wfTitle" tabindex="-1">' + esc(L(w.title)) + "</h1></header>" +
      '<div class="wfBody">' +
        '<div class="wfMain">' +
          section(T("Problem", "问题"), "<p>" + esc(L(w.problem)) + "</p>") +
          section(T("Proposed solution", "解决方案"), "<p>" + esc(L(w.solution)) + "</p>") +
          section(T("Implementation steps", "实施步骤"), items(w.steps, "ol")) +
          section(T("Example output", "示例结果"),
            '<div class="wfEx"><div class="wfExTop"><span class="chip a">' + T("Sample data", "示例数据") + '</span><button type="button" class="ansCopy" data-copy>' + T("Copy", "复制") + "</button></div>" +
            '<pre id="wfExample" tabindex="0">' + esc(L(w.example)) + "</pre></div>") +
        "</div>" +
        '<aside class="wfSide">' +
          section(T("Tools required", "所需工具"), "<ul>" + w.tools.map(function (t) { return "<li>" + esc(L(D.tools[t])) + "</li>"; }).join("") + "</ul>") +
          section(T("Expected benefits", "预期收益"), items(w.benefits, "ul")) +
          (rel.length ? section(T("Related resources", "相关资源"), '<div class="wfRel">' + rel.map(function (r) {
            return '<a href="' + r.url + '"><b>' + esc(L(r.title)) + "</b><span>" + esc(L(r.problem)) + "</span></a>";
          }).join("") + "</div>") : "") +
        "</aside>" +
      "</div>" +
      '<nav class="wfPager" aria-label="' + T("More workflows", "更多工作流程") + '">' +
        (prev ? '<a href="#' + prev.id + '">← ' + esc(L(prev.title)) + "</a>" : "<span></span>") +
        (next ? '<a href="#' + next.id + '">' + esc(L(next.title)) + " →</a>" : "<span></span>") +
      "</nav>";
  }

  function show(fromHash) {
    var h = (location.hash || "").slice(1), w = /^wf-/.test(h) ? wf(h) : null;
    var m = h.match(/^tool-(.+)$/);
    if (m && D.tools[m[1]]) tool = m[1];
    openId = w ? w.id : null;
    $("wfList").hidden = !!w;
    $("wfDetail").hidden = !w;
    if (w) {
      renderDetail(w);
      document.title = L(w.title) + " | LAOYU";
      if (fromHash) { $("workflows").scrollIntoView(); var t = $("wfTitle"); if (t) t.focus({ preventScroll: true }); }
    } else {
      renderList();
      document.title = T("Automation Lab | LAOYU", "自动化实验室 | LAOYU 老鱼");
    }
  }

  function copy(btn) {
    var el = $("wfExample"), z = el.querySelector(".biZh"), all = el.textContent;
    /* EN+中 shows both; copy only the visitor's language */
    var text = z ? (zh() ? z.textContent : all.slice(0, all.length - z.textContent.length)) : all;
    var ok = function () { btn.textContent = T("Copied ✓", "已复制 ✓"); setTimeout(function () { btn.textContent = T("Copy", "复制"); }, 1800); };
    var manual = function () {
      var sel = window.getSelection && window.getSelection();
      if (sel) { var r = document.createRange(); r.selectNodeContents($("wfExample")); sel.removeAllRanges(); sel.addRange(r); }
      btn.textContent = T("Selected: press Ctrl+C", "已选中：按 Ctrl+C 复制");
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, manual); else manual();
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!$("wfGrid")) return;
    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-tool]");
      if (t && t.closest("main")) {
        tool = t.dataset.tool; renderList();
        try { history.replaceState(null, "", tool === "all" ? location.pathname : "#tool-" + tool); } catch (er) {}
        return;
      }
      if (e.target.closest("[data-copy]") && $("wfExample")) { copy(e.target.closest("[data-copy]")); return; }
      if (e.target.closest("[data-back]")) {
        e.preventDefault();
        var back = openId;
        try { history.pushState(null, "", tool === "all" ? location.pathname : "#tool-" + tool); } catch (er) {}
        show(false);
        var card = back && document.querySelector('#wfGrid a[href="#' + back + '"]');
        if (card) card.focus(); else $("workflows").scrollIntoView();
      }
    });
    window.addEventListener("hashchange", function () { show(true); });
    window.addEventListener("popstate", function () { show(true); });
    document.addEventListener("laoyu:lang", function () { show(false); });
    show(/^#wf-/.test(location.hash));
  });
})();
