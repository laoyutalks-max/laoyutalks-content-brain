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

  D.tools = {
    forms: ["Google Forms", "Google Forms"], sheets: ["Google Sheets", "Google Sheets"], script: ["Apps Script", "Apps Script"],
    gmail: ["Gmail or Outlook", "Gmail 或 Outlook"], chat: ["Google Chat or Teams", "Google Chat 或 Teams"], ai: ["AI chat tool", "AI 对话工具"],
    appsheet: ["AppSheet", "AppSheet"], docs: ["Google Docs", "Google Docs"], looker: ["Looker Studio", "Looker Studio"]
  };

  D.workflows = [
    {
      id: "wf-production-report", level: "intermediate", tools: ["forms", "sheets", "script", "gmail"],
      title: ["Automated production reporting", "生产报告自动化"],
      problem: ["Supervisors spend the end of every shift copying numbers into a report, and managers get it late or in different formats.", "主管每个班结束时都要把数字抄进报告，管理者收到得晚，格式还各不相同。"],
      solution: ["Each shift enters its numbers once in a short form. A script summarises the day every morning and emails one standard report before the first meeting.", "每个班在一张简短的表单里录入一次数据。脚本每天早上汇总前一天的数据，在第一次会议前发出一份标准报告。"],
      steps: [
        ["Create a Google Form with the fields you report today: date, shift, line, target, actual, scrap, downtime minutes and main reason.", "建一个 Google 表单，字段就是你现在报告的内容：日期、班次、产线、目标、实际、报废、停机分钟数和主要原因。"],
        ["Link the form to a Google Sheet. Add a Summary tab with formulas for achievement %, scrap % and downtime by line for yesterday.", "把表单连接到 Google 表格。新增“汇总”页，用公式计算昨天各产线的达成率、报废率和停机时间。"],
        ["In Apps Script, write a short function that reads the Summary tab and builds the email text.", "在 Apps Script 中写一个简短的函数，读取“汇总”页并生成邮件内容。"],
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
      title: ["Google Sheets automation", "Google Sheets 自动化"],
      problem: ["Action lists and trackers live in spreadsheets, but nobody notices when items go overdue until the next meeting.", "行动清单和追踪表都放在表格里，但项目逾期了，往往要到下次开会才有人发现。"],
      solution: ["Let the sheet do the checking: formulas flag overdue items, colours make them visible, and a weekly script emails each owner their own open list.", "让表格自己检查：公式标出逾期项目，颜色让它们一目了然，每周脚本把各自的未完成清单发给每位负责人。"],
      steps: [
        ["Use one row per action with columns: action, owner email, due date, status.", "每个行动项一行，列为：行动、负责人邮箱、截止日期、状态。"],
        ["Add a Days late column: =IF(AND(D2<>\"Done\",C2<TODAY()),TODAY()-C2,\"\")", "新增“逾期天数”列：=IF(AND(D2<>\"Done\",C2<TODAY()),TODAY()-C2,\"\")"],
        ["Add conditional formatting to colour overdue rows and data validation for the status list.", "添加条件格式为逾期行上色，并为状态列设置数据验证下拉列表。"],
        ["Write an Apps Script function that groups open actions by owner and emails each person their list.", "写一个 Apps Script 函数，按负责人分组未完成项，并把清单分别发给每个人。"],
        ["Run it on a weekly trigger the day before the review meeting.", "设置每周触发，在复盘会议前一天运行。"]
      ],
      benefits: [["Overdue actions are visible without anyone checking by hand.", "无需人工检查，逾期行动一目了然。"], ["Owners get reminded of their own items only.", "负责人只收到与自己相关的提醒。"], ["Meetings spend time on blockers instead of status updates.", "会议时间用在解决障碍上，而不是汇报进度。"]],
      example: ["Your open actions – week 45 (sample data)\n\n1. Replace filler guide rail – due 31 Oct – 6 days late\n2. Update changeover checklist Line 2 – due 7 Nov\n3. Train two operators on Line 3 – due 14 Nov\n\nReply to this email or update the tracker when an item is done.",
                "你的未完成行动 – 第 45 周（示例数据）\n\n1. 更换灌装机导轨 – 截止 10 月 31 日 – 逾期 6 天\n2. 更新 2 号线换线检查表 – 截止 11 月 7 日\n3. 培训 3 号线两名操作员 – 截止 11 月 14 日\n\n完成后请回复本邮件或更新追踪表。"],
      related: ["weekly-action-tracker", "tool-excel-formula", "tool-meeting-minutes"]
    },
    {
      id: "wf-appsheet", level: "intermediate", tools: ["appsheet", "sheets", "gmail"],
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
      title: ["Document generation", "文档自动生成"],
      problem: ["Reports, certificates and records are built by copying data into Word templates, which is slow and introduces errors.", "报告、证书和记录都靠把数据复制进 Word 模板来制作，既慢又容易出错。"],
      solution: ["Keep the data in a sheet and the layout in a Google Docs template. A script fills the placeholders and saves a PDF for each row.", "数据放在表格里，版式放在 Google Docs 模板里。脚本自动填入占位符，并为每一行生成一份 PDF。"],
      steps: [
        ["Create the document once in Google Docs with placeholders like {{Name}} and {{Date}}.", "在 Google Docs 中做好一次文档，用 {{Name}}、{{Date}} 这样的占位符。"],
        ["Put one record per row in a Google Sheet, with column headers matching the placeholders.", "在 Google 表格中每行放一条记录，列标题与占位符一致。"],
        ["Write an Apps Script that copies the template, replaces each placeholder and saves the copy as a PDF in a Drive folder.", "写一个 Apps Script：复制模板、替换每个占位符，并把副本另存为 PDF 到云端硬盘文件夹。"],
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
    }
  ];

  /* Add each workflow to the resource library (Automation & Digitalisation) */
  var setup = { beginner: ["About 1 hour", "约 1 小时"], intermediate: ["Half a day", "约半天"], advanced: ["1 to 2 days", "1 到 2 天"] };
  D.types.workflow = ["Workflow", "工作流程"];
  D.workflows.forEach(function (w) {
    var r = {
      id: w.id, url: "automation.html#" + w.id, type: "workflow", ai: w.tools.indexOf("ai") > -1, gated: false, noShot: true,
      cats: ["ops", "time"], level: w.level, version: "1.0", updated: "2026-11-17",
      title: w.title, problem: w.problem, desc: w.solution, setup: setup[w.level],
      software: [w.tools.map(function (t) { return D.tools[t][0]; }).join(", "), w.tools.map(function (t) { return D.tools[t][1]; }).join("、")],
      formats: ["web", "copy"], cat3: "automation", lang: ["en", "zh"], access: "open"
    };
    r.related = w.related.slice(0, 3);
    D.resources.push(r);
  });
})();
