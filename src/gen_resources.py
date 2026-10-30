"""Build the Phase-1 Tool Crib <main> for resources.html."""
import re, html

V = "https://www.tiktok.com/@laoyu.talks/video/"
TOOLS = [
  dict(slug="downtime-troubleshooter", title="Downtime Troubleshooter", type="solver",
       out="Machine stopped? Safe checks in the right order, likely causes and when to escalate.",
       badges=["8 common problems", "Downtime clock"], roles="supervisor engineer",
       probs="downtime output", video=None),
  dict(slug="oee-loss-calculator", title="OEE Loss Calculator", type="calculator",
       out="See where your shift's minutes went, what it cost, and fix the biggest loss first.",
       badges=["2 min", "Instant result"], roles="supervisor engineer manager",
       probs="output kpi downtime", video=None),
  dict(slug="fishbone-5why", title="Fishbone + 5-Why Builder", type="solver",
       out="List causes under the 6Ms, drill the suspects with 5 Whys, leave with a real fix.",
       badges=["30 min", "Print as A3"], roles="supervisor engineer",
       probs="quality mistake complaint", video=None),
  dict(slug="8d-report", title="8D Report Builder", type="solver",
       out="Customer complaint? Work through all 8 steps with a progress bar, then print and send.",
       badges=["8 steps", "Print or save as PDF"], roles="engineer supervisor manager",
       probs="complaint quality", video=None),
  dict(slug="skills-matrix", title="Team Skills Matrix", type="tracker",
       out="See who can run what, spot single points of failure and get a training plan.",
       badges=["Risk alerts", "Export to Excel"], roles="supervisor manager",
       probs="skills manpower", video=None),
  dict(slug="difficult-conversation", title="Difficult Conversation Planner", type="solver",
       out="Plan a performance or behaviour talk in 10 minutes and walk in with a script.",
       badges=["10 min", "Ready-made script"], roles="supervisor manager",
       probs="talk team", video=None),
  dict(slug="escalation-report", title="Escalation Report Builder", type="solver",
       out="Turn a floor problem into a report management can act on: cost, risk and your ask.",
       badges=["Cost impact calculator", "Copy as email"], roles="supervisor manager",
       probs="escalate downtime", video=None),
  dict(slug="decision-matrix", title="Decision Matrix", type="solver",
       out="Weight what matters, score the options and get a clear, defensible choice.",
       badges=["Ready templates", "Robustness check"], roles="manager engineer",
       probs="decide", video=None),
  dict(slug="repeated-mistake-worksheet", title="Repeated Mistake Worksheet", type="template",
       out="Find the real cause so the same mistake stops coming back.",
       badges=["20 min", "Fill on screen or print"], roles="supervisor engineer",
       probs="mistake quality", video="7700187298062781716"),
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
       probs="kpi output", video="7697970844294991124"),
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
       probs="team talk", video="7681167224157179157"),
  dict(slug="ai-prompt-pack", title="AI Prompt Pack for Operations Managers", type="prompts",
       out="10 ready prompts to write reports, analyse problems and plan faster.",
       badges=["10 prompts", "One-tap copy"], roles="manager supervisor engineer",
       probs="ai mistake", video="7700187298062781716"),
]
TYPE_LABEL = {"solver": "PROBLEM SOLVER", "template": "TEMPLATE", "calculator": "CALCULATOR", "tracker": "TRACKER", "checklist": "CHECKLIST", "prompts": "AI PROMPTS"}
PROD = [
  ("downtime", "🛠", "Machine keeps breaking down"),
  ("output", "📉", "Output or OEE too low"),
  ("quality", "🎯", "Quality problem or defects"),
  ("mistake", "🔁", "Same mistake keeps happening"),
  ("complaint", "📨", "Customer complaint"),
  ("handover", "📋", "Shift handover is messy"),
  ("manpower", "👥", "Short of manpower"),
  ("kpi", "📊", "No clear KPI view"),
]
MGMT = [
  ("team", "😐", "Team stopped caring"),
  ("talk", "💬", "Need a tough conversation"),
  ("skills", "🧩", "Too few people can run key jobs"),
  ("decide", "⚖", "Hard decision to make"),
  ("escalate", "📣", "Need support from management"),
  ("chaos", "🗓", "My day is chaos"),
  ("actions", "✅", "Actions never get closed"),
  ("ai", "🤖", "Want AI to save me time"),
]
ROLES = [("all", "All"), ("supervisor", "Supervisor"), ("engineer", "Engineer"), ("manager", "Manager")]
TYPES = [("all", "All"), ("solver", "Problem solvers"), ("template", "Templates"), ("tracker", "Trackers"), ("calculator", "Calculators"), ("checklist", "Checklists"), ("prompts", "AI Prompts")]

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

chip = lambda lst: "".join(f'<button type="button" class="chip" data-prob="{k}" aria-pressed="false"><i aria-hidden="true">{ic}</i><span>{e(lbl)}</span></button>' for k, ic, lbl in lst)
chips = ('<div class="chipGroup"><h3 class="chipH">PRODUCTION PROBLEMS</h3><div class="chips" role="group" aria-label="Production problems">' + chip(PROD) + '</div></div>'
         '<div class="chipGroup"><h3 class="chipH">PEOPLE &amp; MANAGEMENT</h3><div class="chips" role="group" aria-label="Management problems">' + chip(MGMT) + '</div></div>')
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
          <b>One sign-up unlocks all 16 tools.</b>
          <span data-pass-msg>Leave your name and email once and every tool opens instantly on this browser. Free, no payment.</span>
        </div>
        <div class="passStat"><span data-pass-state>16 FREE TOOLS</span></div>
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

      {chips}

      <div class="filters">
        <div class="seg" role="group" aria-label="Role"><span class="segLbl">ROLE</span>{seg("role", ROLES)}</div>
        <div class="seg" role="group" aria-label="Type"><span class="segLbl">TYPE</span>{seg("type", TYPES)}</div>
      </div>

      <div class="finderBar">
        <span class="fCount" aria-live="polite"><b data-count-shown>16</b> <span data-count-label>tools ready</span></span>
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
s = re.sub(r"<main[^>]*>.*?</main>", lambda m: main, s, flags=re.S)

open(p, "w").write(s)
print("ok", len(s))
