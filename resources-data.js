/* =========================================================
   LAOYU RESOURCES — structured data (single source of truth)
   Every resource card, filter, solution path and the standard
   detail sections on each tool page are built from this file.
   Text is [English, 中文]. Add a resource = add one object.
   ========================================================= */
window.LAOYU_DATA = {
  cats: {
    time:   { icon: "⏱", t: ["Save Time", "节省时间"], d: ["Plan, hand over and report faster.", "更快地计划、交接和汇报。"] },
    people: { icon: "👥", t: ["Manage People", "管理团队"], d: ["Cover, develop and talk to your team.", "人员补位、培养与沟通。"] },
    perf:   { icon: "📊", t: ["Analyse Performance", "分析绩效"], d: ["See where output and time really go.", "看清产量和时间真正去了哪里。"] },
    solve:  { icon: "🔍", t: ["Solve Problems", "解决问题"], d: ["Find causes and fix them for good.", "找到原因，彻底解决。"] },
    ops:    { icon: "🏭", t: ["Improve Operations", "改善运营"], d: ["Run a steadier, safer line.", "让产线更稳定、更安全。"] },
    ai:     { icon: "🤖", t: ["Use AI", "使用 AI"], d: ["Try AI demos and ready prompts.", "体验 AI 演示和现成提示词。"] }
  },
  levels: {
    beginner:     ["Beginner", "入门"],
    intermediate: ["Intermediate", "进阶"],
    advanced:     ["Advanced", "高级"]
  },
  types: {
    demo:       ["AI demo", "AI 演示"],
    solver:     ["Problem solver", "问题解决"],
    template:   ["Template", "模板"],
    tracker:    ["Tracker", "追踪表"],
    calculator: ["Calculator", "计算器"],
    checklist:  ["Checklist", "清单"],
    prompts:    ["AI prompts", "AI 提示词"]
  },
  formats: {
    web: ["Online", "在线"], print: ["Print", "打印"], pdf: ["PDF", "PDF"], csv: ["CSV", "CSV"],
    xlsx: ["Excel", "Excel"], copy: ["Copy text", "复制文本"], txt: ["Text file", "文本文件"]
  },

  resources: [
    /* ---------------- AI DEMOS (no sign-up) ---------------- */
    {
      id: "demo-daily-report", url: "demo-daily-report.html", type: "demo", ai: true, gated: false,
      cats: ["ai", "perf", "time"], level: "beginner", version: "1.0", updated: "2026-11-01",
      title: ["AI Daily Production Report", "AI 每日生产报告"],
      problem: ["Writing the daily report takes too long and still misses things.", "写日报太花时间，而且还是会漏掉重点。"],
      desc: ["Enter today's numbers and get a structured report: target vs actual, gap, quality, downtime, missing information and follow-up actions.", "输入今天的数据，得到结构化报告：目标对比实际、差距、质量、停机、缺失信息和跟进行动。"],
      setup: ["3 min", "3 分钟"], software: ["Web browser", "网页浏览器"], formats: ["web", "copy", "txt"],
      kit: {
        who: ["Supervisors and team leads who write a daily or end-of-shift production report.", "需要写每日或下班生产报告的主管与组长。"],
        inc: [["Report generator with sample data", "带示例数据的报告生成器"], ["Achievement, gap, quality and downtime summary", "达成率、差距、质量与停机摘要"], ["Missing-information check", "缺失信息检查"], ["Copy, download and an AI prompt for real AI", "复制、下载，以及用于真实 AI 的提示词"]],
        steps: [["Press LOAD SAMPLE to see how it works, then enter your own shift numbers.", "点击“载入示例”看看效果，然后输入你自己的班次数据。"], ["Press GENERATE REPORT and fix anything listed under Missing information.", "点击“生成报告”，并补齐“缺失信息”里列出的内容。"], ["Copy or download the report, or paste your data into the AI prompt below.", "复制或下载报告，或把数据粘贴到下面的 AI 提示词中。"]],
        prompt: ["Act as a production supervisor's reporting assistant. Here is today's data for [line], [shift]:\nTarget: [units]  Actual: [units]  Scrap: [units, defect]\nDowntime: [minutes – reason, ...]\nManpower: planned [n], actual [n]\nNotes: [anything else]\n\nWrite a daily report with: 1) one-line summary, 2) target vs actual with achievement % and gap, 3) quality, 4) downtime with the biggest loss, 5) missing information I should add, 6) up to 3 follow-up actions with suggested owners.\nOnly use the data given. Mark anything you assume.", "请担任生产主管的报告助手。这是 [产线]、[班次] 今天的数据：\n目标：[件]  实际：[件]  报废：[件、缺陷]\n停机：[分钟 – 原因，……]\n人员：计划 [人数]，实际 [人数]\n备注：[其他信息]\n\n请写一份日报，包括：1）一句话总结，2）目标对比实际，含达成率和差距，3）质量，4）停机及最大损失，5）我应补充的缺失信息，6）最多 3 个跟进行动及建议负责人。\n只使用提供的数据，凡是推测的内容请标注。"],
        out: ["A structured report with summary, KPIs, quality, downtime, missing information and follow-up actions.", "一份结构化报告，含摘要、KPI、质量、停机、缺失信息和跟进行动。"],
        lim: ["Simulated AI: fixed rules, not a language model. It cannot see context you don't enter. Check the numbers before sending.", "模拟 AI：基于固定规则，不是语言模型。它看不到你没填写的背景信息。发送前请核对数字。"]
      }
    },
    {
      id: "demo-root-cause", url: "demo-root-cause.html", type: "demo", ai: true, gated: false,
      cats: ["ai", "solve"], level: "beginner", version: "1.0", updated: "2026-11-01",
      title: ["AI Root Cause Assistant", "AI 根本原因助手"],
      problem: ["People jump to a cause before checking the facts.", "大家还没核实事实就急着下结论。"],
      desc: ["Describe a problem and get a clear problem statement, a 5-Whys investigation guide, causes to check, controls and a verification plan.", "描述一个问题，得到清晰的问题描述、5 个为什么调查指引、待核实原因、控制措施和验证计划。"],
      setup: ["5 min", "5 分钟"], software: ["Web browser", "网页浏览器"], formats: ["web", "copy", "txt"],
      kit: {
        who: ["Supervisors, engineers and QA starting an investigation.", "开始一项调查的主管、工程师和质量人员。"],
        inc: [["Problem statement builder with completeness check", "带完整性检查的问题描述生成"], ["Five Whys investigation guide", "5 个为什么调查指引"], ["Possible causes to check (6M)", "待核实的可能原因（6M）"], ["Controls by strength and a verification plan", "按强弱排列的控制措施和验证计划"]],
        steps: [["Describe the problem: what, where, when, how much and impact. No causes yet.", "描述问题：什么、在哪里、什么时候、有多少以及影响。先不写原因。"], ["Add what changed recently and any Whys you already know.", "补充最近有什么变化，以及你已知道的“为什么”。"], ["Generate the plan, then check each possible cause with data before acting.", "生成计划，然后在行动前用数据逐一核实可能原因。"]],
        prompt: ["Act as a root cause analysis facilitator. Problem: [what], at [where], since [when], [how much]. Impact: [impact]. Recent changes: [changes].\n1. Rewrite the problem statement and tell me what is missing.\n2. Guide me through 5 Whys one question at a time. After each answer, ask what evidence confirms it. Do not decide the root cause for me.\n3. List possible causes under the 6Ms with a quick way to check each.\n4. Suggest controls from strongest to weakest and a 30-day verification plan.", "请担任根本原因分析的引导者。问题：[什么]，地点 [哪里]，自 [何时] 起，[多少]。影响：[影响]。最近的变化：[变化]。\n1. 重写问题描述，并告诉我缺少什么。\n2. 一次一个问题，引导我做 5 个为什么。每个回答后，问我有什么证据能确认。不要替我决定根本原因。\n3. 在 6M 下列出可能原因，并给出快速核实方法。\n4. 按强弱建议控制措施，以及 30 天验证计划。"],
        out: ["A clear problem statement, a 5-Whys guide, causes to check, controls and a verification plan.", "清晰的问题描述、5 个为什么指引、待核实原因、控制措施和验证计划。"],
        lim: ["Simulated AI: it matches keywords to common causes. It never confirms a root cause; only your data and tests can.", "模拟 AI：它把关键词与常见原因匹配。它从不确认根本原因，只有你的数据和试验可以。"]
      }
    },
    {
      id: "demo-shift-handover", url: "demo-shift-handover.html", type: "demo", ai: true, gated: false,
      cats: ["ai", "time", "ops"], level: "beginner", version: "1.0", updated: "2026-11-01",
      title: ["AI Shift Handover Assistant", "AI 交接班助手"],
      problem: ["Handover notes are messy, so issues get lost between shifts.", "交接班记录很乱，问题在班次之间丢失。"],
      desc: ["Paste rough handover notes and get them sorted into safety, quality, equipment, material and manpower, with open actions, owners and gaps.", "粘贴随手写的交接记录，自动整理成安全、质量、设备、物料和人员，并列出未完成行动、负责人和缺失信息。"],
      setup: ["2 min", "2 分钟"], software: ["Web browser", "网页浏览器"], formats: ["web", "copy", "txt"],
      kit: {
        who: ["Shift leads and supervisors who hand over with rough notes or chat messages.", "用随手笔记或聊天消息交接的班长与主管。"],
        inc: [["Sorting into safety, quality, equipment, material and manpower", "按安全、质量、设备、物料和人员分类"], ["Outstanding actions with owners and deadlines", "含负责人和期限的未完成行动"], ["Next-shift priorities", "下一班优先事项"], ["Missing-information check, copy and download", "缺失信息检查、复制和下载"]],
        steps: [["Paste your handover notes (or load the sample).", "粘贴交接记录（或载入示例）。"], ["Press ORGANISE NOTES and fill in any missing owners or deadlines.", "点击“整理记录”，补齐缺少的负责人或期限。"], ["Copy or download the summary and go through safety items face to face.", "复制或下载摘要，并当面过一遍安全事项。"]],
        prompt: ["Organise these shift handover notes.\nNotes: [paste]\nOutput: 1) Safety, Quality, Equipment, Material, Manpower: bullet points each, or 'not mentioned'. 2) Outstanding actions as a table: action, owner, deadline ('owner needed' / 'deadline needed' if missing). 3) Top 3 priorities for the next shift, safety first. 4) Missing information to confirm.\nDo not invent facts that are not in the notes.", "请整理这些交接班记录。\n记录：[粘贴]\n输出：1）安全、质量、设备、物料、人员：各列要点，或写“未提及”。2）未完成行动表格：行动、负责人、期限（缺少时写“需指定负责人”/“需设定期限”）。3）下一班最重要的 3 件事，安全优先。4）需要确认的缺失信息。\n不要编造记录里没有的事实。"],
        out: ["Notes sorted by topic, an action table with owners and deadlines, next-shift priorities and gaps.", "按主题整理的记录、含负责人和期限的行动表、下一班优先事项和缺失信息。"],
        lim: ["Simulated AI: keyword rules can misfile a sentence. Always read the summary before you hand it over.", "模拟 AI：关键词规则可能把句子分错类。交接前请务必通读摘要。"]
      }
    },

    /* ---------------- ORIGINAL TOOLS (upgraded) ---------------- */
    {
      id: "ai-prompt-pack", url: "ai-prompt-pack.html", type: "prompts", ai: true, demo: "demo-daily-report",
      cats: ["ai", "time"], level: "beginner", version: "2.0", updated: "2026-11-01",
      title: ["AI Prompt Pack for Operations Managers", "运营经理 AI 提示词包"],
      problem: ["AI gives vague answers because the question is vague.", "问题问得含糊，AI 的回答也就含糊。"],
      desc: ["10 tested prompts for reports, repeat mistakes, manpower, audits and KPIs. Search, filter, fill the highlighted parts and copy.", "10 个经过实测的提示词，覆盖报告、重复错误、人力、审核和 KPI。可搜索、筛选，填写高亮部分后复制。"],
      setup: ["5 min", "5 分钟"], software: ["Any AI chat tool", "任何 AI 聊天工具"], formats: ["web", "copy"],
      kit: {
        who: ["Supervisors, engineers and managers who want useful answers from ChatGPT, Gemini, Claude or Copilot.", "希望从 ChatGPT、Gemini、Claude 或 Copilot 得到有用答案的主管、工程师和经理。"],
        inc: [["10 prompts in 5 work areas", "5 个工作领域的 10 个提示词"], ["Search and category filter", "搜索与分类筛选"], ["Input guidance and example", "填写指引与示例"]],
        steps: [["Pick a prompt by searching your problem.", "搜索你的问题，选一个提示词。"], ["Replace every highlighted part with your real (non-confidential) details.", "把每个高亮部分换成你真实的（非机密）信息。"], ["Paste into your AI tool, then check the answer against your own data.", "粘贴到 AI 工具中，再用你自己的数据核对答案。"]],
        prompt: ["Act as an experienced manufacturing operations coach. I will give you a prompt template from the LAOYU Prompt Pack and my details. Before answering, list anything important I left out and ask me up to 3 questions. Then answer in short bullet points a supervisor can act on today.\n\nTemplate: [paste prompt]\nMy details: [line, shift, numbers, problem]", "请扮演经验丰富的制造运营教练。我会给你一个老鱼提示词包里的模板和我的信息。回答前，先列出我遗漏的重要信息，并最多问我 3 个问题。然后用主管今天就能执行的简短要点来回答。\n\n模板：[粘贴提示词]\n我的信息：[产线、班次、数据、问题]"],
        out: ["A short, specific answer with questions about anything you missed.", "简短具体的回答，并就你遗漏的信息提出问题。"],
        lim: ["AI can sound confident and still be wrong. Never paste confidential customer or personal data. Verify numbers yourself.", "AI 可能语气笃定却依然出错。不要粘贴机密的客户或个人数据。数字请自己核实。"]
      }
    },
    {
      id: "supervisor-daily-planner", url: "supervisor-daily-planner.html", type: "template", ai: true,
      cats: ["time", "ops"], level: "beginner", version: "2.0", updated: "2026-11-01",
      title: ["Supervisor Daily Planner", "主管每日计划表"],
      problem: ["The day gets eaten by firefighting before priorities are clear.", "还没理清优先级，一天就被救火吃掉了。"],
      desc: ["Plan the shift in 5 minutes: top 3 priorities, people, risks and a daily summary, plus an AI planning prompt.", "5 分钟做好班次计划：最重要的 3 件事、人员、风险和每日总结，并附 AI 计划提示词。"],
      setup: ["5 min a day", "每天 5 分钟"], software: ["Web browser", "网页浏览器"], formats: ["web", "print", "pdf"],
      kit: {
        who: ["Supervisors and team leads starting a shift.", "开班前的主管与组长。"],
        inc: [["Daily planning sheet", "每日计划表"], ["AI daily planning prompt", "AI 每日计划提示词"], ["Example shift plan", "班次计划示例"], ["End-of-day summary guide", "下班总结指引"]],
        steps: [["Before the shift: write today's target and the 3 things that must happen.", "开班前：写下今天的目标和必须完成的 3 件事。"], ["Check people and material against the plan; note risks.", "按计划核对人员和物料，记下风险。"], ["At the end: use the summary guide (or the AI prompt) to write a 5-line summary.", "下班时：用总结指引（或 AI 提示词）写一份 5 行总结。"]],
        prompt: ["Act as my shift planning assistant. Today's target: [units]. People available: [number] (missing: [roles]). Known issues: [machines, material, quality]. Customer orders due: [orders].\n1. Rank my top 3 priorities and say why.\n2. Flag the biggest risk to the target and one action to reduce it.\n3. Suggest what to check at mid-shift.\nKeep it under 120 words.", "请担任我的班次计划助手。今天目标：[数量]。可用人数：[人数]（缺：[岗位]）。已知问题：[设备、物料、质量]。到期客户订单：[订单]。\n1. 排出最重要的 3 件事并说明原因。\n2. 指出对目标最大的风险，以及一个降低风险的行动。\n3. 建议班中要检查什么。\n控制在 200 字以内。"],
        out: ["3 ranked priorities, the biggest risk with one action, and a mid-shift check.", "排好序的 3 件事、最大风险及一个行动，以及班中检查点。"],
        lim: ["The plan is only as good as the numbers you enter. Re-check priorities if something big changes mid-shift.", "计划的好坏取决于你填入的数据。班中有重大变化时要重新确认优先级。"]
      }
    },
    {
      id: "shift-handover", url: "shift-handover.html", type: "template", ai: true, demo: "demo-shift-handover",
      cats: ["time", "ops"], level: "beginner", version: "2.0", updated: "2026-11-01",
      title: ["Shift Handover Template", "交接班模板"],
      problem: ["Open issues get lost between shifts.", "未完成的问题在交接时丢失。"],
      desc: ["Hand over in 10 minutes by topic: safety, quality, equipment, material, people and plan vs actual, with an AI summary prompt.", "10 分钟按主题交接：安全、质量、设备、物料、人员以及计划对比实际，并附 AI 总结提示词。"],
      setup: ["10 min", "10 分钟"], software: ["Web browser", "网页浏览器"], formats: ["web", "print", "pdf"],
      kit: {
        who: ["Supervisors and shift leads handing over a line or area.", "交接产线或区域的主管与班长。"],
        inc: [["Handover sheet by topic", "按主题的交接表"], ["Issue classification guide", "问题分类指引"], ["AI handover summary prompt", "AI 交接总结提示词"], ["Next-shift priority guide", "下一班优先事项指引"]],
        steps: [["Mark each topic OK, Watch or Action.", "每个主题标记为正常、关注或需处理。"], ["For every Action, write the owner and what 'done' looks like.", "每个需处理项写清负责人和完成标准。"], ["Agree the top 2 priorities for the next shift face to face.", "当面确认下一班最重要的 2 件事。"]],
        prompt: ["Turn these handover notes into a structured handover.\nNotes: [paste notes]\nOutput:\n1. Safety / Quality / Equipment / Material / Manpower: one line each (write 'not mentioned' if missing).\n2. Open actions with owner and deadline (write 'owner needed' if none).\n3. Top 2 priorities for the next shift.\n4. Questions the next shift should ask.\nDo not invent facts that are not in the notes.", "把这些交接记录整理成结构化交接内容。\n记录：[粘贴记录]\n输出：\n1. 安全 / 质量 / 设备 / 物料 / 人员：各一行（未提到的写“未提及”）。\n2. 未完成行动，含负责人和期限（没有负责人写“需指定负责人”）。\n3. 下一班最重要的 2 件事。\n4. 下一班应该追问的问题。\n不要编造记录里没有的事实。"],
        out: ["A one-screen handover sorted by topic, with owners and next-shift priorities.", "一屏看完的交接内容，按主题整理，含负责人和下一班优先事项。"],
        lim: ["A written handover never replaces a short face-to-face check on safety and quality.", "书面交接无法替代对安全和质量的简短当面确认。"]
      }
    },
    {
      id: "weekly-action-tracker", url: "weekly-action-tracker.html", type: "tracker", ai: true,
      cats: ["time", "perf"], level: "beginner", version: "2.0", updated: "2026-11-01",
      title: ["Weekly Action Tracker", "每周行动追踪表"],
      problem: ["Actions from meetings and audits never get closed.", "会议和审核里的行动项总是关不掉。"],
      desc: ["Track every action, owner and due date. Overdue items flag themselves; export to Excel and use the AI weekly review prompt.", "追踪每个行动、负责人和期限，逾期自动标出；可导出到 Excel，并使用 AI 每周回顾提示词。"],
      setup: ["10 min", "10 分钟"], software: ["Web browser", "网页浏览器"], formats: ["web", "csv", "print"],
      kit: {
        who: ["Managers and team leads running weekly reviews or corrective actions.", "负责每周回顾或纠正措施的经理与组长。"],
        inc: [["Action tracker with overdue alerts", "带逾期提醒的行动追踪表"], ["CSV export for Excel", "可导出 Excel 的 CSV"], ["AI overdue review prompt", "AI 逾期回顾提示词"], ["Weekly summary format", "每周总结格式"]],
        steps: [["Add each action with one owner and a real date.", "每个行动只写一个负责人和真实日期。"], ["Review overdue items first every week; agree new dates or escalate.", "每周先看逾期项，确定新日期或升级处理。"], ["Export CSV and paste it into the AI prompt for a management summary.", "导出 CSV，粘贴到 AI 提示词里生成管理总结。"]],
        prompt: ["Here is my action list exported as CSV (action, owner, due date, status, notes):\n[paste CSV]\nToday is [date].\n1. List overdue actions, oldest first, with days overdue.\n2. Rate each open action High / Medium / Low priority based on safety, customer and cost impact, and say why in a few words.\n3. Write a 5-line weekly summary for my manager: done, open, overdue, biggest risk, help needed.", "这是我导出的行动清单 CSV（行动、负责人、截止日期、状态、备注）：\n[粘贴 CSV]\n今天是 [日期]。\n1. 列出逾期行动，从最早开始，并写出逾期天数。\n2. 按安全、客户和成本影响，把每个未完成行动评为高 / 中 / 低优先级，并简短说明原因。\n3. 给我的上级写一份 5 行周总结：已完成、未完成、逾期、最大风险、需要的支持。"],
        out: ["An overdue list, a priority for each open action and a 5-line weekly summary.", "逾期清单、每个未完成行动的优先级，以及 5 行周总结。"],
        lim: ["Data is saved in this browser only. Export CSV regularly as a backup.", "数据只保存在当前浏览器中。请定期导出 CSV 备份。"]
      }
    },
    {
      id: "production-kpi-dashboard", url: "production-kpi-dashboard.html", type: "tracker", ai: true, demo: "demo-daily-report",
      cats: ["perf", "ops"], level: "intermediate", version: "2.0", updated: "2026-11-01",
      title: ["Production KPI Dashboard", "生产 KPI 仪表板"],
      problem: ["No clear daily view of output, yield and downtime.", "每天看不清产量、良率和停机。"],
      desc: ["Ready Excel dashboard with OEE, scrap, achievement and downtime Pareto, plus sample data, an interpretation guide and an AI analysis prompt.", "现成的 Excel 仪表板，含 OEE、报废率、达成率和停机柏拉图，并附示例数据、解读指引和 AI 分析提示词。"],
      setup: ["30 min first time", "首次 30 分钟"], software: ["Excel, Google Sheets or WPS", "Excel、Google Sheets 或 WPS"], formats: ["xlsx", "csv"],
      kit: {
        who: ["Supervisors and managers who report daily performance for a line or area.", "需要每天汇报产线或区域绩效的主管与经理。"],
        inc: [["Excel dashboard (English and Chinese versions)", "Excel 仪表板（英文版与中文版）"], ["Sample production dataset (CSV)", "示例生产数据（CSV）"], ["Interpretation guide", "解读指引"], ["AI KPI analysis prompt and follow-up questions", "AI KPI 分析提示词和追问问题"]],
        steps: [["Download the dashboard and try it first with the sample data.", "下载仪表板，先用示例数据试一下。"], ["Each day, enter output, scrap and downtime minutes with a reason.", "每天输入产量、报废和停机分钟及原因。"], ["Weekly, paste the summary into the AI prompt and discuss the top loss with your team.", "每周把汇总粘贴到 AI 提示词中，和团队讨论最大损失。"]],
        prompt: ["Act as a production performance analyst. Here is my daily data for [line] (date, target, actual, good units, scrap, downtime minutes, top downtime reason):\n[paste data]\n1. Summarise achievement, OEE trend and scrap trend in 3 lines.\n2. Identify the biggest loss and how much output it cost.\n3. Point out any day that looks unusual and what I should check.\n4. Give me 3 follow-up questions to ask my team.\nOnly use the numbers provided; say clearly if data is missing.", "请扮演生产绩效分析师。这是 [产线] 的每日数据（日期、目标、实际、合格品、报废、停机分钟、主要停机原因）：\n[粘贴数据]\n1. 用 3 行总结达成率、OEE 趋势和报废趋势。\n2. 找出最大损失以及它造成的产量损失。\n3. 指出看起来异常的日子，以及我应该检查什么。\n4. 给我 3 个可以问团队的追问问题。\n只使用我提供的数据；缺数据时请明确说明。"],
        out: ["A 3-line performance summary, the biggest loss in units, unusual days and 3 questions for the team.", "3 行绩效总结、以件数表示的最大损失、异常日期和 3 个团队追问问题。"],
        lim: ["Downtime reasons must be logged honestly or the Pareto will point at the wrong problem.", "停机原因必须如实记录，否则柏拉图会指向错误的问题。"],
        extra: "kpi"
      }
    },
    {
      id: "manpower-gap-calculator", url: "manpower-gap-calculator.html", type: "calculator", ai: true,
      cats: ["people", "ops"], level: "intermediate", version: "2.0", updated: "2026-11-01",
      title: ["Manpower Gap Calculator", "人力缺口计算器"],
      problem: ["Absences again, and no clear view of who to move.", "又有人缺勤，不知道该调谁。"],
      desc: ["See the gap by area, suggested moves and overtime, plus workload vs available hours, utilisation and what-if scenarios.", "按区域看缺口、建议调动和加班，并可计算工作量与可用工时、利用率，以及假设情景。"],
      setup: ["10 min", "10 分钟"], software: ["Web browser or phone", "网页浏览器或手机"], formats: ["web", "print"],
      kit: {
        who: ["Supervisors and planners balancing people at the start of a shift.", "开班时需要平衡人员的主管与计划员。"],
        inc: [["Gap by area with suggested moves", "按区域的缺口和建议调动"], ["Workload vs available hours", "工作量与可用工时"], ["Utilisation and scenario simulation", "利用率与情景模拟"], ["AI workforce planning prompt", "AI 人力规划提示词"]],
        steps: [["Enter required, scheduled and absent people per area.", "输入每个区域的需要人数、排班人数和缺勤人数。"], ["Use the hours view to check the real workload, then try a scenario (more absences, overtime).", "用工时视图核对实际工作量，再试试不同情景（更多缺勤、加班）。"], ["Before moving anyone, check they are qualified in the Skills Matrix.", "调人前先在技能矩阵中确认对方具备资格。"]],
        prompt: ["Act as a workforce planner for a manufacturing shift. Areas and needs: [area: required people, scheduled, absent, priority]. Shift length: [hours]. Qualified cross-trained people: [names and skills].\n1. Propose who to move, protecting priority 1 first, using only qualified people.\n2. Say how many overtime hours are still needed.\n3. List the risks of this plan and what to watch.\nAsk me if any qualification information is missing.", "请扮演制造班次的人力规划员。区域与需求：[区域：需要人数、排班人数、缺勤、优先级]。班次时长：[小时]。已交叉培训的合格人员：[姓名与技能]。\n1. 先保障优先级 1，只用合格人员，提出调动方案。\n2. 说明还需要多少加班工时。\n3. 列出这个方案的风险和需要关注的地方。\n如果缺少资格信息，请问我。"],
        out: ["A move plan that respects skills, overtime still needed and the risks to watch.", "尊重技能资格的调动方案、仍需的加班工时和需关注的风险。"],
        lim: ["The calculator does not know who is trained. Always confirm competency before moving people.", "计算器不知道谁接受过培训。调人前务必确认能力资格。"],
        extra: "manpower"
      }
    },
    {
      id: "repeated-mistake-worksheet", url: "repeated-mistake-worksheet.html", type: "solver", ai: true, demo: "demo-root-cause",
      cats: ["solve"], level: "intermediate", version: "2.0", updated: "2026-11-01",
      title: ["Repeated Mistake Worksheet", "重复错误改善工作表"],
      problem: ["You retrained people, and the same mistake still comes back.", "已经重新培训了，同样的错误还是会再发生。"],
      desc: ["Find the real cause with 5 Whys, choose a control that doesn't rely on memory, and verify it over 30 days.", "用 5 个为什么找出真正原因，选择不依赖记忆的控制措施，并在 30 天内验证效果。"],
      setup: ["20 min", "20 分钟"], software: ["Web browser", "网页浏览器"], formats: ["web", "print", "pdf"],
      kit: {
        who: ["Supervisors, engineers and QA dealing with a repeat error.", "处理重复错误的主管、工程师和质量人员。"],
        inc: [["4-step worksheet", "4 步工作表"], ["Control hierarchy (strongest first)", "控制措施层级（从强到弱）"], ["30-day effectiveness check", "30 天效果验证"], ["AI-assisted 5 Whys prompt", "AI 辅助 5 个为什么提示词"]],
        steps: [["Describe the mistake with facts, not blame.", "用事实描述错误，不追责。"], ["Ask why 5 times and confirm each answer with evidence before moving on.", "问 5 次为什么，每个答案都要有证据再往下问。"], ["Pick the strongest control you can (remove the step or error-proof it), then track it for 30 days.", "选你能做到的最强控制（取消该步骤或防错），然后追踪 30 天。"]],
        prompt: ["Act as a continuous improvement engineer. Problem: [what went wrong, where, when, how often, impact]. What we already tried: [actions].\n1. Ask me up to 5 questions you need answered first.\n2. Then guide a 5 Whys with me one step at a time. Do not jump to an answer; ask me to confirm each 'why' with evidence.\n3. Suggest controls from strongest to weakest: eliminate the step > error-proof > automatic detection > standard work > training.\n4. Propose how to measure success over 30 days.", "请扮演持续改善工程师。问题：[哪里出错、在哪里、什么时候、多频繁、影响]。已尝试的措施：[行动]。\n1. 先问我最多 5 个你需要了解的问题。\n2. 然后一步一步和我做 5 个为什么。不要直接跳到答案；每个“为什么”都请我用证据确认。\n3. 按强弱顺序建议控制措施：取消该步骤 > 防错 > 自动检测 > 标准作业 > 培训。\n4. 提出 30 天内衡量效果的方法。"],
        out: ["A guided, evidence-based 5 Whys and a ranked list of controls with a 30-day check.", "有证据支持的 5 个为什么，以及按强弱排列的控制措施和 30 天验证。"],
        lim: ["A cause is only a root cause after you have checked it with data or a test.", "只有经过数据或试验验证，原因才算根本原因。"]
      }
    },
    {
      id: "checklist-quiet-quitting", url: "checklist-quiet-quitting.html", type: "checklist", ai: false,
      cats: ["people"], level: "beginner", version: "2.0", updated: "2026-11-01",
      title: ["Quiet Quitting Early-Warning Checklist", "员工默默躺平预警清单"],
      problem: ["A good employee is slowly checking out and you're not sure why.", "一位好员工正在慢慢“躺平”，你却不确定原因。"],
      desc: ["Spot the early signs, check what may be causing them, and plan the conversation, with links to the tools that help you act.", "发现早期信号，检查可能的原因，并准备谈话；附上帮助你采取行动的工具链接。"],
      setup: ["15 min", "15 分钟"], software: ["Web browser", "网页浏览器"], formats: ["web", "print", "pdf"],
      kit: {
        who: ["Supervisors and managers who notice a change in someone's engagement.", "察觉到员工投入度变化的主管与经理。"],
        inc: [["Early-warning signals with a score", "带评分的预警信号"], ["Possible causes to check", "需检查的可能原因"], ["Conversation guide", "谈话指引"], ["Next-step tools", "下一步工具"]],
        steps: [["Tick only signals you have actually seen in the last 4–6 weeks.", "只勾选过去 4–6 周你真正看到的信号。"], ["Check workload, recognition and role fit before assuming attitude.", "先检查工作量、认可和岗位匹配，不要先假设是态度问题。"], ["Plan the talk with the Difficult Conversation Planner and follow up within 2 weeks.", "用困难对话准备表准备谈话，并在 2 周内跟进。"]],
        prompt: ["I am a manufacturing supervisor. One of my good team members has shown these signs in the last few weeks: [signals]. Context: [workload, recent changes, recognition].\n1. List possible causes I should check, most likely first.\n2. Suggest 3 open questions for a private 1:1.\n3. Suggest one thing I can change this week.\nKeep the tone supportive, not disciplinary.", "我是一名制造业主管。我的一位好员工在过去几周出现了这些信号：[信号]。背景：[工作量、最近的变化、认可情况]。\n1. 列出我应该检查的可能原因，从最可能的开始。\n2. 建议 3 个适合私下一对一谈话的开放式问题。\n3. 建议一件我本周就能改变的事。\n语气要支持性的，不要像纪律处分。"],
        out: ["Likely causes, 3 open questions and one change you can make this week.", "可能的原因、3 个开放式问题，以及本周可做的一项改变。"],
        lim: ["A checklist shows signals, not reasons. Talk to the person before drawing conclusions, and follow HR policy.", "清单只显示信号，不代表原因。下结论前先和本人谈，并遵守人事规定。"]
      }
    },

    /* ---------------- PROBLEM-SOLVING TOOLS ---------------- */
    {
      id: "downtime-troubleshooter", url: "downtime-troubleshooter.html", type: "solver", ai: false,
      cats: ["solve", "ops"], level: "beginner", version: "1.1", updated: "2026-11-01",
      title: ["Downtime Troubleshooter", "停机排查工具"],
      problem: ["The machine stopped and you need a safe, fast way to find why.", "设备停了，你需要一个安全又快速的排查方法。"],
      desc: ["Pick the symptom and follow safe checks in order: likely causes, when to escalate, a downtime clock and a ready summary.", "选择症状，按顺序进行安全检查：最可能的原因、何时升级、停机计时和现成摘要。"],
      setup: ["2 min", "2 分钟"], software: ["Web browser or phone", "网页浏览器或手机"], formats: ["web", "copy"],
      kit: {
        who: ["Supervisors, technicians and operators at the machine.", "在设备旁的主管、技术员和操作员。"],
        inc: [["8 common symptoms", "8 种常见症状"], ["Ordered safety-first checks", "按顺序的安全优先检查"], ["Downtime clock with cost", "带成本的停机计时"], ["Copy-ready downtime summary", "可复制的停机摘要"]],
        steps: [["Make the machine safe first (lock-out/tag-out).", "先确保设备安全（上锁挂牌）。"], ["Pick the symptom and work through the checks in order.", "选择症状，按顺序完成检查。"], ["Escalate when the rules say so, then copy the summary into your shift report.", "符合升级条件时立即升级，然后把摘要复制到交接班报告。"]],
        prompt: ["A machine on my line has this problem: [symptom]. Machine type: [type]. What we checked so far: [checks]. Alarm code/text: [code].\n1. List the next checks in a safe order (no work on live equipment).\n2. List possible causes, most likely first, and how to confirm each.\n3. Tell me when I should stop and escalate to maintenance or the manufacturer.", "我产线上的一台设备出现这个问题：[症状]。设备类型：[类型]。目前已检查：[检查项]。报警代码 / 内容：[代码]。\n1. 按安全顺序列出下一步检查（不在带电设备上作业）。\n2. 列出可能原因，从最可能的开始，并说明如何确认。\n3. 告诉我什么时候应该停下来，升级给维修或设备厂家。"],
        out: ["Next safe checks, likely causes with how to confirm them, and escalation points.", "下一步安全检查、可能原因及确认方法，以及升级时机。"],
        lim: ["General guidance only. Your machine manual, site safety rules and maintenance team always come first.", "仅为通用指引。设备手册、现场安全规定和维修团队永远优先。"]
      }
    },
    {
      id: "oee-loss-calculator", url: "oee-loss-calculator.html", type: "calculator", ai: false,
      cats: ["perf"], level: "intermediate", version: "1.1", updated: "2026-11-01",
      title: ["OEE Loss Calculator", "OEE 损失计算器"],
      problem: ["Output is low but nobody knows which loss is biggest.", "产量偏低，但没人知道哪项损失最大。"],
      desc: ["Enter one shift's numbers to see availability, performance, quality, lost minutes, units and money, and the next action.", "输入一个班次的数据，看到可用率、性能、质量、损失的分钟、产量和金额，以及下一步行动。"],
      setup: ["2 min", "2 分钟"], software: ["Web browser", "网页浏览器"], formats: ["web", "print"],
      kit: {
        who: ["Supervisors, engineers and managers reviewing a shift or a line.", "回顾班次或产线的主管、工程师和经理。"],
        inc: [["OEE with A × P × Q split", "OEE 及可用率 × 性能 × 质量拆分"], ["Losses in minutes, units and money", "以分钟、件数和金额表示的损失"], ["Next actions for the biggest loss", "针对最大损失的下一步行动"]],
        steps: [["Enter shift length, breaks, downtime, ideal cycle time, output and rejects.", "输入班次时长、休息、停机、理想节拍、产量和不良数。"], ["Check that performance is not above 100% (wrong cycle time).", "确认性能没有超过 100%（节拍设置错误）。"], ["Start with the biggest loss and track it daily.", "从最大损失入手，每天追踪。"]],
        prompt: ["My OEE for [line] this shift: availability [A%], performance [P%], quality [Q%]. Losses: downtime [min] (top reasons: [reasons]), speed loss [min], scrap [units] (top defects: [defects]).\n1. Which loss should I attack first and why?\n2. Give me 3 practical actions for this week.\n3. What data should I start collecting to improve the analysis?", "我 [产线] 本班的 OEE：可用率 [A%]、性能 [P%]、质量 [Q%]。损失：停机 [分钟]（主要原因：[原因]），速度损失 [分钟]，报废 [件]（主要缺陷：[缺陷]）。\n1. 我应该先解决哪项损失？为什么？\n2. 给我本周可执行的 3 个实际行动。\n3. 为了让分析更准，我应该开始收集哪些数据？"],
        out: ["The loss to attack first, 3 actions for the week and the data to collect.", "要先解决的损失、本周 3 个行动和要收集的数据。"],
        lim: ["OEE is only as accurate as the ideal cycle time and the downtime you record.", "OEE 的准确性取决于理想节拍和你记录的停机。"]
      }
    },
    {
      id: "fishbone-5why", url: "fishbone-5why.html", type: "solver", ai: false, demo: "demo-root-cause",
      cats: ["solve"], level: "intermediate", version: "1.1", updated: "2026-11-01",
      title: ["Fishbone + 5-Why Builder", "鱼骨图 + 5 个为什么"],
      problem: ["The team guesses the root cause instead of proving it.", "团队在猜根本原因，而不是证明它。"],
      desc: ["List causes under the 6Ms on a live fishbone, star the suspects, drill each with 5 Whys and record a fix with proof.", "在实时鱼骨图上按 6M 列出原因，标记嫌疑原因，逐一用 5 个为什么深挖，并记录对策和验证方法。"],
      setup: ["30 min", "30 分钟"], software: ["Web browser", "网页浏览器"], formats: ["web", "print"],
      kit: {
        who: ["Supervisors, engineers and QA running a problem-solving session.", "组织问题解决会议的主管、工程师和质量人员。"],
        inc: [["Live fishbone diagram", "实时鱼骨图"], ["Prompt questions for each M", "每个 M 的引导问题"], ["5 Whys per suspect", "每个嫌疑原因的 5 个为什么"], ["Countermeasure, owner and proof", "对策、负责人和验证"]],
        steps: [["Write a factual problem statement: what, where, when, how much.", "写出基于事实的问题描述：什么、在哪里、什么时候、有多少。"], ["Brainstorm causes with the team, then star only those the data supports.", "和团队头脑风暴原因，然后只标记有数据支持的。"], ["Drill each suspect with 5 Whys and test the root cause before fixing it.", "对每个嫌疑原因问 5 个为什么，并在实施对策前验证根本原因。"]],
        prompt: ["Help me build a fishbone (6M) for this problem: [problem statement].\n1. Suggest possible causes under Man, Machine, Method, Material, Measurement and Environment that fit my situation: [context].\n2. For each, suggest one quick check to confirm or rule it out.\n3. Do not tell me which one is the root cause; help me decide what to test first.", "请帮我为这个问题做一个鱼骨图（6M）：[问题描述]。\n1. 结合我的情况：[背景]，在人、机、法、料、测、环下建议可能原因。\n2. 每个原因建议一个确认或排除的快速检查方法。\n3. 不要告诉我哪个是根本原因；帮我决定先验证哪个。"],
        out: ["Candidate causes under each M with a quick check for each.", "每个 M 下的候选原因及对应的快速检查方法。"],
        lim: ["Stars mark suspects, not facts. Confirm with data before you call it the root cause.", "★ 只代表嫌疑，不代表事实。用数据确认后才能称为根本原因。"]
      }
    },
    {
      id: "8d-report", url: "8d-report.html", type: "solver", ai: false, demo: "demo-root-cause",
      cats: ["solve"], level: "advanced", version: "1.1", updated: "2026-11-01",
      title: ["8D Report Builder", "8D 报告生成器"],
      problem: ["A customer complaint needs a full, credible response.", "客户投诉需要一份完整、可信的回复。"],
      desc: ["Work through D1 to D8 with a progress bar: containment, both root causes, corrective actions, verification and prevention.", "借助进度条完成 D1 到 D8：围堵、两个根本原因、纠正措施、验证与预防。"],
      setup: ["1–2 hours over several days", "分几天完成，共 1–2 小时"], software: ["Web browser", "网页浏览器"], formats: ["web", "print", "pdf"],
      kit: {
        who: ["QA, engineers and supervisors answering a customer complaint or quality escape.", "回复客户投诉或质量外流的质量、工程和主管人员。"],
        inc: [["D1–D8 sections with progress", "D1–D8 各部分及进度"], ["Containment table by location", "按位置的围堵表"], ["Occurrence and escape root causes", "产生与流出两个根本原因"], ["Prevention checklist", "预防检查清单"]],
        steps: [["Contain first: protect the customer within 24 hours (D3).", "先围堵：24 小时内保护客户（D3）。"], ["Find why it was made and why it escaped (D4), using the Fishbone + 5-Why Builder.", "用鱼骨图 + 5 个为什么找出为什么产生、为什么流出（D4）。"], ["Verify with data before closing, then update standards (D6–D7).", "结案前用数据验证，然后更新标准（D6–D7）。"]],
        prompt: ["Review my draft 8D like a demanding customer quality engineer.\n[paste D2 problem description, D3 containment, D4 root causes, D5 actions]\n1. Point out gaps or weak evidence in each section.\n2. Check that both the occurrence and escape root causes are addressed.\n3. Suggest how to prove the actions work (D6).\nBe specific and direct.", "请以一位严格的客户质量工程师的角度审阅我的 8D 草稿。\n[粘贴 D2 问题描述、D3 围堵、D4 根本原因、D5 措施]\n1. 指出每个部分的漏洞或证据不足之处。\n2. 检查产生原因和流出原因是否都已处理。\n3. 建议如何证明措施有效（D6）。\n请具体、直接。"],
        out: ["A critical review of your 8D with gaps and how to prove effectiveness.", "对你的 8D 的严格审阅，指出漏洞及证明有效性的方法。"],
        lim: ["Follow your customer's own 8D format and deadlines when they specify one.", "客户有指定的 8D 格式和期限时，以客户要求为准。"]
      }
    },
    {
      id: "skills-matrix", url: "skills-matrix.html", type: "tracker", ai: false,
      cats: ["people", "ops"], level: "intermediate", version: "1.1", updated: "2026-11-01",
      title: ["Team Skills Matrix", "团队技能矩阵"],
      problem: ["Too few people can run key jobs, so one absence stops the line.", "关键岗位会做的人太少，一人缺勤产线就停。"],
      desc: ["Set skill levels per person, spot single points of failure and get a training plan. Export to Excel.", "设定每人的技能等级，发现单点风险，并得到培训计划。可导出到 Excel。"],
      setup: ["20 min", "20 分钟"], software: ["Web browser", "网页浏览器"], formats: ["web", "csv", "print"],
      kit: {
        who: ["Supervisors and managers planning cover and cross-training.", "规划补位和交叉培训的主管与经理。"],
        inc: [["Tap-to-set skill matrix", "点击设定的技能矩阵"], ["Single-point-of-failure alerts", "单点风险提醒"], ["Automatic training plan", "自动培训计划"], ["CSV export", "CSV 导出"]],
        steps: [["List people and skills or stations, then set honest levels.", "列出人员和技能或工位，如实设定等级。"], ["Set your cover target (usually 3 qualified per skill).", "设定覆盖目标（通常每项技能 3 人合格）。"], ["Start training on single points of failure first, and review monthly.", "先培训单点风险岗位，每月回顾一次。"]],
        prompt: ["Here is my team skills matrix (levels 0–4, 3 = independent):\n[paste CSV]\nTarget: [n] qualified people per skill.\n1. List the skills at risk, worst first.\n2. Propose a 6-week cross-training plan that does not overload any one trainer.\n3. Suggest how to keep output stable while people are training.", "这是我的团队技能矩阵（等级 0–4，3 = 可独立操作）：\n[粘贴 CSV]\n目标：每项技能 [人数] 人合格。\n1. 列出有风险的技能，从最严重的开始。\n2. 提出一个 6 周的交叉培训计划，不让任何一位培训人负担过重。\n3. 建议在培训期间如何保持产出稳定。"],
        out: ["Skills at risk and a 6-week cross-training plan that protects output.", "有风险的技能，以及兼顾产出的 6 周交叉培训计划。"],
        lim: ["Levels are judgements. Confirm 'independent' with an observed check, not self-rating.", "等级是判断。“可独立操作”要通过现场观察确认，而不是自评。"]
      }
    },
    {
      id: "difficult-conversation", url: "difficult-conversation.html", type: "solver", ai: false,
      cats: ["people"], level: "beginner", version: "1.1", updated: "2026-11-01",
      title: ["Difficult Conversation Planner", "困难对话准备表"],
      problem: ["You need to talk to someone about performance or behaviour and don't know how to start.", "你需要和员工谈绩效或行为，却不知道如何开口。"],
      desc: ["Plan the talk in 10 minutes: facts, impact, what good looks like and a script, with a check for judging words.", "10 分钟准备好谈话：事实、影响、期望标准和话术，并检查评判性用词。"],
      setup: ["10 min", "10 分钟"], software: ["Web browser", "网页浏览器"], formats: ["web", "copy"],
      kit: {
        who: ["Supervisors and managers preparing a performance, attendance or behaviour talk.", "准备绩效、出勤或行为谈话的主管与经理。"],
        inc: [["5 conversation types with tips", "5 种对话类型及建议"], ["Facts and impact builder", "事实与影响整理"], ["Judging-word check", "评判性用词检查"], ["6-step script", "6 步话术"]],
        steps: [["Write only what you saw and heard, with dates.", "只写你看到和听到的，并附日期。"], ["Decide exactly what good looks like from now on.", "明确从现在起的期望标准。"], ["Hold the talk in private, listen after step 4, and agree a follow-up date.", "私下进行，第 4 步后认真倾听，并约定跟进日期。"]],
        prompt: ["Help me prepare a conversation with a team member. Situation: [type]. Facts: [what I saw, when]. Impact: [on work]. What I need going forward: [standard].\n1. Rewrite my facts so they are specific and non-judgemental.\n2. Suggest how they might react and how I can respond calmly.\n3. Give me a short opening line and a closing that agrees next steps.", "请帮我准备和一位团队成员的谈话。情况：[类型]。事实：[我看到了什么、什么时候]。影响：[对工作的影响]。之后的要求：[标准]。\n1. 把我的事实改写得具体且不带评判。\n2. 预想对方可能的反应，以及我如何冷静回应。\n3. 给我一句简短的开场白和一个约定下一步的结尾。"],
        out: ["Neutral facts, likely reactions with calm responses, and an opening and closing.", "中立的事实陈述、可能的反应与冷静回应，以及开场和结尾。"],
        lim: ["For disciplinary matters, follow your company's HR process and involve HR early.", "涉及纪律处分时，请遵循公司的人事流程，并尽早让人事参与。"]
      }
    },
    {
      id: "escalation-report", url: "escalation-report.html", type: "solver", ai: false,
      cats: ["solve", "people"], level: "intermediate", version: "1.1", updated: "2026-11-01",
      title: ["Escalation Report Builder", "升级报告生成器"],
      problem: ["You need management support, but your report gets ignored.", "你需要上级支持，但报告总是没人理。"],
      desc: ["Build a bottom-line-first report with cost and delivery impact, options and the decision you need. Copy as email.", "生成结论先行的报告，含成本与交付影响、可选方案和你需要的决定。可复制为邮件。"],
      setup: ["15 min", "15 分钟"], software: ["Web browser", "网页浏览器"], formats: ["web", "copy"],
      kit: {
        who: ["Supervisors and managers who need a decision, budget or help from senior management.", "需要高层决定、预算或支持的主管与经理。"],
        inc: [["Cost impact calculator", "成本影响计算"], ["Delivery and risk summary", "交付与风险摘要"], ["Options with cost and effect", "含成本与效果的方案"], ["Bottom-line-first email", "结论先行的邮件"]],
        steps: [["State the ask and deadline first.", "先写清请求和期限。"], ["Quantify cost and delivery risk with real numbers.", "用真实数字量化成本和交付风险。"], ["Give 2–3 options and your recommendation, then send.", "给出 2–3 个方案和你的建议，然后发送。"]],
        prompt: ["Rewrite this escalation for a busy plant director. Keep it under 150 words, bottom line first.\n[paste report]\nMake sure it states: the decision needed and by when, the cost and delivery impact, the options with cost, and my recommendation. Remove blame and emotional words.", "请把这份升级报告改写给一位忙碌的厂长看。控制在 250 字以内，结论先行。\n[粘贴报告]\n确保写明：需要的决定和期限、成本与交付影响、各方案及成本，以及我的建议。去掉指责和情绪化的词。"],
        out: ["A short, decision-ready message for senior management.", "一份简短、可直接决策的高层汇报。"],
        lim: ["Check figures with finance or planning before sending; one wrong number can sink the request.", "发送前请与财务或计划核对数字；一个错误数字就可能让请求失败。"]
      }
    },
    {
      id: "decision-matrix", url: "decision-matrix.html", type: "solver", ai: false,
      cats: ["solve", "perf"], level: "intermediate", version: "1.1", updated: "2026-11-01",
      title: ["Decision Matrix", "决策矩阵"],
      problem: ["A hard choice between options and no clear way to compare them.", "要在几个方案中艰难选择，却没有清晰的比较方法。"],
      desc: ["Weight what matters, score each option, mark must-haves and get a recommendation with a robustness check.", "给重要的标准加权、为每个方案打分、标出必须项，得到带稳健性检查的建议。"],
      setup: ["15 min", "15 分钟"], software: ["Web browser", "网页浏览器"], formats: ["web", "print"],
      kit: {
        who: ["Managers and engineers choosing suppliers, projects, candidates or equipment.", "选择供应商、项目、候选人或设备的经理与工程师。"],
        inc: [["4 ready templates", "4 个现成模板"], ["Weights, scores and must-haves", "权重、评分与必须项"], ["Too-close-to-call warning", "难分高下提醒"], ["Robustness check", "稳健性检查"]],
        steps: [["Agree the criteria and weights before scoring any option.", "在给任何方案打分前，先确定标准和权重。"], ["Score each option with evidence; mark deal-breakers as Must.", "用证据给每个方案打分；把一票否决项标为必须。"], ["If the result is close or fragile, gather more data on the top-weighted criteria.", "如果结果接近或不稳定，在权重最高的标准上收集更多数据。"]],
        prompt: ["I am deciding: [decision]. Options: [A, B, C]. Criteria and weights: [criteria]. My scores: [scores].\n1. Challenge my criteria: is anything important missing?\n2. Which scores look weakly supported?\n3. What would make the second option the better choice?", "我要决定：[决定]。方案：[A、B、C]。标准和权重：[标准]。我的评分：[评分]。\n1. 质疑我的标准：是否遗漏了重要的东西？\n2. 哪些评分的依据看起来不足？\n3. 在什么情况下第二个方案会更好？"],
        out: ["Missing criteria, weak scores and what would change the decision.", "遗漏的标准、依据不足的评分，以及会改变决定的条件。"],
        lim: ["A matrix supports judgement; it doesn't replace it.", "矩阵是辅助判断，不是替代判断。"]
      }
    }
  ],

  /* ---------------- SOLUTION PATHS ---------------- */
  paths: [
    {
      id: "daily", icon: "🏭", t: ["Daily Production Management", "日常生产管理"],
      d: ["Run a shift from plan to report, and close the loop every week.", "从计划到汇报管好一个班，并每周闭环。"],
      steps: [
        ["supervisor-daily-planner", "Set the 3 priorities before the shift starts.", "开班前定下最重要的 3 件事。"],
        ["manpower-gap-calculator", "Cover absences so the priorities are protected.", "补齐缺勤人员，保住优先事项。"],
        ["production-kpi-dashboard", "Record output, scrap and downtime every day.", "每天记录产量、报废和停机。"],
        ["weekly-action-tracker", "Turn the biggest losses into owned actions.", "把最大损失变成有负责人的行动。"],
        ["demo-daily-report", "Write the daily report in minutes and spot missing information.", "几分钟写好日报，并发现缺失信息。"]
      ]
    },
    {
      id: "solve", icon: "🔍", t: ["Problem Solving", "问题解决"],
      d: ["Go from 'it happened again' to a verified fix that holds.", "从“又发生了”走到经过验证、能持续的解决方案。"],
      steps: [
        ["demo-root-cause", "Write a clear problem statement and plan the 5 Whys.", "写清问题描述，规划 5 个为什么。"],
        ["fishbone-5why", "List causes under the 6Ms and drill the suspects.", "按 6M 列出原因，深挖嫌疑原因。"],
        ["repeated-mistake-worksheet", "Choose a strong control and verify it for 30 days.", "选择强有力的控制措施，并验证 30 天。"],
        ["weekly-action-tracker", "Track every corrective action to closure.", "追踪每个纠正措施直到关闭。"],
        ["8d-report", "If a customer was affected, document it as an 8D.", "如果影响到客户，用 8D 记录。"]
      ]
    },
    {
      id: "losses", icon: "📉", t: ["Downtime & Losses", "停机与损失"],
      d: ["Find where capacity is leaking and get support to fix it.", "找出产能流失之处，并争取支持来解决。"],
      steps: [
        ["downtime-troubleshooter", "Restart safely and log the cause of each stop.", "安全恢复生产，记录每次停机的原因。"],
        ["oee-loss-calculator", "See which loss costs the most minutes.", "看清哪项损失占用最多时间。"],
        ["production-kpi-dashboard", "Watch the trend and the downtime Pareto.", "观察趋势和停机柏拉图。"],
        ["decision-matrix", "Compare fix options objectively.", "客观比较各个解决方案。"],
        ["escalation-report", "Ask management for the decision or budget you need.", "向管理层争取你需要的决定或预算。"]
      ]
    },
    {
      id: "people", icon: "👥", t: ["Leading People", "带领团队"],
      d: ["Spot problems early, talk about them well and build cover.", "及早发现问题，好好沟通，并建立补位能力。"],
      steps: [
        ["checklist-quiet-quitting", "Spot early signs of disengagement.", "发现投入度下降的早期信号。"],
        ["difficult-conversation", "Plan the conversation with facts, not labels.", "用事实而不是标签来准备谈话。"],
        ["skills-matrix", "Build cover so no job depends on one person.", "建立补位能力，让任何岗位都不依赖一个人。"],
        ["manpower-gap-calculator", "Balance people on the day with qualified moves.", "当天用合格人员调动来平衡人力。"],
        ["escalation-report", "Escalate structural staffing issues with numbers.", "用数据向上反映结构性的人员问题。"]
      ]
    }
  ]
};

/* ---------------- AI TOOLS LIBRARY ----------------
   status: live = new tool, works now in the browser
           exist = links to an existing LAOYU resource
           soon = planned, no page yet
           api = planned, needs a future AI connection        */
window.LAOYU_DATA.aicats = {
  mfg: ["AI Manufacturing Intelligence", "AI 制造智能"],
  mgmt: ["AI Management Assistant", "AI 管理助手"],
  qci: ["AI Quality & Continuous Improvement", "AI 质量与持续改善"],
  prod: ["AI Workplace Productivity", "AI 职场效率"]
};
window.LAOYU_DATA.aitools = [
  { id: "perf-analyzer", cat: "mfg", status: "soon", t: ["Production Performance Analyzer", "生产绩效分析器"], d: ["Target vs actual, trend and gap.", "目标对比实际、趋势与差距。"] },
  { id: "oee", cat: "mfg", status: "exist", url: "oee-loss-calculator.html", t: ["OEE Calculator", "OEE 计算器"], d: ["OEE split into its losses.", "OEE 及各项损失拆分。"] },
  { id: "downtime-ai", cat: "mfg", status: "live", url: "tool-downtime-analysis.html", t: ["Downtime Analysis Assistant", "停机分析助手"], d: ["Paste stops, get the Pareto.", "粘贴停机记录，得到柏拉图。"] },
  { id: "yield", cat: "mfg", status: "soon", t: ["Yield Analysis Assistant", "良率分析助手"], d: ["First-pass yield by step.", "按工序的一次合格率。"] },
  { id: "report", cat: "mfg", status: "exist", url: "demo-daily-report.html", t: ["Production Report Generator", "生产报告生成器"], d: ["Shift numbers into a report.", "把班次数据变成报告。"] },
  { id: "manpower", cat: "mgmt", status: "exist", url: "manpower-gap-calculator.html", t: ["Manpower Planning Assistant", "人力规划助手"], d: ["Gaps, hours and scenarios.", "缺口、工时与情景。"] },
  { id: "workload", cat: "mgmt", status: "soon", t: ["Workload Balancing Assistant", "工作量平衡助手"], d: ["Spread tasks across people.", "把任务分配给合适的人。"] },
  { id: "review", cat: "mgmt", status: "api", t: ["Performance Review Writer", "绩效评语助手"], d: ["Fair, specific review drafts.", "公正、具体的评语草稿。"] },
  { id: "present", cat: "mgmt", status: "api", t: ["Management Presentation Generator", "管理汇报生成器"], d: ["Slide outline from your numbers.", "根据数据生成汇报大纲。"] },
  { id: "minutes", cat: "mgmt", status: "live", url: "tool-meeting-minutes.html", t: ["Meeting Minutes Generator", "会议纪要生成器"], d: ["Notes into decisions and actions.", "把笔记整理成决定和行动。"] },
  { id: "5why", cat: "qci", status: "exist", url: "demo-root-cause.html", t: ["5 Why Analysis Generator", "5 个为什么分析"], d: ["Guided whys with evidence.", "有证据的引导式追问。"] },
  { id: "fishbone", cat: "qci", status: "exist", url: "fishbone-5why.html", t: ["Fishbone Analysis Assistant", "鱼骨图分析助手"], d: ["Live 6M fishbone.", "实时 6M 鱼骨图。"] },
  { id: "capa", cat: "qci", status: "live", url: "tool-capa-planner.html", t: ["CAPA Action Planner", "CAPA 措施计划"], d: ["Containment to effectiveness check.", "从围堵到有效性验证。"] },
  { id: "8d", cat: "qci", status: "exist", url: "8d-report.html", t: ["8D Report Assistant", "8D 报告助手"], d: ["D1–D8 with progress.", "D1–D8 及进度。"] },
  { id: "audit", cat: "qci", status: "soon", t: ["Audit Preparation Assistant", "审核准备助手"], d: ["Checklist and evidence list.", "检查清单与证据清单。"] },
  { id: "excel", cat: "prod", status: "live", url: "tool-excel-formula.html", t: ["Excel Formula Assistant", "Excel 公式助手"], d: ["Pick a task, get the formula.", "选择任务，得到公式。"] },
  { id: "email", cat: "prod", status: "live", url: "tool-email-writer.html", t: ["Email Writing Assistant", "邮件写作助手"], d: ["Purpose and facts into a clear email.", "根据目的和事实写出清晰的邮件。"] },
  { id: "project", cat: "prod", status: "exist", url: "weekly-action-tracker.html", t: ["Project Tracking Assistant", "项目追踪助手"], d: ["Owners, dates, overdue flags.", "负责人、日期、逾期提醒。"] },
  { id: "sop", cat: "prod", status: "api", t: ["SOP Drafting Assistant", "SOP 起草助手"], d: ["Structured SOP drafts.", "结构化 SOP 草稿。"] },
  { id: "prioritize", cat: "prod", status: "soon", t: ["Task Prioritization Assistant", "任务优先级助手"], d: ["Urgent vs important.", "紧急与重要。"] }
];
window.LAOYU_DATA.status = {
  live: ["New · works now", "新 · 可用"], exist: ["On site", "已上线"], soon: ["Coming soon", "即将推出"], api: ["Needs AI API", "需接入 AI"]
};
