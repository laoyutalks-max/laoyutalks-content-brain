/* =========================================================
   LAOYUTALKS 3.0 — Learn page
   Real videos on @laoyu.talks (same list as chatbot.js), grouped
   by topic, each paired with a free tool where one fits.
   Topic grouping is editorial, by video subject.
   Shareable links: learn.html#topic-people
   To add a video: add one row to VIDEOS.
   ========================================================= */
(function () {
  "use strict";
  var D = window.LAOYU_DATA || { resources: [] };
  function zh() { return document.documentElement.getAttribute("data-lang") === "zh"; }
  function biPick(en, cn) { var I = window.LAOYU_I18N; return I && I.pick ? I.pick(en, cn) : (zh() ? cn : en); } /* EN+中: both, see i18n.js */
  function L(a) { return a ? biPick(a[0], a[1]) : ""; }
  function T(en, cn) { return biPick(en, cn); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function $(id) { return document.getElementById(id); }
  function res(id) { return D.resources.filter(function (r) { return r.id === id; })[0]; }

  var TOPICS = {
    ai: ["AI at work", "职场中的 AI"],
    mfg: ["Manufacturing & data", "制造与数据"],
    people: ["Leading people", "带团队"],
    mindset: ["Career & mindset", "职业与心态"]
  };
  /* [video id, title, topic, related resource id or ""] */
  var VIDEOS = [
    ["7699481900641029397", ["What if AI could do more than answer questions?", "如果 AI 不只是回答问题？"], "ai", "wf-ai-email"],
    ["7697773201727737108", ["Still spending hours turning lab data into reports?", "还在花几个小时把实验数据做成报告？"], "ai", "wf-production-report"],
    ["7697574703711653140", ["Your production line is running. But is it productive?", "生产线在运转，但真的有效率吗？"], "mfg", "oee-loss-calculator"],
    ["7697970844294991124", ["You can have ten dashboards and still miss the real problem", "十个仪表板，也可能错过真正的问题"], "mfg", "production-kpi-dashboard"],
    ["7697787843640429844", ["Three samples, three records, too many checks", "三个样品、三份记录、太多检查"], "mfg", "wf-doc-generation"],
    ["7700187298062781716", ["Same mistake again?", "又犯同样的错误？"], "people", "repeated-mistake-worksheet"],
    ["7681167224157179157", ["Your best employee still works… but no longer cares?", "最好的员工还在工作，却已不在乎？"], "people", "checklist-quiet-quitting"],
    ["7682751500170513684", ["Your best employee suddenly stopped giving ideas", "最好的员工突然不再提想法"], "people", "difficult-conversation"],
    ["7699102838835711253", ["A department can be busy every day and still fail its business objectives", "部门每天都很忙，却仍可能达不成业务目标"], "people", "weekly-action-tracker"],
    ["7698852824586669333", ["Your best employee may not be your best leader", "最好的员工不一定是最好的领导"], "people", "skills-matrix"],
    ["7697988772431957254", ["A good team makes work easier", "好团队让工作更轻松"], "people", ""],
    ["7693410922819325204", ["The higher you go, the fewer people you can talk to honestly", "职位越高，能坦诚交流的人越少"], "people", ""],
    ["7698310964525026580", ["Success isn't only how hard you work, but how deeply you think", "成功不只看多努力，更看想得多深"], "mindset", "decision-matrix"],
    ["7698229823495294229", ["If your position disappeared tomorrow, what skills would you take with you?", "如果你的职位明天消失，你能带走哪些能力？"], "mindset", ""],
    ["7698899592061996308", ["Doing what you're unwilling to do is called change", "去做你不愿做的事，才叫改变"], "mindset", ""],
    ["7683467041931562261", ["Stop overthinking what people think of you", "别再过度在意别人怎么看你"], "mindset", ""],
    ["7686723112175553812", ["You can't control everything, only your response", "无法掌控一切，但能掌控你的反应"], "mindset", ""]
  ];
  var PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 1.500v13l11-6.500z"/></svg>';
  var topic = "all";

  function render() {
    $("lnFilter").innerHTML = [["all", ["All topics", "全部话题"]]].concat(Object.keys(TOPICS).map(function (k) { return [k, TOPICS[k]]; }))
      .map(function (x) {
        var n = x[0] === "all" ? VIDEOS.length : VIDEOS.filter(function (v) { return v[2] === x[0]; }).length;
        return '<button type="button" class="labChip" data-topic="' + x[0] + '" aria-pressed="' + (topic === x[0]) + '">' + esc(L(x[1])) + " (" + n + ")</button>";
      }).join("");
    var list = VIDEOS.filter(function (v) { return topic === "all" || v[2] === topic; });
    $("lnCount").textContent = T(list.length + (list.length === 1 ? " video" : " videos"), list.length + " 个视频");
    $("lnGrid").innerHTML = list.map(function (v) {
      var r = v[3] ? res(v[3]) : null;
      var tool = r
        ? '<a class="tool" href="' + r.url + '"><small>' + (r.type === "workflow" ? T("Workflow for this problem", "解决这个问题的工作流程") : T("Free tool for this problem", "解决这个问题的免费工具")) + "</small>" + esc(L(r.title)) + " →</a>"
        : "";
      return '<div class="card lesson"><a class="vid" href="https://www.tiktok.com/@laoyu.talks/video/' + v[0] + '" target="_blank" rel="noopener noreferrer">' +
        '<i class="play">' + PLAY + "</i><span><small>" + esc(L(TOPICS[v[2]])) + "</small><b>" + esc(L(v[1])) + "</b><small>" + T("Watch on TikTok ↗", "在 TikTok 观看 ↗") + "</small></span></a>" + tool + "</div>";
    }).join("");
  }

  function fromHash() {
    var m = (location.hash || "").match(/^#topic-(\w+)$/);
    topic = m && TOPICS[m[1]] ? m[1] : "all";
    render();
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!$("lnGrid")) return;
    $("lnFilter").addEventListener("click", function (e) {
      var b = e.target.closest("[data-topic]"); if (!b) return;
      topic = b.dataset.topic; render();
      try { history.replaceState(null, "", topic === "all" ? location.pathname : "#topic-" + topic); } catch (er) {}
    });
    window.addEventListener("hashchange", fromHash);
    document.addEventListener("laoyu:lang", render);
    fromHash();
  });
})();
