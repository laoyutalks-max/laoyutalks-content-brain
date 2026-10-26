/* Interactive free tools: Weekly Action Tracker, Manpower Gap Calculator,
   Repeated Mistake 30-day check. Data stays in this browser only. */
(function () {
  function zh() { return document.documentElement.getAttribute("data-lang") === "zh"; }
  function L(en, cn) { return zh() ? cn : en; }
  function load(k, d) { try { var v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } }
  function save(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function today() { var d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); }
  function on(ev, fn) { document.addEventListener(ev, fn); }

  /* ------------------------------------------------ Weekly Action Tracker */
  function tracker() {
    var table = document.getElementById("atTable");
    if (!table) return;
    var KEY = "laoyuAT", tb = table.querySelector("tbody");
    var blank = function () { return { a: "", o: "", d: "", s: "todo", n: "" }; };
    var rows = load(KEY, null) || [blank(), blank(), blank()];
    var ST = [["todo", "Not started", "未开始"], ["doing", "In progress", "进行中"], ["blocked", "Blocked", "受阻"], ["done", "Done", "已完成"]];

    function overdue(r) { return r.d && r.s !== "done" && r.d < today(); }
    function summary() {
      var open = rows.filter(function (r) { return r.a && r.s !== "done"; }).length;
      var late = rows.filter(function (r) { return r.a && overdue(r); }).length;
      var done = rows.filter(function (r) { return r.a && r.s === "done"; }).length;
      var all = rows.filter(function (r) { return r.a; }).length;
      document.getElementById("atSummary").innerHTML =
        chip(all, L("Actions", "行动总数"), "") + chip(open, L("Open", "未完成"), "") +
        chip(late, L("Overdue", "已逾期"), late ? "bad" : "") + chip(done, L("Done", "已完成"), done ? "ok" : "");
    }
    function chip(n, label, cls) { return '<div class="atChip ' + cls + '"><b>' + n + "</b><span>" + label + "</span></div>"; }
    function render() {
      tb.innerHTML = rows.map(function (r, i) {
        return '<tr class="' + (overdue(r) ? "late" : r.s === "done" ? "done" : "") + '" data-i="' + i + '">' +
          "<td>" + (i + 1) + "</td>" +
          '<td><input data-f="a" aria-label="' + L("Action", "行动") + '" value="' + esc(r.a) + '"></td>' +
          '<td><input data-f="o" aria-label="' + L("Owner", "负责人") + '" value="' + esc(r.o) + '"></td>' +
          '<td><input data-f="d" type="date" aria-label="' + L("Due date", "截止日期") + '" value="' + esc(r.d) + '"></td>' +
          '<td><select data-f="s" aria-label="' + L("Status", "状态") + '">' + ST.map(function (s) { return '<option value="' + s[0] + '"' + (r.s === s[0] ? " selected" : "") + ">" + (zh() ? s[2] : s[1]) + "</option>"; }).join("") + "</select></td>" +
          '<td><input data-f="n" aria-label="' + L("Notes", "备注") + '" value="' + esc(r.n) + '"></td>' +
          '<td><button type="button" class="rowDel" aria-label="' + L("Remove row", "删除此行") + '">×</button></td></tr>';
      }).join("");
      summary();
    }
    tb.addEventListener("input", function (e) {
      var f = e.target.getAttribute("data-f"); if (!f) return;
      var tr = e.target.closest("tr"), r = rows[+tr.getAttribute("data-i")];
      r[f] = e.target.value; save(KEY, rows);
      tr.className = overdue(r) ? "late" : r.s === "done" ? "done" : "";
      summary();
    });
    tb.addEventListener("click", function (e) {
      if (!e.target.classList.contains("rowDel")) return;
      rows.splice(+e.target.closest("tr").getAttribute("data-i"), 1);
      if (!rows.length) rows.push(blank());
      save(KEY, rows); render();
    });
    document.getElementById("atAdd").addEventListener("click", function () {
      rows.push(blank()); save(KEY, rows); render();
      var last = tb.querySelector("tr:last-child input"); if (last) last.focus();
    });
    document.getElementById("atSort").addEventListener("click", function () {
      rows.sort(function (x, y) { return (x.d || "9999") < (y.d || "9999") ? -1 : (x.d || "9999") > (y.d || "9999") ? 1 : 0; });
      save(KEY, rows); render();
    });
    on("click", function (e) {
      if (!e.target.closest || !e.target.closest("[data-csv]")) return;
      var head = zh() ? ["#", "行动", "负责人", "截止日期", "状态", "备注", "逾期"] : ["#", "Action", "Owner", "Due", "Status", "Notes", "Overdue"];
      var lines = [head].concat(rows.filter(function (r) { return r.a; }).map(function (r, i) {
        var st = ST.filter(function (s) { return s[0] === r.s; })[0];
        return [i + 1, r.a, r.o, r.d, zh() ? st[2] : st[1], r.n, overdue(r) ? (zh() ? "是" : "Yes") : ""];
      }));
      var csv = "﻿" + lines.map(function (l) { return l.map(function (c) { c = String(c); if (/^[=+\-@]/.test(c)) c = "'" + c; return '"' + c.replace(/"/g, '""') + '"'; }).join(","); }).join("\r\n");
      var a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      a.download = "action-tracker-" + today() + ".csv";
      document.body.appendChild(a); a.click(); a.remove();
    });
    on("laoyu:lang", render);
    on("laoyu:reset", function () { rows = [blank(), blank(), blank()]; save(KEY, rows); render(); });
    setInterval(summary, 60000);
    render();
  }

  /* ------------------------------------------------ Manpower Gap Calculator */
  function manpower() {
    var table = document.getElementById("mpTable");
    if (!table) return;
    var KEY = "laoyuMP", tb = table.querySelector("tbody"), hrs = document.getElementById("mpHours");
    var sample = function () {
      return [{ n: "Line A", r: 12, s: 12, a: 2, p: 1 }, { n: "Line B", r: 8, s: 9, a: 0, p: 2 },
              { n: "Packing", r: 6, s: 8, a: 1, p: 3 }, { n: "QC", r: 4, s: 4, a: 1, p: 1 }];
    };
    var rows = load(KEY, null) || sample();
    function num(v) { v = parseFloat(v); return isFinite(v) && v > 0 ? v : 0; }
    function gap(r) { return num(r.s) - num(r.a) - num(r.r); }
    function name(r, i) { return r.n || L("Area " + (i + 1), "区域 " + (i + 1)); }

    function render() {
      tb.innerHTML = rows.map(function (r, i) {
        return '<tr data-i="' + i + '">' +
          '<td><input data-f="n" aria-label="' + L("Area", "区域") + '" value="' + esc(r.n) + '"></td>' +
          ["r", "s", "a"].map(function (f) { return '<td><input data-f="' + f + '" type="number" min="0" inputmode="numeric" aria-label="' + f + '" value="' + esc(r[f]) + '"></td>'; }).join("") +
          '<td><select data-f="p" aria-label="' + L("Priority", "优先级") + '">' + [1, 2, 3].map(function (p) { return '<option value="' + p + '"' + (+r.p === p ? " selected" : "") + ">" + p + "</option>"; }).join("") + "</select></td>" +
          '<td class="gapCell"></td><td><button type="button" class="rowDel" aria-label="' + L("Remove row", "删除此行") + '">×</button></td></tr>';
      }).join("");
      calc();
    }
    function calc() {
      var H = num(hrs.value) || 8;
      var req = 0, pres = 0;
      rows.forEach(function (r, i) {
        req += num(r.r); pres += num(r.s) - num(r.a);
        var cell = tb.querySelector('tr[data-i="' + i + '"] .gapCell');
        if (cell) { var g = gap(r); cell.textContent = g > 0 ? "+" + g : g; cell.className = "gapCell " + (g < 0 ? "neg" : g > 0 ? "pos" : ""); }
      });
      // surplus people: take from lowest priority (3) first; fill shortages in priority 1 first, biggest gap first
      var pool = rows.map(function (r, i) { return { i: i, n: Math.max(0, gap(r)), p: +r.p }; }).filter(function (x) { return x.n > 0; })
        .sort(function (x, y) { return y.p - x.p || y.n - x.n; });
      var need = rows.map(function (r, i) { return { i: i, n: Math.max(0, -gap(r)), p: +r.p }; }).filter(function (x) { return x.n > 0; })
        .sort(function (x, y) { return x.p - y.p || y.n - x.n; });
      var moves = [];
      need.forEach(function (d) {
        pool.forEach(function (s) {
          if (!d.n || !s.n) return;
          var k = Math.min(d.n, s.n); d.n -= k; s.n -= k;
          moves.push(L("Move <b>" + k + "</b> from <b>" + esc(name(rows[s.i], s.i)) + "</b> to <b>" + esc(name(rows[d.i], d.i)) + "</b>",
                        "从 <b>" + esc(name(rows[s.i], s.i)) + "</b> 调 <b>" + k + "</b> 人到 <b>" + esc(name(rows[d.i], d.i)) + "</b>") +
                     ' <span class="pri">P' + d.p + "</span>");
        });
      });
      var short = need.filter(function (d) { return d.n > 0; });
      var shortHeads = short.reduce(function (a, d) { return a + d.n; }, 0);
      var spare = pool.reduce(function (a, s) { return a + s.n; }, 0);
      var net = pres - req;
      document.getElementById("mpKpis").innerHTML =
        k(req, L("Required", "需要")) + k(pres, L("Present", "实到")) +
        k((net > 0 ? "+" : "") + net, L("Net gap", "净差额"), net < 0 ? "bad" : "ok") +
        k(shortHeads * H, L("Overtime hours needed", "需要加班工时"), shortHeads ? "bad" : "ok");
      document.getElementById("mpMoves").innerHTML = moves.length ? moves.map(function (m) { return "<li>" + m + "</li>"; }).join("")
        : "<li>" + L("No moves needed.", "不需要调动。") + "</li>";
      var left = "";
      if (short.length) {
        left = '<div class="mpAlert bad"><b>' + L("Still short after moves", "调动后仍然缺人") + "</b><ul>" +
          short.map(function (d) {
            return "<li>" + L("<b>" + esc(name(rows[d.i], d.i)) + "</b> (P" + d.p + "): " + d.n + " short = <b>" + d.n * H + " h</b> overtime, or decide what will not run today",
                              "<b>" + esc(name(rows[d.i], d.i)) + "</b>（P" + d.p + "）：缺 " + d.n + " 人 = <b>" + d.n * H + " 小时</b>加班，或决定今天哪些不做") + "</li>";
          }).join("") + "</ul>" +
          L("Tell the affected area lead early, with the risk: which order or KPI will slip.", "尽早告诉受影响区域的负责人，并说明风险：哪个订单或 KPI 会受影响。") + "</div>";
      } else if (spare) {
        left = '<div class="mpAlert ok"><b>' + L(spare + " spare after moves", "调动后还多 " + spare + " 人") + "</b> " +
          L("Use them for cross-training, 5S or clearing the action list, not idle time.", "安排多能工培训、5S 或清理行动清单，不要闲置。") + "</div>";
      } else {
        left = '<div class="mpAlert ok"><b>' + L("Every area is covered.", "每个区域都已覆盖。") + "</b></div>";
      }
      document.getElementById("mpLeft").innerHTML = left;
    }
    function k(v, label, cls) { return '<div class="atChip ' + (cls || "") + '"><b>' + v + "</b><span>" + label + "</span></div>"; }

    tb.addEventListener("input", function (e) {
      var f = e.target.getAttribute("data-f"); if (!f) return;
      rows[+e.target.closest("tr").getAttribute("data-i")][f] = e.target.value; save(KEY, rows); calc();
    });
    tb.addEventListener("click", function (e) {
      if (!e.target.classList.contains("rowDel")) return;
      rows.splice(+e.target.closest("tr").getAttribute("data-i"), 1);
      if (!rows.length) rows.push({ n: "", r: "", s: "", a: "", p: 1 });
      save(KEY, rows); render();
    });
    document.getElementById("mpAdd").addEventListener("click", function () {
      rows.push({ n: "", r: "", s: "", a: "", p: 2 }); save(KEY, rows); render();
      var last = tb.querySelector("tr:last-child input"); if (last) last.focus();
    });
    hrs.addEventListener("input", calc);
    on("laoyu:lang", render);
    on("laoyu:reset", function () { rows = [{ n: "", r: "", s: "", a: "", p: 1 }, { n: "", r: "", s: "", a: "", p: 2 }]; save(KEY, rows); hrs.value = 8; render(); });
    window.addEventListener("load", function () { if (!hrs.value) hrs.value = 8; calc(); });
    if (!hrs.value) hrs.value = 8;
    render();
  }

  /* ------------------------------------------------ Repeated mistake: 30-day check */
  function verify() {
    var out = document.getElementById("vTotal");
    if (!out) return;
    function v(id) { var x = parseFloat(document.getElementById(id).value); return isFinite(x) ? x : null; }
    function calc() {
      var ws = [1, 2, 3, 4].map(function (i) { return v("vk" + i); }).filter(function (x) { return x !== null; });
      var total = ws.reduce(function (a, b) { return a + b; }, 0), base = v("vBase"), target = v("vTarget");
      out.textContent = total;
      var band = document.getElementById("vBand"), b;
      if (!ws.length) b = ["", L("Enter weekly counts", "填写每周次数"), L("Record how many times it happened each week after the fix.", "记录改善后每周发生的次数。")];
      else if (target !== null && total <= target && ws.length === 4) b = ["ok", L("Target met", "达到目标"), L("Standardise the control: update the SOP and share it with other lines.", "把措施标准化：更新 SOP，并推广到其他产线。")];
      else if (base !== null && total < base) b = ["warn", L("Improving", "正在改善"), L("Not at target yet. Check the control is used every time, on every shift.", "还没达到目标。检查每个班次是否每次都执行了措施。")];
      else if (base !== null) b = ["bad", L("No improvement", "没有改善"), L("Go back to Part 2. The root cause or the control is not the right one.", "回到第 2 部分。根本原因或控制措施选得不对。")];
      else b = ["", L(ws.length + " of 4 weeks", "已记录 " + ws.length + " / 4 周"), L("Add the monthly count before the fix to compare.", "填写改善前的每月次数以便比较。")];
      band.className = "scoreBand " + b[0];
      band.innerHTML = "<b>" + b[1] + "</b><span>" + b[2] + "</span>";
    }
    on("input", function (e) { if (/^v(k\d|Base|Target)$/.test(e.target.id || "")) calc(); });
    on("laoyu:lang", calc);
    on("laoyu:reset", calc);
    window.addEventListener("load", calc);
    calc();
  }

  document.addEventListener("DOMContentLoaded", function () { tracker(); manpower(); verify(); });
})();
