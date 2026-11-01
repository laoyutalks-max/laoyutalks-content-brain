"""Generate the 5 LAOYU AI tool pages and the AI Tools library page."""
import re
ROOT = "/home/claude/src/site"
shell = open(f"{ROOT}/manpower-gap-calculator.html").read()
head_tpl, foot_tpl = shell[:shell.index("<main")], shell[shell.index("</main>") + 7:]

def E(en, zh): return f'<span class="en">{en}</span><span class="zh">{zh}</span>'
def P(en, zh, cls=""): c = f" {cls}" if cls else ""; return f'<p class="en{c}">{en}</p><p class="zh{c}">{zh}</p>'
def FLD(id, en, zh, typ="text", wide=False, area=False, rows=3, keep=True):
    w = " wide" if wide else ""; k = " data-keep" if keep else ""
    inp = f'<textarea id="{id}" rows="{rows}"{k}></textarea>' if area else f'<input id="{id}" type="{typ}"{k}>'
    return f'<div class="fld{w}"><label for="{id}">{E(en, zh)}</label>{inp}</div>'
def SEL(id, en, zh, opts="", wide=False):
    return f'<div class="fld{" wide" if wide else ""}"><label for="{id}">{E(en, zh)}</label><select id="{id}">{opts}</select></div>'

def shell_page(slug, title_en, desc, body, scripts):
    h = head_tpl
    h = re.sub(r"<title>.*?</title>", f"<title>{title_en} | LAOYU</title>", h)
    h = re.sub(r'(<meta name="description" content=")[^"]*', r"\g<1>" + desc, h)
    h = re.sub(r'(<meta property="og:title" content=")[^"]*', r"\g<1>" + title_en, h)
    h = re.sub(r'(<meta property="og:description" content=")[^"]*', r"\g<1>" + desc, h)
    if "resources2.css" not in h:
        h = h.replace('<link rel="stylesheet" href="twin.css', '<link rel="stylesheet" href="resources2.css?v=20261101b"><link rel="stylesheet" href="twin.css', 1)
    if "tools2.css" not in h:
        h = h.replace('<link rel="stylesheet" href="resources2.css', '<link rel="stylesheet" href="tools2.css?v=20261030"><link rel="stylesheet" href="resources2.css', 1)
    f = foot_tpl
    f = re.sub(r'<script src="gate\.js[^"]*"></script>', "", f)
    f = re.sub(r'<script src="tools\.js[^"]*"></script>', scripts, f)
    f = re.sub(r'<script src="resources-data\.js[^"]*"></script><script src="resource-kit\.js[^"]*"></script>', "", f)
    open(f"{ROOT}/{slug}.html", "w").write(h + body + f)
    print("wrote", slug)

def tool(slug, cat_en, cat_zh, title_en, title_zh, h1_en, h1_zh, lead_en, lead_zh, meta, desc, form, out_id, live, dl, use, expect, related):
    metas = "".join(f'<li class="en">{a}</li><li class="zh">{b}</li>' for a, b in meta)
    go = "" if live else '<button type="button" class="btn orange" id="tGo">' + E("GENERATE", "生成") + "</button>"
    dlb = '<button type="button" class="btn outline" id="tDl">' + E("DOWNLOAD .TXT", "下载 .TXT") + "</button>" if dl else ""
    rel = "".join(f'<a href="{u}"><b>{E(a, b)}</b></a>' for u, a, b in related)
    body = (f'<main class="resPage aiTool">\n<section class="hero resHero"><div class="wrap">\n  <div class="eyebrow">{E("AI TOOL · " + cat_en.upper(), "AI 工具 · " + cat_zh)}</div>\n'
            f'  <h1>{E(h1_en, h1_zh)}</h1>\n  {P(lead_en, lead_zh)}\n  <ul class="resMeta">{metas}</ul>\n</div></section>\n'
            f'<section class="section resSection" data-i18n-block><div class="wrap resWrap">\n'
            f'<div class="toolWrap"><div class="panel toolForm"><h2>{E("Input", "输入")}</h2>{form}'
            f'<div class="dBtns"><button type="button" class="btn outline" id="tEx">{E("EXAMPLE", "示例")}</button>{go}<button type="button" class="btn outline" id="tReset">{E("RESET", "重置")}</button></div></div>'
            f'<div class="panel toolRes"><h2>{E("Output", "输出")}</h2><div class="demoOut" id="{out_id}" aria-live="polite"><p class="resNote">{E("Fill in the form or press EXAMPLE.", "填写表单或点击“示例”。")}</p></div>'
            f'<div class="dBtns"><button type="button" class="btn orange" id="tCopy">{E("COPY", "复制")}</button>{dlb}</div></div></div>\n'
            f'<div class="kitGrid toolInfo"><section class="kitBox"><h2>{E("Use case", "使用场景")}</h2>{P(*use)}</section>'
            f'<section class="kitBox"><h2>{E("Expected output", "预期结果")}</h2>{P(*expect)}</section></div>\n'
            f'<p class="toolNote">{E("Runs in your browser with fixed rules. No AI API is used and nothing you type is sent anywhere.", "在你的浏览器中按固定规则运行，不调用 AI 接口，你输入的内容不会被发送到任何地方。")}</p>\n'
            f'<section class="kitBox"><h2>{E("Related", "相关工具")}</h2><div class="kitRel">{rel}</div></section>\n'
            f'</div></section>\n</main>')
    shell_page(slug, title_en, desc, body, '<script src="tools-ai.js?v=20261101b"></script>')

tool("tool-excel-formula", "Productivity", "职场效率", "Excel Formula Assistant", "Excel 公式助手",
     "Excel <span>Formula</span> Assistant", "Excel <span>公式</span>助手",
     "Pick what you want to do. Get a ready formula with a plain explanation.", "选择你要做的事，得到现成的公式和简单说明。",
     [("Excel & Google Sheets", "Excel 与 Google Sheets"), ("10 common tasks", "10 种常用任务"), ("Instant", "即时")],
     "Free Excel formula assistant for manufacturing: lookups, COUNTIFS, SUMIFS, achievement %, days overdue, Pareto and more.",
     SEL("fxTask", "What do you want to do?", "你想做什么？", wide=True) + '<div class="fldGrid">' + FLD("fxA", "Range / first cell", "范围 / 第一个单元格", keep=False) + FLD("fxB", "Condition / second cell", "条件 / 第二个单元格", keep=False) + FLD("fxC", "Extra (optional)", "附加（选填）", keep=False) + "</div>",
     "fxOut", True, False,
     ("Building a KPI sheet, counting defects by type, checking overdue actions or making a Pareto without searching the web.", "做 KPI 表、按类型统计缺陷、检查逾期行动或做柏拉图，不用再上网搜索。"),
     ("One formula ready to paste, what it does, and tips for older Excel or Google Sheets.", "一个可直接粘贴的公式、它的作用，以及旧版 Excel 或 Google Sheets 的提示。"),
     [("production-kpi-dashboard.html", "Production KPI Dashboard", "生产 KPI 仪表板"), ("weekly-action-tracker.html", "Weekly Action Tracker", "每周行动追踪表"), ("tool-downtime-analysis.html", "Downtime Analysis Assistant", "停机分析助手")])

tool("tool-meeting-minutes", "Management", "管理", "Meeting Minutes Generator", "会议纪要生成器",
     "Meeting <span>Minutes</span> Generator", "会议<span>纪要</span>生成器",
     "Paste rough notes. Get minutes with decisions, actions, owners and risks.", "粘贴随手记的笔记，得到含决定、行动、负责人和风险的会议纪要。",
     [("Any meeting", "任何会议"), ("Use @Name for owners", "用 @姓名 指定负责人"), ("Copy or download", "可复制或下载")],
     "Free meeting minutes generator: turn rough notes into decisions, actions with owners and dates, and open risks.",
     '<div class="fldGrid">' + FLD("mmTitle", "Meeting", "会议名称", wide=True) + FLD("mmDate", "Date", "日期", "date") + FLD("mmNext", "Next meeting", "下次会议", "date") +
     FLD("mmWho", "Attendees", "参会人员", wide=True) + FLD("mmNotes", "Notes (one point per line)", "笔记（每行一点）", wide=True, area=True, rows=9) + "</div>",
     "mmOut", False, True,
     ("Weekly production reviews, quality meetings and project check-ins where actions usually get lost.", "生产周会、质量会议和项目例会，这些场合行动项最容易丢失。"),
     ("Key points, decisions, an action table with owner and due date, risks, and a warning for missing owners or dates.", "要点、决定、含负责人和期限的行动表、风险，以及缺少负责人或日期的提醒。"),
     [("weekly-action-tracker.html", "Weekly Action Tracker", "每周行动追踪表"), ("demo-shift-handover.html", "AI Shift Handover Assistant", "AI 交接班助手"), ("tool-email-writer.html", "Email Writing Assistant", "邮件写作助手")])

tool("tool-capa-planner", "Quality & CI", "质量与持续改善", "CAPA Action Planner", "CAPA 措施计划",
     "CAPA <span>Action</span> Planner", "CAPA <span>措施</span>计划",
     "Enter the problem and root cause. Get containment, corrective and preventive actions with dates.", "输入问题和根本原因，得到带日期的围堵、纠正和预防措施。",
     [("For QA & engineers", "适合质量与工程师"), ("Controls ranked by strength", "按强弱排列的控制措施"), ("Dates by severity", "按严重程度设定期限")],
     "Free CAPA action planner: containment, correction, corrective and preventive actions and effectiveness check with due dates.",
     '<div class="fldGrid">' + FLD("cpProblem", "Problem", "问题", wide=True) + FLD("cpCause", "Root cause", "根本原因", wide=True, area=True, rows=3) +
     '<label class="gateCheck fld wide" for="cpVerified"><input type="checkbox" id="cpVerified"> ' + E("Root cause verified with data or a test", "根本原因已通过数据或试验验证") + "</label>" +
     SEL("cpSev", "Severity", "严重程度", '<option value="high" data-en="High (safety or customer)" data-zh="高（安全或客户）">High (safety or customer)</option><option value="med" data-en="Medium" data-zh="中" selected>Medium</option><option value="low" data-en="Low" data-zh="低">Low</option>') +
     FLD("cpOwner", "Owner", "负责人") + "</div>",
     "cpOut", False, True,
     ("After an NCR, audit finding or customer complaint, when you need a complete action plan quickly.", "出现不合格、审核发现或客户投诉后，需要快速制定完整的措施计划时。"),
     ("A CAPA table (containment, correction, corrective, preventive, effectiveness check) with owners and due dates.", "一张 CAPA 表（围堵、纠正、纠正措施、预防措施、有效性验证），含负责人和期限。"),
     [("demo-root-cause.html", "AI Root Cause Assistant", "AI 根本原因助手"), ("8d-report.html", "8D Report Builder", "8D 报告生成器"), ("fishbone-5why.html", "Fishbone + 5-Why Builder", "鱼骨图 + 5 个为什么")])

tool("tool-downtime-analysis", "Manufacturing", "制造", "Downtime Analysis Assistant", "停机分析助手",
     "Downtime <span>Analysis</span> Assistant", "停机<span>分析</span>助手",
     "Paste your stop log. See the Pareto, the vital few reasons and what to do next.", "粘贴停机记录，看到柏拉图、关键少数原因和下一步行动。",
     [("Paste from Excel", "可从 Excel 粘贴"), ("Automatic Pareto", "自动柏拉图"), ("Next steps", "下一步建议")],
     "Free downtime analysis assistant: paste reasons and minutes, get a Pareto, the vital few causes and next steps.",
     '<div class="fldGrid">' + FLD("daPlan", "Planned production time (min, optional)", "计划生产时间（分钟，选填）", "number") +
     FLD("daData", "Stops: one per line as reason, minutes", "停机：每行一条，格式为 原因, 分钟", wide=True, area=True, rows=11) + "</div>",
     "daOut", False, True,
     ("Weekly loss reviews, OEE meetings or before asking maintenance for support.", "每周损失回顾、OEE 会议，或在向维修请求支持之前。"),
     ("Total downtime, % of planned time, a Pareto table with cumulative %, the 80% reasons and next steps.", "停机合计、占计划时间比例、带累计百分比的柏拉图表、占 80% 的原因和下一步行动。"),
     [("oee-loss-calculator.html", "OEE Loss Calculator", "OEE 损失计算器"), ("downtime-troubleshooter.html", "Downtime Troubleshooter", "停机排查工具"), ("production-kpi-dashboard.html", "Production KPI Dashboard", "生产 KPI 仪表板")])

tool("tool-email-writer", "Productivity", "职场效率", "Email Writing Assistant", "邮件写作助手",
     "Email <span>Writing</span> Assistant", "邮件<span>写作</span>助手",
     "Choose the purpose and tone, add the facts. Get a clear email with the ask up front.", "选择目的和语气，填入事实，得到一封开门见山的清晰邮件。",
     [("6 purposes", "6 种目的"), ("3 tones", "3 种语气"), ("Ask first", "请求先行")],
     "Free email writing assistant for managers: requests, escalations, updates, follow-ups, push-backs and thank-yous.",
     '<div class="fldGrid">' + SEL("emPurpose", "Purpose", "目的") + SEL("emTone", "Tone", "语气") + FLD("emTo", "To (name)", "收件人（姓名）") + FLD("emFrom", "From (your name)", "发件人（你的名字）") +
     FLD("emTopic", "Topic", "主题", wide=True) + FLD("emFacts", "Key facts (one per line)", "关键事实（每行一条）", wide=True, area=True, rows=4) +
     FLD("emAsk", "What you need (optional)", "你需要什么（选填）", wide=True) + FLD("emBy", "By when", "期限") + "</div>",
     "emOut", True, False,
     ("Asking for support, escalating a line issue, following up on an overdue action or thanking a team.", "请求支持、升级产线问题、跟进逾期行动或感谢团队。"),
     ("A subject line and a short email with the ask first, key facts as bullets and a clear close.", "一个邮件主题和一封简短邮件：请求先行，关键事实用要点列出，结尾清晰。"),
     [("escalation-report.html", "Escalation Report Builder", "升级报告生成器"), ("tool-meeting-minutes.html", "Meeting Minutes Generator", "会议纪要生成器"), ("difficult-conversation.html", "Difficult Conversation Planner", "困难对话准备表")])

# ---------------- AI Tools library page ----------------
lib = ('<main class="resLib aiLib">\n<section class="hero rlHero"><div class="wrap">\n  <div class="eyebrow">AI TOOLS</div>\n'
       '  <h1>AI Tools for <span>Real Work.</span></h1>\n  <p>Practical tools for manufacturing, management, quality and daily work.</p>\n'
       '  <ul class="rlStats" id="atStats" data-i18n-block></ul>\n</div></section>\n'
       '<section class="section rlSec"><div class="wrap">\n'
       '  <div class="atTabs" id="atTabs" role="group" aria-label="Category" data-i18n-block></div>\n'
       '  <div class="atGrid" id="atGrid" data-i18n-block></div>\n'
       '  <div class="atLegend" id="atLegend" data-i18n-block></div>\n'
       '</div></section>\n</main>')
shell_page("ai-tools", "AI Tools", "LAOYU AI tools for manufacturing, management, quality and workplace productivity.",
           lib, '<script src="resources-data.js?v=20261101c"></script><script src="ai-tools.js?v=20261101"></script>')
s = open(f"{ROOT}/ai-tools.html").read()
s = s.replace('<script src="res.js?v=20261030"></script>', "")
open(f"{ROOT}/ai-tools.html", "w").write(s)
