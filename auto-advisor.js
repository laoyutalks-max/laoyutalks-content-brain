/* =========================================================
   LAOYUTALKS — ASK LAOYU: Automation Advisor (#advisor)
   Five steps: task → current tools → frequency → time spent →
   recommendation (summary, approach, tools, workflow,
   complexity, time savings, steps, risks, related workflows).

   Two modes, chosen by ENDPOINT below:
   · ENDPOINT empty -> RULE-BASED. A keyword engine in this file
     matches the task to one of nine automation patterns. Nothing
     leaves the browser. Every result is labelled "Rule-based".
   · ENDPOINT set   -> LIVE AI. The answers go to the LAOYU server
     proxy (server/ai-lab-worker, path /advise), which holds the AI
     key. No key is ever in this file. If the proxy fails, the page
     falls back to the rule-based result and says so.
   Time savings are always calculated here from the visitor's own
   numbers, never by the AI.

   Request  POST ENDPOINT {lang, task, tools[], frequency, minutes, people}
   Response 200 {advice:{summary, approach, tools[], workflow[5],
                 complexity:"low"|"medium"|"high", steps[], risks[], workflows[]}}
   ========================================================= */
(function () {
  "use strict";

  /* Set to the deployed proxy, e.g. "https://laoyu-ai-lab.<name>.workers.dev/advise" */
  var ENDPOINT = "";
  var TIMEOUT_MS = 60000, MIN_TASK = 15, MAX_TASK = 600;

  var D = window.LAOYU_DATA || {};
  function zh() { return document.documentElement.getAttribute("data-lang") === "zh"; }
  function T(en, cn) { var I = window.LAOYU_I18N; return I && I.pick ? I.pick(en, cn) : (zh() ? cn : en); }
  function L(a) { return a ? T(a[0], a[1]) : ""; }
  function B(a) { return a ? (zh() ? a[1] : a[0]) : ""; }
  function O(en, cn) { return zh() ? cn : en; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function $(id) { return document.getElementById(id); }
  function wf(id) { return (D.workflows || []).filter(function (w) { return w.id === id; })[0]; }

  /* ---------- inputs ---------- */
  var NOW_TOOLS = [
    ["paper", ["Paper or whiteboard", "纸张或白板"]], ["excel", ["Excel files", "Excel 文件"]], ["sheets", ["Google Sheets", "Google Sheets"]],
    ["forms", ["Google Forms", "Google Forms"]], ["email", ["Email", "电子邮件"]], ["chat", ["WhatsApp, WeChat or Teams chat", "WhatsApp、微信或 Teams 聊天"]],
    ["erp", ["ERP or MES system", "ERP 或 MES 系统"]], ["app", ["Another app", "其他应用"]]
  ];
  var FREQ = [
    ["several", ["Several times a day", "每天多次"], 720], ["daily", ["Once a day", "每天一次"], 240],
    ["weekly", ["Once a week", "每周一次"], 48], ["monthly", ["Once a month", "每月一次"], 12]
  ];
  var SAMPLES = [
    ["Every morning I copy shift output and scrap from three line sheets into one report and email it to managers.", "每天早上我要把三条产线表格里的产量和报废数据复制到一份报告里，再发邮件给经理。"],
    ["We chase people every week for overdue actions from the production meeting.", "我们每周都要追着大家完成生产会议上逾期的行动项。"],
    ["Operators fill in paper start-up checklists and someone types them into Excel at the end of the week.", "操作员填写纸质开机点检表，每周末再有人把它们录入 Excel。"],
    ["Overtime and purchase requests are sent by email and approvals get lost.", "加班和采购申请通过邮件发送，审批经常丢失。"]
  ];

  /* ---------- the rule engine: nine patterns ---------- */
  var P = {
    report: { k: ["report", "reporting", "kpi", "dashboard", "summary", "summarise", "summarize", "daily numbers", "weekly numbers", "output", "报告", "报表", "日报", "周报", "看板", "产量"],
      name: ["Automated reporting", "报告自动化"], cx: 2, eff: [0.5, 0.75], tools: ["forms", "sheets", "script", "looker", "gmail"], wf: ["wf-production-report", "wf-mgmt-reporting", "wf-sheets-combine"],
      approach: ["Capture the numbers once at the source, let a sheet do the calculations, and send or publish the report on a schedule instead of building it by hand.", "在源头只录入一次数据，由表格完成计算，并按计划自动发送或发布报告，而不是每次手工制作。"],
      flow: [["Shift or line data", "班次或产线数据"], ["Scheduled time, e.g. 06:30", "定时，例如 06:30"], ["Formulas total and compare with target", "公式汇总并与目标对比"], ["Apps Script or Looker Studio", "Apps Script 或 Looker Studio"], ["Report or dashboard for managers", "给管理者的报告或看板"]],
      steps: [["List the numbers the report really needs and agree one definition for each.", "列出报告真正需要的数据，并为每项约定统一定义。"], ["Collect them in one Google Form or one shared sheet with fixed columns.", "用一张 Google 表单或一张列固定的共享表格收集数据。"], ["Build a Summary tab with formulas for totals, targets and gaps.", "建一个汇总页，用公式计算合计、目标和差距。"], ["Send it on a schedule with Apps Script, or share a Looker Studio dashboard link.", "用 Apps Script 定时发送，或分享 Looker Studio 看板链接。"], ["Run it next to the manual report for one or two weeks, then stop the manual one.", "与手工报告并行一到两周，然后停用手工报告。"]],
      risks: [["If the input data is late or incomplete, the report will be too: show missing entries in the report.", "如果输入数据迟交或不完整，报告也会有问题：在报告中标出缺失的数据。"]] },
    chase: { k: ["remind", "reminder", "follow up", "follow-up", "chase", "chasing", "overdue", "due date", "deadline", "expiry", "expire", "calibration", "提醒", "跟进", "催", "逾期", "到期", "截止", "校准"],
      name: ["Automatic reminders", "自动提醒"], cx: 2, eff: [0.6, 0.85], tools: ["sheets", "script", "gmail"], wf: ["wf-sheets", "wf-due-alerts", "wf-meeting-actions"],
      approach: ["Keep every action or due date in one tracker with an owner, and let a weekly script email each owner only their own open or overdue items.", "把所有行动或到期日集中在一张有负责人的追踪表里，由每周运行的脚本只给每位负责人发送他们自己未完成或逾期的事项。"],
      flow: [["Tracker: item, owner, due date, status", "追踪表：事项、负责人、截止日期、状态"], ["Weekly schedule", "每周定时"], ["Find open and overdue items per owner", "按负责人找出未完成和逾期事项"], ["Apps Script", "Apps Script"], ["One email per owner", "每位负责人一封邮件"]],
      steps: [["Move the actions into one sheet: item, owner email, due date, status.", "把行动项集中到一张表：事项、负责人邮箱、截止日期、状态。"], ["Add a days-late formula and red formatting for overdue rows.", "添加逾期天数公式，逾期行标红。"], ["Paste the reminder script from the library and set a weekly trigger.", "粘贴资源库中的提醒脚本，并设置每周触发。"], ["Agree that the tracker, not chat messages, is where status is updated.", "约定只在追踪表中更新状态，而不是在聊天里。"]],
      risks: [["Reminders only work if owners update the status; otherwise people get emails for finished work.", "提醒有效的前提是负责人会更新状态，否则大家会收到已完成事项的邮件。"]] },
    capture: { k: ["paper", "checklist", "inspection", "inspect", "audit", "6s", "5s", "log sheet", "logbook", "write down", "written", "data entry", "typing", "type into", "key in", "纸", "点检", "检查表", "稽核", "巡检", "录入", "抄写", "手写", "记录表"],
      name: ["Digital data capture", "数字化数据采集"], cx: 1, eff: [0.5, 0.8], tools: ["forms", "sheets", "appsheet"], wf: ["wf-forms-checklist", "wf-downtime-qr", "wf-appsheet-6s"],
      approach: ["Replace the paper step with a short form or a simple phone app at the point of work, so the data is typed once by the person who sees it and lands straight in a sheet.", "在工作现场用一张简短表单或简单的手机应用取代纸质记录，让看到情况的人只录入一次，数据直接进入表格。"],
      flow: [["Check or reading at the machine", "设备旁的点检或读数"], ["When the form is submitted", "提交表单时"], ["Flag anything Not OK or out of range", "标出不合格或超出范围的项目"], ["Google Forms or AppSheet", "Google Forms 或 AppSheet"], ["Live list of results and problems", "实时的结果和问题清单"]],
      steps: [["Take the current paper sheet and remove questions nobody acts on.", "拿出现有纸质表，删掉没人会据此行动的问题。"], ["Build the form with drop-downs instead of free text wherever you can.", "尽量用下拉选项代替自由填写来制作表单。"], ["Put a QR code to the form at each machine or area.", "在每台设备或区域贴上表单二维码。"], ["Highlight failed checks in the sheet and review them daily.", "在表格中高亮不合格项，并每天复核。"], ["Stop printing the paper version once the form is used reliably.", "表单使用稳定后，停止打印纸质版本。"]],
      risks: [["Operators need a phone or shared tablet and network at the machine; check this first.", "操作员在设备旁需要有手机或共用平板以及网络，请先确认。"]] },
    approval: { k: ["approval", "approve", "approver", "request", "requests", "leave", "purchase", "overtime", "sign off", "sign-off", "permission", "审批", "批准", "申请", "请假", "采购", "加班", "签字"],
      name: ["Request and approval flow", "申请与审批流程"], cx: 2, eff: [0.4, 0.7], tools: ["forms", "sheets", "script", "gmail"], wf: ["wf-request-approval", "wf-appsheet"],
      approach: ["Send every request through one form. A script tells the approver and the requester at once, and the sheet becomes the log of what is pending, approved or rejected.", "所有申请都通过同一张表单提交。脚本立即通知审批人和申请人，表格成为待审批、已批准或已驳回的记录。"],
      flow: [["Request form", "申请表单"], ["When a request is submitted", "提交申请时"], ["Route to the right approver, set status Pending", "转给对应审批人，状态设为待审批"], ["Apps Script and email", "Apps Script 和邮件"], ["Approval log with status", "带状态的审批记录"]],
      steps: [["Agree the request types and who approves each one.", "约定申请类型以及每类由谁审批。"], ["Build the form and add a Status column to its sheet.", "建好表单，并在回复表中加入状态列。"], ["Paste the approval script from the library and add an On form submit trigger.", "粘贴资源库中的审批脚本，并添加“提交表单时”触发器。"], ["Review requests pending for more than two days each week.", "每周复查超过两天仍未处理的申请。"]],
      risks: [["Check whether finance or HR rules require a specific system or signature before you replace the current route.", "替换现有流程前，先确认财务或人事规定是否要求使用特定系统或签名。"]] },
    docs: { k: ["certificate", "document", "documents", "letter", "template", "word file", "pdf", "generate", "form filling", "证书", "文档", "文件", "模板", "生成", "信函"],
      name: ["Document generation", "文档自动生成"], cx: 3, eff: [0.6, 0.85], tools: ["sheets", "docs", "script"], wf: ["wf-doc-generation", "wf-ai-email"],
      approach: ["Keep the data in a sheet and the layout in one Google Docs template; a script fills the placeholders and saves a PDF for each row.", "数据放在表格里，版式放在一个 Google Docs 模板里；脚本自动填入占位符，并为每一行生成 PDF。"],
      flow: [["Rows of data", "数据行"], ["When a row is marked Ready", "某行标记为就绪时"], ["Fill the template placeholders", "填入模板占位符"], ["Apps Script", "Apps Script"], ["PDF saved, link written back", "保存 PDF 并回填链接"]],
      steps: [["Build the document once with placeholders such as {{Name}}.", "先做好一次带 {{Name}} 等占位符的文档。"], ["Match the sheet's column headers to the placeholders.", "让表格列标题与占位符一致。"], ["Paste the document script from the library and set the template and folder IDs.", "粘贴资源库中的文档脚本，设置模板和文件夹 ID。"], ["Check the first ten documents by hand.", "人工检查前十份文档。"]],
      risks: [["Controlled documents may need review and approval before release; keep that step.", "受控文件在发布前可能需要审核和批准，请保留这一步。"]] },
    email: { k: ["email", "emails", "e-mail", "reply", "replies", "inbox", "write", "writing", "draft", "邮件", "回复", "收件箱", "写", "起草"],
      name: ["Faster writing and email", "更快的写作与邮件处理"], cx: 1, eff: [0.3, 0.6], tools: ["gmail", "ai"], wf: ["wf-ai-email", "wf-inbox-templates", "wf-meeting-actions"],
      approach: ["Use inbox filters and saved templates for repeat messages, and a tested AI prompt to draft the ones that need thought. You still check and send every message.", "用收件箱过滤规则和保存的模板处理重复邮件，用经过验证的 AI 提示词起草需要思考的邮件。每封邮件仍由你检查后发送。"],
      flow: [["Incoming mail or facts to share", "收到的邮件或要传达的事实"], ["When you need to reply", "需要回复时"], ["Template or AI draft", "模板或 AI 草稿"], ["Gmail templates and an AI chat tool", "Gmail 模板和 AI 对话工具"], ["Checked message, sent by you", "经你核对后发出的邮件"]],
      steps: [["List the five emails you write most often.", "列出你最常写的五类邮件。"], ["Save a template for each fixed one, and an AI prompt for the variable ones.", "固定内容的保存为模板，内容多变的准备 AI 提示词。"], ["Add filters so routine notifications skip the inbox.", "添加过滤规则，让例行通知跳过收件箱。"], ["Check every AI draft for facts, names and promises before sending.", "发送前核对每份 AI 草稿中的事实、人名和承诺。"]],
      risks: [["Do not paste confidential data into an AI tool your company has not approved.", "不要把机密数据粘贴到公司未批准的 AI 工具中。"]] },
    plan: { k: ["manpower", "roster", "rota", "schedule", "scheduling", "shift plan", "allocation", "allocate", "skills", "skill", "training", "absence", "attendance", "人力", "排班", "分配", "技能", "培训", "缺勤", "考勤", "班次"],
      name: ["People and shift planning", "人员与班次规划"], cx: 2, eff: [0.4, 0.7], tools: ["forms", "sheets", "script"], wf: ["wf-manpower", "wf-due-alerts"],
      approach: ["Keep availability and skills in one sheet, report absences through a form, and let formulas show each morning who can cover which machine and where the gaps are.", "把在岗情况和技能集中在一张表里，缺勤通过表单上报，由公式每天早上显示谁能顶哪台设备、哪里有缺口。"],
      flow: [["Absences and skills matrix", "缺勤和技能矩阵"], ["Every morning before the shift", "每天开班前"], ["Match qualified people to each machine", "为每台设备匹配有资格的人员"], ["Google Sheets formulas", "Google Sheets 公式"], ["Allocation view with gaps in red", "缺口标红的分配视图"]],
      steps: [["Build a skills matrix: one row per person, one column per machine.", "建技能矩阵：每人一行，每台设备一列。"], ["Collect absences through a short form.", "通过简短表单收集缺勤信息。"], ["Add COUNTIFS formulas that compare qualified, available people with the number needed.", "用 COUNTIFS 公式比较在岗合格人数与所需人数。"], ["Use the sheet at the start-of-shift meeting.", "在班前会上使用这张表。"]],
      risks: [["Keep personal data to what planning needs, and follow your company's rules on employee data.", "个人数据只保留规划所需的部分，并遵守公司关于员工数据的规定。"]] },
    analysis: { k: ["root cause", "analysis", "analyse", "analyze", "downtime", "defect", "defects", "scrap", "pareto", "trend", "complaint", "原因", "分析", "停机", "缺陷", "报废", "柏拉图", "趋势", "投诉"],
      name: ["Faster problem analysis", "更快的问题分析"], cx: 1, eff: [0.3, 0.5], tools: ["forms", "sheets", "looker", "ai"], wf: ["wf-downtime-qr", "wf-ai-rca"],
      approach: ["Log every event the same way so it can be counted, chart the biggest losses automatically, and use AI as a thinking partner to widen the list of causes before the team checks them at the line.", "用统一的方式记录每次事件以便统计，自动生成最大损失图表，并在团队到现场验证之前，用 AI 作为思考伙伴扩展可能原因的清单。"],
      flow: [["Event log: what, where, how long, reason", "事件记录：什么、在哪、多久、原因"], ["Weekly review", "每周复盘"], ["Pareto of the biggest losses", "最大损失柏拉图"], ["Looker Studio and an AI chat tool", "Looker Studio 和 AI 对话工具"], ["Top causes to verify, with owners", "待验证的主要原因及负责人"]],
      steps: [["Agree a short list of reasons so events can be counted.", "约定一份简短的原因清单，便于统计。"], ["Log events through a form or QR code at the machine.", "在设备旁通过表单或二维码记录事件。"], ["Chart minutes or count by reason every week.", "每周按原因统计分钟数或次数。"], ["Use AI to list possible causes, then verify each one with data at the line.", "用 AI 列出可能原因，再到现场用数据逐一验证。"]],
      risks: [["AI suggestions are hypotheses, not root causes; verify every one with evidence.", "AI 给出的只是假设，不是根本原因；每一条都要用证据验证。"]] },
    combine: { k: ["combine", "merge", "copy paste", "copy and paste", "copying", "consolidate", "several files", "multiple sheets", "different sheets", "three sheets", "from each line", "合并", "复制", "粘贴", "多个文件", "多张表"],
      name: ["Combining data automatically", "自动合并数据"], cx: 1, eff: [0.7, 0.9], tools: ["sheets"], wf: ["wf-sheets-combine", "wf-production-report"],
      approach: ["Give every team sheet the same columns and let a master sheet pull them together with IMPORTRANGE and QUERY, so nobody copies and pastes.", "让各团队表格使用相同的列，由总表用 IMPORTRANGE 和 QUERY 自动汇总，不再需要复制粘贴。"],
      flow: [["Team or line sheets", "各团队或产线表格"], ["Whenever a source sheet changes", "源表格有变化时"], ["Stack and clean the rows", "拼接并整理数据行"], ["IMPORTRANGE and QUERY", "IMPORTRANGE 和 QUERY"], ["Always-current master view", "始终最新的总表视图"]],
      steps: [["Agree one column layout for all source sheets.", "为所有源表格约定统一的列结构。"], ["Connect each sheet once with IMPORTRANGE.", "用 IMPORTRANGE 逐一连接各表格。"], ["Stack and clean them with QUERY.", "用 QUERY 拼接并整理。"], ["Build charts on the combined range only.", "只在合并后的区域上制作图表。"]],
      risks: [["If a team changes its column order, the combined view breaks; protect the header rows.", "如果某个团队改变了列顺序，合并视图就会出错；请保护标题行。"]] }
  };
  var GENERIC = { name: ["Start with clean data capture", "先从规范的数据采集开始"], cx: 1, eff: [0.3, 0.5], tools: ["forms", "sheets"], wf: ["wf-forms-checklist", "wf-sheets"],
    approach: ["The task did not match a known pattern, so start with the step that helps almost every automation: capture the data once, in a fixed format, in a form or shared sheet.", "这项任务没有匹配到已知的模式，所以先做几乎所有自动化都需要的一步：用表单或共享表格，按固定格式只录入一次数据。"],
    flow: [["The information you handle today", "你现在处理的信息"], ["When it is created", "信息产生时"], ["Store it in fixed columns", "按固定列保存"], ["Google Forms and Sheets", "Google Forms 和 Sheets"], ["One clean list you can build on", "一份可继续扩展的规范清单"]],
    steps: [["Write down the steps of the task as it is done today.", "写下这项任务目前的操作步骤。"], ["Mark which steps copy, type or move information.", "标出哪些步骤是在复制、录入或搬运信息。"], ["Capture that information once in a form or shared sheet.", "用表单或共享表格只录入一次这些信息。"], ["Come back with a clearer description: what goes in, and what should come out.", "再回来更清楚地描述：输入什么，期望输出什么。"]],
    risks: [["This is a general starting point; describe the input and the output to get a more specific suggestion.", "这只是通用的起点；描述清楚输入和输出，可以得到更具体的建议。"]] };

  var CX = { 1: { k: "low", t: ["Low", "低"], d: ["A few hours. No coding: forms, formulas or settings.", "几个小时。无需编程：表单、公式或设置即可。"] },
             2: { k: "medium", t: ["Medium", "中"], d: ["About a day. Some formulas or a short script you paste in.", "大约一天。需要一些公式或粘贴一段简短脚本。"] },
             3: { k: "high", t: ["High", "高"], d: ["Several days. Scripts or connections to other systems; may need IT support.", "需要几天。涉及脚本或与其他系统连接，可能需要 IT 支持。"] } };

  function match(text) {
    var t = " " + String(text).toLowerCase() + " ", scores = [];
    Object.keys(P).forEach(function (id) {
      var s = 0;
      P[id].k.forEach(function (w) { if (t.indexOf(w) > -1) s += w.length > 6 ? 2 : 1; });
      if (s) scores.push([id, s]);
    });
    scores.sort(function (a, b) { return b[1] - a[1]; });
    return scores;
  }

  /* ---------- state ---------- */
  var S = { step: 1, task: "", now: [], freq: "", minutes: "", people: "1" }, err = "", result = null, busy = false, note = "";

  function hours() {
    var f = FREQ.filter(function (x) { return x[0] === S.freq; })[0];
    return f ? f[2] * (+S.minutes / 60) * (+S.people) : 0;
  }
  function round(h) { return h >= 100 ? Math.round(h / 10) * 10 : h >= 20 ? Math.round(h / 5) * 5 : Math.round(h); }

  function ruleAdvice() {
    var m = match(S.task), main = m.length ? P[m[0][0]] : GENERIC, second = m.length > 1 && m[1][1] >= m[0][1] - 1 ? P[m[1][0]] : null;
    var cx = main.cx + (S.now.indexOf("erp") > -1 ? 1 : 0) + (+S.people > 10 ? 1 : 0);
    cx = Math.min(3, cx);
    var tools = main.tools.slice();
    if (S.now.indexOf("paper") > -1 && tools.indexOf("forms") < 0) tools.unshift("forms");
    var steps = main.steps.slice();
    if (S.now.indexOf("paper") > -1 && m.length && m[0][0] !== "capture") steps.unshift(["First replace the paper step with a form: nothing else can be automated until the data is digital.", "先用表单取代纸质环节：数据数字化之前，其他环节都无法自动化。"]);
    var risks = main.risks.slice();
    if (S.now.indexOf("erp") > -1) risks.push(["Getting data out of an ERP or MES may need an export or IT support; check this before you start.", "从 ERP 或 MES 取数可能需要导出功能或 IT 支持，开始前请先确认。"]);
    if (S.now.indexOf("excel") > -1) risks.push(["If your company uses Microsoft 365, the same pattern works with Microsoft Forms, Excel Online and Power Automate.", "如果公司使用 Microsoft 365，同样的思路可以用 Microsoft Forms、Excel Online 和 Power Automate 实现。"]);
    if (S.now.indexOf("chat") > -1) risks.push(["Information in chat apps is hard to count or search; capture it in a form instead.", "聊天应用中的信息难以统计和搜索，请改用表单收集。"]);
    risks.push(["Fix the process before automating it, and name an owner who maintains the automation.", "自动化之前先理顺流程，并指定一位负责维护的人。"]);
    var wfs = main.wf.slice();
    if (second) second.wf.forEach(function (id) { if (wfs.indexOf(id) < 0 && wfs.length < 4) wfs.push(id); });
    return { mode: "rule", matched: !!m.length, name: main.name, second: second ? second.name : null, approach: main.approach, tools: tools, flow: main.flow,
      cx: CX[cx], eff: main.eff, steps: steps, risks: risks, wf: wfs };
  }

  /* live answers are plain strings; turn them into the same shape */
  function liveAdvice(a) {
    var cxMap = { low: 1, medium: 2, high: 3 }, r = ruleAdvice();
    var pair = function (s) { return [String(s), String(s)]; };
    var strs = function (v, n) { return Array.isArray(v) ? v.filter(function (x) { return typeof x === "string" && x.trim(); }).slice(0, n) : []; };
    return { mode: "live", matched: true, name: pair(a.summary || ""), second: null, approach: pair(a.approach || ""),
      toolsText: strs(a.tools, 6), tools: [], flow: strs(a.workflow, 5).map(pair), cx: CX[cxMap[a.complexity] || 2], eff: r.eff,
      steps: strs(a.steps, 8).map(pair), risks: strs(a.risks, 6).map(pair), wf: strs(a.workflows, 4).filter(wf) };
  }

  /* ---------- rendering ---------- */
  var STEPS = [["Task", "任务"], ["Tools", "工具"], ["Frequency", "频率"], ["Time", "时间"], ["Recommendation", "建议"]];
  function progress() {
    return '<ol class="advProg" aria-label="' + esc(T("Progress", "进度")) + '">' + STEPS.map(function (s, i) {
      var n = i + 1, st = n < S.step ? "done" : n === S.step ? "now" : "";
      return '<li class="' + st + '"' + (st === "now" ? ' aria-current="step"' : "") + "><span>" + n + "</span>" + L(s) + "</li>";
    }).join("") + "</ol>";
  }
  function nav(nextLabel) {
    return '<div class="advNav">' + (S.step > 1 ? '<button type="button" class="btn" data-adv="back">' + T("← Back", "← 上一步") + "</button>" : "<span></span>") +
      '<button type="submit" class="btn pri">' + nextLabel + "</button></div>";
  }
  function errHtml() { return err ? '<p class="wbErr" id="adv-e" role="alert">' + esc(err) + "</p>" : ""; }

  function stepHtml() {
    var inv = err ? ' aria-invalid="true" aria-describedby="adv-e"' : "";
    if (S.step === 1) {
      return '<label class="advQ" for="adv-task">' + T("1. Describe the repetitive task", "1. 描述这项重复性任务") + "</label>" +
        '<p class="fine">' + T("What do you do, with what information, and what comes out at the end? Leave out names and confidential details.", "你做什么、用到哪些信息、最后产出什么？请不要填写人名和机密信息。") + "</p>" +
        '<textarea id="adv-task" rows="4" maxlength="' + MAX_TASK + '"' + inv + ">" + esc(S.task) + "</textarea>" +
        '<div class="advCount"><span id="adv-n">' + S.task.length + "</span> / " + MAX_TASK + "</div>" + errHtml() +
        '<div class="wbExamples"><span class="labSmall">' + T("Or try an example", "或试试示例") + "</span>" +
        SAMPLES.map(function (s, i) { return '<button type="button" class="labChip" data-sample="' + i + '">' + esc(B(s).slice(0, 48)) + "…</button>"; }).join("") + "</div>" +
        nav(T("Next →", "下一步 →"));
    }
    if (S.step === 2) {
      return '<fieldset class="advSet"><legend class="advQ">' + T("2. Which tools do you use for it today?", "2. 你现在用什么工具完成它？") + "</legend>" +
        '<p class="fine">' + T("Pick all that apply, or none.", "可多选，也可不选。") + '</p><div class="wbChecks">' +
        NOW_TOOLS.map(function (t) { return '<label class="wbCheck"><input type="checkbox" data-now="' + t[0] + '"' + (S.now.indexOf(t[0]) > -1 ? " checked" : "") + "><span>" + L(t[1]) + "</span></label>"; }).join("") +
        "</div></fieldset>" + nav(T("Next →", "下一步 →"));
    }
    if (S.step === 3) {
      return '<fieldset class="advSet"' + (err ? ' aria-describedby="adv-e"' : "") + '><legend class="advQ">' + T("3. How often is it done?", "3. 多久做一次？") + '</legend><div class="advRadios">' +
        FREQ.map(function (f) { return '<label class="wbCheck"><input type="radio" name="adv-freq" value="' + f[0] + '"' + (S.freq === f[0] ? " checked" : "") + "><span>" + L(f[1]) + "</span></label>"; }).join("") +
        "</div></fieldset>" + errHtml() + nav(T("Next →", "下一步 →"));
    }
    if (S.step === 4) {
      return '<p class="advQ">' + T("4. How much time does it take?", "4. 每次花多少时间？") + '</p><div class="advNums">' +
        '<label for="adv-min">' + T("Minutes each time", "每次分钟数") + '<input id="adv-min" type="number" inputmode="numeric" min="1" max="480" step="1" value="' + esc(S.minutes) + '"' + inv + "></label>" +
        '<label for="adv-ppl">' + T("People who do it", "执行人数") + '<input id="adv-ppl" type="number" inputmode="numeric" min="1" max="1000" step="1" value="' + esc(S.people) + '"></label></div>' +
        errHtml() + nav(T("Get my recommendation", "获取建议"));
    }
    return "";
  }

  function section(title, body) { return '<section class="wfPart"><h3>' + title + "</h3>" + body + "</section>"; }
  function list(items, tag) { return "<" + tag + ">" + items.map(function (x) { return "<li>" + esc(L(x)) + "</li>"; }).join("") + "</" + tag + ">"; }
  function savings() {
    var h = hours(), lo = round(h * result.eff[0]), hi = round(h * result.eff[1]);
    return { h: round(h), lo: lo, hi: hi };
  }
  function resultHtml() {
    var r = result, sv = savings(), f = FREQ.filter(function (x) { return x[0] === S.freq; })[0];
    var badge = r.mode === "live" ? '<span class="chip g">' + T("Live AI", "实时 AI") + "</span>"
      : '<span class="chip a">' + T("Rule-based recommendation · not live AI", "基于规则的建议 · 非实时 AI") + "</span>";
    var stages = [["Input", "输入"], ["Trigger", "触发"], ["Process", "处理"], ["Automation", "自动化"], ["Output", "输出"]];
    var toolsHtml = r.toolsText ? r.toolsText.map(function (t) { return '<span class="chip">' + esc(t) + "</span>"; }).join("")
      : r.tools.map(function (t) { return '<span class="chip">' + esc(L(D.tools && D.tools[t])) + "</span>"; }).join("");
    var wfs = r.wf.map(wf).filter(Boolean);
    return '<div class="advRes" id="advRes" tabindex="-1">' +
      '<div class="ansTop">' + badge + '<span class="wfBtns"><button type="button" class="ansCopy" data-adv="copy">' + T("Copy", "复制") + '</button><button type="button" class="ansCopy" data-adv="restart">' + T("Start again", "重新开始") + "</button></span></div>" +
      (note ? '<p class="notice">' + esc(note) + "</p>" : "") +
      "<h3 class=\"advTitle\">" + esc(L(r.name)) + (r.second ? ' <small class="muted">' + T("+ also: ", "+ 另外：") + esc(L(r.second)) + "</small>" : "") + "</h3>" +
      section(T("Problem summary", "问题概述"), "<p>" + T("You spend about ", "你大约花 ") + esc(S.minutes) + T(" minutes, ", " 分钟，") + esc(L(f[1])).toLowerCase() + T(", on this task", "，处理这项任务") +
        (+S.people > 1 ? T(" (" + S.people + " people)", "（" + S.people + " 人）") : "") + T(": about ", "：每年约 ") + sv.h.toLocaleString() + T(" hours a year.", " 小时。") + "</p><blockquote>" + esc(S.task) + "</blockquote>") +
      section(T("Recommended approach", "推荐方案"), "<p>" + esc(L(r.approach)) + "</p>") +
      section(T("Suggested tools", "建议工具"), '<div class="chips">' + toolsHtml + "</div>") +
      section(T("Proposed workflow", "建议流程"), '<ol class="wbStages advStages">' + r.flow.map(function (x, i) {
        return "<li><small>" + (stages[i] ? L(stages[i]) : i + 1) + "</small><b>" + esc(L(x)) + "</b></li>"; }).join("") + "</ol>") +
      '<div class="advTwo">' +
        section(T("Implementation complexity", "实施难度"), '<p><b class="cx ' + r.cx.k + '">' + L(r.cx.t) + "</b> · " + L(r.cx.d) + "</p>") +
        section(T("Estimated time savings", "预计节省时间"), "<p><b class=\"advBig\">" + sv.lo.toLocaleString() + "–" + sv.hi.toLocaleString() + T(" hours a year", " 小时 / 年") + "</b></p>" +
          '<p class="fine">' + T("Estimate: your " + sv.h + " hours a year × " + Math.round(r.eff[0] * 100) + "–" + Math.round(r.eff[1] * 100) + "% typically removed by this kind of automation. Not a guarantee.",
            "估算：你每年的 " + sv.h + " 小时 × 此类自动化通常可节省的 " + Math.round(r.eff[0] * 100) + "–" + Math.round(r.eff[1] * 100) + "%。不作保证。") + "</p>") +
      "</div>" +
      section(T("Implementation steps", "实施步骤"), list(r.steps, "ol")) +
      section(T("Risks and limitations", "风险与局限"), list(r.risks, "ul")) +
      (wfs.length ? section(T("Workflows in the library", "资源库中的相关流程"), '<div class="wfRel">' + wfs.map(function (w) {
        return '<a href="#' + w.id + '"><b>' + esc(L(w.title)) + "</b><span>" + esc(L(w.problem)) + "</span></a>"; }).join("") + "</div>") : "") +
      '<div class="advNav advNext"><button type="button" class="btn pri" data-adv="builder">' + T("Open in Workflow Builder", "在流程设计器中打开") + '</button>' +
      '<button type="button" class="btn" data-adv="roi">' + T("Refine in ROI Calculator", "在投资回报计算器中细化") + "</button></div>" +
      '<p class="fine">' + (r.mode === "live" ? T("Generated by AI from your answers. Check it against your own process before acting on it.", "由 AI 根据你的回答生成。采取行动前请对照你自己的流程核实。")
        : T("Sample recommendation from built-in keyword rules, written by LAOYU. Nothing you typed left your browser. Check it against your own process.", "这是老鱼编写的内置关键词规则给出的示例建议。你输入的内容没有离开浏览器。请对照你自己的流程核实。")) + "</p></div>";
  }

  function render(focus) {
    var box = $("advBox");
    if (!box) return;
    var mode = ENDPOINT ? '<span class="chip g">' + T("Live AI", "实时 AI") + "</span>" : '<span class="chip a">' + T("Rule-based · not live AI", "基于规则 · 非实时 AI") + "</span>";
    if (busy) { box.innerHTML = progress() + '<div class="ansLoading" role="status"><span class="dots"><i></i><i></i><i></i></span>' + T("Preparing your recommendation…", "正在生成建议…") + "</div>"; return; }
    if (S.step === 5 && result) { box.innerHTML = progress() + resultHtml(); if (focus) $("advRes").focus(); return; }
    box.innerHTML = progress() + '<form class="advForm" id="advForm" novalidate><div class="advMode">' + mode + "</div>" + stepHtml() + "</form>";
    if (focus) { var f = box.querySelector("textarea, input"); if (f) f.focus(); }
  }

  /* ---------- flow ---------- */
  function validateStep() {
    err = "";
    if (S.step === 1) {
      var t = S.task.trim();
      if (!t) err = O("Describe the task first.", "请先描述任务。");
      else if (t.length < MIN_TASK) err = O("Add a little more detail (at least " + MIN_TASK + " characters).", "请再多写一些细节（至少 " + MIN_TASK + " 个字符）。");
    }
    if (S.step === 3 && !S.freq) err = O("Choose how often the task is done.", "请选择任务的频率。");
    if (S.step === 4) {
      var m = Number(S.minutes), p = Number(S.people);
      if (!S.minutes || !isFinite(m) || m < 1 || m > 480 || Math.floor(m) !== m) err = O("Enter the minutes as a whole number from 1 to 480.", "请输入 1 到 480 之间的整数分钟数。");
      else if (!S.people || !isFinite(p) || p < 1 || p > 1000 || Math.floor(p) !== p) err = O("Enter the number of people as a whole number from 1 to 1000.", "请输入 1 到 1000 之间的整数人数。");
    }
    return !err;
  }
  function finish() {
    note = "";
    if (!ENDPOINT) { result = ruleAdvice(); S.step = 5; render(true); return; }
    busy = true; render();
    var ctrl = window.AbortController ? new AbortController() : null, timer = ctrl ? setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS) : null;
    var fallback = function (msg) {
      busy = false; result = ruleAdvice(); S.step = 5;
      note = msg || O("Live AI is not available right now, so this is the rule-based recommendation.", "实时 AI 暂时不可用，以下为基于规则的建议。");
      render(true);
    };
    fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, signal: ctrl ? ctrl.signal : undefined,
      body: JSON.stringify({ lang: zh() ? "zh" : "en", task: S.task.trim(), tools: S.now, frequency: S.freq, minutes: +S.minutes, people: +S.people }) })
      .then(function (res) { return res.json().then(function (j) { return { ok: res.ok, j: j }; }); })
      .then(function (x) {
        if (timer) clearTimeout(timer);
        if (!x.ok || !x.j || !x.j.advice || typeof x.j.advice.summary !== "string") return fallback(x.j && x.j.error && x.j.error.code === "declined" ? O("The AI could not help with this request, so this is the rule-based recommendation.", "AI 无法处理此请求，以下为基于规则的建议。") : null);
        busy = false; result = liveAdvice(x.j.advice); S.step = 5; render(true);
      })
      .catch(function () { if (timer) clearTimeout(timer); fallback(); });
  }

  function plainText() {
    var r = result, sv = savings(), one = function (a) { return B(a); };
    var lines = [O("ASK LAOYU – Automation Advisor", "问老鱼 – 自动化顾问") + " (" + (r.mode === "live" ? O("live AI", "实时 AI") : O("rule-based, not live AI", "基于规则，非实时 AI")) + ")", "",
      O("Task: ", "任务：") + S.task.trim(), "", O("Recommendation: ", "建议：") + one(r.name), one(r.approach), "",
      O("Suggested tools: ", "建议工具：") + (r.toolsText || r.tools.map(function (t) { return one(D.tools && D.tools[t]); })).join(", "),
      O("Workflow: ", "流程：") + r.flow.map(one).join(" → "),
      O("Complexity: ", "难度：") + one(r.cx.t) + " – " + one(r.cx.d),
      O("Estimated time savings: ", "预计节省时间：") + sv.lo + "–" + sv.hi + O(" hours a year (estimate)", " 小时 / 年（估算）"), "",
      O("Steps:", "步骤：")].concat(r.steps.map(function (s, i) { return (i + 1) + ". " + one(s); }), ["", O("Risks and limitations:", "风险与局限：")], r.risks.map(function (s) { return "- " + one(s); }));
    return lines.join("\n");
  }
  function copy(btn) {
    var t = plainText(), label = btn.textContent;
    var done = function () { btn.textContent = O("Copied ✓", "已复制 ✓"); setTimeout(function () { btn.textContent = label; }, 1800); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, function () { window.prompt(O("Copy the recommendation:", "复制建议："), t); });
    else window.prompt(O("Copy the recommendation:", "复制建议："), t);
  }
  function toBuilder() {
    var r = result, one = function (a) { return B(a); };
    var map = { sheets: "sheets", forms: "forms", email: "gmail", chat: "chat", app: "appsheet" };
    var tools = r.tools.slice();
    if (!tools.length) S.now.forEach(function (t) { if (map[t] && tools.indexOf(map[t]) < 0) tools.push(map[t]); });
    var f = FREQ.filter(function (x) { return x[0] === S.freq; })[0];
    if (window.LAOYU_BUILDER) window.LAOYU_BUILDER.prefill({
      problem: S.task.trim().slice(0, 400), current: O("Done by hand, ", "目前手工完成，") + one(f[1]).toLowerCase() + O(", about " + S.minutes + " minutes each time.", "，每次约 " + S.minutes + " 分钟。"),
      input: one(r.flow[0] || ["", ""]).slice(0, 160), trigger: one(r.flow[1] || ["", ""]).slice(0, 160), logic: one(r.flow[2] || ["", ""]).slice(0, 400),
      output: one(r.flow[4] || ["", ""]).slice(0, 160), notify: "", tools: tools, steps: r.flow.map(one).map(function (s) { return s.slice(0, 60); })
    });
  }
  function toRoi() {
    var r = result, ppl = +S.people, wk = hours() / 48 / ppl;
    wk = Math.min(80, Math.max(0.25, Math.round(wk * 4) / 4));
    var eff = Math.round(((r.eff[0] + r.eff[1]) / 2) * 20) * 5;
    if (window.LAOYU_ROI) window.LAOYU_ROI.set({ emp: String(ppl), hrs: String(wk), weeks: "48", eff: String(eff) });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var box = $("advBox");
    if (!box) return;
    box.addEventListener("input", function (e) {
      var t = e.target;
      if (t.id === "adv-task") { S.task = t.value.slice(0, MAX_TASK); var n = $("adv-n"); if (n) n.textContent = S.task.length; }
      else if (t.id === "adv-min") S.minutes = t.value.trim();
      else if (t.id === "adv-ppl") S.people = t.value.trim();
      else if (t.dataset.now) { var i = S.now.indexOf(t.dataset.now); if (t.checked && i < 0) S.now.push(t.dataset.now); else if (!t.checked && i > -1) S.now.splice(i, 1); }
      else if (t.name === "adv-freq") S.freq = t.value;
    });
    box.addEventListener("change", function (e) { if (e.target.name === "adv-freq") S.freq = e.target.value; });
    box.addEventListener("submit", function (e) {
      e.preventDefault();
      if (busy) return;
      if (!validateStep()) { render(true); return; }
      if (S.step < 4) { S.step++; render(true); } else finish();
    });
    box.addEventListener("click", function (e) {
      var t = e.target.closest("[data-adv], [data-sample]");
      if (!t || busy) return;
      if (t.dataset.sample !== undefined) { S.task = B(SAMPLES[+t.dataset.sample]); err = ""; render(true); return; }
      var a = t.dataset.adv;
      if (a === "back") { err = ""; S.step = Math.max(1, S.step - 1); render(true); }
      else if (a === "restart") { S = { step: 1, task: "", now: [], freq: "", minutes: "", people: "1" }; result = null; err = ""; note = ""; render(true); }
      else if (a === "copy") copy(t);
      else if (a === "builder") toBuilder();
      else if (a === "roi") toRoi();
    });
    document.addEventListener("laoyu:lang", function () { if (err) validateStep(); render(false); });
    render(false);
  });

  window.LAOYU_ADVISOR = { setEndpoint: function (u) { ENDPOINT = String(u || ""); render(false); }, match: match };
})();
