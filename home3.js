/* =========================================================
   LAOYUTALKS 3.0 — homepage sections built from data
   Featured resources · lessons · worked demos · subscribe.
   Reads resources-data.js so titles and links stay in one place.
   ========================================================= */
(function () {
  "use strict";
  var D = window.LAOYU_DATA;
  if (!D) return;
  function zh() { return document.documentElement.getAttribute("data-lang") === "zh"; }
  function biPick(en, cn) { var I = window.LAOYU_I18N; return I && I.pick ? I.pick(en, cn) : (zh() ? cn : en); } /* EN+中: both, see i18n.js */
  function L(a) { return a ? biPick(a[0], a[1]) : ""; }
  function T(en, cn) { return biPick(en, cn); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function $(id) { return document.getElementById(id); }
  function res(id) { return D.resources.filter(function (x) { return x.id === id; })[0]; }
  function profile() { try { return JSON.parse(localStorage.getItem("laoyuProfile") || "null"); } catch (e) { return null; } }

  var FEATURED = ["oee-loss-calculator", "shift-handover", "8d-report", "ai-prompt-pack", "manpower-gap-calculator", "weekly-action-tracker"];
  var DEMOS = ["demo-daily-report", "demo-root-cause", "demo-shift-handover"];
  /* Real videos on @laoyu.talks, each paired with the free tool for the same problem */
  var LESSONS = [
    ["7700187298062781716", ["Same mistake again?", "又犯同样的错误？"], "repeated-mistake-worksheet"],
    ["7697574703711653140", ["Your production line is running. But is it productive?", "生产线在运转，但真的有效率吗？"], "oee-loss-calculator"],
    ["7697970844294991124", ["You can have ten dashboards and still miss the real problem", "十个仪表板，也可能错过真正的问题"], "production-kpi-dashboard"]
  ];
  var PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 1.500v13l11-6.500z"/></svg>';

  function access(r) { return r.gated ? T("Free sign-up", "免费注册") : T("No sign-up", "免注册"); }
  function shot(r) {
    return '<span class="shot"><img src="assets/previews/' + r.id + "-" + (zh() ? "zh" : "en") + '.jpg" alt="" loading="lazy" width="680" height="427"></span>';
  }

  function featured() {
    var box = $("hFeatured"); if (!box) return;
    box.innerHTML = FEATURED.map(function (id) {
      var r = res(id); if (!r) return "";
      return '<a class="card rcard" href="' + r.url + '">' + shot(r) + '<span class="body"><span class="chips"><span class="chip">' + esc(L(D.types[r.type])) +
        '</span><span class="chip g">' + access(r) + "</span></span><b>" + esc(L(r.title)) + "</b><em>" + esc(L(r.problem)) + "</em></span></a>";
    }).join("");
  }

  function lessons() {
    var box = $("hLessons"); if (!box) return;
    box.innerHTML = LESSONS.map(function (c) {
      var r = res(c[2]); if (!r) return "";
      return '<div class="card lesson"><a class="vid" href="https://www.tiktok.com/@laoyu.talks/video/' + c[0] + '" target="_blank" rel="noopener noreferrer">' +
        '<i class="play">' + PLAY + "</i><span><b>" + esc(L(c[1])) + "</b><small>" + T("Watch on TikTok ↗", "在 TikTok 观看 ↗") + "</small></span></a>" +
        '<a class="tool" href="' + r.url + '"><small>' + T("Free tool for this problem", "解决这个问题的免费工具") + "</small>" + esc(L(r.title)) + " →</a></div>";
    }).join("");
  }

  function demos() {
    var box = $("hDemos"); if (!box) return;
    box.innerHTML = DEMOS.map(function (id) {
      var r = res(id); if (!r) return "";
      return '<a class="card rcard" href="' + r.url + '">' + shot(r) + '<span class="body"><span class="chips"><span class="chip a">' + T("Sample data", "示例数据") +
        "</span></span><b>" + esc(L(r.title)) + "</b><em>" + esc(L(r.problem)) +
        '</em><span class="go">' + T("Try the demo →", "试用演示 →") + "</span></span></a>";
    }).join("");
  }

  /* ---------- Subscribe: email me when a new free resource is released ---------- */
  var LOG_URL = "https://script.google.com/macros/s/AKfycbyjk02ceJcMxwfuGGsnkwafQwP0tEkjoy7OWDhbnd3D_WUiu32qRJobGCNj2Tco__s6zg/exec";
  var SUB_KEY = "laoyuCommunityNotify";
  var sending = false, subError = "", subDraft = "";

  function subscribed() { try { return localStorage.getItem(SUB_KEY) === "1"; } catch (e) { return false; } }

  function subscribe() {
    var box = $("hSubscribe"); if (!box) return;
    var p = profile(), html;
    if (subscribed()) {
      html = '<p class="subMsg ok" role="status">✓ ' + T("You're on the list. We'll email you when a new free resource is released.", "已登记。有新的免费资源时会邮件通知你。") + "</p>";
    } else if (p && p.email) {
      html = '<div class="subForm"><button type="button" class="btn pri" data-sub-known' + (sending ? " disabled" : "") + ">" + (sending ? T("Sending…", "正在发送…") : T("Notify me", "通知我")) + "</button></div>" +
        '<p class="fine">' + T("We'll email ", "我们会发到 ") + "<b>" + esc(p.email) + "</b></p>";
    } else {
      html = '<form class="subForm" novalidate><label class="sr" for="subEmail">' + T("Email address", "邮箱地址") + "</label>" +
        '<input id="subEmail" type="email" autocomplete="email" maxlength="120" placeholder="' + T("Your email", "你的邮箱") + '" value="' + esc(subDraft) + '"' + (sending ? " disabled" : "") + ">" +
        '<button type="submit" class="btn pri"' + (sending ? " disabled" : "") + ">" + (sending ? T("Sending…", "正在发送…") : T("Notify me", "通知我")) + "</button></form>";
    }
    if (subError && !subscribed()) html += '<p class="subMsg err" role="alert">' + esc(subError) + "</p>";
    if (!subscribed()) html += '<p class="fine">' + T("Only used for LAOYU resource updates. Unsubscribe any time. ", "只用于老鱼的资源更新通知，可随时退订。") +
      '<a href="privacy.html">' + T("Privacy policy", "隐私政策") + "</a></p>";
    box.innerHTML = html;
  }

  function send(email, name) {
    if (sending) return;
    sending = true; subError = ""; subDraft = email; subscribe();
    var req;
    try {
      req = fetch(LOG_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ type: "lead", name: name || "(Community)", email: email, message: "Community: notify me of new free resources", page: "index.html", lang: zh() ? "zh" : "en", session: "community-" + Date.now().toString(36), hp: "" }) })
        .then(function () { return true; }, function () { return false; });
    } catch (e) { req = Promise.resolve(false); }
    Promise.race([req, new Promise(function (r) { setTimeout(function () { r(false); }, 8000); })]).then(function (ok) {
      sending = false;
      if (ok) { try { localStorage.setItem(SUB_KEY, "1"); } catch (e) {} subDraft = ""; }
      else subError = T("Couldn't save your email right now (connection problem). Please try again, or email laoyutalks@gmail.com.", "暂时无法保存你的邮箱（网络问题）。请稍后再试，或发邮件至 laoyutalks@gmail.com。");
      subscribe();
      if (!ok) { var i = $("subEmail"); if (i) i.focus(); }
    });
  }

  function fail(msg, email) { subError = msg; subDraft = email; subscribe(); var i = $("subEmail"); if (i) i.focus(); }

  function all() { featured(); lessons(); demos(); subscribe(); }

  document.addEventListener("DOMContentLoaded", function () {
    var box = $("hSubscribe");
    if (box) {
      var kept = "";
      box.addEventListener("click", function (e) {
        if (e.target.closest("[data-sub-known]")) { var p = profile(); if (p && p.email) send(p.email, p.name); }
      });
      box.addEventListener("submit", function (e) {
        e.preventDefault();
        var v = ($("subEmail").value || "").trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return fail(T("Please enter a valid email address.", "请输入有效的邮箱地址。"), v);
        var EC = window.LAOYU_EMAIL, fix = EC ? EC.typoFix(v) : null;
        if (fix && kept !== v) { kept = v; return fail(T("Did you mean " + fix + "? Press Notify me again to keep what you typed.", "你是不是想输入 " + fix + "？再点一次“通知我”可保留原输入。"), v); }
        if (!EC) return send(v);
        if (sending) return;
        /* show progress and clear any old error while the address is checked */
        sending = true; subError = ""; subDraft = v; subscribe();
        var go = function (ok) {
          sending = false;
          if (ok) send(v); else fail(T("Please use a work or personal email that can receive mail.", "请使用能正常收信的工作或个人邮箱。"), v);
        };
        EC.check(v).then(function (r) { go(r.ok); }, function () { go(true); }); /* check unavailable: the recorder repeats it */
      });
    }
    document.addEventListener("laoyu:lang", function () { var i = $("subEmail"); if (i) subDraft = i.value; subError = ""; all(); });
    all();
  });
})();
