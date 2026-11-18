/* =========================================================
   LAOYU — Training Matrix (training-matrix.html)
   Departments → teams → operators, against process groups →
   processes. Demo mode: all records live in this browser's
   localStorage. This is not secure record storage.
   Rules kept here on purpose:
   - "Certified" needs an assessor's name and an assessment date;
     finishing training (OJT) never certifies anyone.
   - Expiry = assessment date + the process validity (months).
   - Every status change is added to the log; nothing is overwritten.
   ========================================================= */
(function () {
  "use strict";
  var KEY = "laoyuTrainingMatrix1", PER = 20, DAY = 864e5;
  var S, saveOk = true;
  var ui = { dept: null, page: 0, q: "", team: "", gapsOnly: false, byTeam: true, closedG: {}, closedT: {} };

  /* ---------- helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function zh() { return document.documentElement.getAttribute("data-lang") === "zh"; }
  function T(en, cn) { var I = window.LAOYU_I18N; return I && I.pick ? I.pick(en, cn) : (zh() ? cn : en); }
  function P(en, cn) { var I = window.LAOYU_I18N, s = T(en, cn); return I && I.plain ? I.plain(s) : s; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function today() { return iso(new Date()); }
  function parse(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ""); if (!m) return null; var d = new Date(+m[1], +m[2] - 1, +m[3]); return iso(d) === s ? d : null; }
  function addMonths(s, n) { var d = parse(s); if (!d) return ""; var day = d.getDate(); d.setDate(1); d.setMonth(d.getMonth() + n); var last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); d.setDate(Math.min(day, last)); return iso(d); }
  function daysTo(s) { var d = parse(s), t = parse(today()); return d && t ? Math.round((d - t) / DAY) : 0; }
  function letter(i) { var s = ""; i++; while (i > 0) { var m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }
  function nid(p) { S.seq = (S.seq || 0) + 1; return p + S.seq; }
  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }

  /* Names are generic ("Operator 7"), so they can be shown in either language. */
  function nm(s) {
    var m;
    if ((m = /^Operator (\d+)$/.exec(s))) return T(s, "操作员 " + m[1]);
    if ((m = /^Department (\d+)$/.exec(s))) return T(s, "部门 " + m[1]);
    if ((m = /^Group (\d+)$/.exec(s))) return T(s, "第 " + m[1] + " 组");
    if ((m = /^Process ([A-Z]+)$/.exec(s))) return T(s, "工序 " + m[1]);
    if ((m = /^Team (\d+)$/.exec(s))) return T(s, "班组 " + m[1]);
    return esc(s);
  }
  function nmP(s) { var I = window.LAOYU_I18N; return I && I.plain ? I.plain(nm(s)) : nm(s); }
  /* Column label: the letter for generic names, otherwise the name (shortened; the full name is in the tooltip). */
  function short(p) { var m = /^Process ([A-Z]+)$/.exec(p.n); if (m) return m[1]; return p.n.length > 12 ? p.n.slice(0, 11) + "…" : p.n; }

  var ST = {
    C: ["Certified", "已认证"], T: ["In training (OJT)", "培训中 (OJT)"], P: ["Pending assessment", "待评估"],
    R: ["Required, not started", "需要，未开始"], X: ["Expired", "已过期"], N: ["Not required", "不需要"]
  };
  function stName(k) { return T(ST[k][0], ST[k][1]); }

  /* ---------- data ---------- */
  function seed() {
    var r = 20261118, rnd = function () { r = (r * 9301 + 49297) % 233280; return r / 233280; };
    S = { v: 1, seq: 0, depts: [], groups: [], procs: [], ops: [], cells: {}, log: [], demo: true };
    var gDef = [[0, 1, 2], [3, 4], [5, 6, 7]];
    for (var p = 0; p < 8; p++) S.procs.push({ id: nid("p"), n: "Process " + letter(p), valid: 12 });
    gDef.forEach(function (ix, g) { S.groups.push({ id: nid("g"), n: "Group " + (g + 1), min: 4, procs: ix.map(function (i) { return S.procs[i].id; }) }); });
    var sizes = [32, 28, 24, 16], base = [0.8, 0.72, 0.6, 0.76], no = 0, t = today();
    sizes.forEach(function (size, di) {
      var d = { id: nid("d"), n: "Department " + (di + 1) }; S.depts.push(d);
      for (var k = 0; k < size; k++) {
        var op = { id: nid("o"), n: "Operator " + (++no), dept: d.id, team: "Team " + (Math.floor(k / 8) + 1), active: true };
        S.ops.push(op);
        S.procs.forEach(function (pr) {
          var x = rnd(), b = base[di], c;
          if (x < 0.08) c = { s: "N" };
          else if (x < 0.08 + b) {
            var ago = rnd() < 0.04 ? 366 + Math.floor(rnd() * 90) : Math.floor(Math.pow(rnd(), 1.8) * 360), dt = new Date(parse(t) - ago * DAY), ds = iso(dt);
            c = { s: "C", d: ds, exp: addMonths(ds, pr.valid), by: "Demo assessor" };
          }
          else if (x < 0.15 + b) c = { s: "T" };
          else if (x < 0.2 + b) c = { s: "P" };
          else c = null;
          if (c) S.cells[op.id + "|" + pr.id] = c;
        });
      }
    });
  }
  function load() {
    var raw = null;
    try { raw = localStorage.getItem(KEY); if (raw) { var o = JSON.parse(raw); if (valid(o)) { S = o; if (!Array.isArray(S.log)) S.log = []; return; } } } catch (e) {}
    if (raw) { try { localStorage.setItem(KEY + ".unreadable", raw); } catch (e) {} }
    seed();
  }
  /* Saved data is checked before use; anything unreadable is kept aside and the demo data is loaded. */
  function valid(o) {
    var ok = function (a, f) { return Array.isArray(a) && a.every(function (x) { return x && typeof x.id === "string" && typeof x.n === "string" && (!f || f(x)); }); };
    if (!o || o.v !== 1 || !o.cells || typeof o.cells !== "object" || Array.isArray(o.cells)) return false;
    return ok(o.depts) && ok(o.procs, function (p) { return p.valid >= 1; }) && ok(o.groups, function (g) { return Array.isArray(g.procs) && typeof g.min === "number"; }) &&
      ok(o.ops, function (x) { return typeof x.dept === "string" && typeof x.team === "string"; });
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); saveOk = true; } catch (e) { saveOk = false; }
    var n = $("tmSaveNote");
    if (n) n.hidden = saveOk;
  }

  function cell(o, p) { return S.cells[o.id + "|" + p.id] || null; }
  function eff(o, p) {
    var c = cell(o, p);
    if (!c) return "R";
    if (c.s === "C" && c.exp && daysTo(c.exp) < 0) return "X";
    return c.s;
  }
  function expiring(o, p) { var c = cell(o, p); if (!c || c.s !== "C" || !c.exp) return false; var n = daysTo(c.exp); return n >= 0 && n <= 30; }
  function gap(e) { return e === "R" || e === "X"; }
  function active() { return S.ops.filter(function (o) { return o.active !== false; }); }
  function procsOf(g) { return g.procs.map(function (id) { return byId(S.procs, id); }).filter(Boolean); }
  function opGaps(o, ps) { return (ps || S.procs).filter(function (p) { return gap(eff(o, p)); }).length; }
  function coverage(ops, ps) {
    var req = 0, ok = 0;
    ops.forEach(function (o) { ps.forEach(function (p) { var e = eff(o, p); if (e !== "N") { req++; if (e === "C") ok++; } }); });
    return req ? Math.round(ok / req * 100) : null;
  }
  function ready(o, g) {
    var ps = procsOf(g), req = 0;
    for (var i = 0; i < ps.length; i++) { var e = eff(o, ps[i]); if (e === "N") continue; req++; if (e !== "C") return false; }
    return req > 0;
  }
  function deptOps(id) { return active().filter(function (o) { return o.dept === id; }); }

  /* ---------- level 1: KPIs + department heatmap ---------- */
  function renderKpis() {
    var ops = active(), exp = 0, expd = 0, withGap = 0;
    ops.forEach(function (o) {
      var g = false;
      S.procs.forEach(function (p) { if (expiring(o, p)) exp++; var e = eff(o, p); if (e === "X") expd++; if (gap(e)) g = true; });
      if (g) withGap++;
    });
    var cov = coverage(ops, S.procs);
    var k = [
      ["", T("Operators", "操作员"), ops.length],
      ["", T("Certified coverage", "认证覆盖率"), cov == null ? "–" : cov + "%"],
      ["warn", T("Expiring in 30 days", "30 天内到期"), exp],
      ["bad", T("Expired", "已过期"), expd],
      ["bad", T("Operators with gaps", "有缺口的操作员"), withGap]
    ];
    $("tmKpis").innerHTML = k.map(function (x) { return '<div class="tmKpi ' + x[0] + '"><small>' + x[1] + "</small><b>" + x[2] + "</b></div>"; }).join("");
  }
  function heatCls(v) { return v == null ? "n" : v >= 80 ? "g" : v >= 60 ? "a" : "r"; }
  function renderHeat() {
    var h = '<table class="tmTable"><thead><tr><th class="l" scope="col">' + T("Department", "部门") + '</th><th scope="col">' + T("Operators", "操作员") + "</th>" +
      S.groups.map(function (g) { return '<th scope="col">' + nm(g.n) + "</th>"; }).join("") + '<th scope="col">' + T("With gaps", "有缺口") + "</th></tr></thead><tbody>";
    S.depts.forEach(function (d) {
      var ops = deptOps(d.id), gp = ops.filter(function (o) { return opGaps(o) > 0; }).length;
      h += '<tr class="tmHeatRow' + (d.id === ui.dept ? " on" : "") + '" tabindex="0" role="button" data-dept="' + d.id + '" aria-label="' + esc(P("Open", "打开") + " " + nmP(d.n)) + '"><td class="l"><b>' + nm(d.n) + "</b></td><td>" + ops.length + "</td>" +
        S.groups.map(function (g) { var v = ops.length ? coverage(ops, procsOf(g)) : null; return '<td><span class="tmHeat ' + heatCls(v) + '">' + (v == null ? "–" : v + "%") + "</span></td>"; }).join("") +
        '<td><span class="tmGapN' + (gp ? "" : " z") + '">' + (gp || "–") + "</span></td></tr>";
    });
    h += "</tbody></table>";
    $("tmHeat").innerHTML = h;
  }

  /* ---------- level 2: one department ---------- */
  function teams(deptId) {
    var t = {}; deptOps(deptId).forEach(function (o) { t[o.team] = 1; });
    return Object.keys(t).sort(function (a, b) { return (parseInt(a.replace(/\D/g, ""), 10) || 0) - (parseInt(b.replace(/\D/g, ""), 10) || 0) || a.localeCompare(b); });
  }
  function filtered() {
    var q = ui.q.trim().toLowerCase();
    return deptOps(ui.dept).filter(function (o) {
      if (ui.team && o.team !== ui.team) return false;
      if (q && o.n.toLowerCase().indexOf(q) < 0 && nmP(o.n).toLowerCase().indexOf(q) < 0) return false;
      if (ui.gapsOnly && !opGaps(o)) return false;
      return true;
    }).sort(function (a, b) {
      if (ui.byTeam && a.team !== b.team) return (parseInt(a.team.replace(/\D/g, ""), 10) || 0) - (parseInt(b.team.replace(/\D/g, ""), 10) || 0);
      return (parseInt(a.n.replace(/\D/g, ""), 10) || 0) - (parseInt(b.n.replace(/\D/g, ""), 10) || 0);
    });
  }
  function renderDept() {
    var d = byId(S.depts, ui.dept);
    if (!d) { ui.dept = S.depts[0] ? S.depts[0].id : null; d = byId(S.depts, ui.dept); }
    if (!d) { $("tmDeptHead").innerHTML = ""; $("tmGroups").innerHTML = ""; $("tmMxBox").innerHTML = '<p class="tmEmpty">' + T("Add a department to start.", "先新增一个部门。") + "</p>"; return; }
    var ops = deptOps(d.id);
    $("tmDeptHead").innerHTML = '<div><h2 id="tmDeptTitle" tabindex="-1">' + nm(d.n) + '</h2><p>' + T("Select a cell to update a status. Select an operator for their full record.", "点击格子更新状态，点击操作员查看完整记录。") + "</p></div>" +
      '<label class="tmBar">' + '<span class="fine">' + T("Department", "部门") + '</span><select id="tmDeptSel">' + S.depts.map(function (x) { return '<option value="' + x.id + '"' + (x.id === d.id ? " selected" : "") + ">" + esc(nmP(x.n)) + "</option>"; }).join("") + "</select></label>";
    $("tmGroups").innerHTML = S.groups.map(function (g) {
      if (!procsOf(g).length) return '<div class="tmGroup"><small>' + nm(g.n) + "</small><b>–</b><small>" + T("No processes yet. Add them under Set up the matrix.", "还没有工序，请在“设置矩阵”中新增。") + "</small></div>";
      var n = ops.filter(function (o) { return ready(o, g); }).length, low = n < g.min;
      return '<div class="tmGroup' + (low ? " low" : "") + '"><span class="st">' + (low ? T("Below minimum", "低于最低人数") : T("OK", "达标")) + "</span><small>" + nm(g.n) + "</small><b>" + n + ' <small>/ ' + T("min", "最低") + " " + g.min + "</small></b><small>" +
        T("Ready for every process in the group", "组内所有工序均已认证") + "</small></div>";
    }).join("");
    renderMatrix();
  }
  function renderMatrix() {
    var ts = teams(ui.dept);
    if (ui.team && ts.indexOf(ui.team) < 0) ui.team = "";
    var bar = '<div class="tmBar"><input type="search" id="tmQ" maxlength="40" placeholder="' + esc(P("Search operator", "搜索操作员")) + '" aria-label="' + esc(P("Search operator", "搜索操作员")) + '" value="' + esc(ui.q) + '">' +
      '<select id="tmTeam" aria-label="' + esc(P("Team", "班组")) + '"><option value="">' + esc(P("All teams", "全部班组")) + "</option>" + ts.map(function (t) { return '<option value="' + esc(t) + '"' + (t === ui.team ? " selected" : "") + ">" + esc(nmP(t)) + "</option>"; }).join("") + "</select>" +
      '<button type="button" class="tmToggle" id="tmGapsOnly" aria-pressed="' + ui.gapsOnly + '">' + T("Gaps only", "只看缺口") + "</button>" +
      '<button type="button" class="tmToggle" id="tmByTeam" aria-pressed="' + ui.byTeam + '">' + T("Group by team", "按班组分组") + "</button>" +
      '<button type="button" class="btn" id="tmXlOpen">' + T("Download Excel", "下载 Excel") + "</button></div>";
    var list = filtered(), pages = Math.max(1, Math.ceil(list.length / PER));
    if (ui.page >= pages) ui.page = pages - 1;
    var view = list.slice(ui.page * PER, ui.page * PER + PER);
    var cols = [];
    var h1 = '<tr><th class="l op" rowspan="2" scope="col">' + T("Operator", "操作员") + "</th>", h2 = "<tr>";
    S.groups.forEach(function (g) {
      var ps = procsOf(g), closed = !!ui.closedG[g.id];
      if (!ps.length) return;
      h1 += '<th class="tmGh sep" colspan="' + (closed ? 1 : ps.length) + '" scope="colgroup"><button type="button" data-g="' + g.id + '" aria-expanded="' + !closed + '">' + (closed ? "▸ " : "▾ ") + nm(g.n) + "</button></th>";
      if (closed) { h2 += '<th class="sep" scope="col">' + T("Ready", "合格") + "</th>"; cols.push({ g: g }); }
      else ps.forEach(function (p, i) { h2 += '<th scope="col"' + (i ? "" : ' class="sep"') + ' title="' + esc(nmP(p.n)) + '">' + esc(short(p)) + "</th>"; cols.push({ p: p, first: !i }); });
    });
    h1 += '<th rowspan="2" scope="col">' + T("Gaps", "缺口") + "</th></tr>"; h2 += "</tr>";
    var body = "", last = null, ncol = cols.length + 2;
    view.forEach(function (o) {
      if (ui.byTeam && o.team !== last) {
        last = o.team;
        var tl = list.filter(function (x) { return x.team === o.team; }), tg = tl.filter(function (x) { return opGaps(x); }).length, tc = !!ui.closedT[o.team];
        body += '<tr class="tmTeam"><td colspan="' + ncol + '"><button type="button" data-t="' + esc(o.team) + '" aria-expanded="' + !tc + '">' + (tc ? "▸ " : "▾ ") + nm(o.team) + " · " + tl.length + " " + T("operators", "名操作员") + " · " +
          (tg ? '<span class="tmGapN">' + tg + " " + T("with gaps", "有缺口") + "</span>" : T("no gaps", "无缺口")) + "</button></td></tr>";
      }
      if (ui.byTeam && ui.closedT[o.team]) return;
      var g = opGaps(o);
      body += '<tr><td class="op"><button type="button" class="tmOpBtn" data-op="' + o.id + '">' + nm(o.n) + "</button>" + (ui.byTeam ? "" : ' <span class="fine">' + nm(o.team) + "</span>") + "</td>" +
        cols.map(function (c) {
          if (c.g) { var ps = procsOf(c.g), req = ps.filter(function (p) { return eff(o, p) !== "N"; }), ok = req.filter(function (p) { return eff(o, p) === "C"; }); return '<td class="sep"><span class="tmHeat ' + (ready(o, c.g) ? "g" : req.length ? "a" : "n") + '">' + ok.length + " / " + req.length + "</span></td>"; }
          var e = eff(o, c.p), x = expiring(o, c.p), lab = nmP(o.n) + ", " + nmP(c.p.n) + ": " + P(ST[e][0], ST[e][1]) + (x ? " (" + P("expires soon", "即将到期") + ")" : "");
          return "<td" + (c.first ? ' class="sep"' : "") + '><button type="button" class="tmCell" data-op="' + o.id + '" data-p="' + c.p.id + '" aria-label="' + esc(lab) + '" title="' + esc(lab) + '"><span class="tmDot ' + e + (x ? " E" : "") + '"></span></button></td>';
        }).join("") + '<td><span class="tmGapN' + (g ? "" : " z") + '">' + (g || "–") + "</span></td></tr>";
    });
    if (!view.length) body = '<tr><td colspan="' + ncol + '" class="tmEmpty">' + (deptOps(ui.dept).length ? T("No operators match these filters.", "没有符合条件的操作员。") : T("No operators in this department yet.", "本部门还没有操作员。")) + "</td></tr>";
    var pg = '<span>' + list.length + " " + T("shown", "条") + "</span>";
    if (pages > 1) for (var i = 0; i < pages; i++) pg += '<button type="button" data-pg="' + i + '"' + (i === ui.page ? ' aria-current="page"' : "") + ' aria-label="' + esc(P("Page", "第") + " " + (i + 1)) + '">' + (i + 1) + "</button>";
    var leg = ["C", "T", "P", "R", "X", "N"].map(function (k) { return '<span><i class="tmDot ' + k + '"></i>' + stName(k) + "</span>"; }).join("") + '<span><i class="tmDot C E"></i>' + T("Expires in 30 days", "30 天内到期") + "</span>";
    var focusQ = document.activeElement && document.activeElement.id === "tmQ";
    $("tmMxBox").innerHTML = bar + '<div class="tmScroll"><table class="tmTable tmMx"><thead>' + h1 + h2 + "</thead><tbody>" + body + "</tbody></table></div>" +
      '<div class="tmFoot"><div class="tmLegend">' + leg + '</div><div class="tmPages">' + pg + "</div></div>";
    if (focusQ) { var q = $("tmQ"); q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
  }

  /* ---------- dialogs ---------- */
  function dlg(html) {
    var d = $("tmDlg");
    d.innerHTML = '<button type="button" class="tmDlgX" data-close aria-label="' + esc(P("Close", "关闭")) + '">×</button><div class="tmDlgIn">' + html + "</div>";
    if (!d.open) { if (d.showModal) d.showModal(); else d.setAttribute("open", ""); }
  }
  function closeDlg() { var d = $("tmDlg"); if (d.open) { if (d.close) d.close(); else d.removeAttribute("open"); } }
  function histHtml(items) {
    if (!items.length) return '<p class="tmNote">' + T("No changes recorded yet.", "暂无变更记录。") + "</p>";
    return '<ul class="tmHist">' + items.slice().reverse().map(function (l) {
      var p = byId(S.procs, l.p), w = new Date(l.t), when = isNaN(w) ? "" : iso(w) + " " + pad(w.getHours()) + ":" + pad(w.getMinutes());
      if (l.moved) { var td = byId(S.depts, l.toD); return "<li>" + when + " · " + T("Moved to", "调到") + " <b>" + (td ? nm(td.n) : "") + ", " + nm(l.team) + "</b></li>"; }
      return "<li>" + when + " · <b>" + (p ? nm(p.n) : "") + "</b> " + stName(l.from) + " → <b>" + stName(l.to) + "</b>" + (l.by ? " · " + T("assessed by", "评估人") + " " + esc(l.by) : "") + (l.d ? " · " + esc(l.d) : "") + "</li>";
    }).join("") + "</ul>";
  }
  var cur = null;
  function openCell(oid, pid) {
    var o = byId(S.ops, oid), p = byId(S.procs, pid); if (!o || !p) return;
    cur = { o: o, p: p };
    var e = eff(o, p), c = cell(o, p) || {}, sel = e === "X" ? "C" : e;
    var opts = ["C", "T", "P", "R", "N"].map(function (k) { return '<label><input type="radio" name="tmS" value="' + k + '"' + (k === sel ? " checked" : "") + '><i class="tmDot ' + k + '"></i>' + stName(k) + "</label>"; }).join("");
    dlg('<h3 id="tmDlgT">' + nm(o.n) + " · " + nm(p.n) + "</h3>" +
      '<p class="tmNote">' + T("Now:", "当前：") + " <b>" + stName(e) + "</b>" + (c.s === "C" && c.exp ? " · " + (e === "X" ? T("expired on", "到期于") : T("expires", "到期")) + " " + esc(c.exp) : "") + "</p>" +
      '<form id="tmCellF" novalidate><div class="tmOpts" role="radiogroup" aria-label="' + esc(P("Status", "状态")) + '">' + opts + "</div>" +
      '<p class="tmNote" style="margin-top:10px">' + T("Finishing training does not certify. Certified needs an assessor and an assessment date.", "完成培训不等于认证。认证需要评估人和评估日期。") + "</p>" +
      '<div class="tmCert" id="tmCert"' + (sel === "C" ? "" : " hidden") + '><label>' + T("Assessed by", "评估人") + '<input id="tmBy" maxlength="40" autocomplete="off" value="' + esc(e === "C" ? c.by || "" : "") + '"></label>' +
      "<label>" + T("Assessment date", "评估日期") + '<input id="tmDate" type="date" max="' + today() + '" value="' + esc(e === "C" ? c.d || today() : today()) + '"></label>' +
      '<p class="tmNote" id="tmExpOut" style="grid-column:1/-1"></p></div>' +
      '<p class="tmMsg err" id="tmCellErr" role="alert"></p><div class="actions" style="margin-top:4px"><button type="submit" class="btn pri">' + T("Save", "保存") + '</button><button type="button" class="btn" data-close>' + T("Cancel", "取消") + "</button></div></form>" +
      "<h4>" + T("History", "历史记录") + "</h4>" + histHtml(S.log.filter(function (l) { return l.op === o.id && l.p === p.id; })));
    expOut();
  }
  function expOut() {
    var d = $("tmDate"), out = $("tmExpOut"); if (!d || !out || !cur) return;
    var x = parse(d.value) ? addMonths(d.value, cur.p.valid) : "";
    out.innerHTML = x ? T("Valid for", "有效期") + " " + cur.p.valid + " " + T("months, until", "个月，至") + " <b>" + x + "</b>" : "";
  }
  function saveCell(f) {
    var k = (f.querySelector("input[name=tmS]:checked") || {}).value, err = $("tmCellErr"), o = cur.o, p = cur.p;
    if (!k) { err.textContent = P("Choose a status.", "请选择状态。"); return; }
    var from = eff(o, p), rec = { t: new Date().toISOString(), op: o.id, p: p.id, from: from, to: k };
    if (k === "C") {
      var by = $("tmBy").value.trim(), d = $("tmDate").value;
      if (!by) { err.textContent = P("Enter who assessed the operator.", "请填写评估人。"); $("tmBy").focus(); return; }
      if (!parse(d)) { err.textContent = P("Enter a valid assessment date.", "请填写有效的评估日期。"); $("tmDate").focus(); return; }
      if (daysTo(d) > 0) { err.textContent = P("The assessment date can't be in the future.", "评估日期不能晚于今天。"); $("tmDate").focus(); return; }
      var ex = addMonths(d, p.valid);
      if (daysTo(ex) < 0) { err.textContent = P("An assessment on this date expired on " + ex + ". Enter a more recent date.", "该日期的评估已于 " + ex + " 到期，请填写更近的日期。"); $("tmDate").focus(); return; }
      var old = cell(o, p) || {};
      if (from === "C" && old.by === by && old.d === d) { closeDlg(); return; }
      S.cells[o.id + "|" + p.id] = { s: "C", d: d, exp: addMonths(d, p.valid), by: by };
      rec.by = by; rec.d = d;
    } else {
      if (k === from) { closeDlg(); return; }
      if (k === "R") delete S.cells[o.id + "|" + p.id]; else S.cells[o.id + "|" + p.id] = { s: k };
    }
    S.log.push(rec); save(); closeDlg(); renderAll();
    var b = document.querySelector('.tmCell[data-op="' + o.id + '"][data-p="' + p.id + '"]'); if (b) b.focus();
  }
  function openOp(oid) {
    var o = byId(S.ops, oid); if (!o) return;
    cur = { o: o };
    var rows = S.groups.map(function (g) {
      return procsOf(g).map(function (p) {
        var e = eff(o, p), c = cell(o, p) || {};
        return '<tr><td class="l">' + nm(g.n) + '</td><td class="l">' + nm(p.n) + '</td><td class="l"><i class="tmDot ' + e + (expiring(o, p) ? " E" : "") + '"></i> ' + stName(e) + "</td><td>" + (c.s === "C" ? esc(c.exp) : "–") + "</td></tr>";
      }).join("");
    }).join("");
    dlg('<h3 id="tmDlgT">' + nm(o.n) + "</h3><p class=\"tmNote\">" + nm(byId(S.depts, o.dept).n) + " · " + nm(o.team) + "</p>" +
      '<div class="tmScroll"><table class="tmTable"><thead><tr><th class="l">' + T("Group", "工序组") + "</th><th>" + T("Process", "工序") + '</th><th class="l">' + T("Status", "状态") + "</th><th>" + T("Expires", "到期") + "</th></tr></thead><tbody>" + rows + "</tbody></table></div>" +
      '<form id="tmMoveF" class="tmBar" novalidate><label class="fine">' + T("Move to", "调到") + ' <select id="tmMoveD">' + S.depts.map(function (d) { return '<option value="' + d.id + '"' + (d.id === o.dept ? " selected" : "") + ">" + esc(nmP(d.n)) + "</option>"; }).join("") + '</select></label>' +
      '<label class="fine">' + T("Team number", "班组编号") + ' <input id="tmMoveT" type="number" min="1" max="99" style="width:80px" value="' + esc(o.team.replace(/\D/g, "") || 1) + '"></label>' +
      '<button type="submit" class="btn">' + T("Move", "调动") + '</button><button type="button" class="btn" id="tmDeact">' + T("Deactivate", "停用") + "</button></form>" +
      '<p class="tmMsg err" id="tmOpErr" role="alert"></p><p class="tmNote">' + T("Training history stays with the operator when they move. Deactivated operators keep their records.", "调动后培训记录随人保留。停用的操作员保留全部记录。") + "</p>" +
      "<h4>" + T("History", "历史记录") + "</h4>" + histHtml(S.log.filter(function (l) { return l.op === o.id; })));
  }

  /* ---------- set-up section ---------- */
  function renderManage() {
    var dOpts = S.depts.map(function (d) { return '<option value="' + d.id + '">' + esc(nmP(d.n)) + "</option>"; }).join("");
    var gOpts = S.groups.map(function (g) { return '<option value="' + g.id + '">' + esc(nmP(g.n)) + "</option>"; }).join("");
    $("tmForms").innerHTML =
      '<form class="tmBox" id="tmAddOp" novalidate><h3>' + T("Add operator", "新增操作员") + '</h3><p class="tmNote">' + T("Gets the next number. Every process starts as required.", "自动编号，所有工序默认为需要。") + '</p><div class="row"><label>' + T("Department", "部门") + '<select id="tmOpD">' + dOpts + "</select></label><label>" + T("Team number", "班组编号") + '<input id="tmOpT" type="number" min="1" max="99" value="1"></label></div><div class="row"><button type="submit" class="btn pri">' + T("Add operator", "新增操作员") + '</button></div><p class="tmMsg" id="tmOpMsg" role="status"></p></form>' +
      '<form class="tmBox" id="tmAddP" novalidate><h3>' + T("Add process", "新增工序") + '</h3><p class="tmNote">' + T("Gets the next letter. Operators outside the chosen department are set to not required.", "自动按字母编号。所选部门以外的操作员设为不需要。") + '</p><div class="row"><label>' + T("Process group", "工序组") + '<select id="tmPG">' + gOpts + "</select></label><label>" + T("Valid for (months)", "有效期（月）") + '<input id="tmPV" type="number" min="1" max="60" value="12"></label></div><div class="row"><label>' + T("Required in", "适用范围") + '<select id="tmPR"><option value="all">' + esc(P("All departments", "全部部门")) + "</option>" + dOpts + '<option value="none">' + esc(P("No one yet", "暂不指定")) + '</option></select></label></div><div class="row"><button type="submit" class="btn">' + T("Add process", "新增工序") + '</button></div><p class="tmMsg" id="tmPMsg" role="status"></p></form>' +
      '<form class="tmBox" id="tmAddG" novalidate><h3>' + T("Add process group", "新增工序组") + '</h3><div class="row"><label>' + T("Minimum ready per department", "每个部门最低合格人数") + '<input id="tmGM" type="number" min="0" max="99" value="4"></label><button type="submit" class="btn">' + T("Add group", "新增组") + '</button></div><p class="tmMsg" id="tmGMsg" role="status"></p></form>' +
      '<form class="tmBox" id="tmAddD" novalidate><h3>' + T("Add department", "新增部门") + '</h3><div class="row"><button type="submit" class="btn">' + T("Add department", "新增部门") + '</button></div><p class="tmMsg" id="tmDMsg" role="status"></p></form>';
    $("tmSettings").innerHTML = '<h3>' + T("Departments", "部门") + '</h3><div class="tmScroll"><table class="tmTable tmSetT"><thead><tr><th class="l">' + T("Department name", "部门名称") + "</th><th>" + T("Operators", "操作员") + "</th></tr></thead><tbody>" +
      S.depts.map(function (d) { return '<tr><td class="l"><input class="tmName" maxlength="40" data-dname="' + d.id + '" value="' + esc(d.n) + '" aria-label="' + esc(P("Department name", "部门名称")) + '"></td><td>' + deptOps(d.id).length + "</td></tr>"; }).join("") +
      '</tbody></table></div><p class="tmNote">' + T("Type a new name and press Enter. Names must be different from each other.", "输入新名称后按回车。各部门名称不能相同。") + '</p><h3 style="margin-top:14px">' + T("Process groups", "工序组") + '</h3><div class="tmScroll"><table class="tmTable tmSetT"><thead><tr><th class="l">' + T("Group", "工序组") + '</th><th class="l">' + T("Processes", "工序") + "</th><th>" + T("Minimum ready", "最低合格人数") + "</th></tr></thead><tbody>" +
      S.groups.map(function (g) { return '<tr><td class="l">' + nm(g.n) + '</td><td class="l"><div class="tmChips">' + (procsOf(g).map(function (p) { return "<span>" + nm(p.n) + "</span>"; }).join("") || '<span class="fine">' + T("No processes yet", "还没有工序") + "</span>") + '</div></td><td><input type="number" min="0" max="99" data-gmin="' + g.id + '" value="' + g.min + '" aria-label="' + esc(P("Minimum ready", "最低合格人数") + ", " + nmP(g.n)) + '"></td></tr>'; }).join("") +
      "</tbody></table></div><h3 style=\"margin-top:14px\">" + T("Processes", "工序") + '</h3><div class="tmScroll"><table class="tmTable tmSetT"><thead><tr><th class="l">' + T("Process name", "工序名称") + '</th><th class="l">' + T("Group", "工序组") + "</th><th>" + T("Months", "月") + "</th></tr></thead><tbody>" +
      S.procs.map(function (p) { var g = S.groups.filter(function (x) { return x.procs.indexOf(p.id) >= 0; })[0]; return '<tr><td class="l"><input class="tmName" maxlength="40" data-pname="' + p.id + '" value="' + esc(p.n) + '" aria-label="' + esc(P("Process name", "工序名称")) + '"></td><td class="l">' + (g ? nm(g.n) : "–") + '</td><td><input type="number" min="1" max="60" data-pval="' + p.id + '" value="' + p.valid + '" aria-label="' + esc(P("Months", "月") + ", " + nmP(p.n)) + '"></td></tr>'; }).join("") +
      '</tbody></table></div><p class="tmNote">' + T("Type a new name and press Enter. A new validity applies to the next assessment; existing expiry dates don't change.", "输入新名称后按回车。新有效期从下一次评估起生效，已有到期日期不变。") + '</p><p class="tmMsg" id="tmSetMsg" role="status"></p>' + inactiveHtml();
  }
  function inactiveHtml() {
    var off = S.ops.filter(function (o) { return o.active === false; });
    if (!off.length) return "";
    return '<h3 style="margin-top:14px">' + T("Deactivated operators", "已停用的操作员") + '</h3><div class="tmScroll"><table class="tmTable tmSetT"><tbody>' +
      off.map(function (o) { var d = byId(S.depts, o.dept); return '<tr><td class="l">' + nm(o.n) + '</td><td class="l">' + (d ? nm(d.n) : "–") + " · " + nm(o.team) + '</td><td><button type="button" class="btn" data-react="' + o.id + '">' + T("Reactivate", "重新启用") + "</button></td></tr>"; }).join("") +
      "</tbody></table></div>";
  }
  function msg(id, ok, en, cn) { var m = $(id); if (!m) return; m.className = "tmMsg " + (ok ? "ok" : "err"); m.innerHTML = T(en, cn); }
  function intIn(id, lo, hi) { var v = $(id).value.trim(); if (!/^\d+$/.test(v)) return null; v = +v; return v >= lo && v <= hi ? v : null; }
  function maxNum(list, re) { var m = 0; list.forEach(function (x) { var r = re.exec(x.n); if (r) m = Math.max(m, +r[1]); }); return m; }

  /* ---------- Excel download (sign-up + owner approval) ----------
     The data is shown on this page only. An Excel copy needs the visitor's
     sign-up email to be on the owner's approved list (tm-approved.json,
     SHA-256 of the lower-case email; add one with src/tm_approve.py).
     This is a courtesy check in the browser, not access control. */
  var RKEY = "laoyuTmExcelRequest";
  function profile() { try { var p = JSON.parse(localStorage.getItem("laoyuProfile") || "null"); return p && p.email ? p : null; } catch (e) { return null; } }
  function sha256(s) {
    if (!(window.crypto && crypto.subtle && window.TextEncoder)) return Promise.reject(new Error("no-crypto"));
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)).then(function (b) { return Array.prototype.map.call(new Uint8Array(b), function (x) { return (x < 16 ? "0" : "") + x.toString(16); }).join(""); });
  }
  function approved(email) {
    return Promise.all([sha256(email.trim().toLowerCase()), fetch("tm-approved.json", { cache: "no-store" }).then(function (r) { if (!r.ok) throw new Error("list"); return r.json(); })])
      .then(function (a) { return Array.isArray(a[1].emails) && a[1].emails.indexOf(a[0]) >= 0; });
  }
  function myRequest(email) { try { var r = JSON.parse(localStorage.getItem(RKEY) || "null"); return r && r.email === email ? r : null; } catch (e) { return null; } }
  function openExcel() {
    var p = profile();
    if (!p) { dlg('<h3 id="tmDlgT">' + T("Download Excel", "下载 Excel") + '</h3><p class="tmNote">' + T("Sign up at the top of the page first.", "请先在页面上方登记。") + "</p>"); return; }
    dlg('<h3 id="tmDlgT">' + T("Download Excel", "下载 Excel") + '</h3><p class="tmNote" id="tmXlState">' + T("Checking your approval…", "正在检查审批状态…") + "</p>");
    approved(p.email).then(function (ok) { xlState(p, ok ? "ok" : myRequest(p.email) ? "wait" : "ask"); }, function () { xlState(p, "err"); });
  }
  function xlState(p, s) {
    var box = $("tmXlState"); if (!box || !$("tmDlg").open) return;
    var em = "<b>" + esc(p.email) + "</b>", r = myRequest(p.email), h;
    if (s === "ok") h = T("Approved for", "已批准：") + " " + em + T(".", "。") + '</p><div class="actions"><button type="button" class="btn pri" id="tmXlGo">' + T("Download Excel", "下载 Excel") + "</button></div><p class=\"tmNote\">" + T("The file includes every active operator in this browser's matrix.", "文件包含本浏览器矩阵中所有在职操作员。");
    else if (s === "wait") h = T("Request sent on", "申请已于") + " " + esc(r.on) + " " + T("with", "提交，邮箱") + " " + em + T(". ", "。") + T("LAOYU will review it. You can download once it's approved.", "老鱼审核通过后即可下载。") + '</p><div class="actions"><button type="button" class="btn" id="tmXlCheck">' + T("Check again", "重新检查") + "</button></div><p>";
    else if (s === "ask") h = T("Excel downloads need approval from LAOYU. Send a request with", "下载 Excel 需要老鱼审批。用以下邮箱提交申请：") + " " + em + T(".", "。") + '</p><div class="actions"><button type="button" class="btn pri" id="tmXlAsk">' + T("Request download", "申请下载") + "</button></div><p class=\"tmNote\">" + T("Your name and email are sent to LAOYU with the request. Your matrix data is not.", "申请只发送你的姓名和邮箱，不发送矩阵数据。");
    else h = T("Couldn't check your approval. Check your connection and try again.", "无法检查审批状态，请检查网络后重试。") + '</p><div class="actions"><button type="button" class="btn" id="tmXlCheck">' + T("Try again", "重试") + "</button></div><p>";
    box.innerHTML = h;
  }
  function sendRequest() {
    var p = profile(), G = window.LAOYU_GATE; if (!p) return;
    if (G && G.send) G.send({ type: "lead", name: p.name, email: p.email, message: "Excel download request: Training Matrix · Approve with: python src/tm_approve.py " + p.email, page: "training-matrix.html", lang: zh() ? "zh" : "en", session: "tmx-" + Date.now().toString(36), hp: "" });
    try { localStorage.setItem(RKEY, JSON.stringify({ email: p.email, on: today() })); } catch (e) {}
    xlState(p, "wait");
  }

  /* Minimal .xlsx writer: two sheets, text cells, stored (uncompressed) zip. */
  var CRC = (function () { var t = [], c, n, k; for (n = 0; n < 256; n++) { c = n; for (k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(b) { var c = 0xFFFFFFFF; for (var i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function zip(files) {
    var enc = new TextEncoder(), parts = [], dir = [], off = 0;
    function u16(v) { return [v & 255, (v >>> 8) & 255]; }
    function u32(v) { return [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255]; }
    files.forEach(function (f) {
      var name = enc.encode(f[0]), data = enc.encode(f[1]), crc = crc32(data);
      var common = [].concat(u16(20), u16(0x0800), u16(0), u16(0), u16(0x21), u32(crc), u32(data.length), u32(data.length), u16(name.length), u16(0));
      var head = new Uint8Array([].concat(u32(0x04034b50), common));
      parts.push(head, name, data);
      dir.push(new Uint8Array([].concat(u32(0x02014b50), u16(20), common, u16(0), u16(0), u16(0), u32(0), u32(off))), name);
      off += head.length + name.length + data.length;
    });
    var dsize = dir.reduce(function (s, x) { return s + x.length; }, 0);
    var end = new Uint8Array([].concat(u32(0x06054b50), u16(0), u16(0), u16(files.length), u16(files.length), u32(dsize), u32(off), u16(0)));
    return new Blob(parts.concat(dir, [end]), { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  }
  function xesc(s) { return String(s == null ? "" : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function sheet(rows) {
    return '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' +
      rows.map(function (r, i) { return '<row r="' + (i + 1) + '">' + r.map(function (v, j) { return '<c r="' + letter(j) + (i + 1) + '" t="inlineStr"><is><t xml:space="preserve">' + xesc(v) + "</t></is></c>"; }).join("") + "</row>"; }).join("") +
      "</sheetData></worksheet>";
  }
  function excel() {
    var ops = active(), procs = [];
    S.groups.forEach(function (g) { procsOf(g).forEach(function (p) { procs.push({ g: g, p: p }); }); });
    var dn = function (o) { var d = byId(S.depts, o.dept); return d ? d.n : ""; };
    var m = [["Department", "Team", "Operator"].concat(procs.map(function (x) { return x.g.n + " / " + x.p.n; })).concat(["Gaps"])];
    var rec = [["Department", "Team", "Operator", "Process group", "Process", "Status", "Assessed by", "Assessment date", "Expires"]];
    ops.forEach(function (o) {
      m.push([dn(o), o.team, o.n].concat(procs.map(function (x) { return ST[eff(o, x.p)][0]; })).concat([String(opGaps(o))]));
      procs.forEach(function (x) { var c = cell(o, x.p) || {}; rec.push([dn(o), o.team, o.n, x.g.n, x.p.n, ST[eff(o, x.p)][0], c.by || "", c.d || "", c.s === "C" ? c.exp : ""]); });
    });
    var ws = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
    var blob = zip([
      ["[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'],
      ["_rels/.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="' + ws + '/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
      ["xl/workbook.xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="' + ws + '"><sheets><sheet name="Matrix" sheetId="1" r:id="rId1"/><sheet name="Records" sheetId="2" r:id="rId2"/></sheets></workbook>'],
      ["xl/_rels/workbook.xml.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="' + ws + '/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="' + ws + '/worksheet" Target="worksheets/sheet2.xml"/></Relationships>'],
      ["xl/worksheets/sheet1.xml", sheet(m)],
      ["xl/worksheets/sheet2.xml", sheet(rec)]
    ]);
    try {
      var url = URL.createObjectURL(blob), a = document.createElement("a");
      a.href = url; a.download = "training-matrix-" + today() + ".xlsx"; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    } catch (e) { window.alert(P("Your browser blocked the download.", "浏览器阻止了下载。")); }
  }

  function renderAll() {
    try { renderKpis(); renderHeat(); renderDept(); renderManage(); }
    catch (e) { $("tmHeat").innerHTML = '<p class="tmEmpty">' + T("The matrix couldn't be shown. Use Reset demo data below to start again.", "无法显示矩阵。请使用下方的“重置演示数据”重新开始。") + "</p>"; }
  }

  /* ---------- events ---------- */
  function bind() {
    document.addEventListener("click", function (e) {
      var t = e.target, x;
      if ((x = t.closest(".tmHeatRow"))) { ui.dept = x.getAttribute("data-dept"); ui.page = 0; ui.team = ""; renderHeat(); renderDept(); $("dept").scrollIntoView({ behavior: "smooth" }); var h = $("tmDeptTitle"); if (h) h.focus({ preventScroll: true }); return; }
      if ((x = t.closest(".tmCell"))) { openCell(x.getAttribute("data-op"), x.getAttribute("data-p")); return; }
      if ((x = t.closest(".tmOpBtn"))) { openOp(x.getAttribute("data-op")); return; }
      if ((x = t.closest("[data-g]"))) { var g = x.getAttribute("data-g"); ui.closedG[g] = !ui.closedG[g]; renderMatrix(); var b = document.querySelector('[data-g="' + g + '"]'); if (b) b.focus(); return; }
      if ((x = t.closest("[data-t]"))) { var tm = x.getAttribute("data-t"); ui.closedT[tm] = !ui.closedT[tm]; renderMatrix(); var b2 = document.querySelector('[data-t="' + tm + '"]'); if (b2) b2.focus(); return; }
      if ((x = t.closest("[data-pg]"))) { ui.page = +x.getAttribute("data-pg"); renderMatrix(); $("tmMxBox").scrollIntoView({ block: "start" }); return; }
      if (t.closest("#tmGapsOnly")) { ui.gapsOnly = !ui.gapsOnly; ui.page = 0; renderMatrix(); $("tmGapsOnly").focus(); return; }
      if (t.closest("#tmByTeam")) { ui.byTeam = !ui.byTeam; renderMatrix(); $("tmByTeam").focus(); return; }
      if (t.closest("#tmXlOpen")) { openExcel(); return; }
      if (t.closest("#tmXlAsk")) { sendRequest(); return; }
      if (t.closest("#tmXlCheck")) { openExcel(); return; }
      if (t.closest("#tmXlGo")) {
        var pr = profile();
        if (!pr) return;
        approved(pr.email).then(function (ok) { if (ok) { excel(); closeDlg(); } else xlState(pr, myRequest(pr.email) ? "wait" : "ask"); }, function () { xlState(pr, "err"); });
        return;
      }
      if (t.closest("#tmReset")) { if (window.confirm(P("Replace all matrix data in this browser with the demo data? This can't be undone.", "用演示数据替换本浏览器中的全部矩阵数据？此操作无法撤销。"))) { seed(); save(); ui.dept = S.depts[0].id; ui.page = 0; renderAll(); } return; }
      if (t.closest("#tmDeact") && cur && cur.o) {
        if (window.confirm(P("Deactivate this operator? Their records are kept, and you can reactivate them under Set up the matrix.", "停用该操作员？其记录将保留，可在“设置矩阵”中重新启用。"))) { cur.o.active = false; save(); closeDlg(); renderAll(); }
        return;
      }
      if ((x = t.closest("[data-react]"))) {
        var ro = byId(S.ops, x.getAttribute("data-react"));
        if (ro) { ro.active = true; if (!byId(S.depts, ro.dept) && S.depts[0]) ro.dept = S.depts[0].id; save(); renderAll(); msg("tmSetMsg", true, ro.n + " is active again.", "操作员 " + ro.n.replace(/\D/g, "") + " 已重新启用。"); }
        return;
      }
      if (t.closest("[data-close]")) { closeDlg(); return; }
      if (t.id === "tmDlg") closeDlg();
    });
    document.addEventListener("keydown", function (e) {
      var r = e.target.closest && e.target.closest(".tmHeatRow");
      if (r && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); r.click(); }
      if (e.key === "Enter" && e.target.hasAttribute && (e.target.hasAttribute("data-dname") || e.target.hasAttribute("data-pname"))) { e.preventDefault(); e.target.blur(); }
    });
    document.addEventListener("input", function (e) {
      if (e.target.id === "tmQ") { ui.q = e.target.value; ui.page = 0; renderMatrix(); }
      if (e.target.id === "tmDate") expOut();
      if (e.target.id === "tmBy" || e.target.id === "tmDate") { var er = $("tmCellErr"); if (er) er.textContent = ""; }
    });
    document.addEventListener("change", function (e) {
      var t = e.target;
      if (t.id === "tmTeam") { ui.team = t.value; ui.page = 0; renderMatrix(); $("tmTeam").focus(); }
      else if (t.id === "tmDeptSel") { ui.dept = t.value; ui.page = 0; ui.team = ""; renderHeat(); renderDept(); $("tmDeptSel").focus(); }
      else if (t.name === "tmS") { $("tmCert").hidden = t.value !== "C"; $("tmCellErr").textContent = ""; }
      else if (t.hasAttribute("data-dname") || t.hasAttribute("data-pname")) {
        var isD = t.hasAttribute("data-dname"), list = isD ? S.depts : S.procs, attr = isD ? "data-dname" : "data-pname";
        var dep = byId(list, t.getAttribute(attr)), nv = t.value.replace(/\s+/g, " ").trim();
        if (!dep) return;
        var clash = list.some(function (x) { return x !== dep && x.n.toLowerCase() === nv.toLowerCase(); });
        if (!nv || nv.length > 40 || clash) {
          t.value = dep.n;
          if (!nv) msg("tmSetMsg", false, isD ? "Enter a department name. The previous name was kept." : "Enter a process name. The previous name was kept.", isD ? "请输入部门名称，已保留原名称。" : "请输入工序名称，已保留原名称。");
          else if (clash) msg("tmSetMsg", false, isD ? "Another department already uses that name. The previous name was kept." : "Another process already uses that name. The previous name was kept.", isD ? "已有部门使用该名称，已保留原名称。" : "已有工序使用该名称，已保留原名称。");
          else msg("tmSetMsg", false, "Use 40 characters or fewer.", "名称不能超过 40 个字符。");
          t.focus(); return;
        }
        if (nv === dep.n) { t.value = nv; return; }
        S.log.push({ t: new Date().toISOString(), renamed: 1, kind: isD ? "dept" : "proc", ref: dep.id, fromN: dep.n, toN: nv });
        dep.n = nv; save(); renderAll();
        var again = document.querySelector("[" + attr + '="' + dep.id + '"]'); if (again) again.focus();
        msg("tmSetMsg", true, isD ? "Department renamed." : "Process renamed.", isD ? "部门已改名。" : "工序已改名。");
      }
      else if (t.hasAttribute("data-gmin") || t.hasAttribute("data-pval")) {
        var isG = t.hasAttribute("data-gmin"), v = t.value.trim(), lo = isG ? 0 : 1, hi = isG ? 99 : 60;
        if (!/^\d+$/.test(v) || +v < lo || +v > hi) {
          t.value = isG ? byId(S.groups, t.getAttribute("data-gmin")).min : byId(S.procs, t.getAttribute("data-pval")).valid;
          msg("tmSetMsg", false, "Enter a whole number from " + lo + " to " + hi + ". The previous value was kept.", "请输入 " + lo + " 到 " + hi + " 之间的整数，已保留原值。"); t.focus(); return;
        }
        if (isG) byId(S.groups, t.getAttribute("data-gmin")).min = +v; else byId(S.procs, t.getAttribute("data-pval")).valid = +v;
        save(); renderKpis(); renderHeat(); renderDept(); msg("tmSetMsg", true, "Saved.", "已保存。");
      }
    });
    document.addEventListener("submit", function (e) {
      var f = e.target;
      if (!/^tm/.test(f.id || "")) return;
      e.preventDefault();
      if (f.id === "tmCellF") return saveCell(f);
      if (f.id === "tmMoveF") {
        var tn = intIn("tmMoveT", 1, 99); if (tn == null) { $("tmOpErr").textContent = P("Enter a team number from 1 to 99.", "请输入 1 到 99 的班组编号。"); return; }
        var o = cur.o, nd = $("tmMoveD").value, nt = "Team " + tn;
        if (o.dept === nd && o.team === nt) { closeDlg(); return; }
        S.log.push({ t: new Date().toISOString(), op: o.id, moved: 1, fromD: o.dept, toD: nd, team: nt, from: "N", to: "N" });
        o.dept = nd; o.team = nt; save(); closeDlg(); renderAll(); return;
      }
      if (f.id === "tmAddOp") {
        var d = $("tmOpD").value, tm = intIn("tmOpT", 1, 99);
        if (!byId(S.depts, d)) return msg("tmOpMsg", false, "Add a department first.", "请先新增部门。");
        if (tm == null) return msg("tmOpMsg", false, "Enter a team number from 1 to 99.", "请输入 1 到 99 的班组编号。");
        var n = "Operator " + (maxNum(S.ops, /^Operator (\d+)$/) + 1);
        S.ops.push({ id: nid("o"), n: n, dept: d, team: "Team " + tm, active: true }); save(); renderAll();
        $("tmOpD").value = d; $("tmOpT").value = tm;
        var m = /\d+$/.exec(n)[0], dn = byId(S.depts, d).n, dnum = /\d+$/.exec(dn);
        return msg("tmOpMsg", true, n + " added to " + dn + ".", "已新增操作员 " + m + "，加入" + (dnum ? "部门 " + dnum[0] : dn) + "。");
      }
      if (f.id === "tmAddP") {
        var g = byId(S.groups, $("tmPG").value), v = intIn("tmPV", 1, 60);
        if (!g) return msg("tmPMsg", false, "Add a process group first.", "请先新增工序组。");
        if (v == null) return msg("tmPMsg", false, "Enter months from 1 to 60.", "请输入 1 到 60 的月数。");
        var li = S.procs.length, taken = function (n) { return S.procs.some(function (x) { return x.n.toLowerCase() === n.toLowerCase(); }); };
        while (taken("Process " + letter(li))) li++;
        var L = letter(li), p = { id: nid("p"), n: "Process " + L, valid: v };
        var req = $("tmPR").value;
        S.procs.push(p); g.procs.push(p.id);
        if (req !== "all") S.ops.forEach(function (o) { if (o.dept !== req) S.cells[o.id + "|" + p.id] = { s: "N" }; });
        save(); renderAll(); $("tmPG").value = g.id; $("tmPR").value = req;
        return msg("tmPMsg", true, "Process " + L + " added.", "已新增工序 " + L + "。");
      }
      if (f.id === "tmAddG") {
        var mn = intIn("tmGM", 0, 99); if (mn == null) return msg("tmGMsg", false, "Enter a number from 0 to 99.", "请输入 0 到 99 的数字。");
        var gn = maxNum(S.groups, /^Group (\d+)$/) + 1; S.groups.push({ id: nid("g"), n: "Group " + gn, min: mn, procs: [] }); save(); renderAll();
        return msg("tmGMsg", true, "Group " + gn + " added. Add processes to it next.", "已新增第 " + gn + " 组，接下来为它新增工序。");
      }
      if (f.id === "tmAddD") {
        var dn2 = maxNum(S.depts, /^Department (\d+)$/) + 1, nd2 = { id: nid("d"), n: "Department " + dn2 }; S.depts.push(nd2); save(); renderAll();
        return msg("tmDMsg", true, "Department " + dn2 + " added.", "已新增部门 " + dn2 + "。");
      }
    });
    document.addEventListener("laoyu:lang", function () { renderAll(); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!$("tmHeat")) return;
    load(); save();
    ui.dept = S.depts[0] ? S.depts[0].id : null;
    bind(); renderAll();
  });
})();
