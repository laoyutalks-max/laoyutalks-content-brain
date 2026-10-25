/* =========================================================
   LAOYU — BILINGUAL (English / 简体中文)
   Loaded before script.js. Swaps page text in place; English
   in the HTML stays the source of truth. To translate new
   text, add "English text": "中文" to TEXT below.
   ========================================================= */

(function () {

  /* Single text pieces (matched exactly, spaces ignored) */
  var TEXT = {
    /* Navigation */
    "HOME": "首页",
    "RESOURCES": "资源",
    "AI CONTENT BRAIN": "AI 内容大脑",
    "ABOUT": "关于",
    "CONTACT": "联系",
    "GET TEMPLATES": "获取模板",

    /* HUD status + boot */
    "SYSTEM": "系统",
    "ONLINE": "在线",
    "MODULE": "模块",
    "LOCAL": "本地时间",
    "INITIALIZING": "正在启动",
    "INITIALIZING LAOYU AI CORE": "正在启动 LAOYU AI 核心",
    "LOADING KNOWLEDGE MODULES": "正在加载知识模块",
    "CALIBRATING CONTENT BRAIN": "正在校准内容大脑",
    "SYSTEMS ONLINE": "系统已就绪",

    /* Home — hero */
    "AI × PRODUCTIVITY × BETTER WORK": "AI × 效率 × 更好地工作",
    "Practical ideas, tools and systems that help you work smarter with AI.": "实用的思路、工具与系统，助你借助 AI 更聪明地工作。",
    "EXPLORE LAOYU →": "探索 LAOYU →",
    "WATCH ON TIKTOK ↗": "在 TIKTOK 观看 ↗",

    /* Home — pillars */
    "AI Solutions": "AI 解决方案",
    "Smart tools and AI-powered systems to help you work intelligently.": "智能工具与 AI 驱动的系统，让工作更智能。",
    "Manufacturing Excellence": "卓越制造",
    "Process improvement, automation and data-driven systems.": "流程改善、自动化与数据驱动的系统。",
    "Manager Thinking": "管理者思维",
    "Leadership, planning and decision-making frameworks.": "领导力、计划与决策框架。",
    "Continuous Improvement": "持续改善",
    "Small changes, big impact. Build better systems every day.": "小改变，大影响。每天打造更好的系统。",

    /* Home — TikTok */
    "Most Watched on TikTok": "TikTok 热门视频",
    "Short, practical ideas that help you work smarter.": "简短实用的想法，助你更聪明地工作。",
    "VIEW ALL ON TIKTOK ↗": "在 TIKTOK 查看全部 ↗",

    /* Home — TikTok video cards (most watched) */
    "still works…": "还在工作…",
    "But no longer cares?": "却已经不在乎了？",
    "Your Best Employee Still Works — But No Longer Cares": "最好的员工还在工作，却已不在乎",
    "The higher you go,": "职位越高，",
    "the fewer people": "能说真话的人",
    "you can talk to honestly": "就越少",
    "The Higher You Go, the Fewer People You Can Talk To": "职位越高，能坦诚交流的人越少",
    "Stop overthinking": "别再过度在意",
    "what people think": "别人",
    "of you": "怎么看你",
    "Stop Overthinking What People Think of You": "别再过度在意别人怎么看你",
    "You can't control": "人生无法",
    "everything in life": "掌控一切",
    "But you can control your response": "但你能掌控自己的反应",
    "You Can't Control Everything — Only Your Response": "无法掌控一切，但能掌控你的反应",
    "Your best employee": "你最好的员工",
    "stopped giving ideas": "不再提想法了",
    "Should you be worried?": "你该担心吗？",
    "Your Best Employee Suddenly Stopped Giving Ideas": "最好的员工突然不再提想法",
    "▶ Watch on TikTok": "▶ 在 TikTok 观看",

    /* Home — resources */
    "Free Resources": "免费资源",
    "Templates, prompts and practical tools.": "模板、提示词与实用工具。",
    "BROWSE RESOURCES →": "浏览资源 →",
    "Start building better systems.": "开始打造更好的系统。",
    "Useful resources for content planning, AI workflows, productivity and continuous improvement.": "涵盖内容规划、AI 工作流、效率提升与持续改善的实用资源。",
    "Content Planner": "内容规划表",
    "Plan TikTok content with ease.": "轻松规划 TikTok 内容。",
    "AI Prompt Library": "AI 提示词库",
    "Reusable prompts for creation.": "可重复使用的创作提示词。",
    "Productivity Templates": "效率模板",
    "Planning and tracking templates.": "计划与追踪模板。",
    "Checklists": "检查清单",
    "Practical checklists for work.": "实用的工作检查清单。",

    /* Home — content brain */
    "LAOYUTALKS CONTENT BRAIN": "LAOYUTALKS 内容大脑",
    "Generate. Analyze. Improve. Repeat.": "生成。分析。改善。循环。",
    "Your AI-powered content management workflow for ideas, scripts, captions, performance insights and the next content idea.": "AI 驱动的内容管理工作流：从选题、脚本、文案，到数据洞察，再到下一个内容创意。",
    "EXPLORE CONTENT BRAIN →": "探索内容大脑 →",
    "AI-powered content workflow": "AI 驱动的内容工作流",

    /* Home — about / contact */
    "About LAOYU": "关于 LAOYU",
    "LAOYU is a practical platform focused on productivity, AI and smarter ways of working.": "LAOYU 是一个专注于效率、AI 与更聪明工作方式的实用平台。",
    "We turn real-world problems into simple systems, useful tools and actionable content.": "我们把真实问题转化为简单的系统、实用的工具和可落地的内容。",
    "LEARN MORE →": "了解更多 →",
    "Have a question?": "有问题吗？",
    "Let's connect and create better solutions together.": "让我们联系，一起打造更好的解决方案。",
    "CONTACT LAOYU →": "联系 LAOYU →",

    /* Footer */
    "NAVIGATION": "导航",
    "Home": "首页",
    "Resources": "资源",
    "AI Content Brain": "AI 内容大脑",
    "Templates": "模板",
    "AI Prompts": "AI 提示词",
    "Guides": "指南",
    "CONNECT": "关注",
    "Email": "电子邮件",
    "LAOYU. All rights reserved.": "LAOYU 版权所有。",
    "Built with ♥ by LAOYU": "由 LAOYU 用 ♥ 打造",

    /* LAOYUTALKS page */
    "Practical ideas. Better thinking.": "实用想法，更好思维。",
    "AI, manufacturing excellence, manager thinking and continuous improvement — explained simply.": "AI、卓越制造、管理者思维与持续改善——简单讲清楚。",
    "AI × WORK": "AI × 工作",
    "How AI can improve daily work": "AI 如何改善日常工作",
    "AI · Productivity": "AI · 效率",
    "MANAGER": "管理者",
    "THINKING": "思维",
    "From execution to improvement": "从执行到改善",
    "Management · Leadership": "管理 · 领导力",
    "BETTER": "更好",
    "The power of continuous improvement": "持续改善的力量",
    "Kaizen · Growth": "改善 · 成长",
    "DATA": "数据",
    "DECISIONS": "决策",
    "Let data speak": "让数据说话",
    "Data · Decisions": "数据 · 决策",

    /* Resources page */
    "LAOYU RESOURCES": "LAOYU 资源",
    "Simple templates, AI prompts and productivity tools designed to help you create, organize and improve your work.": "简单的模板、AI 提示词与效率工具，帮助你创作、整理并改善工作。",
    "RESOURCE LIBRARY": "资源库",
    "Tools for Better Work": "让工作更好的工具",
    "More resources will be added as the LAOYU platform grows.": "随着 LAOYU 平台成长，将陆续加入更多资源。",
    "Plan TikTok and social media content, organize ideas and track publishing progress.": "规划 TikTok 与社交媒体内容，整理创意并追踪发布进度。",
    "COMING SOON": "即将推出",
    "Practical AI prompts for productivity, management, problem solving and content creation.": "用于效率、管理、解决问题与内容创作的实用 AI 提示词。",
    "Templates designed to simplify daily planning, prioritization and execution.": "简化日常计划、优先级排序与执行的模板。",
    "Dashboard Templates": "仪表板模板",
    "Simple dashboards for tracking actions, projects, workload and performance.": "追踪行动、项目、工作量与绩效的简易仪表板。",
    "Ready-to-use checklists for continuous improvement, operations and everyday work.": "适用于持续改善、运营与日常工作的现成检查清单。",
    "More Resources": "更多资源",
    "New tools, templates and practical resources will be added here over time.": "新的工具、模板与实用资源将陆续加入。",
    "LAOYU AI": "LAOYU AI",
    "LAOYU AI Content Brain helps transform ideas, problems and experiences into structured content that can be reused across your workflow.": "LAOYU AI 内容大脑帮助你把想法、问题与经验转化为结构化内容，并在整个工作流中重复使用。",
    "EXPLORE AI CONTENT BRAIN →": "探索 AI 内容大脑 →",
    "FOLLOW LAOYU": "关注 LAOYU",
    "Follow LAOYUTALKS": "关注 LAOYUTALKS",
    "Follow LAOYUTALKS for practical ideas about AI, productivity, manufacturing excellence and management.": "关注 LAOYUTALKS，获取关于 AI、效率、卓越制造与管理的实用想法。",
    "FOLLOW @laoyu.talks ↗": "关注 @laoyu.talks ↗",
    "About": "关于",
    "Contact": "联系",
    "YouTube — Coming Soon": "YouTube — 即将推出",
    "LinkedIn — Coming Soon": "LinkedIn — 即将推出",

    /* AI Content Brain page */
    "An AI-powered content management workflow designed around your real content process.": "围绕你真实创作流程设计的 AI 内容管理工作流。",
    "One system for your content.": "一个系统，管理你的所有内容。",
    "Google Sheets as the control center, Gemini as the content engine, and performance data to continuously improve your next post.": "以 Google Sheets 为控制中心，Gemini 为内容引擎，用数据表现持续改善下一条内容。",
    "✓ Generate ideas, hooks and scripts": "✓ 生成选题、开头钩子与脚本",
    "✓ Track publishing and performance": "✓ 追踪发布与数据表现",
    "✓ Analyze views, saves, shares and comments": "✓ 分析播放、收藏、分享与评论",
    "✓ Generate the next content idea": "✓ 生成下一个内容创意",

    /* About page */
    "ABOUT LAOYU": "关于 LAOYU",
    "Stay curious. Keep improving.": "保持好奇，持续改善。",
    "Lead with thinking. Improve with AI.": "以思维引领，用 AI 提升。",
    "What LAOYU stands for": "LAOYU 的理念",
    "LAOYU turns real-world problems into practical solutions using AI, productivity, manufacturing excellence, manager thinking and continuous improvement.": "LAOYU 运用 AI、效率方法、卓越制造、管理者思维与持续改善，把真实问题变成实用的解决方案。",
    "Our principles": "我们的原则",
    "🎯 Practical — useful over complicated.": "🎯 实用 —— 有用胜过复杂。",
    "🧠 Thinking — understand the problem first.": "🧠 思考 —— 先理解问题。",
    "🤖 AI-powered — automate where it creates value.": "🤖 AI 驱动 —— 在能创造价值的地方实现自动化。",
    "📈 Continuous improvement — make the next version better.": "📈 持续改善 —— 让下一版更好。",

    /* Contact page */
    "Let's connect.": "保持联系。",
    "Have a question, collaboration idea or feedback for LAOYU?": "对 LAOYU 有疑问、合作想法或反馈？",
    "Send a message": "发送消息",
    "Email:": "电子邮件：",
    "Questions, collaborations or feedback are all welcome. Drop an email anytime.": "欢迎提问、合作或反馈，随时发邮件联系。",
    "Find LAOYU online": "在网上找到 LAOYU",

    /* Page titles */
    "LAOYU | Work Smarter. Create Better.": "LAOYU 老鱼 | 工作更聪明，创造更出色",
    "LAOYUTALKS | LAOYU": "LAOYUTALKS | LAOYU 老鱼",
    "Resources | LAOYU": "资源 | LAOYU 老鱼",
    "AI Content Brain | LAOYU": "AI 内容大脑 | LAOYU 老鱼",
    "About | LAOYU": "关于 | LAOYU 老鱼",
    "Contact | LAOYU": "联系 | LAOYU 老鱼"
  };

  /* Headings/lines built from several pieces: matched on the whole
     element's text, replaced as a block so word order reads naturally */
  var BLOCKS = {
    "Work Smarter. Create Better.":
      '工作更<span>聪明</span>，<br>创造更<span>出色</span>。',
    "Practical Tools to Work Smarter.":
      '实用工具，助你<span>更聪明地工作。</span>',
    "Turn Ideas Into Action.":
      '把想法变成<span>行动。</span>',
    "Stay curious. Keep improving. Lead with thinking. Improve with AI.":
      '保持好奇，持续改善。<br>以<b style="color:#ff6a00">思维</b>引领，用 <b style="color:#ff6a00">AI</b> 提升。'
  };

  var KEY = "laoyuLang";

  function squash(s) {
    return String(s).replace(/\s+/g, "");
  }

  var BLOCK_INDEX = {};
  Object.keys(BLOCKS).forEach(function (k) { BLOCK_INDEX[squash(k)] = k; });

  function norm(s) {
    return String(s).replace(/\s+/g, " ").trim();
  }

  var REVERSE = {};
  Object.keys(TEXT).forEach(function (en) { REVERSE[TEXT[en]] = en; });

  function load() {
    try {
      var saved = localStorage.getItem(KEY);
      if (saved === "en" || saved === "zh") return saved;
    } catch (e) {}
    var nav = (navigator.language || "").toLowerCase();
    return nav.indexOf("zh") === 0 ? "zh" : "en";
  }

  var lang = load();

  function t(english) {
    return lang === "zh" && TEXT[norm(english)] ? TEXT[norm(english)] : english;
  }

  function applyBlocks(root) {
    root.querySelectorAll("h1, h2, h3, p").forEach(function (el) {
      if (el.__laoyuEn === undefined) {
        var key = BLOCK_INDEX[squash(el.textContent)];
        if (!key) return;
        el.__laoyuEn = el.innerHTML;
        el.__laoyuKey = key;
        el.setAttribute("data-i18n-block", "");
      }
      el.innerHTML = lang === "zh" ? BLOCKS[el.__laoyuKey] : el.__laoyuEn;
    });
  }

  function applyText(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        var p = node.parentElement;
        if (!p || /^(SCRIPT|STYLE)$/.test(p.tagName)) return NodeFilter.FILTER_REJECT;
        if (p.closest("[data-i18n-block]")) return NodeFilter.FILTER_REJECT;
        return norm(node.data) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var node;
    while ((node = walker.nextNode())) {
      var current = norm(node.data);
      var en = node.__laoyuEn ||
        (TEXT[current] ? current : REVERSE[current]);
      if (!en) continue;
      if (TEXT[current] && current !== en) en = current;
      node.__laoyuEn = en;
      var lead = node.data.match(/^\s*/)[0];
      var trail = node.data.match(/\s*$/)[0];
      node.data = lead + (lang === "zh" ? TEXT[en] : en) + trail;
    }
  }

  function apply() {
    document.documentElement.lang = lang === "zh" ? "zh-Hans" : "en";
    document.documentElement.setAttribute("data-lang", lang);
    var title = norm(document.title);
    var enTitle = TEXT[title] ? title : REVERSE[title];
    if (enTitle) document.title = lang === "zh" ? TEXT[enTitle] : enTitle;
    applyBlocks(document.body);
    applyText(document.documentElement);
    document.querySelectorAll(".langToggle [data-l]").forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-l") === lang);
      b.setAttribute("aria-pressed", b.getAttribute("data-l") === lang ? "true" : "false");
    });
  }

  function set(next) {
    lang = next;
    try { localStorage.setItem(KEY, next); } catch (e) {}
    apply();
  }

  function addToggle() {
    var navIn = document.querySelector(".navin");
    if (!navIn || navIn.querySelector(".langToggle")) return;
    var wrap = document.createElement("div");
    wrap.className = "langToggle";
    wrap.setAttribute("role", "group");
    wrap.setAttribute("aria-label", "Language / 语言");
    wrap.innerHTML =
      '<button type="button" data-l="en">EN</button>' +
      '<button type="button" data-l="zh">中文</button>';
    wrap.addEventListener("click", function (e) {
      var b = e.target.closest("[data-l]");
      if (b) set(b.getAttribute("data-l"));
    });
    var menu = navIn.querySelector(".mobileMenu");
    navIn.insertBefore(wrap, menu || null);
  }

  window.LAOYU_I18N = {
    t: t,
    apply: apply,
    lang: function () { return lang; },
    init: function () { addToggle(); apply(); }
  };

  document.documentElement.lang = lang === "zh" ? "zh-Hans" : "en";

})();
