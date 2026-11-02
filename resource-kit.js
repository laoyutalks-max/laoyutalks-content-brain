/* =========================================================
   LAOYU — STANDARD RESOURCE DETAIL SECTIONS
   Builds the reusable sections on every resource page from
   resources-data.js: who it's for, what's included, setup steps,
   AI prompt (copy), downloads, expected output, limitations,
   solution path, related resources and feedback.
   Plus page-specific upgrades (prompt search, manpower hours
   & scenarios, KPI sample data & interpretation guide).
   ========================================================= */
(function () {
  "use strict";
  var D = window.LAOYU_DATA;
  if (!D) return;
  var LOG_URL = "https://script.google.com/macros/s/AKfycbyjk02ceJcMxwfuGGsnkwafQwP0tEkjoy7OWDhbnd3D_WUiu32qRJobGCNj2Tco__s6zg/exec";
  function zh() { return document.documentElement.getAttribute("data-lang") === "zh"; }
  function L(a) { return a ? (zh() ? a[1] : a[0]) : ""; }
  function T(en, cn) { return zh() ? cn : en; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function byId(id) { return D.resources.filter(function (r) { return r.id === id; })[0]; }
  var page = (location.pathname.split("/").pop() || "index.html").replace(".html", "");
  var R = byId(document.body.getAttribute("data-res") || page);
  if (!R || !R.kit) return;

  function copy(text, btn) {
    var done = function () { var o = btn.innerHTML; btn.textContent = T("COPIED ✓", "已复制 ✓"); setTimeout(function () { btn.innerHTML = o; }, 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { fb(); done(); }); else { fb(); done(); }
    function fb() { var t = document.createElement("textarea"); t.value = text; t.style.position = "fixed"; t.style.opacity = "0"; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch (e) {} t.remove(); }
  }

  /* ---------------- section builders ---------------- */
  function box(num, title, body, cls) {
    return '<section class="kitBox' + (cls ? " " + cls : "") + '"><h2><small>' + num + "</small>" + title + "</h2>" + body + "</section>";
  }
  function topHTML() {
    var k = R.kit;
    return '<div class="kitGrid">' +
      box("01", T("Problem", "问题"), "<p>" + esc(L(R.problem)) + "</p>") +
      box("02", T("Solution", "解决方案"), "<p>" + esc(L(R.desc)) + "</p>") +
      box("03", T("Who should use it", "适用对象"), "<p>" + esc(L(k.who)) + "</p>") +
      box("04", T("What's included", "包含内容"), "<ul>" + k.inc.map(function (x) { return "<li>" + esc(L(x)) + "</li>"; }).join("") + "</ul>") +
      "</div>";
  }
  function pathHTML() {
    var p = D.paths.filter(function (p) { return p.steps.some(function (s) { return s[0] === R.id; }); })[0];
    if (!p) return "";
    var i = p.steps.map(function (s) { return s[0]; }).indexOf(R.id), next = p.steps[i + 1];
    return box("", T("Solution path: ", "解决路径：") + esc(L(p.t)) + " · " + T("step " + (i + 1) + " of " + p.steps.length, "第 " + (i + 1) + " 步，共 " + p.steps.length + " 步"),
      "<ol>" + p.steps.map(function (s, j) { var r = byId(s[0]); return j === i ? '<li class="cur"><span>' + (j + 1) + ". " + esc(L(r.title)) + "</span></li>" : '<li><a href="' + r.url + '">' + (j + 1) + ". " + esc(L(r.title)) + "</a></li>"; }).join("") + "</ol>" +
      (next ? '<a class="btn orange" href="' + byId(next[0]).url + '">' + T("NEXT STEP: ", "下一步：") + esc(L(byId(next[0]).title)) + " →</a>" : '<a class="btn outline" href="resources.html#paths">' + T("SEE ALL PATHS →", "查看全部路径 →") + "</a>"), "kitPath");
  }
  function bottomHTML(startNum) {
    var k = R.kit, n = startNum;
    function num() { return String(n++).padStart(2, "0"); }
    var dl = downloads();
    var rel = D.resources.filter(function (r) { return r.id !== R.id && r.cats.some(function (c) { return R.cats.indexOf(c) > -1; }); })
      .sort(function (a, b) { return (b.id === R.demo) - (a.id === R.demo); }).slice(0, 3);
    var fbKey = "laoyuFeedback:" + R.id, done = null;
    try { done = localStorage.getItem(fbKey); } catch (e) {}
    return '<div class="kit">' +
      (startNum > 5 ? "" : "") +
      '<div class="kitGrid">' +
        box(num(), T("How to set it up", "如何上手"), '<ol class="kitSteps">' + k.steps.map(function (s) { return "<li><span>" + esc(L(s)) + "</span></li>"; }).join("") + "</ol>") +
        box(num(), T("Expected output", "预期结果"), "<p>" + esc(L(k.out)) + "</p>") +
      "</div>" +
      box(num(), T("AI prompt", "AI 提示词"), "<p>" + T("Copy this into ChatGPT, Gemini, Claude or Copilot. Replace the [brackets] with your own details.", "复制到 ChatGPT、Gemini、Claude 或 Copilot 中，把 [方括号] 换成你自己的信息。") + "</p><pre>" + esc(L(k.prompt)) + '</pre><button type="button" class="btn orange" data-kit-copy>' + T("COPY PROMPT", "复制提示词") + '</button><p class="plats">' + T("Works with any AI chat tool. Do not paste confidential or personal data.", "适用于任何 AI 聊天工具。请勿粘贴机密或个人数据。") + "</p>", "kitPrompt") +
      '<div class="kitGrid">' +
        box(num(), T("Downloads", "下载"), dl) +
        box(num(), T("Limitations & verification", "局限与验证"), "<p>" + esc(L(k.lim)) + "</p>", "warn") +
      "</div>" +
      pathHTML() +
      box(num(), T("Related resources", "相关资源"), '<div class="kitRel">' + rel.map(function (r) { return '<a href="' + r.url + '"><b>' + esc(L(r.title)) + "</b><span>" + esc(L(r.problem)) + "</span></a>"; }).join("") + "</div>") +
      box(num(), T("Was this useful?", "这个资源有用吗？"),
        done ? '<p class="fbThanks">' + T("Thanks for your feedback!", "谢谢你的反馈！") + "</p>" :
        '<div class="fb" data-fb><button type="button" class="fbBtn" data-v="up">👍 ' + T("Yes, useful", "有用") + '</button><button type="button" class="fbBtn" data-v="down">👎 ' + T("Not yet", "还不够") + '</button></div><div class="fbMore" hidden><label for="fbTxt">' + T("What would make it better? (optional)", "怎样能更好？（选填）") + '</label><textarea id="fbTxt" rows="2" maxlength="400"></textarea><button type="button" class="btn orange" data-fb-send>' + T("SEND FEEDBACK", "发送反馈") + "</button></div>") +
      "</div>";
  }
  function downloads() {
    var items = [];
    if (R.id === "production-kpi-dashboard") {
      items.push(['<a href="files/production-kpi-dashboard.xlsx" download>' + T("Excel dashboard (English)", "Excel 仪表板（英文版）") + "</a>"]);
      items.push(['<a href="files/production-kpi-dashboard-zh.xlsx" download>' + T("Excel dashboard (Chinese)", "Excel 仪表板（中文版）") + "</a>"]);
      items.push(['<a href="files/sample-production-data.csv" download>' + T("Sample production data, 14 days (CSV, synthetic)", "示例生产数据，14 天（CSV，模拟数据）") + "</a>"]);
    }
    if (R.formats.indexOf("csv") > -1 && R.id !== "production-kpi-dashboard") items.push([T("Export to Excel (CSV) with the button in the tool above.", "用上方工具里的按钮导出到 Excel（CSV）。")]);
    if (R.formats.indexOf("txt") > -1) items.push([T("Download the result as a text file with the button in the demo.", "用演示里的按钮把结果下载为文本文件。")]);
    if (R.formats.indexOf("print") > -1 || R.formats.indexOf("pdf") > -1) items.push(['<button type="button" class="btn outline" data-print>' + T("PRINT / SAVE AS PDF", "打印 / 另存为 PDF") + "</button>"]);
    if (R.formats.indexOf("copy") > -1) items.push([T("Copy the generated text with the COPY button.", "用“复制”按钮复制生成的文本。")]);
    return "<ul>" + items.map(function (i) { return "<li>" + i[0] + "</li>"; }).join("") + "</ul>";
  }

  /* ---------------- page-specific upgrades ---------------- */
  function promptSearch() {
    var cards = document.querySelectorAll(".panel.prompt");
    if (!cards.length) return;
    var CATS = { all: ["All", "全部"], report: ["Reporting", "报告"], kpi: ["KPIs & data", "KPI 与数据"], problem: ["Problem solving", "问题解决"], people: ["People & communication", "人员与沟通"], quality: ["Quality & audits", "质量与审核"] };
    var MAP = { report: "report", labreport: "report", kpi: "kpi", dashboard: "kpi", mistake: "problem", workflow: "problem", manpower: "people", email: "people", audit: "quality", verify: "quality" };
    var bar = document.createElement("div");
    bar.className = "panel ppBar";
    cards[0].parentNode.insertBefore(bar, cards[0]);
    var st = { q: "", c: "all" };
    function draw() {
      bar.innerHTML = '<div class="rlSearchSmall"><span aria-hidden="true">⌕</span><input type="search" id="ppQ" placeholder="' + T("Search prompts, e.g. report, audit, manpower", "搜索提示词，如：报告、审核、人力") + '" value="' + esc(st.q) + '"></div>' +
        '<div class="seg" style="margin-top:12px">' + Object.keys(CATS).map(function (k) { return '<button type="button" data-ppc="' + k + '" aria-pressed="' + (st.c === k) + '">' + esc(L(CATS[k])) + "</button>"; }).join("") + "</div>" +
        '<p class="resNote" style="margin:10px 0 0">' + T("Works with ChatGPT, Gemini, Claude and Microsoft Copilot. Fill every highlighted part before you paste.", "适用于 ChatGPT、Gemini、Claude 和 Microsoft Copilot。粘贴前请填写所有高亮部分。") + ' <span id="ppN"></span></p>';
      filter();
    }
    function filter() {
      var shown = 0;
      cards.forEach(function (c) {
        var ok = (st.c === "all" || MAP[c.id] === st.c) && (!st.q || c.textContent.toLowerCase().indexOf(st.q.toLowerCase()) > -1);
        c.style.display = ok ? "" : "none"; if (ok) shown++;
        if (!c.querySelector(".ppTag")) { var t = document.createElement("span"); t.className = "ppTag"; c.querySelector(".promptHead").appendChild(t); }
        c.querySelector(".ppTag").textContent = L(CATS[MAP[c.id]] || CATS.all);
      });
      var nEl = document.getElementById("ppN"); if (nEl) nEl.textContent = T(shown + " of " + cards.length + " prompts shown.", "显示 " + shown + " / " + cards.length + " 个提示词。");
    }
    bar.addEventListener("input", function (e) { if (e.target.id === "ppQ") { st.q = e.target.value; filter(); } });
    bar.addEventListener("click", function (e) { var b = e.target.closest("[data-ppc]"); if (!b) return; st.c = b.dataset.ppc; draw(); });
    document.addEventListener("laoyu:lang", draw);
    draw();
  }
  function promptExample() {
    return box("", T("Worked example (prompt 01)", "完整示例（提示词 01）"),
      "<p><b>" + T("Input guidance:", "填写指引：") + "</b> " + T("give numbers, not adjectives; say what 'good' looks like; remove names and customer details.", "写数字而不是形容词；说明“好”的标准是什么；删除人名和客户信息。") + "</p>" +
      "<p><b>" + T("Example input:", "示例输入：") + "</b> " + T("Line 3, target 1,200, actual 1,046, scrap 31 (scratches at station 4), downtime 45 min conveyor motor trip + 20 min waiting for material, 2 operators absent.", "3 号线，目标 1,200，实际 1,046，报废 31（4 号工位刮伤），停机：输送带电机跳闸 45 分钟 + 等料 20 分钟，2 名操作员缺勤。") + "</p>" +
      "<p><b>" + T("Expected output:", "预期输出：") + "</b> " + T("a 5-line report: 87% of target (−154), main loss conveyor trip, scrap 3.0% at station 4, manpower short by 2, and 2–3 follow-up actions with owners.", "一份 5 行报告：达成目标 87%（−154），主要损失是输送带跳闸，4 号工位报废率 3.0%，少 2 人，以及 2–3 个有负责人的跟进行动。") + "</p>" +
      '<p><a href="demo-daily-report.html">' + T("See it as an interactive demo →", "查看交互演示 →") + "</a></p>", "kitExtra");
  }
  function manpowerExtra() {
    return box("", T("Hours view: workload, utilisation & scenarios", "工时视图：工作量、利用率与情景"),
      "<p>" + T("Check the gap in hours, not just heads, then test what happens if more people are absent or you add overtime.", "用工时而不仅是人头来看缺口，再测试更多人缺勤或增加加班时会怎样。") + "</p>" +
      '<div class="fldGrid">' +
        '<div class="fld"><label for="mhUnits">' + T("Units to produce this shift", "本班需生产数量") + '</label><input id="mhUnits" type="number" value="1100"></div>' +
        '<div class="fld"><label for="mhStd">' + T("Standard minutes per unit (labour)", "每件标准工时（分钟）") + '</label><input id="mhStd" type="number" step="any" value="4.5"></div>' +
        '<div class="fld"><label for="mhPeople">' + T("People present", "到岗人数") + '</label><input id="mhPeople" type="number" value="12"></div>' +
        '<div class="fld"><label for="mhHours">' + T("Paid hours per person", "每人计薪工时") + '</label><input id="mhHours" type="number" step="any" value="8"></div>' +
        '<div class="fld"><label for="mhEff">' + T("Realistic efficiency (%)", "实际效率（%）") + '</label><input id="mhEff" type="number" value="85"></div>' +
        '<div class="fld"><label for="mhAbs">' + T("Scenario: extra absences", "情景：额外缺勤") + '</label><input id="mhAbs" type="range" min="0" max="5" value="0"><output id="mhAbsO">0</output></div>' +
        '<div class="fld"><label for="mhOt">' + T("Scenario: overtime hours added", "情景：增加的加班工时") + '</label><input id="mhOt" type="range" min="0" max="24" value="0"><output id="mhOtO">0</output></div>' +
      '</div><div class="mpKpis" id="mhOut"></div>' +
      '<p class="resNote">' + T("Competency constraint: hours only help if the people are qualified for the station. Check the ", "能力限制：只有人员具备该岗位资格，工时才有用。调人前请查看") + '<a href="skills-matrix.html">' + T("Team Skills Matrix", "团队技能矩阵") + "</a>" + T(" before moving anyone.", "。") + "</p>", "kitExtra");
  }
  function manpowerCalc() {
    var g = function (id) { var e = document.getElementById(id); return e ? parseFloat(e.value) : NaN; };
    var out = document.getElementById("mhOut"); if (!out) return;
    var units = g("mhUnits"), std = g("mhStd"), ppl = g("mhPeople"), hrs = g("mhHours"), eff = g("mhEff") / 100, abs = g("mhAbs") || 0, ot = g("mhOt") || 0;
    document.getElementById("mhAbsO").textContent = abs; document.getElementById("mhOtO").textContent = ot;
    if (![units, std, ppl, hrs, eff].every(function (x) { return isFinite(x) && x >= 0; }) || !(eff > 0) || !(hrs > 0)) {
      out.innerHTML = '<p class="resNote">' + T("Enter units, standard minutes, people, hours and efficiency (all above zero) to see the result.", "请填写产量、标准工时、人数、工时和效率（都需大于 0）以查看结果。") + "</p>";
      return;
    }
    var need = units * std / 60, avail = (Math.max(0, ppl - abs) * hrs + ot) * eff, util = avail > 0 ? need / avail : 0, gapH = need - avail, gapP = gapH > 0 && hrs > 0 ? Math.ceil(gapH / (hrs * eff)) : 0;
    out.innerHTML =
      '<div class="atChip"><b>' + need.toFixed(1) + "</b><span>" + T("Workload hours needed", "需要的工作工时") + "</span></div>" +
      '<div class="atChip"><b>' + avail.toFixed(1) + "</b><span>" + T("Available effective hours", "可用有效工时") + "</span></div>" +
      '<div class="atChip ' + (util > 1 ? "bad" : util > 0.95 ? "" : "ok") + '"><b>' + Math.round(util * 100) + "%</b><span>" + T("Utilisation", "利用率") + "</span></div>" +
      '<div class="atChip ' + (gapH > 0 ? "bad" : "ok") + '"><b>' + (gapH > 0 ? "−" + gapH.toFixed(1) : "+" + (-gapH).toFixed(1)) + T(" h", " 小时") + "</b><span>" + (gapH > 0 ? T("Short ≈ " + gapP + " people", "缺约 " + gapP + " 人") : T("Spare capacity", "富余产能")) + "</span></div>";
  }
  function kpiExtra() {
    return box("", T("Interpretation guide & downtime analysis", "解读指引与停机分析"),
      "<ul><li><b>" + T("Achievement below 95% for 3+ days:", "连续 3 天以上达成率低于 95%：") + "</b> " + T("look at the downtime Pareto first; it usually explains most of the gap.", "先看停机柏拉图，它通常能解释大部分差距。") + "</li>" +
      "<li><b>" + T("OEE falling while achievement is OK:", "达成率正常但 OEE 下降：") + "</b> " + T("you are making the numbers with overtime or extra people. Check performance and short stops.", "说明你是靠加班或加人完成的。请检查性能和短停。") + "</li>" +
      "<li><b>" + T("Scrap spikes on certain days:", "某些日子报废率突增：") + "</b> " + T("compare with changeovers, new material lots and shift patterns.", "与换线、新材料批次和班次安排对比。") + "</li>" +
      "<li><b>" + T("Top downtime reason above 30% of all minutes:", "最大停机原因占全部分钟数 30% 以上：") + "</b> " + T("make it a named improvement project with an owner.", "把它立为有负责人的改善项目。") + "</li></ul>" +
      "<p><b>" + T("Suggested follow-up questions for your team:", "可以问团队的追问问题：") + "</b></p><ul><li>" + T("What happened in the first hour of the worst day?", "最差的那天，第一个小时发生了什么？") + "</li><li>" + T("Which downtime reason keeps coming back, and why has it not been fixed?", "哪个停机原因反复出现？为什么一直没解决？") + "</li><li>" + T("What would we need to hit target every day next week?", "下周要每天达标，我们需要什么？") + "</li></ul>", "kitExtra");
  }

  /* ---------------- mount ---------------- */
  function mount() {
    var demo = document.querySelector("[data-kit='bottom']");
    var host;
    if (demo) {
      var top = document.querySelector("[data-kit='top']");
      if (top) top.innerHTML = topHTML();
      demo.innerHTML = bottomHTML(6);
      host = demo;
    } else {
      var gated = document.querySelector(".gated");
      if (!gated) return;
      host = document.getElementById("kitHost");
      if (!host) { host = document.createElement("div"); host.id = "kitHost"; var rel = gated.querySelector(".resRelated"); gated.insertBefore(host, rel || null); }
      var extra = R.kit.extra === "manpower" ? manpowerExtra() : R.kit.extra === "kpi" ? kpiExtra() : R.id === "ai-prompt-pack" ? promptExample() : "";
      host.innerHTML = '<div class="kit">' + extra + topHTML() + "</div>" + bottomHTML(5);
      if (R.kit.extra === "manpower") manpowerCalc();
    }
    host.setAttribute("data-i18n-block", "");
  }

  /* ---------------- preview beside the sign-up form ---------------- */
  function gatePeek() {
    var gate = document.querySelector(".gate");
    if (!gate || gate.hidden || document.documentElement.classList.contains("isUnlocked") || document.querySelector(".gatePeek")) return;
    var b = function (a) { return '<span class="en">' + esc(a[0]) + '</span><span class="zh">' + esc(a[1]) + "</span>"; };
    var img = function (lg) { return '<img class="' + lg + '" src="assets/previews/' + R.id + "-" + lg + '.jpg" alt="' + esc(R.title[lg === "en" ? 0 : 1]) + '" width="680" height="427" loading="eager">'; };
    var row = document.createElement("div");
    row.className = "gateRow";
    row.setAttribute("data-i18n-block", "");
    row.innerHTML =
      '<aside class="gatePeek panel">' +
        '<div class="gpImg">' + img("en") + img("zh") + '<span class="gpTag">' + b(["PREVIEW", "预览"]) + "</span></div>" +
        '<p class="gpProb">' + b(R.problem) + "</p>" +
        '<h3 class="gpH">' + b(["What you get", "你将获得"]) + "</h3>" +
        '<ul class="gpList">' + R.kit.inc.map(function (i) { return "<li>" + b(i) + "</li>"; }).join("") + "</ul>" +
        '<p class="gpMeta">' + b(["Free · Time needed: " + R.setup[0] + " · One sign-up opens all 16 tools", "免费 · 所需时间：" + R.setup[1] + " · 注册一次，16 个工具全部开放"]) + "</p>" +
      "</aside>";
    gate.parentNode.insertBefore(row, gate);
    row.appendChild(gate);
  }

  document.addEventListener("DOMContentLoaded", function () {
    gatePeek();
    mount();
    if (R.id === "ai-prompt-pack") promptSearch();
    document.addEventListener("laoyu:lang", mount);
    document.addEventListener("input", function (e) { if (e.target.id && e.target.id.indexOf("mh") === 0) manpowerCalc(); });
    document.addEventListener("click", function (e) {
      var c = e.target.closest("[data-kit-copy]");
      if (c) { copy(L(R.kit.prompt), c); return; }
      var f = e.target.closest(".fbBtn");
      if (f) {
        document.querySelectorAll(".fbBtn").forEach(function (b) { b.classList.toggle("on", b === f); });
        var more = document.querySelector(".fbMore"); if (more) { more.hidden = false; more.dataset.v = f.dataset.v; }
        return;
      }
      var s = e.target.closest("[data-fb-send]");
      if (s) {
        var more2 = document.querySelector(".fbMore"), txt = (document.getElementById("fbTxt") || {}).value || "";
        try {
          fetch(LOG_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify({ type: "feedback", session: "fb-" + Date.now().toString(36), page: page + ".html", lang: zh() ? "zh" : "en",
              question: "[FEEDBACK " + (more2.dataset.v === "up" ? "+1" : "-1") + "] " + R.id + (txt ? ": " + txt.slice(0, 400) : ""), topic: "feedback", answered: true, hp: "" }) }).catch(function () {});
        } catch (err) {}
        try { localStorage.setItem("laoyuFeedback:" + R.id, more2.dataset.v); } catch (err) {}
        s.closest("section").querySelector("h2").insertAdjacentHTML("afterend", '<p class="fbThanks">' + T("Thanks for your feedback!", "谢谢你的反馈！") + "</p>");
        s.closest(".fbMore").remove(); var fbx = document.querySelector("[data-fb]"); if (fbx) fbx.remove();
      }
    });
  });
})();
