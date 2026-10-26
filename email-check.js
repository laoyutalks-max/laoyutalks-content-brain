/* LAOYU email checks, shared by the sign-up gate and the chatbot.
   Format, temporary/test domains, common typos (gmial.com), and whether the
   domain can receive mail (Google Public DNS). The Google Sheet recorder
   repeats these checks before saving anything. */
(function () {
  /* ---------- Email checks (repeated on the server before saving) ---------- */
  var EMAIL_RE = /^[a-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,24}$/;
  var DISPOSABLE = ("mailinator.com guerrillamail.com guerrillamail.net guerrillamail.org sharklasers.com grr.la 10minutemail.com " +
    "10minutemail.net tempmail.com temp-mail.org temp-mail.io tempmail.net tempmailo.com tempr.email yopmail.com yopmail.net " +
    "trashmail.com trashmail.de getnada.com nada.email dispostable.com maildrop.cc throwawaymail.com fakeinbox.com mintemail.com " +
    "mohmal.com emailondeck.com discard.email mailnesia.com mytemp.email spamgourmet.com burnermail.io mail.tm moakt.com " +
    "tempinbox.com spambox.us mailcatch.com getairmail.com inboxkitten.com emailfake.com fakemail.net tempail.com " +
    "example.com example.org example.net test.com test.org invalid.com").split(" ");
  var COMMON = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "icloud.com", "live.com", "msn.com", "qq.com",
    "163.com", "126.com", "yahoo.com.sg", "yahoo.com.my", "hotmail.my", "protonmail.com", "me.com", "aol.com", "foxmail.com", "sina.com"];
  function dist(a, b) {
    var m = [], i, j;
    for (i = 0; i <= a.length; i++) { m[i] = [i]; }
    for (j = 0; j <= b.length; j++) { m[0][j] = j; }
    for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++)
      m[i][j] = Math.min(m[i - 1][j] + 1, m[i][j - 1] + 1, m[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
        i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1] ? m[i - 2][j - 2] + 1 : Infinity);
    return m[a.length][b.length];
  }
  function typoFix(email) {
    var at = email.lastIndexOf("@"), dom = email.slice(at + 1);
    if (COMMON.indexOf(dom) >= 0) return null;
    var best = null, bd = 3;
    COMMON.forEach(function (c) { var d = dist(dom, c); if (d > 0 && d < bd && (d === 1 || dom.length > 6)) { bd = d; best = c; } });
    return best ? email.slice(0, at + 1) + best : null;
  }
  function canReceive(domain) {
    // Ask Google Public DNS for mail (MX) records; fall back to an address (A) record.
    function q(type) {
      return fetch("https://dns.google/resolve?name=" + encodeURIComponent(domain) + "&type=" + type)
        .then(function (r) { return r.json(); })
        .then(function (j) { return j.Status === 0 && (j.Answer || []).some(function (a) { return a.type === (type === "MX" ? 15 : 1); }) ? true : (j.Status === 3 ? false : null); });
    }
    var timeout = new Promise(function (res) { setTimeout(function () { res(null); }, 4000); });
    return Promise.race([q("MX").then(function (mx) { return mx ? true : q("A").then(function (a) { return a === true ? true : (mx === false || a === false ? false : null); }); }), timeout])
      .catch(function () { return null; }); // network problem: let the server decide
  }


  /** Promise of: { ok: true } or { ok: false, reason: "format" | "disposable" | "nomail" }, plus .fix for a likely typo */
  function check(email) {
    email = String(email || "").trim().toLowerCase();
    if (!EMAIL_RE.test(email) || /\.\./.test(email)) return Promise.resolve({ ok: false, reason: "format" });
    var domain = email.split("@")[1];
    if (DISPOSABLE.indexOf(domain) >= 0) return Promise.resolve({ ok: false, reason: "disposable" });
    return canReceive(domain).then(function (r) { return r === false ? { ok: false, reason: "nomail" } : { ok: true }; });
  }
  window.LAOYU_EMAIL = { check: check, typoFix: typoFix };
})();
