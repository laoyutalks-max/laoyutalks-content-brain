/* LAOYU — slide-out Tools & Resources sidebar (every page).
   Opens over the page from the left edge, so the page layout does not change.
   Data: one entry per tool/resource, grouped into 7 work-area categories. */
(function () {
  "use strict";
  var SB = __DATA__;

  function zh() { return document.documentElement.getAttribute("data-lang") === "zh"; }
  function L(a) { return zh() ? a[1] : a[0]; }
  function T(en, cn) { return zh() ? cn : en; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  var here = (location.pathname.split("/").pop() || "index.html");
  var owner = false, q = "", open = {}, root, panel, tab;
  var hereItem = SB.items.filter(function (i) { return i.url === here; })[0];
  if (hereItem) open[hereItem.cat] = true;

  function usable(i) { return i.status === "ready" || (owner && i.type === "dashboard"); }
  function hay(i) { return [i.title[0], i.title[1], i.kw].concat(i.aka.reduce(function (a, b) { return a.concat(b); }, []), SB.types[i.type]).join(" ").toLowerCase(); }
  function hit(i) { if (!q) return true; var h = hay(i); return q.toLowerCase().split(/\s+/).filter(Boolean).every(function (w) { return h.indexOf(w) > -1; }); }

  function itemHTML(i) {
    var badge = i.status === "ready" ? (i.signup ? "" : '<em class="sbFree">' + T("NO SIGN-UP", "免注册") + "</em>")
      : usable(i) ? '<em class="sbOwn">' + T("OWNER", "站长") + "</em>"
      : '<em class="sbSoon">' + (i.status === "api" ? T("NEEDS AI", "需 AI") : T("SOON", "即将")) + "</em>";
    var type = '<small>' + esc(L(SB.types[i.type])) + "</small>";
    var cls = "sbItem" + (i.url === here ? " here" : "") + (usable(i) ? "" : " off");
    return usable(i)
      ? '<a class="' + cls + '" href="' + i.url + '"' + (i.url === here ? ' aria-current="page"' : "") + "><span>" + esc(L(i.title)) + type + "</span>" + badge + "</a>"
      : '<div class="' + cls + '" aria-disabled="true"><span>' + esc(L(i.title)) + type + "</span>" + badge + "</div>";
  }

  function render() {
    if (!panel) return;
    var body = panel.querySelector(".sbBody"), total = 0;
    var html = SB.cats.map(function (c) {
      var list = SB.items.filter(function (i) { return i.cat === c[0] && hit(i); })
        .sort(function (a, b) { return (usable(a) ? 0 : 1) - (usable(b) ? 0 : 1); });
      if (!list.length) return "";
      total += list.length;
      var ready = list.filter(usable).length, isOpen = q || open[c[0]];
      return '<section class="sbCat' + (isOpen ? " open" : "") + '"><button type="button" class="sbHead" data-cat="' + c[0] + '" aria-expanded="' + (!!isOpen) + '">' +
        '<i aria-hidden="true">' + c[1] + "</i><b>" + esc(L(c[2])) + '</b><span class="sbN">' + ready + "/" + list.length + '</span><span class="sbChev" aria-hidden="true">▾</span></button>' +
        '<div class="sbList">' + list.map(itemHTML).join("") + "</div></section>";
    }).join("");
    body.innerHTML = html || '<p class="sbEmpty">' + T("No match. Try another word.", "没有匹配结果，换个关键词试试。") + "</p>";
    panel.querySelector(".sbCount").textContent = q ? T(total + " found", "找到 " + total + " 项") : T(SB.items.filter(usable).length + " ready to use", SB.items.filter(usable).length + " 项可用");
    panel.querySelector(".sbTitle").textContent = T("Tools & Resources", "工具与资源");
    panel.querySelector(".sbSearch input").placeholder = T("Search, e.g. downtime, OEE, 8D", "搜索，例如：停机、OEE、8D");
    panel.querySelector(".sbClose").setAttribute("aria-label", T("Close", "关闭"));
    panel.querySelector(".sbAll").textContent = T("OPEN FULL LIBRARY →", "打开完整资源库 →");
    tab.querySelector("span").textContent = T("TOOLS", "工具");
    tab.setAttribute("aria-label", T("Open Tools & Resources", "打开工具与资源"));
  }

  function setOpen(v) {
    root.classList.toggle("open", v);
    tab.setAttribute("aria-expanded", v ? "true" : "false");
    panel.setAttribute("aria-hidden", v ? "false" : "true");
    document.documentElement.classList.toggle("sbOpen", v);
    if (v) { setTimeout(function () { panel.querySelector(".sbSearch input").focus({ preventScroll: true }); }, 60); }
    else tab.focus({ preventScroll: true });
  }

  function build() {
    root = document.createElement("div");
    root.className = "sb";
    root.setAttribute("data-i18n-block", "");
    root.innerHTML =
      '<button type="button" class="sbTab" aria-expanded="false" aria-controls="sbPanel"><b aria-hidden="true">☰</b><span></span></button>' +
      '<div class="sbShade" data-close></div>' +
      '<aside class="sbPanel" id="sbPanel" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="sbTitle">' +
        '<div class="sbTop"><div><h2 class="sbTitle" id="sbTitle"></h2><p class="sbCount"></p></div><button type="button" class="sbClose" data-close>✕</button></div>' +
        '<label class="sbSearch"><span aria-hidden="true">⌕</span><input type="search" autocomplete="off"></label>' +
        '<nav class="sbBody"></nav>' +
        '<a class="sbAll" href="resources.html"></a>' +
      "</aside>";
    document.body.appendChild(root);
    panel = root.querySelector(".sbPanel"); tab = root.querySelector(".sbTab");
    tab.addEventListener("click", function () { setOpen(!root.classList.contains("open")); });
    root.addEventListener("click", function (e) {
      if (e.target.closest("[data-close]")) { setOpen(false); return; }
      var h = e.target.closest(".sbHead");
      if (h && !q) { open[h.dataset.cat] = !open[h.dataset.cat]; render(); var nh = panel.querySelector('.sbHead[data-cat="' + h.dataset.cat + '"]'); if (nh) nh.focus(); }
    });
    panel.querySelector(".sbSearch input").addEventListener("input", function (e) { q = e.target.value.trim(); render(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && root.classList.contains("open")) setOpen(false);
      if (e.key === "Tab" && root.classList.contains("open")) {
        var f = panel.querySelectorAll("a[href], button, input");
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    render();
    document.addEventListener("laoyu:lang", render);
    (window.LAOYU_OWNER || Promise.resolve(function () { try { return localStorage.getItem("laoyuOwner") === "f81cab01a5d016ce176b362075e0f61fbce75fda490f927f1fb296a4f34e6881"; } catch (e) { return false; } }()))
      .then(function (o) { owner = !!o; render(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
})();
