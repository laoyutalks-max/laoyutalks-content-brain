/* =========================================================
   LAOYU — AI DEMOS (simulated AI, runs fully in the browser)
   1. Daily Production Report  2. Root Cause Assistant
   3. Shift Handover Assistant
   Rule-based logic on synthetic data. No data leaves the page.
   ========================================================= */
(function () {
  "use strict";
  function zh() { return document.documentElement.getAttribute("data-lang") === "zh"; }
  function L(en, cn) { return zh() ? cn : en; }
  function $(id) { return document.getElementById(id); }
  function v(id) { var e = $(id); return e ? e.value.trim() : ""; }
  function n(id) { var x = parseFloat(v(id).replace(/,/g, "")); return isFinite(x) ? x : NaN; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function set(id, val) { var e = $(id); if (e) { e.value = val; e.dispatchEvent(new Event("input", { bubbles: true })); } }
  function ul(items, cls) { return items.length ? '<ul' + (cls ? ' class="' + cls + '"' : "") + ">" + items.map(function (i) { return "<li>" + i + "</li>"; }).join("") + "</ul>" : ""; }
  function fmt(x) { return Math.round(x).toLocaleString(); }
  function pct(x) { return (x * 100).toFixed(1) + "%"; }
  function textOf(el) {
    var out = [];
    el.querySelectorAll("h3, h4, li, p, .dKpis div").forEach(function (n) {
      if (n.tagName === "H3" || n.tagName === "H4") out.push("\n" + n.textContent.trim().toUpperCase());
      else if (n.matches(".dKpis div")) out.push("• " + n.querySelector("span").textContent.trim() + ": " + n.querySelector("b").textContent.trim());
      else if (n.tagName === "LI") out.push("• " + n.textContent.trim());
      else out.push(n.textContent.trim());
    });
    return out.join("\n").trim();
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
  function wire(outId, file, run) {
    var out = $(outId);
    var go = $("dGo"), cp = $("dCopy"), dl = $("dDl");
    if (go) go.addEventListener("click", function () { run(); out.scrollIntoView({ behavior: "smooth", block: "start" }); });
    if (cp) cp.addEventListener("click", function () { copy(L("[LAOYU simulated AI demo]\n", "[老鱼模拟 AI 演示]\n") + textOf(out), cp); });
    if (dl) dl.addEventListener("click", function () { download(file, L("LAOYU simulated AI demo\n\n", "老鱼模拟 AI 演示\n\n") + textOf(out)); });
    document.addEventListener("laoyu:lang", function () { if (out.dataset.ran) run(); });
    document.addEventListener("laoyu:reset", function () { out.innerHTML = '<p class="resNote">' + L("Fill in the form, or load the sample, then press Generate.", "填写表单或载入示例，然后点击生成。") + "</p>"; out.dataset.ran = ""; });
  }

  /* =======================================================
     DEMO 1 — DAILY PRODUCTION REPORT
     ======================================================= */
  function daily() {
    if (!$("drOut")) return;
    function sample() {
      set("drLine", L("Line 3 – Assembly", "3 号线 – 装配")); set("drDate", new Date().toISOString().slice(0, 10)); set("drShift", L("Day", "白班"));
      set("drTarget", "1200"); set("drActual", "1046"); set("drScrap", "31");
      set("drHcPlan", "14"); set("drHcAct", "12");
      set("drD1m", "45"); set("drD1r", L("Conveyor motor trip", "输送带电机跳闸"));
      set("drD2m", "20"); set("drD2r", L("Waiting for material", "等待物料"));
      set("drD3m", "15"); set("drD3r", "");
      set("drQual", L("Scratches on housing from station 4, 31 pcs scrapped", "4 号工位外壳刮伤，报废 31 件"));
      set("drNotes", L("2 operators on medical leave", "2 名操作员病假"));
    }
    function run() {
      var out = $("drOut"); out.dataset.ran = "1";
      var tg = n("drTarget"), ac = n("drActual"), sc = n("drScrap"), hp = n("drHcPlan"), ha = n("drHcAct");
      var downs = [1, 2, 3].map(function (i) { return { m: n("drD" + i + "m"), r: v("drD" + i + "r") }; }).filter(function (d) { return d.m > 0 || d.r; });
      var dTot = downs.reduce(function (a, d) { return a + (d.m > 0 ? d.m : 0); }, 0);
      var top = downs.slice().sort(function (a, b) { return (b.m || 0) - (a.m || 0); })[0];
      var ach = tg > 0 && ac >= 0 ? ac / tg : NaN, gap = tg - ac;
      var scr = ac > 0 && sc >= 0 ? sc / ac : NaN;
      var miss = [], act = [];
      if (!(tg > 0)) miss.push(L("Target output is missing.", "缺少目标产量。"));
      if (!(ac >= 0)) miss.push(L("Actual output is missing.", "缺少实际产量。"));
      downs.forEach(function (d) { if (d.m > 0 && !d.r) miss.push(L(d.m + " min of downtime has no reason. Reasons drive the Pareto.", d.m + " 分钟停机没有写原因。原因决定柏拉图分析。")); if (d.r && !(d.m > 0)) miss.push(L("\"" + esc(d.r) + "\" has no minutes recorded.", "“" + esc(d.r) + "”没有记录分钟数。")); });
      if (sc > 0 && !v("drQual")) miss.push(L("Scrap was recorded but no defect or cause is described.", "记录了报废，但没有描述缺陷或原因。"));
      if (!(hp > 0) || !(ha >= 0)) miss.push(L("Planned vs actual manpower not given.", "没有填写计划与实际人数。"));
      if (gap > 0 && tg > 0 && gap / tg > 0.05 && !dTot && !(sc > 0)) miss.push(L("Output is " + pct(gap / tg) + " below target but no downtime or quality reason explains it.", "产量低于目标 " + pct(gap / tg) + "，但没有停机或质量原因来解释。"));
      var rate = ac > 0 ? ac / ((n("drHours") || 8) * 60 - dTot) : NaN;
      if (gap > 0) act.push(L("Agree a recovery plan for <b>" + fmt(gap) + "</b> units" + (isFinite(rate) && rate > 0 ? " (≈ " + (gap / rate / 60).toFixed(1) + " h at today's run rate)" : "") + ", or confirm the new delivery date with planning.", "为 <b>" + fmt(gap) + "</b> 件缺口确定追赶计划" + (isFinite(rate) && rate > 0 ? "（按今天的产出速度约需 " + (gap / rate / 60).toFixed(1) + " 小时）" : "") + "，或与计划确认新的交付日期。"));
      if (top && top.m >= 30) act.push(L("Assign an owner to <b>" + esc(top.r || "unexplained downtime") + "</b> (" + top.m + " min) and report the root cause tomorrow.", "为 <b>" + esc(top.r || "未说明的停机") + "</b>（" + top.m + " 分钟）指定负责人，明天汇报根本原因。"));
      if (scr > 0.02) act.push(L("Scrap is " + pct(scr) + ". Check the top defect at the start of next shift before full-speed running.", "报废率为 " + pct(scr) + "。下一班全速生产前，先检查主要缺陷。"));
      if (hp > 0 && ha >= 0 && ha < hp) act.push(L("Short by " + (hp - ha) + " people. Plan tomorrow's cover now (see Manpower Gap Calculator).", "少了 " + (hp - ha) + " 人。现在就安排明天的补位（可用人力缺口计算器）。"));
      if (miss.length) act.push(L("Fill in the missing information below before sending the report.", "发送报告前，请补齐下面的缺失信息。"));
      var status = !isFinite(ach) ? ["", L("Not enough data", "数据不足")] : ach >= 1 ? ["ok", L("Target met", "达成目标")] : ach >= 0.95 ? ["warn", L("Slightly below target", "略低于目标")] : ["bad", L("Below target", "低于目标")];
      var summary = isFinite(ach) ? L(esc(v("drLine") || "The line") + " made " + fmt(ac) + " of " + fmt(tg) + " units (" + pct(ach) + ")" + (dTot ? ", with " + dTot + " min of downtime" + (top && top.r ? ", mainly " + esc(top.r) : "") : "") + (scr > 0 ? " and " + pct(scr) + " scrap" : "") + ".",
        esc(v("drLine") || "产线") + "完成 " + fmt(ac) + " / " + fmt(tg) + " 件（" + pct(ach) + "）" + (dTot ? "，停机 " + dTot + " 分钟" + (top && top.r ? "，主要原因是" + esc(top.r) : "") : "") + (scr > 0 ? "，报废率 " + pct(scr) : "") + "。") : L("Enter target and actual output to generate the summary.", "请输入目标和实际产量以生成摘要。");
      out.innerHTML =
        "<h3>" + L("Daily production report", "每日生产报告") + "</h3><p>" + esc(v("drLine") || L("Line", "产线")) + " · " + esc(v("drDate")) + " · " + esc(v("drShift")) + "</p>" +
        "<p><b>" + status[1] + ".</b> " + summary + "</p>" +
        '<div class="dKpis"><div><span>' + L("Target", "目标") + "</span><b>" + (tg > 0 ? fmt(tg) : "–") + "</b></div><div><span>" + L("Actual", "实际") + "</span><b>" + (ac >= 0 ? fmt(ac) : "–") + '</b></div><div class="' + status[0] + '"><span>' + L("Achievement", "达成率") + "</span><b>" + (isFinite(ach) ? pct(ach) : "–") + '</b></div><div class="' + (gap > 0 ? "bad" : "ok") + '"><span>' + L("Gap", "差距") + "</span><b>" + (isFinite(gap) ? (gap > 0 ? "−" : "+") + fmt(Math.abs(gap)) : "–") + "</b></div></div>" +
        "<h3>" + L("Quality", "质量") + "</h3>" + ul([(sc >= 0 ? L("Scrap: " + fmt(sc) + " units" + (isFinite(scr) ? " (" + pct(scr) + ")" : ""), "报废：" + fmt(sc) + " 件" + (isFinite(scr) ? "（" + pct(scr) + "）" : "")) : L("Scrap not recorded.", "未记录报废。")), esc(v("drQual") || L("No quality issue described.", "未描述质量问题。"))]) +
        "<h3>" + L("Downtime", "停机") + "</h3>" + ul(downs.length ? [L("Total: " + dTot + " min", "合计：" + dTot + " 分钟")].concat(downs.map(function (d) { return (d.m > 0 ? d.m : "?") + " " + L("min", "分钟") + " – " + esc(d.r || L("reason missing", "缺少原因")); })) : [L("No downtime recorded.", "未记录停机。")]) +
        "<h3>" + L("Manpower", "人员") + "</h3>" + ul([hp > 0 ? L("Planned " + hp + ", actual " + ha + (ha < hp ? " (short " + (hp - ha) + ")" : ""), "计划 " + hp + " 人，实际 " + ha + " 人" + (ha < hp ? "（少 " + (hp - ha) + " 人）" : "")) : L("Not given.", "未填写。")].concat(v("drNotes") ? [esc(v("drNotes"))] : [])) +
        "<h3>" + L("Missing information", "缺失信息") + "</h3>" + (miss.length ? ul(miss, "miss") : ul([L("Nothing obvious missing.", "没有明显缺失。")])) +
        "<h3>" + L("Follow-up actions", "跟进行动") + "</h3>" + ul(act.length ? act : [L("No follow-up needed. Keep the same plan for the next shift.", "无需跟进，下一班保持原计划。")]);
    }
    $("dSample").addEventListener("click", function () { sample(); run(); });
    wire("drOut", "daily-production-report.txt", run);
  }

  /* =======================================================
     DEMO 2 — ROOT CAUSE ASSISTANT
     ======================================================= */
  var LIB = {
    man: { t: ["Man / People", "人"], k: ["new", "operator", "training", "trained", "shift", "night", "fatigue", "skill", "forgot", "human", "staff", "新人", "操作员", "培训", "夜班", "疲劳", "忘记", "人员", "技能"],
      h: [["Skill or training gap on the task, especially for new or rotated people.", "该任务存在技能或培训缺口，尤其是新人或轮岗人员。", "Compare error rate by person and by experience level.", "按人员和经验水平比较错误率。"], ["The standard is unclear, so people do it differently.", "标准不清晰，导致每个人做法不同。", "Watch 3 people do the task and compare the steps.", "观察 3 个人执行该任务并比较步骤。"]] },
    machine: { t: ["Machine", "机"], k: ["machine", "tool", "wear", "worn", "setting", "maintenance", "sensor", "breakdown", "pressure", "jam", "alarm", "speed", "screwdriver", "torque", "replaced", "fixture", "设备", "刀具", "磨损", "参数", "保养", "传感器", "压力", "卡料", "报警", "速度", "电批", "扭矩", "更换", "夹具"],
      h: [["Tool or component wear drifting the process out of control.", "刀具或零件磨损导致工艺失控。", "Plot the defect rate against tool life or maintenance dates.", "把缺陷率与刀具寿命或保养日期做对比图。"], ["A setting changed or is not held (pressure, speed, temperature).", "参数被改动或不稳定（压力、速度、温度）。", "Check the change log and record the actual settings for one shift.", "查看变更记录，并记录一个班次的实际参数。"]] },
    method: { t: ["Method", "法"], k: ["instruction", "sop", "procedure", "step", "sequence", "changeover", "recipe", "changed", "process", "作业指导", "步骤", "换线", "配方", "变更", "流程", "顺序"],
      h: [["The work instruction is missing a step or does not match reality.", "作业指导书缺少步骤，或与实际不符。", "Walk the process with the instruction in hand and mark differences.", "拿着作业指导书走一遍流程，标出不一致的地方。"], ["Problems start after changeovers or recipe changes.", "问题在换线或配方变更后开始。", "Compare defect timing with the changeover log.", "把缺陷发生时间与换线记录对比。"]] },
    material: { t: ["Material", "料"], k: ["material", "supplier", "lot", "batch", "resin", "component", "raw", "incoming", "材料", "供应商", "批次", "来料", "原料", "零件"],
      h: [["A supplier lot or batch outside specification.", "供应商批次超出规格。", "Trace defects to lot numbers and check the certificates.", "把缺陷追溯到批号，并检查材质证明。"], ["Storage or handling damage before use.", "使用前的存放或搬运损坏。", "Inspect material at the point of use vs at receiving.", "比较收货时和使用点的材料状况。"]] },
    measure: { t: ["Measurement", "测"], k: ["gauge", "measure", "measurement", "inspection", "calibration", "test", "detect", "量具", "测量", "检验", "校准", "测试", "检测"],
      h: [["The gauge or test cannot reliably detect the defect.", "量具或测试无法可靠地检出缺陷。", "Run a quick repeatability check (same parts, 2 people, 2 times).", "做一个简单的重复性检查（同样零件、2 人、各测 2 次）。"], ["Inspection happens too late or too rarely to catch the problem.", "检验太晚或频率太低，抓不到问题。", "Map where and how often the defect is checked.", "画出缺陷在哪里、多久检查一次。"]] },
    env: { t: ["Environment", "环"], k: ["humidity", "dust", "heat", "hot", "cold", "lighting", "weather", "season", "湿度", "粉尘", "高温", "低温", "照明", "天气", "季节", "温湿度"],
      h: [["Temperature, humidity or dust changes affecting the process.", "温度、湿度或粉尘变化影响工艺。", "Log environment readings alongside defect counts for a week.", "连续一周记录环境数据和缺陷数量。"], ["Poor lighting or layout makes the defect hard to see or avoid.", "照明或布局不佳，导致缺陷难以发现或避免。", "Check lux levels and observe the workstation for awkward reach.", "检查照度，并观察工位是否存在别扭的取放动作。"]] }
  };
  function rootCause() {
    if (!$("rcOut")) return;
    function sample() {
      set("rcWhat", L("Missing screws on the cover assembly", "外盖组装漏打螺丝"));
      set("rcWhere", L("Line 2, station 5 (manual screwing)", "2 号线 5 号工位（人工打螺丝）"));
      set("rcWhen", L("Since 14 Oct, mostly on night shift", "自 10 月 14 日起，主要在夜班"));
      set("rcHow", L("18 units in 2 weeks (0.6%), 3 reached the customer", "2 周内 18 件（0.6%），其中 3 件流到客户"));
      set("rcImpact", L("Customer complaint and 100% sorting of stock", "客户投诉，库存全检"));
      set("rcChange", L("Two new operators started on night shift; screwdriver was replaced on 10 Oct", "夜班来了两名新操作员；10 月 10 日更换了电批"));
      set("rcW1", L("The operator did not fit all 4 screws.", "操作员没有打满 4 颗螺丝。"));
      set("rcW2", L("They lost count when the line was interrupted.", "产线被打断时，他们数错了。"));
    }
    function run() {
      var out = $("rcOut"); out.dataset.ran = "1";
      var fields = [["rcWhat", L("what is wrong", "出了什么问题")], ["rcWhere", L("where", "在哪里")], ["rcWhen", L("when / since when", "什么时候 / 从何时开始")], ["rcHow", L("how much or how often", "多少或多频繁")], ["rcImpact", L("impact", "影响")]];
      var missing = fields.filter(function (f) { return !v(f[0]); }).map(function (f) { return f[1]; });
      var stmt = (v("rcWhat") || L("[what is wrong]", "[出了什么问题]")) + (v("rcWhere") ? L(" at ", "，地点：") + v("rcWhere") : "") + (v("rcWhen") ? L(", ", "，时间：") + v("rcWhen") : "") + (v("rcHow") ? L(". Size: ", "。规模：") + v("rcHow") : "") + (v("rcImpact") ? L(". Impact: ", "。影响：") + v("rcImpact") : "") + L(".", "。");
      var text = [v("rcWhat"), v("rcWhere"), v("rcWhen"), v("rcHow"), v("rcChange"), v("rcW1"), v("rcW2"), v("rcW3"), v("rcW4"), v("rcW5")].join(" ").toLowerCase();
      var scored = Object.keys(LIB).map(function (k) {
        var s = LIB[k].k.filter(function (w) { return text.indexOf(w) > -1; }).length;
        return { k: k, s: s };
      }).sort(function (a, b) { return b.s - a.s; });
      var pick = scored.filter(function (x) { return x.s > 0; }).slice(0, 3);
      ["method", "machine", "man", "material"].forEach(function (k) { if (pick.length < 3 && !pick.some(function (x) { return x.k === k; })) pick.push({ k: k }); });
      var whys = [1, 2, 3, 4, 5].map(function (i) { return v("rcW" + i); });
      var Q = [
        [L("Why does the problem happen? (the physical or immediate cause)", "为什么会发生这个问题？（直接或物理原因）"), L("Evidence: inspect the failed parts and the station.", "证据：检查失效零件和工位。")],
        [L("Why did that condition exist?", "为什么会存在这个条件？"), L("Evidence: compare good vs bad shifts, people, lots or settings.", "证据：比较好与坏的班次、人员、批次或参数。")],
        [L("Why was it not prevented or detected?", "为什么没有被预防或检出？"), L("Evidence: check the controls and inspections that should have caught it.", "证据：检查本应抓到它的控制和检验。")],
        [L("Why does the process allow that gap?", "为什么流程会允许这个漏洞？"), L("Evidence: review the standard, training records and change history.", "证据：查看标准、培训记录和变更历史。")],
        [L("Why has the system not fixed it before?", "为什么体系之前没有解决它？"), L("Evidence: look at past incidents and how actions were closed.", "证据：查看过往事件以及行动是如何关闭的。")]
      ];
      var top = pick[0].k;
      var CTRL = {
        man: [L("Make the error impossible: fixture or sequence that blocks the next step until done.", "让错误不可能发生：用夹具或工序互锁，未完成不能进入下一步。"), L("Automatic count or detection (torque counter, vision check).", "自动计数或检测（扭矩计数器、视觉检查）。")],
        machine: [L("Error-proof the setting: lock parameters, alarm when out of range.", "对参数防错：锁定参数，超范围报警。"), L("Preventive maintenance or tool-life counter with automatic stop.", "预防性保养或刀具寿命计数，到期自动停机。")],
        method: [L("Remove or simplify the step that causes the error.", "取消或简化导致错误的步骤。"), L("Visual standard at the station plus a first-off check after changeovers.", "工位上的目视化标准，加上换线后的首件检查。")],
        material: [L("Supplier containment and incoming inspection on the affected characteristic.", "要求供应商围堵，并对相关特性做来料检验。"), L("Lot traceability so suspect material can be blocked fast.", "批次追溯，以便快速锁定可疑材料。")],
        measure: [L("Upgrade detection: automatic or 100% check on the critical characteristic.", "升级检测：对关键特性做自动或 100% 检查。"), L("Fix the gauge (calibration, repeatability) before trusting the data.", "先修正量具（校准、重复性），再相信数据。")],
        env: [L("Control the condition (temperature, humidity, lighting) at the source.", "从源头控制条件（温度、湿度、照明）。"), L("Alarm or record when the condition goes out of range.", "条件超范围时报警或记录。")]
      };
      out.innerHTML =
        "<h3>" + L("1. Problem statement", "1. 问题描述") + "</h3><p>" + esc(stmt) + "</p>" +
        (missing.length ? '<p class="hyp">' + L("Missing: " + missing.join(", ") + ". A complete statement makes the investigation faster.", "缺少：" + missing.join("、") + "。描述完整，调查会更快。") + "</p>" : "") +
        "<h3>" + L("2. Five Whys investigation", "2. 5 个为什么调查") + "</h3><ul>" + Q.map(function (q, i) {
          return "<li><b>" + L("Why ", "为什么 ") + (i + 1) + L(":", "：") + "</b> " + q[0] + (whys[i] ? "<br>→ " + L("Your answer: ", "你的回答：") + "<i>" + esc(whys[i]) + "</i> " + L("(confirm with evidence)", "（请用证据确认）") : "") + "<br><small>" + q[1] + "</small></li>";
        }).join("") + "</ul>" +
        "<h3>" + L("3. Possible root causes to check", "3. 待核实的可能根本原因") + "</h3>" +
        '<p class="hyp">⚠ ' + L("These are hypotheses based on the words you used, not confirmed causes. Check each one with data before acting.", "这些是根据你的描述得出的假设，不是已确认的原因。行动前请逐一用数据核实。") + "</p><ul>" +
        pick.map(function (p) { return LIB[p.k].h.map(function (h) { return "<li><b>" + L(LIB[p.k].t[0], LIB[p.k].t[1]) + L(":", "：") + "</b> " + L(h[0], h[1]) + "<br><small>" + L("How to check: ", "核实方法：") + L(h[2], h[3]) + "</small></li>"; }).join(""); }).join("") + "</ul>" +
        "<h3>" + L("4. Recommended controls (strongest first)", "4. 建议的控制措施（从强到弱）") + "</h3><ul>" +
        "<li><b>" + L("Eliminate / error-proof:", "取消 / 防错：") + "</b> " + CTRL[top][0] + "</li>" +
        "<li><b>" + L("Detect:", "检测：") + "</b> " + CTRL[top][1] + "</li>" +
        "<li><b>" + L("Standardise:", "标准化：") + "</b> " + L("Update the work instruction and control plan with the new control.", "把新的控制措施写入作业指导书和控制计划。") + "</li>" +
        "<li><b>" + L("Train (weakest on its own):", "培训（单独使用最弱）：") + "</b> " + L("Train the team on the change, but don't rely on training alone.", "就变更培训团队，但不要只依赖培训。") + "</li></ul>" +
        "<h3>" + L("5. Verification plan", "5. 验证计划") + "</h3><ul>" +
        "<li>" + L("Baseline: ", "基准：") + esc(v("rcHow") || L("[current rate]", "[当前水平]")) + "</li>" +
        "<li>" + L("Target: zero recurrence, or at least a 90% reduction.", "目标：零再发，或至少降低 90%。") + "</li>" +
        "<li>" + L("Check on day 1, day 7 and day 30 after the control is in place; record the counts.", "控制措施实施后第 1、7、30 天检查并记录数量。") + "</li>" +
        "<li>" + L("Only call it the root cause if the problem stops when the control is applied (and ideally returns if removed in a safe test).", "只有当实施控制后问题停止（理想情况下，在安全的试验中移除控制后问题会重现），才能称为根本原因。") + "</li></ul>";
    }
    $("dSample").addEventListener("click", function () { sample(); run(); });
    wire("rcOut", "root-cause-plan.txt", run);
  }

  /* =======================================================
     DEMO 3 — SHIFT HANDOVER ASSISTANT
     ======================================================= */
  var HO = [
    ["safety", ["Safety", "安全"], ["safety", "injur", "near miss", "near-miss", "hazard", "slipped on", "trip hazard", "spill", "oil on the floor", "cordon", "oil leak", "guard", "ppe", "lockout", "lock-out", "loto", "fire", "first aid", "安全", "受伤", "险情", "隐患", "滑倒", "泄漏", "漏油", "围起来", "护罩", "劳保", "急救"]],
    ["quality", ["Quality", "质量"], ["quality", "defect", "scrap", "reject", "rework", "complaint", "out of spec", "ncr", "on hold", "hold", "qa ", "qc", "burr", "scratch", "质量", "缺陷", "报废", "不良", "返工", "投诉", "超差", "隔离", "毛刺", "刮伤"]],
    ["equip", ["Equipment", "设备"], ["machine", "breakdown", "alarm", "maintenance", "motor", "pump", "sensor", "leak", "jam", "conveyor", "robot", "tool", "press", "down for", "设备", "故障", "报警", "维修", "电机", "泵", "传感器", "漏油", "卡料", "输送带", "机器人", "模具"]],
    ["material", ["Material", "物料"], ["material", "stock", "shortage", "short of", "supplier", "delivery", "warehouse", "label", "packag", "resin", "lot", "kanban", "物料", "库存", "缺料", "供应商", "到货", "仓库", "标签", "包装", "批次", "看板"]],
    ["people", ["Manpower", "人员"], ["absent", " mc", "sick", "leave", "overtime", " ot ", "new joiner", "trainee", "operator", "short of people", "short-handed", "缺勤", "病假", "请假", "加班", "人手", "新人", "实习", "操作员"]]
  ];
  var ACTW = ["need", "must", "please", "follow up", "follow-up", "pending", "waiting", "to do", "todo", "tbc", "not yet", "check", "call", "arrange", "chase", "order", "replace", "需要", "请", "跟进", "待", "等待", "未", "安排", "确认", "检查", "更换", "联系"];
  var ROLES = [["maintenance", "Maintenance"], ["qa", "QA"], ["qc", "QC"], ["planner", "Planner"], ["planning", "Planning"], ["warehouse", "Warehouse"], ["store", "Store"], ["engineer", "Engineering"], ["technician", "Technician"], ["supervisor", "Supervisor"], ["hr", "HR"], ["维修", "维修"], ["质量", "质量"], ["计划", "计划"], ["仓库", "仓库"], ["工程", "工程"], ["技术员", "技术员"], ["主管", "主管"], ["人事", "人事"]];
  function handover() {
    if (!$("hoOut")) return;
    function sample() {
      set("hoNotes", L(
        "Night shift L2. Output 860/900, conveyor jam at 2am lost 25min, maintenance fixed but belt still slipping need to check again.\n" +
        "Oil leak near press 3, put absorbent, area not cordoned yet!\n" +
        "Burr found on part 1045 batch 2210, 40 pcs on hold in QA cage. Waiting QA decision.\n" +
        "Resin for tomorrow only enough until 10am, warehouse to deliver - please chase\n" +
        "Ahmad on MC, Lina covered station 4. New joiner still not trained on packing.\n" +
        "@Ravi to call supplier about labels",
        "夜班 2 号线。产量 860/900，凌晨 2 点输送带卡料停了 25 分钟，维修已处理，但皮带还在打滑，需要再检查。\n" +
        "3 号冲床附近漏油，已放吸油棉，区域还没围起来！\n" +
        "1045 零件 2210 批次发现毛刺，40 件已隔离在质量区，等待质量判定。\n" +
        "明天的树脂只够用到上午 10 点，仓库要送料，请跟进\n" +
        "阿明病假，丽娜顶了 4 号工位。新人还没接受包装培训。\n" +
        "@小李 联系供应商处理标签问题"));
    }
    function run() {
      var out = $("hoOut"); out.dataset.ran = "1";
      var raw = v("hoNotes");
      var parts = raw.split(/\n|(?<=[.!?。！？；;])\s+|•/).map(function (s) { return s.replace(/^[-–*\d.)\s]+/, "").trim(); }).filter(function (s) { return s.length > 2; });
      var cats = {}; HO.forEach(function (h) { cats[h[0]] = []; }); cats.other = [];
      var actions = [];
      parts.forEach(function (s) {
        var low = " " + s.toLowerCase() + " ";
        var hit = HO.filter(function (h) { return h[2].some(function (k) { return low.indexOf(k) > -1; }); });
        if (hit.length) hit.forEach(function (h) { cats[h[0]].push(s); }); else cats.other.push(s);
        if (ACTW.some(function (k) { return low.indexOf(k) > -1; }) || /!$/.test(s)) {
          var m = s.match(/@([\w一-龥]+)/) || s.match(/\bby ([A-Z][a-z]+)/) || s.match(/owner:?\s*([\w一-龥]+)/i);
          var owner = m ? m[1] : null;
          if (!owner) { var r = ROLES.filter(function (x) { return low.indexOf(x[0]) > -1; })[0]; if (r) owner = r[1] + L(" (suggested)", "（建议）"); }
          var dl = s.match(/\b(by|before|until)\s+[\w:]+|\btoday\b|\btomorrow\b|\beod\b|end of (the )?shift|今天|明天|下班前|\d+\s?点前|到\S{0,4}点/i);
          actions.push({ s: s, owner: owner, due: dl ? dl[0] : null, safety: hit.some(function (h) { return h[0] === "safety"; }) });
        }
      });
      var miss = [];
      if (!cats.safety.length) miss.push(L("Safety status is not mentioned. Confirm 'no incidents' or list them.", "没有提到安全状况。请确认“无事故”或列出事件。"));
      if (!/\d+\s*\/\s*\d+|\d+\s*(pcs|units|件)|output|产量/i.test(raw)) miss.push(L("No output vs plan figure.", "没有产量对比计划的数字。"));
      var noOwner = actions.filter(function (a) { return !a.owner; }).length, noDue = actions.filter(function (a) { return !a.due; }).length;
      if (noOwner) miss.push(L(noOwner + " action(s) have no owner.", noOwner + " 个行动没有负责人。"));
      if (noDue) miss.push(L(noDue + " action(s) have no deadline.", noDue + " 个行动没有期限。"));
      if (cats.quality.length && !/\d/.test(cats.quality.join(" "))) miss.push(L("Quality issue has no quantity.", "质量问题没有数量。"));
      var prio = [];
      cats.safety.forEach(function (s) { prio.push(L("Safety first: ", "安全优先：") + s); });
      actions.filter(function (a) { return !a.safety; }).slice(0, 3 - Math.min(prio.length, 2)).forEach(function (a) { prio.push(a.s); });
      var CAT = function (h) {
        var list = cats[h[0]];
        return '<div class="hoCat ' + h[0] + '"><h4>' + L(h[1][0], h[1][1]) + "<em>" + list.length + "</em></h4>" + (list.length ? ul(list.map(esc)) : '<p class="none">' + L("Not mentioned", "未提及") + "</p>") + "</div>";
      };
      out.innerHTML =
        "<h3>" + L("Handover by topic", "按主题整理的交接") + '</h3><div class="hoCols">' + HO.map(CAT).join("") + (cats.other.length ? CAT(["other", ["Other", "其他"]]) : "") + "</div>" +
        "<h3>" + L("Outstanding actions", "未完成行动") + "</h3>" + (actions.length ? '<div class="tblWrapR"><table class="tracker dtbl"><thead><tr><th>#</th><th>' + L("Action", "行动") + "</th><th>" + L("Follow-up owner", "跟进负责人") + "</th><th>" + L("Deadline", "期限") + "</th></tr></thead><tbody>" +
          actions.map(function (a, i) { return "<tr><td>" + (i + 1) + "</td><td>" + esc(a.s) + "</td><td>" + (a.owner ? esc(a.owner) : '<b style="color:var(--amber)">' + L("Owner needed", "需指定负责人") + "</b>") + "</td><td>" + (a.due ? esc(a.due) : '<b style="color:var(--amber)">' + L("Set a deadline", "需设定期限") + "</b>") + "</td></tr>"; }).join("") + "</tbody></table></div>" : ul([L("No open actions found.", "没有发现未完成行动。")])) +
        "<h3>" + L("Next-shift priorities", "下一班优先事项") + "</h3>" + ul(prio.length ? prio.map(esc) : [L("No urgent items. Run the line to plan.", "没有紧急事项，按计划生产。")]) +
        "<h3>" + L("Missing information", "缺失信息") + "</h3>" + (miss.length ? ul(miss, "miss") : ul([L("Nothing obvious missing.", "没有明显缺失。")]));
    }
    $("dSample").addEventListener("click", function () { sample(); run(); });
    wire("hoOut", "shift-handover-summary.txt", run);
  }

  document.addEventListener("DOMContentLoaded", function () { daily(); rootCause(); handover(); });
})();
