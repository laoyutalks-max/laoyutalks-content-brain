/* LAOYU — slide-out Tools & Resources sidebar (every page).
   Opens over the page from the left edge, so the page layout does not change.
   Data: one entry per tool/resource, grouped into 7 work-area categories. */
(function () {
  "use strict";
  var SB = {"cats": [["prod", "⚙", ["Production & Performance", "生产与绩效"]], ["down", "🔧", ["Downtime & Equipment", "停机与设备"]], ["qual", "🔍", ["Quality & Problem Solving", "质量与问题解决"]], ["people", "👥", ["People & Team", "人员与团队"]], ["shift", "🕒", ["Shift & Daily Routine", "班次与日常管理"]], ["report", "📣", ["Reporting & Decisions", "汇报与决策"]], ["ai", "🤖", ["AI & Office Skills", "AI 与办公技能"]]], "types": {"calculator": ["Calculator", "计算器"], "template": ["Template", "模板"], "tracker": ["Tracker", "追踪表"], "solver": ["Problem solver", "问题解决工具"], "checklist": ["Checklist", "清单"], "prompts": ["Prompt pack", "提示词包"], "demo": ["AI demo", "AI 演示"], "aitool": ["AI tool", "AI 工具"], "dashboard": ["Dashboard", "看板"]}, "items": [{"id": "demo-daily-report", "url": "demo-daily-report.html", "cat": "prod", "type": "demo", "status": "ready", "signup": false, "title": ["AI Daily Production Report", "AI 每日生产报告"], "aka": [["Production Report Generator", "生产报告生成器"]], "kw": "daily report shift summary production report 日报 班次报告 生产报告"}, {"id": "demo-root-cause", "url": "demo-root-cause.html", "cat": "qual", "type": "demo", "status": "ready", "signup": false, "title": ["AI Root Cause Assistant", "AI 根本原因助手"], "aka": [["5 Why Analysis Generator", "5 个为什么分析"]], "kw": "root cause 5 why investigation problem statement 根本原因 调查"}, {"id": "demo-shift-handover", "url": "demo-shift-handover.html", "cat": "shift", "type": "demo", "status": "ready", "signup": false, "title": ["AI Shift Handover Assistant", "AI 交接班助手"], "aka": [], "kw": "handover notes organise ai 交接 记录 整理"}, {"id": "ai-prompt-pack", "url": "ai-prompt-pack.html", "cat": "ai", "type": "prompts", "status": "ready", "signup": true, "title": ["AI Prompt Pack for Operations Managers", "运营经理 AI 提示词包"], "aka": [], "kw": "prompts chatgpt gemini claude copilot 提示词"}, {"id": "supervisor-daily-planner", "url": "supervisor-daily-planner.html", "cat": "shift", "type": "template", "status": "ready", "signup": true, "title": ["Supervisor Daily Planner", "主管每日计划表"], "aka": [], "kw": "daily plan priorities gemba supervisor 每日计划 优先事项 主管"}, {"id": "shift-handover", "url": "shift-handover.html", "cat": "shift", "type": "template", "status": "ready", "signup": true, "title": ["Shift Handover Template", "交接班模板"], "aka": [], "kw": "handover shift change open issues 交接班 交接"}, {"id": "weekly-action-tracker", "url": "weekly-action-tracker.html", "cat": "shift", "type": "tracker", "status": "ready", "signup": true, "title": ["Weekly Action Tracker", "每周行动追踪表"], "aka": [["Project Tracking Assistant", "项目追踪助手"]], "kw": "actions follow up overdue owner project tracker 行动 跟进 逾期 项目"}, {"id": "production-kpi-dashboard", "url": "production-kpi-dashboard.html", "cat": "prod", "type": "tracker", "status": "ready", "signup": true, "title": ["Production KPI Dashboard", "生产 KPI 仪表板"], "aka": [], "kw": "kpi output yield excel daily dashboard 产量 良率 看板 日报"}, {"id": "manpower-gap-calculator", "url": "manpower-gap-calculator.html", "cat": "people", "type": "calculator", "status": "ready", "signup": true, "title": ["Manpower Gap Calculator", "人力缺口计算器"], "aka": [["Manpower Planning Assistant", "人力规划助手"]], "kw": "manpower headcount absence cover overtime 人力 人数 缺勤 补位 加班"}, {"id": "repeated-mistake-worksheet", "url": "repeated-mistake-worksheet.html", "cat": "qual", "type": "solver", "status": "ready", "signup": true, "title": ["Repeated Mistake Worksheet", "重复错误改善工作表"], "aka": [], "kw": "repeat mistake error proofing poka-yoke retraining 重复错误 防错"}, {"id": "checklist-quiet-quitting", "url": "checklist-quiet-quitting.html", "cat": "people", "type": "checklist", "status": "ready", "signup": true, "title": ["Quiet Quitting Early-Warning Checklist", "员工默默躺平预警清单"], "aka": [], "kw": "quiet quitting motivation engagement retention 躺平 干劲 留人"}, {"id": "downtime-troubleshooter", "url": "downtime-troubleshooter.html", "cat": "down", "type": "solver", "status": "ready", "signup": true, "title": ["Downtime Troubleshooter", "停机排查工具"], "aka": [], "kw": "breakdown stop machine alarm jam maintenance safety 故障 停机 报警 卡料 维修"}, {"id": "oee-loss-calculator", "url": "oee-loss-calculator.html", "cat": "prod", "type": "calculator", "status": "ready", "signup": true, "title": ["OEE Loss Calculator", "OEE 损失计算器"], "aka": [["OEE Calculator", "OEE 计算器"]], "kw": "oee availability performance quality loss capacity 可用率 性能 损失 产能"}, {"id": "fishbone-5why", "url": "fishbone-5why.html", "cat": "qual", "type": "solver", "status": "ready", "signup": true, "title": ["Fishbone + 5-Why Builder", "鱼骨图 + 5 个为什么"], "aka": [["Fishbone Analysis Assistant", "鱼骨图分析助手"]], "kw": "fishbone ishikawa 6m 5 why root cause 鱼骨图 根本原因"}, {"id": "8d-report", "url": "8d-report.html", "cat": "qual", "type": "solver", "status": "ready", "signup": true, "title": ["8D Report Builder", "8D 报告生成器"], "aka": [["8D Report Assistant", "8D 报告助手"]], "kw": "8d customer complaint containment corrective 客户投诉 围堵 纠正"}, {"id": "skills-matrix", "url": "skills-matrix.html", "cat": "people", "type": "tracker", "status": "ready", "signup": true, "title": ["Team Skills Matrix", "团队技能矩阵"], "aka": [], "kw": "skills matrix training cross-training competency 技能矩阵 培训 多能工"}, {"id": "difficult-conversation", "url": "difficult-conversation.html", "cat": "people", "type": "solver", "status": "ready", "signup": true, "title": ["Difficult Conversation Planner", "困难对话准备表"], "aka": [], "kw": "difficult conversation feedback performance behaviour 谈话 反馈 绩效 行为"}, {"id": "escalation-report", "url": "escalation-report.html", "cat": "report", "type": "solver", "status": "ready", "signup": true, "title": ["Escalation Report Builder", "升级报告生成器"], "aka": [], "kw": "escalation management support cost impact 上报 管理层 成本影响"}, {"id": "decision-matrix", "url": "decision-matrix.html", "cat": "report", "type": "solver", "status": "ready", "signup": true, "title": ["Decision Matrix", "决策矩阵"], "aka": [], "kw": "decision matrix compare options supplier weighted 决策 比较 方案 供应商"}, {"id": "perf-analyzer", "url": "", "cat": "prod", "type": "aitool", "status": "soon", "signup": false, "title": ["Production Performance Analyzer", "生产绩效分析器"], "aka": [], "kw": "target actual trend gap 目标 实际 趋势"}, {"id": "tool-downtime-analysis", "url": "tool-downtime-analysis.html", "cat": "down", "type": "aitool", "status": "ready", "signup": false, "title": ["Downtime Analysis Assistant", "停机分析助手"], "aka": [], "kw": "downtime pareto minutes stops reasons 停机 柏拉图 原因"}, {"id": "yield", "url": "", "cat": "prod", "type": "aitool", "status": "soon", "signup": false, "title": ["Yield Analysis Assistant", "良率分析助手"], "aka": [], "kw": "yield first pass fpy 良率 直通率"}, {"id": "workload", "url": "", "cat": "people", "type": "aitool", "status": "soon", "signup": false, "title": ["Workload Balancing Assistant", "工作量平衡助手"], "aka": [], "kw": "workload balance tasks 工作量 平衡"}, {"id": "review", "url": "", "cat": "people", "type": "aitool", "status": "api", "signup": false, "title": ["Performance Review Writer", "绩效评语助手"], "aka": [], "kw": "performance review appraisal 绩效评估"}, {"id": "present", "url": "", "cat": "report", "type": "aitool", "status": "api", "signup": false, "title": ["Management Presentation Generator", "管理汇报生成器"], "aka": [], "kw": "presentation slides management 汇报 幻灯片"}, {"id": "tool-meeting-minutes", "url": "tool-meeting-minutes.html", "cat": "shift", "type": "aitool", "status": "ready", "signup": false, "title": ["Meeting Minutes Generator", "会议纪要生成器"], "aka": [], "kw": "meeting minutes decisions actions notes 会议纪要 决定 行动"}, {"id": "tool-capa-planner", "url": "tool-capa-planner.html", "cat": "qual", "type": "aitool", "status": "ready", "signup": false, "title": ["CAPA Action Planner", "CAPA 措施计划"], "aka": [], "kw": "capa corrective preventive action effectiveness 纠正预防措施 有效性"}, {"id": "audit", "url": "", "cat": "qual", "type": "aitool", "status": "soon", "signup": false, "title": ["Audit Preparation Assistant", "审核准备助手"], "aka": [], "kw": "audit iso evidence checklist 审核 证据"}, {"id": "tool-excel-formula", "url": "tool-excel-formula.html", "cat": "ai", "type": "aitool", "status": "ready", "signup": false, "title": ["Excel Formula Assistant", "Excel 公式助手"], "aka": [], "kw": "excel formula xlookup countifs sumifs google sheets 公式"}, {"id": "tool-email-writer", "url": "tool-email-writer.html", "cat": "report", "type": "aitool", "status": "ready", "signup": false, "title": ["Email Writing Assistant", "邮件写作助手"], "aka": [], "kw": "email write message tone 邮件 写作 语气"}, {"id": "sop", "url": "", "cat": "ai", "type": "aitool", "status": "api", "signup": false, "title": ["SOP Drafting Assistant", "SOP 起草助手"], "aka": [], "kw": "sop work instruction procedure 作业指导书"}, {"id": "prioritize", "url": "", "cat": "shift", "type": "aitool", "status": "soon", "signup": false, "title": ["Task Prioritization Assistant", "任务优先级助手"], "aka": [], "kw": "priority urgent important 优先级"}, {"id": "dash-production", "url": "dash-production.html", "cat": "prod", "type": "dashboard", "status": "soon", "signup": false, "title": ["Production Performance Dashboard", "生产绩效看板"], "aka": [], "kw": "csv dashboard output yield 看板 产量"}, {"id": "dash-downtime", "url": "dash-downtime.html", "cat": "down", "type": "dashboard", "status": "soon", "signup": false, "title": ["Downtime Analysis Dashboard", "停机分析看板"], "aka": [], "kw": "csv dashboard downtime pareto 看板 停机"}, {"id": "dash-manpower", "url": "dash-manpower.html", "cat": "people", "type": "dashboard", "status": "soon", "signup": false, "title": ["Manpower Planning Dashboard", "人力规划看板"], "aka": [], "kw": "csv dashboard headcount 看板 人力"}]};

  function zh() { return document.documentElement.getAttribute("data-lang") === "zh"; }
  function L(a) { return zh() ? a[1] : a[0]; }
  function T(en, cn) { return zh() ? cn : en; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var here = (location.pathname.split("/").pop() || "index.html");
  var owner = false, q = "", open = {}, root, panel, tab;
  var hereItem = SB.items.filter(function (i) { return i.url === here; })[0];
  if (hereItem) open[hereItem.cat] = true;

  function usable(i) { return i.status === "ready" || (owner && i.type === "dashboard"); }
  function hay(i) { return [i.title[0], i.title[1], i.kw].concat(i.aka.reduce(function (a, b) { return a.concat(b); }, []), SB.types[i.type]).join(" ").toLowerCase(); }
  function hit(i) { if (!q) return true; var h = hay(i); return q.toLowerCase().split(/\s+/).filter(Boolean).every(function (w) { return h.indexOf(w) > -1; }); }

  function itemHTML(i) {
    var badge = i.status === "ready" ? (i.signup ? "" : '<em class="sbFree">' + T("NO SIGN-UP", "免注册") + "</em>")
      : usable(i) ? '<em class="sbOwn">' + T("OWNER", "站长") + "</em>"
      : '<em class="sbSoon">' + (i.status === "api" ? T("NEEDS AI", "需 AI") : T("SOON", "即将")) + "</em>";
    var type = '<small>' + esc(L(SB.types[i.type])) + "</small>";
    var cls = "sbItem" + (i.url === here ? " here" : "") + (usable(i) ? "" : " off");
    return usable(i)
      ? '<a class="' + cls + '" href="' + i.url + '"' + (i.url === here ? ' aria-current="page"' : "") + "><span>" + esc(L(i.title)) + type + "</span>" + badge + "</a>"
      : '<div class="' + cls + '" aria-disabled="true"><span>' + esc(L(i.title)) + type + "</span>" + badge + "</div>";
  }

  function render() {
    if (!panel) return;
    var body = panel.querySelector(".sbBody"), total = 0;
    var html = SB.cats.map(function (c) {
      var list = SB.items.filter(function (i) { return i.cat === c[0] && hit(i); })
        .sort(function (a, b) { return (usable(a) ? 0 : 1) - (usable(b) ? 0 : 1); });
      if (!list.length) return "";
      total += list.length;
      var ready = list.filter(usable).length, isOpen = q || open[c[0]];
      return '<section class="sbCat' + (isOpen ? " open" : "") + '"><button type="button" class="sbHead" data-cat="' + c[0] + '" aria-expanded="' + (!!isOpen) + '">' +
        '<i aria-hidden="true">' + c[1] + "</i><b>" + esc(L(c[2])) + '</b><span class="sbN">' + (ready === list.length ? ready : ready + T(" ready · ", " 可用 · ") + (list.length - ready) + T(" soon", " 即将")) + '</span><span class="sbChev" aria-hidden="true">▾</span></button>' +
        '<div class="sbList">' + list.map(itemHTML).join("") + "</div></section>";
    }).join("");
    body.innerHTML = html || '<p class="sbEmpty">' + T("No match. Try another word.", "没有匹配结果，换个关键词试试。") + "</p>";
    panel.querySelector(".sbCount").textContent = q ? T(total + " found", "找到 " + total + " 项") : T(SB.items.filter(usable).length + " ready to use", SB.items.filter(usable).length + " 项可用");
    panel.querySelector(".sbTitle").textContent = T("Tools & Resources", "工具与资源");
    panel.querySelector(".sbSearch input").placeholder = T("Search, e.g. downtime, OEE, 8D", "搜索，例如：停机、OEE、8D");
    panel.querySelector(".sbClose").setAttribute("aria-label", T("Close", "关闭"));
    panel.querySelector(".sbAll").textContent = T("OPEN FULL LIBRARY →", "打开完整资源库 →");
    tab.querySelector(".sbTabTxt").textContent = T("TOOLS", "工具");
    var hint = document.querySelector(".sbHint");
    if (hint) hint.innerHTML = "<b>" + T("Click me!", "点我！") + "</b> " + T(SB.items.filter(usable).length + " free tools, sorted by problem", SB.items.filter(usable).length + " 个免费工具，按问题分类");
    tab.setAttribute("aria-label", T("Open Tools & Resources", "打开工具与资源"));
  }

  function setOpen(v) {
    root.classList.toggle("open", v);
    tab.setAttribute("aria-expanded", v ? "true" : "false");
    panel.setAttribute("aria-hidden", v ? "false" : "true");
    document.documentElement.classList.toggle("sbOpen", v);
    if (v) { setTimeout(function () { panel.querySelector(".sbSearch input").focus({ preventScroll: true }); }, 60); }
    else tab.focus({ preventScroll: true });
  }

  function build() {
    root = document.createElement("div");
    root.className = "sb";
    root.setAttribute("data-i18n-block", "");
    root.innerHTML =
            '<div class="sbShade" data-close></div>' +
      '<aside class="sbPanel" id="sbPanel" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="sbTitle">' +
        '<div class="sbTop"><div><h2 class="sbTitle" id="sbTitle"></h2><p class="sbCount"></p></div><button type="button" class="sbClose" data-close>✕</button></div>' +
        '<label class="sbSearch"><span aria-hidden="true">⌕</span><input type="search" autocomplete="off"></label>' +
        '<nav class="sbBody"></nav>' +
        '<a class="sbAll" href="resources.html"></a>' +
      "</aside>";
    document.body.appendChild(root);
    var wrap = document.createElement("span");
    wrap.className = "sbTabWrap";
    wrap.setAttribute("data-i18n-block", "");
    wrap.innerHTML = '<button type="button" class="sbTab" aria-expanded="false" aria-controls="sbPanel"><span class="sbLogo"><svg class="sbIco" viewBox="0 0 48 48" aria-hidden="true"><polygon class="sbHex" points="24,2.5 42.5,13.25 42.5,34.75 24,45.5 5.5,34.75 5.5,13.25"/><g class="sbGear"><circle cx="29" cy="19" r="7.2" class="sbTeeth"/><circle cx="29" cy="19" r="3.2" class="sbHub"/></g><path class="sbWrench" transform="translate(9.5 14) scale(1.02)" d="M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1 -3 3l-6 -6a6 6 0 0 1 -8 -8l3.5 3.5"/><path class="sbSpark" d="M37 33l1.2 2.8 2.8 1.2-2.8 1.2-1.2 2.8-1.2-2.8-2.8-1.2 2.8-1.2z"/></svg></span><span class="sbTabTxt"></span></button>' + '<div class="sbHint" role="status" hidden></div>';
    var navIn = document.querySelector("header .navin"), logo = navIn && navIn.firstElementChild;
    if (logo) logo.insertAdjacentElement("afterend", wrap); else { wrap.classList.add("sbFloat"); document.body.appendChild(wrap); }
    panel = root.querySelector(".sbPanel"); tab = wrap.querySelector(".sbTab");
    tab.addEventListener("click", function () { setOpen(!root.classList.contains("open")); });
    root.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) { setOpen(false); return; }
      var h = e.target.closest(".sbHead");
      if (h && !q) { open[h.dataset.cat] = !open[h.dataset.cat]; render(); var nh = panel.querySelector('.sbHead[data-cat="' + h.dataset.cat + '"]'); if (nh) nh.focus(); }
    });
    panel.querySelector(".sbSearch input").addEventListener("input", function (e) { q = e.target.value.trim(); render(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root.classList.contains("open")) setOpen(false);
      if (e.key === "Tab" && root.classList.contains("open")) {
        var f = panel.querySelectorAll("a[href], button, input");
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    render();
    document.addEventListener("laoyu:lang", render);
    // Any element with data-open-tools opens the sidebar (falls back to its link without JS)
    document.addEventListener("click", function (e) { var t = e.target.closest("[data-open-tools]"); if (t) { e.preventDefault(); setOpen(true); } });
    window.LAOYU_SIDEBAR = { open: function () { setOpen(true); }, close: function () { setOpen(false); } };
    var hintEl = wrap.querySelector(".sbHint");
    var hideHint = function () { hintEl.classList.remove("show"); setTimeout(function () { hintEl.hidden = true; }, 300); };
    try {
      if (!sessionStorage.getItem("sbHint")) {
        sessionStorage.setItem("sbHint", "1");
        setTimeout(function () { if (root.classList.contains("open")) return; hintEl.hidden = false; requestAnimationFrame(function () { hintEl.classList.add("show"); }); setTimeout(hideHint, 6500); }, 1500);
      }
    } catch (e) {}
    hintEl.addEventListener("click", function () { hideHint(); setOpen(true); });
    tab.addEventListener("click", function () { if (!hintEl.hidden) hideHint(); });
    (window.LAOYU_OWNER || Promise.resolve(function () { try { return localStorage.getItem("laoyuOwner") === "f81cab01a5d016ce176b362075e0f61fbce75fda490f927f1fb296a4f34e6881"; } catch (e) { return false; } }()))
      .then(function (o) { owner = !!o; render(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
})();
