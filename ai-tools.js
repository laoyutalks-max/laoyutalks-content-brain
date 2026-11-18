/* LAOYU — AI Tools library page (rendered from resources-data.js) */
(function () {
  "use strict";
  var D = window.LAOYU_DATA;
  if (!D || !D.aitools) return;
  function zh() { return document.documentElement.getAttribute("data-lang") === "zh"; }
  function biPick(en, cn) { var I = window.LAOYU_I18N; return I && I.pick ? I.pick(en, cn) : (zh() ? cn : en); } /* EN+中: both, see i18n.js */
  function L(a) { return a ? biPick(a[0], a[1]) : ""; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var cur = "all";
  function render() {
    var n = { live: 0, exist: 0 };
    D.aitools.forEach(function (t) { if (n[t.status] != null) n[t.status]++; });
    document.getElementById("atStats").innerHTML =
      "<li><b>" + n.live + "</b> <span>" + biPick("new tools", "新工具") + "</span></li>" +
      "<li><b>" + n.exist + "</b> <span>" + biPick("on site", "已上线工具") + "</span></li>" +
      "<li><b>" + D.aitools.length + "</b> <span>" + biPick("in the roadmap", "规划中的工具") + "</span></li>";
    var tabs = [["all", ["All", "全部"]]].concat(Object.keys(D.aicats).map(function (k) { return [k, D.aicats[k]]; }));
    document.getElementById("atTabs").innerHTML = tabs.map(function (t) { return '<button type="button" data-c="' + t[0] + '" aria-pressed="' + (cur === t[0]) + '">' + esc(L(t[1])) + "</button>"; }).join("");
    var order = { live: 0, exist: 1, soon: 2, api: 3 };
    var list = D.aitools.filter(function (t) { return cur === "all" || t.cat === cur; }).sort(function (a, b) { return order[a.status] - order[b.status]; });
    document.getElementById("atGrid").innerHTML = list.map(function (t) {
      var open = t.url ? '<a class="btn ' + (t.status === "live" ? "orange" : "outline") + '" href="' + t.url + '">' + biPick("OPEN", "打开") + " →</a>" : "";
      return '<article class="atCard s-' + t.status + '"><span class="atPill p-' + t.status + '">' + esc(L(D.status[t.status])) + "</span><h3>" + esc(L(t.t)) + "</h3><p>" + esc(L(t.d)) + '</p><small>' + esc(L(D.aicats[t.cat])) + "</small>" + open + "</article>";
    }).join("");
    document.getElementById("atLegend").textContent = biPick("Tools marked Needs AI API need a future AI connection to work fully. Coming soon tools are not built yet.", "“需接入 AI”的工具需要未来连接 AI 服务后才能完整使用；“即将推出”的工具尚未上线。");
  }
  document.addEventListener("DOMContentLoaded", function () {
    var h = (location.hash || "").replace("#", ""); if (D.aicats[h]) cur = h;
    document.getElementById("atTabs").addEventListener("click", function (e) { var b = e.target.closest("[data-c]"); if (!b) return; cur = b.dataset.c; render(); });
    document.addEventListener("laoyu:lang", render);
    render();
  });
})();
