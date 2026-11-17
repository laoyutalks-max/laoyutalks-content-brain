/* =========================================================
   LAOYUTALKS 3.0 — AI Lab (ASK LAOYU)
   Three assistants: Manufacturing, Quality & Problem-Solving,
   Productivity & Management.

   Two modes, chosen by ENDPOINT below:
   · ENDPOINT empty  -> PROTOTYPE. Answers come from the built-in
     guidance in this file, matched by keywords. Nothing leaves the
     browser. Every answer is labelled "Prototype".
   · ENDPOINT set    -> LIVE. Questions go to the LAOYU server proxy
     (server/ai-lab-worker), which holds the AI key and the system
     instructions. No key is ever in this file.

   Request  POST ENDPOINT  {assistant, lang, messages:[{role, content}]}
   Response 200 {answer:{summary, steps[], checks[], cautions[], related[]}}
            4xx/5xx {error:{code, message}}
   ========================================================= */
(function () {
  "use strict";

  /* Set to the deployed proxy address to switch on live AI, e.g.
     "https://laoyu-ai-lab.<your-subdomain>.workers.dev/ask" */
  var ENDPOINT = "";

  var MAX_CHARS = 1000, MAX_TURNS = 10, TIMEOUT_MS = 60000;

  var root = document.documentElement;
  function zh() { return root.getAttribute("data-lang") === "zh"; }
  function biPick(en, cn) { var I = window.LAOYU_I18N; return I && I.pick ? I.pick(en, cn) : (zh() ? cn : en); } /* EN+中: both, see i18n.js */
  function L(a) { return a ? biPick(a[0], a[1]) : ""; }
  function T(en, cn) { return biPick(en, cn); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function $(id) { return document.getElementById(id); }
  var D = window.LAOYU_DATA || { resources: [] };
  function res(id) { return D.resources.filter(function (r) { return r.id === id; })[0]; }
  function live() { return !!ENDPOINT; }

  var ICON = {
    manufacturing: '<path d="M3 21V9l6 4V9l6 4V4h5v17z"/><path d="M8 17h2M14 17h2"/>',
    quality: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    management: '<circle cx="9" cy="8" r="3.500"/><path d="M2.500 20c.600-3.600 3.200-5.500 6.500-5.500s5.900 1.900 6.500 5.500M16 4.500a3.500 3.500 0 0 1 0 7M18.500 15c1.700.900 2.700 2.600 3 5"/>'
  };

  /* ---------- Assistants ---------- */
  var ASSISTANTS = [
    { id: "manufacturing", name: ["Manufacturing Assistant", "制造助手"],
      d: ["Output, OEE, downtime, changeovers and shift routines.", "产量、OEE、停机、换线与班次管理。"],
      ask: [["Line 3 output is 15% below target this week. Where do I start?", "3 号线这周产量比目标低 15%，我该从哪里入手？"],
            ["Our filler keeps stopping for short stops. How do I reduce them?", "灌装机老是短暂停机，怎么减少？"],
            ["Changeovers take 90 minutes. How can we make them faster?", "换线要 90 分钟，怎样能更快？"],
            ["How should a good shift handover work?", "一个好的交接班应该怎么做？"]],
      tools: ["oee-loss-calculator", "downtime-troubleshooter", "shift-handover"] },
    { id: "quality", name: ["Quality & Problem-Solving Assistant", "质量与问题解决助手"],
      d: ["Complaints, 8D, root cause, CAPA and scrap.", "客户投诉、8D、根本原因、CAPA 与报废。"],
      ask: [["A customer complained about a wrong label. What do I do in the first 24 hours?", "客户投诉标签贴错了，前 24 小时我该做什么？"],
            ["The same defect keeps coming back after we fix it. Why?", "同一个缺陷修好后又反复出现，为什么？"],
            ["How do I check that a corrective action actually worked?", "怎样确认纠正措施真的有效？"],
            ["Scrap rate went from 2% to 5%. How do I find the cause?", "报废率从 2% 升到 5%，怎么找原因？"]],
      tools: ["8d-report", "fishbone-5why", "tool-capa-planner"] },
    { id: "management", name: ["Productivity & Management Assistant", "效率与管理助手"],
      d: ["Manpower, team motivation, meetings, hard talks and escalation.", "人力、团队干劲、会议、难谈的话与问题上报。"],
      ask: [["I'm short of three operators tonight. How do I cover the line?", "今晚少了三个操作员，产线怎么安排？"],
            ["A good team member has stopped caring. What should I do?", "一位不错的组员变得不上心了，我该怎么办？"],
            ["Actions from our weekly meeting never get closed. How do I fix that?", "每周会议上的行动项总是关不掉，怎么解决？"],
            ["How do I escalate a problem so management actually acts?", "怎样上报问题，管理层才会真正采取行动？"]],
      tools: ["manpower-gap-calculator", "weekly-action-tracker", "difficult-conversation"] }
  ];
  function asst(id) { return ASSISTANTS.filter(function (a) { return a.id === id; })[0]; }

  /* ---------- Prototype guidance (fixed text, matched by keywords) ---------- */
  var KB = {
    manufacturing: [
      { kw: ["output", "below target", "oee", "productivity", "behind", "low output", "capacity", "efficiency", "target"],
        zh: ["产量", "目标", "oee", "效率", "产能", "达不到"],
        s: ["Find which loss is biggest before you fix anything: availability (stops), performance (speed) or quality (scrap).",
            "先找出最大的损失，再动手解决：是可用率（停机）、性能（速度）还是质量（报废）。"],
        steps: [["Take one week of shift data: scheduled time, downtime, ideal rate, total and good pieces.", "取一周的班次数据：计划时间、停机时间、理论速度、总产量和合格品数。"],
                ["Split OEE into availability, performance and quality and rank the losses in minutes.", "把 OEE 拆成可用率、性能和质量，按损失的分钟数排序。"],
                ["Go to the line for the biggest loss and watch it for one shift before deciding on a fix.", "针对最大的损失去现场看一个班，再决定怎么改。"],
                ["Pick one countermeasure, set an owner and a date, and re-measure the next week.", "选一个对策，定负责人和日期，下周重新测量。"]],
        checks: [["Is the ideal rate realistic, or an old nameplate figure?", "理论速度是否现实，还是过时的铭牌数据？"],
                 ["Are short stops under 5 minutes being recorded at all?", "5 分钟以下的短暂停机有没有被记录？"]],
        cautions: [["Don't compare OEE between lines with different products without checking the ideal rates.", "产品不同的产线之间比较 OEE 前，要先核对理论速度。"]],
        rel: ["oee-loss-calculator", "production-kpi-dashboard", "tool-downtime-analysis"] },
      { kw: ["stop", "stops", "downtime", "breakdown", "jam", "machine", "short stop", "minor stop", "keeps stopping"],
        zh: ["停机", "停", "故障", "卡料", "设备", "机器"],
        s: ["Short stops are usually a few repeating causes. Count them by cause for a week, then fix the top one.",
            "短暂停机通常来自少数几个反复出现的原因。按原因统计一周，然后先解决排第一的。"],
        steps: [["Log every stop with time, duration and a simple cause code, including stops under 5 minutes.", "记录每一次停机的时间、时长和简单的原因代码，包括 5 分钟以下的。"],
                ["Make a Pareto of the causes by total minutes, not by count only.", "按总分钟数（不只是次数）把原因做成柏拉图。"],
                ["For the top cause, ask why five times at the machine with the operator and technician.", "针对排第一的原因，在设备旁和操作员、技术员一起连问五个为什么。"],
                ["Add a quick check to the start-up or cleaning routine so the cause is caught early.", "把快速检查加入开机或清洁流程，及早发现问题。"]],
        checks: [["Is the cause recorded the same way by every shift?", "每个班记录原因的方式是否一致？"],
                 ["Did anything change recently: material, settings, people or maintenance?", "最近有没有变化：物料、参数、人员或保养？"]],
        cautions: [["Always follow lockout rules before clearing a jam or opening guards.", "清理卡料或打开防护罩之前，必须遵守上锁挂牌规定。"]],
        rel: ["downtime-troubleshooter", "tool-downtime-analysis", "oee-loss-calculator"] },
      { kw: ["changeover", "setup", "set-up", "smed", "change over", "product change", "format change"],
        zh: ["换线", "换型", "换模", "转产"],
        s: ["Most changeover time is work that could be done while the line is still running. Separate it out first.",
            "换线时间里大部分工作其实可以在产线运行时完成，先把它们分出来。"],
        steps: [["Video one changeover from last good part to first good part.", "录下一次换线，从最后一个合格品到第一个合格品。"],
                ["List every task and mark it internal (line stopped) or external (can be done while running).", "列出每项任务，标注是内部（必须停线）还是外部（运行时可做）。"],
                ["Move external tasks before the stop: tools, parts and materials ready at the line.", "把外部任务挪到停线之前：工具、零件、物料提前备好在线旁。"],
                ["Simplify the remaining internal tasks and write a standard checklist.", "简化剩下的内部任务，写成标准检查表。"]],
        checks: [["Is adjustment and trial running counted in your changeover time?", "调试和试生产的时间有没有算进换线时间？"]],
        cautions: [["Keep quality checks on the first parts after every change.", "每次换线后的首件质量检查不能省。"]],
        rel: ["oee-loss-calculator", "supervisor-daily-planner", "weekly-action-tracker"] },
      { kw: ["handover", "hand over", "shift change", "daily report", "end of shift", "shift report", "next shift"],
        zh: ["交接", "交接班", "日报", "班次报告", "下一班"],
        s: ["A good handover is short, written, and organised by topic, with every open issue given an owner.",
            "好的交接班简短、有书面记录、按主题分类，每个未完成的问题都有负责人。"],
        steps: [["Use the same order every time: safety, quality, equipment, material, people, plan versus actual.", "每次都用同样的顺序：安全、质量、设备、物料、人员、计划对比实际。"],
                ["Write it down before talking it through, so nothing depends on memory.", "先写下来再口头交接，不要靠记忆。"],
                ["Give each open issue an owner and a next step.", "给每个未完成的问题定负责人和下一步。"],
                ["Spend five minutes at the line together for anything abnormal.", "有异常的地方，一起到现场看五分钟。"]],
        checks: [["Are open issues from the last handover closed or carried over on purpose?", "上一次交接的问题是关闭了，还是有意延续？"]],
        cautions: [["Never hand over a safety issue only verbally.", "安全问题绝不能只做口头交接。"]],
        rel: ["shift-handover", "demo-shift-handover", "demo-daily-report"] }
    ],
    quality: [
      { kw: ["complaint", "customer", "8d", "claim", "returned", "return", "wrong label", "label"],
        zh: ["投诉", "客户", "8d", "退货", "索赔", "标签"],
        s: ["Protect the customer first, then find the cause. Contain within 24 hours and confirm the scope in writing.",
            "先保护客户，再找原因。24 小时内完成围堵，并书面确认影响范围。"],
        steps: [["Get the facts: part number, lot or date code, quantity, photos and how the customer found it.", "收集事实：零件号、批号或日期码、数量、照片，以及客户是怎么发现的。"],
                ["Contain everywhere the problem can be: at the customer, in transit, in the warehouse and on the line.", "在所有可能有问题的地方围堵：客户处、运输中、仓库和产线上。"],
                ["Tell the customer what you have contained and when they will get the root cause.", "告诉客户已经围堵了什么，以及何时给出根本原因。"],
                ["Find two root causes: why it happened and why it was not detected.", "找出两个根本原因：为什么会发生，以及为什么没被发现。"]],
        checks: [["Do you know the first and last affected date or lot?", "是否知道受影响的第一个和最后一个日期或批次？"],
                 ["Could the same cause affect other products?", "同一原因会不会影响其他产品？"]],
        cautions: [["Don't send a root cause to the customer until it is verified.", "根本原因未经验证，不要发给客户。"]],
        rel: ["8d-report", "fishbone-5why", "escalation-report"] },
      { kw: ["same defect", "repeat", "keeps coming back", "again", "root cause", "5 why", "five why", "fishbone", "recurring"],
        zh: ["重复", "反复", "又", "根本原因", "5 个为什么", "鱼骨"],
        s: ["A problem that returns was usually fixed at the symptom. Go back and prove the root cause with evidence.",
            "反复出现的问题通常只是治标。回头用证据证明真正的根本原因。"],
        steps: [["Write a clear problem statement: what, where, when, how many, and what changed.", "写清楚问题描述：什么、哪里、何时、多少，以及有什么变化。"],
                ["List possible causes under the 6Ms: man, machine, method, material, measurement, environment.", "按 6M 列出可能的原因：人、机、法、料、测、环。"],
                ["Test each likely cause with data or a trial, not opinion.", "用数据或试验验证每个可能的原因，而不是靠意见。"],
                ["Fix the system (standard, design, check), not just retrain the person.", "改进系统（标准、设计、检查），而不只是再培训某个人。"]],
        checks: [["Was the previous fix ever checked for effectiveness?", "之前的措施有没有做过有效性验证？"]],
        cautions: [["'Operator error' is rarely a root cause. Ask why the process allowed it.", "“操作员失误”很少是根本原因，要问流程为什么允许它发生。"]],
        rel: ["repeated-mistake-worksheet", "fishbone-5why", "demo-root-cause"] },
      { kw: ["capa", "corrective", "effective", "effectiveness", "verify", "action worked", "preventive"],
        zh: ["capa", "纠正", "有效", "验证", "预防"],
        s: ["Decide before you start how you will prove the action worked, with a measure and a date.",
            "开始之前就决定如何证明措施有效：用什么指标、在什么日期验证。"],
        steps: [["State the expected result as a number, for example zero repeats in 3 months.", "把预期结果写成数字，例如 3 个月内零重复。"],
                ["Separate containment, correction and prevention actions, each with an owner and date.", "把围堵、纠正和预防措施分开，各自定负责人和日期。"],
                ["Check the data on the agreed date and close only if the target is met.", "到约定日期检查数据，只有达成目标才关闭。"],
                ["Update the standard work, training and control plan so the fix stays.", "更新标准作业、培训和控制计划，让改进固定下来。"]],
        checks: [["Is the closure based on data or on the action being done?", "关闭的依据是数据，还是只是措施做完了？"]],
        cautions: [["Closing a CAPA on the day the action is done hides failures.", "措施完成当天就关闭 CAPA，会掩盖失效。"]],
        rel: ["tool-capa-planner", "8d-report", "weekly-action-tracker"] },
      { kw: ["scrap", "rework", "defect rate", "yield", "reject", "waste"],
        zh: ["报废", "返工", "不良率", "良率", "废品"],
        s: ["Break the scrap down by defect type, line and shift before looking for a cause.",
            "先按缺陷类型、产线和班次拆分报废，再去找原因。"],
        steps: [["Collect scrap data by defect type for the period before and after the rise.", "收集上升前后的报废数据，按缺陷类型分类。"],
                ["Pareto the defects by cost or quantity and pick the top one.", "按成本或数量对缺陷做柏拉图，挑排第一的。"],
                ["Look for what changed when the rate rose: material lot, setting, person, tool, method.", "找出上升时发生了什么变化：物料批次、参数、人员、工具、方法。"],
                ["Confirm the cause with a small trial before rolling out the fix.", "推广改进前先用小范围试验确认原因。"]],
        checks: [["Did the measuring method or inspection limit change?", "测量方法或检验标准有没有变？"]],
        cautions: [["Make sure suspect parts are quarantined while you investigate.", "调查期间要隔离可疑零件。"]],
        rel: ["fishbone-5why", "production-kpi-dashboard", "repeated-mistake-worksheet"] }
    ],
    management: [
      { kw: ["short", "operators", "manpower", "absent", "absence", "cover", "staff", "people", "headcount", "sick"],
        zh: ["人手", "缺人", "操作员", "人力", "缺勤", "请假", "人员"],
        s: ["Protect safety and the customer orders first, then match the people you have to the skills each station needs.",
            "先保证安全和客户订单，再把现有人员按技能匹配到各工位。"],
        steps: [["List tonight's orders by priority and the stations they need.", "按优先级列出今晚的订单和所需工位。"],
                ["Check who is trained for which station and who can move.", "核对谁能操作哪个工位，谁可以调动。"],
                ["Run the critical stations fully; slow or pause the lowest-priority work.", "关键工位满员运行，低优先级的工作减速或暂停。"],
                ["Tell the next shift and your manager what was covered and what was not.", "告诉下一班和你的上级哪些安排了、哪些没有。"]],
        checks: [["Is anyone being asked to run a station they are not trained for?", "有没有人被安排到未受过培训的工位？"]],
        cautions: [["Don't skip breaks or safety checks to make up the numbers.", "不要为了凑产量而取消休息或省略安全检查。"]],
        rel: ["manpower-gap-calculator", "skills-matrix", "supervisor-daily-planner"] },
      { kw: ["motivation", "stopped caring", "disengaged", "quiet quitting", "morale", "not caring", "unmotivated", "attitude"],
        zh: ["干劲", "不上心", "积极性", "士气", "躺平", "态度"],
        s: ["Talk privately and early. Ask what has changed before assuming anything.",
            "尽早私下谈。先问发生了什么变化，不要先下结论。"],
        steps: [["Note the specific behaviours you have seen, with dates, not labels.", "记下你看到的具体行为和日期，不要贴标签。"],
                ["Have a private, unhurried conversation and start by asking how things are going.", "安排一次私下、不赶时间的谈话，先问问近况。"],
                ["Listen for causes you can act on: workload, recognition, growth, conflict or personal issues.", "听出你能处理的原因：工作量、认可、成长、冲突或个人问题。"],
                ["Agree one or two small steps and a date to talk again.", "约定一两个小步骤和下次谈话的日期。"]],
        checks: [["Has anything changed for them recently: role, shift, leader or workload?", "他们最近有没有变化：岗位、班次、上级或工作量？"]],
        cautions: [["If you see signs of serious personal difficulty, involve HR or support services.", "如果发现严重的个人困难迹象，请联系人力资源或支持服务。"]],
        rel: ["checklist-quiet-quitting", "difficult-conversation", "skills-matrix"] },
      { kw: ["meeting", "actions", "action items", "follow up", "follow-up", "never closed", "accountability", "overdue"],
        zh: ["会议", "行动项", "跟进", "关不掉", "逾期", "落实"],
        s: ["Every action needs one owner, a date and a weekly review in the same place.",
            "每个行动项都要有一个负责人、一个日期，并在同一个地方每周复查。"],
        steps: [["Keep one action list for the meeting, not notes scattered in emails.", "会议只用一份行动清单，不要分散在各封邮件里。"],
                ["Write each action as a verb, one named owner and a due date.", "每个行动项用动词开头，写明一个负责人和截止日期。"],
                ["Start each meeting by reviewing overdue actions before new topics.", "每次会议先复查逾期行动项，再讨论新议题。"],
                ["Close an action only when the result is visible, not when someone says it is done.", "只有看到结果才关闭行动项，而不是听到有人说做完了。"]],
        checks: [["Are there more actions than the team can realistically finish?", "行动项是否多到团队根本做不完？"]],
        cautions: [["Avoid shared owners like 'Production' or 'Team'. Name a person.", "不要写“生产部”或“团队”这类共同负责人，要写具体的人。"]],
        rel: ["weekly-action-tracker", "tool-meeting-minutes", "decision-matrix"] },
      { kw: ["escalate", "escalation", "management", "manager", "boss", "get support", "report up", "approval"],
        zh: ["上报", "升级", "管理层", "领导", "老板", "支持", "审批"],
        s: ["Managers act on cost, risk and a clear request. Put all three on one page.",
            "管理层会根据成本、风险和明确的请求采取行动。把这三点写在一页纸上。"],
        steps: [["State the problem in one sentence with numbers.", "用一句带数字的话说清问题。"],
                ["Show the impact: lost output, cost, customer or safety risk.", "说明影响：产量损失、成本、客户或安全风险。"],
                ["Say what you have already done and why it is not enough.", "说明你已经做了什么，以及为什么还不够。"],
                ["End with a specific ask and a deadline for a decision.", "最后提出具体请求和决策期限。"]],
        checks: [["Would your manager understand it without you in the room?", "你不在场时，上级能看懂吗？"]],
        cautions: [["Escalate safety risks immediately; don't wait for the report.", "安全风险要立即上报，不要等报告写好。"]],
        rel: ["escalation-report", "decision-matrix", "tool-email-writer"] },
      { kw: ["difficult conversation", "performance", "feedback", "behaviour", "behavior", "warning", "talk to"],
        zh: ["谈话", "绩效", "反馈", "行为", "警告"],
        s: ["Plan the conversation: the facts, the impact, what you need, and how you will listen.",
            "提前规划谈话：事实、影响、你的要求，以及你会怎么倾听。"],
        steps: [["Write down two or three specific examples with dates.", "写下两三个具体的例子和日期。"],
                ["Explain the impact on the team, quality or customer.", "说明对团队、质量或客户的影响。"],
                ["Ask for their view before agreeing next steps.", "在约定下一步之前，先听听对方的看法。"],
                ["Agree what will change and when you will review it.", "约定要改变什么以及何时复查。"]],
        checks: [["Is this the first time they are hearing about it?", "对方是第一次听到这个问题吗？"]],
        cautions: [["For formal warnings, follow your HR process.", "正式警告要按人力资源流程处理。"]],
        rel: ["difficult-conversation", "checklist-quiet-quitting", "repeated-mistake-worksheet"] }
    ]
  };

  function norm(s) { return String(s).toLowerCase(); }
  function prototypeAnswer(aid, text) {
    var q = norm(text), best = null, bestScore = 0;
    (KB[aid] || []).forEach(function (t) {
      var score = 0;
      t.kw.concat(t.zh).forEach(function (k) { if (q.indexOf(norm(k)) > -1) score += k.length > 4 ? 2 : 1; });
      if (score > bestScore) { best = t; bestScore = score; }
    });
    if (!best) {
      var a = asst(aid);
      return { matched: false,
        summary: T("This prototype only covers a few common topics for this assistant, and your question did not match one. Try one of the suggested questions, or rephrase with a key word such as those below.",
                   "这个原型只覆盖该助手的几个常见话题，你的问题没有匹配到。可以试试推荐问题，或用下面的关键词换个说法。"),
        steps: a.ask.map(function (x) { return L(x); }), checks: [], cautions: [], related: a.tools };
    }
    function pick(list) { return (list || []).map(L); }
    return { matched: true, summary: L(best.s), steps: pick(best.steps), checks: pick(best.checks), cautions: pick(best.cautions), related: best.rel };
  }

  /* ---------- State ---------- */
  var current = ASSISTANTS[0].id;
  var convo = {}; /* assistant id -> [{role, text, answer, source}] kept in memory only */
  ASSISTANTS.forEach(function (a) { convo[a.id] = []; });
  var busy = false, lastError = "";

  /* ---------- Rendering ---------- */
  function renderMode() {
    $("labMode").innerHTML = live()
      ? '<span class="chip g">' + T("Live AI", "实时 AI") + "</span> " + T("Answers are written by an AI model through the LAOYU server. Check them before acting.", "回答由 AI 模型通过 LAOYU 服务器生成，行动前请核实。")
      : '<span class="chip a">' + T("Prototype", "原型") + "</span> " + T("This is a prototype. Answers come from built-in guidance for common topics, not from a live AI. Nothing you type leaves your browser.", "这是原型版本。回答来自常见话题的内置指引，不是实时 AI。你输入的内容不会离开你的浏览器。");
    var how = live()
      ? [T("Your question and this conversation are sent to the LAOYU server, which forwards them to the AI provider (Anthropic) to write the answer.", "你的问题和本次对话会发送到 LAOYU 服务器，再转给 AI 服务商（Anthropic）生成回答。"),
         T("LAOYU does not store your questions. The conversation is kept only in this browser tab and is gone when you close or clear it.", "LAOYU 不保存你的问题。对话只保留在当前浏览器标签页，关闭或清空后即消失。"),
         T("There is a limit on how many questions can be asked per minute to keep the service fair.", "为保证公平使用，每分钟可提问的次数有限制。")]
      : [T("In this prototype, answers are matched from fixed guidance written by LAOYU. No AI model is used.", "在原型中，回答来自 LAOYU 编写的固定指引并按关键词匹配，没有使用 AI 模型。"),
         T("Nothing you type is sent anywhere or stored. The conversation is gone when you close the tab or press Clear.", "你输入的内容不会被发送或保存。关闭标签页或点“清空”后对话即消失。"),
         T("When live AI is switched on, this notice will change and explain where questions are sent.", "接入实时 AI 后，这里的说明会更新，并告诉你问题会发送到哪里。")];
    $("labHow").innerHTML = how.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("");
  }

  function renderPicker() {
    $("labAssistants").innerHTML = ASSISTANTS.map(function (a) {
      var on = a.id === current;
      return '<button type="button" class="labAsst' + (on ? " on" : "") + '" role="radio" aria-checked="' + on + '" tabindex="' + (on ? 0 : -1) + '" data-asst="' + a.id + '">' +
        '<span class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[a.id] + "</svg></span><span><b>" + esc(L(a.name)) + "</b><small>" + esc(L(a.d)) + "</small></span></button>";
    }).join("");
  }

  function renderHead() {
    var a = asst(current);
    $("labChatHead").innerHTML = '<div><h2 class="labSmallH">' + esc(L(a.name)) + "</h2><p>" + esc(L(a.d)) + "</p></div>" +
      '<button type="button" class="btn" id="labClear"' + (convo[current].length ? "" : " disabled") + ">" + T("Clear", "清空") + "</button>";
  }

  function list(title, items, cls) {
    if (!items || !items.length) return "";
    var tag = cls === "steps" ? "ol" : "ul";
    return '<div class="ansPart ' + cls + '"><h3>' + esc(title) + "</h3><" + tag + ">" + items.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</" + tag + "></div>";
  }
  function answerHTML(m, i) {
    var a = m.answer;
    var rel = (a.related || []).map(res).filter(Boolean).slice(0, 3);
    var src = m.source === "live" ? T("AI answer · check before acting", "AI 回答 · 行动前请核实") : T("Prototype · built-in guidance, not live AI", "原型 · 内置指引，非实时 AI");
    return '<div class="labMsg bot"><div class="ansCard">' +
      '<div class="ansTop"><span class="chip ' + (m.source === "live" ? "g" : "a") + '">' + esc(src) + '</span><button type="button" class="ansCopy" data-copy="' + i + '">' + T("Copy", "复制") + "</button></div>" +
      '<p class="ansSum">' + esc(a.summary) + "</p>" +
      list(a.matched === false ? T("Try asking", "可以这样问") : T("Steps", "步骤"), a.steps, "steps") +
      list(T("Check first", "先确认"), a.checks, "checks") +
      list(T("Cautions", "注意"), a.cautions, "cautions") +
      (rel.length ? '<div class="ansPart"><h3>' + T("Related tools", "相关工具") + '</h3><div class="ansRel">' +
        rel.map(function (r) { return '<a href="' + r.url + '">' + esc(L(r.title)) + " →</a>"; }).join("") + "</div></div>" : "") +
      "</div></div>";
  }
  function renderLog() {
    var msgs = convo[current], log = $("labLog");
    var html = msgs.map(function (m, i) {
      if (m.role === "user") return '<div class="labMsg me"><p>' + esc(m.text) + "</p></div>";
      if (m.role === "error") return '<div class="labMsg bot"><div class="ansErr" role="alert"><b>' + T("No answer", "未能回答") + "</b><p>" + esc(m.text) + '</p>' +
        (m.retry ? '<button type="button" class="btn" data-retry>' + T("Try again", "重试") + "</button>" : "") + "</div></div>";
      return answerHTML(m, i);
    }).join("");
    if (busy) html += '<div class="labMsg bot"><div class="ansLoading" role="status"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>' + T("Writing the answer…", "正在生成回答…") + "</div></div>";
    if (!msgs.length && !busy) html = '<p class="labEmpty">' + T("Ask a question below, or start with one of the suggestions.", "在下面提问，或从推荐问题开始。") + "</p>";
    log.innerHTML = html;
    log.scrollTop = log.scrollHeight;
  }
  function renderSuggest() {
    var a = asst(current);
    $("labSuggest").innerHTML = '<span class="labSmall">' + T("Suggested questions", "推荐问题") + "</span>" +
      a.ask.map(function (q, i) { return '<button type="button" class="labChip" data-ask="' + i + '"' + (busy ? " disabled" : "") + ">" + esc(L(q)) + "</button>"; }).join("");
  }
  function renderForm() {
    var inp = $("labInput"), n = inp.value.length;
    $("labInputLabel").textContent = T("Your question", "你的问题");
    inp.placeholder = T("Describe your problem. Include numbers if you have them.", "描述你的问题，有数字的话请写上。");
    $("labCount").textContent = n + " / " + MAX_CHARS;
    $("labCount").classList.toggle("over", n > MAX_CHARS - 50);
    var send = $("labSend");
    send.textContent = busy ? T("Sending…", "发送中…") : T("Send", "发送");
    send.disabled = busy;
    var err = $("labErr");
    err.textContent = lastError; err.hidden = !lastError;
  }
  function renderAll() { renderMode(); renderPicker(); renderHead(); renderLog(); renderSuggest(); renderForm(); }

  /* ---------- Sending ---------- */
  function asText(a) {
    var out = [a.summary];
    [["Steps", a.steps], ["Check first", a.checks], ["Cautions", a.cautions]].forEach(function (p) {
      if (p[1] && p[1].length) out.push(p[0] + ":\n" + p[1].map(function (x, i) { return (p[0] === "Steps" ? (i + 1) + ". " : "- ") + x; }).join("\n"));
    });
    return out.join("\n\n");
  }
  /* The server needs user / assistant turns that alternate and start with a user turn.
     Questions that got no answer (an error) are left out, except the newest one. */
  function history() {
    var m = convo[current].filter(function (x) { return x.role === "user" || x.role === "bot"; });
    var out = m.filter(function (x, i) { return x.role === "bot" || i === m.length - 1 || m[i + 1].role === "bot"; });
    while (out.length > MAX_TURNS) out.shift();
    while (out.length && out[0].role !== "user") out.shift();
    return out.map(function (x) { return { role: x.role === "user" ? "user" : "assistant", content: x.role === "user" ? x.text : asText(x.answer) }; });
  }
  function errorText(kind) {
    return {
      network: T("Couldn't reach the LAOYU server. Check your connection and try again.", "无法连接 LAOYU 服务器，请检查网络后重试。"),
      timeout: T("The answer took too long. Please try again.", "回答时间过长，请重试。"),
      rate: T("Too many questions in a short time. Please wait a minute and try again.", "短时间内提问太多，请等一分钟再试。"),
      invalid: T("That question couldn't be processed. Try rephrasing it.", "这个问题无法处理，请换个说法。"),
      declined: T("The assistant can't help with that request. Try a question about manufacturing, quality or team management.", "助手无法处理这个请求。请提问与制造、质量或团队管理相关的问题。"),
      server: T("The AI service is not available right now. Please try again later.", "AI 服务暂时不可用，请稍后再试。"),
      bad: T("The answer came back in an unexpected format. Please try again.", "回答格式异常，请重试。")
    }[kind];
  }
  function strList(v) { return Array.isArray(v) ? v.filter(function (x) { return typeof x === "string" && x.trim(); }).map(function (x) { return x.slice(0, 600); }).slice(0, 8) : []; }
  function cleanAnswer(a) {
    if (!a || typeof a.summary !== "string" || !a.summary.trim()) return null;
    return { summary: a.summary.slice(0, 1200), steps: strList(a.steps), checks: strList(a.checks), cautions: strList(a.cautions),
      related: strList(a.related).filter(function (id) { return !!res(id); }) };
  }

  function ask(text) {
    if (busy) return;
    var q = String(text || "").replace(/\s+$/, "");
    if (!q.trim()) { lastError = T("Type a question first.", "请先输入问题。"); renderForm(); $("labInput").focus(); return; }
    if (q.length > MAX_CHARS) { lastError = T("Please keep your question under " + MAX_CHARS + " characters.", "问题请控制在 " + MAX_CHARS + " 个字符以内。"); renderForm(); return; }
    lastError = "";
    var aid = current;
    convo[aid] = convo[aid].filter(function (m) { return m.role !== "error"; });
    convo[aid].push({ role: "user", text: q.trim() });
    $("labInput").value = "";

    if (!live()) {
      convo[aid].push({ role: "bot", source: "prototype", answer: prototypeAnswer(aid, q) });
      renderAll();
      return;
    }

    busy = true; renderAll();
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, TIMEOUT_MS);
    var body = JSON.stringify({ assistant: aid, lang: zh() ? "zh" : "en", messages: history() });
    var done = function (msg) {
      clearTimeout(timer); busy = false;
      convo[aid].push(msg);
      renderAll();
    };
    fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: body, signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (j) { return { status: r.status, json: j }; });
      })
      .then(function (r) {
        if (r.status === 200) {
          var a = cleanAnswer(r.json && r.json.answer);
          return a ? done({ role: "bot", source: "live", answer: a }) : done({ role: "error", text: errorText("bad"), retry: true });
        }
        var code = r.json && r.json.error && r.json.error.code;
        var kind = r.status === 429 ? "rate" : code === "declined" ? "declined" : r.status >= 400 && r.status < 500 ? "invalid" : "server";
        done({ role: "error", text: errorText(kind), retry: kind === "server" || kind === "rate" });
      })
      .catch(function (e) {
        done({ role: "error", text: errorText(e && e.name === "AbortError" ? "timeout" : "network"), retry: true });
      });
  }
  function retry() {
    var msgs = convo[current], lastUser = null;
    for (var i = msgs.length - 1; i >= 0; i--) if (msgs[i].role === "user") { lastUser = i; break; }
    if (lastUser === null) return;
    var q = msgs[lastUser].text;
    convo[current] = msgs.slice(0, lastUser);
    ask(q);
  }

  function copy(btn, text) {
    if (window.LAOYU_I18N && LAOYU_I18N.one) text = LAOYU_I18N.one(text); // EN+中: copy one language
    var ok = function () { btn.textContent = T("Copied ✓", "已复制 ✓"); setTimeout(function () { btn.textContent = T("Copy", "复制"); }, 1800); };
    var fallback = function () {
      var ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      var good = false; try { good = document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta);
      if (good) { ok(); return; }
      /* clipboard blocked: select the answer so it can be copied by hand */
      var card = btn.closest(".ansCard"), sel = window.getSelection && window.getSelection();
      if (card && sel) { var r = document.createRange(); r.selectNodeContents(card.querySelector(".ansSum").parentNode); sel.removeAllRanges(); sel.addRange(r); }
      btn.textContent = T("Selected: press Ctrl+C", "已选中：按 Ctrl+C 复制");
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, fallback); else fallback();
  }

  /* ---------- Events ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    if (!$("labLog")) return;
    var params = new URLSearchParams(location.search);
    if (params.get("a") && asst(params.get("a"))) current = params.get("a");

    $("labAssistants").addEventListener("click", function (e) {
      var b = e.target.closest("[data-asst]"); if (!b || busy) return;
      current = b.dataset.asst; lastError = ""; renderAll();
      var on = $("labAssistants").querySelector('[data-asst="' + current + '"]'); if (on) on.focus();
    });
    $("labAssistants").addEventListener("keydown", function (e) {
      var keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
      if (!(e.key in keys) || busy) return;
      e.preventDefault();
      var i = ASSISTANTS.findIndex(function (a) { return a.id === current; });
      current = ASSISTANTS[(i + keys[e.key] + ASSISTANTS.length) % ASSISTANTS.length].id; lastError = ""; renderAll();
      $("labAssistants").querySelector('[data-asst="' + current + '"]').focus();
    });
    $("labChat").addEventListener("click", function (e) {
      var t;
      if ((t = e.target.closest("[data-ask]"))) { ask(L(asst(current).ask[+t.dataset.ask])); return; }
      if ((t = e.target.closest("[data-copy]"))) { var m = convo[current][+t.dataset.copy]; if (m) copy(t, asText(m.answer)); return; }
      if (e.target.closest("[data-retry]")) { retry(); return; }
      if (e.target.closest("#labClear") && !busy) { convo[current] = []; lastError = ""; renderAll(); $("labInput").focus(); }
    });
    $("labForm").addEventListener("submit", function (e) { e.preventDefault(); ask($("labInput").value); });
    $("labInput").addEventListener("input", function () { if (lastError) lastError = ""; renderForm(); });
    $("labInput").addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); ask($("labInput").value); }
    });
    document.addEventListener("laoyu:lang", renderAll);
    renderAll();
  });

  /* Test hook: lets a test point the page at a stub server. Not used by the site. */
  window.LAOYU_AILAB = { setEndpoint: function (u) { ENDPOINT = String(u || ""); renderAll(); }, prototypeAnswer: prototypeAnswer };
})();
