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
    badName: ["Please enter your name.", "请输入你的名字。"],
    done: ["Unlocked. Thanks, {name}!", "已解锁，谢谢你，{name}！"]
  };
  function t(k) { return T[k][zh() ? 1 : 0]; }

  function unlocked() {
    try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; }
  }
  function remember(res, name) {
    try { var u = unlocked(); u[res] = { at: Date.now(), name: name }; localStorage.setItem(KEY, JSON.stringify(u)); } catch (e) {}
  }

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

  function render(gate) {
    var res = gate.getAttribute("data-resource");
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
      var name = f.name.value.trim(), email = f.email.value.trim();
      if (f.website.value) return;
      if (!name) { err.textContent = t("badName"); err.hidden = false; f.name.focus(); return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { err.textContent = t("badEmail"); err.hidden = false; f.email.focus(); return; }
      err.hidden = true;
      send({
        type: "lead",
        name: name,
        email: email,
        message: "Free resource: " + res + " · Role: " + (f.role.value || "not given") + " · New resources by email: " + (f.querySelector("#gUpd").checked ? "yes" : "no"),
        page: location.pathname.split("/").pop() || "index.html",
        lang: zh() ? "zh" : "en",
        session: "res-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        hp: ""
      });
      remember(res, name);
      var note = document.querySelector(".gateDone");
      if (note) { note.textContent = t("done").replace("{name}", name); note.hidden = false; }
      open(gate);
      var first = document.querySelector(".gated");
      if (first) first.scrollIntoView({ behavior: "smooth", block: "start" });
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
