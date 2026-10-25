/* =========================================================
   LAOYU AI ASSISTANT — rule-based chatbot (EN / 中文)
   Answers only about LAOYU content. Every question and answer
   (and any contact a visitor chooses to leave) is sent to the
   Google Sheet recorder set in LOG_URL below.

   To connect recording: paste your Apps Script web app URL
   into LOG_URL. Leave it empty and the bot still works, it
   just doesn't record anything.
   ========================================================= */

(function () {

  var LOG_URL = "https://script.google.com/macros/s/AKfycbyjk02ceJcMxwfuGGsnkwafQwP0tEkjoy7OWDhbnd3D_WUiu32qRJobGCNj2Tco__s6zg/exec";

  var PROFILE = "https://www.tiktok.com/@laoyu.talks";
  var V = PROFILE + "/video/";
  var EMAIL = "laoyutalks@gmail.com";

  /* ---------------- Videos (real posts on @laoyu.talks) ---------------- */

  var VIDEOS = {
    bestNoCare:   { id: "7681167224157179157", en: "Your best employee still works… but no longer cares?", zh: "最好的员工还在工作，却已不在乎？" },
    fewerPeople:  { id: "7693410922819325204", en: "The higher you go, the fewer people you can talk to honestly", zh: "职位越高，能坦诚交流的人越少" },
    overthinking: { id: "7683467041931562261", en: "Stop overthinking what people think of you", zh: "别再过度在意别人怎么看你" },
    control:      { id: "7686723112175553812", en: "You can't control everything, only your response", zh: "无法掌控一切，但能掌控你的反应" },
    noIdeas:      { id: "7682751500170513684", en: "Your best employee suddenly stopped giving ideas", zh: "最好的员工突然不再提想法" },
    sameMistake:  { id: "7700187298062781716", en: "Same mistake again?", zh: "又犯同样的错误？" },
    aiMore:       { id: "7699481900641029397", en: "What if AI could do more than answer questions?", zh: "如果 AI 不只是回答问题？" },
    busyDept:     { id: "7699102838835711253", en: "A department can be busy every day and still fail its business objectives", zh: "部门每天都很忙，却仍可能达不成业务目标" },
    change:       { id: "7698899592061996308", en: "Doing what you're unwilling to do is called change", zh: "去做你不愿做的事，才叫改变" },
    bestLeader:   { id: "7698852824586669333", en: "Your best employee may not be your best leader", zh: "最好的员工不一定是最好的领导" },
    success:      { id: "7698310964525026580", en: "Success isn't only how hard you work, but how deeply you think", zh: "成功不只看多努力，更看想得多深" },
    skills:       { id: "7698229823495294229", en: "If your position disappeared tomorrow, what skills would you take with you?", zh: "如果你的职位明天消失，你能带走哪些能力？" },
    goodTeam:     { id: "7697988772431957254", en: "A good team makes work easier", zh: "好团队让工作更轻松" },
    dashboards:   { id: "7697970844294991124", en: "You can have ten dashboards and still miss the real problem", zh: "十个仪表板，也可能错过真正的问题" },
    records:      { id: "7697787843640429844", en: "Three samples, three records, too many checks", zh: "三个样品、三份记录、太多检查" },
    labData:      { id: "7697773201727737108", en: "Still spending hours turning lab data into reports?", zh: "还在花几个小时把实验数据做成报告？" },
    lineRunning:  { id: "7697574703711653140", en: "Your production line is running. But is it productive?", zh: "生产线在运转，但真的有效率吗？" }
  };

  /* ---------------- Knowledge base ----------------
     kw: English keywords (whole words / phrases), zh: Chinese keywords
     a:  answer {en, zh}; v: related video keys; links: extra links
     chips: suggested follow-up topics                                */

  var KB = [
    { id: "greet", kw: ["hi", "hello", "hey", "good morning", "good evening", "yo"], zh: ["你好", "您好", "嗨", "哈喽", "早上好", "晚上好"],
      a: { en: "Hi! I'm the LAOYU AI assistant. Ask me about LAOYU's videos, AI × manufacturing, manager thinking, resources or how to get in touch.",
           zh: "你好！我是老鱼 AI 助手。可以问我老鱼的视频、AI × 制造业、管理者思维、资源，或如何联系。" },
      chips: ["who", "popular", "ai_mfg", "manager"] },

    { id: "thanks", kw: ["thanks", "thank you", "thank", "thx", "great", "awesome", "nice"], zh: ["谢谢", "感谢", "多谢", "太好了", "不错"],
      a: { en: "You're welcome! Follow @laoyu.talks on TikTok for a new practical idea most days.",
           zh: "不客气！在 TikTok 关注 @laoyu.talks，几乎每天都有新的实用想法。" },
      links: [{ en: "Follow @laoyu.talks ↗", zh: "关注 @laoyu.talks ↗", url: PROFILE }] },

    { id: "who", kw: ["who", "laoyu", "about", "background", "yourself", "founder", "creator", "experience", "operations leader"], zh: ["老鱼", "是谁", "关于", "背景", "介绍", "经验", "你是"],
      a: { en: "<b>老鱼 Laoyu</b> is an operations leader with 20 years of experience in manufacturing. He tests AI on real workplace problems and shares what works — for managers, teams and factories. Content focus: <b>AI · Managers · Manufacturing</b>.",
           zh: "<b>老鱼 Laoyu</b> 是一位拥有 20 年制造业经验的运营负责人。他把 AI 用在真实的工作问题上，分享真正有效的做法——面向管理者、团队与工厂。内容方向：<b>AI · 管理者 · 制造业</b>。" },
      chips: ["content", "popular", "contact"] },

    { id: "content", kw: ["content", "topics", "topic", "post", "posts", "videos", "video", "what do you", "talk about", "channel", "theme"], zh: ["内容", "主题", "视频", "讲什么", "频道", "发什么"],
      a: { en: "LAOYU's videos cover three themes:<br>• <b>AI × Manufacturing</b> — MES, batch records, QC, dashboards, lab data, audits<br>• <b>Manager thinking</b> — teams, decisions, leadership, restructuring<br>• <b>People & mindset</b> — motivation, career skills, handling pressure",
           zh: "老鱼的视频有三大主题：<br>• <b>AI × 制造业</b>——MES、批记录、质量、仪表板、实验数据、审核<br>• <b>管理者思维</b>——团队、决策、领导力、组织调整<br>• <b>人与心态</b>——积极性、职业能力、面对压力" },
      chips: ["ai_mfg", "manager", "mindset", "popular"] },

    { id: "popular", kw: ["popular", "most popular", "popular videos", "popular video", "most watched", "top", "best video", "best videos", "viral", "favourite", "favorite", "recommend", "start with", "most viewed"], zh: ["热门", "热门视频", "最受欢迎", "推荐", "最多人看", "最火", "看哪个"],
      a: { en: "LAOYU's most-watched videos:", zh: "老鱼最受欢迎的视频：" },
      v: ["bestNoCare", "fewerPeople", "overthinking", "control", "noIdeas"] },

    { id: "latest", kw: ["latest", "new", "newest", "recent", "recently", "new videos", "this week"], zh: ["最新", "新视频", "最近", "这周"],
      a: { en: "LAOYU's latest videos:", zh: "老鱼最新的视频：" },
      v: ["sameMistake", "aiMore", "busyDept", "change", "bestLeader"],
      links: [{ en: "See all on TikTok ↗", zh: "在 TikTok 查看全部 ↗", url: PROFILE }] },

    { id: "tiktok", kw: ["tiktok", "follow", "account", "handle", "social", "douyin", "where can i watch", "watch"], zh: ["关注", "账号", "抖音", "在哪看", "哪里看", "社交"],
      a: { en: "LAOYU posts on TikTok as <b>@laoyu.talks</b>. YouTube and LinkedIn are coming soon.",
           zh: "老鱼的 TikTok 账号是 <b>@laoyu.talks</b>。YouTube 与 LinkedIn 即将推出。" },
      links: [{ en: "Open @laoyu.talks ↗", zh: "打开 @laoyu.talks ↗", url: PROFILE }] },

    { id: "ai_mfg", kw: ["manufacturing", "factory", "factories", "production", "plant", "shop floor", "operations", "lab", "lab data", "report", "reports", "productive", "productivity", "line", "dashboard", "dashboards", "data"], zh: ["制造", "工厂", "生产", "车间", "运营", "实验", "报告", "仪表板", "数据", "生产线", "效率"],
      a: { en: "LAOYU's AI × manufacturing videos look at where time and money really go on the shop floor — and where AI actually helps:",
           zh: "老鱼的 AI × 制造业视频，关注车间里时间与成本真正流向哪里，以及 AI 真正能帮上忙的地方：" },
      v: ["lineRunning", "dashboards", "labData", "records", "aiMore"],
      chips: ["mes", "quality", "ai_tools"] },

    { id: "mes", kw: ["mes", "batch record", "batch records", "ebr", "digital", "digitise", "digitize", "digitalization", "digital transformation", "implement ai", "erp", "system"], zh: ["批记录", "数字化", "电子批记录", "系统", "导入", "转型"],
      a: { en: "LAOYU's view on MES and AI, from his videos:<br>• Fix your upstream problems <b>before</b> implementing AI or MES — don't digitise a broken process.<br>• Start with the business problem, not the technology.<br>• Even manual batch records can get help from AI before a full MES.<br>Search “MES” on his TikTok to watch these.",
           zh: "老鱼对 MES 与 AI 的观点（来自他的视频）：<br>• 在导入 AI 或 MES <b>之前</b>，先解决上游问题——不要把错误的流程数字化。<br>• 从业务问题出发，而不是从技术出发。<br>• 即使还在用纸质批记录，AI 也能先帮上忙。<br>在他的 TikTok 搜索 “MES” 即可观看。" },
      links: [{ en: "Open @laoyu.talks ↗", zh: "打开 @laoyu.talks ↗", url: PROFILE }],
      chips: ["quality", "ai_mfg"] },

    { id: "quality", kw: ["quality", "qc", "qa", "audit", "auditor", "customer audit", "ncr", "non-conformance", "nonconformance", "6s", "5s", "inspection", "deviation", "capa", "gmp", "compliance", "raw material", "raw materials", "cost", "non-bom", "waste"], zh: ["质量", "品质", "审核", "稽核", "不合格", "6s", "5s", "检验", "偏差", "原材料", "成本", "浪费"],
      a: { en: "Quality and compliance topics LAOYU has covered:<br>• Let AI watch your QC dashboard, not just display it<br>• Customer audit next week? Use AI to prepare<br>• Many raw materials under NCR — solve it with first principles<br>• Still doing 6S paperwork by hand?<br>• Production cost leaking through non-BOM material",
           zh: "老鱼讲过的质量与合规主题：<br>• 让 AI 盯住你的质量仪表板，而不只是展示数据<br>• 下周客户审核？用 AI 来准备<br>• 大量原材料被开 NCR——用第一性原理解决<br>• 6S 还在手工填表？<br>• 生产成本正从非 BOM 物料中流失" },
      v: ["records", "sameMistake"],
      links: [{ en: "More on @laoyu.talks ↗", zh: "更多请看 @laoyu.talks ↗", url: PROFILE }] },

    { id: "ai_tools", kw: ["ai", "chatgpt", "gemini", "claude", "copilot", "prompt", "prompts", "ai tool", "ai tools", "automation", "automate", "email", "emails", "verify", "schedule", "shift"], zh: ["人工智能", "提示词", "自动化", "邮件", "排班", "工具", "验证"],
      a: { en: "On using AI at work, LAOYU covers:<br>• What AI can do beyond answering questions<br>• How to write a good AI prompt<br>• Too many emails? Let AI find what needs attention<br>• How to verify an AI answer on something you don't know<br>• Can AI build a shift schedule that actually works?",
           zh: "关于在工作中用 AI，老鱼讲过：<br>• AI 不只是回答问题，还能做什么<br>• 如何写出好的 AI 提示词<br>• 邮件太多？让 AI 找出需要处理的<br>• 遇到不懂的领域，如何验证 AI 的答案<br>• AI 能排出真正可用的班表吗？" },
      v: ["aiMore"],
      chips: ["ai_mfg", "resources"] },

    { id: "manager", kw: ["manager", "managers", "management", "leader", "leadership", "lead", "boss", "team", "teams", "decision", "decisions", "restructure", "restructuring", "delegate", "supervisor", "department", "promotion", "promoted"], zh: ["管理", "管理者", "领导", "老板", "团队", "决策", "组织调整", "重组", "授权", "主管", "部门", "升职", "晋升"],
      a: { en: "Manager-thinking videos from LAOYU:", zh: "老鱼的管理者思维视频：" },
      v: ["fewerPeople", "bestLeader", "busyDept", "goodTeam", "dashboards"],
      chips: ["employee", "mindset"] },

    { id: "employee", kw: ["employee", "employees", "staff", "motivation", "motivated", "engagement", "disengaged", "ideas", "quiet quitting", "cares", "care", "retention", "people"], zh: ["员工", "下属", "积极性", "动力", "想法", "躺平", "留人", "人才"],
      a: { en: "LAOYU's videos on keeping good people engaged:", zh: "老鱼关于留住好员工、保持积极性的视频：" },
      v: ["bestNoCare", "noIdeas", "bestLeader", "sameMistake"] },

    { id: "mindset", kw: ["mindset", "overthinking", "career", "growth", "grow", "skills", "struggling", "stress", "pressure", "burnout", "change", "success", "control", "confidence", "motivation"], zh: ["心态", "焦虑", "职业", "成长", "能力", "压力", "改变", "成功", "掌控", "自信", "迷茫"],
      a: { en: "Mindset and career videos from LAOYU:", zh: "老鱼关于心态与职业成长的视频：" },
      v: ["overthinking", "control", "change", "success", "skills"] },

    { id: "resources", kw: ["resource", "resources", "template", "templates", "download", "checklist", "checklists", "planner", "prompt library", "free", "tools"], zh: ["资源", "模板", "下载", "清单", "免费", "规划表", "提示词库"],
      a: { en: "LAOYU's free resources — content planner, AI prompt library, productivity and dashboard templates, and checklists — are <b>coming soon</b>. The Resources page will list them as they're released.",
           zh: "老鱼的免费资源——内容规划表、AI 提示词库、效率与仪表板模板、检查清单——<b>即将推出</b>，上线后会在资源页面列出。" },
      links: [{ en: "Resources page →", zh: "资源页面 →", url: "resources.html" }] },


    { id: "contact", kw: ["contact", "email", "reach", "collaborate", "collaboration", "collab", "partner", "partnership", "sponsor", "hire", "consult", "consulting", "business", "speak", "speaking", "work with", "get in touch", "message"], zh: ["联系", "邮箱", "合作", "赞助", "咨询", "商务", "讲座", "找你", "私信"],
      a: { en: "You can email LAOYU at <a href=\"mailto:" + EMAIL + "\">" + EMAIL + "</a>. Or leave your name and email here and LAOYU can get back to you.",
           zh: "可以发邮件至 <a href=\"mailto:" + EMAIL + "\">" + EMAIL + "</a>。也可以在这里留下姓名和邮箱，老鱼会回复你。" },
      chips: ["leave_contact"] },

    { id: "website", kw: ["website", "site", "page", "pages", "menu", "navigate"], zh: ["网站", "页面", "网页"],
      a: { en: "This site has: <a href=\"index.html\">Home</a>, <a href=\"laoyutalks.html\">LAOYUTALKS</a>, <a href=\"resources.html\">Resources</a>, <a href=\"about.html\">About</a> and <a href=\"contact.html\">Contact</a>.",
           zh: "本网站包括：<a href=\"index.html\">首页</a>、<a href=\"laoyutalks.html\">LAOYUTALKS</a>、<a href=\"resources.html\">资源</a>、<a href=\"about.html\">关于</a>和<a href=\"contact.html\">联系</a>。" } },

    { id: "language", kw: ["chinese", "english", "language", "translate", "mandarin"], zh: ["中文", "英文", "语言", "翻译", "华语"],
      a: { en: "LAOYU's videos are mainly in English. This site and I work in both English and 中文 — use the EN / 中文 switch at the top.",
           zh: "老鱼的视频以英文为主。本网站和我都支持中英文——可用页面顶部的 EN / 中文 切换。" } }
  ];

  var CHIP_LABELS = {
    who:      { en: "Who is LAOYU?", zh: "老鱼是谁？" },
    content:  { en: "What topics?", zh: "讲哪些主题？" },
    popular:  { en: "Popular videos", zh: "热门视频" },
    latest:   { en: "Latest videos", zh: "最新视频" },
    ai_mfg:   { en: "AI × Manufacturing", zh: "AI × 制造业" },
    mes:      { en: "MES & batch records", zh: "MES 与批记录" },
    quality:  { en: "Quality & audits", zh: "质量与审核" },
    ai_tools: { en: "Using AI at work", zh: "工作中用 AI" },
    manager:  { en: "Manager thinking", zh: "管理者思维" },
    employee: { en: "Engaging employees", zh: "员工积极性" },
    mindset:  { en: "Mindset & career", zh: "心态与职业" },
    resources:{ en: "Free resources", zh: "免费资源" },
    contact:  { en: "Contact LAOYU", zh: "联系老鱼" },
    leave_contact: { en: "Leave my contact", zh: "留下联系方式" }
  };

  var UI = {
    launcher:  { en: "Ask LAOYU AI", zh: "问老鱼 AI" },
    title:     { en: "LAOYU AI Assistant", zh: "老鱼 AI 助手" },
    status:    { en: "Online · answers about LAOYU content", zh: "在线 · 只回答老鱼相关内容" },
    placeholder: { en: "Ask about LAOYU's content…", zh: "问问老鱼的内容…" },
    send:      { en: "Send", zh: "发送" },
    close:     { en: "Close chat", zh: "关闭对话" },
    notice:    { en: "Chats are recorded to improve LAOYU content.", zh: "对话会被记录，用于改进老鱼的内容。" },
    welcome:   { en: "Hi! I'm the LAOYU AI assistant. I can answer questions about LAOYU's videos, AI × manufacturing, manager thinking, resources and contact. What would you like to know?",
                 zh: "你好！我是老鱼 AI 助手，可以回答关于老鱼的视频、AI × 制造业、管理者思维、资源与联系方式的问题。想了解什么？" },
    fallback:  { en: "I can only help with LAOYU's content — videos, AI × manufacturing, manager thinking, resources and contact. Try one of these, or leave your contact and LAOYU can reply personally:",
                 zh: "我只能回答与老鱼内容相关的问题——视频、AI × 制造业、管理者思维、资源与联系方式。试试下面的问题，或留下联系方式让老鱼亲自回复：" },
    watch:     { en: "▶ Watch", zh: "▶ 观看" },
    askName:   { en: "Great! What's your name?", zh: "好的！请问怎么称呼你？" },
    askEmail:  { en: "Thanks, {name}. What email can LAOYU reply to?", zh: "谢谢，{name}。老鱼可以回复到哪个邮箱？" },
    badEmail:  { en: "That doesn't look like an email address. Could you check it? (Type “cancel” to stop.)", zh: "这个邮箱格式好像不对，可以再检查一下吗？（输入“取消”可停止）" },
    askMsg:    { en: "What would you like to talk to LAOYU about?", zh: "想和老鱼聊些什么？" },
    leadDone:  { en: "Thank you! Your details have been sent to LAOYU, who will reply to {email}.", zh: "谢谢！你的信息已发送给老鱼，他会回复到 {email}。" },
    leadOffline: { en: "Thanks! Recording isn't switched on yet, so please email LAOYU directly at " + EMAIL + ".", zh: "谢谢！记录功能尚未开启，请直接发邮件至 " + EMAIL + "。" },
    cancelled: { en: "No problem, cancelled. Anything else about LAOYU's content?", zh: "好的，已取消。还想了解老鱼的哪些内容？" }
  };

  var START_CHIPS = ["who", "popular", "ai_mfg", "manager", "contact"];
  var FALLBACK_CHIPS = ["content", "popular", "ai_mfg", "manager", "leave_contact"];

  /* ---------------- Helpers ---------------- */

  function lang() {
    return window.LAOYU_I18N ? window.LAOYU_I18N.lang() : "en";
  }

  function L(obj) {
    return obj[lang()] || obj.en;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function sessionId() {
    try {
      var id = sessionStorage.getItem("laoyuChatSession");
      if (!id) {
        id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        sessionStorage.setItem("laoyuChatSession", id);
      }
      return id;
    } catch (e) {
      return "nosession";
    }
  }

  function pageName() {
    return (location.pathname.split("/").pop() || "index.html");
  }

  function record(data) {
    data.session = sessionId();
    data.page = pageName();
    data.lang = lang();
    data.hp = "";
    if (window.LAOYU_CHAT_TEST) window.LAOYU_CHAT_TEST.push(data);
    if (!LOG_URL) return false;
    try {
      fetch(LOG_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data)
      }).catch(function () {});
    } catch (e) {}
    return true;
  }

  /* ---------------- Matching ---------------- */

  function score(entry, text, words) {
    var s = 0;
    entry.kw.forEach(function (k) {
      if (k.indexOf(" ") > -1) {
        if (text.indexOf(k) > -1) s += 3;
      } else if (words.indexOf(k) > -1) {
        s += k.length > 3 ? 2 : 1.5;
      }
    });
    entry.zh.forEach(function (k) {
      if (text.indexOf(k) > -1) s += 2 + k.length * 0.2;
    });
    return s;
  }

  function match(input) {
    var text = " " + input.toLowerCase().replace(/[?!.,;:()"'“”‘’？！。，；：（）]/g, " ").replace(/\s+/g, " ") + " ";
    var words = text.trim().split(" ");
    var best = null, bestScore = 0;
    KB.forEach(function (entry) {
      var s = score(entry, text, words);
      if (s > bestScore) { best = entry; bestScore = s; }
    });
    return bestScore >= 1.5 ? best : null;
  }

  function byId(id) {
    for (var i = 0; i < KB.length; i++) if (KB[i].id === id) return KB[i];
    return null;
  }

  /* ---------------- Rendering ---------------- */

  var root, log, chipsBox, input, form, opened = false, greeted = false;
  var lead = null; // contact capture state

  function answerHTML(entry) {
    var html = L(entry.a);
    if (entry.v && entry.v.length) {
      html += '<ul class="lyVids">';
      entry.v.forEach(function (key) {
        var v = VIDEOS[key];
        html += '<li><a href="' + V + v.id + '" target="_blank" rel="noopener noreferrer">' +
          '<span>' + esc(L(v)) + '</span><em>' + L(UI.watch) + '</em></a></li>';
      });
      html += "</ul>";
    }
    if (entry.links) {
      html += '<div class="lyLinks">';
      entry.links.forEach(function (l) {
        var ext = /^https?:/.test(l.url);
        html += '<a href="' + l.url + '"' + (ext ? ' target="_blank" rel="noopener noreferrer"' : "") + ">" + esc(L(l)) + "</a>";
      });
      html += "</div>";
    }
    return html;
  }

  function addMsg(who, html) {
    var row = document.createElement("div");
    row.className = "lyMsg " + (who === "me" ? "lyMe" : "lyBot");
    row.innerHTML = '<div class="lyBubble">' + html + "</div>";
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
    return row;
  }

  function setChips(ids) {
    chipsBox.innerHTML = "";
    (ids || []).forEach(function (id) {
      if (!CHIP_LABELS[id]) return;
      var b = document.createElement("button");
      b.type = "button";
      b.className = "lyChip";
      b.textContent = L(CHIP_LABELS[id]);
      b.setAttribute("data-topic", id);
      chipsBox.appendChild(b);
    });
  }

  /* render: a function returning the reply HTML in the current language,
     kept on the message so it can be redrawn when the language changes */
  function botSay(render, chips, delay) {
    var typing = addMsg("bot", '<span class="lyDots"><i></i><i></i><i></i></span>');
    setChips([]);
    setTimeout(function () {
      typing.__render = render;
      typing.querySelector(".lyBubble").innerHTML = render();
      log.scrollTop = Math.max(0, typing.offsetTop - log.offsetTop - 60);
      setChips(chips);
    }, delay === undefined ? 450 + Math.random() * 300 : delay);
  }

  /* ---------------- Conversation ---------------- */

  function startLead() {
    lead = { step: "name" };
    botSay(function () { return esc(L(UI.askName)); }, []);
  }

  function continueLead(text) {
    if (/^(cancel|stop|quit|取消|算了|不用了)$/i.test(text.trim())) {
      lead = null;
      botSay(function () { return esc(L(UI.cancelled)); }, START_CHIPS);
      return;
    }
    if (lead.step === "name") {
      lead.name = text.trim().slice(0, 80);
      lead.step = "email";
      var name = lead.name;
      botSay(function () { return esc(L(UI.askEmail).replace("{name}", name)); }, []);
    } else if (lead.step === "email") {
      var email = text.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        botSay(function () { return esc(L(UI.badEmail)); }, []);
        return;
      }
      lead.email = email.slice(0, 120);
      lead.step = "message";
      botSay(function () { return esc(L(UI.askMsg)); }, []);
    } else if (lead.step === "message") {
      var sent = record({ type: "lead", name: lead.name, email: lead.email, message: text.trim().slice(0, 1000) });
      var email = lead.email;
      lead = null;
      botSay(function () {
        return esc(sent ? L(UI.leadDone).replace("{email}", email) : L(UI.leadOffline));
      }, START_CHIPS);
    }
  }

  function handle(text, topicId) {
    text = text.trim();
    if (!text) return;
    addMsg("me", esc(text));

    if (lead) { continueLead(text); return; }

    if (topicId === "leave_contact") { startLead(); return; }

    var entry = topicId ? byId(topicId) : match(text);
    if (entry) {
      record({ type: "chat", question: text.slice(0, 500), topic: entry.id, answered: true });
      botSay(function () { return answerHTML(entry); }, entry.chips || START_CHIPS.filter(function (c) { return c !== entry.id; }).slice(0, 4));
    } else {
      record({ type: "chat", question: text.slice(0, 500), topic: "unanswered", answered: false });
      botSay(function () { return esc(L(UI.fallback)); }, FALLBACK_CHIPS);
    }
  }

  /* ---------------- Widget ---------------- */

  function relabel() {
    if (!root) return;
    root.querySelector(".lyLaunchText").textContent = L(UI.launcher);
    root.querySelector(".lyTitle").textContent = L(UI.title);
    root.querySelector(".lyStatus").textContent = L(UI.status);
    root.querySelector(".lyNotice").textContent = L(UI.notice);
    input.placeholder = L(UI.placeholder);
    root.querySelector(".lySend").setAttribute("aria-label", L(UI.send));
    root.querySelector(".lyClose").setAttribute("aria-label", L(UI.close));
    chipsBox.querySelectorAll(".lyChip").forEach(function (b) {
      b.textContent = L(CHIP_LABELS[b.getAttribute("data-topic")]);
    });
    log.querySelectorAll(".lyBot").forEach(function (m) {
      if (m.__render) m.querySelector(".lyBubble").innerHTML = m.__render();
    });
  }

  function open() {
    opened = true;
    root.classList.add("open");
    root.querySelector(".lyLaunch").setAttribute("aria-expanded", "true");
    if (!greeted) {
      greeted = true;
      botSay(function () { return esc(L(UI.welcome)); }, START_CHIPS, 250);
    }
    setTimeout(function () { input.focus(); }, 200);
  }

  function close() {
    opened = false;
    root.classList.remove("open");
    root.querySelector(".lyLaunch").setAttribute("aria-expanded", "false");
  }

  function build() {
    root = document.createElement("div");
    root.className = "lyChat";
    root.innerHTML =
      '<button type="button" class="lyLaunch" aria-expanded="false" aria-controls="lyPanel">' +
        '<span class="lyCore"><i></i></span><span class="lyLaunchText"></span>' +
      '</button>' +
      '<section class="lyPanel" id="lyPanel" role="dialog" aria-label="LAOYU AI">' +
        '<header class="lyHead">' +
          '<span class="lyAvatar"><img src="assets/laoyu-logo-hud.png" alt=""></span>' +
          '<div><div class="lyTitle"></div><div class="lyStatus"></div></div>' +
          '<button type="button" class="lyClose">✕</button>' +
        '</header>' +
        '<div class="lyLog" aria-live="polite"></div>' +
        '<div class="lyChips"></div>' +
        '<form class="lyForm" autocomplete="off">' +
          '<input class="lyInput" type="text" maxlength="500">' +
          '<input class="lyHp" type="text" tabindex="-1" aria-hidden="true">' +
          '<button type="submit" class="lySend">➤</button>' +
        '</form>' +
        '<div class="lyNotice"></div>' +
      '</section>';
    document.body.appendChild(root);

    log = root.querySelector(".lyLog");
    chipsBox = root.querySelector(".lyChips");
    input = root.querySelector(".lyInput");
    form = root.querySelector(".lyForm");

    root.querySelector(".lyLaunch").addEventListener("click", function () { opened ? close() : open(); });
    root.querySelector(".lyClose").addEventListener("click", close);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && opened) close(); });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (root.querySelector(".lyHp").value) return;
      var text = input.value;
      input.value = "";
      handle(text);
    });

    chipsBox.addEventListener("click", function (e) {
      var b = e.target.closest(".lyChip");
      if (b) handle(b.textContent, b.getAttribute("data-topic"));
    });

    relabel();
  }

  document.addEventListener("DOMContentLoaded", build);
  document.addEventListener("laoyu:lang", relabel);

  window.LAOYU_CHAT = { match: match, handle: handle, open: open, KB: KB };

})();
