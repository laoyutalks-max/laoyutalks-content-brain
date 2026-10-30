"""Build the Phase-1 Tool Crib <main> for resources.html."""
import re, html

V = "https://www.tiktok.com/@laoyu.talks/video/"
TOOLS = [
  dict(slug="repeated-mistake-worksheet", title="Repeated Mistake Worksheet", type="template",
       out="Find the real cause so the same mistake stops coming back.",
       badges=["20 min", "Fill on screen or print"], roles="supervisor engineer",
       probs="mistake", video="7700187298062781716"),
  dict(slug="shift-handover", title="Shift Handover Template", type="template",
       out="Hand over the shift without losing a single open issue.",
       badges=["10 min", "Fill on screen or print"], roles="supervisor",
       probs="handover", video="7700187298062781716"),
  dict(slug="manpower-gap-calculator", title="Manpower Gap Calculator", type="calculator",
       out="Know how many people you're short before the shift starts.",
       badges=["Instant result", "Works on your phone"], roles="supervisor manager",
       probs="manpower", video="7697970844294991124"),
  dict(slug="production-kpi-dashboard", title="Production KPI Dashboard", type="tracker",
       out="Output, yield and downtime on one page in 2 minutes a day.",
       badges=["2 min a day", "Excel · Google Sheets · WPS"], roles="manager supervisor",
       probs="kpi", video="7697970844294991124"),
  dict(slug="supervisor-daily-planner", title="Supervisor Daily Planner", type="template",
       out="Start every shift knowing your top 3 priorities.",
       badges=["5 min a day", "Fill on screen or print"], roles="supervisor",
       probs="chaos", video="7697970844294991124"),
  dict(slug="weekly-action-tracker", title="Weekly Action Tracker", type="tracker",
       out="Every open action, owner and due date. Overdue ones flag themselves.",
       badges=["Overdue alerts", "Export to Excel"], roles="manager supervisor",
       probs="actions chaos kpi", video=None),
  dict(slug="checklist-quiet-quitting", title="Quiet Quitting Early-Warning Checklist", type="checklist",
       out="Spot the early signs that a good employee is checking out.",
       badges=["15 min", "Print or save as PDF"], roles="supervisor manager",
       probs="team", video="7681167224157179157"),
  dict(slug="ai-prompt-pack", title="AI Prompt Pack for Operations Managers", type="prompts",
       out="10 ready prompts to write reports, analyse problems and plan faster.",
       badges=["10 prompts", "One-tap copy"], roles="manager supervisor engineer",
       probs="ai mistake", video="7700187298062781716"),
]
TYPE_LABEL = {"template": "TEMPLATE", "calculator": "CALCULATOR", "tracker": "TRACKER", "checklist": "CHECKLIST", "prompts": "AI PROMPTS"}
PROBLEMS = [
  ("mistake", "🔁", "Same mistake keeps happening"),
  ("handover", "📋", "Shift handover is messy"),
  ("manpower", "👥", "Short of manpower"),
  ("kpi", "📊", "No clear KPI view"),
  ("chaos", "🗓", "My day is chaos"),
  ("actions", "✅", "Actions never get closed"),
  ("team", "😐", "Team stopped caring"),
  ("ai", "🤖", "Want AI to save me time"),
]
ROLES = [("all", "All"), ("supervisor", "Supervisor"), ("engineer", "Engineer"), ("manager", "Manager")]
TYPES = [("all", "All"), ("template", "Templates"), ("tracker", "Trackers"), ("calculator", "Calculators"), ("checklist", "Checklists"), ("prompts", "AI Prompts")]

e = html.escape
cards = []
for i, t in enumerate(TOOLS, 1):
    badges = "".join(f'<li>{e(b)}</li>' for b in t["badges"]) + "<li>EN / 中文</li>"
    vid = (f'<a class="tcVid" href="{V}{t["video"]}" target="_blank" rel="noopener noreferrer">▶ Watch the video</a>'
           if t["video"] else '<span class="tcVid off">NEW</span>')
    cards.append(f'''
        <article class="toolCard" data-type="{t["type"]}" data-roles="{t["roles"]}" data-probs="{t["probs"]}">
          <a class="tcShot" href="{t["slug"]}.html" tabindex="-1" aria-hidden="true">
            <img class="en" src="assets/previews/{t["slug"]}-en.jpg" alt="" loading="lazy" width="680" height="427">
            <img class="zh" src="assets/previews/{t["slug"]}-zh.jpg" alt="" loading="lazy" width="680" height="427">
            <span class="tcType">{TYPE_LABEL[t["type"]]}</span>
            <span class="tcNo">T-{i:02d}</span>
            <span class="tcMatch">MATCH</span>
          </a>
          <div class="tcBody">
            <h3><a href="{t["slug"]}.html">{e(t["title"])}</a></h3>
            <p>{e(t["out"])}</p>
            <ul class="tcBadges">{badges}</ul>
            <div class="tcActions">
              <a class="btn orange" href="{t["slug"]}.html">OPEN TOOL →</a>
              {vid}
            </div>
          </div>
        </article>''')

chips = "".join(f'<button type="button" class="chip" data-prob="{k}" aria-pressed="false"><i aria-hidden="true">{ic}</i><span>{e(lbl)}</span></button>' for k, ic, lbl in PROBLEMS)
seg = lambda name, opts: "".join(f'<button type="button" data-{name}="{k}" aria-pressed="{"true" if k == "all" else "false"}">{e(l)}</button>' for k, l in opts)

main = f'''<main class="resLib">

  <!-- HERO -->
  <section class="hero">
    <div class="wrap">
      <div class="eyebrow">LAOYU RESOURCES</div>
      <h1>Practical Tools to <span>Work Smarter.</span></h1>
      <p>Simple templates, AI prompts and productivity tools designed to help you create, organize and improve your work.</p>
    </div>
  </section>

  <!-- PASS BANNER -->
  <section class="passWrap">
    <div class="wrap">
      <div class="pass" data-pass>
        <div class="passIco" aria-hidden="true">
          <svg viewBox="0 0 64 64" class="mIco"><rect class="s f" x="8" y="16" width="48" height="32" rx="4"/><path class="o" d="M20 32l6 6 12-12"/><path class="s" d="M44 26h6M44 32h6M44 38h6"/></svg>
        </div>
        <div class="passTxt">
          <b>One sign-up unlocks all 8 tools.</b>
          <span data-pass-msg>Leave your name and email once and every tool opens instantly on this browser. Free, no payment.</span>
        </div>
        <div class="passStat"><span data-pass-state>8 FREE TOOLS</span></div>
      </div>
    </div>
  </section>

  <!-- TOOL FINDER -->
  <section class="section finder" id="finder">
    <div class="wrap">
      <div class="stHead">
        <div>
          <div class="stTag"><span>TOOL FINDER</span><i></i><b>STEP 1</b></div>
          <h2>What's your problem today?</h2>
          <p>Pick a problem and the right tool lights up.</p>
        </div>
      </div>

      <div class="chips" role="group" aria-label="Problems">{chips}</div>

      <div class="filters">
        <div class="seg" role="group" aria-label="Role"><span class="segLbl">ROLE</span>{seg("role", ROLES)}</div>
        <div class="seg" role="group" aria-label="Type"><span class="segLbl">TYPE</span>{seg("type", TYPES)}</div>
      </div>

      <div class="finderBar">
        <span class="fCount" aria-live="polite"><b data-count-shown>8</b> <span data-count-label>tools ready</span></span>
        <button type="button" class="fClear" data-clear hidden>✕ Clear filters</button>
      </div>

      <div class="toolGrid">{"".join(cards)}
      </div>

      <div class="fEmpty" hidden>
        <p>No tool matches that yet.</p>
        <a class="btn outline" href="mailto:laoyutalks@gmail.com?subject=Tool%20request">REQUEST THIS TOOL →</a>
      </div>
    </div>
  </section>

  <!-- TIKTOK -->
  <section class="section">
    <div class="wrap">
      <div class="cta">
        <div class="eyebrow">FOLLOW LAOYU</div>
        <h2>Follow LAOYUTALKS</h2>
        <p>Follow LAOYUTALKS for practical ideas about AI, productivity, manufacturing excellence and management.</p>
        <a class="btn orange" href="https://www.tiktok.com/@laoyu.talks" target="_blank" rel="noopener noreferrer">FOLLOW @laoyu.talks ↗</a>
      </div>
    </div>
  </section>
</main>'''

p = "/home/claude/src/site/resources.html"
s = open(p).read()
s = re.sub(r"<main>.*?</main>", lambda m: main, s, flags=re.S)
s = s.replace('<script src="twin.js?v=20261030"></script>', '<script src="twin.js?v=20261030b"></script><script src="finder.js?v=20261030"></script>')
s = s.replace('twin.css?v=20261030"', 'twin.css?v=20261030c"')
open(p, "w").write(s)
print("ok", len(s))
