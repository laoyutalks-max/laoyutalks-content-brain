"""Generate the 8 new LAOYU tool pages (EN/中文) from one shared shell."""
import re, os
ROOT = "/home/claude/src/site"
shell = open(f"{ROOT}/manpower-gap-calculator.html").read()
HEAD_END = shell.index("<main")
FOOT_START = shell.index("</main>") + len("</main>")
head_tpl, foot_tpl = shell[:HEAD_END], shell[FOOT_START:]

def E(en, zh): return f'<span class="en">{en}</span><span class="zh">{zh}</span>'
def P(en, zh, cls=""): c = f" {cls}" if cls else ""; return f'<p class="en{c}">{en}</p><p class="zh{c}">{zh}</p>'
def FLD(id, en, zh, typ="text", wide=False, ph=("", ""), area=False):
    w = " wide" if wide else ""
    lab = f'<label for="{id}">{E(en, zh)}</label>'
    if area:
        inp = f'<textarea id="{id}" rows="3" data-keep></textarea>'
    else:
        inp = f'<input id="{id}" type="{typ}" data-keep' + (' step="any"' if typ == "number" else "") + ">"
    return f'<div class="fld{w}">{lab}{inp}</div>'
def SEL(id, en, zh, opts, wide=False):
    o = "".join(f'<option value="{v}" data-en="{a}" data-zh="{b}">{a}</option>' for v, a, b in opts)
    return f'<div class="fld{" wide" if wide else ""}"><label for="{id}">{E(en, zh)}</label><select id="{id}" data-keep>{o}</select></div>'
def PART(n, en, zh, body, cls=""): return f'<article class="panel resPart {cls}"><div class="resNum">{n}</div><h2>{E(en, zh)}</h2>{body}</article>'
TOOLS_BAR = ('<div class="resTools"><button type="button" class="btn outline" data-print>' + E("PRINT / SAVE AS PDF", "打印 / 另存为 PDF") +
             '</button><button type="button" class="btn outline" data-reset>' + E("CLEAR", "清除") + "</button></div>")
def RELATED(links):
    a = "".join(f'<a class="btn outline" href="{h}"{" target=\"_blank\" rel=\"noopener noreferrer\"" if h.startswith("http") else ""}>{E(en, zh)}</a>' for h, en, zh in links)
    return ('<article class="panel resPart resRelated"><h2>' + E("Related", "相关内容") + f'</h2><div class="relLinks">{a}</div>' +
            P('More free tools: <a href="resources.html">all LAOYU resources →</a>', '更多免费工具：<a href="resources.html">老鱼全部资源 →</a>') + "</article>")
def COPYOUT(pre_id, btn_id):
    return (f'<pre class="toolOut" id="{pre_id}" aria-live="polite"></pre><div class="resTools"><button type="button" class="btn orange" id="{btn_id}">' +
            E("COPY TEXT", "复制文本") + "</button></div>")

def page(slug, title_en, title_zh, h1_en, h1_zh, lead_en, lead_zh, meta, resource, desc, body, script):
    metas = "".join(f'<li class="en">{a}</li><li class="zh">{b}</li>' for a, b in meta)
    h = head_tpl
    h = re.sub(r"<title>.*?</title>", f"<title>{title_en} | LAOYU</title>", h)
    h = re.sub(r'(<meta name="description" content=")[^"]*', r"\g<1>" + desc, h)
    h = re.sub(r'(<meta property="og:title" content=")[^"]*', r"\g<1>" + title_en, h)
    h = re.sub(r'(<meta property="og:description" content=")[^"]*', r"\g<1>" + desc, h)
    h = h.replace('<link rel="stylesheet" href="twin.css?v=20261030c">', '<link rel="stylesheet" href="twin.css?v=20261030c"><link rel="stylesheet" href="tools2.css?v=20261030">')
    main = (f'<main class="resPage">\n<section class="hero resHero"><div class="wrap">\n  <div class="eyebrow">FREE TOOL</div>\n'
            f'  <h1>{E(h1_en, h1_zh)}</h1>\n  {P(lead_en, lead_zh)}\n  <ul class="resMeta">{metas}</ul>\n</div></section>\n'
            f'<section class="section resSection" data-i18n-block><div class="wrap resWrap">\n'
            f'  <div class="gate panel" data-resource="{resource}"></div>\n  <p class="gateDone note" hidden></p>\n'
            f'  <div class="gated" hidden>\n{TOOLS_BAR}\n{body}\n  </div>\n</div></section>\n</main>')
    f = foot_tpl.replace('<script src="tools.js?v=20261030"></script>', f'<script src="{script}?v=20261030"></script>')
    open(f"{ROOT}/{slug}.html", "w").write(h + main + f)
    print("wrote", slug)

V = "https://www.tiktok.com/@laoyu.talks/video/"

# ------------------------------------------------------------------ 1. Downtime Troubleshooter
page("downtime-troubleshooter", "Downtime Troubleshooter", "停机排查工具",
     "Downtime <span>Trouble</span>shooter", "停机<span>排查</span>工具",
     "Machine stopped? Pick what you see. Get the checks to do in the right order, the most likely causes, when to escalate, and a ready-to-send downtime summary.",
     "设备停了？选择你看到的情况，立即得到按正确顺序排列的检查步骤、最可能的原因、什么时候该升级，以及一份可直接发送的停机摘要。",
     [("For supervisors, technicians & operators", "适合主管、技术员与操作员"), ("8 common problems", "8 种常见问题"), ("Works on your phone", "手机可用")],
     "Downtime Troubleshooter", "Free downtime troubleshooting guide: pick the symptom, follow safe checks in order, see likely causes, escalation rules and a downtime summary.",
     PART(1, "What do you see?", "你看到什么情况？", '<div class="dtChips" id="dtSym"></div>') +
     PART(2, "Check in this order", "按这个顺序检查", '<div id="dtGuide"></div>') +
     PART(3, "Downtime clock &amp; summary", "停机计时与摘要",
          P("Start the clock when the line stops. Add your output rate to see what the stop is costing.", "停线时开始计时。填入产出速度，就能看到这次停机的代价。") +
          '<div class="fldGrid">' + FLD("dtLine", "Line / machine", "产线 / 设备") + FLD("dtRate", "Normal output (units per hour)", "正常产出（件 / 小时）", "number") + FLD("dtValue", "Value per unit (optional)", "每件价值（选填）", "number") + "</div>" +
          '<div class="dtClockBox" id="dtClockBox"><div class="dtClock" id="dtClock">0:00</div><button type="button" class="btn orange" id="dtClockBtn"></button></div>' +
          '<div class="mpKpis" id="dtLost"></div>' +
          '<div class="fldGrid" id="dtLog">' + FLD("dtCause", "Cause found", "找到的原因", wide=True) + FLD("dtAction", "Action taken", "采取的措施", wide=True) + FLD("dtEscTo", "Escalated to", "已升级给") + FLD("dtNext", "Next step / owner", "下一步 / 负责人") + "</div>" +
          '<h3 class="mpH">' + E("Downtime summary (copy into your shift report or chat)", "停机摘要（可复制到交接班报告或聊天群）") + "</h3>" + COPYOUT("dtOut", "dtCopy")) +
     RELATED([("oee-loss-calculator.html", "OEE Loss Calculator: see what downtime costs you →", "OEE 损失计算器：看看停机让你损失多少 →"),
              ("fishbone-5why.html", "Fishbone + 5-Why Builder: find the root cause →", "鱼骨图 + 5 个为什么：找出根本原因 →"),
              ("shift-handover.html", "Shift Handover Template →", "交接班模板 →")]),
     "tools-prod.js")

# ------------------------------------------------------------------ 2. OEE Loss Calculator
page("oee-loss-calculator", "OEE Loss Calculator", "OEE 损失计算器",
     "OEE <span>Loss</span> Calculator", "OEE <span>损失</span>计算器",
     "Enter one shift's numbers. See OEE split into availability, performance and quality, where the minutes went, what it cost, and the next action for your biggest loss.",
     "输入一个班次的数据，立即看到 OEE 拆分成可用率、性能和质量，时间花在哪里、损失多少，以及针对最大损失的下一步行动。",
     [("For supervisors, engineers & managers", "适合主管、工程师与经理"), ("2 minutes", "2 分钟"), ("Instant result", "即时计算")],
     "OEE Loss Calculator", "Free OEE calculator: availability, performance and quality from one shift's data, with losses in minutes, units and money plus next actions.",
     PART(1, "One shift's numbers", "一个班次的数据",
          P("Use minutes for time. Ideal cycle time is the fastest the machine is designed to make one good unit.", "时间请用分钟。理想节拍是设备按设计生产一件合格品的最快时间。") +
          '<div class="fldGrid">' + FLD("oeShift", "Shift length (min)", "班次时长（分钟）", "number") + FLD("oeBreak", "Planned breaks &amp; meetings (min)", "计划休息与会议（分钟）", "number") +
          FLD("oeDown", "Unplanned downtime (min)", "非计划停机（分钟）", "number") + FLD("oeCycle", "Ideal cycle time (seconds per unit)", "理想节拍（秒 / 件）", "number") +
          FLD("oeTotal", "Total units made", "总产量（件）", "number") + FLD("oeBad", "Rejected or reworked units", "不良或返工数量", "number") + FLD("oeValue", "Value per unit (optional)", "每件价值（选填）", "number") + "</div>") +
     PART(2, "Your OEE and where it went", "你的 OEE 以及损失去向", '<div id="oeeOut"></div>' +
          P("OEE = Availability × Performance × Quality. It measures how much of your planned time made good parts at full speed.", "OEE = 可用率 × 性能 × 质量。它衡量计划时间中，有多少是以全速生产合格品。", "resNote")) +
     RELATED([("downtime-troubleshooter.html", "Downtime Troubleshooter →", "停机排查工具 →"),
              ("production-kpi-dashboard.html", "Production KPI Dashboard (Excel) →", "生产 KPI 仪表板（Excel）→"),
              (V + "7697970844294991124", "Dashboards that hide the real problem ↗", "隐藏真正问题的仪表板 ↗")]),
     "tools-prod.js")

# ------------------------------------------------------------------ 3. Fishbone + 5-Why
page("fishbone-5why", "Fishbone + 5-Why Builder", "鱼骨图 + 5 个为什么",
     "Fishbone <span>+ 5-Why</span> Builder", "鱼骨图 <span>+ 5 个为什么</span>",
     "Don't guess the root cause. List possible causes under the 6Ms, star the suspects, drill each one with 5 Whys, and leave with a countermeasure, owner and proof it worked.",
     "不要急着猜根本原因。在 6M 下列出可能原因，标记嫌疑原因，用 5 个为什么逐一深挖，最后得到对策、负责人和验证方法。",
     [("For supervisors, engineers &amp; QA", "适合主管、工程师与质量人员"), ("3 steps · 30 minutes", "3 个步骤 · 30 分钟"), ("Print as A3", "可打印为 A3")],
     "Fishbone + 5-Why Builder", "Free fishbone (Ishikawa) and 5-Why root cause builder: 6M causes, live diagram, 5 Whys, countermeasure and verification.",
     PART(1, "Describe the problem", "描述问题",
          P("A good problem statement says what, where, when and how much. No causes, no blame.", "好的问题描述要说清楚什么、在哪里、什么时候、有多少。不写原因，不追责。") +
          '<div class="fldGrid">' + FLD("fbProblem", "Problem statement", "问题描述", wide=True) + "</div>" +
          P("Example: \"Line 2 scrap rose from 1% to 4% on night shift since 12 Oct, mostly short shots on part 1045.\"", "示例：“自 10 月 12 日起，2 号线夜班报废率从 1% 升到 4%，主要是 1045 零件缺料。”", "resNote")) +
     PART(2, "Fishbone: list every possible cause", "鱼骨图：列出所有可能原因",
          P("Add causes under each M. Then press ★ on the ones the data points to. Those are your suspects.", "在每个 M 下面添加原因，然后在有数据支持的原因上按 ★，它们就是你的嫌疑原因。") +
          '<div class="fbDiagram" id="fbDiagram"></div><div class="fbBones" id="fbBones"></div>') +
     PART(3, "5 Whys on each suspect", "对每个嫌疑原因问 5 个为什么",
          '<div class="dtChips" id="fbSel"></div><div id="fbWhy"></div>') +
     RELATED([("8d-report.html", "8D Report Builder: when it reached the customer →", "8D 报告：问题已到客户时使用 →"),
              ("repeated-mistake-worksheet.html", "Repeated Mistake Worksheet →", "重复错误改善工作表 →"),
              (V + "7700187298062781716", "Watch on TikTok ↗", "在 TikTok 观看 ↗")]),
     "tools-prod.js")

# ------------------------------------------------------------------ 4. 8D Report Builder
D = lambda n, en, zh, body: f'<article class="panel resPart d8" id="d{n}" data-d="D{n}"><div class="d8Tag">D{n}</div><h2>{E(en, zh)}</h2>{body}</article>'
loc = [("wip", "In production / WIP", "生产中 / 在制品"), ("fg", "Finished goods in stock", "成品库存"), ("transit", "In transit", "运输途中"), ("cust", "At the customer", "客户处")]
cont_rows = "".join(f'<tr><td>{E(a, b)}</td><td><input id="c_{k}_q" type="number" data-keep aria-label="qty"></td><td><input id="c_{k}_s" type="number" data-keep aria-label="suspect"></td><td><input id="c_{k}_a" data-keep aria-label="action"></td></tr>' for k, a, b in loc)
d7 = [("d7wi", "Work instruction / SOP updated", "作业指导书 / SOP 已更新"), ("d7fmea", "PFMEA updated", "PFMEA 已更新"), ("d7cp", "Control plan updated", "控制计划已更新"),
      ("d7tr", "Team trained on the change", "团队已接受变更培训"), ("d7hz", "Similar lines and products checked", "类似产线和产品已排查"), ("d7ll", "Lesson learned shared", "经验教训已分享")]
d7html = '<div class="d7Checks">' + "".join(f'<label class="gateCheck"><input type="checkbox" id="{i}" data-keep> {E(a, b)}</label>' for i, a, b in d7) + "</div>"
page("8d-report", "8D Report Builder", "8D 报告生成器",
     "<span>8D</span> Report Builder", "<span>8D</span> 报告生成器",
     "A customer complaint or quality escape? Work through the 8 disciplines step by step. The progress bar shows what's missing, and the finished report prints ready to send.",
     "遇到客户投诉或质量外流？一步步完成 8 个步骤。进度条告诉你还缺什么，完成后可直接打印发送。",
     [("For QA, engineers &amp; supervisors", "适合质量、工程师与主管"), ("8 steps", "8 个步骤"), ("Print or save as PDF", "可打印或另存为 PDF")],
     "8D Report Builder", "Free 8D report builder: team, problem description, containment, root cause, corrective actions, verification, prevention and closure.",
     '<div class="d8Prog panel"><div><b id="d8Pct">0%</b> ' + E("complete", "已完成") + '</div><i><b id="d8Bar"></b></i><nav class="d8Nav" id="d8Nav"></nav></div>' +
     D(1, "Team", "团队", '<div class="fldGrid">' + FLD("d1lead", "Team leader", "组长") + FLD("d1champ", "Sponsor / champion", "支持人") + FLD("d1team", "Team members (cross-functional)", "成员（跨部门）", wide=True) + "</div>") +
     D(2, "Describe the problem (5W2H)", "描述问题（七问分析法）", '<div class="fldGrid">' + FLD("d2cust", "Customer / complaint ref.", "客户 / 投诉编号") + FLD("d2part", "Part / product", "零件 / 产品") +
       FLD("d2what", "What is wrong (vs. the specification)?", "哪里不对（对比规格）？", wide=True) + FLD("d2where", "Where was it found?", "在哪里发现？") + FLD("d2when", "When was it found / made?", "什么时候发现 / 生产？") +
       FLD("d2who", "Who found it?", "谁发现的？") + FLD("d2qty", "How many affected?", "影响数量？") + FLD("d2how", "How was it detected?", "如何被发现？", wide=True) + "</div>") +
     D(3, "Containment (protect the customer now)", "围堵措施（立即保护客户）", P("Check every place suspect product could be. Aim to contain within 24 hours.", "检查所有可能有可疑品的地方，目标在 24 小时内完成围堵。") +
       '<div class="tblWrapR"><table class="tracker"><thead><tr><th>' + E("Location", "位置") + "</th><th>" + E("Qty checked", "检查数量") + "</th><th>" + E("Suspect found", "发现可疑") + "</th><th>" + E("Action (sort, rework, scrap, replace)", "措施（挑选、返工、报废、更换）") + f"</th></tr></thead><tbody>{cont_rows}</tbody></table></div>" +
       '<div class="fldGrid">' + FLD("d3date", "Containment completed on", "围堵完成日期", "date") + FLD("d3cert", "How are good parts marked from now?", "之后合格品如何标识？") + "</div>") +
     D(4, "Root cause", "根本原因", P('Find two root causes: why it was <b>made</b>, and why it <b>escaped</b>. Use the <a href="fishbone-5why.html">Fishbone + 5-Why Builder</a>.', '找出两个根本原因：为什么会<b>产生</b>，以及为什么会<b>流出</b>。可使用<a href="fishbone-5why.html">鱼骨图 + 5 个为什么</a>。') +
       '<div class="fldGrid">' + FLD("d4occ", "Occurrence: why was it made?", "产生原因：为什么会做出来？", wide=True, area=True) + FLD("d4esc", "Escape: why wasn't it detected?", "流出原因：为什么没被发现？", wide=True, area=True) +
       FLD("d4prove", "How was the root cause confirmed?", "如何确认根本原因？", wide=True) + "</div>") +
     D(5, "Permanent corrective actions", "永久纠正措施", '<div class="fldGrid">' + FLD("d5occ", "Action for occurrence", "针对产生原因的措施", wide=True) + FLD("d5esc", "Action for escape", "针对流出原因的措施", wide=True) +
       FLD("d5own", "Owner", "负责人") + FLD("d5due", "Due date", "截止日期", "date") + "</div>") +
     D(6, "Implement &amp; verify", "实施与验证", '<div class="fldGrid">' + FLD("d6date", "Implemented on", "实施日期", "date") + FLD("d6ev", "Evidence it works (data, audit, run size)", "有效证据（数据、审核、批量）", wide=True, area=True) +
       FLD("d6rm", "Containment removed on", "围堵解除日期", "date") + "</div>") +
     D(7, "Prevent recurrence", "防止再发", d7html) +
     D(8, "Close &amp; recognise the team", "结案并表彰团队", '<div class="fldGrid">' + FLD("d8date", "Closed on", "结案日期", "date") + FLD("d8cust", "Customer accepted (name / date)", "客户确认（姓名 / 日期）") +
       FLD("d8thanks", "Who to thank and for what", "要感谢谁、为什么", wide=True) + "</div>") +
     RELATED([("fishbone-5why.html", "Fishbone + 5-Why Builder →", "鱼骨图 + 5 个为什么 →"), ("escalation-report.html", "Escalation Report Builder →", "升级报告生成器 →")]),
     "tools-prod.js")

# ------------------------------------------------------------------ 5. Skills Matrix
legend = "".join(f'<li><button type="button" class="smCell lv{i}" tabindex="-1"><i class="pie p{i}"></i><span>{i}</span></button>{E(a, b)}</li>' for i, (a, b) in enumerate([("Not trained", "未培训"), ("Learning", "学习中"), ("Can do with support", "需协助可完成"), ("Independent", "可独立操作"), ("Can train others", "可以培训他人")]))
page("skills-matrix", "Team Skills Matrix", "团队技能矩阵",
     "Team <span>Skills</span> Matrix", "团队<span>技能</span>矩阵",
     "Who can run what? Tap each cell to set a level. The matrix flags single points of failure and builds a training plan to reach your cover target.",
     "谁能做什么？点击每个格子设定等级，矩阵会标出单点风险，并生成达到覆盖目标的培训计划。",
     [("For supervisors &amp; managers", "适合主管与经理"), ("Single-point-of-failure alerts", "单点风险提醒"), ("Export to Excel (CSV)", "可导出到 Excel（CSV）")],
     "Team Skills Matrix", "Free team skills matrix: cross-training levels, single points of failure and an automatic training plan. Export to Excel.",
     PART(1, "Fill in the matrix", "填写矩阵",
          P("Rename people and skills by typing on them. Tap a cell to move up one level (4 goes back to 0).", "直接输入即可修改人员和技能名称。点击格子提升一级（4 级再点回到 0）。") +
          f'<ul class="smLegend">{legend}</ul>' +
          '<div class="fldGrid smT"><div class="fld"><label for="smTarget">' + E("Target: people qualified (level 3+) per skill", "目标：每项技能合格人数（3 级以上）") + '</label><input id="smTarget" type="number" min="1" max="9"></div></div>' +
          '<div class="tblWrapR"><table class="tracker smTable" id="smGrid"></table></div>' +
          '<div class="resTools"><button type="button" class="btn outline" id="smAddP">' + E("+ ADD PERSON", "+ 新增人员") + '</button><button type="button" class="btn outline" id="smAddS">' + E("+ ADD SKILL", "+ 新增技能") +
          '</button><button type="button" class="btn outline" id="smCsv">' + E("DOWNLOAD CSV", "下载 CSV") + "</button></div>") +
     PART(2, "Risks &amp; training plan", "风险与培训计划",
          '<div class="mpKpis" id="smKpis"></div><h3 class="mpH">' + E("Where you are exposed", "你的风险点") + '</h3><ul class="smRisk" id="smRisk"></ul>' +
          '<h3 class="mpH">' + E("Suggested training plan", "建议的培训计划") + '</h3><div class="tblWrapR"><table class="tracker smPlanT"><thead><tr><th>' + E("Skill", "技能") + "</th><th>" + E("Train", "培训对象") + "</th><th>" + E("Trainer", "培训人") + "</th><th>" + E("Goal", "目标") + '</th></tr></thead><tbody id="smPlan"></tbody></table></div>' +
          P("Pick learners who already have some experience first. They reach level 3 fastest.", "优先选择已有一定经验的人来培训，他们最快达到 3 级。", "resNote")) +
     RELATED([("manpower-gap-calculator.html", "Manpower Gap Calculator →", "人力缺口计算器 →"), ("supervisor-daily-planner.html", "Supervisor Daily Planner →", "主管每日计划表 →")]),
     "tools-mgmt.js")

# ------------------------------------------------------------------ 6. Difficult Conversation Planner
prep = [("cvP1", "Private place, enough time, not in front of the team", "私密的地点、充足的时间、不在团队面前"), ("cvP2", "I am calm, not angry", "我很冷静，没有在生气"),
        ("cvP3", "I have facts: dates, numbers, examples", "我有事实：日期、数字、例子"), ("cvP4", "I checked company HR policy if needed", "如有需要，我已确认公司人事规定")]
page("difficult-conversation", "Difficult Conversation Planner", "困难对话准备表",
     "Difficult <span>Conversation</span> Planner", "困难<span>对话</span>准备表",
     "Need to talk to someone about performance, behaviour or attendance? Plan it in 10 minutes: facts, impact, what good looks like, and a script you can follow.",
     "需要和员工谈绩效、行为或出勤？10 分钟做好准备：事实、影响、期望标准，以及一份可以照着说的话术。",
     [("For supervisors &amp; managers", "适合主管与经理"), ("10 minutes", "10 分钟"), ("Ready-made script", "现成话术")],
     "Difficult Conversation Planner", "Free difficult conversation planner for supervisors: SBI facts, judgement-word check, expectations and a ready script.",
     PART(1, "What kind of conversation?", "哪一类对话？", '<div class="dtChips" id="cvType"></div><p class="cvTip" id="cvTip"></p>' +
          '<div class="d7Checks">' + "".join(f'<label class="gateCheck"><input type="checkbox" id="{i}" data-keep> {E(a, b)}</label>' for i, a, b in prep) + "</div>") +
     PART(2, "The facts", "事实", '<div id="cvForm"><div class="fldGrid">' + FLD("cvName", "Their name", "对方姓名") + FLD("cvSit", "When / where it happened", "什么时候 / 在哪里发生") +
          FLD("cvBeh", "What you saw or heard (behaviour, not personality)", "你看到或听到了什么（行为，不是人品）", wide=True, area=True) +
          FLD("cvImp", "The impact on work, quality, safety or the team", "对工作、质量、安全或团队的影响", wide=True, area=True) + "</div>" +
          '<p class="cvCheck" id="cvCheck" aria-live="polite"></p>' +
          '<h2 class="cvH2">' + E("What good looks like", "期望的标准") + '</h2><div class="fldGrid">' + FLD("cvNeed", "What you need from now on (specific)", "从现在起你需要什么（具体）", wide=True) +
          FLD("cvSupport", "Support you can offer (optional)", "你能提供的支持（选填）", wide=True) + FLD("cvAgree", "Agreed action", "约定的行动", wide=True) + FLD("cvFollow", "Follow-up date", "跟进日期", "date") + "</div></div>") +
     PART(3, "Your script", "你的话术", P("Use it as a guide, not word for word. After the question in step 4, stop talking and listen.", "把它当作指引，不必逐字照念。在第 4 步提问之后，停下来认真听。") + COPYOUT("cvOut", "cvCopy")) +
     RELATED([("checklist-quiet-quitting.html", "Quiet Quitting Early-Warning Checklist →", "员工默默躺平预警清单 →"), (V + "7681167224157179157", "Your best employee still works, but no longer cares ↗", "最好的员工还在工作，却已经不在乎了 ↗")]),
     "tools-mgmt.js")

# ------------------------------------------------------------------ 7. Escalation Report Builder
sev = [("high", "High: safety, customer or major cost", "高：安全、客户或重大成本"), ("med", "Medium: affects output this week", "中：影响本周产出"), ("low", "Low: needs awareness only", "低：仅需知会")]
cst = [("inv", "Under investigation", "调查中"), ("known", "Confirmed", "已确认"), ("unk", "Not yet known", "尚未知")]
opts = "".join('<div class="fldGrid erOpt">' + FLD(f"erOpt{i}", f"Option {chr(64+i)}", f"方案 {chr(64+i)}", wide=True) + FLD(f"erOptC{i}", "Cost", "成本") + FLD(f"erOptE{i}", "Effect / risk", "效果 / 风险") + "</div>" for i in (1, 2, 3))
page("escalation-report", "Escalation Report Builder", "升级报告生成器",
     "Escalation <span>Report</span> Builder", "升级<span>报告</span>生成器",
     "Turn a floor problem into a short, clear report senior management can act on: bottom line first, cost and delivery impact, options, and exactly what you need.",
     "把现场问题变成高层能立即决策的简短报告：结论先行、成本与交付影响、可选方案，以及你需要的支持。",
     [("For supervisors &amp; managers", "适合主管与经理"), ("Cost impact calculator", "成本影响计算"), ("Copy as email", "可复制为邮件")],
     "Escalation Report Builder", "Free escalation report builder: bottom line up front, cost and delivery impact, options and the decision you need from senior management.",
     '<div id="erForm">' +
     PART(1, "The issue", "问题", '<div class="fldGrid">' + FLD("erTitle", "Issue title (one line)", "问题标题（一句话）", wide=True) + SEL("erSev", "Severity", "严重程度", sev) +
          FLD("erWhat", "What happened (facts only)", "发生了什么（只写事实）", wide=True, area=True) + "</div>") +
     PART(2, "Impact", "影响", '<div class="fldGrid">' + FLD("erCur", "Currency (e.g. RM, S$, $)", "货币（如令吉、新元、人民币）") + FLD("erHrs", "Downtime so far (hours)", "目前停机（小时）", "number") + FLD("erRate", "Cost per downtime hour", "每小时停机成本", "number") +
          FLD("erScrap", "Units scrapped", "报废数量", "number") + FLD("erUnit", "Cost per unit", "每件成本", "number") + FLD("erOther", "Other cost (overtime, freight…)", "其他成本（加班、运费…）", "number") +
          FLD("erCust", "Customer / order affected", "受影响的客户 / 订单") + FLD("erQty", "Units at risk for delivery", "交付风险数量") + FLD("erDate", "Due date", "交期", "date") +
          FLD("erRisk", "Safety or quality risk", "安全或质量风险", wide=True) + '</div><div class="mpKpis" id="erCost"></div>') +
     PART(3, "Cause &amp; actions", "原因与措施", '<div class="fldGrid">' + FLD("erCause", "Cause", "原因", wide=True) + SEL("erCauseSt", "Cause status", "原因状态", cst) +
          FLD("erDone", "Actions already taken", "已采取的措施", wide=True, area=True) + "</div>") +
     PART(4, "Options &amp; the ask", "方案与请求", opts + '<div class="fldGrid">' + FLD("erRec", "Your recommendation", "你的建议", wide=True) +
          FLD("erAsk", "What you need from them (decision, budget, people…)", "你需要对方提供什么（决定、预算、人力…）", wide=True) + FLD("erBy", "Needed by", "需要的期限") + FLD("erNext", "Next update", "下次更新时间") + "</div>") +
     "</div>" +
     PART(5, "Your report", "你的报告", P("Bottom line first: busy leaders read the first two lines. Paste this into an email or chat.", "结论先行：忙碌的领导只看前两行。把它粘贴到邮件或聊天中。") + COPYOUT("erOut", "erCopy")) +
     RELATED([("decision-matrix.html", "Decision Matrix: compare the options →", "决策矩阵：比较各个方案 →"), ("8d-report.html", "8D Report Builder →", "8D 报告生成器 →")]),
     "tools-mgmt.js")

# ------------------------------------------------------------------ 8. Decision Matrix
page("decision-matrix", "Decision Matrix", "决策矩阵",
     "Decision <span>Matrix</span>", "决策<span>矩阵</span>",
     "Comparing options? Weight what matters, score each option, mark the must-haves, and get a clear recommendation, plus a warning if the result is too close to call.",
     "要在几个方案中做选择？给重要的标准加权、为每个方案打分、标出必须项，得到清晰的建议；如果结果太接近，也会提醒你。",
     [("For managers &amp; engineers", "适合经理与工程师"), ("Ready templates", "现成模板"), ("Robustness check", "稳健性检查")],
     "Decision Matrix", "Free weighted decision matrix: criteria weights, scores, must-have knockouts, recommendation and sensitivity check.",
     PART(1, "The decision", "要做的决定", '<div class="fldGrid">' + FLD("dmQ", "What are you deciding?", "你要决定什么？", wide=True) + "</div>" +
          P("Start from a template, or edit the criteria below:", "可从模板开始，或直接修改下面的标准：") + '<div class="dtChips" id="dmPresets"></div>') +
     PART(2, "Weights and scores", "权重与评分", P("Weight: how important (1–5). Score: how well each option does (1 poor – 5 excellent). Tick <b>Must</b> for deal-breakers.", "权重：重要程度（1–5）。评分：每个方案的表现（1 很差 – 5 很好）。一票否决的标准请勾选<b>必须</b>。") +
          '<div class="tblWrapR"><table class="tracker dmTable" id="dmGrid"></table></div>' +
          '<div class="resTools"><button type="button" class="btn outline" id="dmAddO">' + E("+ ADD OPTION", "+ 新增方案") + '</button><button type="button" class="btn outline" id="dmAddC">' + E("+ ADD CRITERION", "+ 新增标准") + "</button></div>") +
     PART(3, "Result", "结果", '<div class="dmBars" id="dmBars"></div><p class="dmVerdict" id="dmVerdict" aria-live="polite"></p>' +
          P("A matrix supports judgement; it doesn't replace it. If the winner feels wrong, ask which criterion is missing.", "矩阵是辅助判断，不是替代判断。如果胜出方案感觉不对，问问自己漏掉了哪个标准。", "resNote")) +
     RELATED([("escalation-report.html", "Escalation Report Builder →", "升级报告生成器 →"), ("ai-prompt-pack.html", "AI Prompt Pack for Operations Managers →", "运营经理 AI 提示词包 →")]),
     "tools-mgmt.js")
