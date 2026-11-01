/* =========================================================
   LAOYU AI TOOLS — 5 working tools (run fully in the browser)
   Excel Formula Assistant · Meeting Minutes Generator ·
   CAPA Action Planner · Downtime Analysis Assistant ·
   Email Writing Assistant
   Each tool: Example, Reset, Copy (+ Download where useful).
   No AI API is called; nothing leaves the visitor's browser.
   Future AI hook: window.LAOYU_AI_ENDPOINT (see README note).
   ========================================================= */
(function () {
  "use strict";
  function zh() { return document.documentElement.getAttribute("data-lang") === "zh"; }
  function L(en, cn) { return zh() ? cn : en; }
  function $(id) { return document.getElementById(id); }
  function v(id) { var e = $(id); return e ? e.value.trim() : ""; }
  function set(id, val) { var e = $(id); if (e) { e.value = val; e.dispatchEvent(new Event("input", { bubbles: true })); } }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function ul(a, cls) { return a.length ? "<ul" + (cls ? ' class="' + cls + '"' : "") + ">" + a.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>" : ""; }
  function addDays(n) { var d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
  function textOf(el) {
    var out = [];
    el.querySelectorAll("h3, li, p, tr, .formulaOut, pre").forEach(function (n) {
      if (n.closest("tr") && n.tagName !== "TR") return;
      if (n.tagName === "H3") out.push("\n" + n.textContent.trim().toUpperCase());
      else if (n.tagName === "LI") out.push("• " + n.textContent.trim());
      else if (n.tagName === "TR") out.push(Array.prototype.map.call(n.children, function (c) { return c.textContent.trim(); }).join(" | "));
      else out.push(n.textContent.trim());
    });
    return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  }
  function copy(text, btn) {
    var done = function () { var o = btn.innerHTML; btn.textContent = L("COPIED ✓", "已复制 ✓"); setTimeout(function () { btn.innerHTML = o; }, 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { fb(); done(); }); else { fb(); done(); }
    function fb() { var t = document.createElement("textarea"); t.value = text; t.style.position = "fixed"; t.style.opacity = "0"; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); } catch (e) {} t.remove(); }
  }
  function download(name, text) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + text], { type: "text/plain;charset=utf-8" }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
  }
  /* Shared wiring: Example / Reset / Copy / Download + live re-run */
  function wire(o) {
    var out = $(o.out);
    function run() { out.innerHTML = o.run(); out.dataset.ran = "1"; }
    $("tEx").addEventListener("click", function () { o.example(); run(); });
    $("tReset").addEventListener("click", function () {
      document.querySelectorAll(".toolForm input, .toolForm textarea").forEach(function (e) { if (e.type === "checkbox") e.checked = false; else e.value = ""; });
      document.querySelectorAll(".toolForm select").forEach(function (s) { s.selectedIndex = 0; });
      try { localStorage.removeItem("laoyuRes:" + (location.pathname.split("/").pop() || "").replace(".html", "")); } catch (e) {}
      out.innerHTML = '<p class="resNote">' + L("Fill in the form or press EXAMPLE.", "填写表单或点击“示例”。") + "</p>"; out.dataset.ran = "";
      if (o.reset) o.reset();
    });
    if ($("tGo")) $("tGo").addEventListener("click", run);
    $("tCopy").addEventListener("click", function () { copy(o.copyText ? o.copyText() : textOf(out), $("tCopy")); });
    if ($("tDl")) $("tDl").addEventListener("click", function () { download(o.file || "laoyu-tool.txt", o.copyText ? o.copyText() : textOf(out)); });
    if (o.live) document.addEventListener("input", function (e) { if (e.target.closest(".toolForm")) run(); });
    document.addEventListener("change", function (e) { if (e.target.closest(".toolForm") && o.live) run(); });
    document.addEventListener("laoyu:lang", function () { if (out.dataset.ran || o.live) run(); if (o.relabel) o.relabel(); });
    setTimeout(function () { if (o.live) run(); }, 80);
  }

  /* =======================================================
     1. EXCEL FORMULA ASSISTANT
     ======================================================= */
  var FX = {
    lookup:   { t: ["Find a value in another table", "从另一张表查找数值"], a: "A2:B500", b: "F2", c: "", f: function (a, b) { return "=XLOOKUP(" + b + ", INDEX(" + a + ",,1), INDEX(" + a + ",,2), \"" + L("Not found", "未找到") + "\")"; }, w: ["Looks up the value in the first column of the range and returns the matching value from the second column.", "在范围第一列查找该值，返回第二列的对应值。"], s: [["Older Excel without XLOOKUP: =VLOOKUP(F2, A2:B500, 2, FALSE)", "旧版 Excel 没有 XLOOKUP：=VLOOKUP(F2, A2:B500, 2, FALSE)"], ["Google Sheets supports XLOOKUP too.", "Google Sheets 同样支持 XLOOKUP。"]] },
    countif:  { t: ["Count rows that match", "统计符合条件的行数"], a: "D2:D500", b: ["\"Downtime\"", "\"停机\""], c: "", f: function (a, b) { return "=COUNTIF(" + a + ", " + b + ")"; }, w: ["Counts the cells in the range equal to the condition.", "统计范围内等于条件的单元格数量。"], s: [["Text needs quotes, cells don't: \"Scrap\" or H1.", "文字要加引号，单元格引用不用：\"报废\" 或 H1。"], ["Use \">30\" for values above 30.", "大于 30 用 \">30\"。"]] },
    countifs: { t: ["Count with two conditions", "按两个条件统计"], a: ["B2:B500,\"Line 3\"", "B2:B500,\"3号线\""], b: ["C2:C500,\"Night\"", "C2:C500,\"夜班\""], c: "", f: function (a, b) { return "=COUNTIFS(" + a + ", " + b + ")"; }, w: ["Counts rows where both conditions are true.", "统计两个条件同时满足的行数。"], s: [["Each condition is a pair: range, criteria.", "每个条件是一对：范围、条件。"]] },
    sumifs:   { t: ["Sum with conditions", "按条件求和"], a: "E2:E500", b: ["B2:B500,\"Line 3\",C2:C500,\"Night\"", "B2:B500,\"3号线\",C2:C500,\"夜班\""], c: "", f: function (a, b) { return "=SUMIFS(" + a + ", " + b + ")"; }, w: ["Adds up the first range where all conditions are true.", "在所有条件都满足时，对第一个范围求和。"], s: [["All ranges must be the same size.", "所有范围大小必须一致。"]] },
    average:  { t: ["Average with a condition", "按条件求平均"], a: "F2:F500", b: ["B2:B500,\"Line 3\"", "B2:B500,\"3号线\""], c: "", f: function (a, b) { return "=AVERAGEIFS(" + a + ", " + b + ")"; }, w: ["Averages the first range where the condition is true.", "在条件满足时，对第一个范围求平均值。"], s: [["Wrap in ROUND(…, 1) to show one decimal.", "外面套 ROUND(…, 1) 显示一位小数。"]] },
    ach:      { t: ["Achievement % vs target", "目标达成率 %"], a: "C2", b: "B2", c: "", f: function (a, b) { return "=IFERROR(" + a + "/" + b + ", 0)"; }, w: ["Actual divided by target; shows 0 instead of an error when the target is blank.", "实际除以目标；目标为空时显示 0 而不是错误。"], s: [["Format the cell as %.", "把单元格格式设为百分比。"], ["Add conditional formatting: below 95% amber, below 85% red.", "加条件格式：低于 95% 黄色，低于 85% 红色。"]] },
    overdue:  { t: ["Days overdue", "逾期天数"], a: "D2", b: "E2", c: "", f: function (a, b) { return "=IF(AND(" + b + "<>" + L("\"Done\"", "\"完成\"") + ", " + a + "<TODAY()), TODAY()-" + a + ", 0)"; }, w: ["Days past the due date (first cell), zero when the status (second cell) is Done.", "超过截止日期（第一个单元格）的天数；状态（第二个单元格）为“完成”时为 0。"], s: [["Sort by this column to see the oldest actions first.", "按此列排序，最早逾期的排在前面。"]] },
    workdays: { t: ["Working days between dates", "两个日期之间的工作日"], a: "B2", b: "C2", c: ["Holidays!A:A", "假期!A:A"], f: function (a, b, c) { return "=NETWORKDAYS(" + a + ", " + b + (c ? ", " + c : "") + ")"; }, w: ["Counts Monday–Friday days between start and end, excluding the holiday list.", "计算开始和结束日期之间的周一至周五天数，排除节假日列表。"], s: [["Use NETWORKDAYS.INTL for a 6-day week.", "一周 6 天工作制用 NETWORKDAYS.INTL。"]] },
    pareto:   { t: ["Pareto cumulative %", "柏拉图累计 %"], a: "C2", b: "C$2:C$20", c: "", f: function (a, b) { return "=SUM(" + b.split(":")[0] + ":" + a + ")/SUM(" + b + ")"; }, w: ["Running share of the total. Sort the values largest first, then fill down.", "累计占总数的比例。先把数值从大到小排序，再向下填充。"], s: [["The $ keeps the start of the range fixed when you fill down.", "$ 让范围起点在向下填充时保持不变。"]] },
    unique:   { t: ["List unique values", "列出不重复的值"], a: "B2:B500", b: "", c: "", f: function (a) { return "=SORT(UNIQUE(FILTER(" + a + ", " + a + "<>\"\")))"; }, w: ["A sorted list of each value once, ignoring blanks (Excel 365 and Google Sheets).", "去掉空白、按顺序列出每个值一次（Excel 365 和 Google Sheets）。"], s: [["The result spills down automatically; keep the cells below empty.", "结果会自动向下溢出，下方单元格请保持为空。"]] }
  };
  function excel() {
    if (!$("fxTask")) return;
    function opts() {
      var cur = $("fxTask").value || "countif";
      $("fxTask").innerHTML = Object.keys(FX).map(function (k) { return '<option value="' + k + '"' + (k === cur ? " selected" : "") + ">" + esc(L(FX[k].t[0], FX[k].t[1])) + "</option>"; }).join("");
    }
    opts();
    function lv(x) { return Array.isArray(x) ? L(x[0], x[1]) : x; }
    function fill() { var t = FX[$("fxTask").value]; set("fxA", lv(t.a)); set("fxB", lv(t.b)); set("fxC", lv(t.c)); }
    $("fxTask").addEventListener("change", fill);
    wire({
      out: "fxOut", live: true,
      example: fill,
      reset: function () { $("fxTask").value = "countif"; },
      relabel: function () { opts(); var t = FX[$("fxTask").value]; [["fxA", t.a], ["fxB", t.b], ["fxC", t.c]].forEach(function (x) { if (Array.isArray(x[1]) && x[1].indexOf($(x[0]).value) > -1) set(x[0], lv(x[1])); }); },
      run: function () {
        var t = FX[$("fxTask").value];
        var f = t.f(v("fxA") || lv(t.a), v("fxB") || lv(t.b), v("fxC") || lv(t.c));
        return '<div class="formulaOut">' + esc(f) + "</div><p>" + esc(L(t.w[0], t.w[1])) + "</p>" + ul(t.s.map(function (x) { return esc(L(x[0], x[1])); }));
      },
      copyText: function () { var e = document.querySelector("#fxOut .formulaOut"); return e ? e.textContent : ""; }
    });
  }

  /* =======================================================
     2. MEETING MINUTES GENERATOR
     ======================================================= */
  var DEC = ["decided", "decision", "agreed", "agree", "approved", "approve", "go with", "will go", "confirmed", "决定", "同意", "批准", "确认采用", "定了"];
  var ACT = ["action", "will ", "to do", "todo", "need to", "needs to", "follow up", "follow-up", "by ", "@", "assign", "owner", "需要", "负责", "跟进", "安排", "行动"];
  var RISK = ["risk", "issue", "problem", "concern", "blocked", "delay", "late", "shortage", "风险", "问题", "担心", "受阻", "延误", "缺"];
  function minutes() {
    if (!$("mmNotes")) return;
    wire({
      out: "mmOut", file: "meeting-minutes.txt",
      example: function () {
        set("mmTitle", L("Weekly production review – Line 3", "生产周会 – 3 号线"));
        set("mmDate", new Date().toISOString().slice(0, 10));
        set("mmWho", L("Production, Quality, Maintenance, Planning", "生产、质量、维修、计划"));
        set("mmNotes", L(
          "OEE last week 78%, target 85%. Main loss changeovers on Tuesday and Thursday.\n" +
          "Decided to trial a standard changeover cart from next Monday.\n" +
          "@Mei to prepare the cart checklist by Friday.\n" +
          "Scrap up to 2.4% on part 1045, QA thinks new resin lot. Concern: supplier delivery is late again.\n" +
          "Maintenance will replace the conveyor belt on Line 3 during Saturday shutdown.\n" +
          "Agreed to review OEE daily at the 8:30 meeting.\n" +
          "Risk: two operators on leave next week, need cover for packing.",
          "上周 OEE 78%，目标 85%。主要损失是周二和周四的换线。\n" +
          "决定从下周一开始试行标准换线车。\n" +
          "@小梅 周五前准备换线车检查表。\n" +
          "1045 零件报废升到 2.4%，质量认为是新树脂批次。担心：供应商交货又延误了。\n" +
          "维修将在周六停机时更换 3 号线输送带。\n" +
          "同意在 8:30 早会上每天回顾 OEE。\n" +
          "风险：下周两名操作员休假，包装岗位需要补位。"));
        set("mmNext", addDays(7));
      },
      run: function () {
        var lines = v("mmNotes").split(/\n|(?<=[.。!?！？；;])\s+/).map(function (s) { return s.replace(/^[-•*\d.)\s]+/, "").trim(); }).filter(function (s) { return s.length > 2; });
        var dec = [], act = [], risk = [], info = [];
        lines.forEach(function (s) {
          var low = " " + s.toLowerCase() + " ";
          var isD = DEC.some(function (k) { return low.indexOf(k) > -1; });
          var isA = ACT.some(function (k) { return low.indexOf(k) > -1; });
          var isR = RISK.some(function (k) { return low.indexOf(k) > -1; });
          if (isD) dec.push(s);
          if (isA && !isD) {
            var m = s.match(/@([\w一-龥]+)/) || s.match(/^([A-Z][a-z]+|Maintenance|Quality|QA|Planning|Production|维修|质量|计划|生产)\s+(will|to|将|负责)/);
            var due = s.match(/\bby\s+[\w:]+|\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|next week)\b|周[一二三四五六日]前?|明天|今天|下周/i);
            act.push({ s: s, o: m ? m[1] : null, d: due ? due[0] : null });
          }
          if (isR) risk.push(s);
          if (!isD && !isA && !isR) info.push(s);
        });
        var miss = act.filter(function (a) { return !a.o; }).length, nod = act.filter(function (a) { return !a.d; }).length;
        return "<h3>" + esc(v("mmTitle") || L("Meeting minutes", "会议纪要")) + "</h3><p>" + esc(v("mmDate")) + (v("mmWho") ? " · " + L("Attendees: ", "参会：") + esc(v("mmWho")) : "") + "</p>" +
          "<h3>" + L("Key points", "要点") + "</h3>" + (info.length ? ul(info.map(esc)) : "<p>–</p>") +
          "<h3>" + L("Decisions", "决定") + "</h3>" + (dec.length ? ul(dec.map(esc)) : "<p>" + L("No decision recorded.", "未记录决定。") + "</p>") +
          "<h3>" + L("Actions", "行动项") + "</h3>" + (act.length ? '<div class="tblWrapR"><table class="tracker dtbl"><thead><tr><th>#</th><th>' + L("Action", "行动") + "</th><th>" + L("Owner", "负责人") + "</th><th>" + L("Due", "期限") + "</th></tr></thead><tbody>" +
            act.map(function (a, i) { return "<tr><td>" + (i + 1) + "</td><td>" + esc(a.s) + "</td><td>" + (a.o ? esc(a.o) : '<b class="warnTxt">' + L("Owner?", "负责人？") + "</b>") + "</td><td>" + (a.d ? esc(a.d) : '<b class="warnTxt">' + L("Date?", "日期？") + "</b>") + "</td></tr>"; }).join("") + "</tbody></table></div>" : "<p>" + L("No actions found.", "未发现行动项。") + "</p>") +
          "<h3>" + L("Risks & open issues", "风险与待解决问题") + "</h3>" + (risk.length ? ul(risk.map(esc)) : "<p>–</p>") +
          (miss || nod ? '<p class="warnTxt">' + L("Before sending: " + (miss ? miss + " action(s) need an owner. " : "") + (nod ? nod + " action(s) need a date." : ""), "发送前：" + (miss ? miss + " 个行动需要负责人。" : "") + (nod ? nod + " 个行动需要日期。" : "")) + "</p>" : "") +
          (v("mmNext") ? "<p><b>" + L("Next meeting: ", "下次会议：") + "</b>" + esc(v("mmNext")) + "</p>" : "");
      }
    });
  }

  /* =======================================================
     3. CAPA ACTION PLANNER
     ======================================================= */
  var CAT = {
    man: { k: ["operator", "training", "trained", "new", "forgot", "skill", "human", "操作员", "培训", "新人", "忘记", "技能"], c: [["Error-proof the step (fixture, interlock, sequence lock) so it cannot be missed.", "对该步骤防错（夹具、联锁、顺序锁定），使其无法被遗漏。"], ["Add an automatic count or check at the station.", "在工位增加自动计数或检查。"]] },
    machine: { k: ["machine", "tool", "wear", "setting", "parameter", "sensor", "maintenance", "pressure", "temperature", "设备", "刀具", "磨损", "参数", "传感器", "保养", "压力", "温度"], c: [["Lock critical parameters and alarm when out of range.", "锁定关键参数，超范围报警。"], ["Add tool-life or PM counter with automatic stop.", "增加刀具寿命或保养计数，到期自动停机。"]] },
    method: { k: ["instruction", "sop", "procedure", "step", "changeover", "recipe", "process", "作业指导", "步骤", "换线", "配方", "流程"], c: [["Remove or simplify the step that causes the error.", "取消或简化导致错误的步骤。"], ["Visual standard at the station plus first-off check after changeovers.", "工位目视化标准，加换线后首件检查。"]] },
    material: { k: ["material", "supplier", "lot", "batch", "resin", "component", "材料", "供应商", "批次", "来料"], c: [["Supplier corrective action (8D) and incoming inspection on the characteristic.", "要求供应商纠正（8D），并对该特性做来料检验。"], ["Lot traceability so suspect material can be blocked fast.", "批次追溯，以便快速锁定可疑材料。"]] },
    measure: { k: ["gauge", "measure", "inspection", "test", "calibration", "detect", "量具", "测量", "检验", "测试", "校准"], c: [["Upgrade detection to automatic or 100% on the critical characteristic.", "对关键特性升级为自动或 100% 检测。"], ["Fix gauge repeatability and calibration first.", "先解决量具重复性和校准问题。"]] }
  };
  function capa() {
    if (!$("cpProblem")) return;
    wire({
      out: "cpOut", file: "capa-plan.txt",
      example: function () {
        set("cpProblem", L("Wrong label on 120 cartons shipped to customer", "120 箱产品贴错标签并已发给客户"));
        set("cpCause", L("Label template was changed but the old file stayed on the line printer; no check of label vs work order at packing", "标签模板已更新，但产线打印机仍使用旧文件；包装时没有核对标签与工单"));
        $("cpVerified").checked = true;
        set("cpSev", "high"); set("cpOwner", L("Packing supervisor", "包装主管"));
      },
      run: function () {
        var txt = (v("cpProblem") + " " + v("cpCause")).toLowerCase();
        var best = Object.keys(CAT).map(function (k) { return { k: k, s: CAT[k].k.filter(function (w) { return txt.indexOf(w) > -1; }).length }; }).sort(function (a, b) { return b.s - a.s; })[0];
        var cat = best.s ? best.k : "method";
        var sev = v("cpSev") || "med", own = v("cpOwner") || L("[owner]", "[负责人]");
        var days = sev === "high" ? [1, 14, 30, 90] : sev === "low" ? [7, 30, 60, 90] : [2, 21, 30, 90];
        var row = function (type, what, who, d) { return "<tr><td><b>" + type + "</b></td><td>" + what + "</td><td>" + esc(who) + "</td><td>" + addDays(d) + "</td></tr>"; };
        return (!$("cpVerified").checked ? '<p class="warnTxt">⚠ ' + L("Root cause not yet verified. Confirm it with data or a test before committing to corrective actions; the plan below is provisional.", "根本原因尚未验证。在确定纠正措施前，请先用数据或试验确认；以下计划为暂定。") + "</p>" : "") +
          "<h3>" + L("CAPA plan", "CAPA 计划") + "</h3><p>" + esc(v("cpProblem") || L("[problem]", "[问题]")) + "</p>" +
          '<div class="tblWrapR"><table class="tracker dtbl"><thead><tr><th>' + L("Type", "类型") + "</th><th>" + L("Action", "措施") + "</th><th>" + L("Owner", "负责人") + "</th><th>" + L("Due", "期限") + "</th></tr></thead><tbody>" +
          row(L("Containment", "围堵"), L("Quarantine and sort all suspect stock (WIP, warehouse, in transit, customer). Tell the customer if affected.", "隔离并挑选所有可疑库存（在制品、仓库、在途、客户处）。如影响客户，立即通知客户。"), own, days[0]) +
          row(L("Correction", "纠正"), L("Fix or replace the affected parts; record quantities.", "修复或更换受影响零件，并记录数量。"), own, days[0] + 2) +
          row(L("Corrective action", "纠正措施"), esc(L(CAT[cat].c[0][0], CAT[cat].c[0][1])), own, days[1]) +
          row(L("Corrective action", "纠正措施"), esc(L(CAT[cat].c[1][0], CAT[cat].c[1][1])), own, days[1]) +
          row(L("Preventive action", "预防措施"), L("Check the same risk on similar lines and products; update PFMEA, control plan and work instructions.", "在类似产线和产品上排查相同风险；更新 PFMEA、控制计划和作业指导书。"), own, days[2]) +
          row(L("Effectiveness check", "有效性验证"), L("Zero recurrence over the check period, confirmed with data. Close only then.", "验证期内零再发，并有数据确认后才可关闭。"), own, days[3]) +
          "</tbody></table></div>" +
          "<h3>" + L("Root cause", "根本原因") + "</h3><p>" + esc(v("cpCause") || L("[root cause]", "[根本原因]")) + "</p>" +
          "<h3>" + L("Why these actions", "为什么选这些措施") + "</h3>" + ul([L("Controls are ranked strongest first: eliminate or error-proof before detection, and detection before training.", "控制措施从强到弱排列：先取消或防错，再检测，最后才是培训。"), L("Due dates follow the severity you chose; adjust to your quality system.", "期限根据你选择的严重程度设定；请按你的质量体系调整。")]);
      }
    });
  }

  /* =======================================================
     4. DOWNTIME ANALYSIS ASSISTANT
     ======================================================= */
  var DT_TIPS = [
    [["changeover", "setup", "换线", "换模"], ["Changeovers: separate internal and external work (SMED) and prepare tools before the stop.", "换线：区分内部和外部作业（SMED），停机前准备好工具。"]],
    [["material", "waiting", "shortage", "物料", "等料", "缺料"], ["Waiting for material: agree a call-off signal (kanban) and check tomorrow's kit before the shift ends.", "等料：约定叫料信号（看板），下班前检查明天的物料齐套。"]],
    [["breakdown", "fault", "motor", "jam", "sensor", "conveyor", "故障", "电机", "卡料", "传感器", "输送带"], ["Breakdowns and jams: review the top failure with maintenance and add it to preventive maintenance.", "故障与卡料：与维修回顾最主要的故障，并纳入预防性保养。"]],
    [["quality", "hold", "inspection", "质量", "隔离", "检验"], ["Quality holds: find why the process drifted, not just why it was stopped.", "质量停机：找出工艺为什么偏移，而不只是为什么停机。"]],
    [["operator", "no operator", "break", "人员", "缺人", "休息"], ["People-related stops: check cover and staggered breaks with the skills matrix.", "人员相关停机：用技能矩阵检查补位和错开休息。"]]
  ];
  function downtimeAI() {
    if (!$("daData")) return;
    wire({
      out: "daOut", file: "downtime-analysis.txt",
      example: function () {
        set("daPlan", "2400");
        set("daData", L(
          "Changeover, 45\nConveyor jam, 20\nWaiting for material, 30\nChangeover, 35\nSensor fault, 15\nConveyor jam, 25\nQuality hold, 20\nWaiting for material, 15\nChangeover, 40\nNo operator, 10",
          "换线, 45\n输送带卡料, 20\n等料, 30\n换线, 35\n传感器故障, 15\n输送带卡料, 25\n质量隔离, 20\n等料, 15\n换线, 40\n缺人, 10"));
      },
      run: function () {
        var rows = v("daData").split(/\n/).map(function (l) {
          var m = l.match(/^\s*(.+?)[,\t;，]\s*(\d+(\.\d+)?)\s*$/) || l.match(/^\s*(\d+(\.\d+)?)\s*(min|mins|分钟)?[,\t;，\s]+(.+?)\s*$/i);
          if (!m) return null;
          return isNaN(parseFloat(m[1])) ? { r: m[1].trim(), m: parseFloat(m[2]) } : { r: m[4].trim(), m: parseFloat(m[1]) };
        }).filter(Boolean);
        if (!rows.length) return '<p class="resNote">' + L("Enter one stop per line: reason, minutes.", "每行输入一次停机：原因, 分钟。") + "</p>";
        var agg = {};
        rows.forEach(function (x) { var k = x.r.toLowerCase(); agg[k] = agg[k] || { r: x.r, m: 0, n: 0 }; agg[k].m += x.m; agg[k].n++; });
        var list = Object.keys(agg).map(function (k) { return agg[k]; }).sort(function (a, b) { return b.m - a.m; });
        var tot = list.reduce(function (s, x) { return s + x.m; }, 0), cum = 0, plan = parseFloat(v("daPlan"));
        var vital = [];
        var tbl = list.map(function (x) {
          var p = x.m / tot; cum += p; if (cum - p < 0.8) vital.push(x.r);
          return "<tr" + (cum - p < 0.8 ? ' class="vital"' : "") + "><td>" + esc(x.r) + "</td><td>" + x.n + "</td><td>" + Math.round(x.m) + '</td><td><span class="bar"><i style="width:' + (x.m / list[0].m * 100) + '%"></i></span> ' + Math.round(p * 100) + "%</td><td>" + Math.round(cum * 100) + "%</td></tr>";
        }).join("");
        var low = vital.join(" ").toLowerCase();
        var tips = DT_TIPS.filter(function (t) { return t[0].some(function (k) { return low.indexOf(k) > -1; }); }).map(function (t) { return esc(L(t[1][0], t[1][1])); });
        return '<div class="dKpis"><div><span>' + L("Total downtime", "停机合计") + "</span><b>" + Math.round(tot) + " " + L("min", "分钟") + "</b></div>" +
          "<div><span>" + L("Stops", "停机次数") + "</span><b>" + rows.length + "</b></div>" +
          '<div class="' + (plan > 0 && tot / plan > 0.1 ? "bad" : "") + '"><span>' + L("% of planned time", "占计划时间") + "</span><b>" + (plan > 0 ? (tot / plan * 100).toFixed(1) + "%" : "–") + "</b></div>" +
          '<div class="bad"><span>' + L("Top reason", "最大原因") + "</span><b>" + esc(list[0].r) + "</b></div></div>" +
          "<h3>" + L("Pareto", "柏拉图") + '</h3><div class="tblWrapR"><table class="tracker dtbl pareto"><thead><tr><th>' + L("Reason", "原因") + "</th><th>" + L("Stops", "次数") + "</th><th>" + L("Minutes", "分钟") + "</th><th>" + L("Share", "占比") + "</th><th>" + L("Cumulative", "累计") + "</th></tr></thead><tbody>" + tbl + "</tbody></table></div>" +
          "<h3>" + L("Focus first", "优先处理") + "</h3><p>" + L("These reasons make up about 80% of the downtime: ", "这些原因约占停机时间的 80%：") + "<b>" + vital.map(esc).join(", ") + "</b></p>" +
          "<h3>" + L("Suggested next steps", "建议的下一步") + "</h3>" + ul(tips.length ? tips : [L("Ask what happened just before the top stop, and log reasons more specifically next week.", "追问最大停机发生前的情况，下周把原因记录得更具体。")]);
      }
    });
  }

  /* =======================================================
     5. EMAIL WRITING ASSISTANT
     ======================================================= */
  var PUR = {
    request: [["Request support", "请求支持"], ["Request: ", "请求："], ["I'd like to ask for your support on {topic}.", "关于{topic}，想请你支持。"]],
    escalate: [["Escalate an issue", "升级问题"], ["Escalation: ", "升级："], ["I need to escalate {topic}, which needs a decision.", "我需要升级{topic}，这件事需要做决定。"]],
    update: [["Give a status update", "汇报进展"], ["Update: ", "进展："], ["Here is a quick update on {topic}.", "简要汇报一下{topic}的进展。"]],
    follow: [["Follow up on an action", "跟进行动项"], ["Follow-up: ", "跟进："], ["I'm following up on {topic}.", "我想跟进一下{topic}。"]],
    decline: [["Decline or push back", "婉拒或提出异议"], ["Re: ", "回复："], ["Thank you for the request on {topic}. I can't commit to it as asked, and here is why.", "感谢你关于{topic}的请求。按目前的要求我无法承诺，原因如下。"]],
    thanks: [["Thank the team", "感谢团队"], ["Thank you: ", "感谢："], ["I want to say thank you for {topic}.", "想为{topic}向大家说声谢谢。"]]
  };
  var TONE = {
    direct: [["Direct", "直接"], ["Hi {name},", "{name}，你好："], ["Thanks,", "谢谢，"]],
    polite: [["Polite", "礼貌"], ["Hi {name}, I hope you're well.", "{name}，你好！希望你一切顺利。"], ["Many thanks for your help,", "非常感谢你的帮助，"]],
    formal: [["Formal", "正式"], ["Dear {name},", "尊敬的{name}："], ["Kind regards,", "此致敬礼，"]]
  };
  function email() {
    if (!$("emPurpose")) return;
    function opts() {
      var p = $("emPurpose").value || "request", t = $("emTone").value || "polite";
      $("emPurpose").innerHTML = Object.keys(PUR).map(function (k) { return '<option value="' + k + '"' + (k === p ? " selected" : "") + ">" + esc(L(PUR[k][0][0], PUR[k][0][1])) + "</option>"; }).join("");
      $("emTone").innerHTML = Object.keys(TONE).map(function (k) { return '<option value="' + k + '"' + (k === t ? " selected" : "") + ">" + esc(L(TONE[k][0][0], TONE[k][0][1])) + "</option>"; }).join("");
    }
    opts();
    wire({
      out: "emOut", live: true, relabel: opts,
      example: function () {
        $("emPurpose").value = "escalate"; $("emTone").value = "polite";
        set("emTo", L("Ahmad", "陈经理")); set("emTopic", L("the resin delivery delay for Line 3", "3 号线树脂交货延误"));
        set("emFacts", L("Stock covers until Wednesday 10am\nSupplier has missed 2 delivery dates\nLine 3 would stop, about 1,800 units per shift", "库存只够用到周三上午 10 点\n供应商已错过 2 次交期\n3 号线将停产，每班约 1,800 件"));
        set("emAsk", L("approve air freight for one batch (about RM 4,500)", "批准一批货改空运（约 4,500 令吉）")); set("emBy", L("Tuesday 3pm", "周二下午 3 点")); set("emFrom", "LAOYU");
      },
      run: function () {
        var p = PUR[$("emPurpose").value || "request"], t = TONE[$("emTone").value || "polite"];
        var topic = v("emTopic") || L("[topic]", "[主题]"), name = v("emTo") || L("[name]", "[姓名]");
        var facts = v("emFacts").split(/\n/).map(function (s) { return s.trim(); }).filter(Boolean);
        var ask = v("emAsk"), by = v("emBy");
        var subj = L(p[1][0], p[1][1]) + topic.charAt(0).toUpperCase() + topic.slice(1) + (ask && by ? L(" (decision needed by " + by + ")", "（请于" + by + "前决定）") : "");
        var body = [t[1][zh() ? 1 : 0].replace("{name}", name), "", L(p[2][0], p[2][1]).replace("{topic}", topic)];
        if (ask) body.push("", L("What I need: " + ask + (by ? ", by " + by : "") + ".", "我需要：" + ask + (by ? "，请在" + by + "前" : "") + "。"));
        if (facts.length) { body.push("", L("Key facts:", "关键事实：")); facts.forEach(function (f) { body.push("• " + f); }); }
        if ($("emPurpose").value === "decline") body.push("", L("Happy to discuss an alternative that works for both teams.", "很愿意一起讨论对双方都可行的替代方案。"));
        if ($("emPurpose").value === "update") body.push("", L("Next update: [date].", "下次更新：[日期]。"));
        body.push("", t[2][zh() ? 1 : 0], v("emFrom") || L("[your name]", "[你的名字]"));
        var words = body.join(" ").split(/\s+/).length;
        return "<h3>" + L("Subject", "主题") + '</h3><p class="emSubj">' + esc(subj) + "</p><h3>" + L("Email", "邮件") + "</h3><pre>" + esc(body.join("\n")) + "</pre>" +
          (words > 160 && !zh() ? '<p class="warnTxt">' + L("Over 160 words. Busy readers skim; consider cutting facts to the top 3.", "") + "</p>" : "");
      },
      copyText: function () { var s = document.querySelector("#emOut .emSubj"), b = document.querySelector("#emOut pre"); return (s ? L("Subject: ", "主题：") + s.textContent + "\n\n" : "") + (b ? b.textContent : ""); }
    });
  }

  document.addEventListener("DOMContentLoaded", function () { excel(); minutes(); capa(); downtimeAI(); email(); });
})();
