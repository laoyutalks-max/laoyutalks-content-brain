/* LAOYU — offline CSV dashboard templates (Production KPI, Downtime Analysis, Manpower Planning).
   Formulas are kept from the LAOYUTALKS MVP templates:
   Production: Yield = Good / Output; Attainment = Output / Target; Utilization = Run_Min / Planned_Min.
   Downtime: MTTR = average logged event duration.
   Manpower: HC Gap = Available - Required (summed); Attainment = Actual / Planned.
   Data stays in this browser tab. Nothing is uploaded. */
(function () {
  "use strict";
  var root = document.querySelector("[data-dash]");
  if (!root) return;
  var KIND = root.getAttribute("data-dash");
  function zh() { return document.documentElement.getAttribute("data-lang") === "zh"; }
  function T(en, cn) { return zh() ? cn : en; }
  function $(id) { return document.getElementById(id); }

  var CFG = {
    production: {
      title: ["Production Performance Dashboard", "生产绩效看板"],
      columns: ["Date", "Line", "Shift", "Product", "Target", "Output", "Good", "Planned_Min", "Run_Min"],
      numeric: ["Target", "Output", "Good", "Planned_Min", "Run_Min"],
      groups: ["Line", "Shift", "Product", "Date"], measure: "Output",
      chart: ["Output by {g}", "按{g}的产量"],
      sample: [
        "2026-11-01,Line A,Day,Bracket,360,350,343,480,420\n2026-11-01,Line A,Night,Bracket,360,330,321,480,405\n2026-11-01,Line B,Day,Housing,300,305,298,480,445\n2026-11-01,Line B,Night,Housing,300,262,251,480,384\n2026-11-02,Line A,Day,Bracket,360,370,365,480,450\n2026-11-02,Line A,Night,Bracket,360,344,336,480,418\n2026-11-02,Line B,Day,Housing,300,296,290,480,436\n2026-11-02,Line B,Night,Housing,300,281,270,480,402",
        "2026-11-01,A 线,白班,支架,360,350,343,480,420\n2026-11-01,A 线,夜班,支架,360,330,321,480,405\n2026-11-01,B 线,白班,外壳,300,305,298,480,445\n2026-11-01,B 线,夜班,外壳,300,262,251,480,384\n2026-11-02,A 线,白班,支架,360,370,365,480,450\n2026-11-02,A 线,夜班,支架,360,344,336,480,418\n2026-11-02,B 线,白班,外壳,300,296,290,480,436\n2026-11-02,B 线,夜班,外壳,300,281,270,480,402"
      ]
    },
    downtime: {
      title: ["Downtime Analysis Dashboard", "停机分析看板"],
      columns: ["Date", "Equipment", "Category", "Reason", "Duration_Min", "Owner"],
      numeric: ["Duration_Min"],
      groups: ["Reason", "Equipment", "Category", "Date"], measure: "Duration_Min",
      chart: ["Downtime minutes by {g}", "按{g}的停机分钟"],
      sample: [
        "2026-11-01,Press 01,Equipment,Hydraulic leak,55,Maintenance\n2026-11-01,CNC 02,Changeover,Tool change overrun,35,Production\n2026-11-01,Conveyor 1,Material,Waiting for parts,40,Planning\n2026-11-02,Press 01,Equipment,Sensor fault,25,Maintenance\n2026-11-02,Packer 1,Equipment,Film jam,30,Maintenance\n2026-11-02,CNC 02,Process,First-piece check failed,20,Quality\n2026-11-03,Press 01,Equipment,Hydraulic leak,45,Maintenance\n2026-11-03,Conveyor 1,People,No operator at start,15,Production",
        "2026-11-01,冲压机 01,设备,液压泄漏,55,维修\n2026-11-01,CNC 02,换线,换刀超时,35,生产\n2026-11-01,输送线 1,物料,等待零件,40,计划\n2026-11-02,冲压机 01,设备,传感器故障,25,维修\n2026-11-02,包装机 1,设备,薄膜卡料,30,维修\n2026-11-02,CNC 02,工艺,首件检验不合格,20,质量\n2026-11-03,冲压机 01,设备,液压泄漏,45,维修\n2026-11-03,输送线 1,人员,开班无操作员,15,生产"
      ]
    },
    manpower: {
      title: ["Manpower Planning Dashboard", "人力规划看板"],
      columns: ["Date", "Shift", "Area", "Required_HC", "Available_HC", "OT_Hours", "Planned_Units", "Actual_Units"],
      numeric: ["Required_HC", "Available_HC", "OT_Hours", "Planned_Units", "Actual_Units"],
      groups: ["Area", "Shift", "Date"], measure: "Actual_Units",
      chart: ["Actual units by {g}", "按{g}的实际产量"],
      sample: [
        "2026-11-01,Day,Assembly,8,7,4,360,335\n2026-11-01,Night,Assembly,8,8,0,360,362\n2026-11-01,Day,Machining,6,5,3,240,210\n2026-11-01,Day,Packing,4,4,0,500,505\n2026-11-02,Day,Assembly,8,6,6,360,318\n2026-11-02,Night,Machining,6,6,0,240,244\n2026-11-02,Day,Packing,4,3,2,500,452",
        "2026-11-01,白班,装配,8,7,4,360,335\n2026-11-01,夜班,装配,8,8,0,360,362\n2026-11-01,白班,机加工,6,5,3,240,210\n2026-11-01,白班,包装,4,4,0,500,505\n2026-11-02,白班,装配,8,6,6,360,318\n2026-11-02,夜班,机加工,6,6,0,240,244\n2026-11-02,白班,包装,4,3,2,500,452"
      ]
    }
  }[KIND];

  var COLZH = { Date: "日期", Line: "产线", Shift: "班次", Product: "产品", Target: "目标", Output: "产量", Good: "良品", Planned_Min: "计划分钟", Run_Min: "运行分钟",
    Equipment: "设备", Category: "类别", Reason: "原因", Duration_Min: "时长（分钟）", Owner: "负责人",
    Area: "区域", Required_HC: "需求人数", Available_HC: "可用人数", OT_Hours: "加班工时", Planned_Units: "计划产量", Actual_Units: "实际产量" };
  function colName(c) { return zh() ? (COLZH[c] || c) : c.replace(/_/g, " "); }

  var rows = [], isSample = true, badCells = 0, fileName = "";

  function parseCSV(s) {
    var result = [], row = [], field = "", quoted = false;
    for (var i = 0; i < s.length; i++) {
      var c = s[i];
      if (c === '"') { if (quoted && s[i + 1] === '"') { field += '"'; i++; } else quoted = !quoted; }
      else if (c === "," && !quoted) { row.push(field); field = ""; }
      else if ((c === "\n" || c === "\r") && !quoted) { if (c === "\r" && s[i + 1] === "\n") i++; row.push(field); if (row.some(function (v) { return v !== ""; })) result.push(row); row = []; field = ""; }
      else field += c;
    }
    row.push(field); if (row.some(function (v) { return v !== ""; })) result.push(row);
    if (result.length < 2) return [];
    var headers = result.shift().map(function (x) { return x.trim().replace(/^﻿/, ""); });
    var missing = CFG.columns.filter(function (x) { return headers.indexOf(x) < 0; });
    if (missing.length) { var e = new Error("missing"); e.missing = missing; throw e; }
    return result.map(function (a) { var o = {}; headers.forEach(function (h, i) { o[h] = (a[i] || "").trim(); }); return o; });
  }
  function sampleRows() { return parseCSV(CFG.columns.join(",") + "\n" + CFG.sample[zh() ? 1 : 0]); }

  function isNum(v) { return v !== "" && isFinite(Number(String(v).replace(/,/g, ""))); }
  function num(r, k) { var v = String(r[k] == null ? "" : r[k]).replace(/,/g, ""); return isNum(v) ? Number(v) : 0; }
  function sum(k) { return rows.reduce(function (s, r) { return s + num(r, k); }, 0); }
  function fmt(n) { return isFinite(n) ? n.toLocaleString(zh() ? "zh-CN" : "en-US", { maximumFractionDigits: 1 }) : "–"; }
  function pct(a, b) { return b ? (100 * a / b).toFixed(1) + "%" : "–"; }
  function countBad() {
    badCells = 0;
    rows.forEach(function (r) { CFG.numeric.forEach(function (k) { if (r[k] !== "" && !isNum(r[k])) badCells++; }); });
  }

  function metrics() {
    if (KIND === "production") {
      var out = sum("Output"), good = sum("Good"), tgt = sum("Target"), run = sum("Run_Min"), plan = sum("Planned_Min");
      return [[T("Output", "产量"), fmt(out)], [T("Target", "目标"), fmt(tgt)],
        [T("Yield %", "良率 %"), pct(good, out), out && good / out < 0.97 ? "warn" : ""],
        [T("Attainment %", "达成率 %"), pct(out, tgt), tgt && out / tgt < 0.95 ? "bad" : tgt ? "ok" : ""],
        [T("Utilization %", "利用率 %"), pct(run, plan)]];
    }
    if (KIND === "downtime") {
      var total = sum("Duration_Min"), byR = {}, byE = {};
      rows.forEach(function (r) { byR[r.Reason || "?"] = (byR[r.Reason || "?"] || 0) + num(r, "Duration_Min"); byE[r.Equipment || "?"] = (byE[r.Equipment || "?"] || 0) + num(r, "Duration_Min"); });
      var top = function (o) { var e = Object.keys(o).sort(function (a, b) { return o[b] - o[a]; })[0]; return e ? e : "–"; };
      return [[T("Downtime (h)", "停机（小时）"), fmt(total / 60)], [T("Events", "次数"), fmt(rows.length)],
        [T("Avg time per event (min)", "平均每次时长（分钟）"), rows.length ? fmt(total / rows.length) : "–"],
        [T("Top reason", "最大原因"), top(byR), "txt"], [T("Top equipment", "最大设备"), top(byE), "txt"]];
    }
    var req = sum("Required_HC"), av = sum("Available_HC"), gap = av - req;
    return [[T("Required HC", "需求人数"), fmt(req)], [T("Available HC", "可用人数"), fmt(av)],
      [T("HC gap (available − required)", "人数差距（可用 − 需求）"), (gap > 0 ? "+" : "") + fmt(gap), gap < 0 ? "bad" : "ok"],
      [T("OT hours", "加班工时"), fmt(sum("OT_Hours"))],
      [T("Output attainment %", "产出达成率 %"), pct(sum("Actual_Units"), sum("Planned_Units"))]];
  }

  function chartData() {
    var g = $("dGroup").value, acc = {};
    rows.forEach(function (r) { var l = r[g] || T("Unknown", "未知"); acc[l] = (acc[l] || 0) + num(r, CFG.measure); });
    var list = Object.keys(acc).map(function (k) { return [k, acc[k]]; });
    if (g === "Date") list.sort(function (a, b) { return a[0] < b[0] ? -1 : 1; });
    else list.sort(function (a, b) { return b[1] - a[1]; });
    return list.slice(0, 12);
  }

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  function render() {
    var cards = $("dCards"); cards.replaceChildren();
    metrics().forEach(function (m) { var c = el("div", "dCard " + (m[2] || "")); c.append(el("span", "", m[0]), el("b", "", m[1])); cards.append(c); });

    var chart = $("dChart"); chart.replaceChildren();
    var data = chartData(), max = Math.max.apply(null, [1].concat(data.map(function (x) { return x[1]; })));
    data.forEach(function (d) {
      var col = el("div", "dCol"); col.title = d[0] + ": " + fmt(d[1]);
      var bar = el("i"); bar.style.height = Math.max(1, d[1] / max * 100) + "%";
      col.append(el("em", "", fmt(d[1])), bar, el("span", "", d[0])); chart.append(col);
    });
    if (!data.length) chart.append(el("p", "resNote", T("No data to chart.", "没有可显示的数据。")));
    $("dChartTitle").textContent = T(CFG.chart[0], CFG.chart[1]).replace("{g}", zh() ? colName($("dGroup").value) : colName($("dGroup").value).toLowerCase());

    var table = el("table", "dTable"), tr = el("tr");
    CFG.columns.forEach(function (c) { tr.append(el("th", "", colName(c))); });
    var thead = el("thead"); thead.append(tr); table.append(thead);
    var body = el("tbody");
    rows.slice(0, 50).forEach(function (r) {
      var t = el("tr");
      CFG.columns.forEach(function (c) { var td = el("td", CFG.numeric.indexOf(c) > -1 && r[c] !== "" && !isNum(r[c]) ? "badCell" : "", r[c]); t.append(td); });
      body.append(t);
    });
    table.append(body); $("dTable").replaceChildren(table);

    var info = [];
    info.push(isSample ? T("Sample data (fictional)", "示例数据（虚构）") : T("Your file: ", "你的文件：") + fileName);
    info.push(T(rows.length + " rows", rows.length + " 行") + (rows.length > 50 ? T(" · table shows the first 50", " · 表格显示前 50 行") : ""));
    $("dInfo").textContent = info.join(" · ");
    var w = $("dWarn");
    if (badCells) { w.hidden = false; w.textContent = T(badCells + " value(s) in number columns are not numbers and were counted as 0. They are marked in the table.", "数字列中有 " + badCells + " 个值不是数字，已按 0 计算，并在表格中标出。"); }
    else w.hidden = true;
  }

  function groups() {
    var cur = $("dGroup").value || CFG.groups[0];
    $("dGroup").innerHTML = "";
    CFG.groups.forEach(function (g) { var o = el("option", "", colName(g)); o.value = g; if (g === cur) o.selected = true; $("dGroup").append(o); });
  }

  function err(msg) { var e = $("dErr"); e.textContent = msg; e.hidden = !msg; }

  function download(name, text) {
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + text], { type: "text/csv;charset=utf-8" }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
  }
  function csvValue(v) { v = String(v == null ? "" : v); return /[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  function csvOf(list) { return [CFG.columns.join(",")].concat(list.map(function (r) { return CFG.columns.map(function (c) { return csvValue(r[c]); }).join(","); })).join("\r\n"); }

  function loadSample() { rows = sampleRows(); isSample = true; fileName = ""; countBad(); err(""); render(); }

  function start() {
    groups();
    $("dCols").textContent = CFG.columns.join(", ");
    loadSample();
    $("dGroup").addEventListener("change", render);
    $("dSample").addEventListener("click", function () { $("dFile").value = ""; loadSample(); });
    $("dExport").addEventListener("click", function () { download(KIND + "-data.csv", csvOf(rows)); });
    $("dTpl").addEventListener("click", function () { download(KIND + "-template.csv", csvOf(sampleRows())); });
    $("dFile").addEventListener("change", function (e) {
      var f = e.target.files && e.target.files[0]; if (!f) return;
      if (f.size > 5 * 1024 * 1024) { err(T("This file is larger than 5 MB. Please split it into smaller files.", "文件超过 5 MB，请拆分成较小的文件。")); return; }
      var rd = new FileReader();
      rd.onload = function () {
        try {
          var next = parseCSV(String(rd.result));
          if (!next.length) throw new Error("empty");
          rows = next; isSample = false; fileName = f.name; countBad(); err(""); render();
        } catch (x) {
          err(x.missing ? T("Import failed: missing column(s) " + x.missing.join(", ") + ". Column names must match exactly.", "导入失败：缺少列 " + x.missing.join(", ") + "。列名必须完全一致。")
            : T("Import failed: the file has no data rows.", "导入失败：文件中没有数据行。"));
        }
      };
      rd.onerror = function () { err(T("Could not read this file.", "无法读取此文件。")); };
      rd.readAsText(f);
    });
    $("dTitleIn").addEventListener("input", function (e) { $("dTitle").textContent = e.target.value || T(CFG.title[0], CFG.title[1]); });
    document.addEventListener("laoyu:lang", function () {
      groups();
      if (isSample) rows = sampleRows();
      if (!$("dTitleIn").value || $("dTitleIn").dataset.auto === "1") { $("dTitleIn").value = T(CFG.title[0], CFG.title[1]); $("dTitleIn").dataset.auto = "1"; $("dTitle").textContent = $("dTitleIn").value; }
      render();
    });
    $("dTitleIn").value = T(CFG.title[0], CFG.title[1]); $("dTitleIn").dataset.auto = "1";
    $("dTitleIn").addEventListener("input", function () { this.dataset.auto = ""; });
    $("dTitle").textContent = $("dTitleIn").value;
  }

  document.addEventListener("DOMContentLoaded", function () {
    (window.LAOYU_OWNER || Promise.resolve(false)).then(function (owner) {
      $("dashSoon").hidden = !!owner;
      $("dashApp").hidden = !owner;
      if (owner) start();
    });
  });
})();
