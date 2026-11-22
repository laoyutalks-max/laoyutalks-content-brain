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

  /* Site pages, so the search covers the whole site and not only the tools */
  var PAGES = [
    ["index.html", ["Home", "首页"], "home start homepage 主页"],
    ["learn.html", ["Learn with LAOYU", "跟老鱼学习"], "learn video videos lesson tiktok topic 视频 课程 学习 话题"],
    ["ai-lab.html", ["ASK LAOYU · AI Lab", "问老鱼 · AI 实验室"], "ai lab assistant ask laoyu chat manufacturing quality management 助手 提问 实验室"],
    ["automation.html", ["Automation Lab", "自动化实验室"], "automation workflow apps script google sheets forms appsheet looker report email document 自动化 工作流程 表格 报告"],
    ["resources.html", ["Resource library", "资源库"], "resources library all tools templates 全部 资源 模板"],
    ["ai-tools.html", ["AI Tools", "AI 工具"], "ai tools roadmap 工具"],
    ["about.html#watch", ["LAOYUTALKS videos", "LAOYUTALKS 视频"], "videos tiktok channel 视频 频道"],
    ["about.html", ["Our Story", "品牌故事"], "about story mission vision founder 关于 故事 使命"],
    ["contact.html", ["Contact", "联系"], "contact email message feedback 联系 邮箱 留言"],
    ["privacy.html", ["Privacy policy", "隐私政策"], "privacy data 隐私 数据"],
    ["terms.html", ["Terms of use", "使用条款"], "terms conditions 条款"]
  ];
  function pageHit(p) { var h = (p[1][0] + " " + p[1][1] + " " + p[2]).toLowerCase(); return q.toLowerCase().split(/\s+/).filter(Boolean).every(function (w) { return h.indexOf(w) > -1; }); }

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
        '<i aria-hidden="true">' + c[1] + "</i><b>" + esc(L(c[2])) + '</b><span class="sbN">' + (ready === list.length ? ready : ready + T(" ready · ", " 可用 · ") + (list.length - ready) + T(" soon", " 即将")) + '</span><span class="sbChev" aria-hidden="true">▾</span></button>' +
        '<div class="sbList">' + list.map(itemHTML).join("") + "</div></section>";
    }).join("");
    if (q) {
      var pages = PAGES.filter(pageHit);
      if (pages.length) {
        total += pages.length;
        html += '<section class="sbCat open"><div class="sbHead"><b>' + T("Pages", "页面") + '</b><span class="sbN">' + pages.length + '</span></div><div class="sbList">' +
          pages.map(function (p) { return '<a class="sbItem" href="' + p[0] + '"><span>' + esc(L(p[1])) + "<small>" + T("Page", "页面") + "</small></span></a>"; }).join("") + "</div></section>";
      }
    }
    body.innerHTML = html || '<p class="sbEmpty">' + T("No match. Try another word.", "没有匹配结果，换个关键词试试。") + "</p>";
    panel.querySelector(".sbCount").textContent = q ? T(total + " found", "找到 " + total + " 项") : T(SB.items.filter(usable).length + " ready to use", SB.items.filter(usable).length + " 项可用");
    panel.querySelector(".sbTitle").textContent = T("Tools & Resources", "工具与资源");
    panel.querySelector(".sbSearch input").placeholder = T("Search tools and pages, e.g. OEE, 8D, contact", "搜索工具和页面，例如：OEE、8D、联系");
    panel.querySelector(".sbSearch input").setAttribute("aria-label", T("Search the site", "搜索全站"));
    panel.querySelector(".sbClose").setAttribute("aria-label", T("Close", "关闭"));
    panel.querySelector(".sbAll").textContent = T("OPEN FULL LIBRARY →", "打开完整资源库 →");
    tab.querySelector(".sbTabTxt").textContent = T("Search", "搜索");
    var hint = document.querySelector(".sbHint");
    if (hint) hint.innerHTML = "<b>" + T("Click me!", "点我！") + "</b> " + T(SB.items.filter(usable).length + " free tools, sorted by problem", SB.items.filter(usable).length + " 个免费工具，按问题分类");
    tab.setAttribute("aria-label", T("Search tools and pages", "搜索工具和页面"));
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
            '<div class="sbShade" data-close></div>' +
      '<aside class="sbPanel" id="sbPanel" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="sbTitle">' +
        '<div class="sbTop"><div><h2 class="sbTitle" id="sbTitle"></h2><p class="sbCount"></p></div><button type="button" class="sbClose" data-close>✕</button></div>' +
        '<label class="sbSearch"><span aria-hidden="true">⌕</span><input type="search" autocomplete="off"></label>' +
        '<nav class="sbBody"></nav>' +
        '<a class="sbAll" href="resources.html"></a>' +
      "</aside>";
    document.body.appendChild(root);
    var wrap = document.createElement("span");
    wrap.className = "sbTabWrap";
    wrap.setAttribute("data-i18n-block", "");
    wrap.innerHTML = '<button type="button" class="sbTab" aria-expanded="false" aria-controls="sbPanel"><span class="sbLogo"><svg class="sbIco" viewBox="0 0 48 48" aria-hidden="true"><polygon class="sbHex" points="24,2.5 42.5,13.25 42.5,34.75 24,45.5 5.5,34.75 5.5,13.25"/><g class="sbGear"><circle cx="29" cy="19" r="7.2" class="sbTeeth"/><circle cx="29" cy="19" r="3.2" class="sbHub"/></g><path class="sbWrench" transform="translate(9.5 14) scale(1.02)" d="M7 10h3v-3l-3.5 -3.5a6 6 0 0 1 8 8l6 6a2 2 0 0 1 -3 3l-6 -6a6 6 0 0 1 -8 -8l3.5 3.5"/><path class="sbSpark" d="M37 33l1.2 2.8 2.8 1.2-2.8 1.2-1.2 2.8-1.2-2.8-2.8-1.2 2.8-1.2z"/></svg></span><span class="sbTabTxt"></span></button>' + '<div class="sbHint" role="status" hidden></div>';
    var navIn = document.querySelector("header .navin"), logo = navIn && navIn.firstElementChild;
    if (logo) logo.insertAdjacentElement("afterend", wrap); else { wrap.classList.add("sbFloat"); document.body.appendChild(wrap); }
    panel = root.querySelector(".sbPanel"); tab = wrap.querySelector(".sbTab");
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
    // Any element with data-open-tools opens the sidebar (falls back to its link without JS)
    document.addEventListener("click", function (e) { var t = e.target.closest("[data-open-tools]"); if (t) { e.preventDefault(); setOpen(true); } });
    window.LAOYU_SIDEBAR = { open: function () { setOpen(true); }, close: function () { setOpen(false); } };
    var hintEl = wrap.querySelector(".sbHint");
    var hideHint = function () { hintEl.classList.remove("show"); setTimeout(function () { hintEl.hidden = true; }, 300); };
    try {
      if (!sessionStorage.getItem("sbHint")) {
        sessionStorage.setItem("sbHint", "1");
        setTimeout(function () { if (root.classList.contains("open")) return; hintEl.hidden = false; requestAnimationFrame(function () { hintEl.classList.add("show"); }); setTimeout(hideHint, 6500); }, 1500);
      }
    } catch (e) {}
    hintEl.addEventListener("click", function () { hideHint(); setOpen(true); });
    tab.addEventListener("click", function () { if (!hintEl.hidden) hideHint(); });
    (window.LAOYU_OWNER || Promise.resolve(function () { try { return localStorage.getItem("laoyuOwner") === "f81cab01a5d016ce176b362075e0f61fbce75fda490f927f1fb296a4f34e6881"; } catch (e) { return false; } }()))
      .then(function (o) { owner = !!o; render(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
})();
