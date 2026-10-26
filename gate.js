/* =========================================================
   LAOYU free-resource sign-up gate
   Visitors leave name + email to unlock a resource. Details go
   to the same Google Sheet recorder as the chatbot (Leads tab).
   Unlock is remembered in this browser so returning visitors
   are not asked again.

   Usage on a page:
     <div class="gate" data-resource="Checklist name"></div>
     <div class="gated" hidden> ...content... </div>
   ========================================================= */

(function () {

  var LOG_URL = "https://script.google.com/macros/s/AKfycbyjk02ceJcMxwfuGGsnkwafQwP0tEkjoy7OWDhbnd3D_WUiu32qRJobGCNj2Tco__s6zg/exec";
  var KEY = "laoyuResources";

  function zh() { return document.documentElement.getAttribute("data-lang") === "zh"; }

  var T = {
    title: ["Get it free", "免费领取"],
    sub: ["Leave your name and email and it opens right here. One step, no payment.", "留下姓名和邮箱，马上在这里打开。只需一步，完全免费。"],
    name: ["Your name", "你的名字"],
    email: ["Work or personal email", "工作或个人邮箱"],
    role: ["Your role (optional)", "你的职位（选填）"],
    roles: [["Supervisor / Team lead", "主管 / 组长"], ["Engineer", "工程师"], ["Manager", "经理"], ["Planner / QA / other", "计划 / 质量 / 其他"]],
    updates: ["Email me when LAOYU releases a new free resource", "有新的免费资源时通知我"],
    btn: ["UNLOCK NOW →", "立即解锁 →"],
    privacy: ["Your details are only used for LAOYU resources and updates. No spam, unsubscribe any time. ", "你的信息只用于老鱼的资源与更新。不发垃圾邮件，可随时退订。"],
    privacyLink: ["Privacy policy", "隐私政策"],
    badEmail: ["Please enter a valid email address.", "请输入有效的邮箱地址。"],
    typo: ["Did you mean {s}?", "你是不是要输入 {s}？"],
    useIt: ["Yes, use it", "是，使用这个"],
    disposable: ["Temporary or test email addresses can't be used. Please use your work or personal email.", "不能使用临时或测试邮箱。请使用你的工作或个人邮箱。"],
    noMail: ["This email domain can't receive mail. Please check the spelling.", "这个邮箱域名无法收信，请检查拼写。"],
    checking: ["CHECKING…", "正在检查…"],
    badName: ["Please enter your name.", "请输入你的名字。"],
    done: ["Unlocked. Thanks, {name}!", "已解锁，谢谢你，{name}！"],
    back: ["Welcome back, {name}", "欢迎回来，{name}"],
    backSub: ["You already signed up. Unlock this one with {email}.", "你已经注册过了。用 {email} 一键解锁这份资源。"],
    oneClick: ["UNLOCK WITH ONE CLICK →", "一键解锁 →"],
    notMe: ["Use a different email", "使用其他邮箱"]
  };
  function t(k) { return T[k][zh() ? 1 : 0]; }

  function unlocked() {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; }
  }
  function remember(res, name) {
    try { var u = unlocked(); u[res] = { at: Date.now(), name: name }; localStorage.setItem(KEY, JSON.stringify(u)); } catch (e) {}
  }

  var PKEY = "laoyuProfile";
  function profile() { try { return JSON.parse(localStorage.getItem(PKEY) || "null"); } catch (e) { return null; } }
  function keepProfile(p) { try { localStorage.setItem(PKEY, JSON.stringify(p)); } catch (e) {} }
  var full = false;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; });
  }

  function send(data) {
    try {
      fetch(LOG_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data)
      }).catch(function () {});
    } catch (e) {}
  }

  function open(gate) {
    gate.hidden = true;
    document.querySelectorAll(".gated").forEach(function (el) { el.hidden = false; });
    document.documentElement.classList.add("isUnlocked");
  }

  function unlock(gate, res, p) {
    send({
      type: "lead",
      name: p.name,
      email: p.email,
      message: "Free resource: " + res + " · Role: " + (p.role || "not given") + " · New resources by email: " + (p.updates ? "yes" : "no"),
      page: location.pathname.split("/").pop() || "index.html",
      lang: zh() ? "zh" : "en",
      session: "res-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      hp: ""
    });
    remember(res, p.name);
    var note = document.querySelector(".gateDone");
    if (note) { note.textContent = t("done").replace("{name}", p.name); note.hidden = false; }
    open(gate);
    var first = document.querySelector(".gated");
    if (first) first.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function render(gate) {
    var res = gate.getAttribute("data-resource");
    var p = profile();
    if (p && p.email && !full) {
      gate.innerHTML =
        '<div class="gateForm gateBack">' +
          "<h2>" + esc(t("back").replace("{name}", p.name)) + "</h2>" +
          "<p>" + esc(t("backSub")).replace("{email}", "<b>" + esc(p.email) + "</b>") + "</p>" +
          '<button type="button" class="btn orange" data-one>' + t("oneClick") + "</button> " +
          '<button type="button" class="gateSwap" data-swap>' + t("notMe") + "</button>" +
          '<p class="gatePriv">' + t("privacy") + '<a href="privacy.html">' + t("privacyLink") + "</a></p>" +
        "</div>";
      gate.querySelector("[data-one]").addEventListener("click", function () { unlock(gate, res, p); });
      gate.querySelector("[data-swap]").addEventListener("click", function () { full = true; render(gate); var n = gate.querySelector("#gName"); if (n) n.focus(); });
      return;
    }
    gate.innerHTML =
      '<form class="gateForm" novalidate>' +
        "<h2>" + t("title") + "</h2>" +
        "<p>" + t("sub") + "</p>" +
        '<div class="gateFields">' +
          '<label for="gName">' + t("name") + '</label><input id="gName" name="name" autocomplete="name" maxlength="80" required>' +
          '<label for="gEmail">' + t("email") + '</label><input id="gEmail" name="email" type="email" autocomplete="email" maxlength="120" required>' +
          '<label for="gRole">' + t("role") + '</label><select id="gRole" name="role"><option value=""></option>' +
            T.roles.map(function (r) { return '<option value="' + esc(r[0]) + '">' + esc(r[zh() ? 1 : 0]) + "</option>"; }).join("") +
          "</select>" +
          '<input class="gateHp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        "</div>" +
        '<label class="gateCheck" for="gUpd"><input id="gUpd" type="checkbox" checked> ' + t("updates") + "</label>" +
        '<p class="gateErr" role="alert" hidden></p>' +
        '<button type="submit" class="btn orange">' + t("btn") + "</button>" +
        '<p class="gatePriv">' + t("privacy") + '<a href="privacy.html">' + t("privacyLink") + "</a></p>" +
      "</form>";

    gate.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault();
      var f = e.target, err = f.querySelector(".gateErr");
      var name = f.name.value.trim(), email = f.email.value.trim().toLowerCase();
      var btn = f.querySelector("button[type=submit]");
      function fail(msg) { err.textContent = msg; err.hidden = false; f.email.focus(); btn.disabled = false; btn.innerHTML = t("btn"); }
      if (f.website.value) return;
      if (!name) { err.textContent = t("badName"); err.hidden = false; f.name.focus(); return; }
      var EC = window.LAOYU_EMAIL;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail(t("badEmail"));
      var fix = EC ? EC.typoFix(email) : null;
      if (fix && f.dataset.keptTypo !== email) {
        err.hidden = false;
        err.innerHTML = esc(t("typo")).replace("{s}", "<b>" + esc(fix) + "</b>") + ' <button type="button" class="gateSwap" data-fix>' + t("useIt") + "</button>";
        err.querySelector("[data-fix]").addEventListener("click", function () { f.email.value = fix; err.hidden = true; f.dataset.keptTypo = ""; });
        f.dataset.keptTypo = email; // pressing UNLOCK again keeps what they typed
        return;
      }
      err.hidden = true;
      btn.disabled = true; btn.textContent = t("checking");
      (EC ? EC.check(email) : Promise.resolve({ ok: true })).then(function (r) {
        if (!r.ok) return fail(t(r.reason === "format" ? "badEmail" : r.reason === "disposable" ? "disposable" : "noMail"));
        var p = { name: name, email: email, role: f.role.value, updates: f.querySelector("#gUpd").checked };
        keepProfile(p);
        unlock(gate, res, p);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var gate = document.querySelector(".gate");
    if (!gate) return;
    var res = gate.getAttribute("data-resource");
    if (unlocked()[res]) { open(gate); return; }
    render(gate);
    document.addEventListener("laoyu:lang", function () { if (!gate.hidden) render(gate); });
  });

})();
