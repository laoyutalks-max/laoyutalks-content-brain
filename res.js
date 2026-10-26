/* Free resource pages: checklist score + saved answers, prompt copy, print */
(function () {
  var zh = function () { return document.documentElement.getAttribute("data-lang") === "zh"; };
  var page = (location.pathname.split("/").pop() || "").replace(".html", "");
  var KEY = "laoyuRes:" + page;

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } }
  function save(d) { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }

  function bands() {
    return zh()
      ? [["持续观察", "目前信号不多。保持正常沟通，几周后再看一次。", "ok"], ["本周安排一对一谈话", "信号已经累积。先检查第 2 部分，再进行第 3 部分的谈话。", "warn"], ["立即行动", "多个信号同时出现。优先谈话，并检查工作量与岗位是否合适。", "bad"]]
      : [["Keep observing", "Few signals so far. Keep talking normally and check again in a few weeks.", "ok"], ["Have a 1:1 this week", "Signals are adding up. Check Part 2, then have the Part 3 conversation.", "warn"], ["Act now", "Several signals at once. Make the conversation a priority and check workload and role fit.", "bad"]];
  }

  function score() {
    var n = document.querySelectorAll("[data-sig]:checked").length;
    var el = document.getElementById("scoreN");
    if (!el) return;
    el.textContent = n;
    var b = bands()[n <= 2 ? 0 : n <= 5 ? 1 : 2];
    var band = document.getElementById("scoreBand");
    band.className = "scoreBand " + b[2];
    band.innerHTML = "<b>" + b[0] + "</b><span>" + b[1] + "</span>";
  }

  function fields() { return document.querySelectorAll("[data-sig], [data-keep]"); }

  function restore() {
    var d = load();
    fields().forEach(function (el, i) {
      var k = el.id || "f" + i;
      if (!(k in d)) return;
      if (el.type === "checkbox") el.checked = !!d[k]; else el.value = d[k];
    });
    score();
  }

  function persist() {
    var d = {};
    fields().forEach(function (el, i) { d[el.id || "f" + i] = el.type === "checkbox" ? el.checked : el.value; });
    save(d);
  }

  function copy(text, btn) {
    var done = function () {
      var o = btn.innerHTML;
      btn.textContent = zh() ? "已复制 ✓" : "COPIED ✓";
      setTimeout(function () { btn.innerHTML = o; }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(text); done(); });
    } else { fallback(text); done(); }
  }
  function fallback(text) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    ta.remove();
  }

  document.addEventListener("DOMContentLoaded", function () {
    restore();
    document.addEventListener("change", function (e) { if (e.target.matches("[data-sig], [data-keep]")) { persist(); score(); } });
    document.addEventListener("input", function (e) { if (e.target.matches("[data-keep]")) persist(); });
    document.addEventListener("laoyu:lang", score);
    document.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest("[data-print], [data-reset], [data-copy]") : null;
      if (!t) return;
      if (t.hasAttribute("data-print")) window.print();
      else if (t.hasAttribute("data-reset")) {
        if (t.dataset.armed !== "1") {
          t.dataset.armed = "1";
          t.dataset.en = t.dataset.en || t.querySelector(".en").textContent; t.dataset.zh = t.dataset.zh || t.querySelector(".zh").textContent;
          t.querySelector(".en").textContent = "CLICK AGAIN TO CLEAR"; t.querySelector(".zh").textContent = "再点一次确认清除";
          setTimeout(function () { if (t.dataset.armed === "1") { t.dataset.armed = ""; t.querySelector(".en").textContent = t.dataset.en; t.querySelector(".zh").textContent = t.dataset.zh; } }, 4000);
          return;
        }
        try { localStorage.removeItem(KEY); } catch (err) {}
        fields().forEach(function (el) { if (el.type === "checkbox") el.checked = false; else el.value = ""; });
        score();
        document.dispatchEvent(new Event("laoyu:reset"));
        t.dataset.armed = "";
        t.querySelector(".en").textContent = t.dataset.en; t.querySelector(".zh").textContent = t.dataset.zh;
      } else if (t.hasAttribute("data-copy")) {
        var card = t.closest(".prompt");
        var pre = card.querySelector("pre." + (zh() ? "zh" : "en"));
        copy(pre.textContent.trim(), t);
      }
    });
  });
})();
