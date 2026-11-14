/* LAOYU — homepage "Try it now": quick OEE check + prompt playground.
   Runs fully in the browser. Nothing typed here is sent anywhere. */
(function () {
  "use strict";
  function zh() { return document.documentElement.getAttribute("data-lang") === "zh"; }
  function T(en, cn) { return zh() ? cn : en; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function $(id) { return document.getElementById(id); }

  /* ---------- Quick OEE check ---------- */
  var oee = { sched: "480", down: "45", rate: "120", total: "780", good: "752" };
  var FIELDS = [
    ["sched", ["Scheduled time (min)", "计划生产时间（分钟）"], 1440, false],
    ["down", ["Downtime (min)", "停机时间（分钟）"], 0, true],
    ["rate", ["Ideal rate (pieces / hour)", "理想速度（件 / 小时）"], 100000, false],
    ["total", ["Total pieces", "总产量（件）"], 1000000, false],
    ["good", ["Good pieces", "合格品（件）"], 0, true]
  ];
  function num(v) { var s = String(v).trim(); if (s === "") return NaN; var n = Number(s); return isFinite(n) ? n : NaN; }
  function pct(x) { return (Math.round(x * 1000) / 10).toFixed(1) + "%"; }

  function calc() {
    var s = num(oee.sched), d = num(oee.down), r = num(oee.rate), t = num(oee.total), g = num(oee.good);
    if (!(s > 0)) return { err: T("Enter the scheduled time in minutes.", "请输入计划生产时间（分钟）。") };
    if (isNaN(d) || d < 0) return { err: T("Enter the downtime in minutes (0 if none).", "请输入停机时间（分钟），没有就填 0。") };
    if (d > s) return { err: T("Downtime can't be longer than the scheduled time.", "停机时间不能超过计划生产时间。") };
    if (d === s) return { err: T("The line did not run at all, so OEE is 0%.", "产线完全没有运行，OEE 为 0%。"), zero: true };
    if (!(r > 0)) return { err: T("Enter the ideal rate in pieces per hour.", "请输入理想速度（件 / 小时）。") };
    if (!(t > 0)) return { err: T("Enter the total pieces produced.", "请输入总产量。") };
    if (isNaN(g) || g < 0) return { err: T("Enter the number of good pieces.", "请输入合格品数量。") };
    if (g > t) return { err: T("Good pieces can't be more than total pieces.", "合格品不能多于总产量。") };
    var A = (s - d) / s, rawP = t / ((s - d) / 60 * r), P = Math.min(rawP, 1), Q = g / t;
    return { A: A, P: P, Q: Q, O: A * P * Q, over: rawP > 1.0005 };
  }

  function oeeCard() {
    var box = $("hOee"); if (!box) return;
    var rows = FIELDS.map(function (f) {
      var k = f[0], id = "oq-" + k;
      var slider = f[3] ? '<input type="range" min="0" step="1" data-k="' + k + '" data-slider aria-label="' + esc(T(f[1][0], f[1][1])) + '">' : "";
      return '<div class="tryF' + (f[3] ? " hasS" : "") + '"><label for="' + id + '">' + esc(T(f[1][0], f[1][1])) + "</label>" + slider +
        '<input id="' + id + '" type="number" inputmode="decimal" min="0" step="any" data-k="' + k + '" value="' + esc(oee[k]) + '"></div>';
    }).join("");
    box.innerHTML =
      '<div class="tryHead"><small>' + T("CALCULATOR · NO SIGN-UP", "计算器 · 免注册") + "</small>" +
      "<h3>" + T("Quick OEE check", "OEE 快速计算") + "</h3>" +
      "<p>" + T("Enter one shift's numbers. OEE updates as you type.", "输入一个班次的数据，OEE 会随输入即时更新。") + "</p></div>" +
      '<div class="oqGrid"><div class="oqIn">' + rows + "</div>" +
      '<div class="oqOut" aria-live="polite">' +
        '<div class="oqGauge"><svg viewBox="0 0 200 112" role="img" aria-label="OEE"><path class="g0" d="M14 100 A86 86 0 0 1 186 100" pathLength="100"/><path class="g1" d="M14 100 A86 86 0 0 1 186 100" pathLength="100"/></svg>' +
        '<div class="oqNum"><b></b><span>OEE</span></div></div>' +
        '<p class="oqBand"></p>' +
        '<div class="oqBars">' +
          '<div data-b="A"><span>' + T("Availability", "时间稼动率") + "</span><i><u></u></i><b></b></div>" +
          '<div data-b="P"><span>' + T("Performance", "性能稼动率") + "</span><i><u></u></i><b></b></div>" +
          '<div data-b="Q"><span>' + T("Quality", "良品率") + "</span><i><u></u></i><b></b></div>" +
        "</div>" +
        '<p class="oqMsg"></p>' +
      "</div></div>" +
      '<a class="tryMore" href="oee-loss-calculator.html">' + T("Full OEE Loss Calculator: lost minutes, units and cost →", "完整版 OEE 损失计算器：损失的分钟、件数和成本 →") + "</a>";
    oeeUpdate();
  }

  function oeeUpdate() {
    var box = $("hOee"); if (!box || !box.firstChild) return;
    var s = num(oee.sched), t = num(oee.total);
    box.querySelectorAll("[data-slider]").forEach(function (sl) {
      var k = sl.getAttribute("data-k"), max = k === "down" ? s : t, v = num(oee[k]);
      sl.max = max > 0 ? String(Math.round(max)) : "0";
      sl.value = isNaN(v) ? "0" : String(Math.min(Math.max(v, 0), max > 0 ? max : 0));
      sl.disabled = !(max > 0);
    });
    var r = calc(), out = box.querySelector(".oqOut"), numB = box.querySelector(".oqNum b"), band = box.querySelector(".oqBand"), msg = box.querySelector(".oqMsg"), arc = box.querySelector(".g1");
    var ok = !r.err, O = ok ? r.O : (r.zero ? 0 : null);
    var lvl = O === null ? "" : O >= 0.85 ? "ok" : O >= 0.6 ? "warn" : "bad";
    out.className = "oqOut " + lvl;
    numB.textContent = O === null ? "–" : pct(O);
    arc.style.strokeDasharray = (O === null ? 0 : Math.max(0, Math.min(100, O * 100))) + " 100";
    band.textContent = !ok ? "" : lvl === "ok" ? T("World-class level (85% or more).", "世界级水平（85% 以上）。")
      : lvl === "warn" ? T("Typical for many plants. Real capacity is hiding in the losses.", "很多工厂的常见水平，损失里藏着可观的产能。")
      : T("Low. Start with the biggest loss below.", "偏低。先从下面最大的损失入手。");
    var low = ok ? Math.min(r.A, r.P, r.Q) : null;
    ["A", "P", "Q"].forEach(function (k) {
      var row = box.querySelector('[data-b="' + k + '"]');
      row.querySelector("b").textContent = ok ? pct(r[k]) : "–";
      row.querySelector("u").style.width = ok ? Math.round(r[k] * 100) + "%" : "0";
      row.classList.toggle("low", ok && r[k] === low && low < 1);
    });
    var text = "";
    if (!ok) text = r.err;
    else {
      var names = { A: T("Availability (downtime)", "时间稼动率（停机）"), P: T("Performance (speed)", "性能稼动率（速度）"), Q: T("Quality (rejects)", "良品率（不良品）") };
      var worst = r.A === low ? "A" : r.P === low ? "P" : "Q";
      text = low < 1 ? T("Biggest loss: ", "最大损失：") + names[worst] + T(".", "。") : T("No losses entered.", "没有录入任何损失。");
      if (r.over) text += " " + T("Output is above the ideal rate, so performance is capped at 100%. Check the ideal rate.", "产量高于理想速度，性能稼动率按 100% 计算。请检查理想速度。");
    }
    msg.textContent = text;
    msg.classList.toggle("isErr", !ok);
  }

  /* ---------- Prompt playground ---------- */
  var pp = { draft: "", ran: false, busy: false };
  var PARTS = [
    ["role", ["Role", "角色"], /\b(act as|you are|as an?\s+\w+|your role)\b|你是|作为|扮演|假设你/i],
    ["context", ["Context", "背景"], /\b(context|background|because|currently|situation|our (team|line|plant|factory|department|shift)|my (team|line|plant|factory|department|shift)|we (have|had|are|run|make))\b|背景|目前|我们|情况|我的(团队|产线|工厂|部门)/i],
    ["task", ["Task", "任务"], /\b(write|summari[sz]e|analy[sz]e|create|draft|list|explain|compare|generate|review|plan|translate|calculate|rewrite|suggest|identify|prepare|give me|help me|make)\b|写|总结|分析|列出|解释|生成|制定|翻译|计算|建议|找出|准备|帮我/i],
    ["format", ["Format", "格式"], /\b(table|bullets?|bullet points?|numbered|steps?|format|words|sentences?|paragraphs?|json|headings?|columns?|checklist)\b|表格|要点|步骤|格式|清单|字以内|段落/i],
    ["limits", ["Constraints", "限制"], /\b(must|should not|don't|do not|avoid|only|at most|no more than|max(imum)?|under \d+|within|limit|tone|keep it|plain language)\b|不要|必须|只|不超过|以内|语气|限制|避免/i]
  ];
  function analyse(text) {
    var has = {}; PARTS.forEach(function (p) { has[p[0]] = p[2].test(text); });
    return has;
  }
  /* Returns pieces: plain strings and {ph: "..."} placeholders the user should fill in */
  function improve(text, has) {
    var d = text.replace(/\s+/g, " ").trim();
    if (!/[.!?。！？]$/.test(d)) d += T(".", "。");
    var L = [];
    if (!has.role) L.push([T("Act as ", "请扮演"), { ph: T("an experienced production manager in a manufacturing plant", "一位经验丰富的制造业生产经理") }, T(".", "。")]);
    if (!has.context) L.push([T("Context: ", "背景："), { ph: T("your line or department, the product, and what happened", "你的产线或部门、产品，以及发生了什么") }, T(".", "。")]);
    L.push([(has.role && has.context && has.format && has.limits ? "" : T("Task: ", "任务：")) + d]);
    if (!has.format) L.push([T("Format: ", "格式："), { ph: T("a table, 5 bullet points, or a short email", "表格、5 个要点，或一封简短邮件") }, T(".", "。")]);
    if (!has.limits) L.push([T("Constraints: ", "限制："), { ph: T("under 150 words, plain language, facts only", "150 字以内，语言简洁，只讲事实") }, T(".", "。")]);
    L.push([T("If anything is unclear, ask me up to 3 questions before you answer.", "如有不清楚的地方，请先问我最多 3 个问题再回答。")]);
    return L;
  }
  function asHtml(lines) {
    return lines.map(function (l) { return l.map(function (x) { return typeof x === "string" ? esc(x) : "<mark>[" + esc(x.ph) + "]</mark>"; }).join(""); }).join("\n");
  }
  function asText(lines) {
    return lines.map(function (l) { return l.map(function (x) { return typeof x === "string" ? x : "[" + x.ph + "]"; }).join(""); }).join("\n");
  }

  function ppCard() {
    var box = $("hPp"); if (!box) return;
    box.innerHTML =
      '<div class="tryHead"><small>' + T("AI PROMPT · NO SIGN-UP", "AI 提示词 · 免注册") + ' <span class="bAi">' + T("SIMULATED AI", "模拟 AI") + "</span></small>" +
      "<h3>" + T("Prompt playground", "提示词练习场") + "</h3>" +
      "<p>" + T("Paste a draft prompt. See what is missing and get a stronger version.", "粘贴一条提示词草稿，看看缺了什么，并得到更完整的版本。") + "</p></div>" +
      '<label class="sr" for="ppIn">' + T("Your draft prompt", "你的提示词草稿") + "</label>" +
      '<textarea id="ppIn" rows="4" maxlength="1500" placeholder="' + T("e.g. write a report about downtime", "例如：写一份停机报告") + '">' + esc(pp.draft) + "</textarea>" +
      '<div class="tryAct"><button type="button" class="btn orange" data-pp-run>' + T("SIMULATE AI RESPONSE", "模拟 AI 回复") + "</button>" +
      '<button type="button" class="tryLink" data-pp-ex>' + T("Try an example", "试试示例") + "</button></div>" +
      '<p class="oqMsg isErr" id="ppErr" role="alert" hidden></p>' +
      '<div class="ppOut" id="ppOut" aria-live="polite" hidden></div>' +
      '<p class="tryNote">' + T("Runs in your browser with fixed rules. This is not a live AI, and nothing you type is sent anywhere.", "在你的浏览器中按固定规则运行。这不是真正的 AI，你输入的内容不会被发送到任何地方。") + "</p>" +
      '<a class="tryMore" href="ai-prompt-pack.html">' + T("AI Prompt Pack: 10 tested prompts for operations managers →", "AI 提示词包：10 条经过验证的运营管理提示词 →") + "</a>";
    if (pp.ran && pp.draft.trim()) ppShow();
  }
  function ppShow() {
    var out = $("ppOut"); if (!out) return;
    var has = analyse(pp.draft), lines = improve(pp.draft, has), n = PARTS.filter(function (p) { return has[p[0]]; }).length;
    out.innerHTML =
      '<p class="ppScore">' + (n === PARTS.length
        ? T("Your draft already covers all 5 parts of a strong prompt.", "你的草稿已经包含一条好提示词的全部 5 个部分。")
        : T("Your draft covers " + n + " of 5 parts of a strong prompt. The missing parts are added below.", "你的草稿包含一条好提示词 5 个部分中的 " + n + " 个，缺少的部分已补在下面。")) + "</p>" +
      '<ul class="ppParts">' + PARTS.map(function (p) {
        return '<li class="' + (has[p[0]] ? "on" : "off") + '"><i aria-hidden="true">' + (has[p[0]] ? "✓" : "+") + "</i>" + esc(T(p[1][0], p[1][1])) +
          '<span class="sr"> ' + (has[p[0]] ? T("found", "已有") : T("added", "已补充")) + "</span></li>";
      }).join("") + "</ul>" +
      "<small>" + T("OPTIMIZED PROMPT (PREVIEW)", "优化后的提示词（预览）") + "</small>" +
      '<pre class="ppPre" id="ppPre" tabindex="0">' + asHtml(lines) + "</pre>" +
      '<div class="tryAct"><button type="button" class="btn outline" data-pp-copy>' + T("COPY", "复制") + "</button>" +
      '<span class="ppTip">' + (n === PARTS.length ? T("Paste it into ChatGPT, Gemini or Claude.", "粘贴到 ChatGPT、Gemini 或 Claude 中使用。") : T("Replace the highlighted parts, then paste it into ChatGPT, Gemini or Claude.", "替换高亮部分后，粘贴到 ChatGPT、Gemini 或 Claude 中使用。")) + "</span></div>";
    out.hidden = false;
    out._text = asText(lines);
  }
  function ppErr(m) { var e = $("ppErr"); if (!e) return; e.textContent = m || ""; e.hidden = !m; }
  function ppRun() {
    if (pp.busy) return;
    var ta = $("ppIn"); pp.draft = ta.value;
    if (!pp.draft.trim()) { pp.ran = false; $("ppOut").hidden = true; ppErr(T("Paste or type a draft prompt first.", "请先粘贴或输入一条提示词草稿。")); ta.focus(); return; }
    /* Chinese says more per character, so it needs fewer of them */
    if (pp.draft.trim().length < (/[一-鿿]/.test(pp.draft) ? 4 : 8)) { pp.ran = false; $("ppOut").hidden = true; ppErr(T("That is too short to check. Write at least a few words.", "内容太短，无法检查。请至少写几个词。")); ta.focus(); return; }
    ppErr("");
    var btn = $("hPp").querySelector("[data-pp-run]");
    pp.busy = true; btn.disabled = true; btn.textContent = T("CHECKING…", "正在检查…");
    setTimeout(function () {
      pp.busy = false; pp.ran = true;
      var b = $("hPp").querySelector("[data-pp-run]");
      if (b) { b.disabled = false; b.textContent = T("SIMULATE AI RESPONSE", "模拟 AI 回复"); }
      ppShow();
    }, 450);
  }
  function ppCopy(btn) {
    var out = $("ppOut"), text = out && out._text; if (!text) return;
    var done = function (ok) {
      btn.textContent = ok ? T("COPIED ✓", "已复制 ✓") : T("SELECT AND COPY", "请手动选择复制");
      if (!ok) { var pre = $("ppPre"), r = document.createRange(); r.selectNodeContents(pre); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
      setTimeout(function () { if (btn.isConnected) btn.textContent = T("COPY", "复制"); }, 2000);
    };
    try { navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); }); }
    catch (e) { done(false); }
  }

  function head() {
    var h = $("hTryHead"); if (!h) return;
    h.innerHTML = '<h2 class="hubH">' + T("Try it now", "马上试试") + '</h2><a href="resources.html" data-open-tools>' + T("ALL TOOLS →", "全部工具 →") + "</a>";
  }
  function all() { head(); oeeCard(); ppCard(); }

  document.addEventListener("DOMContentLoaded", function () {
    if (!$("hOee") || !$("hPp")) return;
    $("hOee").addEventListener("input", function (e) {
      var el = e.target, k = el.getAttribute && el.getAttribute("data-k"); if (!k) return;
      oee[k] = el.value;
      if (el.hasAttribute("data-slider")) { var n = $("oq-" + k); if (n) n.value = el.value; }
      oeeUpdate();
    });
    $("hPp").addEventListener("input", function (e) { if (e.target.id === "ppIn") { pp.draft = e.target.value; if ($("ppErr") && !$("ppErr").hidden) ppErr(""); } });
    $("hPp").addEventListener("click", function (e) {
      if (e.target.closest("[data-pp-run]")) return ppRun();
      if (e.target.closest("[data-pp-ex]")) {
        var ta = $("ppIn");
        ta.value = pp.draft = T("write a report about downtime on line 3", "写一份 3 号线的停机报告");
        ppErr(""); ppRun(); return;
      }
      var c = e.target.closest("[data-pp-copy]"); if (c) ppCopy(c);
    });
    document.addEventListener("laoyu:lang", all);
    all();
  });
})();
