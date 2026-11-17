/* =========================================================
   LAOYUTALKS — Automation Lab: Workflow Builder (#builder)
   The visitor describes a process in 8 fields and a list of
   steps; the page draws INPUT → TRIGGER → PROCESS →
   AUTOMATION → OUTPUT and writes a structured summary.
   It plans a workflow only: nothing is connected or run.
   Storage: the draft is kept in this browser (localStorage,
   key laoyuWfDraft). Nothing is sent anywhere.
   ========================================================= */
(function () {
  "use strict";
  var D = window.LAOYU_DATA || {};
  var KEY = "laoyuWfDraft", MAX_STEPS = 8;
  function zh() { return document.documentElement.getAttribute("data-lang") === "zh"; }
  function T(en, cn) { var I = window.LAOYU_I18N; return I && I.pick ? I.pick(en, cn) : (zh() ? cn : en); }
  function L(a) { return a ? T(a[0], a[1]) : ""; }
  function B(a) { return a ? (zh() ? a[1] : a[0]) : ""; }            /* one language: for values and copied text */
  function O(en, cn) { return zh() ? cn : en; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function $(id) { return document.getElementById(id); }

  var TOOLS = ["forms", "sheets", "script", "appsheet", "looker", "gmail", "chat", "ai", "docs"];

  var FIELDS = [
    { k: "problem", long: true, max: 400, req: true, t: ["1. Business problem", "1. 业务问题"], ph: ["What goes wrong today, and who does it affect?", "现在哪里出问题？影响到谁？"], err: ["Describe the business problem.", "请描述业务问题。"] },
    { k: "current", long: true, max: 400, t: ["2. Current manual process", "2. 现在的手工流程"], ph: ["How is it done by hand today?", "现在是怎样手工完成的？"] },
    { k: "input", max: 160, req: true, t: ["3. Input data", "3. 输入数据"], ph: ["e.g. shift output, scrap and downtime by line", "例如：各产线的班次产量、报废和停机"], err: ["Describe the input data.", "请填写输入数据。"] },
    { k: "trigger", max: 160, req: true, list: true, t: ["4. Trigger", "4. 触发条件"], ph: ["When should it run?", "什么时候运行？"], err: ["Say what starts the workflow.", "请说明由什么触发这个流程。"] },
    { k: "tools", t: ["5. Automation tools", "5. 自动化工具"], err: ["Pick at least one tool.", "请至少选择一个工具。"] },
    { k: "logic", long: true, max: 400, t: ["6. Processing logic", "6. 处理逻辑"], ph: ["What should be calculated, checked or decided?", "需要计算、检查或判断什么？"] },
    { k: "output", max: 160, req: true, t: ["7. Expected output", "7. 预期输出"], ph: ["e.g. a dashboard and a one-page report", "例如：一个看板和一页报告"], err: ["Describe the expected output.", "请填写预期输出。"] },
    { k: "notify", max: 160, t: ["8. Notification or action", "8. 通知或行动"], ph: ["Who is told, or what happens next?", "通知谁？接下来做什么？"] }
  ];
  var TRIGGERS = [["Every morning (time-driven)", "每天早上（定时）"], ["Every Monday (time-driven)", "每周一（定时）"], ["When a form is submitted", "提交表单时"], ["When a row is added or changed", "新增或修改一行时"], ["When someone clicks a button", "有人点击按钮时"]];

  var EXAMPLES = [
    { id: "report", t: ["Daily production reporting", "每日生产报告"],
      problem: ["Supervisors copy shift numbers into a report by hand, and managers get it late and in different formats.", "主管手工把班次数据抄进报告，管理者收到得晚，格式也不统一。"],
      current: ["Each supervisor fills in a paper sheet, types the numbers into a spreadsheet and emails it after the shift.", "每位主管先填纸质表，再把数字录入表格，下班后用邮件发出。"],
      input: ["Shift output, scrap and downtime by line", "各产线的班次产量、报废和停机"],
      trigger: ["Every morning at 06:30 (time-driven)", "每天早上 06:30（定时）"],
      tools: ["forms", "sheets", "script", "looker", "gmail"],
      logic: ["Total yesterday's numbers by line, calculate achievement % and scrap %, and flag lines below 90%.", "按产线汇总昨天的数据，计算达成率和报废率，标出低于 90% 的产线。"],
      output: ["Automated dashboard and a one-page management report", "自动更新的看板和一页管理报告"],
      notify: ["Email the report to production managers before the morning meeting.", "在早会前把报告发给生产经理。"],
      steps: [["Production data", "生产数据"], ["Google Sheets", "Google 表格"], ["Apps Script", "Apps Script"], ["Automated dashboard", "自动看板"], ["Management report", "管理报告"]] },
    { id: "6s", t: ["6S audit management", "6S 稽核管理"],
      problem: ["6S audits are scored on paper and findings are not followed up.", "6S 稽核在纸上打分，发现的问题没人跟进。"],
      current: ["The auditor scores on paper, takes photos on a personal phone and types a summary later.", "稽核人在纸上打分，用个人手机拍照，之后再整理总结。"],
      input: ["Area, score per S, photos and findings", "区域、每个 S 的得分、照片和问题"],
      trigger: ["When an audit is submitted", "提交稽核时"],
      tools: ["appsheet", "sheets", "gmail"],
      logic: ["Total the score per area and create one finding per problem, with an owner and a due date.", "按区域合计得分，每个问题生成一条记录，并指定负责人和截止日期。"],
      output: ["Audit record and an open-findings list by area", "稽核记录和按区域的未关闭问题清单"],
      notify: ["Email each finding's owner, and send a weekly reminder for overdue findings.", "通知每个问题的负责人，并每周提醒逾期问题。"],
      steps: [["Mobile audit", "手机稽核"], ["AppSheet", "AppSheet"], ["Google Sheets", "Google 表格"], ["Automated notification", "自动通知"], ["Corrective action tracking", "整改跟踪"]] },
    { id: "manpower", t: ["Manpower planning", "人力规划"],
      problem: ["Every morning the supervisor works out from memory who can run which machine.", "每天早上主管都要凭记忆安排谁操作哪台设备。"],
      current: ["Paper roster, phone calls for absences and the allocation drawn on a whiteboard.", "纸质排班表、电话通知缺勤，分配情况写在白板上。"],
      input: ["Absences, skills matrix and people required per machine", "缺勤、技能矩阵和每台设备所需人数"],
      trigger: ["Every morning before the shift, and when an absence is reported", "每天开班前，以及有人报缺勤时"],
      tools: ["forms", "sheets"],
      logic: ["Mark who is available, match qualified people to each machine and flag gaps.", "标出在岗人员，为每台设备匹配有资格的人，并标出缺口。"],
      output: ["Allocation view and a utilisation dashboard", "人员分配视图和利用率看板"],
      notify: ["Show gaps in red for the start-of-shift meeting.", "缺口标红，供班前会使用。"],
      steps: [["Employee availability", "员工在岗情况"], ["Resource database", "资源数据库"], ["Automated allocation", "自动分配"], ["Utilisation dashboard", "利用率看板"]] },
    { id: "training", t: ["Training matrix", "培训矩阵"],
      problem: ["Certificates expire without anyone noticing until an audit.", "证书过期了没人发现，直到审核时才知道。"],
      current: ["Training records sit in several spreadsheets and are checked by hand before audits.", "培训记录分散在多张表格里，审核前才人工检查。"],
      input: ["Employee, skill, certificate date and expiry date", "员工、技能、发证日期和到期日期"],
      trigger: ["Every Monday (time-driven)", "每周一（定时）"],
      tools: ["sheets", "script", "gmail"],
      logic: ["Find certificates that expire within 30 days or have expired, and group them by supervisor.", "找出 30 天内到期或已过期的证书，按主管分组。"],
      output: ["Training matrix with an expiry status for each person", "带有每人到期状态的培训矩阵"],
      notify: ["Email each supervisor the list of expiring certificates.", "把即将到期的证书清单发给每位主管。"],
      steps: [["Training records", "培训记录"], ["Certification tracking", "证书跟踪"], ["Expiry monitoring", "到期监控"], ["Automated notification", "自动通知"]] }
  ];

  function blank() { return { problem: "", current: "", input: "", trigger: "", tools: [], logic: "", output: "", notify: "", steps: ["", ""], ex: "" }; }
  var S = blank(), errs = {}, summary = "";

  function load() {
    try {
      var raw = localStorage.getItem(KEY); if (!raw) return;
      var d = JSON.parse(raw), b = blank();
      Object.keys(b).forEach(function (k) {
        if (k === "tools") S.tools = Array.isArray(d.tools) ? d.tools.filter(function (t) { return TOOLS.indexOf(t) > -1; }) : [];
        else if (k === "steps") S.steps = Array.isArray(d.steps) ? d.steps.slice(0, MAX_STEPS).map(function (x) { return String(x).slice(0, 60); }) : b.steps;
        else S[k] = typeof d[k] === "string" ? d[k].slice(0, 400) : "";
      });
      if (S.steps.length < 2) S.steps = S.steps.concat(["", ""]).slice(0, 2);
    } catch (e) { S = blank(); }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function hasDraft() { return !!(S.problem || S.input || S.output || S.trigger || S.tools.length || S.steps.some(Boolean)); }

  /* ---------- rendering ---------- */
  function field(f) {
    var id = "wb-" + f.k, e = errs[f.k], lbl = '<label for="' + id + '">' + esc(L(f.t)) + (f.req ? ' <span class="req">' + T("required", "必填") + "</span>" : "") + "</label>";
    var aria = ' aria-invalid="' + !!e + '"' + (e ? ' aria-describedby="' + id + '-e"' : "");
    var ctl;
    if (f.k === "tools") {
      return '<fieldset class="wbField wbTools' + (e ? " bad" : "") + '"' + (e ? ' aria-describedby="wb-tools-e"' : "") + "><legend>" + esc(L(f.t)) + ' <span class="req">' + T("required", "必填") + "</span></legend>" +
        '<div class="wbChecks">' + TOOLS.map(function (t) {
          return '<label class="wbCheck"><input type="checkbox" data-tool="' + t + '"' + (S.tools.indexOf(t) > -1 ? " checked" : "") + "><span>" + esc(L(D.tools && D.tools[t])) + "</span></label>";
        }).join("") + "</div>" + (e ? '<p class="wbErr" id="wb-tools-e">' + esc(e) + "</p>" : "") + "</fieldset>";
    }
    if (f.long) ctl = '<textarea id="' + id + '" data-k="' + f.k + '" rows="3" maxlength="' + f.max + '" placeholder="' + esc(L(f.ph)) + '"' + aria + ">" + esc(S[f.k]) + "</textarea>";
    else ctl = '<input id="' + id + '" data-k="' + f.k + '" type="text" maxlength="' + f.max + '" placeholder="' + esc(L(f.ph)) + '"' + aria + (f.list ? ' list="wb-trig"' : "") + ' value="' + esc(S[f.k]) + '">';
    return '<div class="wbField' + (f.long ? " wide" : "") + (e ? " bad" : "") + '">' + lbl + ctl + (e ? '<p class="wbErr" id="' + id + '-e">' + esc(e) + "</p>" : "") + "</div>";
  }
  function stepsHtml() {
    var e = errs.steps;
    return '<fieldset class="wbField wide wbSteps' + (e ? " bad" : "") + '"><legend>' + T("Workflow steps", "流程步骤") + ' <span class="req">' + T("at least 2", "至少 2 步") + "</span></legend>" +
      '<ol class="wbStepList">' + S.steps.map(function (s, i) {
        var n = i + 1;
        return '<li><input type="text" maxlength="60" data-step="' + i + '" value="' + esc(s) + '" aria-label="' + esc(T("Step " + n, "第 " + n + " 步")) + '" placeholder="' + esc(T("Step " + n, "第 " + n + " 步")) + '">' +
          '<button type="button" class="wbIco" data-move="' + i + ':-1"' + (i === 0 ? " disabled" : "") + ' aria-label="' + esc(T("Move step " + n + " up", "上移第 " + n + " 步")) + '">↑</button>' +
          '<button type="button" class="wbIco" data-move="' + i + ':1"' + (i === S.steps.length - 1 ? " disabled" : "") + ' aria-label="' + esc(T("Move step " + n + " down", "下移第 " + n + " 步")) + '">↓</button>' +
          '<button type="button" class="wbIco" data-del="' + i + '"' + (S.steps.length <= 2 ? " disabled" : "") + ' aria-label="' + esc(T("Remove step " + n, "删除第 " + n + " 步")) + '">✕</button></li>';
      }).join("") + "</ol>" +
      '<button type="button" class="tryLink" data-add' + (S.steps.length >= MAX_STEPS ? " disabled" : "") + ">" + T("+ Add step", "+ 添加步骤") + "</button>" +
      (S.steps.length >= MAX_STEPS ? ' <small class="muted">' + T("Up to " + MAX_STEPS + " steps.", "最多 " + MAX_STEPS + " 步。") + "</small>" : "") +
      (e ? '<p class="wbErr" id="wb-steps-e">' + esc(e) + "</p>" : "") + "</fieldset>";
  }
  function renderForm() {
    $("wbExamples").innerHTML = '<span class="labSmall">' + T("Start from an example", "从示例开始") + "</span>" +
      EXAMPLES.map(function (x) { return '<button type="button" class="labChip" data-ex="' + x.id + '" aria-pressed="' + (S.ex === x.id) + '">' + esc(L(x.t)) + "</button>"; }).join("") +
      '<button type="button" class="labChip" data-ex="">' + T("Start blank", "从空白开始") + "</button>";
    $("wbForm").innerHTML = FIELDS.map(field).join("") + stepsHtml() +
      '<datalist id="wb-trig">' + TRIGGERS.map(function (t) { return '<option value="' + esc(B(t)) + '">'; }).join("") + "</datalist>" +
      '<div class="wbActions wide"><button type="submit" class="btn pri">' + T("Generate workflow summary", "生成流程总结") + '</button>' +
      '<button type="button" class="btn" data-reset>' + T("Clear form", "清空表单") + "</button>" +
      '<p class="fine">' + T("Your draft is saved in this browser only. Nothing is sent to LAOYU. Leave out confidential company data.",
        "草稿只保存在本浏览器中，不会发送给老鱼。请勿填写公司机密信息。") + "</p></div>";
    renderDiagram();
    renderSummary();
  }
  function stage(k, label, val, empty) {
    return '<li class="' + (val ? "" : "empty") + '"><small>' + esc(label) + "</small><b>" + (val ? esc(val) : esc(empty)) + "</b></li>";
  }
  function toolNames() { return S.tools.map(function (t) { return B(D.tools && D.tools[t]); }).join(", "); }
  function renderDiagram() {
    var dash = T("Not set yet", "尚未填写");
    var out = [S.output, S.notify].filter(Boolean).join(" · ");
    $("wbDiagram").innerHTML =
      '<ol class="wbStages" aria-label="' + esc(T("Workflow diagram", "流程图")) + '">' +
        stage("i", T("Input", "输入"), S.input, dash) + stage("t", T("Trigger", "触发"), S.trigger, dash) +
        stage("p", T("Process", "处理"), S.logic, dash) + stage("a", T("Automation", "自动化"), toolNames(), dash) +
        stage("o", T("Output", "输出"), out, dash) +
      "</ol>" +
      (S.steps.filter(Boolean).length ? '<p class="labSmall">' + T("Your steps", "你的步骤") + '</p><ol class="flowH mini">' + S.steps.filter(Boolean).map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ol>" : "");
  }
  function renderSummary() {
    var box = $("wbSummary");
    if (!summary) { box.hidden = true; box.innerHTML = ""; return; }
    box.hidden = false;
    box.innerHTML = '<div class="wfEx"><div class="wfExTop"><b>' + T("Workflow summary", "流程总结") + '</b><span class="wfBtns">' +
      '<button type="button" class="ansCopy" data-wbcopy>' + T("Copy", "复制") + '</button><button type="button" class="ansCopy" data-wbdl>' + T("Download .md", "下载 .md") + "</button></span></div>" +
      '<pre id="wbOut" tabindex="0"></pre></div><p class="fine">' + T("A plan, not a running automation: nothing has been connected or switched on.", "这是一份计划，不是正在运行的自动化：没有连接或启用任何系统。") + "</p>";
    $("wbOut").textContent = summary;
  }

  /* ---------- summary ---------- */
  function validate() {
    errs = {};
    FIELDS.forEach(function (f) { if (f.req && !S[f.k].trim()) errs[f.k] = B(f.err); });
    if (!S.tools.length) errs.tools = B(FIELDS[4].err);
    if (S.steps.filter(function (s) { return s.trim(); }).length < 2) errs.steps = O("Add at least two workflow steps.", "请至少填写两个流程步骤。");
    return !Object.keys(errs).length;
  }
  function build() {
    var ex = EXAMPLES.filter(function (x) { return x.id === S.ex; })[0];
    var steps = S.steps.map(function (s) { return s.trim(); }).filter(Boolean);
    var line = function (k, v) { return v ? "- **" + k + ":** " + v : ""; };
    var none = O("(not given)", "（未填写）");
    var out = [
      "# " + O("Workflow summary", "流程总结") + (ex ? O(": ", "：") + B(ex.t) : ""),
      "",
      "## " + O("Problem", "问题"), S.problem.trim(),
      "",
      "## " + O("Current manual process", "现在的手工流程"), S.current.trim() || none,
      "",
      "## " + O("Workflow", "流程"),
      line(O("Input", "输入"), S.input.trim()),
      line(O("Trigger", "触发"), S.trigger.trim()),
      line(O("Process", "处理"), S.logic.trim() || none),
      line(O("Automation tools", "自动化工具"), toolNames()),
      line(O("Output", "输出"), S.output.trim()),
      line(O("Notification or action", "通知或行动"), S.notify.trim() || none),
      "",
      "## " + O("Steps", "步骤"),
      steps.map(function (s, i) { return (i + 1) + ". " + s; }).join("\n"),
      "",
      O("Flow: ", "流程：") + steps.join(" → "),
      "",
      "## " + O("Before you build", "动手之前"),
      O("1. Confirm the process with the people who do it today.", "1. 先和现在做这项工作的人确认流程。"),
      O("2. Build it for one line or one team first, and run it alongside the manual way for two weeks.", "2. 先在一条产线或一个团队搭建，与手工方式并行两周。"),
      O("3. Name an owner who fixes it when it breaks.", "3. 指定一位负责人，出问题时由其修复。"),
      O("4. Check your company's data rules before using AI tools or new apps.", "4. 使用 AI 工具或新应用前，先确认公司的数据规定。"),
      "",
      O("Planned with the LAOYU Automation Lab Workflow Builder. This is a plan only; nothing has been automated yet.", "使用老鱼自动化实验室的流程设计器制定。这只是计划，尚未实现任何自动化。")
    ];
    return out.join("\n");
  }

  /* ---------- actions ---------- */
  function useExample(id) {
    var x = EXAMPLES.filter(function (e) { return e.id === id; })[0];
    if (!x) { S = blank(); }
    else {
      S = blank(); S.ex = x.id;
      ["problem", "current", "input", "trigger", "logic", "output", "notify"].forEach(function (k) { S[k] = B(x[k]); });
      S.tools = x.tools.slice(); S.steps = x.steps.map(B);
    }
    errs = {}; summary = ""; save(); renderForm();
  }
  function copy(btn) {
    var text = summary, label = btn.textContent;
    var ok = function () { btn.textContent = T("Copied ✓", "已复制 ✓"); setTimeout(function () { btn.textContent = label; }, 1800); };
    var manual = function () {
      var sel = window.getSelection && window.getSelection();
      if (sel) { var r = document.createRange(); r.selectNodeContents($("wbOut")); sel.removeAllRanges(); sel.addRange(r); }
      btn.textContent = T("Selected: press Ctrl+C", "已选中：按 Ctrl+C 复制");
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, manual); else manual();
  }
  function download() {
    try {
      var url = URL.createObjectURL(new Blob([summary], { type: "text/markdown;charset=utf-8" }));
      var a = document.createElement("a");
      a.href = url; a.download = "workflow-summary.md";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    } catch (e) { var b = document.querySelector("[data-wbcopy]"); if (b) copy(b); }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = $("wbForm");
    if (!form) return;
    load();
    form.addEventListener("input", function (e) {
      var t = e.target;
      if (t.dataset.k) S[t.dataset.k] = t.value;
      else if (t.dataset.step !== undefined) S.steps[+t.dataset.step] = t.value;
      else if (t.dataset.tool) {
        var i = S.tools.indexOf(t.dataset.tool);
        if (t.checked && i < 0) S.tools.push(t.dataset.tool); else if (!t.checked && i > -1) S.tools.splice(i, 1);
      } else return;
      save(); renderDiagram();
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) {
        summary = ""; renderForm();
        var first = form.querySelector('[aria-invalid="true"], .bad input');
        if (first) first.focus();
        return;
      }
      summary = build(); renderForm();
      $("wbSummary").scrollIntoView({ behavior: "smooth", block: "start" });
      $("wbOut").focus({ preventScroll: true });
    });
    document.addEventListener("click", function (e) {
      var t;
      if (!e.target.closest("#builder")) return;
      if ((t = e.target.closest("[data-ex]"))) {
        if (hasDraft() && !window.confirm(O("Replace your current draft?", "要替换当前草稿吗？"))) return;
        useExample(t.dataset.ex); return;
      }
      if (e.target.closest("[data-reset]")) {
        if (hasDraft() && !window.confirm(O("Clear the form and your saved draft?", "清空表单和已保存的草稿？"))) return;
        try { localStorage.removeItem(KEY); } catch (er) {}
        S = blank(); errs = {}; summary = ""; renderForm(); return;
      }
      if (e.target.closest("[data-add]") && S.steps.length < MAX_STEPS) {
        S.steps.push(""); save(); renderForm();
        var inputs = form.querySelectorAll("[data-step]"); inputs[inputs.length - 1].focus(); return;
      }
      if ((t = e.target.closest("[data-del]")) && S.steps.length > 2) {
        S.steps.splice(+t.dataset.del, 1); save(); renderForm(); return;
      }
      if ((t = e.target.closest("[data-move]"))) {
        var p = t.dataset.move.split(":"), i = +p[0], j = i + (+p[1]);
        if (j < 0 || j >= S.steps.length) return;
        var x = S.steps[i]; S.steps[i] = S.steps[j]; S.steps[j] = x;
        save(); renderForm();
        var b = form.querySelector('[data-move="' + j + ":" + p[1] + '"]') || form.querySelector('[data-step="' + j + '"]');
        if (b) b.focus(); return;
      }
      if ((t = e.target.closest("[data-wbcopy]"))) { copy(t); return; }
      if (e.target.closest("[data-wbdl]")) { download(); }
    });
    document.addEventListener("laoyu:lang", function () { if (summary) summary = build(); if (Object.keys(errs).length) validate(); renderForm(); });
    renderForm();
  });
})();
