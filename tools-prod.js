/* =========================================================
   LAOYU — Production problem-solving tools
   Downtime Troubleshooter · OEE Loss Calculator ·
   Fishbone + 5-Why Builder · 8D Report Builder
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
  function num(id) { var el = $(id); var v = el ? parseFloat(el.value) : NaN; return isFinite(v) ? v : NaN; }
  function on(ev, fn) { document.addEventListener(ev, fn); }
  function copyText(text, btn) {
    var done = function () { var o = btn.innerHTML; btn.textContent = L("COPIED ✓", "已复制 ✓"); setTimeout(function () { btn.innerHTML = o; }, 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { fb(); done(); });
    else { fb(); done(); }
    function fb() { var ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); } catch (e) {} ta.remove(); }
  }
  window.LAOYU_TOOLS = { L: L, zh: zh, load: load, save: save, esc: esc, copyText: copyText };

  /* =======================================================
     1. DOWNTIME TROUBLESHOOTER
     ======================================================= */
  var SYM = {
    nostart: {
      t: ["Machine won't start", "设备无法启动"],
      safe: ["Before touching anything: follow lock-out/tag-out and your site safety rules.", "动手之前：先按上锁挂牌（LOTO）和现场安全规定执行。"],
      checks: [
        ["Machine", "Emergency stop pressed, safety door or light curtain open?", "急停按钮被按下、安全门或光幕没有关好？"],
        ["Machine", "Power, air pressure, hydraulics and cooling water all ON and in range?", "电源、气压、液压、冷却水是否都已开启且在正常范围？"],
        ["Machine", "Read the HMI alarm list. Note the exact code and text before resetting.", "查看 HMI 报警清单，复位前记下完整的报警代码和内容。"],
        ["Method", "Is the machine in the right mode (auto / manual / setup) and program?", "设备模式（自动 / 手动 / 调机）和程序是否正确？"],
        ["Material", "Start conditions met: material loaded, sensors see the part, upstream ready?", "启动条件是否满足：已上料、传感器检测到工件、上游已就绪？"],
        ["Man", "Was anything changed on the last shift? Ask the previous operator or technician.", "上一个班有没有改过什么？问一下上一班的操作员或技术员。"]
      ],
      causes: [["Safety circuit open (door, E-stop, light curtain)", "安全回路断开（门、急停、光幕）"], ["Utility missing (air, power, hydraulics)", "公用设施缺失（气、电、液压）"], ["Wrong mode or program after a changeover", "换线后模式或程序不对"], ["Sensor dirty, loose or misaligned", "传感器脏污、松动或偏位"]],
      esc: [["No clear alarm and basics are OK after 15 minutes", "15 分钟后基本项都正常但没有明确报警"], ["Any electrical cabinet, safety circuit or PLC work is needed", "需要动电柜、安全回路或 PLC"]],
      prevent: [["Add the start-up conditions to a one-page start checklist at the machine", "把启动条件做成一页启动检查表，贴在设备旁"], ["Log every alarm code so repeat codes show up in the weekly review", "记录每个报警代码，让重复报警在周会上浮现"]]
    },
    micro: {
      t: ["Keeps stopping (short stops)", "频繁短停"],
      safe: ["Short stops tempt people to reach in. Never clear jams with the machine live.", "短停最容易让人伸手进去。设备带电时绝不能清卡料。"],
      checks: [
        ["Machine", "Count the stops for 30 minutes. Write down where and when each one happens.", "统计 30 分钟内的停机次数，记下每次发生的位置和时间。"],
        ["Material", "Do stops follow a new batch, reel or supplier lot? Compare with the last good lot.", "是否在换新批次、新卷料或新供应商批号后开始？和上一批好的材料对比。"],
        ["Machine", "Check sensors and guides at the stop point: dirt, wear, loose brackets.", "检查停机位置的传感器和导轨：脏污、磨损、支架松动。"],
        ["Method", "Was a speed, timing or recipe setting changed recently?", "最近有没有改过速度、时序或配方参数？"],
        ["Man", "Does it happen with every operator, or only some? Watch the loading method.", "是所有操作员都会发生，还是只有部分人？观察上料方式。"],
        ["Environment", "Temperature, humidity or static changes during the day?", "一天中温度、湿度或静电是否有变化？"]
      ],
      causes: [["Material variation (size, curl, burrs)", "材料波动（尺寸、卷曲、毛刺）"], ["Worn or dirty guides and sensors", "导轨、传感器磨损或脏污"], ["Speed set beyond what the process can hold", "速度设置超出工艺能力"], ["Inconsistent loading by hand", "人工上料不一致"]],
      esc: [["More than 10 stops per hour for 2 hours", "连续 2 小时每小时停机超过 10 次"], ["Stops are rising day by day", "停机次数一天比一天多"]],
      prevent: [["Track short stops on a simple tally sheet. They hide in OEE as speed loss", "用简单的计数表追踪短停，它们在 OEE 里常被藏成速度损失"], ["Add the sensor/guide cleaning to the daily autonomous maintenance check", "把传感器和导轨清洁加进每日自主保养"]]
    },
    slow: {
      t: ["Running slower than normal", "运行速度比平时慢"],
      safe: ["Do not bypass interlocks to gain speed.", "不要为了提速而屏蔽联锁。"],
      checks: [
        ["Method", "Compare the actual cycle time with the standard. Is the standard still right?", "把实际节拍和标准节拍对比，标准本身还对吗？"],
        ["Machine", "Was speed reduced on purpose to hide another problem (quality, jams)?", "是不是有人为了掩盖其他问题（质量、卡料）故意降速？"],
        ["Machine", "Check for wear: belts, bearings, tooling, pneumatic leaks (listen for hissing).", "检查磨损：皮带、轴承、模具，气路泄漏（听有没有嘶嘶声）。"],
        ["Material", "Is material arriving late or in the wrong quantity, so the line waits?", "物料是不是晚到或数量不对，导致产线在等？"],
        ["Man", "New or untrained operator on the station? Check the skills matrix.", "岗位上是新人或未培训人员吗？查看技能矩阵。"]
      ],
      causes: [["Speed turned down to cover a quality or jam problem", "为掩盖质量或卡料问题而降速"], ["Wear increasing cycle time", "磨损导致节拍变长"], ["Waiting for material or the upstream process", "等待物料或上游工序"], ["Skill gap on a key station", "关键岗位技能不足"]],
      esc: [["Speed loss above 10% for a full shift", "整个班次速度损失超过 10%"], ["The standard cycle time is disputed", "对标准节拍有争议"]],
      prevent: [["Show actual vs standard cycle time at the line every hour", "每小时在产线展示实际节拍与标准节拍"], ["Run the OEE Loss Calculator weekly to see speed loss in minutes", "每周用 OEE 损失计算器，把速度损失换算成分钟"]]
    },
    quality: {
      t: ["Making bad parts", "生产出不良品"],
      safe: ["Stop and contain first. Separate and label suspect parts before anything else.", "先停机并隔离。在做任何事情之前，先把可疑品分开并标识。"],
      checks: [
        ["Measurement", "Confirm the defect with a second measurement or a second person. Is the gauge OK?", "用第二次测量或第二个人确认缺陷，量具是否正常？"],
        ["Method", "When did the last good part come out? Quarantine everything made since then.", "最后一个好零件是什么时候？把之后生产的全部隔离。"],
        ["Material", "New material lot? Compare a good part and a bad part side by side.", "是新批次材料吗？把好件和坏件并排比较。"],
        ["Machine", "Tool wear, broken tool, clamping, temperature or pressure out of range?", "刀具磨损或断裂、夹紧、温度或压力是否超出范围？"],
        ["Method", "Was a setting, program or recipe changed? Check the change log.", "参数、程序或配方有没有改过？查看变更记录。"],
        ["Man", "Is the work instruction followed? Watch one full cycle without interrupting.", "是否按作业指导书操作？不打扰地观察一个完整循环。"]
      ],
      causes: [["Tool wear or breakage", "刀具磨损或断裂"], ["Material lot outside spec", "材料批次超出规格"], ["Unapproved setting change", "未经批准的参数变更"], ["Gauge or measurement error", "量具或测量误差"]],
      esc: [["Any suspect product may have already shipped", "可能已有可疑品出货"], ["Safety-critical or customer-specified characteristic", "涉及安全关键或客户指定的特性"]],
      prevent: [["Use the Fishbone + 5-Why Builder to find the real root cause", "用鱼骨图 + 5 个为什么工具找出真正的根本原因"], ["If it reached the customer, open an 8D report", "如果已到客户手里，开一份 8D 报告"]]
    },
    alarm: {
      t: ["Alarm on the screen", "屏幕出现报警"],
      safe: ["Do not reset repeatedly without understanding the alarm. It can hide real damage.", "不了解报警原因前不要反复复位，可能会掩盖真实的损坏。"],
      checks: [
        ["Machine", "Photograph the alarm screen: code, text, time.", "拍下报警画面：代码、内容、时间。"],
        ["Method", "Look the code up in the machine manual or the alarm list at the line.", "在设备手册或产线报警清单里查这个代码。"],
        ["Machine", "Go to the location the alarm names. Look, listen, feel for heat (safely).", "到报警指示的位置，在安全前提下看、听、感受温度。"],
        ["Man", "Has this alarm happened before? Check the logbook for the last fix.", "这个报警以前出现过吗？查日志看上次怎么修的。"]
      ],
      causes: [["Sensor or switch fault", "传感器或开关故障"], ["Overload (motor, servo, pressure)", "过载（电机、伺服、压力）"], ["Interlock or safety condition", "联锁或安全条件"], ["Real mechanical problem behind a repeating alarm", "反复报警背后的真实机械问题"]],
      esc: [["Same alarm more than 3 times in a shift", "同一报警一个班超过 3 次"], ["Alarm mentions servo, drive, overcurrent or safety", "报警涉及伺服、驱动器、过流或安全"]],
      prevent: [["Build a simple top-10 alarm guide with the fix for each", "整理前 10 个常见报警及处理方法的简易指南"], ["Review repeat alarms with maintenance every week", "每周和维修一起回顾重复报警"]]
    },
    jam: {
      t: ["Material jam or feeding problem", "卡料或送料问题"],
      safe: ["Lock out before clearing. Use tools, not hands, where pinch points exist.", "清理前先上锁。有夹点的地方用工具，不要用手。"],
      checks: [
        ["Material", "Inspect the jammed piece: wrong size, damaged, wet, bent?", "检查卡住的料：尺寸不对、损坏、受潮还是弯曲？"],
        ["Machine", "Check feeder guides, rails and grippers for wear or misalignment.", "检查送料导轨、轨道、夹爪是否磨损或偏位。"],
        ["Method", "Is the loading quantity or orientation per the standard?", "上料数量或方向是否符合标准？"],
        ["Machine", "Check air pressure and vacuum at the feeder.", "检查送料处的气压和真空。"]
      ],
      causes: [["Out-of-spec or damaged material", "材料超差或损坏"], ["Guide or gripper wear", "导轨或夹爪磨损"], ["Overloading the feeder", "送料器装得太满"], ["Low air or vacuum", "气压或真空不足"]],
      esc: [["Jams damage the machine or tooling", "卡料损坏了设备或模具"], ["The same supplier lot keeps jamming", "同一供应商批次反复卡料"]],
      prevent: [["Mark the max fill line on the feeder", "在送料器上标出最高装料线"], ["Feed supplier lot issues back to purchasing with photos", "把供应商批次问题连同照片反馈给采购"]]
    },
    noise: {
      t: ["Strange noise, heat or vibration", "异响、发热或振动"],
      safe: ["Unusual noise or heat can mean failure is close. Stop if in doubt.", "异常的声音或发热可能意味着即将故障。拿不准就停机。"],
      checks: [
        ["Machine", "Locate the source: motor, gearbox, bearing, pump, belt?", "找出来源：电机、齿轮箱、轴承、泵还是皮带？"],
        ["Machine", "Check lubrication: oil level, grease points, leaks on the floor.", "检查润滑：油位、加油点、地面有没有漏油。"],
        ["Machine", "Loose bolts, guards or brackets that rattle?", "有没有松动的螺栓、护罩或支架在响？"],
        ["Measurement", "If you have one, take a temperature reading and compare with a sister machine.", "如果有测温仪，测一下温度并和同型号设备对比。"]
      ],
      causes: [["Bearing failing", "轴承即将损坏"], ["Lack of lubrication", "润滑不足"], ["Belt or coupling worn", "皮带或联轴器磨损"], ["Loose parts", "零件松动"]],
      esc: [["Temperature keeps rising or there is a burning smell", "温度持续上升或有烧焦味"], ["Vibration is visible or getting worse", "振动肉眼可见或在加剧"]],
      prevent: [["Add listen/touch/look checks to the daily routine", "把听、摸、看检查加入日常点检"], ["Ask maintenance for a lubrication schedule at the machine", "请维修在设备旁贴润滑计划"]]
    },
    waiting: {
      t: ["Line waiting (no material, people or instructions)", "产线在等（缺料、缺人或缺指令）"],
      safe: ["Use waiting time safely: 5S, cleaning, or training, not shortcuts.", "安全地利用等待时间：做 5S、清洁或培训，不要走捷径。"],
      checks: [
        ["Material", "What exactly is missing? Part number, quantity, where it should come from.", "具体缺什么？料号、数量、应该从哪里来。"],
        ["Method", "Is the plan or work order released and clear to the team?", "生产计划或工单是否已下达，团队是否清楚？"],
        ["Man", "Who is missing? Use the Manpower Gap Calculator to rebalance.", "缺谁？用人力缺口计算器重新平衡人员。"],
        ["Method", "Is the upstream process or quality release holding the material?", "是不是上游工序或质量放行卡住了物料？"]
      ],
      causes: [["Late material delivery or picking", "物料配送或拣料延迟"], ["Plan not released or changed late", "计划未下达或临时变更"], ["Absence not covered", "缺勤没有补位"], ["Waiting for quality release", "等待质量放行"]],
      esc: [["Waiting longer than 30 minutes with no ETA", "等待超过 30 分钟且没有预计时间"], ["A customer order due today is at risk", "今天要交的客户订单有风险"]],
      prevent: [["Agree a material call-off signal (kanban) with the warehouse", "和仓库约定叫料信号（看板）"], ["Confirm tomorrow's plan, people and material before the shift ends", "下班前确认明天的计划、人员和物料"]]
    }
  };
  var CAT = { Man: ["Man", "人"], Machine: ["Machine", "机"], Method: ["Method", "法"], Material: ["Material", "料"], Measurement: ["Measurement", "测"], Environment: ["Environment", "环"] };

  function downtime() {
    var box = $("dtSym");
    if (!box) return;
    var KEY = "laoyuDT";
    var st = load(KEY, { sym: null, done: {}, start: null, end: null });
    var timer = null;

    function chips() {
      box.innerHTML = Object.keys(SYM).map(function (k) {
        return '<button type="button" class="dtChip' + (st.sym === k ? " on" : "") + '" data-k="' + k + '">' + esc(L(SYM[k].t[0], SYM[k].t[1])) + "</button>";
      }).join("");
    }
    function guide() {
      var g = $("dtGuide"), s = SYM[st.sym];
      if (!s) { g.innerHTML = '<p class="resNote">' + L("Pick what you see above. The checks appear here, safest and fastest first.", "在上面选择你看到的情况，检查步骤会出现在这里，按最安全、最快的顺序排列。") + "</p>"; return; }
      var d = st.done[st.sym] || {};
      var n = s.checks.length, c = s.checks.filter(function (x, i) { return d[i]; }).length;
      g.innerHTML =
        '<div class="dtSafe">⚠ ' + esc(L(s.safe[0], s.safe[1])) + "</div>" +
        '<div class="dtProg"><span>' + L("Checks done", "已完成检查") + " <b>" + c + " / " + n + '</b></span><i><b style="width:' + (c / n * 100) + '%"></b></i></div>' +
        '<ol class="dtChecks">' + s.checks.map(function (x, i) {
          return '<li class="' + (d[i] ? "ok" : "") + '"><label><input type="checkbox" data-ck="' + i + '"' + (d[i] ? " checked" : "") + '><span class="dtCat">' + esc(L(CAT[x[0]][0], CAT[x[0]][1])) + "</span>" + esc(L(x[1], x[2])) + "</label></li>";
        }).join("") + "</ol>" +
        '<div class="dtCols">' +
          '<div><h3>' + L("Most likely causes", "最可能的原因") + "</h3><ul>" + s.causes.map(function (x) { return "<li>" + esc(L(x[0], x[1])) + "</li>"; }).join("") + "</ul></div>" +
          '<div class="dtEsc"><h3>' + L("Escalate when", "以下情况请升级") + "</h3><ul>" + s.esc.map(function (x) { return "<li>" + esc(L(x[0], x[1])) + "</li>"; }).join("") + "</ul></div>" +
          '<div><h3>' + L("Stop it coming back", "防止再次发生") + "</h3><ul>" + s.prevent.map(function (x) { return "<li>" + esc(L(x[0], x[1])) + "</li>"; }).join("") + "</ul></div>" +
        "</div>";
    }
    function mins() {
      if (!st.start) return 0;
      return Math.max(0, ((st.end || Date.now()) - st.start) / 60000);
    }
    function fmt(m) { var h = Math.floor(m / 60), mm = Math.floor(m % 60), ss = Math.floor((m * 60) % 60); return (h ? h + ":" : "") + String(mm).padStart(h ? 2 : 1, "0") + ":" + String(ss).padStart(2, "0"); }
    function clock() {
      var m = mins(), rate = num("dtRate"), val = num("dtValue");
      $("dtClock").textContent = fmt(m);
      $("dtClockBtn").innerHTML = st.start && !st.end ? L("■ STOP CLOCK", "■ 停止计时") : st.end ? L("↺ NEW DOWNTIME", "↺ 新的停机") : L("▶ START DOWNTIME CLOCK", "▶ 开始停机计时");
      $("dtClockBox").className = "dtClockBox" + (st.start && !st.end ? " live" : "");
      var lost = isFinite(rate) ? m / 60 * rate : NaN;
      $("dtLost").innerHTML =
        '<div class="atChip"><b>' + Math.round(m) + "</b><span>" + L("Minutes down", "停机分钟") + "</span></div>" +
        '<div class="atChip ' + (lost > 0 ? "bad" : "") + '"><b>' + (isFinite(lost) ? Math.round(lost) : "–") + "</b><span>" + L("Units lost", "损失产量") + "</span></div>" +
        '<div class="atChip ' + (lost > 0 && isFinite(val) ? "bad" : "") + '"><b>' + (isFinite(lost) && isFinite(val) ? Math.round(lost * val).toLocaleString() : "–") + "</b><span>" + L("Value lost", "损失金额") + "</span></div>";
      summary();
    }
    function summary() {
      var s = SYM[st.sym], m = Math.round(mins()), rate = num("dtRate");
      var get = function (id) { var e = $(id); return e ? e.value.trim() : ""; };
      var lines = [
        L("DOWNTIME SUMMARY", "停机摘要") + " — " + (get("dtLine") || L("Line / machine", "产线 / 设备")),
        L("Problem", "问题") + ": " + (s ? L(s.t[0], s.t[1]) : "-"),
        L("Duration", "时长") + ": " + m + " " + L("min", "分钟") + (isFinite(rate) && m ? " (" + Math.round(m / 60 * rate) + " " + L("units lost", "件损失") + ")" : ""),
        L("Cause found", "找到的原因") + ": " + (get("dtCause") || "-"),
        L("Action taken", "采取的措施") + ": " + (get("dtAction") || "-"),
        L("Escalated to", "已升级给") + ": " + (get("dtEscTo") || "-"),
        L("Next step / owner", "下一步 / 负责人") + ": " + (get("dtNext") || "-")
      ];
      $("dtOut").textContent = lines.join("\n");
    }

    box.addEventListener("click", function (e) {
      var b = e.target.closest(".dtChip"); if (!b) return;
      st.sym = b.dataset.k; save(KEY, st); chips(); guide(); summary();
      if (window.innerWidth < 760) $("dtGuide").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    $("dtGuide").addEventListener("change", function (e) {
      if (!e.target.matches("[data-ck]")) return;
      st.done[st.sym] = st.done[st.sym] || {};
      st.done[st.sym][e.target.dataset.ck] = e.target.checked;
      save(KEY, st); guide();
    });
    $("dtClockBtn").addEventListener("click", function () {
      if (st.start && !st.end) st.end = Date.now();
      else { st.start = Date.now(); st.end = null; }
      save(KEY, st); clock(); tick();
    });
    $("dtCopy").addEventListener("click", function (e) { copyText($("dtOut").textContent, e.currentTarget); });
    on("input", function (e) { if (e.target.closest("#dtLog") || e.target.id === "dtRate" || e.target.id === "dtValue") clock(); });
    function tick() { clearInterval(timer); if (st.start && !st.end) timer = setInterval(clock, 1000); }
    on("laoyu:lang", function () { chips(); guide(); clock(); });
    on("laoyu:reset", function () { st = { sym: null, done: {}, start: null, end: null }; save(KEY, st); chips(); guide(); clock(); tick(); });
    chips(); guide(); clock(); tick();
  }

  /* =======================================================
     2. OEE LOSS CALCULATOR
     ======================================================= */
  function oee() {
    if (!$("oeeOut")) return;
    var ids = ["oeShift", "oeBreak", "oeDown", "oeCycle", "oeTotal", "oeBad", "oeValue"];
    function calc() {
      var shift = num("oeShift"), brk = num("oeBreak") || 0, down = num("oeDown") || 0, cyc = num("oeCycle"), total = num("oeTotal"), bad = num("oeBad") || 0, val = num("oeValue");
      var out = $("oeeOut");
      if (!(shift > 0) || !(cyc > 0) || !(total >= 0) || !isFinite(total)) {
        out.innerHTML = '<p class="resNote">' + L("Fill in shift length, ideal cycle time and units made to see your OEE.", "填入班次时长、理想节拍和产量，即可看到你的 OEE。") + "</p>";
        return;
      }
      var plan = shift - brk, run = Math.max(0, plan - down);
      var A = plan > 0 ? run / plan : 0;
      var P = run > 0 ? (total * cyc / 60) / run : 0;
      var good = Math.max(0, total - bad), Q = total > 0 ? good / total : 0;
      var O = A * Math.min(P, 1) * Q;
      var speedLoss = Math.max(0, run - total * cyc / 60);       // minutes
      var qualLoss = bad * cyc / 60;                              // minutes
      var losses = [
        ["down", L("Downtime", "停机"), down, L("Availability", "可用率")],
        ["speed", L("Speed & short stops", "速度与短停"), speedLoss, L("Performance", "性能")],
        ["qual", L("Scrap & rework", "报废与返工"), qualLoss, L("Quality", "质量")]
      ];
      var maxL = losses.slice().sort(function (a, b) { return b[2] - a[2]; })[0];
      var unitsPerMin = 60 / cyc;
      var lostUnits = (down + speedLoss) * unitsPerMin + bad;
      var gainHalf = Math.round(maxL[2] / 2 * unitsPerMin);
      var pct = function (x) { return (x * 100).toFixed(1) + "%"; };
      var gauge = function (label, v, cls) {
        return '<div class="oeG ' + cls + '"><span>' + label + "</span><b>" + pct(v) + '</b><i><b style="width:' + Math.min(100, v * 100) + '%"></b></i></div>';
      };
      var band = O >= 0.85 ? ["ok", L("World-class level (85%+ is the often-quoted benchmark).", "达到世界级水平（常被引用的标杆是 85% 以上）。")]
        : O >= 0.6 ? ["warn", L("Typical for many plants. There is real capacity hiding in the losses below.", "很多工厂的常见水平。下面的损失里藏着可观的产能。")]
        : ["bad", L("Big losses. Fixing the biggest one will free a lot of capacity.", "损失很大。先解决最大的一项，就能释放大量产能。")];
      var ACT = {
        down: [L("Log every stop over 5 minutes with its cause, then attack the top 3.", "记录每次超过 5 分钟的停机及原因，然后先解决前 3 名。"), L("Use the Downtime Troubleshooter on the most frequent stop.", "对最常见的停机使用停机排查工具。"), L("Cut changeover time: prepare tools and material before the line stops (SMED).", "缩短换线时间：停线前就准备好工具和物料（SMED 快速换模）。")],
        speed: [L("Check the ideal cycle time is right. If it is, find out why the line runs slower.", "确认理想节拍是否正确。如果正确，找出产线为什么跑得慢。"), L("Count short stops for 30 minutes; they usually hide here.", "统计 30 分钟内的短停次数，它们通常藏在这里。"), L("Look for speed turned down to cover a quality or jam problem.", "看看是不是为了掩盖质量或卡料问题而降了速。")],
        qual: [L("Build a defect Pareto: which defect, which station, which shift.", "做一个缺陷柏拉图：哪种缺陷、哪个工位、哪个班。"), L("Run the Fishbone + 5-Why Builder on the top defect.", "对最多的缺陷使用鱼骨图 + 5 个为什么工具。"), L("Check start-up scrap after changeovers separately.", "单独检查换线后的开机报废。")]
      };
      out.innerHTML =
        '<div class="oeTop"><div class="oeBig ' + band[0] + '"><span>OEE</span><b>' + pct(O) + "</b><small>" + band[1] + "</small></div>" +
        '<div class="oeGs">' + gauge(L("Availability", "可用率"), A, "") + gauge(L("Performance", "性能"), Math.min(P, 1), "") + gauge(L("Quality", "质量"), Q, "") + "</div></div>" +
        (P > 1.02 ? '<p class="oeWarn">⚠ ' + L("Performance is above 100%. The ideal cycle time is probably set too slow. Check it.", "性能超过 100%，理想节拍可能设得太慢，请检查。") + "</p>" : "") +
        '<h3 class="mpH">' + L("Where the time went (minutes)", "时间都去哪了（分钟）") + "</h3>" +
        '<div class="oeLoss">' + losses.map(function (l) {
          var w = plan > 0 ? l[2] / plan * 100 : 0;
          return '<div class="oeRow' + (l === maxL && l[2] > 0 ? " top" : "") + '"><span>' + l[1] + " <em>" + l[3] + '</em></span><i><b style="width:' + Math.min(100, w) + '%"></b></i><b>' + Math.round(l[2]) + "</b></div>";
        }).join("") + "</div>" +
        '<div class="mpKpis">' +
          '<div class="atChip bad"><b>' + Math.round(lostUnits).toLocaleString() + "</b><span>" + L("Units lost this shift", "本班损失产量") + "</span></div>" +
          (isFinite(val) ? '<div class="atChip bad"><b>' + Math.round(lostUnits * val).toLocaleString() + "</b><span>" + L("Value lost this shift", "本班损失金额") + "</span></div>" : "") +
          '<div class="atChip ok"><b>+' + gainHalf.toLocaleString() + "</b><span>" + L("Units per shift if you halve the biggest loss", "最大损失减半，每班可多产") + "</span></div>" +
        "</div>" +
        (maxL[2] > 0 ? '<div class="oeAct"><h3>' + L("Biggest loss: ", "最大损失：") + maxL[1] + "</h3><ol>" + ACT[maxL[0]].map(function (a) { return "<li>" + a + "</li>"; }).join("") + "</ol></div>" : "");
    }
    on("input", function (e) { if (ids.indexOf(e.target.id) > -1) calc(); });
    on("laoyu:lang", calc);
    on("laoyu:reset", function () { setTimeout(calc, 0); });
    setTimeout(calc, 50);
  }

  /* =======================================================
     3. FISHBONE + 5-WHY BUILDER
     ======================================================= */
  var BONES = [
    ["man", "Man / People", "人", "Training, experience, fatigue, shift change, communication?", "培训、经验、疲劳、换班、沟通？"],
    ["machine", "Machine", "机", "Wear, settings, maintenance, tooling, breakdowns?", "磨损、参数、保养、模具、故障？"],
    ["method", "Method", "法", "Work instruction, sequence, recipe, recent changes?", "作业指导、顺序、配方、最近的变更？"],
    ["material", "Material", "料", "Supplier lot, storage, specification, handling?", "供应商批次、存放、规格、搬运？"],
    ["measure", "Measurement", "测", "Gauge accuracy, method, calibration, who measures?", "量具精度、测量方法、校准、谁来测量？"],
    ["env", "Environment", "环", "Temperature, humidity, dust, lighting, layout?", "温度、湿度、粉尘、照明、布局？"]
  ];
  function fishbone() {
    if (!$("fbBones")) return;
    var KEY = "laoyuFB";
    var st = load(KEY, { causes: {}, sel: null, why: {} });
    BONES.forEach(function (b) { st.causes[b[0]] = st.causes[b[0]] || []; });

    function bonesUI() {
      $("fbBones").innerHTML = BONES.map(function (b) {
        var list = st.causes[b[0]];
        return '<div class="fbBone"><h3><span>' + (zh() ? b[2] : BONES.indexOf(b) + 1) + "</span>" + esc(L(b[1], b[2])) + '</h3><p class="fbQ">' + esc(L(b[3], b[4])) + "</p>" +
          '<ul class="fbList">' + list.map(function (c, i) {
            return '<li class="' + (c.s ? "sus" : "") + '"><button type="button" class="fbStar" data-b="' + b[0] + '" data-i="' + i + '" title="' + L("Mark as suspect", "标记为嫌疑原因") + '">★</button><span>' + esc(c.t) + '</span><button type="button" class="fbDel" data-b="' + b[0] + '" data-i="' + i + '" aria-label="' + L("Remove", "删除") + '">×</button></li>';
          }).join("") + "</ul>" +
          '<form class="fbAdd" data-b="' + b[0] + '"><input placeholder="' + L("Add a possible cause", "添加一个可能原因") + '" maxlength="80"><button class="btn outline" type="submit">+</button></form></div>';
      }).join("");
    }
    function diagram() {
      var prob = ($("fbProblem") && $("fbProblem").value.trim()) || L("Problem", "问题");
      var W = 1000, H = 420, spineY = 210, headX = 820;
      var top = BONES.slice(0, 3), bot = BONES.slice(3);
      var s = '<svg viewBox="0 0 ' + W + " " + H + '" class="fbSvg" role="img" aria-label="' + L("Fishbone diagram", "鱼骨图") + '">';
      s += '<line x1="40" y1="' + spineY + '" x2="' + headX + '" y2="' + spineY + '" class="sp"/>';
      s += '<path d="M' + headX + "," + (spineY - 60) + " L" + (headX + 150) + "," + (spineY - 60) + " L" + (headX + 150) + "," + (spineY + 60) + " L" + headX + "," + (spineY + 60) + ' Z" class="hd"/>';
      s += '<foreignObject x="' + (headX + 6) + '" y="' + (spineY - 56) + '" width="138" height="112"><div xmlns="http://www.w3.org/1999/xhtml" class="fbHead">' + esc(prob) + "</div></foreignObject>";
      function bone(b, i, up) {
        var x = 130 + i * 240, y0 = up ? 30 : H - 30;
        var s2 = '<line x1="' + x + '" y1="' + y0 + '" x2="' + (x + 120) + '" y2="' + spineY + '" class="bn"/>';
        s2 += '<text x="' + x + '" y="' + (up ? y0 - 8 : y0 + 20) + '" class="bt">' + esc(L(b[1], b[2])) + "</text>";
        var list = st.causes[b[0]].slice(0, 5);
        list.forEach(function (c, k) {
          var f = (k + 1) / 6, bx = x + 120 * f, by = y0 + (spineY - y0) * f;
          s2 += '<line x1="' + (bx - 100) + '" y1="' + by + '" x2="' + bx + '" y2="' + by + '" class="' + (c.s ? "cs" : "cl") + '"/>';
          s2 += '<text x="' + (bx - 102) + '" y="' + (by - 4) + '" class="' + (c.s ? "ctS" : "ct") + '">' + esc(c.t.length > 22 ? c.t.slice(0, 21) + "…" : c.t) + "</text>";
        });
        return s2;
      }
      top.forEach(function (b, i) { s += bone(b, i, true); });
      bot.forEach(function (b, i) { s += bone(b, i, false); });
      s += "</svg>";
      $("fbDiagram").innerHTML = s;
    }
    function suspects() {
      var out = [];
      BONES.forEach(function (b) { st.causes[b[0]].forEach(function (c, i) { if (c.s) out.push({ k: b[0] + ":" + i, t: c.t, b: L(b[1], b[2]) }); }); });
      return out;
    }
    function whyUI() {
      var sus = suspects(), sel = $("fbSel");
      if (!sus.length) {
        sel.innerHTML = "";
        $("fbWhy").innerHTML = '<p class="resNote">' + L("Mark one or more causes with ★ above. Then drill into each one here with 5 Whys.", "在上面用 ★ 标记一个或多个嫌疑原因，然后在这里用 5 个为什么逐一深挖。") + "</p>";
        return;
      }
      if (!sus.some(function (x) { return x.k === st.sel; })) st.sel = sus[0].k;
      sel.innerHTML = sus.map(function (x) { return '<button type="button" class="dtChip' + (x.k === st.sel ? " on" : "") + '" data-k="' + x.k + '">★ ' + esc(x.t) + "</button>"; }).join("");
      var w = st.why[st.sel] = st.why[st.sel] || { w: ["", "", "", "", ""], root: "", fix: "", owner: "", due: "", verify: "" };
      var cur = sus.filter(function (x) { return x.k === st.sel; })[0];
      $("fbWhy").innerHTML =
        '<div class="whyChain"><div class="whyStart"><span>' + esc(cur.b) + "</span>" + esc(cur.t) + "</div>" +
        w.w.map(function (v, i) {
          return '<div class="whyStep"><label for="why' + i + '">' + L("Why", "为什么") + " " + (i + 1) + '?</label><input id="why' + i + '" data-w="' + i + '" value="' + esc(v) + '" placeholder="' + L("Because…", "因为……") + '"></div>';
        }).join("") + "</div>" +
        '<div class="fldGrid fbFix">' +
          '<div class="fld wide"><label for="fbRoot">' + L("Root cause (the last real answer)", "根本原因（最后一个真实的答案）") + '</label><input id="fbRoot" data-x="root" value="' + esc(w.root) + '"></div>' +
          '<div class="fld wide"><label for="fbFixI">' + L("Countermeasure (fix the root, not the symptom)", "对策（解决根本原因，而不是症状）") + '</label><input id="fbFixI" data-x="fix" value="' + esc(w.fix) + '"></div>' +
          '<div class="fld"><label for="fbOwner">' + L("Owner", "负责人") + '</label><input id="fbOwner" data-x="owner" value="' + esc(w.owner) + '"></div>' +
          '<div class="fld"><label for="fbDue">' + L("Due date", "截止日期") + '</label><input id="fbDue" type="date" data-x="due" value="' + esc(w.due) + '"></div>' +
          '<div class="fld wide"><label for="fbVer">' + L("How will you prove it worked?", "如何证明对策有效？") + '</label><input id="fbVer" data-x="verify" value="' + esc(w.verify) + '"></div>' +
        "</div>" +
        '<p class="resNote">' + L("Tip: if you can read your chain backwards using \"therefore\" and it still makes sense, the logic holds.", "小技巧：用“所以”把这条链倒着读一遍，如果仍然说得通，逻辑就成立。") + "</p>";
    }
    function all() { bonesUI(); diagram(); whyUI(); }

    $("fbBones").addEventListener("submit", function (e) {
      e.preventDefault();
      var f = e.target.closest(".fbAdd"), inp = f.querySelector("input"), v = inp.value.trim();
      if (!v) return;
      st.causes[f.dataset.b].push({ t: v, s: false }); save(KEY, st); all();
      var again = document.querySelector('.fbAdd[data-b="' + f.dataset.b + '"] input'); if (again) again.focus();
    });
    $("fbBones").addEventListener("click", function (e) {
      var b = e.target.closest(".fbStar, .fbDel"); if (!b) return;
      var list = st.causes[b.dataset.b], i = +b.dataset.i;
      if (b.classList.contains("fbStar")) list[i].s = !list[i].s;
      else { list.splice(i, 1); st.why = {}; }
      save(KEY, st); all();
    });
    $("fbSel").addEventListener("click", function (e) { var b = e.target.closest(".dtChip"); if (!b) return; st.sel = b.dataset.k; save(KEY, st); whyUI(); });
    $("fbWhy").addEventListener("input", function (e) {
      var w = st.why[st.sel]; if (!w) return;
      if (e.target.dataset.w != null) w.w[+e.target.dataset.w] = e.target.value;
      if (e.target.dataset.x) w[e.target.dataset.x] = e.target.value;
      save(KEY, st);
    });
    on("input", function (e) { if (e.target.id === "fbProblem") diagram(); });
    on("laoyu:lang", all);
    on("laoyu:reset", function () { st = { causes: {}, sel: null, why: {} }; BONES.forEach(function (b) { st.causes[b[0]] = []; }); save(KEY, st); setTimeout(all, 0); });
    setTimeout(all, 30);
  }

  /* =======================================================
     4. 8D REPORT BUILDER — progress per discipline
     ======================================================= */
  function eightD() {
    var ds = document.querySelectorAll("[data-d]");
    if (!ds.length) return;
    function prog() {
      var total = 0, doneN = 0;
      var nav = $("d8Nav");
      var items = [];
      ds.forEach(function (sec) {
        var f = sec.querySelectorAll("[data-keep]"), filled = 0;
        f.forEach(function (el) { if (el.type === "checkbox" ? el.checked : el.value.trim()) filled++; });
        var p = f.length ? filled / f.length : 0;
        total++; if (p >= 0.6) doneN++;
        var st = p >= 0.6 ? "ok" : p > 0 ? "warn" : "";
        sec.classList.toggle("dDone", p >= 0.6);
        items.push('<a href="#' + sec.id + '" class="' + st + '"><b>' + sec.dataset.d + "</b><span>" + Math.round(p * 100) + "%</span></a>");
      });
      nav.innerHTML = items.join("");
      $("d8Pct").textContent = Math.round(doneN / total * 100) + "%";
      $("d8Bar").style.width = (doneN / total * 100) + "%";
    }
    on("input", function (e) { if (e.target.matches("[data-keep]")) prog(); });
    on("change", function (e) { if (e.target.matches("[data-keep]")) prog(); });
    on("laoyu:reset", function () { setTimeout(prog, 0); });
    setTimeout(prog, 80);
  }

  document.addEventListener("DOMContentLoaded", function () { downtime(); oee(); fishbone(); eightD(); });
})();
