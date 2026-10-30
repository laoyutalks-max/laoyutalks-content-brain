/* =========================================================
   LAOYU — Management tools
   Team Skills Matrix · Difficult Conversation Planner ·
   Escalation Report Builder · Decision Matrix
   Everything stays in the visitor's own browser.
   ========================================================= */
(function () {
  "use strict";
  function zh() { return document.documentElement.getAttribute("data-lang") === "zh"; }
  function L(en, cn) { return zh() ? cn : en; }
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function $(id) { return document.getElementById(id); }
  function val(id) { var e = $(id); return e ? e.value.trim() : ""; }
  function num(id) { var v = parseFloat(val(id)); return isFinite(v) ? v : NaN; }
  function on(ev, fn) { document.addEventListener(ev, fn); }
  function copyText(text, btn) {
    var done = function () { var o = btn.innerHTML; btn.textContent = L("COPIED ✓", "已复制 ✓"); setTimeout(function () { btn.innerHTML = o; }, 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { fb(); done(); });
    else { fb(); done(); }
    function fb() { var ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e) {} ta.remove(); }
  }

  /* =======================================================
     1. TEAM SKILLS MATRIX
     ======================================================= */
  var LV = [
    ["Not trained", "未培训"],
    ["Learning", "学习中"],
    ["Can do with support", "需协助可完成"],
    ["Independent", "可独立操作"],
    ["Can train others", "可以培训他人"]
  ];
  function skills() {
    var grid = $("smGrid");
    if (!grid) return;
    var KEY = "laoyuSM";
    var def = function () {
      return {
        target: 3,
        skills: zh() ? ["工位 A", "工位 B", "换线", "质量检验"] : ["Station A", "Station B", "Changeover", "Quality check"],
        people: [{ n: zh() ? "员工 1" : "Person 1", l: [3, 2, 0, 1] }, { n: zh() ? "员工 2" : "Person 2", l: [4, 0, 3, 3] }, { n: zh() ? "员工 3" : "Person 3", l: [1, 3, 0, 0] }]
      };
    };
    var st = load(KEY, null) || def();

    function qualified(si) { return st.people.filter(function (p) { return (p.l[si] || 0) >= 3; }).length; }
    function render() {
      var T = st.target;
      var head = '<tr><th class="smCorner">' + L("Person \\ Skill", "人员 \\ 技能") + "</th>" + st.skills.map(function (s, si) {
        return '<th><input class="smSkill" data-si="' + si + '" value="' + esc(s) + '" aria-label="' + L("Skill name", "技能名称") + '"><button type="button" class="smX" data-dels="' + si + '" aria-label="' + L("Remove skill", "删除技能") + '">×</button></th>';
      }).join("") + '<th class="smSum">' + L("Flexibility", "多能度") + "</th></tr>";
      var body = st.people.map(function (p, pi) {
        var flex = p.l.filter(function (x) { return x >= 3; }).length;
        return '<tr><th><input class="smName" data-pi="' + pi + '" value="' + esc(p.n) + '" aria-label="' + L("Name", "姓名") + '"><button type="button" class="smX" data-delp="' + pi + '" aria-label="' + L("Remove person", "删除人员") + '">×</button></th>' +
          st.skills.map(function (s, si) {
            var v = p.l[si] || 0;
            return '<td><button type="button" class="smCell lv' + v + '" data-pi="' + pi + '" data-si="' + si + '" title="' + esc(L(LV[v][0], LV[v][1])) + '"><i class="pie p' + v + '"></i><span>' + v + "</span></button></td>";
          }).join("") + '<td class="smSum"><b>' + flex + "</b>/" + st.skills.length + "</td></tr>";
      }).join("");
      var foot = '<tr class="smFoot"><th>' + L("Qualified (level 3+)", "合格人数（3 级以上）") + "</th>" + st.skills.map(function (s, si) {
        var q = qualified(si), cls = q <= 1 ? "bad" : q < T ? "warn" : "ok";
        return '<td class="' + cls + '"><b>' + q + "</b>/" + T + "</td>";
      }).join("") + "<td></td></tr>";
      grid.innerHTML = "<thead>" + head + "</thead><tbody>" + body + "</tbody><tfoot>" + foot + "</tfoot>";
      insights();
    }
    function insights() {
      var T = st.target, risks = [], plan = [];
      st.skills.forEach(function (s, si) {
        var q = qualified(si);
        if (q >= T) return;
        risks.push({ s: s, q: q, si: si });
        var learners = st.people.map(function (p, pi) { return { p: p, v: p.l[si] || 0 }; }).filter(function (x) { return x.v < 3; }).sort(function (a, b) { return b.v - a.v; });
        var trainers = st.people.filter(function (p) { return (p.l[si] || 0) === 4; });
        if (!trainers.length) trainers = st.people.filter(function (p) { return (p.l[si] || 0) === 3; });
        var need = T - q;
        learners.slice(0, need).forEach(function (x) {
          plan.push({ s: s, who: x.p.n, from: x.v, by: trainers.length ? trainers[0].n : L("external / supplier trainer", "外部或供应商培训师") });
        });
      });
      var spof = risks.filter(function (r) { return r.q <= 1; });
      $("smKpis").innerHTML =
        '<div class="atChip"><b>' + st.people.length + "</b><span>" + L("People", "人员") + "</span></div>" +
        '<div class="atChip"><b>' + st.skills.length + "</b><span>" + L("Skills / stations", "技能 / 工位") + "</span></div>" +
        '<div class="atChip ' + (spof.length ? "bad" : "ok") + '"><b>' + spof.length + "</b><span>" + L("Single points of failure", "单点风险") + "</span></div>" +
        '<div class="atChip ' + (risks.length - spof.length ? "bad" : "ok") + '"><b>' + (risks.length - spof.length) + "</b><span>" + L("Below target", "低于目标") + "</span></div>";
      $("smRisk").innerHTML = risks.length ? risks.map(function (r) {
        return '<li class="' + (r.q <= 1 ? "bad" : "warn") + '"><b>' + esc(r.s) + "</b> — " +
          (r.q === 0 ? L("nobody is qualified. Any order needing this skill is at risk today.", "没有任何人合格。今天任何需要这项技能的订单都有风险。")
           : r.q === 1 ? L("only 1 person is qualified. If they are absent, this stops.", "只有 1 人合格。他一缺勤，这里就停。")
           : L("only " + r.q + " qualified, target is " + st.target + ".", "只有 " + r.q + " 人合格，目标是 " + st.target + " 人。")) + "</li>";
      }).join("") : '<li class="ok">' + L("Every skill meets the target. Keep it that way with refresher training.", "所有技能都达到目标。用复训保持住。") + "</li>";
      $("smPlan").innerHTML = plan.length ? plan.map(function (x) {
        return "<tr><td>" + esc(x.s) + "</td><td>" + esc(x.who) + " <small>(" + L("now level", "目前") + " " + x.from + ")</small></td><td>" + esc(x.by) + "</td><td>" + L("Level 3 in 4–6 weeks", "4–6 周内达到 3 级") + "</td></tr>";
      }).join("") : '<tr><td colspan="4">' + L("No training needed to reach the target.", "达到目标不需要额外培训。") + "</td></tr>";
    }
    function persist() { save(KEY, st); }

    grid.addEventListener("click", function (e) {
      var c = e.target.closest(".smCell");
      if (c) { var p = st.people[+c.dataset.pi]; p.l[+c.dataset.si] = ((p.l[+c.dataset.si] || 0) + 1) % 5; persist(); render(); return; }
      var x = e.target.closest(".smX"); if (!x) return;
      if (x.dataset.dels != null) { var si = +x.dataset.dels; st.skills.splice(si, 1); st.people.forEach(function (p) { p.l.splice(si, 1); }); }
      if (x.dataset.delp != null) st.people.splice(+x.dataset.delp, 1);
      persist(); render();
    });
    grid.addEventListener("change", function (e) {
      if (e.target.classList.contains("smSkill")) st.skills[+e.target.dataset.si] = e.target.value;
      if (e.target.classList.contains("smName")) st.people[+e.target.dataset.pi].n = e.target.value;
      persist(); render();
    });
    $("smAddP").addEventListener("click", function () { st.people.push({ n: L("Person ", "员工 ") + (st.people.length + 1), l: st.skills.map(function () { return 0; }) }); persist(); render(); });
    $("smAddS").addEventListener("click", function () { st.skills.push(L("Skill ", "技能 ") + (st.skills.length + 1)); st.people.forEach(function (p) { p.l.push(0); }); persist(); render(); });
    $("smTarget").value = st.target;
    $("smTarget").addEventListener("change", function () { st.target = Math.max(1, Math.min(9, parseInt($("smTarget").value, 10) || 3)); persist(); render(); });
    $("smCsv").addEventListener("click", function () {
      var rows = [[L("Person", "人员")].concat(st.skills)].concat(st.people.map(function (p) { return [p.n].concat(st.skills.map(function (s, i) { return p.l[i] || 0; })); }));
      var csv = "﻿" + rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(","); }).join("\n");
      var a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "skills-matrix.csv"; document.body.appendChild(a); a.click(); a.remove();
    });
    on("laoyu:lang", render);
    on("laoyu:reset", function () { st = def(); persist(); $("smTarget").value = st.target; render(); });
    render();
  }

  /* =======================================================
     2. DIFFICULT CONVERSATION PLANNER
     ======================================================= */
  var CONV = {
    perf: [["Performance below standard", "绩效未达标准"], ["Bring the numbers. Ask what is getting in the way before assuming effort is the problem.", "带上数据。先问是什么在阻碍，不要先假设是态度问题。"]],
    behave: [["Behaviour or attitude", "行为或态度"], ["Describe what you saw and heard, not what you think about them as a person.", "描述你看到和听到的，而不是你对这个人的评价。"]],
    attend: [["Attendance or lateness", "出勤或迟到"], ["Have the dates ready. Check for a personal or health reason first and follow HR policy.", "准备好具体日期。先了解是否有个人或健康原因，并遵守人事规定。"]],
    safety: [["Safety rule broken", "违反安全规定"], ["Be immediate and clear. Safety is not negotiable, but find out why the shortcut felt necessary.", "要及时、清楚。安全没有商量余地，但要弄清楚为什么对方觉得有必要走捷径。"]],
    conflict: [["Conflict between team members", "团队成员之间的冲突"], ["Meet each person separately first. Focus on the work impact, not who is right.", "先分别和每个人谈。聚焦对工作的影响，而不是谁对谁错。"]]
  };
  var JUDGE = ["lazy", "careless", "always", "never", "attitude", "useless", "stupid", "bad attitude", "don't care", "doesn't care", "unprofessional", "hopeless", "懒", "粗心", "总是", "从来", "态度差", "没用", "不在乎", "不专业", "没救"];
  function conversation() {
    if (!$("cvOut")) return;
    var KEY = "laoyuCV";
    var st = load(KEY, { type: "perf" });
    function types() {
      $("cvType").innerHTML = Object.keys(CONV).map(function (k) {
        return '<button type="button" class="dtChip' + (st.type === k ? " on" : "") + '" data-k="' + k + '">' + esc(L(CONV[k][0][0], CONV[k][0][1])) + "</button>";
      }).join("");
      $("cvTip").textContent = "💡 " + L(CONV[st.type][1][0], CONV[st.type][1][1]);
    }
    function check() {
      var text = [val("cvSit"), val("cvBeh"), val("cvImp")].join(" ").toLowerCase();
      var hits = JUDGE.filter(function (w) { return text.indexOf(w) > -1; });
      var box = $("cvCheck");
      if (!text.trim()) { box.className = "cvCheck"; box.textContent = ""; return; }
      box.className = "cvCheck " + (hits.length ? "warn" : "ok");
      box.textContent = hits.length
        ? L("⚠ Words like \"" + hits.join("\", \"") + "\" judge the person. Replace them with what you actually saw: when, what, how often.", "⚠ “" + hits.join("”、“") + "”这类词是在评判人。请换成你实际看到的：什么时候、做了什么、多少次。")
        : L("✓ Sounds factual. Good: facts are hard to argue with.", "✓ 听起来很客观。很好，事实最难被反驳。");
    }
    function script() {
      var name = val("cvName") || L("[name]", "[姓名]");
      var lines = [];
      lines.push(L("1. OPEN (calm, private, 1 minute)", "1. 开场（冷静、私下、1 分钟）"));
      lines.push(L("\"" + name + ", thanks for making time. I want to talk about something I've noticed, because I want this to work for you and the team.\"", "“" + name + "，谢谢你抽时间。我想聊一件我注意到的事，因为我希望这件事对你和团队都有好结果。”"));
      lines.push("");
      lines.push(L("2. FACTS (what you saw)", "2. 事实（你看到的）"));
      lines.push(L("\"" + (val("cvSit") ? "On " + val("cvSit") + ", " : "") + (val("cvBeh") || "[what happened]") + ".\"", "“" + (val("cvSit") ? val("cvSit") + "，" : "") + (val("cvBeh") || "[发生了什么]") + "。”"));
      lines.push("");
      lines.push(L("3. IMPACT (why it matters)", "3. 影响（为什么重要）"));
      lines.push(L("\"The impact was " + (val("cvImp") || "[impact on output, quality, safety or the team]") + ".\"", "“它造成的影响是" + (val("cvImp") || "[对产量、质量、安全或团队的影响]") + "。”"));
      lines.push("");
      lines.push(L("4. LISTEN (then stay quiet)", "4. 倾听（问完就安静）"));
      lines.push(L("\"How do you see it? Is there something getting in the way that I don't know about?\"", "“你怎么看？是不是有什么我不知道的事情在阻碍你？”"));
      lines.push("");
      lines.push(L("5. WHAT GOOD LOOKS LIKE", "5. 期望的标准"));
      lines.push(L("\"Going forward I need " + (val("cvNeed") || "[the specific standard]") + ".\"", "“接下来我需要" + (val("cvNeed") || "[具体的标准]") + "。”"));
      if (val("cvSupport")) lines.push(L("\"To help, I will " + val("cvSupport") + ".\"", "“为了帮你，我会" + val("cvSupport") + "。”"));
      lines.push("");
      lines.push(L("6. AGREE & FOLLOW UP", "6. 达成共识并跟进"));
      lines.push(L("\"Let's agree: " + (val("cvAgree") || "[action, owner]") + ". We'll check in on " + (val("cvFollow") || "[date]") + ".\"", "“我们说定：" + (val("cvAgree") || "[行动、负责人]") + "。我们在" + (val("cvFollow") || "[日期]") + "再回顾一次。”"));
      $("cvOut").textContent = lines.join("\n");
    }
    $("cvType").addEventListener("click", function (e) { var b = e.target.closest(".dtChip"); if (!b) return; st.type = b.dataset.k; save(KEY, st); types(); });
    on("input", function (e) { if (e.target.closest("#cvForm")) { check(); script(); } });
    $("cvCopy").addEventListener("click", function (e) { copyText($("cvOut").textContent, e.currentTarget); });
    on("laoyu:lang", function () { types(); check(); script(); });
    on("laoyu:reset", function () { st = { type: "perf" }; save(KEY, st); setTimeout(function () { types(); check(); script(); }, 0); });
    types(); setTimeout(function () { check(); script(); }, 60);
  }

  /* =======================================================
     3. ESCALATION REPORT BUILDER
     ======================================================= */
  function escalation() {
    if (!$("erOut")) return;
    function build() {
      var cur = val("erCur") || "";
      var hrs = num("erHrs"), rate = num("erRate"), scrap = num("erScrap"), unit = num("erUnit"), other = num("erOther");
      var cost = (isFinite(hrs) && isFinite(rate) ? hrs * rate : 0) + (isFinite(scrap) && isFinite(unit) ? scrap * unit : 0) + (isFinite(other) ? other : 0);
      var sev = val("erSev") || "med";
      var sevT = { high: L("HIGH", "高"), med: L("MEDIUM", "中"), low: L("LOW", "低") }[sev];
      var risk = val("erRisk");
      var m = function (n) { return cur + Math.round(n).toLocaleString(); };
      $("erCost").innerHTML =
        '<div class="atChip ' + (cost ? "bad" : "") + '"><b>' + (cost ? m(cost) : "–") + "</b><span>" + L("Cost impact so far", "目前的成本影响") + "</span></div>" +
        '<div class="atChip ' + (val("erQty") ? "bad" : "") + '"><b>' + (val("erQty") || "–") + "</b><span>" + L("Units at risk for delivery", "交付风险数量") + "</span></div>" +
        '<div class="atChip sev-' + sev + '"><b>' + sevT + "</b><span>" + L("Severity", "严重程度") + "</span></div>";
      var opts = [1, 2, 3].map(function (i) {
        var t = val("erOpt" + i); if (!t) return "";
        return "  " + String.fromCharCode(64 + i) + ") " + t + (val("erOptC" + i) ? " — " + L("cost", "成本") + ": " + val("erOptC" + i) : "") + (val("erOptE" + i) ? " — " + L("effect", "效果") + ": " + val("erOptE" + i) : "");
      }).filter(Boolean);
      var lines = [
        L("Subject", "主题") + ": [" + sevT + "] " + (val("erTitle") || L("Issue title", "问题标题")) + (val("erAsk") ? " — " + L("decision needed by ", "需要在以下时间前决定：") + (val("erBy") || "?") : ""),
        "",
        L("BOTTOM LINE", "结论先行"),
        (val("erAsk") ? L("I need: ", "我需要：") + val("erAsk") + (val("erBy") ? L(" by ", "，期限：") + val("erBy") : "") + "." : L("[What you need from them, and by when]", "[你需要对方做什么、什么时候之前]")),
        "",
        L("WHAT HAPPENED", "发生了什么"),
        val("erWhat") || "-",
        "",
        L("IMPACT", "影响"),
        "• " + L("Cost so far", "目前成本") + ": " + (cost ? m(cost) : "-") + (isFinite(hrs) ? " (" + hrs + " " + L("h downtime", "小时停机") + (isFinite(scrap) ? ", " + scrap + " " + L("units scrapped", "件报废") : "") + ")" : ""),
        "• " + L("Delivery", "交付") + ": " + (val("erCust") || "-") + (val("erQty") ? ", " + val("erQty") + " " + L("units at risk", "件有风险") : "") + (val("erDate") ? ", " + L("due", "交期") + " " + val("erDate") : ""),
        "• " + L("Safety / quality risk", "安全 / 质量风险") + ": " + (risk || L("none known", "目前未知")),
        "",
        L("CAUSE", "原因"),
        (val("erCause") || "-") + " (" + ({ known: L("confirmed", "已确认"), inv: L("under investigation", "调查中"), unk: L("not yet known", "尚未知") }[val("erCauseSt") || "inv"]) + ")",
        "",
        L("ACTIONS ALREADY TAKEN", "已采取的措施"),
        val("erDone") || "-",
        ""
      ];
      if (opts.length) lines = lines.concat([L("OPTIONS", "可选方案")]).concat(opts).concat([L("Recommendation", "建议") + ": " + (val("erRec") || "-"), ""]);
      lines.push(L("NEXT UPDATE", "下次更新") + ": " + (val("erNext") || "-"));
      $("erOut").textContent = lines.join("\n");
    }
    on("input", function (e) { if (e.target.closest("#erForm")) build(); });
    on("change", function (e) { if (e.target.closest("#erForm")) build(); });
    $("erCopy").addEventListener("click", function (e) { copyText($("erOut").textContent, e.currentTarget); });
    on("laoyu:lang", build);
    on("laoyu:reset", function () { setTimeout(build, 0); });
    setTimeout(build, 60);
  }

  /* =======================================================
     4. DECISION MATRIX
     ======================================================= */
  var PRESETS = {
    supplier: [["Choose a supplier", "选择供应商"], [["Price", "价格", 4], ["Quality record", "质量记录", 5], ["Delivery reliability", "交付可靠性", 5], ["Technical support", "技术支持", 3], ["Payment terms", "付款条件", 2]]],
    project: [["Pick an improvement project", "选择改善项目"], [["Savings per year", "年节省", 5], ["Effort / cost to do", "投入 / 成本", 4], ["Time to result", "见效时间", 3], ["Safety or quality benefit", "安全或质量收益", 4], ["Team buy-in", "团队认同", 3]]],
    hire: [["Hire a candidate", "招聘候选人", ], [["Relevant experience", "相关经验", 5], ["Skills test", "技能测试", 4], ["Attitude & teamwork", "态度与团队合作", 5], ["Growth potential", "成长潜力", 3], ["Salary fit", "薪资匹配", 2]]],
    machine: [["Repair or replace a machine", "设备维修还是更换"], [["Total cost (3 years)", "三年总成本", 5], ["Downtime during the change", "更换期间的停机", 4], ["Reliability after", "之后的可靠性", 5], ["Capacity gain", "产能提升", 3], ["Spare parts availability", "备件供应", 3]]]
  };
  function decision() {
    var tbl = $("dmGrid");
    if (!tbl) return;
    var KEY = "laoyuDM";
    var def = function () {
      var p = PRESETS.supplier[1];
      return { opts: zh() ? ["方案 A", "方案 B", "方案 C"] : ["Option A", "Option B", "Option C"], crit: p.map(function (c) { return { n: zh() ? c[1] : c[0], w: c[2], must: false }; }), s: {} };
    };
    var st = load(KEY, null) || def();
    function sc(oi, ci) { var v = st.s[oi + ":" + ci]; return v == null ? 3 : v; }
    function results() {
      var maxW = st.crit.reduce(function (a, c) { return a + c.w * 5; }, 0) || 1;
      return st.opts.map(function (o, oi) {
        var tot = st.crit.reduce(function (a, c, ci) { return a + c.w * sc(oi, ci); }, 0);
        var ko = st.crit.some(function (c, ci) { return c.must && sc(oi, ci) <= 2; });
        return { o: o, oi: oi, tot: tot, pct: tot / maxW * 100, ko: ko };
      });
    }
    function render() {
      tbl.innerHTML = "<thead><tr><th>" + L("Criteria", "评估标准") + "</th><th>" + L("Weight", "权重") + '</th><th title="' + L("Must-have: an option scoring 1–2 here is knocked out", "必须项：在这一项得 1–2 分的方案会被淘汰") + '">' + L("Must", "必须") + "</th>" +
        st.opts.map(function (o, oi) { return '<th><input class="dmOpt" data-oi="' + oi + '" value="' + esc(o) + '"><button type="button" class="smX" data-delo="' + oi + '">×</button></th>'; }).join("") + "</tr></thead><tbody>" +
        st.crit.map(function (c, ci) {
          return '<tr><td><input class="dmCrit" data-ci="' + ci + '" value="' + esc(c.n) + '"><button type="button" class="smX" data-delc="' + ci + '">×</button></td>' +
            '<td><select class="dmW" data-ci="' + ci + '">' + [1, 2, 3, 4, 5].map(function (w) { return "<option" + (c.w === w ? " selected" : "") + ">" + w + "</option>"; }).join("") + "</select></td>" +
            '<td><input type="checkbox" class="dmMust" data-ci="' + ci + '"' + (c.must ? " checked" : "") + "></td>" +
            st.opts.map(function (o, oi) { var v = sc(oi, ci); return '<td><select class="dmS s' + v + '" data-k="' + oi + ":" + ci + '">' + [1, 2, 3, 4, 5].map(function (x) { return "<option" + (v === x ? " selected" : "") + ">" + x + "</option>"; }).join("") + "</select></td>"; }).join("") + "</tr>";
        }).join("") + "</tbody>";
      verdict();
    }
    function verdict() {
      var r = results();
      var ok = r.filter(function (x) { return !x.ko; }).sort(function (a, b) { return b.tot - a.tot; });
      var all = r.slice().sort(function (a, b) { return b.tot - a.tot; });
      var best = all[0] ? all[0].tot : 1;
      $("dmBars").innerHTML = all.map(function (x) {
        var isWin = ok[0] && x.oi === ok[0].oi;
        return '<div class="dmBar' + (isWin ? " win" : "") + (x.ko ? " ko" : "") + '"><span>' + esc(x.o) + (x.ko ? " <em>" + L("knocked out", "已淘汰") + "</em>" : "") + '</span><i><b style="width:' + (x.tot / best * 100) + '%"></b></i><b>' + x.tot + "</b></div>";
      }).join("");
      var msg;
      if (!ok.length) msg = ["bad", L("Every option fails a must-have. Rethink the options or the must-haves.", "所有方案都没通过必须项。请重新考虑方案或必须项。")];
      else if (ok.length > 1 && (ok[0].tot - ok[1].tot) / ok[0].tot < 0.05) msg = ["warn", L("Too close to call: " + ok[0].o + " and " + ok[1].o + " are within 5%. Get more data on the criteria with the highest weight.", "难分高下：" + ok[0].o + " 和 " + ok[1].o + " 相差不到 5%。请在权重最高的标准上收集更多数据。")];
      else {
        // sensitivity: does the winner change if any single weight moves by ±1?
        var flips = [];
        st.crit.forEach(function (c, ci) {
          [-1, 1].forEach(function (d) {
            var w = c.w + d; if (w < 1 || w > 5) return;
            var tops = st.opts.map(function (o, oi) {
              var ko = st.crit.some(function (cc, cj) { return cc.must && sc(oi, cj) <= 2; });
              return { oi: oi, ko: ko, t: st.crit.reduce(function (a, cc, cj) { return a + (cj === ci ? w : cc.w) * sc(oi, cj); }, 0) };
            }).filter(function (x) { return !x.ko; }).sort(function (a, b) { return b.t - a.t; });
            if (tops[0] && tops[0].oi !== ok[0].oi && flips.indexOf(c.n) < 0) flips.push(c.n);
          });
        });
        msg = flips.length
          ? ["warn", L("Recommended: " + ok[0].o + ". But the result changes if you adjust the weight of: " + flips.join(", ") + ". Make sure those weights are right.", "推荐：" + ok[0].o + "。但如果调整以下标准的权重，结果会改变：" + flips.join("、") + "。请确认这些权重是对的。")]
          : ["ok", L("Recommended: " + ok[0].o + ". The result is robust: changing any single weight by 1 does not change the winner.", "推荐：" + ok[0].o + "。结果稳健：任意一个权重增减 1，胜出方案都不变。")];
      }
      $("dmVerdict").className = "dmVerdict " + msg[0];
      $("dmVerdict").textContent = msg[1];
    }
    function persist() { save(KEY, st); }
    tbl.addEventListener("change", function (e) {
      var t = e.target;
      if (t.classList.contains("dmS")) st.s[t.dataset.k] = +t.value;
      if (t.classList.contains("dmW")) st.crit[+t.dataset.ci].w = +t.value;
      if (t.classList.contains("dmMust")) st.crit[+t.dataset.ci].must = t.checked;
      if (t.classList.contains("dmCrit")) st.crit[+t.dataset.ci].n = t.value;
      if (t.classList.contains("dmOpt")) st.opts[+t.dataset.oi] = t.value;
      persist(); render();
    });
    tbl.addEventListener("click", function (e) {
      var x = e.target.closest(".smX"); if (!x) return;
      if (x.dataset.delo != null) { var oi = +x.dataset.delo; st.opts.splice(oi, 1); var ns = {}; Object.keys(st.s).forEach(function (k) { var a = k.split(":").map(Number); if (a[0] === oi) return; ns[(a[0] > oi ? a[0] - 1 : a[0]) + ":" + a[1]] = st.s[k]; }); st.s = ns; }
      if (x.dataset.delc != null) { var ci = +x.dataset.delc; st.crit.splice(ci, 1); var ns2 = {}; Object.keys(st.s).forEach(function (k) { var a = k.split(":").map(Number); if (a[1] === ci) return; ns2[a[0] + ":" + (a[1] > ci ? a[1] - 1 : a[1])] = st.s[k]; }); st.s = ns2; }
      persist(); render();
    });
    $("dmAddO").addEventListener("click", function () { if (st.opts.length >= 6) return; st.opts.push(L("Option ", "方案 ") + String.fromCharCode(65 + st.opts.length)); persist(); render(); });
    $("dmAddC").addEventListener("click", function () { st.crit.push({ n: L("New criterion", "新标准"), w: 3, must: false }); persist(); render(); });
    function presetsUI() {
      $("dmPresets").innerHTML = Object.keys(PRESETS).map(function (k) { return '<button type="button" class="dtChip" data-p="' + k + '">' + esc(L(PRESETS[k][0][0], PRESETS[k][0][1])) + "</button>"; }).join("");
    }
    $("dmPresets").addEventListener("click", function (e) {
      var b = e.target.closest("[data-p]"); if (!b) return;
      st.crit = PRESETS[b.dataset.p][1].map(function (c) { return { n: zh() ? c[1] : c[0], w: c[2], must: false }; }); st.s = {};
      var q = $("dmQ"); if (q && !q.value) { q.value = L(PRESETS[b.dataset.p][0][0], PRESETS[b.dataset.p][0][1]); q.dispatchEvent(new Event("input", { bubbles: true })); }
      persist(); render();
    });
    on("laoyu:lang", function () { presetsUI(); render(); });
    on("laoyu:reset", function () { st = def(); persist(); render(); });
    presetsUI(); render();
  }

  document.addEventListener("DOMContentLoaded", function () { skills(); conversation(); escalation(); decision(); });
})();
