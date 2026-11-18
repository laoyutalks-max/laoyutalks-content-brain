/* =========================================================
   LAOYUTALKS — Automation Lab: manufacturing case studies (#cases)
   Six illustrative cases. They are composite scenarios written
   by LAOYU from common shop-floor situations: no company names,
   no confidential data and no measured results. "What to expect"
   describes the kind of change, never a number.
   Each case has a starter sheet (.csv, built in the browser) and
   links to library workflows and LAOYUTALKS resources.
   Shareable links: automation.html#cs-6s-app
   ========================================================= */
(function () {
  "use strict";
  var D = window.LAOYU_DATA || {};
  function zh() { return document.documentElement.getAttribute("data-lang") === "zh"; }
  function T(en, cn) { var I = window.LAOYU_I18N; return I && I.pick ? I.pick(en, cn) : (zh() ? cn : en); }
  function L(a) { return a ? T(a[0], a[1]) : ""; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function $(id) { return document.getElementById(id); }
  function wf(id) { return (D.workflows || []).filter(function (w) { return w.id === id; })[0]; }
  function res(id) { return (D.resources || []).filter(function (r) { return r.id === id; })[0]; }

  var CASES = [
    { id: "cs-production-dashboard", tools: ["forms", "sheets", "script", "looker"],
      t: ["Daily Production Dashboard", "每日生产看板"],
      ctx: ["A plant with three filling lines and two shifts, where each supervisor kept their own spreadsheet.", "一家有三条灌装线、两个班次的工厂，每位主管都有自己的表格。"],
      problem: ["The morning meeting started with people reading numbers aloud from different files. Nobody saw the same figures, and losses were discussed a day late.", "早会一开始就是各人从不同文件里念数字。大家看到的数据不一致，损失总要晚一天才被讨论。"],
      manual: [["Supervisors wrote output, scrap and stops on a paper shift sheet.", "主管把产量、报废和停机写在纸质班次表上。"], ["After the shift they typed it into their own spreadsheet.", "下班后再录入各自的表格。"], ["A planner copied the three files into one summary before the meeting.", "计划员在会前把三份文件复制到一份汇总表里。"]],
      auto: ["One short Google Form per shift feeds a single sheet. Formulas calculate achievement and scrap by line, and a Looker Studio dashboard is open on the meeting-room screen.", "每个班次填写一张简短的 Google 表单，数据进入同一张表格。公式按产线计算达成率和报废率，会议室屏幕上打开 Looker Studio 看板。"],
      approach: [["Agree the five numbers the meeting really uses, with one definition each.", "约定早会真正使用的五个数据，每个只有一种定义。"], ["Build the form and run it next to the paper sheet for two weeks.", "建好表单，与纸质表并行两周。"], ["Add the Summary tab and the dashboard, then the morning email from the library script.", "加上汇总页和看板，再用资源库中的脚本发送早间邮件。"], ["Retire the paper sheet and the copied summary.", "停用纸质表和手工汇总。"]],
      expect: [["One set of numbers that everyone sees at the same time.", "所有人同时看到同一组数据。"], ["The meeting moves from reading numbers to discussing the biggest loss.", "会议从念数字转为讨论最大的损失。"], ["The planner's copy-and-paste step disappears.", "计划员的复制粘贴工作不再需要。"]],
      lessons: [["Agree the definitions first; most arguments were about what \"scrap\" meant.", "先统一定义；大部分争论都在于“报废”指什么。"], ["Show missing entries on the dashboard, so gaps are visible rather than hidden.", "在看板上显示缺失的录入，让缺口一目了然而不是被掩盖。"], ["Keep the form short: every extra field lowers how often it is filled in.", "表单要短：每多一个字段，填写率就会下降。"]],
      next: [["Add downtime reasons by QR code at each machine.", "在每台设备上用二维码记录停机原因。"], ["Add a weekly trend page for the management review.", "为管理评审增加每周趋势页面。"], ["Link the biggest loss to an action in the weekly tracker.", "把最大损失与每周追踪表中的行动关联起来。"]],
      wf: ["wf-production-report", "wf-sheets-combine", "wf-downtime-qr"], rel: ["production-kpi-dashboard", "oee-loss-calculator", "demo-daily-report"],
      csv: { file: "starter-daily-production.csv", cols: ["Date", "Shift", "Line", "Target", "Actual", "Scrap", "Downtime min", "Main reason"],
        rows: [["2026-11-03", "Day", "Line 1", "4800", "4512", "81", "35", "Label jam"], ["2026-11-03", "Day", "Line 2", "3600", "3655", "33", "10", "Changeover"], ["2026-11-03", "Night", "Line 3", "2400", "1980", "61", "95", "Filler jams"]] } },

    { id: "cs-resource-dashboard", tools: ["forms", "sheets"],
      t: ["Resource Management Dashboard", "资源管理看板"],
      ctx: ["An assembly area of about forty operators across six workstations, with frequent short-notice absences.", "一个约四十名操作员、六个工位的装配区，临时缺勤频繁。"],
      problem: ["Each morning the team leader rebuilt the plan from memory and phone calls. Gaps were found after the shift had started, and the same few people were always moved.", "每天早上组长都要凭记忆和电话重新排班。缺口往往在开班后才发现，被调动的总是那几个人。"],
      manual: [["Absences arrived by phone, text and word of mouth.", "缺勤通过电话、短信和口头传达。"], ["The plan was drawn on a whiteboard at the start of the shift.", "班前在白板上画出人员安排。"], ["Overtime and cover were agreed person by person.", "加班和顶岗逐人商量。"]],
      auto: ["Absences come in through one form. A sheet combines them with the skills matrix and shows, per workstation, the people needed, the qualified people present and the gap.", "缺勤通过一张表单上报。表格把缺勤与技能矩阵结合，按工位显示所需人数、在岗合格人数和缺口。"],
      approach: [["Build the skills matrix first: one row per person, one column per workstation.", "先建技能矩阵：每人一行，每个工位一列。"], ["Replace phone calls with an absence form and a QR code on the notice board.", "用缺勤表单和公告板上的二维码取代电话通知。"], ["Add the Today view with COUNTIFS and red gaps.", "用 COUNTIFS 建立“今日”视图，缺口标红。"], ["Review cover and overtime weekly to decide who to cross-train.", "每周复盘顶岗和加班情况，决定培训谁。"]],
      expect: [["Gaps are known before the shift starts.", "开班前就知道缺口在哪里。"], ["Only qualified people are moved to a workstation.", "只有合格人员会被调到某个工位。"], ["A clear list of where cross-training would help most.", "清楚显示哪里最需要交叉培训。"]],
      lessons: [["The skills matrix is the hard part; keep it current or the view is wrong.", "技能矩阵最难维护；不保持更新，视图就会出错。"], ["Make the absence form quicker than a phone call, or people will keep calling.", "缺勤表单要比打电话更快，否则大家还会继续打电话。"], ["Keep personal data to what planning needs.", "个人数据只保留规划所需的部分。"]],
      next: [["Add planned leave a week ahead.", "提前一周加入计划休假。"], ["Track cover and overtime by person to spread the load fairly.", "按人统计顶岗和加班，让负担更公平。"], ["Link expiring skills to the training matrix.", "把即将到期的技能资格与培训矩阵关联。"]],
      wf: ["wf-manpower", "wf-due-alerts"], rel: ["manpower-gap-calculator", "skills-matrix", "supervisor-daily-planner"],
      csv: { file: "starter-resource-plan.csv", cols: ["Date", "Shift", "Workstation", "People needed", "Qualified present", "Gap", "Cover from", "Overtime h"],
        rows: [["2026-11-13", "Day", "WS1 Pre-assembly", "6", "6", "0", "", "0"], ["2026-11-13", "Day", "WS4 Testing", "4", "3", "1", "WS2", "0"], ["2026-11-13", "Day", "WS6 Packing", "5", "4", "1", "", "4"]] } },

    { id: "cs-6s-app", tools: ["appsheet", "sheets", "gmail"],
      t: ["6S Audit Mobile Application", "6S 稽核手机应用"],
      ctx: ["A plant running weekly 6S audits in eight areas, scored on paper by rotating auditors.", "一家工厂每周对八个区域进行 6S 稽核，由轮值稽核员在纸上打分。"],
      problem: ["Scores were filed but rarely compared, photos stayed on personal phones, and findings from one audit were often found again the next month.", "分数被归档却很少比较，照片留在个人手机里，一次稽核发现的问题下个月往往又出现。"],
      manual: [["The auditor scored each S on a paper form.", "稽核员在纸质表上为每个 S 打分。"], ["Photos were sent in a chat group.", "照片发在聊天群里。"], ["A coordinator typed the scores and findings into a spreadsheet at month end.", "协调员月底把分数和问题录入表格。"]],
      auto: ["An AppSheet app on the auditor's phone records the scores, photos and findings in one place. Each finding gets an owner and due date, and the owner is emailed at once.", "稽核员用手机上的 AppSheet 应用在同一处记录分数、照片和问题。每个问题都有负责人和截止日期，并立即通过邮件通知负责人。"],
      approach: [["Set up the Audits and Findings sheets.", "建立稽核表和问题表。"], ["Generate the app and keep the form to one screen per audit.", "生成应用，每次稽核的表单控制在一个屏幕内。"], ["Add the bot that emails the owner of each new finding.", "添加机器人，给每个新问题的负责人发送邮件。"], ["Review open findings by area at the weekly 6S walk.", "在每周 6S 巡查时按区域复核未关闭问题。"]],
      expect: [["Scores and photos in one place, comparable week by week.", "分数和照片集中在一处，可以逐周比较。"], ["Every finding has an owner and a date.", "每个问题都有负责人和日期。"], ["Repeat findings become visible instead of being rediscovered.", "重复出现的问题变得可见，而不是被重新发现。"]],
      lessons: [["Agree what each score means with photos of good and bad examples.", "用好坏示例照片统一每个分数的含义。"], ["Close findings in the app, not in chat, or the list stops being true.", "在应用里关闭问题，而不是在聊天里，否则清单就不准确了。"], ["Start with two areas before rolling out to all eight.", "先在两个区域试行，再推广到全部八个区域。"]],
      next: [["Add a trend of scores per area.", "增加各区域分数趋势。"], ["Flag findings that repeat in the same area.", "标出同一区域重复出现的问题。"], ["Add a weekly reminder for overdue findings.", "增加逾期问题的每周提醒。"]],
      wf: ["wf-appsheet-6s", "wf-forms-checklist", "wf-sheets"], rel: ["weekly-action-tracker", "repeated-mistake-worksheet", "escalation-report"],
      csv: { file: "starter-6s-findings.csv", cols: ["Audit date", "Area", "S category", "Finding", "Photo link", "Owner", "Due date", "Status"],
        rows: [["2026-11-12", "Packing", "Set in order", "Unlabelled tote stack at bay 3", "", "Packing lead", "2026-11-19", "Open"], ["2026-11-12", "Packing", "Shine", "Broom missing from shadow board", "", "Shift B", "2026-11-14", "Done"], ["2026-11-12", "Stores", "Sort", "Obsolete labels on rack 2", "", "Stores lead", "2026-11-21", "Open"]] } },

    { id: "cs-training-matrix", tools: ["sheets", "script", "gmail", "docs"],
      t: ["Automated Training Matrix", "自动化培训矩阵"],
      ctx: ["A site where machine licences, forklift tickets and quality sign-offs expire on different cycles.", "一个工厂，设备操作证、叉车证和质量授权的有效期各不相同。"],
      problem: ["Training records were spread across several files. Expired qualifications were usually found during an audit or when a trained person was suddenly needed.", "培训记录分散在多个文件里。过期的资格通常在审核时或急需某个合格人员时才被发现。"],
      manual: [["Each department kept its own training list.", "各部门各自保存培训清单。"], ["Certificates were typed in Word for each person.", "每个人的证书都在 Word 里手工制作。"], ["Before audits, someone checked every date by hand.", "审核前由专人逐一核对日期。"]],
      auto: ["One training register holds every person, skill, trained date and expiry date. A weekly script emails supervisors what expires in the next 30 days, and certificates are generated from a Docs template.", "一张培训登记表记录每个人、技能、培训日期和到期日期。每周脚本把未来 30 天内到期的项目发邮件给主管，证书由 Docs 模板自动生成。"],
      approach: [["Merge the lists into one register with fixed columns.", "把各清单合并成一张列固定的登记表。"], ["Add expiry status with formulas and colours.", "用公式和颜色显示到期状态。"], ["Set up the due-date alert script on a weekly trigger.", "设置每周触发的到期提醒脚本。"], ["Generate certificates from the register with the document script.", "用文档脚本从登记表生成证书。"]],
      expect: [["Supervisors hear about expiry before it happens.", "主管在到期前就收到提醒。"], ["One register to show an auditor.", "审核时只需出示一张登记表。"], ["Certificates that look the same every time.", "每份证书格式一致。"]],
      lessons: [["Decide who owns the register; shared ownership means nobody updates it.", "明确登记表由谁负责；大家都管等于没人更新。"], ["Write the renewal step into the alert, not just the date.", "提醒中写明续期步骤，而不只是日期。"], ["Check the first batch of generated certificates by hand.", "人工检查第一批生成的证书。"]],
      next: [["Link the register to the resource plan, so only valid people are allocated.", "把登记表与人员计划关联，只分配资格有效的人员。"], ["Add a training plan view by month.", "增加按月的培训计划视图。"], ["Collect trainer sign-off through a form.", "通过表单收集培训师签字确认。"]],
      wf: ["wf-due-alerts", "wf-doc-generation", "wf-manpower"], rel: ["skills-matrix", "8d-report", "weekly-action-tracker"],
      csv: { file: "starter-training-register.csv", cols: ["Employee", "Skill", "Level", "Trained on", "Expires on", "Trainer", "Supervisor email", "Status"],
        rows: [["Operator A", "Line 3 filler changeover", "Competent", "2025-11-04", "2026-11-04", "Line 3 team leader", "supervisor@example.com", "Expired"], ["Operator B", "Forklift", "Licensed", "2024-12-01", "2026-12-01", "External", "supervisor@example.com", "Due in 30 days"], ["Operator C", "Final inspection", "Trainee", "2026-10-20", "2027-10-20", "QA lead", "supervisor@example.com", "Valid"]] } },

    { id: "cs-performance-reporting", tools: ["sheets", "looker", "ai", "gmail"],
      t: ["Production Performance Reporting", "生产绩效报告"],
      ctx: ["A weekly management review covering output, quality, delivery and people KPIs for one site.", "一个工厂每周的管理评审，涵盖产量、质量、交付和人员 KPI。"],
      problem: ["Preparing the weekly pack took most of a day of copying charts, and the commentary described what happened rather than what to decide.", "准备每周报告要花大半天复制图表，评论只描述发生了什么，而没有说要决定什么。"],
      manual: [["KPI owners emailed their numbers in different formats.", "各 KPI 负责人用不同格式发邮件报数。"], ["Charts were rebuilt in slides every week.", "每周在幻灯片里重新制作图表。"], ["The manager wrote the commentary late on the evening before.", "经理在前一天晚上才写评论。"]],
      auto: ["KPI owners update one KPI sheet. A Looker Studio dashboard shows trend against target, and an AI tool drafts findings, risks and proposed actions that the manager checks and edits.", "各 KPI 负责人更新同一张 KPI 表。Looker Studio 看板显示趋势与目标对比，AI 工具起草发现、风险和建议行动，由经理核对和修改。"],
      approach: [["Agree five to seven KPIs, each with one definition and one owner.", "约定五到七个 KPI，每个只有一种定义、一位负责人。"], ["Build the KPI sheet and the dashboard.", "建立 KPI 表和看板。"], ["Write and test the commentary prompt on four past weeks.", "用过去四周的数据编写并测试评论提示词。"], ["Send the dashboard link with the checked commentary.", "附上看板链接和经核对的评论一起发送。"]],
      expect: [["Charts that update themselves.", "图表自动更新。"], ["A review that starts from decisions, not from reading charts.", "评审从决策开始，而不是从看图开始。"], ["One source of numbers for everyone.", "所有人使用同一数据来源。"]],
      lessons: [["The AI draft is only as good as the KPI definitions behind it.", "AI 草稿的质量取决于背后 KPI 定义的质量。"], ["Always check AI numbers against the sheet before sending.", "发送前务必对照表格核实 AI 写出的数字。"], ["Follow company rules on which data may go into an AI tool.", "遵守公司关于哪些数据可以输入 AI 工具的规定。"]],
      next: [["Link each red KPI to an action and owner.", "把每个红色 KPI 与行动和负责人关联。"], ["Add a monthly view for the business review.", "为业务评审增加月度视图。"], ["Pull numbers directly from the daily dashboard instead of re-entering them.", "直接从每日看板取数，而不是重新录入。"]],
      wf: ["wf-mgmt-reporting", "wf-production-report", "wf-ai-rca"], rel: ["production-kpi-dashboard", "escalation-report", "decision-matrix"],
      csv: { file: "starter-weekly-kpis.csv", cols: ["Week", "KPI", "Target", "Actual", "Unit", "Owner", "Comment"],
        rows: [["2026-W45", "Output vs plan", "100", "96.2", "%", "Production", "Line 3 below plan"], ["2026-W45", "Scrap", "2.0", "1.6", "%", "Quality", "Third week down"], ["2026-W45", "Overtime", "5.0", "6.1", "% of hours", "HR", "Cover for absences"]] } },

    { id: "cs-cost-analysis", tools: ["sheets", "looker", "ai"],
      t: ["Automated Cost and Resource Analysis", "成本与资源自动分析"],
      ctx: ["A production department reviewing labour, overtime, scrap and consumable costs against budget every month.", "一个生产部门每月对照预算审查人工、加班、报废和耗材成本。"],
      problem: ["Cost data arrived as exports from different systems. Building the monthly comparison took days, and by then it was too late to act on the month.", "成本数据来自不同系统的导出文件。做月度对比要花好几天，等做完时已来不及对当月采取行动。"],
      manual: [["Exports from payroll, stores and production were downloaded each month.", "每月下载工资、仓库和生产系统的导出文件。"], ["The columns were rearranged by hand to match the budget file.", "手工调整列顺序以匹配预算文件。"], ["Variance explanations were collected by email.", "通过邮件收集差异说明。"]],
      auto: ["Each export is pasted into its own tab in a fixed layout. QUERY formulas build one cost table by month and cost centre, the dashboard shows variance against budget, and AI drafts the first explanation of the biggest variances for the owner to check.", "每份导出数据粘贴到各自固定格式的页签中。QUERY 公式按月份和成本中心生成一张成本表，看板显示与预算的差异，AI 先起草最大差异的说明，再由负责人核对。"],
      approach: [["Fix one layout per export and record where each export comes from.", "为每份导出数据固定格式，并记录其来源。"], ["Combine them with QUERY into one cost table.", "用 QUERY 合并成一张成本表。"], ["Build the variance dashboard by cost centre.", "按成本中心建立差异看板。"], ["Move the review to mid-month as well as month end.", "在月末之外，增加月中评审。"]],
      expect: [["The monthly comparison is ready as soon as the exports are pasted.", "导出数据一粘贴，月度对比就已完成。"], ["Costs can be checked mid-month, while there is still time to act.", "可以在月中检查成本，仍有时间采取行动。"], ["Variance owners start from a draft instead of a blank email.", "差异负责人从草稿开始，而不是从空白邮件开始。"]],
      lessons: [["Cost data is sensitive: limit who can open the sheet.", "成本数据敏感：限制可打开表格的人员。"], ["When a system export changes its columns, the formulas break; check the headers every month.", "系统导出的列一旦变化，公式就会出错；每月检查标题行。"], ["Keep AI drafts to explanations; decisions stay with the cost owner.", "AI 只用于起草说明；决定权仍在成本负责人手中。"]],
      next: [["Ask IT about a scheduled export so pasting is no longer needed.", "向 IT 了解定时导出，不再需要手工粘贴。"], ["Add cost per unit produced.", "增加单位产品成本。"], ["Link overtime cost to the resource dashboard.", "把加班成本与资源看板关联。"]],
      wf: ["wf-sheets-combine", "wf-mgmt-reporting"], rel: ["decision-matrix", "oee-loss-calculator", "tool-excel-formula"],
      csv: { file: "starter-cost-review.csv", cols: ["Month", "Cost centre", "Category", "Budget", "Actual", "Variance", "Owner", "Explanation"],
        rows: [["2026-10", "Line 3", "Overtime", "12000", "15400", "3400", "Production", "Cover for absences"], ["2026-10", "Line 3", "Scrap", "8000", "6900", "-1100", "Quality", ""], ["2026-10", "Packing", "Consumables", "5000", "5350", "350", "Packing lead", ""]] } }
  ];

  var openId = null;
  function caseById(id) { return CASES.filter(function (c) { return c.id === id; })[0]; }
  function chips(c) { return c.tools.map(function (t) { return '<span class="chip">' + esc(L(D.tools && D.tools[t])) + "</span>"; }).join(""); }
  function items(list, tag) { return "<" + tag + ">" + list.map(function (x) { return "<li>" + esc(L(x)) + "</li>"; }).join("") + "</" + tag + ">"; }
  function part(title, body) { return '<section class="wfPart"><h2>' + title + "</h2>" + body + "</section>"; }
  var NOTE = function () { return T("Illustrative example: a composite scenario written by LAOYU. Not a specific company, and no measured results.", "示例案例：由老鱼根据常见情况综合编写。不代表任何特定公司，也没有实测结果。"); };

  function renderGrid() {
    $("csGrid").innerHTML = CASES.map(function (c, i) {
      return '<a class="card csCard" href="#' + c.id + '"><span class="csNum">' + T("Case ", "案例 ") + (i + 1) + "</span><h3>" + esc(L(c.t)) + "</h3><p>" + esc(L(c.problem)) + '</p><span class="chips">' + chips(c) + '</span><span class="go">' + T("Read the case study →", "阅读案例 →") + "</span></a>";
    }).join("");
    $("csNote").textContent = NOTE();
  }

  function renderDetail(c) {
    var i = CASES.indexOf(c), prev = CASES[i - 1], next = CASES[i + 1];
    var wfs = c.wf.map(wf).filter(Boolean), rel = c.rel.map(res).filter(Boolean);
    $("csDetail").innerHTML =
      '<a class="wfBack" href="#cases" data-csback>' + T("← All case studies", "← 全部案例") + "</a>" +
      '<header class="wfHead"><span class="chips"><span class="chip a">' + T("Illustrative example", "示例案例") + "</span>" + chips(c) + '</span><h1 id="csTitle" tabindex="-1">' + esc(L(c.t)) + '</h1><p class="csCtx">' + esc(L(c.ctx)) + "</p></header>" +
      '<div class="wfBody"><div class="wfMain">' +
        part(T("Original problem", "原始问题"), "<p>" + esc(L(c.problem)) + "</p>") +
        part(T("Existing manual process", "现有手工流程"), items(c.manual, "ol")) +
        part(T("Proposed automation", "自动化方案"), "<p>" + esc(L(c.auto)) + "</p>") +
        part(T("Implementation approach", "实施方法"), items(c.approach, "ol")) +
        part(T("What to expect", "预期效果"), items(c.expect, "ul") + '<p class="fine">' + T("Described, not measured. Your results depend on your process, data and adoption.", "这里只作描述，未经实测。实际效果取决于你的流程、数据和使用情况。") + "</p>") +
        part(T("Lessons learned", "经验教训"), items(c.lessons, "ul")) +
        part(T("Opportunities for further improvement", "进一步改进的机会"), items(c.next, "ul")) +
      "</div><aside class=\"wfSide\">" +
        part(T("Tools used", "使用的工具"), '<div class="chips">' + chips(c) + "</div>") +
        part(T("Starter template", "入门模板"), "<p>" + T("A starter sheet with the columns used in this case and three rows of sample data. Opens in Google Sheets or Excel.", "包含本案例所用列和三行示例数据的入门表格（列名为英文），可用 Google Sheets 或 Excel 打开。") + '</p><button type="button" class="btn" data-csdl>' + T("Download .csv", "下载 .csv") + '</button><p class="fine">' + esc(c.csv.file) + "</p>") +
        (wfs.length ? part(T("Workflows in the library", "资源库中的相关流程"), '<div class="wfRel">' + wfs.map(function (w) { return '<a href="#' + w.id + '"><b>' + esc(L(w.title)) + "</b><span>" + esc(L(w.problem)) + "</span></a>"; }).join("") + "</div>") : "") +
        (rel.length ? part(T("Related resources", "相关资源"), '<div class="wfRel">' + rel.map(function (r) { return '<a href="' + esc(r.url) + '"><b>' + esc(L(r.title)) + "</b><span>" + esc(L(r.problem)) + "</span></a>"; }).join("") + "</div>") : "") +
      "</aside></div>" +
      '<p class="fine">' + NOTE() + "</p>" +
      '<nav class="wfPager" aria-label="' + esc(T("More case studies", "更多案例")) + '">' +
        (prev ? '<a href="#' + prev.id + '">← ' + esc(L(prev.t)) + "</a>" : "<span></span>") +
        (next ? '<a href="#' + next.id + '">' + esc(L(next.t)) + " →</a>" : "<span></span>") + "</nav>";
  }

  function show(fromHash) {
    var h = (location.hash || "").slice(1), c = /^cs-/.test(h) ? caseById(h) : null;
    openId = c ? c.id : null;
    $("csList").hidden = !!c;
    $("csDetail").hidden = !c;
    if (c) {
      renderDetail(c);
      document.title = L(c.t) + " | LAOYU";
      if (fromHash) { $("cases").scrollIntoView(); var t = $("csTitle"); if (t) t.focus({ preventScroll: true }); }
    } else {
      renderGrid();
      if (!/^#wf-/.test(location.hash)) document.title = T("Automation Lab | LAOYU", "自动化实验室 | LAOYU 老鱼");
    }
  }

  function csvText(c) {
    var q = function (v) { v = String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; };
    return "﻿" + [c.csv.cols].concat(c.csv.rows).map(function (r) { return r.map(q).join(","); }).join("\r\n") + "\r\n";
  }
  function download(c) {
    try {
      var url = URL.createObjectURL(new Blob([csvText(c)], { type: "text/csv;charset=utf-8" }));
      var a = document.createElement("a");
      a.href = url; a.download = c.csv.file;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    } catch (e) { window.prompt(T("Copy this into a new sheet:", "复制到新表格中："), csvText(c).slice(1)); }
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!$("csGrid")) return;
    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-csdl]") && openId) { download(caseById(openId)); return; }
      if (e.target.closest("[data-csback]")) {
        e.preventDefault();
        var back = openId;
        try { history.pushState(null, "", "#cases"); } catch (er) {}
        show(false);
        var card = back && document.querySelector('#csGrid a[href="#' + back + '"]');
        if (card) card.focus(); else $("cases").scrollIntoView();
      }
    });
    window.addEventListener("hashchange", function () { show(/^#cs-/.test(location.hash)); });
    window.addEventListener("popstate", function () { show(/^#cs-/.test(location.hash)); });
    document.addEventListener("laoyu:lang", function () { show(false); });
    show(/^#cs-/.test(location.hash));
  });

  window.LAOYU_CASES = { list: CASES, csv: csvText };
})();
