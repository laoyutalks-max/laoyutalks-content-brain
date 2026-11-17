/* =========================================================
   LAOYUTALKS 3.0 — shared page layout behaviour
   Copyright year · phone menu · current-page link ·
   light/dark switch · language switch start-up ·
   "ask" links that open the site helper chat.
   Loaded after i18n.js on pages that use v3.css.
   ========================================================= */
(function () {
  "use strict";
  var root = document.documentElement;
  function zh() { return root.getAttribute("data-lang") === "zh"; }
  function biPick(en, cn) { var I = window.LAOYU_I18N; return I && I.pick ? I.pick(en, cn) : (zh() ? cn : en); } /* EN+中: both, see i18n.js */
  function L(en, cn) { return biPick(en, cn); }

  var SUN = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.900 4.900l1.400 1.400M17.700 17.700l1.400 1.400M2 12h2M20 12h2M4.900 19.100l1.400-1.400M17.700 6.300l1.400-1.400"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.500A8 8 0 0 1 9.500 4a8 8 0 1 0 10.500 10.500z"/></svg>';

  function isLight() { return root.getAttribute("data-theme") === "light"; }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-year]").forEach(function (e) { e.textContent = new Date().getFullYear(); });

    var nav = document.querySelector(".nav"), navIn = document.querySelector(".navin"), links = document.querySelector(".links");

    /* current page */
    var page = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".links a").forEach(function (a) {
      var href = a.getAttribute("href") || "";
      if (href.indexOf("#") === -1 && href === page) a.setAttribute("aria-current", "page");
    });

    if (nav && navIn && links) {
      /* light / dark switch (same saved choice as the rest of the site) */
      var theme = document.createElement("button");
      theme.type = "button"; theme.className = "themeToggle";
      var paintTheme = function () {
        theme.innerHTML = isLight() ? MOON : SUN;
        theme.setAttribute("aria-label", isLight() ? L("Switch to dark mode", "切换到深色模式") : L("Switch to light mode", "切换到浅色模式"));
      };
      theme.addEventListener("click", function () {
        var toLight = !isLight();
        if (toLight) root.setAttribute("data-theme", "light"); else root.removeAttribute("data-theme");
        try { localStorage.setItem("laoyuTheme", toLight ? "light" : "dark"); } catch (e) {}
        paintTheme();
      });
      navIn.appendChild(theme);

      /* phone menu */
      var menu = document.createElement("button");
      menu.type = "button"; menu.className = "mobileMenu";
      menu.setAttribute("aria-expanded", "false");
      menu.innerHTML = "<span></span><span></span><span></span>";
      var paintMenu = function () {
        var open = nav.classList.contains("menuOpen");
        menu.setAttribute("aria-expanded", open ? "true" : "false");
        menu.setAttribute("aria-label", open ? L("Close navigation menu", "关闭导航菜单") : L("Open navigation menu", "打开导航菜单"));
      };
      var setMenu = function (open) { nav.classList.toggle("menuOpen", open); paintMenu(); };
      menu.addEventListener("click", function () { setMenu(!nav.classList.contains("menuOpen")); });
      links.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("menuOpen")) { setMenu(false); menu.focus(); } });
      navIn.appendChild(menu);

      document.addEventListener("laoyu:lang", function () { paintTheme(); paintMenu(); });
      paintTheme(); paintMenu();
    }

    /* links that open the site helper chat */
    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-open-ask]");
      if (t && window.LAOYU_CHAT) { e.preventDefault(); window.LAOYU_CHAT.open(); }
    });

    if (window.LAOYU_I18N) window.LAOYU_I18N.init();
  });
})();
