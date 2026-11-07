"""Generate the 3 LAOYU AI demo pages (no sign-up) with the standard 12-section structure."""
import re
ROOT = "/home/claude/src/site"
shell = open(f"{ROOT}/manpower-gap-calculator.html").read()
head_tpl, foot_tpl = shell[:shell.index("<main")], shell[shell.index("</main>") + 7:]

def E(en, zh): return f'<span class="en">{en}</span><span class="zh">{zh}</span>'
def P(en, zh, cls=""): c = f" {cls}" if cls else ""; return f'<p class="en{c}">{en}</p><p class="zh{c}">{zh}</p>'
def FLD(id, en, zh, typ="text", wide=False, area=False, rows=3):
    w = " wide" if wide else ""
    inp = f'<textarea id="{id}" rows="{rows}" data-keep></textarea>' if area else f'<input id="{id}" type="{typ}" data-keep' + (' step="any"' if typ == "number" else "") + ">"
    return f'<div class="fld{w}"><label for="{id}">{E(en, zh)}</label>{inp}</div>'

SIM = ('<div class="simBanner"><b>' + E("SIMULATED AI", "模拟 AI") + "</b>" +
       E("This demo uses fixed rules in your browser, not a real AI model. Nothing you type is sent anywhere. For real AI, copy the prompt further down into ChatGPT, Gemini, Claude or Copilot.",
         "此演示在你的浏览器中使用固定规则运行，不是真正的 AI 模型。你输入的内容不会发送到任何地方。如需真实 AI，请把下方的提示词复制到 ChatGPT、Gemini、Claude 或 Copilot。") + "</div>")
BTNS = ('<div class="dBtns"><button type="button" class="btn outline" id="dSample">' + E("LOAD SAMPLE", "载入示例") + "</button>"
        '<button type="button" class="btn orange" id="dGo">{go}</button>'
        '<button type="button" class="btn outline" data-reset>' + E("CLEAR", "清除") + "</button></div>")
OUTBTNS = ('<div class="dBtns"><button type="button" class="btn orange" id="dCopy">' + E("COPY", "复制") + "</button>"
           '<button type="button" class="btn outline" id="dDl">' + E("DOWNLOAD .TXT", "下载 .TXT") + "</button>"
           '<button type="button" class="btn outline" data-print>' + E("PRINT / SAVE AS PDF", "打印 / 另存为 PDF") + "</button></div>")

def page(slug, title_en, h1_en, h1_zh, lead_en, lead_zh, meta, desc, form, go_en, go_zh, out_id):
    h = head_tpl
    h = re.sub(r"<title>.*?</title>", f"<title>{title_en} | LAOYU</title>", h)
    h = re.sub(r'(<meta name="description" content=")[^"]*', r"\g<1>" + desc, h)
    h = re.sub(r'(<meta property="og:title" content=")[^"]*', r"\g<1>" + title_en, h)
    h = re.sub(r'(<meta property="og:description" content=")[^"]*', r"\g<1>" + desc, h)
    h = h.replace('<link rel="stylesheet" href="twin.css?v=20261030d">', '<link rel="stylesheet" href="twin.css?v=20261030d"><link rel="stylesheet" href="tools2.css?v=20261101s"><link rel="stylesheet" href="resources2.css?v=20261101">')
    h = h.replace("<body>", f'<body data-res="{slug}">')
    metas = "".join(f'<li class="en">{a}</li><li class="zh">{b}</li>' for a, b in meta)
    main = (f'<main class="resPage">\n<section class="hero resHero"><div class="wrap">\n  <div class="eyebrow">AI DEMO</div>\n'
            f'  <h1>{E(h1_en, h1_zh)}</h1>\n  {P(lead_en, lead_zh)}\n  <ul class="resMeta">{metas}</ul>\n</div></section>\n'
            f'<section class="section resSection" data-i18n-block><div class="wrap resWrap">\n{SIM}\n<div data-kit="top"></div>\n'
            f'<article class="panel resPart demoPart" id="demo"><div class="resNum">05</div><h2>{E("Interactive demonstration", "交互演示")}</h2>\n{form}\n'
            + BTNS.replace("{go}", E(go_en, go_zh)) +
            f'\n<h3 class="mpH">{E("Result", "结果")}</h3><div class="demoOut" id="{out_id}" aria-live="polite"><p class="resNote">{E("Fill in the form, or load the sample, then press the button above.", "填写表单或载入示例，然后点击上方按钮。")}</p></div>\n{OUTBTNS}\n</article>\n'
            f'<div data-kit="bottom"></div>\n</div></section>\n</main>')
    f = foot_tpl.replace('<script src="tools.js?v=20261030"></script>', '<script src="resources-data.js?v=20261101"></script><script src="demos.js?v=20261101s"></script><script src="resource-kit.js?v=20261102a"></script>')
    f = f.replace('<script src="gate.js?v=20261107c"></script>', "")
    open(f"{ROOT}/{slug}.html", "w").write(h + main + f)
    print("wrote", slug)

down = "".join(f'<tr><td>{i}</td><td><input id="drD{i}m" type="number" data-keep aria-label="minutes"></td><td><input id="drD{i}r" data-keep aria-label="reason"></td></tr>' for i in (1, 2, 3))
page("demo-daily-report", "AI Daily Production Report",
     "AI Daily <span>Production</span> Report", "AI 每日<span>生产</span>报告",
     "Enter today's numbers and see a structured daily report: target vs actual, achievement, gap, quality, downtime, missing information and follow-up actions.",
     "输入今天的数据，看到结构化日报：目标对比实际、达成率、差距、质量、停机、缺失信息和跟进行动。",
     [("Simulated AI · no sign-up", "模拟 AI · 无需注册"), ("3 minutes", "3 分钟"), ("Synthetic sample data", "模拟示例数据")],
     "Free AI daily production report demo: target vs actual, achievement, gap, quality, downtime, missing information and follow-up actions.",
     '<div class="fldGrid">' + FLD("drLine", "Line / area", "产线 / 区域") + FLD("drDate", "Date", "日期", "date") + FLD("drShift", "Shift", "班次") + FLD("drHours", "Shift length (hours)", "班次时长（小时）", "number") +
     FLD("drTarget", "Target output (units)", "目标产量（件）", "number") + FLD("drActual", "Actual output (units)", "实际产量（件）", "number") + FLD("drScrap", "Scrap / rejects (units)", "报废 / 不良（件）", "number") +
     FLD("drHcPlan", "Planned people", "计划人数", "number") + FLD("drHcAct", "Actual people", "实际人数", "number") + "</div>" +
     '<h3 class="mpH">' + E("Downtime", "停机") + '</h3><div class="tblWrapR"><table class="tracker"><thead><tr><th>#</th><th>' + E("Minutes", "分钟") + "</th><th>" + E("Reason", "原因") + f"</th></tr></thead><tbody>{down}</tbody></table></div>" +
     '<div class="fldGrid">' + FLD("drQual", "Quality issues", "质量问题", wide=True, area=True, rows=2) + FLD("drNotes", "Other notes (people, material)", "其他备注（人员、物料）", wide=True, area=True, rows=2) + "</div>",
     "GENERATE REPORT", "生成报告", "drOut")

page("demo-root-cause", "AI Root Cause Assistant",
     "AI Root <span>Cause</span> Assistant", "AI 根本<span>原因</span>助手",
     "Describe a workplace problem and get a clear problem statement, a Five Whys investigation guide, causes to check, recommended controls and a verification plan.",
     "描述一个工作中的问题，得到清晰的问题描述、5 个为什么调查指引、待核实原因、建议控制措施和验证计划。",
     [("Simulated AI · no sign-up", "模拟 AI · 无需注册"), ("5 minutes", "5 分钟"), ("Never claims an unverified cause", "绝不把未核实原因当结论")],
     "Free AI root cause assistant demo: problem statement, Five Whys guide, causes to check, controls and verification plan.",
     '<div class="fldGrid">' + FLD("rcWhat", "What is wrong?", "出了什么问题？", wide=True) + FLD("rcWhere", "Where? (line, station, product)", "在哪里？（产线、工位、产品）") +
     FLD("rcWhen", "When / since when?", "什么时候 / 从何时开始？") + FLD("rcHow", "How much or how often?", "多少或多频繁？") + FLD("rcImpact", "Impact (customer, cost, safety)", "影响（客户、成本、安全）") +
     FLD("rcChange", "What changed recently? (people, material, machine, method)", "最近有什么变化？（人员、材料、设备、方法）", wide=True, area=True, rows=2) + "</div>" +
     '<h3 class="mpH">' + E("Whys you already know (optional)", "你已知道的“为什么”（选填）") + '</h3><div class="fldGrid">' +
     "".join(FLD(f"rcW{i}", f"Why {i}?", f"为什么 {i}？", wide=True) for i in range(1, 6)) + "</div>",
     "BUILD INVESTIGATION PLAN", "生成调查计划", "rcOut")

page("demo-shift-handover", "AI Shift Handover Assistant",
     "AI Shift <span>Handover</span> Assistant", "AI <span>交接班</span>助手",
     "Paste rough handover notes and see them sorted into safety, quality, equipment, material and manpower, with outstanding actions, follow-up owners and missing information.",
     "粘贴随手写的交接记录，自动整理成安全、质量、设备、物料和人员，并列出未完成行动、跟进负责人和缺失信息。",
     [("Simulated AI · no sign-up", "模拟 AI · 无需注册"), ("2 minutes", "2 分钟"), ("Copy or download", "可复制或下载")],
     "Free AI shift handover assistant demo: sort notes into safety, quality, equipment, material and manpower with actions, owners and gaps.",
     P("Write the way you normally would: one point per line, or a chat message. Use @Name to assign an owner.", "照平时的习惯写：每行一点，或像聊天消息一样。用 @姓名 指定负责人。") +
     '<div class="fldGrid">' + FLD("hoNotes", "Handover notes", "交接记录", wide=True, area=True, rows=9) + "</div>",
     "ORGANISE NOTES", "整理记录", "hoOut")
