/* LAOYU — "Coming soon" resources on the Resources page.
   Visitors see a teaser; on the owner's devices (owner.js) the cards open the preview. */
(function () {
  "use strict";
  var UP = [
    ["dash-production.html", ["Production Performance Dashboard", "生产绩效看板"], ["Output, yield, attainment and utilization from your daily production CSV.", "用你的每日生产 CSV 生成产量、良率、达成率和利用率。"]],
    ["dash-downtime.html", ["Downtime Analysis Dashboard", "停机分析看板"], ["Total hours, events, top reason and top equipment, with a Pareto chart.", "总时长、次数、最大原因和最大设备，并附柏拉图。"]],
    ["dash-manpower.html", ["Manpower Planning Dashboard", "人力规划看板"], ["Required vs available headcount, the gap, overtime and output attainment.", "需求与可用人数、人数差距、加班和产出达成率。"]]
  ];
  function zh() { return document.documentElement.getAttribute("data-lang") === "zh"; }
  function L(a) { return zh() ? a[1] : a[0]; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var owner = false;
  function render() {
    var g = document.getElementById("upGrid"); if (!g) return;
    g.innerHTML = UP.map(function (u) {
      var inner = '<span class="upPill">' + (owner ? (zh() ? "站长预览" : "OWNER PREVIEW") : (zh() ? "即将推出" : "COMING SOON")) + "</span><b>" + esc(L(u[1])) + "</b><p>" + esc(L(u[2])) + "</p>";
      return owner ? '<a class="upCard" href="' + u[0] + '">' + inner + '<span class="upGo">' + (zh() ? "打开 →" : "OPEN →") + "</span></a>"
                   : '<div class="upCard" aria-disabled="true">' + inner + "</div>";
    }).join("");
  }
  document.addEventListener("DOMContentLoaded", function () {
    render();
    (window.LAOYU_OWNER || Promise.resolve(false)).then(function (o) { owner = o; render(); });
    document.addEventListener("laoyu:lang", render);
  });
})();
