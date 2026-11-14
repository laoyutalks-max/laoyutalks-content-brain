/* LAOYU — contact form (contact.html).
   Sends one message to the same public sign-up/chat endpoint as gate.js.
   The server repeats the checks before saving. If sending fails, the visitor
   keeps their text and is pointed to the email address instead. */
(function () {
  "use strict";
  var LOG_URL = "https://script.google.com/macros/s/AKfycbyjk02ceJcMxwfuGGsnkwafQwP0tEkjoy7OWDhbnd3D_WUiu32qRJobGCNj2Tco__s6zg/exec";
  var TOPICS = [["A workflow for my team", "为团队做一个流程"], ["Question", "提问"], ["Collaboration", "合作"], ["Feedback", "反馈"]];
  var box, sent = false, sending = false, keep = { name: "", email: "", topic: "", message: "" };

  function zh() { return document.documentElement.getAttribute("data-lang") === "zh"; }
  function T(en, cn) { return zh() ? cn : en; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function profile() { try { return JSON.parse(localStorage.getItem("laoyuProfile") || "null"); } catch (e) { return null; } }
  function btnText() { return T("SEND MESSAGE →", "发送消息 →"); }

  function render() {
    if (sent) {
      box.innerHTML = '<p class="ctDone" role="status">✓ ' + T("Message sent. I'll reply by email.", "消息已发送，我会通过邮件回复你。") + "</p>";
      return;
    }
    box.innerHTML =
      '<form class="ctForm" novalidate>' +
        '<label for="ctName">' + T("Your name", "你的名字") + '</label><input id="ctName" name="name" autocomplete="name" maxlength="80" required value="' + esc(keep.name) + '">' +
        '<label for="ctEmail">' + T("Email (so I can reply)", "邮箱（用于回复你）") + '</label><input id="ctEmail" name="email" type="email" autocomplete="email" maxlength="120" required value="' + esc(keep.email) + '">' +
        '<label for="ctTopic">' + T("What is it about?", "关于什么？") + '</label><select id="ctTopic" name="topic">' +
          TOPICS.map(function (t) { return '<option value="' + esc(t[0]) + '"' + (keep.topic === t[0] ? " selected" : "") + ">" + esc(zh() ? t[1] : t[0]) + "</option>"; }).join("") + "</select>" +
        '<label for="ctMsg">' + T("Message", "留言") + '</label><textarea id="ctMsg" name="message" rows="5" maxlength="1000" required>' + esc(keep.message) + "</textarea>" +
        '<input class="gateHp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
        '<p class="gateErr" role="alert" hidden></p>' +
        '<button type="submit" class="btn orange">' + btnText() + "</button>" +
        '<p class="gatePriv">' + T("Used only to reply to you. No confidential company data, please. ", "仅用于回复你。请不要填写公司机密信息。") + '<a href="privacy.html">' + T("Privacy policy", "隐私政策") + "</a></p>" +
      "</form>";
  }
  function remember() {
    var f = box.querySelector("form"); if (!f) return;
    keep = { name: f.elements.name.value, email: f.elements.email.value, topic: f.elements.topic.value, message: f.elements.message.value };
  }

  function submit(e) {
    e.preventDefault();
    if (sending) return;
    var f = e.target, el = f.elements, err = f.querySelector(".gateErr"), btn = f.querySelector("button[type=submit]");
    var name = el.name.value.trim(), email = el.email.value.trim().toLowerCase(), msg = el.message.value.trim();
    function show(m, field) { err.textContent = m; err.hidden = false; if (field) field.focus(); }
    if (el.website.value) return; // bot trap
    if (!name) return show(T("Please enter your name.", "请输入你的名字。"), el.name);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return show(T("Please enter a valid email address.", "请输入有效的邮箱地址。"), el.email);
    if (msg.length < 5) return show(T("Please write a short message.", "请写下你的留言。"), el.message);
    var EC = window.LAOYU_EMAIL, fix = EC ? EC.typoFix(email) : null;
    if (fix && f.dataset.kept !== email) {
      f.dataset.kept = email;
      return show(T("Did you mean " + fix + "? Press SEND MESSAGE again to keep what you typed.", "你是不是想输入 " + fix + "？再点一次“发送消息”可保留原输入。"), el.email);
    }
    err.hidden = true; remember();
    sending = true; btn.disabled = true; btn.textContent = T("SENDING…", "正在发送…");
    (EC ? EC.check(email) : Promise.resolve({ ok: true })).then(function (r) {
      if (!r.ok) {
        sending = false; btn.disabled = false; btn.textContent = btnText();
        return show(T("Please use a work or personal email that can receive mail.", "请使用能正常收信的工作或个人邮箱。"), el.email);
      }
      var req;
      try {
        req = fetch(LOG_URL, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ type: "lead", name: name, email: email, message: "Contact form [" + keep.topic + "]: " + msg, page: "contact.html", lang: zh() ? "zh" : "en", session: "contact-" + Date.now().toString(36), hp: "" }) })
          .then(function () { return true; }, function () { return false; });
      } catch (x) { req = Promise.resolve(false); }
      Promise.race([req, new Promise(function (res) { setTimeout(function () { res(false); }, 8000); })]).then(function (ok) {
        sending = false;
        if (ok) { sent = true; render(); return; }
        render(); // the visitor's text is kept
        var e2 = box.querySelector(".gateErr");
        e2.textContent = T("Couldn't send right now (connection problem). Please try again, or email laoyutalks@gmail.com.", "暂时无法发送（网络问题）。请稍后再试，或发邮件至 laoyutalks@gmail.com。");
        e2.hidden = false;
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    box = document.getElementById("ctBox");
    if (!box) return;
    var p = profile();
    if (p) { keep.name = p.name || ""; keep.email = p.email || ""; }
    box.addEventListener("submit", submit);
    document.addEventListener("laoyu:lang", function () { if (!sending) { remember(); render(); } });
    render();
  });
})();
