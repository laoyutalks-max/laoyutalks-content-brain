/* =========================================================
   LAOYU — COPY + CSV EXPORT HELPERS
   Loaded on every page after twin.js. Client-side only.
   · Adds a "Copy" button above every prompt / template block
     (<pre>) inside <main>, with visible + spoken confirmation.
   · Adds an "Export CSV" button under every checklist / tracker
     table (table.tracker) that has no export of its own.
   Blocks that already have a copy button keep it; the extra
   button only shows there in bilingual mode, where each
   language block gets its own.
   ========================================================= */
(function () {
  "use strict";

  var root = document.documentElement;
  function zh() { return root.getAttribute("data-lang") === "zh"; }
  function bi() { return root.hasAttribute("data-bi"); }
  function L(en, cn) { return zh() ? cn : en; }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  var TXT = {
    copy: ["COPY", "复制"],
    copied: ["COPIED ✓", "已复制 ✓"],
    copyFail: ["COPY FAILED", "复制失败"],
    csv: ["EXPORT CSV", "导出 CSV"],
    csvDone: ["DOWNLOADED ✓", "已下载 ✓"],
    csvEmpty: ["NOTHING TO EXPORT", "没有可导出的内容"],
    csvFail: ["EXPORT FAILED", "导出失败"],
    saidCsvFail: ["CSV export failed. Try again or use print instead.", "CSV 导出失败，请重试或改用打印。"],
    saidCopied: ["Copied to clipboard", "已复制到剪贴板"],
    saidFail: ["Copy failed. Select the text and copy it manually.", "复制失败，请手动选择并复制文本。"],
    saidCsv: ["CSV file downloaded", "CSV 文件已下载"],
    saidEmpty: ["The table is empty, nothing to export", "表格是空的，没有可导出的内容"]
  };
  function tx(k) { return L(TXT[k][0], TXT[k][1]); }

  /* ---------- spoken feedback for screen readers ---------- */
  var live;
  function say(msg) {
    if (!live) {
      live = document.createElement("div");
      live.className = "sr";
      live.setAttribute("role", "status");
      live.setAttribute("aria-live", "polite");
      document.body.appendChild(live);
    }
    live.textContent = "";
    setTimeout(function () { live.textContent = msg; }, 30);
  }

  /* ---------- button label with timed feedback ---------- */
  function label(btn) {
    if (btn.__uxTimer) return;
    btn.textContent = tx(btn.getAttribute("data-ux") === "csv" ? "csv" : "copy");
  }
  function flash(btn, key, state) {
    clearTimeout(btn.__uxTimer);
    btn.textContent = tx(key);
    btn.setAttribute("data-state", state);
    btn.__uxTimer = setTimeout(function () {
      btn.__uxTimer = null;
      btn.removeAttribute("data-state");
      label(btn);
    }, 1800);
  }

  /* ---------- clipboard ---------- */
  function legacyCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed"; ta.style.top = "0"; ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) {}
    ta.remove();
    return ok;
  }
  function copyText(text, btn) {
    function done(ok) {
      flash(btn, ok ? "copied" : "copyFail", ok ? "ok" : "err");
      say(tx(ok ? "saidCopied" : "saidFail"));
    }
    var pending = null;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) pending = navigator.clipboard.writeText(text);
    } catch (e) { pending = null; }                    /* blocked by browser policy: use the fallback */
    if (pending && pending.then) pending.then(function () { done(true); }, function () { done(legacyCopy(text)); });
    else done(legacyCopy(text));
  }

  /* ---------- CSV ---------- */
  function shown(el) {
    if (el.hidden || el.classList.contains("sr")) return false;
    if (!bi()) {
      if (el.classList.contains("zh") && !zh()) return false;
      if (el.classList.contains("en") && zh()) return false;
    }
    return true;
  }
  function textOf(node) {
    if (node.nodeType === 3) return node.data;
    if (node.nodeType !== 1 || !shown(node)) return "";
    var tag = node.tagName;
    if (tag === "BUTTON" || tag === "SCRIPT" || tag === "STYLE") return "";
    if (tag === "TEXTAREA") return node.value;
    if (tag === "SELECT") { var o = node.options[node.selectedIndex]; return o ? o.textContent : ""; }
    if (tag === "INPUT") {
      if (node.type === "checkbox" || node.type === "radio") return node.checked ? L("Yes", "是") : "";
      if (node.type === "hidden" || node.type === "file" || node.type === "button") return "";
      return node.value;
    }
    if (tag === "BR") return " ";
    var out = "";
    for (var c = node.firstChild; c; c = c.nextSibling) {
      var part = textOf(c);
      /* bilingual mode: "English / 中文" for paired labels */
      if (part && c.nodeType === 1 && c.classList.contains("zh") && out.replace(/\s+$/, "") && bi()) out = out.replace(/\s+$/, "") + " / ";
      out += part;
      if (part && c.nodeType === 1 && !/^(SPAN|MARK|I|EM|A)$/.test(c.tagName)) out += " ";
    }
    return out;
  }
  function clean(s) { return String(s).replace(/\s+/g, " ").trim(); }
  function tableRows(table) {
    var rows = [];
    $$("tr", table).forEach(function (tr) {
      if (tr.closest("table") !== table || tr.hidden) return;
      var cells = Array.prototype.filter.call(tr.children, function (c) { return /^(TD|TH)$/.test(c.tagName); })
        .map(function (c) { return clean(textOf(c)); });
      if (cells.some(function (c) { return c; })) rows.push(cells);
    });
    return rows;
  }
  function csvCell(v) {
    /* stop spreadsheet formula injection, but leave plain numbers such as -5 or +3.5% alone */
    if (/^[=+\-@\t\r]/.test(v) && !/^[+-]?\d+([.,]\d+)?%?$/.test(v)) v = "'" + v;
    return '"' + v.replace(/"/g, '""') + '"';
  }
  function exportTable(table, btn) {
    var rows = tableRows(table);
    /* "filled" = the visitor entered something; printed row numbers and
       topic labels alone do not count. Tables without form fields
       (generated results) count as filled when they have body text. */
    var fields = $$("tbody input, tbody textarea, tbody select", table);
    var filled = fields.length
      ? fields.some(function (f) {
          if (f.type === "checkbox" || f.type === "radio") return f.checked;
          if (f.tagName === "SELECT") return f.selectedIndex > 0;
          return /^(hidden|file|button)$/.test(f.type) ? false : !!clean(f.value);
        })
      : $$("tbody tr", table).some(function (tr) { return !tr.hidden && clean(textOf(tr)); });
    if (!rows.length || !filled) {
      flash(btn, "csvEmpty", "err"); say(tx("saidEmpty")); return;
    }
    var csv = "\uFEFF" + rows.map(function (r) { return r.map(csvCell).join(","); }).join("\r\n");
    var page = (location.pathname.split("/").pop() || "laoyu").replace(/\.html$/, "") || "laoyu";
    var all = $$("main table.tracker");
    var n = all.length > 1 ? "-" + (all.indexOf(table) + 1) : "";
    var d = new Date();
    var stamp = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    try {
      var url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      var a = document.createElement("a");
      a.href = url; a.download = page + n + "-" + stamp + ".csv";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
    } catch (e) {
      flash(btn, "csvFail", "err"); say(tx("saidCsvFail")); return;
    }
    flash(btn, "csvDone", "ok"); say(tx("saidCsv"));
  }

  /* ---------- add the buttons ---------- */
  var OWN_COPY = '[data-copy], [data-kit-copy], [id$="Copy"], [data-pp-copy]';
  var OWN_CSV = '[data-csv], [id$="Csv"], #dExport';

  function makeBtn(kind) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "uxBtn";
    b.setAttribute("data-ux", kind);
    label(b);
    return b;
  }

  function decorate() {
    var main = document.querySelector("main");
    if (!main) return;

    /* drop buttons whose block was re-rendered away */
    $$(".uxCopyBar", main).forEach(function (bar) {
      var nx = bar.nextElementSibling;
      if (!nx || nx.tagName !== "PRE") bar.remove();
    });
    $$(".uxCsvBar", main).forEach(function (bar) {
      if (!bar.__uxTable || !main.contains(bar.__uxTable)) bar.remove();
    });

    $$("pre", main).forEach(function (pre) {
      var prev = pre.previousElementSibling;
      if (prev && prev.classList.contains("uxCopyBar")) return;
      var bar = document.createElement("div");
      bar.className = "uxCopyBar";
      if (pre.classList.contains("en")) bar.classList.add("en");
      if (pre.classList.contains("zh")) bar.classList.add("zh");
      var box = pre.closest("article, section, .panel, .kitBox") || pre.parentNode;
      if (box.querySelector(OWN_COPY)) bar.classList.add("dup");
      bar.appendChild(makeBtn("copy"));
      pre.parentNode.insertBefore(bar, pre);
    });

    $$("table.tracker", main).forEach(function (table) {
      if (table.__uxCsv && main.contains(table.__uxCsv)) return;
      var box = table.closest("article, section, .panel") || table.parentNode;
      if (table.matches("#atTable, #smGrid") || box.querySelector(OWN_CSV)) return;   /* these have their own export */
      var anchor = table;
      var p = table.parentNode;
      if (p.children.length === 1 && /^(DIV|FIGURE)$/.test(p.tagName) && !p.matches("article, section, .panel")) anchor = p;
      var bar = document.createElement("div");
      bar.className = "uxCsvBar";
      bar.__uxTable = table;
      table.__uxCsv = bar;
      bar.appendChild(makeBtn("csv"));
      anchor.insertAdjacentElement("afterend", bar);
    });
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest ? e.target.closest(".uxBtn") : null;
    if (!btn) return;
    var bar = btn.parentNode;
    if (btn.getAttribute("data-ux") === "csv") {
      if (bar.__uxTable) exportTable(bar.__uxTable, btn);
    } else {
      var pre = bar.nextElementSibling;
      var text = pre && pre.tagName === "PRE" ? pre.textContent.trim() : "";
      if (text) copyText(text, btn);
    }
  });

  document.addEventListener("laoyu:lang", function () { $$(".uxBtn").forEach(label); });

  document.addEventListener("DOMContentLoaded", function () {
    decorate();
    var main = document.querySelector("main");
    if (!main || !("MutationObserver" in window)) return;
    var queued = false;
    new MutationObserver(function () {
      if (queued) return;
      queued = true;
      setTimeout(function () { queued = false; decorate(); }, 60);
    }).observe(main, { childList: true, subtree: true });
  });
})();
