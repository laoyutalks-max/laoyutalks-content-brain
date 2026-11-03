/* LAOYU — owner preview for unreleased resources.
   Open any page with ?owner=<your key> once on a device to turn owner preview on;
   ?owner=off turns it off. Only a SHA-256 hash of the key is stored in this file.
   Note: this is a soft lock for a static site (it keeps unreleased pages away from
   visitors); it is not a security boundary, so never put real company data in these pages. */
(function () {
  "use strict";
  var HASH = "f81cab01a5d016ce176b362075e0f61fbce75fda490f927f1fb296a4f34e6881";
  var KEY = "laoyuOwner";
  function stored() { try { return localStorage.getItem(KEY) === HASH; } catch (e) { return false; } }
  function sha256(s) {
    if (!window.crypto || !crypto.subtle || !window.TextEncoder) return Promise.resolve("");
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(s)).then(function (b) {
      return Array.prototype.map.call(new Uint8Array(b), function (x) { return ("0" + x.toString(16)).slice(-2); }).join("");
    });
  }
  function cleanUrl() {
    try {
      var u = new URL(location.href); u.searchParams.delete("owner");
      history.replaceState(null, "", u.pathname + (u.search ? u.search : "") + u.hash);
    } catch (e) {}
  }
  var ready;
  var m = location.search.match(/[?&]owner=([^&#]+)/);
  if (m) {
    var v = decodeURIComponent(m[1]);
    if (v === "off") { try { localStorage.removeItem(KEY); } catch (e) {} cleanUrl(); ready = Promise.resolve(false); }
    else ready = sha256(v).then(function (h) {
      cleanUrl();
      if (h === HASH) { try { localStorage.setItem(KEY, HASH); } catch (e) {} return true; }
      return stored();
    }).catch(function () { cleanUrl(); return stored(); });
  } else ready = Promise.resolve(stored());
  window.LAOYU_OWNER = ready;
  ready.then(function (on) { if (on) document.documentElement.classList.add("isOwner"); });
})();
