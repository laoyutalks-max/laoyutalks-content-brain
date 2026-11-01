/* LAOYU — homepage hub sections (rendered from resources-data.js) */
(function () {
  "use strict";
  var D = window.LAOYU_DATA;
  if (!D) return;
  function zh() { return document.documentElement.getAttribute("data-lang") === "zh"; }
  function L(a) { return zh() ? a[1] : a[0]; }
  function T(en, cn) { return zh() ? cn : en; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function $(id) { return document.getElementById(id); }
  var cat = "mfg", lab = 0;

  var LAB = [
    [["Daily Production Dashboard", "每日生产看板"], [["Shift form", "班次表单"], ["Google Sheet", "Google 表格"], ["Apps Script", "Apps Script"], ["Web dashboard", "网页看板"], ["Morning email", "早间邮件"]], ["Forms", "Sheets", "Apps Script"]],
    [["Maintenance Requests", "维修申请"], [["Request form", "申请表单"], ["Google Sheet", "Google 表格"], ["Apps Script", "Apps Script"], ["Status board", "状态看板"], ["Alert to technician", "通知技术员"]], ["Forms", "Sheets", "Apps Script", "Google Chat"]],
    [["Inventory Reorder Alerts", "库存补货提醒"], [["Stock count", "库存盘点"], ["Google Sheet", "Google 表格"], ["Min-level check", "最低库存检查"], ["Low-stock list", "低库存清单"], ["Reorder email", "补货邮件"]], ["Sheets", "Apps Script"]],
    [["Training Expiry Tracker", "培训到期追踪"], [["Training records", "培训记录"], ["Google Sheet", "Google 表格"], ["Expiry rules", "到期规则"], ["Team view", "团队视图"], ["Reminder email", "提醒邮件"]], ["Sheets", "Apps Script", "Looker Studio"]],
    [["Project Tracking", "项目追踪"], [["Project form", "项目表单"], ["Google Sheet", "Google 表格"], ["Apps Script", "Apps Script"], ["Web app", "网页应用"], ["Weekly digest", "每周摘要"]], ["Sheets", "Apps Script"]]
  ];
  var STEP = [["INPUT", "输入"], ["STORE", "存储"], ["LOGIC", "逻辑"], ["VIEW", "展示"], ["ACT", "行动"]];
  var LEVELS = [
    [["LEVEL 1", "第 1 级"], ["AI Beginner", "AI 入门"], [[["Introduction to AI", "认识 AI"], 15], [["ChatGPT, Gemini, Claude", "ChatGPT、Gemini、Claude"], 20], [["Prompt engineering", "提示词技巧"], 25], [["AI for daily work", "日常工作中的 AI"], 20], [["AI for Excel", "用 AI 做 Excel"], 30]]],
    [["LEVEL 2", "第 2 级"], ["AI Practitioner", "AI 实践"], [[["AI for manufacturing", "制造业中的 AI"], 30], [["AI for data analysis", "用 AI 做数据分析"], 35], [["AI for quality", "质量管理中的 AI"], 30], [["AI for planning", "生产计划中的 AI"], 30], [["AI for reporting", "用 AI 做管理汇报"], 25]]],
    [["LEVEL 3", "第 3 级"], ["AI Transformation", "AI 转型"], [[["AI agents", "AI 智能体"], 40], [["Workflow automation", "流程自动化"], 40], [["Google Apps Script", "Google Apps Script"], 60], [["AppSheet", "AppSheet"], 45], [["AI dashboards", "AI 看板开发"], 60], [["AI-powered operations", "AI 驱动的运营管理"], 45]]]
  ];
  var FEATURED = ["shift-handover", "production-kpi-dashboard", "oee-loss-calculator", "skills-matrix"];

  function counts() {
    var tools = D.resources.filter(function (r) { return r.type !== "demo"; }).length, demos = D.resources.length - tools;
    document.querySelectorAll("[data-c-aitools]").forEach(function (e) { e.textContent = T(D.aitools.length + " tools", D.aitools.length + " 个工具"); });
    document.querySelectorAll("[data-c-res]").forEach(function (e) { e.textContent = T(tools + " + " + demos + " demos", tools + " 个 + " + demos + " 个演示"); });
    document.querySelectorAll("[data-c-learn]").forEach(function (e) { e.textContent = T("16 modules · soon", "16 个模块 · 即将推出"); });
    document.querySelectorAll("[data-c-lab]").forEach(function (e) { e.textContent = T(LAB.length + " projects", LAB.length + " 个项目"); });
    document.querySelectorAll("[data-c-ask]").forEach(function (e) { e.textContent = T("Ask", "提问"); });
  }
  function tools() {
    $("hTabs").innerHTML = Object.keys(D.aicats).map(function (k) { return '<button type="button" data-k="' + k + '" aria-pressed="' + (k === cat) + '">' + esc(L(D.aicats[k])) + "</button>"; }).join("");
    $("hTools").innerHTML = D.aitools.filter(function (t) { return t.cat === cat; }).map(function (t) {
      var tag = t.url ? "a" : "div";
      return "<" + tag + ' class="hTool s-' + t.status + '"' + (t.url ? ' href="' + t.url + '"' : "") + '><span class="atPill p-' + t.status + '">' + esc(L(D.status[t.status])) + "</span><b>" + esc(L(t.t)) + "</b></" + tag + ">";
    }).join("");
  }
  function resources() {
    $("hRes").innerHTML = FEATURED.map(function (id) {
      var r = D.resources.filter(function (x) { return x.id === id; })[0]; if (!r) return "";
      return '<a class="hRes" href="' + r.url + '"><span class="hShot"><img src="assets/previews/' + r.id + "-" + (zh() ? "zh" : "en") + '.jpg" alt="" loading="lazy" width="680" height="427"></span><span class="hResB"><small>' + esc(L(D.types[r.type])) + "</small><b>" + esc(L(r.title)) + "</b></span></a>";
    }).join("");
  }
  function learn() {
    $("hLearn").innerHTML = LEVELS.map(function (l) {
      return '<div class="hLevel"><h3><span>' + esc(L(l[0])) + "</span>" + esc(L(l[1])) + "</h3><ul>" + l[2].map(function (m) { return "<li>" + esc(L(m[0])) + "<em>" + m[1] + " " + T("min", "分钟") + "</em></li>"; }).join("") + "</ul></div>";
    }).join("");
  }
  function labUI() {
    $("hLabTabs").innerHTML = LAB.map(function (p, i) { return '<button type="button" data-l="' + i + '" aria-pressed="' + (i === lab) + '">' + esc(L(p[0])) + "</button>"; }).join("");
    $("hFlow").innerHTML = LAB[lab][1].map(function (n, i) { return '<div class="hNode"><small>' + esc(L(STEP[i])) + "</small><b>" + esc(L(n)) + "</b></div>"; }).join("");
    $("hStack").innerHTML = LAB[lab][2].map(function (s) { return "<span>" + esc(s) + "</span>"; }).join("");
  }
  function all() { counts(); tools(); resources(); learn(); labUI(); }

  document.addEventListener("DOMContentLoaded", function () {
    if (!$("hTools")) return;
    $("hTabs").addEventListener("click", function (e) { var b = e.target.closest("[data-k]"); if (!b) return; cat = b.dataset.k; tools(); });
    $("hLabTabs").addEventListener("click", function (e) { var b = e.target.closest("[data-l]"); if (!b) return; lab = +b.dataset.l; labUI(); });
    document.querySelectorAll("[data-open-ask]").forEach(function (b) {
      b.addEventListener("click", function (e) { e.preventDefault(); if (window.LAOYU_CHAT) window.LAOYU_CHAT.open(); });
    });
    document.addEventListener("laoyu:lang", all);
    all();
  });
})();
