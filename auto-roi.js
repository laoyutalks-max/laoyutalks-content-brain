/* =========================================================
   LAOYUTALKS — Automation Lab: ROI calculator (#roi)
   Annual manual hours   = employees × hours per week × weeks
   Hours saved           = annual manual hours × efficiency
   Remaining hours       = annual manual hours − hours saved
   Labour value saved    = hours saved × hourly cost (optional)
   Productivity gain     = annual manual hours ÷ remaining − 1
                           (output per hour on this task)
   Results are estimates. Nothing is stored or sent.
   ========================================================= */
(function () {
  "use strict";
  function zh() { return document.documentElement.getAttribute("data-lang") === "zh"; }
  function T(en, cn) { var I = window.LAOYU_I18N; return I && I.pick ? I.pick(en, cn) : (zh() ? cn : en); }
  function O(en, cn) { return zh() ? cn : en; }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function $(id) { return document.getElementById(id); }

  var IN = [
    { k: "emp", min: 1, max: 10000, step: 1, int: true, v: "5", t: ["Employees doing the task", "执行该任务的员工人数"], u: ["people", "人"] },
    { k: "hrs", min: 0.25, max: 80, step: 0.25, v: "3", t: ["Hours per employee per week", "每人每周花费的小时数"], u: ["h / week", "小时 / 周"] },
    { k: "weeks", min: 1, max: 52, step: 1, int: true, v: "48", t: ["Working weeks per year", "每年工作周数"], u: ["weeks", "周"] },
    { k: "eff", min: 5, max: 95, step: 5, v: "60", t: ["Estimated automation efficiency", "预计自动化效率"], u: ["%", "%"], hint: ["Share of the time the automation removes. Start low: 30 to 60% is typical for a first workflow.", "自动化能省下的时间比例。保守估计：第一个流程通常在 30% 到 60% 之间。"] },
    { k: "cost", min: 0, max: 100000, step: 0.5, opt: true, v: "", t: ["Hourly labour cost (optional)", "每小时人工成本（可选）"], u: ["per hour", "每小时"] }
  ];
  var CUR = ["", "USD", "MYR", "SGD", "CNY", "EUR", "GBP"];
  var S = { cur: "" };
  IN.forEach(function (f) { S[f.k] = f.v; });

  function fmt(n, d) { return Number(n).toLocaleString(zh() ? "zh-CN" : "en-US", { maximumFractionDigits: d || 0, minimumFractionDigits: 0 }); }
  function money(n) { return (S.cur ? S.cur + " " : "") + fmt(n, 0); }

  function check(f) {
    var raw = String(S[f.k]).trim();
    if (raw === "") return f.opt ? null : O("Enter a number.", "请输入数字。");
    var n = Number(raw);
    if (!isFinite(n)) return O("Enter a number.", "请输入数字。");
    if (f.int && Math.floor(n) !== n) return O("Use a whole number.", "请输入整数。");
    if (n < f.min || n > f.max) return O("Use a value from " + f.min + " to " + f.max + ".", "请输入 " + f.min + " 到 " + f.max + " 之间的数值。");
    return null;
  }
  function calc() {
    var errs = {}, ok = true;
    IN.forEach(function (f) { var e = check(f); if (e) { errs[f.k] = e; ok = false; } });
    if (!ok) return { errs: errs };
    var emp = +S.emp, hrs = +S.hrs, wk = +S.weeks, eff = +S.eff / 100, cost = S.cost.trim() === "" ? null : +S.cost;
    var manual = emp * hrs * wk, saved = manual * eff, remain = manual - saved;
    return { errs: errs, manual: manual, saved: saved, remain: remain, value: cost === null ? null : saved * cost, gain: (manual / remain - 1) * 100, eff: eff * 100, cost: cost };
  }

  function renderInputs() {
    $("roiForm").innerHTML = IN.map(function (f) {
      var id = "roi-" + f.k;
      return '<div class="roiField" data-field="' + f.k + '"><label for="' + id + '">' + T(f.t[0], f.t[1]) + "</label>" +
        '<div class="roiCtl"><input id="' + id + '" data-k="' + f.k + '" type="number" inputmode="decimal" min="' + f.min + '" max="' + f.max + '" step="' + f.step + '" value="' + esc(S[f.k]) + '"' + (f.opt ? ' placeholder="' + esc(T("e.g. 12", "例如 12")) + '"' : "") + ">" +
        (f.k === "cost" ? '<select id="roi-cur" data-cur aria-label="' + esc(T("Currency", "货币")) + '">' + CUR.map(function (c) { return '<option value="' + c + '"' + (S.cur === c ? " selected" : "") + ">" + (c || esc(T("No currency", "不选货币"))) + "</option>"; }).join("") + "</select>"
          : '<span class="roiUnit">' + T(f.u[0], f.u[1]) + "</span>") + "</div>" +
        (f.k === "eff" ? '<input type="range" min="5" max="95" step="5" data-k="eff" value="' + esc(S.eff) + '" aria-label="' + esc(T(f.t[0], f.t[1])) + '">' : "") +
        (f.hint ? '<p class="fine">' + T(f.hint[0], f.hint[1]) + "</p>" : "") +
        '<p class="wbErr" id="' + id + '-e" hidden></p></div>';
    }).join("") +
    '<div class="roiBtns"><button type="button" class="btn" data-roireset>' + T("Reset to example", "恢复示例数值") + "</button></div>";
  }

  function card(label, val, sub, cls) {
    return '<div class="roiCard' + (cls ? " " + cls : "") + '"><small>' + label + "</small><b>" + val + "</b>" + (sub ? "<span>" + sub + "</span>" : "") + "</div>";
  }
  function chart(r) {
    var W = 560, x0 = 150, bw = W - x0 - 70, max = r.manual || 1, w1 = bw, w2 = bw * (r.remain / max), w3 = bw - w2;
    var lbl1 = O("Today", "现在"), lbl2 = O("With automation", "自动化后");
    return '<svg class="roiChart" viewBox="0 0 ' + W + ' 150" role="img" aria-label="' + esc(O("Annual hours today: " + fmt(r.manual) + ". With automation: " + fmt(r.remain) + " remaining, " + fmt(r.saved) + " saved.", "现在每年 " + fmt(r.manual) + " 小时；自动化后剩余 " + fmt(r.remain) + " 小时，节省 " + fmt(r.saved) + " 小时。")) + '">' +
      '<text x="0" y="40" class="cLbl">' + esc(lbl1) + "</text>" +
      '<rect x="' + x0 + '" y="24" width="' + w1 + '" height="26" rx="3" class="cManual"/>' +
      '<text x="' + (x0 + w1 + 8) + '" y="42" class="cVal">' + fmt(r.manual) + " h</text>" +
      '<text x="0" y="96" class="cLbl">' + esc(lbl2) + "</text>" +
      '<rect x="' + x0 + '" y="80" width="' + Math.max(w2, 1) + '" height="26" rx="3" class="cRemain"/>' +
      '<rect x="' + (x0 + w2) + '" y="80" width="' + w3 + '" height="26" rx="3" class="cSaved"/>' +
      '<text x="' + (x0 + bw + 8) + '" y="98" class="cVal">' + fmt(r.remain) + " h</text>" +
      '<rect x="' + x0 + '" y="128" width="12" height="12" rx="2" class="cRemain"/><text x="' + (x0 + 18) + '" y="138" class="cKey">' + esc(O("Remaining manual hours", "剩余手工工时")) + "</text>" +
      '<rect x="' + (x0 + 200) + '" y="128" width="12" height="12" rx="2" class="cSaved"/><text x="' + (x0 + 218) + '" y="138" class="cKey">' + esc(O("Hours saved", "节省的工时")) + "</text>" +
      "</svg>";
  }
  function renderOut() {
    var r = calc();
    IN.forEach(function (f) {
      var p = $("roi-" + f.k + "-e"), box = document.querySelector('[data-field="' + f.k + '"]'), inp = $("roi-" + f.k), e = r.errs[f.k];
      if (!p) return;
      p.hidden = !e; p.textContent = e || "";
      box.classList.toggle("bad", !!e);
      inp.setAttribute("aria-invalid", String(!!e));
      if (e) inp.setAttribute("aria-describedby", "roi-" + f.k + "-e"); else inp.removeAttribute("aria-describedby");
    });
    var out = $("roiOut");
    if (Object.keys(r.errs).length) {
      out.innerHTML = '<div class="wfEmpty"><p><b>' + T("Fix the highlighted fields to see the estimate.", "请修正标出的字段以查看估算结果。") + "</b></p></div>";
      return;
    }
    out.innerHTML =
      '<div class="roiCards">' +
        card(T("Annual manual hours", "每年手工工时"), fmt(r.manual) + " h", T("today", "现在")) +
        card(T("Estimated hours saved", "预计节省工时"), fmt(r.saved) + " h", T("per year", "每年"), "hi") +
        card(T("Remaining manual hours", "剩余手工工时"), fmt(r.remain) + " h", T("per year", "每年")) +
        card(T("Estimated labour value saved", "预计节省的人工价值"), r.value === null ? "—" : esc(money(r.value)), r.value === null ? T("Add an hourly cost to see this", "填写每小时成本即可显示") : T("per year", "每年"), r.value === null ? "" : "hi") +
        card(T("Productivity improvement", "效率提升"), "+" + fmt(r.gain, 0) + "%", T("output per hour on this task", "该任务每小时产出")) +
      "</div>" + chart(r) +
      '<p class="notice">' + T("Estimates, not guaranteed savings. Real results depend on how well the process is defined, data quality, adoption, and the time needed to build and maintain the automation.",
        "以上为估算，并非保证的节省。实际效果取决于流程是否清晰、数据质量、使用情况，以及搭建和维护自动化所需的时间。") + "</p>" +
      '<div class="roiBtns"><button type="button" class="ansCopy" data-roicopy>' + T("Copy results", "复制结果") + "</button></div>";
  }
  function text() {
    var r = calc(); if (Object.keys(r.errs).length) return "";
    return [O("Automation ROI estimate (LAOYU Automation Lab)", "自动化投资回报估算（老鱼自动化实验室）"), "",
      O("Inputs: ", "输入：") + S.emp + O(" employees × ", " 人 × ") + S.hrs + O(" h/week × ", " 小时/周 × ") + S.weeks + O(" weeks; efficiency ", " 周；效率 ") + S.eff + "%" + (r.cost === null ? "" : O("; hourly cost ", "；每小时成本 ") + money(r.cost)),
      O("Annual manual hours: ", "每年手工工时：") + fmt(r.manual) + " h",
      O("Estimated hours saved: ", "预计节省工时：") + fmt(r.saved) + " h",
      O("Remaining manual hours: ", "剩余手工工时：") + fmt(r.remain) + " h",
      O("Estimated labour value saved: ", "预计节省的人工价值：") + (r.value === null ? O("not calculated (no hourly cost)", "未计算（未填写每小时成本）") : money(r.value)),
      O("Productivity improvement: +", "效率提升：+") + fmt(r.gain, 0) + O("% output per hour on this task", "%（该任务每小时产出）"), "",
      O("All figures are estimates, not guaranteed savings.", "以上均为估算，并非保证的节省。")].join("\n");
  }
  function copy(btn) {
    var label = btn.textContent, t = text();
    var done = function (m) { btn.textContent = m; setTimeout(function () { btn.textContent = label; }, 2200); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { done(O("Copied ✓", "已复制 ✓")); }, function () { window.prompt(O("Copy the results:", "复制结果："), t); });
    else window.prompt(O("Copy the results:", "复制结果："), t);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var form = $("roiForm");
    if (!form) return;
    form.addEventListener("input", function (e) {
      var t = e.target;
      if (t.dataset.k) {
        S[t.dataset.k] = t.value;
        if (t.dataset.k === "eff") form.querySelectorAll('[data-k="eff"]').forEach(function (x) { if (x !== t) x.value = t.value; });
        renderOut();
      }
    });
    form.addEventListener("change", function (e) { if (e.target.dataset.cur !== undefined) { S.cur = e.target.value; renderOut(); } });
    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-roireset]")) { IN.forEach(function (f) { S[f.k] = f.v; }); S.cur = ""; renderInputs(); renderOut(); return; }
      var c = e.target.closest("[data-roicopy]"); if (c) copy(c);
    });
    document.addEventListener("laoyu:lang", function () { renderInputs(); renderOut(); });
    renderInputs(); renderOut();
  });

  /* Used by the Automation Advisor: "Refine in ROI Calculator" */
  window.LAOYU_ROI = {
    set: function (v) {
      if (!$("roiForm") || !v) return false;
      IN.forEach(function (f) { if (v[f.k] !== undefined) S[f.k] = String(v[f.k]); });
      renderInputs(); renderOut();
      $("roi").scrollIntoView({ behavior: "smooth", block: "start" });
      var f = $("roi-cost"); if (f) f.focus({ preventScroll: true });
      return true;
    }
  };
})();
