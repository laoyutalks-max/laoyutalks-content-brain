"""Generate the 3 LAOYU dashboard template pages (owner preview until launch)."""
import re
ROOT = "/home/claude/src/site"
shell = open(f"{ROOT}/manpower-gap-calculator.html").read()
head_tpl, foot_tpl = shell[:shell.index("<main")], shell[shell.index("</main>") + 7:]

def E(en, zh): return f'<span class="en">{en}</span><span class="zh">{zh}</span>'
def P(en, zh, cls=""): c = f" {cls}" if cls else ""; return f'<p class="en{c}">{en}</p><p class="zh{c}">{zh}</p>'

def page(slug, kind, t_en, t_zh, h1_en, h1_zh, lead_en, lead_zh, formulas):
    h = head_tpl
    h = re.sub(r"<title>.*?</title>", f"<title>{t_en} | LAOYU</title>", h)
    desc = f"{t_en}: offline CSV dashboard template for manufacturing teams (coming soon)."
    h = re.sub(r'(<meta name="description" content=")[^"]*', r"\g<1>" + desc, h)
    h = re.sub(r'(<meta property="og:title" content=")[^"]*', r"\g<1>" + t_en, h)
    h = re.sub(r'(<meta property="og:description" content=")[^"]*', r"\g<1>" + desc, h)
    h = h.replace("<head>", '<head>\n<meta name="robots" content="noindex, nofollow">', 1)
    if "resources2.css" not in h:
        h = h.replace('<link rel="stylesheet" href="twin.css', '<link rel="stylesheet" href="resources2.css?v=20261101h"><link rel="stylesheet" href="twin.css', 1)
    h = h.replace('<link rel="stylesheet" href="twin.css', '<link rel="stylesheet" href="dash.css?v=20261103c"><link rel="stylesheet" href="twin.css', 1)
    f = foot_tpl
    f = re.sub(r'<script src="gate\.js[^"]*"></script>', "", f)
    f = re.sub(r'<script src="res\.js[^"]*"></script>', "", f)
    f = re.sub(r'<script src="tools\.js[^"]*"></script>', '<script src="owner.js?v=20261103a"></script><script src="dash.js?v=20261103b"></script>', f)
    f = re.sub(r'<script src="resources-data\.js[^"]*"></script><script src="resource-kit\.js[^"]*"></script>', "", f)
    assert "dash.js" in f, "script hook not found"
    fl = "".join(f"<li>{E(a, b)}</li>" for a, b in formulas)
    body = f'''<main class="resPage dashPage" data-dash="{kind}">
<section class="hero resHero"><div class="wrap">
  <div class="eyebrow">{E("DASHBOARD TEMPLATE · COMING SOON", "看板模板 · 即将推出")}</div>
  <h1>{E(h1_en, h1_zh)}</h1>
  {P(lead_en, lead_zh)}
  <ul class="resMeta"><li class="en">Offline · CSV in, dashboard out</li><li class="zh">离线使用 · 导入 CSV 即得看板</li><li class="en">Data stays in your browser</li><li class="zh">数据只留在你的浏览器</li></ul>
</div></section>
<section class="section resSection" data-i18n-block><div class="wrap dashWrap">
<div class="panel dashSoon" id="dashSoon">
  <h2>{E("Coming soon", "即将推出")}</h2>
  {P("This dashboard template is still being tested. It will be added to the free resources soon.", "这个看板模板仍在测试中，很快会加入免费资源。")}
  <a class="btn orange" href="resources.html">{E("SEE FREE RESOURCES →", "查看免费资源 →")}</a>
</div>
<div id="dashApp" hidden>
  <p class="ownerBar">{E("OWNER PREVIEW · Only visible on devices where you turned owner preview on.", "站长预览 · 仅在你开启站长预览的设备上可见。")}</p>
  <div class="panel dashTop">
    <h2 id="dTitle"></h2>
    <div class="dashBar">
      <label class="btn orange dFileBtn">{E("IMPORT CSV", "导入 CSV")}<input type="file" id="dFile" accept=".csv,text/csv"></label>
      <button type="button" class="btn outline" id="dSample">{E("LOAD SAMPLE", "载入示例")}</button>
      <button type="button" class="btn outline" id="dTpl">{E("DOWNLOAD SAMPLE CSV", "下载示例 CSV")}</button>
      <button type="button" class="btn outline" id="dExport">{E("EXPORT CURRENT CSV", "导出当前 CSV")}</button>
      <label class="dGroupL">{E("Chart by", "图表分组")} <select id="dGroup"></select></label>
    </div>
    <p class="dErr" id="dErr" role="alert" hidden></p>
    <p class="dWarn" id="dWarn" hidden></p>
    <p class="dInfo" id="dInfo"></p>
  </div>
  <div class="dCards" id="dCards" aria-live="polite"></div>
  <div class="dPanels">
    <div class="panel"><h3 id="dChartTitle"></h3><div class="dChart" id="dChart"></div></div>
    <div class="panel"><h3>{E("Data preview", "数据预览")}</h3><div class="dTableWrap" id="dTable"></div></div>
  </div>
  <div class="kitGrid">
    <section class="kitBox"><h2>{E("How the numbers are calculated", "数字是怎么算的")}</h2><ul>{fl}</ul></section>
    <section class="kitBox"><h2>{E("Your CSV file", "你的 CSV 文件")}</h2>
      {P("The first row must have these column names (extra columns are fine):", "第一行必须包含以下英文列名（可以有其他列）：")}
      <p class="dCols" id="dCols"></p>
      {P("Tip: press DOWNLOAD SAMPLE CSV, replace the rows with your data in Excel or Google Sheets, save as CSV, then IMPORT CSV.", "提示：点击“下载示例 CSV”，在 Excel 或 Google Sheets 中替换成你的数据，另存为 CSV，再点击“导入 CSV”。")}
    </section>
  </div>
  <div class="panel dTitleBox"><label for="dTitleIn">{E("Dashboard title", "看板标题")}</label><input id="dTitleIn" maxlength="80"></div>
  <p class="toolNote">{E("Works offline. Your file is read in this browser tab only and is never uploaded. Sample values are fictional. Do not use confidential company data until your company approves it.", "可离线使用。你的文件只在此浏览器标签页中读取，不会上传。示例数据为虚构。在公司批准前，请勿使用公司机密数据。")}</p>
</div>
</div></section>
</main>'''
    open(f"{ROOT}/{slug}.html", "w").write(h + body + f)
    print("wrote", slug)

page("dash-production", "production", "Production Performance Dashboard", "生产绩效看板",
     "Production <span>Performance</span> Dashboard", "生产<span>绩效</span>看板",
     "Import a daily production CSV. See output, yield, attainment and utilization by line, shift or product.",
     "导入每日生产 CSV，按产线、班次或产品查看产量、良率、达成率和利用率。",
     [("Yield % = Good ÷ Output", "良率 % = 良品 ÷ 产量"), ("Attainment % = Output ÷ Target", "达成率 % = 产量 ÷ 目标"),
      ("Utilization % = Run minutes ÷ Planned minutes", "利用率 % = 运行分钟 ÷ 计划分钟"), ("Totals are summed across all rows in the file.", "所有合计都是文件中全部行的总和。")])
page("dash-downtime", "downtime", "Downtime Analysis Dashboard", "停机分析看板",
     "Downtime <span>Analysis</span> Dashboard", "停机<span>分析</span>看板",
     "Import a downtime log CSV. See total hours, events, the top reason and the top equipment, with a Pareto chart.",
     "导入停机记录 CSV，查看总时长、次数、最大原因和最大设备，并生成柏拉图。",
     [("Downtime (h) = total minutes ÷ 60", "停机（小时）= 总分钟 ÷ 60"), ("Avg time per event = total minutes ÷ number of events", "平均每次时长 = 总分钟 ÷ 次数"),
      ("This is not a full MTTR unless every logged event is a repair.", "除非每条记录都是一次维修，否则这不是完整的 MTTR。"), ("Top reason / equipment = the one with the most minutes.", "最大原因 / 设备 = 分钟数最多的那一项。")])
page("dash-manpower", "manpower", "Manpower Planning Dashboard", "人力规划看板",
     "Manpower <span>Planning</span> Dashboard", "人力<span>规划</span>看板",
     "Import a shift manpower CSV. See required vs available headcount, the gap, overtime and output attainment by area.",
     "导入班次人力 CSV，按区域查看需求与可用人数、人数差距、加班和产出达成率。",
     [("HC gap = Available − Required (negative means short)", "人数差距 = 可用 − 需求（负数表示缺人）"), ("Output attainment % = Actual units ÷ Planned units", "产出达成率 % = 实际产量 ÷ 计划产量"),
      ("OT hours = total overtime hours in the file", "加班工时 = 文件中加班工时的总和"), ("Totals are summed across all rows in the file.", "所有合计都是文件中全部行的总和。")])
