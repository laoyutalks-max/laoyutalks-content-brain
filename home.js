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
    var rank = { live: 0, exist: 1 };
    var ready = D.aitools.filter(function (t) { return t.url && (t.status === "live" || t.status === "exist"); })
      .sort(function (a, b) { return rank[a.status] - rank[b.status]; });
    $("hTools").innerHTML = ready.slice(0, 8).map(function (t) {
      return '<a class="hTool s-' + t.status + '" href="' + t.url + '"><span class="atPill p-' + t.status + '">' + esc(L(D.status[t.status])) + "</span><b>" + esc(L(t.t)) + "</b><em>" + esc(L(t.d)) + "</em></a>";
    }).join("");
    $("hAllTools").textContent = T("ALL " + D.aitools.length + " TOOLS →", "全部 " + D.aitools.length + " 个工具 →");
  }
  /* Start from the problem: each one opens the best tool directly */
  var PROBS = [
    ["<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1\"/>", ["Machine keeps stopping", "设备老是停机"], "downtime-troubleshooter"],
    ["<path d=\"M3 3v18h18\"/><path d=\"M7 8l4 4 3-3 6 6\"/><path d=\"M20 11v4h-4\"/>", ["Output is below target", "产量达不到目标"], "oee-loss-calculator"],
    ["<circle cx=\"9\" cy=\"8\" r=\"3\"/><path d=\"M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6\"/><path d=\"M16 5a3 3 0 0 1 0 6M18 14c2 .8 3 2.9 3 6\"/>", ["Short of people this shift", "这个班人手不够"], "manpower-gap-calculator"],
    ["<path d=\"M4 9h13l-3-3M20 15H7l3 3\"/>", ["Information gets lost between shifts", "交接班信息丢失"], "shift-handover"],
    ["<path d=\"M12 3l10 18H2z\"/><path d=\"M12 10v5M12 18v.5\"/>", ["The same mistake keeps coming back", "同样的错误反复出现"], "repeated-mistake-worksheet"],
    ["<path d=\"M5 3h10l4 4v14H5z\"/><path d=\"M9 12h6M9 16h4\"/><circle cx=\"16\" cy=\"17\" r=\"0\"/>", ["The daily report takes too long", "每日报告太花时间"], "demo-daily-report"],
    ["<path d=\"M3 7l9-4 9 4-9 4z\"/><path d=\"M3 7v10l9 4 9-4V7M12 11v10\"/>", ["A customer complaint needs an 8D", "客户投诉需要写 8D"], "8d-report"],
    ["<path d=\"M4 5h16v11H9l-5 4z\"/><path d=\"M8 10h8M8 13h5\"/>", ["A team member is losing motivation", "团队成员失去干劲"], "checklist-quiet-quitting"]
  ];
  function problems() {
    $("hProb").innerHTML = PROBS.map(function (p) {
      var r = D.resources.filter(function (x) { return x.id === p[2]; })[0]; if (!r) return "";
      return '<a class="hProbCard" href="' + r.url + '"><i aria-hidden="true"><svg viewBox="0 0 24 24">' + p[0] + "</svg></i><b>" + esc(L(p[1])) + "</b><em>" + esc(L(r.title)) + " →</em></a>";
    }).join("");
  }
  function resources() {
    $("hRes").innerHTML = FEATURED.map(function (id) {
      var r = D.resources.filter(function (x) { return x.id === id; })[0]; if (!r) return "";
      return '<a class="hRes" href="' + r.url + '"><span class="hShot"><img src="assets/previews/' + r.id + "-" + (zh() ? "zh" : "en") + '.jpg" alt="" loading="lazy" width="680" height="427"></span><span class="hResB"><small>' + esc(L(D.types[r.type])) + "</small><b>" + esc(L(r.title)) + "</b><em>" + esc(L(r.problem)) + "</em></span></a>";
    }).join("");
  }
  function profile() { try { return JSON.parse(localStorage.getItem("laoyuProfile") || "null"); } catch (e) { return null; } }
  function learn() {
    var done = false; try { done = localStorage.getItem("laoyuLearnNotify") === "1"; } catch (e) {}
    var p = profile();
    var lv = LEVELS.map(function (l) { return "<li><span>" + esc(L(l[0])) + "</span>" + esc(L(l[1])) + " · " + l[2].length + T(" lessons", " 节课") + "</li>"; }).join("");
    var form = done
      ? '<p class="hlDone">✓ ' + T("You're on the list. We'll email you when the first lessons open.", "已登记。首批课程开放时会邮件通知你。") + "</p>"
      : p && p.email
        ? '<button type="button" class="btn orange" data-notify>' + T("NOTIFY ME", "开课提醒我") + '</button><span class="hlFor">' + T("We'll email ", "我们会发到 ") + "<b>" + esc(p.email) + "</b></span>"
        : '<form class="hlForm" novalidate><label class="sr" for="hlEmail">' + T("Email", "邮箱") + '</label><input id="hlEmail" type="email" autocomplete="email" maxlength="120" placeholder="' + T("Your email", "你的邮箱") + '"><button type="submit" class="btn orange">' + T("NOTIFY ME", "开课提醒我") + '</button></form><p class="hlErr" role="alert" hidden></p>';
    $("hLearn").innerHTML =
      '<div class="hlTop"><div><h2 class="hubH">' + T("Learning Centre", "学习中心") + " <small>" + T("COMING SOON", "即将推出") + "</small></h2>" +
      "<p>" + T("16 short lessons, from AI basics to building your own automations.", "16 节短课，从 AI 入门到自己搭建自动化。") + "</p></div>" +
      '<div class="hlAct">' + form + "</div></div><ul class='hlLevels'>" + lv + "</ul>";
  }
  function notify(email, name) {
    var LOG_URL = "https://script.google.com/macros/s/AKfycbyjk02ceJcMxwfuGGsnkwafQwP0tEkjoy7OWDhbnd3D_WUiu32qRJobGCNj2Tco__s6zg/exec";
    try {
      fetch(LOG_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ type: "lead", name: name || "(Learning Centre)", email: email, message: "Learning Centre: notify me when lessons open", page: "index.html", lang: zh() ? "zh" : "en", session: "learn-" + Date.now().toString(36), hp: "" }) }).catch(function () {});
    } catch (e) {}
    try { localStorage.setItem("laoyuLearnNotify", "1"); } catch (e) {}
    learn();
  }
  function labCta() {
    $("hLabCta").innerHTML = "<p>" + T("Want a workflow like this for your team?", "想为你的团队做一个这样的流程？") + '</p><a class="btn outline" href="contact.html">' + T("TALK TO ME →", "联系我 →") + "</a>";
  }
  function labUI() {
    $("hLabTabs").innerHTML = LAB.map(function (p, i) { return '<button type="button" data-l="' + i + '" aria-pressed="' + (i === lab) + '">' + esc(L(p[0])) + "</button>"; }).join("");
    $("hFlow").innerHTML = LAB[lab][1].map(function (n, i) { return '<div class="hNode"><small>' + esc(L(STEP[i])) + "</small><b>" + esc(L(n)) + "</b></div>"; }).join("");
    $("hStack").innerHTML = LAB[lab][2].map(function (s) { return "<span>" + esc(s) + "</span>"; }).join("");
  }
  function all() { counts(); problems(); learn(); labUI(); labCta(); }

  document.addEventListener("DOMContentLoaded", function () {
    if (!$("hProb")) return;
    $("hLearn").addEventListener("click", function (e) {
      if (e.target.closest("[data-notify]")) { var p = profile(); if (p && p.email) notify(p.email, p.name); }
    });
    $("hLearn").addEventListener("submit", function (e) {
      e.preventDefault();
      var inp = $("hlEmail"), err = $("hLearn").querySelector(".hlErr"), v = inp.value.trim().toLowerCase();
      var show = function (m) { err.textContent = m; err.hidden = false; inp.focus(); };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return show(T("Please enter a valid email address.", "请输入有效的邮箱地址。"));
      var EC = window.LAOYU_EMAIL, fix = EC ? EC.typoFix(v) : null;
      if (fix && inp.dataset.kept !== v) { inp.dataset.kept = v; return show(T("Did you mean " + fix + "? Press NOTIFY ME again to keep what you typed.", "你是不是想输入 " + fix + "？再点一次“开课提醒我”可保留原输入。")); }
      if (!EC) return notify(v);
      EC.check(v).then(function (r) { if (r.ok) notify(v); else show(T("Please use a work or personal email that can receive mail.", "请使用能正常收信的工作或个人邮箱。")); });
    });
    $("hLabTabs").addEventListener("click", function (e) { var b = e.target.closest("[data-l]"); if (!b) return; lab = +b.dataset.l; labUI(); });
    document.querySelectorAll("[data-open-ask]").forEach(function (b) {
      b.addEventListener("click", function (e) { e.preventDefault(); if (window.LAOYU_CHAT) window.LAOYU_CHAT.open(); });
    });
    document.addEventListener("laoyu:lang", all);
    all();
  });
})();
