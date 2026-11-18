/* =========================================================
   LAOYUTALKS 3.0 — Automation Lab workflows (single source)
   Loaded after resources-data.js. Each workflow is also added
   to the resource library as type "workflow" in the
   Automation & Digitalisation category.
   Text is [English, 中文]. Benefits are described, not
   measured: no invented numbers.
   Example outputs use neutral sample data.
   ========================================================= */
(function () {
  var D = window.LAOYU_DATA;
  if (!D) return;

  /* Code shown in the library (copy or download as .gs). Apps Script, written for this
     page and kept short; read it before running and test on a copy of your sheet. */
  var CODE = {
    "wf-production-report": { file: "daily-production-report.gs", text: [
      "/* Daily production report - Apps Script (bound to the Google Sheet).",
      "   Sheet 'Summary': row 1 = headers, then one row per line:",
      "   Line | Target | Actual | Scrap % | Downtime min | Main reason",
      "   1. Set REPORT_TO.  2. Run once to grant access.",
      "   3. Add a time-driven trigger for sendDailyReport (every morning). */",
      "const REPORT_TO = 'team@example.com';",
      "",
      "function sendDailyReport() {",
      "  const sheet = SpreadsheetApp.getActive().getSheetByName('Summary');",
      "  const rows = sheet.getDataRange().getValues().slice(1).filter(r => r[0]);",
      "  if (!rows.length) return;",
      "  let worst = rows[0];",
      "  const lines = rows.map(r => {",
      "    const ach = r[1] ? (r[2] / r[1] * 100).toFixed(1) + '%' : 'n/a';",
      "    if (Number(r[4]) > Number(worst[4])) worst = r;",
      "    return r[0] + '  Target ' + r[1] + '  Actual ' + r[2] + '  Achievement ' + ach + '  Scrap ' + r[3] + '%';",
      "  });",
      "  const day = Utilities.formatDate(new Date(Date.now() - 864e5), Session.getScriptTimeZone(), 'EEE d MMM');",
      "  const body = 'Daily production report - ' + day + '\\n\\n' + lines.join('\\n') +",
      "    '\\n\\nBiggest loss: ' + worst[0] + ', ' + worst[4] + ' min downtime - ' + worst[5];",
      "  MailApp.sendEmail(REPORT_TO, 'Production report - ' + day, body);",
      "}"
    ].join("\n") + "\n" },
    "wf-sheets": { file: "weekly-open-actions.gs", text: [
      "/* Weekly open-action reminder - Apps Script (bound to the tracker).",
      "   Sheet 'Actions': Action | Owner email | Due date | Status",
      "   Run once to grant access, then add a weekly time-driven",
      "   trigger for sendOpenActions. */",
      "function sendOpenActions() {",
      "  const rows = SpreadsheetApp.getActive().getSheetByName('Actions')",
      "    .getDataRange().getValues().slice(1);",
      "  const today = new Date(); today.setHours(0, 0, 0, 0);",
      "  const byOwner = {};",
      "  rows.forEach(([action, owner, due, status]) => {",
      "    if (!action || !owner || status === 'Done') return;",
      "    const isDate = due instanceof Date;",
      "    const late = isDate && due < today ? Math.round((today - due) / 864e5) : 0;",
      "    const line = action + (isDate ? ' - due ' + due.toDateString() : '') + (late ? ' - ' + late + ' days late' : '');",
      "    (byOwner[owner] = byOwner[owner] || []).push(line);",
      "  });",
      "  Object.keys(byOwner).forEach(owner => {",
      "    const list = byOwner[owner].map((l, i) => (i + 1) + '. ' + l).join('\\n');",
      "    MailApp.sendEmail(owner, 'Your open actions', list + '\\n\\nUpdate the tracker when an item is done.');",
      "  });",
      "}"
    ].join("\n") + "\n" },
    "wf-doc-generation": { file: "generate-documents.gs", text: [
      "/* Document generation - Apps Script (bound to the data sheet).",
      "   Sheet 'Records': row 1 = column names that match the template's",
      "   placeholders, e.g. {{Name}} and {{Date}}, plus two columns:",
      "   'Generate' (type Ready to create a document) and 'PDF link'.",
      "   Set TEMPLATE_ID (Google Docs file) and FOLDER_ID (Drive folder). */",
      "const TEMPLATE_ID = 'paste-your-template-file-id';",
      "const FOLDER_ID = 'paste-your-folder-id';",
      "",
      "function generateDocuments() {",
      "  const sheet = SpreadsheetApp.getActive().getSheetByName('Records');",
      "  const data = sheet.getDataRange().getDisplayValues();",
      "  const head = data[0], gen = head.indexOf('Generate'), link = head.indexOf('PDF link');",
      "  if (gen < 0 || link < 0) throw new Error('Add the Generate and PDF link columns first.');",
      "  const folder = DriveApp.getFolderById(FOLDER_ID);",
      "  for (let r = 1; r < data.length; r++) {",
      "    if (data[r][gen] !== 'Ready' || data[r][link]) continue;",
      "    const copy = DriveApp.getFileById(TEMPLATE_ID).makeCopy('Record row ' + (r + 1), folder);",
      "    const doc = DocumentApp.openById(copy.getId());",
      "    head.forEach((h, c) => {",
      "      if (h) doc.getBody().replaceText('\\\\{\\\\{' + h + '\\\\}\\\\}', data[r][c]);",
      "    });",
      "    doc.saveAndClose();",
      "    const pdf = folder.createFile(copy.getAs('application/pdf'));",
      "    copy.setTrashed(true);",
      "    sheet.getRange(r + 1, link + 1).setValue(pdf.getUrl());",
      "  }",
      "}"
    ].join("\n") + "\n" },
    "wf-due-alerts": { file: "due-date-alerts.gs", text: [
      "/* Due-date alerts - Apps Script (bound to the register sheet).",
      "   Sheet 'Register': Item | Type | Owner email | Due date",
      "   Emails each owner the items due within DAYS_AHEAD days or",
      "   already overdue. Run once to grant access, then add a weekly",
      "   time-driven trigger for checkDueDates. */",
      "const DAYS_AHEAD = 14;",
      "",
      "function checkDueDates() {",
      "  const rows = SpreadsheetApp.getActive().getSheetByName('Register')",
      "    .getDataRange().getValues().slice(1);",
      "  const today = new Date(); today.setHours(0, 0, 0, 0);",
      "  const due = {};",
      "  rows.forEach(([item, type, owner, date]) => {",
      "    if (!item || !owner || !(date instanceof Date)) return;",
      "    const days = Math.round((date - today) / 864e5);",
      "    if (days > DAYS_AHEAD) return;",
      "    const note = days < 0 ? 'OVERDUE by ' + (-days) + ' days' : 'due in ' + days + ' days';",
      "    (due[owner] = due[owner] || []).push(item + ' (' + type + ') - ' + note);",
      "  });",
      "  Object.keys(due).forEach(owner =>",
      "    MailApp.sendEmail(owner, 'Due-date alert: ' + due[owner].length + ' item(s)', due[owner].join('\\n')));",
      "}"
    ].join("\n") + "\n" },
    "wf-request-approval": { file: "request-approval.gs", text: [
      "/* Request and approval - Apps Script (bound to the form's response sheet).",
      "   Form questions (exact titles): Requester email, Request type,",
      "   Details, Amount. Add a Status header right after the last form",
      "   column. Set APPROVER, then add an 'On form submit' trigger",
      "   for onRequest. */",
      "const APPROVER = 'approver@example.com';",
      "",
      "function onRequest(e) {",
      "  const get = k => (e.namedValues[k] && e.namedValues[k][0]) || '';",
      "  const row = e.range.getRow();",
      "  e.range.getSheet().getRange(row, e.range.getLastColumn() + 1).setValue('Pending');",
      "  MailApp.sendEmail(APPROVER, 'Approval needed: ' + get('Request type'),",
      "    'Request row ' + row + '\\nFrom: ' + get('Requester email') +",
      "    '\\nDetails: ' + get('Details') + '\\nAmount: ' + get('Amount') +",
      "    '\\n\\nSet the Status column to Approved or Rejected.');",
      "  const requester = get('Requester email');",
      "  if (requester) MailApp.sendEmail(requester, 'Request received',",
      "    'Your request was received and sent for approval (row ' + row + ').');",
      "}"
    ].join("\n") + "\n" }
  };

  /* Automation Lab 2.0 library facets */
  D.autoCats = {"sheets": ["Google Sheets Automation", "Google Sheets 自动化"], "forms": ["Google Forms Automation", "Google Forms 自动化"], "script": ["Google Apps Script", "Google Apps Script 脚本"], "appsheet": ["AppSheet Automation", "AppSheet 自动化"], "ai": ["AI-Powered Automation", "AI 驱动的自动化"], "mfg": ["Manufacturing Automation", "制造自动化"], "productivity": ["Productivity Automation", "个人效率自动化"], "bpa": ["Business Process Automation", "业务流程自动化"]};
  D.builds = {"nocode": ["No-code", "无代码"], "lowcode": ["Low-code", "低代码"], "code": ["Coding", "需编程"]};
  D.areas = {"mfg": ["Manufacturing", "制造"], "biz": ["Business", "业务"], "personal": ["Personal productivity", "个人效率"]};

  D.tools = {
    forms: ["Google Forms", "Google Forms"], sheets: ["Google Sheets", "Google Sheets"], script: ["Apps Script", "Apps Script"],
    gmail: ["Gmail or Outlook", "Gmail 或 Outlook"], chat: ["Google Chat or Teams", "Google Chat 或 Teams"], ai: ["AI chat tool", "AI 对话工具"],
    appsheet: ["AppSheet", "AppSheet"], docs: ["Google Docs", "Google Docs"], looker: ["Looker Studio", "Looker Studio"],
    qr: ["QR code labels", "二维码标签"]
  };

  D.workflows = [
    {
      id: "wf-production-report", level: "intermediate", tools: ["forms", "sheets", "script", "gmail"],
      cat: "mfg", build: "code", aud: ["mfg"], time: ["Half a day", "约半天"],
      flow: [["Shift form", "班次表单"], ["Google Sheet", "Google 表格"], ["Morning trigger", "早间触发"], ["Apps Script summary", "Apps Script 汇总"], ["Email report", "邮件报告"]], code: CODE["wf-production-report"],
      title: ["Automated production reporting", "生产报告自动化"],
      problem: ["Supervisors spend the end of every shift copying numbers into a report, and managers get it late or in different formats.", "主管每个班结束时都要把数字抄进报告，管理者收到得晚，格式还各不相同。"],
      solution: ["Each shift enters its numbers once in a short form. A script summarises the day every morning and emails one standard report before the first meeting.", "每个班在一张简短的表单里录入一次数据。脚本每天早上汇总前一天的数据，在第一次会议前发出一份标准报告。"],
      steps: [
        ["Create a Google Form with the fields you report today: date, shift, line, target, actual, scrap, downtime minutes and main reason.", "建一个 Google 表单，字段就是你现在报告的内容：日期、班次、产线、目标、实际、报废、停机分钟数和主要原因。"],
        ["Link the form to a Google Sheet. Add a Summary tab with one row per line for yesterday: line, target, actual, scrap %, downtime minutes, main reason (use SUMIFS on the responses).", "把表单连接到 Google 表格。新增“Summary”汇总页，每条产线一行，汇总昨天的数据：产线、目标、实际、报废率、停机分钟数、主要原因（对回复数据使用 SUMIFS）。"],
        ["Paste the script below into Extensions → Apps Script. It reads the Summary tab and builds the email text.", "把下面的脚本粘贴到“扩展程序 → Apps Script”，它会读取“汇总”页并生成邮件内容。"],
        ["Add a time-driven trigger to run it every morning before the production meeting.", "添加一个定时触发器，每天早上在生产会议前运行。"],
        ["Run it in parallel with the manual report for one week, compare, then retire the manual one.", "与手工报告并行运行一周，对比结果后，再停用手工报告。"]
      ],
      benefits: [["Numbers are typed once, by the people who know them.", "数据只录入一次，由最了解情况的人录入。"], ["Every manager gets the same report at the same time.", "所有管理者在同一时间收到同一份报告。"], ["History builds up automatically for trend analysis.", "历史数据自动累积，方便做趋势分析。"]],
      example: ["Daily production report – Mon 3 Nov (sample data)\n\nLine 1  Target 4,800  Actual 4,512  Achievement 94.0%  Scrap 1.8%\nLine 2  Target 3,600  Actual 3,655  Achievement 101.5%  Scrap 0.9%\nLine 3  Target 2,400  Actual 1,980  Achievement 82.5%  Scrap 3.1%\n\nBiggest loss: Line 3, 95 min downtime – filler jams\nMissing entries: Line 2 night shift (no scrap figure)",
                "每日生产报告 – 11 月 3 日 周一（示例数据）\n\n1 号线  目标 4,800  实际 4,512  达成率 94.0%  报废 1.8%\n2 号线  目标 3,600  实际 3,655  达成率 101.5%  报废 0.9%\n3 号线  目标 2,400  实际 1,980  达成率 82.5%  报废 3.1%\n\n最大损失：3 号线停机 95 分钟 – 灌装机卡料\n缺失数据：2 号线夜班（无报废数据）"],
      related: ["demo-daily-report", "production-kpi-dashboard", "oee-loss-calculator"]
    },
    {
      id: "wf-ai-email", level: "beginner", tools: ["ai", "gmail"],
      cat: "ai", build: "nocode", aud: ["biz", "personal"], time: ["About 1 hour", "约 1 小时"],
      flow: [["Facts", "事实"], ["Saved prompt", "保存的提示词"], ["AI draft", "AI 草稿"], ["Your check", "人工检查"], ["Send", "发送"]],
      title: ["AI email drafting", "AI 邮件起草"],
      problem: ["Routine emails – delay notices, supplier follow-ups, meeting summaries – take time to write well and often miss key facts.", "例行邮件（延误通知、供应商跟进、会议总结）要写好很费时间，还常常漏掉关键信息。"],
      solution: ["Keep a small set of tested prompts. Paste the facts in, let an AI tool draft the email, then check and send it yourself.", "准备几条经过验证的提示词。把事实粘贴进去，让 AI 工具起草邮件，再由你检查后亲自发送。"],
      steps: [
        ["List the three emails you write most often and what each must always include.", "列出你最常写的三类邮件，以及每类邮件必须包含的内容。"],
        ["Write one prompt per email type: who it is to, the purpose, the facts, the tone and the length.", "为每类邮件写一条提示词：收件人、目的、事实、语气和长度。"],
        ["Save the prompts where the team can find them, with [brackets] for the parts to fill in.", "把提示词存放在团队都能找到的地方，需要填写的部分用 [方括号] 标出。"],
        ["Paste in only the facts needed. Leave out confidential data unless your company has approved the AI tool for it.", "只粘贴需要的事实。除非公司已批准该 AI 工具处理机密数据，否则不要输入机密信息。"],
        ["Read every draft before sending: check numbers, names, dates and commitments.", "发送前阅读每份草稿：核对数字、人名、日期和承诺。"]
      ],
      benefits: [["Faster first drafts with a consistent structure.", "更快写出结构一致的初稿。"], ["Fewer emails that miss the key fact or the ask.", "减少遗漏关键事实或请求的邮件。"], ["New team members write like experienced ones.", "新同事也能写出资深同事水平的邮件。"]],
      example: ["Subject: Line 3 order 4471 – delivery moved to Thursday (sample data)\n\nHi Alex,\n\nOrder 4471 will ship on Thursday 6 Nov instead of Wednesday 5 Nov. A filler fault on Line 3 cost us 95 minutes on Monday.\n\nWhat we are doing: the part is replaced and the line is back at full speed. We have added an extra shift on Tuesday.\n\nCould you confirm Thursday works for your receiving team?\n\nBest regards,\nSam",
                "主题：3 号线订单 4471 – 交货改至周四（示例数据）\n\nAlex 你好，\n\n订单 4471 将于 11 月 6 日周四发货，而不是 11 月 5 日周三。周一 3 号线灌装机故障，损失了 95 分钟。\n\n我们的措施：故障零件已更换，产线已恢复满速；周二加开了一个班。\n\n请确认周四是否适合你们收货？\n\n此致\nSam"],
      related: ["tool-email-writer", "ai-prompt-pack", "escalation-report"]
    },
    {
      id: "wf-sheets", level: "beginner", tools: ["sheets", "script", "gmail"],
      cat: "sheets", build: "code", aud: ["mfg", "biz"], time: ["1 to 2 hours", "1 到 2 小时"],
      flow: [["Action tracker", "行动追踪表"], ["Overdue formula", "逾期公式"], ["Weekly trigger", "每周触发"], ["Script groups by owner", "脚本按负责人分组"], ["Email to each owner", "邮件发给每位负责人"]], code: CODE["wf-sheets"],
      title: ["Google Sheets automation", "Google Sheets 自动化"],
      problem: ["Action lists and trackers live in spreadsheets, but nobody notices when items go overdue until the next meeting.", "行动清单和追踪表都放在表格里，但项目逾期了，往往要到下次开会才有人发现。"],
      solution: ["Let the sheet do the checking: formulas flag overdue items, colours make them visible, and a weekly script emails each owner their own open list.", "让表格自己检查：公式标出逾期项目，颜色让它们一目了然，每周脚本把各自的未完成清单发给每位负责人。"],
      steps: [
        ["Use one row per action with columns: action, owner email, due date, status.", "每个行动项一行，列为：行动、负责人邮箱、截止日期、状态。"],
        ["Add a Days late column: =IF(AND(D2<>\"Done\",C2<TODAY()),TODAY()-C2,\"\")", "新增“逾期天数”列：=IF(AND(D2<>\"Done\",C2<TODAY()),TODAY()-C2,\"\")"],
        ["Add conditional formatting to colour overdue rows and data validation for the status list.", "添加条件格式为逾期行上色，并为状态列设置数据验证下拉列表。"],
        ["Paste the script below into Extensions → Apps Script. It groups open actions by owner and emails each person their list.", "把下面的脚本粘贴到“扩展程序 → Apps Script”，它会按负责人分组未完成项，并把清单分别发给每个人。"],
        ["Run it on a weekly trigger the day before the review meeting.", "设置每周触发，在复盘会议前一天运行。"]
      ],
      benefits: [["Overdue actions are visible without anyone checking by hand.", "无需人工检查，逾期行动一目了然。"], ["Owners get reminded of their own items only.", "负责人只收到与自己相关的提醒。"], ["Meetings spend time on blockers instead of status updates.", "会议时间用在解决障碍上，而不是汇报进度。"]],
      example: ["Your open actions – week 45 (sample data)\n\n1. Replace filler guide rail – due 31 Oct – 6 days late\n2. Update changeover checklist Line 2 – due 7 Nov\n3. Train two operators on Line 3 – due 14 Nov\n\nReply to this email or update the tracker when an item is done.",
                "你的未完成行动 – 第 45 周（示例数据）\n\n1. 更换灌装机导轨 – 截止 10 月 31 日 – 逾期 6 天\n2. 更新 2 号线换线检查表 – 截止 11 月 7 日\n3. 培训 3 号线两名操作员 – 截止 11 月 14 日\n\n完成后请回复本邮件或更新追踪表。"],
      related: ["weekly-action-tracker", "tool-excel-formula", "tool-meeting-minutes"]
    },
    {
      id: "wf-appsheet", level: "intermediate", tools: ["appsheet", "sheets", "gmail"],
      cat: "appsheet", build: "lowcode", aud: ["mfg"], time: ["Half a day", "约半天"],
      flow: [["Phone request", "手机提交请求"], ["AppSheet app", "AppSheet 应用"], ["New-row bot", "新增行机器人"], ["Technician notified", "通知技术员"], ["Status board", "状态看板"]],
      title: ["AppSheet notification automation", "AppSheet 通知自动化"],
      problem: ["Maintenance requests are shouted across the floor or written on paper, so technicians hear late and nobody knows the status.", "维修请求靠在车间喊或写在纸上，技术员很晚才知道，也没人清楚处理状态。"],
      solution: ["A simple AppSheet app on phones logs each request. An automation notifies the right technician at once and updates the status board.", "在手机上用一个简单的 AppSheet 应用记录每个请求。自动化流程立即通知对应的技术员，并更新状态看板。"],
      steps: [
        ["Create a Google Sheet with columns: time, line, machine, problem, priority, reported by, assigned to, status.", "建一张 Google 表格，列为：时间、产线、设备、问题、优先级、报告人、指派给、状态。"],
        ["Build an AppSheet app from the sheet. Keep the request form to five fields or fewer.", "用这张表格生成 AppSheet 应用，请求表单不超过五个字段。"],
        ["Add a bot: when a new row is added, send an email or app notification to the technician for that line.", "添加一个机器人：新增一行时，向该产线的技术员发送邮件或应用通知。"],
        ["Add a second bot for high priority: also notify the shift supervisor.", "再添加一个高优先级机器人：同时通知值班主管。"],
        ["Test with one line for two weeks before rolling out.", "推广前先在一条产线上试运行两周。"]
      ],
      benefits: [["Technicians are told immediately, with the details they need.", "技术员第一时间收到通知，并附带所需细节。"], ["Every request has a status, so nothing is forgotten.", "每个请求都有状态，不会被遗忘。"], ["The data shows which machines need attention most.", "数据显示哪些设备最需要关注。"]],
      example: ["New maintenance request – HIGH (sample data)\n\nLine 3 · Filler · 08:42\nProblem: bottles jamming at the infeed star wheel\nReported by: Night shift supervisor\nAssigned to: Line 3 technician\n\nOpen the app to accept the job.",
                "新的维修请求 – 高优先级（示例数据）\n\n3 号线 · 灌装机 · 08:42\n问题：进瓶星轮处卡瓶\n报告人：夜班主管\n指派给：3 号线技术员\n\n请打开应用接单。"],
      related: ["downtime-troubleshooter", "tool-downtime-analysis", "escalation-report"]
    },
    {
      id: "wf-ai-rca", level: "intermediate", tools: ["ai", "sheets"],
      cat: "ai", build: "nocode", aud: ["mfg"], time: ["About 1 hour per problem", "每个问题约 1 小时"],
      flow: [["Problem statement", "问题描述"], ["AI lists 6M causes", "AI 列出 6M 原因"], ["Team review", "团队审查"], ["Check at the line", "现场验证"], ["8D / CAPA record", "8D / CAPA 记录"]],
      title: ["AI root cause analysis", "AI 辅助根本原因分析"],
      problem: ["Root cause meetings jump to the first idea, and the same causes are missed again and again.", "根本原因分析会议常常抓住第一个想法就下结论，同样的原因一再被遗漏。"],
      solution: ["Use AI as a thinking partner before the meeting: it widens the list of possible causes under the 6Ms. The team then checks each one with evidence at the line.", "会前把 AI 当作思考伙伴：按 6M 扩展可能原因的清单。团队再到现场逐一用证据验证。"],
      steps: [
        ["Write a factual problem statement: what, where, when, how many, and what changed.", "写一份基于事实的问题描述：什么、哪里、何时、多少，以及有什么变化。"],
        ["Ask an AI tool to list possible causes under the 6Ms and the evidence that would confirm or rule out each one.", "让 AI 工具按 6M 列出可能的原因，以及能确认或排除每个原因的证据。"],
        ["Bring the list to the team. Add what the AI missed and remove what does not fit the facts.", "把清单带给团队，补充 AI 遗漏的，删去不符合事实的。"],
        ["Check the top causes at the line with data or a trial.", "到现场用数据或试验验证最可能的原因。"],
        ["Record the verified root cause and the action in your 8D or CAPA.", "把经过验证的根本原因和措施记录到 8D 或 CAPA 中。"]
      ],
      benefits: [["A wider list of causes before anyone settles on one.", "在下结论之前，考虑更全面的原因。"], ["Meetings start from a structure instead of a blank page.", "会议从一个结构出发，而不是从零开始。"], ["Clear evidence to collect for each suspected cause.", "每个可疑原因都有明确需要收集的证据。"]],
      example: ["Problem: Line 3 short fills rose from 0.5% to 2.4% since Monday (sample data)\n\nMachine: worn filling valve seals → check valve-by-valve fill weights\nMaterial: new bottle supplier lot → compare neck dimensions\nMethod: new night-shift start-up routine → compare by shift\nMeasurement: checkweigher recalibrated Monday → verify with test weights\nMan: new operator on nights → review training record\nEnvironment: higher product temperature → check tank log\n\nAI-suggested causes are hypotheses. Verify each at the line.",
                "问题：自周一起 3 号线灌装不足从 0.5% 升至 2.4%（示例数据）\n\n机：灌装阀密封件磨损 → 逐个阀门检查灌装重量\n料：瓶子换了新供应商批次 → 对比瓶口尺寸\n法：夜班启动流程有变化 → 按班次对比\n测：周一重新校准了检重秤 → 用砝码验证\n人：夜班有新操作员 → 查看培训记录\n环：产品温度升高 → 查看储罐记录\n\nAI 给出的原因只是假设，必须到现场逐一验证。"],
      related: ["demo-root-cause", "fishbone-5why", "8d-report"]
    },
    {
      id: "wf-doc-generation", level: "advanced", tools: ["sheets", "docs", "script"],
      cat: "script", build: "code", aud: ["mfg", "biz"], time: ["1 to 2 days", "1 到 2 天"],
      flow: [["Data rows", "数据行"], ["Docs template", "Docs 模板"], ["Script fills placeholders", "脚本填入占位符"], ["PDF in Drive", "云端硬盘中的 PDF"], ["Link written back", "回填链接"]], code: CODE["wf-doc-generation"],
      title: ["Document generation", "文档自动生成"],
      problem: ["Reports, certificates and records are built by copying data into Word templates, which is slow and introduces errors.", "报告、证书和记录都靠把数据复制进 Word 模板来制作，既慢又容易出错。"],
      solution: ["Keep the data in a sheet and the layout in a Google Docs template. A script fills the placeholders and saves a PDF for each row.", "数据放在表格里，版式放在 Google Docs 模板里。脚本自动填入占位符，并为每一行生成一份 PDF。"],
      steps: [
        ["Create the document once in Google Docs with placeholders like {{Name}} and {{Date}}.", "在 Google Docs 中做好一次文档，用 {{Name}}、{{Date}} 这样的占位符。"],
        ["Put one record per row in a Google Sheet, with column headers matching the placeholders.", "在 Google 表格中每行放一条记录，列标题与占位符一致。"],
        ["Paste the script below into Extensions → Apps Script. It copies the template, replaces each placeholder and saves a PDF in a Drive folder.", "把下面的脚本粘贴到“扩展程序 → Apps Script”，它会复制模板、替换每个占位符，并把 PDF 保存到云端硬盘文件夹。"],
        ["Add a Generate column so the script only creates documents for rows marked ready, and writes back the PDF link.", "新增“生成”列，脚本只为标记为就绪的行生成文档，并回填 PDF 链接。"],
        ["Check the first ten documents by hand before trusting the output.", "先人工检查前十份文档，确认无误后再放心使用。"]
      ],
      benefits: [["Documents look the same every time.", "每份文档格式完全一致。"], ["No retyping, so fewer copy errors.", "无需重复录入，减少抄写错误。"], ["A link to every document is kept next to its data.", "每份文档的链接都保存在对应数据旁边。"]],
      example: ["Training record – generated from row 14 (sample data)\n\nEmployee: Operator A\nSkill: Line 3 filler changeover\nTrainer: Line 3 team leader\nDate assessed: 4 Nov 2026\nResult: Competent – may work unsupervised\n\nSaved as: Training_OperatorA_Line3_2026-11-04.pdf",
                "培训记录 – 由第 14 行生成（示例数据）\n\n员工：操作员 A\n技能：3 号线灌装机换线\n培训师：3 号线组长\n评估日期：2026 年 11 月 4 日\n结果：合格 – 可独立操作\n\n保存为：Training_OperatorA_Line3_2026-11-04.pdf"],
      related: ["skills-matrix", "8d-report", "shift-handover"]
    },
    {
      id: "wf-mgmt-reporting", level: "advanced", tools: ["sheets", "looker", "ai"],
      cat: "bpa", build: "lowcode", aud: ["mfg", "biz"], time: ["1 to 2 days", "1 到 2 天"],
      flow: [["Production and quality sheets", "生产与质量表格"], ["KPI sheet", "KPI 表"], ["Looker Studio dashboard", "Looker Studio 看板"], ["AI draft commentary", "AI 起草评论"], ["Manager's report", "管理者报告"]],
      title: ["Management reporting", "管理报告自动化"],
      problem: ["The weekly management report takes hours of copying charts, and the commentary says what happened but not what to do.", "每周管理报告要花好几个小时复制图表，而评论只说了发生了什么，没说接下来做什么。"],
      solution: ["A live dashboard shows the KPIs straight from the data. Each week, an AI tool drafts the commentary from the numbers, and the manager edits it into decisions.", "实时看板直接从数据展示 KPI。每周由 AI 工具根据数字起草评论，再由管理者修改成决策。"],
      steps: [
        ["Agree five to seven KPIs with one definition and one owner each.", "约定五到七个 KPI，每个只有一种定义、一位负责人。"],
        ["Feed them from your production and quality sheets into one KPI sheet.", "把生产和质量表格的数据汇入一张 KPI 表。"],
        ["Build a Looker Studio dashboard from the KPI sheet: trend, target and the week's biggest change.", "用 KPI 表在 Looker Studio 做看板：趋势、目标和本周最大变化。"],
        ["Each week, paste the KPI table into an AI tool and ask for three findings, three risks and three proposed actions.", "每周把 KPI 表粘贴到 AI 工具，请它给出三条发现、三项风险和三条建议行动。"],
        ["The manager checks the draft against the data, edits it, and sends the dashboard link with the final commentary.", "管理者对照数据检查草稿、修改后，附上看板链接和定稿评论一起发送。"]
      ],
      benefits: [["Charts update themselves; no more copying.", "图表自动更新，不再需要复制粘贴。"], ["Commentary focuses on actions and decisions.", "评论聚焦行动和决策。"], ["Everyone sees the same numbers from one source.", "所有人看到的是同一来源的同一组数字。"]],
      example: ["Week 45 commentary – draft for review (sample data)\n\nFindings\n1. Output 96.2% of plan; Line 3 is the main gap (82.5%).\n2. Scrap fell for the third week, now 1.6%.\n3. Overtime rose to 6.1% of hours.\n\nProposed actions\n1. Approve the filler valve overhaul on Line 3 (owner: maintenance).\n2. Cross-train two operators to reduce overtime (owner: production).\n\nAI draft – checked and edited by the manager before sending.",
                "第 45 周评论 – 待审草稿（示例数据）\n\n发现\n1. 产量达计划的 96.2%；主要差距在 3 号线（82.5%）。\n2. 报废率连续第三周下降，目前为 1.6%。\n3. 加班占工时比例升至 6.1%。\n\n建议行动\n1. 批准 3 号线灌装阀大修（负责人：维修）。\n2. 交叉培训两名操作员以减少加班（负责人：生产）。\n\nAI 草稿 – 发送前已由管理者核对和修改。"],
      related: ["production-kpi-dashboard", "escalation-report", "decision-matrix"]
    },
    {
      id: "wf-forms-checklist",
      level: "beginner",
      tools: ["forms", "sheets"],
      cat: "forms",
      build: "nocode",
      aud: ["mfg"],
      time: ["1 to 2 hours", "1 到 2 小时"],
      flow: [["Form at the machine", "设备旁的表单"], ["Response sheet", "回复表格"], ["Not OK highlighted", "不合格标红"], ["Daily review", "每日复核"]],
      title: ["Digital inspection checklist", "数字化点检清单"],
      problem: ["Paper checklists get filled in at the end of the shift, are hard to read, and nobody sees a failed check until the sheet is filed.", "纸质点检表常在下班前才补填，字迹难认，某项不合格往往要到归档时才被发现。"],
      solution: ["Turn the checklist into a Google Form that operators open on a phone or a shared tablet. Every answer lands in a sheet, and failed checks are highlighted at once.", "把点检表做成 Google 表单，操作员用手机或共用平板填写。每条记录都进入表格，不合格项立即高亮显示。"],
      steps: [["List the checks on your current paper sheet and remove any that nobody acts on.", "列出现有纸质表上的点检项，删掉没人会据此采取行动的项目。"], ["Build a Google Form: line, machine, operator, then one OK / Not OK question per check, with a comment box.", "建一个 Google 表单：产线、设备、操作员，然后每个点检项一道“合格 / 不合格”题，并附备注栏。"], ["Link the form to a sheet and add conditional formatting that colours every Not OK answer red.", "把表单连接到表格，并设置条件格式，所有“不合格”答案标红。"], ["Print the form link as a QR code and post it at each machine.", "把表单链接打印成二维码，贴在每台设备旁。"], ["Review the Not OK list at the daily meeting and agree who fixes each one.", "在每日例会上查看不合格清单，明确每项由谁处理。"]],
      benefits: [["Checks are done at the machine, not copied later.", "点检在设备旁完成，而不是事后补抄。"], ["Failed checks are visible the same day.", "不合格项当天就能看到。"], ["A searchable history of every check.", "每次点检都有可查询的历史记录。"]],
      example: ["Start-up check – Line 2 filler – 06:05 (sample data)\n\nGuards closed ........ OK\nAir pressure 6 bar ... OK\nNozzles clean ........ NOT OK – nozzle 4 dripping\nLabel roll loaded .... OK\n\n1 of 4 checks failed → shown in red on the Not OK list", "开机点检 – 2 号线灌装机 – 06:05（示例数据）\n\n防护门关闭 ........ 合格\n气压 6 bar ......... 合格\n喷嘴清洁 .......... 不合格 – 4 号喷嘴滴漏\n标签卷已装好 ...... 合格\n\n4 项中 1 项不合格 → 在不合格清单中标红"],
      related: ["shift-handover", "downtime-troubleshooter", "weekly-action-tracker"]
    },
    {
      id: "wf-downtime-qr",
      level: "beginner",
      tools: ["forms", "sheets", "qr", "looker"],
      cat: "forms",
      build: "nocode",
      aud: ["mfg"],
      time: ["Half a day", "约半天"],
      flow: [["QR code at the machine", "设备上的二维码"], ["Pre-filled form", "预填表单"], ["Response sheet", "回复表格"], ["Weekly loss chart", "每周损失图表"]],
      title: ["Downtime logging with QR codes", "扫码记录停机"],
      problem: ["Stops are written on whiteboards or forgotten, so the real downtime and its causes are never known.", "停机记在白板上或干脆被遗忘，真实的停机时间和原因始终无从得知。"],
      solution: ["A QR code on each machine opens a short form with the machine already filled in. Operators log start, end and reason in seconds, and a dashboard shows the biggest losses.", "每台设备上贴一个二维码，扫码打开已预填设备的简短表单。操作员几秒钟就能记录开始、结束和原因，看板显示最大的损失。"],
      steps: [["Agree a short list of eight to ten downtime reasons with the team.", "与团队商定一份八到十个停机原因的简短清单。"], ["Build a Google Form: machine, start time, end time, reason (drop-down), comment.", "建一个 Google 表单：设备、开始时间、结束时间、原因（下拉）、备注。"], ["Use the form's pre-filled link to make one link per machine, and print each as a QR code label.", "利用表单的“预填链接”为每台设备生成一个链接，并分别打印成二维码标签。"], ["In the response sheet, add a minutes column, for example =(D2-C2)*1440 when start is in C and end in D.", "在回复表格中新增分钟列，例如开始时间在 C 列、结束时间在 D 列时用 =(D2-C2)*1440。"], ["Connect the sheet to Looker Studio and chart minutes by reason and by machine each week.", "把表格连接到 Looker Studio，每周按原因和设备统计停机分钟数。"]],
      benefits: [["Stops are logged when they happen.", "停机发生时就被记录。"], ["Reasons are consistent, so they can be counted.", "原因统一，便于统计。"], ["The biggest losses are visible every week.", "每周都能看到最大的损失。"]],
      example: ["Downtime this week – Line 3 (sample data)\n\nFiller jams ........... 140 min (11 stops)\nWaiting for material .. 75 min (3 stops)\nChangeover overrun .... 60 min (2 stops)\nOther ................. 25 min (4 stops)\n\nTotal 300 min · Top reason: filler jams (47%)", "本周停机 – 3 号线（示例数据）\n\n灌装机卡料 ........ 140 分钟（11 次）\n等待物料 .......... 75 分钟（3 次）\n换线超时 .......... 60 分钟（2 次）\n其他 .............. 25 分钟（4 次）\n\n合计 300 分钟 · 首要原因：灌装机卡料（47%）"],
      related: ["tool-downtime-analysis", "downtime-troubleshooter", "oee-loss-calculator"]
    },
    {
      id: "wf-sheets-combine",
      level: "intermediate",
      tools: ["sheets"],
      cat: "sheets",
      build: "lowcode",
      aud: ["mfg", "biz"],
      time: ["2 to 3 hours", "2 到 3 小时"],
      flow: [["Line sheets", "各产线表格"], ["IMPORTRANGE", "IMPORTRANGE"], ["QUERY clean-up", "QUERY 整理"], ["Master view", "总表视图"]],
      title: ["Combine team sheets automatically", "自动合并各团队表格"],
      problem: ["Each line or team keeps its own spreadsheet, and someone spends hours every week copying them into one master file.", "每条产线或每个团队都有自己的表格，每周都要有人花几个小时把它们复制到一份总表里。"],
      solution: ["Keep the team sheets as they are, with the same columns. A master sheet pulls them together with IMPORTRANGE and QUERY, so the combined view is always up to date.", "各团队表格保持不变，只需列结构一致。总表用 IMPORTRANGE 和 QUERY 把它们汇总在一起，合并视图始终是最新的。"],
      steps: [["Agree one column layout for every team sheet: date, line, item, quantity, status.", "为所有团队表格约定统一的列：日期、产线、项目、数量、状态。"], ["In the master sheet, connect each team sheet once with =IMPORTRANGE(\"sheet URL\", \"Data!A2:E\") and allow access.", "在总表中，用 =IMPORTRANGE(\"表格网址\", \"Data!A2:E\") 逐个连接团队表格并允许访问。"], ["Stack the ranges with curly brackets: ={IMPORTRANGE(…); IMPORTRANGE(…)}.", "用大括号把各区域上下拼接：={IMPORTRANGE(…); IMPORTRANGE(…)}。"], ["Wrap the result in QUERY to drop blank rows and sort: =QUERY({…}, \"select * where Col1 is not null order by Col1 desc\").", "再用 QUERY 包裹，去掉空行并排序：=QUERY({…}, \"select * where Col1 is not null order by Col1 desc\")。"], ["Build summary tables and charts on the combined range, never on the team sheets.", "汇总表和图表都基于合并区域制作，不要直接改团队表格。"]],
      benefits: [["No more weekly copy and paste.", "不再需要每周复制粘贴。"], ["Teams keep working in their own sheet.", "各团队仍在自己的表格中工作。"], ["One combined view that is always current.", "一个始终最新的合并视图。"]],
      example: ["Master view – combined from 3 line sheets (sample data)\n\nDate    Line  Item            Qty    Status\n12 Nov  L1    Bottles 500 ml  4,512  Done\n12 Nov  L2    Cans 330 ml     3,655  Done\n12 Nov  L3    Bottles 1 L     1,980  Short\n\nSources: 3 sheets · updates when a line sheet changes", "总表视图 – 由 3 张产线表格合并（示例数据）\n\n日期     产线  项目          数量    状态\n11/12   L1   500 ml 瓶装   4,512   完成\n11/12   L2   330 ml 罐装   3,655   完成\n11/12   L3   1 L 瓶装      1,980   短缺\n\n来源：3 张表格 · 产线表格变化时自动更新"],
      related: ["production-kpi-dashboard", "tool-excel-formula", "weekly-action-tracker"]
    },
    {
      id: "wf-due-alerts",
      level: "intermediate",
      tools: ["sheets", "script", "gmail"],
      cat: "script",
      build: "code",
      aud: ["mfg", "biz"],
      time: ["2 to 3 hours", "2 到 3 小时"],
      flow: [["Register sheet", "登记表"], ["Weekly trigger", "每周触发"], ["Script checks dates", "脚本检查日期"], ["Email to each owner", "邮件发给每位负责人"]],
      title: ["Due-date alerts for calibration and certificates", "校准与证书到期提醒"],
      problem: ["Calibration dates, certificates and permits are tracked in a sheet, but expiry is often noticed only when an auditor asks.", "校准日期、证书和许可证都记在表格里，但往往要等审核员问起才发现已经过期。"],
      solution: ["One register sheet holds every item with its owner and due date. A weekly script emails each owner the items due in the next two weeks or already overdue.", "一张登记表记录每个项目及其负责人和到期日。每周由脚本把未来两周内到期或已过期的项目发邮件给对应负责人。"],
      steps: [["Create a Register sheet: item, type, owner email, due date. One row per gauge, certificate or permit.", "建一张“Register”登记表：项目、类型、负责人邮箱、到期日。每个量具、证书或许可证一行。"], ["Add conditional formatting: red when the due date has passed, amber within 14 days.", "添加条件格式：已过期标红，14 天内到期标黄。"], ["Paste the script below into Extensions → Apps Script and run it once to grant access.", "把下面的脚本粘贴到“扩展程序 → Apps Script”，先运行一次以授予权限。"], ["Add a weekly time-driven trigger for checkDueDates.", "为 checkDueDates 添加每周定时触发器。"], ["When an item is renewed, update its due date in the register, which stops the alert.", "项目更新后，在登记表中修改到期日，提醒随即停止。"]],
      benefits: [["Owners hear about expiry before it happens.", "负责人在到期前就收到提醒。"], ["One register instead of several lists.", "一张登记表取代多份清单。"], ["Evidence ready for audits.", "审核时可直接拿出依据。"]],
      example: ["Due-date alert: 3 item(s) (sample data)\n\nTorque wrench TW-07 (Calibration) – OVERDUE by 3 days\nForklift licence, Operator B (Certificate) – due in 9 days\nPressure gauge PG-12 (Calibration) – due in 13 days", "到期提醒：3 项（示例数据）\n\n扭力扳手 TW-07（校准）– 已逾期 3 天\n叉车证，操作员 B（证书）– 9 天后到期\n压力表 PG-12（校准）– 13 天后到期"],
      related: ["skills-matrix", "weekly-action-tracker", "8d-report"],
      code: CODE["wf-due-alerts"]
    },
    {
      id: "wf-appsheet-6s",
      level: "intermediate",
      tools: ["appsheet", "sheets", "gmail"],
      cat: "appsheet",
      build: "lowcode",
      aud: ["mfg"],
      time: ["About 1 day", "约 1 天"],
      flow: [["Mobile audit", "手机稽核"], ["AppSheet", "AppSheet"], ["Google Sheets", "Google 表格"], ["Owner notified", "通知负责人"], ["Corrective action tracking", "整改跟踪"]],
      title: ["6S audit mobile app", "6S 稽核手机应用"],
      problem: ["6S audits are scored on paper, photos stay on personal phones, and findings are not followed up.", "6S 稽核在纸上打分，照片留在个人手机里，发现的问题也没人跟进。"],
      solution: ["An AppSheet app lets the auditor score each area on a phone, attach photos and raise findings. Each finding gets an owner and a due date, and the owner is notified.", "用 AppSheet 应用在手机上为每个区域打分、附上照片并提出问题。每个问题都有负责人和截止日期，并自动通知负责人。"],
      steps: [["Set up two sheets: Audits (date, area, auditor, score per S) and Findings (audit, photo, description, owner, due date, status).", "建两张表：稽核表（日期、区域、稽核人、每个 S 的得分）和问题表（所属稽核、照片、描述、负责人、截止日期、状态）。"], ["Create an AppSheet app from the sheets and make Findings reference Audits, so findings are added from inside an audit.", "用这两张表生成 AppSheet 应用，让问题表引用稽核表，这样可以在稽核中直接添加问题。"], ["Set the photo column type to Image so the camera opens from the form.", "把照片列类型设为 Image，表单中即可直接调用相机。"], ["Add a bot: when a finding is added, email the owner with the photo and due date.", "添加一个机器人：新增问题时，把照片和截止日期通过邮件发给负责人。"], ["Add a view of open findings by area and review it on the weekly 6S walk.", "添加按区域查看未关闭问题的视图，在每周 6S 巡查时复核。"]],
      benefits: [["Scores and photos are captured in one place.", "打分和拍照在同一处完成。"], ["Every finding has an owner and a date.", "每个问题都有负责人和日期。"], ["Scores by area show where to focus.", "按区域的得分显示重点在哪里。"]],
      example: ["6S audit – Packing area – 12 Nov (sample data)\n\nSort 4/5 · Set in order 3/5 · Shine 4/5\nStandardise 3/5 · Sustain 3/5 · Safety 5/5\nTotal 22/30\n\nFindings raised: 2\n1. Unlabelled tote stack at bay 3 – owner: packing lead – due 19 Nov\n2. Broom missing from shadow board – owner: shift B – due 14 Nov", "6S 稽核 – 包装区 – 11 月 12 日（示例数据）\n\n整理 4/5 · 整顿 3/5 · 清扫 4/5\n清洁 3/5 · 素养 3/5 · 安全 5/5\n合计 22/30\n\n提出问题：2 项\n1. 3 号工位周转箱堆放未标识 – 负责人：包装组长 – 截止 11 月 19 日\n2. 形迹板上缺扫帚 – 负责人：B 班 – 截止 11 月 14 日"],
      related: ["weekly-action-tracker", "repeated-mistake-worksheet", "escalation-report"]
    },
    {
      id: "wf-manpower",
      level: "intermediate",
      tools: ["sheets", "forms"],
      cat: "mfg",
      build: "lowcode",
      aud: ["mfg"],
      time: ["Half a day", "约半天"],
      flow: [["Employee availability", "员工在岗情况"], ["Skills database", "技能数据库"], ["Automatic gap check", "自动缺口检查"], ["Allocation view", "分配视图"]],
      title: ["Daily manpower allocation", "每日人力分配"],
      problem: ["Every morning the supervisor works out who is in, who can run which machine and where the gaps are, from memory and a paper roster.", "每天早上主管都要凭记忆和纸质排班表，弄清谁来上班、谁能操作哪台设备、哪里缺人。"],
      solution: ["Absences are reported through a short form. A sheet combines them with the skills list and shows, machine by machine, who is available, who is qualified and where the gaps are.", "缺勤通过一张简短表单上报。表格把缺勤与技能清单结合起来，逐台设备显示谁在岗、谁有资格、哪里有缺口。"],
      steps: [["In a Skills tab, list every person with one column per machine and Y where they are qualified.", "在“Skills”页列出每个人，每台设备一列，有资格操作的填 Y。"], ["Set up a Google Form for absence: name, date, reason. Link it to an Absence tab.", "建一张缺勤表单：姓名、日期、原因，并连接到“Absence”页。"], ["In a Today tab, mark each person with =IF(COUNTIFS(Absence!B:B,A2,Absence!C:C,TODAY()),\"Absent\",\"Available\").", "在“Today”页用 =IF(COUNTIFS(Absence!B:B,A2,Absence!C:C,TODAY()),\"Absent\",\"Available\") 标出每人是否在岗。"], ["For each machine, count available qualified people with COUNTIFS and compare with the number required.", "对每台设备，用 COUNTIFS 统计在岗且有资格的人数，并与所需人数比较。"], ["Colour gaps red and use the sheet at the start-of-shift meeting to move people.", "缺口标红，在班前会上据此调配人员。"]],
      benefits: [["Gaps are visible before the shift starts.", "开班前就能看到缺口。"], ["Only qualified people are allocated.", "只分配有资格的人员。"], ["The data shows where cross-training is needed.", "数据显示哪里需要交叉培训。"]],
      example: ["Manpower – Thu 13 Nov, day shift (sample data)\n\nLine 1 filler    need 2 · qualified available 3 · OK\nLine 2 labeller  need 1 · qualified available 1 · OK\nLine 3 filler    need 2 · qualified available 1 · GAP 1\n\nAbsent: 2 · Spare: Operator C (qualified: Line 1, Line 3)", "人力 – 11 月 13 日周四白班（示例数据）\n\n1 号线灌装机  需 2 人 · 在岗合格 3 人 · 正常\n2 号线贴标机  需 1 人 · 在岗合格 1 人 · 正常\n3 号线灌装机  需 2 人 · 在岗合格 1 人 · 缺 1 人\n\n缺勤：2 人 · 机动：操作员 C（可操作 1 号线、3 号线）"],
      related: ["manpower-gap-calculator", "skills-matrix", "supervisor-daily-planner"]
    },
    {
      id: "wf-meeting-actions",
      level: "beginner",
      tools: ["ai", "sheets"],
      cat: "productivity",
      build: "nocode",
      aud: ["biz", "personal"],
      time: ["About 30 minutes", "约 30 分钟"],
      flow: [["Rough notes", "粗略笔记"], ["Saved prompt", "保存的提示词"], ["AI action table", "AI 行动表格"], ["Your check", "人工检查"], ["Action tracker", "行动追踪表"]],
      title: ["Meeting notes to action list", "会议笔记变行动清单"],
      problem: ["Meetings end with decisions in someone's notebook, and the actions are forgotten before the next meeting.", "会议结束时，决定只记在某人的笔记本里，下次开会前行动早已被遗忘。"],
      solution: ["Paste rough notes into an AI tool with a saved prompt that returns decisions and actions as a table. Check it, then paste the actions into your tracker.", "把粗略笔记粘贴到 AI 工具，用保存好的提示词把决定和行动整理成表格。核对后，把行动粘贴到追踪表中。"],
      steps: [["Take notes as usual, and write down names and dates when actions are agreed.", "照常记笔记，约定行动时记下人名和日期。"], ["Use a saved prompt: \"From these notes, list the decisions, then the actions as a table: action, owner, due date. Mark anything unclear with ?\"", "使用保存好的提示词：“根据这些笔记，先列出决定，再把行动整理成表格：行动、负责人、截止日期。不清楚的地方标 ?”"], ["Remove confidential details before pasting, unless your company has approved the tool.", "粘贴前去掉机密信息，除非公司已批准使用该工具。"], ["Check every owner and date against what was agreed, and fill in the ? items.", "逐一核对负责人和日期是否与会上约定一致，补全标 ? 的项目。"], ["Paste the table into the action tracker and send it within the hour.", "把表格粘贴到行动追踪表，并在一小时内发出。"]],
      benefits: [["Actions are written up while the meeting is fresh.", "趁会议记忆犹新时整理好行动。"], ["Every action has an owner and a date.", "每个行动都有负责人和日期。"], ["Less time spent writing minutes.", "写会议纪要的时间更少。"]],
      example: ["Weekly production meeting – actions (sample data)\n\nDecisions\n1. Line 3 runs 1 L bottles only until the valve overhaul.\n\nAction                         Owner        Due\nBook valve overhaul            Maintenance  14 Nov\nUpdate weekly plan for Line 3  Planner      13 Nov\nConfirm spare seals in stock   Stores       ?\n\nAI draft – checked by the meeting owner.", "每周生产会议 – 行动（示例数据）\n\n决定\n1. 阀门大修前，3 号线只生产 1 L 瓶装。\n\n行动                负责人   截止\n安排阀门大修         维修     11 月 14 日\n更新 3 号线周计划     计划员   11 月 13 日\n确认备用密封件库存    仓库     ?\n\nAI 草稿 – 已由会议负责人核对。"],
      related: ["tool-meeting-minutes", "weekly-action-tracker", "ai-prompt-pack"]
    },
    {
      id: "wf-inbox-templates",
      level: "beginner",
      tools: ["gmail"],
      cat: "productivity",
      build: "nocode",
      aud: ["personal", "biz"],
      time: ["About 1 hour", "约 1 小时"],
      flow: [["Incoming mail", "收到的邮件"], ["Filters", "过滤规则"], ["Labels", "标签"], ["Inbox: action only", "收件箱：只留待办"], ["Template reply", "模板回复"]],
      title: ["Inbox filters and reply templates", "邮箱过滤规则与回复模板"],
      problem: ["System notifications and copy-in emails bury the messages that need a reply, and the same answers are typed again and again.", "系统通知和抄送邮件把需要回复的邮件淹没了，同样的回答还要一遍遍重新输入。"],
      solution: ["Filters sort routine mail into labels automatically, so the inbox shows what needs you. Saved templates answer repeat questions in two clicks.", "用过滤规则自动把例行邮件归入标签，收件箱只留下需要你处理的邮件。用保存的模板，两次点击就能回复重复的问题。"],
      steps: [["Look at last week's inbox and list the senders and subjects you never reply to.", "查看上周的收件箱，列出你从不回复的发件人和主题。"], ["Create a filter for each one: skip the inbox and apply a label such as Reports or FYI.", "为每一类建立过滤规则：跳过收件箱，并加上“报告”或“仅供参考”等标签。"], ["Write templates for your three most common replies, with [brackets] for the parts that change.", "为最常用的三种回复写好模板，变化的部分用 [方括号] 标出。"], ["Turn on templates in Gmail settings (Quick Parts in Outlook) and save each one.", "在 Gmail 设置中开启模板功能（Outlook 用“快速部件”），并逐一保存。"], ["Check the labels once a day at a fixed time instead of all day.", "每天在固定时间查看一次标签邮件，而不是整天盯着。"]],
      benefits: [["The inbox shows only mail that needs action.", "收件箱只显示需要处理的邮件。"], ["Repeat replies take seconds.", "重复回复只需几秒。"], ["Nothing is deleted, so nothing is lost.", "邮件不会被删除，也就不会丢失。"]],
      example: ["Inbox after filters – Monday 08:30 (sample data)\n\nInbox: 6 need a reply\nReports: 14 (system reports, read at 16:00)\nFYI: 22 (copy-ins, skim at 16:00)\n\nTemplate used: \"Delivery date confirmation\" – 3 times", "设置过滤规则后的收件箱 – 周一 08:30（示例数据）\n\n收件箱：6 封需要回复\n报告：14 封（系统报告，16:00 阅读）\n仅供参考：22 封（抄送邮件，16:00 浏览）\n\n使用的模板：“交期确认” – 3 次"],
      related: ["tool-email-writer", "supervisor-daily-planner", "ai-prompt-pack"]
    },
    {
      id: "wf-request-approval",
      level: "intermediate",
      tools: ["forms", "sheets", "script", "gmail"],
      cat: "bpa",
      build: "code",
      aud: ["biz", "mfg"],
      time: ["Half a day", "约半天"],
      flow: [["Request form", "申请表单"], ["Response sheet", "回复表格"], ["Script on submit", "提交时运行脚本"], ["Approver email", "邮件通知审批人"], ["Status log", "状态记录"]],
      title: ["Request and approval workflow", "申请与审批流程"],
      problem: ["Purchase, overtime and leave requests travel by email and paper, so approvals are slow and nobody can see what is pending.", "采购、加班和请假申请靠邮件和纸张流转，审批慢，也没人知道哪些还在等待。"],
      solution: ["Requests come in through one Google Form. A script notifies the approver and the requester, and the response sheet becomes the log of every request and its status.", "所有申请都通过一张 Google 表单提交。脚本通知审批人和申请人，回复表格就成为每条申请及其状态的记录。"],
      steps: [["Build a Google Form with these questions: Requester email, Request type, Details, Amount.", "建一个 Google 表单，问题为：Requester email、Request type、Details、Amount（申请人邮箱、类型、详情、金额）。"], ["Link it to a sheet and add a Status header right after the form's last column.", "把表单连接到表格，并在表单最后一列之后加一个“Status”列标题。"], ["Paste the script below into Extensions → Apps Script, set the approver's email and add an On form submit trigger for onRequest.", "把下面的脚本粘贴到“扩展程序 → Apps Script”，设置审批人邮箱，并为 onRequest 添加“提交表单时”触发器。"], ["The approver changes Status to Approved or Rejected in the sheet; give them a filter view that shows Pending only.", "审批人在表格中把 Status 改为 Approved 或 Rejected；为其建一个只显示 Pending 的筛选视图。"], ["Review requests pending for more than two days in the weekly meeting.", "每周例会上复查超过两天仍未处理的申请。"]],
      benefits: [["Every request is in one place, with a status.", "每条申请集中在一处，并有状态。"], ["Approvers are told at once.", "审批人第一时间收到通知。"], ["Requesters know their request arrived.", "申请人知道申请已送达。"]],
      example: ["Approval needed: Overtime (sample data)\n\nRequest row 27\nFrom: Line 2 team leader\nDetails: 4 operators × 3 h on Saturday to recover the Line 3 backlog\nAmount: 12 hours\n\nSet the Status column to Approved or Rejected.", "需要审批：加班（示例数据）\n\n申请第 27 行\n申请人：2 号线组长\n详情：周六 4 名操作员各加班 3 小时，追回 3 号线欠产\n数量：12 小时\n\n请把 Status 列改为 Approved 或 Rejected。"],
      related: ["escalation-report", "decision-matrix", "weekly-action-tracker"],
      code: CODE["wf-request-approval"]
    }
  ];

  /* Add each workflow to the resource library (Automation & Digitalisation) */
  var setup = { beginner: ["About 1 hour", "约 1 小时"], intermediate: ["Half a day", "约半天"], advanced: ["1 to 2 days", "1 到 2 天"] };
  D.types.workflow = ["Workflow", "工作流程"];
  D.workflows.forEach(function (w) {
    var r = {
      id: w.id, url: "automation.html#" + w.id, type: "workflow", ai: w.tools.indexOf("ai") > -1, gated: false, noShot: true,
      cats: ["ops", "time"], level: w.level, version: "1.0", updated: "2026-11-17",
      title: w.title, problem: w.problem, desc: w.solution, setup: w.time || setup[w.level],
      software: [w.tools.map(function (t) { return D.tools[t][0]; }).join(", "), w.tools.map(function (t) { return D.tools[t][1]; }).join("、")],
      formats: ["web", "copy"], cat3: "automation", lang: ["en", "zh"], access: "open"
    };
    r.related = w.related.slice(0, 3);
    D.resources.push(r);
  });
})();
